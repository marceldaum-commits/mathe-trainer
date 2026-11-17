globalThis.window = { katex: { renderToString: (s) => s } };
// Harte Prüfung für das Paket gen3 (app/js/gen3.js): je Aufgaben-Art und Stufe 200 Aufgaben.
// Die richtige Antwort wird UNABHÄNGIG vom Erzeuger nachgerechnet – aus dem, was der Lernende sieht (Aufgabentext, Formel, Antwort-Formeln):
// Formeln werden mit einem eigenen kleinen TeX-Rechner ausgewertet, Gleichungen durch Einsetzen und Durchprobieren geprüft,
// Wahrscheinlichkeiten abgezählt, Körper in Scheiben zerlegt (numerische Integration), Mittelpunkte über gleiche Abstände geprüft.
// Aufruf: node tests/hart/gen3.mjs
window.katex.renderToString = (s) => `⟦${s}⟧`;   // Formeln im Fließtext bleiben als Quelltext erkennbar
const K = await import('../../app/js/gen3.js');
const { seedRandom } = await import('../../app/js/math.js');

let n = 0, fehler = 0; const gesehen = new Set();
const ok = (bed, text) => { n++; if (!bed && !gesehen.has(text)) { gesehen.add(text); fehler++; if (fehler <= 60) console.error('FEHLER:', text); } };
const nah = (a, b, tol = 1e-6) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tol * (1 + Math.abs(a) + Math.abs(b));
const REP = 200, LV = [1, 2, 3, 4, 5];

