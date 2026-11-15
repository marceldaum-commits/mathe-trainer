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

const STELLE = ['Einer', 'Zehner', 'Hunderter', 'Tausender', 'Zehntausender', 'Hunderttausender', 'Millionen'];
/** Natürliche Zahlen runden. */
export function genRunden(lv = 3) {
  for (;;) {
    const k = tier(lv, 1, pick([1, 2]), pick([2, 3]), pick([3, 4]), pick([4, 5])), s = 10 ** k;
    const n = lv >= 4 && rand() < 0.4 ? ri(1, 8) * s * 10 + 9 * s + ri(s / 2, s - 1) : ri(s + 1, s * 99);   // ab Stufe 4 auch Überträge (… 9 5 …)
    if (n % s === 0) continue;
    const unten = Math.floor(n / s) * s, oben = unten + s, d = Math.floor(n / (s / 10)) % 10, r = d >= 5 ? oben : unten;
    const fein = Math.round(n / (s / 10)) * (s / 10), grob0 = Math.round(n / (s * 10)) * (s * 10), grob = grob0 === 0 || grob0 === r ? r + s : grob0;
    const opts = [N(r, true),
      N(r === oben ? unten : oben, false, r === oben ? `Rechts von der ${STELLE[k]}stelle steht ${d} – ab 5 wird aufgerundet.` : `Rechts von der ${STELLE[k]}stelle steht ${d} – bei 0 bis 4 wird abgerundet.`),
      N(fein, false, k === 1 ? 'Hier wurde gar nicht gerundet.' : `Das ist auf ${STELLE[k - 1]} gerundet – gefragt war auf ${STELLE[k]}.`),
      N(grob, false, grob0 === grob ? `Das ist auf ${STELLE[k + 1]} gerundet – gefragt war auf ${STELLE[k]}.` : 'Das ist eine Stufe zu weit aufgerundet.')];
    if (!gut(opts)) continue;
    return { prompt: `Runde ${gT(n)} auf ${STELLE[k]}.`, options: shuffle(opts),
      hints: [`Entscheidend ist die Ziffer direkt rechts von der ${STELLE[k]}stelle.`, `Dort steht ${d}. Bei 0 bis 4 wird abgerundet, bei 5 bis 9 aufgerundet.`],
      explain: `Rechts von der ${STELLE[k]}stelle steht ${d}, also wird ${d >= 5 ? 'aufgerundet' : 'abgerundet'}: ${tex(gX(r))}.`, n, s, r };
  }
}

/** Rechenregeln: Punkt vor Strich, Klammern zuerst, Potenzen vor Punkt. */
export function genRechenregel(lv = 3) {
  for (;;) {
    const kind = pick(tier(lv, ['pvs'], ['pvs', 'minus', 'klammer'], ['klammer', 'zwei', 'div'], ['zwei', 'div', 'minus', 'potenz'], ['potenz', 'zwei', 'div']));
    const g = lv >= 4 ? 12 : 9, a = ri(2, g), b = ri(2, g), c = ri(2, lv >= 4 ? 9 : 6), d = ri(2, 6);
    let formula, opts, schritt;
    if (kind === 'pvs') { formula = `${a}+${b}\\cdot${c}`; schritt = `${a}+${b * c}`;
      opts = [N(a + b * c, true), N((a + b) * c, false, 'Punkt vor Strich: Erst wird multipliziert, dann addiert.'), N(a + b + c, false, 'Zwischen den letzten beiden Zahlen steht ein Malpunkt, kein Plus.'), N(b * c, false, 'Der erste Summand wurde vergessen.')]; }
    else if (kind === 'minus') { const A = b * c + ri(1, 9); formula = `${A}-${b}\\cdot${c}`; schritt = `${A}-${b * c}`;
      opts = [N(A - b * c, true), N((A - b) * c, false, 'Punkt vor Strich: Erst wird multipliziert, dann subtrahiert.'), N(A - b - c, false, 'Zwischen den letzten beiden Zahlen steht ein Malpunkt, kein Minus.'), N(A - b + c, false, 'Das Produkt wird als Ganzes abgezogen.')]; }
    else if (kind === 'klammer') { formula = `(${a}+${b})\\cdot${c}`; schritt = `${a + b}\\cdot${c}`;
      opts = [N((a + b) * c, true), N(a + b * c, false, 'Die Klammer wird zuerst ausgerechnet.'), N(a * c + b, false, 'Beide Zahlen in der Klammer werden mit dem Faktor multipliziert.'), N(a + b + c, false, 'Hinter der Klammer steht ein Malpunkt.')]; }
    else if (kind === 'zwei') { formula = `${a}\\cdot${b}+${c}\\cdot${d}`; schritt = `${a * b}+${c * d}`;
      opts = [N(a * b + c * d, true), N((a * b + c) * d, false, 'Nicht einfach von links nach rechts: Beide Produkte werden zuerst berechnet.'), N(a * (b + c) * d, false, 'Punkt vor Strich: Die Addition kommt zuletzt.'), N(a * b + c + d, false, 'Zwischen den letzten beiden Zahlen steht ein Malpunkt.')]; }
    else if (kind === 'div') { const q = ri(2, 9), B = c * q; formula = `${a}+${B}:${c}`; schritt = `${a}+${q}`;
      opts = [N(a + q, true), N((a + B) / c, false, 'Punkt vor Strich: Erst wird geteilt, dann addiert.', ft((a + B) / c, 2)), N(a + B - c, false, 'Zwischen den letzten beiden Zahlen steht ein Geteilt-Zeichen, kein Minus.'), N(q, false, 'Der erste Summand wurde vergessen.')]; }
    else { const e = ri(2, lv >= 5 ? 5 : 4); formula = `${a}+${b}\\cdot${e}^2`; schritt = `${a}+${b}\\cdot${e * e}`;
      opts = [N(a + b * e * e, true), N(a + (b * e) ** 2, false, 'Die Potenz gilt nur für die Zahl direkt darunter – sie wird vor dem Malnehmen berechnet.'), N((a + b) * e * e, false, 'Punkt vor Strich: Die Addition kommt zuletzt.'), N(a + b * e * 2, false, 'Hoch 2 heißt: die Zahl mit sich selbst malnehmen, nicht mal 2.')]; }
    if (!gut(opts)) continue;
    return { prompt: 'Berechne.', formula, options: shuffle(opts),
      hints: ['Reihenfolge: erst Klammern, dann Potenzen, dann Punktrechnung (mal, geteilt), zuletzt Strichrechnung (plus, minus).', `Nach dem ersten Schritt steht da: ${tex(schritt)}.`],
      explain: `${tex(`${formula}=${schritt}=${gX(opts[0].num)}`)}.`, kind };
  }
}

