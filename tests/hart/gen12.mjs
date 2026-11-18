// Paket gen12 (Integral anwenden: Mittelwert, Bestand aus der Änderungsrate, größter und kleinster Bestand):
// jede Aufgabe unabhängig nachrechnen – nur aus dem, was der Lernende sieht (Aufgabentext und Formel).
// Funktionsterme werden mit einem eigenen kleinen Rechner gelesen, Integrale numerisch (Simpson) berechnet,
// Extremstellen über Nullstellen der Rate und Vergleich aller Kandidaten gesucht – nie mit den Formeln des Erzeugers.
globalThis.window = { katex: { renderToString: (s) => s } };
const { GENS12 } = await import('../../app/js/gen12.js');
const { seedRandom } = await import('../../app/js/math.js');
let n = 0, fehler = 0; const ok = (c, m) => { n++; if (!c) { fehler++; if (fehler < 25) console.error('FEHLER:', m); } };

/* ───── kleiner Rechner: TeX-Term → Funktion einer Variablen ───── */
function klammer(s, i) { let t = 0; for (let j = i; j < s.length; j++) { if (s[j] === '{') t++; else if (s[j] === '}' && --t === 0) return [s.slice(i + 1, j), j + 1]; } throw new Error('Klammer'); }
function roh(src) {
  let s = String(src).replace(/\\left|\\right|\\displaystyle|\\,|\\;|\\!/g, ' ').replace(/\{,\}/g, '.').replace(/\\cdot/g, '*').replace(/\\pi/g, ' π ').replace(/\\(sin|cos)/g, ' $1');
  let out = '', i = 0;
  while (i < s.length) {
    const fm = s.slice(i).match(/^\\[dt]?frac/);
    if (fm) { let a, b, j = i + fm[0].length; if (s[j] === '{') [a, j] = klammer(s, j); else { a = s[j]; j++; } if (s[j] === '{') [b, j] = klammer(s, j); else { b = s[j]; j++; } out += `((${roh(a)})/(${roh(b)}))`; i = j; continue; }
    if (s.startsWith('\\sqrt', i)) { const [a, j] = klammer(s, i + 5); out += `√(${roh(a)})`; i = j; continue; }
    if (s[i] === '{') { const [a, j] = klammer(s, i); out += `(${roh(a)})`; i = j; continue; }
    out += s[i]; i++;
  }
  return out;
}
function term(src, v) {
  const s = roh(src); let i = 0;
  const ws = () => { while (s[i] === ' ') i++; };
  const summe = () => { let a = produkt(); for (;;) { ws(); const c = s[i]; if (c === '+' || c === '-') { i++; const b = produkt(), a0 = a; a = c === '+' ? (x) => a0(x) + b(x) : (x) => a0(x) - b(x); } else return a; } };
  const produkt = () => { let a = vorz(); for (;;) { ws(); const c = s[i];
    if (c === '*' || c === '/') { i++; const b = vorz(), a0 = a; a = c === '*' ? (x) => a0(x) * b(x) : (x) => a0(x) / b(x); continue; }
    if (c === '(' || /[0-9.]/.test(c ?? '') || c === v || c === 'e' || c === 'π' || c === '√' || s.startsWith('sin', i) || s.startsWith('cos', i)) { const b = potenz(), a0 = a; a = (x) => a0(x) * b(x); continue; }
    return a; } };
  const vorz = () => { ws(); if (s[i] === '-') { i++; const a = vorz(); return (x) => -a(x); } return potenz(); };
  const potenz = () => { const a = atom(); ws(); if (s[i] === '^') { i++; ws(); const b = s[i] === '-' ? (i++, ((p) => (x) => -p(x))(atom())) : atom(); return (x) => a(x) ** b(x); } return a; };
  const atom = () => { ws();
    if (s[i] === '(') { i++; const a = summe(); ws(); if (s[i] !== ')') throw new Error(`) fehlt in ${s}`); i++; return a; }
    const z = s.slice(i).match(/^\d+(\.\d+)?/); if (z) { i += z[0].length; const w = +z[0]; return () => w; }
    if (s.startsWith('sin', i) || s.startsWith('cos', i)) { const f = s.startsWith('sin', i) ? Math.sin : Math.cos; i += 3; const a = atom(); return (x) => f(a(x)); }
    if (s[i] === '√') { i++; const a = atom(); return (x) => Math.sqrt(a(x)); }
    if (s[i] === 'π') { i++; return () => Math.PI; } if (s[i] === 'e') { i++; return () => Math.E; } if (s[i] === v) { i++; return (x) => x; }
    throw new Error(`unlesbar: „${s.slice(i, i + 10)}“ in ${s}`); };
  const f = summe(); ws(); if (i < s.length) throw new Error(`Rest „${s.slice(i)}“ in ${s}`); return f;
}
const zahl = (src) => term(src, '§')(0);
const simpson = (f, a, b, m = 4000) => { let s = f(a) + f(b); for (let k = 1; k < m; k++) s += f(a + ((b - a) * k) / m) * (k % 2 ? 4 : 2); return (s * (b - a)) / (3 * m); };
const nah = (a, b, tol = 1e-7) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
const gerundet = (a, b) => Math.round(a * 100) === Math.round(b * 100) && Math.abs(a - b) < 0.0051;
/** Wert einer Antwort: alles nach „=“ bzw. „≈“ bis zur Einheit. */
const wert = (t) => { const m = /(=|\\approx)\s*(.*?)(\\,\\text|\\text|$)/.exec(t); return { ca: m[1] === '\\approx', v: zahl(m[2]) }; };
const passt = (o, soll) => { const w = wert(o); return w.ca ? gerundet(soll, w.v) : nah(w.v, soll); };
/** Formel „f(x)=…“ / „r(t)=…“ lesen. */
const fkt = (F, v) => term(F.replace(/^\s*[a-zA-Z]\(\w\)\s*=/, ''), v);
const zeiten = (P) => [...String(P).matchAll(/(?<![a-zA-Z])t=(\d+)/g)].map((m) => +m[1]);
const B0 = (P) => +/B\(0\)=(\d+)/.exec(P)[1];
const ende = (P) => +/0\\le t\\le (\d+)/.exec(P)[1];
const intervall = (P) => { const m = /\[([^;\]]+);\\,([^\]]+)\]/.exec(P); return [zahl(m[1]), zahl(m[2])]; };
/** Bestand B(t)−B(0) als Funktion, Kandidaten für Extremstellen: Ränder und Vorzeichenwechsel der Rate. */
const extrem = (r, T, max) => { const kand = [0, T]; let a = 0, fa = r(0);
  for (let k = 1; k <= 20000; k++) { const b = (T * k) / 20000, fb = r(b); if (fa * fb < 0 || (fb === 0 && k < 20000)) { let lo = a, hi = b; for (let j = 0; j < 80; j++) { const mm = (lo + hi) / 2; if ((r(mm) < 0) === (r(lo) < 0)) lo = mm; else hi = mm; } kand.push((lo + hi) / 2); } a = b; fa = fb; }
  const werte = kand.map((t) => ({ t, B: simpson(r, 0, t) })).sort((x, y) => (max ? y.B - x.B : x.B - y.B));
  return { ...werte[0], abstand: Math.abs(werte[0].B - werte[1].B) }; };

