// Selbstprüfung ohne Browser: Aufgaben-Erzeuger (alle Schwierigkeiten), Spiel-Logik und Serien-Regel.
globalThis.window = { katex: { renderToString: (s) => s } };
const G = await import('../app/js/gen.js');
const H = await import('../app/js/gen2.js');
const { nDeriv, polyTex, vertexTex, lineTex, fmt } = await import('../app/js/math.js');
const { LEVELS: MB, simulate } = await import('../app/js/games/murmelbahn.js');
const { LEVELS: TG, hit } = await import('../app/js/games/tangente.js');
const { ROUNDS: ZR, grade, colX } = await import('../app/js/games/zeichnen.js');
const { POOL } = await import('../app/js/games/paare.js');
const { LEVELS: FL, sums, gap } = await import('../app/js/games/flaeche.js');
const { MISSIONS: LB, solved } = await import('../app/js/games/labor.js');
const { MISSIONS: LO, goal, endPoint } = await import('../app/js/games/lotse.js');
const { nextStreak, store } = await import('../app/js/store.js');
const { UNITS, AREAS } = await import('../app/js/units.js');

let fails = 0, n = 0;
const seen = new Set();
const ok = (cond, msg) => { n++; if (!cond && !seen.has(msg)) { seen.add(msg); fails++; console.error('FEHLER:', msg); } };
const XS = [-1.3, -0.4, 0.7, 1.9];
const close = (a, b) => Math.abs(a - b) < 1e-3 * (1 + Math.abs(a) + Math.abs(b));
const LV = [1, 2, 3, 4, 5], REP = 120;
const simpson = (f, a, b, m = 200) => { const hh = (b - a) / m; let s = f(a) + f(b); for (let i = 1; i < m; i++) s += f(a + i * hh) * (i % 2 ? 4 : 2); return (s * hh) / 3; };

// Gemeinsame Regeln für Auswahl-Aufgaben
function basics(name, q, lv) {
  const tag = `${name} (Stufe ${lv})`;
  const right = q.options.filter((o) => o.correct);
  ok(right.length === 1 && q.options.length >= 3, `${tag}: genau eine richtige Antwort`);
  ok(new Set(q.options.map((o) => o.tex)).size === q.options.length, `${tag}: Antworten verschieden`);
  for (const o of q.options) if (!o.correct) ok(typeof o.why === 'string' && o.why.length > 10, `${tag}: jeder Ablenker hat eine Diagnose`);
  ok(q.hints.length >= 2 && q.explain && q.prompt, `${tag}: Tipps, Erklärung, Frage`);
  ok(!/undefined|NaN/.test(JSON.stringify([q.prompt, q.formula, q.explain, q.hints, q.options.map((o) => [o.tex, o.why])])), `${tag}: kein „undefined"/„NaN" im Text`);
  return right[0];
}

// 1) Formel-Ausgabe
ok(polyTex([5, 0, -2, 0, 3]) === '3x^{4}-2x^{2}+5', 'polyTex');
ok(polyTex([0, -1]) === '-x' && polyTex([0]) === '0', 'polyTex Sonderfälle');
ok(vertexTex(1, -1, 1) === '(x+1)^2+1' && vertexTex(-0.5, 2, 0) === '-0{,}5(x-2)^2' && vertexTex(2, 0, -3) === '2x^2-3', 'vertexTex');
ok(lineTex(-0.5, 4) === '-0{,}5x+4' && lineTex(0, 2) === '2' && lineTex(1, 0) === 'x', 'lineTex');
ok(fmt(-0.001) === '0' && fmt(1.5) === '1,5', 'fmt');

