// Aufgaben-Erzeuger, Teil 3: Grundlagen für alle Gebiete (Rechnen, Gleichungen, Wahrscheinlichkeit, Daten, Dreiecke, Vektoren).
// Gleiche Regeln wie in gen.js: Schwierigkeit lv (1–5), Ablenker = typische Fehler mit Diagnose, Rechen-Felder für tests/.
// Jede Stufe hat eigene Aufgaben-Formen (q.art nennt die Form, q.roh die gegebenen Größen – damit rechnet tests/hart/gen3.mjs unabhängig nach).
// Der Lösungsweg (hints + explain) ist so lang, wie die Aufgabe schwer ist: Stufe 1 ein bis zwei kurze Schritte, Stufe 5 die ganze Kette.
import { ri, pick, shuffle, rand, ft, fmt, polyTex, polyEval, lineTex } from './math.js';
import { tex } from './ui.js';
import { par, vecTex, uniq, uniqNum, same } from './gen.js';

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
/** Stufe als ganze Zahl 1…5. */
const S = (lv) => Math.min(5, Math.max(1, lv | 0 || 3));
/** Runden auf d Nachkommastellen (räumt auch Rechenreste wie 0,30000000004 weg). */
const rd = (x, d = 2) => +(+x).toFixed(d);
/** Bruch ohne Kürzen (Vorzeichen vor dem Bruchstrich). */
const bruch = (z, n) => `${z < 0 ? '-' : ''}${dfrac(Math.abs(z), n)}`;
/** Zahl mit Vorzeichen für Summen: +3 oder -3. */
const sg = (n, d = 2) => `${n < 0 ? '-' : '+'}${ft(Math.abs(n), d)}`;
/** Faktor vor x ohne „1x“. */
const kx = (n) => (n === 1 ? 'x' : n === -1 ? '-x' : `${ft(n)}x`);
/** Summe aus Gliedern [Faktor, Hochzahl] – ohne Zusammenfassen (für Zwischenschritte). */
const glieder = (L) => L.filter(([c]) => c !== 0).map(([c, p], i) => `${c < 0 ? '-' : i ? '+' : ''}${Math.abs(c) === 1 && p > 0 ? '' : ft(Math.abs(c))}${p === 0 ? '' : p === 1 ? 'x' : `x^{${p}}`}`).join('') || '0';
/** Zwei oder mehr Formelzeilen untereinander (passt auf schmale Bildschirme). */
const zeilen = (...z) => `\\begin{array}{l}${z.join('\\\\[6pt]')}\\end{array}`;
/** Gerundeter Wert mit „ungefähr“. */
const ca = (x, d = 2) => `\\approx ${ft(x, d)}`;
/** Alle Antworten sind Zahlen und liegen deutlich auseinander (auch für das Eintippen und die Prüfungen in tests/). */
const klar = (opts) => opts.every((o) => Number.isFinite(o.num)) && opts.every((a, i) => opts.every((b, j) => i >= j || Math.abs(a.num - b.num) > 0.006 * (1 + Math.abs(a.num) + Math.abs(b.num)) + 0.06));
/** Zahl als Antwort: glatt, wenn sie mit d Nachkommastellen genau ist, sonst mit „ungefähr“. */
const Z = (num, correct, why, d = 2) => ({ tex: Math.abs(num - rd(num, d)) < 1e-9 ? ft(num, d) : ca(num, d), num, correct, why });
const ganz = (x) => Math.abs(x - Math.round(x)) < 1e-9;
/** „= Wert“, wenn er mit d Nachkommastellen genau ist, sonst „≈ Wert“. */
const un = (x, d = 2) => `${Math.abs(x - rd(x, d)) < 1e-9 ? '=' : '\\approx '}${ft(x, d)}`;

/* ───────────── Analysis: Grundlagen ───────────── */

/** Brüche addieren, subtrahieren, multiplizieren, dividieren. */
export function genBruch(lv = 3) {
  for (;;) {
    const L = S(lv); let a, b, c, d, op;
    if (L === 1) { b = d = pick([3, 4, 5, 6, 7, 8, 9]); a = ri(1, b - 2); c = ri(1, b - 1 - a); op = '+'; }                        // gleiche Nenner, Summe unter 1
    else if (L === 2) { op = pick(['+', '-', '·']); b = pick([2, 3, 4, 5]); d = op === '·' ? pick([2, 3, 4, 5]) : rand() < 0.6 ? b * pick([2, 3]) : b; a = ri(1, b - 1); c = ri(1, d - 1); if (op === '+' && b === d) continue; if (rand() < 0.5) { [a, c] = [c, a]; [b, d] = [d, b]; } }   // gleiche Nenner abziehen, ein Nenner Vielfaches des anderen, einfaches Malnehmen
    else if (L === 3) { op = pick(['+', '-']); b = pick([2, 3, 4, 5, 6, 7]); d = pick([2, 3, 4, 5, 6, 7]); a = ri(1, b - 1); c = ri(1, d - 1); if (b % d === 0 || d % b === 0) continue; }   // ungleichnamig: beide Brüche erweitern
    else if (L === 4) { op = pick(['+', '-', ':']); b = pick([4, 6, 8, 9, 10, 12, 15]); d = pick([4, 6, 8, 9, 10, 12, 15]); a = ri(1, b - 1); c = ri(1, d - 1); if ('+-'.includes(op) && (b === d || gcd(b, d) === 1)) continue; }
    else { op = pick(['+', '-', ':', ':']); b = pick([6, 8, 9, 12, 14, 15, 16, 18, 20]); d = pick([6, 8, 9, 12, 14, 15, 16, 18, 20]); a = ri(b + 1, 2 * b - 1); c = ri(1, d - 1); if ('+-'.includes(op) && (b === d || gcd(b, d) === 1)) continue; }
    if (gcd(a, b) !== 1 || gcd(c, d) !== 1 || (op === '-' && L <= 3 && a * d <= c * b)) continue;
    const H = (b * d) / gcd(b, d), e1 = H / b, e2 = H / d, s = op === '-' ? -1 : 1, z = a * e1 + s * c * e2, gleich = b === d;
    const F = (n, den, correct, why) => (den === 0 ? null : { tex: fracTex(n, den), num: n / den, correct, why });
    const opts = {
      '+': gleich ? [F(z, H, true), F(a + c, 2 * b, false, 'Bei gleichen Nennern bleibt der Nenner stehen – nur die Zähler werden addiert.'), F(a + c, b * b, false, 'Der Nenner bleibt, wie er ist – er wird nicht mit sich selbst multipliziert.'), F(a * c, b, false, 'Die Zähler werden addiert, nicht multipliziert.')]
        : [F(z, H, true), F(a + c, b + d, false, 'Zähler und Nenner dürfen nicht einfach getrennt addiert werden. Erst gleichnamig machen.'), F(a + c, H, false, 'Der Hauptnenner stimmt – aber die Zähler müssen mit erweitert werden.'), F(a * c, b * d, false, 'Das wäre Multiplizieren. Beim Addieren erst auf den Hauptnenner bringen.')],
      '-': gleich ? [F(z, H, true), F(a + c, b, false, 'Hier wurde addiert statt subtrahiert.'), F(a - c, b * b, false, 'Der Nenner bleibt, wie er ist – er wird nicht mit sich selbst multipliziert.'), F(a - c, 2 * b, false, 'Bei gleichen Nennern bleibt der Nenner stehen – nur die Zähler werden subtrahiert.')]
        : [F(z, H, true), F(a - c, b - d, false, 'Zähler und Nenner dürfen nicht getrennt subtrahiert werden. Erst gleichnamig machen.'), F(a - c, H, false, 'Der Hauptnenner stimmt – aber die Zähler müssen mit erweitert werden.'), F(a * e1 + c * e2, H, false, 'Hier wurde addiert statt subtrahiert.')],
      '·': [F(a * c, b * d, true), F(a * d, b * c, false, 'Mit dem Kehrwert rechnet man nur beim Dividieren.'), F(a * d + c * b, b * d, false, 'Das wäre Addieren. Beim Multiplizieren: Zähler mal Zähler, Nenner mal Nenner.'), F(a * c, b + d, false, 'Auch die Nenner werden multipliziert.')],
      ':': [F(a * d, b * c, true), F(a * c, b * d, false, 'Dividieren heißt: mit dem Kehrwert des zweiten Bruchs multiplizieren.'), F(b * c, a * d, false, 'Es wird der zweite Bruch umgedreht, nicht der erste.'), F(a + c, b + d, false, 'Hier wurden Zähler und Nenner getrennt addiert. Dividieren heißt: mit dem Kehrwert des zweiten Bruchs multiplizieren.')],
    }[op];
    if (opts.includes(null) || !uniqNum(opts) || !uniq(opts) || opts.slice(1).some((x) => Math.abs(x.num - opts[0].num) < 0.02)) continue;
    const sym = { '+': '+', '-': '-', '·': '\\cdot', ':': ':' }[op], erg = opts[0].tex, auf = `${dfrac(a, b)}${sym}${dfrac(c, d)}`;
    const kurz = (zz, nn) => (gcd(zz, nn) > 1 ? [`Kürze mit ${gcd(zz, nn)}: ${tex(`${bruch(zz, nn)}=${fracTex(zz, nn)}`)}.`] : []), kette = (zz, nn) => `${bruch(zz, nn)}${gcd(zz, nn) > 1 ? `=${fracTex(zz, nn)}` : ''}`;
    let hints, explain;
    if ('+-'.includes(op) && gleich) {
      hints = ['Die Nenner sind gleich: Du rechnest nur mit den Zählern.', `${tex(`${a}${sym}${c}=${z}`)}, der Nenner ${b} bleibt.`, ...kurz(z, H)];
      explain = `${tex(`${auf}=${kette(z, H)}`)}.`;
    } else if ('+-'.includes(op)) {
      const erw = `${dfrac(a * e1, H)}${sym}${dfrac(c * e2, H)}`;
      hints = [e1 === 1 || e2 === 1 ? `Der Hauptnenner ist ${H}: Nur ein Bruch muss erweitert werden.` : `Hauptnenner: Das kleinste gemeinsame Vielfache von ${b} und ${d} ist ${H}.`,
        `Erweitern: ${[e1 > 1 ? tex(`${dfrac(a, b)}=${dfrac(a * e1, H)}`) : '', e2 > 1 ? tex(`${dfrac(c, d)}=${dfrac(c * e2, H)}`) : ''].filter(Boolean).join(' und ')}.`,
        `Zähler verrechnen: ${tex(`${a * e1}${sym}${c * e2}=${z}`)}, der Nenner ${H} bleibt.`, ...kurz(z, H)];
      explain = `${tex(`${auf}=${erw}=${kette(z, H)}`)}.`;
    } else if (op === '·') {
      hints = ['Zähler mal Zähler, Nenner mal Nenner.', `${tex(`${dfrac(`${a}\\cdot ${c}`, `${b}\\cdot ${d}`)}=${dfrac(a * c, b * d)}`)}.`, ...kurz(a * c, b * d)];
      explain = `${tex(`${auf}=${kette(a * c, b * d)}`)}.`;
    } else {
      hints = ['Durch einen Bruch teilen heißt: mit dem Kehrwert malnehmen.', `${tex(`${auf}=${dfrac(a, b)}\\cdot${dfrac(d, c)}`)}.`, `${tex(`${dfrac(`${a}\\cdot ${d}`, `${b}\\cdot ${c}`)}=${dfrac(a * d, b * c)}`)}.`, ...kurz(a * d, b * c)];
      explain = `${tex(`${auf}=${dfrac(a, b)}\\cdot${dfrac(d, c)}=${kette(a * d, b * c)}`)}.`;
    }
    if (!explain.includes(erg)) explain = `${explain.replace(/\.$/, '')}, also ${tex(erg)}.`;
    return { prompt: 'Berechne und kürze.', formula: auf, options: shuffle(opts), hints, explain, a, b, c, d, op, art: gleich && '+-'.includes(op) ? 'gleichnamig' : op, roh: { a, b, c, d, op } };
  }
}

/** Klammern auflösen, binomische Formeln. */
export function genKlammer(lv = 3) {
  for (;;) {
    const L = S(lv), P = (coef, correct, why) => ({ tex: polyTex(coef), correct, why, val: (x) => polyEval(coef, x) });
    const kind = pick([['faktor1'], ['faktor', 'zwei1'], ['zwei', 'binom'], ['binom2', 'allg', 'dritte'], ['kallg', 'bdiff']][L - 1]);
    let formula, opts, f, hints, explain;
    if (kind === 'faktor1') {
      const k = ri(2, 5), b = ri(1, 9);
      formula = `${k}\\,(x+${b})`; f = (x) => k * (x + b);
      opts = [P([k * b, k], true), P([b, k], false, 'Der Faktor vor der Klammer wird mit <b>jedem</b> Summanden multipliziert.'), P([k + b, k], false, 'Mit der zweiten Zahl wird ebenfalls multipliziert, nicht addiert.'), P([k * b, 1], false, `Auch ${tex('x')} wird mit ${k} multipliziert.`)];
      hints = [`Multipliziere ${k} mit jedem der beiden Summanden.`, `${tex(`${k}\\cdot x`)} und ${tex(`${k}\\cdot ${b}=${k * b}`)}.`];
      explain = `${tex(`${formula}=${opts[0].tex}`)}.`;
    } else if (kind === 'faktor') {
      const k = pick([2, 3, 4, 6, -2, -3, -4, -5]), a = pick([2, 3, 4, 5]), b = pick([1, 2, 5, 7, -1, -3, -4, -6]);
      if (k > 0 && b > 0) continue;
      formula = `${ft(k)}\\,(${polyTex([b, a])})`; f = (x) => k * (a * x + b);
      opts = [P([k * b, k * a], true), P([b, k * a], false, 'Der Faktor vor der Klammer wird mit <b>jedem</b> Summanden multipliziert.'), P([k + b, k * a], false, 'Mit der zweiten Zahl wird ebenfalls multipliziert, nicht addiert.'), P([-k * b, k * a], false, 'Achte auf das Vorzeichen des zweiten Produkts.')];
      hints = [`Multipliziere ${tex(ft(k))} mit beiden Gliedern der Klammer.`, `${tex(`${par(k)}\\cdot ${a}x=${kx(k * a)}`)} und ${tex(`${par(k)}\\cdot ${par(b)}=${ft(k * b)}`)}${k < 0 && b < 0 ? ' – minus mal minus ergibt plus' : ''}.`];
      explain = `${tex(`${formula}=${opts[0].tex}`)}.`;
    } else if (kind === 'zwei1' || kind === 'zwei') {
      const a = kind === 'zwei1' ? ri(1, 6) : pick([1, 2, 3, 4, 5, 7, -1, -2, -3, -6]), b = kind === 'zwei1' ? ri(1, 6) : pick([1, 2, 3, 4, 6, -2, -4, -5, -7]);
      if (a + b === 0 || a * b === a + b || (kind === 'zwei' && a > 0 && b > 0)) continue;
      formula = `(${polyTex([a, 1])})(${polyTex([b, 1])})`; f = (x) => (x + a) * (x + b);
      opts = [P([a * b, a + b, 1], true), P([a * b, 0, 1], false, 'Jedes Glied der ersten Klammer wird mit jedem der zweiten multipliziert – die beiden gemischten Produkte fehlen.'), P([a + b, a * b, 1], false, 'Summe und Produkt sind vertauscht: vor x steht die Summe, am Ende das Produkt.'), P([a * b, -(a + b), 1], false, 'Achte auf das Vorzeichen des mittleren Glieds.')];
      hints = ['Jedes Glied der ersten Klammer mal jedes Glied der zweiten.', `Das ergibt vier Produkte: ${tex(glieder([[1, 2], [b, 1], [a, 1], [a * b, 0]]))}.`, `Fasse die beiden Glieder mit ${tex('x')} zusammen: ${tex(`${glieder([[b, 1], [a, 1]])}=${glieder([[a + b, 1]])}`)}.`];
      explain = `${tex(`${formula}=${glieder([[1, 2], [b, 1], [a, 1], [a * b, 0]])}=${opts[0].tex}`)}.`;
    } else if (kind === 'binom') {
      const a = pick([2, 3, 4, 5, 6, 7]), s = pick([1, -1]), z = s > 0 ? '+' : '-';
      formula = `(x${z}${a})^2`; f = (x) => (x + s * a) ** 2;
      opts = [P([a * a, 2 * s * a, 1], true), P([a * a, 0, 1], false, `Binomische Formel: Das mittlere Glied ${tex('2ab')} fehlt. ${tex('(a+b)^2\\neq a^2+b^2')}.`), P([a * a, s * a, 1], false, `Im mittleren Glied steht der Faktor 2: ${tex('2ab')}.`), P([a * a, -2 * s * a, 1], false, 'Das Vorzeichen des mittleren Glieds richtet sich nach dem Vorzeichen in der Klammer.')];
      hints = [`${s > 0 ? 'Erste' : 'Zweite'} binomische Formel: ${tex(`(a${z}b)^2=a^2${z}2ab+b^2`)}.`, `Mittleres Glied: ${tex(`2\\cdot x\\cdot ${a}=${2 * a}x`)}.`, `Letztes Glied: ${tex(`${a}^2=${a * a}`)}.`];
      explain = `${tex(`${formula}=x^2${z}2\\cdot ${a}\\cdot x+${a}^2=${opts[0].tex}`)}.`;
    } else if (kind === 'binom2') {
      const a = pick([2, 3, 4, 5]), b = pick([1, 2, 3, 4, 5, 6, 7]), s = pick([1, -1]), z = s > 0 ? '+' : '-';
      formula = `(${a}x${z}${b})^2`; f = (x) => (a * x + s * b) ** 2;
      opts = [P([b * b, 2 * s * a * b, a * a], true), P([b * b, 0, a * a], false, `Binomische Formel: Das mittlere Glied ${tex('2ab')} fehlt.`), P([b * b, 2 * s * a * b, a], false, `Auch der Faktor ${a} wird quadriert: ${tex(`(${a}x)^2=${a * a}x^2`)}.`), P([b * b, s * a * b, a * a], false, `Im mittleren Glied steht der Faktor 2: ${tex(`2\\cdot ${a}x\\cdot ${b}`)}.`)];
      hints = [`${s > 0 ? 'Erste' : 'Zweite'} binomische Formel: ${tex(`(a${z}b)^2=a^2${z}2ab+b^2`)} – hier ist das erste Glied ${tex(`${a}x`)}, das zweite ${b}.`, `Erstes Glied quadrieren: ${tex(`(${a}x)^2=${a * a}x^2`)}.`, `Mittleres Glied: ${tex(`2\\cdot ${a}x\\cdot ${b}=${2 * a * b}x`)}.`, `Letztes Glied: ${tex(`${b}^2=${b * b}`)}.`];
      explain = `${tex(`${formula}=(${a}x)^2${z}2\\cdot ${a}x\\cdot ${b}+${b}^2=${opts[0].tex}`)}.`;
    } else if (kind === 'dritte') {
      const a = pick([2, 3, 4, 5, 6]), b = pick([1, 2, 3, 4, 5, 7, 8]);
      formula = `(${a}x+${b})(${a}x-${b})`; f = (x) => (a * x + b) * (a * x - b);
      opts = [P([-b * b, 0, a * a], true), P([b * b, 0, a * a], false, `Dritte binomische Formel: Zwischen den Quadraten steht ein Minus, ${tex('a^2-b^2')}.`), P([b * b, -2 * a * b, a * a], false, `Das wäre ${tex(`(${a}x-${b})^2`)}. Hier sind die Klammern verschieden – die gemischten Glieder heben sich auf.`), P([-b * b, 0, a], false, `Auch der Faktor ${a} wird quadriert: ${tex(`(${a}x)^2=${a * a}x^2`)}.`)];
      hints = [`Dritte binomische Formel: ${tex('(a+b)(a-b)=a^2-b^2')}.`, `${tex(`(${a}x)^2=${a * a}x^2`)} und ${tex(`${b}^2=${b * b}`)}.`, `Die gemischten Glieder ${tex(`-${a * b}x`)} und ${tex(`+${a * b}x`)} heben sich auf.`];
      explain = `${tex(`${formula}=(${a}x)^2-${b}^2=${opts[0].tex}`)}.`;
    } else if (kind === 'allg') {
      const a = pick([2, 3, 4]), b = pick([1, 3, -1, -2, 5, -4]), c = pick([1, 2, 3, 5]), d = pick([2, -3, 4, -5, 6]);
      if (a * d + b * c === 0 || a * d - b * c === a * d + b * c) continue;
      formula = `(${polyTex([b, a])})(${polyTex([d, c])})`; f = (x) => (a * x + b) * (c * x + d);
      opts = [P([b * d, a * d + b * c, a * c], true), P([b * d, 0, a * c], false, 'Die beiden gemischten Produkte fehlen.'), P([b * d, a * d + b * c, a + c], false, 'Die Faktoren vor x werden multipliziert, nicht addiert.'), P([b * d, a * d - b * c, a * c], false, 'Achte auf die Vorzeichen der gemischten Produkte.')];
      hints = ['Jedes Glied der ersten Klammer mal jedes Glied der zweiten – das sind vier Produkte.', `${tex(`${a}x\\cdot ${kx(c)}=${glieder([[a * c, 2]])}`)} und ${tex(`${a}x\\cdot ${par(d)}=${kx(a * d)}`)}.`, `${tex(`${par(b)}\\cdot ${kx(c)}=${kx(b * c)}`)} und ${tex(`${par(b)}\\cdot ${par(d)}=${ft(b * d)}`)}.`, `Zusammenfassen: ${tex(`${glieder([[a * d, 1], [b * c, 1]])}=${glieder([[a * d + b * c, 1]])}`)}.`];
      explain = `${tex(`${formula}=${glieder([[a * c, 2], [a * d, 1], [b * c, 1], [b * d, 0]])}=${opts[0].tex}`)}.`;
    } else if (kind === 'kallg') {
      const k = pick([2, 3, -2, -3, -4]), a = pick([2, 3, 4]), b = pick([1, 3, -1, -2, 5]), c = pick([1, 2, 3]), d = pick([2, -3, 4, -5]), m = a * d + b * c;
      if (m === 0 || a * d - b * c === m) continue;
      formula = `${ft(k)}\\,(${polyTex([b, a])})(${polyTex([d, c])})`; f = (x) => k * (a * x + b) * (c * x + d);
      const innen = [b * d, m, a * c];
      opts = [P(innen.map((v) => k * v), true), P([b * d, m, k * a * c], false, `Der Faktor ${tex(ft(k))} gehört zu <b>jedem</b> Glied des Produkts.`), P(innen.map((v) => k * k * v), false, `Der Faktor ${tex(ft(k))} wird nur einmal multipliziert – nicht in beide Klammern hinein.`), P([k * b * d, k * (a * d - b * c), k * a * c], false, 'Achte auf die Vorzeichen der gemischten Produkte.')];
      hints = ['Erst die beiden Klammern miteinander ausmultiplizieren, den Faktor davor stehen lassen.', `Vier Produkte: ${tex(glieder([[a * c, 2], [a * d, 1], [b * c, 1], [b * d, 0]]))}.`, `Zusammenfassen: ${tex(`(${polyTex([b, a])})(${polyTex([d, c])})=${polyTex(innen)}`)}.`, `Jetzt jedes Glied mit ${tex(ft(k))} multiplizieren: ${tex(`${par(k)}\\cdot ${par(a * c)}=${ft(k * a * c)}`)}, ${tex(`${par(k)}\\cdot ${par(m)}=${ft(k * m)}`)}, ${tex(`${par(k)}\\cdot ${par(b * d)}=${ft(k * b * d)}`)}.`];
      explain = `${tex(`${formula}=${ft(k)}\\,(${polyTex(innen)})`)} ${tex(`=${opts[0].tex}`)}.`;
    } else {
      const a = pick([2, 3, 4]), b = pick([1, 2, 3, 5, -1, -2, -4]), c = pick([1, 2, 3].filter((v) => v !== a)), d = pick([1, 2, 4, -1, -3, -5]);
      if (a * b === c * d || a * b === -c * d) continue;
      const kl = (m, n) => `(${polyTex([n, m])})^2`, q1 = [b * b, 2 * a * b, a * a], q2 = [d * d, 2 * c * d, c * c];
      formula = `${kl(a, b)}-${kl(c, d)}`; f = (x) => (a * x + b) ** 2 - (c * x + d) ** 2;
      opts = [P(q1.map((v, i) => v - q2[i]), true), P([b * b + d * d, 2 * a * b + 2 * c * d, a * a - c * c], false, 'Das Minus vor der zweiten Klammer dreht <b>alle</b> ihre Vorzeichen um, nicht nur das erste.'), P([b * b - d * d, 0, a * a - c * c], false, `Die mittleren Glieder ${tex('2ab')} der beiden binomischen Formeln fehlen.`), P([b * b - d * d, a * b - c * d, a * a - c * c], false, `In den mittleren Gliedern steht jeweils der Faktor 2: ${tex('2ab')}.`)];
      hints = [`Erstes Quadrat mit der binomischen Formel: ${tex(`${kl(a, b)}=${polyTex(q1)}`)}.`, `Zweites Quadrat: ${tex(`${kl(c, d)}=${polyTex(q2)}`)}.`, `Das Minus vor der Klammer dreht alle Vorzeichen: ${tex(`-(${polyTex(q2)})=${polyTex(q2.map((v) => -v))}`)}.`, `Gleiche Potenzen zusammenfassen: ${tex(`${a * a}x^2-${c * c === 1 ? '' : c * c}x^2`)}, ${tex(`${kx(2 * a * b)}${sg(-2 * c * d)}x`)}, ${tex(`${b * b}-${d * d}`)}.`];
      explain = `${tex(`${formula}=(${polyTex(q1)})-(${polyTex(q2)})`)} ${tex(`=${opts[0].tex}`)}.`;
    }
    if (!uniq(opts) || opts.some((o, i) => opts.some((p, j) => i < j && [1.7, 0.3].every((x) => Math.abs(o.val(x) - p.val(x)) < 1e-9)))) continue;
    return { prompt: 'Löse die Klammern auf.', formula, options: shuffle(opts), hints, explain, f, art: kind };
  }
}

