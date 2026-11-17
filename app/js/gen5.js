// Aufgaben-Erzeuger, Teil 5: begrenztes und logistisches Wachstum, Ebenen genauer (Parameterform, Normalenform, Spurpunkte).
// Gleiche Regeln wie in gen.js: Stufe lv (1–5), Ablenker = typische Fehler mit Diagnose, Rechen-Felder für tests/.
// Jede Art hat fünf echte Stufen – von „eine Zahl ablesen“ bis zu mehrschrittigen Aufgaben mit krummen Ergebnissen,
// jeweils mit dem vollständigen Rechenweg in hints und explain.
import { ri, pick, shuffle, ft, fmt } from './math.js';
import { tex } from './ui.js';
import { tier, par, vecTex, uniq, uniqNum } from './gen.js';
import { fracTex } from './gen3.js';

const dfrac = (a, b) => `\\dfrac{${a}}{${b}}`;
const PT = (name, v) => `${name}(${v.map((c) => ft(c)).join('\\mid ')})`;
/** Exponent „k·t“ ohne überflüssige 1: e^{-t} statt e^{-1t}. */
const kt = (k) => `${k === 1 ? '' : ft(k)}t`;
const N = (num, correct, why, digits = 2) => ({ tex: ft(num, digits), num, correct, why });
const sgn = (v) => (v < 0 ? `-${ft(-v)}` : `+${ft(v)}`);
const K = (a) => (a === 1 ? '' : a === -1 ? '-' : ft(a));
const ggt = (a, b) => (b ? ggt(b, a % b) : Math.abs(a));
const tf = (n, d) => fracTex(n, d).replace('\\dfrac', '\\tfrac');
const plus = (teile) => teile.join('+').replace(/\+-/g, '-');
/** Liegen alle Zahlen-Antworten deutlich auseinander (auch nach dem Runden)? */
const weit = (opts, eps = 0.02) => opts.every((a, i) => opts.every((b, j) => i === j || Math.abs(a.num - b.num) > eps));

/* ───────────── Begrenztes Wachstum ───────────── */

const SACHE = [
  ['Eine Pflanze wächst.', 'die Höhe in cm', 'Wochen'],
  ['Jemand lernt Vokabeln.', 'die Zahl der gelernten Vokabeln', 'Tagen'],
  ['Ein Medikament wird als Tropf gegeben.', 'die Menge des Wirkstoffs im Blut in mg', 'Stunden'],
  ['Ein Gerücht verbreitet sich in einem Ort.', 'die Zahl der Personen, die es kennen,', 'Tagen'],
  ['Ein heißes Getränk kühlt ab.', 'die Temperatur in °C', 'Minuten'],
];

