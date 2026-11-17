// Aufgaben-Erzeuger, Teil 7: weitere Themen der Klassen 5 bis 10 (Paket 0.32).
// Gleiche Regeln wie in gen.js: Schwierigkeit lv (1–5), jede Aufgabe frisch gewürfelt (nur ri/pick/rand aus math.js),
// falsche Antworten sind typische Fehler mit Diagnose und nie zufällig auch richtig, mindestens zwei Tipps.
import { ri, pick, shuffle, rand, ft, fmt } from './math.js';
import { tex } from './ui.js';
import { tier, uniq, uniqNum } from './gen.js';

const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const gT = (n) => (Math.abs(n) >= 10000 && Number.isInteger(n) ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : fmt(n, 4));
const gX = (n) => (Math.abs(n) >= 10000 && Number.isInteger(n) ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') : ft(n, 4));
const N = (num, correct, why, t) => ({ tex: t ?? gX(num), num, correct, why });
const E = (num, correct, why, e) => N(+(+num).toFixed(4), correct, why, `${gX(+(+num).toFixed(4))}\\,${e === '%' ? '\\%' : e === '°' ? '' : `\\text{${e}}`}${e === '°' ? '^\\circ' : ''}`.replace('\\,^', '^').replace(/\\text\{([a-z]+)([²³])\}/, (m, u, h) => `\\text{${u}}^${h === '²' ? 2 : 3}`));
const br = (a, b) => `\\dfrac{${a}}{${b}}`;
const kl = (n) => (n < 0 ? `(${ft(n)})` : ft(n));
const gut = (opts) => opts.every((o) => Number.isFinite(o.num)) && uniqNum(opts) && uniq(opts);
const fertig = (prompt, formula, opts, hints, explain, kind, daten) => ({ prompt, formula, options: shuffle(opts), hints, explain, kind, daten });
const R = (v, d = 2) => +(+v).toFixed(d);
const pm = (v) => (v < 0 ? `${v}` : `+${v}`);                       // ganze Zahl mit Vorzeichen
const pmf = (v) => (v < 0 ? ft(v) : `+${ft(v)}`);                   // Dezimalzahl mit Vorzeichen (TeX)
const eu = (n) => (Number.isInteger(R(n)) ? gT(R(n)) : R(n).toFixed(2).replace('.', ','));   // Euro-Betrag als Text
const euX = (n) => eu(n).replace(',', '{,}').replace(/ /g, '\\,');
const EU = (num, correct, why) => N(R(num), correct, why, `${euX(num)}\\,\\text{€}`);
/** Gerundete Antwort mit „≈“ (d Nachkommastellen, e = Einheit als TeX-Anhang). Der gespeicherte Wert ist der gerundete. */
const AP = (num, d, correct, why, e = '') => N(R(num, d), correct, why, `\\approx ${ft(R(num, d), d)}${e}`);
const B = (a, b, correct, why) => ({ tex: a === 0 ? '0' : a === b ? '1' : br(a / gcd(a, b), b / gcd(a, b)), num: a / b, correct, why });

/* ───────────── Klasse 5 ───────────── */

const stellen = (a) => String(a).split('').map((c, i, arr) => +c * 10 ** (arr.length - 1 - i)).filter((v) => v);
/** Produkt als Rechnung in Teilschritten: einstelliger Faktor Stelle für Stelle, zweistelliger Faktor in Zehner- und Einerzeile. */
const teilProd = (a, b) => (b < 10
  ? `${gX(a)}\\cdot ${b}=${stellen(a).map((s) => `${gX(s)}\\cdot ${b}`).join('+')}=${stellen(a).map((s) => gX(s * b)).join('+')}=${gX(a * b)}`
  : `${gX(a)}\\cdot ${b}=${gX(a)}\\cdot ${b - (b % 10)}+${gX(a)}\\cdot ${b % 10}=${gX(a * (b - (b % 10)))}+${gX(a * (b % 10))}=${gX(a * b)}`);
/** Quotient als Rechnung: der Dividend wird in zwei bequem teilbare Teile zerlegt. */
const teilQuot = (a, b) => { const q = a / b, qh = Math.floor(q / 100) * 100, x = b * qh; return qh && q - qh ? `${gX(a)}:${b}=(${gX(x)}+${gX(a - x)}):${b}=${gX(qh)}+${q - qh}=${gX(q)}` : `${gX(a)}:${b}=${gX(q)}`; };
const hundert = (v) => Math.round(v / 100) * 100;

/** Schriftlich rechnen: Addieren, Abziehen, Malnehmen und Teilen mit großen Zahlen – bis zu verschachtelten Rechenausdrücken. */
export function genSchriftlich(lv = 3) {
  for (;;) {
    const kind = pick(tier(lv, ['plus'], ['plus', 'minus'], ['minus', 'mal', 'drei'], ['malzwei', 'geteilt', 'kette'], ['klammer', 'gemischt', 'teilzwei']));
    let formula, opts, hints, explain;
    if (kind === 'plus' || kind === 'drei') { const klein = lv <= 1, a = klein ? ri(120, 480) : ri(1000, 9000), b = klein ? ri(15, 89) : ri(500, 8000), c = kind === 'drei' ? ri(300, 4000) : 0, s = a + b + c, e = (a % 10) + (b % 10) + (c % 10);
      if (e < 10) continue;
      formula = `${gX(a)}+${gX(b)}${c ? `+${gX(c)}` : ''}`;
      opts = [N(s, true), N(s - 10, false, 'Der Übertrag von der Einerstelle fehlt.'), N(s + 100, false, 'Ein Übertrag wurde doppelt gezählt.'), N(s - 100, false, 'Der Übertrag in die Hunderterstelle fehlt.')];
      hints = ['Schreib die Zahlen stellengerecht untereinander: Einer unter Einer.', 'Rechne von rechts nach links und merke dir jeden Übertrag.'];
      if (!klein) hints.push(`Einerstelle: ${tex(`${a % 10}+${b % 10}${c ? `+${c % 10}` : ''}=${e}`)} – schreibe ${e % 10}, merke ${Math.floor(e / 10)}.`);
      explain = `${tex(`${formula}=${gX(s)}`)}.${klein ? '' : ` Probe mit dem Überschlag: ${tex(`${gX(hundert(a))}+${gX(hundert(b))}${c ? `+${gX(hundert(c))}` : ''}=${gX(hundert(a) + hundert(b) + hundert(c))}`)} – die Größenordnung stimmt.`}`; }
    else if (kind === 'minus') { const gross = lv >= 3, a = gross ? ri(4000, 9000) : ri(400, 900), b = gross ? ri(1000, 3500) : ri(100, 350), d = a - b; if (a % 10 >= b % 10) continue; formula = `${gX(a)}-${gX(b)}`;
      opts = [N(d, true), N(d + 10, false, 'Beim Entbündeln wurde der Zehner nicht verringert.'), N(a - b + 2 * ((b % 10) - (a % 10)), false, 'An der Einerstelle wurde die kleinere von der größeren Ziffer abgezogen – egal, welche oben steht.'), N(a + b, false, 'Hier wird abgezogen, nicht addiert.')];
      hints = ['Stellengerecht untereinander schreiben.', `An der Einerstelle ist ${a % 10} kleiner als ${b % 10}: Ein Zehner wird entbündelt.`];
      if (gross) hints.push(`Einerstelle: ${tex(`${10 + (a % 10)}-${b % 10}=${10 + (a % 10) - (b % 10)}`)} – dafür ist oben ein Zehner weniger.`);
      explain = `${tex(`${formula}=${gX(d)}`)}. Probe: ${tex(`${gX(d)}+${gX(b)}=${gX(a)}`)}.`; }
    else if (kind === 'mal') { const a = ri(123, 899), b = ri(3, 9), p = a * b; if (a % 10 === 0) continue; formula = `${a}\\cdot ${b}`;
      opts = [N(p, true), N(p - (a % 10) * b + (((a % 10) * b) % 10), false, 'Der Übertrag aus der Einerstelle wurde nicht weitergerechnet.'), N(p + b * 10, false, 'Ein Übertrag wurde doppelt gezählt.'), N(p - 100, false, 'Der Übertrag in die Hunderterstelle fehlt.')];
      hints = ['Nimm jede Stelle einzeln mal, von rechts nach links.', `Zerlege: ${tex(`${a}=${stellen(a).join('+')}`)}.`, `Überschlag: ${tex(`${Math.round(a / 10) * 10}\\cdot ${b}=${gX(Math.round(a / 10) * 10 * b)}`)}.`]; explain = `${tex(teilProd(a, b))}.`; }
    else if (kind === 'malzwei') { const a = ri(123, 899), b = ri(12, 89), p = a * b, X = a * (b - (b % 10)), Y = a * (b % 10); if (a % 10 === 0 || b % 10 === 0) continue; formula = `${a}\\cdot ${b}`;
      opts = [N(p, true), N(a * Math.floor(b / 10) + Y, false, 'Die Zehnerziffer steht für Zehner: Diese Zeile rückt eine Stelle nach links.'), N(X, false, 'Die Zeile für die Einerziffer fehlt.'), N(p - 100, false, 'Beim Addieren der beiden Zeilen fehlt ein Übertrag.')];
      hints = [`Zerlege den zweiten Faktor: ${tex(`${b}=${b - (b % 10)}+${b % 10}`)}.`, `Zehnerzeile: ${tex(`${a}\\cdot ${b - (b % 10)}=${gX(X)}`)}.`, `Einerzeile: ${tex(`${a}\\cdot ${b % 10}=${gX(Y)}`)}.`, 'Addiere beide Zeilen stellengerecht.']; explain = `${tex(teilProd(a, b))}.`; }
    else if (kind === 'geteilt') { const b = ri(3, 9), q = ri(104, 890), a = b * q; if (q % 100 === 0) continue; formula = `${gX(a)}:${b}`;
      opts = [N(q, true), N(q + 10, false, 'Eine Stelle wurde falsch geschätzt – mach die Probe durch Malnehmen.'), N(q - 1, false, `Probe: ${tex(`${q - 1}\\cdot ${b}=${gX((q - 1) * b)}`)} – das ist zu wenig.`), N(String(q).includes('0') ? +String(q).replace('0', '') : q + 100, false, String(q).includes('0') ? 'Eine Null im Ergebnis wurde vergessen: Passt der Teiler nicht hinein, steht dort eine 0.' : 'Die Stellenzahl stimmt nicht – mach einen Überschlag.')];
      hints = ['Teile Stelle für Stelle von links nach rechts.', `Zerlege den Dividenden in bequeme Teile: ${tex(`${gX(a)}=${gX(b * Math.floor(q / 100) * 100)}+${gX(a - b * Math.floor(q / 100) * 100)}`)}.`, `Probe: Ergebnis mal ${b} muss ${gT(a)} ergeben.`]; explain = `${tex(teilQuot(a, b))}, Probe: ${tex(`${q}\\cdot ${b}=${gX(a)}`)}.`; }
    else if (kind === 'kette') { const a = ri(23, 189), b = ri(3, 9), p = a * b, r = ri(150, 4000), c = p + r; if (a % 10 === 0) continue; formula = `${gX(c)}-${a}\\cdot ${b}`;
      opts = [N(r, true), N((c - a) * b, false, 'Punkt vor Strich: Erst wird malgenommen, dann abgezogen.'), N(c + p, false, 'Das Produkt wird abgezogen, nicht addiert.'), N(r + 100, false, 'Beim Abziehen wurde ein Hunderter nicht entbündelt.')];
      hints = ['Punkt vor Strich: Zuerst wird das Produkt ausgerechnet.', `${tex(teilProd(a, b))}.`, `Dann abziehen: ${tex(`${gX(c)}-${gX(p)}`)}.`]; explain = `${tex(`${formula}=${gX(c)}-${gX(p)}=${gX(r)}`)}.`; }
    else if (kind === 'klammer') { const a = ri(1200, 6800), b = ri(350, 2900), c = ri(12, 39), e = ri(3, 12), q = ri(104, 890), d = e * q, S = a + b, P = S * c, r = P - q; if (c % 10 === 0) continue;
      formula = `(${gX(a)}+${gX(b)})\\cdot ${c}-${gX(d)}:${e}`;
      opts = [N(r, true), N(a + b * c - q, false, 'Die Klammer wird zuerst ausgerechnet – erst danach wird malgenommen.'), N(P + q, false, 'Der Quotient wird abgezogen, nicht addiert.'), N(P - d, false, `Punkt vor Strich: Erst wird ${tex(`${gX(d)}:${e}`)} gerechnet – abgezogen wird der Quotient, nicht ${gT(d)}.`)];
      hints = [`Klammer zuerst: ${tex(`${gX(a)}+${gX(b)}=${gX(S)}`)}.`, `Punkt vor Strich, erstes Produkt: ${tex(teilProd(S, c))}.`, `Dann der Quotient: ${tex(teilQuot(d, e))}.`, `Zum Schluss abziehen: ${tex(`${gX(P)}-${gX(q)}`)}.`];
      explain = `${tex(`${gX(S)}\\cdot ${c}-${gX(d)}:${e}=${gX(P)}-${gX(q)}=${gX(r)}`)}. Probe mit dem Überschlag: ${tex(`${gX(hundert(S))}\\cdot ${Math.round(c / 10) * 10}=${gX(hundert(S) * Math.round(c / 10) * 10)}`)} – die Größenordnung stimmt.`; }
    else if (kind === 'gemischt') { const a = ri(213, 899), b = ri(12, 39), d = ri(3, 12), q = ri(104, 890), c = d * q, e = ri(1050, 9500), P = a * b, r = P - q + e; if (a % 10 === 0 || b % 10 === 0) continue;
      formula = `${a}\\cdot ${b}-${gX(c)}:${d}+${gX(e)}`;
      opts = [N(r, true), N(P - q - e, false, `Das Minus gilt nur für den Quotienten – ${gT(e)} wird addiert.`), N(P + q + e, false, 'Der Quotient wird abgezogen, nicht addiert.'), N(P - c + e, false, `Punkt vor Strich: Erst wird ${tex(`${gX(c)}:${d}`)} gerechnet – abgezogen wird der Quotient.`)];
      hints = [`Punkt vor Strich, erst das Produkt: ${tex(teilProd(a, b))}.`, `Dann der Quotient: ${tex(teilQuot(c, d))}.`, `Jetzt von links nach rechts: ${tex(`${gX(P)}-${gX(q)}=${gX(P - q)}`)}.`, `Zum Schluss ${gT(e)} addieren.`];
      explain = `${tex(`${gX(P)}-${gX(q)}+${gX(e)}=${gX(P - q)}+${gX(e)}=${gX(r)}`)}.`; }
    else { const b = ri(12, 48), q = ri(207, 1890), k = ri(11, 95), a = b * (q + k), c = b * k, m = a - c; if (q % 100 === 0 || b % 10 === 0) continue;
      formula = `(${gX(a)}-${gX(c)}):${b}`;
      opts = [N(q, true), N(a - k, false, `Die Klammer wird zuerst ausgerechnet – nicht erst ${tex(`${gX(c)}:${b}`)}.`), N(q + 10, false, 'Die Zehnerstelle wurde falsch geschätzt – mach die Probe durch Malnehmen.'), N(q - 1, false, `Probe: ${tex(`${gX(q - 1)}\\cdot ${b}=${gX((q - 1) * b)}`)} – das ist zu wenig.`)];
      hints = [`Klammer zuerst: ${tex(`${gX(a)}-${gX(c)}=${gX(m)}`)}.`, `Überschlag für den Quotienten: ${tex(`${gX(hundert(m))}:${Math.round(b / 10) * 10}\\approx ${gX(Math.round(hundert(m) / (Math.round(b / 10) * 10)))}`)}.`, `Zerlege geschickt: ${tex(teilQuot(m, b))}.`, `Probe: ${tex(`${gX(q)}\\cdot ${b}`)} muss ${gT(m)} ergeben.`];
      explain = `${tex(`${gX(m)}:${b}=${gX(q)}`)}, denn ${tex(teilProd(q, b))}.`; }
    if (!gut(opts) || opts.some((o) => o.num <= 0)) continue;
    return fertig(lv >= 4 && kind !== 'malzwei' && kind !== 'geteilt' ? 'Rechne schriftlich. Achte auf die Reihenfolge der Rechenschritte.' : 'Rechne schriftlich.', formula, opts, hints, explain, kind);
  }
}

/** Koordinatensystem: Punkte ablesen, verschieben, spiegeln, fehlende Ecken, Flächen im Gitter. */
export function genKoordinaten(lv = 3) {
  for (;;) {
    const kind = pick(tier(lv, ['weg'], ['schieben', 'abstand'], ['ecke', 'mitte', 'quadrant'], ['flaeche', 'spiegeln', 'parallelogramm'], ['dreieck', 'bild', 'diagonal']));
    const neg = lv >= 4, x = ri(neg ? -5 : 1, 7), y = ri(neg ? -5 : 1, 7), dx = ri(1, 4), dy = ri(1, 4);
    const P = (a, b, correct, why) => ({ tex: `(${ft(a)}\\mid ${ft(b)})`, num: a * 100 + b, correct, why });
    const pt = (n, a, b) => tex(`${n}(${ft(a)}\\mid ${ft(b)})`);
    const wg = (u, h) => `${gT(Math.abs(u))} nach ${u > 0 ? 'rechts' : 'links'} und ${gT(Math.abs(h))} nach ${h > 0 ? 'oben' : 'unten'}`;
    let prompt, opts, hints, explain, daten;
    if (kind === 'weg') { if (x === y) continue; prompt = `Du startest im Ursprung und gehst ${x} nach rechts und ${y} nach oben. Bei welchem Punkt kommst du an?`;
      opts = [P(x, y, true), P(y, x, false, 'Die erste Zahl gehört zur x-Achse (rechts/links), die zweite zur y-Achse (oben/unten).'), P(x + y, 0, false, 'Rechts und oben sind zwei verschiedene Richtungen – die Schritte werden nicht zusammengezählt.'), P(x, y + 1, false, 'Zähle die Schritte nach oben noch einmal nach.')];
      hints = ['Erst nach rechts, dann nach oben – wie beim Lesen eines Stadtplans.', `Punkte schreibt man ${tex('(x\\mid y)')}.`]; explain = `${tex(`P(${x}\\mid ${y})`)}: erst der x-Wert, dann der y-Wert.`; }
    else if (kind === 'schieben') { if (dx === dy || y - dy < 0) continue; prompt = `Der Punkt ${tex(`A(${x}\\mid ${y})`)} wird um ${dx} nach rechts und um ${dy} nach unten verschoben. Wo liegt er danach?`;
      opts = [P(x + dx, y - dy, true), P(x + dx, y + dy, false, 'Nach unten heißt: Der y-Wert wird kleiner.'), P(x - dy, y + dx, false, 'Rechts/links ändert den x-Wert, oben/unten den y-Wert.'), P(x - dx, y - dy, false, 'Nach rechts heißt: Der x-Wert wird größer.')];
      hints = ['Rechts/links ändert nur den x-Wert.', 'Oben/unten ändert nur den y-Wert.']; explain = `${tex(`(${x}+${dx}\\mid ${y}-${dy})=(${x + dx}\\mid ${y - dy})`)}.`; }
    else if (kind === 'abstand') { const waag = rand() < 0.5, x2 = x + dx + 2, y2 = y + dy + 1; prompt = waag ? `Wie weit sind ${tex(`A(${x}\\mid ${y})`)} und ${tex(`B(${x2}\\mid ${y})`)} voneinander entfernt (in Kästchen)?` : `Wie weit sind ${tex(`A(${x}\\mid ${y})`)} und ${tex(`B(${x}\\mid ${y2})`)} voneinander entfernt (in Kästchen)?`;
      const d = waag ? x2 - x : y2 - y, falsch = waag ? x2 + x : y2 + y; if (falsch === d) continue;
      opts = [N(d, true), N(falsch, false, 'Der Abstand ist der Unterschied der Werte, nicht ihre Summe.'), N(d + 1, false, 'Gezählt werden die Schritte zwischen den Punkten, nicht die Gitterpunkte.'), N(waag ? Math.abs(y) || d + 2 : Math.abs(x) || d + 2, false, 'Schau auf die Koordinate, die sich ändert.')];
      hints = [`Die Punkte liegen auf einer ${waag ? 'waagerechten' : 'senkrechten'} Linie.`, 'Zieh die beiden Werte voneinander ab, die verschieden sind.']; explain = `${tex(waag ? `${x2}-${kl(x)}=${d}` : `${y2}-${kl(y)}=${d}`)} Kästchen.`; }
    else if (kind === 'ecke') { const w = dx + 1, h = dy + 2; if (w === h) continue; prompt = `Ein Rechteck hat die Ecken ${tex(`A(${x}\\mid ${y})`)}, ${tex(`B(${x + w}\\mid ${y})`)} und ${tex(`C(${x + w}\\mid ${y + h})`)}. Wo liegt die vierte Ecke D?`;
      opts = [P(x, y + h, true), P(x + w, y - h, false, 'Das wäre ein Punkt unter B – D liegt über A.'), P(x + h, y + w, false, 'D hat denselben x-Wert wie A und denselben y-Wert wie C.'), P(x, y + w, false, 'Die Höhe des Rechtecks liest du an B und C ab.')];
      hints = ['D liegt genau über A: Der x-Wert ist derselbe wie bei A.', 'D liegt auf derselben Höhe wie C: Der y-Wert ist derselbe wie bei C.']; explain = `D hat den x-Wert von A und den y-Wert von C: ${tex(`D(${x}\\mid ${y + h})`)}. Probe: Die Seite von A nach D ist ${tex(`${y + h}-${y}=${h}`)} lang – genauso lang wie die von B nach C.`; }
    else if (kind === 'quadrant') { const qx = pick([-1, 1]) * ri(1, 6), qy = pick([-1, 1]) * ri(1, 6), q = qx > 0 ? (qy > 0 ? 1 : 4) : qy > 0 ? 2 : 3; prompt = `In welchem Quadranten liegt der Punkt ${tex(`P(${qx}\\mid ${qy})`)}?`;
      const Q = (n) => ({ tex: `\\text{${['I', 'II', 'III', 'IV'][n - 1]}. Quadrant}`, num: n, correct: n === q, why: n === q ? undefined : ['Im I. Quadranten sind beide Werte positiv.', 'Im II. Quadranten ist x negativ und y positiv.', 'Im III. Quadranten sind beide Werte negativ.', 'Im IV. Quadranten ist x positiv und y negativ.'][n - 1] });
      opts = [Q(1), Q(2), Q(3), Q(4)]; hints = ['Die Quadranten werden gegen den Uhrzeigersinn gezählt, beginnend rechts oben.', `x ist ${qx > 0 ? 'positiv (rechts)' : 'negativ (links)'}, y ist ${qy > 0 ? 'positiv (oben)' : 'negativ (unten)'}.`]; explain = `${tex(`x=${qx}`)} heißt ${qx > 0 ? 'rechts' : 'links'}, ${tex(`y=${qy}`)} heißt ${qy > 0 ? 'oben' : 'unten'}: ${['I', 'II', 'III', 'IV'][q - 1]}. Quadrant.`; }
    else if (kind === 'mitte') { const x2 = x + 2 * dx, y2 = y + 2 * dy; if (dx === dy) continue; prompt = `Welcher Punkt liegt genau in der Mitte zwischen ${tex(`A(${x}\\mid ${y})`)} und ${tex(`B(${x2}\\mid ${y2})`)}?`;
      opts = [P(x + dx, y + dy, true), P(x2 - x, y2 - y, false, 'Das ist der Unterschied der Koordinaten, nicht die Mitte.'), P(x + x2, y + y2, false, 'Die Summen werden noch halbiert.'), P(x + dx, y, false, 'Auch der y-Wert liegt in der Mitte.')];
      hints = ['Die Mitte liegt bei beiden Koordinaten genau dazwischen.', `${tex(`\\dfrac{${x}+${kl(x2)}}{2}`)} und ${tex(`\\dfrac{${y}+${kl(y2)}}{2}`)}.`]; explain = `${tex(`\\dfrac{${x}+${x2}}{2}=${x + dx}`)} und ${tex(`\\dfrac{${y}+${y2}}{2}=${y + dy}`)}, also ${tex(`M(${x + dx}\\mid ${y + dy})`)}.`; }
    else if (kind === 'flaeche') { const x1 = ri(-6, -1), x2 = ri(1, 7), y1 = ri(-5, -1), y2 = ri(1, 6), w = x2 - x1, h = y2 - y1;
      prompt = `Ein Rechteck hat Seiten parallel zu den Achsen. Zwei gegenüberliegende Ecken sind ${pt('A', x1, y1)} und ${pt('C', x2, y2)}. Wie groß ist sein Flächeninhalt (in Kästchen)?`;
      opts = [N(w * h, true), N(x2 * y2, false, 'Die Seitenlängen sind die Unterschiede der Koordinaten – das Rechteck reicht über die Achsen hinaus.'), N(2 * (w + h), false, 'Das ist der Umfang, nicht der Flächeninhalt.'), N((w + 1) * (h + 1), false, 'Gezählt werden die Schritte zwischen den Ecken, nicht die Gitterpunkte.')];
      hints = [`Breite: Unterschied der x-Werte, ${tex(`${x2}-(${x1})=${w}`)}.`, `Höhe: Unterschied der y-Werte, ${tex(`${y2}-(${y1})=${h}`)}.`, 'Flächeninhalt = Breite mal Höhe.'];
      explain = `Breite ${tex(`${x2}-(${x1})=${x2}+${-x1}=${w}`)}, Höhe ${tex(`${y2}-(${y1})=${y2}+${-y1}=${h}`)}, also ${tex(`${w}\\cdot ${h}=${w * h}`)} Kästchen.`; daten = { x1, y1, x2, y2 }; }
    else if (kind === 'spiegeln') { if (!x || !y) continue; const ay = rand() < 0.5, sp = ay ? [-x, y] : [x, -y], an = ay ? [x, -y] : [-x, y], r = [sp[0] + dx, sp[1] - dy];
      prompt = `Der Punkt ${pt('P', x, y)} wird an der ${ay ? 'y' : 'x'}-Achse gespiegelt. Der Bildpunkt wird danach um ${dx} nach rechts und um ${dy} nach unten verschoben. Wo liegt er dann?`;
      opts = [P(r[0], r[1], true), P(an[0] + dx, an[1] - dy, false, `Beim Spiegeln an der ${ay ? 'y' : 'x'}-Achse wechselt der ${ay ? 'x' : 'y'}-Wert das Vorzeichen – der andere Wert bleibt.`), P(x + dx, y - dy, false, 'Die Spiegelung fehlt – hier wurde nur verschoben.'), P(r[0], sp[1] + dy, false, 'Nach unten heißt: Der y-Wert wird kleiner.')];
      hints = [`Spiegeln an der ${ay ? 'y' : 'x'}-Achse: Der ${ay ? 'x' : 'y'}-Wert wechselt das Vorzeichen, also ${pt("P'", sp[0], sp[1])}.`, 'Nach rechts: x-Wert größer. Nach unten: y-Wert kleiner.', `${tex(`(${sp[0]}+${dx}\\mid ${sp[1]}-${dy})`)}.`];
      explain = `Spiegelbild ${pt("P'", sp[0], sp[1])}, verschoben: ${tex(`(${sp[0]}+${dx}\\mid ${sp[1]}-${dy})=(${r[0]}\\mid ${r[1]})`)}.`; daten = { x, y, ay, dx, dy }; }
    else if (kind === 'parallelogramm') { const w = ri(2, 5), s = ri(-2, 2), u = pick([-3, -2, -1, 1, 2, 3]), h = pick([-4, -3, -2, 2, 3, 4]), Bp = [x + w, y + s], C = [Bp[0] + u, Bp[1] + h], D = [x + u, y + h];
      if (w * h - s * u === 0) continue;
      prompt = `${pt('A', x, y)}, ${pt('B', Bp[0], Bp[1])} und ${pt('C', C[0], C[1])} sind drei Ecken des Parallelogramms ABCD. Wo liegt die vierte Ecke D?`;
      opts = [P(D[0], D[1], true), P(Bp[0] + C[0] - x, Bp[1] + C[1] - y, false, 'Das wäre das Parallelogramm ABDC. In ABCD liegt D gegenüber von B.'), P(x - u, y - h, false, 'Der Weg von B nach C wird an A angesetzt – nicht der Rückweg von C nach B.'), P(D[0], y - h, false, 'Auch der y-Wert ändert sich genauso wie auf dem Weg von B nach C.')];
      hints = ['Im Parallelogramm ist der Weg von A nach D derselbe wie der Weg von B nach C.', `Von B nach C: ${wg(u, h)}, denn ${tex(`${C[0]}-${kl(Bp[0])}=${u}`)} und ${tex(`${C[1]}-${kl(Bp[1])}=${h}`)}.`, 'Geh von A aus genau denselben Weg.'];
      explain = `Von B nach C: ${wg(u, h)}. Von A aus: ${tex(`D(${x}${pm(u)}\\mid ${y}${pm(h)})=D(${D[0]}\\mid ${D[1]})`)}.`; daten = { A: [x, y], B: Bp, C }; }
    else if (kind === 'dreieck') { const sx = pick([1, -1]), W = ri(4, 8), H = ri(4, 7), p = ri(1, H - 1), q = ri(1, W - 1), x0 = sx > 0 ? ri(-5, -1) : ri(1, 5), y0 = ri(-4, -1);
      const A = [x0, y0], Bp = [x0 + sx * W, y0 + p], C = [x0 + sx * q, y0 + H], t1 = (W * p) / 2, t2 = ((W - q) * (H - p)) / 2, t3 = (q * H) / 2, F = W * H - t1 - t2 - t3;
      prompt = `Das Dreieck ABC hat die Ecken ${pt('A', A[0], A[1])}, ${pt('B', Bp[0], Bp[1])} und ${pt('C', C[0], C[1])}. Wie groß ist sein Flächeninhalt (in Kästchen)? Lege dazu ein Rechteck um das Dreieck.`;
      opts = [N(F, true), N((W * H) / 2, false, 'Ein halbes Rechteck wäre es nur, wenn eine Dreiecksseite ganz auf einer Rechteckseite läge.'), N(t1 + t2 + t3, false, 'Das sind die drei Eck-Dreiecke zusammen – sie werden vom Rechteck abgezogen.'), N(W * H - t1 - t2, false, 'In den Ecken des Rechtecks liegen drei Dreiecke, nicht zwei.')];
      hints = [`Das umrahmende Rechteck ist ${W} breit und ${H} hoch: ${tex(`${W}\\cdot ${H}=${W * H}`)} Kästchen.`, `In den Ecken liegen drei rechtwinklige Dreiecke – jedes ist ein halbes Rechteck: ${tex(`\\tfrac{1}{2}\\cdot ${W}\\cdot ${p}=${ft(t1)}`)}, ${tex(`\\tfrac{1}{2}\\cdot ${W - q}\\cdot ${H - p}=${ft(t2)}`)} und ${tex(`\\tfrac{1}{2}\\cdot ${q}\\cdot ${H}=${ft(t3)}`)}.`, 'Zieh die drei Eck-Dreiecke vom Rechteck ab.'];
      explain = `Rechteck ${tex(`${W}\\cdot ${H}=${W * H}`)}, Eck-Dreiecke ${tex(`${ft(t1)}+${ft(t2)}+${ft(t3)}=${ft(t1 + t2 + t3)}`)}, also ${tex(`${W * H}-${ft(t1 + t2 + t3)}=${ft(F)}`)} Kästchen.`; daten = { A, B: Bp, C }; }
    else if (kind === 'bild') { if (!x || !y) continue; const ay = rand() < 0.5, u = pick([-1, 1]) * ri(1, 5), h = pick([-1, 1]) * ri(1, 5), sp = ay ? [-x, y] : [x, -y], an = ay ? [x, -y] : [-x, y], Q = [sp[0] + u, sp[1] + h], M = [(x + Q[0]) / 2, (y + Q[1]) / 2];
      prompt = `Der Punkt ${pt('P', x, y)} wird an der ${ay ? 'y' : 'x'}-Achse gespiegelt. Das Spiegelbild wird um ${wg(u, h)} verschoben – so entsteht der Punkt Q. Welcher Punkt liegt genau in der Mitte zwischen P und Q?`;
      opts = [P(M[0], M[1], true), P(Q[0], Q[1], false, 'Das ist Q selbst – gesucht ist die Mitte zwischen P und Q.'), P((Q[0] - x) / 2, (Q[1] - y) / 2, false, 'Für die Mitte werden die Koordinaten addiert und dann halbiert – nicht voneinander abgezogen.'), P((x + an[0] + u) / 2, (y + an[1] + h) / 2, false, `Beim Spiegeln an der ${ay ? 'y' : 'x'}-Achse wechselt nur der ${ay ? 'x' : 'y'}-Wert das Vorzeichen.`)];
      hints = [`Spiegeln an der ${ay ? 'y' : 'x'}-Achse: Der ${ay ? 'x' : 'y'}-Wert wechselt das Vorzeichen, also ${pt("P'", sp[0], sp[1])}.`, `Verschieben: ${tex(`Q(${sp[0]}${pm(u)}\\mid ${sp[1]}${pm(h)})=Q(${Q[0]}\\mid ${Q[1]})`)}.`, `Mitte zwischen P und Q: ${tex(`\\dfrac{${x}+${kl(Q[0])}}{2}`)} und ${tex(`\\dfrac{${y}+${kl(Q[1])}}{2}`)}.`];
      explain = `${pt("P'", sp[0], sp[1])}, ${pt('Q', Q[0], Q[1])}, Mitte: ${tex(`\\dfrac{${x}+${kl(Q[0])}}{2}=${ft(M[0])}`)} und ${tex(`\\dfrac{${y}+${kl(Q[1])}}{2}=${ft(M[1])}`)}, also ${tex(`M(${ft(M[0])}\\mid ${ft(M[1])})`)}.`; daten = { x, y, ay, u, h }; }
    else { const u = pick([-1, 1]) * ri(2, 7), v = pick([-1, 1]) * ri(1, 5), M = [x + u / 2, y + v / 2], D = [x + u, y + v], A = [x + ri(-3, 3), y + ri(-4, 4)], C = [2 * M[0] - A[0], 2 * M[1] - A[1]];
      if ((A[0] - x) * v - (A[1] - y) * u === 0) continue;   // A darf nicht auf der Diagonalen BD liegen
      prompt = `Im Parallelogramm ABCD schneiden sich die Diagonalen im Punkt ${pt('M', M[0], M[1])}. Gegeben sind ${pt('A', A[0], A[1])} und ${pt('B', x, y)}. Wo liegt die Ecke D?`;
      opts = [P(D[0], D[1], true), P(C[0], C[1], false, 'Das ist C: C liegt gegenüber von A. Gefragt ist D – gegenüber von B.'), P(2 * x - M[0], 2 * y - M[1], false, 'Der Weg führt von B über M hinaus – nicht von M über B zurück.'), P(D[0], y, false, 'Auch der y-Wert geht um denselben Schritt weiter.')];
      hints = ['Die Diagonalen eines Parallelogramms halbieren sich: M ist die Mitte zwischen B und D.', `Von B nach M: ${wg(u / 2, v / 2)}.`, 'Geh denselben Schritt von M aus noch einmal – dann bist du bei D.'];
      explain = `M ist die Mitte von B und D, also ${tex(`D(2\\cdot ${kl(M[0])}-${kl(x)}\\mid 2\\cdot ${kl(M[1])}-${kl(y)})=D(${D[0]}\\mid ${D[1]})`)}.`; daten = { A, B: [x, y], M }; }
    if (!gut(opts)) continue;
    return fertig(prompt, undefined, opts, hints, explain, kind, daten);
  }
}

const SACHEN = [['Lieblingssport', ['Fußball', 'Schwimmen', 'Turnen', 'Tennis', 'Reiten']], ['Haustiere', ['Hund', 'Katze', 'Hamster', 'Fisch', 'Vogel']], ['Schulweg', ['Bus', 'Fahrrad', 'zu Fuß', 'Auto', 'Roller']], ['Lieblingsfach', ['Mathe', 'Sport', 'Kunst', 'Musik', 'Deutsch']]];
/** Diagramme und Strichlisten lesen: Summe, Unterschied, größter Wert, Anteil, Durchschnitt, Bilddiagramm. */
export function genDiagramm(lv = 3) {
  for (;;) {
    const kind = pick(tier(lv, ['meist', 'summe'], ['summe', 'unterschied'], ['zusammen', 'fehlt', 'doppelt'], ['anteil', 'mittel'], ['mittelfehlt', 'bild', 'nachher']));
    const [thema, namen] = pick(SACHEN), n = kind === 'doppelt' ? 5 : tier(lv, 3, 4, 4, 5, 5), w = shuffle(Array.from({ length: lv >= 5 ? 24 : 9 }, (_, i) => i + (lv >= 5 ? 9 : lv >= 3 ? 5 : 2))).slice(0, n), ges = w.reduce((s, v) => s + v, 0);
    const liste = namen.slice(0, n).map((na, i) => `${na}: ${w[i]}`).join(' · '), i1 = ri(0, n - 1), i2 = (i1 + 1 + ri(0, n - 2)) % n, max = Math.max(...w);
    const rest = ges - w[i1], listeOhne = namen.slice(0, n).map((na, i) => (i === i1 ? `${na}: ?` : `${na}: ${w[i]}`)).join(' · '), bekannt = w.filter((_, i) => i !== i1);
    let frage, opts, hints, explain; const daten = { w, i1, i2 };
    if (kind === 'summe') { frage = 'Wie viele Kinder wurden insgesamt befragt?';
      opts = [N(ges, true), N(max, false, 'Das ist nur die größte Säule. Gefragt sind alle zusammen.'), N(n, false, 'Das ist die Anzahl der Säulen, nicht der Kinder.'), N(ges - w[n - 1], false, 'Eine Säule fehlt in deiner Summe.')];
      hints = ['Jede Säule steht für so viele Kinder, wie ihre Höhe angibt.', 'Addiere alle Werte.']; explain = `${tex(`${w.join('+')}=${ges}`)}.`; }
    else if (kind === 'meist') { frage = 'Wie viele Kinder haben die beliebteste Antwort gewählt?'; const zweit = [...w].sort((a, b) => b - a)[1];
      opts = [N(max, true), N(zweit, false, 'Das ist die zweithöchste Säule.'), N(ges, false, 'Das sind alle Kinder zusammen.'), N(Math.min(...w), false, 'Das ist die niedrigste Säule.')];
      hints = ['Die beliebteste Antwort hat die höchste Säule.', 'Suche den größten Wert.']; explain = `Der größte Wert ist ${max} (${namen[w.indexOf(max)]}).`; }
    else if (kind === 'unterschied') { if (w[i1] === w[i2]) continue; const d = Math.abs(w[i1] - w[i2]); frage = `Wie viele Kinder haben ${w[i1] > w[i2] ? `„${namen[i1]}“ mehr gewählt als „${namen[i2]}“` : `„${namen[i2]}“ mehr gewählt als „${namen[i1]}“`}?`;
      opts = [N(d, true), N(w[i1] + w[i2], false, '„Mehr als“ fragt nach dem Unterschied, nicht nach der Summe.'), N(Math.max(w[i1], w[i2]), false, 'Das ist der größere Wert – gefragt ist, um wie viel er größer ist.'), N(d + 1, false, 'Zieh den kleineren Wert vom größeren ab.')];
      hints = [`Lies beide Werte ab: ${w[i1]} und ${w[i2]}.`, 'Zieh den kleineren vom größeren ab.']; explain = `${tex(`${Math.max(w[i1], w[i2])}-${Math.min(w[i1], w[i2])}=${d}`)}.`; }
    else if (kind === 'zusammen') { const s = w[i1] + w[i2]; if (ges - s === s) continue; frage = `Wie viele Kinder haben <b>nicht</b> „${namen[i1]}“ und auch nicht „${namen[i2]}“ gewählt?`;
      opts = [N(ges - s, true), N(s, false, 'Das sind genau die beiden genannten Gruppen – gefragt sind alle anderen.'), N(ges, false, 'Das sind alle Kinder – die beiden genannten Gruppen werden abgezogen.'), N(ges - w[i1], false, `Auch „${namen[i2]}“ wird abgezogen.`)];
      hints = [`Alle Kinder zusammen: ${tex(`${w.join('+')}=${ges}`)}.`, `Die beiden genannten Gruppen: ${tex(`${w[i1]}+${w[i2]}=${s}`)}.`, 'Zieh sie von allen ab.']; explain = `${tex(`${ges}-(${w[i1]}+${w[i2]})=${ges}-${s}=${ges - s}`)}.`; }
    else if (kind === 'fehlt') {
      opts = [N(w[i1], true), N(ges, false, 'Das sind alle Kinder zusammen.'), N(rest, false, 'Das sind die anderen Säulen zusammen – sie werden von der Gesamtzahl abgezogen.'), N(w[i1] + 2, false, `Rechne ${tex(`${ges}-${rest}`)} noch einmal nach.`)];
      if (!gut(opts)) continue;
      return fertig(`Umfrage „${thema}“ mit ${ges} Kindern: ${listeOhne}. Welche Zahl fehlt?`, undefined, opts, [`Addiere die bekannten Werte: ${tex(`${bekannt.join('+')}=${rest}`)}.`, `Zieh diese Summe von ${ges} ab.`], `${tex(`${ges}-${rest}=${w[i1]}`)}.`, kind, daten); }
    else if (kind === 'anteil') { const z = w[i1], g = gcd(z, ges); if (z * 2 === ges) continue; frage = `Welcher Anteil der Kinder hat „${namen[i1]}“ gewählt?`;
      opts = [B(z, ges, true), B(z, ges - z, false, 'Der Anteil bezieht sich auf <b>alle</b> Kinder, nicht nur auf die anderen.'), B(1, n, false, 'Die Säulen sind nicht gleich hoch – der Anteil hängt vom Wert ab.'), B(ges - z, ges, false, 'Das ist der Anteil der anderen Kinder.')];
      hints = [`Das Ganze sind alle Kinder: ${tex(`${w.join('+')}=${ges}`)}.`, `Anteil = Teil durch Ganzes: ${tex(br(z, ges))}.`, g > 1 ? `Kürze mit ${g}.` : 'Der Bruch lässt sich nicht weiter kürzen.']; explain = `${tex(`${br(z, ges)}${g > 1 ? `=${br(z / g, ges / g)}` : ''}`)}.`; }
    else if (kind === 'mittel') { const m = ges / n, sortiert = [...w].sort((a, b) => a - b); frage = 'Wie viele Stimmen hat eine Antwort im Durchschnitt bekommen?';
      opts = [N(m, true), N(ges, false, 'Das ist die Summe – sie wird noch durch die Anzahl der Antworten geteilt.'), N(sortiert[2], false, 'Das ist der mittlere Wert der sortierten Liste, nicht der Durchschnitt.'), N((max + sortiert[0]) / 2, false, 'Der größte und der kleinste Wert reichen nicht – alle Werte zählen.')];
      hints = [`Addiere alle Werte: ${tex(`${w.join('+')}=${ges}`)}.`, `Teile die Summe durch die Anzahl der Antworten: ${n}.`]; explain = `${tex(`(${w.join('+')}):${n}=${ges}:${n}=${ft(m)}`)}.`; }
    else if (kind === 'doppelt') { const paare = []; for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) if (w[a] === 2 * w[b]) paare.push([a, b]); if (paare.length !== 1) continue; const [a, b] = paare[0]; frage = `Welche Antwort wurde genau doppelt so oft gewählt wie „${namen[b]}“?`;
      const T = (i) => ({ tex: `\\text{${namen[i]}}`, num: i, correct: i === a, why: i === a ? undefined : `„${namen[i]}“ wurde ${w[i]}-mal gewählt – das Doppelte von ${w[b]} ist ${2 * w[b]}.` });
      opts = shuffle(namen.slice(0, n).map((_, i) => i).filter((i) => i !== b)).slice(0, 4).map(T); if (!opts.some((o) => o.correct) || opts.length < 4) continue;
      hints = [`„${namen[b]}“ wurde ${w[b]}-mal gewählt.`, `Das Doppelte ist ${tex(`2\\cdot ${w[b]}=${2 * w[b]}`)} – suche diesen Wert.`]; explain = `${tex(`2\\cdot ${w[b]}=${w[a]}`)}: ${namen[a]}.`; daten.a = a; }
    else if (kind === 'mittelfehlt') { const m = ges / n;
      opts = [N(w[i1], true), N(ges, false, 'Das sind alle Stimmen zusammen – die bekannten Werte werden noch abgezogen.'), N(m, false, 'Das ist der Durchschnitt, nicht der fehlende Wert.'), N(w[i1] + n, false, `Probe: Mit diesem Wert wäre die Summe ${ges + n} und der Durchschnitt ${gT((ges + n) / n)}.`)];
      if (!gut(opts)) continue;
      return fertig(`Umfrage „${thema}“ (Säulendiagramm): ${listeOhne}. Im Durchschnitt bekam jede der ${n} Antworten ${gT(m)} Stimmen. Welche Zahl fehlt?`, undefined, opts,
        [`Durchschnitt mal Anzahl ergibt die Summe aller Stimmen: ${tex(`${ft(m)}\\cdot ${n}=${ges}`)}.`, `Die bekannten Werte zusammen: ${tex(`${bekannt.join('+')}=${rest}`)}.`, 'Der fehlende Wert ist der Rest bis zur Summe.'],
        `${tex(`${ft(m)}\\cdot ${n}-(${bekannt.join('+')})=${ges}-${rest}=${w[i1]}`)}.`, kind, daten); }
    else if (kind === 'bild') { const k = pick([4, 6, 8, 10]), sy = Array.from({ length: n }, () => ri(2, 13) / 2), S = sy.reduce((s, v) => s + v, 0), kinder = S * k, m = kinder / n, Sg = sy.reduce((s, v) => s + Math.floor(v), 0);
      if (sy.every((v) => Number.isInteger(v))) continue;
      opts = [N(R(m, 4), true), N(R(S / n, 4), false, `Das sind Symbole je Antwort. Jedes Symbol steht für ${k} Kinder.`), N(kinder, false, 'Das sind alle Kinder zusammen – geteilt wird noch durch die Anzahl der Antworten.'), N(R((Sg * k) / n, 4), false, `Auch ein halbes Symbol zählt: Es steht für ${k / 2} Kinder.`)];
      if (!gut(opts)) continue;
      return fertig(`Umfrage „${thema}“ als Bilddiagramm – ein Symbol steht für ${k} Kinder. Anzahl der Symbole: ${namen.slice(0, n).map((na, i) => `${na}: ${gT(sy[i])}`).join(' · ')}. Wie viele Stimmen hat eine Antwort im Durchschnitt bekommen?`, undefined, opts,
        [`Zähle alle Symbole: ${tex(`${sy.map((v) => ft(v)).join('+')}=${ft(S)}`)}.`, `Jedes Symbol steht für ${k} Kinder: ${tex(`${ft(S)}\\cdot ${k}=${kinder}`)} Kinder.`, `Teile durch die Anzahl der Antworten: ${n}.`],
        `${tex(`${ft(S)}\\cdot ${k}=${kinder}`)} Kinder, im Durchschnitt ${tex(`${kinder}:${n}=${ft(m)}`)}.`, kind, { sy, k }); }
    else { const z = ri(3, 12), neu = w[i1] + z, G2 = ges + z, g = gcd(neu, G2); if (neu >= ges) continue; frage = `Danach werden noch ${z} Kinder befragt – alle wählen „${namen[i1]}“. Welcher Anteil aller befragten Kinder hat jetzt „${namen[i1]}“ gewählt?`;
      opts = [B(neu, G2, true), B(neu, ges, false, 'Auch die Gesamtzahl wächst um die neu befragten Kinder.'), B(w[i1], ges, false, 'Das ist der Anteil vor der zweiten Befragung.'), B(z, G2, false, 'Das sind nur die neu befragten Kinder.')];
      hints = [`Vorher: ${tex(`${w.join('+')}=${ges}`)} Kinder, davon ${w[i1]} für „${namen[i1]}“.`, `Nachher: ${tex(`${w[i1]}+${z}=${neu}`)} für „${namen[i1]}“ und ${tex(`${ges}+${z}=${G2}`)} Kinder insgesamt.`, `Anteil = Teil durch Ganzes: ${tex(br(neu, G2))}.`, g > 1 ? `Kürze mit ${g}.` : 'Der Bruch lässt sich nicht weiter kürzen.'];
      explain = `${tex(`\\dfrac{${w[i1]}+${z}}{${ges}+${z}}=${br(neu, G2)}${g > 1 ? `=${br(neu / g, G2 / g)}` : ''}`)}.`; daten.z = z; }
    if (!gut(opts)) continue;
    return fertig(`Umfrage „${thema}“ (Säulendiagramm): ${liste}. ${frage}`, undefined, opts, hints, explain, kind, daten);
  }
}