/** Lineare Gleichung lösen. */
export function genLinGl(lv = 3) {
  for (;;) {
    const L = S(lv), X = (num, correct, why) => ({ tex: `x=${ft(num, 3)}`, num, correct, why });
    let formula, opts, hints, explain, left, right, art;
    if (L === 1 && rand() < 0.5) {
      const b = ri(1, 9), x0 = ri(1, 9), d = x0 + b; art = 'plus';
      formula = `x+${b}=${d}`; left = (x) => x + b; right = () => d;
      opts = [X(x0, true), X(d + b, false, `Die ${b} wird auf beiden Seiten abgezogen, nicht addiert.`), X(b - d, false, `Rechts steht ${tex(`${d}-${b}`)}, nicht ${tex(`${b}-${d}`)}.`), X(d, false, `Die ${b} auf der linken Seite muss noch abgezogen werden.`)];
      hints = [`Ziehe auf beiden Seiten ${b} ab.`, `${tex(`x=${d}-${b}`)}.`]; explain = `${tex(`x=${d}-${b}=${x0}`)}.`;
    } else if (L === 1) {
      const a = ri(2, 6), x0 = ri(2, 9), d = a * x0; art = 'mal';
      formula = `${a}x=${d}`; left = (x) => a * x; right = () => d;
      opts = [X(x0, true), X(d * a, false, `Es wird durch ${a} geteilt, nicht mit ${a} multipliziert.`), X(d - a, false, `${tex(`${a}x`)} heißt ${tex(`${a}\\cdot x`)}: teilen, nicht abziehen.`), X(-x0, false, 'Beide Seiten sind positiv – die Lösung auch.')];
      hints = [`Teile beide Seiten durch ${a}.`, `${tex(`x=${d}:${a}`)}.`]; explain = `${tex(`x=${d}:${a}=${x0}`)}.`;
    } else if (L === 2) {
      const a = pick([2, 3, 4, 5, 6]), b = pick([1, 2, 3, 5, 7, -1, -4, -6]), x0 = pick([2, 3, 4, 5, 6, -1, -2, -3]), d = a * x0 + b; art = 'zwei';
      formula = `${lineTex(a, b)}=${ft(d)}`; left = (x) => a * x + b; right = () => d;
      opts = [X(x0, true), X(-x0, false, 'Achte beim Umstellen auf die Vorzeichen.'), X((d + b) / a, false, `Beim Rüberbringen wechselt das Vorzeichen: Auf der rechten Seite steht dann ${tex(`${ft(d)}-${par(b)}`)}.`), X((d - b) * a, false, `Am Ende wird durch den Faktor vor ${tex('x')} geteilt, nicht damit multipliziert.`)];
      hints = [`Erst die Zahl ohne ${tex('x')} wegbringen: auf beiden Seiten ${tex(`${sg(-b)}`)}, es bleibt ${tex(`${a}x=${ft(d - b)}`)}.`, `Dann durch ${a} teilen: ${tex(`x=${ft(d - b)}:${a}`)}.`];
      explain = `${tex(`${a}x=${ft(d)}${sg(-b)}=${ft(d - b)}`)}, also ${tex(`x=${ft(x0)}`)}. Probe: ${tex(`${a}\\cdot ${par(x0)}${sg(b)}=${ft(d)}`)}.`;
    } else if (L === 3) {
      const x0 = pick([2, 3, -2, -3, 5, -4, 6, -5]), a = pick([2, 3, 4, 5, 6, -2, -3]), c = pick([1, 2, -1, -2, 3].filter((v) => v !== a)), b = pick([1, 2, 3, 5, 7, -1, -4, -6]), d = (a - c) * x0 + b; art = 'beidseitig';
      if (a - c === -1) continue;
      formula = `${lineTex(a, b)}=${lineTex(c, d)}`; left = (x) => a * x + b; right = (x) => c * x + d;
      opts = [X(x0, true), X(-x0, false, 'Achte beim Umstellen auf die Vorzeichen.'), X((d + b) / (a - c), false, `Beim Rüberbringen wechselt das Vorzeichen: Auf der rechten Seite steht dann ${tex(`${ft(d)}-${par(b)}`)}.`), X((d - b) / (a + c || 1), false, `Die x-Glieder werden subtrahiert: ${tex(`${kx(a)}-${c === 1 ? '' : par(c)}x`)}.`)];
      hints = [`Alle Glieder mit ${tex('x')} nach links: auf beiden Seiten ${tex(`${c < 0 ? '+' : '-'}${kx(Math.abs(c))}`)}, es bleibt ${tex(`${lineTex(a - c, b)}=${ft(d)}`)}.`, `Die Zahlen nach rechts: auf beiden Seiten ${tex(sg(-b))}, es bleibt ${tex(`${kx(a - c)}=${ft(d - b)}`)}.`, ...(a - c === 1 ? [] : [`Durch ${tex(ft(a - c))} teilen: ${tex(`x=${ft(d - b)}:${par(a - c)}`)}.`])];
      explain = `${a - c === 1 ? `Es bleibt ${tex(`x=${ft(x0)}`)}` : `${tex(`${kx(a - c)}=${ft(d - b)}`)}, also ${tex(`x=${ft(x0)}`)}`}. Probe: Beide Seiten ergeben ${tex(ft(a * x0 + b))}.`;
    } else if (L === 4) {
      const a = pick([2, 3, 4, 5, -2, -3]), p = pick([1, 2, 3, 4, 5, 6, -1, -2, -3, -5]), c = a - pick([2, 4, -2, -4, 6]), x0 = pick([-3.5, -2.5, -1.5, -0.5, 0.5, 1.5, 2.5, 3.5, 4.5, -4, 7]); art = 'klammer';
      if (c === 0 || a + c === 0) continue;
      const d = (a - c) * x0 + a * p;
      formula = `${ft(a)}\\,(x${sg(p)})=${lineTex(c, d)}`; left = (x) => a * (x + p); right = (x) => c * x + d;
      opts = [X(x0, true), X((d - p) / (a - c), false, `Die Klammer auflösen heißt: auch ${tex(`${par(a)}\\cdot ${par(p)}=${ft(a * p)}`)} rechnen, nicht nur ${tex(ft(p))} übernehmen.`), X((d - a * p) / (a + c), false, `Die x-Glieder werden subtrahiert: ${tex(`${kx(a)}-${c === 1 ? '' : par(c)}x`)}.`), X(-x0, false, 'Achte beim Umstellen auf die Vorzeichen – mach die Probe.')];
      hints = [`Klammer auflösen: ${tex(`${lineTex(a, a * p)}=${lineTex(c, d)}`)}.`, `Alle Glieder mit ${tex('x')} nach links (${tex(`${c < 0 ? '+' : '-'}${kx(Math.abs(c))}`)}): ${tex(`${lineTex(a - c, a * p)}=${ft(d)}`)}.`, `Die Zahlen nach rechts (${tex(sg(-a * p))}): ${tex(`${kx(a - c)}=${ft(d - a * p)}`)}.`, `Durch ${tex(ft(a - c))} teilen: ${tex(`x=${ft(d - a * p)}:${par(a - c)}=${ft(x0)}`)}.`];
      explain = `${tex(`${lineTex(a, a * p)}=${lineTex(c, d)}`)}, daraus ${tex(`${kx(a - c)}=${ft(d - a * p)}`)}, also ${tex(`x=${ft(x0)}`)}. Probe: Beide Seiten ergeben ${tex(ft(a * (x0 + p)))}.`;
    } else {
      const a = ri(2, 6), c = ri(2, 5), p = ri(1, 6), q = ri(1, 6), e = pick([-3, -2, -1, 1, 2, 3, 4]), f0 = ri(-12, 12), K = a - c - e, R = f0 - a * p - c * q; art = 'zweiklammern';
      if (Math.abs(K) < 2 || R % K === 0 || Math.abs(R) > 40 || a + c - e === 0 || f0 === 0 || a === c) continue;
      const B = (z, n, correct, why) => ({ tex: `x=${fracTex(z, n)}`, num: z / n, correct, why });
      formula = `${a}(x+${p})-${c}(x-${q})=${lineTex(e, f0)}`; left = (x) => a * (x + p) - c * (x - q); right = (x) => e * x + f0;
      opts = [B(R, K, true), B(f0 - a * p + c * q, K, false, `Minus mal minus ergibt plus: ${tex(`-${c}\\cdot(-${q})=+${c * q}`)}.`), B(R, a + c - e, false, `Die zweite Klammer wird abgezogen: ${tex(`${a}x-${c}x`)}.`), B(-R, K, false, 'Achte beim Rüberbringen der Zahlen auf die Vorzeichen.')];
      hints = [`Beide Klammern auflösen – minus mal minus ergibt plus: ${tex(`${a}x+${a * p}-${c}x+${c * q}=${lineTex(e, f0)}`)}.`, `Links zusammenfassen: ${tex(`${lineTex(a - c, a * p + c * q)}=${lineTex(e, f0)}`)}.`, `Alle Glieder mit ${tex('x')} nach links (${tex(`${e < 0 ? '+' : '-'}${kx(Math.abs(e))}`)}), die Zahlen nach rechts (${tex(`-${a * p + c * q}`)}): ${tex(`${kx(K)}=${ft(R)}`)}.`, `Durch ${tex(ft(K))} teilen${gcd(R, K) > 1 ? ' und kürzen' : ''}: ${tex(`x=${bruch(R * Math.sign(K), Math.abs(K))}${gcd(R, K) > 1 ? `=${fracTex(R, K)}` : ''}`)}.`];
      explain = `${tex(`${lineTex(a - c, a * p + c * q)}=${lineTex(e, f0)}`)}, daraus ${tex(`${kx(K)}=${ft(R)}`)}, also ${tex(`x=${fracTex(R, K)}\\approx ${ft(R / K, 3)}`)}.`;
    }
    if (!uniqNum(opts) || !uniq(opts) || opts.slice(1).some((o) => Math.abs(left(o.num) - right(o.num)) < 1e-6)) continue;
    return { prompt: 'Löse die Gleichung.', formula, options: shuffle(opts), hints, explain, left, right, art };
  }
}

/** Quadratische Gleichung lösen. */
export function genQuadGl(lv = 3) {
  for (;;) {
    const L = S(lv), mk = (xs, correct, why) => { const s = [...xs].sort((x, y) => x - y); return { tex: `x_1=${ft(s[0])},\\quad x_2=${ft(s[1])}`, xs: s, correct, why }; };
    let formula, opts, hints, explain, f, art;
    if (L === 1) {
      const c = ri(3, 9), q = c * c; art = 'rein';
      formula = `x^2=${q}`; f = (x) => x * x - q;
      opts = [mk([-c, c], true), mk([-q, q], false, 'Hier fehlt das Wurzelziehen.'), mk([-q / 2, q / 2], false, 'Die Wurzel ziehen heißt nicht halbieren.'), mk([0, c], false, `Auch ${tex(`-${c}`)} löst die Gleichung, ${tex('0')} dagegen nicht.`)];
      hints = ['Ziehe die Wurzel – es gibt eine positive und eine negative Lösung.', `${tex(`\\sqrt{${q}}=${c}`)}.`];
      explain = `${tex(`x=\\pm\\sqrt{${q}}=\\pm ${c}`)}.`;
    } else if (L === 2 && rand() < 0.5) {
      const p = pick([1, 2, 3, 4, 5, 6, 7, 8, 9, -2, -3, -4, -5, -6, -7, -8, -9]); art = 'ausklammern';
      formula = `${polyTex([0, p, 1])}=0`; f = (x) => x * x + p * x;
      opts = [mk([0, -p], true), mk([0, p], false, `Aus ${tex(`x${sg(p)}=0`)} folgt ${tex(`x=${ft(-p)}`)} – das Vorzeichen dreht sich um.`), mk([-Math.abs(p), Math.abs(p)], false, `${tex('x=0')} ist eine Lösung – und nur eine der beiden anderen Zahlen passt.`), mk([1, -p], false, `Ein Produkt ist null, wenn ein Faktor null ist: also ${tex('x=0')}, nicht ${tex('x=1')}.`)];
      hints = [`Ausklammern: ${tex(`x\\,(x${sg(p)})=0`)}.`, `Ein Produkt ist null, wenn ein Faktor null ist: ${tex('x=0')} oder ${tex(`x${sg(p)}=0`)}.`];
      explain = `${tex(`x\\,(x${sg(p)})=0`)}, also ${tex('x=0')} oder ${tex(`x=${ft(-p)}`)}.`;
    } else if (L === 2) {
      const a = pick([2, 3, 4, 5]), c = ri(2, 6), q = c * c; art = 'reinfaktor';
      formula = `${a}x^2-${a * q}=0`; f = (x) => a * x * x - a * q;
      opts = [mk([-c, c], true), mk([-q, q], false, 'Hier fehlt das Wurzelziehen.'), mk([-a * c, a * c], false, `Erst durch ${a} teilen, dann die Wurzel ziehen – der Faktor ${a} gehört nicht zur Lösung.`), mk([0, c], false, `Auch ${tex(`-${c}`)} löst die Gleichung, ${tex('0')} dagegen nicht.`)];
      hints = [`Bringe die Zahl nach rechts und teile durch ${a}: ${tex(`x^2=${a * q}:${a}=${q}`)}.`, `Wurzel ziehen – mit beiden Vorzeichen: ${tex(`\\sqrt{${q}}=${c}`)}.`];
      explain = `${tex(`${a}x^2=${a * q}`)}, also ${tex(`x^2=${q}`)} und ${tex(`x=\\pm ${c}`)}.`;
    } else if (L === 3) {
      const r1 = ri(-6, 5), r2 = ri(r1 + 1, 6), p = -(r1 + r2), q = r1 * r2, h = -p / 2, w = (r2 - r1) / 2; art = 'pq';
      if (r1 === -r2 || q === 0) continue;
      formula = `${polyTex([q, p, 1])}=0`; f = (x) => (x - r1) * (x - r2);
      opts = [mk([r1, r2], true), mk([-r2, -r1], false, `Vorzeichen: Bei ${tex('x^2+px+q=0')} ist ${tex('x_{1,2}=-\\tfrac p2\\pm\\dots')} – das Minus vor ${tex('\\tfrac p2')} nicht vergessen.`), mk([r1 + r2, q], false, 'Das sind Summe und Produkt der Lösungen, nicht die Lösungen selbst.'), mk([r1, -r2], false, 'Eine Lösung hat das falsche Vorzeichen. Mach die Probe durch Einsetzen.')];
      hints = [`pq-Formel mit ${tex(`p=${ft(p)}`)} und ${tex(`q=${ft(q)}`)}: ${tex('x_{1,2}=-\\dfrac p2\\pm\\sqrt{\\left(\\dfrac p2\\right)^2-q}')}.`, `Einsetzen: ${tex(`x_{1,2}=${ft(h)}\\pm\\sqrt{${ft(h * h)}${sg(-q)}}`)}.`, `Unter der Wurzel steht ${tex(ft(w * w))}, die Wurzel ist ${tex(ft(w))}.`, `${tex(`x_1=${ft(h)}-${ft(w)}=${r1}`)} und ${tex(`x_2=${ft(h)}+${ft(w)}=${r2}`)}.`];
      explain = `pq-Formel: ${tex(`x_{1,2}=${ft(h)}\\pm\\sqrt{${ft(h * h)}${sg(-q)}}=${ft(h)}\\pm ${ft(w)}`)}, also ${tex(`x_1=${r1}`)} und ${tex(`x_2=${r2}`)}. Probe: Das Produkt der Lösungen ist ${tex(`q=${ft(q)}`)}.`;
    } else {
      const k = pick(L === 4 ? [2, -2, 4, 3, -3, 5] : [2, -2, 4, -4, 3, -3]), teil = Math.abs(k) === 4 ? (L === 5 ? 4 : 2) : Math.abs(k) === 2 ? 2 : 1;
      let w1 = teil === 1 ? ri(-6, 6) : (2 * ri(-2 * teil, 2 * teil) + 1) / teil, w2 = ri(-6, 7);
      if (w1 === w2 || w1 === -w2 || w1 * w2 === 0) continue;
      if (w1 > w2) [w1, w2] = [w2, w1];
      const a = k, b = rd(-k * (w1 + w2)), c = rd(k * w1 * w2), D = b * b - 4 * a * c, w = Math.abs(k) * (w2 - w1);
      if (!Number.isInteger(b) || !Number.isInteger(c)) continue;
      const R1 = L === 5 ? pick([-6, -5, -4, -3, -2, 2, 3, 4, 5, 6]) : 0, R0 = L === 5 ? pick([-9, -7, -5, -3, 2, 4, 6, 8]) : 0; art = L === 5 ? 'umformen' : 'abc';
      if (L === 5 && (b + R1 === 0 || c + R0 === 0)) continue;
      formula = L === 5 ? `${polyTex([c + R0, b + R1, a])}=${lineTex(R1, R0)}` : `${polyTex([c, b, a])}=0`; f = (x) => a * x * x + b * x + c;
      opts = [mk([w1, w2], true), mk([-w2, -w1], false, `Vorzeichen: In der Formel steht ${tex('-b')} – hier also ${tex(ft(-b))}.`), mk([k * w1, k * w2], false, `Geteilt wird durch ${tex(`2a=${ft(2 * a)}`)}, nicht nur durch 2.`), mk([w1, -w2], false, 'Eine Lösung hat das falsche Vorzeichen. Mach die Probe durch Einsetzen.')];
      hints = [...(L === 5 ? [`Alles auf eine Seite bringen (${tex(`${R1 < 0 ? '+' : '-'}${kx(Math.abs(R1))}`)} und ${tex(sg(-R0))}): ${tex(`${polyTex([c, b, a])}=0`)}.`] : []),
        `Mitternachtsformel mit ${tex(`a=${ft(a)}`)}, ${tex(`b=${ft(b)}`)}, ${tex(`c=${ft(c)}`)}: ${tex('x_{1,2}=\\dfrac{-b\\pm\\sqrt{b^2-4ac}}{2a}')}.`,
        `Unter der Wurzel: ${tex(`${par(b)}^2-4\\cdot ${par(a)}\\cdot ${par(c)}=${ft(b * b)}${sg(-4 * a * c)}=${ft(D)}`)}, die Wurzel ist ${tex(ft(w))}.`,
        `${tex(`x_{1,2}=\\dfrac{${ft(-b)}\\pm ${ft(w)}}{${ft(2 * a)}}`)}.`, `Beide Vorzeichen ausrechnen: ${tex(`\\dfrac{${ft(-b + w)}}{${ft(2 * a)}}=${ft((-b + w) / (2 * a))}`)} und ${tex(`\\dfrac{${ft(-b - w)}}{${ft(2 * a)}}=${ft((-b - w) / (2 * a))}`)}.`];
      explain = `${L === 5 ? `Umgeformt: ${tex(`${polyTex([c, b, a])}=0`)}. ` : ''}Mitternachtsformel: ${tex(`x_{1,2}=\\dfrac{${ft(-b)}\\pm\\sqrt{${ft(D)}}}{${ft(2 * a)}}=\\dfrac{${ft(-b)}\\pm ${ft(w)}}{${ft(2 * a)}}`)}, also ${tex(`x_1=${ft(w1)}`)} und ${tex(`x_2=${ft(w2)}`)}.`;
    }
    if (!uniq(opts) || opts.slice(1).some((o) => o.xs[0] === o.xs[1] || o.xs.every((x) => Math.abs(f(x)) < 1e-6))) continue;
    return { prompt: 'Löse die Gleichung.', formula, options: shuffle(opts), hints, explain, f, art };
  }
}

