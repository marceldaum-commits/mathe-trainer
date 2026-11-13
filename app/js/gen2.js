// Aufgaben-Erzeuger, Teil 2: Kurvendiskussion, Anwendungen, Stochastik-Vertiefung, Geraden und Ebenen, Operatoren.
// Gleiche Regeln wie in gen.js: Schwierigkeit lv (1–5), Ablenker = typische Fehler mit Diagnose,
// Rechen-Felder (val, num, vec, key …) für die Selbstprüfung in tests/.
import { ri, pick, shuffle, rand, ft, polyTex, polyEval, polyDeriv, lineTex } from './math.js';
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
    return { prompt: `Ein Bestand von ${N0} ${ab ? 'nimmt pro Jahr um' : 'wächst pro Jahr um'} ${ft(p)} % ${ab ? 'ab' : ''}. Welche Funktion beschreibt den Bestand nach ${tex('t')} Jahren?`.replace(' .', '.'), options: shuffle(opts),
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

/** Vierfeldertafel: Wahrscheinlichkeiten ablesen. */
export function genVierfelder(lv = 3) {
  for (;;) {
    const N = pick(tier(lv, [100], [100, 200], [200, 400], [400, 500], [500, 1000])), u = N / 20;
    const a = u * ri(2, 7), b = u * ri(1, 5), c = u * ri(1, 5), d = N - a - b - c;
    if (d <= 0) continue;
    const kind = pick(tier(lv, ['schnitt', 'A'], ['schnitt', 'bedingt'], ['bedingt', 'bedingt', 'schnitt'], ['bedingt', 'bedingtA'], ['bedingt', 'bedingtA']));
    const O = (z, n, correct, why) => ({ tex: dfrac(z, n), num: z / n, correct, why });
    const all = {
      schnitt: [`P(A\\cap B)`, O(a, N, true), O(a, a + c, false, `Das ist die bedingte Wahrscheinlichkeit ${tex('P_B(A)')} – gefragt ist der Anteil an allen.`), O(a + b, N, false, `Das ist ${tex('P(A)')}: die ganze Zeile.`), O(a + c, N, false, `Das ist ${tex('P(B)')}: die ganze Spalte.`)],
      A: [`P(A)`, O(a + b, N, true), O(a, N, false, `Das ist nur ${tex('P(A\\cap B)')}. Zu ${tex('A')} gehört die ganze Zeile.`), O(a + c, N, false, `Das ist ${tex('P(B)')}.`), O(a, a + b, false, `Das ist ${tex('P_A(B)')}.`)],
      bedingt: [`P_B(A)`, O(a, a + c, true), O(a, N, false, `Das ist ${tex('P(A\\cap B)')}. Bei ${tex('P_B(A)')} steht nur ${tex('B')} im Nenner.`), O(a, a + b, false, `Bedingung vertauscht: Das ist ${tex('P_A(B)')}.`), O(a + b, N, false, `Das ist ${tex('P(A)')} ohne Bedingung.`)],
      bedingtA: [`P_A(\\overline{B})`, O(b, a + b, true), O(b, N, false, `Das ist ${tex('P(A\\cap\\overline{B})')}. Die Bedingung ${tex('A')} gehört in den Nenner.`), O(b, b + d, false, `Bedingung vertauscht: Das ist ${tex('P_{\\overline{B}}(A)')}.`), O(a, a + b, false, `Das ist ${tex('P_A(B)')} – gefragt ist ${tex('\\overline{B}')}.`)],
    }[kind];
    const opts = all.slice(1);
    if (!uniqNum(opts)) continue;
    return { prompt: `Bestimme ${tex(all[0])} aus der Vierfeldertafel.`,
      formula: `\\def\\arraystretch{1.45}\\begin{array}{c|cc|c}&B&\\overline{B}&\\\\\\hline A&${a}&${b}&${a + b}\\\\\\overline{A}&${c}&${d}&${c + d}\\\\\\hline &${a + c}&${b + d}&${N}\\end{array}`,
      options: shuffle(opts),
      hints: ['Welche Gruppe ist die Grundmenge – alle oder nur ein Teil?', `Bei ${tex('P_B(A)')} ist die Grundmenge nur ${tex('B')}: Teile durch die Spaltensumme.`],
      explain: `${tex(`${all[0]}=${opts[0].tex}\\approx${ft(opts[0].num, 3)}`)}.`, kind, a, b, c, d, N };
  }
}

/** Bedingte Wahrscheinlichkeit „rückwärts" (Test positiv → krank?). */
export function genBedingt(lv = 3) {
  for (;;) {
    const T = tier(lv, 100, 100, 1000, 1000, 10000);
    const s = T * pick(lv <= 2 ? [0.2, 0.1] : [0.01, 0.02, 0.05]), tp = s * pick([0.9, 0.8]), h = T - s, fp = h * pick(lv <= 2 ? [0.1, 0.2] : [0.1, 0.05, 0.02]);
    if (![s, tp, fp].every((v) => Math.abs(v - Math.round(v)) < 1e-9)) continue;
    const [S, TP, FP] = [s, tp, fp].map(Math.round);
    const O = (z, n, correct, why) => ({ tex: dfrac(z, n), num: z / n, correct, why });
    const opts = [O(TP, TP + FP, true),
      O(TP, S, false, 'Bedingung vertauscht: Das ist die Wahrscheinlichkeit, dass ein Kranker positiv getestet wird.'),
      O(TP, T, false, 'Das ist der Anteil „krank und positiv" an allen. Gefragt ist der Anteil unter den positiv Getesteten.'),
      O(FP, TP + FP, false, 'Das ist die Wahrscheinlichkeit, trotz positivem Test gesund zu sein.')];
    if (!uniqNum(opts)) continue;
    return { prompt: `Von ${T} Personen sind ${S} krank. Der Test fällt bei ${TP} der Kranken positiv aus – und fälschlich auch bei ${FP} der ${T - S} Gesunden. Eine Person wird positiv getestet. Mit welcher Wahrscheinlichkeit ist sie krank?`,
      options: shuffle(opts),
      hints: ['Die Grundmenge sind nur die positiv Getesteten.', `Positiv getestet sind insgesamt ${TP} + ${FP} Personen.`],
      explain: `Unter den ${TP + FP} positiv Getesteten sind ${TP} krank: ${tex(`${dfrac(TP, TP + FP)}\\approx${ft((TP / (TP + FP)) * 100, 1)}\\,\\%`)}.`, TP, FP };
  }
}

/** „Mindestens", „höchstens", „mehr als" in kumulierte Wahrscheinlichkeiten übersetzen. */
export function genKumuliert(lv = 3) {
  for (;;) { const q = kumuliert(lv); if (uniqNum(q.options)) return q; }
}
function kumuliert(lv) {
  const n = pick(tier(lv, [10], [10, 20], [20, 25, 50], [50, 100], [100, 200])), p = pick([0.2, 0.3, 0.4, 0.5, 0.6]);
  const mu = Math.round(n * p);
  const zw = lv >= 4 && rand() < 0.5;
  const O = (t, num, correct, why) => ({ tex: t, num, correct, why });
  const F = (j) => cdf(n, p, j), P = (j) => `P(X\\le ${j})`;
  if (zw) {
    const a = Math.max(1, mu - ri(2, 4)), b = Math.min(n - 1, mu + ri(1, 4));
    const opts = [O(`${P(b)}-${P(a - 1)}`, F(b) - F(a - 1), true),
      O(`${P(b)}-${P(a)}`, F(b) - F(a), false, `${a} gehört dazu: Abgezogen wird alles <b>unter</b> ${a}, also bis ${a - 1}.`),
      O(`${P(b - 1)}-${P(a - 1)}`, F(b - 1) - F(a - 1), false, `${b} gehört dazu: Die obere Grenze ist ${b}.`),
      O(`1-${P(a - 1)}`, 1 - F(a - 1), false, `Das ist „mindestens ${a}" – die obere Grenze ${b} fehlt.`)];
    return { prompt: `${tex('X')} ist binomialverteilt. Welcher Ausdruck liefert die Wahrscheinlichkeit für <b>mindestens ${a} und höchstens ${b}</b> Treffer?`, formula: `n=${n},\\quad p=${ft(p)}`, options: shuffle(opts),
      hints: [`Gesucht ist ${tex(`P(${a}\\le X\\le ${b})`)}.`, 'Alles bis zur oberen Grenze, minus alles unterhalb der unteren Grenze.'],
      explain: `${tex(`P(${a}\\le X\\le ${b})=${P(b)}-${P(a - 1)}`)}.`, n, p, lo: a, hi: b };
  }
  const k = Math.min(n - 2, Math.max(2, mu + ri(-2, 2)));
  const kinds = { hoechstens: [`höchstens ${k}`, P(k), 0, k], weniger: [`weniger als ${k}`, P(k - 1), 0, k - 1], mehr: [`mehr als ${k}`, `1-${P(k)}`, k + 1, n], mindestens: [`mindestens ${k}`, `1-${P(k - 1)}`, k, n] };
  const kind = pick(Object.keys(kinds));
  const numOf = { hoechstens: F(k), weniger: F(k - 1), mehr: 1 - F(k), mindestens: 1 - F(k - 1) };
  const opts = Object.keys(kinds).map((key) => O(kinds[key][1], numOf[key], key === kind, `Das ist „${kinds[key][0]}".`));
  return { prompt: `${tex('X')} ist binomialverteilt. Welcher Ausdruck liefert die Wahrscheinlichkeit für <b>${kinds[kind][0]}</b> Treffer?`, formula: `n=${n},\\quad p=${ft(p)}`, options: shuffle(opts),
    hints: [`Schreibe es als Ungleichung: ${tex(`X\\le\\dots`)} oder ${tex(`X\\ge\\dots`)}. Gehört ${k} dazu?`, `Tabellen liefern nur ${tex('P(X\\le k)')}. Für „mindestens" und „mehr als" brauchst du das Gegenereignis.`],
    explain: `„${kinds[kind][0][0].toUpperCase()}${kinds[kind][0].slice(1)}" bedeutet ${tex(`${kinds[kind][2]}\\le X\\le ${kinds[kind][3]}`)}, also ${tex(kinds[kind][1])}.`, n, p, lo: kinds[kind][2], hi: kinds[kind][3] };
}

/** Sigma-Regeln. */
export function genSigma(lv = 3) {
  const [n, p] = pick(SIGMA_OK.filter(([N, P]) => Number.isInteger(+(N * P).toFixed(6))));
  const mu = Math.round(n * p), sg = Math.round(Math.sqrt(n * p * (1 - p)));
  const k = lv <= 2 ? 1 : pick([1, 2, 3]), PCT = { 1: '68,3', 2: '95,4', 3: '99,7' };
  const O = (r, correct, why) => ({ tex: `[${ft(mu - r)};\\ ${ft(mu + r)}]`, lo: mu - r, hi: mu + r, correct, why });
  const opts = [1, 2, 3].map((j) => O(j * sg, j === k, `Das ist die ${j}σ-Umgebung mit etwa ${PCT[j]} %.`));
  opts.push({ tex: `[${ft(-k * sg)};\\ ${ft(k * sg)}]`, lo: -k * sg, hi: k * sg, correct: false, why: `Die Umgebung liegt um den Erwartungswert ${tex('\\mu')}, nicht um 0.` });
  const out = lv >= 5 || (lv === 4 && rand() < 0.5), OUT = { 1: '31,7', 2: '4,6', 3: '0,3' };
  return { prompt: out ? `${tex('X')} ist binomialverteilt. Nur mit etwa <b>${OUT[k]} %</b> Wahrscheinlichkeit liegt die Trefferzahl <b>außerhalb</b> eines dieser Intervalle. Außerhalb von welchem?` : `${tex('X')} ist binomialverteilt. In welchem Intervall liegt die Trefferzahl mit etwa <b>${PCT[k]} %</b> Wahrscheinlichkeit?`,
    formula: lv <= 2 ? `\\mu=${mu},\\quad\\sigma=${sg}` : `n=${n},\\quad p=${ft(p)}`, options: shuffle(opts),
    hints: [`${tex('\\mu=n\\,p')} und ${tex('\\sigma=\\sqrt{n\\,p\\,(1-p)}')}.`, out ? `Außerhalb heißt: 100 % minus die Wahrscheinlichkeit innerhalb. ${OUT[k]} % außerhalb bedeutet ${PCT[k]} % innerhalb.` : 'Sigma-Regeln: 1σ ≈ 68,3 %, 2σ ≈ 95,4 %, 3σ ≈ 99,7 %.'],
    explain: `${tex(`\\mu=${mu}`)}, ${tex(`\\sigma=${sg}`)}; die ${k}σ-Umgebung ist ${tex(`[${mu}-${k * sg};\\ ${mu}+${k * sg}]=[${mu - k * sg};\\ ${mu + k * sg}]`)}.`, n, p, k };
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

/** Hypothesentest: Begriffe (leicht) oder Ablehnungsbereich (ab mittel). */
export function genHypothese(lv = 3) {
  if (lv <= 2) {
    const Q = pick(HYP);
    const keys = shuffle([Q.key, ...shuffle(Object.keys(HYP_OPT).filter((k) => k !== Q.key)).slice(0, 3)]);
    return { prompt: Q.q, options: keys.map((k) => ({ tex: HYP_OPT[k], html: HYP_OPT[k], key: k, correct: k === Q.key, why: HYP_WHY[k] })),
      hints: ['Die Nullhypothese ist die Annahme, die geprüft wird.', '1. Art: zu Unrecht abgelehnt. 2. Art: zu Unrecht beibehalten.'], explain: HYP_OPT[Q.key], kind: 'begriff', expect: Q.key };
  }
  for (;;) {
    const n = pick(tier(lv, [20], [20], [20, 25, 30], [30, 50], [50, 100])), p0 = pick([0.3, 0.4, 0.5]), al = pick([0.05, 0.1]);
    const up = (k) => 1 - cdf(n, p0, k - 1);
    let k = 0; while (up(k) > al) k++;
    if ([k - 1, k].some((j) => Math.abs(up(j) - al) < 0.004) || k >= n - 1) continue;
    const O = (lo, hi, correct, why) => ({ tex: `\\{${lo},\\dots,${hi}\\}`, lo, hi, correct, why });
    const opts = [O(k, n, true),
      O(k - 1, n, false, `${tex(`P(X\\ge ${k - 1})\\approx${ft(up(k - 1), 4)}`)} ist größer als ${tex(ft(al))} – das Niveau wäre überschritten.`),
      O(k + 1, n, false, `Der Ablehnungsbereich soll so groß wie möglich sein: Schon ${tex(`P(X\\ge ${k})\\approx${ft(up(k), 4)}`)} hält das Niveau ein.`),
      O(0, n - k, false, `Vermutet wird ${tex(`p>${ft(p0)}`)}: Gegen die Nullhypothese sprechen <b>große</b> Trefferzahlen (rechtsseitiger Test).`)];
    return { prompt: `${tex(`H_0\\colon p=${ft(p0)}`)} wird gegen ${tex(`H_1\\colon p>${ft(p0)}`)} getestet, mit ${n} Versuchen auf dem Niveau ${ft(al * 100)} %. Welcher Ablehnungsbereich ist richtig?`,
      formula: `\\def\\arraystretch{1.35}\\begin{array}{l}P(X\\ge ${k - 1})\\approx${ft(up(k - 1), 4)}\\\\P(X\\ge ${k})\\approx${ft(up(k), 4)}\\\\P(X\\ge ${k + 1})\\approx${ft(up(k + 1), 4)}\\end{array}`,
      options: shuffle(opts),
      hints: ['Gesucht ist die kleinste Trefferzahl k, für die P(X ≥ k) das Niveau nicht überschreitet.', `Vergleiche die drei Werte mit ${ft(al)}.`],
      explain: `${tex(`P(X\\ge ${k})\\approx${ft(up(k), 4)}\\le ${ft(al)}`)}, aber ${tex(`P(X\\ge ${k - 1})\\approx${ft(up(k - 1), 4)}>${ft(al)}`)}. Also ${tex(`K=\\{${k},\\dots,${n}\\}`)}.`, kind: 'bereich', n, p0, al };
  }
}

const PHI = { '-2': 0.0228, '-1': 0.1587, 1: 0.8413, 2: 0.9772 };

/** Normalverteilung: standardisieren oder Sigma-Regel einseitig. */
export function genNormal(lv = 3) {
  for (;;) {
    const mu = pick([50, 100, 170, 500]), sg = pick(tier(lv, [5, 10], [5, 10], [4, 8, 20], [6, 12, 25], [7, 15, 35]));
    if (lv >= 4 && rand() < 0.5) {
      const k = pick([-2, -1, 1, 2]), x = mu + k * sg, inner = Math.abs(k) === 1 ? 0.6827 : 0.9545;
      const O = (num, correct, why) => ({ tex: `${ft(num * 100, 1)}\\,\\%`, num, correct, why });
      const opts = [O(PHI[k], true), O(inner, false, `Das ist ${tex(`P(\\mu-${Math.abs(k)}\\sigma\\le X\\le\\mu+${Math.abs(k)}\\sigma)`)} – hier ist nur eine Seite begrenzt.`), O(1 - PHI[k], false, `Das ist die Gegenwahrscheinlichkeit ${tex(`P(X>${x})`)}.`), O(0.5, false, `Das wäre ${tex('P(X\\le\\mu)')}.`)];
      return { prompt: `${tex('X')} ist normalverteilt. Wie groß ist ${tex(`P(X\\le ${x})`)} ungefähr?`, formula: `\\mu=${mu},\\quad\\sigma=${sg}`, options: shuffle(opts),
        hints: [`${x} liegt ${Math.abs(k)} Standardabweichung${Math.abs(k) > 1 ? 'en' : ''} ${k > 0 ? 'über' : 'unter'} dem Erwartungswert.`, `Die ${Math.abs(k)}σ-Umgebung enthält etwa ${ft(inner * 100, 1)} %. Der Rest verteilt sich gleichmäßig auf beide Seiten.`],
        explain: `Außerhalb der ${Math.abs(k)}σ-Umgebung liegen ${tex(`${ft((1 - inner) * 100, 1)}\\,\\%`)}, je Seite die Hälfte. Also ${tex(`P(X\\le ${x})\\approx${ft(PHI[k] * 100, 1)}\\,\\%`)}.`, kind: 'phi', mu, sg, x };
    }
    const z = pick(lv <= 2 ? [1, 2, -1, -2] : [1, 2, -1, -2, 1.5, -1.5, 0.5, 2.5]), x = mu + z * sg;
    const O = (num, correct, why) => ({ tex: `z=${ft(num, 3)}`, num, correct, why });
    const opts = [O(z, true), O(-z, false, `Reihenfolge: ${tex('x-\\mu')}, nicht ${tex('\\mu-x')}.`), O(z / sg, false, `Geteilt wird durch ${tex('\\sigma')}, nicht durch ${tex('\\sigma^2')}.`), O(x / sg, false, `Zuerst ${tex('\\mu')} abziehen, dann durch ${tex('\\sigma')} teilen.`)];
    if (!uniqNum(opts)) continue;
    return { prompt: `${tex('X')} ist normalverteilt. Welcher standardisierte Wert ${tex('z')} gehört zu ${tex(`x=${ft(x)}`)}?`, formula: `\\mu=${mu},\\quad\\sigma=${sg}`, options: shuffle(opts),
      hints: [`${tex('z=\\dfrac{x-\\mu}{\\sigma}')}.`, `${tex(`x-\\mu=${ft(x - mu)}`)}.`], explain: `${tex(`z=\\dfrac{${ft(x)}-${mu}}{${sg}}=${ft(z)}`)}: ${ft(x)} liegt ${ft(Math.abs(z))} Standardabweichung${Math.abs(z) === 1 ? '' : 'en'} ${z > 0 ? 'über' : 'unter'} dem Erwartungswert.`, kind: 'z', mu, sg, x };
  }
}

const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));