/* ───────────── Klasse 6 ───────────── */

/** Prozent: erste Schritte – Hunderterfeld, Bruch und Prozent, Anteile, Grundwert, Rabatt, verkettete Änderungen. */
export function genProzentStart(lv = 3) {
  for (;;) {
    const kind = pick(tier(lv, ['feld', 'von'], ['bruch', 'von', 'hundert'], ['zurueck', 'rest', 'vergleich'], ['grundwert', 'rabatt'], ['kette', 'misch', 'vorher']));
    const [z, n, p] = pick(tier(lv, [[1, 2, 50], [1, 10, 10]], [[1, 2, 50], [1, 4, 25], [3, 4, 75], [1, 5, 20], [1, 10, 10]], [[3, 4, 75], [1, 5, 20], [2, 5, 40], [3, 10, 30]], [[3, 4, 75], [2, 5, 40], [3, 5, 60], [3, 10, 30], [7, 10, 70], [3, 20, 15], [7, 20, 35]], [[3, 20, 15], [7, 20, 35], [4, 5, 80], [9, 10, 90]]));
    let prompt, formula, opts, hints, explain, daten;
    if (kind === 'feld') { const t = ri(3, 97); if (t === 50 || t === 10) continue; prompt = `In einem Hunderterfeld sind ${t} Kästchen gefärbt. Wie viel Prozent sind das?`;
      opts = [E(t, true, undefined, '%'), E(100 - t, false, 'Das ist der Anteil der nicht gefärbten Kästchen.', '%'), E(t / 10, false, 'Ein Kästchen von hundert ist 1 %, nicht 0,1 %.', '%'), E(1, false, `1 % ist ein einzelnes Kästchen – gefärbt sind ${t}.`, '%')];
      hints = ['Prozent heißt „von hundert“.', 'Ein Kästchen im Hunderterfeld ist 1 %.']; explain = `${t} von 100 Kästchen sind ${t} %.`; }
    else if (kind === 'bruch') { prompt = 'Wie viel Prozent sind das?'; formula = br(z, n);
      opts = [E(p, true, undefined, '%'), E(n, false, 'Der Nenner ist nicht die Prozentzahl. Prozent heißt „von hundert“.', '%'), E(z * 10 === p ? z : z * 10, false, 'Erweitere den Bruch auf den Nenner 100.', '%'), E(100 - p === p ? p / 2 : 100 - p, false, 'Das ist der Rest bis 100 %.', '%')];
      hints = ['Prozent heißt „von hundert“.', `Durch Erweitern mit ${100 / n} entsteht der Nenner 100: ${tex(`${br(z, n)}=${br(p, 100)}`)}.`]; explain = `${tex(`${br(z, n)}=${br(`${z}\\cdot ${100 / n}`, `${n}\\cdot ${100 / n}`)}=${br(p, 100)}=${p}\\,\\%`)}.`; }
    else if (kind === 'von') { const G = n * ri(2, tier(lv, 6, 8, 12, 20, 30)), W = (G * p) / 100; prompt = `Wie viel sind ${p} % von ${G}?`;
      opts = [N(W, true), z > 1 ? N(G / n, false, `Das ist erst ${tex(br(1, n))} – gefragt sind ${p} %.`) : N(G * n, false, 'Hier wird geteilt, nicht malgenommen.'), G - W === W ? N(G, false, 'Das ist das Ganze – gefragt ist nur ein Teil davon.') : N(G - W, false, 'Das ist der Rest, der übrig bleibt.'), N(p, false, 'Das ist die Prozentzahl, nicht der Anteil.')];
      hints = [`${p} % sind ${tex(br(z, n))}.`, `Teile ${G} durch ${n}${z > 1 ? ` und nimm mal ${z}` : ''}.`]; explain = `${tex(`${G}:${n}${z > 1 ? `\\cdot ${z}` : ''}=${W}`)}.`; }
    else if (kind === 'hundert') { const t = ri(3, 97); if (t === 50) continue; prompt = `In einem Hunderterfeld sind ${t} Kästchen gefärbt. Wie viel Prozent sind <b>nicht</b> gefärbt?`;
      opts = [E(100 - t, true, undefined, '%'), E(t, false, 'Das ist der gefärbte Anteil.', '%'), E(Math.abs(100 - 2 * t) || 1, false, 'Gefärbt und nicht gefärbt ergeben zusammen 100 %.', '%'), E(100 - t + 10 > 100 ? 100 - t - 10 : 100 - t + 10, false, 'Rechne den Rest bis 100 noch einmal nach.', '%')];
      hints = ['Ein Kästchen im Hunderterfeld ist 1 %.', 'Alles zusammen sind 100 %.']; explain = `${tex(`100\\,\\%-${t}\\,\\%=${100 - t}\\,\\%`)}.`; }
    else if (kind === 'zurueck') { const G = n * ri(2, 12), W = (G * p) / 100; if (W === p || 100 - p === p) continue; prompt = `${W} von ${G} Kindern kommen mit dem Fahrrad. Wie viel Prozent sind das?`;
      opts = [E(p, true, undefined, '%'), E(W, false, 'Die Anzahl ist nicht die Prozentzahl – es kommt auf den Anteil an.', '%'), E(100 - p, false, 'Das ist der Anteil der anderen Kinder.', '%'), E(p / 2 === W ? p * 2 : p / 2, false, 'Kürze den Bruch und erweitere dann auf Hundertstel.', '%')];
      hints = [`Schreibe den Anteil als Bruch: ${tex(br(W, G))}.`, `Kürze mit ${G / n}: ${tex(br(z, n))}.`, `Durch Erweitern mit ${100 / n} entsteht der Nenner 100.`]; explain = `${tex(`${br(W, G)}=${br(z, n)}=${br(p, 100)}=${p}\\,\\%`)}.`; }
    else if (kind === 'rest') { const G = n * ri(3, 15), W = (G * p) / 100; if (G - W === W || G - p === G - W || 100 - p === W) continue; prompt = `Von ${G} Losen sind ${p} % Gewinne. Wie viele Lose sind <b>Nieten</b>?`;
      opts = [N(G - W, true), N(W, false, 'Das sind die Gewinne. Gefragt sind die Nieten.'), N(100 - p, false, 'Das ist der Prozentsatz der Nieten, nicht ihre Anzahl.'), N(G - p, false, `${p} % sind nicht ${p} Lose.`)];
      hints = [`${p} % sind ${tex(br(z, n))} aller Lose.`, `Gewinne: ${tex(`${G}:${n}${z > 1 ? `\\cdot ${z}` : ''}=${W}`)}.`, 'Zieh die Gewinne von allen Losen ab.']; explain = `Gewinne: ${tex(`${G}:${n}${z > 1 ? `\\cdot ${z}` : ''}=${W}`)}. Nieten: ${tex(`${G}-${W}=${G - W}`)}.`; }
    else if (kind === 'vergleich') { const p2 = pick([25, 40, 30, 60, 70].filter((q) => q !== p)); prompt = 'Was ist größer?';
      const T = (t, num, c2, w2) => ({ tex: t, num, correct: c2, why: c2 ? undefined : w2 });   // die richtige Antwort trägt keine Fehler-Erklärung
      opts = [T(br(z, n), 1, p > p2, `${tex(`${br(z, n)}=${p}\\,\\%`)} – das ist weniger als ${p2} %.`), T(`${p2}\\,\\%`, 2, p2 > p, `${tex(`${br(z, n)}=${p}\\,\\%`)} – das ist mehr als ${p2} %.`), T('\\text{beide gleich}', 3, false, `${tex(`${br(z, n)}=${p}\\,\\%`)}, also nicht gleich ${p2} %.`), T('\\text{kann man nicht sagen}', 4, false, 'Doch: Wandle den Bruch in Prozent um und vergleiche.')];
      hints = ['Wandle den Bruch in Prozent um.', `Durch Erweitern auf Hundertstel: ${tex(`${br(z, n)}=${br(p, 100)}`)}.`]; explain = `${tex(`${br(z, n)}=${br(p, 100)}=${p}\\,\\%`)} – das ist ${p > p2 ? 'mehr' : 'weniger'} als ${p2} %.`;
      return fertig(prompt, `${br(z, n)}\\quad\\text{oder}\\quad ${p2}\\,\\%`, opts, hints, explain, kind, { z, n, p2 }); }
    else if (kind === 'grundwert') { const k = ri(2, 8), W = z * k, G = n * k; prompt = `${W} Kinder einer Jahrgangsstufe kommen mit dem Bus. Das sind ${p} % aller Kinder. Wie viele Kinder hat die Jahrgangsstufe?`;
      opts = [N(G, true), N(R((W * p) / 100, 2), false, `Das wären ${p} % von ${W}. Gesucht ist das Ganze, von dem ${W} schon ${p} % sind.`), N(W * n, false, `${W} Kinder sind ${tex(br(z, n))} – erst durch ${z} teilen, dann mal ${n} nehmen.`), N(G - W, false, 'Das sind die Kinder, die nicht mit dem Bus kommen.')];
      hints = [`${p} % sind ${tex(br(z, n))} des Ganzen.`, `Dreisatz: ${tex(br(z, n))} sind ${W} Kinder, also ist ${tex(br(1, n))} gleich ${tex(`${W}:${z}=${k}`)} Kinder.`, `Das Ganze sind ${n} solche Teile.`];
      explain = `Dreisatz: ${tex(`${p}\\,\\%\\ \\widehat{=}\\ ${W}`)}, ${tex(`${p / z}\\,\\%\\ \\widehat{=}\\ ${W}:${z}=${k}`)}, ${tex(`100\\,\\%\\ \\widehat{=}\\ ${k}\\cdot ${n}=${G}`)} Kinder.`; daten = { W, p }; }
    else if (kind === 'rabatt') { const P0 = 20 * ri(3, 40), q = pick([5, 15, 20, 30, 35, 40]), Rb = (P0 * q) / 100, neu = P0 - Rb, ding = pick(['Ein Fahrrad', 'Ein Zelt', 'Ein Roller', 'Ein Schreibtisch']);
      prompt = `${ding} kostet ${P0} €. Im Schlussverkauf wird der Preis um ${q} % gesenkt. Wie hoch ist der neue Preis?`;
      opts = [EU(neu, true), EU(Rb, false, 'Das ist die Ersparnis – sie wird vom alten Preis abgezogen.'), EU(P0 - q, false, `${q} % sind nicht ${q} €.`), EU(P0 + Rb, false, 'Gesenkt heißt: Die Ersparnis wird abgezogen, nicht aufgeschlagen.')];
      hints = [`Dreisatz: 1 % von ${P0} € sind ${tex(`${P0}:100=${euX(P0 / 100)}`)} €.`, `${q} % sind ${tex(`${euX(P0 / 100)}\\cdot ${q}=${ft(Rb)}`)} €.`, 'Zieh die Ersparnis vom alten Preis ab.'];
      explain = `Dreisatz: ${tex(`100\\,\\%\\ \\widehat{=}\\ ${P0}`)} €, ${tex(`1\\,\\%\\ \\widehat{=}\\ ${euX(P0 / 100)}`)} €, ${tex(`${q}\\,\\%\\ \\widehat{=}\\ ${ft(Rb)}`)} €. Neuer Preis: ${tex(`${P0}-${ft(Rb)}=${ft(neu)}`)} €.`; daten = { P0, q }; }
    else if (kind === 'kette') { const P0 = 20 * ri(4, 40), p1 = pick([5, 10, 15, 20, 25, 30]), p2 = pick([5, 10, 15, 20, 25, 30]), Z = (P0 * (100 + p1)) / 100, End = (Z * (100 - p2)) / 100; if (p1 === p2) continue;
      prompt = `Ein Händler erhöht den Preis einer Ware von ${P0} € um ${p1} %. Später senkt er den neuen Preis wieder um ${p2} %. Wie viel kostet die Ware am Ende?`;
      opts = [EU(End, true), EU((P0 * (100 + p1 - p2)) / 100, false, `Die ${p2} % beziehen sich auf den erhöhten Preis, nicht auf den alten – Prozentsätze darf man nicht einfach miteinander verrechnen.`), EU(Z, false, 'Das ist der Preis nach der Erhöhung – die Senkung fehlt noch.'), EU(P0 + p1 - p2, false, 'Prozent sind Anteile, keine Euro-Beträge.')];
      hints = [`Erhöhung: ${p1} % von ${P0} € sind ${tex(`${P0}\\cdot ${ft(p1 / 100)}=${ft((P0 * p1) / 100)}`)} €.`, `Zwischenpreis: ${tex(`${P0}+${ft((P0 * p1) / 100)}=${ft(Z)}`)} €.`, `Senkung: ${p2} % vom Zwischenpreis sind ${tex(`${ft(Z)}\\cdot ${ft(p2 / 100)}=${euX((Z * p2) / 100)}`)} €.`, 'Endpreis = Zwischenpreis minus Senkung.'];
      explain = `${tex(`${P0}\\cdot ${ft(1 + p1 / 100)}=${ft(Z)}`)} €, dann ${tex(`${ft(Z)}\\cdot ${ft(1 - p2 / 100)}=${ft(Z)}-${euX((Z * p2) / 100)}=${euX(End)}`)} €. Der neue Grundwert für die Senkung ist der erhöhte Preis.`; daten = { P0, p1, p2 }; }
    else if (kind === 'misch') { const gr = [20, 24, 25, 28, 30, 32], n1 = pick(gr), n2 = pick(gr.filter((v) => v !== n1)), ps = [10, 20, 25, 30, 40, 50, 60, 70, 75, 80], p1 = pick(ps.filter((q) => Number.isInteger((n1 * q) / 100))), p2 = pick(ps.filter((q) => q !== p1 && Number.isInteger((n2 * q) / 100)));
      if (!p1 || !p2) continue; const k1 = (n1 * p1) / 100, k2 = (n2 * p2) / 100, ant = ((k1 + k2) / (n1 + n2)) * 100, f3 = ((k1 + k2) / Math.max(n1, n2)) * 100; if (f3 >= 100) continue;
      const PR = (v, c2, w2) => { const r = R(v, 1); return N(r, c2, w2, `${Math.abs(v - r) > 1e-9 ? '\\approx ' : ''}${ft(r, 1)}\\,\\%`); };
      prompt = `In der Klasse 6a sind ${p1} % der ${n1} Kinder in einem Sportverein, in der Klasse 6b sind es ${p2} % der ${n2} Kinder. Wie viel Prozent der Kinder beider Klassen zusammen sind in einem Sportverein? Runde auf eine Nachkommastelle.`;
      opts = [PR(ant, true), PR((p1 + p2) / 2, false, 'Der Mittelwert der beiden Prozentsätze stimmt nur, wenn beide Klassen gleich groß sind.'), PR(k1 + k2, false, 'Das ist die Anzahl der Kinder im Verein, kein Prozentsatz.'), PR(f3, false, 'Der Grundwert sind beide Klassen zusammen.')];
      hints = [`Klasse 6a: ${tex(`${n1}\\cdot ${ft(p1 / 100)}=${k1}`)} Kinder.`, `Klasse 6b: ${tex(`${n2}\\cdot ${ft(p2 / 100)}=${k2}`)} Kinder.`, `Zusammen: ${tex(`${k1}+${k2}=${k1 + k2}`)} von ${tex(`${n1}+${n2}=${n1 + n2}`)} Kindern.`, `Anteil ${tex(br(k1 + k2, n1 + n2))} als Prozent schreiben: Zähler durch Nenner, mal 100.`];
      explain = `${tex(`\\dfrac{${k1}+${k2}}{${n1}+${n2}}=${br(k1 + k2, n1 + n2)}${Math.abs(ant - R(ant, 1)) > 1e-9 ? '\\approx ' : '='}${ft(R(ant, 1), 1)}\\,\\%`)}.`; daten = { n1, p1, n2, p2 }; }
    else { const P0 = 20 * ri(3, 30), q = pick([15, 20, 25, 30, 35, 40]), Nn = (P0 * (100 - q)) / 100;
      prompt = `Nach einer Preissenkung um ${q} % kostet ein Rucksack noch ${eu(Nn)} €. Wie viel hat er vorher gekostet?`;
      opts = [EU(P0, true), EU((Nn * (100 + q)) / 100, false, `Die ${q} % beziehen sich auf den alten Preis, nicht auf den neuen.`), EU(Nn + q, false, `${q} % sind nicht ${q} €.`), EU((Nn * (100 - q)) / 100, false, 'Der alte Preis war höher als der neue, nicht niedriger.')];
      hints = [`Der neue Preis sind ${tex(`100\\,\\%-${q}\\,\\%=${100 - q}\\,\\%`)} des alten Preises.`, `Dreisatz: 1 % sind ${tex(`${euX(Nn)}:${100 - q}=${euX(P0 / 100)}`)} €.`, '100 % sind das Hundertfache davon.'];
      explain = `Dreisatz: ${tex(`${100 - q}\\,\\%\\ \\widehat{=}\\ ${euX(Nn)}`)} €, ${tex(`1\\,\\%\\ \\widehat{=}\\ ${euX(Nn)}:${100 - q}=${euX(P0 / 100)}`)} €, ${tex(`100\\,\\%\\ \\widehat{=}\\ ${euX(P0 / 100)}\\cdot 100=${P0}`)} €.`; daten = { Nn, q }; }
    if (!gut(opts) || opts.some((o) => o.num <= 0)) continue;
    return fertig(prompt, formula, opts, hints, explain, kind, daten);
  }
}

