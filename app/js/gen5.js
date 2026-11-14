// Aufgaben-Erzeuger, Teil 5: begrenztes und logistisches Wachstum, Ebenen genauer (Parameterform, Normalenform, Spurpunkte).
// Gleiche Regeln wie in gen.js: Stufe lv (1–5), Ablenker = typische Fehler mit Diagnose, Rechen-Felder für tests/.
import { ri, pick, shuffle, ft } from './math.js';
import { tex } from './ui.js';
import { tier, par, vecTex, uniq, uniqNum } from './gen.js';

const dfrac = (a, b) => `\\dfrac{${a}}{${b}}`;
const PT = (name, v) => `${name}(${v.map((c) => ft(c)).join('\\mid ')})`;
/** Exponent „k·t“ ohne überflüssige 1: e^{-t} statt e^{-1t}. */
const kt = (k) => `${k === 1 ? '' : ft(k)}t`;
const N = (num, correct, why, digits = 2) => ({ tex: ft(num, digits), num, correct, why });

/* ───────────── Begrenztes Wachstum ───────────── */

const SACHE = [
  ['Eine Pflanze wächst.', 'die Höhe in cm', 'Wochen'],
  ['Jemand lernt Vokabeln.', 'die Zahl der gelernten Vokabeln', 'Tagen'],
  ['Ein Medikament wird als Tropf gegeben.', 'die Menge des Wirkstoffs im Blut in mg', 'Stunden'],
  ['Ein Gerücht verbreitet sich in einem Ort.', 'die Zahl der Personen, die es kennen', 'Tagen'],
  ['Ein heißes Getränk kühlt ab.', 'die Temperatur in °C', 'Minuten'],
];

/** Begrenztes Wachstum: Grenze und Anfangswert aus der Funktionsgleichung lesen. */
export function genBegrenzt(lv = 3) {
  for (;;) {
    const [satz, was, zeit] = SACHE[Math.min(5, Math.max(1, lv)) - 1];
    const S = pick(tier(lv, [20, 50, 80, 100], [40, 60, 90, 120], [70, 150, 200, 240], [160, 250, 400, 600], [18, 20, 22, 24]));
    const k = pick(tier(lv, [0.5, 1], [0.2, 0.5], [0.1, 0.25], [0.05, 0.2], [0.1, 0.3]));
    const ask = lv === 1 ? 'grenze' : lv === 2 ? 'start' : pick(['grenze', 'start']);
    let a, f0, formula, f;
    if (lv === 5) {                                        // fallend: Abkühlung auf Raumtemperatur
      a = pick([40, 50, 60, 70]); f0 = S + a;
      formula = `f(t)=${S}+${a}\\,e^{-${kt(k)}}`; f = (t) => S + a * Math.exp(-k * t);
    } else if (lv === 4) {                                 // ausgeklammerte Form
      const c = pick([0.5, 0.6, 0.8]); a = S * c; f0 = S - a;
      formula = `f(t)=${S}\\cdot\\left(1-${ft(c)}\\,e^{-${kt(k)}}\\right)`; f = (t) => S * (1 - c * Math.exp(-k * t));
    } else {
      f0 = S * pick([0.2, 0.4, 0.5]); a = S - f0;
      formula = `f(t)=${S}-${ft(a)}\\,e^{-${kt(k)}}`; f = (t) => S - a * Math.exp(-k * t);
    }
    const e0 = tex('e^{0}=1'), eInf = `${tex(`e^{-${kt(k)}}`)} geht für große ${tex('t')} gegen 0`;
    const opts = ask === 'grenze'
      ? [N(S, true), N(f0, false, `Das ist der Anfangswert ${tex('f(0)')}. Gefragt ist der Wert auf lange Sicht.`),
        N(a, false, `Das ist der Abstand zwischen Anfangswert und Grenze. Für große ${tex('t')} verschwindet dieser Teil.`),
        N(0, false, `Nur der Teil mit e geht gegen 0 – die ${S} bleibt stehen.`)]
      : [N(f0, true), N(S, false, 'Das ist die Grenze für große Zeiten. Gefragt ist der Anfang.'),
        N(a, false, `Setze ${tex('t=0')} ein: ${e0}, also bleibt nicht nur dieser Faktor übrig.`),
        N(lv === 5 ? a - S : S + a, false, `Achte auf das Vorzeichen vor dem Teil mit e: Mit ${e0} wird ${lv === 5 ? 'addiert' : 'abgezogen'}.`)];
    if (!uniqNum(opts) || opts.some((o) => o.num < 0)) continue;
    return {
      prompt: `${satz} ${tex('f(t)')} ist ${was} nach ${tex('t')} ${zeit}. ${ask === 'grenze' ? 'Welchem Wert nähert sich f auf lange Sicht?' : `Wie groß ist der Anfangswert ${tex('f(0)')}?`}`,
      formula, options: shuffle(opts),
      hints: ask === 'grenze' ? [`Was passiert mit ${tex(`e^{-${kt(k)}}`)}, wenn ${tex('t')} sehr groß wird?`, `${eInf}. Was bleibt übrig?`]
        : [`Setze ${tex('t=0')} ein.`, `${e0}. Jetzt nur noch ausrechnen.`],
      explain: ask === 'grenze' ? `${eInf}. Übrig bleibt die Grenze ${tex(`S=${S}`)}.` : `${tex(`f(0)=${ft(f0)}`)}, denn ${e0}.`,
      f, ask, S, f0,
    };
  }
}