/** Kombinatorik: das richtige Zählmodell wählen. */
export function genKombinatorik(lv = 3) {
  for (;;) {
    const kind = pick(['perm', 'var', 'komb', 'mitW']);
    const n = ri(tier(lv, 4, 4, 5, 6, 8), tier(lv, 5, 6, 8, 10, 12)), k = ri(2, Math.min(n - 2, tier(lv, 2, 3, 3, 4, 5)));
    const O = (t, num, correct, why) => ({ tex: t, num, correct, why });
    let text, opts;
    if (kind === 'perm') {
      text = `Auf wie viele Arten können sich ${n} Personen in einer Reihe aufstellen?`;
      opts = [O(`${n}!`, fact(n), true), O(`${n}^{${n}}`, n ** n, false, 'Das gilt, wenn jede Person mehrfach vorkommen dürfte. Hier steht jede genau einmal.'), O(`\\binom{${n}}{2}`, binom(n, 2), false, 'Das zählt Zweiergruppen, keine Reihenfolgen.'), O(`${n}\\cdot${n - 1}`, n * (n - 1), false, 'Das zählt nur die ersten beiden Plätze.')];
    } else {
      const E = { mitW: [`${n}^{${k}}`, n ** k, 'Das gilt mit Wiederholung: Jede der Stellen kann jeden Wert annehmen.'], var: [`\\dfrac{${n}!}{${n - k}!}`, fact(n) / fact(n - k), 'Das gilt, wenn die Reihenfolge wichtig ist und nichts doppelt vorkommt.'], komb: [`\\binom{${n}}{${k}}`, binom(n, k), 'Das gilt, wenn die Reihenfolge egal ist.'], vert: [`${k}^{${n}}`, k ** n, 'Basis und Exponent sind vertauscht.'] };
      text = { mitW: `Ein Zahlenschloss hat ${k} Stellen, jede kann ${n} verschiedene Zeichen zeigen. Wie viele Einstellungen gibt es?`, var: `Bei einem Rennen starten ${n} Läufer. Wie viele Möglichkeiten gibt es für die Plätze 1 bis ${k}?`, komb: `Aus ${n} Schülern wird ein Team von ${k} gewählt. Wie viele Teams sind möglich?` }[kind];
      opts = Object.keys(E).map((key) => O(E[key][0], E[key][1], key === kind, E[key][2]));
    }
    if (!uniqNum(opts)) continue;
    return { prompt: text, options: shuffle(opts), hints: ['Zwei Fragen: Ist die Reihenfolge wichtig? Darf etwas mehrfach vorkommen?', 'Reihenfolge egal: Binomialkoeffizient. Mit Wiederholung: Potenz. Sonst: Fakultäten.'],
      explain: `Hier gilt ${tex(`${opts.find((o) => o.correct).tex}=${ft(opts.find((o) => o.correct).num)}`)}.`, kind, n, k };
  }
}