/** Winkel: Arten erkennen, Drehungen, Uhrzeiger, Nebenwinkel, Winkel im Dreieck. */
export function genWinkelArt(lv = 3) {
  for (;;) {
    const kind = pick(tier(lv, ['art'], ['drehung', 'voll'], ['rest', 'drehung', 'uhr'], ['uhr', 'ueber', 'dreieck'], ['uhrmin', 'gleichschenklig', 'verhaeltnis']));
    let prompt, opts, hints, explain, daten;
    if (kind === 'art') { const w = pick([ri(2, 17) * 5, 90, ri(19, 35) * 5, 180, ri(37, 70) * 5]), art = w < 90 ? 0 : w === 90 ? 1 : w < 180 ? 2 : w === 180 ? 3 : 4, NAMEN = ['spitzer Winkel', 'rechter Winkel', 'stumpfer Winkel', 'gestreckter Winkel', 'überstumpfer Winkel'], WARUM = ['Spitz sind Winkel unter 90°.', 'Ein rechter Winkel hat genau 90°.', 'Stumpf sind Winkel zwischen 90° und 180°.', 'Ein gestreckter Winkel hat genau 180°.', 'Überstumpf sind Winkel über 180°.'];
      prompt = `Ein Winkel ist ${w}° groß. Wie heißt diese Winkelart?`; const wahl = [art, ...shuffle([0, 1, 2, 3, 4].filter((i) => i !== art)).slice(0, 3)];
      opts = wahl.map((i) => ({ tex: `\\text{${NAMEN[i]}}`, num: i, correct: i === art, why: i === art ? undefined : WARUM[i] }));
      hints = ['Vergleiche mit 90° (rechter Winkel) und 180° (gestreckter Winkel).', WARUM[art]]; explain = `${w}°: ${NAMEN[art]}. ${WARUM[art]}`; daten = { w }; }
    else if (kind === 'drehung') { const [t, zl, nn] = pick([['Vierteldrehung', 1, 4], ['halben Drehung', 1, 2], ['Dreivierteldrehung', 3, 4], ['ganzen Drehung', 1, 1], ['Achteldrehung', 1, 8], ['Dritteldrehung', 1, 3], ['Sechsteldrehung', 1, 6], ['Zweidritteldrehung', 2, 3], ['Fünfsechsteldrehung', 5, 6]].slice(lv >= 3 ? 4 : 0, lv >= 3 ? 9 : 4)), w = (360 * zl) / nn;
      prompt = `Wie groß ist der Winkel bei einer ${t}?`;
      const d2 = w === 180 ? [90, 'Das ist eine Vierteldrehung.'] : [180, 'Das ist eine halbe Drehung.'], d4 = w === 360 ? [720, 'Das sind zwei ganze Drehungen.'] : w === 180 ? [360, 'Das ist eine ganze Drehung.'] : [360 - w, 'Das ist der Rest bis zur ganzen Drehung.'];
      opts = [E(w, true, undefined, '°'), E(d2[0], false, d2[1], '°'), E(R((100 * zl) / nn, 1), false, 'Eine ganze Drehung hat 360°, nicht 100°.', '°'), E(d4[0], false, d4[1], '°')];
      hints = ['Eine ganze Drehung hat 360°.', nn > 1 ? `Teile 360° durch ${nn}${zl > 1 ? ` und nimm das Ergebnis mal ${zl}` : ''}.` : 'Gefragt ist genau eine ganze Drehung.']; explain = nn === 1 ? `Eine ganze Drehung hat ${tex('360^\\circ')}.` : `${tex(`360^\\circ${nn > 1 ? `:${nn}` : ''}${zl > 1 ? `\\cdot ${zl}=${360 / nn}^\\circ\\cdot ${zl}` : ''}=${w}^\\circ`)}.`; daten = { zl, nn }; }
    else if (kind === 'uhr') { const h = ri(1, 11), min = lv >= 4 ? 30 : 0, w0 = Math.abs(30 * h + min / 2 - 6 * min), w = Math.min(w0, 360 - w0); if (w === 0 || w === 180) continue; prompt = `Welchen (kleineren) Winkel bilden die Zeiger einer Uhr um ${h}${min ? ':30' : ':00'} Uhr?`;
      const f1 = h * 6, f2 = min ? Math.abs(30 * h - 180) : 360 - w;
      opts = [E(w, true, undefined, '°'), E(f1 === w ? w + 30 : f1, false, 'Zwischen zwei Stundenzahlen liegen 30°, nicht 6°.', '°'), E(f2 === w || f2 === 0 ? w + 15 : f2, false, min ? 'Um halb steht der Stundenzeiger schon in der Mitte zwischen zwei Zahlen.' : 'Gefragt ist der kleinere der beiden Winkel.', '°'), E(w + 60 > 180 ? Math.abs(w - 60) || 45 : w + 60, false, 'Zähle die Abschnitte zwischen den Zeigern noch einmal.', '°')];
      hints = min ? ['Das Zifferblatt hat 12 Abschnitte: Jeder ist 360° : 12 = 30° groß.', `Der Minutenzeiger steht auf der 6: ${tex('6\\cdot 30^\\circ=180^\\circ')}.`, `Der Stundenzeiger ist schon eine halbe Stunde weiter als die ${h}: ${tex(`${h}\\cdot 30^\\circ+15^\\circ=${30 * h + 15}^\\circ`)}.`, 'Der gesuchte Winkel ist der Unterschied.']
        : ['Das Zifferblatt hat 12 Abschnitte: Jeder ist 360° : 12 = 30° groß.', `Zwischen den Zeigern ${Math.min(h, 12 - h) === 1 ? 'liegt 1 Abschnitt' : `liegen ${Math.min(h, 12 - h)} Abschnitte`}.`];
      explain = min ? `${tex(`${Math.max(30 * h + 15, 180)}^\\circ-${Math.min(30 * h + 15, 180)}^\\circ=${ft(w)}^\\circ`)}.` : `${tex(`${Math.min(h, 12 - h)}\\cdot 30^\\circ=${w}^\\circ`)}.`; daten = { h, min }; }
    else if (kind === 'rest') { const a = ri(3, 16) * 5, b = ri(3, 16) * 5; if (a + b >= 180 || 180 - a - b === a + b) continue; prompt = `Ein gestreckter Winkel wird in drei Teile geteilt. Zwei davon sind ${a}° und ${b}° groß. Wie groß ist der dritte?`;
      opts = [E(180 - a - b, true, undefined, '°'), E(360 - a - b, false, 'Ein gestreckter Winkel hat 180°, nicht 360°.', '°'), E(a + b, false, 'Das ist die Summe der beiden bekannten Teile.', '°'), E(180 - a, false, 'Auch der zweite Teil wird abgezogen.', '°')];
      hints = ['Ein gestreckter Winkel hat 180°.', `Die beiden bekannten Teile zusammen: ${tex(`${a}^\\circ+${b}^\\circ=${a + b}^\\circ`)}.`]; explain = `${tex(`180^\\circ-${a}^\\circ-${b}^\\circ=180^\\circ-${a + b}^\\circ=${180 - a - b}^\\circ`)}.`; daten = { a, b }; }
    else if (kind === 'voll') { const a = ri(4, 30) * 5; if (a === 180 || a === 90) continue; prompt = `Um einen Punkt liegen zwei Winkel, die zusammen eine ganze Drehung ergeben. Einer ist ${a}° groß. Wie groß ist der andere?`;
      opts = [E(360 - a, true, undefined, '°'), E(Math.abs(180 - a) || 90, false, 'Eine ganze Drehung hat 360°.', '°'), E(a, false, 'Die beiden Winkel sind nur bei 180° gleich groß.', '°'), E(360 + a, false, 'Der bekannte Winkel wird abgezogen.', '°')];
      hints = ['Eine ganze Drehung hat 360°.', 'Zieh den bekannten Winkel davon ab.']; explain = `${tex(`360^\\circ-${a}^\\circ=${360 - a}^\\circ`)}.`; daten = { a }; }
    else if (kind === 'ueber') { const k = ri(2, 5), kl2 = 180 / (k + 1); prompt = `Ein Winkel ist ${k}-mal so groß wie sein Nebenwinkel. Zusammen ergeben beide 180°. Wie groß ist der kleinere Winkel?`;
      opts = [E(kl2, true, undefined, '°'), E(180 / k, false, `Es gibt ${k + 1} gleiche Teile: einen für den kleinen und ${k} für den großen Winkel.`, '°'), E(180 - kl2, false, 'Das ist der größere Winkel.', '°'), E(360 / (k + 1), false, 'Nebenwinkel ergeben zusammen 180°, nicht 360°.', '°')];
      hints = [`Denke in Teilen: Der kleine Winkel ist 1 Teil, der große ${k} Teile.`, `Zusammen sind das ${tex(`1+${k}=${k + 1}`)} Teile – und die sind 180°.`, `Ein Teil: ${tex(`180^\\circ:${k + 1}`)}.`]; explain = `${tex(`180^\\circ:(1+${k})=180^\\circ:${k + 1}=${ft(kl2)}^\\circ`)}. Probe: ${tex(`${ft(kl2)}^\\circ+${k}\\cdot ${ft(kl2)}^\\circ=180^\\circ`)}.`; daten = { k }; }
    else if (kind === 'dreieck') { const a = ri(4, 16) * 5, b = ri(4, 16) * 5, g = 180 - a - b; if (a === b || a + b >= 170) continue; prompt = `In einem Dreieck sind zwei Innenwinkel ${a}° und ${b}° groß. Wie groß ist der Außenwinkel am dritten Eckpunkt (der Nebenwinkel des dritten Innenwinkels)?`;
      opts = [E(a + b, true, undefined, '°'), E(g, false, 'Das ist der dritte Innenwinkel – gefragt ist sein Nebenwinkel.', '°'), E(360 - a - b, false, 'Die Innenwinkel im Dreieck ergeben zusammen 180°, nicht 360°.', '°'), E(180 - a, false, 'Auch der zweite Innenwinkel gehört in die Rechnung.', '°')];
      hints = ['Die Innenwinkel eines Dreiecks ergeben zusammen 180°.', `Dritter Innenwinkel: ${tex(`180^\\circ-${a}^\\circ-${b}^\\circ=${g}^\\circ`)}.`, `Nebenwinkel ergänzen sich zu 180°: ${tex(`180^\\circ-${g}^\\circ`)}.`];
      explain = `Dritter Innenwinkel ${tex(`180^\\circ-${a}^\\circ-${b}^\\circ=${g}^\\circ`)}, Außenwinkel ${tex(`180^\\circ-${g}^\\circ=${a + b}^\\circ`)}. Kontrolle: Der Außenwinkel ist so groß wie die beiden anderen Innenwinkel zusammen, ${tex(`${a}^\\circ+${b}^\\circ=${a + b}^\\circ`)}.`; daten = { a, b }; }
    else if (kind === 'uhrmin') { const h = ri(1, 11), m = pick([5, 10, 15, 20, 25, 35, 40, 45, 50, 55]), mz = 6 * m, sz = 30 * h + m / 2, nrm = (d) => { const e = Math.abs(d) % 360; return Math.min(e, 360 - e); }, d0 = Math.abs(sz - mz), w = nrm(sz - mz);
      if (w === 0 || w === 180) continue; prompt = `Welchen (kleineren) Winkel bilden die Zeiger einer Uhr um ${h}:${m < 10 ? '0' : ''}${m} Uhr?`;
      opts = [E(w, true, undefined, '°'), E(nrm(30 * h - mz), false, 'Der Stundenzeiger steht nicht mehr genau auf der Stundenzahl – er wandert in jeder Minute 0,5° weiter.', '°'), E(360 - w, false, 'Gefragt ist der kleinere der beiden Winkel.', '°'), E(nrm(30 * h + m - mz), false, 'Der Stundenzeiger schafft in 60 Minuten 30°, also 0,5° pro Minute – nicht 1°.', '°')];
      hints = [`Minutenzeiger: 6° pro Minute, also ${tex(`${m}\\cdot 6^\\circ=${mz}^\\circ`)} (von der 12 aus gemessen).`, `Stundenzeiger: 30° pro Stunde und 0,5° pro Minute, also ${tex(`${h}\\cdot 30^\\circ+${m}\\cdot 0{,}5^\\circ=${ft(sz)}^\\circ`)}.`, `Unterschied der beiden Zeiger: ${tex(`${ft(Math.max(sz, mz))}^\\circ-${ft(Math.min(sz, mz))}^\\circ=${ft(d0)}^\\circ`)}.`];
      if (d0 > 180) hints.push('Das ist mehr als 180° – der kleinere Winkel ist der Rest bis 360°.');
      explain = `Minutenzeiger ${tex(`${m}\\cdot 6^\\circ=${mz}^\\circ`)}, Stundenzeiger ${tex(`${h}\\cdot 30^\\circ+${m}\\cdot 0{,}5^\\circ=${ft(sz)}^\\circ`)}, Unterschied ${tex(`${ft(d0)}^\\circ`)}${d0 > 180 ? `, kleinerer Winkel ${tex(`360^\\circ-${ft(d0)}^\\circ=${ft(w)}^\\circ`)}` : ''}.`; daten = { h, m }; }
    else if (kind === 'gleichschenklig') { const g = ri(21, 139), bw = (180 - g) / 2, r = 180 - bw; if (g === 60) continue; prompt = `In einem gleichschenkligen Dreieck ist der Winkel an der Spitze ${g}° groß. Die Basis wird über einen ihrer Eckpunkte hinaus verlängert. Wie groß ist der Außenwinkel, der dort entsteht?`;
      opts = [E(r, true, undefined, '°'), E(bw, false, 'Das ist der Basiswinkel – gefragt ist sein Nebenwinkel.', '°'), E(180 - g, false, 'Das sind beide Basiswinkel zusammen.', '°'), E(180 - g / 2, false, 'Die Innenwinkel im Dreieck ergeben zusammen 180°, nicht 360°.', '°')];
      hints = ['Die Innenwinkel eines Dreiecks ergeben zusammen 180°.', `Für die beiden Basiswinkel bleiben ${tex(`180^\\circ-${g}^\\circ=${180 - g}^\\circ`)}.`, `Im gleichschenkligen Dreieck sind die Basiswinkel gleich groß: ${tex(`${180 - g}^\\circ:2=${ft(bw)}^\\circ`)}.`, 'Der Außenwinkel ist der Nebenwinkel des Basiswinkels: Beide ergänzen sich zu 180°.'];
      explain = `Basiswinkel ${tex(`(180^\\circ-${g}^\\circ):2=${ft(bw)}^\\circ`)}, Außenwinkel ${tex(`180^\\circ-${ft(bw)}^\\circ=${ft(r)}^\\circ`)}.`; daten = { g }; }
    else { const S = pick([8, 9, 12, 15, 16, 24, 25, 40]), a = ri(1, Math.floor(S / 3)), b = ri(a + 1, a + 6), c = S - a - b, t = 180 / S; if (b >= c || gcd(gcd(a, b), c) !== 1) continue;
      prompt = `Die drei Innenwinkel eines Dreiecks verhalten sich wie ${a} : ${b} : ${c}. Wie groß ist der größte Winkel?`;
      opts = [E(c * t, true, undefined, '°'), E(t, false, `Das ist ein einzelner Teil – der größte Winkel besteht aus ${c} Teilen.`, '°'), E((360 * c) / S, false, 'Die Innenwinkel im Dreieck ergeben zusammen 180°, nicht 360°.', '°'), E(b * t, false, 'Das ist der mittlere der drei Winkel.', '°')];
      hints = ['Die Innenwinkel eines Dreiecks ergeben zusammen 180°.', `Das Verhältnis teilt die 180° in ${tex(`${a}+${b}+${c}=${S}`)} gleiche Teile.`, `Ein Teil: ${tex(`180^\\circ:${S}=${ft(t)}^\\circ`)}.`, `Der größte Winkel besteht aus ${c} Teilen.`];
      explain = `${tex(`180^\\circ:(${a}+${b}+${c})=180^\\circ:${S}=${ft(t)}^\\circ`)}, größter Winkel ${tex(`${c}\\cdot ${ft(t)}^\\circ=${ft(c * t)}^\\circ`)}.`; daten = { a, b, c }; }
    if (!gut(opts) || opts.some((o) => o.num < 0)) continue;
    return fertig(prompt, undefined, opts, hints, explain, kind, daten);
  }
}

