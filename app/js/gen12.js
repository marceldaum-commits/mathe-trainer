// Aufgaben-Erzeuger, Teil 12: Integral anwenden (Version 2.4.0).
// Drei Aufgaben-Arten, jede mit fünf eigenen Stufen: Mittelwert einer Funktion auf einem Intervall, Bestand aus der Änderungsrate
// (Gesamtänderung, Bestand zu einem Zeitpunkt, Bestandsfunktion, zurück auf den Anfangswert), größter und kleinster Bestand
// (Vorzeichenwechsel der Rate, Vergleich mit den Rändern). Eigene Aufgaben mit eigenen Zahlen; der Lösungsweg nennt jeden
// Rechenschritt mit den Zahlen der Aufgabe. Brüche werden exakt gerechnet (kleine Bruch-Helfer unten), e und π gerundet.
import { ri, pick, shuffle, ft, polyTex } from './math.js';
import { tex } from './ui.js';
import { uniq } from './gen.js';

const T = (t, correct, why) => ({ tex: t, correct, why: correct ? undefined : why });   // Diagnosen nur für Ablenker
const A = (prompt, formula, opts, hints, explain, kind, daten) => (opts && opts.length === 4 && uniq(opts) && opts.filter((o) => o.correct).length === 1 && opts.every((o) => o.correct || o.why) ? { prompt, formula, options: shuffle(opts), hints, explain, kind, daten } : null);
const stufe = (lv) => Math.min(5, Math.max(1, lv | 0 || 3));
const bau = (formen) => (lv = 3) => { const liste = formen[stufe(lv) - 1]; for (;;) { const q = pick(liste)(); if (q) return q; } };
/** Richtige Antwort und die ersten drei verschiedenen Ablenker (in der Reihenfolge der Liste; leere Einträge zählen nicht). */
const wahl = (richtig, kand) => { const aus = [], da = new Set([richtig]); for (const k of kand) { if (!k || da.has(k[0]) || aus.length === 3) continue; da.add(k[0]); aus.push(T(k[0], false, k[1])); } return aus.length === 3 ? [T(richtig, true), ...aus] : null; };
const kl = (x) => (x < 0 ? `(${ft(x)})` : ft(x));
const pm = (x) => (x < 0 ? `-${ft(-x)}` : `+${ft(x)}`);

/* ───── Brüche exakt ───── */
const ggT = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
const Q = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = ggT(n, d); return { n: n / g + 0, d: d / g }; };
const qz = (x) => (typeof x === 'number' ? Q(x) : x);
const qa = (x, y) => Q(x.n * y.d + y.n * x.d, x.d * y.d), qs = (x, y) => Q(x.n * y.d - y.n * x.d, x.d * y.d);
const qm = (x, y) => Q(x.n * y.n, x.d * y.d), qd = (x, y) => Q(x.n * y.d, x.d * y.n);
const qw = (x) => x.n / x.d;
/** Bruch als TeX: 7, -3, \dfrac{13}{3}, -\dfrac{5}{2}. */
const qt = (x) => (x.d === 1 ? `${x.n}` : `${x.n < 0 ? '-' : ''}\\dfrac{${Math.abs(x.n)}}{${x.d}}`);
/** In Klammern, wenn negativ (zum Abziehen und Malnehmen). */
const qk = (x) => (x.n < 0 ? `\\left(${qt(x)}\\right)` : qt(x));
/** Vorfaktor vor einem Buchstaben oder einer Klammer: 1 → nichts, −1 → Minus. */
const koef = (x) => (x.n === x.d ? '' : x.n === -x.d ? '-' : x.d === 1 ? `${x.n}` : `${x.n < 0 ? '-' : ''}\\tfrac{${Math.abs(x.n)}}{${x.d}}`);
const ganz = (x) => x.d === 1;
/** Wurzel aus einem Bruch: exakt, wenn möglich, sonst als Wurzel. */
const wurzelQ = (r) => { const s = (n) => (Number.isInteger(Math.sqrt(n)) ? Math.sqrt(n) : null), zn = s(r.n), zd = s(r.d);
  if (zn !== null && zd !== null) return qt(Q(zn, zd)); return r.d === 1 ? `\\sqrt{${r.n}}` : `\\sqrt{\\tfrac{${r.n}}{${r.d}}}`; };

/* ───── Polynome: c[i] gehört zu x^i (ganze Zahlen); Stammfunktionen mit Brüchen ───── */
const stamm = (c) => [Q(0), ...c.map((a, i) => Q(a, i + 1))];
const qPoly = (cq, v = 'x') => { let out = '';
  for (let i = cq.length - 1; i >= 0; i--) { const a = qz(cq[i]); if (!a.n) continue;
    const ab = Q(Math.abs(a.n), a.d), sign = a.n < 0 ? '-' : out ? '+' : '', k = ab.d === 1 ? `${ab.n}` : `\\tfrac{${ab.n}}{${ab.d}}`;
    out += `${sign}${i > 0 && ab.n === 1 && ab.d === 1 ? '' : k}${i === 0 ? '' : i === 1 ? v : `${v}^{${i}}`}`; }
  return out || '0'; };
const qWert = (cq, x) => { const X = qz(x); let s = Q(0), p = Q(1); for (const a of cq) { s = qa(s, qm(qz(a), p)); p = qm(p, X); } return s; };
const fW = (c, x) => c.reduce((s, k, i) => s + k * x ** i, 0);
/** Stammfunktion an einer ganzen Stelle eingesetzt, z. B. \tfrac{3}{2}\cdot 4^{2}-2\cdot 4. */
const qEin = (cq, x) => { let out = '';
  for (let i = cq.length - 1; i >= 1; i--) { const a = qz(cq[i]); if (!a.n) continue;
    const ab = Q(Math.abs(a.n), a.d), sign = a.n < 0 ? '-' : out ? '+' : '', xs = x < 0 ? `(${x})` : `${x}`, pot = i === 1 ? xs : `${xs}^{${i}}`;
    const k = ab.d === 1 ? `${ab.n}` : `\\tfrac{${ab.n}}{${ab.d}}`;
    out += sign + (ab.n === 1 && ab.d === 1 ? pot : `${k}\\cdot ${pot}`); }
  return out || '0'; };
/** Hauptsatz für ein Polynom mit allen Zwischenwerten. */
const bilanz = (c, a, b, v = 'x', F = 'F') => { const S = stamm(c), Fa = qWert(S, a), Fb = qWert(S, b);
  const ein = (x, w) => (x === 0 ? `${F}(0)=0` : `${F}(${x})=${qEin(S, x)}=${qt(w)}`);
  return { S, Fa, Fb, I: qs(Fb, Fa), st: `${F}(${v})=${qPoly(S, v)}`, fb: ein(b, Fb), fa: ein(a, Fa) }; };
/** Bedeutung des Mittelwerts in einem Satz (bei negativem Mittelwert liegt das Rechteck unter der x-Achse). */
const bedeutung = (aT, bT, mT, neg, ca = '') => ` Bedeutung: Ein Rechteck über ${tex(`[${aT};\\,${bT}]`)} mit der Höhe ${tex(mT)} hat ${ca}dieselbe Flächenbilanz wie der Graph von ${tex('f')} über diesem Intervall${neg ? ' (die Höhe ist negativ: das Rechteck liegt unter der x-Achse)' : ''}.`;
const INT = (a, b, f, v = 'x') => `\\int_{${a}}^{${b}}\\left(${f}\\right)d${v}`;

/* ───── 1. Mittelwert einer Funktion ───── */
const MW = 'm';
/** Ablenker für Polynome: typische Fehler, je mit Diagnose. */
const KM = {
  integral: (c, a, b, B) => [B.I, `Das ist erst das Integral ${tex(`\\int_{${a}}^{${b}}f(x)\\,dx=${qt(B.I)}`)}. Für den Mittelwert wird es noch durch die Intervallbreite ${tex(`b-a=${b - a}`)} geteilt.`],
  halb: (c, a, b, B) => [qd(B.I, Q(2)), `Hier wurde durch 2 geteilt wie beim Mittelwert zweier Zahlen. Geteilt wird aber durch die Intervallbreite ${tex(`b-a=${b - a}`)}.`],
  rand: (c, a, b) => (c.length > 2 ? [Q(fW(c, a) + fW(c, b), 2), `Das ist das Mittel der beiden Randwerte ${tex(`\\tfrac12\\bigl(f(${a})+f(${b})\\bigr)=\\tfrac12\\bigl(${fW(c, a)}${pm(fW(c, b))}\\bigr)`)}. Das stimmt nur bei Geraden – der Graph von ${tex('f')} ist gekrümmt, deshalb braucht man das Integral.`] : null),
  aufleiten: (c, a, b) => [Q(c.reduce((s, k, i) => s + k * (b ** (i + 1) - a ** (i + 1)), 0), b - a), `Beim Aufleiten wurde nicht durch den neuen Exponenten geteilt. Potenzregel: ${tex('\\int x^n\\,dx=\\tfrac{1}{n+1}\\,x^{n+1}')}.`],
  unten: (c, a, b, B) => (B.Fa.n ? [qd(B.Fb, Q(b - a)), `Die untere Grenze fehlt: ${tex(`F(${a})=${qt(B.Fa)}`)} muss von ${tex(`F(${b})`)} abgezogen werden.`] : null),
  plus: (c, a, b, B) => (B.Fa.n ? [qd(qa(B.Fb, B.Fa), Q(b - a)), `Vorzeichenfehler: Nach dem Hauptsatz wird ${tex(`F(${a})=${qt(B.Fa)}`)} abgezogen, nicht addiert.`] : null),
  breite: (c, a, b, B) => (a && b ? [qd(B.I, Q(b)), `Geteilt wurde durch ${tex(`b=${b}`)}. Richtig ist die Intervallbreite ${tex(`b-a=${b}-${kl(a)}=${b - a}`)}.`] : null),
  fb: (c, a, b) => [Q(fW(c, b)), `Das ist ${tex(`f(${b})=${fW(c, b)}`)}, nur der Funktionswert am rechten Rand – nicht der Mittelwert aller Funktionswerte.`],
  fa: (c, a) => [Q(fW(c, a)), `Das ist ${tex(`f(${a})=${fW(c, a)}`)}, nur der Funktionswert am linken Rand – nicht der Mittelwert aller Funktionswerte.`],
};
const mwPoly = (c, a, b, namen, kind) => {
  const fT = polyTex(c), B = bilanz(c, a, b), w = b - a, M = qd(B.I, Q(w)), br = `${b}-${kl(a)}`;
  const opts = wahl(`${MW}=${qt(M)}`, namen.map((n) => KM[n](c, a, b, B)).map((k) => k && [`${MW}=${qt(k[0])}`, k[1]]));
  return A(`Bestimme den Mittelwert ${tex('m')} der Funktion ${tex('f')} auf dem Intervall ${tex(`[${a};\\,${b}]`)}.`, `f(x)=${fT}`, opts,
    [`Mittelwert einer Funktion: ${tex('m=\\dfrac{1}{b-a}\\displaystyle\\int_a^b f(x)\\,dx')}. Hier ist ${tex(`a=${a}`)} und ${tex(`b=${b}`)}, die Intervallbreite ist ${tex(`b-a=${br}=${w}`)}.`,
      `Stammfunktion mit Potenzregel und Summenregel: ${tex(B.st)}. Probe: Ableiten ergibt wieder ${tex(`f(x)=${fT}`)}.`,
      `Grenzen einsetzen: ${tex(B.fb)} und ${tex(B.fa)}.`,
      `Hauptsatz: ${tex(`${INT(a, b, fT)}=F(${b})-F(${a})=${qt(B.Fb)}-${qk(B.Fa)}=${qt(B.I)}`)}.`,
      `Durch die Intervallbreite teilen: ${tex(`m=\\dfrac{1}{${w}}\\cdot ${qk(B.I)}=${qt(M)}`)}.`],
    `${tex(`m=\\dfrac{1}{${br}}${INT(a, b, fT)}=\\dfrac{1}{${w}}\\Bigl[${qPoly(B.S)}\\Bigr]_{${a}}^{${b}}=\\dfrac{1}{${w}}\\cdot\\bigl(${qt(B.Fb)}-${qk(B.Fa)}\\bigr)=\\dfrac{1}{${w}}\\cdot ${qk(B.I)}=${qt(M)}`)}.${bedeutung(a, b, qt(M), M.n < 0)}`,
    kind, { c, a, b, m: qw(M) });
};
const mw1 = () => { const m = pick([1, 2, 3, 4, -1, -2]), c0 = ri(-3, 8), b = ri(2, 6); if (!c0 || (m * b) % 2) return null;
  return mwPoly([c0, m], 0, b, ['integral', 'halb', 'fb', 'fa'], 'mittel'); };