/* ───────────── Analytische Geometrie ───────────── */

/** Punktprobe: Liegt der Punkt auf der Geraden? */
export function genGeradePunkt(lv = 3) {
  for (;;) {
    const R = tier(lv, 2, 3, 4, 5, 6);
    const P = rv(R), u = nonzeroVec(Math.min(R, 4), 3), t0 = pick(lv <= 2 ? [1, 2, 3] : [2, 3, -1, -2, 4]);
    const on = rand() < 0.6;
    const Q = add(P, u, t0); if (!on) Q[2] += pick([1, -1, 2]);
    const O = (t, correct, why) => ({ tex: t === null ? 'Nein' : `Ja, für t = ${ft(t)}`, html: t === null ? 'Nein, der Punkt liegt nicht auf der Geraden.' : `Ja, für ${tex(`t=${ft(t)}`)}.`, t, correct, why });
    const opts = [O(t0, on, `Die ersten beiden Zeilen passen für ${tex(`t=${ft(t0)}`)}, die dritte aber nicht: Alle drei Zeilen müssen mit demselben ${tex('t')} stimmen.`),
      O(-t0, false, `Vorzeichen: Aus der ersten Zeile folgt ${tex(`t=${ft(t0)}`)}.`),
      O(t0 + 1, false, `Aus der ersten Zeile folgt ${tex(`t=${ft(t0)}`)}.`),
      O(null, !on, `Setze ${tex(`t=${ft(t0)}`)} ein: Alle drei Zeilen stimmen.`)];
    return { prompt: `Liegt der Punkt ${tex(pt('Q', Q))} auf der Geraden?`, formula: lineVecTex(P, u), options: shuffle(opts),
      hints: [`Bestimme ${tex('t')} aus der ersten Zeile.`, 'Prüfe damit die zweite und die dritte Zeile.'],
      explain: on ? `Für ${tex(`t=${ft(t0)}`)} stimmen alle drei Zeilen – ${tex('Q')} liegt auf ${tex('g')}.` : `Die ersten beiden Zeilen liefern ${tex(`t=${ft(t0)}`)}, die dritte aber einen Widerspruch – ${tex('Q')} liegt nicht auf ${tex('g')}.`,
      P, u, Q };
  }
}