/* ───────────── eigener TeX-Rechner (Zahlen, x/t, Brüche, Wurzeln, Potenzen, sin/cos/tan in Grad) ───────────── */
function rechne(src, vars = {}) {
  const s = String(src).replace(/\{,\}/g, '.').replace(/\\(left|right)/g, '').replace(/\\[,;! ]/g, '').replace(/\^\\circ/g, '').replace(/\\[dt]frac/g, '\\frac').replace(/\\cdot/g, '*').replace(/\s+/g, '');
  let i = 0;
  const eat = (c) => { if (s[i] !== c) throw new Error(`TeX-Rechner: „${c}“ erwartet an Stelle ${i} in ${s}`); i++; };
  const beginnt = () => i < s.length && /[0-9a-zA-Z({\\]/.test(s[i]);
  const summe = () => { let v = produkt(); while (s[i] === '+' || s[i] === '-') { const op = s[i++], t = produkt(); v = op === '+' ? v + t : v - t; } return v; };
  const produkt = () => { let v = vorzeichen(); for (;;) { if (s[i] === '*') { i++; v *= vorzeichen(); } else if (s[i] === ':') { i++; v /= vorzeichen(); } else if (beginnt()) v *= potenz(); else break; } return v; };
  const vorzeichen = () => { if (s[i] === '-') { i++; return -vorzeichen(); } if (s[i] === '+') { i++; return vorzeichen(); } return potenz(); };
  const potenz = () => { const b = basis(); if (s[i] !== '^') return b; i++; let e; if (s[i] === '{') { i++; e = summe(); eat('}'); } else e = +s[i++]; return b ** e; };
  const basis = () => {
    if (s[i] === '(') { i++; const v = summe(); eat(')'); return v; }
    if (s[i] === '{') { i++; const v = summe(); eat('}'); return v; }
    if (s.startsWith('\\frac', i)) { i += 5; eat('{'); const a = summe(); eat('}'); eat('{'); const b = summe(); eat('}'); return a / b; }
    if (s.startsWith('\\sqrt', i)) { i += 5; let w = 2; if (s[i] === '[') { i++; w = summe(); eat(']'); } eat('{'); const a = summe(); eat('}'); return a ** (1 / w); }
    for (const fn of ['sin', 'cos', 'tan']) if (s.startsWith(`\\${fn}`, i)) { i += fn.length + 1; eat('('); const a = summe(); eat(')'); return Math[fn]((a * Math.PI) / 180); }
    if (s.startsWith('\\pi', i)) { i += 3; return Math.PI; }
    const m = /^\d+(\.\d+)?/.exec(s.slice(i)); if (m) { i += m[0].length; return +m[0]; }
    if (s[i] in vars) return vars[s[i++]];
    throw new Error(`TeX-Rechner: unerwartetes Zeichen „${s[i]}“ an Stelle ${i} in ${s}`);
  };
  const v = summe(); if (i !== s.length) throw new Error(`TeX-Rechner: Rest „${s.slice(i)}“ in ${s}`); return v;
}
const zahl = (t) => +String(t).replace(/\{,\}/g, ',').replace(',', '.');
/** Alle Zahlen eines Textes (deutsches Komma), in Lesereihenfolge. */
const zahlen = (t) => (String(t).replace(/<[^>]+>/g, ' ').replace(/\{,\}/g, ',').match(/\d+(?:,\d+)?/g) || []).map((z) => +z.replace(',', '.'));
/** Formeln im Fließtext (zwischen den Marken). */
const formeln = (t) => [...String(t).matchAll(/⟦([^⟧]*)⟧/g)].map((m) => m[1]);
/** Zahl in einer Antwort wie „\approx 12{,}3\,\%“ oder „x=-1{,}5“. */
const antwortZahl = (t) => rechne(String(t).replace(/\\approx ?/, '').replace(/\\,\\%/, '').replace(/^x=/, ''));
const ggT = (a, b) => (b ? ggT(b, a % b) : Math.abs(a));

/** Grundprüfungen, die für jede Aufgabe gelten. Liefert die richtige Antwort und die Ablenker. */
function grund(name, lv, q) {
  const tag = `${name} (Stufe ${lv}, ${q.art})`, r = q.options.filter((o) => o.correct), f = q.options.filter((o) => !o.correct);
  ok(r.length === 1 && q.options.length === 4, `${tag}: genau eine richtige von vier Antworten`);
  ok(new Set(q.options.map((o) => o.tex)).size === q.options.length, `${tag}: Antworten verschieden (${q.options.map((o) => o.tex).join(' | ')})`);
  ok(f.every((o) => typeof o.why === 'string' && o.why.length > 10), `${tag}: jeder Ablenker hat eine Diagnose`);
  ok(Array.isArray(q.hints) && q.hints.length >= 2 && q.hints.every((h) => typeof h === 'string' && h.length > 5), `${tag}: Tipps vorhanden`);
  ok(typeof q.explain === 'string' && q.explain.length > 5 && typeof q.prompt === 'string' && q.prompt.length > 5, `${tag}: Frage und Erklärung vorhanden`);
  ok(!/undefined|NaN|Infinity|\[object/.test(JSON.stringify([q.prompt, q.formula, q.explain, q.hints, q.options.map((o) => [o.tex, o.why])])), `${tag}: kein „undefined“/„NaN“ im Text`);
  ok(typeof q.art === 'string' && q.art.length > 0, `${tag}: Aufgaben-Form benannt`);
  return [r[0], f, tag];
}
/** Zahlen-Antworten: richtige stimmt mit dem nachgerechneten Wert, angezeigte Zahl passt zum gespeicherten Wert, Ablenker sind falsch. */
function zahlPruefung(tag, r, f, soll, { tol = 1e-6, anzeige = null, abstand = 1e-3 } = {}) {
  ok(nah(r.num, soll, tol), `${tag}: Ergebnis stimmt (erwartet ${soll}, gespeichert ${r.num}, gezeigt ${r.tex})`);
  if (anzeige !== null) { let gezeigt = NaN; try { gezeigt = antwortZahl(r.tex); } catch { /* bleibt NaN */ } ok(Math.abs(gezeigt - soll) <= anzeige, `${tag}: gezeigte Zahl passt (${r.tex} zu ${soll})`); }
  for (const o of f) ok(Number.isFinite(o.num) && Math.abs(o.num - soll) > abstand * (1 + Math.abs(soll)), `${tag}: Ablenker ist wirklich falsch (${o.tex} gegen ${soll})`);
}
const laufe = (name, pruefe) => { const arten = new Set(); for (const lv of LV) { seedRandom(4200 + lv * 17 + name.length); for (let i = 0; i < REP; i++) { const q = K[name](lv), [r, f, tag] = grund(name, lv, q); arten.add(`${lv}:${q.art}`);
  try { pruefe(q, r, f, tag, lv); } catch (e) { ok(false, `${tag}: Prüfung bricht ab – ${e.message} (${q.prompt} ${q.formula ?? ''})`); } } } seedRandom(null); return arten; };

/* ───────────── genBruch: Formel und Antworten mit dem TeX-Rechner auswerten ───────────── */
const ARTEN = {};
ARTEN.genBruch = laufe('genBruch', (q, r, f, tag, lv) => {
  const soll = rechne(q.formula);
  zahlPruefung(tag, r, f, soll, { abstand: 0.01 });
  ok(nah(rechne(r.tex), soll), `${tag}: gezeigter Bruch stimmt (${q.formula} = ${r.tex})`);
  for (const o of q.options) { ok(nah(rechne(o.tex), o.num), `${tag}: Antwort-Formel und Wert gehören zusammen (${o.tex})`); const m = /\\dfrac\{(\d+)\}\{(\d+)\}/.exec(o.tex); if (m) ok(ggT(+m[1], +m[2]) === 1 && +m[2] > 1, `${tag}: Antwort ist gekürzt (${o.tex})`); }
  if (lv === 1) ok(q.b === q.d && q.op === '+' && soll < 1, `${tag}: Stufe 1 ist gleichnamig und bleibt unter 1`);
  if (lv === 3) ok(q.b % q.d !== 0 && q.d % q.b !== 0, `${tag}: Stufe 3 ist ungleichnamig`);
});

/* ───────────── genKlammer, genPotenz: Term und Antworten an mehreren Stellen vergleichen ───────────── */
const termPruefung = (xs) => (q, r, f, tag) => {
  const wert = (t, x) => rechne(t, { x });
  ok(xs.every((x) => nah(wert(q.formula, x), wert(r.tex, x), 1e-9)), `${tag}: Umformung stimmt (${q.formula} = ${r.tex})`);
  ok(xs.every((x) => nah(q.f(x), wert(q.formula, x), 1e-9)), `${tag}: Rechen-Feld f passt zur Formel (${q.formula})`);
  for (const o of f) ok(xs.some((x) => !nah(wert(q.formula, x), wert(o.tex, x), 1e-7)), `${tag}: Ablenker ist wirklich falsch (${q.formula} → ${o.tex})`);
  ok(!/x\^\{1\}(?![0-9])|\)\^\{1\}/.test([q.formula, q.explain, ...q.hints, ...q.options.map((o) => o.tex)].join(' ')), `${tag}: kein „hoch 1“`);
};
ARTEN.genKlammer = laufe('genKlammer', termPruefung([-2.3, -0.7, 0.4, 1.1, 2.9]));
ARTEN.genPotenz = laufe('genPotenz', termPruefung([0.6, 1.3, 2.2, 3.7]));

/* ───────────── genLinGl: Lösung einsetzen; die Gleichung hat genau eine Lösung ───────────── */
ARTEN.genLinGl = laufe('genLinGl', (q, r, f, tag) => {
  const [li, re] = q.formula.split('='), d = (x) => rechne(li, { x }) - rechne(re, { x });
  const x0 = antwortZahl(r.tex), steig = d(1) - d(0), loesung = -d(0) / steig;   // lineare Gleichung: aus zwei Stellen eindeutig bestimmt
  ok(Math.abs(steig) > 1e-9 && nah(d(2) - d(1), steig, 1e-9), `${tag}: Gleichung ist linear und eindeutig lösbar (${q.formula})`);
  ok(nah(x0, loesung, 1e-9) && Math.abs(d(x0)) < 1e-9, `${tag}: Lösung erfüllt die Gleichung (${q.formula}, ${r.tex})`);
  ok(nah(r.num, loesung, 1e-9), `${tag}: gespeicherter Wert stimmt`);
  for (const o of f) ok(Math.abs(d(antwortZahl(o.tex))) > 1e-6 && Math.abs(d(o.num)) > 1e-6, `${tag}: Ablenker löst die Gleichung nicht (${q.formula}, ${o.tex})`);
  ok(!/(^|[^0-9,{.a-z_])1x(?![0-9_])/.test([q.formula, q.explain, ...q.hints, ...q.options.map((o) => o.tex)].join(' ¦ ')), `${tag}: kein „1x“`);
});

/* ───────────── genQuadGl: alle Lösungen durch Durchprobieren suchen ───────────── */
ARTEN.genQuadGl = laufe('genQuadGl', (q, r, f, tag) => {
  const [li, re] = q.formula.split('='), d = (x) => rechne(li, { x }) - rechne(re, { x }), gefunden = [];
  for (let x = -60; x <= 60; x += 0.25) if (Math.abs(d(x)) < 1e-9) gefunden.push(x);
  const paar = (t) => { const m = /^x_1=(.+),\\quad x_2=(.+)$/.exec(t); return [zahl(m[1]), zahl(m[2])]; };
  const xs = paar(r.tex);
  ok(gefunden.length === 2 && nah(gefunden[0], xs[0]) && nah(gefunden[1], xs[1]), `${tag}: genau die beiden gezeigten Lösungen (${q.formula}: gefunden ${gefunden}, gezeigt ${r.tex})`);
  ok(r.xs.length === 2 && nah(r.xs[0], xs[0]) && nah(r.xs[1], xs[1]) && xs[0] < xs[1], `${tag}: gespeicherte Lösungen passen zur Anzeige`);
  for (const o of f) { const ys = paar(o.tex); ok(ys.some((y) => Math.abs(d(y)) > 1e-6) && ys[0] !== ys[1], `${tag}: Ablenker enthält eine falsche Lösung (${q.formula}, ${o.tex})`); }
});

/* ───────────── genSteigung: Punkte aus der Formel lesen, Gerade muss durch beide gehen ───────────── */
const punkte = (formel) => Object.fromEntries([...String(formel).matchAll(/([A-Z])\(([^()]*)\)/g)].map((m) => [m[1], m[2].split('\\mid')]));
ARTEN.genSteigung = laufe('genSteigung', (q, r, f, tag) => {
  const p = punkte(q.formula), P = p.P.map(zahl), Q = p.Q.map(zahl), m = (Q[1] - P[1]) / (Q[0] - P[0]);
  if (q.kind === 'm') { zahlPruefung(tag, r, f, m, { anzeige: 1e-9 }); return; }
  const g = (o) => (x) => rechne(o.tex.replace(/^y=/, ''), { x });
  ok(nah(g(r)(P[0]), P[1], 1e-9) && nah(g(r)(Q[0]), Q[1], 1e-9), `${tag}: Gerade geht durch beide Punkte (${q.formula}, ${r.tex})`);
  ok(nah(g(r)(1) - g(r)(0), m, 1e-9), `${tag}: Steigung der Geraden stimmt`);
  for (const o of f) ok(!nah(g(o)(P[0]), P[1], 1e-7) || !nah(g(o)(Q[0]), Q[1], 1e-7), `${tag}: Ablenker geht nicht durch beide Punkte (${o.tex})`);
});

/* ───────────── genHaeufigkeit: aus Text und Tabelle neu auszählen ───────────── */
const SPALTEN = { 'die Note 2 oder besser': (v) => v <= 2, 'eine Note schlechter als 4': (v) => v > 4, 'die Note 3 oder 4': (v) => v === 3 || v === 4, 'mindestens die Note 3 (also 1, 2 oder 3)': (v) => v <= 3,
  'mindestens 3 Tore': (v) => v >= 3, 'höchstens 1 Tor': (v) => v <= 1, 'genau 2 oder 3 Tore': (v) => v === 2 || v === 3, 'mehr als 3 Tore': (v) => v > 3,
  'mindestens 2 Geschwister': (v) => v >= 2, 'höchstens 1 Geschwisterkind': (v) => v <= 1, 'mehr als 2 Geschwister': (v) => v > 2,
  'eine gerade Augenzahl': (v) => v % 2 === 0, 'eine Augenzahl von mindestens 5': (v) => v >= 5, 'eine Augenzahl von höchstens 2': (v) => v <= 2, 'eine ungerade Augenzahl': (v) => v % 2 === 1 };
const tabelleLesen = (formel) => { const m = /\\text\{[^}]*\}&(.*?)\\\\\\hline\\text\{[^}]*\}&(.*?)\\end/.exec(formel); return [m[1].split('&').map(Number), m[2].split('&')]; };
ARTEN.genHaeufigkeit = laufe('genHaeufigkeit', (q, r, f, tag) => {
  const z = zahlen(q.prompt), was = (/„([^“]*)“/.exec(q.prompt) || [])[1]; let soll;
  if (q.art === 'erweitern' || q.art === 'teilen') soll = (z[1] / z[0]) * 100;
  else if (q.art === 'kategorien') { const teil = q.prompt.split(':')[1].split('.')[0].split(',').map((t) => t.trim()), i = teil.findIndex((t) => t.endsWith(was)); soll = (z[i] / (z[0] + z[1] + z[2])) * 100; ok(i >= 0, `${tag}: gefragte Gruppe steht im Text`); }
  else if (q.art === 'tabelle') { const [kopf, werte] = tabelleLesen(q.formula), anz = werte.map(Number), ges = anz.reduce((s, x) => s + x, 0); soll = (anz.filter((_, i) => SPALTEN[was](kopf[i])).reduce((s, x) => s + x, 0) / ges) * 100; }
  else if (q.art === 'chargen') { const [n1, p1, n2, k2] = z; soll = (((n1 * p1) / 100 + k2) / (n1 + n2)) * 100; ok(Number.isInteger(Math.round(n1 * p1) / 100), `${tag}: Anzahl am Montag ist ganzzahlig`); }
  else if (q.art === 'rest') { const [ges, pA, kB, pC] = z; soll = 100 - pA - pC - (kB / ges) * 100; }
  else { const ges = z[0], [kopf, werte] = tabelleLesen(q.formula), bekannt = werte.filter((w) => w !== 'x').map(Number), x = ges - bekannt.reduce((s, v) => s + v, 0), anz = werte.map((w) => (w === 'x' ? x : +w));
    ok(werte.filter((w) => w === 'x').length === 1 && x > 0, `${tag}: genau ein Eintrag fehlt`); soll = (anz.filter((_, i) => SPALTEN[was](kopf[i])).reduce((s, v) => s + v, 0) / ges) * 100; }
  zahlPruefung(tag, r, f, soll, { anzeige: 0.0501, abstand: 0.004 });
  ok(nah(soll, (q.k / q.n) * 100, 1e-9), `${tag}: Rechen-Felder n und k passen zum Text`);
  ok(soll > 0 && soll < 100, `${tag}: Häufigkeit liegt zwischen 0 und 100 %`);
});

/* ───────────── genProzent: aus dem Aufgabentext neu rechnen ───────────── */
ARTEN.genProzent = laufe('genProzent', (q, r, f, tag) => {
  const z = zahlen(q.prompt); let soll;
  if (/^Wie viel sind/.test(q.prompt)) soll = (z[1] * z[0]) / 100;                       // p % von G
  else if (/^Wie viel Prozent/.test(q.prompt)) soll = (z[0] / z[1]) * 100;                // W von G
  else if (/eines Betrags/.test(q.prompt)) soll = (z[0] / z[1]) * 100;                    // W sind p %
  else soll = z[0] * (1 + (/erhöht/.test(q.prompt) ? 1 : -1) * z[1] / 100);               // G um p % erhöht oder gesenkt
  zahlPruefung(tag, r, f, soll, { anzeige: 0.00501, abstand: 0.004 });
});

/* ───────────── genKennwerte: Daten aus der Formel lesen, selbst auswerten ───────────── */
ARTEN.genKennwerte = laufe('genKennwerte', (q, r, f, tag, lv) => {
  const d = q.formula.replace(/\\begin\{array\}\{l\}|\\end\{array\}|\\\\\[6pt\]/g, '').split(';').map((t) => t.replace(/\\ /g, '').trim()).filter(Boolean).map(zahl), s = [...d].sort((a, b) => a - b), m = s.length;
  const soll = /Mittel/.test(q.prompt) ? d.reduce((t, x) => t + x, 0) / m : /Spannweite/.test(q.prompt) ? s[m - 1] - s[0] : m % 2 ? s[(m - 1) / 2] : (s[m / 2 - 1] + s[m / 2]) / 2;
  zahlPruefung(tag, r, f, soll, { tol: 1e-9, anzeige: 1e-9, abstand: 0.004 });
  ok(d.length === q.data.length && [...q.data].sort((a, b) => a - b).every((x, i) => nah(x, s[i], 1e-12)), `${tag}: gezeigte Daten sind die gespeicherten`);
  if (lv <= 2) ok(d.every((x, i) => i === 0 || d[i - 1] <= x), `${tag}: auf Stufe 1 und 2 sind die Daten geordnet`);
});

/* ───────────── genLaplace: günstige Ergebnisse abzählen ───────────── */
const WUERFEL1 = { 'eine Zahl größer als 4': (a) => a > 4, 'ein Vielfaches von 3': (a) => a % 3 === 0, 'eine Zahl kleiner als 3': (a) => a < 3, 'eine Zahl von mindestens 3': (a) => a >= 3, 'eine Zahl kleiner als 5': (a) => a < 5, 'keine 1 und keine 6': (a) => a !== 1 && a !== 6 };
const istPrim = (k) => { if (k < 2) return false; for (let t = 2; t * t <= k; t++) if (k % t === 0) return false; return true; };
const WUERFEL2 = { 'einen Pasch (zwei gleiche Zahlen)': (a, b) => a === b, 'eine Augensumme von mindestens 10': (a, b) => a + b >= 10, 'eine Augensumme von höchstens 4': (a, b) => a + b <= 4, 'zwei ungerade Zahlen': (a, b) => (a * b) % 2 === 1,
  'mindestens eine Sechs': (a, b) => Math.max(a, b) === 6, 'eine Augensumme größer als 8': (a, b) => a + b >= 9, 'zwei verschiedene Zahlen': (a, b) => a !== b, 'eine Augensumme, die eine Primzahl ist': (a, b) => istPrim(a + b),
  'zwei Zahlen, die sich um genau 2 unterscheiden': (a, b) => a - b === 2 || b - a === 2, 'ein Produkt der Augenzahlen, das durch 6 teilbar ist': (a, b) => (a * b) % 2 === 0 && (a * b) % 3 === 0, 'ein Produkt der Augenzahlen, das größer als 12 ist': (a, b) => a * b >= 13,
  'höchstens eine gerade Zahl': (a, b) => !(a % 2 === 0 && b % 2 === 0), 'eine Augensumme, die durch 4 teilbar ist': (a, b) => [4, 8, 12].includes(a + b), 'eine zweite Zahl, die größer ist als die erste': (a, b) => a < b };
const KARTEN = []; for (const farbe of ['Kreuz', 'Pik', 'Herz', 'Karo']) for (const wert of ['7', '8', '9', '10', 'Bube', 'Dame', 'König', 'Ass']) KARTEN.push({ farbe, wert, rot: farbe === 'Herz' || farbe === 'Karo', bild: ['Bube', 'Dame', 'König'].includes(wert), zahl: ['7', '8', '9', '10'].includes(wert) });
const SKAT = { 'ein Ass': (k) => k.wert === 'Ass', 'eine Herz-Karte': (k) => k.farbe === 'Herz', 'eine Bildkarte (Bube, Dame, König)': (k) => k.bild, 'ein Ass oder einen König': (k) => k.wert === 'Ass' || k.wert === 'König', 'eine Herz-Karte oder ein Ass': (k) => k.farbe === 'Herz' || k.wert === 'Ass',
  'keine Bildkarte (Bube, Dame, König)': (k) => !k.bild, 'eine rote Bildkarte (Bube, Dame, König)': (k) => k.rot && k.bild, 'eine Karte, die kein Ass ist': (k) => k.wert !== 'Ass', 'eine schwarze Karte oder eine Dame': (k) => !k.rot || k.wert === 'Dame',
  'eine Karte, die weder Herz noch Bildkarte ist': (k) => !(k.farbe === 'Herz' || k.bild), 'eine rote Zahlenkarte (7, 8, 9 oder 10)': (k) => k.rot && k.zahl, 'ein Ass, einen König oder eine Kreuz-Karte': (k) => ['Ass', 'König'].includes(k.wert) || k.farbe === 'Kreuz' };
ARTEN.genLaplace = laufe('genLaplace', (q, r, f, tag) => {
  const z = zahlen(q.prompt), was = /zweite Augenzahl größer ist als die erste/.test(q.prompt) ? 'eine zweite Zahl, die größer ist als die erste' : (/Wahrscheinlichkeit für (.*)\?$/.exec(q.prompt.replace(/<[^>]+>/g, '')) || [])[1]; let g, m;
  if (q.art === 'wuerfel') { m = 6; g = [1, 2, 3, 4, 5, 6].filter(WUERFEL1[was]).length; }
  else if (q.art === 'rad') { [m, g] = z; }
  else if (q.art === 'urne') { m = z[0] + z[1] + z[2]; g = z[0]; }
  else if (q.art === 'urneoder') { m = z[0] + z[1] + z[2] + z[3]; g = /nicht weiß/.test(was) ? z[0] + z[1] + z[3] : z[0] + z[1]; }
  else if (q.art === 'summe' || q.art === 'zwei') { m = 0; g = 0; for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) { m++; if (q.art === 'summe' ? a + b === z[0] : WUERFEL2[was](a, b)) g++; } }
  else { m = KARTEN.length; g = KARTEN.filter(SKAT[was]).length; }
  zahlPruefung(tag, r, f, g / m, { abstand: 0.005 });
  ok(r.tex === `\\dfrac{${g}}{${m}}`, `${tag}: gezeigter Bruch ist günstige durch mögliche (${r.tex}, gezählt ${g}/${m})`);
  ok(q.g === g && q.m === m && g > 0 && g < m, `${tag}: Rechen-Felder g und m stimmen mit dem Abzählen überein`);
  for (const o of q.options) ok(nah(rechne(o.tex), o.num), `${tag}: Antwort-Formel und Wert gehören zusammen (${o.tex})`);
});