/** Begrenztes Wachstum – Grenze oder Anfangswert: Stufe 1–2 ablesen, 3 ausgeklammerte oder fallende Form, 4 aus der Änderungsgleichung, 5 aus Messwerten mit e-Funktion zurückrechnen. */
export function genBegrenzt(lv = 3) {
  for (;;) {
    const e0 = tex('e^{0}=1');
    if (lv >= 5) {
      const k = pick([0.05, 0.08, 0.1, 0.12, 0.15]), t1 = pick([4, 5, 8, 10]), q = Math.exp(-k * t1), ask = pick(['grenze', 'start']), ek = `e^{-${kt(k)}}`;
      if (ask === 'start') {                                // Abkühlung: Raumtemperatur und ein Messwert bekannt, Anfang gesucht
        const S = pick([18, 20, 21, 22, 24]), y1 = pick([40, 45, 50, 60]), a = (y1 - S) / q, f0 = S + a;
        const opts = [N(f0, true), N(S + (y1 - S) * q, false, `Vorzeichen im Exponenten: Beim Auflösen nach ${tex('a')} wird durch ${tex(`e^{-${ft(k * t1)}}`)} geteilt, also mit ${tex(`e^{${ft(k * t1)}}`)} multipliziert.`),
          N(y1 / q, false, `Erst die Raumtemperatur abziehen: Nur der Abstand zur Grenze, ${tex(`${y1}-${S}`)}, fällt exponentiell.`), N(a, false, `Das ist nur ${tex('a')}, der Abstand zur Grenze am Anfang. Die Grenze ${S} kommt noch dazu.`)];
        if (!weit(opts, 0.11) || f0 > 99) continue;
        return { prompt: `Ein heißes Getränk kühlt in einem Raum mit ${S} °C ab. Für die Temperatur gilt ${tex(`f(t)=${S}+a\\,${ek}`)} (${tex('t')} in Minuten). Nach ${t1} Minuten werden ${y1} °C gemessen. Wie heiß war das Getränk am Anfang (auf zwei Nachkommastellen)?`,
          formula: `f(t)=${S}+a\\,${ek}\\qquad f(${t1})=${y1}`, options: shuffle(opts),
          hints: [`Setze den Messwert ein: ${tex(`${S}+a\\,e^{-${ft(k)}\\cdot ${t1}}=${y1}`)}.`, `Nach ${tex('a')} auflösen: ${tex(`a\\,e^{-${ft(k * t1)}}=${y1}-${S}=${y1 - S}`)}, also ${tex(`a=${y1 - S}\\cdot e^{${ft(k * t1)}}\\approx${ft(a, 2)}`)}.`, `Der Anfangswert ist ${tex(`f(0)=${S}+a`)}, denn ${e0}.`],
          explain: `${tex(`${S}+a\\,e^{-${ft(k * t1)}}=${y1}\\ \\Rightarrow\\ a=${y1 - S}\\cdot e^{${ft(k * t1)}}\\approx${ft(a, 2)}`)}. Anfangswert: ${tex(`f(0)=${S}+${ft(a, 2)}=${ft(f0, 2)}`)}.`, f: (t) => S + a * Math.exp(-k * t), ask, S, f0, mess: [t1, y1], k };
      }
      const f0 = pick([8, 10, 12, 15, 20]), y1 = f0 + pick([10, 14, 18, 25]), S = (y1 - f0 * q) / (1 - q), [satz, was, zeit] = pick(SACHE.slice(0, 2));
      const opts = [N(S, true), N((y1 - f0) / (1 - q), false, `Beim Ausmultiplizieren fehlt der Faktor ${tex('q')}: Es heißt ${tex(`+${f0}\\cdot q`)}, nicht ${tex(`+${f0}`)}.`), N(y1 + (y1 - f0), false, `${ft(y1 + (y1 - f0))} wäre der Wert nach ${2 * t1} ${zeit}, wenn es gleichmäßig weiterginge – eine Grenze ist das nicht. Begrenztes Wachstum wird immer langsamer.`), N((y1 - f0 * q) / (1 + q), false, `Vorzeichen: ${tex('S-S\\cdot q=S\\cdot(1-q)')}, nicht ${tex('1+q')}.`)];
      if (!weit(opts, 0.11) || S < y1 + 3) continue;
      return { prompt: `${satz} ${tex('f(t)')} ist ${was} nach ${tex('t')} ${zeit}; es gilt ${tex(`f(t)=S-(S-${f0})\\,${ek}`)}. Am Anfang ist der Wert ${f0}, nach ${t1} ${zeit} ist er ${y1}. Welcher Grenze ${tex('S')} nähert sich ${tex('f')} (auf zwei Nachkommastellen)?`,
        formula: `f(t)=S-(S-${f0})\\,${ek}\\qquad f(${t1})=${y1}`, options: shuffle(opts),
        hints: [`Setze den Messwert ein und kürze ab mit ${tex(`q=e^{-${ft(k)}\\cdot ${t1}}=e^{-${ft(k * t1)}}\\approx${ft(q, 4)}`)}: ${tex(`S-(S-${f0})\\cdot q=${y1}`)}.`, `Klammer auflösen und ${tex('S')} ausklammern: ${tex(`S\\cdot(1-q)+${f0}\\,q=${y1}`)}.`, `Auflösen: ${tex(`S=${dfrac(`${y1}-${f0}\\,q`, '1-q')}`)}.`],
        explain: `Mit ${tex(`q=e^{-${ft(k * t1)}}\\approx${ft(q, 4)}`)}: ${tex(`S-(S-${f0})\\,q=${y1}\\ \\Rightarrow\\ S\\,(1-q)=${y1}-${f0}\\,q`)}, also ${tex(`S=${dfrac(`${y1}-${f0}\\cdot${ft(q, 4)}`, `1-${ft(q, 4)}`)}\\approx${ft(S, 2)}`)}.`, f: (t) => S - (S - f0) * Math.exp(-k * t), ask, S, f0, mess: [t1, y1], k };
    }
    let [satz, was, zeit] = SACHE[Math.max(1, lv) - 1];
    const S = pick(tier(lv, [20, 50, 80, 100], [40, 60, 90, 120], [70, 150, 200, 240], [60, 80, 120, 150]));
    const k = pick(tier(lv, [0.5, 1], [0.2, 0.5], [0.1, 0.25], [0.05, 0.2, 0.4]));
    const ask = lv === 1 ? 'start' : lv === 2 ? 'grenze' : pick(['grenze', 'start']), ek = `e^{-${kt(k)}}`, eInf = `${tex(ek)} geht für große ${tex('t')} gegen 0`;
    if (lv === 4) {                                          // aus der Änderungsgleichung f' = c − k·f
      const f0 = S * pick([0.1, 0.25, 0.5]), c = k * S, r0 = k * (S - f0), f = (t) => S - (S - f0) * Math.exp(-k * t);
      if (ask === 'grenze') {
        const opts = [N(S, true), N(c, false, `Das ist nur die Zahl in der Gleichung. Die Grenze ist erreicht, wenn ${tex("f'(t)=0")} wird.`), N(f0, false, 'Das ist der Anfangswert. Gefragt ist der Wert auf lange Sicht.'), N(c * k, false, `Aus ${tex(`${ft(c)}-${ft(k)}\\cdot S=0`)} folgt eine Division durch ${tex(ft(k))}, keine Multiplikation.`)];
        if (!weit(opts, 0.11)) continue;
        return { prompt: `${satz} ${tex('f(t)')} ist ${was} nach ${tex('t')} ${zeit}. Für die Änderungsrate gilt die Gleichung unten, am Anfang ist ${tex(`f(0)=${ft(f0)}`)}. Welchem Wert nähert sich ${tex('f')} auf lange Sicht?`,
          formula: `f'(t)=${ft(c)}-${ft(k)}\\cdot f(t)`, options: shuffle(opts),
          hints: [`An der Grenze ändert sich der Bestand nicht mehr: ${tex("f'(t)=0")}.`, `${tex(`${ft(c)}-${ft(k)}\\cdot S=0`)} nach ${tex('S')} auflösen.`, `Oder ${tex(ft(k))} ausklammern: ${tex(`f'(t)=${ft(k)}\\cdot\\bigl(${ft(S)}-f(t)\\bigr)`)} – das ist begrenztes Wachstum mit der Grenze in der Klammer.`],
          explain: `${tex(`f'(t)=0\\ \\Rightarrow\\ ${ft(c)}-${ft(k)}\\cdot S=0\\ \\Rightarrow\\ S=${dfrac(ft(c), ft(k))}=${ft(S)}`)}.`, f, ask, S, f0 };
      }
      const opts = [N(f0, true), N(S, false, 'Das ist die Grenze für große Zeiten. Gefragt ist der Anfang.'), N(r0 / k, false, `Das ist der Abstand zur Grenze am Anfang. Er muss noch von ${ft(S)} abgezogen werden.`), N(S - r0 * k, false, `Aus ${tex(`${ft(r0)}=${ft(k)}\\cdot(${S}-f(0))`)} folgt eine Division durch ${tex(ft(k))}.`)];
      if (!weit(opts, 0.11) || opts.some((o) => o.num < 0) || Math.abs(r0 * 100 - Math.round(r0 * 100)) > 1e-9) continue;
      return { prompt: `${satz} ${tex('f(t)')} ist ${was} nach ${tex('t')} ${zeit}. Es gilt die Gleichung unten, und ganz am Anfang beträgt die Änderungsrate ${tex(`f'(0)=${ft(r0)}`)}. Wie groß ist der Anfangswert ${tex('f(0)')}?`,
        formula: `f'(t)=${ft(k)}\\cdot\\bigl(${S}-f(t)\\bigr)`, options: shuffle(opts),
        hints: [`Setze ${tex('t=0')} in die Gleichung ein: ${tex(`${ft(r0)}=${ft(k)}\\cdot\\bigl(${S}-f(0)\\bigr)`)}.`, `Teile durch ${tex(ft(k))}: ${tex(`${S}-f(0)=${dfrac(ft(r0), ft(k))}=${ft(r0 / k)}`)}.`, `Das ist der Abstand zur Grenze. Der Anfangswert ist ${tex(`${S}-${ft(r0 / k)}`)}.`],
        explain: `${tex(`${ft(r0)}=${ft(k)}\\cdot(${S}-f(0))\\ \\Rightarrow\\ ${S}-f(0)=${ft(r0 / k)}\\ \\Rightarrow\\ f(0)=${ft(f0)}`)}.`, f, ask, S, f0 };
    }
    let a, f0, formula, f, fallend = false, klammer = false;
    if (lv === 3 && ri(0, 1)) {                              // fallend: nähert sich der Grenze von oben
      a = pick([40, 50, 60, 70]); f0 = S + a; fallend = true;
      [satz, was, zeit] = ['Ein Backofen wird heruntergeschaltet und kühlt auf die neue Temperatur ab.', 'die Temperatur in °C', 'Minuten'];   // fallend passt nicht zum Tropf
      formula = `f(t)=${S}+${a}\\,${ek}`; f = (t) => S + a * Math.exp(-k * t);
    } else if (lv === 3) {                                   // ausgeklammerte Form
      const c = pick([0.5, 0.6, 0.8]); a = S * c; f0 = S - a; klammer = true;
      formula = `f(t)=${S}\\cdot\\left(1-${ft(c)}\\,${ek}\\right)`; f = (t) => S * (1 - c * Math.exp(-k * t));
    } else {
      f0 = S * pick([0.2, 0.4, 0.5]); a = S - f0;
      formula = `f(t)=${S}-${ft(a)}\\,${ek}`; f = (t) => S - a * Math.exp(-k * t);
    }
    const opts = ask === 'grenze'
      ? [N(S, true), N(f0, false, `Das ist der Anfangswert ${tex('f(0)')}. Gefragt ist der Wert auf lange Sicht.`),
        N(a, false, `Das ist der Abstand zwischen Anfangswert und Grenze. Für große ${tex('t')} verschwindet dieser Teil.`),
        N(0, false, `Nur der Teil mit e geht gegen 0 – die ${S} bleibt stehen.`)]
      : [N(f0, true), N(S, false, 'Das ist die Grenze für große Zeiten. Gefragt ist der Anfang.'),
        N(a, false, `Setze ${tex('t=0')} ein: ${e0}, also bleibt nicht nur dieser Faktor übrig.`),
        N(fallend ? S - a : S + a, false, `Achte auf das Vorzeichen vor dem Teil mit e: Mit ${e0} wird ${fallend ? 'addiert' : 'abgezogen'}.`)];
    if (!uniqNum(opts) || opts.some((o) => o.num < 0)) continue;
    const ausm = klammer ? `Ausmultipliziert: ${tex(`f(t)=${S}-${ft(a)}\\,${ek}`)}. ` : '', rech = fallend ? `${S}+${a}\\cdot 1` : `${S}-${ft(a)}\\cdot 1`;
    return {
      prompt: `${satz} ${tex('f(t)')} ist ${was} nach ${tex('t')} ${zeit}. ${ask === 'grenze' ? `Welchem Wert nähert sich ${tex('f')} auf lange Sicht?` : `Wie groß ist der Anfangswert ${tex('f(0)')}?`}`,
      formula, options: shuffle(opts),
      hints: ask === 'grenze' ? [...(klammer ? [`Multipliziere die Klammer aus: ${tex(`f(t)=${S}-${ft(a)}\\,${ek}`)}.`] : []), `Was passiert mit ${tex(ek)}, wenn ${tex('t')} sehr groß wird?`, `${eInf}. Was bleibt übrig?`]
        : [`Setze ${tex('t=0')} ein.`, `${e0}. Jetzt nur noch ausrechnen${lv >= 3 ? `: ${tex(klammer ? `${S}\\cdot(1-${ft(a / S)})` : rech)}` : ''}.`],
      explain: ask === 'grenze' ? `${ausm}${eInf}. Übrig bleibt die Grenze ${tex(`S=${S}`)}.` : lv <= 1 ? `${tex(`f(0)=${ft(f0)}`)}, denn ${e0}.` : `${e0}, also ${tex(`f(0)=${klammer ? `${S}\\cdot(1-${ft(a / S)})` : rech}=${ft(f0)}`)}.`,
      f, ask, S, f0,
    };
  }
}

/** Änderungsrate beim begrenzten Wachstum: Stufe 1 in f' = k·(S − f) einsetzen, 2 k bestimmen, 3–4 f'(0) aus der Funktionsgleichung (Kettenregel), 5 Rate bei einem Bestand aus der Funktion oder k aus zwei Messwerten (Logarithmus). */
export function genBegrenztRate(lv = 3) {
  for (;;) {
    const dgl = tex("f'(t)=k\\cdot(S-f(t))");
    if (lv <= 2) {
      const k = pick(lv === 1 ? [0.5, 0.1] : [0.05, 0.2, 0.25, 0.4]), S = pick(lv === 1 ? [40, 60, 100] : [100, 150, 200, 360]), diff = pick(lv === 1 ? [10, 20, 30] : [40, 80, 120]), B = S - diff, r = k * diff;
      if (B <= 0) continue;
      if (lv === 1) {
        const opts = [N(r, true), N(k * B, false, `Das wäre exponentielles Wachstum. Hier zählt der Abstand zur Grenze: ${tex(`${S}-${B}`)}.`),
          N(k * S, false, `Eingesetzt wird nicht die Grenze allein, sondern der Abstand zur Grenze ${tex(`${S}-${B}`)}.`), N(diff, false, `Der Faktor ${tex(`k=${ft(k)}`)} fehlt.`)];
        if (!weit(opts, 0.11)) continue;
        return { prompt: `Für begrenztes Wachstum gilt ${dgl}. Wie groß ist die Änderungsrate in dem Moment, in dem der Bestand ${B} beträgt?`, formula: `k=${ft(k)},\\quad S=${S}`, options: shuffle(opts),
          hints: ['Die Änderungsrate hängt vom Abstand zur Grenze ab.', `Abstand zur Grenze: ${tex(`${S}-${B}=${diff}`)}. Jetzt mit ${tex('k')} malnehmen.`],
          explain: `${tex(`f'=${ft(k)}\\cdot(${S}-${B})=${ft(r)}`)}.`, ask: 'dgl', S, k, B };
      }
      const opts = [N(k, true, undefined, 3), N(r / B, false, `Geteilt wird durch den Abstand zur Grenze ${tex(`${S}-${B}`)}, nicht durch den Bestand.`, 3),
        N(r / S, false, `Geteilt wird durch den Abstand zur Grenze ${tex(`${S}-${B}`)}, nicht durch die Grenze.`, 3), N(diff / r, false, 'Kehrwert: Änderungsrate geteilt durch Abstand, nicht umgekehrt.', 3)];
      if (!weit(opts, 0.006) || !uniq(opts)) continue;
      return { prompt: `Für begrenztes Wachstum gilt ${dgl}. Bei einem Bestand von ${B} beträgt die Änderungsrate ${tex(ft(r))}. Bestimme ${tex('k')}.`, formula: `S=${S}`, options: shuffle(opts),
        hints: [`Setze ein: ${tex(`${ft(r)}=k\\cdot(${S}-${B})`)}.`, `Der Abstand zur Grenze ist ${tex(`${S}-${B}=${diff}`)}.`, 'Teile die Änderungsrate durch diesen Abstand.'],
        explain: `${tex(`${ft(r)}=k\\cdot(${S}-${B})`)}, also ${tex(`k=${dfrac(ft(r), `${S}-${B}`)}=${dfrac(ft(r), diff)}=${ft(k)}`)}.`, ask: 'k', S, k, B, r };
    }
    if (lv <= 4) {
      const k = pick(lv === 3 ? [0.2, 0.25, 0.05, 0.5] : [0.15, 0.08, 0.12, 0.35]), S = pick(lv === 3 ? [50, 80, 120, 160, 200] : [150, 240, 300, 450]), ek = `e^{-${kt(k)}}`;
      const art = lv === 3 ? 'minus' : pick(['klammer', 'fallend']), c = pick([0.4, 0.6, 0.8]), a = art === 'klammer' ? S * c : art === 'fallend' ? pick([35, 45, 65]) : S - pick([10, 20, 30]);
      const vz = art === 'fallend' ? 1 : -1, r = -vz * a * k, f = (t) => S + vz * a * Math.exp(-k * t);         // f = S ∓ a·e^(−kt)
      const formula = art === 'klammer' ? `f(t)=${S}\\cdot\\left(1-${ft(c)}\\,${ek}\\right)` : `f(t)=${S}${vz < 0 ? '-' : '+'}${ft(a)}\\,${ek}`;
      const opts = [N(r, true), N(-r, false, art === 'fallend' ? `Vorzeichen: Die innere Ableitung ist ${tex(`-${ft(k)}`)} – der Bestand fällt, die Änderungsrate ist negativ.` : `Vorzeichen: Die Ableitung von ${tex(`-${ft(a)}\\,${ek}`)} ist positiv – Minus mal Minus.`),
        N(-vz * a, false, `Die innere Ableitung fehlt: Beim Ableiten von ${tex(ek)} kommt der Faktor ${tex(`-${ft(k)}`)} dazu (Kettenregel).`), N(S * k, false, `Abgeleitet wird der Teil mit e. Die Grenze ${S} fällt als Konstante weg.`)];
      if (!weit(opts, 0.11)) continue;
      const abl = `${tex(`f'(t)=${vz < 0 ? '-' : ''}${ft(a)}\\cdot(-${ft(k)})\\,${ek}=${ft(r)}\\,${ek}`)}`;
      return { prompt: lv === 3 ? `Wie schnell wächst der Bestand ganz am Anfang? Berechne ${tex("f'(0)")}.` : `Wie groß ist die Änderungsrate ganz am Anfang? Berechne ${tex("f'(0)")}.`, formula, options: shuffle(opts),
        hints: [...(art === 'klammer' ? [`Multipliziere zuerst die Klammer aus: ${tex(`f(t)=${S}-${ft(a)}\\,${ek}`)}.`] : []), 'Leite ab: Die Konstante fällt weg, beim Teil mit e hilft die Kettenregel.',
          `Äußere Ableitung ${tex(ek)}, innere Ableitung ${tex(`-${ft(k)}`)}: ${abl}.`, `Jetzt ${tex('t=0')} einsetzen: ${tex('e^{0}=1')}.`],
        explain: `${art === 'klammer' ? `Ausmultipliziert: ${tex(`f(t)=${S}-${ft(a)}\\,${ek}`)}. ` : ''}${abl}, also ${tex(`f'(0)=${ft(r)}`)}.`, f, ask: 'f0', S, k };
    }
    if (ri(0, 1)) {                                          // Rate in dem Moment, in dem ein bestimmter Bestand erreicht ist
      const k = pick([0.15, 0.35, 0.08, 0.45]), S = pick([200, 360, 500, 640]), f0 = S * pick([0.1, 0.2, 0.25]), a = S - f0, pr = pick([60, 75, 80, 90]), B = (S * pr) / 100, r = k * (S - B), ek = `e^{-${kt(k)}}`, t0 = Math.log(a / (S - B)) / k;
      const opts = [N(r, true), N(k * B, false, `Das wäre exponentielles Wachstum. Beim begrenzten Wachstum zählt der Abstand zur Grenze, ${tex(`${S}-${ft(B)}`)}.`), N(a * k, false, `Das ist ${tex("f'(0)")}, die Änderungsrate ganz am Anfang.`), N(S - B, false, `Das ist ${tex(`${ft(a)}\\,${ek}`)} zu diesem Zeitpunkt. Für die Ableitung kommt noch der Faktor ${tex(ft(k))} dazu.`)];
      if (!weit(opts, 0.11)) continue;
      return { prompt: `Der Bestand wächst nach der Gleichung unten. Wie groß ist die Änderungsrate in dem Moment, in dem ${pr} % der Sättigungsgrenze erreicht sind?`, formula: `f(t)=${S}-${ft(a)}\\,${ek}`, options: shuffle(opts),
        hints: [`Die Grenze ist ${tex(`S=${S}`)}; ${pr} % davon sind ${tex(`${ft(pr / 100)}\\cdot ${S}=${ft(B)}`)}.`, `Zeitpunkt: ${tex(`${S}-${ft(a)}\\,${ek}=${ft(B)}`)}, also ${tex(`${ft(a)}\\,${ek}=${ft(S - B)}`)}. (Logarithmieren gäbe ${tex(`t=${dfrac(`\\ln(${ft(a)}/${ft(S - B)})`, ft(k))}\\approx${ft(t0, 2)}`)}.)`,
          `Ableitung mit der Kettenregel: ${tex(`f'(t)=${ft(a)}\\cdot ${ft(k)}\\,${ek}=${ft(k)}\\cdot\\bigl(${ft(a)}\\,${ek}\\bigr)`)}.`, `Den Wert der Klammer kennst du schon: ${tex(ft(S - B))}.`],
        explain: `${pr} % von ${S} sind ${tex(ft(B))}. Dort ist ${tex(`${ft(a)}\\,${ek}=${S}-${ft(B)}=${ft(S - B)}`)}. Mit der Kettenregel: ${tex(`f'(t)=${ft(k)}\\cdot ${ft(a)}\\,${ek}=${ft(k)}\\cdot ${ft(S - B)}=${ft(r)}`)} – das ist ${tex("f'=k\\cdot(S-f)")}.`, f: (t) => S - a * Math.exp(-k * t), ask: 'dgl', S, k, B, t0 };
    }
    const S = pick([200, 300, 500, 800]), f0 = S * pick([0.1, 0.2, 0.25]), a = S - f0, T = pick([3, 4, 5, 6, 8]), B = S * pick([0.5, 0.6, 0.7, 0.75]), k = Math.log(a / (S - B)) / T, r = k * (S - B);
    const opts = [N(k, true, undefined, 3), N(Math.log(B / f0) / T, false, `Das wäre exponentielles Wachstum ${tex(`f(t)=${ft(f0)}\\,e^{kt}`)}. Hier fällt der Abstand zur Grenze exponentiell.`, 3), N(k * T, false, `Das ist ${tex(`k\\cdot ${T}`)} – es fehlt das Teilen durch ${T}.`, 3), N((B - f0) / (T * a), false, 'So wäre es bei gleichmäßigem (linearem) Wachstum. Hier braucht man den Logarithmus.', 3)];
    if (!weit(opts, 0.006) || !uniq(opts)) continue;
    return { prompt: `Ein Bestand wächst begrenzt: Am Anfang sind es ${fmt(f0)}, die Grenze liegt bei ${S}. Nach ${T} Tagen sind es ${fmt(B)}. Bestimme die Wachstumskonstante ${tex('k')} (auf drei Nachkommastellen).`, formula: `f(t)=${S}-${ft(a)}\\,e^{-kt}\\qquad f(${T})=${ft(B)}`, options: shuffle(opts),
      hints: [`Setze den Messwert ein: ${tex(`${S}-${ft(a)}\\,e^{-${T}k}=${ft(B)}`)}.`, `Umstellen: ${tex(`${ft(a)}\\,e^{-${T}k}=${ft(S - B)}`)}, also ${tex(`e^{-${T}k}=${dfrac(ft(S - B), ft(a))}`)}.`, `Logarithmieren: ${tex(`-${T}k=\\ln\\left(${dfrac(ft(S - B), ft(a))}\\right)`)}.`, `Durch ${tex(`-${T}`)} teilen.`],
      explain: `${tex(`${ft(a)}\\,e^{-${T}k}=${S}-${ft(B)}=${ft(S - B)}`)}, also ${tex(`e^{-${T}k}=${dfrac(ft(S - B), ft(a))}`)}. Logarithmieren: ${tex(`k=-${dfrac(1, T)}\\cdot\\ln\\left(${dfrac(ft(S - B), ft(a))}\\right)\\approx${ft(k, 3)}`)}.`, f: (t) => S - a * Math.exp(-k * t), ask: 'k', S, k, B, r, T };
  }
}

/* ───────────── Logistisches Wachstum ───────────── */

/** Logistisches Wachstum: Stufe 1 Grenze, 2 Anfangswert, 3 Bestand am Wendepunkt, 4 Zeitpunkt des stärksten Wachstums (ln), 5 dasselbe aus Änderungsgleichung und Anfangswert (k und a erst bestimmen). */
export function genLogistisch(lv = 3) {
  for (;;) {
    const ask = tier(lv, 'grenze', 'start', 'haelfte', 'tw', 'tw');
    const T = (z, n, num, correct, why) => ({ tex: `t=${dfrac(z, n)}\\approx${ft(num, 2)}`, num, correct, why });
    if (lv >= 5) {
      const S = pick([400, 500, 800, 1200]), m = pick([16, 25, 32, 40, 50]), k = pick([0.2, 0.4, 0.5, 0.8]), a = S / m - 1, c = k / S, tw = Math.log(a) / k;
      if (Math.abs(a * 100 - Math.round(a * 100)) > 1e-9 || a < 4 || Math.abs(c * 1e6 - Math.round(c * 1e6)) > 1e-9) continue;
      const opts = [T(`\\ln ${ft(a)}`, ft(k), tw, true), T(`\\ln ${ft(S / m)}`, ft(k), Math.log(S / m) / k, false, `${tex(`a=${dfrac(S, m)}-1`)} – die 1 aus dem Nenner fehlt.`), T(`\\ln ${S}`, ft(k), Math.log(S) / k, false, `Entscheidend ist ${tex('a')} aus dem Nenner, nicht die Grenze ${S}.`), T(ft(a), ft(k), a / k, false, `Beim Auflösen von ${tex(`${ft(a)}\\,e^{-${kt(k)}}=1`)} braucht man den Logarithmus.`)];
      if (!weit(opts, 0.11) || !uniq(opts)) continue;
      return { prompt: `Ein Bestand wächst logistisch: Für die Änderungsrate gilt die Gleichung unten, am Anfang ist ${tex(`f(0)=${m}`)}. Zu welchem Zeitpunkt wächst der Bestand am schnellsten?`, formula: `f'(t)=${ft(c, 6)}\\cdot f(t)\\cdot\\bigl(${S}-f(t)\\bigr)`, options: shuffle(opts),
        hints: [`Die Gleichung hat die Form ${tex("f'=c\\cdot f\\cdot(S-f)")}: Die Grenze ist ${tex(`S=${S}`)}, und es gilt ${tex(`k=c\\cdot S=${ft(c, 6)}\\cdot ${S}=${ft(k)}`)}.`, `Lösung: ${tex(`f(t)=${dfrac(S, `1+a\\,e^{-${kt(k)}}`)}`)}. Aus ${tex(`f(0)=${dfrac(S, '1+a')}=${m}`)} folgt ${tex(`a=${dfrac(S, m)}-1=${ft(a)}`)}.`,
          `Am schnellsten wächst der Bestand bei der halben Grenze ${tex(ft(S / 2))}: Dann ist der Nenner 2, also ${tex(`${ft(a)}\\,e^{-${kt(k)}}=1`)}.`, `Logarithmieren: ${tex(`-${kt(k)}=-\\ln ${ft(a)}`)}.`],
        explain: `${tex(`k=${ft(c, 6)}\\cdot ${S}=${ft(k)}`)} und ${tex(`a=${dfrac(S, m)}-1=${ft(a)}`)}. Stärkstes Wachstum bei ${tex(`f(t)=${ft(S / 2)}`)}: ${tex(`${ft(a)}\\,e^{-${kt(k)}}=1\\ \\Rightarrow\\ t=${dfrac(`\\ln ${ft(a)}`, ft(k))}\\approx${ft(tw, 2)}`)}.`, f: (t) => S / (1 + a * Math.exp(-k * t)), ask, S, a, k, c, m };
    }
    const a = pick(tier(lv, [1, 3, 4], [4, 9], [9, 19], [3, 7, 24])), m = pick(tier(lv, [5, 8, 10, 20], [8, 12, 50], [6, 15, 40], [25, 30, 100]));
    const S = (1 + a) * m, k = pick(tier(lv, [1, 0.5], [0.5, 0.2], [0.4, 0.3], [0.25, 0.1, 0.4]));
    const f = (t) => S / (1 + a * Math.exp(-k * t)), formula = `f(t)=${dfrac(S, `1+${a}\\,e^{-${kt(k)}}`)}`;
    let opts, prompt, hints, explain;
    if (ask === 'grenze') {
      opts = [N(S, true), N(m, false, `Das ist der Anfangswert ${tex('f(0)')}. Gefragt ist die Grenze für große Zeiten.`), N(S / 2, false, 'Bei der Hälfte der Grenze wächst der Bestand am schnellsten – die Grenze selbst ist doppelt so groß.'), N(1 + a, false, 'Das ist der Nenner zu Beginn, kein Bestand.')];
      prompt = 'Welchem Wert nähert sich der Bestand auf lange Sicht (Sättigungsgrenze)?';
      hints = [`Was passiert mit ${tex(`e^{-${kt(k)}}`)} für sehr große ${tex('t')}?`, 'Der Nenner geht gegen 1. Was bleibt?'];
      explain = `Für große ${tex('t')} geht der Nenner gegen 1, also ${tex(`f(t)\\to ${S}`)}.`;
    } else if (ask === 'start') {
      opts = [N(m, true), N(S, false, 'Das ist die Sättigungsgrenze. Gefragt ist der Anfang.'), N(S / a, false, `Im Nenner steht ${tex(`1+${a}`)}, nicht nur ${a}.`), N(S / 2, false, `Die Hälfte der Grenze wird erst später erreicht. Setze ${tex('t=0')} ein.`)];
      prompt = `Wie groß ist der Anfangsbestand ${tex('f(0)')}?`;
      hints = [`Setze ${tex('t=0')} ein: ${tex('e^{0}=1')}.`, `Der Nenner ist dann ${tex(`1+${a}=${1 + a}`)}. Jetzt ${tex(`${S}:${1 + a}`)} rechnen.`];
      explain = `${tex(`f(0)=${dfrac(S, `1+${a}\\cdot 1`)}=${dfrac(S, 1 + a)}=${m}`)}.`;
    } else if (ask === 'haelfte') {
      opts = [N(S / 2, true), N(S, false, 'An der Grenze wächst der Bestand gar nicht mehr.'), N(m, false, 'Am Anfang wächst der Bestand noch langsam – es sind erst wenige da.'), N((S + m) / 2, false, 'Nicht die Mitte zwischen Anfang und Grenze: Der Wendepunkt liegt bei der halben Grenze.')];
      prompt = 'Bei welchem Bestand wächst er am schnellsten (Wendepunkt)?';
      hints = ['Logistisches Wachstum ist eine S-Kurve: erst langsam, dann schnell, dann wieder langsam.', `Die Sättigungsgrenze liest du am Zähler ab: Für große ${tex('t')} geht der Nenner gegen 1, also ${tex(`S=${S}`)}.`, 'Am schnellsten wächst der Bestand bei der halben Sättigungsgrenze.'];
      explain = `Grenze: ${tex(`f(t)\\to${dfrac(S, '1+0')}=${S}`)}. Der Wendepunkt liegt bei der halben Grenze: ${tex(`${dfrac(S, 2)}=${ft(S / 2)}`)}.`;
    } else {
      opts = [T(`\\ln ${a}`, ft(k), Math.log(a) / k, true), T(a, ft(k), a / k, false, `Beim Auflösen von ${tex(`${a}\\,e^{-${kt(k)}}=1`)} braucht man den Logarithmus.`),
        T(`\\ln ${S}`, ft(k), Math.log(S) / k, false, `Entscheidend ist ${a} aus dem Nenner, nicht die Grenze ${S}.`), T(`\\ln ${a}`, a, Math.log(a) / a, false, `Geteilt wird durch ${tex(`k=${ft(k)}`)}, die Zahl im Exponenten.`)];
      prompt = 'Zu welchem Zeitpunkt wächst der Bestand am schnellsten?';
      hints = [`Am schnellsten wächst der Bestand bei der halben Grenze: ${tex(`f(t)=${dfrac(S, 2)}=${ft(S / 2)}`)}.`, `Das ist erreicht, wenn der Nenner 2 ist, also ${tex(`${a}\\,e^{-${kt(k)}}=1`)}.`, `${tex(`e^{-${kt(k)}}=${dfrac(1, a)}`)} – jetzt logarithmieren: ${tex(`-${kt(k)}=\\ln${dfrac(1, a)}=-\\ln ${a}`)}.`, `Durch ${tex(`-${ft(k)}`)} teilen.`];
      explain = `Halbe Grenze heißt Nenner 2: ${tex(`${a}\\,e^{-${kt(k)}}=1\\ \\Rightarrow\\ -${kt(k)}=-\\ln ${a}\\ \\Rightarrow\\ t=${dfrac(`\\ln ${a}`, ft(k))}\\approx${ft(Math.log(a) / k, 2)}`)}.`;
    }
    if (!uniqNum(opts) || !uniq(opts) || (ask === 'tw' && !weit(opts, 0.11))) continue;
    return { prompt, formula, options: shuffle(opts), hints, explain, f, ask, S, a, k };
  }
}

/* ───────────── Welches Wachstum ist das? ───────────── */

const ART = { linear: 'linear', exp: 'exponentiell', begr: 'begrenzt', log: 'logistisch' };
const ART_WARUM = {
  linear: 'Linear hieße: In gleichen Zeiten kommt immer gleich viel dazu.',
  exp: 'Exponentiell hieße: Die Zunahme ist proportional zum Bestand – es gibt keine Grenze.',
  begr: 'Begrenzt hieße: Die Zunahme ist proportional zum Abstand zur Grenze – am Anfang am schnellsten.',
  log: 'Logistisch hieße: erst langsam, dann schnell, dann wieder langsam (S-Kurve) – mit Grenze.',
};
/** Modell erkennen: aus einer Beschreibung (1), der Formel (2), der Änderungsrate (3), einer Wertetabelle mit Differenzen und Quotienten (4), einer erst umzuformenden Formel (5). */
export function genWachstumArt(lv = 3) {
  const key = pick(['linear', 'exp', 'begr', 'log']);
  const b = pick([3, 5, 10, 20]), m = pick([2, 4, 5, 8]), q = pick([2, 3]), k = pick([0.1, 0.2, 0.5]), a = pick([4, 9]), S = (1 + a) * pick([10, 20, 50]);
  const F = { linear: (t) => b + m * t, exp: (t) => b * q ** t, begr: (t) => S - (S - b) * Math.exp(-k * t), log: (t) => S / (1 + a * Math.exp(-k * t)) };
  const modelle = 'Vier Modelle: linear (gleich viel dazu), exponentiell (gleicher Faktor), begrenzt (immer langsamer bis zur Grenze), logistisch (S-Kurve).', frage = 'Gibt es eine Grenze? Und wann wächst der Bestand am schnellsten – am Anfang oder mittendrin?';
  let f = F[key], prompt = 'Welches Wachstum beschreibt die Funktion?', formula, warum, hints = [modelle, frage], weg = '';
  if (lv <= 1) {
    prompt = { linear: `In ein Becken laufen jede Minute ${m} Liter Wasser. Welches Wachstum ist das?`, exp: `Eine Bakterienkultur ${q === 2 ? 'verdoppelt' : 'verdreifacht'} sich jede Stunde. Welches Wachstum ist das?`,
      begr: `Ein Akku lädt. Die Laufzeit, für die er reicht, wächst – je voller er ist, desto langsamer. Mehr als ${S} Minuten Laufzeit gehen nicht. Welches Wachstum ist das?`,
      log: `Ein Gerücht in einer Schule mit ${S} Personen: Erst wissen es wenige, dann geht es schnell, am Ende kennen es fast alle. Welches Wachstum ist das?` }[key];
    warum = { linear: 'In gleichen Zeiten kommt gleich viel dazu.', exp: 'In gleichen Zeiten wird mit demselben Faktor vervielfacht.', begr: 'Am Anfang am schnellsten, dann immer langsamer bis zu einer Grenze.', log: 'Erst langsam, dann schnell, dann wieder langsam – eine S-Kurve mit Grenze.' }[key];
  } else if (lv === 2) {
    formula = { linear: `f(t)=${b}+${m}t`, exp: `f(t)=${b}\\cdot ${q}^{t}`, begr: `f(t)=${S}-${S - b}\\,e^{-${kt(k)}}`, log: `f(t)=${dfrac(S, `1+${a}\\,e^{-${kt(k)}}`)}` }[key];
    warum = { linear: `${tex('t')} steht ohne Hochzahl da: In jedem Schritt kommen ${m} dazu.`, exp: `${tex('t')} steht im Exponenten und es gibt keine Grenze.`, begr: `Eine Zahl minus ein Teil mit ${tex('e^{-kt}')}, der verschwindet: Der Bestand nähert sich ${S}.`, log: `Der Bruch mit ${tex('1+a\\,e^{-kt}')} im Nenner ist die logistische Funktion.` }[key];
    hints = [`Wo steht ${tex('t')}: als einfacher Faktor, im Exponenten einer wachsenden Potenz oder in einem Teil mit ${tex('e^{-kt}')}, der für große ${tex('t')} verschwindet?`, frage];
  } else if (lv === 3) {
    prompt = 'Die Änderungsrate eines Bestands erfüllt diese Gleichung. Welches Wachstum ist das?';
    formula = { linear: `f'(t)=${m}`, exp: `f'(t)=${ft(k)}\\cdot f(t)`, begr: `f'(t)=${ft(k)}\\cdot\\bigl(${S}-f(t)\\bigr)`, log: `f'(t)=${ft(k / S, 4)}\\cdot f(t)\\cdot\\bigl(${S}-f(t)\\bigr)` }[key];
    F.exp = (t) => b * Math.exp(k * t); f = F[key];
    warum = { linear: 'Die Änderungsrate ist konstant.', exp: 'Die Änderungsrate ist proportional zum Bestand.', begr: `Die Änderungsrate ist proportional zum Abstand ${tex(`${S}-f(t)`)} zur Grenze.`, log: `Die Änderungsrate ist proportional zum Bestand <b>und</b> zum Abstand ${tex(`${S}-f(t)`)} zur Grenze.` }[key];
    hints = [`${tex("f'(t)")} ist die Änderungsrate. Wovon hängt sie hier ab: von nichts, vom Bestand ${tex('f(t)')}, vom Abstand zu einer Grenze – oder von beidem?`,
      `Zum Vergleich: ${tex("f'=m")} (linear), ${tex("f'=k\\cdot f")} (exponentiell), ${tex("f'=k\\cdot(S-f)")} (begrenzt), ${tex("f'=c\\cdot f\\cdot(S-f)")} (logistisch).`];
  } else if (lv === 4) {
    const s = pick([1, 2, 5, 8]);
    F.begr = (t) => s * (100 - 80 * 0.5 ** t); F.log = (t) => (s * 100) / (1 + 9 * (1 / 3) ** t); f = F[key];
    const w = [0, 1, 2, 3, 4].map((t) => Math.round(f(t) * 100) / 100), d = w.slice(1).map((v, i) => v - w[i]), qu = w.slice(1).map((v, i) => v / w[i]);
    const dT = d.map((v, i) => tex(`${ft(w[i + 1])}-${ft(w[i])}=${ft(v)}`)).join(', '), qT = tex(qu.map((v) => ft(v, 2)).join(';\\ '));
    prompt = 'Welches Modell passt zu dieser Wertetabelle?';
    formula = `\\begin{array}{c|ccccc}t&0&1&2&3&4\\\\\\hline f(t)&${w.map((v) => ft(v)).join('&')}\\end{array}`;
    warum = { linear: `Die Unterschiede von Schritt zu Schritt sind immer gleich (${tex(ft(d[0]))}).`, exp: `Von Schritt zu Schritt wird immer mit demselben Faktor ${tex(ft(qu[0]))} vervielfacht.`, begr: `Die Zunahmen halbieren sich von Schritt zu Schritt – die Werte nähern sich der Grenze ${tex(ft(100 * s))}, am Anfang geht es am schnellsten.`, log: 'Die Zunahmen werden erst größer, dann wieder kleiner – eine S-Kurve mit Grenze.' }[key];
    hints = [`Bilde die Unterschiede von Schritt zu Schritt: ${dT}. Sind sie gleich, ist das Wachstum linear.`, `Teile jeden Wert durch den vorigen. Die Quotienten sind (gerundet): ${qT}. Sind sie gleich, ist das Wachstum exponentiell.`,
      'Sonst: Werden die Unterschiede von Anfang an kleiner (begrenzt) oder erst größer und dann kleiner (logistisch)?'];
    weg = `Unterschiede: ${dT}. Quotienten (gerundet): ${qT}. `;
  } else {
    const ek = `e^{${kt(k)}}`, e2 = `e^{${kt(2 * k)}}`;
    prompt = 'Welches Wachstum beschreibt die Funktion? Forme den Term zuerst um.';
    formula = { linear: `f(t)=\\ln\\left(e^{${m}t+${b}}\\right)`, exp: `f(t)=${dfrac(`${b}\\,${e2}`, ek)}`, begr: `f(t)=${dfrac(`${S}\\,${ek}-${S - b}`, ek)}`, log: `f(t)=${dfrac(`${S}\\,${ek}`, `${ek}+${a}`)}` }[key];
    F.linear = (t) => m * t + b; F.exp = (t) => b * Math.exp(k * t); f = F[key];
    const wie = { linear: `Logarithmus und e-Funktion heben sich auf: ${tex('\\ln(e^{z})=z')}.`, exp: `Potenzgesetz: ${tex(`${e2}:${ek}=e^{${kt(2 * k)}-${kt(k)}}=${ek}`)}.`, begr: `Teile beide Glieder des Zählers einzeln durch ${tex(ek)}; dabei ist ${tex(`${dfrac(1, ek)}=e^{-${kt(k)}}`)}.`, log: `Teile Zähler und Nenner durch ${tex(ek)} (Kürzen bzw. Erweitern mit ${tex(`e^{-${kt(k)}}`)}).` }[key];
    const kette = { linear: `f(t)=\\ln\\left(e^{${m}t+${b}}\\right)=${m}t+${b}`, exp: `f(t)=${b}\\cdot${dfrac(e2, ek)}=${b}\\,e^{${kt(2 * k)}-${kt(k)}}=${b}\\,${ek}`,
      begr: `f(t)=${dfrac(`${S}\\,${ek}`, ek)}-${dfrac(S - b, ek)}=${S}-${S - b}\\,e^{-${kt(k)}}`, log: `f(t)=${dfrac(`${S}\\,${ek}\\cdot e^{-${kt(k)}}`, `(${ek}+${a})\\cdot e^{-${kt(k)}}`)}=${dfrac(S, `1+${a}\\,e^{-${kt(k)}}`)}` }[key];
    const probe = { linear: `Probe: ${tex(`f(0)=${b}`)} und ${tex(`f(1)=${m + b}`)} – in jedem Schritt kommen ${m} dazu, ohne Grenze.`, exp: `Probe: ${tex(`f(0)=${b}`)}; für große ${tex('t')} wächst ${tex(ek)} über alle Grenzen, und zwar in jedem Schritt um denselben Faktor ${tex(`e^{${ft(k)}}`)}.`,
      begr: `Probe: ${tex(`f(0)=${S}-${S - b}=${b}`)}; für große ${tex('t')} geht ${tex(`e^{-${kt(k)}}`)} gegen 0, also ${tex(`f(t)\\to ${S}`)} – am Anfang wächst der Bestand am schnellsten.`,
      log: `Probe: ${tex(`f(0)=${dfrac(S, `1+${a}`)}=${S / (1 + a)}`)}; für große ${tex('t')} geht der Nenner gegen 1, also ${tex(`f(t)\\to ${S}`)} – am schnellsten wächst der Bestand bei ${tex(`${dfrac(S, 2)}=${S / 2}`)}.` }[key];
    hints = [`So lässt sich das Modell kaum ablesen. ${wie}`, `Umformen: ${tex(kette)}.`, probe, frage];
    weg = `${wie} ${tex(kette)}. ${probe} `;
    warum = { linear: 'Eine Gerade – in gleichen Zeiten kommt gleich viel dazu.', exp: 'Eine e-Funktion mit positivem Exponenten, ohne Grenze.', begr: `Der Teil mit e verschwindet, die Grenze ist ${S}; am Anfang geht es am schnellsten.`, log: `Die logistische Funktion mit der Grenze ${S} – eine S-Kurve.` }[key];
  }
  const options = shuffle(Object.keys(ART).map((x) => ({ tex: `\\text{${ART[x]}}`, key: x, correct: x === key, why: x === key ? undefined : `${ART_WARUM[x]} Hier: ${warum}` })));
  return { prompt, formula, options, hints, explain: `${weg}${ART[key][0].toUpperCase()}${ART[key].slice(1)}es Wachstum: ${warum}`, f, key };
}

/* ───────────── Ebenen genauer ───────────── */

const eq = (n, d) => { let s = ''; n.forEach((c, i) => { if (!c) return; const v = Math.abs(c) === 1 ? '' : ft(Math.abs(c)); s += `${c < 0 ? '-' : s ? '+' : ''}${v}x_${i + 1}`; }); return `${s}=${ft(d)}`; };
const dot = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
const lin2 = (A, r, u, s, v) => A.map((c, i) => c + r * u[i] + s * v[i]);
const cross = (u, v) => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
const skal = (u, v) => plus(u.map((c, i) => `${par(c)}\\cdot${par(v[i])}`));
/** Die drei Koordinaten des Kreuzprodukts ausgeschrieben – als fertige Sätze für den Rechenweg. */
const kreuzWeg = (u, v) => { const n = cross(u, v), kt2 = (p, q) => `${par(u[p])}\\cdot${par(v[q])}-${par(u[q])}\\cdot${par(v[p])}`;
  return `${tex(`n_1=${kt2(1, 2)}=${n[0]}`)}, ${tex(`n_2=${kt2(2, 0)}=${n[1]}`)}, ${tex(`n_3=${kt2(0, 1)}=${n[2]}`)}`; };

/** Spurpunkte: Stufe 1–3 Ebene trifft Achse (zuletzt mit Brüchen), 4 Gerade durchstößt die x1x2-Ebene mit Bruch-Parameter, 5 Ebene in Parameterform (erst Kreuzprodukt und Koordinatengleichung). */
export function genSpurpunkt(lv = 3) {
  for (;;) {
    const P = (pt, correct, why, strs) => ({ tex: strs ? `S(${strs.join('\\mid ')})` : PT('S', pt), pt, correct, why });
    const on = (x, i) => [0, 0, 0].map((_, j) => (j === i ? x : 0));
    if (lv === 4) {
      const v = [pick([1, 2, -1, -2, 3]), pick([1, -1, 2, 3]), pick([2, 4, -2, -4, 5])], A = [ri(-3, 5), ri(-4, 4), pick([-7, -6, -5, -3, -2, -1, 1, 2, 3, 5, 6, 7])], t = -A[2] / v[2];
      if (Number.isInteger(t)) continue;
      const hit = [A[0] + t * v[0], A[1] + t * v[1], 0], tT = tf(-A[2], v[2]);
      const opts = [P(hit, true), P([A[0] - t * v[0], A[1] - t * v[1], 0], false, `Vorzeichen: Aus ${tex(`${A[2]}${sgn(v[2])}t=0`)} folgt ${tex(`t=${tT}`)}.`),
        P([A[0], A[1], 0], false, 'Nur die dritte Koordinate zu streichen reicht nicht – auch die anderen ändern sich mit t.'), P([0, hit[1], A[2]], false, `In der ${tex('x_1x_2')}-Ebene ist die dritte Koordinate 0, nicht die erste.`)];
      if (!uniq(opts)) continue;
      return { prompt: `Wo durchstößt die Gerade g die ${tex('x_1x_2')}-Ebene (Spurpunkt)?`, formula: `g:\\ \\vec x=${vecTex(A)}+t\\cdot${vecTex(v)}`, options: shuffle(opts),
        hints: [`In der ${tex('x_1x_2')}-Ebene ist ${tex('x_3=0')}.`, `Dritte Zeile der Geraden: ${tex(`${A[2]}${sgn(v[2])}t=0`)}, also ${tex(`t=${tT}=${ft(t)}`)}.`, `Setze ${tex('t')} in die ersten beiden Zeilen ein: ${tex(`x_1=${A[0]}+${par(t)}\\cdot${par(v[0])}`)} und ${tex(`x_2=${A[1]}+${par(t)}\\cdot${par(v[1])}`)}.`],
        explain: `${tex(`x_3=0\\ \\Rightarrow\\ ${A[2]}${sgn(v[2])}t=0\\ \\Rightarrow\\ t=${ft(t)}`)}. Einsetzen: ${tex(`x_1=${A[0]}+${par(t)}\\cdot${par(v[0])}=${ft(hit[0])}`)}, ${tex(`x_2=${A[1]}+${par(t)}\\cdot${par(v[1])}=${ft(hit[1])}`)}, also ${tex(PT('S', hit))}.`, A, v, art: 'gerade' };
    }
    if (lv >= 5) {
      const z = () => ri(-3, 3), A = [ri(-4, 4), ri(-4, 4), ri(-4, 4)], u = [z(), z(), z()], v = [z(), z(), z()], roh = cross(u, v), g = ggt(ggt(roh[0], roh[1]), roh[2]);
      if (!g || u.filter((c) => c).length < 2 || v.filter((c) => c).length < 2) continue;
      const n = roh.map((c) => c / g), d = dot(n, A), ax = ri(0, 2), other = (ax + 1) % 3, val = d / n[ax];
      if (!n[ax] || !d || Math.abs(n[ax]) > 12 || Math.abs(n[ax]) === 1 || n.filter((c) => c).length < 2) continue;
      const vt = Number.isInteger(val) ? ft(val) : tf(d, n[ax]), onS = (s, i) => [0, 1, 2].map((j) => (j === i ? s : '0'));
      const opts = [P(on(val, ax), true, undefined, onS(vt, ax)), P(on(d, ax), false, `Es fehlt das Teilen durch den Koeffizienten ${tex(ft(n[ax]))} vor ${tex(`x_${ax + 1}`)}.`),
        P(on(val, other), false, `Der Wert stimmt, aber er gehört auf die ${tex(`x_${ax + 1}`)}-Achse.`, onS(vt, other)), P(on(A[ax], ax), false, `Das ist nur die ${tex(`x_${ax + 1}`)}-Koordinate des Stützpunkts. Der Stützpunkt liegt nicht auf der Achse.`)];
      if (!uniq(opts) || !weit(opts.map((o) => ({ num: o.pt[ax] + 1000 * o.pt[other] })), 0.05)) continue;
      const kx = `${K(n[ax])}x_${ax + 1}`;
      return { prompt: `Die Ebene E ist in Parameterform gegeben. Wo schneidet sie die ${tex(`x_${ax + 1}`)}-Achse (Spurpunkt)?`, formula: `E:\\ \\vec x=${vecTex(A)}+r\\cdot${vecTex(u)}+s\\cdot${vecTex(v)}`, options: shuffle(opts),
        hints: [`Auf der ${tex(`x_${ax + 1}`)}-Achse sind die anderen beiden Koordinaten 0. Am schnellsten geht es mit der Koordinatengleichung – dafür braucht man einen Normalenvektor.`,
          `Kreuzprodukt der Richtungsvektoren: ${kreuzWeg(u, v)}${g > 1 ? ` – gekürzt durch ${g}: ${tex(`\\vec n=${vecTex(n)}`)}` : `, also ${tex(`\\vec n=${vecTex(n)}`)}`}.`,
          `Rechte Seite mit dem Stützpunkt (Skalarprodukt): ${tex(`d=${skal(n, A)}=${d}`)}. Also ${tex(`E:\\ ${eq(n, d)}`)}.`, `Die anderen Koordinaten 0 setzen: ${tex(`${kx}=${d}`)}.`],
        explain: `Normalenvektor über das Kreuzprodukt: ${tex(`\\vec n=${vecTex(n)}`)}. Rechte Seite mit dem Stützpunkt: ${tex(`E:\\ ${eq(n, d)}`)}. Auf der ${tex(`x_${ax + 1}`)}-Achse: ${tex(`${kx}=${d}\\ \\Rightarrow\\ x_${ax + 1}=${vt}`)}${Number.isInteger(val) ? '' : ` ${tex(`\\approx${ft(val, 2)}`)}`}, also ${tex(`S(${onS(vt, ax).join('\\mid ')})`)}.`, n, d, ax, art: 'ebene', A, u, v };
    }
    const co = shuffle(tier(lv, pick([[1, 2, 3], [1, 2, 4], [1, 3, 5], [2, 3, 5]]), [2, 3, 4], pick([[2, -4, 5], [-2, 4, 5], [4, -5, 2]]))), d = tier(lv, pick([6, 12, 30]), 12, pick([6, 10, -10, 15, 3, -7, 9]));
    const ax = lv <= 1 ? 0 : ri(0, 2), val = d / co[ax], other = (ax + 1) % 3;
    const opts = [P(on(val, ax), true), P(on(co[ax], ax), false, `Das ist der Koeffizient vor ${tex(`x_${ax + 1}`)}. Setze die anderen beiden Koordinaten 0 und löse nach ${tex(`x_${ax + 1}`)} auf.`),
      P(on(d, ax), false, `Es fehlt das Teilen durch den Koeffizienten ${tex(ft(co[ax]))}.`), P(on(val, other), false, `Der Wert stimmt, aber er gehört auf die ${tex(`x_${ax + 1}`)}-Achse.`)];
    if (!uniq(opts) || Math.abs(val) === Math.abs(co[ax]) || (lv === 3) === Number.isInteger(val)) continue;
    const kx = `${K(co[ax])}x_${ax + 1}`;   // „−x₁“ statt „−1 x₁“
    return { prompt: `Wo schneidet die Ebene E die ${tex(`x_${ax + 1}`)}-Achse (Spurpunkt)?`, formula: `E:\\ ${eq(co, d)}`, options: shuffle(opts),
      hints: [`Auf der ${tex(`x_${ax + 1}`)}-Achse sind die anderen beiden Koordinaten 0.`, `Es bleibt ${tex(`${kx}=${ft(d)}`)}.`, ...(lv >= 2 ? [`Teile durch ${tex(ft(co[ax]))}${lv >= 3 && (d < 0 || co[ax] < 0) ? ' und achte auf das Vorzeichen' : ''}: ${tex(`x_${ax + 1}=${dfrac(d, co[ax])}`)}.`] : [])],
      explain: lv >= 2 ? `Die anderen Koordinaten 0 setzen: ${tex(`${kx}=${ft(d)}\\ \\Rightarrow\\ x_${ax + 1}=${dfrac(d, co[ax])}=${ft(val)}`)}, also ${tex(PT('S', on(val, ax)))}.` : `Die anderen Koordinaten 0 setzen: ${tex(`${kx}=${ft(d)}\\ \\Rightarrow\\ x_${ax + 1}=${ft(val)}`)}, also ${tex(PT('S', on(val, ax)))}.`, n: co, d, ax, art: 'ebene' };
  }
}

/** Zur Koordinatengleichung: Stufe 1–3 aus Punkt und Normalenvektor, 4 aus der Normalenform, 5 aus der Parameterform (Kreuzprodukt, kürzen, Punktprobe). */
export function genNormalenform(lv = 3) {
  for (;;) {
    const E = (co, dd, correct, why) => ({ tex: `E:\\ ${eq(co, dd)}`, n: co, d: dd, correct, why });
    if (lv >= 5) {
      const z = () => ri(-4, 4), A = [z(), z(), z()], u = [z(), z(), z()], v = [z(), z(), z()], roh = cross(u, v), g = ggt(ggt(roh[0], roh[1]), roh[2]);
      if (!g || u.filter((c) => c).length < 2 || v.filter((c) => c).length < 2) continue;
      const n = roh.map((c) => c / g), d = dot(n, A), nF = [n[0], -n[1], n[2]];
      if (!d || !n[1] || (!n[0] && !n[2]) || n.some((c) => Math.abs(c) > 15)) continue;
      const opts = [E(n, d, true), E(n, -d, false, `Vorzeichen: Rechts steht ${tex('\\vec n\\cdot\\vec p')} mit dem Stützpunkt – das ist ${tex(ft(d))}.`),
        E(nF, dot(nF, A), false, `Vorzeichenfehler im Kreuzprodukt: Die mittlere Koordinate ist ${tex('u_3v_1-u_1v_3')}.`), E(n, 0, false, 'Rechts steht nur dann 0, wenn die Ebene durch den Ursprung geht. Setze den Stützpunkt ein.')];
      if (!uniq(opts)) continue;
      return { prompt: 'Die Ebene E ist in Parameterform gegeben. Welche Koordinatengleichung gehört dazu?', formula: `E:\\ \\vec x=${vecTex(A)}+r\\cdot${vecTex(u)}+s\\cdot${vecTex(v)}`, options: shuffle(opts),
        hints: [`Ein Normalenvektor steht senkrecht auf beiden Richtungsvektoren – man bekommt ihn mit dem Kreuzprodukt ${tex('\\vec n=\\vec u\\times\\vec v')}.`, `${kreuzWeg(u, v)}.`,
          g > 1 ? `Alle drei Koordinaten lassen sich durch ${g} teilen (Kürzen ändert die Richtung nicht): ${tex(`\\vec n=${vecTex(n)}`)}.` : `Also ${tex(`\\vec n=${vecTex(n)}`)} – das sind die Koeffizienten der Gleichung.`,
          `Rechte Seite: Stützpunkt einsetzen (Skalarprodukt), ${tex(`d=${skal(n, A)}=${d}`)}.`],
        explain: `Kreuzprodukt: ${tex(`\\vec u\\times\\vec v=${vecTex(roh)}`)}${g > 1 ? `, gekürzt ${tex(`\\vec n=${vecTex(n)}`)}` : ''}. Mit dem Stützpunkt: ${tex(`d=${skal(n, A)}=${d}`)}, also ${tex(`E:\\ ${eq(n, d)}`)}.`, n, P: A, u, v };
    }
    const R = tier(lv, 3, 4, 4, 5), neg = lv >= 3;
    const n = [0, 0, 0].map(() => (neg ? ri(-R, R) : ri(1, R))), Pp = [0, 0, 0].map(() => (neg ? ri(-R + 1, R + 1) : ri(lv === 1 ? 0 : 1, R)));
    if (n.some((c) => c === 0) || (lv === 1 && Pp.filter((c) => c === 0).length !== 1)) continue;
    const d = dot(n, Pp), sum = Pp[0] + Pp[1] + Pp[2];
    if (cross(n, Pp).every((c) => c === 0) || d === 0 || Pp.filter((c) => c === 0).length > 1) continue;
    const opts = [E(n, d, true), E(n, sum, false, `Rechts steht das Skalarprodukt aus Normalenvektor und Punkt, nicht die Summe der Koordinaten von P.`),
      E(n, -d, false, `Vorzeichen: ${tex('\\vec n\\cdot\\vec x=\\vec n\\cdot\\vec p')} – die rechte Seite ist ${tex(ft(d))}.`), E(Pp, d, false, 'Die Koeffizienten sind die Koordinaten des Normalenvektors, nicht die des Punktes.')];
    if (!uniq(opts)) continue;
    const alsForm = lv >= 4, prod = plus(n.map((c, i) => `${c * Pp[i]}`));
    return {
      prompt: alsForm ? 'Die Ebene E ist in Normalenform gegeben. Welche Koordinatengleichung gehört dazu?' : `Die Ebene E geht durch den Punkt P und hat den Normalenvektor ${tex('\\vec n')}. Welche Koordinatengleichung passt?`,
      formula: alsForm ? `E:\\ \\left[\\vec x-${vecTex(Pp)}\\right]\\cdot${vecTex(n)}=0` : `${PT('P', Pp)},\\quad \\vec n=${vecTex(n)}`, options: shuffle(opts),
      hints: [...(alsForm ? [`Lies ab: In der Klammer steht der Stützpunkt ${tex(PT('P', Pp))}, dahinter der Normalenvektor ${tex(`\\vec n=${vecTex(n)}`)}.`, `Ausmultipliziert heißt die Normalenform ${tex('\\vec n\\cdot\\vec x=\\vec n\\cdot\\vec p')}.`] : []),
        `Die Koordinaten des Normalenvektors sind die Koeffizienten: ${tex('n_1x_1+n_2x_2+n_3x_3=d')}.`, `Für ${tex('d')} den Punkt einsetzen (Skalarprodukt): ${tex(`d=\\vec n\\cdot\\vec p=${skal(n, Pp)}`)}.`, ...(lv >= 2 ? [`${neg ? 'Auf die Vorzeichen achten' : 'Ausrechnen'}: ${tex(`d=${prod}=${d}`)}.`] : [])],
      explain: `${tex(`d=${skal(n, Pp)}${lv >= 2 ? `=${prod}` : ''}=${ft(d)}`)}, also ${tex(`E:\\ ${eq(n, d)}`)}.`, n, P: Pp };
  }
}

/** Zwei Glieder a·r + b·s ohne überflüssige 1 und ohne Nullen. */
const rs = (a, b) => { const t1 = a ? `${K(a)}r` : '', t2 = b ? `${b < 0 ? '-' : t1 ? '+' : ''}${K(Math.abs(b))}s` : ''; return t1 + t2 || '0'; };

/** Parameterform der Ebene: Stufe 1–3 Punkt zu gegebenen Parametern, 4 Parameter zu gegebenem Punkt (Gleichungssystem), 5 Bruch-Parameter und eine fehlende Koordinate. */
export function genParamPunkt(lv = 3) {
  for (;;) {
    const R = tier(lv, 2, 3, 3, 4, 5), neg = lv >= 3, z = () => (neg ? ri(-R, R) : ri(0, R));
    const A = [z(), z(), z()], u = [z(), z(), z()], v = [z(), z(), z()], halb = [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5];
    const r = pick(tier(lv, [1, 2], [2, 3], [2, -1, 3], [2, 3, -1], halb)), s = pick(tier(lv, [1, 2], [1, 3], [-2, 1, 2], [-2, 1, 4], halb));
    if (r === s || cross(u, v).every((c) => c === 0) || u.filter((c) => c === 0).length > 1 || v.filter((c) => c === 0).length > 1) continue;
    const Q = lin2(A, r, u, s, v), formula = `E:\\ \\vec x=${vecTex(A)}+r\\cdot${vecTex(u)}+s\\cdot${vecTex(v)}`;
    if (lv <= 3) {
      const P = (pt, correct, why) => ({ tex: PT('P', pt), pt, correct, why });
      const opts = [P(Q, true), P(lin2(A, s, u, r, v), false, `Vertauscht: ${tex('r')} gehört zum ersten, ${tex('s')} zum zweiten Richtungsvektor.`),
        P(lin2([0, 0, 0], r, u, s, v), false, 'Der Stützvektor fehlt – er wird immer dazugezählt.'), r > 0 && s > 0 ? P(lin2(A, r, u, 0, v), false, 'Der zweite Richtungsvektor fehlt – beide werden dazugezählt.') : P(lin2(A, Math.abs(r), u, Math.abs(s), v), false, 'Achte auf die Vorzeichen der Parameter.')];
      if (!uniq(opts)) continue;
      const zeile = (i) => `${A[i]}+${par(r)}\\cdot${par(u[i])}+${par(s)}\\cdot${par(v[i])}=${Q[i]}`;
      return { prompt: `Welcher Punkt der Ebene gehört zu ${tex(`r=${r}`)} und ${tex(`s=${s}`)}?`, formula, options: shuffle(opts),
        hints: ['Setze beide Parameter ein und rechne zeilenweise.', `Erste Zeile: ${tex(zeile(0))}.`, ...(lv >= 2 ? [`Zweite Zeile: ${tex(zeile(1))}.`] : []), ...(lv >= 3 ? [`Dritte Zeile: ${tex(zeile(2))} – auf die Vorzeichen achten.`] : [])],
        explain: `Zeilenweise einsetzen: ${tex(`\\vec x=${vecTex(A)}+${par(r)}\\cdot${vecTex(u)}+${par(s)}\\cdot${vecTex(v)}=${vecTex(Q)}`)}, also ${tex(PT('P', Q))}.`, A, u, v, r, s, art: 'punkt' };
    }
    // Parameter gesucht: zwei Zeilen lösen, die dritte ist die Probe (Stufe 4) oder liefert die fehlende Koordinate (Stufe 5)
    const b = Q.map((c, i) => c - A[i]), paare = lv >= 5 ? [[0, 1]] : [[0, 1], [0, 2], [1, 2]], paar = paare.find(([i, j]) => u[i] * v[j] - u[j] * v[i] !== 0);
    if (!paar) continue;
    const [i, j] = paar, l = 3 - i - j, det = u[i] * v[j] - u[j] * v[i], zl = (x) => `${rs(u[x], v[x])}=${ft(b[x])}`, rom = ['I', 'II', 'III'];
    const cWert = (o) => A[2] + o.r * u[2] + o.s * v[2];
    const Pr = (rr, ss, correct, why) => ({ tex: lv >= 5 ? `r=${ft(rr)},\\ s=${ft(ss)},\\ c=${ft(cWert({ r: rr, s: ss }))}` : `r=${ft(rr)},\\quad s=${ft(ss)}`, r: rr, s: ss, correct, why });
    const opts = [Pr(r, s, true), Pr(s, r, false, `Vertauscht: ${tex('r')} gehört zum ersten, ${tex('s')} zum zweiten Richtungsvektor. Mach die Probe.`),
      Pr(-r, s, false, `Mach die Probe durch Einsetzen: Das Vorzeichen von ${tex('r')} passt nicht.`), Pr(r, -s, false, `Mach die Probe durch Einsetzen: Das Vorzeichen von ${tex('s')} passt nicht.`)];
    if (!uniq(opts) || opts.filter((o) => lin2(A, o.r, u, o.s, v).every((c, x) => c === Q[x])).length !== 1) continue;
    const schritt1 = `Setze den Punkt ein und bringe den Stützvektor nach rechts. Zeile ${rom[i]}: ${tex(zl(i))}, Zeile ${rom[j]}: ${tex(zl(j))}.`;
    let schritt2;
    if (v[i] === 0) schritt2 = `Zeile ${rom[i]} enthält nur ${tex('r')}: ${tex(`r=${dfrac(ft(b[i]), ft(u[i]))}=${ft(r)}`)}.`;
    else if (v[j] === 0) schritt2 = `Zeile ${rom[j]} enthält nur ${tex('r')}: ${tex(`r=${dfrac(ft(b[j]), ft(u[j]))}=${ft(r)}`)}.`;
    else schritt2 = `${tex('s')} beseitigen (Additionsverfahren): Zeile ${rom[i]} mal ${tex(par(v[j]))} minus Zeile ${rom[j]} mal ${tex(par(v[i]))} ergibt ${tex(`${K(det)}r=${ft(b[i] * v[j] - b[j] * v[i])}`)}${det === 1 ? '' : `, also ${tex(`r=${ft(r)}`)}`}.`;
    const x = v[i] !== 0 ? i : j, schritt3 = `${tex(`r=${ft(r)}`)} in Zeile ${rom[x]} einsetzen: ${tex(`${ft(u[x] * r)}${v[x] < 0 ? '-' : '+'}${K(Math.abs(v[x]))}s=${ft(b[x])}`)}, also ${tex(`s=${ft(s)}`)}.`;
    const dritte = `${A[l]}+${par(r)}\\cdot${par(u[l])}+${par(s)}\\cdot${par(v[l])}=${ft(Q[l])}`;
    if (lv >= 5) {
      return { prompt: `Der Punkt ${tex(`P(${ft(Q[0])}\\mid ${ft(Q[1])}\\mid c)`)} liegt in der Ebene. Bestimme die Parameter ${tex('r')} und ${tex('s')} und die fehlende Koordinate ${tex('c')}.`, formula, options: shuffle(opts),
        hints: [`Die ersten beiden Zeilen enthalten ${tex('c')} nicht. ${schritt1}`, schritt2, schritt3, `Die dritte Zeile liefert die fehlende Koordinate: ${tex(`c=${dritte}`)}.`],
        explain: `Aus den ersten beiden Zeilen (${tex(zl(0))} und ${tex(zl(1))}) folgt ${tex(`r=${ft(r)}`)}, ${tex(`s=${ft(s)}`)}. Dritte Zeile: ${tex(`c=${dritte}`)}.`, A, u, v, Q, art: 'parameter' };
    }
    return { prompt: `Der Punkt ${tex(PT('P', Q))} liegt in der Ebene. Mit welchen Parametern erreicht man ihn?`, formula, options: shuffle(opts),
      hints: [`Jede Zeile ist eine Gleichung für ${tex('r')} und ${tex('s')}. ${schritt1}`, schritt2, schritt3, `Probe in Zeile ${rom[l]}: ${tex(dritte)} – stimmt.`],
      explain: `Gleichungssystem aus zwei Zeilen: ${tex(zl(i))} und ${tex(zl(j))} liefern ${tex(`r=${ft(r)}`)} und ${tex(`s=${ft(s)}`)}. Probe mit der dritten Zeile: ${tex(dritte)}.`, A, u, v, Q, art: 'parameter' };
  }
}

for (const [fn, topic] of [[genBegrenzt, 'Begrenztes Wachstum'], [genBegrenztRate, 'Änderungsrate beim begrenzten Wachstum'], [genLogistisch, 'Logistisches Wachstum'], [genWachstumArt, 'Wachstumsmodelle unterscheiden'],
  [genSpurpunkt, 'Spurpunkte'], [genNormalenform, 'Normalenform und Koordinatenform'], [genParamPunkt, 'Parameterform der Ebene']]) fn.topic = topic;