/** Welcher Punkt liegt in der Ebene? */
export function genEbene(lv = 3) {
  for (;;) {
    const R = tier(lv, 2, 3, 3, 4, 6);
    const n = nonzeroVec(R, lv <= 1 ? 2 : 3), S = rv(R + 1), d = dot(n, S);
    const others = [];
    for (let guard = 0; others.length < 3 && guard < 60; guard++) {
      const X = add(S, pick([[1, 0, 0], [0, 1, 0], [0, 0, 1], [1, 1, 0], [0, -1, 1], [-1, 0, 1], [1, -1, 0]]), pick([1, -1, 2]));
      if (dot(n, X) !== d && !others.some((o) => same(o, X))) others.push(X);
    }
    if (others.length < 3) continue;
    const O = (X, correct) => ({ tex: pt('P', X), vec: X, correct, why: correct ? undefined : `Einsetzen ergibt ${tex(ft(dot(n, X)))}, nicht ${tex(ft(d))}.` });
    return { prompt: 'Welcher Punkt liegt in der Ebene?', formula: `E:\\ ${planeTex(n, d)}`, options: shuffle([O(S, true), ...others.map((X) => O(X, false))]),
      hints: ['Punktprobe: Koordinaten in die Gleichung einsetzen.', 'Nur wenn links genau die rechte Seite herauskommt, liegt der Punkt in der Ebene.'],
      explain: `${tex(`${n.map((c, i) => `${par(c)}\\cdot${par(S[i])}`).join('+')}=${ft(d)}`)} – der Punkt erfüllt die Gleichung.`, n, d };
  }
}

