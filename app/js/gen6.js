// Aufgaben-Erzeuger, Teil 6: Mittelstufe (Klasse 5 bis 10).
// Gleiche Regeln wie in gen.js: Schwierigkeit lv (1–5), jede Aufgabe frisch gewürfelt (nur ri/pick/rand aus math.js),
// falsche Antworten sind typische Fehler mit Diagnose und nie zufällig auch richtig, mindestens zwei Tipps.
import { ri, pick, shuffle, rand, ft, fmt } from './math.js';
import { tex } from './ui.js';
import { tier, uniq, uniqNum } from './gen.js';

const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
/** Große Zahlen in Dreiergruppen: 12 500 (Fließtext) bzw. 12\,500 (Formel). */
const gT = (n) => (Math.abs(n) >= 10000 && Number.isInteger(n) ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : fmt(n, 4));
const gX = (n) => (Math.abs(n) >= 10000 && Number.isInteger(n) ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') : ft(n, 4));
const N = (num, correct, why, t) => ({ tex: t ?? gX(num), num, correct, why });
const br = (a, b) => `\\dfrac{${a}}{${b}}`;
const kl = (n) => (n < 0 ? `(${ft(n)})` : ft(n));
const gut = (opts) => opts.every((o) => Number.isFinite(o.num)) && uniqNum(opts) && uniq(opts);

/* ───────────── Klasse 5: Zahlen, Größen, Flächen ───────────── */

/* ── Paket gen6b: Helfer für die fünf Stufen (nur von den Erzeugern dieses Pakets benutzt) ── */
const b6L = (lv) => Math.min(5, Math.max(1, lv | 0 || 3));
/** Rechenkette: jedes Glied als eigene Formel, damit lange Wege auf schmalen Bildschirmen umbrechen. */
const b6k = (...t) => t.map((s, i) => tex(i ? `=${s}` : s)).join(' ');
const b6e = (e) => (e === '%' ? '\\,\\%' : `\\,\\text{${e.replace(/[²³]/, '')}}${e.endsWith('²') ? '^2' : e.endsWith('³') ? '^3' : ''}`);
/** Zahl für die Formel – Dreiergruppen ab fünf Stellen auch bei Kommazahlen (47\,052{,}5). */
const b6X = (n, d = 4) => { const [g, k] = ft(n, d).split('{,}'); return (g.replace('-', '').length > 4 ? g.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') : g) + (k ? `{,}${k}` : ''); };
/** Antwort mit Einheit; nicht aufgehende Werte werden auf d Stellen gerundet und mit ≈ gezeigt. */
const b6M = (num, c, w, e = '', d = 2) => { const v = +(+num).toFixed(d), z = Math.abs(v - num) < 1e-9 ? '' : '\\approx '; return { tex: `${z}${b6X(v)}${e ? b6e(e) : ''}`, num: v, correct: c, why: w }; };
/** Geldbetrag: im Fließtext und in der Formel (Cent immer zweistellig). */
const b6eu = (x) => (Number.isInteger(+(+x).toFixed(2)) ? gT(+(+x).toFixed(2)) : (+x).toFixed(2).replace('.', ','));
const b6ex = (x) => (Number.isInteger(+(+x).toFixed(2)) ? gX(+(+x).toFixed(2)) : (+x).toFixed(2).replace('.', '{,}'));
const b6G = (num, c, w) => ({ tex: `${b6ex(num)}\\,\\text{€}`, num: +(+num).toFixed(2), correct: c, why: w });
/** Richtige Antwort plus die ersten drei brauchbaren Ablenker (endlich, wirklich verschieden); sonst null → neu würfeln. */
const b6opts = (r, ks) => { const o = [r], z = (x) => x.num ?? x.probe;
  for (const k of ks) { if (o.length === 4) break; if (k && Number.isFinite(z(k)) && o.every((x) => Math.abs(z(x) - z(k)) > 1e-6 && x.tex !== k.tex)) o.push(k); }
  return o.length === 4 ? o : null; };
const b6kgv = (a, b) => (a / gcd(a, b)) * b;
/** Primfaktorzerlegung als Formel: 2^3·3·5. */
const b6pf = (n) => { const f = []; for (let p = 2; n > 1; p++) { let e = 0; while (n % p === 0) { n /= p; e++; } if (e) f.push(e > 1 ? `${p}^${e}` : `${p}`); } return f.join('\\cdot '); };
/** Linearer Term k·x + c als Formel. */
const b6lin = (k, c, v = 'x') => { const t = k === 0 ? '' : `${k === 1 ? '' : k === -1 ? '-' : k}${v}`; return c === 0 ? (t || '0') : `${t}${c > 0 && t ? '+' : ''}${c}`; };
/** c·√k als Formel. */
const b6w = (c, k) => `${c === 1 ? '' : c === -1 ? '-' : c}\\sqrt{${k}}`;

const STELLE = ['Einer', 'Zehner', 'Hunderter', 'Tausender', 'Zehntausender', 'Hunderttausender', 'Millionen'];
/** Natürliche Zahlen runden. */
export function genRunden(lv = 3) {
  for (;;) {
    const L = b6L(lv), vor = [], kand = []; let k, n, prompt, kind = 'zahl';
    if (L <= 3) {
      k = L === 1 ? 1 : L === 2 ? 2 : pick([3, 4]); const s0 = 10 ** k;
      n = L === 3 && rand() < 0.4 ? ri(1, 8) * s0 * 10 + 9 * s0 + ri(s0 / 2, s0 - 1) : ri(s0 + 1, s0 * (L === 1 ? 9 : 99));   // Stufe 3 auch mit Übertrag (… 9 5 …)
      prompt = `Runde ${gT(n)} auf ${STELLE[k]}.`;
    } else if (L === 4) {   // erst rechnen, dann runden
      kind = 'summe'; k = pick([2, 3]); const s0 = 10 ** k, x = [0, 1, 2].map(() => ri(s0 * 3 + 1, s0 * 70));
      const [vorn, ding, was] = pick([['Eine Stadt hat drei Stadtteile mit', 'Einwohnern', 'die Einwohnerzahl der ganzen Stadt'], ['Ein Stadion hatte an drei Spieltagen', 'Zuschauer', 'die Zahl aller Zuschauer'], ['Ein Lager bekommt drei Lieferungen mit', 'Schrauben', 'die Zahl aller Schrauben']]);
      n = x[0] + x[1] + x[2];
      prompt = `${vorn} ${gT(x[0])}, ${gT(x[1])} und ${gT(x[2])} ${ding}. Runde ${was} auf ${STELLE[k]}.`;
      vor.push(`Erst genau zusammenzählen: ${b6k(x.map((v) => gX(v)).join('+'), gX(n))}.`);
      kand.push(N(x.reduce((t, v) => t + Math.round(v / s0) * s0, 0), false, 'Hier wurde jede Zahl einzeln gerundet und dann addiert – dabei sammeln sich die Rundungsfehler. Erst genau rechnen, dann einmal runden.'));
    } else {   // Durchschnitt aus mehreren Werten, dann runden
      kind = 'mittel'; k = pick([2, 3]); const s0 = 10 ** k, cnt = pick([4, 5]), x = Array.from({ length: cnt }, () => ri(s0 * 11, s0 * 95)), sum = x.reduce((t, v) => t + v, 0);
      const [wo, ding] = pick([['in einen Freizeitpark', 'Besucher'], ['in ein Museum', 'Gäste'], ['zu einem Festival', 'Besucher']]);
      n = sum / cnt;
      prompt = `An ${cnt} Tagen kamen ${x.slice(0, -1).map((v) => gT(v)).join(', ')} und ${gT(x[cnt - 1])} ${ding} ${wo}. Wie viele waren es im Durchschnitt pro Tag? Runde auf ${STELLE[k]}.`;
      vor.push(`Erst alle Werte zusammenzählen: ${b6k(x.map((v) => gX(v)).join('+'), gX(sum))}.`, `Durch die Anzahl der Tage teilen: ${tex(`${gX(sum)}:${cnt}=${gX(n)}`)}.`);
      kand.push(N(Math.round(sum / s0) * s0, false, `Das ist die gerundete Summe – für den Durchschnitt muss noch durch ${cnt} geteilt werden.`));
    }
    const s = 10 ** k; if (n % s === 0) continue;
    const unten = Math.floor(n / s) * s, oben = unten + s, d = Math.floor(n / (s / 10)) % 10, r = d >= 5 ? oben : unten;
    const fein = Math.round(n / (s / 10)) * (s / 10), grob0 = Math.round(n / (s * 10)) * (s * 10), grob = grob0 === 0 || grob0 === r ? r + s : grob0;
    const opts = b6opts(N(r, true), [
      N(r === oben ? unten : oben, false, r === oben ? `Rechts von der ${STELLE[k]}stelle steht ${d} – ab 5 wird aufgerundet.` : `Rechts von der ${STELLE[k]}stelle steht ${d} – bei 0 bis 4 wird abgerundet.`), ...kand,
      N(fein, false, k === 1 ? 'Hier wurde gar nicht gerundet.' : `Das ist auf ${STELLE[k - 1]} gerundet – gefragt war auf ${STELLE[k]}.`),
      N(grob, false, grob0 === grob ? `Das ist auf ${STELLE[k + 1]} gerundet – gefragt war auf ${STELLE[k]}.` : 'Das ist eine Stufe zu weit aufgerundet.'),
      N(r + 2 * s, false, 'Das liegt zu weit weg: Gerundet wird auf den nächsten Nachbarn.')]);
    if (!opts) continue;
    const regel = `Rechts von der ${STELLE[k]}stelle steht ${d}, also wird ${d >= 5 ? 'aufgerundet' : 'abgerundet'}`;
    return { prompt, options: shuffle(opts),
      hints: [...vor, `Entscheidend ist die Ziffer direkt rechts von der ${STELLE[k]}stelle.`, `Dort steht ${d}. Bei 0 bis 4 wird abgerundet, bei 5 bis 9 aufgerundet.`],
      explain: vor.length ? `${vor.join(' ')} ${regel}: ${tex(`${gX(n)}\\approx${gX(r)}`)}.` : `${regel}: ${tex(gX(r))}.`, n, s, r, kind };
  }
}

/** Rechenregeln: Punkt vor Strich, Klammern zuerst, Potenzen vor Punkt. */
export function genRechenregel(lv = 3) {
  const L = b6L(lv), kind = pick([['pvs', 'minus'], ['pvs3', 'klammer3'], ['zwei3', 'zweidiv', 'klammerdiv'], ['klpot', 'klmal'], ['tief', 'breit']][L - 1]);
  for (;;) {
    const g = L >= 4 ? 12 : 9, a = ri(2, g), b = ri(2, g), c = ri(2, L >= 4 ? 9 : 6), d = ri(2, 6);
    const D = (v, w) => (Number.isFinite(v) && v >= 0 ? N(+v.toFixed(2), false, w) : null);   // keine negativen Ablenker – die kommen in Klasse 5 noch nicht vor
    let formula, r, st, kand;   // st: [Regel, Zwischenstand] der Reihe nach
    if (kind === 'pvs') { formula = `${a}+${b}\\cdot${c}`; r = a + b * c; st = [['Punkt vor Strich: erst malnehmen', `${a}+${b * c}`]];
      kand = [D((a + b) * c, 'Punkt vor Strich: Erst wird multipliziert, dann addiert.'), D(a + b + c, 'Zwischen den letzten beiden Zahlen steht ein Malpunkt, kein Plus.'), D(b * c, 'Der erste Summand wurde vergessen.')]; }
    else if (kind === 'minus') { const A = b * c + ri(1, 9); formula = `${A}-${b}\\cdot${c}`; r = A - b * c; st = [['Punkt vor Strich: erst malnehmen', `${A}-${b * c}`]];
      kand = [D((A - b) * c, 'Punkt vor Strich: Erst wird multipliziert, dann subtrahiert.'), D(A - b - c, 'Zwischen den letzten beiden Zahlen steht ein Malpunkt, kein Minus.'), D(A - b + c, 'Das Produkt wird als Ganzes abgezogen.')]; }
    else if (kind === 'pvs3') { const e = ri(1, a + b * c - 1); formula = `${a}+${b}\\cdot${c}-${e}`; r = a + b * c - e; st = [['Punkt vor Strich: erst malnehmen', `${a}+${b * c}-${e}`], ['Dann von links nach rechts', `${a + b * c}-${e}`]];
      kand = [D((a + b) * c - e, 'Punkt vor Strich: Erst wird multipliziert, dann addiert.'), D(a + b * (c - e), 'Punkt vor Strich: Das Produkt wird zuerst berechnet, erst danach wird abgezogen.'), D(a + b + c - e, 'Zwischen den mittleren Zahlen steht ein Malpunkt, kein Plus.'), D(a + b * c + e, 'Die letzte Zahl wird abgezogen.')]; }
    else if (kind === 'klammer3') { const e = ri(1, 9); formula = `(${a}+${b})\\cdot${c}-${e}`; r = (a + b) * c - e; st = [['Die Klammer zuerst', `${a + b}\\cdot${c}-${e}`], ['Punkt vor Strich', `${(a + b) * c}-${e}`]];
      kand = [D(a + b * c - e, 'Die Klammer wird zuerst ausgerechnet.'), D((a + b) * (c - e), 'Punkt vor Strich: Erst wird malgenommen, dann abgezogen.'), D(a * c + b - e, 'Beide Zahlen in der Klammer werden mit dem Faktor multipliziert.'), D((a + b) * c + e, 'Die letzte Zahl wird abgezogen.')]; }
    else if (kind === 'zwei3') { const e = ri(2, 9); formula = `${a}\\cdot${b}+${c}\\cdot${d}-${e}`; r = a * b + c * d - e; st = [['Punkt vor Strich: erst beide Produkte', `${a * b}+${c * d}-${e}`], ['Dann von links nach rechts', `${a * b + c * d}-${e}`]];
      kand = [D((a * b + c) * d - e, 'Nicht einfach von links nach rechts: Beide Produkte werden zuerst berechnet.'), D(a * b + c * (d - e), 'Punkt vor Strich: Das Produkt wird zuerst berechnet, erst danach wird abgezogen.'), D(a * (b + c) * d - e, 'Punkt vor Strich: Die Addition kommt nach den Produkten.'), D(a * b + c * d + e, 'Die letzte Zahl wird abgezogen.')]; }
    else if (kind === 'zweidiv') { const q = ri(2, 9), B = c * q, e = ri(2, 9); formula = `${a}\\cdot${b}-${B}:${c}+${e}`; r = a * b - q + e; if (a * b - q <= 0) continue; st = [['Punkt vor Strich: erst das Produkt und den Quotienten', `${a * b}-${q}+${e}`], ['Dann von links nach rechts', `${a * b - q}+${e}`]];
      kand = [D((a * b - B) / c + e, 'Nicht einfach von links nach rechts: Erst wird geteilt, dann abgezogen.'), D(a * b - q - e, 'Strichrechnung von links nach rechts: Nur der Quotient wird abgezogen, die letzte Zahl kommt dazu.'), D(a * b - B / (c + e), 'Punkt vor Strich: Geteilt wird nur durch die Zahl direkt hinter dem Geteilt-Zeichen.'), D(a * b + q + e, 'Zwischen Produkt und Quotient steht ein Minus.')]; }
    else if (kind === 'klammerdiv') { const q = ri(2, 9), B = d * q; formula = `(${a}+${b})\\cdot${c}-${B}:${d}`; r = (a + b) * c - q; if (r <= 0) continue; st = [['Die Klammer zuerst', `${a + b}\\cdot${c}-${B}:${d}`], ['Punkt vor Strich: erst das Produkt und den Quotienten', `${(a + b) * c}-${q}`]];
      kand = [D(((a + b) * c - B) / d, 'Nicht einfach von links nach rechts: Erst wird geteilt, dann abgezogen.'), D(a + b * c - q, 'Die Klammer wird zuerst ausgerechnet.'), D((a + b) * c + q, 'Zwischen Produkt und Quotient steht ein Minus.'), D((a + b) * c - B, 'Die Division am Ende fehlt.')]; }
    else if (kind === 'klpot') { const m = ri(2, 5), e = ri(1, 7), k = e + m; formula = `${a}+${b}\\cdot(${k}-${e})^2`; r = a + b * m * m;
      st = [['Die Klammer zuerst', `${a}+${b}\\cdot${m}^2`], ['Potenz vor Punktrechnung', `${a}+${b}\\cdot${m * m}`], ['Punkt vor Strich', `${a}+${b * m * m}`]];
      kand = [D((a + b) * m * m, 'Punkt vor Strich: Die Addition kommt ganz zuletzt.'), D(a + (b * m) ** 2, 'Die Potenz gilt nur für die Klammer – sie wird vor dem Malnehmen berechnet.'), D(a + b * (k * k - e * e), 'Erst die Klammer ausrechnen, dann quadrieren – nicht jede Zahl einzeln quadrieren.'), D(a + b * m * 2, 'Hoch 2 heißt: die Zahl mit sich selbst malnehmen, nicht mal 2.')]; }
    else if (kind === 'klmal') { const e = ri(2, 5), S = a + b * c; formula = `(${a}+${b}\\cdot${c})\\cdot${d}-${e}^2`; r = S * d - e * e; if (r <= 0) continue;
      st = [['In der Klammer gilt Punkt vor Strich', `(${a}+${b * c})\\cdot${d}-${e}^2`], ['Die Klammer ausrechnen', `${S}\\cdot${d}-${e}^2`], ['Potenz und Produkt vor dem Minus', `${S * d}-${e * e}`]];
      kand = [D((a + b) * c * d - e * e, 'Auch in der Klammer gilt Punkt vor Strich.'), D(S * d - 2 * e, 'Hoch 2 heißt: die Zahl mit sich selbst malnehmen, nicht mal 2.'), D((S * d - e) ** 2, 'Die Potenz gilt nur für die Zahl direkt darunter, nicht für alles davor.'), D(a + b * c * d - e * e, 'Die Klammer gehört als Ganzes zum Faktor dahinter.')]; }
    else if (kind === 'tief') { const m = ri(2, 5), e = ri(1, 6), k = e + m, f = pick([2, 3, 4, 5, 6]), I = b + c * m * m; if (I % f !== 0) continue; const Q = I / f, A = Math.max(Q + b, Math.ceil(((b + c) * m * m) / f)) + ri(3, 20);
      formula = `${A}-(${b}+${c}\\cdot(${k}-${e})^2):${f}`; r = A - Q;
      st = [['Die innerste Klammer zuerst', `${A}-(${b}+${c}\\cdot${m}^2):${f}`], ['Potenz vor Punktrechnung', `${A}-(${b}+${c}\\cdot${m * m}):${f}`], ['Punkt vor Strich in der Klammer', `${A}-(${b}+${c * m * m}):${f}`], ['Die Klammer ausrechnen', `${A}-${I}:${f}`], ['Punkt vor Strich: erst teilen', `${A}-${Q}`]];
      kand = [D(A - b - (c * m * m) / f, 'Geteilt wird die ganze Klammer, nicht nur das Produkt darin.'), D((A - I) / f, 'Punkt vor Strich: Erst wird geteilt, dann abgezogen.'), D(A - ((b + c) * m * m) / f, 'In der Klammer gilt Punkt vor Strich: erst das Produkt, dann die Summe.'), D(A - (b + (c * m) ** 2) / f, 'Die Potenz gilt nur für die innere Klammer, nicht für den Faktor davor.'), D(A - (b + c * m * 2) / f, 'Hoch 2 heißt: die Zahl mit sich selbst malnehmen, nicht mal 2.'), D(A - (b + c * (k * k - e * e)) / f, 'Erst die innere Klammer ausrechnen, dann quadrieren.')]; }
    else { const P = ri(2, 9), x = ri(2, 6), y = ri(2, 6), z = x * y - P, t = pick([2, 3, 4, 5, 6, 8, 9]), gg = ri(2, 5), h = ri(2, 5), u = ri(1, 6), f = gg * h + u, e = ri(2, 7); if (z < 1 || (P * P) % t !== 0) continue;
      formula = `(${x}\\cdot${y}-${z})^2:${t}+${e}\\cdot(${f}-${gg}\\cdot${h})`; r = (P * P) / t + e * u;
      st = [['In beiden Klammern gilt Punkt vor Strich', `(${x * y}-${z})^2:${t}+${e}\\cdot(${f}-${gg * h})`], ['Die Klammern ausrechnen', `${P}^2:${t}+${e}\\cdot${u}`], ['Potenz vor Punktrechnung', `${P * P}:${t}+${e}\\cdot${u}`], ['Punkt vor Strich: erst teilen und malnehmen', `${(P * P) / t}+${e * u}`]];
      kand = [D((P * 2) / t + e * u, 'Hoch 2 heißt: die Zahl mit sich selbst malnehmen, nicht mal 2.'), D(((P * P) / t + e) * u, 'Nicht einfach von links nach rechts: Punkt vor Strich.'), D((P * P) / t + e * f - gg * h, 'Die zweite Klammer gehört als Ganzes zum Faktor davor.'), D((x * (y - z)) ** 2 / t + e * u, 'In der ersten Klammer gilt Punkt vor Strich.'), D((P * P) / t + e * (f - gg) * h, 'In der zweiten Klammer gilt Punkt vor Strich.')]; }
    const opts = b6opts(N(r, true), kand); if (!opts) continue;
    const hints = st.map(([t, z]) => `${t}: ${tex(z)}.`);
    if (hints.length < 2) hints.unshift('Reihenfolge: erst Klammern, dann Potenzen, dann Punktrechnung (mal, geteilt), zuletzt Strichrechnung (plus, minus).');
    return { prompt: 'Berechne.', formula, options: shuffle(opts), hints, explain: `${b6k(formula, ...st.map((x) => x[1]), gX(r))}.`, kind };
  }
}

const PRIM_K = [2, 3, 5, 7, 11, 13], PRIM_G = [17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
const ZUS_K = [[4, 2, 2], [6, 2, 3], [8, 2, 4], [9, 3, 3], [10, 2, 5], [12, 3, 4], [14, 2, 7], [15, 3, 5]];
const ZUS_G = [[21, 3, 7], [27, 3, 9], [33, 3, 11], [39, 3, 13], [49, 7, 7], [51, 3, 17], [57, 3, 19], [63, 7, 9], [77, 7, 11], [87, 3, 29], [91, 7, 13], [93, 3, 31]];
const quer = (n) => String(n).split('').reduce((s, z) => s + +z, 0);
/** Teiler, Vielfache, Primzahlen, Teilbarkeit. */
export function genTeiler(lv = 3) {
  const L = b6L(lv), kind = pick([['prim'], ['prim', 'teilbar'], ['ggt', 'kgv', 'teilbar'], ['ggt', 'kgv'], ['takt', 'fliesen']][L - 1]);
  for (;;) {
    if (kind === 'prim') {
      const gross = L >= 2, p = pick(gross ? PRIM_G : PRIM_K), zs = shuffle(gross ? ZUS_G : ZUS_K).slice(0, 3);
      const opts = [N(p, true), ...zs.map(([z, x, y]) => N(z, false, `${z} ist keine Primzahl: ${tex(`${z}=${x}\\cdot${y}`)}.`))];
      if (!gut(opts)) continue;
      return { prompt: 'Welche Zahl ist eine Primzahl?', options: shuffle(opts), hints: ['Eine Primzahl hat genau zwei Teiler: 1 und sich selbst.', 'Prüfe der Reihe nach, ob die Zahl durch 2, 3, 5 oder 7 teilbar ist.'], explain: gross ? `${p} ist ungerade, hat die Quersumme ${tex(`${String(p).split('').join('+')}=${quer(p)}`)} (nicht durch 3 teilbar), endet nicht auf 0 oder 5 und lässt beim Teilen durch 7 den Rest ${p % 7}. Größere Teiler braucht man nicht zu prüfen, weil ${tex('11\\cdot 11=121')} schon größer ist: ${p} ist eine Primzahl.` : `${p} lässt sich nur durch 1 und durch ${p} teilen.`, kind };
    }
    if (kind === 'teilbar') {
      const zus = L >= 3, t = zus ? pick([6, 12, 15]) : pick([3, 3, 9]), basis = zus ? [1000, 9999] : [100, 999], zahl = () => ri(basis[0], basis[1]);
      const [u, v] = t === 6 ? [2, 3] : t === 12 ? [4, 3] : t === 15 ? [5, 3] : [t, t];   // zusammengesetzt: t = u · v mit teilerfremden u, v
      let r; do { r = zahl(); } while (r % t !== 0);
      const f = [];
      for (let i = 0; f.length < 3 && i < 500; i++) { const z = zahl(); if (z % t === 0 || f.includes(z)) continue;
        if (zus ? (f.length === 0 ? z % u === 0 && z % v !== 0 : f.length === 1 ? z % v === 0 && z % u !== 0 : true) : (t !== 9 || z % 3 === 0 || f.length < 2)) f.push(z); }
      if (f.length < 3) continue;
      const uText = (z) => (u === 2 ? `${gT(z)} ist ungerade, also nicht durch 2 teilbar.` : u === 5 ? `${gT(z)} endet nicht auf 0 oder 5, ist also nicht durch 5 teilbar.` : `Die letzten beiden Ziffern von ${gT(z)} bilden die Zahl ${z % 100} – sie ist nicht durch 4 teilbar.`);
      const warum = (z) => (zus && z % u !== 0 ? uText(z) : `Die Quersumme von ${gT(z)} ist ${quer(z)} – sie ist nicht durch ${zus ? v : t} teilbar.`);
      const opts = [N(r, true), ...f.map((z) => N(z, false, warum(z)))];
      if (!gut(opts)) continue;
      const uRegel = u === 2 ? 'Durch 2: Die letzte Ziffer ist gerade.' : u === 5 ? 'Durch 5: Die letzte Ziffer ist 0 oder 5.' : 'Durch 4: Die Zahl aus den letzten beiden Ziffern ist durch 4 teilbar.';
      return { prompt: `Welche Zahl ist durch ${t} teilbar?`, options: shuffle(opts),
        hints: zus ? [`Eine Zahl ist durch ${t} teilbar, wenn sie durch ${u} <b>und</b> durch ${v} teilbar ist (${tex(`${t}=${u}\\cdot${v}`)}).`, uRegel, 'Durch 3: Die Quersumme (Summe aller Ziffern) ist durch 3 teilbar.'] : [`Eine Zahl ist durch ${t} teilbar, wenn ihre Quersumme durch ${t} teilbar ist.`, 'Die Quersumme ist die Summe aller Ziffern.'],
        explain: zus ? `${gT(r)} ist durch ${u} teilbar (${u === 2 ? 'letzte Ziffer gerade' : u === 5 ? 'endet auf 0 oder 5' : `${tex(`${r % 100}:4=${(r % 100) / 4}`)}`}) und hat die Quersumme ${tex(`${String(r).split('').join('+')}=${quer(r)}`)}, die durch 3 teilbar ist. Also ist ${gT(r)} durch ${tex(`${u}\\cdot${v}=${t}`)} teilbar.` : `Quersumme von ${gT(r)}: ${tex(`${String(r).split('').join('+')}=${quer(r)}`)}, und ${tex(`${quer(r)}:${t}=${quer(r) / t}`)} geht auf.`, kind, t, r };
    }
    if (kind === 'takt') {   // kleinstes gemeinsames Vielfaches von drei Zahlen, eingekleidet
      const g = pick([2, 3, 4, 5, 6]), ms = shuffle([2, 3, 4, 5, 6, 7, 9, 10]).slice(0, 3), x = ms.map((m) => g * m), l = b6kgv(b6kgv(x[0], x[1]), x[2]), l2 = b6kgv(x[0], x[1]), gg = gcd(gcd(x[0], x[1]), x[2]);
      if (l > 900 || l === Math.max(...x) || l === x[0] * x[1] * x[2]) continue;
      const [vorn, was, einh, frage] = pick([['Drei Buslinien fahren um 6 Uhr gleichzeitig am Bahnhof ab. Sie fahren', 'Minuten', 'min', 'Nach wie vielen Minuten fahren zum ersten Mal wieder alle drei gleichzeitig ab?'], ['Drei Leuchtfeuer blinken gerade gleichzeitig auf. Sie blinken', 'Sekunden', 's', 'Nach wie vielen Sekunden blinken zum ersten Mal wieder alle drei gleichzeitig?'], ['Drei Zahnräder stehen gerade alle in der Startstellung. Für eine volle Umdrehung brauchen sie', 'Sekunden', 's', 'Nach wie vielen Sekunden stehen zum ersten Mal wieder alle drei gleichzeitig in der Startstellung?']]);
      const Z = (num, c, w) => N(num, c, w, `${gX(num)}\\,\\text{${einh}}`);
      const opts = b6opts(Z(l, true), [l2 !== l ? Z(l2, false, `Das passt für die ersten beiden, aber nicht für das dritte: ${l2} ist kein Vielfaches von ${x[2]}.`) : null, Z(x[0] * x[1] * x[2], false, 'Das Produkt ist ein gemeinsames Vielfaches – aber nicht das kleinste.'), Z(gg, false, 'Das ist der größte gemeinsame Teiler. Gesucht ist das kleinste gemeinsame <b>Vielfache</b>.'), Z(x[0] + x[1] + x[2], false, 'Die Summe hilft nicht weiter: Gesucht ist eine Zahl, in der alle drei Zahlen ohne Rest aufgehen.'), Z(2 * l, false, 'Das ist schon das zweite Mal – beim ersten Mal ist erst die Hälfte der Zeit vergangen.')]);
      if (!opts) continue;
      return { prompt: `${vorn} alle ${x[0]}, alle ${x[1]} und alle ${x[2]} ${was}. ${frage}`, options: shuffle(opts),
        hints: ['Gesucht ist das kleinste gemeinsame Vielfache der drei Zahlen.', `Zerlege in Primfaktoren: ${x.map((v) => tex(`${v}=${b6pf(v)}`)).join(', ')}.`, `Nimm jeden Primfaktor mit der größten Hochzahl, die vorkommt: ${tex(`${b6pf(l)}=${l}`)}.`],
        explain: `Primfaktoren: ${x.map((v) => tex(`${v}=${b6pf(v)}`)).join(', ')}. Jeder Primfaktor mit der größten vorkommenden Hochzahl: ${tex(`${b6pf(l)}=${l}`)}. Probe: ${x.map((v) => tex(`${l}:${v}=${l / v}`)).join(', ')}.`, kind, x, l };
    }
    if (kind === 'fliesen') {   // größter gemeinsamer Teiler als Zwischenschritt
      const g = pick([15, 20, 25, 30, 40, 45, 60]), m = ri(5, 16), n = ri(3, 12); if (m <= n || gcd(m, n) !== 1) continue;
      const A = g * m, B = g * n;
      const opts = b6opts(N(m * n, true), [N(g, false, 'Das ist die Seitenlänge einer Platte in cm – gefragt ist die Anzahl der Platten.'), N(m + n, false, 'Die Platten liegen in Reihen: Anzahl in der Länge <b>mal</b> Anzahl in der Breite.'), N((A * B) / g, false, `Geteilt wird durch die Fläche einer Platte (${tex(`${g}\\cdot${g}`)}), nicht durch ihre Seitenlänge.`), N(4 * m * n, false, 'Das wären Platten mit halber Seitenlänge – es geht noch größer.'), N(2 * (m + n), false, 'Das sind höchstens die Platten am Rand.')]);
      if (!opts) continue;
      return { prompt: `Ein Flur ist ${fmt(A / 100)} m lang und ${fmt(B / 100)} m breit. Er soll mit möglichst großen quadratischen Platten ausgelegt werden, ohne dass eine Platte geschnitten wird (Seitenlänge in ganzen Zentimetern). Wie viele Platten werden gebraucht?`, options: shuffle(opts),
        hints: [`Rechne in Zentimeter um: ${A} cm und ${B} cm.`, 'Die Seitenlänge der Platte muss beide Längen ohne Rest teilen – am größten ist also der größte gemeinsame Teiler.', `Primfaktoren: ${tex(`${A}=${b6pf(A)}`)} und ${tex(`${B}=${b6pf(B)}`)}. Gemeinsam ist ${tex(`${b6pf(g)}=${g}`)}.`, `In die Länge passen ${tex(`${A}:${g}=${m}`)} Platten, in die Breite ${tex(`${B}:${g}=${n}`)}.`],
        explain: `Größter gemeinsamer Teiler von ${A} und ${B}: ${tex(`${b6pf(g)}=${g}`)}, die Platten sind also ${g} cm lang. ${tex(`${A}:${g}=${m}`)} und ${tex(`${B}:${g}=${n}`)}, zusammen ${tex(`${m}\\cdot${n}=${m * n}`)} Platten.`, kind, A, B, g };
    }
    const gr = L >= 4, g = pick(gr ? [12, 18, 24, 30, 36, 42, 45] : [3, 4, 5, 6]), m = ri(2, gr ? 7 : 5), n = ri(2, gr ? 7 : 5);
    if (m === n || gcd(m, n) !== 1) continue;
    const a = g * m, b = g * n, l = g * m * n;
    const opts = b6opts(N(kind === 'ggt' ? g : l, true), kind === 'ggt'
      ? [N(l, false, 'Das ist das kleinste gemeinsame Vielfache. Gesucht ist der größte gemeinsame <b>Teiler</b>.'), N(Math.min(a, b), false, `${Math.min(a, b)} teilt ${Math.max(a, b)} nicht ohne Rest.`), N(g > 3 && g % 2 === 0 ? g / 2 : g % 3 === 0 && g > 3 ? g / 3 : 1, false, 'Das ist ein gemeinsamer Teiler – aber nicht der größte.'), N(1, false, 'Die 1 teilt jede Zahl – es gibt aber einen größeren gemeinsamen Teiler.')]
      : [N(a * b, false, 'Das Produkt ist ein gemeinsames Vielfaches – aber nicht das kleinste.'), N(g, false, 'Das ist der größte gemeinsame Teiler. Gesucht ist das kleinste gemeinsame <b>Vielfache</b>.'), N(Math.max(a, b), false, `${Math.max(a, b)} ist kein Vielfaches von ${Math.min(a, b)}.`), N(2 * l, false, 'Das ist ein gemeinsames Vielfaches – aber es gibt ein kleineres.')]);
    if (!opts) continue;
    const pfa = `${tex(`${a}=${b6pf(a)}`)} und ${tex(`${b}=${b6pf(b)}`)}`;
    return { prompt: kind === 'ggt' ? `Bestimme den größten gemeinsamen Teiler von ${a} und ${b}.` : `Bestimme das kleinste gemeinsame Vielfache von ${a} und ${b}.`, options: shuffle(opts),
      hints: gr ? [`Zerlege beide Zahlen in Primfaktoren: ${pfa}.`, kind === 'ggt' ? 'Der größte gemeinsame Teiler enthält genau die Primfaktoren, die in beiden Zerlegungen vorkommen – jeweils mit der kleineren Hochzahl.' : 'Das kleinste gemeinsame Vielfache enthält jeden Primfaktor mit der größten Hochzahl, die vorkommt.', `${tex(`${b6pf(kind === 'ggt' ? g : l)}=${kind === 'ggt' ? g : l}`)}.`]
        : kind === 'ggt' ? ['Schreibe die Teiler beider Zahlen auf und suche den größten, der in beiden Listen steht.', `${a} = ${g} · ${m} und ${b} = ${g} · ${n}.`] : ['Schreibe die Vielfachen der größeren Zahl auf, bis eines auch ein Vielfaches der kleineren ist.', `Vielfache von ${Math.max(a, b)}: ${[1, 2, 3].map((i) => Math.max(a, b) * i).join(', ')} …`],
      explain: gr ? `Primfaktoren: ${pfa}. ${kind === 'ggt' ? 'Gemeinsame Faktoren mit der kleineren Hochzahl' : 'Jeder Faktor mit der größten Hochzahl'}: ${tex(`${b6pf(kind === 'ggt' ? g : l)}=${kind === 'ggt' ? g : l}`)}.${kind === 'ggt' ? ` Probe: ${tex(`${a}:${g}=${m}`)} und ${tex(`${b}:${g}=${n}`)} haben keinen gemeinsamen Teiler mehr.` : ` Probe: ${tex(`${l}:${a}=${n}`)} und ${tex(`${l}:${b}=${m}`)}.`}`
        : kind === 'ggt' ? `${tex(`${a}=${g}\\cdot${m}`)} und ${tex(`${b}=${g}\\cdot${n}`)}: Der größte gemeinsame Teiler ist ${g}.` : `${tex(`${l}=${a}\\cdot${n}=${b}\\cdot${m}`)} – kleiner geht es nicht.`, kind, a, b, g, l };
  }
}

// [große Einheit, kleine Einheit, Umrechnungszahl, typisch falsche Umrechnungszahl, Stufe ab, Formel-Schreibweise groß, klein]
const EINHEITEN = [
  ['m', 'cm', 100, 10, 1], ['cm', 'mm', 10, 100, 1], ['km', 'm', 1000, 100, 1], ['kg', 'g', 1000, 100, 1], ['h', 'min', 60, 100, 2], ['min', 's', 60, 100, 2],
  ['t', 'kg', 1000, 100, 2], ['l', 'ml', 1000, 100, 2], ['dm', 'cm', 10, 100, 2], ['m²', 'dm²', 100, 10, 4], ['cm²', 'mm²', 100, 10, 4], ['m²', 'cm²', 10000, 100, 5], ['dm³', 'cm³', 1000, 100, 5],
];
const eX = (u) => `\\,\\text{${u.replace(/[²³]/, '')}}${u.endsWith('²') ? '^2' : u.endsWith('³') ? '^3' : ''}`;
/** Größen umrechnen: Länge, Masse, Zeit, ab Stufe 4 auch Flächen und Rauminhalte. */
export function genEinheit(lv = 3) {
  for (;;) {
    const [gr, kl2, f, ff, ab] = pick(EINHEITEN.filter((e) => e[4] <= lv && (lv < 4 || e[4] >= 2)));
    const zeit = f === 60, runter = lv <= 2 || rand() < 0.5;   // runter: von der großen in die kleine Einheit
    const v = runter ? (zeit ? pick(tier(lv, [2, 3, 4], [2, 3, 5, 1.5], [1.5, 2.5, 0.5, 4], [0.25, 1.5, 2.5, 0.75], [0.25, 1.25, 2.75, 0.1])) : pick(tier(lv, [2, 3, 5, 7], [1.5, 2.5, 4, 12], [0.5, 1.2, 3.5, 0.8], [0.4, 1.25, 2.5, 0.06], [0.35, 1.05, 0.075, 2.4])))
      : (zeit ? pick([90, 120, 150, 180, 210, 45, 30]) : f * pick([0.5, 1.5, 2.5, 3.5, 0.25, 4.2, 0.75]));
    const r = runter ? v * f : v / f, von = runter ? gr : kl2, nach = runter ? kl2 : gr;
    const E = (num, correct, why) => ({ tex: `${ft(num, 6)}${eX(nach)}`, num: +num.toFixed(8), correct, why });
    const opts = [E(r, true),
      E(runter ? v / f : v * f, false, runter ? `${nach} ist die kleinere Einheit – davon braucht man mehr, also wird multipliziert.` : `${nach} ist die größere Einheit – davon braucht man weniger, also wird geteilt.`),
      E(runter ? v * ff : v / ff, false, `Die Umrechnungszahl von ${gr} zu ${kl2} ist ${gT(f)}, nicht ${ff}.`),
      E(runter ? v * f * 10 : v / f / 10, false, 'Das Komma ist um eine Stelle zu weit verschoben.')];
    if (!gut(opts)) continue;
    return { prompt: `Rechne um: ${tex(`${ft(v, 6)}${eX(von)}`)} in ${nach}.`, options: shuffle(opts),
      hints: [`${tex(`1${eX(gr)}=${gX(f)}${eX(kl2)}`)}.`, runter ? 'In die kleinere Einheit: mit der Umrechnungszahl malnehmen.' : 'In die größere Einheit: durch die Umrechnungszahl teilen.'],
      explain: `${tex(`${ft(v, 6)}${runter ? '\\cdot' : ':'}${gX(f)}=${ft(r, 6)}`)}, also ${tex(`${ft(r, 6)}${eX(nach)}`)}.`, v, f, r: +r.toFixed(8), runter, ab };
  }
}

/** Rechteck und zusammengesetzte Figuren: Umfang und Flächeninhalt. */
export function genRechteck(lv = 3) {
  const L5 = b6L(lv), kind = pick([['flaeche', 'quadrat'], ['umfang', 'seite'], ['lform', 'ausumfang'], ['weg', 'platten'], ['kosten', 'gleichung']][L5 - 1]);
  for (;;) {
    let a = ri(3, L5 >= 3 ? 14 : 9), b = ri(2, L5 >= 3 ? 12 : 8); const u = pick(['cm', 'm']);
    if (a === b && kind !== 'quadrat') continue;
    const L = (num, c, w) => N(num, c, w, `${ft(num)}\\,\\text{${u}}`), F = (num, c, w) => N(num, c, w, `${ft(num)}\\,\\text{${u}}^2`);
    let prompt, opts, hints, explain;
    if (kind === 'flaeche') { prompt = `Ein Rechteck ist ${a} ${u} lang und ${b} ${u} breit. Wie groß ist sein Flächeninhalt?`;
      opts = [F(a * b, true), F(2 * (a + b), false, 'Das ist der Umfang (einmal außen herum), nicht der Flächeninhalt.'), F(a + b, false, 'Länge und Breite werden malgenommen, nicht addiert.'), F(2 * a * b, false, 'Das ist doppelt so viel: Länge mal Breite genügt.')];
      hints = ['Flächeninhalt eines Rechtecks: Länge mal Breite.', `${tex(`A=${a}\\cdot${b}`)}.`]; explain = `${tex(`A=${a}\\cdot${b}=${a * b}\\,\\text{${u}}^2`)}.`; }
    else if (kind === 'umfang') { prompt = `Ein Rechteck ist ${a} ${u} lang und ${b} ${u} breit. Wie groß ist sein Umfang?`;
      opts = [L(2 * (a + b), true), L(a * b, false, 'Das ist die Maßzahl des Flächeninhalts. Der Umfang ist der Weg einmal außen herum.'), L(a + b, false, 'Das sind nur zwei der vier Seiten.'), L(2 * a + b, false, 'Auch die Breite kommt zweimal vor.')];
      hints = ['Der Umfang ist der Weg einmal außen herum: zwei Längen und zwei Breiten.', `${tex(`U=2\\cdot(${a}+${b})`)}.`]; explain = `${tex(`U=2\\cdot(${a}+${b})=${2 * (a + b)}\\,\\text{${u}}`)}.`; }
    else if (kind === 'quadrat') { prompt = `Ein Quadrat hat die Seitenlänge ${a} ${u}. Wie groß ist sein Flächeninhalt?`;
      opts = [F(a * a, true), F(4 * a, false, 'Das ist die Maßzahl des Umfangs (vier Seiten).'), F(2 * a, false, 'Hoch 2 heißt: Seite mal Seite, nicht mal 2.'), F(a * a * 2, false, 'Seite mal Seite genügt.')];
      hints = ['Beim Quadrat sind Länge und Breite gleich.', `${tex(`A=${a}\\cdot${a}`)}.`]; explain = `${tex(`A=${a}^2=${a * a}\\,\\text{${u}}^2`)}.`; }
    else if (kind === 'seite') { const A = a * b; prompt = `Ein Rechteck hat den Flächeninhalt ${A} ${u}² und ist ${a} ${u} lang. Wie breit ist es?`;
      opts = [L(b, true), L(A - a, false, 'Die Fläche ist Länge <b>mal</b> Breite – also wird geteilt, nicht abgezogen.'), L(A * a, false, 'Gesucht ist die Breite: Fläche durch Länge.'), L(2 * b, false, 'Das ist doppelt so breit: Fläche durch Länge genügt.')];
      hints = ['Aus „Länge mal Breite = Fläche“ wird: Breite = Fläche durch Länge.', `${tex(`${A}:${a}`)}.`]; explain = `Aus ${tex(`${a}\\cdot b=${A}`)} folgt ${tex(`b=${A}:${a}=${b}\\,\\text{${u}}`)}.`; }
    else if (kind === 'lform') { if (b < 3) continue; const c = ri(1, a - 2), d = ri(1, b - 1); prompt = `Aus einem Rechteck (${a} ${u} mal ${b} ${u}) wird an einer Ecke ein kleines Rechteck (${c} ${u} mal ${d} ${u}) herausgeschnitten. Wie groß ist die restliche Fläche?`;
      opts = [F(a * b - c * d, true), F(a * b, false, 'Die herausgeschnittene Ecke muss noch abgezogen werden.'), F(a * b + c * d, false, 'Die Ecke fehlt – ihre Fläche wird abgezogen, nicht addiert.'), F((a - c) * (b - d), false, 'So würde ein ganzer Streifen fehlen. Es fehlt nur die kleine Ecke.')];
      hints = ['Großes Rechteck minus kleines Rechteck.', `Groß: ${tex(`${a}\\cdot${b}=${a * b}`)}, klein: ${tex(`${c}\\cdot${d}=${c * d}`)}.`]; explain = `${tex(`A=${a}\\cdot${b}-${c}\\cdot${d}`)} ${tex(`=${a * b}-${c * d}=${a * b - c * d}\\,\\text{${u}}^2`)}.`; }
    else if (kind === 'ausumfang') { const U = 2 * (a + b); prompt = `Ein Rechteck hat den Umfang ${U} ${u} und ist ${a} ${u} lang. Wie groß ist sein Flächeninhalt?`;
      opts = [F(a * b, true), F(b, false, 'Das ist die Breite – gefragt ist der Flächeninhalt.'), F((U - a) * a, false, 'Vom Umfang müssen <b>zwei</b> Längen abgezogen werden, und der Rest ist das Doppelte der Breite.'), F((U / 2) * a, false, 'Der halbe Umfang ist Länge plus Breite – die Länge muss noch abgezogen werden.')];
      hints = ['Der halbe Umfang ist Länge plus Breite.', `Breite: ${tex(`${U}:2-${a}=${b}`)}.`, `Fläche: Länge mal Breite, also ${tex(`${a}\\cdot${b}`)}.`]; explain = `Halber Umfang: ${tex(`${U}:2=${U / 2}`)}. Breite: ${tex(`${U / 2}-${a}=${b}`)}. Fläche: ${tex(`${a}\\cdot${b}=${a * b}\\,\\text{${u}}^2`)}.`; }
    else if (kind === 'weg') { a = ri(8, 24); b = ri(5, 16); const w = pick([0.5, 1, 1.5, 2, 2.5]), ga = a + 2 * w, gb = b + 2 * w, r = ga * gb - a * b; if (a <= b) continue;
      const Q = (num, c, x) => N(+num.toFixed(4), c, x, `${ft(num)}\\,\\text{m}^2`);
      prompt = `Ein rechteckiger Rasen ist ${a} m lang und ${b} m breit. Rundherum wird ein ${fmt(w)} m breiter Weg angelegt. Wie groß ist die Fläche des Wegs?`;
      opts = b6opts(Q(r, true), [Q((a + w) * (b + w) - a * b, false, 'Der Weg liegt auf <b>beiden</b> Seiten: Länge und Breite wachsen jeweils um die doppelte Wegbreite.'), Q(2 * (a + b) * w, false, 'So fehlen die vier Ecken des Wegs.'), Q(ga * gb, false, 'Das ist die Fläche von Rasen und Weg zusammen – der Rasen muss noch abgezogen werden.'), Q(a * b, false, 'Das ist die Fläche des Rasens.')]);
      hints = [`Mit Weg ist die Fläche auf jeder Seite ${fmt(w)} m größer: Länge ${tex(`${a}+2\\cdot${ft(w)}=${ft(ga)}`)} m, Breite ${tex(`${b}+2\\cdot${ft(w)}=${ft(gb)}`)} m.`, `Rasen und Weg zusammen: ${tex(`${ft(ga)}\\cdot${ft(gb)}=${ft(ga * gb)}`)} m².`, `Rasen allein: ${tex(`${a}\\cdot${b}=${a * b}`)} m².`, 'Der Weg ist der Unterschied der beiden Flächen.'];
      explain = `Außenmaße: ${tex(`${a}+2\\cdot${ft(w)}=${ft(ga)}`)} m und ${tex(`${b}+2\\cdot${ft(w)}=${ft(gb)}`)} m. Weg: ${tex(`${ft(ga)}\\cdot${ft(gb)}-${a}\\cdot${b}`)} ${tex(`=${ft(ga * gb)}-${a * b}=${ft(r)}\\,\\text{m}^2`)}.`; }
    else if (kind === 'platten') { const f = pick([20, 25, 30, 40, 50]), nx = ri(9, 20), ny = ri(6, 15), la = nx * f, lb = ny * f; if (nx <= ny) continue; a = la / 100; b = lb / 100;
      prompt = `Ein Zimmer ist ${fmt(a)} m lang und ${fmt(b)} m breit. Der Boden wird mit quadratischen Fliesen (Seitenlänge ${f} cm) ausgelegt. Wie viele Fliesen werden gebraucht?`;
      opts = b6opts(N(nx * ny, true), [N(+((a * b) / (f / 100)).toFixed(2), false, 'Geteilt wird durch die <b>Fläche</b> einer Fliese, nicht durch ihre Seitenlänge.'), N(2 * (nx + ny), false, 'Das wären nur Fliesen am Rand entlang – der ganze Boden wird belegt.'), N(nx + ny, false, 'Die Fliesen liegen in Reihen: Anzahl in der Länge <b>mal</b> Anzahl in der Breite.'), N((la * lb) / f, false, 'Geteilt wird durch die Fläche einer Fliese, nicht durch ihre Seitenlänge.')]);
      hints = [`Rechne alles in Zentimeter um: ${la} cm und ${lb} cm.`, `In die Länge passen ${tex(`${la}:${f}=${nx}`)} Fliesen.`, `In die Breite passen ${tex(`${lb}:${f}=${ny}`)} Fliesen.`, 'Anzahl der Reihen mal Fliesen je Reihe.'];
      explain = `${tex(`${ft(a)}\\,\\text{m}=${la}\\,\\text{cm}`)} und ${tex(`${ft(b)}\\,\\text{m}=${lb}\\,\\text{cm}`)}. ${tex(`${la}:${f}=${nx}`)}, ${tex(`${lb}:${f}=${ny}`)}, zusammen ${tex(`${nx}\\cdot${ny}=${nx * ny}`)} Fliesen.`; }
    else if (kind === 'kosten') { const a10 = ri(42, 85), b10 = ri(30, 60), c10 = ri(10, 25), d10 = ri(10, 20), pb = pick([24, 28, 32, 35, 45]), pl = pick([3, 4, 5, 6]); if (a10 <= b10 || c10 > a10 - 15 || d10 > b10 - 12) continue;
      a = a10 / 10; b = b10 / 10; const c = c10 / 10, d = d10 / 10, Fl = (a10 * b10 - c10 * d10) / 100, U = (2 * (a10 + b10)) / 10, kb = Fl * pb, kl2 = U * pl, r = kb + kl2;
      prompt = `Ein Zimmer hat die Form eines Rechtecks (${fmt(a)} m mal ${fmt(b)} m), aus dem an einer Ecke ein Rechteck (${fmt(c)} m mal ${fmt(d)} m) ausgespart ist. Der Boden bekommt Parkett für ${pb} € pro m², an allen Wänden entlang kommt eine Fußleiste für ${pl} € pro Meter. Wie viel kostet das zusammen?`;
      opts = b6opts(b6G(r, true), [b6G(a * b * pb + kl2, false, 'Die ausgesparte Ecke gehört nicht zum Boden – ihre Fläche muss abgezogen werden.'), b6G(kb + (U - c - d) * pl, false, 'Die Ecke macht den Umfang nicht kürzer: Die beiden Wandstücke der Ecke sind genauso lang wie die Stücke, die außen fehlen.'), b6G(kb, false, 'Das ist nur das Parkett – die Fußleisten fehlen noch.'), b6G((Fl + U) * pb, false, 'Fläche und Umfang haben verschiedene Preise und dürfen nicht einfach addiert werden.')]);
      hints = [`Bodenfläche: großes Rechteck minus Ecke, ${tex(`${ft(a)}\\cdot${ft(b)}-${ft(c)}\\cdot${ft(d)}`)} ${tex(`=${ft(a * b)}-${ft(c * d)}=${ft(Fl)}`)} m².`, `Umfang: Die ausgesparte Ecke ändert ihn nicht – ${tex(`2\\cdot(${ft(a)}+${ft(b)})=${ft(U)}`)} m.`, `Parkett: ${tex(`${ft(Fl)}\\cdot${pb}=${b6ex(kb)}`)} €.`, `Fußleisten: ${tex(`${ft(U)}\\cdot${pl}=${b6ex(kl2)}`)} €.`, 'Beide Beträge addieren.'];
      explain = `Fläche: ${tex(`${ft(a)}\\cdot${ft(b)}-${ft(c)}\\cdot${ft(d)}=${ft(Fl)}\\,\\text{m}^2`)}. Umfang: ${tex(`2\\cdot(${ft(a)}+${ft(b)})=${ft(U)}\\,\\text{m}`)}. Kosten: ${tex(`${ft(Fl)}\\cdot${pb}+${ft(U)}\\cdot${pl}`)} ${tex(`=${b6ex(kb)}+${b6ex(kl2)}=${b6ex(r)}`)} €.`; }
    else { const k = pick([2, 3]), dd = ri(1, 9), x = ri(4, 15), l = k * x + dd, U = 2 * (x + l), r = x * l; a = l; b = x;
      const Q = (num, c, w) => b6M(num, c, w, 'cm²');
      prompt = `Die Länge eines Rechtecks ist um ${dd} cm größer als das ${k === 2 ? 'Doppelte' : 'Dreifache'} seiner Breite. Sein Umfang beträgt ${U} cm. Wie groß ist sein Flächeninhalt?`;
      opts = b6opts(Q(r, true), [Q(x * k * x, false, `Bei der Länge fehlen noch die ${dd} cm.`), Q((U / (2 * k + 2)) * (k * (U / (2 * k + 2)) + dd), false, `In der Umfangsgleichung zählen auch die ${dd} cm doppelt: ${tex(`2\\cdot${dd}`)} muss vor dem Teilen abgezogen werden.`), Q(l, false, 'Das ist die Maßzahl der Länge – gefragt ist der Flächeninhalt.'), Q((U / 2) * x, false, 'Der halbe Umfang ist Länge plus Breite – nicht die Länge allein.'), Q(x * x, false, 'Länge und Breite sind hier verschieden.')]);
      hints = [`Nenne die Breite ${tex('x')}. Dann ist die Länge ${tex(`${k}x+${dd}`)}.`, `Umfang: ${tex(`2\\cdot(x+${k}x+${dd})=${U}`)}, also ${tex(`${2 * k + 2}x+${2 * dd}=${U}`)}.`, `${tex(`x=(${U}-${2 * dd}):${2 * k + 2}=${x}`)} – die Breite ist ${x} cm.`, `Länge: ${tex(`${k}\\cdot${x}+${dd}=${l}`)} cm.`, 'Fläche: Länge mal Breite.'];
      explain = `Breite ${tex('x')}, Länge ${tex(`${k}x+${dd}`)}: ${tex(`2\\cdot(x+${k}x+${dd})=${U}`)}, also ${tex(`${2 * k + 2}x=${U - 2 * dd}`)} und ${tex(`x=${x}`)}. Länge: ${tex(`${k}\\cdot${x}+${dd}=${l}`)}. Fläche: ${tex(`${l}\\cdot${x}=${r}\\,\\text{cm}^2`)}.`; }
    if (!opts || !gut(opts) || opts.some((o) => o.num <= 0)) continue;
    return { prompt, options: shuffle(opts), hints, explain, kind, a, b };
  }
}

/* ───────────── Klasse 6: Brüche und Dezimalzahlen ───────────── */

/** Brüche kürzen und erweitern. */
export function genKuerzen(lv = 3) {
  for (;;) {
    const erw = lv >= 3 && rand() < 0.4, b = ri(2, tier(lv, 5, 7, 9, 12, 15)), a = ri(1, b - 1), k = pick(tier(lv, [2, 3], [2, 3, 4, 5], [4, 6, 8], [6, 8, 9, 12], [12, 15, 18]));
    if (gcd(a, b) !== 1) continue;
    const B = (z, n, correct, why) => ({ tex: br(z, n), wert: z / n, zaehler: z, nenner: n, correct, why });
    if (erw) {
      const N2 = b * k, opts = [B(a * k, N2, true), B(a, N2, false, 'Der Zähler muss mit derselben Zahl malgenommen werden wie der Nenner.'), B(a + (N2 - b), N2, false, 'Erweitern heißt malnehmen, nicht addieren.'), B(a * (k + 1), N2, false, `Der Nenner wurde mit ${k} malgenommen – der Zähler auch mit ${k}.`)];
      if (!uniq(opts)) continue;
      return { prompt: `Erweitere auf den Nenner ${N2}.`, formula: br(a, b), options: shuffle(opts), hints: [`Womit muss man ${b} malnehmen, um ${N2} zu bekommen?`, `Mit ${k}. Dann auch den Zähler mit ${k} malnehmen.`], explain: `${tex(`${br(a, b)}=${br(`${a}\\cdot${k}`, `${b}\\cdot${k}`)}=${br(a * k, N2)}`)}.`, erw, a, b, k };
    }
    const t = k % 2 === 0 && k > 2 ? 2 : k % 3 === 0 && k > 3 ? 3 : 0;   // ein Teiler, mit dem man nur teilweise kürzt
    const opts = [B(a, b, true), t ? B((a * k) / t, (b * k) / t, false, `Hier lässt sich noch weiter kürzen (durch ${k / t}).`) : B(a * k - 1, b * k - 1, false, 'Kürzen heißt teilen, nicht abziehen.'), B(a, b * k, false, 'Nur der Zähler wurde geteilt – der Nenner muss durch dieselbe Zahl geteilt werden.'), B(a * k - k, b * k - k, false, 'Kürzen heißt: Zähler und Nenner durch dieselbe Zahl teilen, nicht dieselbe Zahl abziehen.')];
    if (!uniq(opts) || opts.some((o) => o.zaehler <= 0)) continue;
    return { prompt: 'Kürze vollständig.', formula: br(a * k, b * k), options: shuffle(opts), hints: ['Suche eine Zahl, durch die sich Zähler und Nenner beide teilen lassen.', `Beide sind durch ${k} teilbar.`], explain: `${tex(`${br(a * k, b * k)}=${br(`${a * k}:${k}`, `${b * k}:${k}`)}=${br(a, b)}`)}.`, erw, a, b, k };
  }
}

/** Brüche der Größe nach vergleichen. */
export function genBruchVergleich(lv = 3) {
  for (;;) {
    const gross = rand() < 0.5, kind = tier(lv, 'nenner', pick(['nenner', 'zaehler']), 'frei', 'frei', 'nah');
    let fr;
    if (kind === 'nenner') { const n = ri(5, 12); fr = shuffle([...Array(n - 1).keys()].map((i) => i + 1)).slice(0, 4).map((z) => [z, n]); }
    else if (kind === 'zaehler') { const z = ri(1, 4); fr = shuffle([2, 3, 4, 5, 6, 7, 8, 9, 10].filter((n) => n > z)).slice(0, 4).map((n) => [z, n]); }
    else { const pool = kind === 'nah' ? [[1, 2], [3, 5], [4, 7], [5, 9], [5, 8], [7, 12], [2, 3], [5, 7], [7, 10], [3, 4], [7, 9], [4, 5]] : [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5], [4, 5], [1, 6], [5, 6], [3, 8], [5, 8], [7, 8], [3, 10], [7, 10]]; fr = shuffle(pool).slice(0, 4); }
    const w = fr.map(([z, n]) => z / n), ziel = gross ? Math.max(...w) : Math.min(...w);
    if (new Set(w.map((x) => x.toFixed(6))).size !== 4) continue;
    if (kind === 'nah' && Math.max(...w) - Math.min(...w) > 0.3) continue;
    const beste = fr[w.indexOf(ziel)];
    const opts = fr.map(([z, n], i) => ({ tex: br(z, n), num: w[i], correct: w[i] === ziel,
      why: w[i] === ziel ? undefined : kind === 'nenner' ? `Bei gleichem Nenner entscheidet der Zähler: ${z} ist ${gross ? 'kleiner' : 'größer'} als ${beste[0]}.` : kind === 'zaehler' ? `Bei gleichem Zähler gilt: Je größer der Nenner, desto kleiner die Teile. ${tex(br(z, n))} ist ${gross ? 'kleiner' : 'größer'} als ${tex(br(beste[0], beste[1]))}.` : `Gleichnamig gemacht: ${tex(`${br(z, n)}=${br(z * beste[1], n * beste[1])}`)} und ${tex(`${br(beste[0], beste[1])}=${br(beste[0] * n, beste[1] * n)}`)}.` }));
    if (!gut(opts)) continue;
    return { prompt: `Welcher Bruch ist der ${gross ? 'größte' : 'kleinste'}?`, options: shuffle(opts),
      hints: kind === 'nenner' ? ['Alle Brüche haben denselben Nenner – die Teile sind gleich groß.', 'Dann entscheidet, wie viele Teile es sind: der Zähler.'] : kind === 'zaehler' ? ['Alle Brüche haben denselben Zähler – es sind gleich viele Teile.', 'Je größer der Nenner, desto kleiner ist jedes Teil.'] : ['Bringe die Brüche auf einen gemeinsamen Nenner – oder vergleiche jeden mit einem Halben.', 'Zwei Brüche vergleichst du schnell über Kreuz: Zähler mal fremder Nenner.'],
      explain: `${tex(br(beste[0], beste[1]))} ist der ${gross ? 'größte' : 'kleinste'} Bruch (als Dezimalzahl etwa ${fmt(ziel, 3)}).`, gross, kind };
  }
}

const stellen = (x) => (String(x).split('.')[1] || '').length;
/** Rechnen mit Dezimalzahlen. */
export function genDezimal(lv = 3) {
  for (;;) {
    const kind = pick(tier(lv, ['plus'], ['plus', 'minus'], ['zehner', 'malganz', 'minus'], ['mal', 'malganz', 'zehner'], ['mal', 'durch']));
    let formula, opts, hints, explain;
    const D = (num, c, w) => N(+num.toFixed(6), c, w, ft(num, 6));
    if (kind === 'plus' || kind === 'minus') {
      const a = lv <= 1 ? ri(11, 89) / 10 : ri(11, 99) / 10, b = lv <= 1 ? ri(11, 89) / 10 : ri(11, 95) / 100, s = kind === 'plus' ? 1 : -1;
      if (a <= b) continue;
      const ia = Math.round(a * 10 ** stellen(a)), ib = Math.round(b * 10 ** stellen(b)), blind = (ia + s * ib) / 10 ** Math.max(stellen(a), stellen(b));
      formula = `${ft(a)}${s > 0 ? '+' : '-'}${ft(b)}`;
      opts = [D(a + s * b, true), stellen(a) !== stellen(b) ? D(blind, false, 'Die Zahlen müssen Komma unter Komma stehen – Zehntel zu Zehnteln, Hundertstel zu Hundertsteln.') : D(a + s * b + s * 1, false, 'Beim Übertrag ist eine Eins zu viel dazugekommen.'), D(a - s * b, false, s > 0 ? 'Hier wurde abgezogen statt addiert.' : 'Hier wurde addiert statt abgezogen.'), D((a + s * b) * 10, false, 'Das Komma steht eine Stelle zu weit rechts.')];
      hints = ['Schreibe die Zahlen untereinander: Komma unter Komma.', stellen(a) !== stellen(b) ? `Ergänze eine Null: ${tex(`${ft(a)}=${ft(a)}0`)}.` : 'Rechne von rechts nach links und denke an den Übertrag.'];
      explain = `${tex(`${formula}=${ft(a + s * b, 4)}`)}.`;
    } else if (kind === 'zehner') {
      const a = ri(101, 9999) / pick([100, 1000]), f = pick([10, 100, 1000]), mal = rand() < 0.5, r = mal ? a * f : a / f;
      formula = `${ft(a, 4)}${mal ? '\\cdot' : ':'}${f}`;
      opts = [D(r, true), D(mal ? a / f : a * f, false, mal ? 'Beim Malnehmen wird die Zahl größer: Das Komma wandert nach rechts.' : 'Beim Teilen wird die Zahl kleiner: Das Komma wandert nach links.'), D(mal ? r / 10 : r * 10, false, `${f} hat ${String(f).length - 1} ${f === 10 ? 'Null' : 'Nullen'} – so viele Stellen wandert das Komma.`), D(mal ? r * 10 : r / 10, false, `${f} hat ${String(f).length - 1} ${f === 10 ? 'Null' : 'Nullen'} – so viele Stellen wandert das Komma.`)];
      hints = [`Mal ${f}: Komma nach rechts. Geteilt durch ${f}: Komma nach links.`, `${f} hat ${String(f).length - 1} ${f === 10 ? 'Null' : 'Nullen'}, also ${String(f).length - 1} ${f === 10 ? 'Stelle' : 'Stellen'}.`];
      explain = `${tex(`${formula}=${ft(r, 6)}`)}.`;
    } else if (kind === 'malganz') {
      const a = ri(11, 99) / 10, n = ri(3, 9); formula = `${ft(a)}\\cdot${n}`;
      opts = [D(a * n, true), D(a * n * 10, false, 'Das Komma fehlt: Das Ergebnis hat eine Nachkommastelle wie der erste Faktor.'), D((a * n) / 10, false, 'Das Komma steht eine Stelle zu weit links.'), D(a + n, false, 'Hier wurde addiert statt malgenommen.')];
      hints = ['Rechne erst ohne Komma.', `${tex(`${Math.round(a * 10)}\\cdot${n}=${Math.round(a * 10) * n}`)} – dann das Komma wieder eine Stelle von rechts setzen.`];
      explain = `${tex(`${formula}=${ft(a * n)}`)}.`;
    } else if (kind === 'mal') {
      const a = ri(2, lv >= 5 ? 25 : 9) / 10, b = ri(2, 9) / pick(lv >= 5 ? [10, 100] : [10]), r = a * b; formula = `${ft(a)}\\cdot${ft(b)}`;
      opts = [D(r, true), D(r * 10, false, 'Die Nachkommastellen beider Faktoren werden zusammengezählt.'), D(r / 10, false, 'Das Komma steht eine Stelle zu weit links.'), D(a + b, false, 'Hier wurde addiert statt malgenommen.')];
      hints = ['Rechne erst ohne Komma.', `Das Ergebnis hat so viele Nachkommastellen wie beide Faktoren zusammen: ${stellen(a) + stellen(b)}.`];
      explain = `${tex(`${formula}=${ft(r, 4)}`)}.`;
    } else {
      const q = pick([2, 3, 4, 5, 6, 8, 12, 0.5, 1.5, 0.4]), b = ri(2, 9) / 10, a = +(q * b).toFixed(4); formula = `${ft(a, 4)}:${ft(b)}`;
      opts = [D(q, true), D(q / 10, false, 'Beide Zahlen werden mit 10 malgenommen – das Ergebnis ändert sich dadurch nicht.'), D(q * 10, false, 'Das Komma steht eine Stelle zu weit rechts.'), D(a - b, false, 'Hier wurde abgezogen statt geteilt.')];
      hints = ['Verschiebe in beiden Zahlen das Komma so, dass die zweite Zahl ganz wird.', `${tex(`${ft(a, 4)}:${ft(b)}=${ft(a * 10, 4)}:${ft(b * 10)}`)}.`];
      explain = `${tex(`${ft(a * 10, 4)}:${ft(b * 10)}=${ft(q)}`)}.`;
    }
    if (!gut(opts) || opts.some((o) => o.num < 0)) continue;
    return { prompt: 'Berechne.', formula, options: shuffle(opts), hints, explain, kind };
  }
}

const BRUECHE = [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 10], [3, 10], [7, 10], [9, 10], [1, 8], [3, 8], [5, 8], [7, 8], [1, 20], [3, 20], [7, 20], [1, 25], [3, 25]];
/** Bruch, Dezimalzahl und Prozent ineinander umwandeln. */
export function genBruchDezimal(lv = 3) {
  for (;;) {
    const [z, n] = pick(BRUECHE.slice(0, tier(lv, 4, 7, 11, 15, 20))), w = z / n;
    const kind = pick(tier(lv, ['bd'], ['bd', 'bp'], ['bd', 'bp', 'db'], ['bp', 'db', 'pb'], ['db', 'pb', 'bp']));
    const D = (num, c, why) => N(+num.toFixed(6), c, why, ft(num, 3)), P = (num, c, why) => N(+num.toFixed(6), c, why, `${ft(num, 4)}\\,\\%`);
    const B = (zz, nn, c, why) => { const g = gcd(zz, nn) || 1; return { tex: br(zz / g, nn / g), num: zz / nn, correct: c, why }; };
    let prompt, formula, opts, hints, explain;
    if (kind === 'bd') { prompt = 'Schreibe als Dezimalzahl.'; formula = br(z, n);
      opts = [D(w, true), D(+`0.${z}${n}`, false, 'Zähler und Nenner werden nicht einfach hinter das Komma geschrieben – der Bruchstrich bedeutet „geteilt“.'), D(n / z, false, 'Es wird der Zähler durch den Nenner geteilt, nicht umgekehrt.'), D(w / 10, false, 'Das Komma steht eine Stelle zu weit links.')];
      hints = ['Der Bruchstrich bedeutet „geteilt durch“.', `Erweitere auf Zehntel, Hundertstel oder Tausendstel – oder rechne ${tex(`${z}:${n}`)}.`]; explain = `${tex(`${br(z, n)}=${z}:${n}=${ft(w, 4)}`)}.`; }
    else if (kind === 'bp') { prompt = 'Schreibe als Prozentsatz.'; formula = br(z, n);
      opts = [P(w * 100, true), P(+`${z}${n}`, false, 'Zähler und Nenner werden nicht einfach nebeneinandergeschrieben.'), P(w, false, 'Das ist die Dezimalzahl. Für Prozent wird sie mit 100 malgenommen.'), P(w * 10, false, 'Prozent heißt „von hundert“ – mit 100 malnehmen, nicht mit 10.')];
      hints = ['Prozent heißt „Hundertstel“.', `Erweitere den Bruch auf den Nenner 100 – oder rechne ${tex(`${z}:${n}`)} und nimm mit 100 mal.`]; explain = `${tex(`${br(z, n)}=${ft(w, 4)}=${ft(w * 100, 2)}\\,\\%`)}.`; }
    else if (kind === 'db') { prompt = 'Schreibe als vollständig gekürzten Bruch.'; formula = ft(w, 4);
      opts = [B(z, n, true), B(n, z, false, 'Zähler und Nenner sind vertauscht.'), B(Math.round(w * 1000), 100, false, 'Zähle die Nachkommastellen: So viele Nullen hat der Nenner.'), B(z + 1, n, false, 'Schreibe die Zahl erst als Bruch mit dem Nenner 10, 100 oder 1000 und kürze dann.')];
      hints = ['Eine Nachkommastelle sind Zehntel, zwei sind Hundertstel, drei sind Tausendstel.', 'Danach kürzen, bis es nicht mehr geht.']; explain = `${tex(`${ft(w, 4)}=${br(Math.round(w * 1000), 1000)}=${br(z, n)}`)}.`; }
    else { prompt = 'Schreibe als vollständig gekürzten Bruch.'; formula = `${ft(w * 100, 2)}\\,\\%`;
      opts = [B(z, n, true), B(Math.round(w * 1000), 10, false, 'Prozent heißt „von hundert“: Der Nenner ist 100, nicht 10.'), B(n, z, false, 'Zähler und Nenner sind vertauscht.'), B(z, n + 1, false, 'Schreibe den Prozentsatz erst als Bruch mit dem Nenner 100 und kürze dann.')];
      hints = ['Prozent heißt „Hundertstel“.', `${tex(`${ft(w * 100, 2)}\\,\\%=${br(ft(w * 100, 2), 100)}`)} – dann kürzen.`]; explain = `${tex(`${ft(w * 100, 2)}\\,\\%=${br(ft(w * 100, 2), 100)}=${br(z, n)}`)}.`; }
    if (!gut(opts)) continue;
    return { prompt, formula, options: shuffle(opts), hints, explain, kind, z, n };
  }
}

/* ───────────── Klasse 7: negative Zahlen, Terme, Zuordnungen ───────────── */

/** Rechnen mit negativen Zahlen. */
export function genNegativ(lv = 3) {
  for (;;) {
    const kind = pick(tier(lv, ['unter'], ['unter', 'minusplus', 'minusminus'], ['minusklammer', 'mal', 'minusminus'], ['malmal', 'durch', 'minusklammer'], ['quadrat', 'drei', 'durch']));
    const a = ri(2, lv >= 4 ? 12 : 9), b = ri(2, lv >= 4 ? 12 : 9), c = ri(2, 5);
    let formula, opts, hints;
    if (kind === 'unter') { if (a >= b) continue; formula = `${a}-${b}`;
      opts = [N(a - b, true), N(b - a, false, 'Es wird mehr abgezogen, als da ist – das Ergebnis liegt unter null.'), N(a + b, false, 'Hier wurde addiert statt abgezogen.'), N(-(a + b), false, 'Von der Zahl geht es nur um die Differenz ins Minus, nicht um die Summe.')];
      hints = ['Stell dir ein Thermometer vor: Start beim ersten Wert, dann so viele Grad kälter.', `Bis zur Null sind es ${a} Schritte, dann noch ${b - a} weiter.`]; }
    else if (kind === 'minusplus') { formula = `-${a}+${b}`; if (a === b) continue;
      opts = [N(b - a, true), N(-(a + b), false, 'Plus heißt: nach rechts auf dem Zahlenstrahl, nicht weiter ins Minus.'), N(a + b, false, 'Die erste Zahl ist negativ.'), N(a - b, false, 'Das Vorzeichen ist vertauscht: Start bei der negativen Zahl, dann nach rechts.')];
      hints = ['Start bei der negativen Zahl, dann nach rechts gehen.', `Das ist dasselbe wie ${tex(`${b}-${a}`)}.`]; }
    else if (kind === 'minusminus') { formula = `-${a}-${b}`;
      opts = [N(-(a + b), true), N(a + b, false, '„Minus und Minus ergibt Plus“ gilt beim Malnehmen – hier wird zweimal abgezogen.'), N(b - a, false, 'Beide Schritte gehen nach links: weiter ins Minus.'), N(a - b, false, 'Beide Schritte gehen nach links: weiter ins Minus.')];
      hints = ['Start im Minus, dann noch weiter nach links.', 'Die Beträge werden addiert, das Ergebnis ist negativ.']; if (a === b) continue; }
    else if (kind === 'minusklammer') { formula = `${a}-(-${b})`;
      opts = [N(a + b, true), N(a - b, false, 'Eine negative Zahl abziehen heißt: ihren Betrag addieren.'), N(-(a + b), false, 'Das Ergebnis ist positiv: Aus „minus minus“ wird „plus“.'), N(b - a, false, 'Eine negative Zahl abziehen heißt: ihren Betrag addieren.')];
      hints = ['Schulden wegnehmen macht reicher.', `${tex(`${a}-(-${b})=${a}+${b}`)}.`]; if (a === b) continue; }
    else if (kind === 'mal') { formula = `-${a}\\cdot${b}`;
      opts = [N(-a * b, true), N(a * b, false, 'Minus mal Plus ergibt Minus.'), N(b - a, false, 'Hier steht ein Malpunkt.'), N(-(a + b), false, 'Hier steht ein Malpunkt.')];
      hints = ['Erst die Beträge malnehmen, dann das Vorzeichen bestimmen.', 'Verschiedene Vorzeichen: Das Ergebnis ist negativ.']; if (a === b || a * b === a + b) continue; }
    else if (kind === 'malmal') { formula = `(-${a})\\cdot(-${b})`;
      opts = [N(a * b, true), N(-a * b, false, 'Minus mal Minus ergibt Plus.'), N(-(a + b), false, 'Hier steht ein Malpunkt.'), N(a + b, false, 'Hier steht ein Malpunkt.')];
      hints = ['Erst die Beträge malnehmen, dann das Vorzeichen bestimmen.', 'Gleiche Vorzeichen: Das Ergebnis ist positiv.']; if (a * b === a + b) continue; }
    else if (kind === 'durch') { const q = ri(2, 9), neg = rand() < 0.5; formula = neg ? `(-${q * c}):(-${c})` : `${q * c}:(-${c})`;
      opts = [N(neg ? q : -q, true), N(neg ? -q : q, false, neg ? 'Minus durch Minus ergibt Plus.' : 'Plus durch Minus ergibt Minus.'), N(neg ? -(q * c - c) : q * c - c, false, 'Hier steht ein Geteilt-Zeichen.'), N((neg ? 1 : -1) * q * c * c, false, 'Hier wird geteilt, nicht malgenommen.')];
      hints = ['Beim Teilen gelten dieselben Vorzeichenregeln wie beim Malnehmen.', neg ? 'Gleiche Vorzeichen: positiv.' : 'Verschiedene Vorzeichen: negativ.']; }
    else if (kind === 'quadrat') { const klammer = rand() < 0.5; formula = klammer ? `(-${a})^2` : `-${a}^2`;
      opts = [N(klammer ? a * a : -a * a, true), N(klammer ? -a * a : a * a, false, klammer ? 'Die Klammer wird quadriert: Minus mal Minus ergibt Plus.' : 'Ohne Klammer gilt das Quadrat nur für die Zahl – das Minus bleibt davor stehen.'), N(klammer ? -2 * a : 2 * a, false, 'Hoch 2 heißt: mit sich selbst malnehmen, nicht mal 2.'), N(klammer ? 2 * a : -2 * a, false, 'Hoch 2 heißt: mit sich selbst malnehmen, nicht mal 2.')];
      hints = ['Steht das Minus in der Klammer, wird es mitquadriert.', klammer ? `${tex(`(-${a})\\cdot(-${a})`)}.` : `${tex(`-(${a}\\cdot${a})`)}.`]; if (a === 2) continue; }
    else { formula = `(-${a})\\cdot${b}\\cdot(-${c})`;
      opts = [N(a * b * c, true), N(-a * b * c, false, 'Zwei Minuszeichen heben sich auf.'), N(-(a + b + c), false, 'Hier stehen Malpunkte.'), N(a * b - c, false, 'Auch der letzte Faktor wird malgenommen.')];
      hints = ['Zähle die Minuszeichen: Bei einer geraden Anzahl ist das Produkt positiv.', `Beträge: ${tex(`${a}\\cdot${b}\\cdot${c}`)}.`]; }
    if (!gut(opts)) continue;
    return { prompt: 'Berechne.', formula, options: shuffle(opts), hints, explain: `${tex(`${formula}=${ft(opts[0].num)}`)}.`, kind };
  }
}

const glied = (k, v, erst) => (k === 0 ? '' : `${k < 0 ? '-' : erst ? '' : '+'}${Math.abs(k) === 1 ? '' : Math.abs(k)}${v}`);
const term2 = (kx, ky, v = 'x', w = 'y') => (glied(kx, v, true) + glied(ky, w, kx === 0)) || '0';
/** Terme: Wert berechnen und zusammenfassen. */
export function genTerm(lv = 3) {
  const L = b6L(lv), kind = pick([['wert'], ['gleich'], ['zwei', 'wertneg'], ['klammer', 'quad'], ['schachtel', 'produkt']][L - 1]);
  for (;;) {
    const a = ri(2, 9), b = ri(2, 9), c = ri(2, 6), d = ri(2, 6);
    const T = (t, correct, why, probe) => ({ tex: t, correct, why, probe });
    const X = 1.7, Y = -0.6;   // Probestelle: zwei Antworten gelten nur als verschieden, wenn auch ihre Werte verschieden sind
    if (kind === 'wert' || kind === 'wertneg') { const x = kind === 'wert' ? ri(2, 6) : -ri(2, 5), r = a * x + b;
      const opts = [N(r, true), N(Number(`${a}${Math.abs(x)}`) + b, false, `Zwischen ${a} und ${tex('x')} steht ein unsichtbarer Malpunkt: ${tex(`${a}\\cdot${kl(x)}`)}.`), N(a + x + b, false, `${tex(`${a}x`)} bedeutet ${a} <b>mal</b> ${tex('x')}.`), N(a * (x + b), false, 'Punkt vor Strich: Erst wird malgenommen, dann addiert.')];
      if (!gut(opts)) continue;
      return { prompt: `Berechne den Wert des Terms für ${tex(`x=${x}`)}.`, formula: `${a}x+${b}`, options: shuffle(opts), hints: [`Setze für ${tex('x')} die Zahl ein – mit Malpunkt${x < 0 ? ' und Klammer um die negative Zahl' : ''}.`, `${tex(`${a}\\cdot${kl(x)}+${b}`)}.`], explain: `${tex(`${a}\\cdot${kl(x)}+${b}=${a * x}+${b}=${r}`)}.`, kind, x, r }; }
    if (kind === 'gleich') { const r = a + b - c; if (r === 0) continue;
      const opts = [T(term2(r, 0), true), T(term2(a + b + c, 0), false, 'Das letzte Glied wird abgezogen.'), T(`${r}x^3`, false, 'Beim Zusammenfassen bleibt die Variable, wie sie ist – nur die Zahlen davor werden verrechnet.'), T(String(r), false, 'Die Variable gehört weiter dazu.')];
      if (!uniq(opts)) continue;
      return { prompt: 'Fasse zusammen.', formula: `${a}x+${b}x-${c}x`, options: shuffle(opts), hints: ['Gleichartige Glieder: Nur die Zahlen vor der Variablen werden verrechnet.', `${tex(`${a}+${b}-${c}=${r}`)}.`], explain: `${tex(`${a}x+${b}x-${c}x=${term2(r, 0)}`)}.`, kind }; }
    if (kind === 'zwei') { const kx = a - c, ky = b + d; if (kx === 0 || b === d) continue;
      const opts = [T(term2(kx, ky), true), T(term2(a + c, b + d), false, `Vor ${tex(`${c}x`)} steht ein Minus.`), T(`${kx + ky}xy`, false, `${tex('x')} und ${tex('y')} sind verschiedene Variablen – sie lassen sich nicht zusammenfassen.`), T(term2(kx, b - d), false, `Vor ${tex(`${d}y`)} steht ein Plus.`)];
      if (!uniq(opts)) continue;
      return { prompt: 'Fasse zusammen.', formula: `${a}x+${b}y-${c}x+${d}y`, options: shuffle(opts), hints: [`Sortiere: erst alle Glieder mit ${tex('x')}, dann alle mit ${tex('y')}.`, `${tex(`${a}x-${c}x`)} und ${tex(`${b}y+${d}y`)}.`], explain: `${tex(`${a}x-${c}x+${b}y+${d}y=${term2(kx, ky)}`)}.`, kind }; }
    if (kind === 'quad') { const e = ri(2, 9), k2 = a - c, k1 = b - d; if (k2 === 0 || k1 === 0 || k2 + k1 === 0) continue;
      const P = (p2, p1, p0) => `${glied(p2, 'x^2', true)}${glied(p1, 'x', p2 === 0)}${p0 > 0 ? '+' : ''}${p0 || ''}`, W = (p2, p1, p0) => p2 * X * X + p1 * X + p0;
      const formula = `${a}x^2+${b}x-${c}x^2-${d}x+${e}`;
      const opts = b6opts(T(P(k2, k1, e), true, undefined, W(k2, k1, e)), [T(P(k2 + k1, 0, e), false, `${tex('x^2')} und ${tex('x')} sind verschiedene Glieder – sie lassen sich nicht zusammenfassen.`, W(k2 + k1, 0, e)), T(P(a + c, k1, e), false, `Vor ${tex(`${c}x^2`)} steht ein Minus.`, W(a + c, k1, e)), T(P(k2, b + d, e), false, `Vor ${tex(`${d}x`)} steht ein Minus.`, W(k2, b + d, e)), T(P(k2, k1, 0).replace(/x\^2/, 'x^4').replace(/x$/, 'x^2') + `+${e}`, false, 'Beim Zusammenfassen ändern sich die Hochzahlen nicht – nur die Zahlen davor werden verrechnet.', W(k2, k1, e) + 0.02)]);
      if (!opts) continue;
      return { prompt: 'Fasse zusammen.', formula, options: shuffle(opts), hints: ['Nur Glieder mit derselben Variablen <b>und</b> derselben Hochzahl gehören zusammen.', `Quadratische Glieder: ${tex(`${a}x^2-${c}x^2=${glied(k2, 'x^2', true)}`)}.`, `Lineare Glieder: ${tex(`${b}x-${d}x=${glied(k1, 'x', true)}`)}. Die Zahl ${e} bleibt allein.`], explain: `${b6k(formula, `(${a}-${c})x^2+(${b}-${d})x+${e}`, P(k2, k1, e))}.`, kind }; }
    if (kind === 'klammer') { const e = ri(1, 5), f = ri(1, 9), kx = a * b - d * e, k0 = a * c + d * f; if (kx === 0) continue;
      const formula = `${a}(${b}x+${c})-${d}(${e === 1 ? '' : e}x-${f})`, W = (p, q) => p * X + q, O = (p, q, why) => T(b6lin(p, q), false, why, W(p, q));
      const opts = b6opts(T(b6lin(kx, k0), true, undefined, W(kx, k0)), [O(kx, a * c - d * f, `Minus mal Minus ergibt Plus: ${tex(`-${d}\\cdot(-${f})=+${d * f}`)}.`), O(kx, a * c - f, `Auch die ${f} wird mit ${tex(`-${d}`)} malgenommen.`), O(a * b + d * e, k0, `Vor der zweiten Klammer steht ein Minus: ${tex(`-${d}\\cdot ${e === 1 ? '' : e}x=-${d * e}x`)}.`), O(a * b - d * e, c + d * f, `Auch die ${c} in der ersten Klammer wird mit ${a} malgenommen.`), T(`${kx + k0}x`, false, `Glieder mit ${tex('x')} und reine Zahlen lassen sich nicht zusammenfassen.`, W(kx + k0, 0))]);
      if (!opts) continue;
      return { prompt: 'Löse die Klammern auf und fasse zusammen.', formula, options: shuffle(opts),
        hints: [`Erste Klammer ausmultiplizieren: ${tex(`${a}(${b}x+${c})=${a * b}x+${a * c}`)}.`, `Zweite Klammer – das Minus davor dreht beide Vorzeichen um: ${tex(`-${d}(${e === 1 ? '' : e}x-${f})=-${d * e}x+${d * f}`)}.`, `Gleichartige Glieder zusammenfassen: ${tex(`${a * b}x-${d * e}x=${b6lin(kx, 0)}`)} und ${tex(`${a * c}+${d * f}=${k0}`)}.`],
        explain: `${b6k(formula, `${a * b}x+${a * c}-${d * e}x+${d * f}`, b6lin(kx, k0))}.`, kind }; }
    if (kind === 'schachtel') { const p = ri(2, 5), q = ri(2, 5), e = ri(2, 6), kx = p * a - q * (c + e), ky = p * b + q * d; if (kx === 0) continue;
      const formula = `${p}(${a}x+${b}y)-${q}[${c}x-(${d}y-${e}x)]`, W = (m, n) => m * X + n * Y, O = (m, n, why) => T(term2(m, n), false, why, W(m, n));
      const opts = b6opts(T(term2(kx, ky), true, undefined, W(kx, ky)), [O(p * a - q * (c - e), ky, `Das Minus vor der runden Klammer macht aus ${tex(`-${e}x`)} ein ${tex(`+${e}x`)}: In der eckigen Klammer steht dann ${tex(`${c + e}x-${d}y`)}.`), O(kx, p * b - q * d, `Minus mal Minus ergibt Plus: ${tex(`-${q}\\cdot(-${d}y)=+${q * d}y`)}.`), O(p * a - q * c - e, p * b + d, `Der Faktor ${tex(`-${q}`)} gehört zu <b>allen</b> Gliedern der eckigen Klammer – auch zu denen aus der runden.`), O(p * a + q * (c + e), ky, `Vor der eckigen Klammer steht ein Minus: ${tex(`-${q}\\cdot${c + e}x=-${q * (c + e)}x`)}.`), T(`${kx + ky}xy`, false, `${tex('x')} und ${tex('y')} sind verschiedene Variablen – sie lassen sich nicht zusammenfassen.`, W(kx, ky) + 0.01)]);
      if (!opts) continue;
      return { prompt: 'Löse alle Klammern auf und fasse zusammen.', formula, options: shuffle(opts),
        hints: [`Von innen nach außen. Das Minus vor der runden Klammer dreht deren Vorzeichen: ${tex(`${c}x-(${d}y-${e}x)=${c}x-${d}y+${e}x`)} ${tex(`=${c + e}x-${d}y`)}.`, `Erste Klammer ausmultiplizieren: ${tex(`${p}(${a}x+${b}y)=${p * a}x+${p * b}y`)}.`, `Eckige Klammer mit ${tex(`-${q}`)} malnehmen: ${tex(`-${q}[${c + e}x-${d}y]=-${q * (c + e)}x+${q * d}y`)}.`, `Gleichartige Glieder zusammenfassen: ${tex(`${p * a}x-${q * (c + e)}x=${term2(kx, 0)}`)} und ${tex(`${p * b}y+${q * d}y=${ky}y`)}.`],
        explain: `${b6k(formula, `${p}(${a}x+${b}y)-${q}[${c + e}x-${d}y]`, `${p * a}x+${p * b}y-${q * (c + e)}x+${q * d}y`, term2(kx, ky))}.`, kind }; }
    { const kx = a - b + 2 * c, k0 = -a * b - c * c; if (kx === 0 || a === b) continue;   // Produkt zweier Klammern minus Binom
      const formula = `(x+${a})(x-${b})-(x-${c})^2`, W = (m, n, q2 = 0) => q2 * X * X + m * X + n, O = (m, n, why) => T(b6lin(m, n), false, why, W(m, n));
      const opts = b6opts(T(b6lin(kx, k0), true, undefined, W(kx, k0)), [O(a - b, -a * b + c * c, `${tex(`(x-${c})^2`)} ist nicht ${tex(`x^2-${c * c}`)}: Es fehlt das gemischte Glied ${tex(`-${2 * c}x`)} der zweiten binomischen Formel.`), O(kx, -a * b + c * c, `Das Minus vor dem Quadrat gilt für die ganze Klammer – auch für ${tex(`+${c * c}`)}.`), O(a - b - 2 * c, k0, `${tex(`-(-${2 * c}x)=+${2 * c}x`)}: Minus mal Minus ergibt Plus.`), T(`2x^2${glied(a - b - 2 * c, 'x', false)}${-a * b + c * c > 0 ? '+' : ''}${-a * b + c * c || ''}`, false, `Das zweite Quadrat wird abgezogen: ${tex('x^2-x^2=0')}.`, W(a - b - 2 * c, -a * b + c * c, 2)), O(a + b + 2 * c, k0, `${tex(`x\\cdot(-${b})=-${b}x`)}: Das Vorzeichen gehört zur Zahl.`)]);
      if (!opts) continue;
      return { prompt: 'Multipliziere aus und fasse zusammen.', formula, options: shuffle(opts),
        hints: [`Erstes Produkt, jedes Glied mit jedem: ${tex(`(x+${a})(x-${b})=x^2-${b}x+${a}x-${a * b}`)}.`, `Zweite binomische Formel: ${tex(`(x-${c})^2=x^2-${2 * c}x+${c * c}`)}.`, `Das Minus davor dreht alle drei Vorzeichen um: ${tex(`-x^2+${2 * c}x-${c * c}`)}.`, `Zusammenfassen: ${tex('x^2-x^2=0')}, ${tex(`-${b}x+${a}x+${2 * c}x=${b6lin(kx, 0)}`)} und ${tex(`-${a * b}-${c * c}=${k0}`)}.`],
        explain: `${b6k(formula, `x^2-${b}x+${a}x-${a * b}-(x^2-${2 * c}x+${c * c})`, `x^2${glied(a - b, 'x', false)}-${a * b}-x^2+${2 * c}x-${c * c}`, b6lin(kx, k0))}.`, kind: 'produkt' }; }
  }
}

/** Dreisatz: proportionale und antiproportionale Zuordnungen. */
export function genDreisatz(lv = 3) {
  for (;;) {
    const anti = lv >= 4 && rand() < (lv >= 5 ? 0.6 : 0.5);
    const E = (num, c, w, einheit) => N(+num.toFixed(4), c, w, `${ft(num, 2)}\\,\\text{${einheit}}`);
    if (anti) {
      const x1 = pick([2, 3, 4, 6]), x2 = pick([2, 3, 4, 5, 6, 8].filter((v) => v !== x1)), y1 = pick([12, 24, 30, 36, 48, 60].filter((v) => (v * x1) % x2 === 0)), y2 = (x1 * y1) / x2;
      const opts = [E(y2, true, undefined, 'Tage'), E((y1 * x2) / x1, false, 'Mehr Arbeiter brauchen <b>weniger</b> Zeit – hier ist die Zuordnung umgekehrt (antiproportional).', 'Tage'), E(y1 + (x1 - x2), false, 'Hier hilft keine Differenz: Das Produkt aus Arbeitern und Tagen bleibt gleich.', 'Tage'), E(x1 * y1, false, 'Das ist die Zeit für einen einzigen Arbeiter. Jetzt noch durch die neue Anzahl teilen.', 'Tage')];
      if (!gut(opts) || y2 < 1) continue;
      return { prompt: `${x1} Arbeiter brauchen für einen Auftrag ${y1} Tage. Wie lange brauchen ${x2} Arbeiter?`, options: shuffle(opts), hints: ['Je mehr Arbeiter, desto weniger Tage: Das Produkt bleibt gleich.', `Ein Arbeiter allein bräuchte ${tex(`${x1}\\cdot${y1}=${x1 * y1}`)} Tage.`], explain: `${tex(`${x1}\\cdot${y1}=${x1 * y1}`)} und ${tex(`${x1 * y1}:${x2}=${ft(y2)}`)} Tage.`, anti, y2 };
    }
    const x1 = ri(2, 6), x2 = pick(tier(lv, [x1 * 2, x1 * 3], [x1 * 2, x1 * 3, x1 + 1], [x1 + 1, x1 + 2, x1 + 3, 1], [x1 + 2, x1 + 5, 1], [x1 + 3, x1 + 7, 10])), e = pick(tier(lv, [2, 3, 4], [1.5, 2, 2.5, 3], [0.8, 1.2, 1.5, 2.4], [0.6, 1.25, 1.75, 2.2], [0.45, 1.35, 2.65])), y1 = +(x1 * e).toFixed(2), y2 = +(x2 * e).toFixed(2);
    if (x2 === x1) continue;
    const ding = pick(['Hefte', 'Brötchen', 'Kugeln Eis', 'Flaschen']);
    const opts = [E(y2, true, undefined, '€'), E(y1 + (x2 - x1), false, 'Jedes Stück kostet gleich viel – es wird nicht einfach die Differenz addiert.', '€'), E(e, false, 'Das ist der Preis für ein Stück. Jetzt noch mit der neuen Anzahl malnehmen.', '€'), E((y1 * x1) / x2, false, 'Mehr Stück kosten mehr – hier wird erst geteilt, dann malgenommen.', '€')];
    if (!gut(opts)) continue;
    return { prompt: `${x1} ${ding} kosten ${fmt(y1)} €. Wie viel ${x2 === 1 ? 'kostet' : 'kosten'} ${x2}?`.replace(/ 1\?$/, ` 1 ${ding.replace(/n Eis$/, ' Eis').replace(/(Heft|Brötchen|Flasche)e?n?$/, '$1')}?`), options: shuffle(opts), hints: ['Rechne erst auf ein Stück herunter, dann auf die gesuchte Anzahl hoch.', `Ein Stück kostet ${tex(`${ft(y1)}:${x1}=${ft(e)}`)} €.`], explain: `${tex(`${ft(y1)}:${x1}=${ft(e)}`)} € je Stück, also ${tex(`${x2}\\cdot${ft(e)}=${ft(y2)}`)} €.`, anti, y2 };
  }
}

/* ───────────── Klasse 8 bis 10: Funktionen, Wurzeln, Wachstum, Körper ───────────── */

const lin = (m, b) => `${m === 1 ? '' : m === -1 ? '-' : ft(m)}x${b === 0 ? '' : b > 0 ? `+${ft(b)}` : ft(b)}`;
/** Lineare Funktionen: Wert, Achsenabschnitt, Nullstelle, Gleichung aufstellen, Schnittpunkt. */
export function genLinFunktion(lv = 3) {
  for (;;) {
    const kind = pick(tier(lv, ['wert'], ['wert', 'abschnitt'], ['null', 'abschnitt'], ['null', 'punkt'], ['schnitt', 'punkt']));
    const m = pick(tier(lv, [2, 3, 4], [2, 3, -2, 5], [2, -2, 4, -3], [0.5, -1.5, 3, -4], [1.5, -0.5, -2.5, 4])), b = pick([-6, -4, -3, -2, 2, 3, 4, 6, 8]);
    if (kind === 'wert') { const x = ri(-3, 5); if (x === 0) continue; const r = m * x + b;
      const opts = [N(r, true), N(m + x + b, false, `${tex(`${ft(m)}x`)} bedeutet: ${ft(m)} <b>mal</b> ${tex('x')}.`), N(m * (x + b), false, 'Punkt vor Strich: Erst malnehmen, dann addieren.'), N(m * x - b, false, 'Achte auf das Vorzeichen der Zahl am Ende.')];
      if (!gut(opts)) continue;
      return { prompt: `Berechne ${tex(`f(${x})`)}.`, formula: `f(x)=${lin(m, b)}`, options: shuffle(opts), hints: [`Setze für ${tex('x')} die Zahl ${x} ein.`, `${tex(`${ft(m)}\\cdot${kl(x)}${b > 0 ? '+' : ''}${ft(b)}`)}.`], explain: `${tex(`f(${x})=${ft(m)}\\cdot${kl(x)}${b > 0 ? '+' : ''}${ft(b)}=${ft(r)}`)}.`, kind, m, b, r }; }
    if (kind === 'abschnitt') { const was = rand() < 0.5 ? 'steigung' : 'achse', r = was === 'steigung' ? m : b; if (m === b || m === -b) continue;
      const opts = [N(r, true), N(was === 'steigung' ? b : m, false, was === 'steigung' ? `Die Steigung steht vor dem ${tex('x')}; ${ft(b)} ist der y-Achsenabschnitt.` : `Der y-Achsenabschnitt ist die Zahl ohne ${tex('x')}; ${ft(m)} ist die Steigung.`), N(-r, false, 'Achte auf das Vorzeichen.'), N(+(-b / m).toFixed(4), false, 'Das ist die Nullstelle – die Stelle, an der der Graph die x-Achse schneidet.', ft(-b / m, 2))];
      if (!gut(opts)) continue;
      return { prompt: was === 'steigung' ? 'Wie groß ist die Steigung der Geraden?' : 'An welcher Stelle schneidet die Gerade die y-Achse?', formula: `f(x)=${lin(m, b)}`, options: shuffle(opts), hints: [`In ${tex('f(x)=m\\,x+b')} ist ${tex('m')} die Steigung und ${tex('b')} der y-Achsenabschnitt.`, was === 'steigung' ? `Die Steigung ist die Zahl vor dem ${tex('x')}.` : `Für ${tex('x=0')} bleibt nur die Zahl am Ende übrig.`], explain: was === 'steigung' ? `Die Steigung ist ${tex(`m=${ft(m)}`)}.` : `${tex(`f(0)=${ft(b)}`)} – der Graph schneidet die y-Achse bei ${tex(ft(b))}.`, kind, m, b, r }; }
    if (kind === 'null') { const x0 = -b / m; if (!Number.isInteger(x0 * 2)) continue;
      const opts = [N(x0, true), N(-x0, false, 'Beim Umstellen wechselt die Zahl ohne x das Vorzeichen.'), N(b, false, 'Das ist der y-Achsenabschnitt. Gesucht ist die Stelle mit dem Funktionswert null.'), N(+(-m / b).toFixed(4), false, `Es wird durch die Zahl vor dem ${tex('x')} geteilt, nicht durch die Zahl am Ende.`, ft(-m / b, 2))];
      if (!gut(opts)) continue;
      return { prompt: 'Bestimme die Nullstelle.', formula: `f(x)=${lin(m, b)}`, options: shuffle(opts), hints: [`Nullstelle heißt: ${tex('f(x)=0')}.`, `${tex(`${ft(m)}x=${ft(-b)}`)}.`], explain: `${tex(`${lin(m, b)}=0`)}, also ${tex(`${ft(m)}x=${ft(-b)}`)} und ${tex(`x=${ft(x0)}`)}.`, kind, m, b, r: x0 }; }
    if (kind === 'punkt') { const px = pick([-2, -1, 1, 2, 3, 4]), py = m * px + b; if (!Number.isInteger(py * 2)) continue;
      const O = (bb, c, w) => ({ tex: `f(x)=${lin(m, bb)}`, num: bb, correct: c, why: w });
      const opts = [O(b, true), O(py, false, `Die Zahl am Ende ist der y-Achsenabschnitt, nicht der y-Wert des Punktes. Setze den Punkt ein und löse nach ${tex('b')} auf.`), O(py + m * px, false, `Beim Auflösen wird ${tex(`${ft(m)}\\cdot${kl(px)}`)} abgezogen, nicht addiert.`), O(-b, false, 'Achte auf das Vorzeichen.')];
      if (!gut(opts)) continue;
      return { prompt: `Eine Gerade hat die Steigung ${tex(ft(m))} und geht durch den Punkt ${tex(`P(${px}\\mid ${ft(py)})`)}. Welche Gleichung passt?`, options: shuffle(opts), hints: [`Ansatz: ${tex(`f(x)=${ft(m)}x+b`)}.`, `Punkt einsetzen: ${tex(`${ft(py)}=${ft(m)}\\cdot${kl(px)}+b`)}.`], explain: `${tex(`b=${ft(py)}-${kl(m * px)}=${ft(b)}`)}, also ${tex(`f(x)=${lin(m, b)}`)}.`, kind, m, b, r: b }; }
    const m2 = pick([1, 2, 3, -1, -2, -3].filter((v) => v !== m)), xs = pick([-2, -1, 1, 2, 3, 4]), b2 = (m - m2) * xs + b;
    if (!Number.isInteger(b2) || b2 === 0 || b2 === b) continue;
    const opts = [N(xs, true), N(-xs, false, 'Beim Umstellen ist ein Vorzeichen verloren gegangen.'), N(m * xs + b, false, 'Das ist der y-Wert des Schnittpunkts. Gefragt ist die Stelle x.'), N(+((b2 + b) / (m - m2)).toFixed(4), false, 'Beim Rüberbringen wechselt das Vorzeichen: Die Zahlen werden voneinander abgezogen.', ft((b2 + b) / (m - m2), 2))];
    if (!gut(opts)) continue;
    return { prompt: 'An welcher Stelle x schneiden sich die beiden Geraden?', formula: `f(x)=${lin(m, b)}\\qquad g(x)=${lin(m2, b2)}`, options: shuffle(opts), hints: ['Im Schnittpunkt haben beide Funktionen denselben Wert: gleichsetzen.', `${tex(`${lin(m, b)}=${lin(m2, b2)}`)}.`], explain: `${tex(`${ft(m - m2)}x=${ft(b2 - b)}`)}, also ${tex(`x=${ft(xs)}`)}.`, kind, m, b, r: xs };
  }
}

/** Quadratwurzeln: ziehen, zusammenfassen, teilweise ziehen. */
export function genWurzel(lv = 3) {
  const L = b6L(lv), kind = pick([['quadrat'], ['mal', 'summe'], ['teil', 'bruch'], ['teilsumme', 'malteil'], ['nenner', 'binom']][L - 1]);
  for (;;) {
    const T = (t, num, correct, why) => ({ tex: t, num, correct, why });
    if (kind === 'quadrat') { const a = ri(2, 12), q = a * a;
      const opts = [N(a, true), N(q / 2, false, 'Die Wurzel ist nicht die Hälfte. Gesucht ist die Zahl, die mit sich selbst malgenommen den Wert ergibt.'), N(q * q, false, 'Das ist das Quadrat. Die Wurzel macht das Quadrieren rückgängig.'), N(a + 1, false, `${tex(`${a + 1}^2=${(a + 1) ** 2}`)} – das ist zu groß.`)];
      if (!gut(opts)) continue;
      return { prompt: 'Berechne.', formula: `\\sqrt{${q}}`, options: shuffle(opts), hints: ['Welche Zahl ergibt mit sich selbst malgenommen diesen Wert?', `${tex(`${a}\\cdot${a}`)}.`], explain: `${tex(`\\sqrt{${q}}=${a}`)}, denn ${tex(`${a}^2=${q}`)}.`, kind, r: a }; }
    if (kind === 'mal') { const [x, y] = pick([[2, 8], [3, 12], [2, 18], [5, 20], [3, 27], [2, 32], [6, 24], [2, 50]]), r = Math.sqrt(x * y);
      const opts = [N(r, true), T(`\\sqrt{${x + y}}`, Math.sqrt(x + y), false, 'Beim Malnehmen werden die Zahlen unter der Wurzel malgenommen, nicht addiert.'), N(x * y, false, 'Am Ende muss noch die Wurzel gezogen werden.'), N((x * y) / 2, false, 'Die Wurzel ist nicht die Hälfte.')];
      if (!gut(opts)) continue;
      return { prompt: 'Vereinfache.', formula: `\\sqrt{${x}}\\cdot\\sqrt{${y}}`, options: shuffle(opts), hints: [`${tex('\\sqrt a\\cdot\\sqrt b=\\sqrt{a\\cdot b}')}.`, `${tex(`\\sqrt{${x}\\cdot${y}}=\\sqrt{${x * y}}`)}.`], explain: `${tex(`\\sqrt{${x}}\\cdot\\sqrt{${y}}=\\sqrt{${x * y}}=${r}`)}.`, kind, r }; }
    if (kind === 'summe') { const a = ri(2, 9), b = ri(2, 9), s = Math.sqrt(a * a + b * b);
      const opts = [N(a + b, true), T(`\\sqrt{${a * a + b * b}}`, +s.toFixed(6), false, `Wurzeln darf man beim Addieren nicht zusammenziehen: ${tex('\\sqrt a+\\sqrt b\\ne\\sqrt{a+b}')}.`), N(a * b, false, 'Hier steht ein Plus, kein Malpunkt.'), N((a * a + b * b) / 2, false, 'Zieh erst jede Wurzel einzeln, dann addiere.')];
      if (!gut(opts) || Number.isInteger(s)) continue;
      return { prompt: 'Berechne.', formula: `\\sqrt{${a * a}}+\\sqrt{${b * b}}`, options: shuffle(opts), hints: ['Zieh jede Wurzel einzeln.', `${tex(`${a}+${b}`)}.`], explain: `${tex(`\\sqrt{${a * a}}+\\sqrt{${b * b}}=${a}+${b}=${a + b}`)}.`, kind, r: a + b }; }
    if (kind === 'bruch') { const a = ri(2, 12), b = ri(2, 12); if (a === b || gcd(a, b) !== 1) continue;
      const opts = [T(br(a, b), a / b, true), T(br(a * a, b), (a * a) / b, false, 'Auch aus dem Zähler wird die Wurzel gezogen.'), T(br(a, b * b), a / (b * b), false, 'Auch aus dem Nenner wird die Wurzel gezogen.'), T(br(a * a, 2 * b * b), (a * a) / (2 * b * b), false, 'Die Wurzel ist nicht die Hälfte.')];
      if (!gut(opts)) continue;
      return { prompt: 'Berechne.', formula: `\\sqrt{${br(a * a, b * b)}}`, options: shuffle(opts), hints: ['Die Wurzel aus einem Bruch: Wurzel aus dem Zähler durch Wurzel aus dem Nenner.', `${tex(`${br(`\\sqrt{${a * a}}`, `\\sqrt{${b * b}}`)}`)}.`], explain: `${tex(`\\sqrt{${br(a * a, b * b)}}=${br(`\\sqrt{${a * a}}`, `\\sqrt{${b * b}}`)}=${br(a, b)}`)}.`, kind, r: a / b }; }
    if (kind === 'teil') { const q = pick([2, 3, 4, 5, 6]), k = pick([2, 3, 5, 6, 7]), n = q * q * k;
      const opts = [T(`${q}\\sqrt{${k}}`, q * Math.sqrt(k), true), T(`${q * q}\\sqrt{${k}}`, q * q * Math.sqrt(k), false, 'Aus der Quadratzahl wird die Wurzel gezogen, bevor sie vor die Wurzel kommt.'), T(`${k}\\sqrt{${q}}`, k * Math.sqrt(q), false, 'Vor die Wurzel kommt die Wurzel der Quadratzahl; der andere Faktor bleibt darunter.'), N(q * k, false, 'Die Wurzel verschwindet nicht einfach: Nur aus der Quadratzahl lässt sie sich ziehen, der Rest bleibt unter der Wurzel.')];
      if (!gut(opts)) continue;
      return { prompt: 'Zieh teilweise die Wurzel.', formula: `\\sqrt{${n}}`, options: shuffle(opts), hints: ['Zerlege die Zahl unter der Wurzel in eine Quadratzahl mal einen Rest.', `${tex(`${n}=${q * q}\\cdot${k}`)}.`], explain: `${tex(`\\sqrt{${n}}=\\sqrt{${q * q}\\cdot${k}}=${q}\\sqrt{${k}}`)}.`, kind, r: q * Math.sqrt(k) }; }
    if (kind === 'malteil') { const [x, y] = pick([[6, 15], [6, 10], [10, 15], [6, 14], [3, 15], [2, 6], [5, 10], [3, 6], [2, 10], [7, 14], [6, 21], [10, 14], [3, 21], [5, 15]]), n = x * y; let q = 1; for (let i = 2; i * i <= n; i++) if (n % (i * i) === 0) q = i; const k = n / (q * q), w = Math.sqrt(k);
      const opts = b6opts(T(b6w(q, k), q * w, true), [T(b6w(q * q, k), q * q * w, false, 'Aus der Quadratzahl wird die Wurzel gezogen, bevor sie vor die Wurzel kommt.'), T(`\\sqrt{${x + y}}`, Math.sqrt(x + y), false, 'Beim Malnehmen werden die Zahlen unter der Wurzel malgenommen, nicht addiert.'), T(b6w(k, q), k * Math.sqrt(q), false, 'Vor die Wurzel kommt die Wurzel der Quadratzahl; der andere Faktor bleibt darunter.'), N(q * k, false, 'Die Wurzel verschwindet nicht einfach: Der Rest bleibt unter der Wurzel.'), N(n, false, 'Die Wurzel muss noch gezogen werden – soweit das geht.')]);
      if (!opts) continue;
      return { prompt: 'Vereinfache so weit wie möglich.', formula: `\\sqrt{${x}}\\cdot\\sqrt{${y}}`, options: shuffle(opts), hints: [`Erst unter eine Wurzel bringen: ${tex(`\\sqrt{${x}}\\cdot\\sqrt{${y}}=\\sqrt{${x}\\cdot${y}}=\\sqrt{${n}}`)}.`, `Zerlege in eine Quadratzahl mal einen Rest: ${tex(`${n}=${q * q}\\cdot${k}`)}.`, `Teilweise die Wurzel ziehen: ${tex(`\\sqrt{${q * q}\\cdot${k}}=${q}\\sqrt{${k}}`)}.`], explain: `${b6k(`\\sqrt{${x}}\\cdot\\sqrt{${y}}`, `\\sqrt{${n}}`, `\\sqrt{${q * q}\\cdot${k}}`, b6w(q, k))}.`, kind, r: q * w }; }
    if (kind === 'teilsumme') { const k = pick([2, 3, 5, 6, 7]), [q1, q2, q3] = shuffle([2, 3, 4, 5, 6]), a = ri(1, 4), b = ri(2, 4), c = ri(1, 4), S = a * q1 + b * q2 - c * q3, w = Math.sqrt(k), n = [q1, q2, q3].map((q) => q * q * k); if (S <= 0) continue;
      const formula = `${b6w(a, n[0])}+${b6w(b, n[1])}-${b6w(c, n[2])}`, O = (m, why) => (m > 0 ? T(b6w(m, k), m * w, false, why) : null);
      const opts = b6opts(T(b6w(S, k), S * w, true), [O(a * q1 + b * q2 + c * q3, 'Vor der letzten Wurzel steht ein Minus.'), O(a * q1 * q1 + b * q2 * q2 - c * q3 * q3, 'Vor die Wurzel kommt die <b>Wurzel</b> der Quadratzahl, nicht die Quadratzahl selbst.'), O(a + b - c, 'Die teilweise gezogenen Wurzeln gehören als Faktoren dazu.'), N(S * k, false, 'Die Wurzel verschwindet nicht einfach: Der Rest bleibt unter der Wurzel.'), a * n[0] + b * n[1] - c * n[2] > 0 ? T(`\\sqrt{${a * n[0] + b * n[1] - c * n[2]}}`, Math.sqrt(a * n[0] + b * n[1] - c * n[2]), false, 'Wurzeln darf man beim Addieren nicht unter eine Wurzel ziehen.') : null]);
      if (!opts) continue;
      return { prompt: 'Vereinfache so weit wie möglich.', formula, options: shuffle(opts),
        hints: [`Zieh aus jeder Wurzel teilweise die Wurzel: ${tex(`\\sqrt{${n[0]}}=\\sqrt{${q1 * q1}\\cdot${k}}=${q1}\\sqrt{${k}}`)}.`, `Ebenso: ${tex(`\\sqrt{${n[1]}}=${q2}\\sqrt{${k}}`)} und ${tex(`\\sqrt{${n[2]}}=${q3}\\sqrt{${k}}`)}.`, `Einsetzen: ${tex(`${a}\\cdot${q1}\\sqrt{${k}}+${b}\\cdot${q2}\\sqrt{${k}}-${c}\\cdot${q3}\\sqrt{${k}}`)}.`, `Gleiche Wurzeln zusammenfassen: ${tex(`(${a * q1}+${b * q2}-${c * q3})\\sqrt{${k}}`)}.`],
        explain: `${b6k(formula, `${a * q1}\\sqrt{${k}}+${b * q2}\\sqrt{${k}}-${c * q3}\\sqrt{${k}}`, `(${a * q1}+${b * q2}-${c * q3})\\sqrt{${k}}`, b6w(S, k))}.`, kind, r: S * w }; }
    if (kind === 'nenner') { const [m, n] = shuffle([2, 3, 5, 6, 7, 10, 11, 13]).slice(0, 2).sort((x, y) => y - x), df = m - n, c = ri(2, 6), p = c * df, plus = rand() < 0.5, zN = plus ? '+' : '-', zE = plus ? '-' : '+', wm = Math.sqrt(m), wn = Math.sqrt(n), sg = plus ? -1 : 1;
      const formula = `\\dfrac{${p}}{\\sqrt{${m}}${zN}\\sqrt{${n}}}`, K = (f, z) => `${f}(\\sqrt{${m}}${z}\\sqrt{${n}})`;
      const opts = b6opts(T(K(c, zE), c * (wm + sg * wn), true), [T(K(c, zN), c * (wm - sg * wn), false, `Erweitert wird mit ${tex(`\\sqrt{${m}}${zE}\\sqrt{${n}}`)} – dieses Vorzeichen steht dann auch im Ergebnis.`), T(K(p, zE), p * (wm + sg * wn), false, `Der neue Nenner ${tex(`${m}-${n}=${df}`)} muss noch gekürzt werden.`), T(`\\dfrac{${K(p, zE)}}{${m + n}}`, (p * (wm + sg * wn)) / (m + n), false, `Dritte binomische Formel: Im Nenner steht ${tex(`${m}-${n}`)}, nicht ${tex(`${m}+${n}`)}.`), N(c, false, 'Die Wurzeln verschwinden nur im Nenner – im Zähler bleiben sie stehen.'), T(K(c + 1, zE), (c + 1) * (wm + sg * wn), false, `Kürze genau: ${tex(`${p}:${df}=${c}`)}.`)]);
      if (!opts) continue;
      return { prompt: 'Mache den Nenner rational und vereinfache.', formula, options: shuffle(opts),
        hints: [`Erweitern mit ${tex(`\\sqrt{${m}}${zE}\\sqrt{${n}}`)} – dann greift im Nenner die dritte binomische Formel.`, `Nenner: ${tex(`(\\sqrt{${m}}${zN}\\sqrt{${n}})(\\sqrt{${m}}${zE}\\sqrt{${n}})=${m}-${n}=${df}`)}.`, `Zähler: ${tex(K(p, zE))}.`, `Kürzen: ${tex(`${p}:${df}=${c}`)}.`],
        explain: `Erweitern mit ${tex(`\\sqrt{${m}}${zE}\\sqrt{${n}}`)} (dritte binomische Formel im Nenner): ${tex(`${formula}=\\dfrac{${K(p, zE)}}{${m}-${n}}`)} ${tex(`=\\dfrac{${K(p, zE)}}{${df}}=${K(c, zE)}`)}.`, kind, r: c * (wm + sg * wn) }; }
    { const [m, n] = pick([[6, 3], [6, 2], [10, 5], [10, 2], [15, 3], [15, 5], [14, 7], [14, 2], [21, 3], [21, 7], [12, 6], [8, 6]]), plus = rand() < 0.5, z = plus ? '+' : '-', sg = plus ? 1 : -1, mn = m * n; let q = 1; for (let i = 2; i * i <= mn; i++) if (mn % (i * i) === 0) q = i; const k = mn / (q * q), w = Math.sqrt(k), s = m + n;
      const formula = `(\\sqrt{${m}}${z}\\sqrt{${n}})^2`, O = (f, why, s2 = s) => T(`${s2}${z}${b6w(f, k)}`, s2 + sg * f * w, false, why);
      const opts = b6opts(T(`${s}${z}${b6w(2 * q, k)}`, s + sg * 2 * q * w, true), [N(s, false, `${tex('(a\\pm b)^2')} ist nicht ${tex('a^2+b^2')}: Es fehlt das gemischte Glied ${tex('\\pm 2ab')}.`), O(q, `Das gemischte Glied kommt <b>doppelt</b> vor: ${tex(`2\\cdot\\sqrt{${m}}\\cdot\\sqrt{${n}}`)}.`), O(2 * q * q, 'Aus der Quadratzahl wird die Wurzel gezogen, bevor sie vor die Wurzel kommt.'), plus ? null : N(m - n, false, `Das wäre ${tex('(a+b)(a-b)')} – hier steht aber ein Quadrat.`), O(2 * q, `${tex(`(\\sqrt{${m}})^2=${m}`)} und ${tex(`(\\sqrt{${n}})^2=${n}`)} – die Wurzel hebt das Quadrat auf.`, m * m + n * n)]);
      if (!opts) continue;
      return { prompt: 'Multipliziere aus und vereinfache so weit wie möglich.', formula, options: shuffle(opts),
        hints: [`${plus ? 'Erste' : 'Zweite'} binomische Formel: ${tex(`(a${z}b)^2=a^2${z}2ab+b^2`)}.`, `${tex(`(\\sqrt{${m}})^2=${m}`)}, ${tex(`(\\sqrt{${n}})^2=${n}`)} und ${tex(`2\\cdot\\sqrt{${m}}\\cdot\\sqrt{${n}}=2\\sqrt{${mn}}`)}.`, `Teilweise die Wurzel ziehen: ${tex(`\\sqrt{${mn}}=\\sqrt{${q * q}\\cdot${k}}=${q}\\sqrt{${k}}`)}.`, `Zusammenfassen: ${tex(`${m}+${n}=${s}`)} und ${tex(`2\\cdot${q}\\sqrt{${k}}=${2 * q}\\sqrt{${k}}`)}.`],
        explain: `${plus ? 'Erste' : 'Zweite'} binomische Formel: ${b6k(formula, `${m}${z}2\\sqrt{${mn}}+${n}`, `${s}${z}2\\cdot${q}\\sqrt{${k}}`, `${s}${z}${b6w(2 * q, k)}`)}.`, kind: 'binom', r: s + sg * 2 * q * w }; }
  }
}

/** Exponentielles Wachstum: Zinseszins, Zunahme und Abnahme in Prozent. */
export function genZinseszins(lv = 3) {
  const L = b6L(lv), kind = pick([['faktor', 'faktorab'], ['ein', 'einab'], ['zwei', 'formel'], ['drei', 'abnahme', 'rueck'], ['wechsel', 'satz', 'dauer']][L - 1]);
  for (;;) {
    const p = pick([[10, 20, 50], [5, 10, 20, 25], [2, 4, 5, 10], [3, 5, 8, 12], [2.5, 4, 12, 15]][L - 1]), K = pick([200, 400, 500, 1000, 2000, 5000]);
    const q = 1 + p / 100, E = (num, c, w) => N(+num.toFixed(2), c, w, `${ft(num, 2)}\\,\\text{€}`), J = (num, c, w) => N(num, c, w, `${num}\\,\\text{Jahre}`), Pz = (num, c, w) => N(+num.toFixed(2), c, w, `${ft(num, 2)}\\,\\%`);
    if (kind === 'faktor' || kind === 'faktorab') { const ab = kind === 'faktorab', r = ab ? 1 - p / 100 : q;
      const opts = [N(r, true), N(ab ? q : 1 - p / 100, false, ab ? 'Bei einer Abnahme wird der Prozentsatz von 100 % abgezogen.' : 'Bei einer Zunahme kommt der Prozentsatz zu 100 % dazu.'), N(p / 100, false, 'Das ist nur der Anteil der Änderung. Der alte Wert (100 %) bleibt ja erhalten.'), N(ab ? p / 10 : 1 + p / 10, false, `${fmt(p)} % sind ${fmt(p / 100, 3)}, nicht ${fmt(p / 10, 2)}.`)];
      if (!gut(opts)) continue;
      return { prompt: ab ? `Ein Wert nimmt jedes Jahr um ${fmt(p)} % ab. Mit welchem Faktor wird er jedes Jahr malgenommen?` : `Ein Wert wächst jedes Jahr um ${fmt(p)} %. Mit welchem Faktor wird er jedes Jahr malgenommen?`, options: shuffle(opts), hints: ['Der alte Wert sind 100 %.', ab ? `${tex(`100\\,\\%-${ft(p)}\\,\\%`)} als Dezimalzahl.` : `${tex(`100\\,\\%+${ft(p)}\\,\\%`)} als Dezimalzahl.`], explain: `${tex(`${ab ? `1-${ft(p / 100, 3)}` : `1+${ft(p / 100, 3)}`}=${ft(r, 3)}`)}.`, kind: 'faktor', r }; }
    if (kind === 'formel') { const n = ri(3, 8), O = (t, c, w) => ({ tex: t, correct: c, why: w });
      const opts = [O(`${K}\\cdot${ft(q, 3)}^{${n}}`, true), O(`${K}\\cdot${ft(q, 3)}\\cdot${n}`, false, 'Jedes Jahr wird neu malgenommen – das ist eine Potenz, kein Produkt mit der Zahl der Jahre.'), O(`${K}+${n}\\cdot${ft(p)}`, false, 'Prozente sind ein Anteil, kein fester Betrag – und die Zinsen werden mitverzinst.'), O(`${K}\\cdot${ft(p / 100, 3)}^{${n}}`, false, `Der Wachstumsfaktor ist ${tex(ft(q, 3))}, nicht ${tex(ft(p / 100, 3))}.`)];
      if (!uniq(opts)) continue;
      return { prompt: `${K} € werden ${n} Jahre lang mit ${fmt(p)} % verzinst (mit Zinseszins). Welcher Term beschreibt das Guthaben danach?`, options: shuffle(opts), hints: [`Wachstumsfaktor pro Jahr: ${tex(`1+${ft(p / 100, 3)}=${ft(q, 3)}`)}.`, `Jedes Jahr wird das Guthaben mit diesem Faktor malgenommen – nach ${n} Jahren also ${n}-mal.`], explain: `${n}-mal mit ${tex(ft(q, 3))} malnehmen: ${tex(`K=${K}\\cdot${ft(q, 3)}^{${n}}`)}.`, kind }; }
    if (kind === 'rueck') { const K0 = pick([400, 800, 1200, 2000, 2500, 5000]), Kn = K0 * q * q; if (Math.abs(Kn * 100 - Math.round(Kn * 100)) > 1e-6) continue;
      const opts = b6opts(E(K0, true), [E(Kn * (1 - p / 100) ** 2, false, `Zurückrechnen heißt durch den Faktor <b>teilen</b>. ${fmt(p)} % abziehen ist zu viel, denn die Prozente beziehen sich dann auf den größeren Wert.`), E(Kn / (1 + (2 * p) / 100), false, 'Mit Zinseszins wird der Faktor zweimal angewendet, nicht der Prozentsatz verdoppelt.'), E(Kn / q, false, 'Das ist der Stand nach einem Jahr – es muss noch ein Jahr zurückgerechnet werden.'), E(Kn / q ** 3, false, 'Das ist ein Jahr zu weit zurückgerechnet.')]);
      if (!opts) continue;
      return { prompt: `Nach 2 Jahren mit ${fmt(p)} % Zinsen pro Jahr (mit Zinseszins) sind ${b6eu(Kn)} € auf dem Konto. Wie viel wurde am Anfang eingezahlt?`, options: shuffle(opts),
        hints: [`Wachstumsfaktor pro Jahr: ${tex(`1+${ft(p / 100, 3)}=${ft(q, 3)}`)}.`, `Für das Anfangskapital ${tex('K_0')} gilt: ${tex(`K_0\\cdot${ft(q, 3)}^2=${b6ex(Kn)}`)}.`, `${tex(`${ft(q, 3)}^2=${ft(q * q, 6)}`)}.`, `Umstellen: ${tex(`K_0=${b6ex(Kn)}:${ft(q * q, 6)}`)}.`],
        explain: `${tex(`K_0\\cdot${ft(q, 3)}^2=${b6ex(Kn)}`)}, also ${tex(`K_0=${b6ex(Kn)}:${ft(q * q, 6)}=${K0}`)} €.`, kind, r: K0 }; }
    if (kind === 'wechsel') { const K1 = pick([1500, 2400, 3600, 5000, 8000]), p1 = pick([1.5, 2, 2.5, 3]), p2 = pick([3.5, 4, 4.5, 5]), n1 = pick([2, 3]), n2 = pick([2, 3]), q1 = 1 + p1 / 100, q2 = 1 + p2 / 100, Z1 = K1 * q1 ** n1, r = Z1 * q2 ** n2;
      const opts = b6opts(E(r, true), [E(K1 * (1 + (n1 * p1 + n2 * p2) / 100), false, 'Hier wurden die Prozentsätze nur addiert – mit Zinseszins werden die Zinsen jedes Jahr mitverzinst.'), E(K1 * (1 + (p1 + p2) / 200) ** (n1 + n2), false, 'Ein gemittelter Zinssatz passt nicht: Jede Phase hat ihren eigenen Faktor und ihre eigene Dauer.'), E(Z1, false, 'Das ist erst der Stand nach der ersten Phase.'), n1 !== n2 ? E(K1 * q1 ** n2 * q2 ** n1, false, 'Die Laufzeiten der beiden Phasen sind vertauscht.') : null, E(K1 * q2 ** (n1 + n2), false, `In den ersten ${n1} Jahren gilt der kleinere Zinssatz.`)]);
      if (!opts) continue;
      return { prompt: `${gT(K1)} € werden zuerst ${n1} Jahre lang mit ${fmt(p1)} % verzinst, danach ${n2} Jahre lang mit ${fmt(p2)} % (jeweils mit Zinseszins). Wie hoch ist das Guthaben am Ende?`, options: shuffle(opts),
        hints: [`Zwei Wachstumsfaktoren: ${tex(ft(q1, 3))} für die erste Phase, ${tex(ft(q2, 3))} für die zweite.`, `Nach ${n1} Jahren: ${tex(`${K1}\\cdot${ft(q1, 3)}^{${n1}}\\approx${ft(Z1, 2)}`)} €.`, `Mit diesem Betrag geht es weiter: ${tex(`${ft(Z1, 2)}\\cdot${ft(q2, 3)}^{${n2}}`)}.`, `In einem Schritt: ${tex(`${K1}\\cdot${ft(q1, 3)}^{${n1}}\\cdot${ft(q2, 3)}^{${n2}}`)}.`],
        explain: `Erste Phase: ${tex(`${K1}\\cdot${ft(q1, 3)}^{${n1}}\\approx${ft(Z1, 2)}`)} €. Zweite Phase: ${tex(`${ft(Z1, 2)}\\cdot${ft(q2, 3)}^{${n2}}\\approx${ft(r, 2)}`)} €. Zusammen: ${tex(`${K1}\\cdot${ft(q1, 3)}^{${n1}}\\cdot${ft(q2, 3)}^{${n2}}\\approx${ft(r, 2)}`)} €.`, kind, r: +r.toFixed(2) }; }
    if (kind === 'satz') { const K0 = pick([800, 1200, 2000, 2400, 4000]), ps = pick([1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5]), qs = 1 + ps / 100, Kn = +(K0 * qs * qs).toFixed(2), v = Kn / K0;
      const opts = b6opts(Pz(ps, true), [Pz(((v - 1) * 100) / 2, false, 'Den Gesamtzuwachs einfach halbieren geht nicht: Im zweiten Jahr werden die Zinsen mitverzinst. Deshalb wird die Wurzel gezogen.'), Pz((v - 1) * 100, false, 'Das ist der Zuwachs in zwei Jahren zusammen – gefragt ist der Zinssatz pro Jahr.'), Pz(ps * 2, false, 'Der Zinssatz gilt pro Jahr – rechne über den Wachstumsfaktor.'), Pz((Math.sqrt(v) - 1) * 10, false, `Aus dem Faktor ${tex(ft(qs, 3))} wird der Prozentsatz: ${tex(`(${ft(qs, 3)}-1)\\cdot 100`)}.`)]);
      if (!opts) continue;
      return { prompt: `Ein Guthaben von ${gT(K0)} € ist in 2 Jahren bei gleichbleibendem Zinssatz (mit Zinseszins) auf ${b6eu(Kn)} € gewachsen. Wie hoch war der Zinssatz pro Jahr?`, options: shuffle(opts),
        hints: [`Mit dem Wachstumsfaktor ${tex('q')} gilt: ${tex(`${K0}\\cdot q^2=${b6ex(Kn)}`)}.`, `Durch das Anfangskapital teilen: ${tex(`q^2=${b6ex(Kn)}:${K0}=${ft(v, 6)}`)}.`, `Wurzel ziehen: ${tex(`q=\\sqrt{${ft(v, 6)}}=${ft(qs, 3)}`)}.`, `Aus dem Faktor wird der Zinssatz: ${tex(`(${ft(qs, 3)}-1)\\cdot 100`)}.`],
        explain: `${tex(`q^2=${b6ex(Kn)}:${K0}=${ft(v, 6)}`)}, also ${tex(`q=\\sqrt{${ft(v, 6)}}=${ft(qs, 3)}`)}. Das sind ${tex(`(${ft(qs, 3)}-1)\\cdot 100=${ft(ps)}`)} % pro Jahr.`, kind, r: ps }; }
    if (kind === 'dauer') { const pd = pick([2.5, 3, 4, 5, 6, 8]), qd = 1 + pd / 100, K0 = pick([1000, 2000, 5000, 8000]), fz = pick([1.5, 2, 2.5]), Z = K0 * fz, x = Math.log(fz) / Math.log(qd), n = Math.ceil(x); if (Math.abs(x - Math.round(x)) < 0.02) continue;
      const lin = Math.ceil(((fz - 1) * 100) / pd);
      const opts = b6opts(J(n, true), [J(n - 1, false, `Nach ${n - 1} Jahren sind es erst ${tex(`${K0}\\cdot${ft(qd, 3)}^{${n - 1}}\\approx${ft(K0 * qd ** (n - 1), 2)}`)} € – das reicht noch nicht.`), J(lin, false, 'Das gilt ohne Zinseszins. Weil die Zinsen mitverzinst werden, geht es schneller.'), J(n + 1, false, `Schon nach ${n} Jahren ist der Betrag erreicht.`), J(n + 2, false, `Schon nach ${n} Jahren ist der Betrag erreicht.`)]);
      if (!opts) continue;
      return { prompt: `${gT(K0)} € werden mit ${fmt(pd)} % pro Jahr verzinst (mit Zinseszins). Nach wie vielen vollen Jahren sind zum ersten Mal mindestens ${gT(Z)} € auf dem Konto?`, options: shuffle(opts),
        hints: [`Ansatz mit dem Wachstumsfaktor ${tex(ft(qd, 3))}: ${tex(`${K0}\\cdot${ft(qd, 3)}^n\\ge${Z}`)}.`, `Durch das Anfangskapital teilen: ${tex(`${ft(qd, 3)}^n\\ge${ft(fz)}`)}.`, `Logarithmieren (Logarithmus auf beiden Seiten): ${tex(`n\\ge\\dfrac{\\log ${ft(fz)}}{\\log ${ft(qd, 3)}}\\approx${ft(x, 2)}`)}.`, 'Auf volle Jahre aufrunden – und mit einer Probe absichern.'],
        explain: `${tex(`${ft(qd, 3)}^n\\ge${ft(fz)}`)}, mit dem Logarithmus ${tex(`n\\ge\\dfrac{\\log ${ft(fz)}}{\\log ${ft(qd, 3)}}\\approx${ft(x, 2)}`)}, also ${n} volle Jahre. Probe: ${tex(`${K0}\\cdot${ft(qd, 3)}^{${n - 1}}\\approx${ft(K0 * qd ** (n - 1), 2)}`)} € reicht noch nicht, ${tex(`${K0}\\cdot${ft(qd, 3)}^{${n}}\\approx${ft(K0 * qd ** n, 2)}`)} € reicht.`, kind, r: n }; }
    const n = kind === 'ein' || kind === 'einab' ? 1 : kind === 'zwei' ? 2 : 3, ab = kind === 'abnahme' || kind === 'einab', f = ab ? 1 - p / 100 : q, r = K * f ** n;
    const opts = b6opts(E(r, true), [n === 1 ? E((K * p) / 100, false, ab ? 'Das ist nur der Wertverlust. Gefragt ist der Wert danach.' : 'Das sind nur die Zinsen. Gefragt ist das ganze Guthaben.') : E(K * (1 + ((ab ? -1 : 1) * n * p) / 100), false, ab ? 'Der Verlust bezieht sich jedes Jahr auf den <b>neuen</b>, kleineren Wert – nicht immer auf den Anfangswert.' : 'Ab dem zweiten Jahr werden auch die Zinsen der Vorjahre mitverzinst (Zinseszins).'), E(K + (ab ? -1 : 1) * n * p, false, `${fmt(p)} % sind nicht ${fmt(p)} €.`), E(ab ? K * q ** n : K * (1 - p / 100) ** n, false, ab ? 'Der Wert nimmt ab – der Faktor ist kleiner als 1.' : 'Der Wert wächst – der Faktor ist größer als 1.'), n > 1 ? E(K * f ** (n - 1), false, `Das ist der Stand nach ${n - 1} ${n === 2 ? 'Jahr' : 'Jahren'} – ein Jahr fehlt noch.`) : null]);
    if (!opts) continue;
    const pot = n > 1 ? `^{${n}}` : '';
    return { prompt: ab ? `Ein Auto kostet ${gT(K * 10)} € und verliert jedes Jahr ${fmt(p)} % an Wert. Wie viel ist es nach ${n === 1 ? 'einem Jahr' : `${n} Jahren`} noch wert?`.replace(`${gT(K * 10)} €`, `${gT(K)} €`) : `${K} € werden mit ${fmt(p)} % pro Jahr verzinst${n > 1 ? ' (mit Zinseszins)' : ''}. Wie hoch ist das Guthaben nach ${n === 1 ? 'einem Jahr' : `${n} Jahren`}?`, options: shuffle(opts),
      hints: n === 1 ? [`Faktor für ein Jahr: ${tex(`1${ab ? '-' : '+'}${ft(p / 100, 3)}=${ft(f, 3)}`)}.`, `${tex(`${K}\\cdot${ft(f, 3)}`)}.`, `Oder in zwei Schritten: erst ${fmt(p)} % von ${gT(K)} € ausrechnen, dann ${ab ? 'abziehen' : 'addieren'}.`] : [`Faktor pro Jahr: ${tex(`1${ab ? '-' : '+'}${ft(p / 100, 3)}=${ft(f, 3)}`)}.`, `Jedes Jahr wird damit malgenommen: ${tex(`${K}\\cdot${ft(f, 3)}${pot}`)}.`, `${tex(`${ft(f, 3)}${pot}=${ft(f ** n, 6)}`)}.`],
      explain: n === 1 ? `Faktor ${tex(`1${ab ? '-' : '+'}${ft(p / 100, 3)}=${ft(f, 3)}`)}, also ${tex(`${K}\\cdot${ft(f, 3)}=${ft(r, 2)}`)} €.` : `${tex(`${K}\\cdot${ft(f, 3)}${pot}=${K}\\cdot${ft(f ** n, 6)}`)} ${tex(`${Math.abs(+r.toFixed(2) - r) < 1e-9 ? '=' : '\\approx'}${ft(r, 2)}`)} €.`, kind, r: +r.toFixed(2) };
  }
}

/** Quader und Würfel: Rauminhalt, Oberfläche, fehlende Kante, zusammengesetzte Körper. */
export function genQuader(lv = 3) {
  const L5 = b6L(lv), kind = pick([['quader'], ['wuerfel', 'wuerfelo'], ['kante', 'oberflaeche', 'doppel'], ['liter', 'orueck'], ['stein', 'kiste']][L5 - 1]);
  for (;;) {
    const a = ri(2, 9), b = ri(2, 8), c = ri(2, 7);
    const V = (num, cc, w) => b6M(num, cc, w, 'cm³'), F = (num, cc, w) => b6M(num, cc, w, 'cm²'), L = (num, cc, w) => b6M(num, cc, w, 'cm');
    let prompt, opts, hints, explain;
    if (kind === 'quader') { prompt = `Ein Quader ist ${a} cm lang, ${b} cm breit und ${c} cm hoch. Wie groß ist sein Rauminhalt?`;
      opts = [V(a * b * c, true), V(a + b + c, false, 'Die drei Kantenlängen werden malgenommen, nicht addiert.'), V(2 * (a * b + a * c + b * c), false, 'Das ist die Maßzahl der Oberfläche.'), V(a * b, false, 'Das ist nur die Grundfläche – die Höhe fehlt.')];
      hints = ['Rauminhalt eines Quaders: Länge mal Breite mal Höhe.', `${tex(`${a}\\cdot${b}\\cdot${c}`)}.`]; explain = `${tex(`V=${a}\\cdot${b}\\cdot${c}=${a * b * c}\\,\\text{cm}^3`)}.`; }
    else if (kind === 'wuerfel') { if (a <= 3) continue; prompt = `Ein Würfel hat die Kantenlänge ${a} cm. Wie groß ist sein Rauminhalt?`;
      opts = [V(a ** 3, true), V(3 * a, false, 'Hoch 3 heißt: dreimal mit sich selbst malnehmen, nicht mal 3.'), V(a * a, false, 'Das ist die Fläche einer Seite – die dritte Kante fehlt.'), V(6 * a * a, false, 'Das ist die Maßzahl der Oberfläche (sechs Quadrate).')];
      hints = ['Beim Würfel sind alle Kanten gleich lang.', `${tex(`${a}\\cdot${a}\\cdot${a}`)}.`]; explain = `${tex(`V=${a}^3=${a}\\cdot${a}\\cdot${a}=${a ** 3}\\,\\text{cm}^3`)}.`; }
    else if (kind === 'wuerfelo') { if (a <= 3 || a === 6) continue; prompt = `Ein Würfel hat die Kantenlänge ${a} cm. Wie groß ist seine Oberfläche?`;
      opts = [F(6 * a * a, true), F(a ** 3, false, 'Das ist die Maßzahl des Rauminhalts.'), F(4 * a * a, false, 'Ein Würfel hat sechs Flächen – auch oben und unten.'), F(6 * a, false, 'Jede Fläche ist ein Quadrat: Kante mal Kante.')];
      hints = ['Ein Würfel hat sechs gleich große Quadrate als Flächen.', `Ein Quadrat: ${tex(`${a}\\cdot${a}=${a * a}`)}.`, `${tex(`6\\cdot${a * a}`)}.`]; explain = `${tex(`O=6\\cdot${a}^2=6\\cdot${a * a}=${6 * a * a}\\,\\text{cm}^2`)}.`; }
    else if (kind === 'oberflaeche') { if (a === b || b === c || a === c) continue; prompt = `Ein Quader ist ${a} cm lang, ${b} cm breit und ${c} cm hoch. Wie groß ist seine Oberfläche?`;
      opts = [F(2 * (a * b + a * c + b * c), true), F(a * b + a * c + b * c, false, 'Jede der drei Flächen kommt zweimal vor (vorn und hinten, links und rechts, oben und unten).'), F(a * b * c, false, 'Das ist die Maßzahl des Rauminhalts.'), F(6 * a * b, false, 'Die sechs Flächen sind nicht alle gleich groß – das gilt nur beim Würfel.')];
      hints = ['Ein Quader hat sechs Flächen – je zwei sind gleich.', `Die drei verschiedenen Flächen: ${tex(`${a}\\cdot${b}=${a * b}`)}, ${tex(`${a}\\cdot${c}=${a * c}`)}, ${tex(`${b}\\cdot${c}=${b * c}`)}.`, `${tex(`2\\cdot(${a * b}+${a * c}+${b * c})`)}.`]; explain = `${tex(`O=2\\cdot(${a * b}+${a * c}+${b * c})=2\\cdot${a * b + a * c + b * c}`)} ${tex(`=${2 * (a * b + a * c + b * c)}\\,\\text{cm}^2`)}.`; }
    else if (kind === 'kante') { const vol = a * b * c; prompt = `Ein Quader hat den Rauminhalt ${vol} cm³. Er ist ${a} cm lang und ${b} cm breit. Wie hoch ist er?`;
      opts = b6opts(L(c, true), [L(vol / a, false, 'Auch durch die Breite muss noch geteilt werden.'), L(vol - a - b, false, 'Der Rauminhalt ist ein Produkt – also wird geteilt, nicht abgezogen.'), L(vol / (a + b), false, 'Geteilt wird durch die Grundfläche: Länge <b>mal</b> Breite.'), L(vol / b, false, 'Auch durch die Länge muss noch geteilt werden.')]);
      hints = ['Höhe = Rauminhalt durch Grundfläche.', `Grundfläche: ${tex(`${a}\\cdot${b}=${a * b}`)}.`]; explain = `Grundfläche ${tex(`${a}\\cdot${b}=${a * b}`)}, also ${tex(`h=${vol}:${a * b}=${c}\\,\\text{cm}`)}.`; }
    else if (kind === 'doppel') { const k = ri(2, 5); prompt = `Auf einem Quader (${a} cm lang, ${b} cm breit, ${c} cm hoch) steht ein Würfel mit der Kantenlänge ${k} cm. Wie groß ist der Rauminhalt des ganzen Körpers?`;
      opts = b6opts(V(a * b * c + k ** 3, true), [V(a * b * c + 3 * k, false, 'Hoch 3 heißt: dreimal mit sich selbst malnehmen, nicht mal 3.'), V(a * b * c + k * k, false, 'Der Würfel hat drei Kanten: Kante mal Kante mal Kante.'), V(a * b * c * k ** 3, false, 'Die beiden Rauminhalte werden addiert, nicht malgenommen.'), V(a * b * c, false, 'Das ist nur der Quader – der Würfel fehlt.')]);
      hints = ['Berechne beide Körper einzeln und addiere.', `Quader: ${tex(`${a}\\cdot${b}\\cdot${c}=${a * b * c}`)}.`, `Würfel: ${tex(`${k}^3=${k ** 3}`)}.`]; explain = `Quader: ${tex(`${a}\\cdot${b}\\cdot${c}=${a * b * c}`)}. Würfel: ${tex(`${k}^3=${k ** 3}`)}. Zusammen: ${tex(`${a * b * c}+${k ** 3}=${a * b * c + k ** 3}\\,\\text{cm}^3`)}.`; }
    else if (kind === 'orueck') { const k = ri(3, 12), O = 6 * k * k; prompt = `Ein Würfel hat die Oberfläche ${O} cm². Wie groß ist sein Rauminhalt?`;
      opts = b6opts(V(k ** 3, true), [V(O / 6, false, 'Das ist die Maßzahl einer Seitenfläche – gefragt ist der Rauminhalt.'), V(k * k * 3, false, 'Hoch 3 heißt: dreimal mit sich selbst malnehmen – nicht die Seitenfläche mal 3.'), V(6 * k ** 3, false, 'Die Sechs gehört zur Oberfläche (sechs Flächen), nicht zum Rauminhalt.'), V(k, false, 'Das ist die Maßzahl der Kantenlänge – gefragt ist der Rauminhalt.')]);
      hints = [`Die Oberfläche besteht aus sechs gleichen Quadraten: ${tex(`${O}:6=${k * k}`)} cm² je Fläche.`, `Kantenlänge: Welche Zahl ergibt mit sich selbst malgenommen ${k * k}? ${tex(`\\sqrt{${k * k}}=${k}`)}.`, `Rauminhalt: ${tex(`${k}^3`)}.`]; explain = `Eine Fläche: ${tex(`${O}:6=${k * k}`)}. Kante: ${tex(`\\sqrt{${k * k}}=${k}`)}. Rauminhalt: ${tex(`${k}^3=${k ** 3}\\,\\text{cm}^3`)}.`; }
    else if (kind === 'liter') { const la = ri(6, 24) * 5, lb = ri(4, 12) * 5, lc = ri(5, 12) * 5, rd = pick([3, 4, 5, 6, 8]), h = lc - rd, vol = la * lb * h, Li = (num, cc, w) => b6M(num, cc, w, 'l', 3); if (la <= lb) continue;
      prompt = `Ein Aquarium ist innen ${la} cm lang, ${lb} cm breit und ${lc} cm hoch. Es wird bis ${rd} cm unter den Rand mit Wasser gefüllt. Wie viele Liter Wasser sind das?`;
      opts = b6opts(Li(vol / 1000, true), [Li((la * lb * lc) / 1000, false, `Das Wasser steht nur ${h} cm hoch – nicht bis zum Rand.`), Li(vol / 100, false, 'Ein Liter sind 1000 cm³, nicht 100.'), Li((la * lb * rd) / 1000, false, 'Das ist der leere Teil über dem Wasser.'), Li(vol / 10, false, 'Ein Liter sind 1000 cm³.')]);
      hints = [`Wasserhöhe: ${tex(`${lc}-${rd}=${h}`)} cm.`, `Rauminhalt des Wassers: ${tex(`${la}\\cdot${lb}\\cdot${h}=${gX(vol)}`)} cm³.`, `Ein Liter ist ein Würfel mit 10 cm Kantenlänge, also ${tex('10\\cdot10\\cdot10=1000')} cm³.`]; explain = `Wasserhöhe ${tex(`${lc}-${rd}=${h}`)} cm. ${tex(`V=${la}\\cdot${lb}\\cdot${h}=${gX(vol)}\\,\\text{cm}^3`)}. In Litern: ${tex(`${gX(vol)}:1000=${ft(vol / 1000, 3)}`)}.`; }
    else if (kind === 'stein') { const la = ri(6, 16) * 5, lb = ri(4, 10) * 5, h1 = ri(12, 30), x = ri(6, 18), y = ri(5, 14), z = ri(4, 10), Vs = x * y * z, G = la * lb, st = Vs / G; if (la <= lb || x >= lb || z >= h1 || !Number.isInteger(+(st * 100).toFixed(6)) || Number.isInteger(st)) continue;
      prompt = `In einem Aquarium mit der Grundfläche ${la} cm mal ${lb} cm steht das Wasser ${h1} cm hoch. Ein quaderförmiger Stein (${x} cm mal ${y} cm mal ${z} cm) wird ganz untergetaucht; es läuft kein Wasser über. Wie hoch steht das Wasser danach?`;
      opts = b6opts(L(h1 + st, true), [L(st, false, `Das ist nur der Anstieg – er kommt zu den ${h1} cm dazu.`), L(h1 + z, false, 'Der Wasserspiegel steigt nicht um die Höhe des Steins: Das verdrängte Wasser verteilt sich auf die ganze Grundfläche.'), L(h1 + Vs / (la + lb), false, 'Geteilt wird durch die Grundfläche: Länge <b>mal</b> Breite.'), L(h1 + Vs / 1000, false, 'Geteilt wird durch die Grundfläche des Aquariums, nicht durch 1000.'), L(h1 + Vs / (G * h1), false, 'Geteilt wird nur durch die Grundfläche, nicht durch den ganzen Wasserinhalt.')]);
      hints = [`Der Stein verdrängt so viel Wasser, wie er selbst Raum einnimmt: ${tex(`${x}\\cdot${y}\\cdot${z}=${Vs}`)} cm³.`, `Dieses Wasser verteilt sich auf die Grundfläche ${tex(`${la}\\cdot${lb}=${G}`)} cm².`, `Anstieg = verdrängter Rauminhalt durch Grundfläche: ${tex(`${Vs}:${G}=${ft(st)}`)} cm.`, `Neuer Wasserstand: ${tex(`${h1}+${ft(st)}`)}.`];
      explain = `Stein: ${tex(`${x}\\cdot${y}\\cdot${z}=${Vs}\\,\\text{cm}^3`)}. Grundfläche: ${tex(`${la}\\cdot${lb}=${G}\\,\\text{cm}^2`)}. Anstieg: ${tex(`${Vs}:${G}=${ft(st)}\\,\\text{cm}`)}. Neuer Stand: ${tex(`${h1}+${ft(st)}=${ft(h1 + st)}\\,\\text{cm}`)}.`; }
    else { const la = ri(30, 60), lb = ri(20, 40), lc = ri(15, 35), w = pick([1, 1.5, 2, 2.5]), ia = la - 2 * w, ib = lb - 2 * w, ic = lc - w, au = la * lb * lc, inn = ia * ib * ic; if (la <= lb) continue;
      prompt = `Eine oben offene Holzkiste ist außen ${la} cm lang, ${lb} cm breit und ${lc} cm hoch. Boden und Wände sind überall ${fmt(w)} cm dick. Wie viel Holz steckt in der Kiste (Rauminhalt des Holzes)?`;
      opts = b6opts(V(au - inn, true), [V(au - (la - w) * (lb - w) * ic, false, 'Wände gibt es auf <b>beiden</b> Seiten: Länge und Breite verlieren zweimal die Wandstärke.'), V(au - ia * ib * (lc - 2 * w), false, 'Die Kiste ist oben offen – in der Höhe geht nur der Boden ab.'), V(inn, false, 'Das ist der Innenraum, nicht das Holz.'), V(au, false, 'Das wäre ein massiver Holzklotz – der Innenraum muss abgezogen werden.')]);
      hints = [`Innenmaße: Länge und Breite verlieren zweimal die Wandstärke, die Höhe nur einmal (oben offen): ${tex(`${la}-2\\cdot${ft(w)}=${ft(ia)}`)}, ${tex(`${lb}-2\\cdot${ft(w)}=${ft(ib)}`)}, ${tex(`${lc}-${ft(w)}=${ft(ic)}`)}.`, `Außen: ${tex(`${la}\\cdot${lb}\\cdot${lc}=${gX(au)}`)} cm³.`, `Innen: ${tex(`${ft(ia)}\\cdot${ft(ib)}\\cdot${ft(ic)}=${b6X(inn)}`)} cm³.`, 'Holz = außen minus innen.'];
      explain = `Innenmaße ${tex(`${ft(ia)}\\,\\text{cm}`)}, ${tex(`${ft(ib)}\\,\\text{cm}`)} und ${tex(`${ft(ic)}\\,\\text{cm}`)}. Außen: ${tex(`${la}\\cdot${lb}\\cdot${lc}=${gX(au)}`)}. Innen: ${tex(`${ft(ia)}\\cdot${ft(ib)}\\cdot${ft(ic)}=${b6X(inn)}`)}. Holz: ${tex(`${gX(au)}-${b6X(inn)}=${b6X(+(au - inn).toFixed(4))}\\,\\text{cm}^3`)}.`; }
    if (!opts || !gut(opts)) continue;
    return { prompt, options: shuffle(opts), hints, explain, kind };
  }
}

/** Körper mit Kreis und Spitze: Rauminhalt von Prisma, Zylinder, Kegel, Pyramide, Kugel. */
export function genKoerper(lv = 3) {
  for (;;) {
    const kind = pick(tier(lv, ['zylinder'], ['zylinder', 'prisma'], ['kegel', 'pyramide', 'zylinder'], ['kugel', 'kegel', 'pyramide'], ['durchmesser', 'kugel', 'kegel']));
    const a = ri(2, 9), c = ri(2, 7), r = ri(3, 6), hh = pick([3, 6, 9, 12]);
    const V = (num, cc, w) => N(num, cc, w, `${ft(num)}\\,\\text{cm}^3`);
    const P = (k, cc, w) => ({ tex: `${ft(k, 2)}\\,\\pi\\,\\text{cm}^3`, num: +k.toFixed(6), correct: cc, why: w });
    let prompt, opts, hints, explain;
    if (kind === 'prisma') { const g = ri(3, 9), h2 = pick([2, 4, 6, 8]); prompt = `Ein Prisma hat als Grundfläche ein Dreieck (Grundseite ${g} cm, Höhe ${h2} cm) und ist ${c} cm hoch. Wie groß ist sein Rauminhalt?`;
      opts = [V((g * h2 * c) / 2, true), V(g * h2 * c, false, 'Die Fläche eines Dreiecks ist die <b>Hälfte</b> von Grundseite mal Höhe.'), V((g * h2 * c) / 6, false, 'Das Drittel gehört zur Pyramide. Beim Prisma gilt: Grundfläche mal Höhe.'), V((g * h2) / 2, false, 'Das ist nur die Grundfläche – die Höhe des Prismas fehlt.')];
      hints = ['Prisma: Grundfläche mal Höhe.', `Grundfläche: ${tex(`\\tfrac12\\cdot${g}\\cdot${h2}=${(g * h2) / 2}`)}.`]; explain = `${tex(`V=${(g * h2) / 2}\\cdot${c}=${(g * h2 * c) / 2}\\,\\text{cm}^3`)}.`; }
    else if (kind === 'zylinder') { prompt = `Ein Zylinder hat den Radius ${r} cm und die Höhe ${hh} cm. Wie groß ist sein Rauminhalt?`;
      opts = [P(r * r * hh, true), P(2 * r * hh, false, 'Das gehört zur Mantelfläche. Die Grundfläche ist ein Kreis: π mal Radius hoch 2.'), P((r * r * hh) / 3, false, 'Das Drittel gehört zum Kegel. Beim Zylinder gilt: Grundfläche mal Höhe.'), P(r * hh, false, 'Der Radius wird quadriert.')];
      hints = ['Zylinder: Kreisfläche mal Höhe.', `${tex(`\\pi\\cdot${r}^2\\cdot${hh}`)}.`]; explain = `${tex(`V=\\pi\\cdot${r}^2\\cdot${hh}=${r * r * hh}\\,\\pi\\approx${ft(Math.PI * r * r * hh, 1)}\\,\\text{cm}^3`)}.`; }
    else if (kind === 'kegel') { prompt = `Ein Kegel hat den Radius ${r} cm und die Höhe ${hh} cm. Wie groß ist sein Rauminhalt?`;
      opts = [P((r * r * hh) / 3, true), P(r * r * hh, false, 'Das ist der Zylinder mit derselben Grundfläche und Höhe. Der Kegel hat ein Drittel davon.'), P((r * hh) / 3, false, 'Der Radius wird quadriert.'), P((2 * r * hh) / 3, false, 'Die Grundfläche ist π mal Radius hoch 2, nicht 2 mal Radius.')];
      hints = ['Kegel: ein Drittel von Grundfläche mal Höhe.', `${tex(`\\tfrac13\\cdot\\pi\\cdot${r}^2\\cdot${hh}`)}.`]; explain = `${tex(`V=\\tfrac13\\cdot\\pi\\cdot${r}^2\\cdot${hh}=${ft((r * r * hh) / 3)}\\,\\pi\\,\\text{cm}^3`)}.`; }
    else if (kind === 'pyramide') { prompt = `Eine Pyramide hat eine quadratische Grundfläche mit der Seitenlänge ${a} cm und ist ${hh} cm hoch. Wie groß ist ihr Rauminhalt?`;
      opts = [V((a * a * hh) / 3, true), V(a * a * hh, false, 'Das ist der Quader mit derselben Grundfläche und Höhe. Die Pyramide hat ein Drittel davon.'), V((a * a * hh) / 2, false, 'Bei der Pyramide ist es ein Drittel, nicht die Hälfte.'), V((a * hh) / 3, false, 'Die Grundfläche ist Seite mal Seite.')];
      hints = ['Pyramide: ein Drittel von Grundfläche mal Höhe.', `${tex(`\\tfrac13\\cdot${a}^2\\cdot${hh}`)}.`]; explain = `${tex(`V=\\tfrac13\\cdot${a * a}\\cdot${hh}=${(a * a * hh) / 3}\\,\\text{cm}^3`)}.`; }
    else { const dm = kind === 'durchmesser', R = pick([3, 6, 9]), v = (4 * R ** 3) / 3; prompt = `Eine Kugel hat den ${dm ? `Durchmesser ${2 * R}` : `Radius ${R}`} cm. Wie groß ist ihr Rauminhalt?`;
      opts = [P(v, true), dm ? P((4 * (2 * R) ** 3) / 3, false, 'In die Formel gehört der Radius – die Hälfte des Durchmessers.') : P(4 * R * R, false, 'Das ist die Maßzahl der Oberfläche der Kugel.'), P(R ** 3, false, 'Der Faktor vier Drittel fehlt.'), P((4 * R * R) / 3, false, 'Der Radius steht hoch 3 – es ist ein Rauminhalt.')];
      hints = [`Kugel: ${tex('V=\\tfrac43\\,\\pi\\,r^3')}.`, `${tex(`\\tfrac43\\cdot\\pi\\cdot${R}^3`)}.`]; explain = `${tex(`V=\\tfrac43\\cdot\\pi\\cdot${R}^3=${v}\\,\\pi\\approx${ft(Math.PI * v, 1)}\\,\\text{cm}^3`)}.`; }
    if (!gut(opts)) continue;
    return { prompt, options: shuffle(opts), hints, explain, kind };
  }
}

/* ───────────── Weitere Themen der Klassen 7 bis 10 ───────────── */

/** Winkel: Nebenwinkel, Scheitelwinkel, Winkelsumme im Dreieck und Viereck, gleichschenklige Dreiecke. */
export function genWinkel(lv = 3) {
  for (;;) {
    const kind = pick(tier(lv, ['neben'], ['neben', 'scheitel', 'dreieck'], ['dreieck', 'gleichschenklig'], ['gleichschenklig', 'viereck', 'aussen'], ['viereck', 'aussen', 'basis']));
    const W = (num, c, w) => N(num, c, w, `${ft(num)}^\\circ`), al = ri(4, 14) * 5, be = ri(4, 14) * 5;
    let prompt, opts, hints, explain;
    if (kind === 'neben') { prompt = `Zwei Winkel liegen nebeneinander an einer Geraden. Der eine ist ${al}° groß. Wie groß ist der andere (der Nebenwinkel)?`;
      opts = [W(180 - al, true), W(al, false, 'Gleich groß sind Scheitelwinkel – sie liegen sich gegenüber. Nebenwinkel ergänzen sich zu 180°.'), W(90 - al > 0 ? 90 - al : 360 - al, false, 'Eine Gerade bildet einen gestreckten Winkel von 180°.'), W(180 + al, false, 'Die beiden Winkel ergeben zusammen 180° – der gegebene wird abgezogen.')];
      hints = ['Nebenwinkel ergänzen sich zu einem gestreckten Winkel.', `${tex(`180^\\circ-${al}^\\circ`)}.`]; explain = `${tex(`180^\\circ-${al}^\\circ=${180 - al}^\\circ`)}.`; if (al === 90) continue; }
    else if (kind === 'scheitel') { prompt = `Zwei Geraden schneiden sich. Ein Winkel ist ${al}° groß. Wie groß ist der Winkel, der ihm gegenüberliegt (der Scheitelwinkel)?`;
      opts = [W(al, true), W(180 - al, false, 'Das ist der Nebenwinkel. Scheitelwinkel liegen sich gegenüber und sind gleich groß.'), W(360 - al, false, 'Scheitelwinkel sind gleich groß.'), W(2 * al, false, 'Scheitelwinkel sind gleich groß – nicht doppelt so groß.')];
      hints = ['Scheitelwinkel liegen sich an einer Kreuzung gegenüber.', 'Sie sind immer gleich groß.']; explain = `Scheitelwinkel sind gleich groß: ${tex(`${al}^\\circ`)}.`; if (al === 90 || al === 60) continue; }
    else if (kind === 'dreieck') { if (al + be >= 170) continue; const g = 180 - al - be; prompt = `In einem Dreieck sind zwei Winkel ${al}° und ${be}° groß. Wie groß ist der dritte?`;
      opts = [W(g, true), W(360 - al - be, false, 'Im Dreieck ist die Winkelsumme 180°, nicht 360°.'), W(al + be, false, 'Das ist die Summe der beiden gegebenen Winkel – sie wird von 180° abgezogen.'), W(180 - al, false, 'Auch der zweite Winkel muss abgezogen werden.')];
      hints = ['Alle drei Winkel eines Dreiecks ergeben zusammen 180°.', `${tex(`180^\\circ-${al}^\\circ-${be}^\\circ`)}.`]; explain = `${tex(`180^\\circ-${al}^\\circ-${be}^\\circ=${g}^\\circ`)}.`; }
    else if (kind === 'gleichschenklig') { const b = ri(5, 16) * 5, s = 180 - 2 * b; prompt = `Ein gleichschenkliges Dreieck hat zwei Basiswinkel von je ${b}°. Wie groß ist der Winkel an der Spitze?`;
      opts = [W(s, true), W(180 - b, false, 'Es gibt zwei gleich große Basiswinkel – beide werden abgezogen.'), W(b, false, 'Gleich groß sind nur die beiden Basiswinkel.'), W(90 - b > 0 ? 90 - b : 360 - 2 * b, false, 'Die Winkelsumme im Dreieck ist 180°.')];
      hints = ['Im gleichschenkligen Dreieck sind die beiden Basiswinkel gleich groß.', `${tex(`180^\\circ-2\\cdot${b}^\\circ`)}.`]; explain = `${tex(`180^\\circ-2\\cdot${b}^\\circ=${s}^\\circ`)}.`; if (s <= 0 || b === 60) continue; }
    else if (kind === 'basis') { const s = ri(2, 15) * 10, b = (180 - s) / 2; prompt = `Ein gleichschenkliges Dreieck hat an der Spitze einen Winkel von ${s}°. Wie groß ist jeder Basiswinkel?`;
      opts = [W(b, true), W(180 - s, false, 'Das ist die Summe beider Basiswinkel – sie wird noch halbiert.'), W(s, false, 'Gleich groß sind die beiden Basiswinkel untereinander, nicht der Winkel an der Spitze.'), W((360 - s) / 2, false, 'Die Winkelsumme im Dreieck ist 180°.')];
      hints = ['Die beiden Basiswinkel sind gleich groß.', `Zusammen bleiben ${tex(`180^\\circ-${s}^\\circ`)} für beide.`]; explain = `${tex(`(180^\\circ-${s}^\\circ):2=${ft(b)}^\\circ`)}.`; if (s === 60) continue; }
    else if (kind === 'viereck') { const ga = ri(12, 24) * 5, d = 360 - al - be - ga; if (d < 30 || d > 160) continue; prompt = `In einem Viereck sind drei Winkel ${al}°, ${be}° und ${ga}° groß. Wie groß ist der vierte?`;
      opts = [W(d, true), W(180 - al - be > 0 ? 180 - al - be : 540 - al - be - ga, false, 'Im Viereck ist die Winkelsumme 360°.'), W(al + be + ga - 180, false, 'Die drei Winkel werden von 360° abgezogen.'), W(360 - al - be, false, 'Auch der dritte Winkel muss abgezogen werden.')];
      hints = ['Ein Viereck lässt sich in zwei Dreiecke zerlegen: 2 mal 180°.', `${tex(`360^\\circ-${al}^\\circ-${be}^\\circ-${ga}^\\circ`)}.`]; explain = `${tex(`360^\\circ-${al + be + ga}^\\circ=${d}^\\circ`)}.`; }
    else { if (al + be >= 170) continue; prompt = `In einem Dreieck sind zwei Innenwinkel ${al}° und ${be}° groß. Wie groß ist der Außenwinkel am dritten Eckpunkt?`;
      opts = [W(al + be, true), W(180 - al - be, false, 'Das ist der dritte Innenwinkel. Der Außenwinkel ist sein Nebenwinkel.'), W(360 - al - be, false, 'Der Außenwinkel ergänzt den dritten Innenwinkel zu 180°.'), W(180 - al, false, 'Der Außenwinkel ist so groß wie die beiden anderen Innenwinkel zusammen.')];
      hints = ['Der Außenwinkel ist der Nebenwinkel des dritten Innenwinkels.', `Dritter Innenwinkel: ${tex(`${180 - al - be}^\\circ`)}.`]; explain = `Der Außenwinkel ist so groß wie die beiden anderen Innenwinkel zusammen: ${tex(`${al}^\\circ+${be}^\\circ=${al + be}^\\circ`)}.`; if (al + be === 90) continue; }
    if (!gut(opts) || opts.some((o) => o.num <= 0 || o.num >= 360)) continue;
    return { prompt, options: shuffle(opts), hints, explain, kind };
  }
}

const gl = (a, b, c) => `${a === 1 ? '' : a === -1 ? '-' : a}x${b < 0 ? '-' : '+'}${Math.abs(b) === 1 ? '' : Math.abs(b)}y=${c}`;
/** Lineare Gleichungssysteme mit zwei Unbekannten. */
export function genLGS(lv = 3) {
  for (;;) {
    const x0 = ri(lv >= 4 ? -4 : 1, 6), y0 = ri(lv >= 4 ? -4 : 1, 6);
    const [a1, b1, a2, b2] = tier(lv, [1, 1, 1, -1], pick([[1, 1, 1, -1], [1, 2, 1, -1], [2, 1, 1, -1]]), pick([[2, 1, 1, -1], [1, 2, 3, -2], [3, 1, 1, 2]]), pick([[2, 3, 1, -2], [3, 2, 2, -1], [1, 4, 3, -2]]), pick([[3, 4, 2, -3], [5, 2, 3, -4], [2, 5, 4, -3]]));
    if (x0 === y0 || x0 === 0 || y0 === 0) continue;
    const c1 = a1 * x0 + b1 * y0, c2 = a2 * x0 + b2 * y0, loest = (x, y) => a1 * x + b1 * y === c1 && a2 * x + b2 * y === c2;
    const O = (x, y, correct, why) => ({ tex: `x=${x},\\ y=${y}`, x, y, num: x * 100 + y, correct, why });
    const opts = [O(x0, y0, true), O(y0, x0, false, `${tex('x')} und ${tex('y')} sind vertauscht – mach die Probe in beiden Gleichungen.`), O(x0 + b1, y0 - a1, false, 'Dieses Paar erfüllt nur die erste Gleichung. Die Lösung muss in <b>beide</b> passen.'), O(x0, -y0, false, 'Ein Vorzeichen stimmt nicht – mach die Probe in der zweiten Gleichung.')];
    if (!uniq(opts) || opts.slice(1).some((o) => loest(o.x, o.y))) continue;
    return { prompt: 'Welches Zahlenpaar löst das Gleichungssystem?', formula: `\\begin{array}{l}${gl(a1, b1, c1)}\\\\${gl(a2, b2, c2)}\\end{array}`, options: shuffle(opts),
      hints: [b1 === -b2 ? `Addiere beide Gleichungen – dann fällt ${tex('y')} heraus.` : 'Löse eine Gleichung nach einer Unbekannten auf und setze sie in die andere ein – oder mach die Probe mit den Antworten.', 'Eine Lösung muss beide Gleichungen erfüllen. Setze ein und rechne nach.'],
      explain: `Probe: ${tex(`${gl(a1, b1, c1).split('=')[0].replace('x', `\\cdot${kl(x0)}`).replace('y', `\\cdot${kl(y0)}`)}=${c1}`)} und in der zweiten Gleichung ebenso – beide stimmen für ${tex(`x=${x0}`)}, ${tex(`y=${y0}`)}.`, a1, b1, c1, a2, b2, c2, x0, y0 };
  }
}

/** Binomische Formeln: ausmultiplizieren und als Quadrat schreiben. */
export function genBinom(lv = 3) {
  for (;;) {
    const kind = pick(tier(lv, ['plus'], ['plus', 'minus'], ['minus', 'dritte', 'plus'], ['faktor', 'dritte', 'zurueck'], ['zurueck', 'faktor', 'drittefaktor']));
    const a = ri(2, 9), k = ri(2, 4), T = (t, correct, why) => ({ tex: t, correct, why });
    let formula, opts, hints, explain, prompt = 'Multipliziere aus.';
    if (kind === 'plus' || kind === 'minus') { const s = kind === 'plus' ? '+' : '-', g = kind === 'plus' ? '-' : '+'; formula = `(x${s}${a})^2`;
      opts = [T(`x^2${s}${2 * a}x+${a * a}`, true), T(`x^2+${a * a}`, false, 'Das gemischte Glied fehlt: Jedes Glied der ersten Klammer wird mit jedem der zweiten malgenommen.'), T(`x^2${s}${a}x+${a * a}`, false, 'Das gemischte Glied kommt zweimal vor – es wird verdoppelt.'), T(`x^2${g}${2 * a}x+${a * a}`, false, 'Das Vorzeichen des gemischten Glieds richtet sich nach dem Zeichen in der Klammer.')];
      hints = [`${tex(`(a${s}b)^2=a^2${s}2ab+b^2`)}.`, `Hier ist ${tex('a=x')} und ${tex(`b=${a}`)}.`]; explain = `${tex(`(x${s}${a})^2=x^2${s}2\\cdot${a}\\cdot x+${a}^2=${opts[0].tex}`)}.`; }
    else if (kind === 'dritte') { formula = `(x+${a})(x-${a})`;
      opts = [T(`x^2-${a * a}`, true), T(`x^2+${a * a}`, false, 'Plus mal Minus ergibt Minus.'), T(`x^2-${2 * a}x-${a * a}`, false, 'Die gemischten Glieder heben sich auf.'), T(`x^2-${2 * a}`, false, `${tex(`${a}\\cdot${a}`)} ist ${a * a}, nicht ${2 * a}.`)];
      hints = [`${tex('(a+b)(a-b)=a^2-b^2')}.`, 'Die gemischten Glieder heben sich gegenseitig auf.']; explain = `${tex(`(x+${a})(x-${a})=x^2-${a}^2=x^2-${a * a}`)}.`; if (a === 2) continue; }
    else if (kind === 'faktor') { formula = `(${k}x+${a})^2`;
      opts = [T(`${k * k}x^2+${2 * k * a}x+${a * a}`, true), T(`${k}x^2+${2 * k * a}x+${a * a}`, false, `Auch die Zahl vor ${tex('x')} wird quadriert.`), T(`${k * k}x^2+${a * a}`, false, 'Das gemischte Glied fehlt.'), T(`${k * k}x^2+${k * a}x+${a * a}`, false, 'Das gemischte Glied wird verdoppelt.')];
      hints = [`${tex('(a+b)^2=a^2+2ab+b^2')} mit ${tex(`a=${k}x`)}.`, `${tex(`(${k}x)^2=${k * k}x^2`)}.`]; explain = `${tex(`(${k}x+${a})^2=${opts[0].tex}`)}.`; }
    else if (kind === 'drittefaktor') { formula = `(${k}x+${a})(${k}x-${a})`;
      opts = [T(`${k * k}x^2-${a * a}`, true), T(`${k}x^2-${a * a}`, false, `Auch die Zahl vor ${tex('x')} wird quadriert.`), T(`${k * k}x^2+${a * a}`, false, 'Plus mal Minus ergibt Minus.'), T(`${k * k}x^2-${2 * k * a}x-${a * a}`, false, 'Die gemischten Glieder heben sich auf.')];
      hints = [`${tex('(a+b)(a-b)=a^2-b^2')} mit ${tex(`a=${k}x`)}.`, `${tex(`(${k}x)^2=${k * k}x^2`)}.`]; explain = `${tex(`(${k}x)^2-${a}^2=${opts[0].tex}`)}.`; }
    else { const s = rand() < 0.5 ? '+' : '-', g = s === '+' ? '-' : '+'; prompt = 'Schreibe als Quadrat.'; formula = `x^2${s}${2 * a}x+${a * a}`;
      opts = [T(`(x${s}${a})^2`, true), T(`(x${g}${a})^2`, false, 'Das Zeichen in der Klammer richtet sich nach dem gemischten Glied.'), T(`(x${s}${2 * a})^2`, false, `In der Klammer steht die Zahl, deren Quadrat ${a * a} ist.`), T(`(x${s}${a * a})^2`, false, `In der Klammer steht die Wurzel aus ${a * a}.`)];
      hints = [`Die letzte Zahl ist ein Quadrat: ${tex(`${a * a}=${a}^2`)}.`, `Probe mit dem gemischten Glied: ${tex(`2\\cdot${a}=${2 * a}`)}.`]; explain = `${tex(`x^2${s}${2 * a}x+${a * a}=(x${s}${a})^2`)}.`; if (a === 2) continue; }
    if (!uniq(opts)) continue;
    return { prompt, formula, options: shuffle(opts), hints, explain, kind };
  }
}

/** Strahlensätze und Ähnlichkeit. */
export function genStrahlensatz(lv = 3) {
  const L5 = b6L(lv), kind = pick([['streckung'], ['parallel', 'rueck', 'flaeche'], ['schatten', 'flaecherueck'], ['abschnitt', 'abschnittrueck', 'mauer'], ['fluss', 'trapez']][L5 - 1]);
  for (;;) {
    const k = pick([[2, 3], [2, 3, 4], [1.5, 2.5, 3], [1.5, 2.5, 4], [1.5, 2.5, 3.5]][L5 - 1]), a = ri(2, 8) * (Number.isInteger(k) ? 1 : 2), p = ri(2, 6) * (Number.isInteger(k) ? 1 : 2);
    const L = (num, c, w, e = 'cm') => b6M(num, c, w, e);
    let prompt, opts, hints, explain;
    if (kind === 'streckung') { prompt = `Ein Dreieck wird mit dem Faktor ${fmt(k)} vergrößert. Eine Seite war ${a} cm lang. Wie lang ist sie danach?`;
      opts = [L(a * k, true), L(a + k, false, 'Beim Vergrößern wird malgenommen, nicht addiert.'), L(a / k, false, 'Das wäre eine Verkleinerung.'), L(a * k * k, false, 'Mit dem Quadrat des Faktors wachsen Flächen – Längen wachsen mit dem Faktor selbst.')];
      hints = ['Jede Länge wird mit demselben Faktor malgenommen.', `${tex(`${a}\\cdot${ft(k)}`)}.`]; explain = `${tex(`${a}\\cdot${ft(k)}=${ft(a * k)}\\,\\text{cm}`)}.`; }
    else if (kind === 'parallel') { prompt = `Zwei Strahlen gehen von Z aus und werden von zwei parallelen Geraden geschnitten. Auf dem ersten Strahl ist ZA = ${a} cm und ZA′ = ${fmt(a * k)} cm. Die innere Parallele AB ist ${p} cm lang. Wie lang ist die äußere Parallele A′B′?`;
      opts = [L(p * k, true), L(p + (a * k - a), false, 'Die Strecken wachsen im selben <b>Verhältnis</b>, nicht um denselben Betrag.'), L(p / k, false, 'Die äußere Parallele ist länger als die innere.'), L(p * a, false, 'Gebraucht wird das Verhältnis der beiden Abschnitte auf dem Strahl.')];
      hints = ['Strahlensatz: Die Parallelen verhalten sich wie die Abschnitte vom Scheitel aus.', `Faktor: ${tex(`${ft(a * k)}:${a}=${ft(k)}`)}.`]; explain = `Faktor ${tex(`${ft(a * k)}:${a}=${ft(k)}`)}, also ${tex(`${p}\\cdot${ft(k)}=${ft(p * k)}\\,\\text{cm}`)}.`; }
    else if (kind === 'schatten') { const stab = pick([1, 1.5, 2]), ss = stab * pick([1.5, 2, 0.5]), bs = ss * pick([4, 6, 8]), h = (bs * stab) / ss; prompt = `Ein ${fmt(stab)} m langer Stab wirft einen ${fmt(ss)} m langen Schatten. Zur selben Zeit ist der Schatten eines Baums ${fmt(bs)} m lang. Wie hoch ist der Baum?`;
      opts = [L(h, true, undefined, 'm'), L(bs + (stab - ss), false, 'Höhe und Schatten stehen im selben <b>Verhältnis</b> – es wird nicht einfach die Differenz genommen.', 'm'), L((bs * ss) / stab, false, 'Das Verhältnis ist umgedreht: Höhe durch Schatten, nicht Schatten durch Höhe.', 'm'), L(bs * stab, false, 'Es fehlt das Teilen durch die Schattenlänge des Stabs.', 'm')];
      hints = ['Stab und Baum bilden mit ihren Schatten ähnliche Dreiecke (Strahlensatz).', `Höhe durch Schatten ist bei beiden gleich: ${tex(`\\dfrac{h}{${ft(bs)}}=\\dfrac{${ft(stab)}}{${ft(ss)}}`)}.`, `Mit ${tex(ft(bs))} malnehmen.`]; explain = `${tex(`\\dfrac{h}{${ft(bs)}}=\\dfrac{${ft(stab)}}{${ft(ss)}}`)}, also ${tex(`h=${ft(bs)}\\cdot\\dfrac{${ft(stab)}}{${ft(ss)}}=${ft(h)}\\,\\text{m}`)}.`; }
    else if (kind === 'rueck') { prompt = `Zwei ähnliche Dreiecke: Eine Seite ist im kleinen ${a} cm, im großen ${fmt(a * k)} cm lang. Eine andere Seite ist im großen ${fmt(p * k)} cm lang. Wie lang ist sie im kleinen Dreieck?`;
      opts = [L(p, true), L(p * k * k, false, 'Gesucht ist die Seite im <b>kleinen</b> Dreieck – es wird geteilt.'), L(p * k - (a * k - a), false, 'Ähnliche Dreiecke haben gleiche Verhältnisse, nicht gleiche Differenzen.'), L((p * k) / a, false, 'Geteilt wird durch den Vergrößerungsfaktor, nicht durch die Seitenlänge.')];
      hints = ['Bestimme zuerst den Faktor zwischen den beiden Dreiecken.', `Faktor: ${tex(`${ft(a * k)}:${a}=${ft(k)}`)}.`, 'Vom großen zum kleinen Dreieck wird durch den Faktor geteilt.']; explain = `Faktor ${tex(`${ft(a * k)}:${a}=${ft(k)}`)}, also ${tex(`${ft(p * k)}:${ft(k)}=${p}\\,\\text{cm}`)}.`; }
    else if (kind === 'flaeche') { const A = ri(3, 12) * 2; prompt = `Eine Figur mit dem Flächeninhalt ${A} cm² wird mit dem Faktor ${fmt(k)} vergrößert. Wie groß ist der Flächeninhalt danach?`;
      opts = [L(A * k * k, true, undefined, 'cm²'), L(A * k, false, 'Die Fläche wächst mit dem <b>Quadrat</b> des Faktors – in beide Richtungen wird gestreckt.', 'cm²'), L(A + k * k, false, 'Es wird malgenommen, nicht addiert.', 'cm²'), L(A * 2 * k, false, 'Quadrat heißt: Faktor mal Faktor, nicht 2 mal Faktor.', 'cm²')];
      hints = ['Längen wachsen mit dem Faktor, Flächen mit seinem Quadrat.', `${tex(`${ft(k)}^2=${ft(k * k)}`)}.`, `${tex(`${A}\\cdot${ft(k * k)}`)}.`]; explain = `${tex(`${A}\\cdot${ft(k)}^2=${A}\\cdot${ft(k * k)}=${ft(A * k * k)}\\,\\text{cm}^2`)}.`; }
    else if (kind === 'abschnitt') { const za = ri(3, 9), d = ri(2, 8), ab = ri(3, 12), r = (ab * (za + d)) / za; if (Number.isInteger(r) || !Number.isInteger(+(r * 100).toFixed(6))) continue;
      prompt = `Zwei Strahlen gehen von Z aus und werden von zwei parallelen Geraden geschnitten. Auf dem ersten Strahl liegen A und C mit ZA = ${za} cm und AC = ${d} cm. Die innere Parallele AB ist ${ab} cm lang. Wie lang ist die äußere Parallele CD?`;
      opts = b6opts(L(r, true), [L((ab * d) / za, false, 'Für die Parallelen zählen die Abschnitte <b>vom Scheitel Z aus</b>: ZC, nicht AC.'), L(ab + d, false, 'Die Strecken wachsen im selben Verhältnis, nicht um denselben Betrag.'), L((ab * za) / (za + d), false, 'Die äußere Parallele ist länger als die innere – das Verhältnis ist umgedreht.'), L((ab * (za + d)) / d, false, 'Geteilt wird durch ZA, nicht durch AC.')]);
      hints = [`Für die Parallelen zählen die Abschnitte vom Scheitel Z aus: ${tex(`ZC=${za}+${d}=${za + d}`)} cm.`, `Zweiter Strahlensatz: ${tex('\\dfrac{CD}{AB}=\\dfrac{ZC}{ZA}')}.`, `${tex(`CD=${ab}\\cdot\\dfrac{${za + d}}{${za}}`)}.`]; explain = `${tex(`ZC=${za}+${d}=${za + d}`)}. Strahlensatz: ${tex(`\\dfrac{CD}{${ab}}=\\dfrac{${za + d}}{${za}}`)}, also ${tex(`CD=\\dfrac{${ab}\\cdot${za + d}}{${za}}=${ft(r)}\\,\\text{cm}`)}.`; }
    else if (kind === 'abschnittrueck') { const za = ri(3, 9), ab = ri(3, 12), cd = ab + ri(2, 9), zc = (za * cd) / ab, r = zc - za; if (Number.isInteger(r) || !Number.isInteger(+(r * 100).toFixed(6))) continue;
      prompt = `Zwei Strahlen gehen von Z aus und werden von zwei parallelen Geraden geschnitten. Auf dem ersten Strahl liegen A und C. Es ist ZA = ${za} cm, die innere Parallele AB ist ${ab} cm lang, die äußere Parallele CD ist ${cd} cm lang. Wie lang ist die Strecke AC zwischen den beiden Parallelen?`;
      opts = b6opts(L(r, true), [L(zc, false, 'Das ist die ganze Strecke ZC vom Scheitel aus – gefragt ist nur das Stück AC.'), L((za * ab) / cd, false, 'Das Verhältnis ist umgedreht: ZC ist länger als ZA.'), L(cd - ab, false, 'Die Abschnitte auf dem Strahl wachsen im selben Verhältnis wie die Parallelen, nicht um denselben Betrag.'), L((za * cd) / ab + za, false, 'ZA ist in ZC schon enthalten – es wird abgezogen, nicht addiert.')]);
      hints = [`Zweiter Strahlensatz: ${tex('\\dfrac{ZC}{ZA}=\\dfrac{CD}{AB}')}.`, `${tex(`ZC=${za}\\cdot\\dfrac{${cd}}{${ab}}=${ft(zc)}`)} cm.`, `Gesucht ist nur das Stück zwischen den Parallelen: ${tex(`AC=ZC-ZA=${ft(zc)}-${za}`)}.`]; explain = `Strahlensatz: ${tex(`\\dfrac{ZC}{${za}}=\\dfrac{${cd}}{${ab}}`)}, also ${tex(`ZC=\\dfrac{${za}\\cdot${cd}}{${ab}}=${ft(zc)}`)} cm. ${tex(`AC=${ft(zc)}-${za}=${ft(r)}\\,\\text{cm}`)}.`; }
    else if (kind === 'mauer') { const stab = pick([1.2, 1.5, 1.6, 1.8, 2]), ss = pick([0.8, 1.2, 1.6, 2.4, 2.5, 3.2]), dB = ri(8, 40) / 2, wH = ri(8, 30) / 10, teil = (dB * stab) / ss, r = teil + wH; if (stab === ss || !Number.isInteger(+(teil * 100).toFixed(6))) continue;
      prompt = `Ein ${fmt(stab)} m langer, senkrechter Stab wirft einen ${fmt(ss)} m langen Schatten. Zur selben Zeit fällt der Schatten eines Baums ${fmt(dB)} m weit über den Boden und dann noch ${fmt(wH)} m hoch an eine senkrechte Hauswand. Wie hoch ist der Baum?`;
      opts = b6opts(L(r, true, undefined, 'm'), [L(teil, false, `Das ist nur der Teil der Höhe, der zum Bodenschatten gehört – die ${fmt(wH)} m an der Wand kommen dazu.`, 'm'), L(((dB + wH) * stab) / ss, false, 'Der Schatten an der Wand wird nicht gestreckt: Er ist genauso hoch wie das Stück Baum, das ihn wirft.', 'm'), L((dB * ss) / stab + wH, false, 'Das Verhältnis ist umgedreht: Höhe durch Schatten, nicht Schatten durch Höhe.', 'm'), L(dB + wH, false, 'Der Bodenschatten ist nicht so lang wie die Höhe – er muss mit dem Verhältnis von Stab zu Stabschatten umgerechnet werden.', 'm')]);
      hints = [`Stab und Schatten geben das Verhältnis vor (Strahlensatz, ähnliche Dreiecke): Höhe durch Schatten ${tex(`=\\dfrac{${ft(stab)}}{${ft(ss)}}`)}.`, `Zum Bodenschatten von ${fmt(dB)} m gehört die Höhe ${tex(`${ft(dB)}\\cdot\\dfrac{${ft(stab)}}{${ft(ss)}}=${ft(teil)}`)} m.`, `Der Schatten an der senkrechten Wand ist genauso hoch wie das Stück Baum darüber: ${fmt(wH)} m.`, 'Beide Teile addieren.']; explain = `Bodenanteil: ${tex(`${ft(dB)}\\cdot\\dfrac{${ft(stab)}}{${ft(ss)}}=${ft(teil)}`)} m. Der Wandschatten zählt in voller Höhe: ${tex(`${ft(teil)}+${ft(wH)}=${ft(r)}\\,\\text{m}`)}.`; }
    else if (kind === 'trapez') { const za = pick([4, 5, 8, 10]), d = ri(2, 9), zb = ri(3, 12), ab = ri(3, 12), bd = (zb * d) / za, cd = (ab * (za + d)) / za, r = ab + bd + cd + d; if (zb === za || ab <= Math.abs(za - zb) + 1 || ab >= za + zb - 1 || !Number.isInteger(+(bd * 100).toFixed(6)) || !Number.isInteger(+(cd * 100).toFixed(6)) || (Number.isInteger(bd) && Number.isInteger(cd))) continue;
      prompt = `Zwei Strahlen gehen von Z aus und werden von den parallelen Geraden AB und CD geschnitten (A und C liegen auf dem ersten Strahl, B und D auf dem zweiten). Es ist ZA = ${za} cm, AC = ${d} cm, ZB = ${zb} cm und AB = ${ab} cm. Wie groß ist der Umfang des Trapezes ABDC?`;
      opts = b6opts(L(r, true), [L(ab + bd + (ab * d) / za + d, false, 'Für die Parallele CD zählt der Abschnitt vom Scheitel aus: ZC, nicht AC.'), L(ab + bd + cd, false, 'Auch die Seite AC gehört zum Umfang.'), L(ab + zb + cd + d, false, 'Zum Trapez gehört nur das Stück BD, nicht die ganze Strecke ZB.'), L(ab + (zb * (za + d)) / za + cd + d, false, 'Das ist mit der ganzen Strecke ZD gerechnet – zum Trapez gehört nur BD.'), L(bd + cd + d, false, 'Auch die Seite AB gehört zum Umfang.')]);
      hints = [`Erster Strahlensatz (Abschnitte auf den Strahlen): ${tex('\\dfrac{BD}{ZB}=\\dfrac{AC}{ZA}')}, also ${tex(`BD=${zb}\\cdot\\dfrac{${d}}{${za}}=${ft(bd)}`)} cm.`, `Für die Parallelen zählt der Abschnitt vom Scheitel aus: ${tex(`ZC=${za}+${d}=${za + d}`)} cm.`, `Zweiter Strahlensatz: ${tex('\\dfrac{CD}{AB}=\\dfrac{ZC}{ZA}')}, also ${tex(`CD=${ab}\\cdot\\dfrac{${za + d}}{${za}}=${ft(cd)}`)} cm.`, 'Umfang: alle vier Seiten AB, BD, CD und AC addieren.'];
      explain = `${tex(`BD=${zb}\\cdot\\dfrac{${d}}{${za}}=${ft(bd)}`)} cm (erster Strahlensatz). ${tex(`CD=${ab}\\cdot\\dfrac{${za + d}}{${za}}=${ft(cd)}`)} cm (zweiter Strahlensatz mit ${tex(`ZC=${za + d}`)}). Umfang: ${tex(`${ab}+${ft(bd)}+${ft(cd)}+${d}=${ft(r)}\\,\\text{cm}`)}.`; }
    else if (kind === 'fluss') { const d = ri(4, 20), ab = ri(12, 40), cd = ab + ri(3, 15), x = (ab * d) / (cd - ab); if (Number.isInteger(x) || !Number.isInteger(+(x * 100).toFixed(6))) continue;
      prompt = `Um die Breite eines Flusses zu bestimmen, wird ein Baum Z am anderen Ufer angepeilt. Direkt am eigenen Ufer liegt die Strecke AB = ${ab} m, genau ${d} m weiter landeinwärts die dazu parallele Strecke CD = ${cd} m (A liegt auf der Peillinie ZC, B auf ZD). Wie breit ist der Fluss, also wie weit ist Z von AB entfernt?`;
      opts = b6opts(L(x, true, undefined, 'm'), [L((ab * d) / cd, false, `Der Abstand von Z bis CD ist ${tex(`x+${d}`)}, nicht ${d}: Die Abschnitte zählen vom Scheitel aus.`, 'm'), L((cd * d) / (cd - ab), false, 'Das ist der Abstand von Z bis zur hinteren Strecke CD.', 'm'), L((d * (cd - ab)) / ab, false, 'Beim Umstellen ist der Bruch umgedreht.', 'm'), L((cd * d) / ab, false, `Die Abschnitte zählen vom Scheitel aus: ${tex('x')} und ${tex(`x+${d}`)}.`, 'm')]);
      hints = [`Nenne die Flussbreite ${tex('x')}. Vom Scheitel Z aus sind die Abstände ${tex('x')} (bis AB) und ${tex(`x+${d}`)} (bis CD).`, `Strahlensatz: ${tex(`\\dfrac{x}{x+${d}}=\\dfrac{${ab}}{${cd}}`)}.`, `Über Kreuz malnehmen: ${tex(`${cd}\\cdot x=${ab}\\cdot(x+${d})`)}.`, `Ausmultiplizieren und sortieren: ${tex(`${cd}x-${ab}x=${ab * d}`)}, also ${tex(`${cd - ab}x=${ab * d}`)}.`];
      explain = `Strahlensatz: ${tex(`\\dfrac{x}{x+${d}}=\\dfrac{${ab}}{${cd}}`)}. Über Kreuz: ${tex(`${cd}x=${ab}x+${ab * d}`)}, also ${tex(`${cd - ab}x=${ab * d}`)} und ${tex(`x=${ab * d}:${cd - ab}=${ft(x)}\\,\\text{m}`)}.`; }
    else { const kk = pick([1.5, 2.5, 3.5, 1.2, 1.4]), A1 = pick([20, 25, 40, 50, 75, 100]), A2 = +(A1 * kk * kk).toFixed(4), s = ri(2, 12) * 5; if (!Number.isInteger(A2)) continue;
      prompt = `Zwei ähnliche Dreiecke haben die Flächeninhalte ${A1} cm² und ${A2} cm². Eine Seite des kleinen Dreiecks ist ${s} cm lang. Wie lang ist die entsprechende Seite im großen Dreieck?`;
      opts = b6opts(L(s * kk, true), [L(s * kk * kk, false, 'Längen wachsen mit dem Faktor selbst – mit seinem Quadrat wachsen nur die Flächen.'), L((s * kk * kk) / 2, false, 'Die Wurzel aus dem Flächenverhältnis ist nicht seine Hälfte.'), L(s / kk, false, 'Gesucht ist die Seite im <b>großen</b> Dreieck.'), L(s + (A2 - A1), false, 'Ähnliche Figuren haben gleiche Verhältnisse, nicht gleiche Differenzen.')]);
      hints = [`Flächen wachsen mit dem Quadrat des Streckfaktors: ${tex(`k^2=${A2}:${A1}=${ft(kk * kk)}`)}.`, `Wurzel ziehen: ${tex(`k=\\sqrt{${ft(kk * kk)}}=${ft(kk)}`)}.`, `Längen wachsen mit dem Faktor selbst: ${tex(`${s}\\cdot${ft(kk)}`)}.`]; explain = `${tex(`k^2=${A2}:${A1}=${ft(kk * kk)}`)}, also ${tex(`k=\\sqrt{${ft(kk * kk)}}=${ft(kk)}`)}. Seite: ${tex(`${s}\\cdot${ft(kk)}=${ft(s * kk)}\\,\\text{cm}`)}.`; }
    if (!opts || !gut(opts) || opts.some((o) => o.num <= 0)) continue;
    return { prompt, options: shuffle(opts), hints, explain, kind };
  }
}

/** Logarithmus: als Hochzahl verstehen, Exponentialgleichungen, Rechengesetze. */
export function genLog(lv = 3) {
  for (;;) {
    const kind = pick(tier(lv, ['wert'], ['wert', 'zehn'], ['bruch', 'eins', 'wert'], ['gleichung', 'bruch', 'summe'], ['summe', 'gleichung', 'potenz']));
    const b = pick([2, 3, 5]), e = b === 2 ? ri(2, 6) : b === 3 ? ri(2, 4) : ri(2, 3);
    let prompt = 'Berechne.', formula, opts, hints, explain;
    if (kind === 'wert') { formula = `\\log_{${b}}${b ** e}`;
      opts = [N(e, true), N(b ** e / b, false, 'Der Logarithmus fragt nach der <b>Hochzahl</b>, nicht nach einem Quotienten.'), N(e + 1, false, `${tex(`${b}^{${e + 1}}=${b ** (e + 1)}`)} – das ist zu groß.`), N(b, false, 'Das ist die Basis. Gesucht ist die Hochzahl.')];
      hints = [`${tex(`\\log_{${b}}${b ** e}`)} fragt: ${b} hoch wie viel ergibt ${b ** e}?`, `${tex(`${b}^{?}=${b ** e}`)}.`]; explain = `${tex(`${b}^{${e}}=${b ** e}`)}, also ${tex(`\\log_{${b}}${b ** e}=${e}`)}.`; }
    else if (kind === 'zehn') { const n = ri(2, 5); formula = `\\lg ${gX(10 ** n)}`;
      opts = [N(n, true), N(n + 1, false, 'Zähle die Nullen, nicht die Ziffern.'), N(10 ** n / 10, false, 'Der Logarithmus fragt nach der Hochzahl.'), N(10, false, 'Das ist die Basis. Gesucht ist die Hochzahl.')];
      hints = [`${tex('\\lg')} ist der Logarithmus zur Basis 10.`, '10 hoch wie viel ergibt diese Zahl? Zähle die Nullen.']; explain = `${tex(`10^{${n}}=${gX(10 ** n)}`)}, also ${n}.`; }
    else if (kind === 'bruch') { formula = `\\log_{${b}}\\dfrac{1}{${b ** e}}`;
      opts = [N(-e, true), N(e, false, 'Ein Bruch mit 1 im Zähler entsteht durch eine <b>negative</b> Hochzahl.'), N(1 / e, false, 'Die Hochzahl ist negativ, kein Bruch.', br(1, e)), N(-(e + 1), false, `${tex(`${b}^{${e}}=${b ** e}`)} – die Hochzahl ist ${e}.`)];
      hints = [`${tex(`${b}^{-n}=\\dfrac{1}{${b}^n}`)}.`, `${tex(`${b}^{${e}}=${b ** e}`)}.`]; explain = `${tex(`${b}^{-${e}}=\\dfrac{1}{${b ** e}}`)}, also ${tex(`-${e}`)}.`; }
    else if (kind === 'eins') { const eins = rand() < 0.5; formula = eins ? `\\log_{${b}}1` : `\\log_{${b}}${b}`;
      opts = [N(eins ? 0 : 1, true), N(eins ? 1 : 0, false, eins ? `${tex(`${b}^1=${b}`)}, nicht 1.` : `${tex(`${b}^0=1`)}, nicht ${b}.`), N(b, false, 'Das ist die Basis. Gesucht ist die Hochzahl.'), N(-1, false, `${tex(`${b}^{-1}=\\tfrac{1}{${b}}`)}.`)];
      hints = ['Jede Zahl hoch 0 ist 1, jede Zahl hoch 1 ist sie selbst.', `${b} hoch wie viel ergibt ${eins ? 1 : b}?`]; explain = eins ? `${tex(`${b}^0=1`)}, also 0.` : `${tex(`${b}^1=${b}`)}, also 1.`; }
    else if (kind === 'gleichung') { prompt = `Löse die Gleichung.`; formula = `${b}^x=${b ** e}`;
      opts = [N(e, true), N(b ** e / b, false, 'Hier steht eine Potenz, kein Produkt: Gesucht ist die Hochzahl.'), N(e - 1, false, `${tex(`${b}^{${e - 1}}=${b ** (e - 1)}`)} – das ist zu klein.`), N(b ** e - b, false, 'Hier steht eine Potenz, keine Summe.')];
      hints = ['Gesucht ist die Hochzahl – das ist genau der Logarithmus.', `${tex(`x=\\log_{${b}}${b ** e}`)}.`]; explain = `${tex(`${b}^{${e}}=${b ** e}`)}, also ${tex(`x=${e}`)}.`; if (b ** e / b === e || b ** e - b === e) continue; }
    else if (kind === 'summe') { const f = b === 2 ? ri(1, 4) : ri(1, 2); formula = `\\log_{${b}}${b ** e}+\\log_{${b}}${b ** f}`;
      opts = [N(e + f, true), N(e * f, false, 'Beim Addieren von Logarithmen werden die Hochzahlen addiert, nicht malgenommen.'), N(b ** e + b ** f, false, 'Rechne erst jeden Logarithmus einzeln aus.'), N(e + f + 1, false, 'Rechne jeden Logarithmus einzeln aus und addiere.')];
      hints = ['Rechne jeden Logarithmus einzeln aus.', `${tex(`\\log_b u+\\log_b v=\\log_b(u\\cdot v)`)}.`]; explain = `${tex(`${e}+${f}=${e + f}`)} – oder ${tex(`\\log_{${b}}(${b ** e}\\cdot${b ** f})=\\log_{${b}}${b ** (e + f)}`)}.`; if (e * f === e + f) continue; }
    else { const n = ri(2, 4); formula = `\\log_{${b}}\\left(${b ** e}^{${n}}\\right)`;
      opts = [N(e * n, true), N(e + n, false, 'Die Hochzahl kommt als Faktor vor den Logarithmus – es wird malgenommen.'), N(e ** n, false, 'Die Hochzahl kommt als Faktor nach vorn, sie wird nicht nochmals potenziert.'), N(e, false, 'Die äußere Hochzahl darf nicht wegfallen.')];
      hints = [`${tex('\\log_b(u^n)=n\\cdot\\log_b u')}.`, `${tex(`\\log_{${b}}${b ** e}=${e}`)}.`]; explain = `${tex(`${n}\\cdot\\log_{${b}}${b ** e}=${n}\\cdot${e}=${e * n}`)}.`; if (e + n === e * n || e ** n === e * n) continue; }
    if (!gut(opts)) continue;
    return { prompt, formula, options: shuffle(opts), hints, explain, kind };
  }
}

/* ───────────── Paket 0.30: weitere Themen für jede Klasse ───────────── */

/** Geschickt rechnen: Rechenvorteile und Überschlag (Klasse 5). */
export function genVorteil(lv = 3) {
  const L = b6L(lv), kind = pick([['hundert', 'tausch'], ['neun', 'mal25', 'ueberschlag', 'ueberschlagmal'], ['verteilen', 'minusvert'], ['kombi', 'neun2'], ['bruecke', 'gauss']][L - 1]);
  for (;;) {
    let prompt = 'Rechne geschickt.', formula, opts, hints, explain;
    if (kind === 'hundert') { const a = ri(12, 88), b = 100 - a, c = ri(11, 79); if (a % 10 === 0) continue; formula = `${a}+${c}+${b}`;
      opts = [N(100 + c, true), N(100 + c - 10, false, `${a} und ${b} ergänzen sich genau zu 100.`), N(100 + c + 10, false, `${a} und ${b} ergänzen sich genau zu 100.`), N(a + c, false, `Auch die ${b} gehört dazu.`)];
      hints = ['Welche zwei Zahlen ergeben zusammen eine runde Zahl?', `${tex(`${a}+${b}=100`)} – beim Addieren darf man die Reihenfolge tauschen.`]; explain = `${tex(`(${a}+${b})+${c}=100+${c}=${100 + c}`)}.`; }
    else if (kind === 'tausch') { const [x, y] = pick([[2, 5], [4, 25], [5, 20], [2, 50]]), c = ri(3, 19); formula = `${x}\\cdot${c}\\cdot${y}`;
      opts = [N(x * y * c, true), N(x * c + y, false, 'Hier steht überall „mal“ – es wird nichts addiert.'), N(x * y + c, false, `${c} wird malgenommen, nicht addiert.`), N(x * y * (c + 1), false, `${tex(`${x}\\cdot${y}=${x * y}`)}, dann mal ${c}.`)];
      hints = ['Welche zwei Zahlen ergeben beim Malnehmen eine runde Zahl?', `${tex(`${x}\\cdot${y}=${x * y}`)} – beim Malnehmen darf man die Reihenfolge tauschen.`]; explain = `${tex(`(${x}\\cdot${y})\\cdot${c}=${x * y}\\cdot${c}=${x * y * c}`)}.`; }
    else if (kind === 'neun') { const n = pick([9, 99, 19, 29, 49]), c = ri(3, 9), r = n + 1; formula = `${c}\\cdot${n}`;
      opts = [N(c * n, true), N(c * r, false, `Das ist ${c} mal ${r}. Es muss noch ${c}-mal 1 abgezogen werden.`), N(c * r - 1, false, `Abgezogen wird ${c}-mal die 1, nicht nur einmal.`), N(c * r + c, false, `${n} ist 1 <b>weniger</b> als ${r} – es wird abgezogen.`)];
      hints = [`${n} ist fast ${r}: ${tex(`${n}=${r}-1`)}.`, `${tex(`${c}\\cdot${r}-${c}\\cdot 1`)}.`]; explain = `${tex(`${c}\\cdot${n}=${c}\\cdot(${r}-1)`)} ${tex(`=${c}\\cdot${r}-${c}=${c * r}-${c}=${c * n}`)}.`; }
    else if (kind === 'verteilen') { const c = ri(3, 9), a = ri(11, 49), b = pick([10, 20, 50, 100]) - (a % 10) - (a % 10 === 0 ? 3 : 0), sum = a + b; if (b <= 0 || sum % 10 !== 0) continue; formula = `${c}\\cdot${a}+${c}\\cdot${b}`;
      opts = [N(c * sum, true), N(c * a + b, false, `Auch die ${b} wird mit ${c} malgenommen.`), N(c * c * sum, false, `Die ${c} wird nur einmal ausgeklammert.`), N(c + sum, false, `Die Summe wird mit ${c} malgenommen.`)];
      hints = [`In beiden Teilen steckt der Faktor ${c} – Ausklammern.`, `${tex(`${c}\\cdot(${a}+${b})`)}.`, `${tex(`${a}+${b}=${sum}`)}.`]; explain = `Ausklammern: ${tex(`${c}\\cdot${a}+${c}\\cdot${b}=${c}\\cdot(${a}+${b})`)} ${tex(`=${c}\\cdot${sum}=${c * sum}`)}.`; }
    else if (kind === 'mal25') { const c = pick([12, 16, 24, 28, 32, 36, 44, 48]), f = pick([25, 5, 50]), t = f === 25 ? 4 : 2, z = f * t; formula = `${c}\\cdot${f}`;
      opts = [N(c * f, true), N((c / t) * z * 10, false, 'Eine Null zu viel.'), N(c * z, false, `${f} ist nur ${f === 25 ? 'ein Viertel' : 'die Hälfte'} von ${z} – es muss noch durch ${t} geteilt werden.`), N((c * f) + f, false, 'Zerlege geschickt statt zu schätzen.')];
      hints = [`${f} ist ${f === 25 ? 'ein Viertel von 100' : `die Hälfte von ${z}`}: ${tex(`${f}=${z}:${t}`)}.`, `Also erst durch ${t} teilen: ${tex(`${c}:${t}=${c / t}`)}.`, `Dann mal ${z}: ${tex(`${c / t}\\cdot${z}`)}.`]; explain = `${tex(`${c}\\cdot${f}=(${c}:${t})\\cdot${z}`)} ${tex(`=${c / t}\\cdot${z}=${c * f}`)}.`; }
    else if (kind === 'ueberschlag') { const a = ri(21, 89) * 10 + pick([-3, -2, -1, 1, 2, 3]), b = ri(11, 59) * 10 + pick([-3, -2, 2, 3]), ra = Math.round(a / 100) * 100, rb = Math.round(b / 100) * 100; if (a % 100 >= 40 && a % 100 <= 60) continue; if (b % 100 >= 40 && b % 100 <= 60) continue;
      prompt = `Überschlage: Runde beide Zahlen auf Hunderter und addiere dann. ${a} + ${b} ≈ ?`;
      opts = [N(ra + rb, true), N(ra + rb + 100, false, 'Schau genau hin, ob auf- oder abgerundet wird.'), N(ra + rb - 100, false, 'Schau genau hin, ob auf- oder abgerundet wird.'), N(a + b, false, 'Das ist das genaue Ergebnis – beim Überschlag wird zuerst gerundet.')];
      hints = ['Runde jede Zahl einzeln auf Hunderter.', `${a} ≈ ${ra} und ${b} ≈ ${rb}.`]; explain = `${tex(`${a}\\approx${ra}`)} und ${tex(`${b}\\approx${rb}`)}, also ${tex(`${ra}+${rb}=${ra + rb}`)}. Der Überschlag zeigt schnell, ob ein Ergebnis stimmen kann.`; }
    else if (kind === 'ueberschlagmal') { const a = ri(2, 8) * 10 + pick([-2, -1, 1, 2]), b = ri(2, 6) * 100 + pick([-12, -8, 9, 11]), ra = Math.round(a / 10) * 10, rb = Math.round(b / 100) * 100;
      prompt = `Überschlage: Runde ${a} auf Zehner und ${b} auf Hunderter und nimm dann mal. ${a} · ${b} ≈ ?`;
      opts = [N(ra * rb, true), N((ra * rb) / 10, false, 'Zähle die Nullen: Sie werden alle angehängt.'), N(ra * rb * 10, false, 'Eine Null zu viel.'), N(ra + rb, false, 'Hier wird malgenommen, nicht addiert.')];
      hints = [`${a} ≈ ${ra} und ${b} ≈ ${rb}.`, `Nimm die vorderen Ziffern mal: ${tex(`${ra / 10}\\cdot${rb / 100}=${(ra * rb) / 1000}`)}.`, 'Hänge dann alle drei Nullen an.']; explain = `${tex(`${a}\\approx${ra}`)} und ${tex(`${b}\\approx${rb}`)}: ${tex(`${ra}\\cdot${rb}=${ra / 10}\\cdot${rb / 100}\\cdot1000`)} ${tex(`=${gX(ra * rb)}`)}.`; }
    else if (kind === 'minusvert') { const c = ri(6, 19), B = ri(13, 89), D = pick([100, 200, 50, 1000]), A = B + D; if (c % 10 === 0 || B % 10 === 0) continue; formula = `${c}\\cdot${A}-${c}\\cdot${B}`;
      opts = b6opts(N(c * D, true), [N(c * A - B, false, `Auch die ${B} wird mit ${c} malgenommen.`), N(c * (A + B), false, 'Zwischen den beiden Produkten steht ein Minus.'), N(c + D, false, `Die Differenz wird mit ${c} malgenommen.`), N(c * D * 10, false, 'Eine Null zu viel.')]);
      hints = [`In beiden Teilen steckt der Faktor ${c} – Ausklammern.`, `${tex(`${c}\\cdot(${A}-${B})`)}.`, `Die Klammer ergibt eine runde Zahl: ${tex(`${A}-${B}=${D}`)}.`]; explain = `Ausklammern: ${tex(`${c}\\cdot${A}-${c}\\cdot${B}=${c}\\cdot(${A}-${B})`)} ${tex(`=${c}\\cdot${D}=${gX(c * D)}`)}.`; }
    else if (kind === 'kombi') { const [p, q] = pick([[4, 25], [8, 125], [2, 50], [5, 20], [25, 4], [125, 8]]), PQ = p * q, S = pick([100, 200]), u = ri(13, S - 13), v = S - u; if (u % 10 === 0) continue; formula = `${p}\\cdot${u}\\cdot${q}+${v}\\cdot${PQ}`;
      opts = b6opts(N(PQ * S, true), [N(PQ * u + v, false, `Auch die ${v} wird mit ${PQ} malgenommen.`), N(PQ * S * 10, false, 'Eine Null zu viel.'), N(PQ * (S - 10), false, `${u} und ${v} ergänzen sich genau zu ${S}.`), N(PQ * S + PQ, false, `Der Faktor ${PQ} wird nur einmal ausgeklammert.`), N(PQ * S / 10, false, 'Eine Null zu wenig.')]);
      hints = [`Vertausche im ersten Produkt die Reihenfolge: ${tex(`${p}\\cdot${q}\\cdot${u}=${PQ}\\cdot${u}`)}.`, `Jetzt steckt in beiden Teilen der Faktor ${PQ} – Ausklammern: ${tex(`${PQ}\\cdot(${u}+${v})`)}.`, `Die Klammer ergibt eine runde Zahl: ${tex(`${u}+${v}=${S}`)}.`];
      explain = `Tauschen: ${tex(`${p}\\cdot${u}\\cdot${q}=${PQ}\\cdot${u}`)}. Ausklammern: ${tex(`${PQ}\\cdot${u}+${v}\\cdot${PQ}=${PQ}\\cdot(${u}+${v})`)} ${tex(`=${PQ}\\cdot${S}=${gX(PQ * S)}`)}.`; }
    else if (kind === 'bruecke') { const [n, m, hz] = pick([[99, 101, 100], [999, 1001, 1000], [49, 51, 50]]), S = pick([100, 200, 150]), A = ri(12, S - 12), B = S - A; if (A % 10 === 0 || A === B) continue; formula = `${A}\\cdot${n}+${A}+${B}\\cdot${m}-${B}`;
      opts = b6opts(N(hz * S, true), [N(A * n + B * m, false, `Die einzelnen Summanden ${A} und ${B} gehören dazu: ${tex(`${A}\\cdot${n}+${A}=${A}\\cdot${hz}`)}.`), N(hz * S + 2 * B, false, `Die ${B} wird abgezogen: ${tex(`${B}\\cdot${m}-${B}=${B}\\cdot${hz}`)}.`), N(hz * S - 2 * A, false, `Die ${A} kommt dazu: ${tex(`${A}\\cdot${n}+${A}=${A}\\cdot${hz}`)}.`), N(hz * S * 10, false, 'Eine Null zu viel.'), N(n * S, false, `Nach dem Ausklammern steht ${tex(`${n}+1=${hz}`)} in der Klammer.`)]);
      hints = [`Jede Zahl steckt einmal „allein“ in der Rechnung: ${tex(`${A}=${A}\\cdot1`)} und ${tex(`${B}=${B}\\cdot1`)}.`, `Ausklammern: ${tex(`${A}\\cdot${n}+${A}\\cdot1=${A}\\cdot(${n}+1)=${A}\\cdot${hz}`)}.`, `Ebenso: ${tex(`${B}\\cdot${m}-${B}\\cdot1=${B}\\cdot(${m}-1)=${B}\\cdot${hz}`)}.`, `Noch einmal ausklammern: ${tex(`${A}\\cdot${hz}+${B}\\cdot${hz}=(${A}+${B})\\cdot${hz}`)}.`];
      explain = `Ausklammern: ${tex(`${A}\\cdot${n}+${A}=${A}\\cdot(${n}+1)=${A}\\cdot${hz}`)} und ${tex(`${B}\\cdot${m}-${B}=${B}\\cdot(${m}-1)=${B}\\cdot${hz}`)}. Zusammen: ${tex(`(${A}+${B})\\cdot${hz}=${S}\\cdot${hz}`)} ${tex(`=${gX(hz * S)}`)}.`; }
    else if (kind === 'gauss') { const a = ri(1, 15), d = pick([1, 2, 3, 4, 5]), n = pick([10, 12, 16, 20, 24, 30, 40, 50]), z = a + (n - 1) * d, s = a + z, r = (s * n) / 2; formula = `${a}+${a + d}+${a + 2 * d}+\\dots+${z - d}+${z}`;
      opts = b6opts(N(r, true), [N(s * n, false, `Jedes Paar besteht aus <b>zwei</b> Summanden – es gibt nur ${n / 2} Paare, nicht ${n}.`), N(+((s * (n - 1)) / 2).toFixed(1), false, `Zwischen ${a} und ${z} liegen ${n - 1} Schritte, aber es sind ${n} Summanden.`), N((z * n) / 2, false, `Ein Paar besteht aus der ersten und der letzten Zahl: ${tex(`${a}+${z}=${s}`)}.`), N(r + s, false, `Es gibt genau ${n / 2} Paare.`), N(r - s, false, `Es gibt genau ${n / 2} Paare.`)]);
      hints = [`Die Summanden wachsen immer um ${d}. Anzahl: ${tex(`(${z}-${a}):${d}+1=${n}`)}.`, `Bilde Paare von außen nach innen: ${tex(`${a}+${z}=${s}`)}, ${tex(`${a + d}+${z - d}=${s}`)} … jedes Paar ergibt ${s}.`, `Aus ${n} Summanden werden ${tex(`${n}:2=${n / 2}`)} Paare.`, `${tex(`${n / 2}\\cdot${s}`)}.`];
      explain = `Anzahl der Summanden: ${tex(`(${z}-${a}):${d}+1=${n}`)}. Paare von außen nach innen: ${tex(`${a}+${z}=${s}`)}, ${tex(`${a + d}+${z - d}=${s}`)} und so weiter – das sind ${tex(`${n}:2=${n / 2}`)} Paare. Summe: ${tex(`${n / 2}\\cdot${s}=${gX(r)}`)}.`; }
    else { const n = pick([99, 199, 299, 999, 49]), T = pick([7, 12, 13, 15, 25]), c = ri(2, T - 2), d = T - c, r = n + 1; if (c === d) continue; formula = `${c}\\cdot${n}+${d}\\cdot${n}`;
      opts = b6opts(N(T * n, true), [N(T * r, false, `Das ist ${T} mal ${r}. Es muss noch ${T}-mal 1 abgezogen werden.`), N(T * r - 1, false, `Abgezogen wird ${T}-mal die 1, nicht nur einmal.`), N(T * r + T, false, `${n} ist 1 <b>weniger</b> als ${r} – es wird abgezogen.`), N(c * n + d, false, `Auch die ${d} wird mit ${n} malgenommen.`)]);
      hints = [`In beiden Teilen steckt der Faktor ${n} – Ausklammern: ${tex(`(${c}+${d})\\cdot${n}=${T}\\cdot${n}`)}.`, `${n} ist fast ${r}: ${tex(`${T}\\cdot${n}=${T}\\cdot(${r}-1)`)}.`, `${tex(`${T}\\cdot${r}-${T}\\cdot1=${gX(T * r)}-${T}`)}.`];
      explain = `Ausklammern: ${tex(`${c}\\cdot${n}+${d}\\cdot${n}=(${c}+${d})\\cdot${n}`)} ${tex(`=${T}\\cdot${n}`)}. Dann geschickt zerlegen: ${tex(`${T}\\cdot(${r}-1)=${gX(T * r)}-${T}`)} ${tex(`=${gX(T * n)}`)}.`; }
    if (!opts || !gut(opts) || opts.some((o) => o.num <= 0)) continue;
    return { prompt, formula, options: shuffle(opts), hints, explain, kind };
  }
}

const Q = (z, n, correct, why) => { const g = gcd(z, n) || 1, a = z / g, b = n / g; return { tex: b === 1 ? String(a) : br(a, b), num: z / n, correct, why }; };
/** Brüche malnehmen und teilen (Klasse 6). */
export function genBruchMal(lv = 3) {
  for (;;) {
    const kind = pick(tier(lv, ['zahl'], ['zahl', 'mal'], ['mal', 'von', 'teil'], ['teil', 'kuerz', 'von'], ['kuerz', 'teil', 'teilzahl']));
    const b = ri(2, tier(lv, 5, 6, 8, 9, 12)), a = ri(1, b - 1), d = ri(2, tier(lv, 5, 6, 8, 9, 12)), c = ri(1, d - 1), k = ri(2, 6);
    if (gcd(a, b) !== 1 || gcd(c, d) !== 1) continue;
    let prompt = 'Berechne und kürze so weit wie möglich.', formula, opts, hints, explain;
    if (kind === 'zahl') { formula = `${k}\\cdot${br(a, b)}`;
      opts = [Q(k * a, b, true), Q(k * a, k * b, false, 'Nur der Zähler wird malgenommen – sonst hätte man bloß erweitert.'), Q(a, k * b, false, 'Die Zahl gehört in den Zähler, nicht in den Nenner.'), Q(k + a, b, false, 'Malnehmen, nicht addieren.')];
      hints = [`${k}-mal ${tex(br(a, b))} heißt: ${k}-mal so viele ${b === 2 ? 'Halbe' : 'Teile'}.`, 'Zähler mal Zahl, der Nenner bleibt.']; explain = `${tex(`${k}\\cdot${br(a, b)}=${br(k * a, b)}${gcd(k * a, b) > 1 ? `=${Q(k * a, b).tex}` : ''}`)}.`; }
    else if (kind === 'mal' || kind === 'kuerz') { if (kind === 'kuerz' && gcd(a, d) === 1 && gcd(c, b) === 1) continue; formula = `${br(a, b)}\\cdot${br(c, d)}`;
      opts = [Q(a * c, b * d, true), Q(a * d, b * c, false, 'Beim Malnehmen wird <b>nicht</b> der Kehrwert gebildet – das gehört zum Teilen.'), Q(a * d + c * b, b * d, false, 'Das ist die Summe. Beim Malnehmen braucht man keinen gemeinsamen Nenner.'), Q(a * c, b + d, false, 'Die Nenner werden malgenommen, nicht addiert.')];
      hints = ['Zähler mal Zähler, Nenner mal Nenner.', kind === 'kuerz' ? 'Vor dem Ausrechnen über Kreuz kürzen spart Arbeit.' : `${tex(br(`${a}\\cdot${c}`, `${b}\\cdot${d}`))}.`]; explain = `${tex(`${br(`${a}\\cdot${c}`, `${b}\\cdot${d}`)}=${br(a * c, b * d)}${gcd(a * c, b * d) > 1 ? `=${Q(a * c, b * d).tex}` : ''}`)}.`; }
    else if (kind === 'von') { const G = b * ri(2, 9); prompt = `Wie viel sind ${tex(br(a, b))} von ${G}?`; formula = undefined;
      opts = [Q(G * a, b, true), Q(G, b, false, `Das ist erst ein ${b === 2 ? 'Halbes' : 'Teil'} – gefragt sind ${a} davon.`), Q(G * b, a, false, 'Geteilt wird durch den Nenner, malgenommen mit dem Zähler.'), Q(G * a, 1, false, 'Es muss noch durch den Nenner geteilt werden.')];
      hints = ['„Von“ heißt bei Brüchen: malnehmen.', `Erst durch ${b} teilen, dann mal ${a}.`]; explain = `${tex(`${G}:${b}\\cdot${a}=${(G / b) * a}`)}.`; if (a === 1) continue; }
    else if (kind === 'teil') { formula = `${br(a, b)}:${br(c, d)}`;
      opts = [Q(a * d, b * c, true), Q(a * c, b * d, false, 'Beim Teilen wird mit dem <b>Kehrwert</b> malgenommen.'), Q(b * c, a * d, false, 'Der Kehrwert wird vom zweiten Bruch gebildet, nicht vom ersten.'), Q(a, b * c, false, 'Auch der Nenner des zweiten Bruchs gehört dazu: Er wandert in den Zähler.')];
      hints = ['Durch einen Bruch teilen heißt: mit dem Kehrwert malnehmen.', `${tex(`${br(a, b)}\\cdot${br(d, c)}`)}.`]; explain = `${tex(`${br(a, b)}\\cdot${br(d, c)}=${br(a * d, b * c)}${gcd(a * d, b * c) > 1 ? `=${Q(a * d, b * c).tex}` : ''}`)}.`; }
    else { formula = `${br(a, b)}:${k}`;
      opts = [Q(a, b * k, true), Q(a * k, b, false, 'Das wäre malnehmen. Beim Teilen wird der Bruch kleiner.'), Q(a, b + k, false, 'Der Nenner wird malgenommen, nicht addiert.'), Q(a * k, b * k, false, 'Zähler und Nenner mit derselben Zahl malnehmen ändert den Wert nicht.')];
      hints = [`Durch ${k} teilen heißt: Jedes Stück wird in ${k} Teile geschnitten.`, `Der Nenner wird ${k}-mal so groß.`]; explain = `${tex(`${br(a, b)}:${k}=${br(a, `${b}\\cdot${k}`)}=${br(a, b * k)}`)}.`; }
    if (!gut(opts) || opts[0].num === 1) continue;
    return { prompt, formula, options: shuffle(opts), hints, explain, kind };
  }
}

/** Zuordnungen: proportional und antiproportional (Klasse 7). */
export function genZuordnung(lv = 3) {
  const L = b6L(lv), kind = pick([['prop', 'art'], ['anti', 'prop'], ['faktor', 'antifaktor'], ['propkrumm', 'antikrumm'], ['doppelt', 'ausfall']][L - 1]);
  for (;;) {
    const E = (num, c, w, e) => (e === '€' ? b6G(num, c, w) : b6M(num, c, w, e));
    let prompt, opts, hints, explain;
    if (kind === 'prop') { const n1 = ri(2, 6), p = pick(L === 1 ? [2, 3, 4] : [1.5, 2.5, 0.8, 1.2]), n2 = n1 + ri(2, 6), [ding, wort] = pick([['Brötchen', 'kosten'], ['Hefte', 'kosten'], ['Liter Saft', 'kosten'], ['Kugeln Eis', 'kosten']]);
      prompt = `${n1} ${ding} ${wort} ${b6eu(n1 * p)} €. Wie viel ${wort} ${n2} ${ding}?`;
      opts = b6opts(E(n2 * p, true, undefined, '€'), [E(n1 * p + (n2 - n1), false, 'Jedes weitere Stück kostet so viel wie eines der ersten – nicht 1 €.', '€'), E((n1 * n1 * p) / n2, false, 'Mehr Ware kostet <b>mehr</b>: Das ist proportional, nicht antiproportional.', '€'), E(n2 * n1 * p, false, 'Erst den Preis für ein Stück ausrechnen.', '€'), E(n2 * p + p, false, 'Das ist ein Stück zu viel.', '€')]);
      hints = ['Rechne erst auf 1 zurück (Dreisatz).', `Ein Stück kostet ${tex(`${b6ex(n1 * p)}:${n1}`)} €.`]; explain = `Ein Stück: ${tex(`${b6ex(n1 * p)}:${n1}=${b6ex(p)}`)} €. Dann ${tex(`${n2}\\cdot${b6ex(p)}=${b6ex(n2 * p)}`)} €.`; }
    else if (kind === 'anti') { const n1 = pick([2, 3, 4, 6]), t1 = pick([6, 12, 18, 24]), n2 = pick([2, 3, 4, 6, 8, 9, 12].filter((x) => x !== n1 && (n1 * t1) % x === 0)), [wer, was] = pick([['Maler', 'streichen eine Halle'], ['Pumpen', 'leeren ein Becken'], ['Bagger', 'heben eine Grube aus']]);
      prompt = `${n1} ${wer} ${was} in ${t1} Stunden. Wie lange brauchen ${n2} ${wer}?`;
      opts = b6opts(E((n1 * t1) / n2, true, undefined, 'h'), [E((t1 * n2) / n1, false, `${n2 > n1 ? 'Mehr' : 'Weniger'} ${wer} brauchen ${n2 > n1 ? '<b>weniger</b>' : '<b>mehr</b>'} Zeit – das ist antiproportional.`, 'h'), E(Math.abs(t1 - (n2 - n1)) || 1, false, 'Die Zeit ändert sich nicht um denselben Betrag – das Produkt bleibt gleich.', 'h'), E(n1 * t1, false, `So lange bräuchte ein einziger – jetzt noch durch ${n2} teilen.`, 'h'), E(t1, false, 'Mit einer anderen Anzahl ändert sich auch die Zeit.', 'h')]);
      hints = ['Wie lange bräuchte einer allein?', `${tex(`${n1}\\cdot${t1}=${n1 * t1}`)} Stunden Arbeit insgesamt.`, `Diese Arbeit teilen sich ${n2}: ${tex(`${n1 * t1}:${n2}`)}.`]; explain = `Gesamtarbeit: ${tex(`${n1}\\cdot${t1}=${n1 * t1}`)} Stunden. Für ${n2}: ${tex(`${n1 * t1}:${n2}=${ft((n1 * t1) / n2)}`)} Stunden.`; }
    else if (kind === 'art') { const F = pick([['Je mehr Brötchen man kauft, desto mehr bezahlt man.', 'p'], ['Je mehr Helfer mit anpacken, desto kürzer dauert der Umzug.', 'a'], ['Je schneller ein Auto fährt, desto kürzer braucht es für dieselbe Strecke.', 'a'], ['Je länger man mit gleichem Tempo läuft, desto weiter kommt man.', 'p'], ['Je älter ein Kind ist, desto größer ist es.', 'k'], ['Je mehr Personen sich eine Pizza teilen, desto kleiner ist jedes Stück.', 'a'], ['Je mehr Liter man tankt, desto mehr kostet es.', 'p'], ['Je mehr Seiten ein Buch hat, desto spannender ist es.', 'k']]);
      prompt = `Was für eine Zuordnung ist das? „${F[0]}“`;
      const T = (t, key, why) => ({ tex: `\\text{${t}}`, correct: F[1] === key, why });
      opts = [T('proportional', 'p', F[1] === 'a' ? 'Proportional heißt: Wird das eine doppelt so groß, wird das andere auch doppelt so groß. Hier wird es kleiner.' : 'Doppeltes Alter oder doppelte Seitenzahl bedeutet nicht das Doppelte beim anderen Wert.'), T('antiproportional', 'a', F[1] === 'p' ? 'Antiproportional heißt: Wird das eine doppelt so groß, halbiert sich das andere. Hier wachsen beide.' : 'Es gibt hier keine feste Rechenregel zwischen den beiden Größen.'), T('keins von beiden', 'k', 'Doch: Verdoppelt man das eine, lässt sich genau sagen, was mit dem anderen passiert.'), T('beides zugleich', 'x', 'Eine Zuordnung kann nicht gleichzeitig proportional und antiproportional sein.')];
      hints = ['Was passiert mit dem zweiten Wert, wenn du den ersten verdoppelst?', 'Verdoppelt er sich auch: proportional. Halbiert er sich: antiproportional. Sonst: keins von beiden.']; explain = F[1] === 'p' ? 'Doppelt so viel vom einen bedeutet doppelt so viel vom anderen: proportional (der Quotient der beiden Werte bleibt gleich).' : F[1] === 'a' ? 'Doppelt so viel vom einen bedeutet halb so viel vom anderen: antiproportional (das Produkt der beiden Werte bleibt gleich).' : 'Hier gibt es keinen festen Faktor und kein festes Produkt – weder proportional noch antiproportional.';
      return { prompt, options: shuffle(opts), hints, explain, kind }; }
    else if (kind === 'faktor') { const p = pick([1.5, 2.5, 4, 6, 12]), x0 = pick([2, 4, 5]), x = ri(3, 9); if (x === x0) continue; prompt = `Bei einer proportionalen Zuordnung gehört zu x = ${x0} der Wert y = ${fmt(x0 * p)}. Welcher Wert gehört zu x = ${x}?`;
      opts = b6opts(N(x * p, true), [N(x0 * p + (x - x0), false, 'Proportional heißt: mit demselben Faktor malnehmen, nicht dasselbe addieren.'), N((x0 * x0 * p) / x, false, 'Das wäre antiproportional.'), N(x * x0 * p, false, 'Erst den Faktor für x = 1 bestimmen.'), N(x * p + p, false, 'Das gehört zum nächsten x-Wert.')]);
      hints = ['Bestimme den Faktor: Wie viel gehört zu x = 1?', `${tex(`${ft(x0 * p)}:${x0}=${ft(p)}`)}.`, `Jeder x-Wert wird mit diesem Faktor malgenommen: ${tex(`${x}\\cdot${ft(p)}`)}.`]; explain = `Faktor: ${tex(`${ft(x0 * p)}:${x0}=${ft(p)}`)}. Damit ${tex(`y=${x}\\cdot${ft(p)}=${ft(x * p)}`)}.`; }
    else if (kind === 'antifaktor') { const x0 = pick([2, 3, 4, 6]), y0 = pick([6, 9, 12, 15, 18, 24]), P = x0 * y0, x = pick([5, 8, 10, 12, 16, 20].filter((v) => v !== x0)), r = P / x; if (!Number.isInteger(r * 100)) continue;
      prompt = `Bei einer antiproportionalen Zuordnung gehört zu x = ${x0} der Wert y = ${y0}. Welcher Wert gehört zu x = ${x}?`;
      opts = b6opts(N(r, true), [N((y0 * x) / x0, false, 'Das wäre proportional. Antiproportional heißt: Das Produkt aus x und y bleibt gleich.'), N(Math.abs(y0 - (x - x0)) || 1, false, 'Antiproportional heißt nicht „um denselben Betrag kleiner“ – das Produkt bleibt gleich.'), N(P, false, `Das ist das feste Produkt – es muss noch durch ${x} geteilt werden.`), N(P / (x + 1), false, `Geteilt wird durch ${x}.`)]);
      hints = ['Antiproportional: Das Produkt aus x und y ist immer gleich.', `${tex(`${x0}\\cdot${y0}=${P}`)}.`, `Dieses Produkt durch den neuen x-Wert teilen: ${tex(`${P}:${x}`)}.`]; explain = `Festes Produkt: ${tex(`${x0}\\cdot${y0}=${P}`)}. Damit ${tex(`y=${P}:${x}=${ft(r)}`)}.`; }
    else if (kind === 'propkrumm') { const u = pick([25, 50, 100]), m1 = pick([3, 5, 6, 7, 9]), m2 = pick([4, 7, 8, 11, 12, 13, 15].filter((x) => x !== m1)), pu = ri(23, 98), [was, ein] = pick([['Käse', 'g'], ['Nüsse', 'g'], ['Tee', 'g'], ['Olivenöl', 'ml'], ['Gewürzmischung', 'g']]), p1 = (m1 * pu) / 100, r = (m2 * pu) / 100;
      prompt = `${m1 * u} ${ein} ${was} kosten ${b6eu(p1)} €. Wie viel kosten ${m2 * u} ${ein}?`;
      opts = b6opts(E(r, true, undefined, '€'), [E((p1 * m1) / m2, false, 'Mehr Ware kostet <b>mehr</b>: Das ist proportional, nicht antiproportional.', '€'), E(p1 + ((m2 - m1) * u) / 100, false, 'Die zusätzliche Menge kostet anteilig so viel wie der Rest – nicht 1 Cent pro Einheit.', '€'), E(p1 * m2, false, `Erst auf ${u} ${ein} zurückrechnen (durch ${m1} teilen), dann hochrechnen.`, '€'), E(r + pu / 100, false, `Das wären ${(m2 + 1) * u} ${ein}.`, '€'), E(p1 + pu / 100, false, `Das wären nur ${(m1 + 1) * u} ${ein}.`, '€')]);
      hints = [`Dreisatz über eine gemeinsame Einheit: Beide Mengen sind Vielfache von ${u} ${ein} (${tex(`${m1 * u}=${m1}\\cdot${u}`)}, ${tex(`${m2 * u}=${m2}\\cdot${u}`)}).`, `${u} ${ein} kosten ${tex(`${b6ex(p1)}:${m1}=${b6ex(pu / 100)}`)} €.`, `${m2 * u} ${ein} kosten ${tex(`${m2}\\cdot${b6ex(pu / 100)}`)} €.`];
      explain = `Dreisatz: ${m1 * u} ${ein} kosten ${b6eu(p1)} €, also ${u} ${ein} ${tex(`${b6ex(p1)}:${m1}=${b6ex(pu / 100)}`)} €. ${m2 * u} ${ein} kosten ${tex(`${m2}\\cdot${b6ex(pu / 100)}=${b6ex(r)}`)} €.`; }
    else if (kind === 'antikrumm') { const n1 = ri(4, 18), t1 = ri(6, 30), n2 = ri(3, 24), G = n1 * t1, r = G / n2, [tier0, vorrat] = pick([['Pferde', 'Ein Futtervorrat'], ['Kühe', 'Ein Heuvorrat'], ['Wanderer', 'Ein Proviantvorrat'], ['Hühner', 'Ein Sack Körner']]); if (n1 === n2 || Number.isInteger(r) || !Number.isInteger(r * 4)) continue;
      prompt = `${vorrat} reicht für ${n1} ${tier0} genau ${t1} Tage. Wie lange reicht er für ${n2} ${tier0}?`;
      opts = b6opts(E(r, true, undefined, 'Tage'), [E((t1 * n2) / n1, false, `${n2 > n1 ? 'Mehr' : 'Weniger'} ${tier0} kommen ${n2 > n1 ? '<b>kürzer</b>' : '<b>länger</b>'} mit dem Vorrat aus – das ist antiproportional.`, 'Tage'), t1 - (n2 - n1) > 0 ? E(t1 - (n2 - n1), false, 'Die Zeit ändert sich nicht um denselben Betrag – das Produkt aus Anzahl und Tagen bleibt gleich.', 'Tage') : null, E(G, false, `So lange würde der Vorrat für ein einziges Tier reichen – jetzt noch durch ${n2} teilen.`, 'Tage'), E(G / (n2 + 1), false, `Geteilt wird durch ${n2}.`, 'Tage'), E(t1, false, 'Mit einer anderen Anzahl ändert sich auch die Dauer.', 'Tage')]);
      hints = ['Je mehr Tiere, desto kürzer reicht der Vorrat: antiproportional – das Produkt aus Anzahl und Tagen bleibt gleich.', `Der Vorrat besteht aus ${tex(`${n1}\\cdot${t1}=${G}`)} Tagesrationen.`, `Für ${n2} ${tier0}: ${tex(`${G}:${n2}`)}.`];
      explain = `Antiproportional: ${tex(`${n1}\\cdot${t1}=${G}`)} Tagesrationen. Für ${n2} ${tier0} reichen sie ${tex(`${G}:${n2}=${ft(r)}`)} Tage.`; }
    else if (kind === 'doppelt') { const rate = pick([5, 6, 8, 12, 15, 20, 25]), M1 = ri(3, 8), t1 = ri(4, 10), T1 = rate * M1 * t1, M2 = ri(2, 12), zeit = rand() < 0.5; if (M2 === M1) continue;
      if (!zeit) { const t2 = ri(3, 12); if (t2 === t1) continue; const r = rate * M2 * t2;
        prompt = `${M1} Maschinen stellen in ${t1} Stunden ${gT(T1)} Teile her. Wie viele Teile schaffen ${M2} gleiche Maschinen in ${t2} Stunden?`;
        opts = b6opts(N(r, true), [N((T1 * M2) / M1, false, `Das gilt für ${t1} Stunden – die Zeit ändert sich aber auch.`), N((T1 * t2) / t1, false, `Das gilt für ${M1} Maschinen – ihre Zahl ändert sich aber auch.`), N(+((T1 * M1 * t1) / (M2 * t2)).toFixed(2), false, 'Mehr Maschinen und mehr Zeit bedeuten <b>mehr</b> Teile: Hier ist beides proportional.'), N(T1 + (M2 - M1) + (t2 - t1), false, 'Hier wird mit Faktoren gerechnet, nicht mit Unterschieden.'), N(r + rate, false, 'Rechne genau auf eine Maschine und eine Stunde zurück.')]);
        hints = ['Doppelter Dreisatz: Rechne zuerst auf <b>eine</b> Maschine und <b>eine</b> Stunde zurück.', `Eine Maschine in ${t1} Stunden: ${tex(`${gX(T1)}:${M1}=${gX(T1 / M1)}`)} Teile.`, `Eine Maschine in einer Stunde: ${tex(`${gX(T1 / M1)}:${t1}=${rate}`)} Teile.`, `${M2} Maschinen in ${t2} Stunden: ${tex(`${rate}\\cdot${M2}\\cdot${t2}`)}.`];
        explain = `Dreisatz in zwei Schritten: ${tex(`${gX(T1)}:${M1}:${t1}=${rate}`)} Teile je Maschine und Stunde. Dann ${tex(`${rate}\\cdot${M2}\\cdot${t2}=${gX(r)}`)} Teile.`; }
      else { const t2 = ri(5, 30) / 2, T2 = rate * M2 * t2; if (t2 === t1 || !Number.isInteger(T2) || T2 === T1) continue;
        prompt = `${M1} Maschinen stellen in ${t1} Stunden ${gT(T1)} Teile her. Wie lange brauchen ${M2} gleiche Maschinen für ${gT(T2)} Teile?`;
        opts = b6opts(E(t2, true, undefined, 'h'), [E((t1 * T2) / T1, false, `So lange bräuchten ${M1} Maschinen – ihre Zahl ändert sich aber auch.`, 'h'), E((t1 * T2 * M2) / (T1 * M1), false, `${M2 > M1 ? 'Mehr' : 'Weniger'} Maschinen brauchen ${M2 > M1 ? '<b>weniger</b>' : '<b>mehr</b>'} Zeit – die Maschinenzahl geht antiproportional ein.`, 'h'), E((t1 * M1) / M2, false, `Das gilt für ${gT(T1)} Teile – die Teilezahl ändert sich aber auch.`, 'h'), E(T2 / (rate * M1), false, `Gerechnet wird mit ${M2} Maschinen.`, 'h'), E(t2 + 1, false, 'Rechne genau auf eine Maschine und eine Stunde zurück.', 'h')]);
        hints = ['Doppelter Dreisatz: Rechne zuerst auf <b>eine</b> Maschine und <b>eine</b> Stunde zurück.', `Eine Maschine schafft in einer Stunde ${tex(`${gX(T1)}:${M1}:${t1}=${rate}`)} Teile.`, `${M2} Maschinen schaffen in einer Stunde ${tex(`${rate}\\cdot${M2}=${rate * M2}`)} Teile.`, `Zeit: ${tex(`${gX(T2)}:${rate * M2}`)}.`];
        explain = `Je Maschine und Stunde: ${tex(`${gX(T1)}:${M1}:${t1}=${rate}`)} Teile. ${M2} Maschinen: ${tex(`${rate}\\cdot${M2}=${rate * M2}`)} Teile pro Stunde. Zeit: ${tex(`${gX(T2)}:${rate * M2}=${ft(t2)}`)} Stunden.`; } }
    else { const n1 = ri(4, 12), D = ri(8, 24), d0 = ri(2, D - 3), f = ri(1, n1 - 2), G = n1 * D, R = n1 * (D - d0), rest = R / (n1 - f), r = d0 + rest; if (!Number.isInteger(rest * 2)) continue;
      prompt = `${n1} Arbeiter brauchen für einen Auftrag ${D} Tage. Nach ${d0} Tagen ${f === 1 ? 'fällt einer' : `fallen ${f}`} von ihnen aus. Wie viele Tage dauert der Auftrag jetzt insgesamt?`;
      opts = b6opts(E(r, true, undefined, 'Tage'), [E(rest, false, `Das ist nur die restliche Zeit – die ersten ${d0} Tage zählen mit.`, 'Tage'), E(G / (n1 - f), false, `So lange würde es dauern, wenn von Anfang an nur ${n1 - f} gearbeitet hätten. Die ersten ${d0} Tage waren aber alle da.`, 'Tage'), E(d0 + ((D - d0) * (n1 - f)) / n1, false, 'Weniger Arbeiter brauchen <b>länger</b> – das ist antiproportional.', 'Tage'), E(D + f, false, 'Die Zeit wächst nicht um die Zahl der fehlenden Arbeiter – gerechnet wird über die Gesamtarbeit.', 'Tage'), E(D, false, 'Mit weniger Arbeitern dauert der Rest länger.', 'Tage')]);
      hints = [`Gesamtarbeit: ${tex(`${n1}\\cdot${D}=${G}`)} Arbeitstage.`, `In den ersten ${d0} Tagen erledigt: ${tex(`${n1}\\cdot${d0}=${n1 * d0}`)} Arbeitstage. Rest: ${tex(`${G}-${n1 * d0}=${R}`)}.`, `Den Rest teilen sich ${n1 - f} Arbeiter (antiproportional): ${tex(`${R}:${n1 - f}=${ft(rest)}`)} Tage.`, `Dazu kommen die ersten ${d0} Tage.`];
      explain = `Gesamtarbeit ${tex(`${n1}\\cdot${D}=${G}`)} Arbeitstage, davon nach ${d0} Tagen erledigt ${tex(`${n1}\\cdot${d0}=${n1 * d0}`)}. Rest ${tex(`${G}-${n1 * d0}=${R}`)}, für ${n1 - f} Arbeiter ${tex(`${R}:${n1 - f}=${ft(rest)}`)} Tage. Insgesamt ${tex(`${d0}+${ft(rest)}=${ft(r)}`)} Tage.`; }
    if (!opts || !gut(opts) || opts.some((o) => o.num <= 0)) continue;
    return { prompt, options: shuffle(opts), hints, explain, kind };
  }
}

/** Zinsrechnung: Jahreszinsen, Zinssatz, Kapital, Monats- und Tageszinsen (Klasse 7). */
export function genZins(lv = 3) {
  const L = b6L(lv), kind = pick([['zinsen'], ['satz', 'end'], ['kapital', 'monate'], ['tage', 'tagerueck', 'zeit', 'satztage'], ['split', 'saldo']][L - 1]);
  for (;;) {
    const K = ri(2, [10, 20, 40, 60, 90][L - 1]) * 100, p = pick([[1, 2, 5], [2, 3, 4, 5], [1.5, 2.5, 3, 4], [1.5, 2.5, 3.5, 4.5], [1.2, 2.4, 3.6, 4.5]][L - 1]), Z = (K * p) / 100;
    const G = (num, c, w, e = '€') => (e === '€' ? b6G(num, c, w) : b6M(num, c, w, e)), Tg = (num, c, w) => b6M(num, c, w, 'Tage');
    if (!Number.isInteger(+(Z * 100).toFixed(6))) continue;
    let prompt, opts, hints, explain;
    if (kind === 'zinsen') { prompt = `${gT(K)} € werden ein Jahr lang zu ${fmt(p)} % angelegt. Wie viele Zinsen gibt es?`;
      opts = [G(Z, true), G(K + Z, false, 'Das ist das Guthaben nach einem Jahr. Gefragt sind nur die Zinsen.'), G(Z * 10, false, 'Prozent heißt „von hundert“: durch 100 teilen.'), G(K / p, false, 'Malnehmen mit dem Prozentsatz, nicht teilen.')];
      hints = [`${tex('Z=K\\cdot\\dfrac{p}{100}')}.`, `1 % von ${gT(K)} € sind ${fmt(K / 100)} €.`]; explain = `${tex(`${gX(K)}\\cdot\\dfrac{${ft(p)}}{100}=${ft(Z)}`)} €.`; }
    else if (kind === 'satz') { prompt = `Für ${gT(K)} € gibt es nach einem Jahr ${fmt(Z)} € Zinsen. Wie hoch ist der Zinssatz?`;
      opts = [G(p, true, undefined, '%'), G(p * 10, false, 'Eine Kommastelle verrutscht: Teile die Zinsen durch 1 % des Kapitals.', '%'), G(K / Z, false, 'Zinsen durch Kapital, nicht umgekehrt.', '%'), G(p + 1, false, `1 % von ${gT(K)} € sind ${fmt(K / 100)} €. Wie oft passt das in ${fmt(Z)} €?`, '%')];
      hints = [`${tex('p=\\dfrac{Z}{K}\\cdot 100')}.`, `1 % von ${gT(K)} € sind ${fmt(K / 100)} €.`]; explain = `${tex(`\\dfrac{${ft(Z)}}{${gX(K)}}\\cdot 100=${ft(p)}`)} %.`; }
    else if (kind === 'kapital') { prompt = `Bei einem Zinssatz von ${fmt(p)} % gibt es nach einem Jahr ${fmt(Z)} € Zinsen. Wie groß ist das Kapital?`;
      opts = [G(K, true), G(Z * p, false, 'Die Zinsen sind nur ein kleiner Teil des Kapitals – es muss viel größer sein.'), G(K / 10, false, 'Rechne erst auf 1 %, dann mal 100.'), G(K + Z, false, 'Das wäre das Guthaben nach einem Jahr.')];
      hints = [`${fmt(Z)} € sind ${fmt(p)} % des Kapitals.`, `Erst auf 1 % zurückrechnen: ${tex(`${ft(Z)}:${ft(p)}=${ft(Z / p)}`)} €.`, 'Dann mal 100.']; explain = `${tex(`K=\\dfrac{${ft(Z)}\\cdot 100}{${ft(p)}}=${gX(K)}`)} €.`; }
    else if (kind === 'monate') { const m = pick([3, 4, 6, 9]), Zm = (Z * m) / 12; if (!Number.isInteger(+(Zm * 100).toFixed(6)) || Zm === Z / m) continue; prompt = `${gT(K)} € werden ${m} Monate lang zu ${fmt(p)} % pro Jahr angelegt. Wie viele Zinsen gibt es?`;
      opts = [G(Zm, true), G(Z, false, `Das sind die Zinsen für ein ganzes Jahr – ${m} Monate sind nur ${tex(`\\tfrac{${m}}{12}`)} davon.`), G(Z * m, false, 'Der Zinssatz gilt pro Jahr, nicht pro Monat.'), G(Z / m, false, `Es wird mit ${tex(`\\tfrac{${m}}{12}`)} malgenommen, nicht durch ${m} geteilt.`)];
      hints = [`Rechne erst die Jahreszinsen aus: ${tex(`${gX(K)}\\cdot\\dfrac{${ft(p)}}{100}=${ft(Z)}`)} €.`, `${m} Monate sind ${tex(`\\tfrac{${m}}{12}`)} eines Jahres.`]; explain = `Jahreszinsen: ${tex(`${gX(K)}\\cdot\\dfrac{${ft(p)}}{100}=${ft(Z)}`)} €. Davon ${tex(`\\tfrac{${m}}{12}`)}: ${tex(`${ft(Z)}\\cdot\\dfrac{${m}}{12}=${ft(Zm)}`)} €.`; }
    else if (kind === 'end') { prompt = `${gT(K)} € werden zu ${fmt(p)} % angelegt. Wie viel Geld ist nach einem Jahr auf dem Konto?`;
      opts = [G(K + Z, true), G(Z, false, 'Das sind nur die Zinsen. Sie kommen zum Kapital dazu.'), G(K + p, false, `${fmt(p)} % sind nicht ${fmt(p)} €.`), G(K + Z * 10, false, 'Prozent heißt „von hundert“.')];
      hints = [`Zinsen ausrechnen: ${tex(`${gX(K)}\\cdot\\dfrac{${ft(p)}}{100}`)}.`, 'Die Zinsen zum Kapital addieren.']; explain = `Zinsen: ${tex(`${gX(K)}\\cdot\\dfrac{${ft(p)}}{100}=${ft(Z)}`)} €. Guthaben: ${tex(`${gX(K)}+${ft(Z)}=${gX(K + Z)}`)} €.`; }
    else if (kind === 'tage') { const t = pick([30, 60, 90, 120, 180, 45, 150, 200]), Zt = (Z * t) / 360; if (!Number.isInteger(+(Zt * 100).toFixed(6))) continue; prompt = `${gT(K)} € werden ${t} Tage lang zu ${fmt(p)} % pro Jahr angelegt (ein Bankjahr hat 360 Tage). Wie viele Zinsen gibt es?`;
      opts = b6opts(G(Zt, true), [G(Z, false, 'Das sind die Zinsen für ein ganzes Jahr.'), G((Z * t) / 100, false, 'Geteilt wird durch 360 Tage, nicht durch 100.'), G((Z * t) / 365, false, 'Die Bank rechnet mit 360 Tagen im Jahr.'), G(Zt * 2, false, `${t} Tage sind ${tex(`\\tfrac{${t}}{360}`)} eines Jahres.`)]);
      hints = [`Rechne erst die Jahreszinsen aus: ${tex(`${gX(K)}\\cdot\\dfrac{${ft(p)}}{100}=${ft(Z)}`)} €.`, `${t} Tage sind ${tex(`\\tfrac{${t}}{360}`)} eines Bankjahres.`, `${tex(`${ft(Z)}\\cdot\\dfrac{${t}}{360}`)}.`]; explain = `Tageszinsen: ${tex(`Z=${gX(K)}\\cdot\\dfrac{${ft(p)}}{100}\\cdot\\dfrac{${t}}{360}`)} ${tex(`=${ft(Z)}\\cdot\\dfrac{${t}}{360}=${ft(Zt)}`)} €.`; }
    else if (kind === 'tagerueck') { const t = pick([30, 60, 90, 120, 150, 180, 240]), Zt = (Z * t) / 360; if (!Number.isInteger(+(Zt * 100).toFixed(6))) continue; prompt = `Für ${t} Tage gibt es bei ${fmt(p)} % Jahreszins genau ${b6eu(Zt)} € Zinsen (ein Bankjahr hat 360 Tage). Wie groß ist das angelegte Kapital?`;
      opts = b6opts(G(K, true), [G((Zt * 100) / p, false, `Das wäre richtig, wenn ${b6eu(Zt)} € die Zinsen eines ganzen Jahres wären – es sind aber nur ${t} Tage.`), G(Z, false, 'Das sind die Zinsen eines ganzen Jahres, nicht das Kapital.'), G((K * t) / 360, false, 'Die Tage werden beim Hochrechnen auf ein Jahr gebraucht, nicht noch einmal beim Kapital.'), G(K / 10, false, 'Rechne erst auf 1 %, dann mal 100.')]);
      hints = [`Rechne die Zinsen auf ein ganzes Jahr hoch: ${tex(`${b6ex(Zt)}\\cdot\\dfrac{360}{${t}}=${ft(Z)}`)} €.`, `Das sind ${fmt(p)} % des Kapitals: ${tex(`K=\\dfrac{${ft(Z)}\\cdot 100}{${ft(p)}}`)}.`, `1 % sind ${tex(`${ft(Z)}:${ft(p)}=${ft(Z / p)}`)} €.`]; explain = `Jahreszinsen: ${tex(`${b6ex(Zt)}\\cdot\\dfrac{360}{${t}}=${ft(Z)}`)} €. Kapital: ${tex(`K=\\dfrac{${ft(Z)}\\cdot 100}{${ft(p)}}=${gX(K)}`)} €.`; }
    else if (kind === 'satztage') { const t = pick([40, 75, 100, 135, 150, 200, 250]), Zt = (Z * t) / 360; if (!Number.isInteger(+(Zt * 100).toFixed(6))) continue; prompt = `Für ${gT(K)} € gibt es nach ${t} Tagen ${b6eu(Zt)} € Zinsen (ein Bankjahr hat 360 Tage). Wie hoch ist der Zinssatz pro Jahr?`;
      opts = b6opts(G(p, true, undefined, '%'), [G((Zt / K) * 100, false, `Das ist der Anteil für ${t} Tage – gefragt ist der Zinssatz für ein ganzes Jahr.`, '%'), G(((Zt / K) * 100 * t) / 360, false, 'Die Zinsen müssen auf ein Jahr <b>hoch</b>gerechnet werden: mal 360 und durch die Tage.', '%'), G(p * 10, false, 'Eine Kommastelle verrutscht.', '%'), G(((Zt * 365) / t / K) * 100, false, 'Die Bank rechnet mit 360 Tagen im Jahr.', '%')]);
      hints = [`Rechne die Zinsen auf ein ganzes Jahr hoch: ${tex(`${b6ex(Zt)}\\cdot\\dfrac{360}{${t}}=${ft(Z)}`)} €.`, `Zinssatz: ${tex('p=\\dfrac{Z}{K}\\cdot 100')}.`, `${tex(`\\dfrac{${ft(Z)}}{${gX(K)}}\\cdot 100`)}.`]; explain = `Jahreszinsen: ${tex(`${b6ex(Zt)}\\cdot\\dfrac{360}{${t}}=${ft(Z)}`)} €. Zinssatz: ${tex(`p=\\dfrac{${ft(Z)}}{${gX(K)}}\\cdot 100=${ft(p)}`)} %.`; }
    else if (kind === 'zeit') { const t = pick([24, 40, 50, 75, 80, 100, 125, 160, 200, 250, 300]), Zt = (Z * t) / 360; if (!Number.isInteger(+(Zt * 100).toFixed(6))) continue; prompt = `${gT(K)} € sind zu ${fmt(p)} % pro Jahr angelegt (ein Bankjahr hat 360 Tage). Nach wie vielen Tagen sind ${b6eu(Zt)} € Zinsen zusammengekommen?`;
      opts = b6opts(Tg(t, true), [Tg((Zt / Z) * 365, false, 'Die Bank rechnet mit 360 Tagen im Jahr.'), Tg((Zt / Z) * 100, false, 'Der Anteil am Jahr wird mit 360 Tagen malgenommen, nicht mit 100.'), Tg((Zt / Z) * 12, false, 'Das wäre die Zeit in Monaten – gefragt sind Tage.'), Tg(Z / Zt, false, 'Der Bruch ist umgedreht: aufgelaufene Zinsen durch Jahreszinsen.'), Tg(t / 2, false, 'Rechne den Anteil am Jahr genau aus.')]);
      hints = [`Jahreszinsen: ${tex(`${gX(K)}\\cdot\\dfrac{${ft(p)}}{100}=${ft(Z)}`)} €.`, `Anteil am Jahr: ${tex(`\\dfrac{${b6ex(Zt)}}{${ft(Z)}}`)}.`, `Mal 360 Tage: ${tex(`\\dfrac{${b6ex(Zt)}}{${ft(Z)}}\\cdot 360`)}.`]; explain = `Jahreszinsen: ${tex(`${gX(K)}\\cdot\\dfrac{${ft(p)}}{100}=${ft(Z)}`)} €. Zeit: ${tex(`t=\\dfrac{${b6ex(Zt)}}{${ft(Z)}}\\cdot 360=${t}`)} Tage.`; }
    else if (kind === 'saldo') { const S = ri(4, 30) * 50, t1 = ri(6, 28), ps = pick([9.5, 10.5, 11.5, 12.5]), H = ri(8, 40) * 100, t2 = ri(20, 80), ph = pick([0.5, 0.75, 1.5, 2]), zs = (S * ps * t1) / 36000, zh = (H * ph * t2) / 36000, r = +zs.toFixed(2) - +zh.toFixed(2); if (r <= 0.05 || Math.abs(zs * 1000 % 10 - 5) < 0.01 || Math.abs(zh * 1000 % 10 - 5) < 0.01) continue;
      prompt = `Ein Girokonto ist ${t1} Tage lang um ${gT(S)} € überzogen (Sollzins ${fmt(ps)} % pro Jahr). Danach liegen ${t2} Tage lang ${gT(H)} € Guthaben darauf (Habenzins ${fmt(ph)} % pro Jahr). Ein Bankjahr hat 360 Tage. Wie viel Zinsen muss die Kundin unterm Strich bezahlen (Sollzinsen minus Habenzinsen, jeweils auf Cent gerundet)?`;
      opts = b6opts(b6G(r, true), [b6G(+zs.toFixed(2) + +zh.toFixed(2), false, 'Die Habenzinsen bekommt die Kundin gutgeschrieben – sie werden abgezogen, nicht addiert.'), b6G(zs, false, 'Das sind nur die Sollzinsen – die Habenzinsen werden noch gegengerechnet.'), b6G((S * ps) / 100 - (H * ph) / 100, false, 'Das wären die Zinsen für ganze Jahre – hier zählen nur die angegebenen Tage.'), b6G((S * ps * t1) / 36500 - (H * ph * t2) / 36500, false, 'Die Bank rechnet mit 360 Tagen im Jahr.'), b6G((S * ps * t2) / 36000 - (H * ph * t1) / 36000, false, 'Die Tage sind vertauscht: Zur Überziehung gehören die ersten Tage.')]);
      hints = [`Tageszinsformel: ${tex('Z=K\\cdot\\dfrac{p}{100}\\cdot\\dfrac{t}{360}')} – einmal für die Überziehung, einmal für das Guthaben.`, `Sollzinsen: ${tex(`${gX(S)}\\cdot\\dfrac{${ft(ps)}}{100}\\cdot\\dfrac{${t1}}{360}\\approx${b6ex(zs)}`)} €.`, `Habenzinsen: ${tex(`${gX(H)}\\cdot\\dfrac{${ft(ph)}}{100}\\cdot\\dfrac{${t2}}{360}\\approx${b6ex(zh)}`)} €.`, 'Die Habenzinsen von den Sollzinsen abziehen.'];
      explain = `Sollzinsen: ${tex(`${gX(S)}\\cdot\\dfrac{${ft(ps)}}{100}\\cdot\\dfrac{${t1}}{360}\\approx${b6ex(zs)}`)} €. Habenzinsen: ${tex(`${gX(H)}\\cdot\\dfrac{${ft(ph)}}{100}\\cdot\\dfrac{${t2}}{360}\\approx${b6ex(zh)}`)} €. Unterm Strich: ${tex(`${b6ex(zs)}-${b6ex(zh)}=${b6ex(r)}`)} €.`; }
    else { const KG = ri(5, 20) * 1000, x = ri(2, KG / 500 - 2) * 500, p1 = pick([1.5, 2, 2.5]), p2 = pick([3.5, 4, 4.5, 5]), Zg = (x * p1 + (KG - x) * p2) / 100, dp = p2 - p1, voll = (KG * p2) / 100; if (x === KG - x) continue;
      prompt = `${gT(KG)} € werden auf zwei Konten verteilt: Ein Teil bringt ${fmt(p1)} % Zinsen, der Rest ${fmt(p2)} %. Nach einem Jahr gibt es zusammen ${b6eu(Zg)} € Zinsen. Wie viel Geld liegt auf dem Konto mit ${fmt(p1)} %?`;
      opts = b6opts(G(x, true), [G(KG - x, false, `Das ist der Betrag auf dem Konto mit ${fmt(p2)} %.`), G((Zg * 100) / p1, false, `So viel müsste es sein, wenn die gesamten Zinsen vom Konto mit ${fmt(p1)} % kämen.`), G(KG / 2, false, 'Bei gleicher Aufteilung kämen andere Zinsen heraus – stelle eine Gleichung auf.'), G((Zg * 100) / ((p1 + p2) / 2), false, 'Mit dem mittleren Zinssatz zu rechnen passt nur, wenn beide Teile gleich groß sind.'), G(x + 500, false, 'Löse die Gleichung genau.')]);
      hints = [`Nenne den gesuchten Betrag ${tex('x')}. Auf dem anderen Konto liegen dann ${tex(`${gX(KG)}-x`)} €.`, `Zinsgleichung: ${tex(`${ft(p1 / 100, 3)}\\cdot x+${ft(p2 / 100, 3)}\\cdot(${gX(KG)}-x)=${b6ex(Zg)}`)}.`, `Klammer auflösen: ${tex(`${ft(p1 / 100, 3)}x+${ft(voll)}-${ft(p2 / 100, 3)}x=${b6ex(Zg)}`)}.`, `Zusammenfassen: ${tex(`-${ft(dp / 100, 3)}x=${b6ex(Zg)}-${ft(voll)}=${ft(Zg - voll)}`)}.`, `Durch ${tex(`-${ft(dp / 100, 3)}`)} teilen.`];
      explain = `${tex(`${ft(p1 / 100, 3)}x+${ft(p2 / 100, 3)}\\cdot(${gX(KG)}-x)=${b6ex(Zg)}`)}, also ${tex(`${ft(voll)}-${ft(dp / 100, 3)}x=${b6ex(Zg)}`)} und ${tex(`x=\\dfrac{${ft(voll)}-${b6ex(Zg)}}{${ft(dp / 100, 3)}}=${gX(x)}`)} €. Probe: ${tex(`${ft((x * p1) / 100)}+${ft(((KG - x) * p2) / 100)}=${b6ex(Zg)}`)}.`; }
    if (!opts || !gut(opts) || opts.some((o) => o.num <= 0)) continue;
    return { prompt, options: shuffle(opts), hints, explain, kind };
  }
}

/** Kreis: Umfang, Flächeninhalt, Radius und Durchmesser, Kreisring (Klasse 8). Ergebnisse als Vielfache von π. */
export function genKreis(lv = 3) {
  for (;;) {
    const kind = pick(tier(lv, ['umfang'], ['umfang', 'flaeche'], ['flaeche', 'durchmesser', 'rueck'], ['durchmesser', 'rueck', 'halb'], ['ring', 'halb', 'rueckflaeche']));
    const r = ri(2, tier(lv, 5, 7, 9, 12, 12)), P = (k, c, w, e = '') => ({ tex: `${k === 1 ? '' : ft(k)}\\pi${e}`, num: k, correct: c, why: w }), Z = (k, c, w) => ({ tex: ft(k), num: k + 0.001, correct: c, why: w });
    let prompt, opts, hints, explain;
    if (kind === 'umfang') { prompt = `Ein Kreis hat den Radius ${r} cm. Wie groß ist sein Umfang (in cm)?`;
      opts = [P(2 * r, true), P(r, false, `Im Umfang steckt der <b>Durchmesser</b>: ${tex('U=2\\pi r')}.`), P(r * r, false, `Das ist der Flächeninhalt ${tex('\\pi r^2')}.`), P(4 * r, false, `${tex('U=2\\pi r')} – der Radius wird nur verdoppelt.`)];
      hints = [`${tex('U=2\\cdot\\pi\\cdot r')}.`, `${tex(`2\\cdot${r}=${2 * r}`)}.`]; explain = `${tex(`U=2\\cdot\\pi\\cdot${r}=${2 * r}\\pi\\approx${ft(2 * r * Math.PI, 1)}`)} cm.`; if (r === 2) continue; }
    else if (kind === 'flaeche') { prompt = `Ein Kreis hat den Radius ${r} cm. Wie groß ist sein Flächeninhalt (in cm²)?`;
      opts = [P(r * r, true), P(2 * r, false, `Das ist der Umfang ${tex('2\\pi r')}.`), P(4 * r * r, false, 'Quadriert wird der Radius, nicht der Durchmesser.'), P(r, false, `Der Radius wird quadriert: ${tex('A=\\pi r^2')}.`)];
      hints = [`${tex('A=\\pi\\cdot r^2')}.`, `${tex(`${r}^2=${r * r}`)}.`]; explain = `${tex(`A=\\pi\\cdot${r}^2=${r * r}\\pi\\approx${ft(r * r * Math.PI, 1)}`)} cm².`; if (r === 2) continue; }
    else if (kind === 'durchmesser') { const fl = rand() < 0.5; prompt = `Ein Kreis hat den Durchmesser ${2 * r} cm. Wie groß ist sein ${fl ? 'Flächeninhalt (in cm²)' : 'Umfang (in cm)'}?`;
      opts = fl ? [P(r * r, true), P(4 * r * r, false, 'In die Formel gehört der Radius – der halbe Durchmesser.'), P(2 * r, false, 'Das ist der Umfang.'), P(2 * r * r, false, `${tex('A=\\pi r^2')} mit dem halben Durchmesser.`)]
        : [P(2 * r, true), P(4 * r, false, `${tex('U=\\pi\\cdot d')} – der Durchmesser wird nicht noch einmal verdoppelt.`), P(r * r, false, 'Das ist der Flächeninhalt.'), P(r, false, `${tex('U=\\pi\\cdot d')} mit dem ganzen Durchmesser.`)];
      hints = [`Der Radius ist der halbe Durchmesser: ${r} cm.`, fl ? `${tex('A=\\pi r^2')}.` : `${tex('U=\\pi\\cdot d')}.`]; explain = fl ? `${tex(`r=${r}`)}, also ${tex(`A=${r * r}\\pi`)} cm².` : `${tex(`U=\\pi\\cdot${2 * r}=${2 * r}\\pi`)} cm.`; if (r === 2 || r === 4) continue; }
    else if (kind === 'rueck') { prompt = `Ein Kreis hat den Umfang ${tex(`${2 * r}\\pi`)} cm. Wie groß ist sein Radius (in cm)?`;
      opts = [Z(r, true), Z(2 * r, false, 'Das ist der Durchmesser.'), Z(r * r, false, `${tex('U=2\\pi r')} – geteilt wird durch ${tex('2\\pi')}.`), Z(r / 2, false, `Geteilt wird durch 2, nicht durch 4.`)];
      hints = [`${tex('U=2\\pi r')}.`, `Teile durch ${tex('2\\pi')}.`]; explain = `${tex(`r=\\dfrac{${2 * r}\\pi}{2\\pi}=${r}`)} cm.`; if (r === 2 || r === 4) continue; }
    else if (kind === 'rueckflaeche') { prompt = `Ein Kreis hat den Flächeninhalt ${tex(`${r * r}\\pi`)} cm². Wie groß ist sein Umfang (in cm)?`;
      opts = [P(2 * r, true), P(r, false, 'Das ist der Radius mal π – für den Umfang wird er noch verdoppelt.'), P(r * r, false, 'Erst den Radius bestimmen: die Wurzel ziehen.'), P(2 * r * r, false, `Aus ${tex('r^2')} wird erst die Wurzel gezogen.`)];
      hints = [`Aus ${tex(`r^2=${r * r}`)} folgt der Radius.`, `${tex(`r=${r}`)}, dann ${tex('U=2\\pi r')}.`]; explain = `${tex(`r=\\sqrt{${r * r}}=${r}`)}, also ${tex(`U=${2 * r}\\pi`)} cm.`; if (r === 2) continue; }
    else if (kind === 'halb') { const u = rand() < 0.5 && r % 2 === 0; prompt = u ? `Ein Viertelkreis hat den Radius ${r} cm. Wie groß ist sein Flächeninhalt (in cm²)?` : `Ein Halbkreis hat den Radius ${2 * Math.ceil(r / 2)} cm. Wie groß ist sein Flächeninhalt (in cm²)?`; const R = u ? r : 2 * Math.ceil(r / 2), t = u ? 4 : 2;
      opts = [P((R * R) / t, true), P(R * R, false, `Das ist der ganze Kreis – gefragt ist ${u ? 'ein Viertel' : 'die Hälfte'}.`), P((2 * R) / t, false, 'Das gehört zum Umfang.'), P((R * R) / (t * 2), false, `${u ? 'Ein Viertel' : 'Die Hälfte'} heißt: durch ${t} teilen.`)];
      hints = ['Rechne erst den ganzen Kreis aus.', `Dann durch ${t} teilen.`]; explain = `${tex(`\\dfrac{\\pi\\cdot${R}^2}{${t}}=${ft((R * R) / t)}\\pi`)} cm².`; }
    else { const ri2 = ri(1, r - 1); prompt = `Ein Kreisring hat den äußeren Radius ${r} cm und den inneren Radius ${ri2} cm. Wie groß ist sein Flächeninhalt (in cm²)?`;
      opts = [P(r * r - ri2 * ri2, true), P((r - ri2) ** 2, false, 'Erst beide Kreisflächen einzeln ausrechnen, dann abziehen – nicht erst die Radien abziehen.'), P(r * r + ri2 * ri2, false, 'Der innere Kreis wird herausgenommen, also abgezogen.'), P(2 * (r - ri2), false, 'Das gehört zum Umfang.')];
      hints = ['Großer Kreis minus kleiner Kreis.', `${tex(`\\pi\\cdot${r}^2-\\pi\\cdot${ri2}^2`)}.`]; explain = `${tex(`${r * r}\\pi-${ri2 * ri2}\\pi=${r * r - ri2 * ri2}\\pi`)} cm².`; }
    if (!gut(opts) || opts.some((o) => o.num <= 0)) continue;
    return { prompt, options: shuffle(opts), hints, explain, kind };
  }
}

/** Parabeln im Alltag: Wurfbahn, Brückenbogen, größter Wert (Klasse 9). */
export function genParabelSach(lv = 3) {
  const L = b6L(lv), kind = pick([['hoehe', 'zeit'], ['start'], ['landung', 'breite'], ['wert', 'normal'], ['weite', 'erloes']][L - 1]);
  for (;;) {
    const d = ri(1, 4), e = pick([4, 9, 16, 25]), w = Math.sqrt(e), c = e - d * d;   // h(x) = -(x-d)² + e
    const term = `-(x-${d})^2+${e}`, M = (num, c2, w2, einheit = 'm') => b6M(num, c2, w2, einheit);
    let prompt, opts, hints, explain;
    if (kind === 'hoehe') { prompt = `Ein Ball fliegt auf der Bahn ${tex(`h(x)=${term}`)} (alles in m). Wie hoch fliegt er höchstens?`;
      opts = b6opts(M(e, true), [M(d, false, 'Das ist die Stelle, an der er am höchsten ist – nicht die Höhe.'), M(e + d, false, 'Die größte Höhe ist die Zahl hinter der Klammer.'), c > 0 ? M(c, false, 'Das ist die Höhe beim Abwurf.') : null, M(e + d * d, false, 'Am Scheitel ist die Klammer null – es kommt nichts dazu.'), M(2 * e, false, 'Die größte Höhe ist die Zahl hinter der Klammer.')]);
      hints = ['Die Parabel ist nach unten geöffnet – der Scheitel ist der höchste Punkt.', `Scheitel ${tex(`S(${d}\\mid ${e})`)}.`]; explain = `Der Scheitel ist ${tex(`S(${d}\\mid ${e})`)}: höchstens ${e} m.`; }
    else if (kind === 'zeit') { prompt = `Ein Ball fliegt auf der Bahn ${tex(`h(x)=${term}`)} (alles in m). Nach wie vielen Metern Weite ist er am höchsten?`;
      opts = b6opts(M(d, true), [M(e, false, 'Das ist die größte Höhe – gefragt ist die Stelle.'), M(d + w, false, 'Dort landet der Ball.'), M(2 * d, false, 'Der Scheitel liegt bei der Zahl in der Klammer.'), M(d + e, false, 'Der Scheitel liegt bei der Zahl in der Klammer.')]);
      hints = ['Gesucht ist die x-Koordinate des Scheitels.', `In der Klammer steht ${tex(`x-${d}`)}.`]; explain = `Scheitel ${tex(`S(${d}\\mid ${e})`)}: nach ${d} m.`; }
    else if (kind === 'start') { if (c <= 0) continue; prompt = `Ein Ball fliegt auf der Bahn ${tex(`h(x)=${term}`)} (alles in m). In welcher Höhe wird er abgeworfen (bei x = 0)?`;
      opts = b6opts(M(c, true), [M(e, false, 'Das ist die größte Höhe am Scheitel – nicht die Abwurfhöhe.'), M(d, false, 'Das ist die Stelle des Scheitels. Setze x = 0 ein.'), M(e + d * d, false, `${tex(`-(0-${d})^2=-${d * d}`)} – das Quadrat wird abgezogen.`), M(e - d, false, `In der Klammer wird quadriert: ${tex(`(0-${d})^2=${d * d}`)}.`)]);
      hints = ['Setze x = 0 in den Term ein.', `${tex(`-(0-${d})^2+${e}`)}.`]; explain = `${tex(`h(0)=-${d * d}+${e}=${c}`)} m.`; }
    else if (kind === 'landung') { if (d + w === e || w === d) continue; prompt = `Ein Ball fliegt auf der Bahn ${tex(`h(x)=${term}`)} (alles in m). Nach wie vielen Metern landet er auf dem Boden?`;
      opts = b6opts(M(d + w, true), [M(d, false, 'Dort ist er am höchsten. Am Boden ist die Höhe 0.'), M(e, false, 'Das ist die größte Höhe.'), M(d + e, false, `Aus ${tex(`(x-${d})^2=${e}`)} wird die Wurzel gezogen.`), M(w, false, `Nach dem Wurzelziehen muss noch ${d} addiert werden.`)]);
      hints = ['Am Boden ist die Höhe 0.', `${tex(`-(x-${d})^2+${e}=0`)}, also ${tex(`(x-${d})^2=${e}`)}.`, `Wurzel ziehen: ${tex(`x-${d}=\\pm${w}`)}.`]; explain = `${tex(`(x-${d})^2=${e}`)}, also ${tex(`x-${d}=\\pm${w}`)}. ${tex(`x=${d}+${w}=${d + w}`)} m (die andere Lösung ${tex(`${d - w}`)} liegt ${d - w < 0 ? 'hinter dem Abwurf' : 'vor dem Flug'}).`; }
    else if (kind === 'breite') { if (2 * w === e) continue; prompt = `Ein Brückenbogen hat die Form ${tex(`h(x)=-(x-${d + w})^2+${e}`)} (alles in m). Wie breit ist der Bogen am Boden?`;
      opts = b6opts(M(2 * w, true), [M(w, false, 'Das ist nur der Abstand vom Scheitel bis zu einem Fußpunkt.'), M(e, false, 'Das ist die Höhe des Bogens.'), M(2 * (d + w), false, 'Gefragt ist der Abstand der beiden Nullstellen.'), M(d + 2 * w, false, 'Das ist die rechte Nullstelle – gefragt ist der Abstand der beiden.')]);
      hints = ['Bestimme beide Stellen, an denen die Höhe 0 ist.', `${tex(`(x-${d + w})^2=${e}`)}, also ${tex(`x=${d + w}\\pm${w}`)}.`, 'Die Breite ist der Abstand der beiden Nullstellen.']; explain = `${tex(`(x-${d + w})^2=${e}`)}, also ${tex(`x=${d + w}\\pm${w}`)}: Nullstellen ${tex(`x=${d}`)} und ${tex(`x=${d + 2 * w}`)}. Breite: ${tex(`${d + 2 * w}-${d}=${2 * w}`)} m.`; }
    else if (kind === 'wert') { const a = ri(2, 9) * 10 + pick([0, 0, 4, 6]), k = a / 2, xs = a / 4, r = (a * a) / 8; prompt = `Mit ${a} m Zaun soll an einer Hauswand ein rechteckiges Beet abgetrennt werden (die Wand ersetzt eine Seite). Der Flächeninhalt ist ${tex(`A(x)=x\\cdot(${a}-2x)`)}. Wie groß kann das Beet höchstens werden?`;
      opts = b6opts(M(r, true, undefined, 'm²'), [M(xs, false, 'Das ist die Seitenlänge x, bei der es am größten wird – nicht die Fläche.', 'm²'), M((a / 3) ** 2, false, 'Ein Quadrat ist hier nicht die beste Wahl – die Wand spart eine Seite.', 'm²'), M((a * a) / 4, false, 'Der Scheitel liegt genau in der Mitte zwischen den beiden Nullstellen – dort ist die andere Seite nur noch halb so lang.', 'm²'), M((a * a) / 16, false, `Das wäre ${tex('x\\cdot x')} – die andere Seite ist aber ${tex(`${a}-2x`)}.`, 'm²')]);
      hints = [`Die Nullstellen liest man an den Faktoren ab: ${tex('x=0')} und ${tex(`${a}-2x=0`)}, also ${tex(`x=${k}`)}.`, `Der Scheitel liegt in der Mitte der Nullstellen: ${tex(`x=${k}:2=${ft(xs)}`)}.`, `Einsetzen: ${tex(`A(${ft(xs)})=${ft(xs)}\\cdot(${a}-2\\cdot${ft(xs)})`)}.`]; explain = `Nullstellen ${tex('x=0')} und ${tex(`x=${k}`)}, Scheitel in der Mitte bei ${tex(`x=${ft(xs)}`)}. ${tex(`A(${ft(xs)})=${ft(xs)}\\cdot(${a}-${ft(2 * xs)})`)} ${tex(`=${ft(xs)}\\cdot${ft(k)}=${ft(r)}`)} m².`; }
    else if (kind === 'normal') { const a = pick([0.5, 0.25, 0.2, 0.1]), xs = ri(2, 8), c0 = pick([0.5, 1, 1.5, 2]), bb = +(2 * a * xs).toFixed(4), ys = +(c0 + a * xs * xs).toFixed(4), fx = `-${ft(a)}x^2+${ft(bb)}x+${ft(c0)}`;
      prompt = `Ein Ball fliegt auf der Bahn ${tex(`h(x)=${fx}`)} (x: Weite in m, h: Höhe in m). Wie hoch fliegt er höchstens?`;
      opts = b6opts(M(ys, true), [M(xs, false, 'Das ist die Stelle des Scheitels – gefragt ist die Höhe dort.'), M(c0, false, 'Das ist die Abwurfhöhe bei x = 0.'), M(a * xs * xs + bb * xs + c0, false, `Das Vorzeichen vor dem Quadrat gehört dazu: ${tex(`-${ft(a)}\\cdot${xs}^2`)} wird abgezogen.`), M(bb * xs + c0, false, `Das quadratische Glied ${tex(`-${ft(a)}x^2`)} fehlt.`), M(ys + c0, false, 'Die Abwurfhöhe steckt schon im Term – sie wird nicht noch einmal addiert.')]);
      hints = ['Der höchste Punkt ist der Scheitel der nach unten geöffneten Parabel.', `Scheitelstelle: ${tex(`x_s=-\\dfrac{${ft(bb)}}{2\\cdot(-${ft(a)})}=${xs}`)}.`, `Einsetzen: ${tex(`h(${xs})=-${ft(a)}\\cdot${xs}^2+${ft(bb)}\\cdot${xs}+${ft(c0)}`)}.`, `${tex(`-${ft(a * xs * xs)}+${ft(bb * xs)}+${ft(c0)}`)}.`];
      explain = `Scheitelstelle: ${tex(`x_s=-\\dfrac{${ft(bb)}}{2\\cdot(-${ft(a)})}=${xs}`)}. Höhe: ${tex(`h(${xs})=-${ft(a)}\\cdot${xs}^2+${ft(bb)}\\cdot${xs}+${ft(c0)}`)} ${tex(`=-${ft(a * xs * xs)}+${ft(bb * xs)}+${ft(c0)}=${ft(ys)}`)} m.`; }
    else if (kind === 'weite') { const a = pick([0.05, 0.1, 0.2, 0.25, 0.5]), bb = pick([0.6, 0.8, 1, 1.2, 1.5]), c0 = pick([1.5, 1.8, 2, 2.2, 2.4]), P = +(bb / a).toFixed(4), Q = +(c0 / a).toFixed(4), hf = P / 2, D = hf * hf + Q, wd = Math.sqrt(D), x = hf + wd, fx = `-${ft(a)}x^2+${ft(bb)}x+${ft(c0)}`; if (Number.isInteger(+(wd * 100).toFixed(6))) continue;
      prompt = `Ein Ball wird geworfen und fliegt auf der Bahn ${tex(`h(x)=${fx}`)} (x: Weite in m, h: Höhe in m). Nach wie vielen Metern landet er auf dem Boden?`;
      opts = b6opts(M(x, true), [M(P, false, `Das wäre die Landestelle bei einem Abwurf vom Boden aus – die Abwurfhöhe ${tex(ft(c0))} m fehlt.`), M(hf, false, 'Das ist die Scheitelstelle (dort ist der Ball am höchsten), nicht die Landestelle.'), M(wd - hf, false, 'Das ist der Betrag der negativen Lösung – sie liegt hinter dem Abwurf.'), D - 2 * Q > 0 ? M(hf + Math.sqrt(D - 2 * Q), false, `Vorzeichen unter der Wurzel: ${tex(`q=-${ft(Q)}`)}, also wird ${tex(ft(Q))} addiert.`) : null, M(hf + D, false, 'Die Wurzel fehlt.')]);
      hints = [`Am Boden ist die Höhe 0: ${tex(`${fx}=0`)}.`, `Durch ${tex(`-${ft(a)}`)} teilen (Normalform): ${tex(`x^2-${ft(P)}x-${ft(Q)}=0`)}.`, `pq-Formel mit ${tex(`p=-${ft(P)}`)} und ${tex(`q=-${ft(Q)}`)}: ${tex(`x_{1,2}=${ft(hf)}\\pm\\sqrt{${ft(hf)}^2+${ft(Q)}}`)}.`, `${tex(`\\sqrt{${ft(D, 4)}}\\approx${ft(wd, 2)}`)}.`, 'Nur die positive Lösung passt zum Flug.'];
      explain = `${tex(`${fx}=0`)} durch ${tex(`-${ft(a)}`)} teilen: ${tex(`x^2-${ft(P)}x-${ft(Q)}=0`)}. pq-Formel: ${tex(`x_{1,2}=${ft(hf)}\\pm\\sqrt{${ft(hf)}^2+${ft(Q)}}`)} ${tex(`=${ft(hf)}\\pm\\sqrt{${ft(D, 4)}}\\approx${ft(hf)}\\pm${ft(wd, 2)}`)}. Die negative Lösung entfällt: ${tex(`x\\approx${ft(x, 2)}`)} m.`; }
    else { const P0 = pick([6, 8, 9, 10, 12, 14]), M0 = pick([200, 240, 300, 360, 400]), dP = pick([0.5, 0.25, 1]), dM = pick([20, 25, 30, 40, 50]), x1 = P0 / dP, x2 = -M0 / dM, xs = (x1 + x2) / 2, preis = P0 - dP * xs, menge = M0 + dM * xs; if (xs <= 0 || !Number.isInteger(+(preis * 100).toFixed(6)) || !Number.isInteger(+(xs * 4).toFixed(6))) continue;
      const fx = `(${P0}-${ft(dP)}x)\\cdot(${M0}+${dM}x)`;
      prompt = `Ein Kino verkauft bei einem Eintrittspreis von ${P0} € an einem Abend ${M0} Karten. Jede Preissenkung um ${b6eu(dP)} € bringt ${dM} zusätzliche Besucher. Nach x Preissenkungen sind die Einnahmen ${tex(`E(x)=${fx}`)}. Bei welchem Eintrittspreis sind die Einnahmen am größten?`;
      opts = b6opts(b6G(preis, true), [b6G(P0, false, 'Schon die erste Preissenkung bringt mehr Einnahmen – der alte Preis ist nicht der beste.'), b6G(xs, false, 'Das ist die Zahl der Preissenkungen – gefragt ist der Preis.'), b6G(P0 / 2, false, `Die zweite Nullstelle liegt nicht bei 0, sondern bei ${tex(`x=${ft(x2)}`)}.`), b6G(preis + dP, false, 'Der Scheitel liegt genau in der Mitte der beiden Nullstellen.'), b6G(P0 - dP * x1 / 4, false, 'Der Scheitel liegt genau in der Mitte der beiden Nullstellen.')]);
      hints = [`Die Einnahmen sind ein Produkt – die Nullstellen liest man an den Klammern ab: ${tex(`${P0}-${ft(dP)}x=0`)} bei ${tex(`x=${ft(x1)}`)} und ${tex(`${M0}+${dM}x=0`)} bei ${tex(`x=${ft(x2)}`)}.`, `Ausmultipliziert steht ${tex(`-${ft(dP * dM)}x^2`)} vorn: Die Parabel ist nach unten geöffnet, der Scheitel ist der größte Wert.`, `Der Scheitel liegt in der Mitte der Nullstellen: ${tex(`x_s=\\dfrac{${ft(x1)}+(${ft(x2)})}{2}=${ft(xs)}`)}.`, `Preis: ${tex(`${P0}-${ft(dP)}\\cdot${ft(xs)}`)}.`];
      explain = `Nullstellen ${tex(`x=${ft(x1)}`)} und ${tex(`x=${ft(x2)}`)}, Scheitel in der Mitte: ${tex(`x_s=\\dfrac{${ft(x1)}+(${ft(x2)})}{2}=${ft(xs)}`)}. Preis: ${tex(`${P0}-${ft(dP)}\\cdot${ft(xs)}=${b6ex(preis)}`)} €. Dann kommen ${tex(`${M0}+${dM}\\cdot${ft(xs)}=${ft(menge)}`)} Besucher, die Einnahmen sind ${tex(`${b6ex(preis)}\\cdot${ft(menge)}=${b6ex(preis * menge)}`)} € (vorher ${tex(`${P0}\\cdot${M0}=${P0 * M0}`)} €).`; }
    if (!opts || !gut(opts) || opts.some((o) => o.num <= 0)) continue;
    return { prompt, options: shuffle(opts), hints, explain, kind };
  }
}

/** Sinus- und Kosinussatz in beliebigen Dreiecken (Klasse 10) – mit Winkeln, deren Werte man kennt. */
export function genSinussatz(lv = 3) {
  const Lv = b6L(lv), kind = pick([['flaeche', 'welcher'], ['sin30', 'sinrueck', 'cos90'], ['cos60', 'cos120'], ['sss', 'sinallg', 'kosallg'], ['vermessung', 'schiff']][Lv - 1]);
  for (;;) {
    const L = (num, c, w, e = 'cm') => b6M(num, c, w, e), R1 = (num, c, w, e = 'cm') => b6M(num, c, w, e, 1), W = (num, cc, w) => N(num, cc, w, `${num}^\\circ`);
    const si = (g) => Math.sin((g * Math.PI) / 180), co = (g) => Math.cos((g * Math.PI) / 180), r3 = (v) => +v.toFixed(3), r1 = (v) => +v.toFixed(1);
    let prompt, opts, hints, explain;
    if (kind === 'sin30') { const a = ri(3, 12); prompt = `In einem Dreieck liegt der Seite a = ${a} cm der Winkel α = 30° gegenüber, der Seite c der Winkel γ = 90°. Wie lang ist c? (${tex('\\sin 30^\\circ=0{,}5')})`;
      opts = [L(2 * a, true), L(a / 2, false, 'Die Seite gegenüber dem größeren Winkel ist die längere.'), L(a, false, 'Zu verschiedenen Winkeln gehören verschieden lange Seiten.'), L(3 * a, false, `${tex('\\sin 90^\\circ=1')} ist doppelt so groß wie ${tex('\\sin 30^\\circ')} – nicht dreimal.`)];
      hints = [`Sinussatz: ${tex('\\dfrac{a}{\\sin\\alpha}=\\dfrac{c}{\\sin\\gamma}')}.`, `${tex(`\\dfrac{${a}}{0{,}5}=\\dfrac{c}{1}`)}.`]; explain = `${tex(`c=\\dfrac{${a}\\cdot\\sin 90^\\circ}{\\sin 30^\\circ}=\\dfrac{${a}}{0{,}5}=${2 * a}`)} cm.`; }
    else if (kind === 'sinrueck') { const a = ri(2, 9), c = 2 * a; prompt = `In einem Dreieck ist a = ${a} cm, c = ${c} cm und γ = 90°. Wie groß ist der Winkel α, der a gegenüberliegt?`;
      opts = [W(30, true), W(60, false, `${tex('\\sin\\alpha=0{,}5')} gehört zu 30°. Bei 60° wäre es der Kosinus.`), W(45, false, `Bei 45° wären beide Katheten gleich lang.`), W(50, false, `Rechne ${tex('\\sin\\alpha')} aus und suche den passenden Winkel.`)];
      hints = [`Sinussatz: ${tex('\\dfrac{\\sin\\alpha}{a}=\\dfrac{\\sin\\gamma}{c}')}.`, `${tex(`\\sin\\alpha=\\dfrac{${a}\\cdot 1}{${c}}=0{,}5`)}.`, 'Zu welchem Winkel gehört der Sinuswert 0,5?']; explain = `${tex(`\\sin\\alpha=\\dfrac{${a}\\cdot\\sin 90^\\circ}{${c}}=0{,}5`)}, also ${tex('\\alpha=30^\\circ')}.`; }
    else if (kind === 'cos60' || kind === 'cos120') { const [a, b, c] = kind === 'cos60' ? pick([[3, 8, 7], [5, 8, 7], [7, 15, 13], [8, 15, 13], [5, 21, 19]]) : pick([[3, 5, 7], [7, 8, 13], [5, 16, 19], [6, 10, 14], [7, 33, 37], [11, 24, 31]]), g = kind === 'cos60' ? 60 : 120, cw = kind === 'cos60' ? '0{,}5' : '-0{,}5', pyth = Math.sqrt(a * a + b * b), z = kind === 'cos60' ? '-' : '+', kw = kind === 'cos60' ? cw : `(${cw})`;
      prompt = `In einem Dreieck sind a = ${a} cm, b = ${b} cm und der eingeschlossene Winkel γ = ${g}°. Wie lang ist die Seite c? (${tex(`\\cos ${g}^\\circ=${cw}`)})`;
      const falsch = kind === 'cos60' ? Math.sqrt(a * a + b * b + a * b) : Math.sqrt(a * a + b * b - a * b);
      opts = b6opts(L(c, true), [R1(pyth, false, 'Das wäre der Satz des Pythagoras – der gilt nur bei 90°.'), R1(falsch, false, `Vorzeichen beachten: ${tex(`-2ab\\cdot\\cos ${g}^\\circ`)} ist hier ${kind === 'cos60' ? 'negativ' : 'positiv'}.`), L(a + b, false, 'Seitenlängen lassen sich nicht einfach addieren.'), L(c * c, false, 'Am Ende wird noch die Wurzel gezogen.')]);
      hints = [`Kosinussatz: ${tex('c^2=a^2+b^2-2ab\\cdot\\cos\\gamma')}.`, `${tex(`c^2=${a}^2+${b}^2-2\\cdot${a}\\cdot${b}\\cdot${kw}`)}.`, `${tex(`c^2=${a * a}+${b * b}${z}${a * b}`)}.`]; explain = `Kosinussatz: ${tex(`c^2=${a}^2+${b}^2-2\\cdot${a}\\cdot${b}\\cdot${kw}`)} ${tex(`=${a * a}+${b * b}${z}${a * b}=${c * c}`)}, also ${tex(`c=\\sqrt{${c * c}}=${c}`)} cm.`; }
    else if (kind === 'cos90') { const [a, b, c] = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17]]); prompt = `In einem Dreieck sind a = ${a} cm, b = ${b} cm und γ = 90°. Was liefert der Kosinussatz für c? (${tex('\\cos 90^\\circ=0')})`;
      opts = b6opts(L(c, true), [L(a + b, false, 'Seitenlängen lassen sich nicht einfach addieren.'), L(c * c, false, 'Am Ende wird noch die Wurzel gezogen.'), L(Math.abs(b - a) + 1, false, `${tex('c^2=a^2+b^2')}, weil der letzte Teil wegfällt.`), L(c + 2, false, `${tex('c^2=a^2+b^2')}, weil der letzte Teil wegfällt.`)]);
      hints = [`Kosinussatz: ${tex('c^2=a^2+b^2-2ab\\cdot\\cos\\gamma')}.`, 'Mit cos 90° = 0 fällt der letzte Teil weg – übrig bleibt der Satz des Pythagoras.']; explain = `${tex(`c^2=${a * a}+${b * b}=${c * c}`)}, also ${tex(`c=${c}`)} cm. Der Satz des Pythagoras ist ein Sonderfall des Kosinussatzes.`; }
    else if (kind === 'welcher') { const F = pick([['zwei Seiten und der eingeschlossene Winkel', 'k'], ['alle drei Seiten', 'k'], ['zwei Winkel und eine Seite', 's'], ['zwei Seiten und ein Winkel, der einer davon gegenüberliegt', 's']]);
      prompt = `Von einem Dreieck (ohne rechten Winkel) sind gegeben: ${F[0]}. Welcher Satz hilft zuerst weiter?`;
      const T = (t, key, why) => ({ tex: `\\text{${t}}`, correct: F[1] === key, why });
      opts = [T('Sinussatz', 's', 'Für den Sinussatz braucht man ein Paar aus Seite und gegenüberliegendem Winkel – das fehlt hier.'), T('Kosinussatz', 'k', 'Hier ist ein Paar aus Seite und gegenüberliegendem Winkel bekannt – damit geht der Sinussatz direkt.'), T('Satz des Pythagoras', 'p', 'Der gilt nur im rechtwinkligen Dreieck.'), T('Winkelsumme allein', 'w', 'Die Winkelsumme liefert nur Winkel, keine Seitenlängen.')];
      hints = ['Der Sinussatz braucht eine Seite und den Winkel gegenüber.', 'Der Kosinussatz braucht zwei Seiten mit eingeschlossenem Winkel oder alle drei Seiten.']; explain = F[1] === 's' ? `Ein Paar aus Seite und gegenüberliegendem Winkel ist bekannt (oder über die Winkelsumme schnell berechnet): Sinussatz ${tex('\\dfrac{a}{\\sin\\alpha}=\\dfrac{b}{\\sin\\beta}')}.` : `Es gibt kein bekanntes Paar aus Seite und gegenüberliegendem Winkel: Kosinussatz ${tex('c^2=a^2+b^2-2ab\\cdot\\cos\\gamma')}.`;
      return { prompt, options: shuffle(opts), hints, explain, kind }; }
    else if (kind === 'flaeche') { const a = ri(3, 9) * 2, b = ri(3, 9); prompt = `In einem Dreieck sind a = ${a} cm, b = ${b} cm und der eingeschlossene Winkel γ = 30°. Wie groß ist der Flächeninhalt? (${tex('\\sin 30^\\circ=0{,}5')})`;
      opts = b6opts(L((a * b) / 4, true, undefined, 'cm²'), [L((a * b) / 2, false, `Es fehlt noch der Faktor ${tex('\\sin\\gamma=0{,}5')}.`, 'cm²'), L(a * b, false, `${tex('A=\\tfrac12\\cdot a\\cdot b\\cdot\\sin\\gamma')}.`, 'cm²'), L((a * b) / 8, false, 'Einmal zu oft halbiert.', 'cm²')]);
      hints = [`${tex('A=\\tfrac12\\cdot a\\cdot b\\cdot\\sin\\gamma')}.`, `${tex(`\\tfrac12\\cdot${a}\\cdot${b}\\cdot 0{,}5`)}.`]; explain = `${tex(`A=\\tfrac12\\cdot${a}\\cdot${b}\\cdot 0{,}5=${ft((a * b) / 4)}`)} cm².`; }
    else if (kind === 'sss') { const g = pick([60, 120]), [a, b, c] = g === 60 ? pick([[3, 8, 7], [5, 8, 7], [7, 15, 13], [8, 15, 13], [5, 21, 19]]) : pick([[3, 5, 7], [7, 8, 13], [5, 16, 19], [6, 10, 14]]), zl = a * a + b * b - c * c;
      prompt = `Ein Dreieck hat die Seiten a = ${a} cm, b = ${b} cm und c = ${c} cm. Wie groß ist der Winkel γ, der der Seite c gegenüberliegt? (${tex('\\cos 60^\\circ=0{,}5')}, ${tex('\\cos 120^\\circ=-0{,}5')})`;
      opts = [W(g, true), W(180 - g, false, `Das Vorzeichen entscheidet: ${tex(`\\cos\\gamma=${g === 60 ? '' : '-'}0{,}5`)} gehört zu ${g}°.`), W(30, false, `${tex('\\sin 30^\\circ=0{,}5')} – hier geht es aber um den Kosinus.`), W(90, false, `Bei 90° müsste ${tex('c^2=a^2+b^2')} gelten: ${tex(`${a * a}+${b * b}=${a * a + b * b}`)}, aber ${tex(`c^2=${c * c}`)}.`)];
      hints = [`Kosinussatz nach dem Winkel umstellen: ${tex('\\cos\\gamma=\\dfrac{a^2+b^2-c^2}{2ab}')}.`, `${tex(`\\cos\\gamma=\\dfrac{${a * a}+${b * b}-${c * c}}{2\\cdot${a}\\cdot${b}}=\\dfrac{${zl}}{${2 * a * b}}`)}.`, `${tex(`\\dfrac{${zl}}{${2 * a * b}}=${ft(zl / (2 * a * b))}`)} – welcher Winkel hat diesen Kosinuswert?`];
      explain = `Kosinussatz: ${tex(`\\cos\\gamma=\\dfrac{${a * a}+${b * b}-${c * c}}{2\\cdot${a}\\cdot${b}}`)} ${tex(`=\\dfrac{${zl}}{${2 * a * b}}=${ft(zl / (2 * a * b))}`)}, also ${tex(`\\gamma=${g}^\\circ`)}.`; }
    else if (kind === 'sinallg') { const al = ri(5, 17) * 5, ga = ri(5, 17) * 5, be = 180 - al - ga, a = ri(4, 15), sa = r3(si(al)), sb = r3(si(be)), b = (a * si(be)) / si(al); if (be < 20 || al === be || be === ga || al === 30 || be === 30 || be === 90 || r1(b) !== r1((a * sb) / sa)) continue;
      prompt = `In einem Dreieck sind α = ${al}°, γ = ${ga}° und a = ${a} cm (a liegt α gegenüber). Wie lang ist die Seite b, die dem dritten Winkel β gegenüberliegt? (${tex(`\\sin ${al}^\\circ\\approx${ft(sa, 3)}`)}, ${tex(`\\sin ${be}^\\circ\\approx${ft(sb, 3)}`)})`;
      opts = b6opts(R1(b, true), [R1((a * si(ga)) / si(al), false, `Das ist die Seite c gegenüber von γ. Zu b gehört der dritte Winkel β = ${be}°.`), R1((a * si(al)) / si(be), false, `Der Bruch ist umgedreht: Zum ${be > al ? 'größeren' : 'kleineren'} Winkel gehört die ${be > al ? 'längere' : 'kürzere'} Seite.`), R1((a * be) / al, false, 'Die Seiten verhalten sich wie die <b>Sinuswerte</b> der Winkel, nicht wie die Winkel selbst.'), R1(a * si(be), false, `Es fehlt das Teilen durch ${tex(`\\sin ${al}^\\circ`)}.`), R1(a / si(al), false, `Es fehlt der Faktor ${tex(`\\sin ${be}^\\circ`)}.`)]);
      hints = [`Dritter Winkel über die Winkelsumme: ${tex(`\\beta=180^\\circ-${al}^\\circ-${ga}^\\circ=${be}^\\circ`)}.`, `Sinussatz: ${tex('\\dfrac{a}{\\sin\\alpha}=\\dfrac{b}{\\sin\\beta}')}.`, `Nach b umstellen: ${tex('b=\\dfrac{a\\cdot\\sin\\beta}{\\sin\\alpha}')}.`, `${tex(`b=\\dfrac{${a}\\cdot${ft(sb, 3)}}{${ft(sa, 3)}}`)}.`]; explain = `Winkelsumme: ${tex(`\\beta=180^\\circ-${al}^\\circ-${ga}^\\circ=${be}^\\circ`)}. Sinussatz: ${tex(`\\dfrac{${a}}{\\sin ${al}^\\circ}=\\dfrac{b}{\\sin ${be}^\\circ}`)}, also ${tex(`b=\\dfrac{${a}\\cdot${ft(sb, 3)}}{${ft(sa, 3)}}\\approx${ft(b, 1)}`)} cm.`; }
    else if (kind === 'kosallg') { const a = ri(4, 15), b = ri(4, 15), g = pick([35, 40, 50, 55, 65, 70, 75, 80, 100, 110, 125, 140]), cg = r3(co(g)), c2 = a * a + b * b - 2 * a * b * co(g), c = Math.sqrt(c2), c2r = a * a + b * b - 2 * a * b * cg, kz = g > 90 ? `(${ft(cg, 3)})` : ft(cg, 3); if (a === b || r1(c) !== r1(Math.sqrt(c2r))) continue;
      prompt = `In einem Dreieck sind a = ${a} cm, b = ${b} cm und der eingeschlossene Winkel γ = ${g}°. Wie lang ist die Seite c? (${tex(`\\cos ${g}^\\circ\\approx${ft(cg, 3)}`)})`;
      opts = b6opts(R1(c, true), [R1(Math.sqrt(a * a + b * b), false, 'Das wäre der Satz des Pythagoras – der gilt nur bei 90°.'), R1(Math.sqrt(a * a + b * b + 2 * a * b * co(g)), false, `Vorzeichen beachten: Im Kosinussatz steht ${tex('-2ab\\cdot\\cos\\gamma')}${g > 90 ? ', und der Kosinus ist hier negativ' : ''}.`), R1(c2, false, 'Am Ende wird noch die Wurzel gezogen.'), R1(Math.sqrt(Math.abs(a * a + b * b - a * b * co(g))), false, `Im Kosinussatz steht das <b>doppelte</b> Produkt: ${tex('2ab\\cdot\\cos\\gamma')}.`), R1(a + b, false, 'Seitenlängen lassen sich nicht einfach addieren.')]);
      hints = [`Zwei Seiten und der eingeschlossene Winkel – Kosinussatz: ${tex('c^2=a^2+b^2-2ab\\cdot\\cos\\gamma')}.`, `${tex(`c^2=${a}^2+${b}^2-2\\cdot${a}\\cdot${b}\\cdot${kz}`)}.`, `${tex(`c^2\\approx${a * a}+${b * b}${cg < 0 ? '+' : '-'}${ft(Math.abs(2 * a * b * cg), 2)}=${ft(c2r, 2)}`)}, dann die Wurzel ziehen.`];
      explain = `Kosinussatz: ${tex(`c^2=${a}^2+${b}^2-2\\cdot${a}\\cdot${b}\\cdot${kz}`)} ${tex(`\\approx${ft(c2r, 2)}`)}, also ${tex(`c\\approx\\sqrt{${ft(c2r, 2)}}\\approx${ft(c, 1)}`)} cm.`; }

    else if (kind === 'vermessung') { const c = ri(8, 50) * 5, al = ri(7, 15) * 5, be = ri(7, 15) * 5, ga = 180 - al - be, sa = r3(si(al)), sb = r3(si(be)), sg = r3(si(ga)), ac = (c * si(be)) / si(ga), h = ac * si(al), ac2 = (c * sb) / sg; if (al === be || ga < 30 || ga === 90 || ga === al || ga === be || r1(ac) !== r1(ac2) || r1(h) !== r1(r1(ac2) * sa) || r1(h) !== r1(ac2 * sa)) continue;
      prompt = `Von zwei Punkten A und B am Ufer (Abstand ${c} m) wird eine Boje C angepeilt. Bei A beträgt der Winkel zwischen AB und AC α = ${al}°, bei B der Winkel zwischen BA und BC β = ${be}°. Wie weit ist die Boje von der Uferlinie AB entfernt? (${tex(`\\sin ${al}^\\circ\\approx${ft(sa, 3)}`)}, ${tex(`\\sin ${be}^\\circ\\approx${ft(sb, 3)}`)}, ${tex(`\\sin ${ga}^\\circ\\approx${ft(sg, 3)}`)})`;
      opts = b6opts(R1(h, true, undefined, 'm'), [R1(ac, false, 'Das ist die schräge Strecke AC – der Abstand zur Uferlinie ist die Höhe auf AB und damit kürzer.', 'm'), R1(c * si(al) * si(be), false, `Im Sinussatz wird durch ${tex(`\\sin\\gamma`)} geteilt – der dritte Winkel fehlt.`, 'm'), R1((c * si(al) * si(al)) / si(ga), false, `Der Seite AC liegt der Winkel β gegenüber, nicht α: ${tex('AC=\\dfrac{AB\\cdot\\sin\\beta}{\\sin\\gamma}')}.`, 'm'), R1((c * si(be)) / si(al), false, `Der Seite AB liegt der Winkel γ = ${ga}° gegenüber, nicht α.`, 'm'), R1(c * si(al), false, 'So wäre AB die schräge Seite – erst muss AC mit dem Sinussatz berechnet werden.', 'm')]);
      hints = [`Dritter Winkel über die Winkelsumme: ${tex(`\\gamma=180^\\circ-${al}^\\circ-${be}^\\circ=${ga}^\\circ`)}.`, `Sinussatz für die Seite AC (sie liegt β gegenüber, AB liegt γ gegenüber): ${tex('\\dfrac{AC}{\\sin\\beta}=\\dfrac{AB}{\\sin\\gamma}')}.`, `${tex(`AC=\\dfrac{${c}\\cdot${ft(sb, 3)}}{${ft(sg, 3)}}\\approx${ft(ac, 1)}`)} m.`, `Der Abstand ist die Höhe auf AB. Im rechtwinkligen Teildreieck bei A gilt ${tex('h=AC\\cdot\\sin\\alpha')}.`, `${tex(`h\\approx${ft(ac, 1)}\\cdot${ft(sa, 3)}`)}.`];
      explain = `Winkelsumme: ${tex(`\\gamma=180^\\circ-${al}^\\circ-${be}^\\circ=${ga}^\\circ`)}. Sinussatz: ${tex(`AC=\\dfrac{${c}\\cdot\\sin ${be}^\\circ}{\\sin ${ga}^\\circ}`)} ${tex(`=\\dfrac{${c}\\cdot${ft(sb, 3)}}{${ft(sg, 3)}}\\approx${ft(ac, 1)}`)} m. Höhe auf AB: ${tex(`h=AC\\cdot\\sin ${al}^\\circ\\approx${ft(ac, 1)}\\cdot${ft(sa, 3)}\\approx${ft(h, 1)}`)} m.`; }
    else { const v1 = ri(12, 30), v2 = ri(12, 30), t = pick([1.5, 2, 2.5, 3]), g = pick([35, 40, 50, 55, 65, 70, 75, 80, 100, 110, 125]), a = v1 * t, b = v2 * t, cg = r3(co(g)), c2 = a * a + b * b - 2 * a * b * co(g), c = Math.sqrt(c2), c2r = a * a + b * b - 2 * a * b * cg; if (v1 === v2 || r1(c) !== r1(Math.sqrt(c2r))) continue;
      prompt = `Zwei Schiffe verlassen gleichzeitig denselben Hafen. Das erste fährt mit ${v1} km/h, das zweite mit ${v2} km/h; ihre Kurse schließen einen Winkel von ${g}° ein. Wie weit sind die Schiffe nach ${fmt(t)} Stunden voneinander entfernt? (${tex(`\\cos ${g}^\\circ\\approx${ft(cg, 3)}`)})`;
      opts = b6opts(R1(c, true, undefined, 'km'), [R1(Math.sqrt(a * a + b * b), false, 'Das wäre der Satz des Pythagoras – der gilt nur bei einem rechten Winkel zwischen den Kursen.', 'km'), R1(Math.sqrt(a * a + b * b + 2 * a * b * co(g)), false, `Vorzeichen beachten: Im Kosinussatz steht ${tex('-2ab\\cdot\\cos\\gamma')}.`, 'km'), R1(c / t, false, `Das ist der Abstand nach einer Stunde – die Schiffe fahren ${fmt(t)} Stunden.`, 'km'), R1(a + b, false, 'Die Schiffe fahren nicht in entgegengesetzte Richtungen – die Wege lassen sich nicht einfach addieren.', 'km'), R1(c2, false, 'Am Ende wird noch die Wurzel gezogen.', 'km')]);
      hints = [`Zurückgelegte Wege: ${tex(`a=${v1}\\cdot${ft(t)}=${ft(a)}`)} km und ${tex(`b=${v2}\\cdot${ft(t)}=${ft(b)}`)} km.`, `Die Wege schließen den Winkel ${g}° ein – Kosinussatz: ${tex('c^2=a^2+b^2-2ab\\cdot\\cos\\gamma')}.`, `${tex(`c^2=${ft(a)}^2+${ft(b)}^2-2\\cdot${ft(a)}\\cdot${ft(b)}\\cdot${g > 90 ? `(${ft(cg, 3)})` : ft(cg, 3)}`)}.`, `${tex(`c^2\\approx${ft(a * a)}+${ft(b * b)}${cg < 0 ? '+' : '-'}${ft(Math.abs(2 * a * b * cg), 2)}=${ft(c2r, 2)}`)}, dann die Wurzel ziehen.`];
      explain = `Wege: ${tex(`a=${v1}\\cdot${ft(t)}=${ft(a)}`)} km, ${tex(`b=${v2}\\cdot${ft(t)}=${ft(b)}`)} km. Kosinussatz: ${tex(`c^2=${ft(a)}^2+${ft(b)}^2-2\\cdot${ft(a)}\\cdot${ft(b)}\\cdot${g > 90 ? `(${ft(cg, 3)})` : ft(cg, 3)}`)} ${tex(`\\approx${ft(c2r, 2)}`)}, also ${tex(`c\\approx\\sqrt{${ft(c2r, 2)}}\\approx${ft(c, 1)}`)} km.`; }
    if (!opts || !gut(opts) || opts.some((o) => o.num <= 0)) continue;
    return { prompt, options: shuffle(opts), hints, explain, kind };
  }
}

