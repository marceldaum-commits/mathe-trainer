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
const E = (num, correct, why, e) => N(+(+num).toFixed(4), correct, why, `${gX(+(+num).toFixed(4))}\\,${e === '%' ? '\\%' : e === '°' ? '' : `\\text{${e}}`}${e === '°' ? '^\\circ' : ''}`.replace('\\,^', '^').replace('\\text{cm²}', '\\text{cm}^2').replace('\\text{cm³}', '\\text{cm}^3'));
const br = (a, b) => `\\dfrac{${a}}{${b}}`;
const kl = (n) => (n < 0 ? `(${ft(n)})` : ft(n));
const gut = (opts) => opts.every((o) => Number.isFinite(o.num)) && uniqNum(opts) && uniq(opts);
const fertig = (prompt, formula, opts, hints, explain, kind) => ({ prompt, formula, options: shuffle(opts), hints, explain, kind });

/* ───────────── Klasse 5 ───────────── */

/** Schriftlich rechnen: Addieren, Abziehen, Malnehmen und Teilen mit großen Zahlen. */
export function genSchriftlich(lv = 3) {
  for (;;) {
    const kind = pick(tier(lv, ['plus'], ['plus', 'minus'], ['minus', 'mal'], ['mal', 'geteilt', 'minus'], ['geteilt', 'mal', 'drei']));
    let formula, opts, hints, explain;
    if (kind === 'plus' || kind === 'drei') { const st = tier(lv, 100, 1000, 1000, 10000, 10000), a = ri(st, st * 9), b = ri(st / 2, st * 8), c = kind === 'drei' ? ri(st / 10, st * 3) : 0, s = a + b + c;
      formula = `${gX(a)}+${gX(b)}${c ? `+${gX(c)}` : ''}`; if ((a % 10) + (b % 10) + (c % 10) < 10) continue;
      opts = [N(s, true), N(s - 10, false, 'Der Übertrag von der Einerstelle fehlt.'), N(s + 100, false, 'Ein Übertrag wurde doppelt gezählt.'), N(s - 100, false, 'Der Übertrag in die Hunderterstelle fehlt.')];
      hints = ['Schreib die Zahlen stellengerecht untereinander: Einer unter Einer.', 'Rechne von rechts nach links und merke dir jeden Übertrag.']; explain = `${tex(`${formula}=${gX(s)}`)}. Probe mit dem Überschlag: Die Größenordnung muss stimmen.`; }
    else if (kind === 'minus') { const st = tier(lv, 100, 100, 1000, 1000, 10000), a = ri(st * 4, st * 9), b = ri(st, st * 3 + st / 2), d = a - b; if (a % 10 >= b % 10) continue; formula = `${gX(a)}-${gX(b)}`;
      opts = [N(d, true), N(d + 10, false, 'Beim Entbündeln wurde der Zehner nicht verringert.'), N(a - b + 2 * ((b % 10) - (a % 10)), false, 'An der Einerstelle wurde die kleinere von der größeren Ziffer abgezogen – egal, welche oben steht.'), N(a + b, false, 'Hier wird abgezogen, nicht addiert.')];
      hints = ['Stellengerecht untereinander schreiben.', 'Ist die obere Ziffer kleiner, wird ein Zehner entbündelt.']; explain = `${tex(`${formula}=${gX(d)}`)}. Probe: ${tex(`${gX(d)}+${gX(b)}=${gX(a)}`)}.`; }
    else if (kind === 'mal') { const a = ri(tier(lv, 12, 12, 23, 123, 213), tier(lv, 49, 99, 199, 499, 899)), b = lv >= 5 ? ri(12, 39) : ri(3, 9), p = a * b; if (a % 10 === 0 || b % 10 === 0) continue; formula = `${a}\\cdot${b}`;
      opts = [N(p, true), N(p - (a % 10) * (b % 10) + ((a % 10) * (b % 10)) % 10, false, 'Der Übertrag aus der Einerstelle wurde nicht weitergerechnet.'), N(p + b * 10, false, 'Ein Übertrag wurde doppelt gezählt.'), N(a * (b % 10 || b) + (b >= 10 ? a * Math.floor(b / 10) : a), false, b >= 10 ? 'Die Zehnerziffer steht für Zehner: Diese Zeile rückt eine Stelle nach links.' : 'Rechne Stelle für Stelle und addiere die Überträge.')];
      hints = ['Nimm jede Stelle einzeln mal, von rechts nach links.', `Überschlag: ${tex(`${Math.round(a / 10) * 10}\\cdot${b}=${gX(Math.round(a / 10) * 10 * b)}`)}.`]; explain = `${tex(`${a}\\cdot${b}=${gX(p)}`)}.`; }
    else { const b = ri(3, lv >= 5 ? 12 : 9), q = ri(tier(lv, 12, 23, 45, 104, 207), tier(lv, 40, 90, 190, 480, 890)), a = b * q; formula = `${gX(a)}:${b}`;
      opts = [N(q, true), N(q + 10, false, 'Eine Stelle wurde falsch geschätzt – mach die Probe durch Malnehmen.'), N(q - 1, false, `Probe: ${tex(`${q - 1}\\cdot${b}=${gX((q - 1) * b)}`)} – das ist zu wenig.`), N(q * 10 > 0 && String(q).includes('0') ? +String(q).replace('0', '') : q + 100, false, String(q).includes('0') ? 'Eine Null im Ergebnis wurde vergessen: Passt der Teiler nicht hinein, steht dort eine 0.' : 'Die Stellenzahl stimmt nicht – mach einen Überschlag.')];
      hints = ['Teile Stelle für Stelle von links nach rechts.', `Probe: Ergebnis mal ${b} muss ${gT(a)} ergeben.`]; explain = `${tex(`${gX(a)}:${b}=${q}`)}, denn ${tex(`${q}\\cdot${b}=${gX(a)}`)}.`; }
    if (!gut(opts) || opts.some((o) => o.num <= 0)) continue;
    return fertig('Rechne schriftlich.', formula, opts, hints, explain, kind);
  }
}

/** Koordinatensystem: Punkte ablesen, verschieben, Abstände auf Gitterlinien, fehlende Ecke. */
export function genKoordinaten(lv = 3) {
  for (;;) {
    const kind = pick(tier(lv, ['weg'], ['weg', 'schieben'], ['schieben', 'abstand', 'ecke'], ['ecke', 'quadrant', 'abstand'], ['quadrant', 'mitte', 'ecke']));
    const neg = lv >= 4, x = ri(neg ? -5 : 1, 7), y = ri(neg ? -5 : 1, 7), dx = ri(1, 4), dy = ri(1, 4);
    const P = (a, b, correct, why) => ({ tex: `(${a}\\mid ${b})`, num: a * 100 + b + 0.5, correct, why });
    let prompt, opts, hints, explain;
    if (kind === 'weg') { if (x === y) continue; prompt = `Du startest im Ursprung und gehst ${x} nach rechts und ${y} nach oben. Bei welchem Punkt kommst du an?`;
      opts = [P(x, y, true), P(y, x, false, 'Die erste Zahl gehört zur x-Achse (rechts/links), die zweite zur y-Achse (oben/unten).'), P(x + y, 0, false, 'Rechts und oben sind zwei verschiedene Richtungen – die Schritte werden nicht zusammengezählt.'), P(x, y + 1, false, 'Zähle die Schritte nach oben noch einmal nach.')];
      hints = ['Erst nach rechts, dann nach oben – wie beim Lesen eines Stadtplans.', `Punkte schreibt man ${tex('(x\\mid y)')}.`]; explain = `${tex(`P(${x}\\mid ${y})`)}: erst der x-Wert, dann der y-Wert.`; }
    else if (kind === 'schieben') { prompt = `Der Punkt ${tex(`A(${x}\\mid ${y})`)} wird um ${dx} nach rechts und um ${dy} nach unten verschoben. Wo liegt er danach?`;
      opts = [P(x + dx, y - dy, true), P(x + dx, y + dy, false, 'Nach unten heißt: Der y-Wert wird kleiner.'), P(x - dy, y + dx, false, 'Rechts/links ändert den x-Wert, oben/unten den y-Wert.'), P(x - dx, y - dy, false, 'Nach rechts heißt: Der x-Wert wird größer.')];
      hints = ['Rechts/links ändert nur den x-Wert.', 'Oben/unten ändert nur den y-Wert.']; explain = `${tex(`(${x}+${dx}\\mid ${y}-${dy})=(${x + dx}\\mid ${y - dy})`)}.`; if (dx === dy) continue; }
    else if (kind === 'abstand') { const waag = rand() < 0.5, x2 = x + dx + 2, y2 = y + dy + 1; prompt = waag ? `Wie weit sind ${tex(`A(${x}\\mid ${y})`)} und ${tex(`B(${x2}\\mid ${y})`)} voneinander entfernt (in Kästchen)?` : `Wie weit sind ${tex(`A(${x}\\mid ${y})`)} und ${tex(`B(${x}\\mid ${y2})`)} voneinander entfernt (in Kästchen)?`;
      const d = waag ? x2 - x : y2 - y, falsch = waag ? x2 + x : y2 + y;
      opts = [N(d, true), N(falsch, false, 'Der Abstand ist der Unterschied der Werte, nicht ihre Summe.'), N(d + 1, false, 'Gezählt werden die Schritte zwischen den Punkten, nicht die Gitterpunkte.'), N(waag ? Math.abs(y) || d + 2 : Math.abs(x) || d + 2, false, 'Schau auf die Koordinate, die sich ändert.')];
      hints = [`Die Punkte liegen auf einer ${waag ? 'waagerechten' : 'senkrechten'} Linie.`, 'Zieh die beiden Werte voneinander ab, die verschieden sind.']; explain = `${tex(waag ? `${x2}-${kl(x)}=${d}` : `${y2}-${kl(y)}=${d}`)} Kästchen.`; if (falsch === d) continue; }
    else if (kind === 'ecke') { const w = dx + 1, h = dy + 2; prompt = `Ein Rechteck hat die Ecken ${tex(`A(${x}\\mid ${y})`)}, ${tex(`B(${x + w}\\mid ${y})`)} und ${tex(`C(${x + w}\\mid ${y + h})`)}. Wo liegt die vierte Ecke D?`;
      opts = [P(x, y + h, true), P(x + w, y - h, false, 'Das wäre ein Punkt unter B – D liegt über A.'), P(x + h, y + w, false, 'D hat denselben x-Wert wie A und denselben y-Wert wie C.'), P(x, y + w, false, 'Die Höhe des Rechtecks liest du an B und C ab.')];
      hints = ['D liegt genau über A.', 'D liegt auf derselben Höhe wie C.']; explain = `D hat den x-Wert von A und den y-Wert von C: ${tex(`D(${x}\\mid ${y + h})`)}.`; if (w === h) continue; }
    else if (kind === 'quadrant') { const qx = pick([-1, 1]) * ri(1, 6), qy = pick([-1, 1]) * ri(1, 6), q = qx > 0 ? (qy > 0 ? 1 : 4) : qy > 0 ? 2 : 3; prompt = `In welchem Quadranten liegt der Punkt ${tex(`P(${qx}\\mid ${qy})`)}?`;
      const Q = (n) => ({ tex: `\\text{${['I', 'II', 'III', 'IV'][n - 1]}. Quadrant}`, num: n, correct: n === q, why: n === q ? undefined : ['Im I. Quadranten sind beide Werte positiv.', 'Im II. Quadranten ist x negativ und y positiv.', 'Im III. Quadranten sind beide Werte negativ.', 'Im IV. Quadranten ist x positiv und y negativ.'][n - 1] });
      opts = [Q(1), Q(2), Q(3), Q(4)]; hints = ['Die Quadranten werden gegen den Uhrzeigersinn gezählt, beginnend rechts oben.', `x ist ${qx > 0 ? 'positiv (rechts)' : 'negativ (links)'}, y ist ${qy > 0 ? 'positiv (oben)' : 'negativ (unten)'}.`]; explain = `${qx > 0 ? 'Rechts' : 'Links'} ${qy > 0 ? 'oben' : 'unten'}: ${['I', 'II', 'III', 'IV'][q - 1]}. Quadrant.`; }
    else { const x2 = x + 2 * dx, y2 = y + 2 * dy; prompt = `Welcher Punkt liegt genau in der Mitte zwischen ${tex(`A(${x}\\mid ${y})`)} und ${tex(`B(${x2}\\mid ${y2})`)}?`;
      opts = [P(x + dx, y + dy, true), P(x2 - x, y2 - y, false, 'Das ist der Unterschied der Koordinaten, nicht die Mitte.'), P(x + x2, y + y2, false, 'Die Summen werden noch halbiert.'), P(x + dx, y, false, 'Auch der y-Wert liegt in der Mitte.')];
      hints = ['Die Mitte liegt bei beiden Koordinaten genau dazwischen.', `${tex(`\\dfrac{${x}+${kl(x2)}}{2}`)} und ${tex(`\\dfrac{${y}+${kl(y2)}}{2}`)}.`]; explain = `${tex(`M(${x + dx}\\mid ${y + dy})`)}.`; if (x + dx === 0 && y + dy === 0) continue; }
    if (!gut(opts)) continue;
    return fertig(prompt, undefined, opts, hints, explain, kind);
  }
}

