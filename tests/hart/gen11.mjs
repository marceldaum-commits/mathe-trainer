// Paket gen11 (Punkte, Vierecke und Geraden im Raum): jede Aufgabe unabhängig nachrechnen – aus dem, was der Lernende sieht.
globalThis.window = { katex: { renderToString: (s) => s } };
const { GENS11 } = await import('../../app/js/gen11.js');
let n = 0, fehler = 0; const ok = (c, m) => { n++; if (!c) { fehler++; if (fehler < 25) console.error('FEHLER:', m); } };
const zahlen = (t) => (String(t).replace(/\{,\}/g, '.').match(/-?\d+(\.\d+)?/g) || []).map(Number);
const punkte = (t) => [...String(t).replace(/\{,\}/g, '.').matchAll(/\(([^()]*\\mid[^()]*)\)/g)].map((m) => m[1].split('\\mid').map((x) => (/^\s*-?\d+(\.\d+)?\s*$/.test(x) ? +x : x.trim())));
const vekt = (t) => [...String(t).replace(/\{,\}/g, '.').matchAll(/\\begin\{pmatrix\}(.*?)\\end\{pmatrix\}/g)].map((m) => m[1].split('\\\\').map((x) => (/^\s*-?\d+(\.\d+)?\s*$/.test(x) ? +x : x.trim())));
const sub = (a, b) => a.map((c, i) => c - b[i]), dot = (a, b) => a.reduce((s, c, i) => s + c * b[i], 0), len2 = (a) => dot(a, a);
const kreuz = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const par = (a, b) => (a.length === 2 ? Math.abs(a[0] * b[1] - a[1] * b[0]) < 1e-9 : kreuz(a, b).every((x) => Math.abs(x) < 1e-9));
const nah = (a, b) => a.length === b.length && a.every((c, i) => Math.abs(c - b[i]) < 1e-9);
const achsAbst2 = (p, k) => p.reduce((s, c, i) => (i === k ? s : s + c * c), 0);
// Spiegelungen über Lotfußpunkte (nicht über Vorzeichenregeln)
const anEbene = (p, i, c = 0) => { const fuss = p.slice(); fuss[i] = c; return p.map((x, j) => 2 * fuss[j] - x); };
const anAchse = (p, k) => { const fuss = [0, 0, 0]; fuss[k] = p[k]; return p.map((x, j) => 2 * fuss[j] - x); };
const achseAus = (t) => +/x_(\d)\}?\$?-Achse|x_(\d)-Achse/.exec(t)?.slice(1).find(Boolean) - 1;
const index = (t, re) => [...t.matchAll(re)].map((m) => +m[1] - 1);
const tMenge = (t) => { const s = String(t).replace(/\{,\}/g, '.'), aus = []; for (const m of s.matchAll(/t=(\\pm ?)?(\\sqrt\{(\d+)\}|-?\d+(\.\d+)?)/g)) { const w = m[3] ? Math.sqrt(+m[3]) : +m[2]; if (m[1]) aus.push(w, -w); else aus.push(w); } return aus; };
const gleichMenge = (a, b) => a.length === b.length && a.every((x) => b.some((y) => Math.abs(x - y) < 1e-9)) && b.every((x) => a.some((y) => Math.abs(x - y) < 1e-9));