const PRIM_K = [2, 3, 5, 7, 11, 13], PRIM_G = [17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
const ZUS_K = [[4, 2, 2], [6, 2, 3], [8, 2, 4], [9, 3, 3], [10, 2, 5], [12, 3, 4], [14, 2, 7], [15, 3, 5]];
const ZUS_G = [[21, 3, 7], [27, 3, 9], [33, 3, 11], [39, 3, 13], [49, 7, 7], [51, 3, 17], [57, 3, 19], [63, 7, 9], [77, 7, 11], [87, 3, 29], [91, 7, 13], [93, 3, 31]];
const quer = (n) => String(n).split('').reduce((s, z) => s + +z, 0);
/** Teiler, Vielfache, Primzahlen, Teilbarkeit. */
export function genTeiler(lv = 3) {
  for (;;) {
    const kind = pick(tier(lv, ['prim'], ['prim', 'ggt'], ['ggt', 'kgv', 'teilbar'], ['ggt', 'kgv', 'teilbar'], ['kgv', 'ggt', 'teilbar']));
    if (kind === 'prim') {
      const gross = lv >= 2, p = pick(gross ? PRIM_G : PRIM_K), zs = shuffle(gross ? ZUS_G : ZUS_K).slice(0, 3);
      const opts = [N(p, true), ...zs.map(([z, x, y]) => N(z, false, `${z} ist keine Primzahl: ${tex(`${z}=${x}\\cdot${y}`)}.`))];
      if (!gut(opts)) continue;
      return { prompt: 'Welche Zahl ist eine Primzahl?', options: shuffle(opts), hints: ['Eine Primzahl hat genau zwei Teiler: 1 und sich selbst.', 'Prüfe der Reihe nach, ob die Zahl durch 2, 3, 5 oder 7 teilbar ist.'], explain: `${p} lässt sich nur durch 1 und durch ${p} teilen.`, kind };
    }
    if (kind === 'teilbar') {
      const t = lv >= 5 ? 9 : pick([3, 3, 9]), basis = lv >= 4 ? [1000, 9999] : [100, 999], zahl = () => ri(basis[0], basis[1]);
      let r; do { r = zahl(); } while (r % t !== 0);
      const f = []; while (f.length < 3) { const z = zahl(); if (z % t !== 0 && !f.includes(z) && (t !== 9 || z % 3 === 0 || f.length < 2)) f.push(z); }
      const opts = [N(r, true), ...f.map((z) => N(z, false, `Die Quersumme von ${gT(z)} ist ${quer(z)} – sie ist nicht durch ${t} teilbar.`))];
      if (!gut(opts)) continue;
      return { prompt: `Welche Zahl ist durch ${t} teilbar?`, options: shuffle(opts), hints: [`Eine Zahl ist durch ${t} teilbar, wenn ihre Quersumme durch ${t} teilbar ist.`, 'Die Quersumme ist die Summe aller Ziffern.'], explain: `Die Quersumme von ${gT(r)} ist ${quer(r)}, und ${quer(r)} ist durch ${t} teilbar.`, kind, t, r };
    }
    const g = pick(tier(lv, [2, 3], [2, 3, 4, 5], [3, 4, 5, 6], [4, 6, 8, 9], [6, 8, 12, 15])), m = ri(2, lv >= 4 ? 7 : 5), n = ri(2, lv >= 4 ? 7 : 5);
    if (m === n || gcd(m, n) !== 1) continue;
    const a = g * m, b = g * n, l = g * m * n;
    const opts = kind === 'ggt'
      ? [N(g, true), N(l, false, 'Das ist das kleinste gemeinsame Vielfache. Gesucht ist der größte gemeinsame <b>Teiler</b>.'), N(Math.min(a, b), false, `${Math.min(a, b)} teilt ${Math.max(a, b)} nicht ohne Rest.`), N(g > 3 && g % 2 === 0 ? g / 2 : 1, false, 'Das ist ein gemeinsamer Teiler – aber nicht der größte.')]
      : [N(l, true), N(a * b, false, 'Das Produkt ist ein gemeinsames Vielfaches – aber nicht das kleinste.'), N(g, false, 'Das ist der größte gemeinsame Teiler. Gesucht ist das kleinste gemeinsame <b>Vielfache</b>.'), N(Math.max(a, b), false, `${Math.max(a, b)} ist kein Vielfaches von ${Math.min(a, b)}.`)];
    if (!gut(opts)) continue;
    return { prompt: kind === 'ggt' ? `Bestimme den größten gemeinsamen Teiler von ${a} und ${b}.` : `Bestimme das kleinste gemeinsame Vielfache von ${a} und ${b}.`, options: shuffle(opts),
      hints: kind === 'ggt' ? ['Schreibe die Teiler beider Zahlen auf und suche den größten, der in beiden Listen steht.', `${a} = ${g} · ${m} und ${b} = ${g} · ${n}.`] : ['Schreibe die Vielfachen der größeren Zahl auf, bis eines auch ein Vielfaches der kleineren ist.', `Vielfache von ${Math.max(a, b)}: ${[1, 2, 3].map((i) => Math.max(a, b) * i).join(', ')} …`],
      explain: kind === 'ggt' ? `${tex(`${a}=${g}\\cdot${m}`)} und ${tex(`${b}=${g}\\cdot${n}`)}: Der größte gemeinsame Teiler ist ${g}.` : `${tex(`${l}=${a}\\cdot${n}=${b}\\cdot${m}`)} – kleiner geht es nicht.`, kind, a, b, g, l };
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
  for (;;) {
    const kind = pick(tier(lv, ['flaeche', 'umfang'], ['flaeche', 'umfang', 'quadrat'], ['seite', 'umfang', 'lform'], ['lform', 'ausumfang', 'seite'], ['ausumfang', 'lform']));
    const a = ri(3, lv >= 3 ? 14 : 9), b = ri(2, lv >= 3 ? 12 : 8), u = pick(['cm', 'm']);
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
      hints = ['Aus „Länge mal Breite = Fläche“ wird: Breite = Fläche durch Länge.', `${tex(`${A}:${a}`)}.`]; explain = `${tex(`b=${A}:${a}=${b}\\,\\text{${u}}`)}.`; }
    else if (kind === 'lform') { const c = ri(1, a - 2), d = ri(1, b - 1); if (b < 3) continue; prompt = `Aus einem Rechteck (${a} ${u} mal ${b} ${u}) wird an einer Ecke ein kleines Rechteck (${c} ${u} mal ${d} ${u}) herausgeschnitten. Wie groß ist die restliche Fläche?`;
      opts = [F(a * b - c * d, true), F(a * b, false, 'Die herausgeschnittene Ecke muss noch abgezogen werden.'), F(a * b + c * d, false, 'Die Ecke fehlt – ihre Fläche wird abgezogen, nicht addiert.'), F((a - c) * (b - d), false, 'So würde ein ganzer Streifen fehlen. Es fehlt nur die kleine Ecke.')];
      hints = ['Großes Rechteck minus kleines Rechteck.', `${tex(`${a}\\cdot${b}-${c}\\cdot${d}`)}.`]; explain = `${tex(`A=${a * b}-${c * d}=${a * b - c * d}\\,\\text{${u}}^2`)}.`; }
    else { const U = 2 * (a + b); prompt = `Ein Rechteck hat den Umfang ${U} ${u} und ist ${a} ${u} lang. Wie groß ist sein Flächeninhalt?`;
      opts = [F(a * b, true), F(b, false, 'Das ist die Breite – gefragt ist der Flächeninhalt.'), F((U - a) * a, false, 'Vom Umfang müssen <b>zwei</b> Längen abgezogen werden, und der Rest ist das Doppelte der Breite.'), F((U / 2) * a, false, 'Der halbe Umfang ist Länge plus Breite – die Länge muss noch abgezogen werden.')];
      hints = ['Der halbe Umfang ist Länge plus Breite.', `Breite: ${tex(`${U}:2-${a}=${b}`)}.`]; explain = `Breite: ${tex(`${U / 2}-${a}=${b}`)}. Fläche: ${tex(`${a}\\cdot${b}=${a * b}\\,\\text{${u}}^2`)}.`; }
    if (!gut(opts)) continue;
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
  for (;;) {
    const kind = pick(tier(lv, ['wert'], ['wert', 'gleich'], ['gleich', 'zwei'], ['zwei', 'wertneg'], ['zwei', 'wertneg', 'quad']));
    const a = ri(2, 9), b = ri(2, 9), c = ri(2, 6), d = ri(2, 6);
    const T = (t, correct, why) => ({ tex: t, correct, why });
    if (kind === 'wert' || kind === 'wertneg') { const x = kind === 'wert' ? ri(2, 6) : -ri(2, 5), r = a * x + b;
      const opts = [N(r, true), N(Number(`${a}${Math.abs(x)}`) + b, false, `Zwischen ${a} und ${tex('x')} steht ein unsichtbarer Malpunkt: ${tex(`${a}\\cdot${kl(x)}`)}.`), N(a + x + b, false, `${tex(`${a}x`)} bedeutet ${a} <b>mal</b> ${tex('x')}.`), N(a * (x + b), false, 'Punkt vor Strich: Erst wird malgenommen, dann addiert.')];
      if (!gut(opts)) continue;
      return { prompt: `Berechne den Wert des Terms für ${tex(`x=${x}`)}.`, formula: `${a}x+${b}`, options: shuffle(opts), hints: [`Setze für ${tex('x')} die Zahl ein – mit Malpunkt.`, `${tex(`${a}\\cdot${kl(x)}+${b}`)}.`], explain: `${tex(`${a}\\cdot${kl(x)}+${b}=${a * x}+${b}=${r}`)}.`, kind, x, r }; }
    if (kind === 'gleich') { const r = a + b - c; if (r === 0) continue;
      const opts = [T(term2(r, 0), true), T(term2(a + b + c, 0), false, 'Das letzte Glied wird abgezogen.'), T(`${r}x^3`, false, 'Beim Zusammenfassen bleibt die Variable, wie sie ist – nur die Zahlen davor werden verrechnet.'), T(String(r), false, 'Die Variable gehört weiter dazu.')];
      if (!uniq(opts)) continue;
      return { prompt: 'Fasse zusammen.', formula: `${a}x+${b}x-${c}x`, options: shuffle(opts), hints: ['Gleichartige Glieder: Nur die Zahlen vor der Variablen werden verrechnet.', `${tex(`${a}+${b}-${c}=${r}`)}.`], explain: `${tex(`${a}x+${b}x-${c}x=${term2(r, 0)}`)}.`, kind }; }
    if (kind === 'quad') { const r = a - c; if (r === 0) continue;
      const opts = [T(`${glied(r, 'x^2', true)}${glied(b, 'x', false)}`, true), T(`${glied(r + b, 'x^2', true)}`, false, `${tex('x^2')} und ${tex('x')} sind verschiedene Glieder – sie lassen sich nicht zusammenfassen.`), T(`${glied(r + b, 'x^3', true)}`, false, 'Beim Zusammenfassen ändern sich die Hochzahlen nicht.'), T(`${glied(a + c, 'x^2', true)}${glied(b, 'x', false)}`, false, 'Das letzte Glied wird abgezogen.')];
      if (!uniq(opts)) continue;
      return { prompt: 'Fasse zusammen.', formula: `${a}x^2+${b}x-${c}x^2`, options: shuffle(opts), hints: [`Nur Glieder mit derselben Variablen <b>und</b> derselben Hochzahl gehören zusammen.`, `${tex(`${a}x^2-${c}x^2`)} lässt sich verrechnen, ${tex(`${b}x`)} bleibt stehen.`], explain: `${tex(`${a}x^2-${c}x^2+${b}x=${opts[0].tex}`)}.`, kind }; }
    const kx = a - c, ky = b + d; if (kx === 0) continue;
    const opts = [T(term2(kx, ky), true), T(term2(a + c, b + d), false, `Vor ${tex(`${c}x`)} steht ein Minus.`), T(`${kx + ky}xy`, false, `${tex('x')} und ${tex('y')} sind verschiedene Variablen – sie lassen sich nicht zusammenfassen.`), T(term2(kx, b - d), false, `Vor ${tex(`${d}y`)} steht ein Plus.`)];
    if (!uniq(opts) || b === d) continue;
    return { prompt: 'Fasse zusammen.', formula: `${a}x+${b}y-${c}x+${d}y`, options: shuffle(opts), hints: [`Sortiere: erst alle Glieder mit ${tex('x')}, dann alle mit ${tex('y')}.`, `${tex(`${a}x-${c}x`)} und ${tex(`${b}y+${d}y`)}.`], explain: `${tex(`${a}x-${c}x+${b}y+${d}y=${term2(kx, ky)}`)}.`, kind };
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
  for (;;) {
    const kind = pick(tier(lv, ['quadrat'], ['quadrat', 'mal'], ['mal', 'teil', 'summe'], ['teil', 'summe', 'bruch'], ['teil', 'bruch', 'summe']));
    const T = (t, num, correct, why) => ({ tex: t, num, correct, why });
    if (kind === 'quadrat') { const a = ri(2, lv >= 2 ? 15 : 10), q = a * a;
      const opts = [N(a, true), N(q / 2, false, 'Die Wurzel ist nicht die Hälfte. Gesucht ist die Zahl, die mit sich selbst malgenommen den Wert ergibt.'), N(q * q, false, 'Das ist das Quadrat. Die Wurzel macht das Quadrieren rückgängig.'), N(a + 1, false, `${tex(`${a + 1}^2=${(a + 1) ** 2}`)} – das ist zu groß.`)];
      if (!gut(opts)) continue;
      return { prompt: 'Berechne.', formula: `\\sqrt{${q}}`, options: shuffle(opts), hints: ['Welche Zahl ergibt mit sich selbst malgenommen diesen Wert?', `${tex(`${a}\\cdot${a}`)}.`], explain: `${tex(`\\sqrt{${q}}=${a}`)}, denn ${tex(`${a}^2=${q}`)}.`, kind, r: a }; }
    if (kind === 'mal') { const [x, y] = pick([[2, 8], [3, 12], [2, 18], [5, 20], [3, 27], [2, 32], [6, 24], [2, 50]]), r = Math.sqrt(x * y);
      const opts = [N(r, true), T(`\\sqrt{${x + y}}`, Math.sqrt(x + y), false, 'Beim Malnehmen werden die Zahlen unter der Wurzel malgenommen, nicht addiert.'), N(x * y, false, 'Am Ende muss noch die Wurzel gezogen werden.'), N((x * y) / 2, false, 'Die Wurzel ist nicht die Hälfte.')];
      if (!gut(opts)) continue;
      return { prompt: 'Vereinfache.', formula: `\\sqrt{${x}}\\cdot\\sqrt{${y}}`, options: shuffle(opts), hints: [`${tex('\\sqrt a\\cdot\\sqrt b=\\sqrt{a\\cdot b}')}.`, `${tex(`\\sqrt{${x * y}}`)}.`], explain: `${tex(`\\sqrt{${x}}\\cdot\\sqrt{${y}}=\\sqrt{${x * y}}=${r}`)}.`, kind, r }; }
    if (kind === 'summe') { const a = ri(2, 6), b = ri(2, 6), s = Math.sqrt(a * a + b * b);
      const opts = [N(a + b, true), T(`\\sqrt{${a * a + b * b}}`, +s.toFixed(6), false, `Wurzeln darf man beim Addieren nicht zusammenziehen: ${tex('\\sqrt a+\\sqrt b\\ne\\sqrt{a+b}')}.`), N(a * b, false, 'Hier steht ein Plus, kein Malpunkt.'), N((a * a + b * b) / 2, false, 'Zieh erst jede Wurzel einzeln, dann addiere.')];
      if (!gut(opts) || Number.isInteger(s)) continue;
      return { prompt: 'Berechne.', formula: `\\sqrt{${a * a}}+\\sqrt{${b * b}}`, options: shuffle(opts), hints: ['Zieh jede Wurzel einzeln.', `${tex(`${a}+${b}`)}.`], explain: `${tex(`\\sqrt{${a * a}}+\\sqrt{${b * b}}=${a}+${b}=${a + b}`)}.`, kind, r: a + b }; }
    if (kind === 'bruch') { const a = ri(2, 9), b = ri(2, 9); if (a === b || gcd(a, b) !== 1) continue;
      const opts = [T(br(a, b), a / b, true), T(br(a * a, b), (a * a) / b, false, 'Auch aus dem Zähler wird die Wurzel gezogen.'), T(br(a, b * b), a / (b * b), false, 'Auch aus dem Nenner wird die Wurzel gezogen.'), T(br(a * a, 2 * b * b), (a * a) / (2 * b * b), false, 'Die Wurzel ist nicht die Hälfte.')];
      if (!gut(opts)) continue;
      return { prompt: 'Berechne.', formula: `\\sqrt{${br(a * a, b * b)}}`, options: shuffle(opts), hints: ['Die Wurzel aus einem Bruch: Wurzel aus dem Zähler durch Wurzel aus dem Nenner.', `${tex(`${br(`\\sqrt{${a * a}}`, `\\sqrt{${b * b}}`)}`)}.`], explain: `${tex(`\\sqrt{${br(a * a, b * b)}}=${br(a, b)}`)}.`, kind, r: a / b }; }
    const q = pick([2, 3, 4, 5, 6]), k = pick([2, 3, 5, 6, 7]), n = q * q * k;
    const opts = [T(`${q}\\sqrt{${k}}`, q * Math.sqrt(k), true), T(`${q * q}\\sqrt{${k}}`, q * q * Math.sqrt(k), false, 'Aus der Quadratzahl wird die Wurzel gezogen, bevor sie vor die Wurzel kommt.'), T(`${k}\\sqrt{${q}}`, k * Math.sqrt(q), false, 'Vor die Wurzel kommt die Wurzel der Quadratzahl; der andere Faktor bleibt darunter.'), N(q * k, false, 'Die Wurzel verschwindet nicht einfach: Nur aus der Quadratzahl lässt sie sich ziehen, der Rest bleibt unter der Wurzel.')];
    if (!gut(opts)) continue;
    return { prompt: 'Zieh teilweise die Wurzel.', formula: `\\sqrt{${n}}`, options: shuffle(opts), hints: ['Zerlege die Zahl unter der Wurzel in eine Quadratzahl mal einen Rest.', `${tex(`${n}=${q * q}\\cdot${k}`)}.`], explain: `${tex(`\\sqrt{${n}}=\\sqrt{${q * q}\\cdot${k}}=${q}\\sqrt{${k}}`)}.`, kind, r: q * Math.sqrt(k) };
  }
}

/** Exponentielles Wachstum: Zinseszins, Zunahme und Abnahme in Prozent. */
export function genZinseszins(lv = 3) {
  for (;;) {
    const kind = pick(tier(lv, ['faktor'], ['faktor', 'ein'], ['zwei', 'formel'], ['zwei', 'abnahme', 'formel'], ['abnahme', 'drei']));
    const p = pick(tier(lv, [10, 20, 50], [5, 10, 20, 25], [2, 4, 5, 10], [3, 5, 8, 20], [2.5, 4, 12, 15])), K = pick([200, 400, 500, 1000, 2000, 5000]);
    const q = 1 + p / 100, E = (num, c, w) => N(+num.toFixed(2), c, w, `${ft(num, 2)}\\,\\text{€}`);
    if (kind === 'faktor') { const ab = lv >= 2 && rand() < 0.4, r = ab ? 1 - p / 100 : q;
      const opts = [N(r, true), N(ab ? q : 1 - p / 100, false, ab ? 'Bei einer Abnahme wird der Prozentsatz von 100 % abgezogen.' : 'Bei einer Zunahme kommt der Prozentsatz zu 100 % dazu.'), N(p / 100, false, 'Das ist nur der Anteil der Änderung. Der alte Wert (100 %) bleibt ja erhalten.'), N(ab ? 1 - p / 10 : 1 + p / 10, false, `${fmt(p)} % sind ${fmt(p / 100, 3)}, nicht ${fmt(p / 10, 2)}.`)];
      if (!gut(opts)) continue;
      return { prompt: `Ein Wert ${ab ? 'nimmt' : 'wächst'} jedes Jahr um ${fmt(p)} % ${ab ? 'ab' : ''}. Mit welchem Faktor wird er jedes Jahr malgenommen?`.replace(' .', '.').replace(' ?', '?'), options: shuffle(opts), hints: ['Der alte Wert sind 100 %.', ab ? `${tex(`100\\,\\%-${ft(p)}\\,\\%`)} als Dezimalzahl.` : `${tex(`100\\,\\%+${ft(p)}\\,\\%`)} als Dezimalzahl.`], explain: `${tex(`${ab ? `1-${ft(p / 100, 3)}` : `1+${ft(p / 100, 3)}`}=${ft(r, 3)}`)}.`, kind, r }; }
    if (kind === 'formel') { const n = ri(3, 8), O = (t, c, w) => ({ tex: t, correct: c, why: w });
      const opts = [O(`${K}\\cdot${ft(q, 3)}^{${n}}`, true), O(`${K}\\cdot${ft(q, 3)}\\cdot${n}`, false, 'Jedes Jahr wird neu malgenommen – das ist eine Potenz, kein Produkt mit der Zahl der Jahre.'), O(`${K}+${n}\\cdot${ft(p)}`, false, 'Prozente sind ein Anteil, kein fester Betrag – und die Zinsen werden mitverzinst.'), O(`${K}\\cdot${ft(p / 100, 3)}^{${n}}`, false, `Der Wachstumsfaktor ist ${tex(ft(q, 3))}, nicht ${tex(ft(p / 100, 3))}.`)];
      if (!uniq(opts)) continue;
      return { prompt: `${K} € werden ${n} Jahre lang mit ${fmt(p)} % verzinst (mit Zinseszins). Welcher Term beschreibt das Guthaben danach?`, options: shuffle(opts), hints: ['Jedes Jahr wird das Guthaben mit demselben Faktor malgenommen.', `Der Faktor ist ${tex(ft(q, 3))}; nach ${n} Jahren also ${n}-mal.`], explain: `${tex(`K=${K}\\cdot${ft(q, 3)}^{${n}}`)}.`, kind }; }
    const n = kind === 'ein' ? 1 : kind === 'drei' ? 3 : 2, ab = kind === 'abnahme', f = ab ? 1 - p / 100 : q, r = K * f ** n;
    const opts = [E(r, true), E(K * (1 + ((ab ? -1 : 1) * n * p) / 100), false, n === 1 ? 'Rechne den Prozentwert aus und addiere ihn.' : 'Im zweiten Jahr werden auch die Zinsen des ersten Jahres mitgerechnet (Zinseszins).'), E(K + (ab ? -1 : 1) * n * p, false, `${fmt(p)} % sind nicht ${fmt(p)} €.`), E(ab ? K * q ** n : K * (1 - p / 100) ** n, false, ab ? 'Der Wert nimmt ab – der Faktor ist kleiner als 1.' : 'Der Wert wächst – der Faktor ist größer als 1.')];
    if (n === 1) opts[1] = E((K * p) / 100, false, 'Das sind nur die Zinsen. Gefragt ist das ganze Guthaben.');
    if (!gut(opts)) continue;
    return { prompt: ab ? `Ein Auto kostet ${gT(K * 10)} € und verliert jedes Jahr ${fmt(p)} % an Wert. Wie viel ist es nach ${n} Jahren noch wert?`.replace(`${gT(K * 10)} €`, `${gT(K)} €`) : `${K} € werden mit ${fmt(p)} % pro Jahr verzinst. Wie hoch ist das Guthaben nach ${n === 1 ? 'einem Jahr' : `${n} Jahren`}?`, options: shuffle(opts), hints: [`Der Faktor pro Jahr ist ${tex(ft(f, 3))}.`, `${tex(`${K}\\cdot${ft(f, 3)}${n > 1 ? `^{${n}}` : ''}`)}.`], explain: `${tex(`${K}\\cdot${ft(f, 3)}${n > 1 ? `^{${n}}` : ''}=${ft(r, 2)}`)} €.`, kind, r: +r.toFixed(2) };
  }
}

/** Quader und Würfel: Rauminhalt, Oberfläche, fehlende Kante, zusammengesetzte Körper. */
export function genQuader(lv = 3) {
  for (;;) {
    const kind = pick(tier(lv, ['quader'], ['quader', 'wuerfel'], ['oberflaeche', 'wuerfel', 'kante'], ['kante', 'oberflaeche', 'wuerfelo'], ['kante', 'doppel', 'wuerfelo']));
    const a = ri(2, 9), b = ri(2, 8), c = ri(2, 7);
    const V = (num, cc, w) => N(num, cc, w, `${ft(num)}\\,\\text{cm}^3`), F = (num, cc, w) => N(num, cc, w, `${ft(num)}\\,\\text{cm}^2`), L = (num, cc, w) => N(num, cc, w, `${ft(num)}\\,\\text{cm}`);
    let prompt, opts, hints, explain;
    if (kind === 'quader') { prompt = `Ein Quader ist ${a} cm lang, ${b} cm breit und ${c} cm hoch. Wie groß ist sein Rauminhalt?`;
      opts = [V(a * b * c, true), V(a + b + c, false, 'Die drei Kantenlängen werden malgenommen, nicht addiert.'), V(2 * (a * b + a * c + b * c), false, 'Das ist die Maßzahl der Oberfläche.'), V(a * b, false, 'Das ist nur die Grundfläche – die Höhe fehlt.')];
      hints = ['Rauminhalt eines Quaders: Länge mal Breite mal Höhe.', `${tex(`${a}\\cdot${b}\\cdot${c}`)}.`]; explain = `${tex(`V=${a}\\cdot${b}\\cdot${c}=${a * b * c}\\,\\text{cm}^3`)}.`; }
    else if (kind === 'wuerfel') { if (a <= 3) continue; prompt = `Ein Würfel hat die Kantenlänge ${a} cm. Wie groß ist sein Rauminhalt?`;
      opts = [V(a ** 3, true), V(3 * a, false, 'Hoch 3 heißt: dreimal mit sich selbst malnehmen, nicht mal 3.'), V(a * a, false, 'Das ist die Fläche einer Seite – die dritte Kante fehlt.'), V(6 * a * a, false, 'Das ist die Maßzahl der Oberfläche (sechs Quadrate).')];
      hints = ['Beim Würfel sind alle Kanten gleich lang.', `${tex(`${a}\\cdot${a}\\cdot${a}`)}.`]; explain = `${tex(`V=${a}^3=${a ** 3}\\,\\text{cm}^3`)}.`; }
    else if (kind === 'wuerfelo') { if (a <= 3 || a === 6) continue; prompt = `Ein Würfel hat die Kantenlänge ${a} cm. Wie groß ist seine Oberfläche?`;
      opts = [F(6 * a * a, true), F(a ** 3, false, 'Das ist die Maßzahl des Rauminhalts.'), F(4 * a * a, false, 'Ein Würfel hat sechs Flächen – auch oben und unten.'), F(6 * a, false, 'Jede Fläche ist ein Quadrat: Kante mal Kante.')];
      hints = ['Ein Würfel hat sechs gleich große Quadrate als Flächen.', `${tex(`6\\cdot${a}\\cdot${a}`)}.`]; explain = `${tex(`O=6\\cdot${a}^2=${6 * a * a}\\,\\text{cm}^2`)}.`; }
    else if (kind === 'oberflaeche') { if (a === b || b === c || a === c) continue; prompt = `Ein Quader ist ${a} cm lang, ${b} cm breit und ${c} cm hoch. Wie groß ist seine Oberfläche?`;
      opts = [F(2 * (a * b + a * c + b * c), true), F(a * b + a * c + b * c, false, 'Jede der drei Flächen kommt zweimal vor (vorn und hinten, links und rechts, oben und unten).'), F(a * b * c, false, 'Das ist die Maßzahl des Rauminhalts.'), F(6 * a * b, false, 'Die sechs Flächen sind nicht alle gleich groß – das gilt nur beim Würfel.')];
      hints = ['Ein Quader hat sechs Flächen – je zwei sind gleich.', `${tex(`2\\cdot(${a * b}+${a * c}+${b * c})`)}.`]; explain = `${tex(`O=2\\cdot(${a * b}+${a * c}+${b * c})=${2 * (a * b + a * c + b * c)}\\,\\text{cm}^2`)}.`; }
    else if (kind === 'kante') { const vol = a * b * c; prompt = `Ein Quader hat den Rauminhalt ${vol} cm³. Er ist ${a} cm lang und ${b} cm breit. Wie hoch ist er?`;
      opts = [L(c, true), L(vol / a, false, 'Auch durch die Breite muss noch geteilt werden.'), L(vol - a - b, false, 'Der Rauminhalt ist ein Produkt – also wird geteilt, nicht abgezogen.'), L(+(vol / (a + b)).toFixed(2), false, 'Geteilt wird durch die Grundfläche: Länge <b>mal</b> Breite.')];
      hints = ['Höhe = Rauminhalt durch Grundfläche.', `Grundfläche: ${tex(`${a}\\cdot${b}=${a * b}`)}.`]; explain = `${tex(`h=${vol}:${a * b}=${c}\\,\\text{cm}`)}.`; }
    else { const k = ri(2, 5); prompt = `Auf einem Quader (${a} cm lang, ${b} cm breit, ${c} cm hoch) steht ein Würfel mit der Kantenlänge ${k} cm. Wie groß ist der Rauminhalt des ganzen Körpers?`;
      opts = [V(a * b * c + k ** 3, true), V(a * b * c + 3 * k, false, 'Hoch 3 heißt: dreimal mit sich selbst malnehmen, nicht mal 3.'), V(a * b * c + k * k, false, 'Der Würfel hat drei Kanten: Kante mal Kante mal Kante.'), V(a * b * c * k ** 3, false, 'Die beiden Rauminhalte werden addiert, nicht malgenommen.')];
      hints = ['Berechne beide Körper einzeln und addiere.', `Quader: ${tex(`${a * b * c}`)}. Würfel: ${tex(`${k}^3=${k ** 3}`)}.`]; explain = `${tex(`V=${a * b * c}+${k ** 3}=${a * b * c + k ** 3}\\,\\text{cm}^3`)}.`; }
    if (!gut(opts)) continue;
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
  for (;;) {
    const kind = pick(tier(lv, ['streckung'], ['streckung', 'parallel'], ['parallel', 'schatten'], ['schatten', 'rueck'], ['rueck', 'flaeche']));
    const k = pick(tier(lv, [2, 3], [2, 3, 4], [1.5, 2.5, 3], [1.5, 2.5, 4], [1.5, 2.5, 3.5])), a = ri(2, 8) * (Number.isInteger(k) ? 1 : 2), p = ri(2, 6) * (Number.isInteger(k) ? 1 : 2);
    const L = (num, c, w, e = 'cm') => N(+num.toFixed(4), c, w, `${ft(num)}\\,\\text{${e}}`);
    let prompt, opts, hints, explain;
    if (kind === 'streckung') { prompt = `Ein Dreieck wird mit dem Faktor ${fmt(k)} vergrößert. Eine Seite war ${a} cm lang. Wie lang ist sie danach?`;
      opts = [L(a * k, true), L(a + k, false, 'Beim Vergrößern wird malgenommen, nicht addiert.'), L(a / k, false, 'Das wäre eine Verkleinerung.'), L(a * k * k, false, 'Mit dem Quadrat des Faktors wachsen Flächen – Längen wachsen mit dem Faktor selbst.')];
      hints = ['Jede Länge wird mit demselben Faktor malgenommen.', `${tex(`${a}\\cdot${ft(k)}`)}.`]; explain = `${tex(`${a}\\cdot${ft(k)}=${ft(a * k)}\\,\\text{cm}`)}.`; }
    else if (kind === 'parallel') { prompt = `Zwei Strahlen gehen von Z aus und werden von zwei parallelen Geraden geschnitten. Auf dem ersten Strahl ist ZA = ${a} cm und ZA′ = ${fmt(a * k)} cm. Die innere Parallele AB ist ${p} cm lang. Wie lang ist die äußere Parallele A′B′?`;
      opts = [L(p * k, true), L(p + (a * k - a), false, 'Die Strecken wachsen im selben <b>Verhältnis</b>, nicht um denselben Betrag.'), L(p / k, false, 'Die äußere Parallele ist länger als die innere.'), L(p * a, false, 'Gebraucht wird das Verhältnis der beiden Abschnitte auf dem Strahl.')];
      hints = ['Die Parallelen verhalten sich wie die Abschnitte vom Scheitel aus.', `Faktor: ${tex(`${ft(a * k)}:${a}=${ft(k)}`)}.`]; explain = `${tex(`${p}\\cdot${ft(k)}=${ft(p * k)}\\,\\text{cm}`)}.`; }
    else if (kind === 'schatten') { const stab = pick([1, 1.5, 2]), ss = stab * pick([1.5, 2, 0.5]), bs = ss * pick([4, 6, 8]), h = (bs * stab) / ss; prompt = `Ein ${fmt(stab)} m langer Stab wirft einen ${fmt(ss)} m langen Schatten. Zur selben Zeit ist der Schatten eines Baums ${fmt(bs)} m lang. Wie hoch ist der Baum?`;
      opts = [L(h, true, undefined, 'm'), L(bs + (stab - ss), false, 'Höhe und Schatten stehen im selben <b>Verhältnis</b> – es wird nicht einfach die Differenz genommen.', 'm'), L((bs * ss) / stab, false, 'Das Verhältnis ist umgedreht: Höhe durch Schatten, nicht Schatten durch Höhe.', 'm'), L(bs * stab, false, 'Es fehlt das Teilen durch die Schattenlänge des Stabs.', 'm')];
      hints = ['Stab und Baum bilden mit ihren Schatten ähnliche Dreiecke.', `Höhe durch Schatten ist bei beiden gleich: ${tex(`${ft(stab)}:${ft(ss)}`)}.`]; explain = `${tex(`h=${ft(bs)}\\cdot\\dfrac{${ft(stab)}}{${ft(ss)}}=${ft(h)}\\,\\text{m}`)}.`; }
    else if (kind === 'rueck') { prompt = `Zwei ähnliche Dreiecke: Eine Seite ist im kleinen ${a} cm, im großen ${fmt(a * k)} cm lang. Eine andere Seite ist im großen ${fmt(p * k)} cm lang. Wie lang ist sie im kleinen Dreieck?`;
      opts = [L(p, true), L(p * k * k, false, 'Gesucht ist die Seite im <b>kleinen</b> Dreieck – es wird geteilt.'), L(p * k - (a * k - a), false, 'Ähnliche Dreiecke haben gleiche Verhältnisse, nicht gleiche Differenzen.'), L((p * k) / a, false, 'Geteilt wird durch den Vergrößerungsfaktor, nicht durch die Seitenlänge.')];
      hints = ['Bestimme zuerst den Faktor zwischen den beiden Dreiecken.', `Faktor: ${tex(`${ft(a * k)}:${a}=${ft(k)}`)}.`]; explain = `${tex(`${ft(p * k)}:${ft(k)}=${p}\\,\\text{cm}`)}.`; }
    else { const A = ri(3, 12) * 2; prompt = `Eine Figur mit dem Flächeninhalt ${A} cm² wird mit dem Faktor ${fmt(k)} vergrößert. Wie groß ist der Flächeninhalt danach?`;
      opts = [L(A * k * k, true, undefined, 'cm²'), L(A * k, false, 'Die Fläche wächst mit dem <b>Quadrat</b> des Faktors – in beide Richtungen wird gestreckt.', 'cm²'), L(A + k * k, false, 'Es wird malgenommen, nicht addiert.', 'cm²'), L(A * 2 * k, false, 'Quadrat heißt: Faktor mal Faktor, nicht 2 mal Faktor.', 'cm²')];
      opts.forEach((o) => { o.tex = o.tex.replace('\\text{cm²}', '\\text{cm}^2'); });
      hints = ['Längen wachsen mit dem Faktor, Flächen mit seinem Quadrat.', `${tex(`${ft(k)}^2=${ft(k * k)}`)}.`]; explain = `${tex(`${A}\\cdot${ft(k)}^2=${ft(A * k * k)}\\,\\text{cm}^2`)}.`; }
    if (!gut(opts) || opts.some((o) => o.num <= 0)) continue;
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

/** Alle Erzeuger dieser Datei – für Tests und Verzeichnisse. */
export const MITTEL_GENS = { genRunden, genRechenregel, genTeiler, genEinheit, genRechteck, genKuerzen, genBruchVergleich, genDezimal, genBruchDezimal, genNegativ, genTerm, genDreisatz, genLinFunktion, genWurzel, genZinseszins, genQuader, genKoerper, genWinkel, genLGS, genBinom, genStrahlensatz, genLog };

for (const [fn, topic] of [[genRunden, 'Runden'], [genRechenregel, 'Rechenregeln'], [genTeiler, 'Teiler und Vielfache'], [genEinheit, 'Größen umrechnen'], [genRechteck, 'Umfang und Flächeninhalt'],
  [genKuerzen, 'Kürzen und Erweitern'], [genBruchVergleich, 'Brüche vergleichen'], [genDezimal, 'Dezimalzahlen'], [genBruchDezimal, 'Bruch, Dezimalzahl, Prozent'], [genNegativ, 'Negative Zahlen'],
  [genTerm, 'Terme'], [genDreisatz, 'Dreisatz'], [genLinFunktion, 'Lineare Funktionen'], [genWurzel, 'Wurzeln'], [genZinseszins, 'Zinseszins und Wachstum'], [genQuader, 'Quader und Würfel'], [genKoerper, 'Körper berechnen'], [genWinkel, 'Winkel'], [genLGS, 'Gleichungssysteme'], [genBinom, 'Binomische Formeln'], [genStrahlensatz, 'Strahlensätze'], [genLog, 'Logarithmus']]) fn.topic = topic;