/** Potenzgesetze. */
export function genPotenz(lv = 3) {
  for (;;) {
    const L = S(lv), kind = pick([['mal'], ['mal3', 'hoch', 'durch'], ['durch', 'neg', 'kombi'], ['wurzel', 'negdurch', 'negkombi'], ['wurzelkombi', 'wurzelhoch']][L - 1]);
    const a = L === 1 ? ri(2, 4) : ri(2, 6), b = L === 1 ? ri(2, 4) : ri(2, 5);
    // Potenz von x mit Bruch-Hochzahl n/d (gekürzt); „hoch 1“ und „hoch 0“ werden nie geschrieben
    const xe = (n, d = 1) => { const g = gcd(n, d) || 1, nn = (n / g) * Math.sign(d), dd = Math.abs(d / g); return dd === 1 ? (nn === 1 ? 'x' : nn === 0 ? '1' : `x^{${nn}}`) : `x^{${nn < 0 ? '-' : ''}\\frac{${Math.abs(nn)}}{${dd}}}`; };
    const Q = (n, d, correct, why) => ({ tex: xe(n, d), correct, why, val: (x) => x ** (n / d) });
    const E = (e, correct, why) => Q(e, 1, correct, why);
    const wz = (n, innen) => (n === 2 ? `\\sqrt{${innen}}` : `\\sqrt[${n}]{${innen}}`);
    let formula, f, opts, hints, explain;
    if (kind === 'mal') { formula = `x^{${a}}\\cdot x^{${b}}`; f = (x) => x ** a * x ** b;
      opts = [E(a + b, true), E(a * b, false, 'Beim Multiplizieren gleicher Basen werden die Exponenten addiert.'), E(a - b, false, 'Subtrahiert wird beim Dividieren.'), { tex: `2x^{${a + b}}`, correct: false, why: 'Es entsteht kein zusätzlicher Faktor 2.', val: (x) => 2 * x ** (a + b) }];
      hints = ['Gleiche Basis, dazwischen ein Malpunkt: Die Exponenten werden addiert.', `${tex(`${a}+${b}=${a + b}`)}.`]; explain = `${tex(`${formula}=x^{${a}+${b}}=${opts[0].tex}`)}.`; }
    else if (kind === 'mal3') { const c = ri(2, 6); formula = `x^{${a}}\\cdot x^{${b}}\\cdot x^{${c}}`; f = (x) => x ** a * x ** b * x ** c;
      opts = [E(a + b + c, true), E(a * b * c, false, 'Beim Multiplizieren gleicher Basen werden die Exponenten addiert.'), E(a + b, false, 'Auch der Exponent des dritten Faktors wird addiert.'), { tex: `3x^{${a + b + c}}`, correct: false, why: 'Es entsteht kein zusätzlicher Faktor 3.', val: (x) => 3 * x ** (a + b + c) }];
      hints = ['Gleiche Basis, dazwischen Malpunkte: Alle Exponenten werden addiert.', `${tex(`${a}+${b}+${c}=${a + b + c}`)}.`]; explain = `${tex(`${formula}=x^{${a}+${b}+${c}}=${opts[0].tex}`)}.`; }
    else if (kind === 'hoch') { formula = `\\left(x^{${a}}\\right)^{${b}}`; f = (x) => (x ** a) ** b;
      opts = [E(a * b, true), E(a + b, false, 'Beim Potenzieren einer Potenz werden die Exponenten multipliziert.'), (a ** b > 99 ? E(a, false, `Der äußere Exponent ${b} darf nicht wegfallen: Die Exponenten werden multipliziert.`) : E(a ** b, false, 'Die Exponenten werden multipliziert, nicht potenziert.')), E(a * b + 1, false, `Rechne ${tex(`${a}\\cdot${b}`)}.`)];
      hints = ['Potenz einer Potenz: Die Exponenten werden multipliziert.', `${tex(`${a}\\cdot ${b}=${a * b}`)}.`]; explain = `${tex(`${formula}=x^{${a}\\cdot ${b}}=${opts[0].tex}`)}.`; }
    else if (kind === 'durch') { if (a === b || (L === 2 && a < b + 2) || (L >= 3 && a > b)) continue; formula = `\\dfrac{x^{${a}}}{x^{${b}}}`; f = (x) => x ** a / x ** b;
      opts = [E(a - b, true), E(b - a, false, 'Exponent des Zählers minus Exponent des Nenners.'), E(a + b, false, 'Addiert wird beim Multiplizieren.'), E(a * b, false, 'Beim Dividieren gleicher Basen werden die Exponenten subtrahiert.')];
      hints = ['Gleiche Basis, Bruchstrich: Exponent des Zählers minus Exponent des Nenners.', `${tex(`${a}-${b}=${a - b}`)}.`, ...(a < b ? [`Ein negativer Exponent bedeutet Kehrwert: ${tex(`x^{${a - b}}=\\dfrac{1}{${xe(b - a)}}`)}.`] : [])];
      explain = `${tex(`${formula}=x^{${a}-${b}}=${opts[0].tex}`)}.`; }
    else if (kind === 'kombi') { const c = ri(2, 6), e = a + b - c; if (e === 0 || e === 1) continue; formula = `\\dfrac{x^{${a}}\\cdot x^{${b}}}{x^{${c}}}`; f = (x) => (x ** a * x ** b) / x ** c;
      opts = [E(e, true), E(a * b - c, false, 'Beim Multiplizieren gleicher Basen werden die Exponenten addiert, nicht multipliziert.'), E(a + b + c, false, 'Der Exponent des Nenners wird subtrahiert.'), E(a - b + c, false, 'Zähler: Exponenten addieren. Dann den Exponenten des Nenners abziehen.')];
      hints = [`Erst der Zähler – gleiche Basis, Malpunkt, Exponenten addieren: ${tex(`x^{${a}}\\cdot x^{${b}}=x^{${a + b}}`)}.`, `Dann der Bruch – Exponent des Nenners abziehen: ${tex(`${a + b}-${c}=${e}`)}.`];
      explain = `${tex(`${formula}=\\dfrac{x^{${a + b}}}{x^{${c}}}=x^{${a + b}-${c}}=${opts[0].tex}`)}.`; }
    else if (kind === 'negdurch') { formula = `\\dfrac{x^{-${a}}}{x^{${b}}}`; f = (x) => x ** -a / x ** b;
      opts = [E(-(a + b), true), E(b - a, false, `Exponent des Zählers minus Exponent des Nenners: ${tex(`-${a}-${b}`)}.`), E(-(a * b), false, 'Beim Dividieren werden die Exponenten subtrahiert, nicht multipliziert.'), E(a + b, false, 'Das Vorzeichen fehlt: Der Exponent bleibt negativ.')];
      hints = ['Gleiche Basis, Bruchstrich: Exponent des Zählers minus Exponent des Nenners.', `Der Exponent des Zählers ist schon negativ: ${tex(`-${a}-${b}=-${a + b}`)}.`, `Ein negativer Exponent bedeutet Kehrwert: ${tex(`x^{-${a + b}}=\\dfrac{1}{x^{${a + b}}}`)}.`];
      explain = `${tex(`${formula}=x^{-${a}-${b}}=${opts[0].tex}`)}.`; }
    else if (kind === 'negkombi') { const c = ri(2, 6), e = -a + b + c; if (b === a || e === 1) continue; formula = `\\dfrac{x^{-${a}}\\cdot x^{${b}}}{x^{-${c}}}`; f = (x) => (x ** -a * x ** b) / x ** -c;
      opts = [E(e, true), E(-a + b - c, false, `Abgezogen wird der Exponent des Nenners, und der ist negativ: ${tex(`-(-${c})=+${c}`)}.`), E(-a * b + c, false, 'Beim Multiplizieren gleicher Basen werden die Exponenten addiert, nicht multipliziert.'), E(a + b + c, false, `Der Exponent ${tex(`-${a}`)} bleibt negativ.`)];
      hints = [`Zähler – Exponenten addieren: ${tex(`-${a}+${b}=${b - a}`)}.`, `Bruch – Exponent des Nenners abziehen, minus minus ergibt plus: ${tex(`${b - a}-(-${c})=${b - a}+${c}=${e}`)}.`, ...(e < 0 ? [`Ein negativer Exponent bedeutet Kehrwert: ${tex(`x^{${e}}=\\dfrac{1}{${xe(-e)}}`)}.`] : [])];
      explain = `${tex(`${formula}=x^{-${a}+${b}-(-${c})}=${opts[0].tex}`)}.`; }
    else if (kind === 'neg') { formula = `x^{-${a}}`; f = (x) => x ** -a;
      opts = [{ tex: `\\dfrac{1}{x^{${a}}}`, correct: true, val: (x) => 1 / x ** a }, { tex: `-x^{${a}}`, correct: false, why: 'Ein negativer Exponent bedeutet „Kehrwert“, nicht „negatives Vorzeichen“.', val: (x) => -(x ** a) }, { tex: `-${a}x`, correct: false, why: 'Der Exponent ist kein Faktor.', val: (x) => -a * x }, { tex: `\\dfrac{1}{x^{-${a}}}`, correct: false, why: `Das wäre ${tex(`x^{${a}}`)}.`, val: (x) => x ** a }];
      hints = ['Ein negativer Exponent bedeutet: Kehrwert bilden.', `Die Potenz wandert in den Nenner, der Exponent wird dort positiv: ${tex('x^{-n}=\\dfrac{1}{x^n}')}.`]; explain = `${tex(`${formula}=${opts[0].tex}`)}.`; }
    else if (kind === 'wurzel') { const n = pick([2, 3, 4, 5]), m = pick([1, 2, 3, 5, 6].filter((v) => v !== n)); formula = wz(n, xe(m)); f = (x) => (x ** m) ** (1 / n);
      opts = [Q(m, n, true), Q(n, m, false, 'Der Wurzelexponent steht im Nenner des Bruchs.'), Q(m * n, 1, false, 'Eine Wurzel verkleinert den Exponenten: Er wird geteilt, nicht multipliziert.'), Q(m - n, 1, false, 'Der Exponent wird durch den Wurzelexponenten geteilt, nicht vermindert.')];
      hints = [`Eine Wurzel ist eine Potenz mit einem Bruch als Exponent: ${tex('\\sqrt[n]{x^m}=x^{\\frac mn}')}.`, `Hier ist ${tex(`m=${m}`)} und ${tex(`n=${n}`)}${n === 2 ? ' (Quadratwurzel)' : ''}: Exponent ${tex(`\\tfrac{${m}}{${n}}`)}.`, ...(gcd(m, n) > 1 ? [`Kürzen: ${tex(`\\tfrac{${m}}{${n}}=${fracTex(m, n).replace('\\dfrac', '\\tfrac')}`)}.`] : [])];
      explain = `${tex(`${formula}=x^{\\frac{${m}}{${n}}}${gcd(m, n) > 1 ? `=${opts[0].tex}` : ''}`)}.`; }
    else if (kind === 'wurzelkombi') { const n = pick([2, 3, 4]), m = pick([1, 3, 5].filter((v) => gcd(v, n) === 1)), p = ri(2, 5), q = ri(1, 7); if (p === q) continue;
      formula = `\\dfrac{${wz(n, xe(m))}\\cdot x^{${p}}}{${xe(q)}}`; f = (x) => ((x ** m) ** (1 / n) * x ** p) / x ** q;
      opts = [Q(m + n * (p - q), n, true), Q(n + m * (p - q), m, false, `Der Wurzelexponent ${n} gehört in den Nenner des Bruchs: ${tex(`\\tfrac{${m}}{${n}}`)}.`), Q(m * p - n * q, n, false, 'Beim Multiplizieren gleicher Basen werden die Exponenten addiert, nicht multipliziert.'), Q(m + n * (p + q), n, false, 'Der Exponent des Nenners wird abgezogen, nicht addiert.')];
      hints = [`Wurzel als Potenz schreiben: ${tex(`${wz(n, xe(m))}=x^{\\frac{${m}}{${n}}}`)}.`, `Zähler – Exponenten addieren (gleichnamig machen): ${tex(`\\tfrac{${m}}{${n}}+${p}=\\tfrac{${m}}{${n}}+\\tfrac{${n * p}}{${n}}=\\tfrac{${m + n * p}}{${n}}`)}.`, `Bruch – Exponent des Nenners abziehen: ${tex(`\\tfrac{${m + n * p}}{${n}}-${q}=\\tfrac{${m + n * p}}{${n}}-\\tfrac{${n * q}}{${n}}=\\tfrac{${m + n * (p - q)}}{${n}}`)}.`, ...(m + n * (p - q) < 0 ? ['Der Exponent ist negativ: Die Potenz steht also im Nenner (Kehrwert).'] : [])];
      explain = `${tex(`${formula}=x^{\\frac{${m}}{${n}}+${p}-${q}}=${opts[0].tex}`)}.`; }
    else { const n = pick([2, 3, 4]), m = pick([1, 3, 5].filter((v) => gcd(v, n) === 1)), k = pick([2, 3, 5].filter((v) => gcd(v, n) === 1 && v !== m)), p = ri(1, 4); if (m * k - n * p === 0 || n * k === m) continue;
      formula = `\\left(${wz(n, xe(m))}\\right)^{${k}}\\cdot x^{-${p}}`; f = (x) => ((x ** m) ** (1 / n)) ** k * x ** -p;
      opts = [Q(m * k - n * p, n, true), Q(m + n * k - n * p, n, false, 'Potenz einer Potenz: Die Exponenten werden multipliziert, nicht addiert.'), Q(m * k + n * p, n, false, `Der Exponent ${tex(`-${p}`)} ist negativ – er wird abgezogen.`), Q(n * k - m * p, m, false, `Der Wurzelexponent ${n} gehört in den Nenner des Bruchs: ${tex(`\\tfrac{${m}}{${n}}`)}.`)];
      hints = [`Wurzel als Potenz schreiben: ${tex(`${wz(n, xe(m))}=x^{\\frac{${m}}{${n}}}`)}.`, `Potenz einer Potenz – Exponenten multiplizieren: ${tex(`\\tfrac{${m}}{${n}}\\cdot ${k}=\\tfrac{${m * k}}{${n}}`)}.`, `Malpunkt – Exponenten addieren (gleichnamig machen): ${tex(`\\tfrac{${m * k}}{${n}}+(-${p})=\\tfrac{${m * k}}{${n}}-\\tfrac{${n * p}}{${n}}=\\tfrac{${m * k - n * p}}{${n}}`)}.`, ...(m * k - n * p < 0 ? ['Der Exponent ist negativ: Die Potenz steht also im Nenner (Kehrwert).'] : [])];
      explain = `${tex(`${formula}=x^{\\frac{${m}}{${n}}\\cdot ${k}-${p}}=${opts[0].tex}`)}.`; }
    const X0 = 1.7;
    if (!uniq(opts) || opts.some((o, i) => opts.some((p, j) => i < j && Math.abs(o.val(X0) - p.val(X0)) < 1e-9))) continue;
    return { prompt: 'Vereinfache.', formula, options: shuffle(opts), hints, explain, f, domain: 'pos', art: kind };
  }
}

/** Steigung bzw. Gleichung einer Geraden durch zwei Punkte. */
export function genSteigung(lv = 3) {
  for (;;) {
    const L = S(lv), gl = L >= 4 || (L === 3 && rand() < 0.5);
    let m, x1, dx, y1;
    if (L === 1) { m = pick([2, 3, 4]); x1 = pick([0, 1, 2]); dx = pick([2, 3]); y1 = ri(0, 4); }
    else if (L === 2) { m = pick([2, 3, 4, -1, -2, -3]); x1 = pick([-3, -2, -1, 1, 2]); dx = pick([2, 3, 4]); y1 = ri(-4, 5); }
    else if (L === 3) { m = gl ? pick([2, -2, 3, -3, 4, -1]) : pick([0.5, -0.5, 1.5, -1.5, 2.5, 0.25, -0.75]); x1 = pick([-4, -3, -2, -1, 1, 2]); dx = gl ? pick([2, 3, 4]) : pick([4, 8]); y1 = ri(-5, 6); }
    else if (L === 4) { m = pick([0.5, -0.5, 1.5, -1.5, 2.5, -2.5]); x1 = pick([-5, -3, -1, 1, 3]); dx = pick([2, 4, 6]); y1 = ri(-6, 7); }
    else { m = pick([0.75, -1.25, 1.75, -0.25, -0.75, 1.25]); x1 = pick([-6, -4, -2, 2, 4]); dx = pick([2, 6, 10]); y1 = ri(-9, 9) + 0.5; }
    const x2 = x1 + dx, y2 = y1 + m * dx, dy = y2 - y1, b = y1 - m * x1;
    if (dy === 0) continue;
    const head = `${pt('P', [x1, y1])},\\quad ${pt('Q', [x2, y2])}`, quot = `\\dfrac{${ft(y2)}-${par(y1)}}{${ft(x2)}-${par(x1)}}`;
    if (!gl) {
      const opts = [N(m, true), N(dx / dy, false, 'Unterschied der y-Werte geteilt durch Unterschied der x-Werte – nicht umgekehrt.', Math.abs((dx / dy) * 1000 - Math.round((dx / dy) * 1000)) < 1e-9 ? ft(dx / dy, 3) : fracTex(Math.round(dx * 4), Math.round(dy * 4))), N(-m, false, 'Zähler und Nenner müssen in derselben Reihenfolge der Punkte gebildet werden.'), N(dy, false, 'Das ist nur der Höhenunterschied. Es fehlt das Teilen durch den x-Unterschied.')];
      if (!uniqNum(opts) || !uniq(opts)) continue;
      const hints = L === 1 ? [`Von ${tex('P')} nach ${tex('Q')} geht es ${dx} nach rechts und ${dy} nach oben.`, `Steigung = Höhenunterschied geteilt durch Seitenunterschied: ${tex(`${dy}:${dx}`)}.`]
        : [`Unterschied der y-Werte: ${tex(`${ft(y2)}-${par(y1)}=${ft(dy)}`)}.`, `Unterschied der x-Werte: ${tex(`${ft(x2)}-${par(x1)}=${ft(dx)}`)}.`, `Steigung: ${tex(`m=\\dfrac{${ft(dy)}}{${ft(dx)}}`)}.`];
      return { prompt: 'Welche Steigung hat die Gerade durch die beiden Punkte?', formula: head, options: shuffle(opts), hints, explain: L === 1 ? `${tex(`m=${dy}:${dx}=${ft(m)}`)}.` : `${tex(`m=${quot}=\\dfrac{${ft(dy)}}{${ft(dx)}}=${ft(m)}`)}.`, kind: 'm', P: [x1, y1], Q: [x2, y2], art: 'steigung' };
    }
    const Ln = (M, B, correct, why) => ({ tex: `y=${lineTex(M, B)}`, correct, why, val: (x) => M * x + B });
    const opts = [Ln(m, b, true), Ln(m, y1, false, `${tex('b')} ist der y-Achsenabschnitt, nicht der y-Wert von ${tex('P')}. Setze ${tex('P')} in ${tex('y=mx+b')} ein.`), Ln(m, y1 + m * x1, false, `Vorzeichen: ${tex('b=y_1-m\\cdot x_1')}.`), Ln(-m, y1 + m * x1, false, 'Die Steigung hat das falsche Vorzeichen.')];
    if (!uniq(opts) || b === y1 + m * x1) continue;
    return { prompt: 'Welche Gleichung hat die Gerade durch die beiden Punkte?', formula: head, options: shuffle(opts),
      hints: [`Erst die Steigung: ${tex(`m=${quot}=\\dfrac{${ft(dy)}}{${ft(dx)}}=${ft(m)}`)}.`, `Punkt ${tex('P')} in ${tex('y=mx+b')} einsetzen: ${tex(`${ft(y1)}=${par(m)}\\cdot ${par(x1)}+b`)}.`, `Nach ${tex('b')} auflösen: ${tex(`b=${ft(y1)}-${par(m * x1)}=${ft(b)}`)}.`, `Probe mit ${tex('Q')}: ${tex(`${par(m)}\\cdot ${par(x2)}${sg(b)}=${ft(y2)}`)}.`],
      explain: `${tex(`m=\\dfrac{${ft(dy)}}{${ft(dx)}}=${ft(m)}`)} und ${tex(`b=${ft(y1)}-${par(m)}\\cdot${par(x1)}=${ft(b)}`)}, also ${tex(`y=${lineTex(m, b)}`)}.`, kind: 'gl', P: [x1, y1], Q: [x2, y2], art: 'gleichung' };
  }
}

/* ───────────── Stochastik: Grundlagen ───────────── */

/** Häufigkeitstabelle als Formel (zwei Zeilen). */
const tabelle = (kopf, werte, zeile, zahlen) => `\\begin{array}{l|${'c'.repeat(werte.length)}}\\text{${kopf}}&${werte.join('&')}\\\\\\hline\\text{${zeile}}&${zahlen.join('&')}\\end{array}`;

/** Relative Häufigkeit. */
export function genHaeufigkeit(lv = 3) {
  for (;;) {
    const L = S(lv), art = pick([['erweitern'], ['teilen'], ['kategorien'], ['tabelle'], ['chargen', 'rest', 'luecke']][L - 1]);
    const P = (v, correct, why) => ({ tex: `${Math.abs(v * 10 - Math.round(v * 10)) < 1e-9 ? '' : '\\approx '}${ft(v, 1)}\\,\\%`, num: v, correct, why });
    const AB = (k) => ({ tex: String(k), num: k, correct: false, why: 'Das ist die absolute Häufigkeit. Die relative Häufigkeit ist der Anteil an allen.' });
    const proz = (k, n) => `${ft((k / n) * 100, 1)}\\,\\%`, dez = (k, n) => `${Math.abs((k / n) * 1000 - Math.round((k / n) * 1000)) < 1e-9 ? '=' : '\\approx '}${ft(k / n, 3)}`;
    let n, k, prompt, formula, opts, hints, explain, roh;
    if (art === 'erweitern' || art === 'teilen') {
      n = pick(art === 'erweitern' ? [10, 20, 25, 50] : [8, 16, 40, 80, 125, 250]); k = ri(Math.ceil(n * 0.1), Math.floor(n * 0.9));
      const pct = (k / n) * 100;
      if (Math.abs(pct * 10 - Math.round(pct * 10)) > 1e-9 || k * 2 === n) continue;
      const ctx = pick([['Bei', 'Würfen einer Münze fiel', '-mal Kopf', 'für „Kopf“'], ['Von', 'befragten Schülern kommen', 'mit dem Fahrrad', 'für „mit dem Fahrrad“'], ['Bei', 'Drehungen eines Glücksrads gab es', '-mal einen Gewinn', 'für „Gewinn“'], ['Von', 'geprüften Bauteilen waren', 'fehlerhaft', 'der fehlerhaften Bauteile']]);
      prompt = `${ctx[0]} ${n} ${ctx[1]} ${k}${ctx[2].startsWith('-') ? '' : ' '}${ctx[2]}. Wie groß ist die relative Häufigkeit ${ctx[3]}?`;
      opts = [P(pct, true), P((k / (n - k)) * 100, false, 'Geteilt wird durch die Gesamtzahl, nicht durch die übrigen Fälle.'), P(((n - k) / n) * 100, false, 'Das ist der Anteil der anderen Fälle (Gegenereignis).'), AB(k)];
      if (art === 'erweitern') { hints = [`Schreibe den Anteil als Bruch: ${k} von ${n}.`, `Bringe den Nenner auf 100: ${tex(`\\tfrac{${k}}{${n}}=\\tfrac{${pct}}{100}`)}.`]; explain = `${tex(`\\dfrac{${k}}{${n}}=\\dfrac{${pct}}{100}=${pct}\\,\\%`)}.`; }
      else { hints = ['Relative Häufigkeit = Anzahl der Treffer geteilt durch die Gesamtzahl.', `Teile schriftlich: ${tex(`${k}:${n}=${ft(k / n, 4)}`)}.`, `Als Prozentzahl – das Komma zwei Stellen nach rechts: ${tex(proz(k, n))}.`]; explain = `${tex(`\\dfrac{${k}}{${n}}=${ft(k / n, 4)}=${proz(k, n)}`)}.`; }
      roh = { n, k };
    } else if (art === 'kategorien') {
      const [frage, namen] = pick([['Eine Klasse wird gefragt, wie die Kinder zur Schule kommen', ['mit dem Fahrrad', 'mit dem Bus', 'zu Fuß']], ['In einem Verein wird die Lieblingssportart erfragt', ['Fußball', 'Handball', 'Schwimmen']], ['Bei einer Verkehrszählung werden Fahrzeuge notiert', ['Autos', 'Lastwagen', 'Fahrräder']]]);
      const z = [ri(4, 30), ri(4, 30), ri(4, 30)], i = ri(0, 2); n = z[0] + z[1] + z[2]; k = z[i];
      const pct = (k / n) * 100;
      if (Math.abs(pct * 10 - Math.round(pct * 10)) > 1e-9 || k * 2 === n || new Set(z).size < 3) continue;
      prompt = `${frage}: ${z[0]} ${namen[0]}, ${z[1]} ${namen[1]}, ${z[2]} ${namen[2]}. Wie groß ist die relative Häufigkeit für „${namen[i]}“?`;
      opts = [P(pct, true), P((k / (n - k)) * 100, false, 'Geteilt wird durch die Gesamtzahl, nicht durch die übrigen Fälle.'), P(((n - k) / n) * 100, false, 'Das ist der Anteil der anderen Fälle (Gegenereignis).'), AB(k)];
      hints = [`Die Gesamtzahl steht nicht da – erst addieren: ${tex(`${z[0]}+${z[1]}+${z[2]}=${n}`)}.`, `Anteil: ${tex(`${k}:${n}=${ft(k / n, 4)}`)}.`, `Als Prozentzahl: ${tex(proz(k, n))}.`];
      explain = `Gesamtzahl ${tex(`${z.join('+')}=${n}`)}, relative Häufigkeit ${tex(`\\dfrac{${k}}{${n}}=${ft(k / n, 4)}=${proz(k, n)}`)}.`; roh = { z, i };
    } else if (art === 'tabelle') {
      const [text, kopf, werte, zeile, ereignisse] = pick([
        ['Die Tabelle zeigt den Notenspiegel einer Klassenarbeit.', 'Note', [1, 2, 3, 4, 5, 6], 'Anzahl', [['die Note 2 oder besser', [0, 1]], ['eine Note schlechter als 4', [4, 5]], ['die Note 3 oder 4', [2, 3]], ['mindestens die Note 3 (also 1, 2 oder 3)', [0, 1, 2]]]],
        ['Die Tabelle zeigt, wie viele Tore in den Spielen einer Saison fielen.', 'Tore', [0, 1, 2, 3, 4, 5], 'Spiele', [['mindestens 3 Tore', [3, 4, 5]], ['höchstens 1 Tor', [0, 1]], ['genau 2 oder 3 Tore', [2, 3]], ['mehr als 3 Tore', [4, 5]]]],
        ['Die Tabelle zeigt, wie viele Geschwister die Kinder einer Jahrgangsstufe haben.', 'Geschwister', [0, 1, 2, 3, 4], 'Kinder', [['mindestens 2 Geschwister', [2, 3, 4]], ['höchstens 1 Geschwisterkind', [0, 1]], ['mehr als 2 Geschwister', [3, 4]]]]]);
      const z = werte.map((_, j) => ri(j === 0 || j === werte.length - 1 ? 1 : 3, j === 0 || j === werte.length - 1 ? 6 : 14)), [was, idx] = pick(ereignisse);
      n = z.reduce((s, x) => s + x, 0); k = idx.reduce((s, j) => s + z[j], 0);
      if (k * 2 === n) continue;
      prompt = `${text} Wie groß ist die relative Häufigkeit für „${was}“?`; formula = tabelle(kopf, werte, zeile, z);
      opts = [P((k / n) * 100, true), P((k / (n - k)) * 100, false, 'Geteilt wird durch die Gesamtzahl, nicht durch die übrigen Fälle.'), P(((n - k) / n) * 100, false, 'Das ist der Anteil der anderen Fälle (Gegenereignis).'), P((z[idx[0]] / n) * 100, false, `Zu „${was}“ gehören mehrere Spalten der Tabelle – ihre Anzahlen werden addiert.`)];
      hints = [`Gesamtzahl – alle Anzahlen addieren: ${tex(`${z.join('+')}=${n}`)}.`, `Günstige Fälle – die passenden Spalten addieren: ${tex(`${idx.map((j) => z[j]).join('+')}=${k}`)}.`, `Anteil: ${tex(`${k}:${n}${dez(k, n)}`)}.`, `Als Prozentzahl: ${tex(`${opts[0].tex}`)}.`];
      explain = `Gesamtzahl ${tex(`${n}`)}, günstig ${tex(`${idx.map((j) => z[j]).join('+')}=${k}`)}, relative Häufigkeit ${tex(`\\dfrac{${k}}{${n}}${dez(k, n)}`)}, also ${tex(opts[0].tex)}.`; roh = { z, idx };
    } else if (art === 'chargen') {
      const n1 = pick([120, 160, 240, 250, 360, 480]), p1 = pick([2.5, 5, 7.5, 12.5, 15]), n2 = pick([140, 180, 220, 260, 340, 420].filter((v) => v !== n1)), k1 = (n1 * p1) / 100, k2 = ri(Math.ceil(n2 * 0.02), Math.floor(n2 * 0.2));
      if (!Number.isInteger(k1)) continue;
      n = n1 + n2; k = k1 + k2;
      prompt = `Eine Maschine fertigt am Montag ${n1} Bauteile, davon sind ${fmt(p1)} % fehlerhaft. Am Dienstag fertigt sie ${n2} Bauteile, davon sind ${k2} fehlerhaft. Wie groß ist die relative Häufigkeit fehlerhafter Bauteile an beiden Tagen zusammen?`;
      opts = [P((k / n) * 100, true), P((p1 + (k2 / n2) * 100) / 2, false, 'Der Mittelwert der beiden Prozentsätze stimmt nur, wenn an beiden Tagen gleich viele Bauteile gefertigt werden. Rechne mit den Anzahlen.'), P(((p1 + k2) / n) * 100, false, `${fmt(p1)} % sind nicht ${fmt(p1)} Bauteile – erst die Anzahl vom Montag ausrechnen.`), P((k / n2) * 100, false, 'Geteilt wird durch die Gesamtzahl beider Tage.')];
      hints = [`Montag – Anzahl der fehlerhaften Bauteile: ${tex(`${n1}\\cdot ${ft(p1 / 100, 3)}=${k1}`)}.`, `Fehlerhafte Bauteile zusammen: ${tex(`${k1}+${k2}=${k}`)}.`, `Alle Bauteile zusammen: ${tex(`${n1}+${n2}=${n}`)}.`, `Anteil: ${tex(`${k}:${n}${dez(k, n)}`)}, also ${tex(opts[0].tex)}.`];
      explain = `${tex(`\\dfrac{${n1}\\cdot ${ft(p1 / 100, 3)}+${k2}}{${n1}+${n2}}=\\dfrac{${k}}{${n}}${dez(k, n)}`)}, also ${tex(opts[0].tex)}. Der Mittelwert der beiden Prozentsätze wäre falsch, weil die Tage verschieden viele Bauteile haben.`; roh = { n1, p1, n2, k2 };
    } else if (art === 'rest') {
      n = pick([240, 320, 400, 480, 560, 640]); const pA = pick([12.5, 22.5, 27.5, 35, 37.5]), pC = pick([7.5, 15, 17.5, 20]), kB = ri(Math.ceil(n * 0.08), Math.floor(n * 0.25)), kA = (n * pA) / 100, kC = (n * pC) / 100;
      k = n - kA - kB - kC;
      if (!Number.isInteger(kA) || !Number.isInteger(kC) || k < n * 0.05) continue;
      prompt = `Von ${n} Befragten fahren ${fmt(pA)} % mit dem Auto zur Arbeit, ${kB} Personen mit dem Fahrrad und ${fmt(pC)} % mit der Bahn. Alle übrigen gehen zu Fuß. Wie groß ist die relative Häufigkeit für „zu Fuß“?`;
      opts = [P((k / n) * 100, true), P(100 - pA - pC - kB, false, `${kB} Personen sind nicht ${kB} % – erst den Anteil ${tex(`${kB}:${n}`)} berechnen.`), P(100 - (k / n) * 100, false, 'Das ist der Anteil aller anderen zusammen (Gegenereignis).'), P(100 - pA - pC, false, 'Auch die Personen mit dem Fahrrad müssen abgezogen werden.')];
      hints = [`Auto: ${tex(`${n}\\cdot ${ft(pA / 100, 3)}=${kA}`)} Personen, Bahn: ${tex(`${n}\\cdot ${ft(pC / 100, 3)}=${kC}`)} Personen.`, `Zu Fuß bleibt der Rest: ${tex(`${n}-${kA}-${kB}-${kC}=${k}`)}.`, `Anteil: ${tex(`${k}:${n}${dez(k, n)}`)}.`, `Als Prozentzahl: ${tex(opts[0].tex)}.`];
      explain = `Zu Fuß gehen ${tex(`${n}-${kA}-${kB}-${kC}=${k}`)} Personen, die relative Häufigkeit ist ${tex(`\\dfrac{${k}}{${n}}${dez(k, n)}`)}, also ${tex(opts[0].tex)}. (Kürzer über das Gegenereignis: ${tex(`100\\,\\%-${ft(pA)}\\,\\%-${ft(pC)}\\,\\%-${proz(kB, n)}`)}.)`; roh = { n, pA, pC, kB };
    } else {
      n = pick([120, 150, 180, 240, 300]); const z = Array.from({ length: 6 }, () => Math.round(n / 6) + ri(-Math.round(n / 20), Math.round(n / 20))), [was, idx] = pick([['eine gerade Augenzahl', [1, 3, 5]], ['eine Augenzahl von mindestens 5', [4, 5]], ['eine Augenzahl von höchstens 2', [0, 1]], ['eine ungerade Augenzahl', [0, 2, 4]]]), j = pick(idx);
      z[j] = n - z.reduce((s, x, i) => s + (i === j ? 0 : x), 0);
      if (z[j] < 5) continue;
      k = idx.reduce((s, i) => s + z[i], 0);
      if (k * 2 === n) continue;
      const andere = z.filter((_, i) => i !== j), bekannt = idx.filter((i) => i !== j).map((i) => z[i]);
      prompt = `Ein Würfel wurde ${n}-mal geworfen. Ein Eintrag der Tabelle ist unleserlich (${tex('x')}). Wie groß ist die relative Häufigkeit für „${was}“?`; formula = tabelle('Augen', [1, 2, 3, 4, 5, 6], 'Anzahl', z.map((v, i) => (i === j ? 'x' : v)));
      opts = [P((k / n) * 100, true), P(((k - z[j]) / n) * 100, false, `Der unleserliche Eintrag ${tex('x')} gehört zum Ereignis – er muss erst bestimmt und dann mitgezählt werden.`), P(((n - k) / n) * 100, false, 'Das ist der Anteil der anderen Augenzahlen (Gegenereignis).'), P((k / (n - z[j])) * 100, false, `Geteilt wird durch alle ${n} Würfe – auch die unleserliche Anzahl zählt mit.`)];
      hints = [`Fehlenden Eintrag bestimmen: Die bekannten Anzahlen ergeben ${tex(`${andere.join('+')}=${n - z[j]}`)}.`, `${tex(`x=${n}-${n - z[j]}=${z[j]}`)}.`, `Günstige Fälle: ${tex(`${[...bekannt, z[j]].join('+')}=${k}`)}.`, `Anteil: ${tex(`${k}:${n}${dez(k, n)}`)}, also ${tex(opts[0].tex)}.`];
      explain = `${tex(`x=${n}-${n - z[j]}=${z[j]}`)}, günstig sind ${tex(`${[...bekannt, z[j]].join('+')}=${k}`)} Würfe, relative Häufigkeit ${tex(`\\dfrac{${k}}{${n}}${dez(k, n)}`)}, also ${tex(opts[0].tex)}.`; roh = { n, z: z.map((v, i) => (i === j ? null : v)), idx };
    }
    if (!klar(opts) || !uniq(opts) || opts.some((o) => o.num <= 0)) continue;
    return { prompt, ...(formula ? { formula } : {}), options: shuffle(opts), hints, explain, n, k, art, roh };
  }
}

