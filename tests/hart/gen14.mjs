// Paket gen14 (Nullstellen: Ausklammern, Substitution, Polynomdivision): jede Aufgabe unabhängig nachrechnen –
// aus dem Aufgabentext (Funktionsterm wird gelesen) und dem Text der Antworten, Nullstellen per Raster-Suche, Quotienten durch Rückmultiplikation.
globalThis.window = { katex: { renderToString: (s) => s } };
const G = await import('../../app/js/gen14.js');
let n = 0, fehler = 0; const ok = (c, m) => { n++; if (!c) { fehler++; if (fehler < 25) console.error('FEHLER:', m); } };

const menge = (s) => { const m = String(s).match(/L=\\left\\\{(.*?)\\right\\\}/); if (!m) return null; const inn = m[1].trim(); if (inn === '\\') return []; return inn.split(';\\,').map(Number); };
const gl = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
const sort = (a) => [...a].sort((x, y) => x - y);
const richtige = (q) => q.options.filter((o) => o.correct);
const klar = (q, m) => { ok(q && q.options.length === 4, `${m}: 4 Antworten`); ok(richtige(q).length === 1, `${m}: genau eine richtige`); ok(new Set(q.options.map((o) => o.tex)).size === 4, `${m}: verschieden`); ok(q.options.every((o) => o.correct || o.why), `${m}: Diagnose`); ok(q.hints?.length >= 1 && q.explain, `${m}: Tipp+Erklärung`); };
/** Polynom aus dem TeX der Aufgabe lesen (absteigend, auch ohne ^{…}). */
const parse = (t) => { const c = {}; let s = String(t).replace(/^f\(x\)=/, '').replace(/=0$/, '').replace(/z/g, 'x');
  for (const m of s.matchAll(/([+-]?)(\d*)(x(?:\^\{(\d+)\})?)?/g)) { if (!m[0]) continue; if (m[2] === '' && !m[3]) continue; const e = m[3] ? (m[4] ? +m[4] : 1) : 0, k = m[2] === '' ? 1 : +m[2]; c[e] = (c[e] || 0) + (m[1] === '-' ? -1 : 1) * k; }
  const d = Math.max(...Object.keys(c).map(Number)); return Array.from({ length: d + 1 }, (_, i) => c[d - i] || 0); };
const ausw = (c, x) => c.reduce((s, a) => s * x + a, 0);
const nullst = (c) => { const out = []; let px = -60, py = ausw(c, -60); for (let i = 1; -60 + i * 0.01 <= 60.0001; i++) { const x = Math.round((-60 + i * 0.01) * 100) / 100, y = ausw(c, x); if (Math.abs(y) < 1e-9) { if (!out.length || x - out[out.length - 1] > 0.03) out.push(x); } else if (Math.abs(py) >= 1e-9 && Math.sign(y) !== Math.sign(py)) out.push((x + px) / 2); px = x; py = y; } return out; };
const nah = (a, b) => a.length === b.length && sort(a).every((x, i) => Math.abs(x - sort(b)[i]) < 0.011);

for (let lv = 1; lv <= 5; lv++) for (let i = 0; i < 300; i++) {
  for (const [name, gen] of [['auskl', G.genNullAuskl], ['subst', G.genNullSubst]]) {
    const q = gen(lv); klar(q, `${name}${lv}`); const c = parse(q.formula), L = menge(richtige(q)[0].tex), d = q.daten;
    if (q.kind === 'subst-konz') { const k3 = parse(richtige(q)[0].tex), k5 = parse(q.formula); ok(k5.length === 5 && k5[1] === 0 && k5[3] === 0 && gl(k3, [k5[0], k5[2], k5[4]]), `subst-konz: ${richtige(q)[0].tex} ≠ Ersetzung von ${q.formula}`); for (const o of q.options.filter((x) => !x.correct)) ok(!gl(parse(o.tex), k3), 'subst-konz: falsche gleich der richtigen'); continue; }
    ok(gl(c, d.koef), `${name}: Term ${q.formula} gelesen als ${c} statt ${d.koef}`);
    ok(L && nah(nullst(c), L), `${name}: Raster-Nullstellen ${nullst(c)} ≠ ${L} bei ${q.formula}`);
    ok(L && L.every((x) => ausw(c, x) === 0), `${name}: Probe`);
    for (const o of q.options.filter((x) => !x.correct)) { const W = menge(o.tex); ok(W && !gl(sort(W), sort(L)), `${name}: falsche Antwort gleich`); }
  }
  const q = G.genNullPoly(lv); klar(q, `poly${lv}`); const d = q.daten, c = parse(q.formula), rt = richtige(q)[0].tex;
  ok(gl(c, d.koef), `poly: Term gelesen ${c} ≠ ${d.koef}`);
  if (q.kind === 'pd-probe') { const x = +rt.replace('x=', ''); ok(ausw(c, x) === 0, 'probe: richtige ist Nullstelle'); for (const o of q.options.filter((v) => !v.correct)) ok(ausw(c, +o.tex.replace('x=', '')) !== 0, 'probe: falsche ist keine Nullstelle'); }
  else if (q.kind === 'pd-quot') { const quot = parse(rt), r = d.r; const prod = [0, 0, 0, 0]; quot.forEach((v, i) => { prod[i] += v; prod[i + 1] -= r * v; }); ok(ausw(c, r) === 0, 'quot: r ist Nullstelle'); ok(gl(prod.slice(0, 4), c), `quot: ${rt}·(x−${r}) ≠ ${c}`); for (const o of q.options.filter((v) => !v.correct)) { const w = parse(o.tex), pr = [0, 0, 0, 0]; w.forEach((v, k) => { pr[k] += v; pr[k + 1] -= r * v; }); ok(!gl(pr.slice(0, 4), c), 'quot: falsche Antwort ist auch richtig'); } }
  else { const L = menge(rt); ok(L && nah(nullst(c), L) && ausw(c, d.r) === 0 && L.includes(d.r), `alle: ${nullst(c)} ≠ ${L} bei ${q.formula}`); for (const o of q.options.filter((x) => !x.correct)) ok(!gl(sort(menge(o.tex)), sort(L)), 'alle: falsche gleich'); }
}
for (const [k, f] of Object.entries(G.GENS14)) { ok(f.name === k, `Name ${k}`); ok(typeof f.topic === 'string' && f.topic.length > 3, `Thema ${k}`); }
console.log(`gen14: ${n} Prüfungen, ${fehler} Fehler`);
if (fehler) process.exit(1);
