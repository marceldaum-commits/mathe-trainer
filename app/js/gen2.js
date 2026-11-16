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

/* Helfer nur für die Erzeuger dieses Abschnitts (Vorsilbe a2, damit nichts mit anderen Abschnitten zusammenstößt). */
/** Fester Wert für einen Buchstaben-Parameter (k, t): Damit lassen sich Schar-Aufgaben in der Selbstprüfung nachrechnen. */
export const A2_K0 = 1.7;
const a2Ggt = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
/** Gekürzter Bruch z/n als LaTeX (ganze Zahl, wenn es aufgeht). */
const a2Bruch = (z, n) => { if (n < 0) { z = -z; n = -n; } const g = a2Ggt(z, n); z /= g; n /= g; return n === 1 ? ft(z) : `${z < 0 ? '-' : ''}\\dfrac{${Math.abs(z)}}{${n}}`; };
/** Zahl mit Vorzeichen: „+3“, „-2,5“. */
const a2Pm = (v, d = 2) => `${v < 0 ? '-' : '+'}${ft(Math.abs(v), d)}`;
/** Vorfaktor vor einem Buchstaben: 1 → „“, -1 → „-“, sonst die Zahl. */
const a2Koef = (v) => (v === 1 ? '' : v === -1 ? '-' : ft(v));
/** Summand mit Vorzeichen und Buchstaben-Teil: „+3k“, „-x“, „“ bei 0. */
const a2Mit = (v, t) => (v === 0 ? '' : `${v < 0 ? '-' : '+'}${Math.abs(v) === 1 ? '' : ft(Math.abs(v))}${t}`);
/** Mehrzeilige Formel (passt auf schmale Bildschirme). */
const a2Zeilen = (...z) => `\\begin{array}{l}${z.join('\\\\[6pt]')}\\end{array}`;
const a2Ganz = (v, teil = 1) => Math.abs(v * teil - Math.round(v * teil)) < 1e-9;
/** „x=2“ bei glatten Werten, sonst „x≈2,45“. */
const a2Rund = (name, v) => `${name}${a2Ganz(v, 100) ? '=' : '\\approx '}${ft(v)}`;
/** Potenz von e als LaTeX: e, e^{2}, e^{-0,5}. */
const a2Eh = (ex) => (ex === 1 ? 'e' : `e^{${ft(ex)}}`);
const a2Verschieden = (opts) => uniq(opts) && opts.every((a, i) => opts.every((b, j) => i >= j || (Number.isFinite(a.num) && Number.isFinite(b.num) ? Math.abs(a.num - b.num) > 0.02 : a.num !== b.num)));

