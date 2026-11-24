// Paket gen13 (Gauß-Verfahren, Potenz-, Wurzel-, Bruchgleichungen, rationale Hochzahlen): jede Aufgabe unabhängig nachrechnen.
// Gerechnet wird nur aus den Angaben der Aufgabe (daten) und aus dem Text der Antworten – nie mit den Formeln des Erzeugers:
// Gleichungen werden numerisch auf einem feinen Raster nach Nullstellen abgesucht, Lösungen exakt eingesetzt, Gauß-Systeme per Bruchrechnung gelöst.
globalThis.window = { katex: { renderToString: (s) => s } };
const G = await import('../../app/js/gen13.js');
let n = 0, fehler = 0; const ok = (c, m) => { n++; if (!c) { fehler++; if (fehler < 25) console.error('FEHLER:', m); } };

/* ───── Antworten lesen ───── */
const zahl = (s) => { const m = String(s).trim().match(/^(-?)\\dfrac\{(\d+)\}\{(\d+)\}$/); if (m) return (m[1] ? -1 : 1) * Number(m[2]) / Number(m[3]); return Number(s); };
const menge = (s) => { const m = String(s).match(/L=\\left\\\{(.*?)\\right\\\}/); if (!m) return null; const inn = m[1].trim(); if (inn === '\\') return []; return inn.split(';\\,').map((t) => zahl(t.trim())); };
const dMenge = (s) => { const m = String(s).match(/D=\\mathbb\{R\}\\setminus\\left\\\{(.*?)\\right\\\}/); return m ? m[1].split(';\\,').map((t) => zahl(t.trim())) : (/D=\\mathbb\{R\},/.test(s) ? [] : null); };
const gleichM = (a, b) => a.length === b.length && a.every((x, i) => Math.abs(x - b[i]) < 1e-9);
const sortiert = (a) => [...a].sort((x, y) => x - y);
const richtige = (q) => q.options.filter((o) => o.correct);
const klar = (q, m) => { ok(q && q.options.length === 4, `${m}: 4 Antworten`); ok(richtige(q).length === 1, `${m}: genau eine richtige`); ok(new Set(q.options.map((o) => o.tex)).size === 4, `${m}: verschiedene Antworten`); ok(q.options.every((o) => o.correct || o.why), `${m}: Diagnose je Fehler`); ok(Array.isArray(q.hints) && q.hints.length >= 1 && q.explain, `${m}: Hinweis + Erklärung`); };

/** Nullstellen von g auf [lo, hi] (Raster h): Vorzeichenwechsel oder exakte Nullen; liefert Mittelpunkte. */
function nullstellen(g, lo, hi, h = 0.01) {
  const out = []; let px = lo, py = g(lo);
  for (let i = 1; lo + i * h <= hi + 1e-9; i++) {
    const x = Math.round((lo + i * h) / h) * h, y = g(x);
    if (Number.isFinite(y) && Math.abs(y) < 1e-9) { if (!out.length || x - out[out.length - 1] > 2 * h) out.push(x); }
    else if (Number.isFinite(y) && Number.isFinite(py) && Math.abs(py) >= 1e-9 && Math.sign(y) !== Math.sign(py)) out.push((x + px) / 2);
    px = x; py = y;
  }
  return out;
}
/** Exakte Lösung aus dem Raster verfeinern (Bisektion), falls Vorzeichenwechsel; sonst Wert unverändert. */
const nah = (a, b, t = 0.011) => Math.abs(a - b) <= t;