for (const lv of LV) for (let i = 0; i < REP; i++) {
  // 2) Ableiten: richtige Antwort stimmt numerisch, Ablenker sind wirklich falsch
  for (const name of ['genPolynom', 'genKette', 'genExp', 'genProdukt']) {
    const q = G[name](lv), r = basics(name, q, lv);
    ok(XS.every((x) => close(r.val(x), nDeriv(q.f, x))), `${name} (Stufe ${lv}): richtige Ableitung (${q.formula})`);
    for (const o of q.options) if (!o.correct) ok(XS.some((x) => !close(o.val(x), nDeriv(q.f, x))), `${name} (Stufe ${lv}): Ablenker ist falsch (${q.formula} → ${o.tex})`);
  }
  { const q = G.genPotenzLuecke(lv);
    ok(q.slots.every((s) => s.choices.includes(s.correct) && new Set(s.choices).size === s.choices.length && s.choices.length >= 2), `Lücke (Stufe ${lv}): Wahl vorhanden, keine Doppelten`);
    ok([0.7, 1.3, 2.1].every((x) => close(q.val(x), nDeriv(q.f, x)) && close(q.slots[0].correct * x ** q.slots[1].correct, q.val(x))), `Lücke (Stufe ${lv}): Lösung stimmt (${q.formula})`); }
  { const q = G.genScheitel(lv), r = basics('genScheitel', q, lv);
    ok(XS.every((x) => close(r.val(x), q.f(x))), `Scheitel (Stufe ${lv}): Gleichung passt zum Graphen`);
    for (const o of q.options) if (!o.correct) ok(XS.some((x) => !close(o.val(x), q.f(x))), `Scheitel (Stufe ${lv}): Ablenker passt nicht`);
    ok(close(q.graph.f(q.graph.mark[0]), q.graph.mark[1]), `Scheitel (Stufe ${lv}): markierter Punkt liegt auf dem Graphen`); }
  // 3) Extrempunkte
  { const q = G.genExtremstellen(lv), r = basics('genExtremstellen', q, lv);
    ok(r.xs.every((x) => Math.abs(nDeriv(q.f, x)) < 1e-4), `Extremstellen (Stufe ${lv}): Steigung dort 0 (${q.formula})`);
    for (const o of q.options) if (!o.correct) ok(o.xs.some((x) => Math.abs(nDeriv(q.f, x)) > 1e-3), `Extremstellen (Stufe ${lv}): Ablenker enthält falsche Stelle`); }
  { const q = G.genHochTief(lv), r = basics('genHochTief', q, lv);
    const d2 = (q.f(q.at + 1e-3) - 2 * q.f(q.at) + q.f(q.at - 1e-3)) / 1e-6;
    ok(Math.abs(nDeriv(q.f, q.at)) < 1e-4 && Math.abs(d2) > 1 && r.key === (d2 < 0 ? 'H' : 'T'), `HochTief (Stufe ${lv}): Art stimmt (${q.formula}, x=${q.at})`); }
  // 4) Integral
  { const q = G.genStammfunktion(lv), r = basics('genStammfunktion', q, lv);
    ok(XS.every((x) => close(nDeriv(r.val, x), q.f(x))), `Stammfunktion (Stufe ${lv}): F' = f (${q.formula})`);
    for (const o of q.options) if (!o.correct) ok(XS.some((x) => !close(nDeriv(o.val, x), q.f(x))), `Stammfunktion (Stufe ${lv}): Ablenker ist keine Stammfunktion`); }
  { const q = G.genIntegral(lv), r = basics('genIntegral', q, lv);
    ok(close(r.num, simpson(q.f, q.a, q.b)), `Integral (Stufe ${lv}): Wert stimmt (${q.formula})`);
    for (const o of q.options) if (!o.correct) ok(!close(o.num, r.num), `Integral (Stufe ${lv}): Ablenker verschieden`); }
  // 5) Stochastik
  { const q = G.genErwartung(lv), r = basics('genErwartung', q, lv);
    const want = q.askSigma ? Math.sqrt(q.n * q.p * (1 - q.p)) : q.n * q.p;
    ok(Math.abs(r.num - want) < 0.006, `Erwartung (Stufe ${lv}): Wert stimmt (n=${q.n}, p=${q.p})`);
    for (const o of q.options) if (!o.correct) ok(Math.abs(o.num - want) > 0.006, `Erwartung (Stufe ${lv}): Ablenker verschieden`); }
  { const q = G.genBinomial(lv), r = basics('genBinomial', q, lv);
    let want;
    if (q.kind === 'min1') want = 1 - (1 - q.p) ** q.n;
    else { let c = 1; for (let j = 1; j <= q.k; j++) c = (c * (q.n - q.k + j)) / j; want = c * q.p ** q.k * (1 - q.p) ** (q.n - q.k); }
    ok(Math.abs(r.num - want) < 1e-9, `Binomial (Stufe ${lv}): Wert stimmt`);
    for (const o of q.options) if (!o.correct) ok(Math.abs(o.num - want) > 1e-6 * want, `Binomial (Stufe ${lv}): Ablenker verschieden (n=${q.n}, p=${q.p}, k=${q.k})`); }
  { const q = G.genBaum(lv), r = basics('genBaum', q, lv);
    const N = q.r + q.b;
    const want = q.versch ? (2 * q.r * q.b) / (N * (N - 1)) : q.ohne ? (q.r * (q.r - 1)) / (N * (N - 1)) : (q.r * q.r) / (N * N);
    ok(Math.abs(r.num - want) < 1e-9 && r.num > 0 && r.num < 1, `Baum (Stufe ${lv}): Wert stimmt`);
    for (const o of q.options) if (!o.correct) ok(Math.abs(o.num - want) > 1e-7, `Baum (Stufe ${lv}): Ablenker verschieden`); }
  // 6) Geometrie
  { const q = G.genVektorAB(lv), r = basics('genVektorAB', q, lv);
    ok(r.vec.every((c, j) => c === q.B[j] - q.A[j]), `VektorAB (Stufe ${lv}): B−A`);
    for (const o of q.options) if (!o.correct) ok(o.vec.some((c, j) => c !== q.B[j] - q.A[j]), `VektorAB (Stufe ${lv}): Ablenker verschieden`); }
  { const q = G.genBetrag(lv), r = basics('genBetrag', q, lv);
    ok(close(r.num, Math.hypot(...q.v)), `Betrag (Stufe ${lv}): Länge stimmt`);
    for (const o of q.options) if (!o.correct) ok(!close(o.num, r.num), `Betrag (Stufe ${lv}): Ablenker verschieden`); }
  { const q = G.genSkalar(lv), r = basics('genSkalar', q, lv);
    const dot = q.u.reduce((s, c, j) => s + c * q.v[j], 0);
    ok(r.num === dot, `Skalar (Stufe ${lv}): Wert stimmt`);
    for (const o of q.options) if (!o.correct) ok(o.num !== dot, `Skalar (Stufe ${lv}): Ablenker verschieden`); }
  for (const name of ['genMix', 'genExtremaMix', 'genIntegralMix', 'genStochastikMix', 'genGeometrieMix']) ok(G[name](lv).prompt, `${name} (Stufe ${lv}) liefert Aufgabe`);
}

