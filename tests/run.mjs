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
await (await import('../app/js/faul.js')).ladeAufgaben();   // die Einheiten arbeiten mit Platzhaltern – hier die echten Erzeuger dazuladen

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
  ok(E.isRight(0.67, 2 / 3, '2/3', '0,67') && E.isRight(0.667, 2 / 3, '2/3', '0.667') && !E.isRight(0.66, 2 / 3, '2/3', '0,66') && !E.isRight(0.7, 2 / 3, '2/3', '0,7') && E.isRight(-1.33, -4 / 3, '-4/3', '-1,33'), 'Eingabe: Bruch-Lösung auch als gerundete Dezimalzahl (ab zwei Stellen), Leitstand 18.11.');
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
        ok(!E.isRight(w, r.num, sh.plain, so.plain), `${name} (Stufe ${lv}): getippter Ablenker ${so.plain} wird nicht anerkannt (richtig ${sh.plain})`);
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
{ const HA = await import('../app/js/a/gen2.js'), KA4 = await import('../app/js/a/gen4.js');   // der Filter arbeitet auf den Platzhaltern der App
  const GK = 'HE-GK', raus = [HA.genLn, HA.genSigma, HA.genNormal, HA.genKreuz, HA.genHypothese];
  ok(raus.every((f) => !landOk(f, GK) && landOk(f, 'BY') && landOk(f, 'HE-LK') && landOk(f, '')), 'Lehrplan: fünf Aufgaben-Arten gelten nur im Grundkurs nicht');
  ok([KA4.genPolstelle, KA4.genAsymptote, KA4.genQuotient, KA4.genKugel].every((f) => !landOk(f, 'HE-LK') && !landOk(f, GK) && landOk(f, 'BY')) && [KA4.genRotation, KA4.genUneigentlich, KA4.genAbstandPG, KA4.genEbenenLage].every((f) => landOk(f, 'HE-LK') && !landOk(f, GK)) && [KA4.genTrigAbl, KA4.genTrigInt, KA4.genUnabhaengig, KA4.genVarianz, KA4.genHyper].every((f) => landOk(f, GK)), 'Lehrplan: neue Themen je Land richtig zugeordnet');
  ok(landOk(H.genKumuliert, GK) && landOk(H.genWachstum, GK) && landOk(H.genEbene, GK) && landOk(H.genVierfelder, GK), 'Lehrplan: der übrige Stoff gilt auch im Grundkurs');
  for (const a of ['analysis', 'stochastik', 'geometrie']) ok(practiceGens(a, false, GK).every((f) => landOk(f, GK)) && practiceGens(a, false, GK).length >= 8 && practiceGens(a, false, 'BY').length > practiceGens(a, false, GK).length, `Lehrplan: freies Üben ${a} ohne Grundkurs-fremden Stoff`);
  const ex = await import('../app/js/exam.js');
  for (let i = 0; i < 40; i++) ok(ex.makeTasks(15, 3, null, GK).every((q) => !raus.some((f) => f.name === q.gen)), 'Lehrplan: Abi-Modus Grundkurs ohne fremden Stoff');
  ok(JSON.stringify(ex.makeTasks(6, 3, 20261113).map((q) => q.formula)) === JSON.stringify(ex.makeTasks(6, 3, 20261113, '').map((q) => q.formula)), 'Lehrplan: Tages-Runde bleibt für alle gleich');
  const test = UNITS.find((u) => u.id === 's-test');
  ok(unitExtra(test, GK) && !unitExtra(test, 'BY') && landList(test.bossGens, GK).length === test.bossGens.length, 'Lehrplan: Hypothesentests im Grundkurs als Zusatz markiert, bleiben spielbar');
  const extra = UNITS.flatMap((u) => u.steps.filter((s) => stepExtra(s, GK)).map((s) => `${u.id}/${s.id}`));
  ok(extra.join() === 'integral/lnint,kurve/lnkurve,expln/ln,s-verteilung/sigma,g-ebene/kreuz,g-kugel/kugel,a-wachstum/logistisch,g-ebene2/normal,a-numerik/newton,s-test2/stetig,g-abstand2/hesse,g-abstand2/schief' && UNITS.every((u) => !unitExtra(u, 'BY') && u.steps.every((s) => !stepExtra(s, 'BY'))), `Lehrplan: markierte Schritte (${extra.join()})`);
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
  A.statusLesen({ ok: true, stufe: 'live', ki: false, premium: true }); ok(A.premiumOn() && !A.kiOn(), 'Pro: Code-Feld folgt dem Feld „premium“ des Servers, unabhängig von der KI-Freigabe');
  A.statusLesen({ ok: false, premium: true }); ok(!A.premiumOn(), 'Pro: ohne gültige Antwort kein Code-Feld');
  ok(A.codeNorm(' mt-ab12 cd34-ef56 ') === 'MT-AB12-CD34-EF56' && A.codeNorm('MTAB12CD34EF56') === 'MT-AB12-CD34-EF56' && A.codeNorm('AB-AB12-CD34-EF56') === '' && A.codeNorm('MT-AB12-CD34') === '' && A.codeNorm('') === '', 'Pro: Zugangscode wird in Form gebracht, falsche Codes abgelehnt');
  { store.reset(); const g = store.geraet; ok(/^[A-Za-z0-9]{24}$/.test(g) && store.geraet === g, 'Pro: Geräte-Kennung entsteht einmal und bleibt gleich');
    store.zugang = { code: 'MT-AB12-CD34-EF56', art: 'pass', bis: '2027-06-30' }; ok(store.zugangGilt(new Date(2027, 5, 30, 12)) && !store.zugangGilt(new Date(2027, 6, 1, 12)), 'Pro: Zugang gilt bis einschließlich Ablauftag');
    store.complete('formen', 'murmelbahn', 3); store.reset(); ok(store.geraet === g && store.zugang?.code === 'MT-AB12-CD34-EF56' && store.xp === 0, 'Pro: „Fortschritt zurücksetzen“ löscht weder Kennung noch Zugang');
    store.zugang = { code: 'x', bis: 'morgen' }; ok(store.zugang === null && !store.zugangGilt(), 'Pro: kaputter Zugang im Speicher zählt nicht'); store.zugang = null; }
  A.statusLesen({ ok: true, stufe: 'live', ki: true }); ok(A.kiOn(), 'KI: seit dem Verkaufsstart auch auf der Live-Seite an, wenn der Server sie meldet');
  for (const r of [{ ok: true, stufe: 'live', ki: false }, { ok: true, stufe: 'test', ki: false }, { ok: false, stufe: 'test', ki: true }, { ok: true }, null, { ok: true, stufe: 'test', ki: 'ja' }]) { A.statusLesen(r); ok(!A.kiOn(), `KI: aus bei Status ${JSON.stringify(r)} (KI aus, kein Budget, Fehler, kein Netz)`); }
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
  { const M = await import('../app/js/kimarke.js'); const kt = K.toQuestion(abl());
    ok(kt.geprueft === true && /im Gerät nachgerechnet/.test(M.kiAufgabeText(kt.geprueft)) && !/nicht nachgerechnet/.test(M.kiAufgabeText(kt.geprueft)), 'KI-Kennzeichnung V7: Aufgabe mit bestandener Prüfung trägt „im Gerät nachgerechnet“');
    ok(/nicht nachgerechnet/.test(M.kiAufgabeText(undefined)) && /nicht nachgerechnet/.test(M.kiAufgabeText(false)) && !/im Gerät nachgerechnet/.test(M.kiAufgabeText(undefined)), 'KI-Kennzeichnung V7 (Auflage Recht): ohne bestätigte Prüfung nie „nachgerechnet“');
    ok(M.KI_ANTWORT === 'Antwort einer KI – sie kann Fehler enthalten.', 'KI-Kennzeichnung V7: Wortlaut der KI-Antwort-Marke'); }
  { const fs2 = await import('node:fs'); for (const f of ['quiz.js', 'rechenweg.js', 'blatt.js']) { const q = fs2.readFileSync(new URL(`../app/js/${f}`, import.meta.url), 'utf8'); ok(/kiHinweis\(\)/.test(q) && /from '\.\/kimarke\.js'/.test(q), `KI-Kennzeichnung V7: ${f} hängt kiHinweis() an jede KI-Antwort`); }
    const ka = fs2.readFileSync(new URL('../app/js/kiaufgabe.js', import.meta.url), 'utf8'); ok(/kiAufgabeText\(q\.geprueft\)/.test(ka), 'KI-Kennzeichnung V7: KI-Aufgaben zeigen den Hinweis mit dem Prüfergebnis'); }
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
    const html = B.blattHtml(c, a); ok(html.includes('img/favicon.svg') && html.includes('Mathenachhilfe Online') && html.includes(`Nr. ${c.seed}`) && html.includes('Name:') && (html.match(/class="b-aufgabe"/g) || []).length === c.n && (html.match(/class="b-lsg"/g) || []).length === c.n && !/undefined|NaN/.test(html), 'Arbeitsblatt: Logo, Firmenname, Nummer, Namen-Zeile, Aufgaben und Lösungen vollständig');
  }
  { const r1 = Math.random(); B.bauBlatt({ units: ['regeln'], lv: 3, n: 5, seed: 42 }); const G = await import('../app/js/gen.js'); const x = new Set(); for (let i = 0; i < 6; i++) x.add(G.genPolynom(3).formula); ok(x.size > 1 && r1 >= 0, 'Arbeitsblatt: danach würfeln die Aufgaben wieder echt zufällig'); }
  for (const land of ['', 'BY', 'HE-GK', 'HE-LK']) for (const lv of LV) { const k = B.bauKlausur({ lv, seed: 4711 + lv }, land), be = k.reduce((s, q) => s + q.be, 0);
    ok(k.length === 12 && be === 48 && k.every((q) => B.KLAUSUR_BE.includes(q.be)) && sicht(k) === sicht(B.bauKlausur({ lv, seed: 4711 + lv }, land)), `Probeklausur ${land || 'ohne Land'} Stufe ${lv}: 12 Aufgaben, 48 Punkte, wiederholbar`);
    ok(k.every((q) => landOk({ name: q.gen }, land) || true) && k.every((q) => !UNITS.some((u) => u.title === q.unit && (unitExtra(u, land) || u.grund))), `Probeklausur ${land || 'ohne Land'}: kein Zusatz-Stoff, keine Grundlagen-Einheit`);
    ok(B.blattHtml({ klausur: true, lv, seed: 1 }, k).includes('Notenpunkte'), 'Probeklausur: Punkte-Tabelle auf dem Lösungsblatt'); }
  ok(B.leseHash('klausur_3_99')?.klausur && !B.leseHash('klausur_9_1') && !B.leseHash('gibtsnicht_3_8_1') && !B.leseHash('regeln_3_99_1') && !B.leseHash('') && !B.leseHash('regeln_3_8_abc'), 'Arbeitsblatt: kaputte Adressen werden abgewiesen');
  ok(B.NP_GRENZEN[0][1] === 15 && B.NP_GRENZEN.at(-1)[0] === 0 && B.NP_GRENZEN.every((g, i, a) => !i || (g[0] < a[i - 1][0] && g[1] === a[i - 1][1] - 1)), 'Probeklausur: Notenpunkte-Tabelle lückenlos von 15 bis 0');
  for (const u of UNITS) { const K = Th.karten(u); ok(K.length >= 1 && K.every((c) => c.title && c.html), `Theorie ${u.id}: Kurzfassung vorhanden`);
    const kurz = Th.kapitelHtml(u, false); ok(kurz.includes(u.title) && kurz.includes('img/favicon.svg') && !/undefined|NaN/.test(kurz), `Theorie ${u.id}: Kapitel mit Titel und Logo`); }
  const ALLE_U = (await import('../app/js/units.js')).ALLE_UNITS;   // auch die Einheiten der Klassen 5–10
  ok(Object.keys(Th.LANG).length >= 6 && Object.keys(Th.LANG).every((id) => ALLE_U.some((u) => u.id === id)) && Object.values(Th.LANG).every((L) => L.length >= 4 && L.every(([t, html]) => t && html.length > 80)), 'Theorie: ausführliche Kapitel gehören zu echten Einheiten und haben mehrere Abschnitte');
  { const u = UNITS.find((x) => x.id === 'extrema'); ok(Th.kapitelHtml(u, true).includes('Durchgerechnetes Beispiel') && !Th.kapitelHtml(u, false).includes('Durchgerechnetes Beispiel') && Th.kapitelHtml(UNITS.find((x) => x.id === 'a-trig'), true).includes('Durchgerechnetes Beispiel'), 'Theorie: ausführliche Fassung zeigt das Kapitel, die kurze nicht'); }
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
  A.statusLesen({ ok: true, stufe: 'live', ki: false, kiArten: ['frage'] }); ok(!A.kiArt('frage'), 'KI-Arten: ohne KI-Freigabe nichts');
  A.statusLesen({ ok: true, stufe: 'test', ki: true }); ok(!A.kiArt('frage'), 'KI-Arten: fehlt die Liste, gibt es keine Rückfragen');
  A.statusLesen(null); store.reset(); }

// 14e3) Rechenweg-Prüfer: Bildmaße und Größen-Rechnung
{ const R = await import('../app/js/rechenweg.js');
  ok(JSON.stringify(R.zielMass(4000, 3000)) === '{"b":1600,"h":1200}' && JSON.stringify(R.zielMass(3000, 4000)) === '{"b":1200,"h":1600}' && JSON.stringify(R.zielMass(800, 600)) === '{"b":800,"h":600}' && R.zielMass(0, 0).b === 1, 'Rechenweg: Bild wird auf höchstens 1600 px verkleinert, kleine Bilder bleiben');
  ok(R.bytesVon('data:image/jpeg;base64,' + 'A'.repeat(4000)) === 3000 && R.bytesVon('') === 0 && R.BILD_MAX_BYTES === 1000000 && /keinen Namen/.test(R.FOTO_HINWEIS), 'Rechenweg: Größen-Rechnung und Datenschutz-Hinweis'); }

// 14e4) KI-Aufgaben: Themen-Auswahl
{ const KA = await import('../app/js/kiaufgabe.js'); const T = KA.kiThemen();
  ok(T.length === 3 && T.every(([g, ts]) => g && ts.length >= 8 && new Set(ts).size === ts.length) && T.flatMap(([, ts]) => ts).includes('Kettenregel') && KA.VERSUCHE >= 2, 'KI-Aufgaben: Themen aus allen drei Gebieten, ohne Doppelte'); }

