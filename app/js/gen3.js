// Aufgaben-Erzeuger, Teil 3: Grundlagen für alle Gebiete (Rechnen, Gleichungen, Wahrscheinlichkeit, Daten, Dreiecke, Vektoren).
// Gleiche Regeln wie in gen.js: Schwierigkeit lv (1–5), Ablenker = typische Fehler mit Diagnose, Rechen-Felder für tests/.
import { ri, pick, shuffle, rand, ft, polyTex, polyEval, lineTex } from './math.js';
import { tex } from './ui.js';
import { tier, par, vecTex, uniq, uniqNum, same } from './gen.js';

const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const dfrac = (a, b) => `\\dfrac{${a}}{${b}}`;
/** Gekürzter Bruch als LaTeX (ganze Zahl, wenn es aufgeht). */
export function fracTex(n, d) {
  if (d < 0) { n = -n; d = -d; }
  const g = gcd(n, d) || 1; n /= g; d /= g;
  return d === 1 ? String(n) : `${n < 0 ? '-' : ''}${dfrac(Math.abs(n), d)}`;
}
const pt = (name, v) => `${name}(${v.map((c) => ft(c)).join('\\mid')})`;
const N = (num, correct, why, t) => ({ tex: t ?? ft(num), num, correct, why });

/* ───────────── Analysis: Grundlagen ───────────── */

/** Brüche addieren, subtrahieren, multiplizieren, dividieren. */
export function genBruch(lv = 3) {
  for (;;) {
    const D = tier(lv, [2, 3, 4], [2, 3, 4, 5], [2, 3, 4, 5, 6], [3, 4, 5, 6, 8], [4, 6, 8, 9, 12]);
    const b = pick(D), d = pick(D), a = ri(1, b - 1), c = ri(1, d - 1);
    const op = pick(lv <= 1 ? ['+'] : lv === 2 ? ['+', '-'] : ['+', '-', '·', ':']);
    if (gcd(a, b) !== 1 || gcd(c, d) !== 1 || (op === '-' && lv <= 2 && a * d <= c * b)) continue;
    const F = (n, den, correct, why) => (den === 0 ? null : { tex: fracTex(n, den), num: n / den, correct, why });
    const opts = {
      '+': [F(a * d + c * b, b * d, true), F(a + c, b + d, false, 'Zähler und Nenner dürfen nicht einfach getrennt addiert werden. Erst gleichnamig machen.'), F(a + c, b * d, false, 'Der Nenner ist gleichnamig – aber die Zähler müssen mit erweitert werden.'), F(a * c, b * d, false, 'Das wäre Multiplizieren. Beim Addieren erst auf den Hauptnenner bringen.')],
      '-': [F(a * d - c * b, b * d, true), F(a - c, b - d, false, 'Zähler und Nenner dürfen nicht getrennt subtrahiert werden. Erst gleichnamig machen.'), F(a - c, b * d, false, 'Der Nenner ist gleichnamig – aber die Zähler müssen mit erweitert werden.'), F(a * d + c * b, b * d, false, 'Hier wurde addiert statt subtrahiert.')],
      '·': [F(a * c, b * d, true), F(a * d, b * c, false, 'Mit dem Kehrwert rechnet man nur beim Dividieren.'), F(a * d + c * b, b * d, false, 'Das wäre Addieren. Beim Multiplizieren: Zähler mal Zähler, Nenner mal Nenner.'), F(a * c, b + d, false, 'Auch die Nenner werden multipliziert.')],
      ':': [F(a * d, b * c, true), F(a * c, b * d, false, 'Dividieren heißt: mit dem Kehrwert des zweiten Bruchs multiplizieren.'), F(b * c, a * d, false, 'Es wird der zweite Bruch umgedreht, nicht der erste.'), F(a + c, b + d, false, 'Brüche dividiert man, indem man mit dem Kehrwert multipliziert.')],
    }[op];
    if (opts.includes(null) || !uniqNum(opts) || !uniq(opts) || opts.slice(1).some((x) => Math.abs(x.num - opts[0].num) < 0.02)) continue;
    const sym = { '+': '+', '-': '-', '·': '\\cdot', ':': ':' }[op];
    return { prompt: 'Berechne und kürze.', formula: `${dfrac(a, b)}${sym}${dfrac(c, d)}`, options: shuffle(opts),
      hints: op === '+' || op === '-' ? ['Bringe beide Brüche auf denselben Nenner.', `Ein gemeinsamer Nenner ist ${tex(String(b * d))}.`] : op === '·' ? ['Zähler mal Zähler, Nenner mal Nenner.', 'Am Ende kürzen.'] : ['Dividieren heißt: mit dem Kehrwert multiplizieren.', `Rechne ${tex(`${dfrac(a, b)}\\cdot${dfrac(d, c)}`)}.`],
      explain: `${tex(`${dfrac(a, b)}${sym}${dfrac(c, d)}=${opts[0].tex}`)}.`, a, b, c, d, op };
  }
}

/** Klammern auflösen, binomische Formeln. */
export function genKlammer(lv = 3) {
  for (;;) {
    const P = (coef, correct, why) => ({ tex: polyTex(coef), correct, why, val: (x) => polyEval(coef, x) });
    let formula, opts, f;
    const kind = tier(lv, 'faktor', pick(['faktor', 'zwei']), pick(['zwei', 'binom']), pick(['binom', 'allg']), 'allg');
    if (kind === 'faktor') {
      const k = pick([2, 3, 4, 5, -2, -3]), a = pick([1, 2, 3, 4]), b = pick([1, 2, 5, 7, -1, -3, -4]);
      formula = `${ft(k)}\\,(${polyTex([b, a])})`; f = (x) => k * (a * x + b);
      opts = [P([k * b, k * a], true), P([b, k * a], false, 'Der Faktor vor der Klammer wird mit <b>jedem</b> Summanden multipliziert.'), P([k + b, k * a], false, 'Mit der zweiten Zahl wird ebenfalls multipliziert, nicht addiert.'), P([-k * b, k * a], false, 'Achte auf das Vorzeichen des zweiten Produkts.')];
    } else if (kind === 'zwei') {
      const a = pick([1, 2, 3, 4, 5, -1, -2, -3]), b = pick([1, 2, 3, 4, 6, -2, -4, -5]);
      if (a + b === 0 || a * b === a + b) continue;
      formula = `(${polyTex([a, 1])})(${polyTex([b, 1])})`; f = (x) => (x + a) * (x + b);
      opts = [P([a * b, a + b, 1], true), P([a * b, 0, 1], false, 'Jedes Glied der ersten Klammer wird mit jedem der zweiten multipliziert – die beiden gemischten Produkte fehlen.'), P([a + b, a * b, 1], false, 'Summe und Produkt sind vertauscht: vor x steht die Summe, am Ende das Produkt.'), P([a * b, -(a + b), 1], false, 'Achte auf das Vorzeichen des mittleren Glieds.')];
    } else if (kind === 'binom') {
      const a = pick([2, 3, 4, 5, 6]), s = pick([1, -1]);
      formula = `(x${s > 0 ? '+' : '-'}${a})^2`; f = (x) => (x + s * a) ** 2;
      opts = [P([a * a, 2 * s * a, 1], true), P([a * a, 0, 1], false, `Binomische Formel: Das mittlere Glied ${tex('2ab')} fehlt. ${tex('(a+b)^2\\neq a^2+b^2')}.`), P([a * a, s * a, 1], false, `Im mittleren Glied steht der Faktor 2: ${tex('2ab')}.`), P([a * a, -2 * s * a, 1], false, 'Das Vorzeichen des mittleren Glieds richtet sich nach dem Vorzeichen in der Klammer.')];
    } else {
      const a = pick([2, 3]), b = pick([1, 3, -1, -2, 5]), c = pick([1, 2, 4]), d = pick([2, -3, 4, -5]);
      if (a * d + b * c === 0 || a * d - b * c === a * d + b * c) continue;
      formula = `(${polyTex([b, a])})(${polyTex([d, c])})`; f = (x) => (a * x + b) * (c * x + d);
      opts = [P([b * d, a * d + b * c, a * c], true), P([b * d, 0, a * c], false, 'Die beiden gemischten Produkte fehlen.'), P([b * d, a * d + b * c, a + c], false, 'Die Faktoren vor x werden multipliziert, nicht addiert.'), P([b * d, a * d - b * c, a * c], false, 'Achte auf die Vorzeichen der gemischten Produkte.')];
    }
    if (!uniq(opts)) continue;
    return { prompt: 'Löse die Klammern auf.', formula, options: shuffle(opts), hints: ['Jedes Glied der einen Klammer mal jedes Glied der anderen.', kind === 'binom' ? `Binomische Formel: ${tex('(a\\pm b)^2=a^2\\pm 2ab+b^2')}.` : 'Fasse am Ende gleiche Potenzen von x zusammen.'], explain: `${tex(`${formula}=${opts[0].tex}`)}.`, f };
  }
}

