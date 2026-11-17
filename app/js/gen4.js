// Aufgaben-Erzeuger, Teil 4: Lehrplan-Lücken (docs/LEHRPLAN.md) – gebrochen-rationale Funktionen, Sinus/Kosinus,
// Rotationskörper und uneigentliche Integrale, Zufallsgrößen und Unabhängigkeit, Kugeln, weitere Abstände und Lagen.
// Gleiche Regeln wie in gen.js: Stufe lv (1–5), Ablenker = typische Fehler mit Diagnose, Rechen-Felder für tests/.
// Jede Art hat fünf echte Stufen: Stufe 1 ein Schritt mit glatten Zahlen … Stufe 5 mehrere verkettete Schritte,
// Parameter, Einkleidung, krumme Ergebnisse – jeweils mit dem vollständigen Rechenweg in hints und explain.
import { ri, pick, shuffle, rand, ft, fmt, polyTex, polyEval, polyDeriv } from './math.js';
import { tex } from './ui.js';
import { tier, par, vecTex, uniq, uniqNum, binom } from './gen.js';
import { fracTex } from './gen3.js';

const dfrac = (a, b) => `\\dfrac{${a}}{${b}}`;
const lin = (a, b) => polyTex([b, a]);                      // a·x + b
const mul = (p, q) => { const r = Array(p.length + q.length - 1).fill(0); p.forEach((a, i) => q.forEach((b, j) => { r[i + j] += a * b; })); return r; };
const sgn = (v) => (v < 0 ? `-${ft(-v)}` : `+${ft(v)}`);
const PT = (name, v) => `${name}(${v.map((c) => ft(c)).join('\\mid ')})`;
const K = (a) => (a === 1 ? '' : a === -1 ? '-' : ft(a));   // Vorfaktor ohne überflüssige 1
const ggt = (a, b) => (b ? ggt(b, a % b) : Math.abs(a));
const dot3 = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
const kreuz = (u, v) => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
const tf = (n, d) => fracTex(n, d).replace('\\dfrac', '\\tfrac');   // kleiner Bruch für den Fließtext
const xp = (e) => (e === 0 ? '' : e === 1 ? 'x' : `x^{${e}}`);
/** Liegen alle Zahlen-Antworten deutlich auseinander (auch nach dem Runden auf zwei Stellen)? */
const weit = (opts, eps = 0.02) => opts.every((a, i) => opts.every((b, j) => i === j || Math.abs(a.num - b.num) > eps));
/** Summe aus fertigen Teilen, „+-“ wird zu „-“. */
const plus = (teile) => teile.join('+').replace(/\+-/g, '-');

/* ───────────── Gebrochen-rationale Funktionen ───────────── */

/** Polstelle (und hebbare Lücke) erkennen: Stufe 1 Zahl durch (x − p) … Stufe 5 ausmultiplizierte Quadrate mit Mitternachtsformel und Lücke. */
export function genPolstelle(lv = 3) {
  for (;;) {
    const X = (num, correct, why) => ({ tex: `x=${ft(num, 2)}`, num, correct, why });
    let zt, nt, Z, Nn, opts, hints, explain, prompt = 'An welcher Stelle hat die Funktion eine Polstelle?';
    if (lv <= 2) {
      const p = pick(lv <= 1 ? [1, 2, 3, 4] : [-5, -3, -2, 2, 3, 5, 6]), a = lv <= 1 ? 0 : pick([2, 3, 4]), b = pick([1, 2, 4, 5, -1, -3]);
      if (a * p + b === 0) continue;
      Z = (x) => a * x + b; Nn = (x) => x - p; zt = a ? lin(a, b) : ft(b); nt = polyTex([-p, 1]);
      opts = [X(p, true), X(-p, false, `Vorzeichen: Der Nenner ${tex(nt)} wird bei ${tex(`x=${ft(p)}`)} null.`),
        a ? X(-b / a, false, 'Das ist die Nullstelle des Zählers – dort schneidet der Graph die x-Achse.') : X(b === p ? p + 2 : b, false, 'Der Zähler ist eine feste Zahl. Entscheidend ist, wo der Nenner null wird.'),
        X(0, false, `Setze ein: Bei ${tex('x=0')} ist der Nenner ${tex(ft(-p))}, also nicht null.`)];
      hints = lv <= 1 ? ['Eine Polstelle liegt dort, wo der Nenner null wird.', `Löse ${tex(`${nt}=0`)}.`]
        : ['Eine Polstelle liegt dort, wo der Nenner null wird – und der Zähler nicht.', `Löse ${tex(`${nt}=0`)} und setze die Lösung in den Zähler ein.`];
      explain = lv <= 1 ? `Der Nenner wird bei ${tex(`x=${p}`)} null.`
        : `Nenner: ${tex(`${nt}=0\\ \\Rightarrow\\ x=${ft(p)}`)}. Zähler dort: ${tex(`${a}\\cdot${par(p)}${sgn(b)}=${ft(a * p + b)}\\neq 0`)} – also eine Polstelle.`;
    } else if (lv === 3) {
      const k = pick([2, 4, 5]), m = pick([-7, -3, -1, 1, 3, 7, 9]), a = pick([2, 3, 4]), b = pick([1, 2, 5, -1, -3]), p = m / k;
      if (ggt(m, k) !== 1 || Math.abs(a * p + b) < 1e-9) continue;
      Z = (x) => a * x + b; Nn = (x) => k * x - m; zt = lin(a, b); nt = polyTex([-m, k]);
      opts = [X(p, true), X(-p, false, `Vorzeichen: Aus ${tex(`${nt}=0`)} folgt ${tex(`${k}x=${m}`)}.`), X(-b / a, false, 'Das ist die Nullstelle des Zählers – dort schneidet der Graph die x-Achse.'),
        X(m, false, `Es fehlt das Teilen durch ${k}: Aus ${tex(`${k}x=${m}`)} folgt ${tex(`x=${dfrac(m, k)}`)}.`)];
      hints = ['Eine Polstelle liegt dort, wo der Nenner null wird – und der Zähler nicht.', `Nenner null setzen: ${tex(`${nt}=0`)}, also ${tex(`${k}x=${m}`)}.`, `Teile durch ${k} und prüfe, dass der Zähler an dieser Stelle nicht null ist.`];
      explain = `Nenner: ${tex(`${nt}=0\\ \\Rightarrow\\ ${k}x=${m}\\ \\Rightarrow\\ x=${dfrac(m, k)}=${ft(p)}`)}. Zähler dort: ${tex(`${a}\\cdot${par(p)}${sgn(b)}=${ft(a * p + b)}\\neq 0`)} – also eine Polstelle.`;
    } else {
      const p = pick([-4, -3, -2, 1, 2, 3, 4]), r = pick([-3, -1, 2, 4, 6].filter((v) => v !== p));
      prompt = lv >= 5 ? 'Untersuche die Definitionslücken: An welcher Stelle hat der Graph eine <b>Polstelle</b> (senkrechte Asymptote) – und nicht nur eine hebbare Lücke?' : 'An welcher Stelle hat der Graph eine <b>Polstelle</b> (senkrechte Asymptote)?';
      let q, zc, nc;
      if (lv === 4) {
        q = pick([-4, -2, -1, 1, 3, 5].filter((v) => v !== p && v !== r)); zc = mul([-p, 1], [-r, 1]); nc = mul([-p, 1], [-q, 1]);
        zt = `(x${sgn(-p)})(x${sgn(-r)})`; nt = `(x${sgn(-p)})(x${sgn(-q)})`;
        const zq = (q - p) * (q - r);
        hints = ['Eine Polstelle liegt dort, wo der Nenner null wird – und der Zähler nicht.', `Der Nenner wird null bei ${tex(`x=${p}`)} und bei ${tex(`x=${q}`)}.`, 'Wird an einer Stelle auch der Zähler null, lässt sich der Faktor kürzen: Dann ist es nur eine hebbare Lücke.'];
        explain = `Nenner null bei ${tex(`x=${p}`)} und ${tex(`x=${q}`)}. Bei ${tex(`x=${p}`)} ist auch der Zähler null: Der Faktor ${tex(`(x${sgn(-p)})`)} lässt sich kürzen – hebbare Lücke. Bei ${tex(`x=${q}`)} ist der Zähler ${tex(`(${q}${sgn(-p)})\\cdot(${q}${sgn(-r)})=${zq}\\neq 0`)} – Polstelle.`;
      } else {
        const c = 2, e = pick([-7, -5, -3, -1, 1, 3, 5, 7, 9]), a = pick([1, 2, 3, -2]); q = e / c;
        zc = mul([-p, 1], [-r, 1]).map((x) => a * x); nc = mul([-e, c], [-p, 1]); zt = polyTex(zc); nt = polyTex(nc);
        const B = nc[1], C = nc[0], D = B * B - 4 * c * C, w = Math.sqrt(D), x1 = (-B + w) / (2 * c), x2 = (-B - w) / (2 * c), zq = polyEval(zc, q);
        if (Math.abs(zq) < 1e-9 || Math.abs(w - Math.round(w)) > 1e-9) continue;
        hints = [`Definitionslücken sind die Nullstellen des Nenners: Löse ${tex(`${nt}=0`)} mit der Mitternachtsformel.`,
          `${tex(`x_{1,2}=${dfrac(`${ft(-B)}\\pm\\sqrt{${B * B}${sgn(-4 * c * C)}}`, 2 * c)}=${dfrac(`${ft(-B)}\\pm ${ft(w)}`, 2 * c)}`)}, also ${tex(`x_1=${ft(x1)}`)} und ${tex(`x_2=${ft(x2)}`)}.`,
          'Setze beide Stellen in den Zähler ein. Wird er dort auch null, lässt sich der Linearfaktor kürzen: Dann ist es nur eine hebbare Lücke.',
          `Zähler ${tex(`z(x)=${zt}`)}: ${tex(`z(${ft(p)})=0`)}, aber ${tex(`z(${ft(q)})=${ft(zq)}\\neq 0`)}.`];
        explain = `Nenner null setzen (Mitternachtsformel): ${tex(`x_{1,2}=${dfrac(`${ft(-B)}\\pm\\sqrt{${D}}`, 2 * c)}`)}, also ${tex(`x=${ft(p)}`)} oder ${tex(`x=${ft(q)}`)}. Bei ${tex(`x=${ft(p)}`)} ist auch der Zähler null – der Faktor ${tex(`(x${sgn(-p)})`)} lässt sich kürzen: hebbare Lücke. Bei ${tex(`x=${ft(q)}`)} ist der Zähler ${tex(`${ft(zq)}\\neq 0`)}: Polstelle.`;
      }
      Z = (x) => polyEval(zc, x); Nn = (x) => polyEval(nc, x);
      opts = [X(q, true), X(p, false, `Bei ${tex(`x=${ft(p)}`)} werden Zähler <b>und</b> Nenner null: Der Faktor lässt sich kürzen – eine hebbare Lücke, keine Polstelle.`), X(r, false, 'Das ist die Nullstelle des Zählers, keine Polstelle.'), X(-q, false, lv >= 5 ? 'Vorzeichenfehler in der Mitternachtsformel: Setze die Stelle zur Probe in den Nenner ein.' : 'Achte auf das Vorzeichen in der Klammer.')];
    }
    if (!weit(opts, 0.11) || !uniq(opts)) continue;
    return { prompt, formula: `f(x)=${dfrac(zt, nt)}`, options: shuffle(opts), hints, explain, Z, N: Nn };
  }
}

/** Waagerechte oder schräge Asymptote: Stufe 1–2 gleicher Grad, 3 Gradvergleich, 4 Polynomdivision, 5 erst Parameter aus Punkt, dann Polynomdivision mit krummen Zahlen. */
export function genAsymptote(lv = 3) {
  for (;;) {
    const A = (t, val, correct, why) => ({ tex: `y=${t}`, val, correct, why });
    const L = (M, S, correct, why) => A(lin(M, S), (x) => M * x + S, correct, why);
    const C = (n, d, correct, why) => A(fracTex(n, d), () => n / d, correct, why);
    const durchX = (v, e = 1) => `${v < 0 ? '-' : '+'}\\tfrac{${ft(Math.abs(v))}}{${xp(e)}}`;
    let zc, nc, opts, hints, explain, formula, extra = {}, prompt = `Welcher Geraden nähert sich der Graph für ${tex('x\\to\\infty')}?`;
    if (lv <= 1) {
      const a = pick([2, 3, 4, 5, -2]), b = pick([1, 3, -2, 5]), d = pick([1, 2, -3, 4]);
      zc = [b, a]; nc = [d, 1];
      opts = [C(a, 1, true), C(b, d, false, 'Das ist der Wert bei x = 0 (y-Achsenabschnitt), nicht das Verhalten für große x.'), C(0, 1, false, 'Zähler und Nenner haben denselben Grad: Der Bruch nähert sich dem Verhältnis der Vorfaktoren, nicht 0.'), C(-d, 1, false, 'Das ist die Polstelle (ein x-Wert), keine waagerechte Asymptote.')];
      hints = ['Für sehr große x zählen nur die Teile mit x – die einzelnen Zahlen fallen kaum noch ins Gewicht.', `Oben steht ${tex(`${K(a)}x`)}, unten ${tex('x')}.`];
      explain = `Für große ${tex('x')} verhält sich der Bruch wie ${tex(`${dfrac(`${K(a)}x`, 'x')}=${a}`)}: Asymptote ${tex(`y=${a}`)}.`;
    } else if (lv === 2) {
      const c = pick([2, 3, 4, 5]), a = pick([1, 3, 5, 7, -3, 6, 9].filter((v) => v % c)), b = pick([1, 3, -2, 5]), d = pick([1, 2, -3, 4]);
      if (a * d === b * c) continue;
      zc = [b, a]; nc = [d, c];
      opts = [C(a, c, true), C(b, d, false, 'Das ist der Wert bei x = 0 (y-Achsenabschnitt), nicht das Verhalten für große x.'), C(0, 1, false, 'Zähler und Nenner haben denselben Grad: Der Bruch nähert sich dem Verhältnis der Vorfaktoren, nicht 0.'), C(-d, c, false, 'Das ist die Polstelle (ein x-Wert), keine waagerechte Asymptote.')];
      hints = ['Zähler und Nenner haben denselben Grad.', `Klammere oben und unten ${tex('x')} aus und kürze: ${tex(`f(x)=${dfrac(`${ft(a)}${durchX(b)}`, `${ft(c)}${durchX(d)}`)}`)}.`, `Für große ${tex('x')} gehen die Brüche mit ${tex('x')} im Nenner gegen 0.`];
      explain = `Ausklammern von ${tex('x')} und Kürzen: ${tex(`f(x)=${dfrac(`${ft(a)}${durchX(b)}`, `${ft(c)}${durchX(d)}`)}\\to${dfrac(ft(a), ft(c))}`)}. Asymptote: ${tex(`y=${fracTex(a, c)}${a % c ? `${Number.isInteger((a * 1000) / c) ? '=' : '\\approx '}${ft(a / c, 3)}` : ''}`)}.`;
    } else if (lv === 3) {
      const gleich = rand() < 0.5, a = pick([2, 3, 4, -2, 5]), c = pick([2, 3, 4]), b = pick([1, -3, 5, 6]), d = pick([1, 2, 4, 5]), b1 = pick([-4, -1, 2, 3]);
      zc = gleich ? [b, b1, a] : [b, a]; nc = [d, 0, c];
      opts = [C(gleich ? a : 0, gleich ? c : 1, true), gleich ? C(0, 1, false, 'Zähler und Nenner haben denselben Grad – der Grenzwert ist das Verhältnis der Vorfaktoren.') : C(a, c, false, 'Der Nenner hat den höheren Grad: Er wächst schneller, der Bruch geht gegen 0.'),
        C(b, d, false, 'Das ist der Wert bei x = 0.'), C(a, 1, false, gleich ? 'Auch der Vorfaktor im Nenner zählt.' : 'Für große x gewinnt der Nenner – er hat den höheren Grad.')];
      const um = gleich ? dfrac(`${ft(a)}${durchX(b1)}${durchX(b, 2)}`, `${ft(c)}${durchX(d, 2)}`) : dfrac(`${durchX(a).replace(/^\+/, '')}${durchX(b, 2)}`, `${ft(c)}${durchX(d, 2)}`);
      hints = [gleich ? 'Vergleiche den Grad: Zähler und Nenner haben beide den Grad 2.' : 'Vergleiche den Grad: Der Zähler hat Grad 1, der Nenner Grad 2.', `Klammere oben und unten ${tex('x^2')} aus und kürze: ${tex(`f(x)=${um}`)}.`,
        gleich ? `Alle Brüche mit ${tex('x')} im Nenner gehen gegen 0. Es bleibt das Verhältnis der Vorfaktoren.` : `Der Zähler geht gegen 0, der Nenner gegen ${c}.`];
      explain = gleich ? `${tex(`f(x)=${um}\\to${dfrac(ft(a), ft(c))}`)}: Bei gleichem Grad ist die Asymptote ${tex(`y=${fracTex(a, c)}`)}.` : `${tex(`f(x)=${um}\\to${dfrac(0, c)}=0`)}: Der Nennergrad ist größer, die Asymptote ist ${tex('y=0')} (die x-Achse).`;
    } else if (lv === 4) {
      const p = pick([1, 2, 3, -1, -2]), m = pick([1, 2, -1, 3]), s = pick([1, 2, -3, 4]), rest = pick([1, 2, 3, -2, 5]);
      // f(x) = (m·x + s) + rest/(x − p)  ⇒  Zähler = (m·x + s)(x − p) + rest
      zc = mul([s, m], [-p, 1]); zc[0] += rest; nc = [-p, 1];
      prompt = 'Welche Gerade ist die <b>schräge Asymptote</b> des Graphen?';
      opts = [L(m, s, true), L(m, zc[1], false, 'Der zweite Summand entsteht erst durch die Polynomdivision – er ist nicht einfach der Vorfaktor von x im Zähler.'), A(ft(m), () => m, false, 'Der Zählergrad ist um 1 größer als der Nennergrad: Die Asymptote ist schräg, nicht waagerecht.'), L(m, -s, false, 'Vorzeichenfehler beim Abziehen in der Polynomdivision.')];
      const N1 = polyTex(nc);
      hints = ['Der Zählergrad ist um 1 größer als der Nennergrad: Es gibt eine schräge Asymptote. Sie ergibt sich durch Polynomdivision.',
        `Erster Schritt: ${tex(`${K(m)}x^2:x=${K(m)}x`)}. Abziehen von ${tex(`${K(m)}x\\cdot(${N1})=${polyTex([0, -m * p, m])}`)} lässt ${tex(polyTex([zc[0], s]))} übrig.`,
        `Zweiter Schritt: ${tex(`${K(s)}x:x=${ft(s)}`)}. Abziehen von ${tex(`${ft(s)}\\cdot(${N1})=${polyTex([-s * p, s])}`)} lässt den Rest ${tex(ft(rest))}.`];
      explain = `Polynomdivision: ${tex(`(${polyTex(zc)}):(${N1})=${lin(m, s)}`)} mit Rest ${tex(ft(rest))}, also ${tex(`f(x)=${lin(m, s)}${rest < 0 ? '-' : '+'}${dfrac(ft(Math.abs(rest)), N1)}`)}. Der Bruch geht gegen 0, es bleibt ${tex(`y=${lin(m, s)}`)}.`;
    } else {
      const c = 2, d = pick([-5, -3, -1, 1, 3, 5]), a = pick([1, 3, -1, 5, -3]), b1 = pick([-6, -5, -3, -2, 2, 3, 4, 6]), b0 = ri(-8, 8), x0 = pick([(1 - d) / 2, (-1 - d) / 2]);
      const m = a / c, s = (b1 - m * d) / c, rest = b0 - s * d, nen = c * x0 + d, y0 = (a * x0 * x0 + b1 * x0 + b0) / nen;
      if (x0 === 0 || rest === 0 || s === 0) continue;
      zc = [b0, b1, a]; nc = [d, c];
      const N1 = polyTex(nc), rt = polyTex([b0, b1]), zPar = `ax^{2}${rt === '0' ? '' : rt.startsWith('-') ? rt : `+${rt}`}`;
      formula = `f_a(x)=${dfrac(zPar, N1)}`;
      prompt = `Der Graph der Funktion ${tex('f_a')} verläuft durch den Punkt ${tex(PT('P', [x0, y0]))}. Bestimme zuerst den Parameter ${tex('a')} und dann die <b>schräge Asymptote</b> des Graphen.`;
      opts = [L(m, s, true), L(m, b1 / c, false, 'Der zweite Summand entsteht erst durch die Polynomdivision – er ist nicht einfach der Vorfaktor von x geteilt durch 2.'), L(a, b1, false, `Auch durch den Vorfaktor ${c} im Nenner muss geteilt werden: Der erste Summand ist ${tex(`${K(a)}x^2:${c}x`)}.`), L(m, (b1 + m * d) / c, false, 'Vorzeichenfehler beim Abziehen in der Polynomdivision.')];
      hints = [`Punktprobe: Setze ${tex(`x=${x0}`)} ein. Der Nenner ist dann ${tex(`${c}\\cdot${par(x0)}${sgn(d)}=${nen}`)}.`,
        `${nen === 1 ? '' : `${tex(`${dfrac(`${K(x0 * x0)}a${b1 * x0 + b0 ? sgn(b1 * x0 + b0) : ''}`, nen)}=${y0}`)}, also `}${tex(`${K(x0 * x0)}a${b1 * x0 + b0 ? sgn(b1 * x0 + b0) : ''}=${y0 * nen}`)} und damit ${tex(`a=${a}`)}.`,
        `Polynomdivision ${tex(`(${polyTex(zc)}):(${N1})`)}: Erster Schritt ${tex(`${K(a)}x^2:${c}x=${K(m)}x`)}. Abziehen von ${tex(`${K(m)}x\\cdot(${N1})=${polyTex([0, m * d, a])}`)} lässt ${tex(polyTex([b0, b1 - m * d]))} übrig.`,
        `Zweiter Schritt: ${tex(`${K(b1 - m * d)}x:${c}x=${ft(s)}`)}. Abziehen von ${tex(`${ft(s)}\\cdot(${N1})=${polyTex([s * d, s * c])}`)} lässt den Rest ${tex(ft(rest, 4))}.`,
        'Der Rest-Bruch geht für große x gegen 0 – übrig bleibt die Gerade.'];
      explain = `Punktprobe: ${tex(`f_a(${x0})=${y0}`)} liefert ${tex(`a=${a}`)}. Polynomdivision: ${tex(`(${polyTex(zc)}):(${N1})=${lin(m, s)}`)} mit Rest ${tex(ft(rest, 4))}, also ${tex(`f(x)=${lin(m, s)}${rest < 0 ? '-' : '+'}${dfrac(ft(Math.abs(rest), 4), N1)}`)}. Der Bruch geht gegen 0, es bleibt ${tex(`y=${lin(m, s)}`)}.`;
      extra = { punkt: [x0, y0], parameter: a };
    }
    if (!uniq(opts) || !opts.every((o, i) => opts.every((u, j) => i >= j || [1, 7].some((x) => Math.abs(o.val(x) - u.val(x)) > 1e-9)))) continue;
    const f = (x) => polyEval(zc, x) / polyEval(nc, x);
    return { prompt, formula: formula || `f(x)=${dfrac(polyTex(zc), polyTex(nc))}`, options: shuffle(opts), hints, explain, f, ...extra };
  }
}