/* ───────────── genGegen: einfache Fälle aus dem Text, „mindestens ein Treffer“ durch Abzählen aller Verläufe bzw. Binomial-Summe ───────────── */
const MERK = new Map();
const mindestensEinTreffer = (treffer, felder, versuche) => { const key = `${treffer}/${felder}/${versuche}`; if (!MERK.has(key)) { let alle = 0, gut = 0; const geh = (tiefe, hatte) => { if (tiefe === versuche) { alle++; if (hatte) gut++; return; } for (let k = 0; k < felder; k++) geh(tiefe + 1, hatte || k < treffer); }; geh(0, false); MERK.set(key, gut / alle); } return MERK.get(key); };
const ueber = (a, b) => { let v = 1; for (let i = 1; i <= b; i++) v = (v * (a - b + i)) / i; return v; };
ARTEN.genGegen = laufe('genGegen', (q, r, f, tag) => {
  const z = zahlen(q.prompt); let soll;
  if (q.art === 'einfach') soll = 100 - z[0];
  else if (q.art === 'rest') soll = 100 - z[0] - z[1];
  else if (q.art === 'min1') { const { z: kein, nn, n: versuche } = q.roh; ok(q.prompt.includes(`${versuche}-mal`), `${tag}: Zahl der Versuche steht im Text`); soll = mindestensEinTreffer(nn - kein, nn, versuche); }
  else { const p = z[0] / 100, versuche = z[1]; soll = 0; for (let k = 1; k <= versuche; k++) soll += ueber(versuche, k) * p ** k * (1 - p) ** (versuche - k); }
  zahlPruefung(tag, r, f, soll, { tol: 1e-9, abstand: 0.003 });
  if (q.kind === 'min1') { ok(nah(rechne(r.tex), soll, 1e-9), `${tag}: gezeigte Rechnung liefert den abgezählten Wert (${r.tex})`); for (const o of f) ok(!nah(rechne(o.tex), soll, 1e-4) && nah(rechne(o.tex), o.num, 1e-9), `${tag}: Ablenker-Rechnung ist falsch (${o.tex})`); ok(nah(1 - q.miss ** q.n, soll, 1e-9), `${tag}: Rechen-Felder passen`); }
  else { ok(nah(antwortZahl(r.tex), soll), `${tag}: gezeigte Zahl passt`); ok(nah(100 - q.p, soll), `${tag}: Rechen-Feld p passt`); }
});

