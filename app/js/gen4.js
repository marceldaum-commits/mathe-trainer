// Aufgaben-Erzeuger, Teil 4: Lehrplan-Lücken (docs/LEHRPLAN.md) – gebrochen-rationale Funktionen, Sinus/Kosinus,
// Rotationskörper und uneigentliche Integrale, Zufallsgrößen und Unabhängigkeit, Kugeln, weitere Abstände und Lagen.
// Gleiche Regeln wie in gen.js: Stufe lv (1–5), Ablenker = typische Fehler mit Diagnose, Rechen-Felder für tests/.
import { ri, pick, shuffle, rand, ft, polyTex, polyEval } from './math.js';
import { tex } from './ui.js';
import { tier, par, vecTex, uniq, uniqNum, same, binom } from './gen.js';
import { fracTex } from './gen3.js';

const dfrac = (a, b) => `\\dfrac{${a}}{${b}}`;
const lin = (a, b) => polyTex([b, a]);                      // a·x + b
const mul = (p, q) => { const r = Array(p.length + q.length - 1).fill(0); p.forEach((a, i) => q.forEach((b, j) => { r[i + j] += a * b; })); return r; };
const sgn = (v) => (v < 0 ? `-${ft(-v)}` : `+${ft(v)}`);
const PT = (name, v) => `${name}(${v.map((c) => ft(c)).join('\\mid ')})`;

/* ───────────── Gebrochen-rationale Funktionen ───────────── */

/** Polstelle (und hebbare Lücke) erkennen. */
export function genPolstelle(lv = 3) {
  for (;;) {
    const p = pick(tier(lv, [1, 2, 3, 4], [-3, -2, 2, 3, 5], [-4, -1, 2, 3], [-3, -2, 1, 2, 4], [-5, -3, 2, 4, 6]));
    const a = lv <= 1 ? 0 : pick([1, 2, 3]), b = pick([1, 2, 4, 5, -1, -3]), k = lv === 3 ? pick([2, 3]) : 1;
    let zt, nt, Z, Nn, opts;
    const X = (num, correct, why) => ({ tex: `x=${ft(num, 2)}`, num, correct, why });
    if (lv <= 3) {
      if (a && -b / a === p) continue;
      Z = (x) => a * x + b; Nn = (x) => k * (x - p); zt = a ? lin(a, b) : ft(b); nt = polyTex([-k * p, k]);
      opts = [X(p, true), X(-p, false, `Vorzeichen: Der Nenner ${tex(nt)} wird bei ${tex(`x=${ft(p)}`)} null.`), a ? X(-b / a, false, 'Das ist die Nullstelle des Zählers – dort schneidet der Graph die x-Achse.') : X(b === p ? p + 2 : b, false, 'Der Zähler ist eine feste Zahl. Entscheidend ist, wo der Nenner null wird.'), X(k === 1 ? (p === 0 ? 1 : 0) : k * p, false, k === 1 ? `Setze ein: Bei ${tex('x=0')} ist der Nenner nicht null.` : `Löse ${tex(`${nt}=0`)} vollständig auf.`)];
    } else {
      const q = pick([-4, -2, -1, 1, 3, 5].filter((v) => v !== p)), r = pick([-3, -1, 2, 4, 6].filter((v) => v !== p && v !== q));
      const zc = mul([-p, 1], [-r, 1]), nc = mul([-p, 1], [-q, 1]);
      Z = (x) => polyEval(zc, x); Nn = (x) => polyEval(nc, x);
      zt = lv >= 5 ? polyTex(zc) : `(x${sgn(-p)})(x${sgn(-r)})`; nt = lv >= 5 ? polyTex(nc) : `(x${sgn(-p)})(x${sgn(-q)})`;
      opts = [X(q, true), X(p, false, `Bei ${tex(`x=${ft(p)}`)} werden Zähler <b>und</b> Nenner null: Der Faktor lässt sich kürzen – eine hebbare Lücke, keine Polstelle.`), X(r, false, 'Das ist die Nullstelle des Zählers, keine Polstelle.'), X(-q, false, 'Achte auf das Vorzeichen in der Klammer.')];
    }
    if (!uniqNum(opts) || !uniq(opts)) continue;
    return { prompt: lv >= 4 ? 'An welcher Stelle hat der Graph eine <b>Polstelle</b> (senkrechte Asymptote)?' : 'An welcher Stelle hat die Funktion eine Polstelle?', formula: `f(x)=${dfrac(zt, nt)}`, options: shuffle(opts),
      hints: ['Eine Polstelle liegt dort, wo der Nenner null wird – und der Zähler nicht.', lv >= 4 ? 'Wird an einer Stelle auch der Zähler null, lässt sich kürzen: Dann ist es nur eine Lücke.' : `Löse ${tex(`${nt}=0`)}.`],
      explain: `Der Nenner wird bei ${tex(`x=${ft(opts[0].num)}`)} null, der Zähler dort nicht: Polstelle${lv >= 4 ? ` (bei ${tex(`x=${ft(p)}`)} dagegen eine hebbare Lücke)` : ''}.`, Z, N: Nn };
  }
}