/** Zufall: relative Häufigkeit und Wahrscheinlichkeit – vom Beutel bis zum zweistufigen Versuch. */
export function genZufallStart(lv = 3) {
  for (;;) {
    const kind = pick(tier(lv, ['sicher', 'urne'], ['urne', 'wuerfel'], ['haeufig', 'nicht', 'erwartet'], ['zweiwuerfel', 'rad', 'ohne'], ['zweimal', 'nachlegen', 'mindestens']));
    let prompt, opts, hints, explain, daten;
    if (kind === 'urne' || kind === 'nicht') { const r = ri(2, 6), b = ri(2, 6), g = lv >= 2 ? ri(2, 5) : 0, n = r + b + g, nicht = kind === 'nicht'; if (r === b || r === g || r * 2 === n || (!nicht && r * 2 > n)) continue;   // r/(n−r) soll als Ablenker kleiner als 1 bleiben
      prompt = `In einem Beutel liegen ${r} rote, ${b} blaue${g ? ` und ${g} grüne` : ''} Kugeln. Wie groß ist die Wahrscheinlichkeit, ${nicht ? '<b>keine</b> rote' : 'eine rote'} Kugel zu ziehen?`.replace(`${r} rote, ${b} blaue Kugeln`, `${r} rote und ${b} blaue Kugeln`);
      opts = nicht ? [B(n - r, n, true), B(r, n, false, 'Das ist die Wahrscheinlichkeit <b>für</b> Rot.'), B(n - r, r + n, false, 'Im Nenner steht die Anzahl aller Kugeln.'), B(1, g ? 3 : 2, false, 'Die Farben kommen verschieden oft vor.')]
        : [B(r, n, true), B(r, n - r, false, 'Im Nenner stehen <b>alle</b> Kugeln, auch die roten.'), B(1, g ? 3 : 2, false, 'Die Farben kommen verschieden oft vor – es kommt auf die Anzahl an.'), B(n - r, n, false, 'Das ist die Wahrscheinlichkeit für „nicht rot“.')];
      hints = nicht ? ['„Keine rote“ ist das Gegenereignis von „rot“.', `Insgesamt sind es ${tex(`${r}+${b}${g ? `+${g}` : ''}=${n}`)} Kugeln, davon ${r} rote.`, `Nicht rot sind ${tex(`${n}-${r}=${n - r}`)} Kugeln.`] : ['Wahrscheinlichkeit = günstige durch alle möglichen.', `Insgesamt sind es ${n} Kugeln.`];
      explain = nicht ? `Gegenereignis: ${tex(`1-${B(r, n).tex}=${B(n - r, n).tex}`)} – oder direkt: ${n - r} von ${n} Kugeln sind nicht rot.` : `${r} von ${n} Kugeln sind rot: ${tex(`${br(r, n)}${gcd(r, n) > 1 ? `=${B(r, n).tex}` : ''}`)}.`; daten = { r, b, g }; }
    else if (kind === 'wuerfel') { const [t, k] = pick([['eine gerade Zahl', 3], ['eine Zahl größer als 4', 2], ['eine 6', 1], ['eine Zahl kleiner als 6', 5], ['eine Primzahl', 3], ['eine Zahl, die durch 3 teilbar ist', 2]]); prompt = `Du würfelst einmal mit einem normalen Würfel. Wie groß ist die Wahrscheinlichkeit für ${t}?`;
      opts = [B(k, 6, true), (6 - k === k ? B(k + 1, 6, false, `Es passen genau ${k} der sechs Zahlen – zähle noch einmal nach.`) : B(6 - k, 6, false, 'Das ist die Wahrscheinlichkeit für das Gegenteil.')), B(1, k === 1 ? 5 : 6, false, k === 1 ? 'Ein Würfel hat sechs Seiten.' : 'Es gibt mehr als eine passende Zahl.'), B(k, k === 5 ? 7 : 5, false, 'Ein Würfel hat sechs gleich wahrscheinliche Seiten.')];
      hints = ['Zähle, welche der Zahlen 1 bis 6 passen.', `Es passen ${k} von 6.`]; explain = `${k} von 6 Zahlen passen: ${tex(`${br(k, 6)}${k > 1 && k < 5 ? `=${B(k, 6).tex}` : ''}`)}.`; daten = { t }; }
    else if (kind === 'sicher') { const F = pick([['Du würfelst mit einem normalen Würfel eine 7.', 0], ['Du würfelst eine Zahl kleiner als 7.', 1], ['Aus einem Beutel mit nur roten Kugeln ziehst du eine rote.', 1], ['Aus einem Beutel mit nur roten Kugeln ziehst du eine blaue.', 0], ['Eine Münze zeigt Kopf.', 0.5]]); prompt = `Wie groß ist die Wahrscheinlichkeit? „${F[0]}“`;
      const T = (t, v, w2) => ({ tex: t, num: v, correct: F[1] === v, why: w2 });
      opts = [T('0', 0, 'Wahrscheinlichkeit 0 heißt: unmöglich.'), T('1', 1, 'Wahrscheinlichkeit 1 heißt: ganz sicher.'), T(br(1, 2), 0.5, 'Ein Halb heißt: Es passiert in der Hälfte der Fälle.'), T(br(1, 6), 1 / 6, 'Ein Sechstel wäre eine bestimmte Zahl beim Würfeln.')];
      hints = ['Unmöglich hat die Wahrscheinlichkeit 0, sicher die Wahrscheinlichkeit 1.', 'Kann es überhaupt passieren? Muss es passieren?']; explain = F[1] === 0 ? 'Das ist unmöglich: Wahrscheinlichkeit 0.' : F[1] === 1 ? 'Das passiert sicher: Wahrscheinlichkeit 1.' : `Zwei gleich wahrscheinliche Seiten: ${tex(br(1, 2))}.`;
      return fertig(prompt, undefined, opts, hints, explain, kind); }
    else if (kind === 'haeufig') { const n = pick([20, 25, 40, 50, 80]), k = pick([0.2, 0.25, 0.4, 0.3, 0.6, 0.75].filter((q) => Number.isInteger(n * q))) * n; if (k * 2 === n) continue; prompt = `Bei ${n} Würfen eines Reißnagels landet er ${k}-mal auf dem Kopf. Wie groß ist die relative Häufigkeit für „Kopf“?`;
      opts = [E((k / n) * 100, true, undefined, '%'), E(k === (k / n) * 100 ? k / 2 : k, false, 'Das ist die absolute Häufigkeit – sie muss durch die Zahl der Würfe geteilt werden.', '%'), E(100 - (k / n) * 100, false, 'Das ist die relative Häufigkeit für „nicht Kopf“.', '%'), E(k / n, false, `${tex(`${k}:${n}=${ft(k / n)}`)} ist der Anteil – für Prozent wird noch mit 100 malgenommen.`, '%')];
      hints = ['Relative Häufigkeit = Treffer geteilt durch Anzahl der Versuche.', `${tex(br(k, n))} wird durch Erweitern oder Kürzen auf den Nenner 100 gebracht.`]; explain = `${tex(`${br(k, n)}=${br(R((k / n) * 100), 100)}=${ft((k / n) * 100)}\\,\\%`)}.`; daten = { n, k }; }
    else if (kind === 'erwartet') { const [z, n] = pick([[1, 6], [1, 4], [2, 5], [1, 3], [3, 8]]), wuerfe = n * pick([10, 20, 30, 50]), r = (wuerfe * z) / n; prompt = `Ein Glücksrad zeigt mit der Wahrscheinlichkeit ${tex(br(z, n))} „Gewinn“. Wie viele Gewinne sind bei ${wuerfe} Drehungen etwa zu erwarten?`;
      opts = [N(r, true), z > 1 ? N(wuerfe / n, false, `Das ist erst ${tex(br(1, n))} der Drehungen – gefragt sind ${tex(br(z, n))}, also noch mal ${z} nehmen.`) : N(wuerfe / (n * 2), false, 'Teile durch den Nenner – nicht durch das Doppelte.'), N(wuerfe - r, false, 'Das sind die erwarteten Nieten.'), N(n, false, 'Das ist der Nenner der Wahrscheinlichkeit, keine Anzahl von Gewinnen.')];
      hints = ['Erwartete Anzahl = Wahrscheinlichkeit mal Anzahl der Versuche.', `${tex(`${wuerfe}\\cdot ${br(z, n)}`)}: erst durch ${n} teilen${z > 1 ? `, dann mal ${z}` : ''}.`]; explain = `${tex(`${wuerfe}\\cdot ${br(z, n)}=${wuerfe}:${n}${z > 1 ? `\\cdot ${z}` : ''}=${r}`)}. Das ist ein Richtwert – der Zufall hält sich nicht genau daran.`; daten = { z, n, wuerfe }; }
    else if (kind === 'zweiwuerfel') { const s = pick([3, 4, 5, 6, 7, 8, 9, 10, 11]), paare = []; for (let i = 1; i <= 6; i++) if (s - i >= 1 && s - i <= 6) paare.push([i, s - i]); const c = paare.length;
      prompt = `Zwei Würfel werden geworfen. Wie groß ist die Wahrscheinlichkeit für die Augensumme ${s}?`;
      opts = [B(c, 36, true), B(Math.ceil(c / 2), 36, false, `Die Würfel werden unterschieden: (${paare[0][0]}|${paare[0][1]}) und (${paare[0][1]}|${paare[0][0]}) sind zwei verschiedene Ergebnisse.`), B(1, 11, false, 'Es gibt zwar 11 mögliche Augensummen, aber sie sind nicht gleich wahrscheinlich.'), B(c, 12, false, 'Bei zwei Würfeln gibt es 6 · 6 = 36 Ergebnisse, nicht 12.')];
      hints = [`Bei zwei Würfeln gibt es ${tex('6\\cdot 6=36')} gleich wahrscheinliche Ergebnisse.`, `Günstig sind: ${paare.map(([i, j]) => `(${i}|${j})`).join(', ')} – das sind ${c} Ergebnisse.`, 'Wahrscheinlichkeit = günstige durch mögliche, dann kürzen.']; explain = `${tex(`${br(c, 36)}${gcd(c, 36) > 1 ? `=${B(c, 36).tex}` : ''}`)}.`; daten = { s }; }
    else if (kind === 'rad') { const a = 15 * ri(5, 10), b = 15 * ri(5, 10), rest = 360 - a - b; if (a === b || a + b <= 180 || rest < 30 || rest === 120) continue;
      prompt = `Ein Glücksrad hat drei Felder. Das rote Feld hat den Mittelpunktswinkel ${a}°, das blaue ${b}°, der Rest ist gelb. Wie groß ist die Wahrscheinlichkeit für „Gelb“?`;
      opts = [B(rest, 360, true), B(1, 3, false, 'Die drei Felder sind nicht gleich groß.'), B(a + b, 360, false, 'Das ist die Wahrscheinlichkeit für Rot oder Blau – also für „nicht Gelb“.'), B(rest, 180, false, 'Der ganze Kreis hat 360°, nicht 180°.')];
      hints = [`Winkel des gelben Feldes: ${tex(`360^\\circ-${a}^\\circ-${b}^\\circ=${rest}^\\circ`)}.`, 'Wahrscheinlichkeit = Winkel des Feldes durch 360°.', `Kürze ${tex(br(rest, 360))} mit ${gcd(rest, 360)}.`]; explain = `${tex(`\\dfrac{360-${a}-${b}}{360}=${br(rest, 360)}=${B(rest, 360).tex}`)}.`; daten = { a, b }; }
    else if (kind === 'ohne') { const r = ri(3, 7), b = ri(3, 6), k = ri(1, 2), n = r + b; if (r === b) continue;
      prompt = `In einem Beutel liegen ${r} rote und ${b} blaue Kugeln. ${k === 1 ? 'Eine rote Kugel wurde' : 'Zwei rote Kugeln wurden'} schon gezogen und nicht zurückgelegt. Wie groß ist jetzt die Wahrscheinlichkeit, eine rote Kugel zu ziehen?`;
      opts = [B(r - k, n - k, true), B(r, n, false, 'Das war die Wahrscheinlichkeit vor dem Ziehen – jetzt fehlen Kugeln.'), B(r - k, n, false, 'Auch die Gesamtzahl der Kugeln ist kleiner geworden.'), B(r, n - k, false, 'Es sind auch weniger rote Kugeln im Beutel.')];
      hints = [`Rote Kugeln jetzt: ${tex(`${r}-${k}=${r - k}`)}.`, `Kugeln insgesamt jetzt: ${tex(`${n}-${k}=${n - k}`)}.`, 'Wahrscheinlichkeit = günstige durch alle möglichen.']; explain = `${tex(`\\dfrac{${r}-${k}}{${n}-${k}}=${br(r - k, n - k)}${gcd(r - k, n - k) > 1 ? `=${B(r - k, n - k).tex}` : ''}`)}.`; daten = { r, b, k }; }
    else if (kind === 'zweimal') { const r = ri(2, 5), b = ri(2, 5), g = ri(2, 4), n = r + b + g, mz = rand() < 0.5, zm = r * r + b * b + g * g, zo = r * (r - 1) + b * (b - 1) + g * (g - 1), nm = n * n, no = n * (n - 1); if (r === b && b === g) continue;
      prompt = `In einem Beutel liegen ${r} rote, ${b} blaue und ${g} grüne Kugeln. Es wird zweimal nacheinander gezogen – ${mz ? '<b>mit</b> Zurücklegen' : '<b>ohne</b> Zurücklegen'}. Wie groß ist die Wahrscheinlichkeit, dass beide Kugeln dieselbe Farbe haben?`;
      opts = mz ? [B(zm, nm, true), B(zo, no, false, 'Mit Zurücklegen bleibt der Beutel beim zweiten Zug unverändert – Zähler und Nenner ändern sich nicht.'), B(1, 3, false, 'Drei Farben heißt nicht ein Drittel: Die Farben kommen verschieden oft vor.'), B(r * r, nm, false, 'Das ist nur „beide rot“ – auch „beide blau“ und „beide grün“ zählen.')]
        : [B(zo, no, true), B(zm, nm, false, 'Ohne Zurücklegen fehlt beim zweiten Zug eine Kugel – Zähler und Nenner werden um 1 kleiner.'), B(1, 3, false, 'Drei Farben heißt nicht ein Drittel: Die Farben kommen verschieden oft vor.'), B(r * (r - 1), no, false, 'Das ist nur „beide rot“ – auch „beide blau“ und „beide grün“ zählen.')];
      const pf = (k) => (mz ? `${br(k, n)}\\cdot ${br(k, n)}=${br(k * k, nm)}` : `${br(k, n)}\\cdot ${br(k - 1, n - 1)}=${br(k * (k - 1), no)}`), Z = mz ? zm : zo, Nn = mz ? nm : no;
      hints = [`Pfadregel: Entlang eines Pfades wird malgenommen. Beide rot: ${tex(pf(r))}.`, `Ebenso beide blau: ${tex(pf(b))} und beide grün: ${tex(pf(g))}.`, 'Summenregel: Die Wahrscheinlichkeiten der drei Pfade werden addiert.', `Kürze ${tex(br(Z, Nn))}${gcd(Z, Nn) > 1 ? ` mit ${gcd(Z, Nn)}` : ' – es geht nicht weiter'}.`];
      explain = `Pfadregel und Summenregel: ${tex(`\\dfrac{${mz ? `${r * r}+${b * b}+${g * g}` : `${r * (r - 1)}+${b * (b - 1)}+${g * (g - 1)}`}}{${Nn}}=${br(Z, Nn)}${gcd(Z, Nn) > 1 ? `=${B(Z, Nn).tex}` : ''}`)}.`; daten = { r, b, g, mz }; }
    else if (kind === 'nachlegen') { const [z, nn] = pick([[2, 3], [3, 4], [4, 5], [3, 5], [1, 2]]), b = (nn - z) * ri(2, 5), T = (b * nn) / (nn - z); if (T - b - 1 < 2) continue; const r = ri(2, T - b - 1), x = T - b - r; if (r === b || x === r) continue;
      prompt = `In einem Beutel liegen ${r} rote und ${b} blaue Kugeln. Wie viele rote Kugeln muss man dazulegen, damit die Wahrscheinlichkeit für „rot“ genau ${tex(br(z, nn))} beträgt?`;
      opts = [N(x, true), N(T, false, 'Das ist die neue Gesamtzahl aller Kugeln.'), N(T - b, false, `So viele rote Kugeln sind es am Ende – ${r} davon liegen schon im Beutel.`), N(T - r, false, 'Auch die blauen Kugeln gehören zur Gesamtzahl.')];
      hints = [`Die ${b} blauen Kugeln bleiben. Gegenereignis: Ihr Anteil muss dann ${tex(`1-${br(z, nn)}=${br(nn - z, nn)}`)} sein.`, nn - z === 1 ? `Also sind ${b} Kugeln genau ${tex(br(1, nn))} aller Kugeln.` : `${b} Kugeln sind ${tex(br(nn - z, nn))} aller Kugeln, also ist ${tex(br(1, nn))} gleich ${tex(`${b}:${nn - z}=${b / (nn - z)}`)} Kugeln.`, `Gesamtzahl: ${tex(`${b / (nn - z)}\\cdot ${nn}=${T}`)} Kugeln.`, 'Rote Kugeln am Ende = Gesamtzahl minus blaue. Davon liegen einige schon im Beutel.'];
      explain = `Ansatz mit x neuen roten Kugeln: ${tex(`\\dfrac{${r}+x}{${r + b}+x}=${br(z, nn)}`)}. Über das Gegenereignis: Gesamtzahl ${tex(`${b}:${br(nn - z, nn)}=${T}`)}, also ${tex(`x=${T}-${b}-${r}=${x}`)}. Probe: ${tex(`${br(r + x, T)}=${br(z, nn)}`)}.`; daten = { r, b, z, nn }; }
    else { const [z, nn] = pick([[1, 6], [1, 4], [1, 3], [2, 5], [1, 5], [3, 10]]), k = nn - z, Z = nn * nn - k * k;
      prompt = `Ein Glücksrad zeigt mit der Wahrscheinlichkeit ${tex(br(z, nn))} „Gewinn“. Es wird zweimal gedreht. Wie groß ist die Wahrscheinlichkeit für <b>mindestens einen</b> Gewinn?`;
      opts = [B(Z, nn * nn, true), B(2 * z, nn, false, 'Einfach verdoppeln zählt den Fall „zweimal Gewinn“ doppelt.'), B(z * z, nn * nn, false, 'Das ist die Wahrscheinlichkeit für zwei Gewinne – „mindestens einer“ ist mehr.'), B(k * k, nn * nn, false, 'Das ist die Wahrscheinlichkeit für keinen Gewinn – also das Gegenereignis.')];
      hints = ['Das Gegenereignis von „mindestens ein Gewinn“ ist „kein Gewinn“.', `Kein Gewinn bei einer Drehung: ${tex(`1-${br(z, nn)}=${br(k, nn)}`)}.`, `Pfadregel für zwei Drehungen: ${tex(`${br(k, nn)}\\cdot ${br(k, nn)}=${br(k * k, nn * nn)}`)}.`, 'Zieh diese Wahrscheinlichkeit von 1 ab.'];
      explain = `Gegenereignis und Pfadregel: ${tex(`1-${br(k, nn)}\\cdot ${br(k, nn)}=1-${br(k * k, nn * nn)}=${br(Z, nn * nn)}${gcd(Z, nn * nn) > 1 ? `=${B(Z, nn * nn).tex}` : ''}`)}.`; daten = { z, nn }; }
    if (!gut(opts)) continue;
    return fertig(prompt, undefined, opts, hints, explain, kind, daten);
  }
}

/* ───────────── Klasse 7 ───────────── */