const SACHEN = [['Lieblingssport', ['Fußball', 'Schwimmen', 'Turnen', 'Tennis', 'Reiten']], ['Haustiere', ['Hund', 'Katze', 'Hamster', 'Fisch', 'Vogel']], ['Schulweg', ['Bus', 'Fahrrad', 'zu Fuß', 'Auto', 'Roller']], ['Lieblingsfach', ['Mathe', 'Sport', 'Kunst', 'Musik', 'Deutsch']]];
/** Diagramme und Strichlisten lesen: Summe, Unterschied, größter Wert, Anteil. */
export function genDiagramm(lv = 3) {
  for (;;) {
    const kind = pick(tier(lv, ['summe', 'meist'], ['summe', 'unterschied'], ['unterschied', 'zusammen', 'fehlt'], ['fehlt', 'anteil', 'zusammen'], ['anteil', 'doppelt', 'fehlt']));
    const [thema, namen] = pick(SACHEN), n = tier(lv, 3, 4, 4, 5, 5), w = shuffle(Array.from({ length: 9 }, (_, i) => i + 2 + (lv >= 3 ? 3 : 0))).slice(0, n), ges = w.reduce((s, v) => s + v, 0);
    const liste = namen.slice(0, n).map((na, i) => `${na}: ${w[i]}`).join(' · '), i1 = ri(0, n - 1), i2 = (i1 + 1 + ri(0, n - 2)) % n, max = Math.max(...w);
    let frage, opts, hints, explain;
    if (kind === 'summe') { frage = 'Wie viele Kinder wurden insgesamt befragt?';
      opts = [N(ges, true), N(max, false, 'Das ist nur die größte Säule. Gefragt sind alle zusammen.'), N(n, false, 'Das ist die Anzahl der Säulen, nicht der Kinder.'), N(ges - w[n - 1], false, 'Eine Säule fehlt in deiner Summe.')];
      hints = ['Jede Säule steht für so viele Kinder, wie ihre Höhe angibt.', 'Addiere alle Werte.']; explain = `${tex(`${w.join('+')}=${ges}`)}.`; }
    else if (kind === 'meist') { frage = 'Wie viele Kinder haben die beliebteste Antwort gewählt?'; const zweit = [...w].sort((a, b) => b - a)[1];
      opts = [N(max, true), N(zweit, false, 'Das ist die zweithöchste Säule.'), N(ges, false, 'Das sind alle Kinder zusammen.'), N(Math.min(...w), false, 'Das ist die niedrigste Säule.')];
      hints = ['Die beliebteste Antwort hat die höchste Säule.', 'Suche den größten Wert.']; explain = `Der größte Wert ist ${max} (${namen[w.indexOf(max)]}).`; }
    else if (kind === 'unterschied') { if (w[i1] === w[i2]) continue; const d = Math.abs(w[i1] - w[i2]); frage = `Wie viele Kinder haben ${w[i1] > w[i2] ? `„${namen[i1]}“ mehr gewählt als „${namen[i2]}“` : `„${namen[i2]}“ mehr gewählt als „${namen[i1]}“`}?`;
      opts = [N(d, true), N(w[i1] + w[i2], false, '„Mehr als“ fragt nach dem Unterschied, nicht nach der Summe.'), N(Math.max(w[i1], w[i2]), false, 'Das ist der größere Wert – gefragt ist, um wie viel er größer ist.'), N(d + 1, false, 'Zieh den kleineren Wert vom größeren ab.')];
      hints = ['Lies beide Werte ab.', 'Zieh den kleineren vom größeren ab.']; explain = `${tex(`${Math.max(w[i1], w[i2])}-${Math.min(w[i1], w[i2])}=${d}`)}.`; }
    else if (kind === 'zusammen') { const s = w[i1] + w[i2]; frage = `Wie viele Kinder haben „${namen[i1]}“ oder „${namen[i2]}“ gewählt?`;
      opts = [N(s, true), N(Math.abs(w[i1] - w[i2]) || s + 2, false, '„Oder“ heißt hier: beide Gruppen zusammen.'), N(ges, false, 'Gefragt sind nur zwei der Säulen.'), N(ges - s, false, 'Das sind alle anderen.')];
      hints = ['Lies beide Werte ab.', 'Addiere sie.']; explain = `${tex(`${w[i1]}+${w[i2]}=${s}`)}.`; if (ges - s === s) continue; }
    else if (kind === 'fehlt') { const rest = ges - w[i1], listeOhne = namen.slice(0, n).map((na, i) => (i === i1 ? `${na}: ?` : `${na}: ${w[i]}`)).join(' · ');
      const opts2 = [N(w[i1], true), N(ges, false, 'Das sind alle Kinder zusammen.'), N(rest, false, 'Das sind die anderen Säulen zusammen – sie werden von der Gesamtzahl abgezogen.'), N(w[i1] + 2, false, `Rechne ${tex(`${ges}-${rest}`)} noch einmal nach.`)];
      if (!gut(opts2)) continue;
      return fertig(`Umfrage „${thema}“ mit ${ges} Kindern: ${listeOhne}. Welche Zahl fehlt?`, undefined, opts2, ['Addiere die bekannten Werte.', `Zieh diese Summe von ${ges} ab.`], `${tex(`${ges}-${rest}=${w[i1]}`)}.`, kind); }
    else if (kind === 'anteil') { const z = w[i1], g = gcd(z, ges); frage = `Welcher Anteil der Kinder hat „${namen[i1]}“ gewählt?`;
      const B = (a, b, c2, w2) => ({ tex: br(a / gcd(a, b), b / gcd(a, b)), num: a / b, correct: c2, why: w2 });
      opts = [B(z, ges, true), B(z, ges - z, false, 'Der Anteil bezieht sich auf <b>alle</b> Kinder, nicht nur auf die anderen.'), B(1, n, false, 'Die Säulen sind nicht gleich hoch – der Anteil hängt vom Wert ab.'), B(ges - z, ges, false, 'Das ist der Anteil der anderen Kinder.')];
      hints = ['Anteil = Teil durch Ganzes.', `Das Ganze sind alle ${ges} Kinder.`]; explain = `${tex(`${br(z, ges)}${g > 1 ? `=${br(z / g, ges / g)}` : ''}`)}.`; if (z * 2 === ges) continue; }
    else { const paare = []; for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) if (w[a] === 2 * w[b]) paare.push([a, b]); if (paare.length !== 1) continue; const [a, b] = paare[0]; frage = `Welche Antwort wurde genau doppelt so oft gewählt wie „${namen[b]}“?`;
      const T = (i) => ({ tex: `\\text{${namen[i]}}`, num: i, correct: i === a, why: i === a ? undefined : `„${namen[i]}“ wurde ${w[i]}-mal gewählt – das Doppelte von ${w[b]} ist ${2 * w[b]}.` });
      opts = shuffle(namen.slice(0, n).map((_, i) => i).filter((i) => i !== b)).slice(0, 4).map(T); if (!opts.some((o) => o.correct) || opts.length < 4) continue;
      hints = [`„${namen[b]}“ wurde ${w[b]}-mal gewählt.`, `Suche den Wert ${2 * w[b]}.`]; explain = `${tex(`2\\cdot${w[b]}=${w[a]}`)}: ${namen[a]}.`; }
    if (!gut(opts)) continue;
    return fertig(`Umfrage „${thema}“ (Säulendiagramm): ${liste}. ${frage}`, undefined, opts, hints, explain, kind);
  }
}

/* ───────────── Klasse 6 ───────────── */