// 14e4b) Paket 0.33: Oberstufen-Erzeuger aus gen8.js – Grundprüfungen, eigenes Nachrechnen, Eintippen
{ const { GENS8 } = await import('../app/js/gen8.js'), { GENS7 } = await import('../app/js/gen7.js'), E8 = await import('../app/js/eingabe.js');
  const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], R8 = (q) => q.options.find((o) => o.correct);
  for (const [name, fn] of Object.entries(GENS8)) { ok(typeof fn.topic === 'string' && fn.topic.length > 3, `${name}: Themen-Name`);
    for (const lv of LV) { const arten = new Set(); for (let i = 0; i < REP; i++) { const q = fn(lv); basics(name, q, lv); arten.add(q.kind);
        ok(q.options.length === 4 && q.options.every((o) => !/\d\.\d/.test(o.tex)), `${name} (Stufe ${lv}): vier Antworten, Komma statt Punkt`); }
      ok(arten.size >= 1 && !arten.has(undefined), `${name} (Stufe ${lv}): Aufgaben-Art benannt`); }
    ok(new Set(LV.map((lv) => JSON.stringify([...new Set(Array.from({ length: 60 }, () => fn(lv).kind))].sort()))).size >= 3, `${name}: die Stufen bringen verschiedene Aufgaben-Arten`); }
  for (const lv of LV) for (let i = 0; i < REP; i++) {
    { const q = GENS8.genNewton(lv); if (q.kind === 'schritt' || q.kind === 'zwei') ok(close(R8(q).num, q.x0 - (q.x0 * q.x0 - q.c) / (2 * q.x0)) && Math.abs(R8(q).num - Math.sqrt(q.c)) < Math.abs(q.x0 - Math.sqrt(q.c)), `genNewton (Stufe ${lv}): Schritt stimmt und kommt der Nullstelle näher`); }
    { const q = GENS8.genHesse(lv); if (q.kind === 'abstand') ok(Number.isInteger(q.a) && q.a >= 1 && close(R8(q).num, q.a), `genHesse (Stufe ${lv}): Abstand ganzzahlig`); }
    { const q = GENS8.genSchnittgerade(lv); if (q.kind === 'richtung') ok(dot3(q.r, q.n1) === 0 && dot3(q.r, q.n2) === 0 && q.r.some((c) => c !== 0), `genSchnittgerade (Stufe ${lv}): Richtung senkrecht auf beiden Normalenvektoren`);
      if (q.kind === 'punkt' || q.kind === 'gerade') ok(dot3(q.n1, q.A) === q.d1 && dot3(q.n2, q.A) === q.d2, `genSchnittgerade (Stufe ${lv}): Punkt liegt in beiden Ebenen`);
      if (q.kind === 'gerade') ok(dot3(q.r, q.n1) === 0 && dot3(q.r, q.n2) === 0, `genSchnittgerade (Stufe ${lv}): Gerade liegt in beiden Ebenen`); }
    { const q = GENS8.genSpiegelung(lv); if (q.kind === 'ebene') { const mitte = q.Q.map((c, j) => (c + q.S[j]) / 2), weg = q.S.map((c, j) => c - q.Q[j]), kr = [weg[1] * q.n[2] - weg[2] * q.n[1], weg[2] * q.n[0] - weg[0] * q.n[2], weg[0] * q.n[1] - weg[1] * q.n[0]];
        ok(mitte.every((c, j) => c === q.F[j]) && dot3(q.n, q.F) === q.d && kr.every((c) => c === 0), `genSpiegelung (Stufe ${lv}): Mitte liegt in der Ebene, Verbindung senkrecht dazu`); }
      if (q.kind === 'lot') ok(dot3(q.n, q.F) === q.d, `genSpiegelung (Stufe ${lv}): Lotfußpunkt liegt in der Ebene`);
      if (q.kind === 'punkt' || q.kind === 'ursprung') ok(q.P.every((c, j) => (c + q.S[j]) / 2 === q.Z[j]), `genSpiegelung (Stufe ${lv}): Zentrum ist die Mitte`); }
    { const q = GENS8.genWindschief(lv); if (q.kind === 'abstand') ok(Number.isInteger(q.d) && q.d >= 1 && close(R8(q).num, q.d), `genWindschief (Stufe ${lv}): Abstand ganzzahlig`); }
    { const q = GENS8.genRueckwaerts(lv); if (q.kind === 'mindestens') ok(1 - (1 - q.p) ** q.n >= q.s && 1 - (1 - q.p) ** (q.n - 1) < q.s && R8(q).num === q.n, `genRueckwaerts (Stufe ${lv}): kleinstes n nachgerechnet`); }
    { const q = GENS8.genZweiseitig(lv); if (q.kind === 'bereich') ok(q.lo >= q.mu - 1.96 * q.si && q.lo - 1 < q.mu - 1.96 * q.si && q.hi <= q.mu + 1.96 * q.si && q.hi + 1 > q.mu + 1.96 * q.si, `genZweiseitig (Stufe ${lv}): Annahmebereich nach innen gerundet`); }
    { const q = GENS8.genHistogramm(lv); if (q.kind === 'modus') { const bn = (n, k) => { let r = 1; for (let j = 0; j < k; j++) r = (r * (n - j)) / (j + 1); return r; }, P = (k) => bn(q.n, k) * q.p ** k * (1 - q.p) ** (q.n - k);
        ok(P(q.m) > P(q.m - 1) && P(q.m) > P(q.m + 1), `genHistogramm (Stufe ${lv}): wahrscheinlichste Trefferzahl nachgerechnet`); } }
    { const q = GENS8.genIntegralfunktion(lv); if (q.kind === 'wert') ok(close(R8(q).num, q.r), `genIntegralfunktion (Stufe ${lv}): Wert stimmt`); }
    { const q = GENS8.genBinomVerteilung(lv), bn = (n, k) => { let r = 1; for (let j = 0; j < k; j++) r = (r * (n - j)) / (j + 1); return r; }, pd = (n, p, k) => bn(n, k) * p ** k * (1 - p) ** (n - k), cd = (n, p, k) => { let x = 0; for (let j = 0; j <= k; j++) x += pd(n, p, j); return x; }, r = R8(q).num, nah = (a, b) => Math.abs(a - b) < 2.1e-4;
      const soll = { einzel: () => pd(q.n, q.p, q.k), summe: () => cd(q.n, q.p, 2), hoechstens: () => cd(q.n, q.p, q.k), mindestens: () => 1 - cd(q.n, q.p, q.k - 1), mehr: () => 1 - cd(q.n, q.p, q.k), genau: () => pd(q.n, q.p, q.k), zwischen: () => cd(q.n, q.p, q.b) - cd(q.n, q.p, q.a - 1) }[q.kind];
      if (soll) ok(nah(r, soll()) && r > 0 && r < 1 && q.options.every((o) => o.num >= 0 && o.num <= 1), `genBinomVerteilung (Stufe ${lv}): ${q.kind} unabhängig nachgerechnet`);
      else ok(cd(q.n, q.p, q.g) >= q.s && cd(q.n, q.p, q.g - 1) < q.s && r === q.g, `genBinomVerteilung (Stufe ${lv}): kleinstes k nachgerechnet`); }
  }
  // Eintippen: Wo eine Zahl verlangt ist, wird die gezeigte Lösung anerkannt und kein Ablenker
  const tippbar = new Set();
  for (const [name, fn] of Object.entries({ ...GENS7, ...GENS8 })) for (const lv of LV) for (let i = 0; i < 40; i++) {
    const q = fn(lv), spec = E8.inputSpec(q); if (!spec) continue; tippbar.add(name);
    const v = E8.parseInput(spec.sh.plain); ok(v !== null && E8.isRight(v, spec.num, spec.sh.plain), `${name} (Stufe ${lv}): getippte Lösung ${spec.sh.plain} wird anerkannt`);
    for (const o of q.options) { if (o.correct) continue; const so = E8.shapeOf(o.tex); if (!so) continue; const w = E8.parseInput(so.plain); ok(!E8.isRight(w, spec.num, spec.sh.plain, so.plain), `${name} (Stufe ${lv}): getippter Ablenker ${so.plain} wird nicht anerkannt (richtig ${spec.sh.plain})`); } }
  ok(tippbar.size >= 8, `Pakete 0.32 und 0.33: zum Eintippen geeignet (${[...tippbar].join(', ')})`);
}

// 14e4c) Paket 0.34: e-Funktion und ln in Integral und Kurvendiskussion – und: Die Stufen müssen ordentlich ansteigen
{ const { GENS9 } = await import('../app/js/gen9.js'), E9 = await import('../app/js/eingabe.js');
  for (const [name, fn] of Object.entries(GENS9)) { ok(typeof fn.topic === 'string' && fn.topic.length > 3, `${name}: Themen-Name`);
    const arten = LV.map((lv) => { const a = new Set(); for (let i = 0; i < REP; i++) { const q = fn(lv); basics(name, q, lv); a.add(q.kind); ok(q.options.length === 4 && q.options.every((o) => !/\d\.\d/.test(o.tex)), `${name} (Stufe ${lv}): vier Antworten, Komma statt Punkt`);
        const spec = E9.inputSpec(q); if (spec) { const v = E9.parseInput(spec.sh.plain); ok(v !== null && E9.isRight(v, spec.num, spec.sh.plain), `${name} (Stufe ${lv}): getippte Lösung wird anerkannt`); } } return a; });
    ok(arten.every((a) => a.size >= 1 && !a.has(undefined)), `${name}: jede Stufe hat benannte Aufgaben-Arten`);
    ok([...arten[0]].every((k) => !arten[4].has(k)) && [...arten[1]].every((k) => !arten[4].has(k)) && [...arten[0]].every((k) => !arten[3].has(k)), `${name}: Stufe 1 und 2 teilen keine Aufgaben-Art mit Stufe 5 – die Stufen steigen wirklich an`);
    ok(arten[4].size >= 4 && new Set(arten.flatMap((a) => [...a])).size >= 10, `${name}: mindestens zehn Aufgaben-Arten, auf Stufe 5 mindestens vier eigene`); }
  { // Leiter: Stufe 1 und 2 nur einfach, Stufe 5 nur steil, dazwischen gemischt; Name und Thema bleiben die des einfachen Erzeugers
    const { leiter } = await import('../app/js/gen9.js'), ein = (lv) => ({ prompt: 'e', kind: 'einfach', lv }), st = (lv) => ({ prompt: 's', kind: 'steil', lv }); ein.topic = 'Thema'; Object.defineProperty(ein, 'name', { value: 'genEinfach' }); Object.defineProperty(st, 'name', { value: 'genSteil' });
    const L = leiter(ein, st), anteil = (lv) => Array.from({ length: 600 }, () => L(lv)).filter((q) => q.kind === 'steil').length / 600;
    ok(L.name === 'genEinfach' && L.topic === 'Thema' && anteil(1) === 0 && anteil(2) === 0 && anteil(5) === 1 && anteil(3) > 0.2 && anteil(3) < 0.46 && anteil(4) > 0.55 && anteil(4) < 0.78, 'Leiter: Anteil schwerer Aufgaben steigt mit der Stufe (0 %, 0 %, ein Drittel, zwei Drittel, 100 %)');
    ok(L(5).von === 'genSteil' && L(5).gen === 'genEinfach' && L(1).von === 'genEinfach' && L(5).topic === 'Thema', 'Leiter: Thema und Name bleiben, „von“ nennt den wirklichen Erzeuger');
    const Un9 = await import('../app/js/units.js'); for (const id of ['regeln', 'extrema', 'integral', 'kurve']) { const u = Un9.ALLE_UNITS.find((x) => x.id === id); ok(u.bossGens.some((g) => typeof g.steil === 'function'), `Einheit ${id}: Boss und gemischtes Üben nutzen die steile Leiter`); } }
  // Stichproben unabhängig nachgerechnet (Zahlenwerte durch numerisches Integrieren bzw. Ableiten)
  const simpson = (f, a, b, n = 2000) => { let s = f(a) + f(b); for (let i = 1; i < n; i++) s += f(a + ((b - a) * i) / n) * (i % 2 ? 4 : 2); return (s * (b - a)) / (3 * n); };
  ok(close(simpson((x) => x * Math.exp(x), 0, 1), 1) && close(simpson(Math.log, 1, Math.E), 1) && close(simpson((x) => x * Math.log(x), 1, Math.E), (Math.E ** 2 + 1) / 4) && close(simpson((x) => Math.log(x) / x, 1, Math.E ** 2), 2) && close(simpson((x) => Math.exp(x) / (Math.exp(x) + 1), 0, Math.log(3)), Math.log(2)) && close(simpson((x) => Math.exp(x) - Math.exp(-x), 0, Math.log(2)), 0.5) && close(simpson((x) => x * Math.exp(-2 * x), 0, 40, 20000), 0.25), 'Paket 0.34: feste Integralwerte (partiell, ln, f′/f, zwischen, uneigentlich) numerisch bestätigt');
  const abl = (f, x) => (f(x + 1e-5) - f(x - 1e-5)) / 2e-5, abl2 = (f, x) => (f(x + 1e-3) - 2 * f(x) + f(x - 1e-3)) / 1e-6, null0 = (v) => Math.abs(v) < 1e-3;
  ok(null0(abl((x) => x * x * Math.exp(-x), 2)) && null0(abl2((x) => x * x * Math.exp(-x), 2 + Math.SQRT2)) && null0(abl((x) => (x * x - 3) * Math.exp(x), -3)) && null0(abl((x) => (x * x - 3) * Math.exp(x), 1)) && null0(abl((x) => Math.exp(x) / x, 1)) && null0(abl((x) => Math.log(x) / x, Math.E)) && null0(abl2((x) => Math.log(x) / x, Math.E ** 1.5)) && null0(abl((x) => x * x * Math.log(x), Math.E ** -0.5)) && null0(abl((x) => x * Math.log(x) ** 2, Math.E ** -2)) && null0(abl2((x) => Math.log(x * x + 1), 1)) && null0(abl2((x) => Math.log(x) ** 2, Math.E)), 'Paket 0.34: feste Extrem- und Wendestellen numerisch bestätigt');
}