// 6b) Teil 2 der Erzeuger: Kurvendiskussion, Anwendungen, Stochastik-Vertiefung, Geraden/Ebenen, Operatoren
const d2 = (f, x, e = 1e-3) => (f(x + e) - 2 * f(x) + f(x - e)) / (e * e);
const dotp = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const crossp = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const bin = (m, k) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (m - k + i)) / i; return r; };
const pmfT = (m, p, k) => bin(m, k) * p ** k * (1 - p) ** (m - k);
const sumP = (m, p, lo, hi) => { let s = 0; for (let k = Math.max(0, lo); k <= Math.min(m, hi); k++) s += pmfT(m, p, k); return s; };
const factT = (m) => (m <= 1 ? 1 : m * factT(m - 1));
const POS = [0.7, 1.3, 2.9];
for (const lv of LV) for (let i = 0; i < REP; i++) {
  const T = (name) => { const q = H[name](lv); return [q, basics(name, q, lv), `${name} (Stufe ${lv})`]; };
  { const [q, r, tag] = T('genWendestelle');
    ok(Math.abs(d2(q.f, r.x)) < 1e-3, `${tag}: f'' = 0 an der Stelle (${q.formula})`);
    for (const o of q.options) if (!o.correct) ok(Math.abs(d2(q.f, o.x)) > 0.5, `${tag}: Ablenker ist keine Wendestelle`); }
  { const [q, r, tag] = T('genMonotonie');
    const good = (x) => (q.steigt ? nDeriv(q.f, x) > 0 : nDeriv(q.f, x) < 0);
    ok(r.samples.every(good), `${tag}: richtige Antwort passt`);
    for (const o of q.options) if (!o.correct) ok(o.samples.some((x) => !good(x)), `${tag}: Ablenker enthält falschen Bereich`); }
  { const [q, r, tag] = T('genSymmetrie');
    const even = XS.every((x) => close(q.f(-x), q.f(x))), odd = XS.every((x) => close(q.f(-x), -q.f(x)));
    ok(r.key === (even ? 'even' : odd ? 'odd' : 'none'), `${tag}: Symmetrie stimmt (${q.formula})`); }
  { const [q, r, tag] = T('genGrenzwert');
    const v = q.f(1e7);
    ok(Number.isFinite(r.num) ? Math.abs(v - r.num) < 1e-3 : Math.abs(v) > 1e4 && Math.sign(v) === Math.sign(r.num), `${tag}: Grenzwert stimmt (${q.formula})`);
    for (const o of q.options) if (!o.correct) ok(Number.isFinite(o.num) ? Math.abs(v - o.num) > 1e-2 : !(Math.abs(v) > 1e4 && Math.sign(v) === Math.sign(o.num)), `${tag}: Ablenker verschieden`); }
  { const [q, r, tag] = T('genTangente');
    const isT = (o) => close(o.val(q.x0), q.f(q.x0)) && close(o.val(q.x0 + 1) - o.val(q.x0), nDeriv(q.f, q.x0));
    ok(isT(r), `${tag}: Tangente berührt und hat die richtige Steigung (${q.formula})`);
    for (const o of q.options) if (!o.correct) ok(!isT(o), `${tag}: Ablenker ist keine Tangente`); }
  { const [q, r, tag] = T('genSteckbrief');
    const want = { extrem: ['f', 'f1'], wende: ['f', 'f2'], tangente: ['f', 'f1'] }[q.kind];
    ok(r.conds.map((c) => c.split(':')[0]).join() === want.join() && r.conds.join() === q.expect.join(), `${tag}: Bedingungen passen zur Art`);
    ok(new Set(q.options.map((o) => o.conds.join('|'))).size === 4, `${tag}: Bedingungen verschieden`); }
  { const [q, r, tag] = T('genSchar');
    const k = 1.7, f = q.f(k);
    const isMin = (o) => { const [x, y] = o.fn(k); return Math.abs(nDeriv(f, x)) < 1e-3 && close(f(x), y) && d2(f, x) > 0; };
    ok(isMin(r), `${tag}: Tiefpunkt stimmt (${q.formula})`);
    for (const o of q.options) if (!o.correct) ok(!isMin(o), `${tag}: Ablenker ist kein Tiefpunkt`); }
  { const [q, r, tag] = T('genExtremwert');
    let best = q.lo, bv = -Infinity;
    for (let x = q.lo; x <= q.hi; x += (q.hi - q.lo) / 6000) if (q.obj(x) > bv) { bv = q.obj(x); best = x; }
    ok(Math.abs(best - r.num) < (q.hi - q.lo) / 1000, `${tag}: Maximum liegt bei der richtigen Stelle`);
    for (const o of q.options) if (!o.correct) ok(q.obj(o.num) < bv - 1e-6, `${tag}: Ablenker ist schlechter`); }
  { const [q, r, tag] = T('genLn');
    ok(POS.every((x) => close(r.val(x), nDeriv(q.f, x))), `${tag}: Ableitung stimmt (${q.formula})`);
    for (const o of q.options) if (!o.correct) ok(POS.some((x) => !close(o.val(x), nDeriv(q.f, x))), `${tag}: Ablenker ist falsch`); }
  { const [q, r, tag] = T('genWachstum');
    if (q.kind === 'zeit') { ok(close(Math.exp(q.k * r.num), q.factor), `${tag}: Zeit stimmt`); for (const o of q.options) if (!o.correct) ok(!close(Math.exp(q.k * o.num), q.factor), `${tag}: Ablenker falsch`); }
    else { ok([1, 40].every((tt) => close(r.val(tt), q.N0 * q.a ** tt)), `${tag}: Funktion stimmt`); for (const o of q.options) if (!o.correct) ok([1, 40].some((tt) => Math.abs(o.val(tt) - q.N0 * q.a ** tt) > 0.02 * q.N0), `${tag}: Ablenker falsch`); } }
  { const [q, r, tag] = T('genFlaecheZwischen');
    ok(close(r.num, (q.r2 - q.r1) ** 3 / 6) && close(q.f(q.r1), q.g(q.r1)) && close(q.f(q.r2), q.g(q.r2)) && q.g((q.r1 + q.r2) / 2) > q.f((q.r1 + q.r2) / 2), `${tag}: Fläche und Schnittstellen stimmen`);
    for (const o of q.options) if (!o.correct) ok(!close(o.num, r.num), `${tag}: Ablenker verschieden`); }
  { const [q, r, tag] = T('genVierfelder');
    const want = { schnitt: q.a / q.N, A: (q.a + q.b) / q.N, bedingt: q.a / (q.a + q.c), bedingtA: q.b / (q.a + q.b) }[q.kind];
    ok(close(r.num, want) && q.a + q.b + q.c + q.d === q.N, `${tag}: Wert stimmt`);
    for (const o of q.options) if (!o.correct) ok(!close(o.num, want), `${tag}: Ablenker verschieden`); }
  { const [q, r, tag] = T('genBedingt'); ok(close(r.num, q.TP / (q.TP + q.FP)), `${tag}: Wert stimmt`); for (const o of q.options) if (!o.correct) ok(!close(o.num, r.num), `${tag}: Ablenker verschieden`); }
  { const [q, r, tag] = T('genKumuliert');
    const want = sumP(q.n, q.p, q.lo, q.hi);
    ok(Math.abs(r.num - want) < 1e-9, `${tag}: Wert stimmt (n=${q.n}, ${q.lo}..${q.hi})`);
    for (const o of q.options) if (!o.correct) ok(Math.abs(o.num - want) > 1e-12, `${tag}: Ablenker verschieden`); }
  { const [q, r, tag] = T('genSigma');
    const mu = q.n * q.p, sg = Math.sqrt(q.n * q.p * (1 - q.p));
    ok(close(r.lo, mu - q.k * sg) && close(r.hi, mu + q.k * sg), `${tag}: Intervall stimmt`);
    for (const o of q.options) if (!o.correct) ok(!close(o.lo, r.lo), `${tag}: Ablenker verschieden`); }
  { const [q, r, tag] = T('genHypothese');
    if (q.kind === 'begriff') ok(r.key === q.expect, `${tag}: Begriff stimmt`);
    else { let k = 0; while (sumP(q.n, q.p0, k, q.n) > q.al) k++; ok(r.lo === k && r.hi === q.n, `${tag}: Ablehnungsbereich stimmt (n=${q.n}, p0=${q.p0}, α=${q.al})`); for (const o of q.options) if (!o.correct) ok(o.lo !== k || o.hi !== q.n, `${tag}: Ablenker verschieden`); } }
  { const [q, r, tag] = T('genNormal');
    if (q.kind === 'z') { ok(close(r.num, (q.x - q.mu) / q.sg), `${tag}: z stimmt`); for (const o of q.options) if (!o.correct) ok(!close(o.num, r.num), `${tag}: Ablenker verschieden`); }
    else { const z = (q.x - q.mu) / q.sg, erf = (x) => { const tt = 1 / (1 + 0.3275911 * Math.abs(x)); const y = 1 - ((((1.061405429 * tt - 1.453152027) * tt + 1.421413741) * tt - 0.284496736) * tt + 0.254829592) * tt * Math.exp(-x * x); return x >= 0 ? y : -y; };
      ok(Math.abs(r.num - 0.5 * (1 + erf(z / Math.SQRT2))) < 2e-3, `${tag}: Wahrscheinlichkeit stimmt`); for (const o of q.options) if (!o.correct) ok(Math.abs(o.num - r.num) > 0.01, `${tag}: Ablenker verschieden`); } }
  { const [q, r, tag] = T('genKombinatorik');
    const want = { perm: factT(q.n), var: factT(q.n) / factT(q.n - q.k), komb: bin(q.n, q.k), mitW: q.n ** q.k }[q.kind];
    ok(close(r.num, want), `${tag}: Anzahl stimmt (${q.kind}, n=${q.n}, k=${q.k})`); for (const o of q.options) if (!o.correct) ok(!close(o.num, want), `${tag}: Ablenker verschieden`); }
  { const [q, r, tag] = T('genGeradePunkt');
    const i0 = q.u.findIndex((c) => c !== 0), tt = (q.Q[i0] - q.P[i0]) / q.u[i0], on = q.P.every((c, j) => close(c + tt * q.u[j], q.Q[j]));
    ok(on ? r.t === tt : r.t === null, `${tag}: Punktprobe stimmt`); ok(new Set(q.options.map((o) => String(o.t))).size === 4, `${tag}: Antworten verschieden`); }
  { const [q, r, tag] = T('genEbene'); ok(dotp(q.n, r.vec) === q.d, `${tag}: Punkt liegt in der Ebene`); for (const o of q.options) if (!o.correct) ok(dotp(q.n, o.vec) !== q.d, `${tag}: Ablenker liegt nicht in der Ebene`); }
  { const [q, r, tag] = T('genLage');
    const n = crossp(q.u, q.v), PQ = q.Q.map((c, j) => c - q.P[j]), zeroV = (v) => v.every((c) => c === 0);
    const want = zeroV(n) ? (zeroV(crossp(PQ, q.u)) ? 'identisch' : 'parallel') : dotp(PQ, n) === 0 ? 'schnitt' : 'windschief';
    ok(r.key === want && q.kind === want, `${tag}: Lage stimmt (${q.kind} / berechnet ${want})`); }
  { const [q, r, tag] = T('genSchnittpunkt');
    const onLine = (X) => { const w = X.map((c, j) => c - q.P[j]); return crossp(w, q.u).every((c) => c === 0); };
    ok(dotp(q.n, r.vec) === q.d && onLine(r.vec), `${tag}: Schnittpunkt liegt auf g und in E`);
    for (const o of q.options) if (!o.correct) ok(dotp(q.n, o.vec) !== q.d, `${tag}: Ablenker liegt nicht in E`); }
  { const [q, r, tag] = T('genAbstand');
    const want = q.kind === 'punkte' ? Math.hypot(...q.A.map((c, j) => c - q.B[j])) : Math.abs(dotp(q.n, q.P) - q.d) / Math.hypot(...q.n);
    ok(close(r.num, want), `${tag}: Abstand stimmt`); for (const o of q.options) if (!o.correct) ok(!close(o.num, want), `${tag}: Ablenker verschieden`); }
  { const [q, r, tag] = T('genWinkel'); const want = dotp(q.u, q.v) / (Math.hypot(...q.u) * Math.hypot(...q.v));
    ok(close(r.num, want) && Math.abs(want) < 1, `${tag}: cos stimmt`); for (const o of q.options) if (!o.correct) ok(!close(o.num, want), `${tag}: Ablenker verschieden`); }
  { const [q, r, tag] = T('genKreuz'); const c = crossp(q.u, q.v);
    ok(r.vec.every((x, j) => x === c[j]) && dotp(c, q.u) === 0 && dotp(c, q.v) === 0, `${tag}: Kreuzprodukt stimmt`); for (const o of q.options) if (!o.correct) ok(o.vec.some((x, j) => x !== c[j]), `${tag}: Ablenker verschieden`); }
  { const [q, r, tag] = T('genOperator'); ok(r.key === q.expect && new Set(q.options.map((o) => o.key)).size === 4, `${tag}: Operator stimmt`); }
}
for (const fn of [...Object.values(G), ...Object.values(H)]) if (typeof fn === 'function' && /^gen/.test(fn.name) && !/Mix$/.test(fn.name)) ok(typeof fn.topic === 'string', `${fn.name}: hat einen Themen-Namen`);