/** Rationale Zahlen: Rechnen mit negativen Zahlen und Dezimalzahlen, Vorzeichenregeln, verschachtelte Ausdrücke. */
export function genRational(lv = 3) {
  for (;;) {
    const kind = pick(tier(lv, ['plus'], ['plus', 'mal', 'minusminus'], ['mal', 'minusminus', 'geteilt'], ['punktstrich', 'potenz', 'klammer'], ['gross', 'potenz', 'doppelklammer']));
    const dez = () => (lv >= 3 ? ri(12, 95) / 10 : ri(2, lv === 1 ? 9 : 15)), a = dez(), b = dez(), c = ri(2, 6), Z = (v, c2, w2) => N(R(v, 4), c2, w2);
    let formula, opts, hints, explain;
    if (kind === 'plus') { formula = `${ft(-a)}+${ft(b)}`; if (a === b) continue;
      opts = [Z(b - a, true), Z(-(a + b), false, 'Bei verschiedenen Vorzeichen wird der kleinere Betrag vom größeren abgezogen.'), Z(a - b, false, 'Das Vorzeichen richtet sich nach der Zahl mit dem größeren Betrag.'), Z(a + b, false, 'Die erste Zahl ist negativ.')];
      hints = ['Stell dir die Zahlengerade vor: Start bei der negativen Zahl, dann nach rechts.', 'Verschiedene Vorzeichen: Beträge voneinander abziehen.']; explain = `${tex(`${ft(-a)}+${ft(b)}=${ft(b - a)}`)}.`; }
    else if (kind === 'minusminus') { formula = `${ft(-a)}-(${ft(-b)})`; if (a === b) continue;
      opts = [Z(b - a, true), Z(-(a + b), false, 'Minus eine negative Zahl heißt: plus die Gegenzahl.'), Z(a - b, false, 'Die erste Zahl bleibt negativ.'), Z(a + b, false, 'Nur das doppelte Minus in der Mitte wird zu Plus.')];
      hints = [`Minus eine negative Zahl heißt plus die Gegenzahl: ${tex('-(-b)=+b')}.`, `${tex(`${ft(-a)}+${ft(b)}`)}: verschiedene Vorzeichen, also Beträge voneinander abziehen.`]; explain = `${tex(`${ft(-a)}-(${ft(-b)})=${ft(-a)}+${ft(b)}=${ft(b - a)}`)}.`; }
    else if (kind === 'mal') { const beide = rand() < 0.5; formula = beide ? `(${ft(-a)})\\cdot(${-c})` : `${ft(a)}\\cdot(${-c})`;
      opts = beide ? [Z(a * c, true), Z(-a * c, false, 'Minus mal Minus ergibt Plus.'), Z(-(a + c), false, 'Hier wird malgenommen, nicht addiert.'), Z(a + c === a * c ? a * c + 1 : a + c, false, 'Hier wird malgenommen, nicht addiert.')]
        : [Z(-a * c, true), Z(a * c, false, 'Plus mal Minus ergibt Minus.'), Z(a - c, false, 'Hier wird malgenommen, nicht abgezogen.'), Z(-(a + c) === -a * c ? -a * c - 1 : -(a + c), false, 'Hier wird malgenommen, nicht addiert.')];
      hints = ['Gleiche Vorzeichen: Ergebnis positiv. Verschiedene Vorzeichen: Ergebnis negativ.', `Erst ohne Vorzeichen: ${tex(`${ft(a)}\\cdot ${c}=${ft(a * c)}`)}.`]; explain = `${beide ? 'Minus mal Minus ergibt Plus' : 'Plus mal Minus ergibt Minus'}: ${tex(`${formula}=${ft(beide ? a * c : -a * c)}`)}.`; }
    else if (kind === 'geteilt') { const q = dez(), p = R(q * c, 4), pos = rand() < 0.5; formula = `(${ft(-p)}):${pos ? `(${-c})` : c}`;
      opts = [Z(pos ? q : -q, true), Z(pos ? -q : q, false, pos ? 'Minus durch Minus ergibt Plus.' : 'Minus durch Plus ergibt Minus.'), Z(pos ? p * c : -p * c, false, 'Hier wird geteilt, nicht malgenommen.'), Z((pos ? 1 : -1) * (q + 1), false, 'Mach die Probe durch Malnehmen.')];
      hints = ['Die Vorzeichenregeln sind dieselben wie beim Malnehmen.', `Erst ohne Vorzeichen: ${tex(`${ft(p)}:${c}=${ft(q)}`)}.`]; explain = `${pos ? 'Minus durch Minus ergibt Plus' : 'Minus durch Plus ergibt Minus'}: ${tex(`${formula}=${ft(pos ? q : -q)}`)}. Probe: ${tex(`${kl(pos ? q : -q)}\\cdot ${kl(pos ? -c : c)}=${ft(-p)}`)}.`; }
    else if (kind === 'punktstrich') { const x = ri(12, 95) / 10, y = ri(2, 6), z = ri(12, 45) / 10, pr = R(y * z); formula = `${ft(-x)}+${y}\\cdot(${ft(-z)})`;
      opts = [Z(-x - pr, true), Z((-x + y) * -z, false, 'Punkt vor Strich: erst malnehmen, dann addieren.'), Z(-x + pr, false, 'Plus mal Minus ergibt Minus.'), Z(x - pr, false, 'Die erste Zahl ist negativ.')];
      hints = ['Punkt vor Strich: Zuerst wird das Produkt ausgerechnet.', `Plus mal Minus ergibt Minus: ${tex(`${y}\\cdot(${ft(-z)})=${ft(-pr)}`)}.`, `Dann addieren: ${tex(`${ft(-x)}+(${ft(-pr)})`)} – beide Zahlen sind negativ, die Beträge werden addiert.`]; explain = `${tex(`${ft(-x)}+(${ft(-pr)})=${ft(-x)}-${ft(pr)}=${ft(-x - pr)}`)}.`; }
    else if (kind === 'klammer') { const d = ri(2, 9), K = R(b - a, 4), T1 = R(K * -c, 4), val = T1 - d; if (a === b) continue; formula = `(${ft(-a)}+${ft(b)})\\cdot(${-c})-${d}`;
      opts = [Z(val, true), Z(-a + b * -c - d, false, 'Die Klammer wird zuerst ausgerechnet – erst dann wird malgenommen.'), Z(K * c - d, false, 'Achte auf die Vorzeichenregel: Der zweite Faktor ist negativ.'), Z(T1 + d, false, `Am Ende wird ${d} abgezogen, nicht addiert.`)];
      hints = [`Klammer zuerst: ${tex(`${ft(-a)}+${ft(b)}=${ft(K)}`)}.`, `Dann malnehmen – ${K < 0 ? 'Minus mal Minus ergibt Plus' : 'Plus mal Minus ergibt Minus'}: ${tex(`${kl(K)}\\cdot(${-c})=${ft(T1)}`)}.`, `Zum Schluss ${d} abziehen.`];
      explain = `${tex(`${kl(K)}\\cdot(${-c})-${d}=${ft(T1)}-${d}=${ft(val)}`)}.`; }
    else if (kind === 'potenz' && lv <= 4) { const x = ri(2, 5), n = pick([2, 3]), mitKl = rand() < 0.5; formula = mitKl ? `(${-x})^${n}` : `-${x}^${n}`; const r = mitKl ? (-x) ** n : -(x ** n);
      opts = [N(r, true), N(-r, false, mitKl ? 'Die Klammer gehört dazu: Das Minus wird mitpotenziert.' : 'Ohne Klammer wird nur die Zahl potenziert – das Minus bleibt davor stehen.'), N(-x * n, false, 'Potenzieren heißt mehrfach malnehmen, nicht mal der Hochzahl.'), N(x * n === Math.abs(r) ? x * n + 1 : x * n, false, 'Potenzieren heißt mehrfach malnehmen, nicht mal der Hochzahl.')];
      hints = [mitKl ? 'Mit Klammer wird das Vorzeichen mitpotenziert.' : 'Ohne Klammer gilt: erst potenzieren, dann das Minus.', `${tex(`${x}^${n}=${Array(n).fill(x).join('\\cdot')}=${x ** n}`)}.`, mitKl ? `${n === 2 ? 'Gerade' : 'Ungerade'} Hochzahl: Das Ergebnis ist ${n === 2 ? 'positiv' : 'negativ'}.` : 'Das Minus kommt erst nach dem Potenzieren dazu.']; explain = `${tex(`${formula}=${mitKl ? Array(n).fill(`(${-x})`).join('\\cdot') : `-(${Array(n).fill(x).join('\\cdot')})`}=${r}`)}.`; }
    else if (kind === 'potenz') { const x = ri(2, 5), y = ri(2, 4), n = pick([2, 3]), z = pick([1.5, 2.5, 0.5, 3]), Pw = (-y) ** n, T2 = R(Pw * -z), val = -(x * x) - T2; formula = `-${x}^2-(${-y})^${n}\\cdot(${ft(-z)})`;
      opts = [Z(val, true), Z(x * x - T2, false, `Ohne Klammer wird nur die ${x} quadriert – das Minus bleibt davor stehen.`), Z(-(x * x) + T2, false, n === 2 ? 'Eine gerade Hochzahl macht die Potenz positiv – danach gilt: Plus mal Minus ergibt Minus.' : 'Eine ungerade Hochzahl lässt die Potenz negativ – danach gilt: Minus mal Minus ergibt Plus.'), Z((-(x * x) - Pw) * -z, false, 'Punkt vor Strich: Erst wird malgenommen, dann abgezogen.')];
      hints = [`Potenzen zuerst: ${tex(`-${x}^2=-${x * x}`)} (das Minus wird nicht mitquadriert) und ${tex(`(${-y})^${n}=${Pw}`)}.`, `Dann Punkt vor Strich: ${tex(`${kl(Pw)}\\cdot(${ft(-z)})=${ft(T2)}`)}.`, `Zum Schluss abziehen: ${tex(`-${x * x}-${kl(T2)}`)}.`];
      explain = `${tex(`-${x * x}-${kl(Pw)}\\cdot(${ft(-z)})=-${x * x}-${kl(T2)}=${ft(val)}`)}.`; }
    else if (kind === 'gross') { const a2 = ri(12, 58) / 10, b2 = ri(11, 49) / 10, sb = pick([1, -1]), c2 = ri(2, 6), e = pick([0.5, 0.4, 0.8, 1.5, 2.5]), q = ri(2, 9), p = R(q * e), op = pick(['+', '-']);
      const K = R(-a2 + sb * b2), T1 = R(K * -c2), val = op === '+' ? T1 - q : T1 + q; if (K === 0) continue;
      formula = `(${ft(-a2)}${sb > 0 ? '+' : '-'}${ft(b2)})\\cdot(${-c2})${op}(${ft(-p)}):${ft(e)}`;
      opts = [Z(val, true), Z(op === '+' ? -T1 - q : -T1 + q, false, `Vorzeichenregel beim Malnehmen: ${K < 0 ? 'Minus mal Minus ergibt Plus' : 'Plus mal Minus ergibt Minus'}.`), Z(op === '+' ? T1 + q : T1 - q, false, op === '-' ? 'Minus eine negative Zahl heißt: plus die Gegenzahl.' : 'Plus eine negative Zahl heißt: Die Gegenzahl wird abgezogen.'), Z(-a2 + sb * b2 * -c2 + (op === '+' ? -q : q), false, 'Die Klammer wird zuerst ausgerechnet – erst dann wird malgenommen.')];
      hints = [`Klammer zuerst: ${tex(`${ft(-a2)}${sb > 0 ? '+' : '-'}${ft(b2)}=${ft(K)}`)}.`, `Produkt – ${K < 0 ? 'Minus mal Minus ergibt Plus' : 'Plus mal Minus ergibt Minus'}: ${tex(`${kl(K)}\\cdot(${-c2})=${ft(T1)}`)}.`, `Quotient – Minus durch Plus ergibt Minus: ${tex(`(${ft(-p)}):${ft(e)}=${-q}`)}.`, `Zum Schluss: ${tex(`${ft(T1)}${op}(${-q})`)}.`];
      explain = `${tex(`${kl(K)}\\cdot(${-c2})${op}(${ft(-p)}):${ft(e)}=${ft(T1)}${op}(${-q})=${ft(T1)}${op === '+' ? '-' : '+'}${q}=${ft(val)}`)}.`; }
    else { const u = ri(12, 95) / 10, v = pick([1.5, 2.5, 0.5, 3, 4]), w = ri(2, 9), x = ri(2, 9), y = ri(12, 95) / 10, I = R(-x + y), M = R(w - I), pr = R(-v * M), val = R(u - pr); if (M === 0 || I === 0) continue;
      formula = `${ft(u)}-(${ft(-v)})\\cdot(${w}-(${-x}+${ft(y)}))`;
      opts = [Z(val, true), Z(u + pr, false, 'Minus eine negative Zahl heißt: plus die Gegenzahl – achte auf das Vorzeichen des Produkts.'), Z(u + v * (w + I), false, 'Das Minus vor der inneren Klammer gilt für ihr ganzes Ergebnis.'), Z((u + v) * M, false, 'Punkt vor Strich: Erst das Produkt, dann die Differenz.')];
      hints = [`Innere Klammer zuerst: ${tex(`${-x}+${ft(y)}=${ft(I)}`)}.`, `Äußere Klammer: ${tex(`${w}-${kl(I)}=${ft(M)}`)}.`, `Produkt – ${M < 0 ? 'Minus mal Minus ergibt Plus' : 'Minus mal Plus ergibt Minus'}: ${tex(`(${ft(-v)})\\cdot ${kl(M)}=${ft(pr)}`)}.`, `Zum Schluss abziehen: ${tex(`${ft(u)}-${kl(pr)}`)}.`];
      explain = `${tex(`${ft(u)}-(${ft(-v)})\\cdot ${kl(M)}=${ft(u)}-${kl(pr)}=${ft(val)}`)}.`; }
    if (!gut(opts)) continue;
    return fertig('Berechne.', formula, opts, hints, explain, kind);
  }
}

const tx = (k) => (k === 1 ? 'x' : k === -1 ? '-x' : `${k}x`);
/** Summe aus x-Gliedern und Zahlen als TeX, z. B. su([3, 'x'], [-4, ''], [-1, 'x']) → 3x-4-x. Glieder mit 0 fallen weg. */
const su = (...ts) => ts.filter(([k]) => k).map(([k, v], i) => (v ? (Math.abs(k) === 1 ? `${k < 0 ? '-' : i ? '+' : ''}x` : `${i && k > 0 ? '+' : ''}${k}x`) : `${i && k > 0 ? '+' : ''}${k}`)).join('') || '0';
const qx = (z, n) => { const s = n < 0 ? -1 : 1, g = gcd(z, n) || 1, a = (s * z) / g, b = (s * n) / g; return b === 1 ? `${a}` : `${a < 0 ? '-' : ''}\\dfrac{${Math.abs(a)}}{${b}}`; };
/** Antwort x = z/n als gekürzter Bruch (oder ganze Zahl). */
const XQ = (z, n, correct, why) => N(n ? z / n : NaN, correct, why, `x=${n ? qx(z, n) : '?'}`);

/** Gleichungen mit Klammern, mit x auf beiden Seiten, mit Brüchen und verschachtelten Klammern. */
export function genGleichungKlammer(lv = 3) {
  for (;;) {
    const kind = pick(tier(lv, ['klammer'], ['klammer', 'beide'], ['minusklammer', 'bruch'], ['zwei', 'bruchbeide'], ['verschachtelt', 'bruchzwei', 'drei']));
    const x = ri(lv >= 2 ? -6 : 1, 9), a = ri(2, 6), b = ri(1, 8), c = ri(1, a - 1 || 1);
    if (x === 0) continue;
    let formula, opts, hints, explain;
    if (kind === 'klammer') { const sb = lv >= 2 ? -1 : 1, r = a * (x + sb * b); if (r === 0) continue; formula = `${a}(x${pm(sb * b)})=${r}`;
      opts = [XQ(x, 1, true), XQ(r, a, false, `Nach dem Teilen durch ${a} muss noch ${b} ${sb > 0 ? 'abgezogen' : 'addiert'} werden.`), XQ(r - sb * b, a, false, `Beim Ausmultiplizieren wird auch die ${b} mit ${a} malgenommen.`), XQ(r - a - sb * b, 1, false, 'Die Klammer steht für eine Multiplikation: erst durch den Faktor teilen oder ausmultiplizieren.')];
      hints = [`Teile zuerst beide Seiten durch ${a}.`, `${tex(`x${pm(sb * b)}=${r / a}`)}.`]; explain = `${tex(`x${pm(sb * b)}=${r}:${a}=${r / a}\\ \\Rightarrow\\ x=${x}`)}.`; }
    else if (kind === 'beide') { const d = (a - c) * x + b; if (d === b || d === 0) continue; formula = `${a}x+${b}=${c === 1 ? '' : c}x${pm(d)}`;
      opts = [XQ(x, 1, true), XQ(d - b, a + c, false, `Beim Herüberholen wird ${c === 1 ? 'x' : `${c}x`} abgezogen, nicht addiert.`), XQ(d + b, a - c, false, `Die ${b} wird auf beiden Seiten abgezogen.`), XQ(-x, 1, false, 'Achte auf die Vorzeichen beim Umformen – mach die Probe.')];
      hints = [`Bringe alle x auf die linke Seite: ${tex(`\\mid -${tx(c)}`)}.`, `${tex(`${tx(a - c)}+${b}=${d}`)}, dann ${tex(`\\mid -${b}`)}.`, `${tex(`${tx(a - c)}=${d - b}`)}.`]; explain = `${tex(`${tx(a - c)}+${b}=${d}\\ \\Rightarrow\\ ${tx(a - c)}=${d - b}\\ \\Rightarrow\\ x=${x}`)}.`; }
    else if (kind === 'minusklammer') { const r = a * x - (x - b), k = a - 1; if (k < 2) continue; formula = `${a}x-(x-${b})=${r}`;
      opts = [XQ(x, 1, true), XQ(r + b, k, false, `Ein Minus vor der Klammer dreht <b>alle</b> Vorzeichen um: Aus ${tex(`-${b}`)} wird ${tex(`+${b}`)}.`), XQ(r - b, a + 1, false, 'Minus mal x ergibt −x, nicht +x.'), XQ(r - b, 1, false, 'Fasse erst die x-Glieder zusammen und teile dann.')];
      hints = ['Ein Minus vor der Klammer dreht alle Vorzeichen in der Klammer um.', `${tex(`${a}x-x+${b}=${r}`)}.`, `Zusammenfassen: ${tex(`${k}x+${b}=${r}`)}, dann ${tex(`\\mid -${b}`)}.`]; explain = `${tex(`${a}x-x+${b}=${r}\\ \\Rightarrow\\ ${k}x+${b}=${r}\\ \\Rightarrow\\ ${k}x=${r - b}\\ \\Rightarrow\\ x=${x}`)}.`; }
    else if (kind === 'bruch') { const n = pick([2, 3, 4, 5]), xx = x * n, r = x + b; if (r === 0) continue; formula = `\\dfrac{x}{${n}}+${b}=${r}`;
      opts = [XQ(xx, 1, true), XQ(r - b, n, false, `Um ${tex(`\\tfrac{x}{${n}}`)} aufzulösen, wird mit ${n} malgenommen, nicht geteilt.`), XQ(r * n - b, 1, false, `Erst die ${b} abziehen, dann mit ${n} malnehmen.`), XQ((r + b) * n, 1, false, `Die ${b} wird abgezogen, nicht addiert.`)];
      hints = [`Zieh zuerst ${b} auf beiden Seiten ab: ${tex(`\\dfrac{x}{${n}}=${r - b}`)}.`, `Dann beide Seiten mit ${n} malnehmen.`]; explain = `${tex(`\\dfrac{x}{${n}}=${r}-${b}=${r - b}\\ \\Rightarrow\\ x=${kl(r - b)}\\cdot ${n}=${xx}`)}.`; }
    else if (kind === 'zwei') { const m = ri(2, 4), e = ri(1, 5), d = a * (x + b) - m * (x - e); if (a === m || d === 0) continue; formula = `${a}(x+${b})=${m}(x-${e})${pm(d)}`;
      opts = [XQ(x, 1, true), XQ(d - m * e - b, a - m, false, `Auch die ${b} wird mit ${a} malgenommen.`), XQ(d + m * e - a * b, a - m, false, `${tex(`${m}\\cdot(-${e})=-${m * e}`)} – das Minus bleibt.`), XQ(d - m * e - a * b, a + m, false, `Beim Herüberholen wird ${m}x abgezogen.`)];
      hints = [`Löse beide Klammern auf: ${tex(`${a}x+${a * b}=${m}x-${m * e}${pm(d)}`)}.`, `Rechte Seite zusammenfassen: ${tex(`${a}x+${a * b}=${su([m, 'x'], [d - m * e, ''])}`)}.`, `Alle x nach links (${tex(`\\mid -${m}x`)}), Zahlen nach rechts (${tex(`\\mid -${a * b}`)}): ${tex(`${tx(a - m)}=${d - m * e - a * b}`)}.`, a - m === 1 ? 'Damit steht x schon allein.' : `Teile durch ${a - m}.`];
      explain = `${tex(`${a}x+${a * b}=${su([m, 'x'], [d - m * e, ''])}\\ \\Rightarrow\\ ${tx(a - m)}=${d - m * e - a * b}\\ \\Rightarrow\\ x=${x}`)}.`; }
    else if (kind === 'bruchbeide') { const n = pick([2, 3, 4, 5]), k = pick([-1, 1]) * ri(1, 4), xx = n * k, cc = ri(1, 3), d = k + b - cc * xx, K = 1 - cc * n; if (d === 0) continue; formula = `\\dfrac{x}{${n}}+${b}=${tx(cc)}${pm(d)}`;
      opts = [XQ(xx, 1, true), XQ(d * n - b, K, false, `Auch die ${b} wird mit ${n} malgenommen.`), XQ(d * n - b * n, 1 + cc * n, false, `Beim Herüberholen wird ${cc * n}x abgezogen, nicht addiert.`), XQ(-xx, 1, false, 'Achte auf die Vorzeichen beim Umformen – mach die Probe.')];
      hints = [`Multipliziere beide Seiten mit ${n} – jedes Glied: ${tex(`x+${b * n}=${su([cc * n, 'x'], [d * n, ''])}`)}.`, `Alle x nach links (${tex(`\\mid -${cc * n}x`)}): ${tex(`${su([K, 'x'], [b * n, ''])}=${d * n}`)}.`, `Zahlen nach rechts (${tex(`\\mid -${b * n}`)}): ${tex(`${tx(K)}=${d * n - b * n}`)}.`, `Teile durch ${K}.`];
      explain = `${tex(`x+${b * n}=${su([cc * n, 'x'], [d * n, ''])}\\ \\Rightarrow\\ ${tx(K)}=${d * n - b * n}\\ \\Rightarrow\\ x=${xx}`)}. Probe: ${tex(`\\dfrac{${xx}}{${n}}+${b}=${k + b}`)} und ${tex(`${cc}\\cdot ${kl(xx)}${pm(d)}=${k + b}`)}.`; }
    else if (kind === 'verschachtelt') { const a1 = ri(2, 4), b1 = ri(2, 4), c1 = ri(1, 6), d1 = ri(1, 9), e = ri(2, 5), f = ri(1, 6), g = ri(1, 9), h = pick([-1, 1]) * ri(1, 20), K = a1 * b1 - e - g, C = a1 * (d1 - b1 * c1) - e * f, Rr = h - C;
      if (Math.abs(K) < 2 || Rr === 0 || (Rr % K === 0 && rand() < 0.75)) continue;
      formula = `${a1}(${b1}(x-${c1})+${d1})-${e}(x+${f})=${g === 1 ? '' : g}x${pm(h)}`;
      opts = [XQ(Rr, K, true), XQ(h + a1 * b1 * c1 - d1 + e * f, K, false, `Auch die ${d1} in der äußeren Klammer wird mit ${a1} malgenommen.`), XQ(h + a1 * b1 * c1 - a1 * d1 - e * f, K, false, `${tex(`-${e}\\cdot ${f}=-${e * f}`)}: Das Minus vor der Klammer gilt für beide Glieder.`), XQ(Rr, a1 * b1 - e + g, false, `Beim Herüberholen wird ${tx(g)} abgezogen, nicht addiert.`)];
      hints = [`Innere Klammer zuerst: ${tex(`${b1}(x-${c1})+${d1}=${su([b1, 'x'], [d1 - b1 * c1, ''])}`)}.`, `Äußere Klammern ausmultiplizieren – das Minus vor der zweiten Klammer dreht beide Vorzeichen: ${tex(`${su([a1 * b1, 'x'], [a1 * (d1 - b1 * c1), ''], [-e, 'x'], [-e * f, ''])}=${su([g, 'x'], [h, ''])}`)}.`, `Zusammenfassen: ${tex(`${su([a1 * b1 - e, 'x'], [C, ''])}=${su([g, 'x'], [h, ''])}`)}.`, `Alle x nach links, alle Zahlen nach rechts: ${tex(`${tx(K)}=${Rr}`)}.`, `Teile durch ${K}${Rr % K ? ' und kürze' : ''}.`];
      explain = `${tex(`${su([a1 * b1 - e, 'x'], [C, ''])}=${su([g, 'x'], [h, ''])}`)}, also ${tex(`${tx(K)}=${Rr}`)} und damit ${tex(`x=${qx(Rr, K)}`)}.`; }
    else if (kind === 'bruchzwei') { const m = pick([2, 3, 4, 5, 6]), n = pick([2, 3, 4, 5, 6].filter((v) => v !== m)), L = (m * n) / gcd(m, n), a1 = ri(1, 3), b1 = ri(1, 6), c1 = pick([-1, 1]) * ri(1, 9), Kd = L / m - a1 * L - L / n, Zz = L * (c1 - a1 * b1), K3 = L / m - a1 - L / n;
      if (Zz === 0 || K3 === 0 || (Zz % Kd === 0 && rand() < 0.75)) continue;
      formula = `\\dfrac{x}{${m}}-${a1 === 1 ? '' : a1}(x-${b1})=\\dfrac{x}{${n}}${pm(c1)}`;
      opts = [XQ(Zz, Kd, true), XQ(c1 - a1 * b1 * L, Kd, false, `Auch die ${Math.abs(c1)} auf der rechten Seite wird mit ${L} malgenommen.`), XQ(L * (c1 + a1 * b1), Kd, false, `Minus mal Minus ergibt Plus: ${tex(`-${a1}\\cdot(-${b1})=+${a1 * b1}`)}.`), XQ(c1 * L - a1 * b1, K3, false, `Auch die Klammer wird mit ${L} malgenommen.`)];
      hints = [`Der Hauptnenner von ${m} und ${n} ist ${L}: Multipliziere jedes Glied mit ${L}.`, `${tex(`${tx(L / m)}-${a1 * L}(x-${b1})=${su([L / n, 'x'], [c1 * L, ''])}`)}.`, `Klammer auflösen – Minus mal Minus ergibt Plus: ${tex(`${su([L / m, 'x'], [-a1 * L, 'x'], [a1 * b1 * L, ''])}=${su([L / n, 'x'], [c1 * L, ''])}`)}.`, `Zusammenfassen, x nach links, Zahlen nach rechts: ${tex(`${tx(Kd)}=${Zz}`)}.`, `Teile durch ${Kd}${Zz % Kd ? ' und kürze' : ''}.`];
      explain = `Mit dem Hauptnenner ${L} multipliziert: ${tex(`${su([L / m - a1 * L, 'x'], [a1 * b1 * L, ''])}=${su([L / n, 'x'], [c1 * L, ''])}`)}, also ${tex(`${tx(Kd)}=${Zz}`)} und damit ${tex(`x=${qx(Zz, Kd)}`)}.`; }
    else { const a1 = ri(2, 6), b1 = ri(1, 6), c1 = ri(2, 5), d1 = ri(1, 8), e = ri(2, 6), f = ri(1, 6), g = ri(1, 9), K = a1 + c1 - e - 1, Rr = c1 * d1 - a1 * b1 - e * f - g;
      if (Math.abs(K) < 2 || Rr === 0 || (Rr % K === 0 && rand() < 0.75)) continue;
      formula = `${a1}(x+${b1})-${c1}(${d1}-x)=${e}(x-${f})-(${g}-x)`;
      opts = [XQ(Rr, K, true), XQ(Rr, a1 - c1 - e - 1, false, `Minus mal Minus ergibt Plus: ${tex(`-${c1}\\cdot(-x)=+${c1}x`)}.`), XQ(Rr, a1 + c1 - e + 1, false, `Das Minus vor der letzten Klammer dreht beide Vorzeichen: ${tex(`-(${g}-x)=-${g}+x`)}.`), XQ(c1 * d1 - a1 * b1 + e * f - g, K, false, `${tex(`${e}\\cdot(-${f})=-${e * f}`)} – das Minus bleibt.`)];
      hints = [`Alle Klammern auflösen – ein Minus davor dreht jedes Vorzeichen: ${tex(`${su([a1, 'x'], [a1 * b1, ''], [-c1 * d1, ''], [c1, 'x'])}=${su([e, 'x'], [-e * f, ''], [-g, ''], [1, 'x'])}`)}.`, `Beide Seiten zusammenfassen: ${tex(`${su([a1 + c1, 'x'], [a1 * b1 - c1 * d1, ''])}=${su([e + 1, 'x'], [-e * f - g, ''])}`)}.`, `Alle x nach links, alle Zahlen nach rechts: ${tex(`${tx(K)}=${Rr}`)}.`, `Teile durch ${K}${Rr % K ? ' und kürze' : ''}.`];
      explain = `${tex(`${su([a1 + c1, 'x'], [a1 * b1 - c1 * d1, ''])}=${su([e + 1, 'x'], [-e * f - g, ''])}`)}, also ${tex(`${tx(K)}=${Rr}`)} und damit ${tex(`x=${qx(Rr, K)}`)}.`; }
    if (!gut(opts)) continue;
    const ri2 = opts.find((o) => o.correct); if (Math.abs(ri2.num) > 40 || opts.some((o) => /\d{3}/.test(o.tex))) continue;   // keine unhandlichen Brüche
    return fertig('Löse die Gleichung.', formula, opts, hints, explain, kind);
  }
}