/** Lineare Gleichung lösen. */
export function genLinGl(lv = 3) {
  for (;;) {
    const x0 = pick(tier(lv, [1, 2, 3, 4], [2, 3, 4, 5, -1, -2], [2, 3, -2, -3, 5, -4], [-3, 4, -5, 6, 7], [-4, 6, -7, 8, 9]));
    const a = pick([2, 3, 4, 5, 6, -2, -3]), c = lv <= 1 ? 0 : pick([1, 2, -1, -2, 3].filter((v) => v !== a)), b = pick([1, 2, 3, 5, 7, -1, -4, -6]);
    const d = (a - c) * x0 + b;
    const L = lineTex(a, b), R = c === 0 ? ft(d) : lineTex(c, d);
    const X = (num, correct, why) => ({ tex: `x=${ft(num, 3)}`, num, correct, why });
    const opts = [X(x0, true), X(-x0, false, 'Achte beim Umstellen auf die Vorzeichen.'), X((d + b) / (a - c), false, `Beim Rüberbringen wechselt das Vorzeichen: Auf der rechten Seite steht dann ${tex(`${ft(d)}-${par(b)}`)}.`), X(c === 0 ? (d - b) * a : (d - b) / (a + c || 1), false, c === 0 ? `Am Ende wird durch den Faktor vor ${tex('x')} geteilt, nicht damit multipliziert.` : `Die x-Glieder werden subtrahiert: ${tex(`${ft(a)}x-${par(c)}x`)}.`)];
    if (!uniqNum(opts)) continue;
    return { prompt: 'Löse die Gleichung.', formula: `${L}=${R}`, options: shuffle(opts),
      hints: ['Bringe alle Glieder mit x auf eine Seite, alle Zahlen auf die andere.', `Es bleibt ${tex(`${ft(a - c)}x=${ft(d - b)}`)}.`], explain: `${tex(`${ft(a - c)}x=${ft(d - b)}`)}, also ${tex(`x=${ft(x0)}`)}. Probe: Beide Seiten ergeben ${tex(ft(a * x0 + b))}.`,
      left: (x) => a * x + b, right: (x) => c * x + d };
  }
}

/** Quadratische Gleichung lösen. */
export function genQuadGl(lv = 3) {
  for (;;) {
    const R = tier(lv, 3, 4, 5, 6, 8);
    const r1 = lv <= 1 ? ri(1, R - 1) : ri(-R, R), r2 = ri(r1 + 1, R), k = lv >= 4 ? pick([1, 2, 3, -1]) : 1;
    if (r1 === -r2 || r1 * r2 === 0) continue;
    const coef = [k * r1 * r2, -k * (r1 + r2), k];
    const mk = (xs, correct, why) => ({ tex: `x_1=${ft(xs[0])},\\quad x_2=${ft(xs[1])}`, xs, correct, why });
    const sp = [Math.min(r1 + r2, r1 * r2), Math.max(r1 + r2, r1 * r2)];
    const opts = [mk([r1, r2], true), mk([-r2, -r1], false, `Vorzeichen: Bei ${tex('x^2+px+q=0')} ist ${tex('x_{1,2}=-\\tfrac p2\\pm\\dots')} – das Minus vor ${tex('\\tfrac p2')} nicht vergessen.`), mk(sp, false, 'Das sind Summe und Produkt der Lösungen, nicht die Lösungen selbst.'), mk([r1, -r2].sort((x, y) => x - y), false, 'Eine Lösung hat das falsche Vorzeichen. Mach die Probe durch Einsetzen.')];
    if (!uniq(opts)) continue;
    return { prompt: 'Löse die Gleichung.', formula: `${polyTex(coef)}=0`, options: shuffle(opts),
      hints: [k === 1 ? 'pq-Formel oder: Welche zwei Zahlen ergeben als Produkt die Zahl am Ende?' : `Teile zuerst durch ${tex(ft(k))}.`, `${tex(`x^2${-(r1 + r2) < 0 ? '' : '+'}${ft(-(r1 + r2))}x${r1 * r2 < 0 ? '' : '+'}${ft(r1 * r2)}=0`)} – Probe durch Einsetzen.`],
      explain: `${tex(`(x${r1 < 0 ? '+' : '-'}${Math.abs(r1)})(x${r2 < 0 ? '+' : '-'}${Math.abs(r2)})=0`)}, also ${tex(`x_1=${r1}`)} und ${tex(`x_2=${r2}`)}.`, f: (x) => polyEval(coef, x) };
  }
}