/** Prozentrechnung. */
export function genProzent(lv = 3) {
  for (;;) {
    const L = S(lv), kind = pick([['wert'], ['wert', 'satz'], ['satz', 'erhoeht', 'vermindert'], ['grund', 'erhoeht', 'vermindert'], ['grund', 'erhoeht', 'vermindert']][L - 1]);
    const G = pick([[20, 40, 60, 80, 200, 300], [40, 50, 80, 120, 250, 400], [60, 80, 120, 150, 240, 360], [48, 64, 96, 136, 248, 520], [72, 184, 376, 1240, 2360]][L - 1]);
    const p = pick([[10, 25, 50], [5, 20, 30, 75], [15, 35, 40, 45, 60], [12, 16, 35, 45, 65], [2.5, 7.5, 12.5, 17.5, 37.5]][L - 1]);
    const W = rd((G * p) / 100), dz = ft(p / 100, 4);
    let prompt, opts, explain, hints;
    if (kind === 'wert') { prompt = `Wie viel sind ${fmt(p)} % von ${G}?`; opts = [N(W, true), N((G * p) / 10, false, `${fmt(p)} % bedeutet ${tex(`\\tfrac{${ft(p)}}{100}`)} – das Komma ist um eine Stelle verrutscht.`), N(G / p, false, 'Durch den Prozentsatz zu teilen ergibt nicht den Prozentwert.'), N(G - p, false, 'Prozent sind ein Anteil, kein Betrag, den man abzieht.')];
      if (L === 1) { const t = 100 / p; hints = [`${p} % ist ${{ 10: 'ein Zehntel', 25: 'ein Viertel', 50: 'die Hälfte' }[p]}.`, `Teile durch ${t}: ${tex(`${G}:${t}`)}.`]; explain = `${tex(`${G}:${t}=${ft(W)}`)}.`; }
      else { hints = [`${fmt(p)} % als Dezimalzahl: ${tex(`\\tfrac{${ft(p)}}{100}=${dz}`)}.`, `Prozentwert = Grundwert mal Prozentsatz: ${tex(`${G}\\cdot ${dz}`)}.`]; explain = `${tex(`${G}\\cdot\\dfrac{${ft(p)}}{100}=${G}\\cdot ${dz}=${ft(W)}`)}.`; } }
    else if (kind === 'satz') { prompt = `Wie viel Prozent sind ${fmt(W)} von ${G}?`; const P = (v, c, w) => ({ tex: `${ft(v, 2)}\\,\\%`, num: v, correct: c, why: w }); opts = [P(p, true), P((G / W), false, 'Anteil = Prozentwert durch Grundwert, nicht umgekehrt – und dann mal 100.'), P(W, false, 'Das ist der Prozentwert selbst, nicht der Prozentsatz.'), P(100 - p, false, 'Das ist der Rest bis 100 %.')];
      hints = ['Prozentsatz = Prozentwert geteilt durch Grundwert.', `${tex(`${ft(W)}:${G}=${dz}`)}.`, `Als Prozentzahl – das Komma zwei Stellen nach rechts: ${tex(`${dz}=${ft(p)}\\,\\%`)}.`]; explain = `${tex(`\\dfrac{${ft(W)}}{${G}}=${dz}=${ft(p)}\\,\\%`)}.`; }
    else if (kind === 'erhoeht' || kind === 'vermindert') { const s = kind === 'erhoeht' ? 1 : -1, q = ft(1 + (s * p) / 100, 4), ding = L < 4 ? 'Ein Preis von' : s > 0 ? pick(['Ein Jahresbeitrag beträgt', 'Eine Rechnung beträgt bisher']) : pick(['Ein Gerät kostet', 'Ein gebrauchtes Fahrrad kostet']);
      prompt = L >= 4 ? `${ding} ${G} €. ${s > 0 ? 'Der Betrag wird' : 'Im Angebot wird der Betrag'} um ${fmt(p)} % ${s > 0 ? 'erhöht' : 'gesenkt'}. Wie hoch ist der neue Betrag (in €)?` : `${ding} ${G} € wird um ${fmt(p)} % ${s > 0 ? 'erhöht' : 'gesenkt'}. Wie hoch ist der neue Preis (in €)?`;
      opts = [N(rd(G + s * W), true), N(G + s * p, false, `${fmt(p)} % sind nicht ${fmt(p)} €. Erst den Prozentwert berechnen.`), N(W, false, `Das ist nur die ${s > 0 ? 'Erhöhung' : 'Senkung'}, nicht der neue Preis.`), N(rd(G - s * W), false, `Der Preis wird ${s > 0 ? 'erhöht, nicht gesenkt' : 'gesenkt, nicht erhöht'}.`)];
      hints = [`Der alte Betrag entspricht 100 %. Nach der ${s > 0 ? 'Erhöhung' : 'Senkung'} sind es ${tex(`100\\,\\%${s > 0 ? '+' : '-'}${ft(p)}\\,\\%=${ft(100 + s * p)}\\,\\%`)}.`, `Als Faktor: ${tex(`\\tfrac{${ft(100 + s * p)}}{100}=${q}`)}.`, `Neuer Betrag: ${tex(`${G}\\cdot ${q}`)}.`];
      explain = `${tex(`${G}\\cdot${q}=${ft(G + s * W)}`)} €. Oder in zwei Schritten: ${tex(`${G}\\cdot ${dz}=${ft(W)}`)} und ${tex(`${G}${s > 0 ? '+' : '-'}${ft(W)}=${ft(G + s * W)}`)}.`; }
    else { prompt = `${fmt(W)} € sind ${fmt(p)} % eines Betrags. Wie groß ist der ganze Betrag?`; opts = [N(G, true), N((W * p) / 100, false, 'So berechnet man einen Prozentwert. Gesucht ist der Grundwert: durch den Prozentsatz teilen.'), N(W * (1 + p / 100), false, 'Das wäre eine Erhöhung um den Prozentsatz. Gesucht ist das Ganze (100 %).'), N(W + p, false, 'Prozent und Euro lassen sich nicht addieren.')];
      hints = [`Dreisatz: ${fmt(p)} % entsprechen ${fmt(W)} €.`, `1 % entspricht ${tex(`${ft(W)}:${ft(p)}=${ft(W / p, 4)}`)} €.`, `100 % entsprechen ${tex(`${ft(W / p, 4)}\\cdot 100=${G}`)} €.`];
      explain = `Dreisatz: ${tex(`${ft(W)}:${ft(p)}=${ft(W / p, 4)}`)} (das ist 1 %), ${tex(`${ft(W / p, 4)}\\cdot 100=${G}`)} €. Kurz: ${tex(`${ft(W)}:${dz}=${G}`)}.`; }
    if (!klar(opts) || !uniq(opts)) continue;
    if (L === 5) hints.push(`Probe: ${tex(`${G}\\cdot ${dz}=${ft(W)}`)} – das sind genau ${fmt(p)} % von ${G} €.`);
    return { prompt, options: shuffle(opts), hints, explain, kind, G, p, art: kind };
  }
}

/** Mittelwert, Median, Spannweite. */
export function genKennwerte(lv = 3) {
  for (;;) {
    const L = S(lv), n = [pick([3, 5]), 5, 6, 8, 10][L - 1];
    const data = Array.from({ length: n }, () => (L === 5 ? ri(12, 98) / 10 : ri(...[[1, 9], [1, 12], [2, 20], [10, 60]][L - 1])));
    const sorted = [...data].sort((x, y) => x - y), sum = rd(data.reduce((s, x) => s + x, 0)), mean = sum / n;
    const m1 = sorted[Math.floor((n - 1) / 2)], m2 = sorted[Math.ceil((n - 1) / 2)], median = rd((m1 + m2) / 2, 4), range = rd(sorted[n - 1] - sorted[0]);
    const fein = L <= 2 ? 1 : L === 3 ? 2 : 100;
    if (Math.abs(mean * fein - Math.round(mean * fein)) > 1e-9) continue;
    const SS = { mittel: [rd(mean, 4), 'das arithmetische Mittel', 'Das ist das arithmetische Mittel (Summe durch Anzahl).'], median: [median, 'der Median', 'Das ist der Median: der mittlere Wert der sortierten Liste.'], spann: [range, 'die Spannweite', 'Das ist die Spannweite: größter minus kleinster Wert.'], max: [sorted[n - 1], 'das Maximum', 'Das ist der größte Wert.'] };
    const ask = pick(['mittel', 'median', 'spann']);
    const opts = Object.keys(SS).map((k) => N(SS[k][0], k === ask, SS[k][2]));
    if (!klar(opts) || !uniq(opts)) continue;
    const zeige = (l) => l.map((x) => ft(x)).join(';\\ '), geordnet = L <= 2;
    const hints = ask === 'mittel' ? [`Alle Werte addieren: ${tex(`${(geordnet ? sorted : data).map((x) => ft(x)).join('+')}=${ft(sum)}`)}.`, `Durch die Anzahl ${n} teilen: ${tex(`${ft(sum)}:${n}`)}.`]
      : ask === 'median' ? [geordnet ? 'Die Werte sind schon der Größe nach geordnet.' : `Erst der Größe nach ordnen: ${tex(zeige(sorted))}.`, ...(n % 2 ? [`Bei ${n} Werten steht der Median genau in der Mitte: Es ist der ${(n + 1) / 2}. Wert.`] : [`Bei ${n} Werten gibt es keinen einzelnen mittleren Wert: Nimm den ${n / 2}. und den ${n / 2 + 1}. Wert, also ${tex(ft(m1))} und ${tex(ft(m2))}.`, `Der Median liegt genau dazwischen: ${tex(`(${ft(m1)}+${ft(m2)}):2`)}.`])]
        : [geordnet ? `Der größte Wert ist ${tex(ft(sorted[n - 1]))}, der kleinste ${tex(ft(sorted[0]))}.` : `Suche den größten und den kleinsten Wert: ${tex(ft(sorted[n - 1]))} und ${tex(ft(sorted[0]))}.`, `Spannweite = größter minus kleinster Wert: ${tex(`${ft(sorted[n - 1])}-${ft(sorted[0])}`)}.`];
    const explain = ask === 'mittel' ? `${tex(`\\dfrac{${ft(sum)}}{${n}}=${ft(mean)}`)}.` : ask === 'median' ? `${geordnet ? '' : `Sortiert: ${tex(zeige(sorted))}. `}Der Median ist ${tex(n % 2 ? ft(median) : `\\dfrac{${ft(m1)}+${ft(m2)}}{2}=${ft(median)}`)}.` : `${tex(`${ft(sorted[n - 1])}-${ft(sorted[0])}=${ft(range)}`)}.`;
    return { prompt: `Wie groß ist ${SS[ask][1]} der Daten?`, formula: n > 8 ? zeilen(`${zeige(data.slice(0, 5))};`, zeige(data.slice(5))) : zeige(geordnet ? sorted : data), options: shuffle(opts), hints, explain, data, ask, art: ask };
  }
}

/* Ereignisse für Laplace-Aufgaben: [Text, Bedingung, Stufe]. Die günstigen Ergebnisse werden abgezählt, nicht aus einer Liste abgeschrieben. */
const prim = (n) => [2, 3, 5, 7, 11].includes(n);
const ZWEI_WUERFEL = [
  ['einen Pasch (zwei gleiche Zahlen)', (a, b) => a === b, 4], ['eine Augensumme von mindestens 10', (a, b) => a + b >= 10, 4], ['eine Augensumme von höchstens 4', (a, b) => a + b <= 4, 4],
  ['zwei ungerade Zahlen', (a, b) => a % 2 === 1 && b % 2 === 1, 4], ['mindestens eine Sechs', (a, b) => a === 6 || b === 6, 4], ['eine Augensumme größer als 8', (a, b) => a + b > 8, 4], ['zwei verschiedene Zahlen', (a, b) => a !== b, 4],
  ['eine Augensumme, die eine Primzahl ist', (a, b) => prim(a + b), 5], ['zwei Zahlen, die sich um genau 2 unterscheiden', (a, b) => Math.abs(a - b) === 2, 5], ['ein Produkt der Augenzahlen, das durch 6 teilbar ist', (a, b) => (a * b) % 6 === 0, 5],
  ['ein Produkt der Augenzahlen, das größer als 12 ist', (a, b) => a * b > 12, 5], ['höchstens eine gerade Zahl', (a, b) => a % 2 === 1 || b % 2 === 1, 5], ['eine Augensumme, die durch 4 teilbar ist', (a, b) => (a + b) % 4 === 0, 5], ['eine zweite Zahl, die größer ist als die erste', (a, b) => b > a, 5]];
// Skatblatt: 4 Farben (Herz und Karo sind rot) mit je 7, 8, 9, 10, Bube, Dame, König, Ass. Karte = [Farbe, Wert]
const BILD = (k) => ['B', 'D', 'K'].includes(k[1]), ROT = (k) => k[0] === 'Herz' || k[0] === 'Karo';
const SKAT = [
  ['ein Ass', (k) => k[1] === 'A', 2, 'Jede der vier Farben hat ein Ass', '4'], ['eine Herz-Karte', (k) => k[0] === 'Herz', 2, 'Jede Farbe hat acht Karten', '8'], ['eine Bildkarte (Bube, Dame, König)', BILD, 2, 'Vier Farben mit je drei Bildkarten', '4\\cdot 3=12'],
  ['ein Ass oder einen König', (k) => k[1] === 'A' || k[1] === 'K', 4, 'Vier Asse und vier Könige', '4+4=8'], ['eine Herz-Karte oder ein Ass', (k) => k[0] === 'Herz' || k[1] === 'A', 4, 'Acht Herz-Karten und vier Asse – das Herz-Ass wurde dabei doppelt gezählt (Summenregel)', '8+4-1=11'],
  ['keine Bildkarte (Bube, Dame, König)', (k) => !BILD(k), 4, 'Über das Gegenereignis: Die zwölf Bildkarten fallen weg', '32-12=20'], ['eine rote Bildkarte (Bube, Dame, König)', (k) => ROT(k) && BILD(k), 4, 'Zwei rote Farben (Herz, Karo) mit je drei Bildkarten', '2\\cdot 3=6'], ['eine Karte, die kein Ass ist', (k) => k[1] !== 'A', 4, 'Über das Gegenereignis: Die vier Asse fallen weg', '32-4=28'],
  ['eine schwarze Karte oder eine Dame', (k) => !ROT(k) || k[1] === 'D', 5, 'Sechzehn schwarze Karten und vier Damen – die zwei schwarzen Damen wurden doppelt gezählt (Summenregel)', '16+4-2=18'], ['eine Karte, die weder Herz noch Bildkarte ist', (k) => k[0] !== 'Herz' && !BILD(k), 5, 'Über das Gegenereignis: „Herz oder Bildkarte“ sind acht plus zwölf minus drei doppelt gezählte Karten (Summenregel)', '32-(8+12-3)=15'],
  ['eine rote Zahlenkarte (7, 8, 9 oder 10)', (k) => ROT(k) && !BILD(k) && k[1] !== 'A', 5, 'Zwei rote Farben mit je vier Zahlenkarten', '2\\cdot 4=8'], ['ein Ass, einen König oder eine Kreuz-Karte', (k) => k[1] === 'A' || k[1] === 'K' || k[0] === 'Kreuz', 5, 'Vier Asse, vier Könige und acht Kreuz-Karten – Kreuz-Ass und Kreuz-König wurden doppelt gezählt (Summenregel)', '4+4+8-2=14']];
const BLATT = ['Kreuz', 'Pik', 'Herz', 'Karo'].flatMap((fa) => ['7', '8', '9', '10', 'B', 'D', 'K', 'A'].map((w) => [fa, w]));

