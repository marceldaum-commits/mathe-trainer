// Selbstprüfung ohne Browser: Aufgaben-Erzeuger (alle Schwierigkeiten), Spiel-Logik und Serien-Regel.
globalThis.window = { katex: { renderToString: (s) => s } };
const G = await import('../app/js/gen.js');
const H = await import('../app/js/gen2.js');
const K = await import('../app/js/gen3.js');
const K4 = await import('../app/js/gen4.js');
const { nDeriv, polyTex, vertexTex, lineTex, fmt } = await import('../app/js/math.js');
const all = (m) => [1, 2, 3, 4, 5].flatMap((lv) => m.levelsFor(lv));
const GAMES = {};
for (const g of ['murmelbahn', 'tangente', 'zeichnen', 'paare', 'flaeche', 'labor', 'lotse', 'werkstatt', 'raum', 'flug', 'tafel']) GAMES[g] = await import(`../app/js/games/${g}.js`);
const { simulate } = GAMES.murmelbahn, MB = all(GAMES.murmelbahn);
const { hit } = GAMES.tangente, TG = all(GAMES.tangente);
const { grade, colX } = GAMES.zeichnen, ZR = all(GAMES.zeichnen);
const POOLS = [1, 2, 3, 4, 5].map((lv) => GAMES.paare.levelsFor(lv));
const { sums, gap } = GAMES.flaeche, FL = all(GAMES.flaeche);
const { solved } = GAMES.labor, LB = all(GAMES.labor);
const { goal, endPoint } = GAMES.lotse, LO = all(GAMES.lotse);
const { nextStreak, store } = await import('../app/js/store.js');
const { UNITS, AREAS, practiceGens, landOk, landList, stepExtra, unitExtra } = await import('../app/js/units.js');

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

// 6b) Schwierigkeit wirkt: Stufe 5 stellt andere Aufgaben als Stufe 1 und Stufe 3
for (const [name, fn] of Object.entries({ ...G, ...H, ...K, ...K4 })) {
  if (typeof fn !== 'function' || !/^gen[A-Z]/.test(name) || ['genScheitel', 'genOperator'].includes(name)) continue;   // Graph- bzw. Begriffs-Aufgaben
  const sample = (lv) => { const s = new Set(); for (let i = 0; i < 150; i++) { const q = fn(lv); s.add(`${q.prompt}|${q.formula ?? ''}`); } return s; };
  const a = sample(1), b = sample(3), c = sample(5), share = (x, y) => [...x].filter((k) => y.has(k)).length / x.size;
  ok(share(c, a) <= 0.25, `${name}: Stufe 5 unterscheidet sich von Stufe 1 (${Math.round(share(c, a) * 100)} % gleich)`);
  ok(share(c, b) <= 0.6, `${name}: Stufe 5 unterscheidet sich von Stufe 3 (${Math.round(share(c, b) * 100)} % gleich)`);
}

// 6c) Grundlagen-Aufgaben (gen3): jede Lösung unabhängig nachgerechnet, jeder Ablenker wirklich falsch
{ const PX = [0.6, 1.3, 2.2], eqv = (u, v) => u.length === v.length && u.every((c, i) => close(c, v[i]));
  const numCheck = (name, want) => { for (const lv of LV) for (let i = 0; i < REP; i++) { const q = K[name](lv), r = basics(name, q, lv), w = want(q);
    ok(close(r.num, w), `${name} (Stufe ${lv}): Ergebnis stimmt (${q.formula ?? q.prompt})`);
    for (const o of q.options) if (!o.correct) ok(!close(o.num, w), `${name} (Stufe ${lv}): Ablenker ist falsch (${o.tex})`); } };
  const fnCheck = (name, xs) => { for (const lv of LV) for (let i = 0; i < REP; i++) { const q = K[name](lv), r = basics(name, q, lv);
    ok(xs.every((x) => close(r.val(x), q.f(x))), `${name} (Stufe ${lv}): Umformung stimmt (${q.formula})`);
    for (const o of q.options) if (!o.correct) ok(xs.some((x) => !close(o.val(x), q.f(x))), `${name} (Stufe ${lv}): Ablenker ist falsch (${q.formula} → ${o.tex})`); } };
  numCheck('genBruch', (q) => ({ '+': q.a / q.b + q.c / q.d, '-': q.a / q.b - q.c / q.d, '·': (q.a / q.b) * (q.c / q.d), ':': (q.a / q.b) / (q.c / q.d) })[q.op]);
  fnCheck('genKlammer', XS); fnCheck('genPotenz', PX);
  numCheck('genHaeufigkeit', (q) => (q.k / q.n) * 100);
  numCheck('genProzent', (q) => ({ wert: (q.G * q.p) / 100, satz: q.p, erhoeht: q.G * (1 + q.p / 100), vermindert: q.G * (1 - q.p / 100), grund: q.G })[q.kind]);
  numCheck('genKennwerte', (q) => { const s = [...q.data].sort((x, y) => x - y), m = s.length;
    return q.ask === 'mittel' ? s.reduce((t, x) => t + x, 0) / m : q.ask === 'spann' ? s[m - 1] - s[0] : m % 2 ? s[(m - 1) / 2] : (s[m / 2 - 1] + s[m / 2]) / 2; });
  numCheck('genLaplace', (q) => q.g / q.m);
  numCheck('genGegen', (q) => (q.kind === 'min1' ? 1 - q.miss ** q.n : 100 - q.p));
  numCheck('genPythagoras', (q) => (q.hyp ? Math.hypot(q.A, q.B) : Math.sqrt(q.C ** 2 - q.A ** 2)));
  numCheck('genTrig', (q) => { const w = (q.al * Math.PI) / 180; return { sin: q.s * Math.sin(w), cos: q.s * Math.cos(w), tan: q.s * Math.tan(w), hyp: q.s / Math.sin(w) }[q.kind]; });
  for (const lv of LV) for (let i = 0; i < REP; i++) {
    { const q = K.genFlaeche(lv), r = basics('genFlaeche', q, lv); ok(Math.abs(r.num - q.want) < 0.051, `genFlaeche (Stufe ${lv}): Ergebnis stimmt`);
      for (const o of q.options) if (!o.correct) ok(Math.abs(o.num - q.want) > 0.2, `genFlaeche (Stufe ${lv}): Ablenker ist falsch (${q.prompt} → ${o.tex})`); }
    { const q = K.genLinGl(lv), r = basics('genLinGl', q, lv); ok(close(q.left(r.num), q.right(r.num)), `genLinGl (Stufe ${lv}): Lösung erfüllt die Gleichung (${q.formula})`);
      for (const o of q.options) if (!o.correct) ok(!close(q.left(o.num), q.right(o.num)), `genLinGl (Stufe ${lv}): Ablenker löst nicht (${q.formula} → ${o.tex})`); }
    { const q = K.genQuadGl(lv), r = basics('genQuadGl', q, lv); ok(r.xs.length === 2 && r.xs[0] !== r.xs[1] && r.xs.every((x) => Math.abs(q.f(x)) < 1e-9), `genQuadGl (Stufe ${lv}): beide Lösungen stimmen (${q.formula})`);
      for (const o of q.options) if (!o.correct) ok(o.xs.some((x) => Math.abs(q.f(x)) > 1e-6), `genQuadGl (Stufe ${lv}): Ablenker enthält falsche Lösung`); }
    { const q = K.genSteigung(lv), r = basics('genSteigung', q, lv), m = (q.Q[1] - q.P[1]) / (q.Q[0] - q.P[0]);
      if (q.kind === 'm') { ok(close(r.num, m), `genSteigung (Stufe ${lv}): Steigung stimmt`); for (const o of q.options) if (!o.correct) ok(!close(o.num, m), `genSteigung (Stufe ${lv}): Ablenker ist falsch`); }
      else { ok(close(r.val(q.P[0]), q.P[1]) && close(r.val(q.Q[0]), q.Q[1]), `genSteigung (Stufe ${lv}): Gerade geht durch beide Punkte`);
        for (const o of q.options) if (!o.correct) ok(!close(o.val(q.P[0]), q.P[1]) || !close(o.val(q.Q[0]), q.Q[1]), `genSteigung (Stufe ${lv}): Ablenker geht nicht durch beide Punkte`); } }
    { const q = K.genMittelpunkt(lv), r = basics('genMittelpunkt', q, lv), w = q.A.map((c, j) => (c + q.B[j]) / 2); ok(eqv(r.vec, w), `genMittelpunkt (Stufe ${lv}): Mittelpunkt stimmt`);
      for (const o of q.options) if (!o.correct) ok(!eqv(o.vec, w), `genMittelpunkt (Stufe ${lv}): Ablenker ist falsch`); }
    { const q = K.genVektorRechnen(lv), r = basics('genVektorRechnen', q, lv);
      const w = q.u.map((c, j) => ({ add: c + q.v[j], sub: c - q.v[j], skalar: q.k * c, kombi: q.k * c - q.v[j] })[q.kind]); ok(eqv(r.vec, w), `genVektorRechnen (Stufe ${lv}): Ergebnis stimmt`);
      for (const o of q.options) if (!o.correct) ok(!eqv(o.vec, w), `genVektorRechnen (Stufe ${lv}): Ablenker ist falsch`); }
  }
  for (const fn of Object.values(K)) if (typeof fn === 'function' && /^gen/.test(fn.name)) ok(typeof fn.topic === 'string', `${fn.name}: hat einen Themen-Namen`);
  // Vierfeldertafel: aus den Angaben eindeutig lösbar (Zeilen- und Spaltensummen), Text-Tafeln stimmig
  const { full } = GAMES.tafel, EQ = [['a', 'b', 'r1'], ['c', 'd', 'r2'], ['a', 'c', 'c1'], ['b', 'd', 'c2'], ['r1', 'r2', 'n'], ['c1', 'c2', 'n']];
  all(GAMES.tafel).forEach((R, i) => {
    const sol = full(R), known = Object.fromEntries(R.given.map((k) => [k, sol[k]]));
    ok(R.cells.every((c) => Number.isInteger(c) && c > 0) && R.given.length < 9, `Tafel ${i + 1}: positive ganze Zahlen, etwas bleibt offen`);
    if (R.text) { ok(R.given.length === 0 && R.text.includes(String(sol.n)), `Tafel ${i + 1}: Text nennt die Gesamtzahl, Tafel startet leer`); return; }
    for (let pass = 0; pass < 9; pass++) for (const [x, y, z] of EQ) {
      if (x in known && y in known && !(z in known)) known[z] = known[x] + known[y];
      else if (z in known && x in known && !(y in known)) known[y] = known[z] - known[x];
      else if (z in known && y in known && !(x in known)) known[x] = known[z] - known[y];
    }
    ok(Object.keys(sol).every((k) => known[k] === sol[k]), `Tafel ${i + 1}: aus den Angaben eindeutig lösbar`);
  });
  // Freies Üben: jedes Gebiet hat genug Aufgaben-Arten, alle sind Auswahl-Aufgaben oder Lücken
  for (const a of ['analysis', 'stochastik', 'geometrie']) {
    ok(practiceGens(a).length >= 10 && practiceGens(a, true).length >= 5, `Üben ${a}: genug Aufgaben-Arten`);
    for (const fn of practiceGens(a)) ok(typeof fn === 'function' && fn(3).options?.length >= 3, `Üben ${a}: ${fn.name} liefert Auswahl-Aufgaben`);
    ok(UNITS.filter((u) => u.area === a && u.grund).length === 1, `${a}: hat eine Grundlagen-Einheit`);
  }
}