/** Prozent: erste Schritte – Bruch und Prozent, einfache Anteile. */
export function genProzentStart(lv = 3) {
  for (;;) {
    const kind = pick(tier(lv, ['bruch'], ['bruch', 'von'], ['von', 'hundert', 'zurueck'], ['hundert', 'zurueck', 'rest'], ['rest', 'vergleich', 'zurueck']));
    const [z, n, p] = pick(tier(lv, [[1, 2, 50], [1, 4, 25], [1, 10, 10]], [[1, 2, 50], [1, 4, 25], [3, 4, 75], [1, 5, 20], [1, 10, 10]], [[3, 4, 75], [1, 5, 20], [2, 5, 40], [3, 10, 30]], [[2, 5, 40], [3, 5, 60], [7, 10, 70], [1, 20, 5]], [[3, 20, 15], [7, 20, 35], [4, 5, 80], [9, 10, 90]]));
    let prompt, formula, opts, hints, explain;
    if (kind === 'bruch') { prompt = 'Wie viel Prozent sind das?'; formula = br(z, n);
      opts = [E(p, true, undefined, '%'), E(n, false, 'Der Nenner ist nicht die Prozentzahl. Prozent heißt „von hundert“.', '%'), E(z * 10 === p ? z : z * 10, false, 'Erweitere den Bruch auf den Nenner 100.', '%'), E(100 - p === p ? p / 2 : 100 - p, false, 'Das ist der Rest bis 100 %.', '%')];
      hints = ['Prozent heißt „von hundert“.', `Erweitere auf Hundertstel: ${tex(`${br(z, n)}=${br(p, 100)}`)}.`]; explain = `${tex(`${br(z, n)}=${br(p, 100)}=${p}\\,\\%`)}.`; }
    else if (kind === 'von') { const G = n * ri(2, tier(lv, 6, 8, 12, 20, 30)), W = (G * p) / 100; prompt = `Wie viel sind ${p} % von ${G}?`;
      opts = [N(W, true), N(G / n === W ? G - W : G / n, false, `Das ist erst ${tex(br(1, n))} – gefragt sind ${p} %.`), N(G - W === W ? W * 2 : G - W, false, 'Das ist der Rest, der übrig bleibt.'), N(p, false, 'Das ist die Prozentzahl, nicht der Anteil.')];
      hints = [`${p} % sind ${tex(br(z, n))}.`, `Teile ${G} durch ${n}${z > 1 ? ` und nimm mal ${z}` : ''}.`]; explain = `${tex(`${G}:${n}${z > 1 ? `\\cdot${z}` : ''}=${W}`)}.`; }
    else if (kind === 'hundert') { const t = ri(3, 97); prompt = `In einem Hunderterfeld sind ${t} Kästchen gefärbt. Wie viel Prozent sind <b>nicht</b> gefärbt?`;
      opts = [E(100 - t, true, undefined, '%'), E(t, false, 'Das ist der gefärbte Anteil.', '%'), E(Math.abs(100 - 2 * t) || 1, false, 'Gefärbt und nicht gefärbt ergeben zusammen 100 %.', '%'), E(100 - t + 10 > 100 ? 100 - t - 10 : 100 - t + 10, false, 'Rechne den Rest bis 100 noch einmal nach.', '%')];
      hints = ['Ein Kästchen im Hunderterfeld ist 1 %.', 'Alles zusammen sind 100 %.']; explain = `${tex(`100\\,\\%-${t}\\,\\%=${100 - t}\\,\\%`)}.`; if (t === 50) continue; }
    else if (kind === 'zurueck') { const G = n * ri(2, 12), W = (G * p) / 100; prompt = `${W} von ${G} Kindern kommen mit dem Fahrrad. Wie viel Prozent sind das?`;
      opts = [E(p, true, undefined, '%'), E(W, false, 'Die Anzahl ist nicht die Prozentzahl – es kommt auf den Anteil an.', '%'), E(100 - p, false, 'Das ist der Anteil der anderen Kinder.', '%'), E(p / 2 === W ? p * 2 : p / 2, false, 'Kürze den Bruch und erweitere dann auf Hundertstel.', '%')];
      hints = [`Schreibe den Anteil als Bruch: ${tex(br(W, G))}.`, `Gekürzt: ${tex(br(z, n))}.`]; explain = `${tex(`${br(W, G)}=${br(z, n)}=${p}\\,\\%`)}.`; if (W === p || 100 - p === p) continue; }
    else if (kind === 'rest') { const G = n * ri(3, 15), W = (G * p) / 100; prompt = `Von ${G} Losen sind ${p} % Gewinne. Wie viele Lose sind <b>Nieten</b>?`;
      opts = [N(G - W, true), N(W, false, 'Das sind die Gewinne. Gefragt sind die Nieten.'), N(100 - p, false, 'Das ist der Prozentsatz der Nieten, nicht ihre Anzahl.'), N(G - p, false, `${p} % sind nicht ${p} Lose.`)];
      hints = ['Rechne erst die Gewinne aus.', 'Zieh sie von allen Losen ab.']; explain = `Gewinne: ${W}. Nieten: ${tex(`${G}-${W}=${G - W}`)}.`; if (G - W === W || G - p === G - W || 100 - p === W) continue; }
    else { const [z2, n2, p2] = pick([[1, 4, 25], [2, 5, 40], [3, 10, 30], [3, 5, 60], [7, 10, 70]].filter((q) => q[2] !== p)); prompt = 'Was ist größer?';
      const T = (t, num, c2, w2) => ({ tex: t, num, correct: c2, why: w2 });
      opts = [T(br(z, n), 1, p > p2, `${tex(`${br(z, n)}=${p}\\,\\%`)} – das ist weniger als ${p2} %.`), T(`${p2}\\,\\%`, 2, p2 > p, `${tex(`${br(z, n)}=${p}\\,\\%`)} – das ist mehr als ${p2} %.`), T('\\text{beide gleich}', 3, false, `${tex(`${br(z, n)}=${p}\\,\\%`)}, also nicht gleich ${p2} %.`), T('\\text{kann man nicht sagen}', 4, false, 'Doch: Wandle den Bruch in Prozent um und vergleiche.')];
      void z2; void n2; hints = ['Wandle den Bruch in Prozent um.', `${tex(`${br(z, n)}=${br(p, 100)}`)}.`]; explain = `${tex(`${br(z, n)}=${p}\\,\\%`)} ${p > p2 ? '>' : '<'} ${p2} %.`;
      return fertig(prompt, `${br(z, n)}\\quad\\text{oder}\\quad ${p2}\\,\\%`, opts, hints, explain, kind); }
    if (!gut(opts) || opts.some((o) => o.num <= 0)) continue;
    return fertig(prompt, formula, opts, hints, explain, kind);
  }
}

/** Winkel: Arten erkennen, ergänzen, Uhrzeiger, Drehungen. */
export function genWinkelArt(lv = 3) {
  for (;;) {
    const kind = pick(tier(lv, ['art'], ['art', 'drehung'], ['drehung', 'uhr', 'rest'], ['uhr', 'rest', 'voll'], ['voll', 'uhr', 'ueber']));
    let prompt, opts, hints, explain;
    if (kind === 'art') { const w = pick([ri(2, 17) * 5, 90, ri(19, 35) * 5, 180, ri(37, 70) * 5]), art = w < 90 ? 0 : w === 90 ? 1 : w < 180 ? 2 : w === 180 ? 3 : 4, NAMEN = ['spitzer Winkel', 'rechter Winkel', 'stumpfer Winkel', 'gestreckter Winkel', 'überstumpfer Winkel'], WARUM = ['Spitz sind Winkel unter 90°.', 'Ein rechter Winkel hat genau 90°.', 'Stumpf sind Winkel zwischen 90° und 180°.', 'Ein gestreckter Winkel hat genau 180°.', 'Überstumpf sind Winkel über 180°.'];
      prompt = `Ein Winkel ist ${w}° groß. Wie heißt diese Winkelart?`; const wahl = [art, ...shuffle([0, 1, 2, 3, 4].filter((i) => i !== art)).slice(0, 3)];
      opts = wahl.map((i) => ({ tex: `\\text{${NAMEN[i]}}`, num: i, correct: i === art, why: i === art ? undefined : WARUM[i] }));
      hints = ['Vergleiche mit 90° (rechter Winkel) und 180° (gestreckter Winkel).', WARUM[art]]; explain = `${w}°: ${NAMEN[art]}. ${WARUM[art]}`; }
    else if (kind === 'drehung') { const [t, n] = pick([['Viertel', 4], ['halbe', 2], ['Dreiviertel', 4 / 3], ['ganze', 1], ['Achtel', 8], ['Drittel', 3], ['Sechstel', 6]].slice(0, lv >= 3 ? 7 : 4)), w = 360 / n; prompt = `Wie groß ist der Winkel bei einer ${t === 'Viertel' || t === 'Dreiviertel' || t === 'Achtel' || t === 'Drittel' || t === 'Sechstel' ? `${t}drehung` : `${t}n Drehung`}?`.replace('halben', 'halben').replace('ganzen', 'ganzen');
      opts = [E(w, true, undefined, '°'), E(w === 180 ? 90 : 180, false, 'Eine ganze Drehung hat 360°.', '°'), E(w === 100 / n ? w + 5 : +(100 / n).toFixed(1), false, 'Eine ganze Drehung hat 360°, nicht 100°.', '°'), E(w === 360 ? 720 : 360 - w === w ? w / 2 : 360 - w, false, 'Das ist der Rest bis zur ganzen Drehung.', '°')];
      hints = ['Eine ganze Drehung hat 360°.', `Teile 360° entsprechend auf.`]; explain = `${tex(`${ft(w)}^\\circ`)} – der passende Teil von 360°.`; }
    else if (kind === 'uhr') { const h = ri(1, 11), min = lv >= 5 ? 30 : 0, w0 = Math.abs(30 * h - (min ? 180 - 15 : 0)), w = Math.min(w0, 360 - w0); prompt = `Welchen (kleineren) Winkel bilden die Zeiger einer Uhr um ${h}${min ? ':30' : ':00'} Uhr?`;
      const f1 = h * 6, f2 = min ? Math.abs(30 * h - 180) : 360 - w;
      opts = [E(w, true, undefined, '°'), E(f1 === w ? w + 30 : f1, false, 'Zwischen zwei Stundenzahlen liegen 30°, nicht 6°.', '°'), E(f2 === w || f2 === 0 ? w + 15 : f2, false, min ? 'Um halb steht der Stundenzeiger schon in der Mitte zwischen zwei Zahlen.' : 'Gefragt ist der kleinere der beiden Winkel.', '°'), E(w + 60 > 180 ? Math.abs(w - 60) || 45 : w + 60, false, 'Zähle die Abschnitte zwischen den Zeigern noch einmal.', '°')];
      hints = ['Das Zifferblatt hat 12 Abschnitte: Jeder ist 360° : 12 = 30° groß.', min ? 'Um halb steht der Stundenzeiger genau zwischen zwei Zahlen.' : `Zwischen den Zeigern liegen ${Math.min(h, 12 - h)} Abschnitte.`]; explain = `${tex(`${ft(w)}^\\circ`)}.`; if (w === 0 || w === 180) continue; }
    else if (kind === 'rest') { const a = ri(3, 16) * 5, b = ri(3, 16) * 5; if (a + b >= 180) continue; prompt = `Ein gestreckter Winkel wird in drei Teile geteilt. Zwei davon sind ${a}° und ${b}° groß. Wie groß ist der dritte?`;
      opts = [E(180 - a - b, true, undefined, '°'), E(360 - a - b, false, 'Ein gestreckter Winkel hat 180°, nicht 360°.', '°'), E(a + b, false, 'Das ist die Summe der beiden bekannten Teile.', '°'), E(180 - a, false, 'Auch der zweite Teil wird abgezogen.', '°')];
      hints = ['Ein gestreckter Winkel hat 180°.', `${tex(`180^\\circ-${a}^\\circ-${b}^\\circ`)}.`]; explain = `${tex(`180^\\circ-${a + b}^\\circ=${180 - a - b}^\\circ`)}.`; }
    else if (kind === 'voll') { const a = ri(4, 30) * 5; prompt = `Um einen Punkt liegen zwei Winkel, die zusammen eine ganze Drehung ergeben. Einer ist ${a}° groß. Wie groß ist der andere?`;
      opts = [E(360 - a, true, undefined, '°'), E(Math.abs(180 - a) || 90, false, 'Eine ganze Drehung hat 360°.', '°'), E(a, false, 'Die beiden Winkel sind nur bei 180° gleich groß.', '°'), E(360 + a, false, 'Der bekannte Winkel wird abgezogen.', '°')];
      hints = ['Eine ganze Drehung hat 360°.', `${tex(`360^\\circ-${a}^\\circ`)}.`]; explain = `${tex(`360^\\circ-${a}^\\circ=${360 - a}^\\circ`)}.`; if (a === 180 || a === 90) continue; }
    else { const k = ri(2, 5), a = ri(3, 11) * 5; prompt = `Ein Winkel ist ${k}-mal so groß wie sein Nebenwinkel. Zusammen ergeben beide 180°. Wie groß ist der kleinere Winkel?`; const kl2 = 180 / (k + 1); void a;
      opts = [E(kl2, true, undefined, '°'), E(180 / k, false, `Es gibt ${k + 1} gleiche Teile: einen für den kleinen und ${k} für den großen Winkel.`, '°'), E(180 - kl2, false, 'Das ist der größere Winkel.', '°'), E(360 / (k + 1), false, 'Nebenwinkel ergeben zusammen 180°, nicht 360°.', '°')];
      hints = [`Denke in Teilen: der kleine Winkel ist 1 Teil, der große ${k} Teile.`, `${k + 1} Teile sind 180°.`]; explain = `${tex(`180^\\circ:${k + 1}=${ft(kl2)}^\\circ`)}.`; if (k === 1) continue; }
    if (!gut(opts) || opts.some((o) => o.num < 0)) continue;
    return fertig(prompt, undefined, opts, hints, explain, kind);
  }
}

