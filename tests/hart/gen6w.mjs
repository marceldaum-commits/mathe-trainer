// Winkel (Klasse 5–10): neue Formen unabhängig nachrechnen.
globalThis.window = { katex: { renderToString: (s) => s } };
const { MITTEL_GENS } = await import('../../app/js/gen6.js');
let n = 0, fehler = 0; const ok = (c, m) => { n++; if (!c) { fehler++; if (fehler < 20) console.error('FEHLER:', m); } };
const zahlen = (t) => (String(t).match(/\d+/g) || []).map(Number);
for (let lv = 1; lv <= 5; lv++) for (let i = 0; i < 400; i++) {
  const q = MITTEL_GENS.genWinkel(lv), r = q.options.filter((o) => o.correct), z = zahlen(q.prompt);
  ok(r.length === 1 && q.options.length === 4 && new Set(q.options.map((o) => o.num)).size === 4, `${q.kind}: genau eine richtige, vier verschiedene`);
  ok(q.hints.length >= 2 && !/undefined|NaN/.test(JSON.stringify(q)), `${q.kind}: vollständig`);
  ok(q.options.every((o) => o.correct || o.why), `${q.kind}: Ablenker mit Erklärung`);
  let soll = null;
  if (q.kind === 'vieleck' || q.kind === 'vieleckgross') { const m = z[0]; let s = 0; for (let k = 0; k < m - 2; k++) s += 180; soll = s / m; }
  if (q.kind === 'viereckgleich') { for (let x = 1; x < 360; x += 0.5) if (z[0] + z[1] + 2 * x === 360) soll = x; }
  if (q.kind === 'aussenbasis') { const b = 180 - z[0]; for (let s = 0.5; s < 180; s += 0.5) if (s + 2 * b === 180) soll = s; }
  if (q.kind === 'verhaeltnis') { const [x, y, w] = z; for (let e = 1; e <= 180; e++) if (e * (x + y + w) === 180) soll = e * Math.max(x, y, w); }
  if (soll !== null) ok(Math.abs(r[0].num - soll) < 1e-9, `${q.kind}: Ergebnis ${r[0].num} statt ${soll} (${q.prompt})`);
  if (lv >= 4) ok(soll !== null || q.kind === 'aussen', `Stufe ${lv}: Form ${q.kind} wird geprüft`);
}
if (fehler) { console.error(`hart/gen6w: ${fehler} Fehler`); process.exit(1); }
console.log(`hart/gen6w: ${n} Prüfungen bestanden`);