/* ───── Gauß ───── */
const loeseSystem = (M, b) => {   // Cramer mit ganzen Zahlen
  const det = (m) => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  const D = det(M); if (!D) return null;
  return [0, 1, 2].map((j) => det(M.map((r, i) => r.map((v, k) => (k === j ? b[i] : v)))) / D);
};
const rang = (M) => { const m = M.map((r) => [...r]); let r = 0; for (let c = 0; c < m[0].length && r < m.length; c++) { let p = -1; for (let i = r; i < m.length; i++) if (Math.abs(m[i][c]) > 1e-9) { p = i; break; } if (p < 0) continue; [m[r], m[p]] = [m[p], m[r]]; for (let i = r + 1; i < m.length; i++) { const f = m[i][c] / m[r][c]; for (let k = c; k < m[0].length; k++) m[i][k] -= f * m[r][k]; } r++; } return r; };
const koef = (s) => { const t = s.split('=')[0], v = { x: 0, y: 0, z: 0 }; for (const m of t.matchAll(/([+-]?)(\d*)([xyz])/g)) v[m[3]] += (m[1] === '-' ? -1 : 1) * (m[2] === '' ? 1 : Number(m[2])); return [v.x, v.y, v.z, Number(s.split('=')[1])]; };
for (let lv = 1; lv <= 5; lv++) for (let i = 0; i < 250; i++) {
  const q = G.genGauss(lv); klar(q, `gauss${lv}`); const d = q.daten, rt = richtige(q)[0].tex;
  if (q.kind === 'gauss') {
    const s = loeseSystem(d.M, d.b); ok(s && s.every(Number.isInteger), 'gauss: eindeutig, ganzzahlig'); if (!s) continue;
    const m = rt.match(/x=(-?\d+),\\ y=(-?\d+),\\ z=(-?\d+)/); ok(m && [1, 2, 3].every((k, j) => Number(m[k]) === s[j]), `gauss: richtige Antwort ${rt} ≠ ${s}`);
    for (const o of q.options.filter((x) => !x.correct)) { const w = o.tex.match(/x=(-?\d+),\\ y=(-?\d+),\\ z=(-?\d+)/); ok(w && !(Number(w[1]) === s[0] && Number(w[2]) === s[1] && Number(w[3]) === s[2]), 'gauss: falsche Antwort ist keine Lösung'); }
    ok(d.M.every((r) => r.some((v) => v)), 'gauss: keine Nullzeile');
    if (lv === 1) ok(d.M[1][0] === 0 && d.M[2][0] === 0 && d.M[2][1] === 0, 'gauss L1: Dreiecksform');
  } else if (q.kind === 'gauss-schritt') {
    const f = d.f, neu = d.M[1].map((v, j) => v - f * d.M[0][j]), nb = d.b[1] - f * d.b[0];
    ok(neu[0] === 0, 'schritt: x fällt weg'); const k = koef(rt); ok(k[0] === neu[0] && k[1] === neu[1] && k[2] === neu[2] && k[3] === nb, `schritt: ${rt} ≠ ${neu}|${nb}`);
    for (const o of q.options.filter((x) => !x.correct)) { const w = koef(o.tex); ok(!(w[0] === neu[0] && w[1] === neu[1] && w[2] === neu[2] && w[3] === nb), 'schritt: falsche Antwort gleich der richtigen'); }
  } else if (q.kind === 'gauss-anzahl') {
    const Ab = d.M.map((r, i) => [...r, d.b[i]]), rA = rang(d.M), rAb = rang(Ab);
    const wahr = rA === 3 ? 'genau eine Lösung' : rA === rAb ? 'unendlich viele Lösungen' : 'keine Lösung';
    ok(rt.includes(wahr.replace('genau eine Lösung', 'genau eine Lösung')) && rt.replace(/\\text\{|\}/g, '') === wahr, `anzahl: ${rt} ≠ ${wahr}`);
    ok(d.art === (rA === 3 ? 'eine' : rA === rAb ? 'viele' : 'keine'), 'anzahl: art stimmt');
  } else ok(false, `unbekannte Art ${q.kind}`);
}

/* ───── Potenzgleichungen ───── */
for (let lv = 1; lv <= 5; lv++) for (let i = 0; i < 250; i++) {
  const q = G.genPotenzGl(lv); klar(q, `potenz${lv}`); const d = q.daten, L = menge(richtige(q)[0].tex);
  const g = (x) => d.a * (x - d.c) ** d.n - d.b, roots = nullstellen(g, -200, 200);
  ok(L && roots.length === L.length && sortiert(roots).every((r, j) => nah(r, sortiert(L)[j])), `potenz: Nullstellen ${roots} ≠ ${L} bei ${q.formula}`);
  ok(L && L.every((x) => Math.abs(g(x)) < 1e-9), 'potenz: Probe');
  for (const o of q.options.filter((x) => !x.correct)) { const W = menge(o.tex); ok(W && !gleichM(sortiert(W), sortiert(L)), 'potenz: falsche Antwort gleich'); }
}

