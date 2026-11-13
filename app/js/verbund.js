// Abi-Aufgaben am Stück: ein Sachverhalt, mehrere Teilaufgaben a), b), c) … – wie in der Prüfung.
// Jede Teilaufgabe ist eine gewöhnliche Auswahl-Aufgabe (Ablenker = typische Fehler). Rechen-Felder für tests/run.mjs.
import { ri, pick, shuffle, ft, polyTex, polyEval, polyDeriv } from './math.js';
import { tex } from './ui.js';
import { tier, par, vecTex, uniq, uniqNum, same, binom } from './gen.js';

const P = (x, y) => `(${ft(x)}\\mid ${ft(y)})`;
const fin = (parts) => parts.map((q, i) => ({ ...q, prompt: `<b>${'abcdef'[i]})</b> ${q.prompt}`, options: shuffle(q.options) }));

/** Analysis: eine ganzrationale Funktion vollständig untersuchen. */
export function verbundAnalysis(lv = 3) {
  for (;;) {
    const [p, q] = pick(tier(lv, [[0, 2], [-1, 1]], [[0, 2], [-1, 1], [1, 3]], [[-2, 0], [1, 3], [-1, 3]], [[-2, 2], [-3, 1], [0, 4]], [[-3, 1], [-2, 4], [1, 5]]));
    const k = lv >= 4 ? pick([2, -1, -2]) : 1, d = lv >= 3 ? pick([1, 2, -2, 4]) : 0;
    const f = [d, 3 * p * q * k, -1.5 * (p + q) * k, k], f1 = polyDeriv(f), f2 = polyDeriv(f1);
    const F = (x) => polyEval(f, x), xw = (p + q) / 2, xH = k > 0 ? p : q, xT = k > 0 ? q : p;
    const Fst = [0, d, 1.5 * p * q * k, -0.5 * (p + q) * k, k / 4], a = 0;
    // obere Grenze so wählen, dass die vier Antworten zum Integral verschieden sind
    const b = shuffle([1, 2, 3, 4]).find((t) => { const v = [polyEval(Fst, t), -polyEval(Fst, t), polyEval(f, t) - d, polyEval(f1, t) - f1[0]]; return v.every((x, i) => v.every((y, j) => i === j || Math.abs(x - y) > 0.3)); });
    if (!b) continue;
    const I = polyEval(Fst, b) - polyEval(Fst, a);
    const D = (c, correct, why) => ({ tex: `f'(x)=${polyTex(c)}`, correct, why, val: (x) => polyEval(c, x) });
    const X = (xs, correct, why) => ({ tex: `x_1=${ft(xs[0])},\\quad x_2=${ft(xs[1])}`, xs, correct, why });
    const Pt = (name, x, y, correct, why) => ({ tex: `${name}${P(x, y)}`, pt: [x, y], hoch: name === 'H', correct, why });
    const N = (num, correct, why, t) => ({ tex: t ?? ft(num, 2), num, correct, why });
    const parts = [
      { prompt: `Bestimme die Ableitung ${tex("f'")}.`, kind: 'abl',
        options: [D(f1, true), D([f1[0], f1[1], f[3]], false, 'Der alte Exponent kommt als Faktor nach vorn: aus x³ wird 3x².'), D([f[1], f[2], f[3]], false, 'Die Exponenten wurden gesenkt, aber die Vorfaktoren nicht mit dem alten Exponenten multipliziert.'), d ? D([f1[0] + d, f1[1], f1[2]], false, 'Eine Zahl ohne x fällt beim Ableiten weg – und zu ihr kommt nichts hinzu.') : D(f1[1] ? [f1[0], -f1[1], f1[2]] : [f1[0] + 3, 0, f1[2]], false, 'Achte beim Ableiten auf Vorzeichen und Vorfaktoren jedes einzelnen Summanden.')],
        hints: ['Potenzregel für jeden Summanden.', `${tex("(x^n)'=n\\,x^{n-1}")} – eine Zahl ohne x fällt weg.`], explain: `${tex(`f'(x)=${polyTex(f1)}`)}.` },
      { prompt: 'An welchen Stellen hat der Graph waagerechte Tangenten?', kind: 'stellen',
        options: [X([p, q], true), X([-q, -p], false, `Vorzeichen: ${tex(`f'(x)=${ft(3 * k)}(x${p < 0 ? '+' : '-'}${Math.abs(p)})(x${q < 0 ? '+' : '-'}${Math.abs(q)})`)}.`), X([p + 1, q + 1], false, 'Setze die Stellen zur Probe in f′ ein: Es muss 0 herauskommen.'), (Math.min(p * q, p + q) === p && Math.max(p * q, p + q) === q) ? X([p - 1, q - 1], false, 'Setze die Stellen zur Probe in f′ ein: Es muss 0 herauskommen.') : X([Math.min(p * q, p + q), Math.max(p * q, p + q)], false, 'Das sind Produkt und Summe der Lösungen, nicht die Lösungen.')],
        hints: [`Waagerechte Tangente heißt ${tex("f'(x)=0")}.`, `Teile durch ${tex(ft(3 * k))} und löse die quadratische Gleichung.`], explain: `${tex(`f'(x)=${polyTex(f1)}=0`)} liefert ${tex(`x_1=${ft(p)}`)} und ${tex(`x_2=${ft(q)}`)}.` },
      { prompt: 'Welcher Extrempunkt ist richtig angegeben?', kind: 'extrem',
        options: [Pt('H', xH, F(xH), true), Pt('T', xH, F(xH), false, `${tex(`f''(${ft(xH)})=${ft(polyEval(f2, xH))}<0`)}: Das ist ein Hochpunkt.`), Pt('H', xT, F(xT), false, `${tex(`f''(${ft(xT)})=${ft(polyEval(f2, xT))}>0`)}: Dort liegt der Tiefpunkt.`), Pt('H', xH, polyEval(f1, xH) + F(xH) + 1, false, 'Der y-Wert entsteht durch Einsetzen in f, nicht in f′.')],
        hints: [`Vorzeichen von ${tex("f''")} an der Stelle: negativ → Hochpunkt, positiv → Tiefpunkt.`, `${tex(`f''(x)=${polyTex(f2)}`)}. Den y-Wert liefert ${tex('f')}.`], explain: `${tex(`f''(${ft(xH)})=${ft(polyEval(f2, xH))}<0`)} und ${tex(`f(${ft(xH)})=${ft(F(xH))}`)}: Hochpunkt ${tex(`H${P(xH, F(xH))}`)}.` },
      { prompt: 'Wo liegt die Wendestelle?', kind: 'wende',
        options: [N(xw, true, undefined, `x=${ft(xw)}`), N(p, false, 'Das ist eine Extremstelle. Die Wendestelle liegt bei einer kubischen Funktion genau zwischen den Extremstellen.', `x=${ft(p)}`), N(-xw === xw ? xw + 1 : -xw, false, `Löse ${tex("f''(x)=0")} und achte auf das Vorzeichen.`, `x=${ft(-xw === xw ? xw + 1 : -xw)}`), N(p + q === xw ? xw + 2 : p + q, false, `Beim Auflösen von ${tex(`${polyTex(f2)}=0`)} muss noch geteilt werden.`, `x=${ft(p + q === xw ? xw + 2 : p + q)}`)],
        hints: [`Wendestelle: ${tex("f''(x)=0")}.`, `${tex(`f''(x)=${polyTex(f2)}`)}.`], explain: `${tex(`f''(x)=${polyTex(f2)}=0`)} bei ${tex(`x=${ft(xw)}`)} – genau in der Mitte zwischen den Extremstellen.` },
      { prompt: `Berechne ${tex(`\\int_{${a}}^{${b}}f(x)\\,dx`)}.`, kind: 'integral',
        options: [N(I, true), N(-I, false, 'Obere Grenze minus untere Grenze – nicht umgekehrt.'), N(F(b) - F(a), false, 'Du hast die Grenzen in f eingesetzt. Erst die Stammfunktion bilden.'), N(polyEval(f1, b) - polyEval(f1, a), false, 'Du hast abgeleitet statt aufgeleitet.')],
        hints: ['Stammfunktion bilden, dann obere minus untere Grenze.', `${tex(`F(x)=${polyTex(Fst)}`)}.`], explain: `${tex(`\\bigl[${polyTex(Fst)}\\bigr]_{${a}}^{${b}}=${ft(I, 2)}`)}.` },
    ];
    if (parts.some((t) => !uniq(t.options)) || !uniqNum(parts[3].options) || !uniqNum(parts[4].options) || F(xH) === F(xT)) continue;
    return { art: 'analysis', title: 'Funktionsuntersuchung', intro: `Gegeben ist die Funktion ${tex('f')} mit`, formula: `f(x)=${polyTex(f)}`, parts: fin(parts), f: F, a, b, be: [2, 3, 3, 2, 3] };
  }
}

/** Stochastik: eine Bernoulli-Kette von allen Seiten. */
export function verbundStochastik(lv = 3) {
  for (;;) {
    const [n, p] = pick(tier(lv, [[10, 0.2], [5, 0.2]], [[20, 0.2], [10, 0.4], [20, 0.25]], [[25, 0.2], [50, 0.2], [20, 0.4]], [[50, 0.4], [25, 0.2], [75, 0.2]], [[100, 0.2], [150, 0.4], [96, 0.25]]));
    const mu = n * p, sg = Math.sqrt(n * p * (1 - p)), k = Math.round(mu) + pick([-1, 1, 2]), q = 1 - p;
    const ctx = pick([['Eine Maschine stellt Bauteile her.', 'ist fehlerhaft', 'Bauteile', 'fehlerhaften Bauteile'], ['Bei einem Glücksrad', 'gewinnt', 'Drehungen', 'Gewinne'], ['Eine Basketballerin wirft Freiwürfe.', 'trifft', 'Würfe', 'Treffer']]);
    const N = (num, correct, why, t) => ({ tex: t ?? ft(num, 2), num, correct, why });
    const B = (t, num, correct, why) => ({ tex: t, num, correct, why });
    const pt = ft(p), qt = ft(q);
    const parts = [
      { prompt: `Wie viele ${ctx[3]} sind bei ${n} ${ctx[2]}n zu erwarten?`.replace('Würfen', 'Würfen').replace('Bauteilen', 'Bauteilen').replace('Drehungenn', 'Drehungen'), kind: 'mu',
        options: [N(mu, true), N(n * q, false, 'Das ist die erwartete Zahl der Nicht-Treffer.'), N(n * p * q, false, `Das ist die Varianz. Der Erwartungswert ist ${tex('n\\cdot p')}.`), N(n / (p * 10) === mu ? mu + 3 : n / (p * 10), false, `Der Erwartungswert ist ${tex('\\mu=n\\cdot p')}.`)],
        hints: [`${tex('\\mu=n\\cdot p')}.`, `${tex(`${n}\\cdot${pt}`)}.`], explain: `${tex(`\\mu=${n}\\cdot${pt}=${ft(mu)}`)}.` },
      { prompt: `Welcher Term gibt die Wahrscheinlichkeit für <b>genau ${k}</b> ${ctx[3]} an?`, kind: 'genau',
        options: [B(`\\binom{${n}}{${k}}\\cdot ${pt}^{${k}}\\cdot ${qt}^{${n - k}}`, binom(n, k) * p ** k * q ** (n - k), true), B(`${pt}^{${k}}\\cdot ${qt}^{${n - k}}`, p ** k * q ** (n - k), false, `Es fehlt der Binomialkoeffizient: Die ${k} Treffer können an verschiedenen Stellen liegen.`), B(`\\binom{${n}}{${k}}\\cdot ${pt}^{${n - k}}\\cdot ${qt}^{${k}}`, binom(n, k) * p ** (n - k) * q ** k, false, 'Die Exponenten sind vertauscht: Der Exponent der Trefferwahrscheinlichkeit ist die Trefferzahl.'), B(`\\binom{${n}}{${k}}\\cdot ${pt}^{${k}}`, binom(n, k) * p ** k, false, `Auch die ${n - k} Nicht-Treffer gehören dazu.`)],
        hints: ['Bernoulli-Formel.', `${tex('P(X=k)=\\binom{n}{k}p^k(1-p)^{n-k}')}.`], explain: `${tex(`P(X=${k})=\\binom{${n}}{${k}}\\cdot ${pt}^{${k}}\\cdot ${qt}^{${n - k}}\\approx${ft(binom(n, k) * p ** k * q ** (n - k) * 100, 1)}\\,\\%`)}.` },
      { prompt: `Welcher Term gibt die Wahrscheinlichkeit für <b>mindestens einen</b> der ${ctx[3]} an?`.replace('einen der Gewinne', 'einen Gewinn').replace('einen der Treffer', 'einen Treffer').replace('einen der fehlerhaften Bauteile', 'ein fehlerhaftes Bauteil'), kind: 'min1',
        options: [B(`1-${qt}^{${n}}`, 1 - q ** n, true), B(`1-${pt}^{${n}}`, 1 - p ** n, false, `Das Gegenereignis ist „kein Treffer" – mit ${tex(qt)} je Versuch.`), B(`${n}\\cdot ${pt}`, n * p, false, 'Das ist der Erwartungswert, keine Wahrscheinlichkeit.'), B(`${qt}^{${n}}`, q ** n, false, 'Das ist die Wahrscheinlichkeit für „kein Treffer". Davon das Gegenteil.')],
        hints: ['„Mindestens einer" ist das Gegenteil von „keiner".', `${tex('P(X\\ge 1)=1-P(X=0)')}.`], explain: `${tex(`P(X\\ge1)=1-${qt}^{${n}}\\approx${ft((1 - q ** n) * 100, 1)}\\,\\%`)}.` },
      { prompt: 'Wie groß ist die Standardabweichung?', kind: 'sigma',
        options: [N(sg, true), N(n * p * q, false, 'Das ist die Varianz. Für die Standardabweichung noch die Wurzel ziehen.'), N(Math.sqrt(n * p), false, `Der Faktor ${tex('(1-p)')} fehlt unter der Wurzel.`), N(mu, false, 'Das ist der Erwartungswert.')],
        hints: [`${tex('\\sigma=\\sqrt{n\\,p\\,(1-p)}')}.`, `Unter der Wurzel steht ${tex(ft(n * p * q, 2))}.`], explain: `${tex(`\\sigma=\\sqrt{${n}\\cdot${pt}\\cdot${qt}}=\\sqrt{${ft(n * p * q, 2)}}\\approx${ft(sg, 2)}`)}.` },
    ];
    if (k < 1 || k >= n || parts.some((t) => !uniq(t.options)) || !uniqNum(parts[0].options) || !uniqNum(parts[3].options)) continue;
    return { art: 'stochastik', title: 'Bernoulli-Kette', intro: `${ctx[0]} Jedes Mal gilt unabhängig voneinander: Mit der Wahrscheinlichkeit ${tex(`p=${pt}`)} ${ctx[1]} ${ctx[0].startsWith('Bei') ? 'man' : ctx[0].startsWith('Eine Maschine') ? 'ein Bauteil' : 'sie'}. Betrachtet werden ${n} ${ctx[2]}.`, formula: `n=${n},\\quad p=${pt}`, parts: fin(parts), n, p, k, be: [2, 3, 3, 2] };
  }
}

/** Geometrie: drei Punkte im Raum. */
export function verbundGeometrie(lv = 3) {
  for (;;) {
    const R = tier(lv, 3, 4, 4, 5, 6), s = lv >= 4 ? pick([1, 2]) : 1;
    const A = [ri(-R, R), ri(-R, R), ri(-R, R)], u = shuffle(pick([[2, 1, 2], [2, 2, 1], [1, 2, 2], [4, 0, 3], [0, 3, 4], [2, 3, 6]])).map((c) => c * s * pick([1, -1]));
    const w = [ri(-3, 3), ri(-3, 3), ri(-3, 3)];
    const B = A.map((c, i) => c + u[i]), C = A.map((c, i) => c + w[i]);
    const len = Math.hypot(...u), dot = u.reduce((t, c, i) => t + c * w[i], 0), M = A.map((c, i) => (c + B[i]) / 2);
    if (w.every((c) => c === 0) || !Number.isInteger(len) || same(u, w)) continue;
    const V = (v, correct, why) => ({ tex: vecTex(v), vec: v, correct, why });
    const N = (num, correct, why) => ({ tex: ft(num, 2), num, correct, why });
    const G = (Pp, r, correct, why) => ({ tex: `\\vec x=${vecTex(Pp)}+t\\cdot${vecTex(r)}`, P: Pp, r, correct, why });
    const Mp = (v, correct, why) => ({ tex: `M(${v.map((c) => ft(c)).join('\\mid ')})`, vec: v, correct, why });
    const parts = [
      { prompt: `Bestimme den Vektor ${tex('\\overrightarrow{AB}')}.`, kind: 'ab',
        options: [V(u, true), V(u.map((c) => -c), false, `„Spitze minus Fuß": ${tex('B-A')}, nicht ${tex('A-B')}.`), V(A.map((c, i) => c + B[i]), false, 'Die Koordinaten werden subtrahiert, nicht addiert.'), V(u.map((c, i) => (i === 2 ? c + 2 * A[2] || c + 1 : c)), false, 'Achte in der dritten Zeile auf „minus minus".')],
        hints: ['Spitze minus Fuß.', `${tex('\\overrightarrow{AB}=B-A')} – Zeile für Zeile.`], explain: `${tex(`\\overrightarrow{AB}=${vecTex(u)}`)}.` },
      { prompt: `Wie lang ist die Strecke ${tex('AB')}?`, kind: 'laenge',
        options: [N(len, true), N(u.reduce((t, c) => t + Math.abs(c), 0), false, 'Die Beträge werden nicht einfach addiert: erst quadrieren, dann addieren, dann die Wurzel ziehen.'), N(len * len, false, 'Hier fehlt die Wurzel.'), N(Math.sqrt(Math.abs(u[0] ** 2 + u[1] ** 2 - u[2] ** 2)) === len ? len + 1 : Math.sqrt(Math.abs(u[0] ** 2 + u[1] ** 2 - u[2] ** 2)), false, 'Alle Quadrate werden addiert – auch bei negativen Koordinaten.')],
        hints: [`${tex('|\\vec v|=\\sqrt{v_1^2+v_2^2+v_3^2}')}.`, `Unter der Wurzel steht ${tex(ft(len * len))}.`], explain: `${tex(`|\\overrightarrow{AB}|=\\sqrt{${u.map((c) => `${par(c)}^2`).join('+')}}=\\sqrt{${ft(len * len)}}=${ft(len)}`)}.` },
      { prompt: `Berechne das Skalarprodukt ${tex('\\overrightarrow{AB}\\cdot\\overrightarrow{AC}')}.`, kind: 'skalar',
        options: [N(dot, true), N(dot + 2 * Math.abs(u[1] * w[1]) || dot + 1, false, 'Achte auf die Vorzeichen der einzelnen Produkte.'), N(u.reduce((t, c, i) => t + c + w[i], 0), false, 'Zeilenweise multiplizieren, dann addieren – nicht alles addieren.'), N(-dot || 3, false, 'Das Vorzeichen ist falsch.')],
        hints: [`Erst ${tex(`\\overrightarrow{AC}=${vecTex(w)}`)} bilden.`, 'Zeilenweise multiplizieren und die drei Produkte addieren.'], explain: `${tex(`\\overrightarrow{AC}=${vecTex(w)}`)}, also ${tex(`${u.map((c, i) => `${par(c)}\\cdot${par(w[i])}`).join('+')}=${ft(dot)}`)}${dot === 0 ? ' – die Vektoren stehen senkrecht aufeinander' : ''}.` },
      { prompt: `Welche Gleichung beschreibt die Gerade durch ${tex('A')} und ${tex('B')}?`, kind: 'gerade',
        options: [G(A, u, true), G(A, B, false, 'Der Richtungsvektor ist der Verbindungsvektor, nicht der Ortsvektor von B.'), G(u, A, false, 'Stützvektor und Richtungsvektor sind vertauscht.'), G(B, A.map((c, i) => c + B[i]), false, `Der Richtungsvektor ist ${tex('B-A')}, nicht ${tex('A+B')}.`)],
        hints: ['Stützvektor: ein Punkt der Geraden. Richtungsvektor: von einem Punkt zum anderen.', `${tex('g\\colon\\ \\vec x=\\vec a+t\\cdot\\overrightarrow{AB}')}.`], explain: `${tex(`g\\colon\\ \\vec x=${vecTex(A)}+t\\cdot${vecTex(u)}`)}.` },
      { prompt: `Bestimme den Mittelpunkt der Strecke ${tex('AB')}.`, kind: 'mitte',
        options: [Mp(M, true), Mp(u.map((c) => c / 2), false, 'Das ist der halbe Verbindungsvektor. Er muss noch an A angehängt werden.'), Mp(A.map((c, i) => c + B[i]), false, 'Die Summe muss noch halbiert werden.'), Mp(u, false, 'Das ist der Verbindungsvektor, kein Punkt in der Mitte.')],
        hints: ['In jeder Koordinate den Mittelwert bilden.', `${tex('M=\\tfrac12\\,(A+B)')}.`], explain: `${tex(`M(${M.map((c) => ft(c)).join('\\mid ')})`)}.` },
    ];
    if (parts.some((t) => !uniq(t.options)) || !uniqNum(parts[1].options) || !uniqNum(parts[2].options)) continue;
    if ([0, 3, 4].some((i) => parts[i].options.some((o, a) => parts[i].options.some((o2, b) => a < b && (o.vec ? same(o.vec, o2.vec) : same(o.P, o2.P) && same(o.r, o2.r)))))) continue;
    // kein Ablenker darf selbst eine Gerade durch A und B sein
    const kreuz = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const liegt = (o, X) => kreuz(X.map((c, i) => c - o.P[i]), o.r).every((c) => c === 0);
    if (parts[3].options.some((o) => !o.correct && o.r.some((c) => c !== 0) && liegt(o, A) && liegt(o, B))) continue;
    const Pn = (name, v) => `${name}(${v.map((c) => ft(c)).join('\\mid ')})`;
    return { art: 'geometrie', title: 'Punkte im Raum', intro: 'Gegeben sind die Punkte', formula: `${Pn('A', A)},\\quad ${Pn('B', B)},\\quad ${Pn('C', C)}`, parts: fin(parts), A, B, C, be: [2, 2, 3, 3, 2] };
  }
}

export const VERBUND = { analysis: verbundAnalysis, stochastik: verbundStochastik, geometrie: verbundGeometrie };
for (const [fn, topic] of [[verbundAnalysis, 'Funktionsuntersuchung am Stück'], [verbundStochastik, 'Bernoulli-Kette am Stück'], [verbundGeometrie, 'Punkte im Raum am Stück']]) fn.topic = topic;
