globalThis.window = { katex: { renderToString: (s) => s } };
// Harte Prüfung für das Paket gen6b (Klasse 5 bis 10): Jede Aufgaben-Form wird je Stufe 200-mal erzeugt und die als richtig
// markierte Antwort unabhängig nachgerechnet – aus dem Aufgabentext gelesen und auf anderem Weg bestimmt (durchprobieren,
// Schritt für Schritt nachspielen, Formel auswerten, Dreieck mit Koordinaten bauen), nicht mit der Formel des Erzeugers.
window.katex.renderToString = (s) => `«${String(s).replace(/[«»]/g, '')}»`;   // Formeln im Text erkennbar machen
const { seedRandom } = await import('../../app/js/math.js');
const G = await import('../../app/js/gen6.js');

let n = 0; const fehler = [];
const ok = (bed, text) => { n++; if (!bed && fehler.length < 40 && fehler.filter((f) => f.slice(0, 14) === text.slice(0, 14)).length < 4) fehler.push(text); };
const nah = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol;

/* ── Lesen des Aufgabentexts ── */
const glatt = (s) => String(s).replace(/[\u00a0\u202f\u2009]/g, ' ').replace(/[«»]/g, '').replace(/\{,\}/g, ',').replace(/\\,/g, '').replace(/<[^>]+>/g, '');
/** Alle Zahlen eines Texts (deutsche Schreibweise: 12 500 und 3,75). */
const zahlen = (s) => (glatt(s).match(/\d{1,3}(?: \d{3})+(?:,\d+)?|\d+(?:,\d+)?/g) || []).map((z) => +z.replace(/ /g, '').replace(',', '.'));
const formeln = (s) => [...String(s).matchAll(/«([^»]*)»/g)].map((m) => m[1]);