// 7) Murmelbahn: Ziel-Parameter sind einstellbar und gewinnen; die Startwerte gewinnen nicht.
MB.forEach((L, i) => {
  const K = { line: (p, x) => p.m * x + p.b, par: (p, x) => p.a * (x - p.d) ** 2 + p.e }[L.kind];
  const stars = L.starsX.map((x) => [x, K(L.target, x)]);
  ok(stars.every(([x, y]) => x > -6 && x < 6 && y > -1.5 && y < 9.5), `Murmelbahn ${i + 1}: Sterne im Bild`);
  for (const q of L.params) {
    const t = L.target[q.k];
    ok(t >= q.min && t <= q.max && Math.abs((t - q.min) / q.step - Math.round((t - q.min) / q.step)) < 1e-9, `Murmelbahn ${i + 1}: Ziel ${q.k}=${t} mit dem Regler erreichbar`);
  }
  ok(simulate(L.kind, L.target, stars).reason === 'win', `Murmelbahn ${i + 1}: Zielkurve gewinnt`);
  const init = { ...(L.fixed || {}) }; L.params.forEach((q) => { init[q.k] = q.init; });
  ok(simulate(L.kind, init, stars).reason !== 'win', `Murmelbahn ${i + 1}: Startwerte gewinnen nicht`);
});

