// Sammelt alle TeX-Schnipsel und Texte aus allen Erzeugern (Stufe 1–5, je 60 Aufgaben) → JSON für die Sprech-Entwicklung
import fs from 'node:fs';
const R = new URL('../../app/js/', import.meta.url).pathname; const tex = new Map(), texte = new Set();
globalThis.window = { katex: { renderToString: (s) => { tex.set(s, (tex.get(s) || 0) + 1); return `⟦${s}⟧`; } } };
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
globalThis.document = { documentElement: { dataset: {} }, createElement: () => ({}) };
const { seedRandom } = await import(R + 'math.js');
const N = +(process.argv[3] || 60);
for (const d of fs.readdirSync(R).filter((f) => /^gen\d*\.js$/.test(f))) { const M = await import(R + d);
  for (const [name, fn] of Object.entries(M)) { if (typeof fn !== 'function' || !/^gen/.test(name)) continue;
    for (let lv = 1; lv <= 5; lv++) { seedRandom(99 + lv); for (let i = 0; i < N; i++) { let q; try { q = fn(lv); } catch { break; }
      if (!q) continue; if (typeof q.formula === 'string') tex.set(q.formula, (tex.get(q.formula) || 0) + 1);
      for (const o of q.options || []) if (typeof o?.tex === 'string') tex.set(o.tex, (tex.get(o.tex) || 0) + 1);
      for (const t of [q.prompt, q.explain, ...(q.hints || [])]) if (typeof t === 'string') texte.add(t); } }
    seedRandom(null); } }
fs.writeFileSync(process.argv[2], JSON.stringify({ tex: [...tex.keys()], texte: [...texte] }));
const cmd = new Map(); for (const s of tex.keys()) for (const c of s.match(/\\[a-zA-Z]+|\\./g) || []) cmd.set(c, (cmd.get(c) || 0) + 1);
console.log('TeX:', tex.size, 'Texte:', texte.size); console.log([...cmd].sort((a, b) => b[1] - a[1]).map(([c, n]) => `${c}:${n}`).join(' '));