/** Laplace-Wahrscheinlichkeit: günstige durch mögliche Ergebnisse. */
export function genLaplace(lv = 3) {
  for (;;) {
    const L = S(lv), kind = pick([['wuerfel', 'rad'], ['urne', 'karten'], ['urneoder', 'summe'], ['zwei', 'karten2'], ['zwei', 'karten2']][L - 1]);
    let text, g, m, hints, was = null;
    if (kind === 'wuerfel') { const E = pick([['eine Zahl größer als 4', 2, '5 und 6'], ['ein Vielfaches von 3', 2, '3 und 6'], ['eine Zahl kleiner als 3', 2, '1 und 2'], ['eine Zahl von mindestens 3', 4, '3, 4, 5 und 6'], ['eine Zahl kleiner als 5', 4, '1, 2, 3 und 4'], ['keine 1 und keine 6', 4, '2, 3, 4 und 5']]);
      text = `Ein Würfel wird einmal geworfen. Wie groß ist die Wahrscheinlichkeit für ${E[0]}?`; g = E[1]; m = 6; was = E[0]; hints = [`Günstig sind ${E[2]} – das sind ${g} Ergebnisse.`, 'Möglich sind 6 Ergebnisse.']; }
    else if (kind === 'rad') { m = pick([8, 10, 12]); g = ri(2, m / 2 - 1); text = `Ein Glücksrad hat ${m} gleich große Felder, ${g} davon sind Gewinnfelder. Wie groß ist die Gewinnwahrscheinlichkeit?`; hints = [`Günstig sind die ${g} Gewinnfelder.`, `Möglich sind alle ${m} Felder.`]; }
    else if (kind === 'urne') { const r = ri(2, 6), b = ri(2, 6), w = ri(2, 4); text = `In einer Urne liegen ${r} rote, ${b} blaue und ${w} weiße Kugeln. Es wird einmal gezogen. Wie groß ist die Wahrscheinlichkeit für eine rote Kugel?`; g = r; m = r + b + w; was = [r, b, w];
      hints = [`Mögliche Ergebnisse – alle Kugeln zusammen: ${tex(`${r}+${b}+${w}=${m}`)}.`, `Günstig sind die ${r} roten Kugeln.`]; }
    else if (kind === 'urneoder') { const r = ri(2, 7), b = ri(2, 7), w = ri(2, 6), gr = ri(1, 4), neg = rand() < 0.5; m = r + b + w + gr; g = neg ? m - w : r + b; was = [r, b, w, gr, neg];
      text = `In einer Urne liegen ${r} rote, ${b} blaue, ${w} weiße und ${gr} grüne Kugel${gr === 1 ? '' : 'n'}. Es wird einmal gezogen. Wie groß ist die Wahrscheinlichkeit für ${neg ? 'eine Kugel, die <b>nicht</b> weiß ist' : 'eine rote oder eine blaue Kugel'}?`;
      hints = [`Mögliche Ergebnisse – alle Kugeln zusammen: ${tex(`${r}+${b}+${w}+${gr}=${m}`)}.`, neg ? `Günstig sind alle Kugeln außer den weißen (Gegenereignis): ${tex(`${m}-${w}=${g}`)}.` : `Günstig sind die roten und die blauen Kugeln zusammen: ${tex(`${r}+${b}=${g}`)}.`, `Wahrscheinlichkeit = günstige durch mögliche Ergebnisse: ${tex(dfrac(g, m))}.`]; }
    else if (kind === 'summe') { const s = pick([4, 5, 6, 8, 9, 10]), paare = []; for (let a = 1; a <= 6; a++) if (s - a >= 1 && s - a <= 6) paare.push(`(${a}\\mid ${s - a})`); g = paare.length; m = 36; was = s;
      text = `Zwei Würfel werden geworfen. Wie groß ist die Wahrscheinlichkeit für die Augensumme ${s}?`;
      hints = [`Mögliche Ergebnisse: Jede Zahl des ersten Würfels kann mit jeder des zweiten fallen, ${tex('6\\cdot 6=36')}.`, `Günstige Paare aufschreiben: ${tex(paare.join(',\\ '))}.`, `Das sind ${g} günstige Ergebnisse.`]; }
    else if (kind === 'zwei') { const E = pick(ZWEI_WUERFEL.filter((e) => e[2] === (L >= 5 ? 5 : 4))), je = [1, 2, 3, 4, 5, 6].map((a) => [1, 2, 3, 4, 5, 6].filter((b) => E[1](a, b)).length); g = je.reduce((s, x) => s + x, 0); m = 36; was = E[0];
      const folge = E[1](1, 2) && !E[1](2, 1) && E[0].startsWith('eine zweite');   // Reihenfolge nur bei einem Würfel, der zweimal geworfen wird
      text = folge ? 'Ein Würfel wird zweimal geworfen. Wie groß ist die Wahrscheinlichkeit, dass die zweite Augenzahl größer ist als die erste?' : `Zwei Würfel werden geworfen. Wie groß ist die Wahrscheinlichkeit für ${E[0]}?`;
      hints = [folge ? `Mögliche Ergebnisse: Jede Zahl des ersten Wurfs kann mit jeder des zweiten Wurfs auftreten, ${tex('6\\cdot 6=36')}.` : `Mögliche Ergebnisse: Jede Zahl des ersten Würfels kann mit jeder des zweiten fallen, ${tex('6\\cdot 6=36')}.`, folge ? 'Geordnet abzählen: Gehe die Zahlen 1 bis 6 des ersten Wurfs durch und zähle jeweils, wie viele Zahlen beim zweiten Wurf passen.' : 'Geordnet abzählen: Gehe die Zahlen 1 bis 6 des ersten Würfels durch und zähle jeweils, wie viele Zahlen des zweiten Würfels passen.', `Das ergibt ${tex(`${je.join('+')}=${g}`)} günstige Ergebnisse.`, `Wahrscheinlichkeit = günstige durch mögliche Ergebnisse: ${tex(dfrac(g, m))}.`]; }
    else { const E = pick(SKAT.filter((e) => e[2] === (kind === 'karten' ? 2 : L >= 5 ? 5 : 4))); g = BLATT.filter(E[1]).length; m = 32; was = E[0];
      text = `Aus einem Skatblatt mit 32 Karten wird eine Karte gezogen. Wie groß ist die Wahrscheinlichkeit für ${E[0]}?`;
      hints = kind === 'karten' ? [`${E[3]}: ${tex(E[4])} günstige Karten.`, 'Möglich sind alle 32 Karten.'] : ['Das Blatt hat vier Farben (Kreuz, Pik, Herz, Karo) mit je acht Karten: 7, 8, 9, 10, Bube, Dame, König, Ass.', `${E[3]}: ${tex(E[4])} günstige Karten.`, `Wahrscheinlichkeit = günstige durch mögliche Ergebnisse: ${tex(dfrac(g, m))}.`]; }
    if (g * 2 === m || g < 2 || g >= m) continue;
    const F = (z, n, correct, why) => ({ tex: dfrac(z, n), num: z / n, correct, why });
    const opts = [F(g, m, true), F(g, m - g, false, 'Geteilt wird durch <b>alle</b> möglichen Ergebnisse, nicht nur durch die ungünstigen.'), F(m - g, m, false, 'Das ist die Wahrscheinlichkeit des Gegenereignisses.'), F(1, g, false, 'Im Zähler steht die Zahl der günstigen Ergebnisse, im Nenner die Zahl aller Ergebnisse.')];
    if (!uniqNum(opts) || !uniq(opts) || opts.slice(1).some((o) => Math.abs(o.num - g / m) < 0.01)) continue;
    const kurz = gcd(g, m) > 1 ? `=${fracTex(g, m)}` : '';
    return { prompt: text, options: shuffle(opts), hints, explain: L <= 2 ? `${tex(`P=\\dfrac{${g}}{${m}}`)}${kurz ? ` (gekürzt ${tex(fracTex(g, m))})` : ''}.` : `${tex(`P=\\dfrac{${g}}{${m}}${kurz}\\approx${ft((g / m) * 100, 1)}\\,\\%`)}.`, g, m, art: kind, roh: was };
  }
}

/** Gegenereignis. */
export function genGegen(lv = 3) {
  for (;;) {
    const L = S(lv), P = (v, correct, why) => ({ tex: `${ft(v)}\\,\\%`, num: v, correct, why });
    if (L === 1) {
      const p = pick([10, 20, 25, 30, 40, 60, 70, 75, 80, 90]);
      const ctx = pick([`Die Regenwahrscheinlichkeit für morgen beträgt ${p} %. Wie wahrscheinlich ist es, dass es <b>nicht</b> regnet?`, `Ein Basketballer trifft einen Freiwurf mit ${p} % Wahrscheinlichkeit. Wie wahrscheinlich ist ein Fehlwurf?`, `Ein Los gewinnt mit ${p} % Wahrscheinlichkeit. Wie wahrscheinlich ist eine Niete?`]);
      const opts = [P(100 - p, true), P(p, false, 'Das ist die Wahrscheinlichkeit des Ereignisses selbst, nicht des Gegenteils.'), P(100 + p, false, 'Wahrscheinlichkeiten liegen nie über 100 %.'), P(p / 2, false, 'Ereignis und Gegenereignis ergeben zusammen 100 %.')];
      if (!klar(opts)) continue;
      return { prompt: ctx, options: shuffle(opts), hints: ['Beides zusammen ergibt 100 %.', `Rechne ${tex(`100-${p}`)}.`], explain: `${tex(`100\\,\\%-${p}\\,\\%=${100 - p}\\,\\%`)}.`, kind: 'einfach', p, art: 'einfach', roh: { p } };
    }
    if (L === 2) {
      const p1 = pick([12, 15, 18, 24, 35, 45]), p2 = pick([5, 8, 16, 22, 27]), p = p1 + p2;
      const ctx = pick([`An einer Ampel kommt man mit ${p1} % Wahrscheinlichkeit bei Rot an und mit ${p2} % bei Gelb. Wie wahrscheinlich ist es, bei Grün anzukommen?`, `Bei einem Glücksrad gewinnt man mit ${p1} % Wahrscheinlichkeit einen Trostpreis und mit ${p2} % den Hauptpreis. Wie wahrscheinlich ist eine Niete?`, `Ein Bus kommt mit ${p1} % Wahrscheinlichkeit zu spät und mit ${p2} % zu früh. Wie wahrscheinlich ist er pünktlich?`]);
      const opts = [P(100 - p, true), P(p, false, 'Das ist die Wahrscheinlichkeit der beiden genannten Fälle zusammen, nicht des Gegenereignisses.'), P(100 - p1, false, `Auch die ${p2} % müssen abgezogen werden.`), P(100 - p2, false, `Auch die ${p1} % müssen abgezogen werden.`)];
      if (!klar(opts)) continue;
      return { prompt: ctx, options: shuffle(opts), hints: [`Die beiden genannten Fälle zusammen: ${tex(`${p1}\\,\\%+${p2}\\,\\%=${p}\\,\\%`)}.`, `Der dritte Fall ist das Gegenereignis dazu – alles zusammen ergibt 100 %: ${tex(`100\\,\\%-${p}\\,\\%`)}.`], explain: `${tex(`100\\,\\%-(${p1}\\,\\%+${p2}\\,\\%)=100\\,\\%-${p}\\,\\%=${100 - p}\\,\\%`)}.`, kind: 'einfach', p, art: 'rest', roh: { p1, p2 } };
    }
    // „Mindestens ein Treffer“ über das Gegenereignis „kein Treffer“
    let prompt, n, miss, Fm, Ft, roh, W = ['Treffer', 'Treffer', 'Treffern', 'kein einziger Treffer'];   // Fm: P(kein Treffer) je Versuch als Formel, Ft: P(Treffer) je Versuch
    if (L <= 4) {
      const [was, treffer, z, nn, verb] = pick(L === 3 ? [['Ein Würfel', 'eine Sechs', 5, 6, 'geworfen'], ['Eine Münze', 'einmal Kopf', 1, 2, 'geworfen'], ['Ein Würfel', 'eine Zahl größer als 4', 2, 3, 'geworfen']]
        : [['Ein Glücksrad mit 4 gleich großen Feldern hat ein Gewinnfeld. Es', 'einen Gewinn', 3, 4, 'gedreht'], ['Ein Glücksrad mit 5 gleich großen Feldern hat ein Gewinnfeld. Es', 'einen Gewinn', 4, 5, 'gedreht'], ['Ein Glücksrad mit 10 gleich großen Feldern hat 3 Gewinnfelder. Es', 'einen Gewinn', 7, 10, 'gedreht'], ['Ein Würfel', 'eine Sechs', 5, 6, 'geworfen'], ['Ein Glücksrad mit 8 gleich großen Feldern hat 3 Gewinnfelder. Es', 'einen Gewinn', 5, 8, 'gedreht']]);
      n = L === 3 ? ri(2, 3) : ri(4, 6); miss = z / nn; Fm = dfrac(z, nn); Ft = fracTex(nn - z, nn); roh = { z, nn, n };
      prompt = `${was} wird ${n}-mal ${verb}. Welche Rechnung liefert die Wahrscheinlichkeit für <b>mindestens ${treffer}</b>?`;
    } else {
      const d = pick([2, 4, 5, 8, 12, 15]); n = ri(6, 15); miss = 1 - d / 100; Fm = ft(miss); Ft = ft(d / 100); roh = { d, n };
      const korb = rand() < 0.5;   // Beim Freiwurf heißt das gesuchte Ereignis „Fehlwurf“ – „Treffer“ wäre hier das Gegenteil.
      prompt = korb ? `Eine Basketballerin verwirft einen Freiwurf mit einer Wahrscheinlichkeit von ${d} %. Sie wirft ${n}-mal. Welche Rechnung liefert die Wahrscheinlichkeit für <b>mindestens einen Fehlwurf</b>?` : `Ein Bauteil ist mit einer Wahrscheinlichkeit von ${d} % defekt. Es werden ${n} Bauteile unabhängig voneinander geprüft. Welche Rechnung liefert die Wahrscheinlichkeit für <b>mindestens ein defektes Bauteil</b>?`;
      W = korb ? ['Fehlwurf', 'Fehlwürfe', 'Fehlwürfen', 'kein einziger Fehlwurf'] : ['defektes Bauteil', 'defekte Bauteile', 'defekten Bauteilen', 'kein einziges defektes Bauteil'];
    }
    const kl = (t) => (/dfrac/.test(t) ? `\\left(${t}\\right)` : t), wert = 1 - miss ** n;
    const opts = [{ tex: `1-${kl(Fm)}^{${n}}`, num: wert, correct: true },
      { tex: `${n}\\cdot${Ft}`, num: n * (1 - miss), correct: false, why: 'Wahrscheinlichkeiten dürfen hier nicht einfach addiert werden – bei vielen Versuchen käme sonst mehr als 100 % heraus.' },
      { tex: `${kl(Ft)}^{${n}}`, num: (1 - miss) ** n, correct: false, why: `Das ist die Wahrscheinlichkeit für <b>nur</b> ${W[1]}.` },
      { tex: `1-${kl(Ft)}^{${n}}`, num: 1 - (1 - miss) ** n, correct: false, why: `Das Gegenereignis von „mindestens ein ${W[0]}“ ist „kein ${W[0]}“ – mit ${tex(Fm)} je Versuch.` }];
    if (!uniqNum(opts) || !uniq(opts) || opts.slice(1).some((o) => Math.abs(o.num - wert) < 0.004)) continue;
    const hints = [`„Mindestens ein ${W[0]}“ ist das Gegenereignis von „${W[3]}“.`, `Die Wahrscheinlichkeit für „kein ${W[0]}“ bei einem Versuch ist ${tex(L <= 4 ? Fm : `1-${Ft}=${Fm}`)}.`, `${n}-mal hintereinander kein ${W[0]} (Pfadregel – entlang des Pfades multiplizieren): ${tex(`${kl(Fm)}^{${n}}`)}.`];
    if (L >= 4) hints.push(`Ausgerechnet: ${tex(`${kl(Fm)}^{${n}}\\approx ${ft(miss ** n, 4)}`)}, also ${tex(`P\\approx 1-${ft(miss ** n, 4)}=${ft(1 - rd(miss ** n, 4), 4)}`)}.`);
    if (L >= 5) hints.push(`Als Prozentzahl: ${tex(`P\\approx ${ft(wert * 100, 1)}\\,\\%`)} – deutlich weniger als ${tex(`${n}\\cdot ${Ft}`)}, weil sich die Fälle mit mehreren ${W[2]} überschneiden.`);
    return { prompt, options: shuffle(opts), hints, explain: `${tex(`P=1-${kl(Fm)}^{${n}}\\approx${ft(wert * 100, 1)}\\,\\%`)}.`, kind: 'min1', n, miss, art: L <= 4 ? 'min1' : 'min1prozent', roh };
  }
}

/* ───────────── Geometrie: Grundlagen ───────────── */

const TRI = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [12, 16, 20], [7, 24, 25], [20, 21, 29]];

/** Satz des Pythagoras. */
export function genPythagoras(lv = 3) {
  for (;;) {
    const L = S(lv), W = (x) => `\\sqrt{${ft(x)}}`;
    let A, B, C, hyp, prompt, hints, explain, opts, art, roh;
    if (L <= 4) {
      hyp = L === 1 || rand() < 0.5;
      if (L <= 3) { const [a, b, c] = pick(TRI.slice(0, [2, 6, 6][L - 1])), s = L === 3 ? pick([0.5, 1.5, 2.5]) : 1; [A, B, C] = rand() < 0.5 || L === 1 ? [a * s, b * s, c * s] : [b * s, a * s, c * s]; }
      else if (hyp) { A = ri(3, 12); B = ri(4, 15); C = Math.hypot(A, B); if (A === B || ganz(C)) continue; }
      else { C = ri(8, 20); A = ri(3, C - 2); B = Math.sqrt(C * C - A * A); if (ganz(B) || Math.abs(A - B) < 0.3) continue; }
      const ctx = L >= 3, leiter = !hyp && C <= 10 && A < C / 2; art = hyp ? 'hypotenuse' : 'kathete'; roh = hyp ? { a: A, b: B } : { c: C, a: A };
      opts = hyp ? [Z(C, true), Z(A + B, false, 'Die Seiten werden nicht addiert: Erst quadrieren, dann addieren, dann die Wurzel ziehen.'), Z(A * A + B * B, false, 'Hier fehlt die Wurzel am Ende.'), Z(Math.sqrt(Math.abs(B * B - A * A)), false, 'Für die Hypotenuse werden die Quadrate addiert, nicht subtrahiert.')]
        : [Z(B, true), Z(Math.sqrt(C * C + A * A), false, 'Gesucht ist eine Kathete: Das Quadrat der anderen Kathete wird vom Hypotenusenquadrat abgezogen.'), Z(C - A, false, 'Die Seiten werden nicht einfach subtrahiert: erst quadrieren.'), Z(C * C - A * A, false, 'Hier fehlt die Wurzel am Ende.')];
      prompt = hyp ? (ctx ? pick([`Ein rechteckiges Grundstück ist ${fmt(A)} m breit und ${fmt(B)} m lang. Wie lang ist der Weg quer über die Diagonale (in m)?`, `Ein Bildschirm ist ${fmt(B)} cm breit und ${fmt(A)} cm hoch. Wie lang ist seine Diagonale (in cm)?`]) : `Ein rechtwinkliges Dreieck hat die Katheten ${fmt(A)} cm und ${fmt(B)} cm. Wie lang ist die Hypotenuse (in cm)?`)
        : (ctx ? pick([...(leiter ? [`Eine ${fmt(C)} m lange Leiter lehnt an einer Wand. Ihr Fuß steht ${fmt(A)} m von der Wand entfernt. Wie hoch reicht sie (in m)?`] : []), `Ein ${fmt(C)} m langes Seil ist von der Spitze eines Mastes zum Boden gespannt und dort ${fmt(A)} m vom Mastfuß entfernt befestigt. Wie hoch ist der Mast (in m)?`]) : `Ein rechtwinkliges Dreieck hat die Hypotenuse ${fmt(C)} cm und eine Kathete von ${fmt(A)} cm. Wie lang ist die andere Kathete (in cm)?`);
      const q1 = ft(A * A), q2 = ft(hyp ? B * B : C * C), x2 = hyp ? C * C : B * B, x = hyp ? C : B, erg = opts[0].tex.startsWith('\\approx') ? opts[0].tex : `=${opts[0].tex}`;
      // Stufe 4: Die Wurzel geht nicht auf – erst zwischen zwei ganzen Zahlen einschachteln, dann runden
      const schaetzen = L === 4 ? [`Die Wurzel geht nicht auf. Abschätzen: ${tex(`${Math.floor(x) ** 2}<${ft(x2)}<${(Math.floor(x) + 1) ** 2}`)}, das Ergebnis liegt also zwischen ${Math.floor(x)} und ${Math.floor(x) + 1}.`, `Mit dem Taschenrechner: ${tex(`${W(x2)}${ca(x)}`)}.`] : [];
      if (L === 1) { hints = [`Quadriere beide Katheten und addiere: ${tex(`${q1}+${q2}=${ft(x2)}`)}.`, `Ziehe die Wurzel aus ${ft(x2).replace('{,}', ',')}.`]; explain = `${tex(`\\sqrt{${q1}+${q2}}=${W(x2)}=${ft(x)}`)} cm.`; }
      else if (hyp) { hints = [...(ctx ? ['Die Diagonale teilt das Rechteck in zwei rechtwinklige Dreiecke: Sie ist die Hypotenuse, die beiden Seiten sind die Katheten.'] : []), `Satz des Pythagoras – die Quadrate der Katheten addieren: ${tex(`${ft(A)}^2+${ft(B)}^2=${q1}+${q2}=${ft(x2)}`)}.`, L === 4 ? `Die Hypotenuse ist die Wurzel daraus: ${tex(W(x2))}.` : `Wurzel ziehen: ${tex(`${W(x2)}=${ft(x)}`)}.`, ...schaetzen]; explain = `${tex(`\\sqrt{${ft(A)}^2+${ft(B)}^2}=${W(x2)}${erg}`)}.`; }
      else { hints = [...(ctx ? [/Leiter/.test(prompt) ? 'Wand und Boden bilden einen rechten Winkel: Die Leiter ist die Hypotenuse, gesucht ist eine Kathete.' : 'Mast und Boden bilden einen rechten Winkel: Das Seil ist die Hypotenuse, gesucht ist eine Kathete.'] : []), `Satz des Pythagoras, nach der Kathete umgestellt – Hypotenusenquadrat minus Kathetenquadrat: ${tex(`${ft(C)}^2-${ft(A)}^2=${q2}-${q1}=${ft(x2)}`)}.`, L === 4 ? `Die Kathete ist die Wurzel daraus: ${tex(W(x2))}.` : `Wurzel ziehen: ${tex(`${W(x2)}=${ft(x)}`)}.`, ...schaetzen]; explain = `${tex(`\\sqrt{${ft(C)}^2-${ft(A)}^2}=${W(x2)}${erg}`)}.`; }
    } else if (rand() < 0.5) {
      const a = ri(3, 9), b = ri(4, 12), c = ri(2, 8) + pick([0, 0.5]); A = Math.hypot(a, b); B = c; C = Math.hypot(A, B); hyp = true; art = 'raumdiagonale'; roh = { a, b, c };
      if (a === b || ganz(C)) continue;
      prompt = `Ein Quader ist ${a} cm lang, ${b} cm breit und ${fmt(c)} cm hoch. Wie lang ist seine Raumdiagonale (in cm)?`;
      opts = [Z(C, true), Z(a + b + c, false, 'Die Kanten werden nicht addiert: Zweimal den Satz des Pythagoras anwenden.'), Z(A, false, 'Das ist erst die Diagonale der Grundfläche. Es fehlt der zweite Schritt mit der Höhe.'), Z(a * a + b * b + c * c, false, 'Hier fehlt die Wurzel am Ende.')];
      hints = [`Erst die Diagonale ${tex('d')} der Grundfläche (Satz des Pythagoras): ${tex(`d^2=${a}^2+${b}^2=${a * a}+${b * b}=${a * a + b * b}`)}.`, `Die Raumdiagonale ${tex('e')} ist die Hypotenuse im rechtwinkligen Dreieck aus ${tex('d')} und der Höhe: ${tex(`e^2=d^2+${ft(c)}^2=${a * a + b * b}+${ft(c * c)}=${ft(C * C)}`)}.`, `Wurzel ziehen: ${tex(`e=${W(C * C)}${ca(C)}`)}.`];
      explain = `${tex(`e=\\sqrt{${a}^2+${b}^2+${ft(c)}^2}=${W(C * C)}${ca(C)}`)} cm (zweimal Satz des Pythagoras: erst die Diagonale der Grundfläche ${tex(`d=${W(a * a + b * b)}`)}, dann mit der Höhe).`;
    } else {
      const g = 2 * ri(3, 9) + pick([0, 1]), s = g + ri(1, 6) + pick([0, 0.5]); A = g / 2; C = s; B = Math.sqrt(C * C - A * A); hyp = false; art = 'gleichschenklig'; roh = { g, s };
      if (ganz(B)) continue;
      prompt = `Ein gleichschenkliges Dreieck hat die Basis ${tex(`g=${ft(g)}`)} cm und zwei Schenkel der Länge ${tex(`s=${ft(s)}`)} cm. Wie lang ist die Höhe auf die Basis (in cm)?`;
      opts = [Z(B, true), Z(Math.sqrt(s * s - g * g), false, 'Die Höhe halbiert die Basis: Im rechtwinkligen Teildreieck ist die Kathete nur halb so lang wie die Basis.'), Z(Math.hypot(s, A), false, 'Der Schenkel ist die Hypotenuse – die Quadrate werden subtrahiert, nicht addiert.'), Z(s - A, false, 'Die Seiten werden nicht einfach subtrahiert: erst quadrieren.')];
      hints = [`Die Höhe teilt das Dreieck in zwei rechtwinklige Dreiecke und halbiert die Basis: ${tex(`${ft(g)}:2=${ft(A)}`)}.`, `Im Teildreieck ist der Schenkel die Hypotenuse (Satz des Pythagoras): ${tex(`h^2=${ft(s)}^2-${ft(A)}^2=${ft(s * s)}-${ft(A * A)}=${ft(B * B)}`)}.`, `Wurzel ziehen: ${tex(`h=${W(B * B)}${ca(B)}`)}.`];
      explain = `${tex(`h=\\sqrt{${ft(s)}^2-\\left(\\tfrac{${ft(g)}}{2}\\right)^2}=${W(B * B)}${ca(B)}`)} cm.`;
    }
    if (!klar(opts) || !uniq(opts)) continue;
    return { prompt, options: shuffle(opts), hints, explain, A, B, C, hyp, art, roh };
  }
}