/** Quotientenregel: Stufe 1–3 linear durch linear, 4 Quadrat durch linear, 5 mit e-Funktion (Kettenregel), ln oder Quadrat durch Quadrat – ausgeklammert und gekürzt. */
export function genQuotient(lv = 3) {
  for (;;) {
    const regel = `Quotientenregel: ${tex("\\left(\\dfrac uv\\right)'=\\dfrac{u'v-uv'}{v^2}")}.`;
    const Q2 = (zt, zv, nt, nv, correct, why) => ({ tex: `f'(x)=${dfrac(zt, nt)}`, val: (x) => zv(x) / nv(x), correct, why });
    const kind = lv >= 5 ? pick(['exp', 'ln', 'quad']) : 'poly';
    if (kind === 'exp') {
      const k = pick([0.5, 2, -1, 3, 1.5, -0.5]), d = pick([1, 2, 3, 4]), ek = `e^{${K(k)}x}`, zp = [k * d, -2, k], zq = [k * d, 2, k], V = `x^{2}+${d}`;
      const E = (x) => Math.exp(k * x), v = (x) => x * x + d;
      const opts = [Q2(`${ek}\\,(${polyTex(zp)})`, (x) => E(x) * polyEval(zp, x), `(${V})^2`, (x) => v(x) ** 2, true),
        Q2(`${ek}\\,(${polyTex(zq)})`, (x) => E(x) * polyEval(zq, x), `(${V})^2`, (x) => v(x) ** 2, false, `In der Quotientenregel steht ein Minus: ${tex("u'v-uv'")}.`),
        Q2(`${ek}\\,(${polyTex(zp)})`, (x) => E(x) * polyEval(zp, x), V, v, false, 'Der Nenner wird quadriert.'),
        Q2(`${K(k)}${ek}`, (x) => k * E(x), '2x', (x) => 2 * x, false, 'Zähler und Nenner einzeln abzuleiten ist bei Brüchen falsch – hier gilt die Quotientenregel.')];
      if (!uniq(opts)) continue;
      return { prompt: 'Welche Ableitung ist richtig (vollständig vereinfacht)?', formula: `f(x)=${dfrac(ek, V)}`, domain: 'pos', options: shuffle(opts),
        hints: [regel, `Zähler: ${tex(`u=${ek}`)} mit ${tex(`u'=${K(k)}${ek}`)} (Kettenregel: innere Ableitung ${tex(ft(k))}).`, `Nenner: ${tex(`v=${V}`)} mit ${tex("v'=2x")}.`,
          `Einsetzen: ${tex(`u'v-uv'=${K(k)}${ek}\\cdot(${V})-${ek}\\cdot 2x`)}.`, `${tex(ek)} ausklammern: ${tex(`${ek}\\,\\bigl(${K(k)}(${V})-2x\\bigr)=${ek}\\,(${polyTex(zp)})`)}. Der Nenner bleibt ${tex(`(${V})^2`)}.`],
        explain: `${tex(`f'(x)=${dfrac(`${K(k)}${ek}\\cdot(${V})-${ek}\\cdot 2x`, `(${V})^2`)}`)}. Ausklammern von ${tex(ek)}: ${tex(`f'(x)=${dfrac(`${ek}\\,(${polyTex(zp)})`, `(${V})^2`)}`)}.`, f: (x) => E(x) / v(x), form: kind };
    }
    if (kind === 'ln') {
      const a = pick([1, 2, 3, 4]), n = pick([2, 3]), l = Math.log;
      const opts = [Q2(`${a}-${a * n}\\ln(x)`, (x) => a - a * n * l(x), xp(n + 1), (x) => x ** (n + 1), true),
        Q2(`${a}+${a * n}\\ln(x)`, (x) => a + a * n * l(x), xp(n + 1), (x) => x ** (n + 1), false, `In der Quotientenregel steht ein Minus: ${tex("u'v-uv'")}.`),
        Q2(`${a * n}\\ln(x)-${a}`, (x) => a * n * l(x) - a, xp(n + 1), (x) => x ** (n + 1), false, `Reihenfolge im Zähler: ${tex("u'v-uv'")}, nicht ${tex("uv'-u'v")}.`),
        Q2(`${a}`, () => a, `${n}${xp(n)}`, (x) => n * x ** n, false, 'Zähler und Nenner einzeln abzuleiten ist bei Brüchen falsch – hier gilt die Quotientenregel.')];
      if (!uniq(opts)) continue;
      return { prompt: 'Welche Ableitung ist richtig (vollständig gekürzt)?', formula: `f(x)=${dfrac(`${K(a)}\\ln(x)`, xp(n))}`, domain: 'pos', options: shuffle(opts),
        hints: [regel, `${tex(`u=${K(a)}\\ln(x)`)} mit ${tex(`u'=${dfrac(a, 'x')}`)} und ${tex(`v=${xp(n)}`)} mit ${tex(`v'=${n}${xp(n - 1)}`)}.`,
          `Zähler: ${tex(`${dfrac(a, 'x')}\\cdot ${xp(n)}-${K(a)}\\ln(x)\\cdot ${n}${xp(n - 1)}=${K(a)}${xp(n - 1)}-${a * n}${xp(n - 1)}\\ln(x)`)}.`, `Nenner: ${tex(`(${xp(n)})^2=${xp(2 * n)}`)}.`, `Im Zähler ${tex(xp(n - 1))} ausklammern und mit dem Nenner kürzen: ${tex(`${dfrac(xp(n - 1), xp(2 * n))}=${dfrac(1, xp(n + 1))}`)}.`],
        explain: `Quotientenregel: ${tex(`f'(x)=${dfrac(`${dfrac(a, 'x')}\\cdot ${xp(n)}-${K(a)}\\ln(x)\\cdot ${n}${xp(n - 1)}`, xp(2 * n))}`)}. Zähler zusammenfassen und ${tex(xp(n - 1))} ausklammern: ${tex(`f'(x)=${dfrac(`${xp(n - 1)}\\,(${a}-${a * n}\\ln(x))`, xp(2 * n))}=${dfrac(`${a}-${a * n}\\ln(x)`, xp(n + 1))}`)}.`, f: (x) => (a * l(x)) / x ** n, form: kind };
    }
    const d = pick([1, 2, 3, 5]), z0 = pick([1, 2, -1, 3, -4]);
    const u = lv <= 1 ? [z0, 1] : lv === 2 ? [z0, pick([2, 3, -2, 4])] : lv === 3 ? [z0, pick([1, 2, 3, -2, 5])] : lv === 4 ? [pick([1, 3, -2, 4]), 0, pick([1, 2, 3])] : [pick([1, 2, 3, 5, -1, -4]), 0, pick([1, 2, 3])];
    const v = lv <= 2 ? [d, 1] : lv === 3 ? [d, pick([2, 3, 4])] : lv === 4 ? [d, pick([1, 2, 3])] : [pick([1, 2, 3, 4]), 0, 1];
    const du = polyDeriv(u), dv = polyDeriv(v);
    const sub = (p, q) => Array.from({ length: Math.max(p.length, q.length) }, (_, i) => (p[i] || 0) - (q[i] || 0));
    const p1 = mul(du, v), p2 = mul(u, dv), num = sub(p1, p2), sum = sub(p1, p2.map((x) => -x));
    if (num.every((x) => x === 0) || num.every((x, i) => x === sum[i])) continue;
    const V = polyTex(v), kl = (p) => (p.filter((x) => x).length > 1 ? `(${polyTex(p)})` : p.length === 1 ? par(p[0]) : polyTex(p));
    const Q = (n, sq, correct, why) => Q2(polyTex(n), (x) => polyEval(n, x), sq ? `(${V})^2` : V, (x) => polyEval(v, x) ** (sq ? 2 : 1), correct, why);
    const opts = [Q(num, true, true), Q(sum, true, false, `In der Quotientenregel steht ein Minus: ${tex("u'v-uv'")}.`), Q(num, false, false, 'Der Nenner wird quadriert.'), Q(num.map((x) => -x), true, false, `Reihenfolge im Zähler: ${tex("u'v-uv'")}, nicht ${tex("uv'-u'v")}.`)];
    if (!uniq(opts)) continue;
    const teile = `${tex(`u=${polyTex(u)}`)}, ${tex(`u'=${polyTex(du)}`)} und ${tex(`v=${V}`)}, ${tex(`v'=${polyTex(dv)}`)}.`, roh = `${kl(du)}\\cdot(${V})-(${polyTex(u)})\\cdot${kl(dv)}`;
    const hints = lv <= 1 ? [regel, teile] : [regel, teile, `Zähler ausmultiplizieren: ${tex(`${roh}=${polyTex(p1)}-(${polyTex(p2)})`)}.`];
    if (lv >= 5) hints.push(`Klammer auflösen und zusammenfassen: ${tex(`${polyTex(p1)}-(${polyTex(p2)})=${polyTex(num)}`)}.`, `Der Nenner bleibt als Quadrat stehen: ${tex(`(${V})^2`)} – nicht ausmultiplizieren.`);
    const explain = lv <= 2 ? `${tex(`f'(x)=${dfrac(roh, `(${V})^2`)}=${dfrac(polyTex(num), `(${V})^2`)}`)}.`
      : `Zähler nach der Quotientenregel: ${tex(`${roh}=${polyTex(p1)}-(${polyTex(p2)})=${polyTex(num)}`)}. Also ${tex(`f'(x)=${dfrac(polyTex(num), `(${V})^2`)}`)}.`;
    return { prompt: 'Welche Ableitung ist richtig?', formula: `f(x)=${dfrac(polyTex(u), V)}`, domain: 'pos', options: shuffle(opts), hints, explain, f: (x) => polyEval(u, x) / polyEval(v, x), form: kind };
  }
}

/* ───────────── Sinus und Kosinus ───────────── */
const arg = (b) => `(${b === 1 ? '' : ft(b)}x)`;
const mono = (c, e) => `${K(c)}${xp(e)}`;                    // c·x^e als Vorfaktor vor sin/cos