/* ───────────── genPythagoras: Zahlen aus dem Text; Probe über das rechtwinklige Dreieck ───────────── */
ARTEN.genPythagoras = laufe('genPythagoras', (q, r, f, tag) => {
  const z = zahlen(q.prompt.replace(/⟦[a-z]=/g, '⟦')); let soll;
  if (q.art === 'hypotenuse') soll = Math.sqrt(z[0] * z[0] + z[1] * z[1]);
  else if (q.art === 'kathete') { const c = Math.max(z[0], z[1]), a = Math.min(z[0], z[1]); soll = Math.sqrt((c - a) * (c + a)); }
  else if (q.art === 'raumdiagonale') soll = Math.sqrt(z[0] ** 2 + z[1] ** 2 + z[2] ** 2);
  else { const [g, s] = z; soll = Math.sqrt(s * s - (g * g) / 4); ok(s > g / 2, `${tag}: Dreieck existiert`); }
  zahlPruefung(tag, r, f, soll, { anzeige: 0.00501, abstand: 0.006 });
  ok(q.hyp ? nah(Math.hypot(q.A, q.B), soll) : nah(Math.sqrt(q.C ** 2 - q.A ** 2), soll), `${tag}: Rechen-Felder A, B, C passen zum Text`);
});

/* ───────────── genTrig: Dreieck aus dem Text aufbauen (Einheitsdreieck strecken), verkettete Aufgaben auf zweitem Weg ───────────── */
const grad = (w) => (w * Math.PI) / 180;
ARTEN.genTrig = laufe('genTrig', (q, r, f, tag, lv) => {
  const text = q.prompt.replace(/⟦\\(alpha|beta)=/g, '⟦').replace(/\^\\circ/g, '°'), z = zahlen(text.replace(/⟦[a-z]=/g, '⟦')); let soll;
  if (['auswahl', 'kathete', 'hypotenuse', 'tangens'].includes(q.art)) {
    const [al, s] = z, seite = { Hypotenuse: 1, Gegenkathete: Math.sin(grad(al)), Ankathete: Math.cos(grad(al)) };   // Einheitsdreieck
    const m = /und die (Hypotenuse|Gegenkathete|Ankathete)[^.]*lang\. (?:Welche Rechnung liefert|Wie lang ist) die (Hypotenuse|Gegenkathete|Ankathete)/.exec(text);
    soll = (s / seite[m[1]]) * seite[m[2]];
  } else if (q.art === 'leiterwand') soll = z[0] * Math.cos(grad(z[1]));          // Winkel zwischen Leiter und Wand: Die Wand ist die Ankathete
  else if (q.art === 'rampe') soll = z[0] / Math.sin(grad(z[1]));
  else if (q.art === 'schatten') soll = z[0] * Math.tan(grad(z[1]));
  else if (q.art === 'drachen') soll = z[0] * Math.sin(grad(z[1]));
  else if (q.art === 'seilbahn') soll = z[1] * Math.cos(grad(z[0]));
  else if (q.art === 'hoehe') { const [c, al] = z, a = c * Math.sin(grad(al)), b = c * Math.cos(grad(al)); soll = (a * b) / c; }   // über den Flächeninhalt: a·b = c·h
  else if (q.art === 'drachen2') { const [l, al, be] = z, h = l * Math.sin(grad(al)), boden = h / Math.tan(grad(be)); soll = Math.hypot(h, boden); }   // Luftlinie über Pythagoras
  else { const [a, b, al] = z; soll = Math.tan(grad(al)) * Math.sqrt(a * a + b * b); ok(nah((Math.atan2(soll, Math.hypot(a, b)) * 180) / Math.PI, al, 1e-9), `${tag}: Höhenwinkel stimmt in der Probe`); }
  zahlPruefung(tag, r, f, soll, { tol: 1e-9, abstand: 0.004 });
  if (lv === 1) { ok(nah(rechne(r.tex), soll, 1e-9), `${tag}: gezeigte Rechnung liefert die Seite (${r.tex})`); for (const o of f) ok(!nah(rechne(o.tex), soll, 1e-4), `${tag}: Ablenker-Rechnung ist falsch (${o.tex})`); }
  else ok(Math.abs(antwortZahl(r.tex) - soll) <= 0.00501, `${tag}: gezeigte Zahl ist richtig gerundet (${r.tex} zu ${soll})`);
  const w = grad(q.al); ok(nah({ sin: q.s * Math.sin(w), cos: q.s * Math.cos(w), tan: q.s * Math.tan(w), hyp: q.s / Math.sin(w) }[q.kind], soll, 1e-9), `${tag}: Rechen-Felder kind, al, s passen`);
});