const mw2 = () => { const a2 = pick([1, 2, 3, -1, -2]), b = ri(2, 5), c = ri(0, 1) ? [0, pick([1, 2, -2, 4, -4]), a2] : [pick([1, 2, 3, 4, -1, -3]), 0, a2];
  return mwPoly(c, 0, b, ['integral', 'rand', 'aufleiten', 'fb'], 'mittel'); };
const mw3 = () => { const a = pick([-3, -2, -1, 1, 2]), b = a + ri(2, 4), c = [ri(-4, 5), pick([-3, -2, -1, 1, 2, 3]), pick([1, 2, -1, 3, -2])];
  return mwPoly(c, a, b, ['unten', 'rand', 'plus', 'breite', 'integral'], 'mittel'); };
const mw4a = () => { const a = pick([-2, -1, 1, 2]), b = a + ri(2, 4), c = [ri(-3, 5), ri(-4, 4), ri(-3, 3), pick([1, -1, 2])];
  return mwPoly(c, a, b, ['plus', 'unten', 'aufleiten', 'rand', 'breite'], 'mittel'); };
/* Umgekehrt: obere Grenze aus dem Mittelwert */
const mw4b = () => { const k = ri(1, 4), b = ri(2, 6); if ((k * b * b) % 3) return null;
  const m = (k * b * b) / 3, fT = polyTex([0, 0, k]), k3 = qPoly([0, 0, 0, Q(k, 3)], 'b'), k3b2 = qPoly([0, 0, Q(k, 3)], 'b');
  const opts = wahl(`b=${b}`, [[`b=${b * b}`, `Das ist ${tex(`b^2=${b * b}`)}. Es fehlt noch die Wurzel.`],
    [`b=${wurzelQ(Q(m, k))}`, `Hier wurde ${tex(`f(b)=${m}`)} gesetzt. Gesucht ist aber der Mittelwert aller Funktionswerte auf ${tex('[0;\\,b]')}, nicht der Wert am rechten Rand.`],
    [`b=${wurzelQ(Q(2 * m, k))}`, `Die Stammfunktion von ${tex(fT)} ist ${tex(qPoly([0, 0, 0, Q(k, 3)]))} – hier wurde durch 2 statt durch 3 geteilt.`]]);
  return A(`Für welche obere Grenze ${tex('b>0')} hat die Funktion ${tex('f')} auf dem Intervall ${tex('[0;\\,b]')} den Mittelwert ${tex(`m=${m}`)}?`, `f(x)=${fT}`, opts,
    [`Ansatz mit der Mittelwert-Formel: ${tex(`\\dfrac{1}{b-0}\\displaystyle\\int_0^b ${fT}\\,dx=${m}`)}.`,
      `Stammfunktion (Potenzregel): ${tex(`F(x)=${qPoly([0, 0, 0, Q(k, 3)])}`)}, also ${tex(`\\int_0^b ${fT}\\,dx=F(b)-F(0)=${k3}-0=${k3}`)}.`,
      `Durch die Intervallbreite ${tex('b')} teilen: ${tex(`m=\\dfrac{1}{b}\\cdot ${k3}=${k3b2}`)}.`,
      `Gleichsetzen: ${tex(`${k3b2}=${m}`)}, also ${tex(`b^2=${m}\\cdot\\dfrac{3}{${k}}=${b * b}`)}.`,
      `Wurzel ziehen: ${tex(`b=\\sqrt{${b * b}}=${b}`)}. Die Lösung ${tex(`-${b}`)} entfällt, weil die rechte Grenze ${tex('b>0')} sein soll. Probe: ${tex(`\\dfrac{1}{${b}}\\displaystyle\\int_0^{${b}}${fT}\\,dx=\\dfrac{1}{${b}}\\cdot ${qt(Q(k, 3))}\\cdot ${b}^3=\\dfrac{1}{${b}}\\cdot ${k * b * b * b / 3}=${m}`)}.`],
    `${tex(`\\dfrac{1}{b}\\displaystyle\\int_0^b ${fT}\\,dx=\\dfrac{1}{b}\\cdot ${k3}=${k3b2}`)}. Aus ${tex(`${k3b2}=${m}`)} folgt ${tex(`b^2=${b * b}`)} und wegen ${tex('b>0')}: ${tex(`b=${b}`)}.`, 'mittelb', { k, m, b }); };