/** Potenzgesetze. */
export function genPotenz(lv = 3) {
  for (;;) {
    const kind = pick(tier(lv, ['mal', 'hoch'], ['mal', 'hoch', 'durch'], ['mal', 'hoch', 'durch', 'neg'], ['hoch', 'durch', 'neg', 'wurzel'], ['wurzel', 'kombi', 'negdurch']));
    const a = ri(2, 6), b = ri(2, 5);
    const E = (e, correct, why, t) => ({ tex: t ?? `x^{${typeof e === 'string' ? e : ft(e)}}`, e, correct, why, val: (x) => x ** (typeof e === 'number' ? e : NaN) });
    let formula, f, opts;
    if (kind === 'mal') { formula = `x^{${a}}\\cdot x^{${b}}`; f = (x) => x ** a * x ** b; opts = [E(a + b, true), E(a * b, false, 'Beim Multiplizieren gleicher Basen werden die Exponenten addiert.'), E(a - b, false, 'Subtrahiert wird beim Dividieren.'), { tex: `2x^{${a + b}}`, correct: false, why: 'Es entsteht kein zusätzlicher Faktor 2.', val: (x) => 2 * x ** (a + b) }]; }
    else if (kind === 'hoch') { formula = `\\left(x^{${a}}\\right)^{${b}}`; f = (x) => (x ** a) ** b; opts = [E(a * b, true), E(a + b, false, 'Beim Potenzieren einer Potenz werden die Exponenten multipliziert.'), E(a ** b > 99 ? a + b + 1 : a ** b, false, 'Die Exponenten werden multipliziert, nicht potenziert.'), E(a * b + 1, false, `Rechne ${tex(`${a}\\cdot${b}`)}.`)]; }
    else if (kind === 'durch') { if (a === b) continue; formula = `\\dfrac{x^{${a}}}{x^{${b}}}`; f = (x) => x ** a / x ** b; opts = [E(a - b, true), E(b - a, false, 'Exponent des Zählers minus Exponent des Nenners.'), E(a + b, false, 'Addiert wird beim Multiplizieren.'), E(a * b, false, 'Beim Dividieren gleicher Basen werden die Exponenten subtrahiert.')]; }
    else if (kind === 'kombi') { const c = ri(2, 6), e = a + b - c; if (e === 0 || e === 1) continue; formula = `\\dfrac{x^{${a}}\\cdot x^{${b}}}{x^{${c}}}`; f = (x) => (x ** a * x ** b) / x ** c;
      opts = [E(e, true), E(a * b - c, false, 'Beim Multiplizieren gleicher Basen werden die Exponenten addiert, nicht multipliziert.'), E(a + b + c, false, 'Der Exponent des Nenners wird subtrahiert.'), E(a - b + c, false, 'Zähler: Exponenten addieren. Dann den Exponenten des Nenners abziehen.')]; }
    else if (kind === 'negdurch') { formula = `\\dfrac{x^{-${a}}}{x^{${b}}}`; f = (x) => x ** -a / x ** b;
      opts = [E(-(a + b), true), E(b - a, false, `Exponent des Zählers minus Exponent des Nenners: ${tex(`-${a}-${b}`)}.`), E(-(a * b), false, 'Beim Dividieren werden die Exponenten subtrahiert, nicht multipliziert.'), E(a + b, false, 'Das Vorzeichen fehlt: Der Exponent bleibt negativ.')]; }
    else if (kind === 'neg') { formula = `x^{-${a}}`; f = (x) => x ** -a; opts = [{ tex: `\\dfrac{1}{x^{${a}}}`, correct: true, val: (x) => 1 / x ** a }, { tex: `-x^{${a}}`, correct: false, why: 'Ein negativer Exponent bedeutet „Kehrwert", nicht „negatives Vorzeichen".', val: (x) => -(x ** a) }, { tex: `-${a}x`, correct: false, why: 'Der Exponent ist kein Faktor.', val: (x) => -a * x }, { tex: `\\dfrac{1}{x^{-${a}}}`, correct: false, why: `Das wäre ${tex(`x^{${a}}`)}.`, val: (x) => x ** a }]; }
    else { const n = pick([2, 3, 4]), m = pick([1, 2, 3, 5].filter((v) => v !== n)); formula = n === 2 ? `\\sqrt{x^{${m}}}` : `\\sqrt[${n}]{x^{${m}}}`; f = (x) => (x ** m) ** (1 / n);
      const Q = (num, den, correct, why) => ({ tex: `x^{${fracTex(num, den).replace('\\dfrac', '\\frac')}}`, correct, why, val: (x) => x ** (num / den) });
      opts = [Q(m, n, true), Q(n, m, false, 'Der Wurzelexponent steht im Nenner des Bruchs.'), Q(m * n, 1, false, 'Eine Wurzel verkleinert den Exponenten: Er wird geteilt, nicht multipliziert.'), Q(m - n, 1, false, 'Der Exponent wird durch den Wurzelexponenten geteilt, nicht vermindert.')]; }
    const X0 = 1.7;
    if (!uniq(opts) || opts.some((o, i) => opts.some((p, j) => i < j && Math.abs(o.val(X0) - p.val(X0)) < 1e-9))) continue;
    return { prompt: 'Vereinfache.', formula, options: shuffle(opts), hints: ['Welches Potenzgesetz passt: gleiche Basis, Potenz einer Potenz, negativer Exponent?', `${tex('x^a\\cdot x^b=x^{a+b}')}, ${tex('(x^a)^b=x^{ab}')}, ${tex('x^{-n}=\\tfrac{1}{x^n}')}, ${tex('\\sqrt[n]{x^m}=x^{m/n}')}.`], explain: `${tex(`${formula}=${opts[0].tex}`)}.`, f, domain: 'pos' };
  }
}

/** Steigung bzw. Gleichung einer Geraden durch zwei Punkte. */
export function genSteigung(lv = 3) {
  for (;;) {
    const m = pick(tier(lv, [1, 2, 3], [2, 3, -1, -2], [2, -2, 3, -3, 4], [0.5, -0.5, 1.5, -2, 3], [-1.5, 2.5, -0.5, 4]));
    const x1 = pick([-3, -2, -1, 1, 2]), dx = pick(Number.isInteger(m) ? [2, 3, 4] : [2, 4]), x2 = x1 + dx, y1 = ri(-3, 4), y2 = y1 + m * dx, b = y1 - m * x1;
    if (y2 === y1) continue;
    const head = `${pt('P', [x1, y1])},\\quad ${pt('Q', [x2, y2])}`;
    if (lv <= 2) {
      const opts = [N(m, true), N(dx / (y2 - y1), false, 'Unterschied der y-Werte geteilt durch Unterschied der x-Werte – nicht umgekehrt.', ft(dx / (y2 - y1), 3)), N(-m, false, 'Zähler und Nenner müssen in derselben Reihenfolge der Punkte gebildet werden.'), N(y2 - y1, false, 'Das ist nur der Höhenunterschied. Es fehlt das Teilen durch den x-Unterschied.')];
      if (!uniqNum(opts)) continue;
      return { prompt: 'Welche Steigung hat die Gerade durch die beiden Punkte?', formula: head, options: shuffle(opts), hints: [`${tex('m=\\dfrac{y_2-y_1}{x_2-x_1}')}.`, `${tex(`y_2-y_1=${ft(y2 - y1)}`)} und ${tex(`x_2-x_1=${ft(dx)}`)}.`], explain: `${tex(`m=\\dfrac{${ft(y2)}-${par(y1)}}{${ft(x2)}-${par(x1)}}=${ft(m)}`)}.`, kind: 'm', P: [x1, y1], Q: [x2, y2] };
    }
    const Ln = (M, B, correct, why) => ({ tex: `y=${lineTex(M, B)}`, correct, why, val: (x) => M * x + B });
    const opts = [Ln(m, b, true), Ln(m, y1, false, `${tex('b')} ist der y-Achsenabschnitt, nicht der y-Wert von ${tex('P')}. Setze ${tex('P')} in ${tex('y=mx+b')} ein.`), Ln(m, y1 + m * x1, false, `Vorzeichen: ${tex('b=y_1-m\\cdot x_1')}.`), Ln(-m, y1 + m * x1, false, 'Die Steigung hat das falsche Vorzeichen.')];
    if (!uniq(opts)) continue;
    return { prompt: 'Welche Gleichung hat die Gerade durch die beiden Punkte?', formula: head, options: shuffle(opts), hints: [`Erst die Steigung: ${tex('m=\\dfrac{y_2-y_1}{x_2-x_1}')}.`, `${tex(`m=${ft(m)}`)}. Setze einen Punkt in ${tex('y=mx+b')} ein.`], explain: `${tex(`m=${ft(m)}`)} und ${tex(`b=${ft(y1)}-${par(m)}\\cdot${par(x1)}=${ft(b)}`)}, also ${tex(`y=${lineTex(m, b)}`)}.`, kind: 'gl', P: [x1, y1], Q: [x2, y2] };
  }
}

