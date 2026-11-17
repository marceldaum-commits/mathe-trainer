globalThis.window = { katex: { renderToString: (s) => s } };
// Harte Prüfung für das Paket gen1 (app/js/gen.js): Jede Aufgaben-Form wird je Stufe 200-mal erzeugt und unabhängig nachgerechnet.
// Unabhängig heißt: Die Formeln der Aufgabe und der Antworten werden hier aus ihrem TeX-Quelltext gelesen und ausgewertet;
// abgeleitet und integriert wird numerisch, Wahrscheinlichkeiten werden abgezählt, Vektor-Aufgaben über ihre Bedingung geprüft.
// Formeln im Fließtext werden dazu in «…» gefasst.
window.katex.renderToString = (s) => `«${String(s).replace(/[«»]/g, '')}»`;
const G = await import('../../app/js/gen.js');
const { seedRandom } = await import('../../app/js/math.js');

let n = 0, fails = 0; const seen = new Set();
const ok = (cond, msg) => { n++; if (!cond && !seen.has(msg)) { seen.add(msg); fails++; console.error('FEHLER:', msg); } };
const nah = (a, b, rel = 1e-6) => Math.abs(a - b) <= rel * (1 + Math.abs(a) + Math.abs(b));
const REP = 200, LV = [1, 2, 3, 4, 5], XS = [-1.3, -0.4, 0.7, 1.9];
const abl = (f, x, h = 1e-5) => (f(x + h) - f(x - h)) / (2 * h);
const simpson = (f, a, b, m = 2000) => { const h = (b - a) / m; let s = f(a) + f(b); for (let i = 1; i < m; i++) s += f(a + i * h) * (i % 2 ? 4 : 2); return (s * h) / 3; };
const binom = (N, k) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (N - k + i)) / i; return Math.round(r); };

