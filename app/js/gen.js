// Aufgaben-Erzeuger: jede Aufgabe wird frisch gewürfelt. Falsche Antworten bilden typische Fehler ab
// und tragen eine Diagnose. Jeder Erzeuger bekommt die Schwierigkeit lv (1 = sehr leicht … 5 = sehr schwer).
// Felder wie `val`, `num`, `xs`, `vec` sind die Antworten in Rechenform – für die Selbstprüfung in tests/.
import { ri, pick, shuffle, rand, ft, fmt, polyTex, polyEval, polyDeriv, vertexTex } from './math.js';
import { tex } from './ui.js';

const uniq = (opts) => new Set(opts.map((o) => o.tex)).size === opts.length;
const uniqNum = (opts) => opts.every((a, i) => opts.every((b, j) => i === j || Math.abs(a.num - b.num) > 1e-6));
const par = (n) => (n < 0 ? `(${ft(n)})` : ft(n));
const vecTex = (v) => `\\begin{pmatrix}${v.map((c) => ft(c)).join('\\\\')}\\end{pmatrix}`;
const frac = (a, b) => `\\dfrac{${a}}{${b}}`;
const tier = (lv, ...vals) => vals[Math.min(vals.length, Math.max(1, lv)) - 1];

/* ───────────── Analysis: Funktionen ───────────── */

/** Welche Gleichung gehört zur Parabel? */
export function genScheitel(lv = 3) {
  for (;;) {
    const a = pick(tier(lv, [1, -1], [1, -1, 2], [-2, -1, -0.5, 0.5, 1, 2], [-2, -1.5, -0.5, 0.25, 0.5, 1.5, 2], [-1.5, -0.5, -0.25, 0.25, 0.5, 1.5]));
    const d = pick([-3, -2, -1, 1, 2, 3]), e = pick([-2, -1, 1, 2, 3]);
    if (d === e) continue;
    const mk = (A, D, E, correct, why) => ({ tex: `f(x)=${vertexTex(A, D, E)}`, correct, why, val: (x) => A * (x - D) ** 2 + E });
    const opts = [
      mk(a, d, e, true),
      mk(a, -d, e, false, `Vorzeichen bei der Verschiebung: In ${tex('(x-d)^2')} verschiebt ein positives ${tex('d')} nach <b>rechts</b>. Der Scheitel liegt bei ${tex(`x=${ft(d)}`)}.`),
      mk(-a, d, e, false, `Öffnung: Bei ${tex('a>0')} ist die Parabel nach oben geöffnet, bei ${tex('a<0')} nach unten.`),
      mk(a, e, d, false, `Vertauscht: ${tex('d')} ist die Verschiebung nach rechts, ${tex('e')} die nach oben. Scheitel ${tex(`S(${ft(d)}\\mid${ft(e)})`)}.`),
    ];
    if (!uniq(opts)) continue;
    return {
      prompt: 'Welche Gleichung gehört zu diesem Graphen?',
      graph: { f: (x) => a * (x - d) ** 2 + e, view: { x0: -6, x1: 6, y0: -5, y1: 7 }, mark: [d, e] },
      options: shuffle(opts),
      hints: ['Lies zuerst den Scheitelpunkt ab.', `Der Scheitel liegt bei ${tex(`S(${ft(d)}\\mid${ft(e)})`)}.`, `In der Scheitelform ${tex('f(x)=a(x-d)^2+e')} steht ${tex('d')} mit Minus in der Klammer.`],
      explain: `Scheitelform ${tex('f(x)=a(x-d)^2+e')} mit Scheitel ${tex(`S(${ft(d)}\\mid${ft(e)})`)} und ${tex(`a=${ft(a)}`)}.`,
      f: (x) => a * (x - d) ** 2 + e,
    };
  }
}

/* ───────────── Analysis: Ableiten ───────────── */

/** Lücken-Aufgabe: Potenzregel für einen einzelnen Term (ab „schwer" auch negative Exponenten). */
export function genPotenzLuecke(lv = 3) {
  const a = pick(tier(lv, [1, 2, 3], [2, 3, 4, 5], [2, 3, 4, 5, 6, -2, -3, -4], [3, 5, 6, -2, -4, 0.5], [-3, -5, 6, 0.5, 1.5]));
  const n = lv >= 4 && rand() < 0.5 ? -ri(1, 3) : ri(2, tier(lv, 3, 4, 5, 6, 7));
  const coefs = shuffle([...new Set([a * n, a, n, a * (n - 1)])]);
  const exps = shuffle([...new Set([n - 1, n, n + 1])]);
  const A = a === 1 ? '' : a === -1 ? '-' : ft(a);
  return {
    type: 'gap',
    prompt: 'Leite ab. Wähle Vorfaktor und Exponent.',
    formula: `f(x)=${A}x^{${n}}`,
    slots: [
      { label: 'Vorfaktor', choices: coefs, correct: a * n },
      { label: 'Exponent', choices: exps, correct: n - 1 },
    ],
    show: (c, e) => `f'(x)=${c === null ? '\\square' : ft(c)}\\,x^{${e === null ? '\\square' : e}}`,
    hints: ['Potenzregel: Der Exponent kommt als Faktor nach vorn.', `Vorfaktor: ${tex(`${ft(a)}\\cdot${par(n)}`)}. Danach wird der Exponent um 1 kleiner.`],
    explain: `Potenzregel: ${tex("(x^n)'=n\\,x^{n-1}")}, also ${tex(`f'(x)=${ft(a)}\\cdot${par(n)}\\,x^{${n}-1}=${ft(a * n)}x^{${n - 1}}`)}.`,
    f: (x) => a * x ** n, val: (x) => a * n * x ** (n - 1),
  };
}