/** Waagerechte oder schräge Asymptote. */
export function genAsymptote(lv = 3) {
  for (;;) {
    const A = (t, val, correct, why) => ({ tex: `y=${t}`, val, correct, why });
    let zc, nc, opts, hint2, exp;
    if (lv <= 2) {
      const c = lv <= 1 ? 1 : pick([1, 2, 4]), a = c * pick([1, 2, 3, -2]), b = pick([1, 3, -2, 5]), d = pick([1, 2, -3, 4]);
      if (a * d === b * c || b === d) continue;
      zc = [b, a]; nc = [d, c];
      opts = [A(ft(a / c), () => a / c, true), A(ft(b / d, 2), () => b / d, false, 'Das ist der Wert bei x = 0 (y-Achsenabschnitt), nicht das Verhalten für große x.'), A('0', () => 0, false, 'Zähler und Nenner haben denselben Grad: Der Bruch nähert sich dem Verhältnis der Vorfaktoren, nicht 0.'), A(ft(-d / c, 2), () => -d / c, false, 'Das ist die Polstelle (ein x-Wert), keine waagerechte Asymptote.')];
      hint2 = `Teile die Vorfaktoren der höchsten Potenzen: ${tex(dfrac(ft(a), ft(c)))}.`; exp = `Gleicher Grad oben und unten: ${tex(`y=${dfrac(ft(a), ft(c))}=${ft(a / c)}`)}.`;
    } else if (lv === 3) {
      const gleich = rand() < 0.5, a = pick([2, 3, 4, -2]), c = pick([1, 2]), b = pick([1, -3, 5]), d = pick([1, 2, 4]);
      zc = gleich ? [b, 0, a] : [b, a]; nc = [d, 0, c];
      const y = gleich ? a / c : 0;
      opts = gleich ? [A(ft(y), () => y, true), A('0', () => 0, false, 'Zähler und Nenner haben denselben Grad – der Grenzwert ist das Verhältnis der Vorfaktoren.'), A(ft(b / d, 2), () => b / d, false, 'Das ist der Wert bei x = 0.'), A(ft(a), () => a, false, 'Auch der Vorfaktor im Nenner zählt.')]
        : [A('0', () => 0, true), A(ft(a / c), () => a / c, false, 'Der Nenner hat den höheren Grad: Er wächst schneller, der Bruch geht gegen 0.'), A(ft(b / d, 2), () => b / d, false, 'Das ist der Wert bei x = 0.'), A(ft(a), () => a, false, 'Für große x gewinnt der Nenner.')];
      if (a === c && gleich) continue;
      hint2 = gleich ? 'Gleicher Grad: Verhältnis der Vorfaktoren.' : 'Nennergrad größer als Zählergrad: Der Bruch geht gegen 0.'; exp = gleich ? `Gleicher Grad: ${tex(`y=${ft(y)}`)}.` : `Der Nennergrad ist größer: ${tex('y=0')} (die x-Achse).`;
    } else {
      const p = pick([1, 2, 3, -1, -2]), m = lv >= 5 ? pick([2, -1]) : 1, s = pick([1, 2, -3, 4]), rest = pick([1, 2, 3, -2, 5]);
      // f(x) = (m·x + s) + rest/(x − p)  ⇒  Zähler = (m·x + s)(x − p) + rest
      zc = mul([s, m], [-p, 1]); zc[0] += rest; nc = [-p, 1];
      const L = (M, S, correct, why) => A(lin(M, S), (x) => M * x + S, correct, why);
      opts = [L(m, s, true), L(m, zc[1], false, 'Der zweite Summand entsteht erst durch die Polynomdivision – er ist nicht einfach der Vorfaktor von x im Zähler.'), A(ft(m), () => m, false, 'Der Zählergrad ist um 1 größer als der Nennergrad: Die Asymptote ist schräg, nicht waagerecht.'), L(m, -s || 1, false, 'Vorzeichenfehler bei der Polynomdivision.')];
      if (zc[1] === s) continue;
      hint2 = `Polynomdivision: ${tex(`(${polyTex(zc)}):(${polyTex(nc)})`)}.`; exp = `${tex(`f(x)=${lin(m, s)}+${dfrac(ft(rest), polyTex(nc))}`)} – der Bruch geht gegen 0, es bleibt ${tex(`y=${lin(m, s)}`)}.`;
    }
    if (!uniq(opts)) continue;
    const f = (x) => polyEval(zc, x) / polyEval(nc, x);
    return { prompt: lv >= 4 ? 'Welche Gerade ist die <b>schräge Asymptote</b> des Graphen?' : `Welcher Geraden nähert sich der Graph für ${tex('x\\to\\infty')}?`, formula: `f(x)=${dfrac(polyTex(zc), polyTex(nc))}`, options: shuffle(opts),
      hints: ['Vergleiche den Grad von Zähler und Nenner.', hint2], explain: exp, f };
  }
}