const PRUEF = {
  ebene: (q, o) => { if (q.gen === 'sp') { const [p] = punkte(q.prompt), i = index(q.prompt, /x_(\d)x_(\d)/g); const fehlt = [0, 1, 2].find((x) => !q.prompt.match(new RegExp(`x_${x + 1}x_|x_\\dx_${x + 1}`))); return nah(punkte(o.tex)[0], anEbene(p, fehlt)); }
    const [p] = punkte(q.prompt), null0 = p.findIndex((c) => c === 0), m = /x_(\d)x_(\d)/.exec(o.tex); return m ? ![+m[1] - 1, +m[2] - 1].includes(null0) && p.filter((c) => c === 0).length === 1 : p.every((c) => c !== 0); },
  achse: (q, o) => { const k = +/x_(\d)/.exec(q.prompt)[1] - 1; if (q.gen === 'sp') return nah(punkte(o.tex)[0], anAchse(punkte(q.prompt)[0], k)); const p = punkte(o.tex)[0]; return p[k] !== 0 && p.every((c, i) => i === k || c === 0); },
  zweiebenen: (q, o) => { const e = [...q.prompt.matchAll(/x_(\d)x_(\d)/g)].map((m) => [0, 1, 2].find((x) => x !== +m[1] - 1 && x !== +m[2] - 1));
    if (q.gen === 'sp') return nah(punkte(o.tex)[0], anEbene(anEbene(punkte(q.prompt)[0], e[0]), e[1])); const p = punkte(o.tex)[0]; return p[e[0]] === 0 && p[e[1]] === 0 && p.some((c) => c !== 0); },
  gleichweit: (q, o) => { const a = [...q.prompt.matchAll(/x_(\d)/g)].map((m) => +m[1] - 1), p = punkte(o.tex)[0]; return achsAbst2(p, a[0]) === achsAbst2(p, a[1]); },
  achsabstand: (q, o) => { const p = punkte(q.prompt)[0], k = +/von der x_(\d)/.exec(q.prompt)[1] - 1, d = +/Abstand (\d+)/.exec(q.prompt)[1], soll = [];
    for (let t = -20; t <= 20; t += 0.0005) { const a = Math.sqrt(achsAbst2(p.map((c) => (c === 't' ? t : c)), k)), b = Math.sqrt(achsAbst2(p.map((c) => (c === 't' ? t + 0.0005 : c)), k)); if ((a - d) * (b - d) <= 0 && a !== b) soll.push(t + 0.0005 * (d - a) / (b - a)); }
    const ist = tMenge(o.tex); return ist.length === soll.length && ist.every((x) => soll.some((y) => Math.abs(x - y) < 1e-3)) && soll.every((x) => ist.some((y) => Math.abs(x - y) < 1e-3)); },
  gleichweitt: (q, o) => { const p = punkte(q.prompt)[0], m = /^(-?\d+)t([+-]\d+)$/.exec(p[1]), soll = []; for (let t = -40; t <= 40; t += 0.5) { const y = +m[1] * t + +m[2]; if (y * y + p[2] * p[2] === t * t + p[2] * p[2]) soll.push(t); } return gleichMenge(tMenge(o.tex), soll); },
  ebeneachse: (q, o) => { const p = punkte(q.prompt)[0], e = /x_(\d)x_(\d)/.exec(q.prompt), i = [0, 1, 2].find((x) => x !== +e[1] - 1 && x !== +e[2] - 1), k = +/an der x_(\d)-Achse/.exec(q.prompt)[1] - 1; return nah(punkte(o.tex)[0], anAchse(anEbene(p, i), k)); },
  parallel: (q, o) => { const p = punkte(q.prompt)[0], m = /x_(\d)=(-?\d+)/.exec(q.prompt); return nah(punkte(o.tex)[0], anEbene(p, +m[1] - 1, +m[2])); },
  rueck: (q, o) => { const m = /x_(\d)=(-?\d+)/.exec(q.prompt), k = +/an der x_(\d)-Achse/.exec(q.prompt)[1] - 1, bild = punkte(q.prompt)[0]; return nah(anAchse(anEbene(punkte(o.tex)[0], +m[1] - 1, +m[2]), k), bild); },
  welche: (q, o) => { const [p, bild] = punkte(q.prompt), i = +/x_(\d)=c/.exec(q.prompt)[1] - 1, e = /x_(\d)x_(\d)/.exec(q.prompt), j = [0, 1, 2].find((x) => x !== +e[1] - 1 && x !== +e[2] - 1); return nah(anEbene(anEbene(p, i, zahlen(o.tex)[0]), j), bild); },
  vierter2: (q, o) => { const [A, B, C] = punkte(q.formula), D = punkte(o.tex)[0]; return nah(sub(B, A), sub(C, D)); },
  nachweis: (q, o) => { const [A, B, C, D] = punkte(q.formula), ist = nah(sub(B, A), sub(C, D)); return o.tex.startsWith('\\text{ja: }\\overrightarrow{AB}=\\overrightarrow{DC}') ? ist : o.tex.startsWith('\\text{nein: }\\overrightarrow{AB}\\neq') ? !ist : false; },
  raute: (q, o) => { const [A, B, , D] = punkte(q.formula), a = len2(sub(B, A)), d = len2(sub(D, A)), w = [...o.tex.matchAll(/=(\\sqrt\{(\d+)\}|\d+)/g)].map((m) => (m[2] ? +m[2] : +m[1] * +m[1]));
    if (/overrightarrow/.test(o.tex)) return false; return o.tex.startsWith('\\text{ja') ? a === d && w[0] === a : a !== d && w[0] === a && w[1] === d; },
  diagonal: (q, o) => { const [, B, M] = punkte(q.formula), D = punkte(o.tex)[0], m = /=(\\sqrt\{(\d+)\}|\d+)$/.exec(o.tex), l2 = m[2] ? +m[2] : +m[1] * +m[1]; return nah(B.map((c, i) => (c + D[i]) / 2), M) && l2 === len2(sub(D, B)); },
  form: (q, o) => { const [A, B, D] = punkte(q.formula), u = sub(B, A), v = sub(D, A), r = dot(u, v) === 0, g = len2(u) === len2(v); return o.tex === `\\text{${r ? (g ? 'Quadrat' : 'Rechteck, aber keine Raute') : g ? 'Raute, aber kein Rechteck' : 'weder Rechteck noch Raute'}}`; },
  richtung: (q, o) => { const [, u] = vekt(q.formula); return par(vekt(o.tex)[0], u) && len2(vekt(o.tex)[0]) > 0; },
  stuetz: (q, o) => { const [p, u] = vekt(q.formula); return par(sub(punkte(o.tex)[0], p), u); },
  gleichung: (q, o) => { const [p, u] = vekt(q.formula), [a, b] = vekt(o.tex); return par(b, u) && par(sub(a, p), u); },
  identisch: (q, o) => { const [p, u, a, b] = vekt(q.formula), lage = !par(u, b) ? (Math.abs(dot(kreuz(u, b), sub(a, p))) < 1e-9 ? 'schneiden' : 'windschief') : par(sub(a, p), u) ? 'identisch' : 'echt parallel'; return o.tex.includes(lage); },
  parameter: (q, o) => { const [p, u, a, b] = vekt(q.formula), [x, y] = zahlen(o.tex), A = a.map((c) => (c === 'a' ? x : c)), B = b.map((c) => (c === 'b' ? y : c)); return par(B, u) && par(sub(A, p), u); },
  kollinear: (q, o) => { const [A, B, C] = punkte(q.formula), u = sub(B, A), w = sub(C, A), ja = par(u, w);
    if (o.tex.startsWith('\\text{nein')) return !ja; const m = /=(-?[\d.]+)\\cdot/.exec(o.tex.replace(/\{,\}/g, '.')), k = m ? +m[1] : 1; return nah(w, u.map((c) => k * c)); },
  fehlt: (q, o) => { const [A, B, C] = punkte(q.formula), c = C.map((x) => (x === 'c' ? zahlen(o.tex)[0] : x)); return par(sub(B, A), sub(c, A)); },
  zweifehlen: (q, o) => { const [A, B, C] = punkte(q.formula), [x, y] = zahlen(o.tex), c = C.map((z) => (z === 'a' ? x : z === 'b' ? y : z)); return par(sub(B, A), sub(c, A)); },
};
PRUEF.vierter3 = PRUEF.vierter2; PRUEF['prüfen2'] = PRUEF['prüfen3'] = PRUEF['prüfen3h'] = PRUEF.kollinear;