/* ───────────── Stochastik: Grundlagen ───────────── */

/** Relative Häufigkeit. */
export function genHaeufigkeit(lv = 3) {
  for (;;) {
    const n = pick(tier(lv, [10, 20, 50], [20, 25, 50], [25, 40, 50, 200], [40, 80, 125, 250], [16, 80, 125, 400])), k = ri(Math.ceil(n * 0.1), Math.floor(n * 0.9));
    const pct = (k / n) * 100;
    if (Math.abs(pct * 10 - Math.round(pct * 10)) > 1e-9 || k * 2 === n) continue;
    const ctx = pick([['Bei', 'Würfen einer Münze fiel', '-mal Kopf'], ['Von', 'befragten Schülern kommen', 'mit dem Fahrrad'], ['Bei', 'Drehungen eines Glücksrads gab es', '-mal einen Gewinn'], ['Von', 'geprüften Bauteilen waren', 'fehlerhaft']]);
    const P = (v, correct, why) => ({ tex: `${ft(v, 1)}\\,\\%`, num: v, correct, why });
    const opts = [P(pct, true), P((k / (n - k)) * 100, false, 'Geteilt wird durch die Gesamtzahl, nicht durch die übrigen Fälle.'), P(((n - k) / n) * 100, false, 'Das ist der Anteil der anderen Fälle (Gegenereignis).'), { tex: String(k), num: k, correct: false, why: 'Das ist die absolute Häufigkeit. Die relative Häufigkeit ist der Anteil an allen.' }];
    if (!uniqNum(opts) || !uniq(opts)) continue;
    return { prompt: `${ctx[0]} ${n} ${ctx[1]} ${k}${ctx[2].startsWith('-') ? '' : ' '}${ctx[2]}. Wie groß ist die relative Häufigkeit?`, options: shuffle(opts), hints: ['Relative Häufigkeit = Anzahl der Treffer geteilt durch die Gesamtzahl.', `Rechne ${tex(`${k}:${n}`)} und schreibe das Ergebnis in Prozent.`], explain: `${tex(`\\dfrac{${k}}{${n}}=${ft(k / n, 3)}=${ft(pct, 1)}\\,\\%`)}.`, n, k };
  }
}

/** Prozentrechnung. */
export function genProzent(lv = 3) {
  for (;;) {
    const kind = pick(tier(lv, ['wert'], ['wert', 'satz'], ['wert', 'satz', 'erhoeht'], ['erhoeht', 'vermindert', 'grund'], ['vermindert', 'grund', 'erhoeht']));
    const G = pick([40, 50, 80, 120, 200, 250, 400, 600]), p = pick(tier(lv, [10, 20, 25, 50], [5, 10, 20, 25, 30], [5, 15, 20, 30, 40], [12, 15, 35, 45, 60], [2.5, 12.5, 17.5, 35]));
    const W = (G * p) / 100;
    let prompt, opts, explain;
    if (kind === 'wert') { prompt = `Wie viel sind ${ft(p)} % von ${G}?`; opts = [N(W, true), N((G * p) / 10, false, `${ft(p)} % bedeutet ${tex(`\\tfrac{${ft(p)}}{100}`)} – das Komma ist um eine Stelle verrutscht.`), N(G / p, false, 'Durch den Prozentsatz zu teilen ergibt nicht den Prozentwert.'), N(G - p, false, 'Prozent sind ein Anteil, kein Betrag, den man abzieht.')]; explain = `${tex(`${G}\\cdot\\dfrac{${ft(p)}}{100}=${ft(W)}`)}.`; }
    else if (kind === 'satz') { prompt = `Wie viel Prozent sind ${ft(W)} von ${G}?`; const P = (v, c, w) => ({ tex: `${ft(v, 2)}\\,\\%`, num: v, correct: c, why: w }); opts = [P(p, true), P((G / W), false, 'Anteil = Prozentwert durch Grundwert, nicht umgekehrt – und dann mal 100.'), P(W, false, 'Das ist der Prozentwert selbst, nicht der Prozentsatz.'), P(100 - p, false, 'Das ist der Rest bis 100 %.')]; explain = `${tex(`\\dfrac{${ft(W)}}{${G}}=${ft(p / 100, 4)}=${ft(p)}\\,\\%`)}.`; }
    else if (kind === 'erhoeht' || kind === 'vermindert') { const s = kind === 'erhoeht' ? 1 : -1; prompt = `Ein Preis von ${G} € wird um ${ft(p)} % ${s > 0 ? 'erhöht' : 'gesenkt'}. Wie hoch ist der neue Preis?`; opts = [N(G + s * W, true), N(G + s * p, false, `${ft(p)} % sind nicht ${ft(p)} €. Erst den Prozentwert berechnen.`), N(W, false, `Das ist nur die ${s > 0 ? 'Erhöhung' : 'Senkung'}, nicht der neue Preis.`), N(G - s * W, false, `Der Preis wird ${s > 0 ? 'erhöht, nicht gesenkt' : 'gesenkt, nicht erhöht'}.`)]; explain = `${tex(`${G}\\cdot${ft(1 + (s * p) / 100, 4)}=${ft(G + s * W)}`)} €.`; }
    else { prompt = `${ft(W)} € sind ${ft(p)} % eines Betrags. Wie groß ist der ganze Betrag?`; opts = [N(G, true), N((W * p) / 100, false, 'So berechnet man einen Prozentwert. Gesucht ist der Grundwert: durch den Prozentsatz teilen.'), N(W * (1 + p / 100), false, 'Das wäre eine Erhöhung um den Prozentsatz. Gesucht ist das Ganze (100 %).'), N(W + p, false, 'Prozent und Euro lassen sich nicht addieren.')]; explain = `${tex(`${ft(W)}:\\dfrac{${ft(p)}}{100}=${G}`)} €.`; }
    if (!uniqNum(opts)) continue;
    return { prompt, options: shuffle(opts), hints: [`${ft(p)} % bedeutet ${tex(`\\tfrac{${ft(p)}}{100}=${ft(p / 100, 4)}`)}.`, 'Prozentwert = Grundwert mal Prozentsatz.'], explain, kind, G, p };
  }
}