/** Quotientenregel. */
export function genQuotient(lv = 3) {
  for (;;) {
    const d = pick([1, 2, 3, 5]), c = lv <= 2 ? 1 : pick([1, 2, 3]);
    const u = lv >= 5 ? [pick([0, 1, 3]), 0, 1] : lv === 4 ? [0, 0, 1] : [pick([1, 2, -1, 3, -4]), lv <= 1 ? 1 : pick([1, 2, 3, -2])], v = [d, c];
    const du = u.length === 3 ? [0, 2] : [u[1]], dv = [c];
    const sub = (p, q) => Array.from({ length: Math.max(p.length, q.length) }, (_, i) => (p[i] || 0) - (q[i] || 0));
    const num = sub(mul(du, v), mul(u, dv)), plus = sub(mul(du, v), mul(u, dv).map((x) => -x));
    if (num.every((x) => x === 0) || same(num, plus)) continue;
    const V = polyTex(v), Q = (n, sq, correct, why) => ({ tex: `f'(x)=${dfrac(polyTex(n), sq ? `(${V})^2` : V)}`, val: (x) => polyEval(n, x) / polyEval(v, x) ** (sq ? 2 : 1), correct, why });
    const opts = [Q(num, true, true), Q(plus, true, false, `In der Quotientenregel steht ein Minus: ${tex("u'v-uv'")}.`), Q(num, false, false, 'Der Nenner wird quadriert.'), Q(num.map((x) => -x), true, false, `Reihenfolge im Zähler: ${tex("u'v-uv'")}, nicht ${tex("uv'-u'v")}.`)];
    if (!uniq(opts)) continue;
    return { prompt: 'Welche Ableitung ist richtig?', formula: `f(x)=${dfrac(polyTex(u), V)}`, domain: 'pos', options: shuffle(opts),
      hints: [`Quotientenregel: ${tex("\\left(\\dfrac uv\\right)'=\\dfrac{u'v-uv'}{v^2}")}.`, `${tex(`u'=${polyTex(du)}`)} und ${tex(`v'=${ft(c)}`)}.`],
      explain: `${tex(`f'(x)=${dfrac(`(${polyTex(du)})(${V})-(${polyTex(u)})\\cdot${par(c)}`, `(${V})^2`)}=${dfrac(polyTex(num), `(${V})^2`)}`)}.`, f: (x) => polyEval(u, x) / polyEval(v, x) };
  }
}

/* ───────────── Sinus und Kosinus ───────────── */
const K = (a) => (a === 1 ? '' : a === -1 ? '-' : ft(a));
const arg = (b) => `(${b === 1 ? '' : ft(b)}x)`;

/** Sinus und Kosinus ableiten. */
export function genTrigAbl(lv = 3) {
  for (;;) {
    const a = pick(tier(lv, [2, 3, 4], [2, 3, -2, 5], [2, 3, -2, 4], [2, -3, 4, 5], [1, 2, 3])), b = lv >= 3 ? pick([2, 3, 4]) : 1, c = lv === 2 || lv === 4 ? pick([1, 3, -2]) : 0, isSin = rand() < 0.5;
    const T = (t, val, correct, why) => ({ tex: `f'(x)=${t}`, val, correct, why });
    let formula, f, opts;
    if (lv >= 5) {
      formula = `${K(a)}x\\cdot\\${isSin ? 'sin' : 'cos'}(x)`; f = (x) => a * x * (isSin ? Math.sin(x) : Math.cos(x));
      const s = `${K(a)}\\sin(x)`, co = `${K(a)}\\cos(x)`, xs = `${K(a)}x\\sin(x)`, xc = `${K(a)}x\\cos(x)`;
      opts = isSin ? [T(`${s}+${xc}`, (x) => a * Math.sin(x) + a * x * Math.cos(x), true), T(co, (x) => a * Math.cos(x), false, `Das ist ${tex("u'\\cdot v'")}. Produktregel: ${tex("u'v+uv'")}.`), T(`${s}-${xc}`, (x) => a * Math.sin(x) - a * x * Math.cos(x), false, `${tex("(\\sin x)'=\\cos x")} – ohne Minus.`), T(xc, (x) => a * x * Math.cos(x), false, `Der erste Teil ${tex("u'v")} fehlt.`)]
        : [T(`${co}-${xs}`, (x) => a * Math.cos(x) - a * x * Math.sin(x), true), T(`-${s}`, (x) => -a * Math.sin(x), false, `Das ist ${tex("u'\\cdot v'")}. Produktregel: ${tex("u'v+uv'")}.`), T(`${co}+${xs}`, (x) => a * Math.cos(x) + a * x * Math.sin(x), false, `${tex("(\\cos x)'=-\\sin x")} – mit Minus.`), T(`-${xs}`, (x) => -a * x * Math.sin(x), false, `Der erste Teil ${tex("u'v")} fehlt.`)];
    } else {
      const ct = c ? (lv === 4 ? `${sgn(c)}x` : sgn(c)) : '', dc = lv === 4 ? c : 0;
      formula = `${K(a)}\\${isSin ? 'sin' : 'cos'}${arg(b)}${ct}`; f = (x) => a * (isSin ? Math.sin(b * x) : Math.cos(b * x)) + (lv === 4 ? c * x : c);
      const D = (coef, fn, correct, why) => T(`${K(coef)}\\${fn}${arg(b)}${dc ? sgn(dc) : ''}`, (x) => coef * (fn === 'sin' ? Math.sin(b * x) : Math.cos(b * x)) + dc, correct, why);
      const right = isSin ? [a * b, 'cos'] : [-a * b, 'sin'];
      opts = [D(right[0], right[1], true), D(-right[0], right[1], false, isSin ? `${tex("(\\sin x)'=\\cos x")} – ohne Minus.` : `${tex("(\\cos x)'=-\\sin x")} – das Minus nicht vergessen.`), D(isSin ? a * b : -a * b, isSin ? 'sin' : 'cos', false, 'Sinus wird zu Kosinus und umgekehrt – die Funktion muss wechseln.'),
        b === 1 ? T(`${K(right[0])}\\${right[1]}${arg(b)}${sgn(c || 1)}`, (x) => right[0] * (right[1] === 'sin' ? Math.sin(x) : Math.cos(x)) + (c || 1), false, 'Eine einzelne Zahl fällt beim Ableiten weg – und es kommt keine hinzu.') : D(right[0] / b, right[1], false, `Kettenregel: Die innere Ableitung ${tex(ft(b))} fehlt als Faktor.`)];
    }
    if (!uniq(opts)) continue;
    return { prompt: 'Welche Ableitung ist richtig?', formula: `f(x)=${formula}`, options: shuffle(opts),
      hints: [`${tex("(\\sin x)'=\\cos x")} und ${tex("(\\cos x)'=-\\sin x")}.`, lv >= 5 ? `Produktregel: ${tex("u'v+uv'")}.` : b > 1 ? `Kettenregel: mal innere Ableitung ${tex(ft(b))}.` : 'Ein Vorfaktor bleibt stehen, eine einzelne Zahl fällt weg.'], explain: `${tex(opts[0].tex)}.`, f };
  }
}

/** Bestimmte Integrale mit Sinus und Kosinus. */
export function genTrigInt(lv = 3) {
  for (;;) {
    const a = pick(tier(lv, [1, 2, 3], [2, 3, 4], [2, 3, 5], [2, 4, 6], [3, 4, 6])), b = lv >= 4 ? 2 : 1, c = lv === 3 || lv === 5 ? pick([1, 2]) : 0, isSin = lv === 2 ? false : lv === 1 ? true : rand() < 0.5;
    // sin über [0, π/b], cos über [0, π/(2b)]
    const hi = isSin ? Math.PI / b : Math.PI / (2 * b), hiT = isSin ? (b === 1 ? '\\pi' : '\\tfrac{\\pi}{2}') : (b === 1 ? '\\tfrac{\\pi}{2}' : '\\tfrac{\\pi}{4}');
    const trig = isSin ? (2 * a) / b : a / b, piK = c * (isSin ? 1 / b : 1 / (2 * b));        // Ergebnis = trig + piK·π
    const show = (t, k) => (k ? `${t === 0 ? '' : `${ft(t)}+`}${fracTex(Math.round(k * 4), 4).replace('\\dfrac', '\\tfrac')}\\pi`.replace(/(^|\+)1\\pi/, '$1\\pi') : ft(t, 2));
    const N = (t, k, correct, why) => ({ tex: show(t, k), num: t + k * Math.PI, correct, why });
    const opts = [N(trig, piK, true), N(isSin ? 0 : -trig, piK, false, isSin ? `${tex('-\\cos(\\dots)')} an beiden Grenzen einsetzen: Die Werte heben sich nicht auf, sie addieren sich.` : 'Vorzeichen: Eine Stammfunktion von cos ist sin – ohne Minus.'),
      N(isSin ? 2 * a : a, piK, false, b > 1 ? `Beim Aufleiten wird durch die innere Ableitung ${tex(ft(b))} geteilt.` : 'Setze die Grenzen in die Stammfunktion ein, nicht in die Funktion.'), N(b > 1 ? trig / 2 : trig * 2, piK, false, 'Rechne die Werte der Stammfunktion an beiden Grenzen einzeln aus.')];
    if (b === 1) opts[2] = N(a * (isSin ? 1 : 0.5), piK, false, 'Setze beide Grenzen in die Stammfunktion ein und bilde die Differenz.');
    if (!uniqNum(opts) || !uniq(opts)) continue;
    const ft2 = `${K(a)}\\${isSin ? 'sin' : 'cos'}${arg(b)}${c ? sgn(c) : ''}`;
    return { prompt: 'Berechne das Integral.', formula: `\\int_{0}^{${hiT}}\\left(${ft2}\\right)dx`, options: shuffle(opts),
      hints: [`Stammfunktionen: ${tex('\\int\\sin x\\,dx=-\\cos x')} und ${tex('\\int\\cos x\\,dx=\\sin x')}.`, b > 1 ? `Durch die innere Ableitung ${tex(ft(b))} teilen.` : 'Obere minus untere Grenze.'],
      explain: `${tex(`\\int_{0}^{${hiT}}\\left(${ft2}\\right)dx=${show(trig, piK)}`)}${piK ? ` ${tex(`\\approx${ft(trig + piK * Math.PI, 2)}`)}` : ''}.`, f: (x) => a * (isSin ? Math.sin(b * x) : Math.cos(b * x)) + c, a: 0, b: hi };
  }
}

/* ───────────── Rotationskörper und uneigentliche Integrale ───────────── */

/** Volumen eines Rotationskörpers um die x-Achse. */
export function genRotation(lv = 3) {
  for (;;) {
    const h = pick(tier(lv, [2, 3, 4], [1, 2, 3], [2, 4, 6], [1, 2], [1, 2, 3]));
    const kind = tier(lv, 'konst', 'gerade', 'wurzel', 'quadrat', 'summe'), m = pick([1, 2, 3]);
    // koeff·π ist das Volumen; „ohne Quadrat" ist ∫f, „doppelt" 2π∫f² (Verwechslung mit Umfang)
    const D = { konst: [`f(x)=${m}`, (x) => m + 0 * x, [m * m * h, 1], [m * h, 1]], gerade: [`f(x)=${K(m)}x`, (x) => m * x, [m * m * h ** 3, 3], [m * h * h, 2]], wurzel: ['f(x)=\\sqrt{x}', (x) => Math.sqrt(x), [h * h, 2], [2 * h ** 1.5, 3]],
      quadrat: ['f(x)=x^2', (x) => x * x, [h ** 5, 5], [h ** 3, 3]], summe: ['f(x)=x+1', (x) => x + 1, [(h + 1) ** 3 - 1, 3], [h * h + 2 * h, 2]] }[kind];
    const [vn, vd] = D[2], pi = (n, d2) => { const t = fracTex(Math.round(n), d2); return t === '1' ? '\\pi' : `${t}\\,\\pi`; };
    const N = (n, d2, withPi, correct, why) => ({ tex: !Number.isInteger(n) ? `${ft(n / d2, 2)}${withPi ? '\\,\\pi' : ''}` : withPi ? pi(n, d2) : fracTex(n, d2), num: (n / d2) * (withPi ? Math.PI : 1), correct, why });
    const opts = [N(vn, vd, true, true), N(vn, vd, false, false, `Der Faktor ${tex('\\pi')} fehlt: ${tex('V=\\pi\\int f(x)^2\\,dx')}.`), N(D[3][0], D[3][1], true, false, 'Die Funktion wird quadriert, bevor integriert wird.'), N(2 * vn, vd, true, false, `Es heißt ${tex('\\pi')}, nicht ${tex('2\\pi')} – die Formel kommt von der Kreisfläche ${tex('\\pi r^2')}.`)];
    if (!uniqNum(opts) || !uniq(opts)) continue;
    return { prompt: `Der Graph von ${tex('f')} rotiert über dem Intervall ${tex(`[0;\\,${h}]`)} um die x-Achse. Wie groß ist das Volumen des Rotationskörpers?`, formula: D[0], options: shuffle(opts),
      hints: [`${tex('V=\\pi\\int_a^b f(x)^2\\,dx')}.`, 'Erst quadrieren, dann aufleiten, dann die Grenzen einsetzen.'], explain: `${tex(`V=\\pi\\int_0^{${h}}\\left(${D[0].slice(5)}\\right)^2dx=${pi(vn, vd)}\\approx${ft((vn / vd) * Math.PI, 2)}`)}.`, f: D[1], a: 0, b: h };
  }
}

/** Uneigentliche Integrale. */
export function genUneigentlich(lv = 3) {
  for (;;) {
    const a = pick(tier(lv, [1, 2, 4], [1], [2, 4, 5], [1, 2], [1, 2, 3])), k = lv >= 3 ? pick([1, 2, 3, 6]) : 1, n = lv === 2 ? pick([3, 4]) : lv === 4 ? 3 : 2, ex = lv >= 5;
    // Potenz: ∫_a^∞ k/x^n dx = k / ((n−1)·a^(n−1));  e-Funktion: ∫_0^∞ k·e^(−a·x) dx = k/a
    const zn = ex ? [k, a] : [k, (n - 1) * a ** (n - 1)];
    const F = (z, nn, correct, why) => ({ tex: fracTex(z, nn), num: z / nn, correct, why });
    const opts = ex ? [F(k, a, true), F(k * a, 1, false, 'Beim Aufleiten wird durch den Faktor im Exponenten geteilt, nicht multipliziert.'), F(-k, a, false, 'Achte auf die Vorzeichen: Der Flächeninhalt unter dieser Kurve ist positiv.'), { tex: '\\infty', num: 1e9, correct: false, why: 'Die e-Funktion fällt so schnell, dass die Fläche endlich bleibt.' }]
      : [F(zn[0], zn[1], true), F(k, a ** (n - 1), false, `Beim Aufleiten von ${tex(`x^{-${n}}`)} entsteht der Faktor ${tex(`\\tfrac{1}{-${n - 1}}`)}.`), F(-zn[0], zn[1], false, 'Achte auf die Vorzeichen: Die Fläche ist positiv.'), { tex: '\\infty', num: 1e9, correct: false, why: `Für ${tex('n>1')} fällt ${tex('\\tfrac{1}{x^n}')} schnell genug – die Fläche bleibt endlich.` }];
    if (n === 2 && !ex) opts[1] = a === 1 ? F(k * 2, 1, false, 'Setze die Grenze in die Stammfunktion ein und achte auf den Faktor.') : F(k, a * a, false, 'Du hast die Grenze in die Funktion eingesetzt. Erst die Stammfunktion bilden.');
    if (!uniqNum(opts) || !uniq(opts)) continue;
    const fx = ex ? `${K(k)}e^{-${a === 1 ? '' : a}x}` : dfrac(ft(k), n === 1 ? 'x' : `x^{${n}}`);
    return { prompt: 'Berechne das uneigentliche Integral.', formula: `\\int_{${ex ? 0 : a}}^{\\infty}${fx}\\,dx`, options: shuffle(opts),
      hints: ['Erst bis zu einer Grenze b integrieren, dann b gegen unendlich laufen lassen.', ex ? `${tex(`\\int e^{-${a === 1 ? '' : a}x}dx=-\\tfrac{1}{${a}}e^{-${a === 1 ? '' : a}x}`)}.` : `${tex(`\\int x^{-${n}}dx=\\tfrac{x^{-${n - 1}}}{-${n - 1}}`)}.`],
      explain: `Der Anteil an der oberen Grenze geht gegen 0, es bleibt ${tex(fracTex(zn[0], zn[1]))}.`, f: ex ? (x) => k * Math.exp(-a * x) : (x) => k / x ** n, a: ex ? 0 : a };
  }
}

/* ───────────── Zufallsgrößen und Unabhängigkeit ───────────── */

/** Stochastische Unabhängigkeit prüfen. */
export function genUnabhaengig(lv = 3) {
  for (;;) {
    const N0 = pick(tier(lv, [100], [100, 200], [200, 400], [120, 240, 300], [150, 250, 360]));
    const pa = pick([0.2, 0.25, 0.4, 0.5, 0.6]), pb = pick([0.2, 0.3, 0.4, 0.5]), unab = rand() < 0.5;
    const A = N0 * pa, B = N0 * pb, AB = unab ? A * pb : A * pb + pick([-1, 1]) * pick(tier(lv, [10], [10, 5], [10, 12], [6, 9], [3, 6]));
    if (![A, B, AB].every((v) => Number.isInteger(v) && v > 0) || AB >= Math.min(A, B)) continue;
    const zahlen = lv >= 3, pAB = AB / N0, prod = pa * pb;
    const given = zahlen ? `Von ${N0} Befragten haben ${A} das Merkmal ${tex('A')}, ${B} das Merkmal ${tex('B')} und ${AB} beide Merkmale.` : `Es gilt ${tex(`P(A)=${ft(pa)}`)}, ${tex(`P(B)=${ft(pb)}`)} und ${tex(`P(A\\cap B)=${ft(pAB, 3)}`)}.`;
    const O = (key, html, correct, why) => ({ tex: key, html, key, correct, why });
    const opts = [O('u', `Unabhängig, denn ${tex(`P(A)\\cdot P(B)=${ft(prod, 3)}=P(A\\cap B)`)}.`, unab, `Rechne nach: ${tex(`${ft(pa)}\\cdot${ft(pb)}=${ft(prod, 3)}`)}, aber ${tex(`P(A\\cap B)=${ft(pAB, 3)}`)}.`),
      O('a', `Abhängig, denn ${tex(`P(A)\\cdot P(B)=${ft(prod, 3)}\\neq${ft(pAB, 3)}`)}.`, !unab, `Rechne nach: ${tex(`${ft(pa)}\\cdot${ft(pb)}=${ft(prod, 3)}`)} – das ist genau ${tex('P(A\\cap B)')}.`),
      O('s', `Unabhängig, denn ${tex(`P(A)+P(B)=${ft(pa + pb, 2)}\\le 1`)}.`, false, 'Die Summe sagt nichts über Unabhängigkeit. Geprüft wird das Produkt.'),
      O('g', `Abhängig, denn ${tex('P(A\\cap B)>0')}: Die Ereignisse können gemeinsam eintreten.`, false, 'Gemeinsam eintreten können auch unabhängige Ereignisse. „Unvereinbar" und „unabhängig" sind verschiedene Dinge.')];
    return { prompt: `${given} Sind ${tex('A')} und ${tex('B')} stochastisch unabhängig?`, options: shuffle(opts),
      hints: [`Unabhängig heißt: ${tex('P(A\\cap B)=P(A)\\cdot P(B)')}.`, zahlen ? `Rechne erst die Anteile aus: ${tex(`P(A)=\\tfrac{${A}}{${N0}}`)} usw.` : 'Multipliziere die beiden Einzelwahrscheinlichkeiten und vergleiche.'],
      explain: `${tex(`P(A)\\cdot P(B)=${ft(pa)}\\cdot${ft(pb)}=${ft(prod, 3)}`)} und ${tex(`P(A\\cap B)=${ft(pAB, 3)}`)}: ${unab ? 'gleich, also unabhängig' : 'verschieden, also abhängig'}.`, n: N0, A, B, AB };
  }
}

/** Erwartungswert und Varianz einer Zufallsgröße aus der Tabelle. */
export function genVarianz(lv = 3) {
  for (;;) {
    const n = lv <= 2 ? 3 : 4, P = pick(n === 3 ? [[0.5, 0.25, 0.25], [0.2, 0.5, 0.3], [0.4, 0.4, 0.2], [0.25, 0.5, 0.25]] : [[0.1, 0.4, 0.3, 0.2], [0.25, 0.25, 0.25, 0.25], [0.4, 0.3, 0.2, 0.1], [0.2, 0.2, 0.5, 0.1]]);
    const xs = shuffle(tier(lv, [0, 1, 2, 4], [0, 2, 4, 10], [-1, 0, 2, 4, 5], [-2, 0, 1, 3, 6], [-5, -1, 0, 2, 10])).slice(0, n).sort((x, y) => x - y);
    const mu = xs.reduce((s, x, i) => s + x * P[i], 0), ex2 = xs.reduce((s, x, i) => s + x * x * P[i], 0), va = ex2 - mu * mu;
    const ask = tier(lv, 'mu', 'mu', pick(['mu', 'var']), 'var', pick(['var', 'sigma']));
    const N = (num, correct, why) => ({ tex: ft(num, 2), num, correct, why });
    const mean = xs.reduce((s, x) => s + x, 0) / n;
    const opts = ask === 'mu' ? [N(mu, true), N(mean, false, 'Das ist der einfache Mittelwert der Werte. Jeder Wert muss mit seiner Wahrscheinlichkeit gewichtet werden.'), N(ex2, false, 'Die Werte werden nicht quadriert – das braucht man erst für die Varianz.'), N(mu + 1, false, `Rechne ${tex('\\sum x_i\\cdot p_i')} Zeile für Zeile.`)]
      : ask === 'var' ? [N(va, true), N(ex2, false, `Es fehlt noch ${tex('-\\mu^2')}: ${tex('V(X)=E(X^2)-\\mu^2')}.`), N(Math.sqrt(va), false, 'Das ist die Standardabweichung (Wurzel der Varianz).'), N(mu, false, 'Das ist der Erwartungswert.')]
        : [N(Math.sqrt(va), true), N(va, false, 'Das ist die Varianz. Für die Standardabweichung noch die Wurzel ziehen.'), N(Math.sqrt(ex2), false, `Vor dem Wurzelziehen muss ${tex('\\mu^2')} abgezogen werden.`), N(mu, false, 'Das ist der Erwartungswert.')];
    if (!uniqNum(opts) || !uniq(opts) || va < 0.05 || opts.slice(1).some((o) => Math.abs(o.num - opts[0].num) < 0.06)) continue;
    return { prompt: `Die Zufallsgröße ${tex('X')} hat diese Verteilung. Wie groß ist ${{ mu: 'der Erwartungswert', var: 'die Varianz', sigma: 'die Standardabweichung' }[ask]}?`,
      formula: `\\begin{array}{c|${'c'.repeat(n)}}x_i&${xs.map((x) => ft(x)).join('&')}\\\\\\hline P(X=x_i)&${P.map((p) => ft(p)).join('&')}\\end{array}`, options: shuffle(opts),
      hints: [`${tex('\\mu=\\sum x_i\\cdot p_i')}.`, ask === 'mu' ? 'Jeden Wert mit seiner Wahrscheinlichkeit multiplizieren, dann addieren.' : `${tex('V(X)=\\sum x_i^2\\,p_i-\\mu^2')}, ${tex('\\sigma=\\sqrt{V(X)}')}.`],
      explain: `${tex(`\\mu=${ft(mu, 2)}`)}${ask === 'mu' ? '' : `, ${tex(`V(X)=${ft(ex2, 2)}-${ft(mu * mu, 2)}=${ft(va, 2)}`)}${ask === 'sigma' ? `, ${tex(`\\sigma\\approx${ft(Math.sqrt(va), 2)}`)}` : ''}`}.`, xs, P, ask };
  }
}

/** Ziehen ohne Zurücklegen: hypergeometrisch. */
export function genHyper(lv = 3) {
  for (;;) {
    const Nn = pick(tier(lv, [6, 8], [8, 10], [10, 12, 20], [20, 30, 49], [32, 49, 50])), Kk = lv >= 4 && Nn === 49 ? 6 : ri(2, Math.floor(Nn / 2)), n = lv >= 4 && Nn === 49 ? 6 : ri(2, Math.min(5, Nn - Kk)), k = ri(1, Math.min(Kk, n) - (lv <= 1 ? 0 : 0));
    if (n - k > Nn - Kk || k === n && lv > 2 || k < 1) continue;
    const p = Kk / Nn, hyp = (binom(Kk, k) * binom(Nn - Kk, n - k)) / binom(Nn, n);
    const ctx = Nn === 49 ? `Beim Lotto „6 aus 49" werden 6 Kugeln ohne Zurücklegen gezogen. Welcher Term gibt die Wahrscheinlichkeit für <b>genau ${k} Richtige</b> an?` : `In einer Urne liegen ${Nn} Kugeln, davon ${Kk} rote. Es werden ${n} Kugeln <b>ohne Zurücklegen</b> gezogen. Welcher Term gibt die Wahrscheinlichkeit für <b>genau ${k} rote</b> an?`;
    const B = (a, b) => `\\binom{${a}}{${b}}`, T = (t, num, correct, why) => ({ tex: t, num, correct, why });
    const opts = [T(dfrac(`${B(Kk, k)}\\cdot${B(Nn - Kk, n - k)}`, B(Nn, n)), hyp, true),
      T(`${B(n, k)}\\cdot\\left(${fracTex(Kk, Nn).replace('\\dfrac', '\\tfrac')}\\right)^{${k}}\\cdot\\left(${fracTex(Nn - Kk, Nn).replace('\\dfrac', '\\tfrac')}\\right)^{${n - k}}`, binom(n, k) * p ** k * (1 - p) ** (n - k), false, 'Das ist die Bernoulli-Formel – sie gilt nur <b>mit</b> Zurücklegen, wenn sich die Wahrscheinlichkeit nicht ändert.'),
      T(dfrac(B(Kk, k), B(Nn, n)), binom(Kk, k) / binom(Nn, n), false, `Auch die ${n - k} nicht-roten Kugeln müssen ausgewählt werden.`.replace('nicht-roten Kugeln', Nn === 49 ? 'falschen Zahlen' : 'nicht-roten Kugeln')),
      T(dfrac(`${B(Kk, k)}\\cdot${B(Nn - Kk, n - k)}`, B(Nn, Kk)), (binom(Kk, k) * binom(Nn - Kk, n - k)) / binom(Nn, Kk), false, `Im Nenner stehen alle Möglichkeiten, ${n} aus ${Nn} zu ziehen.`)];
    // kein Ablenker darf zufällig denselben Wert haben (z. B. wenn alle gezogenen rot sind)
    if (!uniq(opts) || k >= n || opts.slice(1).some((o) => Math.abs(o.num - hyp) < 1e-4 * hyp)) continue;
    return { prompt: ctx, options: shuffle(opts), hints: ['Günstige durch mögliche Auswahlen – mit Binomialkoeffizienten.', `Günstig: ${k} aus den ${Kk} ${Nn === 49 ? 'Richtigen' : 'roten'} <b>und</b> ${n - k} aus den ${Nn - Kk} übrigen.`],
      explain: `${tex(`P=${opts[0].tex}\\approx${ft(hyp * 100, 2)}\\,\\%`)}.`, N: Nn, K: Kk, n, k };
  }
}

/* ───────────── Kugeln, weitere Abstände, Lage von Ebenen ───────────── */
const TRIPEL = [[1, 2, 2, 3], [2, 3, 6, 7], [0, 3, 4, 5], [2, 6, 9, 11], [4, 4, 7, 9], [1, 4, 8, 9]];

/** Kugel: Lage eines Punktes, Mittelpunkt und Radius, Abstand zur Oberfläche. */
export function genKugel(lv = 3) {
  for (;;) {
    const [a, b, c, r] = pick(TRIPEL.slice(0, tier(lv, 3, 3, 4, 6, 6))), M = lv <= 2 ? [0, 0, 0] : [ri(-4, 4), ri(-4, 4), ri(-4, 4)];
    const dir = shuffle([a, b, c]).map((v) => v * pick([1, -1]));
    const eqn = `K\\colon\\ ${M.map((m, i) => (m === 0 ? `x_${i + 1}^2` : `(x_${i + 1}${sgn(-m)})^2`)).join('+')}=${r * r}`;
    if (lv <= 3) {
      const wo = pick(['auf', 'innen', 'aussen']), Pp = M.map((m, i) => m + dir[i] + (i === 0 ? (wo === 'auf' ? 0 : wo === 'innen' ? -Math.sign(dir[0] || 1) : Math.sign(dir[0] || 1)) : 0));
      const d2 = Pp.reduce((s, x, i) => s + (x - M[i]) ** 2, 0);
      if ((wo === 'innen') !== (d2 < r * r) && wo !== 'auf' || (wo === 'auf') !== (d2 === r * r)) continue;
      const O = (key, html, why) => ({ tex: key, html, key, correct: key === wo, why });
      return { prompt: `Wo liegt der Punkt ${tex(PT('P', Pp))} bezüglich der Kugel?`, formula: eqn, options: shuffle([O('auf', 'Auf der Kugel.', `Setze ein: Die linke Seite ergibt ${d2}, nicht ${r * r}.`), O('innen', 'Innerhalb der Kugel.', `Setze ein: Die linke Seite ergibt ${d2}. Innerhalb wäre sie kleiner als ${r * r}.`), O('aussen', 'Außerhalb der Kugel.', `Setze ein: Die linke Seite ergibt ${d2}. Außerhalb wäre sie größer als ${r * r}.`), O('mitte', 'Im Mittelpunkt der Kugel.', `Der Mittelpunkt ist ${tex(PT('M', M))}.`)]),
        hints: ['Setze die Koordinaten von P in die linke Seite der Gleichung ein.', `Vergleiche das Ergebnis mit ${tex(`r^2=${r * r}`)}.`], explain: `Einsetzen ergibt ${d2}: ${d2 === r * r ? `gleich ${r * r}, also auf der Kugel` : d2 < r * r ? `kleiner als ${r * r}, also innerhalb` : `größer als ${r * r}, also außerhalb`}.`, kind: 'lage', M, r, P: Pp };
    }
    if (lv === 4) {
      const O = (m, rr, correct, why) => ({ tex: `${PT('M', m)},\\ r=${ft(rr)}`, M: m, r: rr, correct, why });
      const opts = [O(M, r, true), O(M.map((x) => -x), r, false, `In den Klammern steht ${tex('x-m')}: Bei ${tex('(x+2)^2')} ist die Koordinate −2.`), O(M, r * r, false, `Rechts steht ${tex('r^2')} – der Radius ist die Wurzel daraus.`), O(M.map((x) => -x), r * r, false, 'Vorzeichen des Mittelpunkts und Wurzel beim Radius beachten.')];
      if (M.every((x) => x === 0) || !uniq(opts)) continue;
      return { prompt: 'Lies Mittelpunkt und Radius der Kugel ab.', formula: eqn, options: shuffle(opts), hints: [`Kugelgleichung: ${tex('(x_1-m_1)^2+(x_2-m_2)^2+(x_3-m_3)^2=r^2')}.`, 'Vorzeichen in den Klammern umdrehen, rechts die Wurzel ziehen.'], explain: `${tex(`${PT('M', M)}`)} und ${tex(`r=\\sqrt{${r * r}}=${r}`)}.`, kind: 'mr', M, r };
    }
    const s = pick([2, 3]), Pp = M.map((m, i) => m + s * dir[i]), dist = s * r;
    const N = (num, correct, why) => ({ tex: ft(num, 2), num, correct, why });
    const opts = [N(dist - r, true), N(dist, false, 'Das ist der Abstand zum Mittelpunkt. Bis zur Oberfläche ist es um den Radius kürzer.'), N(dist + r, false, 'Der Radius wird abgezogen, nicht addiert – gesucht ist der nächste Punkt der Kugel.'), N(dist * dist - r * r, false, 'Erst die Wurzel ziehen, dann den Radius abziehen.')];
    if (!uniqNum(opts)) continue;
    return { prompt: `Wie weit ist der Punkt ${tex(PT('P', Pp))} von der Oberfläche der Kugel entfernt?`, formula: eqn, options: shuffle(opts), hints: ['Erst den Abstand von P zum Mittelpunkt berechnen.', 'Davon den Radius abziehen.'], explain: `${tex(`|\\overrightarrow{MP}|=${ft(dist)}`)}, minus Radius ${tex(ft(r))}: ${tex(ft(dist - r))}.`, kind: 'abstand', M, r, P: Pp };
  }
}

const LOT = [[[1, 0, 0], [0, 3, 4]], [[0, 1, 0], [4, 0, 3]], [[0, 0, 1], [3, 4, 0]], [[1, 2, 2], [2, -2, 1]], [[2, 1, 2], [1, 2, -2]], [[1, 1, 0], [2, -2, 1]], [[2, 2, 1], [1, -2, 2]], [[0, 1, 1], [1, 2, -2]]];
/** Abstand eines Punktes von einer Geraden. */
export function genAbstandPG(lv = 3) {
  for (;;) {
    const [u, n0] = pick(LOT.slice(...tier(lv, [0, 3], [0, 3], [3, 8], [3, 8], [3, 8]))), s = lv >= 4 ? pick([2, 3]) : 1, t0 = pick(lv <= 2 ? [1, 2, 3] : [1, 2, -1, -2, 3]);
    const R = tier(lv, 2, 3, 3, 4, 5), A = [ri(-R, R), ri(-R, R), ri(-R, R)], n = n0.map((c) => c * s);
    const F = A.map((c, i) => c + t0 * u[i]), Pp = F.map((c, i) => c + n[i]), d = Math.hypot(...n), ap = Math.hypot(...Pp.map((c, i) => c - A[i]));
    const N = (num, correct, why) => ({ tex: ft(num, 2), num, correct, why });
    const opts = [N(d, true), N(ap, false, 'Das ist der Abstand zum Stützpunkt der Geraden. Der kürzeste Abstand führt zum Lotfußpunkt.'), N(d * d, false, 'Hier fehlt die Wurzel.'), N(Math.abs(t0) * Math.hypot(...u), false, 'Das ist der Abstand vom Stützpunkt zum Lotfußpunkt – entlang der Geraden, nicht quer dazu.')];
    if (!uniqNum(opts) || !uniq(opts)) continue;
    return { prompt: `Welchen Abstand hat der Punkt ${tex(PT('P', Pp))} von der Geraden ${tex('g')}?`, formula: `g\\colon\\ \\vec x=${vecTex(A)}+t\\cdot${vecTex(u)}`, options: shuffle(opts),
      hints: [`Gesucht ist der Lotfußpunkt ${tex('F')}: ${tex('\\overrightarrow{FP}\\cdot\\vec u=0')}.`, `Der Parameter des Lotfußpunkts ist ${tex(`t=${ft(t0)}`)}.`],
      explain: `Lotfußpunkt ${tex(PT('F', F))}, ${tex(`\\overrightarrow{FP}=${vecTex(n)}`)}, also ${tex(`d=${ft(d)}`)}.`, A, u, P: Pp };
  }
}

/** Lage zweier Ebenen in Koordinatenform. */
export function genEbenenLage(lv = 3) {
  for (;;) {
    const R = tier(lv, 2, 3, 3, 4, 5), n1 = [ri(-R, R), ri(1, R), ri(-R, R)], d1 = ri(-6, 8), k = pick(tier(lv, [2], [2, 3], [2, -1, 3], [-2, 3, -1], [-3, -2, 0.5]));
    const wo = pick(['parallel', 'identisch', 'schnitt']);
    const n2 = wo === 'schnitt' ? n1.map((c, i) => (i === pick([0, 2]) ? c + pick([1, -1, 2]) : c * (lv >= 3 ? k : 1))) : n1.map((c) => c * k);
    const d2 = wo === 'identisch' ? d1 * k : wo === 'parallel' ? d1 * k + pick([1, -2, 3]) : ri(-6, 8);
    if (![...n2, d2].every(Number.isInteger) || n2.every((c) => c === 0) || n1.filter((c) => c !== 0).length < 2) continue;
    const kr = [n1[1] * n2[2] - n1[2] * n2[1], n1[2] * n2[0] - n1[0] * n2[2], n1[0] * n2[1] - n1[1] * n2[0]], par2 = kr.every((c) => c === 0);
    if ((wo === 'schnitt') === par2) continue;
    const E = (nm, nn, dd) => `${nm}\\colon\\ ${nn.map((c, i) => (c === 0 ? '' : `${c < 0 ? '-' : '+'}${Math.abs(c) === 1 ? '' : ft(Math.abs(c))}x_${i + 1}`)).join('').replace(/^\+/, '')}=${ft(dd)}`;
    const O = (key, html, why) => ({ tex: key, html, key, correct: key === wo, why });
    return { prompt: 'Wie liegen die beiden Ebenen zueinander?', formula: `${E('E_1', n1, d1)}\\qquad ${E('E_2', n2, d2)}`,
      options: shuffle([O('parallel', 'Echt parallel (kein gemeinsamer Punkt).', par2 ? `Die rechte Seite passt auch zum Faktor ${ft(k)}: Die Gleichungen beschreiben dieselbe Ebene.` : 'Die Normalenvektoren sind keine Vielfachen voneinander.'), O('identisch', 'Identisch (dieselbe Ebene).', par2 ? `Die Normalenvektoren sind Vielfache (Faktor ${ft(k)}), aber die rechte Seite passt nicht dazu.` : 'Die Normalenvektoren sind keine Vielfachen voneinander.'), O('schnitt', 'Sie schneiden sich in einer Geraden.', `Die Normalenvektoren sind Vielfache voneinander (Faktor ${ft(k)}) – die Ebenen haben dieselbe Richtung.`), O('windschief', 'Windschief.', 'Windschief können nur Geraden sein. Zwei Ebenen sind parallel, identisch oder schneiden sich.')]),
      hints: ['Vergleiche die Normalenvektoren: Sind sie Vielfache voneinander?', 'Wenn ja: Passt auch die rechte Seite zum selben Faktor?'], explain: par2 ? `${tex(`\\vec n_2=${ft(k)}\\cdot\\vec n_1`)}; die rechte Seite ${wo === 'identisch' ? 'passt dazu: identisch' : 'passt nicht dazu: echt parallel'}.` : 'Die Normalenvektoren sind keine Vielfachen voneinander: Die Ebenen schneiden sich in einer Geraden.', n1, d1, n2, d2 };
  }
}

for (const [fn, topic] of [[genPolstelle, 'Polstellen und Lücken'], [genAsymptote, 'Asymptoten'], [genQuotient, 'Quotientenregel'], [genTrigAbl, 'Sinus und Kosinus ableiten'], [genTrigInt, 'Integrale mit Sinus und Kosinus'],
  [genRotation, 'Rotationskörper'], [genUneigentlich, 'Uneigentliche Integrale'], [genUnabhaengig, 'Stochastische Unabhängigkeit'], [genVarianz, 'Erwartungswert und Varianz'], [genHyper, 'Ziehen ohne Zurücklegen'],
  [genKugel, 'Kugeln'], [genAbstandPG, 'Abstand Punkt–Gerade'], [genEbenenLage, 'Lage zweier Ebenen']]) fn.topic = topic;
