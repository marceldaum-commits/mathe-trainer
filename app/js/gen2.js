// Aufgaben-Erzeuger, Teil 2: Kurvendiskussion, Anwendungen, Stochastik-Vertiefung, Geraden und Ebenen, Operatoren.
// Gleiche Regeln wie in gen.js: Schwierigkeit lv (1–5), Ablenker = typische Fehler mit Diagnose,
// Rechen-Felder (val, num, vec, key …) für die Selbstprüfung in tests/.
import { ri, pick, shuffle, rand, ft, fmt, polyTex, polyEval, polyDeriv, lineTex } from './math.js';
import { tex } from './ui.js';
import { tier, par, vecTex, uniq, uniqNum, rv, same, binom, kubik, SIGMA_OK } from './gen.js';

const dfrac = (a, b) => `\\dfrac{${a}}{${b}}`;
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const add = (a, b, k = 1) => a.map((c, i) => c + k * b[i]);
const zero = (v) => v.every((c) => c === 0);
const pt = (name, v) => `${name}(${v.map((c) => ft(c)).join('\\mid')})`;
const simpson = (f, a, b, m = 200) => { const hh = (b - a) / m; let s = f(a) + f(b); for (let i = 1; i < m; i++) s += f(a + i * hh) * (i % 2 ? 4 : 2); return (s * hh) / 3; };
const TRIP = [[[1, 2, 2], 3], [[2, 3, 6], 7], [[4, 4, 7], 9], [[1, 4, 8], 9], [[2, 6, 9], 11], [[6, 6, 7], 11]];
const tripVec = (lv) => { const [b, len] = pick(TRIP.slice(0, tier(lv, 2, 3, 4, 5, 6))); return [shuffle(b).map((c) => (rand() < 0.5 ? -c : c)), len]; };
const nonzeroVec = (R, minNonzero = 2) => { for (;;) { const v = rv(R); if (v.filter((c) => c !== 0).length >= minNonzero) return v; } };
/** Ebenengleichung a·x1 + b·x2 + c·x3 = d als LaTeX. */
function planeTex(n, d) {
  let s = '';
  n.forEach((c, i) => {
    if (!c) return;
    const abs = Math.abs(c);
    s += `${c < 0 ? '-' : s ? '+' : ''}${abs === 1 ? '' : ft(abs)}x_${i + 1}`;
  });
  return `${s}=${ft(d)}`;
}
const lineVecTex = (P, u, name = 'g', par_ = 't') => `${name}:\\ \\vec x=${vecTex(P)}+${par_}\\cdot${vecTex(u)}`;

/* ───────────── Analysis: Kurvendiskussion ───────────── */

/** Wendestelle einer Funktion dritten Grades. */
export function genWendestelle(lv = 3) {
  for (;;) {
    const R = tier(lv, 2, 3, 3, 4, 5);
    const w = ri(-R, R); if (w === 0) continue;
    const a = lv <= 1 ? 1 : pick([1, 2, -1]), c = pick([0, -3, 2, 6, -12]), d = lv >= 3 ? pick([0, 1, -2]) : 0;
    const coef = [d, c, -3 * a * w, a];
    const mk = (x, correct, why) => ({ tex: `x=${ft(x)}`, x, correct, why });
    const opts = [
      mk(w, true),
      mk(-w, false, `Vorzeichen: Aus ${tex(`${ft(6 * a)}x${-6 * a * w < 0 ? '' : '+'}${ft(-6 * a * w)}=0`)} folgt ${tex(`x=${ft(w)}`)}.`),
      mk(2 * w, false, `Beim Auflösen muss durch ${tex(ft(6 * a))} geteilt werden, nicht durch ${tex(ft(3 * a))}.`),
      mk(0, false, `${tex('x=0')} wäre nur dann die Wendestelle, wenn es keinen ${tex('x^2')}-Term gäbe.`),
    ];
    return {
      prompt: 'An welcher Stelle hat der Graph seinen Wendepunkt?',
      formula: `f(x)=${polyTex(coef)}`,
      options: shuffle(opts),
      hints: [`Wendestelle: ${tex("f''(x)=0")}.`, `${tex(`f''(x)=${polyTex(polyDeriv(polyDeriv(coef)))}`)}.`],
      explain: `${tex(`f''(x)=${polyTex(polyDeriv(polyDeriv(coef)))}=0`)} liefert ${tex(`x=${ft(w)}`)}. Dort wechselt die Krümmung.`,
      f: (x) => polyEval(coef, x),
    };
  }
}