// 8) Tangenten-Surfer: Ableitung stimmt, jede Mission ist auf jeder Stufe im Bild lösbar.
TG.forEach((L, i) => {
  ok([-2, -0.5, 1.3].every((x) => close(L.d(x), nDeriv(L.f, x))), `Surfer ${i + 1}: Ableitung stimmt`);
  for (const lv of LV) L.missions.forEach((M, j) => {
    let solvable;
    if (M.type === 'zero') solvable = M.xs.every((t, k) => Math.abs(L.d(t)) < 1e-9 && hit(L, M, t, new Set(), lv) === k && t > L.view.x0 && t < L.view.x1);
    else if (M.type === 'at') solvable = hit(L, M, M.xs[0], new Set(), lv) === 0 && Math.abs(nDeriv(L.d, M.xs[0])) < 1e-3;
    else { solvable = false; for (let x = L.view.x0 + 0.1; x <= L.view.x1 - 0.1; x += 0.01) if (hit(L, M, x, new Set(), lv) === 0) solvable = true; }
    ok(solvable, `Surfer ${i + 1}, Mission ${j + 1}, Stufe ${lv}: lösbar`);
  });
});

// 9) Ableitung zeichnen
ZR.forEach((R, i) => {
  ok([-3, -1, 0.5, 2].every((x) => close(R.d(x), nDeriv(R.f, x))), `Zeichnen ${i + 1}: Ableitung stimmt`);
  const perfect = Float32Array.from({ length: 161 }, (_, k) => Math.max(-2.4, Math.min(2.4, R.d(colX(k)))));
  for (const lv of LV) ok(grade(R, perfect, lv).stars === 3, `Zeichnen ${i + 1}: perfekte Skizze gibt 3 Sterne (Stufe ${lv})`);
  const g = grade(R, perfect.map((y) => -y));
  ok(g.stars === 0 && g.wrong, `Zeichnen ${i + 1}: gespiegelte Skizze fällt durch und nennt die Stelle`);
  ok(grade(R, new Float32Array(161).fill(NaN)).stars === 0, `Zeichnen ${i + 1}: leere Skizze`);
  const rough = perfect.map((y, k) => y + 0.2 * Math.sin(k));
  ok(grade(R, rough, 3).stars >= 2 && grade(R, rough, 1).stars >= grade(R, rough, 5).stars, `Zeichnen ${i + 1}: wackelige Skizze – leichter ist milder`);
});