/** Auswahl-Aufgabe: Polynom ableiten. */
export function genPolynom(lv = 3) {
  for (;;) {
    const deg = tier(lv, 2, ri(2, 3), ri(3, 4), ri(4, 5), ri(4, 6));
    const big = tier(lv, [1, 2], [1, 2, 3], [1, 2, 3, -1, -2], [2, 3, -2, -3, 0.5], [0.5, 1.5, -2.5, 3, -4]);
    const c = Array(deg + 1).fill(0);
    c[deg] = pick(big);
    if (deg > 1) c[ri(1, deg - 1)] = pick(lv <= 2 ? [2, 3, 4] : [2, 3, 4, 5, -2, -3, -4]);
    if (lv >= 4 && deg > 2) c[ri(1, deg - 1)] ||= pick([-6, 7, -1]);
    c[0] = pick(lv <= 1 ? [1, 2, 3, 5] : [1, 2, 3, 5, 7, -1, -4]);
    const right = polyDeriv(c);
    const notReduced = c.map((a, i) => (i === 0 ? 0 : a * i));   // Exponent nicht verringert
    const notMultiplied = c.slice(1);                             // Faktor vergessen
    const keptConst = [...right]; keptConst[0] += c[0];           // Konstante stehen gelassen
    const mk = (coef, correct, why) => ({ tex: `f'(x)=${polyTex(coef)}`, correct, why, val: (x) => polyEval(coef, x) });
    const opts = [
      mk(right, true),
      mk(notReduced, false, `Der Exponent muss um 1 kleiner werden: ${tex("(x^n)'=n\\,x^{n-1}")}.`),
      mk(notMultiplied, false, 'Der alte Exponent fehlt als Faktor vor dem Term.'),
      mk(keptConst, false, `Eine Konstante fällt beim Ableiten weg: ${tex(`(${ft(c[0])})'=0`)}.`),
    ];
    if (!uniq(opts)) continue;
    return {
      prompt: 'Welche Ableitung ist richtig?',
      formula: `f(x)=${polyTex(c)}`,
      options: shuffle(opts),
      hints: ['Leite jeden Summanden einzeln ab (Summenregel).', `Potenzregel: ${tex("(x^n)'=n\\,x^{n-1}")}.`, 'Was passiert mit der Zahl ohne x?'],
      explain: `Summandenweise mit der Potenzregel: ${tex(`f'(x)=${polyTex(right)}`)}.`,
      f: (x) => polyEval(c, x),
    };
  }
}

/** Auswahl-Aufgabe: Kettenregel bei c·(ax+b)^n. */
export function genKette(lv = 3) {
  for (;;) {
    const a = pick(tier(lv, [2, 3], [2, 3, 4], [2, 3, 4, -2, -3], [3, 5, -2, -4], [-3, 5, -6, 7]));
    const n = ri(tier(lv, 2, 2, 3, 3, 4), tier(lv, 3, 4, 5, 6, 7));
    const b = pick([1, 2, 3, 5, -1, -2, -4]);
    const c = lv >= 4 ? pick([2, 3, -2, 5]) : 1;
    if (a === n) continue;
    const inner = `(${polyTex([b, a])})`;
    const K = (k) => (k === 1 ? '' : k === -1 ? '-' : ft(k));
    const mk = (k, e, correct, why) => ({ tex: `f'(x)=${K(k)}${inner}^{${e}}`, correct, why, val: (x) => k * (a * x + b) ** e });
    const opts = [
      mk(c * n * a, n - 1, true),
      mk(c * n, n - 1, false, `Die innere Ableitung fehlt: ${tex(`(${polyTex([b, a])})'=${ft(a)}`)} muss als Faktor dazu (Kettenregel).`),
      mk(c * n * a, n, false, 'Der Exponent der äußeren Funktion muss um 1 kleiner werden.'),
      mk(c * a, n - 1, false, 'Der alte Exponent fehlt als Faktor: äußere Ableitung mal innere Ableitung.'),
    ];
    if (!uniq(opts)) continue;
    return {
      prompt: 'Welche Ableitung ist richtig?',
      formula: `f(x)=${K(c)}${inner}^{${n}}`,
      options: shuffle(opts),
      hints: ['Hier steckt eine Funktion in einer anderen: außen „hoch n", innen die Klammer.', 'Kettenregel: äußere Ableitung mal innere Ableitung.', `Innere Ableitung: ${tex(ft(a))}.`],
      explain: `Kettenregel: ${tex(`f'(x)=${c === 1 ? '' : `${par(c)}\\cdot`}${n}\\cdot${inner}^{${n - 1}}\\cdot${par(a)}=${K(c * n * a)}${inner}^{${n - 1}}`)}.`,
      f: (x) => c * (a * x + b) ** n,
    };
  }
}

/** Auswahl-Aufgabe: e-Funktion mit linearem Exponenten. */
export function genExp(lv = 3) {
  const k = pick(tier(lv, [2, 3], [2, 3, 4], [2, 3, 4, -2, -3], [-2, -3, 5, -4], [-5, 6, -4, 7]));
  const c = lv >= 4 ? pick([2, 3, -2, 4]) : 1;
  const C = (v) => (v === 1 ? '' : v === -1 ? '-' : ft(v));
  const kx = `${C(k)}x`;
  const opts = [
    { tex: `f'(x)=${C(c * k)}e^{${kx}}`, correct: true, val: (x) => c * k * Math.exp(k * x) },
    { tex: `f'(x)=${C(c)}e^{${kx}}`, correct: false, why: `Die innere Ableitung fehlt: ${tex(`(${kx})'=${ft(k)}`)} kommt als Faktor dazu.`, val: (x) => c * Math.exp(k * x) },
    { tex: `f'(x)=${C(c * k)}x\\,e^{${kx}-1}`, correct: false, why: `Das wäre die Potenzregel. Bei ${tex('e^x')} steht ${tex('x')} im Exponenten – ${tex('e^x')} bleibt beim Ableiten ${tex('e^x')}.`, val: (x) => c * k * x * Math.exp(k * x - 1) },
    { tex: `f'(x)=${c * k < 0 ? '-' : ''}\\tfrac{${Math.abs(c)}}{${Math.abs(k)}}e^{${kx}}`, correct: false, why: 'Durch den Faktor zu teilen gehört zum Integrieren, nicht zum Ableiten.', val: (x) => (c / k) * Math.exp(k * x) },
  ];
  return {
    prompt: 'Welche Ableitung ist richtig?',
    formula: `f(x)=${C(c)}e^{${kx}}`,
    options: shuffle(opts),
    hints: [`${tex('e^x')} abgeleitet ist wieder ${tex('e^x')}.`, 'Im Exponenten steht nicht nur x – denk an die Kettenregel.'],
    explain: `Kettenregel: ${tex(`f'(x)=${C(c)}e^{${kx}}\\cdot${par(k)}=${C(c * k)}e^{${kx}}`)}.`,
    f: (x) => c * Math.exp(k * x),
  };
}

/** Auswahl-Aufgabe: Produktregel bei (ax+b)·e^{kx}. */
export function genProdukt(lv = 3) {
  for (;;) {
    const a = pick(lv <= 1 ? [1, 2] : [1, 2, 3, -2]), b = pick(lv <= 1 ? [1, 2, 4] : [1, 2, -1, -3, 4]), k = pick(tier(lv, [1], [1, 2], [2, -1], [-2, 3, -1], [-2, 3, -3]));
    const u = lv >= 5 ? [b, pick([0, a]), pick([1, 2, -1])] : [b, a], du = polyDeriv(u).concat(0).slice(0, u.length), U = polyTex(u);
    const E = `e^{${k === 1 ? '' : k === -1 ? '-' : ft(k)}x}`;
    // Ein einzelner Summand braucht keine Klammer: „2x·e^x“ statt „(2x)·e^x“, „e^x“ statt „(1)·e^x“.
    const mal = (coef) => { const n = coef.filter((c) => c !== 0).length, t = polyTex(coef); return n > 1 ? `(${t})\\,${E}` : t === '1' ? E : t === '-1' ? `-${E}` : `${t}\\,${E}`; };
    const kl = (coef) => { const t = polyTex(coef); return coef.filter((c) => c !== 0).length > 1 || t.startsWith('-') ? `(${t})` : t; };
    const dv = k === 1 ? E : k === -1 ? `-${E}` : `${ft(k)}${E}`;
    const mk = (coef, correct, why) => ({ tex: `f'(x)=${mal(coef)}`, correct, why, val: (x) => polyEval(coef, x) * Math.exp(k * x) });
    const opts = [
      mk(u.map((c, i) => du[i] + k * c), true),
      k === 1 ? mk(u.map((c, i) => c - du[i]), false, `Die beiden Teile werden addiert, nicht subtrahiert: ${tex("u'v+uv'")}.`) : mk(du.map((c) => c * k), false, `Das ist ${tex("u'\\cdot v'")}. Die Produktregel lautet ${tex("u'v+uv'")}.`),
      mk(du, false, `Hier fehlt der zweite Teil ${tex("u\\cdot v'")}.`),
      mk(u.map((c) => k * c), false, `Hier fehlt der erste Teil ${tex("u'\\cdot v")}.`),
    ];
    if (!uniq(opts)) continue;
    return {
      prompt: 'Welche Ableitung ist richtig?',
      formula: `f(x)=(${U})\\,${E}`,
      options: shuffle(opts),
      hints: ['Zwei Faktoren mit x: Das ist ein Fall für die Produktregel.', `${tex("(u\\cdot v)'=u'v+uv'")} mit ${tex(`u=${U}`)} und ${tex(`v=${E}`)}.`, `${tex(`u'=${polyTex(du)}`)} und ${tex(`v'=${dv}`)}.`],
      explain: `Produktregel: ${tex(`f'(x)=${kl(du)}\\cdot ${E}+(${U})\\cdot${k === 1 ? ' ' : par(k)}${E}=${mal(u.map((c, i) => du[i] + k * c))}`)}.`,
      f: (x) => polyEval(u, x) * Math.exp(k * x),
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

/** An welchen Stellen ist die Tangente waagerecht? */
export function genExtremstellen(lv = 3) {
  for (;;) {
    const k = kubik(lv);
    const { r1, r2 } = k;
    const mk = (xs, correct, why) => ({ tex: `x_1=${ft(xs[0])},\\quad x_2=${ft(xs[1])}`, correct, why, xs });
    const opts = [
      mk([r1, r2], true),
      mk([-r2, -r1], false, `Vorzeichen: Aus ${tex('(x-r)=0')} folgt ${tex('x=r')}, nicht ${tex('x=-r')}.`),
      mk([Math.min(r1 + r2, r1 * r2), Math.max(r1 + r2, r1 * r2)], false, 'Das sind Summe und Produkt der Lösungen, nicht die Lösungen selbst.'),
      mk([r1, (r1 + r2) / 2], false, `Die zweite Stelle ist die Wendestelle (${tex("f''(x)=0")}), keine Extremstelle.`),
    ];
    if (!uniq(opts)) continue;
    return {
      prompt: 'An welchen Stellen hat der Graph eine waagerechte Tangente?',
      formula: `f(x)=${polyTex(k.coef)}`,
      options: shuffle(opts),
      hints: [`Waagerechte Tangente heißt ${tex("f'(x)=0")}.`, `${tex(`f'(x)=${polyTex(polyDeriv(k.coef))}`)}. Klammere 6 aus.`, `${tex(`f'(x)=6(${polyTex([r1 * r2, -(r1 + r2), 1])})`)} – jetzt die quadratische Gleichung lösen.`],
      explain: `${tex(`f'(x)=6\\cdot${fac(r1)}\\cdot${fac(r2)}=0`)} liefert ${tex(`x_1=${r1}`)} und ${tex(`x_2=${r2}`)}.`,
      f: k.f,
    };
  }
}

/** Hochpunkt oder Tiefpunkt? */
export function genHochTief(lv = 3) {
  const k = kubik(lv);
  const at = pick([k.r1, k.r2]);
  const v = k.d2(at);
  const kind = v < 0 ? 'H' : 'T';
  const opt = (label, key, why) => ({ tex: `\\text{${label}}`, correct: key === kind, why, key });
  const sign = `${tex(`f''(${ft(at)})=${ft(v)}`)} ist ${v < 0 ? 'negativ' : 'positiv'}`;
  return {
    prompt: `Der Graph hat bei ${tex(`x=${ft(at)}`)} eine waagerechte Tangente. Was liegt dort vor?`,
    formula: `f(x)=${polyTex(k.coef)}`,
    options: shuffle([
      opt('Hochpunkt', 'H', `${sign} – der Graph ist dort linksgekrümmt, also ein Tiefpunkt.`),
      opt('Tiefpunkt', 'T', `${sign} – der Graph ist dort rechtsgekrümmt, also ein Hochpunkt.`),
      opt('Sattelpunkt', 'S', `Für einen Sattelpunkt müsste auch ${tex("f''")} dort 0 sein. Aber ${sign}.`),
      opt('Wendepunkt ohne Extremum', 'W', `Eine Wendestelle hätte ${tex("f''=0")}. Aber ${sign}.`),
    ]),
    hints: [`Setze die Stelle in die zweite Ableitung ein.`, `${tex(`f''(x)=${polyTex(polyDeriv(polyDeriv(k.coef)))}`)}.`, `${tex("f''<0")}: Hochpunkt. ${tex("f''>0")}: Tiefpunkt.`],
    explain: `${sign}, also liegt ein ${kind === 'H' ? 'Hochpunkt' : 'Tiefpunkt'} vor.`,
    f: k.f, at, kind,
  };
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

/** Welche Funktion ist eine Stammfunktion? */
export function genStammfunktion(lv = 3) {
  for (;;) {
    const { F, f } = stammPoly(lv);
    const mk = (coef, correct, why) => ({ tex: `F(x)=${polyTex(coef)}`, correct, why, val: (x) => polyEval(coef, x) });
    const raisedOnly = [0, ...f];                                // Exponent erhöht, aber nicht geteilt
    const dividedOnly = f.map((a, i) => a / (i + 1));            // geteilt, aber Exponent nicht erhöht
    const opts = [
      mk(F, true),
      mk(polyDeriv(f), false, 'Das ist die Ableitung. Gesucht ist die Umkehrung: Aufleiten.'),
      mk(raisedOnly, false, `Der Exponent ist erhöht, aber es fehlt das Teilen durch den neuen Exponenten: ${tex('\\int x^n\\,dx=\\tfrac{1}{n+1}x^{n+1}')}.`),
      mk(dividedOnly, false, 'Geteilt ist richtig – aber der Exponent muss auch um 1 größer werden.'),
    ];
    if (!uniq(opts)) continue;
    return {
      prompt: 'Welche Funktion ist eine Stammfunktion von f?',
      formula: `f(x)=${polyTex(f)}`,
      options: shuffle(opts),
      hints: ['Probe: Die Ableitung der Stammfunktion muss wieder f ergeben.', `${tex('\\int x^n\\,dx=\\tfrac{1}{n+1}x^{n+1}')}: Exponent um 1 erhöhen, durch den neuen Exponenten teilen.`],
      explain: `Summandenweise aufleiten: ${tex(`F(x)=${polyTex(F)}`)}. Probe: ${tex("F'(x)=f(x)")}.`,
      f: (x) => polyEval(f, x),
    };
  }
}

/** Bestimmtes Integral berechnen. */
export function genIntegral(lv = 3) {
  for (;;) {
    const { F, f } = stammPoly(lv);
    const a = lv <= 2 ? 1 : pick(tier(lv, [1], [1], [0, 1, -1], [-1, -2, 1], [-2, -3, -1])), b = a + ri(tier(lv, 1, 1, 1, 2, 3), tier(lv, 2, 2, 3, 3, 4));
    const Fa = polyEval(F, a), Fb = polyEval(F, b);
    const mk = (num, correct, why) => ({ tex: ft(num), correct, why, num });
    const opts = [
      mk(Fb - Fa, true),
      mk(Fa - Fb, false, `Reihenfolge: obere Grenze minus untere Grenze, also ${tex('F(b)-F(a)')}.`),
      mk(Fb + Fa, false, `Die Werte der Stammfunktion werden subtrahiert, nicht addiert: ${tex('F(b)-F(a)')}.`),
      mk(polyEval(f, b) - polyEval(f, a), false, `Du hast die Grenzen in ${tex('f')} eingesetzt. Erst die Stammfunktion ${tex('F')} bilden.`),
    ];
    if (!uniqNum(opts)) continue;
    return {
      prompt: 'Berechne das Integral.',
      formula: `\\int_{${a}}^{${b}}\\left(${polyTex(f)}\\right)dx`,
      options: shuffle(opts),
      hints: ['Hauptsatz: Stammfunktion bilden, dann obere minus untere Grenze.', `${tex(`F(x)=${polyTex(F)}`)}.`, `${tex(`F(${b})=${ft(Fb)}`)} und ${tex(`F(${a})=${ft(Fa)}`)}.`],
      explain: `${tex(`\\bigl[${polyTex(F)}\\bigr]_{${a}}^{${b}}=${ft(Fb)}-${par(Fa)}=${ft(Fb - Fa)}`)}.`,
      f: (x) => polyEval(f, x), a, b,
    };
  }
}

/* ───────────── Stochastik ───────────── */

const SIGMA_OK = [[16, 0.5], [36, 0.5], [64, 0.5], [100, 0.5], [25, 0.2], [100, 0.2], [100, 0.1], [48, 0.25], [400, 0.5], [64, 0.2]];

/** Erwartungswert oder Standardabweichung einer binomialverteilten Größe. */
export function genErwartung(lv = 3) {
  for (;;) {
    const askSigma = lv >= 3 && rand() < (lv >= 4 ? 0.6 : 0.35);
    const [n, p] = askSigma ? pick(SIGMA_OK) : [pick(tier(lv, [10, 20], [10, 20, 40], [20, 40, 50, 60], [30, 60, 80, 120], [45, 80, 150, 240])), pick(lv <= 2 ? [0.5, 0.2, 0.1] : [0.2, 0.25, 0.4, 0.6, 0.75, 0.3])];
    const q = 1 - p, mu = n * p, vr = n * p * q, sg = Math.sqrt(vr);
    const mk = (num, correct, why) => ({ tex: ft(num), correct, why, num: +num.toFixed(2) });
    const opts = askSigma
      ? [mk(sg, true), mk(vr, false, `Das ist die Varianz ${tex('n\\,p\\,(1-p)')}. Für die Standardabweichung fehlt die Wurzel.`),
        mk(mu, false, `Das ist der Erwartungswert ${tex('\\mu=n\\,p')}.`), mk(Math.sqrt(mu), false, `Unter der Wurzel fehlt der Faktor ${tex('(1-p)')}.`)]
      : [mk(mu, true), mk(n * q, false, 'Das ist die erwartete Anzahl der Misserfolge.'),
        mk(vr, false, `Das ist die Varianz ${tex('n\\,p\\,(1-p)')}, nicht der Erwartungswert.`), mk(sg, false, 'Das ist die Standardabweichung, nicht der Erwartungswert.')];
    if (!uniqNum(opts)) continue;
    return {
      prompt: `Ein Glücksrad zeigt mit Wahrscheinlichkeit ${tex('p')} „Gewinn". Es wird ${tex('n')}-mal gedreht, ${tex('X')} zählt die Gewinne. Wie groß ist ${askSigma ? 'die Standardabweichung' : 'der Erwartungswert'}?`,
      formula: `n=${n},\\quad p=${ft(p)}`,
      options: shuffle(opts),
      hints: askSigma ? [`${tex('\\sigma=\\sqrt{n\\,p\\,(1-p)}')}.`, `${tex(`n\\,p\\,(1-p)=${ft(vr)}`)} – jetzt die Wurzel ziehen.`] : [`Erwartungswert: ${tex('\\mu=n\\cdot p')}.`, `Rechne ${tex(`${n}\\cdot${ft(p)}`)}.`],
      explain: askSigma ? `${tex(`\\sigma=\\sqrt{${n}\\cdot${ft(p)}\\cdot${ft(q)}}=\\sqrt{${ft(vr)}}=${ft(sg)}`)}.` : `${tex(`\\mu=n\\cdot p=${n}\\cdot${ft(p)}=${ft(mu)}`)}.`,
      n, p, askSigma,
    };
  }
}

const binom = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return Math.round(r); };

/** Welche Rechnung liefert die gesuchte Wahrscheinlichkeit? */
export function genBinomial(lv = 3) {
  const p = pick([0.2, 0.3, 0.4, 0.6, 0.7]), q = +(1 - p).toFixed(1);
  const n = ri(tier(lv, 3, 4, 5, 6, 8), tier(lv, 4, 6, 8, 10, 12));
  const P = ft(p), Q = ft(q);
  if (lv >= 4 && rand() < 0.5) {
    const opts = [
      { tex: `1-${Q}^{${n}}`, correct: true, num: 1 - q ** n },
      { tex: `${P}^{${n}}`, correct: false, why: 'Das ist die Wahrscheinlichkeit für <b>nur</b> Treffer.', num: p ** n },
      { tex: `1-${P}^{${n}}`, correct: false, why: `Das Gegenereignis zu „mindestens ein Treffer" ist „kein Treffer", also ${tex(`${Q}^{${n}}`)}.`, num: 1 - p ** n },
      { tex: `${n}\\cdot${P}\\cdot${Q}^{${n - 1}}`, correct: false, why: 'Das ist die Wahrscheinlichkeit für <b>genau</b> einen Treffer.', num: n * p * q ** (n - 1) },
    ];
    return {
      prompt: `${tex('X')} ist binomialverteilt. Welche Rechnung liefert die Wahrscheinlichkeit für <b>mindestens einen</b> Treffer?`,
      formula: `n=${n},\\quad p=${P}`, options: shuffle(opts),
      hints: ['Denk an das Gegenereignis.', `„Mindestens ein Treffer" ist das Gegenteil von „kein Treffer".`],
      explain: `${tex(`P(X\\ge 1)=1-P(X=0)=1-${Q}^{${n}}`)}.`, n, p, kind: 'min1',
    };
  }
  let k; do { k = ri(1, n - 1); } while (k === n - k);
  const B = `\\binom{${n}}{${k}}`;
  const opts = [
    { tex: `${B}\\cdot${P}^{${k}}\\cdot${Q}^{${n - k}}`, correct: true, num: binom(n, k) * p ** k * q ** (n - k) },
    { tex: `${P}^{${k}}\\cdot${Q}^{${n - k}}`, correct: false, why: `Das ist nur <b>ein</b> Pfad. Es fehlt die Anzahl der Pfade ${tex(B)}.`, num: p ** k * q ** (n - k) },
    { tex: `${B}\\cdot${P}^{${n - k}}\\cdot${Q}^{${k}}`, correct: false, why: `Die Exponenten sind vertauscht: ${tex('p')} gehört zu den ${k} Treffern.`, num: binom(n, k) * p ** (n - k) * q ** k },
    { tex: `${B}\\cdot${P}^{${k}}`, correct: false, why: `${n - k === 1 ? 'Der eine Nicht-Treffer fehlt' : `Die ${n - k} Nicht-Treffer fehlen`}: Faktor ${tex(`${Q}^{${n - k}}`)}.`, num: binom(n, k) * p ** k },
  ];
  return {
    prompt: `${tex('X')} ist binomialverteilt. Welche Rechnung liefert ${tex(`P(X=${k})`)}?`,
    formula: `n=${n},\\quad p=${P}`, options: shuffle(opts),
    hints: [`Bernoulli-Formel: ${tex('P(X=k)=\\binom{n}{k}p^k(1-p)^{n-k}')}.`, `${k} Treffer und ${n - k} Nicht-Treffer – und alle Reihenfolgen zählen.`],
    explain: `${tex(`P(X=${k})=${B}\\cdot${P}^{${k}}\\cdot${Q}^{${n - k}}`)}.`, n, p, k, kind: 'eq',
  };
}

/** Zweistufiges Ziehen aus einer Urne (Baumdiagramm, Pfadregeln). */
export function genBaum(lv = 3) {
  for (;;) {
    const r = ri(2, tier(lv, 3, 4, 5, 6, 7)), b = ri(2, tier(lv, 3, 4, 5, 6, 8)), N = r + b;
    const ohne = lv >= 3 ? rand() < 0.75 : false;
    const versch = lv >= 4 && rand() < 0.5;
    const mk = (t, num, correct, why) => ({ tex: t, num, correct, why });
    let opts, ask, explain;
    if (versch && ohne) {
      ask = 'zwei <b>verschiedenfarbige</b> Kugeln';
      opts = [
        mk(`2\\cdot${frac(r, N)}\\cdot${frac(b, N - 1)}`, (2 * r * b) / (N * (N - 1)), true),
        mk(`${frac(r, N)}\\cdot${frac(b, N - 1)}`, (r * b) / (N * (N - 1)), false, 'Es gibt zwei passende Pfade: rot–blau und blau–rot.'),
        mk(`2\\cdot${frac(r, N)}\\cdot${frac(b, N)}`, (2 * r * b) / (N * N), false, 'Ohne Zurücklegen sind beim zweiten Zug nur noch ' + (N - 1) + ' Kugeln da.'),
        mk(`${frac(r, N)}+${frac(b, N - 1)}`, r / N + b / (N - 1), false, 'Entlang eines Pfades wird multipliziert, nicht addiert.'),
      ];
      explain = `Zwei Pfade: ${tex(`${frac(r, N)}\\cdot${frac(b, N - 1)}+${frac(b, N)}\\cdot${frac(r, N - 1)}=2\\cdot${frac(r, N)}\\cdot${frac(b, N - 1)}`)}.`;
    } else if (ohne) {
      ask = 'zwei <b>rote</b> Kugeln';
      opts = [
        mk(`${frac(r, N)}\\cdot${frac(r - 1, N - 1)}`, (r * (r - 1)) / (N * (N - 1)), true),
        mk(`${frac(r, N)}\\cdot${frac(r, N)}`, (r * r) / (N * N), false, 'Das gilt mit Zurücklegen. Ohne Zurücklegen ist beim zweiten Zug eine rote Kugel weniger da.'),
        mk(`${frac(r, N)}+${frac(r - 1, N - 1)}`, r / N + (r - 1) / (N - 1), false, 'Entlang eines Pfades wird multipliziert, nicht addiert.'),
        mk(`${frac(r, N)}\\cdot${frac(r - 1, N)}`, (r * (r - 1)) / (N * N), false, `Auch der Nenner wird kleiner: Es sind nur noch ${N - 1} Kugeln in der Urne.`),
      ];
      explain = `1. Pfadregel: ${tex(`${frac(r, N)}\\cdot${frac(r - 1, N - 1)}`)}.`;
    } else {
      ask = 'zwei <b>rote</b> Kugeln';
      opts = [
        mk(`${frac(r, N)}\\cdot${frac(r, N)}`, (r * r) / (N * N), true),
        mk(`${frac(r, N)}\\cdot${frac(r - 1, N - 1)}`, (r * (r - 1)) / (N * (N - 1)), false, 'Das gilt ohne Zurücklegen. Mit Zurücklegen bleibt die Urne gleich.'),
        mk(`${frac(r, N)}+${frac(r, N)}`, (2 * r) / N, false, 'Entlang eines Pfades wird multipliziert, nicht addiert.'),
        mk(`${frac(r, N)}\\cdot${frac(b, N)}`, (r * b) / (N * N), false, 'Das wäre erst rot, dann blau.'),
      ];
      explain = `1. Pfadregel: ${tex(`${frac(r, N)}\\cdot${frac(r, N)}`)}.`;
    }
    if (!uniqNum(opts)) continue;
    return {
      prompt: `In einer Urne liegen ${r} rote und ${b} blaue Kugeln. Es wird zweimal <b>${ohne ? 'ohne' : 'mit'} Zurücklegen</b> gezogen. Welche Rechnung liefert die Wahrscheinlichkeit für ${ask}?`,
      options: shuffle(opts),
      hints: ['Zeichne im Kopf das Baumdiagramm mit zwei Stufen.', 'Entlang eines Pfades multiplizieren, mehrere Pfade addieren.', ohne ? 'Nach dem ersten Zug fehlt eine Kugel.' : 'Mit Zurücklegen sind beide Züge gleich.'],
      explain, r, b, ohne, versch: versch && ohne,
    };
  }
}

/* ───────────── Geometrie ───────────── */

const rv = (R, dim = 3) => Array.from({ length: dim }, () => ri(-R, R));
const same = (a, b) => a.every((c, i) => c === b[i]);

/** Verbindungsvektor zweier Punkte. */
export function genVektorAB(lv = 3) {
  for (;;) {
    const R = tier(lv, 3, 4, 5, 7, 9);
    const A = lv <= 1 ? rv(R).map(Math.abs) : rv(R), B = lv <= 1 ? rv(R).map(Math.abs) : rv(R);
    const mk = (vec, correct, why) => ({ tex: vecTex(vec), vec, correct, why });
    const opts = [
      mk(B.map((c, i) => c - A[i]), true),
      mk(A.map((c, i) => c - B[i]), false, `Das ist ${tex('\\overrightarrow{BA}')}. Merke: Spitze minus Fuß, also ${tex('B-A')}.`),
      mk(A.map((c, i) => c + B[i]), false, 'Die Koordinaten werden subtrahiert, nicht addiert.'),
      mk(A.map((c, i) => (c + B[i]) / 2), false, `Das ist der Mittelpunkt der Strecke ${tex('AB')}, kein Verbindungsvektor.`),
    ];
    if (opts.some((a, i) => opts.some((b, j) => i < j && same(a.vec, b.vec)))) continue;
    const P = (n, v) => `${n}(${v.map((c) => ft(c)).join('\\mid')})`;
    return {
      prompt: `Bestimme den Vektor ${tex('\\overrightarrow{AB}')}.`,
      formula: `${P('A', A)},\\quad ${P('B', B)}`,
      options: shuffle(opts),
      hints: ['Spitze minus Fuß.', `Rechne für jede Koordinate ${tex('b_i-a_i')}.`],
      explain: `${tex(`\\overrightarrow{AB}=${vecTex(B)}-${vecTex(A)}=${vecTex(B.map((c, i) => c - A[i]))}`)}.`,
      A, B,
    };
  }
}

const TRIPLES = [[[0, 3, 4], 5], [[1, 2, 2], 3], [[2, 3, 6], 7], [[4, 4, 7], 9], [[1, 4, 8], 9], [[2, 6, 9], 11], [[6, 6, 7], 11], [[3, 4, 12], 13], [[2, 10, 11], 15]];

/** Betrag (Länge) eines Vektors. */
export function genBetrag(lv = 3) {
  for (;;) {
    // Je Stufe ein eigener Ausschnitt der Liste: oben nur noch die großen Tripel, nicht wieder die leichten.
    const [base, len] = pick(TRIPLES.slice(tier(lv, 0, 0, 2, 4, 5), tier(lv, 3, 4, 6, 8, 9)));
    const v = shuffle(base).map((c) => (lv >= 2 && rand() < 0.5 ? -c : c));
    const abs = v.map(Math.abs), sumAbs = abs[0] + abs[1] + abs[2], sq = len * len;
    const mk = (num, correct, why) => ({ tex: ft(num), num, correct, why });
    const opts = [
      mk(len, true),
      mk(sumAbs, false, 'Die Koordinaten werden erst quadriert, dann addiert – und am Ende die Wurzel gezogen.'),
      mk(sq, false, 'Hier fehlt die Wurzel am Ende.'),
      mk(Math.max(...abs), false, 'Der Vektor ist länger als jede einzelne Koordinate.'),
    ];
    if (!uniqNum(opts)) continue;
    return {
      prompt: `Wie lang ist der Vektor ${tex('\\vec v')}?`,
      formula: `\\vec v=${vecTex(v)}`,
      options: shuffle(opts),
      hints: [`${tex('|\\vec v|=\\sqrt{v_1^2+v_2^2+v_3^2}')} (Pythagoras im Raum).`, `Unter der Wurzel steht ${tex(`${abs.map((c) => `${c}^2`).join('+')}=${sq}`)}.`],
      explain: `${tex(`|\\vec v|=\\sqrt{${v.map((c) => `${par(c)}^2`).join('+')}}=\\sqrt{${sq}}=${len}`)}.`,
      v,
    };
  }
}

/** Skalarprodukt berechnen (und Orthogonalität erkennen). */
export function genSkalar(lv = 3) {
  for (;;) {
    const R = tier(lv, 3, 4, 5, 6, 8);
    const u = rv(R);
    let v = rv(R);
    if (lv >= 2 && rand() < 0.4 && u[2] !== 0) {
      // orthogonal bauen: letzte Koordinate so wählen, dass das Skalarprodukt 0 wird
      const t = -(u[0] * v[0] + u[1] * v[1]) / u[2];
      if (Number.isInteger(t) && Math.abs(t) <= 12) v = [v[0], v[1], t];
    }
    const dot = u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
    const sum = (a) => a[0] + a[1] + a[2];
    const mk = (num, correct, why) => ({ tex: ft(num), num, correct, why });
    const opts = [
      mk(dot, true),
      mk(sum(u) + sum(v), false, 'Die passenden Koordinaten werden multipliziert, nicht addiert.'),
      mk(Math.abs(u[0] * v[0]) + Math.abs(u[1] * v[1]) + Math.abs(u[2] * v[2]), false, 'Achte auf die Vorzeichen der einzelnen Produkte.'),
      mk(sum(u) * sum(v), false, 'Nicht alles mit allem: Nur gleiche Zeilen werden multipliziert, dann wird addiert.'),
    ];
    if (!uniqNum(opts)) continue;
    return {
      prompt: `Berechne das Skalarprodukt ${tex('\\vec u\\cdot\\vec v')}.`,
      formula: `\\vec u=${vecTex(u)},\\quad \\vec v=${vecTex(v)}`,
      options: shuffle(opts),
      hints: [`${tex('\\vec u\\cdot\\vec v=u_1v_1+u_2v_2+u_3v_3')}.`, `Die drei Produkte: ${tex(u.map((c, i) => ft(c * v[i])).join(',\\ '))}.`],
      explain: `${tex(`\\vec u\\cdot\\vec v=${u.map((c, i) => `${par(c)}\\cdot${par(v[i])}`).join('+')}=${ft(dot)}`)}.${dot === 0 ? ' Das Skalarprodukt ist 0 – die Vektoren stehen <b>senkrecht</b> aufeinander.' : ''}`,
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
export function mixOf(lists) {
  return (lv = 3) => { const fn = pick(lists[Math.min(lists.length, Math.max(1, lv)) - 1]); const q = fn(lv); q.gen = fn.name; q.topic = fn.topic; return q; };
}

/* ───────────── Gemischte Runden ───────────── */

export const genMix = mixOf([[genPotenzLuecke, genPolynom], [genPotenzLuecke, genPolynom, genPolynom], [genPolynom, genPolynom, genKette, genExp, genPotenzLuecke], [genPolynom, genKette, genExp, genProdukt, genPotenzLuecke], [genKette, genExp, genProdukt, genProdukt, genPolynom]]);
export const genExtremaMix = mixOf([[genExtremstellen, genHochTief]]);
export const genIntegralMix = mixOf([[genStammfunktion, genIntegral]]);
export const genStochastikMix = mixOf([[genErwartung, genBinomial, genBaum]]);
export const genGeometrieMix = mixOf([[genVektorAB, genBetrag, genSkalar]]);
export { fmt, tier, par, vecTex, frac, uniq, uniqNum, rv, same, binom, kubik, fac, SIGMA_OK };