/** Wert eines Formel-Quelltexts (Zahlen, + − · :, Klammern, Potenz, Wurzel, Bruch, Variablen) – eigener kleiner Rechner. */
function wert(src, vars = {}) {
  const s = String(src).replace(/\{,\}/g, '.').replace(/\\,|\\!|\\;|\s+/g, '').replace(/\\text\{[^}]*\}(\^\d)?/g, '').replace(/\\approx/g, '').replace(/\\left|\\right/g, '').replace(/\\%/g, '');
  let i = 0;
  const sieh = (t) => s.startsWith(t, i), nimm = (t) => { if (!sieh(t)) throw new Error(`erwartet ${t} bei ${i} in ${s}`); i += t.length; };
  const beginntPrimaer = () => i < s.length && (/[a-zA-Z([]/.test(s[i]) || sieh('\\sqrt') || sieh('\\dfrac') || sieh('\\tfrac') || sieh('\\frac'));
  function primaer() {
    if (sieh('\\sqrt')) { i += 5; nimm('{'); const v = ausdruck(); nimm('}'); return Math.sqrt(v); }
    for (const b of ['\\dfrac', '\\tfrac', '\\frac']) if (sieh(b)) { i += b.length; let z; if (sieh('{')) { nimm('{'); z = ausdruck(); nimm('}'); } else z = +s[i++]; let nn; if (sieh('{')) { nimm('{'); nn = ausdruck(); nimm('}'); } else nn = +s[i++]; return z / nn; }
    if (sieh('(')) { i++; const v = ausdruck(); nimm(')'); return v; }
    if (sieh('[')) { i++; const v = ausdruck(); nimm(']'); return v; }
    const m = /^\d+(\.\d+)?/.exec(s.slice(i)); if (m) { i += m[0].length; return +m[0]; }
    if (/[a-zA-Z]/.test(s[i] || '')) { const c = s[i++]; if (!(c in vars)) throw new Error(`Variable ${c} in ${s}`); return vars[c]; }
    throw new Error(`unlesbar bei ${i}: ${s}`);
  }
  function potenz() { let v = primaer(); while (sieh('^')) { i++; let e; if (sieh('{')) { nimm('{'); e = ausdruck(); nimm('}'); } else e = +s[i++]; v = v ** e; } return v; }
  function produkt() { let v = potenz(); for (;;) { if (sieh('\\cdot')) { i += 5; v *= vorz(); } else if (sieh(':')) { i++; v /= vorz(); } else if (beginntPrimaer()) v *= potenz(); else return v; } }
  function vorz() { if (sieh('-')) { i++; return -potenz(); } return potenz(); }
  function ausdruck() { let v; if (sieh('-')) { i++; v = -produkt(); } else { if (sieh('+')) i++; v = produkt(); } for (;;) { if (sieh('+')) { i++; v += produkt(); } else if (sieh('-')) { i++; v -= produkt(); } else if (sieh('\\pm')) { i += 3; v += produkt(); } else return v; } }
  const v = ausdruck(); if (i !== s.length) throw new Error(`Rest bei ${i}: ${s}`); return v;
}
const ggT = (a, b) => { let g = 1; for (let d = 1; d <= Math.min(a, b); d++) if (a % d === 0 && b % d === 0) g = d; return g; };
const kgV = (...x) => { for (let v = Math.max(...x); ; v++) if (x.every((t) => v % t === 0)) return v; };
const prim = (z) => { if (z < 2) return false; for (let d = 2; d < z; d++) if (z % d === 0) return false; return true; };
const quer = (z) => String(z).split('').reduce((s, c) => s + +c, 0);
const STELLEN = { Zehner: 10, Hunderter: 100, Tausender: 1000, Zehntausender: 10000 };
/** Nächstes Vielfaches von s – durch Absuchen der Nachbarn (bei genau der Mitte wird aufgerundet). */
const runde = (x, s) => { let best = null; for (let v = Math.floor(x / s) * s - s; v <= x + 2 * s; v += s) if (best === null || Math.abs(v - x) < Math.abs(best - x) - 1e-9 || (nah(Math.abs(v - x), Math.abs(best - x), 1e-9) && v > best)) best = v; return best; };
const grad = (g) => (g * Math.PI) / 180;
const dist = (P, Q) => Math.hypot(P[0] - Q[0], P[1] - Q[1]);
/** Größte Nullstelle von f in [lo, hi] (Vorzeichenwechsel suchen, dann halbieren). */
const nullstellen = (f, lo, hi, schritt = 0.01) => { const r = []; for (let x = lo; x < hi; x += schritt) { const a = f(x), b = f(x + schritt); if (a === 0) r.push(x); else if (a * b < 0) { let u = x, o = x + schritt; for (let k = 0; k < 60; k++) { const m = (u + o) / 2; if (f(u) * f(m) <= 0) o = m; else u = m; } r.push((u + o) / 2); } } return r.filter((x, k) => k === 0 || x - r[k - 1] > 1e-6); };
/** Größter Wert von f in [lo, hi]: grob absuchen, dann um die beste Stelle herum immer enger einschachteln. */
const maxStelle = (f, lo, hi, schritt = 0.05) => { let bx = lo, bv = -Infinity; for (let x = lo; x <= hi; x += schritt) { const v = f(x); if (v > bv) { bv = v; bx = x; } }
  let u = Math.max(lo, bx - schritt), o = Math.min(hi, bx + schritt); for (let k = 0; k < 80; k++) { const m1 = u + (o - u) / 3, m2 = o - (o - u) / 3; if (f(m1) < f(m2)) u = m1; else o = m2; } return [(u + o) / 2, f((u + o) / 2)]; };

/* ── unabhängige Nachrechnung je Aufgaben-Art: liefert { soll, tol } oder prüft selbst ── */
const P = {
  genRunden(q) { const z = zahlen(q.prompt), s = STELLEN[/auf (\w+)\.$/.exec(q.prompt)[1]]; let x;
    if (q.kind === 'zahl') x = z[0]; else if (q.kind === 'summe') x = z[0] + z[1] + z[2]; else { const cnt = z[0]; x = z.slice(1, 1 + cnt).reduce((a, b) => a + b, 0) / cnt; ok(z.length === cnt + 1, 'genRunden mittel: Anzahl der Werte'); }
    ok(nah(x, q.n), `genRunden: Zahl aus dem Text (${x}) = Feld n (${q.n})`); return { soll: runde(x, s) }; },
  genRechenregel(q) { const soll = wert(q.formula); for (const h of [...q.hints, q.explain]) for (const f of formeln(h)) ok(nah(wert(f.replace(/^=/, '')), soll), `genRechenregel ${q.kind}: Zwischenschritt ${f} hat nicht den Wert von ${q.formula}`); return { soll }; },
  genTeiler(q) { const z = zahlen(q.prompt), r = q.options.find((o) => o.correct).num;
    if (q.kind === 'prim') { ok(q.options.filter((o) => prim(o.num)).length === 1, 'genTeiler prim: genau eine Primzahl'); return { soll: q.options.find((o) => prim(o.num))?.num }; }
    if (q.kind === 'teilbar') { ok(q.options.filter((o) => o.num % z[0] === 0).length === 1, `genTeiler teilbar: genau eine durch ${z[0]} teilbar`); for (const o of q.options) if (!o.correct) { const w = glatt(o.why); if (/Quersumme/.test(w)) ok(zahlen(w)[1] === quer(o.num) && quer(o.num) % zahlen(w)[2] !== 0 && z[0] % zahlen(w)[2] === 0, `genTeiler teilbar: Begründung Quersumme bei ${o.num}`); if (/ungerade/.test(w)) ok(o.num % 2 === 1, 'genTeiler: ungerade'); if (/endet nicht/.test(w)) ok(o.num % 5 !== 0, 'genTeiler: endet nicht auf 0/5'); if (/letzten beiden/.test(w)) ok((o.num % 100) % 4 !== 0, 'genTeiler: letzte zwei Ziffern'); } return { soll: q.options.find((o) => o.num % z[0] === 0)?.num }; }
    if (q.kind === 'ggt') return { soll: ggT(z[0], z[1]) };
    if (q.kind === 'kgv') return { soll: kgV(z[0], z[1]) };
    if (q.kind === 'takt') { const x = [...glatt(q.prompt).matchAll(/alle (\d+)/g)].map((m) => +m[1]); ok(x.length === 3, 'genTeiler takt: drei Takte'); return { soll: kgV(...x) }; }
    if (q.kind === 'fliesen') { const A = Math.round(z[0] * 100), B = Math.round(z[1] * 100); let s = 1; for (let k = 1; k <= Math.min(A, B); k++) if (A % k === 0 && B % k === 0) s = k; return { soll: (A * B) / (s * s) }; }
    throw new Error(`genTeiler: unbekannte Form ${q.kind} (${r})`); },
  genRechteck(q) { const z = zahlen(q.prompt);
    switch (q.kind) {
      case 'flaeche': return { soll: z[0] * z[1] };
      case 'umfang': return { soll: z[0] + z[1] + z[0] + z[1] };
      case 'quadrat': return { soll: z[0] * z[0] };
      case 'seite': { let b = null; for (let k = 1; k <= z[0]; k++) if (k * z[1] === z[0]) b = k; return { soll: b }; }
      case 'lform': { let c = 0; for (let x = 0; x < z[0]; x++) for (let y = 0; y < z[1]; y++) if (!(x < z[2] && y < z[3])) c++; return { soll: c }; }
      case 'ausumfang': { let fl = null; for (let b = 1; b < z[0]; b++) if (2 * (z[1] + b) === z[0]) fl = z[1] * b; return { soll: fl }; }
      case 'weg': { const [a, b, w] = z; return { soll: 2 * a * w + 2 * b * w + 4 * w * w }; }   // vier Streifen und vier Ecken
      case 'platten': { const [a, b, f] = z; let nx = 0, ny = 0; for (let x = f; x <= Math.round(a * 100); x += f) nx++; for (let y = f; y <= Math.round(b * 100); y += f) ny++; ok(nx * f === Math.round(a * 100) && ny * f === Math.round(b * 100), 'genRechteck platten: Fliesen gehen auf'); return { soll: nx * ny }; }
      case 'kosten': { const [a, b, c, d, pb, pl] = z; const fl = (a - c) * b + c * (b - d), um = a + b + (a - c) + d + c + (b - d); return { soll: fl * pb + um * pl, tol: 0.006 }; }   // Fläche aus zwei Teil-Rechtecken, Umfang als Weg um alle sechs Wände
      case 'gleichung': { const dd = z[0], U = z[1], k = /Doppelte/.test(q.prompt) ? 2 : 3; let fl = null; for (let x = 0.5; x < U; x += 0.5) if (nah(2 * (x + k * x + dd), U)) fl = x * (k * x + dd); return { soll: fl }; }
      default: throw new Error(`genRechteck: ${q.kind}`);
    } },
  genTerm(q) { const r = q.options.find((o) => o.correct);
    if (q.kind === 'wert' || q.kind === 'wertneg') { const x = +/x=(-?\d+)/.exec(q.prompt)[1]; return { soll: wert(q.formula, { x }) }; }
    const stellen = [[1.3, -0.7], [-2.1, 0.4], [0.37, 2.9], [5, -3]];
    ok(stellen.every(([x, y]) => nah(wert(q.formula, { x, y }), wert(r.tex, { x, y }), 1e-7)), `genTerm ${q.kind}: ${q.formula} ≠ ${r.tex}`);
    for (const o of q.options) if (!o.correct) ok(stellen.some(([x, y]) => !nah(wert(q.formula, { x, y }), wert(o.tex, { x, y }), 1e-7)), `genTerm ${q.kind}: Ablenker ${o.tex} ist gleichwertig zu ${q.formula}`);
    for (const f of formeln(q.explain)) for (const t of f.split('=').filter(Boolean)) ok(stellen.every(([x, y]) => nah(wert(t, { x, y }), wert(q.formula, { x, y }), 1e-7)), `genTerm ${q.kind}: Schritt ${t} im Lösungsweg`);
    return null; },
  genWurzel(q) { const soll = wert(q.formula), r = q.options.find((o) => o.correct);
    ok(nah(wert(r.tex), soll, 1e-9), `genWurzel ${q.kind}: ${q.formula} ≠ ${r.tex}`);
    for (const o of q.options) ok(nah(wert(o.tex), o.num, 1e-5), `genWurzel ${q.kind}: Zahlwert der Antwort ${o.tex}`);
    return { soll, tol: 1e-9 }; },
  genZinseszins(q) { const z = zahlen(q.prompt), r = q.options.find((o) => o.correct), lauf = (K, p, jahre) => { for (let j = 0; j < jahre; j++) K += (K * p) / 100; return K; };
    switch (q.kind) {
      case 'faktor': { const ab = /nimmt/.test(q.prompt); return { soll: (100 + (ab ? -1 : 1) * z[0]) / 100 }; }
      case 'formel': { const [K, jahre, p] = z, soll = lauf(K, p, jahre); ok(nah(wert(r.tex), soll, 1e-6), 'genZinseszins formel: Term stimmt'); for (const o of q.options) if (!o.correct) ok(!nah(wert(o.tex), soll, 1e-6), 'genZinseszins formel: Ablenker falsch'); return null; }
      case 'ein': return { soll: lauf(z[0], z[1], 1), tol: 0.0051 };
      case 'einab': return { soll: lauf(z[0], -z[1], 1), tol: 0.0051 };
      case 'zwei': case 'drei': return { soll: lauf(z[0], z[1], z[2]), tol: 0.0051 };
      case 'abnahme': return { soll: lauf(z[0], -z[1], z[2]), tol: 0.0051 };
      case 'rueck': { const [jahre, p, Kn] = z; ok(nah(lauf(r.num, p, jahre), Kn, 0.006), 'genZinseszins rueck: Probe vorwärts'); for (const o of q.options) if (!o.correct) ok(!nah(lauf(o.num, p, jahre), Kn, 0.02), 'genZinseszins rueck: Ablenker falsch'); return null; }
      case 'wechsel': { const [K, n1, p1, n2, p2] = z; return { soll: lauf(lauf(K, p1, n1), p2, n2), tol: 0.0051 }; }
      case 'satz': { const [K0, jahre, Kn] = z; ok(nah(lauf(K0, r.num, jahre), Kn, 0.006), 'genZinseszins satz: Probe vorwärts'); for (const o of q.options) if (!o.correct) ok(!nah(lauf(K0, o.num, jahre), Kn, 0.05), 'genZinseszins satz: Ablenker falsch'); return null; }
      case 'dauer': { const [K0, p, Z] = z; let K = K0, j = 0; while (K < Z - 1e-9) { K += (K * p) / 100; j++; } return { soll: j }; }
      default: throw new Error(`genZinseszins: ${q.kind}`);
    } },
  genQuader(q) { const z = zahlen(q.prompt), r = q.options.find((o) => o.correct);
    switch (q.kind) {
      case 'quader': return { soll: z[0] * z[1] * z[2] };
      case 'wuerfel': return { soll: z[0] * z[0] * z[0] };
      case 'wuerfelo': return { soll: [1, 2, 3, 4, 5, 6].reduce((s) => s + z[0] * z[0], 0) };
      case 'oberflaeche': { const [a, b, c] = z; return { soll: a * b + a * b + a * c + a * c + b * c + b * c }; }
      case 'kante': { let h = null; for (let k = 1; k <= z[0]; k++) if (z[1] * z[2] * k === z[0]) h = k; return { soll: h }; }
      case 'doppel': return { soll: z[0] * z[1] * z[2] + z[3] ** 3 };
      case 'orueck': { let v = null; for (let k = 1; k < 100; k++) if (6 * k * k === z[0]) v = k * k * k; return { soll: v }; }
      case 'liter': { const [a, b, c, rd] = z; let cm3 = 0; for (let h = 0; h < c - rd; h++) cm3 += a * b; return { soll: cm3 / 1000 }; }
      case 'stein': { const [a, b, h1, x, y, zz] = z; ok(nah(a * b * r.num, a * b * h1 + x * y * zz, 1e-6), 'genQuader stein: Wasser plus Stein füllt bis zum neuen Stand'); return { soll: (a * b * h1 + x * y * zz) / (a * b) }; }
      case 'kiste': { const [a, b, c, w] = z; return { soll: a * b * w + 2 * a * w * (c - w) + 2 * (b - 2 * w) * w * (c - w), tol: 1e-6 }; }   // Boden plus vier Wände
      default: throw new Error(`genQuader: ${q.kind}`);
    } },
  genStrahlensatz(q) { const z = zahlen(q.prompt), r = q.options.find((o) => o.correct), psi = 1.1;
    switch (q.kind) {
      case 'streckung': return { soll: [z[1], 0].map((v) => v * z[0])[0] };
      case 'parallel': { const [za, zs, ab] = z, A = [za, 0], B = [A[0] + ab * Math.cos(psi), ab * Math.sin(psi)], f = zs / za; return { soll: dist([A[0] * f, 0], [B[0] * f, B[1] * f]) }; }   // zentrische Streckung von Z aus
      case 'schatten': { const [stab, ss, bs] = z; ok(nah(r.num / bs, stab / ss), 'genStrahlensatz schatten: gleiches Verhältnis'); return { soll: (stab / ss) * bs }; }
      case 'rueck': { const [kl, gr, grAnd] = z; ok(nah(grAnd / r.num, gr / kl), 'genStrahlensatz rueck: gleiches Verhältnis'); return { soll: grAnd / (gr / kl) }; }
      case 'flaeche': { const [A0, k] = z; return { soll: (A0 * k) * (1 * k) }; }   // Rechteck A0 × 1 wird in beide Richtungen gestreckt
      case 'flaecherueck': { const [A1, A2, s] = z; ok(nah((r.num / s) ** 2, A2 / A1), 'genStrahlensatz flaecherueck: Flächenverhältnis = Quadrat des Längenverhältnisses'); return { soll: s * Math.sqrt(A2 / A1) }; }
      case 'abschnitt': { const [za, d, ab] = z, A = [za, 0], B = [A[0] + ab * Math.cos(psi), ab * Math.sin(psi)], f = (za + d) / za; return { soll: dist([A[0] * f, 0], [B[0] * f, B[1] * f]) }; }
      case 'abschnittrueck': { const [za, ab, cd] = z, A = [za, 0], B = [A[0] + ab * Math.cos(psi), ab * Math.sin(psi)], f = (za + r.num) / za; ok(nah(dist([A[0] * f, 0], [B[0] * f, B[1] * f]), cd, 1e-6), 'genStrahlensatz abschnittrueck: gestreckte Parallele hat die Länge CD'); return { soll: za * (cd / ab) - za }; }
      case 'mauer': { const [stab, ss, dB, wH] = z; ok(nah(r.num - (stab / ss) * dB, wH, 1e-6), 'genStrahlensatz mauer: Sonnenstrahl von der Baumspitze trifft die Wand in der richtigen Höhe'); return { soll: wH + (stab / ss) * dB }; }
      case 'fluss': { const [ab, d, cd] = z; ok(nah(r.num / (r.num + d), ab / cd, 1e-9), 'genStrahlensatz fluss: Verhältnis stimmt'); for (const o of q.options) if (!o.correct) ok(!nah(o.num / (o.num + d), ab / cd, 1e-4), 'genStrahlensatz fluss: Ablenker falsch'); return null; }
      case 'trapez': { const [za, d, zb, ab] = z, wz = Math.acos((za * za + zb * zb - ab * ab) / (2 * za * zb)), A = [za, 0], B = [zb * Math.cos(wz), zb * Math.sin(wz)], f = (za + d) / za, C = [A[0] * f, 0], D = [B[0] * f, B[1] * f]; ok(nah(dist(A, B), ab, 1e-9), 'genStrahlensatz trapez: Dreieck ZAB gibt es'); return { soll: dist(A, B) + dist(B, D) + dist(D, C) + dist(C, A), tol: 1e-6 }; }
      default: throw new Error(`genStrahlensatz: ${q.kind}`);
    } },
  genVorteil(q) { const z = zahlen(q.prompt);
    if (q.kind === 'ueberschlag') return { soll: runde(z[0], 100) + runde(z[1], 100) };
    if (q.kind === 'ueberschlagmal') return { soll: runde(z[0], 10) * runde(z[1], 100) };
    if (q.kind === 'gauss') { const t = q.formula.split('+').filter((x) => x !== '\\dots').map(Number), d = t[1] - t[0]; let s = 0, c = 0; for (let v = t[0]; v <= t[t.length - 1]; v += d) { s += v; c++; } ok(t[2] - t[1] === d && t[4] - t[3] === d && (t[4] - t[0]) % d === 0, 'genVorteil gauss: gleichmäßige Folge'); ok(zahlen(q.hints[0]).includes(c), 'genVorteil gauss: Anzahl der Summanden im Tipp'); return { soll: s }; }
    const soll = wert(q.formula); for (const f of formeln(q.explain)) { const teile = f.replace(/^=/, '').split('='); for (const t of teile) if (/[\d)]/.test(t) && !/[a-z]{2}/i.test(t.replace(/\\cdot/g, ''))) wert(t); }
    return { soll }; },
  genZuordnung(q) { const z = zahlen(q.prompt), r = q.options.find((o) => o.correct);
    switch (q.kind) {
      case 'prop': { const [n1, p1, n2] = z; ok(nah(r.num / n2, p1 / n1, 1e-9), 'genZuordnung prop: gleicher Stückpreis'); return { soll: (p1 / n1) * n2, tol: 1e-6 }; }
      case 'anti': { const [n1, t1, n2] = z; ok(nah(n2 * r.num, n1 * t1), 'genZuordnung anti: gleiches Produkt'); return { soll: (n1 * t1) / n2 }; }
      case 'art': { const s = q.prompt, soll = /Brötchen|gleichem Tempo|tankt/.test(s) ? 'proportional' : /Helfer|schneller|Pizza/.test(s) ? 'antiproportional' : /älter|Seiten/.test(s) ? 'keins von beiden' : null; ok(soll && r.tex === `\\text{${soll}}`, `genZuordnung art: ${s} → ${r.tex}`); return null; }
      case 'faktor': { const [x0, y0, x] = z; ok(nah(r.num / x, y0 / x0), 'genZuordnung faktor: gleicher Quotient'); return { soll: (y0 / x0) * x }; }
      case 'antifaktor': { const [x0, y0, x] = z; ok(nah(r.num * x, y0 * x0), 'genZuordnung antifaktor: gleiches Produkt'); return { soll: (y0 * x0) / x }; }
      case 'propkrumm': { const [m1, p1, m2] = z; ok(nah(r.num / m2, p1 / m1, 1e-9), 'genZuordnung propkrumm: gleicher Grundpreis'); return { soll: (p1 / m1) * m2, tol: 1e-6 }; }
      case 'antikrumm': { const [n1, t1, n2] = z; ok(nah(n2 * r.num, n1 * t1), 'genZuordnung antikrumm: gleiches Produkt'); return { soll: (n1 * t1) / n2 }; }
      case 'doppelt': { const [M1, t1, T1, M2, v] = z, jeMS = T1 / M1 / t1; if (/Wie viele Teile/.test(q.prompt)) { let s = 0; for (let m = 0; m < M2; m++) for (let h = 0; h < v; h++) s += jeMS; return { soll: s, tol: 1e-6 }; } ok(nah(r.num * M2 * jeMS, v, 1e-6), 'genZuordnung doppelt: Zeit reicht genau für die Teile'); return { soll: v / (M2 * jeMS), tol: 1e-6 }; }
      case 'ausfall': { const [n1, D, d0] = z, m = /fällt einer/.test(q.prompt) ? 1 : z[3]; let rest = n1 * D, t = 0; while (rest > 1e-9) { rest -= (t < d0 ? n1 : n1 - m) * 0.5; t += 0.5; } return { soll: t }; }   // in halben Tagen nachgespielt
      default: throw new Error(`genZuordnung: ${q.kind}`);
    } },
  genZins(q) { const z = zahlen(q.prompt), r = q.options.find((o) => o.correct), tagZ = (K, p, t) => { let s = 0; for (let d = 0; d < t; d++) s += (K * p) / 100 / 360; return s; };
    switch (q.kind) {
      case 'zinsen': return { soll: (z[0] / 100) * z[1] };
      case 'satz': { const [K, Z] = z; ok(nah((K / 100) * r.num, Z), 'genZins satz: Probe'); return { soll: Z / (K / 100) }; }
      case 'kapital': { const [p, Z] = z; ok(nah((r.num / 100) * p, Z), 'genZins kapital: Probe'); return { soll: (Z / p) * 100 }; }
      case 'monate': { const [K, m, p] = z; let s = 0; for (let k = 0; k < m; k++) s += (K * p) / 100 / 12; return { soll: s, tol: 1e-6 }; }
      case 'end': return { soll: z[0] + (z[0] / 100) * z[1] };
      case 'tage': { const [K, t, p] = z; return { soll: tagZ(K, p, t), tol: 1e-6 }; }
      case 'tagerueck': { const [t, p, Zt] = z; ok(nah(tagZ(r.num, p, t), Zt, 1e-6), 'genZins tagerueck: Probe'); for (const o of q.options) if (!o.correct) ok(!nah(tagZ(o.num, p, t), Zt, 0.004), 'genZins tagerueck: Ablenker falsch'); return null; }
      case 'satztage': { const [K, t, Zt] = z; ok(nah(tagZ(K, r.num, t), Zt, 1e-6), 'genZins satztage: Probe'); for (const o of q.options) if (!o.correct) ok(!nah(tagZ(K, o.num, t), Zt, 0.004), 'genZins satztage: Ablenker falsch'); return null; }
      case 'zeit': { const [K, p, , Zt] = z; let s = 0, t = 0; while (s < Zt - 1e-7) { s += (K * p) / 100 / 360; t++; } ok(nah(s, Zt, 1e-6), 'genZins zeit: geht auf volle Tage auf'); return { soll: t }; }
      case 'split': { const [KG, p1, p2, Zg] = z; ok(nah((r.num * p1) / 100 + ((KG - r.num) * p2) / 100, Zg, 1e-6), 'genZins split: Probe'); for (const o of q.options) if (!o.correct) ok(!nah((o.num * p1) / 100 + ((KG - o.num) * p2) / 100, Zg, 0.004), 'genZins split: Ablenker falsch'); return null; }
      case 'saldo': { const [t1, S, ps, t2, H, ph] = z; return { soll: Math.round(tagZ(S, ps, t1) * 100) / 100 - Math.round(tagZ(H, ph, t2) * 100) / 100, tol: 1e-6 }; }
      default: throw new Error(`genZins: ${q.kind}`);
    } },
  genParabelSach(q) { const f0 = formeln(q.prompt)[0].replace(/^[hAE]\(x\)=/, ''), f = (x) => wert(f0, { x });
    switch (q.kind) {
      case 'hoehe': return { soll: maxStelle(f, -2, 12)[1], tol: 1e-6 };
      case 'zeit': return { soll: maxStelle(f, -2, 12)[0], tol: 1e-5 };
      case 'start': return { soll: f(0) };
      case 'landung': return { soll: Math.max(...nullstellen(f, -10.0005, 20)), tol: 1e-6 };
      case 'breite': { const ns = nullstellen(f, -10.0005, 20); ok(ns.length === 2, 'genParabelSach breite: zwei Nullstellen'); return { soll: ns[1] - ns[0], tol: 1e-6 }; }
      case 'wert': return { soll: maxStelle(f, 0, 60)[1], tol: 1e-6 };
      case 'normal': return { soll: maxStelle(f, 0, 20)[1], tol: 1e-6 };
      case 'weite': { const ns = nullstellen(f, 0.00001, 80.00003, 0.01); ok(ns.length === 1 && f(0) > 0, 'genParabelSach weite: genau eine Landestelle'); return { soll: ns[0], tol: 0.00501 }; }
      case 'erloes': { const xs = maxStelle(f, 0, 60)[0], preisTerm = /^\(([^)]*)\)/.exec(f0)[1]; ok(f(xs) > f(0), 'genParabelSach erloes: Senken lohnt sich'); return { soll: wert(preisTerm, { x: xs }), tol: 1e-5 }; }
      default: throw new Error(`genParabelSach: ${q.kind}`);
    } },
  genSinussatz(q) { const z = zahlen(q.prompt.replace(/\([^()]*«[^»]*»[^()]*\)\s*$/, '')), r = q.options.find((o) => o.correct);   // die Hilfswerte in der Klammer am Ende zählen nicht mit
    const sws = (a, b, g) => dist([a, 0], [b * Math.cos(grad(g)), b * Math.sin(grad(g))]);   // Dreieck mit C im Ursprung
    const wsw = (c, al, be) => { const ta = Math.tan(grad(al)), tb = Math.tan(grad(180 - be)), x = (-tb * c) / (ta - tb); return [x, ta * x]; };   // A=(0,0), B=(c,0): Schnitt der beiden Peilstrahlen
    switch (q.kind) {
      case 'sin30': { const [a] = z; ok(nah(r.num * Math.sin(grad(30)), a, 1e-9), 'genSinussatz sin30: Gegenkathete = Hypotenuse · sin'); return { soll: a / Math.sin(grad(30)), tol: 1e-9 }; }
      case 'sinrueck': { const [a, c] = z; return { soll: (Math.asin(a / c) * 180) / Math.PI, tol: 1e-9 }; }
      case 'cos60': case 'cos120': case 'cos90': return { soll: sws(z[0], z[1], z[2]), tol: 1e-9 };
      case 'kosallg': return { soll: sws(z[0], z[1], z[2]), tol: 0.0501 };
      case 'welcher': { const s = q.prompt, soll = /eingeschlossene|alle drei/.test(s) ? 'Kosinussatz' : 'Sinussatz'; ok(r.tex === `\\text{${soll}}`, `genSinussatz welcher: ${s}`); return null; }
      case 'flaeche': { const [a, b, g] = z, Pa = [a, 0], Pb = [b * Math.cos(grad(g)), b * Math.sin(grad(g))]; return { soll: Math.abs(Pa[0] * Pb[1] - Pa[1] * Pb[0]) / 2, tol: 1e-9 }; }
      case 'sss': { const [a, b, c] = z, x = (a * a + c * c - b * b) / (2 * a), y = Math.sqrt(c * c - x * x), Cp = [0, 0], Bp = [a, 0], Ap = [a - x, y];   // B=(a,0), C=(0,0), A über Kreisschnitt: |AB|=c, |AC|=b
        ok(nah(dist(Ap, Bp), c, 1e-9) && nah(dist(Ap, Cp), b, 1e-9), 'genSinussatz sss: Dreieck gebaut'); return { soll: (Math.atan2(Ap[1], Ap[0]) * 180) / Math.PI, tol: 1e-6 }; }
      case 'sinallg': { const [al, ga, a] = z, be = 180 - al - ga, Cq = wsw(a, be, ga); return { soll: Math.hypot(Cq[0] - a, Cq[1]), tol: 0.0501 }; }   // B=(0,0), C=(a,0); gesucht |AC|
      case 'vermessung': { const [c, al, be] = z; return { soll: wsw(c, al, be)[1], tol: 0.0501 }; }
      case 'schiff': { const [v1, v2, g, t] = z; return { soll: dist([v1 * t, 0], [v2 * t * Math.cos(grad(g)), v2 * t * Math.sin(grad(g))]), tol: 0.0501 }; }
      default: throw new Error(`genSinussatz: ${q.kind}`);
    } },
};