/** Zufall: relative Häufigkeit und einfache Wahrscheinlichkeit. */
export function genZufallStart(lv = 3) {
  for (;;) {
    const kind = pick(tier(lv, ['urne'], ['urne', 'wuerfel'], ['wuerfel', 'haeufig', 'sicher'], ['haeufig', 'erwartet', 'nicht'], ['erwartet', 'nicht', 'haeufig']));
    const B = (a, b, c2, w2) => ({ tex: a === 0 ? '0' : a === b ? '1' : br(a / gcd(a, b), b / gcd(a, b)), num: a / b, correct: c2, why: w2 });
    let prompt, opts, hints, explain;
    if (kind === 'urne' || kind === 'nicht') { const r = ri(1, 6), b = ri(1, 6), g = lv >= 3 ? ri(1, 5) : 0, n = r + b + g; if (r === b || r === g || r * 2 === n) continue; const nicht = kind === 'nicht';
      prompt = `In einem Beutel liegen ${r} rote, ${b} blaue${g ? ` und ${g} grüne` : ''} Kugeln. Wie groß ist die Wahrscheinlichkeit, ${nicht ? '<b>keine</b> rote' : 'eine rote'} Kugel zu ziehen?`;
      opts = nicht ? [B(n - r, n, true), B(r, n, false, 'Das ist die Wahrscheinlichkeit <b>für</b> Rot.'), B(n - r, r + n, false, 'Im Nenner steht die Anzahl aller Kugeln.'), B(1, g ? 3 : 2, false, 'Die Farben kommen verschieden oft vor.')]
        : [B(r, n, true), B(r, n - r, false, 'Im Nenner stehen <b>alle</b> Kugeln, auch die roten.'), B(1, g ? 3 : 2, false, 'Die Farben kommen verschieden oft vor – es kommt auf die Anzahl an.'), B(n - r, n, false, 'Das ist die Wahrscheinlichkeit für „nicht rot“.')];
      hints = ['Wahrscheinlichkeit = günstige durch alle möglichen.', `Insgesamt sind es ${n} Kugeln.`]; explain = nicht ? `${n - r} von ${n} Kugeln sind nicht rot: ${tex(B(n - r, n).tex)}.` : `${r} von ${n} Kugeln sind rot: ${tex(B(r, n).tex)}.`; }
    else if (kind === 'wuerfel') { const [t, k] = pick([['eine gerade Zahl', 3], ['eine Zahl größer als 4', 2], ['eine 6', 1], ['eine Zahl kleiner als 6', 5], ['eine Primzahl', 3], ['eine Zahl, die durch 3 teilbar ist', 2]]); prompt = `Du würfelst einmal mit einem normalen Würfel. Wie groß ist die Wahrscheinlichkeit für ${t}?`;
      opts = [B(k, 6, true), B(6 - k === k ? k + 1 : 6 - k, 6, false, 'Das ist die Wahrscheinlichkeit für das Gegenteil.'), B(1, k === 1 ? 5 : 6, false, k === 1 ? 'Ein Würfel hat sechs Seiten.' : 'Es gibt mehr als eine passende Zahl.'), B(k, k === 5 ? 7 : 5, false, 'Ein Würfel hat sechs gleich wahrscheinliche Seiten.')];
      hints = ['Zähle, welche der Zahlen 1 bis 6 passen.', `Es passen ${k} von 6.`]; explain = `${k} von 6 Zahlen passen: ${tex(B(k, 6).tex)}.`; }
    else if (kind === 'sicher') { const F = pick([['Du würfelst mit einem normalen Würfel eine 7.', 0], ['Du würfelst eine Zahl kleiner als 7.', 1], ['Aus einem Beutel mit nur roten Kugeln ziehst du eine rote.', 1], ['Aus einem Beutel mit nur roten Kugeln ziehst du eine blaue.', 0], ['Eine Münze zeigt Kopf.', 0.5]]); prompt = `Wie groß ist die Wahrscheinlichkeit? „${F[0]}“`;
      const T = (t, v, w2) => ({ tex: t, num: v, correct: F[1] === v, why: w2 });
      opts = [T('0', 0, 'Wahrscheinlichkeit 0 heißt: unmöglich.'), T('1', 1, 'Wahrscheinlichkeit 1 heißt: ganz sicher.'), T(br(1, 2), 0.5, 'Ein Halb heißt: Es passiert in der Hälfte der Fälle.'), T(br(1, 6), 1 / 6, 'Ein Sechstel wäre eine bestimmte Zahl beim Würfeln.')];
      hints = ['Unmöglich hat die Wahrscheinlichkeit 0, sicher die Wahrscheinlichkeit 1.', 'Kann es überhaupt passieren? Muss es passieren?']; explain = F[1] === 0 ? 'Das ist unmöglich: Wahrscheinlichkeit 0.' : F[1] === 1 ? 'Das passiert sicher: Wahrscheinlichkeit 1.' : `Zwei gleich wahrscheinliche Seiten: ${tex(br(1, 2))}.`;
      return fertig(prompt, undefined, opts, hints, explain, kind); }
    else if (kind === 'haeufig') { const n = pick([20, 25, 40, 50, 80]), k = pick([0.2, 0.25, 0.4, 0.3, 0.6, 0.75].filter((q) => Number.isInteger(n * q))) * n; prompt = `Bei ${n} Würfen eines Reißnagels landet er ${k}-mal auf dem Kopf. Wie groß ist die relative Häufigkeit für „Kopf“?`;
      opts = [E((k / n) * 100, true, undefined, '%'), E(k === (k / n) * 100 ? k / 2 : k, false, 'Das ist die absolute Häufigkeit – sie muss durch die Zahl der Würfe geteilt werden.', '%'), E(100 - (k / n) * 100, false, 'Das ist die relative Häufigkeit für „nicht Kopf“.', '%'), E(Math.round((n / k) * 10), false, 'Geteilt wird Treffer durch Würfe, nicht umgekehrt.', '%')];
      hints = ['Relative Häufigkeit = Treffer geteilt durch Anzahl der Versuche.', `${tex(br(k, n))} als Prozent.`]; explain = `${tex(`${br(k, n)}=${ft((k / n) * 100)}\\,\\%`)}.`; if (k * 2 === n) continue; }
    else { const [z, n] = pick([[1, 6], [1, 4], [1, 2], [2, 5], [1, 3]]), wuerfe = n * pick([10, 20, 30, 50]); prompt = `Ein Glücksrad zeigt mit der Wahrscheinlichkeit ${tex(br(z, n))} „Gewinn“. Wie viele Gewinne sind bei ${wuerfe} Drehungen etwa zu erwarten?`;
      opts = [N((wuerfe * z) / n, true), N(wuerfe / (n * z) === (wuerfe * z) / n ? wuerfe : wuerfe / (n === 2 ? 4 : n * 2), false, 'Teile durch den Nenner und nimm mal den Zähler.'), N(wuerfe - (wuerfe * z) / n, false, 'Das sind die erwarteten Nieten.'), N(n, false, 'Das ist der Nenner der Wahrscheinlichkeit, keine Anzahl von Gewinnen.')];
      hints = ['Erwartete Anzahl = Wahrscheinlichkeit mal Anzahl der Versuche.', `${tex(`${wuerfe}\\cdot${br(z, n)}`)}.`]; explain = `${tex(`${wuerfe}\\cdot${br(z, n)}=${(wuerfe * z) / n}`)}. Das ist ein Richtwert – der Zufall hält sich nicht genau daran.`; if (z * 2 === n) continue; }
    if (!gut(opts)) continue;
    return fertig(prompt, undefined, opts, hints, explain, kind);
  }
}