/** Begrenztes Wachstum: Änderungsrate – aus der Gleichung (Stufe 1–3) oder aus f'(t) = k·(S − f(t)) (Stufe 4–5). */
export function genBegrenztRate(lv = 3) {
  for (;;) {
    const k = pick(tier(lv, [0.5], [0.2, 0.1], [0.25, 0.05], [0.1, 0.2, 0.5], [0.05, 0.25, 0.4]));
    const S = pick(tier(lv, [40, 60, 100], [50, 80, 120], [160, 200, 240], [100, 150, 300], [200, 360, 500]));
    if (lv <= 3) {
      const a = S - pick([10, 20]), r = a * k, f = (t) => S - a * Math.exp(-k * t);
      const opts = [N(r, true), N(-r, false, `Vorzeichen: Die Ableitung von ${tex(`-${a}\\,e^{-${kt(k)}}`)} ist positiv – Minus mal Minus.`),
        N(a, false, `Die innere Ableitung fehlt: Beim Ableiten von ${tex(`e^{-${kt(k)}}`)} kommt der Faktor ${tex(`-${ft(k)}`)} dazu.`),
        N(S * k, false, `Abgeleitet wird der Teil mit e. Die Grenze ${S} fällt als Konstante weg.`)];
      if (!uniqNum(opts)) continue;
      return { prompt: `Wie schnell wächst der Bestand ganz am Anfang? Berechne ${tex("f'(0)")}.`, formula: `f(t)=${S}-${a}\\,e^{-${kt(k)}}`, options: shuffle(opts),
        hints: [`Leite ab: Die Konstante fällt weg, beim Teil mit e hilft die Kettenregel.`, `${tex(`f'(t)=${ft(r)}\\,e^{-${kt(k)}}`)}. Jetzt ${tex('t=0')} einsetzen.`],
        explain: `${tex(`f'(t)=-${a}\\cdot(-${ft(k)})\\,e^{-${kt(k)}}=${ft(r)}\\,e^{-${kt(k)}}`)}, also ${tex(`f'(0)=${ft(r)}`)}.`, f, ask: 'f0', S, k };
    }
    const diff = pick(lv === 4 ? [20, 40, 60] : [40, 80, 120]), B = S - diff, r = k * diff;
    if (lv === 4) {
      const opts = [N(r, true), N(k * B, false, `Das wäre exponentielles Wachstum. Hier zählt der Abstand zur Grenze: ${tex(`${S}-${B}`)}.`),
        N(k * S, false, `Eingesetzt wird nicht die Grenze allein, sondern der Abstand zur Grenze ${tex(`${S}-${B}`)}.`), N(diff, false, `Der Faktor ${tex(`k=${ft(k)}`)} fehlt.`)];
      if (!uniqNum(opts)) continue;
      return { prompt: `Für begrenztes Wachstum gilt ${tex("f'(t)=k\\cdot(S-f(t))")}. Wie groß ist die Änderungsrate in dem Moment, in dem der Bestand ${B} beträgt?`, formula: `k=${ft(k)},\\quad S=${S}`, options: shuffle(opts),
        hints: ['Die Änderungsrate hängt vom Abstand zur Grenze ab.', `Abstand zur Grenze: ${tex(`${S}-${B}=${diff}`)}. Jetzt mit ${tex('k')} malnehmen.`],
        explain: `${tex(`f'=${ft(k)}\\cdot(${S}-${B})=${ft(r)}`)}. Je näher der Bestand der Grenze kommt, desto langsamer wächst er.`, ask: 'dgl', S, k, B };
    }
    const opts = [N(k, true), N(r / B, false, `Geteilt wird durch den Abstand zur Grenze ${tex(`${S}-${B}`)}, nicht durch den Bestand.`),
      N(r / S, false, `Geteilt wird durch den Abstand zur Grenze ${tex(`${S}-${B}`)}, nicht durch die Grenze.`), N(diff / r, false, 'Kehrwert: Änderungsrate geteilt durch Abstand, nicht umgekehrt.')];
    if (!uniqNum(opts) || !uniq(opts)) continue;
    return { prompt: `Für begrenztes Wachstum gilt ${tex("f'(t)=k\\cdot(S-f(t))")}. Bei einem Bestand von ${B} beträgt die Änderungsrate ${ft(r)}. Bestimme ${tex('k')}.`, formula: `S=${S}`, options: shuffle(opts),
      hints: [`Setze ein: ${tex(`${ft(r)}=k\\cdot(${S}-${B})`)}.`, `Der Abstand zur Grenze ist ${diff}. Teile die Änderungsrate dadurch.`],
      explain: `${tex(`k=${dfrac(ft(r), `${S}-${B}`)}=${dfrac(ft(r), diff)}=${ft(k)}`)}.`, ask: 'k', S, k, B, r };
  }
}

/* ───────────── Logistisches Wachstum ───────────── */

/** Logistisches Wachstum f(t) = S / (1 + a·e^(−kt)): Grenze, Anfangswert, stärkstes Wachstum. */
export function genLogistisch(lv = 3) {
  for (;;) {
    const a = pick(tier(lv, [1, 3, 4], [4, 9], [9, 19], [3, 7, 24], [4, 9, 49])), m = pick(tier(lv, [5, 10, 20], [8, 12, 50], [6, 15, 40], [25, 30, 100], [16, 20, 60]));
    const S = (1 + a) * m, k = pick(tier(lv, [1, 0.5], [0.5, 0.2], [0.4, 0.3], [0.25, 0.1], [0.5, 0.2, 0.1]));
    const ask = tier(lv, 'grenze', 'start', pick(['grenze', 'start']), 'haelfte', 'tw');
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
      hints = [`Setze ${tex('t=0')} ein: ${tex('e^{0}=1')}.`, `Der Nenner ist dann ${tex(`1+${a}=${1 + a}`)}.`];
      explain = `${tex(`f(0)=${dfrac(S, `1+${a}`)}=${m}`)}.`;
    } else if (ask === 'haelfte') {
      opts = [N(S / 2, true), N(S, false, 'An der Grenze wächst der Bestand gar nicht mehr.'), N(m, false, 'Am Anfang wächst der Bestand noch langsam – es sind erst wenige da.'), N((S + m) / 2, false, 'Nicht die Mitte zwischen Anfang und Grenze: Der Wendepunkt liegt bei der halben Grenze.')];
      prompt = 'Bei welchem Bestand wächst er am schnellsten (Wendepunkt)?';
      hints = ['Logistisches Wachstum ist eine S-Kurve: erst langsam, dann schnell, dann wieder langsam.', `Am schnellsten wächst der Bestand bei der halben Sättigungsgrenze. Die Grenze ist ${S}.`];
      explain = `Der Wendepunkt liegt bei der halben Grenze: ${tex(`${dfrac(S, 2)}=${ft(S / 2)}`)}.`;
    } else {
      const T = (z, n, num, correct, why) => ({ tex: `t=${dfrac(z, n)}\\approx${ft(num, 2)}`, num, correct, why });
      opts = [T(`\\ln ${a}`, ft(k), Math.log(a) / k, true), T(a, ft(k), a / k, false, `Beim Auflösen von ${tex(`${a}\\,e^{-${kt(k)}}=1`)} braucht man den Logarithmus.`),
        T(`\\ln ${S}`, ft(k), Math.log(S) / k, false, `Entscheidend ist ${a} aus dem Nenner, nicht die Grenze ${S}.`), T(`\\ln ${a}`, a, Math.log(a) / a, false, `Geteilt wird durch ${tex(`k=${ft(k)}`)}, die Zahl im Exponenten.`)];
      prompt = `Zu welchem Zeitpunkt wächst der Bestand am schnellsten? (Dort ist ${tex(`f(t)=${ft(S / 2)}`)}, die halbe Grenze.)`;
      hints = [`Die halbe Grenze ist erreicht, wenn der Nenner 2 ist, also ${tex(`${a}\\,e^{-${kt(k)}}=1`)}.`, `${tex(`e^{-${kt(k)}}=${dfrac(1, a)}`)} – jetzt logarithmieren.`];
      explain = `${tex(`${a}\\,e^{-${kt(k)}}=1\\ \\Rightarrow\\ -${ft(k)}t=-\\ln ${a}\\ \\Rightarrow\\ t=${dfrac(`\\ln ${a}`, ft(k))}\\approx${ft(Math.log(a) / k, 2)}`)}.`;
    }
    if (!uniqNum(opts) || !uniq(opts)) continue;
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
/** Modell erkennen: aus Formel (1), Beschreibung (2), Änderungsrate (3), Wertetabelle (4), umgeformter Formel (5). */
export function genWachstumArt(lv = 3) {
  const key = pick(['linear', 'exp', 'begr', 'log']);
  const b = pick([3, 5, 10, 20]), m = pick([2, 4, 5, 8]), q = pick([2, 3]), k = pick([0.1, 0.2, 0.5]), a = pick([4, 9]), S = (1 + a) * pick([10, 20, 50]);
  const F = { linear: (t) => b + m * t, exp: (t) => b * q ** t, begr: (t) => S - (S - b) * Math.exp(-k * t), log: (t) => S / (1 + a * Math.exp(-k * t)) };
  let f = F[key], prompt = 'Welches Wachstum beschreibt die Funktion?', formula, warum;
  if (lv <= 1) {
    formula = { linear: `f(t)=${b}+${m}t`, exp: `f(t)=${b}\\cdot ${q}^{t}`, begr: `f(t)=${S}-${S - b}\\,e^{-${kt(k)}}`, log: `f(t)=${dfrac(S, `1+${a}\\,e^{-${kt(k)}}`)}` }[key];
    warum = { linear: `${tex('t')} steht ohne Hochzahl da: In jedem Schritt kommen ${m} dazu.`, exp: `${tex('t')} steht im Exponenten und es gibt keine Grenze.`, begr: `Eine Zahl minus ein Teil mit ${tex('e^{-kt}')}, der verschwindet: Der Bestand nähert sich ${S}.`, log: `Der Bruch mit ${tex('1+a\\,e^{-kt}')} im Nenner ist die logistische Funktion.` }[key];
  } else if (lv === 2) {
    prompt = { linear: `In ein Becken laufen jede Minute ${m} Liter Wasser. Welches Wachstum ist das?`, exp: `Eine Bakterienkultur ${q === 2 ? 'verdoppelt' : 'verdreifacht'} sich jede Stunde. Welches Wachstum ist das?`,
      begr: `Ein Akku lädt: Je voller er ist, desto langsamer lädt er – bis ${S} Minuten Laufzeit erreicht sind. Am Anfang geht es am schnellsten. Welches Wachstum ist das?`,
      log: `Ein Gerücht in einer Schule mit ${S} Personen: Erst wissen es wenige, dann geht es schnell, am Ende kennen es fast alle. Welches Wachstum ist das?` }[key];
    warum = { linear: 'In gleichen Zeiten kommt gleich viel dazu.', exp: 'In gleichen Zeiten wird mit demselben Faktor vervielfacht.', begr: 'Am Anfang am schnellsten, dann immer langsamer bis zu einer Grenze.', log: 'Erst langsam, dann schnell, dann wieder langsam – eine S-Kurve mit Grenze.' }[key];
  } else if (lv === 3) {
    prompt = 'Die Änderungsrate eines Bestands erfüllt diese Gleichung. Welches Wachstum ist das?';
    formula = { linear: `f'(t)=${m}`, exp: `f'(t)=${ft(k)}\\cdot f(t)`, begr: `f'(t)=${ft(k)}\\cdot\\bigl(${S}-f(t)\\bigr)`, log: `f'(t)=${ft(k / S, 4)}\\cdot f(t)\\cdot\\bigl(${S}-f(t)\\bigr)` }[key];
    F.exp = (t) => b * Math.exp(k * t); f = F[key];
    warum = { linear: 'Die Änderungsrate ist konstant.', exp: 'Die Änderungsrate ist proportional zum Bestand.', begr: 'Die Änderungsrate ist proportional zum Abstand zur Grenze.', log: 'Die Änderungsrate ist proportional zum Bestand und zum Abstand zur Grenze.' }[key];
  } else if (lv === 4) {
    const s = pick([1, 2, 5, 8]);
    F.begr = (t) => s * (100 - 80 * 0.5 ** t); F.log = (t) => (s * 100) / (1 + 9 * (1 / 3) ** t); f = F[key];
    const w = [0, 1, 2, 3, 4].map((t) => Math.round(f(t) * 100) / 100);
    prompt = 'Welches Modell passt zu dieser Wertetabelle?';
    formula = `\\begin{array}{c|ccccc}t&0&1&2&3&4\\\\\\hline f(t)&${w.map((v) => ft(v)).join('&')}\\end{array}`;
    warum = { linear: 'Die Unterschiede von Schritt zu Schritt sind immer gleich.', exp: 'Von Schritt zu Schritt wird immer mit demselben Faktor vervielfacht.', begr: 'Die Zunahmen halbieren sich von Schritt zu Schritt – die Werte nähern sich einer Grenze.', log: 'Die Zunahmen werden erst größer, dann wieder kleiner – eine S-Kurve.' }[key];
  } else {
    const c = pick([2, 3, 5]);
    formula = { linear: `f(t)=${m}\\cdot(t+${c})`, exp: `f(t)=${b}\\,e^{${ft(k)}t}`, begr: `f(t)=${S}\\cdot\\left(1-e^{-${kt(k)}}\\right)`, log: `f(t)=${dfrac(`${S}\\,e^{${ft(k)}t}`, `e^{${ft(k)}t}+${a}`)}` }[key];
    F.linear = (t) => m * (t + c); F.exp = (t) => b * Math.exp(k * t); F.begr = (t) => S * (1 - Math.exp(-k * t)); f = F[key];
    warum = { linear: `Ausmultipliziert steht da ${tex(`${m}t+${m * c}`)} – eine Gerade.`, exp: `Eine e-Funktion mit positivem Exponenten, ohne Grenze.`, begr: `Ausmultipliziert: ${tex(`${S}-${S}\\,e^{-${kt(k)}}`)} – die Grenze ist ${S}.`, log: `Teile Zähler und Nenner durch ${tex(`e^{${ft(k)}t}`)}: Es entsteht ${tex(dfrac(S, `1+${a}\\,e^{-${kt(k)}}`))}.` }[key];
  }
  const options = shuffle(Object.keys(ART).map((x) => ({ tex: `\\text{${ART[x]}}`, key: x, correct: x === key, why: x === key ? undefined : `${ART_WARUM[x]} Hier: ${warum}` })));
  return { prompt, formula, options, hints: ['Vier Modelle: linear (gleich viel dazu), exponentiell (gleicher Faktor), begrenzt (immer langsamer bis zur Grenze), logistisch (S-Kurve).', 'Gibt es eine Grenze? Und wann wächst der Bestand am schnellsten – am Anfang oder mittendrin?'],
    explain: `${ART[key][0].toUpperCase()}${ART[key].slice(1)}es Wachstum: ${warum}`, f, key };
}

/* ───────────── Ebenen genauer ───────────── */

const eq = (n, d) => { let s = ''; n.forEach((c, i) => { if (!c) return; const v = Math.abs(c) === 1 ? '' : ft(Math.abs(c)); s += `${c < 0 ? '-' : s ? '+' : ''}${v}x_${i + 1}`; }); return `${s}=${ft(d)}`; };
const dot = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
const lin2 = (A, r, u, s, v) => A.map((c, i) => c + r * u[i] + s * v[i]);
const cross = (u, v) => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];

/** Spurpunkte: Wo trifft die Ebene eine Koordinatenachse (Stufe 1–4), wo durchstößt eine Gerade die x1x2-Ebene (Stufe 5)? */
export function genSpurpunkt(lv = 3) {
  for (;;) {
    const P = (pt, correct, why) => ({ tex: PT('S', pt), pt, correct, why });
    if (lv >= 5) {
      const v = [pick([1, 2, -1, -2, 3]), pick([1, -1, 2, 3]), pick([1, 2, -1, -2])], t = pick([2, 3, -2, 4]), A = [ri(-3, 5), ri(-4, 4), -t * v[2]];
      const hit = lin2(A, t, v, 0, v), opts = [P(hit, true), P(lin2(A, -t, v, 0, v), false, `Vorzeichen: Aus ${tex(`${A[2]}${v[2] < 0 ? '-' : '+'}${Math.abs(v[2]) === 1 ? '' : Math.abs(v[2])}t=0`)} folgt ${tex(`t=${t}`)}.`),
        P([A[0], A[1], 0], false, 'Nur die dritte Koordinate zu streichen reicht nicht – auch die anderen ändern sich mit t.'), P([0, hit[1], hit[2] || A[2]], false, `In der ${tex('x_1x_2')}-Ebene ist die dritte Koordinate 0, nicht die erste.`)];
      if (!uniq(opts)) continue;
      return { prompt: `Wo durchstößt die Gerade g die ${tex('x_1x_2')}-Ebene (Spurpunkt)?`, formula: `g:\\ \\vec x=${vecTex(A)}+t\\cdot${vecTex(v)}`, options: shuffle(opts),
        hints: [`In der ${tex('x_1x_2')}-Ebene ist ${tex('x_3=0')}.`, `Löse ${tex(`${A[2]}+t\\cdot${par(v[2])}=0`)} und setze ${tex('t')} in die Gerade ein.`],
        explain: `${tex(`x_3=0\\ \\Rightarrow\\ t=${t}`)}. Einsetzen: ${tex(PT('S', hit))}.`, A, v, art: 'gerade' };
    }
    const co = shuffle(tier(lv, [1, 2, 3], [2, 3, 4], [-1, 2, -3], [2, 4, 5], [2, 4, 5])), d = tier(lv, 6, 12, pick([6, 12]), pick([10, 30]), 10) * (lv === 3 ? pick([1, -1]) : 1);
    const ax = lv <= 1 ? 0 : ri(0, 2), val = d / co[ax], on = (x, i) => [0, 0, 0].map((_, j) => (j === i ? x : 0)), other = (ax + 1) % 3;
    const opts = [P(on(val, ax), true), P(on(co[ax], ax), false, `Das ist der Koeffizient vor ${tex(`x_${ax + 1}`)}. Setze die anderen beiden Koordinaten 0 und löse nach ${tex(`x_${ax + 1}`)} auf.`),
      P(on(d, ax), false, `Es fehlt das Teilen durch den Koeffizienten ${tex(ft(co[ax]))}.`), P(on(val, other), false, `Der Wert stimmt, aber er gehört auf die ${tex(`x_${ax + 1}`)}-Achse.`)];
    if (!uniq(opts) || Math.abs(val) === Math.abs(co[ax])) continue;
    const kx = `${co[ax] === 1 ? '' : co[ax] === -1 ? '-' : ft(co[ax])}x_${ax + 1}`;   // „−x₁“ statt „−1 x₁“
    return { prompt: `Wo schneidet die Ebene E die ${tex(`x_${ax + 1}`)}-Achse (Spurpunkt)?`, formula: `E:\\ ${eq(co, d)}`, options: shuffle(opts),
      hints: [`Auf der ${tex(`x_${ax + 1}`)}-Achse sind die anderen beiden Koordinaten 0.`, `Es bleibt ${tex(`${kx}=${ft(d)}`)}.`],
      explain: `Die anderen Koordinaten 0 setzen: ${tex(`${kx}=${ft(d)}\\ \\Rightarrow\\ x_${ax + 1}=${ft(val)}`)}, also ${tex(PT('S', on(val, ax)))}.`, n: co, d, ax, art: 'ebene' };
  }
}

/** Von Punkt und Normalenvektor (oder Normalenform) zur Koordinatengleichung. */
export function genNormalenform(lv = 3) {
  for (;;) {
    const R = tier(lv, 3, 3, 4, 4, 5), neg = lv >= 3;
    const n = [0, 0, 0].map(() => (neg ? ri(-R, R) : ri(lv === 2 ? 0 : 1, R))), Pp = [0, 0, 0].map(() => (neg ? ri(-R + 1, R + 1) : ri(lv === 1 ? 1 : 0, R)));
    if (n.filter((c) => c === 0).length > (lv === 2 ? 1 : 0) || (lv === 2 && !n.includes(0)) || n.every((c) => c === 0)) continue;
    const d = dot(n, Pp), sum = Pp[0] + Pp[1] + Pp[2];
    if (cross(n, Pp).every((c) => c === 0) || d === 0 || Pp.filter((c) => c === 0).length > 1) continue;
    const E = (co, dd, correct, why) => ({ tex: `E:\\ ${eq(co, dd)}`, n: co, d: dd, correct, why });
    const opts = [E(n, d, true), E(n, sum, false, `Rechts steht das Skalarprodukt aus Normalenvektor und Punkt, nicht die Summe der Koordinaten von P.`),
      E(n, -d, false, `Vorzeichen: ${tex('\\vec n\\cdot\\vec x=\\vec n\\cdot\\vec p')} – die rechte Seite ist ${tex(ft(d))}.`), E(Pp, d, false, 'Die Koeffizienten sind die Koordinaten des Normalenvektors, nicht die des Punktes.')];
    if (!uniq(opts)) continue;
    const alsForm = lv >= 4;
    return {
      prompt: alsForm ? 'Die Ebene E ist in Normalenform gegeben. Welche Koordinatengleichung gehört dazu?' : `Die Ebene E geht durch den Punkt P und hat den Normalenvektor ${tex('\\vec n')}. Welche Koordinatengleichung passt?`,
      formula: alsForm ? `E:\\ \\left[\\vec x-${vecTex(Pp)}\\right]\\cdot${vecTex(n)}=0` : `${PT('P', Pp)},\\quad \\vec n=${vecTex(n)}`, options: shuffle(opts),
      hints: [`Die Koordinaten des Normalenvektors sind die Koeffizienten: ${tex('n_1x_1+n_2x_2+n_3x_3=d')}.`, `Für ${tex('d')} den Punkt einsetzen: ${tex(`d=\\vec n\\cdot\\vec p=${n.map((c, i) => `${par(c)}\\cdot${par(Pp[i])}`).join('+')}`)}.`],
      explain: `${tex(`d=${n.map((c, i) => `${par(c)}\\cdot${par(Pp[i])}`).join('+')}=${ft(d)}`)}, also ${tex(`E:\\ ${eq(n, d)}`)}.`, n, P: Pp };
  }
}

/** Parameterform der Ebene: Punkt zu gegebenen Parametern (Stufe 1–3), Parameter zu gegebenem Punkt (Stufe 4–5). */
export function genParamPunkt(lv = 3) {
  for (;;) {
    const R = tier(lv, 2, 3, 3, 4, 5), neg = lv >= 3, z = () => (neg ? ri(-R, R) : ri(0, R));
    const A = [z(), z(), z()], u = [z(), z(), z()], v = [z(), z(), z()];
    const r = pick(tier(lv, [1, 2], [2, 3], [2, -1, 3], [2, 3, -1], [-3, -2, 3, 4])), s = pick(tier(lv, [1, 2], [1, 3], [-2, 1, 2], [-2, 1, 4], [-1, 2, 5]));
    if (r === s || cross(u, v).every((c) => c === 0) || u.filter((c) => c === 0).length > 1 || v.filter((c) => c === 0).length > 1) continue;
    const Q = lin2(A, r, u, s, v), formula = `E:\\ \\vec x=${vecTex(A)}+r\\cdot${vecTex(u)}+s\\cdot${vecTex(v)}`;
    if (lv <= 3) {
      const P = (pt, correct, why) => ({ tex: PT('P', pt), pt, correct, why });
      const opts = [P(Q, true), P(lin2(A, s, u, r, v), false, `Vertauscht: ${tex('r')} gehört zum ersten, ${tex('s')} zum zweiten Richtungsvektor.`),
        P(lin2([0, 0, 0], r, u, s, v), false, 'Der Stützvektor fehlt – er wird immer dazugezählt.'), r > 0 && s > 0 ? P(lin2(A, r, u, 0, v), false, 'Der zweite Richtungsvektor fehlt – beide werden dazugezählt.') : P(lin2(A, Math.abs(r), u, Math.abs(s), v), false, 'Achte auf die Vorzeichen der Parameter.')];
      if (!uniq(opts)) continue;
      return { prompt: `Welcher Punkt der Ebene gehört zu ${tex(`r=${r}`)} und ${tex(`s=${s}`)}?`, formula, options: shuffle(opts),
        hints: ['Setze beide Parameter ein und rechne zeilenweise.', `Erste Zeile: ${tex(`${A[0]}+${par(r)}\\cdot${par(u[0])}+${par(s)}\\cdot${par(v[0])}=${Q[0]}`)}.`],
        explain: `Zeilenweise einsetzen: ${tex(`\\vec x=${vecTex(A)}+${par(r)}\\cdot${vecTex(u)}+${par(s)}\\cdot${vecTex(v)}=${vecTex(Q)}`)}, also ${tex(PT('P', Q))}.`, A, u, v, r, s, art: 'punkt' };
    }
    const Pr = (rr, ss, correct, why) => ({ tex: `r=${rr},\\quad s=${ss}`, r: rr, s: ss, correct, why });
    const opts = [Pr(r, s, true), Pr(s, r, false, `Vertauscht: ${tex('r')} gehört zum ersten, ${tex('s')} zum zweiten Richtungsvektor. Mach die Probe.`),
      Pr(-r, s, false, `Mach die Probe durch Einsetzen: Das Vorzeichen von ${tex('r')} passt nicht.`), Pr(r, -s, false, `Mach die Probe durch Einsetzen: Das Vorzeichen von ${tex('s')} passt nicht.`)];
    if (!uniq(opts) || opts.filter((o) => lin2(A, o.r, u, o.s, v).every((c, i) => c === Q[i])).length !== 1) continue;
    return { prompt: `Der Punkt ${tex(PT('P', Q))} liegt in der Ebene. Mit welchen Parametern erreicht man ihn?`, formula, options: shuffle(opts),
      hints: ['Setze den Punkt links ein: Jede Zeile ist eine Gleichung für r und s.', 'Zwei Zeilen genügen zum Lösen, die dritte ist die Probe. Oder prüfe die Antworten durch Einsetzen.'],
      explain: `Probe: ${tex(`${vecTex(A)}+${par(r)}\\cdot${vecTex(u)}+${par(s)}\\cdot${vecTex(v)}=${vecTex(Q)}`)}.`, A, u, v, Q, art: 'parameter' };
  }
}

for (const [fn, topic] of [[genBegrenzt, 'Begrenztes Wachstum'], [genBegrenztRate, 'Änderungsrate beim begrenzten Wachstum'], [genLogistisch, 'Logistisches Wachstum'], [genWachstumArt, 'Wachstumsmodelle unterscheiden'],
  [genSpurpunkt, 'Spurpunkte'], [genNormalenform, 'Normalenform und Koordinatenform'], [genParamPunkt, 'Parameterform der Ebene']]) fn.topic = topic;