/** Sinus und Kosinus ableiten: Stufe 1 Vorfaktor, 2 Summe, 3 Kettenregel, 4 Produktregel, 5 Produkt- und Kettenregel verschachtelt (e-Funktion, Quadrat, x²·cos(bx)). */
export function genTrigAbl(lv = 3) {
  for (;;) {
    const isSin = rand() < 0.5, fn = isSin ? 'sin' : 'cos', gn = isSin ? 'cos' : 'sin', sg = isSin ? 1 : -1;   // (fn)' = sg·gn
    const F = isSin ? Math.sin : Math.cos, G = isSin ? Math.cos : Math.sin;
    const T = (t, val, correct, why) => ({ tex: `f'(x)=${t}`, val, correct, why });
    const grund = `${tex("(\\sin x)'=\\cos x")} und ${tex("(\\cos x)'=-\\sin x")}.`;
    const vz = isSin ? `${tex("(\\sin x)'=\\cos x")} – ohne Minus.` : `${tex("(\\cos x)'=-\\sin x")} – das Minus nicht vergessen.`;
    const wechsel = 'Sinus wird zu Kosinus und umgekehrt – die Funktion muss wechseln.';
    const pm = (v) => (v < 0 ? '-' : '+');
    let formula, f, opts, hints, explain;
    if (lv <= 1) {
      const a = pick([2, 3, 4, 5, 6, 7, 8, 9]);
      formula = `${a}\\${fn}(x)`; f = (x) => a * F(x);
      opts = [T(`${K(sg * a)}\\${gn}(x)`, (x) => sg * a * G(x), true), T(`${K(-sg * a)}\\${gn}(x)`, (x) => -sg * a * G(x), false, vz), T(`${K(sg * a)}\\${fn}(x)`, (x) => sg * a * F(x), false, wechsel), T(`${K(sg)}\\${gn}(x)`, (x) => sg * G(x), false, `Der Vorfaktor ${a} bleibt beim Ableiten stehen.`)];
      hints = [grund, 'Der Vorfaktor bleibt stehen.']; explain = `${tex(`f'(x)=${opts[0].tex.slice(6)}`)}.`;
    } else if (lv === 2) {
      const a = pick([2, 3, -2, 5]), c = pick([2, 3, -2, 5, -4]), R = `${K(sg * a)}\\${gn}(x)`;
      formula = `${K(a)}\\${fn}(x)${sgn(c)}x`; f = (x) => a * F(x) + c * x;
      opts = [T(`${R}${sgn(c)}`, (x) => sg * a * G(x) + c, true), T(`${K(-sg * a)}\\${gn}(x)${sgn(c)}`, (x) => -sg * a * G(x) + c, false, vz), T(R, (x) => sg * a * G(x), false, `${tex(`${K(c)}x`)} ist keine einzelne Zahl: Abgeleitet bleibt ${tex(ft(c))} stehen.`), T(`${R}${sgn(c)}x`, (x) => sg * a * G(x) + c * x, false, `Auch ${tex(`${K(c)}x`)} wird abgeleitet: Es bleibt ${tex(ft(c))}.`)];
      hints = [grund, `Summenregel: Jeden Summanden einzeln ableiten. Aus ${tex(`${K(c)}x`)} wird ${tex(ft(c))}.`];
      explain = `Summenregel: ${tex(`(${K(a)}\\${fn}(x))'=${R}`)} und ${tex(`(${K(c)}x)'=${ft(c)}`)}, zusammen ${tex(`f'(x)=${R}${sgn(c)}`)}.`;
    } else if (lv === 3) {
      const a = pick([2, 3, -2, 4]), b = pick([2, 3, 4, 5]), c = pick([1, 3, -2, 6]);
      formula = `${K(a)}\\${fn}${arg(b)}${sgn(c)}`; f = (x) => a * F(b * x) + c;
      const D = (coef, name, correct, why) => T(`${K(coef)}\\${name}${arg(b)}`, (x) => coef * (name === 'sin' ? Math.sin(b * x) : Math.cos(b * x)), correct, why);
      opts = [D(sg * a * b, gn, true), D(-sg * a * b, gn, false, vz), D(sg * a * b, fn, false, wechsel), D(sg * a, gn, false, `Kettenregel: Die innere Ableitung ${tex(ft(b))} fehlt als Faktor.`)];
      hints = [grund, `Kettenregel: äußere Ableitung mal innere Ableitung. Innen steht ${tex(`${b}x`)} mit der Ableitung ${tex(ft(b))}.`, `Vorfaktor: ${tex(`${par(a)}\\cdot ${isSin ? '' : '(-1)\\cdot '}${b}=${sg * a * b}`)}. Die einzelne Zahl ${tex(ft(c))} fällt weg.`];
      explain = `Kettenregel: ${tex(`f'(x)=${par(a)}\\cdot${isSin ? '' : '(-1)\\cdot'}\\${gn}${arg(b)}\\cdot ${b}=${opts[0].tex.slice(6)}`)}.`;
    } else if (lv === 4) {
      const a = pick([1, 2, 3, -2]), n = pick([1, 2, 3]), t1 = `${mono(a * n, n - 1)}\\${fn}(x)`, t2 = `${mono(Math.abs(a), n)}\\${gn}(x)`;
      formula = `${mono(a, n)}\\cdot\\${fn}(x)`; f = (x) => a * x ** n * F(x);
      const v1 = (x) => a * n * x ** (n - 1) * F(x), v2 = (x) => sg * a * x ** n * G(x);
      opts = [T(`${t1}${pm(sg * a)}${t2}`, (x) => v1(x) + v2(x), true), T(`${mono(sg * a * n, n - 1)}\\${gn}(x)`, (x) => sg * a * n * x ** (n - 1) * G(x), false, `Das ist ${tex("u'\\cdot v'")}. Produktregel: ${tex("u'v+uv'")}.`),
        T(`${t1}${pm(-sg * a)}${t2}`, (x) => v1(x) - v2(x), false, vz), T(`${mono(sg * a, n)}\\${gn}(x)`, v2, false, `Der erste Teil ${tex("u'v")} fehlt.`)];
      hints = [`Ein Produkt aus zwei Funktionen – Produktregel: ${tex("(u\\cdot v)'=u'v+uv'")}.`, `${tex(`u=${mono(a, n)}`)} mit ${tex(`u'=${n === 1 ? ft(a) : mono(a * n, n - 1)}`)} und ${tex(`v=\\${fn}(x)`)} mit ${tex(`v'=${isSin ? '' : '-'}\\${gn}(x)`)}.`, 'Beide Teile einsetzen und auf das Vorzeichen achten.'];
      explain = `Produktregel mit ${tex(`u=${mono(a, n)}`)} und ${tex(`v=\\${fn}(x)`)}: ${tex(`f'(x)=${t1}${pm(sg * a)}${t2}`)}.`;
    } else {
      const form = pick(['exp', 'quad', 'prod']), b = pick([2, 3, 4]), S = (x) => F(b * x), Cc = (x) => G(b * x), fb = `\\${fn}${arg(b)}`, gb = `\\${gn}${arg(b)}`;
      if (form === 'exp') {
        const k = pick([0.5, 2, -1, 3, -0.5, 1.5]), ek = `e^{${K(k)}x}`, E = (x) => Math.exp(k * x);
        formula = `${ek}\\cdot${fb}`; f = (x) => E(x) * S(x);
        const kl = (c1, c2) => `${ek}\\,\\bigl(${K(c1)}${fb}${pm(c2)}${K(Math.abs(c2))}${gb}\\bigr)`;
        const U = (tx, val, correct, why) => ({ tex: tx, val, correct, why });   // ohne „f'(x)=“ – die Antworten sind sonst zu breit fürs Handy
        opts = [U(kl(k, sg * b), (x) => E(x) * (k * S(x) + sg * b * Cc(x)), true), U(kl(k, -sg * b), (x) => E(x) * (k * S(x) - sg * b * Cc(x)), false, vz),
          U(kl(1, sg), (x) => E(x) * (S(x) + sg * Cc(x)), false, `Kettenregel: Die inneren Ableitungen ${tex(ft(k))} und ${tex(ft(b))} fehlen als Faktoren.`), U(`${K(k * sg * b)}${ek}\\,${gb}`, (x) => k * sg * b * E(x) * Cc(x), false, `Das ist ${tex("u'\\cdot v'")}. Produktregel: ${tex("u'v+uv'")}.`)];
        hints = [`Produktregel: ${tex("(u\\cdot v)'=u'v+uv'")} – und für beide Faktoren die Kettenregel.`, `${tex(`u=${ek}`)} mit ${tex(`u'=${K(k)}${ek}`)} (innere Ableitung ${tex(ft(k))}).`, `${tex(`v=${fb}`)} mit ${tex(`v'=${K(sg * b)}${gb}`)} (innere Ableitung ${tex(ft(b))}).`, `Einsetzen und ${tex(ek)} ausklammern.`];
        explain = `Produkt- und Kettenregel: ${tex(`f'(x)=${K(k)}${ek}\\cdot${fb}+${ek}\\cdot\\bigl(${K(sg * b)}${gb}\\bigr)`)}. Ausgeklammert: ${tex(`f'(x)=${kl(k, sg * b)}`)}.`;
      } else if (form === 'quad') {
        const a = pick([1, 2, 3]);
        formula = `${K(a)}\\${fn}^{2}${arg(b)}`; f = (x) => a * S(x) ** 2;
        const P = (c) => `${K(c)}\\sin${arg(b)}\\cos${arg(b)}`, pv = (c) => (x) => c * Math.sin(b * x) * Math.cos(b * x);
        opts = [T(P(sg * 2 * a * b), pv(sg * 2 * a * b), true), T(P(-sg * 2 * a * b), pv(-sg * 2 * a * b), false, vz), T(P(sg * 2 * a), pv(sg * 2 * a), false, `Kettenregel: Die innerste Ableitung ${tex(ft(b))} von ${tex(`${b}x`)} fehlt als Faktor.`),
          T(`${K(2 * a * b)}${fb}`, (x) => 2 * a * b * S(x), false, `Die Ableitung von ${tex(fb)} selbst fehlt: Nach dem Quadrat kommt noch ${tex(gb)} als Faktor dazu.`)];
        hints = [`${tex(`\\${fn}^{2}${arg(b)}`)} heißt ${tex(`\\bigl(${fb}\\bigr)^2`)}: außen ein Quadrat, innen ${tex(fb)}, darin ${tex(`${b}x`)} – die Kettenregel zweimal.`, `Äußere Ableitung: ${tex(`${2 * a}\\cdot${fb}`)}.`, `Innere Ableitung: ${tex(`\\bigl(${fb}\\bigr)'=${K(sg * b)}${gb}`)}.`, 'Beides multiplizieren.'];
        explain = `Kettenregel zweimal: ${tex(`f'(x)=${2 * a}\\cdot${fb}\\cdot\\bigl(${K(sg * b)}${gb}\\bigr)=${P(sg * 2 * a * b)}`)}.`;
      } else {
        const a = pick([1, 2, 3]), t1 = `${2 * a}x\\,${fb}`, t2 = (c) => `${K(c)}x^{2}\\,${gb}`;
        formula = `${K(a)}x^{2}\\cdot${fb}`; f = (x) => a * x * x * S(x);
        const v1 = (x) => 2 * a * x * S(x), v2 = (c) => (x) => c * x * x * Cc(x);
        opts = [T(`${t1}${pm(sg)}${t2(a * b)}`, (x) => v1(x) + v2(sg * a * b)(x), true), T(`${t1}${pm(-sg)}${t2(a * b)}`, (x) => v1(x) - v2(sg * a * b)(x), false, vz),
          T(`${t1}${pm(sg)}${t2(a)}`, (x) => v1(x) + v2(sg * a)(x), false, `Kettenregel: Die innere Ableitung ${tex(ft(b))} fehlt im zweiten Teil.`), T(`${K(sg * 2 * a * b)}x\\,${gb}`, (x) => sg * 2 * a * b * x * Cc(x), false, `Das ist ${tex("u'\\cdot v'")}. Produktregel: ${tex("u'v+uv'")}.`)];
        hints = [`Produktregel: ${tex("(u\\cdot v)'=u'v+uv'")} – und für den zweiten Faktor die Kettenregel.`, `${tex(`u=${K(a)}x^{2}`)} mit ${tex(`u'=${2 * a}x`)}.`, `${tex(`v=${fb}`)} mit ${tex(`v'=${K(sg * b)}${gb}`)} (innere Ableitung ${tex(ft(b))}).`, 'Beide Teile einsetzen und die Vorfaktoren zusammenfassen.'];
        explain = `Produkt- und Kettenregel: ${tex(`f'(x)=${2 * a}x\\cdot${fb}+${K(a)}x^{2}\\cdot\\bigl(${K(sg * b)}${gb}\\bigr)`)}, also ${tex(`f'(x)=${t1}${pm(sg)}${t2(a * b)}`)}.`;
      }
    }
    if (!uniq(opts)) continue;
    return { prompt: 'Welche Ableitung ist richtig?', formula: `f(x)=${formula}`, options: shuffle(opts), hints, explain, f };
  }
}

/** Bestimmte Integrale mit Sinus und Kosinus: Stufe 1 Grundintegral, 2 mit Konstante, 3 innere Funktion 2x, 4 mit linearem Anteil und krummen Grenzen, 5 partielle Integration. */
export function genTrigInt(lv = 3) {
  for (;;) {
    const isSin = rand() < 0.5, fn = isSin ? 'sin' : 'cos';
    const stamm = `Stammfunktionen: ${tex('\\int\\sin x\\,dx=-\\cos x')} und ${tex('\\int\\cos x\\,dx=\\sin x')}.`;
    if (lv <= 3) {
      const a = pick(tier(lv, [1, 2, 3, 4, 5, 6], [2, 3, 4, 5], [2, 3, 5, 6])), b = lv >= 3 ? 2 : 1, c = lv >= 2 ? pick([1, 2, 3]) : 0;
      // sin über [0, π/b], cos über [0, π/(2b)]
      const hi = isSin ? Math.PI / b : Math.PI / (2 * b), hiT = isSin ? (b === 1 ? '\\pi' : '\\tfrac{\\pi}{2}') : (b === 1 ? '\\tfrac{\\pi}{2}' : '\\tfrac{\\pi}{4}');
      const trig = isSin ? (2 * a) / b : a / b, piK = c * (isSin ? 1 / b : 1 / (2 * b));        // Ergebnis = trig + piK·π
      const show = (t, k) => (k ? `${t === 0 ? '' : `${ft(t)}+`}${tf(Math.round(k * 4), 4)}\\pi`.replace(/(^|\+)1\\pi/, '$1\\pi') : ft(t, 2));
      const N = (t, k, correct, why) => ({ tex: show(t, k), num: t + k * Math.PI, correct, why });
      const opts = [N(trig, piK, true), N(isSin ? 0 : -trig, piK, false, isSin ? `${tex('-\\cos(\\dots)')} an beiden Grenzen einsetzen: Die Werte heben sich nicht auf, sie addieren sich.` : 'Vorzeichen: Eine Stammfunktion von cos ist sin – ohne Minus.'),
        b > 1 ? N(isSin ? 2 * a : a, piK, false, `Beim Aufleiten wird durch die innere Ableitung ${tex(ft(b))} geteilt.`) : N(a * (isSin ? 1 : 0.5), piK, false, 'Setze beide Grenzen in die Stammfunktion ein und bilde die Differenz.'),
        c ? N(trig, 0, false, `Auch die Zahl ${tex(ft(c))} wird integriert: Ihre Stammfunktion ist ${tex(`${K(c)}x`)}.`) : N(trig * 2, 0, false, 'Rechne die Werte der Stammfunktion an beiden Grenzen einzeln aus.')];
      if (!uniqNum(opts) || !uniq(opts)) continue;
      const ft2 = `${K(a)}\\${fn}${arg(b)}${c ? sgn(c) : ''}`, kf = isSin ? -a / b : a / b, FT = `${K(kf)}\\${isSin ? 'cos' : 'sin'}${arg(b)}${c ? `+${K(c)}x` : ''}`;
      const oben = `${ft(a / b)}${c ? `+${show(0, piK)}` : ''}`;
      const hints = [stamm, b > 1 ? `Wegen der inneren Funktion ${tex(`${b}x`)} durch ${tex(ft(b))} teilen: ${tex(`F(x)=${FT}`)}.` : `Eine Stammfunktion ist ${tex(`F(x)=${FT}`)}.`, `Obere minus untere Grenze: ${tex(`F(${hiT})-F(0)`)}.`];
      return { prompt: 'Berechne das Integral.', formula: `\\int_{0}^{${hiT}}\\left(${ft2}\\right)dx`, options: shuffle(opts), hints: lv <= 1 ? hints.slice(1) : hints,
        explain: `${tex(`F(x)=${FT}`)}, also ${tex(`F(${hiT})-F(0)=${oben}-${par(isSin ? -a / b : 0)}=${show(trig, piK)}`)}${piK ? ` ${tex(`\\approx${ft(trig + piK * Math.PI, 2)}`)}` : ''}.`, f: (x) => a * (isSin ? Math.sin(b * x) : Math.cos(b * x)) + c, a: 0, b: hi };
    }
    const a = pick(lv === 4 ? [2, 3, 4, 6] : [2, 3, 4, 5, 6]), b = pick(lv === 4 ? [2, 3] : [1, 2, 3]), hi = isSin ? Math.PI / b : Math.PI / (2 * b);
    const hiT = isSin ? (b === 1 ? '\\pi' : `\\tfrac{\\pi}{${b}}`) : `\\tfrac{\\pi}{${2 * b}}`, D = (num, correct, why) => ({ tex: ft(num, 2), num, correct, why });
    const co = `\\cos${arg(b)}`, si = `\\sin${arg(b)}`, cf = (n, d) => { const t = tf(n, d); return t === '1' ? '' : t === '-1' ? '-' : t; };
    let opts, formula, hints, explain, f;
    if (lv === 4) {
      const c = pick([1, 2, 3]), trig = isSin ? (2 * a) / b : a / b, quad = (c * hi * hi) / 2, piq = `${cf(c, isSin ? 2 * b * b : 8 * b * b)}\\pi^2`;
      formula = `\\int_{0}^{${hiT}}\\left(${K(a)}\\${fn}${arg(b)}+${K(c)}x\\right)dx`; f = (x) => a * (isSin ? Math.sin(b * x) : Math.cos(b * x)) + c * x;
      opts = [D(trig + quad, true), D((isSin ? 2 * a : a) + quad, false, `Beim Aufleiten wird durch die innere Ableitung ${tex(ft(b))} geteilt.`), D(trig + 2 * quad, false, `Die Stammfunktion von ${tex(`${K(c)}x`)} ist ${tex(`${cf(c, 2)}x^2`)} – der Faktor ${tex('\\tfrac12')} fehlt.`),
        D((isSin ? 0 : -trig) + quad, false, isSin ? `${tex('-\\cos(\\dots)')} an beiden Grenzen einsetzen: Die Werte heben sich nicht auf, sie addieren sich.` : 'Vorzeichen: Eine Stammfunktion von cos ist sin – ohne Minus.')];
      const FT = `${cf(isSin ? -a : a, b)}${isSin ? co : si}+${cf(c, 2)}x^2`;
      hints = [stamm, `Wegen der inneren Funktion ${tex(`${b}x`)} durch ${tex(ft(b))} teilen; aus ${tex(`${K(c)}x`)} wird ${tex(`${cf(c, 2)}x^2`)}: ${tex(`F(x)=${FT}`)}.`,
        `Obere Grenze: ${tex(`F(${hiT})=${tf(a, b)}+${piq}`)}, denn ${tex(isSin ? '\\cos(\\pi)=-1' : '\\sin(\\tfrac{\\pi}{2})=1')}.`, `Untere Grenze: ${tex(`F(0)=${isSin ? tf(-a, b) : '0'}`)}. Jetzt die Differenz bilden.`];
      explain = `${tex(`F(x)=${FT}`)}. ${tex(`F(${hiT})-F(0)=${tf(a, b)}+${piq}-${isSin ? `\\left(${tf(-a, b)}\\right)` : '0'}`)} ${tex(`=${tf(isSin ? 2 * a : a, b)}+${piq}\\approx${ft(trig + quad, 2)}`)}.`;
    } else {
      const wert = isSin ? (a * Math.PI) / (b * b) : (a * (Math.PI / 2 - 1)) / (b * b);
      formula = `\\int_{0}^{${hiT}}${K(a)}x\\cdot\\${fn}${arg(b)}\\,dx`; f = (x) => a * x * (isSin ? Math.sin(b * x) : Math.cos(b * x));
      opts = isSin ? [D(wert, true), D(-wert, false, `Vorzeichen: ${tex(`v=-${cf(1, b)}${co}`)} und ${tex('\\cos(\\pi)=-1')} – zweimal Minus ergibt Plus.`), D((a * Math.PI ** 2) / b ** 3, false, 'Die Faktoren einzeln zu integrieren ist bei einem Produkt falsch – hier hilft die partielle Integration.'), D((2 * a) / b, false, `Der Faktor ${tex('x')} fehlt: Integriert wurde nur ${tex(`${K(a)}\\sin${arg(b)}`)}.`)]
        : [D(wert, true), D((a * Math.PI) / (2 * b * b), false, `Das Restintegral ${tex(`\\int u'v\\,dx`)} fehlt noch.`), D((a * (Math.PI / 2 + 1)) / (b * b), false, 'Vorzeichen: Das Restintegral wird abgezogen, nicht addiert.'), D((a * Math.PI ** 2) / (8 * b ** 3), false, 'Die Faktoren einzeln zu integrieren ist bei einem Produkt falsch – hier hilft die partielle Integration.')];
      const v = isSin ? `-${cf(1, b)}${co}` : `${cf(1, b)}${si}`, FT = isSin ? `${cf(-a, b)}x\\,${co}+${cf(a, b * b)}${si}` : `${cf(a, b)}x\\,${si}+${cf(a, b * b)}${co}`;
      hints = [`Ein Produkt aus ${tex('x')} und ${tex(`\\${fn}`)}: partielle Integration ${tex("\\int u\\,v'\\,dx=u\\,v-\\int u'\\,v\\,dx")}.`, `Wähle ${tex(`u=${K(a)}x`)} mit ${tex(`u'=${a}`)} und ${tex(`v'=\\${fn}${arg(b)}`)} mit ${tex(`v=${v}`)}.`,
        `Das Restintegral ${tex(`\\int ${a}\\cdot\\left(${v}\\right)dx`)} ist wieder ein Grundintegral. Zusammen: ${tex(`F(x)=${FT}`)}.`, `Grenzen einsetzen: ${tex(`F(${hiT})-F(0)`)} – beachte ${tex(isSin ? '\\cos(\\pi)=-1,\\ \\sin(\\pi)=0' : '\\sin(\\tfrac{\\pi}{2})=1,\\ \\cos(\\tfrac{\\pi}{2})=0,\\ \\cos(0)=1')}.`];
      explain = `Partielle Integration mit ${tex(`u=${K(a)}x`)}, ${tex(`v=${v}`)}: ${tex(`F(x)=${FT}`)}. ${isSin ? `${tex(`F(${hiT})-F(0)=${cf(a, b * b)}\\pi-0`)}` : `${tex(`F(${hiT})-F(0)=${cf(a, 2 * b * b)}\\pi-${tf(a, b * b)}`)}`} ${tex(`\\approx${ft(wert, 2)}`)}.`;
    }
    if (!weit(opts, 0.11) || !uniq(opts)) continue;
    return { prompt: 'Berechne das Integral. Runde auf zwei Nachkommastellen.', formula, options: shuffle(opts), hints, explain, f, a: 0, b: hi };
  }
}

/* ───────────── Rotationskörper und uneigentliche Integrale ───────────── */

/** Volumen eines Rotationskörpers um die x-Achse: Stufe 1 Zylinder, 2 Kegel, 3 Wurzel oder binomische Formel, 4 Polynom oder Kegelstumpf, 5 Kugelschicht, Wurzelsumme, e-Funktion. */
export function genRotation(lv = 3) {
  for (;;) {
    const pi = (n, d2) => { const t = fracTex(n, d2); return t === '1' ? '\\pi' : `${t}\\,\\pi`; };
    const O = (n, d2, withPi, correct, why) => ({ tex: withPi ? pi(n, d2) : fracTex(n, d2), num: (n / d2) * (withPi ? Math.PI : 1), correct, why });
    const D = (num, correct, why) => ({ tex: ft(num, 2), num, correct, why });
    const formel = `${tex('V=\\pi\\int_a^b f(x)^2\\,dx')}.`, ohnePi = `Der Faktor ${tex('\\pi')} fehlt: ${tex('V=\\pi\\int f(x)^2\\,dx')}.`, zweiPi = `Es heißt ${tex('\\pi')}, nicht ${tex('2\\pi')} – die Formel kommt von der Kreisfläche ${tex('\\pi r^2')}.`;
    const binomFehlt = 'Binomische Formel: Beim Quadrieren fehlt das gemischte Glied in der Mitte.';
    const form = tier(lv, 'konst', 'gerade', pick(['wurzel', 'summe']), pick(['poly', 'stumpf', 'kugel']), pick(['wexp', 'wsum', 'exp']));
    let ftex, f, a = 0, b, vn, vd, typ, hints, explain, opts, prompt, rund = false;
    if (form === 'konst') {
      const m = pick([2, 3, 4]); b = pick([2, 3, 4, 5]); ftex = `${m}`; f = (x) => m + 0 * x; vn = m * m * b; vd = 1; typ = [m * b, 1, 'Die Funktion wird quadriert, bevor integriert wird.'];
      hints = [formel, `Es entsteht ein Zylinder: ${tex(`f(x)^2=${m * m}`)}.`]; explain = `${tex(`V=\\pi\\cdot ${m * m}\\cdot ${b}=${pi(vn, vd)}\\approx${ft(vn * Math.PI, 2)}`)}.`;
    } else if (form === 'gerade') {
      const m = pick([1, 2, 3]); b = pick([1, 2, 3, 4]); ftex = `${K(m)}x`; f = (x) => m * x; vn = m * m * b ** 3; vd = 3; typ = [m * b * b, 2, 'Die Funktion wird quadriert, bevor integriert wird.'];
      hints = [formel, `Erst quadrieren: ${tex(`f(x)^2=${K(m * m)}x^2`)}.`, `Aufleiten und die Grenzen einsetzen: ${tex(`\\left[${tf(m * m, 3) === '1' ? '' : tf(m * m, 3)}x^3\\right]_0^{${b}}`)}.`];
      explain = `Es entsteht ein Kegel: ${tex(`V=\\pi\\int_0^{${b}}${K(m * m)}x^2\\,dx=\\pi\\cdot${dfrac(m === 1 ? `${b}^3` : `${m * m}\\cdot ${b}^3`, 3)}=${pi(vn, vd)}\\approx${ft((vn / vd) * Math.PI, 2)}`)}.`;
    } else if (form === 'wurzel') {
      const k = pick([1, 2, 3]), c = pick([1, 2, 4]); b = pick([2, 3, 4]); ftex = `\\sqrt{${polyTex([c, k])}}`; f = (x) => Math.sqrt(k * x + c); vn = k * b * b + 2 * c * b; vd = 2; typ = [k * b * b + c * b, 1, `Beim Aufleiten von ${tex(`${K(k)}x`)} entsteht ${tex(`${tf(k, 2) === '1' ? '' : tf(k, 2)}x^2`)} – der Faktor ${tex('\\tfrac12')} fehlt.`];
      hints = [formel, `Das Quadrat hebt die Wurzel auf: ${tex(`f(x)^2=${polyTex([c, k])}`)}.`, `Stammfunktion: ${tex(`${tf(k, 2) === '1' ? '' : tf(k, 2)}x^2+${K(c)}x`)}. Jetzt die Grenzen 0 und ${b} einsetzen.`];
      explain = `${tex(`V=\\pi\\int_0^{${b}}(${polyTex([c, k])})\\,dx=\\pi\\left[${tf(k, 2) === '1' ? '' : tf(k, 2)}x^2+${K(c)}x\\right]_0^{${b}}`)} ${tex(`=\\pi\\cdot\\left(${tf(k * b * b, 2)}+${c * b}\\right)=${pi(vn, vd)}\\approx${ft((vn / vd) * Math.PI, 2)}`)}.`;
    } else if (form === 'summe') {
      const c = pick([1, 2, 3]); b = pick([1, 2, 3]); ftex = `x+${c}`; f = (x) => x + c; vn = b ** 3 + 3 * c * b * b + 3 * c * c * b; vd = 3; typ = [b ** 3 + 3 * c * c * b, 3, binomFehlt];
      hints = [formel, `Binomische Formel: ${tex(`(x+${c})^2=x^2+${2 * c}x+${c * c}`)}.`, `Stammfunktion: ${tex(`\\tfrac13x^3+${K(c)}x^2+${K(c * c)}x`)}. Jetzt die Grenzen 0 und ${b} einsetzen.`];
      explain = `${tex(`V=\\pi\\int_0^{${b}}(x^2+${2 * c}x+${c * c})\\,dx=\\pi\\left[\\tfrac13x^3+${K(c)}x^2+${K(c * c)}x\\right]_0^{${b}}`)} ${tex(`=\\pi\\cdot\\left(${tf(b ** 3, 3)}+${c * b * b}+${c * c * b}\\right)=${pi(vn, vd)}\\approx${ft((vn / vd) * Math.PI, 2)}`)}.`;
    } else if (form === 'poly') {
      const c = pick([1, 2, 3]); b = pick([1, 2]); ftex = `x^2+${c}`; f = (x) => x * x + c; vn = 3 * b ** 5 + 10 * c * b ** 3 + 15 * c * c * b; vd = 15; typ = [3 * b ** 5 + 15 * c * c * b, 15, binomFehlt];
      hints = [formel, `Binomische Formel: ${tex(`(x^2+${c})^2=x^4+${2 * c}x^2+${c * c}`)}.`, `Stammfunktion: ${tex(`\\tfrac15x^5+${tf(2 * c, 3)}x^3+${K(c * c)}x`)}.`, `Grenzen einsetzen: ${tex(`${tf(b ** 5, 5)}+${tf(2 * c * b ** 3, 3)}+${c * c * b}`)} – auf den Hauptnenner 15 bringen.`];
      explain = `${tex(`V=\\pi\\int_0^{${b}}(x^4+${2 * c}x^2+${c * c})\\,dx=\\pi\\left[\\tfrac15x^5+${tf(2 * c, 3)}x^3+${K(c * c)}x\\right]_0^{${b}}`)} ${tex(`=\\pi\\cdot\\left(${tf(b ** 5, 5)}+${tf(2 * c * b ** 3, 3)}+${c * c * b}\\right)=${pi(vn, vd)}\\approx${ft((vn / vd) * Math.PI, 2)}`)}.`;
    } else if (form === 'stumpf') {
      const m = pick([1, 2]), c = pick([1, 2, 3]); a = pick([1, 2]); b = a + pick([1, 2, 3]); ftex = `${K(m)}x+${c}`; f = (x) => m * x + c;
      const d3 = b ** 3 - a ** 3, d2 = b * b - a * a, d1 = b - a; vn = m * m * d3 + 3 * m * c * d2 + 3 * c * c * d1; vd = 3; typ = [m * m * d3 + 3 * c * c * d1, 3, binomFehlt];
      const FT = `${tf(m * m, 3)}x^3+${K(m * c)}x^2+${K(c * c)}x`, Fw = (x) => fracTex(m * m * x ** 3 + 3 * m * c * x * x + 3 * c * c * x, 3);
      hints = [formel, `Binomische Formel: ${tex(`(${ftex})^2=${polyTex([c * c, 2 * m * c, m * m])}`)}.`, `Stammfunktion: ${tex(`F(x)=${FT}`)}.`, `Es entsteht ein Kegelstumpf. Grenzen einsetzen: ${tex(`F(${b})=${Fw(b)}`)} und ${tex(`F(${a})=${Fw(a)}`)}.`];
      explain = `${tex(`V=\\pi\\int_{${a}}^{${b}}(${polyTex([c * c, 2 * m * c, m * m])})\\,dx=\\pi\\left[${FT}\\right]_{${a}}^{${b}}`)} ${tex(`=\\pi\\cdot\\left(${Fw(b)}-${Fw(a)}\\right)=${pi(vn, vd)}\\approx${ft((vn / vd) * Math.PI, 2)}`)}.`;
    } else if (form === 'kugel') {
      const r = pick([3, 4, 5, 6]); a = pick([0, 1, 2]); b = a + pick([1, 2, 3]); if (b > r) continue;
      ftex = `\\sqrt{${r * r}-x^2}`; f = (x) => Math.sqrt(Math.max(0, r * r - x * x)); vn = 3 * r * r * (b - a) - (b ** 3 - a ** 3); vd = 3; typ = [r * r * (b - a) - (b ** 3 - a ** 3), 1, `Beim Aufleiten von ${tex('x^2')} entsteht ${tex('\\tfrac13x^3')} – der Faktor ${tex('\\tfrac13')} fehlt.`];
      const Fw = (x) => fracTex(3 * r * r * x - x ** 3, 3);
      prompt = `Eine Kugel mit Radius ${r} entsteht, wenn der Halbkreis zu ${tex('f')} um die x-Achse rotiert. Wie groß ist das Volumen der <b>Kugelschicht</b> zwischen ${tex(`x=${a}`)} und ${tex(`x=${b}`)}?`;
      hints = [formel, `Das Quadrat hebt die Wurzel auf: ${tex(`f(x)^2=${r * r}-x^2`)}.`, `Stammfunktion: ${tex(`F(x)=${r * r}x-\\tfrac13x^3`)}.`, `Grenzen einsetzen: ${tex(`F(${b})=${Fw(b)}`)} und ${tex(`F(${a})=${Fw(a)}`)}.`];
      explain = `${tex(`V=\\pi\\int_{${a}}^{${b}}(${r * r}-x^2)\\,dx=\\pi\\left[${r * r}x-\\tfrac13x^3\\right]_{${a}}^{${b}}`)} ${tex(`=\\pi\\cdot\\left(${Fw(b)}-${Fw(a)}\\right)=${pi(vn, vd)}\\approx${ft((vn / vd) * Math.PI, 2)}`)}.`;
    } else if (form === 'wsum') {
      const c = pick([1, 2, 3]), w = pick([1, 2, 3]); b = w * w; ftex = `\\sqrt{x}+${c}`; f = (x) => Math.sqrt(x) + c; vn = 3 * b * b + 8 * c * b * w + 6 * c * c * b; vd = 6; typ = [3 * b * b + 6 * c * c * b, 6, binomFehlt];
      hints = [formel, `Binomische Formel: ${tex(`(\\sqrt{x}+${c})^2=x+${2 * c}\\sqrt{x}+${c * c}`)}.`, `Schreibe ${tex('\\sqrt{x}=x^{1/2}')}; aufgeleitet ${tex('\\tfrac23x^{3/2}')}. Stammfunktion: ${tex(`F(x)=\\tfrac12x^2+${tf(4 * c, 3)}x^{3/2}+${K(c * c)}x`)}.`, `Obere Grenze: ${tex(`${b}^{3/2}=${b * w}`)}, also ${tex(`F(${b})=${tf(b * b, 2)}+${tf(4 * c * b * w, 3)}+${c * c * b}`)}; ${tex('F(0)=0')}.`];
      explain = `${tex(`V=\\pi\\int_0^{${b}}(x+${2 * c}\\sqrt{x}+${c * c})\\,dx=\\pi\\left[\\tfrac12x^2+${tf(4 * c, 3)}x^{3/2}+${K(c * c)}x\\right]_0^{${b}}`)} ${tex(`=\\pi\\cdot\\left(${tf(b * b, 2)}+${tf(4 * c * b * w, 3)}+${c * c * b}\\right)=${pi(vn, vd)}\\approx${ft((vn / vd) * Math.PI, 2)}`)}.`;
    } else if (form === 'wexp') {
      const k = pick([0.5, 1, 0.25]), c1 = 1 / (2 * k), c2 = 1 / (4 * k * k), e2 = `e^{${K(2 * k)}x}`; b = pick([1, 2, 3, 4]); ftex = `\\sqrt{x}\\cdot e^{${K(k)}x}`; f = (x) => Math.sqrt(x) * Math.exp(k * x); rund = true;
      if (c1 * b === c2) continue;
      const eh = Math.exp(2 * k * b), co = eh * (c1 * b - c2) + c2, V = Math.PI * co, FT = `${e2}\\cdot\\left(${K(c1)}x-${ft(c2)}\\right)`;
      opts = [D(V, true), D(co, false, ohnePi), D(Math.PI * c1 * b * eh, false, `Das Restintegral ${tex("\\int u'v\\,dx")} der partiellen Integration fehlt.`), D((Math.PI * b * b * (eh - 1) * c1) / 2, false, 'Die Faktoren einzeln zu integrieren ist bei einem Produkt falsch – hier hilft die partielle Integration.')];
      hints = [formel, `Quadrieren: Die Wurzel fällt weg, der Exponent verdoppelt sich (Potenzgesetz): ${tex(`f(x)^2=x\\cdot ${e2}`)}.`, `Ein Produkt – partielle Integration ${tex("\\int u\\,v'\\,dx=u\\,v-\\int u'\\,v\\,dx")} mit ${tex('u=x')}, ${tex(`v'=${e2}`)}, also ${tex(`v=${K(c1)}${e2}`)}.`,
        `${tex(`\\int x\\,${e2}\\,dx=${K(c1)}x\\,${e2}-\\int ${K(c1)}${e2}\\,dx=${FT}`)}.`, `Grenzen einsetzen: ${tex(`F(${b})=e^{${ft(2 * k * b)}}\\cdot ${par(c1 * b - c2)}`)} und ${tex(`F(0)=-${ft(c2)}`)}.`];
      explain = `${tex(`V=\\pi\\int_0^{${b}}x\\,${e2}\\,dx`)}. Partielle Integration: ${tex(`F(x)=${FT}`)}. ${tex(`V=\\pi\\cdot\\left(${K(c1 * b - c2) === '' ? '' : `${par(c1 * b - c2)}\\cdot `}e^{${ft(2 * k * b)}}+${ft(c2)}\\right)\\approx${ft(V, 2)}`)}.`;
    } else {
      const am = pick([1, 2, 3]), k = pick([0.25, 1, 0.2, 0.4]); b = pick([1, 2, 3, 4]); ftex = `${K(am)}e^{${K(k)}x}`; f = (x) => am * Math.exp(k * x); rund = true;
      const co = (am * am * (Math.exp(2 * k * b) - 1)) / (2 * k), V = Math.PI * co, vor = ft((am * am) / (2 * k));
      opts = [D(V, true), D(co, false, ohnePi), D(Math.PI * am * am * (Math.exp(2 * k * b) - 1), false, `Beim Aufleiten von ${tex(`e^{${K(2 * k)}x}`)} wird durch die innere Ableitung ${tex(ft(2 * k))} geteilt.`), D((Math.PI * am * (Math.exp(k * b) - 1)) / k, false, 'Die Funktion wird quadriert, bevor integriert wird.')];
      hints = [formel, `Quadrieren mit dem Potenzgesetz: ${tex(`f(x)^2=${K(am * am)}e^{${K(2 * k)}x}`)}.`, `Stammfunktion (durch die innere Ableitung ${tex(ft(2 * k))} teilen): ${tex(`F(x)=${vor}\\,e^{${K(2 * k)}x}`)}.`, `Grenzen einsetzen: ${tex(`F(${b})-F(0)=${vor}\\cdot\\left(e^{${ft(2 * k * b)}}-1\\right)`)}.`];
      explain = `${tex(`V=\\pi\\int_0^{${b}}${K(am * am)}e^{${K(2 * k)}x}\\,dx=\\pi\\left[${vor}\\,e^{${K(2 * k)}x}\\right]_0^{${b}}`)} ${tex(`=${vor}\\,\\pi\\cdot\\left(e^{${ft(2 * k * b)}}-1\\right)\\approx${ft(V, 2)}`)}.`;
    }
    if (!opts) opts = [O(vn, vd, true, true), O(vn, vd, false, false, ohnePi), O(typ[0], typ[1], true, false, typ[2]), O(2 * vn, vd, true, false, zweiPi)];
    const V = opts[0].num;
    if (!weit(opts, 0.11) || !uniq(opts) || opts.slice(1).some((o) => Math.abs(o.num - V) < 0.02 * V)) continue;
    return { prompt: `${prompt || `Der Graph von ${tex('f')} rotiert über dem Intervall ${tex(`[${a};\\,${b}]`)} um die x-Achse. Wie groß ist das Volumen des Rotationskörpers?`}${rund ? ' Runde auf zwei Nachkommastellen.' : ''}`, formula: `f(x)=${ftex}`, options: shuffle(opts), hints, explain, f, a, b };
  }
}

/** Uneigentliche Integrale: Stufe 1–2 Grundformen, 3 höhere Potenz oder e-Funktion ab einer Grenze a > 0, 4 Wurzel im Nenner (Bruch-Exponent), 5 partielle Integration oder Substitution. */
export function genUneigentlich(lv = 3) {
  for (;;) {
    const F = (z, nn, correct, why) => ({ tex: fracTex(z, nn), num: z / nn, correct, why });
    const UN = (why) => ({ tex: '\\infty', num: 1e9, correct: false, why });
    const erst = `Erst bis zu einer Grenze ${tex('b')} integrieren, dann ${tex('b')} gegen unendlich laufen lassen.`, vzw = 'Achte auf die Vorzeichen: Der Flächeninhalt unter dieser Kurve ist positiv.';
    const form = tier(lv, 'potenz', pick(['potenz', 'e0']), pick(['potenz', 'ea']), 'wurzel', pick(['part', 'part2', 'subst']));
    const [p, q] = pick(lv <= 2 ? [[2, 1], [3, 1], [1, 2], [4, 1]] : [[2, 1], [3, 1], [1, 2], [3, 2], [4, 1], [1, 4], [5, 2]]), c = p / q, k = pick(lv <= 1 ? [1] : lv === 2 ? [2, 3, 5, 6] : [1, 2, 3, 6]), ex = `e^{-${K(c)}x}`;
    const ein = (v) => (v === '1' ? '' : v), zuNah = (opts) => !uniq(opts) || !weit(opts, 0.03) || opts[0].num < 0.05;
    if (form === 'potenz') {
      const a = pick(tier(lv, [2, 3, 4, 5, 6, 7, 8, 9, 10], [2, 3, 4, 5], [1, 2, 3])), n = lv >= 3 ? pick([3, 4]) : 2, zn = [k, (n - 1) * a ** (n - 1)];
      const opts = [F(zn[0], zn[1], true), n === 2 ? F(k, a * a, false, 'Du hast die Grenze in die Funktion eingesetzt. Erst die Stammfunktion bilden.') : F(k, a ** (n - 1), false, `Beim Aufleiten von ${tex(`x^{-${n}}`)} entsteht der Faktor ${tex(`\\tfrac{1}{-${n - 1}}`)}.`),
        F(-zn[0], zn[1], false, vzw), UN(`Für ${tex('n>1')} fällt ${tex('\\tfrac{1}{x^n}')} schnell genug – die Fläche bleibt endlich.`)];
      if (zuNah(opts)) continue;
      const FT = `-${dfrac(ft(k), `${n === 2 ? '' : n - 1}${xp(n - 1)}`)}`, an = n === 2 ? `${a}` : `${n - 1}\\cdot ${a}^{${n - 1}}`;
      const hints = lv <= 1 ? [`Eine Stammfunktion von ${tex('\\tfrac{1}{x^2}=x^{-2}')} ist ${tex('-\\tfrac{1}{x}')}.`, `Für ${tex('b\\to\\infty')} geht ${tex('-\\tfrac1b')} gegen 0. Es bleibt der Wert an der unteren Grenze.`]
        : [erst, `Schreibe ${tex(`${dfrac(ft(k), xp(n))}=${K(k)}x^{-${n}}`)}; eine Stammfunktion ist ${tex(`F(x)=${FT}`)}.`, `${tex(`F(b)-F(${a})=-${dfrac(ft(k), `${n === 2 ? '' : n - 1}b${n === 2 ? '' : `^{${n - 1}}`}`)}+${dfrac(ft(k), an)}`)} – der erste Teil geht für ${tex('b\\to\\infty')} gegen 0.`];
      return { prompt: 'Berechne das uneigentliche Integral.', formula: `\\int_{${a}}^{\\infty}${dfrac(ft(k), xp(n))}\\,dx`, options: shuffle(opts), hints,
        explain: lv <= 1 ? `${tex(`\\left[-\\tfrac1x\\right]_{${a}}^{b}=-\\tfrac1b+\\tfrac{1}{${a}}\\to${fracTex(1, a)}`)}.` : `${tex(`\\int_{${a}}^{b}${K(k)}x^{-${n}}dx=\\left[${FT}\\right]_{${a}}^{b}\\to 0+${dfrac(ft(k), an)}=${fracTex(zn[0], zn[1])}`)} für ${tex('b\\to\\infty')}.`, f: (x) => k / x ** n, a, form };
    }
    if (form === 'e0') {
      const opts = [F(k * q, p, true), F(k * p, q, false, `Beim Aufleiten wird durch den Faktor ${tex(ft(c))} im Exponenten geteilt, nicht damit multipliziert.`), F(-k * q, p, false, vzw), UN('Die e-Funktion fällt so schnell, dass die Fläche endlich bleibt.')];
      if (zuNah(opts)) continue;
      const vor = ein(fracTex(k * q, p));
      return { prompt: 'Berechne das uneigentliche Integral.', formula: `\\int_{0}^{\\infty}${K(k)}${ex}\\,dx`, options: shuffle(opts),
        hints: [erst, `Stammfunktion (durch die innere Ableitung ${tex(ft(-c))} teilen): ${tex(`F(x)=-${vor}${ex}`)}.`, `Für ${tex('b\\to\\infty')} geht ${tex(`e^{-${K(c)}b}`)} gegen 0; an der unteren Grenze ist ${tex('e^{0}=1')}.`],
        explain: `${tex(`\\left[-${vor}${ex}\\right]_{0}^{b}=-${vor}e^{-${K(c)}b}+${fracTex(k * q, p)}\\to${fracTex(k * q, p)}`)} für ${tex('b\\to\\infty')}.`, f: (x) => k * Math.exp(-c * x), a: 0, form };
    }
    if (form === 'ea') {
      const a = pick([1, 2]), E = (z, nn, correct, why) => ({ tex: `${fracTex(z, nn) === '1' ? '' : fracTex(z, nn) === '-1' ? '-' : fracTex(z, nn)}e^{-${ft(c * a)}}`, num: (z / nn) * Math.exp(-c * a), correct, why });
      const opts = [E(k * q, p, true), E(k * p, q, false, `Beim Aufleiten wird durch den Faktor ${tex(ft(c))} im Exponenten geteilt, nicht damit multipliziert.`), E(-k * q, p, false, vzw), UN('Die e-Funktion fällt so schnell, dass die Fläche endlich bleibt.')];
      if (c * a > 3 || zuNah(opts)) continue;
      const vor = ein(fracTex(k * q, p)), FT = `-${vor}${ex}`;
      return { prompt: 'Berechne das uneigentliche Integral.', formula: `\\int_{${a}}^{\\infty}${K(k)}${ex}\\,dx`, options: shuffle(opts),
        hints: [erst, `Stammfunktion (durch die innere Ableitung ${tex(ft(-c))} teilen): ${tex(`F(x)=${FT}`)}.`, `${tex(`F(b)-F(${a})=-${vor}e^{-${K(c)}b}+${vor}e^{-${ft(c * a)}}`)} – für ${tex('b\\to\\infty')} geht ${tex(`e^{-${K(c)}b}`)} gegen 0.`],
        explain: `${tex(`\\int_{${a}}^{b}${K(k)}${ex}\\,dx=\\left[${FT}\\right]_{${a}}^{b}\\to 0+${vor}e^{-${ft(c * a)}}\\approx${ft(opts[0].num, 4)}`)} für ${tex('b\\to\\infty')}.`, f: (x) => k * Math.exp(-c * x), a, form };
    }
    if (form === 'wurzel') {
      // k / (x^m · √x) = k·x^(−m−1/2);  Stammfunktion −2k/(2m−1) · x^(−m+1/2);  Wert 2k / ((2m−1)·a^(m−1)·√a)
      const m = pick([2, 3]), w = pick([1, 2, 3]), a = w * w, e2 = 2 * m - 1, nen = e2 * a ** (m - 1) * w, xm = xp(m), bx = (z) => `\\tfrac{${z}}{2}`;
      const opts = [F(2 * k, nen, true), F(k, a ** (m - 1) * w, false, `Beim Aufleiten von ${tex(`x^{-${bx(2 * m + 1)}}`)} entsteht der Faktor ${tex(`-\\tfrac{2}{${e2}}`)} – er fehlt hier.`), F(-2 * k, nen, false, vzw), UN(`Der Exponent ${tex(bx(2 * m + 1))} ist größer als 1: Die Funktion fällt schnell genug, die Fläche bleibt endlich.`)];
      if (zuNah(opts)) continue;
      const vor = fracTex(2 * k, e2), FT = `-${ein(vor)}x^{-${bx(e2)}}`;
      return { prompt: 'Berechne das uneigentliche Integral.', formula: `\\int_{${a}}^{\\infty}${dfrac(ft(k), `${xm}\\sqrt{x}`)}\\,dx`, options: shuffle(opts),
        hints: [erst, `Schreibe den Bruch als Potenz (Potenzgesetz): ${tex(`${xm}\\cdot\\sqrt{x}=x^{${bx(2 * m + 1)}}`)}, also ${tex(`f(x)=${K(k)}x^{-${bx(2 * m + 1)}}`)}.`,
          `Potenzregel beim Aufleiten – Exponent um 1 erhöhen und durch den neuen Exponenten ${tex(`-${bx(e2)}`)} teilen: ${tex(`F(x)=${FT}`)}.`,
          `${tex(`F(b)\\to 0`)} für ${tex('b\\to\\infty')}; es bleibt ${tex(`-F(${a})`)} mit ${tex(`${a}^{${bx(e2)}}=${a ** (m - 1) * w}`)}.`],
        explain: `${tex(`f(x)=${K(k)}x^{-${bx(2 * m + 1)}}`)}, ${tex(`F(x)=${FT}`)}. ${tex(`\\left[${FT}\\right]_{${a}}^{b}\\to 0+${dfrac(2 * k, `${e2}\\cdot ${a ** (m - 1) * w}`)}=${fracTex(2 * k, nen)}`)} für ${tex('b\\to\\infty')}${Number.isInteger((2 * k) / nen) ? '' : ` ${tex(`\\approx${ft((2 * k) / nen, 3)}`)}`}.`, f: (x) => k / (x ** m * Math.sqrt(x)), a, form };
    }
    if (form === 'part2') {
      const opts = [F(2 * k * q ** 3, p ** 3, true), F(k * q ** 3, p ** 3, false, `Aus ${tex(`u=${K(k)}x^2`)} wird ${tex(`u'=${2 * k}x`)} – der Faktor 2 fehlt.`), F(2 * k * q * q, p * p, false, `Auch im letzten Restintegral wird noch einmal durch ${tex(ft(c))} geteilt.`), UN(`${tex('x^2')} wächst zwar, aber ${tex(ex)} fällt viel schneller – die Fläche bleibt endlich.`)];
      if (zuNah(opts)) continue;
      const v1 = fracTex(q, p), kc = fracTex(k * q, p), k2 = fracTex(2 * k * q, p), k3 = fracTex(2 * k * q * q, p * p), wert = fracTex(2 * k * q ** 3, p ** 3);
      return { prompt: 'Berechne das uneigentliche Integral.', formula: `\\int_{0}^{\\infty}${K(k)}x^{2}\\cdot ${ex}\\,dx`, options: shuffle(opts),
        hints: [`Ein Produkt aus ${tex('x^2')} und einer e-Funktion: partielle Integration ${tex("\\int u\\,v'\\,dx=u\\,v-\\int u'\\,v\\,dx")} – zweimal, bis kein ${tex('x')} mehr vor der e-Funktion steht.`,
          `Erster Schritt: ${tex(`u=${K(k)}x^2`)}, ${tex(`u'=${2 * k}x`)}, ${tex(`v'=${ex}`)}, ${tex(`v=-${ein(v1)}${ex}`)}. Also ${tex(`\\left[-${ein(kc)}x^2\\,${ex}\\right]_0^b+${k2}\\int_0^b x\\,${ex}\\,dx`)}.`,
          `Zweiter Schritt (wieder partiell): ${tex(`\\int_0^b x\\,${ex}\\,dx=\\left[-${ein(v1)}x\\,${ex}\\right]_0^b+${v1}\\int_0^b ${ex}\\,dx`)}.`,
          `Für ${tex('b\\to\\infty')} gehen ${tex(`b^2e^{-${K(c)}b}`)} und ${tex(`b\\,e^{-${K(c)}b}`)} gegen 0 (die e-Funktion gewinnt); ${tex(`\\int_0^{\\infty}${ex}\\,dx=${v1}`)}.`, `Zusammensetzen: ${tex(`${k2}\\cdot${v1}\\cdot${v1}`)}.`],
        explain: `Zweimal partielle Integration: Die Randterme ${tex(`\\left[-${ein(kc)}x^2\\,${ex}\\right]_0^b`)} und ${tex(`\\left[-${ein(v1)}x\\,${ex}\\right]_0^b`)} gehen gegen 0. Es bleibt ${tex(`${k2}\\cdot${v1}\\int_0^{\\infty}${ex}\\,dx=${k3}\\cdot${v1}=${wert}`)}${Number.isInteger((2 * k * q ** 3) / p ** 3) ? '' : ` ${tex(`\\approx${ft((2 * k * q ** 3) / p ** 3, 3)}`)}`}.`, f: (x) => k * x * x * Math.exp(-c * x), a: 0, form };
    }
    if (form === 'part') {
      const opts = [F(k * q * q, p * p, true), F(k * q, p, false, `Auch im Restintegral wird noch einmal durch ${tex(ft(c))} geteilt.`), F(-k * q * q, p * p, false, vzw), UN(`${tex('x')} wächst zwar, aber ${tex(ex)} fällt viel schneller – die Fläche bleibt endlich.`)];
      if (zuNah(opts)) continue;
      const v1 = fracTex(q, p), kc = fracTex(k * q, p), kcc = fracTex(k * q * q, p * p);
      return { prompt: 'Berechne das uneigentliche Integral.', formula: `\\int_{0}^{\\infty}${K(k)}x\\cdot ${ex}\\,dx`, options: shuffle(opts),
        hints: [`Ein Produkt aus ${tex('x')} und einer e-Funktion: partielle Integration ${tex("\\int u\\,v'\\,dx=u\\,v-\\int u'\\,v\\,dx")}.`, `Wähle ${tex(`u=${K(k)}x`)} mit ${tex(`u'=${k}`)} und ${tex(`v'=${ex}`)} mit ${tex(`v=-${ein(v1)}${ex}`)}.`,
          `${tex(`\\int_0^b ${K(k)}x\\,${ex}\\,dx=\\left[-${ein(kc)}x\\,${ex}\\right]_0^b+${kc}\\int_0^b ${ex}\\,dx`)}.`, `Für ${tex('b\\to\\infty')} geht ${tex(`b\\cdot e^{-${K(c)}b}`)} gegen 0 (die e-Funktion gewinnt): Der Randterm verschwindet.`, `Restintegral: ${tex(`\\int_0^{\\infty}${ex}\\,dx=\\left[-${ein(v1)}${ex}\\right]_0^{\\infty}=${v1}`)}, zusammen ${tex(`${kc}\\cdot${v1}`)}.`],
        explain: `Partielle Integration: ${tex(`\\left[-${ein(kc)}x\\,${ex}\\right]_0^b\\to 0`)} und ${tex(`${kc}\\int_0^{\\infty}${ex}\\,dx=${kc}\\cdot${v1}=${kcc}`)}. Das Integral hat den Wert ${tex(`${kcc}${Number.isInteger((k * q * q) / (p * p)) ? '' : `\\approx${ft((k * q * q) / (p * p), 3)}`}`)}.`, f: (x) => k * x * Math.exp(-c * x), a: 0, form };
    }
    const opts = [F(k * q, 2 * p, true), F(k * q, p, false, `Aus ${tex('du=\\dots x\\,dx')} kommt der Faktor ${tex('\\tfrac12')} dazu – er fehlt hier.`), F(-k * q, 2 * p, false, vzw), UN(`${tex('x')} wächst zwar, aber ${tex(`e^{-${K(c)}x^2}`)} fällt viel schneller – die Fläche bleibt endlich.`)];
    if (zuNah(opts)) continue;
    const vor = fracTex(k * q, 2 * p), ex2 = `e^{-${K(c)}x^2}`;
    return { prompt: 'Berechne das uneigentliche Integral.', formula: `\\int_{0}^{\\infty}${K(k)}x\\cdot ${ex2}\\,dx`, options: shuffle(opts),
      hints: [`Im Exponenten steht ${tex('x^2')}, davor (bis auf einen Faktor) dessen Ableitung: Substitution ${tex(`u=${K(c)}x^2`)}.`, `${tex(`\\dfrac{du}{dx}=${K(2 * c)}x`)}, also ${tex(`x\\,dx=${2 * c === 1 ? 'du' : dfrac('du', ft(2 * c))}`)}. Die Grenzen 0 und ${tex('\\infty')} bleiben.`,
        `${tex(`\\int_0^{\\infty}${K(k)}x\\,${ex2}\\,dx=${vor}\\int_0^{\\infty}e^{-u}\\,du`)}.`, `${tex('\\int_0^{b}e^{-u}\\,du=\\left[-e^{-u}\\right]_0^b=1-e^{-b}')} geht für ${tex('b\\to\\infty')} gegen 1.`, `Es bleibt der Vorfaktor ${tex(vor)}.`],
      explain: `Substitution ${tex(`u=${K(c)}x^2`)}: ${tex(`${vor}\\int_0^{\\infty}e^{-u}\\,du=${vor}\\cdot\\left[-e^{-u}\\right]_0^{\\infty}=${vor}\\cdot 1=${vor}`)}${Number.isInteger((k * q) / (2 * p)) ? '' : ` ${tex(`\\approx${ft((k * q) / (2 * p), 3)}`)}`}.`, f: (x) => k * x * Math.exp(-c * x * x), a: 0, form };
  }
}

/* ───────────── Zufallsgrößen und Unabhängigkeit ───────────── */

const EINKL = [['der Gäste eines Freizeitparks sind Kinder', 'Von den Kindern haben', 'eine Jahreskarte', 'aller Gäste sind weder Kinder noch haben sie eine Jahreskarte'],
  ['der Kunden eines Online-Händlers bestellen per App', 'Von den App-Kunden zahlen', 'per Lastschrift', 'aller Kunden bestellen weder per App noch zahlen sie per Lastschrift'],
  ['der Fahrgäste einer Buslinie sind Schüler', 'Von den Schülern besitzen', 'ein Fahrrad', 'aller Fahrgäste sind weder Schüler noch besitzen sie ein Fahrrad']];

/** Stochastische Unabhängigkeit prüfen: Stufe 1 fertige Wahrscheinlichkeiten, 2 Anzahlen, 3 über den Additionssatz, 4 Vierfeldertafel mit Lücke, 5 bedingte Wahrscheinlichkeit und Gegenereignis in einer Einkleidung. */
export function genUnabhaengig(lv = 3) {
  for (;;) {
    const N0 = pick(tier(lv, [100], [100, 200], [200, 400], [240, 300, 360], [400, 500, 1000]));
    const pa = pick(lv >= 5 ? [20, 25, 30, 35, 40, 45, 60] : [20, 25, 40, 50, 60]), pb = pick(lv >= 5 ? [15, 20, 30, 35, 40, 45] : [20, 30, 40, 50]), unab = rand() < 0.5;
    const A = (N0 * pa) / 100, B = (N0 * pb) / 100, AB = (A * pb) / 100 + (unab ? 0 : pick([-1, 1]) * pick(tier(lv, [10], [10, 5], [10, 12], [6, 9], [4, 8, 12])));
    const nur = [A - AB, B - AB, N0 - A - B + AB];            // nur A, nur B, keines von beiden
    if (![A, B, AB].every((v) => Number.isInteger(v) && v > 0) || nur.some((v) => v <= 0)) continue;
    if (lv >= 5 && !Number.isInteger((AB * 10000) / A)) continue;
    const pA = A / N0, pB = B / N0, pAB = AB / N0, prod = pA * pB, pU = (A + B - AB) / N0, pBA = AB / A, pKein = nur[2] / N0;
    const z = (x) => ft(x, 4), gl = (x) => (Math.abs(x * 1e4 - Math.round(x * 1e4)) < 1e-7 ? '=' : '\\approx'), pz = (x) => `${fmt(100 * x, 2)} %`;
    const regel = `Unabhängig heißt: ${tex('P(A\\cap B)=P(A)\\cdot P(B)')}.`, vergl = `${tex(`P(A)\\cdot P(B)=${z(pA)}\\cdot${z(pB)}${gl(prod)}${z(prod)}`)} und ${tex(`P(A\\cap B)${gl(pAB)}${z(pAB)}`)}`;
    const schluss = unab ? 'gleich, also unabhängig' : 'verschieden, also abhängig';
    let prompt, formula, hints, explain, daten;
    if (lv <= 1) {
      prompt = `Es gilt ${tex(`P(A)=${z(pA)}`)}, ${tex(`P(B)=${z(pB)}`)} und ${tex(`P(A\\cap B)=${z(pAB)}`)}. Sind ${tex('A')} und ${tex('B')} stochastisch unabhängig?`;
      hints = [regel, 'Multipliziere die beiden Einzelwahrscheinlichkeiten und vergleiche.']; explain = `${vergl}: ${schluss}.`; daten = { pA, pB, pAB };
    } else if (lv === 2) {
      prompt = `Von ${N0} Befragten haben ${A} das Merkmal ${tex('A')}, ${B} das Merkmal ${tex('B')} und ${AB} beide Merkmale. Sind ${tex('A')} und ${tex('B')} stochastisch unabhängig?`;
      hints = [regel, `Rechne erst die Anteile aus: ${tex(`P(A)=\\tfrac{${A}}{${N0}}=${z(pA)}`)}, ${tex(`P(B)=\\tfrac{${B}}{${N0}}=${z(pB)}`)}, ${tex(`P(A\\cap B)=\\tfrac{${AB}}{${N0}}=${z(pAB)}`)}.`, 'Multipliziere die beiden Einzelwahrscheinlichkeiten und vergleiche.'];
      explain = `Anteile: ${tex(`P(A)=${z(pA)}`)}, ${tex(`P(B)=${z(pB)}`)}. ${vergl}: ${schluss}.`; daten = { n: N0, A, B, AB };
    } else if (lv === 3) {
      prompt = `Es gilt ${tex(`P(A)=${z(pA)}`)}, ${tex(`P(B)=${z(pB)}`)} und ${tex(`P(A\\cup B)=${z(pU)}`)}. Sind ${tex('A')} und ${tex('B')} stochastisch unabhängig?`;
      hints = [regel, `Gegeben ist die Vereinigung. Additionssatz: ${tex('P(A\\cup B)=P(A)+P(B)-P(A\\cap B)')}.`, `Umgestellt: ${tex(`P(A\\cap B)=${z(pA)}+${z(pB)}-${z(pU)}=${z(pAB)}`)}.`, `Jetzt das Produkt ${tex(`${z(pA)}\\cdot${z(pB)}`)} ausrechnen und vergleichen.`];
      explain = `Additionssatz: ${tex(`P(A\\cap B)=${z(pA)}+${z(pB)}-${z(pU)}=${z(pAB)}`)}. ${vergl}: ${schluss}.`; daten = { pA, pB, pU };
    } else if (lv === 4) {
      prompt = `Die Vierfeldertafel zeigt, wie viele von ${N0} Befragten die Merkmale ${tex('A')} und ${tex('B')} haben – ein Feld fehlt. Sind ${tex('A')} und ${tex('B')} stochastisch unabhängig?`;
      formula = `\\begin{array}{c|cc|c}&B&\\overline{B}&\\\\\\hline A&?&${nur[0]}&\\\\ \\overline{A}&${nur[1]}&${nur[2]}&\\\\\\hline &&&${N0}\\end{array}`;
      hints = [regel, `Fehlendes Feld: ${tex(`|A\\cap B|=${N0}-${nur[0]}-${nur[1]}-${nur[2]}=${AB}`)}.`, `Randsummen: ${tex(`|A|=${AB}+${nur[0]}=${A}`)} und ${tex(`|B|=${AB}+${nur[1]}=${B}`)}.`,
        `Anteile bilden: ${tex(`P(A)=\\tfrac{${A}}{${N0}}`)}, ${tex(`P(B)=\\tfrac{${B}}{${N0}}`)}, ${tex(`P(A\\cap B)=\\tfrac{${AB}}{${N0}}`)} – dann Produkt und Schnitt vergleichen.`];
      explain = `${tex(`|A\\cap B|=${AB}`)}, ${tex(`|A|=${A}`)}, ${tex(`|B|=${B}`)}. ${tex(`P(A)\\cdot P(B)=\\tfrac{${A}}{${N0}}\\cdot\\tfrac{${B}}{${N0}}${gl(prod)}${z(prod)}`)} und ${tex(`P(A\\cap B)=\\tfrac{${AB}}{${N0}}${gl(pAB)}${z(pAB)}`)}: ${schluss}.`; daten = { n: N0, nurA: nur[0], nurB: nur[1], kein: nur[2] };
    } else {
      const e = pick(EINKL);
      prompt = `${pz(pA)} ${e[0]} (Ereignis ${tex('A')}). ${e[1]} ${pz(pBA)} ${e[2]} (Ereignis ${tex('B')}). ${pz(pKein)} ${e[3]}. Sind ${tex('A')} und ${tex('B')} stochastisch unabhängig?`;
      const pAqB = (1 - pA) - pKein;
      hints = [regel, `Pfadregel: ${tex(`P(A\\cap B)=P(A)\\cdot P_A(B)=${z(pA)}\\cdot${z(pBA)}=${z(pAB)}`)}.`, `Gegenereignis: ${tex(`P(\\overline{A})=1-${z(pA)}=${z(1 - pA)}`)}. Davon ohne ${tex('B')}: ${tex(z(pKein))}, also ${tex(`P(\\overline{A}\\cap B)=${z(1 - pA)}-${z(pKein)}=${z(pAqB)}`)}.`,
        `${tex(`P(B)=P(A\\cap B)+P(\\overline{A}\\cap B)=${z(pAB)}+${z(pAqB)}=${z(pB)}`)}.`, `Jetzt das Produkt ${tex(`${z(pA)}\\cdot${z(pB)}`)} ausrechnen und mit ${tex(`P(A\\cap B)=${z(pAB)}`)} vergleichen.`];
      explain = `Pfadregel: ${tex(`P(A\\cap B)=${z(pA)}\\cdot${z(pBA)}=${z(pAB)}`)}. Über das Gegenereignis: ${tex(`P(\\overline{A}\\cap B)=${z(1 - pA)}-${z(pKein)}=${z(pAqB)}`)}, also ${tex(`P(B)=${z(pAB)}+${z(pAqB)}=${z(pB)}`)}. ${vergl}: ${schluss}.`; daten = { pA, pBA, pKein };
    }
    const O = (key, html, correct, why) => ({ tex: key, html, key, correct, why }), zahl = lv <= 2;
    const opts = [O('u', zahl ? `Unabhängig, denn ${tex(`P(A)\\cdot P(B)=${z(prod)}=P(A\\cap B)`)}.` : `Unabhängig, denn ${tex('P(A)\\cdot P(B)=P(A\\cap B)')}.`, unab, `Rechne nach: ${tex(`P(A)\\cdot P(B)${gl(prod)}${z(prod)}`)}, aber ${tex(`P(A\\cap B)${gl(pAB)}${z(pAB)}`)}.`),
      O('a', zahl ? `Abhängig, denn ${tex(`P(A)\\cdot P(B)=${z(prod)}\\neq${z(pAB)}`)}.` : `Abhängig, denn ${tex('P(A)\\cdot P(B)\\neq P(A\\cap B)')}.`, !unab, `Rechne nach: ${tex(`P(A)\\cdot P(B)=${z(prod)}`)} – das ist genau ${tex('P(A\\cap B)')}.`),
      O('s', 'Das lässt sich mit diesen Angaben nicht entscheiden.', false, `Doch: Aus den Angaben lassen sich ${tex('P(A)')}, ${tex('P(B)')} und ${tex('P(A\\cap B)')} bestimmen – mehr braucht die Prüfung nicht.`),
      O('g', `Abhängig, denn ${tex('P(A\\cap B)>0')}: Die Ereignisse können gemeinsam eintreten.`, false, 'Gemeinsam eintreten können auch unabhängige Ereignisse. „Unvereinbar“ und „unabhängig“ sind verschiedene Dinge.')];
    return { prompt, formula, options: shuffle(opts), hints, explain, n: N0, A, B, AB, daten };
  }
}

/** Erwartungswert, Varianz, Standardabweichung aus der Tabelle: Stufe 1–2 Erwartungswert, 3 Varianz, 4 Varianz oder Standardabweichung mit negativen Werten, 5 Glücksspiel mit fehlender Wahrscheinlichkeit und fünf Werten. */
export function genVarianz(lv = 3) {
  for (;;) {
    const n = tier(lv, 3, 4, 3, 4, 5);
    const P = pick(n === 3 ? [[0.5, 0.25, 0.25], [0.2, 0.5, 0.3], [0.4, 0.4, 0.2], [0.25, 0.5, 0.25]] : n === 4 ? [[0.1, 0.4, 0.3, 0.2], [0.25, 0.25, 0.25, 0.25], [0.4, 0.3, 0.2, 0.1], [0.2, 0.2, 0.5, 0.1]]
      : [[0.15, 0.35, 0.25, 0.2, 0.05], [0.05, 0.3, 0.4, 0.15, 0.1], [0.1, 0.25, 0.35, 0.2, 0.1], [0.45, 0.25, 0.15, 0.1, 0.05]]);
    const xs = shuffle(tier(lv, [0, 1, 2, 4], [-2, 0, 1, 3, 5], [0, 1, 2, 3, 4, 6], [-2, -1, 0, 1, 3, 6], [-5, -2, -1, 0, 2, 3, 10, 20])).slice(0, n).sort((x, y) => x - y);
    const mu = xs.reduce((s, x, i) => s + x * P[i], 0), ex2 = xs.reduce((s, x, i) => s + x * x * P[i], 0), va = ex2 - mu * mu, si = Math.sqrt(va);
    const ask = tier(lv, 'mu', 'mu', 'var', pick(['var', 'sigma']), 'sigma'), j = lv >= 5 ? ri(0, n - 1) : -1;
    const N = (num, correct, why) => ({ tex: ft(num, 2), num, correct, why });
    const mean = xs.reduce((s, x) => s + x, 0) / n;
    const opts = ask === 'mu' ? [N(mu, true), N(mean, false, 'Das ist der einfache Mittelwert der Werte. Jeder Wert muss mit seiner Wahrscheinlichkeit gewichtet werden.'), N(ex2, false, 'Die Werte werden nicht quadriert – das braucht man erst für die Varianz.'), N(mu + 1, false, `Rechne ${tex('\\sum x_i\\cdot p_i')} Zeile für Zeile.`)]
      : ask === 'var' ? [N(va, true), N(ex2, false, `Es fehlt noch ${tex('-\\mu^2')}: ${tex('V(X)=E(X^2)-\\mu^2')}.`), N(si, false, 'Das ist die Standardabweichung (Wurzel der Varianz).'), N(mu, false, 'Das ist der Erwartungswert.')]
        : [N(si, true), N(va, false, 'Das ist die Varianz. Für die Standardabweichung noch die Wurzel ziehen.'), N(Math.sqrt(ex2), false, `Vor dem Wurzelziehen muss ${tex('\\mu^2')} abgezogen werden.`), N(mu, false, 'Das ist der Erwartungswert.')];
    if (!uniqNum(opts) || !uniq(opts) || va < 0.05 || opts.slice(1).some((o) => Math.abs(o.num - opts[0].num) < 0.06)) continue;
    const z = (x) => ft(x, 4), sMu = plus(xs.map((x, i) => `${par(x)}\\cdot${ft(P[i])}`)), sE2 = plus(xs.map((x, i) => `${par(x)}^2\\cdot${ft(P[i])}`));
    const rMu = `${tex(`\\mu=${sMu}=${z(mu)}`)}`, rE2 = `${tex(`E(X^2)=${sE2}=${z(ex2)}`)}`, rVa = `${tex(`V(X)=E(X^2)-\\mu^2=${z(ex2)}-${par(mu)}^2=${z(va)}`)}`, rSi = `${tex(`\\sigma=\\sqrt{${z(va)}}\\approx${ft(si, 2)}`)}`;
    const pFehlt = j < 0 ? '' : `${tex(`p=1-(${P.filter((_, i) => i !== j).map((p) => ft(p)).join('+')})=${ft(P[j])}`)}`;
    const hints = ask === 'mu' ? [`Erwartungswert: ${tex('\\mu=\\sum x_i\\cdot p_i')} – jeden Wert mit seiner Wahrscheinlichkeit multiplizieren, dann addieren.`, lv <= 1 ? `${tex(`\\mu=${sMu}`)}.` : `${rMu}.`]
      : [...(j < 0 ? [] : [`Alle Wahrscheinlichkeiten ergeben zusammen 1 (Gegenwahrscheinlichkeit): ${pFehlt}.`]), `Erwartungswert: ${rMu}.`, `Mittelwert der Quadrate: ${rE2}.`, `Verschiebungssatz: ${rVa}.`, ...(ask === 'sigma' ? [`Standardabweichung: ${tex('\\sigma=\\sqrt{V(X)}')}.`] : [])];
    const explain = ask === 'mu' ? `${rMu}.` : `${j < 0 ? '' : `Fehlende Wahrscheinlichkeit: ${pFehlt}. `}${rMu}, ${rE2}, ${rVa}${ask === 'sigma' ? `, ${rSi}` : ''}.`;
    const kopf = n >= 5 ? 'p_i' : 'P(X=x_i)';
    return { prompt: lv >= 5 ? `Bei einem Glücksspiel gibt ${tex('X')} den Gewinn in Euro an (negativ heißt Verlust). In der Tabelle fehlt eine Wahrscheinlichkeit ${tex('p')}. Wie groß ist die Standardabweichung von ${tex('X')}?`
      : `Die Zufallsgröße ${tex('X')} hat diese Verteilung. Wie groß ist ${{ mu: 'der Erwartungswert', var: 'die Varianz', sigma: 'die Standardabweichung' }[ask]}?`,
      formula: `\\begin{array}{c|${'c'.repeat(n)}}x_i&${xs.map((x) => ft(x)).join('&')}\\\\\\hline ${kopf}&${P.map((p, i) => (i === j ? 'p' : ft(p))).join('&')}\\end{array}`, options: shuffle(opts), hints, explain, xs, P, ask, fehlt: j };
  }
}

const binWeg = (n, k) => { const j = Math.min(k, n - k); if (j < 2 || j > 5) return `\\binom{${n}}{${k}}=${binom(n, k)}`;
  return `\\binom{${n}}{${k}}=\\dfrac{${Array.from({ length: j }, (_, i) => n - i).join('\\cdot ')}}{${Array.from({ length: j }, (_, i) => j - i).join('\\cdot ')}}=${binom(n, k)}`; };

/** Ziehen ohne Zurücklegen (hypergeometrisch): Stufe 1–2 den Term wählen, 3 Wert ausrechnen, 4 Einkleidung mit größeren Zahlen, 5 Anzahl und Trefferzahl erst aus dem Text erschließen (Prozent, „genau … in Ordnung“). */
export function genHyper(lv = 3) {
  for (;;) {
    let Nn, Kk, n, k, pct = 0;
    if (lv <= 1) { Nn = pick([5, 6, 7, 8, 9, 10]); Kk = pick([2, 3, 4]); n = 2; k = 1; }
    else if (lv === 2) { Nn = pick([8, 10, 12]); Kk = ri(3, 5); n = pick([3, 4]); k = ri(1, n - 1); }
    else if (lv === 3) { Nn = pick([8, 10, 12]); Kk = ri(3, 5); n = 3; k = ri(1, 2); }
    else if (lv === 4) { Nn = pick([20, 25, 30, 40]); Kk = pick([4, 5, 6, 8]); n = pick([4, 5]); k = ri(1, 3); }
    else { Nn = pick([40, 50, 60]); pct = pick([10, 15, 20, 25]); Kk = (Nn * pct) / 100; n = pick([5, 6]); k = ri(1, 3); }
    if (!Number.isInteger(Kk) || k > Kk || n - k > Nn - Kk || k >= n) continue;
    const p = Kk / Nn, c1 = binom(Kk, k), c2 = binom(Nn - Kk, n - k), c3 = binom(Nn, n), hyp = (c1 * c2) / c3, bern = binom(n, k) * p ** k * (1 - p) ** (n - k);
    const B = (a, b) => `\\binom{${a}}{${b}}`, term = dfrac(`${B(Kk, k)}\\cdot${B(Nn - Kk, n - k)}`, B(Nn, n));
    if (lv <= 2) {
      const T = (t, num, correct, why) => ({ tex: t, num, correct, why });
      const opts = [T(term, hyp, true),
        T(`${B(n, k)}\\cdot\\left(${tf(Kk, Nn)}\\right)^{${k}}\\cdot\\left(${tf(Nn - Kk, Nn)}\\right)^{${n - k}}`, bern, false, 'Das ist die Bernoulli-Formel – sie gilt nur <b>mit</b> Zurücklegen, wenn sich die Wahrscheinlichkeit nicht ändert.'),
        T(dfrac(B(Kk, k), B(Nn, n)), c1 / c3, false, n - k === 1 ? 'Auch die eine nicht-rote Kugel muss ausgewählt werden.' : `Auch die ${n - k} nicht-roten Kugeln müssen ausgewählt werden.`),
        Kk !== n && Kk !== Nn - n ? T(dfrac(`${B(Kk, k)}\\cdot${B(Nn - Kk, n - k)}`, B(Nn, Kk)), (c1 * c2) / binom(Nn, Kk), false, `Im Nenner stehen alle Möglichkeiten, ${n} aus ${Nn} zu ziehen.`)
          : T(dfrac(`${B(Kk, k)}+${B(Nn - Kk, n - k)}`, B(Nn, n)), (c1 + c2) / c3, false, 'Die beiden Auswahlen werden multipliziert, nicht addiert: Beides muss zugleich eintreten.')];
      // kein Ablenker darf zufällig denselben Wert haben
      if (!uniq(opts) || opts.slice(1).some((o) => Math.abs(o.num - hyp) < 1e-4 * hyp)) continue;
      const hints = ['Günstige durch mögliche Auswahlen – mit Binomialkoeffizienten.', `Günstig: ${k} aus den ${Kk} roten <b>und</b> ${n - k} aus den ${Nn - Kk} übrigen.`];
      if (lv === 2) hints.push(`Möglich: ${n} aus allen ${Nn} Kugeln, also ${tex(B(Nn, n))} im Nenner.`);
      return { prompt: `In einer Urne liegen ${Nn} Kugeln, davon ${Kk} rote. Es werden ${n} Kugeln <b>ohne Zurücklegen</b> gezogen. Welcher Term gibt die Wahrscheinlichkeit für <b>genau ${k} rote</b> an?`, options: shuffle(opts), hints,
        explain: lv <= 1 ? `${tex(`P=${term}\\approx${ft(hyp * 100, 2)}\\,\\%`)}.` : `Günstig sind ${tex(`${B(Kk, k)}\\cdot${B(Nn - Kk, n - k)}=${c1}\\cdot${c2}`)} Auswahlen, möglich ${tex(`${B(Nn, n)}=${c3}`)}: ${tex(`P=${term}=${dfrac(c1 * c2, c3)}\\approx${ft(hyp * 100, 2)}\\,\\%`)}.`, N: Nn, K: Kk, n, k };
    }
    const PR = (x, correct, why) => ({ tex: `${ft(100 * x, 2)}\\,\\%`, num: x, correct, why });
    const opts = [PR(hyp, true), PR(bern, false, 'Das ist die Bernoulli-Formel – sie gilt nur <b>mit</b> Zurücklegen, wenn sich die Wahrscheinlichkeit nicht ändert.'),
      PR((c1 + c2) / c3, false, 'Die beiden Auswahlen werden multipliziert, nicht addiert: Beides muss zugleich eintreten.'),
      PR(p ** k * (1 - p) ** (n - k), false, 'Das ist nur eine einzige Reihenfolge beim Ziehen <b>mit</b> Zurücklegen. Ohne Zurücklegen zählt man Auswahlen mit Binomialkoeffizienten.')];
    if (hyp < 0.005 || !uniq(opts) || !weit(opts, 0.002) || opts.some((o) => o.num >= 1 || o.num < 0.0005)) continue;
    const was = [['Linkshänder', 'Linkshänder', `In einem Jahrgang mit ${Nn} Jugendlichen sind ${Kk} Linkshänder. Für ein Projekt werden ${n} Jugendliche ausgelost.`], ['Gewinn', 'Gewinne', `In einer Lostrommel liegen ${Nn} Lose, darunter ${Kk} Gewinne. Jemand zieht ${n} Lose.`], ['defekte Lampe', 'defekte Lampen', `Von ${Nn} Lampen in einem Karton sind ${Kk} defekt. ${n} Lampen werden entnommen.`]][ri(0, 2)];
    const tief = [['fehlerhaft', 'in Ordnung', `Eine Lieferung umfasst ${Nn} Bauteile, ${pct} % davon sind fehlerhaft. Zur Kontrolle werden ${n} Bauteile ohne Zurücklegen entnommen.`], ['jünger als 18', 'volljährig', `Ein Verein hat ${Nn} Mitglieder, ${pct} % davon sind jünger als 18. Für einen Ausschuss werden ${n} Mitglieder ausgelost.`]][ri(0, 1)];
    const prompt = lv === 3 ? `In einer Urne liegen ${Nn} Kugeln, davon ${Kk} rote. Es werden ${n} Kugeln <b>ohne Zurücklegen</b> gezogen. Wie groß ist die Wahrscheinlichkeit für <b>genau ${k} rote</b>?`
      : lv === 4 ? `${was[2]} Mit welcher Wahrscheinlichkeit ${k === 1 ? `ist <b>genau 1 ${was[0]}</b>` : `sind <b>genau ${k} ${was[1]}</b>`} dabei?`
        : `${tief[2]} Mit welcher Wahrscheinlichkeit sind <b>genau ${n - k} davon ${tief[1]}</b>?`;
    const hints = [...(lv >= 5 ? [`Erst die Anzahlen klären: ${pct} % von ${Nn} sind ${tex(`${ft(pct / 100)}\\cdot ${Nn}=${Kk}`)} (${tief[0]}), die übrigen ${Nn - Kk} sind ${tief[1]}.`, `„Genau ${n - k} ${tief[1]}“ heißt bei ${n} gezogenen: genau ${k} ${tief[0]}.`] : []),
      `Ohne Zurücklegen: günstige durch mögliche Auswahlen, ${tex(`P=${term}`)}.`, `${tex(binWeg(Kk, k))} und ${tex(binWeg(Nn - Kk, n - k))}.`, `${tex(binWeg(Nn, n))}. Jetzt ${tex(dfrac(`${c1}\\cdot ${c2}`, c3))} ausrechnen.`];
    return { prompt, options: shuffle(opts), hints,
      explain: `${lv >= 5 ? `${Kk} sind ${tief[0]}, ${Nn - Kk} ${tief[1]}; gesucht sind genau ${k} ${tief[0]} unter den ${n} gezogenen. ` : ''}${tex(`P=${term}=${dfrac(`${c1}\\cdot ${c2}`, c3)}`)} ${tex(`=${dfrac(c1 * c2, c3)}\\approx${ft(hyp, 4)}=${ft(hyp * 100, 2)}\\,\\%`)}.`, N: Nn, K: Kk, n, k };
  }
}

/* ───────────── Kugeln, weitere Abstände, Lage von Ebenen ───────────── */
const TRIPEL = [[1, 2, 2, 3], [2, 3, 6, 7], [0, 3, 4, 5], [2, 6, 9, 11], [4, 4, 7, 9], [1, 4, 8, 9]];
const vecS = (v) => `\\begin{pmatrix}${v.join('\\\\')}\\end{pmatrix}`;         // Vektor aus fertigen Einträgen (z. B. Brüchen)
const quadrate = (v) => plus(v.map((c) => `${par(c)}^2`));

/** Kugel: Stufe 1 Punktlage (Mittelpunkt im Ursprung), 2 Mittelpunkt und Radius ablesen, 3 Punktlage oder Abstand mit glatten Zahlen, 4 Abstand zur Oberfläche mit Wurzel, 5 erst quadratische Ergänzung, dann Abstand. */
export function genKugel(lv = 3) {
  for (;;) {
    const [a, b, c, r0] = pick(TRIPEL.slice(0, tier(lv, 3, 3, 4, 6, 6))), M = lv <= 1 ? [0, 0, 0] : [ri(-4, 4), ri(-4, 4), ri(-4, 4)];
    const dir = shuffle([a, b, c]).map((v) => v * pick([1, -1]));
    const std = (rr) => `K\\colon\\ ${M.map((m, i) => (m === 0 ? `x_${i + 1}^2` : `(x_${i + 1}${sgn(-m)})^2`)).join('+')}=${rr * rr}`;
    const form = tier(lv, 'lage', 'mr', pick(['lage', 'glatt']), 'abstand', 'ergaenzung');
    if (form === 'lage') {
      const r = r0, wo = pick(['auf', 'innen', 'aussen']), Pp = M.map((m, i) => m + dir[i] + (i === 0 ? (wo === 'auf' ? 0 : wo === 'innen' ? -Math.sign(dir[0] || 1) : Math.sign(dir[0] || 1)) : 0));
      const d2 = Pp.reduce((s, x, i) => s + (x - M[i]) ** 2, 0);
      if ((wo === 'innen') !== (d2 < r * r) && wo !== 'auf' || (wo === 'auf') !== (d2 === r * r)) continue;
      const O = (key, html, why) => ({ tex: key, html, key, correct: key === wo, why });
      const ein = plus(Pp.map((x, i) => (M[i] === 0 ? `${par(x)}^2` : `(${ft(x)}${sgn(-M[i])})^2`))), diff = Pp.map((x, i) => x - M[i]);
      const urteil = d2 === r * r ? `gleich ${r * r}, also auf der Kugel` : d2 < r * r ? `kleiner als ${r * r}, also innerhalb` : `größer als ${r * r}, also außerhalb`;
      return { prompt: `Wo liegt der Punkt ${tex(PT('P', Pp))} bezüglich der Kugel?`, formula: std(r), options: shuffle([O('auf', 'Auf der Kugel.', `Setze ein: Die linke Seite ergibt ${d2}, nicht ${r * r}.`), O('innen', 'Innerhalb der Kugel.', `Setze ein: Die linke Seite ergibt ${d2}. Innerhalb wäre sie kleiner als ${r * r}.`), O('aussen', 'Außerhalb der Kugel.', `Setze ein: Die linke Seite ergibt ${d2}. Außerhalb wäre sie größer als ${r * r}.`), O('mitte', 'Im Mittelpunkt der Kugel.', `Der Mittelpunkt ist ${tex(PT('M', M))}.`)]),
        hints: lv <= 1 ? ['Setze die Koordinaten von P in die linke Seite der Gleichung ein.', `Vergleiche das Ergebnis mit ${tex(`r^2=${r * r}`)}.`]
          : [`Setze die Koordinaten von P in die linke Seite der Gleichung ein: ${tex(ein)}.`, `Vergleiche die Summe mit ${tex(`r^2=${r * r}`)}: kleiner heißt innerhalb, größer außerhalb.`],
        explain: lv <= 1 ? `Einsetzen ergibt ${tex(`${ein}=${d2}`)}: ${urteil}.` : `Einsetzen: ${tex(`${ein}=${quadrate(diff)}=${d2}`)}. Das ist ${urteil}.`, kind: 'lage', M, r, P: Pp };
    }
    if (form === 'mr') {
      const r = r0, O = (m, rr, correct, why) => ({ tex: `${PT('M', m)},\\ r=${ft(rr)}`, M: m, r: rr, correct, why });
      const opts = [O(M, r, true), O(M.map((x) => -x), r, false, `In den Klammern steht ${tex('x-m')}: Bei ${tex('(x+2)^2')} ist die Koordinate −2.`), O(M, r * r, false, `Rechts steht ${tex('r^2')} – der Radius ist die Wurzel daraus.`), O(M.map((x) => -x), r * r, false, 'Vorzeichen des Mittelpunkts und Wurzel beim Radius beachten.')];
      if (M.filter((x) => x !== 0).length < 2 || !uniq(opts)) continue;
      return { prompt: 'Lies Mittelpunkt und Radius der Kugel ab.', formula: std(r), options: shuffle(opts), hints: [`Kugelgleichung: ${tex('(x_1-m_1)^2+(x_2-m_2)^2+(x_3-m_3)^2=r^2')}.`, 'Vorzeichen in den Klammern umdrehen (ohne Klammer ist die Koordinate 0).', `Rechts steht ${tex(`r^2=${r * r}`)} – die Wurzel ziehen.`],
        explain: `Vorzeichen umdrehen: ${tex(`${PT('M', M)}`)}. Radius: ${tex(`r=\\sqrt{${r * r}}=${r}`)}.`, kind: 'mr', M, r };
    }
    // Abstand zur Oberfläche: glatt (Stufe 3), mit Wurzel (4), aus der ausmultiplizierten Gleichung (5)
    const r = form === 'glatt' ? r0 : pick([2, 3, 4, 5, 6]), fak = pick([2, 3]), off = form === 'glatt' ? dir.map((v) => v * fak) : [ri(-6, 6), ri(-6, 6), ri(-6, 6)];
    const Pp = M.map((m, i) => m + off[i]), D = dot3(off, off), dist = Math.sqrt(D);
    if (D <= r * r + 1 || (form !== 'glatt' && Number.isInteger(dist)) || (form === 'ergaenzung' && M.filter((x) => x !== 0).length < 2)) continue;
    const N = (num, correct, why) => ({ tex: ft(num, 2), num, correct, why });
    const opts = [N(dist - r, true), N(dist, false, 'Das ist der Abstand zum Mittelpunkt. Bis zur Oberfläche ist es um den Radius kürzer.'), N(dist + r, false, 'Der Radius wird abgezogen, nicht addiert – gesucht ist der nächste Punkt der Kugel.'), N(Math.sqrt(D - r * r), false, `Unter der Wurzel darf ${tex('r^2')} nicht abgezogen werden: erst die Wurzel ziehen, dann den Radius abziehen.`)];
    if (!weit(opts, 0.11) || !uniq(opts)) continue;
    const wz = Number.isInteger(dist) ? `=${dist}` : `\\approx${ft(dist, 3)}`, weg = `${tex(`\\overrightarrow{MP}=${vecTex(off)}`)}, ${tex(`|\\overrightarrow{MP}|=\\sqrt{${quadrate(off)}}=\\sqrt{${D}}${wz}`)}`;
    const ende = `${tex(`d=\\sqrt{${D}}-${r}${Number.isInteger(dist) ? '=' : '\\approx'}${ft(dist - r, 2)}`)}`;
    let formula = std(r), hints = form === 'glatt' ? ['Erst den Abstand von P zum Mittelpunkt M berechnen.', `${weg}.`, `Davon den Radius ${tex(`r=${r}`)} abziehen.`]
      : [`Lies Mittelpunkt und Radius ab: ${tex(PT('M', M))} und ${tex(`r=\\sqrt{${r * r}}=${r}`)}.`, `Verbindungsvektor und seine Länge: ${weg}.`, `Der nächste Punkt der Kugel liegt auf der Strecke von M nach P. Ziehe vom Abstand den Radius ab: ${tex(`\\sqrt{${D}}-${r}`)}.`], explain = `${tex(PT('M', M))}, ${tex(`r=${r}`)}. ${weg}. Abstand zur Oberfläche: ${ende}.`, koef;
    if (form === 'ergaenzung') {
      const cR = r * r - dot3(M, M); koef = { p: M.map((m) => -2 * m), c: cR };
      formula = `K\\colon\\ ${M.map((m, i) => `x_${i + 1}^2${m ? `${sgn(-2 * m)}x_${i + 1}` : ''}`).join('+')}=${cR}`;
      const erg = M.map((m, i) => (m ? `${tex(`x_${i + 1}^2${sgn(-2 * m)}x_${i + 1}=(x_${i + 1}${sgn(-m)})^2-${m * m}`)}` : '')).filter(Boolean).join(', ');
      hints = [`Die Gleichung ist ausmultipliziert. Bringe sie durch quadratische Ergänzung auf die Form ${tex('(x_1-m_1)^2+(x_2-m_2)^2+(x_3-m_3)^2=r^2')}.`, `Ergänzen: ${erg}.`,
        `Die abgezogenen Zahlen auf die rechte Seite bringen: ${tex(`r^2=${cR}${M.filter((m) => m).map((m) => `+${m * m}`).join('')}=${r * r}`)}, also ${tex(PT('M', M))} und ${tex(`r=${r}`)}.`, `${weg}.`, `Davon den Radius ${tex(`r=${r}`)} abziehen.`];
      explain = `Quadratische Ergänzung: ${tex(std(r).slice(9))}, also ${tex(PT('M', M))} und ${tex(`r=${r}`)}. ${weg}. Abstand zur Oberfläche: ${ende}.`;
    }
    return { prompt: `Wie weit ist der Punkt ${tex(PT('P', Pp))} von der Oberfläche der Kugel entfernt?${form === 'glatt' ? '' : ' Runde auf zwei Nachkommastellen.'}`, formula, options: shuffle(opts), hints, explain, kind: 'abstand', M, r, P: Pp, koef };
  }
}

const LOT = [[[1, 0, 0], [0, 3, 4]], [[0, 1, 0], [4, 0, 3]], [[0, 0, 1], [3, 4, 0]], [[1, 2, 2], [2, -2, 1]], [[2, 1, 2], [1, 2, -2]], [[1, 1, 0], [2, -2, 1]], [[2, 2, 1], [1, -2, 2]], [[0, 1, 1], [1, 2, -2]]];
/** Abstand Punkt–Gerade: Stufe 1 achsenparallele Gerade, 2–3 Lotfußpunkt mit glatten Zahlen, 4 Wurzel als Ergebnis, 5 Einkleidung mit Bruch-Parameter und krummem Lotfußpunkt. */
export function genAbstandPG(lv = 3) {
  for (;;) {
    const R = tier(lv, 2, 3, 3, 4, 5), A = [ri(-R, R), ri(-R, R), ri(-R, R)];
    let u, Pp;
    if (lv <= 3) {
      const [u0, n0] = pick(LOT.slice(...tier(lv, [0, 3], [3, 8], [3, 8]))), s = lv >= 3 ? pick([2, 3]) : 1, t0 = pick(lv <= 2 ? [1, 2, 3] : [-2, -1, 2, 3]);
      u = u0; Pp = A.map((c, i) => c + t0 * u[i] + n0[i] * s);
    } else if (lv === 4) {
      u = [ri(-2, 3), ri(-2, 3), ri(-2, 3)]; const n = kreuz(u, [ri(-2, 2), ri(-2, 2), ri(-2, 2)]), t0 = pick([-2, -1, 2, 3]);
      if (u.filter((c) => c !== 0).length < 2 || n.every((c) => c === 0) || n.some((c) => Math.abs(c) > 6)) continue;
      Pp = A.map((c, i) => c + t0 * u[i] + n[i]);
    } else {
      u = [ri(-3, 3), ri(-3, 3), ri(-2, 2)]; Pp = [ri(-6, 8), ri(-6, 8), ri(0, 6)];
      if (u.filter((c) => c !== 0).length < 2) continue;
    }
    const AP = Pp.map((c, i) => c - A[i]), zz = dot3(AP, u), nn = dot3(u, u), t = zz / nn, F = A.map((c, i) => c + t * u[i]), ap2 = dot3(AP, AP), dd = ap2 - (zz * zz) / nn, d = Math.sqrt(Math.max(0, dd)), ap = Math.sqrt(ap2);
    if (dd < 0.5 || (lv === 4 && Number.isInteger(d)) || (lv >= 5 && (Number.isInteger(t) || nn > 14 || ggt(ggt(u[0], u[1]), u[2]) !== 1))) continue;
    const N = (num, correct, why) => ({ tex: ft(num, 2), num, correct, why });
    const opts = [N(d, true), N(ap, false, 'Das ist der Abstand zum Stützpunkt der Geraden. Der kürzeste Abstand führt zum Lotfußpunkt.'), N(dd, false, 'Hier fehlt die Wurzel.'), N(Math.abs(t) * Math.sqrt(nn), false, 'Das ist der Abstand vom Stützpunkt zum Lotfußpunkt – entlang der Geraden, nicht quer dazu.')];
    if (!weit(opts, 0.11) || !uniq(opts)) continue;
    const fr = (i) => tf(A[i] * nn + zz * u[i], nn), FPz = Pp.map((c, i) => (c - A[i]) * nn - zz * u[i]), FS = vecS([0, 1, 2].map(fr)), FPS = vecS(FPz.map((v) => tf(v, nn)));
    const tT = Number.isInteger(t) ? ft(t) : `${dfrac(zz, nn).replace('\\dfrac{-', '-\\dfrac{')}`.replace('\\dfrac', '\\tfrac'), tK = Number.isInteger(t) ? `=${ft(t)}` : (tf(zz, nn) === `\\tfrac{${zz}}{${nn}}` || tf(zz, nn) === `-\\tfrac{${-zz}}{${nn}}` ? '' : `=${tf(zz, nn)}`);
    const dT = Number.isInteger(d) ? `=${d}` : `\\approx${ft(d, 2)}`, ddT = fracTex(Math.round(dd * nn), nn);
    const formula = `g\\colon\\ \\vec x=${vecTex(A)}+t\\cdot${vecTex(u)}`, frage = `Welchen Abstand hat der Punkt ${tex(PT('P', Pp))} von der Geraden ${tex('g')}?`;
    if (lv <= 1) {
      const i = u.findIndex((c) => c !== 0), FP = Pp.map((c, j) => c - F[j]);
      return { prompt: frage, formula, options: shuffle(opts), hints: [`Die Gerade verläuft parallel zur ${tex(`x_${i + 1}`)}-Achse. Der Lotfußpunkt ${tex('F')} hat dieselbe ${tex(`x_${i + 1}`)}-Koordinate wie ${tex('P')}: ${tex(PT('F', F))}.`, `Der Abstand ist die Länge von ${tex(`\\overrightarrow{FP}=${vecTex(FP)}`)}.`],
        explain: `Lotfußpunkt ${tex(PT('F', F))}, ${tex(`\\overrightarrow{FP}=${vecTex(FP)}`)}, also ${tex(`d=\\sqrt{${quadrate(FP.filter((c) => c !== 0))}}=${ft(d)}`)}.`, A, u, P: Pp };
    }
    const sk = plus(AP.map((c, i) => `${par(c)}\\cdot${par(u[i])}`));
    const h1 = `Gesucht ist der Lotfußpunkt ${tex('F')} auf ${tex('g')}: Der Vektor ${tex('\\overrightarrow{FP}')} steht senkrecht auf dem Richtungsvektor ${tex('\\vec u')}, das Skalarprodukt ${tex('\\overrightarrow{FP}\\cdot\\vec u')} ist 0.`;
    const h2 = `Mit ${tex(`\\overrightarrow{AP}=${vecTex(AP)}`)} wird daraus ${tex('(\\overrightarrow{AP}-t\\,\\vec u)\\cdot\\vec u=0')}, also ${tex(`t=${dfrac('\\overrightarrow{AP}\\cdot\\vec u', '\\vec u\\cdot\\vec u')}=${dfrac(sk, nn)}=${tT}${Number.isInteger(t) ? '' : tK}`)}.`;
    const h3 = `Einsetzen in ${tex('g')}: ${tex(`\\overrightarrow{OF}=${Number.isInteger(t) ? vecTex(F) : FS}`)}.`;
    const h4 = `${tex(`\\overrightarrow{FP}=${Number.isInteger(t) ? vecTex(Pp.map((c, i) => c - F[i])) : FPS}`)}, also ${tex(`d=|\\overrightarrow{FP}|=\\sqrt{${Number.isInteger(t) ? quadrate(Pp.map((c, i) => c - F[i])) : ddT}}${Number.isInteger(t) && Number.isInteger(d) ? '' : (Number.isInteger(t) ? `=\\sqrt{${Math.round(dd)}}` : '')}${dT}`)}.`;
    const kontrolle = `Kontrolle mit dem Satz des Pythagoras im Dreieck ${tex('AFP')}: ${tex(`d^2=|\\overrightarrow{AP}|^2-t^2\\cdot|\\vec u|^2=${ap2}-${fracTex(zz * zz, nn)}=${ddT}`)}.`;
    const kontext = lv >= 5 ? pick([`Eine Drohne fliegt geradlinig entlang ${tex('g')} (Koordinaten in 100 m). An der Stelle ${tex(PT('P', Pp))} steht ein Funkmast. Wie nah kommt die Drohne dem Mast (in Einheiten, auf zwei Nachkommastellen)?`,
      `Ein Lichtstrahl verläuft entlang ${tex('g')}. Im Punkt ${tex(PT('P', Pp))} sitzt ein Sensor. Welchen kleinsten Abstand hat der Strahl vom Sensor (auf zwei Nachkommastellen)?`]) : null;
    return { prompt: kontext || (lv === 4 ? `${frage} Runde auf zwei Nachkommastellen.` : frage), formula, options: shuffle(opts), hints: lv >= 5 ? [h1, h2, h3, h4, kontrolle] : [h1, h2, h3, h4],
      explain: `${tex(`t=${dfrac(zz, nn)}${Number.isInteger(t) ? `=${ft(t)}` : tK}`)} liefert den Lotfußpunkt ${Number.isInteger(t) ? tex(PT('F', F)) : `mit ${tex(`\\overrightarrow{OF}=${FS}`)}`}. ${h4.replace(/, also /, ' und ')}${lv >= 5 ? ` ${kontrolle}` : ''}`, A, u, P: Pp };
  }
}

/** Lage zweier Ebenen: Stufe 1–3 Koordinatengleichungen vergleichen, 4 umgestellte Gleichung mit Bruch-Faktor, 5 eine Ebene in Parameterform (Kreuzprodukt, Punktprobe). */
export function genEbenenLage(lv = 3) {
  for (;;) {
    const R = tier(lv, 2, 3, 3, 4, 3), n1 = [ri(-R, R), ri(1, R), ri(-R, R)], k = pick(tier(lv, [2], [2, 3, -1], [-2, 3, -3, 4], [-2, 1.5, -0.5, 2.5, -1.5], [1]));
    const wo = pick(['parallel', 'identisch', 'schnitt']), j0 = pick([0, 2]), stoer = pick([1, -1, 2]);
    const glied = (c, i, erst) => (c === 0 ? '' : `${c < 0 ? '-' : erst ? '' : '+'}${Math.abs(c) === 1 ? '' : ft(Math.abs(c))}x_${i + 1}`);
    const links = (nn) => nn.map((c, i) => glied(c, i, false)).join('').replace(/^\+/, ''), E = (nm, nn, dd) => `${nm}\\colon\\ ${links(nn)}=${ft(dd)}`;
    let n2, d1, d2, formula, hints, explain, extra = {};
    if (lv >= 5) {
      const [a, b, c] = n1, Q = [ri(-3, 3), ri(-3, 3), ri(-3, 3)]; let v = [b, -a, 0], w = [0, c, -b];
      if (rand() < 0.5) v = v.map((x, i) => x + w[i]);                       // v + w liegt auch in der Ebene
      if (wo === 'schnitt') w = w.map((x, i) => (i === j0 ? x + stoer : x));
      n2 = kreuz(v, w); d2 = dot3(n2, Q); d1 = wo === 'identisch' ? dot3(n1, Q) : wo === 'parallel' ? dot3(n1, Q) + pick([1, -2, 3, -4]) : ri(-6, 8);
      if (v.filter((x) => x).length < 2 && w.filter((x) => x).length < 2) continue;
      extra = { Q, v, w };
      formula = `\\begin{array}{l}${E('E_1', n1, d1)}\\\\[6pt]E_2\\colon\\ \\vec x=${vecTex(Q)}+r\\cdot${vecTex(v)}+s\\cdot${vecTex(w)}\\end{array}`;
    } else {
      n2 = wo === 'schnitt' ? n1.map((c, i) => (i === j0 ? c + stoer : c * (lv >= 3 ? k : 1))) : n1.map((c) => c * k);
      d1 = ri(-6, 8); d2 = wo === 'identisch' ? d1 * k : wo === 'parallel' ? d1 * k + pick([1, -2, 3]) : ri(-6, 8);
    }
    if (![...n2, d2].every(Number.isInteger) || n2.every((c) => c === 0) || n1.filter((c) => c !== 0).length < 2) continue;
    const kr = kreuz(n1, n2), par2 = kr.every((c) => c === 0);
    if ((wo === 'schnitt') === par2) continue;
    const j = n1.findIndex((c) => c !== 0), kk = n2[j] / n1[j];
    const verh = [0, 1, 2].map((i) => (n1[i] === 0 ? (n2[i] === 0 ? '' : `bei ${tex(`x_${i + 1}`)} steht in ${tex('E_1')} eine 0, in ${tex('E_2')} nicht`) : tex(`${ft(n2[i])}:${par(n1[i])}${Number.isInteger((n2[i] * 100) / n1[i]) ? '=' : '\\approx'}${ft(n2[i] / n1[i])}`))).filter(Boolean).join(', ');
    const rechts = `${tex(`${ft(d1)}\\cdot${par(kk)}=${ft(d1 * kk)}`)}`, pass = wo === 'identisch' ? `Das ist genau die rechte Seite ${tex(ft(d2))} von ${tex('E_2')}: Die Ebenen sind identisch.` : `In ${tex('E_2')} steht rechts aber ${tex(ft(d2))}: Die Ebenen sind echt parallel.`;
    if (lv >= 5) {
      const { Q, v, w } = extra, kt = (p, q) => `${par(v[p])}\\cdot${par(w[q])}-${par(v[q])}\\cdot${par(w[p])}`;
      const probe = `${tex(`${plus(n1.map((c, i) => `${par(c)}\\cdot${par(Q[i])}`))}=${dot3(n1, Q)}`)}`;
      hints = [`Bestimme zuerst einen Normalenvektor von ${tex('E_2')}: das Kreuzprodukt der beiden Richtungsvektoren.`,
        `${tex(`n_1=${kt(1, 2)}=${n2[0]}`)}, ${tex(`n_2=${kt(2, 0)}=${n2[1]}`)}, ${tex(`n_3=${kt(0, 1)}=${n2[2]}`)}, also ${tex(`\\vec n_2=${vecTex(n2)}`)}.`,
        `Vergleiche mit ${tex(`\\vec n_1=${vecTex(n1)}`)}: ${verh}.`, par2 ? `Die Normalenvektoren sind Vielfache. Punktprobe: Setze den Stützpunkt von ${tex('E_2')} in ${tex('E_1')} ein.` : 'Die Verhältnisse sind nicht alle gleich: Die Normalenvektoren sind keine Vielfachen voneinander.'];
      if (par2) hints.push(`${probe} – ${wo === 'identisch' ? `das ist die rechte Seite von ${tex('E_1')}, der Punkt liegt in ${tex('E_1')}.` : `in ${tex('E_1')} steht rechts aber ${tex(ft(d1))}, der Punkt liegt nicht in ${tex('E_1')}.`}`);
      explain = `Kreuzprodukt der Richtungsvektoren: ${tex(`\\vec n_2=${vecTex(n2)}`)}. ${par2 ? `Das ist ${tex(`${ft(kk)}\\cdot\\vec n_1`)}, die Ebenen haben dieselbe Richtung. Punktprobe mit dem Stützpunkt: ${probe}, ${wo === 'identisch' ? `das erfüllt ${tex('E_1')}: identisch` : `aber rechts steht ${tex(ft(d1))}: echt parallel`}.` : `Kein Vielfaches von ${tex(`\\vec n_1=${vecTex(n1)}`)} (${verh}): Die Ebenen schneiden sich in einer Geraden.`}`;
    } else {
      let umf = '';
      if (lv === 4) {
        const li = `${glied(n2[0], 0, true)}${glied(n2[2], 2, n2[0] === 0)}`;
        if (!li) continue;
        formula = `${E('E_1', n1, d1)}\\qquad E_2\\colon\\ ${li}=${ft(d2)}${glied(-n2[1], 1, false)}`;
        umf = `Bringe ${tex('E_2')} zuerst in die übliche Form – alle Glieder mit ${tex('x')} nach links: ${tex(E('E_2', n2, d2))}.`;
      } else formula = `${E('E_1', n1, d1)}\\qquad ${E('E_2', n2, d2)}`;
      hints = [...(umf ? [umf] : []), `Vergleiche die Normalenvektoren ${tex(`\\vec n_1=${vecTex(n1)}`)} und ${tex(`\\vec n_2=${vecTex(n2)}`)}: Sind sie Vielfache voneinander?`,
        par2 ? `Koordinatenweise teilen: ${verh} – immer derselbe Faktor.` : `Koordinatenweise teilen: ${verh} – nicht immer derselbe Faktor.`];
      if (par2) hints.push(`Passt auch die rechte Seite zum Faktor ${tex(ft(kk))}? ${rechts}.`);
      explain = par2 ? `${tex(`\\vec n_2=${ft(kk)}\\cdot\\vec n_1`)} (${verh}). Rechte Seite: ${rechts}. ${pass}` : `Die Normalenvektoren sind keine Vielfachen voneinander (${verh}): Die Ebenen schneiden sich in einer Geraden.`;
      if (lv <= 1) { hints = hints.slice(0, 2); if (par2) hints[1] = `Hier ist ${tex(`\\vec n_2=${ft(kk)}\\cdot\\vec n_1`)}. Passt auch die rechte Seite zum Faktor ${tex(ft(kk))}?`; }
    }
    const O = (key, html, why) => ({ tex: key, html, key, correct: key === wo, why });
    return { prompt: 'Wie liegen die beiden Ebenen zueinander?', formula,
      options: shuffle([O('parallel', 'Echt parallel (kein gemeinsamer Punkt).', par2 ? (lv >= 5 ? `Punktprobe: Der Stützpunkt von ${tex('E_2')} erfüllt die Gleichung von ${tex('E_1')} – die Ebenen sind identisch.` : `Die rechte Seite passt auch zum Faktor ${fmt(kk)}: Die Gleichungen beschreiben dieselbe Ebene.`) : 'Die Normalenvektoren sind keine Vielfachen voneinander.'),
        O('identisch', 'Identisch (dieselbe Ebene).', par2 ? (lv >= 5 ? `Punktprobe: Der Stützpunkt von ${tex('E_2')} erfüllt die Gleichung von ${tex('E_1')} nicht.` : `Die Normalenvektoren sind Vielfache (Faktor ${fmt(kk)}), aber die rechte Seite passt nicht dazu.`) : 'Die Normalenvektoren sind keine Vielfachen voneinander.'),
        O('schnitt', 'Sie schneiden sich in einer Geraden.', `Die Normalenvektoren sind Vielfache voneinander (Faktor ${fmt(kk)}) – die Ebenen haben dieselbe Richtung.`), O('windschief', 'Windschief.', 'Windschief können nur Geraden sein. Zwei Ebenen sind parallel, identisch oder schneiden sich.')]),
      hints, explain, n1, d1, n2, d2, ...extra };
  }
}

for (const [fn, topic] of [[genPolstelle, 'Polstellen und Lücken'], [genAsymptote, 'Asymptoten'], [genQuotient, 'Quotientenregel'], [genTrigAbl, 'Sinus und Kosinus ableiten'], [genTrigInt, 'Integrale mit Sinus und Kosinus'],
  [genRotation, 'Rotationskörper'], [genUneigentlich, 'Uneigentliche Integrale'], [genUnabhaengig, 'Stochastische Unabhängigkeit'], [genVarianz, 'Erwartungswert und Varianz'], [genHyper, 'Ziehen ohne Zurücklegen'],
  [genKugel, 'Kugeln'], [genAbstandPG, 'Abstand Punkt–Gerade'], [genEbenenLage, 'Lage zweier Ebenen']]) fn.topic = topic;
