// Harte Prüfung für das Paket gen2a: Kurvendiskussion und Anwendungen aus app/js/gen2.js.
// Je Aufgaben-Art und Stufe werden 200 Aufgaben erzeugt und die richtige Antwort unabhängig nachgerechnet
// (numerisch ableiten, integrieren, durchprobieren, einsetzen) – nicht mit den Formeln des Erzeugers.
globalThis.window = { katex: { renderToString: (s) => s } };
const H = await import('../../app/js/gen2.js');
const { seedRandom } = await import('../../app/js/math.js');

let n = 0, fehler = 0; const gesehen = new Set();
const ok = (bed, msg) => { n++; if (!bed && !gesehen.has(msg)) { gesehen.add(msg); fehler++; if (fehler <= 60) console.error('FEHLER:', msg); } };
const nah = (a, b, tol = 1e-4) => Math.abs(a - b) <= tol * (1 + Math.abs(a) + Math.abs(b));
// Ableitungen über Richardson-Extrapolation (genauer als der einfache Differenzenquotient)
const d1 = (f, x, h = 1e-3) => (8 * (f(x + h) - f(x - h)) - (f(x + 2 * h) - f(x - 2 * h))) / (12 * h);
const d2 = (f, x, h = 2e-3) => (-f(x + 2 * h) + 16 * f(x + h) - 30 * f(x) + 16 * f(x - h) - f(x - 2 * h)) / (12 * h * h);
const integral = (f, a, b, m = 2000) => { const h = (b - a) / m; let s = f(a) + f(b); for (let i = 1; i < m; i++) s += f(a + i * h) * (i % 2 ? 4 : 2); return (s * h) / 3; };
const K0 = H.A2_K0, KS = [0.6, 1.3, 2.4];   // Werte für den Schar-Parameter