/** In welchem Bereich fällt bzw. steigt der Graph? */
export function genMonotonie(lv = 3) {
  const k = kubik(lv), { r1, r2 } = k;
  const steigt = lv >= 3 && rand() < 0.5;
  const mid = (r1 + r2) / 2;
  const O = (t, samples, correct, why) => ({ tex: t, samples, correct, why });
  const opts = steigt
    ? [O(`x<${r1}\\ \\text{ oder }\\ x>${r2}`, [r1 - 1, r2 + 1], true),
      O(`${r1}<x<${r2}`, [mid], false, `Zwischen den Extremstellen ist ${tex("f'(x)<0")} – dort fällt der Graph.`),
      O(`x>${r1}`, [mid, r2 + 1], false, `Zwischen ${tex(`x=${r1}`)} und ${tex(`x=${r2}`)} fällt der Graph.`),
      O(`x<${r2}`, [r1 - 1, mid], false, `Zwischen ${tex(`x=${r1}`)} und ${tex(`x=${r2}`)} fällt der Graph.`)]
    : [O(`${r1}<x<${r2}`, [mid], true),
      O(`x<${r1}`, [r1 - 1], false, `Dort ist ${tex("f'(x)>0")} – der Graph steigt.`),
      O(`x>${r2}`, [r2 + 1], false, `Dort ist ${tex("f'(x)>0")} – der Graph steigt.`),
      O(`x<${r1}\\ \\text{ oder }\\ x>${r2}`, [r1 - 1, r2 + 1], false, 'Das sind genau die Bereiche, in denen der Graph steigt.')];
  return {
    prompt: `In welchem Bereich <b>${steigt ? 'steigt' : 'fällt'}</b> der Graph?`,
    formula: `f(x)=${polyTex(k.coef)}`,
    options: shuffle(opts),
    hints: [`Der Graph ${steigt ? 'steigt' : 'fällt'}, wo ${tex(`f'(x)${steigt ? '>' : '<'}0`)}.`, `Die Nullstellen von ${tex("f'")} sind ${tex(`x=${r1}`)} und ${tex(`x=${r2}`)}. Prüfe das Vorzeichen dazwischen und außerhalb.`],
    explain: `${tex(`f'(x)=6(x${r1 < 0 ? '+' : '-'}${Math.abs(r1)})(x${r2 < 0 ? '+' : '-'}${Math.abs(r2)})`)} ist zwischen den Nullstellen negativ, außerhalb positiv.`,
    f: k.f, steigt,
  };
}

/** Symmetrie am Funktionsterm erkennen. */
export function genSymmetrie(lv = 3) {
  const kind = pick(['even', 'odd', 'none']);
  const top = tier(lv, 4, 4, 5, 6, 7);
  const coef = Array(top + 1).fill(0);
  const C = () => pick(lv <= 2 ? [1, 2, 3] : [1, 2, 3, -1, -2, -4, 5]);
  const evens = [0, 2, 4, 6].filter((e) => e <= top), odds = [1, 3, 5, 7].filter((e) => e <= top);
  if (kind === 'even') { shuffle(evens.filter((e) => e > 0)).slice(0, 2).forEach((e) => { coef[e] = C(); }); if (rand() < 0.7) coef[0] = C(); }
  else if (kind === 'odd') shuffle(odds).slice(0, lv <= 1 ? 2 : 3).forEach((e) => { coef[e] = C(); });
  else { coef[pick(evens.filter((e) => e > 0))] = C(); coef[pick(odds)] = C(); if (rand() < 0.5) coef[0] ||= C(); }
  const L = { even: 'achsensymmetrisch zur y-Achse', odd: 'punktsymmetrisch zum Ursprung', none: 'keine dieser beiden Symmetrien' };
  const why = {
    even: `Dafür dürften nur gerade Exponenten vorkommen, denn dann gilt ${tex('f(-x)=f(x)')}.`,
    odd: `Dafür dürften nur ungerade Exponenten vorkommen (und keine Zahl ohne x), denn dann gilt ${tex('f(-x)=-f(x)')}.`,
    none: kind === 'even' ? 'Schau auf die Exponenten: Sie sind alle gerade.' : 'Schau auf die Exponenten: Sie sind alle ungerade.',
  };
  return {
    prompt: 'Welche Symmetrie hat der Graph?',
    formula: `f(x)=${polyTex(coef)}`,
    options: shuffle(['even', 'odd', 'none'].map((k) => ({ tex: L[k], html: L[k], key: k, correct: k === kind, why: why[k] }))),
    hints: ['Schau nur auf die Exponenten von x.', `Nur gerade Exponenten: achsensymmetrisch. Nur ungerade: punktsymmetrisch. Eine Zahl ohne x zählt als ${tex('x^0')} (gerade).`],
    explain: kind === 'none' ? 'Es kommen gerade und ungerade Exponenten vor – keine der beiden Symmetrien.' : `Es kommen nur ${kind === 'even' ? 'gerade' : 'ungerade'} Exponenten vor: ${L[kind]}.`,
    f: (x) => polyEval(coef, x), kind,
  };
}

/** Verhalten einer gebrochenrationalen Funktion für x → ∞. */
export function genGrenzwert(lv = 3) {
  for (;;) {
    const kind = pick(lv <= 1 ? ['gleich', 'kleiner'] : ['gleich', 'kleiner', 'groesser']);
    const m = ri(1, tier(lv, 2, 2, 3, 3, 4));
    const n = kind === 'gleich' ? m : kind === 'kleiner' ? m - 1 : m + 1;
    const b = pick([1, 2, -2, 4]), q = pick(lv >= 4 ? [3, -3, 1.5, -0.5, 5] : [2, 3, -2, 4]), a = b * q;
    if (Math.abs(a) === Math.abs(b)) continue;
    const P = Array(n + 1).fill(0), Q = Array(m + 1).fill(0);
    P[n] = a; Q[m] = b; if (n > 0) P[ri(0, n - 1)] = pick([1, -3, 5, 7]); Q[ri(0, m - 1)] = pick([1, 2, -5, 9]);
    const inf = (s) => ({ tex: s > 0 ? '\\infty' : '-\\infty', num: s > 0 ? Infinity : -Infinity });
    const lead = { tex: ft(a / b), num: a / b }, zero_ = { tex: '0', num: 0 }, rec = { tex: ft(b / a, 3), num: b / a };
    let opts;
    if (kind === 'gleich') opts = [{ ...lead, correct: true }, { ...zero_, why: 'Zähler- und Nennergrad sind gleich – dann entscheidet das Verhältnis der Leitkoeffizienten.' }, { ...inf(1), why: 'Zähler und Nenner wachsen gleich schnell, der Bruch bleibt beschränkt.' }, { ...rec, why: 'Leitkoeffizient des Zählers durch den des Nenners – nicht umgekehrt.' }];
    else if (kind === 'kleiner') opts = [{ ...zero_, correct: true }, { ...lead, why: 'Das Verhältnis der Leitkoeffizienten gilt nur bei gleichem Grad.' }, { ...inf(1), why: 'Der Nenner hat den höheren Grad und wächst schneller.' }, { ...rec, why: 'Der Nenner wächst schneller als der Zähler – der Bruch geht gegen 0.' }];
    else opts = [{ ...inf(a / b), correct: true }, { ...inf(-a / b), why: 'Achte auf die Vorzeichen der beiden Leitkoeffizienten.' }, { ...zero_, why: 'Der Zähler hat den höheren Grad und wächst schneller.' }, { ...lead, why: 'Das Verhältnis der Leitkoeffizienten gilt nur bei gleichem Grad.' }];
    opts = opts.map((o) => ({ correct: false, ...o }));
    if (!uniq(opts)) continue;
    return {
      prompt: `Wie verhält sich die Funktion für ${tex('x\\to\\infty')}?`,
      formula: `f(x)=\\dfrac{${polyTex(P)}}{${polyTex(Q)}}`,
      options: shuffle(opts),
      hints: ['Vergleiche den höchsten Exponenten im Zähler mit dem im Nenner.', 'Gleicher Grad: Verhältnis der Leitkoeffizienten. Nenner höher: 0. Zähler höher: unendlich.'],
      explain: kind === 'gleich' ? `Gleicher Grad: ${tex(`\\lim f(x)=\\dfrac{${ft(a)}}{${ft(b)}}=${ft(a / b)}`)}.` : kind === 'kleiner' ? `Der Nennergrad ist größer: ${tex('\\lim f(x)=0')}.` : `Der Zählergrad ist größer: ${tex(`f(x)\\to${a / b > 0 ? '' : '-'}\\infty`)}.`,
      f: (x) => polyEval(P, x) / polyEval(Q, x),
    };
  }
}

/* ───────────── Analysis: Anwendungen ───────────── */

/** Gleichung der Tangente an einer Stelle. */
export function genTangente(lv = 3) {
  for (;;) {
    const coef = lv <= 2 ? [pick([0, 1, -2, 3]), 0, pick([1, 2, -1])] : [pick([0, 1, -3]), pick([0, -2, 3, -4]), pick(lv >= 4 ? [0, -3, 2] : [0, 1]), pick(lv >= 4 ? [1, 2, -1] : lv === 3 ? [1, 0] : [0])];
    if (lv >= 3 && coef[3] === 0 && coef[2] === 0) continue;
    const x0 = pick(tier(lv, [1, 2], [1, 2, -1], [1, 2, -1, -2], [2, -2, 3], [-2, 3, -3]));
    const y0 = polyEval(coef, x0), m = polyEval(polyDeriv(coef), x0), b = y0 - m * x0;
    if (m === 0 || m === y0) continue;
    const mk = (M, B, correct, why) => ({ tex: `t(x)=${lineTex(M, B)}`, correct, why, val: (x) => M * x + B });
    const opts = [
      mk(m, b, true),
      mk(m, y0, false, `Der y-Achsenabschnitt ist nicht ${tex('f(x_0)')}: Rechne ${tex('b=f(x_0)-m\\cdot x_0')}.`),
      mk(y0, y0 - y0 * x0, false, `Die Steigung ist ${tex("f'(x_0)")}, nicht ${tex('f(x_0)')}.`),
      mk(m, y0 + m * x0, false, `Vorzeichen: ${tex('b=f(x_0)-m\\cdot x_0')}.`),
    ];
    if (!uniq(opts)) continue;
    return {
      prompt: `Bestimme die Gleichung der Tangente an den Graphen an der Stelle ${tex(`x_0=${x0}`)}.`,
      formula: `f(x)=${polyTex(coef)}`,
      options: shuffle(opts),
      hints: [`Steigung: ${tex(`m=f'(${x0})`)}. Punkt: ${tex(`P(${x0}\\mid f(${x0}))`)}.`, `${tex(`m=${ft(m)}`)} und ${tex(`f(${x0})=${ft(y0)}`)}.`, `Setze in ${tex('y=m\\,x+b')} ein und löse nach ${tex('b')} auf.`],
      explain: `${tex(`m=f'(${x0})=${ft(m)}`)}, ${tex(`f(${x0})=${ft(y0)}`)}, also ${tex(`b=${ft(y0)}-${par(m)}\\cdot${par(x0)}=${ft(b)}`)} und ${tex(`t(x)=${lineTex(m, b)}`)}.`,
      f: (x) => polyEval(coef, x), x0,
    };
  }
}

const COND = (k, x, y) => ({ f: `f(${ft(x)})=${ft(y)}`, f1: `f'(${ft(x)})=${ft(y)}`, f2: `f''(${ft(x)})=${ft(y)}` }[k]);

/** Steckbrief: Text in Bedingungen übersetzen. */
export function genSteckbrief(lv = 3) {
  for (;;) {
    const kind = pick(lv <= 1 ? ['extrem', 'extrem', 'wende'] : ['extrem', 'wende', 'tangente']);
    const R = tier(lv, 3, 4, 5, 6, 8);
    const x0 = ri(-R, R), y0 = ri(-R, R), m = ri(-R, R);
    if (x0 === y0 || x0 === 0 || y0 === 0 || m === 0 || m === y0 || m === x0) continue;
    const hoch = rand() < 0.5;
    const O = (conds, correct, why) => ({ tex: conds.map((c) => COND(...c)).join(',\\quad '), conds: conds.map((c) => c.join(':')), correct, why });
    let text, opts;
    if (kind === 'extrem') {
      text = `Der Graph von ${tex('f')} hat den ${hoch ? 'Hochpunkt' : 'Tiefpunkt'} ${tex(pt(hoch ? 'H' : 'T', [x0, y0]))}.`;
      opts = [O([['f', x0, y0], ['f1', x0, 0]], true),
        O([['f', x0, y0], ['f2', x0, 0]], false, `${tex("f''(x_0)=0")} gehört zu einer Wendestelle. Am Extrempunkt ist die <b>erste</b> Ableitung 0.`),
        O([['f', y0, x0], ['f1', x0, 0]], false, 'x- und y-Wert sind vertauscht: Der Punkt liegt bei x = ' + x0 + '.'),
        O([['f1', x0, y0], ['f', x0, 0]], false, `Der Punkt liegt auf dem Graphen, also ${tex(`f(${x0})=${y0}`)}. Die Steigung dort ist 0.`)];
    } else if (kind === 'wende') {
      text = `Der Graph von ${tex('f')} hat den Wendepunkt ${tex(pt('W', [x0, y0]))}.`;
      opts = [O([['f', x0, y0], ['f2', x0, 0]], true),
        O([['f', x0, y0], ['f1', x0, 0]], false, `${tex("f'(x_0)=0")} gehört zu einem Extrempunkt. Am Wendepunkt ist die <b>zweite</b> Ableitung 0.`),
        O([['f', y0, x0], ['f2', x0, 0]], false, 'x- und y-Wert sind vertauscht: Der Punkt liegt bei x = ' + x0 + '.'),
        O([['f2', x0, y0], ['f', x0, 0]], false, `Der Punkt liegt auf dem Graphen, also ${tex(`f(${x0})=${y0}`)}. Die zweite Ableitung ist dort 0.`)];
    } else {
      text = `Der Graph von ${tex('f')} verläuft durch ${tex(pt('P', [x0, y0]))} und hat dort die Steigung ${tex(ft(m))}.`;
      opts = [O([['f', x0, y0], ['f1', x0, m]], true),
        O([['f', x0, m], ['f1', x0, y0]], false, 'Funktionswert und Steigung sind vertauscht.'),
        O([['f', x0, y0], ['f1', m, x0]], false, `Die Stelle ist ${tex(`x=${x0}`)}: Dort wird die Ableitung ausgewertet.`),
        O([['f', x0, y0], ['f2', x0, m]], false, 'Die Steigung ist die <b>erste</b> Ableitung.')];
    }
    if (!uniq(opts)) continue;
    return {
      prompt: `${text} Welche Bedingungen ergeben sich?`,
      options: shuffle(opts),
      hints: ['Jeder Punkt auf dem Graphen liefert eine Gleichung für f.', 'Extrempunkt: f′ = 0. Wendepunkt: f″ = 0. Steigung: Wert von f′.'],
      explain: `Die Bedingungen lauten ${tex(opts[0].tex)}.`,
      kind, expect: opts[0].conds,
    };
  }
}

/** Funktionenschar: Tiefpunkt in Abhängigkeit vom Parameter. */
export function genSchar(lv = 3) {
  const kub = lv >= 5 || (lv === 4 && rand() < 0.5);
  const O = (xt, yt, fn, correct, why) => ({ tex: `T(${xt}\\mid ${yt})`, fn, correct, why });
  if (kub) {
    const c = pick(lv >= 5 ? [1, 2, -1, -3, 4] : [0, 1, -2]), C = c === 0 ? '' : `${c > 0 ? '+' : '-'}${Math.abs(c)}`;
    const f = (k) => (x) => x ** 3 - 3 * k * k * x + c;
    return {
      prompt: `Wo liegt der Tiefpunkt des Graphen für ${tex('k>0')}?`,
      formula: `f_k(x)=x^3-3k^2x${C}`,
      options: shuffle([
        O('k', `-2k^3${C}`, (k) => [k, -2 * (k ** 3) + c], true),
        O('-k', `2k^3${C}`, (k) => [-k, 2 * k ** 3 + c], false, `Das ist der Hochpunkt: ${tex("f_k''(-k)=-6k<0")}.`),
        O('k', `2k^3${C}`, (k) => [k, 2 * k ** 3 + c], false, `Einsetzen: ${tex('k^3-3k^2\\cdot k=-2k^3')}.`),
        O('k', `-k^3${C}`, (k) => [k, -(k ** 3) + c], false, `Einsetzen: ${tex('k^3-3k^3=-2k^3')}.`),
      ]),
      hints: [`${tex("f_k'(x)=3x^2-3k^2=0")} liefert ${tex('x=\\pm k')}.`, `${tex("f_k''(x)=6x")}: bei ${tex('x=k')} positiv, also Tiefpunkt.`],
      explain: `${tex("f_k'(x)=0")} bei ${tex('x=\\pm k')}; ${tex("f_k''(k)=6k>0")}, also Tiefpunkt ${tex(`T(k\\mid -2k^3${C})`)}.`,
      f, min: true,
    };
  }
  const a = lv <= 1 ? 1 : pick(lv >= 4 ? [2, 3, 4, 5] : [1, 2, 3]), c = pick(tier(lv, [0, 1, 2], [0, 1, 4], [1, -2, 4], [-3, 5, -6, 7], [0]));
  const ak = `${a === 1 ? '' : a}k`, a2 = a * a === 1 ? '' : a * a;
  const yT = (sign) => `${c === 0 ? '' : c}${sign}${a2}k^2`.replace(/^\+/, '');
  const f = (k) => (x) => x * x - 2 * a * k * x + c;
  return {
    prompt: 'Wo liegt der Tiefpunkt des Graphen?',
    formula: `f_k(x)=x^2-${2 * a}kx${c === 0 ? '' : `${c > 0 ? '+' : '-'}${Math.abs(c)}`}`,
    options: shuffle([
      O(ak, yT('-'), (k) => [a * k, c - a * a * k * k], true),
      O(`-${ak}`, yT('-'), (k) => [-a * k, c - a * a * k * k], false, `Vorzeichen: ${tex(`f_k'(x)=2x-${2 * a}k=0`)} liefert ${tex(`x=${ak}`)}.`),
      O(`${2 * a}k`, c === 0 ? '0' : String(c), (k) => [2 * a * k, c], false, `Beim Auflösen von ${tex(`2x=${2 * a}k`)} muss noch durch 2 geteilt werden.`),
      O(ak, yT('+'), (k) => [a * k, c + a * a * k * k], false, `y-Wert: Einsetzen ergibt ${tex(`${a2}k^2-${2 * a * a}k^2=-${a2}k^2`)}.`),
    ]),
    hints: [`Leite nach ${tex('x')} ab – ${tex('k')} ist dabei eine feste Zahl.`, `${tex(`f_k'(x)=2x-${2 * a}k`)}. Null setzen und den x-Wert in ${tex('f_k')} einsetzen.`],
    explain: `${tex(`f_k'(x)=2x-${2 * a}k=0`)} bei ${tex(`x=${ak}`)}; einsetzen ergibt ${tex(`T(${ak}\\mid ${yT('-')})`)}.`,
    f, min: true,
  };
}

/** Extremwertaufgabe: optimale Abmessung. */
export function genExtremwert(lv = 3) {
  for (;;) {
    const kind = pick(lv <= 2 ? ['zaun', 'rechteck'] : ['zaun', 'rechteck', 'schachtel']);
    const mk = (num, correct, why) => ({ tex: `x=${ft(num)}`, num, correct, why });
    let q;
    if (kind === 'zaun') {
      const L = pick(tier(lv, [20, 40], [20, 40, 60], [24, 40, 60, 100], [36, 52, 84, 120], [50, 90, 130, 250]));
      q = { prompt: `Mit ${L} m Zaun soll an einer Mauer ein rechteckiges Beet abgegrenzt werden (die Mauerseite braucht keinen Zaun). ${tex('x')} ist die Breite senkrecht zur Mauer. Für welches ${tex('x')} wird die Fläche am größten?`,
        formula: `A(x)=x\\cdot(${L}-2x)`, obj: (x) => x * (L - 2 * x), lo: 0, hi: L / 2,
        options: [mk(L / 4, true), mk(L / 2, false, `Dann bleibt für die Länge ${tex(`${L}-2x=0`)} – die Fläche wäre 0.`), mk(L / 3, false, 'Drei gleich lange Seiten sind nicht optimal: Die Seite an der Mauer kostet keinen Zaun.'), mk(L / 8, false, `Leite ${tex(`A(x)=${L}x-2x^2`)} ab: ${tex(`A'(x)=${L}-4x`)}.`)],
        explain: `${tex(`A'(x)=${L}-4x=0`)} liefert ${tex(`x=${ft(L / 4)}`)} (Länge ${tex(ft(L / 2))} m, Fläche ${tex(ft((L * L) / 8))} m²).` };
    } else if (kind === 'rechteck') {
      const U = pick(tier(lv, [20, 40], [20, 40, 60], [24, 36, 60, 100], [28, 44, 76, 140], [30, 54, 90, 210]));
      q = { prompt: `Ein Rechteck hat den Umfang ${U} cm. ${tex('x')} ist eine Seitenlänge. Für welches ${tex('x')} wird der Flächeninhalt am größten?`,
        formula: `A(x)=x\\cdot(${ft(U / 2)}-x)`, obj: (x) => x * (U / 2 - x), lo: 0, hi: U / 2,
        options: [mk(U / 4, true), mk(U / 2, false, 'Der halbe Umfang ist Länge plus Breite – dann bliebe für die andere Seite nichts übrig.'), mk(U / 3, false, `Leite ${tex(`A(x)=${ft(U / 2)}x-x^2`)} ab und setze null.`), mk(U / 8, false, `${tex(`A'(x)=${ft(U / 2)}-2x=0`)} – teile nur durch 2.`)],
        explain: `${tex(`A'(x)=${ft(U / 2)}-2x=0`)} liefert ${tex(`x=${ft(U / 4)}`)}: Das Rechteck mit der größten Fläche ist ein Quadrat.` };
    } else {
      const s = pick(tier(lv, [12], [12], [12, 18, 24], [18, 30, 42], [30, 48, 66]));
      q = { prompt: `Aus einem quadratischen Karton mit der Seitenlänge ${s} cm werden an den Ecken Quadrate der Seitenlänge ${tex('x')} ausgeschnitten und die Ränder zu einer offenen Schachtel hochgeklappt. Für welches ${tex('x')} wird das Volumen am größten?`,
        formula: `V(x)=x\\cdot(${s}-2x)^2`, obj: (x) => x * (s - 2 * x) ** 2, lo: 0, hi: s / 2,
        options: [mk(s / 6, true), mk(s / 2, false, 'Dann bleibt kein Boden übrig: Das Volumen wäre 0.'), mk(s / 4, false, `Die Ableitung hat die Nullstellen ${tex(`x=${ft(s / 6)}`)} und ${tex(`x=${ft(s / 2)}`)} – ${tex(`x=${ft(s / 4)}`)} ist keine davon.`), mk(s / 3, false, `Prüfe mit ${tex("V'(x)=0")}: Die Lösung liegt näher am Rand.`)],
        explain: `${tex(`V'(x)=(${s}-2x)(${s}-6x)=0`)} liefert ${tex(`x=${ft(s / 6)}`)} (bei ${tex(`x=${ft(s / 2)}`)} ist das Volumen 0).` };
    }
    if (!uniqNum(q.options)) continue;
    return { ...q, options: shuffle(q.options), hints: ['Stelle die Zielfunktion auf und leite sie ab.', 'Setze die Ableitung null. Prüfe, ob die Lösung im sinnvollen Bereich liegt.'], kind };
  }
}

/** Ableitung mit ln. */
export function genLn(lv = 3) {
  const F = (t, val, correct, why) => ({ tex: `f'(x)=${t}`, val, correct, why });
  if (lv >= 4 && rand() < 0.5) {
    const n = lv >= 5 ? pick([2, 3, 4]) : pick([1, 2]);
    if (n === 1) return { prompt: 'Welche Ableitung ist richtig?', formula: 'f(x)=x\\cdot\\ln(x)', domain: 'pos', f: (x) => x * Math.log(x),
      options: shuffle([F('\\ln(x)+1', (x) => Math.log(x) + 1, true), F('\\dfrac{1}{x}', (x) => 1 / x, false, `Das ist ${tex("u'\\cdot v'")}. Produktregel: ${tex("u'v+uv'")}.`), F('\\ln(x)', (x) => Math.log(x), false, `Der zweite Teil fehlt: ${tex('x\\cdot\\tfrac1x=1')}.`), F('1+\\dfrac{1}{x}', (x) => 1 + 1 / x, false, `${tex("u'v=1\\cdot\\ln(x)")} und ${tex("uv'=x\\cdot\\tfrac1x=1")}.`)]),
      hints: ['Zwei Faktoren mit x: Produktregel.', `${tex("(\\ln x)'=\\tfrac1x")}.`], explain: `Produktregel: ${tex("f'(x)=1\\cdot\\ln(x)+x\\cdot\\tfrac1x=\\ln(x)+1")}.` };
    const P = (e) => (e === 1 ? 'x' : `x^{${e}}`), m = n - 1;
    return { prompt: 'Welche Ableitung ist richtig?', formula: `f(x)=${P(n)}\\cdot\\ln(x)`, domain: 'pos', f: (x) => x ** n * Math.log(x),
      options: shuffle([F(`${n}${P(m)}\\ln(x)+${P(m)}`, (x) => n * x ** m * Math.log(x) + x ** m, true),
        F(`${n}${m === 1 ? '' : P(m - 1)}`, (x) => n * x ** (m - 1), false, `Das ist ${tex("u'\\cdot v'")}. Produktregel: ${tex("u'v+uv'")}.`),
        F(`${n}${P(m)}\\ln(x)`, (x) => n * x ** m * Math.log(x), false, `Der zweite Teil fehlt: ${tex(`${P(n)}\\cdot\\tfrac1x=${P(m)}`)}.`),
        F(`${n}${P(m)}\\ln(x)+${P(n)}`, (x) => n * x ** m * Math.log(x) + x ** n, false, `Im zweiten Teil steht ${tex(`${P(n)}\\cdot\\tfrac1x`)} – das lässt sich kürzen.`)]),
      hints: ['Zwei Faktoren mit x: Produktregel.', `${tex(`u'=${n}${P(m)}`)} und ${tex("v'=\\tfrac1x")}.`], explain: `Produktregel: ${tex(`f'(x)=${n}${P(m)}\\ln(x)+${P(n)}\\cdot\\tfrac1x=${n}${P(m)}\\ln(x)+${P(m)}`)}.` };
  }
  if (lv >= 4) {
    const a = pick([1, 2, 3]), b = pick(lv >= 5 ? [1, 3, 5, 7] : [1, 2, 4]), inner = polyTex([b, 0, a]), q = (x) => a * x * x + b;
    return { prompt: 'Welche Ableitung ist richtig?', formula: `f(x)=\\ln(${inner})`, domain: 'pos', f: (x) => Math.log(q(x)),
      options: shuffle([F(dfrac(`${2 * a}x`, inner), (x) => (2 * a * x) / q(x), true), F(dfrac(1, inner), (x) => 1 / q(x), false, `Die innere Ableitung ${tex(`${2 * a}x`)} fehlt (Kettenregel).`), F(dfrac(1, `${2 * a}x`), (x) => 1 / (2 * a * x), false, 'Im Nenner bleibt die innere Funktion selbst stehen, nicht ihre Ableitung.'), F(dfrac(`${a === 1 ? '' : a}x`, inner), (x) => (a * x) / q(x), false, `Die innere Ableitung ist ${tex(`${2 * a}x`)} – der Exponent 2 kommt als Faktor nach vorn.`)]),
      hints: [`${tex("(\\ln x)'=\\tfrac1x")} – und innen steht nicht nur x.`, `Kettenregel: innere Ableitung ${tex(`${2 * a}x`)} in den Zähler.`], explain: `Kettenregel: ${tex(`f'(x)=\\dfrac{1}{${inner}}\\cdot${2 * a}x=${dfrac(`${2 * a}x`, inner)}`)}.` };
  }
  if (lv <= 2) {
    const c = pick([2, 3, 4, 5]);
    return { prompt: 'Welche Ableitung ist richtig?', formula: `f(x)=${c}\\ln(x)`, domain: 'pos', f: (x) => c * Math.log(x),
      options: shuffle([F(dfrac(c, 'x'), (x) => c / x, true), F(dfrac(1, `${c}x`), (x) => 1 / (c * x), false, 'Der Faktor bleibt als Faktor im Zähler erhalten.'), F(dfrac(c, 'x^2'), (x) => c / (x * x), false, `${tex("(\\ln x)'=\\tfrac1x")} – ohne Quadrat.`), F(`${c}x`, (x) => c * x, false, `${tex('\\ln(x)')} wird beim Ableiten zu ${tex('\\tfrac1x')}, nicht zu ${tex('x')}.`)]),
      hints: [`${tex("(\\ln x)'=\\tfrac1x")}.`, 'Ein konstanter Faktor bleibt beim Ableiten stehen.'], explain: `${tex(`f'(x)=${c}\\cdot\\tfrac1x=${dfrac(c, 'x')}`)}.` };
  }
  const a = pick([2, 3, 4, 5]), b = pick([1, 2, 3, 7]);
  const inner = polyTex([b, a]);
  return { prompt: 'Welche Ableitung ist richtig?', formula: `f(x)=\\ln(${inner})`, domain: 'pos', f: (x) => Math.log(a * x + b),
    options: shuffle([F(dfrac(a, inner), (x) => a / (a * x + b), true), F(dfrac(1, inner), (x) => 1 / (a * x + b), false, `Die innere Ableitung ${tex(ft(a))} fehlt (Kettenregel).`), F(dfrac(inner, a), (x) => (a * x + b) / a, false, 'Zähler und Nenner sind vertauscht.'), F(dfrac(a, 'x'), (x) => a / x, false, 'Im Nenner bleibt die ganze innere Funktion stehen.')]),
    hints: [`${tex("(\\ln x)'=\\tfrac1x")} – und innen steht nicht nur x.`, 'Kettenregel: äußere Ableitung mal innere Ableitung.'], explain: `Kettenregel: ${tex(`f'(x)=\\dfrac{1}{${inner}}\\cdot${a}=${dfrac(a, inner)}`)}.` };
}

/** Exponentielles Wachstum: Funktion aufstellen oder Verdopplungszeit. */
export function genWachstum(lv = 3) {
  for (;;) {
    if (lv >= 4 && rand() < 0.5) {
      const k = pick([0.02, 0.05, 0.1, 0.25]), halb = rand() < 0.5, K = halb ? -k : k;
      const O = (t, num, correct, why) => ({ tex: `t=${t}`, num, correct, why });
      const opts = [O(dfrac('\\ln(2)', ft(k)), Math.log(2) / k, true), O(dfrac(2, ft(k)), 2 / k, false, `Aus ${tex(`e^{${ft(k)}t}=2`)} wird durch Logarithmieren ${tex(`${ft(k)}t=\\ln(2)`)}.`), O(`\\ln(2)\\cdot ${ft(k)}`, Math.log(2) * k, false, `Es wird durch ${tex(ft(k))} geteilt, nicht multipliziert.`), O(dfrac(ft(k), '\\ln(2)'), k / Math.log(2), false, 'Zähler und Nenner sind vertauscht.')];
      return { prompt: `Nach welcher Zeit hat sich der Bestand ${halb ? 'halbiert' : 'verdoppelt'}?`, formula: `N(t)=N_0\\cdot e^{${ft(K)}t}`, options: shuffle(opts),
        hints: [`Setze ${tex(`N(t)=${halb ? '\\tfrac12' : '2'}N_0`)} und kürze ${tex('N_0')}.`, 'Logarithmiere beide Seiten.'],
        explain: `${tex(`e^{${ft(K)}t}=${halb ? '\\tfrac12' : '2'}`)} liefert ${tex(`t=${dfrac(halb ? '\\ln(\\tfrac12)' : '\\ln(2)', ft(K))}=${dfrac('\\ln(2)', ft(k))}\\approx${ft(Math.log(2) / k, 1)}`)}.`,
        kind: 'zeit', k: K, factor: halb ? 0.5 : 2 };
    }
    const N0 = pick([80, 200, 500, 1200]), p = pick(tier(lv, [10, 20], [5, 10, 20], [3, 5, 10, 25], [2.5, 4, 12], [1.5, 7.5, 12.5]));
    const ab = lv >= 3 && rand() < 0.5, a = +(1 + (ab ? -p : p) / 100).toFixed(4), wrongDir = +(1 + (ab ? p : -p) / 100).toFixed(4);
    const O = (t, val, correct, why) => ({ tex: `N(t)=${t}`, val, correct, why });
    const lin = (N0 * p) / 100;
    const opts = [O(`${N0}\\cdot ${ft(a, 4)}^{t}`, (t) => N0 * a ** t, true),
      O(`${N0}\\cdot ${ft(p / 100, 4)}^{t}`, (t) => N0 * (p / 100) ** t, false, `Der Wachstumsfaktor ist ${tex(`1${ab ? '-' : '+'}\\tfrac{p}{100}`)}, nicht ${tex('\\tfrac{p}{100}')}.`),
      O(`${N0}${ab ? '-' : '+'}${ft(lin)}\\,t`, (t) => N0 + (ab ? -lin : lin) * t, false, 'Das wäre lineares Wachstum: jedes Jahr derselbe Betrag. Bei Prozenten wächst der Betrag mit.'),
      O(`${N0}\\cdot ${ft(wrongDir, 4)}^{t}`, (t) => N0 * wrongDir ** t, false, `Zunahme und Abnahme verwechselt: Der Bestand ${ab ? 'nimmt ab' : 'wächst'}.`)];
    if (!uniq(opts)) continue;
    return { prompt: `Ein Bestand von ${N0} ${ab ? 'nimmt pro Jahr um' : 'wächst pro Jahr um'} ${fmt(p)} % ${ab ? 'ab' : ''}. Welche Funktion beschreibt den Bestand nach ${tex('t')} Jahren?`.replace(' .', '.'), options: shuffle(opts),
      hints: [`Jedes Jahr wird mit demselben Faktor multipliziert.`, `Faktor: ${tex(`1${ab ? '-' : '+'}${ft(p / 100, 4)}=${ft(a, 4)}`)}.`],
      explain: `Wachstumsfaktor ${tex(`a=${ft(a, 4)}`)}, also ${tex(`N(t)=${N0}\\cdot ${ft(a, 4)}^{t}`)}.`, kind: 'formel', N0, a };
  }
}

/** Fläche zwischen zwei Graphen: das passende Integral. */
export function genFlaecheZwischen(lv = 3) {
  for (;;) {
    const R = tier(lv, 2, 2, 3, 3, 4);
    const r1 = ri(-R, R - 1), r2 = ri(r1 + 1, R), c = lv >= 4 ? pick([0, 1, -2]) : 0;
    const fC = [c, 0, 1], gC = [c - r1 * r2, r1 + r2];
    const f = (x) => polyEval(fC, x), g = (x) => polyEval(gC, x);
    const O = (a, b, t, fn, correct, why) => ({ tex: `\\int_{${a}}^{${b}}${t}\\,dx`, num: simpson(fn, a, b), correct, why });
    const F = `(${polyTex(fC)})`, G = `(${polyTex(gC)})`;
    const opts = [O(r1, r2, `\\bigl(${G}-${F}\\bigr)`, (x) => g(x) - f(x), true),
      O(r1, r2, `\\bigl(${F}-${G}\\bigr)`, (x) => f(x) - g(x), false, 'Obere minus untere Funktion: Zwischen den Schnittstellen liegt die Gerade oben. So käme ein negativer Wert heraus.'),
      O(r1, r2, `\\bigl(${G}+${F}\\bigr)`, (x) => g(x) + f(x), false, 'Die Fläche zwischen zwei Graphen ist das Integral über die <b>Differenz</b>.'),
      O(r1, r2, G, g, false, `Das ist nur die Fläche unter ${tex('g')} – der Teil unter ${tex('f')} muss abgezogen werden.`)];
    if (!uniqNum(opts)) continue;
    return { prompt: `Die Graphen von ${tex('f')} und ${tex('g')} schließen eine Fläche ein. Welches Integral liefert ihren Inhalt?`,
      formula: `f(x)=${polyTex(fC)},\\quad g(x)=${polyTex(gC)}`, options: shuffle(opts),
      hints: [`Schnittstellen: ${tex('f(x)=g(x)')}.`, `Die Schnittstellen sind ${tex(`x=${r1}`)} und ${tex(`x=${r2}`)}. Welche Funktion liegt dazwischen oben?`],
      explain: `Schnittstellen ${tex(`x=${r1}`)} und ${tex(`x=${r2}`)}; dazwischen liegt ${tex('g')} oben: ${tex(`A=\\int_{${r1}}^{${r2}}(g(x)-f(x))\\,dx=${ft((r2 - r1) ** 3 / 6)}`)}.`,
      f, g, r1, r2 };
  }
}

/* ───────────── Stochastik ───────────── */

const pmf = (n, p, k) => binom(n, k) * p ** k * (1 - p) ** (n - k);
const cdf = (n, p, k) => { let s = 0; for (let i = 0; i <= k; i++) s += pmf(n, p, i); return s; };

/* Helfer nur für die Erzeuger ab hier (Stochastik, Geometrie, Operatoren). */
const b2pct = (x, d = 1) => `${ft(x * 100, d)}\\,\\%`;
const b2zeilen = (...z) => `\\begin{array}{l}${z.join('\\\\[6pt]')}\\end{array}`;
const b2erf = (x) => { const t = 1 / (1 + 0.3275911 * Math.abs(x)), y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; };
const b2Phi = (z) => 0.5 * (1 + b2erf(z / Math.SQRT2));
const b2skalar = (a, b) => a.map((c, i) => (c === 0 ? null : `${par(c)}\\cdot${par(b[i])}`)).filter(Boolean).join('+') || '0';
const b2kreuz = (u, v) => `\\begin{pmatrix}${[[1, 2], [2, 0], [0, 1]].map(([i, j]) => `${par(u[i])}\\cdot${par(v[j])}-${par(u[j])}\\cdot${par(v[i])}`).join('\\\\')}\\end{pmatrix}`;
const b2quadrate = (v) => v.map((c) => `${par(c)}^2`).join('+');
const b2laenge = (m) => (Number.isInteger(Math.sqrt(m)) ? `${Math.sqrt(m)}` : `\\sqrt{${ft(m)}}`);
const b2glied = (c, name) => (c === 0 ? '' : `${c < 0 ? '-' : '+'}${Math.abs(c) === 1 ? '' : ft(Math.abs(c))}${name}`);
const b2fern = (opts) => opts.every((a, i) => opts.every((b, j) => i === j || Math.abs(a.num - b.num) > 4e-3 * (1 + Math.abs(a.num) + Math.abs(b.num))));
const b2versch = (opts, eps) => opts.every((a, i) => opts.every((b, j) => i === j || Math.abs(a.num - b.num) > eps));
const b2vier = (x) => (+x).toFixed(4).replace('.', '{,}');
const b2runde = (x, d = 6) => +(+x).toFixed(d);

const VF_TEXT = [
  { intro: (N, pA, pB, pN) => `Von ${N} Mitgliedern eines Sportvereins spielen ${pA} in einer Mannschaft (${tex('A')}), ${pB} nutzen den Kraftraum (${tex('B')}) und ${pN} tun keines von beiden.`,
    bedingtA: 'Ein zufällig gewähltes Mitglied spielt in einer Mannschaft. Mit welcher Wahrscheinlichkeit nutzt es den Kraftraum <b>nicht</b>?', bedingt: 'Ein zufällig gewähltes Mitglied nutzt den Kraftraum. Mit welcher Wahrscheinlichkeit spielt es in einer Mannschaft?' },
  { intro: (N, pA, pB, pN) => `Von ${N} befragten Haushalten haben ${pA} ein Film-Abo (${tex('A')}), ${pB} ein Musik-Abo (${tex('B')}) und ${pN} keines von beiden.`,
    bedingtA: 'Ein zufällig gewählter Haushalt hat ein Film-Abo. Mit welcher Wahrscheinlichkeit hat er <b>kein</b> Musik-Abo?', bedingt: 'Ein zufällig gewählter Haushalt hat ein Musik-Abo. Mit welcher Wahrscheinlichkeit hat er auch ein Film-Abo?' },
  { intro: (N, pA, pB, pN) => `Von ${N} Jugendlichen eines Jahrgangs kommen ${pA} mit dem Rad zur Schule (${tex('A')}), ${pB} besuchen nachmittags eine AG (${tex('B')}) und auf ${pN} trifft keines von beiden zu.`,
    bedingtA: 'Eine zufällig gewählte Person kommt mit dem Rad. Mit welcher Wahrscheinlichkeit besucht sie <b>keine</b> AG?', bedingt: 'Eine zufällig gewählte Person besucht eine AG. Mit welcher Wahrscheinlichkeit kommt sie mit dem Rad?' },
];

/**
 * Vierfeldertafel. Stufe 1: Anteil an allen ablesen · 2: bedingte Wahrscheinlichkeit aus der vollen Tafel ·
 * 3: Tafel mit Lücken (ein Feld und eine Summe ergänzen) · 4: nur vier Einträge gegeben · 5: Text mit Prozentangaben, Additionssatz.
 */
export function genVierfelder(lv = 3) {
  for (;;) {
    const N = pick(tier(lv, [100], [100, 200], [200, 400], [240, 360, 480], [800, 1200, 1600, 2400]));
    const u = N / tier(lv, 20, 20, 40, 40, 200), m = tier(lv, 1, 1, 2, 2, 10);
    const a = u * ri(2 * m, 7 * m), b = u * ri(m, 5 * m), c = u * ri(m, 5 * m), d = N - a - b - c;
    if (d <= 0) continue;
    const kind = pick(lv <= 1 ? ['schnitt', 'A'] : ['bedingt', 'bedingtA']);
    const O = (z, n, correct, why) => ({ tex: lv >= 5 ? b2pct(z / n) : dfrac(z, n), num: z / n, correct, why });
    const all = {
      schnitt: [`P(A\\cap B)`, O(a, N, true), O(a, a + c, false, `Das ist die bedingte Wahrscheinlichkeit ${tex('P_B(A)')} – gefragt ist der Anteil an allen.`), O(a + b, N, false, `Das ist ${tex('P(A)')}: die ganze Zeile.`), O(a + c, N, false, `Das ist ${tex('P(B)')}: die ganze Spalte.`)],
      A: [`P(A)`, O(a + b, N, true), O(a, N, false, `Das ist nur ${tex('P(A\\cap B)')}. Zu ${tex('A')} gehört die ganze Zeile.`), O(a + c, N, false, `Das ist ${tex('P(B)')}.`), O(a, a + b, false, `Das ist ${tex('P_A(B)')}.`)],
      bedingt: [`P_B(A)`, O(a, a + c, true), O(a, N, false, `Das ist ${tex('P(A\\cap B)')}. Bei ${tex('P_B(A)')} steht nur ${tex('B')} im Nenner.`), O(a, a + b, false, `Bedingung vertauscht: Das ist ${tex('P_A(B)')}.`), O(a + b, N, false, `Das ist ${tex('P(A)')} ohne Bedingung.`)],
      bedingtA: [`P_A(\\overline{B})`, O(b, a + b, true), O(b, N, false, `Das ist ${tex('P(A\\cap\\overline{B})')}. Die Bedingung ${tex('A')} gehört in den Nenner.`), O(b, b + d, false, `Bedingung vertauscht: Das ist ${tex('P_{\\overline{B}}(A)')}.`), O(a, a + b, false, `Das ist ${tex('P_A(B)')} – gefragt ist ${tex('\\overline{B}')}.`)],
    }[kind];
    const opts = all.slice(1), r = opts[0];
    if (!uniqNum(opts) || !uniq(opts) || !b2fern(opts)) continue;
    const W = { a, b, ra: a + b, c, d, rc: c + d, ca: a + c, cb: b + d, N };
    const [zz, nn] = { schnitt: [a, N], A: [a + b, N], bedingt: [a, a + c], bedingtA: [b, a + b] }[kind], wert = `${all[0]}=${dfrac(zz, nn)}`;
    if (lv >= 5) {
      const T = pick(VF_TEXT), P = (x) => `${fmt((x / N) * 100, 1)} %`, D = (x) => ft(x / N, 3);
      const weg = [`Gegenereignis: ${tex(`P(A\\cup B)=1-${D(d)}=${D(N - d)}`)}.`, `Additionssatz: ${tex(`P(A\\cap B)=${D(a + b)}+${D(a + c)}-${D(N - d)}=${D(a)}`)}.`];
      if (kind === 'bedingtA') weg.push(`Nur ${tex('A')}, nicht ${tex('B')}: ${tex(`P(A\\cap\\overline{B})=${D(a + b)}-${D(a)}=${D(b)}`)}.`);
      const ende = kind === 'bedingtA' ? `P_A(\\overline{B})=\\dfrac{P(A\\cap\\overline{B})}{P(A)}=\\dfrac{${D(b)}}{${D(a + b)}}\\approx${b2pct(r.num)}` : `P_B(A)=\\dfrac{P(A\\cap B)}{P(B)}=\\dfrac{${D(a)}}{${D(a + c)}}\\approx${b2pct(r.num)}`;
      return { prompt: `${T.intro(N, P(a + b), P(a + c), P(d))} ${T[kind]}`,
        formula: b2zeilen(`P(A)=${D(a + b)},\\quad P(B)=${D(a + c)}`, `P(\\overline{A}\\cap\\overline{B})=${D(d)}`), options: shuffle(opts),
        hints: [`Gesucht ist ${tex(all[0])}. Dafür brauchst du zuerst ${tex(kind === 'bedingtA' ? 'P(A\\cap\\overline{B})' : 'P(A\\cap B)')} – das steht nicht im Text.`, ...weg, `Bedingte Wahrscheinlichkeit: durch die Wahrscheinlichkeit der Bedingung teilen.`],
        explain: `${weg.join(' ')} Damit ${tex(ende)}. Zur Kontrolle als Vierfeldertafel mit Anzahlen: ${tex(wert)}.`, kind, a, b, c, d, N };
    }
    const zeige = lv <= 2 ? null : new Set({ 3: { bedingt: ['b', 'ra', 'c', 'cb', 'N'], bedingtA: ['a', 'd', 'cb', 'ca', 'N'] }, 4: { bedingt: ['N', 'ra', 'cb', 'd'], bedingtA: ['N', 'rc', 'ca', 'c'] } }[lv][kind]);
    const z = (k) => (!zeige || zeige.has(k) ? W[k] : '\\square');
    const fuell = lv <= 2 ? [] : { 3: { bedingt: [`|A\\cap B|=${a + b}-${b}=${a}`, `|B|=${a}+${c}=${a + c}`], bedingtA: [`|A\\cap\\overline{B}|=${b + d}-${d}=${b}`, `|A|=${a}+${b}=${a + b}`] },
      4: { bedingt: [`|A\\cap\\overline{B}|=${b + d}-${d}=${b}`, `|A\\cap B|=${a + b}-${b}=${a}`, `|B|=${N}-${b + d}=${a + c}`], bedingtA: [`|A\\cap B|=${a + c}-${c}=${a}`, `|A|=${N}-${c + d}=${a + b}`, `|A\\cap\\overline{B}|=${a + b}-${a}=${b}`] } }[lv][kind];
    const grund = { schnitt: `Gefragt ist der Anteil an <b>allen</b> ${N}: das Feld, in dem ${tex('A')} und ${tex('B')} zugleich gelten.`, A: `Zu ${tex('A')} gehört die ganze Zeile: Zeilensumme durch ${N}.`,
      bedingt: `Bei ${tex('P_B(A)')} ist die Grundmenge nur ${tex('B')}: Teile durch die Spaltensumme.`, bedingtA: `Bei ${tex('P_A(\\overline{B})')} ist die Grundmenge nur ${tex('A')}: Teile durch die Zeilensumme.` }[kind];
    return { prompt: lv <= 2 ? `Bestimme ${tex(all[0])} aus der Vierfeldertafel.` : `In der Vierfeldertafel fehlen Einträge. Bestimme ${tex(all[0])}.`,
      formula: `\\def\\arraystretch{1.45}\\begin{array}{c|cc|c}&B&\\overline{B}&\\\\\\hline A&${z('a')}&${z('b')}&${z('ra')}\\\\\\overline{A}&${z('c')}&${z('d')}&${z('rc')}\\\\\\hline &${z('ca')}&${z('cb')}&${z('N')}\\end{array}`,
      options: shuffle(opts),
      hints: lv <= 2 ? ['Welche Gruppe ist die Grundmenge – alle oder nur ein Teil?', grund] : ['Ergänze zuerst die fehlenden Felder: In jeder Zeile und Spalte ergeben die Felder zusammen die Summe am Rand.', ...fuell.map((s) => `${tex(s)}.`), grund],
      explain: lv <= 2 ? `${tex(`${wert}\\approx${ft(r.num, 3)}`)}.` : `Felder ergänzen: ${fuell.map((s) => tex(s)).join(', ')}. Dann ${tex(`${wert}\\approx${ft(r.num, 3)}`)}.`, kind, a, b, c, d, N };
  }
}

/**
 * Bedingte Wahrscheinlichkeit „rückwärts". Stufe 1–2: natürliche Häufigkeiten · 3: Prozentangaben (Baum, Satz von Bayes) ·
 * 4: Sensitivität und Spezifität, seltene Krankheit · 5: drei Maschinen (totale Wahrscheinlichkeit und Bayes).
 */
export function genBedingt(lv = 3) {
  for (;;) {
    if (lv <= 2) {
      const T = lv <= 1 ? 100 : pick([1000, 2000]);
      const s = T * pick(lv <= 1 ? [0.2, 0.1] : [0.02, 0.04, 0.05]), tp = s * pick(lv <= 1 ? [0.9, 0.8] : [0.9, 0.8, 0.95]), h = T - s, fp = h * pick(lv <= 1 ? [0.1, 0.2] : [0.1, 0.05, 0.02]);
      if (![s, tp, fp].every((v) => Math.abs(v - Math.round(v)) < 1e-9)) continue;
      const [S, TP, FP] = [s, tp, fp].map(Math.round);
      const O = (z, n, correct, why) => ({ tex: dfrac(z, n), num: z / n, correct, why });
      const opts = [O(TP, TP + FP, true),
        O(TP, S, false, 'Bedingung vertauscht: Das ist die Wahrscheinlichkeit, dass ein Kranker positiv getestet wird.'),
        O(TP, T, false, 'Das ist der Anteil „krank und positiv" an allen. Gefragt ist der Anteil unter den positiv Getesteten.'),
        O(FP, TP + FP, false, 'Das ist die Wahrscheinlichkeit, trotz positivem Test gesund zu sein.')];
      if (!uniqNum(opts) || !b2fern(opts)) continue;
      return { prompt: `Von ${T} Personen sind ${S} krank. Der Test fällt bei ${TP} der Kranken positiv aus – und fälschlich auch bei ${FP} der ${T - S} Gesunden. Eine Person wird positiv getestet. Mit welcher Wahrscheinlichkeit ist sie krank?`,
        options: shuffle(opts),
        hints: lv <= 1 ? ['Die Grundmenge sind nur die positiv Getesteten.', `Positiv getestet sind insgesamt ${TP} + ${FP} Personen.`] : ['Die Grundmenge sind nur die positiv Getesteten – nicht alle und nicht nur die Kranken.', `Positiv getestet sind insgesamt ${tex(`${TP}+${FP}=${TP + FP}`)} Personen.`, `Davon sind ${TP} wirklich krank.`],
        explain: lv <= 1 ? `Unter den ${TP + FP} positiv Getesteten sind ${TP} krank: ${tex(`${dfrac(TP, TP + FP)}\\approx${ft((TP / (TP + FP)) * 100, 1)}\\,\\%`)}.`
          : `Positiv getestet: ${tex(`${TP}+${FP}=${TP + FP}`)}. Davon krank: ${tex(`${dfrac(TP, TP + FP)}\\approx${ft((TP / (TP + FP)) * 100, 1)}\\,\\%`)}. Weil es viel mehr Gesunde als Kranke gibt, fallen die falsch-positiven Ergebnisse stark ins Gewicht.`, TP, FP };
    }
    const O = (num, correct, why) => ({ tex: b2pct(num), num, correct, why });
    if (lv >= 5) {
      const ant = pick([[0.5, 0.3, 0.2], [0.45, 0.35, 0.2], [0.4, 0.35, 0.25], [0.55, 0.25, 0.2], [0.6, 0.25, 0.15]]), aus = shuffle([0.01, 0.015, 0.02, 0.025, 0.03, 0.04, 0.045]).slice(0, 3), i = ri(0, 2);
      const pf = ant.map((x, j) => b2runde(x * aus[j])), ges = b2runde(pf[0] + pf[1] + pf[2]), TP = pf[i], FP = b2runde(ges - TP);
      const opts = [O(TP / ges, true), O(ant[i], false, `Das ist der Anteil von ${tex(`M_${i + 1}`)} an der ganzen Produktion. Die Information „Ausschuss" verändert die Wahrscheinlichkeit.`),
        O(aus[i] / b2runde(aus[0] + aus[1] + aus[2]), false, 'Hier wurden nur die Ausschussquoten verglichen. Die Maschinen fertigen aber unterschiedlich viel – jede Quote muss mit dem Produktionsanteil gewichtet werden.'),
        O(TP, false, `Das ist ${tex(`P(M_${i + 1}\\cap A)`)}: Anteil an <b>allen</b> Bauteilen. Gefragt ist der Anteil unter den Ausschuss-Teilen.`)];
      if (!b2fern(opts) || !uniq(opts)) continue;
      const pr = (x) => `${ft(x * 100, 1)}\\,\\%`;
      const pfade = pf.map((x, j) => `Pfadregel für ${tex(`M_${j + 1}`)}: ${tex(`P(M_${j + 1}\\cap A)=P(M_${j + 1})\\cdot P_{M_${j + 1}}(A)=${ft(ant[j])}\\cdot${ft(aus[j], 3)}=${ft(x, 5)}`)}.`);
      const gegen = `Gegenereignis: Die Ausschussquoten sind ${tex(aus.map((x) => `1-${ft(1 - x, 3)}=${ft(x, 3)}`).join(',\\ '))}.`;
      return { prompt: `Drei Maschinen fertigen dasselbe Bauteil; die Tabelle zeigt ihren Anteil an der Produktion und den Anteil ihrer einwandfreien Teile. Ein zufällig entnommenes Bauteil ist Ausschuss (${tex('A')}). Mit welcher Wahrscheinlichkeit stammt es von ${tex(`M_${i + 1}`)}?`,
        formula: `\\def\\arraystretch{1.35}\\begin{array}{l|ccc}&M_1&M_2&M_3\\\\\\hline\\text{Anteil}&${ant.map(pr).join('&')}\\\\\\text{einwandfrei}&${aus.map((x) => pr(1 - x)).join('&')}\\end{array}`,
        options: shuffle(opts),
        hints: ['Baumdiagramm: erste Stufe Maschine, zweite Stufe Ausschuss oder einwandfrei.', gegen, ...pfade,
          `Totale Wahrscheinlichkeit: ${tex(`P(A)=${pf.map((x) => ft(x, 5)).join('+')}=${ft(ges, 5)}`)}.`, `Satz von Bayes: ${tex(`P_A(M_${i + 1})=\\dfrac{P(M_${i + 1}\\cap A)}{P(A)}`)}.`],
        explain: `${gegen} ${pfade.join(' ')} Alle Ausschuss-Pfade zusammen (totale Wahrscheinlichkeit): ${tex(`P(A)=${pf.map((x) => ft(x, 5)).join('+')}=${ft(ges, 5)}`)}. Satz von Bayes: ${tex(`P_A(M_${i + 1})=\\dfrac{${ft(TP, 5)}}{${ft(ges, 5)}}\\approx${b2pct(TP / ges)}`)}.`, TP, FP, kind: 'maschinen' };
    }
    const p = pick(lv <= 3 ? [0.01, 0.02, 0.04, 0.05] : [0.005, 0.008, 0.015, 0.025]), se = pick(lv <= 3 ? [0.9, 0.95, 0.8] : [0.97, 0.985, 0.92, 0.965]);
    const spez = pick([0.96, 0.985, 0.94, 0.975]), fp = lv <= 3 ? pick([0.05, 0.1, 0.02]) : b2runde(1 - spez);
    const TP = b2runde(p * se, 8), FP = b2runde((1 - p) * fp, 8), pos = b2runde(TP + FP, 8), r = TP / pos;
    const opts = [O(r, true), O(se, false, 'Bedingung vertauscht: Das ist die Wahrscheinlichkeit, dass ein Kranker positiv getestet wird.'),
      lv <= 3 ? O(TP, false, 'Das ist die Wahrscheinlichkeit für „krank und positiv" unter allen. Gefragt ist der Anteil unter den positiv Getesteten.')
        : O(TP / (TP + (1 - p) * spez), false, `Die Spezifität ${tex(b2pct(spez))} ist der Anteil der Gesunden mit <b>negativem</b> Test. Falsch positiv sind nur ${tex(b2pct(fp))} (Gegenereignis).`),
      O(1 - r, false, 'Das ist die Wahrscheinlichkeit, trotz positivem Test gesund zu sein.')];
    if (!b2fern(opts) || !uniq(opts)) continue;
    const baum = [`Pfadregel: ${tex(`P(K\\cap +)=${ft(p, 3)}\\cdot${ft(se, 3)}=${ft(TP, 5)}`)}.`, `Pfadregel: ${tex(`P(\\overline{K}\\cap +)=${ft(1 - p, 3)}\\cdot${ft(fp, 3)}=${ft(FP, 5)}`)}.`, `Beide Pfade zusammen: ${tex(`P(+)=${ft(TP, 5)}+${ft(FP, 5)}=${ft(pos, 5)}`)}.`];
    return { prompt: lv <= 3 ? `${fmt(p * 100)} % einer Bevölkerung haben eine bestimmte Krankheit. Ein Test erkennt ${fmt(se * 100)} % der Kranken; bei Gesunden schlägt er fälschlich in ${fmt(fp * 100)} % der Fälle an. Eine Person wird positiv getestet. Mit welcher Wahrscheinlichkeit ist sie krank?`
      : `Bei einer Reihenuntersuchung sind ${fmt(p * 100)} % der Teilnehmenden erkrankt. Der Test hat eine Sensitivität von ${fmt(se * 100)} % (Kranke werden erkannt) und eine Spezifität von ${fmt(spez * 100)} % (Gesunde werden als gesund erkannt). Eine Person wird positiv getestet. Mit welcher Wahrscheinlichkeit ist sie wirklich krank?`,
      formula: lv <= 3 ? undefined : `P(K)=${ft(p, 3)},\\quad P_K(+)=${ft(se, 3)},\\quad P_{\\overline{K}}(-)=${ft(spez, 3)}`,
      options: shuffle(opts),
      hints: [lv <= 3 ? 'Zeichne ein Baumdiagramm: erste Stufe krank oder gesund, zweite Stufe Test positiv oder negativ.' : `Gegenereignis: Falsch positiv sind ${tex(`P_{\\overline{K}}(+)=1-${ft(spez, 3)}=${ft(fp, 3)}`)} der Gesunden.`, ...baum, `Satz von Bayes: ${tex('P_+(K)=\\dfrac{P(K\\cap +)}{P(+)}')}.`],
      explain: `${lv <= 3 ? '' : `Gegenereignis: ${tex(`P_{\\overline{K}}(+)=1-${ft(spez, 3)}=${ft(fp, 3)}`)}. `}${baum.join(' ')} Satz von Bayes: ${tex(`P_+(K)=\\dfrac{${ft(TP, 5)}}{${ft(pos, 5)}}\\approx${b2pct(r)}`)}. Weil die Krankheit selten ist, sind viele positive Ergebnisse falsch positiv.`, TP, FP };
  }
}

/**
 * „Mindestens", „höchstens", „mehr als" in kumulierte Wahrscheinlichkeiten übersetzen.
 * Stufe 1: höchstens / weniger als · 2: mindestens / mehr als (Gegenereignis) · 3: Bereich zwischen zwei Grenzen ·
 * 4: Sachaufgabe, Bereich mit Tabellenwerten ausrechnen · 5: Abweichung vom Erwartungswert in Standardabweichungen, Wert ausrechnen.
 */
export function genKumuliert(lv = 3) {
  for (;;) { const q = lv >= 4 ? kumuliertZahl(lv) : kumuliert(lv); if (q && uniqNum(q.options) && uniq(q.options)) return q; }
}
function kumuliert(lv) {
  const n = pick(tier(lv, [10, 12], [10, 20], [20, 25, 50])), p = pick(lv <= 1 ? [0.2, 0.4, 0.5] : [0.2, 0.3, 0.4, 0.5, 0.6]);
  const mu = Math.round(n * p);
  const O = (t, num, correct, why) => ({ tex: t, num, correct, why });
  const F = (j) => cdf(n, p, j), P = (j) => `P(X\\le ${j})`;
  if (lv >= 3) {
    const a = Math.max(2, mu - ri(2, 4)), b = Math.min(n - 2, mu + ri(1, 4)), inkl = rand() < 0.5;
    if (b - a < 3) return null;
    const [lo, hi] = inkl ? [a, b] : [a + 1, b - 1];
    const opts = inkl ? [O(`${P(b)}-${P(a - 1)}`, F(b) - F(a - 1), true),
      O(`${P(b)}-${P(a)}`, F(b) - F(a), false, `${a} gehört dazu: Abgezogen wird alles <b>unter</b> ${a}, also bis ${a - 1}.`),
      O(`${P(b - 1)}-${P(a - 1)}`, F(b - 1) - F(a - 1), false, `${b} gehört dazu: Die obere Grenze ist ${b}.`),
      O(`1-${P(a - 1)}`, 1 - F(a - 1), false, `Das ist „mindestens ${a}" – die obere Grenze ${b} fehlt.`)]
      : [O(`${P(b - 1)}-${P(a)}`, F(b - 1) - F(a), true),
        O(`${P(b)}-${P(a - 1)}`, F(b) - F(a - 1), false, `Weder ${a} noch ${b} gehören dazu: „mehr als ${a}" beginnt bei ${a + 1}, „weniger als ${b}" endet bei ${b - 1}.`),
        O(`${P(b)}-${P(a)}`, F(b) - F(a), false, `${b} gehört nicht dazu: „weniger als ${b}" endet bei ${b - 1}.`),
        O(`${P(b - 1)}-${P(a - 1)}`, F(b - 1) - F(a - 1), false, `${a} gehört nicht dazu: Abgezogen wird alles bis einschließlich ${a}.`)];
    const wort = inkl ? `mindestens ${a} und höchstens ${b}` : `mehr als ${a} und weniger als ${b}`;
    return { prompt: `${tex('X')} ist binomialverteilt. Welcher Ausdruck liefert die Wahrscheinlichkeit für <b>${wort}</b> Treffer?`, formula: `n=${n},\\quad p=${ft(p)}`, options: shuffle(opts),
      hints: [inkl ? `Untere Grenze: „mindestens ${a}" heißt ${tex(`X\\ge ${a}`)}. Obere Grenze: „höchstens ${b}" heißt ${tex(`X\\le ${b}`)}.` : `Untere Grenze: „mehr als ${a}" heißt ${tex(`X\\ge ${a + 1}`)}. Obere Grenze: „weniger als ${b}" heißt ${tex(`X\\le ${b - 1}`)}.`,
        `Zusammen: ${tex(`${lo}\\le X\\le ${hi}`)}.`, 'Alles bis zur oberen Grenze, minus alles unterhalb der unteren Grenze.', `Unterhalb von ${lo} heißt: ${tex(`X\\le ${lo - 1}`)}.`],
      explain: `„${wort[0].toUpperCase()}${wort.slice(1)}" bedeutet ${tex(`X\\ge ${lo}`)} und ${tex(`X\\le ${hi}`)}, zusammen ${tex(`${lo}\\le X\\le ${hi}`)}. Von allem bis ${hi} wird alles bis ${lo - 1} abgezogen: ${tex(`P(${lo}\\le X\\le ${hi})=${P(hi)}-${P(lo - 1)}`)}.`, n, p, lo, hi };
  }
  const k = Math.min(n - 2, Math.max(2, mu + ri(-2, 2)));
  const kinds = { hoechstens: [`höchstens ${k}`, P(k), 0, k], weniger: [`weniger als ${k}`, P(k - 1), 0, k - 1], mehr: [`mehr als ${k}`, `1-${P(k)}`, k + 1, n], mindestens: [`mindestens ${k}`, `1-${P(k - 1)}`, k, n] };
  const kind = pick(lv <= 1 ? ['hoechstens', 'weniger'] : ['mehr', 'mindestens']);
  const numOf = { hoechstens: F(k), weniger: F(k - 1), mehr: 1 - F(k), mindestens: 1 - F(k - 1) };
  const opts = Object.keys(kinds).map((key) => O(kinds[key][1], numOf[key], key === kind, `Das ist „${kinds[key][0]}".`));
  const [wort, ausdruck, lo, hi] = kinds[kind];
  return { prompt: `${tex('X')} ist binomialverteilt. Welcher Ausdruck liefert die Wahrscheinlichkeit für <b>${wort}</b> Treffer?`, formula: `n=${n},\\quad p=${ft(p)}`, options: shuffle(opts),
    hints: lv <= 1 ? [`Schreibe es als Ungleichung: ${tex(`X\\le\\dots`)} Gehört ${k} dazu?`, `Tabellen liefern genau solche Werte ${tex('P(X\\le k)')}.`]
      : [`Schreibe es als Ungleichung: ${tex(`X\\ge\\dots`)} Gehört ${k} dazu?`, `Tabellen liefern nur ${tex('P(X\\le k)')}. Für „mindestens" und „mehr als" brauchst du das Gegenereignis.`, `Das Gegenereignis zu ${tex(`X\\ge ${lo}`)} ist ${tex(`X\\le ${lo - 1}`)}.`],
    explain: lv <= 1 ? `„${wort[0].toUpperCase()}${wort.slice(1)}" bedeutet ${tex(`X\\le ${hi}`)}, also ${tex(ausdruck)}.`
      : `„${wort[0].toUpperCase()}${wort.slice(1)}" bedeutet ${tex(`X\\ge ${lo}`)}. Über das Gegenereignis: ${tex(`P(X\\ge ${lo})=1-P(X\\le ${lo - 1})`)}.`, n, p, lo, hi };
}
const KUM_TEXT = [
  [(n, p) => `Ein Onlinehändler verschickt ${n} Pakete; jedes kommt unabhängig von den anderen mit der Wahrscheinlichkeit ${p} schon am nächsten Tag an.`, 'kommen', 'Pakete am nächsten Tag an', 'der pünktlichen Pakete'],
  [(n, p) => `Auf einem Schulfest drehen ${n} Personen je einmal ein Glücksrad, das mit der Wahrscheinlichkeit ${p} einen Gewinn zeigt.`, 'gewinnen', 'Personen', 'der Gewinne'],
  [(n, p) => `Eine Gärtnerei sät ${n} Samen aus; jeder keimt unabhängig von den anderen mit der Wahrscheinlichkeit ${p}.`, 'keimen', 'Samen', 'der gekeimten Samen'],
];
function kumuliertZahl(lv) {
  const [intro, verb, objekt, anzahl] = pick(KUM_TEXT);
  const P = (j) => `P(X\\le ${j})`;
  if (lv <= 4) {
    const n = pick([50, 80, 100]), p = pick([0.2, 0.3, 0.4, 0.5, 0.6]), mu = Math.round(n * p), F = (j) => cdf(n, p, j), Fr = (j) => +F(j).toFixed(4);
    const a = mu - ri(3, 6), b = mu + ri(2, 6), inkl = rand() < 0.5, [lo, hi] = inkl ? [a, b] : [a + 1, b - 1];
    const O = (o, u, correct, why) => ({ tex: b2vier(Fr(o) - Fr(u)), num: F(o) - F(u), correct, why });
    const opts = inkl ? [O(b, a - 1, true), O(b, a, false, `${a} gehört dazu: Abgezogen wird nur alles bis ${a - 1}.`), O(b - 1, a - 1, false, `${b} gehört dazu: Die obere Grenze ist ${b}.`), O(b - 1, a, false, `${a} und ${b} gehören beide dazu: Der Bereich ist ${tex(`${a}\\le X\\le ${b}`)}.`)]
      : [O(b - 1, a, true), O(b, a - 1, false, `Weder ${a} noch ${b} gehören dazu: Der Bereich ist ${tex(`${a + 1}\\le X\\le ${b - 1}`)}.`), O(b, a, false, `${b} gehört nicht dazu: „weniger als ${b}" endet bei ${b - 1}.`), O(b - 1, a - 1, false, `${a} gehört nicht dazu: Abgezogen wird alles bis einschließlich ${a}.`)];
    if (!b2versch(opts, 0.001)) return null;
    const wort = inkl ? `mindestens ${a} und höchstens ${b}` : `mehr als ${a}, aber weniger als ${b}`;
    return { prompt: `${intro(n, fmt(p))} Mit welcher Wahrscheinlichkeit ${verb} <b>${wort}</b> ${objekt}?`,
      formula: `\\def\\arraystretch{1.3}\\begin{array}{l}${P(a - 1)}\\approx${b2vier(Fr(a - 1))},\\quad ${P(a)}\\approx${b2vier(Fr(a))}\\\\${P(b - 1)}\\approx${b2vier(Fr(b - 1))},\\quad ${P(b)}\\approx${b2vier(Fr(b))}\\end{array}`, options: shuffle(opts),
      hints: [`${tex('X')}: Anzahl ${anzahl}, binomialverteilt mit ${tex(`n=${n}`)} und ${tex(`p=${ft(p)}`)}.`, `Bereich als Ungleichung: ${tex(`${lo}\\le X\\le ${hi}`)}.`, `${tex(`P(${lo}\\le X\\le ${hi})=${P(hi)}-${P(lo - 1)}`)}: alles bis ${hi}, minus alles bis ${lo - 1}.`, `Tabellenwerte einsetzen: ${tex(`${b2vier(Fr(hi))}-${b2vier(Fr(lo - 1))}`)}.`],
      explain: `„${wort[0].toUpperCase()}${wort.slice(1)}" bedeutet ${tex(`${lo}\\le X\\le ${hi}`)}. ${tex(`P(${lo}\\le X\\le ${hi})=${P(hi)}-${P(lo - 1)}\\approx${b2vier(Fr(hi))}-${b2vier(Fr(lo - 1))}=${b2vier(Fr(hi) - Fr(lo - 1))}`)}.`, n, p, lo, hi, kind: 'zahl' };
  }
  const n = pick([120, 150, 180, 200]), p = pick([0.15, 0.25, 0.35, 0.45, 0.65]), c = pick([1.5, 2, 2.5]);
  const mu = b2runde(n * p), s2 = b2runde(n * p * (1 - p)), sg = Math.sqrt(s2), U = mu - c * sg, V = mu + c * sg, lo = Math.ceil(U), hi = Math.floor(V);
  if ([U, V].some((x) => Math.abs(x - Math.round(x)) < 0.04) || lo < 2) return null;
  const F = (j) => cdf(n, p, j), Fr = (j) => +F(j).toFixed(4);
  const O = (o, u, correct, why) => ({ tex: b2vier(Fr(o) - Fr(u)), num: F(o) - F(u), correct, why });
  const opts = [O(hi, lo - 1, true), O(hi, lo, false, `${lo} gehört zum Bereich: Abgezogen wird nur alles bis ${lo - 1}.`),
    O(hi + 1, lo - 2, false, `Die Grenzen ${tex(ft(U))} und ${tex(ft(V))} wurden nach außen gerundet. ${lo - 1} und ${hi + 1} liegen aber schon außerhalb.`),
    O(hi + 1, lo - 1, false, `${hi + 1} liegt schon über ${tex(`\\mu+${ft(c)}\\sigma\\approx${ft(V)}`)}.`)];
  if (!b2versch(opts, 0.001)) return null;
  return { prompt: `${intro(n, fmt(p))} Mit welcher Wahrscheinlichkeit weicht die Anzahl ${anzahl} um <b>höchstens ${fmt(c)} Standardabweichungen</b> vom Erwartungswert ab?`,
    formula: `\\def\\arraystretch{1.3}\\begin{array}{l}${P(lo - 2)}\\approx${b2vier(Fr(lo - 2))},\\quad ${P(lo - 1)}\\approx${b2vier(Fr(lo - 1))}\\\\${P(lo)}\\approx${b2vier(Fr(lo))},\\quad ${P(hi)}\\approx${b2vier(Fr(hi))}\\\\${P(hi + 1)}\\approx${b2vier(Fr(hi + 1))}\\end{array}`, options: shuffle(opts),
    hints: [`Erwartungswert: ${tex(`\\mu=n\\cdot p=${n}\\cdot${ft(p)}=${ft(mu)}`)}.`, `Standardabweichung: ${tex(`\\sigma=\\sqrt{n\\cdot p\\cdot(1-p)}=\\sqrt{${ft(s2, 3)}}\\approx${ft(sg)}`)}.`,
      `Grenzen: ${tex(`\\mu-${ft(c)}\\sigma\\approx${ft(U)}`)} und ${tex(`\\mu+${ft(c)}\\sigma\\approx${ft(V)}`)}.`, `Nur ganze Trefferzahlen zählen – nach innen runden: ${tex(`${lo}\\le X\\le ${hi}`)}.`, `${tex(`P(${lo}\\le X\\le ${hi})=${P(hi)}-${P(lo - 1)}`)}.`],
    explain: `${tex(`\\mu=${n}\\cdot${ft(p)}=${ft(mu)}`)}, ${tex(`\\sigma=\\sqrt{${n}\\cdot${ft(p)}\\cdot${ft(1 - p)}}=\\sqrt{${ft(s2, 3)}}\\approx${ft(sg)}`)}. Der Bereich ${tex(`[${ft(mu)}-${ft(c)}\\cdot${ft(sg)};\\ ${ft(mu)}+${ft(c)}\\cdot${ft(sg)}]\\approx[${ft(U)};\\ ${ft(V)}]`)} enthält die Trefferzahlen ${lo} bis ${hi}. ${tex(`P(${lo}\\le X\\le ${hi})=${P(hi)}-${P(lo - 1)}\\approx${b2vier(Fr(hi))}-${b2vier(Fr(lo - 1))}=${b2vier(Fr(hi) - Fr(lo - 1))}`)}.`, n, p, lo, hi, kind: 'sigma' };
}

const SIG_TEXT = [
  (n, z, m) => `In einer Stadt nutzen erfahrungsgemäß ${z} von ${m} Erwachsenen das Leihrad-Angebot. Für eine Umfrage werden ${n} Erwachsene zufällig ausgewählt; ${tex('X')} zählt die Nutzer darunter.`,
  (n, z, m) => `Erfahrungsgemäß erscheinen ${z} von ${m} angemeldeten Personen nicht zum Termin. Angemeldet sind ${n} Personen; ${tex('X')} zählt, wie viele nicht erscheinen.`,
  (n, z, m) => `Bei einem Automaten gehören auf lange Sicht ${z} von ${m} Werkstücken zur Güteklasse 1. Es werden ${n} Werkstücke gefertigt; ${tex('X')} zählt die Werkstücke der Güteklasse 1.`,
];

/**
 * Sigma-Regeln. Stufe 1: μ und σ gegeben, 1σ-Umgebung · 2: μ und σ aus n und p (glatt) · 3: alle drei Regeln, auch „außerhalb" ·
 * 4: krumme Standardabweichung · 5: Sachaufgabe mit den 90-/95-/99-%-Umgebungen (1,64σ; 1,96σ; 2,58σ).
 */
export function genSigma(lv = 3) {
  for (;;) {
    const glatt = lv <= 3;
    const [n, p] = glatt ? pick(SIGMA_OK.filter(([N, P]) => Number.isInteger(+(N * P).toFixed(6)))) : [pick(lv <= 4 ? [80, 120, 150, 250, 300] : [240, 350, 420, 560, 750]), pick(lv <= 4 ? [0.3, 0.4, 0.6, 0.15, 0.35] : [0.35, 0.15, 0.45, 0.125, 0.65])];
    const mu = b2runde(n * p), s2 = b2runde(n * p * (1 - p)), sg = glatt ? Math.round(Math.sqrt(s2)) : Math.sqrt(s2);
    if (!glatt && (sg <= 3 || Math.abs(sg - Math.round(sg)) < 0.05)) continue;
    const ks = lv >= 5 ? [1.64, 1.96, 2.58] : [1, 2, 3], k = lv <= 1 ? 1 : lv === 2 ? pick([1, 2]) : pick(ks);
    const PCT = { 1: '68,3', 2: '95,4', 3: '99,7', 1.64: '90', 1.96: '95', 2.58: '99' }, OUT = { 1: '31,7', 2: '4,6', 3: '0,3', 1.64: '10', 1.96: '5', 2.58: '1' };
    const name = (j) => `${fmt(j)}σ-Umgebung`;
    const O = (r, correct, why) => ({ tex: `[${ft(mu - r)};\\ ${ft(mu + r)}]`, lo: mu - r, hi: mu + r, correct, why });
    const opts = ks.map((j) => O(j * sg, j === k, `Das ist die ${name(j)} mit etwa ${PCT[j]} %.`));
    if (glatt) opts.push({ tex: `[${ft(-k * sg)};\\ ${ft(k * sg)}]`, lo: -k * sg, hi: k * sg, correct: false, why: `Die Umgebung liegt um den Erwartungswert ${tex('\\mu')}, nicht um 0.` });
    else opts.push(O(k * s2, false, `Hier wurde mit der Varianz ${tex(`\\sigma^2=${ft(s2)}`)} gerechnet. Der Radius ist ${tex(`${ft(k)}\\cdot\\sigma`)} – erst die Wurzel ziehen.`));
    if (!uniq(opts)) continue;
    const out = lv >= 4 ? rand() < 0.5 : lv === 3 && rand() < 0.3;
    const frage = out ? `Nur mit etwa <b>${OUT[k]} %</b> Wahrscheinlichkeit liegt die Trefferzahl <b>außerhalb</b> eines dieser Intervalle. Außerhalb von welchem?` : `In welchem Intervall liegt die Trefferzahl mit etwa <b>${PCT[k]} %</b> Wahrscheinlichkeit?`;
    const regel = lv >= 5 ? `Zu 90 % gehört der Radius 1,64σ, zu 95 % der Radius 1,96σ, zu 99 % der Radius 2,58σ.` : 'Sigma-Regeln: 1σ ≈ 68,3 %, 2σ ≈ 95,4 %, 3σ ≈ 99,7 %.';
    const aussen = `Außerhalb heißt: 100 % minus die Wahrscheinlichkeit innerhalb. ${OUT[k]} % außerhalb bedeutet ${PCT[k]} % innerhalb.`;
    const intervall = `[${ft(mu)}-${ft(k)}\\cdot${ft(sg)};\\ ${ft(mu)}+${ft(k)}\\cdot${ft(sg)}]${glatt ? '=' : '\\approx'}[${ft(mu - k * sg)};\\ ${ft(mu + k * sg)}]`;
    if (lv <= 1) return { prompt: `${tex('X')} ist binomialverteilt. ${frage}`, formula: `\\mu=${mu},\\quad\\sigma=${sg}`, options: shuffle(opts),
      hints: ['Sigma-Regel: Etwa 68,3 % liegen höchstens eine Standardabweichung vom Erwartungswert entfernt.', `Gehe von ${tex(`\\mu=${mu}`)} um ${tex(`\\sigma=${sg}`)} nach links und nach rechts.`],
      explain: `Die 1σ-Umgebung ist ${tex(`[${mu}-${sg};\\ ${mu}+${sg}]=[${mu - sg};\\ ${mu + sg}]`)}.`, n, p, k };
    const [bz, bn] = { 0.35: [7, 20], 0.15: [3, 20], 0.45: [9, 20], 0.125: [1, 8], 0.65: [13, 20] }[p] || [0, 1];
    const rechnung = [...(lv >= 5 ? [`Trefferwahrscheinlichkeit: ${tex(`p=\\dfrac{${bz}}{${bn}}=${ft(p, 3)}`)}.`] : []), `Erwartungswert: ${tex(`\\mu=n\\cdot p=${n}\\cdot${ft(p, 3)}=${ft(mu)}`)}.`, `Standardabweichung: ${tex(`\\sigma=\\sqrt{n\\cdot p\\cdot(1-p)}=\\sqrt{${ft(s2, 3)}}${glatt ? '=' : '\\approx'}${ft(sg)}`)}.`];
    const grenzen = `Grenzen: ${tex(`${ft(mu)}-${ft(k * sg)}\\approx${ft(mu - k * sg)}`)} und ${tex(`${ft(mu)}+${ft(k * sg)}\\approx${ft(mu + k * sg)}`)}.`;
    return { prompt: lv >= 5 ? `${pick(SIG_TEXT)(n, bz, bn)} ${frage}` : `${tex('X')} ist binomialverteilt. ${frage}`,
      formula: lv >= 5 ? undefined : `n=${n},\\quad p=${ft(p)}`, options: shuffle(opts),
      hints: [...rechnung, ...(out ? [aussen] : []), regel, ...(glatt ? [] : [`Radius: ${tex(`${ft(k)}\\cdot${ft(sg)}\\approx${ft(k * sg)}`)}.`]), ...(lv >= 5 ? [grenzen] : [])],
      explain: `${rechnung.join(' ')} ${out ? `${OUT[k]} % außerhalb heißt ${PCT[k]} % innerhalb. ` : ''}Dazu gehört die ${name(k)}${lv >= 5 ? ` mit dem Radius ${tex(`${ft(k)}\\cdot${ft(sg)}\\approx${ft(k * sg)}`)}` : ''}: ${tex(intervall)}.${glatt ? '' : ` Die Sigma-Regeln dürfen benutzt werden, weil ${tex(`\\sigma\\approx${ft(sg)}>3`)} ist (Laplace-Bedingung).`}`, n, p, k };
  }
}

const HYP = [
  { q: 'Was ist ein <b>Fehler 1. Art</b>?', key: 'a1' },
  { q: 'Was ist ein <b>Fehler 2. Art</b>?', key: 'a2' },
  { q: 'Was bedeutet ein <b>Signifikanzniveau von 5 %</b>?', key: 'sig' },
];
const HYP_OPT = {
  a1: 'Die Nullhypothese wird abgelehnt, obwohl sie stimmt.',
  a2: 'Die Nullhypothese wird beibehalten, obwohl sie falsch ist.',
  sig: 'Die Wahrscheinlichkeit, die Nullhypothese irrtümlich abzulehnen, beträgt höchstens 5 %.',
  x1: 'Die Nullhypothese ist mit 95 % Wahrscheinlichkeit richtig.',
  x2: 'Die Stichprobe war zu klein für eine Entscheidung.',
};
const HYP_WHY = { a1: 'Das ist der Fehler 1. Art.', a2: 'Das ist der Fehler 2. Art.', sig: 'Das beschreibt das Signifikanzniveau.', x1: 'Ein verbreitetes Missverständnis: Der Test sagt nichts darüber, wie wahrscheinlich die Hypothese selbst ist.', x2: 'Die Stichprobengröße ist kein Fehler im Sinne des Tests.' };
const HYP_FALL = [
  { t: 'Ein Hersteller versichert: Höchstens 4 % seiner Schrauben sind fehlerhaft (Nullhypothese). Ein Abnehmer prüft eine Stichprobe und lehnt die Lieferung ab, wenn zu viele fehlerhafte Schrauben darin sind.',
    a1: 'Die Lieferung wird abgelehnt, obwohl wirklich höchstens 4 % der Schrauben fehlerhaft sind.', a2: 'Die Lieferung wird angenommen, obwohl in Wahrheit mehr als 4 % der Schrauben fehlerhaft sind.',
    x1: 'In der Stichprobe sind zufällig genau 4 % der Schrauben fehlerhaft.', x2: 'Der Abnehmer prüft weniger Schrauben als geplant.' },
  { t: 'Eine Ärztin geht davon aus, dass ein neues Mittel nicht besser wirkt als das alte (Nullhypothese). Nur wenn in einer Studie auffällig viele Behandelte gesund werden, gilt das neue Mittel als besser.',
    a1: 'Das neue Mittel wird als besser eingestuft, obwohl es in Wahrheit nicht besser wirkt.', a2: 'Das neue Mittel wird nicht als besser eingestuft, obwohl es in Wahrheit besser wirkt.',
    x1: 'In der Studie werden genauso viele Behandelte gesund wie erwartet.', x2: 'Einige Teilnehmende brechen die Studie vorzeitig ab.' },
  { t: 'Ein Spielleiter nimmt an, dass ein Würfel fair ist (Nullhypothese). Der Würfel wird aussortiert, wenn bei 120 Würfen auffällig viele Sechsen fallen.',
    a1: 'Der Würfel wird aussortiert, obwohl er fair ist.', a2: 'Der Würfel bleibt im Spiel, obwohl er zu oft die Sechs zeigt.',
    x1: 'Bei 120 Würfen fallen genau 20 Sechsen.', x2: 'Der Würfel wird nur 100-mal statt 120-mal geworfen.' },
];
const HYP_TEST = [
  (p, n) => `Ein Medikament half bisher ${p} % der Behandelten. Für eine neue Rezeptur wird eine höhere Quote vermutet; ${n} Personen werden damit behandelt.`,
  (p, n) => `Bisher bestanden ${p} % der Prüflinge die Theorieprüfung im ersten Versuch. Nach Einführung einer Lern-App vermutet die Fahrschule einen höheren Anteil; ${n} Prüfungen werden ausgewertet.`,
  (p, n) => `Bisher klickten ${p} % der Besucher auf ein Werbebanner. Nach einer Neugestaltung vermutet die Agentur einen höheren Anteil; ${n} Besuche werden ausgewertet.`,
];

/**
 * Hypothesentest. Stufe 1: Begriffe · 2: Fehler 1. und 2. Art in einer Sachsituation erkennen · 3: Ablehnungsbereich aus P(X ≥ k) ·
 * 4: Sachaufgabe, nur kumulierte Tabelle (Gegenereignis) · 5: dazu die Wahrscheinlichkeit β für den Fehler 2. Art bei wahrem p₁.
 */
export function genHypothese(lv = 3) {
  if (lv <= 1) {
    const Q = pick(HYP);
    const keys = shuffle([Q.key, ...shuffle(Object.keys(HYP_OPT).filter((k) => k !== Q.key)).slice(0, 3)]);
    return { prompt: Q.q, options: keys.map((k) => ({ tex: HYP_OPT[k], html: HYP_OPT[k], key: k, correct: k === Q.key, why: HYP_WHY[k] })),
      hints: ['Die Nullhypothese ist die Annahme, die geprüft wird.', '1. Art: zu Unrecht abgelehnt. 2. Art: zu Unrecht beibehalten.'], explain: HYP_OPT[Q.key], kind: 'begriff', expect: Q.key };
  }
  if (lv === 2) {
    const S = pick(HYP_FALL), key = pick(['a1', 'a2']), art = key === 'a1' ? '1. Art' : '2. Art';
    const why = { a1: 'Hier stimmt die Nullhypothese und wird trotzdem abgelehnt – das ist der Fehler 1. Art.', a2: 'Hier ist die Nullhypothese falsch und wird trotzdem beibehalten – das ist der Fehler 2. Art.', x1: 'Das ist ein mögliches Ergebnis der Stichprobe, aber keine Fehlentscheidung.', x2: 'Das betrifft die Durchführung, nicht die Entscheidung über die Nullhypothese.' };
    return { prompt: `${S.t} Was wäre hier ein <b>Fehler ${art}</b>?`, options: shuffle(['a1', 'a2', 'x1', 'x2']).map((k) => ({ tex: S[k], html: S[k], key: k, correct: k === key, why: why[k] })),
      hints: ['Kläre zuerst: Was genau behauptet die Nullhypothese in dieser Situation?', `Fehler ${art}: Die Nullhypothese ${key === 'a1' ? 'stimmt, wird aber abgelehnt' : 'ist falsch, wird aber beibehalten'}.`, 'Übersetze „ablehnen" und „beibehalten" in die Handlung aus dem Text.'],
      explain: `Fehler ${art} heißt: Die Nullhypothese ${key === 'a1' ? 'stimmt, wird aber abgelehnt' : 'ist falsch, wird aber beibehalten'}. In dieser Situation: ${S[key]}`, kind: 'begriff', expect: key };
  }
  for (;;) {
    const n = pick(tier(lv, [20], [20], [20, 25, 30], [50, 80, 100], [100, 150, 200])), p0 = pick(lv >= 5 ? [0.2, 0.25, 0.3, 0.4] : lv === 4 ? [0.2, 0.3, 0.4, 0.5] : [0.3, 0.4, 0.5]), al = pick(lv >= 5 ? [0.05, 0.025, 0.01] : [0.05, 0.1]);
    const F0 = (j) => cdf(n, p0, j), up = (k) => 1 - F0(k - 1);
    let k = 0; while (up(k) > al) k++;
    if ([k - 1, k, k + 1].some((j) => Math.abs(up(j) - al) < 0.08 * al) || k >= n - 1 || k < 3) continue;
    const H = `${tex(`H_0\\colon p=${ft(p0)}`)} gegen ${tex(`H_1\\colon p>${ft(p0)}`)}`;
    if (lv <= 3) {
      const O = (lo, hi, correct, why) => ({ tex: `\\{${lo},\\dots,${hi}\\}`, lo, hi, correct, why });
      const opts = [O(k, n, true),
        O(k - 1, n, false, `${tex(`P(X\\ge ${k - 1})\\approx${ft(up(k - 1), 4)}`)} ist größer als ${tex(ft(al))} – das Niveau wäre überschritten.`),
        O(k + 1, n, false, `Der Ablehnungsbereich soll so groß wie möglich sein: Schon ${tex(`P(X\\ge ${k})\\approx${ft(up(k), 4)}`)} hält das Niveau ein.`),
        O(0, n - k, false, `Vermutet wird ${tex(`p>${ft(p0)}`)}: Gegen die Nullhypothese sprechen <b>große</b> Trefferzahlen (rechtsseitiger Test).`)];
      return { prompt: `${tex(`H_0\\colon p=${ft(p0)}`)} wird gegen ${tex(`H_1\\colon p>${ft(p0)}`)} getestet, mit ${n} Versuchen auf dem Niveau ${fmt(al * 100)} %. Welcher Ablehnungsbereich ist richtig?`,
        formula: `\\def\\arraystretch{1.35}\\begin{array}{l}P(X\\ge ${k - 1})\\approx${ft(up(k - 1), 4)}\\\\P(X\\ge ${k})\\approx${ft(up(k), 4)}\\\\P(X\\ge ${k + 1})\\approx${ft(up(k + 1), 4)}\\end{array}`,
        options: shuffle(opts),
        hints: ['Rechtsseitiger Test: Abgelehnt wird bei großen Trefferzahlen.', 'Gesucht ist die kleinste Trefferzahl k, für die P(X ≥ k) das Niveau nicht überschreitet.', `Vergleiche die drei Werte mit ${fmt(al)}.`],
        explain: `${tex(`P(X\\ge ${k})\\approx${ft(up(k), 4)}\\le ${ft(al)}`)}, aber ${tex(`P(X\\ge ${k - 1})\\approx${ft(up(k - 1), 4)}>${ft(al)}`)}. Also ${tex(`K=\\{${k},\\dots,${n}\\}`)}.`, kind: 'bereich', n, p0, al };
    }
    const text = pick(HYP_TEST)(fmt(p0 * 100), n), al3 = ft(al, 3);
    const gegen = [k - 1, k, k + 1].map((j) => `P(X\\ge ${j})=1-P(X\\le ${j - 1})\\approx${ft(up(j), 4)}`);
    const entscheid = `${tex(`P(X\\ge ${k})\\approx${ft(up(k), 4)}\\le ${al3}`)}, aber ${tex(`P(X\\ge ${k - 1})\\approx${ft(up(k - 1), 4)}>${al3}`)}`;
    if (lv === 4) {
      const O = (lo, hi, correct, why) => ({ tex: `\\{${lo},\\dots,${hi}\\}`, lo, hi, correct, why });
      const opts = [O(k, n, true),
        O(k - 1, n, false, `${tex(`P(X\\ge ${k - 1})\\approx${ft(up(k - 1), 4)}`)} ist größer als ${tex(al3)} – das Niveau wäre überschritten.`),
        O(k + 1, n, false, `Gegenereignis um eins verschoben: ${tex(`P(X\\ge ${k})=1-P(X\\le ${k - 1})`)}, nicht ${tex(`1-P(X\\le ${k})`)}. Schon ab ${k} wird das Niveau eingehalten.`),
        O(0, k - 1, false, 'Das ist der Annahmebereich. Gegen die Nullhypothese sprechen hier die <b>großen</b> Trefferzahlen.')];
      return { prompt: `${text} Getestet wird ${H} auf dem Niveau ${fmt(al * 100)} %. Welcher Ablehnungsbereich ist richtig?`,
        formula: `\\def\\arraystretch{1.35}\\begin{array}{l}${[k - 2, k - 1, k].map((j) => `P(X\\le ${j})\\approx${ft(F0(j), 4)}`).join('\\\\')}\\end{array}`,
        options: shuffle(opts),
        hints: ['Rechtsseitiger Test: Der Ablehnungsbereich hat die Form {k, …, n}. Gesucht ist das kleinste k mit P(X ≥ k) ≤ α.', `Die Tabelle liefert nur ${tex('P(X\\le j)')}. Gegenereignis: ${tex('P(X\\ge k)=1-P(X\\le k-1)')}.`, ...gegen.map((g) => `${tex(g)}.`), `Vergleiche mit ${tex(`\\alpha=${al3}`)}.`],
        explain: `Über das Gegenereignis: ${gegen.map((g) => tex(g)).join(', ')}. ${entscheid}. Also ${tex(`K=\\{${k},\\dots,${n}\\}`)}.`, kind: 'bereich', n, p0, al };
    }
    const p1 = b2runde(p0 + 0.1), F1 = (j) => cdf(n, p1, j), beta = F1(k - 1);
    if (beta < 0.02 || beta > 0.98) continue;
    const O = (lo, hi, b, correct, why) => ({ tex: `\\{${lo},\\dots,${hi}\\};\\ \\beta\\approx${ft(b, 4)}`, lo, hi, correct, why });
    const opts = [O(k, n, beta, true),
      O(k - 1, n, F1(k - 2), false, `${tex(`P(X\\ge ${k - 1})\\approx${ft(up(k - 1), 4)}`)} ist größer als ${tex(al3)} – das Niveau wäre überschritten.`),
      O(k + 1, n, F1(k), false, `Gegenereignis um eins verschoben: ${tex(`P(X\\ge ${k})=1-P(X\\le ${k - 1})`)}. Schon ab ${k} wird das Niveau eingehalten.`),
      O(0, k - 1, 1 - beta, false, `Das ist der Annahmebereich; und ${tex(`1-\\beta`)} ist die Wahrscheinlichkeit, die falsche Nullhypothese richtig abzulehnen.`)];
    if (!uniq(opts)) continue;
    return { prompt: `${text} Getestet wird ${H} auf dem Niveau ${fmt(al * 100, 1)} %. Bestimme den Ablehnungsbereich ${tex('K')} und die Wahrscheinlichkeit ${tex('\\beta')} für einen Fehler 2. Art, falls in Wahrheit ${tex(`p=${ft(p1)}`)} gilt.`,
      formula: `\\def\\arraystretch{1.3}\\begin{array}{c|cc}j&P_{${ft(p0)}}(X\\le j)&P_{${ft(p1)}}(X\\le j)\\\\\\hline ${[k - 2, k - 1, k].map((j) => `${j}&${ft(F0(j), 4)}&${ft(F1(j), 4)}`).join('\\\\')}\\end{array}`,
      options: shuffle(opts),
      hints: ['Rechtsseitiger Test: Gesucht ist das kleinste k mit P(X ≥ k) ≤ α – gerechnet mit der Spalte der Nullhypothese.', `Gegenereignis: ${tex('P(X\\ge k)=1-P(X\\le k-1)')}.`, ...gegen.map((g) => `${tex(g)}.`), `Vergleiche mit ${tex(`\\alpha=${al3}`)}: Das ergibt ${tex(`K=\\{${k},\\dots,${n}\\}`)}.`,
        `Fehler 2. Art: ${tex('H_0')} wird beibehalten, obwohl ${tex(`p=${ft(p1)}`)} gilt – also ${tex(`X\\le ${k - 1}`)}, gerechnet mit der Spalte für ${tex(ft(p1))}.`],
      explain: `Über das Gegenereignis (Spalte ${tex(`p=${ft(p0)}`)}): ${gegen.map((g) => tex(g)).join(', ')}. ${entscheid}. Also ${tex(`K=\\{${k},\\dots,${n}\\}`)}. Fehler 2. Art: Das Ergebnis fällt in den Annahmebereich, obwohl ${tex(`p=${ft(p1)}`)} gilt: ${tex(`\\beta=P_{${ft(p1)}}(X\\le ${k - 1})\\approx${ft(beta, 4)}`)}.`, kind: 'bereichBeta', n, p0, al, p1, beta };
  }
}

const PHI = { '-2': 0.0228, '-1': 0.1587, 1: 0.8413, 2: 0.9772 };
const PHI_TAB = { 0.25: 0.5987, 0.5: 0.6915, 0.75: 0.7734, 1: 0.8413, 1.25: 0.8944, 1.5: 0.9332, 2: 0.9772 };
const NV_TEXT = [['Die Körpergröße (in cm) der Spielerinnen eines Verbandes', 172.4, 6.8], ['Die Füllmenge (in ml) der Flaschen einer Abfüllanlage', 503.2, 4.6], ['Die Fahrzeit (in min) einer Buslinie', 37.5, 2.4], ['Das Gewicht (in g) der Brötchen einer Bäckerei', 58.6, 3.2]];
const NV_BINOM = [[150, 0.4, 6], [225, 0.2, 6], [144, 0.5, 6], [150, 0.6, 6], [225, 0.8, 6], [400, 0.5, 10], [625, 0.2, 10]];
const NV_UMFRAGE = [
  (n, p, k) => `Bei einer Umfrage antwortet jede der ${n} befragten Personen unabhängig von den anderen mit der Wahrscheinlichkeit ${p} mit „Ja". Berechne mit der Normalverteilung näherungsweise die Wahrscheinlichkeit für <b>höchstens ${k}</b> Ja-Antworten.`,
  (n, p, k) => `Ein Bauteil besteht die Endkontrolle mit der Wahrscheinlichkeit ${p}. Geprüft werden ${n} Bauteile. Berechne mit der Normalverteilung näherungsweise die Wahrscheinlichkeit, dass <b>höchstens ${k}</b> Bauteile die Kontrolle bestehen.`,
];

/**
 * Normalverteilung. Stufe 1: z ganzzahlig · 2: z mit Komma · 3: einseitige Wahrscheinlichkeit über die Sigma-Regeln ·
 * 4: Sachaufgabe mit krummen Werten, Φ-Tabelle und Symmetrie · 5: Binomialverteilung annähern (Stetigkeitskorrektur, Φ-Tabelle).
 */
export function genNormal(lv = 3) {
  for (;;) {
    const P2 = (num, correct, why) => ({ tex: b2pct(num, 2), num, correct, why });
    if (lv >= 5) {
      const [n, p, sg] = pick(NV_BINOM), mu = b2runde(n * p), za = pick(sg === 6 ? [0.25, 0.75, 1.25] : [0.25, 0.75]), z = rand() < 0.5 ? za : -za, k = Math.round(mu + z * sg - 0.5), x = k + 0.5;
      const ph = PHI_TAB[za], r = z > 0 ? ph : b2runde(1 - ph), z0 = (k - mu) / sg;
      const opts = [P2(r, true), P2(b2runde(1 - r), false, z > 0 ? `Das ist die Gegenwahrscheinlichkeit ${tex(`P(X>${k})`)}.` : `Symmetrie vergessen: Für negatives ${tex('z')} gilt ${tex('\\Phi(-z)=1-\\Phi(z)')}.`),
        P2(b2runde(b2Phi(z0), 4), false, `Ohne Stetigkeitskorrektur gerechnet (${tex(`z\\approx${ft(z0)}`)}). Weil ${tex('X')} nur ganze Werte annimmt, reicht „höchstens ${k}" bis ${tex(ft(x))}.`),
        P2(b2runde(2 * ph - 1), false, `Das ist die Wahrscheinlichkeit für die beidseitige Umgebung ${tex(`|Z|\\le ${ft(za)}`)} – hier ist nur eine Seite begrenzt.`)];
      if (!b2versch(opts, 0.011) || !uniq(opts)) continue;
      const tab = Object.keys(PHI_TAB).filter((t) => [0.25, 0.75, 1.25].includes(+t)).map((t) => `\\Phi(${ft(+t)})\\approx${ft(PHI_TAB[t], 4)}`);
      return { prompt: pick(NV_UMFRAGE)(n, fmt(p), k), formula: `\\def\\arraystretch{1.3}\\begin{array}{l}${tab.slice(0, 2).join(',\\quad ')}\\\\${tab[2]}\\end{array}`, options: shuffle(opts),
        hints: [`${tex('X')} ist binomialverteilt: ${tex(`\\mu=n\\cdot p=${n}\\cdot${ft(p)}=${ft(mu)}`)}.`, `${tex(`\\sigma=\\sqrt{n\\cdot p\\cdot(1-p)}=\\sqrt{${ft(n * p * (1 - p))}}=${sg}`)}; wegen ${tex('\\sigma>3')} ist die Näherung brauchbar.`,
          `Stetigkeitskorrektur: ${tex(`P(X\\le ${k})\\approx\\Phi\\!\\left(\\dfrac{${k}+0{,}5-\\mu}{\\sigma}\\right)`)}.`, `${tex(`z=\\dfrac{${ft(x)}-${ft(mu)}}{${sg}}=${ft(z)}`)}.`, z > 0 ? 'Den Wert liest du direkt aus der Tabelle ab.' : `Symmetrie: ${tex(`\\Phi(${ft(z)})=1-\\Phi(${ft(za)})`)}.`],
        explain: `${tex(`\\mu=${n}\\cdot${ft(p)}=${ft(mu)}`)}, ${tex(`\\sigma=\\sqrt{${n}\\cdot${ft(p)}\\cdot${ft(1 - p)}}=${sg}`)}. Mit Stetigkeitskorrektur: ${tex(`z=\\dfrac{${ft(x)}-${ft(mu)}}{${sg}}=${ft(z)}`)}. ${z > 0 ? tex(`P(X\\le ${k})\\approx\\Phi(${ft(z)})\\approx${ft(r, 4)}`) : tex(`P(X\\le ${k})\\approx\\Phi(${ft(z)})=1-\\Phi(${ft(za)})\\approx1-${ft(ph, 4)}=${ft(r, 4)}`)}, also etwa ${tex(b2pct(r, 2))}.`, kind: 'naeherung', mu, sg, x, n, p, k };
    }
    if (lv === 4) {
      const [was, mu, sg] = pick(NV_TEXT), za = pick([0.5, 1, 1.5, 2]), z = rand() < 0.5 ? za : -za, x = b2runde(mu + z * sg, 2), ph = PHI_TAB[za], r = z > 0 ? ph : b2runde(1 - ph);
      const opts = [P2(r, true), P2(b2runde(1 - r), false, z > 0 ? `Das ist die Gegenwahrscheinlichkeit ${tex(`P(X>${ft(x)})`)}.` : `Symmetrie vergessen: Für negatives ${tex('z')} gilt ${tex('\\Phi(-z)=1-\\Phi(z)')}.`),
        P2(b2runde(2 * ph - 1), false, `Das ist die Wahrscheinlichkeit für die beidseitige Umgebung ${tex(`\\mu\\pm${ft(za)}\\sigma`)} – hier ist nur eine Seite begrenzt.`),
        P2(b2runde(ph - 0.5), false, z > 0 ? `Das ist nur die Fläche zwischen ${tex('\\mu')} und ${tex(ft(x))}. Die Hälfte unterhalb von ${tex('\\mu')} fehlt.` : `Das ist die Fläche zwischen ${tex(ft(x))} und ${tex('\\mu')}. Gesucht ist die Fläche links von ${tex(ft(x))}.`)];
      if (!b2versch(opts, 0.011) || !uniq(opts)) continue;
      return { prompt: `${was} ist normalverteilt mit ${tex(`\\mu=${ft(mu)}`)} und ${tex(`\\sigma=${ft(sg)}`)}. Wie groß ist ${tex(`P(X\\le ${ft(x)})`)}?`,
        formula: `\\def\\arraystretch{1.3}\\begin{array}{l}\\Phi(0{,}5)\\approx0{,}6915,\\quad\\Phi(1)\\approx0{,}8413\\\\\\Phi(1{,}5)\\approx0{,}9332,\\quad\\Phi(2)\\approx0{,}9772\\end{array}`, options: shuffle(opts),
        hints: [`Standardisieren: ${tex('z=\\dfrac{x-\\mu}{\\sigma}')}.`, `${tex(`z=\\dfrac{${ft(x)}-${ft(mu)}}{${ft(sg)}}=${ft(z)}`)}.`, z > 0 ? `${tex(`P(X\\le ${ft(x)})=\\Phi(${ft(z)})`)} – aus der Tabelle ablesen.` : `Die Tabelle enthält nur positive ${tex('z')}. Symmetrie: ${tex(`\\Phi(${ft(z)})=1-\\Phi(${ft(za)})`)}.`],
        explain: `${tex(`z=\\dfrac{${ft(x)}-${ft(mu)}}{${ft(sg)}}=${ft(z)}`)}. ${z > 0 ? tex(`P(X\\le ${ft(x)})=\\Phi(${ft(z)})\\approx${ft(r, 4)}`) : tex(`P(X\\le ${ft(x)})=\\Phi(${ft(z)})=1-\\Phi(${ft(za)})\\approx1-${ft(ph, 4)}=${ft(r, 4)}`)}, also etwa ${tex(b2pct(r, 2))}.`, kind: 'tabelle', mu, sg, x };
    }
    const mu = pick([50, 100, 170, 500]), sg = pick(tier(lv, [5, 10], [4, 8, 20], [4, 8, 20]));
    if (lv === 3) {
      const k = pick([-2, -1, 1, 2]), x = mu + k * sg, inner = Math.abs(k) === 1 ? 0.6827 : 0.9545;
      const O = (num, correct, why) => ({ tex: `${ft(num * 100, 1)}\\,\\%`, num, correct, why });
      const opts = [O(PHI[k], true), O(inner, false, `Das ist ${tex(`P(\\mu-${Math.abs(k)}\\sigma\\le X\\le\\mu+${Math.abs(k)}\\sigma)`)} – hier ist nur eine Seite begrenzt.`), O(1 - PHI[k], false, `Das ist die Gegenwahrscheinlichkeit ${tex(`P(X>${x})`)}.`), O(0.5, false, `Das wäre ${tex('P(X\\le\\mu)')}.`)];
      const rest = (1 - inner) * 100;
      return { prompt: `${tex('X')} ist normalverteilt. Wie groß ist ${tex(`P(X\\le ${x})`)} ungefähr?`, formula: `\\mu=${mu},\\quad\\sigma=${sg}`, options: shuffle(opts),
        hints: [`${tex(`${x}=${mu}${k > 0 ? '+' : '-'}${Math.abs(k)}\\cdot${sg}`)}: ${x} liegt ${Math.abs(k)} Standardabweichung${Math.abs(k) > 1 ? 'en' : ''} ${k > 0 ? 'über' : 'unter'} dem Erwartungswert.`, `Sigma-Regel: Die ${Math.abs(k)}σ-Umgebung enthält etwa ${fmt(inner * 100, 1)} %.`, `Der Rest ${tex(`100\\,\\%-${ft(inner * 100, 1)}\\,\\%=${ft(rest, 1)}\\,\\%`)} verteilt sich gleichmäßig auf beide Seiten.`],
        explain: `Außerhalb der ${Math.abs(k)}σ-Umgebung liegen ${tex(`${ft(rest, 1)}\\,\\%`)}, je Seite ${tex(`${ft(rest, 1)}\\,\\%:2\\approx${ft(rest / 2, 1)}\\,\\%`)}. ${k > 0 ? `Unterhalb von ${x} liegt alles außer dem oberen Rand: ${tex(`P(X\\le ${x})\\approx100\\,\\%-${ft(rest / 2, 1)}\\,\\%=${ft(PHI[k] * 100, 1)}\\,\\%`)}.` : `Unterhalb von ${x} liegt nur der untere Rand: ${tex(`P(X\\le ${x})\\approx${ft(PHI[k] * 100, 1)}\\,\\%`)}.`}`, kind: 'phi', mu, sg, x };
    }
    const z = pick(lv <= 1 ? [1, 2, -1, -2] : [1.5, -1.5, 0.5, 2.5, -0.5, -2.5]), x = mu + z * sg;
    const O = (num, correct, why) => ({ tex: `z=${ft(num, 3)}`, num, correct, why });
    const opts = [O(z, true), O(-z, false, `Reihenfolge: ${tex('x-\\mu')}, nicht ${tex('\\mu-x')}.`), O(z / sg, false, `Geteilt wird durch ${tex('\\sigma')}, nicht durch ${tex('\\sigma^2')}.`), O(x / sg, false, `Zuerst ${tex('\\mu')} abziehen, dann durch ${tex('\\sigma')} teilen.`)];
    if (!uniqNum(opts) || !uniq(opts) || !b2fern(opts)) continue;
    return { prompt: `${tex('X')} ist normalverteilt. Welcher standardisierte Wert ${tex('z')} gehört zu ${tex(`x=${ft(x)}`)}?`, formula: `\\mu=${mu},\\quad\\sigma=${sg}`, options: shuffle(opts),
      hints: [`${tex('z=\\dfrac{x-\\mu}{\\sigma}')}.`, `${tex(`x-\\mu=${ft(x - mu)}`)}.`], explain: `${tex(`z=\\dfrac{${ft(x)}-${mu}}{${sg}}=${lv <= 1 ? '' : `\\dfrac{${ft(x - mu)}}{${sg}}=`}${ft(z)}`)}: ${fmt(x)} liegt ${fmt(Math.abs(z))} Standardabweichung${Math.abs(z) === 1 ? '' : 'en'} ${z > 0 ? 'über' : 'unter'} dem Erwartungswert.`, kind: 'z', mu, sg, x };
  }
}

const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
const b2reihe = (n, k) => Array.from({ length: k }, (_, i) => n - i).join('\\cdot');

/** Verkleidete Zählaufgaben für Stufe 5: [Art, n, k, Text, falsche Werte mit Diagnose, Tipps, Erklärung]. */
function kombiVerkleidet() {
  const form = ri(0, 4);
  if (form === 0) {
    const o = ri(3, 7), no = ri(2, 5), n = o + no, k = no;
    return { kind: 'komb', n, k, text: `In einem rechtwinkligen Straßennetz muss ein Kurier ${o} Blöcke nach Osten und ${no} Blöcke nach Norden fahren. Wie viele verschiedene kürzeste Wege gibt es?`,
      falsch: [[o * no, 'Das Produkt zählt die Kreuzungen im Rechteck, nicht die Wege.'], [fact(n) / fact(n - k), `Die ${k} Nord-Schritte sind untereinander nicht unterscheidbar – ihre Reihenfolge darf nicht mitgezählt werden.`], [2 ** n, 'Das wären alle Folgen aus Ost und Nord – erlaubt sind nur die mit genau der richtigen Anzahl von Nord-Schritten.']],
      hints: [`Jeder kürzeste Weg besteht aus ${tex(`${o}+${no}=${n}`)} Schritten.`, `Ein Weg ist festgelegt, sobald feststeht, welche ${k} der ${n} Schritte nach Norden gehen.`, 'Reihenfolge egal, keine Wiederholung: Binomialkoeffizient.'],
      explain: `Jeder Weg hat ${tex(`${o}+${no}=${n}`)} Schritte; gewählt werden die ${k} Plätze für „Nord": ${tex(`\\binom{${n}}{${k}}=\\dfrac{${b2reihe(n, k)}}{${k}!}=${binom(n, k)}`)}.` };
  }
  if (form === 1) {
    const n = ri(8, 18), k = 2;
    return { kind: 'var', n, k, text: `In einer Liga mit ${n} Mannschaften spielt jede gegen jede andere ein Hin- und ein Rückspiel (Heimrecht wechselt). Wie viele Spiele gibt es in einer Saison?`,
      falsch: [[binom(n, 2), 'Das ist nur die Hinrunde: Jede Paarung kommt zweimal vor – einmal mit jedem Heimrecht.'], [n * n, 'Keine Mannschaft spielt gegen sich selbst.'], [2 * n, 'Jede Mannschaft hat viel mehr als zwei Spiele: gegen jede der anderen ein Heim- und ein Auswärtsspiel.']],
      hints: ['Ein Spiel ist ein geordnetes Paar: (Heimmannschaft, Gastmannschaft).', `Für die Heimmannschaft gibt es ${n} Möglichkeiten, für den Gast noch ${n - 1}.`, 'Reihenfolge wichtig, keine Wiederholung.'],
      explain: `Ein Spiel ist ein geordnetes Paar aus Heim- und Gastmannschaft: ${tex(`\\dfrac{${n}!}{${n - 2}!}=${n}\\cdot${n - 1}=${n * (n - 1)}`)}.` };
  }
  if (form === 2) {
    const m = ri(5, 9), n = m - 1;
    return { kind: 'perm', n, k: 2, text: `${m} Personen setzen sich an einen runden Tisch. Zwei Sitzordnungen gelten als gleich, wenn jede Person dieselben Nachbarn links und rechts hat. Wie viele verschiedene Sitzordnungen gibt es?`,
      falsch: [[fact(m), `${tex(`${m}!`)} zählt Reihen. Am runden Tisch ergeben je ${m} Drehungen dieselbe Sitzordnung.`], [fact(m - 2), 'Nur eine Person darf als fester Bezugspunkt gesetzt werden, nicht zwei.'], [m * (m - 1), 'Das zählt nur, wer auf zwei bestimmten Plätzen sitzt.']],
      hints: [`In einer Reihe gäbe es ${tex(`${m}!`)} Anordnungen.`, `Am runden Tisch ist jede Sitzordnung ${m}-mal gezählt (Drehungen).`, `Setze eine Person fest und ordne die übrigen ${n} an.`],
      explain: `Eine Person wird als Bezugspunkt festgesetzt; die übrigen ${n} werden angeordnet: ${tex(`\\dfrac{${m}!}{${m}}=${n}!=${fact(n)}`)}.` };
  }
  if (form === 3) {
    const k = ri(6, 12);
    return { kind: 'mitW', n: 2, k, text: `Eine Pizzeria bietet ${k} Zutaten an. Jede Zutat kann gewählt oder weggelassen werden – auch eine Pizza ganz ohne Zutaten ist erlaubt. Wie viele verschiedene Pizzen sind möglich?`,
      falsch: [[k * k, `Basis und Exponent vertauscht: Für jede der ${k} Zutaten gibt es 2 Möglichkeiten – nicht für jede der 2 Möglichkeiten ${k} Zutaten.`], [2 * k, 'Die Entscheidungen werden multipliziert, nicht addiert (Produktregel des Zählens).'], [2 ** k - 1, 'Die Pizza ohne Zutaten zählt hier ausdrücklich mit.']],
      hints: ['Für jede Zutat gibt es genau zwei Möglichkeiten: drauf oder nicht.', `Die ${k} Entscheidungen sind unabhängig – ihre Anzahlen werden multipliziert.`, 'Das ist ein Ziehen mit Wiederholung und mit Reihenfolge.'],
      explain: `Für jede der ${k} Zutaten gibt es 2 Möglichkeiten: ${tex(`2^{${k}}=${2 ** k}`)}.` };
  }
  const k = ri(3, 4), n = 36;
  return { kind: 'mitW', n, k, text: `Ein Türcode besteht aus ${k} Zeichen. Jedes Zeichen ist einer der 26 Großbuchstaben oder eine der 10 Ziffern; Zeichen dürfen mehrfach vorkommen. Wie viele Codes sind möglich?`,
    falsch: [[26 ** k + 10 ** k, 'So werden nur Codes gezählt, die ganz aus Buchstaben oder ganz aus Ziffern bestehen. Gemischte Codes fehlen.'], [fact(n) / fact(n - k), 'Zeichen dürfen mehrfach vorkommen – die Auswahl wird nicht kleiner.'], [n * k, 'Die Möglichkeiten je Stelle werden multipliziert, nicht addiert.']],
    hints: [`Je Stelle gibt es ${tex('26+10=36')} mögliche Zeichen.`, 'Reihenfolge wichtig, Wiederholung erlaubt.', `Für ${k} Stellen: ${k}-mal mit 36 multiplizieren.`],
    explain: `Je Stelle ${tex('26+10=36')} Zeichen, mit Wiederholung: ${tex(`36^{${k}}=${n ** k}`)}.` };
}

/**
 * Kombinatorik. Stufe 1: Anordnen oder Ziehen mit Wiederholung, kleine Zahlen · 2: Reihenfolge wichtig oder egal ·
 * 3: alle vier Modelle, mit Rechnung · 4: Modell wählen und den Wert ausrechnen · 5: verkleidete Aufgaben (Wege, Liga, runder Tisch …).
 */
export function genKombinatorik(lv = 3) {
  for (;;) {
    const O = (t, num, correct, why) => ({ tex: t, num, correct, why });
    if (lv >= 5) {
      const v = kombiVerkleidet(), want = { perm: fact(v.n), var: fact(v.n) / fact(v.n - v.k), komb: binom(v.n, v.k), mitW: v.n ** v.k }[v.kind];
      const opts = [O(ft(want), want, true), ...v.falsch.map(([num, why]) => O(ft(num), num, false, why))];
      if (!uniqNum(opts) || !uniq(opts) || !b2fern(opts)) continue;
      return { prompt: v.text, options: shuffle(opts), hints: v.hints, explain: v.explain, kind: v.kind, n: v.n, k: v.k };
    }
    const kind = pick(tier(lv, ['perm', 'mitW'], ['var', 'komb'], ['perm', 'var', 'komb', 'mitW'], ['var', 'komb', 'mitW', 'komb']));
    const n = kind === 'perm' ? ri(tier(lv, 3, 4, 5, 6), tier(lv, 5, 6, 8, 9)) : ri(tier(lv, 3, 4, 5, 8), tier(lv, 6, 7, 9, 12)), k = lv <= 2 ? 2 : ri(tier(lv, 2, 2, 2, 3), Math.min(n - 2, tier(lv, 2, 2, 3, 5)));
    let text, opts;
    if (kind === 'perm') {
      text = `Auf wie viele Arten können sich ${n} Personen in einer Reihe aufstellen?`;
      opts = [O(`${n}!`, fact(n), true), O(`${n}^{${n}}`, n ** n, false, 'Das gilt, wenn jede Person mehrfach vorkommen dürfte. Hier steht jede genau einmal.'), O(`\\binom{${n}}{2}`, binom(n, 2), false, 'Das zählt Zweiergruppen, keine Reihenfolgen.'), O(`${n}\\cdot${n - 1}`, n * (n - 1), false, 'Das zählt nur die ersten beiden Plätze.')];
    } else {
      const E = { mitW: [`${n}^{${k}}`, n ** k, 'Das gilt mit Wiederholung: Jede der Stellen kann jeden Wert annehmen.'], var: [`\\dfrac{${n}!}{${n - k}!}`, fact(n) / fact(n - k), 'Das gilt, wenn die Reihenfolge wichtig ist und nichts doppelt vorkommt.'], komb: [`\\binom{${n}}{${k}}`, binom(n, k), 'Das gilt, wenn die Reihenfolge egal ist.'], vert: [`${k}^{${n}}`, k ** n, 'Basis und Exponent sind vertauscht.'] };
      text = { mitW: `Ein Zahlenschloss hat ${k} Stellen, jede kann ${n} verschiedene Zeichen zeigen. Wie viele Einstellungen gibt es?`, var: `Bei einem Rennen starten ${n} Läufer. Wie viele Möglichkeiten gibt es für die Plätze 1 bis ${k}?`, komb: `Aus ${n} Schülern wird ein Team von ${k} gewählt. Wie viele Teams sind möglich?` }[kind];
      opts = Object.keys(E).map((key) => O(lv >= 4 ? ft(E[key][1]) : E[key][0], E[key][1], key === kind, E[key][2]));
    }
    if (!uniqNum(opts) || !uniq(opts) || !b2fern(opts)) continue;
    const r = opts.find((o) => o.correct);
    const modell = { perm: 'Alle werden angeordnet, jede Person genau einmal: Fakultät.', mitW: 'Reihenfolge wichtig, Wiederholung erlaubt: Potenz.', var: 'Reihenfolge wichtig, keine Wiederholung: Fakultäten.', komb: 'Reihenfolge egal, keine Wiederholung: Binomialkoeffizient.' }[kind];
    const rechnung = { perm: `${n}!=${b2reihe(n, n)}=${ft(r.num)}`, mitW: `${n}^{${k}}=${ft(r.num)}`, var: `\\dfrac{${n}!}{${n - k}!}=${b2reihe(n, k)}=${ft(r.num)}`, komb: `\\binom{${n}}{${k}}=\\dfrac{${b2reihe(n, k)}}{${b2reihe(k, k)}}=${ft(r.num)}` }[kind];
    const knapp = { perm: `${n}!=${ft(r.num)}`, mitW: `${n}^{${k}}=${ft(r.num)}`, var: `\\dfrac{${n}!}{${n - k}!}=${ft(r.num)}`, komb: `\\binom{${n}}{${k}}=${ft(r.num)}` }[kind];
    const ansatz = knapp.split('=').slice(0, -1).join('=');
    return { prompt: lv >= 4 ? `${text} Berechne die Anzahl.` : text, options: shuffle(opts),
      hints: lv <= 1 ? ['Zwei Fragen: Ist die Reihenfolge wichtig? Darf etwas mehrfach vorkommen?', modell] : lv <= 2 ? ['Zwei Fragen: Ist die Reihenfolge wichtig? Darf etwas mehrfach vorkommen?', 'Reihenfolge egal: Binomialkoeffizient. Mit Wiederholung: Potenz. Sonst: Fakultäten.', modell]
        : lv === 3 ? ['Zwei Fragen: Ist die Reihenfolge wichtig? Darf etwas mehrfach vorkommen?', 'Reihenfolge egal: Binomialkoeffizient. Mit Wiederholung: Potenz. Sonst: Fakultäten.', modell, `Ansatz: ${tex(ansatz)}.`]
        : ['Zwei Fragen: Ist die Reihenfolge wichtig? Darf etwas mehrfach vorkommen?', modell, `Ansatz: ${tex(ansatz)}.`, kind === 'komb' ? `Kürzen: Oben bleiben die ${k} größten Faktoren, unten steht ${tex(`${k}!`)}: ${tex(rechnung.split('=').slice(1, -1).join('='))}.` : kind === 'var' ? `Kürzen: Es bleibt das Produkt ${tex(b2reihe(n, k))}.` : `Das sind ${k} gleiche Faktoren: ${tex(Array(k).fill(n).join('\\cdot'))}.`],
      explain: lv <= 2 ? `${modell} Hier gilt ${tex(knapp)}.` : `${modell} ${tex(rechnung)}.`, kind, n, k };
  }
}

/* ───────────── Analytische Geometrie ───────────── */

/**
 * Punktprobe: Liegt der Punkt auf der Geraden? Stufe 1: kleines positives t · 2: auch negatives t · 3: t mit Komma, alle drei Zeilen ·
 * 4: Gerade durch zwei Punkte · 5: Punkt mit Parameter a (für welches a liegt er auf der Geraden – oder für keines?).
 */
export function genGeradePunkt(lv = 3) {
  for (;;) {
    const R = tier(lv, 2, 3, 4, 5, 5);
    const P = rv(R), u = nonzeroVec(Math.min(R, 4), 3);
    const t0 = pick(tier(lv, [1, 2, 3], [2, 3, -1, -2, -3], [0.5, 1.5, 2.5, -1.5], [0.5, 1.5, -1.5, 2.5, -2.5], [0.5, 1.5, -1.5, 2.5, -2.5]));
    const zwei = lv >= 4, B = add(P, u);
    const zl = (i, t) => `${ft(P[i])}+${par(t)}\\cdot${par(u[i])}=${ft(P[i] + t * u[i])}`;
    const erste = (Q) => `Erste Zeile: ${tex(`${ft(P[0])}+t\\cdot${par(u[0])}=${ft(Q[0])}`)}, also ${tex(`t=${ft(t0)}`)}.`;
    const richtung = `Richtungsvektor: ${tex(`\\overrightarrow{AB}=${vecTex(u)}`)}, also ${tex(`g:\\ \\vec x=${vecTex(P)}+t\\cdot${vecTex(u)}`)}.`;
    const ansatz = `(Ansatz ${tex('g:\\ \\vec x=\\overrightarrow{OA}+t\\cdot\\overrightarrow{AB}')})`;
    if (lv >= 5) {
      const kons = rand() < 0.7, Q = add(P, u, t0);
      if (!kons) Q[1] += pick([1, -1, 2]);
      const O = (t, correct, why) => ({ tex: t === null ? 'Für kein a' : `a=${ft(P[2] + t * u[2])},\\ t=${ft(t)}`, html: t === null ? `Für keinen Wert von ${tex('a')}.` : undefined, t, correct, why });
      const zeile2 = `${tex(zl(1, t0))}${kons ? ' – passt' : `, verlangt ist aber ${tex(ft(Q[1]))}`}`;
      const opts = [O(t0, kons, `Zweite Zeile prüfen: ${zeile2}. Die ersten beiden Zeilen widersprechen sich – dann hilft kein ${tex('a')}.`),
        O(-t0, false, `Vorzeichen: Aus der ersten Zeile folgt ${tex(`t=${ft(t0)}`)}.`),
        O(t0 + 1, false, `Aus der ersten Zeile folgt ${tex(`t=${ft(t0)}`)}.`),
        O(null, !kons, `Die ersten beiden Zeilen liefern beide ${tex(`t=${ft(t0)}`)}. Die dritte Zeile legt dann ${tex('a')} fest.`)];
      return { prompt: `Die Gerade ${tex('g')} verläuft durch ${tex('A')} und ${tex('B')} ${ansatz}. Für welchen Wert von ${tex('a')} liegt ${tex('Q')} auf ${tex('g')}?`,
        formula: b2zeilen(`${pt('A', P)},\\quad ${pt('B', B)}`, `Q(${ft(Q[0])}\\mid ${ft(Q[1])}\\mid a)`), options: shuffle(opts),
        hints: [richtung, erste(Q), `Zweite Zeile mit diesem ${tex('t')}: ${zeile2}.`, kons ? `Dritte Zeile: ${tex(`a=${zl(2, t0)}`)}.` : `Zeile 1 und 2 verlangen verschiedene ${tex('t')} – die dritte Zeile kann das nicht mehr retten.`],
        explain: `${richtung} ${erste(Q)} Zweite Zeile: ${zeile2}. ${kons ? `Dritte Zeile: ${tex(`a=${zl(2, t0)}`)}. Für dieses ${tex('a')} liegt ${tex('Q')} auf ${tex('g')}.` : `Schon die ersten beiden Zeilen widersprechen sich: ${tex('Q')} liegt für kein ${tex('a')} auf ${tex('g')}.`}`, P, u, Q, kind: 'parameter' };
    }
    const on = rand() < tier(lv, 0.7, 0.55, 0.55, 0.5), j = lv >= 3 ? pick([1, 2]) : 2;
    const Q = add(P, u, t0); if (!on) Q[j] += pick([1, -1, 2]);
    const O = (t, correct, why) => ({ tex: t === null ? 'Nein' : `Ja, für t = ${ft(t)}`, html: t === null ? 'Nein, der Punkt liegt nicht auf der Geraden.' : `Ja, für ${tex(`t=${ft(t)}`)}.`, t, correct, why });
    const opts = [O(t0, on, `Die erste Zeile passt für ${tex(`t=${ft(t0)}`)}, die ${j === 1 ? 'zweite' : 'dritte'} aber nicht: Alle drei Zeilen müssen mit demselben ${tex('t')} stimmen.`),
      O(-t0, false, `Vorzeichen: Aus der ersten Zeile folgt ${tex(`t=${ft(t0)}`)}.`),
      O(t0 + 1, false, `Aus der ersten Zeile folgt ${tex(`t=${ft(t0)}`)}.`),
      O(null, !on, `Setze ${tex(`t=${ft(t0)}`)} ein: Alle drei Zeilen stimmen.`)];
    const stand = (i) => `${tex(zl(i, t0))}${P[i] + t0 * u[i] === Q[i] ? ' – passt' : `, verlangt ist aber ${tex(ft(Q[i]))}`}`;
    const fazit = on ? `Alle drei Zeilen stimmen für ${tex(`t=${ft(t0)}`)} – ${tex('Q')} liegt auf ${tex('g')}.` : `Die ${j === 1 ? 'zweite' : 'dritte'} Zeile widerspricht – ${tex('Q')} liegt nicht auf ${tex('g')}.`;
    return { prompt: zwei ? `Die Gerade ${tex('g')} verläuft durch ${tex('A')} und ${tex('B')} ${ansatz}. Liegt der Punkt ${tex('Q')} auf ${tex('g')}?` : `Liegt der Punkt ${tex(pt('Q', Q))} auf der Geraden?`,
      formula: zwei ? b2zeilen(`${pt('A', P)},\\quad ${pt('B', B)}`, pt('Q', Q)) : lineVecTex(P, u), options: shuffle(opts),
      hints: lv <= 1 ? [`Bestimme ${tex('t')} aus der ersten Zeile.`, 'Prüfe damit die zweite und die dritte Zeile.']
        : lv === 2 ? [`Erste Zeile: ${tex(`${ft(P[0])}+t\\cdot${par(u[0])}=${ft(Q[0])}`)}. Löse nach ${tex('t')} auf.`, `Prüfe mit diesem ${tex('t')} die zweite und die dritte Zeile – alle müssen stimmen.`]
          : [...(zwei ? [richtung] : []), erste(Q), `Zweite Zeile: ${stand(1)}.`, `Dritte Zeile: ${stand(2)}.`],
      explain: lv <= 1 ? (on ? `Für ${tex(`t=${ft(t0)}`)} stimmen alle drei Zeilen – ${tex('Q')} liegt auf ${tex('g')}.` : `Die ersten beiden Zeilen liefern ${tex(`t=${ft(t0)}`)}, die dritte aber einen Widerspruch – ${tex('Q')} liegt nicht auf ${tex('g')}.`)
        : lv === 2 ? `${erste(Q)} ${on ? '' : `Dritte Zeile: ${stand(2)}. `}${fazit}` : `${zwei ? `${richtung} ` : ''}${erste(Q)} Zweite Zeile: ${stand(1)}. Dritte Zeile: ${stand(2)}. ${fazit}`,
      P, u, Q };
  }
}

/**
 * Welcher Punkt liegt in der Ebene? Stufe 1: Koordinatenform mit zwei Koeffizienten · 2: drei Koeffizienten · 3: Normalenform ·
 * 4: Parameterform (Normalenvektor über das Kreuzprodukt) · 5: Ebene durch drei Punkte.
 */
export function genEbene(lv = 3) {
  for (;;) {
    let n, S0 = null, sa = null, sb = null;
    if (lv >= 4) {
      sa = nonzeroVec(lv >= 5 ? 3 : 2, 2); sb = nonzeroVec(lv >= 5 ? 3 : 2, 2); n = cross(sa, sb); S0 = rv(3);
      if (n.filter((c) => c !== 0).length < 2 || n.some((c) => Math.abs(c) > 14)) continue;
    } else n = lv <= 1 ? shuffle([ri(1, 2), ri(1, 3), 0]) : nonzeroVec(3, 3);
    const S = lv >= 4 ? add(add(S0, sa, pick([1, -1, 2])), sb, pick([1, -1, 2, -2])) : rv(lv <= 1 ? 3 : 4), d = dot(n, S);
    const others = [];
    for (let guard = 0; others.length < 3 && guard < 60; guard++) {
      const X = add(S, pick([[1, 0, 0], [0, 1, 0], [0, 0, 1], [1, 1, 0], [0, -1, 1], [-1, 0, 1], [1, -1, 0]]), pick([1, -1, 2]));
      if (dot(n, X) !== d && !others.some((o) => same(o, X))) others.push(X);
    }
    if (others.length < 3) continue;
    const O = (X, correct) => ({ tex: pt('P', X), vec: X, correct, why: correct ? undefined : `Einsetzen ergibt ${tex(ft(dot(n, X)))}, nicht ${tex(ft(d))}.` });
    const probe = `${tex(`${b2skalar(n, S)}=${ft(d)}`)} – der Punkt ${tex(pt('P', S))} erfüllt die Gleichung.`;
    const koord = `E:\\ ${planeTex(n, d)}`;
    let prompt = 'Welcher Punkt liegt in der Ebene?', formula = koord, hints, explain;
    if (lv <= 2) {
      hints = ['Punktprobe: Koordinaten in die Gleichung einsetzen.', 'Nur wenn links genau die rechte Seite herauskommt, liegt der Punkt in der Ebene.'];
      explain = lv <= 1 ? `${tex(`${b2skalar(n, S)}=${ft(d)}`)} – der Punkt erfüllt die Gleichung.` : `Punktprobe: ${probe} Bei den anderen Punkten kommt nicht ${tex(ft(d))} heraus.`;
    } else if (lv === 3) {
      const p0 = add(S, [n[1], -n[0], 0], pick([1, -1])), weg = `${tex(`\\vec n\\cdot\\vec p=${b2skalar(n, p0)}=${ft(d)}`)}, also ${tex(koord)}`;
      formula = `E:\\ \\left[\\vec x-${vecTex(p0)}\\right]\\cdot${vecTex(n)}=0`;
      hints = [`Normalenform ausmultiplizieren: ${tex('\\vec n\\cdot\\vec x=\\vec n\\cdot\\vec p')}.`, `Skalarprodukt: ${weg}.`, 'Punktprobe: Koordinaten in diese Gleichung einsetzen.'];
      explain = `Ausmultiplizieren (Skalarprodukt): ${weg}. Punktprobe: ${probe}`;
    } else {
      const A = S0, B = add(S0, sa), C = add(S0, sb);
      const aus = (X) => `\\begin{pmatrix}${X.map((c, i) => `${ft(c)}-${par(A[i])}`).join('\\\\')}\\end{pmatrix}`;
      const spann = `Spannvektoren: ${tex(`\\overrightarrow{AB}=${aus(B)}=${vecTex(sa)}`)}, ${tex(`\\overrightarrow{AC}=${aus(C)}=${vecTex(sb)}`)}.`;
      const normal = `Normalenvektor über das Kreuzprodukt${lv >= 5 ? '' : ' der Spannvektoren'}: ${tex(`\\vec n=${b2kreuz(sa, sb)}=${vecTex(n)}`)}.`;
      const rechts = `Rechte Seite mit dem ${lv >= 5 ? `Punkt ${tex('A')}` : 'Stützvektor'}: ${tex(`${b2skalar(n, S0)}=${ft(d)}`)}, also ${tex(koord)}.`;
      if (lv >= 5) { prompt = `Welcher Punkt liegt in der Ebene durch ${tex('A')}, ${tex('B')} und ${tex('C')}?`; formula = b2zeilen(`${pt('A', A)},\\quad ${pt('B', B)}`, pt('C', C)); }
      else formula = `E:\\ \\vec x=${vecTex(S0)}+r\\cdot${vecTex(sa)}+s\\cdot${vecTex(sb)}`;
      hints = [...(lv >= 5 ? [spann] : ['Wandle die Parameterform in eine Koordinatenform um – dann genügt Einsetzen.']), normal, rechts, 'Punktprobe: Koordinaten der vier Punkte in diese Gleichung einsetzen.'];
      explain = `${lv >= 5 ? `${spann} ` : ''}${normal} ${rechts} Punktprobe: ${probe}`;
    }
    return { prompt, formula, options: shuffle([O(S, true), ...others.map((X) => O(X, false))]), hints, explain, n, d };
  }
}

/**
 * Lage zweier Geraden. Stufe 1: auf einen Blick (gleicher Stützpunkt oder Vielfache) · 2: Punktprobe bzw. kleines Gleichungssystem ·
 * 3: alle vier Fälle mit Gleichsetzen · 4: Geraden durch je zwei Punkte · 5: Geradenschar – für welches a schneiden sich die Geraden?
 */
export function genLage(lv = 3) {
  for (;;) {
    const R = tier(lv, 2, 2, 3, 4, 3);
    const kind = lv >= 5 ? 'schnitt' : pick(tier(lv, ['identisch', 'parallel', 'schnitt'], ['identisch', 'parallel', 'schnitt'], ['identisch', 'parallel', 'schnitt', 'windschief', 'windschief'], ['identisch', 'parallel', 'schnitt', 'schnitt', 'windschief', 'windschief']));
    const P = rv(R), u = nonzeroVec(Math.min(R, 3), 2), par_ = kind === 'identisch' || kind === 'parallel', i0 = u.findIndex((c) => c !== 0);
    let v, Q, S = null, t0 = 0, s0 = 0, kf = 1, k0 = 0, r = -1;
    if (par_) {
      kf = pick(lv <= 1 ? [2, -1] : [2, -1, -2, 3]); v = u.map((c) => c * kf);
      k0 = lv <= 1 ? 0 : pick([1, 2, -1, -2]); Q = add(P, u, k0);
      if (kind === 'parallel') { r = pick([0, 1, 2].filter((i) => i !== i0)); const w = [0, 0, 0]; w[r] = pick([1, 2, -1]); if (zero(cross(w, u))) continue; Q = add(Q, w); }
    } else {
      v = nonzeroVec(Math.min(R, 3), 2); const n = cross(u, v); if (zero(n)) continue;
      r = pick([0, 1, 2].filter((i) => n[i] !== 0));
      if (lv >= 2) { t0 = pick(lv >= 5 ? [0.5, 1.5, -0.5, -1.5, 2.5] : lv === 2 ? [1, 2] : [1, 2, -1, -2, 3]); s0 = pick(lv >= 5 ? [0.5, 1.5, -0.5, -1.5, -2.5] : lv === 2 ? [1, -1] : [1, 2, -1, -2, -3]); }
      S = add(P, u, t0); Q = add(S, v, -s0);
      if (kind === 'windschief') Q[r] += pick([1, -1, 2]);
    }
    const B = add(P, u), D = add(Q, v), zwei = lv === 4;
    if ([Q, B, D].some((X) => X.some((c) => Math.abs(c) > 15))) continue;
    const L = { identisch: 'identisch', parallel: 'echt parallel', schnitt: 'Sie schneiden sich in einem Punkt.', windschief: 'windschief' };
    const richtung = zwei ? `Richtungsvektoren: ${tex(`\\overrightarrow{AB}=${vecTex(u)}`)}, ${tex(`\\overrightarrow{CD}=${vecTex(v)}`)}. ` : '';
    const [ia, ib] = [0, 1, 2].filter((i) => i !== r);
    const gl = (i, rechts = ft(Q[i])) => `${ft(P[i])}${b2glied(u[i], 't')}=${rechts}${b2glied(v[i], 's')}`;
    if (lv >= 5) {
      if (v[r] === 0) continue;
      const O = (x, correct, why) => ({ tex: `a=${ft(x)}`, key: correct ? 'schnitt' : 'windschief', correct, why });
      const opts = [O(Q[r], true), O(S[r] + s0 * v[r], false, `Vorzeichen beim Umstellen: Der Anteil ${tex(`${par(s0)}\\cdot${par(v[r])}`)} wird abgezogen. Für dieses ${tex('a')} sind die Geraden windschief.`),
        O(S[r], false, `Hier fehlt der Anteil ${tex(`s\\cdot${par(v[r])}`)} der Geraden ${tex('h_a')}. Für dieses ${tex('a')} sind die Geraden windschief.`),
        O(P[r], false, `Die Stützvektoren müssen nicht übereinstimmen – entscheidend ist ein gemeinsamer Punkt. Für dieses ${tex('a')} sind die Geraden windschief.`)];
      if (!uniq(opts)) continue;
      const Qa = Q.map((c, i) => (i === r ? 'a' : ft(c)));
      const zeileA = `${ft(P[r])}+${par(t0)}\\cdot${par(u[r])}=a+${par(s0)}\\cdot${par(v[r])}`;
      return { prompt: `Für welchen Wert von ${tex('a')} schneiden sich die Geraden ${tex('g')} und ${tex('h_a')}?`,
        formula: b2zeilen(lineVecTex(P, u, 'g', 't'), `h_a:\\ \\vec x=\\begin{pmatrix}${Qa.join('\\\\')}\\end{pmatrix}+s\\cdot${vecTex(v)}`),
        options: shuffle(opts),
        hints: ['Die Richtungsvektoren sind keine Vielfachen voneinander: Die Geraden schneiden sich oder sind windschief.', `Gleichsetzen. Die Zeilen ${ia + 1} und ${ib + 1} enthalten kein ${tex('a')}: ${tex(gl(ia))} und ${tex(gl(ib))}.`,
          `Dieses Gleichungssystem hat die Lösung ${tex(`t=${ft(t0)}`)}, ${tex(`s=${ft(s0)}`)}.`, `Zeile ${r + 1} muss damit auch stimmen: ${tex(zeileA)}.`],
        explain: `Gleichsetzen: Aus ${tex(gl(ia))} und ${tex(gl(ib))} folgt ${tex(`t=${ft(t0)}`)}, ${tex(`s=${ft(s0)}`)}. Zeile ${r + 1}: ${tex(zeileA)}, also ${tex(`a=${ft(S[r])}-${par(s0 * v[r])}=${ft(Q[r])}`)}. Die Geraden schneiden sich dann in ${tex(pt('S', S))}; für jedes andere ${tex('a')} sind sie windschief.`,
        P, u, Q, v, kind };
    }
    const why = (k) => {
      if (par_ && (k === 'schnitt' || k === 'windschief')) return 'Die Richtungsvektoren sind Vielfache voneinander – die Geraden sind parallel oder identisch.';
      if (!par_ && (k === 'identisch' || k === 'parallel')) return 'Die Richtungsvektoren sind keine Vielfachen voneinander.';
      if (kind === 'parallel') return `Punktprobe: Der Stützpunkt von ${tex('h')} liegt nicht auf ${tex('g')}.`;
      if (kind === 'identisch') return `Punktprobe: Der Stützpunkt von ${tex('h')} liegt auf ${tex('g')} – die Geraden sind identisch.`;
      if (kind === 'windschief') return 'Gleichsetzen führt zu einem Widerspruch: Es gibt keinen gemeinsamen Punkt.';
      return `Gleichsetzen ist lösbar: Die Geraden treffen sich in ${tex(pt('S', S))}.`;
    };
    let hints, explain;
    if (par_) {
      const vielfach = `${richtung}${tex(`${vecTex(v)}=${par(kf)}\\cdot${vecTex(u)}`)}: Die Richtungsvektoren sind Vielfache – parallel oder identisch.`;
      const zl = (i) => `${ft(P[i])}+${par(k0)}\\cdot${par(u[i])}=${ft(P[i] + k0 * u[i])}`;
      const stuetz = zwei ? tex('C') : `der Stützpunkt von ${tex('h')}`, stuetzMit = zwei ? tex('C') : `dem Stützpunkt von ${tex('h')}`;
      const probe = kind === 'identisch' ? (lv <= 1 ? 'Beide Geraden haben denselben Stützpunkt: identisch.' : `Punktprobe mit ${tex(pt(zwei ? 'C' : 'Q', Q))}: Zeile ${i0 + 1} liefert ${tex(`t=${ft(k0)}`)}, und damit stimmen auch die anderen Zeilen – ${stuetz} liegt auf ${tex('g')}: identisch.`)
        : `Punktprobe mit ${tex(pt(zwei ? 'C' : 'Q', Q))}: Zeile ${i0 + 1} liefert ${tex(`t=${ft(k0)}`)}. Zeile ${r + 1}: ${tex(zl(r))}, verlangt ist aber ${tex(ft(Q[r]))} – ${stuetz} liegt nicht auf ${tex('g')}: echt parallel.`;
      hints = lv <= 1 ? ['Erster Schritt: Sind die Richtungsvektoren Vielfache voneinander?', kind === 'identisch' ? 'Vergleiche dann die Stützpunkte.' : 'Dann entscheidet die Punktprobe zwischen parallel und identisch.']
        : ['Erster Schritt: Sind die Richtungsvektoren Vielfache voneinander?', vielfach, `Punktprobe mit ${stuetzMit}: Zeile ${i0 + 1} lautet ${tex(`${ft(P[i0])}+t\\cdot${par(u[i0])}=${ft(Q[i0])}`)}.`, 'Stimmen mit diesem t alle drei Zeilen, sind die Geraden identisch – sonst echt parallel.'];
      explain = lv <= 1 ? `Die Richtungsvektoren sind Vielfache. ${kind === 'identisch' ? 'Beide Geraden haben denselben Stützpunkt: identisch.' : 'Der Stützpunkt von h liegt nicht auf g: echt parallel.'}` : `${vielfach} ${probe}`;
    } else if (lv <= 1) {
      hints = ['Erster Schritt: Sind die Richtungsvektoren Vielfache voneinander?', 'Vergleiche dann die Stützpunkte.'];
      explain = `Die Richtungsvektoren sind keine Vielfachen. Beide Geraden haben denselben Stützpunkt ${tex(pt('S', S))} – dort schneiden sie sich.`;
    } else {
      const li = ft(P[r] + t0 * u[r]), re = ft(Q[r] + s0 * v[r]);
      const dritte = `Zeile ${r + 1}: links ${tex(`${ft(P[r])}+${par(t0)}\\cdot${par(u[r])}=${li}`)}, rechts ${tex(`${ft(Q[r])}+${par(s0)}\\cdot${par(v[r])}=${re}`)}`;
      hints = [`${richtung}Die Richtungsvektoren sind keine Vielfachen voneinander – also Schnittpunkt oder windschief.`, `Gleichsetzen, Zeilen ${ia + 1} und ${ib + 1}: ${tex(gl(ia))} und ${tex(gl(ib))}.`, `Daraus folgt ${tex(`t=${ft(t0)}`)} und ${tex(`s=${ft(s0)}`)}.`, `Probe in der übrigen Zeile: ${dritte}.`];
      explain = `${richtung}Die Richtungsvektoren sind keine Vielfachen. Gleichsetzen: Aus ${tex(gl(ia))} und ${tex(gl(ib))} folgt ${tex(`t=${ft(t0)}`)}, ${tex(`s=${ft(s0)}`)}. ${dritte}. ${kind === 'schnitt' ? `Das stimmt überein: Schnittpunkt ${tex(pt('S', S))}.` : 'Widerspruch – kein gemeinsamer Punkt: windschief.'}`;
    }
    return { prompt: zwei ? `${tex('g')} verläuft durch ${tex('A')} und ${tex('B')}, ${tex('h')} durch ${tex('C')} und ${tex('D')}. Wie liegen die Geraden zueinander?` : 'Wie liegen die beiden Geraden zueinander?',
      formula: zwei ? b2zeilen(`g:\\ ${pt('A', P)},\\ ${pt('B', B)}`, `h:\\ ${pt('C', Q)},\\ ${pt('D', D)}`) : `\\begin{array}{l}${lineVecTex(P, u, 'g', 't')}\\\\[6pt]${lineVecTex(Q, v, 'h', 's')}\\end{array}`,
      options: shuffle(Object.keys(L).map((k) => ({ tex: L[k], html: L[k], key: k, correct: k === kind, why: why(k) }))), hints, explain, P, u, Q, v, kind };
  }
}

/**
 * Schnittpunkt von Gerade und Ebene. Stufe 1: Ebene parallel zu einer Koordinatenebene · 2: zwei Koeffizienten · 3: drei Koeffizienten, auch negatives t ·
 * 4: Gerade durch zwei Punkte, t mit Komma · 5: Ebene in Parameterform (Kreuzprodukt), krummes t.
 */
export function genSchnittpunkt(lv = 3) {
  for (;;) {
    const R = tier(lv, 2, 2, 3, 4, 4);
    let n, S0 = null, sa = null, sb = null;
    if (lv >= 5) { sa = nonzeroVec(2, 2); sb = nonzeroVec(2, 2); n = cross(sa, sb); S0 = rv(3); if (n.filter((c) => c !== 0).length < 2 || n.some((c) => Math.abs(c) > 9)) continue; }
    else n = lv <= 1 ? shuffle([1, 0, 0]) : nonzeroVec(Math.min(R, 3), lv === 2 ? 2 : 3);
    if (lv === 2 && n.every((c) => c !== 0)) n[ri(0, 2)] = 0;
    const u = nonzeroVec(Math.min(R, 3), 2), nu = dot(n, u), P = rv(R);
    if (nu === 0) continue;
    let t0, d;
    if (lv >= 5) { d = dot(n, S0); t0 = (d - dot(n, P)) / nu; if (!Number.isInteger(t0 * 4) || Number.isInteger(t0) || Math.abs(t0) > 3) continue; }
    else { t0 = pick(tier(lv, [1, 2, 3], [1, 2, -1, 3], [2, -2, 3, -3, -1, 4], [0.5, 1.5, -1.5, 2.5, -2.5])); d = dot(n, P) + t0 * nu; if (!Number.isInteger(d)) continue; }
    const S = add(P, u, t0), tAlt = -t0 === t0 + 1 ? t0 - 1 : t0 + 1, zwei = lv === 4, B = add(P, u);
    if ([P, S, B].some((X) => X.some((c) => Math.abs(c) > 14)) || (lv >= 4 && S.every(Number.isInteger))) continue;
    const O = (X, correct, why) => ({ tex: pt('S', X), vec: X, correct, why });
    const opts = [O(S, true), O(add(P, u, -t0), false, `Vorzeichen beim Auflösen: ${tex(`t=${ft(t0)}`)}, nicht ${tex(`t=${ft(-t0)}`)}.`),
      O(add(P, u, tAlt), false, `Probe: Einsetzen in ${tex('E')} ergibt ${tex(ft(dot(n, add(P, u, tAlt))))}, nicht ${tex(ft(d))}.`),
      O(P, false, zwei ? `Das ist der Punkt ${tex('A')} (${tex('t=0')}). Er liegt nicht in ${tex('E')}.` : `Das ist der Stützpunkt (${tex('t=0')}). Er liegt nicht in ${tex('E')}.`)];
    if (opts.some((a, i) => opts.some((b, j) => i < j && same(a.vec, b.vec)))) continue;
    const koord = `E:\\ ${planeTex(n, d)}`, nP = dot(n, P);
    const einsetzen = `${n.map((c, i) => (c === 0 ? null : `${par(c)}\\cdot(${ft(P[i])}${b2glied(u[i], 't')})`)).filter(Boolean).join('+')}=${ft(d)}`;
    const zusammen = `${ft(nP)}${b2glied(nu, 't')}=${ft(d)}`;
    const punkt = `\\vec s=${vecTex(P)}+${par(t0)}\\cdot${vecTex(u)}=${vecTex(S)}`;
    const richtung = `Richtungsvektor: ${tex(`\\overrightarrow{AB}=${vecTex(u)}`)}, also ${tex(`g:\\ \\vec x=${vecTex(P)}+t\\cdot${vecTex(u)}`)}.`;
    const normal = lv >= 5 ? [`Normalenvektor über das Kreuzprodukt der Spannvektoren: ${tex(`\\vec n=${b2kreuz(sa, sb)}=${vecTex(n)}`)}.`, `Rechte Seite mit dem Stützvektor: ${tex(`${b2skalar(n, S0)}=${ft(d)}`)}, also ${tex(koord)}.`] : [];
    return { prompt: zwei ? `Die Gerade ${tex('g')} verläuft durch ${tex('A')} und ${tex('B')}. In welchem Punkt schneidet sie die Ebene ${tex('E')}?` : `In welchem Punkt schneidet die Gerade ${tex('g')} die Ebene ${tex('E')}?`,
      formula: zwei ? b2zeilen(koord, `${pt('A', P)},\\quad ${pt('B', B)}`) : lv >= 5 ? b2zeilen(`E:\\ \\vec x=${vecTex(S0)}+r\\cdot${vecTex(sa)}+s\\cdot${vecTex(sb)}`, lineVecTex(P, u)) : `\\begin{array}{l}${koord}\\\\[6pt]${lineVecTex(P, u)}\\end{array}`,
      options: shuffle(opts),
      hints: lv <= 1 ? [`Setze die passende Zeile von ${tex('g')} in ${tex('E')} ein.`, `Es ergibt sich ${tex(`t=${ft(t0)}`)}. Setze das in ${tex('g')} ein.`]
        : lv === 2 ? [`Setze die Zeilen von ${tex('g')} für ${tex('x_1, x_2, x_3')} in ${tex('E')} ein.`, `${tex(einsetzen)}.`, `Es ergibt sich ${tex(`t=${ft(t0)}`)}. Setze das in ${tex('g')} ein.`]
          : [...(zwei ? [richtung] : []), ...normal, `Setze die Zeilen von ${tex('g')} in ${tex('E')} ein: ${tex(einsetzen)}.`, `Zusammenfassen: ${tex(zusammen)}, also ${tex(`t=${ft(t0)}`)}.`, `Setze ${tex(`t=${ft(t0)}`)} in ${tex('g')} ein.`],
      explain: lv <= 1 ? `Einsetzen liefert ${tex(`t=${ft(t0)}`)} und damit ${tex(pt('S', S))}.`
        : lv === 2 ? `Einsetzen: ${tex(einsetzen)}, also ${tex(`t=${ft(t0)}`)} und damit ${tex(pt('S', S))}.`
          : `${zwei ? `${richtung} ` : ''}${normal.join(' ')}${normal.length ? ' ' : ''}Einsetzen: ${tex(einsetzen)}. Zusammenfassen: ${tex(zusammen)}, also ${tex(`t=${ft(t0)}`)}. ${tex(punkt)}, also ${tex(pt('S', S))}.`, n, d, P, u };
  }
}

const ABST_TEXT = [
  ['Ein Sonnensegel ist zwischen den Punkten', 'gespannt (Einheit: Meter). Eine Lampe hängt im Punkt', 'Wie weit ist die Lampe von der Ebene des Segels entfernt?'],
  ['Eine schräge Dachfläche liegt in der Ebene durch die Punkte', '(Einheit: Meter). Die Spitze einer Antenne befindet sich im Punkt', 'Wie groß ist der Abstand der Antennenspitze von der Dachebene?'],
  ['Ein Hang wird durch die Ebene durch die Punkte', 'beschrieben (Einheit: 10 Meter). Eine Drohne schwebt im Punkt', 'Wie groß ist ihr Abstand von der Hangebene?'],
];

/**
 * Abstand. Stufe 1–2: zwei Punkte · 3: Punkt–Ebene mit glattem Normalenvektor (Hesse-Formel) · 4: krumme Länge des Normalenvektors ·
 * 5: Sachaufgabe, Ebene durch drei Punkte (Kreuzprodukt, Koordinatenform, Hesse-Formel).
 */
export function genAbstand(lv = 3) {
  for (;;) {
    const mk = (num, correct, why) => ({ tex: ft(num), num, correct, why });
    if (lv <= 2) {
      const [w, len] = tripVec(lv <= 1 ? 1 : 5), A = rv(lv <= 1 ? 2 : 4), B = add(A, w), abs = w.map(Math.abs);
      const opts = [mk(len, true), mk(abs[0] + abs[1] + abs[2], false, 'Die Koordinaten-Unterschiede werden quadriert, addiert – und dann die Wurzel gezogen.'), mk(len * len, false, 'Hier fehlt die Wurzel.'), mk(Math.max(...abs), false, 'Der Abstand ist größer als jeder einzelne Koordinaten-Unterschied.')];
      if (!uniqNum(opts) || !b2fern(opts)) continue;
      return { prompt: `Wie weit sind die Punkte ${tex('A')} und ${tex('B')} voneinander entfernt?`, formula: `${pt('A', A)},\\quad ${pt('B', B)}`, options: shuffle(opts),
        hints: lv <= 1 ? [`Abstand = Länge von ${tex('\\overrightarrow{AB}')}.`, `${tex(`\\overrightarrow{AB}=${vecTex(w)}`)}.`] : [`Abstand = Länge von ${tex('\\overrightarrow{AB}')}.`, `${tex(`\\overrightarrow{AB}=${vecTex(w)}`)}.`, `${tex(`|\\overrightarrow{AB}|=\\sqrt{${b2quadrate(w)}}=\\sqrt{${len * len}}`)}.`],
        explain: `${tex(`|\\overrightarrow{AB}|=\\sqrt{${b2quadrate(w)}}=${lv <= 1 ? '' : `\\sqrt{${len * len}}=`}${len}`)}.`, kind: 'punkte', A, B };
    }
    if (lv === 3) {
      const [n, L] = tripVec(lv), S = rv(3), d = dot(n, S), k = pick([1, 2, -1, -2, 3]);
      const P = add(add(S, n, k), [n[1], -n[0], 0], pick([0, 1, -1]));
      if (P.some((c) => Math.abs(c) > 30)) continue;
      const num = Math.abs(dot(n, P) - d);
      const opts = [mk(num / L, true), mk(num, false, `Es fehlt das Teilen durch die Länge des Normalenvektors ${tex(`|\\vec n|=${L}`)}.`), mk(Math.abs(dot(n, P) + d) / L, false, `Vorzeichen: Im Zähler steht ${tex('|\\vec n\\cdot\\vec p-d|')}.`), mk(num / (L * L), false, `Geteilt wird durch ${tex('|\\vec n|')}, nicht durch ${tex('|\\vec n|^2')}.`)];
      if (!uniqNum(opts) || !uniq(opts) || !b2fern(opts)) continue;
      return { prompt: `Wie groß ist der Abstand des Punktes ${tex('P')} von der Ebene ${tex('E')}?`, formula: `E:\\ ${planeTex(n, d)},\\quad ${pt('P', P)}`, options: shuffle(opts),
        hints: [`Hesse-Formel: ${tex('d(P;E)=\\dfrac{|n_1p_1+n_2p_2+n_3p_3-d|}{|\\vec n|}')}.`, `${tex(`|\\vec n|=\\sqrt{${b2quadrate(n)}}=${L}`)}.`, `Zähler: ${tex(`|${b2skalar(n, P)}-${par(d)}|=${ft(num)}`)}.`],
        explain: `Hesse-Formel: ${tex(`d(P;E)=\\dfrac{|${ft(dot(n, P))}-${par(d)}|}{${L}}=\\dfrac{${ft(num)}}{${L}}=${ft(num / L)}`)}.`, kind: 'ebene', n, d, P };
    }
    let n, S0, sa = null, sb = null;
    if (lv >= 5) { sa = nonzeroVec(3, 2); sb = nonzeroVec(3, 2); n = cross(sa, sb); S0 = rv(3); if (n.filter((c) => c !== 0).length < 2 || n.some((c) => Math.abs(c) > 12)) continue; }
    else { n = nonzeroVec(4, 3); S0 = rv(3); }
    const L2 = dot(n, n), L = Math.sqrt(L2), d = dot(n, S0), P = rv(6), num = Math.abs(dot(n, P) - d);
    if (Number.isInteger(L) || num === 0 || d === 0) continue;
    const W = (z, correct, why) => ({ tex: `\\dfrac{${ft(z)}}{\\sqrt{${L2}}}\\approx${ft(z / L)}`, num: z / L, correct, why });
    const AP = P.map((c, i) => c - S0[i]), ap2 = dot(AP, AP);
    const opts = [W(num, true), mk(num, false, `Es fehlt das Teilen durch die Länge des Normalenvektors ${tex(`|\\vec n|=\\sqrt{${L2}}`)}.`),
      lv >= 5 ? { tex: `${b2laenge(ap2)}${Number.isInteger(Math.sqrt(ap2)) ? '' : `\\approx${ft(Math.sqrt(ap2))}`}`, num: Math.sqrt(ap2), correct: false, why: `Das ist die Strecke ${tex('|\\overrightarrow{AP}|')} zum Punkt ${tex('A')}. Der Abstand zur Ebene wird senkrecht gemessen und ist kürzer.` }
        : W(Math.abs(dot(n, P) + d), false, `Vorzeichen: Im Zähler steht ${tex('|\\vec n\\cdot\\vec p-d|')}.`),
      { tex: `\\dfrac{${ft(num)}}{${L2}}\\approx${ft(num / L2)}`, num: num / L2, correct: false, why: `Geteilt wird durch ${tex(`|\\vec n|=\\sqrt{${L2}}`)}, nicht durch ${tex(`|\\vec n|^2=${L2}`)}.` }];
    if (!b2fern(opts) || !uniq(opts)) continue;
    const koord = `E:\\ ${planeTex(n, d)}`;
    const laenge = `${tex(`|\\vec n|=\\sqrt{${b2quadrate(n)}}=\\sqrt{${L2}}`)}`, zaehler = `${tex(`|${b2skalar(n, P)}-${par(d)}|=|${ft(dot(n, P))}-${par(d)}|=${ft(num)}`)}`;
    const ende = `${tex(`d(P;E)=\\dfrac{${ft(num)}}{\\sqrt{${L2}}}\\approx${ft(num / L)}`)}`;
    if (lv === 4) return { prompt: `Wie groß ist der Abstand des Punktes ${tex('P')} von der Ebene ${tex('E')}?`, formula: b2zeilen(koord, pt('P', P)), options: shuffle(opts),
      hints: [`Hesse-Formel: ${tex('d(P;E)=\\dfrac{|n_1p_1+n_2p_2+n_3p_3-d|}{|\\vec n|}')}.`, `Länge des Normalenvektors: ${laenge}.`, `Zähler: ${zaehler}.`, 'Die Wurzel im Nenner bleibt stehen – oder du gibst einen Näherungswert an.'],
      explain: `Hesse-Formel. Länge des Normalenvektors: ${laenge}. Zähler: ${zaehler}. Also ${ende}.`, kind: 'ebene', n, d, P };
    const A = S0, B = add(S0, sa), C = add(S0, sb), T = pick(ABST_TEXT);
    const spann = `Spannvektoren: ${tex(`\\overrightarrow{AB}=${vecTex(sa)}`)}, ${tex(`\\overrightarrow{AC}=${vecTex(sb)}`)}.`;
    const normal = `Normalenvektor über das Kreuzprodukt: ${tex(`\\vec n=${b2kreuz(sa, sb)}=${vecTex(n)}`)}.`;
    const rechts = `Koordinatenform mit ${tex('A')}: ${tex(`${b2skalar(n, A)}=${ft(d)}`)}, also ${tex(koord)}.`;
    return { prompt: `${T[0]} ${tex('A')}, ${tex('B')} und ${tex('C')} ${T[1]} ${tex('P')}. ${T[2]}`, formula: b2zeilen(`${pt('A', A)},\\quad ${pt('B', B)}`, `${pt('C', C)},\\quad ${pt('P', P)}`), options: shuffle(opts),
      hints: [spann, normal, rechts, `Hesse-Formel: ${tex('d(P;E)=\\dfrac{|\\vec n\\cdot\\vec p-d|}{|\\vec n|}')} mit ${laenge}.`, `Zähler: ${zaehler}.`],
      explain: `${spann} ${normal} ${rechts} Hesse-Formel: ${laenge}, Zähler ${zaehler}. Also ${ende} (in der Einheit der Aufgabe).`, kind: 'ebene', n, d, P };
  }
}

/**
 * Winkel. Stufe 1: Skalarprodukt und Längen gegeben · 2: zwei Vektoren mit glatten Längen · 3: krumme Längen (Wurzeln) ·
 * 4: Innenwinkel im Dreieck aus drei Punkten · 5: Schnittwinkel Gerade–Ebene, Ebene in Parameterform (Kreuzprodukt, Sinus).
 */
export function genWinkel(lv = 3) {
  for (;;) {
    const grad = (c) => (Math.acos(c) * 180) / Math.PI;
    if (lv >= 5) {
      const sa = nonzeroVec(2, 2), sb = nonzeroVec(2, 2), n = cross(sa, sb), S0 = rv(3), P = rv(3), u = nonzeroVec(3, 2), D = dot(n, u);
      if (n.filter((c) => c !== 0).length < 2 || n.some((c) => Math.abs(c) > 9) || D === 0 || zero(cross(n, u))) continue;
      const n2 = dot(n, n), u2 = dot(u, u), s = Math.abs(D) / Math.sqrt(n2 * u2), phi = (Math.asin(s) * 180) / Math.PI;
      const sp = (w) => Math.abs(dot(u, w)) / Math.sqrt(u2 * dot(w, w));
      const O = (winkel, num, correct, why) => ({ tex: `\\varphi\\approx${ft(winkel, 1)}^\\circ`, num, correct, why });
      const opts = [O(phi, s, true), O(90 - phi, Math.sqrt(1 - s * s), false, `Das ist der Winkel zwischen ${tex('g')} und dem Normalenvektor. Der Winkel zur Ebene ergänzt ihn zu 90° – deshalb steht in der Formel der Sinus.`),
        O(grad(sp(sa)), sp(sa), false, 'Das ist der Winkel zwischen der Geraden und dem ersten Spannvektor. Ein Spannvektor allein legt den Winkel zur Ebene nicht fest – gebraucht wird der Normalenvektor.'),
        O(grad(sp(sb)), sp(sb), false, 'Das ist der Winkel zwischen der Geraden und dem zweiten Spannvektor. Gebraucht wird der Normalenvektor (Kreuzprodukt der Spannvektoren).')];
      const gezeigt = [phi, 90 - phi, grad(sp(sa)), grad(sp(sb))];
      if (!b2fern(opts) || !uniq(opts) || gezeigt.some((a, i) => gezeigt.some((b, j) => i < j && Math.abs(a - b) < 0.6)) || gezeigt.some((a) => a < 1 || a > 89)) continue;
      const normal = `Normalenvektor über das Kreuzprodukt der Spannvektoren: ${tex(`\\vec n=${b2kreuz(sa, sb)}=${vecTex(n)}`)}.`;
      const skal = `Skalarprodukt mit dem Richtungsvektor: ${tex(`\\vec n\\cdot\\vec u=${b2skalar(n, u)}=${ft(D)}`)}.`;
      const laengen = `Längen: ${tex(`|\\vec n|=\\sqrt{${b2quadrate(n)}}=${b2laenge(n2)}`)}, ${tex(`|\\vec u|=\\sqrt{${b2quadrate(u)}}=${b2laenge(u2)}`)}.`;
      const ende = `\\sin\\varphi=\\dfrac{|\\vec n\\cdot\\vec u|}{|\\vec n|\\cdot|\\vec u|}=\\dfrac{${ft(Math.abs(D))}}{${b2laenge(n2)}\\cdot${b2laenge(u2)}}\\approx${ft(s, 4)}`;
      return { prompt: `Unter welchem Winkel ${tex('\\varphi')} schneidet die Gerade ${tex('g')} die Ebene ${tex('E')}?`,
        formula: b2zeilen(`E:\\ \\vec x=${vecTex(S0)}+r\\cdot${vecTex(sa)}+s\\cdot${vecTex(sb)}`, lineVecTex(P, u)), options: shuffle(opts),
        hints: [normal, skal, laengen, `Winkel zwischen Gerade und Ebene: ${tex('\\sin\\varphi=\\dfrac{|\\vec n\\cdot\\vec u|}{|\\vec n|\\cdot|\\vec u|}')} – Sinus, weil ${tex('\\vec n')} senkrecht auf der Ebene steht.`, `${tex(ende)}.`],
        explain: `${normal} ${skal} ${laengen} ${tex(ende)}, also ${tex(`\\varphi\\approx${ft(phi, 1)}^\\circ`)}.`, u: D > 0 ? n : n.map((c) => -c), v: u, kind: 'geradeEbene' };
    }
    let u, v, Lu2, Lv2;
    if (lv <= 2) { const a = tripVec(lv <= 1 ? 2 : 5), b = tripVec(lv <= 1 ? 2 : 5); u = a[0]; v = b[0]; }
    else { u = nonzeroVec(lv === 3 ? 3 : 4, 2); v = nonzeroVec(lv === 3 ? 3 : 4, 2); }
    Lu2 = dot(u, u); Lv2 = dot(v, v);
    const D = dot(u, v), LuT = b2laenge(Lu2), LvT = b2laenge(Lv2), want = D / Math.sqrt(Lu2 * Lv2);
    if (D === 0 || zero(cross(u, v))) continue;
    if (lv >= 3 && (Number.isInteger(Math.sqrt(Lu2)) || Number.isInteger(Math.sqrt(Lv2)))) continue;
    const name = lv === 4 ? '\\alpha' : '\\varphi';
    const O = (t, num, correct, why) => ({ tex: `\\cos${name}=${t}`, num, correct, why });
    const opts = [O(dfrac(ft(D), `${LuT}\\cdot${LvT}`), want, true), O(dfrac(ft(D), `${LuT}+${LvT}`), D / (Math.sqrt(Lu2) + Math.sqrt(Lv2)), false, 'Im Nenner werden die Längen multipliziert, nicht addiert.'),
      O(dfrac(`${LuT}\\cdot${LvT}`, ft(D)), Math.sqrt(Lu2 * Lv2) / D, false, 'Zähler und Nenner sind vertauscht: Das Skalarprodukt steht oben.'),
      O(dfrac(ft(D), lv <= 2 ? `${LuT}^2\\cdot${LvT}^2` : `${Lu2}\\cdot${Lv2}`), D / (Lu2 * Lv2), false, 'Im Nenner stehen die Längen selbst, nicht ihre Quadrate.')];
    let A, B, C;
    if (lv === 4) {
      A = rv(3); B = add(A, u); C = add(A, v);
      const w = C.map((c, i) => c - B[i]), Dw = dot(u, w), Lw2 = dot(w, w);
      if (Dw === 0) continue;
      opts[2] = O(dfrac(ft(Dw), `${LuT}\\cdot${b2laenge(Lw2)}`), Dw / Math.sqrt(Lu2 * Lw2), false, `Hier wurde ${tex('\\overrightarrow{BC}')} statt ${tex('\\overrightarrow{AC}')} benutzt. Für den Winkel bei ${tex('A')} müssen beide Vektoren in ${tex('A')} beginnen.`);
    }
    if (!uniqNum(opts) || !uniq(opts) || !b2fern(opts)) continue;
    const winkel = `${name}\\approx${ft(grad(want), 1)}^\\circ`;
    if (lv <= 1) return { prompt: `Zwei Vektoren haben das Skalarprodukt ${tex(`\\vec u\\cdot\\vec v=${ft(D)}`)} und die Längen ${tex(`|\\vec u|=${LuT}`)} und ${tex(`|\\vec v|=${LvT}`)}. Welche Rechnung liefert den Winkel ${tex('\\varphi')} zwischen ihnen?`, options: shuffle(opts),
      hints: [`${tex('\\cos\\varphi=\\dfrac{\\vec u\\cdot\\vec v}{|\\vec u|\\cdot|\\vec v|}')}.`, 'Oben steht das Skalarprodukt, unten das Produkt der beiden Längen.'],
      explain: `${tex(`\\cos\\varphi=${dfrac(ft(D), `${LuT}\\cdot${LvT}`)}`)}, also ${tex(winkel)}.`, u, v };
    const skal = lv === 2 ? `Skalarprodukt: ${tex(`\\vec u\\cdot\\vec v=${ft(D)}`)}.` : `Skalarprodukt: ${tex(`${lv === 4 ? '\\overrightarrow{AB}\\cdot\\overrightarrow{AC}' : '\\vec u\\cdot\\vec v'}=${b2skalar(u, v)}=${ft(D)}`)}.`;
    const laengen = lv === 2 ? `Längen: ${tex(`|\\vec u|=\\sqrt{${Lu2}}=${LuT}`)} und ${tex(`|\\vec v|=\\sqrt{${Lv2}}=${LvT}`)}.` : `Längen: ${tex(`\\sqrt{${b2quadrate(u)}}=${LuT}`)} und ${tex(`\\sqrt{${b2quadrate(v)}}=${LvT}`)}.`;
    const ende = `${tex(`\\cos${name}=${dfrac(ft(D), `${LuT}\\cdot${LvT}`)}${lv >= 3 ? `\\approx${ft(want, 4)}` : ''}`)}, also ${tex(winkel)}`;
    if (lv === 4) {
      const aus = (X) => `\\begin{pmatrix}${X.map((c, i) => `${ft(c)}-${par(A[i])}`).join('\\\\')}\\end{pmatrix}`;
      const vekt = `Beide Vektoren beginnen in ${tex('A')}: ${tex(`\\overrightarrow{AB}=${aus(B)}=${vecTex(u)}`)}, ${tex(`\\overrightarrow{AC}=${aus(C)}=${vecTex(v)}`)}.`;
      return { prompt: `Welche Rechnung liefert den Innenwinkel ${tex('\\alpha')} beim Punkt ${tex('A')} im Dreieck ${tex('ABC')}?`, formula: b2zeilen(`${pt('A', A)},\\quad ${pt('B', B)}`, pt('C', C)), options: shuffle(opts),
        hints: [vekt, `${tex('\\cos\\alpha=\\dfrac{\\overrightarrow{AB}\\cdot\\overrightarrow{AC}}{|\\overrightarrow{AB}|\\cdot|\\overrightarrow{AC}|}')}.`, skal, laengen],
        explain: `${vekt} ${skal} ${laengen} ${ende}.`, u, v, kind: 'dreieck' };
    }
    return { prompt: `Welche Rechnung liefert den Winkel ${tex('\\varphi')} zwischen den Vektoren?`, formula: `\\vec u=${vecTex(u)},\\quad \\vec v=${vecTex(v)}`, options: shuffle(opts),
      hints: [`${tex('\\cos\\varphi=\\dfrac{\\vec u\\cdot\\vec v}{|\\vec u|\\cdot|\\vec v|}')}.`, skal, laengen],
      explain: `${skal} ${laengen} ${ende}.`, u, v };
  }
}

/**
 * Kreuzprodukt. Stufe 1: Vektoren mit Nullen · 2: kleine positive Zahlen · 3: auch negative Zahlen ·
 * 4: Normalenvektor aus drei Punkten · 5: drei Punkte mit Komma-Koordinaten.
 */
export function genKreuz(lv = 3) {
  for (;;) {
    const halb = () => pick([-3.5, -2.5, -1.5, -0.5, 0.5, 1.5, 2.5, 3.5, -2, -1, 1, 2, 3]);
    const u = lv <= 1 ? shuffle([0, ri(1, 3), ri(1, 3)]) : lv === 2 ? [ri(1, 3), ri(1, 3), ri(1, 3)] : lv >= 5 ? [halb(), halb(), halb()] : rv(lv === 3 ? 3 : 5);
    const v = lv <= 1 ? shuffle([0, ri(1, 3), ri(1, 3)]) : lv === 2 ? [ri(1, 3), ri(1, 3), ri(1, 3)] : lv >= 5 ? [halb(), halb(), halb()] : rv(lv === 3 ? 3 : 5), c = cross(u, v);
    if (zero(c) || c[1] === 0) continue;
    if (lv >= 3 && [u, v].some((w) => w.filter((x) => x !== 0).length < 2)) continue;
    if (lv === 3 && ![...u, ...v].some((x) => x < 0)) continue;
    if (lv >= 5 && ![u, v].every((w) => w.some((x) => !Number.isInteger(x)))) continue;
    const drei = lv >= 4, A = lv >= 5 ? [halb(), ri(-3, 3), halb()] : rv(3), B = add(A, u), C = add(A, v);
    const O = (vec, correct, why) => ({ tex: vecTex(vec), vec, correct, why });
    const opts = [O(c, true), O([c[0], -c[1], c[2]], false, `Mittlere Zeile: ${tex('u_3v_1-u_1v_3')} – hier ist die Reihenfolge anders als oben und unten.`), O(u.map((x, i) => x * v[i]), false, 'Zeilenweise multiplizieren gehört zum Skalarprodukt. Das Kreuzprodukt wird „über Kreuz" gebildet.'), O(c.map((x) => -x), false, `Reihenfolge vertauscht: Das ist ${tex(drei ? '\\overrightarrow{AC}\\times\\overrightarrow{AB}' : '\\vec v\\times\\vec u')}.`)];
    if (opts.some((a, i) => opts.some((b, j) => i < j && same(a.vec, b.vec))) || !uniq(opts)) continue;
    const formel = `${tex('\\vec u\\times\\vec v=\\begin{pmatrix}u_2v_3-u_3v_2\\\\u_3v_1-u_1v_3\\\\u_1v_2-u_2v_1\\end{pmatrix}')}.`;
    const rechnung = `${drei ? '\\overrightarrow{AB}\\times\\overrightarrow{AC}' : '\\vec u\\times\\vec v'}=${b2kreuz(u, v)}=${vecTex(c)}`;
    if (!drei) return { prompt: `Berechne das Kreuzprodukt ${tex('\\vec u\\times\\vec v')}.`, formula: `\\vec u=${vecTex(u)},\\quad \\vec v=${vecTex(v)}`, options: shuffle(opts),
      hints: lv <= 1 ? [formel, 'Wo eine Null steht, fällt das ganze Produkt weg.'] : [formel, ...(lv >= 3 ? [`Erste Zeile: ${tex(`${par(u[1])}\\cdot${par(v[2])}-${par(u[2])}\\cdot${par(v[1])}=${ft(c[0])}`)}. Achte auf die Vorzeichen.`] : []), 'Probe: Das Ergebnis steht senkrecht auf beiden Vektoren – beide Skalarprodukte müssen 0 sein.'],
      explain: lv <= 1 ? `${tex(`\\vec u\\times\\vec v=${vecTex(c)}`)}. Probe: Das Skalarprodukt mit ${tex('\\vec u')} und mit ${tex('\\vec v')} ist jeweils 0.`
        : `${tex(rechnung)}. Probe mit dem Skalarprodukt: ${tex(`${b2skalar(c, u)}=0`)}${lv >= 3 ? ` und ${tex(`${b2skalar(c, v)}=0`)}` : ''}.`, u, v };
    const vekt = `Verbindungsvektoren: ${tex(`\\overrightarrow{AB}=${vecTex(u)}`)}, ${tex(`\\overrightarrow{AC}=${vecTex(v)}`)}.`;
    const c2 = dot(c, c);
    return { prompt: `Die Punkte ${tex('A')}, ${tex('B')} und ${tex('C')} legen eine Ebene fest. Berechne den Normalenvektor ${tex('\\vec n=\\overrightarrow{AB}\\times\\overrightarrow{AC}')}.`,
      formula: b2zeilen(`${pt('A', A)},\\quad ${pt('B', B)}`, pt('C', C)), options: shuffle(opts),
      hints: [vekt, formel, `Erste Zeile: ${tex(`${par(u[1])}\\cdot${par(v[2])}-${par(u[2])}\\cdot${par(v[1])}=${ft(c[0])}`)}. Achte auf die Vorzeichen.`, 'Probe: Das Ergebnis steht senkrecht auf beiden Verbindungsvektoren – beide Skalarprodukte müssen 0 sein.'],
      explain: `${vekt} Kreuzprodukt: ${tex(rechnung)}. Probe mit dem Skalarprodukt: ${tex(`${b2skalar(c, u)}=0`)} und ${tex(`${b2skalar(c, v)}=0`)}.${lv >= 5 ? ` Nebenbei: Das Dreieck ${tex('ABC')} hat den Flächeninhalt ${tex(`\\tfrac12\\cdot|\\vec n|=\\tfrac12\\cdot\\sqrt{${ft(c2, 4)}}\\approx${ft(Math.sqrt(c2) / 2)}`)}.` : ''}`, u, v, kind: 'punkte' };
  }
}

/* ───────────── Prüfung: Operatoren ───────────── */

export const OPERATOREN = [
  ['Angeben / Nennen', 'Das Ergebnis ohne Rechenweg und ohne Begründung notieren.'],
  ['Berechnen', 'Das Ergebnis durch Rechnung gewinnen – der Rechenweg muss erkennbar sein.'],
  ['Bestimmen / Ermitteln', 'Den Lösungsweg darstellen und das Ergebnis formulieren; die Methode ist frei (rechnerisch, grafisch …).'],
  ['Zeigen / Nachweisen', 'Eine Aussage durch Rechnung oder logische Schritte lückenlos bestätigen.'],
  ['Begründen', 'Einen Sachverhalt auf Regeln, Sätze oder Zusammenhänge zurückführen.'],
  ['Skizzieren', 'Die wesentlichen Eigenschaften grafisch darstellen – nicht maßstabsgetreu, aber qualitativ richtig.'],
  ['Zeichnen', 'Eine genaue, maßstabsgetreue grafische Darstellung anfertigen.'],
  ['Untersuchen', 'Eigenschaften oder Zusammenhänge nach Kriterien herausarbeiten und das Ergebnis festhalten.'],
  ['Interpretieren / Deuten', 'Ein Ergebnis im Sachzusammenhang der Aufgabe erklären.'],
  ['Beurteilen', 'Zu einer Aussage ein begründetes Urteil auf Grundlage von Fachwissen abgeben.'],
  ['Beschreiben', 'Einen Sachverhalt oder ein Verfahren in eigenen Worten und mit Fachsprache wiedergeben.'],
  ['Entscheiden', 'Sich bei mehreren Möglichkeiten begründet auf eine festlegen.'],
];
/** Zu jedem Operator der, mit dem er am leichtesten verwechselt wird (Stellen in OPERATOREN). */
const OP_NACHBAR = [1, 2, 1, 4, 3, 6, 5, 2, 10, 11, 8, 9];
/** Zu jedem Operator eine eigene Beispiel-Aufgabe, wie sie in einer Prüfung stehen könnte. */
const OP_BEISPIEL = [
  'Geben Sie die Koordinaten des Scheitelpunkts der Parabel an.',
  'Berechnen Sie den Inhalt der Fläche, die der Graph mit der x-Achse einschließt.',
  'Bestimmen Sie die Stelle, an der der Graph die Steigung 3 hat.',
  'Zeigen Sie, dass die Funktion F eine Stammfunktion von f ist.',
  'Begründen Sie, dass jede ganzrationale Funktion dritten Grades mindestens eine Nullstelle hat.',
  'Skizzieren Sie den Graphen der Ableitungsfunktion in das vorhandene Koordinatensystem.',
  'Zeichnen Sie den Graphen von f im Bereich von −2 bis 4 (1 Längeneinheit = 1 cm).',
  'Untersuchen Sie die gegenseitige Lage der Geraden g und h.',
  'Die Ableitung der Wasserstandsfunktion hat nach 3 Stunden den Wert −0,4. Interpretieren Sie diesen Wert im Sachzusammenhang.',
  'Lena behauptet: „Wo die Ableitung null ist, liegt immer ein Extrempunkt." Beurteilen Sie diese Aussage.',
  'Beschreiben Sie, wie man den Abstand eines Punktes von einer Ebene ermitteln kann.',
  'Entscheiden Sie, welcher der drei abgebildeten Graphen zur Funktion f gehört.',
];
/** Operator-Paare: [Stelle A, Stelle B, richtiger Unterschied, vertauscht, zwei weitere falsche Aussagen]. */
const OP_PAAR = [
  [5, 6, 'Beim Skizzieren genügt eine qualitativ richtige Darstellung der wesentlichen Eigenschaften; beim Zeichnen muss die Darstellung genau und maßstabsgetreu sein.',
    'Beim Zeichnen genügt eine qualitativ richtige Darstellung; beim Skizzieren muss sie genau und maßstabsgetreu sein.',
    'Beide verlangen eine maßstabsgetreue Darstellung; beim Skizzieren darf nur die Achsenbeschriftung fehlen.', 'Beim Skizzieren ist eine Wertetabelle Pflicht, beim Zeichnen nicht.'],
  [0, 1, 'Beim Angeben genügt das Ergebnis ohne Rechenweg und Begründung; beim Berechnen muss der Rechenweg erkennbar sein.',
    'Beim Berechnen genügt das Ergebnis; beim Angeben muss der Rechenweg erkennbar sein.',
    'Beide verlangen nur das Ergebnis; „Berechnen" steht bei Zahlen, „Angeben" bei Texten.', 'Beim Angeben wird zusätzlich eine Begründung in Worten erwartet, beim Berechnen nicht.'],
  [1, 2, 'Beim Berechnen ist der rechnerische Weg vorgeschrieben; beim Bestimmen ist die Methode frei (auch grafisch), der Lösungsweg muss aber dargestellt werden.',
    'Beim Bestimmen ist der rechnerische Weg vorgeschrieben; beim Berechnen ist die Methode frei.',
    'Beim Bestimmen genügt das Ergebnis ohne Lösungsweg; beim Berechnen muss der Weg erkennbar sein.', 'Beide verlangen dasselbe; „Bestimmen" wird nur bei Aufgaben mit Sachzusammenhang verwendet.'],
  [3, 4, 'Beim Zeigen wird eine vorgegebene Aussage lückenlos durch Rechnung oder logische Schritte bestätigt; beim Begründen wird ein Sachverhalt auf Regeln, Sätze oder Zusammenhänge zurückgeführt.',
    'Beim Begründen wird eine Aussage lückenlos durch Rechnung bestätigt; beim Zeigen genügt der Verweis auf eine Regel.',
    'Beim Zeigen genügt ein passendes Zahlenbeispiel; beim Begründen ist ein allgemeiner Nachweis nötig.', 'Beim Zeigen ist das Ergebnis offen und muss erst gefunden werden; beim Begründen ist es vorgegeben.'],
  [9, 11, 'Beim Beurteilen wird zu einer Aussage ein begründetes Urteil mit Fachwissen abgegeben; beim Entscheiden legt man sich unter mehreren vorgegebenen Möglichkeiten begründet auf eine fest.',
    'Beim Entscheiden wird zu einer Aussage ein Urteil abgegeben; beim Beurteilen wählt man unter mehreren Möglichkeiten eine aus.',
    'Beim Beurteilen ist die eigene Meinung gefragt, Fachwissen spielt keine Rolle; beim Entscheiden zählt nur die Rechnung.', 'Beim Entscheiden reicht es, die gewählte Möglichkeit zu nennen; eine Begründung wird nur beim Beurteilen erwartet.'],
  [10, 8, 'Beim Beschreiben wird ein Sachverhalt oder Verfahren mit Fachsprache wiedergegeben; beim Interpretieren wird ein Ergebnis im Sachzusammenhang der Aufgabe erklärt.',
    'Beim Interpretieren wird ein Verfahren wiedergegeben; beim Beschreiben wird ein Ergebnis im Sachzusammenhang erklärt.',
    'Beim Beschreiben wird eine Rechnung verlangt; beim Interpretieren genügt es, das Ergebnis abzuschreiben.', 'Beide verlangen dasselbe; „Interpretieren" steht nur bei Aufgaben zur Stochastik.'],
];
/** Prüfungs-Situationen für Stufe 5: Aufgabe mit zwei Operatoren, eine Schülerlösung – was fehlt für die volle Punktzahl? */
const OP_FALL = [
  { aufgabe: 'Bestimmen Sie die Stückzahl, bei der der Gewinn am größten ist, und interpretieren Sie das Ergebnis im Sachzusammenhang.',
    loesung: 'Im Heft stehen die Ableitung der Gewinnfunktion, die Nullstelle x = 40 der Ableitung und der Nachweis über die zweite Ableitung. Der letzte Satz lautet: „Also Hochpunkt bei x = 40."',
    r: 'Die Deutung fehlt: Bei 40 Stück ist der Gewinn am größten – das Ergebnis muss in die Sprache der Aufgabe übersetzt werden.',
    f: [['Eine maßstabsgetreue Zeichnung der Gewinnfunktion fehlt.', 'Weder „Bestimmen" noch „Interpretieren" verlangt eine Zeichnung.'], ['Nichts – mit dem Hochpunkt ist die Aufgabe vollständig gelöst.', '„Interpretieren" ist ein eigener Auftrag: Das Ergebnis muss im Sachzusammenhang erklärt werden.'], ['Der Rechenweg ist überflüssig; bei „Bestimmen" zählt nur das Ergebnis.', 'Bei „Bestimmen" muss der Lösungsweg dargestellt werden – nur die Methode ist frei.']],
    kern: ['„Bestimmen": Lösungsweg darstellen, Ergebnis formulieren – das ist erfüllt.', '„Interpretieren": das Ergebnis im Sachzusammenhang erklären – „Hochpunkt bei x = 40" ist noch reine Mathematik.'] },
  { aufgabe: 'Zeigen Sie, dass die Geraden g und h windschief sind, und geben Sie einen Punkt an, der auf g liegt.',
    loesung: 'Im Heft steht: „Die Richtungsvektoren sind keine Vielfachen voneinander, also sind g und h windschief. Ein Punkt auf g ist der Stützpunkt P."',
    r: 'Der Nachweis ist lückenhaft: Es muss noch gezeigt werden, dass die Geraden keinen gemeinsamen Punkt haben (Gleichsetzen führt zum Widerspruch).',
    f: [['Für den Punkt P fehlt die Rechnung, mit der er gefunden wurde.', 'Bei „Angeben" genügt das Ergebnis – ohne Rechenweg und ohne Begründung.'], ['Nichts – nicht parallele Geraden im Raum sind immer windschief.', 'Nicht parallele Geraden können sich auch schneiden. Genau das muss ausgeschlossen werden.'], ['Es fehlt eine Skizze der beiden Geraden im Koordinatensystem.', 'Eine Skizze ist nicht verlangt und würde den Nachweis auch nicht ersetzen.']],
    kern: ['„Zeigen": lückenlos bestätigen. Windschief heißt: nicht parallel <b>und</b> kein Schnittpunkt – der zweite Teil fehlt.', '„Angeben": Der Punkt darf ohne jede Rechnung genannt werden – das ist erfüllt.'] },
  { aufgabe: 'Berechnen Sie die Wahrscheinlichkeit für höchstens 3 Treffer und beurteilen Sie die Aussage: „Mehr als 3 Treffer sind praktisch ausgeschlossen."',
    loesung: 'Im Heft steht nur: „Die Wahrscheinlichkeit beträgt etwa 0,65. Die Aussage ist falsch."',
    r: 'Es fehlen der Ansatz der Rechnung und die Begründung des Urteils (zum Beispiel: Die Gegenwahrscheinlichkeit von etwa 0,35 ist nicht klein).',
    f: [['Es fehlt nur die Begründung des Urteils – bei „Berechnen" genügt das Ergebnis.', 'Bei „Berechnen" muss der Rechenweg erkennbar sein, mindestens der Ansatz.'], ['Es fehlt nur der Ansatz der Rechnung – ein Urteil braucht keine Begründung.', '„Beurteilen" verlangt ein <b>begründetes</b> Urteil auf Grundlage von Fachwissen.'], ['Nichts – Ergebnis und Urteil sind richtig, das genügt.', 'Richtig allein genügt nicht: Beide Operatoren verlangen mehr als das bloße Ergebnis.']],
    kern: ['„Berechnen": Der Rechenweg muss erkennbar sein – hier steht nur das Ergebnis.', '„Beurteilen": ein begründetes Urteil – hier steht nur das Urteil.'] },
  { aufgabe: 'Skizzieren Sie den Graphen von f und begründen Sie, dass f genau zwei Nullstellen hat.',
    loesung: 'Im Heft ist der Graph mit einer Wertetabelle millimetergenau gezeichnet. Darunter steht: „Man sieht in der Zeichnung zwei Nullstellen."',
    r: 'Die Begründung fehlt: Ablesen aus der Zeichnung ist kein Zurückführen auf Eigenschaften der Funktion (zum Beispiel Vorzeichen, Monotonie, Extrempunkte).',
    f: [['Die Zeichnung ist zu genau – für eine Skizze gibt es deshalb Punktabzug.', 'Mehr Genauigkeit als verlangt kostet Zeit, aber keine Punkte.'], ['Nichts – die Zeichnung belegt die zwei Nullstellen.', 'Eine Zeichnung zeigt nur einen Ausschnitt; „Begründen" verlangt ein Argument, das für die ganze Funktion gilt.'], ['Die Nullstellen müssen noch auf zwei Nachkommastellen berechnet werden.', 'Gefragt ist die Anzahl der Nullstellen, nicht ihr Wert.']],
    kern: ['„Skizzieren": qualitativ richtig genügt – die genaue Zeichnung erfüllt das erst recht.', '„Begründen": auf Regeln oder Zusammenhänge zurückführen – „man sieht es" ist kein Argument.'] },
  { aufgabe: 'Untersuchen Sie die Funktion f auf Symmetrie und geben Sie ihren Grenzwert für x gegen unendlich an.',
    loesung: 'Im Heft steht: „f ist achsensymmetrisch zur y-Achse. Der Grenzwert ist 2."',
    r: 'Die Untersuchung fehlt: Das Kriterium für die Symmetrie (f(−x) mit f(x) vergleichen) muss sichtbar angewendet werden.',
    f: [['Die Herleitung des Grenzwerts fehlt.', 'Bei „Angeben" genügt das Ergebnis ohne Herleitung.'], ['Nichts – beide Ergebnisse stehen da.', '„Untersuchen" verlangt, die Eigenschaft nach einem Kriterium herauszuarbeiten – nicht nur das Ergebnis.'], ['Beides fehlt: die Symmetrie-Rechnung und die Herleitung des Grenzwerts.', 'Nur die Symmetrie muss nachvollziehbar untersucht werden; der Grenzwert darf einfach angegeben werden.']],
    kern: ['„Untersuchen": nach einem Kriterium herausarbeiten – hier steht nur die Behauptung.', '„Angeben": Ergebnis ohne Rechenweg – der Grenzwert ist damit vollständig.'] },
];

/**
 * Operatoren der Prüfung. Stufe 1: Bedeutung eines häufigen Operators · 2: alle Operatoren, immer mit dem ähnlichsten als Ablenker ·
 * 3: Operator in einer Beispiel-Aufgabe erkennen und einordnen · 4: zwei ähnliche Operatoren abgrenzen ·
 * 5: Prüfungs-Situation mit zwei Operatoren – was fehlt in der Schülerlösung?
 */
export function genOperator(lv = 3) {
  if (lv >= 5) {
    const F = pick(OP_FALL);
    const opts = [{ tex: F.r, html: F.r, key: 'richtig', correct: true }, ...F.f.map(([t, why], i) => ({ tex: t, html: t, key: `falsch${i + 1}`, correct: false, why }))];
    return { prompt: `In der Prüfung steht: <b>„${F.aufgabe}"</b> ${F.loesung} Was fehlt für die volle Punktzahl?`, options: shuffle(opts),
      hints: ['Die Aufgabe enthält zwei Operatoren. Kläre für jeden einzeln, was er verlangt.', F.kern[0], F.kern[1], 'Vergleiche erst danach mit dem, was im Heft steht.'],
      explain: `${F.kern[0]} ${F.kern[1]} Deshalb: ${F.r}`, expect: 'richtig', kind: 'fall' };
  }
  if (lv === 4) {
    const [a, b, recht, tausch, f1, f2] = pick(OP_PAAR), A = OPERATOREN[a][0], B = OPERATOREN[b][0];
    const opts = [{ tex: recht, html: recht, key: 'richtig', correct: true }, { tex: tausch, html: tausch, key: 'vertauscht', correct: false, why: `Genau umgekehrt: „${A}" – ${OPERATOREN[a][1]}` },
      { tex: f1, html: f1, key: 'falsch1', correct: false, why: `Das trifft auf keinen der beiden zu. „${B}": ${OPERATOREN[b][1]}` }, { tex: f2, html: f2, key: 'falsch2', correct: false, why: `Das trifft auf keinen der beiden zu. „${A}": ${OPERATOREN[a][1]}` }];
    return { prompt: `In einer Prüfung steht in Teil a) der Operator <b>„${A}"</b> und in Teil b) <b>„${B}"</b>. Worin liegt der Unterschied?`, options: shuffle(opts),
      hints: [`Kläre jeden Operator für sich. „${A}": Was muss am Ende auf dem Blatt stehen?`, `Und bei „${B}"?`, 'Achte auf die Zuordnung: In mehreren Antworten stehen dieselben Bausteine, aber beim falschen Operator.'],
      explain: `„${A}": ${OPERATOREN[a][1]} „${B}": ${OPERATOREN[b][1]} Der Unterschied: ${recht}`, expect: 'richtig', kind: 'paar' };
  }
  const pool = OPERATOREN.slice(0, lv <= 1 ? 7 : 12);
  const right = ri(0, pool.length - 1), nah = OP_NACHBAR[right];
  const rest = shuffle(pool.map((_, i) => i).filter((i) => i !== right && !(lv >= 2 && i === nah)));
  const idx = lv <= 1 ? [right, ...rest.slice(0, 3)] : [right, nah, ...rest.slice(0, 2)];
  const options = shuffle(idx).map((i) => ({ tex: pool[i][1], html: pool[i][1], key: pool[i][0], correct: i === right, why: `Das beschreibt „${pool[i][0]}".` }));
  if (lv <= 1) return { prompt: `Was verlangt der Operator <b>„${pool[right][0]}"</b>?`, options,
    hints: ['Achte darauf, ob ein Rechenweg, eine Begründung oder nur das Ergebnis verlangt ist.', 'Vergleiche mit ähnlichen Operatoren: Wo liegt der Unterschied?'],
    explain: `„${pool[right][0]}": ${pool[right][1]}`, expect: pool[right][0] };
  const abgrenzung = `Leicht zu verwechseln mit „${pool[nah][0]}": ${pool[nah][1]}`;
  if (lv === 2) return { prompt: `Was verlangt der Operator <b>„${pool[right][0]}"</b>?`, options,
    hints: ['Achte darauf, ob ein Rechenweg, eine Begründung oder nur das Ergebnis verlangt ist.', `Zwei Antworten klingen ähnlich. Eine davon gehört zu „${pool[nah][0]}".`, 'Suche das Wort, in dem sich die beiden ähnlichen Antworten unterscheiden.'],
    explain: `„${pool[right][0]}": ${pool[right][1]} ${abgrenzung}`, expect: pool[right][0] };
  return { prompt: `In einer Prüfung steht: <b>„${OP_BEISPIEL[right]}"</b> Was wird damit verlangt?`, options,
    hints: ['Suche zuerst den Operator: das Verb, das sagt, was zu tun ist.', `Der Operator ist „${pool[right][0].split(' / ')[0]}".`, `Zwei Antworten klingen ähnlich. Eine davon gehört zu „${pool[nah][0]}".`, 'Überlege, was am Ende auf dem Blatt stehen muss: nur ein Ergebnis, ein Rechenweg, eine Zeichnung, ein Text?'],
    explain: `Der Operator ist „${pool[right][0]}": ${pool[right][1]} ${abgrenzung}`, expect: pool[right][0], kind: 'beispiel' };
}

/* ───────────── Themen-Namen ───────────── */
for (const [fn, topic] of [[genWendestelle, 'Wendepunkte'], [genMonotonie, 'Monotonie'], [genSymmetrie, 'Symmetrie'], [genGrenzwert, 'Grenzwerte'], [genTangente, 'Tangentengleichung'],
  [genSteckbrief, 'Steckbriefaufgaben'], [genSchar, 'Funktionenscharen'], [genExtremwert, 'Extremwertaufgaben'], [genLn, 'ln-Funktion ableiten'], [genWachstum, 'Wachstum'],
  [genFlaecheZwischen, 'Fläche zwischen Graphen'], [genVierfelder, 'Vierfeldertafel'], [genBedingt, 'Bedingte Wahrscheinlichkeit'], [genKumuliert, 'Kumulierte Binomialverteilung'],
  [genSigma, 'Sigma-Regeln'], [genHypothese, 'Hypothesentests'], [genNormal, 'Normalverteilung'], [genKombinatorik, 'Kombinatorik'], [genGeradePunkt, 'Geraden: Punktprobe'],
  [genEbene, 'Ebenen: Punktprobe'], [genLage, 'Lage von Geraden'], [genSchnittpunkt, 'Schnitt Gerade–Ebene'], [genAbstand, 'Abstände'], [genWinkel, 'Winkel'], [genKreuz, 'Kreuzprodukt'], [genOperator, 'Operatoren']]) fn.topic = topic;