/** Alle Erzeuger dieser Datei – für Tests und Verzeichnisse. */
export const MITTEL_GENS = { genRunden, genRechenregel, genTeiler, genEinheit, genRechteck, genKuerzen, genBruchVergleich, genDezimal, genBruchDezimal, genNegativ, genTerm, genDreisatz, genLinFunktion, genWurzel, genZinseszins, genQuader, genKoerper, genWinkel, genLGS, genBinom, genStrahlensatz, genLog, genVorteil, genBruchMal, genZuordnung, genZins, genKreis, genParabelSach, genSinussatz };

for (const [fn, topic] of [[genRunden, 'Runden'], [genRechenregel, 'Rechenregeln'], [genTeiler, 'Teiler und Vielfache'], [genEinheit, 'Größen umrechnen'], [genRechteck, 'Umfang und Flächeninhalt'],
  [genKuerzen, 'Kürzen und Erweitern'], [genBruchVergleich, 'Brüche vergleichen'], [genDezimal, 'Dezimalzahlen'], [genBruchDezimal, 'Bruch, Dezimalzahl, Prozent'], [genNegativ, 'Negative Zahlen'],
  [genTerm, 'Terme'], [genDreisatz, 'Dreisatz'], [genLinFunktion, 'Lineare Funktionen'], [genWurzel, 'Wurzeln'], [genZinseszins, 'Zinseszins und Wachstum'], [genQuader, 'Quader und Würfel'], [genKoerper, 'Körper berechnen'], [genWinkel, 'Winkel'], [genLGS, 'Gleichungssysteme'], [genBinom, 'Binomische Formeln'], [genStrahlensatz, 'Strahlensätze'], [genLog, 'Logarithmus'], [genVorteil, 'Geschickt rechnen'], [genBruchMal, 'Brüche malnehmen und teilen'], [genZuordnung, 'Zuordnungen'], [genZins, 'Zinsrechnung'], [genKreis, 'Kreis'], [genParabelSach, 'Parabeln im Alltag'], [genSinussatz, 'Sinus- und Kosinussatz']]) fn.topic = topic;