// 10) Graphen-Paare
POOL.forEach((P, i) => ok([-2, -0.7, 0.4, 1.8].every((x) => close(P.d(x), nDeriv(P.f, x))), `Paare ${i + 1}: Ableitung stimmt`));
for (let i = 0; i < POOL.length; i++) for (let j = i + 1; j < POOL.length; j++)
  ok([-2, -0.7, 0.4, 1.8].some((x) => Math.abs(POOL[i].d(x) - POOL[j].d(x)) > 0.3), `Paare ${i + 1}/${j + 1}: Ableitungen unterscheidbar`);

// 11) Fläche füllen: Fläche stimmt, liegt zwischen den Summen, Ziel ist mit dem Regler erreichbar
FL.forEach((L, i) => {
  ok(close(L.area, simpson(L.f, L.a, L.b)), `Fläche ${i + 1}: angegebene Fläche stimmt`);
  for (const k of [1, 3, 10, 40]) { const s = sums(L, k); ok(s.lo <= L.area + 1e-9 && s.hi >= L.area - 1e-9, `Fläche ${i + 1}: Fläche zwischen Unter- und Obersumme (n=${k})`); }
  for (const lv of LV) { const s = sums(L, 60), s2 = sums(L, 2); ok(s.hi - s.lo <= gap(lv) && s2.hi - s2.lo > gap(lv), `Fläche ${i + 1}: Ziel erreichbar, aber nicht von Anfang an (Stufe ${lv})`); }
  const r = sums(L, 3); ok(!close(r.lo, L.area) && !close(r.hi, L.area) && !close(r.lo, r.hi), `Fläche ${i + 1}: Antwortmöglichkeiten verschieden`);
});

// 12) Zufalls-Labor: Lösung einstellbar, Startwerte lösen nicht
LB.forEach((M, i) => {
  ok(solved(M, M.sol.n, M.sol.p), `Labor ${i + 1}: Lösung wird erkannt`);
  ok(M.sol.n >= 4 && M.sol.n <= 20 && Math.abs(M.sol.p / 0.05 - Math.round(M.sol.p / 0.05)) < 1e-9 && M.sol.p >= 0.1 && M.sol.p <= 0.9, `Labor ${i + 1}: Lösung mit den Reglern einstellbar`);
  ok(!solved(M, M.fix.n ?? M.init.n, M.fix.p ?? M.init.p), `Labor ${i + 1}: Startwerte lösen nicht`);
  ok(M.target <= M.sol.n, `Labor ${i + 1}: Ziel im Diagramm`);
});