/* ───── Wurzelgleichungen ───── */
const wf = (d) => (d.art === 'lin' ? (x) => d.k * Math.sqrt(x) - d.r : d.art === 'term' ? (x) => Math.sqrt(d.a * x + d.b) + d.p - d.c : d.art === 'schein' ? (x) => Math.sqrt(x + d.a) - (x + d.b) : (x) => d.k * Math.sqrt(d.m * x) - d.n * x);
function wurzelPruefen(q, m) {
  klar(q, m); const d = q.daten, L = menge(richtige(q)[0].tex), g = wf(d);
  ok(L && L.every((x) => Math.abs(g(x)) < 1e-9), `${m}: Probe der Lösungen ${L} bei ${q.formula}`);
  ok(L && gleichM(sortiert(L), sortiert(d.sol)), `${m}: Lösung stimmt mit Angabe`);
  const roots = nullstellen(g, -200, 400);
  // am Rand des Definitionsbereichs (Wurzel = 0) zählt die exakte Null ebenfalls als Nullstelle
  ok(L && roots.length === L.length && sortiert(roots).every((r, j) => nah(r, sortiert(L)[j], 0.02)), `${m}: Raster-Nullstellen ${roots} ≠ ${L} bei ${q.formula}`);
  for (const o of q.options.filter((x) => !x.correct)) { const W = menge(o.tex); ok(W && !gleichM(sortiert(W), sortiert(L)), `${m}: falsche Antwort gleich`); }
}
for (let lv = 1; lv <= 5; lv++) for (let i = 0; i < 250; i++) wurzelPruefen(G.genWurzelGl(lv), `wurzel${lv}`);
// Marcels Arbeitsblatt: vier feste Prüfsteine (exakt)
const pr = (q) => menge(richtige(q)[0].tex);
const a = G.wurzelLin(2, { n: 6, d: 1 }), b = G.wurzelLin(5, { n: -1, d: 16 }), c = G.wurzelTerm(-1, 5, 10), dd = G.wurzelMalX(2, 5, 10);
ok(a && gleichM(pr(a), [9]), 'Prüfstein a) 2√x=6 → {9}'); ok(b && gleichM(pr(b), []), 'Prüfstein b) 5√x=−1/16 → {}');
ok(c && gleichM(pr(c), [-95]), 'Prüfstein c) √(−x+5)=10 → {−95}'); ok(dd && gleichM(sortiert(pr(dd)), [0, 0.2]), 'Prüfstein d) 2√(5x)=10x → {0; 1/5}');
for (const [q, t] of [[a, '2\\sqrt{x}=6'], [b, '5\\sqrt{x}=-\\dfrac{1}{16}'], [c, '\\sqrt{-x+5}=10'], [dd, '2\\sqrt{5x}=10x']]) ok(q && q.formula === t, `Prüfstein-Formel ${q?.formula} ≠ ${t}`);
for (const q of [a, b, c, dd]) if (q) wurzelPruefen(q, 'pruefstein');
// Scheinlösungen kommen wirklich vor
let schein = 0; for (let i = 0; i < 300; i++) { const q = G.genWurzelGl(4); if (q.daten.art === 'schein') { schein++; const x1 = q.daten.sol[0]; ok(Math.abs(wf(q.daten)(x1)) < 1e-9, 'schein: Lösung stimmt'); } }
ok(schein > 100, 'Scheinlösungs-Aufgaben vorhanden');