/** Mittelwert, Median, Spannweite. */
export function genKennwerte(lv = 3) {
  for (;;) {
    const n = tier(lv, 5, 5, 6, 7, 8), hi = tier(lv, 9, 12, 15, 20, 30);
    const data = Array.from({ length: n }, () => ri(1, hi));
    const sorted = [...data].sort((x, y) => x - y), sum = data.reduce((s, x) => s + x, 0), mean = sum / n;
    const median = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2, range = sorted[n - 1] - sorted[0];
    if (Math.abs(mean * 2 - Math.round(mean * 2)) > 1e-9) continue;
    const S = { mittel: [mean, 'das arithmetische Mittel', 'Das ist das arithmetische Mittel (Summe durch Anzahl).'], median: [median, 'der Median', 'Das ist der Median: der mittlere Wert der sortierten Liste.'], spann: [range, 'die Spannweite', 'Das ist die Spannweite: größter minus kleinster Wert.'], max: [sorted[n - 1], 'das Maximum', 'Das ist der größte Wert.'] };
    const ask = pick(['mittel', 'median', 'spann']);
    const opts = Object.keys(S).map((k) => N(S[k][0], k === ask, S[k][2]));
    if (!uniqNum(opts)) continue;
    return { prompt: `Wie groß ist ${S[ask][1]} der Daten?`, formula: (lv <= 2 ? sorted : data).join(';\\ '), options: shuffle(opts),
      hints: ask === 'mittel' ? ['Alle Werte addieren und durch die Anzahl teilen.', `Die Summe ist ${sum}.`] : ask === 'median' ? ['Sortiere die Werte der Größe nach.', n % 2 ? 'Der Median ist der Wert genau in der Mitte.' : 'Bei gerader Anzahl: der Mittelwert der beiden mittleren Werte.'] : ['Suche den größten und den kleinsten Wert.', 'Spannweite = Maximum minus Minimum.'],
      explain: ask === 'mittel' ? `${tex(`\\dfrac{${sum}}{${n}}=${ft(mean)}`)}.` : ask === 'median' ? `Sortiert: ${tex(sorted.join(';\\ '))}. Der Median ist ${tex(ft(median))}.` : `${tex(`${sorted[n - 1]}-${sorted[0]}=${range}`)}.`, data, ask };
  }
}

/** Laplace-Wahrscheinlichkeit: günstige durch mögliche Ergebnisse. */
export function genLaplace(lv = 3) {
  for (;;) {
    let text, g, m;
    const kind = pick(tier(lv, ['wuerfel', 'urne'], ['wuerfel', 'urne', 'rad'], ['wuerfel', 'urne', 'summe'], ['urne', 'summe', 'karten'], ['zwei', 'karten2']));
    if (kind === 'wuerfel') { const E = pick([['eine gerade Zahl', 3], ['eine Zahl größer als 4', 2], ['eine Primzahl', 3], ['ein Vielfaches von 3', 2], ['eine Zahl kleiner als 3', 2], ['mindestens eine 3', 4]]); text = `Ein Würfel wird einmal geworfen. Wie groß ist die Wahrscheinlichkeit für ${E[0]}?`; g = E[1]; m = 6; }
    else if (kind === 'urne') { const r = ri(2, 6), b = ri(2, 6), w = ri(2, 4); text = `In einer Urne liegen ${r} rote, ${b} blaue und ${w} weiße Kugeln. Es wird einmal gezogen. Wie groß ist die Wahrscheinlichkeit für eine rote Kugel?`; g = r; m = r + b + w; }
    else if (kind === 'rad') { m = pick([8, 10, 12]); g = ri(2, m / 2 - 1); text = `Ein Glücksrad hat ${m} gleich große Felder, ${g} davon sind Gewinnfelder. Wie groß ist die Gewinnwahrscheinlichkeit?`; }
    else if (kind === 'summe') { const s = pick([4, 5, 6, 8, 9, 10]); g = 6 - Math.abs(7 - s); m = 36; text = `Zwei Würfel werden geworfen. Wie groß ist die Wahrscheinlichkeit für die Augensumme ${s}?`; }
    else if (kind === 'zwei') { const E = pick([['einen Pasch (zwei gleiche Zahlen)', 6], ['eine Augensumme von mindestens 10', 6], ['eine Augensumme von höchstens 4', 6], ['zwei ungerade Zahlen', 9], ['mindestens eine Sechs', 11], ['eine Augensumme größer als 8', 10], ['zwei verschiedene Zahlen', 30]]); text = `Zwei Würfel werden geworfen. Wie groß ist die Wahrscheinlichkeit für ${E[0]}?`; g = E[1]; m = 36; }
    else if (kind === 'karten2') { const E = pick([['ein Ass oder einen König', 8], ['eine Herz-Karte oder ein Ass', 11], ['keine Bildkarte (Bube, Dame, König)', 20], ['eine rote Bildkarte (Bube, Dame, König)', 6], ['eine Karte, die kein Ass ist', 28]]); text = `Aus einem Skatblatt mit 32 Karten wird eine Karte gezogen. Wie groß ist die Wahrscheinlichkeit für ${E[0]}?`; g = E[1]; m = 32; }
    else { const E = pick([['ein Ass', 4], ['eine Herz-Karte', 8], ['eine Bildkarte (Bube, Dame, König)', 12], ['eine rote Karte', 16]]); text = `Aus einem Skatblatt mit 32 Karten wird eine Karte gezogen. Wie groß ist die Wahrscheinlichkeit für ${E[0]}?`; g = E[1]; m = 32; }
    if (g * 2 === m || g < 2) continue;
    const F = (z, n, correct, why) => ({ tex: dfrac(z, n), num: z / n, correct, why });
    const opts = [F(g, m, true), F(g, m - g, false, 'Geteilt wird durch <b>alle</b> möglichen Ergebnisse, nicht nur durch die ungünstigen.'), F(m - g, m, false, 'Das ist die Wahrscheinlichkeit des Gegenereignisses.'), F(1, g, false, 'Im Zähler steht die Zahl der günstigen Ergebnisse, im Nenner die Zahl aller Ergebnisse.')];
    if (!uniqNum(opts)) continue;
    return { prompt: text, options: shuffle(opts), hints: ['Wahrscheinlichkeit = günstige Ergebnisse geteilt durch mögliche Ergebnisse.', `Es gibt ${m} mögliche und ${g} günstige Ergebnisse.`], explain: `${tex(`P=\\dfrac{${g}}{${m}}=${fracTex(g, m)}\\approx${ft((g / m) * 100, 1)}\\,\\%`)}.`, g, m };
  }
}