// 6d) Freie Eingabe: Wer die gezeigte Lösung eintippt, bekommt recht; wer einen Ablenker eintippt, bekommt dessen Diagnose
{ const E = await import('../app/js/eingabe.js');
  ok(E.parseInput('3,5') === 3.5 && E.parseInput(' -2 ') === -2 && E.parseInput('7/4') === 1.75 && E.parseInput('25 %') === 25 && E.parseInput('x=4') === 4 && E.parseInput('−3') === -3, 'Eingabe: Zahlen, Brüche, Prozent, Minus');
  ok([' ', 'abc', '1/0', '3,5,1', '2x', '--2', '1e5'].every((s) => E.parseInput(s) === null), 'Eingabe: Unsinn wird abgelehnt');
  ok(E.isRight(3.14, Math.PI, '3,14') && !E.isRight(3.2, Math.PI, '3,14') && E.isRight(0.75, 0.75, '3/4') && E.isRight(0.667, 2 / 3, '2/3') && !E.isRight(0.6, 2 / 3, '2/3') && !E.isRight(12.4, 12, '12'), 'Eingabe: Rundung auf gezeigte Stellen');
  const able = new Set();
  for (const [name, fn] of Object.entries({ ...G, ...H, ...K, ...K4 })) {
    if (typeof fn !== 'function' || !/^gen[A-Z]/.test(name)) continue;
    for (const lv of LV) for (let i = 0; i < 40; i++) {
      const q = fn(lv), spec = E.inputSpec(q); if (!spec) continue;
      able.add(q.gen || name);
      const r = { num: spec.num, tex: q.options.find((o) => o.correct).tex }, sh = spec.sh, v = E.parseInput(sh.plain);
      ok(v !== null && E.isRight(v, r.num, sh.plain), `${name} (Stufe ${lv}): getippte Lösung ${sh.plain} wird anerkannt (${r.tex}, Wert ${r.num})`);
      for (const o of q.options) { if (o.correct) continue; const so = E.shapeOf(o.tex); if (!so) continue; const w = E.parseInput(so.plain);
        ok(!E.isRight(w, r.num, sh.plain), `${name} (Stufe ${lv}): getippter Ablenker ${so.plain} wird nicht anerkannt (richtig ${sh.plain})`);
        ok(typeof E.diagnose(w, q, spec.faktor) === 'string', `${name} (Stufe ${lv}): getippter Ablenker ${so.plain} bekommt eine Diagnose`); }
    }
  }
  ok(able.size >= 12, `Eingabe: genug Aufgaben-Arten zum Eintippen (${able.size})`);
  console.log(`  zum Eintippen geeignet: ${[...able].sort().join(', ')}`);
  const M = await import('../app/js/melden.js');
  const rep = M.buildReport('quatsch', `  ${'x'.repeat(3000)}\u0001`, { ort: '#/u/regeln/3', stufe: 5, zeit: 'T', aufgabe: { gen: 'genKette', thema: 'Kettenregel', stufe: 5, frage: 'f', formel: 'g', geheim: 1 }, name: 'Max' });
  ok(rep.art === 'app' && rep.text.length === M.MAX_TEXT && !('aufgabe' in rep) && !('name' in rep) && rep.version && rep.ort === '#/u/regeln/3', 'Meldung: Art geprüft, Text gekürzt, keine fremden Felder');
  const rep2 = M.buildReport('aufgabe', 'Lösung falsch', { aufgabe: { gen: 'genKette', thema: 'Kettenregel', stufe: 5, frage: 'f', formel: 'g', geheim: 1 } });
  ok(rep2.aufgabe.gen === 'genKette' && !('geheim' in rep2.aufgabe) && Object.keys(rep2).sort().join() === 'art,aufgabe,ort,stufe,text,version,zeit', 'Meldung: Aufgabe hängt an, nur erlaubte Felder');
  ok(M.meldenOn() === true, 'Meldung: Versand ist eingeschaltet (eigene Adresse /api/meldung)');
}

// 6e) Lehrplan-Filter (docs/LEHRPLAN.md): Hessen-Grundkurs ohne Hypothesentest, Normalverteilung, ln-Ableitung, Kreuzprodukt
{ const GK = 'HE-GK', raus = [H.genLn, H.genSigma, H.genNormal, H.genKreuz, H.genHypothese];
  ok(raus.every((f) => !landOk(f, GK) && landOk(f, 'BY') && landOk(f, 'HE-LK') && landOk(f, '')), 'Lehrplan: fünf Aufgaben-Arten gelten nur im Grundkurs nicht');
  ok([K4.genPolstelle, K4.genAsymptote, K4.genQuotient, K4.genKugel].every((f) => !landOk(f, 'HE-LK') && !landOk(f, GK) && landOk(f, 'BY')) && [K4.genRotation, K4.genUneigentlich, K4.genAbstandPG, K4.genEbenenLage].every((f) => landOk(f, 'HE-LK') && !landOk(f, GK)) && [K4.genTrigAbl, K4.genTrigInt, K4.genUnabhaengig, K4.genVarianz, K4.genHyper].every((f) => landOk(f, GK)), 'Lehrplan: neue Themen je Land richtig zugeordnet');
  ok(landOk(H.genKumuliert, GK) && landOk(H.genWachstum, GK) && landOk(H.genEbene, GK) && landOk(H.genVierfelder, GK), 'Lehrplan: der übrige Stoff gilt auch im Grundkurs');
  for (const a of ['analysis', 'stochastik', 'geometrie']) ok(practiceGens(a, false, GK).every((f) => landOk(f, GK)) && practiceGens(a, false, GK).length >= 8 && practiceGens(a, false, 'BY').length > practiceGens(a, false, GK).length, `Lehrplan: freies Üben ${a} ohne Grundkurs-fremden Stoff`);
  const ex = await import('../app/js/exam.js');
  for (let i = 0; i < 40; i++) ok(ex.makeTasks(15, 3, null, GK).every((q) => !raus.some((f) => f.name === q.gen)), 'Lehrplan: Abi-Modus Grundkurs ohne fremden Stoff');
  ok(JSON.stringify(ex.makeTasks(6, 3, 20261113).map((q) => q.formula)) === JSON.stringify(ex.makeTasks(6, 3, 20261113, '').map((q) => q.formula)), 'Lehrplan: Tages-Runde bleibt für alle gleich');
  const test = UNITS.find((u) => u.id === 's-test');
  ok(unitExtra(test, GK) && !unitExtra(test, 'BY') && landList(test.bossGens, GK).length === test.bossGens.length, 'Lehrplan: Hypothesentests im Grundkurs als Zusatz markiert, bleiben spielbar');
  const extra = UNITS.flatMap((u) => u.steps.filter((s) => stepExtra(s, GK)).map((s) => `${u.id}/${s.id}`));
  ok(extra.join() === 'expln/ln,s-verteilung/sigma,g-ebene/kreuz,g-kugel/kugel,a-wachstum/logistisch,g-ebene2/normal' && UNITS.every((u) => !unitExtra(u, 'BY') && u.steps.every((s) => !stepExtra(s, 'BY'))), `Lehrplan: markierte Schritte (${extra.join()})`);
  ok(UNITS.filter((u) => unitExtra(u, GK)).map((u) => u.id).join() === 's-test,a-gebrochen,a-rotation,g-kugel' && UNITS.filter((u) => unitExtra(u, 'HE-LK')).map((u) => u.id).join() === 'a-gebrochen', 'Lehrplan: Zusatz-Einheiten je Kurs');
}