/** Lage zweier Geraden zueinander. */
export function genLage(lv = 3) {
  for (;;) {
    const R = tier(lv, 2, 2, 3, 4, 5);
    const kind = pick(['identisch', 'parallel', 'schnitt', 'windschief']);
    const P = rv(R), u = nonzeroVec(Math.min(R, 3), 2);
    let v, Q, S = null;
    if (kind === 'identisch' || kind === 'parallel') {
      const kf = pick([2, -1, -2, 3]);
      v = u.map((c) => c * kf);
      Q = add(P, u, pick([1, 2, -1]));
      if (kind === 'parallel') { const w = pick([[1, 0, 0], [0, 1, 0], [0, 0, 1]]); if (zero(cross(w, u))) continue; Q = add(Q, w, pick([1, 2, -1])); }
    } else {
      v = nonzeroVec(Math.min(R, 3), 2);
      const n = cross(u, v); if (zero(n)) continue;
      S = add(P, u, pick([1, 2, -1]));
      Q = add(S, v, pick([1, -1, -2]));
      if (kind === 'windschief') { const w = [[1, 0, 0], [0, 1, 0], [0, 0, 1]].find((e) => dot(e, n) !== 0); Q = add(Q, w, pick([1, -1, 2])); }
    }
    if (Q.some((c) => Math.abs(c) > 15)) continue;
    const L = { identisch: 'identisch', parallel: 'echt parallel', schnitt: 'Sie schneiden sich in einem Punkt.', windschief: 'windschief' };
    const par_ = kind === 'identisch' || kind === 'parallel';
    const why = (k) => {
      if (par_ && (k === 'schnitt' || k === 'windschief')) return 'Die Richtungsvektoren sind Vielfache voneinander – die Geraden sind parallel oder identisch.';
      if (!par_ && (k === 'identisch' || k === 'parallel')) return 'Die Richtungsvektoren sind keine Vielfachen voneinander.';
      if (kind === 'parallel') return `Punktprobe: Der Stützpunkt von ${tex('h')} liegt nicht auf ${tex('g')}.`;
      if (kind === 'identisch') return `Punktprobe: Der Stützpunkt von ${tex('h')} liegt auf ${tex('g')} – die Geraden sind identisch.`;
      if (kind === 'windschief') return 'Gleichsetzen führt zu einem Widerspruch: Es gibt keinen gemeinsamen Punkt.';
      return `Gleichsetzen ist lösbar: Die Geraden treffen sich in ${tex(pt('S', S))}.`;
    };
    return { prompt: 'Wie liegen die beiden Geraden zueinander?', formula: `\\begin{array}{l}${lineVecTex(P, u, 'g', 't')}\\\\[6pt]${lineVecTex(Q, v, 'h', 's')}\\end{array}`,
      options: shuffle(Object.keys(L).map((k) => ({ tex: L[k], html: L[k], key: k, correct: k === kind, why: why(k) }))),
      hints: ['Erster Schritt: Sind die Richtungsvektoren Vielfache voneinander?', par_ ? 'Dann entscheidet die Punktprobe zwischen parallel und identisch.' : 'Dann gleichsetzen: lösbar heißt Schnittpunkt, Widerspruch heißt windschief.'],
      explain: par_ ? `Die Richtungsvektoren sind Vielfache. ${kind === 'identisch' ? 'Der Stützpunkt von h liegt auf g: identisch.' : 'Der Stützpunkt von h liegt nicht auf g: echt parallel.'}` : `Die Richtungsvektoren sind keine Vielfachen. ${kind === 'schnitt' ? `Gleichsetzen liefert den Schnittpunkt ${tex(pt('S', S))}.` : 'Gleichsetzen führt zu einem Widerspruch: windschief.'}`,
      P, u, Q, v, kind };
  }
}