/* ───────────── genFlaeche: Zahlen aus dem Text; krumme Körper und Flächen durch Zerlegen in Scheiben (numerische Integration) ───────────── */
const simpson = (g, a, b, teile = 2000) => { const h = (b - a) / teile; let s = g(a) + g(b); for (let i = 1; i < teile; i++) s += g(a + i * h) * (i % 2 ? 4 : 2); return (s * h) / 3; };
const kreisflaeche = (rr) => 4 * simpson((t) => rr * Math.cos(t) * rr * Math.cos(t), 0, Math.PI / 2);   // Viertelkreis mit x = r·sin t
const spitz = (grundflaeche, hoehe) => simpson((y) => grundflaeche * (1 - y / hoehe) ** 2, 0, hoehe);    // Kegel oder Pyramide in Scheiben
ARTEN.genFlaeche = laufe('genFlaeche', (q, r, f, tag) => {
  const z = zahlen(q.prompt.replace(/⟦[a-zA-Z_]+=/g, '⟦').replace(/cm[²³]|m[²³]/g, ' ')); let soll;
  const A = { rechteck: () => z[0] * z[1], quadrat: () => z[0] * z[0], dreieck: () => simpson((y) => z[0] * (1 - y / z[1]), 0, z[1]), quader: () => z[0] * z[1] * z[2], parallelogramm: () => z[0] * z[1],
    kreis: () => kreisflaeche(z[0]), trapez: () => simpson((y) => z[0] + ((z[1] - z[0]) * y) / z[2], 0, z[2]), zylinder: () => kreisflaeche(z[0]) * z[1], pyramide: () => spitz(z[0] * z[0], z[1]), kegel: () => spitz(kreisflaeche(z[0] / 2), z[1]),
    fenster: () => z[0] * z[1] + kreisflaeche(z[0] / 2) / 2, dose: () => 2 * kreisflaeche(z[0]) + 2 * Math.PI * z[0] * z[1], tank: () => kreisflaeche(z[0] / 2) * z[1] * 1000 * (z[2] / 100),
    kegelmantel: () => { const h = Math.sqrt(z[1] ** 2 - z[0] ** 2); return spitz(kreisflaeche(z[0]), h); }, rohr: () => ((kreisflaeche(z[2]) - kreisflaeche(z[3])) * z[1] * z[0]) / 1000,
    radius: () => { let lo = 0, hi = 100; for (let i = 0; i < 80; i++) { const mi = (lo + hi) / 2; if (kreisflaeche(mi) * z[1] < z[0]) lo = mi; else hi = mi; } return lo; },   // Radius durch Eingrenzen suchen
    seitenkante: () => { const halbeDiagonale = Math.hypot(z[0], z[0]) / 2, h = Math.sqrt(z[1] ** 2 - halbeDiagonale ** 2); return spitz(z[0] * z[0], h); } };
  ok(q.art in A, `${tag}: bekannte Form`); soll = A[q.art]();
  ok(Math.abs(r.num - soll) < 0.0502 && Math.abs(antwortZahl(r.tex) - soll) < 0.0502, `${tag}: Ergebnis stimmt auf eine Nachkommastelle (erwartet ${soll}, gezeigt ${r.tex})`);
  ok(Math.abs(q.want - soll) < 0.0502, `${tag}: Rechen-Feld want passt`);
  for (const o of f) ok(Number.isFinite(o.num) && Math.abs(o.num - soll) > 0.2 && Math.abs(antwortZahl(o.tex) - soll) > 0.2, `${tag}: Ablenker ist wirklich falsch (${o.tex} gegen ${soll})`);
});