/* ───────────── Klasse 7 ───────────── */

/** Rationale Zahlen: Rechnen mit negativen Dezimalzahlen und Brüchen, Vorzeichenregeln. */
export function genRational(lv = 3) {
  for (;;) {
    const kind = pick(tier(lv, ['plus'], ['plus', 'mal'], ['mal', 'minusminus', 'geteilt'], ['geteilt', 'punktstrich', 'minusminus'], ['punktstrich', 'potenz', 'geteilt']));
    const d = (max) => (lv >= 3 ? ri(2, max * 2) / 2 : ri(2, max)), a = d(9), b = d(9), c = ri(2, 6);
    let formula, opts, hints, explain;
    if (kind === 'plus') { formula = `${ft(-a)}+${ft(b)}`; if (a === b) continue;
      opts = [N(b - a, true), N(-(a + b), false, 'Bei verschiedenen Vorzeichen wird der kleinere Betrag vom größeren abgezogen.'), N(a - b, false, 'Das Vorzeichen richtet sich nach der Zahl mit dem größeren Betrag.'), N(a + b, false, 'Die erste Zahl ist negativ.')];
      hints = ['Stell dir die Zahlengerade vor: Start bei der negativen Zahl, dann nach rechts.', 'Verschiedene Vorzeichen: Beträge voneinander abziehen.']; explain = `${tex(`${ft(-a)}+${ft(b)}=${ft(b - a)}`)}.`; }
    else if (kind === 'minusminus') { formula = `${ft(-a)}-(${ft(-b)})`; if (a === b) continue;
      opts = [N(b - a, true), N(-(a + b), false, 'Minus eine negative Zahl heißt: plus die Gegenzahl.'), N(a - b, false, 'Die erste Zahl bleibt negativ.'), N(a + b, false, 'Nur das doppelte Minus in der Mitte wird zu Plus.')];
      hints = [`${tex('-(-b)=+b')}.`, `${tex(`${ft(-a)}+${ft(b)}`)}.`]; explain = `${tex(`${ft(-a)}-(${ft(-b)})=${ft(-a)}+${ft(b)}=${ft(b - a)}`)}.`; }
    else if (kind === 'mal') { const beide = rand() < 0.5; formula = beide ? `(${ft(-a)})\\cdot(${-c})` : `${ft(a)}\\cdot(${-c})`;
      opts = beide ? [N(a * c, true), N(-a * c, false, 'Minus mal Minus ergibt Plus.'), N(-(a + c), false, 'Hier wird malgenommen, nicht addiert.'), N(a + c === a * c ? a * c + 1 : a + c, false, 'Hier wird malgenommen, nicht addiert.')]
        : [N(-a * c, true), N(a * c, false, 'Plus mal Minus ergibt Minus.'), N(a - c, false, 'Hier wird malgenommen, nicht abgezogen.'), N(-(a + c) === -a * c ? -a * c - 1 : -(a + c), false, 'Hier wird malgenommen, nicht addiert.')];
      hints = ['Gleiche Vorzeichen: Ergebnis positiv. Verschiedene Vorzeichen: Ergebnis negativ.', `${tex(`${ft(a)}\\cdot${c}=${ft(a * c)}`)}.`]; explain = `${tex(`${formula}=${ft(beide ? a * c : -a * c)}`)}.`; }
    else if (kind === 'geteilt') { const q = d(6), p = q * c; formula = `(${ft(-p)}):${rand() < 0.5 ? c : `(${-c})`}`; const pos = formula.includes(':(');
      opts = [N(pos ? q : -q, true), N(pos ? -q : q, false, pos ? 'Minus durch Minus ergibt Plus.' : 'Minus durch Plus ergibt Minus.'), N(pos ? p * c : -p * c, false, 'Hier wird geteilt, nicht malgenommen.'), N((pos ? 1 : -1) * (q + 1), false, 'Mach die Probe durch Malnehmen.')];
      hints = ['Die Vorzeichenregeln sind dieselben wie beim Malnehmen.', `${tex(`${ft(p)}:${c}=${ft(q)}`)}.`]; explain = `${tex(`${formula}=${ft(pos ? q : -q)}`)}.`; }
    else if (kind === 'punktstrich') { const x = ri(2, 9), y = ri(2, 6), z = ri(2, 6); formula = `${-x}+${y}\\cdot(${-z})`;
      opts = [N(-x - y * z, true), N((-x + y) * -z, false, 'Punkt vor Strich: erst malnehmen, dann addieren.'), N(-x + y * z, false, 'Plus mal Minus ergibt Minus.'), N(x - y * z === -x - y * z ? 0 : x - y * z, false, 'Die erste Zahl ist negativ.')];
      hints = ['Punkt vor Strich.', `${tex(`${y}\\cdot(${-z})=${-y * z}`)}.`]; explain = `${tex(`${-x}+(${-y * z})=${-x - y * z}`)}.`; }
    else { const x = ri(2, 5), n = pick([2, 3]), mitKl = rand() < 0.5; formula = mitKl ? `(${-x})^${n}` : `-${x}^${n}`; const r = mitKl ? (-x) ** n : -(x ** n);
      opts = [N(r, true), N(-r, false, mitKl ? 'Die Klammer gehört dazu: Das Minus wird mitpotenziert.' : 'Ohne Klammer wird nur die Zahl potenziert – das Minus bleibt davor stehen.'), N(-x * n, false, 'Potenzieren heißt mehrfach malnehmen, nicht mal der Hochzahl.'), N(x * n === Math.abs(r) ? x * n + 1 : x * n, false, 'Potenzieren heißt mehrfach malnehmen, nicht mal der Hochzahl.')];
      hints = [mitKl ? 'Mit Klammer wird das Vorzeichen mitpotenziert.' : 'Ohne Klammer gilt: erst potenzieren, dann das Minus.', `${tex(`${x}^${n}=${x ** n}`)}.`]; explain = `${tex(`${formula}=${r}`)}.`; if (mitKl && n === 2 && false) continue; }
    if (!gut(opts)) continue;
    return fertig('Berechne.', formula, opts, hints, explain, kind);
  }
}

/** Gleichungen mit Klammern und mit x auf beiden Seiten. */
export function genGleichungKlammer(lv = 3) {
  for (;;) {
    const kind = pick(tier(lv, ['klammer'], ['klammer', 'beide'], ['beide', 'minusklammer'], ['minusklammer', 'zwei'], ['zwei', 'bruch', 'minusklammer']));
    const x = ri(lv >= 4 ? -6 : 1, 9), a = ri(2, 6), b = ri(1, 8), c = ri(1, a - 1 || 1), X = (v, c2, w2) => N(v, c2, w2, `x=${ft(v)}`);
    if (x === 0) continue;
    let formula, opts, hints, explain;
    if (kind === 'klammer') { const r = a * (x + b); formula = `${a}(x+${b})=${r}`;
      opts = [X(x, true), X(r / a, false, `Nach dem Teilen durch ${a} muss noch ${b} abgezogen werden.`), X((r - b) / a, false, `Beim Ausmultiplizieren wird auch die ${b} mit ${a} malgenommen.`), X(r - a - b, false, 'Die Klammer steht für eine Multiplikation: erst durch den Faktor teilen oder ausmultiplizieren.')];
      hints = ['Löse die Klammer auf – oder teile zuerst beide Seiten durch den Faktor.', `${tex(`x+${b}=${r / a}`)}.`]; explain = `${tex(`x+${b}=${r / a}\\ \\Rightarrow\\ x=${x}`)}.`; }
    else if (kind === 'beide') { const d = (a - c) * x + b; formula = `${a}x+${b}=${c === 1 ? '' : c}x+${d}`; if (d === b) continue;
      opts = [X(x, true), X((d - b) / (a + c), false, `Beim Herüberholen wird ${c === 1 ? 'x' : `${c}x`} abgezogen, nicht addiert.`), X((d + b) / (a - c), false, `Die ${b} wird auf beiden Seiten abgezogen.`), X(-x, false, 'Achte auf die Vorzeichen beim Umformen – mach die Probe.')];
      hints = ['Bringe alle x auf eine Seite, alle Zahlen auf die andere.', `${tex(`${a - c === 1 ? '' : a - c}x=${d - b}`)}.`]; explain = `${tex(`${a - c === 1 ? '' : a - c}x=${d - b}\\ \\Rightarrow\\ x=${x}`)}.`; }
    else if (kind === 'minusklammer') { const r = a * x - (x - b), k = a - 1; formula = `${a}x-(x-${b})=${r}`;
      opts = [X(x, true), X((r + b) / k, false, 'Ein Minus vor der Klammer dreht <b>alle</b> Vorzeichen um: Aus −b wird +b.'), X((r - b) / (a + 1), false, 'Minus mal x ergibt −x, nicht +x.'), X(r - b, false, 'Fasse erst die x-Glieder zusammen und teile dann.')];
      hints = ['Ein Minus vor der Klammer dreht alle Vorzeichen in der Klammer um.', `${tex(`${a}x-x+${b}=${r}`)}.`]; explain = `${tex(`${k === 1 ? '' : k}x+${b}=${r}\\ \\Rightarrow\\ ${k === 1 ? '' : k}x=${r - b}\\ \\Rightarrow\\ x=${x}`)}.`; if (k === 1 && false) continue; }
    else if (kind === 'zwei') { const m = ri(2, 4), e = ri(1, 5), l = a * (x + b), d = l - m * (x - e) ; formula = `${a}(x+${b})=${m}(x-${e})+${d}`; if (a === m) continue;
      opts = [X(x, true), X((d - m * e - b) / (a - m), false, `Auch die ${b} wird mit ${a} malgenommen.`), X((d + m * e - a * b) / (a - m), false, `${tex(`${m}\\cdot(-${e})=-${m * e}`)} – das Minus bleibt.`), X((d - m * e - a * b) / (a + m), false, `Beim Herüberholen wird ${m}x abgezogen.`)];
      hints = ['Löse beide Klammern auf.', `${tex(`${a}x+${a * b}=${m}x-${m * e}+${d}`)}.`]; explain = `${tex(`${a - m === 1 ? '' : a - m === -1 ? '-' : a - m}x=${d - m * e - a * b}\\ \\Rightarrow\\ x=${x}`)}.`; }
    else { const n = pick([2, 3, 4, 5]), xx = x * n, r = xx / n + b; formula = `\\dfrac{x}{${n}}+${b}=${r}`;
      opts = [X(xx, true), X((r - b) / n, false, `Um ${tex(`\\tfrac{x}{${n}}`)} aufzulösen, wird mit ${n} malgenommen, nicht geteilt.`), X(r * n - b, false, `Erst die ${b} abziehen, dann mit ${n} malnehmen.`), X((r + b) * n, false, `Die ${b} wird abgezogen, nicht addiert.`)];
      hints = [`Zieh zuerst ${b} auf beiden Seiten ab.`, `Dann mit ${n} malnehmen.`]; explain = `${tex(`\\dfrac{x}{${n}}=${r - b}\\ \\Rightarrow\\ x=${xx}`)}.`; }
    if (!gut(opts) || opts.some((o) => !Number.isInteger(o.num * 2))) continue;   // nur ganze und halbe Zahlen als Antworten – keine gerundeten Brüche
    return fertig('Löse die Gleichung.', formula, opts, hints, explain, kind);
  }
}