/** Schnittpunkt von Gerade und Ebene. */
export function genSchnittpunkt(lv = 3) {
  for (;;) {
    const R = tier(lv, 2, 2, 3, 4, 5);
    const n = nonzeroVec(Math.min(R, 3), lv <= 1 ? 1 : 2), u = nonzeroVec(Math.min(R, 3), 2);
    if (dot(n, u) === 0) continue;
    const S = rv(R), t0 = pick([1, 2, -1, 3, -2]), P = add(S, u, -t0), d = dot(n, S);
    if (P.some((c) => Math.abs(c) > 14)) continue;
    const O = (X, correct, why) => ({ tex: pt('S', X), vec: X, correct, why });
    const opts = [O(S, true), O(add(P, u, -t0), false, `Vorzeichen beim Auflösen: ${tex(`t=${ft(t0)}`)}, nicht ${tex(`t=${ft(-t0)}`)}.`), O(add(P, u, t0 + (t0 === -1 ? -1 : 1)), false, `Probe: Einsetzen in ${tex('E')} ergibt ${tex(ft(dot(n, add(P, u, t0 + (t0 === -1 ? -1 : 1)))))}, nicht ${tex(ft(d))}.`), O(P, false, `Das ist der Stützpunkt (${tex('t=0')}). Er liegt nicht in ${tex('E')}.`)];
    return { prompt: `In welchem Punkt schneidet die Gerade ${tex('g')} die Ebene ${tex('E')}?`, formula: `\\begin{array}{l}E:\\ ${planeTex(n, d)}\\\\[6pt]${lineVecTex(P, u)}\\end{array}`, options: shuffle(opts),
      hints: [`Setze die drei Zeilen von ${tex('g')} für ${tex('x_1, x_2, x_3')} in ${tex('E')} ein.`, `Es ergibt sich ${tex(`t=${ft(t0)}`)}. Setze das in ${tex('g')} ein.`],
      explain: `Einsetzen liefert ${tex(`t=${ft(t0)}`)} und damit ${tex(pt('S', S))}.`, n, d, P, u };
  }
}