const gesehen = {};
for (const [name, fn] of Object.entries(GENS11)) for (let lv = 1; lv <= 5; lv++) for (let i = 0; i < 400; i++) {
  const q = fn(lv), tag = `${name} Stufe ${lv} (${q.kind})`; q.gen = name === 'genKoordSpiegel' ? 'sp' : '';
  (gesehen[`${name}/${lv}`] ||= new Set()).add(q.kind);
  ok(q.options.length === 4 && q.options.filter((o) => o.correct).length === 1 && new Set(q.options.map((o) => o.tex)).size === 4, `${tag}: vier verschiedene Antworten, genau eine richtig`);
  ok(q.hints.length >= 1 && q.hints.length <= 6 && q.explain && q.options.every((o) => o.correct || o.why), `${tag}: Tipps, Erklärung, Begründungen`);
  ok(!/undefined|NaN|Infinity/.test(`${q.prompt}${q.formula ?? ''}${q.options.map((o) => o.tex + (o.why || '')).join()}${q.hints.join()}${q.explain}`), `${tag}: vollständig (${q.prompt})`);
  ok(!/\d\.\d/.test(`${q.prompt}${q.formula ?? ''}${q.options.map((o) => o.tex).join()}${q.hints.join()}${q.explain}`), `${tag}: Dezimalkomma`);
  ok(!/--|\+-|-\+|\+\+/.test(`${q.formula ?? ''}${q.options.map((o) => o.tex).join()}${q.hints.join()}${q.explain}`.replace(/\\\\/g, '')), `${tag}: keine doppelten Vorzeichen (${q.hints.join(' | ').slice(0, 200)})`);
  const pr = PRUEF[q.kind]; ok(!!pr, `${tag}: Prüfung vorhanden`); if (!pr) continue;
  for (const o of q.options) { let r; try { r = pr(q, o); } catch (e) { r = `Fehler ${e.message}`; } ok(r === !!o.correct, `${tag}: Antwort ${o.tex} ist ${o.correct ? 'richtig' : 'falsch'} markiert, nachgerechnet: ${r} · ${q.prompt} · ${q.formula ?? ''}`); }
}
const FORMEN = { genKoordPunkt: [1, 1, 1, 1, 2], genKoordSpiegel: [1, 1, 1, 2, 2], genParallelogramm: [1, 1, 1, 1, 2], genGeradeGleich: [1, 1, 1, 1, 1], genKollinear: [1, 1, 1, 1, 1] };
for (const [name, z] of Object.entries(FORMEN)) z.forEach((anz, i) => ok(gesehen[`${name}/${i + 1}`].size === anz, `${name} Stufe ${i + 1}: ${anz} Form(en) kommen vor (${[...gesehen[`${name}/${i + 1}`]].join()})`));
if (fehler) { console.error(`hart/gen11: ${fehler} Fehler bei ${n} Prüfungen`); process.exit(1); }
console.log(`hart/gen11: ${n} Prüfungen bestanden`);
