// Aufgaben-Erzeuger: jede Aufgabe wird frisch gewürfelt. Falsche Antworten bilden typische Fehler ab
// und tragen eine Diagnose. Jeder Erzeuger bekommt die Schwierigkeit lv (1 = sehr leicht … 5 = sehr schwer).
// Jede Stufe ist eine eigene Aufgaben-Form: Stufe 1 ein Schritt mit glatten Zahlen, Stufe 5 mehrere verkettete Schritte.
// Der Lösungsweg (hints + explain) ist so lang, wie die Aufgabe schwer ist – geprüft in tests/stufen.mjs und tests/hart/gen1.mjs.
// Felder wie `val`, `num`, `xs`, `vec` sind die Antworten in Rechenform – für die Selbstprüfung in tests/.
import { ri, pick, shuffle, rand, ft, fmt, polyTex, polyEval, polyDeriv, vertexTex } from './math.js';
import { tex } from './ui.js';
import { mixOf } from './faul.js';

const uniq = (opts) => new Set(opts.map((o) => o.tex)).size === opts.length;
const uniqNum = (opts) => opts.every((a, i) => opts.every((b, j) => i === j || Math.abs(a.num - b.num) > 1e-6));
const par = (n) => (n < 0 ? `(${ft(n)})` : ft(n));
const vecTex = (v) => `\\begin{pmatrix}${v.map((c) => ft(c)).join('\\\\')}\\end{pmatrix}`;
const frac = (a, b) => `\\dfrac{${a}}{${b}}`;
const tier = (lv, ...vals) => vals[Math.min(vals.length, Math.max(1, lv)) - 1];

/* ───────────── Bausteine ───────────── */

const stufe = (lv) => Math.min(5, Math.max(1, Math.round(+lv) || 3));
/** Vorfaktor ohne „1“: 1 → nichts, −1 → Minus. */
const VF = (k) => (k === 1 ? '' : k === -1 ? '-' : ft(k));
/** Zahl mit Vorzeichen zum Anhängen: „+3“, „-2“. */
const vz = (n) => (n < 0 ? `-${ft(-n)}` : `+${ft(n)}`);
const xp = (e) => (e === 0 ? '' : e === 1 ? 'x' : `x^{${e}}`);
const ggT = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
/** Bruch kürzen, Nenner positiv. Brüche sind Paare [Zähler, Nenner]. */
const kuerze = (z, n) => { if (n < 0) { z = -z; n = -n; } const g = ggT(z, n); return [z / g, n / g]; };
const rAdd = ([a, b], [c, d]) => kuerze(a * d + c * b, b * d);
const rSub = ([a, b], [c, d]) => kuerze(a * d - c * b, b * d);
const rMul = ([a, b], [c, d]) => kuerze(a * c, b * d);
/** Bruch als TeX (ganze Zahlen ohne Bruchstrich). */
const bruch = (z, n = 1) => { [z, n] = kuerze(z, n); return n === 1 ? String(z) : `${z < 0 ? '-' : ''}\\dfrac{${Math.abs(z)}}{${n}}`; };
const bruchKl = (r) => (r[0] < 0 ? `\\left(${bruch(...r)}\\right)` : bruch(...r));
/** Bruch als Vorfaktor (1 → nichts) und als Summand mit Vorzeichen (0 → nichts). */
const rVF = ([z, n]) => (n === 1 ? VF(z) : `${z < 0 ? '-' : ''}\\frac{${Math.abs(z)}}{${n}}`);
const rVz = ([z, n]) => (z === 0 ? '' : `${z < 0 ? '-' : '+'}${n === 1 ? Math.abs(z) : `\\frac{${Math.abs(z)}}{${n}}`}`);
/** Bruch als Vorfaktor mit Vorzeichen zum Anhängen (±1 → nur das Zeichen). */
const rVzF = (r) => (r[1] === 1 && Math.abs(r[0]) === 1 ? (r[0] < 0 ? '-' : '+') : rVz(r));
/** Zahl als Antwort: glatt ohne Zusatz, sonst gerundet mit „≈“. */
const rundTex = (x, d = 2) => (Math.abs(x - +x.toFixed(d)) < 1e-9 ? ft(x, d) : `\\approx ${x.toFixed(d).replace('.', '{,}')}`);
/** Alle Zahlen-Antworten liegen mindestens eps auseinander. */
const fern = (opts, eps) => opts.every((a, i) => opts.every((b, j) => i === j || Math.abs(a.num - b.num) > eps));

// Summen aus Potenzen mit Bruch-Vorfaktoren: Liste aus [Zähler, Nenner, Hochzahl]. Negative Hochzahlen stehen als Bruch mit x im Nenner
// (mit pot = true als Potenz mit negativer Hochzahl).
function termeTex(ts, pot = false) {
  let out = '';
  for (const [z0, n0, e] of [...ts].sort((p, q) => q[2] - p[2])) {
    const [z, n] = kuerze(z0, n0); if (!z) continue;
    const a = Math.abs(z), sign = z < 0 ? '-' : out ? '+' : '';
    if (e < 0 && !pot) out += `${sign}\\dfrac{${a}}{${n === 1 ? '' : n}${xp(-e)}}`;
    else out += sign + (n === 1 ? (a === 1 && e !== 0 ? '' : a) : `\\frac{${a}}{${n}}`) + xp(e);
  }
  return out || '0';
}
const termeWert = (ts, x) => ts.reduce((s, [z, n, e]) => s + (z / n) * x ** e, 0);
const termeAbl = (ts) => ts.filter((t) => t[2] !== 0).map(([z, n, e]) => [...kuerze(z * e, n), e - 1]);
const termeInt = (ts) => ts.map(([z, n, e]) => [...kuerze(z, n * (e + 1)), e + 1]);   // nicht für Hochzahl −1
/** Wert an einer ganzen Stelle als gekürzter Bruch. */
const termeBruch = (ts, x) => ts.reduce((s, [z, n, e]) => rAdd(s, e >= 0 ? kuerze(z * x ** e, n) : kuerze(z, n * x ** -e)), [0, 1]);
/** Zwischenschritt der Potenzregel: „3·2x²−2·4x“ (Hochzahl mal Vorfaktor, Hochzahl um 1 kleiner). */
const potenzSchritt = (ts) => ts.filter((t) => t[2] !== 0 && t[0] !== 0).map(([z, n, e], i) => {
  const k = n === 1 ? Math.abs(z) : `\\frac{${Math.abs(z)}}{${n}}`, E = e < 0 ? `(${e})` : e;
  return `${z < 0 ? '-' : i ? '+' : ''}${e === 1 ? k : k === 1 ? `${E}${xp(e - 1)}` : `${E}\\cdot ${k}${xp(e - 1)}`}`;
}).join('');
const polyMul = (p, q) => { const r = Array(p.length + q.length - 1).fill(0); p.forEach((a, i) => q.forEach((b, j) => { r[i + j] += a * b; })); return r; };
const polyAdd = (p, q) => Array.from({ length: Math.max(p.length, q.length) }, (_, i) => (p[i] || 0) + (q[i] || 0));

/* ───────────── Analysis: Funktionen ───────────── */

/**
 * Welche Gleichung gehört zur Parabel?
 * Stufe 1: nur eine Verschiebung · 2: Scheitel mit beiden Verschiebungen · 3: zusätzlich Streckfaktor über einen zweiten Punkt ·
 * 4: Antwort in Normalform (binomische Formel) · 5: Normalform mit krummem Streckfaktor, markiert ist nur ein Punkt neben dem Scheitel.
 */
export function genScheitel(lv = 3) {
  for (;;) {
    const L = stufe(lv);
    const a = pick(tier(L, [1, -1], [1, -1], [2, -2, 0.5, -0.5], [1, -1, 2, -2], [0.5, -0.5, 1.5, -1.5, 0.25, -0.25]));
    let d = pick([-3, -2, -1, 1, 2, 3]), e = pick([-2, -1, 1, 2, 3]);
    if (L === 1) { if (rand() < 0.5) e = 0; else d = 0; }
    if (d === e) continue;
    const s = Number.isInteger(a) ? 1 : 2, px = d + s, py = e + a * s * s;     // zweiter Gitterpunkt zum Ablesen von a
    if (L >= 3 && (py < -4.5 || py > 6.5 || px > 5.5)) continue;
    const f = (x) => a * (x - d) ** 2 + e, S = tex(`S(${ft(d)}\\mid${ft(e)})`);
    const mk = (A, D, E, correct, why) => ({ tex: `f(x)=${vertexTex(A, D, E)}`, correct, why, val: (x) => A * (x - D) ** 2 + E });
    const nf = (c, correct, why) => ({ tex: `f(x)=${polyTex(c)}`, correct, why, val: (x) => polyEval(c, x) });
    const offen = `Öffnung: Bei ${tex('a>0')} ist die Parabel nach oben geöffnet, bei ${tex('a<0')} nach unten.`;
    const seite = `Vorzeichen bei der Verschiebung: In ${tex('(x-d)^2')} verschiebt ein positives ${tex('d')} nach <b>rechts</b>. Der Scheitel liegt bei ${tex(`x=${ft(d)}`)}.`;
    const lesen = `Vom Scheitel ${s === 1 ? 'einen Schritt' : 'zwei Schritte'} nach rechts geht der Graph um ${ft(Math.abs(a * s * s))} nach ${a > 0 ? 'oben' : 'unten'}`;
    const aRechnung = s === 1 ? `a=${ft(a)}` : `a=\\dfrac{${ft(a * s * s)}}{${s}^2}=${ft(a)}`;
    const binom = `(x${vz(-d)})^2=x^2${vz(-2 * d)}x+${d * d}`;
    const normal = `f(x)=${VF(a)}(x^2${vz(-2 * d)}x+${d * d})${vz(e)}=${polyTex([a * d * d + e, -2 * a * d, a])}`;
    let opts, hints, explain, prompt = 'Welche Gleichung gehört zu diesem Graphen?', mark = [d, e];
    if (L === 1) {
      opts = d !== 0
        ? [mk(a, d, 0, true), mk(a, -d, 0, false, seite), mk(-a, d, 0, false, offen), mk(a, 0, d, false, `Der Graph ist zur Seite verschoben, nicht nach oben oder unten: Der Scheitel liegt auf der x-Achse bei ${tex(`x=${d}`)}.`)]
        : [mk(a, 0, e, true), mk(a, 0, -e, false, `Die Zahl hinter ${tex('x^2')} verschiebt nach oben, wenn sie positiv ist, und nach unten, wenn sie negativ ist.`), mk(-a, 0, e, false, offen), mk(a, e, 0, false, `Der Graph ist nach oben oder unten verschoben, nicht zur Seite: Der Scheitel liegt auf der y-Achse.`)];
      hints = ['Lies den Scheitelpunkt ab – das ist der tiefste oder höchste Punkt der Parabel.', d !== 0 ? `Der Scheitel liegt bei ${S}: Die Normalparabel ist um ${Math.abs(d)} nach ${d > 0 ? 'rechts' : 'links'} verschoben.` : `Der Scheitel liegt bei ${S}: Die Normalparabel ist um ${Math.abs(e)} nach ${e > 0 ? 'oben' : 'unten'} verschoben.`];
      explain = `Scheitel ${S}, nach ${a > 0 ? 'oben' : 'unten'} geöffnet: ${tex(`f(x)=${vertexTex(a, d, e)}`)}.`;
    } else if (L === 2) {
      opts = [mk(a, d, e, true), mk(a, -d, e, false, seite), mk(-a, d, e, false, offen),
        mk(a, e, d, false, `Vertauscht: ${tex('d')} ist die Verschiebung nach rechts, ${tex('e')} die nach oben. Scheitel ${S}.`)];
      hints = ['Lies zuerst den Scheitelpunkt ab.', `Der Scheitel liegt bei ${S}.`, `In der Scheitelform ${tex('f(x)=a(x-d)^2+e')} steht ${tex('d')} mit Minus in der Klammer.`];
      explain = `Scheitelform ${tex('f(x)=a(x-d)^2+e')} mit Scheitel ${S} und ${tex(`a=${ft(a)}`)}: ${tex(`f(x)=${vertexTex(a, d, e)}`)}.`;
    } else if (L === 3) {
      opts = [mk(a, d, e, true), mk(a, -d, e, false, seite), mk(Math.sign(a), d, e, false, `Der Streckfaktor fehlt: ${lesen} – bei der Normalparabel wäre es ${s * s}.`),
        mk(1 / a, d, e, false, `Gestreckt und gestaucht verwechselt: ${lesen}, also ${tex(aRechnung)}.`)];
      hints = ['Lies zuerst den Scheitelpunkt ab.', `Der Scheitel liegt bei ${S} – das liefert ${tex(`d=${d}`)} und ${tex(`e=${e}`)} in ${tex('f(x)=a(x-d)^2+e')}.`, `Für den Streckfaktor: ${lesen}.`, `Also ${tex(aRechnung)}.`];
      explain = `Scheitel ${S} und Punkt ${tex(`P(${px}\\mid${ft(py)})`)}: ${tex(aRechnung)}. Scheitelform: ${tex(`f(x)=${vertexTex(a, d, e)}`)}.`;
    } else {
      opts = [nf([a * d * d + e, -2 * a * d, a], true),
        nf([a * d * d + e, 2 * a * d, a], false, `Vorzeichen: Der Scheitel liegt bei ${tex(`x=${d}`)}, in der Klammer steht also ${tex(`(x${vz(-d)})`)} – das mittlere Glied ist ${tex(`${VF(-2 * a * d)}x`)}.`),
        nf([e, -2 * a * d, a], false, `Beim Ausmultiplizieren fehlt das letzte Glied der binomischen Formel: ${tex(`${ft(a)}\\cdot ${d * d}`)} kommt zu ${tex(ft(e))} dazu.`),
        nf([a * d * d + e, -a * d, a], false, `Im mittleren Glied der binomischen Formel fehlt der Faktor 2: ${tex(binom)}.`)];
      if (L === 5) { prompt = `Welche Gleichung gehört zu diesem Graphen? Der markierte Punkt ${tex(`P(${px}\\mid${ft(py)})`)} liegt auf der Parabel.`; mark = [px, py]; }
      hints = [`Lies den Scheitelpunkt ab: ${S}.`, `Streckfaktor: ${lesen}${L === 5 ? ' (zum markierten Punkt)' : ''}, also ${tex(aRechnung)}.`, `Scheitelform: ${tex(`f(x)=${vertexTex(a, d, e)}`)}.`,
        `Jetzt ausmultiplizieren – binomische Formel: ${tex(binom)}.`, `Mit ${tex(ft(a))} malnehmen und ${tex(ft(e))} dazuzählen.`];
      explain = `Scheitel ${S}, ${tex(aRechnung)}, also ${tex(`f(x)=${vertexTex(a, d, e)}`)}. Mit der binomischen Formel: ${tex(normal)}.`;
    }
    if (!uniq(opts)) continue;
    return { prompt, graph: { f, view: { x0: -6, x1: 6, y0: -5, y1: 7 }, mark }, options: shuffle(opts), hints, explain, f };
  }
}

/* ───────────── Analysis: Ableiten ───────────── */