// 6f) Abi-Aufgaben am Stück: jede Teilaufgabe unabhängig nachgerechnet
{ const V = await import('../app/js/verbund.js');
  const chk = (A, tag) => { ok(A.parts.length === A.be.length && A.parts.length >= 4 && A.intro && A.formula, `${tag}: Aufbau`); A.parts.forEach((q, i) => { ok(q.prompt.startsWith(`<b>${'abcdef'[i]})</b>`), `${tag}: Teilaufgabe ${i + 1} beschriftet`); basics(`${tag} ${'abcdef'[i]})`, q, 0); }); return Object.fromEntries(A.parts.map((q) => [q.kind, q])); };
  const R = (q) => q.options.find((o) => o.correct), W = (q) => q.options.filter((o) => !o.correct);
  const logC = (n, k) => { let s = 0; for (let i = 1; i <= k; i++) s += Math.log(n - k + i) - Math.log(i); return s; };
  for (const lv of LV) for (let i = 0; i < 60; i++) {
    { const A = V.verbundAnalysis(lv), t = `Verbund Analysis (Stufe ${lv})`, P = chk(A, t), f = A.f, d1 = (x) => nDeriv(f, x), dd = (x) => (f(x + 1e-3) - 2 * f(x) + f(x - 1e-3)) / 1e-6;
      ok(XS.every((x) => close(R(P.abl).val(x), d1(x))) && W(P.abl).every((o) => XS.some((x) => !close(o.val(x), d1(x)))), `${t}: Ableitung (${A.formula})`);
      ok(R(P.stellen).xs.every((x) => Math.abs(d1(x)) < 1e-4) && R(P.stellen).xs[0] < R(P.stellen).xs[1] && W(P.stellen).every((o) => o.xs.some((x) => Math.abs(d1(x)) > 1e-3)), `${t}: Stellen mit waagerechter Tangente (${A.formula})`);
      const good = (o) => Math.abs(d1(o.pt[0])) < 1e-4 && close(f(o.pt[0]), o.pt[1]) && (o.hoch ? dd(o.pt[0]) < -1e-3 : dd(o.pt[0]) > 1e-3);
      ok(good(R(P.extrem)) && W(P.extrem).every((o) => !good(o)), `${t}: Extrempunkt (${A.formula})`);
      ok(Math.abs(dd(R(P.wende).num)) < 1e-2 && W(P.wende).every((o) => Math.abs(dd(o.num)) > 0.5), `${t}: Wendestelle (${A.formula})`);
      const I = simpson(f, A.a, A.b); ok(close(R(P.integral).num, I) && W(P.integral).every((o) => !close(o.num, I)), `${t}: Integral (${A.formula}, bis ${A.b})`); }
    { const A = V.verbundStochastik(lv), t = `Verbund Stochastik (Stufe ${lv})`, P = chk(A, t), { n, p, k } = A;
      ok(close(R(P.mu).num, n * p) && W(P.mu).every((o) => !close(o.num, n * p)), `${t}: Erwartungswert`);
      const pk = Math.exp(logC(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p));
      ok(Math.abs(R(P.genau).num - pk) <= 1e-9 * pk && W(P.genau).every((o) => Math.abs(o.num - pk) > 1e-6 * pk), `${t}: P(X=${k}) bei n=${n}, p=${p}`);
      ok(R(P.genau).tex.includes(`\\binom{${n}}{${k}}`) && R(P.genau).tex.includes(`^{${k}}`) && R(P.genau).tex.includes(`^{${n - k}}`), `${t}: Bernoulli-Term vollständig`);
      ok(close(R(P.min1).num, 1 - (1 - p) ** n) && R(P.min1).tex === `1-${String(+(1 - p).toFixed(4)).replace('.', '{,}')}^{${n}}`, `${t}: mindestens ein Treffer (${R(P.min1).tex})`);
      ok(close(R(P.sigma).num, Math.sqrt(n * p * (1 - p))) && W(P.sigma).every((o) => !close(o.num, Math.sqrt(n * p * (1 - p)))), `${t}: Standardabweichung`); }
    { const A = V.verbundGeometrie(lv), t = `Verbund Geometrie (Stufe ${lv})`, P = chk(A, t), u = A.B.map((c, j) => c - A.A[j]), w = A.C.map((c, j) => c - A.A[j]);
      const eq = (a, b) => a.every((c, j) => close(c, b[j])), par = (a, b) => crossp(a, b).every((c) => Math.abs(c) < 1e-9) && b.some((c) => c !== 0);
      ok(eq(R(P.ab).vec, u) && W(P.ab).every((o) => !eq(o.vec, u)), `${t}: Vektor AB`);
      ok(close(R(P.laenge).num, Math.hypot(...u)) && W(P.laenge).every((o) => !close(o.num, Math.hypot(...u))), `${t}: Länge`);
      ok(close(R(P.skalar).num, dotp(u, w)) && W(P.skalar).every((o) => !close(o.num, dotp(u, w))), `${t}: Skalarprodukt`);
      const on = (o, X) => par(X.map((c, j) => c - o.P[j]), o.r) || eq(X, o.P), line = (o) => o.r.some((c) => c !== 0) && on(o, A.A) && on(o, A.B);
      ok(line(R(P.gerade)) && W(P.gerade).every((o) => !line(o)), `${t}: Gerade durch A und B`);
      const M = A.A.map((c, j) => (c + A.B[j]) / 2); ok(eq(R(P.mitte).vec, M) && W(P.mitte).every((o) => !eq(o.vec, M)), `${t}: Mittelpunkt`); }
  }
  const PL = await import('../app/js/plus.js');
  { const e = PL.einstufung({ analysis: [2, 2], stochastik: [2, 2], geometrie: [2, 2] }); ok(e.total === 12 && e.stufe === 4 && Object.values(e.rat).every((r) => r === 'sicher'), 'Einstufung: alles richtig → sicher, Stufe schwer'); }
  { const e = PL.einstufung({ analysis: [2, 1], stochastik: [1, 2], geometrie: [0, 0] }); ok(e.total === 6 && e.stufe === 2 && e.rat.analysis === 'kern' && e.rat.stochastik === 'grund' && e.rat.geometrie === 'grund' && e.schwach === 'geometrie', 'Einstufung: gemischt → Rat je Gebiet, schwächstes Gebiet'); }
  ok(PL.einstufung({ analysis: [0, 0], stochastik: [0, 0], geometrie: [0, 0] }).stufe === 1, 'Einstufung: nichts richtig → sehr leicht');
  for (const set of Object.values(PL.EINSTUFUNG)) for (const fn of [...set.grund, ...set.kern]) { const q = fn(2); ok(!q.type && q.options.length === 4, `Einstufung: ${fn.name} ist Auswahl-Aufgabe`); }
  { const u = Array.from({ length: 10 }, (_, i) => ({ id: i })), t0 = new Date(2026, 10, 13);
    const w = PL.planWeeks(u, 21, t0); ok(w.length === 3 && w.flatMap((x) => x.units).map((x) => x.id).join() === '0,1,2,3,4,5,6,7,8,9' && w.every((x) => x.units.length >= 3) && w[1].start.getDate() === 20, 'Lernplan: 10 Einheiten in 3 Wochen, jede genau einmal, in Reihenfolge');
    ok(PL.planWeeks(u.slice(0, 2), 70, t0).length === 2 && PL.planWeeks(u, 0, t0).length === 1 && PL.planWeeks(u, 0, t0)[0].units.length === 10 && PL.planWeeks([], 30, t0)[0].units.length === 0, 'Lernplan: wenig Stoff, kein Tag mehr, nichts offen'); }
}

// 6h) Wachstum mit Grenze und Ebenen genauer (gen5): jede Lösung unabhängig nachgerechnet
{ const K5 = await import('../app/js/gen5.js'); const R = (q) => q.options.find((o) => o.correct), W = (q) => q.options.filter((o) => !o.correct);
  const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], cr = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], null3 = (v) => v.every((c) => Math.abs(c) < 1e-9);
  /** Modell allein aus den Funktionswerten bestimmen – unabhängig vom Erzeuger. */
  const modell = (f) => { const w = [0, 1, 2, 3, 4, 5].map(f), d = w.slice(1).map((v, i) => v - w[i]);
    if (d.every((x) => close(x, d[0]))) return 'linear';
    if (w.slice(1).every((v, i) => close(v / w[i], w[1] / w[0]))) return 'exp';
    const L = f(400); return w.slice(1).every((v, i) => close((L - v) / (L - w[i]), (L - w[1]) / (L - w[0]))) ? 'begr' : 'log'; };
  for (const lv of LV) for (let i = 0; i < REP; i++) {
    { const q = K5.genBegrenzt(lv), t = `genBegrenzt (Stufe ${lv})`; basics('genBegrenzt', q, lv); const w = q.ask === 'grenze' ? q.f(5000) : q.f(0);
      ok(close(R(q).num, w) && W(q).every((o) => !close(o.num, w)) && q.options.every((o) => o.num >= 0), `${t}: ${q.ask} stimmt (${q.formula})`); }
    { const q = K5.genBegrenztRate(lv), t = `genBegrenztRate (Stufe ${lv})`; basics('genBegrenztRate', q, lv);
      const w = q.ask === 'f0' ? nDeriv(q.f, 0) : q.ask === 'dgl' ? q.k * (q.S - q.B) : q.r / (q.S - q.B);
      ok(Math.abs(R(q).num - w) < 1e-5 * (1 + Math.abs(w)) && W(q).every((o) => Math.abs(o.num - w) > 1e-3), `${t}: ${q.ask} stimmt (${q.formula})`);
      if (q.ask === 'f0') ok(close(q.f(5000), q.S), `${t}: Funktion nähert sich der Grenze`); }
    { const q = K5.genLogistisch(lv), t = `genLogistisch (Stufe ${lv})`; basics('genLogistisch', q, lv);
      const tw = Math.log(q.a) / q.k, w = { grenze: q.f(5000), start: q.f(0), haelfte: q.f(tw), tw }[q.ask];
      ok(close(q.f(tw), q.S / 2) && nDeriv(q.f, tw) >= nDeriv(q.f, tw - 0.3) && nDeriv(q.f, tw) >= nDeriv(q.f, tw + 0.3), `${t}: stärkstes Wachstum bei der halben Grenze`);
      ok(Math.abs(R(q).num - w) < 1e-6 * (1 + Math.abs(w)) && W(q).every((o) => Math.abs(o.num - w) > 1e-3), `${t}: ${q.ask} stimmt (${q.formula})`); }
    { const q = K5.genWachstumArt(lv), t = `genWachstumArt (Stufe ${lv})`; basics('genWachstumArt', q, lv);
      ok(R(q).key === q.key && modell(q.f) === q.key && q.options.length === 4, `${t}: Modell stimmt mit den Funktionswerten überein (${q.key}, ${q.formula || q.prompt})`); }
    { const q = K5.genSpurpunkt(lv), t = `genSpurpunkt (Stufe ${lv})`; basics('genSpurpunkt', q, lv);
      const gut = q.art === 'ebene' ? (p) => close(dot3(q.n, p), q.d) && p.every((c, j) => j === q.ax || c === 0) : (p) => p[2] === 0 && null3(cr(p.map((c, j) => c - q.A[j]), q.v));
      ok(gut(R(q).pt) && W(q).every((o) => !gut(o.pt)), `${t}: nur der richtige Punkt ist der Spurpunkt (${q.formula})`); }
    { const q = K5.genNormalenform(lv), t = `genNormalenform (Stufe ${lv})`; basics('genNormalenform', q, lv);
      const gut = (o) => null3(cr(o.n, q.n)) && !null3(o.n) && close(dot3(o.n, q.P), o.d);
      ok(gut(R(q)) && W(q).every((o) => !gut(o)), `${t}: nur die richtige Gleichung hat den Normalenvektor und enthält P (${q.formula})`); }
    { const q = K5.genParamPunkt(lv), t = `genParamPunkt (Stufe ${lv})`; basics('genParamPunkt', q, lv);
      const in_ = (p) => close(dot3(cr(q.u, q.v), p.map((c, j) => c - q.A[j])), 0), pkt = (r, s2) => q.A.map((c, j) => c + r * q.u[j] + s2 * q.v[j]);
      ok(!null3(cr(q.u, q.v)), `${t}: Richtungsvektoren spannen wirklich eine Ebene auf`);
      if (q.art === 'punkt') { const soll = pkt(q.r, q.s); ok(R(q).pt.every((c, j) => c === soll[j]) && in_(R(q).pt) && W(q).every((o) => o.pt.some((c, j) => c !== soll[j])), `${t}: Punkt stimmt (${q.formula})`); }
      else ok(pkt(R(q).r, R(q).s).every((c, j) => c === q.Q[j]) && W(q).every((o) => pkt(o.r, o.s).some((c, j) => c !== q.Q[j])), `${t}: nur das richtige Parameter-Paar trifft den Punkt (${q.formula})`); }
  } }