const PRUEF = {
  mittel: (q, o) => { const f = fkt(q.formula, 'x'), [a, b] = intervall(q.prompt); return passt(o.tex, simpson(f, a, b) / (b - a)); },
  mittelb: (q, o) => { const f = fkt(q.formula, 'x'), m = +/m=(\d+)/.exec(q.prompt)[1], b = wert(o.tex).v; return b > 0 && nah(simpson(f, 0, b) / b, m, 1e-9); },
  aenderung: (q, o) => { const r = fkt(q.formula, 't'), [t1, t2] = zeiten(q.prompt); return passt(o.tex, simpson(r, t1, t2)); },
  bestandT: (q, o) => { const r = fkt(q.formula, 't'), T = zeiten(q.prompt).at(-1); return passt(o.tex, B0(q.prompt) + simpson(r, 0, T)); },
  bestandE: (q, o) => PRUEF.bestandT(q, o),
  bestandT1: (q, o) => { const r = fkt(q.formula, 't'), [t1, t2] = zeiten(q.prompt), B1 = +new RegExp(`B\\(${t1}\\)=(\\d+)`).exec(q.prompt)[1]; return passt(o.tex, B1 + simpson(r, t1, t2)); },
  bestandsfkt: (q, o) => { const r = fkt(q.formula, 't'), B = term(o.tex.replace(/^B\(t\)=/, ''), 't'); return [0, 0.7, 1.9, 3.4, 5.2].every((t) => nah(B(t), B0(q.prompt) + simpson(r, 0, t))); },
  zurueck: (q, o) => { const r = fkt(q.formula, 't'), t = wert(o.tex).v; return t > 0.01 && Math.abs(simpson(r, 0, t)) < 1e-7 * Math.max(1, simpson((x) => Math.abs(r(x)), 0, t)); },
  maxzeit: (q, o) => { const E = extrem(fkt(q.formula, 't'), ende(q.prompt), true); return E.abstand > 1e-6 && nah(wert(o.tex).v, E.t, 1e-9); },
  minzeit: (q, o) => { const E = extrem(fkt(q.formula, 't'), ende(q.prompt), false); return E.abstand > 1e-6 && nah(wert(o.tex).v, E.t, 1e-9); },
  maxwert: (q, o) => { const E = extrem(fkt(q.formula, 't'), ende(q.prompt), true); return E.abstand > 1e-6 && passt(o.tex, B0(q.prompt) + E.B); },
  minwert: (q, o) => { const E = extrem(fkt(q.formula, 't'), ende(q.prompt), false); return E.abstand > 1e-6 && passt(o.tex, B0(q.prompt) + E.B); },
  randmax: (q, o) => { const E = extrem(fkt(q.formula, 't'), ende(q.prompt), q.kind === 'randmax'), [zt, bt] = o.tex.split('\\text{ mit }'); return E.abstand > 1e-6 && nah(wert(zt).v, E.t, 1e-9) && passt(bt, B0(q.prompt) + E.B); },
};
PRUEF.randmin = PRUEF.randmax;