/* ───────────── genMittelpunkt: Punkte aus der Formel; der Mittelpunkt liegt von beiden Enden gleich weit und in gleicher Richtung ───────────── */
const koord = (formel, vars) => Object.fromEntries([...String(formel).matchAll(/([A-Z]'?)\(([^()]*)\)/g)].map((m) => [m[1], m[2].split('\\mid').map((t) => rechne(t, vars))]));
const istMitte = (M, P, Q) => M.every((c, i) => nah(c - P[i], Q[i] - c, 1e-9));
const gleich = (u, v) => u.length === v.length && u.every((c, i) => nah(c, v[i], 1e-9));
ARTEN.genMittelpunkt = laufe('genMittelpunkt', (q, r, f, tag) => {
  const M = koord(r.tex).M; let E, soll;
  if (q.art === 'parameter') { const dritte = (t) => { const p = koord(q.formula, { t }); return p.A[2] + p.B[2]; }, t = -dritte(0) / (dritte(1) - dritte(0)); E = koord(q.formula, { t }); soll = E.A.map((c, i) => (c + E.B[i]) / 2);
    ok(nah(dritte(t), 0, 1e-9) && Math.abs(M[2]) < 1e-9, `${tag}: Mittelpunkt liegt in der x1x2-Ebene`); ok(istMitte(M, E.A, E.B), `${tag}: Mittelpunkt von A und B für das gefundene t`); }
  else { E = koord(q.formula);
    if (q.art === 'parallelogramm') { const C = E.B.map((c, i) => c + E.D[i] - E.A[i]); ok(istMitte(M, E.B, E.D) && istMitte(M, E.A, C), `${tag}: M halbiert beide Diagonalen`); soll = E.A.map((c, i) => (c + C[i]) / 2); }
    else if (q.art === 'seitenhalb') { soll = E.A.map((c, i) => c / 2 + E.B[i] / 4 + E.C[i] / 4); const Ma = E.B.map((c, i) => (c + E.C[i]) / 2); ok(istMitte(Ma, E.B, E.C) && istMitte(M, E.A, Ma), `${tag}: M halbiert die Seitenhalbierende`); }
    else if (q.art === 'spiegel') { const As = E.Z.map((c, i) => 2 * c - E.A[i]); ok(istMitte(E.Z, E.A, As) && istMitte(M, As, E.B), `${tag}: M halbiert die Strecke vom Bildpunkt nach B`); soll = E.Z.map((c, i) => c - E.A[i] / 2 + E.B[i] / 2); }
    else { ok(istMitte(M, E.A, E.B), `${tag}: M liegt in der Mitte von A und B`); soll = E.A.map((c, i) => c + (E.B[i] - c) / 2); } }
  ok(gleich(M, soll) && gleich(r.vec, soll), `${tag}: Mittelpunkt stimmt (${q.formula} → ${r.tex}, erwartet ${soll})`);
  ok(gleich(q.A.map((c, i) => (c + q.B[i]) / 2), soll), `${tag}: Rechen-Felder A und B passen`);
  for (const o of f) ok(!gleich(koord(o.tex).M, soll) && !gleich(o.vec, soll), `${tag}: Ablenker ist wirklich falsch (${o.tex})`);
});

/* ───────────── genVektorRechnen: den gefragten Term Zeile für Zeile mit dem TeX-Rechner auswerten ───────────── */
const vektoren = (formel) => Object.fromEntries([...String(formel).matchAll(/\\vec ([a-z])=\\begin\{pmatrix\}(.*?)\\end\{pmatrix\}/g)].map((m) => [m[1], m[2].split('\\\\')]));
const spalte = (t) => /\\begin\{pmatrix\}(.*?)\\end\{pmatrix\}/.exec(t)[1].split('\\\\').map((c) => rechne(c));
const zeile = (term, V, i, vars) => rechne(term.replace(/\\vec ([a-z])/g, (_, b) => `(${V[b][i]})`), vars);
ARTEN.genVektorRechnen = laufe('genVektorRechnen', (q, r, f, tag) => {
  const V = vektoren(q.formula), F = formeln(q.prompt), dim = Object.values(V)[0].length, erg = spalte(r.tex); let soll;
  if (q.art === 'gleichung') { const [li, re] = F[1].split('='); V.x = erg.map(String); ok(erg.every((_, i) => nah(zeile(li, V, i), zeile(re, V, i), 1e-9)), `${tag}: gezeigter Vektor erfüllt die Gleichung (${F[1]})`); soll = erg.map((_, i) => zeile(re, V, i) - rechne(V.v[i])); }
  else if (q.art === 'parameter') { const term = F[1], d = (t) => zeile(term, V, 0, { t }) - zeile(term, V, 2, { t }), t = -d(0) / (d(1) - d(0)); soll = [0, 1, 2].map((i) => zeile(term, V, i, { t })); ok(nah(soll[0], soll[2], 1e-9) && nah(erg[0], erg[2], 1e-9), `${tag}: erste und dritte Koordinate stimmen überein`); }
  else if (q.art === 'drohne') { const zeit = zahlen(q.prompt)[0]; soll = [0, 1, 2].map((i) => rechne(V.p[i]) + zeit * (rechne(V.a[i]) + rechne(V.w[i]))); }   // Ort = Start + Zeit · (Eigengeschwindigkeit + Wind)
  else soll = Array.from({ length: dim }, (_, i) => zeile(F[0], V, i));
  ok(gleich(erg, soll) && gleich(r.vec, soll), `${tag}: Ergebnis stimmt (${q.prompt} ${q.formula} → ${r.tex}, erwartet ${soll})`);
  ok(gleich(q.u.map((c, j) => ({ add: c + q.v[j], sub: c - q.v[j], skalar: q.k * c, kombi: q.k * c - q.v[j] })[q.kind]), soll), `${tag}: Rechen-Felder u, v, k passen`);
  for (const o of f) ok(!gleich(spalte(o.tex), soll) && !gleich(o.vec, soll), `${tag}: Ablenker ist wirklich falsch (${o.tex})`);
});

/* ───────────── jede Stufe hat ihre eigenen Aufgaben-Formen; alle Erzeuger des Pakets sind geprüft ───────────── */
const NAMEN = ['genBruch', 'genKlammer', 'genLinGl', 'genPotenz', 'genQuadGl', 'genSteigung', 'genFlaeche', 'genMittelpunkt', 'genPythagoras', 'genTrig', 'genVektorRechnen', 'genGegen', 'genHaeufigkeit', 'genKennwerte', 'genLaplace', 'genProzent'];
// Jede vorgesehene Aufgaben-Form kommt wirklich vor (eine Form, die nie eine gültige Aufgabe ergibt, fiele sonst nicht auf) – und keine unbekannte.
const KW = ['mittel', 'median', 'spann'], PZ = ['grund', 'erhoeht', 'vermindert'], PY = ['hypotenuse', 'kathete'];
const ERWARTET = {
  genBruch: [['gleichnamig'], ['gleichnamig', '+', '-', '·'], ['+', '-'], ['+', '-', ':'], ['+', '-', ':']],
  genKlammer: [['faktor1'], ['faktor', 'zwei1'], ['zwei', 'binom'], ['binom2', 'allg', 'dritte'], ['kallg', 'bdiff']],
  genLinGl: [['plus', 'mal'], ['zwei'], ['beidseitig'], ['klammer'], ['zweiklammern']],
  genQuadGl: [['rein'], ['ausklammern', 'reinfaktor'], ['pq'], ['abc'], ['umformen']],
  genPotenz: [['mal'], ['mal3', 'hoch', 'durch'], ['durch', 'neg', 'kombi'], ['wurzel', 'negdurch', 'negkombi'], ['wurzelkombi', 'wurzelhoch']],
  genSteigung: [['steigung'], ['steigung'], ['steigung', 'gleichung'], ['gleichung'], ['gleichung']],
  genHaeufigkeit: [['erweitern'], ['teilen'], ['kategorien'], ['tabelle'], ['chargen', 'rest', 'luecke']],
  genProzent: [['wert'], ['wert', 'satz'], ['satz', 'erhoeht', 'vermindert'], PZ, PZ],
  genKennwerte: [KW, KW, KW, KW, KW],
  genLaplace: [['wuerfel', 'rad'], ['urne', 'karten'], ['urneoder', 'summe'], ['zwei', 'karten2'], ['zwei', 'karten2']],
  genGegen: [['einfach'], ['rest'], ['min1'], ['min1'], ['min1prozent']],
  genPythagoras: [['hypotenuse'], PY, PY, PY, ['raumdiagonale', 'gleichschenklig']],
  genTrig: [['auswahl'], ['kathete'], ['tangens', 'hypotenuse'], ['leiterwand', 'rampe', 'schatten', 'drachen', 'seilbahn'], ['hoehe', 'drachen2', 'mast']],
  genFlaeche: [['rechteck', 'quadrat'], ['dreieck', 'quader', 'parallelogramm'], ['kreis', 'trapez', 'zylinder'], ['pyramide', 'kegel', 'fenster', 'dose'], ['tank', 'kegelmantel', 'rohr', 'radius', 'seitenkante']],
  genMittelpunkt: [['eben'], ['eben2'], ['raum'], ['halb', 'parallelogramm'], ['seitenhalb', 'spiegel', 'parameter']],
  genVektorRechnen: [['add2'], ['add', 'sub', 'skalar'], ['skalarneg', 'kombi'], ['dezimal', 'gleichung'], ['linkombi', 'parameter', 'drohne']],
};
for (const [name, je] of Object.entries(ERWARTET)) je.forEach((liste, i) => { const da = [...ARTEN[name]].filter((x) => x.startsWith(`${i + 1}:`)).map((x) => x.slice(2)).sort().join(', ');
  ok(da === [...liste].sort().join(', '), `${name} (Stufe ${i + 1}): alle vorgesehenen Aufgaben-Formen kommen vor (vorgesehen: ${[...liste].sort().join(', ')} – erzeugt: ${da})`); });
for (const name of NAMEN) { ok(ARTEN[name] instanceof Set && ARTEN[name].size >= 5, `${name}: geprüft, mit Aufgaben-Formen auf allen Stufen`); ok(typeof K[name].topic === 'string', `${name}: Themen-Name bleibt`); }
for (const name of ['genFlaeche', 'genMittelpunkt', 'genTrig', 'genVektorRechnen', 'genHaeufigkeit']) { const form = (lv) => new Set([...ARTEN[name]].filter((a) => a.startsWith(`${lv}:`)).map((a) => a.slice(2)));
  for (let lv = 1; lv < 5; lv++) ok(![...form(lv + 1)].some((a) => form(lv).has(a)), `${name}: Stufe ${lv + 1} stellt andere Aufgaben-Formen als Stufe ${lv}`);
  ok(form(5).size >= 3, `${name}: Stufe 5 hat mindestens drei verschiedene Aufgaben-Formen`); }

if (fehler) { console.error(`hart/gen3: ${fehler} Befunde bei ${n} Prüfungen`); process.exit(1); }
console.log(`hart/gen3: ${n} Prüfungen bestanden`);