// 6g) Lehrplan-Ergänzungen (gen4): jede Lösung unabhängig nachgerechnet
{ const R = (q) => q.options.find((o) => o.correct), W = (q) => q.options.filter((o) => !o.correct), PX = [0.6, 1.3, 2.2];
  const lC = (n, k) => { let s = 0; for (let i = 1; i <= k; i++) s += Math.log(n - k + i) - Math.log(i); return s; };
  const cr = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  for (const lv of LV) for (let i = 0; i < REP; i++) {
    { const q = K4.genPolstelle(lv), t = `genPolstelle (Stufe ${lv})`; basics('genPolstelle', q, lv); const pol = (x) => Math.abs(q.N(x)) < 1e-9 && Math.abs(q.Z(x)) > 1e-9;
      ok(pol(R(q).num) && W(q).every((o) => !pol(o.num)), `${t}: nur die richtige Antwort ist eine Polstelle (${q.formula})`); }
    { const q = K4.genAsymptote(lv), t = `genAsymptote (Stufe ${lv})`; basics('genAsymptote', q, lv); const X = 1e6, nah = (o) => Math.abs(q.f(X) - o.val(X)) < 1e-3 && Math.abs(q.f(-X) - o.val(-X)) < 1e-3;
      ok(nah(R(q)) && W(q).every((o) => !nah(o)), `${t}: Graph nähert sich nur der richtigen Geraden (${q.formula})`); }
    for (const [name, xs] of [['genQuotient', PX], ['genTrigAbl', XS]]) { const q = K4[name](lv); basics(name, q, lv);
      ok(xs.every((x) => close(R(q).val(x), nDeriv(q.f, x))) && W(q).every((o) => xs.some((x) => !close(o.val(x), nDeriv(q.f, x)))), `${name} (Stufe ${lv}): Ableitung stimmt (${q.formula})`); }
    { const q = K4.genTrigInt(lv); basics('genTrigInt', q, lv); const I = simpson(q.f, q.a, q.b); ok(close(R(q).num, I) && W(q).every((o) => !close(o.num, I)), `genTrigInt (Stufe ${lv}): Integral stimmt (${q.formula})`); }
    { const q = K4.genRotation(lv); basics('genRotation', q, lv); const V = Math.PI * simpson((x) => q.f(x) ** 2, q.a, q.b, 2000); ok(Math.abs(R(q).num - V) < 2e-3 * V && W(q).every((o) => Math.abs(o.num - V) > 1e-2 * V), `genRotation (Stufe ${lv}): Volumen stimmt (${q.formula}, bis ${q.b})`); }
    { const q = K4.genUneigentlich(lv); basics('genUneigentlich', q, lv);
      const I = q.a === 0 ? simpson(q.f, 0, 60, 60000) : simpson((u) => (u < 1e-12 ? 0 : q.f(1 / u) / (u * u)), 0, 1 / q.a, 4000);
      ok(Math.abs(R(q).num - I) < 2e-3 * (1 + I) && W(q).every((o) => Math.abs(o.num - I) > 1e-2), `genUneigentlich (Stufe ${lv}): Wert stimmt (${q.formula} = ${I.toFixed(4)})`); }
    { const q = K4.genUnabhaengig(lv); basics('genUnabhaengig', q, lv); ok(R(q).key === (q.A * q.B === q.AB * q.n ? 'u' : 'a') && q.AB < Math.min(q.A, q.B), `genUnabhaengig (Stufe ${lv}): Entscheidung stimmt (${q.A}, ${q.B}, ${q.AB} von ${q.n})`); }
    { const q = K4.genVarianz(lv); basics('genVarianz', q, lv); const mu = q.xs.reduce((s, x, j) => s + x * q.P[j], 0), va = q.xs.reduce((s, x, j) => s + (x - mu) ** 2 * q.P[j], 0), w = { mu, var: va, sigma: Math.sqrt(va) }[q.ask];
      ok(close(q.P.reduce((s, p) => s + p, 0), 1) && close(R(q).num, w) && W(q).every((o) => !close(o.num, w)), `genVarianz (Stufe ${lv}): ${q.ask} stimmt`); }
    { const q = K4.genHyper(lv); basics('genHyper', q, lv); const w = Math.exp(lC(q.K, q.k) + lC(q.N - q.K, q.n - q.k) - lC(q.N, q.n));
      ok(Math.abs(R(q).num - w) < 1e-9 * w && w > 0 && w <= 1 && W(q).every((o) => Math.abs(o.num - w) > 1e-6 * w), `genHyper (Stufe ${lv}): Term stimmt (N=${q.N}, K=${q.K}, n=${q.n}, k=${q.k})`); }
    { const q = K4.genKugel(lv); basics('genKugel', q, lv);
      if (q.kind === 'lage') { const d2 = q.P.reduce((s, x, j) => s + (x - q.M[j]) ** 2, 0); ok(R(q).key === (d2 === q.r ** 2 ? 'auf' : d2 < q.r ** 2 ? 'innen' : 'aussen'), `genKugel (Stufe ${lv}): Lage stimmt`); }
      else if (q.kind === 'mr') ok(R(q).M.every((x, j) => x === q.M[j]) && R(q).r === q.r && q.formula.endsWith(`=${q.r ** 2}`), `genKugel (Stufe ${lv}): Mittelpunkt und Radius stimmen`);
      else { const w = Math.hypot(...q.P.map((x, j) => x - q.M[j])) - q.r; ok(close(R(q).num, w) && w > 0 && W(q).every((o) => !close(o.num, w)), `genKugel (Stufe ${lv}): Abstand zur Oberfläche stimmt`); } }
    { const q = K4.genAbstandPG(lv); basics('genAbstandPG', q, lv); const w = Math.hypot(...cr(q.P.map((x, j) => x - q.A[j]), q.u)) / Math.hypot(...q.u);
      ok(close(R(q).num, w) && W(q).every((o) => !close(o.num, w)), `genAbstandPG (Stufe ${lv}): Abstand stimmt`); }
    { const q = K4.genEbenenLage(lv); basics('genEbenenLage', q, lv); const par = cr(q.n1, q.n2).every((c) => c === 0), j = q.n1.findIndex((c) => c !== 0), k = q.n2[j] / q.n1[j];
      ok(R(q).key === (!par ? 'schnitt' : close(q.d2, k * q.d1) ? 'identisch' : 'parallel'), `genEbenenLage (Stufe ${lv}): Lage stimmt (${q.formula})`); }
  }
  for (const fn of Object.values(K4)) if (typeof fn === 'function' && /^gen/.test(fn.name)) ok(typeof fn.topic === 'string', `${fn.name}: hat einen Themen-Namen`);
}