/* ───────────── Klasse 8 ───────────── */

/** Flächeninhalt von Dreieck, Parallelogramm und Trapez. */
export function genVieleck(lv = 3) {
  for (;;) {
    const kind = pick(tier(lv, ['parallelogramm', 'dreieck'], ['dreieck', 'parallelogramm'], ['trapez', 'dreieck', 'rueck'], ['trapez', 'rueck', 'zusammen'], ['zusammen', 'rueckt', 'trapez']));
    const g = ri(3, 12) * (lv >= 4 ? 1 : 1), h = ri(2, 9), a = ri(4, 12), c = ri(2, a - 1), A2 = (v, c2, w2) => E(v, c2, w2, 'cm²');
    let prompt, opts, hints, explain;
    if (kind === 'parallelogramm') { const s = h + ri(1, 3); prompt = `Ein Parallelogramm hat die Grundseite ${g} cm, die zugehörige Höhe ${h} cm und die schräge Seite ${s} cm. Wie groß ist sein Flächeninhalt?`;
      opts = [A2(g * h, true), A2(g * s, false, 'Gebraucht wird die <b>Höhe</b>, nicht die schräge Seite.'), A2((g * h) / 2, false, 'Die Hälfte gilt beim Dreieck. Ein Parallelogramm ist so groß wie ein Rechteck mit gleicher Grundseite und Höhe.'), A2(2 * (g + s), false, 'Das ist der Umfang.')];
      hints = [`${tex('A=g\\cdot h')}.`, 'Schneidet man ein Dreieck ab und setzt es an der anderen Seite an, entsteht ein Rechteck.']; explain = `${tex(`A=${g}\\cdot${h}=${g * h}`)} cm².`; if (g * s === 2 * (g + s) || (g * h) / 2 === 2 * (g + s)) continue; }
    else if (kind === 'dreieck') { if ((g * h) % 2) continue; prompt = `Ein Dreieck hat die Grundseite ${g} cm und die zugehörige Höhe ${h} cm. Wie groß ist sein Flächeninhalt?`;
      opts = [A2((g * h) / 2, true), A2(g * h, false, `Es fehlt der Faktor ${tex('\\tfrac12')}: Ein Dreieck ist ein halbes Parallelogramm.`), A2(g + h, false, 'Grundseite und Höhe werden malgenommen, nicht addiert.'), A2((g + h) / 2 === (g * h) / 2 ? g * h * 2 : (g * h) / 4, false, 'Nur einmal halbieren.')];
      hints = [`${tex('A=\\tfrac12\\cdot g\\cdot h')}.`, `${tex(`${g}\\cdot${h}=${g * h}`)}, davon die Hälfte.`]; explain = `${tex(`A=\\tfrac12\\cdot${g}\\cdot${h}=${(g * h) / 2}`)} cm².`; if (g + h === (g * h) / 2) continue; }
    else if (kind === 'trapez') { if (((a + c) * h) % 2) continue; prompt = `Ein Trapez hat die parallelen Seiten a = ${a} cm und c = ${c} cm und die Höhe ${h} cm. Wie groß ist sein Flächeninhalt?`;
      opts = [A2(((a + c) * h) / 2, true), A2((a + c) * h, false, `Es fehlt der Faktor ${tex('\\tfrac12')}.`), A2(a * h, false, 'Beide parallelen Seiten gehören in die Formel – ihr Mittelwert zählt.'), A2((a * c * h) / 2, false, 'Die parallelen Seiten werden addiert, nicht malgenommen.')];
      hints = [`${tex('A=\\tfrac12\\cdot(a+c)\\cdot h')}.`, `Mittelwert der parallelen Seiten: ${tex(`${ft((a + c) / 2)}`)} cm.`]; explain = `${tex(`A=\\tfrac12\\cdot(${a}+${c})\\cdot${h}=${ft(((a + c) * h) / 2)}`)} cm².`; if ((a * c * h) / 2 === a * h) continue; }
    else if (kind === 'rueck') { const A = (g * h) / 2; if ((g * h) % 2) continue; prompt = `Ein Dreieck hat den Flächeninhalt ${A} cm² und die Grundseite ${g} cm. Wie lang ist die zugehörige Höhe?`;
      opts = [E(h, true, undefined, 'cm'), E(A / g, false, `Beim Dreieck steckt der Faktor ${tex('\\tfrac12')} in der Formel – das Ergebnis ist doppelt so groß.`, 'cm'), E(A * g, false, 'Hier wird geteilt, nicht malgenommen.', 'cm'), E(h * 2, false, 'Einmal zu oft verdoppelt.', 'cm')];
      hints = [`${tex('A=\\tfrac12\\cdot g\\cdot h')}, also ${tex('h=\\dfrac{2A}{g}')}.`, `${tex(`2\\cdot${A}=${2 * A}`)}.`]; explain = `${tex(`h=\\dfrac{2\\cdot${A}}{${g}}=${h}`)} cm.`; }
    else if (kind === 'rueckt') { const A = ((a + c) * h) / 2; if (((a + c) * h) % 2) continue; prompt = `Ein Trapez hat den Flächeninhalt ${A} cm², die Höhe ${h} cm und eine parallele Seite a = ${a} cm. Wie lang ist die andere parallele Seite c?`;
      opts = [E(c, true, undefined, 'cm'), E(a + c, false, 'Das ist die Summe beider Seiten – zieh a noch ab.', 'cm'), E((2 * A) / h + a, false, 'a wird abgezogen, nicht addiert.', 'cm'), E(A / h, false, `Erst mit 2 malnehmen: ${tex('a+c=\\dfrac{2A}{h}')}.`, 'cm')];
      hints = [`${tex('a+c=\\dfrac{2A}{h}')}.`, `${tex(`\\dfrac{2\\cdot${ft(A)}}{${h}}=${a + c}`)}.`]; explain = `${tex(`c=${a + c}-${a}=${c}`)} cm.`; }
    else { const r = ri(3, 8), hd = ri(2, 6); if ((g * hd) % 2) continue; prompt = `Ein Haus-Giebel besteht aus einem Rechteck (${g} m breit, ${r} m hoch) und einem Dreieck darauf (Grundseite ${g} m, Höhe ${hd} m). Wie groß ist die ganze Fläche?`;
      opts = [E(g * r + (g * hd) / 2, true, undefined, 'm²'), E(g * r + g * hd, false, `Beim Dreieck fehlt der Faktor ${tex('\\tfrac12')}.`, 'm²'), E(g * r, false, 'Das ist nur das Rechteck.', 'm²'), E((g * (r + hd)) / 2, false, 'Nur das Dreieck wird halbiert, nicht das Rechteck.', 'm²')];
      opts.forEach((o) => { o.tex = o.tex.replace('\\text{m²}', '\\text{m}^2'); });
      hints = ['Zerlege die Figur: Rechteck plus Dreieck.', `Rechteck: ${g * r} m². Dreieck: ${(g * hd) / 2} m².`]; explain = `${tex(`${g * r}+${(g * hd) / 2}=${g * r + (g * hd) / 2}`)} m².`; if (r === hd) continue; }
    if (!gut(opts) || opts.some((o) => o.num <= 0)) continue;
    return fertig(prompt, undefined, opts, hints, explain, kind);
  }
}