/** Gegenereignis. */
export function genGegen(lv = 3) {
  if (lv >= 4 || (lv === 3 && rand() < 0.5)) {
    const n = ri(2, tier(lv, 2, 2, 3, 4, 6));
    const [was, treffer, z, N] = pick(lv >= 5
      ? [['Ein Glücksrad mit 4 gleich großen Feldern hat ein Gewinnfeld. Es', 'einen Gewinn', 3, 4], ['Ein Glücksrad mit 5 gleich großen Feldern hat ein Gewinnfeld. Es', 'einen Gewinn', 4, 5], ['Ein Glücksrad mit 10 gleich großen Feldern hat 3 Gewinnfelder. Es', 'einen Gewinn', 7, 10], ['Ein Würfel', 'eine Sechs', 5, 6], ['Ein Würfel', 'eine Zahl größer als 4', 2, 3]]
      : [['Ein Würfel', 'eine Sechs', 5, 6], ['Eine Münze', 'einmal Kopf', 1, 2]]);
    const verb = 'wird', Fz = `\\dfrac{${z}}{${N}}`, Ft = fracTex(N - z, N);
    const opts = [{ tex: `1-\\left(${Fz}\\right)^{${n}}`, num: 1 - (z / N) ** n, correct: true },
      { tex: `${n}\\cdot${Ft}`, num: (n * (N - z)) / N, correct: false, why: 'Wahrscheinlichkeiten dürfen hier nicht einfach addiert werden – bei vielen Versuchen käme sonst mehr als 100 % heraus.' },
      { tex: `\\left(${Ft}\\right)^{${n}}`, num: ((N - z) / N) ** n, correct: false, why: 'Das ist die Wahrscheinlichkeit für <b>nur</b> Treffer.' },
      { tex: `1-\\left(${Ft}\\right)^{${n}}`, num: 1 - ((N - z) / N) ** n, correct: false, why: `Das Gegenereignis von „mindestens ein Treffer" ist „kein Treffer" – mit ${tex(Fz)} je Versuch.` }];
    if (!uniqNum(opts) || !uniq(opts)) return genGegen(lv);
    return { prompt: `${was} ${verb} ${n}-mal ${was.startsWith('Eine Münze') ? 'geworfen' : was.endsWith('Es') ? 'gedreht' : 'geworfen'}. Welche Rechnung liefert die Wahrscheinlichkeit für <b>mindestens ${treffer}</b>?`, options: shuffle(opts), hints: ['„Mindestens ein Treffer" ist das Gegenteil von „kein Treffer".', `Die Wahrscheinlichkeit für „kein Treffer" bei einem Versuch ist ${tex(Fz)}.`], explain: `${tex(`P=1-\\left(${Fz}\\right)^{${n}}\\approx${ft((1 - (z / N) ** n) * 100, 1)}\\,\\%`)}.`, kind: 'min1', n, miss: z / N };
  }
  const p = pick([10, 15, 20, 30, 35, 40, 45, 60, 70]);
  const ctx = pick([`Die Regenwahrscheinlichkeit für morgen beträgt ${p} %. Wie wahrscheinlich ist es, dass es <b>nicht</b> regnet?`, `Ein Basketballer trifft einen Freiwurf mit ${p} % Wahrscheinlichkeit. Wie wahrscheinlich ist ein Fehlwurf?`, `Ein Los gewinnt mit ${p} % Wahrscheinlichkeit. Wie wahrscheinlich ist eine Niete?`]);
  const P = (v, correct, why) => ({ tex: `${ft(v)}\\,\\%`, num: v, correct, why });
  const opts = [P(100 - p, true), P(p, false, 'Das ist die Wahrscheinlichkeit des Ereignisses selbst, nicht des Gegenteils.'), P(100 + p, false, 'Wahrscheinlichkeiten liegen nie über 100 %.'), P(p / 2, false, 'Ereignis und Gegenereignis ergeben zusammen 100 %.')];
  return { prompt: ctx, options: shuffle(opts), hints: ['Ereignis und Gegenereignis ergeben zusammen 100 %.', `Rechne ${tex(`100\\,\\%-${p}\\,\\%`)}.`], explain: `${tex(`P(\\overline{A})=1-P(A)=100\\,\\%-${p}\\,\\%=${100 - p}\\,\\%`)}.`, kind: 'einfach', p };
}

/* ───────────── Geometrie: Grundlagen ───────────── */

const TRI = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [12, 16, 20], [7, 24, 25], [20, 21, 29]];

/** Satz des Pythagoras. */
export function genPythagoras(lv = 3) {
  for (;;) {
    const [a, b, c] = pick(TRI.slice(0, tier(lv, 2, 4, 5, 7, 8))), s = lv >= 4 ? pick([1, 0.5, 1.5]) : 1;
    const A = a * s, B = b * s, C = c * s, hyp = lv <= 1 || rand() < 0.5;
    const opts = hyp
      ? [N(C, true), N(A + B, false, 'Die Seiten werden nicht addiert: Erst quadrieren, dann addieren, dann die Wurzel ziehen.'), N(A * A + B * B, false, 'Hier fehlt die Wurzel am Ende.'), N(Math.sqrt(Math.abs(B * B - A * A)), false, 'Für die Hypotenuse werden die Quadrate addiert, nicht subtrahiert.', ft(Math.sqrt(Math.abs(B * B - A * A)), 2))]
      : [N(B, true), N(Math.sqrt(C * C + A * A), false, 'Gesucht ist eine Kathete: Das Quadrat der anderen Kathete wird vom Hypotenusenquadrat abgezogen.', ft(Math.sqrt(C * C + A * A), 2)), N(C - A, false, 'Die Seiten werden nicht einfach subtrahiert: erst quadrieren.'), N(C * C - A * A, false, 'Hier fehlt die Wurzel am Ende.')];
    if (!uniqNum(opts)) continue;
    const ctx = lv >= 3 && rand() < 0.5;
    return { prompt: hyp ? (ctx ? `Ein rechteckiges Grundstück ist ${ft(A)} m breit und ${ft(B)} m lang. Wie lang ist der Weg quer über die Diagonale?` : `Ein rechtwinkliges Dreieck hat die Katheten ${tex(`a=${ft(A)}`)} und ${tex(`b=${ft(B)}`)}. Wie lang ist die Hypotenuse?`) : (ctx ? `Eine ${ft(C)} m lange Leiter lehnt an einer Wand. Ihr Fuß steht ${ft(A)} m von der Wand entfernt. Wie hoch reicht sie?` : `Ein rechtwinkliges Dreieck hat die Hypotenuse ${tex(`c=${ft(C)}`)} und die Kathete ${tex(`a=${ft(A)}`)}. Wie lang ist die andere Kathete?`),
      options: shuffle(opts), hints: [`${tex('a^2+b^2=c^2')} – ${tex('c')} ist die längste Seite gegenüber dem rechten Winkel.`, hyp ? `${tex(`c^2=${ft(A * A)}+${ft(B * B)}`)}.` : `${tex(`b^2=${ft(C * C)}-${ft(A * A)}`)}.`],
      explain: hyp ? `${tex(`c=\\sqrt{${ft(A)}^2+${ft(B)}^2}=\\sqrt{${ft(C * C)}}=${ft(C)}`)}.` : `${tex(`b=\\sqrt{${ft(C)}^2-${ft(A)}^2}=\\sqrt{${ft(B * B)}}=${ft(B)}`)}.`, A, B, C, hyp };
  }
}