/* Stufe 5: e-Funktion und Sinus/Kosinus (Ergebnis gerundet) */
const expo = (k, v = 'x') => (Math.abs(qw(k)) === 1 ? `${qw(k) < 0 ? '-' : ''}${v}` : `${ft(qw(k))}${v}`);
/** Rest eines Terms mit Vorzeichen anhängen: „+3x-1“, leer bei 0. */
const rest = (s) => (s === '0' ? '' : s.startsWith('-') ? s : `+${s}`);
const mw5a = () => { const k = pick([Q(1), Q(2), Q(1, 2), Q(-1), Q(-1, 2)]), c = ri(1, 5), m = pick([1, 2, 3, -1, -2]), d = pick([1, 2, 3, -1, -2, -3]), a = pick([0, 1, -1, 2, -2]), b = a + pick([1, 2, 3]);
  if (Math.max(Math.abs(qw(k) * a), Math.abs(qw(k) * b)) > 4) return null;
  const P = [d, m], SP = stamm(P), kx = expo(k), Af = qd(Q(c), k), w = b - a, K = qw(k), ce = c === 1 ? '' : c;
  const fT = `${ce}e^{${kx}}${rest(polyTex(P))}`, FT = `${koef(Af)}e^{${kx}}${rest(qPoly(SP))}`;
  const Fn = (x) => qw(Af) * Math.exp(K * x) + qw(qWert(SP, x)), fn = (x) => c * Math.exp(K * x) + m * x + d, Fa = Fn(a), Fb = Fn(b), I = Fb - Fa, M = I / w, pd = qs(qWert(SP, b), qWert(SP, a));
  const ein = (x) => (x === 0 ? `F(0)=${qt(Af)}\\cdot e^{0}${SP.some((q) => q.n) ? '+0' : ''}=${qt(Af)}` : `F(${x})=${koef(Af)}e^{${ft(K * x)}}${rest(qEin(SP, x))}\\approx ${ft(Fn(x), 3)}`);
  const ex = `${koef(Af)}\\left(e^{${ft(K * b)}}-${a ? `e^{${ft(K * a)}}` : '1'}\\right)${pd.n ? rest(qt(pd)) : ''}`;
  const opts = wahl(`${MW}\\approx ${ft(M)}`, [[`${MW}\\approx ${ft(I)}`, `Das ist erst das Integral ${tex(`\\int_{${a}}^{${b}}f(x)\\,dx\\approx ${ft(I)}`)}. Es fehlt noch das Teilen durch die Intervallbreite ${tex(`${w}`)}.`],
    K !== 1 ? [`${MW}\\approx ${ft((c * (Math.exp(K * b) - Math.exp(K * a)) + qw(pd)) / w)}`, `Beim Aufleiten wurde nicht durch die innere Ableitung ${tex(ft(K))} geteilt. Probe: ${tex(`\\bigl(${ce}e^{${kx}}\\bigr)'=${qt(qm(Q(c), k))}e^{${kx}}`)} – das ist nicht ${tex(`${ce}e^{${kx}}`)}.`] : null,
    Math.abs(Fa) > 1e-9 ? [`${MW}\\approx ${ft(Fb / w)}`, `Die untere Grenze fehlt: ${tex(`F(${a})\\approx ${ft(Fa, 3)}`)} ist nicht 0${a ? '' : `, denn ${tex('e^0=1')}`} und muss abgezogen werden.`] : null,
    [`${MW}\\approx ${ft((fn(a) + fn(b)) / 2)}`, `Das ist das Mittel der Randwerte ${tex(`\\tfrac12\\bigl(f(${a})+f(${b})\\bigr)`)}. Das stimmt nur bei Geraden.`],
    a && b ? [`${MW}\\approx ${ft(I / b)}`, `Geteilt wurde durch ${tex(`b=${b}`)}. Richtig ist die Intervallbreite ${tex(`b-a=${b}-${kl(a)}=${w}`)}.`] : null]);
  return A(`Bestimme den Mittelwert ${tex('m')} der Funktion ${tex('f')} auf dem Intervall ${tex(`[${a};\\,${b}]`)}. Runde auf zwei Nachkommastellen.`, `f(x)=${fT}`, opts,
    [`Mittelwert einer Funktion: ${tex('m=\\dfrac{1}{b-a}\\displaystyle\\int_a^b f(x)\\,dx')} mit ${tex(`a=${a}`)} und ${tex(`b=${b}`)}, also ${tex(`b-a=${b}-${kl(a)}=${w}`)}.`,
      `Stammfunktion Summand für Summand (Summenregel, Faktorregel). ${K === 1 ? `Bei ${tex('e^{x}')} bleibt der Faktor ${tex(`${c}`)} stehen, denn ${tex("(e^x)'=e^x")}.` : `Bei ${tex(`e^{${kx}}`)} wird durch die innere Ableitung ${tex(ft(K))} geteilt (Kettenregel rückwärts): ${tex(`\\dfrac{${c}}{${ft(K)}}=${qt(Af)}`)}.`} Der Rest ${tex(polyTex(P))} wird mit der Potenzregel aufgeleitet: ${tex(qPoly(SP))}. Zusammen: ${tex(`F(x)=${FT}`)}.`,
      `Probe: ${tex(K === 1 ? `F'(x)=${fT}` : `F'(x)=${qk(Af)}\\cdot ${kl(K)}\\cdot e^{${kx}}${rest(polyTex(P))}=${fT}`)}.`,
      `Grenzen einsetzen: ${tex(ein(b))} und ${tex(ein(a))}.`,
      `Hauptsatz: ${tex(`\\int_{${a}}^{${b}}f(x)\\,dx=F(${b})-F(${a})=${ex}\\approx ${ft(I, 3)}`)}.`,
      `Durch die Intervallbreite teilen: ${tex(`m=\\dfrac{1}{${w}}\\cdot\\Bigl(${ex}\\Bigr)\\approx ${ft(M)}`)}.`],
    `${tex(`m=\\dfrac{1}{${b}-${kl(a)}}\\int_{${a}}^{${b}}\\left(${fT}\\right)dx=\\dfrac{1}{${w}}\\Bigl[${FT}\\Bigr]_{${a}}^{${b}}=\\dfrac{1}{${w}}\\Bigl(${ex}\\Bigr)\\approx ${ft(M)}`)}.${bedeutung(a, b, ft(M), M < 0, 'ungefähr ')}`, 'mittel', { c, k: K, m, d, a, b, mw: M }); };
/* Sinus und Kosinus: G ist die Stammfunktion ohne Faktor (−cos bzw. sin), g die Funktion selbst; Stellen als Vielfache von π. */
const TRIG = [
  { g: 'sin', aT: '0', bT: '\\pi', aQ: Q(0), bQ: Q(1), Ga: -1, Gb: 1, ga: 0, gb: 0 },
  { g: 'sin', aT: '0', bT: '\\tfrac{\\pi}{2}', aQ: Q(0), bQ: Q(1, 2), Ga: -1, Gb: 0, ga: 0, gb: 1 },
  { g: 'sin', aT: '\\tfrac{\\pi}{2}', bT: '\\pi', aQ: Q(1, 2), bQ: Q(1), Ga: 0, Gb: 1, ga: 1, gb: 0 },
  { g: 'cos', aT: '0', bT: '\\tfrac{\\pi}{2}', aQ: Q(0), bQ: Q(1, 2), Ga: 0, Gb: 1, ga: 1, gb: 0 },
  { g: 'cos', aT: '\\tfrac{\\pi}{2}', bT: '\\pi', aQ: Q(1, 2), bQ: Q(1), Ga: 1, Gb: 0, ga: 0, gb: -1 },
];
const piT = (q) => `${koef(q)}\\pi`;
/** ganze Zahl plus Vielfaches von π als TeX, z. B. 2+\tfrac{3}{2}\pi. */
const mitPi = (z, q) => (z ? `${z}${q.n ? rest(piT(q)) : ''}` : q.n ? piT(q) : '0');
const mw5b = () => { const t = pick(TRIG), a = pick([1, 2, 3, 4, 5, -2, -3]), d = pick([0, 1, 2, 3, 4]), sin = t.g === 'sin', wQ = qs(t.bQ, t.aQ), w = qw(wQ) * Math.PI;
  const wT = wQ.d === 1 ? '\\pi' : '\\tfrac{\\pi}{2}', aw = qw(t.aQ) * Math.PI, bw = qw(t.bQ) * Math.PI, ka = (x) => (x === 1 ? '' : x === -1 ? '-' : x);
  const fT = `${ka(a)}\\${t.g}(x)${d ? pm(d) : ''}`, dx = d ? (d === 1 ? '+x' : `${pm(d)}x`) : '', FT = sin ? `${ka(-a)}\\cos(x)${dx}` : `${ka(a)}\\sin(x)${dx}`;
  const J = t.Gb - t.Ga, I = a * J + d * w, M = I / w, num = (a * J) / qw(wQ), exI = mitPi(a * J, qm(Q(d), wQ));
  const exM = `${num < 0 ? '-' : ''}\\dfrac{${Math.abs(num)}}{\\pi}${d ? pm(d) : ''}`;
  const Fv = (G, PQ) => mitPi(a * G, qm(Q(d), PQ)), Fz = (G, PQ) => a * G + d * qw(PQ) * Math.PI;
  const ein = (PT, G, PQ) => `F\\left(${PT}\\right)=${sin ? -a : a}\\cdot\\${sin ? 'cos' : 'sin'}\\left(${PT}\\right)${d ? `${pm(d)}\\cdot ${PT}` : ''}=${Fv(G, PQ)}`;
  const Fa = Fz(t.Ga, t.aQ), Fb = Fz(t.Gb, t.bQ), Fat = Fv(t.Ga, t.aQ), klam = (s) => (/^\d+$/.test(s) ? s : `\\left(${s}\\right)`);
  const werte = sin ? `\\cos\\left(${t.aT}\\right)=${-t.Ga}` + `,\\ \\cos\\left(${t.bT}\\right)=${-t.Gb}` : `\\sin\\left(${t.aT}\\right)=${t.Ga},\\ \\sin\\left(${t.bT}\\right)=${t.Gb}`;
  const opts = wahl(`${MW}\\approx ${ft(M)}`, [[`${MW}\\approx ${ft(I)}`, `Das ist erst das Integral ${tex(`\\int_{${t.aT}}^{${t.bT}}f(x)\\,dx\\approx ${ft(I)}`)}. Es fehlt noch das Teilen durch die Intervallbreite ${tex(wT)}.`],
    [`${MW}\\approx ${ft((-a * J + d * w) / w)}`, `Vorzeichenfehler bei der Stammfunktion: ${sin ? tex('\\int\\sin(x)\\,dx=-\\cos(x)') : tex('\\int\\cos(x)\\,dx=\\sin(x)')}. Probe durch Ableiten.`],
    [`${MW}\\approx ${ft((a * t.ga + d + a * t.gb + d) / 2)}`, `Das ist das Mittel der Randwerte ${tex(`\\tfrac12\\bigl(f(${t.aT})+f(${t.bT})\\bigr)`)}. Das stimmt nur bei Geraden.`],
    Math.abs(Fa) > 1e-9 ? [`${MW}\\approx ${ft(Fb / w)}`, `Die untere Grenze fehlt: ${tex(`F\\left(${t.aT}\\right)=${Fat}`)} ist nicht 0 und muss abgezogen werden.`] : null,
    aw ? [`${MW}\\approx ${ft(I / bw)}`, `Geteilt wurde durch ${tex(`b=${t.bT}`)}. Richtig ist die Intervallbreite ${tex(`b-a=${wT}`)}.`] : null]);
  return A(`Bestimme den Mittelwert ${tex('m')} der Funktion ${tex('f')} auf dem Intervall ${tex(`[${t.aT};\\,${t.bT}]`)}. Runde auf zwei Nachkommastellen.`, `f(x)=${fT}`, opts,
    [`Mittelwert einer Funktion: ${tex('m=\\dfrac{1}{b-a}\\displaystyle\\int_a^b f(x)\\,dx')} mit ${tex(`a=${t.aT}`)} und ${tex(`b=${t.bT}`)}, also ${tex(`b-a=${t.bT}-${t.aT}=${wT}`)}.`,
      `Stammfunktion Summand für Summand (Summenregel, Faktorregel): ${sin ? tex('\\int\\sin(x)\\,dx=-\\cos(x)') : tex('\\int\\cos(x)\\,dx=\\sin(x)')}${d ? ` und ${tex(`\\int ${d}\\,dx=${d === 1 ? '' : d}x`)}` : ''}, also ${tex(`F(x)=${FT}`)}. Probe: ${tex(sin ? `F'(x)=${-a}\\cdot\\bigl(-\\sin(x)\\bigr)${d ? pm(d) : ''}=${fT}` : `F'(x)=${a}\\cdot\\cos(x)${d ? pm(d) : ''}=${fT}`)}.`,
      `Werte im Bogenmaß: ${tex(werte)}.`,
      `Grenzen einsetzen: ${tex(ein(t.bT, t.Gb, t.bQ))} und ${tex(ein(t.aT, t.Ga, t.aQ))}.`,
      `Hauptsatz: ${tex(`\\int_{${t.aT}}^{${t.bT}}f(x)\\,dx=${Fv(t.Gb, t.bQ)}-${klam(Fat)}=${exI}${d ? `\\approx ${ft(I, 3)}` : ''}`)}.`,
      `Durch die Intervallbreite ${tex(wT)} teilen, dabei ist ${tex(`\\dfrac{1}{${wT}}=\\dfrac{${wQ.d}}{\\pi}`)}: ${tex(`m=\\dfrac{${wQ.d}}{\\pi}\\cdot\\left(${exI}\\right)=${exM}\\approx ${ft(M)}`)}.`],
    `${tex(`m=\\dfrac{1}{${wT}}\\int_{${t.aT}}^{${t.bT}}\\left(${fT}\\right)dx=\\dfrac{1}{${wT}}\\Bigl[${FT}\\Bigr]_{${t.aT}}^{${t.bT}}=\\dfrac{1}{${wT}}\\left(${exI}\\right)=${exM}\\approx ${ft(M)}`)}.${bedeutung(t.aT, t.bT, ft(M), M < 0, 'ungefähr ')}`, 'mittel', { a, d, g: t.g, m: M }); };
export const genMittelwertFkt = bau([[mw1], [mw2], [mw3], [mw4a, mw4b], [mw5a, mw5b]]);

/* ───── Sachzusammenhänge für Bestand und Änderungsrate ───── */
const KX = [
  { satz: 'In ein Becken wird Wasser gepumpt; zeitweise läuft auch Wasser ab.', B: 'die Wassermenge im Becken', G: 'der Wassermenge im Becken', e: '\\text{m}^3', ew: 'Kubikmetern', re: 'Kubikmetern pro Stunde', zt: '\\text{h}', zw: 'Stunden', ganz: false },
  { satz: 'Ein Stausee bekommt Wasser aus Flüssen und gibt Wasser an ein Kraftwerk ab.', B: 'die Wassermenge im Stausee', G: 'der Wassermenge im Stausee', e: '\\text{Mio. m}^3', ew: 'Millionen Kubikmetern', re: 'Millionen Kubikmetern pro Tag', zt: '\\text{d}', zw: 'Tagen', ganz: false },
  { satz: 'In einer Nährlösung entstehen neue Bakterien, andere sterben ab.', B: 'die Zahl der Bakterien', G: 'der Zahl der Bakterien', e: '\\text{Tausend}', ew: 'Tausend', re: 'Tausend Bakterien pro Stunde', zt: '\\text{h}', zw: 'Stunden', ganz: false },
  { satz: 'In einen Freizeitpark kommen Besucher, andere gehen nach Hause.', B: 'die Zahl der Besucher im Park', G: 'der Zahl der Besucher im Park', e: '\\text{Personen}', ew: 'Personen', re: 'Personen pro Stunde', zt: '\\text{h}', zw: 'Stunden', ganz: true },
];
const satz = (K) => `${K.satz} Die momentane Änderungsrate ${K.G} wird durch die Funktion ${tex('r')} beschrieben (${tex('t')} in ${K.zw}, ${tex('r(t)')} in ${K.re}).`;
const E = (K, x) => `${qt(x)}\\,${K.e}`;
const Z = (K, x) => `t=${qt(qz(x))}\\,${K.zt}`;
const gross = (K) => K.B[0].toUpperCase() + K.B.slice(1);
/** Bleibt der Bestand B0 + R(t) − R(t0) auf [t0; t1] positiv? (Abtasten in kleinen Schritten.) */
const qN = (cq, x) => cq.reduce((s, a, i) => s + qw(qz(a)) * x ** i, 0);
const positiv = (B0, S, t0, t1) => { for (let i = 0; i <= 400; i++) { const t = t0 + ((t1 - t0) * i) / 400; if (qw(B0) + qN(S, t) - qN(S, t0) <= 0) return false; } return true; };
/** Bei Personen nur ganze Zahlen. */
const passt = (K, ...xs) => !K.ganz || xs.every((x) => ganz(qz(x)));

/* ───── 2. Bestand aus der Änderungsrate ───── */
const b1 = () => { const K = pick(KX), f = K.ganz ? 10 : 1, m = ri(1, 6) * f, c0 = ri(1, 8) * f, T = ri(2, 6); if ((m * T) % 2) return null;
  const r = [c0, m], rT = polyTex(r, 't'), B = bilanz(r, 0, T, 't', 'R'), rEnd = m * T + c0;
  const D = (x) => `\\Delta B=${E(K, x)}`;
  const opts = wahl(D(B.I), [[D(Q(rEnd)), `Das ist ${tex(`r(${T})=${rEnd}`)}, die Rate am Ende. Sie sagt, wie schnell sich der Bestand ändert – nicht, um wie viel.`],
    [D(Q(rEnd * T)), `Hier wurde ${tex(`r(${T})\\cdot ${T}`)} gerechnet, als wäre die Rate die ganze Zeit ${tex(`${rEnd}`)}. Sie steigt aber erst allmählich auf diesen Wert.`],
    [D(Q(m * T * T + c0 * T)), `Beim Aufleiten von ${tex(polyTex([0, m], 't'))} fehlt der Faktor ${tex('\\tfrac12')}: richtig ist ${tex(B.st)}.`],
    [D(Q(c0 * T)), `Hier wurde nur die Anfangsrate ${tex(`r(0)=${c0}`)} mal ${tex(`${T}`)} gerechnet – die Rate wächst aber.`]]);
  return A(`${satz(K)} Um wie viel nimmt ${K.B} zwischen ${tex('t=0')} und ${tex(`t=${T}`)} zu?`, `r(t)=${rT}`, opts,
    [`Die Rate ${tex('r(t)')} sagt, wie schnell sich der Bestand ändert. Die Gesamtänderung ist das Integral der Rate: ${tex(`\\Delta B=\\int_0^{${T}}r(t)\\,dt`)}.`,
      `Stammfunktion der Rate (Potenzregel, Summenregel): ${tex(B.st)}.`,
      `Hauptsatz: ${tex(B.fb)} und ${tex(B.fa)}, also ${tex(`\\Delta B=R(${T})-R(0)=${qt(B.Fb)}-0=${qt(B.I)}`)}.`,
      `Einheit: ${K.re} mal ${K.zw} ergibt ${K.ew}. ${gross(K)} nimmt um ${tex(E(K, B.I))} zu.`],
    `${tex(`\\Delta B=${INT(0, T, rT, 't')}=\\Bigl[${qPoly(B.S, 't')}\\Bigr]_0^{${T}}=${qt(B.Fb)}-0=${qt(B.I)}`)}. ${gross(K)} nimmt um ${tex(E(K, B.I))} zu.`, 'aenderung', { r, T }); };
/** Bestand zum Zeitpunkt T aus Anfangsbestand und Rate (Polynom). */
const bestandT = (K, r, B0, T, falsch, kind) => {
  const rT = polyTex(r, 't'), B = bilanz(r, 0, T, 't', 'R'), BT = qa(Q(B0), B.I);
  if (!passt(K, B.I) || !positiv(Q(B0), B.S, 0, T)) return null;
  const opts = wahl(`B(${T})=${E(K, BT)}`, falsch(B, BT).map((k) => k && [`B(${T})=${E(K, k[0])}`, k[1]]));
  return A(`${satz(K)} Zu Beginn ist ${tex(`B(0)=${B0}\\,${K.e}`)}. Wie groß ist ${K.B} zum Zeitpunkt ${tex(`t=${T}`)}?`, `r(t)=${rT}`, opts,
    [`Bestand = Anfangsbestand + Änderung: ${tex(`B(${T})=B(0)+\\int_0^{${T}}r(t)\\,dt`)}.`,
      `Stammfunktion der Rate (Potenzregel, Summenregel): ${tex(B.st)}.`,
      `Änderung nach dem Hauptsatz: ${tex(B.fb)}, ${tex(B.fa)}, also ${tex(`\\int_0^{${T}}r(t)\\,dt=${qt(B.Fb)}-0=${qt(B.I)}`)}.${B.I.n < 0 ? ' Das Minus heißt: Insgesamt hat der Bestand abgenommen.' : ''}`,
      `Anfangsbestand dazu: ${tex(`B(${T})=${B0}+${qk(B.I)}=${qt(BT)}`)}.`],
    `${tex(`B(${T})=B(0)+${INT(0, T, rT, 't')}=${B0}+\\Bigl[${qPoly(B.S, 't')}\\Bigr]_0^{${T}}=${B0}+${qk(B.I)}=${qt(BT)}`)}. Zum Zeitpunkt ${tex(`t=${T}`)} beträgt ${K.B} ${tex(E(K, BT))}.`, kind, { r, B0, T });
};
const b2 = () => { const K = pick(KX), f = K.ganz ? 10 : 1, m = pick([-3, -2, -1, 1, 2, 3]) * f, c0 = ri(2, 9) * f, T = ri(2, 6), B0 = ri(3, 15) * 5 * f, r = [c0, m]; if ((m * T) % 2) return null;
  return bestandT(K, r, B0, T, (B, BT) => [[B.I, `Das ist nur die Änderung ${tex(`\\int_0^{${T}}r(t)\\,dt=${qt(B.I)}`)}. Der Anfangsbestand ${tex(`B(0)=${B0}`)} fehlt.`],
    [Q(B0 + fW(r, T)), `Hier wurde die Rate ${tex(`r(${T})=${fW(r, T)}`)} addiert. Eine Rate ist kein Bestand – addiert wird das Integral der Rate.`],
    [qs(Q(B0), B.I), `Vorzeichenfehler: Die Änderung ${tex(`${qt(B.I)}`)} wird zum Anfangsbestand addiert.`],
    [Q(B0 + fW(r, T) * T), `Hier wurde ${tex(`r(${T})\\cdot ${T}`)} gerechnet, als wäre die Rate die ganze Zeit gleich. Sie ändert sich aber.`]], 'bestandT'); };
const b3a = () => { const K = pick(KX), f = K.ganz ? 10 : 1, r = [ri(-5, 10) * f, ri(-6, 6) * f, pick([-2, -1, 1, 2]) * f], t1 = ri(1, 3), t2 = t1 + ri(2, 4);
  const rT = polyTex(r, 't'), S = stamm(r), R1 = qWert(S, t1), R2 = qWert(S, t2), I = qs(R2, R1); if (!I.n || !passt(K, I)) return null;
  const wrong = Q(r.reduce((s, k, i) => s + k * (t2 ** (i + 1) - t1 ** (i + 1)), 0)), D = (x) => `\\Delta B=${E(K, x)}`;
  const opts = wahl(D(I), [[D(R2), `Die untere Grenze fehlt: ${tex(`R(${t1})=${qt(R1)}`)} muss abgezogen werden – gefragt ist die Änderung ab ${tex(`t=${t1}`)}.`],
    [D(Q(fW(r, t2) - fW(r, t1))), `Das ist ${tex(`r(${t2})-r(${t1})`)}, die Änderung der Rate. Gesucht ist die Änderung des Bestands, also das Integral der Rate.`],
    [D(qs(R1, R2)), `Grenzen vertauscht: Gerechnet wird obere minus untere Grenze, ${tex(`R(${t2})-R(${t1})`)}.`],
    [D(wrong), `Beim Aufleiten wurde nicht durch den neuen Exponenten geteilt. Potenzregel: ${tex('\\int t^n\\,dt=\\tfrac{1}{n+1}\\,t^{n+1}')}.`]]);
  return A(`${satz(K)} Um wie viel ändert sich ${K.B} zwischen ${tex(`t=${t1}`)} und ${tex(`t=${t2}`)}? Ein negatives Ergebnis bedeutet eine Abnahme.`, `r(t)=${rT}`, opts,
    [`Die Änderung des Bestands ist das Integral der Rate über diesen Zeitraum: ${tex(`\\Delta B=\\int_{${t1}}^{${t2}}r(t)\\,dt`)}.`,
      `Stammfunktion der Rate (Potenzregel, Summenregel): ${tex(`R(t)=${qPoly(S, 't')}`)}.`,
      `Grenzen einsetzen: ${tex(`R(${t2})=${qEin(S, t2)}=${qt(R2)}`)} und ${tex(`R(${t1})=${qEin(S, t1)}=${qt(R1)}`)}.`,
      `Hauptsatz: ${tex(`\\Delta B=R(${t2})-R(${t1})=${qt(R2)}-${qk(R1)}=${qt(I)}`)}. ${I.n > 0 ? `${gross(K)} nimmt um ${tex(E(K, I))} zu.` : `${gross(K)} nimmt um ${tex(E(K, Q(-I.n, I.d)))} ab.`}`],
    `${tex(`\\Delta B=${INT(t1, t2, rT, 't')}=\\Bigl[${qPoly(S, 't')}\\Bigr]_{${t1}}^{${t2}}=${qt(R2)}-${qk(R1)}=${qt(I)}`)}. ${I.n > 0 ? 'Der Bestand nimmt in dieser Zeit zu.' : 'Der Bestand nimmt in dieser Zeit ab.'}`, 'aenderung', { r, t1, t2 }); };
const b3b = () => { const K = pick(KX), f = K.ganz ? 10 : 1, r = [ri(0, 10) * f, ri(-6, 6) * f, pick([-2, -1, 1, 2]) * f], T = ri(2, 5), B0 = ri(4, 20) * 5 * f;
  return bestandT(K, r, B0, T, (B) => [[B.I, `Das ist nur die Änderung ${tex(`\\int_0^{${T}}r(t)\\,dt=${qt(B.I)}`)}. Der Anfangsbestand ${tex(`B(0)=${B0}`)} fehlt.`],
    [Q(B0 + fW(r, T)), `Hier wurde die Rate ${tex(`r(${T})=${fW(r, T)}`)} addiert. Eine Rate ist kein Bestand – addiert wird das Integral der Rate.`],
    [Q(B0 + r.reduce((s, k, i) => s + k * T ** (i + 1), 0)), `Beim Aufleiten wurde nicht durch den neuen Exponenten geteilt. Potenzregel: ${tex('\\int t^n\\,dt=\\tfrac{1}{n+1}\\,t^{n+1}')}.`],
    [qs(Q(B0), B.I), `Vorzeichenfehler: Die Änderung ${tex(`${qt(B.I)}`)} wird zum Anfangsbestand addiert.`]], 'bestandT'); };
const b4a = () => { const K = pick(KX), f = K.ganz ? 12 : 1, a3 = pick([-1, 1]) * f, a2 = ri(-3, 3) * f, p = ri(-6, 6) * f, c0 = ri(1, 9) * f, B0 = ri(4, 20) * 5 * (K.ganz ? 10 : 1), r = [c0, p, a2, a3];
  const S = stamm(r), Bc = [Q(B0), ...S.slice(1)], rT = polyTex(r, 't'); if (!passt(K, ...S) || !positiv(Q(B0), S, 0, 4)) return null;
  const opts = wahl(`B(t)=${qPoly(Bc, 't')}`, [[`B(t)=${qPoly(S, 't')}`, `Der Anfangsbestand fehlt: Diese Funktion liefert ${tex('B(0)=0')} statt ${tex(`B(0)=${B0}`)}.`],
    [`B(t)=${polyTex([B0 + p, 2 * a2, 3 * a3], 't')}`, `Die Rate wurde abgeleitet statt aufgeleitet. Es muss ${tex("B'(t)=r(t)")} gelten.`],
    [`B(t)=${polyTex([B0, c0, p, a2, a3], 't')}`, `Beim Aufleiten wurde nicht durch den neuen Exponenten geteilt. Probe: Die Ableitung ergibt nicht ${tex('r(t)')}.`],
    [`B(t)=${polyTex([B0 + c0, p, a2, a3], 't')}`, `Das ist nur die Rate plus Anfangsbestand. Der Bestand entsteht aus dem Integral der Rate.`]]);
  return A(`${satz(K)} Zu Beginn ist ${tex(`B(0)=${B0}\\,${K.e}`)}. Welche Funktion ${tex('B')} gibt den Bestand zum Zeitpunkt ${tex('t')} an?`, `r(t)=${rT}`, opts,
    [`Bestand = Anfangsbestand + Änderung bis zum Zeitpunkt ${tex('t')}: ${tex('B(t)=B(0)+\\int_0^t r(s)\\,ds')}. Die Integrationsvariable heißt ${tex('s')}, weil ${tex('t')} schon die obere Grenze ist.`,
      `Stammfunktion der Rate (Potenzregel, Summenregel): ${tex(`R(s)=${qPoly(S, 's')}`)}.`,
      `Hauptsatz: ${tex(`\\int_0^t r(s)\\,ds=R(t)-R(0)=${qPoly(S, 't')}-0`)}.`,
      `Anfangsbestand dazu: ${tex(`B(t)=R(t)+${B0}=${qPoly(Bc, 't')}`)}.`,
      `Probe: ${tex(`B(0)=${B0}`)} und ${tex(`B'(t)=${rT}=r(t)`)}.`],
    `${tex(`B(t)=${B0}+\\int_0^t\\left(${polyTex(r, 's')}\\right)ds=${B0}+\\Bigl[${qPoly(S, 's')}\\Bigr]_0^{t}=${qPoly(Bc, 't')}`)}.`, 'bestandsfkt', { r, B0 }); };
const b4b = () => { const K = pick(KX), q = ri(1, 3), ts = pick([3, 6, 9]), g = K.ganz ? pick([10, 20]) : pick([1, 1, 2]), p = (2 * q * ts) / 3, r = [0, g * p, -g * q];
  const S = stamm(r), rT = polyTex(r, 't'), tt = Q(3 * p, 2 * q), z = Q(p, q);
  const opts = wahl(Z(K, tt), [[Z(K, z), `Bei ${tex(`t=${qt(z)}`)} ist ${tex('r(t)=0')}: Dort hört die Zunahme auf, der Bestand ist am größten. Zurück auf dem Anfangswert ist er erst später.`],
    [Z(K, Q(p, 2 * q)), `Dort ist die Rate am größten – der Bestand nimmt am schnellsten zu, ist aber noch lange nicht zurück auf dem Anfangswert.`],
    [Z(K, Q(2 * p, 3 * q)), `Hier wurden beim Ausklammern die Brüche ${tex('\\tfrac12')} und ${tex('\\tfrac13')} vertauscht. Probe: ${tex(`R\\left(${qt(Q(2 * p, 3 * q))}\\right)=${qt(qWert(S, Q(2 * p, 3 * q)))}`)} ist nicht 0.`]]);
  return A(`${satz(K)} Zu welchem Zeitpunkt ${tex('t>0')} ist ${K.B} wieder genauso groß wie zu Beginn?`, `r(t)=${rT}`, opts,
    [`Genauso groß wie zu Beginn heißt: Die Gesamtänderung seit ${tex('t=0')} ist null, ${tex('\\int_0^{t}r(s)\\,ds=0')}.`,
      `Stammfunktion (Potenzregel): ${tex(`R(t)=${qPoly(S, 't')}`)}, also ${tex(`\\int_0^{t}r(s)\\,ds=R(t)-R(0)=${qPoly(S, 't')}`)}.`,
      `Null setzen und ${tex('t^2')} ausklammern: ${tex(`t^2\\cdot\\left(${qPoly([Q(g * p, 2), Q(-g * q, 3)], 't')}\\right)=0`)}.`,
      `${tex('t=0')} ist der Start. Sonst muss die Klammer null sein: ${tex(`${koef(Q(g * q, 3))}t=${qt(Q(g * p, 2))}`)}${Q(g * q, 3).n === Q(g * q, 3).d ? '' : `, also ${tex(`t=${qt(Q(g * p, 2))}:${qk(Q(g * q, 3))}=${qt(tt)}`)}`}. Probe: ${tex(`R(${qt(tt)})=${qEin(S, qw(tt))}=0`)}.`,
      `Bedeutung: Bis ${tex(`t=${qt(z)}`)} ist ${tex('r(t)>0')} (Zunahme), danach ${tex('r(t)<0')} (Abnahme). Bei ${tex(`t=${qt(tt)}`)} ist die Abnahme genauso groß wie die Zunahme vorher.`],
    `${tex(`\\int_0^{t}r(s)\\,ds=${qPoly(S, 't')}=t^2\\left(${qPoly([Q(g * p, 2), Q(-g * q, 3)], 't')}\\right)=0`)} ergibt für ${tex('t>0')}: ${tex(`t=${qt(tt)}`)}. Nach ${tex(`${qt(tt)}`)} ${K.zw} ist ${K.B} wieder so groß wie zu Beginn.`, 'zurueck', { r }); };
const b5a = () => { const K = pick(KX.filter((k) => !k.ganz)), k = pick([Q(1, 2), Q(1, 4), Q(1, 5), Q(1, 10)]), a = ri(2, 12) * 5, T = ri(2, 10), B0 = ri(2, 20) * 10;
  const ak = qw(qd(Q(a), k)), kT = ft(qw(k) * T), e = Math.exp(-qw(k) * T), I = ak * (1 - e), BT = B0 + I, kt = ft(qw(k)), Bt = (x) => `B(${T})\\approx ${ft(x)}\\,${K.e}`;
  const opts = wahl(Bt(BT), [[Bt(B0 + a * (1 - e)), `Beim Aufleiten wurde nicht durch die innere Ableitung ${tex(`-${kt}`)} geteilt. Probe: Die Ableitung von ${tex(`-${a}e^{-${kt}t}`)} ist nicht ${tex('r(t)')}.`],
    [Bt(B0 - ak * e), `Die untere Grenze fehlt: ${tex(`R(0)=-${ak}\\cdot e^{0}=-${ak}`)} ist nicht 0, denn ${tex('e^0=1')}.`],
    [Bt(I), `Das ist nur der Zufluss ${tex(`\\int_0^{${T}}r(t)\\,dt\\approx ${ft(I)}`)}. Der Anfangsbestand ${tex(`B(0)=${B0}`)} fehlt.`],
    [Bt(B0 - I), `Vorzeichenfehler: Die Rate ist positiv, der Bestand nimmt also zu.`]]);
  return A(`${satz(K)} Die Rate nimmt mit der Zeit ab. Zu Beginn ist ${tex(`B(0)=${B0}\\,${K.e}`)}. Wie groß ist ${K.B} zum Zeitpunkt ${tex(`t=${T}`)}? Runde auf zwei Nachkommastellen.`, `r(t)=${a}e^{-${kt}t}`, opts,
    [`Bestand = Anfangsbestand + Änderung: ${tex(`B(${T})=B(0)+\\int_0^{${T}}r(t)\\,dt`)}.`,
      `Stammfunktion (Kettenregel rückwärts: durch die innere Ableitung ${tex(`-${kt}`)} teilen): ${tex(`R(t)=\\dfrac{${a}}{-${kt}}\\,e^{-${kt}t}=-${ak}e^{-${kt}t}`)}. Probe: ${tex(`R'(t)=-${ak}\\cdot(-${kt})\\cdot e^{-${kt}t}=${a}e^{-${kt}t}`)}.`,
      `Grenzen einsetzen: ${tex(`R(${T})=-${ak}e^{-${kT}}\\approx ${ft(-ak * e, 3)}`)} und ${tex(`R(0)=-${ak}\\cdot e^{0}=-${ak}`)}.`,
      `Hauptsatz: ${tex(`\\int_0^{${T}}r(t)\\,dt=R(${T})-R(0)=-${ak}e^{-${kT}}+${ak}=${ak}\\left(1-e^{-${kT}}\\right)\\approx ${ft(I, 3)}`)}.`,
      `Anfangsbestand dazu: ${tex(`B(${T})=${B0}+${ak}\\left(1-e^{-${kT}}\\right)\\approx ${ft(BT)}`)}.`],
    `${tex(`B(${T})=${B0}+\\int_0^{${T}}${a}e^{-${kt}t}\\,dt=${B0}+\\Bigl[-${ak}e^{-${kt}t}\\Bigr]_0^{${T}}=${B0}+${ak}\\left(1-e^{-${kT}}\\right)\\approx ${ft(BT)}`)}. Zum Zeitpunkt ${tex(`t=${T}`)} beträgt ${K.B} etwa ${tex(`${ft(BT)}\\,${K.e}`)}.`, 'bestandE', { a, k: qw(k), B0, T }); };
const b5b = () => { const K = pick(KX), f = K.ganz ? 12 : 1, r = [ri(0, 10) * f, ri(-6, 6) * f, ri(-4, 4) * f, pick([1, -1]) * f], t1 = ri(1, 3), t2 = t1 + ri(1, 3), B1 = ri(6, 30) * 5 * (K.ganz ? 10 : 1);
  const rT = polyTex(r, 't'), S = stamm(r), R1 = qWert(S, t1), R2 = qWert(S, t2), I = qs(R2, R1), B2 = qa(Q(B1), I); if (!I.n || !passt(K, I, R2) || !positiv(Q(B1), S, t1, t2)) return null;
  const wrong = Q(r.reduce((s, k, i) => s + k * (t2 ** (i + 1) - t1 ** (i + 1)), 0)), Bx = (x) => `B(${t2})=${E(K, x)}`;
  const opts = wahl(Bx(B2), [[Bx(qa(Q(B1), R2)), `Hier wurde ab ${tex('t=0')} integriert. Bekannt ist aber der Bestand bei ${tex(`t=${t1}`)} – also wird nur die Änderung von ${tex(`t=${t1}`)} bis ${tex(`t=${t2}`)} addiert.`],
    [Bx(I), `Das ist nur die Änderung ${tex(`\\int_{${t1}}^{${t2}}r(t)\\,dt=${qt(I)}`)}. Der bekannte Bestand ${tex(`B(${t1})=${B1}`)} fehlt.`],
    [Bx(qs(Q(B1), I)), `Vorzeichenfehler: Die Änderung ${tex(qt(I))} wird addiert.`],
    [Bx(qa(Q(B1), wrong)), `Beim Aufleiten wurde nicht durch den neuen Exponenten geteilt. Potenzregel: ${tex('\\int t^n\\,dt=\\tfrac{1}{n+1}\\,t^{n+1}')}.`]]);
  return A(`${satz(K)} Zum Zeitpunkt ${tex(`t=${t1}`)} beträgt der Bestand ${tex(`B(${t1})=${B1}\\,${K.e}`)}. Wie groß ist ${K.B} zum Zeitpunkt ${tex(`t=${t2}`)}?`, `r(t)=${rT}`, opts,
    [`Bekannt ist der Bestand bei ${tex(`t=${t1}`)}. Also: ${tex(`B(${t2})=B(${t1})+\\int_{${t1}}^{${t2}}r(t)\\,dt`)}.`,
      `Stammfunktion der Rate (Potenzregel, Summenregel): ${tex(`R(t)=${qPoly(S, 't')}`)}.`,
      `Grenzen einsetzen: ${tex(`R(${t2})=${qEin(S, t2)}=${qt(R2)}`)} und ${tex(`R(${t1})=${qEin(S, t1)}=${qt(R1)}`)}.`,
      `Hauptsatz: ${tex(`\\int_{${t1}}^{${t2}}r(t)\\,dt=${qt(R2)}-${qk(R1)}=${qt(I)}`)}.`,
      `Bekannten Bestand dazu: ${tex(`B(${t2})=${B1}+${qk(I)}=${qt(B2)}`)}.`],
    `${tex(`B(${t2})=B(${t1})+${INT(t1, t2, rT, 't')}=${B1}+\\Bigl[${qPoly(S, 't')}\\Bigr]_{${t1}}^{${t2}}=${B1}+${qk(I)}=${qt(B2)}`)}. Zum Zeitpunkt ${tex(`t=${t2}`)} beträgt ${K.B} ${tex(E(K, B2))}.`, 'bestandT1', { r, t1, t2, B1 }); };
export const genBestand = bau([[b1], [b2], [b3a, b3b], [b4a, b4b], [b5a, b5b]]);

/* ───── 3. Größter und kleinster Bestand ───── */
const RW = 'Für den Bestand gilt $B\'(t)=r(t)$: Solange $r(t)>0$ ist, nimmt der Bestand zu, solange $r(t)<0$ ist, nimmt er ab.';
const regelText = () => RW.replace(/\$([^$]+)\$/g, (_, s) => tex(s));
const e1 = () => { const K = pick(KX), f = K.ganz ? 10 : 1, m = ri(1, 5) * f, t0 = ri(2, 6), c0 = m * t0, T = 2 * t0 + ri(1, 4), r = [c0, -m], rT = polyTex(r, 't');
  const opts = wahl(Z(K, t0), [[Z(K, 0), `Zu Beginn ist die Rate am größten. Solange ${tex('r(t)>0')} ist, wächst der Bestand aber weiter.`],
    [Z(K, T), `Ab ${tex(`t=${t0}`)} ist ${tex('r(t)<0')}: Der Bestand nimmt bis zum Ende wieder ab.`],
    [Z(K, 2 * t0), `Bei ${tex(`t=${2 * t0}`)} ist der Bestand wieder so groß wie zu Beginn, denn ${tex(`\\int_0^{${2 * t0}}r(t)\\,dt=0`)}.`]]);
  return A(`${satz(K)} Betrachtet wird der Zeitraum ${tex(`0\\le t\\le ${T}`)}. Zu welchem Zeitpunkt ist ${K.B} am größten?`, `r(t)=${rT}`, opts,
    [regelText(),
      `Nullstelle der Rate: ${tex(`${rT}=0`)} ergibt ${tex(`${polyTex([0, m], 't')}=${c0}`)}, also ${tex(`t=${t0}`)}.`,
      `Vorzeichenwechsel prüfen: ${tex(`r(0)=${c0}>0`)} und ${tex(`r(${T})=${fW(r, T)}<0`)}. Die Rate wechselt bei ${tex(`t=${t0}`)} von + nach −: Bis dahin nimmt der Bestand zu, danach ab.`,
      `Ränder: Bei ${tex('t=0')} ist der Bestand kleiner (er nimmt danach noch zu), bei ${tex(`t=${T}`)} auch (er hat vorher abgenommen). Am größten ist er bei ${tex(`t=${t0}`)}.`],
    `${tex(`r(t)=${rT}`)} ist positiv für ${tex(`t<${t0}`)} und negativ für ${tex(`t>${t0}`)}. Wegen ${tex("B'(t)=r(t)")} steigt der Bestand bis ${tex(`t=${t0}`)} und fällt danach: Am größten ist er bei ${tex(Z(K, t0))}.`, 'maxzeit', { r, T }); };
const e2 = () => { const K = pick(KX), f = K.ganz ? 10 : 1, a = ri(1, 3) * f, z = pick([2, 4, 6]), T = 2 * z, r = [0, a * z, -a], rT = polyTex(r, 't'), S = stamm(r);
  const opts = wahl(Z(K, z), [[Z(K, z / 2), `Bei ${tex(`t=${z / 2}`)} ist die Rate am größten – der Bestand wächst dort am schnellsten, aber er wächst danach weiter.`],
    [Z(K, (3 * z) / 2), `Bei ${tex(`t=${(3 * z) / 2}`)} ist der Bestand wieder so groß wie zu Beginn: ${tex(`\\int_0^{${(3 * z) / 2}}r(t)\\,dt=0`)}.`],
    [Z(K, 0), `Am Anfang ist ${tex('r(t)>0')} – der Bestand wächst also noch.`], [Z(K, T), `Nach ${tex(`t=${z}`)} ist ${tex('r(t)<0')}: Bis zum Ende nimmt der Bestand ab.`]]);
  return A(`${satz(K)} Betrachtet wird der Zeitraum ${tex(`0\\le t\\le ${T}`)}. Zu welchem Zeitpunkt ist ${K.B} am größten?`, `r(t)=${rT}`, opts,
    [regelText(),
      `Nullstellen der Rate durch Ausklammern: ${tex(`${rT}=${a === 1 ? '' : a}t\\,(${z}-t)=0`)} ergibt ${tex('t=0')} oder ${tex(`t=${z}`)}.`,
      `Vorzeichen: ${tex(`r(${z / 2})=${fW(r, z / 2)}>0`)} und ${tex(`r(${T})=${fW(r, T)}<0`)}. Bei ${tex(`t=${z}`)} wechselt die Rate von + nach −.`,
      `Ränder genau prüfen mit dem Hauptsatz: ${tex(`R(t)=${qPoly(S, 't')}`)}. ${tex(`B(${z})-B(0)=R(${z})-R(0)=${qEin(S, z)}=${qt(qWert(S, z))}>0`)} und ${tex(`B(${T})-B(${z})=R(${T})-R(${z})=${qt(qWert(S, T))}-${qk(qWert(S, z))}=${qt(qs(qWert(S, T), qWert(S, z)))}<0`)}.`,
      `Also ist ${tex(`B(${z})`)} größer als beide Randwerte ${tex('B(0)')} und ${tex(`B(${T})`)}: Am größten ist der Bestand bei ${tex(`t=${z}`)}.`],
    `${tex(`r(t)=${a === 1 ? '' : a}t\\,(${z}-t)`)} ist zwischen 0 und ${z} positiv, danach negativ. Der Bestand steigt bis ${tex(`t=${z}`)} und fällt danach: größter Bestand bei ${tex(Z(K, z))}.`, 'maxzeit', { r, T }); };
/** Rate a·(t−t1)(t−t2) mit Nullstellen-Rechnung (pq-Formel) für die Tipps. */
const zwei = (a, t1, t2) => { const s = t1 + t2, p = t1 * t2, h = Q(s, 2), w = Q(t2 - t1, 2), r = [a * p, -a * s, a];
  const pq = `${a === 1 ? '' : `Durch ${tex(`${a}`)} teilen: ${tex(`t^2-${s}t+${p}=0`)}. `}pq-Formel: ${tex(`t=${qt(h)}\\pm\\sqrt{${qt(qm(h, h))}-${p}}=${qt(h)}\\pm ${qt(w)}`)}, also ${tex(`t_1=${t1}`)} und ${tex(`t_2=${t2}`)}.`;
  return { r, s, p, mid: h, pq }; };
const e3 = () => { const K = pick(KX), f = K.ganz ? 10 : 1, t1 = ri(1, 2), t2 = 3 * t1 + ri(1, 3), a = ri(1, 2) * f, T = t2 + ri(1, 3), { r, mid, pq } = zwei(a, t1, t2), rT = polyTex(r, 't'), S = stamm(r), D = qWert(S, t2);
  const opts = wahl(Z(K, t2), [[Z(K, t1), `Bei ${tex(`t=${t1}`)} wechselt die Rate von + nach −: Dort ist der Bestand lokal am größten, nicht am kleinsten.`],
    [Z(K, 0), `Randwert prüfen: ${tex(`B(${t2})-B(0)=\\int_0^{${t2}}r(t)\\,dt=${qt(D)}<0`)}. Bei ${tex(`t=${t2}`)} ist also weniger da als zu Beginn.`],
    [Z(K, mid), `Dort ist die Rate am kleinsten – der Bestand nimmt am schnellsten ab. Er nimmt aber danach weiter ab bis ${tex(`t=${t2}`)}.`], [Z(K, T), `Ab ${tex(`t=${t2}`)} ist ${tex('r(t)>0')}: Der Bestand wächst bis zum Ende wieder.`]]);
  return A(`${satz(K)} Betrachtet wird der Zeitraum ${tex(`0\\le t\\le ${T}`)}. Zu welchem Zeitpunkt ist ${K.B} am kleinsten?`, `r(t)=${rT}`, opts,
    [`${regelText()} Kleinster Bestand: dort, wo ${tex('r')} von − nach + wechselt – oder am Rand.`,
      `Nullstellen der Rate: ${tex(`${rT}=0`)}. ${pq}`,
      `Vorzeichen: ${tex(`r(0)=${fW(r, 0)}>0`)}, ${tex(`r\\left(${qt(mid)}\\right)=${qt(qWert(r, mid))}<0`)}, ${tex(`r(${T})=${fW(r, T)}>0`)}. Bei ${tex(`t=${t1}`)}: Vorzeichenwechsel + nach − (lokales Maximum), bei ${tex(`t=${t2}`)}: − nach + (lokales Minimum).`,
      `Randwert vergleichen mit dem Hauptsatz: ${tex(`R(t)=${qPoly(S, 't')}`)}, ${tex(`B(${t2})-B(0)=R(${t2})-R(0)=${qEin(S, t2)}=${qt(D)}`)}.`,
      `Weil ${tex(`${qt(D)}<0`)} ist, liegt ${tex(`B(${t2})`)} unter ${tex('B(0)')}. Nach ${tex(`t=${t2}`)} wächst der Bestand wieder. Am kleinsten ist er bei ${tex(`t=${t2}`)}.`],
    `${tex(`r(t)=${a === 1 ? '' : a}(t-${t1})(t-${t2})`)}: Vorzeichenwechsel − nach + bei ${tex(`t=${t2}`)}; Vergleich mit dem Rand: ${tex(`B(${t2})-B(0)=${qt(D)}<0`)}. Kleinster Bestand bei ${tex(Z(K, t2))}.`, 'minzeit', { r, T }); };
const e4a = () => { const K = pick(KX), f = K.ganz ? 6 : 1, a = ri(1, 3) * f, z = pick([2, 3, 4, 6]), T = 2 * z, r = [0, a * z, -a], rT = polyTex(r, 't'), S = stamm(r);
  const Dz = qWert(S, z), DT = qWert(S, T), B0 = Math.ceil(-qw(DT)) + ri(2, 12) * 5 * (K.ganz ? 10 : 1), Bm = qa(Q(B0), Dz), Bx = (x) => `B_{\\max}=${E(K, x)}`;
  if (!passt(K, Dz, DT, qWert(S, Q(z, 2))) || !positiv(Q(B0), S, 0, T)) return null;
  const opts = wahl(Bx(Bm), [[Bx(Dz), `Das ist nur die Zunahme bis ${tex(`t=${z}`)}. Der Anfangsbestand ${tex(`B(0)=${B0}`)} fehlt.`],
    [Bx(qa(Q(B0), qWert(r, Q(z, 2)))), `Hier wurde die größte Rate ${tex(`r\\left(${qt(Q(z, 2))}\\right)=${qt(qWert(r, Q(z, 2)))}`)} addiert. Eine Rate ist kein Bestand.`],
    [Bx(qa(Q(B0), qWert(S, Q(z, 2)))), `Integriert wurde nur bis ${tex(`t=${qt(Q(z, 2))}`)}, wo die Rate am größten ist. Der Bestand wächst aber bis ${tex(`t=${z}`)}.`],
    [Bx(qa(Q(B0), DT)), `Das ist der Bestand am Ende bei ${tex(`t=${T}`)}. Nach ${tex(`t=${z}`)} hat er aber schon wieder abgenommen.`]]);
  return A(`${satz(K)} Zu Beginn ist ${tex(`B(0)=${B0}\\,${K.e}`)}. Betrachtet wird der Zeitraum ${tex(`0\\le t\\le ${T}`)}. Wie groß ist ${K.B} höchstens?`, `r(t)=${rT}`, opts,
    [`${regelText()} Größter Bestand: dort, wo ${tex('r')} von + nach − wechselt – oder am Rand.`,
      `Nullstellen durch Ausklammern: ${tex(`${rT}=${a === 1 ? '' : a}t\\,(${z}-t)=0`)}, also ${tex('t=0')} oder ${tex(`t=${z}`)}. Vorzeichen: ${tex(`r(1)=${fW(r, 1)}>0`)}, ${tex(`r(${T})=${fW(r, T)}<0`)}. Vorzeichenwechsel + nach − bei ${tex(`t=${z}`)}; an den Rändern ist der Bestand kleiner.`,
      `Stammfunktion (Potenzregel): ${tex(`R(t)=${qPoly(S, 't')}`)}.`,
      `Zunahme bis zum Maximum (Hauptsatz): ${tex(`\\int_0^{${z}}r(t)\\,dt=R(${z})-R(0)=${qEin(S, z)}=${qt(Dz)}`)}.`,
      `Anfangsbestand dazu: ${tex(`B(${z})=${B0}+${qt(Dz)}=${qt(Bm)}`)}.`],
    `Größter Bestand bei ${tex(`t=${z}`)} (Vorzeichenwechsel von ${tex('r')} von + nach −): ${tex(`B(${z})=${B0}+${INT(0, z, rT, 't')}=${B0}+${qt(Dz)}=${qt(Bm)}`)}, also ${tex(E(K, Bm))}.`, 'maxwert', { r, B0, T }); };
const e4b = () => { const K = pick(KX), f = K.ganz ? 6 : 1, t1 = ri(1, 2), t2 = 3 * t1 + ri(1, 3), a = ri(1, 2) * f, T = t2 + ri(1, 2), { r, mid, pq } = zwei(a, t1, t2), rT = polyTex(r, 't'), S = stamm(r);
  const D = qWert(S, t2), D1 = qWert(S, t1), DT = qWert(S, T), B0 = Math.ceil(-qw(D)) + ri(2, 12) * 5 * (K.ganz ? 10 : 1), Bm = qa(Q(B0), D), Bx = (x) => `B_{\\min}=${E(K, x)}`;
  if (!passt(K, D, D1, DT) || !positiv(Q(B0), S, 0, T)) return null;
  const opts = wahl(Bx(Bm), [[Bx(qa(Q(B0), D1)), `Das ist der Bestand bei ${tex(`t=${t1}`)}. Dort wechselt ${tex('r')} von + nach − – das ist ein lokales Maximum.`],
    [Bx(D), `Das ist nur die Änderung ${tex(`\\int_0^{${t2}}r(t)\\,dt=${qt(D)}`)}. Der Anfangsbestand ${tex(`B(0)=${B0}`)} fehlt.`],
    [Bx(Q(B0)), `Das ist der Bestand am Anfang. Bei ${tex(`t=${t2}`)} ist weniger da, denn ${tex(`B(${t2})-B(0)=${qt(D)}<0`)}.`],
    [Bx(qa(Q(B0), DT)), `Das ist der Bestand am Ende. Ab ${tex(`t=${t2}`)} wächst der Bestand wieder.`]]);
  return A(`${satz(K)} Zu Beginn ist ${tex(`B(0)=${B0}\\,${K.e}`)}. Betrachtet wird der Zeitraum ${tex(`0\\le t\\le ${T}`)}. Wie groß ist ${K.B} mindestens?`, `r(t)=${rT}`, opts,
    [`${regelText()} Kleinster Bestand: dort, wo ${tex('r')} von − nach + wechselt – oder am Rand.`,
      `Nullstellen der Rate: ${tex(`${rT}=0`)}. ${pq} Vorzeichen: ${tex(`r(0)=${fW(r, 0)}>0`)}, ${tex(`r\\left(${qt(mid)}\\right)=${qt(qWert(r, mid))}<0`)}, ${tex(`r(${T})=${fW(r, T)}>0`)}: Vorzeichenwechsel − nach + bei ${tex(`t=${t2}`)}.`,
      `Stammfunktion (Potenzregel, Summenregel): ${tex(`R(t)=${qPoly(S, 't')}`)}.`,
      `Änderung bis ${tex(`t=${t2}`)} (Hauptsatz): ${tex(`\\int_0^{${t2}}r(t)\\,dt=R(${t2})-R(0)=${qEin(S, t2)}=${qt(D)}`)}. Negativ: ${tex(`B(${t2})`)} liegt unter dem Randwert ${tex(`B(0)=${B0}`)}; nach ${tex(`t=${t2}`)} wächst der Bestand wieder.`,
      `Kleinster Bestand: ${tex(`B(${t2})=${B0}+${qk(D)}=${qt(Bm)}`)}.`],
    `Kleinster Bestand bei ${tex(`t=${t2}`)}: ${tex(`B(${t2})=${B0}+${INT(0, t2, rT, 't')}=${B0}+${qk(D)}=${qt(Bm)}`)}, also ${tex(E(K, Bm))}.`, 'minwert', { r, B0, T }); };
/* Stufe 5: zwei Vorzeichenwechsel – der Rand kann gewinnen */
const e5 = () => { const K = pick(KX), max = ri(0, 1) === 1, f = K.ganz ? 6 : 1, t1 = ri(1, 3), t2 = t1 + ri(1, 2 * t1 + 3), a = ri(1, 2) * f; if (t2 === 3 * t1) return null;
  const T = t2 + ri(1, 2), z = zwei(a, t1, t2), r = max ? z.r.map((x) => -x) : z.r, rT = polyTex(r, 't'), S = stamm(r), D = qWert(S, t2), D1 = qWert(S, t1), Dm = qWert(S, z.mid), DT = qWert(S, T);
  const tief = Math.min(0, ...[D, D1, DT].map(qw)), B0 = Math.ceil(-tief) + ri(2, 10) * 5 * (K.ganz ? 10 : 1);
  if (!passt(K, D, D1, DT, Dm) || !positiv(Q(B0), S, 0, T)) return null;
  const innen = max ? D.n > 0 : D.n < 0, ts = innen ? t2 : 0, Bs = innen ? qa(Q(B0), D) : Q(B0), was = max ? 'größten' : 'kleinsten';
  const P = (t, v) => `${Z(K, t)}\\text{ mit }B=${E(K, v)}`;
  const opts = wahl(P(ts, Bs), [innen ? [P(0, Q(B0)), `Der Randwert ${tex(`B(0)=${B0}`)} verliert: ${tex(`B(${t2})-B(0)=${qt(D)}`)} ist ${max ? 'positiv' : 'negativ'}.`]
    : [P(t2, qa(Q(B0), D)), `Bei ${tex(`t=${t2}`)} liegt nur ein lokales ${max ? 'Maximum' : 'Minimum'}. Vergleich mit dem Rand: ${tex(`B(${t2})-B(0)=${qt(D)}`)} ist ${max ? 'negativ – zu Beginn war mehr da' : 'positiv – zu Beginn war weniger da'}.`],
  [P(t1, qa(Q(B0), D1)), `Bei ${tex(`t=${t1}`)} wechselt ${tex('r')} von ${max ? '− nach +' : '+ nach −'}: Dort liegt ein lokales ${max ? 'Minimum' : 'Maximum'}.`],
  innen ? [P(t2, D), `Das ist nur die Änderung ${tex(`\\int_0^{${t2}}r(t)\\,dt=${qt(D)}`)}. Der Anfangsbestand fehlt.`] : [P(T, qa(Q(B0), DT)), `Das ist der Bestand am Ende. Er ist ${max ? 'kleiner' : 'größer'}, als er bei ${tex(`t=${t2}`)} war.`],
  [P(z.mid, qa(Q(B0), Dm)), `Dort ist die Rate am ${max ? 'größten' : 'kleinsten'} – nicht der Bestand.`]]);
  const vz = (x) => (x > 0 ? '>0' : '<0');
  return A(`${satz(K)} Zu Beginn ist ${tex(`B(0)=${B0}\\,${K.e}`)}. Betrachtet wird der Zeitraum ${tex(`0\\le t\\le ${T}`)}. Wann ist ${K.B} am ${was}, und wie groß ist ${K.B} dann?`, `r(t)=${rT}`, opts,
    [`${regelText()} Kandidaten für den ${was} Bestand: Stellen, an denen ${tex('r')} von ${max ? '+ nach −' : '− nach +'} wechselt, und die Ränder ${tex('t=0')} und ${tex(`t=${T}`)}.`,
      `Nullstellen der Rate: ${tex(`${rT}=0`)}. ${max ? `Mit ${tex('-1')} malnehmen: ${tex(`${polyTex(z.r, 't')}=0`)}. ` : ''}${z.pq}`,
      `Vorzeichen: ${tex(`r(0)=${fW(r, 0)}${vz(fW(r, 0))}`)}, ${tex(`r\\left(${qt(z.mid)}\\right)=${qt(qWert(r, z.mid))}${vz(qw(qWert(r, z.mid)))}`)}, ${tex(`r(${T})=${fW(r, T)}${vz(fW(r, T))}`)}. Vorzeichenwechsel ${max ? '+ nach −' : '− nach +'} bei ${tex(`t=${t2}`)}. Danach ${max ? 'fällt' : 'steigt'} der Bestand bis ${tex(`t=${T}`)}, der rechte Rand scheidet aus.`,
      `Vergleich mit dem linken Rand (Hauptsatz): ${tex(`R(t)=${qPoly(S, 't')}`)}, ${tex(`B(${t2})-B(0)=R(${t2})-R(0)=${qEin(S, t2)}=${qt(D)}`)}.`,
      innen ? `${tex(`${qt(D)}${vz(qw(D))}`)}: Bei ${tex(`t=${t2}`)} ist ${max ? 'mehr' : 'weniger'} da als zu Beginn. Ergebnis: ${tex(`t=${t2}`)} mit ${tex(`B(${t2})=${B0}+${qk(D)}=${qt(Bs)}`)}.`
        : `${tex(`${qt(D)}${vz(qw(D))}`)}: Zu Beginn war ${max ? 'mehr' : 'weniger'} da als bei ${tex(`t=${t2}`)}. Der Rand gewinnt: ${tex('t=0')} mit ${tex(`B(0)=${B0}`)}.`],
    `Kandidaten: ${tex(`t=${t2}`)} (Vorzeichenwechsel ${max ? '+ nach −' : '− nach +'}) und der Rand ${tex('t=0')}. ${tex(`B(${t2})-B(0)=\\int_0^{${t2}}r(t)\\,dt=${qt(D)}`)}, also ist ${K.B} bei ${tex(Z(K, ts))} am ${was}: ${tex(`B=${E(K, Bs)}`)}.`, max ? 'randmax' : 'randmin', { r, B0, T }); };
export const genBestandExtrem = bau([[e1], [e2], [e3], [e4a, e4b], [e5]]);

for (const [fn, name, topic] of [[genMittelwertFkt, 'genMittelwertFkt', 'Mittelwert einer Funktion'], [genBestand, 'genBestand', 'Bestand aus Änderungsrate'], [genBestandExtrem, 'genBestandExtrem', 'Größter und kleinster Bestand']]) { Object.defineProperty(fn, 'name', { value: name }); fn.topic = topic; }
export const GENS12 = { genMittelwertFkt, genBestand, genBestandExtrem };