/** Abstand: zwei Punkte (leicht) oder Punkt–Ebene (ab mittel). */
export function genAbstand(lv = 3) {
  for (;;) {
    const mk = (num, correct, why) => ({ tex: ft(num), num, correct, why });
    if (lv <= 2) {
      const [w, len] = tripVec(lv), A = rv(3), B = add(A, w), abs = w.map(Math.abs);
      const opts = [mk(len, true), mk(abs[0] + abs[1] + abs[2], false, 'Die Koordinaten-Unterschiede werden quadriert, addiert – und dann die Wurzel gezogen.'), mk(len * len, false, 'Hier fehlt die Wurzel.'), mk(Math.max(...abs), false, 'Der Abstand ist größer als jeder einzelne Koordinaten-Unterschied.')];
      if (!uniqNum(opts)) continue;
      return { prompt: `Wie weit sind die Punkte ${tex('A')} und ${tex('B')} voneinander entfernt?`, formula: `${pt('A', A)},\\quad ${pt('B', B)}`, options: shuffle(opts),
        hints: [`Abstand = Länge von ${tex('\\overrightarrow{AB}')}.`, `${tex(`\\overrightarrow{AB}=${vecTex(w)}`)}.`], explain: `${tex(`|\\overrightarrow{AB}|=\\sqrt{${w.map((c) => `${par(c)}^2`).join('+')}}=${len}`)}.`, kind: 'punkte', A, B };
    }
    const [n, L] = tripVec(lv), S = rv(3), d = dot(n, S), k = pick([1, 2, -1, -2, 3]);
    const inPlane = [n[1], -n[0], 0];
    const P = add(add(S, n, k), inPlane, pick([0, 1, -1]));
    if (P.some((c) => Math.abs(c) > 30)) continue;
    const num = Math.abs(dot(n, P) - d);
    const opts = [mk(num / L, true), mk(num, false, `Es fehlt das Teilen durch die Länge des Normalenvektors ${tex(`|\\vec n|=${L}`)}.`), mk(Math.abs(dot(n, P) + d) / L, false, `Vorzeichen: Im Zähler steht ${tex('|\\vec n\\cdot\\vec p-d|')}.`), mk(num / (L * L), false, `Geteilt wird durch ${tex('|\\vec n|')}, nicht durch ${tex('|\\vec n|^2')}.`)];
    if (!uniqNum(opts)) continue;
    return { prompt: `Wie groß ist der Abstand des Punktes ${tex('P')} von der Ebene ${tex('E')}?`, formula: `E:\\ ${planeTex(n, d)},\\quad ${pt('P', P)}`, options: shuffle(opts),
      hints: [`${tex('d(P;E)=\\dfrac{|n_1p_1+n_2p_2+n_3p_3-d|}{|\\vec n|}')}.`, `${tex(`|\\vec n|=${L}`)} und der Zähler ist ${tex(ft(num))}.`],
      explain: `${tex(`d(P;E)=\\dfrac{|${ft(dot(n, P))}-${par(d)}|}{${L}}=${ft(num / L)}`)}.`, kind: 'ebene', n, d, P };
  }
}

/** Winkel zwischen zwei Vektoren: die richtige Rechnung. */
export function genWinkel(lv = 3) {
  for (;;) {
    const [u, Lu] = tripVec(lv), [v, Lv] = tripVec(lv), D = dot(u, v);
    if (D === 0 || Math.abs(D) === Lu * Lv) continue;
    const O = (t, num, correct, why) => ({ tex: `\\cos\\varphi=${t}`, num, correct, why });
    const opts = [O(dfrac(ft(D), `${Lu}\\cdot${Lv}`), D / (Lu * Lv), true), O(dfrac(ft(D), `${Lu}+${Lv}`), D / (Lu + Lv), false, 'Im Nenner werden die Längen multipliziert, nicht addiert.'), O(dfrac(`${Lu}\\cdot${Lv}`, ft(D)), (Lu * Lv) / D, false, 'Zähler und Nenner sind vertauscht: Das Skalarprodukt steht oben.'), O(dfrac(ft(D), `${Lu}^2\\cdot${Lv}^2`), D / (Lu * Lu * Lv * Lv), false, 'Im Nenner stehen die Längen selbst, nicht ihre Quadrate.')];
    if (!uniqNum(opts)) continue;
    return { prompt: `Welche Rechnung liefert den Winkel ${tex('\\varphi')} zwischen den Vektoren?`, formula: `\\vec u=${vecTex(u)},\\quad \\vec v=${vecTex(v)}`, options: shuffle(opts),
      hints: [`${tex('\\cos\\varphi=\\dfrac{\\vec u\\cdot\\vec v}{|\\vec u|\\cdot|\\vec v|}')}.`, `${tex(`\\vec u\\cdot\\vec v=${ft(D)}`)}, ${tex(`|\\vec u|=${Lu}`)}, ${tex(`|\\vec v|=${Lv}`)}.`],
      explain: `${tex(`\\cos\\varphi=${dfrac(ft(D), `${Lu}\\cdot${Lv}`)}`)}, also ${tex(`\\varphi\\approx${ft((Math.acos(D / (Lu * Lv)) * 180) / Math.PI, 1)}^\\circ`)}.`, u, v };
  }
}