/** Trigonometrie im rechtwinkligen Dreieck: die richtige Rechnung. */
export function genTrig(lv = 3) {
  for (;;) {
    const al = pick([25, 30, 35, 40, 50, 55, 60, 65]), r = (al * Math.PI) / 180, s = pick([5, 8, 10, 12, 20]);
    const kind = pick(tier(lv, ['sin'], ['sin', 'cos'], ['sin', 'cos', 'tan'], ['cos', 'tan', 'hyp'], ['tan', 'hyp']));
    const W = `${al}^\\circ`;
    const O = (t, num, correct, why) => ({ tex: t, num, correct, why });
    const set = { sin: O(`${s}\\cdot\\sin(${W})`, s * Math.sin(r)), cos: O(`${s}\\cdot\\cos(${W})`, s * Math.cos(r)), tan: O(`${s}\\cdot\\tan(${W})`, s * Math.tan(r)), dsin: O(dfrac(s, `\\sin(${W})`), s / Math.sin(r)), dcos: O(dfrac(s, `\\cos(${W})`), s / Math.cos(r)) };
    const why = { sin: 'Sinus gehört zu Gegenkathete und Hypotenuse.', cos: 'Kosinus gehört zu Ankathete und Hypotenuse.', tan: 'Tangens gehört zu Gegenkathete und Ankathete – ohne Hypotenuse.', dsin: `Hier wurde geteilt statt multipliziert. Stelle ${tex('\\sin\\alpha=\\tfrac{\\text{Gegenkathete}}{\\text{Hypotenuse}}')} nach der gesuchten Seite um.`, dcos: 'Geteilt durch den Kosinus erhält man die Hypotenuse aus der Ankathete.' };
    const cfg = { sin: ['die Hypotenuse', 'die Gegenkathete des Winkels', ['sin', 'cos', 'tan', 'dsin']], cos: ['die Hypotenuse', 'die Ankathete des Winkels', ['cos', 'sin', 'tan', 'dcos']], tan: ['die Ankathete des Winkels', 'die Gegenkathete des Winkels', ['tan', 'sin', 'cos', 'dsin']], hyp: ['die Gegenkathete des Winkels', 'die Hypotenuse', ['dsin', 'sin', 'dcos', 'tan']] }[kind];
    const opts = cfg[2].map((k, i) => ({ ...set[k], correct: i === 0, why: i === 0 ? undefined : why[k] }));
    if (!uniqNum(opts)) continue;
    return { prompt: `In einem rechtwinkligen Dreieck ist ${tex(`\\alpha=${W}`)} und ${cfg[0]} ${s} cm lang. Welche Rechnung liefert ${cfg[1]}?`, options: shuffle(opts),
      hints: ['Welche zwei Seiten kommen vor: Gegenkathete, Ankathete, Hypotenuse?', `${tex('\\sin\\alpha=\\tfrac{G}{H}')}, ${tex('\\cos\\alpha=\\tfrac{A}{H}')}, ${tex('\\tan\\alpha=\\tfrac{G}{A}')} – dann nach der gesuchten Seite umstellen.`], explain: `${tex(`${opts[0].tex}\\approx${ft(opts[0].num, 2)}`)} cm.`, kind, al, s };
  }
}

/** Flächen und Volumen. */
export function genFlaeche(lv = 3) {
  for (;;) {
    const kind = pick(tier(lv, ['dreieck', 'quader'], ['dreieck', 'quader', 'kreis'], ['dreieck', 'kreis', 'zylinder'], ['kreis', 'zylinder', 'pyramide'], ['zylinder', 'pyramide', 'kreis']));
    const a = ri(2, 6), b = ri(3, 8), c = ri(2, 9), PI = Math.PI;
    const V = (num, correct, why) => ({ tex: Number.isInteger(num) ? String(num) : `\\approx ${ft(num, 1)}`, num: +num.toFixed(1), correct, why });
    let prompt, opts, explain, want;
    if (kind === 'dreieck') { const g = a * 2, hh = b; want = (g * hh) / 2; prompt = `Ein Dreieck hat die Grundseite ${g} cm und die zugehörige Höhe ${hh} cm. Wie groß ist sein Flächeninhalt (in cm²)?`; opts = [V(want, true), V(g * hh, false, `Es fehlt der Faktor ${tex('\\tfrac12')}: Ein Dreieck ist ein halbes Rechteck.`), V(g + hh, false, 'Grundseite und Höhe werden multipliziert, nicht addiert.'), V((g + hh) / 2, false, 'Erst multiplizieren, dann halbieren.')]; explain = `${tex(`A=\\tfrac12\\cdot ${g}\\cdot ${hh}=${want}`)} cm².`; }
    else if (kind === 'quader') { want = a * b * c; prompt = `Ein Quader ist ${a} cm lang, ${b} cm breit und ${c} cm hoch. Wie groß ist sein Volumen (in cm³)?`; opts = [V(want, true), V(a + b + c, false, 'Die drei Kantenlängen werden multipliziert, nicht addiert.'), V(2 * (a * b + b * c + a * c), false, 'Das ist die Oberfläche, nicht das Volumen.'), V(a * b, false, 'Das ist nur die Grundfläche – die Höhe fehlt.')]; explain = `${tex(`V=${a}\\cdot ${b}\\cdot ${c}=${want}`)} cm³.`; }
    else if (kind === 'kreis') { want = PI * a * a; prompt = `Ein Kreis hat den Radius ${a} cm. Wie groß ist sein Flächeninhalt (in cm²)?`; opts = [V(want, true), V(2 * PI * a, false, 'Das ist der Umfang, nicht die Fläche.'), V(PI * 4 * a * a, false, 'Hier wurde mit dem Durchmesser statt mit dem Radius gerechnet.'), V(PI * a, false, `Der Radius wird quadriert: ${tex('A=\\pi r^2')}.`)]; explain = `${tex(`A=\\pi\\cdot ${a}^2\\approx${ft(want, 1)}`)} cm².`; }
    else if (kind === 'zylinder') { want = PI * a * a * b; prompt = `Ein Zylinder hat den Radius ${a} cm und die Höhe ${b} cm. Wie groß ist sein Volumen (in cm³)?`; opts = [V(want, true), V(2 * PI * a * b, false, 'Das ist die Mantelfläche, nicht das Volumen.'), V(PI * a * b, false, `Der Radius wird quadriert: ${tex('V=\\pi r^2h')}.`), V(PI * 4 * a * a * b, false, 'Hier wurde mit dem Durchmesser statt mit dem Radius gerechnet.')]; explain = `${tex(`V=\\pi\\cdot ${a}^2\\cdot ${b}\\approx${ft(want, 1)}`)} cm³.`; }
    else { const s = a * 3, hh = b; want = (s * s * hh) / 3; prompt = `Eine Pyramide hat eine quadratische Grundfläche mit der Seitenlänge ${s} cm und die Höhe ${hh} cm. Wie groß ist ihr Volumen (in cm³)?`; opts = [V(want, true), V(s * s * hh, false, `Es fehlt der Faktor ${tex('\\tfrac13')}: Eine Pyramide füllt nur ein Drittel des Quaders.`), V((s * s * hh) / 2, false, `Bei Pyramide und Kegel ist der Faktor ${tex('\\tfrac13')}, nicht ${tex('\\tfrac12')}.`), V((s * hh) / 3, false, 'Die Grundfläche ist Seitenlänge mal Seitenlänge.')]; explain = `${tex(`V=\\tfrac13\\cdot ${s}^2\\cdot ${hh}=${want}`)} cm³.`; }
    if (!uniqNum(opts)) continue;
    return { prompt, options: shuffle(opts), hints: ['Welche Formel gehört zu dieser Figur?', { dreieck: `${tex('A=\\tfrac12\\,g\\,h')}`, quader: `${tex('V=a\\cdot b\\cdot c')}`, kreis: `${tex('A=\\pi r^2')}`, zylinder: `${tex('V=\\pi r^2 h')}`, pyramide: `${tex('V=\\tfrac13\\,G\\,h')}` }[kind]], explain, kind, want };
  }
}