/** Trigonometrie im rechtwinkligen Dreieck. */
export function genTrig(lv = 3) {
  for (;;) {
    const L = S(lv), rad = (g) => (g * Math.PI) / 180, FK = { sin: Math.sin, cos: Math.cos, tan: Math.tan };
    const NAME = { sin: 'Sinus', cos: 'Kosinus', tan: 'Tangens' }, DEF = { sin: '\\sin\\alpha=\\dfrac{\\text{Gegenkathete}}{\\text{Hypotenuse}}', cos: '\\cos\\alpha=\\dfrac{\\text{Ankathete}}{\\text{Hypotenuse}}', tan: '\\tan\\alpha=\\dfrac{\\text{Gegenkathete}}{\\text{Ankathete}}' };
    const SEITEN = { sin: ['die Hypotenuse', 'die Gegenkathete des Winkels'], cos: ['die Hypotenuse', 'die Ankathete des Winkels'], tan: ['die Ankathete des Winkels', 'die Gegenkathete des Winkels'], hyp: ['die Gegenkathete des Winkels', 'die Hypotenuse'] };
    const WHY = { sin: 'Sinus gehört zu Gegenkathete und Hypotenuse.', cos: 'Kosinus gehört zu Ankathete und Hypotenuse.', tan: 'Tangens gehört zu Gegenkathete und Ankathete – ohne Hypotenuse.' };
    const G = (g) => `${ft(g)}^\\circ`;
    if (L === 1) {
      const al = pick([30, 40, 50, 60]), r = rad(al), s = pick([5, 8, 10, 12, 20]), kind = pick(['sin', 'cos']), W = G(al), O = (t, num) => ({ tex: t, num });
      const set = { sin: O(`${s}\\cdot\\sin(${W})`, s * Math.sin(r)), cos: O(`${s}\\cdot\\cos(${W})`, s * Math.cos(r)), tan: O(`${s}\\cdot\\tan(${W})`, s * Math.tan(r)), dsin: O(dfrac(s, `\\sin(${W})`), s / Math.sin(r)), dcos: O(dfrac(s, `\\cos(${W})`), s / Math.cos(r)) };
      const why = { ...WHY, dsin: 'Hier wurde geteilt statt multipliziert: Die Kathete ist kürzer als die Hypotenuse.', dcos: 'Hier wurde geteilt statt multipliziert: Die Kathete ist kürzer als die Hypotenuse.' };
      const opts = (kind === 'sin' ? ['sin', 'cos', 'tan', 'dsin'] : ['cos', 'sin', 'tan', 'dcos']).map((k, i) => ({ ...set[k], correct: i === 0, why: i === 0 ? undefined : why[k] }));
      if (!klar(opts)) continue;
      return { prompt: `In einem rechtwinkligen Dreieck ist ${tex(`\\alpha=${W}`)} und ${SEITEN[kind][0]} ${s} cm lang. Welche Rechnung liefert ${SEITEN[kind][1]}?`, options: shuffle(opts),
        hints: [`Hypotenuse und ${kind === 'sin' ? 'Gegenkathete' : 'Ankathete'} gehören zum ${NAME[kind]}.`, `Die Kathete ist die Hypotenuse mal ${NAME[kind]} des Winkels.`], explain: `${tex(opts[0].tex)}.`, kind, al, s, art: 'auswahl', roh: { kind, al, s } };
    }
    if (L <= 4) {
      let kind, al, s, prompt, vor = [], roh, art, wandWhy;
      if (L === 2) { kind = pick(['sin', 'cos']); al = pick([25, 35, 40, 50, 55, 65]); s = pick([4, 6, 7, 9, 12, 15]); art = 'kathete'; }
      else if (L === 3) { kind = pick(['tan', 'hyp']); al = pick([23, 37, 41, 52, 58, 67]); s = pick([4.5, 6.2, 7.5, 9.4, 12.5]); art = kind === 'hyp' ? 'hypotenuse' : 'tangens'; }
      if (L <= 3) { prompt = `In einem rechtwinkligen Dreieck ist ${tex(`\\alpha=${G(al)}`)} und ${SEITEN[kind][0]} ${fmt(s)} cm lang. Wie lang ist ${SEITEN[kind][1]} (in cm)?`; roh = { kind, al, s }; }
      else {
        const be = pick([24, 28, 33, 36, 42, 48, 54, 63]); s = pick([3.2, 4.5, 5.8, 6.4, 7.5, 8.6, 12.5]); al = be; art = pick(['leiterwand', 'rampe', 'schatten', 'drachen', 'seilbahn']);
        if (art === 'leiterwand') { kind = 'sin'; al = 90 - be; prompt = `Eine ${fmt(s)} m lange Leiter lehnt an einer Hauswand. Zwischen Leiter und Wand liegt ein Winkel von ${be}°. Wie hoch reicht die Leiter (in m)?`; wandWhy = `Der Winkel ${be}° liegt an der Wand: Die Höhe ist seine Ankathete. Rechne ${tex(`${ft(s)}\\cdot\\cos(${be}^\\circ)`)} oder ${tex(`${ft(s)}\\cdot\\sin(${90 - be}^\\circ)`)}.`; vor = [`Skizze: Wand und Boden bilden den rechten Winkel, die Leiter ist die Hypotenuse. Der Winkel am Boden ist ${tex(`\\alpha=90^\\circ-${be}^\\circ=${al}^\\circ`)} (Winkelsumme im Dreieck).`, `Die Höhe an der Wand liegt dem Winkel ${tex('\\alpha')} gegenüber: Gegenkathete.`]; }
        else if (art === 'rampe') { kind = 'hyp'; al = pick([4, 6, 8, 12, 15]); s = pick([0.6, 0.9, 1.2, 1.5, 2.4]); prompt = `Eine Rampe soll einen Höhenunterschied von ${fmt(s)} m überwinden und dabei mit ${al}° gegen den Boden ansteigen. Wie lang muss die Rampe sein (in m)?`; vor = ['Skizze: Der Höhenunterschied liegt dem Steigungswinkel gegenüber (Gegenkathete), die Rampe selbst ist die Hypotenuse.']; }
        else if (art === 'schatten') { kind = 'tan'; s = pick([12.5, 18.4, 23.6, 31.5, 42.8]); prompt = `Ein Turm wirft einen ${fmt(s)} m langen Schatten. Die Sonnenstrahlen treffen unter einem Winkel von ${al}° auf den Boden. Wie hoch ist der Turm (in m)?`; vor = ['Skizze: Der Schatten liegt am Winkel an (Ankathete), der Turm liegt ihm gegenüber (Gegenkathete) – die Hypotenuse kommt nicht vor.']; }
        else if (art === 'drachen') { kind = 'sin'; s = pick([35.5, 42.5, 48, 56.5, 64]); prompt = `Ein Drachen fliegt an einer straff gespannten, ${fmt(s)} m langen Schnur. Die Schnur bildet mit dem Boden einen Winkel von ${al}°. Wie hoch fliegt der Drachen (in m)?`; vor = ['Skizze: Die Schnur ist die Hypotenuse, die Flughöhe liegt dem Winkel gegenüber (Gegenkathete).']; }
        else { kind = 'cos'; s = pick([1.25, 1.8, 2.45, 3.2, 4.6]); al = pick([12, 18, 24, 28, 33]); prompt = `Eine Seilbahn steigt geradlinig unter einem Winkel von ${al}° an. Das Seil zwischen Tal- und Bergstation ist ${fmt(s)} km lang. Wie weit sind die Stationen auf der Landkarte (waagerecht gemessen) voneinander entfernt (in km)?`; vor = ['Skizze: Das Seil ist die Hypotenuse, die waagerechte Entfernung liegt am Winkel an (Ankathete).']; }
        roh = { art, be, al, s };
      }
      const r = rad(al), f = kind === 'hyp' ? 'sin' : kind, wert = kind === 'hyp' ? s / Math.sin(r) : s * FK[kind](r), W = G(al), ein = art === 'seilbahn' ? 'km' : L >= 4 ? 'm' : 'cm';
      const opts = kind === 'sin' ? [Z(wert, true), Z(s * Math.cos(r), false, wandWhy ?? WHY.cos), Z(s * Math.tan(r), false, WHY.tan), Z(s / Math.sin(r), false, 'Hier wurde geteilt statt multipliziert: Die Kathete ist kürzer als die Hypotenuse.')]
        : kind === 'cos' ? [Z(wert, true), Z(s * Math.sin(r), false, WHY.sin), Z(s * Math.tan(r), false, WHY.tan), Z(s / Math.cos(r), false, 'Hier wurde geteilt statt multipliziert: Die Kathete ist kürzer als die Hypotenuse.')]
          : kind === 'tan' ? [Z(wert, true), Z(s * Math.sin(r), false, WHY.sin), Z(s * Math.cos(r), false, WHY.cos), Z(s / Math.tan(r), false, `Hier wurde geteilt statt multipliziert. Stelle ${tex('\\tan\\alpha=\\tfrac{G}{A}')} nach der Gegenkathete um.`)]
            : [Z(wert, true), Z(s * Math.sin(r), false, 'Hier wurde multipliziert statt geteilt: Die Hypotenuse ist die längste Seite.'), Z(s / Math.cos(r), false, 'Geteilt durch den Kosinus erhält man die Hypotenuse aus der Ankathete – gegeben ist aber die Gegenkathete.'), Z(s / Math.tan(r), false, 'Geteilt durch den Tangens erhält man die Ankathete, nicht die Hypotenuse.')];
      if (!klar(opts) || !uniq(opts)) continue;
      const rech = kind === 'hyp' ? `\\dfrac{${ft(s)}}{\\sin(${W})}` : `${ft(s)}\\cdot\\${kind}(${W})`, fw = `\\${f}(${W})\\approx ${ft(FK[f](r), 4)}`;
      const hints = [...vor, `${kind === 'tan' ? 'Gegenkathete und Ankathete' : kind === 'cos' ? 'Ankathete und Hypotenuse' : 'Gegenkathete und Hypotenuse'} gehören zum ${NAME[f]}: ${tex(DEF[f])}.`,
        kind === 'hyp' ? `Nach der Hypotenuse umstellen (mal Hypotenuse, dann durch ${tex('\\sin\\alpha')}): ${tex(`\\text{Hypotenuse}=${rech}`)}.` : `Nach der gesuchten Seite umstellen: ${tex(rech)}.`, `Taschenrechner (Gradmaß): ${tex(fw)}, also ${tex(`${rech}${ca(wert)}`)}.`];
      return { prompt, options: shuffle(opts), hints, explain: `${tex(`${rech}\\approx ${kind === 'hyp' ? `\\dfrac{${ft(s)}}{${ft(FK[f](r), 4)}}` : `${ft(s)}\\cdot ${ft(FK[f](r), 4)}`}${ca(wert)}`)} ${ein}.`, kind, al, s, art, roh };
    }
    // Stufe 5: zwei verkettete Schritte, unschöne Zahlen
    const art = pick(['hoehe', 'drachen2', 'mast']), al = pick([23.5, 31.5, 38.5, 47.5, 52.5, 61.5]), r = rad(al), W = G(al);
    let prompt, kind, s, wert, opts, hints, explain, roh, winkel = al;
    if (art === 'hoehe') {
      const c = pick([8.4, 9.6, 12.5, 14.8, 17.2]), b = c * Math.cos(r), a = c * Math.sin(r); kind = 'sin'; s = b; wert = b * Math.sin(r); roh = { c, al };
      prompt = `Im rechtwinkligen Dreieck ${tex('ABC')} (rechter Winkel bei ${tex('C')}) ist die Hypotenuse ${tex(`c=${ft(c)}`)} cm lang und ${tex(`\\alpha=${W}`)}. Wie lang ist die Höhe ${tex('h')} auf die Hypotenuse (in cm)?`;
      opts = [Z(wert, true), Z(a, false, `Das ist die Kathete ${tex('a=c\\cdot\\sin\\alpha')}, nicht die Höhe.`), Z(b, false, `Das ist die Kathete ${tex('b=c\\cdot\\cos\\alpha')}. Die Höhe ist kürzer als jede Kathete.`), Z(a * Math.sin(r), false, `${tex('a\\cdot\\sin\\alpha')} ist ein Abschnitt der Hypotenuse, nicht die Höhe. Die Höhe liegt dem Winkel ${tex('\\alpha')} im Teildreieck mit der Hypotenuse ${tex('b')} gegenüber.`)];
      hints = [`Erst die Kathete ${tex('b')}, die am Winkel ${tex('\\alpha')} anliegt (Kosinus): ${tex(`b=c\\cdot\\cos\\alpha=${ft(c)}\\cdot\\cos(${W})\\approx ${ft(b, 3)}`)}.`, `Die Höhe teilt das Dreieck in zwei rechtwinklige Teildreiecke. Im Teildreieck bei ${tex('A')} ist ${tex('b')} die Hypotenuse und ${tex('h')} die Gegenkathete von ${tex('\\alpha')}.`, `Sinus im Teildreieck: ${tex(`h=b\\cdot\\sin\\alpha\\approx ${ft(b, 3)}\\cdot\\sin(${W})`)}.`, `${tex(`h${ca(wert)}`)} cm.`];
      explain = `${tex(`b=${ft(c)}\\cdot\\cos(${W})\\approx ${ft(b, 3)}`)}, dann ${tex(`h=b\\cdot\\sin(${W})\\approx ${ft(b, 3)}\\cdot ${ft(Math.sin(r), 4)}${ca(wert)}`)} cm. In einem Schritt: ${tex('h=c\\cdot\\sin\\alpha\\cdot\\cos\\alpha')}.`;
    } else if (art === 'drachen2') {
      const l = pick([35.5, 42.5, 58, 64.5]), be = pick([18.5, 23.5, 28.5].filter((v) => v !== al)), rb = rad(be), h = l * Math.sin(r); kind = 'hyp'; s = h; wert = h / Math.sin(rb); roh = { l, al, be }; winkel = be;
      prompt = `Ein Drachen fliegt an einer straff gespannten, ${fmt(l)} m langen Schnur, die mit dem Boden einen Winkel von ${tex(`\\alpha=${W}`)} bildet. Ein zweites Kind sieht den Drachen von seinem Standort am Boden aus unter einem Höhenwinkel von ${tex(`\\beta=${G(be)}`)}. Wie weit ist der Drachen von diesem Kind entfernt (Luftlinie, in m)?`;
      opts = [Z(wert, true), Z(l / Math.sin(rb), false, 'Die Schnurlänge ist nicht die Flughöhe: Erst die Höhe mit dem Sinus berechnen.'), Z(h * Math.sin(rb), false, 'Hier wurde multipliziert statt geteilt: Gesucht ist die Hypotenuse des zweiten Dreiecks, sie ist länger als die Flughöhe.'), Z(h / Math.tan(rb), false, 'Das ist die Entfernung am Boden bis unter den Drachen, nicht die Luftlinie.')];
      hints = [`Erstes Dreieck (Schnur als Hypotenuse) – Flughöhe mit dem Sinus: ${tex(`h=${ft(l)}\\cdot\\sin(${W})\\approx ${ft(h, 3)}`)}.`, `Zweites Dreieck: Die Flughöhe ${tex('h')} liegt dem Winkel ${tex('\\beta')} gegenüber (Gegenkathete), die gesuchte Luftlinie ${tex('e')} ist die Hypotenuse.`, `${tex('\\sin\\beta=\\dfrac{h}{e}')} nach ${tex('e')} umstellen: ${tex(`e=\\dfrac{h}{\\sin\\beta}\\approx\\dfrac{${ft(h, 3)}}{\\sin(${G(be)})}`)}.`, `${tex(`e${ca(wert)}`)} m.`];
      explain = `${tex(`h=${ft(l)}\\cdot\\sin(${W})\\approx ${ft(h, 3)}`)}, dann ${tex(`e=\\dfrac{${ft(h, 3)}}{\\sin(${G(be)})}\\approx\\dfrac{${ft(h, 3)}}{${ft(Math.sin(rb), 4)}}${ca(wert)}`)} m.`;
    } else {
      const a = pick([12.5, 18, 24.5, 31]), b = pick([9.5, 14, 20.5, 26]), d = Math.hypot(a, b); kind = 'tan'; s = d; wert = d * Math.tan(r); roh = { a, b, al };
      prompt = `Ein Vermesser steht ${fmt(a)} m östlich und ${fmt(b)} m nördlich vom Fuß eines Funkmasts auf ebenem Gelände. Er sieht die Mastspitze unter einem Höhenwinkel von ${tex(`\\alpha=${W}`)} (die Augenhöhe wird vernachlässigt). Wie hoch ist der Mast (in m)?`;
      opts = [Z(wert, true), Z((a + b) * Math.tan(r), false, 'Die Entfernung zum Mastfuß ist die Diagonale (Satz des Pythagoras), nicht die Summe der beiden Strecken.'), Z(d * Math.sin(r), false, 'Die Entfernung am Boden ist die Ankathete, nicht die Hypotenuse – dazu gehört der Tangens.'), Z(d / Math.tan(r), false, `Hier wurde geteilt statt multipliziert. Stelle ${tex('\\tan\\alpha=\\tfrac{h}{d}')} nach ${tex('h')} um.`)];
      hints = [`Erst die Entfernung ${tex('d')} zum Mastfuß: Ost- und Nordstrecke stehen senkrecht aufeinander (Satz des Pythagoras), ${tex(`d^2=${ft(a)}^2+${ft(b)}^2=${ft(a * a)}+${ft(b * b)}=${ft(d * d)}`)}.`, `${tex(`d=\\sqrt{${ft(d * d)}}\\approx ${ft(d, 3)}`)}.`, `Im senkrechten Dreieck ist ${tex('d')} die Ankathete des Höhenwinkels und die Masthöhe ${tex('h')} die Gegenkathete – dazu gehört der Tangens: ${tex('\\tan\\alpha=\\dfrac{h}{d}')}.`, `Umstellen: ${tex(`h=d\\cdot\\tan\\alpha\\approx ${ft(d, 3)}\\cdot\\tan(${W})${ca(wert)}`)} m.`];
      explain = `${tex(`d=\\sqrt{${ft(a)}^2+${ft(b)}^2}\\approx ${ft(d, 3)}`)}, dann ${tex(`h=d\\cdot\\tan(${W})\\approx ${ft(d, 3)}\\cdot ${ft(Math.tan(r), 4)}${ca(wert)}`)} m.`;
    }
    if (!klar(opts) || !uniq(opts)) continue;
    return { prompt, options: shuffle(opts), hints, explain, kind, al: winkel, s, art, roh };
  }
}