/** Prismen und Zylinder: Volumen, Mantel, Oberfläche (Zylinder als Vielfache von π). */
export function genPrisma(lv = 3) {
  for (;;) {
    const kind = pick(tier(lv, ['prisma'], ['prisma', 'zylinder'], ['zylinder', 'dreiprisma', 'mantel'], ['mantel', 'rueck', 'dreiprisma'], ['oberflaeche', 'rueck', 'liter']));
    const G = ri(4, 30), h = ri(2, 12), r = ri(1, 6), P = (k, c2, w2, e) => ({ tex: `${k === 1 ? '' : ft(k)}\\pi\\,\\text{cm}^${e}`, num: k + 0.001, correct: c2, why: w2 });
    let prompt, opts, hints, explain;
    if (kind === 'prisma') { prompt = `Ein Prisma hat die Grundfläche ${G} cm² und die Höhe ${h} cm. Wie groß ist sein Volumen?`;
      opts = [E(G * h, true, undefined, 'cm³'), E((G * h) / 3, false, 'Das Drittel gilt für Pyramiden und Kegel, nicht für Prismen.', 'cm³'), E(G + h, false, 'Grundfläche und Höhe werden malgenommen.', 'cm³'), E(2 * G + h, false, 'Das hat mit der Oberfläche zu tun, nicht mit dem Volumen.', 'cm³')];
      hints = [`${tex('V=G\\cdot h')}.`, 'Die Grundfläche wird Schicht für Schicht gestapelt.']; explain = `${tex(`V=${G}\\cdot${h}=${G * h}`)} cm³.`; if ((G * h) % 3) continue; }
    else if (kind === 'dreiprisma') { const g = ri(3, 10), hd = ri(2, 8); if ((g * hd) % 2) continue; prompt = `Ein Prisma hat als Grundfläche ein Dreieck (Grundseite ${g} cm, Höhe ${hd} cm) und ist ${h} cm hoch. Wie groß ist sein Volumen?`;
      opts = [E(((g * hd) / 2) * h, true, undefined, 'cm³'), E(g * hd * h, false, `Die Dreiecksfläche ist ${tex('\\tfrac12\\cdot g\\cdot h')}.`, 'cm³'), E((g * hd * h) / 6, false, 'Das zusätzliche Drittel gilt nur für Pyramiden.', 'cm³'), E((g * hd) / 2 + h, false, 'Grundfläche mal Höhe, nicht plus.', 'cm³')];
      hints = ['Erst die Grundfläche (Dreieck) ausrechnen.', `${tex(`G=\\tfrac12\\cdot${g}\\cdot${hd}=${(g * hd) / 2}`)} cm².`]; explain = `${tex(`V=${(g * hd) / 2}\\cdot${h}=${((g * hd) / 2) * h}`)} cm³.`; if ((g * hd * h) % 6) continue; }
    else if (kind === 'zylinder') { prompt = `Ein Zylinder hat den Radius ${r} cm und die Höhe ${h} cm. Wie groß ist sein Volumen?`;
      opts = [P(r * r * h, true, undefined, 3), P(2 * r * h, false, `Das ist die Mantelfläche. Für das Volumen wird der Radius quadriert: ${tex('V=\\pi r^2h')}.`, 3), P(r * h, false, 'Der Radius wird quadriert.', 3), P(4 * r * r * h, false, 'Quadriert wird der Radius, nicht der Durchmesser.', 3)];
      hints = [`${tex('V=\\pi\\cdot r^2\\cdot h')}.`, `${tex(`${r}^2=${r * r}`)}.`]; explain = `${tex(`V=\\pi\\cdot${r * r}\\cdot${h}=${r * r * h}\\pi`)} cm³.`; if (r <= 2) continue; }
    else if (kind === 'mantel') { prompt = `Ein Zylinder hat den Radius ${r} cm und die Höhe ${h} cm. Wie groß ist seine Mantelfläche (das Etikett rundherum)?`;
      opts = [P(2 * r * h, true, undefined, 2), P(r * r * h, false, 'Das ist das Volumen.', 2), P(r * h, false, `Der Umfang des Kreises ist ${tex('2\\pi r')}.`, 2), P(2 * r * h + 2 * r * r, false, 'Das ist die ganze Oberfläche mit Boden und Deckel.', 2)];
      hints = ['Abgewickelt ist der Mantel ein Rechteck: Umfang mal Höhe.', `${tex('M=2\\pi r\\cdot h')}.`]; explain = `${tex(`M=2\\pi\\cdot${r}\\cdot${h}=${2 * r * h}\\pi`)} cm².`; if (r * r * h === 2 * r * h || r <= 1) continue; }
    else if (kind === 'oberflaeche') { prompt = `Ein Zylinder hat den Radius ${r} cm und die Höhe ${h} cm. Wie groß ist seine Oberfläche (mit Boden und Deckel)?`;
      opts = [P(2 * r * r + 2 * r * h, true, undefined, 2), P(2 * r * h, false, 'Das ist nur der Mantel – Boden und Deckel fehlen.', 2), P(r * r + 2 * r * h, false, 'Es gibt zwei Kreisflächen: Boden und Deckel.', 2), P(r * r * h, false, 'Das ist das Volumen.', 2)];
      hints = ['Zwei Kreise plus Mantel.', `${tex('O=2\\pi r^2+2\\pi r h')}.`]; explain = `${tex(`O=${2 * r * r}\\pi+${2 * r * h}\\pi=${2 * r * r + 2 * r * h}\\pi`)} cm².`; if (r * r * h === 2 * r * r + 2 * r * h || r <= 1) continue; }
    else if (kind === 'rueck') { const V = G * h; prompt = `Ein Prisma hat das Volumen ${V} cm³ und die Grundfläche ${G} cm². Wie hoch ist es?`;
      opts = [E(h, true, undefined, 'cm'), E(V - G, false, 'Hier wird geteilt, nicht abgezogen.', 'cm'), E(h * 3, false, 'Der Faktor 3 gehört zur Pyramide.', 'cm'), E(h + 1, false, `Probe: ${tex(`${G}\\cdot${h + 1}=${G * (h + 1)}`)} – das ist zu viel.`, 'cm')];
      hints = [`${tex('V=G\\cdot h')}, also ${tex('h=V:G')}.`, `${tex(`${V}:${G}`)}.`]; explain = `${tex(`h=${V}:${G}=${h}`)} cm.`; if (V - G === h * 3) continue; }
    else { const a = ri(2, 6), b = ri(2, 5), c = ri(1, 4), dm = a * b * c; prompt = `Ein Aquarium ist ${a} dm lang, ${b} dm breit und ${c} dm hoch. Wie viele Liter Wasser passen hinein?`;
      opts = [E(dm, true, undefined, 'l'), E(dm * 10, false, 'Ein Kubikdezimeter ist genau ein Liter.', 'l'), E(a + b + c, false, 'Länge, Breite und Höhe werden malgenommen.', 'l'), E(2 * (a * b + a * c + b * c), false, 'Das ist die Oberfläche.', 'l')];
      hints = ['Volumen = Länge mal Breite mal Höhe.', '1 dm³ = 1 Liter.']; explain = `${tex(`${a}\\cdot${b}\\cdot${c}=${dm}`)} dm³ = ${dm} Liter.`; if (2 * (a * b + a * c + b * c) === dm) continue; }
    if (!gut(opts) || opts.some((o) => o.num <= 0)) continue;
    return fertig(prompt, undefined, opts, hints, explain, kind);
  }
}

/* ───────────── Klasse 10 ───────────── */

/** Exponentialfunktionen: Werte, Wachstumsfaktor, Startwert, Verdopplung, Vergleich mit linear. */
export function genExpFunktion(lv = 3) {
  for (;;) {
    const kind = pick(tier(lv, ['wert'], ['wert', 'faktor'], ['faktor', 'start', 'prozent'], ['prozent', 'term', 'art'], ['term', 'art', 'halb']));
    const a = pick([2, 3, 5, 10, 20, 50, 100]), b = pick(tier(lv, [2, 3], [2, 3, 4], [2, 3, 1.5], [1.5, 0.5, 2], [0.5, 1.5, 1.2])), n = ri(2, 4);
    let prompt, formula, opts, hints, explain;
    if (kind === 'wert') { prompt = `Berechne ${tex(`f(${n})`)}.`; formula = `f(x)=${a}\\cdot${ft(b)}^x`; const v = a * b ** n;
      opts = [N(v, true), N(a * b * n, false, 'Die Hochzahl bedeutet mehrfach malnehmen, nicht mal n.'), N((a * b) ** n, false, 'Potenziert wird nur die Basis – der Startwert kommt danach als Faktor.'), N(a + b ** n, false, 'Der Startwert wird malgenommen, nicht addiert.')];
      hints = ['Erst die Potenz, dann mal den Startwert.', `${tex(`${ft(b)}^${n}=${ft(b ** n)}`)}.`]; explain = `${tex(`f(${n})=${a}\\cdot${ft(b ** n)}=${ft(v)}`)}.`; if (!Number.isInteger(v * 100)) continue; }
    else if (kind === 'faktor') { const y1 = a * b, y2 = a * b * b; prompt = `Eine Größe wächst exponentiell. Sie hat nacheinander die Werte ${fmt(a)}, ${fmt(y1)}, ${fmt(y2)}. Wie groß ist der Wachstumsfaktor?`;
      opts = [N(b, true), N(y1 - a, false, 'Bei exponentiellem Wachstum bleibt der <b>Quotient</b> gleich, nicht der Unterschied.'), N(a, false, 'Das ist der Startwert.'), N(1 / b, false, 'Geteilt wird der neue Wert durch den alten.')];
      hints = ['Teile einen Wert durch den vorherigen.', `${tex(`${ft(y1)}:${ft(a)}`)}.`]; explain = `${tex(`${ft(y1)}:${ft(a)}=${ft(b)}`)}.`; if (y1 - a === b || a === b) continue; }
    else if (kind === 'start') { prompt = 'Wie groß ist der Startwert (für x = 0)?'; formula = `f(x)=${a}\\cdot${ft(b)}^x`;
      opts = [N(a, true), N(b, false, 'Das ist der Wachstumsfaktor.'), N(a * b, false, `Das ist der Wert für x = 1. Für x = 0 gilt ${tex(`${ft(b)}^0=1`)}.`), N(0, false, `${tex(`${ft(b)}^0=1`)}, nicht 0.`)];
      hints = [`${tex('b^0=1')}.`, `${tex(`f(0)=${a}\\cdot 1`)}.`]; explain = `${tex(`f(0)=${a}\\cdot${ft(b)}^0=${a}`)}.`; if (a === b) continue; }
    else if (kind === 'prozent') { const p = pick([5, 10, 20, 25, 50]), ab = rand() < 0.5, q = ab ? 1 - p / 100 : 1 + p / 100; prompt = `Ein Bestand ${ab ? 'nimmt jedes Jahr um' : 'wächst jedes Jahr um'} ${p} % ${ab ? 'ab' : ''}. Mit welchem Faktor wird er jedes Jahr malgenommen?`.replace('  ', ' ');
      opts = [N(q, true), N(ab ? 1 + p / 100 : 1 - p / 100, false, ab ? 'Bei Abnahme ist der Faktor kleiner als 1.' : 'Bei Wachstum ist der Faktor größer als 1.'), N(p / 100, false, 'Das ist nur die Änderung – der bisherige Bestand (100 %) gehört dazu.'), N(p, false, 'Der Faktor ist eine Zahl nahe 1, nicht die Prozentzahl.')];
      hints = ['Der Bestand selbst sind 100 %.', ab ? `${tex(`100\\,\\%-${p}\\,\\%`)} als Dezimalzahl.` : `${tex(`100\\,\\%+${p}\\,\\%`)} als Dezimalzahl.`]; explain = `${tex(`${ab ? 100 - p : 100 + p}\\,\\%=${ft(q)}`)}.`; }
    else if (kind === 'term') { const p = pick([10, 20, 25, 50]), ab = rand() < 0.4, q = ab ? 1 - p / 100 : 1 + p / 100, s = a * 10; prompt = `Am Anfang sind es ${s}. Jede Stunde ${ab ? `werden es ${p} % weniger` : `kommen ${p} % dazu`}. Welcher Term beschreibt den Bestand nach x Stunden?`;
      const T = (t, c2, w2) => ({ tex: t, correct: c2, why: w2 });
      opts = [T(`${s}\\cdot${ft(q)}^x`, true), T(`${s}${ab ? '-' : '+'}${ft((s * p) / 100)}x`, false, 'Das wäre lineares Wachstum: jedes Mal derselbe Betrag. Prozentual heißt: jedes Mal derselbe Faktor.'), T(`${s}\\cdot${ft(p / 100)}^x`, false, 'Der Faktor ist 1 plus oder minus die Änderung, nicht nur die Änderung.'), T(`${ft(q)}\\cdot${s}^x`, false, 'Startwert und Faktor sind vertauscht.')];
      hints = ['Prozentuale Änderung heißt: immer mit demselben Faktor malnehmen.', `Faktor: ${tex(ft(q))}.`]; explain = `${tex(`f(x)=${s}\\cdot${ft(q)}^x`)}.`;
      if (!uniq(opts)) continue; return fertig(prompt, undefined, opts, hints, explain, kind); }
    else if (kind === 'art') { const lin = rand() < 0.5, d = ri(2, 9), w = lin ? [a, a + d, a + 2 * d, a + 3 * d] : [a, a * 2, a * 4, a * 8]; prompt = `Die Werte ${w.join(', ')} entstehen in gleichen Zeitschritten. Was für ein Wachstum ist das?`;
      const T = (t, key, w2) => ({ tex: `\\text{${t}}`, correct: key === (lin ? 'l' : 'e'), why: w2 });
      opts = [T('linear', 'l', 'Linear hieße: immer derselbe Betrag kommt dazu. Hier wächst der Zuwachs.'), T('exponentiell', 'e', 'Exponentiell hieße: immer mit demselben Faktor malnehmen. Hier kommt immer derselbe Betrag dazu.'), T('quadratisch', 'q', 'Prüfe die Unterschiede und die Quotienten der Werte.'), T('gar kein regelmäßiges', 'k', 'Doch: Prüfe die Unterschiede und die Quotienten.')];
      hints = ['Bilde die Unterschiede aufeinanderfolgender Werte.', 'Bilde die Quotienten aufeinanderfolgender Werte.']; explain = lin ? `Es kommt immer ${d} dazu: linear.` : 'Jeder Wert ist das Doppelte des vorherigen: exponentiell.';
      return fertig(prompt, undefined, opts, hints, explain, kind); }
    else { const T2 = pick([2, 3, 5, 8]), k = ri(2, 4), s = pick([80, 160, 400, 800]); prompt = `Ein Stoff zerfällt mit einer Halbwertszeit von ${T2} Tagen. Am Anfang sind ${s} mg vorhanden. Wie viel ist nach ${T2 * k} Tagen noch da?`;
      opts = [E(s / 2 ** k, true, undefined, 'mg'), E(s / (2 * k), false, 'Es wird nicht durch 2 mal Anzahl geteilt, sondern mehrmals nacheinander halbiert.', 'mg'), E(s / 2, false, 'Das gilt nach einer einzigen Halbwertszeit.', 'mg'), E(s / 2 ** (k + 1), false, 'Einmal zu oft halbiert.', 'mg')];
      hints = [`${T2 * k} Tage sind ${k} Halbwertszeiten.`, `Halbiere ${k}-mal.`]; explain = `${tex(`${s}\\cdot\\left(\\tfrac12\\right)^${k}=${ft(s / 2 ** k)}`)} mg.`; if (s / (2 * k) === s / 2 ** k || s / (2 * k) === s / 2 ** (k + 1)) continue; }
    if (!gut(opts)) continue;
    return fertig(prompt, formula, opts, hints, explain, kind);
  }
}