// 13) Vektor-Lotse: Lösung einstellbar, Ziel im Bild, Start löst nicht
LO.forEach((M, i) => {
  const B = goal(M), E = endPoint(M, M.sol[0], M.sol[1]);
  ok(E[0] === B[0] && E[1] === B[1], `Lotse ${i + 1}: Lösung trifft das Ziel`);
  const lim = M.type === 'vec' ? 8 : 3;
  ok(M.sol.every((c) => Number.isInteger(c) && Math.abs(c) <= lim), `Lotse ${i + 1}: Lösung mit den Reglern einstellbar`);
  ok(B.every((c) => Math.abs(c) <= 5) && M.A.every((c) => Math.abs(c) <= 5), `Lotse ${i + 1}: Start und Ziel im Bild`);
  ok(!(M.A[0] === B[0] && M.A[1] === B[1]), `Lotse ${i + 1}: Start ist nicht das Ziel`);
  if (M.type === 'combo') { let cnt = 0; for (let a = -3; a <= 3; a++) for (let b = -3; b <= 3; b++) { const P = endPoint(M, a, b); if (P[0] === B[0] && P[1] === B[1]) cnt++; } ok(cnt === 1, `Lotse ${i + 1}: genau eine Lösung`); }
});

// 13b) Extremwert-Werkstatt: Lösung ist das Maximum auf dem Regler und einstellbar
const { LEVELS: WK } = await import('../app/js/games/werkstatt.js');
WK.forEach((L, i) => {
  let best = null, bv = -Infinity;
  for (let x = L.min; x <= L.max + 1e-9; x += L.step) if (L.obj(x) > bv + 1e-9) { bv = L.obj(x); best = +x.toFixed(6); }
  ok(best === L.sol, `Werkstatt ${i + 1}: Lösung ist das Maximum (${best})`);
  ok(L.init !== L.sol && L.obj(L.sol) < L.view.y1 && L.max < L.view.x1, `Werkstatt ${i + 1}: Start ist nicht die Lösung, Kurve im Bild`);
});

// 13c) Raum-Blick: Blickrichtung berechenbar, Antworten rechnerisch richtig
const { MISSIONS: RM, lookAlong, alignment } = await import('../app/js/games/raum.js');
RM.forEach((M, i) => {
  if (M.type === 'look') { const a = lookAlong(M.lines[0].u); ok(alignment(M.lines[0].u, a.yaw, a.pitch) > 0.9999 && alignment(M.lines[0].u, -0.9, 0.45) < 0.985, `Raum ${i + 1}: Blick entlang der Geraden erkennbar, Start löst nicht`); }
  else { const [g1, g2] = M.lines, n = crossp(g1.u, g2.u), PQ = g2.P.map((c, j) => c - g1.P[j]);
    const want = n.every((c) => c === 0) ? 'parallel' : dotp(PQ, n) === 0 ? 'schnitt' : 'windschief';
    ok(M.answer === want, `Raum ${i + 1}: Antwort stimmt (${want})`); }
});

// 13d) Runden: gleiche Aufgaben bei gleichem Startwert, nur Auswahl-Aufgaben, Notenpunkte, Punktzahl
const EX = await import('../app/js/exam.js');
{ const sig = (ts) => JSON.stringify(ts.map((q) => [q.gen, q.formula, q.prompt, q.options.map((o) => o.tex)]));
  ok(sig(EX.makeTasks(6, 3, 20261113)) === sig(EX.makeTasks(6, 3, 20261113)), 'Runde: gleicher Startwert → gleiche Aufgaben');
  ok(sig(EX.makeTasks(6, 3, 20261113)) !== sig(EX.makeTasks(6, 3, 20261114)), 'Runde: anderer Tag → andere Aufgaben');
  ok(sig(EX.makeTasks(6, 3)) !== sig(EX.makeTasks(6, 3)), 'Runde: ohne Startwert zufällig');
  const ts = EX.makeTasks(12, 4, 5);
  ok(new Set(ts.map((q) => q.area)).size === 3 && ts.every((q) => q.topic && q.gen && !q.type && q.options.length >= 3 && q.options.filter((o) => o.correct).length === 1), 'Runde: alle Gebiete, nur Auswahl-Aufgaben mit Thema');
  for (const lv of LV) for (const fn of Object.values(EX.POOL).flat()) { const q = fn(lv); ok(!q.type && !q.graph, `Runde: ${fn.name} ist reine Auswahl-Aufgabe`); }
  ok(EX.notenpunkte(100) === 15 && EX.notenpunkte(95) === 15 && EX.notenpunkte(94) === 14 && EX.notenpunkte(50) === 6 && EX.notenpunkte(45) === 5 && EX.notenpunkte(20) === 1 && EX.notenpunkte(19) === 0, 'Notenpunkte: Schwellen');
  ok(EX.scoreOf(4, 6, 6, 37.4) === 425 && EX.scoreOf(4, 6, 5, 60) === 400 && EX.scoreOf(0, 6, 6, 290) === 0 && EX.scoreOf(6, 6, 6, 100) === 700, 'Punktzahl: Zeit-Bonus nur für richtige Antworten und vollständige Runde');
  const A = EX.abiPlan('A', 'BY', 5), B = EX.abiPlan('B', 'HE-LK', 4), B2 = EX.abiPlan('B', 'HE-GK', 1);
  ok(A.lv <= 3 && B.lv === 5 && B.n > EX.abiPlan('B', 'HE-GK', 4).n && B2.lv >= 3, 'Abi-Plan: Teil A leichter, Leistungskurs umfangreicher'); }