/** Kreuzprodukt (Normalenvektor). */
export function genKreuz(lv = 3) {
  for (;;) {
    const R = tier(lv, 2, 2, 3, 4, 5);
    const u = lv <= 1 ? rv(R).map(Math.abs) : rv(R), v = lv <= 1 ? rv(R).map(Math.abs) : rv(R), c = cross(u, v);
    if (zero(c) || c[1] === 0) continue;
    const O = (vec, correct, why) => ({ tex: vecTex(vec), vec, correct, why });
    const opts = [O(c, true), O([c[0], -c[1], c[2]], false, `Mittlere Zeile: ${tex('u_3v_1-u_1v_3')} – hier ist die Reihenfolge anders als oben und unten.`), O(u.map((x, i) => x * v[i]), false, 'Zeilenweise multiplizieren gehört zum Skalarprodukt. Das Kreuzprodukt wird „über Kreuz" gebildet.'), O(c.map((x) => -x), false, `Reihenfolge vertauscht: Das ist ${tex('\\vec v\\times\\vec u')}.`)];
    if (opts.some((a, i) => opts.some((b, j) => i < j && same(a.vec, b.vec)))) continue;
    return { prompt: `Berechne das Kreuzprodukt ${tex('\\vec u\\times\\vec v')}.`, formula: `\\vec u=${vecTex(u)},\\quad \\vec v=${vecTex(v)}`, options: shuffle(opts),
      hints: [`${tex('\\vec u\\times\\vec v=\\begin{pmatrix}u_2v_3-u_3v_2\\\\u_3v_1-u_1v_3\\\\u_1v_2-u_2v_1\\end{pmatrix}')}.`, 'Probe: Das Ergebnis steht senkrecht auf beiden Vektoren – beide Skalarprodukte müssen 0 sein.'],
      explain: `${tex(`\\vec u\\times\\vec v=${vecTex(c)}`)}. Probe: Das Skalarprodukt mit ${tex('\\vec u')} und mit ${tex('\\vec v')} ist jeweils 0.`, u, v };
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

/** Was verlangt der Operator? */
export function genOperator(lv = 3) {
  const pool = OPERATOREN.slice(0, tier(lv, 7, 8, 10, 12, 12));
  const idx = shuffle(pool.map((_, i) => i)).slice(0, 4), right = idx[0];
  return { prompt: `Was verlangt der Operator <b>„${pool[right][0]}"</b>?`,
    options: shuffle(idx).map((i) => ({ tex: pool[i][1], html: pool[i][1], key: pool[i][0], correct: i === right, why: `Das beschreibt „${pool[i][0]}".` })),
    hints: ['Achte darauf, ob ein Rechenweg, eine Begründung oder nur das Ergebnis verlangt ist.', 'Vergleiche mit ähnlichen Operatoren: Wo liegt der Unterschied?'],
    explain: `„${pool[right][0]}": ${pool[right][1]}`, expect: pool[right][0] };
}

/* ───────────── Themen-Namen ───────────── */
for (const [fn, topic] of [[genWendestelle, 'Wendepunkte'], [genMonotonie, 'Monotonie'], [genSymmetrie, 'Symmetrie'], [genGrenzwert, 'Grenzwerte'], [genTangente, 'Tangentengleichung'],
  [genSteckbrief, 'Steckbriefaufgaben'], [genSchar, 'Funktionenscharen'], [genExtremwert, 'Extremwertaufgaben'], [genLn, 'ln-Funktion ableiten'], [genWachstum, 'Wachstum'],
  [genFlaecheZwischen, 'Fläche zwischen Graphen'], [genVierfelder, 'Vierfeldertafel'], [genBedingt, 'Bedingte Wahrscheinlichkeit'], [genKumuliert, 'Kumulierte Binomialverteilung'],
  [genSigma, 'Sigma-Regeln'], [genHypothese, 'Hypothesentests'], [genNormal, 'Normalverteilung'], [genKombinatorik, 'Kombinatorik'], [genGeradePunkt, 'Geraden: Punktprobe'],
  [genEbene, 'Ebenen: Punktprobe'], [genLage, 'Lage von Geraden'], [genSchnittpunkt, 'Schnitt Gerade–Ebene'], [genAbstand, 'Abstände'], [genWinkel, 'Winkel'], [genKreuz, 'Kreuzprodukt'], [genOperator, 'Operatoren']]) fn.topic = topic;
