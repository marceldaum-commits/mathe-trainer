globalThis.window = { katex: { renderToString: (s) => `⟦${s}⟧` } };
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
globalThis.document = { documentElement: { dataset: {} }, createElement: () => ({}), addEventListener() {} };
// Eindeutigkeit (Leitstand 18.11.2026, Marcel: „Manche Aufgaben haben zwei Wege, aber bei der Kontrolle gibt es nur einen.“):
// Für alle Erzeuger, die schweren Formen (gen10) und die Verbund-Aufgaben wird jede Antwort mathematisch ausgewertet –
// Zahlen, Brüche, Wurzeln, Terme (an Zufallsstellen), Lösungsmengen (Reihenfolge egal, ±), Punkte, Vektoren, Koordinatengleichungen
// (bis auf einen Faktor). Geprüft wird:
//   • keine falsche Antwort ist gleichwertig zur richtigen (ausgenommen ausdrücklich verlangte Formen: „vollständig kürzen“, „Hesse-Form“);
//   • bei „Stammfunktion“ ohne Bedingung unterscheidet sich keine falsche Antwort nur um eine Konstante (+C);
//   • löst eine falsche Antwort die Gleichung der Aufgabe, ist sie nicht vollständig; die richtige nennt alle Lösungen;
//   • beim Eintippen hat keine falsche Antwort denselben Zahlenwert wie die richtige.
// Aufruf: node tests/hart/eindeutig.mjs
const R = '../../app/js/';
const fs = await import('node:fs');
const { seedRandom } = await import(R + 'math.js'); const E = await import(R + 'eingabe.js');
await (await import(R + 'faul.js')).ladeAufgaben();
const REP = +(process.env.REP || 30);
let n = 0, fehler = 0; const gesehen = new Set();
const ok = (bed, text) => { n++; if (!bed && !gesehen.has(text)) { gesehen.add(text); fehler++; if (fehler <= 40) console.error('FEHLER:', text); } };