const gesehen = {};
for (const [name, fn] of Object.entries(GENS12)) for (let lv = 1; lv <= 5; lv++) for (let i = 0; i < 400; i++) {
  seedRandom(1000 * lv + i + (name.length << 16)); const q = fn(lv), tag = `${name} Stufe ${lv} (${q.kind})`;
  (gesehen[`${name}/${lv}`] ||= new Set()).add(q.kind);
  const alles = `${q.prompt}${q.formula ?? ''}${q.options.map((o) => o.tex + (o.why || '')).join()}${q.hints.join()}${q.explain}`;
  ok(q.options.length === 4 && q.options.filter((o) => o.correct).length === 1 && new Set(q.options.map((o) => o.tex)).size === 4, `${tag}: vier verschiedene Antworten, genau eine richtig`);
  ok(q.hints.length >= 4 && q.hints.length <= 6 && q.explain && q.options.every((o) => o.correct || (o.why && o.why.length > 30)), `${tag}: Tipps (alle Schritte), Erklärung, Begründungen`);
  ok(!/undefined|NaN|Infinity|\[object/.test(alles), `${tag}: vollständig (${q.prompt})`);
  ok(!/\d\.\d/.test(alles.replace(/<[^>]+>/g, '')), `${tag}: Dezimalkomma`);
  ok(!/--|\+-|-\+|\+\+/.test(`${q.formula ?? ''}${q.options.map((o) => o.tex).join()}${q.hints.join()}${q.explain}`.replace(/\\\\/g, '')), `${tag}: keine doppelten Vorzeichen (${q.hints.join(' | ').slice(0, 200)})`);
  // Der Lösungsweg nennt das Ergebnis mit den Zahlen der Aufgabe.
  const r = q.options.find((o) => o.correct).tex, kern = r.split('\\text{ mit }').map((x) => /(=|\\approx)\s*(.*?)(\\,\\text|$)/.exec(x)[2]);
  ok(kern.every((k) => q.explain.includes(k) && q.hints.join(' ').includes(k)), `${tag}: Erklärung und Tipps enthalten das Ergebnis ${kern.join(' / ')}`);
  const pr = PRUEF[q.kind]; ok(!!pr, `${tag}: Prüfung vorhanden`); if (!pr) continue;
  for (const o of q.options) { let w; try { w = pr(q, o); } catch (e) { w = `Fehler ${e.message}`; } ok(w === !!o.correct, `${tag}: Antwort ${o.tex} ist ${o.correct ? 'richtig' : 'falsch'} markiert, nachgerechnet: ${w} · ${q.prompt.slice(-160)} · ${q.formula ?? ''}`); }
}
seedRandom(null);
const FORMEN = { genMittelwertFkt: [1, 1, 1, 2, 1], genBestand: [1, 1, 2, 2, 2], genBestandExtrem: [1, 1, 1, 2, 2] };
for (const [name, z] of Object.entries(FORMEN)) z.forEach((anz, i) => ok(gesehen[`${name}/${i + 1}`].size === anz, `${name} Stufe ${i + 1}: ${anz} Form(en) kommen vor (${[...gesehen[`${name}/${i + 1}`]].join()})`));
if (fehler) { console.error(`hart/gen12: ${fehler} Fehler bei ${n} Prüfungen`); process.exit(1); }
console.log(`hart/gen12: ${n} Prüfungen bestanden (${Object.keys(GENS12).length * 5 * 400} Aufgaben)`);