const formen = new Map();
for (const [name, pruefe] of Object.entries(P)) {
  const fn = G[name];
  for (let lv = 1; lv <= 5; lv++) {
    seedRandom(+(process.env.SAAT || 9100) + lv);   // SAAT=… prüft eine andere Zufallsfolge
    for (let i = 0; i < 200; i++) {
      const q = fn(lv), tag = `${name} Stufe ${lv} (${q.kind}): ${glatt(q.prompt).slice(0, 90)} ${q.formula || ''}`;
      formen.set(`${name}/${q.kind}`, (formen.get(`${name}/${q.kind}`) || 0) + 1);
      const richtig = q.options.filter((o) => o.correct);
      ok(q.options.length === 4 && richtig.length === 1, `${tag}: vier Antworten, genau eine richtig`);
      ok(new Set(q.options.map((o) => o.tex)).size === 4, `${tag}: Antworten verschieden`);
      ok(q.options.every((o) => o.correct || (typeof o.why === 'string' && o.why.length > 12)), `${tag}: jeder Ablenker hat eine Begründung`);
      ok(Array.isArray(q.hints) && q.hints.length >= 2 && q.hints.every((h) => typeof h === 'string' && h.length > 5) && typeof q.explain === 'string' && q.explain.length > 5, `${tag}: Tipps und Erklärung vorhanden`);
      ok(lv < 4 || q.hints.length >= 3, `${tag}: schwere Aufgabe mit mindestens drei Rechenschritten`);
      const alles = [q.prompt, q.formula, q.explain, ...q.hints, ...q.options.flatMap((o) => [o.tex, o.why])].filter((x) => x !== undefined && x !== null).join(' ¦ ');
      ok(!/NaN|undefined|Infinity|\[object/.test(alles), `${tag}: keine kaputten Werte (${(/.{20}(NaN|undefined|Infinity|\[object).{20}/.exec(alles) || [''])[0]})`);
      ok(!/\d\.\d/.test(alles), `${tag}: Komma statt Punkt`);
      for (const x of [q.prompt, q.explain, ...q.hints, ...q.options.map((o) => o.why || '')]) ok(!/\{,\}|\\[a-zA-Z]+|\^|_\{/.test(String(x).replace(/«[^»]*»/g, '')), `${tag}: Fließtext ohne rohe Formel-Zeichen`);
      let erg;
      try { erg = pruefe(q); } catch (e) { ok(false, `${tag}: Nachrechnung gescheitert – ${e.message}`); continue; }
      if (erg) {
        const tol = erg.tol ?? 1e-6, r = richtig[0];
        ok(Number.isFinite(erg.soll) && nah(r.num, erg.soll, tol), `${tag}: richtig markiert ist ${r.num}, nachgerechnet ${erg.soll}`);
        for (const o of q.options) if (!o.correct) ok(typeof o.num === 'number' && !nah(o.num, erg.soll, Math.max(tol, 1e-6)), `${tag}: Ablenker ${o.tex} ist auch richtig (nachgerechnet ${erg.soll})`);
      }
    }
  }
}
seedRandom(null);
const ERWARTET = { genRunden: 3, genRechenregel: 11, genTeiler: 6, genRechteck: 10, genTerm: 8, genWurzel: 9, genZinseszins: 11, genQuader: 10, genStrahlensatz: 11, genVorteil: 12, genZuordnung: 9, genZins: 11, genParabelSach: 9, genSinussatz: 12 };
for (const [name, soll] of Object.entries(ERWARTET)) { const ist = [...formen.keys()].filter((k) => k.startsWith(`${name}/`)).length; ok(ist >= soll, `${name}: ${ist} Aufgaben-Formen erzeugt, erwartet mindestens ${soll}`); }
for (const [k, c] of formen) ok(c >= 20, `${k}: nur ${c}-mal erzeugt – zu selten für eine verlässliche Prüfung`);

if (fehler.length) { for (const f of fehler) console.error('FEHLER:', f); console.error(`hart/gen6b: ${fehler.length}${fehler.length >= 40 ? '+' : ''} Befunde`); process.exit(1); }
console.log(`hart/gen6b: ${n} Prüfungen bestanden`);