/** Lücken-Aufgabe: Potenzregel für einen einzelnen Term (ab „schwer“ auch negative Exponenten). */
export function genPotenzLuecke(lv = 3) {
  // Fünf Stufen an derselben Aufgaben-Form: 1 reine Potenz · 2 mit Vorfaktor · 3 auch negative Vorfaktoren, höherer Grad ·
  // 4 Bruch mit Potenz im Nenner (erst umschreiben) · 5 Bruch-Vorfaktor und Potenz im Nenner.
  const L = Math.min(5, Math.max(1, lv | 0 || 3));
  const a = L === 1 ? 1 : pick(tier(L, [1], [2, 3, 4, 5], [2, 3, 4, 5, 6, -2, -3, -4], [2, 3, 5, 6, -2, -4], [0.5, 1.5, 2.5, 0.25, 0.75, -0.5, -1.5, -2.5]));
  const n = L >= 4 ? -ri(L === 4 ? 1 : 2, L === 4 ? 3 : 5) : ri(L === 3 ? 3 : 2, tier(L, 4, 4, 6, 6, 7));
  const coefs = shuffle([...new Set([a * n, a, n, a * (n - 1), ...(n < 0 ? [-a * n] : [])])]);
  const exps = shuffle([...new Set([n - 1, n, n + 1])]);
  const A = a === 1 ? '' : a === -1 ? '-' : ft(a);
  const [z, nn] = { 0.5: [1, 2], 1.5: [3, 2], 2.5: [5, 2], 0.25: [1, 4], 0.75: [3, 4] }[Math.abs(a)] || [Math.abs(a), 1];
  const bruch = `${a < 0 ? '-' : ''}\\dfrac{${z}}{${nn === 1 ? '' : nn}${-n === 1 ? 'x' : `x^{${-n}}`}}`;
  const formula = `f(x)=${n < 0 ? bruch : `${A}x^{${n}}`}`;
  const hints = L === 1 ? ['Potenzregel: Der Exponent kommt als Faktor nach vorn und wird dann um 1 kleiner.']
    : L <= 3 ? ['Potenzregel: Der Exponent kommt als Faktor nach vorn.', `Vorfaktor: ${tex(`${ft(a)}\\cdot ${par(n)}`)}. Danach wird der Exponent um 1 kleiner.`, ...(L === 3 ? [`Rechne mit Vorzeichen: ${tex(`${ft(a)}\\cdot ${par(n)}=${ft(a * n)}`)}; neuer Exponent ${tex(`${n}-1=${n - 1}`)}.`] : [])]
      : [`Erst umschreiben: Eine Potenz im Nenner ist eine Potenz mit negativem Exponenten. ${tex(`${formula}=${A}x^{${n}}`)}${nn > 1 ? ` (denn ${tex(`\\tfrac{${z}}{${nn}}=${ft(Math.abs(a))}`)})` : ''}.`, 'Potenzregel: Der Exponent kommt als Faktor nach vorn – mit seinem Minuszeichen.', `Vorfaktor: ${tex(`${ft(a)}\\cdot ${par(n)}=${ft(a * n)}`)}.`, `Der Exponent wird um 1 kleiner: ${tex(`${n}-1=${n - 1}`)} – bei negativen Exponenten wächst also der Betrag.`, ...(L === 5 ? [`Kontrolle als Bruch: ${tex(`f'(x)=${VF(a * n)}x^{${n - 1}}=${a * n < 0 ? '-' : ''}\\dfrac{${ft(Math.abs(a * n))}}{x^{${1 - n}}}`)}.`] : [])];
  return {
    type: 'gap',
    prompt: 'Leite ab. Wähle Vorfaktor und Exponent.',
    formula,
    slots: [
      { label: 'Vorfaktor', choices: coefs, correct: a * n },
      { label: 'Exponent', choices: exps, correct: n - 1 },
    ],
    show: (c, e) => `f'(x)=${c === null ? '\\square' : ft(c)}\\,x^{${e === null ? '\\square' : e}}`,
    hints,
    explain: L === 1 ? `${tex(`f'(x)=${n}x^{${n - 1}}`)}.`
      : n < 0 ? `Umschreiben: ${tex(`f(x)=${A}x^{${n}}`)}. Potenzregel: ${tex(`f'(x)=${ft(a)}\\cdot ${par(n)}\\,x^{${n}-1}=${VF(a * n)}x^{${n - 1}}`)}.`
        : `Potenzregel: ${tex("(x^n)'=n\\,x^{n-1}")}, also ${tex(`f'(x)=${ft(a)}\\cdot ${par(n)}\\,x^{${n}-1}=${ft(a * n)}x^{${n - 1}}`)}.`,
    f: (x) => a * x ** n, val: (x) => a * n * x ** (n - 1),
  };
}

/**
 * Auswahl-Aufgabe: Summen von Potenzen ableiten.
 * Stufe 1: eine Potenz plus Zahl · 2: drei Summanden · 3: Grad 3–4 mit Minuszeichen · 4: Bruch-Vorfaktoren, Grad 4–5 ·
 * 5: erst umformen (Bruch gliedweise teilen → negative Hochzahlen, oder Produkt ausmultiplizieren), dann ableiten.
 */
export function genPolynom(lv = 3) {
  for (;;) {
    const L = stufe(lv);
    const mk = (t, correct, why) => ({ tex: `f'(x)=${termeTex(t)}`, correct, why, val: (x) => termeWert(t, x) });
    const POT = tex("(x^n)'=n\\,x^{n-1}");
    let ts, formula, opts, hints, explain;
    if (L === 5 && rand() < 0.5) {
      // (a·x^(r+m) + b·x^(r+1) + d) : (k·x^r)  =  a/k·x^m + b/k·x + d/k·x^(−r)
      const r = ri(2, 3), m = ri(2, 3), k = pick([2, 3, 4]), a = pick([1, 2, 3, 5, -1, -2]), b = pick([-5, -3, -1, 1, 3, 4, 7]), d = pick([-6, -4, -3, 2, 3, 5, 8]);
      const zaehler = Array(r + m + 1).fill(0); zaehler[r + m] = a; zaehler[r + 1] = b; zaehler[0] = d;
      ts = [[a, k, m], [b, k, 1], [d, k, -r]];
      const right = termeAbl(ts);
      formula = `f(x)=\\dfrac{${polyTex(zaehler)}}{${k}x^{${r}}}`;
      opts = [mk(right, true),
        mk([[a * (r + m), k * r, m], [b * (r + 1), k * r, 1]], false, 'Zähler und Nenner wurden einzeln abgeleitet – so eine Regel gibt es nicht. Erst jeden Summanden des Zählers durch den Nenner teilen, dann ableiten.'),
        mk([[a * m, k, m - 1], [b, k, 0], [-r * d, k, -r + 1]], false, `Auch eine negative Hochzahl wird beim Ableiten um 1 kleiner: Aus ${tex(`x^{-${r}}`)} wird ${tex(`x^{-${r + 1}}`)}, nicht ${tex(`x^{-${r - 1}}`)}.`),
        mk([[a * m, 1, m - 1], [b, 1, 0], [-r * d, 1, -r - 1]], false, `Die ${k} im Nenner fehlt: Jeder Summand wird durch ${tex(`${k}x^{${r}}`)} geteilt, nicht nur durch ${tex(`x^{${r}}`)}.`)];
      hints = [`Schreibe den Bruch als Summe: Teile jeden Summanden des Zählers durch ${tex(`${k}x^{${r}}`)}.`, `${tex(`f(x)=${termeTex(ts, true)}`)} – ein ${tex('x')} im Nenner wird zu einer negativen Hochzahl.`,
        `Summenregel: Jeden Summanden einzeln ableiten; der Bruch davor bleibt als Faktor stehen (Faktorregel).`, `Die Potenzregel gilt auch für negative Hochzahlen: ${tex(`(x^{-${r}})'=-${r}\\,x^{-${r + 1}}`)}.`,
        `Brüche kürzen und ${tex(`x^{-${r + 1}}`)} wieder als Bruch schreiben.`];
      explain = `Erst teilen: ${tex(`f(x)=${termeTex(ts, true)}`)}. Dann mit Summen-, Faktor- und Potenzregel: ${tex(`f'(x)=${potenzSchritt(ts)}=${termeTex(right)}`)}.`;
    } else if (L === 5) {
      // (a·x² + b)(c·x² + d·x + e) erst ausmultiplizieren
      const a = pick([2, 3, 4, -2]), b = pick([-5, -3, 1, 3, 7]), c = pick([1, 2, 3, -1]), d = pick([-4, -1, 2, 3, 5]), e = pick([-6, -2, 1, 4]);
      if (e === -d) continue;   // sonst heben sich b·d und b·e im Ablenker auf
      ts = [[a * c, 1, 4], [a * d, 1, 3], [a * e + b * c, 1, 2], [b * d, 1, 1], [b * e, 1, 0]];
      const right = termeAbl(ts), U = polyTex([b, 0, a]), V = polyTex([e, d, c]);
      formula = `f(x)=(${U})(${V})`;
      opts = [mk(right, true),
        mk([[4 * a * c, 1, 2], [2 * a * d, 1, 1]], false, `Das ist ${tex("u'\\cdot v'")} – so darf man ein Produkt nicht ableiten. Erst ausmultiplizieren (oder die Produktregel nehmen).`),
        mk([[4 * a * c, 1, 3], [3 * a * d, 1, 2], [2 * a * e, 1, 1], [b * d, 1, 0]], false, `Beim Ausmultiplizieren fehlt ein Produkt: Auch ${tex(`${par(b)}\\cdot ${c < 0 ? `(${VF(c)}x^2)` : `${VF(c)}x^2`}`)} gehört zu den Gliedern mit ${tex('x^2')}.`),
        mk([...right.filter((t) => t[2] !== 0), [b * d + b * e, 1, 0]], false, `Die Zahl ${tex(ft(b * e))} ohne ${tex('x')} fällt beim Ableiten weg.`)];
      hints = ['Multipliziere zuerst aus: jeder Summand der ersten Klammer mal jeder Summand der zweiten – das gibt sechs Produkte.', `Glieder mit gleicher Hochzahl zusammenfassen: ${tex(`${termeTex([[a * e, 1, 2]])}${b * c < 0 ? '-' : '+'}${termeTex([[Math.abs(b * c), 1, 2]])}=${termeTex([[a * e + b * c, 1, 2]])}`)}.`, `${tex(`f(x)=${termeTex(ts)}`)}.`,
        `Jetzt jeden Summanden einzeln ableiten (Summenregel) – mit der Potenzregel ${POT}.`, `Die Zahl ${tex(ft(b * e))} ohne ${tex('x')} fällt weg.`];
      explain = `Ausmultiplizieren: ${tex(`f(x)=${termeTex(ts)}`)}. Summandenweise mit der Potenzregel: ${tex(`f'(x)=${potenzSchritt(ts)}=${termeTex(right)}`)}.`;
    } else {
      if (L === 1) ts = [[pick([1, 2, 3]), 1, ri(2, 3)], [pick([1, 2, 3, 5]), 1, 0]];
      else if (L === 2) { const n = ri(2, 3); ts = [[pick([1, 2, 3]), 1, n], [pick([2, 3, 4]), 1, ri(1, n - 1)], [pick([1, 2, 3, 5, 7]), 1, 0]]; }
      else if (L === 3) {
        const n = ri(3, 4), e2 = ri(1, n - 1), e3 = pick([1, 2, 3].filter((e) => e < n && e !== e2));
        ts = [[pick([1, 2, 3, -1, -2]), 1, n], [pick([2, 3, 4, 5, -2, -3, -4]), 1, e2], [pick([1, 2, 3, 5, 7, -1, -4]), 1, 0]];
        if (n === 4 || rand() < 0.5) ts.push([pick([-6, 7, -1, 4]), 1, e3]);
      } else {
        const n = ri(4, 5), [e2, e3] = shuffle([1, 2, 3, 4].filter((e) => e < n)), B = [[1, 2], [1, 3], [2, 3], [3, 2], [1, 4], [3, 4], [5, 2], [2, 5], [1, 6], [5, 3]];
        const b1 = pick(B), b2 = pick(B);
        ts = [[b1[0] * pick([1, -1]), b1[1], n], [b2[0] * pick([1, -1]), b2[1], e2], [pick([2, 3, 4, 5, 7, -2, -3, -6]), 1, e3], [pick([1, 2, 3, 5, 7, -1, -4]), 1, 0]];
      }
      ts.sort((p, q) => q[2] - p[2]);
      const right = termeAbl(ts), c0 = ts.find((t) => t[2] === 0), mit = ts.filter((t) => t[2] !== 0);
      formula = `f(x)=${termeTex(ts)}`;
      opts = [mk(right, true),
        mk(mit.map(([z, n, e]) => [z * e, n, e]), false, `Der Exponent muss um 1 kleiner werden: ${POT}.`),
        mk(mit.map(([z, n, e]) => [z, n, e - 1]), false, 'Der alte Exponent fehlt als Faktor vor dem Term.'),
        mk([...right, c0], false, `Eine Konstante fällt beim Ableiten weg: ${tex(`(${c0[0]})'=0`)}.`)];
      const erster = `${tex(`(${termeTex([ts[0]])})'=${potenzSchritt([ts[0]])}${termeTex(termeAbl([ts[0]])) === potenzSchritt([ts[0]]) ? '' : `=${termeTex(termeAbl([ts[0]]))}`}`)}`;
      hints = L === 1 ? ['Potenzregel: Die Hochzahl kommt als Faktor nach vorn und wird dann um 1 kleiner.', `Die Zahl ${tex(String(c0[0]))} ohne ${tex('x')} fällt beim Ableiten weg.`]
        : L === 2 ? ['Leite jeden Summanden einzeln ab (Summenregel).', `Potenzregel: ${POT}.`, 'Was passiert mit der Zahl ohne x? Sie fällt weg.']
          : L === 3 ? [`Leite jeden Summanden einzeln ab (Summenregel)${ts.some((t) => t[0] < 0) ? ' – achte auf die Minuszeichen' : ''}.`, `Potenzregel: ${POT}. Erster Summand: ${erster}.`, `${ts.some((t) => t[2] === 1) ? `Aus ${tex('x')} allein wird 1, die` : 'Die'} Zahl ohne ${tex('x')} fällt weg.`]
            : ['Summenregel: Leite jeden Summanden einzeln ab.', `Faktorregel: Ein Bruch vor der Potenz bleibt als Faktor stehen und wird mit der Hochzahl malgenommen (Potenzregel ${POT}).`, `Erster Summand: ${erster} – Brüche kürzen.`, `Die Zahl ohne ${tex('x')} fällt weg.`];
      explain = L === 1 ? `Potenzregel: ${tex(`f'(x)=${potenzSchritt(ts)}${potenzSchritt(ts) === termeTex(right) ? '' : `=${termeTex(right)}`}`)}. Die Zahl ${tex(String(c0[0]))} fällt weg.`
        : `Summandenweise mit der ${L >= 4 ? 'Potenz- und Faktorregel' : 'Potenzregel'}: ${tex(`f'(x)=${potenzSchritt(ts)}${potenzSchritt(ts) === termeTex(right) ? '' : `=${termeTex(right)}`}`)}.`;
    }
    if (!uniq(opts)) continue;
    return { prompt: 'Welche Ableitung ist richtig?', formula, options: shuffle(opts), hints, explain, f: (x) => termeWert(ts, x) };
  }
}

/**
 * Auswahl-Aufgabe: Kettenregel.
 * Stufe 1: (ax+b)^n mit kleinen Zahlen · 2: größere Hochzahl, Minuszeichen · 3: zusätzlich Vorfaktor ·
 * 4: innen eine Potenz (ax²+b bzw. ax³+b) · 5: erst umschreiben – Bruch mit Klammer-Potenz im Nenner oder Wurzel.
 */
export function genKette(lv = 3) {
  for (;;) {
    const L = stufe(lv);
    let formula, opts, hints, explain, f;
    const hoch = (e) => (e === 1 ? '' : `^{${e}}`);
    if (L <= 3) {
      const a = pick(tier(L, [2, 3, 4, 5], [2, 3, 4, 5, -2], [2, 3, 4, 5, -2, -3, -4])), n = ri(tier(L, 2, 3, 3), tier(L, 3, 5, 6));
      const b = pick(L === 1 ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 5, -1, -2, -4]), c = L === 3 ? pick([2, 3, 5, -2, -3]) : 1;
      if (a === n) continue;
      const inner = `(${polyTex([b, a])})`;
      const mk = (k, e, correct, why) => ({ tex: `f'(x)=${VF(k)}${inner}${hoch(e)}`, correct, why, val: (x) => k * (a * x + b) ** e });
      opts = [mk(c * n * a, n - 1, true),
        mk(c * n, n - 1, false, `Die innere Ableitung fehlt: ${tex(`(${polyTex([b, a])})'=${ft(a)}`)} muss als Faktor dazu (Kettenregel).`),
        mk(c * n * a, n, false, 'Der Exponent der äußeren Funktion muss um 1 kleiner werden.'),
        mk(c * a, n - 1, false, 'Der alte Exponent fehlt als Faktor: äußere Ableitung mal innere Ableitung.')];
      formula = `f(x)=${VF(c)}${inner}^{${n}}`;
      hints = L === 1 ? [`Außen steht „hoch ${n}“, innen die Klammer – das ist eine Verkettung.`, `Kettenregel: äußere Ableitung mal innere Ableitung. Die innere Ableitung ist ${tex(ft(a))}.`]
        : ['Hier steckt eine Funktion in einer anderen: außen „hoch n“, innen die Klammer.', 'Kettenregel: äußere Ableitung mal innere Ableitung.', `Innere Ableitung: ${tex(`(${polyTex([b, a])})'=${ft(a)}`)}.`];
      if (L === 3) hints.push(`Der Vorfaktor ${tex(ft(c))} bleibt stehen (Faktorregel): ${tex(`${par(c)}\\cdot ${n}\\cdot ${par(a)}=${ft(c * n * a)}`)}.`);
      explain = `Kettenregel: ${tex(`f'(x)=${c === 1 ? '' : `${par(c)}\\cdot`}${n}\\cdot ${inner}${hoch(n - 1)}\\cdot ${par(a)}=${VF(c * n * a)}${inner}${hoch(n - 1)}`)}.`;
      f = (x) => c * (a * x + b) ** n;
    } else if (L === 4) {
      const p = ri(2, 3), a = pick([1, 2, 3, -1, -2]), b = pick([1, 2, 3, 5, -1, -4]), n = ri(3, 5), c = pick([1, 1, 2, 3, -2]);
      const co = Array(p + 1).fill(0); co[p] = a; co[0] = b;
      const I = polyTex(co), inner = `(${I})`, dI = polyTex(polyDeriv(co)), k = c * n * a * p;
      const mk = (kk, xe, e, correct, why) => ({ tex: `f'(x)=${VF(kk)}${xp(xe)}${inner}${hoch(e)}`, correct, why, val: (x) => kk * x ** xe * (a * x ** p + b) ** e });
      opts = [mk(k, p - 1, n - 1, true),
        mk(c * n, 0, n - 1, false, `Die innere Ableitung fehlt: ${tex(`(${I})'=${dI}`)} muss als Faktor dazu (Kettenregel).`),
        mk(k, 0, n - 1, false, `Die innere Ableitung ist ${tex(dI)} – der Faktor ${tex(xp(p - 1))} fehlt.`),
        mk(k, p - 1, n, false, 'Der Exponent der äußeren Funktion muss um 1 kleiner werden.')];
      formula = `f(x)=${VF(c)}${inner}^{${n}}`;
      hints = [`Außen „hoch ${n}“, innen ${tex(I)} – ein Fall für die Kettenregel.`, `Äußere Ableitung: ${tex(`${c === 1 ? '' : `${par(c)}\\cdot`}${n}\\cdot ${inner}^{${n - 1}}`)} – die Klammer bleibt unverändert.`,
        `Innere Ableitung mit der Potenzregel: ${tex(`(${I})'=${dI}`)}.`, `Malnehmen und die Zahlen zusammenfassen: ${tex(`${c === 1 ? '' : `${par(c)}\\cdot`}${n}\\cdot ${par(a * p)}=${ft(k)}`)}.`];
      explain = `Kettenregel: ${tex(`f'(x)=${c === 1 ? '' : `${par(c)}\\cdot`}${n}\\cdot ${inner}^{${n - 1}}\\cdot ${a * p < 0 || a * p === 1 ? `(${dI})` : dI}=${VF(k)}${xp(p - 1)}${inner}^{${n - 1}}`)}.`;
      f = (x) => c * (a * x ** p + b) ** n;
    } else if (rand() < 0.5) {
      // c / (ax²+b)^n = c·(ax²+b)^(−n)
      const a = pick([1, 2, 3]), b = pick([1, 2, 3, 5]), n = ri(2, 3), c = pick([1, 2, 3, 5, -2, -4]), I = polyTex([b, 0, a]), inner = `(${I})`, k = -2 * a * c * n, cT = c === 1 ? '' : `${par(c)}\\cdot`;
      const br = (z, mitX, e) => `${z < 0 ? '-' : ''}\\dfrac{${Math.abs(z) === 1 && mitX ? '' : Math.abs(z)}${mitX ? 'x' : ''}}{${inner}${hoch(e)}}`;
      const mk = (z, mitX, e, correct, why) => ({ tex: `f'(x)=${br(z, mitX, e)}`, correct, why, val: (x) => (z * (mitX ? x : 1)) / (a * x * x + b) ** e });
      opts = [mk(k, true, n + 1, true),
        mk(k, true, n - 1, false, `Die Hochzahl ${tex(`-${n}`)} wird um 1 kleiner: Das gibt ${tex(`-${n + 1}`)}, im Nenner steht also „hoch ${n + 1}“.`),
        mk(-c * n, false, n + 1, false, `Die innere Ableitung fehlt: ${tex(`(${I})'=${2 * a}x`)} muss als Faktor dazu (Kettenregel).`),
        mk(-k, true, n + 1, false, `Vorzeichen: Die Hochzahl ${tex(`-${n}`)} kommt als Faktor nach vorn – mit ihrem Minus.`)];
      formula = `f(x)=${br(c, false, n)}`;
      hints = [`Schreibe den Bruch als Potenz: ${tex(`f(x)=${VF(c)}${inner}^{-${n}}`)}.`, `Kettenregel – äußere Ableitung: ${tex(`${cT}(-${n})\\cdot ${inner}^{-${n + 1}}`)}.`,
        `Innere Ableitung: ${tex(`(${I})'=${2 * a}x`)}.`, `Malnehmen: ${tex(`${cT}(-${n})\\cdot ${2 * a}x=${k}x`)}. Die negative Hochzahl wieder als Nenner schreiben.`];
      explain = `Umschreiben: ${tex(`f(x)=${VF(c)}${inner}^{-${n}}`)}. Kettenregel: ${tex(`f'(x)=${cT}(-${n})\\cdot ${inner}^{-${n + 1}}\\cdot ${2 * a}x=${br(k, true, n + 1)}`)}.`;
      f = (x) => c / (a * x * x + b) ** n;
    } else {
      // c·√(ax²+b)
      const a = pick([1, 2, 3, 5]), b = pick([1, 2, 3, 4, 7]), c = pick([1, 2, 3, 4, -1, -2]), I = polyTex([b, 0, a]), W = `\\sqrt{${I}}`, k = c * a;
      const kx = (z) => `${Math.abs(z) === 1 ? '' : Math.abs(z)}x`, [hz, hn] = kuerze(c, 2);
      const mk = (t, val, correct, why) => ({ tex: `f'(x)=${t}`, correct, why, val });
      const w = (x) => Math.sqrt(a * x * x + b);
      opts = [mk(`${k < 0 ? '-' : ''}\\dfrac{${kx(k)}}{${W}}`, (x) => (k * x) / w(x), true),
        mk(`${hz < 0 ? '-' : ''}\\dfrac{${Math.abs(hz)}}{${hn === 1 ? '' : hn}${W}}`, (x) => c / (2 * w(x)), false, `Die innere Ableitung fehlt: ${tex(`(${I})'=${2 * a}x`)} muss als Faktor dazu (Kettenregel).`),
        mk(`${k < 0 ? '-' : ''}\\dfrac{${kx(2 * k)}}{${W}}`, (x) => (2 * k * x) / w(x), false, `Der Faktor ${tex('\\tfrac{1}{2}')} aus der Ableitung der Wurzel fehlt: ${tex("(\\sqrt{u})'=\\dfrac{1}{2\\sqrt{u}}")}.`),
        mk(`${k < 0 ? '-' : ''}${kx(k)}\\,${W}`, (x) => k * x * w(x), false, `Die Hochzahl ${tex('\\tfrac{1}{2}')} wird um 1 kleiner, also ${tex('-\\tfrac{1}{2}')}: Die Wurzel wandert in den Nenner.`)];
      formula = `f(x)=${VF(c)}${W}`;
      hints = [`Schreibe die Wurzel als Potenz: ${tex(`f(x)=${VF(c)}(${I})^{\\frac{1}{2}}`)}.`, `Kettenregel – äußere Ableitung: ${tex(`${par(c)}\\cdot\\tfrac{1}{2}\\cdot(${I})^{-\\frac{1}{2}}=\\dfrac{${c}}{2${W}}`)}.`,
        `Innere Ableitung: ${tex(`(${I})'=${2 * a}x`)}.`, `Malnehmen – die 2 kürzt sich: ${tex(`\\dfrac{${c}\\cdot ${2 * a}x}{2${W}}`)}.`];
      explain = `Mit ${tex("(\\sqrt{u})'=\\dfrac{1}{2\\sqrt{u}}")} und der Kettenregel: ${tex(`f'(x)=\\dfrac{${c}}{2${W}}\\cdot ${2 * a}x=${k < 0 ? '-' : ''}\\dfrac{${kx(k)}}{${W}}`)}.`;
      f = (x) => c * w(x);
    }
    if (!uniq(opts)) continue;
    return { prompt: 'Welche Ableitung ist richtig?', formula, options: shuffle(opts), hints, explain, f };
  }
}

/**
 * Auswahl-Aufgabe: e-Funktionen ableiten.
 * Stufe 1: e^{kx} · 2: mit Vorfaktor und negativem k · 3: Summe aus e-Funktion und Potenz · 4: quadratischer Exponent plus linearer Summand ·
 * 5: doppelte Verkettung c·(e^{ax}+bx)^n, die innere Ableitung ist selbst eine Summe.
 */
export function genExp(lv = 3) {
  for (;;) {
    const L = stufe(lv);
    let formula, opts, hints, explain, f;
    const mk = (t, val, correct, why) => ({ tex: `f'(x)=${t}`, correct, why, val });
    if (L <= 3) {
      const k = pick(tier(L, [2, 3, 4, 5, 6, 7, 8, 9], [2, 3, 4, -2, -3, -5], [2, 3, 4, -2, -3, -4])), c = L === 1 ? 1 : pick([2, 3, 4, 5, -2, -3]);
      const kxT = `${VF(k)}x`, E = `e^{${kxT}}`;
      const m = L === 3 ? pick([1, 2, 3, -1, -2, -4]) : 0, p = ri(2, 3);
      const rest = m ? `${m < 0 ? '-' : '+'}${Math.abs(m) === 1 ? '' : Math.abs(m)}x^{${p}}` : '', dRest = m ? `${m < 0 ? '-' : '+'}${Math.abs(m * p)}${xp(p - 1)}` : '';
      const R = (x) => m * x ** p, dR = (x) => m * p * x ** (p - 1);
      opts = [mk(`${VF(c * k)}${E}${dRest}`, (x) => c * k * Math.exp(k * x) + dR(x), true),
        mk(`${VF(c)}${E}${dRest}`, (x) => c * Math.exp(k * x) + dR(x), false, `Die innere Ableitung fehlt: ${tex(`(${kxT})'=${ft(k)}`)} kommt als Faktor dazu.`),
        mk(`${VF(c * k)}x\\,e^{${kxT}-1}${dRest}`, (x) => c * k * x * Math.exp(k * x - 1) + dR(x), false, `Das wäre die Potenzregel. Bei ${tex('e^x')} steht ${tex('x')} im Exponenten – ${tex('e^x')} bleibt beim Ableiten ${tex('e^x')}.`),
        mk(`${rVF(kuerze(c, k))}${E}${dRest}`, (x) => (c / k) * Math.exp(k * x) + dR(x), false, 'Durch den Faktor zu teilen gehört zum Integrieren, nicht zum Ableiten.')];
      formula = `f(x)=${VF(c)}${E}${rest}`;
      hints = L === 1 ? [`${tex('e^x')} abgeleitet ist wieder ${tex('e^x')}.`, `Im Exponenten steht ${tex(kxT)} – die innere Ableitung ${tex(ft(k))} kommt als Faktor dazu (Kettenregel).`]
        : L === 2 ? [`${tex('e^x')} abgeleitet ist wieder ${tex('e^x')}.`, 'Im Exponenten steht nicht nur x – denk an die Kettenregel.', `Innere Ableitung: ${tex(`(${kxT})'=${ft(k)}`)}; der Vorfaktor ${tex(ft(c))} bleibt stehen: ${tex(`${par(c)}\\cdot ${par(k)}=${ft(c * k)}`)}.`]
          : ['Summenregel: Leite beide Summanden einzeln ab.', `Erster Summand mit der Kettenregel: ${tex(`(${VF(c)}${E})'=${par(c)}\\cdot ${par(k)}\\cdot ${E}=${VF(c * k)}${E}`)}.`, `Zweiter Summand mit der Potenzregel: ${tex(`(${VF(m)}x^{${p}})'=${ft(m * p)}${xp(p - 1)}`)}.`];
      explain = L === 3 ? `Summen-, Ketten- und Potenzregel: ${tex(`f'(x)=${par(c)}\\cdot ${par(k)}\\cdot ${E}${m < 0 ? '-' : '+'}${Math.abs(m) === 1 ? '' : `${Math.abs(m)}\\cdot `}${p}${xp(p - 1)}=${VF(c * k)}${E}${dRest}`)}.`
        : `Kettenregel: ${tex(`f'(x)=${VF(c)}${E}\\cdot ${par(k)}=${VF(c * k)}${E}`)}.`;
      f = (x) => c * Math.exp(k * x) + R(x);
    } else if (L === 4) {
      const a = pick([1, 2, 3, -1, -2]), b = pick([1, 2, 3, -1, -3, -4]), c = pick([1, 2, 3, -2]), m = pick([2, 3, 5, -1, -4]), I = polyTex([0, b, a]), E = `e^{${I}}`, dI = polyTex([b, 2 * a]);
      const ex = (x) => Math.exp(a * x * x + b * x), rest = `${m < 0 ? '-' : '+'}${Math.abs(m) === 1 ? '' : Math.abs(m)}x`, dRest = vz(m);
      opts = [mk(`(${polyTex([c * b, 2 * a * c])})\\,${E}${dRest}`, (x) => c * (2 * a * x + b) * ex(x) + m, true),
        mk(`${VF(c)}${E}${dRest}`, (x) => c * ex(x) + m, false, `Die innere Ableitung fehlt: ${tex(`(${I})'=${dI}`)} kommt als Faktor dazu (Kettenregel).`),
        mk(`(${polyTex([c * b, a * c])})\\,${E}${dRest}`, (x) => c * (a * x + b) * ex(x) + m, false, `Innere Ableitung mit der Potenzregel: ${tex(`(${VF(a)}x^2)'=${2 * a}x`)} – der Faktor 2 fehlt.`),
        mk(`${VF(c)}e^{${dI}}${dRest}`, (x) => c * Math.exp(2 * a * x + b) + m, false, 'Der Exponent bleibt beim Ableiten unverändert – die innere Ableitung kommt als Faktor davor, nicht in den Exponenten.')];
      formula = `f(x)=${VF(c)}${E}${rest}`;
      hints = [`Summenregel: Leite beide Summanden einzeln ab; aus ${tex(`${VF(m)}x`)} wird ${tex(ft(m))}.`, `Im ersten Summanden steht außen die e-Funktion, innen ${tex(I)} – Kettenregel: ${tex(`${VF(c)}${E}`)} bleibt stehen.`, `Innere Ableitung mit der Potenzregel: ${tex(`(${I})'=${dI}`)}.`,
        c === 1 ? 'Äußere mal innere Ableitung – die innere Ableitung als Klammer davor schreiben.' : `Äußere mal innere Ableitung, dann ${tex(ft(c))} in die Klammer malnehmen: ${tex(`${par(c)}\\cdot (${dI})=${polyTex([c * b, 2 * a * c])}`)}.`];
      explain = `Summen- und Kettenregel: ${tex(`f'(x)=${VF(c)}${E}\\cdot (${dI})${dRest}=(${polyTex([c * b, 2 * a * c])})\\,${E}${dRest}`)}.`;
      f = (x) => c * ex(x) + m * x;
    } else {
      // doppelte Verkettung: c·(e^{ax} + b·x)^n – die innere Ableitung ist selbst eine Summe mit Kettenregel
      const a = pick([2, 3, -1, -2, -3]), b = pick([1, 2, 3, -1, -2]), n = ri(2, 4), c = pick([1, 2, 3, -2, 0.5, 1.5]), E = `e^{${VF(a)}x}`, I = `${E}${b < 0 ? '-' : '+'}${Math.abs(b) === 1 ? '' : Math.abs(b)}x`, inner = `(${I})`, k = c * n;
      const hoch = (e) => (e === 1 ? '' : `^{${e}}`), u = (x) => Math.exp(a * x) + b * x, dI = `${VF(a)}${E}${vz(b)}`;
      opts = [mk(`${VF(k)}(${dI})${inner}${hoch(n - 1)}`, (x) => k * (a * Math.exp(a * x) + b) * u(x) ** (n - 1), true),
        mk(`${VF(k)}(${E}${vz(b)})${inner}${hoch(n - 1)}`, (x) => k * (Math.exp(a * x) + b) * u(x) ** (n - 1), false, `In ${tex(E)} steckt noch eine Verkettung: ${tex(`(${E})'=${VF(a)}${E}`)} – der Faktor ${tex(ft(a))} fehlt.`),
        mk(`${VF(k)}${inner}${hoch(n - 1)}`, (x) => k * u(x) ** (n - 1), false, `Die innere Ableitung fehlt: ${tex(`(${I})'=${dI}`)} muss als Faktor dazu (Kettenregel).`),
        mk(`${VF(k * a)}${E}${inner}${hoch(n - 1)}`, (x) => k * a * Math.exp(a * x) * u(x) ** (n - 1), false, `In der inneren Ableitung fehlt der zweite Summand: ${tex(`(${VF(b)}x)'=${ft(b)}`)}, also ${tex(`(${I})'=${dI}`)}.`)];
      formula = `f(x)=${VF(c)}${inner}^{${n}}`;
      hints = [`Zwei Verkettungen: außen „hoch ${n}“, innen ${tex(I)} – und in ${tex(E)} steckt noch ${tex(`${VF(a)}x`)}.`, `Äußere Ableitung: ${tex(`${par(c)}\\cdot ${n}\\cdot ${inner}${hoch(n - 1)}=${VF(k)}${inner}${hoch(n - 1)}`)}.`,
        `Innere Ableitung mit der Summenregel – für ${tex(E)} wieder die Kettenregel: ${tex(`(${E})'=${VF(a)}${E}`)}.`, `Also ${tex(`(${I})'=${dI}`)}.`, 'Äußere mal innere Ableitung – die innere Ableitung bleibt als Klammer stehen.'];
      explain = `Kettenregel, zweimal angewendet: ${tex(`f'(x)=${par(c)}\\cdot ${n}\\cdot ${inner}${hoch(n - 1)}\\cdot (${dI})=${VF(k)}(${dI})${inner}${hoch(n - 1)}`)}.`;
      f = (x) => c * u(x) ** n;
    }
    if (!uniq(opts)) continue;
    return { prompt: 'Welche Ableitung ist richtig?', formula, options: shuffle(opts), hints, explain, f };
  }
}

/**
 * Auswahl-Aufgabe: Produktregel bei u(x)·e^{w(x)}.
 * Stufe 1: ax·e^x · 2: (ax+b)·e^x · 3: (ax+b)·e^{kx} · 4: quadratischer Faktor mal e^{kx} · 5: Produkt- und Kettenregel mit e^{kx²}.
 */
export function genProdukt(lv = 3) {
  for (;;) {
    const L = stufe(lv);
    const a = pick(L <= 1 ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, -2]), b = pick(L <= 2 ? [1, 2, 3, 4, 5, -1, -2] : [1, 2, -1, -3, 4]);
    const k = pick(tier(L, [1], [1], [2, -1, 3, -2], [2, -1, -2, 3], [1, -1, -2, 0.5, -0.5]));
    const u = L === 1 ? [0, a] : L <= 3 ? [b, a] : L === 4 ? [b, pick([0, 1, 2, -3]), a] : rand() < 0.5 ? [b, a] : [b, 0, a];
    const w = L === 5 ? [0, 0, k] : [0, k], du = polyDeriv(u), dw = polyDeriv(w);
    const U = polyTex(u), E = `e^{${polyTex(w)}}`, right = polyAdd(du, polyMul(u, dw));
    // Ein einzelner Summand braucht keine Klammer: „2x·e^x“ statt „(2x)·e^x“, „e^x“ statt „(1)·e^x“.
    const mal = (coef) => { const n = coef.filter((c) => c !== 0).length, t = polyTex(coef); return n > 1 ? `(${t})\\,${E}` : t === '1' ? E : t === '-1' ? `-${E}` : `${t}\\,${E}`; };
    const kl = (coef) => { const t = polyTex(coef); return coef.filter((c) => c !== 0).length > 1 || t.startsWith('-') ? `(${t})` : t; };
    const dvT = polyTex(dw) === '1' ? E : `${kl(dw)}\\cdot ${E}`;      // v' = w'·e^w
    const mk = (coef, correct, why) => ({ tex: `f'(x)=${mal(coef)}`, correct, why, val: (x) => polyEval(coef, x) * Math.exp(polyEval(w, x)) });
    const opts = [
      mk(right, true),
      polyTex(dw) === '1' ? mk(polyAdd(u, du.map((c) => -c)), false, `Die beiden Teile werden addiert, nicht subtrahiert: ${tex("u'v+uv'")}.`) : mk(polyMul(du, dw), false, `Das ist ${tex("u'\\cdot v'")}. Die Produktregel lautet ${tex("u'v+uv'")}.`),
      mk(du, false, `Hier fehlt der zweite Teil ${tex("u\\cdot v'")}.`),
      mk(polyMul(u, dw), false, `Hier fehlt der erste Teil ${tex("u'\\cdot v")}.`),
    ];
    if (!uniq(opts) || right.every((c) => c === 0)) continue;
    const PR = tex("(u\\cdot v)'=u'v+uv'");
    const hints = L === 1 ? [`Zwei Faktoren mit ${tex('x')} – Produktregel: ${PR}.`, `${tex(`u=${U}`)} und ${tex(`v=${E}`)}, also ${tex(`u'=${polyTex(du)}`)} und ${tex(`v'=${E}`)}.`]
      : ['Zwei Faktoren mit x: Das ist ein Fall für die Produktregel.', `${PR} mit ${tex(`u=${U}`)} und ${tex(`v=${E}`)}.`,
        `${tex(`u'=${polyTex(du)}`)} und ${tex(`v'=${dvT}`)}${L >= 3 ? ` (Kettenregel: innere Ableitung ${tex(polyTex(dw))})` : ''}.`];
    if (L >= 5) hints.push(`Einsetzen: ${tex(`f'(x)=${kl(du)}\\cdot ${E}+${kl(u)}\\cdot ${dvT}`)}.`);
    if (L >= 4) hints.push(`${tex(E)} ausklammern und die Klammer zusammenfassen: ${tex(`${polyTex(du)}+${kl(u)}\\cdot ${kl(dw)}=${polyTex(right)}`)}.`);
    return {
      prompt: 'Welche Ableitung ist richtig?',
      formula: `f(x)=${mal(u)}`,
      options: shuffle(opts), hints,
      explain: `Produktregel${L >= 5 ? ' und Kettenregel' : ''}: ${tex(`f'(x)=${kl(du)}\\cdot ${E}+${kl(u)}\\cdot ${dvT}=${mal(right)}`)}.`,
      f: (x) => polyEval(u, x) * Math.exp(polyEval(w, x)),
    };
  }
}

/* ───────────── Analysis: Extrempunkte ───────────── */

const fac = (r) => (r === 0 ? 'x' : `(x${r < 0 ? '+' : '-'}${Math.abs(r)})`);

function kubik(lv) {
  // f'(x) = 6(x-r1)(x-r2)  →  f(x) = 2x³ - 3(r1+r2)x² + 6·r1·r2·x + c
  for (;;) {
    const R = tier(lv, 2, 2, 3, 4, 5);
    const r1 = ri(-R, R), r2 = ri(-R, R);
    if (r1 >= r2 || r1 === -r2) continue;
    const c = lv >= 3 ? pick([0, 1, -2, 4]) : 0;
    const coef = [c, 6 * r1 * r2, -3 * (r1 + r2), 2];
    return { r1, r2, coef, f: (x) => polyEval(coef, x), d2: (x) => 12 * x - 6 * (r1 + r2) };
  }
}
/** f(x) = 3x⁴ − 4(r1+r2)x³ + 6·r1·r2·x² + c  mit  f'(x) = 12x(x−r1)(x−r2). */
function quartik() {
  for (;;) {
    const r1 = ri(-4, 4), r2 = ri(-4, 4);
    if (r1 >= r2 || r1 === -r2 || r1 === 0 || r2 === 0) continue;
    const coef = [pick([0, 1, -2, 5]), 0, 6 * r1 * r2, -4 * (r1 + r2), 3];
    return { r1, r2, coef, f: (x) => polyEval(coef, x) };
  }
}
/** (x²+px+q)·e^{kx} mit k = ±1, deren Ableitung die Nullstellen −m ± √w hat. */
function eKurve() {
  const k = pick([1, -1]), m = k * ri(1, 3), w = pick([2, 3, 5, 6, 7]);
  const p = 2 * m - 2 * k, q = k === 1 ? m * m - 2 * m + 2 - w : m * m - w + 2 * m + 2;
  return { k, m, w, p, q, U: polyTex([q, p, 1]), E: k === 1 ? 'e^{x}' : 'e^{-x}', kl: polyTex([k * (m * m - w), k * 2 * m, k]), f: (x) => (x * x + p * x + q) * Math.exp(k * x) };
}
const stellenTex = (v) => (v.length === 1 ? `x=${v[0]}` : v.map((t, i) => `x_${i + 1}=${t}`).join(',\\quad '));

/**
 * An welchen Stellen ist die Tangente waagerecht?
 * Stufe 1: Parabel (lineare Gleichung) · 2: f'(x)=0 ist rein quadratisch · 3: Ausklammern und pq-Formel ·
 * 4: Grad 4 mit drei Stellen (x ausklammern, dann pq-Formel) · 5: Produkt mit e-Funktion, Lösungen mit Wurzel.
 */
export function genExtremstellen(lv = 3) {
  for (;;) {
    const L = stufe(lv);
    const mk = (xs, correct, why, t) => ({ tex: t || stellenTex(xs.map((x) => ft(x))), correct, why, xs });
    const NULL = `Waagerechte Tangente heißt ${tex("f'(x)=0")}.`;
    let formula, opts, hints, explain, f;
    if (L === 1) {
      const a = pick([1, 2, -1]), x0 = pick([-3, -2, -1, 1, 2, 3]), coef = [pick([0, 1, -2, 3, 5]), -2 * a * x0, a], d1 = polyTex(polyDeriv(coef));
      opts = [mk([x0], true), mk([-x0], false, `Vorzeichen: ${tex(`${d1}=0`)} nach ${tex('x')} auflösen ergibt ${tex(`x=${x0}`)}.`),
        mk([2 * x0], false, `Beim Ableiten fehlt der Faktor 2: ${tex(`(${VF(a)}x^2)'=${2 * a}x`)}.`),
        mk([0], false, `Bei ${tex('x=0')} schneidet der Graph die y-Achse – die Steigung dort ist ${tex(`f'(0)=${-2 * a * x0}`)}, nicht 0.`)];
      formula = `f(x)=${polyTex(coef)}`; f = (x) => polyEval(coef, x);
      hints = [NULL, `${tex(`f'(x)=${d1}`)} – gleich 0 setzen und nach ${tex('x')} auflösen.`];
      explain = `${tex(`f'(x)=${d1}=0`)} liefert ${tex(`x=${x0}`)}.`;
    } else if (L === 2) {
      const a = pick([1, 2]), r = ri(1, 4), coef = [pick([0, 1, -2, 4]), -3 * a * r * r, 0, a], d1 = polyTex(polyDeriv(coef)), N = 3 * a * r * r;
      opts = [mk([-r, r], true), mk([-r * r, r * r], false, `Hier fehlt das Wurzelziehen: Aus ${tex(`x^2=${r * r}`)} folgt ${tex(`x=\\pm ${r}`)}.`),
        mk([-Math.sqrt(N), Math.sqrt(N)], false, `Erst durch ${3 * a} teilen: ${tex(`${3 * a}x^2=${N}`)} ergibt ${tex(`x^2=${r * r}`)}.`, stellenTex([`-\\sqrt{${N}}`, `\\sqrt{${N}}`])),
        mk([0, r], false, `${tex('x=0')} ist keine Lösung: ${tex(`f'(0)=${-N}`)}. Aus ${tex(`x^2=${r * r}`)} folgen ${tex(`x=${r}`)} <b>und</b> ${tex(`x=-${r}`)}.`)];
      formula = `f(x)=${polyTex(coef)}`; f = (x) => polyEval(coef, x);
      hints = [NULL, `${tex(`f'(x)=${d1}`)}.`, `${tex(`${d1}=0`)}: Teile durch ${3 * a} und ziehe die Wurzel – es gibt zwei Lösungen.`];
      explain = `${tex(`f'(x)=${d1}=0\\ \\Rightarrow\\ x^2=${r * r}`)}, also ${tex(`x_1=-${r}`)} und ${tex(`x_2=${r}`)}.`;
    } else if (L === 3) {
      const k = kubik(3), { r1, r2 } = k, Q = polyTex([r1 * r2, -(r1 + r2), 1]);
      opts = [mk([r1, r2], true), mk([-r2, -r1], false, `Vorzeichen: Aus ${tex('(x-r)=0')} folgt ${tex('x=r')}, nicht ${tex('x=-r')}.`),
        mk([Math.min(r1 + r2, r1 * r2), Math.max(r1 + r2, r1 * r2)], false, 'Das sind Summe und Produkt der Lösungen, nicht die Lösungen selbst.'),
        mk([r1, (r1 + r2) / 2], false, `Die zweite Stelle ist die Wendestelle (${tex("f''(x)=0")}), keine Extremstelle.`)];
      formula = `f(x)=${polyTex(k.coef)}`; f = k.f;
      hints = [NULL, `${tex(`f'(x)=${polyTex(polyDeriv(k.coef))}`)}. Klammere 6 aus (Ausklammern).`, `${tex(`f'(x)=6(${Q})`)} – jetzt die quadratische Gleichung ${tex(`${Q}=0`)} lösen, zum Beispiel mit der pq-Formel.`];
      explain = `${tex(`f'(x)=${polyTex(polyDeriv(k.coef))}=6(${Q})=6\\cdot ${fac(r1)}\\cdot ${fac(r2)}=0`)} liefert ${tex(`x_1=${r1}`)} und ${tex(`x_2=${r2}`)}.`;
    } else if (L === 4) {
      const k = quartik(), { r1, r2 } = k, m = (r1 + r2) / 2, Q = polyTex([r1 * r2, -(r1 + r2), 1]), d1 = polyTex(polyDeriv(k.coef)), sorted = [0, r1, r2].sort((p, q) => p - q);
      opts = [mk(sorted, true), mk(sorted.map((x) => -x).reverse(), false, `Vorzeichen: Aus ${tex('(x-r)=0')} folgt ${tex('x=r')}, nicht ${tex('x=-r')}.`),
        mk([0, r1 + r2, r1 * r2].sort((p, q) => p - q), false, 'Neben 0 stehen hier Summe und Produkt der beiden anderen Lösungen, nicht die Lösungen selbst.'),
        mk([0, r1 + m, r2 + m].sort((p, q) => p - q), false, `In der pq-Formel steht ${tex('-\\tfrac{p}{2}')} vor der Wurzel, nicht ${tex('-p')}: hier ${tex(ft(m))}.`)];
      formula = `f(x)=${polyTex(k.coef)}`; f = k.f;
      hints = [NULL, `${tex(`f'(x)=${d1}`)}.`, `Ausklammern: ${tex(`f'(x)=12x\\,(${Q})`)}. Ein Produkt ist 0, wenn ein Faktor 0 ist – also ${tex('x=0')} oder ${tex(`${Q}=0`)}.`,
        `pq-Formel mit ${tex(`p=${-(r1 + r2)}`)} und ${tex(`q=${r1 * r2}`)}: ${tex(`x=${ft(m)}\\pm\\sqrt{${ft(m * m)}${vz(-r1 * r2)}}`)}.`, `Die Wurzel ist ${tex(ft((r2 - r1) / 2))}.`];
      explain = `${tex(`f'(x)=12x\\,(${Q})=0`)}: ${tex('x=0')} oder (pq-Formel) ${tex(`x=${ft(m)}\\pm\\sqrt{${ft(m * m)}${vz(-r1 * r2)}}=${ft(m)}\\pm ${ft((r2 - r1) / 2)}`)}. Also ${tex(stellenTex(sorted.map((x) => ft(x))))}.`;
    } else {
      const g = eKurve(), { k, m, w, p } = g, s = Math.sqrt(w), T = (c, r, minus) => `${c}${minus ? '-' : '+'}${r}`;
      opts = [mk([-m - s, -m + s], true, undefined, stellenTex([T(-m, `\\sqrt{${w}}`, true), T(-m, `\\sqrt{${w}}`)])),
        mk([m - s, m + s], false, `Vorzeichen: In der pq-Formel steht ${tex('-\\tfrac{p}{2}')} vor der Wurzel, hier ${tex(String(-m))}.`, stellenTex([T(m, `\\sqrt{${w}}`, true), T(m, `\\sqrt{${w}}`)])),
        mk([-p / 2], false, `Das ist die Nullstelle von ${tex(`u'=${polyTex([p, 2])}`)} allein. Ein Produkt wird mit der Produktregel ${tex("u'v+uv'")} abgeleitet, nicht als ${tex("u'\\cdot v'")}.`),
        mk([-m - w, -m + w], false, `Die Wurzel fehlt: Unter der Wurzel steht ${w}, also ${tex(`\\pm\\sqrt{${w}}`)}.`)];
      formula = `f(x)=(${g.U})\\,${g.E}`; f = g.f;
      hints = [NULL, `Produktregel${k < 0 ? ' und Kettenregel' : ''}: ${tex(`f'(x)=(${polyTex([p, 2])})\\,${g.E}${k < 0 ? '-' : '+'}(${g.U})\\,${g.E}`)}.`, `${tex(g.E)} ausklammern: ${tex(`f'(x)=(${g.kl})\\,${g.E}`)}.`,
        `${tex(g.E)} wird nie 0 – also muss die Klammer 0 sein: ${tex(`${polyTex([m * m - w, 2 * m, 1])}=0`)}.`, `pq-Formel: ${tex(`x=${-m}\\pm\\sqrt{${m * m}${vz(-(m * m - w))}}`)}.`];
      explain = `Produktregel: ${tex(`f'(x)=(${g.kl})\\,${g.E}`)}. Weil ${tex(`${g.E}>0`)} ist, muss ${tex(`${polyTex([m * m - w, 2 * m, 1])}=0`)} gelten. pq-Formel: ${tex(`x=${-m}\\pm\\sqrt{${m * m}${vz(-(m * m - w))}}=${-m}\\pm\\sqrt{${w}}`)}.`;
    }
    if (!uniq(opts) || opts.some((o) => new Set(o.xs).size !== o.xs.length)) continue;
    return { prompt: 'An welchen Stellen hat der Graph eine waagerechte Tangente?', formula, options: shuffle(opts), hints, explain, f };
  }
}

/** Kurvenschar für Stufe 5 von genHochTief: Gleichung mit Parameter t > 0. Die Felder f und at (für die Selbstprüfung) gelten für ein festes Beispiel-t. */
function scharFall() {
  const art = pick(['a', 'b', 'c', 'd', 'e']), a = pick(art === 'd' ? [1, 2, 3, -1, -2] : [1, 2, -1, -2]), A = VF(a), fall = scharArt(art, a, A);
  return { ...fall, art };
}
function scharArt(art, a, A) {
  if (art === 'a') { const s = pick([1, -1]), t = 2;
    return { formula: `f_t(x)=${A}x^{3}${vz(-3 * a)}t^{2}x`, atT: s > 0 ? 't' : '-t', at: s * t, f: (x) => a * x ** 3 - 3 * a * t * t * x, d1: `${3 * a}x^{2}${vz(-3 * a)}t^{2}`, d2: `${6 * a}x`, ein: `${6 * a}\\cdot ${s > 0 ? 't' : '(-t)'}=${s * 6 * a}t`, pos: s * a > 0 }; }
  if (art === 'b') { const s = pick([0, 1]), t = 2;
    return { formula: `f_t(x)=${A}x^{3}${vz(-3 * a)}t\\,x^{2}`, atT: s ? '2t' : '0', at: s * 2 * t, f: (x) => a * x ** 3 - 3 * a * t * x * x, d1: `${3 * a}x^{2}${vz(-6 * a)}t\\,x`, d2: `${6 * a}x${vz(-6 * a)}t`, ein: s ? `${6 * a}\\cdot 2t${vz(-6 * a)}t=${6 * a}t` : `${-6 * a}t`, pos: s ? a > 0 : a < 0 }; }
  if (art === 'c') { const t = 3;
    return { formula: `f_t(x)=${A}(x-t)\\,e^{x}`, atT: 't-1', at: t - 1, f: (x) => a * (x - t) * Math.exp(x), d1: `${A}(x-t+1)\\,e^{x}`, d2: `${A}(x-t+2)\\,e^{x}`, ein: `${A}(t-1-t+2)\\,e^{t-1}=${A}e^{t-1}`, pos: a > 0, regel: 'Produktregel', e: true }; }
  if (art === 'd') { const t = 4;
    return { formula: `f_t(x)=${A}x\\,e^{-tx}`, atT: '\\dfrac{1}{t}', at: 1 / t, f: (x) => a * x * Math.exp(-t * x), d1: `${A}(1-tx)\\,e^{-tx}`, d2: `${A}(t^{2}x-2t)\\,e^{-tx}`, ein: `${A}(t-2t)\\,e^{-1}=${VF(-a)}t\\,e^{-1}`, pos: a < 0, regel: 'Produkt- und Kettenregel', e: true }; }
  const s = pick([0, 1, -1]), t = 2;
  return { formula: `f_t(x)=${A}x^{4}${vz(-2 * a)}t^{2}x^{2}`, atT: s === 0 ? '0' : s > 0 ? 't' : '-t', at: s * t, f: (x) => a * x ** 4 - 2 * a * t * t * x * x, d1: `${4 * a}x^{3}${vz(-4 * a)}t^{2}x`, d2: `${12 * a}x^{2}${vz(-4 * a)}t^{2}`,
    ein: s === 0 ? `${-4 * a}t^{2}` : `${12 * a}t^{2}${vz(-4 * a)}t^{2}=${8 * a}t^{2}`, pos: s === 0 ? a < 0 : a > 0 };
}
/** Einsetzen in ein Polynom: „12·(−2)−6“. */
const einsetzen = (coef, x) => coef.map((c, i) => [c, i]).filter(([c]) => c).reverse().map(([c, i], j) => `${c < 0 ? '-' : j ? '+' : ''}${i === 0 ? Math.abs(c) : `${Math.abs(c)}\\cdot ${par(x)}${i > 1 ? `^{${i}}` : ''}`}`).join('');

/**
 * Hochpunkt oder Tiefpunkt?
 * Stufe 1: Parabel (f'' ist eine Zahl) · 2: x³ − 3r²x · 3: allgemeine Funktion dritten Grades · 4: Grad 4 ·
 * 5: Kurvenschar mit Parameter t > 0 (auch mit e-Funktion): Vorzeichen von f'' für alle t begründen.
 */
export function genHochTief(lv = 3) {
  const L = stufe(lv);
  let formula, f, at, atT, d2T, einT, v, fall = null, prompt;
  if (L === 5) { fall = scharFall(); ({ formula, f, at, atT } = fall); d2T = fall.d2; einT = fall.ein; v = fall.pos ? 1 : -1; }
  else {
    let coef;
    if (L === 1) { const a = pick([1, 2, 3, -1, -2, -3]), x0 = pick([-3, -2, -1, 1, 2, 3]); coef = [pick([0, 1, -2, 3, 5]), -2 * a * x0, a]; at = x0; }
    else if (L === 2) { const a = pick([1, 2, -1]), r = ri(1, 3); coef = [pick([0, 1, -2, 4]), -3 * a * r * r, 0, a]; at = pick([r, -r]); }
    else if (L === 3) { const k = kubik(3); coef = k.coef; at = pick([k.r1, k.r2]); }
    else { const k = quartik(), s = pick([1, -1]); coef = k.coef.map((c) => s * c); at = pick([0, k.r1, k.r2]); }
    const d2 = polyDeriv(polyDeriv(coef));
    formula = `f(x)=${polyTex(coef)}`; f = (x) => polyEval(coef, x); atT = ft(at); d2T = polyTex(d2); v = polyEval(d2, at);
    einT = d2.length === 1 ? null : `${einsetzen(d2, at)}=${ft(v)}`;
  }
  const kind = v < 0 ? 'H' : 'T';
  const opt = (label, key, why) => ({ tex: `\\text{${label}}`, correct: key === kind, why: key === kind ? undefined : why, key });
  const grund = L === 5 ? (fall.art === 'c' ? 'weil die e-Funktion immer positiv ist' : fall.art === 'd' ? `weil ${tex('t>0')} und ${tex('e^{-1}>0')} ist` : `weil ${tex('t>0')} ist`) : '';
  const sign = L === 5 ? `${tex(`f_t''(${atT})=${einT}`)} ist für jedes ${tex('t')} ${v < 0 ? 'negativ' : 'positiv'}, ${grund}`
    : L === 1 ? `${tex(`f''(x)=${d2T}`)} ist überall ${v < 0 ? 'negativ' : 'positiv'}` : `${tex(`f''(${atT})=${ft(v)}`)} ist ${v < 0 ? 'negativ' : 'positiv'}`;
  if (L === 5) prompt = `Für jedes ${tex('t>0')} hat der Graph von ${tex('f_t')} bei ${tex(`x=${atT}`)} eine waagerechte Tangente. Was liegt dort vor?`;
  else prompt = `Der Graph hat bei ${tex(`x=${atT}`)} eine waagerechte Tangente. Was liegt dort vor?`;
  const hints = L === 1 ? ['Entscheide mit der zweiten Ableitung.', `${tex(`f''(x)=${d2T}`)}: ${tex("f''<0")} heißt Hochpunkt, ${tex("f''>0")} heißt Tiefpunkt.`]
    : L === 5 ? [`Leite zweimal nach ${tex('x')} ab – ${tex('t')} ist dabei eine feste Zahl (Parameter).`, `${tex(`f_t'(x)=${fall.d1}`)}${fall.regel ? ` (${fall.regel})` : ''}.`, `${tex(`f_t''(x)=${d2T}`)}.`,
      `Setze die Stelle ein: ${tex(`f_t''(${atT})=${einT}`)}.`, `Das Vorzeichen steht für alle ${tex('t>0')} fest, ${grund}. ${tex("f''<0")}: Hochpunkt. ${tex("f''>0")}: Tiefpunkt.`]
      : [...(L === 2 ? [`Setze die Stelle in die zweite Ableitung ein: ${tex(`f''(x)=${d2T}`)}.`] : ['Setze die Stelle in die zweite Ableitung ein.', `${tex(`f''(x)=${d2T}`)}.`]), `Einsetzen: ${tex(`f''(${atT})=${einT}`)}.`, `${tex("f''<0")}: Hochpunkt. ${tex("f''>0")}: Tiefpunkt.`];
  const q = {
    prompt, formula,
    options: shuffle([
      opt('Hochpunkt', 'H', `${sign} – der Graph ist dort linksgekrümmt, also ein Tiefpunkt.`),
      opt('Tiefpunkt', 'T', `${sign} – der Graph ist dort rechtsgekrümmt, also ein Hochpunkt.`),
      opt('Sattelpunkt', 'S', `Für einen Sattelpunkt müsste auch ${tex("f''")} dort 0 sein. Aber ${sign}.`),
      L === 5 ? opt('Das hängt vom Wert von t ab', 'A', `Nein: ${sign} – das Vorzeichen ist für alle ${tex('t>0')} dasselbe.`) : opt('Wendepunkt ohne Extremum', 'W', `Eine Wendestelle hätte ${tex("f''=0")}. Aber ${sign}.`),
    ]),
    hints,
    explain: L >= 2 && L <= 4 ? `${tex(`f''(x)=${d2T}`)}, also ${tex(`f''(${atT})=${einT}`)}. Das ist ${v < 0 ? 'negativ' : 'positiv'}, also liegt ein ${kind === 'H' ? 'Hochpunkt' : 'Tiefpunkt'} vor.`
      : L === 5 ? `${tex(`f_t''(x)=${d2T}`)}. ${sign}, also liegt für jedes ${tex('t>0')} ein ${kind === 'H' ? 'Hochpunkt' : 'Tiefpunkt'} vor.` : `${sign}, also liegt ein ${kind === 'H' ? 'Hochpunkt' : 'Tiefpunkt'} vor.`,
    f, at, kind,
  };
  return q;
}

/* ───────────── Analysis: Integral ───────────── */

function stammPoly(lv) {
  // F hat ganzzahlige Koeffizienten, f = F'
  const deg = tier(lv, 2, 2, 3, 4, 4);
  const F = Array(deg + 1).fill(0);
  F[deg] = pick(lv <= 2 ? [1, 2] : [1, 2, -1, 3]);
  F[ri(1, deg - 1)] = pick(lv <= 2 ? [1, 2, 3] : [2, 3, -2, -4, 5]);
  if (lv >= 4) F[1] ||= pick([-3, 6]);
  return { F, f: polyDeriv(F) };
}
/** Ganzzahliges Polynom dritten Grades, dessen Stammfunktion Brüche hat. */
function krummPoly(grad) {
  for (;;) {
    const ts = [[pick([1, 2, 3, 5, -1, -2]), 1, grad]];
    for (const e of shuffle([0, 1, 2, 3].filter((x) => x < grad)).slice(0, 2)) ts.push([pick([1, 2, 3, 4, 5, 7, -1, -3, -5]), 1, e]);
    if (termeInt(ts).filter((t) => t[1] !== 1).length >= 1) return ts.sort((p, q) => q[2] - p[2]);
  }
}
/** Potenzregel des Aufleitens als Formel (erst beim Aufruf gesetzt – beim Laden des Moduls ist KaTeX noch nicht da). */
const aufRegel = () => tex('\\int x^n\\,dx=\\tfrac{1}{n+1}x^{n+1}');

/**
 * Welche Funktion ist eine Stammfunktion?
 * Stufe 1: eine Potenz plus Zahl, glatte Vorfaktoren · 2: drei Summanden · 3: Brüche als Vorfaktoren ·
 * 4: zusätzlich Bedingung F(x₀)=y₀ (Konstante bestimmen) · 5: lineare Substitution bei Klammer-Potenz und e-Funktion, mit Bedingung.
 */
export function genStammfunktion(lv = 3) {
  for (;;) {
    const L = stufe(lv);
    let formula, opts, hints, explain, f, prompt = 'Welche Funktion ist eine Stammfunktion von f?';
    if (L === 5) {
      const a = pick([2, 3, 4, -2]), b = pick([1, 2, -1, -3]), n = ri(2, 4), c = pick([2, 3, 4, 6, -2, -3]), k = pick([2, 3, 4, -2]), y0 = pick([0, 1, 2, 3, -1]);
      const I = polyTex([b, a]), E = `e^{${VF(k)}x}`;
      const mk = (p, q, correct, why) => { const C = rSub(rSub([y0, 1], rMul(p, [b ** (n + 1), 1])), q);
        return { tex: `F(x)=${rVF(p)}(${I})^{${n + 1}}${rVzF(q)}${E}${rVz(C)}`, correct, why, val: (x) => (p[0] / p[1]) * (a * x + b) ** (n + 1) + (q[0] / q[1]) * Math.exp(k * x) + C[0] / C[1], C }; };
      const P = kuerze(1, a * (n + 1)), Q = kuerze(c, k);
      opts = [mk(P, Q, true),
        mk([1, n + 1], Q, false, `Bei ${tex(`(${I})^{${n}}`)} fehlt das Teilen durch die innere Ableitung ${tex(ft(a))} (lineare Substitution).`),
        mk(P, [c, 1], false, `Bei ${tex(E)} fehlt das Teilen durch ${tex(ft(k))}: ${tex(`\\int ${E}\\,dx=\\tfrac{1}{${k}}${E}`)}.`),
        mk(kuerze(a, n + 1), [c * k, 1], false, 'Hier wurde mit der inneren Ableitung malgenommen – das gehört zum Ableiten. Beim Aufleiten wird durch sie geteilt.')];
      formula = `f(x)=(${I})^{${n}}${c < 0 ? '-' : '+'}${Math.abs(c)}${E}`; f = (x) => (a * x + b) ** n + c * Math.exp(k * x);
      prompt = `Welche Stammfunktion ${tex('F')} von ${tex('f')} erfüllt ${tex(`F(0)=${y0}`)}?`;
      const F0 = rAdd(rMul(P, [b ** (n + 1), 1]), Q), C = opts[0].C;
      hints = ['Leite beide Summanden einzeln auf. In beiden steckt innen ein linearer Term – lineare Substitution: durch die innere Ableitung teilen.',
        `${tex(`\\int(${I})^{${n}}dx=\\dfrac{1}{${n + 1}\\cdot ${par(a)}}(${I})^{${n + 1}}`)}.`, `${tex(`\\int ${c}${E}\\,dx=\\dfrac{${c}}{${k}}${E}`)}.`,
        `Mit Konstante: ${tex(`F(x)=${rVF(P)}(${I})^{${n + 1}}${rVzF(Q)}${E}+C`)}. Jetzt ${tex('x=0')} einsetzen (${tex('e^0=1')}).`, `${tex(`F(0)=${rVF(P)}\\cdot ${par(b)}^{${n + 1}}${rVz(Q)}+C=${bruch(...F0)}+C=${y0}`)}, also ${tex(`C=${bruch(...C)}`)}.`];
      explain = `Lineare Substitution: ${tex(`F(x)=${rVF(P)}(${I})^{${n + 1}}${rVzF(Q)}${E}+C`)}. Aus ${tex(`F(0)=${bruch(...F0)}+C=${y0}`)} folgt ${tex(`C=${y0}-${bruchKl(F0)}=${bruch(...C)}`)}.`;
    } else {
      let ts, x0 = null, y0 = 0;
      if (L === 1) { const n = ri(1, 3), m = pick(n === 3 ? [1, 2] : [1, 2, 3]); ts = [[(n + 1) * m, 1, n], [pick([1, 2, 3, 4, 5]), 1, 0]]; }
      else if (L === 2) ts = [[3 * pick([1, 2]), 1, 2], [2 * pick([1, 2, 3, -1, -2]), 1, 1], [pick([1, 2, 3, 5, -1, -4]), 1, 0]];
      else if (L === 3) ts = krummPoly(3);
      else { ts = krummPoly(ri(2, 3)); x0 = pick([1, 2, -1]); y0 = pick([0, 1, 2, 3, 5, -1, -2]); }
      const F = termeInt(ts);
      // Mit Bedingung bekommt jede Antwort die Konstante, mit der sie die Bedingung erfüllt – falsch ist dann nur die Aufleitung selbst.
      const mitC = (t) => (x0 === null ? t : [...t.filter((s) => s[2] !== 0), [...rSub([y0, 1], termeBruch(t.filter((s) => s[2] !== 0), x0)), 0]]);
      const mk = (t, correct, why, ohneC = false) => { const T = ohneC ? t : mitC(t); return { tex: `F(x)=${termeTex(T)}`, correct, why, val: (x) => termeWert(T, x) }; };
      opts = [mk(F, true),
        mk(termeAbl(ts), false, 'Das ist die Ableitung. Gesucht ist die Umkehrung: Aufleiten.', true),
        mk(ts.map(([z, n, e]) => [z, n, e + 1]), false, `Der Exponent ist erhöht, aber es fehlt das Teilen durch den neuen Exponenten: ${aufRegel()}.`),
        mk(ts.map(([z, n, e]) => [...kuerze(z, n * (e + 1)), e]), false, 'Geteilt ist richtig – aber der Exponent muss auch um 1 größer werden.')];
      formula = `f(x)=${termeTex(ts)}`; f = (x) => termeWert(ts, x);
      const roh = ts.map(([z, , e], i) => `${z < 0 ? '-' : i ? '+' : ''}${e === 0 ? (Math.abs(z) === 1 ? '' : Math.abs(z)) : `\\frac{${Math.abs(z)}}{${e + 1}}`}${xp(e + 1)}`).join('');
      if (L === 1) { hints = ['Aufleiten ist die Umkehrung des Ableitens: Hochzahl um 1 erhöhen, durch die neue Hochzahl teilen.', 'Probe: Leite deine Stammfunktion ab – es muss wieder f herauskommen.'];
        explain = `${tex(`F(x)=${roh === termeTex(F) ? '' : `${roh}=`}${termeTex(F)}`)}. Probe: ${tex("F'(x)=f(x)")}.`; }
      else if (L <= 3) { hints = ['Probe: Die Ableitung der Stammfunktion muss wieder f ergeben.', `${aufRegel()}: Exponent um 1 erhöhen, durch den neuen Exponenten teilen.`];
        if (L === 3) hints.push(`Summandenweise: ${tex(`F(x)=${roh}`)} – Brüche kürzen, wo es geht.`);
        explain = `Summandenweise aufleiten: ${tex(`F(x)=${L === 3 && roh !== termeTex(F) ? `${roh}=` : ''}${termeTex(F)}`)}. Probe: ${tex("F'(x)=f(x)")}.`; }
      else {
        const F0 = termeBruch(F, x0), C = rSub([y0, 1], F0);
        prompt = `Welche Stammfunktion ${tex('F')} von ${tex('f')} erfüllt ${tex(`F(${x0})=${y0}`)}?`;
        hints = [`Leite zuerst allgemein auf – ${aufRegel()} – und hänge eine Konstante ${tex('C')} an.`, `${tex(`F(x)=${termeTex(F)}+C`)}.`, `Setze die Bedingung ein: ${tex(`F(${x0})=${bruch(...F0)}+C=${y0}`)}.`, `Nach ${tex('C')} auflösen: ${tex(`C=${y0}-${bruchKl(F0)}=${bruch(...C)}`)}.`];
        explain = `Allgemein: ${tex(`F(x)=${termeTex(F)}+C`)}. Aus ${tex(`F(${x0})=${bruch(...F0)}+C=${y0}`)} folgt ${tex(`C=${bruch(...C)}`)}, also ${tex(`F(x)=${termeTex(mitC(F))}`)}.`;
      }
    }
    if (!uniq(opts)) continue;
    return { prompt, formula, options: shuffle(opts), hints, explain, f };
  }
}

/**
 * Bestimmtes Integral berechnen.
 * Stufe 1: eine Potenz, untere Grenze 0 · 2: zwei Summanden, glatte Stammfunktion · 3: Grad 3, negative Grenze ·
 * 4: Stammfunktion mit Brüchen, Ergebnis oft ein Bruch · 5: erst umformen (ausmultiplizieren oder gliedweise teilen), Ergebnis als Bruch.
 */
export function genIntegral(lv = 3) {
  for (;;) {
    const L = stufe(lv);
    let ts, a, b, formula, vor = null, dritte;
    const B = (r, correct, why) => ({ tex: bruch(...r), num: r[0] / r[1], correct, why });
    if (L === 1) { const n = ri(1, 3), m = pick([1, 2, 3]); ts = [[(n + 1) * m, 1, n]]; a = 0; b = ri(1, n === 3 ? 2 : n === 2 ? 3 : 4); }
    else if (L === 2) { const n = ri(1, 2); ts = [[(n + 1) * pick([1, 2, 3]), 1, n], [pick([1, 2, 3, 4, 5]), 1, 0]]; a = ri(0, 1); b = a + ri(1, 2); }
    else if (L === 3) { const s = stammPoly(3); ts = s.f.map((c, i) => [c, 1, i]).filter((t) => t[0]); a = pick([0, 1, -1]); b = a + ri(1, 3); }
    else if (L === 4) { ts = krummPoly(ri(2, 3)); a = pick([-2, -1, 1]); b = a + ri(2, 3); }
    else if (rand() < 0.5) {
      // (x − p)(c·x + q) erst ausmultiplizieren
      const p = pick([1, 2, 3, -1, -2]), c = pick([1, 2, 3, -1]), q = pick([1, 2, 4, -3, -5]);
      ts = [[c, 1, 2], [q - c * p, 1, 1], [-p * q, 1, 0]].filter((t) => t[0]); a = pick([-1, 0, 1]); b = a + ri(2, 3);
      const U = [[1, 1, 1], [-p, 1, 0]], V = [[c, 1, 1], [q, 1, 0]], int = (t) => rSub(termeBruch(termeInt(t), b), termeBruch(termeInt(t), a));
      formula = `\\int_{${a}}^{${b}}(${termeTex(U)})(${termeTex(V)})\\,dx`;
      vor = ['Der Integrand ist ein Produkt – multipliziere zuerst aus.', `${tex(`(${termeTex(U)})(${termeTex(V)})=${termeTex(ts)}`)}.`];
      dritte = B(rMul(int(U), int(V)), false, 'Die beiden Klammern wurden einzeln integriert und die Ergebnisse malgenommen – das ist nicht erlaubt. Erst ausmultiplizieren.');
    } else {
      // (A·x³ + C) : x²  =  A·x + C·x^(−2)
      const A = pick([1, 2, 3, 4, -2]), C = pick([1, 2, 3, 5, -1, -4]);
      ts = [[A, 1, 1], [C, 1, -2]]; a = ri(1, 2); b = a + ri(1, 3);
      const Z = [[A, 1, 3], [C, 1, 0]], N = [[1, 1, 2]], int = (t) => rSub(termeBruch(termeInt(t), b), termeBruch(termeInt(t), a)), iz = int(Z), inn = int(N);
      formula = `\\int_{${a}}^{${b}}\\dfrac{${termeTex(Z)}}{x^{2}}\\,dx`;
      vor = [`Teile zuerst jeden Summanden des Zählers durch ${tex('x^{2}')}.`, `${tex(`\\dfrac{${termeTex(Z)}}{x^{2}}=${termeTex(ts, true)}`)} – so lässt sich jeder Summand mit ${aufRegel()} aufleiten.`];
      dritte = B(kuerze(iz[0] * inn[1], iz[1] * inn[0]), false, 'Zähler und Nenner wurden einzeln integriert – so eine Regel gibt es nicht. Erst gliedweise teilen.');
    }
    const F = termeInt(ts), Fa = termeBruch(F, a), Fb = termeBruch(F, b), res = rSub(Fb, Fa), fx = (x) => termeBruch(ts, x);
    if (!formula) formula = `\\int_{${a}}^{${b}}${ts.length > 1 ? `\\left(${termeTex(ts)}\\right)` : `${termeTex(ts)}\\,`}dx`;
    const opts = [
      B(res, true),
      B(rSub(Fa, Fb), false, `Reihenfolge: obere Grenze minus untere Grenze, also ${tex('F(b)-F(a)')}.`),
      L === 1 ? B(kuerze(ts[0][0] * b ** (ts[0][2] + 1), 1), false, `Der Exponent ist erhöht, aber es fehlt das Teilen durch den neuen Exponenten: ${aufRegel()}.`)
        : dritte || B(rAdd(Fb, Fa), false, `Die Werte der Stammfunktion werden subtrahiert, nicht addiert: ${tex('F(b)-F(a)')}.`),
      B(rSub(fx(b), fx(a)), false, `Du hast die Grenzen in ${tex('f')} eingesetzt. Erst die Stammfunktion ${tex('F')} bilden.`),
    ];
    if (res[0] === 0 || !fern(opts, 0.02 * (1 + Math.abs(res[0] / res[1])))) continue;
    const FT = termeTex(F), HS = 'Hauptsatz: Stammfunktion bilden, dann obere minus untere Grenze.';
    const hints = L === 1 ? [HS, `${tex(`F(x)=${FT}`)}, also ${tex(`F(${b})=${bruch(...Fb)}`)} und ${tex('F(0)=0')}.`]
      : [...(vor || []), HS, `${tex(`F(x)=${FT}`)}.`, `${tex(`F(${b})=${bruch(...Fb)}`)} und ${tex(`F(${a})=${bruch(...Fa)}`)}.`];
    if (L >= 4) hints.push(`${tex(`F(${b})-F(${a})=${bruch(...Fb)}-${bruchKl(Fa)}=${bruch(...res)}`)}${Fa[1] !== Fb[1] ? ' – vorher auf einen gemeinsamen Nenner bringen' : ''}.`);
    return {
      prompt: 'Berechne das Integral.', formula, options: shuffle(opts), hints,
      explain: `${vor ? `Umformen: ${tex(`f(x)=${termeTex(ts, true)}`)}. ` : ''}${tex(`\\bigl[${FT}\\bigr]_{${a}}^{${b}}=${bruch(...Fb)}-${bruchKl(Fa)}=${bruch(...res)}`)}.`,
      f: (x) => termeWert(ts, x), a, b,
    };
  }
}

/* ───────────── Stochastik ───────────── */

const SIGMA_OK = [[16, 0.5], [36, 0.5], [64, 0.5], [100, 0.5], [25, 0.2], [100, 0.2], [100, 0.1], [48, 0.25], [400, 0.5], [64, 0.2]];

// Paare (n, p), bei denen n·p ganz ist und die Standardabweichung höchstens eine Nachkommastelle hat.
const SIGMA_GLATT = [0.1, 0.2, 0.25, 0.4, 0.5, 0.6, 0.75, 0.8, 0.9].flatMap((p) => Array.from({ length: 98 }, (_, i) => 4 * (i + 3)).filter((n) => { const s = Math.sqrt(n * p * (1 - p)); return Number.isInteger(+(n * p).toFixed(6)) && Math.abs(s * 10 - Math.round(s * 10)) < 1e-9; }).map((n) => [n, p]));

/**
 * Erwartungswert oder Standardabweichung einer binomialverteilten Größe.
 * Stufe 1: μ = n·p mit glatten Zahlen · 2: p als Prozentangabe im Text, krummes Ergebnis · 3: σ mit glatter Wurzel ·
 * 4: σ mit krummen Zahlen (runden) · 5: p erst aus einem zweistufigen Spiel bestimmen (Pfadregel oder Gegenereignis), dann μ oder σ.
 */
export function genErwartung(lv = 3) {
  for (;;) {
    const L = stufe(lv);
    let n, p, askSigma = L >= 3, prompt, formula, vorab = [], vorText = '', einzel = null, pB = null;
    const pct = (x) => fmt(x * 100);
    if (L === 1) { n = pick([10, 20, 30, 50, 100, 200]); p = pick([0.1, 0.2, 0.3, 0.4, 0.6, 0.7]); }
    else if (L === 2) { n = pick([30, 40, 60, 80, 120, 250]); p = pick([0.05, 0.15, 0.35, 0.45, 0.6, 0.75]); }
    else if (L === 3) [n, p] = pick(SIGMA_GLATT);
    else if (L === 4) { n = pick([50, 80, 90, 120, 150, 200]); p = pick([0.15, 0.3, 0.35, 0.45, 0.6, 0.7]); }
    else {
      const [m, g] = pick([[4, 1], [4, 3], [5, 2], [5, 3], [8, 3], [8, 5], [10, 3]]), p1 = g / m, gegen = rand() < 0.5;
      n = pick([40, 80, 100, 160, 200, 250, 400]); askSigma = rand() < 0.6; einzel = p1;
      p = gegen ? 1 - (1 - p1) ** 2 : p1 * p1;
      const [pz, pn] = pB = gegen ? kuerze(m * m - (m - g) ** 2, m * m) : kuerze(g * g, m * m);
      prompt = `Ein Glücksrad hat ${m} gleich große Felder, ${g === 1 ? 'eines davon ist' : `${g} davon sind`} rot. Bei einem Spiel wird das Rad zweimal gedreht; man gewinnt, wenn ${gegen ? '<b>mindestens einmal</b>' : '<b>beide Male</b>'} Rot erscheint. `
        + `Das Spiel wird ${n}-mal gespielt, ${tex('X')} zählt die gewonnenen Spiele. Wie groß ist ${askSigma ? 'die Standardabweichung' : 'der Erwartungswert'} von ${tex('X')}${askSigma ? ' (auf zwei Nachkommastellen)' : ''}?`;
      vorab = gegen ? [`Bestimme zuerst die Gewinnwahrscheinlichkeit für <b>ein</b> Spiel – am schnellsten über das Gegenereignis „zweimal nicht Rot“.`, `${tex(`p=1-\\dfrac{${m - g}}{${m}}\\cdot\\dfrac{${m - g}}{${m}}=\\dfrac{${pz}}{${pn}}`)}.`]
        : [`Bestimme zuerst die Gewinnwahrscheinlichkeit für <b>ein</b> Spiel mit der Pfadregel (zweimal Rot).`, `${tex(`p=\\dfrac{${g}}{${m}}\\cdot\\dfrac{${g}}{${m}}=\\dfrac{${pz}}{${pn}}`)}.`];
      vorText = gegen ? `Gegenereignis: ${tex(`p=1-\\left(\\dfrac{${m - g}}{${m}}\\right)^2=\\dfrac{${pz}}{${pn}}`)}. ` : `Pfadregel: ${tex(`p=\\left(\\dfrac{${g}}{${m}}\\right)^2=\\dfrac{${pz}}{${pn}}`)}. `;
    }
    const q = 1 - p, mu = n * p, vr = n * p * q, sg = Math.sqrt(vr), P5 = () => `\\dfrac{${pB[0]}}{${pB[1]}}`;
    const mk = (num, correct, why) => ({ tex: rundTex(num), correct, why, num: +num.toFixed(2) });
    let opts;
    if (askSigma) opts = [mk(sg, true), mk(vr, false, `Das ist die Varianz ${tex('n\\,p\\,(1-p)')}. Für die Standardabweichung fehlt die Wurzel.`),
      mk(mu, false, `Das ist der Erwartungswert ${tex('\\mu=n\\,p')}.`),
      einzel ? mk(Math.sqrt(n * einzel * (1 - einzel)), false, `Hier wurde mit der Wahrscheinlichkeit für <b>eine</b> Drehung gerechnet. Ein Spiel besteht aus zwei Drehungen: ${tex(`p=${P5()}`)}.`) : mk(Math.sqrt(mu), false, `Unter der Wurzel fehlt der Faktor ${tex('(1-p)')}.`)];
    else opts = [mk(mu, true), einzel ? mk(n * einzel, false, `Hier wurde mit der Wahrscheinlichkeit für <b>eine</b> Drehung gerechnet. Ein Spiel besteht aus zwei Drehungen: ${tex(`p=${P5()}`)}.`) : mk(n * q, false, 'Das ist die erwartete Anzahl der Misserfolge.'),
      mk(vr, false, `Das ist die Varianz ${tex('n\\,p\\,(1-p)')}, nicht der Erwartungswert.`), mk(sg, false, 'Das ist die Standardabweichung, nicht der Erwartungswert.')];
    if (!fern(opts, 0.11)) continue;
    const P = pB ? `\\dfrac{${pB[0]}}{${pB[1]}}` : ft(p, 4), Q = pB ? `\\dfrac{${pB[1] - pB[0]}}{${pB[1]}}` : ft(q, 4), gl = (x, d) => `${rundTex(x, d).startsWith('\\approx') ? '' : '='}${rundTex(x, d)}`;
    if (L === 2) prompt = `Bei einer Tombola gewinnt jedes Los mit einer Wahrscheinlichkeit von ${pct(p)} %. Jemand kauft ${n} Lose, ${tex('X')} zählt die Gewinnlose. Wie groß ist der Erwartungswert von ${tex('X')}?`;
    else if (L === 4) prompt = `Eine Saatgut-Sorte keimt mit einer Wahrscheinlichkeit von ${pct(p)} %. Es werden ${n} Samen ausgesät, ${tex('X')} zählt die gekeimten Samen. Wie groß ist die Standardabweichung von ${tex('X')} (auf zwei Nachkommastellen)?`;
    else if (L === 1) prompt = `Ein Glücksrad wird ${n}-mal gedreht. Bei jeder Drehung gewinnt man mit der Wahrscheinlichkeit ${fmt(p)}. Wie viele Gewinne sind zu erwarten (Erwartungswert)?`;
    else if (L !== 5) { prompt = `Ein Glücksrad zeigt mit Wahrscheinlichkeit ${tex('p')} „Gewinn“. Es wird ${tex('n')}-mal gedreht, ${tex('X')} zählt die Gewinne. Wie groß ist ${askSigma ? 'die Standardabweichung' : 'der Erwartungswert'}?`; formula = `n=${n},\\quad p=${ft(p)}`; }
    const proz = L === 2 || L === 4 ? [`Schreibe die Prozentangabe als Dezimalzahl: ${tex(`p=${P}`)}.`] : [];
    const hints = askSigma ? [...vorab, ...proz, `${tex('X')} ist binomialverteilt${L >= 4 ? ` mit ${tex(`n=${n}`)} und ${tex(`p=${P}`)}` : ''}: ${tex('\\sigma=\\sqrt{n\\,p\\,(1-p)}')}.`,
      `${L >= 4 ? `Varianz: ${tex(`n\\,p\\,(1-p)=${n}\\cdot ${P}\\cdot ${Q}${gl(vr, pB ? 2 : 4)}`)}` : `${tex(`n\\,p\\,(1-p)=${ft(vr)}`)}`} – jetzt die Wurzel ziehen.`]
      : [...vorab, ...proz, `Erwartungswert: ${tex('\\mu=n\\cdot p')}.`, `Rechne ${tex(`${n}\\cdot ${P}`)}.`];
    const explain = vorText + (askSigma ? `${tex(`\\sigma=\\sqrt{${n}\\cdot ${P}\\cdot ${Q}}${pB ? '' : `=\\sqrt{${ft(vr, 4)}}`}${gl(sg, 2)}`)}.` : `${tex(`\\mu=n\\cdot p=${n}\\cdot ${P}${gl(mu, 2)}`)}.`);
    const out = { prompt, options: shuffle(opts), hints, explain, n, p, askSigma };
    if (formula) out.formula = formula;
    return out;
  }
}

/** Potenz einer Dezimalzahl ohne „hoch 1“. */
const hochZ = (P, e) => (e === 1 ? P : `${P}^{${e}}`);
const binom = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return Math.round(r); };
const SERIEN = [['Eine Basketballerin trifft jeden Freiwurf mit einer Wahrscheinlichkeit von', 'Sie wirft', 'Freiwürfe'], ['Ein Bogenschütze trifft die Mitte der Scheibe mit einer Wahrscheinlichkeit von', 'Er schießt', 'Pfeile'],
  ['Eine Elfmeterschützin verwandelt jeden Elfmeter mit einer Wahrscheinlichkeit von', 'Sie schießt', 'Elfmeter'], ['Ein Dartspieler trifft das gewünschte Feld mit einer Wahrscheinlichkeit von', 'Er wirft', 'Pfeile']];

/**
 * Bernoulli-Kette: Welche Rechnung bzw. welcher Wert gehört zur gesuchten Wahrscheinlichkeit?
 * Stufe 1: nur Treffer oder kein Treffer (ein Pfad) · 2: genau k Treffer, kleines n · 3: Sachtext mit Prozentangabe, größeres n ·
 * 4: „mindestens ein“ (Gegenereignis) oder Fehlversuche zählen (p umrechnen) · 5: Wert mit krummen Zahlen ausrechnen (vier Nachkommastellen).
 */
export function genBinomial(lv = 3) {
  for (;;) {
    const L = stufe(lv);
    const BF = `Bernoulli-Formel: ${tex('P(X=k)=\\binom{n}{k}p^k(1-p)^{n-k}')}.`;
    if (L === 1) {
      const p = pick([0.2, 0.3, 0.4, 0.6, 0.7]), q = +(1 - p).toFixed(1), n = ri(2, 4), alle = rand() < 0.5, P = ft(alle ? p : q), Q = ft(alle ? q : p), w = alle ? p : q, k = alle ? n : 0;
      const opts = [
        { tex: `${hochZ(P, n)}`, correct: true, num: w ** n },
        { tex: `${n}\\cdot ${P}`, correct: false, why: 'Entlang eines Pfades werden die Wahrscheinlichkeiten malgenommen, nicht addiert.', num: n * w },
        { tex: `${hochZ(Q, n)}`, correct: false, why: alle ? `Das ist die Wahrscheinlichkeit für <b>keinen</b> Treffer: ${tex(Q)} gehört zum Nicht-Treffer.` : `Das ist die Wahrscheinlichkeit für <b>nur</b> Treffer. Kein Treffer hat die Wahrscheinlichkeit ${tex(`1-${Q}=${P}`)}.`, num: (1 - w) ** n },
        { tex: `1-${hochZ(P, n)}`, correct: false, why: 'Das ist das Gegenereignis – also genau das, was nicht gefragt ist.', num: 1 - w ** n },
      ];
      return {
        prompt: `${tex('X')} zählt die Treffer bei ${n} Versuchen mit Trefferwahrscheinlichkeit ${tex('p')}. Welche Rechnung liefert die Wahrscheinlichkeit für <b>${alle ? `${n} Treffer` : 'keinen Treffer'}</b>?`,
        formula: `n=${n},\\quad p=${ft(p)}`, options: shuffle(opts),
        hints: [`Es gibt nur einen passenden Pfad: ${n}-mal hintereinander ${alle ? 'Treffer' : `kein Treffer (Wahrscheinlichkeit ${tex(`1-${ft(p)}=${P}`)})`}.`, 'Pfadregel: Entlang des Pfades die Wahrscheinlichkeiten malnehmen.'],
        explain: `${tex(`P(X=${k})=${hochZ(P, n)}`)}.`, n, p, k, kind: 'eq',
      };
    }
    if (L === 5) {
      const pT = pick([0.15, 0.35, 0.45, 0.55, 0.65, 0.85]), n = ri(8, 12), fehl = rand() < 0.5, p = fehl ? +(1 - pT).toFixed(2) : pT, q = +(1 - p).toFixed(2);
      const k = ri(Math.max(1, Math.round(n * p) - 2), Math.min(n - 1, Math.round(n * p) + 2)), S = pick(SERIEN), C = binom(n, k), val = C * p ** k * q ** (n - k);
      if (k === n - k) continue;
      const N = (num, correct, why) => ({ tex: rundTex(num, 4), num, correct, why });
      const opts = [N(val, true), N(p ** k * q ** (n - k), false, `Das ist nur <b>ein</b> Pfad. Es fehlt die Anzahl der Pfade ${tex(`\\binom{${n}}{${k}}=${C}`)}.`),
        N(C * q ** k * p ** (n - k), false, fehl ? `Hier wurde mit der Trefferwahrscheinlichkeit gerechnet. ${tex('X')} zählt die Fehlversuche, also ${tex(`p=${ft(p)}`)}.` : `Die Exponenten sind vertauscht: ${tex(`p=${ft(p)}`)} gehört zu ${k === 1 ? 'dem einen Treffer' : `den ${k} Treffern`}.`),
        N(C * p ** k * q ** n, false, `Der Exponent von ${tex('1-p')} ist ${tex(`n-k=${n - k}`)}, nicht ${tex(`n=${n}`)}.`)];
      if (val < 0.02 || opts.some((o) => o.num < 0.0001) || !fern(opts, 0.011)) continue;
      const B = `\\binom{${n}}{${k}}`, P = ft(p), Q = ft(q);
      return {
        prompt: `${S[0]} ${fmt(pT * 100)} %. ${S[1]} ${n} ${S[2]}, ${tex('X')} zählt die ${fehl ? 'Fehlversuche' : 'Treffer'}. Wie groß ist die Wahrscheinlichkeit für <b>genau ${k} ${fehl ? (k === 1 ? 'Fehlversuch' : 'Fehlversuche') : 'Treffer'}</b> (auf vier Nachkommastellen)?`,
        options: shuffle(opts),
        hints: [fehl ? `${tex('X')} zählt die Fehlversuche. Deshalb ist ${tex('p')} in der Bernoulli-Formel hier die Fehlversuch-Wahrscheinlichkeit (Gegenwahrscheinlichkeit): ${tex(`p=1-${ft(pT)}=${P}`)}.` : `${tex('X')} zählt die Treffer: ${tex(`p=${P}`)} und ${tex(`1-p=${Q}`)}.`,
          `${BF} Hier: ${tex(`n=${n}`)}, ${tex(`k=${k}`)}.`, `Anzahl der Pfade: ${tex(`${B}=\\dfrac{${n}!}{${k}!\\cdot ${n - k}!}=${C}`)}.`,
          `Potenzen: ${[[P, p, k], [Q, q, n - k]].filter(([, , e]) => e > 1).map(([B0, b0, e]) => tex(`${B0}^{${e}}\\approx ${ft(b0 ** e, 6)}`)).join(' und ')}.`, 'Alle drei Faktoren malnehmen und auf vier Nachkommastellen runden.'],
        explain: `${fehl ? `Gegenwahrscheinlichkeit: ${tex(`p=1-${ft(pT)}=${P}`)}. ` : ''}${tex(`P(X=${k})=${B}\\cdot ${hochZ(P, k)}\\cdot ${hochZ(Q, n - k)}=${C}\\cdot ${hochZ(P, k)}\\cdot ${hochZ(Q, n - k)}${rundTex(val, 4).startsWith('\\approx') ? '' : '='}${rundTex(val, 4)}`)}.`, n, p, k, kind: 'eq',
      };
    }
    if (L === 4 && rand() < 0.5) {
      // „mindestens ein“ über das Gegenereignis, Wert ausrechnen – in der Hälfte der Fälle werden die Fehlversuche gezählt (p erst umrechnen)
      const pT = pick([0.2, 0.3, 0.4, 0.6, 0.7]), fehl = rand() < 0.5, p = fehl ? +(1 - pT).toFixed(1) : pT, q = +(1 - p).toFixed(1), n = ri(3, 7), P = ft(p), Q = ft(q), S = pick(SERIEN);
      const was = fehl ? 'Fehlversuch' : 'Treffer', gegen = fehl ? 'kein Fehlversuch, also nur Treffer' : 'kein Treffer';
      const N = (num, correct, why) => ({ tex: rundTex(num, 4), num, correct, why });
      const opts = [N(1 - q ** n, true), N(p ** n, false, `Das ist die Wahrscheinlichkeit für <b>nur</b> ${fehl ? 'Fehlversuche' : 'Treffer'}: ${tex(hochZ(P, n))}.`),
        N(1 - p ** n, false, `Das Gegenereignis zu „mindestens ein ${was}“ ist „${gegen}“, also ${tex(hochZ(Q, n))} – nicht ${tex(hochZ(P, n))}.`),
        N(n * p * q ** (n - 1), false, `Das ist die Wahrscheinlichkeit für <b>genau</b> einen ${was}: ${tex(`${n}\\cdot ${P}\\cdot ${hochZ(Q, n - 1)}`)}.`)];
      if (Math.abs(n * p - q) < 1e-9 || opts.some((o) => o.num < 0.001 || o.num > 0.999) || !fern(opts, 0.011)) continue;
      return {
        prompt: `${S[0]} ${fmt(pT * 100)} %. ${S[1]} ${n} ${S[2]}, ${tex('X')} zählt die ${fehl ? 'Fehlversuche' : 'Treffer'}. Wie groß ist die Wahrscheinlichkeit für <b>mindestens einen</b> ${was} (auf vier Nachkommastellen)?`,
        options: shuffle(opts),
        hints: [`„Mindestens ein ${was}“ umfasst viele Fälle (1, 2, 3, … ${fehl ? 'Fehlversuche' : 'Treffer'}) – einfacher ist das Gegenereignis.`,
          `Das Gegenereignis ist „${gegen}“: ${n}-mal hintereinander ${fehl ? `getroffen, jedes Mal mit ${tex(Q)}` : `daneben, jedes Mal mit ${tex(`1-${P}=${Q}`)}`}.`,
          `Pfadregel: ${tex(`P(X=0)=${hochZ(Q, n)}${rundTex(q ** n, 6).startsWith('\\approx') ? '' : '='}${rundTex(q ** n, 6)}`)}.`, 'Das von 1 abziehen und runden.'],
        explain: `Gegenereignis: ${tex(`P(X\\ge 1)=1-P(X=0)=1-${hochZ(Q, n)}${rundTex(1 - q ** n, 4).startsWith('\\approx') ? '' : '='}${rundTex(1 - q ** n, 4)}`)}${fehl ? ` (${tex('X')} zählt die Fehlversuche; „kein Fehlversuch“ heißt ${n} Treffer mit je ${tex(Q)})` : ''}.`, n, p, kind: 'min1',
      };
    }
    // genau k: Stufe 2 nackt, Stufe 3 im Sachtext, Stufe 4 mit Fehlversuchen (p umrechnen)
    const pT = pick([0.2, 0.3, 0.4, 0.6, 0.7]), fehl = L === 4, p = fehl ? +(1 - pT).toFixed(1) : pT, q = +(1 - p).toFixed(1);
    const n = ri(tier(L, 3, 3, 6, 6), tier(L, 4, 5, 10, 10)), P = ft(p), Q = ft(q), S = pick(SERIEN);
    let k; do { k = ri(1, n - 1); } while (k === n - k);
    const B = `\\binom{${n}}{${k}}`, C = binom(n, k);
    const opts = [
      { tex: `${B}\\cdot ${hochZ(P, k)}\\cdot ${hochZ(Q, n - k)}`, correct: true, num: C * p ** k * q ** (n - k) },
      { tex: `${hochZ(P, k)}\\cdot ${hochZ(Q, n - k)}`, correct: false, why: `Das ist nur <b>ein</b> Pfad. Es fehlt die Anzahl der Pfade ${tex(B)}.`, num: p ** k * q ** (n - k) },
      { tex: `${B}\\cdot ${hochZ(P, n - k)}\\cdot ${hochZ(Q, k)}`, correct: false, why: fehl ? `Hier wurde mit der Trefferwahrscheinlichkeit gerechnet. ${tex('X')} zählt die Fehlversuche: ${tex(`p=1-${ft(pT)}=${P}`)} gehört zum Exponenten ${k}.` : `Die Exponenten sind vertauscht: ${tex('p')} gehört zu ${k === 1 ? 'dem einen Treffer' : `den ${k} Treffern`}.`, num: C * p ** (n - k) * q ** k },
      { tex: `${B}\\cdot ${hochZ(P, k)}`, correct: false, why: `${n - k === 1 ? `Der eine ${fehl ? 'Treffer' : 'Nicht-Treffer'} fehlt` : `Die ${n - k} ${fehl ? 'Treffer' : 'Nicht-Treffer'} fehlen`}: Faktor ${tex(`${hochZ(Q, n - k)}`)}.`, num: C * p ** k },
    ];
    const out = {
      prompt: L === 2 ? `${tex('X')} ist binomialverteilt. Welche Rechnung liefert ${tex(`P(X=${k})`)}?`
        : `${S[0]} ${fmt(pT * 100)} %. ${S[1]} ${n} ${S[2]}, ${tex('X')} zählt die ${fehl ? 'Fehlversuche' : 'Treffer'}. Welche Rechnung liefert die Wahrscheinlichkeit für <b>genau ${k} ${fehl ? (k === 1 ? 'Fehlversuch' : 'Fehlversuche') : 'Treffer'}</b>?`,
      options: shuffle(opts),
      hints: L === 2 ? [BF, `${k} Treffer und ${n - k} Nicht-Treffer – und alle Reihenfolgen zählen.`]
        : [fehl ? `${tex('X')} zählt die Fehlversuche. Deshalb ist ${tex('p')} in der Bernoulli-Formel hier die Fehlversuch-Wahrscheinlichkeit (Gegenwahrscheinlichkeit): ${tex(`p=1-${ft(pT)}=${P}`)}.` : `Lies ab: ${tex(`n=${n}`)}, ${tex(`k=${k}`)}, ${tex(`p=${P}`)} und ${tex(`1-p=${Q}`)}.`,
          BF, `${k} ${fehl ? (k === 1 ? 'Fehlversuch' : 'Fehlversuche') : 'Treffer'} mit ${tex(P)}, ${n - k} ${fehl ? 'Treffer' : 'Nicht-Treffer'} mit ${tex(Q)} – und alle ${tex(`${B}=\\dfrac{${n}!}{${k}!\\cdot ${n - k}!}=${C}`)} Reihenfolgen zählen.`],
      explain: `${fehl ? `Gegenwahrscheinlichkeit: ${tex(`p=1-${ft(pT)}=${P}`)}. ` : ''}${tex(`P(X=${k})=${B}\\cdot ${hochZ(P, k)}\\cdot ${hochZ(Q, n - k)}`)}.`, n, p, k, kind: 'eq',
    };
    if (L === 2) out.formula = `n=${n},\\quad p=${P}`;
    return out;
  }
}

/**
 * Zweistufiges Ziehen aus einer Urne (Baumdiagramm, Pfadregeln).
 * Stufe 1: mit Zurücklegen, Rechnung wählen · 2: ohne Zurücklegen, Rechnung wählen · 3: ohne Zurücklegen, Wert als gekürzter Bruch ·
 * 4: zwei Pfade (verschiedene Farben), gekürzter Bruch · 5: drei Sorten im Sachtext, „genau ein“ über zwei Pfade, Ergebnis in Prozent.
 */
export function genBaum(lv = 3) {
  for (;;) {
    const L = stufe(lv);
    const r = ri(2, tier(L, 5, 5, 6, 6, 6)), bl = ri(2, tier(L, 5, 5, 6, 6, 7)), gr = L === 5 ? ri(2, 8) : 0, b = bl + gr, N = r + b;
    const ohne = L >= 2, versch = L >= 4;
    const mk = (t, num, correct, why) => ({ tex: t, num, correct, why });
    const B = (z, n, correct, why) => ({ tex: bruch(z, n), num: z / n, correct, why });
    const Pz = (z, n, correct, why) => ({ tex: `${rundTex((100 * z) / n, 1)}\\,\\%`, num: z / n, correct, why });
    let opts, ask, explain, hints, prompt;
    if (L === 5) {
      const W = Pz, pfad = `${frac(r, N)}\\cdot ${frac(b, N - 1)}`, [kz, kn] = kuerze(2 * r * b, N * (N - 1));
      opts = [W(2 * r * b, N * (N - 1), true), W(r * b, N * (N - 1), false, 'Es gibt zwei passende Pfade: erst Hauptgewinn, dann keiner – und umgekehrt.'),
        W(2 * r * bl, N * (N - 1), false, `Auch die Nieten zählen als „kein Hauptgewinn“: Das sind ${bl}+${gr}=${b} Lose.`),
        W(2 * r * b, N * N, false, `Ohne Zurücklegen sind beim zweiten Zug nur noch ${N - 1} Lose da.`)];
      prompt = `In einer Lostrommel liegen ${r} Hauptgewinne, ${bl} Trostpreise und ${gr} Nieten. Jemand zieht nacheinander zwei Lose (ohne Zurücklegen). Wie groß ist die Wahrscheinlichkeit für <b>genau einen</b> Hauptgewinn? Runde auf eine Nachkommastelle.`;
      hints = [`Fasse zusammen: ${r} Hauptgewinne und ${bl}+${gr}=${b} andere Lose, zusammen ${N}.`, 'Zwei Pfade passen: erst Hauptgewinn, dann keiner – oder erst keiner, dann Hauptgewinn.',
        `1. Pfadregel (ohne Zurücklegen): ${tex(`${pfad}=${bruch(r * b, N * (N - 1))}`)} – der zweite Pfad ${tex(`${frac(b, N)}\\cdot ${frac(r, N - 1)}`)} ist genauso groß.`,
        `2. Pfadregel (Summenregel): beide Pfade addieren: ${tex(`2\\cdot ${bruch(r * b, N * (N - 1))}=${bruch(kz, kn)}`)}.`, 'Zum Schluss den Bruch als Prozentzahl schreiben.'];
      explain = `Zwei Pfade: ${tex(`${pfad}+${frac(b, N)}\\cdot ${frac(r, N - 1)}=${bruch(kz, kn)}${rundTex((100 * kz) / kn, 1).startsWith('\\approx') ? '' : '='}${rundTex((100 * kz) / kn, 1)}\\,\\%`)}.`;
    } else if (L === 4) {
      const pfad = `${frac(r, N)}\\cdot ${frac(bl, N - 1)}`, D = N * (N - 1);
      opts = [B(2 * r * b, D, true), B(r * b, D, false, 'Es gibt zwei passende Pfade: rot–blau und blau–rot.'),
        B(2 * r * b, N * N, false, `Ohne Zurücklegen sind beim zweiten Zug nur noch ${N - 1} Kugeln da.`),
        B(D - 2 * r * b, D, false, 'Das ist die Wahrscheinlichkeit für zwei <b>gleichfarbige</b> Kugeln – das Gegenereignis.')];
      ask = 'zwei <b>verschiedenfarbige</b> Kugeln';
      hints = ['Zeichne im Kopf das Baumdiagramm mit zwei Stufen. Zwei Pfade passen: rot–blau und blau–rot.', `1. Pfadregel für rot–blau: ${tex(`${pfad}=${bruch(r * b, D)}`)} – nach dem ersten Zug fehlt eine Kugel.`,
        `Für blau–rot: ${tex(`${frac(bl, N)}\\cdot ${frac(r, N - 1)}=${bruch(r * b, D)}`)}.`, '2. Pfadregel (Summenregel): Die beiden Pfade addieren und kürzen.'];
      explain = `Zwei Pfade: ${tex(`${pfad}+${frac(bl, N)}\\cdot ${frac(r, N - 1)}=2\\cdot ${bruch(r * b, D)}=${bruch(2 * r * b, D)}`)}.`;
    } else if (L === 3) {
      const D = N * (N - 1);
      opts = [B(r * (r - 1), D, true), B(r * r, N * N, false, 'Das gilt mit Zurücklegen. Ohne Zurücklegen ist beim zweiten Zug eine rote Kugel weniger da.'),
        B(r * (N - 1) + (r - 1) * N, D, false, 'Entlang eines Pfades wird multipliziert, nicht addiert.'),
        B(r * (r - 1), N * N, false, `Auch der Nenner wird kleiner: Es sind nur noch ${N - 1} Kugeln in der Urne.`)];
      ask = 'zwei <b>rote</b> Kugeln';
      hints = ['Zeichne im Kopf das Baumdiagramm mit zwei Stufen.', `Erster Zug rot: ${tex(frac(r, N))}. Danach fehlt eine rote Kugel: ${tex(frac(r - 1, N - 1))}.`, `1. Pfadregel: entlang des Pfades malnehmen – ${tex(`${frac(r, N)}\\cdot ${frac(r - 1, N - 1)}`)}.`, 'Zum Schluss kürzen.'];
      explain = `1. Pfadregel: ${tex(`${frac(r, N)}\\cdot ${frac(r - 1, N - 1)}=${frac(r * (r - 1), D)}${bruch(r * (r - 1), D) === frac(r * (r - 1), D) ? '' : `=${bruch(r * (r - 1), D)}`}`)}.`;
    } else if (ohne) {
      ask = 'zwei <b>rote</b> Kugeln';
      opts = [
        mk(`${frac(r, N)}\\cdot ${frac(r - 1, N - 1)}`, (r * (r - 1)) / (N * (N - 1)), true),
        mk(`${frac(r, N)}\\cdot ${frac(r, N)}`, (r * r) / (N * N), false, 'Das gilt mit Zurücklegen. Ohne Zurücklegen ist beim zweiten Zug eine rote Kugel weniger da.'),
        mk(`${frac(r, N)}+${frac(r - 1, N - 1)}`, r / N + (r - 1) / (N - 1), false, 'Entlang eines Pfades wird multipliziert, nicht addiert.'),
        mk(`${frac(r, N)}\\cdot ${frac(r - 1, N)}`, (r * (r - 1)) / (N * N), false, `Auch der Nenner wird kleiner: Es sind nur noch ${N - 1} Kugeln in der Urne.`),
      ];
      hints = ['Zeichne im Kopf das Baumdiagramm mit zwei Stufen.', 'Entlang eines Pfades multiplizieren (1. Pfadregel).', `Nach dem ersten Zug fehlt eine rote Kugel: Es sind noch ${r - 1} rote unter ${N - 1} Kugeln.`];
      explain = `1. Pfadregel: ${tex(`${frac(r, N)}\\cdot ${frac(r - 1, N - 1)}`)}.`;
    } else {
      ask = 'zwei <b>rote</b> Kugeln';
      opts = [
        mk(`${frac(r, N)}\\cdot ${frac(r, N)}`, (r * r) / (N * N), true),
        mk(`${frac(r, N)}\\cdot ${frac(r - 1, N - 1)}`, (r * (r - 1)) / (N * (N - 1)), false, 'Das gilt ohne Zurücklegen. Mit Zurücklegen bleibt die Urne gleich.'),
        mk(`${frac(r, N)}+${frac(r, N)}`, (2 * r) / N, false, 'Entlang eines Pfades wird multipliziert, nicht addiert.'),
        r === b ? mk(`${frac(r, N)}\\cdot ${frac(r, N - 1)}`, (r * r) / (N * (N - 1)), false, 'Mit Zurücklegen bleibt auch die Anzahl aller Kugeln gleich – der Nenner ändert sich nicht.') : mk(`${frac(r, N)}\\cdot ${frac(b, N)}`, (r * b) / (N * N), false, 'Das wäre erst rot, dann blau.'),
      ];
      hints = [`Mit Zurücklegen ist bei jedem Zug dieselbe Urne da: ${r} von ${N} Kugeln sind rot.`, 'Entlang des Pfades „rot – rot“ malnehmen.'];
      explain = `Beide Züge: ${tex(`${frac(r, N)}\\cdot ${frac(r, N)}`)}.`;
    }
    if (!fern(opts, L >= 3 ? 0.006 : 1e-6)) continue;
    if (!prompt) prompt = `In einer Urne liegen ${r} rote und ${b} blaue Kugeln. Es wird zweimal <b>${ohne ? 'ohne' : 'mit'} Zurücklegen</b> gezogen. ${L >= 3 ? 'Wie groß ist' : 'Welche Rechnung liefert'} die Wahrscheinlichkeit für ${ask}?${L >= 3 ? ' Gib den gekürzten Bruch an.' : ''}`;
    return { prompt, options: shuffle(opts), hints, explain, r, b, ohne, versch: versch && ohne };
  }
}

/* ───────────── Geometrie ───────────── */

const rv = (R, dim = 3) => Array.from({ length: dim }, () => ri(-R, R));
const same = (a, b) => a.every((c, i) => c === b[i]);
const punkt = (n, v) => `${n}(${v.map((c) => ft(c)).join('\\mid')})`;
const diff = (a, b) => a.map((c, i) => c - b[i]);
const skal = (u, v) => u.reduce((s, c, j) => s + c * v[j], 0);
/** Spaltenvektor aus fertigen Formel-Zeilen (für Rechnungen wie „3-(-2)“). */
const vecRoh = (v) => `\\begin{pmatrix}${v.join('\\\\')}\\end{pmatrix}`;
const zweiZeilen = (a, b) => `\\begin{array}{l}${a}\\\\[6pt]${b}\\end{array}`;

/**
 * Verbindungsvektor zweier Punkte.
 * Stufe 1: in der Ebene, positive Koordinaten · 2: im Raum, positive Koordinaten · 3: mit negativen Koordinaten ·
 * 4: B ist erst über den Mittelpunkt der Strecke zu bestimmen · 5: B über ein Teilverhältnis oder den Schwerpunkt eines Dreiecks.
 */
export function genVektorAB(lv = 3) {
  for (;;) {
    const L = stufe(lv), AB = tex('\\overrightarrow{AB}');
    const mk = (vec, correct, why) => ({ tex: vecTex(vec), vec, correct, why });
    let A, B, opts, formula, hints, explain, prompt = `Bestimme den Vektor ${AB}.`;
    if (L <= 3) {
      const R = tier(L, 5, 6, 6), dim = L === 1 ? 2 : 3;
      A = rv(R, dim); B = rv(R, dim);
      if (L <= 2) { A = A.map(Math.abs); B = B.map(Math.abs); } else if (![...A, ...B].some((c) => c < 0)) continue;
      opts = [mk(diff(B, A), true),
        mk(diff(A, B), false, `Das ist ${tex('\\overrightarrow{BA}')}. Merke: Spitze minus Fuß, also ${tex('B-A')}.`),
        mk(A.map((c, i) => c + B[i]), false, 'Die Koordinaten werden subtrahiert, nicht addiert.'),
        mk(A.map((c, i) => (c + B[i]) / 2), false, `Das ist der Mittelpunkt der Strecke ${tex('AB')}, kein Verbindungsvektor.`)];
      formula = `${punkt('A', A)},\\quad ${punkt('B', B)}`;
      hints = ['Spitze minus Fuß.', `Rechne für jede Koordinate ${tex('b_i-a_i')}${L === 3 ? ` – Vorsicht bei negativen Zahlen: ${tex('3-(-2)=5')}` : ''}.`];
      explain = L === 1 ? `${tex(`\\overrightarrow{AB}=${vecTex(diff(B, A))}`)} (Spitze minus Fuß).`
        : `${tex(`\\overrightarrow{AB}=${vecRoh(B.map((c, i) => `${ft(c)}-${par(A[i])}`))}=${vecTex(diff(B, A))}`)}.`;
    } else if (L === 4) {
      A = rv(5); const M = rv(5), AM = diff(M, A); B = M.map((c, i) => 2 * c - A[i]);
      opts = [mk(diff(B, A), true), mk(AM, false, `Das ist ${tex('\\overrightarrow{AM}')} – nur die halbe Strecke. ${tex('B')} liegt doppelt so weit von ${tex('A')} entfernt.`),
        mk(diff(A, B), false, `Das ist ${tex('\\overrightarrow{BA}')}. Merke: Spitze minus Fuß.`),
        mk(A.map((c, i) => c + M[i]), false, 'Die Koordinaten werden subtrahiert, nicht addiert – und dann verdoppelt.')];
      prompt = `${tex('M')} ist der Mittelpunkt der Strecke ${tex('AB')}. Bestimme den Vektor ${AB}.`;
      formula = `${punkt('A', A)},\\quad ${punkt('M', M)}`;
      hints = [`${tex('B')} ist nicht gegeben – aber ${tex('M')} liegt genau in der Mitte: ${tex('\\overrightarrow{AB}=2\\cdot\\overrightarrow{AM}')}.`, `Spitze minus Fuß: ${tex(`\\overrightarrow{AM}=${vecRoh(M.map((c, i) => `${ft(c)}-${par(A[i])}`))}=${vecTex(AM)}`)}.`, 'Jede Koordinate verdoppeln.'];
      explain = `${tex(`\\overrightarrow{AM}=${vecTex(AM)}`)}, also ${tex(`\\overrightarrow{AB}=2\\cdot ${vecTex(AM)}=${vecTex(diff(B, A))}`)}.`;
    } else if (rand() < 0.5) {
      // T teilt AB im Verhältnis m:n  →  AB = (m+n)/m · AT
      const [m, n] = pick([[1, 2], [1, 3], [2, 3], [2, 1], [4, 1]]), k = (m + n) / m, T = rv(5), AT = (A = rv(5), diff(T, A));
      B = A.map((c, i) => c + k * AT[i]);
      opts = [mk(diff(B, A), true), mk(AT, false, `Das ist ${tex('\\overrightarrow{AT}')} – erst ${m === 1 ? 'einer' : m} von ${m + n} Teilen der Strecke.`),
        mk(AT.map((c) => (c * n) / m), false, `Das ist ${tex('\\overrightarrow{TB}')}, das Reststück. Gesucht ist die ganze Strecke: ${m}+${n}=${m + n} Teile.`),
        mk(AT.map((c) => -c * k), false, `Das ist ${tex('\\overrightarrow{BA}')}. Merke: Spitze minus Fuß.`)];
      prompt = `Der Punkt ${tex('T')} liegt auf der Strecke ${tex('AB')} und teilt sie im Verhältnis ${tex(`\\overline{AT}:\\overline{TB}=${m}:${n}`)}. Bestimme den Vektor ${AB}.`;
      formula = `${punkt('A', A)},\\quad ${punkt('T', T)}`;
      hints = [`Die Strecke besteht aus ${m}+${n}=${m + n} gleichen Teilen, ${tex('\\overrightarrow{AT}')} ist ${m === 1 ? 'einer' : m} davon.`, `Also ${tex(`\\overrightarrow{AB}=\\dfrac{${m + n}}{${m}}\\cdot\\overrightarrow{AT}=${ft(k)}\\cdot\\overrightarrow{AT}`)}.`,
        `Spitze minus Fuß: ${tex(`\\overrightarrow{AT}=${vecRoh(T.map((c, i) => `${ft(c)}-${par(A[i])}`))}=${vecTex(AT)}`)}.`, `Jede Koordinate mit ${tex(ft(k))} malnehmen.`];
      explain = `${tex(`\\overrightarrow{AT}=${vecTex(AT)}`)} ist ${m === 1 ? 'einer' : m} von ${m + n} Teilen, also ${tex(`\\overrightarrow{AB}=${ft(k)}\\cdot ${vecTex(AT)}=${vecTex(diff(B, A))}`)}.`;
    } else {
      // Schwerpunkt S des Dreiecks ABC: B = 3S − A − C
      A = rv(4); const C = rv(4), S = rv(3); B = S.map((c, i) => 3 * c - A[i] - C[i]);
      opts = [mk(diff(B, A), true), mk(B, false, `Das ist der Ortsvektor von ${tex('B')}. Für ${AB} noch ${tex('A')} abziehen (Spitze minus Fuß).`),
        mk(S.map((c, i) => 2 * c - A[i] - C[i] - A[i]), false, `Beim Schwerpunkt wird durch 3 geteilt, nicht durch 2: ${tex('B=3S-A-C')}.`),
        mk(diff(A, B), false, `Das ist ${tex('\\overrightarrow{BA}')}. Merke: Spitze minus Fuß.`)];
      prompt = `${tex('S')} ist der Schwerpunkt des Dreiecks ${tex('ABC')}. Bestimme den Vektor ${AB}.`;
      formula = zweiZeilen(`${punkt('A', A)},\\quad ${punkt('C', C)}`, punkt('S', S));
      hints = [`Schwerpunkt: ${tex('S=\\tfrac{1}{3}(A+B+C)')} – jede Koordinate ist der Mittelwert der drei Ecken.`, `Nach ${tex('B')} umstellen: ${tex('B=3S-A-C')}.`,
        `${tex(`B=${vecRoh(S.map((c, i) => `3\\cdot ${par(c)}-${par(A[i])}-${par(C[i])}`))}=${vecTex(B)}`)}.`, `Jetzt Spitze minus Fuß: ${tex('\\overrightarrow{AB}=B-A')}.`];
      explain = `Aus ${tex('S=\\tfrac{1}{3}(A+B+C)')} folgt ${tex(`B=3S-A-C=${vecTex(B)}`)}. Dann ${tex(`\\overrightarrow{AB}=${vecTex(B)}-${vecTex(A)}=${vecTex(diff(B, A))}`)}.`;
    }
    if (opts.some((a, i) => opts.some((b, j) => i < j && same(a.vec, b.vec)))) continue;
    return { prompt, formula, options: shuffle(opts), hints, explain, A, B };
  }
}

const TRIPLES = [[[0, 3, 4], 5], [[1, 2, 2], 3], [[2, 3, 6], 7], [[4, 4, 7], 9], [[1, 4, 8], 9], [[2, 6, 9], 11], [[6, 6, 7], 11], [[3, 4, 12], 13], [[2, 10, 11], 15]];

/**
 * Betrag (Länge) eines Vektors.
 * Stufe 1: glatte Länge, positive Koordinaten · 2: mit Minuszeichen · 3: Vektor erst aus zwei Punkten bilden ·
 * 4: aus zwei Punkten, Ergebnis ist eine krumme Wurzel (runden) · 5: erst eine Linearkombination zweier Vektoren bilden, krumme Wurzel.
 */
export function genBetrag(lv = 3) {
  for (;;) {
    const L = stufe(lv);
    let v, formula, prompt = `Wie lang ist der Vektor ${tex('\\vec v')}?`, vor = [], vorText = '', dritte = null;
    if (L <= 3) {
      // Je Stufe ein eigener Ausschnitt der Liste: oben nur noch die größeren Tripel, nicht wieder die leichten.
      const [base] = pick(TRIPLES.slice(tier(L, 0, 0, 2), tier(L, 3, 5, 7)));
      v = shuffle(base).map((c) => (L >= 2 && rand() < 0.5 ? -c : c));
      if (L === 2 && !v.some((c) => c < 0)) continue;
    } else if (L === 4) { v = rv(6); }
    if (L === 3 || L === 4) {
      const A = rv(4), B = A.map((c, i) => c + v[i]);
      prompt = `Wie lang ist die Strecke von ${tex('A')} nach ${tex('B')}?`; formula = `${punkt('A', A)},\\quad ${punkt('B', B)}`;
      vor = [`Bilde zuerst den Verbindungsvektor (Spitze minus Fuß): ${tex(`\\overrightarrow{AB}=${vecRoh(B.map((c, i) => `${ft(c)}-${par(A[i])}`))}=${vecTex(v)}`)}.`];
      vorText = `${tex(`\\overrightarrow{AB}=${vecTex(v)}`)}. `;
    } else if (L === 5) {
      const u = rv(4), w = rv(4), [r, s] = pick([[2, -3], [3, -2], [2, 3], [-2, 5], [3, 4], [4, -3]]);
      v = u.map((c, i) => r * c + s * w[i]);
      const komb = `${r}\\vec u${s < 0 ? '-' : '+'}${Math.abs(s)}\\vec w`;
      prompt = `Wie lang ist der Vektor ${tex(`\\vec v=${komb}`)}?`; formula = `\\vec u=${vecTex(u)},\\quad \\vec w=${vecTex(w)}`;
      vor = [`Berechne zuerst ${tex('\\vec v')} Zeile für Zeile: ${tex(`\\vec v=${vecRoh(u.map((c, i) => `${r}\\cdot ${par(c)}${s < 0 ? '-' : '+'}${Math.abs(s)}\\cdot ${par(w[i])}`))}`)}.`, `${tex(`\\vec v=${vecTex(v)}`)}.`];
      vorText = `${tex(`\\vec v=${komb}=${vecTex(v)}`)}. `;
      dritte = [Math.abs(r) * Math.hypot(...u) + Math.abs(s) * Math.hypot(...w), `Die Längen von ${tex('\\vec u')} und ${tex('\\vec w')} lassen sich nicht einfach verrechnen – erst den Vektor ${tex('\\vec v')} bilden, dann seine Länge.`];
    } else formula = `\\vec v=${vecTex(v)}`;
    const abs = v.map(Math.abs), sumAbs = abs[0] + abs[1] + abs[2], sq = skal(v, v), len = Math.sqrt(sq), glatt = Number.isInteger(len);
    if ((L <= 3 && !glatt) || (L >= 4 && (glatt || len < 3)) || (L === 5 && len < 11) || v.filter((c) => c !== 0).length < 2) continue;
    const mk = (num, correct, why) => ({ tex: rundTex(num), num, correct, why });
    const opts = [
      mk(len, true),
      mk(sumAbs, false, 'Die Koordinaten werden erst quadriert, dann addiert – und am Ende die Wurzel gezogen.'),
      mk(sq, false, 'Hier fehlt die Wurzel am Ende.'),
      dritte ? mk(dritte[0], false, dritte[1]) : mk(Math.max(...abs), false, 'Der Vektor ist länger als jede einzelne Koordinate.'),
    ];
    if (!fern(opts, 0.1)) continue;
    const quad = L === 1 ? abs.map((c) => `${c}^2`).join('+') : v.map((c) => `${par(c)}^2`).join('+'), name = L === 3 || L === 4 ? '\\overrightarrow{AB}' : '\\vec v';
    const hints = [...vor, `${tex(`|${name}|=\\sqrt{v_1^2+v_2^2+v_3^2}`)} (Pythagoras im Raum).`, `Unter der Wurzel steht ${tex(`${L === 1 ? '' : `${quad}=`}${abs.map((c) => c * c).join('+')}=${sq}`)}${L >= 2 ? ' – auch negative Zahlen werden beim Quadrieren positiv' : ''}.`];
    if (!glatt) hints.push(`${tex(`\\sqrt{${sq}}`)} ist keine ganze Zahl – mit dem Taschenrechner auf zwei Nachkommastellen runden.`);
    return {
      prompt, formula, options: shuffle(opts), hints,
      explain: `${vorText}${tex(`|${name}|=\\sqrt{${quad}}=\\sqrt{${sq}}${glatt ? '=' : ''}${rundTex(len)}`)}.`,
      v,
    };
  }
}

/**
 * Skalarprodukt berechnen (und Orthogonalität erkennen).
 * Stufe 1: in der Ebene, kleine positive Zahlen · 2: im Raum, erste Minuszeichen · 3: größere Zahlen, viele Minuszeichen ·
 * 4: Vektoren erst aus drei Punkten bilden · 5: erst zwei Linearkombinationen bilden, dann das Skalarprodukt.
 */
export function genSkalar(lv = 3) {
  for (;;) {
    const L = stufe(lv), R = tier(L, 4, 3, 5, 4, 3);
    let u = L === 1 ? rv(R, 2).map((c) => Math.abs(c) || 1) : rv(R), v = L === 1 ? rv(R, 2).map((c) => Math.abs(c) || 2) : rv(R);
    let formula, prompt = `Berechne das Skalarprodukt ${tex('\\vec u\\cdot\\vec v')}.`, vor = [], vorText = '', dritte = null, nu = '\\vec u', nv = '\\vec v';
    if (L >= 2 && L <= 4 && rand() < 0.4 && u[2] !== 0) {
      // orthogonal bauen: letzte Koordinate so wählen, dass das Skalarprodukt 0 wird
      const t = -(u[0] * v[0] + u[1] * v[1]) / u[2];
      if (Number.isInteger(t) && Math.abs(t) <= 12) v = [v[0], v[1], t];
    }
    if (L === 2 && [...u, ...v].filter((c) => c < 0).length > 3) continue;
    if (L === 4) {
      const A = rv(3), B = A.map((c, i) => c + u[i]), C = A.map((c, i) => c + v[i]); nu = '\\overrightarrow{AB}'; nv = '\\overrightarrow{AC}';
      if (u.every((c) => c === 0) || v.every((c) => c === 0) || same(u, v)) continue;
      prompt = `Berechne das Skalarprodukt ${tex(`${nu}\\cdot ${nv}`)}.`; formula = zweiZeilen(`${punkt('A', A)},\\quad ${punkt('B', B)}`, punkt('C', C));
      vor = [`Bilde zuerst die beiden Vektoren (Spitze minus Fuß): ${tex(`${nu}=${vecRoh(B.map((c, i) => `${ft(c)}-${par(A[i])}`))}=${vecTex(u)}`)}.`, `${tex(`${nv}=${vecRoh(C.map((c, i) => `${ft(c)}-${par(A[i])}`))}=${vecTex(v)}`)}.`];
      vorText = `${tex(`${nu}=${vecTex(u)}`)}, ${tex(`${nv}=${vecTex(v)}`)}. `;
      dritte = [skal(B, C), `Das ist das Skalarprodukt der Ortsvektoren von ${tex('B')} und ${tex('C')}. Erst die Verbindungsvektoren von ${tex('A')} aus bilden.`];
    } else if (L === 5) {
      const a = u, b = v, [r, s] = pick([[2, -1], [3, -2], [2, 1], [-1, 2], [0.5, 1], [1.5, -1]]), [t, w] = pick([[1, 3], [1, -2], [2, 1], [-1, 1], [3, -1], [1, 0.5]]);
      const K = (x, y) => `${VF(x)}\\vec a${y < 0 ? '-' : '+'}${VF(Math.abs(y))}\\vec b`;
      u = a.map((c, i) => r * c + s * b[i]); v = a.map((c, i) => t * c + w * b[i]);
      prompt = `Berechne ${tex(`\\left(${K(r, s)}\\right)\\cdot\\left(${K(t, w)}\\right)`)}.`; formula = `\\vec a=${vecTex(a)},\\quad \\vec b=${vecTex(b)}`;
      vor = [`Rechne zuerst beide Klammern aus – Zeile für Zeile: ${tex(`${K(r, s)}=${vecTex(u)}`)}.`, `${tex(`${K(t, w)}=${vecTex(v)}`)}.`];
      vorText = `${tex(`${K(r, s)}=${vecTex(u)}`)}, ${tex(`${K(t, w)}=${vecTex(v)}`)}. `;
      dritte = [skal(a, b), `Das ist nur ${tex('\\vec a\\cdot\\vec b')}. Erst die beiden Klammern ausrechnen, dann das Skalarprodukt bilden.`];
      nu = `\\left(${K(r, s)}\\right)`; nv = `\\left(${K(t, w)}\\right)`;
    } else formula = `\\vec u=${vecTex(u)},\\quad \\vec v=${vecTex(v)}`;
    const dot = skal(u, v), sum = (a) => a.reduce((x, y) => x + y, 0), betr = u.reduce((x, c, i) => x + Math.abs(c * v[i]), 0);
    const mk = (num, correct, why) => ({ tex: ft(num), num, correct, why });
    const opts = [
      mk(dot, true),
      mk(sum(u) + sum(v), false, 'Die passenden Koordinaten werden multipliziert, nicht addiert.'),
      dritte ? mk(dritte[0], false, dritte[1]) : L === 1 ? mk(u[0] * v[1] + u[1] * v[0], false, 'Nicht über Kreuz: Es werden die Zahlen in derselben Zeile malgenommen.') : mk(betr, false, 'Achte auf die Vorzeichen der einzelnen Produkte.'),
      mk(sum(u) * sum(v), false, 'Nicht alles mit allem: Nur gleiche Zeilen werden multipliziert, dann wird addiert.'),
    ];
    if (!fern(opts, 0.011)) continue;
    const idx = u.map((_, i) => `u_${i + 1}v_${i + 1}`).join('+'), prod = u.map((c, i) => `${par(c)}\\cdot ${par(v[i])}`).join('+');
    const hints = L === 1 ? [`Zeilenweise malnehmen, dann addieren: ${tex(`\\vec u\\cdot\\vec v=${idx}`)}.`, `Die beiden Produkte: ${tex(u.map((c, i) => ft(c * v[i])).join(',\\ '))}.`]
      : [...vor, `${L >= 4 ? 'Skalarprodukt: ' : ''}${tex(`\\vec u\\cdot\\vec v=${idx}`)}${L >= 4 ? ' – zeilenweise malnehmen, dann addieren' : ''}.`, `Die drei Produkte: ${tex(u.map((c, i) => ft(c * v[i])).join(',\\ '))}${u.some((c, i) => c < 0 && v[i] < 0) ? ' – Minus mal Minus gibt Plus' : ''}.`];
    return {
      prompt, formula, options: shuffle(opts), hints,
      explain: `${vorText}${tex(`${nu}\\cdot ${nv}=${prod}${L >= 3 ? `=${u.map((c, i) => (i ? vz(c * v[i]) : ft(c * v[i]))).join('')}` : ''}=${ft(dot)}`)}.${dot === 0 ? ' Das Skalarprodukt ist 0 – die Vektoren stehen <b>senkrecht</b> aufeinander.' : ''}`,
      u, v,
    };
  }
}

/* ───────────── Themen-Namen (für Bericht und Fehler-Kartei) ───────────── */
const TOPICS = [[genScheitel, 'Scheitelform'], [genPotenzLuecke, 'Potenzregel'], [genPolynom, 'Potenz- und Summenregel'], [genKette, 'Kettenregel'],
  [genExp, 'e-Funktion ableiten'], [genProdukt, 'Produktregel'], [genExtremstellen, 'Extremstellen'], [genHochTief, 'Hoch- und Tiefpunkte'],
  [genStammfunktion, 'Stammfunktionen'], [genIntegral, 'Bestimmtes Integral'], [genErwartung, 'Erwartungswert und Streuung'],
  [genBinomial, 'Bernoulli-Formel'], [genBaum, 'Baumdiagramme'], [genVektorAB, 'Verbindungsvektoren'], [genBetrag, 'Betrag eines Vektors'], [genSkalar, 'Skalarprodukt']];
for (const [fn, topic] of TOPICS) fn.topic = topic;

/** Wählt je nach Stufe einen Erzeuger und merkt sich, welcher es war. */
export { mixOf };

/* ───────────── Gemischte Runden ───────────── */

export const genMix = mixOf([[genPotenzLuecke, genPolynom], [genPotenzLuecke, genPolynom, genPolynom], [genPolynom, genPolynom, genKette, genExp, genPotenzLuecke], [genPolynom, genKette, genExp, genProdukt, genPotenzLuecke], [genKette, genExp, genProdukt, genProdukt, genPolynom]]);
export const genExtremaMix = mixOf([[genExtremstellen, genHochTief]]);
export const genIntegralMix = mixOf([[genStammfunktion, genIntegral]]);
export const genStochastikMix = mixOf([[genErwartung, genBinomial, genBaum]]);
export const genGeometrieMix = mixOf([[genVektorAB, genBetrag, genSkalar]]);
export { fmt, tier, par, vecTex, frac, uniq, uniqNum, rv, same, binom, kubik, fac, SIGMA_OK };