/** Sinusfunktion: Amplitude, Periode, Verschiebung, Werte. */
export function genSinusFkt(lv = 3) {
  for (;;) {
    const kind = pick(tier(lv, ['amplitude'], ['amplitude', 'wert'], ['periode', 'wert', 'bereich'], ['periode', 'bereich', 'mittel'], ['mittel', 'periodegrad', 'max']));
    const a = pick([2, 3, 4, 5, 1.5, 2.5]), b = pick([2, 4, 0.5, 3]), d = ri(1, 5);
    let prompt, formula, opts, hints, explain;
    if (kind === 'amplitude') { prompt = 'Wie groß ist die Amplitude?'; formula = `f(x)=${ft(a)}\\cdot\\sin(${b === 1 ? '' : ft(b)}x)`;
      opts = [N(a, true), N(b, false, 'Die Zahl vor dem x ändert die Periode, nicht die Amplitude.'), N(2 * a, false, 'Das ist der Abstand vom tiefsten zum höchsten Punkt. Die Amplitude ist die Hälfte davon.'), N(1, false, 'Das wäre die Amplitude von sin(x) ohne Faktor.')];
      hints = ['Die Amplitude ist der größte Ausschlag von der Mittellinie.', 'Sie steht als Faktor vor dem Sinus.']; explain = `Amplitude ${tex(ft(a))}: Die Werte schwanken zwischen ${tex(ft(-a))} und ${tex(ft(a))}.`; if (a === b || 2 * a === b) continue; }
    else if (kind === 'wert') { const [w, s] = pick([[30, 0.5], [90, 1], [150, 0.5], [270, -1], [210, -0.5], [0, 0], [180, 0]]); prompt = `Berechne den Funktionswert für x = ${w}°.`; formula = `f(x)=${ft(a)}\\cdot\\sin(x)`; if (s === 0) continue;
      opts = [N(a * s, true), N(-a * s, false, 'Achte auf das Vorzeichen: Zwischen 180° und 360° ist der Sinus negativ.'), N(a, false, s === 1 ? 'Prüfe das Vorzeichen.' : 'Der Sinus ist hier nicht 1.'), N(s, false, 'Der Faktor vor dem Sinus fehlt.')].filter((o, i, arr) => arr.findIndex((p) => p.num === o.num) === i);
      if (opts.length < 4) opts.push(N(a * s + (s > 0 ? a : -a), false, 'Der Faktor wird malgenommen, nicht addiert.'));
      hints = [`${tex(`\\sin ${w}^\\circ=${ft(s)}`)}.`, `Mal ${tex(ft(a))}.`]; explain = `${tex(`f(${w}^\\circ)=${ft(a)}\\cdot${kl(s)}=${ft(a * s)}`)}.`; }
    else if (kind === 'periode' || kind === 'periodegrad') { const grad = kind === 'periodegrad'; prompt = grad ? 'Wie lang ist eine Periode (in Grad)?' : `Wie lang ist eine Periode? (Antwort als Vielfaches von ${tex('\\pi')})`; formula = `f(x)=${ft(a)}\\cdot\\sin(${ft(b)}x)`;
      const P = (k, c2, w2) => (grad ? E(k * 180, c2, w2, '°') : { tex: `${k === 1 ? '' : ft(k)}\\pi`, num: k + 0.001, correct: c2, why: w2 });
      opts = [P(2 / b, true), P(2 * b, false, 'Ein größerer Faktor vor x staucht die Kurve: Die Periode wird kürzer, nicht länger.'), P(2, false, 'Das ist die Periode von sin(x) ohne Faktor.'), P(a === 2 / b || a === 2 * b || a === 2 ? a + 0.5 : a, false, 'Das ist die Amplitude.')];
      hints = [`Die Periode von ${tex('\\sin(bx)')} ist ${tex('\\dfrac{2\\pi}{b}')}.`, grad ? `${tex(`360^\\circ:${ft(b)}`)}.` : `${tex(`2\\pi:${ft(b)}`)}.`]; explain = grad ? `${tex(`360^\\circ:${ft(b)}=${ft(360 / b)}^\\circ`)}.` : `${tex(`\\dfrac{2\\pi}{${ft(b)}}=${ft(2 / b)}\\pi`)}.`; if (b === 1) continue; }
    else if (kind === 'bereich' || kind === 'max') { const mx = kind === 'max'; prompt = mx ? 'Wie groß ist der größte Funktionswert?' : 'Wie groß ist der kleinste Funktionswert?'; formula = `f(x)=${ft(a)}\\cdot\\sin(x)+${d}`;
      opts = mx ? [N(a + d, true), N(a, false, 'Die Kurve ist um d nach oben verschoben.'), N(d, false, 'Das ist die Mittellinie.'), N(d - a, false, 'Das ist der kleinste Wert.')] : [N(d - a, true), N(-a, false, 'Die Kurve ist um d nach oben verschoben.'), N(d, false, 'Das ist die Mittellinie.'), N(a + d, false, 'Das ist der größte Wert.')];
      hints = [`Der Sinus schwankt zwischen −1 und 1, also ${tex(`${ft(a)}\\cdot\\sin(x)`)} zwischen ${tex(ft(-a))} und ${tex(ft(a))}.`, `Dann wird alles um ${d} verschoben.`]; explain = `${tex(mx ? `${ft(a)}+${d}=${ft(a + d)}` : `${ft(-a)}+${d}=${ft(d - a)}`)}.`; if (a === d || d - a === -a) continue; }
    else { const lo = ri(1, 6), hi = lo + 2 * ri(1, 4); prompt = `Eine Sinuskurve schwankt zwischen dem kleinsten Wert ${lo} und dem größten Wert ${hi}. Wo liegt ihre Mittellinie?`;
      opts = [N((lo + hi) / 2, true), N((hi - lo) / 2, false, 'Das ist die Amplitude.'), N(hi - lo, false, 'Das ist der ganze Abstand zwischen tiefstem und höchstem Punkt.'), N(lo + hi, false, 'Die Summe wird noch halbiert.')];
      hints = ['Die Mittellinie liegt genau zwischen dem kleinsten und dem größten Wert.', `${tex(`\\dfrac{${lo}+${hi}}{2}`)}.`]; explain = `${tex(`y=\\dfrac{${lo}+${hi}}{2}=${(lo + hi) / 2}`)}. Die Amplitude ist ${(hi - lo) / 2}.`; if ((lo + hi) / 2 === hi - lo) continue; }
    if (!gut(opts)) continue;
    return fertig(prompt, formula, opts, hints, explain, kind);
  }
}

/** Alle Erzeuger dieser Datei – für Tests und Verzeichnisse. */
export const GENS7 = { genSchriftlich, genKoordinaten, genDiagramm, genProzentStart, genWinkelArt, genZufallStart, genRational, genGleichungKlammer, genVieleck, genPrisma, genExpFunktion, genSinusFkt };
for (const [fn, topic] of [[genSchriftlich, 'Schriftlich rechnen'], [genKoordinaten, 'Koordinatensystem'], [genDiagramm, 'Diagramme lesen'], [genProzentStart, 'Prozent: erste Schritte'], [genWinkelArt, 'Winkel'], [genZufallStart, 'Zufall'],
  [genRational, 'Rationale Zahlen'], [genGleichungKlammer, 'Gleichungen mit Klammern'], [genVieleck, 'Dreieck, Parallelogramm, Trapez'], [genPrisma, 'Prisma und Zylinder'], [genExpFunktion, 'Exponentialfunktionen'], [genSinusFkt, 'Sinusfunktion']]) fn.topic = topic;