// 14e5) Merkbilder: jedes gehört zu einer echten Formel
{ const Mb = await import('../app/js/merkbild.js'); const namen = new Set((await import('../app/js/units.js')).ALLE_UNITS.flatMap((u) => (u.formeln || []).map(([n]) => n)));   // alle Stufen, auch Klasse 5 bis 10
  ok(['Winkelsumme im Dreieck', 'Kreiszahl', 'Erste binomische Formel', 'Antiproportional'].every((n) => Mb.hatMerkbild(n)) && Mb.merkZuTitel('Im Dreieck: 180°') === 'Winkelsumme im Dreieck' && Mb.merkZuTitel('Umfang: einmal abrollen') === 'Kreiszahl' && Mb.merkZuTitel('Erste und zweite Formel') === 'Erste binomische Formel' && Mb.merkZuTitel('Antiproportional: je mehr, desto weniger') === 'Antiproportional' && Mb.merkZuTitel('Umfang') === '', 'Merkbilder Klasse 7 und 8: an den richtigen Erklär-Karten, nicht am Rechteck-Umfang');
  ok(Object.keys(Mb.MERK).length >= 30 && Object.keys(Mb.MERK).every((n) => namen.has(n) && typeof Mb.MERK[n] === 'function'), `Merkbilder: alle gehören zu einer Formel der App (${Object.keys(Mb.MERK).filter((n) => !namen.has(n)).join(', ') || 'ok'})`);
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

// Schreibweise: kein „hoch 1“, kein „1x“ in Aufgaben, Antworten, Tipps und Erklärungen dieser Arten (Fund vom 14.11.2026)
{ const K3 = await import('../app/js/gen3.js');
  for (const [name, fn] of [['genKette', G.genKette], ['genPotenz', K3.genPotenz], ['genQuadGl', K3.genQuadGl], ['genLinGl', K3.genLinGl], ['genTrigAbl', K4.genTrigAbl]]) for (const lv of [1, 2, 3, 4, 5]) for (let i = 0; i < 60; i++) {
    const q = fn(lv), t = [q.formula, q.explain, ...(q.hints || []), ...q.options.flatMap((o) => [o.tex, o.why])].filter((x) => typeof x === 'string').join(' ¦ ');
    ok(!/\)\^\{1\}|x\^\{1\}(?![0-9])/.test(t), `${name}: kein „hoch 1“`); ok(!/(^|[^0-9,{.a-z_])1x(?![0-9_])/.test(t), `${name}: kein „1x“`); } }

// Abgesetzte Formeln: mehrteilige („\qquad“) werden in Zeilen geteilt – aber nie innerhalb von Klammern oder Umgebungen
{ const U = await import('../app/js/ui.js');
  ok(U.texTeile('a=b\\qquad c=d').join('|') === 'a=b|c=d', 'Formel teilen: an \\qquad');
  ok(U.texTeile('\\begin{array}{l}a\\qquad b\\end{array}').length === 1 && U.texTeile('{a\\qquad b}').length === 1 && U.texTeile('\\left(a\\qquad b\\right)\\qquad x').length === 2, 'Formel teilen: nicht in Klammern oder Umgebungen');
  ok(U.texTeile('x').join() === 'x' && U.texTeile('\\qquad').length === 1 && U.texTeile('a\\quad b').length === 1 && U.texTeile('\\{a\\}\\qquad b').length === 2, 'Formel teilen: Sonderfälle');
  ok(U.tex('a\\qquad b') === 'a\\qquad b' && U.tex('a\\qquad b', true) === 'ab', 'Formel teilen: nur abgesetzte Formeln');
  const Th2 = await import('../app/js/theorie.js'); ok(UNITS.filter((u) => u.area !== 'pruefung').every((u) => Th2.hatLang(u) && Th2.LANG[u.id].length >= 5), 'Theorie: jede Lern-Einheit hat ein ausführliches Kapitel mit mindestens fünf Abschnitten');
  for (const [id, L] of Object.entries(Th2.LANG)) for (const [titel, html] of L) { ok(!/\$\{|undefined|NaN/.test(html), `Theorie ${id}: Abschnitt „${titel}“ ohne Platzhalter-Reste`); ok((html.match(/<(p|ul|ol|li)[ >]/g) || []).length === (html.match(/<\/(p|ul|ol|li)>/g) || []).length, `Theorie ${id}: Abschnitt „${titel}“ – HTML-Marken paarig`); } }

// Ausführliche Theorie ist deutlich mehr als die Kurzfassung (Marcel, 14.11.2026): Vertiefung mit weiteren Beispielen und Sonderfällen
{ const Th3 = await import('../app/js/theorie.js'); const { MEHR } = await import('../app/js/theorie-mehr.js');
  for (const u of UNITS.filter((x) => x.area !== 'pruefung')) {
    const M = MEHR[u.id] || [], A = Th3.abschnitte(u.id), titel = A.map(([x]) => x);
    ok(M.length >= 4, `Theorie ${u.id}: Vertiefung mit mindestens vier Abschnitten`);
    ok(M.filter(([x]) => /^Beispiel/.test(x)).length >= 2, `Theorie ${u.id}: mindestens zwei weitere Beispiele`);
    ok(M.some(([x]) => /^Sonderfälle/.test(x)) && M.some(([x]) => /^Genauer hingeschaut/.test(x)), `Theorie ${u.id}: Sonderfälle und Hintergrund`);
    ok(A.length === Th3.LANG[u.id].length + M.length && A.length >= 9 && new Set(titel).size === titel.length, `Theorie ${u.id}: mindestens neun verschiedene Abschnitte`);
    ok(!/^Typische Fehler|^So gehst du vor/.test(Th3.LANG[u.id].at(-1)[0]) || titel.at(-1) === Th3.LANG[u.id].at(-1)[0], `Theorie ${u.id}: Schluss-Abschnitt bleibt am Ende`);
    const lang = Th3.kapitelHtml(u, true), kurz = Th3.kapitelHtml(u, false);
    ok(lang.length > kurz.length * 1.8 && lang.includes('t-bsp') && lang.includes('t-sonder') && !kurz.includes('t-bsp'), `Theorie ${u.id}: ausführlich ist deutlich länger als kurz`);
    for (const [x, html] of M) { ok(!/\$\{|undefined|NaN/.test(html) && html.length > 150, `Theorie ${u.id}: „${x}“ ohne Platzhalter-Reste`); ok((html.match(/<(p|ul|ol|li)[ >]/g) || []).length === (html.match(/<\/(p|ul|ol|li)>/g) || []).length, `Theorie ${u.id}: „${x}“ – HTML-Marken paarig`); }
  }
  ok(Object.keys(MEHR).every((id) => UNITS.some((u) => u.id === id)), 'Theorie: Vertiefung nur für vorhandene Einheiten'); }

// Fließtext ohne rohe Formel-Zeichen: „17{,}5 %“ darf nur innerhalb einer Formel stehen (Fund vom 14.11.2026).
// Dafür werden Formeln hier in «…» gefasst; außerhalb davon darf kein {,}, kein Backslash-Befehl und kein ^{ vorkommen.
{ const alt = window.katex.renderToString; window.katex.renderToString = (s) => `«${String(s).replace(/[«»]/g, '')}»`;
  const Bl = await import('../app/js/blatt.js');
  for (const [name, { fn }] of Bl.genNachName()) for (const lv of [1, 2, 3, 4, 5]) for (let i = 0; i < 25; i++) {
    const q = fn(lv), texte = [q.prompt, q.explain, ...(q.hints || []), ...(q.options || []).map((o) => o.why || '')];
    for (const x of texte) ok(!/\{,\}|\\[a-zA-Z]+|\^\{|_\{/.test(String(x || '').replace(/«[^»]*»/g, '')), `${name}: Fließtext ohne rohe Formel-Zeichen`); }
  window.katex.renderToString = alt; }

// Mittelstufe (Klasse 5 bis 10): Aufgaben-Erzeuger, Einheiten je Jahrgang, Umschalten der Stufe
{ const { MITTEL_GENS: M6 } = await import('../app/js/gen6.js'), { GENS7 } = await import('../app/js/gen7.js'), MITTEL_GENS = { ...M6, ...GENS7 }; const Un = await import('../app/js/units.js');   // gen7.js: Paket 0.32
  const alt = window.katex.renderToString; window.katex.renderToString = (s) => `«${String(s).replace(/[«»]/g, '')}»`;
  const rechne = (f) => { const js = f.replace(/\{,\}/g, '.').replace(/\\cdot/g, '*').replace(/:/g, '/').replace(/\^2/g, '**2'); if (!/^[-+*/().\d\s]+$/.test(js.replace(/\*\*/g, '*'))) return null; try { return Function(`return (${js.replace(/(^|[^\d)])-(\d+(?:\.\d+)?)\*\*2/g, '$1-($2**2)')})`)(); } catch { return null; } };
  for (const [name, fn] of Object.entries(MITTEL_GENS)) { ok(typeof fn.topic === 'string' && fn.topic.length > 3, `${name}: Themen-Name`);
    for (const lv of [1, 2, 3, 4, 5]) { const arten = new Set(); for (let i = 0; i < 120; i++) { const q = fn(lv); arten.add(q.kind ?? q.prompt.slice(0, 24));
      ok(q.options.length === 4 && q.options.filter((o) => o.correct).length === 1, `${name}: vier Antworten, genau eine richtig`);
      ok(new Set(q.options.map((o) => o.tex)).size === 4, `${name}: keine doppelten Antworten`);
      ok(q.options.every((o) => o.correct || (typeof o.why === 'string' && o.why.length > 12)), `${name}: jeder Ablenker hat eine Diagnose`);
      ok(q.hints?.length >= 2 && typeof q.explain === 'string' && q.explain.length > 5 && q.prompt.length > 5, `${name}: Tipps und Erklärung`);
      const alles = [q.prompt, q.formula, q.explain, ...q.hints, ...q.options.flatMap((o) => [o.tex, o.why])].filter(Boolean).join(' ¦ ');
      ok(!/NaN|undefined|Infinity|\[object/.test(alles), `${name}: keine kaputten Werte`);
      ok(!/[0-9]\.[0-9]/.test(alles), `${name}: Komma statt Punkt`);
      for (const x of [q.prompt, q.explain, ...q.hints, ...q.options.map((o) => o.why || '')]) ok(!/\{,\}|\\[a-zA-Z]+|\^\{|_\{/.test(String(x).replace(/«[^»]*»/g, '')), `${name}: Fließtext ohne rohe Formel-Zeichen`);
      if (q.formula && q.prompt === 'Berechne.') { const v = rechne(q.formula.replace(/[«»]/g, '')), r = q.options.find((o) => o.correct);
        if (v !== null && r.num !== undefined) { ok(Math.abs(v - r.num) < 1e-6, `${name}: als richtig markierte Antwort stimmt (${q.formula})`); ok(q.options.every((o) => o.correct || Math.abs(o.num - v) > 1e-9), `${name}: kein Ablenker ist zufällig richtig`); } } }
      ok(arten.size >= 1, `${name}: Stufe ${lv} erzeugt Aufgaben`); } }
  window.katex.renderToString = alt;
  // nachgerechnet: Runden, Teiler, Einheiten, Rechteck
  for (let i = 0; i < 300; i++) { const lv = 1 + (i % 5);
    { const q = MITTEL_GENS.genRunden(lv); ok(q.r % q.s === 0 && Math.abs(q.r - q.n) <= q.s / 2 && q.options.find((o) => o.correct).num === q.r, 'genRunden: nächstes Vielfaches der Rundungsstelle'); }
    { const q = MITTEL_GENS.genTeiler(lv), r = q.options.find((o) => o.correct).num; const gg = (a, b) => (b ? gg(b, a % b) : a);
      if (q.kind === 'ggt') ok(r === gg(q.a, q.b), 'genTeiler: größter gemeinsamer Teiler stimmt'); if (q.kind === 'kgv') ok(r === (q.a * q.b) / gg(q.a, q.b), 'genTeiler: kleinstes gemeinsames Vielfaches stimmt');
      if (q.kind === 'teilbar') ok(r % q.t === 0 && q.options.filter((o) => o.num % q.t === 0).length === 1, 'genTeiler: genau eine Zahl ist teilbar');
      if (q.kind === 'prim') { const prim = (n) => n > 1 && [...Array(Math.floor(Math.sqrt(n)) + 1).keys()].slice(2).every((d) => n % d !== 0); ok(prim(r) && q.options.filter((o) => prim(o.num)).length === 1, 'genTeiler: genau eine Primzahl'); } }
    { const q = MITTEL_GENS.genEinheit(lv); ok(Math.abs(q.r - (q.runter ? q.v * q.f : q.v / q.f)) < 1e-9 && Math.abs(q.options.find((o) => o.correct).num - q.r) < 1e-6, 'genEinheit: Umrechnung stimmt'); }
    { const q = MITTEL_GENS.genKuerzen(lv), r = q.options.find((o) => o.correct); const gg = (a, b) => (b ? gg(b, a % b) : a); ok(Math.abs(r.wert - q.a / q.b) < 1e-9 && (q.erw || gg(r.zaehler, r.nenner) === 1), 'genKuerzen: gleicher Wert, vollständig gekürzt'); }
    { const q = MITTEL_GENS.genLinFunktion(lv); if (q.kind === 'wert' || q.kind === 'null') ok(Math.abs(q.options.find((o) => o.correct).num - q.r) < 1e-9, 'genLinFunktion: Ergebnis stimmt'); } }
  // Entdecker-Spiele der unteren Klassen: fünf eigene Level-Sätze, jede Aufgabe mit der hinterlegten Lösung lösbar
  { const St = await import('../app/js/games/strahl.js'), Sf = await import('../app/js/games/streifen.js'), Kg = await import('../app/js/games/kaestchen.js');
    for (const [name, lf] of [['strahl', St.levelsFor], ['frost', St.levelsFrost], ['streifen', Sf.levelsFor], ['kaestchen', Kg.levelsFor]]) {
      ok(new Set([1, 2, 3, 4, 5].map((lv) => JSON.stringify(lf(lv)))).size === 5 && [1, 2, 3, 4, 5].every((lv) => lf(lv).length >= 3), `${name}: fünf verschiedene Level-Sätze mit je mindestens drei Aufgaben`); }
    for (const lv of [1, 2, 3, 4, 5]) {
      for (const M of [...St.levelsFor(lv), ...St.levelsFrost(lv)]) { ok(M.ziel >= M.min && M.ziel <= M.max && (M.ziel - M.min) % M.schritt === 0 && St.gesetzt(M, M.ziel) && !St.gesetzt(M, M.ziel + M.tol + M.schritt), `Zahlenstrahl: Ziel erreichbar (${M.text})`);
        if (M.runde) ok(M.runde[0] <= M.ziel && M.ziel < M.runde[1] && M.richtig === (M.ziel - M.runde[0] >= M.runde[1] - M.ziel ? M.runde[1] : M.runde[0]) && M.text.replace(/\D/g, '') === String(M.ziel), `Zahlenstrahl: Rundung und Text passen (${M.text})`);
        if (M.grad) { const z = [...M.text.matchAll(/(−?\d+) Grad(?: (kälter|wärmer))?/g)].map((x) => [+x[1].replace('−', '-'), x[2]]); const r = z.slice(1).reduce((s, [v, w]) => s + (w === 'kälter' ? -v : v), z[0][0]); ok(z[0][0] === M.start && r === M.ziel, `Thermometer: Ergebnis stimmt (${M.text})`); } }
      for (const M of Sf.levelsFor(lv)) ok(Number.isInteger(M.soll) && M.soll >= 1 && M.soll < M.teile && Sf.passt(M, M.soll) && !Sf.passt(M, M.soll + 1) && M.soll / M.teile === M.zaehler / M.nenner, `Bruch-Streifen: ${M.zaehler}/${M.nenner} auf ${M.teile} Teilen`);
      for (const M of Kg.levelsFor(lv)) { ok(Kg.gebaut(M, M.sol[0], M.sol[1]) && M.sol[0] <= 12 && M.sol[1] <= 8 && !Kg.gebaut(M, M.sol[0] + 1, M.sol[1] + 1), `Kästchen: Lösung passt (${M.text})`);
        const zahlen = M.text.match(/\d+/g).map(Number); ok((M.A === null || zahlen.includes(M.A) || M.ziel) && (M.U === null || zahlen.includes(M.U) || M.ziel), `Kästchen: Text nennt die gesuchten Zahlen (${M.text})`);
        if (M.ziel === 'kleinster Umfang') { let best = 99; for (let b = 1; b <= 12; b++) for (let h = 1; h <= 8; h++) if (b * h === M.A) best = Math.min(best, 2 * (b + h)); ok(best === M.U, 'Kästchen: kleinster Umfang nachgerechnet'); }
        if (M.ziel === 'größte Fläche') { let best = 0; for (let b = 1; b <= 12; b++) for (let h = 1; h <= 8; h++) if (2 * (b + h) === M.U) best = Math.max(best, b * h); ok(best === M.A, 'Kästchen: größte Fläche nachgerechnet'); } } }
    { const Fd = await import('../app/js/games/felder.js'), Sw = await import('../app/js/games/stellen.js'), Wu = await import('../app/js/games/wuerfel.js'), Au = await import('../app/js/games/ausgleich.js');
      for (const [name, lf] of [['felder', Fd.levelsFor], ['stellen', Sw.levelsFor], ['wuerfel', Wu.levelsFor], ['ausgleich', Au.levelsFor]]) ok(new Set([1, 2, 3, 4, 5].map((lv) => JSON.stringify(lf(lv)))).size === 5 && [1, 2, 3, 4, 5].every((lv) => lf(lv).length >= 3), `${name}: fünf verschiedene Level-Sätze mit je mindestens drei Aufgaben`);
      ok(Fd.teiler(12).join() === '1,2,3,4,6,12' && Fd.teiler(7).join() === '1,7', 'Plättchen-Felder: Teiler stimmen');
      ok(Sw.zahlText('34', -1) === '3,4' && Sw.zahlText('5', -1) === '0,5' && Sw.zahlText('4', -3) === '0,004' && Sw.zahlText('1250', -3) === '1,25' && Sw.zahlText('7', 3) === '7 000' && Sw.zahlText('305', 0) === '305', 'Stellenwert: Zahl aus Ziffern und Stelle');
      for (const lv of [1, 2, 3, 4, 5]) {
        for (const M of Fd.levelsFor(lv)) ok(M.n <= 36 && M.sol.every((d) => M.n % d === 0) && M.sol.length === Fd.teiler(M.n).length && Fd.levelsFor(lv).some((x) => x.sol.length === 2), `Plättchen-Felder: ${M.n} mit allen Teilern, je Stufe eine Primzahl`);
        for (const M of Sw.levelsFor(lv)) ok(M.schritte !== 0 && Math.abs(M.schritte) <= 5 && M.start >= -4 && M.ziel >= -4 && M.start + M.ziffern.length - 1 <= 3 && M.ziel + M.ziffern.length - 1 <= 3 && Math.abs(parseFloat(Sw.zahlText(M.ziffern, M.ziel).replace(/ /g, '').replace(',', '.')) / parseFloat(Sw.zahlText(M.ziffern, M.start).replace(/ /g, '').replace(',', '.')) - 10 ** M.schritte) < 1e-9 * 10 ** Math.abs(M.schritte), `Stellenwert: ${M.ziffern} von ${M.start} nach ${M.ziel} passt auf die Tafel`);
        for (const M of Wu.levelsFor(lv)) { ok(Wu.gebaut(M, ...M.sol) && M.sol[0] <= 6 && M.sol[1] <= 5 && M.sol[2] <= 5 && !Wu.gebaut(M, M.sol[0], M.sol[1], M.sol[2] + 1) && M.text.includes(String(M.V)), `Würfel-Baumeister: Lösung passt (${M.text})`); }
        for (const M of Au.levelsFor(lv)) ok(Number.isInteger(M.mittel) && !Au.gleich(M.werte) && Au.gleich(M.werte.map(() => M.mittel)) && Math.max(...M.werte) <= 10 && M.werte.length <= 6, `Türme ausgleichen: Mittelwert ist ganzzahlig (${M.werte.join(',')})`); } }
    { const Wg = await import('../app/js/games/waage.js'), Pz = await import('../app/js/games/prozent.js'), Gz = await import('../app/js/games/geraden.js'), Gr = await import('../app/js/games/gluecksrad.js'), Pq = await import('../app/js/games/quadrate.js'), Zw = await import('../app/js/games/zinsen.js'), Ek = await import('../app/js/games/kreis.js');
      for (const [name, lf] of [['waage', Wg.levelsFor], ['prozent', Pz.levelsFor], ['geraden', Gz.levelsFor], ['gluecksrad', Gr.levelsFor], ['quadrate', Pq.levelsFor], ['zinsen', Zw.levelsFor], ['kreis', Ek.levelsFor]]) ok(new Set([1, 2, 3, 4, 5].map((lv) => JSON.stringify(lf(lv)))).size === 5 && [1, 2, 3, 4, 5].every((lv) => lf(lv).length >= 3), `${name}: fünf verschiedene Level-Sätze mit je mindestens drei Aufgaben`);
      for (const lv of [1, 2, 3, 4, 5]) {
        for (const M of Wg.levelsFor(lv)) ok(Number.isInteger(M.x) && M.x >= 1 && M.a > M.c && M.d >= M.b && M.a * M.x + M.b === M.c * M.x + M.d && M.a + M.b <= 12 && M.c + M.d <= 24, `Waage: ${Wg.gleichung(M)} hat die ganzzahlige Lösung ${M.x}`);
        for (const M of Pz.levelsFor(lv)) { const z = M.text.match(/\d+/g).map(Number), w = (M.G * M.ziel) / 100;
          ok(M.ziel % 5 === 0 && M.ziel > 0 && M.ziel <= M.max && z.includes(M.G) && (z.includes(M.ziel) || z.includes(w) || z.includes(Math.abs(M.ziel - 100))), `Prozent-Streifen: Ziel einstellbar und Text passt (${M.text})`);
          ok((M.max > 100) === /steigt|sinkt/.test(M.text) && (!/steigt/.test(M.text) || M.ziel > 100) && (!/sinkt/.test(M.text) || M.ziel < 100), `Prozent-Streifen: Skala passt zur Aufgabe (${M.text})`); }
        for (const M of Gz.levelsFor(lv)) ok(Math.abs(M.m) <= 3 && (M.m * 2) % 1 === 0 && Number.isInteger(M.b) && Math.abs(M.b) <= 6 && M.A[0] !== M.B[0] && [M.A, M.B].every(([x, y]) => Math.abs(x) <= 7 && Math.abs(y) <= 7 && y === M.m * x + M.b), `Geraden-Zieher: Punkte liegen auf der Geraden und im Bild (m=${M.m}, b=${M.b})`);
        for (const M of Gr.levelsFor(lv)) ok(Number.isInteger(M.soll) && M.soll >= 1 && M.soll < M.felder && M.felder <= 12 && Gr.passt(M, M.soll) && !Gr.passt(M, M.soll + 1) && (M.verlieren ? M.felder - M.soll : M.soll) / M.felder === M.z / M.n, `Glücksrad: ${M.z}/${M.n} auf ${M.felder} Feldern`);
        for (const M of Pq.levelsFor(lv)) { const z = M.text.match(/\d+/g).map(Number);
          ok(Pq.getroffen(M, ...M.sol) && M.sol.every((k) => k >= 1 && k <= 12) && !Pq.getroffen(M, M.sol[0] + 1, M.sol[1]) && (z.includes(M.c2) || z.includes(Math.sqrt(M.c2)) || (z.includes(M.sol[0]) && z.includes(M.sol[1]))), `Pythagoras-Quadrate: Lösung passt (${M.text})`); }
        for (const M of Zw.levelsFor(lv)) { if (M.art === 'jahre') ok(M.sol === Zw.erstesJahr(M.p, M.ziel) && M.sol >= 2 && M.sol <= 15 && M.text.includes(String(Math.abs(M.p))), `Wachstums-Säulen: erstes Jahr nachgerechnet (${M.text})`);
          else ok(M.sol === Zw.kleinsterZins(M.n, M.ziel) && M.sol <= 20 && M.text.includes(String(M.n)), `Wachstums-Säulen: kleinster Zinssatz nachgerechnet (${M.text})`); }
        for (const M of Ek.levelsFor(lv)) { const z = (M.text.match(/\d+(,\d+)?/g) || []).map((t) => parseFloat(t.replace(',', '.'))), r = (M.ziel * Math.PI) / 180, s2 = (v) => Math.round(v * 100) / 100;
          ok(M.ziel % 5 === 0 && M.ziel > 0 && M.ziel <= 90, `Dreieck im Kreis: Winkel einstellbar (${M.text})`);
          if (/etwa|soll 0,5/.test(M.text)) { const f = /Sinus/.test(M.text) ? Math.sin : Math.cos; ok(z.includes(s2(f(r))) && [...Array(19).keys()].filter((k) => s2(f((k * 5 * Math.PI) / 180)) === s2(f(r))).length === 1, `Dreieck im Kreis: Wert stimmt und ist eindeutig (${M.text})`); } } }
      { const Zp = await import('../app/js/games/zahlenpaare.js'), Bm = await import('../app/js/games/bruchmal.js');
        for (const [name, lf] of [['zahlenpaare', Zp.levelsFor], ['bruchmal', Bm.levelsFor]]) ok(new Set([1, 2, 3, 4, 5].map((lv) => JSON.stringify(lf(lv)))).size === 5 && [1, 2, 3, 4, 5].every((lv) => lf(lv).length >= 3), `${name}: fünf verschiedene Level-Sätze mit je mindestens drei Aufgaben`);
        for (const lv of [1, 2, 3, 4, 5]) {
          for (const M of Zp.levelsFor(lv)) { const g = Zp.gemischt(M);
            ok(M.paare.every(([a, b]) => a + b === M.ziel && a > 0 && b > 0) && M.zahlen.every((v, i) => M.zahlen.filter((w, j) => j !== i && v + w === M.ziel).length === 1) && M.zahlen.length <= 8, `Zahlen-Paare: jede Zahl hat genau einen Partner (Ziel ${M.ziel})`);
            ok(g.length === M.zahlen.length && new Set(g.map((x) => x.i)).size === g.length && g.every((x) => M.zahlen[x.i] === x.v) && g.every((x, k) => k === 0 || x.v + g[k - 1].v !== M.ziel || M.paare.length < 3), `Zahlen-Paare: gemischt, Partner liegen nicht nebeneinander (Ziel ${M.ziel})`); }
          for (const M of Bm.levelsFor(lv)) { const [z, n] = Bm.produkt(M);
            ok(M.a < M.b && M.c < M.d && M.a >= 1 && M.c >= 1 && M.b <= 6 && M.d <= 6 && Bm.richtig(M, M.a, M.c) && !Bm.richtig(M, M.a, M.c + 1) && Math.abs(z / n - (M.a / M.b) * (M.c / M.d)) < 1e-12, `Bruch-Felder: ${M.c}/${M.d} von ${M.a}/${M.b}`); } } }
      { // Paket 0.32: nachgerechnet, was sich nachrechnen lässt, und die zwei neuen Spiele
        const wert = (f) => Function(`return (${f.replace(/\\,/g, '').replace(/\{,\}/g, '.').replace(/\\cdot/g, '*').replace(/:/g, '/')})`)();
        for (const lv of [1, 2, 3, 4, 5]) for (let i = 0; i < 300; i++) {
          { const q = GENS7.genSchriftlich(lv), r = q.options.find((o) => o.correct).num; if (Math.abs(wert(q.formula) - r) > 1e-9) { ok(false, `genSchriftlich: ${q.formula} = ${r}`); break; } }
          { const q = GENS7.genRational(lv), r = q.options.find((o) => o.correct).num; if (q.kind !== 'potenz' && Math.abs(wert(q.formula) - r) > 1e-9) { ok(false, `genRational: ${q.formula} = ${r}`); break; } }
          { const q = GENS7.genGleichungKlammer(lv), x = q.options.find((o) => o.correct).num, [li, re] = q.formula.split('='), ein = (t) => Function('x', `return (${t.replace(/\\dfrac\{x\}\{(\d+)\}/g, '(x/$1)').replace(/(\d)\(/g, '$1*(').replace(/(\d)x/g, '$1*x')})`)(x);
            if (Math.abs(ein(li) - ein(re)) > 1e-9) { ok(false, `genGleichungKlammer: ${q.formula} mit x = ${x}`); break; } }
          { const q = GENS7.genWinkelArt(lv); if (q.options.some((o) => o.num < 0 || (q.kind !== 'art' && q.kind !== 'voll' && o.num > 720))) { ok(false, `genWinkelArt: unmögliche Winkel (${q.prompt})`); break; } }
        }
        ok(true, 'Paket 0.32: schriftliches Rechnen, rationale Zahlen und Gleichungen durch Einsetzen nachgerechnet');
        const Sk = await import('../app/js/games/gitter.js'), Wz = await import('../app/js/games/zeiger.js');
        for (const [name, lf] of [['gitter', Sk.levelsFor], ['zeiger', Wz.levelsFor]]) ok(new Set([1, 2, 3, 4, 5].map((lv) => JSON.stringify(lf(lv)))).size === 5 && [1, 2, 3, 4, 5].every((lv) => lf(lv).length >= 3), `${name}: fünf verschiedene Level-Sätze mit je mindestens drei Aufgaben`);
        for (const lv of [1, 2, 3, 4, 5]) {
          for (const M of Sk.levelsFor(lv)) ok(M.max - M.min <= 10 && M.punkte.length >= 2 && M.punkte.every(([x, y]) => x >= M.min && x <= M.max && y >= M.min && y <= M.max) && new Set(M.punkte.map(String)).size === M.punkte.length && (lv >= 4) === (M.min < 0), `Schatzkarte: Punkte liegen auf der Karte (Stufe ${lv})`);
          for (const M of Wz.levelsFor(lv)) { const z = (M.text.match(/\d+/g) || []).map(Number);
            ok(M.ziel % 5 === 0 && M.ziel > 0 && M.ziel <= (lv >= 4 ? 360 : 180), `Winkel-Zeiger: einstellbar (${M.text})`);
            if (/^Stell (\d+|einen \w+ Winkel von \d+)° ein/.test(M.text) || /: \d+°\.$/.test(M.text)) ok(z.includes(M.ziel), `Winkel-Zeiger: Text nennt das Ziel (${M.text})`); } }
        ok(Wz.art(45) === 'spitz' && Wz.art(90) === 'recht' && Wz.art(135) === 'stumpf' && Wz.art(180) === 'gestreckt' && Wz.art(270) === 'überstumpf', 'Winkel-Zeiger: Winkelarten'); }
      for (const u of Un.ALLE_UNITS.filter((x) => ['7', '8', '9', '10'].includes(x.jg))) ok(new Set(u.steps.map((s) => s.id)).size === u.steps.length && u.steps.some((s) => s.kind === 'Festigen'), `${u.id}: Schritte eindeutig, mit Festigen`);
      for (const jg of ['7', '8', '9', '10']) { const us = Un.ALLE_UNITS.filter((x) => x.jg === jg); ok(us.length >= 3 && us.filter((u) => u.steps.some((s) => s.kind === 'Entdecken')).length >= 2, `Klasse ${jg}: mindestens drei Einheiten, zwei davon mit Spiel`); } }
    for (const u of Un.ALLE_UNITS.filter((x) => ['5', '6'].includes(x.jg))) ok(u.steps[0].kind === 'Entdecken' || u.steps.some((s) => s.kind === 'Entdecken'), `${u.id}: Einheiten der Klassen 5 und 6 haben ein Spiel zum Entdecken`);
    for (const id of ['k5-zahlen', 'k5-ganz', 'k5-groessen', 'k6-bruch']) ok(Un.ALLE_UNITS.find((u) => u.id === id).steps.some((s) => s.kind === 'Entdecken'), `${id}: beginnt mit einem Spiel zum Entdecken`); }
  // Einheiten je Jahrgang
  ok(Un.JAHRGAENGE.join() === '5,6,7,8,9,10,os' && Un.jgName('7') === 'Klasse 7' && Un.jgName('os') === 'Oberstufe', 'Jahrgänge: Liste und Namen');
  const ids = Un.ALLE_UNITS.map((u) => u.id); ok(new Set(ids).size === ids.length, 'Einheiten: Kennungen aller Jahrgänge sind eindeutig');
  for (const jg of ['5', '6', '7', '8', '9', '10']) { const us = Un.ALLE_UNITS.filter((u) => u.jg === jg);
    ok(us.length >= 2, `Klasse ${jg}: mindestens zwei Einheiten`);
    for (const u of us) { ok(/^k\d+-[a-z]+$/.test(u.id) && /^m[a-z]+$/.test(u.area) && u.title && u.sub, `${u.id}: Kennung, Gebiet, Titel`);
      ok(u.bossName && u.bossSymbol && u.bossGens?.length >= 1 && u.why?.length > 40 && u.formeln?.length >= 1, `${u.id}: Boss, „Wo brauche ich das?“, Formeln`);
      ok(u.steps.at(-1).kind === 'Boss' && u.steps.filter((s) => s.kind === 'Benennen').length >= 1 && u.steps.filter((s) => s.kind === 'Brücke').length >= 1 && u.steps.some((s) => s.kind === 'Festigen'), `${u.id}: benennen, üben, festigen, Boss`);
      ok(new Set(u.steps.map((s) => s.id)).size === u.steps.length && u.steps.every((s) => /^[a-z]+$/.test(s.id) && typeof s.run === 'function'), `${u.id}: Schritte eindeutig und spielbar`);
      ok(u.bossGens.every((g) => typeof g.topic === 'string'), `${u.id}: jede Boss-Aufgabe hat einen Themen-Namen`); } }
  // Umschalten: UNITS und AREAS zeigen nur die gewählte Stufe; Standard und Zurücksetzen
  store.reset(); ok(store.jahrgang === 'os', 'Jahrgang: ohne Wahl gilt die Oberstufe');
  Un.jahrgangAnwenden(); const osN = Un.UNITS.length; ok(osN === UNITS.length && Un.AREAS.some((a) => a.id === 'pruefung') && Un.istOber(), 'Jahrgang Oberstufe: alle bisherigen Einheiten und der Prüfungs-Reiter');
  store.jahrgang = '6'; Un.jahrgangAnwenden(); ok(store.jahrgangGewaehlt && Un.UNITS.length >= 2 && Un.UNITS.every((u) => u.jg === '6') && Un.AREAS.every((a) => a.mittel && a.info && Un.UNITS.some((u) => u.area === a.id)) && !Un.istOber(), 'Jahrgang 6: nur Einheiten und Gebiete der Klasse 6');
  ok(Un.practiceGens(Un.AREAS[0].id).length >= 1 && Un.baldHier().length >= 2, 'Jahrgang 6: freies Üben und „Kommt bald“');
  { const Bl = await import('../app/js/blatt.js'); ok(Bl.gebiete().length === Un.AREAS.length && Bl.themen().length === Un.UNITS.length && Bl.bauKlausur({ lv: 3, seed: 7 }).length >= 6 && Bl.blattName({ klausur: true }) === 'Probe-Arbeit', 'Jahrgang 6: Arbeitsblatt und Probe-Arbeit aus den Einheiten der Klasse'); }
  store.complete('k6-bruch', 'anteil', 3); store.reset(); ok(store.jahrgang === '6', 'Jahrgang: bleibt bei „Fortschritt zurücksetzen“');
  store.jahrgang = 'unsinn'; ok(store.jahrgang === 'os', 'Jahrgang: Unbekanntes zählt als Oberstufe');
  store.jahrgang = 'os'; Un.jahrgangAnwenden(); ok(Un.UNITS.length === osN, 'Jahrgang: zurück zur Oberstufe'); store.reset(); }

// Schriftgröße: nur drei Werte, bleibt beim Zurücksetzen erhalten; jede Schrift im Stil folgt dem Faktor
{ store.reset(); ok(store.schrift === 'normal', 'Schrift: Standard ist normal');
  store.schrift = 'klein'; ok(store.schrift === 'klein', 'Schrift: klein wird gemerkt'); store.schrift = 'riesig'; ok(store.schrift === 'normal', 'Schrift: Unbekanntes zählt als normal');
  store.schrift = 'gross'; store.complete('formen', 'murmelbahn', 3); store.reset(); ok(store.schrift === 'gross' && store.xp === 0, 'Schrift: bleibt bei „Fortschritt zurücksetzen“'); store.schrift = 'normal';
  const { readFileSync } = await import('node:fs'); const css = readFileSync(new URL('../app/css/app.css', import.meta.url), 'utf8');
  ok(!/font-size:[0-9.]+px/.test(css), 'Schrift: jede feste Schriftgröße im Stil folgt dem Faktor (font-size:calc(…px*var(--fs,1)))');
  ok(/data-schrift="klein"\]\{--fs:\.88\}/.test(css) && /data-schrift="gross"\]\{--fs:1\.12\}/.test(css), 'Schrift: Faktoren für klein und groß'); }

// Selbst-Aktualisierung der Android-App: Stand aus der App-Hülle lesen, Dateiliste mit Prüfsummen
{ // 30-Tage-Codes laufen ab dem ersten Einlösen (Leitstand 18.11.): Die App speichert genau das Datum aus der Antwort von /api/zugang.
  const fsx = await import('node:fs'); const ex = fsx.readFileSync(new URL('../app/js/extras.js', import.meta.url), 'utf8'), pl = fsx.readFileSync(new URL('../app/js/prolink.js', import.meta.url), 'utf8');
  ok([ex, pl].every((t) => /store\.zugang = \{ code, art: String\(r\.art \|\| ''\), bis: r\.bis,/.test(t)) && !/tage30[^\n]*(\+|setDate)/.test(ex + pl), '30-Tage-Code: Ablaufdatum kommt nur aus der Antwort von /zugang (kein eigenes Rechnen)'); }
{ const A = await import('../app/js/arbeit.js'), Z = await import('../app/js/zaehler.js');   // Klassenarbeit: Probestunden-Anfrage (Marcel 18.11.)
  const l = A.probeLink({ units: [{ title: 'Lineare Funktionen' }] }, '8');
  ok(l.startsWith('https://www.mathenachhilfe-online.com/probestunde/?') && /src=mathetrainer-klassenarbeit/.test(l) && /klasse=8/.test(l) && /thema=/.test(l) && Z.ereignisFuer(l) === 'probestunde_klick', `Klassenarbeit: Link zur Probestunde (/probestunde/) mit Herkunft (${l})`);
  ok(!(await import('node:fs')).readFileSync(new URL('../app/js/arbeit.js', import.meta.url), 'utf8').includes('crashkurs'), 'Klassenarbeit: kein Crashkurs-Hinweis (nur für Kunden)'); }
{ const Z = await import('../app/js/zaehler.js'), fs = await import('node:fs');   // Knopf „← Alle Apps“ (Leitstand 18.11.)
  ok(Z.alleAppsLink('trainer.mathenachhilfe-online.com') === 'https://www.mathenachhilfe-online.com/lern-apps/?src=mathetrainer-kopf', `Alle Apps: live → www (${Z.alleAppsLink('trainer.mathenachhilfe-online.com')})`);
  ok(Z.alleAppsLink('trainer-test.mathenachhilfe-online.com') === 'https://staging.mathenachhilfe-online.com/lern-apps/?src=mathetrainer-kopf', 'Alle Apps: Test-Stufe → staging');
  const k = Z.alleAppsKnopf();
  ok(/>← Alle Apps<\/a>$/.test(k) && !/target=/.test(k) && /nur-web/.test(k) && !/€|Preis/.test(k), 'Alle Apps: gleicher Tab, nur Web, ohne Preis');
  const app = fs.readFileSync(new URL('../app/js/app.js', import.meta.url), 'utf8'), css = fs.readFileSync(new URL('../app/css/app.css', import.meta.url), 'utf8');
  ok((app.match(/\$\{alleAppsKnopf\(\)\}/g) || []).length === 2 && /\.alle-apps\{[^}]*min-height:44px/.test(css), 'Alle Apps: genau auf Start und Übersicht, mindestens 44 px hoch');
}
{ const css = (await import('node:fs')).readFileSync(new URL('../app/css/app.css', import.meta.url), 'utf8');   // PC: Formular-Karten einspaltig (Lernkarten, Eltern, Bericht, 19.11.)
  const pc = css.slice(css.indexOf('@media (min-width:900px){'));
  ok(/\.view\.stack>section\.card\.stack\{grid-template-columns:minmax\(0,1fr\)\}/.test(pc) && pc.indexOf('section.card.stack{grid-template-columns') > pc.indexOf('.view.stack>section.stack,.steps{display:grid;grid-template-columns:1fr 1fr'), 'PC: Karten mit Formular oder Text bleiben einspaltig (nach der Zwei-Spalten-Regel für Listen)');
}
{ const Q = await import('../app/js/querverweise.js'), { UNITS } = await import('../app/js/units.js');   // Querverweise zu den anderen Lern-Apps (AppZentrale 19.11.)
  const RB = ['add', 'sub', 'mul', 'div', 'gap', 'doppel', 'geld', 'frac', 'dec', 'pct', 'neg', 'pow', 'term', 'linear', 'zehner', 'order', 'round', 'unit', 'divis', 'eq', 'lgs', 'zeit', 'geo', 'folge', 'dreisatz', 'zins', 'wahr', 'stat', 'kreis', 'word', 'mix'];   // Rechenblitz-Themen, in der App nachgesehen
  const KF = ['koordinaten', 'brueche', 'winkel', 'massstab', 'zuordnungen', 'geraden', 'prozent', 'rendezvous', 'pythagoras', 'parabeln', 'nullstellen', 'trigonometrie', 'wellen', 'verschobene-wellen', 'potenzfunktionen', 'logarithmus', 'terme'];
  const EX = ['schwimmen', 'hebel', 'rollen', 'kraft', 'fallen', 'pendel', 'strom', 'magnet', 'waerme', 'licht', 'optik', 'schall', 'trennen', 'saeure', 'reaktion', 'vererbung', 'zellen', 'ernaehrung', 'oekologie', 'koerper'];
  const RL = ['erleben', 'rotation', 'galton', 'zufall', 'raumflug'];   // nur freie Raumlicht-Ziele (binomial, baumeister = Pro)
  const ids = new Set([...UNITS, ...(await import('../app/js/units-m.js')).MITTEL].map((u) => u.id)); let alle = [];
  for (const [u, v] of Object.entries(Q.VERWEISE)) { ok(ids.has(u), `Querverweise: Einheit ${u} gibt es`); for (const [app, k] of v) { alle.push(Q.appAdresse(app, k, 'trainer.mathenachhilfe-online.com')); ok({ rechenblitz: RB, kurvenflug: KF, experimentopia: EX, raumlicht: RL }[app]?.includes(k), `Querverweise: ${app} kennt „${k}“ (${u})`); } }
  ok(alle.every((l) => /^https:\/\/(kurvenflug|rechenblitz|raumlicht|experimentopia|wissensgarten)\.mathenachhilfe-online\.com\//.test(l) && /src=mathetrainer-theorie/.test(l) && !/shop|produkt|kasse|warenkorb|preis/i.test(l)), 'Querverweise: nur freie Inhalte der Lern-Apps, mit Herkunft, nie Kaufseiten');
  ok(Q.appAdresse('kurvenflug', 'geraden', 'trainer-test.mathenachhilfe-online.com') === 'https://kurvenflug-test.mathenachhilfe-online.com/?src=mathetrainer-theorie#kapitel=geraden', `Querverweise: Test-Stufe → Test-Apps (${Q.appAdresse('kurvenflug', 'geraden', 'trainer-test.mathenachhilfe-online.com')})`);
  ok(Q.appAdresse('rechenblitz', 'lgs', 'trainer.mathenachhilfe-online.com') === 'https://rechenblitz.mathenachhilfe-online.com/?thema=lgs&stufe=auto&modus=training&src=mathetrainer-theorie', 'Querverweise: Rechenblitz-Format ?thema=…&stufe=…&modus=training');
  const kasten = Q.verweisKasten('k8-lgs', 'trainer.mathenachhilfe-online.com');
  ok(/Passt dazu in anderen Apps/.test(kasten) && /KurvenFlug/.test(kasten) && /Rechenblitz/.test(kasten) && /Wissensgarten/.test(kasten) && /noprint/.test(kasten) && !/target=/.test(kasten), 'Querverweise: Kasten unter der Theorie, nicht im Druck, gleicher Tab');
  const mids = new Set((await import('../app/js/units-m.js')).MITTEL.map((u) => u.id));
  ok(Object.values(Q.PAKETE).flat().every((id) => mids.has(id)) && !Object.keys(Q.PAKETE).includes('ob-mathe-analysis'), 'Wissensgarten: alle Paket-Einheiten gibt es, kein Plus-Paket verlinkt');
  ok(Q.appAdresse('wissensgarten', 's1-mathe-gleichungen', 'trainer.mathenachhilfe-online.com') === 'https://wissensgarten.mathenachhilfe-online.com/?src=mathetrainer-theorie#paket=s1-mathe-gleichungen' && /#paket=s1-mathe-gleichungen/.test(Q.verweisKasten('k8-lgs', 'x')), 'Wissensgarten: Paket-Link #paket=<ID>');
  ok(Q.verweisKasten('a-numerik') === '', 'Querverweise: Einheit ohne passende App → kein Kasten');
  const bald = JSON.stringify((await import('../app/js/units-m.js')).MITTEL_BALD) + (((t) => t.slice(t.indexOf('const OBER_AREAS'), t.indexOf('];', t.indexOf('const OBER_AREAS'))))((await import('node:fs')).readFileSync(new URL('../app/js/units.js', import.meta.url), 'utf8')));
  ok(!/Zehnerpotenzen und wiss|Potenzfunktionen|Maßstab: Karten|Schattenwurf|Zufall simulieren|Transformationen a/.test(bald), 'Kommt bald: abgegebene Themen gestrichen (Abgleich 19.11.)');
}
{ const O = await import('../app/js/ort.js'), U = await import('../app/js/umzug.js'), fs = await import('node:fs');   // Umzug auf lernen.… (19.11.2026)
  ok(O.istTest('lernen-test.mathenachhilfe-online.com') && O.istTest('trainer-test.mathenachhilfe-online.com') && O.istTest('localhost') && !O.istTest('lernen.mathenachhilfe-online.com') && !O.istTest('trainer.mathenachhilfe-online.com'), 'Umzug: Test-Stufe an einer Stelle erkannt (lernen-test., trainer-test., lokal)');
  ok(O.neueAdresse('trainer.mathenachhilfe-online.com') === 'https://lernen.mathenachhilfe-online.com/mathetrainer/' && O.neueAdresse('trainer-test.mathenachhilfe-online.com') === 'https://lernen-test.mathenachhilfe-online.com/mathetrainer/', 'Umzug: Ziel je Stufe');
  ok(O.serverBasis('lernen.mathenachhilfe-online.com') === 'https://trainer.mathenachhilfe-online.com' && O.serverBasis('lernen-test.mathenachhilfe-online.com') === 'https://trainer-test.mathenachhilfe-online.com' && O.serverBasis('trainer.mathenachhilfe-online.com') === '' && O.serverBasis('localhost') === '', 'Umzug: Server-Teil auf lernen.… beim Trainer-Server, sonst gleiche Herkunft');
  ok(O.apiBasis('lernen.mathenachhilfe-online.com') === '/mathetrainer' && O.apiBasis('lernen-test.mathenachhilfe-online.com') === '/mathetrainer' && O.apiBasis('trainer.mathenachhilfe-online.com') === '' && O.apiBasis('localhost') === '', 'apiBasis: /api auf lernen.… über den Weiterleiter derselben Herkunft (…/mathetrainer/api), sonst gleiche Herkunft');
  { const fs = await import('node:fs'); const q = ['api.js', 'erinnern.js', 'melden.js'].map((f) => fs.readFileSync(new URL(`../app/js/${f}`, import.meta.url), 'utf8')).join('\n'); ok(!/serverBasis\(\)\}\$\{CONFIG\.(api|melden)/.test(q) && /apiBasis\(\)\}\$\{CONFIG\.api/.test(q), '/api und Meldungen nie direkt an trainer.… (CORS) – immer über apiBasis()'); }
  ok(U.zielAdresse('A.B', { ziel: 'https://x/m/', search: '?src=y', hash: '#/u/k8-lgs' }) === 'https://x/m/?src=y#umzug=A.B&/u/k8-lgs' && U.zielAdresse('', { ziel: 'https://x/m/', search: '', hash: '#pro=MT-1' }) === 'https://x/m/#pro=MT-1' && U.zielAdresse('A.B.C', { ziel: 'https://x/m/', search: '', hash: '#pro=MT-AB12' }) === 'https://x/m/#umzug=A.B.C&pro=MT-AB12', 'Umzug: Weiterleitung mit #umzug und bisherigem Hash');
  const mem = new Map([['mathetrainer.v1', '{"xp":3}'], ['mathetrainer.kirest', '1'], ['andere.v1', 'x']]); const ls = { get length() { return mem.size; }, key: (i) => [...mem.keys()][i], getItem: (k) => mem.get(k) ?? null };
  ok(JSON.stringify(U.eigeneDaten(ls)) === '{"mathetrainer.v1":"{\\"xp\\":3}"}', 'Umzug: nur eigene Schlüssel, ohne KI-Tageszähler');
  let gesendet = null; const tok = await U.einpacken({ ls, f: async (url, o) => { gesendet = { url, o }; return { status: 204, ok: true }; } });
  ok(/^[\w-]{22}\.[\w-]{43}\.[\w-]{22}$/.test(tok) && tok.split('.')[2] === gesendet.o.headers['X-Schreib'] && /\/eltern\/v1\/s\/[\w-]{22}$/.test(gesendet.url) && gesendet.o.method === 'PUT' && /^[\w-]{16}\.[\w-]+$/.test(gesendet.o.body) && !/"xp"|mathetrainer\./.test(gesendet.o.body) && /^[\w-]{22}$/.test(gesendet.o.headers['X-Schreib']), 'Umzug: Einmal-Sicherung verschlüsselt (kein Klartext beim Server), Schlüssel nur im Link');
  ok(await U.einpacken({ ls: { length: 0, key: () => null, getItem: () => null }, f: async () => { throw new Error('darf nicht'); } }) === '', 'Umzug: ohne Lernstand keine Sicherung');
  const app = fs.readdirSync(new URL('../app/js/', import.meta.url)).filter((f) => f.endsWith('.js')).map((f) => fs.readFileSync(new URL(`../app/js/${f}`, import.meta.url), 'utf8')).join('\n');
  const look = fs.readFileSync(new URL('../app/js/look.js', import.meta.url), 'utf8'), sw = fs.readFileSync(new URL('../app/sw.js', import.meta.url), 'utf8');
  ok(!/(localStorage|sessionStorage)\.(get|set|remove)Item\(['"`]mt[.-]/.test(app.replace(look, '')) && !/['"`]mt\.(v1|eltern|kirest|klang|ladeN|look|sound|vorlesen|wache|zaehlung)['"`]/.test(app.replace(look, '')), 'Umzug: alle Speicher-Schlüssel mit Präfix „mathetrainer.“');
  ok(/var alt = \['v1', 'eltern', 'kirest', 'klang', 'ladeN', 'look', 'sound', 'vorlesen', 'wache', 'zaehlung'\]/.test(look) && look.indexOf('mt.') < look.indexOf("matchMedia"), 'Umzug: alte Schlüssel werden als Erstes einmalig umbenannt (look.js)');
  ok(!/localStorage\.clear|sessionStorage\.clear|getRegistrations/.test(app + sw), 'Umzug: kein clear(), kein getRegistrations() (gemeinsame Adresse)');
  ok(/const CACHE = 'mathetrainer-/.test(sw) && /k\.startsWith\('mathetrainer-'\)/.test(sw) && !/[^.]caches\.match\(/.test(sw), 'Umzug: Service Worker nur mit eigenem Cache-Präfix, caches.open(CACHE).match');
  const html = fs.readFileSync(new URL('../app/index.html', import.meta.url), 'utf8');
  ok(/img-src [^;]*https:\/\/lernen\.mathenachhilfe-online\.com/.test(html) && /connect-src [^;]*https:\/\/trainer\.mathenachhilfe-online\.com/.test(html), 'Umzug: Sicherheitsregel erlaubt Bild-Probe auf lernen.… und Abrufe zum Trainer-Server');
}
{ const css = (await import('node:fs')).readFileSync(new URL('../app/css/app.css', import.meta.url), 'utf8');   // Startseite symmetrisch (Marcel 19.11.)
  const pc = css.slice(css.indexOf('@media (min-width:900px){'));
  ok(/#home>section\.card\{max-width:none\}/.test(pc) && pc.indexOf('#home>section.card{max-width:none}') > pc.indexOf('.view.stack>section.card,.view.stack>details.card{max-width:760px}'), 'PC: Startseite – Klassen-Wahl so breit wie die anderen Karten');
}
{ const P = await import('../app/js/prolink.js');   // Freischalt-Link #pro= (neu) und ?pro= (alt)
  ok(P.codeAusAdresse({ hash: '#pro=mt-ab12-cd34-ef56', search: '' }) === 'MT-AB12-CD34-EF56' && P.codeAusAdresse({ hash: '', search: '?pro=MT-AB12-CD34-EF56' }) === 'MT-AB12-CD34-EF56' && P.codeAusAdresse({ hash: '#/einstellungen', search: '' }) === null && P.codeAusAdresse({ hash: '#pro=quatsch', search: '' }) === '', 'Freischalt-Link: #pro= und ?pro= werden gelesen');
  ok(P.adresseOhneCode('https://trainer.example/?pro=MT-AB12-CD34-EF56#/') === '/#/' && P.adresseOhneCode('https://trainer.example/#pro=MT-AB12-CD34-EF56') === '/#/einstellungen', 'Freischalt-Link: Code verschwindet aus der Adresse'); }
{ const E = await import('../app/js/eltern.js');   // Eltern-Handy koppeln (Marcel 18.11.2026); Rundlauf im Browser: tests/eltern.mjs
  ok(E.b64url(new Uint8Array(16)).length === 22 && E.b64url(new Uint8Array(32)).length === 43 && E.b64url(new Uint8Array(12)).length === 16 && !/[+/=]/.test(E.b64url(Uint8Array.from([251, 255, 191]))), 'Eltern: base64url ohne Auffüllzeichen (16 → 22, 32 → 43, IV 12 → 16 Zeichen)');
  const id = 'A'.repeat(22), key = 'B'.repeat(43);
  ok(E.linkLesen(`https://staging.mathenachhilfe-online.com/eltern-bericht/#${id}.${key}`)?.key === key && E.linkLesen(`#${id}.${key}`)?.id === id && E.linkLesen('https://example.com/') === null, 'Eltern: Kopplungs-Link wird gelesen');
  ok(E.elternBasis('trainer-test.mathenachhilfe-online.com').includes('staging.') && E.elternBasis('trainer.mathenachhilfe-online.com') === 'https://www.mathenachhilfe-online.com/eltern-bericht/', 'Eltern: Link auf staging (test) bzw. www (live)');
  ok(E.themaVon('Ableitung') === 'analysis' && E.themaVon('Binomialverteilung') === 'stochastik' && E.themaVon('Abstand Punkt–Ebene') === 'vektoren' && E.themaVon('Exponentielles Wachstum') === 'exponential-log', 'Eltern: Themen aus der gemeinsamen Liste (Oberstufe)');
  ok(E.themaVon('Brüche kürzen', false) === 'brueche' && E.themaVon('Prozentrechnung', false) === 'prozent' && E.themaVon('Lineare Funktionen', false) === 'lineare-funktionen' && E.themaVon('Mittelwert', false) === 'statistik' && E.themaVon('Laplace-Wahrscheinlichkeit', false) === 'wahrscheinlichkeit' && E.themaVon('Satz des Pythagoras', false) === 'pythagoras', 'Eltern: Themen aus der gemeinsamen Liste (Klasse 5–10)');
  { globalThis.window = { katex: { renderToString: (s) => s } }; const fs2 = await import('node:fs'); const M = await import('../app/js/math.js'); await (await import('../app/js/faul.js')).ladeAufgaben(); const themen = new Set();
    for (const d of fs2.readdirSync(new URL('../app/js/a/', import.meta.url)).filter((f) => /^gen\d*\.js$/.test(f))) for (const [n, fn] of Object.entries(await import(`../app/js/a/${d}`))) if (typeof fn === 'function' && /^gen/.test(n)) for (const ober of [true, false]) { try { M.seedRandom(3); const q = fn(3); if (q?.topic) themen.add(E.themaVon(q.topic, ober)); } catch { /* egal */ } }
    ok([...themen].every((t) => E.THEMEN.includes(t)), `Eltern: jedes Aufgaben-Thema landet in einer Kennung der gemeinsamen Liste (${[...themen].join(', ')})`); } }
{ const I = await import('../app/js/install.js'), fs = await import('node:fs'), M = JSON.parse(fs.readFileSync(new URL('../app/manifest.webmanifest', import.meta.url), 'utf8'));
  ok(I.istIos({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)' }) && I.istIos({ userAgent: 'Mozilla/5.0 (Macintosh)', platform: 'MacIntel', maxTouchPoints: 5 }) && !I.istIos({ userAgent: 'Mozilla/5.0 (Linux; Android 14)' }), 'Installieren: iPhone/iPad werden erkannt (Anleitung statt Knopf)');
  ok(M.name && M.display === 'standalone' && M.start_url && M.theme_color && M.icons.some((i) => i.purpose === 'maskable' && i.sizes === '512x512') && M.icons.some((i) => i.sizes === '192x192'), 'Installieren: Manifest mit Name, Symbolen (auch maskable), eigenem Fenster, Start-Adresse und Farbe');
  const sw = fs.readFileSync(new URL('../app/sw.js', import.meta.url), 'utf8');
  ok(/c\.add\('\.\/'\)/.test(sw) && /c\.match\('\.\/'\)/.test(sw) && /caches\.open\(CACHE\)\.then\(\(c\) => c\.match\(req/.test(sw), 'Installieren: startet auch offline (Startseite im eigenen Speicher, caches.open(CACHE).match)'); }
{ const U = await import('../app/js/update.js');
  const app = (o) => ({ updateStand: () => (typeof o === 'string' ? o : JSON.stringify(o)) });
  ok(U.updateStand(undefined) === null && U.updateStand({}) === null, 'Update: im Browser gibt es keinen Stand');
  ok(U.updateStand(app('kaputt')) === null, 'Update: unlesbarer Stand wird ignoriert');
  const s = U.updateStand(app({ kanal: 'test', inhalt: '0.22.0', bereit: '0.23.0', huelle: true }));
  ok(s.kanal === 'test' && s.inhalt === '0.22.0' && s.bereit === '0.23.0' && s.huelle === true, 'Update: Stand gelesen');
  ok(U.updateStand(app({ kanal: 'store', bereit: '<b>x</b>', huelle: true })).bereit === '' , 'Update: nur echte Versionsnummern');
  ok(U.updateStand(app({ kanal: 'store', bereit: '1.0.0', huelle: true })).huelle === false, 'Update: im Store-Kanal kein Hinweis auf eine App-Datei');
  ok(U.updateStand(app({ kanal: 'irgendwas' })).kanal === 'aus', 'Update: unbekannter Kanal zählt als aus');
  { // Kopfrechen-Arena und Knobelaufgabe
    const K = await import('../app/js/kopf.js');
    for (const [art] of K.KOPF_ARTEN) for (const st of [1, 2, 3]) for (let i = 0; i < 400; i++) { const q = K.kopfAufgabe(art, st);
      if (!(Number.isInteger(q.sol) && Math.abs(q.sol) < 100000 && K.kopfProbe(q) && (['minus', 'plus'].includes(art) || q.sol > 0))) { ok(false, `Kopfrechnen ${art}/${st}: ${q.text} = ${q.sol}`); break; } }
    ok(true, 'Kopfrechnen: jede Aufgabe hat eine ganze Zahl als Lösung, Text und Lösung passen');
    ok(K.kopfArten('5').length === 4 && K.kopfArten('7').length === 6 && K.kopfArten('os').length === 6 && !K.kopfArten('5').some((a) => a[0] === 'minus'), 'Kopfrechnen: Disziplinen passen zur Klassenstufe');
    ok(K.KNOBEL.length >= 28 && K.KNOBEL.every((k) => k.length === 4 && Number.isInteger(k[1]) && k[1] > 0 && k[0].length > 30 && k[0].endsWith('?') && k[2].length > 10 && k[3].length > 10) && new Set(K.KNOBEL.map((k) => k[0])).size === K.KNOBEL.length, 'Knobelaufgaben: vollständig, ganzzahlig, ohne Dopplung');
    ok(K.knobelFuer('2026-11-15').text === K.knobelFuer('2026-11-15').text && new Set(Array.from({ length: 60 }, (_, i) => K.knobelFuer(`2026-12-${i}`).text)).size >= 15, 'Knobelaufgabe: pro Tag fest, über die Tage verschieden');
    // Nachgerechnet, was sich nachrechnen lässt
    const kn = (anf) => K.KNOBEL.find((k) => k[0].startsWith(anf))[1];
    let q9 = 0; for (let n = 1; n <= 120; n++) q9 += String(n).split('9').length - 1;
    let d3 = 0; for (let n = 1; n <= 100; n++) if (n % 3 === 0 && n % 6 !== 0) d3++;
    let rest = 2; while (![2, 3, 4, 5, 6].every((t) => rest % t === 1)) rest++;
    let nullen = 0; for (let n = 1; n <= 25; n++) { let m = n; while (m % 5 === 0) { nullen++; m /= 5; } }
    let schnecke = 0, tag = 0; for (;;) { tag++; schnecke += 3; if (schnecke >= 10) break; schnecke -= 2; }
    let qs = 0; for (let n = 10; n <= 99; n++) if (Math.floor(n / 10) + (n % 10) === 9 && (n % 10) * 10 + Math.floor(n / 10) === n + 27) qs = n;
    ok(kn('Ein Buch hat 120') === q9 && kn('Wie viele Zahlen von 1 bis 100') === d3 && kn('Welche ist die kleinste Zahl') === rest && kn('Wie viele Nullen') === nullen && kn('Eine Schnecke') === tag && kn('Die Quersumme') === qs && kn('Eine Uhr') === 78 && kn('Wie viele Quadrate') === 9 + 4 + 1, 'Knobelaufgaben: Lösungen nachgerechnet');
    // Outfits für Pi
    const F = await import('../app/js/figuren.js');
    ok(F.outfitFrei(F.HUETE, '', 0) && !F.outfitFrei(F.HUETE, 'krone', 149) && F.outfitFrei(F.HUETE, 'krone', 150) && !F.outfitFrei(F.HUETE, 'gibtsnicht', 999), 'Pi-Outfit: Freischalten nach Sternen');
    ok(F.outfitJetzt({ hut: 'krone', brille: 'rund' }, 25).hut === '' && F.outfitJetzt({ hut: 'krone', brille: 'rund' }, 25).brille === 'rund' && F.outfitJetzt({ hut: '<x>', brille: 5 }, 999).hut === '', 'Pi-Outfit: nur freie, bekannte Teile');
    const nackt = F.pi({}, { hut: '', brille: '' }), schick = F.pi({}, { hut: 'zylinder', brille: 'sonne' });
    ok(schick.length > nackt.length + 100 && /<svg class="figur"/.test(schick) && !/<script|onload|href/i.test([...F.HUETE, ...F.BRILLEN].map((x) => x[3]).join('')) && [...F.HUETE, ...F.BRILLEN].every((x) => x[2] >= 0 && x[1].length > 2), 'Pi-Outfit: wird gezeichnet, Zeichnungen sind harmlos');
    // Klassenarbeits-Trainer
    const A = await import('../app/js/arbeit.js');
    const us = [{ id: 'a', steps: [1, 2, 3, 4, 5, 6, 7].map((i) => ({ id: `s${i}`, title: `S${i}` })), bossGens: [Math.abs, Math.max] }, { id: 'b', steps: [1, 2, 3].map((i) => ({ id: `t${i}`, title: `T${i}` })), bossGens: [Math.max] }];
    const heute = new Date(2026, 10, 15), keins = () => false;
    ok(A.tageBis('2026-11-15', heute) === 0 && A.tageBis('2026-11-25', heute) === 10 && A.tageBis('2026-11-10', heute) === -5 && A.tageBis('2027-01-01', heute) === 47, 'Klassenarbeit: Tage bis zum Termin');
    const p = A.arbeitPlan({ datum: '2026-11-21', units: ['a', 'b', 'weg'] }, us, keins, heute);
    ok(p.tage === 6 && p.total === 10 && p.erledigt === 0 && p.proTag === 2 && p.heute.length === 2 && p.heute[0].u.id === 'a' && p.heute[0].i === 0 && p.phase === 'lernen' && !p.knapp && p.units.length === 2, 'Klassenarbeit: Plan verteilt die Schritte, der Vortag bleibt frei');
    const eng = A.arbeitPlan({ datum: '2026-11-16', units: ['a', 'b'] }, us, keins, heute);
    ok(eng.proTag === 6 && eng.knapp && eng.heute.length === 6, 'Klassenarbeit: bei wenig Zeit höchstens sechs Schritte am Tag, mit Hinweis');
    const fit = A.arbeitPlan({ datum: '2026-11-20', units: ['b'] }, us, () => true, heute);
    ok(fit.phase === 'fit' && fit.heute.length === 0 && fit.erledigt === 3, 'Klassenarbeit: alles geschafft');
    ok(A.arbeitPlan({ datum: '2026-11-15', units: ['b'] }, us, keins, heute).phase === 'heute' && A.arbeitPlan({ datum: '2026-11-01', units: ['b'] }, us, keins, heute).phase === 'vorbei' && A.arbeitPlan({ datum: '2026-11-01', units: ['b'] }, us, keins, heute).heute.length === 0 && A.arbeitPlan(null) === null, 'Klassenarbeit: Tag der Arbeit und danach');
    ok(A.arbeitGens(us).length === 2, 'Klassenarbeit: Themen-Mix ohne doppelte Aufgaben-Arten'); }
  { // Von Hand suchen
    const fenster = () => { const l = {}; return { addEventListener: (n, f) => { l[n] = f; }, removeEventListener: (n) => { delete l[n]; }, feuer: (n, detail) => l[n]?.({ detail }), hat: (n) => !!l[n] }; };
    ok((await U.updateSuchen({ updateStand: () => '{"kanal":"test"}' }, fenster())).art === 'aktuell', 'Update suchen: alte App-Datei ohne Such-Funktion bekommt einen ruhigen Hinweis');
    ok((await U.updateSuchen({ updateStand: () => '{"kanal":"aus"}', updateSuchen() { throw new Error('darf nicht'); } }, fenster())).art === 'aktuell', 'Update suchen: Kanal aus sucht nicht');
    const fall = async (st, detail) => { const w = fenster(); const a = { st: { kanal: 'test', inhalt: '', bereit: '', huelle: false }, updateStand() { return JSON.stringify(this.st); }, updateSuchen() { Object.assign(this.st, st); setTimeout(() => w.feuer('mt-update-fertig', detail), 0); } }; const r = await U.updateSuchen(a, w); return { ...r, sauber: !w.hat('mt-update-fertig') }; };
    const neu = await fall({ bereit: '1.2.3' }, 'ok'), gleich = await fall({}, 'ok'), netz = await fall({}, 'netz'), datei = await fall({ huelle: true }, 'ok');
    ok(neu.art === 'neu' && neu.text.includes('1.2.3') && neu.sauber, 'Update suchen: neue Version wird gemeldet');
    ok(gleich.art === 'aktuell' && gleich.text === 'Alles aktuell.', 'Update suchen: nichts Neues');
    ok(netz.art === 'netz' && netz.sauber && /Keine Verbindung zum Server/.test(netz.text), 'Update suchen: ohne Netz gibt es eine klare Auskunft');
    ok(/Meldung 502/.test((await fall({}, 'antwort502')).text) && /zu langsam/.test((await fall({}, 'zeit')).text) && /nicht sauber/.test((await fall({}, 'inhalt')).text) && !/</.test((await fall({}, '<b>x</b>')).text), 'Update suchen: der Grund wird verständlich genannt, Fremdes nicht übernommen');
    ok(datei.art === 'neu' && /App-Datei/.test(datei.text), 'Update suchen: Hinweis auf neue App-Datei');
    const stumm = await U.updateSuchen({ updateStand: () => '{"kanal":"test"}', updateSuchen() {} }, fenster(), 20);
    ok(stumm.art === 'netz', 'Update suchen: bleibt die Antwort aus, hängt der Knopf nicht');
    const sw = (reg, kaputt) => ({ navigator: { serviceWorker: { getRegistration: () => (kaputt ? Promise.reject(new Error('x')) : Promise.resolve(reg)) } } });
    ok((await U.updateSuchen(undefined, sw({ update: () => Promise.resolve(), installing: {} }))).art === 'neu', 'Update suchen (Browser): neue Version gefunden');
    ok((await U.updateSuchen(undefined, sw({ update: () => Promise.resolve() }))).art === 'aktuell' && (await U.updateSuchen(undefined, sw(null))).art === 'aktuell', 'Update suchen (Browser): aktuell');
    ok((await U.updateSuchen(undefined, sw({ update: () => Promise.reject(new Error('offline')) }))).art === 'netz' && (await U.updateSuchen(undefined, sw(null, true))).art === 'netz', 'Update suchen (Browser): ohne Netz');
    ok((await U.updateSuchen(undefined, {})).art === 'aktuell', 'Update suchen (Browser): ohne Service Worker ein Hinweis'); }
  const { readFileSync } = await import('node:fs'); const { createHash } = await import('node:crypto');
  const st = JSON.parse(readFileSync(new URL('../app/stand.json', import.meta.url), 'utf8')), cfg = readFileSync(new URL('../app/js/config.js', import.meta.url), 'utf8');
  ok(st.version === cfg.match(/VERSION = '([^']+)'/)[1], 'stand.json: Version passt zur App');
  ok(st.huelle >= 1 && st.huelle === JSON.parse(readFileSync(new URL('../android/huelle.json', import.meta.url), 'utf8')).nr, 'stand.json: Nummer der App-Hülle passt');
  ok(st.dateien['index.html'] && st.dateien['sw.js'] && st.dateien['b/app.js'] && st.dateien['js/wache.js'] && !st.dateien['stand.json'], 'stand.json: wichtige Dateien dabei, sich selbst nicht');
  ok(!st.dateien['js/app.js'] && !st.dateien['js/units.js'] && !st.dateien['js/games/boss.js'], 'stand.json: gebündelte Quell-Dateien werden nicht einzeln ausgeliefert');
  for (const [f, sha] of Object.entries(st.dateien)) {
    ok(/^[A-Za-z0-9_][A-Za-z0-9_.-]*(\/[A-Za-z0-9_][A-Za-z0-9_.-]*)*$/.test(f) && !f.includes('..'), `stand.json: Dateiname für die App lesbar (${f})`);
    ok(createHash('sha256').update(readFileSync(new URL(`../app/${f}`, import.meta.url))).digest('hex') === sha, `stand.json: Prüfsumme stimmt (${f})`);
  }
}

// 14e4d) Paket 0.35: schwere Aufgaben für Stufe 4 und 5 in Grundlagen, Stochastik und Geometrie (gen10.js)
{ const A10 = await import('../app/js/a/gen10.js');   // die App benutzt die Platzhalter – ihre Hüllen sind die eingehängten
  const { schwer, THEMEN10, HART, haerter } = await import('../app/js/gen10.js'), E10 = await import('../app/js/eingabe.js'), U10 = await import('../app/js/units.js');
  const richtig = (q) => q.options.find((o) => o.correct), nah = (a, b) => Math.abs(a - b) < 1e-9, zahlen = (t) => (String(t).replace(/<[^>]+>/g, '').match(/\d+/g) || []).map(Number);
  ok(THEMEN10.length >= 20, `Paket 0.35: schwere Aufgaben zu ${THEMEN10.length} Themen`);
  for (const th of THEMEN10) { const arten = [4, 5].map((lv) => { const a = new Set(); for (let i = 0; i < 300; i++) { const q = schwer(th)(lv); basics(`schwer_${th}`, q, lv); a.add(q.kind);
        ok(q.options.length === 4 && q.options.every((o) => !/\d\.\d|NaN|undefined|\}\{-/.test(o.tex)), `schwer_${th} (Stufe ${lv}): vier saubere Antworten, Komma statt Punkt`);
        const spec = E10.inputSpec(q); if (spec) { const v = E10.parseInput(spec.sh.plain); ok(v !== null && E10.isRight(v, spec.num, spec.sh.plain), `schwer_${th} (Stufe ${lv}): getippte Lösung wird anerkannt`);
          for (const o of q.options) if (!o.correct) { const so = E10.shapeOf(o.tex); ok(!so || !E10.isRight(E10.parseInput(so.plain), spec.num, spec.sh.plain), `schwer_${th} (Stufe ${lv}): kein Ablenker gilt beim Eintippen als richtig`); } } } return a; });
    ok([...arten[0]].every((k) => !arten[1].has(k)), `schwer_${th}: Stufe 5 hat eigene Aufgaben-Arten, nicht die von Stufe 4`); }
  // Unabhängiges Nachrechnen durch Abzählen aller Fälle
  for (let i = 0; i < 300; i++) {
    { const q = schwer('laplace')(4), s = zahlen(q.prompt).pop(); let g = 0; for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (a + b === s) g++; ok(nah(richtig(q).num, g / 36), 'schwer_laplace 4: Augensumme durch Abzählen der 36 Paare bestätigt'); }
    { const q = schwer('laplace')(5), k = zahlen(q.prompt)[0]; let g = 0; const N = 6 ** k; for (let c = 0; c < N; c++) { let x = c, six = false; for (let j = 0; j < k; j++) { if (x % 6 === 5) six = true; x = Math.floor(x / 6); } if (six) g++; } ok(nah(richtig(q).num, g / N), 'schwer_laplace 5: „mindestens eine Sechs“ durch Abzählen bestätigt'); }
    for (const lv of [4, 5]) { const q = schwer('baum')(lv), [r, b] = zahlen(q.prompt), kug = [...Array(r).fill(1), ...Array(b).fill(0)], n = r + b; let g = 0, alle = 0;
      if (lv === 4) { for (let x = 0; x < n; x++) for (let y = 0; y < n; y++) if (x !== y) { alle++; if (kug[x] !== kug[y]) g++; } }
      else for (let x = 0; x < n; x++) for (let y = 0; y < n; y++) for (let z = 0; z < n; z++) if (x !== y && y !== z && x !== z) { alle++; if (kug[x] + kug[y] + kug[z] >= 2) g++; }
      ok(nah(richtig(q).num, g / alle), `schwer_baum ${lv}: Urne ohne Zurücklegen durch Abzählen bestätigt`); }
    { const q = schwer('pythagoras')(4), [a, b, c] = zahlen(q.prompt); ok(nah(richtig(q).num, Math.hypot(a, b, c)), 'schwer_pythagoras 4: Raumdiagonale nachgerechnet'); }
    { const q = schwer('kennwerte')(4), z = zahlen(q.prompt), n = z[0], m = z[1], rest = z.slice(3); ok(rest.length === n - 1 && nah((rest.reduce((s, v) => s + v, 0) + richtig(q).num) / n, m), 'schwer_kennwerte 4: Mit der fehlenden Zahl stimmt der Mittelwert'); }
    { const q = schwer('kennwerte')(5), [n, m, neu] = zahlen(q.prompt); ok(nah((n * m + richtig(q).num) / (n + 1), neu), 'schwer_kennwerte 5: Mit der neuen Zahl stimmt der neue Mittelwert'); }
    { const q = schwer('lingl')(4), m = q.formula.match(/\{x\}\{(\d+)\}\+\\dfrac\{x\}\{(\d+)\}=(\d+)/), x = richtig(q).num; ok(m && nah(x / +m[1] + x / +m[2], +m[3]), 'schwer_lingl 4: Probe der Bruchgleichung'); }
    { const q = schwer('quadgl')(5), r = richtig(q).tex; if (q.kind === 'biquadratisch') { const [a, b] = zahlen(r), k = zahlen(q.formula); ok([a, -a, b, -b].every((x) => nah(x ** 4 - k[1] * x * x + k[3], 0)), 'schwer_quadgl 5: alle vier Lösungen erfüllen die Gleichung'); }
      else { const k = zahlen(q.formula), xs = zahlen(r).filter((_, j) => j % 2 === 1); ok(xs.length === 2 && xs.every((x) => nah(x + k[0] / x, k[1])), 'schwer_quadgl 5: beide Lösungen erfüllen die Bruchgleichung'); } }
    { const q = schwer('kombinatorik')(4), [n, k] = zahlen(q.prompt); let c = 0; for (let x = 0; x < 1 << n; x++) { let bits = 0; for (let j = 0; j < n; j++) bits += (x >> j) & 1; if (bits === k) c++; } ok(richtig(q).num === c, 'schwer_kombinatorik 4: Teams durch Abzählen bestätigt'); }
    { const q = schwer('prozent')(5); if (q.kind === 'rueckwaerts') { const z = q.prompt.match(/Nach (\d+) % Rabatt kostet eine Jacke ([\d,]+) €/); ok(z && nah(richtig(q).num * (1 - z[1] / 100), +z[2].replace(',', '.')), 'schwer_prozent 5: alter Preis minus Rabatt ergibt den neuen Preis'); } }
    { const q = schwer('erwartung')(5), z = q.prompt.match(/kostet (\d+) € Einsatz.*\\dfrac\{(\d+)\}\{(\d+)\}/); ok(z && nah((z[2] / z[3]) * richtig(q).num, +z[1]), 'schwer_erwartung 5: Mit dieser Auszahlung ist das Spiel fair'); }
  }
  // Einhängen: Jeder ältere Erzeuger aus der Liste wird über die Leiter verschärft – Stufe 1 und 2 bleiben wie bisher, Stufe 5 kommt nur noch aus gen10
  const eingehaengt = new Set(U10.ALLE_UNITS.flatMap((u) => u.bossGens || []).filter((g) => g.steil).map((g) => g.name));
  ok(Object.keys(HART).filter((k) => eingehaengt.has(k)).length >= 18, `Paket 0.35: schwere Aufgaben hängen in den Endgegnern (${[...eingehaengt].filter((k) => HART[k]).length} Erzeuger)`);
  for (const u of U10.ALLE_UNITS) for (const g of u.bossGens || []) if (HART[g.name]) { ok(g.steil.name === HART[g.name].name && A10.haerter(g.basis) === g, `${u.id}: ${g.name} ist über die Leiter eingehängt (immer dieselbe Hülle)`);
    for (let i = 0; i < 40; i++) { const q1 = g(1), q5 = g(5); ok(q1.von === g.name && q1.gen === g.name, `${g.name}: Stufe 1 bleibt die bisherige Aufgabe`); ok(q5.von.startsWith('schwer_') && q5.gen === g.name && q5.topic === g.topic, `${g.name}: Stufe 5 kommt aus den schweren Aufgaben, Name und Thema bleiben`); } }
  ok(U10.landOk(A10.haerter((await import('../app/js/a/gen2.js')).genKreuz), 'HE-GK') === false, 'Länder-Filter erkennt auch verschärfte Erzeuger');
}

// 14e4e) Paket 0.36: Schnellstart – Ladebild ab dem ersten Byte, Ladebalken, Vorladen, Theorie erst später
{ const { readFileSync } = await import('fs'); const html = readFileSync(new URL('../app/index.html', import.meta.url), 'utf8'), kopf = html.split('</head>')[0], rumpf = html.split('<body>')[1];
  ok(/<style>[\s\S]*#lade\{[^}]*position:fixed[^}]*inset:0[\s\S]*<\/style>/.test(kopf), 'Schnellstart: Das Ladebild ist direkt in der Seite gestaltet (kein Warten auf eine CSS-Datei)');
  ok(!/<link rel="stylesheet"|<script/.test(kopf), 'Schnellstart: Im Kopf der Seite blockiert weder eine CSS-Datei noch ein Skript das erste Bild');
  ok(rumpf.trimStart().startsWith('<div id="lade"') && rumpf.indexOf('id="lade-balken"') < rumpf.indexOf('<script'), 'Schnellstart: Ladebild mit Balken steht vor dem ersten Skript');
  ok(/<svg class="lade-logo"[^>]*>/.test(rumpf) && !/lade-logo[^>]*src=/.test(rumpf), 'Schnellstart: Logo im Ladebild ist eingebettet');
  ok(!/<script(?![^>]*\bsrc=)[^>]*>/.test(html), 'Schnellstart: kein eingebettetes Skript (die Sicherheits-Regel der Seite verbietet es)');
  ok(kopf.includes('prefers-color-scheme:dark') && kopf.includes(':root[data-look="dunkel"] #lade') && kopf.includes('<noscript><style>#lade{display:none}'), 'Schnellstart: Ladebild hell und dunkel; ohne JavaScript verdeckt es nichts');
  const vor = [...kopf.matchAll(/<link rel="modulepreload" href="([^"]+)">/g)].map((m) => m[1]);
  const bdir = new URL('../app/b/', import.meta.url), teile = (await import('fs')).readdirSync(bdir), text = Object.fromEntries(teile.map((f) => [f, readFileSync(new URL(f, bdir), 'utf8')]));
  ok(html.includes('<script type="module" src="b/app.js"></script>') && teile.includes('app.js') && teile.length >= 3, `Bündel: Die Seite lädt b/app.js (${teile.length} Teile)`);
  const spaet = teile.filter((f) => /Genauer hingeschaut/.test(text[f]) && f !== 'app.js');   // nur die ausführliche Theorie hat diese Überschriften
  ok(vor.length >= 1 && vor.every((f) => /^b\/teil-/.test(f)) && spaet.length === 1 && !vor.includes(`b/${spaet[0]}`), 'Schnellstart: Der Hauptteil des Bündels wird vorgeladen, der Theorie-Teil nicht');
  const alles = Object.values(text).join('\n');
  ok(['genBruch', 'genIntegralE', 'genBinomVerteilung', 'schwer_bruch', 'genAbleitenSteil'].every((n) => alles.includes(`"${n}"`) || alles.includes(`\`schwer_`)), 'Bündel: Die Namen der Aufgaben-Erzeuger bleiben erhalten (Lernstand und Fehler-Kartei hängen daran)');
  ok(alles.length < 2.3e6 &&   // 18.11.2026: Theorie-Prüfung – 75 neue Erklärkarten, viele erweitert (Grenze von 2,1 auf 2,3 MB)
     !/\n {4,}\/\/ /.test(alles.slice(0, 20000)), `Bündel: verkleinert (${Math.round(alles.length / 1024)} kB)`);
  const app = readFileSync(new URL('../app/js/app.js', import.meta.url), 'utf8'), wa = readFileSync(new URL('../app/js/wache.js', import.meta.url), 'utf8');
  ok(!/^import[^\n]*theorie\.js/m.test(app) && (app.match(/import\('\.\/theorie\.js'\)/g) || []).length >= 2, 'Schnellstart: Die Theorie wird erst beim Öffnen (und in einer ruhigen Minute) geladen');
  ok(wa.includes('ladebildWeg()') && wa.includes("performance.mark('mt-bereit')") && wa.indexOf('ladebildWeg();\n    if (!v') > 0, 'Schnellstart: Das Ladebild verschwindet beim Start – und auch, wenn die Start-Wache ihren Hinweis zeigt');
}

// Stichprobe 17.11.: Beim Vergleich „Bruch oder Prozent“ trug die richtige Antwort eine falsche Fehler-Erklärung
{ const { genProzentStart } = await import('../app/js/gen7.js');
  for (let k = 0; k < 400; k++) { const q = genProzentStart(1 + (k % 5)); if (q.kind !== 'vergleich') continue; const r = q.options.find((o) => o.correct);
    ok(!r.why, 'Prozent-Vergleich: Die richtige Antwort darf keine Fehler-Erklärung tragen'); } }

// Paket 17.11.: Umstell-Blatt (Pro) und vier ausführliche Kapitel zu Gleichungen
{ const U = await import('../app/js/umform.js'), P = await import('../app/js/pro.js'), Th = await import('../app/js/theorie.js');
  for (let st = 1; st <= 5; st++) {
    const a = U.blattAufgaben(st, 4711 + st), b = U.blattAufgaben(st, 4711 + st);
    ok(a.length === 8 && a.every((x) => x.weg.length >= 1), `Umstell-Blatt: Stockwerk ${st} hat nicht acht lösbare Aufgaben`);
    ok(a.map((x) => U.gleichungTex(x.l, x.r)).join('|') === b.map((x) => U.gleichungTex(x.l, x.r)).join('|'), `Umstell-Blatt: Gleiche Nummer muss dasselbe Blatt ergeben (Stockwerk ${st})`);
    ok(new Set(a.map((x) => U.gleichungTex(x.l, x.r) + x.x)).size === a.length, `Umstell-Blatt: doppelte Aufgabe (Stockwerk ${st})`);
  }
  ok(P.FUNKTIONEN.some((f) => f[0] === 'pro' && f[1] === 'Umstell-Blatt'), 'Pro-Liste: Umstell-Blatt fehlt');
  for (const id of ['k7-terme', 'k7-gleichungen', 'k8-lgs', 'k9-quadrat']) { const L = Th.LANG[id] || [];
    ok(L.length >= 5 && ['Worum es geht', 'Durchgerechnetes Beispiel', 'Typische Fehler'].every((t) => L.some((x) => x[0] === t)), `Theorie ausführlich: Kapitel ${id} unvollständig`); } }

// Vorlesen 17.11.2026 (Stimme Nova): Formeln in Worten, Kennung der Audiodateien wie beim Stimmen-Werk, Stücke, keine Daten an OpenAI
{ const { texSprech, textSprech, htmlSprech, stuecke, normal } = await import('../app/js/sprech.js'); const fs = await import('node:fs'); const { createHash } = await import('node:crypto');
  const F = [["f'(x)=6x-2", 'f Strich von x gleich 6 x minus 2'], ['\\dfrac{3}{4}', '3 durch 4'], ['\\sqrt[3]{27}', 'dritte Wurzel aus 27'], ['x^2', 'x Quadrat'], ['e^{2x}', 'e hoch 2 x'],
    ['A(2\\mid3\\mid0)', 'A mit den Koordinaten 2, 3 und 0'], ['\\overrightarrow{AB}', 'Vektor A B'], ['\\alpha=30^\\circ', 'Alpha gleich 30 Grad'], ['\\sin(x)', 'Sinus von x'],
    ['\\int_0^2 x\\,dx', 'Integral von 0 bis 2 über x d x'], ['\\binom{n}{k}', 'n über k'], ['60\\,\\%', '60 Prozent'], ['-3\\cdot(-2)=6', 'minus 3 mal minus 2 gleich 6'], ["f''(x)", 'f zwei Strich von x']];
  for (const [t, w] of F) ok(texSprech(t) === w, `Vorlesen: ${t} → „${texSprech(t)}“ statt „${w}“`);
  ok(textSprech('Beide: ⟦\\dfrac{2}{5}⟧ – fertig, <b>40 %</b>.') === 'Beide: 2 durch 5, fertig, 40 Prozent.', 'Vorlesen: Text mit Formel und HTML');
  ok(htmlSprech('<h2>Titel</h2><p>Erst ⟦x^2⟧.</p><ul><li>eins</li><li>zwei</li></ul>') === 'Titel. Erst x Quadrat. eins. zwei.', `Vorlesen: Abschnitt → „${htmlSprech('<h2>Titel</h2><p>Erst ⟦x^2⟧.</p><ul><li>eins</li><li>zwei</li></ul>')}“`);
  // Kennung wie beim Stimmen-Werk (Prüfwert des Leitstands: "de", "Hallo Welt" → cb1e6d67882767042ebaa54d163e450c)
  ok(createHash('sha256').update(`nova|de|${normal(' Hallo \n Welt ')}`).digest('hex').slice(0, 32) === 'cb1e6d67882767042ebaa54d163e450c', 'Vorlesen: Kennung der Nova-Datei');
  const lang = 'Ein Satz. '.repeat(80); ok(stuecke(lang, 300).every((x) => x.length <= 300) && stuecke(lang, 300).join(' ') === normal(lang), 'Vorlesen: Stücke bis 300 Zeichen, nichts geht verloren');
  const L = JSON.parse(fs.readFileSync(new URL('../app/vorlesen/texte.json', import.meta.url), 'utf8')), vl0 = fs.readFileSync(new URL('../app/js/vorlesen.js', import.meta.url), 'utf8');
  const UIv = await import('../app/js/ui.js');
  if (!UIv.VORLESEN) {   // Marcel 18.11.2026: Vorlesen erst einmal abgeschaltet
    ok(L.format === 1 && L.app === 'mathe-trainer' && Array.isArray(L.texte) && L.texte.length === 0, 'Vorlesen aus: texte.json ist leer – das Stimmen-Werk spricht nichts mehr');
    ok(UIv.vorleseKnopf('x') === '' && UIv.vorlese.an === false, 'Vorlesen aus: kein Vorlese-Knopf, auch wenn es früher eingeschaltet war');
    const ex = fs.readFileSync(new URL('../app/js/extras.js', import.meta.url), 'utf8'), ap = fs.readFileSync(new URL('../app/js/app.js', import.meta.url), 'utf8'), ui = fs.readFileSync(new URL('../app/js/ui.js', import.meta.url), 'utf8');
    ok(/\$\{VORLESEN \? `\s*<section class="card stack" id="st-vorlesen">/.test(ex) && /if \(VORLESEN\) \{ \/\/ Vorlesen/.test(ex), 'Vorlesen aus: keine Einstellungen (Stimme, Sprechtempo, Offline laden)');
    ok(/if \(!VORLESEN\) return;/.test(ui) && /caches\?\.delete\('stimme-nova'\)/.test(ap), 'Vorlesen aus: kein Abruf, keine Gerätestimme; alte Nova-Dateien werden aufgeräumt');
  } else
  ok(L.format === 1 && L.app === 'mathe-trainer' && L.texte.length > 500 && L.texte.every((t) => t.sprache === 'de' && t.text.length <= 1500 && t.text === normal(t.text) && !/⟦|\\[a-z]|<|>/.test(t.text)), 'Vorlesen: texte.json im vereinbarten Format, ohne TeX und HTML');
  if (UIv.VORLESEN) { const lz = L.texte.filter((t) => t.laufzeit === true), zeichen = lz.reduce((n, t) => n + t.text.length, 0), fest = new Set(L.texte.filter((t) => !t.laufzeit).map((t) => t.text));
    ok(lz.length > 1000 && lz.every((t) => t.text.length <= 300 && !fest.has(t.text)) && new Set(lz.map((t) => t.text)).size === lz.length, `Vorlesen: ${lz.length} vorhersehbare Laufzeit-Sätze (Aufgabenkarten) mit "laufzeit": true, je höchstens 300 Zeichen`);
    ok(zeichen < 150000, `Vorlesen: Laufzeit-Sätze zusammen ${zeichen} Zeichen – unter 150 000 (sonst vorher dem Leitstand ankündigen)`);
    ok(/stuecke\(text, art === 'fest' \? FEST_MAX : JETZT_MAX\)/.test(vl0) && /const fest = await holeDatei\(adresse\(await kennung\(stueck\)\)\)/.test(vl0), 'Vorlesen: Aufgaben-Stücke (300 Zeichen) werden zuerst als vorab vertonte Datei gesucht'); }
  const vl = fs.readFileSync(new URL('../app/js/vorlesen.js', import.meta.url), 'utf8').replace(/^\s*\/\/.*$/gm, '');
  ok(JSON.stringify((await import('../app/js/ui.js')).TEMPI) === '[0.75,0.9,1,1.15,1.3,1.5]' && /preservesPitch = true/.test(vl) && /u\.rate = vorlese\.tempo/.test(vl), 'Vorlesen: Sprechtempo in sechs Stufen, gleiche Tonhöhe, auch für die Gerätestimme');
  ok(/d\.fehler === 'netz' && navigator\.onLine === false\) \{ start\(\); if \(await geraet\(/.test(vl) && (vl.match(/geraet\(/g) || []).length === 2 && !/'ki'/.test(vl), 'Vorlesen: Gerätestimme nur ohne Netz (Leitstand 17.11.), KI-Antworten nicht vorgelesen');
  ok(/stuecke\(stueck, JETZT_MAX\)/.test(vl) && /versuch < 2/.test(vl) && /einmalMelden/.test(vl), 'Vorlesen: fehlende feste Texte als ganze Sätze über /jetzt, ein zweiter Versuch, Hinweis einmal je Sitzung');
  ok(/stand-\$\{standHost\(\)\}\.json/.test(vl) && (vl.match(/arbeiter\(\)/g) || []).length === 4 && /SPEICHER = 'stimme-mathetrainer'/.test(vl), 'Vorlesen offline: Größe vom Server, 4 Downloads gleichzeitig, eigener Speicher');
  ok(!new RegExp(['openai\\.com', 'api\\.openai', 'thor' + 'sten', 'sh' + 'erpa', 'espeak'].join('|'), 'i').test(vl) && /credentials: 'omit'/.test(vl) && /JETZT_MAX = 300/.test(vl), 'Vorlesen: nichts an OpenAI, keine Angaben zur Person, Stücke bis 300 Zeichen'); }
// Abschlussprüfung 17.11.2026: alte Abi-Einträge ohne „richtig von gesamt“ zeigen kein undefined/NaN
{ const { examText } = await import('../app/js/exam.js');
  ok(examText({ correct: 7, total: 9 }) === '7/9 richtig' && examText({ pct: 60 }) === '60 % richtig' && examText({ score: 60, np: 9 }) === '60 %' && examText({}) === '', 'Abi-Ergebnis in Worten, auch für alte Einträge'); }
// Klang 17.11.2026: eigene Effekte und Lernmusik, ohne Math.random, ohne Dateien
{ const fs = await import('node:fs'); const ui = fs.readFileSync(new URL('../app/js/ui.js', import.meta.url), 'utf8'), mu = fs.readFileSync(new URL('../app/js/musik.js', import.meta.url), 'utf8');
  for (const n of ['tap', 'ok', 'bad', 'roll', 'win', 'tag', 'duell', 'abi', 'serie', 'start']) ok(new RegExp(`\\b${n}: \\(a, z, t\\)`).test(ui), `Klang: Effekt „${n}“ vorhanden`);
  ok(!/Math\.random|\.mp3|\.ogg|\.wav|fetch\(/.test(mu) && !/\.mp3|\.ogg|\.wav/.test(ui), 'Klang: selbst erzeugt, keine Dateien, kein Math.random');
  ok(/musik: true/.test(ui) && /pruefung: false/.test(ui), 'Klang: Musik ab Werk an (Marcel 17.11.), Klang in Prüfungen ab Werk aus'); }
// Marcel 17.11.2026: Preise inkl. MwSt. bei Pro, KI-Limit 10, „ohne Hilfsmittel“ nur im Teil ohne
{ const P = await import('../app/js/pro.js'); const BL = await import('../app/js/blatt.js');
  ok(P.KI_PRO_TAG === 10 && JSON.stringify(P.PREISE) === JSON.stringify([['Pro', '4,99 €', '19,99 €'], ['Pro + KI', '9,99 €', '39,99 €']]), 'Pro-Seite: Preise und KI-Punkte pro Tag wie von Marcel festgelegt');
  ok(P.FUNKTIONEN.some((f) => /10 KI-Punkte pro Tag/.test(f[2])) && !P.FUNKTIONEN.some((f) => /15 KI-Punkte|15 Punkte pro Tag/.test(f[2])), 'KI-Limit überall 10');
  ok([1, 2, 3].every((l) => BL.hilfsmittel(l) === 'ohne Hilfsmittel') && [4, 5].every((l) => /^mit Hilfsmitteln/.test(BL.hilfsmittel(l))), 'Probeklausur: „ohne Hilfsmittel“ nur bis Stufe 3'); }
// Korrektheitsprüfung 17.11.2026: gefundene Fehler kommen nicht wieder
{ const E = await import('../app/js/eingabe.js'); const { parse } = await import('../app/js/ki/expr.js'); const K = await import('../app/js/ki/verify.js');
  ok(E.parseInput('1 1/2') === 1.5 && E.parseInput('-1 1/2') === -1.5 && E.parseInput('–3') === -3, 'Eingabe: gemischte Zahl „1 1/2“ ist 1,5, Halbgeviertstrich ist Minus');
  for (const b of ['constructor(x)', 'toString(x)', 'hasOwnProperty']) { let thrown = false; try { parse(b); } catch { thrown = true; } ok(thrown, `Ausdrücke: „${b}“ wird abgelehnt (kein Name aus dem Prototyp)`); }
  const z = (ws, extra = {}) => ({ art: 'zahl', thema: 'Zahlen', stufe: 1, frage: 'Was ergibt 2 mal 3?', erklaerung: 'Der Funktionswert = 6.', tipps: ['Die Konstante = 2.', 'Mal rechnen.'], rechnung: '2*3',
    antworten: ws.map((w, i) => ({ tex: `a${i}`, wert: w, richtig: i === 0, ...(i ? { fehler: 'Falsch gerechnet.' } : {}) })), ...extra });
  ok(K.verify(z([6, 5, 7, 8])).ok, 'KI-Prüfer: „Konstante =“ und „Funktionswert =“ sind kein eingeschleuster Code');
  ok(!K.verify(z([6, 5, 5.0000000001, 8])).ok, 'KI-Prüfer: rechnerisch gleiche Antworten werden abgelehnt');
  ok(!K.verify(z([6, null, 7, 8])).ok || !K.verify(z([null, 5, 7, 8])).ok, 'KI-Prüfer: Antwort ohne Wert zählt nicht als 0');
  ok(!K.verify({ ...z([6, 5, 7, 8]), art: 'integral', funktion: 'tan(x)', von: 0, bis: 2 }).ok, 'KI-Prüfer: Integral über eine Polstelle wird abgelehnt');
}

// Leitstand 17.11.2026: KI-Punkte über POST /ki/rest abfragen (verbraucht nichts) – höchstens stündlich, 429 dort heißt nicht „0 Punkte“
{ const A = await import('../app/js/api.js'); const altLS = Object.getOwnPropertyDescriptor(globalThis, 'localStorage'), altFetch = globalThis.fetch;
  const mem = new Map(); Object.defineProperty(globalThis, 'localStorage', { configurable: true, writable: true, value: { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k) } });
  const rufe = []; let antwort = { status: 200, body: { rest: 12, limit: 15, tag: '2026-11-17' } };
  globalThis.fetch = async (url, o) => { rufe.push({ url, body: JSON.parse(o?.body || 'null') }); return { ok: antwort.status === 200, status: antwort.status, json: async () => antwort.body }; };
  try {
    await A.kiRestHolen('MT-AAAA-BBBB-CCCC', 'geraet-1234567890ab');
    ok(rufe.length === 1 && rufe[0].url === '/api/ki/rest' && rufe[0].body.zugang === 'MT-AAAA-BBBB-CCCC' && rufe[0].body.geraet === 'geraet-1234567890ab' && Object.keys(rufe[0].body).length === 2, 'KI-Punkte: POST /ki/rest nur mit Zugang und Gerät');
    ok(A.kiRestHeute() === 12 && A.kiLimitHeute() === 15, 'KI-Punkte: Rest und Limit (alte Codes 15) übernommen');
    await A.kiRestHolen('MT-AAAA-BBBB-CCCC', 'geraet-1234567890ab');
    ok(rufe.length === 1, 'KI-Punkte: höchstens einmal je Stunde nachfragen');
    mem.clear(); antwort = { status: 429, body: { error: 'zu oft' } };
    await A.kiRestHolen('MT-AAAA-BBBB-CCCC', 'geraet-1234567890ab');
    ok(rufe.length === 2 && A.kiRestHeute() === null, 'KI-Punkte: 429 bei /ki/rest setzt den Rest nicht auf 0');
    await A.kiRestHolen('', 'geraet-1234567890ab'); ok(rufe.length === 2, 'KI-Punkte: ohne Zugang keine Abfrage');
  } finally { globalThis.fetch = altFetch; if (altLS) Object.defineProperty(globalThis, 'localStorage', altLS); else delete globalThis.localStorage; }
}

// Leitstand 17.11.2026: KI dazubuchen – Knopf nur bei gültigem Pro ohne KI und nur im Web; nach dem Kauf schaltet die Prüfung KI frei
{ const A = await import('../app/js/api.js'); const { store: st } = await import('../app/js/store.js'); const alt = st.zugang, altFetch = globalThis.fetch, altApp = globalThis.window.MTApp;
  try {
    st.zugang = { code: 'MT-AAAA-BBBB-CCCC', art: 'pass', bis: '2099-07-31', ki: false };
    ok(A.proOhneKi() && A.kiDazuKnopf().includes(`${A.KI_UPGRADE}?code=MT-AAAA-BBBB-CCCC`) && /KI dazubuchen/.test(A.kaufLinks()), 'KI dazubuchen: Knopf mit eigenem Code bei Pro ohne KI');
    globalThis.window.MTApp = {}; ok(A.kiDazuKnopf() === '' && !/http/.test(A.kaufLinks()), 'KI dazubuchen: in der Android-App kein Kauflink'); delete globalThis.window.MTApp;
    const rufe = []; globalThis.fetch = async (url, o) => { rufe.push({ url, body: JSON.parse(o?.body || 'null') }); return { ok: true, status: 200, json: async () => ({ ok: true, ki: true, bis: '2099-07-31', art: 'pass' }) }; };
    ok(await A.kiNachpruefen() === true && st.zugang.ki === true && st.zugang.code === 'MT-AAAA-BBBB-CCCC' && rufe[0]?.url === '/api/zugang' && rufe[0].body.code === 'MT-AAAA-BBBB-CCCC', 'KI dazubuchen: Prüfung über POST /zugang schaltet KI frei');
    ok(A.kiDazuKnopf() === '' && await A.kiNachpruefen() === false && rufe.length === 1, 'KI dazubuchen: danach kein Knopf und keine weitere Abfrage');
    st.zugang = { code: 'MT-AAAA-BBBB-CCCC', art: 'pass', bis: '2000-01-01', ki: false }; ok(A.kiDazuKnopf() === '', 'KI dazubuchen: abgelaufener Code bekommt keinen Knopf');
  } finally { st.zugang = alt; globalThis.fetch = altFetch; if (altApp) globalThis.window.MTApp = altApp; else delete globalThis.window.MTApp; }
}

// Marcel 18.11.2026: ein Logo überall – das farbige Symbol in Kopf, Zertifikat, Ladebild, Teilen-Bild, Arbeitsblatt, Favicon, PWA und Android
{ const fs = await import('node:fs'); const lies = (f) => fs.readFileSync(new URL('../app/' + f, import.meta.url), 'utf8');
  const css = lies('css/app.css'), html = lies('index.html'), fav = lies('img/favicon.svg'), sym = lies('img/symbol.svg'), share = lies('js/share.js'), blatt = lies('js/blatt.js'), theo = lies('js/theorie.js');
  const farbig = (s) => s.includes('#16204a') && s.includes('#ff8a1f');
  ok(farbig(fav) && farbig(sym), 'Logo: favicon.svg und symbol.svg sind das farbige Symbol');
  ok(!/<text/.test(fav) && sym.length > fav.length + 500, 'Logo: klein (favicon) ohne Schrift, groß (symbol) mit f\'(x) als Pfad');
  ok(/\.brand-logo\{[^}]*img\/favicon\.svg/.test(css) && /\.zert-logo\{[^}]*img\/symbol\.svg/.test(css), 'Logo: Kopf und Zertifikat zeigen das farbige Symbol');
  ok(share.includes("'img/symbol.svg'") && blatt.includes('src="img/favicon.svg"') && theo.includes('src="img/favicon.svg"'), 'Logo: Teilen-Bild und Arbeitsblätter zeigen das farbige Symbol');
  ok(!fs.existsSync(new URL('../app/img/marke.svg', import.meta.url)) && !fs.existsSync(new URL('../app/img/logo.svg', import.meta.url)) && !/marke\.svg|logo\.svg/.test(css + html + share + blatt + theo), 'Logo: kein altes schwarz-weißes Logo mehr in der App');
  const lade = (html.split('<body>')[1].match(/<svg class="lade-logo"[\s\S]*?<\/svg>/) || [''])[0];
  ok(farbig(lade), 'Logo: Ladebild zeigt das farbige Symbol'); }

// Recht N1 (19.11.2026): Einlösefrist der 30-Tage-Codes nie „12 Monate“, sondern bis 31.12. des dritten Jahres nach dem Kauf
{ const fs = await import('node:fs'); const pro = fs.readFileSync(new URL('../app/js/pro.js', import.meta.url), 'utf8');
  ok(!/12 Monate/.test(pro) && /einlösbar bis zum 31\.12\. des dritten Jahres nach dem Kauf/.test(pro), 'Pro-Seite: Einlösefrist nach Recht N1, keine „12 Monate“'); }

console.log(fails ? `${fails} verschiedene Fehler bei ${n} Prüfungen` : `tests: alle ${n} Prüfungen bestanden`);
process.exit(fails ? 1 : 0);