// 13e) Fehler-Kartei, Statistik, Abi-Countdown, Tagesziel
{ const { KARTEI_TAGE } = await import('../app/js/store.js');
  const { dailyGoal } = await import('../app/js/extras.js');
  const D0 = new Date(2026, 10, 13, 12), plus = (n) => new Date(2026, 10, 13 + n, 12);
  store.reset(); store.kartePut('genKette', 'Kettenregel', D0);
  ok(store.karteDue(D0).length === 0 && store.karteDue(plus(1)).length === 1, 'Kartei: am nächsten Tag fällig');
  store.karteResult('genKette', true, plus(1));
  ok(store.karteDue(plus(3)).length === 0 && store.karteDue(plus(4)).length === 1, 'Kartei: nach richtiger Antwort 3 Tage Pause');
  store.karteResult('genKette', false, plus(4));
  ok(store.karteDue(plus(5)).length === 1, 'Kartei: nach falscher Antwort wieder am nächsten Tag');
  let day = 5; for (let s = 0; s < KARTEI_TAGE.length; s++) { store.karteResult('genKette', true, plus(day)); day += 30; }
  ok(store.karteCount === 0, 'Kartei: nach allen Stufen erledigt');
  store.record('Kettenregel', false); store.record('Kettenregel', false); store.record('Kettenregel', true); store.record('Betrag', true);
  ok(store.weak()[0]?.topic === 'Kettenregel' && store.weak().length === 1, 'Statistik: Schwäche erkannt, zu wenige Versuche zählen nicht');
  store.abi = '2027-05-05'; ok(store.abiDays(D0) === 173, 'Countdown: Tage bis zum Abi');
  store.abi = '2020-01-01'; ok(store.abiDays(D0) === null, 'Countdown: vergangener Termin');
  store.abi = 'quatsch'; ok(store.abi === '', 'Countdown: ungültiges Datum wird verworfen');
  store.land = 'HE-LK'; ok(store.land === 'HE-LK', 'Bundesland gespeichert'); store.land = 'XX'; ok(store.land === '', 'Bundesland: unbekannter Wert verworfen');
  ok(dailyGoal(70, 173) === 1 && dailyGoal(70, 14) === 5 && dailyGoal(70, 2) === 6 && dailyGoal(0, 10) === 0 && dailyGoal(10, null) === 0, 'Tagesziel');
  store.reset(); }

// 14) Lernpfad: eindeutige Kennungen, jedes Gebiet hat Einheiten, jeder Schritt ist startbar
ok(new Set(UNITS.map((u) => u.id)).size === UNITS.length, 'Einheiten: Kennungen eindeutig');
for (const a of AREAS) ok(UNITS.some((u) => u.area === a.id), `Gebiet ${a.title}: hat Einheiten`);
for (const u of UNITS) {
  ok(AREAS.some((a) => a.id === u.area), `Einheit ${u.id}: Gebiet bekannt`);
  ok(new Set(u.steps.map((s) => s.id)).size === u.steps.length && u.steps.every((s) => typeof s.run === 'function' && s.title && s.kind), `Einheit ${u.id}: Schritte vollständig`);
}

// 15) Schwierigkeit und Serie
store.level = 9; ok(store.level === 5, 'Schwierigkeit: nach oben begrenzt');
store.level = 0; ok(store.level === 1, 'Schwierigkeit: nach unten begrenzt');
store.level = 3;
const D = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d, 12); };
ok(nextStreak({ n: 0, last: '' }, D('2026-11-13')).n === 1, 'Serie: erster Tag');
ok(nextStreak({ n: 3, last: '2026-11-12' }, D('2026-11-13')).n === 4, 'Serie: Folgetag');
ok(nextStreak({ n: 3, last: '2026-11-13' }, D('2026-11-13')).n === 3, 'Serie: gleicher Tag zählt einmal');
ok(nextStreak({ n: 3, last: '2026-11-13' }, D('2026-11-16')).n === 4, 'Serie: Wochenende darf ausfallen (Fr → Mo)');
ok(nextStreak({ n: 3, last: '2026-11-10' }, D('2026-11-12')).n === 1, 'Serie: ausgelassener Werktag setzt zurück');

console.log(fails ? `${fails} verschiedene Fehler bei ${n} Prüfungen` : `tests: alle ${n} Prüfungen bestanden`);
process.exit(fails ? 1 : 0);