/** Flächen und Volumen. */
export function genFlaeche(lv = 3) {
  for (;;) {
    const L = S(lv), kind = pick([['rechteck', 'quadrat'], ['dreieck', 'quader', 'parallelogramm'], ['kreis', 'trapez', 'zylinder'], ['pyramide', 'kegel', 'fenster', 'dose'], ['tank', 'kegelmantel', 'rohr', 'radius', 'seitenkante']][L - 1]);
    const a = ri(2, 6), b = ri(3, 8), c = ri(2, 9), PI = Math.PI, halb = () => ri(2, 9) + pick([0, 0.5]);
    const V = (num, correct, why) => ({ tex: Math.abs(num - rd(num, 1)) < 1e-9 ? ft(num, 1) : `\\approx ${(+num).toFixed(1).replace('.', '{,}')}`, num: rd(num, 1), correct, why });
    let prompt, opts, explain, hints, want, roh;
    if (kind === 'rechteck') { const l = ri(3, 9), w = ri(2, 8); if (l === w) continue; want = l * w; roh = { l, w };
      prompt = `Ein Rechteck ist ${l} cm lang und ${w} cm breit. Wie groß ist sein Flächeninhalt (in cm²)?`;
      opts = [V(want, true), V(2 * (l + w), false, 'Das ist der Umfang, nicht der Flächeninhalt.'), V(l + w, false, 'Länge und Breite werden multipliziert, nicht addiert.'), V(want / 2, false, 'Halbiert wird nur beim Dreieck.')];
      hints = ['Flächeninhalt = Länge mal Breite.', `${tex(`${l}\\cdot ${w}`)}.`]; explain = `${tex(`A=${l}\\cdot ${w}=${want}`)} cm².`; }
    else if (kind === 'quadrat') { const s = ri(3, 9); want = s * s; roh = { s };
      prompt = `Ein Quadrat hat die Seitenlänge ${s} cm. Wie groß ist sein Flächeninhalt (in cm²)?`;
      opts = [V(want, true), V(4 * s, false, 'Das ist der Umfang, nicht der Flächeninhalt.'), V(2 * s, false, `Seite mal Seite heißt ${tex(`${s}\\cdot ${s}`)}, nicht ${tex(`${s}\\cdot 2`)}.`), V(want / 2, false, 'Halbiert wird nur beim Dreieck.')];
      hints = ['Flächeninhalt = Seite mal Seite.', `${tex(`${s}\\cdot ${s}`)}.`]; explain = `${tex(`A=${s}\\cdot ${s}=${want}`)} cm².`; }
    else if (kind === 'dreieck') { const g = a * 2, hh = b; want = (g * hh) / 2; roh = { g, h: hh };
      prompt = `Ein Dreieck hat die Grundseite ${g} cm und die zugehörige Höhe ${hh} cm. Wie groß ist sein Flächeninhalt (in cm²)?`;
      opts = [V(want, true), V(g * hh, false, `Es fehlt der Faktor ${tex('\\tfrac12')}: Ein Dreieck ist ein halbes Rechteck.`), V(g + hh, false, 'Grundseite und Höhe werden multipliziert, nicht addiert.'), V((g + hh) / 2, false, 'Erst multiplizieren, dann halbieren.')];
      hints = ['Ein Dreieck ist ein halbes Rechteck: Grundseite mal Höhe, dann halbieren.', `${tex(`${g}\\cdot ${hh}=${g * hh}`)}, die Hälfte davon.`]; explain = `${tex(`A=\\tfrac12\\cdot ${g}\\cdot ${hh}=${want}`)} cm².`; }
    else if (kind === 'quader') { want = a * b * c; roh = { a, b, c };
      prompt = `Ein Quader ist ${a} cm lang, ${b} cm breit und ${c} cm hoch. Wie groß ist sein Volumen (in cm³)?`;
      opts = [V(want, true), V(a + b + c, false, 'Die drei Kantenlängen werden multipliziert, nicht addiert.'), V(2 * (a * b + b * c + a * c), false, 'Das ist die Oberfläche, nicht das Volumen.'), V(a * b, false, 'Das ist nur die Grundfläche – die Höhe fehlt.')];
      hints = [`Grundfläche = Länge mal Breite: ${tex(`${a}\\cdot ${b}=${a * b}`)}.`, `Volumen = Grundfläche mal Höhe: ${tex(`${a * b}\\cdot ${c}`)}.`]; explain = `${tex(`V=${a}\\cdot ${b}\\cdot ${c}=${want}`)} cm³.`; }
    else if (kind === 'parallelogramm') { const g = ri(4, 12), hh = ri(3, 9), s = hh + ri(1, 3); want = g * hh; roh = { g, h: hh, s };
      prompt = `Ein Parallelogramm hat die Grundseite ${g} cm, die zugehörige Höhe ${hh} cm und die schräge Seite ${s} cm. Wie groß ist sein Flächeninhalt (in cm²)?`;
      opts = [V(want, true), V(g * s, false, 'Multipliziert wird mit der Höhe, nicht mit der schrägen Seite.'), V(want / 2, false, 'Halbiert wird nur beim Dreieck.'), V(2 * (g + s), false, 'Das ist der Umfang, nicht der Flächeninhalt.')];
      hints = ['Flächeninhalt = Grundseite mal zugehörige Höhe – die schräge Seite wird nicht gebraucht.', `${tex(`${g}\\cdot ${hh}`)}.`]; explain = `${tex(`A=${g}\\cdot ${hh}=${want}`)} cm².`; }
    else if (kind === 'kreis') { want = PI * a * a; roh = { r: a };
      prompt = `Ein Kreis hat den Radius ${a} cm. Wie groß ist sein Flächeninhalt (in cm²)?`;
      opts = [V(want, true), V(2 * PI * a, false, 'Das ist der Umfang, nicht die Fläche.'), V(PI * 4 * a * a, false, 'Hier wurde mit dem Durchmesser statt mit dem Radius gerechnet.'), V(PI * a, false, `Der Radius wird quadriert: ${tex('A=\\pi r^2')}.`)];
      hints = [`Kreisfläche: ${tex('A=\\pi\\cdot r^2')}.`, `Radius quadrieren: ${tex(`${a}^2=${a * a}`)}.`, `Mal ${tex('\\pi')}: ${tex(`\\pi\\cdot ${a * a}`)}.`]; explain = `${tex(`A=\\pi\\cdot ${a}^2=${a * a}\\,\\pi\\approx${ft(want, 1)}`)} cm².`; }
    else if (kind === 'trapez') { const p = ri(5, 12), q = ri(2, p - 2), hh = ri(3, 8); want = ((p + q) / 2) * hh; roh = { a: p, c: q, h: hh };
      prompt = `Ein Trapez hat die parallelen Seiten ${tex(`a=${p}`)} cm und ${tex(`c=${q}`)} cm und die Höhe ${hh} cm. Wie groß ist sein Flächeninhalt (in cm²)?`;
      opts = [V(want, true), V((p + q) * hh, false, `Es fehlt das Halbieren: ${tex('A=\\tfrac{a+c}{2}\\cdot h')}.`), V(p * hh, false, 'Es zählt der Mittelwert der beiden parallelen Seiten, nicht nur die längere.'), V((p * q * hh) / 2, false, 'Die parallelen Seiten werden addiert, nicht multipliziert.')];
      hints = [`Trapezfläche: Mittelwert der parallelen Seiten mal Höhe, ${tex('A=\\dfrac{a+c}{2}\\cdot h')}.`, `Mittelwert: ${tex(`(${p}+${q}):2=${ft((p + q) / 2)}`)}.`, `Mal Höhe: ${tex(`${ft((p + q) / 2)}\\cdot ${hh}`)}.`]; explain = `${tex(`A=\\dfrac{${p}+${q}}{2}\\cdot ${hh}=${ft((p + q) / 2)}\\cdot ${hh}=${ft(want)}`)} cm².`; }
    else if (kind === 'zylinder') { want = PI * a * a * b; roh = { r: a, h: b };
      prompt = `Ein Zylinder hat den Radius ${a} cm und die Höhe ${b} cm. Wie groß ist sein Volumen (in cm³)?`;
      opts = [V(want, true), V(2 * PI * a * b, false, 'Das ist die Mantelfläche, nicht das Volumen.'), V(PI * a * b, false, `Der Radius wird quadriert: ${tex('V=\\pi r^2h')}.`), V(PI * 4 * a * a * b, false, 'Hier wurde mit dem Durchmesser statt mit dem Radius gerechnet.')];
      hints = [`Zylinder: Grundfläche (Kreis) mal Höhe, ${tex('V=\\pi\\cdot r^2\\cdot h')}.`, `Grundfläche: ${tex(`\\pi\\cdot ${a}^2=${a * a}\\,\\pi`)}.`, `Mal Höhe: ${tex(`${a * a}\\,\\pi\\cdot ${b}=${a * a * b}\\,\\pi`)}.`]; explain = `${tex(`V=\\pi\\cdot ${a}^2\\cdot ${b}=${a * a * b}\\,\\pi\\approx${ft(want, 1)}`)} cm³.`; }
    else if (kind === 'pyramide') { const s = halb() + 2, hh = halb() + 1; want = (s * s * hh) / 3; roh = { s, h: hh };
      prompt = `Eine Pyramide hat eine quadratische Grundfläche mit der Seitenlänge ${tex(`a=${ft(s)}`)} cm und die Höhe ${tex(`h=${ft(hh)}`)} cm. Wie groß ist ihr Volumen (in cm³)?`;
      opts = [V(want, true), V(s * s * hh, false, `Es fehlt der Faktor ${tex('\\tfrac13')}: Eine Pyramide füllt nur ein Drittel des Quaders.`), V((s * s * hh) / 2, false, `Bei Pyramide und Kegel ist der Faktor ${tex('\\tfrac13')}, nicht ${tex('\\tfrac12')}.`), V((s * hh) / 3, false, 'Die Grundfläche ist Seitenlänge mal Seitenlänge.')];
      hints = [`Pyramide: ein Drittel von Grundfläche mal Höhe, ${tex('V=\\tfrac13\\cdot G\\cdot h')}.`, `Grundfläche: ${tex(`G=${ft(s)}^2=${ft(s * s)}`)}.`, `Grundfläche mal Höhe: ${tex(`${ft(s * s)}\\cdot ${ft(hh)}=${ft(s * s * hh, 3)}`)}.`, `Durch 3 teilen: ${tex(`${ft(s * s * hh, 3)}:3${un(want, 1)}`)}.`]; explain = `${tex(`V=\\tfrac13\\cdot ${ft(s)}^2\\cdot ${ft(hh)}=\\tfrac13\\cdot ${ft(s * s * hh, 3)}${un(want, 1)}`)} cm³.`; }
    else if (kind === 'kegel') { const d = 2 * halb() + 1, r = d / 2, hh = halb() + 2; want = (PI * r * r * hh) / 3; roh = { d, h: hh };
      prompt = `Ein Kegel hat den Durchmesser ${tex(`d=${ft(d)}`)} cm und die Höhe ${tex(`h=${ft(hh)}`)} cm. Wie groß ist sein Volumen (in cm³)?`;
      opts = [V(want, true), V(PI * r * r * hh, false, `Es fehlt der Faktor ${tex('\\tfrac13')}: Ein Kegel füllt nur ein Drittel des Zylinders.`), V((PI * d * d * hh) / 3, false, 'Hier wurde mit dem Durchmesser statt mit dem Radius gerechnet.'), V((PI * r * hh) / 3, false, `Der Radius wird quadriert: ${tex('V=\\tfrac13\\pi r^2h')}.`)];
      hints = [`Erst der Radius: ${tex(`r=${ft(d)}:2=${ft(r)}`)}.`, `Kegel: ein Drittel von Grundfläche mal Höhe, ${tex('V=\\tfrac13\\cdot\\pi\\cdot r^2\\cdot h')}.`, `Grundfläche: ${tex(`\\pi\\cdot ${ft(r)}^2\\approx ${ft(PI * r * r, 2)}`)}.`, `${tex(`\\tfrac13\\cdot ${ft(PI * r * r, 2)}\\cdot ${ft(hh)}${ca(want, 1)}`)}.`]; explain = `${tex(`r=${ft(r)}`)}, ${tex(`V=\\tfrac13\\cdot\\pi\\cdot ${ft(r)}^2\\cdot ${ft(hh)}${ca(want, 1)}`)} cm³.`; }
    else if (kind === 'fenster') { const w = 2 * ri(2, 6) / 10 + 0.4, hh = w + ri(2, 9) / 10, r = w / 2; want = w * hh + (PI * r * r) / 2; roh = { w, h: hh };
      prompt = `Ein Fenster besteht aus einem Rechteck (${fmt(w)} m breit, ${fmt(hh)} m hoch) und einem Halbkreis, der oben auf der ganzen Breite aufsitzt. Wie groß ist die Glasfläche (in m², auf eine Nachkommastelle gerundet)?`;
      opts = [V(want, true, undefined), V(w * hh + PI * r * r, false, 'Oben sitzt nur ein halber Kreis – die Kreisfläche muss halbiert werden.'), V(w * hh + (PI * w * w) / 2, false, 'Die Breite ist der Durchmesser des Halbkreises, der Radius ist halb so groß.'), V(w * hh, false, 'Das ist nur das Rechteck – der Halbkreis fehlt.')];
      if (opts.some((o, i) => opts.some((p, j) => i < j && Math.abs(o.num - p.num) < 0.25))) continue;
      hints = [`Die Fläche zerlegen: Rechteck plus Halbkreis. Rechteck: ${tex(`${ft(w)}\\cdot ${ft(hh)}=${ft(w * hh, 3)}`)}.`, `Der Halbkreis hat die Fensterbreite als Durchmesser: ${tex(`r=${ft(w)}:2=${ft(r)}`)}.`, `Halbkreis: ${tex(`\\tfrac12\\cdot\\pi\\cdot ${ft(r)}^2\\approx ${ft((PI * r * r) / 2, 3)}`)}.`, `Zusammen: ${tex(`${ft(w * hh, 3)}+${ft((PI * r * r) / 2, 3)}${opts[0].tex.startsWith('\\approx') ? opts[0].tex : `=${opts[0].tex}`}`)}.`]; explain = `${tex(`A=${ft(w)}\\cdot ${ft(hh)}+\\tfrac12\\cdot\\pi\\cdot ${ft(r)}^2\\approx ${ft(w * hh, 3)}+${ft((PI * r * r) / 2, 3)}${opts[0].tex.startsWith('\\approx') ? opts[0].tex : `=${opts[0].tex}`}`)} m².`; }
    else if (kind === 'dose') { const r = halb(), hh = halb() + 3; want = 2 * PI * r * r + 2 * PI * r * hh; roh = { r, h: hh };
      prompt = `Eine geschlossene Dose (Zylinder) hat den Radius ${tex(`r=${ft(r)}`)} cm und die Höhe ${tex(`h=${ft(hh)}`)} cm. Wie viel Blech braucht man für die ganze Oberfläche (in cm²)?`;
      opts = [V(want, true), V(2 * PI * r * hh, false, 'Das ist nur die Mantelfläche – Boden und Deckel fehlen.'), V(PI * r * r + 2 * PI * r * hh, false, 'Die Dose ist geschlossen: Boden <b>und</b> Deckel zählen.'), V(PI * r * r * hh, false, 'Das ist das Volumen, nicht die Oberfläche.')];
      hints = ['Die Oberfläche besteht aus Boden, Deckel (zwei Kreise) und dem Mantel (abgerollt ein Rechteck).', `Boden und Deckel: ${tex(`2\\cdot\\pi\\cdot ${ft(r)}^2\\approx ${ft(2 * PI * r * r, 2)}`)}.`, `Mantel = Umfang mal Höhe: ${tex(`2\\cdot\\pi\\cdot ${ft(r)}\\cdot ${ft(hh)}\\approx ${ft(2 * PI * r * hh, 2)}`)}.`, `Zusammen: ${tex(`${ft(2 * PI * r * r, 2)}+${ft(2 * PI * r * hh, 2)}${ca(want, 1)}`)}.`]; explain = `${tex(`O=2\\pi r^2+2\\pi r h\\approx ${ft(2 * PI * r * r, 2)}+${ft(2 * PI * r * hh, 2)}${ca(want, 1)}`)} cm².`; }
    else if (kind === 'tank') { const d = pick([1.2, 1.4, 1.6, 1.8, 2.4]), hh = pick([1.5, 2.5, 3.2, 4.5]), p = pick([35, 45, 65, 85]), r = d / 2, v = PI * r * r * hh; want = v * 10 * p; roh = { d, h: hh, p };
      prompt = `Ein zylinderförmiger Wassertank hat den Innendurchmesser ${tex(`d=${ft(d)}`)} m und die Höhe ${tex(`h=${ft(hh)}`)} m. Er ist zu ${p} % gefüllt. Wie viele Liter Wasser enthält er?`;
      opts = [V(want, true), V(v * 40 * p, false, 'Hier wurde mit dem Durchmesser statt mit dem Radius gerechnet.'), V(v * 1000, false, `Das ist der volle Tank – er ist aber nur zu ${p} % gefüllt.`), V((v * p) / 100, false, `Das sind Kubikmeter. Ein Kubikmeter fasst 1000 Liter.`)];
      hints = [`Erst der Radius: ${tex(`r=${ft(d)}:2=${ft(r)}`)} m.`, `Volumen des ganzen Tanks: ${tex(`V=\\pi\\cdot r^2\\cdot h=\\pi\\cdot ${ft(r)}^2\\cdot ${ft(hh)}\\approx ${ft(v, 4)}`)} m³.`, `Umrechnen – ein Kubikmeter sind 1000 Liter: ${tex(`${ft(v, 4)}\\cdot 1000\\approx ${ft(v * 1000, 1)}`)} Liter.`, `Davon ${p} %: ${tex(`${ft(v * 1000, 1)}\\cdot ${ft(p / 100)}${ca(want, 1)}`)} Liter.`];
      explain = `${tex(`V=\\pi\\cdot ${ft(r)}^2\\cdot ${ft(hh)}\\approx ${ft(v, 4)}`)} m³, das sind ${tex(`${ft(v * 1000, 1)}`)} Liter; ${p} % davon: ${tex(`${ft(v * 1000, 1)}\\cdot ${ft(p / 100)}${ca(want, 1)}`)} Liter.`; }
    else if (kind === 'kegelmantel') { const r = pick([2.5, 3, 4.5, 5, 6]), s = r + pick([1.5, 2, 3.5, 4, 5.5]), hh = Math.sqrt(s * s - r * r); want = (PI * r * r * hh) / 3; roh = { r, s };
      if (ganz(hh)) continue;
      prompt = `Ein Kegel hat den Radius ${tex(`r=${ft(r)}`)} cm und die Mantellinie ${tex(`s=${ft(s)}`)} cm (Strecke von der Spitze zum Rand der Grundfläche). Wie groß ist sein Volumen (in cm³)?`;
      opts = [V(want, true), V((PI * r * r * s) / 3, false, 'Die Mantellinie ist nicht die Höhe: Die Höhe steht senkrecht auf der Grundfläche und ist kürzer (Satz des Pythagoras).'), V(PI * r * r * hh, false, `Es fehlt der Faktor ${tex('\\tfrac13')}: Ein Kegel füllt nur ein Drittel des Zylinders.`), V((PI * r * r * (s - r)) / 3, false, 'Die Höhe ist nicht einfach Mantellinie minus Radius – erst quadrieren (Satz des Pythagoras).')];
      hints = [`Für das Volumen fehlt die Höhe. Höhe, Radius und Mantellinie bilden ein rechtwinkliges Dreieck mit der Mantellinie als Hypotenuse (Satz des Pythagoras): ${tex(`h^2=s^2-r^2=${ft(s * s)}-${ft(r * r)}=${ft(s * s - r * r)}`)}.`, `${tex(`h=\\sqrt{${ft(s * s - r * r)}}${un(hh, 3)}`)} cm.`, `Kegelvolumen: ${tex('V=\\tfrac13\\cdot\\pi\\cdot r^2\\cdot h')}.`, `Einsetzen: ${tex(`V\\approx\\tfrac13\\cdot\\pi\\cdot ${ft(r * r)}\\cdot ${ft(hh, 3)}${ca(want, 1)}`)} cm³.`];
      explain = `${tex(`h=\\sqrt{${ft(s)}^2-${ft(r)}^2}${un(hh, 3)}`)}, ${tex(`V=\\tfrac13\\cdot\\pi\\cdot ${ft(r)}^2\\cdot ${ft(hh, 3)}${ca(want, 1)}`)} cm³.`; }
    else if (kind === 'rohr') { const R = pick([2.5, 3, 4, 5]), w = pick([0.4, 0.5, 0.8]), r = rd(R - w), l = pick([80, 120, 150, 250]), [stoff, rho] = pick([['Stahl', 7.85], ['Kupfer', 8.96], ['Aluminium', 2.7]]), q = PI * (R * R - r * r); want = (q * l * rho) / 1000; roh = { R, r, l, rho };
      prompt = `Ein Rohr aus ${stoff} (Dichte ${fmt(rho)} g/cm³) ist ${l} cm lang. Sein Außenradius beträgt ${tex(`r_a=${ft(R)}`)} cm, sein Innenradius ${tex(`r_i=${ft(r)}`)} cm. Wie schwer ist das Rohr (in kg)?`;
      opts = [V(want, true), V((PI * (R - r) ** 2 * l * rho) / 1000, false, `${tex('r_a^2-r_i^2')} ist nicht dasselbe wie ${tex('(r_a-r_i)^2')}: Erst beide Radien quadrieren, dann subtrahieren.`), V((PI * R * R * l * rho) / 1000, false, 'Das wäre ein massiver Stab – der Hohlraum muss abgezogen werden.'), V(q * l * rho, false, 'Das sind Gramm. 1000 g sind 1 kg.')];
      hints = [`Querschnitt ist ein Kreisring – großer Kreis minus kleiner Kreis: ${tex(`A=\\pi\\cdot(r_a^2-r_i^2)=\\pi\\cdot(${ft(R * R)}-${ft(r * r)})\\approx ${ft(q, 3)}`)} cm².`, `Volumen = Querschnitt mal Länge: ${tex(`V\\approx ${ft(q, 3)}\\cdot ${l}\\approx ${ft(q * l, 1)}`)} cm³.`, `Masse = Volumen mal Dichte: ${tex(`m\\approx ${ft(q * l, 1)}\\cdot ${ft(rho)}\\approx ${ft(q * l * rho, 0)}`)} g.`, `In Kilogramm: ${tex(`${ft(q * l * rho, 0)}:1000${ca(want, 1)}`)} kg.`];
      explain = `${tex(`V=\\pi\\cdot(${ft(R)}^2-${ft(r)}^2)\\cdot ${l}\\approx ${ft(q * l, 1)}`)} cm³, ${tex(`m\\approx ${ft(q * l, 1)}\\cdot ${ft(rho)}\\approx ${ft(q * l * rho, 0)}`)} g, also ${tex(ca(want, 1).replace('\\approx ', '\\approx'))} kg.`; }
    else if (kind === 'radius') { const v = pick([250, 330, 500, 750, 1000]), hh = pick([8, 10.5, 12, 15.5]); want = Math.sqrt(v / (PI * hh)); roh = { V: v, h: hh };
      prompt = `Eine zylinderförmige Dose soll ${v} cm³ fassen und ${tex(`h=${ft(hh)}`)} cm hoch sein. Welchen Radius muss sie haben (in cm)?`;
      opts = [V(want, true), V(v / (PI * hh), false, `Das ist ${tex('r^2')} – am Ende muss noch die Wurzel gezogen werden.`), V(Math.sqrt(v / hh), false, `Beim Umstellen von ${tex('V=\\pi r^2h')} wird auch durch ${tex('\\pi')} geteilt.`), V(2 * want, false, 'Das ist der Durchmesser. Gesucht ist der Radius.')];
      hints = [`Zylinder: ${tex('V=\\pi\\cdot r^2\\cdot h')}. Gesucht ist ${tex('r')} – die Formel wird umgestellt.`, `Durch ${tex('\\pi\\cdot h')} teilen: ${tex(`r^2=\\dfrac{V}{\\pi\\cdot h}=\\dfrac{${v}}{\\pi\\cdot ${ft(hh)}}\\approx ${ft(v / (PI * hh), 3)}`)}.`, `Wurzel ziehen: ${tex(`r\\approx\\sqrt{${ft(v / (PI * hh), 3)}}${ca(want, 1)}`)} cm.`, `Probe: ${tex(`\\pi\\cdot ${ft(want, 2)}^2\\cdot ${ft(hh)}\\approx ${ft(PI * rd(want) ** 2 * hh, 0)}`)} cm³.`];
      explain = `${tex(`r=\\sqrt{\\dfrac{V}{\\pi\\cdot h}}=\\sqrt{\\dfrac{${v}}{\\pi\\cdot ${ft(hh)}}}\\approx\\sqrt{${ft(v / (PI * hh), 3)}}${ca(want, 1)}`)} cm.`; }
    else { const s = pick([4, 5, 6, 8]), k = s + pick([0.5, 1, 2.5, 3, 4.5]), hh = Math.sqrt(k * k - (s * s) / 2), falsch = Math.sqrt(k * k - (s * s) / 4); want = (s * s * hh) / 3; roh = { a: s, k };
      if (ganz(hh)) continue;
      prompt = `Eine Pyramide hat eine quadratische Grundfläche mit der Seitenlänge ${tex(`a=${s}`)} cm. Jede Seitenkante (von einer Ecke der Grundfläche zur Spitze) ist ${tex(`k=${ft(k)}`)} cm lang. Wie groß ist ihr Volumen (in cm³)?`;
      opts = [V(want, true), V((s * s * k) / 3, false, 'Die Seitenkante ist nicht die Höhe: Die Höhe steht senkrecht über der Mitte der Grundfläche und ist kürzer.'), V((s * s * falsch) / 3, false, 'Die Seitenkante endet an einer <b>Ecke</b>: Im rechtwinkligen Dreieck liegt die halbe Diagonale der Grundfläche, nicht die halbe Seite.'), V(s * s * hh, false, `Es fehlt der Faktor ${tex('\\tfrac13')}: Eine Pyramide füllt nur ein Drittel des Quaders.`)];
      hints = [`Für das Volumen fehlt die Höhe. Sie steht über dem Mittelpunkt der Grundfläche; von dort bis zu einer Ecke ist es die halbe Diagonale. Diagonale (Satz des Pythagoras): ${tex(`d^2=${s}^2+${s}^2=${2 * s * s}`)}.`, `Halbe Diagonale zum Quadrat: ${tex(`\\left(\\tfrac d2\\right)^2=${2 * s * s}:4=${ft((s * s) / 2)}`)}.`, `Höhe, halbe Diagonale und Seitenkante bilden ein rechtwinkliges Dreieck: ${tex(`h^2=k^2-\\left(\\tfrac d2\\right)^2=${ft(k * k)}-${ft((s * s) / 2)}=${ft(k * k - (s * s) / 2)}`)}, also ${tex(`h${un(hh, 3)}`)} cm.`, `Volumen: ${tex(`V=\\tfrac13\\cdot a^2\\cdot h\\approx\\tfrac13\\cdot ${s * s}\\cdot ${ft(hh, 3)}${ca(want, 1)}`)} cm³.`];
      explain = `${tex(`h=\\sqrt{${ft(k)}^2-\\tfrac{${s}^2}{2}}=\\sqrt{${ft(k * k - (s * s) / 2)}}${un(hh, 3)}`)}, ${tex(`V=\\tfrac13\\cdot ${s}^2\\cdot ${ft(hh, 3)}${ca(want, 1)}`)} cm³.`; }
    if (!klar(opts) || !uniq(opts) || opts.slice(1).some((o) => Math.abs(o.num - want) < 0.3)) continue;
    return { prompt, options: shuffle(opts), hints, explain, kind, want, art: kind, roh };
  }
}