/* ───────────── kleiner Rechner: TeX → Baum → Zahl ───────────── */
function arg(s, i) { if (s[i] !== '{') return [s[i] ?? '', i + 1]; let t = 0; for (let j = i; j < s.length; j++) { if (s[j] === '{') t++; else if (s[j] === '}' && --t === 0) return [s.slice(i + 1, j), j + 1]; } throw new Error('Klammer'); }
function vorbereiten(src) {
  let s = String(src).replace(/\\text\{[^}]*\}/g, (x) => ` ${x.slice(6, -1)} `).replace(/\\(left|right|displaystyle|,|;|!|quad|qquad)/g, ' ').replace(/\\ /g, ' ').replace(/\{,\}/g, '.').replace(/(\d),(\d)/g, '$1.$2');
  s = s.replace(/\\(cdot|times)/g, '*').replace(/\\pi/g, ' π ').replace(/\\(ln|sin|cos|tan|log)\b/g, ' $1').replace(/\\(mathrm|operatorname)\{([^}]*)\}/g, '$2');
  let out = '', i = 0;
  while (i < s.length) {
    const fm = s.slice(i).match(/^\\[dt]?frac/); if (fm) { let a, b, j = i + fm[0].length; [a, j] = arg(s, j); [b, j] = arg(s, j); out += `((${vorbereiten(a)})/(${vorbereiten(b)}))`; i = j; continue; }
    if (s.startsWith('\\sqrt', i)) { let j = i + 5, k = null; if (s[j] === '[') { const e = s.indexOf(']', j); k = s.slice(j + 1, e); j = e + 1; } let a; [a, j] = arg(s, j); out += k ? `((${vorbereiten(a)})^(1/(${k})))` : `√(${vorbereiten(a)})`; i = j; continue; }
    if (s[i] === '^' || s[i] === '{') { let a, j; [a, j] = arg(s, s[i] === '^' ? i + 1 : i); out += s[i] === '^' ? `^(${vorbereiten(a)})` : `(${vorbereiten(a)})`; i = j; continue; }
    if (s[i] === '_') { let a, j; [a, j] = arg(s, i + 1); out += `_${a.replace(/\W/g, '')}`; i = j; continue; }
    out += s[i]; i++;
  }
  return out.replace(/\s+/g, ' ').trim();
}
const FN = { ln: Math.log, log: Math.log10, sin: Math.sin, cos: Math.cos, tan: Math.tan, '√': Math.sqrt };
/** Parser: liefert (vars) => Zahl und die Menge der Variablen. Implizites Malzeichen wie in der Schule (2x, 3(x+1), x e^x). */
function baue(src) {
  const s = vorbereiten(src); let i = 0; const frei = new Set();
  const ws = () => { while (s[i] === ' ') i++; };
  const sym = () => { ws(); const m = s.slice(i).match(/^(√|ln|log|sin|cos|tan|π|e(?![a-zA-Z_])|[a-zA-Z](?:_\w+)?)/); return m ? m[0] : null; };
  function summe() { let a = produkt(); for (;;) { ws(); const c = s[i]; if (c === '+' || c === '-' || c === '−') { i++; const b = produkt(), a0 = a; a = c === '+' ? (v) => a0(v) + b(v) : (v) => a0(v) - b(v); } else return a; } }
  function produkt() { let a = vorzeichen(); for (;;) { ws(); const c = s[i];
    if (c === '*' || c === '/') { i++; const b = vorzeichen(), a0 = a; a = c === '*' ? (v) => a0(v) * b(v) : (v) => a0(v) / b(v); continue; }
    if (c === '(' || /[0-9.]/.test(c ?? '') || sym()) { const b = potenz(), a0 = a; a = (v) => a0(v) * b(v); continue; }
    return a; } }
  function vorzeichen() { ws(); if (s[i] === '-' || s[i] === '−') { i++; const a = vorzeichen(); return (v) => -a(v); } if (s[i] === '+') { i++; return vorzeichen(); } return potenz(); }
  function potenz() { const a = atom(); ws(); if (s[i] === '^') { i++; const b = vorzeichenAtom(); return (v) => a(v) ** b(v); } return a; }
  function vorzeichenAtom() { ws(); if (s[i] === '-') { i++; const a = potenz(); return (v) => -a(v); } return potenz(); }
  function atom() { ws();
    if (s[i] === '(') { i++; const a = summe(); ws(); if (s[i] !== ')') throw new Error(') fehlt'); i++; return a; }
    const z = s.slice(i).match(/^\d+(\.\d+)?|^\.\d+/); if (z) { i += z[0].length; const w = +z[0]; return () => w; }
    const y = sym(); if (!y) throw new Error(`unlesbar: ${s.slice(i, i + 12)}`); i += y.length;
    if (FN[y]) { const a = y === '√' ? atom() : potenz(); return (v) => FN[y](a(v)); }
    if (y === 'π') return () => Math.PI; if (y === 'e') return () => Math.E;
    frei.add(y); return (v) => (y in v ? v[y] : NaN); }
  const f = summe(); ws(); if (i < s.length) throw new Error(`Rest: ${s.slice(i, i + 12)}`);
  return { f, frei };
}
const zahl = (t) => { const { f, frei } = baue(t); return frei.size ? NaN : f({}); };
const PUNKTE = [-1.7, 0.6, 2.3, 3.1, -0.4], ZUF = [0.83, -1.41, 2.29, -0.57, 1.73, 3.11, -2.63, 0.37, 1.19, -0.91, 2.71];
/** Wert einer Antwort zum Vergleichen – oder null (Text, Intervall, Ungleichung …). */
function wert(tex) {
  const roh = String(tex).replace(/\\,\s*\\%|\\%|\\,\s*\\text\{\s*(€|cm|m|km|kg|g|s|h|ml|l|L)\^?\d?\s*\}|\^\\circ|\^\{\\circ\}/g, '').replace(/^\s*\\approx\s*/, '').replace(/\\ln\s*(?:\\left)?\|([^|]*?)(?:\\right)?\|/g, '\\ln($1)');
  try {
    const PM = String.raw`\\begin\{pmatrix\}([\s\S]*?)\\end\{pmatrix\}`, vz = (t) => t.split('\\\\').map(zahl);
    const ger = roh.match(new RegExp(String.raw`^\s*(?:[a-z]\s*:\s*\\?\s*)?\\vec\s*\{?x\}?\s*=\s*${PM}\s*\+\s*[a-z]\s*(?:\\cdot)?\s*${PM}\s*$`));
    if (ger) { const p = vz(ger[1]), u = vz(ger[2]); return [...p, ...u].every(Number.isFinite) ? { art: 'gerade', p, u } : null; }
    const vek = roh.match(/^\s*(?:\\vec\{?\w\}?\s*=\s*)?\\begin\{pmatrix\}([\s\S]*?)\\end\{pmatrix\}\s*$/);
    if (vek) { const v = vek[1].split('\\\\').map(zahl); return v.every(Number.isFinite) ? { art: 'paar', v: `vek:${v.map((x) => +x.toPrecision(12)).join(';')}`, vek: v } : null; }
    const pkt = roh.match(/^\s*([A-Z]'?)?\s*(?:\\left)?\(([^()]*\\mid[^()]*?)(?:\\right)?\)\s*$/);
    if (pkt) { const v = pkt[2].split('\\mid').map(zahl); return v.every(Number.isFinite) ? { art: 'paar', v: `${pkt[1] || ''}pkt:${v.map((x) => +x.toPrecision(12)).join(';')}` } : null; }
    let s = roh.replace(/\\pm/g, '§'); if (/\\begin|\|| \\le|\\ge|<|>|≤|≥|\\neq|\\in|\\dots|\\binom|\\overrightarrow|\\vec/.test(s)) return null;
    s = s.replace(/\\(quad|qquad)|\\[ ,!]/g, ' ').replace(/\\;/g, ' ').replace(/^\s*[a-zA-Z](_\{?\w+\}?)?'*\s*\(\s*[a-z]\s*\)\s*=(?=[^=]*$)/, '').replace(/^\s*[A-Z]\s*:\s*/, '').replace(/^\s*(L|\\mathbb\{L\})\s*=\s*/, '').replace(/^\s*\\\{(.*)\\\}\s*$/, '$1');
    const teile = s.split(/;|\\text\{\s*(?:oder|und)\s*\}|\boder\b|\bund\b|,(?![^(){}]*[)}])/).map((t) => t.trim()).filter(Boolean);
    const lab = [], wer = [];
    for (const t of teile) {
      const mm = t.match(/^([a-zA-Z](?:_\{?\w+\}?)?)\s*=\s*([^=]+)$/);
      const pm = (u) => (u.includes('§') ? [u.replace('§', '+'), u.replace('§', '-')] : [u]);
      if (mm) { for (const u of pm(mm[2])) { lab.push(mm[1].replace(/[{}]/g, '')); wer.push(u); } continue; }
      if (/=/.test(t)) { if (teile.length > 1 || t.split('=').length !== 2) return null;
        const [a, b] = t.split('='); const A = baue(a), B = baue(b), vs = [...new Set([...A.frei, ...B.frei])].sort(); if (!vs.length || vs.some((x) => !/^[a-z](_\w+)?$/.test(x))) return null;
        const v = PUNKTE.map((p, k) => { const o = Object.fromEntries(vs.map((x, j) => [x, ZUF[(k * 7 + j * 3) % ZUF.length]])); return A.f(o) - B.f(o); });
        return v.every(Number.isFinite) ? { art: 'rel', vars: vs.join(','), v } : null; }
      for (const u of pm(t)) { lab.push(''); wer.push(u); }
    }
    if (!wer.length) return null;
    const basis = new Set(lab.map((l) => l.replace(/_\w+$/, '')));
    if (basis.size === 1 && lab.every((l) => l === lab[0] || /_\w+$/.test(l))) {
      if (wer.length === 1) { const { f, frei } = baue(wer[0]); if (frei.size === 1) { const x = [...frei][0]; const v = PUNKTE.map((p) => f({ [x]: p })); return v.filter(Number.isFinite).length >= 3 ? { art: 'fkt', var: x, v } : null; } if (frei.size) return null; }
      const v = wer.map(zahl); return v.every(Number.isFinite) ? { art: 'menge', v: [...new Set(v.map((x) => +x.toPrecision(12)))].sort((a, b) => a - b) } : null; }
    const v = lab.map((l, k) => `${l}=${+zahl(wer[k]).toPrecision(12)}`); return v.some((x) => /NaN/.test(x)) ? null : { art: 'paar', v: v.sort().join(';') };
  } catch { return null; }
}
const nah = (a, b, tol = 1e-13) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
function gleich(a, b) {
  if (!a || !b || a.art !== b.art) return false;
  if (a.art === 'gerade') return a.p.length === b.p.length && parallel(a.u, b.u) && parallel(a.u, a.p.map((x, i) => b.p[i] - x));
  if (a.art === 'paar') return a.v === b.v;
  const randnah = (v) => v.some((x) => Math.abs(x) < 1e-12 || Math.abs(x - 1) < 1e-12);   // z. B. 1−0,6^150: in Gleitkomma nicht unterscheidbar
  if (a.art === 'menge' && randnah(a.v) && randnah(b.v)) return false;
  if (a.v.length !== b.v.length || a.var !== b.var || a.vars !== b.vars) return false;
  if (a.art === 'rel') { const k = b.v[0] / a.v[0]; return Number.isFinite(k) && k !== 0 && a.v.every((x, i) => nah(x * k, b.v[i])); }
  return a.v.every((x, i) => (Number.isFinite(x) && Number.isFinite(b.v[i]) ? nah(x, b.v[i]) : Number.isFinite(x) === Number.isFinite(b.v[i])));
}
const kreuz = (a, b) => (a.length === 2 ? [a[0] * b[1] - a[1] * b[0]] : [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]);
const parallel = (a, b) => a.length === b.length && kreuz(a, b).every((x) => Math.abs(x) < 1e-9);
const nurKonstante = (a, b) => a?.art === 'fkt' && b?.art === 'fkt' && a.var === b.var && (() => { const d = a.v.map((x, i) => x - b.v[i]); return d.every(Number.isFinite) && d.every((x) => nah(x, d[0], 1e-9)) && Math.abs(d[0]) > 1e-9; })();
/** Gleichung der Aufgabe (nur aus der abgesetzten Formel): Funktion x → links − rechts, oder null. */
function gleichung(F, P) {
  if (!F || /\\begin|≤|≥|<|>|\\le|\\ge|\\neq|\\quad|,/.test(F)) return null;
  const z = String(F).split('='); if (z.length !== 2) return null;
  let [l, r] = z; if (/^\s*[a-zA-Z](_\w+)?\s*\(\s*x\s*\)\s*$/.test(l)) { if (!/Nullstelle/.test(P)) return null; l = r; r = '0'; }
  try { const A = baue(l), B = baue(r), fr = new Set([...A.frei, ...B.frei]); if (fr.size !== 1 || !fr.has('x')) return null; return (x) => A.f({ x }) - B.f({ x }); } catch { return null; }
}
function nullstellen(f) { const out = []; let a = -60, fa = f(a); for (let k = 1; k <= 12000; k++) { const b = -60 + k * 0.01, fb = f(b); if (Number.isFinite(fa) && Number.isFinite(fb) && (fa === 0 || fa * fb < 0)) { let lo = a, hi = b; for (let j = 0; j < 60; j++) { const m = (lo + hi) / 2; if (Math.sign(f(m)) === Math.sign(f(lo))) lo = m; else hi = m; } const x = (lo + hi) / 2; if (Math.abs(f(x)) < 1e-6 && !out.some((y) => Math.abs(y - x) < 1e-5)) out.push(x); } a = b; fa = fb; } return out; }
const strip = (s) => String(s ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const FORM = /vollständig|Hesse-Form|gekürzt|ausmultipliziert|faktorisiert|Scheitelpunktform|Normalform/i;   // ausdrücklich verlangte Darstellung

/* ───────────── alle Erzeuger ───────────── */
const erz = [];
for (const d of fs.readdirSync(new URL(R + 'a/', import.meta.url)).filter((f) => /^gen\d*\.js$/.test(f)).sort())
  for (const [name, fn] of Object.entries(await import(`${R}a/${d}`))) if (typeof fn === 'function' && /^gen/.test(name)) erz.push([name, fn, [1, 2, 3, 4, 5]]);
const G10 = await import(R + 'gen10.js'); for (const t of G10.THEMEN10) erz.push([`schwer_${t}`, G10.schwer(t), [4, 5]]);
const VB = await import(R + 'verbund.js'); for (const [t, fn] of Object.entries(VB.VERBUND)) erz.push([`verbund_${t}`, fn, [1, 2, 3, 4, 5]]);
let aufgaben = 0, gelesen = 0;
for (const [name, fn, stufen] of erz) for (const lv of stufen) for (let s = 1; s <= REP; s++) {
  seedRandom(s * 7919 + lv); let roh; try { roh = fn(lv); } catch { continue; }
  const liste = roh?.parts ? roh.parts.map((p) => ({ formula: roh.formula, ...p })) : [roh];
  for (const q of liste) {
    if (!q?.options || q.type) continue; aufgaben++;
    const P = strip(q.prompt), r = q.options.find((o) => o.correct); if (!r || r.tex == null) continue;
    const W = q.options.map((o) => (o.tex != null ? wert(o.tex) : null)), wr = W[q.options.indexOf(r)];
    if (wr) gelesen++;
    q.options.forEach((o, i) => { if (o.correct || !wr || !W[i]) return;
      ok(!gleich(W[i], wr) || FORM.test(P), `${name} Stufe ${lv}: zwei gleichwertige Antworten – „${P.slice(0, 80)}“ richtig ${r.tex}, auch ${o.tex}`);
      ok(!(/Richtungsvektor|Normalenvektor|Normale\b/i.test(P) && !/\\times/.test(String(q.prompt)) && wr.vek && W[i].vek && W[i].vek.some((x) => x !== 0) && parallel(wr.vek, W[i].vek)), `${name} Stufe ${lv}: ${o.tex} ist auch ein passender Vektor (Vielfaches von ${r.tex})`);
      ok(!/Stammfunktion/i.test(P) || /(Punkt|F\s*\(|Bedingung|Anfangs)/.test(`${P} ${q.formula || ''}`) || !nurKonstante(W[i], wr), `${name} Stufe ${lv}: Stammfunktion – ${o.tex} ist bis auf +C dieselbe wie ${r.tex}`); });
    const f = gleichung(q.formula, P);
    if (f && wr?.art === 'menge') {
      const ns = nullstellen(f), alle = (v) => ns.every((x) => v.some((y) => Math.abs(x - y) < 1e-4)), loest = (v) => v.every((x) => Math.abs(f(x)) < 1e-6 * Math.max(1, Math.abs(x)));
      q.options.forEach((o, i) => { if (!o.correct && W[i]?.art === 'menge') ok(!(loest(W[i].v) && alle(W[i].v)), `${name} Stufe ${lv}: falsch markierte Antwort ${o.tex} löst ${q.formula} vollständig`); });
      if (loest(wr.v) && !/(positiv|negativ|größer|kleiner|Intervall|ganzzahlig|natürlich|Definitionsbereich|einzige|\[)/i.test(P)) ok(alle(wr.v), `${name} Stufe ${lv}: ${q.formula} hat weitere Lösungen als ${r.tex}`);
    }
    const sp = E.inputSpec(q); if (sp) q.options.forEach((o) => { if (!o.correct) ok(Math.abs(o.num * sp.faktor - sp.num) > 1e-9, `${name} Stufe ${lv}: beim Eintippen hat die falsche Antwort ${o.tex} denselben Wert wie ${r.tex}`); });
  }
}
ok(aufgaben > 9000 && gelesen / aufgaben > 0.7, `Eindeutigkeit: genug Aufgaben ausgewertet (${aufgaben}, davon ${gelesen} mathematisch gelesen)`);
// Der kleine Rechner selbst
ok(gleich(wert('2(x+1)^2'), wert('2x^2+4x+2')) && !gleich(wert('2(x+1)^2'), wert('2x^2+4x+1')), 'Rechner: Terme werden als gleichwertig erkannt');
ok(gleich(wert('x_1=2;\\ x_2=-3'), wert('x=-3\\text{ oder }x=2')) && gleich(wert('x=\\pm 2'), wert('x_1=-2;\\ x_2=2')), 'Rechner: Lösungsmengen – Reihenfolge egal, ±');
ok(gleich(wert('\\dfrac{3}{4}'), wert('0{,}75')) && gleich(wert('\\sqrt{12}'), wert('2\\sqrt{3}')), 'Rechner: Bruch = Dezimalzahl, Wurzeln');
ok(gleich(wert('E:\\ 2x_1+2x_2+2x_3=6'), wert('x_1+x_2+x_3=3')) && !gleich(wert('x=5,\\ y=2'), wert('x=2,\\ y=5')), 'Rechner: Ebenen bis auf Faktor, Zahlenpaare mit Reihenfolge');
ok(nurKonstante(wert('F(x)=\\tfrac{1}{3}x^3+5'), wert('F(x)=\\tfrac{1}{3}x^3')), 'Rechner: Stammfunktionen bis auf +C');
ok(gleich(wert('\\vec x=\\begin{pmatrix}1\\\\-1\\\\0\\end{pmatrix}+t\\cdot\\begin{pmatrix}1\\\\1\\\\1\\end{pmatrix}'), wert('\\vec x=\\begin{pmatrix}2\\\\0\\\\1\\end{pmatrix}+s\\cdot\\begin{pmatrix}-2\\\\-2\\\\-2\\end{pmatrix}')), 'Rechner: dieselbe Gerade in anderer Darstellung');
console.log(fehler ? `${fehler} Fehler` : `eindeutig: ${n} Prüfungen bestanden (${aufgaben} Aufgaben, ${gelesen} mathematisch gelesen)`);
if (fehler) process.exit(1);