/** Mittelpunkt einer Strecke. */
export function genMittelpunkt(lv = 3) {
  for (;;) {
    const dim = lv <= 2 ? 2 : 3, R = tier(lv, 4, 5, 5, 7, 9);
    const A = Array.from({ length: dim }, () => ri(-R, R)), B = A.map((c) => c + 2 * ri(-3, 3) + (lv >= 4 && rand() < 0.4 ? 1 : 0));
    const M = A.map((c, i) => (c + B[i]) / 2);
    const O = (v, correct, why) => ({ tex: pt('M', v), vec: v, correct, why });
    const opts = [O(M, true), O(B.map((c, i) => c - A[i]), false, 'Das ist der Verbindungsvektor von A nach B, kein Punkt in der Mitte.'), O(B.map((c, i) => (c - A[i]) / 2), false, 'Das ist der halbe Verbindungsvektor. Er muss noch an A angehängt werden – oder direkt: Koordinaten addieren und halbieren.'), O(A.map((c, i) => c + B[i]), false, 'Die Summe muss noch halbiert werden.')];
    if (opts.some((o, i) => opts.some((p, j) => i < j && same(o.vec, p.vec)))) continue;
    return { prompt: `Bestimme den Mittelpunkt der Strecke ${tex('AB')}.`, formula: `${pt('A', A)},\\quad ${pt('B', B)}`, options: shuffle(opts), hints: ['Der Mittelpunkt hat in jeder Koordinate den Mittelwert der beiden Punkte.', `${tex('M=\\tfrac12\\,(A+B)')}.`], explain: `${tex(pt('M', M))}: je Koordinate addieren und durch 2 teilen.`, A, B };
  }
}

/** Mit Vektoren rechnen: addieren, subtrahieren, vervielfachen. */
export function genVektorRechnen(lv = 3) {
  for (;;) {
    const dim = lv <= 1 ? 2 : 3, R = tier(lv, 4, 4, 5, 6, 8);
    const u = Array.from({ length: dim }, () => ri(-R, R)), v = Array.from({ length: dim }, () => ri(-R, R)), k = pick(lv <= 2 ? [2, 3] : [2, 3, -2, -3, 4]);
    const kind = pick(tier(lv, ['add', 'skalar'], ['add', 'sub', 'skalar'], ['sub', 'skalar', 'kombi'], ['kombi', 'sub'], ['kombi']));
    const O = (vec, correct, why) => ({ tex: vecTex(vec), vec, correct, why });
    const U = '\\vec u', Vv = '\\vec v';
    let term, opts;
    if (kind === 'add') { term = `${U}+${Vv}`; opts = [O(u.map((c, i) => c + v[i]), true), O(u.map((c, i) => c - v[i]), false, 'Hier wurde subtrahiert statt addiert.'), O(u.map((c, i) => c * v[i]), false, 'Zeilenweise multiplizieren ist keine Vektoraddition.'), O(u.map((c, i) => (i === 0 ? c + v[i] : c)), false, 'Die Addition gilt für <b>jede</b> Zeile.')]; }
    else if (kind === 'sub') { term = `${U}-${Vv}`; opts = [O(u.map((c, i) => c - v[i]), true), O(v.map((c, i) => c - u[i]), false, `Reihenfolge vertauscht: Das ist ${tex(`${Vv}-${U}`)}.`), O(u.map((c, i) => c + v[i]), false, 'Hier wurde addiert statt subtrahiert.'), O(u.map((c, i) => c - Math.abs(v[i])), false, 'Achte auf „minus minus": Eine negative Zahl abzuziehen heißt addieren.')]; }
    else if (kind === 'skalar') { term = `${ft(k)}\\cdot${U}`; opts = [O(u.map((c) => k * c), true), O(u.map((c, i) => (i === 0 ? k * c : c)), false, 'Der Faktor wird mit <b>jeder</b> Zeile multipliziert.'), O(u.map((c) => c + k), false, 'Es wird multipliziert, nicht addiert.'), O(u.map((c) => -k * c), false, 'Achte auf das Vorzeichen des Faktors.')]; }
    else { term = `${ft(k)}\\cdot${U}-${Vv}`; opts = [O(u.map((c, i) => k * c - v[i]), true), O(u.map((c, i) => k * c + v[i]), false, 'Der zweite Vektor wird abgezogen, nicht addiert.'), O(u.map((c, i) => k * (c - v[i])), false, `Nur ${tex(U)} wird mit ${ft(k)} multipliziert – Punkt vor Strich.`), O(u.map((c, i) => c - v[i]), false, `Der Faktor ${ft(k)} vor ${tex(U)} fehlt.`)]; }
    if (opts.some((o, i) => opts.some((p, j) => i < j && same(o.vec, p.vec)))) continue;
    return { prompt: `Berechne ${tex(term)}.`, formula: `${U}=${vecTex(u)},\\quad ${Vv}=${vecTex(v)}`, options: shuffle(opts), hints: ['Vektoren rechnet man Zeile für Zeile.', kind === 'kombi' ? 'Erst vervielfachen, dann subtrahieren (Punkt vor Strich).' : 'Achte in jeder Zeile auf die Vorzeichen.'], explain: `${tex(`${term}=${opts[0].tex}`)}.`, u, v, k, kind };
  }
}

/* ───────────── Themen-Namen ───────────── */
for (const [fn, topic] of [[genBruch, 'Bruchrechnen'], [genKlammer, 'Klammern und binomische Formeln'], [genLinGl, 'Lineare Gleichungen'], [genQuadGl, 'Quadratische Gleichungen'], [genPotenz, 'Potenzgesetze'], [genSteigung, 'Geraden durch zwei Punkte'],
  [genHaeufigkeit, 'Relative Häufigkeit'], [genProzent, 'Prozentrechnung'], [genKennwerte, 'Mittelwert und Median'], [genLaplace, 'Laplace-Wahrscheinlichkeit'], [genGegen, 'Gegenereignis'],
  [genPythagoras, 'Satz des Pythagoras'], [genTrig, 'Sinus, Kosinus, Tangens'], [genFlaeche, 'Flächen und Volumen'], [genMittelpunkt, 'Mittelpunkt einer Strecke'], [genVektorRechnen, 'Rechnen mit Vektoren']]) fn.topic = topic;