/** Grundregeln jeder Aufgabe: genau eine richtige Antwort, verschiedene Antworten, Diagnose je Ablenker, Lösungsweg, kein „undefined“. */
function grund(name, q, lv) {
  const tag = `${name} (Stufe ${lv})`, r = q.options.filter((o) => o.correct);
  ok(r.length === 1, `${tag}: genau eine richtige Antwort`);
  ok(q.options.length === (name === 'genSymmetrie' ? 3 : 4), `${tag}: Zahl der Antworten`);
  ok(new Set(q.options.map((o) => o.tex)).size === q.options.length, `${tag}: Antworten verschieden (${q.options.map((o) => o.tex).join(' | ')})`);
  for (const o of q.options) if (!o.correct) ok(typeof o.why === 'string' && o.why.length > 10, `${tag}: Ablenker mit Diagnose`);
  ok(Array.isArray(q.hints) && q.hints.length >= 2 && q.hints.every((h) => typeof h === 'string' && h.length > 5), `${tag}: Tipps vorhanden`);
  ok(lv < 4 || q.hints.length >= 3, `${tag}: schwere Aufgabe mit mindestens drei Schritten`);
  ok(typeof q.explain === 'string' && q.explain.length > 10 && typeof q.prompt === 'string' && q.prompt.length > 10, `${tag}: Frage und Erklärung`);
  const text = JSON.stringify([q.prompt, q.formula ?? '', q.explain, q.hints, q.options.map((o) => [o.tex, o.why ?? ''])]);
  ok(!/undefined|NaN|Infinity|\[object/.test(text), `${tag}: kein „undefined“/„NaN“ im Text (${(text.match(/.{0,40}(undefined|NaN|Infinity|\[object).{0,40}/) || [''])[0]})`);
  ok(!/\+-|-\+|--|\+\+|\+ *=|\(\)|\{\}/.test(text.replace(/\\[a-z]+\{\}/g, '').replace(/\{\}\+/g, '')), `${tag}: keine doppelten Vorzeichen oder leeren Klammern (${(text.match(/.{0,40}(\+-|-\+|--|\+\+|\+ *=|\(\)|\{\}).{0,40}/) || [''])[0]})`);
  return r[0];
}

const P = {
  genWendestelle(q, r, tag) {
    // f'' = 0 und Vorzeichenwechsel von f'' an der richtigen Stelle; an keiner anderen angebotenen Stelle
    const w = (x) => { const e = Math.max(0.05, Math.abs(x) * 0.02); return Math.abs(d2(q.f, x)) < 1e-4 && d2(q.f, x - e) * d2(q.f, x + e) < 0; };
    ok(w(r.x), `${tag}: Wendestelle mit Vorzeichenwechsel (${q.formula}, ${r.tex})`);
    for (const o of q.options) if (!o.correct) ok(Math.abs(d2(q.f, o.x)) > 0.3, `${tag}: Ablenker ist keine Wendestelle (${q.formula}, ${o.tex})`);
    const m = r.tex.match(/^x=(-?\d+(?:\{,\}\d+)?)$/); if (m) ok(nah(+m[1].replace('{,}', '.'), r.x), `${tag}: Anzeige passt zum Wert`);
    const e = r.tex.match(/^x=e(?:\^\{(-?\d+(?:\{,\}\d+)?)\})?$/); if (e) ok(nah(Math.exp(e[1] ? +e[1].replace('{,}', '.') : 1), r.x), `${tag}: Anzeige e^… passt zum Wert`);
    ok(m || e || r.tex === 'x=1', `${tag}: Anzeige lesbar (${r.tex})`);
  },
  genMonotonie(q, r, tag) {
    // Bereich aus der Antwort lesen und auf einem feinen Raster mit dem Vorzeichen von f' vergleichen
    const lies = (t) => t.split('\\ \\text{ oder }\\ ').map((s) => { let m; if ((m = s.match(/^(-?[\d.]+)<x<(-?[\d.]+)$/))) return [+m[1], +m[2]]; if ((m = s.match(/^x<(-?[\d.]+)$/))) return [-Infinity, +m[1]]; if ((m = s.match(/^x>(-?[\d.]+)$/))) return [+m[1], Infinity]; return null; });
    const passt = (o) => { const B = lies(o.tex); if (B.some((b) => !b)) return null; let gut = true;
      for (let x = -9.013; x < 9; x += 0.037) { const drin = B.some(([a, b]) => x > a && x < b), s = d1(q.f, x); if (Math.abs(s) < 1e-7) continue; if (drin !== (q.steigt ? s > 0 : s < 0)) gut = false; } return gut; };
    ok(passt(r) === true, `${tag}: Bereich stimmt genau (${q.formula}, ${r.tex})`);
    for (const o of q.options) if (!o.correct) ok(passt(o) === false, `${tag}: Ablenker-Bereich ist falsch (${q.formula}, ${o.tex})`);
    ok(new RegExp(q.steigt ? 'steigt' : 'fällt').test(q.prompt), `${tag}: Frage passt zu steigt/fällt`);
  },
  genSymmetrie(q, r, tag) {
    const X = [0.3, 0.9, 1.4, 2.1, 2.6], ev = X.every((x) => nah(q.f(-x), q.f(x), 1e-9)), od = X.every((x) => nah(q.f(-x), -q.f(x), 1e-9));
    ok(r.key === (ev ? 'even' : od ? 'odd' : 'none') && r.key === q.kind, `${tag}: Symmetrie stimmt (${q.formula})`);
    ok(X.every((x) => Number.isFinite(q.f(x)) && Number.isFinite(q.f(-x))), `${tag}: Funktion überall definiert`);
  },
  genGrenzwert(q, r, tag) {
    // Verhalten an immer größeren Stellen beobachten (die Funktion q.f ist in einer Form gegeben, die nicht überläuft)
    const v = [1e3, 1e5, 1e7].map(q.f);
    if (Number.isFinite(r.num)) ok(Math.abs(v[2] - r.num) < 1e-3 && Math.abs(v[2] - r.num) <= Math.abs(v[0] - r.num) + 1e-9, `${tag}: Grenzwert stimmt (${q.formula} → ${r.tex})`);
    else ok(Math.abs(v[2]) > 1e5 && Math.abs(v[2]) > Math.abs(v[1]) && Math.sign(v[2]) === Math.sign(r.num), `${tag}: wächst über alle Grenzen (${q.formula})`);
    for (const o of q.options) if (!o.correct) ok(Number.isFinite(o.num) ? !Number.isFinite(r.num) || Math.abs(o.num - r.num) > 0.02 : o.num !== r.num, `${tag}: Ablenker verschieden`);
    const m = r.tex.match(/^(-?)\\dfrac\{(\d+)\}\{(\d+)\}$/); if (m) ok(nah((m[1] ? -1 : 1) * +m[2] / +m[3], r.num), `${tag}: Bruch-Anzeige passt zum Wert`);
    if (/^-?\d+$/.test(r.tex)) ok(+r.tex === r.num, `${tag}: Zahl-Anzeige passt zum Wert`);
  },
  genTangente(q, r, tag) {
    const istT = (o) => nah(o.val(q.x0), q.f(q.x0), 1e-6) && nah(o.val(q.x0 + 1) - o.val(q.x0), d1(q.f, q.x0), 1e-6);
    ok(istT(r), `${tag}: Tangente berührt mit richtiger Steigung (${q.formula}, ${r.tex})`);
    ok(nah(r.val(3) - r.val(2), r.val(-1) - r.val(-2), 1e-9), `${tag}: Antwort ist eine Gerade`);
    for (const o of q.options) if (!o.correct) ok(!istT(o), `${tag}: Ablenker ist keine Tangente (${q.formula}, ${o.tex})`);
    // Anzeige der Geraden nachlesen (Zahlen, e, k): t(x) = M·x + B
    const wert = (s) => { let t = s.replace(/\{,\}/g, '.').replace(/\\,/g, '').replace(/\\dfrac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))').replace(/\^\{(\d+)\}/g, '**$1').replace(/(\d|\))(?=[ekx(])/g, '$1*').replace(/([ek])(?=[ekx(])/g, '$1*').replace(/([ek])(?=[ekx(])/g, '$1*').replace(/\)(?=[\dekx])/g, ')*').replace(/\(\)/g, '(1)').replace(/\(-\)/g, '(-1)'); return new Function('x', 'e', 'k', `return ${t};`); };
    try { const g = wert(r.tex.replace('t(x)=', '')); ok([0.3, -1.2, 2].every((x) => nah(g(x, Math.E, K0), r.val(x), 1e-6)), `${tag}: Anzeige passt zur Geraden (${r.tex})`); } catch (e) { ok(false, `${tag}: Anzeige nicht lesbar (${r.tex})`); }
  },
  genSteckbrief(q, r, tag) {
    const soll = { extrem: ['f', 'f1'], wende: ['f', 'f2'], tangente: ['f', 'f1'] }[q.kind];
    ok(r.conds.map((c) => c.split(':')[0]).join() === soll.join() && r.conds.join() === q.expect.join(), `${tag}: Bedingungen passen zur Art`);
    ok(new Set(q.options.map((o) => o.conds.join('|'))).size === 4, `${tag}: Bedingungen der Antworten verschieden`);
    if (!q.soll) return;
    // Ab Stufe 3: Die richtige Funktion erfüllt die Vorgaben aus dem Text, kein Ablenker tut es
    const { x0, y0, m } = q.soll, s = 1 + Math.abs(y0);
    const erfuellt = (f) => nah(f(x0), y0, 1e-7) && (q.kind === 'extrem' ? Math.abs(d1(f, x0)) < 1e-6 * s : q.kind === 'wende' ? Math.abs(d2(f, x0)) < 1e-4 * s : nah(d1(f, x0), m, 1e-6));
    ok(erfuellt(r.val), `${tag}: Funktion erfüllt die Bedingungen (${q.prompt} ${r.tex})`);
    for (const o of q.options) if (!o.correct) ok(!erfuellt(o.val), `${tag}: Ablenker erfüllt die Bedingungen nicht (${o.tex})`);
    if (q.kind === 'extrem') ok(/Hochpunkt/.test(q.prompt) ? d2(r.val, x0) < -1e-6 : d2(r.val, x0) > 1e-6, `${tag}: Hoch-/Tiefpunkt richtig benannt (${q.prompt} ${r.tex})`);
    if (q.kind === 'wende') { const e = 0.05; ok(d2(r.val, x0 - e) * d2(r.val, x0 + e) < 0, `${tag}: echter Wendepunkt (${r.tex})`); }
    // Angaben im Text: Punkt bzw. Tangente stehen mit den richtigen Zahlen da
    const tz = (v) => String(+v.toFixed(2)).replace('.', '{,}');
    if (!/e\^|e\)|\\mid -?\d*e/.test(q.prompt)) ok(q.kind === 'tangente' ? q.prompt.includes(`x_0=${tz(x0)}`) : q.prompt.includes(`(${tz(x0)}\\mid ${tz(y0)})`), `${tag}: Vorgaben stehen im Text (${q.prompt})`);
  },
  genSchar(q, r, tag) {
    // Für mehrere Parameterwerte: richtiger Punkt liegt auf dem Graphen, f' = 0, f'' > 0, und links/rechts liegt der Graph höher
    for (const k of [...KS, 1.7]) { const f = q.f(k), [x, y] = r.fn(k), e = 0.05;
      ok(nah(f(x), y, 1e-7) && Math.abs(d1(f, x)) < 1e-6 * (1 + Math.abs(y)) && d2(f, x) > 1e-6 && f(x - e) > y && f(x + e) > y, `${tag}: Tiefpunkt stimmt für k=${k} (${q.formula}, ${r.tex})`);
      for (const o of q.options) if (!o.correct) { const [a, b] = o.fn(k), fa = f(a); ok(!(Number.isFinite(fa) && nah(fa, b, 1e-7) && Math.abs(d1(f, a)) < 1e-6 * (1 + Math.abs(b)) && d2(f, a) > 0), `${tag}: Ablenker ist kein Tiefpunkt für k=${k} (${q.formula}, ${o.tex})`); } }
  },
  genExtremwert(q, r, tag) {
    // Bestes x auf einem feinen Raster suchen, dann mit Dreiteilung verfeinern
    let lo = q.lo, hi = q.hi, best = lo, bv = -Infinity;
    for (let i = 0; i <= 4000; i++) { const x = lo + ((hi - lo) * i) / 4000, v = q.obj(x); if (v > bv) { bv = v; best = x; } }
    let a = Math.max(lo, best - (hi - lo) / 2000), b = Math.min(hi, best + (hi - lo) / 2000);
    for (let i = 0; i < 80; i++) { const m1 = a + (b - a) / 3, m2 = b - (b - a) / 3; if (q.obj(m1) < q.obj(m2)) a = m1; else b = m2; }
    ok(Math.abs((a + b) / 2 - r.num) < 1e-5 * (1 + Math.abs(r.num)), `${tag}: bestes x stimmt (${q.kind}: ${(a + b) / 2} gegen ${r.num})`);
    ok(r.num > lo && r.num < hi, `${tag}: Lösung liegt im sinnvollen Bereich`);
    for (const o of q.options) if (!o.correct) ok(q.obj(o.num) < q.obj(r.num) - 1e-6, `${tag}: Ablenker ist schlechter (${q.kind}, ${o.tex})`);
    for (const o of q.options) { const m = o.tex.match(/^x(=|\\approx )(-?\d+(?:\{,\}\d+)?)$/); ok(m && Math.abs(+m[2].replace('{,}', '.') - o.num) <= (m[1] === '=' ? 1e-9 : 0.0051), `${tag}: Anzeige passt zum Wert (${o.tex})`); }
    // Die Einkleidung nachrechnen: Zielgröße unabhängig aus dem Aufgabentext
    const z = (re) => { const m = q.prompt.match(re); return m ? m.slice(1).map((t) => +t.replace(',', '.')) : null; };
    const eigen = { rechteck: () => { const [U] = z(/Umfang (\d+)/); return (x) => x * (U / 2 - x); }, zaun: () => { const [L] = z(/Mit (\d+) m/); return (x) => x * (L - 2 * x); },
      schachtel: () => { const [s] = z(/Seitenlänge (\d+) cm/); return (x) => x * (s - 2 * x) * (s - 2 * x); }, trennwand: () => { const [L] = z(/Mit (\d+) m/); return (x) => x * ((L - 3 * x) / 2); },
      parabel: () => { const [p] = z(/f\(x\)=(\d+)-x\^2/); return (x) => 2 * x * (p - x * x); }, offen: () => { const [V] = z(/soll ([\d,]+) Liter/); return (x) => -(x * x + 4 * x * (V / (x * x))); },
      karton: () => { const [p, s] = z(/\((\d+) cm mal (\d+) cm\)/); return (x) => x * (p - 2 * x) * (s - 2 * x); }, efkt: () => { const m = q.prompt.match(/f\(x\)=(\d+)\\cdot e\^\{-(\d+\{,\}\d+)x\}/); const c = +m[1], k = +m[2].replace('{,}', '.'); return (x) => x * c * Math.exp(-k * x); },
      abstand: () => { const m = q.prompt.match(/A\((\d+(?:\{,\}\d+)?)\\mid0\)/); const p = +m[1].replace('{,}', '.'); return (x) => -Math.hypot(x - p, Math.sqrt(x)); }, dose: () => { const [V] = z(/soll (\d+) cm³/); return (x) => -(2 * Math.PI * x * x + 2 * Math.PI * x * (V / (Math.PI * x * x))); } }[q.kind];
    ok(!!eigen, `${tag}: bekannte Einkleidung (${q.kind})`);
    if (eigen) { const g = eigen(), x = r.num, e = (hi - lo) / 500; ok(g(x) > g(x - e) && g(x) > g(x + e) && Math.abs(d1(g, x, e / 50)) < 1e-5 * (1 + Math.abs(g(x))), `${tag}: Lösung ist auch nach dem Aufgabentext optimal (${q.kind})`); }
  },
  genLn(q, r, tag) {
    const X = [0.7, 1.3, 2.9, 4.2];
    ok(X.every((x) => nah(r.val(x), d1(q.f, x), 1e-6)), `${tag}: Ableitung stimmt (${q.formula} → ${r.tex})`);
    for (const o of q.options) if (!o.correct) ok(X.some((x) => !nah(o.val(x), d1(q.f, x), 1e-3)), `${tag}: Ablenker ist falsch (${q.formula} → ${o.tex})`);
  },
  genWachstum(q, r, tag) {
    if (q.kind === 'zeit') {
      ok(r.num > 0 && nah(Math.exp(q.k * r.num), q.factor, 1e-9), `${tag}: Zeit stimmt (${q.prompt})`);
      for (const o of q.options) if (!o.correct) ok(!nah(Math.exp(q.k * o.num), q.factor, 2e-3), `${tag}: Ablenker falsch`);
      const m = r.tex.match(/^t\\approx (\d+(?:\{,\}\d+)?)$/);
      if (m) { ok(Math.abs(+m[1].replace('{,}', '.') - r.num) <= 0.0501, `${tag}: Anzeige passt zum Wert (${r.tex}, ${r.num})`);
        for (const o of q.options) { const w = o.tex.match(/^t\\approx (\d+(?:\{,\}\d+)?)$/); ok(w && Math.abs(+w[1].replace('{,}', '.') - o.num) <= 0.0501, `${tag}: Anzeige der Antworten passt`); } }
      // Einkleidung nachrechnen: k und Faktor unabhängig aus dem Text
      const zahl = (t) => +t.replace(/\./g, '').replace(',', '.'); let mm, soll = null;
      if ((mm = q.prompt.match(/N\(t\)=(\d+)\\cdot e\^\{(-?\d+\{,\}\d+)t\}.*auf ([\d,]+) /))) soll = Math.log(zahl(mm[3]) / +mm[1]) / +mm[2].replace('{,}', '.');
      else if ((mm = q.prompt.match(/wächst jedes Jahr um ([\d,]+) %\. Nach wie vielen Jahren hat er sich (verdoppelt|verdreifacht)/))) soll = Math.log(mm[2] === 'verdoppelt' ? 2 : 3) / Math.log(1 + zahl(mm[1]) / 100);
      else if ((mm = q.prompt.match(/Bestand von (\d+) (nimmt|wächst) jedes Jahr um ([\d,]+) %.*sind es ([\d,]+)\?/))) soll = Math.log(zahl(mm[4]) / +mm[1]) / Math.log(1 + (mm[2] === 'nimmt' ? -1 : 1) * zahl(mm[3]) / 100);
      else if ((mm = q.prompt.match(/Halbwertszeit ([\d,]+) Jahre.*noch ([\d,]+) %/))) soll = (zahl(mm[1]) * Math.log(zahl(mm[2]) / 100)) / Math.log(0.5);
      else if ((mm = q.prompt.match(/verdoppelt sich alle ([\d,]+) Tage.*auf das (\d+)-Fache/))) soll = (zahl(mm[1]) * Math.log(+mm[2])) / Math.log(2);
      else if ((mm = q.prompt.match(/Zu Beginn sind es (\d+) Bakterien, nach (\d+) Stunden ([\d,]+)\..*sind es ([\d,]+)\?/))) soll = (+mm[2] * Math.log(zahl(mm[4]) / +mm[1])) / Math.log(zahl(mm[3]) / +mm[1]);
      else if (q.formula && (mm = q.formula.match(/e\^\{(-?\d+\{,\}\d+)t\}/))) soll = Math.log(/halbiert/.test(q.prompt) ? 0.5 : 2) / +mm[1].replace('{,}', '.');
      ok(soll !== null && nah(soll, r.num, 1e-9), `${tag}: Zeit nach dem Aufgabentext (${q.prompt}: ${soll} gegen ${r.num})`);
    } else {
      ok([1, 7, 40].every((t) => nah(r.val(t), q.N0 * q.a ** t, 1e-9)), `${tag}: Funktion stimmt`);
      for (const o of q.options) if (!o.correct) ok([1, 40].some((t) => Math.abs(o.val(t) - q.N0 * q.a ** t) > 0.02 * q.N0), `${tag}: Ablenker falsch`);
      const zahl = (t) => +t.replace(',', '.'); let mm, a = null;
      if ((mm = q.prompt.match(/von (\d+) (nimmt|wächst) pro Jahr um ([\d,]+) %/))) a = 1 + (mm[2] === 'nimmt' ? -1 : 1) * zahl(mm[3]) / 100;
      else if ((mm = q.prompt.match(/von (\d+) auf ([\d,]+) /))) a = zahl(mm[2]) / +mm[1];
      ok(a !== null && nah(a, q.a, 1e-9) && +mm[1] === q.N0 && nah(r.val(3), +mm[1] * a ** 3, 1e-9), `${tag}: Funktion nach dem Aufgabentext (${q.prompt})`);
    }
  },
  genFlaecheZwischen(q, r, tag) {
    const { f, g, r1, r2 } = q, A = integral((x) => Math.abs(g(x) - f(x)), r1, r2);
    ok(nah(f(r1), g(r1), 1e-9) && nah(f(r2), g(r2), 1e-9) && r1 < r2, `${tag}: Schnittstellen stimmen (${q.formula})`);
    // keine weitere Schnittstelle dazwischen und außerhalb liegt f oben (die eingeschlossene Fläche ist eindeutig)
    let innen = true; for (let i = 1; i < 200; i++) { const x = r1 + ((r2 - r1) * i) / 200; if (!(g(x) > f(x))) innen = false; }
    ok(innen && f(r1 - 0.5) > g(r1 - 0.5) && f(r2 + 0.5) > g(r2 + 0.5), `${tag}: genau eine eingeschlossene Fläche`);
    ok(nah(r.num, A, 1e-7), `${tag}: Flächeninhalt stimmt (${q.formula}: ${A} gegen ${r.num})`);
    for (const o of q.options) if (!o.correct) ok(Math.abs(o.num - A) > 0.015, `${tag}: Ablenker verschieden (${o.tex})`);
    let m;
    if ((m = r.tex.match(/^A=(-?)\\dfrac\{(\d+)\}\{(\d+)\}$/))) ok(nah(+m[2] / +m[3], A, 1e-9) && !m[1], `${tag}: Bruch-Anzeige passt (${r.tex})`);
    else if ((m = r.tex.match(/^A=(-?\d+)$/))) ok(nah(+m[1], A, 1e-9), `${tag}: Zahl-Anzeige passt (${r.tex})`);
    else if ((m = r.tex.match(/^A\\approx (-?\d+(?:\{,\}\d+)?)$/))) ok(Math.abs(+m[1].replace('{,}', '.') - A) <= 0.0051, `${tag}: gerundete Anzeige passt (${r.tex})`);
    else if ((m = r.tex.match(/^A=(?:\\dfrac\{(\d+)\}\{(\d+)\}|(\d*))k\^\{3\}$/))) { const c = m[1] ? +m[1] / +m[2] : +(m[3] || 1); ok(nah(c * K0 ** 3, A, 1e-9), `${tag}: Anzeige mit Parameter passt (${r.tex})`); }
    else ok(/^\\int_/.test(r.tex), `${tag}: Anzeige lesbar (${r.tex})`);
    if (/^\\int_/.test(r.tex)) ok(r.tex.startsWith(`\\int_{${r1}}^{${r2}}`), `${tag}: Integralgrenzen sind die Schnittstellen`);
  },
};

seedRandom(20261116);
const arten = new Map();
for (const [name, pruefe] of Object.entries(P)) for (let lv = 1; lv <= 5; lv++) for (let i = 0; i < 200; i++) {
  const q = H[name](lv), tag = `${name} (Stufe ${lv})`;
  let r; try { r = grund(name, q, lv); pruefe(q, r, tag); } catch (e) { ok(false, `${tag}: Prüfung bricht ab – ${e.message} (${q.formula ?? q.prompt})`); }
  const key = `${name} ${lv}`; if (!arten.has(key)) arten.set(key, new Set()); arten.get(key).add(q.art || q.kind || '-');
}
seedRandom(null);
// Die oberen Stufen müssen andere Aufgaben-Formen bringen als die unteren
for (const name of Object.keys(P)) { const a = arten.get(`${name} 1`), e = arten.get(`${name} 5`); ok(name === 'genSteckbrief' || name === 'genSymmetrie' || ![...e].every((k) => a.has(k)), `${name}: Stufe 5 bringt neue Aufgaben-Formen`); }
if (fehler) { console.error(`hart/gen2a: ${fehler} Fehler bei ${n} Prüfungen`); process.exit(1); }
console.log(`hart/gen2a: ${n} Prüfungen bestanden`);