/** Mittelpunkt einer Strecke. */
export function genMittelpunkt(lv = 3) {
  for (;;) {
    const L = S(lv), art = pick([['eben'], ['eben2'], ['raum'], ['halb', 'parallelogramm'], ['seitenhalb', 'spiegel', 'parameter']][L - 1]);
    const O = (v, correct, why) => ({ tex: pt('M', v), vec: v.map((c) => rd(c, 4)), correct, why });
    const mitte = (P, Q) => P.map((c, i) => rd((c + Q[i]) / 2, 4)), zufall = (dim, R) => Array.from({ length: dim }, () => ri(-R, R));
    const reihen = (P, Q, M) => P.map((c, i) => tex(`\\tfrac{${ft(c)}+${par(Q[i])}}{2}=${ft(M[i])}`)).join(', ');
    let A, B, prompt, formula, opts, hints, explain, roh;
    if (art === 'eben' || art === 'eben2' || art === 'raum' || art === 'halb') {
      if (art === 'eben') { A = [ri(0, 6), ri(0, 6)]; B = A.map((c) => c + 2 * ri(1, 3)); }
      else if (art === 'eben2') { A = zufall(2, 6); B = A.map((c) => c + 2 * pick([-4, -3, -2, -1, 1, 2, 3])); if (A.every((c) => c >= 0) && B.every((c) => c >= 0)) continue; }
      else if (art === 'raum') { A = zufall(3, 6); B = A.map((c) => c + pick([-7, -5, -4, -3, -1, 2, 3, 4, 5, 6])); if (B.every((c, i) => (c + A[i]) % 2 === 0)) continue; }
      else { A = zufall(3, 8).map((c) => c + pick([0, 0.5])); B = A.map((c) => rd(c + pick([-7.5, -5, -3.5, -2, 1.5, 2.5, 4, 5.5, 7]))); if (A.every((c) => Number.isInteger(c))) continue; }
      const M = mitte(A, B); roh = { A, B };
      prompt = `Bestimme den Mittelpunkt der Strecke ${tex('AB')}.`; formula = A.length > 2 ? zeilen(pt('A', A), pt('B', B)) : `${pt('A', A)},\\quad ${pt('B', B)}`;
      opts = [O(M, true), O(B.map((c, i) => c - A[i]), false, 'Das ist der Verbindungsvektor von A nach B, kein Punkt in der Mitte.'), O(B.map((c, i) => (c - A[i]) / 2), false, 'Das ist der halbe Verbindungsvektor. Er muss noch an A angehängt werden – oder direkt: Koordinaten addieren und halbieren.'), O(A.map((c, i) => c + B[i]), false, 'Die Summe muss noch halbiert werden.')];
      if (art === 'eben') { hints = [`Erste Koordinate – die Mitte zwischen ${A[0]} und ${B[0]}: ${tex(`(${A[0]}+${B[0]}):2=${M[0]}`)}.`, `Zweite Koordinate genauso: ${tex(`(${A[1]}+${B[1]}):2=${M[1]}`)}.`]; explain = `${tex(pt('M', M))}.`; }
      else { hints = [`Jede Koordinate des Mittelpunkts ist der Mittelwert der beiden Punkte: ${tex('M=\\tfrac12\\,(A+B)')}.`, ...A.map((c, i) => `${i + 1}. Koordinate: ${tex(`(${ft(c)}+${par(B[i])}):2=${ft(rd(c + B[i]))}:2=${ft(M[i])}`)}.`)]; explain = `${tex(pt('M', M))}: je Koordinate addieren und durch 2 teilen.`; }
    } else if (art === 'parallelogramm') {
      const P = zufall(3, 6), Bp = P.map((c) => c + pick([-5, -3, -2, 1, 3, 4, 6])), D = P.map((c) => c + pick([-4, -3, -1, 2, 3, 5])), C = Bp.map((c, i) => c + D[i] - P[i]); A = Bp; B = D; roh = { A: P, B: Bp, D };
      const M = mitte(Bp, D);
      prompt = `${tex('ABCD')} ist ein Parallelogramm. Bestimme den Schnittpunkt ${tex('M')} seiner Diagonalen.`; formula = zeilen(`${pt('A', P)},\\quad ${pt('B', Bp)}`, pt('D', D));
      opts = [O(M, true), O(mitte(P, Bp), false, `Das ist der Mittelpunkt der Seite ${tex('AB')}, nicht der Schnittpunkt der Diagonalen.`), O(C, false, `Das ist der vierte Eckpunkt ${tex('C')}, nicht der Schnittpunkt der Diagonalen.`), O(mitte(P, D), false, `Das ist der Mittelpunkt der Seite ${tex('AD')}, nicht der Schnittpunkt der Diagonalen.`)];
      hints = [`Im Parallelogramm halbieren sich die Diagonalen: ${tex('M')} ist der Mittelpunkt der Diagonale ${tex('BD')} – und beide Endpunkte sind gegeben.`, `Je Koordinate addieren und halbieren: ${reihen(Bp, D, M)}.`, `Probe über die andere Diagonale: ${tex(`C=B+D-A`)} ergibt ${tex(pt('C', C))}, und der Mittelpunkt von ${tex('AC')} ist derselbe Punkt.`];
      explain = `${tex(`M=\\tfrac12\\,(B+D)`)}, also ${tex(pt('M', M))}. Probe: ${tex(pt('C', C))}, Mittelpunkt von ${tex('AC')} ist ebenfalls ${tex(pt('M', M))}.`;
    } else if (art === 'seitenhalb') {
      const P = zufall(3, 8), Q = zufall(3, 8), R = zufall(3, 8), Ma = mitte(Q, R), M = mitte(P, Ma); A = P; B = Ma; roh = { A: P, B: Q, C: R };
      if (Ma.every((c) => Number.isInteger(c)) || same(Q, R)) continue;
      prompt = `Im Dreieck ${tex('ABC')} ist ${tex('M_a')} der Mittelpunkt der Seite ${tex('BC')}. Bestimme den Mittelpunkt ${tex('M')} der Seitenhalbierenden von ${tex('A')} nach ${tex('M_a')}.`; formula = zeilen(`${pt('A', P)},\\quad ${pt('B', Q)}`, pt('C', R));
      opts = [O(M, true), O(Ma, false, `Das ist erst der Seitenmittelpunkt ${tex('M_a')}. Gesucht ist der Mittelpunkt der Strecke von ${tex('A')} nach ${tex('M_a')}.`), O(mitte(P, Q), false, `Das ist der Mittelpunkt der Seite ${tex('AB')} – die Seitenhalbierende von ${tex('A')} endet auf der Seite ${tex('BC')}.`), O(P.map((c, i) => (c + Q[i] + R[i]) / 2), false, `${tex('A')} zählt zur Hälfte, ${tex('B')} und ${tex('C')} zählen je nur zu einem Viertel: ${tex('M=\\tfrac12A+\\tfrac14B+\\tfrac14C')}.`)];
      hints = [`Erster Schritt – Mittelpunkt von ${tex('BC')}: ${reihen(Q, R, Ma)}.`, `Also ${tex(pt('M_a', Ma))}.`, `Zweiter Schritt – Mittelpunkt der Strecke von ${tex('A')} nach ${tex('M_a')}: ${reihen(P, Ma, M)}.`, `Ergebnis: ${tex(pt('M', M))}.`];
      explain = `${tex(pt('M_a', Ma))}, dann ${tex(`M=\\tfrac12\\,(A+M_a)`)}, also ${tex(pt('M', M))}. In einer Formel: ${tex('M=\\tfrac12A+\\tfrac14B+\\tfrac14C')}.`;
    } else if (art === 'spiegel') {
      const P = zufall(3, 6), Zt = zufall(3, 5).map((c) => c + pick([0, 0.5])), Q = zufall(3, 8), Ps = P.map((c, i) => rd(2 * Zt[i] - c)), M = mitte(Ps, Q); A = Ps; B = Q; roh = { A: P, Z: Zt, B: Q };
      if (same(P, Zt) || same(Ps, Q)) continue;
      prompt = `Der Punkt ${tex('A')} wird am Punkt ${tex('Z')} gespiegelt; der Bildpunkt heißt ${tex("A'")}. Bestimme den Mittelpunkt ${tex('M')} der Strecke von ${tex("A'")} nach ${tex('B')}.`; formula = zeilen(`${pt('A', P)},\\quad ${pt('Z', Zt)}`, pt('B', Q));
      opts = [O(M, true), O(mitte(P, Q), false, `Hier wurde die Spiegelung vergessen: Das ist der Mittelpunkt von ${tex('AB')}.`), O(Ps, false, `Das ist erst der Bildpunkt ${tex("A'")}. Gesucht ist der Mittelpunkt von ${tex("A'B")}.`), O(mitte(Zt.map((c, i) => c - P[i]), Q), false, `Bei der Punktspiegelung ist ${tex('Z')} der Mittelpunkt von ${tex('A')} und ${tex("A'")}: ${tex("A'=2Z-A")}, nicht ${tex('Z-A')}.`)];
      hints = [`Punktspiegelung: ${tex('Z')} ist der Mittelpunkt von ${tex('A')} und ${tex("A'")}, also ${tex("Z=\\tfrac12\\,(A+A')")}.`, `Nach ${tex("A'")} umstellen: ${tex("A'=2Z-A")}, je Koordinate ${P.map((c, i) => tex(`2\\cdot ${par(Zt[i])}-${par(c)}=${ft(Ps[i])}`)).join(', ')}.`, `Also ${tex(pt("A'", Ps))}.`, `Mittelpunkt von ${tex("A'B")}: ${reihen(Ps, Q, M)}.`];
      explain = `${tex("A'=2Z-A")} ergibt ${tex(pt("A'", Ps))}, dann ${tex("M=\\tfrac12\\,(A'+B)")}, also ${tex(pt('M', M))}.`;
    } else {
      const t = pick([-3.5, -2.5, -2, -1.5, -1, 1, 1.5, 2, 2.5, 3, 4.5]), c = pick([2, -2, 4, -4]), d = ri(-6, 6), a1 = ri(-7, 7), b1 = ri(-7, 7), b2 = ri(-7, 7), a3 = -(c * t + d); roh = { a1, a3, b1, b2, c, d };
      if (a3 === 0 || d === 0) continue;
      A = [a1, t, a3]; B = [b1, b2, c * t + d];
      const M = mitte(A, B), t2 = -d / c, A2 = [a1, t2, a3], B2 = [b1, b2, c * t2 + d], dritte = `${kx(c).replace('x', 't')}${sg(d)}`;
      prompt = `Für welchen Wert von ${tex('t')} liegt der Mittelpunkt ${tex('M')} der Strecke ${tex('AB')} in der ${tex('x_1x_2')}-Ebene? Gib ${tex('M')} für diesen Wert an.`; formula = zeilen(`A(${ft(a1)}\\mid t\\mid ${ft(a3)})`, `B(${ft(b1)}\\mid ${ft(b2)}\\mid ${dritte})`);
      opts = [O(M, true), O(A.map((v, i) => v + B[i]), false, 'Die Summe der Koordinaten muss noch halbiert werden.'), O(mitte(A2, B2), false, `Nicht ${tex('B')} soll in der Ebene liegen, sondern der Mittelpunkt: Die dritten Koordinaten von ${tex('A')} und ${tex('B')} müssen sich zu null ergänzen.`), O(B.map((v, i) => (v - A[i]) / 2), false, 'Das ist der halbe Verbindungsvektor, nicht der Mittelpunkt: Koordinaten addieren, nicht subtrahieren.')];
      hints = [`Ein Punkt liegt in der ${tex('x_1x_2')}-Ebene, wenn seine dritte Koordinate null ist.`, `Dritte Koordinate von ${tex('M')}: ${tex(`\\dfrac{${ft(a3)}+(${dritte})}{2}=0`)}, also ${tex(`${kx(c).replace('x', 't')}${sg(a3 + d)}=0`)}.`, `Nach ${tex('t')} auflösen: ${tex(`t=${ft(-(a3 + d))}:${par(c)}=${ft(t)}`)}.`, `Einsetzen: ${tex(pt('A', A))} und ${tex(pt('B', B))}.`, `Mittelpunkt: ${reihen(A, B, M)}.`];
      explain = `Aus ${tex(`${ft(a3)}+(${dritte})=0`)} folgt ${tex(`t=${ft(t)}`)}. Damit ist ${tex(pt('A', A))}, ${tex(pt('B', B))} und ${tex(pt('M', M))}.`;
    }
    if (opts.some((o, i) => opts.some((p, j) => i < j && same(o.vec, p.vec))) || !uniq(opts)) continue;
    return { prompt, formula, options: shuffle(opts), hints, explain, A, B, art, roh };
  }
}

/** Mit Vektoren rechnen: addieren, subtrahieren, vervielfachen. */
export function genVektorRechnen(lv = 3) {
  for (;;) {
    const L = S(lv), art = pick([['add2'], ['add', 'sub', 'skalar'], ['skalarneg', 'kombi'], ['dezimal', 'gleichung'], ['linkombi', 'parameter', 'drohne']][L - 1]);
    const O = (vec, correct, why) => ({ tex: vecTex(vec), vec: vec.map((c) => rd(c, 4)), correct, why });
    const U = '\\vec u', Vv = '\\vec v', zufall = (dim, R) => Array.from({ length: dim }, () => ri(-R, R));
    const zl = (f) => [0, 1, 2].slice(0, u.length).map((i) => tex(f(i))).join(', ');
    let u, v, k = 1, kind, term, prompt, formula, opts, hints, explain, roh;
    if (art === 'add2') { u = [ri(1, 6), ri(1, 6)]; v = [ri(1, 6), ri(1, 6)]; kind = 'add'; }
    else if (art === 'add' || art === 'sub') { u = zufall(3, 5); v = zufall(3, 5); kind = art; if (v.every((c) => c >= 0)) continue; }
    else if (art === 'skalar') { u = zufall(3, 5); v = zufall(3, 5); k = pick([2, 3, 4]); kind = 'skalar'; }
    else if (art === 'skalarneg') { u = zufall(3, 7); v = zufall(3, 7); k = pick([-2, -3, -4, -5]); kind = 'skalar'; if (u.every((c) => c >= 0)) continue; }
    else if (art === 'kombi') { u = zufall(3, 6); v = zufall(3, 6); k = pick([2, 3, -2, -3, 4]); kind = 'kombi'; }
    else if (art === 'dezimal') { u = zufall(3, 9); v = zufall(3, 9); k = pick([0.5, 1.5, -0.5, -1.5, 2.5, -2.5]); kind = 'kombi'; if (u.every((c) => c % 2 === 0)) continue; }
    else if (art === 'gleichung') { u = zufall(3, 7); v = zufall(3, 7); k = pick([2, 3, -2, -3, 4, -4]); kind = 'kombi'; }
    if (u && u.some((c) => c === 0) && L <= 2) continue;
    if (art === 'linkombi') {
      const a = zufall(3, 6), b = zufall(3, 6), c = zufall(3, 6), m = pick([2, 3]); k = pick([1.5, 2.5, -0.5, -1.5]); kind = 'kombi'; roh = { a, b, c, k, m };
      u = a.map((x, i) => x - b[i]); v = c.map((x, i) => x + m * b[i]);
      const ku = u.map((x) => k * x), mb = b.map((x) => m * x), erg = u.map((x, i) => k * x - v[i]);
      term = `${ft(k)}\\,(\\vec a-\\vec b)-(\\vec c+${m}\\,\\vec b)`; prompt = `Berechne ${tex(term)}.`; formula = zeilen(`\\vec a=${vecTex(a)},\\quad \\vec b=${vecTex(b)}`, `\\vec c=${vecTex(c)}`);
      opts = [O(erg, true), O(ku.map((x, i) => x - c[i] + mb[i]), false, `Das Minus vor der zweiten Klammer gilt für <b>beide</b> Summanden: ${tex(`-\\vec c-${m}\\,\\vec b`)}.`), O(a.map((x, i) => k * x - b[i] - v[i]), false, `Der Faktor ${tex(ft(k))} gehört zur ganzen ersten Klammer, nicht nur zu ${tex('\\vec a')}.`), O(ku.map((x, i) => x + v[i]), false, 'Die zweite Klammer wird abgezogen, nicht addiert.')];
      hints = [`Erste Klammer, Zeile für Zeile: ${tex(`\\vec a-\\vec b=${vecTex(u)}`)}.`, `Mit ${tex(ft(k))} vervielfachen: ${tex(`${ft(k)}\\cdot${vecTex(u)}=${vecTex(ku)}`)}.`, `Zweite Klammer – erst ${tex(`${m}\\,\\vec b=${vecTex(mb)}`)}, dann ${tex(`\\vec c+${m}\\,\\vec b=${vecTex(v)}`)}.`, `Abziehen, Zeile für Zeile (auf „minus minus“ achten): ${tex(`${vecTex(ku)}-${vecTex(v)}=${vecTex(erg)}`)}.`];
      explain = `${tex(`${ft(k)}\\cdot${vecTex(u)}-${vecTex(v)}`)} ${tex(`=${vecTex(ku)}-${vecTex(v)}=${vecTex(erg)}`)}.`;
    } else if (art === 'drohne') {
      // Anwendung: Ort = Startpunkt + Zeit · (Eigengeschwindigkeit + Wind); in den Rechen-Feldern ist u die wirkliche Geschwindigkeit und v der Gegenvektor des Startpunkts
      const p = [ri(-20, 20), ri(-20, 20), ri(2, 30)], a = zufall(3, 6), w = [pick([-2, -1, 1, 2]), pick([-1.5, -0.5, 0, 0.5, 1.5]), 0], T = pick([2.5, 3.5, 4.5, 7.5, 12.5]); k = T; kind = 'kombi'; roh = { p, a, w, T };
      if (a.filter((x) => x === 0).length > 1) continue;
      u = a.map((x, i) => rd(x + w[i])); v = p.map((x) => -x);
      const weg = u.map((x) => rd(T * x)), erg = p.map((x, i) => rd(x + weg[i]));
      prompt = `Eine Drohne startet an dem Ort mit dem Ortsvektor ${tex('\\vec p')} (alle Längen in m). Sie fliegt ${fmt(T)} Sekunden lang mit dem Geschwindigkeitsvektor ${tex('\\vec a')} (in m/s); gleichzeitig versetzt sie der Wind mit ${tex('\\vec w')} (in m/s). Welchen Ortsvektor hat sie danach?`;
      formula = zeilen(`\\vec p=${vecTex(p)}`, `\\vec a=${vecTex(a)},\\quad \\vec w=${vecTex(w)}`);
      opts = [O(erg, true), O(p.map((x, i) => x + T * a[i]), false, 'Der Wind fehlt: Er verschiebt die Drohne die ganze Flugzeit über mit.'), O(weg, false, `Das ist nur die Verschiebung. Sie muss an den Startpunkt ${tex('\\vec p')} angehängt werden.`), O(p.map((x, i) => x + T * a[i] + w[i]), false, `Der Wind wirkt ${fmt(T)} Sekunden lang, nicht nur eine Sekunde – auch ${tex('\\vec w')} wird mit der Zeit vervielfacht.`)];
      hints = [`Eigengeschwindigkeit und Wind überlagern sich – wirkliche Geschwindigkeit, Zeile für Zeile: ${tex(`\\vec a+\\vec w=${vecTex(u)}`)}.`, `Verschiebung = Zeit mal Geschwindigkeit: ${tex(`${ft(T)}\\cdot${vecTex(u)}=${vecTex(weg)}`)}.`, `An den Startpunkt anhängen: ${tex(`\\vec p+${vecTex(weg)}=${vecTex(erg)}`)}.`, `Probe mit der dritten Zeile (Höhe): ${tex(`${ft(p[2])}+${ft(T)}\\cdot ${par(u[2])}=${ft(erg[2])}`)} m.`];
      explain = `${tex(`\\vec p+${ft(T)}\\cdot(\\vec a+\\vec w)`)} ${tex(`=${vecTex(p)}+${ft(T)}\\cdot${vecTex(u)}`)} ${tex(`=${vecTex(erg)}`)}.`;
    } else if (art === 'parameter') {
      const t = pick([-2.5, -1.5, -2, -1, 1, 1.5, 2, 3, 3.5]), c = pick([2, 3, -1]), d = pick([-4, -3, -2, -1, 1, 2, 3, 4]), p = pick([-5, -4, -3, -2, 2, 3, 4, 5]), v1 = ri(-6, 6), v2 = ri(-6, 6); k = pick([2, 3, -2]); kind = 'kombi';
      const v3 = rd(k * (c * t + d) - k * t + v1), uVon = (s) => [s, p, c * s + d], rechne = (s, vz = -1) => uVon(s).map((x, i) => rd(k * x + vz * [v1, v2, v3][i])), t2 = d / (1 - c);
      u = uVon(t); v = [v1, v2, v3]; roh = { p, c, d, k, v };
      const dritte = `${kx(c).replace('x', 't')}${sg(d)}`, lhs = `${kx(k).replace('x', 't')}${sg(-v1)}`, rhs = `${kx(k * c).replace('x', 't')}${sg(k * d - v3)}`;
      term = `${ft(k)}\\cdot${U}-${Vv}`; prompt = `Für welchen Wert von ${tex('t')} stimmen die erste und die dritte Koordinate von ${tex(term)} überein? Gib den Vektor ${tex(term)} für diesen Wert an.`;
      formula = `${U}=\\begin{pmatrix}t\\\\${ft(p)}\\\\${dritte}\\end{pmatrix},\\quad ${Vv}=${vecTex(v)}`;
      opts = [O(rechne(t), true), O(rechne(t, 1), false, `${tex(Vv)} wird abgezogen, nicht addiert.`), O(rechne(t2), false, `Verglichen werden die Koordinaten von ${tex(term)}, nicht die von ${tex(U)} allein – auch ${tex(Vv)} gehört in die Gleichung.`), O(rechne(-t), false, `Vorzeichenfehler beim Auflösen nach ${tex('t')} – setze zur Probe ein: Erste und dritte Koordinate müssen gleich sein.`)];
      hints = [`Erste Koordinate von ${tex(term)}: ${tex(`${ft(k)}\\cdot t-${par(v1)}=${lhs}`)}.`, `Dritte Koordinate: ${tex(`${ft(k)}\\cdot(${dritte})-${par(v3)}=${rhs}`)}.`, `Gleichsetzen und nach ${tex('t')} auflösen: ${tex(`${lhs}=${rhs}`)}, also ${tex(`${kx(k - k * c).replace('x', 't')}=${ft(k * d - v3 + v1)}`)} und ${tex(`t=${ft(t)}`)}.`, `Einsetzen: ${tex(`${U}=${vecTex(u)}`)}.`, `Vervielfachen und abziehen: ${tex(`${ft(k)}\\cdot${vecTex(u)}-${vecTex(v)}=${vecTex(rechne(t))}`)}.`];
      explain = `Aus ${tex(`${lhs}=${rhs}`)} folgt ${tex(`t=${ft(t)}`)}. Damit ist ${tex(`${term}=${vecTex(u.map((x) => k * x))}-${vecTex(v)}=${vecTex(rechne(t))}`)}.`;
    } else {
      const rg = { add: (i) => u[i] + v[i], sub: (i) => u[i] - v[i], skalar: (i) => k * u[i], kombi: (i) => k * u[i] - v[i] }[kind], erg = u.map((_, i) => rd(rg(i))), ku = u.map((c) => rd(k * c)); roh = { u, v, k, kind };
      formula = `${U}=${vecTex(u)},\\quad ${Vv}=${vecTex(v)}`;
      if (kind === 'add') { term = `${U}+${Vv}`; opts = [O(erg, true), O(u.map((c, i) => c - v[i]), false, 'Hier wurde subtrahiert statt addiert.'), O(u.map((c, i) => c * v[i]), false, 'Zeilenweise multiplizieren ist keine Vektoraddition.'), O(u.map((c, i) => (i === 0 ? c + v[i] : c)), false, 'Die Addition gilt für <b>jede</b> Zeile.')];
        hints = art === 'add2' ? ['Addiere Zeile für Zeile.', `Oben ${tex(`${u[0]}+${v[0]}`)}, unten ${tex(`${u[1]}+${v[1]}`)}.`] : ['Addiere Zeile für Zeile – achte auf die Vorzeichen.', `${zl((i) => `${ft(u[i])}+${par(v[i])}=${ft(erg[i])}`)}.`]; }
      else if (kind === 'sub') { term = `${U}-${Vv}`; opts = [O(erg, true), O(v.map((c, i) => c - u[i]), false, `Reihenfolge vertauscht: Das ist ${tex(`${Vv}-${U}`)}.`), O(u.map((c, i) => c + v[i]), false, 'Hier wurde addiert statt subtrahiert.'), O(u.map((c, i) => c - Math.abs(v[i])), false, 'Achte auf „minus minus“: Eine negative Zahl abzuziehen heißt addieren.')];
        hints = ['Subtrahiere Zeile für Zeile – eine negative Zahl abzuziehen heißt addieren.', `${zl((i) => `${ft(u[i])}-${par(v[i])}=${ft(erg[i])}`)}.`]; }
      else if (kind === 'skalar') { term = `${ft(k)}\\cdot${U}`; opts = [O(erg, true), O(u.map((c, i) => (i === 0 ? k * c : c)), false, 'Der Faktor wird mit <b>jeder</b> Zeile multipliziert.'), O(u.map((c) => c + k), false, 'Es wird multipliziert, nicht addiert.'), O(u.map((c) => -k * c), false, 'Achte auf das Vorzeichen des Faktors.')];
        hints = [`Multipliziere jede Zeile mit ${tex(ft(k))}${k < 0 ? ' – minus mal minus ergibt plus' : ''}.`, `${zl((i) => `${par(k)}\\cdot ${par(u[i])}=${ft(erg[i])}`)}.`]; }
      else { term = art === 'gleichung' ? null : `${ft(k)}\\cdot${U}-${Vv}`;
        opts = [O(erg, true), O(u.map((c, i) => k * c + v[i]), false, art === 'gleichung' ? `${tex(Vv)} steht links als Summand – beim Rüberbringen wird er abgezogen.` : 'Der zweite Vektor wird abgezogen, nicht addiert.'), O(u.map((c, i) => k * (c - v[i])), false, `Nur ${tex(U)} wird mit ${tex(ft(k))} multipliziert – Punkt vor Strich.`), O(u.map((c, i) => c - v[i]), false, `Der Faktor ${tex(ft(k))} vor ${tex(U)} fehlt.`)];
        hints = [...(art === 'gleichung' ? [`Nach ${tex('\\vec x')} auflösen – auf beiden Seiten ${tex(Vv)} abziehen: ${tex(`\\vec x=${ft(k)}\\cdot${U}-${Vv}`)}.`] : []), `Erst vervielfachen (Punkt vor Strich): ${tex(`${ft(k)}\\cdot${U}=${vecTex(ku)}`)}.`, `Dann ${tex(Vv)} abziehen, Zeile für Zeile: ${zl((i) => `${ft(ku[i])}-${par(v[i])}=${ft(erg[i])}`)}.`]; }
      prompt = art === 'gleichung' ? `Bestimme den Vektor ${tex('\\vec x')}, für den ${tex(`\\vec x+${Vv}=${ft(k)}\\cdot${U}`)} gilt.` : `Berechne ${tex(term)}.`;
      explain = art === 'gleichung' ? `${tex(`\\vec x=${ft(k)}\\cdot${U}-${Vv}=${vecTex(ku)}-${vecTex(v)}=${opts[0].tex}`)}.` : kind === 'kombi' ? `${tex(`${term}=${vecTex(ku)}-${vecTex(v)}=${opts[0].tex}`)}.` : `${tex(`${term}=${opts[0].tex}`)}.`;
    }
    if (opts.some((o, i) => opts.some((p, j) => i < j && same(o.vec, p.vec))) || !uniq(opts)) continue;
    return { prompt, formula, options: shuffle(opts), hints, explain, u, v, k, kind, art, roh };
  }
}

/* ───────────── Themen-Namen ───────────── */
for (const [fn, topic] of [[genBruch, 'Bruchrechnen'], [genKlammer, 'Klammern und binomische Formeln'], [genLinGl, 'Lineare Gleichungen'], [genQuadGl, 'Quadratische Gleichungen'], [genPotenz, 'Potenzgesetze'], [genSteigung, 'Geraden durch zwei Punkte'],
  [genHaeufigkeit, 'Relative Häufigkeit'], [genProzent, 'Prozentrechnung'], [genKennwerte, 'Mittelwert und Median'], [genLaplace, 'Laplace-Wahrscheinlichkeit'], [genGegen, 'Gegenereignis'],
  [genPythagoras, 'Satz des Pythagoras'], [genTrig, 'Sinus, Kosinus, Tangens'], [genFlaeche, 'Flächen und Volumen'], [genMittelpunkt, 'Mittelpunkt einer Strecke'], [genVektorRechnen, 'Rechnen mit Vektoren']]) fn.topic = topic;