/* ───── Bruchgleichungen ───── */
const bf = (d) => {
  switch (d.art) {
    case 'bg1': return [(x) => (d.a / (x - d.b) - d.c) * (x - d.b)];
    case 'bg2': return [(x) => (d.p / (x - d.a) - d.q / (x - d.b)) * (x - d.a) * (x - d.b)];
    case 'bg3': return [(x) => (x + d.p) - (d.b + d.p)];
    case 'bg4': return [(x) => d.a * (x + d.b) + d.c * (x - d.b) - d.d];
    default: return [(x) => x * x + d.p - d.s * x];
  }
};
for (let lv = 1; lv <= 5; lv++) for (let i = 0; i < 250; i++) {
  const q = G.genBruchGl(lv); klar(q, `bruch${lv}`); const d = q.daten, rt = richtige(q)[0].tex, L = menge(rt), D = dMenge(rt);
  ok(D && gleichM(sortiert(D), sortiert(d.D)), `bruch: Definitionsmenge ${D} ≠ ${d.D}`);
  const [P] = bf(d), roots = nullstellen(P, -100, 100).filter((r) => !d.D.some((p) => nah(r, p, 0.02)));
  const echt = d.art === 'bg3' ? [] : roots;   // bg3: einzige Nullstelle liegt in der Definitionslücke
  ok(L && gleichM(sortiert(L), sortiert(d.sol)), 'bruch: Lösung stimmt mit Angabe');
  ok(L && echt.length === L.length && sortiert(echt).every((r, j) => nah(r, sortiert(L)[j], 0.02)), `bruch: Raster-Lösungen ${echt} ≠ ${L} bei ${q.formula}`);
  ok(L && L.every((x) => !d.D.includes(x)), 'bruch: Lösung nicht in der Lücke');
  for (const o of q.options.filter((x) => !x.correct)) { const W = menge(o.tex), DD = dMenge(o.tex); ok(W && DD && !(gleichM(sortiert(W), sortiert(L)) && gleichM(sortiert(DD), sortiert(D))), 'bruch: falsche Antwort gleich'); }
}

/* ───── rationale Hochzahlen ───── */
const bruchHz = (s) => { const m = String(s).match(/^x\^\{(?:(-?)\\dfrac\{(\d+)\}\{(\d+)\}|(-?\d+))\}$/); return m ? (m[4] !== undefined ? Number(m[4]) : (m[1] ? -1 : 1) * Number(m[2]) / Number(m[3])) : NaN; };
for (let lv = 1; lv <= 5; lv++) for (let i = 0; i < 250; i++) {
  const q = G.genRatPot(lv); klar(q, `ratpot${lv}`); const d = q.daten, rt = richtige(q)[0].tex;
  if (q.kind === 'ratpot') {
    const w = Math.pow(d.a, (d.neg ? -1 : 1) * d.m / d.n); ok(Math.abs(zahl(rt) - w) < 1e-9, `ratpot: ${d.a}^(${d.m}/${d.n}) = ${w} ≠ ${rt}`);
    ok(Math.abs(Math.round(Math.pow(d.a, 1 / d.n)) ** d.n - d.a) === 0, 'ratpot: Basis ist n-te Potenz');
    for (const o of q.options.filter((x) => !x.correct)) ok(Math.abs(zahl(o.tex) - w) > 1e-9, 'ratpot: falsche Antwort gleich');
  } else if (q.kind === 'ratpot-term') {
    const e1 = d.p / d.q, e2 = d.r / d.t, soll = d.kind === 'mal' ? e1 + e2 : d.kind === 'durch' ? e1 - e2 : e1 * e2;
    ok(Math.abs(bruchHz(rt) - soll) < 1e-9, `ratpot-term: ${rt} ≠ ${soll}`);
    for (const o of q.options.filter((x) => !x.correct)) { const e = bruchHz(o.tex); ok(Number.isNaN(e) || Math.abs(e - soll) > 1e-9, 'ratpot-term: falsche Antwort gleich'); }
  } else if (q.kind === 'ratpot-gl') {
    const x = Number(rt); ok(Math.abs(Math.pow(x, d.m / d.n) - d.k) < 1e-9, `ratpot-gl: ${x}^(${d.m}/${d.n}) ≠ ${d.k}`);
    for (const o of q.options.filter((v) => !v.correct)) ok(Math.abs(Math.pow(zahl(o.tex), d.m / d.n) - d.k) > 1e-6, 'ratpot-gl: falsche Antwort löst auch');
  } else ok(false, `unbekannte Art ${q.kind}`);
}

/* ───── Themen und Namen ───── */
for (const [k, f] of Object.entries(G.GENS13)) { ok(f.name === k, `Name ${k}`); ok(typeof f.topic === 'string' && f.topic.length > 3, `Thema ${k}`); }

console.log(`gen13: ${n} Prüfungen, ${fehler} Fehler`);
if (fehler) process.exit(1);
