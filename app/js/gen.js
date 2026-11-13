// Aufgaben-Erzeuger: jede Aufgabe wird frisch gewürfelt. Falsche Antworten bilden typische Fehler ab
// und tragen eine Diagnose. `val` ist die Antwort als Rechenfunktion (für die Selbstprüfung in tests/).
import { ri, pick, shuffle, ft, polyTex, polyEval, polyDeriv, vertexTex } from './math.js';
import { tex } from './ui.js';

const uniq = (opts) => new Set(opts.map((o) => o.tex)).size === opts.length;

/** Brücke Einheit 1: Welche Gleichung gehört zur Parabel? */
export function genScheitel() {
  for (;;) {
    const a = pick([-2, -1, -0.5, 0.5, 1, 2]), d = pick([-3, -2, -1, 1, 2, 3]), e = pick([-2, -1, 1, 2, 3]);
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

/** Lücken-Aufgabe: Potenzregel für einen einzelnen Term. */
export function genPotenzLuecke() {
  const a = pick([2, 3, 4, 5, 6, -2, -3, -4]), n = ri(2, 5);
  const coefs = shuffle([...new Set([a * n, a, n, a * (n - 1)])]);
  const exps = shuffle([...new Set([n - 1, n, n + 1])]);
  return {
    type: 'gap',
    prompt: 'Leite ab. Wähle Vorfaktor und Exponent.',
    formula: `f(x)=${polyTex(Array(n).fill(0).concat(a))}`,
    slots: [
      { label: 'Vorfaktor', choices: coefs, correct: a * n },
      { label: 'Exponent', choices: exps, correct: n - 1 },
    ],
    show: (c, e) => `f'(x)=${c === null ? '\\square' : ft(c)}\\,x^{${e === null ? '\\square' : e}}`,
    hints: ['Potenzregel: Der Exponent kommt als Faktor nach vorn.', `Vorfaktor: ${tex(`${ft(a)}\\cdot${n}`)}. Danach wird der Exponent um 1 kleiner.`],
    explain: `Potenzregel: ${tex(`(x^n)'=n\\,x^{n-1}`)}, also ${tex(`f'(x)=${ft(a)}\\cdot${n}\\,x^{${n}-1}=${polyTex(polyDeriv(Array(n).fill(0).concat(a)))}`)}.`,
    f: (x) => a * x ** n, val: (x) => a * n * x ** (n - 1),
  };
}

/** Auswahl-Aufgabe: Polynom ableiten. */
export function genPolynom() {
  for (;;) {
    const deg = ri(3, 4);
    const c = Array(deg + 1).fill(0);
    c[deg] = pick([1, 2, 3, -1, -2]);
    c[ri(1, deg - 1)] = pick([2, 3, 4, 5, -2, -3, -4]);
    c[0] = pick([1, 2, 3, 5, 7, -1, -4]);
    const right = polyDeriv(c);
    const notReduced = c.map((a, i) => (i === 0 ? 0 : a * i));          // Exponent nicht verringert
    const notMultiplied = c.slice(1);                                    // Faktor vergessen
    const keptConst = [...right]; keptConst[0] += c[0];                  // Konstante stehen gelassen
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

/** Auswahl-Aufgabe: Kettenregel bei (ax+b)^n. */
export function genKette() {
  for (;;) {
    const a = pick([2, 3, 4, -2, -3]), n = ri(3, 5), b = pick([1, 2, 3, 5, -1, -2, -4]);
    if (a === n) continue;
    const inner = `(${polyTex([b, a])})`;
    const mk = (k, e, correct, why) => ({ tex: `f'(x)=${k === 1 ? '' : k === -1 ? '-' : ft(k)}${inner}^{${e}}`, correct, why, val: (x) => k * (a * x + b) ** e });
    const opts = [
      mk(n * a, n - 1, true),
      mk(n, n - 1, false, `Die innere Ableitung fehlt: ${tex(`(${polyTex([b, a])})'=${ft(a)}`)} muss als Faktor dazu (Kettenregel).`),
      mk(n * a, n, false, 'Der Exponent der äußeren Funktion muss um 1 kleiner werden.'),
      mk(a, n - 1, false, 'Der alte Exponent fehlt als Faktor: äußere Ableitung mal innere Ableitung.'),
    ];
    if (!uniq(opts)) continue;
    return {
      prompt: 'Welche Ableitung ist richtig?',
      formula: `f(x)=${inner}^{${n}}`,
      options: shuffle(opts),
      hints: ['Hier steckt eine Funktion in einer anderen: außen „hoch n", innen die Klammer.', `Kettenregel: äußere Ableitung mal innere Ableitung.`, `Innere Ableitung: ${tex(`${ft(a)}`)}.`],
      explain: `Kettenregel: ${tex(`f'(x)=${n}\\cdot${inner}^{${n - 1}}\\cdot${a < 0 ? `(${ft(a)})` : ft(a)}=${ft(n * a)}${inner}^{${n - 1}}`)}.`,
      f: (x) => (a * x + b) ** n,
    };
  }
}

/** Auswahl-Aufgabe: e-Funktion mit linearem Exponenten. */
export function genExp() {
  const k = pick([2, 3, 4, -2, -3]);
  const kx = `${k === -1 ? '-' : ft(k)}x`;
  const opts = [
    { tex: `f'(x)=${ft(k)}e^{${kx}}`, correct: true, val: (x) => k * Math.exp(k * x) },
    { tex: `f'(x)=e^{${kx}}`, correct: false, why: `Die innere Ableitung fehlt: ${tex(`(${kx})'=${ft(k)}`)} kommt als Faktor dazu.`, val: (x) => Math.exp(k * x) },
    { tex: `f'(x)=${kx}\\,e^{${kx}-1}`, correct: false, why: `Das wäre die Potenzregel. Bei ${tex('e^x')} steht ${tex('x')} im Exponenten – ${tex('e^x')} bleibt beim Ableiten ${tex('e^x')}.`, val: (x) => k * x * Math.exp(k * x - 1) },
    { tex: `f'(x)=${k < 0 ? '-' : ''}\\tfrac{1}{${Math.abs(k)}}e^{${kx}}`, correct: false, why: 'Durch den Faktor zu teilen gehört zum Integrieren, nicht zum Ableiten.', val: (x) => Math.exp(k * x) / k },
  ];
  return {
    prompt: 'Welche Ableitung ist richtig?',
    formula: `f(x)=e^{${kx}}`,
    options: shuffle(opts),
    hints: [`${tex('e^x')} abgeleitet ist wieder ${tex('e^x')}.`, 'Im Exponenten steht nicht nur x – denk an die Kettenregel.'],
    explain: `Kettenregel: ${tex(`f'(x)=e^{${kx}}\\cdot${k < 0 ? `(${ft(k)})` : ft(k)}`)}.`,
    f: (x) => Math.exp(k * x),
  };
}

/** Gemischte Runde zum Festigen. */
export function genMix() { return pick([genPolynom, genPolynom, genKette, genExp, genPotenzLuecke])(); }