// 6h) App-Manifest und Bauplan der Android-Hülle: vollständig, Dateien vorhanden, keine Geheimnisse
{ const { readFileSync, existsSync } = await import('node:fs'); const root = new URL('..', import.meta.url).pathname;
  const man = JSON.parse(readFileSync(`${root}app/manifest.webmanifest`, 'utf8')), twa = JSON.parse(readFileSync(`${root}android/twa-manifest.json`, 'utf8'));
  ok(man.display === 'standalone' && man.start_url === './' && man.id && man.lang === 'de' && /^#[0-9a-f]{6}$/.test(man.theme_color) && man.categories.includes('education'), 'Manifest: Grundangaben');
  ok(man.icons.some((i) => i.sizes === '512x512' && i.purpose === 'maskable') && man.icons.every((i) => existsSync(`${root}app/${i.src}`)), 'Manifest: Symbole vorhanden (auch maskierbar)');
  ok(man.shortcuts.length >= 3 && man.shortcuts.every((s) => /^\.\/#\/(tag|blitz|wiederholen|aufgabe)$/.test(s.url) && s.name && s.icons.every((i) => existsSync(`${root}app/${i.src}`))), 'Manifest: Kurzbefehle führen auf vorhandene Seiten');
  ok(man.screenshots.filter((s) => s.form_factor === 'narrow').length >= 3 && man.screenshots.some((s) => s.form_factor === 'wide') && man.screenshots.every((s) => existsSync(`${root}app/${s.src}`) && s.label), 'Manifest: Vorschaubilder vorhanden');
  ok(twa.host === 'trainer.mathenachhilfe-online.com' && twa.enableNotifications === true && /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(twa.packageId) && twa.shortcuts.length === man.shortcuts.length, 'Android-Hülle: Adresse, Paketname, Mitteilungen an, Kurzbefehle wie im Manifest');
  ok(!/password|passwort|storepass|keypass/i.test(JSON.stringify(twa)) && readFileSync(`${root}android/.gitignore`, 'utf8').includes('*.keystore'), 'Android-Hülle: kein Passwort im Bauplan, Schlüssel-Dateien sind vom Repo ausgeschlossen');
  const sw = readFileSync(`${root}app/sw.js`, 'utf8'); ok(!sw.includes('img/shots/'), 'Service Worker: Vorschaubilder werden nicht offline vorgeladen');
}

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
  for (const lv of LV) { const g = grade(R, perfect.map((y) => -y), lv); ok(g.stars === 0 && g.wrong, `Zeichnen ${i + 1}: gespiegelte Skizze fällt durch und nennt die Stelle (Stufe ${lv})`); }
  ok(grade(R, new Float32Array(161).fill(NaN)).stars === 0, `Zeichnen ${i + 1}: leere Skizze`);
  const rough = perfect.map((y, k) => y + 0.2 * Math.sin(k));
  ok(grade(R, rough, 3).stars >= 2 && grade(R, rough, 1).stars >= grade(R, rough, 5).stars, `Zeichnen ${i + 1}: wackelige Skizze – leichter ist milder`);
});

// 10) Graphen-Paare
POOLS.forEach((POOL, t) => {
  ok(POOL.length >= 6, `Paare (Satz ${t + 1}): genug Graphen für zwei Runden`);
  POOL.forEach((P, i) => ok([-2, -0.7, 0.4, 1.8].every((x) => close(P.d(x), nDeriv(P.f, x))) && P.why.length > 20, `Paare ${t + 1}.${i + 1}: Ableitung stimmt`));
  for (let i = 0; i < POOL.length; i++) for (let j = i + 1; j < POOL.length; j++)
    ok([-2, -0.7, 0.4, 1.8].some((x) => Math.abs(POOL[i].d(x) - POOL[j].d(x)) > 0.3), `Paare ${t + 1}: ${i + 1}/${j + 1} Ableitungen unterscheidbar`);
});

// 10b) Jede Schwierigkeit hat eigene Spiel-Level: leicht, mittel und schwer teilen sich nichts
for (const [name, m] of Object.entries(GAMES)) {
  const sets = [1, 2, 3, 4, 5].map((lv) => m.levelsFor(lv)), flat = sets.flat();
  ok(sets.every((x) => Array.isArray(x) && x.length >= 2) && new Set(sets).size === 5, `${name}: fünf eigene Level-Sätze`);
  ok(new Set(flat).size === flat.length, `${name}: kein Level kommt in zwei Schwierigkeiten vor`);
  const sig = (L) => JSON.stringify(L, (k, v) => (typeof v === 'function' ? String(v) : v));
  ok(new Set(flat.map(sig)).size === flat.length, `${name}: auch inhaltlich ist kein Level doppelt`);
}
// 10c) Kurven-Flug: Ziel einstellbar, Tore im Bild, Zielkurve fliegt durch, Startwerte nicht
all(GAMES.flug).forEach((L, i) => {
  const { f, passed } = GAMES.flug;
  for (const q of L.params) { const t = L.target[q.k]; ok(t >= q.min && t <= q.max && Math.abs((t - q.min) / q.step - Math.round((t - q.min) / q.step)) < 1e-9 && q.init !== undefined, `Flug ${i + 1}: Ziel ${q.k}=${t} mit dem Regler erreichbar`); }
  ok(L.gatesX.length >= 3 && L.gatesX.every((x) => x > 0.3 && x < 12.6 && Math.abs(f(L.target, x)) <= 4.3), `Flug ${i + 1}: Tore im Bild`);
  const init = { ...L.fixed }; L.params.forEach((q) => { init[q.k] = q.init; });
  for (const lv of LV) ok(passed(L, L.target, lv).every(Boolean) && !passed(L, init, lv).every(Boolean), `Flug ${i + 1}: Ziel fliegt durch, Start nicht (Stufe ${lv})`);
  ok(Object.keys(L.target).every((k) => k in init), `Flug ${i + 1}: alle Größen belegt`);
});

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
const WK = all(GAMES.werkstatt);
WK.forEach((L, i) => {
  let best = null, bv = -Infinity;
  for (let x = L.min; x <= L.max + 1e-9; x += L.step) if (L.obj(x) > bv + 1e-9) { bv = L.obj(x); best = +x.toFixed(6); }
  ok(best === L.sol, `Werkstatt ${i + 1}: Lösung ist das Maximum (${best})`);
  ok(L.init !== L.sol && L.obj(L.sol) < L.view.y1 && L.max < L.view.x1, `Werkstatt ${i + 1}: Start ist nicht die Lösung, Kurve im Bild`);
});

// 13c) Raum-Blick: Blickrichtung berechenbar, Antworten rechnerisch richtig
const { lookAlong, alignment } = GAMES.raum, RM = all(GAMES.raum);
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

// 13f) Abzeichen, Titel, Farben, Wochen-Ziel, Bereitschaft
{ const B = await import('../app/js/badges.js'); const { weekKey, WOCHEN_ZIEL, WOCHEN_BONUS } = await import('../app/js/store.js'); const { readiness } = await import('../app/js/extras.js');
  store.reset();
  ok(new Set(B.BADGES.map((b) => b.id)).size === B.BADGES.length && B.BADGES.every((b) => b.name && b.text && b.icon && typeof b.ok === 'function'), 'Abzeichen: eindeutig und vollständig');
  ok(B.checkBadges().length === 0, 'Abzeichen: ohne Leistung keines');
  ok(B.titleOf(0).title === B.TITLES[0][1] && B.titleOf(99).level === 1 && B.titleOf(100).level === 2 && B.titleOf(1e6).next === null && B.titleOf(1e6).pct === 1, 'Titel: Schwellen');
  for (let i = 1; i < B.TITLES.length; i++) ok(B.TITLES[i][0] > B.TITLES[i - 1][0], 'Titel: aufsteigend');
  ok(B.skinOpen('orange', 0) && !B.skinOpen('blau', 199) && B.skinOpen('blau', 200) && !B.skinOpen('gibtsnicht', 1e9), 'Farben: Freischaltung nach Punkten');
  for (let i = 0; i < 10; i++) store.record('Kettenregel', true); store.max('komboMax', 5); store.bump('boss');
  const neu = B.checkBadges().map((b) => b.id);
  ok(['r10', 'kombo5', 'boss1'].every((id) => neu.includes(id)) && !neu.includes('kombo10') && B.checkBadges().length === 0, 'Abzeichen: werden einmal vergeben');
  ok(weekKey(new Date(2026, 10, 13)) === '2026-11-09' && weekKey(new Date(2026, 10, 15)) === '2026-11-09' && weekKey(new Date(2026, 10, 16)) === '2026-11-16', 'Woche beginnt am Montag');
  store.reset();
  for (let d = 9; d <= 12; d++) store.touch(new Date(2026, 10, d, 12));
  store.touch(new Date(2026, 10, 12, 18));
  ok(store.week(new Date(2026, 10, 12)).days === 4 && !store.week(new Date(2026, 10, 12)).done && store.claimWeek(new Date(2026, 10, 12)) === 0, 'Wochen-Ziel: 4 Tage reichen nicht, doppelter Tag zählt einmal');
  store.touch(new Date(2026, 10, 14, 12));
  const xp0 = store.xp;
  ok(store.week(new Date(2026, 10, 14)).done && store.claimWeek(new Date(2026, 10, 14)) === WOCHEN_BONUS && store.xp === xp0 + WOCHEN_BONUS && store.claimWeek(new Date(2026, 10, 14)) === 0, 'Wochen-Ziel: Truhe genau einmal');
  ok(store.week(new Date(2026, 10, 16)).days === 0 && WOCHEN_ZIEL === 5, 'Wochen-Ziel: neue Woche beginnt bei 0');
  store.reset(); ok(readiness() === 0, 'Bereitschaft: am Anfang 0');
  for (const u of UNITS) for (const s of u.steps) store.complete(u.id, s.id, 3);
  for (let i = 0; i < 30; i++) store.record('X', true); store.addExam({ part: 'A', pct: 100, np: 15, correct: 9, total: 9 });
  ok(readiness() === 100, 'Bereitschaft: alles geschafft = 100');
  store.reset(); }

// 13g) Kurven-Flug und Boss
{ const F = await import('../app/js/games/flug.js'); const Bo = await import('../app/js/games/boss.js');
  F.LEVELS.forEach((L, i) => {
    const init = { ...L.fixed }; L.params.forEach((q) => { init[q.k] = q.init; });
    for (const lv of LV) ok(F.passed(L, L.target, lv).every(Boolean), `Flug ${i + 1}: Zielkurve kommt durch alle Tore (Stufe ${lv})`);
    ok(!F.passed(L, init, 1).every(Boolean), `Flug ${i + 1}: Startwerte kommen nicht durch`);
    for (const q of L.params) { const tt = L.target[q.k]; ok(tt >= q.min && tt <= q.max && Math.abs((tt - q.min) / q.step - Math.round((tt - q.min) / q.step)) < 1e-9, `Flug ${i + 1}: Ziel ${q.k} einstellbar`); }
    ok(L.gatesX.every((x) => x > 0 && x < 12.7 && Math.abs(F.f(L.target, x)) < 4.3), `Flug ${i + 1}: Tore im Bild`);
  });
  ok(Bo.bossLevel(5) === 5 && Bo.bossLevel(2) === 3 && LV.every((lv) => Bo.bossHp(lv) >= 4), 'Boss: Stufe und Lebenspunkte');
  for (const u of UNITS) {
    ok(u.steps.at(-1).id === 'boss' && u.steps.at(-1).kind === 'Boss' && u.bossName && u.bossGens.length >= 1, `Einheit ${u.id}: Boss ist letzter Schritt`);
    ok(typeof u.why === 'string' && u.why.length > 30 && Array.isArray(u.formeln) && u.formeln.every(([n, f]) => n && f), `Einheit ${u.id}: Alltagsbezug und Formelkarten`);
    for (const lv of LV) for (const fn of u.bossGens) { const q = fn(lv); ok(!q.type && q.options.filter((o) => o.correct).length === 1 && q.options.every((o) => o.correct || o.why), `Boss ${u.id}: ${fn.name} ist Auswahl-Aufgabe mit Diagnose`); }
  }
  ok(EX.blitzPunkte(1) === 10 && EX.blitzPunkte(4) === 40 && EX.blitzPunkte(12) === 50 && EX.blitzPunkte(0) === 10, 'Blitz: Kombo-Faktor bis ×5');
  for (const lv of [1, 2, 3]) for (const fn of EX.BLITZ_POOL) { const q = fn(lv); ok(!q.type && !q.graph, `Blitz: ${fn.name} ist schnelle Auswahl-Aufgabe`); } }

// 13h) Server-Schnittstelle (abgeschaltet) und KI-Prüfer
{ const A = await import('../app/js/api.js'); const { parse } = await import('../app/js/ki/expr.js'); const K = await import('../app/js/ki/verify.js');
  ok(A.serverOn() && !A.kiOn(), 'Server: Rangliste eingeschaltet, KI ohne Freigabe des Servers aus');
  ok(A.statusLesen({ ok: true, stufe: 'test', ki: true }) === 'test' && A.kiOn() && !A.premiumOn(), 'KI: an, wenn der Server sich als Testseite mit KI meldet; ohne „premium“ kein Code-Feld');
  A.statusLesen({ ok: true, stufe: 'live', ki: true, premium: true }); ok(A.premiumOn() && !A.kiOn(), 'Pro: Code-Feld folgt dem Feld „premium“ des Servers, unabhängig von der KI-Freigabe');
  A.statusLesen({ ok: false, premium: true }); ok(!A.premiumOn(), 'Pro: ohne gültige Antwort kein Code-Feld');
  ok(A.codeNorm(' mt-ab12 cd34-ef56 ') === 'MT-AB12-CD34-EF56' && A.codeNorm('MTAB12CD34EF56') === 'MT-AB12-CD34-EF56' && A.codeNorm('AB-AB12-CD34-EF56') === '' && A.codeNorm('MT-AB12-CD34') === '' && A.codeNorm('') === '', 'Pro: Zugangscode wird in Form gebracht, falsche Codes abgelehnt');
  { store.reset(); const g = store.geraet; ok(/^[A-Za-z0-9]{24}$/.test(g) && store.geraet === g, 'Pro: Geräte-Kennung entsteht einmal und bleibt gleich');
    store.zugang = { code: 'MT-AB12-CD34-EF56', art: 'pass', bis: '2027-06-30' }; ok(store.zugangGilt(new Date(2027, 5, 30, 12)) && !store.zugangGilt(new Date(2027, 6, 1, 12)), 'Pro: Zugang gilt bis einschließlich Ablauftag');
    store.complete('formen', 'murmelbahn', 3); store.reset(); ok(store.geraet === g && store.zugang?.code === 'MT-AB12-CD34-EF56' && store.xp === 0, 'Pro: „Fortschritt zurücksetzen“ löscht weder Kennung noch Zugang');
    store.zugang = { code: 'x', bis: 'morgen' }; ok(store.zugang === null && !store.zugangGilt(), 'Pro: kaputter Zugang im Speicher zählt nicht'); store.zugang = null; }
  for (const r of [{ ok: true, stufe: 'live', ki: true }, { ok: true, stufe: 'test', ki: false }, { ok: false, stufe: 'test', ki: true }, { ok: true }, null, { ok: true, stufe: 'test', ki: 'ja' }]) { A.statusLesen(r); ok(!A.kiOn(), `KI: aus bei Status ${JSON.stringify(r)} (live, kein Budget, Fehler, kein Netz)`); }
  { const r = await A.api.rangliste('ABCDEF', 'x'); ok(r.ok === false && typeof r.error === 'string', 'Server: nicht erreichbar → saubere Fehlermeldung statt Absturz'); }
  ok(A.codeOk('k7m2qx') && !A.codeOk('ABC') && !A.codeOk('ABCDE1') && !A.codeOk('ABCDEO'), 'Klassen-Code: Format');
  ok(A.nameOk('Mia_07') && A.nameOk('Jörg B.') && !A.nameOk('x') && !A.nameOk('<b>hi</b>') && !A.nameOk('a'.repeat(17)), 'Spitzname: Format');
  ok(close(parse('3*x^2-2*x+exp(-x)/2')(2), 12 - 4 + Math.exp(-2) / 2) && parse('-x^2')(3) === -9 && parse('2^-1')(0) === 0.5 && close(parse('sqrt(16)+ln(e)+2,5')(0), 7.5), 'Ausdrücke: Rechenregeln');
  for (const b of ['alert(1)', 'x;1', '2**3', 'constructor', 'x^', '(x', 'window', 'x.y', '', 'a'.repeat(300)]) { let thrown = false; try { parse(b); } catch { thrown = true; } ok(thrown, `Ausdrücke: „${b.slice(0, 12)}" wird abgelehnt`); }
  const base = { thema: 'Kettenregel', stufe: 3, frage: 'Welche Ableitung ist richtig?', tipps: ['Kettenregel nutzen.', 'Innere Ableitung ist 2.'], erklaerung: 'Äußere mal innere Ableitung.' };
  const abl = () => ({ ...base, art: 'ableitung', funktion: '(2*x+1)^3', antworten: [{ tex: '6(2x+1)^2', ausdruck: '6*(2*x+1)^2', richtig: true }, { tex: '3(2x+1)^2', ausdruck: '3*(2*x+1)^2', fehler: 'Innere Ableitung fehlt.' }, { tex: '6(2x+1)^3', ausdruck: '6*(2*x+1)^3', fehler: 'Exponent nicht verringert.' }, { tex: '2(2x+1)^2', ausdruck: '2*(2*x+1)^2', fehler: 'Alter Exponent fehlt.' }] });
  ok(K.verify(abl()).ok && K.toQuestion(abl()).options.filter((o) => o.correct).length === 1, 'KI-Prüfer: richtige Ableitungs-Aufgabe wird angenommen');
  { const t = abl(); t.antworten[0].ausdruck = '5*(2*x+1)^2'; ok(!K.verify(t).ok, 'KI-Prüfer: falsche Lösung wird abgelehnt'); }
  { const t = abl(); t.antworten[1].ausdruck = '6*(2*x+1)^2'; ok(!K.verify(t).ok, 'KI-Prüfer: richtiger Ablenker wird abgelehnt'); }
  { const t = abl(); t.antworten[2].richtig = true; ok(!K.verify(t).ok, 'KI-Prüfer: zwei richtige Antworten abgelehnt'); }
  { const t = abl(); delete t.antworten[3].fehler; ok(!K.verify(t).ok, 'KI-Prüfer: Ablenker ohne Diagnose abgelehnt'); }
  { const t = abl(); t.tipps = ['nur einer']; ok(!K.verify(t).ok, 'KI-Prüfer: zu wenige Tipps abgelehnt'); }
  { const t = abl(); t.frage = 'Hallo <script>alert(1)</script> Welt'; ok(!K.verify(t).ok, 'KI-Prüfer: eingeschleuster Code abgelehnt'); }
  { const t = abl(); t.funktion = 'fetch(1)'; ok(!K.verify(t).ok, 'KI-Prüfer: unlesbarer Ausdruck abgelehnt'); }
  { let thrown = false; try { const t = abl(); t.antworten[0].ausdruck = 'x'; K.toQuestion(t); } catch { thrown = true; } ok(thrown, 'KI-Prüfer: ungeprüfte Aufgabe kommt nicht in die App'); }
  const st = { ...base, art: 'stammfunktion', thema: 'Stammfunktion', funktion: '3*x^2+2', antworten: [{ tex: 'x^3+2x', ausdruck: 'x^3+2*x', richtig: true }, { tex: '6x', ausdruck: '6*x', fehler: 'Das ist die Ableitung.' }, { tex: '3x^3+2x', ausdruck: '3*x^3+2*x', fehler: 'Durch den neuen Exponenten teilen.' }, { tex: 'x^2+2', ausdruck: 'x^2+2', fehler: 'Exponent muss steigen.' }] };
  ok(K.verify(st).ok, 'KI-Prüfer: Stammfunktion angenommen');
  const ig = { ...base, art: 'integral', thema: 'Integral', funktion: '2*x', von: 0, bis: 3, antworten: [{ tex: '9', wert: 9, richtig: true }, { tex: '6', wert: 6, fehler: 'f statt F eingesetzt.' }, { tex: '-9', wert: -9, fehler: 'Grenzen vertauscht.' }, { tex: '3', wert: 3, fehler: 'Nur die Grenze eingesetzt.' }] };
  ok(K.verify(ig).ok && !K.verify({ ...ig, bis: 4 }).ok && !K.verify({ ...ig, von: 3, bis: 0 }).ok, 'KI-Prüfer: Integral nachgerechnet');
  const za = { ...base, art: 'zahl', thema: 'Erwartungswert', rechnung: '40*0,25', antworten: [{ tex: '10', wert: 10, richtig: true }, { tex: '30', wert: 30, fehler: 'Das sind die Misserfolge.' }, { tex: '7{,}5', wert: 7.5, fehler: 'Das ist die Varianz.' }, { tex: '160', wert: 160, fehler: 'Geteilt statt multipliziert.' }] };
  ok(K.verify(za).ok && !K.verify({ ...za, rechnung: '40*0,3' }).ok && !K.verify({ ...za, art: 'beweis' }).ok, 'KI-Prüfer: Zahlen-Aufgabe nachgerechnet, unbekannte Art abgelehnt'); }

// 14) Lernpfad: eindeutige Kennungen, jedes Gebiet hat Einheiten, jeder Schritt ist startbar
ok(new Set(UNITS.map((u) => u.id)).size === UNITS.length, 'Einheiten: Kennungen eindeutig');
for (const a of AREAS) ok(UNITS.some((u) => u.area === a.id), `Gebiet ${a.title}: hat Einheiten`);
for (const u of UNITS) {
  ok(AREAS.some((a) => a.id === u.area), `Einheit ${u.id}: Gebiet bekannt`);
  ok(new Set(u.steps.map((s) => s.id)).size === u.steps.length && u.steps.every((s) => typeof s.run === 'function' && s.title && s.kind), `Einheit ${u.id}: Schritte vollständig`);
}

// 14b) Ruhiger Modus, Abenteuer, Karte, Figuren
{ store.reset(); ok(store.ruhig === false, 'Ruhiger Modus: anfangs aus'); store.ruhig = 1; ok(store.ruhig === true, 'Ruhiger Modus: lässt sich einschalten'); store.ruhig = false;
  const A = await import('../app/js/abenteuer.js'), F = await import('../app/js/figuren.js'), Ka = await import('../app/js/karte.js');
  ok(new Set(A.UPGRADES.map((u) => u.id)).size === A.UPGRADES.length && A.UPGRADES.every((u) => u.name && u.text && u.zeichen && typeof u.use === 'function'), 'Abenteuer: Belohnungen vollständig und eindeutig');
  for (let i = 0; i < 400; i++) {
    const s = A.neuerLauf(['gemischt', 'analysis', 'stochastik', 'geometrie'][i % 4], 1 + (i % 5), i % 7 === 0);
    // eine ganze Reise durchspielen: zufällige Türen, zufällige Belohnungen, zufällige Treffer und Fehler
    let schritte = 0, tuer = { art: 'kampf', gebiet: s.gebiet === 'gemischt' ? 'analysis' : s.gebiet }, aus = false;
    while (s.raum < A.RAEUME && !aus && schritte++ < 200) {
      if (tuer.art === 'rast') { s.leben = Math.min(s.max, s.leben + 2); s.raum++; }
      else if (tuer.art === 'schatz') { s.raum++; const k = A.ziehe(s); ok(k.length === 3 && new Set(k.map((u) => u.id)).size === 3, 'Abenteuer: drei verschiedene Belohnungen'); A.nimm(s, k[0].id); }
      else {
        const g = A.gegner(tuer.art, tuer.gebiet, s.raum, s.lv); let hp = A.funke(s, g), erster = true; ok(hp >= 1 && hp >= g.hp - 1 && s.funke >= 0, 'Abenteuer: Funken-Stein zieht höchstens einen Punkt ab');
        ok(g.hp >= 2 && g.lv >= s.lv && g.lv <= 5 && g.name && (tuer.art !== 'boss' || g.name === A.DRACHE[0]), 'Abenteuer: Gegner sinnvoll');
        ok(practiceGens(tuer.gebiet).length >= 5, 'Abenteuer: genug Aufgabenarten im Gebiet');
        while (hp > 0 && !aus) {
          if ((i + schritte + hp) % 3) { const d = A.treffer(s, erster); erster = false; ok(d === 1 || d === 2, 'Abenteuer: Schaden 1 oder 2'); hp -= d; }
          else { const vor = s.leben, was = A.patzer(s); ok(s.kombo === 0 && (was === 'leben' ? s.leben === vor - 1 : s.leben === vor) && (!s.ruhig || was === 'ruhig'), 'Abenteuer: Fehler kostet höchstens ein Leben, im ruhigen Modus keins'); if (s.leben <= 0) aus = true; }
          if (schritte++ > 400) break;
        }
        if (!aus) { s.punkte += A.RAUM_PUNKTE[g.art] * s.faktor; s.raum++; if (g.art !== 'boss') for (let r = 0; r < (g.art === 'elite' ? 2 : 1); r++) { const k = A.ziehe(s); ok(k.length === 3 && k.every((u) => !(u.einmal && s.hat.includes(u.id)) && !(s.ruhig && u.leben)), 'Abenteuer: Belohnungen passen zum Stand'); A.nimm(s, k[r % 3].id); } }
      }
      ok(s.leben <= s.max && s.schild >= 0 && s.kristall >= 0 && s.punkte >= 0 && s.faktor >= 1 && s.faktor <= 1.5, 'Abenteuer: Stand bleibt gültig');
      if (s.raum < A.RAEUME && !aus) {
        const ts = A.tueren(s);
        ok(s.raum + 1 >= A.RAEUME ? ts.length === 1 && ts[0].art === 'boss' : ts.length === 2 && ts.some((t) => t.art === 'kampf') && ts.every((t) => t.art in A.TUER_TEXT && t.art !== 'boss' && t.gebiet in A.GEGNER), 'Abenteuer: Türen stimmen (am Ende nur das Drachentor)');
        ok(!(s.ruhig && ts.some((t) => t.art === 'rast')), 'Abenteuer: kein Rastplatz im ruhigen Modus');
        ok(ts.length === 1 || !(ts[0].art === ts[1].art && ts[0].gebiet === ts[1].gebiet), 'Abenteuer: zwei verschiedene Türen');
        tuer = ts[(i + s.raum) % ts.length];
      }
    }
    ok(aus || s.raum === A.RAEUME, 'Abenteuer: Reise endet nach sieben Räumen oder ohne Leben');
  }
  ok(F.figur({ zeichen: '<b>' }).includes('&lt;b&gt;') && !F.figur({ zeichen: '<b>' }).includes('<b>'), 'Figuren: Zeichen wird entschärft');
  ok(F.figurFor('Parabel-Golem', 'x²').replace(/fg\d+/g, '') === F.figurFor('Parabel-Golem', 'x²').replace(/fg\d+/g, ''), 'Figuren: gleicher Name, gleiche Figur');
  ok(new Set(UNITS.filter((u) => u.bossName).map((u) => F.streu(u.bossName))).size === UNITS.filter((u) => u.bossName).length, 'Figuren: jeder Boss hat eine eigene Streuzahl');
  for (const u of UNITS) if (u.bossName) ok(typeof u.bossSymbol === 'string' && F.figurFor(u.bossName, u.bossSymbol).startsWith('<svg'), `Einheit ${u.id}: Boss-Figur zeichenbar`);
  store.reset();
  const alle = Ka.LAENDER_KARTE.flatMap((l) => Ka.stationen(l.id));
  ok(Ka.LAENDER_KARTE.length === 3 && alle.length === UNITS.filter((u) => u.area !== 'pruefung').length && new Set(alle).size === alle.length, 'Karte: jede Lern-Einheit ist genau eine Station');
  ok(Ka.standort() === Ka.stationen('analysis')[0].id && Ka.stationen('analysis')[0].grund, 'Karte: Pi startet an der ersten Station (Grundlagen)');
  for (const st of Ka.stationen('analysis')[0].steps) store.complete(Ka.stationen('analysis')[0].id, st.id, 3);
  ok(Ka.standort() === Ka.stationen('analysis')[1].id, 'Karte: Pi zieht weiter, wenn eine Station frei ist');
  for (const land of ['', 'BY', 'HE-GK', 'HE-LK']) { const st = Ka.stationen('analysis', land), ex = st.map((u) => unitExtra(u, land)); ok(ex.indexOf(true) === -1 || !ex.slice(ex.indexOf(true)).includes(false), `Karte ${land || 'ohne Land'}: Zusatz-Stationen stehen am Ende`); }
  { const p = Array.from({ length: 14 }, (_, i) => Ka.punkt(i)); ok(p.every((q, i) => q.x >= 60 && q.x <= 260 && (i === 0 || q.y - p[i - 1].y >= 100)) && Ka.hoehe(14) > p[13].y + 60, 'Karte: Stationen liegen im Feld und überlappen nicht'); }
  store.reset(); }

// 14c) Erinnerung in der Android-App (Offline-Fassung): die App spricht mit dem Gerät statt mit dem Server
{ const E = await import('../app/js/erinnern.js');
  ok(!E.nativ(), 'Android-Erinnerung: im Browser nicht aktiv');
  const geraet = { an: false, zeit: '18:00', erlaubt: true, geuebt: 0, antwort: 'ok' };
  window.MTApp = { erinnerungStand: () => JSON.stringify({ an: geraet.an && geraet.erlaubt, zeit: geraet.zeit, erlaubt: geraet.erlaubt }),
    erinnerungAn: (z) => { if (geraet.antwort === 'ok') { geraet.an = true; geraet.zeit = z; } return geraet.antwort; }, erinnerungAus: () => { geraet.an = false; }, geuebt: () => { geraet.geuebt++; } };
  store.reset();
  ok(E.nativ() && E.pushOn() && E.pushCan() && !E.pushGesperrt(), 'Android-Erinnerung: in der App verfügbar, auch ohne Server');
  let st = await E.pushStand(); ok(st.kann && !st.an && st.zeit === '18:00', 'Android-Erinnerung: anfangs aus');
  ok(!(await E.pushAn('25:00')).ok && !geraet.an, 'Android-Erinnerung: unmögliche Uhrzeit abgelehnt');
  ok((await E.pushAn('07:15')).ok && geraet.an && geraet.zeit === '07:15' && store.erinnern.an && store.erinnern.zeit === '07:15', 'Android-Erinnerung: einschalten stellt das Gerät');
  st = await E.pushStand(); ok(st.an && st.zeit === '07:15', 'Android-Erinnerung: Zustand kommt vom Gerät');
  geraet.erlaubt = false; st = await E.pushStand(); ok(!st.an && store.erinnern.an === false, 'Android-Erinnerung: ohne Erlaubnis gilt sie als aus');
  geraet.antwort = 'gesperrt'; { const r = await E.pushAn('08:00'); ok(!r.ok && r.gesperrt, 'Android-Erinnerung: gesperrt wird gemeldet'); }
  geraet.erlaubt = true; geraet.antwort = 'ok'; await E.pushAn('08:00'); await E.pushAus(); ok(!geraet.an && store.erinnern.an === false && store.erinnern.zeit === '08:00', 'Android-Erinnerung: ausschalten, Uhrzeit bleibt gemerkt');
  window.MTApp.erinnerungStand = () => 'kaputt'; st = await E.pushStand(); ok(st.kann && !st.an, 'Android-Erinnerung: unlesbare Antwort des Geräts bringt nichts durcheinander');
  { const vor = geraet.geuebt; store.touch(); ok(geraet.geuebt === vor + 1, 'Android-Erinnerung: Üben wird dem Gerät gemeldet (heute keine Mitteilung mehr)'); }
  delete window.MTApp; store.reset(); ok(!E.nativ(), 'Android-Erinnerung: ohne App wieder der Web-Weg'); }

// 14d) Befunde aus der täglichen Stichprobe (14.11.2026)
{ const G = await import('../app/js/gen.js');
  for (let i = 0; i < 300; i++) {
    const lo = G.genBetrag(1).options.find((o) => o.correct).num, hi = G.genBetrag(5).options.find((o) => o.correct).num;
    ok(lo <= 7 && hi >= 11, 'Vektor-Länge: Stufe 5 nutzt nur die großen Tripel, Stufe 1 nur die kleinen');
    for (const lv of [1, 3, 5]) { const q = G.genProdukt(lv), alles = [q.formula, q.explain, ...q.hints, ...q.options.map((o) => o.tex)].join(' ');
      ok(!/\((-?\d+|-?\d*x(\^\{\d\})?)\)\\,e/.test(alles) && !/[^0-9]1e\^/.test(alles) && !/-1e\^/.test(alles), 'Produktregel: kein „(1)·e^x“, kein „1e^x“, einzelne Summanden ohne Klammer'); }
    const b = G.genBinomial(1 + (i % 4)); ok(!b.options.some((o) => /Die 1 Nicht-Treffer/.test(o.why || '')), 'Bernoulli: „Der eine Nicht-Treffer fehlt“ statt „Die 1 Nicht-Treffer fehlen“');
  } }

// 14e) Arbeitsblatt, Probeklausur, Theorie
{ const B = await import('../app/js/blatt.js'), Th = await import('../app/js/theorie.js'); store.reset();
  const sicht = (fr) => JSON.stringify(fr.map((q) => [q.prompt, q.formula, q.options.map((o) => [o.tex ?? o.html, o.correct])]));
  ok(B.themen().length === UNITS.filter((u) => u.area !== 'pruefung').length && B.themen().every((t) => t.title && ['analysis', 'stochastik', 'geometrie'].includes(t.area)), 'Arbeitsblatt: jede Lern-Einheit ist als Thema wählbar');
  for (let i = 0; i < 40; i++) {
    const T = B.themen(), units = [T[i % T.length].id, T[(i * 7 + 3) % T.length].id, T[(i * 11 + 5) % T.length].id].filter((v, k, a) => a.indexOf(v) === k), c = { units, lv: 1 + (i % 5), n: B.ANZAHL[i % 4], seed: 100000 + i * 7919 };
    const a = B.bauBlatt(c), b = B.bauBlatt(c), andere = B.bauBlatt({ ...c, seed: c.seed + 1 });
    ok(a.length === c.n && sicht(a) === sicht(b), `Arbeitsblatt: gleiche Nummer liefert dasselbe Blatt (${c.n} Aufgaben)`);
    ok(sicht(a) !== sicht(andere), 'Arbeitsblatt: andere Nummer liefert ein anderes Blatt');
    ok(a.every((q) => q.options.filter((o) => o.correct).length === 1 && q.explain && q.gen && q.unit) && units.every((id) => a.length < units.length || a.some((q) => q.unit === UNITS.find((u) => u.id === id).title)), 'Arbeitsblatt: jede Aufgabe hat genau eine Lösung mit Erklärung, jedes gewählte Thema kommt vor');
    ok(JSON.stringify(B.leseHash(B.blattHash(c).slice(8))) === JSON.stringify(c), 'Arbeitsblatt: Adresse lässt sich zurücklesen');
    const html = B.blattHtml(c, a); ok(html.includes('img/logo.svg') && html.includes('Mathenachhilfe Online') && html.includes(`Nr. ${c.seed}`) && html.includes('Name:') && (html.match(/class="b-aufgabe"/g) || []).length === c.n && (html.match(/class="b-lsg"/g) || []).length === c.n && !/undefined|NaN/.test(html), 'Arbeitsblatt: Logo, Firmenname, Nummer, Namen-Zeile, Aufgaben und Lösungen vollständig');
  }
  { const r1 = Math.random(); B.bauBlatt({ units: ['regeln'], lv: 3, n: 5, seed: 42 }); const G = await import('../app/js/gen.js'); const x = new Set(); for (let i = 0; i < 6; i++) x.add(G.genPolynom(3).formula); ok(x.size > 1 && r1 >= 0, 'Arbeitsblatt: danach würfeln die Aufgaben wieder echt zufällig'); }
  for (const land of ['', 'BY', 'HE-GK', 'HE-LK']) for (const lv of LV) { const k = B.bauKlausur({ lv, seed: 4711 + lv }, land), be = k.reduce((s, q) => s + q.be, 0);
    ok(k.length === 12 && be === 48 && k.every((q) => B.KLAUSUR_BE.includes(q.be)) && sicht(k) === sicht(B.bauKlausur({ lv, seed: 4711 + lv }, land)), `Probeklausur ${land || 'ohne Land'} Stufe ${lv}: 12 Aufgaben, 48 Punkte, wiederholbar`);
    ok(k.every((q) => landOk({ name: q.gen }, land) || true) && k.every((q) => !UNITS.some((u) => u.title === q.unit && (unitExtra(u, land) || u.grund))), `Probeklausur ${land || 'ohne Land'}: kein Zusatz-Stoff, keine Grundlagen-Einheit`);
    ok(B.blattHtml({ klausur: true, lv, seed: 1 }, k).includes('Notenpunkte'), 'Probeklausur: Punkte-Tabelle auf dem Lösungsblatt'); }
  ok(B.leseHash('klausur_3_99')?.klausur && !B.leseHash('klausur_9_1') && !B.leseHash('gibtsnicht_3_8_1') && !B.leseHash('regeln_3_99_1') && !B.leseHash('') && !B.leseHash('regeln_3_8_abc'), 'Arbeitsblatt: kaputte Adressen werden abgewiesen');
  ok(B.NP_GRENZEN[0][1] === 15 && B.NP_GRENZEN.at(-1)[0] === 0 && B.NP_GRENZEN.every((g, i, a) => !i || (g[0] < a[i - 1][0] && g[1] === a[i - 1][1] - 1)), 'Probeklausur: Notenpunkte-Tabelle lückenlos von 15 bis 0');
  for (const u of UNITS) { const K = Th.karten(u); ok(K.length >= 1 && K.every((c) => c.title && c.html), `Theorie ${u.id}: Kurzfassung vorhanden`);
    const kurz = Th.kapitelHtml(u, false); ok(kurz.includes(u.title) && kurz.includes('img/logo.svg') && !/undefined|NaN/.test(kurz), `Theorie ${u.id}: Kapitel mit Titel und Logo`); }
  ok(Object.keys(Th.LANG).length >= 6 && Object.keys(Th.LANG).every((id) => UNITS.some((u) => u.id === id)) && Object.values(Th.LANG).every((L) => L.length >= 4 && L.every(([t, html]) => t && html.length > 80)), 'Theorie: ausführliche Kapitel gehören zu echten Einheiten und haben mehrere Abschnitte');
  { const u = UNITS.find((x) => x.id === 'extrema'); ok(Th.kapitelHtml(u, true).includes('Durchgerechnetes Beispiel') && !Th.kapitelHtml(u, false).includes('Durchgerechnetes Beispiel') && Th.kapitelHtml(UNITS.find((x) => x.id === 'a-trig'), true).includes('(kurz)'), 'Theorie: ausführlich nur, wo geschrieben – sonst die Kurzfassung'); }
  store.reset(); }

// 14e2) Schwächen-Blatt, voller Rechenweg, KI-Arten
{ const B = await import('../app/js/blatt.js'), A = await import('../app/js/api.js'); store.reset();
  ok(B.schwaechen().length === 0 && B.bauSchwach({ lv: 3, n: 5, seed: 1 }).length === 0, 'Schwächen-Blatt: ohne Fehler-Kartei kein Blatt');
  store.kartePut('genKette', 'Kettenregel'); store.kartePut('genBaum', 'Baumdiagramm'); store.kartePut('gibtEsNicht', 'x');
  ok(B.schwaechen().join() === 'genKette,genBaum', 'Schwächen-Blatt: nur bekannte Aufgaben-Arten aus der Fehler-Kartei');
  for (const lv of LV) { const c = { schwach: true, lv, n: 8, seed: 500 + lv }, f = B.bau(c), g = B.bau(c);
    ok(f.length === 8 && f.every((q) => ['genKette', 'genBaum'].includes(q.gen)) && new Set(f.map((q) => q.gen)).size === 2, `Schwächen-Blatt Stufe ${lv}: nur die Schwächen, beide kommen vor`);
    ok(JSON.stringify(f.map((q) => q.formula || q.prompt)) === JSON.stringify(g.map((q) => q.formula || q.prompt)) && JSON.stringify(B.leseHash(B.blattHash(c).slice(8))) === JSON.stringify(c), 'Schwächen-Blatt: wiederholbar, Adresse lesbar');
    const html = B.blattHtml(c, f); ok(html.includes('Schwächen-Blatt') && (html.match(/class="b-schritte"/g) || []).length === 8 && html.includes('<b>Lösung:</b>'), 'Lösungsblatt: jeder Aufgabe folgt der Rechenweg in Schritten und die Lösung'); }
  ok(B.genNachName().size >= 60 && [...B.genNachName().values()].every((x) => typeof x.fn === 'function' && x.unit), 'Schwächen-Blatt: Verzeichnis der Aufgaben-Arten vollständig');
  A.statusLesen({ ok: true, stufe: 'test', ki: true, kiArten: ['erklaer', 'frage', 7] }); ok(A.kiArt('frage') && A.kiArt('erklaer') && !A.kiArt('rechenweg'), 'KI-Arten: nur was der Server meldet');
  A.statusLesen({ ok: true, stufe: 'live', ki: true, kiArten: ['frage'] }); ok(!A.kiArt('frage'), 'KI-Arten: ohne KI-Freigabe nichts');
  A.statusLesen({ ok: true, stufe: 'test', ki: true }); ok(!A.kiArt('frage'), 'KI-Arten: fehlt die Liste, gibt es keine Rückfragen');
  A.statusLesen(null); store.reset(); }

// 14e3) Rechenweg-Prüfer: Bildmaße und Größen-Rechnung
{ const R = await import('../app/js/rechenweg.js');
  ok(JSON.stringify(R.zielMass(4000, 3000)) === '{"b":1600,"h":1200}' && JSON.stringify(R.zielMass(3000, 4000)) === '{"b":1200,"h":1600}' && JSON.stringify(R.zielMass(800, 600)) === '{"b":800,"h":600}' && R.zielMass(0, 0).b === 1, 'Rechenweg: Bild wird auf höchstens 1600 px verkleinert, kleine Bilder bleiben');
  ok(R.bytesVon('data:image/jpeg;base64,' + 'A'.repeat(4000)) === 3000 && R.bytesVon('') === 0 && R.BILD_MAX_BYTES === 1000000 && /keinen Namen/.test(R.FOTO_HINWEIS), 'Rechenweg: Größen-Rechnung und Datenschutz-Hinweis'); }

// 14e4) KI-Aufgaben: Themen-Auswahl
{ const KA = await import('../app/js/kiaufgabe.js'); const T = KA.kiThemen();
  ok(T.length === 3 && T.every(([g, ts]) => g && ts.length >= 8 && new Set(ts).size === ts.length) && T.flatMap(([, ts]) => ts).includes('Kettenregel') && KA.VERSUCHE >= 2, 'KI-Aufgaben: Themen aus allen drei Gebieten, ohne Doppelte'); }

// 14e5) Merkbilder: jedes gehört zu einer echten Formel
{ const Mb = await import('../app/js/merkbild.js'); const namen = new Set(UNITS.flatMap((u) => (u.formeln || []).map(([n]) => n)));
  ok(Object.keys(Mb.MERK).length >= 12 && Object.keys(Mb.MERK).every((n) => namen.has(n) && typeof Mb.MERK[n] === 'function'), `Merkbilder: alle gehören zu einer Formel der App (${Object.keys(Mb.MERK).filter((n) => !namen.has(n)).join(', ') || 'ok'})`);
  ok(Mb.hatMerkbild('Kettenregel') && !Mb.hatMerkbild('toString') && !Mb.hatMerkbild('gibt es nicht') && Mb.merkbild('gibt es nicht') === null, 'Merkbilder: unbekannte Namen liefern nichts'); }

// 14f) Lernkarten
{ const Kt = await import('../app/js/karten.js'); store.reset(); const T0 = new Date(2026, 10, 14, 12), tag = (n) => Kt.plusTage(T0, n);
  const alle = Kt.stapel(); ok(alle.length >= 3 && alle.every((k) => k.key && k.vorn && k.hinten) && new Set(alle.map((k) => k.key)).size === alle.length, 'Lernkarten: ohne Fortschritt die Grundlagen-Formeln, Schlüssel eindeutig');
  ok(Kt.faellig(alle, T0).length === alle.length, 'Lernkarten: neue Karten sind sofort dran');
  const k = alle[0].key; ok(Kt.verbuche(k, true, T0) === 1 && !Kt.faellig(alle, T0).some((x) => x.key === k) && Kt.faellig(alle, tag(1)).some((x) => x.key === k), 'Lernkarten: gewusst → morgen wieder');
  Kt.verbuche(k, true, tag(1)); ok(!Kt.faellig(alle, tag(3)).some((x) => x.key === k) && Kt.faellig(alle, tag(4)).some((x) => x.key === k), 'Lernkarten: zweimal gewusst → 3 Tage Pause');
  for (let i = 0; i < 9; i++) Kt.verbuche(k, true, tag(4)); ok(store.lernStand[k].fach === 5 && !Kt.faellig(alle, tag(33)).some((x) => x.key === k) && Kt.faellig(alle, tag(34)).some((x) => x.key === k), 'Lernkarten: höchstens Fach 5 (30 Tage)');
  ok(Kt.verbuche(k, false, tag(40)) === 1 && Kt.faellig(alle, tag(41)).some((x) => x.key === k), 'Lernkarten: nicht gewusst → zurück, morgen wieder');
  const id = store.lernNeu('<b>Vorn</b>', 'x'.repeat(500)); const mit = Kt.stapel();
  ok(mit.length === alle.length + 1 && mit[0].eigen && mit[0].vorn === '&lt;b&gt;Vorn&lt;/b&gt;' && store.lernEigene[0].hinten.length === 300, 'Lernkarten: eigene Karte wird entschärft und gekürzt');
  Kt.verbuche(`e:${id}`, true, T0); store.lernWeg(id); ok(Kt.stapel().length === alle.length && !store.lernStand[`e:${id}`], 'Lernkarten: eigene Karte samt Stand löschbar');
  for (const st of UNITS.find((u) => u.id === 'regeln').steps) store.complete('regeln', st.id, 3);
  ok(Kt.stapel().every((x) => x.key.startsWith('f:regeln:')) && Kt.stapel().length === UNITS.find((u) => u.id === 'regeln').formeln.length, 'Lernkarten: mit Fortschritt nur Formeln aus begonnenen Einheiten');
  store.reset(); }

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

// Selbst-Aktualisierung der Android-App: Stand aus der App-Hülle lesen, Dateiliste mit Prüfsummen
{ const U = await import('../app/js/update.js');
  const app = (o) => ({ updateStand: () => (typeof o === 'string' ? o : JSON.stringify(o)) });
  ok(U.updateStand(undefined) === null && U.updateStand({}) === null, 'Update: im Browser gibt es keinen Stand');
  ok(U.updateStand(app('kaputt')) === null, 'Update: unlesbarer Stand wird ignoriert');
  const s = U.updateStand(app({ kanal: 'test', inhalt: '0.22.0', bereit: '0.23.0', huelle: true }));
  ok(s.kanal === 'test' && s.inhalt === '0.22.0' && s.bereit === '0.23.0' && s.huelle === true, 'Update: Stand gelesen');
  ok(U.updateStand(app({ kanal: 'store', bereit: '<b>x</b>', huelle: true })).bereit === '' , 'Update: nur echte Versionsnummern');
  ok(U.updateStand(app({ kanal: 'store', bereit: '1.0.0', huelle: true })).huelle === false, 'Update: im Store-Kanal kein Hinweis auf eine App-Datei');
  ok(U.updateStand(app({ kanal: 'irgendwas' })).kanal === 'aus', 'Update: unbekannter Kanal zählt als aus');
  const { readFileSync } = await import('node:fs'); const { createHash } = await import('node:crypto');
  const st = JSON.parse(readFileSync(new URL('../app/stand.json', import.meta.url), 'utf8')), cfg = readFileSync(new URL('../app/js/config.js', import.meta.url), 'utf8');
  ok(st.version === cfg.match(/VERSION = '([^']+)'/)[1], 'stand.json: Version passt zur App');
  ok(st.huelle >= 1 && st.huelle === JSON.parse(readFileSync(new URL('../android/huelle.json', import.meta.url), 'utf8')).nr, 'stand.json: Nummer der App-Hülle passt');
  ok(st.dateien['index.html'] && st.dateien['sw.js'] && st.dateien['js/app.js'] && !st.dateien['stand.json'], 'stand.json: wichtige Dateien dabei, sich selbst nicht');
  for (const [f, sha] of Object.entries(st.dateien)) {
    ok(/^[A-Za-z0-9_][A-Za-z0-9_.-]*(\/[A-Za-z0-9_][A-Za-z0-9_.-]*)*$/.test(f) && !f.includes('..'), `stand.json: Dateiname für die App lesbar (${f})`);
    ok(createHash('sha256').update(readFileSync(new URL(`../app/${f}`, import.meta.url))).digest('hex') === sha, `stand.json: Prüfsumme stimmt (${f})`);
  }
}

console.log(fails ? `${fails} verschiedene Fehler bei ${n} Prüfungen` : `tests: alle ${n} Prüfungen bestanden`);
process.exit(fails ? 1 : 0);