/* ───────────── Klasse 8 ───────────── */

/** Flächeninhalt von Dreieck, Parallelogramm und Trapez – bis zu zusammengesetzten Flächen und Rückwärtsaufgaben mit x. */
export function genVieleck(lv = 3) {
  for (;;) {
    const kind = pick(tier(lv, ['parallelogramm'], ['dreieck', 'parallelogramm'], ['trapez', 'rueck'], ['rueckt', 'zusammen', 'trapezdez'], ['schenkel', 'parameter', 'grundstueck']));
    const g = ri(3, 12), h = ri(2, 9), a = ri(4, 12), c = ri(2, a - 1), A2 = (v, c2, w2) => E(v, c2, w2, 'cm²');
    let prompt, opts, hints, explain, daten;
    if (kind === 'parallelogramm' && lv <= 1) { if (g === h) continue; prompt = `Ein Parallelogramm hat die Grundseite ${g} cm und die zugehörige Höhe ${h} cm. Wie groß ist sein Flächeninhalt?`;
      opts = [A2(g * h, true), A2(g + h, false, 'Grundseite und Höhe werden malgenommen, nicht addiert.'), A2((g * h) / 2, false, 'Die Hälfte gilt beim Dreieck, nicht beim Parallelogramm.'), A2(2 * (g + h), false, 'Das ist ein Umfang, kein Flächeninhalt.')];
      hints = [`${tex('A=g\\cdot h')}.`, 'Grundseite mal Höhe – wie beim Rechteck.']; explain = `${tex(`A=${g}\\cdot ${h}=${g * h}`)} cm².`; daten = { g, h }; }
    else if (kind === 'parallelogramm') { const s = h + ri(1, 3); if (g * s === 2 * (g + s) || (g * h) / 2 === 2 * (g + s)) continue; prompt = `Ein Parallelogramm hat die Grundseite ${g} cm, die zugehörige Höhe ${h} cm und die schräge Seite ${s} cm. Wie groß ist sein Flächeninhalt?`;
      opts = [A2(g * h, true), A2(g * s, false, 'Gebraucht wird die <b>Höhe</b>, nicht die schräge Seite.'), A2((g * h) / 2, false, 'Die Hälfte gilt beim Dreieck. Ein Parallelogramm ist so groß wie ein Rechteck mit gleicher Grundseite und Höhe.'), A2(2 * (g + s), false, 'Das ist der Umfang.')];
      hints = [`${tex('A=g\\cdot h')} – mit der Höhe, die senkrecht auf der Grundseite steht.`, 'Schneidet man ein Dreieck ab und setzt es an der anderen Seite an, entsteht ein Rechteck.']; explain = `${tex(`A=g\\cdot h=${g}\\cdot ${h}=${g * h}`)} cm². Die schräge Seite wird nicht gebraucht.`; daten = { g, h }; }
    else if (kind === 'dreieck') { if ((g * h) % 2 || g + h === (g * h) / 2) continue; prompt = `Ein Dreieck hat die Grundseite ${g} cm und die zugehörige Höhe ${h} cm. Wie groß ist sein Flächeninhalt?`;
      opts = [A2((g * h) / 2, true), A2(g * h, false, `Es fehlt der Faktor ${tex('\\tfrac{1}{2}')}: Ein Dreieck ist ein halbes Parallelogramm.`), A2(g + h, false, 'Grundseite und Höhe werden malgenommen, nicht addiert.'), A2((g + h) / 2 === (g * h) / 2 ? g * h * 2 : (g * h) / 4, false, 'Nur einmal halbieren.')];
      hints = [`${tex('A=\\tfrac{1}{2}\\cdot g\\cdot h')}.`, `${tex(`${g}\\cdot ${h}=${g * h}`)}, davon die Hälfte.`]; explain = `${tex(`A=\\tfrac{1}{2}\\cdot ${g}\\cdot ${h}=\\tfrac{1}{2}\\cdot ${g * h}=${(g * h) / 2}`)} cm².`; daten = { g, h }; }
    else if (kind === 'trapez') { if (((a + c) * h) % 2 || (a * c * h) / 2 === a * h) continue; prompt = `Ein Trapez hat die parallelen Seiten a = ${a} cm und c = ${c} cm und die Höhe ${h} cm. Wie groß ist sein Flächeninhalt?`;
      opts = [A2(((a + c) * h) / 2, true), A2((a + c) * h, false, `Es fehlt der Faktor ${tex('\\tfrac{1}{2}')}.`), A2(a * h, false, 'Beide parallelen Seiten gehören in die Formel – ihr Mittelwert zählt.'), A2((a * c * h) / 2, false, 'Die parallelen Seiten werden addiert, nicht malgenommen.')];
      hints = [`${tex('A=\\tfrac{1}{2}\\cdot(a+c)\\cdot h')}.`, `Summe der parallelen Seiten: ${tex(`${a}+${c}=${a + c}`)} cm.`, `Davon die Hälfte, mal die Höhe ${h} cm.`]; explain = `${tex(`A=\\tfrac{1}{2}\\cdot(${a}+${c})\\cdot ${h}=\\tfrac{1}{2}\\cdot ${a + c}\\cdot ${h}=${ft(((a + c) * h) / 2)}`)} cm².`; daten = { a, c, h }; }
    else if (kind === 'rueck') { const A = (g * h) / 2; if ((g * h) % 2) continue; prompt = `Ein Dreieck hat den Flächeninhalt ${A} cm² und die Grundseite ${g} cm. Wie lang ist die zugehörige Höhe?`;
      opts = [E(h, true, undefined, 'cm'), E(A / g, false, `Beim Dreieck steckt der Faktor ${tex('\\tfrac{1}{2}')} in der Formel – das Ergebnis ist doppelt so groß.`, 'cm'), E(A * g, false, 'Hier wird geteilt, nicht malgenommen.', 'cm'), E(h * 2, false, 'Einmal zu oft verdoppelt.', 'cm')];
      hints = [`${tex('A=\\tfrac{1}{2}\\cdot g\\cdot h')}, umgestellt: ${tex('h=\\dfrac{2\\cdot A}{g}')}.`, `${tex(`2\\cdot ${A}=${2 * A}`)}.`, `Dann durch die Grundseite ${g} teilen.`]; explain = `${tex(`h=\\dfrac{2\\cdot ${A}}{${g}}=\\dfrac{${2 * A}}{${g}}=${h}`)} cm.`; daten = { A, g }; }
    else if (kind === 'rueckt') { const A = ((a + c) * h) / 2; if (((a + c) * h) % 2) continue; prompt = `Ein Trapez hat den Flächeninhalt ${A} cm², die Höhe ${h} cm und eine parallele Seite a = ${a} cm. Wie lang ist die andere parallele Seite c?`;
      opts = [E(c, true, undefined, 'cm'), E(a + c, false, 'Das ist die Summe beider Seiten – zieh a noch ab.', 'cm'), E((2 * A) / h + a, false, 'a wird abgezogen, nicht addiert.', 'cm'), E(A / h, false, `Erst mit 2 malnehmen: ${tex('a+c=\\dfrac{2A}{h}')}.`, 'cm')];
      hints = [`${tex('A=\\tfrac{1}{2}\\cdot(a+c)\\cdot h')}, umgestellt: ${tex('a+c=\\dfrac{2\\cdot A}{h}')}.`, `${tex(`\\dfrac{2\\cdot ${ft(A)}}{${h}}=\\dfrac{${2 * A}}{${h}}=${a + c}`)}.`, `Das ist die Summe beider Seiten – zieh a = ${a} cm ab.`]; explain = `${tex(`a+c=\\dfrac{2\\cdot ${ft(A)}}{${h}}=${a + c}`)}, also ${tex(`c=${a + c}-${a}=${c}`)} cm.`; daten = { A, a, h }; }
    else if (kind === 'zusammen') { const r = ri(3, 8), hd = ri(2, 6); if ((g * hd) % 2 || r === hd) continue; prompt = `Die Giebelwand eines Hauses besteht aus einem Rechteck (${g} m breit, ${r} m hoch) und einem Dreieck darauf (Grundseite ${g} m, Höhe ${hd} m). Wie groß ist die ganze Fläche?`;
      opts = [E(g * r + (g * hd) / 2, true, undefined, 'm²'), E(g * r + g * hd, false, `Beim Dreieck fehlt der Faktor ${tex('\\tfrac{1}{2}')}.`, 'm²'), E(g * r, false, 'Das ist nur das Rechteck.', 'm²'), E((g * (r + hd)) / 2, false, 'Nur das Dreieck wird halbiert, nicht das Rechteck.', 'm²')];
      hints = ['Zerlege die Figur: Rechteck plus Dreieck.', `Rechteck: ${tex(`${g}\\cdot ${r}=${g * r}`)} m².`, `Dreieck: ${tex(`\\tfrac{1}{2}\\cdot ${g}\\cdot ${hd}=${(g * hd) / 2}`)} m².`]; explain = `${tex(`${g}\\cdot ${r}+\\tfrac{1}{2}\\cdot ${g}\\cdot ${hd}=${g * r}+${(g * hd) / 2}=${g * r + (g * hd) / 2}`)} m².`; daten = { g, r, hd }; }
    else if (kind === 'trapezdez') { const ad = ri(45, 120) / 10, cd = ri(20, ad * 10 - 10) / 10, hh = ri(2, 9), F = R(((ad + cd) / 2) * hh, 4); prompt = `Ein Trapez hat die parallelen Seiten a = ${gT(ad)} cm und c = ${gT(cd)} cm und die Höhe ${hh} cm. Wie groß ist sein Flächeninhalt?`;
      opts = [A2(F, true), A2((ad + cd) * hh, false, `Es fehlt der Faktor ${tex('\\tfrac{1}{2}')}.`), A2(ad * hh, false, 'Beide parallelen Seiten gehören in die Formel – ihr Mittelwert zählt.'), A2((ad * cd * hh) / 2, false, 'Die parallelen Seiten werden addiert, nicht malgenommen.')];
      hints = [`${tex('A=\\tfrac{1}{2}\\cdot(a+c)\\cdot h')}.`, `Summe der parallelen Seiten: ${tex(`${ft(ad)}+${ft(cd)}=${ft(ad + cd)}`)} cm.`, `Mittelwert: ${tex(`${ft(ad + cd)}:2=${ft((ad + cd) / 2)}`)} cm – mal die Höhe ${hh} cm.`]; explain = `${tex(`A=\\tfrac{1}{2}\\cdot(${ft(ad)}+${ft(cd)})\\cdot ${hh}=${ft((ad + cd) / 2)}\\cdot ${hh}=${ft(F, 4)}`)} cm².`; daten = { a: ad, c: cd, h: hh }; }
    else if (kind === 'schenkel') { const [e, hh, s] = pick([[3, 4, 5], [4, 3, 5], [5, 12, 13], [12, 5, 13], [6, 8, 10], [8, 6, 10], [8, 15, 17], [9, 12, 15], [12, 9, 15]]), cc = ri(6, 30) / 2, aa = cc + 2 * e, F = (cc + e) * hh;
      prompt = `Der Querschnitt eines Damms ist ein gleichschenkliges Trapez: unten ${gT(aa)} m breit, oben ${gT(cc)} m breit, die beiden schrägen Seiten sind je ${s} m lang. Wie groß ist die Querschnittsfläche?`;
      opts = [E(F, true, undefined, 'm²'), E(((aa + cc) / 2) * s, false, 'Die schräge Seite ist nicht die Höhe – die Höhe steht senkrecht auf den parallelen Seiten.', 'm²'), E((aa + cc) * hh, false, `In der Trapezformel fehlt der Faktor ${tex('\\tfrac{1}{2}')}.`, 'm²'), E(((aa + cc) / 2) * (s - e), false, 'Beim Satz des Pythagoras werden die Quadrate voneinander abgezogen, nicht die Längen.', 'm²')];
      hints = [`Überstand auf jeder Seite: ${tex(`(${ft(aa)}-${ft(cc)}):2=${e}`)} m.`, `Satz des Pythagoras im rechtwinkligen Dreieck aus Überstand, Höhe und schräger Seite: ${tex(`h^2=${s}^2-${e}^2=${s * s}-${e * e}=${hh * hh}`)}.`, `${tex(`h=\\sqrt{${hh * hh}}=${hh}`)} m.`, `Trapezformel: ${tex('A=\\tfrac{1}{2}\\cdot(a+c)\\cdot h')}.`];
      explain = `Höhe mit dem Satz des Pythagoras: ${tex(`h=\\sqrt{${s}^2-${e}^2}=${hh}`)} m. Fläche: ${tex(`A=\\tfrac{1}{2}\\cdot(${ft(aa)}+${ft(cc)})\\cdot ${hh}=${ft((aa + cc) / 2)}\\cdot ${hh}=${ft(F)}`)} m².`; daten = { a: aa, c: cc, s }; }
    else if (kind === 'parameter') { const k = pick([1, 3]), cc = ri(4, 24) / 2, d = ri(1, 6), hh = ri(2, 8), aa = k * cc + d, F = ((aa + cc) * hh) / 2, S2 = (k + 1) * cc + d;
      prompt = `In einem Trapez ist die Seite a um ${d} cm länger als ${k === 1 ? 'die dazu parallele Seite c' : 'das Dreifache der dazu parallelen Seite c'}. Die Höhe beträgt ${hh} cm, der Flächeninhalt ${gT(F)} cm². Wie lang ist c?`;
      opts = [E(cc, true, undefined, 'cm'), E(aa, false, 'Das ist die Seite a – gefragt ist c.', 'cm'), E(S2 - d, false, `Das ist ${k + 1}-mal die Seite c – teile noch durch ${k + 1}.`, 'cm'), E((F / hh - d) / (k + 1), false, 'Um die Formel nach a + c aufzulösen, wird der Flächeninhalt erst mit 2 malgenommen.', 'cm')];
      hints = [`Setze ${tex('c=x')}, dann ist ${tex(`a=${k === 1 ? '' : k}x+${d}`)}.`, `Trapezformel: ${tex(`\\tfrac{1}{2}\\cdot(${k === 1 ? '' : k}x+${d}+x)\\cdot ${hh}=${ft(F)}`)}.`, `Mal 2 und durch ${hh}: ${tex(`${k + 1}x+${d}=${S2}`)}.`, `${tex(`${k + 1}x=${S2 - d}`)} – dann durch ${k + 1} teilen.`];
      explain = `${tex(`\\tfrac{1}{2}\\cdot(${k + 1}x+${d})\\cdot ${hh}=${ft(F)}\\ \\Rightarrow\\ ${k + 1}x+${d}=${S2}\\ \\Rightarrow\\ ${k + 1}x=${S2 - d}\\ \\Rightarrow\\ x=${ft(cc)}`)}, also ist c ${gT(cc)} cm lang (und a ${gT(aa)} cm).`; daten = { k, d, h: hh, F }; }
    else { const fr = pick([0, 0.5]), aa = ri(20, 45) + fr, cc = ri(8, 18) + fr, hh = ri(8, 20), gd = ri(3, 8), hd = ri(2, 6), pr = pick([1.2, 1.5, 2.4, 0.8, 3.5]), T = ((aa + cc) / 2) * hh, Dd = (gd * hd) / 2, Fl = T - Dd, kosten = R(Fl * pr);
      prompt = `Ein Grundstück hat die Form eines Trapezes: Die parallelen Seiten sind ${gT(aa)} m und ${gT(cc)} m lang, ihr Abstand beträgt ${hh} m. Ein dreieckiges Beet (Grundseite ${gd} m, Höhe ${hd} m) bleibt frei, der Rest wird mit Rasen eingesät. Rasensamen kostet ${eu(pr)} € pro m². Wie teuer wird der Rasensamen?`;
      opts = [EU(kosten, true), EU(T * pr, false, 'Das Beet wird nicht eingesät – seine Fläche wird vorher abgezogen.'), EU((T - gd * hd) * pr, false, `Die Fläche des dreieckigen Beets ist ${tex('\\tfrac{1}{2}\\cdot g\\cdot h')} – es fehlt der Faktor ${tex('\\tfrac{1}{2}')}.`), EU(((aa + cc) * hh - Dd) * pr, false, `In der Trapezformel fehlt der Faktor ${tex('\\tfrac{1}{2}')}.`)];
      hints = [`Trapez: ${tex(`\\tfrac{1}{2}\\cdot(${ft(aa)}+${ft(cc)})\\cdot ${hh}=${ft(T)}`)} m².`, `Beet (Dreieck): ${tex(`\\tfrac{1}{2}\\cdot ${gd}\\cdot ${hd}=${ft(Dd)}`)} m².`, `Rasenfläche: ${tex(`${ft(T)}-${ft(Dd)}=${ft(Fl)}`)} m².`, 'Kosten = Fläche mal Preis pro Quadratmeter.'];
      explain = `Rasenfläche ${tex(`${ft(T)}-${ft(Dd)}=${ft(Fl)}`)} m², Kosten ${tex(`${ft(Fl)}\\cdot ${ft(pr)}=${euX(kosten)}`)} €.`; daten = { a: aa, c: cc, h: hh, gd, hd, pr }; }
    if (!gut(opts) || opts.some((o) => o.num <= 0)) continue;
    return fertig(prompt, undefined, opts, hints, explain, kind, daten);
  }
}