/** Wendestelle: Stufe 1–3 Funktion dritten Grades, Stufe 4 Produkt mit e-Funktion, Stufe 5 zwei Wendestellen (pq-Formel) oder ln. */
export function genWendestelle(lv = 3) {
  const mk = (x, correct, why, t) => ({ tex: `x=${t ?? ft(x)}`, x, correct, why });
  for (;;) {
    if (lv <= 3) {
      const a = lv <= 1 ? 1 : lv === 2 ? pick([1, 2, -1]) : pick([2, -2, 4]);
      const w = lv >= 3 ? pick([-2.5, -1.5, -0.5, 0.5, 1.5, 2.5]) : ri(-tier(lv, 2, 3), tier(lv, 2, 3)); if (w === 0) continue;
      const c = lv <= 1 ? 0 : pick([-3, 2, 6, -12]), d = lv >= 3 ? pick([1, -2, 7]) : 0;
      const coef = [d, c, -3 * a * w, a], f1 = polyDeriv(coef), f2 = polyDeriv(f1);
      const gl = `${ft(6 * a)}x${a2Pm(-6 * a * w)}=0`;
      const opts = [
        mk(w, true),
        mk(-w, false, `Vorzeichen: Aus ${tex(gl)} folgt ${tex(`x=${ft(w)}`)}.`),
        mk(2 * w, false, `Beim Auflösen muss durch ${tex(ft(6 * a))} geteilt werden, nicht durch ${tex(ft(3 * a))}.`),
        mk(0, false, `${tex('x=0')} wäre nur dann die Wendestelle, wenn es keinen ${tex('x^2')}-Term gäbe.`),
      ];
      const hints = lv <= 1 ? [`Wendestelle: ${tex("f''(x)=0")}.`, `${tex(`f''(x)=${polyTex(f2)}`)}.`]
        : [`Leite zweimal ab: ${tex(`f'(x)=${polyTex(f1)}`)}.`, `${tex(`f''(x)=${polyTex(f2)}`)}.`, `Setze ${tex("f''(x)=0")}: ${tex(gl)}.`];
      if (lv >= 3) hints.push(`Auflösen: ${tex(`x=\\dfrac{${ft(6 * a * w)}}{${ft(6 * a)}}=${ft(w)}`)}.`, `Kontrolle: ${tex(`f'''(x)=${ft(6 * a)}\\neq0`)} – ${tex("f''")} hat dort einen Vorzeichenwechsel.`);
      return {
        prompt: 'An welcher Stelle hat der Graph seinen Wendepunkt?',
        formula: `f(x)=${polyTex(coef)}`,
        options: shuffle(opts), hints,
        explain: lv <= 1 ? `${tex(`f''(x)=${polyTex(f2)}=0`)} liefert ${tex(`x=${ft(w)}`)}. Dort wechselt die Krümmung.`
          : `${tex(`f'(x)=${polyTex(f1)}`)}, ${tex(`f''(x)=${polyTex(f2)}=0`)} liefert ${tex(`x=${ft(w)}`)}.${lv >= 3 ? ` Wegen ${tex(`f'''(x)=${ft(6 * a)}\\neq0`)} wechselt dort die Krümmung.` : ' Dort wechselt die Krümmung.'}`,
        f: (x) => polyEval(coef, x), kind: 'kubisch',
      };
    }
    if (lv === 4) {
      const b = pick([-1, 2, -2, 0.5, -0.5]), p = ri(-3, 3), w = -p - 2 / b;
      const E = `e^{${a2Koef(b)}x}`, kl = p === 0 ? 'x' : `(x${a2Pm(p)})`;
      const f2 = (x) => b * b * Math.exp(b * x) * (x - w);
      const opts = [
        mk(w, true),
        mk(-p - 1 / b, false, `Das ist die Nullstelle von ${tex("f'")} (Extremstelle). Für die Wendestelle muss ${tex("f''(x)=0")} gelten.`),
        mk(-p, false, `Das ist die Nullstelle von ${tex('f')} selbst – gesucht ist die Nullstelle von ${tex("f''")}.`),
        mk(-p + 2 / b, false, `Vorzeichenfehler beim Auflösen von ${tex(`${lineTex(b * b, b * (b * p + 2))}=0`)}.`),
      ];
      if (!opts.every((o) => Math.abs(b * o.x) <= 3.5 && (o.correct || Math.abs(f2(o.x)) > 0.7))) continue;
      const k1 = lineTex(b, b * p + 1), k2 = lineTex(b * b, b * (b * p + 2));
      return {
        prompt: 'An welcher Stelle hat der Graph seinen Wendepunkt?',
        formula: `f(x)=${kl}\\cdot ${E}`,
        options: shuffle(opts),
        hints: [`Produktregel und Kettenregel: ${tex(`f'(x)=1\\cdot ${E}+${kl}\\cdot${par(b)}\\cdot ${E}=(${k1})\\cdot ${E}`)}.`,
          `Noch einmal ableiten: ${tex(`f''(x)=${par(b)}\\cdot ${E}+(${k1})\\cdot${par(b)}\\cdot ${E}=(${k2})\\cdot ${E}`)}.`,
          `${tex(`${E}>0`)} wird nie null. Also muss die Klammer null sein: ${tex(`${k2}=0`)}.`,
          `Auflösen: ${tex(`x=\\dfrac{${ft(-b * (b * p + 2))}}{${ft(b * b)}}=${ft(w)}`)}. Die Klammer wechselt dort das Vorzeichen.`],
        explain: `Mit Produktregel und Kettenregel: ${tex(`f''(x)=(${k2})\\cdot ${E}`)}. Weil ${tex(`${E}>0`)} ist, folgt aus ${tex(`${k2}=0`)} die Wendestelle ${tex(`x=${ft(w)}`)} (Vorzeichenwechsel von ${tex("f''")}).`,
        f: (x) => (x + p) * Math.exp(b * x), kind: 'e',
      };
    }
    if (rand() < 0.5) {
      // (x² + a·x + c)·e^{s·x}: f''(x) = (x² + (a+4s)·x + c + 2sa + 2)·e^{s·x} – zwei Wendestellen p < q
      const s = pick([1, -1]), p = ri(-3, 2), q = ri(p + 1, 3), a = -(p + q) - 4 * s, c = p * q - 2 * s * a - 2;
      const ziel = pick([p, q]), E = `e^{${s < 0 ? '-' : ''}x}`, P = -(p + q), Q = p * q;
      const f2 = (x) => Math.exp(s * x) * (x - p) * (x - q);
      const kand = [[-ziel, `Vorzeichenfehler in der pq-Formel: Sie beginnt mit ${tex('-\\tfrac{p}{2}')}.`], [(p + q) / 2, `Das ist nur der Teil ${tex('-\\tfrac{p}{2}')} der pq-Formel – die Wurzel fehlt.`], [ziel === p ? -q : -p, `Vorzeichenfehler in der pq-Formel: Sie beginnt mit ${tex('-\\tfrac{p}{2}')}.`], [0, `${tex(`f''(0)=${ft(Q)}\\neq0`)} – das ist keine Wendestelle.`], [2 * ziel, 'Beim Auflösen wurde nicht durch 2 geteilt.'], [ziel + (ziel === p ? -1 : 1), `Setze ein: ${tex("f''")} ist dort nicht null.`]];
      const falsch = [];
      for (const [x, why] of kand) if (x !== p && x !== q && falsch.length < 3 && !falsch.some((o) => o.x === x) && Math.abs(x) <= 3.5 && Math.abs(f2(x)) > 0.7) falsch.push(mk(x, false, why));
      if (falsch.length < 3 || Math.abs(ziel) > 3.5) continue;
      const kl = polyTex([c, a, 1]), k1 = polyTex([c + s * a, a + 2 * s, 1]), k2 = polyTex([Q, P, 1]);
      return {
        prompt: 'Der Graph hat zwei Wendepunkte. Welche der angegebenen Stellen ist eine Wendestelle?',
        formula: `f(x)=(${kl})\\cdot ${E}`,
        options: shuffle([mk(ziel, true), ...falsch]),
        hints: [`Produktregel und Kettenregel: ${tex(`f'(x)=(${lineTex(2, a)})\\cdot ${E}${s < 0 ? '-' : '+'}(${kl})\\cdot ${E}=${s < 0 ? '-' : ''}(${k1})\\cdot ${E}`)}.`,
          `Noch einmal mit der Produktregel: ${tex(`f''(x)=(${k2})\\cdot ${E}`)}.`,
          `${tex(`${E}>0`)}, also ${tex(`${k2}=0`)}. pq-Formel: ${tex(`x_{1,2}=${ft(-P / 2)}\\pm\\sqrt{${ft((P * P) / 4)}${a2Pm(-Q)}}=${ft(-P / 2)}\\pm${ft((q - p) / 2)}`)}.`,
          `Also ${tex(`x_1=${ft(p)}`)} und ${tex(`x_2=${ft(q)}`)}. Beides sind einfache Nullstellen von ${tex("f''")} (Vorzeichenwechsel) – also Wendestellen.`],
        explain: `${tex(`f''(x)=(${k2})\\cdot ${E}=0`)} führt mit der pq-Formel auf ${tex(`x_1=${ft(p)}`)} und ${tex(`x_2=${ft(q)}`)}. Zur Auswahl steht davon nur ${tex(`x=${ft(ziel)}`)}.`,
        f: (x) => (x * x + a * x + c) * Math.exp(s * x), kind: 'e2',
      };
    }
    // (ln x)² + b·ln(x): f'(x) = (2·ln(x) + b)/x, f''(x) = (2 - b - 2·ln(x))/x²
    const b = pick([1, 3, 4, -1, 0.5, 1.5, 2.5]), ex = 1 - b / 2, T = (e) => (e === 0 ? '1' : a2Eh(e));
    const f2 = (x) => (2 * (ex - Math.log(x))) / (x * x);
    const kand = [[ex - 1, `Das ist die Nullstelle von ${tex("f'")} (Extremstelle). Für die Wendestelle muss ${tex("f''(x)=0")} gelten.`], [-ex, `Vorzeichenfehler: ${tex(`\\ln(x)=${ft(ex)}`)}, also ${tex(`x=${T(ex)}`)}.`], [2 * ex, `Beim Auflösen von ${tex(`2\\ln(x)=${ft(2 - b)}`)} muss noch durch 2 geteilt werden.`], [ex - 0.5, `Quotientenregel: Im Zähler steht ${tex(`\\tfrac2x\\cdot x-(2\\ln(x)${a2Pm(b)})\\cdot1=${ft(2 - b)}-2\\ln(x)`)}.`], [ex - 2, `Setze ein: ${tex("f''")} ist dort nicht null.`]];
    const falsch = [];
    for (const [e, why] of kand) if (e !== ex && falsch.length < 3 && !falsch.some((o) => o.e === e) && Math.abs(f2(Math.exp(e))) > 0.7) falsch.push({ ...mk(Math.exp(e), false, why, T(e)), e });
    if (falsch.length < 3) continue;
    const zae = `${ft(2 - b)}-2\\ln(x)`;
    return {
      prompt: `An welcher Stelle hat der Graph seinen Wendepunkt (${tex('x>0')})?`,
      formula: `f(x)=(\\ln(x))^{2}${a2Mit(b, '\\ln(x)')}`,
      options: shuffle([mk(Math.exp(ex), true, undefined, T(ex)), ...falsch.map(({ e, ...o }) => o)]),
      hints: [`Kettenregel: ${tex(`f'(x)=2\\ln(x)\\cdot\\dfrac1x${a2Mit(b, '\\dfrac1x')}=\\dfrac{2\\ln(x)${a2Pm(b)}}{x}`)}.`,
        `Quotientenregel: ${tex(`f''(x)=\\dfrac{\\tfrac2x\\cdot x-(2\\ln(x)${a2Pm(b)})\\cdot1}{x^{2}}=\\dfrac{${zae}}{x^{2}}`)}.`,
        `Ein Bruch ist null, wenn der Zähler null ist: ${tex(`${zae}=0`)}, also ${tex(`\\ln(x)=${ft(ex)}`)}.`,
        `Mit der e-Funktion auflösen: ${tex(`x=${T(ex)}\\approx${ft(Math.exp(ex))}`)}. Der Zähler wechselt dort das Vorzeichen (Vorzeichenwechsel von ${tex("f''")}).`],
      explain: `Kettenregel und Quotientenregel: ${tex(`f'(x)=\\dfrac{2\\ln(x)${a2Pm(b)}}{x}`)}, ${tex(`f''(x)=\\dfrac{${zae}}{x^{2}}`)}. Aus ${tex(`\\ln(x)=${ft(ex)}`)} folgt ${tex(`x=${T(ex)}\\approx${ft(Math.exp(ex))}`)}.`,
      f: (x) => Math.log(x) ** 2 + b * Math.log(x), kind: 'ln',
    };
  }
}

/** In welchem Bereich fällt bzw. steigt der Graph? Stufe 1 Parabel, 2–3 dritten Grades, 4 vierten Grades (drei Nullstellen von f′), 5 mit e-Funktion. */
export function genMonotonie(lv = 3) {
  const O = (t, samples, correct, why) => ({ tex: t, samples, correct, why });
  const oder = (a, b) => `${a}\\ \\text{ oder }\\ ${b}`;
  if (lv <= 1) {
    const d = pick([-3, -2, -1, 1, 2, 3]), e = pick([0, 1, -2, 3]), D = d > 0 ? 2 * d : -d;
    const coef = [d * d + e, -2 * d, 1];
    return {
      prompt: 'In welchem Bereich <b>fällt</b> der Graph?',
      formula: `f(x)=${polyTex(coef)}`,
      options: shuffle([
        O(`x<${d}`, [d - 1, d - 3], true),
        O(`x>${d}`, [d + 1], false, `Dort ist ${tex("f'(x)>0")} – der Graph steigt.`),
        O(`x<${D}`, [d - 1, (d + D) / 2], false, d > 0 ? `Aus ${tex(`2x-${2 * d}=0`)} folgt ${tex(`x=${d}`)} – durch 2 teilen.` : `Vorzeichen: Aus ${tex(`2x+${-2 * d}=0`)} folgt ${tex(`x=${d}`)}.`),
        O(`x>${D}`, [D + 1], false, `Dort ist ${tex("f'(x)>0")} – der Graph steigt.`),
      ]),
      hints: [`Der Graph fällt, wo ${tex("f'(x)<0")}.`, `${tex(`f'(x)=${polyTex(polyDeriv(coef))}`)} ist null bei ${tex(`x=${d}`)}.`],
      explain: `${tex(`f'(x)=${polyTex(polyDeriv(coef))}<0`)} gilt für ${tex(`x<${d}`)}.`,
      f: (x) => polyEval(coef, x), steigt: false, kind: 'parabel',
    };
  }
  if (lv === 4) {
    // f'(x) = 12·x·(x - r1)·(x - r2)
    let r1, r2; do { r1 = ri(-3, 3); r2 = ri(-3, 3); } while (r1 >= r2 || r1 === 0 || r2 === 0);
    const c = pick([0, 1, -2, 5]), coef = [c, 0, 6 * r1 * r2, -4 * (r1 + r2), 3], f1 = polyDeriv(coef);
    const [s1, s2, s3] = [0, r1, r2].sort((x, y) => x - y), steigt = rand() < 0.5;
    const m1 = (s1 + s2) / 2, m2 = (s2 + s3) / 2, d1 = (x) => 12 * x * (x - r1) * (x - r2);
    const ab = oder(`x<${s1}`, `${s2}<x<${s3}`), auf = oder(`${s1}<x<${s2}`, `x>${s3}`);
    const opts = steigt
      ? [O(auf, [m1, s3 + 1], true), O(ab, [s1 - 1, m2], false, 'Das sind genau die Bereiche, in denen der Graph fällt.'),
        O(`${s1}<x<${s3}`, [m1, m2], false, `Zwischen ${tex(`x=${s2}`)} und ${tex(`x=${s3}`)} ist ${tex("f'(x)<0")}: ${tex("f'")} hat drei Nullstellen, nicht zwei.`),
        O(oder(`x<${s1}`, `x>${s3}`), [s1 - 1, s3 + 1], false, `Für ${tex(`x<${s1}`)} ist ${tex("f'(x)<0")} – dort fällt der Graph.`)]
      : [O(ab, [s1 - 1, m2], true), O(auf, [m1, s3 + 1], false, 'Das sind genau die Bereiche, in denen der Graph steigt.'),
        O(`${s1}<x<${s3}`, [m1, m2], false, `Zwischen ${tex(`x=${s1}`)} und ${tex(`x=${s2}`)} ist ${tex("f'(x)>0")}: ${tex("f'")} hat drei Nullstellen, nicht zwei.`),
        O(oder(`x<${s1}`, `x>${s3}`), [s1 - 1, s3 + 1], false, `Für ${tex(`x>${s3}`)} ist ${tex("f'(x)>0")} – dort steigt der Graph.`)];
    const qu = polyTex([r1 * r2, -(r1 + r2), 1]), z = (x) => `f'(${ft(x)})=${ft(d1(x))}`;
    return {
      prompt: `In welchen Bereichen <b>${steigt ? 'steigt' : 'fällt'}</b> der Graph?`,
      formula: `f(x)=${polyTex(coef)}`,
      options: shuffle(opts),
      hints: [`Der Graph ${steigt ? 'steigt' : 'fällt'}, wo ${tex(`f'(x)${steigt ? '>' : '<'}0`)}. ${tex(`f'(x)=${polyTex(f1)}`)}.`,
        `Ausklammern: ${tex(`f'(x)=12x\\cdot(${qu})`)}. Eine Nullstelle ist ${tex('x=0')}.`,
        `pq-Formel für die Klammer: ${tex(`x=${ft((r1 + r2) / 2)}\\pm\\sqrt{${ft((r1 + r2) ** 2 / 4)}${a2Pm(-r1 * r2)}}`)}, also ${tex(`x=${r1}`)} und ${tex(`x=${r2}`)}.`,
        `Vorzeichen in den vier Bereichen mit Testwerten: ${tex(z(s1 - 1))}, ${tex(z(m1))}, ${tex(z(m2))}, ${tex(z(s3 + 1))}.`],
      explain: `${tex(`f'(x)=12x\\cdot(${qu})`)} hat die Nullstellen ${tex(`x=${s1}`)}, ${tex(`x=${s2}`)} und ${tex(`x=${s3}`)} (Ausklammern, pq-Formel). An jeder liegt ein Vorzeichenwechsel: ${tex("f'(x)<0")} für ${tex(ab)}, sonst ${tex("f'(x)>0")}.`,
      f: (x) => polyEval(coef, x), steigt, kind: 'grad4',
    };
  }
  // Zwei Nullstellen r1 < r2 von f′: dritter Grad (Stufe 2–3) oder (x² + a·x + b)·e^{s·x} (Stufe 5)
  let r1, r2, steigt, aussen, formula, f, hints, explain, kind;
  if (lv <= 3) {
    const k = kubik(lv); ({ r1, r2, f } = k); steigt = lv >= 3 && rand() < 0.5; aussen = steigt; kind = 'kubisch';
    const mid = (r1 + r2) / 2, f1 = polyDeriv(k.coef), qu = polyTex([r1 * r2, -(r1 + r2), 1]), d1 = (x) => 6 * (x - r1) * (x - r2);
    formula = `f(x)=${polyTex(k.coef)}`;
    hints = [`Der Graph ${steigt ? 'steigt' : 'fällt'}, wo ${tex(`f'(x)${steigt ? '>' : '<'}0`)}. ${tex(`f'(x)=${polyTex(f1)}`)}.`,
      lv <= 2 ? `${tex("f'(x)=0")}: Teile durch 6 – ${tex(`${qu}=0`)} hat die Lösungen ${tex(`x=${r1}`)} und ${tex(`x=${r2}`)}.`
        : `${tex("f'(x)=0")}: Teile durch 6 und nimm die pq-Formel: ${tex(`x=${ft(mid)}\\pm\\sqrt{${ft(mid * mid)}${a2Pm(-r1 * r2)}}`)}, also ${tex(`x=${r1}`)} und ${tex(`x=${r2}`)}.`,
      lv <= 2 ? `Testwert dazwischen: ${tex(`f'(${ft(mid)})=${ft(d1(mid))}<0`)}.`
        : `Testwerte: ${tex(`f'(${ft(r1 - 1)})=${ft(d1(r1 - 1))}`)}, ${tex(`f'(${ft(mid)})=${ft(d1(mid))}`)}, ${tex(`f'(${ft(r2 + 1)})=${ft(d1(r2 + 1))}`)}.`];
    explain = `${tex(`f'(x)=6${r1 === 0 ? 'x' : `(x${a2Pm(-r1)})`}${r2 === 0 ? 'x' : `(x${a2Pm(-r2)})`}`)} ist zwischen den Nullstellen negativ, außerhalb positiv${lv >= 3 ? ' (Vorzeichenwechsel an beiden Nullstellen)' : ''}.`;
  } else {
    do { r1 = ri(-3, 2); r2 = ri(r1 + 1, 3); } while (r1 === -r2);
    // f'(x) = s·(x - r1)·(x - r2)·e^{s·x}
    const s = pick([1, -1, 2, -2, 0.5, -0.5]), a = -(r1 + r2) - 2 / s, b = r1 * r2 - a / s, E = `e^{${a2Koef(s)}x}`, mid = (r1 + r2) / 2;
    steigt = rand() < 0.5; aussen = steigt === (s > 0); kind = 'e';
    const kl = polyTex([b, a, 1]), qu = polyTex([r1 * r2, -(r1 + r2), 1]), V = a2Koef(s);
    f = (x) => (x * x + a * x + b) * Math.exp(s * x);
    formula = `f(x)=(${kl})\\cdot ${E}`;
    hints = [`Produktregel und Kettenregel: ${tex(`f'(x)=(${lineTex(2, a)})\\cdot ${E}+(${kl})\\cdot${s === 1 ? '' : `${par(s)}\\cdot`} ${E}`)}.`,
      `Zusammenfassen${Math.abs(s) === 1 ? '' : ` und ${tex(ft(s))} ausklammern (Ausklammern)`}: ${tex(`f'(x)=${V}(${qu})\\cdot ${E}`)}.`,
      `${tex(`${E}>0`)} – das Vorzeichen hängt nur an ${tex(`${V}(${qu})`)}. pq-Formel: ${tex(`x=${ft(mid)}\\pm\\sqrt{${ft(mid * mid)}${a2Pm(-r1 * r2)}}`)}, also ${tex(`x=${r1}`)} und ${tex(`x=${r2}`)}.`,
      `Die Parabel ${tex(qu)} ist nach oben geöffnet: zwischen den Nullstellen negativ.${s < 0 ? ' Der negative Faktor davor dreht das Vorzeichen um.' : ''}`,
      `Probe mit Testwerten: ${[r1 - 1, mid, r2 + 1].map((x) => tex(`f'(${ft(x)})\\approx${ft(s * (x - r1) * (x - r2) * Math.exp(s * x))}`)).join(', ')}.`];
    explain = `${tex(`f'(x)=${V}(${qu})\\cdot ${E}`)} (Produktregel, Kettenregel). Wegen ${tex(`${E}>0`)} ist ${tex("f'(x)")} zwischen ${tex(`x=${r1}`)} und ${tex(`x=${r2}`)} ${s < 0 ? 'positiv' : 'negativ'}, außerhalb ${s < 0 ? 'negativ' : 'positiv'}.`;
  }
  const mid = (r1 + r2) / 2, wort = steigt ? 'steigt' : 'fällt', gegen = steigt ? 'fällt' : 'steigt', gz = steigt ? '<' : '>';
  const opts = aussen
    ? [O(oder(`x<${r1}`, `x>${r2}`), [r1 - 1, r2 + 1], true),
      O(`${r1}<x<${r2}`, [mid], false, `Zwischen den Nullstellen ist ${tex(`f'(x)${gz}0`)} – dort ${gegen} der Graph.`),
      O(`x>${r1}`, [mid, r2 + 1], false, `Zwischen ${tex(`x=${r1}`)} und ${tex(`x=${r2}`)} ${gegen} der Graph.`),
      O(`x<${r2}`, [r1 - 1, mid], false, `Zwischen ${tex(`x=${r1}`)} und ${tex(`x=${r2}`)} ${gegen} der Graph.`)]
    : [O(`${r1}<x<${r2}`, [mid], true),
      O(`x<${r1}`, [r1 - 1], false, `Dort ist ${tex(`f'(x)${gz}0`)} – der Graph ${gegen}.`),
      O(`x>${r2}`, [r2 + 1], false, `Dort ist ${tex(`f'(x)${gz}0`)} – der Graph ${gegen}.`),
      O(oder(`x<${r1}`, `x>${r2}`), [r1 - 1, r2 + 1], false, `Das sind genau die Bereiche, in denen der Graph ${gegen}.`)];
  return { prompt: `In welchem Bereich <b>${wort}</b> der Graph?`, formula, options: shuffle(opts), hints, explain, f, steigt, kind };
}

/* Vorlagen für die Symmetrie auf Stufe 4 (Produkte, Brüche) und Stufe 5 (e-Funktion, ln, Parameter): [Art, Bauer(a, b) → { t: Term, f, neg: Rechnung für f(-x) }]. */
const A2_SYM4 = [
  ['odd', (a) => ({ t: `x\\cdot(x^{2}-${a})^{2}`, f: (x) => x * (x * x - a) ** 2, neg: `(-x)\\cdot((-x)^{2}-${a})^{2}=-x\\cdot(x^{2}-${a})^{2}` })],
  ['odd', (a) => ({ t: `x\\cdot(x-${a})\\cdot(x+${a})`, f: (x) => x * (x - a) * (x + a), neg: `(-x)\\cdot(-x-${a})\\cdot(-x+${a})=-x\\cdot(x+${a})\\cdot(x-${a})` })],
  ['odd', (a, b) => ({ t: `\\dfrac{x^{3}-${a}x}{x^{2}+${b}}`, f: (x) => (x ** 3 - a * x) / (x * x + b), neg: `\\dfrac{(-x)^{3}-${a}\\cdot(-x)}{(-x)^{2}+${b}}=\\dfrac{-x^{3}+${a}x}{x^{2}+${b}}` })],
  ['odd', (a) => ({ t: `(x+${a})^{3}+(x-${a})^{3}`, f: (x) => (x + a) ** 3 + (x - a) ** 3, neg: `(-x+${a})^{3}+(-x-${a})^{3}=-(x-${a})^{3}-(x+${a})^{3}` })],
  ['even', (a, b) => ({ t: `(x^{2}-${a})\\cdot(x^{2}+${b})`, f: (x) => (x * x - a) * (x * x + b), neg: `((-x)^{2}-${a})\\cdot((-x)^{2}+${b})=(x^{2}-${a})\\cdot(x^{2}+${b})` })],
  ['even', (a, b) => ({ t: `\\dfrac{x^{2}+${a}}{x^{4}+${b}}`, f: (x) => (x * x + a) / (x ** 4 + b), neg: `\\dfrac{(-x)^{2}+${a}}{(-x)^{4}+${b}}=\\dfrac{x^{2}+${a}}{x^{4}+${b}}` })],
  ['even', (a) => ({ t: `(x+${a})^{3}-(x-${a})^{3}`, f: (x) => (x + a) ** 3 - (x - a) ** 3, neg: `(-x+${a})^{3}-(-x-${a})^{3}=-(x-${a})^{3}+(x+${a})^{3}` })],
  ['even', (a, b) => ({ t: `x\\cdot(x^{3}-${a}x)+${b}`, f: (x) => x * (x ** 3 - a * x) + b, neg: `(-x)\\cdot((-x)^{3}+${a}x)+${b}=x\\cdot(x^{3}-${a}x)+${b}` })],
  ['none', (a) => ({ t: `x^{2}\\cdot(x-${a})`, f: (x) => x * x * (x - a), neg: `(-x)^{2}\\cdot(-x-${a})=-x^{2}\\cdot(x+${a})` })],
  ['none', (a, b) => ({ t: `\\dfrac{x+${a}}{x^{2}+${b}}`, f: (x) => (x + a) / (x * x + b), neg: `\\dfrac{-x+${a}}{(-x)^{2}+${b}}=\\dfrac{-x+${a}}{x^{2}+${b}}` })],
  ['none', (a) => ({ t: `x\\cdot(x-${a})^{2}`, f: (x) => x * (x - a) ** 2, neg: `(-x)\\cdot(-x-${a})^{2}=-x\\cdot(x+${a})^{2}` })],
  ['none', (a, b) => ({ t: `(x^{3}-${a}x)\\cdot(x^{2}+${b})+${b}`, f: (x) => (x ** 3 - a * x) * (x * x + b) + b, neg: `(-x^{3}+${a}x)\\cdot(x^{2}+${b})+${b}=-(x^{3}-${a}x)\\cdot(x^{2}+${b})+${b}` })],
];
const A2_SYM5 = [
  ['even', (a, b) => ({ t: `e^{${b}x}+e^{-${b}x}`, f: (x) => Math.exp(b * x) + Math.exp(-b * x), neg: `e^{${b}\\cdot(-x)}+e^{-${b}\\cdot(-x)}=e^{-${b}x}+e^{${b}x}` })],
  ['even', () => ({ t: 'x\\cdot(e^{x}-e^{-x})', f: (x) => x * (Math.exp(x) - Math.exp(-x)), neg: '(-x)\\cdot(e^{-x}-e^{x})=x\\cdot(e^{x}-e^{-x})' })],
  ['even', (a) => ({ t: `(x^{2}-${a})\\cdot e^{-x^{2}}`, f: (x) => (x * x - a) * Math.exp(-x * x), neg: `((-x)^{2}-${a})\\cdot e^{-(-x)^{2}}=(x^{2}-${a})\\cdot e^{-x^{2}}` })],
  ['even', (a) => ({ t: `\\ln(k\\,x^{2}+${a})`, f: (x) => Math.log(A2_K0 * x * x + a), neg: `\\ln(k\\cdot(-x)^{2}+${a})=\\ln(k\\,x^{2}+${a})`, zus: ` (${tex('k>0')})` })],
  ['even', () => ({ t: '\\dfrac{e^{x}}{(e^{x}+1)^{2}}', f: (x) => Math.exp(x) / (Math.exp(x) + 1) ** 2, neg: '\\dfrac{e^{-x}}{(e^{-x}+1)^{2}}=\\dfrac{e^{-x}\\cdot e^{2x}}{(e^{-x}+1)^{2}\\cdot e^{2x}}=\\dfrac{e^{x}}{(1+e^{x})^{2}}', trick: `Erweitern mit ${tex('e^{2x}')}` })],
  ['odd', (a, b) => ({ t: `e^{${b}x}-e^{-${b}x}`, f: (x) => Math.exp(b * x) - Math.exp(-b * x), neg: `e^{-${b}x}-e^{${b}x}=-(e^{${b}x}-e^{-${b}x})` })],
  ['odd', () => ({ t: 'x\\cdot e^{-k\\,x^{2}}', f: (x) => x * Math.exp(-A2_K0 * x * x), neg: '(-x)\\cdot e^{-k\\cdot(-x)^{2}}=-x\\cdot e^{-k\\,x^{2}}', zus: ` (${tex('k>0')})` })],
  ['odd', (a) => ({ t: `x\\cdot\\ln(x^{2}+${a})`, f: (x) => x * Math.log(x * x + a), neg: `(-x)\\cdot\\ln((-x)^{2}+${a})=-x\\cdot\\ln(x^{2}+${a})` })],
  ['odd', () => ({ t: '\\dfrac{e^{x}-1}{e^{x}+1}', f: (x) => (Math.exp(x) - 1) / (Math.exp(x) + 1), neg: '\\dfrac{e^{-x}-1}{e^{-x}+1}=\\dfrac{(e^{-x}-1)\\cdot e^{x}}{(e^{-x}+1)\\cdot e^{x}}=\\dfrac{1-e^{x}}{1+e^{x}}', trick: `Erweitern mit ${tex('e^{x}')}` })],
  ['odd', () => ({ t: '\\dfrac{e^{x}-e^{-x}}{e^{x}+e^{-x}}', f: (x) => Math.tanh(x), neg: '\\dfrac{e^{-x}-e^{x}}{e^{-x}+e^{x}}=-\\dfrac{e^{x}-e^{-x}}{e^{x}+e^{-x}}' })],
  ['odd', (a) => ({ t: `\\ln\\left(\\dfrac{${a + 2}+x}{${a + 2}-x}\\right)`, f: (x) => Math.log((a + 2 + x) / (a + 2 - x)), neg: `\\ln\\left(\\dfrac{${a + 2}-x}{${a + 2}+x}\\right)=-\\ln\\left(\\dfrac{${a + 2}+x}{${a + 2}-x}\\right)`, trick: `Logarithmengesetz: Der Kehrwert im ln dreht das Vorzeichen um, ${tex('\\ln\\left(\\tfrac1u\\right)=-\\ln(u)')}`, zus: ` (${tex(`-${a + 2}<x<${a + 2}`)})` })],
  ['none', (a, b) => ({ t: `e^{${b}x}-e^{-${b}x}+${a}`, f: (x) => Math.exp(b * x) - Math.exp(-b * x) + a, neg: `e^{-${b}x}-e^{${b}x}+${a}` })],
  ['none', () => ({ t: 'x^{2}\\cdot e^{-x}', f: (x) => x * x * Math.exp(-x), neg: '(-x)^{2}\\cdot e^{-(-x)}=x^{2}\\cdot e^{x}' })],
  ['none', (a) => ({ t: `\\ln(x^{2}+${a + 1})+x`, f: (x) => Math.log(x * x + a + 1) + x, neg: `\\ln((-x)^{2}+${a + 1})-x=\\ln(x^{2}+${a + 1})-x` })],
  ['none', (a) => ({ t: `(x-${a})\\cdot e^{-x^{2}}`, f: (x) => (x - a) * Math.exp(-x * x), neg: `(-x-${a})\\cdot e^{-(-x)^{2}}=-(x+${a})\\cdot e^{-x^{2}}` })],
  ['none', () => ({ t: 'x^{3}\\cdot e^{-k\\,x}', f: (x) => x ** 3 * Math.exp(-A2_K0 * x), neg: '(-x)^{3}\\cdot e^{-k\\cdot(-x)}=-x^{3}\\cdot e^{k\\,x}', zus: ` (${tex('k>0')})` })],
];

/** Symmetrie erkennen: Stufe 1–3 am Polynom (Exponenten), Stufe 4 Produkte und Brüche, Stufe 5 e-Funktion, ln und Parameter – jeweils f(-x) ausrechnen. */
export function genSymmetrie(lv = 3) {
  const L = { even: 'achsensymmetrisch zur y-Achse', odd: 'punktsymmetrisch zum Ursprung', none: 'keine dieser beiden Symmetrien' };
  const G = { even: 'f(-x)=f(x)', odd: 'f(-x)=-f(x)' };
  const opt = (kind, why) => shuffle(['even', 'odd', 'none'].map((k) => ({ tex: L[k], html: L[k], key: k, correct: k === kind, why: why[k] })));
  if (lv >= 4) {
    const kind = pick(['even', 'odd', 'none']), V = (lv >= 5 ? A2_SYM5 : A2_SYM4).filter((v) => v[0] === kind);
    const a = ri(1, 5), b = ri(2, 4), v = pick(V)[1](a, b);
    const t0 = [1, 2, 0.5].find((t) => Math.abs(v.f(t) - v.f(-t)) > 0.02 && Math.abs(v.f(t) + v.f(-t)) > 0.02) ?? 1;
    const gegen = `${tex(`f(${ft(t0)})\\approx${ft(v.f(t0))}`)}, aber ${tex(`f(${ft(-t0)})\\approx${ft(v.f(-t0))}`)}`;
    const why = kind === 'none'
      ? { even: `Dafür müsste ${tex(G.even)} gelten. Gegenbeispiel: ${gegen}.`, odd: `Dafür müsste ${tex(G.odd)} gelten. Gegenbeispiel: ${gegen}.` }
      : { even: `Dafür müsste ${tex(G.even)} gelten – es ergibt sich aber ${tex(G.odd)}.`, odd: `Dafür müsste ${tex(G.odd)} gelten – es ergibt sich aber ${tex(G.even)}.`, none: `Rechne ${tex('f(-x)')} aus: Es kommt ${tex(G[kind])} heraus.` };
    const schluss = kind === 'none' ? `Das ist weder ${tex('f(x)')} noch ${tex('-f(x)')}. Probe: ${gegen}.` : `Das ist genau ${tex(kind === 'even' ? 'f(x)' : '-f(x)')}, also ${tex(G[kind])}.`;
    return {
      prompt: `Welche Symmetrie hat der Graph${v.zus || ''}?`,
      formula: `f(x)=${v.t}`,
      options: opt(kind, why),
      hints: [`Ersetze überall ${tex('x')} durch ${tex('-x')} und vereinfache. Achsensymmetrie: ${tex(G.even)}. Punktsymmetrie: ${tex(G.odd)}.`,
        `${tex(`f(-x)=${v.neg}`)}${v.trick ? ` (${v.trick})` : ''}.`, schluss],
      explain: `${tex(`f(-x)=${v.neg}`)}${v.trick ? ` (${v.trick})` : ''}. ${schluss} Ergebnis: ${L[kind]}.`,
      f: v.f, kind,
    };
  }
  for (;;) {
    const kind = pick(['even', 'odd', 'none']);
    const top = tier(lv, 4, 5, 7), coef = Array(top + 1).fill(0);
    const C = () => pick(lv <= 1 ? [1, 2, 3] : [1, 2, 3, -1, -2, -4, 5]);
    const evens = [2, 4, 6].filter((e) => e <= top), odds = [1, 3, 5, 7].filter((e) => e <= top);
    let falle = false;
    if (kind === 'even') { shuffle(evens).slice(0, lv >= 3 ? 3 : 2).forEach((e) => { coef[e] = C(); }); if (lv >= 3 || rand() < 0.5) coef[0] = C(); }
    else if (kind === 'odd') shuffle(odds).slice(0, tier(lv, 2, 3, 4)).forEach((e) => { coef[e] = C(); });
    else if (lv >= 3 && rand() < 0.5) { falle = true; shuffle(odds).slice(0, 3).forEach((e) => { coef[e] = C(); }); coef[0] = C(); }
    else { shuffle(evens).slice(0, lv >= 2 ? 2 : 1).forEach((e) => { coef[e] = C(); }); shuffle(odds).slice(0, lv >= 3 ? 2 : 1).forEach((e) => { coef[e] = C(); }); if (lv >= 2 && rand() < 0.5) coef[0] = C(); }
    const exps = coef.map((c, i) => (c ? i : -1)).filter((i) => i >= 0).reverse();
    const why = {
      even: `Dafür dürften nur gerade Exponenten vorkommen, denn dann gilt ${tex(G.even)}.`,
      odd: `Dafür dürften nur ungerade Exponenten vorkommen (und keine Zahl ohne x), denn dann gilt ${tex(G.odd)}.`,
      none: kind === 'even' ? 'Schau auf die Exponenten: Sie sind alle gerade.' : 'Schau auf die Exponenten: Sie sind alle ungerade.',
    };
    const neg = coef.map((c, i) => (i % 2 ? -c : c));
    const hints = ['Schau nur auf die Exponenten von x.', `Nur gerade Exponenten: achsensymmetrisch. Nur ungerade: punktsymmetrisch. Eine Zahl ohne x zählt als ${tex('x^0')} (gerade).`];
    if (lv >= 2) hints.push(`Hier kommen die Exponenten ${exps.join(', ')} vor.`);
    if (lv >= 3) hints.push(`Probe mit ${tex('-x')}: ${tex(`f(-x)=${polyTex(neg)}`)} – vergleiche mit ${tex('f(x)')} und ${tex('-f(x)')}.`);
    const ende = kind === 'none' ? (falle ? `Die Exponenten von x sind zwar alle ungerade, aber die Zahl ${tex(ft(coef[0]))} ohne x zählt als ${tex('x^0')} (gerade) – keine der beiden Symmetrien.` : 'Es kommen gerade und ungerade Exponenten vor – keine der beiden Symmetrien.') : `Es kommen nur ${kind === 'even' ? 'gerade' : 'ungerade'} Exponenten vor: ${L[kind]}.`;
    return {
      prompt: 'Welche Symmetrie hat der Graph?',
      formula: `f(x)=${polyTex(coef)}`,
      options: opt(kind, why), hints,
      explain: lv >= 3 ? `${tex(`f(-x)=${polyTex(neg)}`)}. ${ende}` : ende,
      f: (x) => polyEval(coef, x), kind,
    };
  }
}

/** Verhalten für x → ∞: Stufe 1–3 gebrochenrational, Stufe 4 mit Klammern und Wurzel, Stufe 5 mit e-Funktion, Parameter und „∞ − ∞“. */
export function genGrenzwert(lv = 3) {
  const Z = (z, n, why) => ({ tex: a2Bruch(z, n), num: z / n, correct: false, why });
  const inf = (s, why) => ({ tex: s > 0 ? '\\infty' : '-\\infty', num: s > 0 ? Infinity : -Infinity, correct: false, why });
  const fertig = (q, opts) => (a2Verschieden(opts) ? { prompt: `Wie verhält sich die Funktion für ${tex('x\\to\\infty')}${q.zus || ''}?`, ...q, options: shuffle(opts) } : null);
  const nz = (list) => pick(list);
  for (;;) {
    let r = null;
    if (lv <= 3) {
      const kind = pick(lv <= 1 ? ['gleich', 'kleiner'] : ['gleich', 'kleiner', 'groesser']);
      const m = ri(1, tier(lv, 2, 2, 3)), n = kind === 'gleich' ? m : kind === 'kleiner' ? m - 1 : m + 1;
      const [a, b] = lv >= 3 ? pick([[3, 2], [5, 2], [-3, 4], [2, 3], [7, 4], [-5, 3], [9, 2], [-4, 3]]) : (() => { const bb = pick(lv <= 1 ? [1, 2] : [1, 2, -2, 4]), qq = pick(lv <= 1 ? [2, 3, 4] : [2, 3, -2, 4, -3]); return [bb * qq, bb]; })();
      const P = Array(n + 1).fill(0), Q = Array(m + 1).fill(0);
      P[n] = a; Q[m] = b; if (n > 0) P[ri(0, n - 1)] = pick([1, -3, 5, 7]); Q[ri(0, m - 1)] = pick([1, 2, -5, 9]);
      if (lv >= 3) { if (n > 1 && !P[0]) P[0] = pick([-4, 6, 8]); if (m > 1 && !Q[0]) Q[0] = pick([3, -7, 11]); }
      const lead = Z(a, b), zero_ = Z(0, 1), rec = Z(b, a), xm = m === 1 ? 'x' : `x^{${m}}`;
      let opts, explain;
      if (kind === 'gleich') { opts = [{ ...lead, correct: true }, { ...zero_, why: 'Zähler- und Nennergrad sind gleich – dann entscheidet das Verhältnis der Leitkoeffizienten.' }, inf(1, 'Zähler und Nenner wachsen gleich schnell, der Bruch bleibt beschränkt.'), { ...rec, why: 'Leitkoeffizient des Zählers durch den des Nenners – nicht umgekehrt.' }];
        explain = `Gleicher Grad: ${tex(`\\lim f(x)=\\dfrac{${ft(a)}}{${ft(b)}}${a2Bruch(a, b) === `\\dfrac{${ft(a)}}{${ft(b)}}` ? '' : `=${a2Bruch(a, b)}`}`)}.`; }
      else if (kind === 'kleiner') { opts = [{ ...zero_, correct: true }, { ...lead, why: 'Das Verhältnis der Leitkoeffizienten gilt nur bei gleichem Grad.' }, inf(1, 'Der Nenner hat den höheren Grad und wächst schneller.'), { ...rec, why: 'Der Nenner wächst schneller als der Zähler – der Bruch geht gegen 0.' }];
        explain = `Der Nennergrad ist größer: ${tex('\\lim f(x)=0')}.`; }
      else { opts = [{ ...inf(a / b), correct: true }, inf(-a / b, 'Achte auf die Vorzeichen der beiden Leitkoeffizienten.'), { ...zero_, why: 'Der Zähler hat den höheren Grad und wächst schneller.' }, { ...lead, why: 'Das Verhältnis der Leitkoeffizienten gilt nur bei gleichem Grad.' }];
        explain = `Der Zählergrad ist größer: ${tex(`f(x)\\to${a / b > 0 ? '' : '-'}\\infty`)}${lv >= 2 ? ` (Vorzeichen von ${tex(`\\tfrac{${ft(a)}}{${ft(b)}}`)})` : ''}.`; }
      const hints = ['Vergleiche den höchsten Exponenten im Zähler mit dem im Nenner.', 'Gleicher Grad: Verhältnis der Leitkoeffizienten. Nenner höher: 0. Zähler höher: unendlich.'];
      if (lv >= 2) hints.splice(1, 0, `Zählergrad ${n}, Nennergrad ${m}.`);
      if (lv >= 3) hints.push(`Ausklammern von ${tex(xm)} in Zähler und Nenner zeigt es: Alle Summanden mit ${tex('\\tfrac1x')} gehen gegen 0, übrig bleibt ${tex(n === m ? `\\dfrac{${ft(a)}}{${ft(b)}}` : n < m ? `\\dfrac{0}{${ft(b)}}` : `\\dfrac{${ft(a)}x}{${ft(b)}}`)}.`);
      r = fertig({ formula: `f(x)=\\dfrac{${polyTex(P)}}{${polyTex(Q)}}`, hints, explain: lv >= 3 ? `Zählergrad ${n}, Nennergrad ${m}. ${explain}` : explain, f: (x) => polyEval(P, x) / polyEval(Q, x), kind }, opts);
    } else if (lv === 4) {
      const art = pick(['produkt', 'quadrat', 'wurzel', 'grad3']);
      const a = nz([2, 3, -2, 4, 5]), b = nz([1, -3, 4, -5]), c = nz([1, 2, 3, -1]), d = nz([2, -1, 5, -4]), e = nz([2, 3, 4, -3, 6]), g = nz([1, 3, 7, 5]);
      if (art === 'produkt') {
        if (a * c === e || a === e) continue;
        r = fertig({ formula: `f(x)=\\dfrac{(${lineTex(a, b)})(${lineTex(c, d)})}{${polyTex([g, 0, e])}}`, kind: art, f: (x) => ((a * x + b) * (c * x + d)) / (e * x * x + g),
          hints: [`Multipliziere den Zähler aus – wichtig ist nur die höchste Potenz: ${tex(`${par(a)}x\\cdot${par(c)}x=${ft(a * c)}x^{2}`)}.`, 'Zähler und Nenner haben beide den Grad 2.', `Ausklammern von ${tex('x^{2}')}: Es entscheidet das Verhältnis der Leitkoeffizienten, ${tex(`\\dfrac{${ft(a * c)}}{${ft(e)}}`)}.`],
          explain: `Ausmultipliziert beginnt der Zähler mit ${tex(`${ft(a * c)}x^{2}`)}, der Nenner mit ${tex(`${ft(e)}x^{2}`)} – gleicher Grad: ${tex(`\\lim f(x)=\\dfrac{${ft(a * c)}}{${ft(e)}}=${a2Bruch(a * c, e)}`)}.` },
        [{ ...Z(a * c, e), correct: true }, Z(a, e, `Beim Ausmultiplizieren entsteht ${tex(`${par(a)}x\\cdot${par(c)}x=${ft(a * c)}x^{2}`)} – beide Faktoren zählen.`), inf(a * c * e, 'Ausmultipliziert hat der Zähler den Grad 2 – genau wie der Nenner. Der Bruch bleibt beschränkt.'), Z(b * d, g, `Das ist der Wert an der Stelle ${tex('x=0')}, nicht das Verhalten für große x.`)]);
      } else if (art === 'quadrat') {
        if (a * a === e || Math.abs(a) === Math.abs(e)) continue;
        r = fertig({ formula: `f(x)=\\dfrac{(${lineTex(a, b)})^{2}}{${polyTex([0, d, e])}}`, kind: art, f: (x) => (a * x + b) ** 2 / (e * x * x + d * x),
          hints: [`Binomische Formel – wichtig ist nur die höchste Potenz: ${tex(`(${par(a)}x)^{2}=${ft(a * a)}x^{2}`)}.`, 'Zähler und Nenner haben beide den Grad 2.', `Ausklammern von ${tex('x^{2}')}: Es entscheidet das Verhältnis der Leitkoeffizienten, ${tex(`\\dfrac{${ft(a * a)}}{${ft(e)}}`)}.`],
          explain: `Der Zähler beginnt nach der binomischen Formel mit ${tex(`${ft(a * a)}x^{2}`)}, der Nenner mit ${tex(`${ft(e)}x^{2}`)} – gleicher Grad: ${tex(`\\lim f(x)=\\dfrac{${ft(a * a)}}{${ft(e)}}=${a2Bruch(a * a, e)}`)}.` },
        [{ ...Z(a * a, e), correct: true }, Z(a, e, `Auch der Faktor wird quadriert: ${tex(`(${par(a)}x)^{2}=${ft(a * a)}x^{2}`)}.`), inf(e, 'Ausmultipliziert hat der Zähler den Grad 2 – genau wie der Nenner. Der Bruch bleibt beschränkt.'), Z(0, 1, 'Der Nenner wächst nicht schneller: Auch der Zähler hat ausmultipliziert den Grad 2.')]);
      } else if (art === 'wurzel') {
        const w = Math.abs(a), A = w * w, bb = Math.abs(b) + 1;
        if (w === Math.abs(e) || A === Math.abs(e)) continue;
        r = fertig({ formula: `f(x)=\\dfrac{\\sqrt{${A}x^{2}+${bb}}}{${lineTex(e, d)}}`, kind: art, f: (x) => Math.sqrt(A * x * x + bb) / (e * x + d),
          hints: [`Für große x verhält sich die Wurzel wie ${tex(`\\sqrt{${A}x^{2}}=${w}x`)}.`, `Genauer durch Ausklammern: ${tex(`\\sqrt{${A}x^{2}+${bb}}=x\\cdot\\sqrt{${A}+\\tfrac{${bb}}{x^{2}}}`)} für ${tex('x>0')}.`, `Zähler und Nenner wachsen also beide wie x: Es bleibt ${tex(`\\dfrac{${w}}{${ft(e)}}`)}.`],
          explain: `Ausklammern von x: ${tex(`f(x)=\\dfrac{x\\cdot\\sqrt{${A}+\\tfrac{${bb}}{x^{2}}}}{x\\cdot(${ft(e)}${a2Pm(d)}\\cdot\\tfrac1x)}\\to\\dfrac{\\sqrt{${A}}}{${ft(e)}}=${a2Bruch(w, e)}`)}.` },
        [{ ...Z(w, e), correct: true }, Z(A, e, `Die Wurzel fehlt: ${tex(`\\sqrt{${A}x^{2}}=${w}x`)}.`), inf(e, `Unter der Wurzel steht zwar ${tex('x^{2}')}, die Wurzel wächst aber nur wie x – genauso schnell wie der Nenner.`), Z(0, 1, 'Der Zähler wächst wie x – genauso schnell wie der Nenner. Der Bruch geht nicht gegen 0.')]);
      } else {
        r = fertig({ formula: `f(x)=\\dfrac{(${lineTex(a, b)})(${polyTex([d, 0, c])})}{${polyTex([g, 0, e])}}`, kind: art, f: (x) => ((a * x + b) * (c * x * x + d)) / (e * x * x + g),
          hints: [`Multipliziere den Zähler aus – wichtig ist nur die höchste Potenz: ${tex(`${par(a)}x\\cdot${par(c)}x^{2}=${ft(a * c)}x^{3}`)}.`, 'Der Zähler hat den Grad 3, der Nenner nur den Grad 2: Der Bruch wächst über alle Grenzen.', `Das Vorzeichen: Ausklammern von ${tex('x^{2}')} zeigt ${tex(`f(x)\\approx\\dfrac{${ft(a * c)}}{${ft(e)}}\\,x`)}.`],
          explain: `Zählergrad 3, Nennergrad 2: ${tex(`f(x)\\approx\\dfrac{${ft(a * c)}x^{3}}{${ft(e)}x^{2}}=${a2Bruch(a * c, e)}\\,x\\to${a * c * e > 0 ? '' : '-'}\\infty`)}.` },
        [{ ...inf(a * c * e), correct: true }, inf(-a * c * e, `Achte auf die Vorzeichen: ${tex(`\\dfrac{${ft(a * c)}}{${ft(e)}}`)} ist ${a * c * e > 0 ? 'positiv' : 'negativ'}.`), Z(a * c, e, 'Das Verhältnis der Leitkoeffizienten gilt nur bei gleichem Grad – der Zähler hat ausmultipliziert den Grad 3.'), Z(0, 1, 'Der Zähler hat ausmultipliziert den höheren Grad und wächst schneller.')]);
      }
    } else {
      const art = pick(['e2', 'ek', 'dominanz', 'gemischt', 'wurzeldiff', 'epot']);
      const a = nz([2, 3, -2, 4, 5, -6]), b = nz([1, -3, 4, -5, 7]), c = nz([2, 3, -4, 5]), d = nz([1, -1, 6, -2, 3]);
      const T = (v, t) => `${a2Koef(v)}${t}`;
      if (art === 'e2') {
        if (c + d === 0 || Math.abs(a) === Math.abs(c)) continue;
        r = fertig({ formula: `f(x)=\\dfrac{${T(a, 'e^{2x}')}${a2Mit(b, 'e^{x}')}}{${T(c, 'e^{2x}')}${a2Pm(d)}}`, kind: art, f: (x) => (a + b * Math.exp(-x)) / (c + d * Math.exp(-2 * x)),
          hints: [`Zähler und Nenner wachsen beide über alle Grenzen – so sieht man nichts. Klammere die am stärksten wachsende Potenz ${tex('e^{2x}')} aus (Ausklammern) und kürze.`, `${tex(`f(x)=\\dfrac{${ft(a)}${a2Mit(b, 'e^{-x}')}}{${ft(c)}${a2Mit(d, 'e^{-2x}')}}`)}.`, `Für ${tex('x\\to\\infty')} gilt ${tex('e^{-x}\\to0')} und ${tex('e^{-2x}\\to0')}.`, `Übrig bleibt ${tex(`\\dfrac{${ft(a)}}{${ft(c)}}`)}.`],
          explain: `Ausklammern von ${tex('e^{2x}')}: ${tex(`f(x)=\\dfrac{${ft(a)}${a2Mit(b, 'e^{-x}')}}{${ft(c)}${a2Mit(d, 'e^{-2x}')}}\\to\\dfrac{${ft(a)}+0}{${ft(c)}+0}=${a2Bruch(a, c)}`)}.` },
        [{ ...Z(a, c), correct: true }, inf(a * c, `Zähler und Nenner wachsen beide wie ${tex('e^{2x}')} – der Bruch bleibt beschränkt.`), Z(a + b, c + d, `Das ist der Wert an der Stelle ${tex('x=0')}, nicht das Verhalten für große x.`), Z(0, 1, `Der Nenner wächst nicht schneller als der Zähler: In beiden steht ${tex('e^{2x}')}.`)]);
      } else if (art === 'ek') {
        if (c + d === 0 || Math.abs(a) === Math.abs(c)) continue;
        r = fertig({ formula: `f_k(x)=\\dfrac{${T(a, 'e^{kx}')}${a2Pm(b)}}{${T(c, 'e^{kx}')}${a2Pm(d)}}`, zus: ` (${tex('k>0')})`, kind: art, f: (x) => (a + b * Math.exp(-A2_K0 * x)) / (c + d * Math.exp(-A2_K0 * x)),
          hints: [`Wegen ${tex('k>0')} wächst ${tex('e^{kx}')} über alle Grenzen. Klammere ${tex('e^{kx}')} aus (Ausklammern) und kürze.`, `${tex(`f_k(x)=\\dfrac{${ft(a)}${a2Mit(b, 'e^{-kx}')}}{${ft(c)}${a2Mit(d, 'e^{-kx}')}}`)}.`, `Für ${tex('x\\to\\infty')} gilt ${tex('e^{-kx}\\to0')} (weil ${tex('k>0')}).`, `Übrig bleibt ${tex(`\\dfrac{${ft(a)}}{${ft(c)}}`)} – unabhängig von k.`],
          explain: `Ausklammern von ${tex('e^{kx}')}: ${tex(`f_k(x)=\\dfrac{${ft(a)}${a2Mit(b, 'e^{-kx}')}}{${ft(c)}${a2Mit(d, 'e^{-kx}')}}\\to${a2Bruch(a, c)}`)}, weil ${tex('e^{-kx}\\to0')} für ${tex('k>0')}.` },
        [{ ...Z(a, c), correct: true }, Z(b, d, `Das wäre das Verhalten für ${tex('x\\to-\\infty')}: Dort geht ${tex('e^{kx}')} gegen 0. Für ${tex('x\\to\\infty')} wächst ${tex('e^{kx}')}.`), inf(a * c, `Zähler und Nenner wachsen beide wie ${tex('e^{kx}')} – der Bruch bleibt beschränkt.`), Z(a + b, c + d, `Das ist der Wert an der Stelle ${tex('x=0')}, nicht das Verhalten für große x.`)]);
      } else if (art === 'dominanz') {
        const k = pick([1, 2, 0.5]), E = `e^{-${a2Koef(k)}x}`, En = `e^{${a2Koef(k)}x}`;
        r = fertig({ formula: `f(x)=(${polyTex([0, b, a])})\\cdot ${E}`, kind: art, f: (x) => (a * x * x + b * x) * Math.exp(-k * x),
          hints: [`Hier wächst ein Faktor über alle Grenzen und der andere geht gegen 0 – „${tex('\\infty\\cdot0')}“ ist nicht entscheidbar, ohne umzuformen.`, `Schreibe als Bruch: ${tex(`f(x)=\\dfrac{${polyTex([0, b, a])}}{${En}}`)}.`, `Die e-Funktion wächst schneller als jede Potenz von x: ${tex(`\\dfrac{x^{2}}{${En}}\\to0`)}.`, `Also geht der ganze Term gegen 0.`],
          explain: `${tex(`f(x)=\\dfrac{${polyTex([0, b, a])}}{${En}}\\to0`)}: Die e-Funktion im Nenner wächst schneller als jede Potenz im Zähler.` },
        [{ ...Z(0, 1), correct: true }, inf(a, `${tex(En)} im Nenner wächst schneller als ${tex('x^{2}')} im Zähler – der Bruch wird beliebig klein.`), inf(-a, `Der Term geht nicht gegen unendlich: ${tex(E)} fällt schneller, als ${tex('x^{2}')} wächst.`), Z(a, 1, `Der Leitkoeffizient ${tex(ft(a))} hilft hier nicht: Es gibt keinen Nenner mit gleichem Grad, sondern den Faktor ${tex(E)}.`)]);
      } else if (art === 'gemischt') {
        if (a * d === b * c || Math.abs(a) === Math.abs(c)) continue;
        r = fertig({ formula: `f(x)=\\dfrac{${T(a, 'x')}${a2Mit(b, 'e^{-x}')}}{${lineTex(c, d)}}`, kind: art, f: (x) => (a * x + b * Math.exp(-x)) / (c * x + d),
          hints: [`${tex('e^{-x}\\to0')} für ${tex('x\\to\\infty')} – dieser Summand spielt für große x keine Rolle.`, `Ausklammern von x: ${tex(`f(x)=\\dfrac{${ft(a)}${a2Mit(b, '\\tfrac{e^{-x}}{x}')}}{${ft(c)}${a2Mit(d, '\\tfrac{1}{x}')}}`)}.`, `Beide Zusätze gehen gegen 0. Übrig bleibt ${tex(`\\dfrac{${ft(a)}}{${ft(c)}}`)}.`],
          explain: `Ausklammern von x: ${tex(`f(x)=\\dfrac{${ft(a)}${a2Mit(b, '\\tfrac{e^{-x}}{x}')}}{${ft(c)}${a2Mit(d, '\\tfrac{1}{x}')}}\\to${a2Bruch(a, c)}`)}.` },
        [{ ...Z(a, c), correct: true }, Z(b, d, `Das ist der Wert an der Stelle ${tex('x=0')}, nicht das Verhalten für große x.`), inf(a * c, 'Zähler und Nenner wachsen beide wie x – der Bruch bleibt beschränkt.'), Z(0, 1, `Nur der Summand mit ${tex('e^{-x}')} geht gegen 0 – der Summand ${tex(`${ft(a)}x`)} wächst weiter.`)]);
      } else if (art === 'wurzeldiff') {
        const s = pick([1, 3, 5, 6, 7, 9, 10]);
        r = fertig({ formula: `f(x)=x\\cdot\\bigl(\\sqrt{x^{2}+${s}}-x\\bigr)`, kind: art, f: (x) => (s * x) / (Math.sqrt(x * x + s) + x),
          hints: [`Die Klammer geht gegen 0, der Faktor x wächst – das lässt sich so nicht entscheiden. Erweitern mit ${tex(`\\sqrt{x^{2}+${s}}+x`)} (dritte binomische Formel).`,
            `${tex(`f(x)=\\dfrac{x\\cdot(x^{2}+${s}-x^{2})}{\\sqrt{x^{2}+${s}}+x}=\\dfrac{${a2Koef(s)}x}{\\sqrt{x^{2}+${s}}+x}`)}.`,
            `Ausklammern von x im Nenner: ${tex(`f(x)=\\dfrac{${s}}{\\sqrt{1+\\tfrac{${s}}{x^{2}}}+1}`)}.`, `Für ${tex('x\\to\\infty')} wird die Wurzel zu 1: ${tex(`\\dfrac{${s}}{1+1}`)}.`],
          explain: `Erweitern mit ${tex(`\\sqrt{x^{2}+${s}}+x`)} (dritte binomische Formel): ${tex(`f(x)=\\dfrac{${a2Koef(s)}x}{\\sqrt{x^{2}+${s}}+x}=\\dfrac{${s}}{\\sqrt{1+\\tfrac{${s}}{x^{2}}}+1}\\to\\dfrac{${s}}{1+1}${s % 2 ? '' : `=${a2Bruch(s, 2)}`}`)}.` },
        [{ ...Z(s, 2), correct: true }, Z(0, 1, 'Die Klammer geht zwar gegen 0, wird aber mit dem wachsenden x multipliziert – das muss man erst umformen.'), inf(1, 'x wächst zwar, aber die Klammer geht gleichzeitig gegen 0 – das muss man erst umformen.'), Z(s, 1, `Im Nenner steht nach dem Erweitern ${tex(`\\sqrt{x^{2}+${s}}+x\\approx2x`)} – der Faktor 2 fehlt.`)]);
      } else {
        if (a * d === b * c || Math.abs(a) === Math.abs(c)) continue;
        r = fertig({ formula: `f(x)=\\dfrac{${T(a, 'e^{x}')}${a2Mit(b, 'x^{2}')}}{${T(c, 'e^{x}')}${a2Mit(d, 'x')}}`, kind: art, f: (x) => (a + b * x * x * Math.exp(-x)) / (c + d * x * Math.exp(-x)),
          hints: [`In Zähler und Nenner wächst ${tex('e^{x}')} am stärksten – schneller als jede Potenz von x. Klammere ${tex('e^{x}')} aus (Ausklammern).`, `${tex(`f(x)=\\dfrac{${ft(a)}${a2Mit(b, '\\tfrac{x^{2}}{e^{x}}')}}{${ft(c)}${a2Mit(d, '\\tfrac{x}{e^{x}}')}}`)}.`, `${tex('\\tfrac{x^{2}}{e^{x}}\\to0')} und ${tex('\\tfrac{x}{e^{x}}\\to0')}, weil die e-Funktion jede Potenz überholt.`, `Übrig bleibt ${tex(`\\dfrac{${ft(a)}}{${ft(c)}}`)}.`],
          explain: `Ausklammern von ${tex('e^{x}')}: ${tex(`f(x)=\\dfrac{${ft(a)}${a2Mit(b, '\\tfrac{x^{2}}{e^{x}}')}}{${ft(c)}${a2Mit(d, '\\tfrac{x}{e^{x}}')}}\\to${a2Bruch(a, c)}`)}, denn die e-Funktion wächst schneller als jede Potenz.` },
        [{ ...Z(a, c), correct: true }, inf(b * d, `Nicht die Potenzen entscheiden: ${tex('e^{x}')} wächst schneller als ${tex('x^{2}')} und ${tex('x')}.`), Z(b, d, `Das ist das Verhältnis der Vorzahlen von ${tex('x^{2}')} und ${tex('x')} – entscheidend sind aber die Summanden mit ${tex('e^{x}')}.`), Z(0, 1, `Zähler und Nenner wachsen beide wie ${tex('e^{x}')} – der Bruch geht nicht gegen 0.`)]);
      }
    }
    if (r) return r;
  }
}

/* ───────────── Analysis: Anwendungen ───────────── */

/** Tangente auf Stufe 5: ln, e-Funktion und Scharen. Liefert die fertige Aufgabe ohne gemischte Antworten. */
function a2TangenteSchwer() {
  const e = Math.E, k = A2_K0, O = (t, val, correct, why) => ({ tex: `t(x)=${t}`, val, correct, why });
  const art = pick(['xlnx', 'x2lnx', 'ex1', 'schar3', 'scharE']);
  if (art === 'xlnx') {
    const a = pick([1, 2, 3, -1, -2]), c = pick([1, -1, 2, -3, 4]), M = 2 * a + c, S = a + c;
    if (M === 0 || S === 0 || S === -a) return null;
    const ft_ = `${a2Koef(a)}x\\cdot\\ln(x)${a2Mit(c, 'x')}`;
    return { art, formula: `f(x)=${ft_}`, x0: e, x0t: 'e', f: (x) => a * x * Math.log(x) + c * x,
      options: [O(`${a2Koef(M)}x${a2Mit(-a, 'e')}`, (x) => M * x - a * e, true),
        O(`${a2Koef(M)}x${a2Mit(S, 'e')}`, (x) => M * x + S * e, false, `Der y-Achsenabschnitt ist nicht ${tex('f(e)')}: Rechne ${tex('b=f(e)-m\\cdot e')}.`),
        O(`${a2Koef(S)}x`, (x) => S * x, false, `Produktregel: ${tex("(x\\cdot\\ln(x))'=\\ln(x)+x\\cdot\\tfrac1x=\\ln(x)+1")} – der Summand 1 fehlt in der Steigung.`),
        O(`${a2Koef(M)}x${a2Mit(a, 'e')}`, (x) => M * x + a * e, false, `Vorzeichen: ${tex(`b=${a2Koef(S)}e-${par(M)}\\cdot e=${a2Koef(-a)}e`)}.`)],
      hints: [`Produktregel: ${tex(`f'(x)=${ft(a)}\\cdot\\ln(x)+${par(a)}x\\cdot\\tfrac1x${a2Pm(c)}=${a2Koef(a)}\\ln(x)${a2Pm(S)}`)}.`,
        `Steigung an der Stelle e (mit ${tex('\\ln(e)=1')}): ${tex(`m=f'(e)=${ft(a)}${a2Pm(S)}=${ft(M)}`)}.`,
        `Berührpunkt: ${tex(`f(e)=${a2Koef(a)}e\\cdot1${a2Mit(c, 'e')}=${a2Koef(S)}e`)}.`,
        `Achsenabschnitt: ${tex(`b=f(e)-m\\cdot e=${a2Koef(S)}e-${par(M)}\\cdot e=${a2Koef(-a)}e`)}.`],
      explain: `Produktregel: ${tex(`f'(x)=${a2Koef(a)}\\ln(x)${a2Pm(S)}`)}, also ${tex(`m=f'(e)=${ft(M)}`)}. Mit ${tex(`f(e)=${a2Koef(S)}e`)} folgt ${tex(`b=${a2Koef(S)}e-${par(M)}\\cdot e=${a2Koef(-a)}e`)} und ${tex(`t(x)=${a2Koef(M)}x${a2Mit(-a, 'e')}`)}.` };
  }
  if (art === 'x2lnx') {
    const a = pick([1, 2, -1, 0.5, 3]);
    const L = (m, b) => `${a2Koef(m)}e\\,x${a2Mit(b, 'e^{2}')}`, V = (m, b) => (x) => m * e * x + b * e * e;
    return { art, formula: `f(x)=${a2Koef(a)}x^{2}\\cdot\\ln(x)`, x0: e, x0t: 'e', f: (x) => a * x * x * Math.log(x),
      options: [O(L(3 * a, -2 * a), V(3 * a, -2 * a), true),
        O(L(3 * a, a), V(3 * a, a), false, `Der y-Achsenabschnitt ist nicht ${tex('f(e)')}: Rechne ${tex('b=f(e)-m\\cdot e')}.`),
        O(L(2 * a, -a), V(2 * a, -a), false, `Produktregel: Der zweite Summand ${tex(`${a2Koef(a)}x^{2}\\cdot\\tfrac1x=${a2Koef(a)}x`)} fehlt in der Steigung.`),
        O(L(3 * a, 2 * a), V(3 * a, 2 * a), false, `Vorzeichen: ${tex(`b=${a2Koef(a)}e^{2}-${par(3 * a)}e\\cdot e=${a2Koef(-2 * a)}e^{2}`)}.`)],
      hints: [`Produktregel: ${tex(`f'(x)=${a2Koef(2 * a)}x\\cdot\\ln(x)${a2Mit(a, 'x^{2}\\cdot\\tfrac1x')}=${a2Koef(2 * a)}x\\ln(x)${a2Mit(a, 'x')}`)}.`,
        `Steigung an der Stelle e (mit ${tex('\\ln(e)=1')}): ${tex(`m=f'(e)=${a2Koef(2 * a)}e${a2Mit(a, 'e')}=${a2Koef(3 * a)}e`)}.`,
        `Berührpunkt: ${tex(`f(e)=${a2Koef(a)}e^{2}\\cdot1=${a2Koef(a)}e^{2}`)}.`,
        `Achsenabschnitt: ${tex(`b=f(e)-m\\cdot e=${a2Koef(a)}e^{2}-${par(3 * a)}e\\cdot e=${a2Koef(-2 * a)}e^{2}`)}.`],
      explain: `Produktregel: ${tex(`f'(x)=${a2Koef(2 * a)}x\\ln(x)${a2Mit(a, 'x')}`)}, also ${tex(`m=f'(e)=${a2Koef(3 * a)}e`)}. Mit ${tex(`f(e)=${a2Koef(a)}e^{2}`)} folgt ${tex(`b=${a2Koef(-2 * a)}e^{2}`)} und ${tex(`t(x)=${L(3 * a, -2 * a)}`)}.` };
  }
  if (art === 'ex1') {
    // f(x) = (a·x + b)·e^{-x} an der Stelle 1: m = -b/e, f(1) = (a+b)/e
    const a = pick([1, 2, 3, -1, -2, 4]), b = pick([1, 2, -1, -3, 3, 5]);
    if (a + b === 0 || a + 2 * b === 0 || 2 * a + b === 0) return null;
    const B = (v) => `\\dfrac{${Math.abs(v)}}{e}`, L = (m, n) => `${m < 0 ? '-' : ''}${B(m)}x${n < 0 ? '-' : '+'}${B(n)}`, V = (m, n) => (x) => (m * x + n) / e;
    const kl = lineTex(a, b);
    return { art, formula: `f(x)=(${kl})\\cdot e^{-x}`, x0: 1, x0t: '1', f: (x) => (a * x + b) * Math.exp(-x),
      options: [O(L(-b, a + 2 * b), V(-b, a + 2 * b), true),
        O(L(a, b), V(a, b), false, `Produktregel: Zur Steigung gehört auch der Summand ${tex(`(${kl})\\cdot(-e^{-x})`)}.`),
        O(L(-b, a + b), V(-b, a + b), false, `Der y-Achsenabschnitt ist nicht ${tex('f(1)')}: Rechne ${tex('b=f(1)-m\\cdot1')}.`),
        O(L(2 * a + b, -a), V(2 * a + b, -a), false, `Kettenregel: ${tex("(e^{-x})'=-e^{-x}")} – das Minuszeichen fehlt.`)],
      hints: [`Produktregel und Kettenregel: ${tex(`f'(x)=${ft(a)}\\cdot e^{-x}+(${kl})\\cdot(-e^{-x})=(${lineTex(-a, a - b)})\\cdot e^{-x}`)}.`,
        `Steigung: ${tex(`m=f'(1)=${par(-b)}\\cdot e^{-1}=${-b < 0 ? '-' : ''}${B(b)}`)}.`,
        `Berührpunkt: ${tex(`f(1)=${par(a + b)}\\cdot e^{-1}=${a + b < 0 ? '-' : ''}${B(a + b)}`)}.`,
        `Achsenabschnitt: ${tex(`b=f(1)-m\\cdot1=\\dfrac{${ft(a + b)}-${par(-b)}}{e}=${a + 2 * b < 0 ? '-' : ''}${B(a + 2 * b)}`)}.`],
      explain: `Produktregel und Kettenregel: ${tex(`f'(x)=(${lineTex(-a, a - b)})\\cdot e^{-x}`)}, also ${tex(`m=f'(1)=${-b < 0 ? '-' : ''}${B(b)}`)}. Mit ${tex(`f(1)=${a + b < 0 ? '-' : ''}${B(a + b)}`)} folgt ${tex(`t(x)=${L(-b, a + 2 * b)}`)}.` };
  }
  if (art === 'schar3') {
    // f_k(x) = x³ - a·k·x² an der Stelle a·k
    const a = pick([1, 2, 3]), x0 = a * k, A2 = a * a, A3 = a ** 3, xt = `${a2Koef(a)}k`;
    const L = (m, b) => `${a2Koef(m)}k^{2}x${a2Mit(b, 'k^{3}')}`, V = (m, b) => (x) => m * k * k * x + b * k ** 3;
    return { art, formula: `f_k(x)=x^{3}-${a2Koef(a)}k\\,x^{2}`, x0, x0t: xt, zus: ` (${tex('k>0')})`, f: (x) => x ** 3 - a * k * x * x,
      options: [O(L(A2, -A3), V(A2, -A3), true),
        O(L(3 * A2, -3 * A3), V(3 * A2, -3 * A3), false, `In der Steigung fehlt der zweite Summand: ${tex(`f_k'(x)=3x^{2}-${2 * a}k\\,x`)}.`),
        O(L(A2, A3), V(A2, A3), false, `Vorzeichen: ${tex(`b=f_k(${xt})-m\\cdot ${xt}=0-${A3 === 1 ? '' : A3}k^{3}`)}.`),
        O(L(A2, 0), V(A2, 0), false, `Der y-Achsenabschnitt ist nicht ${tex(`f_k(${xt})=0`)}: Rechne ${tex('b=f_k(x_0)-m\\cdot x_0')}.`)],
      hints: [`Leite nach x ab – k ist eine feste Zahl: ${tex(`f_k'(x)=3x^{2}-${2 * a}k\\,x`)}.`,
        `Steigung: ${tex(`m=f_k'(${xt})=3\\cdot${A2}k^{2}-${2 * a}k\\cdot ${xt}=${3 * A2}k^{2}-${2 * A2}k^{2}=${a2Koef(A2)}k^{2}`)}.`,
        `Berührpunkt: ${tex(`f_k(${xt})=${a2Koef(A3)}k^{3}-${a2Koef(a)}k\\cdot${a2Koef(A2)}k^{2}=0`)}.`,
        `Achsenabschnitt: ${tex(`b=0-${a2Koef(A2)}k^{2}\\cdot ${xt}=-${a2Koef(A3)}k^{3}`)}.`],
      explain: `${tex(`f_k'(x)=3x^{2}-${2 * a}k\\,x`)}, also ${tex(`m=f_k'(${xt})=${a2Koef(A2)}k^{2}`)}. Mit ${tex(`f_k(${xt})=0`)} folgt ${tex(`b=-${a2Koef(A3)}k^{3}`)} und ${tex(`t(x)=${L(A2, -A3)}`)}.` };
  }
  // f_k(x) = a·x·e^{k·x} an der Stelle 1/k: m = 2a·e, f(1/k) = a·e/k
  const a = pick([1, 2, 3, 5]), A = a2Koef(a), B = (v) => `\\dfrac{${a2Koef(v)}e}{k}`;
  return { art, formula: `f_k(x)=${A}x\\cdot e^{kx}`, x0: 1 / k, x0t: '\\dfrac{1}{k}', zus: ` (${tex('k>0')})`, f: (x) => a * x * Math.exp(k * x),
    options: [O(`${2 * a}e\\,x-${B(a)}`, (x) => 2 * a * e * x - (a * e) / k, true),
      O(`${A}e\\,x`, (x) => a * e * x, false, `Produktregel: In der Steigung fehlt der zweite Summand ${tex(`${A}x\\cdot k\\cdot e^{kx}`)}.`),
      O(`${2 * a}e\\,x+${B(a)}`, (x) => 2 * a * e * x + (a * e) / k, false, `Der y-Achsenabschnitt ist nicht ${tex(`f_k(\\tfrac1k)=${B(a)}`)}: Rechne ${tex('b=f_k(x_0)-m\\cdot x_0')}.`),
      O(`${2 * a}e\\,x-${A}k\\,e`, (x) => 2 * a * e * x - a * k * e, false, `${tex(`m\\cdot x_0=${2 * a}e\\cdot\\tfrac1k`)} – geteilt durch k, nicht mal k.`)],
    hints: [`Produktregel und Kettenregel (k ist eine feste Zahl): ${tex(`f_k'(x)=${ft(a)}\\cdot e^{kx}+${A}x\\cdot k\\cdot e^{kx}=${ft(a)}\\cdot(1+kx)\\cdot e^{kx}`)}.`,
      `Steigung: ${tex(`m=f_k'(\\tfrac1k)=${ft(a)}\\cdot(1+1)\\cdot e^{1}=${2 * a}e`)}.`,
      `Berührpunkt: ${tex(`f_k(\\tfrac1k)=${A}\\tfrac1k\\cdot e^{1}=${B(a)}`)}.`,
      `Achsenabschnitt: ${tex(`b=${B(a)}-${2 * a}e\\cdot\\dfrac1k=-${B(a)}`)}.`],
    explain: `Produktregel und Kettenregel: ${tex(`f_k'(x)=${ft(a)}\\cdot(1+kx)\\cdot e^{kx}`)}, also ${tex(`m=${2 * a}e`)}. Mit ${tex(`f_k(\\tfrac1k)=${B(a)}`)} folgt ${tex(`b=${B(a)}-${2 * a}e\\cdot\\dfrac1k=-${B(a)}`)} und ${tex(`t(x)=${2 * a}e\\,x-${B(a)}`)}.` };
}

/** Gleichung der Tangente an einer Stelle: Stufe 1–3 Polynome, Stufe 4 Kommazahlen oder e-Funktion, Stufe 5 ln, e-Funktion und Scharen. */
export function genTangente(lv = 3) {
  for (;;) {
    if (lv >= 5) {
      const q = a2TangenteSchwer();
      if (!q || !uniq(q.options)) continue;
      const { x0t, zus, art, ...rest } = q;
      return { prompt: `Bestimme die Gleichung der Tangente an den Graphen an der Stelle ${tex(`x_0=${x0t}`)}${zus || ''}.`, ...rest, options: shuffle(q.options), kind: art };
    }
    const mk = (M, B, correct, why) => ({ tex: `t(x)=${lineTex(M, B)}`, correct, why, val: (x) => M * x + B });
    if (lv === 4 && rand() < 0.5) {
      // f(x) = (a·x + b)·e^{c·x} an der Stelle 0
      const a = pick([1, 2, 3, -1, -2]), b = pick([1, 2, -2, 3, 4, -5]), c = pick([2, -1, -2, 3]), m = a + b * c, kl = lineTex(a, b), E = `e^{${a2Koef(c)}x}`;
      const opts = [mk(m, b, true),
        mk(a * c, b, false, `Das ist ${tex("u'\\cdot v'")}. Produktregel: ${tex("u'v+uv'")}.`),
        mk(a, b, false, `Der zweite Summand der Produktregel fehlt: ${tex(`(${kl})\\cdot${par(c)}\\cdot ${E}`)}.`),
        mk(b, m, false, 'Steigung und y-Achsenabschnitt sind vertauscht.')];
      if (m === 0 || !uniq(opts)) continue;
      return {
        prompt: `Bestimme die Gleichung der Tangente an den Graphen an der Stelle ${tex('x_0=0')}.`,
        formula: `f(x)=(${kl})\\cdot ${E}`,
        options: shuffle(opts),
        hints: [`Produktregel und Kettenregel: ${tex(`f'(x)=${ft(a)}\\cdot ${E}+(${kl})\\cdot${par(c)}\\cdot ${E}`)}.`,
          `Steigung (mit ${tex('e^{0}=1')}): ${tex(`m=f'(0)=${ft(a)}+${par(b)}\\cdot${par(c)}=${ft(m)}`)}.`,
          `Berührpunkt: ${tex(`f(0)=${par(b)}\\cdot e^{0}=${ft(b)}`)}. An der Stelle 0 ist das zugleich der y-Achsenabschnitt.`],
        explain: `Produktregel und Kettenregel: ${tex(`f'(x)=${ft(a)}\\cdot ${E}+(${kl})\\cdot${par(c)}\\cdot ${E}`)}, also ${tex(`m=f'(0)=${ft(m)}`)}. Mit ${tex(`f(0)=${ft(b)}`)} folgt ${tex(`t(x)=${lineTex(m, b)}`)}.`,
        f: (x) => (a * x + b) * Math.exp(c * x), x0: 0, kind: 'e0',
      };
    }
    const coef = lv <= 1 ? [pick([0, 1, 3]), 0, pick([1, 2])]
      : lv === 2 ? [pick([0, 1, -2, 3]), pick([-2, 3, -4, 1]), pick([1, 2, -1])]
        : lv === 3 ? [pick([0, 1, -3]), pick([0, -2, 3, -4]), pick([0, 1, -3]), pick([1, -1, 2])]
          : [pick([1, -3, 2]), pick([2, -4, 3]), pick([0, -3, 1.5]), pick([0, 0.5]), 0];
    if (lv === 4) { if (coef[3] === 0) coef[4] = 0.5; else if (rand() < 0.5) { coef[4] = 0.25; coef[2] = 0; } }
    while (coef.length > 1 && coef[coef.length - 1] === 0) coef.pop();
    const x0 = pick(tier(lv, [1, 2], [1, 2, -1, 3], [1, 2, -1, -2], [2, -2, 3, 4]));
    const d = polyDeriv(coef), y0 = polyEval(coef, x0), m = polyEval(d, x0), b = y0 - m * x0;
    if (m === 0 || m === y0) continue;
    const opts = [
      mk(m, b, true),
      mk(m, y0, false, `Der y-Achsenabschnitt ist nicht ${tex('f(x_0)')}: Rechne ${tex('b=f(x_0)-m\\cdot x_0')}.`),
      mk(y0, y0 - y0 * x0, false, `Die Steigung ist ${tex("f'(x_0)")}, nicht ${tex('f(x_0)')}.`),
      mk(m, y0 + m * x0, false, `Vorzeichen: ${tex('b=f(x_0)-m\\cdot x_0')}.`),
    ];
    if (!uniq(opts)) continue;
    const s1 = `Steigung: ${tex(`f'(x)=${polyTex(d)}`)}, also ${tex(`m=f'(${x0})=${ft(m)}`)}.`, s2 = `Berührpunkt: ${tex(`f(${x0})=${ft(y0)}`)}.`;
    const s3 = `Setze in ${tex('y=m\\,x+b')} ein: ${tex(`${ft(y0)}=${par(m)}\\cdot${par(x0)}+b`)}, also ${tex(`b=${ft(y0)}-${par(m * x0)}=${ft(b)}`)}.`;
    return {
      prompt: `Bestimme die Gleichung der Tangente an den Graphen an der Stelle ${tex(`x_0=${x0}`)}.`,
      formula: `f(x)=${polyTex(coef)}`,
      options: shuffle(opts),
      hints: lv <= 1 ? [`${s1} ${s2}`, `${tex(`b=f(${x0})-m\\cdot${par(x0)}=${ft(b)}`)}.`] : lv === 2 ? [s1, s2, `${tex(`b=f(${x0})-m\\cdot${par(x0)}=${ft(y0)}-${par(m)}\\cdot${par(x0)}=${ft(b)}`)}.`] : [s1, s2, s3, `Kontrolle: ${tex(`t(${x0})=${par(m)}\\cdot${par(x0)}${a2Pm(b)}=${ft(y0)}=f(${x0})`)}.`],
      explain: `${tex(`m=f'(${x0})=${ft(m)}`)}, ${tex(`f(${x0})=${ft(y0)}`)}, also ${tex(`b=${ft(y0)}-${par(m)}\\cdot${par(x0)}=${ft(b)}`)} und ${tex(`t(x)=${lineTex(m, b)}`)}.`,
      f: (x) => polyEval(coef, x), x0, kind: 'polynom',
    };
  }
}

const COND = (k, x, y) => ({ f: `f(${ft(x)})=${ft(y)}`, f1: `f'(${ft(x)})=${ft(y)}`, f2: `f''(${ft(x)})=${ft(y)}` }[k]);

/**
 * Steckbrief ab Stufe 3: Aus zwei Bedingungen die Funktion bestimmen (zwei Unbekannte).
 * Stufe 3: f(x) = x³ + b·x² + c · Stufe 4: f(x) = a·x³ + b·x² · Stufe 5: f(x) = (a·x + b)·e^{k·x}.
 * Jeder Ablenker ist die Funktion, die aus einer typischen falschen Bedingung folgt (in conds vermerkt).
 */
function a2SteckbriefFunktion(lv) {
  const ORD = { f: 0, f1: 1, f2: 2 };
  for (;;) {
    const kind = pick(['extrem', 'wende', 'tangente']);
    const k = lv >= 5 ? pick([1, -1, 0.5, -0.5]) : 0;
    const x0 = lv === 3 ? pick([-3, -2, -1, 1, 2, 3]) : lv === 4 ? pick([-2, -1, 1, 2]) : pick([-2, -1, 1, 2, 3]);
    // Zeile der Gleichung für die Unbekannten (u, v) und der bekannte Anteil g – je nach Ableitungs-Ordnung
    const zeile = lv === 3 ? [[x0 * x0, 1], [2 * x0, 0], [2, 0]] : lv === 4 ? [[x0 ** 3, x0 * x0], [3 * x0 * x0, 2 * x0], [6 * x0, 2]] : [[x0, 1], [1 + k * x0, k], [2 * k + k * k * x0, k * k]];
    const gx = lv === 4 ? pick([-4, -3, -2, 2, 3, 5]) : 0;   // Stufe 4: bekannter Summand g·x im Ansatz
    const fest = lv === 3 ? [x0 ** 3, 3 * x0 * x0, 6 * x0] : [gx * x0, gx, 0];
    const loese = (c1, c2) => {
      const [r1, r2] = [zeile[ORD[c1[0]]], zeile[ORD[c2[0]]]], y1 = c1[2] - fest[ORD[c1[0]]], y2 = c2[2] - fest[ORD[c2[0]]], det = r1[0] * r2[1] - r1[1] * r2[0];
      return Math.abs(det) < 1e-9 ? null : [(y1 * r2[1] - r1[1] * y2) / det, (r1[0] * y2 - y1 * r2[0]) / det];
    };
    // Vorgaben würfeln: y0 = Funktionswert, m = Steigung (auf Stufe 5 jeweils als Vielfaches von e^{k·x0}), n = Achsenabschnitt der Tangente
    let y0, m = 0, n = 0;
    if (lv === 3) { const j = pick([-3, -2, -1, 1, 2, 3, 4]); y0 = x0 * j; if (kind === 'tangente') { m = x0 * pick([-2, -1, 1, 2, 3]); n = x0 * pick([-2, -1, 1, 2]); y0 = m * x0 + n; } }
    else if (lv === 4) {
      const a = pick([0.5, -0.5, 1, -1, 2, -2, 0.25]), b = kind === 'extrem' ? -(3 * a * x0 * x0 + gx) / (2 * x0) : kind === 'wende' ? -3 * a * x0 : pick([-3, -2, -1, 1, 2, 3, 1.5]);
      y0 = a * x0 ** 3 + b * x0 * x0 + gx * x0; m = 3 * a * x0 * x0 + 2 * b * x0 + gx; n = y0 - m * x0;
    } else { y0 = pick([-4, -3, -2, 2, 3, 4, 6]); if (kind === 'tangente') m = pick([-3, -2, -1, 1, 2, 5]); }
    if (y0 === 0 || ![y0, m, n].every((w) => a2Ganz(w, 4)) || (kind === 'tangente' && (m === 0 || m === y0 || (lv < 5 && (n === 0 || n === y0))))) continue;
    const C = {
      extrem: [[['f', x0, y0], ['f1', x0, 0]], [['f', x0, y0], ['f2', x0, 0]], [['f1', x0, y0], ['f', x0, 0]], [['f', x0, y0], ['f1', x0, y0]]],
      wende: [[['f', x0, y0], ['f2', x0, 0]], [['f', x0, y0], ['f1', x0, 0]], [['f2', x0, y0], ['f', x0, 0]], [['f', x0, y0], ['f2', x0, y0]]],
      tangente: [[['f', x0, y0], ['f1', x0, m]], [['f', x0, m], ['f1', x0, y0]], [['f', x0, y0], ['f2', x0, m]], lv >= 5 ? [['f1', x0, y0], ['f2', x0, m]] : [['f', x0, n], ['f1', x0, m]]],
    }[kind];
    const L = C.map((c) => loese(c[0], c[1]));
    const teil = lv === 3 ? 2 : 4;
    if (L.some((l) => !l || !l.every((v) => a2Ganz(v, teil) && Math.abs(v) <= 60)) || L[0][0] === 0 || L.some((l) => l[0] === 0 && l[1] === 0)) continue;
    if (L.some((l, i) => L.some((o, j) => i < j && Math.abs(l[0] - o[0]) < 1e-9 && Math.abs(l[1] - o[1]) < 1e-9))) continue;
    const E = lv >= 5 ? `e^{${a2Koef(k)}x}` : '', eh = lv >= 5 ? a2Eh(k * x0) : '';
    const fTex = ([u, v]) => (lv === 3 ? polyTex([v, 0, u, 1]) : lv === 4 ? polyTex([0, gx, v, u]) : `${u === 0 ? ft(v) : `(${lineTex(u, v)})`}\\cdot ${E}`);
    const fVal = ([u, v]) => (lv === 3 ? (x) => x ** 3 + u * x * x + v : lv === 4 ? (x) => u * x ** 3 + v * x * x + gx * x : (x) => (u * x + v) * Math.exp(k * x));
    const wert = (c) => (lv >= 5 ? (c === 0 ? '0' : `${a2Koef(c)}${eh}`) : ft(c));   // Zahl der Vorgabe als LaTeX
    const bed = (c) => ({ f: `f(${ft(c[1])})`, f1: `f'(${ft(c[1])})`, f2: `f''(${ft(c[1])})` }[c[0]] + `=${wert(c[2])}`);
    const [u, v] = L[0];
    // Hoch- oder Tiefpunkt? Zweite Ableitung der richtigen Funktion an der Stelle x0
    const kr = lv === 3 ? 6 * x0 + 2 * u : lv === 4 ? 6 * u * x0 + 2 * v : 2 * u * k + k * k * (u * x0 + v);
    if (kind === 'extrem' && Math.abs(kr) < 1e-9) continue;
    const hoch = kr < 0, pkt = (name) => `${name}(${ft(x0)}\\mid ${wert(y0)})`;
    const text = kind === 'extrem' ? `Der Graph hat den ${hoch ? 'Hochpunkt' : 'Tiefpunkt'} ${tex(pkt(hoch ? 'H' : 'T'))}.`
      : kind === 'wende' ? `Der Graph hat den Wendepunkt ${tex(pkt('W'))}.`
        : lv >= 5 ? `Der Graph verläuft durch ${tex(pkt('P'))} und hat dort die Steigung ${tex(wert(m))}.`
          : `Die Tangente an den Graphen an der Stelle ${tex(`x_0=${ft(x0)}`)} hat die Gleichung ${tex(`t(x)=${lineTex(m, n)}`)}.`;
    const W = {
      extrem: [`Hier wurde ${tex(bed(C[1][1]))} angesetzt – das gehört zu einem Wendepunkt. Am Extrempunkt gilt ${tex(bed(C[0][1]))}.`, `Punkt und Steigung sind vertauscht: Angesetzt wurde ${tex(bed(C[2][1]))} und ${tex(bed(C[2][0]))}.`, `Hier wurde ${tex(bed(C[3][1]))} angesetzt. Am Extrempunkt ist die Steigung 0 – ${tex(wert(y0))} ist der Funktionswert.`],
      wende: [`Hier wurde ${tex(bed(C[1][1]))} angesetzt – das gehört zu einem Extrempunkt. Am Wendepunkt gilt ${tex(bed(C[0][1]))}.`, `Vertauscht: Angesetzt wurde ${tex(bed(C[2][1]))} und ${tex(bed(C[2][0]))}.`, `Hier wurde ${tex(bed(C[3][1]))} angesetzt. Am Wendepunkt ist die zweite Ableitung 0 – ${tex(wert(y0))} ist der Funktionswert.`],
      tangente: [`Funktionswert und Steigung sind vertauscht: Angesetzt wurde ${tex(bed(C[1][0]))} und ${tex(bed(C[1][1]))}.`, `Die Steigung ist die <b>erste</b> Ableitung – hier wurde ${tex(bed(C[2][1]))} angesetzt.`, lv >= 5 ? `Beide Bedingungen sind um eine Ableitung verrutscht: Angesetzt wurde ${tex(bed(C[3][0]))} und ${tex(bed(C[3][1]))}.` : `Der Funktionswert ist ${tex(`t(${ft(x0)})=${ft(y0)}`)}, nicht der y-Achsenabschnitt ${tex(ft(n))} der Tangente.`],
    }[kind];
    const opts = L.map((l, i) => ({ tex: `f(x)=${fTex(l)}`, conds: C[i].map((c) => c.join(':')), val: fVal(l), correct: i === 0, why: i ? W[i - 1] : undefined }));
    if (!uniq(opts)) continue;
    const ansatz = lv === 3 ? 'f(x)=x^{3}+bx^{2}+c' : lv === 4 ? `f(x)=ax^{3}+bx^{2}${a2Mit(gx, 'x')}` : `f(x)=(ax+b)\\cdot ${E}`;
    const abl = lv === 3 ? ["f'(x)=3x^{2}+2bx", "f''(x)=6x+2b"] : lv === 4 ? [`f'(x)=3ax^{2}+2bx${a2Pm(gx)}`, "f''(x)=6ax+2b"]
      : [`f'(x)=\\bigl(a${a2Mit(k, '(ax+b)')}\\bigr)\\cdot ${E}`, `f''(x)=\\bigl(${a2Koef(2 * k)}a${a2Mit(k * k, '(ax+b)')}\\bigr)\\cdot ${E}`];
    const [n1, n2] = lv === 3 ? ['b', 'c'] : ['a', 'b'];
    const gl = (c) => { const o = ORD[c[0]], r = zeile[o], links = `${r[0] === 0 ? '' : `${a2Koef(r[0])}${n1}`}${r[0] === 0 ? a2Mit(r[1], n2).replace(/^\+/, '') : a2Mit(r[1], n2)}`; return `${links || '0'}=${ft(c[2] - fest[o])}`; };
    const [c1, c2] = C[0], zweite = c2[0] === 'f2';
    const hints = [
      `Übersetze den Text in zwei Bedingungen: ${tex(bed(c1))} und ${tex(bed(c2))}${kind === 'tangente' && lv < 5 ? ` (denn ${tex(`t(${ft(x0)})=${par(m)}\\cdot${par(x0)}${a2Pm(n)}=${ft(y0)}`)})` : ''}.`,
      lv >= 5 ? `Ableiten mit Produktregel und Kettenregel: ${tex(abl[0])}${zweite ? ` und ${tex(abl[1])}` : ''}.` : `Ableitung${zweite ? 'en' : ''} des Ansatzes: ${tex(abl[0])}${zweite ? ` und ${tex(abl[1])}` : ''}.`,
      `Einsetzen von ${tex(`x=${ft(x0)}`)}${lv >= 5 ? ` und Teilen durch ${tex(eh)}` : ''} ergibt zwei Gleichungen: ${tex(gl(c1))} und ${tex(gl(c2))}.`,
      `Lösen: ${tex(`${n1}=${ft(u)}`)} und ${tex(`${n2}=${ft(v)}`)}.`,
    ];
    if (lv >= 4) hints.push(`Probe: ${tex(`f(${ft(x0)})${lv >= 5 ? `=${par(u * x0 + v)}\\cdot ${eh}` : `=${ft(fVal(L[0])(x0))}`}`)} – das passt zur ersten Bedingung.`);
    return {
      prompt: `${text} Bestimme die Funktion.`,
      formula: ansatz,
      options: shuffle(opts), hints,
      explain: `Bedingungen: ${tex(bed(c1))} und ${tex(bed(c2))}. Eingesetzt in den Ansatz: ${tex(gl(c1))} und ${tex(gl(c2))}. Daraus ${tex(`${n1}=${ft(u)}`)}, ${tex(`${n2}=${ft(v)}`)}, also ${tex(`f(x)=${fTex(L[0])}`)}.`,
      kind, expect: opts.find((o) => o.correct).conds, stufe: 'funktion',
      soll: { x0, y0: lv >= 5 ? y0 * Math.exp(k * x0) : y0, m: lv >= 5 ? m * Math.exp(k * x0) : m },
    };
  }
}

/** Steckbrief: Stufe 1–2 Text in Bedingungen übersetzen, ab Stufe 3 aus den Bedingungen die Funktion bestimmen. */
export function genSteckbrief(lv = 3) {
  if (lv >= 3) return a2SteckbriefFunktion(lv);
  for (;;) {
    const kind = pick(lv <= 1 ? ['extrem', 'extrem', 'wende'] : ['extrem', 'wende', 'tangente']);
    const R = tier(lv, 3, 6);
    const x0 = ri(-R, R), y0 = ri(-R, R), m = ri(-R, R), n = y0 - m * x0;
    if (x0 === y0 || x0 === 0 || y0 === 0 || m === 0 || m === y0 || m === x0 || n === y0 || n === m || n === 0) continue;
    const hoch = rand() < 0.5;
    const O = (conds, correct, why) => ({ tex: conds.map((c) => COND(...c)).join(',\\quad '), conds: conds.map((c) => c.join(':')), correct, why });
    let text, opts, hints;
    if (kind === 'extrem') {
      text = `Der Graph von ${tex('f')} hat den ${hoch ? 'Hochpunkt' : 'Tiefpunkt'} ${tex(pt(hoch ? 'H' : 'T', [x0, y0]))}.`;
      opts = [O([['f', x0, y0], ['f1', x0, 0]], true),
        O([['f', x0, y0], ['f2', x0, 0]], false, `${tex("f''(x_0)=0")} gehört zu einer Wendestelle. Am Extrempunkt ist die <b>erste</b> Ableitung 0.`),
        O([['f', y0, x0], ['f1', x0, 0]], false, 'x- und y-Wert sind vertauscht: Der Punkt liegt bei x = ' + x0 + '.'),
        O([['f1', x0, y0], ['f', x0, 0]], false, `Der Punkt liegt auf dem Graphen, also ${tex(`f(${x0})=${y0}`)}. Die Steigung dort ist 0.`)];
      hints = ['Jeder Punkt auf dem Graphen liefert eine Gleichung für f.', 'Extrempunkt: f′ = 0. Wendepunkt: f″ = 0. Steigung: Wert von f′.'];
    } else if (kind === 'wende') {
      text = `Der Graph von ${tex('f')} hat den Wendepunkt ${tex(pt('W', [x0, y0]))}.`;
      opts = [O([['f', x0, y0], ['f2', x0, 0]], true),
        O([['f', x0, y0], ['f1', x0, 0]], false, `${tex("f'(x_0)=0")} gehört zu einem Extrempunkt. Am Wendepunkt ist die <b>zweite</b> Ableitung 0.`),
        O([['f', y0, x0], ['f2', x0, 0]], false, 'x- und y-Wert sind vertauscht: Der Punkt liegt bei x = ' + x0 + '.'),
        O([['f2', x0, y0], ['f', x0, 0]], false, `Der Punkt liegt auf dem Graphen, also ${tex(`f(${x0})=${y0}`)}. Die zweite Ableitung ist dort 0.`)];
      hints = ['Jeder Punkt auf dem Graphen liefert eine Gleichung für f.', 'Extrempunkt: f′ = 0. Wendepunkt: f″ = 0. Steigung: Wert von f′.'];
    } else {
      text = `Die Tangente an den Graphen von ${tex('f')} an der Stelle ${tex(`x_0=${x0}`)} hat die Gleichung ${tex(`t(x)=${lineTex(m, n)}`)}.`;
      opts = [O([['f', x0, y0], ['f1', x0, m]], true),
        O([['f', x0, n], ['f1', x0, m]], false, `Der Funktionswert ist ${tex(`t(${x0})=${y0}`)}, nicht der y-Achsenabschnitt ${tex(ft(n))} der Tangente.`),
        O([['f', x0, m], ['f1', x0, y0]], false, 'Funktionswert und Steigung sind vertauscht.'),
        O([['f', x0, y0], ['f2', x0, m]], false, 'Die Steigung ist die <b>erste</b> Ableitung.')];
      hints = [`Die Tangente berührt den Graphen an der Stelle ${tex(`x_0=${x0}`)}: gleicher Funktionswert, gleiche Steigung.`, `Steigung der Tangente: ${tex(`m=${ft(m)}`)}, also ${tex(`f'(${x0})=${ft(m)}`)}.`, `Funktionswert: ${tex(`t(${x0})=${par(m)}\\cdot${par(x0)}${a2Pm(n)}=${ft(y0)}`)}, also ${tex(`f(${x0})=${ft(y0)}`)}.`];
    }
    if (!uniq(opts)) continue;
    if (lv >= 2 && kind !== 'tangente') hints.push(`Hier: ${tex(COND('f', x0, y0))}, dazu die ${kind === 'extrem' ? 'erste' : 'zweite'} Ableitung an der Stelle ${tex(`x=${x0}`)} gleich 0.`);
    return {
      prompt: `${text} Welche Bedingungen ergeben sich?`,
      options: shuffle(opts), hints,
      explain: `Die Bedingungen lauten ${tex(opts[0].tex)}.`,
      kind, expect: opts[0].conds,
    };
  }
}

/** Tiefpunkt einer Schar auf Stufe 5: e-Funktion und ln. */
function a2ScharSchwer() {
  const O = (xt, yt, fn, correct, why) => ({ tex: `T\\left(${xt}\\mid ${yt}\\right)`, fn, correct, why });
  const ln = Math.log, ex = Math.exp, art = pick(['xke', 'xekx', 'exkx', 'xklnx', 'ln2', 'x2ln']);
  if (art === 'xke') {
    const a = pick([1, 2, 3]), ak = `${a2Koef(a)}k`;
    return { art, formula: `f_k(x)=(x-${ak})\\cdot e^{x}`, f: (k) => (x) => (x - a * k) * ex(x),
      options: [O(`${ak}-1`, `-e^{${ak}-1}`, (k) => [a * k - 1, -ex(a * k - 1)], true),
        O(ak, '0', (k) => [a * k, 0], false, `Das ist die Nullstelle von ${tex('f_k')}, nicht die von ${tex("f_k'")}.`),
        O(`${ak}-1`, `e^{${ak}-1}`, (k) => [a * k - 1, ex(a * k - 1)], false, `Vorzeichen: ${tex(`f_k(${ak}-1)=(${ak}-1-${ak})\\cdot e^{${ak}-1}=-e^{${ak}-1}`)}.`),
        O(`${ak}+1`, `e^{${ak}+1}`, (k) => [a * k + 1, ex(a * k + 1)], false, `Vorzeichenfehler in der Ableitung: ${tex(`f_k'(x)=(x-${ak}+1)\\cdot e^{x}`)}.`)],
      hints: [`Produktregel (k ist eine feste Zahl): ${tex(`f_k'(x)=1\\cdot e^{x}+(x-${ak})\\cdot e^{x}=(x-${ak}+1)\\cdot e^{x}`)}.`, `${tex('e^{x}>0')}, also ${tex(`x-${ak}+1=0`)} und damit ${tex(`x=${ak}-1`)}.`, `Die Klammer wechselt dort von − nach + (Vorzeichenwechsel): Tiefpunkt.`, `y-Wert: ${tex(`f_k(${ak}-1)=(${ak}-1-${ak})\\cdot e^{${ak}-1}=-e^{${ak}-1}`)}.`],
      explain: `Produktregel: ${tex(`f_k'(x)=(x-${ak}+1)\\cdot e^{x}=0`)} bei ${tex(`x=${ak}-1`)} (Vorzeichenwechsel von − nach +). Einsetzen: ${tex(`T\\left(${ak}-1\\mid -e^{${ak}-1}\\right)`)}.` };
  }
  if (art === 'xekx') {
    const a = pick([1, 2, 3, 4]), A = a2Koef(a);
    return { art, formula: `f_k(x)=${A}x\\cdot e^{kx}`, f: (k) => (x) => a * x * ex(k * x),
      options: [O('-\\dfrac{1}{k}', `-\\dfrac{${a}}{k\\,e}`, (k) => [-1 / k, -a / (k * Math.E)], true),
        O('-k', `-${A}k\\,e^{-k^{2}}`, (k) => [-k, -a * k * ex(-k * k)], false, `Aus ${tex('1+kx=0')} folgt ${tex('x=-\\tfrac1k')}, nicht ${tex('x=-k')}.`),
        O('-\\dfrac{1}{k}', `\\dfrac{${a}}{k\\,e}`, (k) => [-1 / k, a / (k * Math.E)], false, `Vorzeichen: ${tex(`f_k(-\\tfrac1k)=-\\tfrac{${a}}{k}\\cdot e^{-1}`)} ist negativ.`),
        O('\\dfrac{1}{k}', `\\dfrac{${a}e}{k}`, (k) => [1 / k, (a * Math.E) / k], false, `Vorzeichen: Aus ${tex('1+kx=0')} folgt ${tex('x=-\\tfrac1k')}.`)],
      hints: [`Produktregel und Kettenregel: ${tex(`f_k'(x)=${ft(a)}\\cdot e^{kx}+${A}x\\cdot k\\cdot e^{kx}=${ft(a)}\\cdot(1+kx)\\cdot e^{kx}`)}.`, `${tex('e^{kx}>0')}, also ${tex('1+kx=0')} und damit ${tex('x=-\\tfrac1k')}.`, `Für ${tex('k>0')} wechselt ${tex('1+kx')} dort von − nach + (Vorzeichenwechsel): Tiefpunkt.`, `y-Wert: ${tex(`f_k(-\\tfrac1k)=-\\tfrac{${a}}{k}\\cdot e^{k\\cdot(-\\frac1k)}=-\\dfrac{${a}}{k\\,e}`)}.`],
      explain: `Produktregel und Kettenregel: ${tex(`f_k'(x)=${ft(a)}\\cdot(1+kx)\\cdot e^{kx}=0`)} bei ${tex('x=-\\tfrac1k')} (Vorzeichenwechsel von − nach +). Einsetzen: ${tex(`T\\left(-\\dfrac{1}{k}\\mid -\\dfrac{${a}}{k\\,e}\\right)`)}.` };
  }
  if (art === 'exkx') {
    const a = pick([2, 3, 4]), ka = `\\tfrac{k}{${a}}`, xt = `\\tfrac{1}{${a}}\\ln\\left(${ka}\\right)`, yt = `${ka}-${ka}\\ln\\left(${ka}\\right)`;
    return { art, formula: `f_k(x)=e^{${a}x}-k\\,x`, f: (k) => (x) => ex(a * x) - k * x,
      options: [O(xt, yt, (k) => [ln(k / a) / a, k / a - (k / a) * ln(k / a)], true),
        O('\\ln(k)', `k^{${a}}-k\\ln(k)`, (k) => [ln(k), k ** a - k * ln(k)], false, `Kettenregel: ${tex(`f_k'(x)=${a}e^{${a}x}-k`)} – die innere Ableitung ${a} fehlt.`),
        O(xt, ka, (k) => [ln(k / a) / a, k / a], false, `Beim Einsetzen fehlt der zweite Summand ${tex('-k\\,x')}.`),
        O(xt, `${ka}+${ka}\\ln\\left(${ka}\\right)`, (k) => [ln(k / a) / a, k / a + (k / a) * ln(k / a)], false, `Vorzeichen: Der zweite Summand ist ${tex(`-k\\cdot${xt}`)}.`)],
      hints: [`Kettenregel (k ist eine feste Zahl): ${tex(`f_k'(x)=${a}e^{${a}x}-k`)}.`, `${tex("f_k'(x)=0")}: ${tex(`e^{${a}x}=${ka}`)}. Logarithmieren: ${tex(`${a}x=\\ln\\left(${ka}\\right)`)}, also ${tex(`x=${xt}`)}.`, `${tex(`f_k''(x)=${a * a}e^{${a}x}>0`)}: Es ist ein Tiefpunkt.`, `y-Wert mit ${tex(`e^{${a}x}=${ka}`)}: ${tex(`f_k(x)=${ka}-k\\cdot${xt}=${yt}`)}.`],
      explain: `Kettenregel: ${tex(`f_k'(x)=${a}e^{${a}x}-k=0`)} liefert durch Logarithmieren ${tex(`x=${xt}`)}; ${tex(`f_k''(x)=${a * a}e^{${a}x}>0`)}. Einsetzen ergibt den y-Wert ${tex(yt)}.` };
  }
  if (art === 'xklnx') {
    const a = pick([2, 3, 4]), A = a2Koef(a);
    return { art, formula: `f_k(x)=${A}x-k\\cdot\\ln(x)`, f: (k) => (x) => a * x - k * ln(x),
      options: [O(a === 1 ? 'k' : `\\dfrac{k}{${a}}`, a === 1 ? 'k-k\\ln(k)' : `k-k\\ln\\left(\\dfrac{k}{${a}}\\right)`, (k) => [k / a, k - k * ln(k / a)], true),
        O(a === 1 ? '\\dfrac{1}{k}' : `\\dfrac{${a}}{k}`, a === 1 ? '\\dfrac{1}{k}+k\\ln(k)' : `\\dfrac{${a * a}}{k}-k\\ln\\left(\\dfrac{${a}}{k}\\right)`, (k) => [a / k, (a * a) / k - k * ln(a / k)], false, `Aus ${tex(`${ft(a)}-\\tfrac{k}{x}=0`)} folgt ${tex(`x=\\tfrac{k}{${a}}`)} – nicht der Kehrwert.`),
        O(a === 1 ? 'k' : `\\dfrac{k}{${a}}`, 'k', (k) => [k / a, k], false, `Beim Einsetzen fehlt der zweite Summand ${tex('-k\\cdot\\ln(x)')}.`),
        O(a === 1 ? 'k' : `\\dfrac{k}{${a}}`, a === 1 ? 'k+k\\ln(k)' : `k+k\\ln\\left(\\dfrac{k}{${a}}\\right)`, (k) => [k / a, k + k * ln(k / a)], false, `Vorzeichen: Der zweite Summand ist ${tex('-k\\cdot\\ln(x)')}.`)],
      hints: [`Ableiten (k ist eine feste Zahl): ${tex(`f_k'(x)=${ft(a)}-\\dfrac{k}{x}`)}.`, `${tex("f_k'(x)=0")}: ${tex(`${ft(a)}=\\dfrac{k}{x}`)}, also ${tex(`x=\\dfrac{k}{${a}}`)}.`, `${tex("f_k''(x)=\\dfrac{k}{x^{2}}>0")} für ${tex('k>0')}: Es ist ein Tiefpunkt.`, `y-Wert: ${tex(`f_k\\left(\\tfrac{k}{${a}}\\right)=${ft(a)}\\cdot\\tfrac{k}{${a}}-k\\cdot\\ln\\left(\\tfrac{k}{${a}}\\right)`)}.`],
      explain: `${tex(`f_k'(x)=${ft(a)}-\\dfrac{k}{x}=0`)} bei ${tex(`x=\\dfrac{k}{${a}}`)}; ${tex("f_k''(x)=\\dfrac{k}{x^{2}}>0")}. Einsetzen ergibt den y-Wert ${tex(a === 1 ? 'k-k\\ln(k)' : `k-k\\ln\\left(\\dfrac{k}{${a}}\\right)`)}.` };
  }
  if (art === 'ln2') {
    return { art, formula: 'f_k(x)=(\\ln(x))^{2}-2k\\cdot\\ln(x)', f: (k) => (x) => ln(x) ** 2 - 2 * k * ln(x),
      options: [O('e^{k}', '-k^{2}', (k) => [ex(k), -k * k], true),
        O('k', '(\\ln(k))^{2}-2k\\ln(k)', (k) => [k, ln(k) ** 2 - 2 * k * ln(k)], false, `Aus ${tex('\\ln(x)=k')} folgt ${tex('x=e^{k}')}, nicht ${tex('x=k')}.`),
        O('e^{k}', 'k^{2}', (k) => [ex(k), k * k], false, `Einsetzen: ${tex('k^{2}-2k\\cdot k=-k^{2}')}.`),
        O('e^{-k}', '3k^{2}', (k) => [ex(-k), 3 * k * k], false, `Vorzeichen: Aus ${tex('\\ln(x)-k=0')} folgt ${tex('\\ln(x)=k')}.`)],
      hints: [`Kettenregel: ${tex("f_k'(x)=2\\ln(x)\\cdot\\dfrac1x-\\dfrac{2k}{x}=\\dfrac{2\\cdot(\\ln(x)-k)}{x}")}.`, `Ein Bruch ist null, wenn der Zähler null ist: ${tex('\\ln(x)=k')}, also ${tex('x=e^{k}')}.`, `Der Zähler wechselt dort von − nach + (Vorzeichenwechsel): Tiefpunkt.`, `y-Wert mit ${tex('\\ln(e^{k})=k')}: ${tex('f_k(e^{k})=k^{2}-2k\\cdot k=-k^{2}')}.`],
      explain: `Kettenregel: ${tex("f_k'(x)=\\dfrac{2\\cdot(\\ln(x)-k)}{x}=0")} bei ${tex('x=e^{k}')} (Vorzeichenwechsel von − nach +). Einsetzen: ${tex('T\\left(e^{k}\\mid -k^{2}\\right)')}.` };
  }
  return { art, formula: 'f_k(x)=x^{2}-2k^{2}\\cdot\\ln(x)', f: (k) => (x) => x * x - 2 * k * k * ln(x),
    options: [O('k', 'k^{2}-2k^{2}\\ln(k)', (k) => [k, k * k - 2 * k * k * ln(k)], true),
      O('k^{2}', 'k^{4}-4k^{2}\\ln(k)', (k) => [k * k, k ** 4 - 4 * k * k * ln(k)], false, `Aus ${tex('x^{2}=k^{2}')} folgt ${tex('x=k')} (Wurzel ziehen).`),
      O('k', 'k^{2}', (k) => [k, k * k], false, `Beim Einsetzen fehlt der zweite Summand ${tex('-2k^{2}\\cdot\\ln(k)')}.`),
      O('k', 'k^{2}+2k^{2}\\ln(k)', (k) => [k, k * k + 2 * k * k * ln(k)], false, `Vorzeichen: Der zweite Summand ist ${tex('-2k^{2}\\cdot\\ln(x)')}.`)],
    hints: [`Ableiten (k ist eine feste Zahl): ${tex("f_k'(x)=2x-\\dfrac{2k^{2}}{x}")}.`, `${tex("f_k'(x)=0")}: ${tex('2x^{2}=2k^{2}')}, also ${tex('x=k')} (wegen ${tex('x>0')} und ${tex('k>0')}).`, `${tex("f_k''(x)=2+\\dfrac{2k^{2}}{x^{2}}>0")}: Es ist ein Tiefpunkt.`, `y-Wert: ${tex('f_k(k)=k^{2}-2k^{2}\\cdot\\ln(k)')}.`],
    explain: `${tex("f_k'(x)=2x-\\dfrac{2k^{2}}{x}=0")} bei ${tex('x=k')}; ${tex("f_k''(x)>0")}. Einsetzen: ${tex('T\\left(k\\mid k^{2}-2k^{2}\\ln(k)\\right)')}.` };
}

/** Funktionenschar: Tiefpunkt in Abhängigkeit vom Parameter. Stufe 1–3 Parabeln, Stufe 4 dritten Grades, Stufe 5 e-Funktion und ln. */
export function genSchar(lv = 3) {
  const O = (xt, yt, fn, correct, why) => ({ tex: `T(${xt}\\mid ${yt})`, fn, correct, why });
  if (lv >= 5) {
    const { art, ...q } = a2ScharSchwer();
    return { prompt: `Wo liegt der Tiefpunkt des Graphen für ${tex('k>0')}?`, ...q, options: shuffle(q.options), min: true, kind: art };
  }
  if (lv === 4) {
    const c = pick([0, 1, -2, 3, -5]), C = c === 0 ? '' : a2Pm(c);
    if (rand() < 0.5) {
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
        hints: [`Leite nach x ab (k ist eine feste Zahl): ${tex("f_k'(x)=3x^2-3k^2")}.`, `${tex("f_k'(x)=0")}: ${tex('x^2=k^2')}, also ${tex('x=\\pm k')}.`, `${tex("f_k''(x)=6x")}: bei ${tex('x=k')} ist ${tex("f_k''(k)=6k>0")}, also Tiefpunkt.`, `y-Wert: ${tex(`f_k(k)=k^3-3k^2\\cdot k${C}=-2k^3${C}`)}.`],
        explain: `${tex("f_k'(x)=3x^2-3k^2=0")} bei ${tex('x=\\pm k')}; ${tex("f_k''(k)=6k>0")}, also Tiefpunkt ${tex(`T(k\\mid -2k^3${C})`)}.`,
        f, min: true, kind: 'kubisch',
      };
    }
    const a = pick([1, 2]), A = a2Koef(a), a3 = a ** 3, f = (k) => (x) => x ** 3 - 3 * a * k * x * x + c;
    return {
      prompt: `Wo liegt der Tiefpunkt des Graphen für ${tex('k>0')}?`,
      formula: `f_k(x)=x^3-${3 * a}k\\,x^2${C}`,
      options: shuffle([
        O(`${2 * a}k`, `-${4 * a3}k^3${C}`, (k) => [2 * a * k, -4 * a3 * k ** 3 + c], true),
        O('0', c === 0 ? '0' : ft(c), () => [0, c], false, `Das ist der Hochpunkt: ${tex(`f_k''(0)=-${6 * a}k<0`)}.`),
        O(`${A}k`, `-${2 * a3}k^3${C}`, (k) => [a * k, -2 * a3 * k ** 3 + c], false, `Das ist der Wendepunkt (${tex("f_k''(x)=0")}), nicht der Tiefpunkt.`),
        O(`${2 * a}k`, `${4 * a3}k^3${C}`, (k) => [2 * a * k, 4 * a3 * k ** 3 + c], false, `Vorzeichen beim Einsetzen: ${tex(`${8 * a3}k^3-${12 * a3}k^3=-${4 * a3}k^3`)}.`),
      ]),
      hints: [`Leite nach x ab (k ist eine feste Zahl): ${tex(`f_k'(x)=3x^2-${6 * a}k\\,x`)}.`, `Ausklammern: ${tex(`3x\\cdot(x-${2 * a}k)=0`)}, also ${tex('x=0')} oder ${tex(`x=${2 * a}k`)}.`, `${tex(`f_k''(x)=6x-${6 * a}k`)}: bei ${tex(`x=${2 * a}k`)} ist ${tex(`f_k''(${2 * a}k)=${6 * a}k>0`)}, also Tiefpunkt.`, `y-Wert: ${tex(`f_k(${2 * a}k)=${8 * a3}k^3-${3 * a}k\\cdot${4 * a * a}k^2${C}=-${4 * a3}k^3${C}`)}.`],
      explain: `${tex(`f_k'(x)=3x\\cdot(x-${2 * a}k)=0`)} (Ausklammern) bei ${tex('x=0')} und ${tex(`x=${2 * a}k`)}; ${tex(`f_k''(${2 * a}k)=${6 * a}k>0`)}, also Tiefpunkt ${tex(`T(${2 * a}k\\mid -${4 * a3}k^3${C})`)}.`,
      f, min: true, kind: 'kubisch2',
    };
  }
  if (lv === 3) {
    // f_k(x) = a·x² - 2ab·k·x + c·k
    const a = pick([2, 3]), b = pick([1, 2, 3]), c = pick([-4, -3, -1, 1, 2, 5]), B = a2Koef(b), q = a * b * b, ck = `${a2Koef(c)}k`;
    const f = (k) => (x) => a * x * x - 2 * a * b * k * x + c * k;
    return {
      prompt: 'Wo liegt der Tiefpunkt des Graphen?',
      formula: `f_k(x)=${a}x^2-${2 * a * b}k\\,x${a2Mit(c, 'k')}`,
      options: shuffle([
        O(`${B}k`, `${ck}-${q}k^2`, (k) => [b * k, c * k - q * k * k], true),
        O(`-${B}k`, `${ck}-${q}k^2`, (k) => [-b * k, c * k - q * k * k], false, `Vorzeichen: ${tex(`f_k'(x)=${2 * a}x-${2 * a * b}k=0`)} liefert ${tex(`x=${B}k`)}.`),
        O(`${2 * b}k`, ck, (k) => [2 * b * k, c * k], false, `Beim Auflösen von ${tex(`${2 * a}x=${2 * a * b}k`)} muss durch ${2 * a} geteilt werden.`),
        O(`${B}k`, `${ck}+${q}k^2`, (k) => [b * k, c * k + q * k * k], false, `y-Wert: Einsetzen ergibt ${tex(`${q}k^2-${2 * q}k^2=-${q}k^2`)}.`),
      ]),
      hints: [`Leite nach ${tex('x')} ab – ${tex('k')} ist dabei eine feste Zahl: ${tex(`f_k'(x)=${2 * a}x-${2 * a * b}k`)}.`, `Null setzen: ${tex(`${2 * a}x=${2 * a * b}k`)}, also ${tex(`x=${B}k`)}. Die Parabel ist nach oben geöffnet – es ist ein Tiefpunkt.`, `Einsetzen: ${tex(`f_k(${B}k)=${a}\\cdot${b * b}k^2-${2 * a * b}k\\cdot ${B}k${a2Mit(c, 'k')}=${ck}-${q}k^2`)}.`],
      explain: `${tex(`f_k'(x)=${2 * a}x-${2 * a * b}k=0`)} bei ${tex(`x=${B}k`)}; einsetzen ergibt ${tex(`f_k(${B}k)=${q}k^2-${2 * q}k^2${a2Mit(c, 'k')}`)}, also ${tex(`T(${B}k\\mid ${ck}-${q}k^2)`)}.`,
      f, min: true, kind: 'parabel3',
    };
  }
  const a = lv <= 1 ? 1 : pick([2, 3, 4]), c = pick(lv <= 1 ? [0, 1, 2] : [1, -2, 4, -3, 5]);
  const ak = `${a === 1 ? '' : a}k`, a2 = a * a === 1 ? '' : a * a;
  const yT = (sign) => `${c === 0 ? '' : c}${sign}${a2}k^2`.replace(/^\+/, '');
  const f = (k) => (x) => x * x - 2 * a * k * x + c;
  const hints = [`Leite nach ${tex('x')} ab – ${tex('k')} ist dabei eine feste Zahl.`, `${tex(`f_k'(x)=2x-${2 * a}k`)}. Null setzen und den x-Wert in ${tex('f_k')} einsetzen.`];
  if (lv >= 2) hints.push(`${tex(`x=${ak}`)}; einsetzen: ${tex(`f_k(${ak})=${a2}k^2-${2 * a * a}k^2${c === 0 ? '' : a2Pm(c)}`)}.`);
  return {
    prompt: 'Wo liegt der Tiefpunkt des Graphen?',
    formula: `f_k(x)=x^2-${2 * a}kx${c === 0 ? '' : `${c > 0 ? '+' : '-'}${Math.abs(c)}`}`,
    options: shuffle([
      O(ak, yT('-'), (k) => [a * k, c - a * a * k * k], true),
      O(`-${ak}`, yT('-'), (k) => [-a * k, c - a * a * k * k], false, `Vorzeichen: ${tex(`f_k'(x)=2x-${2 * a}k=0`)} liefert ${tex(`x=${ak}`)}.`),
      O(`${2 * a}k`, c === 0 ? '0' : String(c), (k) => [2 * a * k, c], false, `Beim Auflösen von ${tex(`2x=${2 * a}k`)} muss noch durch 2 geteilt werden.`),
      O(ak, yT('+'), (k) => [a * k, c + a * a * k * k], false, `y-Wert: Einsetzen ergibt ${tex(`${a2}k^2-${2 * a * a}k^2=-${a2}k^2`)}.`),
    ]),
    hints,
    explain: `${tex(`f_k'(x)=2x-${2 * a}k=0`)} bei ${tex(`x=${ak}`)}; einsetzen ergibt ${tex(`T(${ak}\\mid ${yT('-')})`)}.`,
    f, min: true, kind: 'parabel',
  };
}

/** Extremwertaufgabe: optimale Abmessung. Stufe 1–2 mit gegebener Zielfunktion, ab Stufe 3 mit Nebenbedingung, Stufe 5 mit Mitternachtsformel, e-Funktion, Abstand, Wurzeln. */
export function genExtremwert(lv = 3) {
  for (;;) {
    const kind = pick(tier(lv, ['rechteck'], ['zaun'], ['schachtel', 'trennwand'], ['parabel', 'offen'], ['karton', 'efkt', 'abstand', 'dose']));
    const mk = (num, correct, why) => ({ tex: a2Rund('x', num), num, correct, why });
    let q;
    if (kind === 'zaun') {
      const L = pick([20, 28, 36, 40, 60]);
      q = { prompt: `Mit ${L} m Zaun soll an einer Mauer ein rechteckiges Beet abgegrenzt werden (die Mauerseite braucht keinen Zaun). ${tex('x')} ist die Breite senkrecht zur Mauer. Für welches ${tex('x')} wird die Fläche am größten?`,
        formula: `A(x)=x\\cdot(${L}-2x)`, obj: (x) => x * (L - 2 * x), lo: 0, hi: L / 2,
        options: [mk(L / 4, true), mk(L / 2, false, `Dann bleibt für die Länge ${tex(`${L}-2x=0`)} – die Fläche wäre 0.`), mk(L / 3, false, 'Drei gleich lange Seiten sind nicht optimal: Die Seite an der Mauer kostet keinen Zaun.'), mk(L / 8, false, `Leite ${tex(`A(x)=${L}x-2x^2`)} ab: ${tex(`A'(x)=${L}-4x`)}.`)],
        hints: [`Multipliziere aus: ${tex(`A(x)=${L}x-2x^2`)}.`, `Ableiten und null setzen: ${tex(`A'(x)=${L}-4x=0`)}.`, `${tex("A''(x)=-4<0")}: Es ist ein Maximum.`],
        explain: `${tex(`A'(x)=${L}-4x=0`)} liefert ${tex(`x=${ft(L / 4)}`)} (Länge ${tex(ft(L / 2))} m, Fläche ${tex(ft((L * L) / 8))} m²).` };
    } else if (kind === 'rechteck') {
      const U = pick([12, 16, 20, 24, 40]);
      q = { prompt: `Ein Rechteck hat den Umfang ${U} cm. ${tex('x')} ist eine Seitenlänge. Für welches ${tex('x')} wird der Flächeninhalt am größten?`,
        formula: `A(x)=x\\cdot(${ft(U / 2)}-x)`, obj: (x) => x * (U / 2 - x), lo: 0, hi: U / 2,
        options: [mk(U / 4, true), mk(U / 2, false, 'Der halbe Umfang ist Länge plus Breite – dann bliebe für die andere Seite nichts übrig.'), mk(U / 3, false, `Leite ${tex(`A(x)=${ft(U / 2)}x-x^2`)} ab und setze null.`), mk(U / 8, false, `${tex(`A'(x)=${ft(U / 2)}-2x=0`)} – teile nur durch 2.`)],
        hints: ['Leite die Zielfunktion ab.', 'Setze die Ableitung null.'],
        explain: `${tex(`A'(x)=${ft(U / 2)}-2x=0`)} liefert ${tex(`x=${ft(U / 4)}`)}: ein Quadrat.` };
    } else if (kind === 'schachtel') {
      const s = pick([12, 18, 24, 30]);
      q = { prompt: `Aus einem quadratischen Karton mit der Seitenlänge ${s} cm werden an den Ecken Quadrate der Seitenlänge ${tex('x')} ausgeschnitten und die Ränder zu einer offenen Schachtel hochgeklappt. Für welches ${tex('x')} wird das Volumen am größten?`,
        formula: `V(x)=x\\cdot(${s}-2x)^2`, obj: (x) => x * (s - 2 * x) ** 2, lo: 0, hi: s / 2,
        options: [mk(s / 6, true), mk(s / 2, false, 'Dann bleibt kein Boden übrig: Das Volumen wäre 0.'), mk(s / 4, false, `Die Ableitung hat die Nullstellen ${tex(`x=${ft(s / 6)}`)} und ${tex(`x=${ft(s / 2)}`)} – ${tex(`x=${ft(s / 4)}`)} ist keine davon.`), mk(s / 3, false, `Prüfe mit ${tex("V'(x)=0")}: Die Lösung liegt näher am Rand.`)],
        hints: [`Produktregel und Kettenregel: ${tex(`V'(x)=(${s}-2x)^2+x\\cdot2\\cdot(${s}-2x)\\cdot(-2)`)}.`, `Ausklammern von ${tex(`(${s}-2x)`)}: ${tex(`V'(x)=(${s}-2x)\\cdot(${s}-6x)`)}.`, `Nullstellen: ${tex(`x=${ft(s / 2)}`)} (Volumen 0) und ${tex(`x=${ft(s / 6)}`)}.`],
        explain: `${tex(`V'(x)=(${s}-2x)(${s}-6x)=0`)} (Produktregel, Kettenregel) liefert ${tex(`x=${ft(s / 6)}`)} (bei ${tex(`x=${ft(s / 2)}`)} ist das Volumen 0).` };
    } else if (kind === 'trennwand') {
      const L = pick([24, 36, 48, 60, 72, 120]);
      q = { prompt: `Mit ${L} m Zaun wird ein rechteckiges Gehege gebaut, das durch einen Zaun parallel zur Seite ${tex('x')} in zwei Teile geteilt ist. Es werden also drei Zaunstücke der Länge ${tex('x')} und zwei der Länge ${tex('y')} gebraucht. Für welches ${tex('x')} wird die Gesamtfläche am größten?`,
        obj: (x) => (x * (L - 3 * x)) / 2, lo: 0, hi: L / 3,
        options: [mk(L / 6, true), mk(L / 3, false, `Dann bleibt für ${tex('y')} nichts übrig – die Fläche wäre 0.`), mk(L / 4, false, `Die Trennwand fehlt in der Nebenbedingung: Es gilt ${tex(`3x+2y=${L}`)}, nicht ${tex(`2x+2y=${L}`)}.`), mk(L / 5, false, 'Fünf gleich lange Zaunstücke sind nicht optimal – stelle die Zielfunktion auf und leite ab.')],
        hints: [`Nebenbedingung: ${tex(`3x+2y=${L}`)}, also ${tex(`y=${ft(L / 2)}-1{,}5x`)}.`, `Zielfunktion: ${tex(`A(x)=x\\cdot y=${ft(L / 2)}x-1{,}5x^2`)}.`, `Ableiten und null setzen: ${tex(`A'(x)=${ft(L / 2)}-3x=0`)}.`, `${tex("A''(x)=-3<0")}: Es ist ein Maximum.`],
        explain: `Aus ${tex(`3x+2y=${L}`)} folgt ${tex(`A(x)=${ft(L / 2)}x-1{,}5x^2`)}. ${tex(`A'(x)=${ft(L / 2)}-3x=0`)} liefert ${tex(`x=${ft(L / 6)}`)} (und ${tex(`y=${ft(L / 4)}`)}).` };
    } else if (kind === 'parabel') {
      const a = pick([12, 27, 6, 15, 21, 48]), x = Math.sqrt(a / 3);
      q = { prompt: `Zwischen der x-Achse und der Parabel mit ${tex(`f(x)=${a}-x^2`)} liegt ein Rechteck, das symmetrisch zur y-Achse ist. Zwei Ecken liegen auf der x-Achse, die beiden anderen auf der Parabel; ${tex('P(x\\mid f(x))')} mit ${tex('x>0')} ist eine davon. Für welches ${tex('x')} wird der Flächeninhalt am größten?`,
        obj: (t) => 2 * t * (a - t * t), lo: 0, hi: Math.sqrt(a),
        options: [mk(x, true), mk(Math.sqrt(a), false, 'Das ist die Nullstelle der Parabel – dort hat das Rechteck die Höhe 0.'), mk(a / 3, false, `Aus ${tex(`x^2=${ft(a / 3)}`)} muss noch die Wurzel gezogen werden.`), mk(Math.sqrt(a / 2), false, `Die Ableitung von ${tex('2x^3')} ist ${tex('6x^2')}, nicht ${tex('4x^2')}.`)],
        hints: [`Breite ${tex('2x')}, Höhe ${tex(`f(x)=${a}-x^2`)}: ${tex(`A(x)=2x\\cdot(${a}-x^2)=${2 * a}x-2x^3`)}.`, `Ableiten und null setzen: ${tex(`A'(x)=${2 * a}-6x^2=0`)}.`, `${tex(`x^2=${ft(a / 3)}`)}, also ${tex(`x=\\sqrt{${ft(a / 3)}}${a2Ganz(x) ? `=${ft(x)}` : `\\approx${ft(x)}`}`)} (nur ${tex('x>0')}).`, `${tex("A''(x)=-12x<0")}: Es ist ein Maximum.`],
        explain: `${tex(`A(x)=2x\\cdot(${a}-x^2)=${2 * a}x-2x^3`)}, ${tex(`A'(x)=${2 * a}-6x^2=0`)} liefert ${tex(`x=\\sqrt{${ft(a / 3)}}${a2Ganz(x) ? `=${ft(x)}` : `\\approx${ft(x)}`}`)}; wegen ${tex("A''(x)=-12x<0")} ein Maximum.` };
    } else if (kind === 'offen') {
      const V = pick([4, 13.5, 32, 62.5, 108, 20, 50]), x = Math.cbrt(2 * V);
      q = { prompt: `Eine oben offene Kiste mit quadratischer Grundfläche (Seitenlänge ${tex('x')} in dm) soll ${fmt(V)} Liter fassen. Für welches ${tex('x')} wird am wenigsten Material gebraucht (Boden und vier Seitenwände)?`,
        obj: (t) => -(t * t + (4 * V) / t), lo: x / 4, hi: 3 * x,
        options: [mk(x, true), mk(Math.cbrt(V), false, `Der Faktor 2 fehlt: Aus ${tex(`2x=\\tfrac{${ft(4 * V)}}{x^2}`)} folgt ${tex(`x^3=${ft(2 * V)}`)}.`), mk(Math.cbrt(4 * V), false, `Aus ${tex(`2x^3=${ft(4 * V)}`)} muss noch durch 2 geteilt werden.`), mk(Math.sqrt(2 * V), false, `Es ist ${tex(`x^3=${ft(2 * V)}`)} – also die dritte Wurzel, nicht die Quadratwurzel.`)],
        hints: [`Nebenbedingung (Volumen): ${tex(`x^2\\cdot h=${ft(V)}`)}, also ${tex(`h=\\dfrac{${ft(V)}}{x^2}`)}.`, `Zielfunktion (Material): ${tex(`O(x)=x^2+4x\\cdot h=x^2+\\dfrac{${ft(4 * V)}}{x}`)}.`, `Ableiten und null setzen: ${tex(`O'(x)=2x-\\dfrac{${ft(4 * V)}}{x^2}=0`)}.`, `${tex(`2x^3=${ft(4 * V)}`)}, also ${tex(`x=\\sqrt[3]{${ft(2 * V)}}${a2Ganz(x) ? `=${ft(x)}` : `\\approx${ft(x)}`}`)}. ${tex(`O''(x)=2+\\dfrac{${ft(8 * V)}}{x^3}>0`)}: Minimum.`],
        explain: `Mit ${tex(`h=\\dfrac{${ft(V)}}{x^2}`)} ist ${tex(`O(x)=x^2+\\dfrac{${ft(4 * V)}}{x}`)}. ${tex(`O'(x)=2x-\\dfrac{${ft(4 * V)}}{x^2}=0`)} liefert ${tex(`x=\\sqrt[3]{${ft(2 * V)}}${a2Ganz(x) ? `=${ft(x)}` : `\\approx${ft(x)}`}`)}.` };
    } else if (kind === 'karton') {
      const [a, b] = pick([[30, 20], [50, 30], [42, 30], [36, 22], [28, 18], [40, 24], [34, 26]]), D = a * a - a * b + b * b, w = Math.sqrt(D), x = (a + b - w) / 6;
      q = { prompt: `Aus einem rechteckigen Karton (${a} cm mal ${b} cm) werden an den vier Ecken Quadrate der Seitenlänge ${tex('x')} ausgeschnitten und die Ränder zu einer offenen Schachtel hochgeklappt. Für welches ${tex('x')} wird das Volumen am größten?`,
        obj: (t) => t * (a - 2 * t) * (b - 2 * t), lo: 0, hi: b / 2,
        options: [mk(x, true), mk((a + b + w) / 6, false, `Diese zweite Lösung der Mitternachtsformel liegt außerhalb des sinnvollen Bereichs: Es muss ${tex(`2x<${b}`)} gelten.`), mk(b / 6, false, 'Ein Sechstel der Seitenlänge gilt nur beim quadratischen Karton.'), mk((a + b) / 6, false, 'Das ist nur der Teil vor der Wurzel – die Wurzel der Mitternachtsformel fehlt.')],
        hints: [`Zielfunktion: ${tex(`V(x)=x\\cdot(${a}-2x)\\cdot(${b}-2x)=4x^3-${2 * (a + b)}x^2+${a * b}x`)}.`, `Ableiten und null setzen: ${tex(`V'(x)=12x^2-${4 * (a + b)}x+${a * b}=0`)}.`, `Mitternachtsformel: ${tex(`x_{1,2}=\\dfrac{${4 * (a + b)}\\pm\\sqrt{${16 * (a + b) ** 2}-${48 * a * b}}}{24}`)}.`, `${tex(`x_1\\approx${ft(x)}`)} und ${tex(`x_2\\approx${ft((a + b + w) / 6)}`)}. Sinnvoll ist nur ${tex(`0<x<${ft(b / 2)}`)}.`, `${tex(`V''(x)=24x-${4 * (a + b)}`)} ist bei ${tex(`x_1`)} negativ: Maximum. Größtes Volumen: ${tex(`V(${ft(x)})\\approx${ft(x)}\\cdot${ft(a - 2 * x)}\\cdot${ft(b - 2 * x)}\\approx${ft(x * (a - 2 * x) * (b - 2 * x), 0)}`)} cm³.`],
        explain: `${tex(`V(x)=4x^3-${2 * (a + b)}x^2+${a * b}x`)}, ${tex(`V'(x)=12x^2-${4 * (a + b)}x+${a * b}=0`)}. Die Mitternachtsformel liefert ${tex(`x_1\\approx${ft(x)}`)} und ${tex(`x_2\\approx${ft((a + b + w) / 6)}`)}; nur ${tex('x_1')} liegt im Bereich ${tex(`0<x<${ft(b / 2)}`)} und ist ein Maximum.` };
    } else if (kind === 'efkt') {
      const k = pick([0.4, 0.25, 0.8, 1.25, 0.5, 0.16]), c = pick([4, 6, 10, 12]), E = `e^{-${ft(k)}x}`;
      q = { prompt: `Im ersten Quadranten liegt unter dem Graphen von ${tex(`f(x)=${c}\\cdot ${E}`)} ein Rechteck mit den Ecken ${tex('(0\\mid0)')}, ${tex('(x\\mid0)')}, ${tex('(x\\mid f(x))')} und ${tex('(0\\mid f(x))')}. Für welches ${tex('x')} wird sein Flächeninhalt am größten?`,
        obj: (t) => c * t * Math.exp(-k * t), lo: 0, hi: 6 / k,
        options: [mk(1 / k, true), mk(k, false, `Aus ${tex(`1-${ft(k)}x=0`)} folgt ${tex(`x=\\tfrac{1}{${ft(k)}}`)} – der Kehrwert.`), mk(2 / k, false, `Das ist die Wendestelle von ${tex('A')} (${tex("A''(x)=0")}), nicht die Extremstelle.`), mk(1 / (2 * k), false, `Aus ${tex(`1-${ft(k)}x=0`)} folgt ${tex(`x=\\tfrac{1}{${ft(k)}}=${ft(1 / k)}`)}.`)],
        hints: [`Zielfunktion: Breite mal Höhe, ${tex(`A(x)=x\\cdot f(x)=${c}x\\cdot ${E}`)}.`, `Produktregel und Kettenregel: ${tex(`A'(x)=${c}\\cdot ${E}+${c}x\\cdot(-${ft(k)})\\cdot ${E}=${c}\\cdot(1-${ft(k)}x)\\cdot ${E}`)}.`, `${tex(`${E}>0`)}, also ${tex(`1-${ft(k)}x=0`)} und damit ${tex(`x=\\dfrac{1}{${ft(k)}}=${ft(1 / k)}`)}.`, `Die Klammer wechselt dort von + nach − (Vorzeichenwechsel): Maximum.`],
        explain: `${tex(`A(x)=${c}x\\cdot ${E}`)}; mit Produktregel und Kettenregel ${tex(`A'(x)=${c}\\cdot(1-${ft(k)}x)\\cdot ${E}=0`)} bei ${tex(`x=\\dfrac{1}{${ft(k)}}=${ft(1 / k)}`)} (Vorzeichenwechsel von + nach −, also Maximum).` };
    } else if (kind === 'abstand') {
      const a = pick([1.5, 2, 3, 4.5, 6, 2.5, 7.5]);
      q = { prompt: `Welcher Punkt ${tex('P(x\\mid\\sqrt{x})')} auf dem Graphen von ${tex('f(x)=\\sqrt{x}')} liegt dem Punkt ${tex(`A(${ft(a)}\\mid0)`)} am nächsten? Gesucht ist sein x-Wert.`,
        obj: (t) => -((t - a) ** 2 + t), lo: 0, hi: 2 * a,
        options: [mk(a - 0.5, true), mk(a, false, `Der Punkt senkrecht über ${tex('A')} ist nicht der nächste: Weiter links liegt der Graph tiefer und damit näher an ${tex('A')}.`), mk(a + 0.5, false, `Vorzeichen: Aus ${tex(`2\\cdot(x-${ft(a)})+1=0`)} folgt ${tex(`x=${ft(a)}-0{,}5`)}.`), mk(a - 1, false, `${tex('(\\sqrt{x})^2=x')} hat die Ableitung 1, nicht 2.`)],
        hints: [`Abstand nach dem Satz des Pythagoras: ${tex(`d(x)=\\sqrt{(x-${ft(a)})^2+(\\sqrt{x})^2}`)}.`, `Der Abstand ist am kleinsten, wenn sein Quadrat am kleinsten ist: ${tex(`q(x)=(x-${ft(a)})^2+x`)}.`, `Kettenregel: ${tex(`q'(x)=2\\cdot(x-${ft(a)})+1=0`)}.`, `${tex(`x=${ft(a)}-0{,}5=${ft(a - 0.5)}`)}; ${tex("q''(x)=2>0")}: Minimum.`, `Kleinster Abstand: ${tex(`d=\\sqrt{(${ft(a - 0.5)}-${ft(a)})^2+${ft(a - 0.5)}}=\\sqrt{${ft(a - 0.25)}}\\approx${ft(Math.sqrt(a - 0.25))}`)}.`],
        explain: `Abstandsquadrat (Satz des Pythagoras): ${tex(`q(x)=(x-${ft(a)})^2+x`)}. ${tex(`q'(x)=2\\cdot(x-${ft(a)})+1=0`)} (Kettenregel) liefert ${tex(`x=${ft(a - 0.5)}`)}; wegen ${tex("q''(x)=2>0")} ein Minimum.` };
    } else {
      const V = pick([330, 500, 750, 1000, 425, 850]), x = Math.cbrt(V / (2 * Math.PI));
      q = { prompt: `Eine zylinderförmige Dose soll ${V} cm³ fassen. Für welchen Radius ${tex('x')} (in cm) wird am wenigsten Blech gebraucht (Boden, Deckel und Mantel)?`,
        obj: (t) => -(2 * Math.PI * t * t + (2 * V) / t), lo: x / 4, hi: 3 * x,
        options: [mk(x, true), mk(Math.cbrt(V / Math.PI), false, `Aus ${tex(`4\\pi x^3=${2 * V}`)} folgt ${tex(`x^3=\\tfrac{${V}}{2\\pi}`)} – der Faktor 2 fehlt.`), mk(Math.cbrt(V / (4 * Math.PI)), false, `Aus ${tex(`4\\pi x=\\tfrac{${2 * V}}{x^2}`)} folgt ${tex(`x^3=\\tfrac{${2 * V}}{4\\pi}=\\tfrac{${V}}{2\\pi}`)}.`), mk(Math.sqrt(V / (2 * Math.PI)), false, `Es ist ${tex(`x^3=\\tfrac{${V}}{2\\pi}`)} – also die dritte Wurzel, nicht die Quadratwurzel.`)],
        hints: [`Nebenbedingung (Volumen): ${tex(`\\pi x^2\\cdot h=${V}`)}, also ${tex(`h=\\dfrac{${V}}{\\pi x^2}`)}.`, `Zielfunktion (Oberfläche): ${tex(`O(x)=2\\pi x^2+2\\pi x\\cdot h=2\\pi x^2+\\dfrac{${2 * V}}{x}`)}.`, `Ableiten und null setzen: ${tex(`O'(x)=4\\pi x-\\dfrac{${2 * V}}{x^2}=0`)}.`, `${tex(`x^3=\\dfrac{${V}}{2\\pi}`)}, also ${tex(`x=\\sqrt[3]{\\dfrac{${V}}{2\\pi}}\\approx${ft(x)}`)}.`, `${tex(`O''(x)=4\\pi+\\dfrac{${4 * V}}{x^3}>0`)}: Minimum. Die Höhe ist dann ${tex(`h=\\dfrac{${V}}{\\pi\\cdot${ft(x)}^2}\\approx${ft(2 * x)}=2x`)} – so hoch wie breit.`],
        explain: `Mit ${tex(`h=\\dfrac{${V}}{\\pi x^2}`)} ist ${tex(`O(x)=2\\pi x^2+\\dfrac{${2 * V}}{x}`)}. ${tex(`O'(x)=4\\pi x-\\dfrac{${2 * V}}{x^2}=0`)} liefert ${tex(`x=\\sqrt[3]{\\dfrac{${V}}{2\\pi}}\\approx${ft(x)}`)} (Höhe ${tex(`h=2x\\approx${ft(2 * x)}`)}).` };
    }
    const best = q.options[0].num;
    if (!a2Verschieden(q.options) || !q.options.every((o) => o.correct || q.obj(o.num) < q.obj(best) - 1e-6)) continue;
    return { ...q, options: shuffle(q.options), kind };
  }
}

/* Vorlagen für die ln-Ableitung auf Stufe 5: [Term, f, richtige Ableitung [tex, val], drei Ablenker [tex, val, why], Schritte, Erklärung]. */
function a2LnSchwer() {
  const ln = Math.log, ex = Math.exp, k = A2_K0, P = (e) => (e === 0 ? '' : e === 1 ? 'x' : `x^{${e}}`);
  const art = pick(['prodKette', 'lnE', 'lnHoch', 'quot', 'param', 'eLn', 'wurzel']);
  if (art === 'prodKette') {
    const n = pick([1, 2]), a = pick([1, 2, 3]), b = pick([1, 3, 4, 5]), I = polyTex([b, 0, a]), q = (x) => a * x * x + b, u1 = n === 1 ? '' : `${n}${P(n - 1)}\\cdot`;
    const Z2 = (t1, t2) => a2Zeilen(t1, `{}+${t2}`);   // lange Antwort auf zwei Zeilen (schmale Bildschirme)
    return { art, formula: `f(x)=${P(n)}\\cdot\\ln(${I})`, f: (x) => x ** n * ln(q(x)),
      r: [Z2(`${u1}\\ln(${I})`, `\\dfrac{${2 * a}${P(n + 1)}}{${I}}`), (x) => n * x ** (n - 1) * ln(q(x)) + (2 * a * x ** (n + 1)) / q(x)],
      w: [[Z2(`${u1}\\ln(${I})`, `\\dfrac{${P(n)}}{${I}}`), (x) => n * x ** (n - 1) * ln(q(x)) + x ** n / q(x), `Kettenregel: Beim Ableiten von ${tex(`\\ln(${I})`)} fehlt die innere Ableitung ${tex(`${2 * a}x`)}.`],
        [`\\dfrac{${2 * a * n}${P(n)}}{${I}}`, (x) => (2 * a * n * x ** n) / q(x), `Das ist ${tex("u'\\cdot v'")}. Produktregel: ${tex("u'v+uv'")}.`],
        [Z2(`${u1}\\ln(${I})`, `\\dfrac{${2 * a}${P(n + 1)}}{${2 * a}x}`), (x) => n * x ** (n - 1) * ln(q(x)) + x ** n, 'Im Nenner bleibt die innere Funktion selbst stehen, nicht ihre Ableitung.']],
      hints: [`Zwei Faktoren mit x: Produktregel mit ${tex(`u=${P(n)}`)} und ${tex(`v=\\ln(${I})`)}.`, `${tex(`u'=${n === 1 ? '1' : `${n}${P(n - 1)}`}`)}. Für ${tex("v'")} die Kettenregel: ${tex(`v'=\\dfrac{1}{${I}}\\cdot${2 * a}x=\\dfrac{${2 * a}x}{${I}}`)}.`, `Zusammensetzen: ${tex(`f'(x)=u'v+uv'=${u1}\\ln(${I})+${P(n)}\\cdot\\dfrac{${2 * a}x}{${I}}`)}.`],
      explain: `Produktregel und Kettenregel: ${tex(`f'(x)=${u1}\\ln(${I})+${P(n)}\\cdot\\dfrac{${2 * a}x}{${I}}=${u1}\\ln(${I})+\\dfrac{${2 * a}${P(n + 1)}}{${I}}`)}.` };
  }
  if (art === 'lnE') {
    const a = pick([2, 3, -1, -2]), b = pick([1, 2, 4, 5]), E = `e^{${a2Koef(a)}x}`, I = `${E}+${b}`, q = (x) => ex(a * x) + b;
    return { art, formula: `f(x)=\\ln(${I})`, f: (x) => ln(q(x)),
      r: [`\\dfrac{${a2Koef(a)}${E}}{${I}}`, (x) => (a * ex(a * x)) / q(x)],
      w: [[`\\dfrac{${E}}{${I}}`, (x) => ex(a * x) / q(x), `Kettenregel in der Kettenregel: ${tex(`(${E})'=${a2Koef(a)}${E}`)} – der Faktor ${tex(ft(a))} fehlt.`],
        [`\\dfrac{1}{${I}}`, (x) => 1 / q(x), `Die innere Ableitung ${tex(`${a2Koef(a)}${E}`)} fehlt (Kettenregel).`],
        [`\\dfrac{1}{${a2Koef(a)}${E}}`, (x) => 1 / (a * ex(a * x)), 'Im Nenner bleibt die innere Funktion selbst stehen, nicht ihre Ableitung.']],
      hints: [`Kettenregel: außen ${tex('\\ln(u)')} mit ${tex("(\\ln u)'=\\tfrac1u")}, innen ${tex(`u=${I}`)}.`, `Innere Ableitung – wieder mit der Kettenregel: ${tex(`u'=${a2Koef(a)}${E}`)}.`, `Zusammensetzen: ${tex(`f'(x)=\\dfrac{1}{${I}}\\cdot${a < 0 ? `(${a2Koef(a)}${E})` : `${a2Koef(a)}${E}`}`)}.`],
      explain: `Kettenregel (zweimal): ${tex(`f'(x)=\\dfrac{1}{${I}}\\cdot${a < 0 ? `(${a2Koef(a)}${E})` : `${a2Koef(a)}${E}`}=\\dfrac{${a2Koef(a)}${E}}{${I}}`)}.` };
  }
  if (art === 'lnHoch') {
    // c·x·(ln x)^n: Produktregel, darin Kettenregel
    const n = pick([2, 3]), c = pick([1, 2, 3]), C = a2Koef(c), H = (e) => (e === 1 ? '\\ln(x)' : `(\\ln(x))^{${e}}`);
    return { art, formula: `f(x)=${C}x\\cdot(\\ln(x))^{${n}}`, f: (x) => c * x * ln(x) ** n,
      r: [`${C}${H(n)}+${c * n}${H(n - 1)}`, (x) => c * ln(x) ** n + c * n * ln(x) ** (n - 1)],
      w: [[`\\dfrac{${c * n}${H(n - 1)}}{x}`, (x) => (c * n * ln(x) ** (n - 1)) / x, `Das ist ${tex("u'\\cdot v'")}. Produktregel: ${tex("u'v+uv'")}.`],
        [`${C}${H(n)}+\\dfrac{${c * n}${H(n - 1)}}{x}`, (x) => c * ln(x) ** n + (c * n * ln(x) ** (n - 1)) / x, `Im zweiten Summanden steht ${tex(`${C}x\\cdot${n}${H(n - 1)}\\cdot\\tfrac1x`)} – x und ${tex('\\tfrac1x')} kürzen sich.`],
        [`${C}${H(n)}+${c * n}x\\cdot${H(n - 1)}`, (x) => c * ln(x) ** n + c * n * x * ln(x) ** (n - 1), `Die innere Ableitung ${tex('\\tfrac1x')} fehlt (Kettenregel).`]],
      hints: [`Produktregel mit ${tex(`u=${C}x`)} und ${tex(`v=${H(n)}`)}.`, `${tex(`u'=${c}`)}. Für ${tex("v'")} die Kettenregel: ${tex(`v'=${n}${H(n - 1)}\\cdot\\dfrac1x`)}.`, `Zusammensetzen: ${tex(`f'(x)=${c}\\cdot${H(n)}+${C}x\\cdot${n}${H(n - 1)}\\cdot\\dfrac1x`)}.`, `Kürzen: ${tex(`x\\cdot\\tfrac1x=1`)}.`],
      explain: `Produktregel und Kettenregel: ${tex(`f'(x)=${c}\\cdot${H(n)}+${C}x\\cdot${n}${H(n - 1)}\\cdot\\dfrac1x=${C}${H(n)}+${c * n}${H(n - 1)}`)}.` };
  }
  if (art === 'quot') {
    const n = pick([1, 2, 3]);
    return { art, formula: `f(x)=\\dfrac{\\ln(x)}{${P(n)}}`, f: (x) => ln(x) / x ** n,
      r: [`\\dfrac{1-${a2Koef(n)}\\ln(x)}{${P(n + 1)}}`, (x) => (1 - n * ln(x)) / x ** (n + 1)],
      w: [[`\\dfrac{1}{${n === 1 ? 'x' : `${n}${P(n)}`}}`, (x) => 1 / (n * x ** n), `Zähler und Nenner dürfen nicht einzeln abgeleitet werden – hier gilt die Quotientenregel.`],
        [`\\dfrac{1+${a2Koef(n)}\\ln(x)}{${P(n + 1)}}`, (x) => (1 + n * ln(x)) / x ** (n + 1), `Vorzeichen in der Quotientenregel: ${tex("u'v-uv'")}.`],
        [`\\dfrac{1-${a2Koef(n)}\\ln(x)}{${P(2 * n)}}`, (x) => (1 - n * ln(x)) / x ** (2 * n), n === 1 ? `Im Zähler steht ${tex("u'v-uv'=1-\\ln(x)")}; im Nenner ${tex('x^{2}')} – prüfe das Kürzen.` : `Im Zähler lässt sich ${tex(P(n - 1))} ausklammern und mit dem Nenner ${tex(P(2 * n))} kürzen.`]].map((o, i) => (i === 2 && n === 1 ? [`\\dfrac{\\ln(x)-1}{x^{2}}`, (x) => (ln(x) - 1) / (x * x), `Reihenfolge in der Quotientenregel: ${tex("u'v-uv'")}, nicht ${tex("uv'-u'v")}.`] : o)),
      hints: [`Quotientenregel mit ${tex('u=\\ln(x)')} und ${tex(`v=${P(n)}`)}: ${tex("f'=\\dfrac{u'v-uv'}{v^{2}}")}.`, `${tex("u'=\\tfrac1x")} und ${tex(`v'=${n === 1 ? '1' : `${n}${P(n - 1)}`}`)}.`, `Einsetzen: ${tex(`f'(x)=\\dfrac{\\tfrac1x\\cdot ${P(n)}-\\ln(x)\\cdot${n === 1 ? '1' : `${n}${P(n - 1)}`}}{${P(2 * n)}}`)}.`, n === 1 ? `Vereinfachen: ${tex('\\tfrac1x\\cdot x=1')}.` : `Im Zähler ${tex(P(n - 1))} ausklammern und kürzen (Ausklammern).`],
      explain: `Quotientenregel: ${tex(`f'(x)=\\dfrac{\\tfrac1x\\cdot ${P(n)}-\\ln(x)\\cdot${n === 1 ? '1' : `${n}${P(n - 1)}`}}{${P(2 * n)}}=\\dfrac{1-${a2Koef(n)}\\ln(x)}{${P(n + 1)}}`)}.` };
  }
  if (art === 'param') {
    // x^n·ln(k·x): Die innere Ableitung k kürzt sich weg
    const n = pick([2, 3]), m = n - 1;
    return { art, formula: `f_k(x)=${P(n)}\\cdot\\ln(k\\,x)`, zus: ` (${tex('k>0')}, ${tex('x>0')})`, f: (x) => x ** n * ln(k * x),
      r: [`${n}${P(m)}\\cdot\\ln(k\\,x)+${P(m)}`, (x) => n * x ** m * ln(k * x) + x ** m],
      w: [[`${n}${P(m)}\\cdot\\ln(k\\,x)+k\\,${P(n)}`, (x) => n * x ** m * ln(k * x) + k * x ** n, `Kettenregel: ${tex("(\\ln(k\\,x))'=\\dfrac{1}{k\\,x}\\cdot k=\\dfrac1x")} – nicht nur die innere Ableitung k.`],
        [`${n}${P(m)}\\cdot\\ln(k\\,x)+\\dfrac{${P(m)}}{k}`, (x) => n * x ** m * ln(k * x) + x ** m / k, `Kettenregel: Die innere Ableitung k fehlt – sie kürzt sich mit dem k im Nenner: ${tex('\\dfrac{1}{k\\,x}\\cdot k=\\dfrac1x')}.`],
        [`${n}${m === 1 ? '' : P(m - 1)}`, (x) => n * x ** (m - 1), `Das ist ${tex("u'\\cdot v'")}. Produktregel: ${tex("u'v+uv'")}.`]],
      hints: [`Produktregel mit ${tex(`u=${P(n)}`)} und ${tex('v=\\ln(k\\,x)')} – k ist eine feste Zahl.`, `${tex(`u'=${n}${P(m)}`)}. Für ${tex("v'")} die Kettenregel: ${tex("v'=\\dfrac{1}{k\\,x}\\cdot k=\\dfrac1x")}.`, `Zusammensetzen: ${tex(`f_k'(x)=${n}${P(m)}\\cdot\\ln(k\\,x)+${P(n)}\\cdot\\dfrac1x`)}.`],
      explain: `Produktregel und Kettenregel: ${tex(`f_k'(x)=${n}${P(m)}\\cdot\\ln(k\\,x)+${P(n)}\\cdot\\dfrac{1}{k\\,x}\\cdot k=${n}${P(m)}\\cdot\\ln(k\\,x)+${P(m)}`)}.`, ab: "f_k'(x)" };
  }
  if (art === 'eLn') {
    const a = pick([2, 3, -1, -2]), A = a2Koef(a), E = `e^{${A}x}`;
    return { art, formula: `f(x)=${E}\\cdot\\ln(x)`, f: (x) => ex(a * x) * ln(x),
      r: [`${E}\\cdot\\left(${A}\\ln(x)+\\dfrac{1}{x}\\right)`, (x) => ex(a * x) * (a * ln(x) + 1 / x)],
      w: [[`\\dfrac{${A}${E}}{x}`, (x) => (a * ex(a * x)) / x, `Das ist ${tex("u'\\cdot v'")}. Produktregel: ${tex("u'v+uv'")}.`],
        [`${E}\\cdot\\left(\\ln(x)+\\dfrac{1}{x}\\right)`, (x) => ex(a * x) * (ln(x) + 1 / x), `Kettenregel: ${tex(`(${E})'=${A}${E}`)} – der Faktor ${tex(ft(a))} fehlt.`],
        [`${E}\\cdot\\left(${A}\\ln(x)+1\\right)`, (x) => ex(a * x) * (a * ln(x) + 1), `${tex("(\\ln x)'=\\tfrac1x")} – hier wurde mit x multipliziert, das kommt aber nicht vor.`]],
      hints: [`Produktregel mit ${tex(`u=${E}`)} und ${tex('v=\\ln(x)')}.`, `Kettenregel: ${tex(`u'=${A}${E}`)}. Außerdem ${tex("v'=\\tfrac1x")}.`, `Zusammensetzen: ${tex(`f'(x)=${A}${E}\\cdot\\ln(x)+${E}\\cdot\\dfrac1x`)}, dann ${tex(E)} ausklammern (Ausklammern).`],
      explain: `Produktregel und Kettenregel: ${tex(`f'(x)=${A}${E}\\cdot\\ln(x)+${E}\\cdot\\dfrac1x=${E}\\cdot\\left(${A}\\ln(x)+\\dfrac{1}{x}\\right)`)}.` };
  }
  const a = pick([1, 2, 3, 4]), b = pick([1, 3, 5, 7]), I = polyTex([b, 0, a]), q = (x) => a * x * x + b, A = a2Koef(a);
  return { art, formula: `f(x)=\\ln\\left(\\sqrt{${I}}\\right)`, f: (x) => ln(Math.sqrt(q(x))),
    r: [`\\dfrac{${A}x}{${I}}`, (x) => (a * x) / q(x)],
    w: [[`\\dfrac{${2 * a}x}{${I}}`, (x) => (2 * a * x) / q(x), `Der Faktor ${tex('\\tfrac12')} der Wurzel fehlt: ${tex(`\\ln(\\sqrt{u})=\\tfrac12\\ln(u)`)}.`],
      [`\\dfrac{1}{\\sqrt{${I}}}`, (x) => 1 / Math.sqrt(q(x)), `Die innere Ableitung fehlt – die Wurzel muss mit abgeleitet werden (Kettenregel).`],
      [`\\dfrac{1}{2\\cdot(${I})}`, (x) => 1 / (2 * q(x)), `Die innere Ableitung ${tex(`${2 * a}x`)} von ${tex(I)} fehlt (Kettenregel).`]],
    hints: [`Erst vereinfachen mit dem Logarithmengesetz: ${tex(`\\ln\\left(\\sqrt{u}\\right)=\\ln\\left(u^{\\frac12}\\right)=\\tfrac12\\ln(u)`)}.`, `Also ${tex(`f(x)=\\tfrac12\\ln(${I})`)}.`, `Kettenregel: ${tex(`f'(x)=\\tfrac12\\cdot\\dfrac{1}{${I}}\\cdot${2 * a}x`)}.`, `Kürzen: ${tex(`\\tfrac12\\cdot${2 * a}x=${A}x`)}.`],
    explain: `Logarithmengesetz: ${tex(`f(x)=\\tfrac12\\ln(${I})`)}. Kettenregel: ${tex(`f'(x)=\\tfrac12\\cdot\\dfrac{${2 * a}x}{${I}}=\\dfrac{${A}x}{${I}}`)}.` };
}

/** Ableitung mit ln: Stufe 1 Faktor, 2 Summe oder ln(a·x), 3 Kettenregel, 4 Produkt oder Kette mit x², 5 verkettet mit e-Funktion, Quotient, Potenz, Parameter. */
export function genLn(lv = 3) {
  const F = (t, val, correct, why, ab = "f'(x)") => ({ tex: `${ab}=${t}`, val, correct, why });
  if (lv >= 5) {
    for (;;) {
      const v = a2LnSchwer(), ab = v.ab || "f'(x)";
      const options = [F(v.r[0], v.r[1], true, undefined, ab), ...v.w.map(([t, val, why]) => F(t, val, false, why, ab))];
      if (!uniq(options)) continue;
      return { prompt: `Welche Ableitung ist richtig${v.zus || ''}?`, formula: v.formula, domain: 'pos', f: v.f, options: shuffle(options), hints: v.hints, explain: v.explain, kind: v.art };
    }
  }
  if (lv === 4 && rand() < 0.5) {
    const n = pick([2, 3, 4]);
    const P = (e) => (e === 1 ? 'x' : `x^{${e}}`), m = n - 1;
    return { prompt: 'Welche Ableitung ist richtig?', formula: `f(x)=${P(n)}\\cdot\\ln(x)`, domain: 'pos', f: (x) => x ** n * Math.log(x),
      options: shuffle([F(`${n}${P(m)}\\ln(x)+${P(m)}`, (x) => n * x ** m * Math.log(x) + x ** m, true),
        F(`${n}${m === 1 ? '' : P(m - 1)}`, (x) => n * x ** (m - 1), false, `Das ist ${tex("u'\\cdot v'")}. Produktregel: ${tex("u'v+uv'")}.`),
        F(`${n}${P(m)}\\ln(x)`, (x) => n * x ** m * Math.log(x), false, `Der zweite Teil fehlt: ${tex(`${P(n)}\\cdot\\tfrac1x=${P(m)}`)}.`),
        F(`${n}${P(m)}\\ln(x)+${P(n)}`, (x) => n * x ** m * Math.log(x) + x ** n, false, `Im zweiten Teil steht ${tex(`${P(n)}\\cdot\\tfrac1x`)} – das lässt sich kürzen.`)]),
      hints: ['Zwei Faktoren mit x: Produktregel.', `${tex(`u'=${n}${P(m)}`)} und ${tex("v'=\\tfrac1x")}.`, `Zusammensetzen: ${tex(`u'v+uv'=${n}${P(m)}\\cdot\\ln(x)+${P(n)}\\cdot\\tfrac1x`)}.`], explain: `Produktregel: ${tex(`f'(x)=${n}${P(m)}\\ln(x)+${P(n)}\\cdot\\tfrac1x=${n}${P(m)}\\ln(x)+${P(m)}`)}.`, kind: 'produkt' };
  }
  if (lv === 4) {
    // ln(a·x² + b·x + c): innere Ableitung mit zwei Summanden
    const a = pick([1, 2, 3]), b = pick([1, 3, 4, 5]), c = pick([1, 2, 4, 7]), inner = polyTex([c, b, a]), q = (x) => a * x * x + b * x + c, d = lineTex(2 * a, b);
    return { prompt: 'Welche Ableitung ist richtig?', formula: `f(x)=\\ln(${inner})`, domain: 'pos', f: (x) => Math.log(q(x)),
      options: shuffle([F(dfrac(d, inner), (x) => (2 * a * x + b) / q(x), true), F(dfrac(1, inner), (x) => 1 / q(x), false, `Die innere Ableitung ${tex(d)} fehlt (Kettenregel).`), F(dfrac(1, d), (x) => 1 / (2 * a * x + b), false, 'Im Nenner bleibt die innere Funktion selbst stehen, nicht ihre Ableitung.'), F(dfrac(lineTex(a, b), inner), (x) => (a * x + b) / q(x), false, `Potenzregel: ${tex(`(${a2Koef(a)}x^{2})'=${2 * a}x`)} – der Exponent 2 kommt als Faktor nach vorn.`)]),
      hints: [`${tex("(\\ln x)'=\\tfrac1x")} – und innen steht nicht nur x: Kettenregel.`, `Innere Ableitung (Summenregel, Potenzregel): ${tex(`(${inner})'=${d}`)}.`, `Äußere Ableitung ${tex(`\\dfrac{1}{${inner}}`)} mal innere Ableitung.`], explain: `Kettenregel: ${tex(`f'(x)=\\dfrac{1}{${inner}}\\cdot(${d})=${dfrac(d, inner)}`)}.`, kind: 'kette2' };
  }
  if (lv <= 1) {
    const c = pick([2, 3, 4, 5]);
    return { prompt: 'Welche Ableitung ist richtig?', formula: `f(x)=${c}\\ln(x)`, domain: 'pos', f: (x) => c * Math.log(x),
      options: shuffle([F(dfrac(c, 'x'), (x) => c / x, true), F(dfrac(1, `${c}x`), (x) => 1 / (c * x), false, 'Der Faktor bleibt als Faktor im Zähler erhalten.'), F(dfrac(c, 'x^2'), (x) => c / (x * x), false, `${tex("(\\ln x)'=\\tfrac1x")} – ohne Quadrat.`), F(`${c}x`, (x) => c * x, false, `${tex('\\ln(x)')} wird beim Ableiten zu ${tex('\\tfrac1x')}, nicht zu ${tex('x')}.`)]),
      hints: [`${tex("(\\ln x)'=\\tfrac1x")}.`, 'Ein fester Faktor bleibt beim Ableiten stehen.'], explain: `${tex(`f'(x)=${dfrac(c, 'x')}`)}.`, kind: 'faktor' };
  }
  if (lv === 2) {
    const c = pick([2, 3, 4, 5, 6]), a = pick([2, 3, -2, 4]), n = 2, xn = `x^{${n}}`, xm = 'x', an = a * n;
    const term = `${c}\\ln(x)${a2Mit(a, xn)}`;
    return { prompt: 'Welche Ableitung ist richtig?', formula: `f(x)=${term}`, domain: 'pos', f: (x) => c * Math.log(x) + a * x ** n,
      options: shuffle([F(`${dfrac(c, 'x')}${a2Mit(an, xm)}`, (x) => c / x + an * x ** (n - 1), true),
        F(`${dfrac(1, `${c}x`)}${a2Mit(an, xm)}`, (x) => 1 / (c * x) + an * x ** (n - 1), false, 'Der Faktor vor dem ln bleibt als Faktor im Zähler erhalten.'),
        F(`${dfrac(c, 'x')}${a2Mit(a, xm)}`, (x) => c / x + a * x ** (n - 1), false, `Potenzregel: Der Exponent ${n} kommt als Faktor nach vorn.`),
        F(`${c}x${a2Mit(an, xm)}`, (x) => c * x + an * x ** (n - 1), false, `${tex('\\ln(x)')} wird beim Ableiten zu ${tex('\\tfrac1x')}, nicht zu ${tex('x')}.`)]),
      hints: [`Jeder Summand wird einzeln abgeleitet (Summenregel): ${tex("(\\ln x)'=\\tfrac1x")}, der Faktor ${c} bleibt stehen.`, `${tex(`(${a2Koef(a)}${xn})'=${ft(an)}${xm}`)}.`],
      explain: `Summenregel: ${tex(`f'(x)=${c}\\cdot\\tfrac1x${a2Mit(an, xm)}=${dfrac(c, 'x')}${a2Mit(an, xm)}`)}.`, kind: 'summe' };
  }
  const a = pick([2, 3, 4, 5]), b = pick([1, 2, 3, 7]), c = pick([2, 3, -2, 5, -4].filter((v) => v !== a));
  const inner = polyTex([b, a]), ca = c * a;
  return { prompt: 'Welche Ableitung ist richtig?', formula: `f(x)=${c}\\cdot\\ln(${inner})`, domain: 'pos', f: (x) => c * Math.log(a * x + b),
    options: shuffle([F(dfrac(ca, inner), (x) => ca / (a * x + b), true), F(dfrac(c, inner), (x) => c / (a * x + b), false, `Die innere Ableitung ${tex(ft(a))} fehlt (Kettenregel).`), F(dfrac(a, inner), (x) => a / (a * x + b), false, `Der Faktor ${tex(ft(c))} vor dem ln bleibt beim Ableiten stehen (Faktorregel).`), F(dfrac(ca, 'x'), (x) => ca / x, false, 'Im Nenner bleibt die ganze innere Funktion stehen.')]),
    hints: [`${tex("(\\ln x)'=\\tfrac1x")} – und innen steht nicht nur x.`, `Kettenregel: äußere Ableitung ${tex(`\\dfrac{1}{${inner}}`)} mal innere Ableitung ${tex(`(${inner})'=${a}`)}.`, `Der Faktor ${tex(ft(c))} bleibt stehen (Faktorregel): ${tex(`${par(c)}\\cdot${a}=${ft(ca)}`)}.`], explain: `Faktorregel und Kettenregel: ${tex(`f'(x)=${par(c)}\\cdot\\dfrac{1}{${inner}}\\cdot${a}=${dfrac(ca, inner)}`)}.`, kind: 'kette' };
}

/** Exponentielles Wachstum: Stufe 1–2 Funktion aufstellen, 3 aus zwei Werten oder Verdopplungszeit, 4 Zeit bis zu einem Schwellenwert, 5 zweischrittig (erst k bestimmen, dann die Zeit). */
export function genWachstum(lv = 3) {
  const lnT = (v) => `\\ln(${ft(v, 4)})`;
  for (;;) {
    if (lv >= 4) {
      // Zeit-Aufgaben mit Zahlenergebnis: e^{k·t} = Faktor
      const O = (num, correct, why) => ({ tex: `t\\approx ${ft(num, 1)}`, num, correct, why });
      const art = pick(lv >= 5 ? ['halbwert', 'messung', 'doppelt'] : ['schwelle', 'prozent', 'prozentSchwelle']);
      let q, opts;
      if (art === 'schwelle') {
        const N0 = pick([200, 500, 800, 1200]), ab = rand() < 0.4, k = pick([0.03, 0.05, 0.08, 0.12, 0.2]), K = ab ? -k : k, m = ab ? pick([0.1, 0.25, 0.2, 0.05]) : pick([3, 4, 5, 10, 2.5]), G = N0 * m, t = Math.log(m) / K;
        opts = [O(t, true), O(ab ? 1 / (m * k) : m / k, false, `Der Logarithmus fehlt: Aus ${tex(`e^{${ft(K)}t}=${ft(m)}`)} folgt ${tex(`${ft(K)}t=${lnT(m)}`)}.`), O(Math.log(G) / k, false, `Erst durch den Anfangsbestand teilen: ${tex(`e^{${ft(K)}t}=\\tfrac{${ft(G)}}{${N0}}=${ft(m)}`)}.`), O(Math.abs(G - N0) / (N0 * k), false, 'Das wäre lineares Wachstum mit fester Änderung pro Zeiteinheit – hier ändert sich der Bestand aber exponentiell.')];
        q = { prompt: `Ein Bestand entwickelt sich nach ${tex(`N(t)=${N0}\\cdot e^{${ft(K)}t}`)} (${tex('t')} in Jahren). Nach welcher Zeit ist er auf ${fmt(G)} ${ab ? 'gesunken' : 'gewachsen'}?`,
          hints: [`Ansatz: ${tex(`${N0}\\cdot e^{${ft(K)}t}=${ft(G)}`)}.`, `Teile durch ${N0}: ${tex(`e^{${ft(K)}t}=${ft(m)}`)}.`, `Logarithmieren: ${tex(`${ft(K)}t=${lnT(m)}`)}.`, `Auflösen: ${tex(`t=\\dfrac{${lnT(m)}}{${ft(K)}}\\approx${ft(t, 1)}`)}.`],
          explain: `${tex(`${N0}\\cdot e^{${ft(K)}t}=${ft(G)}`)} führt auf ${tex(`e^{${ft(K)}t}=${ft(m)}`)}. Logarithmieren: ${tex(`t=\\dfrac{${lnT(m)}}{${ft(K)}}\\approx${ft(t, 1)}`)} Jahre.`, k: K, factor: m };
      } else if (art === 'prozent' || art === 'prozentSchwelle') {
        const p = pick(art === 'prozent' ? [8, 10, 12, 15, 20] : [3.5, 4.2, 6.5, 7.5, 2.4]), ab = art === 'prozentSchwelle' && rand() < 0.5, a = +(1 + (ab ? -p : p) / 100).toFixed(4), K = Math.log(a);
        const N0 = pick([400, 1500, 2500, 12000]), m = art === 'prozent' ? pick([2, 3]) : ab ? pick([0.4, 0.25, 0.1, 0.6]) : pick([1.5, 2.5, 4, 1.8]), G = N0 * m, t = Math.log(m) / K;
        opts = [O(t, true), O((Math.abs(m - 1) * 100) / p, false, `Das wäre lineares Wachstum (jedes Jahr ${fmt(p)} % vom Anfangswert). Der Bestand ändert sich aber jedes Jahr um ${fmt(p)} % vom aktuellen Wert.`), O(Math.abs(Math.log(m)) / (p / 100), false, `Die Basis ist ${tex(ft(a, 4))}, also muss durch ${tex(lnT(a))} geteilt werden – nicht durch ${tex(ft(p / 100, 4))}.`), O(Math.abs(Math.log(m)) / a, false, `Geteilt wird durch den Logarithmus der Basis, ${tex(lnT(a))}, nicht durch die Basis selbst.`)];
        q = { prompt: art === 'prozent' ? `Ein Bestand wächst jedes Jahr um ${fmt(p)} %. Nach wie vielen Jahren hat er sich ${m === 2 ? 'verdoppelt' : 'verdreifacht'}?`
          : `Ein Bestand von ${N0} ${ab ? 'nimmt' : 'wächst'} jedes Jahr um ${fmt(p)} % ${ab ? 'ab' : ''}. Nach wie vielen Jahren sind es ${fmt(G)}?`.replace(' .', '.'),
          hints: [`Wachstumsfaktor: ${tex(`a=1${ab ? '-' : '+'}${ft(p / 100, 4)}=${ft(a, 4)}`)}, also ${tex(`N(t)=N_0\\cdot ${ft(a, 4)}^{t}`)}.`, art === 'prozent' ? `Ansatz: ${tex(`${ft(a, 4)}^{t}=${ft(m)}`)}.` : `Ansatz: ${tex(`${N0}\\cdot ${ft(a, 4)}^{t}=${ft(G)}`)}, also ${tex(`${ft(a, 4)}^{t}=${ft(m)}`)}.`, `Logarithmieren: ${tex(`t\\cdot ${lnT(a)}=${lnT(m)}`)}.`, `Auflösen: ${tex(`t=\\dfrac{${lnT(m)}}{${lnT(a)}}\\approx${ft(t, 1)}`)}.`],
          explain: `Mit dem Wachstumsfaktor ${tex(`a=${ft(a, 4)}`)} gilt ${tex(`${ft(a, 4)}^{t}=${ft(m)}`)}. Logarithmieren: ${tex(`t=\\dfrac{${lnT(m)}}{${lnT(a)}}\\approx${ft(t, 1)}`)} Jahre.`, k: K, factor: m };
      } else if (art === 'doppelt') {
        const T = pick([3, 4.5, 6, 20, 2.5, 35]), m = pick([5, 10, 20, 50, 100, 3]), K = Math.log(2) / T, t = Math.log(m) / K;
        opts = [O(t, true), O((T * m) / 2, false, 'Das wäre lineares Wachstum. Tatsächlich verdoppelt sich in jeder Verdopplungszeit der aktuelle Bestand.'), O(T * Math.log(m), false, `Die Wachstumskonstante ist ${tex(`k=\\tfrac{\\ln(2)}{${ft(T)}}`)} – der Faktor ${tex('\\ln(2)')} fehlt.`), O((T * Math.log(2)) / Math.log(m), false, `Zähler und Nenner sind vertauscht: ${tex(`t=\\tfrac{${lnT(m)}}{k}`)}.`)];
        q = { prompt: `Eine Algenfläche verdoppelt sich alle ${fmt(T)} Tage. Nach welcher Zeit ist sie auf das ${m}-Fache angewachsen?`,
          hints: [`Ansatz: ${tex('N(t)=N_0\\cdot e^{k\\,t}')}. Verdopplungszeit: ${tex(`e^{k\\cdot${ft(T)}}=2`)}.`, `Logarithmieren: ${tex(`k=\\dfrac{\\ln(2)}{${ft(T)}}\\approx${ft(K, 4)}`)}.`, `Jetzt die gesuchte Zeit: ${tex(`e^{k\\,t}=${m}`)}.`, `Logarithmieren: ${tex(`k\\,t=${lnT(m)}`)}, also ${tex(`t=\\dfrac{${lnT(m)}}{k}`)}.`, `Einsetzen: ${tex(`t=\\dfrac{${lnT(m)}\\cdot${ft(T)}}{\\ln(2)}\\approx${ft(t, 1)}`)}.`],
          explain: `Aus der Verdopplungszeit: ${tex(`k=\\dfrac{\\ln(2)}{${ft(T)}}\\approx${ft(K, 4)}`)}. Dann ${tex(`e^{k\\,t}=${m}`)}, durch Logarithmieren ${tex(`t=\\dfrac{${lnT(m)}}{k}\\approx${ft(t, 1)}`)} Tage.`, k: K, factor: m };
      } else if (art === 'halbwert') {
        const T = pick([8, 12.5, 30, 5.3, 28.8, 14]), r = pick([10, 20, 5, 12.5, 1, 30]), K = -Math.log(2) / T, t = Math.log(r / 100) / K;
        opts = [O(t, true), O((T * (100 - r)) / 50, false, 'Das wäre ein linearer Zerfall (in jeder Halbwertszeit 50 % vom Anfangswert). Tatsächlich halbiert sich jeweils der aktuelle Bestand.'), O(T * Math.log(100 / r), false, `Die Zerfallskonstante ist ${tex(`k=\\tfrac{\\ln(2)}{${ft(T)}}`)} – der Faktor ${tex('\\ln(2)')} fehlt.`), O((T * Math.log(2)) / Math.log(100 / r), false, `Zähler und Nenner sind vertauscht: ${tex(`t=\\tfrac{\\ln(${ft(r / 100, 3)})}{-k}`)}.`)];
        q = { prompt: `Ein radioaktiver Stoff hat die Halbwertszeit ${fmt(T)} Jahre. Nach welcher Zeit sind nur noch ${fmt(r)} % der Anfangsmenge vorhanden?`,
          hints: [`Ansatz: ${tex('N(t)=N_0\\cdot e^{-k\\,t}')}. Halbwertszeit: ${tex(`e^{-k\\cdot${ft(T)}}=\\tfrac12`)}.`, `Logarithmieren: ${tex(`k=\\dfrac{\\ln(2)}{${ft(T)}}\\approx${ft(-K, 4)}`)}.`, `Jetzt die gesuchte Zeit: ${tex(`e^{-k\\,t}=${ft(r / 100, 3)}`)}.`, `Logarithmieren: ${tex(`-k\\,t=\\ln(${ft(r / 100, 3)})`)}, also ${tex(`t=\\dfrac{\\ln(${ft(r / 100, 3)})}{-k}`)}.`, `Einsetzen: ${tex(`t=\\dfrac{\\ln(${ft(r / 100, 3)})\\cdot${ft(T)}}{-\\ln(2)}\\approx${ft(t, 1)}`)}.`],
          explain: `Aus der Halbwertszeit: ${tex(`k=\\dfrac{\\ln(2)}{${ft(T)}}\\approx${ft(-K, 4)}`)}. Dann ${tex(`e^{-k\\,t}=${ft(r / 100, 3)}`)}, durch Logarithmieren ${tex(`t=\\dfrac{\\ln(${ft(r / 100, 3)})}{-k}\\approx${ft(t, 1)}`)} Jahre.`, k: K, factor: r / 100 };
      } else {
        const N0 = pick([200, 400, 500, 1500]), t1 = pick([2, 3, 4, 5, 6]), f1 = pick([1.3, 1.6, 1.25, 2.2, 1.45]), N1 = N0 * f1, m = pick([4, 5, 8, 10, 20]), G = N0 * m, K = Math.log(f1) / t1, t = Math.log(m) / K;
        opts = [O(t, true), O((G - N0) / ((N1 - N0) / t1), false, 'Das wäre lineares Wachstum (jede Stunde gleich viele dazu). Die Kultur wächst aber exponentiell.'), O((t1 * m) / f1, false, `Nicht die Faktoren selbst ins Verhältnis setzen, sondern ihre Logarithmen: ${tex(`t=\\tfrac{${lnT(m)}}{k}`)}.`), O((Math.log(m) * t1) / (f1 - 1), false, `${tex(`k=\\tfrac{${lnT(f1)}}{${t1}}`)} – die Wachstumskonstante ist nicht die prozentuale Zunahme ${tex(ft(f1 - 1))}.`)];
        q = { prompt: `Eine Bakterienkultur wächst exponentiell. Zu Beginn sind es ${N0} Bakterien, nach ${t1} Stunden ${fmt(N1)}. Nach welcher Zeit (seit Beginn) sind es ${fmt(G)}?`,
          hints: [`Ansatz: ${tex(`N(t)=${N0}\\cdot e^{k\\,t}`)}. Der zweite Messwert liefert ${tex(`${N0}\\cdot e^{k\\cdot${t1}}=${ft(N1)}`)}.`, `Teilen und Logarithmieren: ${tex(`e^{${t1}k}=${ft(f1)}`)}, also ${tex(`k=\\dfrac{${lnT(f1)}}{${t1}}\\approx${ft(K, 4)}`)}.`, `Jetzt die gesuchte Zeit: ${tex(`${N0}\\cdot e^{k\\,t}=${ft(G)}`)}, also ${tex(`e^{k\\,t}=${ft(m)}`)}.`, `Logarithmieren: ${tex(`t=\\dfrac{${lnT(m)}}{k}=\\dfrac{${lnT(m)}\\cdot${t1}}{${lnT(f1)}}\\approx${ft(t, 1)}`)}.`],
          explain: `Aus dem zweiten Messwert: ${tex(`k=\\dfrac{${lnT(f1)}}{${t1}}\\approx${ft(K, 4)}`)}. Dann ${tex(`e^{k\\,t}=${ft(m)}`)}, durch Logarithmieren ${tex(`t=\\dfrac{${lnT(m)}}{k}\\approx${ft(t, 1)}`)} Stunden.`, k: K, factor: m };
      }
      if (!opts.every((o) => o.num > 0 && (o.correct || Math.abs(Math.exp(q.k * o.num) - q.factor) > 4e-3 * (1 + 2 * q.factor))) || !opts.every((a, i) => opts.every((b, j) => i >= j || Math.abs(a.num - b.num) > 0.25))) continue;
      return { ...q, options: shuffle(opts), kind: 'zeit', art };
    }
    if (lv === 3 && rand() < 0.5) {
      const k = pick([0.02, 0.05, 0.1, 0.25, 0.04]), halb = rand() < 0.5, K = halb ? -k : k;
      const O = (t, num, correct, why) => ({ tex: `t=${t}`, num, correct, why });
      const opts = [O(dfrac('\\ln(2)', ft(k)), Math.log(2) / k, true), O(dfrac(2, ft(k)), 2 / k, false, `Aus ${tex(`e^{${ft(k)}t}=2`)} wird durch Logarithmieren ${tex(`${ft(k)}t=\\ln(2)`)}.`), O(`\\ln(2)\\cdot ${ft(k)}`, Math.log(2) * k, false, `Es wird durch ${tex(ft(k))} geteilt, nicht multipliziert.`), O(dfrac(ft(k), '\\ln(2)'), k / Math.log(2), false, 'Zähler und Nenner sind vertauscht.')];
      return { prompt: `Nach welcher Zeit hat sich der Bestand ${halb ? 'halbiert' : 'verdoppelt'}?`, formula: `N(t)=N_0\\cdot e^{${ft(K)}t}`, options: shuffle(opts),
        hints: [`Setze ${tex(`N(t)=${halb ? '\\tfrac12' : '2'}N_0`)} und kürze ${tex('N_0')}.`, `Logarithmiere beide Seiten: ${tex(`${ft(K)}t=\\ln(${halb ? '\\tfrac12' : '2'})`)}.`],
        explain: `${tex(`e^{${ft(K)}t}=${halb ? '\\tfrac12' : '2'}`)} liefert durch Logarithmieren ${tex(`t=${dfrac(halb ? '\\ln(\\tfrac12)' : '\\ln(2)', ft(K))}=${dfrac('\\ln(2)', ft(k))}\\approx${ft(Math.log(2) / k, 1)}`)}.`,
        kind: 'zeit', k: K, factor: halb ? 0.5 : 2 };
    }
    const O = (t, val, correct, why) => ({ tex: `N(t)=${t}`, val, correct, why });
    if (lv === 3) {
      // Wachstumsfaktor aus zwei aufeinanderfolgenden Werten
      const N0 = pick([80, 200, 400, 500]), a = pick([1.15, 1.25, 0.85, 0.75, 1.4, 0.9, 1.05]), N1 = N0 * a, p = Math.abs(a - 1), wrong = +(2 - a).toFixed(4), ab = a < 1;
      const opts = [O(`${N0}\\cdot ${ft(a, 4)}^{t}`, (t) => N0 * a ** t, true),
        O(`${N0}\\cdot ${ft(p, 4)}^{t}`, (t) => N0 * p ** t, false, `Der Wachstumsfaktor ist der Quotient ${tex(`\\tfrac{${ft(N1)}}{${N0}}=${ft(a, 4)}`)}, nicht nur die prozentuale Änderung.`),
        O(`${N0}${ab ? '-' : '+'}${ft(Math.abs(N1 - N0))}\\,t`, (t) => N0 + (N1 - N0) * t, false, 'Das wäre lineares Wachstum: jedes Jahr derselbe Betrag. Bei festem Prozentsatz ändert sich der Betrag mit.'),
        O(`${N0}\\cdot ${ft(wrong, 4)}^{t}`, (t) => N0 * wrong ** t, false, `Zunahme und Abnahme verwechselt: Der Bestand ${ab ? 'nimmt ab' : 'wächst'}.`)];
      if (!uniq(opts)) continue;
      return { prompt: `Ein Bestand ${ab ? 'sinkt' : 'wächst'} innerhalb eines Jahres von ${N0} auf ${fmt(N1)} und ändert sich danach jedes Jahr um denselben Prozentsatz. Welche Funktion beschreibt den Bestand nach ${tex('t')} Jahren?`, options: shuffle(opts),
        hints: [`Wachstumsfaktor: neuer Wert durch alten Wert, ${tex(`a=\\dfrac{${ft(N1)}}{${N0}}=${ft(a, 4)}`)}.`, `Das entspricht ${ab ? 'einer Abnahme' : 'einem Wachstum'} um ${fmt(p * 100)} % pro Jahr.`, `Jedes Jahr wird mit ${tex(ft(a, 4))} multipliziert: ${tex(`N(t)=${N0}\\cdot a^{t}`)}.`],
        explain: `Wachstumsfaktor ${tex(`a=\\dfrac{${ft(N1)}}{${N0}}=${ft(a, 4)}`)}, also ${tex(`N(t)=${N0}\\cdot ${ft(a, 4)}^{t}`)}.`, kind: 'formel', N0, a };
    }
    const N0 = pick([80, 200, 500, 1200]), p = pick(lv <= 1 ? [10, 20, 50] : [4, 5, 8, 12, 15, 25]);
    const ab = lv >= 2 && rand() < 0.5, a = +(1 + (ab ? -p : p) / 100).toFixed(4), wrongDir = +(1 + (ab ? p : -p) / 100).toFixed(4);
    const lin = (N0 * p) / 100;
    const opts = [O(`${N0}\\cdot ${ft(a, 4)}^{t}`, (t) => N0 * a ** t, true),
      O(`${N0}\\cdot ${ft(p / 100, 4)}^{t}`, (t) => N0 * (p / 100) ** t, false, `Der Wachstumsfaktor ist ${tex(`1${ab ? '-' : '+'}\\tfrac{p}{100}`)}, nicht ${tex('\\tfrac{p}{100}')}.`),
      O(`${N0}${ab ? '-' : '+'}${ft(lin)}\\,t`, (t) => N0 + (ab ? -lin : lin) * t, false, 'Das wäre lineares Wachstum: jedes Jahr derselbe Betrag. Bei Prozenten wächst der Betrag mit.'),
      O(`${N0}\\cdot ${ft(wrongDir, 4)}^{t}`, (t) => N0 * wrongDir ** t, false, `Zunahme und Abnahme verwechselt: Der Bestand ${ab ? 'nimmt ab' : 'wächst'}.`)];
    if (!uniq(opts)) continue;
    return { prompt: `Ein Bestand von ${N0} ${ab ? 'nimmt pro Jahr um' : 'wächst pro Jahr um'} ${fmt(p)} % ${ab ? 'ab' : ''}. Welche Funktion beschreibt den Bestand nach ${tex('t')} Jahren?`.replace(' .', '.'), options: shuffle(opts),
      hints: lv <= 1 ? ['Jedes Jahr wird mit demselben Faktor multipliziert.', `Faktor: ${tex(`1+${ft(p / 100, 4)}=${ft(a, 4)}`)}.`] : ['Jedes Jahr wird mit demselben Faktor multipliziert.', `${ab ? 'Abnahme' : 'Zunahme'} um ${fmt(p)} %: Es bleiben ${fmt(100 + (ab ? -p : p))} % des Vorjahres.`, `Faktor: ${tex(`a=1${ab ? '-' : '+'}${ft(p / 100, 4)}=${ft(a, 4)}`)}.`],
      explain: `Wachstumsfaktor ${tex(`a=${ft(a, 4)}`)}, also ${tex(`N(t)=${N0}\\cdot ${ft(a, 4)}^{t}`)}.`, kind: 'formel', N0, a };
  }
}

/** Fläche zwischen zwei Graphen: Stufe 1–2 das passende Integral, ab Stufe 3 den Inhalt berechnen (4: pq-Formel mit halben Schnittstellen, 5: Wurzeln oder Schar mit Parameter). */
export function genFlaecheZwischen(lv = 3) {
  for (;;) {
    if (lv <= 2) {
      const R = tier(lv, 2, 3);
      const r1 = ri(-R, R - 1), r2 = ri(r1 + 1, R), c = lv >= 2 ? pick([1, -2, 3, -4]) : 0;
      const fC = [c, 0, 1], gC = [c - r1 * r2, r1 + r2];
      const f = (x) => polyEval(fC, x), g = (x) => polyEval(gC, x);
      const O = (a, b, t, fn, correct, why) => ({ tex: `\\int_{${a}}^{${b}}${t}\\,dx`, num: simpson(fn, a, b), correct, why });
      const F = `(${polyTex(fC)})`, G = `(${polyTex(gC)})`;
      const opts = [O(r1, r2, `\\bigl(${G}-${F}\\bigr)`, (x) => g(x) - f(x), true),
        O(r1, r2, `\\bigl(${F}-${G}\\bigr)`, (x) => f(x) - g(x), false, 'Obere minus untere Funktion: Zwischen den Schnittstellen liegt die Gerade oben. So käme ein negativer Wert heraus.'),
        O(r1, r2, `\\bigl(${G}+${F}\\bigr)`, (x) => g(x) + f(x), false, 'Die Fläche zwischen zwei Graphen ist das Integral über die <b>Differenz</b>.'),
        O(r1, r2, G, g, false, `Das ist nur die Fläche unter ${tex('g')} – der Teil unter ${tex('f')} muss abgezogen werden.`)];
      if (!uniqNum(opts)) continue;
      const mid = (r1 + r2) / 2, hints = [`Schnittstellen: ${tex('f(x)=g(x)')}.`, `Die Schnittstellen sind ${tex(`x=${r1}`)} und ${tex(`x=${r2}`)}. Welche Funktion liegt dazwischen oben?`];
      if (lv >= 2) { hints[0] = `Schnittstellen: ${tex('f(x)=g(x)')}, also ${tex(`${polyTex([r1 * r2, -(r1 + r2), 1])}=0`)}.`; hints.push(`Probe in der Mitte: ${tex(`f(${ft(mid)})=${ft(f(mid))}`)} und ${tex(`g(${ft(mid)})=${ft(g(mid))}`)} – die Gerade liegt oben.`); }
      return { prompt: `Die Graphen von ${tex('f')} und ${tex('g')} schließen eine Fläche ein. Welches Integral liefert ihren Inhalt?`,
        formula: `f(x)=${polyTex(fC)},\\quad g(x)=${polyTex(gC)}`, options: shuffle(opts), hints,
        explain: `Schnittstellen ${tex(`x=${r1}`)} und ${tex(`x=${r2}`)}; dazwischen liegt ${tex('g')} oben: ${tex(`A=\\int_{${r1}}^{${r2}}(g(x)-f(x))\\,dx=${ft((r2 - r1) ** 3 / 6)}`)}.`,
        f, g, r1, r2, kind: 'integral' };
    }
    const O = (t, num, correct, why) => ({ tex: `A${t}`, num, correct, why });
    if (lv >= 5 && rand() < 0.5) {
      // Schar: f(x) = x², g_k(x) = (α+β)·k·x - α·β·k²  →  Schnittstellen α·k und β·k
      const [al, be] = pick([[0, 1], [0, 2], [0, 3], [1, 3], [-1, 2], [-1, 1], [-2, 1], [1, 2], [-1, 3]]), D = be - al, k = A2_K0, s = al + be, pr = al * be;
      const gT = `${s === 0 ? '' : `${a2Koef(s)}k\\,x`}${s === 0 ? a2Mit(-pr, 'k^{2}').replace(/^\+/, '') : a2Mit(-pr, 'k^{2}')}`;
      const kx = (v) => (v === 0 ? '0' : `${a2Koef(v)}k`), K = (z, n, e) => { const b = a2Bruch(z, n); return `=${b === '1' ? '' : b === '-1' ? '-' : b}k^{${e}}`; };
      const A = D ** 3 / 6, opts = [O(K(D ** 3, 6, 3), A * k ** 3, true),
        O(K(D ** 3, 6, 2), A * k * k, false, `Beim Einsetzen der Grenzen entsteht ${tex('k^{3}')}: In jedem Summanden der Stammfunktion stehen insgesamt drei Faktoren k.`),
        O(K(-(D ** 3), 6, 3), -A * k ** 3, false, 'Ein Flächeninhalt ist nicht negativ: obere minus untere Funktion.'),
        O(K(D ** 3, 3, 3), 2 * A * k ** 3, false, `Rechne die Stammfunktion an beiden Grenzen aus und fasse die Brüche sorgfältig zusammen – es bleibt ${tex(`${a2Bruch(D ** 3, 6)}k^{3}`)}.`)];
      const dT = `-x^{2}${a2Mit(s, 'k\\,x')}${a2Mit(-pr, 'k^{2}')}`, ST = `-\\tfrac13x^{3}${s === 0 ? '' : `${s < 0 ? '-' : '+'}${a2Bruch(Math.abs(s), 2) === '1' ? '' : a2Bruch(Math.abs(s), 2).replace('\\dfrac', '\\tfrac')}k\\,x^{2}`}${a2Mit(-pr, 'k^{2}x')}`;
      return { prompt: `Die Graphen von ${tex('f')} und ${tex('g_k')} schließen für ${tex('k>0')} eine Fläche ein. Wie groß ist ihr Inhalt in Abhängigkeit von ${tex('k')}?`,
        formula: `f(x)=x^{2},\\quad g_k(x)=${gT}`, options: shuffle(opts),
        hints: [`Schnittstellen: ${tex(`x^{2}=${gT}`)}, also ${tex(`x^{2}${a2Mit(-s, 'k\\,x')}${a2Mit(pr, 'k^{2}')}=0`)}.`,
          `pq-Formel (oder Ausklammern): ${tex(`x_1=${kx(al)}`)} und ${tex(`x_2=${kx(be)}`)}. Dazwischen liegt ${tex('g_k')} oben.`,
          `Differenz: ${tex(`g_k(x)-f(x)=${dT}`)}, Stammfunktion ${tex(`D(x)=${ST}`)}.`,
          `Hauptsatz: ${tex(`A=D(${kx(be)})-D(${kx(al)})=${a2Bruch(D ** 3, 6)}k^{3}`)}.`],
        explain: `Schnittstellen ${tex(`x_1=${kx(al)}`)} und ${tex(`x_2=${kx(be)}`)} (pq-Formel). ${tex(`A=\\int_{${kx(al)}}^{${kx(be)}}(${dT})\\,dx=\\Bigl[${ST}\\Bigr]_{${kx(al)}}^{${kx(be)}}=${a2Bruch(D ** 3, 6)}k^{3}`)} (Hauptsatz).`,
        f: (x) => x * x, g: (x) => s * k * x - pr * k * k, r1: al * k, r2: be * k, kind: 'schar' };
    }
    // f(x) = h(x), g(x) = h(x) - (x - r1)·(x - r2): Die Differenz ist immer -(x - r1)(x - r2)
    let r1, r2, fC, wurzel = 0, d = 0;
    if (lv === 3) { r1 = ri(-3, 2); r2 = ri(r1 + 1, 3); fC = [pick([0, 1, -2, 3]), pick([0, 0, 1, -2]), pick([1, 2])]; }
    else if (lv === 4) { r1 = ri(-5, 3) / 2; r2 = r1 + pick([1, 3, 5, 2, 4]) / 2; fC = [pick([1, -2, 3, 0.5]), pick([0, 1, -1, 2]), pick([0.5, 1.5, -0.5])]; if (Number.isInteger(r1) && Number.isInteger(r2)) continue; }
    else { d = pick([-2, -1, 0, 1, 2, 3]); wurzel = pick([2, 3, 5, 6, 7]); r1 = d - Math.sqrt(wurzel); r2 = d + Math.sqrt(wurzel); fC = [pick([1, -2, 3, 0]), pick([0, 1, -1, 2]), pick([0.5, 1, 2, -0.5]), pick([0, 0, 1])]; }
    const su = wurzel ? 2 * d : r1 + r2, pr = wurzel ? d * d - wurzel : r1 * r2;   // x² - su·x + pr = 0
    const dC = [-pr, su, -1], gC = fC.map((c, i) => c + (dC[i] ?? 0));
    const f = (x) => polyEval(fC, x), g = (x) => polyEval(gC, x), k = r2 - r1, A = k ** 3 / 6;
    const D = (x) => -(x ** 3) / 3 + (su * x * x) / 2 - pr * x;
    const Z = (v) => (wurzel ? `\\approx ${ft(v)}` : lv === 3 ? `=${a2Bruch(Math.round(v * 6), 6)}` : `=${a2Bruch(Math.round(v * 48), 48)}`);
    const kand = [[-A, 'Ein Flächeninhalt ist nicht negativ: obere minus untere Funktion, also ' + tex('g(x)-f(x)') + '.'],
      [Math.abs(D(r2) + D(r1)), `Hauptsatz: Die Werte der Stammfunktion werden abgezogen, ${tex('D(x_2)-D(x_1)')} – nicht addiert.`],
      [wurzel ? (2 * wurzel) ** 3 / 6 : simpson(g, r1, r2), wurzel ? `Die Wurzel fehlt: Die Schnittstellen sind ${tex(`${ft(d)}\\pm\\sqrt{${wurzel}}`)}, nicht ${tex(`${ft(d)}\\pm${wurzel}`)}.` : `Das ist nur das Integral über ${tex('g')} – der Teil unter ${tex('f')} muss abgezogen werden.`],
      [2 * A, `Beim Zusammenfassen der Brüche verrechnet: Es bleibt ${tex(`\\tfrac16\\cdot(x_2-x_1)^{3}`)}.`], [A / 2, `Beim Zusammenfassen der Brüche verrechnet: Es bleibt ${tex(`\\tfrac16\\cdot(x_2-x_1)^{3}`)}.`]];
    const opts = [O(Z(A), A, true)];
    for (const [v, why] of kand) if (opts.length < 4 && (wurzel || a2Ganz(v, lv === 3 ? 6 : 48)) && opts.every((o) => Math.abs(o.num - v) > 0.02)) opts.push(O(Z(v), v, false, why));
    if (opts.length < 4 || !uniq(opts)) continue;
    const qu = polyTex([pr, -su, 1]), x1 = wurzel ? `${d === 0 ? '' : ft(d)}-\\sqrt{${wurzel}}` : ft(r1), x2 = wurzel ? `${d === 0 ? '' : ft(d)}+\\sqrt{${wurzel}}` : ft(r2);
    const ST = `-\\tfrac13x^{3}${su === 0 ? '' : a2Mit(su / 2, 'x^{2}')}${a2Mit(-pr, 'x')}`;
    const pq = `x_{1,2}=${ft(su / 2)}\\pm\\sqrt{${ft((su * su) / 4, 4)}${a2Pm(-pr, 4)}}`;
    return { prompt: `Die Graphen von ${tex('f')} und ${tex('g')} schließen eine Fläche ein. Berechne ihren Inhalt.`,
      formula: a2Zeilen(`f(x)=${polyTex(fC)}`, `g(x)=${polyTex(gC)}`), options: shuffle(opts),
      hints: [`Schnittstellen: ${tex('f(x)=g(x)')}. Alles auf eine Seite bringen${fC.length > 3 && fC[3] ? ` (${tex('x^{3}')} fällt weg)` : ''}: ${tex(`${qu}=0`)}.`,
        lv === 3 ? `Lösungen: ${tex(`x_1=${x1}`)} und ${tex(`x_2=${x2}`)}. Dazwischen liegt ${tex('g')} oben.` : `pq-Formel: ${tex(pq)}, also ${tex(`x_1=${x1}`)} und ${tex(`x_2=${x2}`)}. Dazwischen liegt ${tex('g')} oben.`,
        `Differenz: ${tex(`g(x)-f(x)=${polyTex(dC)}`)} mit der Stammfunktion ${tex(`D(x)=${ST}`)}.`,
        `Hauptsatz: ${tex(`A=D(x_2)-D(x_1)${wurzel ? `\\approx${ft(D(r2))}-${par(+D(r1).toFixed(2))}` : ''}${Z(A)}`)}.`],
      explain: `Schnittstellen ${tex(`x_1=${x1}`)} und ${tex(`x_2=${x2}`)}${lv >= 4 ? ' (pq-Formel)' : ''}. ${tex(`A=\\int_{x_1}^{x_2}(${polyTex(dC)})\\,dx=\\Bigl[${ST}\\Bigr]_{x_1}^{x_2}${Z(A)}`)} (Hauptsatz).`,
      f, g, r1, r2, kind: wurzel ? 'wurzel' : 'zahl' };
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
      formula: lv <= 3 ? undefined : b2zeilen(`P(K)=${ft(p, 3)},\\quad P_K(+)=${ft(se, 3)}`, `P_{\\overline{K}}(-)=${ft(spez, 3)}`),
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
      formula: `\\def\\arraystretch{1.3}\\begin{array}{l}${P(a - 1)}\\approx${b2vier(Fr(a - 1))}\\\\${P(a)}\\approx${b2vier(Fr(a))}\\\\${P(b - 1)}\\approx${b2vier(Fr(b - 1))}\\\\${P(b)}\\approx${b2vier(Fr(b))}\\end{array}`, options: shuffle(opts),
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
    formula: `\\def\\arraystretch{1.3}\\begin{array}{l}${P(lo - 2)}\\approx${b2vier(Fr(lo - 2))}\\\\${P(lo - 1)}\\approx${b2vier(Fr(lo - 1))}\\\\${P(lo)}\\approx${b2vier(Fr(lo))}\\\\${P(hi)}\\approx${b2vier(Fr(hi))}\\\\${P(hi + 1)}\\approx${b2vier(Fr(hi + 1))}\\end{array}`, options: shuffle(opts),
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
      return { prompt: `Wie groß ist der Abstand des Punktes ${tex('P')} von der Ebene ${tex('E')}?`, formula: b2zeilen(`E:\\ ${planeTex(n, d)}`, pt('P', P)), options: shuffle(opts),
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