/** Wertet einen TeX-Ausdruck aus (Zahlen mit Komma, Buchstaben als Variablen, e, Potenzen, Brüche, Wurzeln, Binomialkoeffizienten). */
function texFn(src) {
  const s = String(src).replace(/\{,\}/g, '.').replace(/\\[dt]frac/g, '\\frac').replace(/\\(left|right|bigl|bigr)(?![a-z])/g, '').replace(/\\[,;!]/g, '').replace(/\\cdot/g, '*').replace(/\s+/g, '');
  let i = 0;
  const peek = (t) => s.startsWith(t, i), eat = (t) => { if (!peek(t)) throw new Error(`erwarte „${t}“ an Stelle ${i} in ${s}`); i += t.length; };
  const group = () => { eat('{'); const e = expr(); eat('}'); return e; };
  function atom() {
    if (peek('\\frac')) { i += 5; const a = group(), b = group(); return (v) => a(v) / b(v); }
    if (peek('\\sqrt')) { i += 5; const a = group(); return (v) => Math.sqrt(a(v)); }
    if (peek('\\binom')) { i += 6; const a = group(), b = group(); return (v) => binom(a(v), b(v)); }
    if (peek('(')) { i++; const e = expr(); eat(')'); return e; }
    if (peek('{')) return group();
    const m = /^\d+(\.\d+)?/.exec(s.slice(i)); if (m) { i += m[0].length; const z = +m[0]; return () => z; }
    const c = s[i]; if (c && /[a-z]/.test(c)) { i++; return c === 'e' ? () => Math.E : (v) => { if (!(c in v)) throw new Error(`unbekannte Variable ${c} in ${s}`); return v[c]; }; }
    throw new Error(`unerwartet „${s.slice(i, i + 10)}“ in ${s}`);
  }
  function power() { const b = atom(); if (!peek('^')) return b; i++; let e; if (peek('{')) e = group(); else { const c = s[i++]; e = () => +c; } return (v) => b(v) ** e(v); }
  function unary() { if (peek('-')) { i++; const u = unary(); return (v) => -u(v); } return power(); }
  function term() { let t = unary(); for (;;) { const a = t; if (peek('*')) { i++; const u = unary(); t = (v) => a(v) * u(v); } else if (i < s.length && /[\da-z({\\]/.test(s[i])) { const u = power(); t = (v) => a(v) * u(v); } else return t; } }
  function expr() { let e = term(); while (peek('+') || peek('-')) { const op = s[i++], t = term(), a = e; e = op === '+' ? (v) => a(v) + t(v) : (v) => a(v) - t(v); } return e; }
  const e = expr(); if (i < s.length) throw new Error(`Rest „${s.slice(i)}“ in ${s}`);
  return e;
}
const rechts = (t) => String(t).slice(String(t).indexOf('=') + 1);
const fx = (t) => { const e = texFn(rechts(t)); return (x) => e({ x }); };
const zahl = (t) => { const pr = /\\,\\%$/.test(t); return texFn(String(t).replace(/^\\approx ?/, '').replace(/\\,\\%$/, ''))({}) / (pr ? 100 : 1); };
const formeln = (text) => [...String(text).matchAll(/«([^»]*)»/g)].map((m) => m[1]);
const ohneMarken = (text) => String(text).replace(/«[^»]*»/g, ' ');
const punkte = (t) => Object.fromEntries([...String(t).matchAll(/([A-Z])\(([^()]*)\)/g)].map((m) => [m[1], m[2].split('\\mid').map((c) => +c.replace('{,}', '.'))]));
const vektoren = (t) => Object.fromEntries([...String(t).matchAll(/\\vec ([a-z])=\\begin\{pmatrix\}(.*?)\\end\{pmatrix\}/g)].map((m) => [m[1], m[2].split('\\\\').map((c) => +c.replace('{,}', '.'))]));
const spalte = (t) => String(t).match(/\\begin\{pmatrix\}(.*?)\\end\{pmatrix\}/)[1].split('\\\\').map((c) => +c.replace('{,}', '.'));
const skal = (u, v) => u.reduce((s, c, i) => s + c * v[i], 0);

const BEFEHLE = new Set('cdot dfrac frac tfrac sqrt quad mid begin end text left right int binom vec overrightarrow overline approx pm ge Rightarrow bigl bigr sigma mu'.split(' '));
/** Regeln, die für jede Aufgabe gelten. Liefert die richtige Antwort. */
function grund(name, q, lv, anzahl = 4) {
  const tag = `${name} (Stufe ${lv})`, right = q.options.filter((o) => o.correct);
  ok(right.length === 1 && q.options.length === anzahl, `${tag}: ${anzahl} Antworten, genau eine richtig`);
  ok(new Set(q.options.map((o) => o.tex)).size === q.options.length, `${tag}: Antworten verschieden (${q.options.map((o) => o.tex).join(' | ')})`);
  for (const o of q.options) if (!o.correct) ok(typeof o.why === 'string' && o.why.length > 15, `${tag}: Ablenker mit Diagnose`);
  ok(Array.isArray(q.hints) && q.hints.length >= 2 && q.hints.every((h) => typeof h === 'string' && h.length > 8), `${tag}: Tipps nicht leer`);
  ok(q.hints.length <= (lv <= 1 ? 2 : lv === 2 ? 3 : 6), `${tag}: Lösungsweg nicht aufgebläht (${q.hints.length} Tipps)`);
  ok(typeof q.explain === 'string' && q.explain.length > 10 && typeof q.prompt === 'string' && q.prompt.length > 10, `${tag}: Frage und Erklärung`);
  const alles = [q.prompt, q.formula ?? '', q.explain, ...q.hints, ...q.options.flatMap((o) => [o.tex, o.why ?? ''])];
  ok(!alles.some((t) => /undefined|NaN|Infinity|\[object|function/.test(t)), `${tag}: kein „undefined“/„NaN“ im Text`);
  ok(!alles.some((t) => /\d\.\d/.test(t)), `${tag}: Komma statt Punkt`);
  for (const t of [q.prompt, q.explain, ...q.hints, ...q.options.map((o) => o.why ?? '')]) ok(!/\{,\}|\\[a-zA-Z]+|\^|_\{/.test(ohneMarken(t)), `${tag}: Fließtext ohne rohe Formel-Zeichen (${ohneMarken(t).slice(0, 60)})`);
  ok(!alles.some((t) => /(^|[^0-9,{.a-z_\\])1x(?![0-9_])|\)\^\{1\}|[x\d]\^\{1\}(?!\d)|\+-|--|-\+|\+\+|=\+|\(\+/.test(String(t).replace(/«|»/g, ''))), `${tag}: saubere Schreibweise (kein „1x“, „hoch 1“, „+-“): ${alles.find((t) => /(^|[^0-9,{.a-z_\\])1x(?![0-9_])|\)\^\{1\}|[x\d]\^\{1\}(?!\d)|\+-|--|-\+|\+\+|=\+|\(\+/.test(String(t).replace(/«|»/g, '')))}`);
  // Nur bekannte TeX-Befehle („\\cdot“ direkt vor einem Buchstaben ergäbe den unbekannten Befehl „\\cdott“) und paarige Klammern
  for (const t of alles) { for (const m of String(t).matchAll(/\\([a-zA-Z]+)/g)) ok(BEFEHLE.has(m[1]), `${tag}: unbekannter TeX-Befehl \\${m[1]} in ${String(t).slice(0, 80)}`);
    for (const f of [...formeln(t), ...(t === q.formula || q.options.some((o) => o.tex === t) ? [t] : [])]) { let d = 0, gut = true; for (const c of f.replace(/\\[{}]/g, '')) { if (c === '{') d++; else if (c === '}' && --d < 0) gut = false; } ok(gut && d === 0, `${tag}: geschweifte Klammern paarig (${f})`);
      ok((f.match(/\(/g) || []).length === (f.match(/\)/g) || []).length, `${tag}: runde Klammern paarig (${f})`); } }
  return right[0];
}
/** Prüft reine Zahlen-Gleichungsketten im Lösungsweg („3·4+2=14“). */
function ketten(name, q, lv) {
  for (const t of [q.explain, ...q.hints]) for (const f of formeln(t)) {
    if (/[a-zA-Z]/.test(f.replace(/\\(cdot|d?frac|tfrac|sqrt|left|right|binom|approx|,)/g, ''))) continue;
    const exakt = f.split('=').map((x) => x.split('\\approx'));
    if (exakt.length < 2 && exakt[0].length < 2) continue;
    try {
      const werte = exakt.map((teil) => teil.map((x) => zahl(x)));
      for (let i = 1; i < werte.length; i++) ok(nah(werte[i - 1][0], werte[i][0], 1e-9), `${name} (Stufe ${lv}): Rechnung im Lösungsweg stimmt (${f})`);
      for (const w of werte) for (let i = 1; i < w.length; i++) ok(Math.abs(w[0] - w[i]) < 0.0051 * Math.max(1, Math.abs(w[0])) , `${name} (Stufe ${lv}): Rundung im Lösungsweg stimmt (${f})`);
    } catch { /* keine reine Zahlenrechnung */ }
  }
}

for (const lv of LV) {
  seedRandom(4200 + lv);
  for (let i = 0; i < REP; i++) {
    // ── Scheitel: Antwort-Gleichung gegen den gezeichneten Graphen
    { const q = G.genScheitel(lv), r = grund('genScheitel', q, lv), tag = `genScheitel (Stufe ${lv})`; ketten('genScheitel', q, lv);
      const xs = [-2.5, -1, 0, 0.5, 2, 3.5];
      ok(xs.every((x) => nah(fx(r.tex)(x), q.graph.f(x))), `${tag}: richtige Gleichung passt zum Graphen (${r.tex})`);
      for (const o of q.options) { ok(xs.every((x) => nah(fx(o.tex)(x), o.val(x))), `${tag}: Rechenform der Antwort passt zur Anzeige`); if (!o.correct) ok(xs.some((x) => !nah(fx(o.tex)(x), q.graph.f(x), 1e-4)), `${tag}: Ablenker passt nicht zum Graphen (${o.tex})`); }
      const [mx, my] = q.graph.mark; ok(nah(q.graph.f(mx), my) && mx > -6 && mx < 6 && my > -5 && my < 7, `${tag}: markierter Punkt liegt sichtbar auf dem Graphen`);
      // Scheitel durch Abtasten suchen: muss sichtbar sein und auf Gitterpunkten liegen
      let bx = 0, by = Infinity, auf = q.graph.f(100) > 0; for (let x = -6; x <= 6; x += 0.5) { const y = q.graph.f(x); if ((auf ? y : -y) < by) { by = auf ? y : -y; bx = x; } }
      ok(Number.isInteger(bx) && Number.isInteger(by) && Math.abs(by) < 5, `${tag}: Scheitel auf einem Gitterpunkt im Bild`);
      if (lv === 5) { const P = punkte(formeln(q.prompt).join(' ')).P; ok(P && nah(q.graph.f(P[0]), P[1]) && P[0] === mx, `${tag}: genannter Punkt P liegt auf der Parabel`); } }

    // ── Ableiten: Aufgabe und Antworten aus dem TeX lesen, numerisch ableiten
    for (const name of ['genPolynom', 'genKette', 'genExp', 'genProdukt']) {
      const q = G[name](lv), r = grund(name, q, lv), tag = `${name} (Stufe ${lv})`, f = fx(q.formula); ketten(name, q, lv);
      ok(XS.every((x) => nah(f(x), q.f(x))), `${tag}: Rechenform der Aufgabe passt zur Anzeige (${q.formula})`);
      ok(XS.every((x) => nah(fx(r.tex)(x), abl(f, x), 1e-5)), `${tag}: richtige Ableitung (${q.formula} → ${r.tex})`);
      for (const o of q.options) { ok(XS.every((x) => nah(fx(o.tex)(x), o.val(x))), `${tag}: Rechenform der Antwort passt zur Anzeige (${o.tex})`);
        if (!o.correct) ok(XS.some((x) => !nah(fx(o.tex)(x), abl(f, x), 1e-3)), `${tag}: Ablenker ist falsch (${q.formula} → ${o.tex})`); }
      // Die Schluss-Formel der Erklärung muss die richtige Ableitung sein
      const letzte = formeln(q.explain).at(-1); if (/^f'\(x\)=/.test(letzte)) { const teile = rechts(letzte).split('=');
        for (const t of teile) ok(XS.every((x) => nah(texFn(t)({ x }), abl(f, x), 1e-5)), `${tag}: jede Zeile der Erklärung ist die Ableitung (${t})`); }
    }
    { const q = G.genPotenzLuecke(lv), f = fx(q.formula);
      ok([0.7, 1.3, 2.1].every((x) => nah(q.slots[0].correct * x ** q.slots[1].correct, abl(f, x), 1e-5)), `genPotenzLuecke (Stufe ${lv}): Lösung stimmt (${q.formula})`); }

    // ── Extremstellen: alle Nullstellen von f' durch Abtasten suchen und vergleichen
    { const q = G.genExtremstellen(lv), r = grund('genExtremstellen', q, lv), tag = `genExtremstellen (Stufe ${lv})`, f = fx(q.formula), d = (x) => abl(f, x); ketten('genExtremstellen', q, lv);
      ok(XS.every((x) => nah(f(x), q.f(x))), `${tag}: Rechenform der Aufgabe passt zur Anzeige`);
      const null_ = []; let alt = d(-9.0003);
      for (let x = -9.0003 + 0.001; x < 9; x += 0.001) { const neu = d(x); if (alt === 0 || alt * neu < 0) null_.push(x - 0.0005); alt = neu; }
      ok(null_.length === r.xs.length && [...r.xs].sort((a, b) => a - b).every((x, j) => Math.abs(x - null_[j]) < 0.002), `${tag}: genau die Stellen mit f'(x)=0 (${q.formula}: ${r.xs} / ${null_.map((x) => x.toFixed(3))})`);
      for (const o of q.options) { const gez = o.tex.split(',\\quad ').map((t) => zahl(rechts(t)));
        ok(gez.length === o.xs.length && gez.every((x, j) => nah(x, o.xs[j])), `${tag}: Rechenform der Antwort passt zur Anzeige (${o.tex})`);
        if (!o.correct) ok(o.xs.some((x) => null_.every((z) => Math.abs(z - x) > 0.01)), `${tag}: Ablenker enthält eine falsche Stelle (${o.tex})`); } }

    // ── Hoch-/Tiefpunkt: Nachbarwerte vergleichen (ohne zweite Ableitung); bei der Schar für mehrere t
    { const q = G.genHochTief(lv), r = grund('genHochTief', q, lv), tag = `genHochTief (Stufe ${lv})`; ketten('genHochTief', q, lv);
      const e = texFn(rechts(q.formula)), stelle = texFn(rechts(formeln(q.prompt).find((t) => /^x=/.test(t))));
      for (const t of lv === 5 ? [0.3, 1, 2.5, 6] : [1]) { const f = (x) => e({ x, t }), at = stelle({ t }), h = 1e-3 * Math.max(1, Math.abs(at)), s = Math.max(Math.abs(f(at)), Math.abs(f(at + 0.3)), 1e-9);
        ok(Math.abs(abl(f, at, h / 10)) < 1e-6 * Math.max(1, s / Math.max(1e-9, h)), `${tag}: waagerechte Tangente an der Stelle (${q.formula}, x=${at}, t=${t})`);
        const hoch = f(at + h) < f(at) && f(at - h) < f(at), tief = f(at + h) > f(at) && f(at - h) > f(at);
        ok((r.key === 'H' && hoch) || (r.key === 'T' && tief), `${tag}: Art stimmt (${q.formula}, x=${at}, t=${t}: ${r.key})`); }
      ok(new Set(q.options.map((o) => o.key)).size === 4 && ['H', 'T'].includes(r.key) && q.kind === r.key, `${tag}: vier verschiedene Arten`);
      if (lv < 5) ok(nah(stelle({}), q.at) && XS.every((x) => nah(e({ x }), q.f(x))), `${tag}: Rechenform passt zur Anzeige`);
      else ok(Math.abs(abl(q.f, q.at)) < 1e-6, `${tag}: Kontroll-Funktion hat dort eine waagerechte Tangente`); }

    // ── Stammfunktion: Antwort numerisch ableiten, Bedingung einsetzen
    { const q = G.genStammfunktion(lv), r = grund('genStammfunktion', q, lv), tag = `genStammfunktion (Stufe ${lv})`, f = fx(q.formula); ketten('genStammfunktion', q, lv);
      ok(XS.every((x) => nah(f(x), q.f(x))), `${tag}: Rechenform der Aufgabe passt zur Anzeige`);
      ok(XS.every((x) => nah(abl(fx(r.tex), x), f(x), 1e-5)), `${tag}: F' = f (${q.formula} → ${r.tex})`);
      const bed = formeln(q.prompt).map((t) => t.match(/^F\((-?\d+)\)=(-?\d+)$/)).find(Boolean);
      ok((lv >= 4) === !!bed, `${tag}: Bedingung ab Stufe 4`);
      for (const o of q.options) { ok(XS.every((x) => nah(fx(o.tex)(x), o.val(x))), `${tag}: Rechenform der Antwort passt zur Anzeige (${o.tex})`);
        if (bed) ok(nah(fx(o.tex)(+bed[1]), +bed[2], 1e-9), `${tag}: Antwort erfüllt die Bedingung (${o.tex})`);
        if (!o.correct) ok(XS.some((x) => !nah(abl(fx(o.tex), x), f(x), 1e-3)), `${tag}: Ablenker ist keine Stammfunktion (${o.tex})`); } }

    // ── Integral: Grenzen und Integrand aus dem TeX lesen, numerisch integrieren
    { const q = G.genIntegral(lv), r = grund('genIntegral', q, lv), tag = `genIntegral (Stufe ${lv})`; ketten('genIntegral', q, lv);
      const m = q.formula.match(/^\\int_\{(-?\d+)\}\^\{(-?\d+)\}(.*?)(\\,)?dx$/), a = +m[1], b = +m[2], f = (x) => texFn(m[3])({ x }), wert = simpson(f, a, b);
      ok(a === q.a && b === q.b && a < b && [0.1, 0.5, 0.9].every((u) => nah(f(a + u * (b - a)), q.f(a + u * (b - a)))), `${tag}: Rechenform der Aufgabe passt zur Anzeige`);
      ok(nah(zahl(r.tex), wert, 1e-7) && nah(r.num, wert, 1e-7), `${tag}: Wert stimmt (${q.formula} = ${r.tex})`);
      for (const o of q.options) { ok(nah(zahl(o.tex), o.num, 1e-12), `${tag}: Rechenform der Antwort passt zur Anzeige`); if (!o.correct) ok(Math.abs(o.num - wert) > 0.01 * (1 + Math.abs(wert)), `${tag}: Ablenker deutlich verschieden`); } }

    // ── Erwartungswert/Standardabweichung: aus der vollen Verteilung berechnet; p bei Stufe 5 durch Abzählen der beiden Drehungen
    { const q = G.genErwartung(lv), r = grund('genErwartung', q, lv), tag = `genErwartung (Stufe ${lv})`, text = ohneMarken(q.prompt); ketten('genErwartung', q, lv);
      let N, p;
      if (lv === 5) { const m = +text.match(/hat (\d+) gleich große Felder/)[1], g = /eines davon ist rot/.test(text) ? 1 : +text.match(/(\d+) davon sind rot/)[1], mind = /mindestens einmal/.test(q.prompt); let gut = 0;
        for (let x = 0; x < m; x++) for (let y = 0; y < m; y++) if (mind ? x < g || y < g : x < g && y < g) gut++; p = gut / (m * m); N = +text.match(/wird (\d+)-mal gespielt/)[1]; }
      else if (lv === 2 || lv === 4) { p = +text.match(/von ([\d,]+) %/)[1].replace(',', '.') / 100; N = +text.match(/(\d+) (Lose|Samen)/)[1]; }
      else if (lv === 1) { N = +text.match(/wird (\d+)-mal gedreht/)[1]; p = +text.match(/Wahrscheinlichkeit ([\d,]+)\./)[1].replace(',', '.'); }
      else { const m = q.formula.match(/^n=(\d+),\\quad p=([\d{},]+)$/); N = +m[1]; p = +m[2].replace('{,}', '.'); }
      let mu = 0, va = 0, P = [1];
      for (let j = 0; j < N; j++) { const neu = Array(P.length + 1).fill(0); P.forEach((x, t) => { neu[t] += x * (1 - p); neu[t + 1] += x * p; }); P = neu; }
      P.forEach((x, k) => { mu += k * x; }); P.forEach((x, k) => { va += (k - mu) ** 2 * x; });
      const sigma = /Standardabweichung/.test(q.prompt), soll = sigma ? Math.sqrt(va) : mu;
      ok(N === q.n && nah(p, q.p, 1e-12) && sigma === q.askSigma, `${tag}: Felder n, p, askSigma passen zum Text`);
      ok(Math.abs(r.num - soll) < 0.0051 && Math.abs(zahl(r.tex) - soll) < 0.0051, `${tag}: Wert stimmt (n=${N}, p=${p}: ${r.tex} statt ${soll})`);
      ok(r.tex.startsWith('\\approx') === (Math.abs(soll - +soll.toFixed(2)) > 1e-7) || lv < 4, `${tag}: „≈“ genau bei gerundeten Werten`);
      for (const o of q.options) { ok(Math.abs(zahl(o.tex) - o.num) < 1e-9, `${tag}: Rechenform der Antwort passt zur Anzeige`); if (!o.correct) ok(Math.abs(o.num - soll) > 0.1, `${tag}: Ablenker deutlich verschieden`); } }

    // ── Bernoulli-Kette: Verteilung Schritt für Schritt aufgebaut (ohne Formel), Angaben aus dem Text gelesen
    { const q = G.genBinomial(lv), r = grund('genBinomial', q, lv), tag = `genBinomial (Stufe ${lv})`, text = ohneMarken(q.prompt).replace(/<[^>]+>/g, ''), fs = formeln(q.prompt); ketten('genBinomial', q, lv);
      let N, p, k, mind = /mindestens einen/.test(text);
      if (q.formula) { const m = q.formula.match(/^n=(\d+),\\quad p=([\d{},]+)$/); N = +m[1]; p = +m[2].replace('{,}', '.');
        const pk = fs.map((t) => t.match(/^P\(X=(\d+)\)$/)).find(Boolean); k = pk ? +pk[1] : /keinen Treffer/.test(text) ? 0 : +text.match(/für (\d+) Treffer/)[1]; }
      else { p = +text.match(/von ([\d,]+) %/)[1].replace(',', '.') / 100; N = +text.match(/(\d+) (Freiwürfe|Pfeile|Elfmeter)/)[1];
        if (mind) { if (/mindestens einen Fehlversuch/.test(text)) p = 1 - p; } else { const m = text.match(/genau (\d+) (Fehlversuche?|Treffer)/); k = +m[1]; if (m[2].startsWith('Fehlversuch')) p = 1 - p; } }
      let vert = [1]; for (let j = 0; j < N; j++) { const neu = Array(vert.length + 1).fill(0); vert.forEach((x, t) => { neu[t] += x * (1 - p); neu[t + 1] += x * p; }); vert = neu; }
      const soll = mind ? 1 - vert[0] : vert[k];
      ok(N === q.n && nah(p, q.p, 1e-9) && (mind ? q.kind === 'min1' : q.kind === 'eq' && q.k === k), `${tag}: Felder n, p, k passen zum Text`);
      const tol = (o) => (o.tex.startsWith('\\approx') ? 0.000051 : 1e-9);
      ok(nah(r.num, soll, 1e-9) && Math.abs(zahl(r.tex) - soll) < tol(r), `${tag}: Wert stimmt (${q.prompt} → ${r.tex})`);
      for (const o of q.options) { ok(Math.abs(zahl(o.tex) - o.num) < tol(o) && o.num > 0, `${tag}: Rechenform der Antwort passt zur Anzeige (${o.tex})`); if (!o.correct) ok(Math.abs(o.num - soll) > (r.tex.startsWith('\\approx') ? 0.01 : 1e-6), `${tag}: Ablenker verschieden`); } }

    // ── Baumdiagramm: alle geordneten Paare von Kugeln abzählen
    { const q = G.genBaum(lv), r = grund('genBaum', q, lv), tag = `genBaum (Stufe ${lv})`, text = ohneMarken(q.prompt).replace(/<[^>]+>/g, ''); ketten('genBaum', q, lv);
      let farben, gut;
      if (lv === 5) { const m = text.match(/(\d+) Hauptgewinne, (\d+) Trostpreise und (\d+) Nieten/); farben = [...Array(+m[1]).fill('h'), ...Array(+m[2]).fill('t'), ...Array(+m[3]).fill('n')]; gut = (x, y) => (x === 'h') !== (y === 'h'); }
      else { const m = text.match(/(\d+) rote und (\d+) blaue/); farben = [...Array(+m[1]).fill('r'), ...Array(+m[2]).fill('b')]; gut = /verschiedenfarbige/.test(text) ? (x, y) => x !== y : (x, y) => x === 'r' && y === 'r'; }
      const mit = /mit Zurücklegen/.test(text); let g = 0, alle = 0;
      farben.forEach((x, a) => farben.forEach((y, b) => { if (!mit && a === b) return; alle++; if (gut(x, y)) g++; }));
      const soll = g / alle, gez = zahl;
      ok(nah(r.num, soll, 1e-12) && Math.abs(gez(r.tex) - soll) < (lv === 5 ? 0.00051 : 1e-12), `${tag}: Wert stimmt (${text} → ${r.tex})`);
      ok(q.ohne === !mit && q.r === farben.filter((x) => x === 'r' || x === 'h').length && q.r + q.b === farben.length, `${tag}: Felder r, b, ohne passen zum Text`);
      for (const o of q.options) { ok(Math.abs(gez(o.tex) - o.num) < (lv === 5 ? 0.00051 : 1e-12), `${tag}: Rechenform der Antwort passt zur Anzeige (${o.tex})`); if (!o.correct) ok(Math.abs(o.num - soll) > (lv >= 3 ? 0.006 : 1e-7), `${tag}: Ablenker verschieden`); }
      if (lv === 3 || lv === 4) for (const o of q.options) { const m = o.tex.match(/^\\dfrac\{(\d+)\}\{(\d+)\}$/); if (m) { let a = +m[1], b = +m[2]; while (b) [a, b] = [b, a % b]; ok(a === 1, `${tag}: Bruch ist gekürzt (${o.tex})`); } } }

    // ── Verbindungsvektor: über die Bedingung der Aufgabe geprüft
    { const q = G.genVektorAB(lv), r = grund('genVektorAB', q, lv), tag = `genVektorAB (Stufe ${lv})`, P = punkte(q.formula), A = P.A, v = spalte(r.tex), B = A.map((c, j) => c + v[j]); ketten('genVektorAB', q, lv);
      ok(v.every((c, j) => c === r.vec[j]) && A.every((c, j) => c === q.A[j]) && B.every((c, j) => nah(c, q.B[j], 1e-12)), `${tag}: Rechenform passt zur Anzeige`);
      if (lv <= 3) ok(P.B.every((c, j) => c - A[j] === v[j]) && A.length === (lv === 1 ? 2 : 3), `${tag}: B − A`);
      else if (P.M) ok(P.M.every((c, j) => nah(c, (A[j] + B[j]) / 2, 1e-12)), `${tag}: M ist der Mittelpunkt von A und B`);
      else if (P.T) { const [, m1, m2] = formeln(q.prompt).join(' ').match(/=(\d+):(\d+)/); ok(P.T.every((c, j) => nah((c - A[j]) * +m2, (B[j] - c) * +m1, 1e-12)), `${tag}: T teilt AB im genannten Verhältnis`); }
      else ok(P.S.every((c, j) => nah(c, (A[j] + B[j] + P.C[j]) / 3, 1e-12)), `${tag}: S ist der Schwerpunkt von ABC`);
      for (const o of q.options) { ok(spalte(o.tex).every((c, j) => c === o.vec[j]), `${tag}: Rechenform der Antwort passt zur Anzeige`); if (!o.correct) ok(o.vec.some((c, j) => Math.abs(c - v[j]) > 1e-9), `${tag}: Ablenker verschieden`); } }

    // ── Betrag: Vektor aus den Angaben neu gebildet
    { const q = G.genBetrag(lv), r = grund('genBetrag', q, lv), tag = `genBetrag (Stufe ${lv})`, P = punkte(q.formula), V = vektoren(q.formula); ketten('genBetrag', q, lv);
      let v;
      if (P.A) v = P.B.map((c, j) => c - P.A[j]);
      else if (V.v) v = V.v;
      else { const m = formeln(q.prompt).join(' ').match(/\\vec v=(-?\d+)\\vec u([+-]\d+)\\vec w/); v = V.u.map((c, j) => +m[1] * c + +m[2] * V.w[j]); }
      const soll = Math.hypot(...v);
      ok(v.every((c, j) => c === q.v[j]) && nah(r.num, soll, 1e-12) && Math.abs(zahl(r.tex) - soll) < 0.00501, `${tag}: Länge stimmt (${q.formula} → ${r.tex})`);
      ok(r.tex.startsWith('\\approx') === !Number.isInteger(Math.round(soll * 1e6) / 1e6) && (lv <= 3) === Number.isInteger(r.num), `${tag}: glatt bis Stufe 3, krumm ab Stufe 4`);
      ok(lv !== 1 || (soll <= 7 && v.every((c) => c >= 0)), `${tag}: Stufe 1 klein und ohne Minus`); ok(lv !== 5 || soll >= 11, `${tag}: Stufe 5 lang`);
      for (const o of q.options) { ok(Math.abs(zahl(o.tex) - o.num) < 0.00501, `${tag}: Rechenform der Antwort passt zur Anzeige`); if (!o.correct) ok(Math.abs(o.num - soll) > 0.1, `${tag}: Ablenker deutlich verschieden`); } }

    // ── Skalarprodukt: bei Stufe 5 über das Ausmultiplizieren der Klammern geprüft
    { const q = G.genSkalar(lv), r = grund('genSkalar', q, lv), tag = `genSkalar (Stufe ${lv})`, P = punkte(q.formula), V = vektoren(q.formula); ketten('genSkalar', q, lv);
      let soll;
      if (P.A) soll = skal(P.B.map((c, j) => c - P.A[j]), P.C.map((c, j) => c - P.A[j]));
      else if (V.u) soll = skal(V.u, V.v);
      else { const kf = (t) => (t === '' || t === '+' ? 1 : t === '-' ? -1 : +t.replace('{,}', '.')), m = formeln(q.prompt).join(' ').match(/\\left\((-?[\d{},]*)\\vec a([+-][\d{},]*)\\vec b\\right\)\\cdot\\left\((-?[\d{},]*)\\vec a([+-][\d{},]*)\\vec b\\right\)/);
        const [rr, ss, tt, ww] = m.slice(1).map(kf), { a, b } = V; soll = rr * tt * skal(a, a) + (rr * ww + ss * tt) * skal(a, b) + ss * ww * skal(b, b); }
      ok(nah(r.num, soll, 1e-12) && nah(zahl(r.tex), soll, 1e-12) && r.num === skal(q.u, q.v), `${tag}: Wert stimmt (${q.formula} → ${r.tex}, soll ${soll})`);
      ok(lv !== 1 || (V.u.length === 2 && [...V.u, ...V.v].every((c) => c > 0)), `${tag}: Stufe 1 in der Ebene mit positiven Zahlen`);
      for (const o of q.options) { ok(nah(zahl(o.tex), o.num, 1e-12), `${tag}: Rechenform der Antwort passt zur Anzeige`); if (!o.correct) ok(Math.abs(o.num - soll) > 0.01, `${tag}: Ablenker verschieden`); } }

    for (const name of ['genMix', 'genExtremaMix', 'genIntegralMix', 'genStochastikMix', 'genGeometrieMix']) { const q = G[name](lv); ok(q.prompt && q.gen && q.topic, `${name} (Stufe ${lv}) liefert eine Aufgabe mit Art und Thema`); }
  }
}
seedRandom(null);

// Abwechslung: Jede Stufe liefert viele verschiedene Aufgaben, und die Stufen sind eigene Formen.
for (const name of ['genScheitel', 'genPolynom', 'genKette', 'genExp', 'genProdukt', 'genExtremstellen', 'genHochTief', 'genStammfunktion', 'genIntegral', 'genErwartung', 'genBinomial', 'genBaum', 'genVektorAB', 'genBetrag', 'genSkalar']) {
  const sätze = LV.map((lv) => { const s = new Set(); for (let i = 0; i < 300; i++) { const q = G[name](lv); s.add(`${q.prompt}|${q.formula ?? ''}|${q.options.find((o) => o.correct).tex}`); } return s; });
  sätze.forEach((s, j) => ok(s.size >= (j === 0 ? 6 : name === 'genScheitel' || name === 'genBetrag' || j === 1 ? 12 : 20), `${name} (Stufe ${j + 1}): genug verschiedene Aufgaben (${s.size})`));
  for (let j = 1; j < 5; j++) ok([...sätze[j]].filter((k) => sätze[j - 1].has(k)).length <= 0.5 * sätze[j].size, `${name}: Stufe ${j + 1} stellt andere Aufgaben als Stufe ${j}`);
}

if (fails) { console.error(`hart/gen1: ${fails} verschiedene Fehler bei ${n} Prüfungen`); process.exit(1); }
console.log(`hart/gen1: ${n} Prüfungen bestanden`);