/** Prismen und Zylinder: Volumen, Mantel, Oberfläche (Zylinder als Vielfache von π) – bis zu Hohlkörpern, Füllhöhen und Massen. */
export function genPrisma(lv = 3) {
  for (;;) {
    const kind = pick(tier(lv, ['prisma'], ['rueck', 'liter'], ['dreiprisma', 'zylinder'], ['mantel', 'oberflaeche', 'trapezprisma'], ['rohr', 'fuell', 'rampe']));
    const G = ri(4, 30), h = ri(2, 12), r = ri(1, 6), P = (k, c2, w2, e) => ({ tex: `${k === 1 ? '' : ft(k)}\\pi\\,\\text{cm}^${e}`, num: k, correct: c2, why: w2 });
    let prompt, opts, hints, explain, daten;
    if (kind === 'prisma') { if ((G * h) % 3) continue; prompt = `Ein Prisma hat die Grundfläche ${G} cm² und die Höhe ${h} cm. Wie groß ist sein Volumen?`;
      opts = [E(G * h, true, undefined, 'cm³'), E((G * h) / 3, false, 'Das Drittel gilt für Pyramiden und Kegel, nicht für Prismen.', 'cm³'), E(G + h, false, 'Grundfläche und Höhe werden malgenommen.', 'cm³'), E(2 * G + h, false, 'Das hat mit der Oberfläche zu tun, nicht mit dem Volumen.', 'cm³')];
      hints = [`${tex('V=G\\cdot h')}.`, 'Die Grundfläche wird Schicht für Schicht gestapelt.']; explain = `${tex(`V=${G}\\cdot ${h}=${G * h}`)} cm³.`; daten = { G, h }; }
    else if (kind === 'dreiprisma') { const g = ri(3, 10), hd = ri(2, 8); if ((g * hd) % 2 || (g * hd * h) % 6) continue; prompt = `Ein Prisma hat als Grundfläche ein Dreieck (Grundseite ${g} cm, Höhe ${hd} cm) und ist ${h} cm hoch. Wie groß ist sein Volumen?`;
      opts = [E(((g * hd) / 2) * h, true, undefined, 'cm³'), E(g * hd * h, false, `Die Dreiecksfläche ist ${tex('\\tfrac{1}{2}\\cdot g\\cdot h')}.`, 'cm³'), E((g * hd * h) / 6, false, 'Das zusätzliche Drittel gilt nur für Pyramiden.', 'cm³'), E((g * hd) / 2 + h, false, 'Grundfläche mal Höhe, nicht plus.', 'cm³')];
      hints = ['Erst die Grundfläche (Dreieck) ausrechnen.', `${tex(`G=\\tfrac{1}{2}\\cdot ${g}\\cdot ${hd}=${(g * hd) / 2}`)} cm².`, `Dann ${tex('V=G\\cdot h')}.`]; explain = `${tex(`G=\\tfrac{1}{2}\\cdot ${g}\\cdot ${hd}=${(g * hd) / 2}`)} cm², ${tex(`V=${(g * hd) / 2}\\cdot ${h}=${((g * hd) / 2) * h}`)} cm³.`; daten = { g, hd, h }; }
    else if (kind === 'zylinder') { if (r <= 2) continue; prompt = `Ein Zylinder hat den Radius ${r} cm und die Höhe ${h} cm. Wie groß ist sein Volumen?`;
      opts = [P(r * r * h, true, undefined, 3), P(2 * r * h, false, `Das ist die Mantelfläche. Für das Volumen wird der Radius quadriert: ${tex('V=\\pi r^2h')}.`, 3), P(r * h, false, 'Der Radius wird quadriert.', 3), P(4 * r * r * h, false, 'Quadriert wird der Radius, nicht der Durchmesser.', 3)];
      hints = [`${tex('V=\\pi\\cdot r^2\\cdot h')}.`, `Grundfläche: ${tex(`\\pi\\cdot ${r}^2=${r * r}\\pi`)} cm².`, `Mal die Höhe ${h} cm.`]; explain = `${tex(`V=\\pi\\cdot ${r}^2\\cdot ${h}=\\pi\\cdot ${r * r}\\cdot ${h}=${r * r * h}\\pi`)} cm³.`; daten = { r, h }; }
    else if (kind === 'mantel') { if (r * r * h === 2 * r * h || r <= 1) continue; prompt = `Ein Zylinder hat den Radius ${r} cm und die Höhe ${h} cm. Wie groß ist seine Mantelfläche (das Etikett rundherum)?`;
      opts = [P(2 * r * h, true, undefined, 2), P(r * r * h, false, 'Das ist das Volumen.', 2), P(r * h, false, `Der Umfang des Kreises ist ${tex('2\\pi r')}.`, 2), P(2 * r * h + 2 * r * r, false, 'Das ist die ganze Oberfläche mit Boden und Deckel.', 2)];
      hints = ['Abgewickelt ist der Mantel ein Rechteck: Umfang mal Höhe.', `Umfang des Kreises: ${tex(`u=2\\pi\\cdot ${r}=${2 * r}\\pi`)} cm.`, `${tex('M=u\\cdot h=2\\pi r\\cdot h')}.`]; explain = `${tex(`M=2\\pi\\cdot ${r}\\cdot ${h}=${2 * r}\\pi\\cdot ${h}=${2 * r * h}\\pi`)} cm².`; daten = { r, h }; }
    else if (kind === 'oberflaeche') { if (r * r * h === 2 * r * r + 2 * r * h || r <= 1) continue; prompt = `Ein Zylinder hat den Radius ${r} cm und die Höhe ${h} cm. Wie groß ist seine Oberfläche (mit Boden und Deckel)?`;
      opts = [P(2 * r * r + 2 * r * h, true, undefined, 2), P(2 * r * h, false, 'Das ist nur der Mantel – Boden und Deckel fehlen.', 2), P(r * r + 2 * r * h, false, 'Es gibt zwei Kreisflächen: Boden und Deckel.', 2), P(r * r * h, false, 'Das ist das Volumen.', 2)];
      hints = [`Zwei Kreise plus Mantel: ${tex('O=2\\pi r^2+2\\pi r h')}.`, `Boden und Deckel: ${tex(`2\\cdot\\pi\\cdot ${r}^2=${2 * r * r}\\pi`)} cm².`, `Mantel: ${tex(`2\\pi\\cdot ${r}\\cdot ${h}=${2 * r * h}\\pi`)} cm².`]; explain = `${tex(`O=2\\pi\\cdot ${r}^2+2\\pi\\cdot ${r}\\cdot ${h}=${2 * r * r}\\pi+${2 * r * h}\\pi=${2 * r * r + 2 * r * h}\\pi`)} cm².`; daten = { r, h }; }
    else if (kind === 'rueck') { const V = G * h; if (V - G === h * 3) continue; prompt = `Ein Prisma hat das Volumen ${V} cm³ und die Grundfläche ${G} cm². Wie hoch ist es?`;
      opts = [E(h, true, undefined, 'cm'), E(V - G, false, 'Hier wird geteilt, nicht abgezogen.', 'cm'), E(h * 3, false, 'Der Faktor 3 gehört zur Pyramide.', 'cm'), E(h + 1, false, `Probe: ${tex(`${G}\\cdot ${h + 1}=${G * (h + 1)}`)} – das ist zu viel.`, 'cm')];
      hints = [`${tex('V=G\\cdot h')}, umgestellt: ${tex('h=V:G')}.`, `${tex(`${V}:${G}`)}.`]; explain = `${tex(`h=${V}:${G}=${h}`)} cm. Probe: ${tex(`${G}\\cdot ${h}=${V}`)}.`; daten = { V, G }; }
    else if (kind === 'liter') { const a = ri(2, 6), b = ri(2, 5), c = ri(1, 4), dm = a * b * c; if (2 * (a * b + a * c + b * c) === dm) continue; prompt = `Ein Aquarium ist ${a} dm lang, ${b} dm breit und ${c} dm hoch. Wie viele Liter Wasser passen hinein?`;
      opts = [E(dm, true, undefined, 'l'), E(dm * 10, false, 'Ein Kubikdezimeter ist genau ein Liter.', 'l'), E(a + b + c, false, 'Länge, Breite und Höhe werden malgenommen.', 'l'), E(2 * (a * b + a * c + b * c), false, 'Das ist die Oberfläche.', 'l')];
      hints = ['Volumen = Länge mal Breite mal Höhe.', `${tex(`${a}\\cdot ${b}=${a * b}`)}, dann mal ${c}.`, '1 dm³ = 1 Liter.']; explain = `${tex(`${a}\\cdot ${b}\\cdot ${c}=${a * b}\\cdot ${c}=${dm}`)} dm³ = ${dm} Liter.`; daten = { a, b, c }; }
    else if (kind === 'trapezprisma') { const a = ri(5, 12), c = ri(2, a - 1), ht = ri(2, 8), l = ri(5, 20); if (((a + c) * ht) % 2) continue; const Gt = ((a + c) * ht) / 2;
      prompt = `Ein Prisma hat als Grundfläche ein Trapez (parallele Seiten ${a} cm und ${c} cm, Höhe des Trapezes ${ht} cm). Das Prisma ist ${l} cm lang. Wie groß ist sein Volumen?`;
      opts = [E(Gt * l, true, undefined, 'cm³'), E((a + c) * ht * l, false, `In der Trapezformel fehlt der Faktor ${tex('\\tfrac{1}{2}')}.`, 'cm³'), E(a * ht * l, false, 'Beide parallelen Seiten des Trapezes gehören in die Formel.', 'cm³'), E(Gt + l, false, 'Grundfläche mal Länge, nicht plus.', 'cm³')];
      hints = [`Erst die Grundfläche (Trapez): ${tex('G=\\tfrac{1}{2}\\cdot(a+c)\\cdot h')}.`, `${tex(`G=\\tfrac{1}{2}\\cdot(${a}+${c})\\cdot ${ht}=${Gt}`)} cm².`, `Dann ${tex('V=G\\cdot l')} mit der Länge des Prismas.`]; explain = `${tex(`G=\\tfrac{1}{2}\\cdot(${a}+${c})\\cdot ${ht}=${Gt}`)} cm², ${tex(`V=${Gt}\\cdot ${l}=${Gt * l}`)} cm³.`; daten = { a, c, ht, l }; }
    else if (kind === 'rohr') { const Ra = ri(4, 12) / 2, wand = pick([0.2, 0.3, 0.4, 0.5]), ri_ = R(Ra - wand), l = ri(5, 30) * 10, [stoff, rho] = pick([['Stahl', 7.85], ['Aluminium', 2.7], ['Kupfer', 8.96]]);
      const dq = R(Ra * Ra - ri_ * ri_, 4), Gf = Math.PI * dq, V = Gf * l, mg = V * rho, K = (v, c2, w2) => AP(v / 1000, 2, c2, w2, '\\,\\text{kg}');
      prompt = `Ein ${l} cm langes Rohr aus ${stoff} hat den Außenradius ${gT(Ra)} cm und den Innenradius ${gT(ri_)} cm. 1 cm³ ${stoff} wiegt ${gT(rho)} g. Wie schwer ist das Rohr? Runde auf zwei Nachkommastellen.`;
      opts = [K(mg, true), K(Math.PI * (Ra - ri_) ** 2 * l * rho, false, `${tex('R^2-r^2')} ist nicht dasselbe wie ${tex('(R-r)^2')} – die Quadrate werden einzeln gebildet.`), K(Math.PI * Ra * Ra * l * rho, false, 'Das wäre ein massiver Stab – der Hohlraum wird abgezogen.'), K(V, false, 'Das Volumen wurde nicht mit der Dichte malgenommen.')];
      hints = [`Grundfläche ist ein Kreisring: ${tex(`G=\\pi\\cdot(${ft(Ra)}^2-${ft(ri_)}^2)=\\pi\\cdot(${ft(Ra * Ra, 4)}-${ft(ri_ * ri_, 4)})=${ft(dq, 4)}\\pi`)} cm².`, `Als Dezimalzahl: ${tex(`G\\approx ${ft(Gf, 3)}`)} cm².`, `Volumen: ${tex(`V=G\\cdot h\\approx ${ft(Gf, 3)}\\cdot ${l}\\approx ${ft(V, 1)}`)} cm³.`, `Masse: ${tex(`${ft(V, 1)}\\cdot ${ft(rho)}\\approx ${ft(mg, 0)}`)} g – und 1000 g sind 1 kg.`];
      explain = `${tex(`V=\\pi\\cdot(${ft(Ra)}^2-${ft(ri_)}^2)\\cdot ${l}\\approx ${ft(V, 1)}`)} cm³, ${tex(`m\\approx ${ft(V, 1)}\\cdot ${ft(rho)}\\approx ${ft(mg, 0)}`)} g ${tex(`\\approx ${ft(mg / 1000)}`)} kg.`; daten = { Ra, ri: ri_, l, rho }; }
    else if (kind === 'fuell') { const dcm = ri(20, 45) * 2, L = ri(4, 20) * 10, rr = dcm / 2, Gf = Math.PI * rr * rr, hh = (L * 1000) / Gf, C = (v, c2, w2) => AP(v, 1, c2, w2, '\\,\\text{cm}'); if (hh > 150) continue;
      prompt = `Eine zylinderförmige Regentonne hat innen den Durchmesser ${dcm} cm. Es werden ${L} Liter Wasser eingefüllt. Wie hoch steht das Wasser? Runde auf eine Nachkommastelle.`;
      opts = [C(hh, true), C(hh / 4, false, 'Gerechnet wird mit dem Radius – das ist der halbe Durchmesser.'), C(hh / 10, false, '1 Liter sind 1000 cm³, nicht 100 cm³.'), C((L * 1000) / (2 * Math.PI * rr), false, `Die Grundfläche ist ${tex('\\pi r^2')}, nicht der Umfang ${tex('2\\pi r')}.`)];
      hints = [`Radius: ${tex(`r=${dcm}:2=${rr}`)} cm.`, `Umrechnen: ${tex(`${L}\\,\\text{l}=${L}\\,\\text{dm}^3=${gX(L * 1000)}\\,\\text{cm}^3`)}.`, `Grundfläche: ${tex(`G=\\pi\\cdot ${rr}^2=${rr * rr}\\pi\\approx ${ft(Gf, 1)}`)} cm².`, `${tex('V=G\\cdot h')}, umgestellt: ${tex('h=V:G')}.`];
      explain = `${tex(`h=\\dfrac{V}{G}=\\dfrac{${gX(L * 1000)}}{\\pi\\cdot ${rr}^2}\\approx\\dfrac{${gX(L * 1000)}}{${ft(Gf, 1)}}\\approx ${ft(hh, 1)}`)} cm.`; daten = { dcm, L }; }
    else { const [ka, kb, kc] = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15]]), l = ri(6, 25), U = ka + kb + kc, O = ka * kb + U * l, D2 = (v, c2, w2) => E(v, c2, w2, 'dm²');
      prompt = `Eine Rampe hat die Form eines Prismas. Ihre Grundfläche ist ein rechtwinkliges Dreieck mit den Katheten ${ka} dm und ${kb} dm, die Rampe ist ${l} dm breit. Wie groß ist ihre gesamte Oberfläche?`;
      opts = [D2(O, true), D2((ka * kb) / 2 + U * l, false, 'Es gibt zwei dreieckige Seitenflächen, nicht nur eine.'), D2(ka * kb + (ka + kb) * l, false, 'Die schräge Fläche fehlt: Ihre Kante ist die Hypotenuse des Dreiecks.'), D2(((ka * kb) / 2) * l, false, 'Das ist das Volumen, nicht die Oberfläche.')];
      hints = [`Dritte Dreiecksseite mit dem Satz des Pythagoras: ${tex(`c=\\sqrt{${ka}^2+${kb}^2}=\\sqrt{${kc * kc}}=${kc}`)} dm.`, `Zwei Dreiecke: ${tex(`2\\cdot\\tfrac{1}{2}\\cdot ${ka}\\cdot ${kb}=${ka * kb}`)} dm².`, `Mantel = Umfang des Dreiecks mal Breite: ${tex(`(${ka}+${kb}+${kc})\\cdot ${l}=${U}\\cdot ${l}=${U * l}`)} dm².`, 'Oberfläche = zwei Dreiecke plus Mantel.'];
      explain = `Satz des Pythagoras: ${tex(`c=\\sqrt{${ka * ka}+${kb * kb}}=${kc}`)} dm. ${tex(`O=2\\cdot\\tfrac{1}{2}\\cdot ${ka}\\cdot ${kb}+(${ka}+${kb}+${kc})\\cdot ${l}=${ka * kb}+${U * l}=${O}`)} dm².`; daten = { ka, kb, l }; }
    if (!gut(opts) || opts.some((o) => o.num <= 0)) continue;
    return fertig(prompt, undefined, opts, hints, explain, kind, daten);
  }
}

/* ───────────── Klasse 10 ───────────── */

/** Exponentialfunktionen: Werte, Wachstumsfaktor, Startwert, Zinseszins, Funktion aus zwei Punkten, Exponentialgleichungen. */
export function genExpFunktion(lv = 3) {
  for (;;) {
    const kind = pick(tier(lv, ['start', 'faktor'], ['wert', 'prozent'], ['term', 'art', 'halb'], ['zweipunkte', 'zins'], ['wachszeit', 'zerfall', 'dreipunkt']));
    const a = pick(lv <= 1 ? [2, 3, 5, 10] : [2, 3, 5, 10, 20, 50, 100]), b = pick(tier(lv, [2, 3], [2, 3, 4, 1.5], [2, 3, 1.5], [1.5, 0.5, 2], [0.5, 1.5, 1.2])), n = ri(2, lv <= 1 ? 3 : 4);
    let prompt, formula, opts, hints, explain, daten;
    if (kind === 'wert') { prompt = `Berechne ${tex(`f(${n})`)}.`; formula = `f(x)=${a}\\cdot ${ft(b)}^x`; const v = a * b ** n; if (!Number.isInteger(v * 100)) continue;
      opts = [N(v, true), N(a * b * n, false, `Die Hochzahl bedeutet mehrfach malnehmen, nicht mal ${n}.`), N((a * b) ** n, false, 'Potenziert wird nur die Basis – der Startwert kommt danach als Faktor.'), N(a + b ** n, false, 'Der Startwert wird malgenommen, nicht addiert.')];
      hints = ['Erst die Potenz, dann mal den Startwert.', `${tex(`${ft(b)}^${n}=${Array(n).fill(ft(b)).join('\\cdot ')}=${ft(b ** n, 4)}`)}.`]; explain = `${tex(`f(${n})=${a}\\cdot ${ft(b)}^${n}=${a}\\cdot ${ft(b ** n, 4)}=${ft(v)}`)}.`; daten = { a, b, n }; }
    else if (kind === 'faktor') { const y1 = a * b, y2 = a * b * b; if (y1 - a === b || a === b) continue; prompt = `Eine Größe wächst exponentiell. Sie hat nacheinander die Werte ${fmt(a)}, ${fmt(y1)}, ${fmt(y2)}. Wie groß ist der Wachstumsfaktor?`;
      opts = [N(b, true), N(y1 - a, false, 'Bei exponentiellem Wachstum bleibt der <b>Quotient</b> gleich, nicht der Unterschied.'), N(a, false, 'Das ist der Startwert.'), N(1 / b, false, 'Geteilt wird der neue Wert durch den alten.', Number.isInteger(b) ? br(1, b) : Number.isInteger(1 / b) ? `${1 / b}` : br(2, 2 * b))];
      hints = ['Teile einen Wert durch den vorherigen.', `${tex(`${ft(y1)}:${ft(a)}`)} – und zur Kontrolle ${tex(`${ft(y2)}:${ft(y1)}`)}.`]; explain = `${tex(`${ft(y1)}:${ft(a)}=${ft(b)}`)} und ${tex(`${ft(y2)}:${ft(y1)}=${ft(b)}`)}: Der Wachstumsfaktor ist ${tex(ft(b))}.`; daten = { a, y1, y2 }; }
    else if (kind === 'start') { if (a === b) continue; prompt = 'Wie groß ist der Startwert (für x = 0)?'; formula = `f(x)=${a}\\cdot ${ft(b)}^x`;
      opts = [N(a, true), N(b, false, 'Das ist der Wachstumsfaktor.'), N(a * b, false, `Das ist der Wert für x = 1. Für x = 0 gilt ${tex(`${ft(b)}^0=1`)}.`), N(0, false, `${tex(`${ft(b)}^0=1`)}, nicht 0.`)];
      hints = [`${tex('b^0=1')}.`, `${tex(`f(0)=${a}\\cdot 1`)}.`]; explain = `${tex(`f(0)=${a}\\cdot ${ft(b)}^0=${a}`)}.`; daten = { a, b }; }
    else if (kind === 'prozent') { const p = pick([5, 10, 20, 25, 50]), ab = rand() < 0.5, q = ab ? 1 - p / 100 : 1 + p / 100; prompt = `Ein Bestand ${ab ? `nimmt jedes Jahr um ${p} % ab` : `wächst jedes Jahr um ${p} %`}. Mit welchem Faktor wird er jedes Jahr malgenommen?`;
      opts = [N(q, true), N(ab ? 1 + p / 100 : 1 - p / 100, false, ab ? 'Bei Abnahme ist der Faktor kleiner als 1.' : 'Bei Wachstum ist der Faktor größer als 1.'), N(p / 100, false, 'Das ist nur die Änderung – der bisherige Bestand (100 %) gehört dazu.'), N(p, false, 'Der Faktor ist eine Zahl nahe 1, nicht die Prozentzahl.')];
      hints = ['Der Bestand selbst sind 100 %.', ab ? `${tex(`100\\,\\%-${p}\\,\\%=${100 - p}\\,\\%`)} – als Dezimalzahl schreiben.` : `${tex(`100\\,\\%+${p}\\,\\%=${100 + p}\\,\\%`)} – als Dezimalzahl schreiben.`]; explain = `${tex(`100\\,\\%${ab ? '-' : '+'}${p}\\,\\%=${ab ? 100 - p : 100 + p}\\,\\%=${br(ab ? 100 - p : 100 + p, 100)}=${ft(q)}`)}.`; daten = { p, ab }; }
    else if (kind === 'term') { const p = pick([10, 20, 25, 50]), ab = rand() < 0.4, q = ab ? 1 - p / 100 : 1 + p / 100, s = a * 10; prompt = `Am Anfang sind es ${s}. Jede Stunde ${ab ? `werden es ${p} % weniger` : `kommen ${p} % dazu`}. Welcher Term beschreibt den Bestand nach x Stunden?`;
      const T = (t, c2, w2) => ({ tex: t, correct: c2, why: w2 });
      opts = [T(`${s}\\cdot ${ft(q)}^x`, true), T(`${s}${ab ? '-' : '+'}${ft((s * p) / 100)}x`, false, 'Das wäre lineares Wachstum: jedes Mal derselbe Betrag. Prozentual heißt: jedes Mal derselbe Faktor.'), T(`${s}\\cdot ${ft(p / 100)}^x`, false, 'Der Faktor ist 1 plus oder minus die Änderung, nicht nur die Änderung.'), T(`${ft(q)}\\cdot ${s}^x`, false, 'Startwert und Faktor sind vertauscht.')];
      hints = ['Prozentuale Änderung heißt: immer mit demselben Faktor malnehmen.', `Faktor: ${tex(`1${ab ? '-' : '+'}${ft(p / 100)}=${ft(q)}`)}.`, 'Der Startwert steht als Faktor vor der Potenz.']; explain = `Startwert ${s}, Faktor ${tex(`1${ab ? '-' : '+'}${ft(p / 100)}=${ft(q)}`)}: ${tex(`f(x)=${s}\\cdot ${ft(q)}^x`)}.`;
      if (!uniq(opts)) continue; return fertig(prompt, undefined, opts, hints, explain, kind, { s, p, ab }); }
    else if (kind === 'art') { const lin = rand() < 0.5, d = ri(2, 9), w = lin ? [a, a + d, a + 2 * d, a + 3 * d] : [a, a * 2, a * 4, a * 8]; prompt = `Die Werte ${w.join(', ')} entstehen in gleichen Zeitschritten. Was für ein Wachstum ist das?`;
      const T = (t, key, w2) => ({ tex: `\\text{${t}}`, correct: key === (lin ? 'l' : 'e'), why: w2 });
      opts = [T('linear', 'l', 'Linear hieße: immer derselbe Betrag kommt dazu. Hier wächst der Zuwachs.'), T('exponentiell', 'e', 'Exponentiell hieße: immer mit demselben Faktor malnehmen. Hier kommt immer derselbe Betrag dazu.'), T('quadratisch', 'q', 'Prüfe die Unterschiede und die Quotienten der Werte.'), T('gar kein regelmäßiges', 'k', 'Doch: Prüfe die Unterschiede und die Quotienten.')];
      hints = [`Unterschiede aufeinanderfolgender Werte: ${tex(`${w[1]}-${w[0]}=${w[1] - w[0]}`)}, ${tex(`${w[2]}-${w[1]}=${w[2] - w[1]}`)}, ${tex(`${w[3]}-${w[2]}=${w[3] - w[2]}`)}.`, `Quotienten: ${tex(`${w[1]}:${w[0]}=${ft(w[1] / w[0])}`)}, ${tex(`${w[2]}:${w[1]}=${ft(w[2] / w[1])}`)}.`]; explain = lin ? `Es kommt immer ${d} dazu (gleiche Unterschiede): linear.` : 'Jeder Wert ist das Doppelte des vorherigen (gleiche Quotienten): exponentiell.';
      return fertig(prompt, undefined, opts, hints, explain, kind, { w }); }
    else if (kind === 'halb') { const T2 = pick([2, 3, 5, 8]), k = ri(2, 4), s = pick([80, 160, 400, 800]); if (s / (2 * k) === s / 2 ** k || s / (2 * k) === s / 2 ** (k + 1)) continue; prompt = `Ein Stoff zerfällt mit einer Halbwertszeit von ${T2} Tagen. Am Anfang sind ${s} mg vorhanden. Wie viel ist nach ${T2 * k} Tagen noch da?`;
      opts = [E(s / 2 ** k, true, undefined, 'mg'), E(s / (2 * k), false, 'Es wird nicht durch 2 mal Anzahl geteilt, sondern mehrmals nacheinander halbiert.', 'mg'), E(s / 2, false, 'Das gilt nach einer einzigen Halbwertszeit.', 'mg'), E(s / 2 ** (k + 1), false, 'Einmal zu oft halbiert.', 'mg')];
      hints = [`${tex(`${T2 * k}:${T2}=${k}`)}: Es vergehen ${k} Halbwertszeiten.`, `Halbiere ${k}-mal nacheinander: ${Array.from({ length: k + 1 }, (_, i) => fmt(s / 2 ** i)).join(' → ')}.`]; explain = `${tex(`${s}\\cdot\\left(\\tfrac{1}{2}\\right)^${k}=${s}\\cdot ${br(1, 2 ** k)}=${ft(s / 2 ** k)}`)} mg.`; daten = { T2, k, s }; }
    else if (kind === 'zweipunkte') { const aa = pick([2, 4, 8, 16, 40, 80]), y1 = aa * b, y3 = aa * b ** 3; if (aa === b) continue;
      prompt = `Die Exponentialfunktion ${tex('f(x)=a\\cdot b^x')} mit ${tex('b>0')} erfüllt die beiden Bedingungen. Wie groß ist der Startwert a?`; formula = `f(1)=${ft(y1, 4)},\\quad f(3)=${ft(y3, 4)}`;
      opts = [N(aa, true), N(b, false, 'Das ist der Wachstumsfaktor b – gefragt ist der Startwert a.'), N(R(y1 / (b * b), 4), false, `${tex('\\dfrac{f(3)}{f(1)}')} ist ${tex('b^2')}, nicht b – erst die Wurzel ziehen.`), N(R(y1 - (y3 - y1) / 2, 4), false, 'Das wäre lineares Wachstum mit gleichen Unterschieden. Hier bleiben die Quotienten gleich.')];
      hints = [`Teile die beiden Gleichungen durcheinander: ${tex('\\dfrac{f(3)}{f(1)}=\\dfrac{a\\cdot b^3}{a\\cdot b}=b^2')}.`, `${tex(`b^2=${ft(y3, 4)}:${ft(y1, 4)}=${ft(b * b, 4)}`)}, also ${tex(`b=\\sqrt{${ft(b * b, 4)}}=${ft(b)}`)}.`, `Aus ${tex('f(1)=a\\cdot b')} folgt ${tex(`a=${ft(y1, 4)}:${ft(b)}`)}.`];
      explain = `${tex(`b^2=\\dfrac{${ft(y3, 4)}}{${ft(y1, 4)}}=${ft(b * b, 4)}\\ \\Rightarrow\\ b=${ft(b)}`)}, dann ${tex(`a=\\dfrac{f(1)}{b}=\\dfrac{${ft(y1, 4)}}{${ft(b)}}=${aa}`)}.`; daten = { y1, y3 }; }
    else if (kind === 'zins') { const K0 = pick([500, 800, 1200, 1500, 2000, 2500]), p = pick([2, 3, 4, 5, 1.5, 2.5]), q = 1 + p / 100, jahre = ri(2, 4), v = K0 * q ** jahre;
      prompt = `Ein Guthaben von ${K0} € wird jedes Jahr mit ${gT(p)} % verzinst; die Zinsen bleiben auf dem Konto (Zinseszins). Wie hoch ist das Guthaben nach ${jahre} Jahren? Runde auf Cent.`;
      opts = [EU(v, true), EU(K0 * (1 + (jahre * p) / 100), false, 'Das wäre lineares Wachstum: Jedes Jahr dieselben Zinsen. Beim Zinseszins werden auch die Zinsen verzinst.'), EU(K0 * q ** (jahre - 1), false, 'Ein Jahr zu wenig: Die Hochzahl ist die Anzahl der Jahre.'), EU(K0 * q ** (jahre + 1), false, 'Ein Jahr zu viel: Die Hochzahl ist die Anzahl der Jahre.')];
      hints = [`Wachstumsfaktor: ${tex(`q=1+${ft(p / 100, 3)}=${ft(q, 3)}`)}.`, `Jedes Jahr wird mit q malgenommen: ${tex('K_n=K_0\\cdot q^n')}.`, `${tex(`${ft(q, 3)}^${jahre}\\approx ${ft(q ** jahre, 5)}`)}.`];
      explain = `${tex(`K_${jahre}=${K0}\\cdot ${ft(q, 3)}^${jahre}\\approx ${K0}\\cdot ${ft(q ** jahre, 5)}\\approx ${euX(v)}`)} €.`; daten = { K0, p, jahre }; }
    else if (kind === 'wachszeit') { const p = pick([4, 6, 7, 9, 12, 15, 18, 22, 35]), k = pick([2, 2, 3, 5, 10]), q = 1 + p / 100, t = Math.log(k) / Math.log(q), wort = { 2: 'verdoppelt', 3: 'verdreifacht', 5: 'verfünffacht', 10: 'verzehnfacht' }[k], H = (v, c2, w2) => AP(v, 1, c2, w2, '\\,\\text{h}');
      prompt = `Eine Bakterienkultur wächst jede Stunde um ${p} %. Nach welcher Zeit hat sie sich ${wort}? Runde auf eine Nachkommastelle.`;
      opts = [H(t, true), H((100 * (k - 1)) / p, false, `Das wäre lineares Wachstum: jede Stunde ${p} % des Anfangswerts. Tatsächlich wird der Zuwachs von Stunde zu Stunde größer.`), H(Math.log(q) / Math.log(k), false, 'Zähler und Nenner sind vertauscht: Im Zähler steht der Logarithmus des Zielfaktors.'), H(k / q, false, 'Die Hochzahl bekommt man nicht durch Teilen, sondern mit dem Logarithmus.')];
      hints = [`Wachstumsfaktor pro Stunde: ${tex(`q=1+${ft(p / 100)}=${ft(q)}`)}.`, `Ansatz: ${tex(`${ft(q)}^t=${k}`)}.`, `Logarithmieren auf beiden Seiten: ${tex(`t\\cdot\\ln ${ft(q)}=\\ln ${k}`)}.`, `Auflösen: ${tex(`t=\\dfrac{\\ln ${k}}{\\ln ${ft(q)}}`)}.`];
      explain = `${tex(`${ft(q)}^t=${k}\\ \\Rightarrow\\ t=\\dfrac{\\ln ${k}}{\\ln ${ft(q)}}\\approx\\dfrac{${ft(Math.log(k), 4)}}{${ft(Math.log(q), 4)}}\\approx ${ft(t, 1)}`)} Stunden (Logarithmus). Probe: ${tex(`${ft(q)}^{${ft(t, 1)}}\\approx ${ft(q ** R(t, 1), 2)}`)}.`; daten = { p, k }; }
    else if (kind === 'zerfall') { const T2 = pick([8, 12, 28, 30, 5.3, 14]), x = pick([10, 20, 30, 40, 5, 15, 60]), t = (T2 * Math.log(x / 100)) / Math.log(0.5), J = (v, c2, w2) => AP(v, 1, c2, w2, '\\,\\text{Jahre}');
      prompt = `Ein radioaktiver Stoff hat eine Halbwertszeit von ${gT(T2)} Jahren. Nach welcher Zeit sind nur noch ${x} % der Anfangsmenge vorhanden? Runde auf eine Nachkommastelle.`;
      opts = [J(t, true), J((T2 * (100 - x)) / 50, false, `Das wäre linearer Zerfall: in ${gT(T2)} Jahren immer dieselbe Menge. Tatsächlich zerfällt immer derselbe Anteil.`), J((T2 * Math.log(0.5)) / Math.log(x / 100), false, 'Zähler und Nenner sind vertauscht: Im Nenner steht der Logarithmus von 0,5.'), J((T2 * x) / 50, false, 'Prozentsatz und Zeit sind nicht proportional – der Ansatz ist eine Exponentialgleichung.')];
      hints = [`Nach t Jahren ist noch der Anteil ${tex(`0{,}5^{\\,t/${ft(T2)}}`)} vorhanden.`, `Ansatz: ${tex(`0{,}5^{\\,t/${ft(T2)}}=${ft(x / 100)}`)}.`, `Logarithmieren auf beiden Seiten: ${tex(`\\dfrac{t}{${ft(T2)}}\\cdot\\ln 0{,}5=\\ln ${ft(x / 100)}`)}.`, `Auflösen: ${tex(`t=${ft(T2)}\\cdot\\dfrac{\\ln ${ft(x / 100)}}{\\ln 0{,}5}`)}.`];
      explain = `${tex(`0{,}5^{\\,t/${ft(T2)}}=${ft(x / 100)}\\ \\Rightarrow\\ t=${ft(T2)}\\cdot\\dfrac{\\ln ${ft(x / 100)}}{\\ln 0{,}5}\\approx ${ft(T2)}\\cdot\\dfrac{${ft(Math.log(x / 100), 4)}}{${ft(Math.log(0.5), 4)}}\\approx ${ft(t, 1)}`)} Jahre (Logarithmus).`; daten = { T2, x }; }
    else { const [bb, as] = pick([[1.2, [250, 1250]], [0.8, [250, 1250]], [1.5, [32, 64, 160]], [0.5, [320, 640, 960]]]), aa = pick(as), y2 = R(aa * bb ** 2, 4), y5 = R(aa * bb ** 5, 4), b3 = R(bb ** 3, 4);
      prompt = `Die Exponentialfunktion ${tex('f(x)=a\\cdot b^x')} mit ${tex('b>0')} erfüllt die beiden Bedingungen. Wie groß ist der Startwert a?`; formula = `f(2)=${ft(y2, 4)},\\quad f(5)=${ft(y5, 4)}`;
      opts = [N(aa, true), N(R(y2 / bb, 2), false, `Geteilt wird durch ${tex('b^2')}, denn ${tex('f(2)=a\\cdot b^2')}.`), N(R(y2 - (2 * (y5 - y2)) / 3, 2), false, 'Das wäre lineares Wachstum mit gleichen Unterschieden. Hier bleiben die Quotienten gleich.'), N(R(y2 / b3, 2), false, `${tex('\\dfrac{f(5)}{f(2)}')} ist ${tex('b^3')}, nicht b – erst die dritte Wurzel ziehen.`)];
      hints = [`Teile die beiden Gleichungen durcheinander: ${tex('\\dfrac{f(5)}{f(2)}=\\dfrac{a\\cdot b^5}{a\\cdot b^2}=b^3')}.`, `${tex(`b^3=${ft(y5, 4)}:${ft(y2, 4)}=${ft(b3, 4)}`)}, also ${tex(`b=\\sqrt[3]{${ft(b3, 4)}}=${ft(bb)}`)}.`, `Aus ${tex('f(2)=a\\cdot b^2')} folgt ${tex(`a=${ft(y2, 4)}:${ft(bb)}^2=${ft(y2, 4)}:${ft(bb * bb, 4)}`)}.`];
      explain = `${tex(`b^3=\\dfrac{${ft(y5, 4)}}{${ft(y2, 4)}}=${ft(b3, 4)}\\ \\Rightarrow\\ b=${ft(bb)}`)}, dann ${tex(`a=\\dfrac{f(2)}{b^2}=\\dfrac{${ft(y2, 4)}}{${ft(bb * bb, 4)}}=${aa}`)}.`; daten = { y2, y5 }; }
    if (!gut(opts)) continue;
    return fertig(prompt, formula, opts, hints, explain, kind, daten);
  }
}

