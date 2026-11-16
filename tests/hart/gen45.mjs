globalThis.window = { katex: { renderToString: (s) => s } };
// Harte Prüfung für das Paket gen45 (gen4.js und gen5.js): Je Aufgaben-Art und Stufe werden 200 Aufgaben erzeugt und
// UNABHÄNGIG nachgerechnet. Grundlage ist, wo immer möglich, die Aufgabe so, wie der Lernende sie sieht: Die gezeigte
// Formel wird hier gelesen (eigener kleiner TeX-Rechner) und dann numerisch abgeleitet, integriert, eingesetzt,
// als Gleichung gelöst oder als Änderungsgleichung schrittweise durchgerechnet – nicht mit den Formeln der Erzeuger.
const { seedRandom } = await import('../../app/js/math.js');
const G4 = await import('../../app/js/gen4.js'), G5 = await import('../../app/js/gen5.js');
seedRandom(4545);

let anzahl = 0, schlecht = 0; const fehler = new Map();
const ok = (c, msg) => { anzahl++; if (!c) { schlecht++; fehler.set(msg, (fehler.get(msg) || 0) + 1); } };

/* ───── kleiner TeX-Rechner: übersetzt eine Formel einmal in eine Rechen-Funktion ───── */
const C = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return Math.round(r); };
function kompil(src) {
  const s = String(src).replace(/\{,\}/g, '.').replace(/\\[,;! ]/g, '').replace(/\\(left|right|bigl|bigr|Bigl|Bigr)(?![a-zA-Z])/g, '').replace(/\\cdot(?![a-zA-Z])/g, '*').replace(/\s+/g, '');
  let i = 0;
  const fehl = (m) => { throw new Error(`TeX-Rechner: ${m} an Stelle ${i} in „${s}“`); };
  const faengtAn = () => i < s.length && /[0-9a-zA-Z({\\]/.test(s[i]);
  const gruppe = () => { if (s[i] !== '{') fehl('{ erwartet'); i++; const v = summe(); if (s[i] !== '}') fehl('} erwartet'); i++; return v; };
  const hoch = () => { if (s[i] === '{') return gruppe(); const c = s[i++]; if (/\d/.test(c)) return () => +c; return (v) => v[c]; };
  function basis() {
    const c = s[i];
    if (/\d/.test(c)) { const m = /^\d+(\.\d+)?/.exec(s.slice(i)); i += m[0].length; const z = +m[0]; return () => z; }
    if (c === '(') { i++; const v = summe(); if (s[i] !== ')') fehl(') erwartet'); i++; return v; }
    if (c === '{') return gruppe();
    if (c === '\\') {
      const b = /^\\[a-zA-Z]+/.exec(s.slice(i))?.[0] || fehl('Befehl'); i += b.length;
      if (b === '\\dfrac' || b === '\\tfrac' || b === '\\frac') { const z = gruppe(), n = gruppe(); return (v) => z(v) / n(v); }
      if (b === '\\sqrt') { const a = gruppe(); return (v) => Math.sqrt(a(v)); }
      if (b === '\\binom') { const a = gruppe(), k = gruppe(); return (v) => C(a(v), k(v)); }
      if (b === '\\pi') return () => Math.PI;
      if (b === '\\infty') return () => Infinity;
      if (b === '\\sin' || b === '\\cos' || b === '\\ln') { let p = null; if (s[i] === '^') { i++; p = hoch(); } const a = basis(), f = { '\\sin': Math.sin, '\\cos': Math.cos, '\\ln': Math.log }[b]; return p ? (v) => f(a(v)) ** p(v) : (v) => f(a(v)); }
      fehl(`unbekannter Befehl ${b}`);
    }
    if (/[a-zA-Z]/.test(c)) { i++; let name = c; if (c === 'x' && s[i] === '_') { name = `x_${s[i + 1]}`; i += 2; }
      return (v) => (name in v ? v[name] : name === 'e' ? Math.E : (() => { throw new Error(`TeX-Rechner: Variable ${name} fehlt in „${s}“`); })()); }
    return fehl('Zahl, Klammer oder Befehl erwartet');
  }
  const faktor = () => { const b = basis(); if (s[i] === '^') { i++; const p = hoch(); return (v) => b(v) ** p(v); } return b; };
  function produkt() { let l = faktor(); for (;;) { if (s[i] === '*') { i++; const a = l, r = faktor(); l = (v) => a(v) * r(v); } else if (s[i] === ':') { i++; const a = l, r = faktor(); l = (v) => a(v) / r(v); } else if (faengtAn()) { const a = l, r = faktor(); l = (v) => a(v) * r(v); } else return l; } }
  function summe() { let l; if (s[i] === '-') { i++; const t = produkt(); l = (v) => -t(v); } else { if (s[i] === '+') i++; l = produkt(); }
    while (s[i] === '+' || s[i] === '-') { const minus = s[i++] === '-', a = l, t = produkt(); l = minus ? (v) => a(v) - t(v) : (v) => a(v) + t(v); } return l; }
  const f = summe(); if (i !== s.length) fehl('unerwarteter Rest'); return f;
}
const wert = (tex, v = {}) => kompil(tex)(v);
const fnAus = (tex, name = 'x', mehr = {}) => { const f = kompil(tex); return (x) => f({ ...mehr, [name]: x }); };
const zahl = (t) => +String(t).replace(/\{,\}/g, '.').replace(',', '.');
const vektoren = (t) => [...String(t).matchAll(/\\begin\{pmatrix\}(.*?)\\end\{pmatrix\}/g)].map((m) => m[1].split('\\\\').map(zahl));
const punkt = (t, name = 'P') => { const m = new RegExp(`${name}\\(([^)]*)\\)`).exec(t); return m ? m[1].split('\\mid').map((x) => x.trim()) : null; };
/** Liest „\int_{a}^{b} … dx“: Grenzen und Integrand. */
function integral(formel) {
  let i = formel.indexOf('\\int_') + 5; const gr = () => { let t = 0, j = i; do { if (formel[j] === '{') t++; else if (formel[j] === '}') t--; j++; } while (t > 0); const g = formel.slice(i + 1, j - 1); i = j; return g; };
  const unten = gr(); i++; const oben = gr(), rest = formel.slice(i).replace(/(\\,)?dx$/, '');
  return { a: wert(unten), b: wert(oben), f: fnAus(rest) };
}

/* ───── Rechen-Helfer ───── */
const R = (q) => q.options.find((o) => o.correct), W = (q) => q.options.filter((o) => !o.correct);
const nah = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol * (1 + Math.abs(a) + Math.abs(b));
const simpson = (f, a, b, m = 2000) => { const h = (b - a) / m; let s = f(a) + f(b); for (let i = 1; i < m; i++) s += f(a + i * h) * (i % 2 ? 4 : 2); return (s * h) / 3; };
const abl = (f, x, h = 1e-5) => (f(x + h) - f(x - h)) / (2 * h);
const nullst = (g, lo, hi) => { let a = lo, b = hi, ga = g(a); for (let i = 0; i < 200; i++) { const m = (a + b) / 2, gm = g(m); if ((gm > 0) === (ga > 0)) { a = m; ga = gm; } else b = m; } return (a + b) / 2; };
const maxStelle = (g, lo, hi, raster = 4000) => { let best = lo, gb = -Infinity; const w = (hi - lo) / raster; for (let j = 0; j <= raster; j++) { const x = lo + j * w, y = g(x); if (y > gb) { gb = y; best = x; } }   // erst grob absuchen, dann verfeinern
  let a = Math.max(lo, best - w), b = Math.min(hi, best + w); const p = (Math.sqrt(5) - 1) / 2; for (let i = 0; i < 200; i++) { const c = b - p * (b - a), d = a + p * (b - a); if (g(c) > g(d)) b = d; else a = c; } return (a + b) / 2; };
const dot = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2], kreuz = (u, v) => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
const plusV = (A, r, u, s = 0, v = [0, 0, 0]) => A.map((c, i) => c + r * u[i] + s * v[i]), E3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
/** Ebene aus einer gezeigten Gleichung „links = rechts“: Normalenvektor und rechte Seite durch Einsetzen. */
function ebene(gl) { const [l, r] = gl.split('='), L = kompil(l), Rr = kompil(r), g = (p) => L({ x_1: p[0], x_2: p[1], x_3: p[2] }) - Rr({ x_1: p[0], x_2: p[1], x_3: p[2] }), g0 = g([0, 0, 0]);
  return { n: E3.map((e) => g(e) - g0), d: -g0, g }; }
/** Lineares 3×3-System (Gauß mit Spaltentausch). */
function loese3(M, b) { const A = M.map((z, i) => [...z, b[i]]);
  for (let c = 0; c < 3; c++) { let p = c; for (let r = c + 1; r < 3; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r; [A[c], A[p]] = [A[p], A[c]]; if (Math.abs(A[c][c]) < 1e-12) return null;
    for (let r = 0; r < 3; r++) if (r !== c) { const f = A[r][c] / A[c][c]; for (let k = c; k < 4; k++) A[r][k] -= f * A[c][k]; } }
  return A.map((z, i) => z[3] / z[i]); }
/** Wachstums-Modell allein aus Funktionswerten. */
const modell = (f) => { const w = [0, 1, 2, 3, 4, 5].map(f), d = w.slice(1).map((v, i) => v - w[i]);
  if (d.every((x) => nah(x, d[0], 1e-4))) return 'linear';
  if (w.slice(1).every((v, i) => nah(v / w[i], w[1] / w[0], 1e-4))) return 'exp';
  const L = f(400); return w.slice(1).every((v, i) => nah((L - v) / (L - w[i]), (L - w[1]) / (L - w[0]), 1e-4)) ? 'begr' : 'log'; };

/** Grundprüfungen für jede Aufgabe. */
function grund(name, q, lv) {
  const t = `${name} (Stufe ${lv})`;
  ok(q.options.length === 4 && q.options.filter((o) => o.correct).length === 1, `${t}: vier Antworten, genau eine richtig`);
  ok(new Set(q.options.map((o) => o.tex)).size === q.options.length && new Set(q.options.map((o) => o.html ?? o.tex)).size === q.options.length, `${t}: Antworten verschieden`);
  ok(W(q).every((o) => typeof o.why === 'string' && o.why.length > 12), `${t}: jeder Ablenker hat eine Diagnose`);
  ok(Array.isArray(q.hints) && q.hints.length >= 2 && q.hints.every((h) => typeof h === 'string' && h.length > 8) && typeof q.explain === 'string' && q.explain.length > 8 && q.prompt.length > 8, `${t}: Tipps, Erklärung, Frage`);
  const alles = JSON.stringify([q.prompt, q.formula, q.explain, q.hints, q.options.map((o) => [o.tex, o.html, o.why])]);
  ok(!/undefined|NaN|Infinity|\[object/.test(alles), `${t}: kein „undefined“/„NaN“ im Text`);
  ok(!/\d\.\d/.test(alles), `${t}: Komma statt Punkt`);
  ok(q.hints.length >= (lv >= 4 ? 3 : 2), `${t}: schwere Aufgaben haben mindestens drei Rechenschritte`);
}
/** Zahl-Antwort: Anzeige passt zum gespeicherten Wert (bis auf die gezeigte Rundung). */
const anzeige = (o, faktor = 1) => { const t = o.tex.replace(/^.*\\approx/, '').replace(/^[a-z]=/, '').replace('\\,\\%', ''), st = (t.split('{,}')[1] || '').replace(/\D.*$/, '').length;
  return /^-?\d+(\{,\}\d+)?$/.test(t) ? Math.abs(zahl(t) - o.num * faktor) <= 0.5 * 10 ** -st + 1e-9 : nah(wert(t), o.num * faktor, 1e-9); };

const PRUEF = {
  genPolstelle(q, lv, t) {
    const f = fnAus(q.formula.replace(/^f\(x\)=/, '')), pol = (x) => Math.abs(f(x + 1e-7)) > 1e5 && Math.abs(f(x - 1e-7)) > 1e5;
    ok(pol(R(q).num) && W(q).every((o) => !pol(o.num)), `${t}: nur die richtige Stelle ist eine Polstelle der gezeigten Funktion`);
    ok([0.37, 1.21, -2.63].every((x) => nah(f(x), q.Z(x) / q.N(x))), `${t}: gezeigte Formel passt zu Z und N`);
    ok(q.options.every((o) => anzeige(o)), `${t}: Anzeige passt zum Wert`);
  },
  genAsymptote(q, lv, t) {
    let f;
    if (lv >= 5) { const g = kompil(q.formula.replace(/^f_a\(x\)=/, '')), [x0, y0] = q.punkt, g0 = g({ a: 0, x: x0 }), g1 = g({ a: 1, x: x0 }), a = (y0 - g0) / (g1 - g0);
      ok(nah(a, q.parameter) && q.prompt.includes(`P(${x0}\\mid ${y0})`), `${t}: Parameter aus der Punktprobe`); f = (x) => g({ a, x }); }
    else f = fnAus(q.formula.replace(/^f\(x\)=/, ''));
    const X = 1e6, gerade = (o) => fnAus(o.tex.replace(/^y=/, '')), passt = (o) => { const g = gerade(o); return Math.abs(f(X) - g(X)) < 1e-3 && Math.abs(f(-X) - g(-X)) < 1e-3; };
    ok(passt(R(q)) && W(q).every((o) => !passt(o)), `${t}: nur die richtige Gerade ist Asymptote der gezeigten Funktion`);
    ok(q.options.every((o) => [-2.5, 3.5].every((x) => nah(gerade(o)(x), o.val(x)))) && [0.4, 7.3].every((x) => nah(f(x), q.f(x))), `${t}: Anzeige passt zu den Rechen-Feldern`);
  },
  ableitung(xs) { return (q, lv, t) => {
    const f = fnAus(q.formula.replace(/^f\(x\)=/, '')), g = (o) => fnAus(o.tex.replace(/^f'\(x\)=/, '')), stimmt = (o) => { const h = g(o); return xs.every((x) => nah(h(x), abl(f, x), 1e-5)); };
    ok(stimmt(R(q)) && W(q).every((o) => !stimmt(o)), `${t}: nur die richtige Antwort ist die Ableitung der gezeigten Funktion (numerisch)`);
    ok(q.options.every((o) => xs.every((x) => nah(g(o)(x), o.val(x)))) && xs.every((x) => nah(f(x), q.f(x))), `${t}: Anzeige passt zu den Rechen-Feldern`);
  }; },
  genTrigInt(q, lv, t) {
    const { a, b, f } = integral(q.formula), I = simpson(f, a, b);
    ok(nah(R(q).num, I, 1e-8) && W(q).every((o) => Math.abs(o.num - I) > 0.05), `${t}: Integral numerisch nachgerechnet`);
    ok(q.options.every((o) => anzeige(o)) && nah(a, q.a) && nah(b, q.b), `${t}: Anzeige passt zum Wert`);
  },
  genRotation(q, lv, t) {
    const f = fnAus(q.formula.replace(/^f\(x\)=/, '')), { a, b } = q, V = Math.PI * simpson((x) => f(x) ** 2, a, b, 20000);
    ok(q.prompt.includes(`[${a};\\,${b}]`) || (q.prompt.includes(`x=${a}`) && q.prompt.includes(`x=${b}`)), `${t}: Grenzen stehen in der Aufgabe`);
    ok(nah(R(q).num, V, 1e-5) && W(q).every((o) => Math.abs(o.num - V) > 0.015 * V), `${t}: Volumen numerisch nachgerechnet`);
    ok(q.options.every((o) => anzeige(o)), `${t}: Anzeige passt zum Wert`);
  },
  genUneigentlich(q, lv, t) {
    const { a, b, f } = integral(q.formula), M = 20000; let I = 0;
    for (let j = 0; j < M; j++) { const u = (j + 0.5) / M, y = f(a + u / (1 - u)) / (1 - u) ** 2; if (Number.isFinite(y)) I += y / M; }   // x = a + u/(1−u)
    ok(b === Infinity && nah(a, q.a), `${t}: Grenzen`);
    ok(nah(R(q).num, I, 1e-5) && W(q).every((o) => Math.abs(o.num - I) > 0.02), `${t}: Wert numerisch nachgerechnet (${q.formula})`);
    ok(q.options.every((o) => (o.tex === '\\infty' ? o.num > 1e8 && !o.correct : nah(wert(o.tex), o.num, 1e-9))), `${t}: Anzeige passt zum Wert`);
  },
  genUnabhaengig(q, lv, t) {
    const d = q.daten; let pA, pB, pAB;
    if (lv <= 1) ({ pA, pB, pAB } = d);
    else if (lv === 2) { pA = d.A / d.n; pB = d.B / d.n; pAB = d.AB / d.n; }
    else if (lv === 3) { pA = d.pA; pB = d.pB; pAB = d.pA + d.pB - d.pU; }
    else if (lv === 4) { const ab = d.n - d.nurA - d.nurB - d.kein; pA = (ab + d.nurA) / d.n; pB = (ab + d.nurB) / d.n; pAB = ab / d.n; }
    else { pA = d.pA; pAB = d.pA * d.pBA; pB = pAB + (1 - d.pA - d.pKein); }
    const unab = Math.abs(pAB / pA - (pB - pAB) / (1 - pA)) < 1e-9;        // P(B|A) = P(B|nicht A)
    ok(R(q).key === (unab ? 'u' : 'a'), `${t}: Entscheidung über die bedingten Wahrscheinlichkeiten nachgerechnet`);
    ok(nah(pA, q.A / q.n) && nah(pB, q.B / q.n) && nah(pAB, q.AB / q.n) && pAB > 0 && pAB < Math.min(pA, pB) && pA + pB - pAB < 1, `${t}: Angaben passen zu den Rechen-Feldern`);
    const zahlen = Object.values(d).map((v) => (lv >= 5 ? String(+(100 * v).toFixed(4)).replace('.', ',') : String(+(+v).toFixed(4)).replace('.', '{,}')));
    ok(zahlen.every((z) => `${q.prompt} ${q.formula || ''}`.includes(z)), `${t}: alle Angaben stehen in der Aufgabe`);
  },
  genVarianz(q, lv, t) {
    const [z1, z2] = q.formula.replace(/^.*?\}\}/, '').replace('\\end{array}', '').split('\\\\\\hline '), xs = z1.split('&').slice(1).map(zahl), roh = z2.split('&').slice(1);
    const bekannt = roh.filter((x) => x !== 'p').map(zahl), P = roh.map((x) => (x === 'p' ? 1 - bekannt.reduce((s, p) => s + p, 0) : zahl(x)));
    const mu = xs.reduce((s, x, j) => s + x * P[j], 0), va = xs.reduce((s, x, j) => s + (x - mu) ** 2 * P[j], 0);
    const w = /Standardabweichung/.test(q.prompt) ? Math.sqrt(va) : /Varianz/.test(q.prompt) ? va : mu;
    ok(nah(P.reduce((s, p) => s + p, 0), 1) && P.every((p) => p > 0) && xs.every((x, j) => x === q.xs[j] && nah(P[j], q.P[j])), `${t}: Tabelle ist eine Verteilung und passt zu den Feldern`);
    ok(nah(R(q).num, w, 1e-9) && W(q).every((o) => Math.abs(o.num - w) > 0.055) && q.options.every((o) => anzeige(o)), `${t}: Kennwert nach der Definition nachgerechnet`);
  },
  genHyper(q, lv, t) {
    const z = (q.prompt.replace(/<[^>]+>/g, '').replace('jünger als 18', '').match(/\d+/g) || []).map(Number);
    const [N, K, n, k] = lv >= 5 ? [z[0], (z[0] * z[1]) / 100, z[2], z[2] - z[3]] : z;
    ok(N === q.N && K === q.K && n === q.n && k === q.k, `${t}: Zahlen der Aufgabe passen zu den Feldern`);
    let p = [1];                                              // Zug für Zug: p[j] = Wahrscheinlichkeit für j Treffer bisher
    for (let zug = 0; zug < n; zug++) { const neu = Array(p.length + 1).fill(0); p.forEach((w, j) => { const rest = N - zug, tr = K - j; neu[j + 1] += (w * tr) / rest; neu[j] += (w * (rest - tr)) / rest; }); p = neu; }
    const w = p[k], val = (o) => (o.tex.endsWith('\\%') ? zahl(o.tex.replace('\\,\\%', '')) / 100 : wert(o.tex));
    ok(nah(R(q).num, w, 1e-10) && w > 0 && w < 1 && W(q).every((o) => Math.abs(o.num - w) > (lv <= 2 ? 1e-6 : 0.0015)), `${t}: Wahrscheinlichkeit Zug für Zug nachgerechnet`);
    ok(q.options.every((o) => Math.abs(val(o) - o.num) <= (o.tex.endsWith('\\%') ? 5.1e-5 : 1e-9)), `${t}: Anzeige passt zum Wert`);
  },
  genKugel(q, lv, t) {
    const [l, r] = q.formula.replace(/^K\\colon\\ /, '').split('='), Lf = kompil(l), L = (p) => Lf({ x_1: p[0], x_2: p[1], x_3: p[2] }), rhs = zahl(r);
    const M = E3.map((e) => -(L(e) - L(e.map((c) => -c))) / 4), r2 = rhs - L(M), rad = Math.sqrt(r2), P = (punkt(q.prompt) || []).map(zahl);
    ok(r2 > 0 && nah(L(plusV(M, rad, [0, 0, 1])), rhs) && nah(L(plusV(M, rad, [0.6, 0.8, 0])), rhs), `${t}: gezeigte Gleichung ist eine Kugel`);
    if (/^Wo liegt/.test(q.prompt)) { const v = L(P); ok(R(q).key === (nah(v, rhs, 1e-9) ? 'auf' : v < rhs ? 'innen' : 'aussen') && q.kind === 'lage', `${t}: Lage durch Einsetzen`); }
    else if (/^Lies/.test(q.prompt)) ok(R(q).M.every((c, j) => nah(c, M[j])) && nah(R(q).r, rad) && W(q).every((o) => !(o.M.every((c, j) => nah(c, M[j])) && nah(o.r, rad))) && R(q).tex.includes(`r=${R(q).r}`) && q.kind === 'mr', `${t}: Mittelpunkt und Radius`);
    else { const MP = P.map((c, j) => c - M[j]), dist = Math.hypot(...MP), w = dist - rad, naechster = plusV(M, rad / dist, MP);
      ok(w > 0 && nah(L(naechster), rhs) && nah(Math.hypot(...naechster.map((c, j) => c - P[j])), w), `${t}: nächster Kugelpunkt`);
      ok(nah(R(q).num, w, 1e-9) && W(q).every((o) => Math.abs(o.num - w) > 0.1) && q.options.every((o) => anzeige(o)) && q.kind === 'abstand', `${t}: Abstand zur Oberfläche`); }
    ok(q.M.every((c, j) => nah(c, M[j])) && nah(q.r, rad), `${t}: Felder M und r passen zur Gleichung`);
  },
  genAbstandPG(q, lv, t) {
    const [A, u] = vektoren(q.formula), P = punkt(q.prompt).map(zahl), ab = (s) => Math.hypot(...plusV(A, s, u).map((c, j) => c - P[j]));
    const s0 = maxStelle((s) => -ab(s), -1000, 1000), d = ab(s0);
    ok(nah(R(q).num, d, 1e-7) && W(q).every((o) => Math.abs(o.num - d) > 0.1) && q.options.every((o) => anzeige(o)), `${t}: kleinster Abstand durch Absuchen der Geraden`);
    ok(A.every((c, j) => c === q.A[j]) && u.every((c, j) => c === q.u[j]) && P.every((c, j) => c === q.P[j]) && d > 0.5, `${t}: Felder passen zur Aufgabe`);
  },
  genEbenenLage(q, lv, t) {
    let lage, n1, d1;
    if (lv >= 5) { const e1 = ebene(/E_1\\colon\\ (.*?)\\\\\[6pt\]/.exec(q.formula)[1]), [Q, v, w] = vektoren(q.formula), drin = [Q, plusV(Q, 1, v), plusV(Q, 1, w)].map((p) => Math.abs(e1.g(p)) < 1e-9);
      lage = drin.every(Boolean) ? 'identisch' : Math.abs(dot(e1.n, v)) < 1e-9 && Math.abs(dot(e1.n, w)) < 1e-9 ? 'parallel' : 'schnitt'; ({ n: n1, d: d1 } = e1);
      ok(kreuz(v, w).some((c) => c !== 0) && nah(dot(q.n2, v), 0) && nah(dot(q.n2, w), 0) && nah(dot(q.n2, Q), q.d2), `${t}: Feld n2 ist Normalenvektor der Parameterform`); }
    else { const [e1, e2] = q.formula.split('\\qquad ').map((x) => ebene(x.replace(/^E_\d\\colon\\ /, ''))), par = kreuz(e1.n, e2.n).every((c) => Math.abs(c) < 1e-9), j = e1.n.findIndex((c) => c !== 0), p = E3[j].map((c) => (c * e1.d) / e1.n[j]);
      lage = !par ? 'schnitt' : Math.abs(e2.g(p)) < 1e-9 ? 'identisch' : 'parallel'; ({ n: n1, d: d1 } = e1);
      ok(e2.n.every((c, k) => nah(c, q.n2[k])) && nah(e2.d, q.d2), `${t}: Felder n2, d2 passen zur gezeigten Gleichung`); }
    ok(R(q).key === lage, `${t}: Lage durch Einsetzen von Punkten (${q.formula})`);
    ok(n1.every((c, k) => nah(c, q.n1[k])) && nah(d1, q.d1), `${t}: Felder n1, d1 passen zur gezeigten Gleichung`);
  },
  genBegrenzt(q, lv, t) {
    const grenze = /lange Sicht|Welcher Grenze/.test(q.prompt); let w;
    if (lv <= 3) { const f = fnAus(q.formula.replace(/^f\(t\)=/, ''), 't'); w = grenze ? f(1e4) : f(0); }
    else if (lv === 4) { const g = fnAus(q.formula.replace(/^f'\(t\)=/, '').replace(/f\(t\)/g, 'y'), 'y');
      if (grenze) { let y = zahl(/f\(0\)=([\d{},]+)/.exec(q.prompt)[1]); const h = 0.05; for (let s = 0; s < 12000; s++) { const k1 = g(y), k2 = g(y + (h / 2) * k1), k3 = g(y + (h / 2) * k2), k4 = g(y + h * k3); y += (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4); } w = y; }   // Änderungsgleichung schrittweise lösen
      else { const r0 = zahl(/f'\(0\)=([\d{},]+)/.exec(q.prompt)[1]); w = nullst((y) => g(y) - r0, -1e4, 1e4); } }
    else { const [ansatz, mess] = q.formula.split('\\qquad '), [, t1, y1] = /f\((\d+)\)=(\d+)/.exec(mess), g = kompil(ansatz.replace(/^f\(t\)=/, '')), name = grenze ? 'S' : 'a';
      const g0 = g({ [name]: 0, t: +t1 }), g1 = g({ [name]: 1, t: +t1 }), u = (+y1 - g0) / (g1 - g0); w = grenze ? u : g({ a: u, t: 0 });   // Ansatz ist linear in der Unbekannten
      ok(nah(q.f(+t1), +y1) && (grenze ? nah(g({ S: u, t: 0 }), q.f0) : true), `${t}: Messwert wird von der Funktion getroffen`); }
    ok(nah(R(q).num, w, 1e-6) && W(q).every((o) => Math.abs(o.num - w) > 0.1) && q.options.every((o) => o.num >= 0 && anzeige(o)), `${t}: ${grenze ? 'Grenze' : 'Anfangswert'} unabhängig bestimmt (${q.formula})`);
    ok(nah(grenze ? q.f(5000) : q.f(0), w, 1e-6) && (q.ask === 'grenze') === grenze, `${t}: Feld f passt`);
  },
  genBegrenztRate(q, lv, t) {
    const F = q.formula; let w, tol = 0.1;
    if (F.startsWith('k=')) { const [, k, S] = /k=([\d{},]+),\\quad S=(\d+)/.exec(F), B = +/Bestand (\d+) beträgt/.exec(q.prompt)[1]; w = abl((x) => +S - (+S - B) * Math.exp(-zahl(k) * x), 0); ok(q.ask === 'dgl', `${t}: Art`); }
    else if (F.startsWith('S=')) { const S = +F.slice(2), [, B, r] = /Bestand von (\d+) beträgt die Änderungsrate ([\d{},]+)/.exec(q.prompt), rate = (k) => abl((x) => S - (S - +B) * Math.exp(-k * x), 0);
      w = nullst((k) => rate(k) - zahl(r), 1e-6, 10); tol = 0.004; ok(q.ask === 'k' && nah(q.r, zahl(r)), `${t}: Art`); }
    else if (F.includes('\\qquad ')) { const [ansatz, mess] = F.split('\\qquad '), [, T, B] = /f\((\d+)\)=([\d{},]+)/.exec(mess), g = kompil(ansatz.replace(/^f\(t\)=/, ''));
      w = nullst((k) => g({ k, t: +T }) - zahl(B), 1e-6, 10); tol = 0.004; ok(q.ask === 'k' && nah(q.r / (q.S - q.B), w, 1e-6) && q.prompt.includes(String(g({ k: w, t: 0 }).toFixed(4) * 1).replace('.', ',')), `${t}: Art und Anfangswert`); }
    else { const f = fnAus(F.replace(/^f\(t\)=/, ''), 't');
      if (q.prompt.includes("f'(0)")) { w = abl(f, 0); ok(q.ask === 'f0' && nah(f(1e5), q.S), `${t}: Art`); }
      else { const S = f(1e6), B = (S * +/(\d+) %/.exec(q.prompt)[1]) / 100, t0 = nullst((x) => f(x) - B, 0, 1e4); w = abl(f, t0); ok(q.ask === 'dgl' && nah(B, q.B) && nah(S, q.S), `${t}: Art`); } }
    ok(nah(R(q).num, w, 1e-6) && W(q).every((o) => Math.abs(o.num - w) > tol) && q.options.every((o) => anzeige(o)), `${t}: Wert unabhängig bestimmt (${F})`);
  },
  genLogistisch(q, lv, t) {
    let w, tol = 0.1;
    if (lv >= 5) { const g = fnAus(q.formula.replace(/^f'\(t\)=/, '').replace(/f\(t\)/g, 'y'), 'y'), y0 = +/f\(0\)=(\d+)/.exec(q.prompt)[1], c2 = (g(2) - 2 * g(1) + g(0)) / 2, c1 = g(1) - g(0) - c2, h = (y) => c2 * y * y + c1 * y;   // rechte Seite ist ein Quadrat in y
      ok(nah(g(0), 0) && [7.5, 133, 290].every((y) => nah(g(y), h(y), 1e-9)), `${t}: Änderungsgleichung ist logistisch`);
      const yw = maxStelle(h, 0, -c1 / c2); let y = y0, zeit = 0; const dt = 0.001;
      for (let s = 0; s < 400000 && y < yw; s++) { const k1 = h(y), k2 = h(y + (dt / 2) * k1), k3 = h(y + (dt / 2) * k2), k4 = h(y + dt * k3), neu = y + (dt / 6) * (k1 + 2 * k2 + 2 * k3 + k4); if (neu >= yw) { zeit += (dt * (yw - y)) / (neu - y); y = neu; break; } y = neu; zeit += dt; }
      w = zeit; ok(nah(q.f(0), y0) && nah(q.f(1e5), -c1 / c2) && [1, 5, 9].every((x) => nah(abl(q.f, x), h(q.f(x)), 1e-5)), `${t}: Feld f löst die Änderungsgleichung`); }
    else { const f = fnAus(q.formula.replace(/^f\(t\)=/, ''), 't'), tw = maxStelle((x) => abl(f, x, 1e-4), 0, 100);
      w = /lange Sicht/.test(q.prompt) ? f(1e6) : /Anfangsbestand/.test(q.prompt) ? f(0) : /Bei welchem Bestand/.test(q.prompt) ? f(tw) : tw; if (/Zeitpunkt/.test(q.prompt)) tol = 0.1;
      ok([0, 2.5, 11].every((x) => nah(f(x), q.f(x))), `${t}: Feld f passt zur Formel`); }
    ok(nah(R(q).num, w, 1e-4) && W(q).every((o) => Math.abs(o.num - w) > tol), `${t}: Wert unabhängig bestimmt (${q.formula})`);
    ok(q.options.every((o) => (o.tex.includes('\\approx') ? nah(wert(o.tex.replace(/^t=/, '').replace(/\\approx.*$/, '')), o.num, 1e-9) && anzeige(o) : anzeige(o))), `${t}: Anzeige passt zum Wert`);
  },
  genWachstumArt(q, lv, t) {
    let key;
    if (lv === 2 || lv >= 5) key = modell(fnAus(q.formula.replace(/^f\(t\)=/, ''), 't'));
    else if (lv === 4) { const w = q.formula.replace('\\end{array}', '').split('f(t)&')[1].split('&').map(zahl), d = w.slice(1).map((v, j) => v - w[j]);
      key = d.every((x) => nah(x, d[0])) ? 'linear' : w.slice(1).every((v, j) => nah(v / w[j], w[1] / w[0])) ? 'exp' : d.every((x, j) => j === 0 || x < d[j - 1]) ? 'begr' : 'log';
      ok(w.every((v, j) => nah(v, q.f(j), 1e-3)), `${t}: Tabelle passt zu f`); }
    else if (lv === 3) { const g = fnAus(q.formula.replace(/^f'\(t\)=/, '').replace(/f\(t\)/g, 'y'), 'y');
      key = nah(g(1), g(7)) ? 'linear' : nah(g(0), 0) && nah(g(7) / 7, g(1)) ? 'exp' : nah(g(0), 0) ? 'log' : 'begr';
      ok([0.5, 2].every((x) => nah(abl(q.f, x), g(q.f(x)), 1e-5)), `${t}: Feld f erfüllt die Änderungsgleichung`); }
    else key = modell(q.f);
    ok(R(q).key === key && q.key === key && modell(q.f) === key, `${t}: Modell unabhängig erkannt (${q.formula || q.prompt})`);
  },
  genSpurpunkt(q, lv, t) {
    let S;
    if (/Gerade/.test(q.prompt)) { const [A, v] = vektoren(q.formula), s = nullst((x) => A[2] + x * v[2], -100, 100); S = plusV(A, s, v); S[2] = 0; ok(R(q).pt[2] === 0 && q.art === 'gerade', `${t}: dritte Koordinate 0`); }
    else { const ax = +/x_(\d)-Achse/.exec(q.prompt)[1] - 1;
      if (/Parameterform/.test(q.prompt)) { const [A, u, v] = vektoren(q.formula), l = loese3([0, 1, 2].map((z) => [u[z], v[z], -E3[ax][z]]), A.map((c) => -c)); S = E3[ax].map((c) => c * l[2]);
        ok(nah(dot(q.n, u), 0) && nah(dot(q.n, v), 0) && nah(dot(q.n, A), q.d), `${t}: Felder n, d gehören zur Parameterform`); }
      else { const e = ebene(q.formula.replace(/^E:\\ /, '')); S = E3[ax].map((c) => (c * e.d) / e.n[ax]); ok(e.n.every((c, j) => nah(c, q.n[j])) && nah(e.d, q.d), `${t}: Felder n, d passen zur Gleichung`); }
      ok(q.ax === ax && q.art === 'ebene', `${t}: Achse`); }
    const gleich = (o) => o.pt.every((c, j) => Math.abs(c - S[j]) < 1e-7);
    ok(gleich(R(q)) && W(q).every((o) => !gleich(o)), `${t}: Spurpunkt unabhängig bestimmt (${q.formula})`);
    ok(q.options.every((o) => { const k = punkt(o.tex, 'S'); return k.every((x, j) => Math.abs(wert(x) - o.pt[j]) <= 0.0051); }), `${t}: Anzeige passt zum Punkt`);
  },
  genNormalenform(q, lv, t) {
    let pkte;
    if (lv >= 5) { const [A, u, v] = vektoren(q.formula); pkte = [A, plusV(A, 1, u), plusV(A, 1, v), plusV(A, 2, u, -3, v)]; ok(A.every((c, j) => c === q.P[j]) && kreuz(u, v).some((c) => c !== 0), `${t}: Felder`); }
    else { const vs = vektoren(q.formula), n = vs.at(-1), P = lv >= 4 ? vs[0] : punkt(q.formula).map(zahl), w1 = kreuz(n, n[0] === 0 && n[1] === 0 ? [1, 0, 0] : [0, 0, 1]), w2 = kreuz(n, w1);
      pkte = [P, plusV(P, 1, w1), plusV(P, 1, w2)]; ok(P.every((c, j) => c === q.P[j]) && n.every((c, j) => c === q.n[j]), `${t}: Felder`); }
    const passt = (o) => { const e = ebene(o.tex.replace(/^E:\\ /, '')); return e.n.some((c) => c !== 0) && pkte.every((p) => Math.abs(e.g(p)) < 1e-9); };
    ok(passt(R(q)) && W(q).every((o) => !passt(o)), `${t}: nur die richtige Gleichung enthält alle Punkte der Ebene (${q.formula})`);
  },
  genParamPunkt(q, lv, t) {
    const [A, u, v] = vektoren(q.formula), rs = (s) => s.split(/,\\quad |,\\ /).map((x) => zahl(x.slice(2)));
    if (lv <= 3) { const r = zahl(/r=(-?[\d{},]+)/.exec(q.prompt)[1]), s = zahl(/s=(-?[\d{},]+)/.exec(q.prompt)[1]), soll = plusV(A, r, u, s, v), gl = (o) => o.pt.every((c, j) => c === soll[j]);
      ok(gl(R(q)) && W(q).every((o) => !gl(o)) && q.options.every((o) => punkt(o.tex).map(zahl).every((c, j) => c === o.pt[j])), `${t}: Punkt durch Einsetzen`); }
    else { const k = punkt(q.prompt), trifft = (o) => { const [r, s, c] = rs(o.tex), p = plusV(A, r, u, s, v), ziel = lv >= 5 ? [zahl(k[0]), zahl(k[1]), c] : k.map(zahl); return r === o.r && s === o.s && p.every((x, j) => x === ziel[j]); };
      ok(trifft(R(q)) && W(q).every((o) => !trifft(o)), `${t}: nur das richtige Parameter-Paar trifft den Punkt`);
      ok(W(q).every((o) => { const [r, s] = rs(o.tex), p = plusV(A, r, u, s, v); return p[0] !== zahl(k[0]) || p[1] !== zahl(k[1]) || (lv < 5 && p[2] !== zahl(k[2])); }) && (lv < 5 || k[2] === 'c'), `${t}: Ablenker treffen den Punkt nicht`); }
    ok(kreuz(u, v).some((c) => c !== 0) && A.every((c, j) => c === q.A[j]), `${t}: Richtungsvektoren spannen eine Ebene auf`);
  },
};
PRUEF.genQuotient = PRUEF.ableitung([0.6, 1.3, 2.2]); PRUEF.genTrigAbl = PRUEF.ableitung([-1.3, -0.4, 0.7, 1.9]); delete PRUEF.ableitung;

const ARTEN = [[G4, ['genPolstelle', 'genAsymptote', 'genQuotient', 'genTrigAbl', 'genTrigInt', 'genRotation', 'genUneigentlich', 'genUnabhaengig', 'genVarianz', 'genHyper', 'genKugel', 'genAbstandPG', 'genEbenenLage']],
  [G5, ['genBegrenzt', 'genBegrenztRate', 'genLogistisch', 'genWachstumArt', 'genSpurpunkt', 'genNormalenform', 'genParamPunkt']]];
for (const [modul, namen] of ARTEN) for (const name of namen) {
  ok(typeof modul[name] === 'function' && typeof modul[name].topic === 'string', `${name}: Erzeuger mit Thema`);
  for (const lv of [1, 2, 3, 4, 5]) { const formen = new Set();
    for (let i = 0; i < 200; i++) { const t = `${name} (Stufe ${lv})`; let q;
      try { q = modul[name](lv); grund(name, q, lv); PRUEF[name](q, lv, t); formen.add(`${q.formula} ¦ ${q.prompt}`); }
      catch (e) { ok(false, `${t}: Abbruch – ${String(e.message).slice(0, 160)}${q ? ` ¦ ${q.formula || q.prompt}` : ''}`); } }
    ok(formen.size >= (lv === 1 ? 8 : 12), `${name} (Stufe ${lv}): genug verschiedene Aufgaben (${formen.size})`); }
}

if (schlecht) { for (const [m, c] of [...fehler].slice(0, 60)) console.error(`FEHLER (${c}×): ${m}`); console.error(`hart/gen45: ${schlecht} von ${anzahl} Prüfungen fehlgeschlagen`); process.exit(1); }
console.log(`hart/gen45: ${anzahl} Prüfungen bestanden`);