const SINUS = { 30: 0.5, 90: 1, 150: 0.5, 210: -0.5, 270: -1, 330: -0.5 };
/** Sinusfunktion: Amplitude, Periode, Verschiebung, Werte, Funktionsterm, trigonometrische Gleichungen und Anwendungen. */
export function genSinusFkt(lv = 3) {
  for (;;) {
    const kind = pick(tier(lv, ['amplitude'], ['amplitude', 'wert', 'mittel'], ['periode', 'bereich', 'max'], ['periodegrad', 'wertb', 'term'], ['gleichung', 'riesenrad', 'kennwerte']));
    const a = pick(lv <= 1 ? [3, 4, 5, 6] : [2, 3, 4, 5, 1.5, 2.5]), b = pick([2, 4, 0.5, 3]), d = ri(1, 5);
    let prompt, formula, opts, hints, explain, daten;
    if (kind === 'amplitude' && lv <= 1) { prompt = 'Wie groß ist die Amplitude?'; formula = `f(x)=${ft(a)}\\cdot\\sin(x)`;
      opts = [N(a, true), N(2 * a, false, 'Das ist der Abstand vom tiefsten zum höchsten Punkt. Die Amplitude ist die Hälfte davon.'), N(1, false, 'Das wäre die Amplitude von sin(x) ohne Faktor.'), N(a / 2, false, 'Die Amplitude ist der ganze Faktor vor dem Sinus, nicht die Hälfte.')];
      hints = ['Die Amplitude ist der größte Ausschlag von der Mittellinie.', 'Sie steht als Faktor vor dem Sinus.']; explain = `Amplitude ${tex(ft(a))}.`; daten = { a, b: 1 }; }
    else if (kind === 'amplitude') { if (a === b || 2 * a === b) continue; prompt = 'Wie groß ist die Amplitude?'; formula = `f(x)=${ft(a)}\\cdot\\sin(${ft(b)}x)`;
      opts = [N(a, true), N(b, false, 'Die Zahl vor dem x ändert die Periode, nicht die Amplitude.'), N(2 * a, false, 'Das ist der Abstand vom tiefsten zum höchsten Punkt. Die Amplitude ist die Hälfte davon.'), N(1, false, 'Das wäre die Amplitude von sin(x) ohne Faktor.')];
      hints = ['Die Amplitude ist der größte Ausschlag von der Mittellinie.', 'Sie steht als Faktor vor dem Sinus – die Zahl vor dem x gehört nicht dazu.']; explain = `Amplitude ${tex(ft(a))}: Die Werte schwanken zwischen ${tex(ft(-a))} und ${tex(ft(a))}.`; daten = { a, b }; }
    else if (kind === 'wert') { const [w, s] = pick([[30, 0.5], [90, 1], [150, 0.5], [270, -1], [210, -0.5]]); prompt = `Berechne den Funktionswert für x = ${w}°.`; formula = `f(x)=${ft(a)}\\cdot\\sin(x)`;
      opts = [N(a * s, true), N(-a * s, false, 'Achte auf das Vorzeichen: Zwischen 180° und 360° ist der Sinus negativ, davor positiv.'), Math.abs(s) === 1 ? N(a * s + (s > 0 ? a : -a), false, 'Der Faktor wird malgenommen, nicht addiert.') : N(s > 0 ? a : -a, false, `Der Sinus von ${w}° ist nicht ${s > 0 ? '1' : '−1'}.`), N(s, false, 'Der Faktor vor dem Sinus fehlt.')];
      hints = [`${tex(`\\sin ${w}^\\circ=${ft(s)}`)}.`, `Mal ${tex(ft(a))}.`]; explain = `${tex(`f(${w}^\\circ)=${ft(a)}\\cdot\\sin ${w}^\\circ=${ft(a)}\\cdot ${kl(s)}=${ft(a * s)}`)}.`; daten = { a, w }; }
    else if (kind === 'periode' || kind === 'periodegrad') { const grad = kind === 'periodegrad'; if (!grad && b === 3) continue; prompt = grad ? 'Wie lang ist eine Periode (in Grad)?' : `Wie lang ist eine Periode? (Antwort als Vielfaches von ${tex('\\pi')})`; formula = `f(x)=${ft(a)}\\cdot\\sin(${ft(b)}x)${grad ? `+${d}` : ''}`;
      const P = (k, c2, w2) => (grad ? E(k * 180, c2, w2, '°') : { tex: `${k === 1 ? '' : ft(k)}\\pi`, num: k, correct: c2, why: w2 });
      opts = [P(2 / b, true), P(2 * b, false, 'Ein größerer Faktor vor x staucht die Kurve: Die Periode wird kürzer, nicht länger.'), P(2, false, 'Das ist die Periode von sin(x) ohne Faktor.'), grad ? E(360 / a, false, 'Hier wurde durch die Amplitude geteilt – die Periode hängt nur vom Faktor vor x ab.', '°') : { tex: `${4 / gcd(4, 2 * a) === 1 && 2 * a / gcd(4, 2 * a) === 1 ? '' : 2 * a / gcd(4, 2 * a) === 1 ? 4 / gcd(4, 2 * a) : br(4 / gcd(4, 2 * a), 2 * a / gcd(4, 2 * a))}\\pi`, num: 2 / a, correct: false, why: 'Hier wurde durch die Amplitude geteilt – die Periode hängt nur vom Faktor vor x ab.' }];
      hints = grad ? [`Die Periode von ${tex('\\sin(bx)')} ist ${tex('\\dfrac{360^\\circ}{b}')} – Amplitude und Verschiebung ändern daran nichts.`, `Hier ist ${tex(`b=${ft(b)}`)}.`, `${tex(`360^\\circ:${ft(b)}`)}.`] : [`Die Periode von ${tex('\\sin(bx)')} ist ${tex('\\dfrac{2\\pi}{b}')}.`, `Hier ist ${tex(`b=${ft(b)}`)}: ${tex(`2\\pi:${ft(b)}`)}.`];
      explain = grad ? `${tex(`p=\\dfrac{360^\\circ}{b}=\\dfrac{360^\\circ}{${ft(b)}}=${ft(360 / b)}^\\circ`)}.` : `${tex(`p=\\dfrac{2\\pi}{b}=\\dfrac{2\\pi}{${ft(b)}}=${2 / b === 1 ? '' : ft(2 / b)}\\pi`)}.`; daten = { b, grad }; }
    else if (kind === 'bereich' || kind === 'max') { const mx = kind === 'max'; if (a === d) continue; prompt = mx ? 'Wie groß ist der größte Funktionswert?' : 'Wie groß ist der kleinste Funktionswert?'; formula = `f(x)=${ft(a)}\\cdot\\sin(x)+${d}`;
      opts = mx ? [N(a + d, true), N(a, false, 'Die Kurve ist um d nach oben verschoben.'), N(d, false, 'Das ist die Mittellinie.'), N(d - a, false, 'Das ist der kleinste Wert.')] : [N(d - a, true), N(-a, false, 'Die Kurve ist um d nach oben verschoben.'), N(d, false, 'Das ist die Mittellinie.'), N(a + d, false, 'Das ist der größte Wert.')];
      hints = [`Der Sinus schwankt zwischen −1 und 1, also ${tex(`${ft(a)}\\cdot\\sin(x)`)} zwischen ${tex(ft(-a))} und ${tex(ft(a))}.`, `Dann wird alles um ${d} nach oben verschoben.`]; explain = `${tex(mx ? `${ft(a)}\\cdot 1+${d}=${ft(a + d)}` : `${ft(a)}\\cdot(-1)+${d}=${ft(-a)}+${d}=${ft(d - a)}`)}.`; daten = { a, d, mx }; }
    else if (kind === 'mittel') { const lo = ri(1, 6), hi = lo + 2 * ri(1, 4); if ((lo + hi) / 2 === hi - lo) continue; prompt = `Eine Sinuskurve schwankt zwischen dem kleinsten Wert ${lo} und dem größten Wert ${hi}. Wo liegt ihre Mittellinie?`;
      opts = [N((lo + hi) / 2, true), N((hi - lo) / 2, false, 'Das ist die Amplitude.'), N(hi - lo, false, 'Das ist der ganze Abstand zwischen tiefstem und höchstem Punkt.'), N(lo + hi, false, 'Die Summe wird noch halbiert.')];
      hints = ['Die Mittellinie liegt genau zwischen dem kleinsten und dem größten Wert.', `${tex(`\\dfrac{${lo}+${hi}}{2}`)}.`]; explain = `${tex(`y=\\dfrac{${lo}+${hi}}{2}=${(lo + hi) / 2}`)}. Die Amplitude ist ${(hi - lo) / 2}.`; daten = { lo, hi }; }
    else if (kind === 'wertb') { const bb = pick([2, 3]), ang = pick([30, 90, 150, 210, 270, 330].filter((w) => Number.isInteger(w / bb))), s = SINUS[ang], x0 = ang / bb, val = a * s + d;
      prompt = `Berechne den Funktionswert für x = ${x0}°.`; formula = `f(x)=${ft(a)}\\cdot\\sin(${bb}x)+${d}`;
      opts = [N(val, true), N(R(a * s * bb + d), false, 'Der Faktor vor x gehört zum Winkel: Er wird mit x malgenommen, nicht mit dem Sinuswert.'), N(R(-a * s + d), false, 'Achte auf das Vorzeichen: Zwischen 180° und 360° ist der Sinus negativ, davor positiv.'), N(a * s, false, `Die Verschiebung um ${d} fehlt.`)];
      hints = [`Erst der Winkel: ${tex(`${bb}\\cdot ${x0}^\\circ=${ang}^\\circ`)}.`, `${tex(`\\sin ${ang}^\\circ=${ft(s)}`)}.`, `Dann mal ${tex(ft(a))} und plus ${d}.`]; explain = `${tex(`f(${x0}^\\circ)=${ft(a)}\\cdot\\sin ${ang}^\\circ+${d}=${ft(a)}\\cdot ${kl(s)}+${d}=${ft(val)}`)}.`; daten = { a, bb, d, x0 }; }
    else if (kind === 'term') { const amp = pick([1.5, 2, 2.5, 3, 4]), dd = pick([-3, -2, -1, 1, 2, 3, 4, 5]), bb = pick([2, 4, 0.5]), lo = dd - amp, hi = dd + amp, Pt = { 2: '\\pi', 4: '\\dfrac{\\pi}{2}', 0.5: '4\\pi' }[bb]; if (Math.abs(dd) === amp) continue;
      const T = (i, A, Bc, D, c2, w2) => N(i, c2, w2, `${ft(A)}\\sin(${Bc === 1 ? '' : ft(Bc)}x)${pmf(D)}`);
      prompt = `Eine Sinuskurve schwankt zwischen dem kleinsten Wert ${gT(lo)} und dem größten Wert ${gT(hi)}. Ihre Periode ist ${tex(Pt)}. Welcher Funktionsterm passt?`;
      opts = [T(1, amp, bb, dd, true), T(2, dd, bb, amp, false, 'Amplitude und Mittellinie sind vertauscht: Die Amplitude ist der halbe Abstand zwischen kleinstem und größtem Wert.'), T(3, 2 * amp, bb, dd, false, 'Die Amplitude ist nur der halbe Abstand zwischen kleinstem und größtem Wert.'), T(4, amp, 2 / bb, dd, false, `Der Faktor vor x ist ${tex('\\dfrac{2\\pi}{p}')} – nicht die Periode selbst.`)];
      hints = [`Amplitude: ${tex(`a=\\dfrac{${ft(hi)}-${kl(lo)}}{2}=${ft(amp)}`)}.`, `Mittellinie: ${tex(`d=\\dfrac{${ft(hi)}+${kl(lo)}}{2}=${ft(dd)}`)}.`, `Faktor vor x: ${tex(`b=\\dfrac{2\\pi}{p}=2\\pi:${Pt}=${ft(bb)}`)}.`]; explain = `Amplitude ${tex(ft(amp))}, Mittellinie ${tex(`y=${ft(dd)}`)}, ${tex(`b=${ft(bb)}`)}: ${tex(`f(x)=${ft(amp)}\\sin(${ft(bb)}x)${pmf(dd)}`)}.`; daten = { lo, hi, bb }; }
    else if (kind === 'gleichung') { const aa = pick([2, 3, 4, 5, 2.5]), s = pick([0.2, 0.3, 0.4, 0.6, 0.7, 0.8, 0.9, 0.25, 0.75, 0.35]), cc = R(d + aa * s, 3), x1 = (Math.asin(s) * 180) / Math.PI, x1r = R(x1, 1), W = (v, c2, w2) => AP(v, 1, c2, w2, '^\\circ');
      prompt = 'Die Gleichung hat im Bereich von 0° bis 360° zwei Lösungen. Wie groß ist die <b>größere</b>? Runde auf eine Nachkommastelle.'; formula = `${ft(aa)}\\cdot\\sin(x)+${d}=${ft(cc, 3)}`;
      opts = [W(180 - x1r, true), W(x1r, false, 'Das ist die kleinere der beiden Lösungen.'), W(360 - x1r, false, `Beim Sinus liegt die zweite Lösung bei ${tex('180^\\circ-x_1')}. Die Regel ${tex('360^\\circ-x_1')} gilt beim Kosinus.`), W(180 + x1r, false, 'Zwischen 180° und 360° ist der Sinus negativ – dort kann keine Lösung liegen.')];
      hints = [`${tex(`\\mid -${d}`)}: ${tex(`${ft(aa)}\\cdot\\sin(x)=${ft(cc - d, 3)}`)}.`, `${tex(`\\mid :${ft(aa)}`)}: ${tex(`\\sin(x)=${ft(s)}`)}.`, `Erste Lösung mit dem Taschenrechner: ${tex(`x_1=\\sin^{-1}(${ft(s)})\\approx ${ft(x1r, 1)}^\\circ`)}.`, `Zweite Lösung über die Symmetrie der Sinuskurve: ${tex('x_2=180^\\circ-x_1')}.`];
      explain = `${tex(`\\sin(x)=\\dfrac{${ft(cc, 3)}-${d}}{${ft(aa)}}=${ft(s)}`)}, also ${tex(`x_1\\approx ${ft(x1r, 1)}^\\circ`)} und ${tex(`x_2\\approx 180^\\circ-${ft(x1r, 1)}^\\circ=${ft(180 - x1r, 1)}^\\circ`)}.`; daten = { aa, d, cc }; }
    else if (kind === 'riesenrad') { const T = pick([40, 45, 60, 72, 90, 120]), k = 360 / T, rr = ri(8, 30), m0 = rr + ri(2, 5), H = m0 + ri(1, rr - 1), s = (H - m0) / rr, x1 = (Math.asin(s) * 180) / Math.PI, t1 = x1 / k, t2 = (180 - x1) / k, dur = t2 - t1, S = (v, c2, w2) => AP(v, 1, c2, w2, '\\,\\text{s}'); if (s === 0.5) continue;
      prompt = `Die Höhe einer Riesenrad-Gondel über dem Boden (in Metern) wird t Sekunden nach dem Start durch h beschrieben. Wie lange ist die Gondel während einer Umdrehung höher als ${H} m? Runde auf eine Nachkommastelle.`; formula = `h(t)=${rr}\\cdot\\sin(${k}^\\circ\\cdot t)+${m0}`;
      opts = [S(dur, true), S(t1, false, 'Das ist der Zeitpunkt, zu dem die Höhe zum ersten Mal erreicht wird – gefragt ist die Dauer.'), S(t2, false, 'Das ist der Zeitpunkt, zu dem die Gondel wieder unter diese Höhe sinkt – gefragt ist die Dauer dazwischen.'), S(T / 2, false, `Eine halbe Umdrehung lang ist die Gondel nur über der Mittellinie (${m0} m).`)];
      hints = [`Ansatz: ${tex(`${rr}\\cdot\\sin(${k}^\\circ\\cdot t)+${m0}=${H}`)}, also ${tex(`\\sin(${k}^\\circ\\cdot t)=${br(H - m0, rr)}`)}.`, `Erste Lösung: ${tex(`${k}^\\circ\\cdot t_1=\\sin^{-1}\\left(${br(H - m0, rr)}\\right)\\approx ${ft(x1, 2)}^\\circ`)}, also ${tex(`t_1\\approx ${ft(x1, 2)}:${k}\\approx ${ft(t1, 2)}`)} s.`, `Zweite Lösung über die Symmetrie der Sinuskurve: ${tex(`${k}^\\circ\\cdot t_2=180^\\circ-${ft(x1, 2)}^\\circ=${ft(180 - x1, 2)}^\\circ`)}, also ${tex(`t_2\\approx ${ft(t2, 2)}`)} s.`, 'Zwischen diesen beiden Zeitpunkten ist die Gondel höher – die Dauer ist ihr Unterschied.'];
      explain = `${tex(`\\sin(${k}^\\circ\\cdot t)=${br(H - m0, rr)}`)} liefert ${tex(`t_1\\approx ${ft(t1, 2)}`)} s und ${tex(`t_2\\approx ${ft(t2, 2)}`)} s. Dauer: ${tex(`t_2-t_1=\\dfrac{180^\\circ-2\\cdot ${ft(x1, 2)}^\\circ}{${k}^\\circ}\\approx ${ft(dur, 1)}`)} s.`; daten = { rr, k, m0, H }; }
    else { const amp = pick([1.5, 2, 2.5, 3, 4, 5]), dd = pick([-2, -1, 1, 2, 3, 4, 6]), bb = pick([2, 3, 4, 0.5]), ang = pick([30, 150, 210, 330]), s = SINUS[ang], hi = dd + amp, lo = dd - amp, Pg = 360 / bb, w = ang / bb, val = amp * s + dd; if (Math.abs(dd) === amp) continue;
      prompt = `Die Funktion ${tex('f(x)=a\\cdot\\sin(b\\cdot x)+d')} (mit ${tex('a>0')} und ${tex('b>0')}) hat den größten Wert ${gT(hi)}, den kleinsten Wert ${gT(lo)} und die Periode ${gT(Pg)}°. Berechne ${tex(`f(${ft(w)}^\\circ)`)}.`;
      opts = [N(val, true), N(R(2 * amp * s + dd, 4), false, 'Die Amplitude ist nur der halbe Abstand zwischen kleinstem und größtem Wert.'), N(R(dd * s + amp, 4), false, 'Amplitude und Mittellinie sind vertauscht.'), N(R(amp * s, 4), false, 'Die Verschiebung d fehlt.')];
      hints = [`Amplitude: ${tex(`a=\\dfrac{${ft(hi)}-${kl(lo)}}{2}=${ft(amp)}`)}.`, `Mittellinie: ${tex(`d=\\dfrac{${ft(hi)}+${kl(lo)}}{2}=${ft(dd)}`)}.`, `Faktor vor x: ${tex(`b=\\dfrac{360^\\circ}{${ft(Pg)}^\\circ}=${ft(bb)}`)}.`, `Winkel einsetzen: ${tex(`${ft(bb)}\\cdot ${ft(w)}^\\circ=${ang}^\\circ`)} und ${tex(`\\sin ${ang}^\\circ=${ft(s)}`)}.`];
      explain = `${tex(`f(x)=${ft(amp)}\\cdot\\sin(${ft(bb)}x)${pmf(dd)}`)}, also ${tex(`f(${ft(w)}^\\circ)=${ft(amp)}\\cdot\\sin ${ang}^\\circ${pmf(dd)}=${ft(amp)}\\cdot ${kl(s)}${pmf(dd)}=${ft(val)}`)}.`; daten = { hi, lo, Pg, w }; }
    if (!gut(opts)) continue;
    return fertig(prompt, formula, opts, hints, explain, kind, daten);
  }
}

/** Alle Erzeuger dieser Datei – für Tests und Verzeichnisse. */
export const GENS7 = { genSchriftlich, genKoordinaten, genDiagramm, genProzentStart, genWinkelArt, genZufallStart, genRational, genGleichungKlammer, genVieleck, genPrisma, genExpFunktion, genSinusFkt };
for (const [fn, topic] of [[genSchriftlich, 'Schriftlich rechnen'], [genKoordinaten, 'Koordinatensystem'], [genDiagramm, 'Diagramme lesen'], [genProzentStart, 'Prozent: erste Schritte'], [genWinkelArt, 'Winkel'], [genZufallStart, 'Zufall'],
  [genRational, 'Rationale Zahlen'], [genGleichungKlammer, 'Gleichungen mit Klammern'], [genVieleck, 'Dreieck, Parallelogramm, Trapez'], [genPrisma, 'Prisma und Zylinder'], [genExpFunktion, 'Exponentialfunktionen'], [genSinusFkt, 'Sinusfunktion']]) fn.topic = topic;
