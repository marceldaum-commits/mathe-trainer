// Aufgaben-Erzeuger, Teil 14 (Version 2.5.6): Nullstellen finden – Ausklammern, Substitution (biquadratisch), Polynomdivision.
// Alle Nullstellen sind ganze Zahlen; jede Aufgabe hat fünf Stufen, falsche Antworten sind typische Fehler mit Diagnose
// (Probe durch Einsetzen oder benannter Fehler). Zufall nur über ri/pick/shuffle.
import { ri, pick, shuffle } from './math.js';
import { tex } from './ui.js';
import { uniq } from './gen.js';

const T = (t, correct, why) => ({ tex: t, correct, why: correct ? undefined : why });
const A = (prompt, formula, opts, hints, explain, kind, daten) => (opts && opts.length === 4 && uniq(opts) && opts.filter((o) => o.correct).length === 1 && opts.every((o) => o.correct || o.why) ? { prompt, formula, options: shuffle(opts), hints, explain, kind, daten } : null);
const stufe = (lv) => Math.min(5, Math.max(1, lv | 0 || 3));
const bau = (formen) => (lv = 3) => { const liste = formen[stufe(lv) - 1]; for (;;) { const q = pick(liste)(); if (q) return q; } };
const wahl = (richtig, kand) => { const aus = [], da = new Set([richtig]); for (const k of kand) { if (!k || da.has(k[0]) || aus.length === 3) continue; da.add(k[0]); aus.push(T(k[0], false, k[1])); } return aus.length === 3 ? [T(richtig, true), ...aus] : null; };
const nz = (m) => pick([...Array(m).keys()].flatMap((i) => [i + 1, -(i + 1)]));
const kl = (x) => (x < 0 ? `(${x})` : `${x}`);

/* ───── Polynome (Koeffizienten absteigend) ───── */
const mul = (p, q) => { const r = Array(p.length + q.length - 1).fill(0); p.forEach((a, i) => q.forEach((b, j) => { r[i + j] += a * b; })); return r; };
const ausWurzeln = (a, wz) => wz.reduce((p, r) => mul(p, [1, -r]), [a]);
const polyTex = (c) => { const n = c.length - 1; let s = ''; c.forEach((a, i) => { if (!a) return; const e = n - i, ab = Math.abs(a), co = ab === 1 && e > 0 ? '' : ab, v = e === 0 ? '' : e === 1 ? 'x' : `x^{${e}}`; s += `${a < 0 ? '-' : s ? '+' : ''}${co}${v}`; }); return s || '0'; };
const auswerten = (c, x) => c.reduce((s, a) => s * x + a, 0);
const horner = (c, s) => { const q = [c[0]]; for (let i = 1; i < c.length; i++) q.push(c[i] + s * q[i - 1]); return q; };   // letzter Eintrag = Rest
/** Lösungsmenge als TeX (aufsteigend, ohne Doppelte). */
const uniqS = (arr) => [...new Set(arr)].sort((x, y) => x - y);
const menge = (arr) => { const u = uniqS(arr); return u.length ? `\\left\\{${u.join(';\\,')}\\right\\}` : '\\left\\{\\ \\right\\}'; };
const LM = (arr) => `L=${menge(arr)}`;
const gleich = (a, b) => menge(a) === menge(b);
const liste = (arr) => uniqS(arr).map((x) => tex(`x=${x}`)).join(', ') || 'keine';

/* ═════════════ 1. Ausklammern ═════════════ */
/** a·x^m·(Rest) = 0; Rest hat die ganzzahligen Nullstellen rest (Wurzeln des Klammerterms). binom: Rest = x² − k². */
const auskl = ({ a, m, rest, binom }) => {
  const k = binom || 0, restPoly = binom ? [1, 0, -binom * binom] : ausWurzeln(1, rest), p = mul([a], mul([1, ...Array(m).fill(0)], restPoly));
  const wz = binom ? [-k, k] : rest, sols = [0, ...wz], rt = polyTex(restPoly), pre = `${a === 1 ? '' : a}x${m > 1 ? `^{${m}}` : ''}`;
  const falsch = [[uniqS(wz), `Die Lösung ${tex('x=0')} fehlt: Wer durch ${tex('x')} teilt, verliert sie. Besser ${tex('x')} ausklammern – der Faktor ${tex('x')} ist selbst null für ${tex('x=0')}.`],
    [uniqS([0, ...wz.map((x) => -x)]), `Die Vorzeichen sind falsch: Aus ${tex(`(x${wz[0] > 0 ? '-' : '+'}${Math.abs(wz[0])})=0`)} folgt ${tex(`x=${wz[0]}`)}.`],
    [uniqS([0, ...wz.slice(0, -1)]), 'Es fehlt noch eine Lösung: Der Klammerterm hat mehrere Nullstellen, die alle zur Lösungsmenge gehören.'],
    [uniqS([0, ...(binom ? [k] : wz.map((x, i) => (i === 0 ? -x : x)))]), binom ? `${tex(`x^2=${k * k}`)} hat zwei Lösungen: ${tex(`x=${k}`)} und ${tex(`x=${-k}`)}.` : `Bei einer Nullstelle ist das Vorzeichen falsch (Probe: Einsetzen ergibt nicht 0).`],
    [uniqS([...wz, a]), `Der Faktor ${tex(`${a}`)} vor ${tex('x')} ist keine Nullstelle: ${tex(`${a}=0`)} ist nie wahr.`]].filter(([arr]) => !gleich(arr, sols));
  const o = wahl(LM(sols), falsch.map(([arr, w]) => [LM(arr), w]));
  if (!o) return null;
  const nullprodukt = `Satz vom Nullprodukt: ${tex(`${pre}=0`)} oder ${tex(`${rt}=0`)}.`;
  const restLoes = binom ? `${tex(`x^2=${k * k}`)}, also ${tex(`x=\\pm ${k}`)}.` : rest.length === 1 ? `${tex(`x=${rest[0]}`)}.` : `Zwei Zahlen mit Produkt ${tex(`${ausWurzeln(1, rest)[2]}`)} und Summe ${tex(`${-(rest[0] + rest[1])}`)} gesucht (Vieta): ${tex(`(x${rest[0] > 0 ? '-' : '+'}${Math.abs(rest[0])})(x${rest[1] > 0 ? '-' : '+'}${Math.abs(rest[1])})=0`)}, also ${liste(rest)}.`;
  const fakt = `${tex(`${polyTex(p)}=${pre}\\cdot\\left(${rt}\\right)`)}`;
  return A('Bestimme alle Nullstellen. Klammere aus.', `f(x)=${polyTex(p)}`, o,
    [`Klammere den größten gemeinsamen Faktor aus (hier ${tex(`${pre}`)}) und nutze den Satz vom Nullprodukt.`, `Nicht durch ${tex('x')} teilen – dabei geht die Nullstelle ${tex('x=0')} verloren.`],
    `Ausklammern: ${fakt}. ${nullprodukt} ${pre === 'x' || a === 1 ? `Der Faktor ${tex(`${pre}`)} liefert ${tex('x=0')}` : `Der Faktor ${tex(`${pre}`)} liefert ${tex('x=0')} (der Zahlenfaktor ${tex(`${a}`)} ist nie 0)`}. Der Klammerterm: ${restLoes} Zusammen: ${tex(LM(sols))}.`,
    'auskl', { koef: p, sol: sols });
};
const au1 = () => auskl({ a: 1, m: 1, rest: [ri(1, 6)] });
const au1b = () => auskl({ a: pick([2, 3, -1]), m: 1, rest: [nz(6)] });
const au2 = () => { let r1 = nz(5), r2 = nz(5); if (r1 === r2) return null; return auskl({ a: 1, m: 1, rest: [r1, r2] }); };
const au3 = () => auskl({ a: pick([1, 2, 3]), m: pick([1, 2]), binom: ri(2, 5) });
const au3b = () => auskl({ a: 1, m: 2, rest: [nz(6)] });
const au4 = () => { let r1 = nz(4), r2 = nz(4); if (r1 === r2) return null; return auskl({ a: pick([1, 2, -1]), m: 2, rest: [r1, r2] }); };
const au5 = () => { let r1 = nz(5), r2 = nz(5); if (r1 === r2) return null; return auskl({ a: pick([2, 3, -2, 4]), m: pick([1, 2]), rest: [r1, r2] }); };
export const genNullAuskl = bau([[au1], [au1b], [au2, au3b], [au3, au2], [au5, au4]]);

/* ═════════════ 2. Substitution: a·x⁴ + b·x² + c = 0 ═════════════ */
const subst = ({ a, z1, z2 }) => {
  const p = ausWurzeln(a, [z1, z2]), b = -a * (z1 + z2), c = a * z1 * z2, koef = [a, 0, b, 0, c];
  const wz = []; for (const z of [z1, z2]) if (z > 0) { const w = Math.round(Math.sqrt(z)); wz.push(-w, w); }
  const sols = uniqS(wz), pos = [z1, z2].filter((z) => z > 0), neg = [z1, z2].filter((z) => z < 0);
  const f = `${polyTex(koef)}=0`, quad = `${polyTex([a, b, c]).replace(/x/g, 'z')}=0`;
  const falsch = [[uniqS(pos), `Das sind die Werte von ${tex('z')}, nicht von ${tex('x')}. Rücksubstitution: ${tex('x^2=z')}, also ${tex('x=\\pm\\sqrt z')}.`],
    [uniqS(wz.filter((x) => x > 0)), `Bei ${tex('x^2=z')} gibt es zwei Lösungen ${tex('x=\\pm\\sqrt z')} – die negative fehlt.`],
    neg.length ? [uniqS([...wz, ...neg.flatMap((z) => { const w = Math.round(Math.sqrt(-z)); return [-w, w]; })]), `Aus einem negativen ${tex('z')} lässt sich keine Wurzel ziehen: ${tex('x^2=z')} ist für ${tex('z<0')} unlösbar.`] : null,
    sols.length ? [[], `Es gibt Lösungen: ${tex('z')}-Werte mit ${tex('z>0')} liefern ${tex('x=\\pm\\sqrt z')}.`] : [uniqS([z1, z2].map((z) => Math.round(Math.sqrt(Math.abs(z))))), `Negative ${tex('z')} haben keine reelle Wurzel – es gibt keine Nullstelle.`],
    [uniqS([...pos, ...pos.map((z) => -z)]), `Es wurde ${tex('x=z')} statt ${tex('x=\\pm\\sqrt z')} genommen: Rücksubstitution fehlt.`]].filter((k) => k && !gleich(k[0], sols));
  const o = wahl(LM(sols), falsch.map(([arr, w]) => [LM(arr), w]));
  if (!o) return null;
  const zeilen = [z1, z2].map((z) => (z > 0 ? `${tex(`x^2=${z}`)}: ${tex(`x=\\pm ${Math.round(Math.sqrt(z))}`)}` : `${tex(`x^2=${z}`)}: keine Lösung, ein Quadrat ist nie negativ`)).join('; ');
  return A('Löse die Gleichung durch Substitution.', f, o,
    [`Setze ${tex('z=x^2')}. Dann ist ${tex('x^4=z^2')} und es entsteht eine quadratische Gleichung in ${tex('z')}.`, 'Nach dem Lösen für z nicht vergessen: zurück zu x (Rücksubstitution).'],
    `Substitution ${tex('z=x^2')}: ${tex(quad)}.${a === 1 ? '' : ` Durch ${tex(`${a}`)} teilen: ${tex(`z^2${-(z1 + z2) >= 0 ? '+' : ''}${-(z1 + z2)}z${z1 * z2 >= 0 ? '+' : ''}${z1 * z2}=0`)}.`} Zwei Zahlen mit Produkt ${tex(`${z1 * z2}`)} und Summe ${tex(`${z1 + z2}`)}: ${tex(`z_1=${z1}`)} und ${tex(`z_2=${z2}`)}. Rücksubstitution: ${zeilen}. ${sols.length ? `Lösungsmenge ${tex(LM(sols))}.` : `Keine Nullstelle: ${tex(LM([]))}.`}`,
    'subst', { koef, sol: sols, z: [z1, z2] });
};
/** Nur der Ansatz: Welche Gleichung entsteht mit z = x²? */
const substKonz = () => {
  const z1 = pick([1, 4, 9]), z2 = pick([1, 4, 9, -1, -4]); if (z1 === z2) return null;
  const a = pick([1, 1, 2, 3]), b = -a * (z1 + z2), c = a * z1 * z2, koef = [a, 0, b, 0, c], zz = (k) => polyTex(k).replace(/x/g, 'z');
  const o = wahl(`${zz([a, b, c])}=0`, [[`${zz([a, 0, b, 0, c])}=0`, `Hier wurde nichts ersetzt: Aus ${tex('x^4')} wird ${tex('z^2')} und aus ${tex('x^2')} wird ${tex('z')}.`], [`${zz([a, b, 0, c])}=0`.replace(/z\^\{3\}/, 'z^{2}'), `Aus ${tex('x^2')} wird ${tex('z')}, nicht ${tex('z^2')}: ${tex('z=x^2')} ersetzt jedes ${tex('x^2')}.`],
    [`${a === 1 ? '' : a}z+${b < 0 ? `(${b})` : b}z${c < 0 ? c : `+${c}`}=0`, `${tex('x^4=(x^2)^2=z^2')}: Das Quadrat bleibt erhalten.`], [`${zz([a, -b, c])}=0`, 'Das Vorzeichen des mittleren Koeffizienten ist falsch: Er bleibt, wie er in der Gleichung steht.']]);
  if (!o) return null;
  return A(`Substituiere ${tex('z=x^2')}. Welche Gleichung entsteht?`, `${polyTex(koef)}=0`, o,
    [`${tex('x^4')} ist ${tex('(x^2)^2')}.`],
    `${tex(`x^4=(x^2)^2=z^2`)} und ${tex('x^2=z')}. Es entsteht ${tex(`${zz([a, b, c])}=0`)} – quadratisch in ${tex('z')}.`, 'subst-konz', { koef, koef3: [a, b, c] });
};
const Q2 = [1, 4, 9, 16, 25];
const su1 = () => { const z1 = pick(Q2), z2 = pick(Q2); if (z1 === z2) return null; return subst({ a: 1, z1, z2 }); };
const su2 = () => subst({ a: 1, z1: pick(Q2), z2: -pick([1, 2, 3, 4, 5, 6, 8, 9]) });
const su3 = () => { const z1 = pick(Q2), z2 = pick(Q2); if (z1 === z2) return null; return subst({ a: pick([2, 3, -1]), z1, z2 }); };
const su4 = () => subst({ a: 1, z1: -pick([1, 2, 3, 4, 5]), z2: -pick([6, 7, 8, 9]) });
const su5 = () => { const z1 = pick([9, 16, 25]), z2 = -pick([5, 6, 8, 9, 10, 12]); return subst({ a: pick([2, 3, -2, 4, -3]), z1, z2 }); };
export const genNullSubst = bau([[substKonz], [su1, su4], [su2, su3], [su3], [su5]]);

/* ═════════════ 3. Polynomdivision ═════════════ */
const kub = (a, rs) => { const p = ausWurzeln(a, rs); return { p, polyT: polyTex(p) }; };
const wurzeln3 = (grenze, gleichV = false) => { for (;;) { const r = [nz(grenze), nz(grenze), nz(grenze)]; if (new Set(r).size === 3 || gleichV) { const p = ausWurzeln(1, r); if (p.every((v) => Math.abs(v) <= 60)) return r; } } };
/** Welche Zahl ist Nullstelle? (Probe durch Einsetzen, Teiler des Absolutglieds) */
const pdProbe = () => {
  const rs = wurzeln3(4), a = 1, { p, polyT } = kub(a, rs), r = pick(rs);
  const kand = [...new Set([-4, -3, -2, -1, 1, 2, 3, 4, 5, -5, 6, -6].filter((c) => !rs.includes(c) && auswerten(p, c) !== 0))]; shuffle(kand);
  const falsche = kand.slice(0, 3); if (falsche.length < 3) return null;
  const o = [T(`x=${r}`, true), ...falsche.map((c) => T(`x=${c}`, false, `Probe: ${tex(`f(${c})=${auswerten(p, c)}\\neq 0`)} – also keine Nullstelle.`))];
  if (!uniq(o)) return null;
  return A('Welche der Zahlen ist eine Nullstelle von f? Unter den Antworten ist es nur eine (die einzige in dieser Liste). Probiere durch Einsetzen.', `f(x)=${polyT}`, o,
    [`Eine ganzzahlige Nullstelle ist ein Teiler des Absolutglieds ${tex(`${p[3]}`)}. Probiere die Teiler.`, 'Setze die Zahlen nacheinander in f ein; die Nullstelle ergibt 0.'],
    `Das Absolutglied ist ${tex(`${p[3]}`)}; ganzzahlige Nullstellen sind Teiler davon. Einsetzen: ${tex(`f(${r})=${auswerten(p, r)}=0`)} ✓. Die anderen Zahlen ergeben ${falsche.map((c) => tex(`f(${c})=${auswerten(p, c)}`)).join(', ')} – nicht null.`,
    'pd-probe', { koef: p, sol: [r] });
};
/** Quotient der Polynomdivision (Horner) */
const pdQuot = (aV = 1) => () => {
  const rs = wurzeln3(4), a = typeof aV === 'function' ? aV() : aV, { p, polyT } = kub(a, rs), r = pick(rs), q = horner(p, r).slice(0, 3), quot = polyTex(q);
  const wrong = (s) => horner(p, s).slice(0, 3);
  const kand = [[wrong(-r), `Die Nullstelle wurde mit dem falschen Vorzeichen verwendet: Bei ${tex(`(x${r > 0 ? '-' : '+'}${Math.abs(r)})`)} wird mit ${tex(`${r}`)} gerechnet, nicht mit ${tex(`${-r}`)}.`],
    [[q[0], q[1] + 1, q[2]], 'Beim Weiterrechnen im Horner-Schema ist ein Rechenfehler passiert (Koeffizient mal Nullstelle plus nächster Koeffizient).'],
    [[q[0], q[1], q[2] + 1], 'Der letzte Koeffizient stimmt nicht: Der Rest der Division muss genau 0 sein – das prüft die Rechnung.'],
    [[q[0], -q[1], q[2]], 'Das Vorzeichen des mittleren Koeffizienten ist falsch.'],
    [[q[0] + 1, q[1], q[2]], 'Der führende Koeffizient bleibt beim Horner-Schema unverändert.']].filter(([c]) => polyTex(c) !== quot);
  const o = wahl(quot, kand.map(([c, w]) => [polyTex(c), w]));
  if (!o) return null;
  return A(`${tex(`x=${r}`)} ist eine Nullstelle von f. Führe die Polynomdivision ${tex(`f(x):(x${r > 0 ? '-' : '+'}${Math.abs(r)})`)} aus. Wie lautet der Quotient?`, `f(x)=${polyT}`, o,
    [`Horner-Schema mit ${tex(`${r}`)}: erster Koeffizient herunterziehen, mal ${tex(`${r}`)} nehmen, zum nächsten addieren.`, 'Der Rest muss 0 sein.'],
    `Horner-Schema mit ${tex(`${r}`)} und den Koeffizienten ${tex(p.join(',\\ '))}: ${tex(q.join(',\\ '))} und Rest ${tex(`${horner(p, r)[3]}`)}. Der Quotient ist ${tex(quot)}.`,
    'pd-quot', { koef: p, r, quot: q });
};
/** Alle Nullstellen mit einer gegebenen Nullstelle */
const pdAlle = (grenze, aV) => () => {
  const rs = wurzeln3(grenze), a = typeof aV === 'function' ? aV() : aV, { p, polyT } = kub(a, rs), r = pick(rs), sols = uniqS(rs), rest = rs.filter((x, i) => i !== rs.indexOf(r)), q = horner(p, r).slice(0, 3);
  const [r2, r3] = rest;
  const falsch = [[[r], 'Mit der Polynomdivision entsteht ein Quotient vom Grad 2 – er hat weitere Nullstellen, die gesucht sind.'],
    [uniqS([-r, -r2, -r3]), 'Alle Vorzeichen sind vertauscht: Aus ' + tex('(x-r)=0') + ' folgt ' + tex('x=r') + '.'],
    [uniqS([r, r2, -r3]), 'Eine Nullstelle hat das falsche Vorzeichen – Probe durch Einsetzen in f zeigt es.'],
    [uniqS([r, r2]), 'Der Quotient ist quadratisch und hat zwei Nullstellen: Beide gehören dazu (zusammen mit der gegebenen drei).'],
    [uniqS([r, r2 + 1, r3]), 'Beim Lösen der quadratischen Gleichung (Vieta oder pq-Formel) ist ein Rechenfehler passiert.']].filter(([arr]) => !gleich(arr, sols));
  const o = wahl(LM(sols), falsch.map(([arr, w]) => [LM(arr), w]));
  if (!o) return null;
  const qq = polyTex(q.map((v) => v / (a === 1 ? 1 : 1)));
  return A(`${tex(`x=${r}`)} ist eine Nullstelle von f. Bestimme alle Nullstellen mit der Polynomdivision.`, `f(x)=${polyT}`, o,
    [`Teile durch ${tex(`(x${r > 0 ? '-' : '+'}${Math.abs(r)})`)} (Horner-Schema) und löse die entstehende quadratische Gleichung.`, a === 1 ? 'Probe: Das Produkt der Nullstellen ist das Absolutglied mit umgekehrtem Vorzeichen.' : `Der Faktor ${tex(`${a}`)} ändert die Nullstellen nicht.`],
    `Horner-Schema mit ${tex(`${r}`)}: Koeffizienten ${tex(p.join(',\\ '))} ergeben ${tex(q.join(',\\ '))}, Rest ${tex('0')}. Quotient: ${tex(`${qq}=0`)}${a === 1 ? '' : ` (durch ${tex(`${a}`)} geteilt: ${tex(`${polyTex(q.map((v) => v / a))}=0`)})`}. Zwei Zahlen mit Produkt ${tex(`${r2 * r3}`)} und Summe ${tex(`${r2 + r3}`)}: ${tex(`x=${r2}`)} und ${tex(`x=${r3}`)}. Nullstellen: ${liste(rs)}. ${tex(LM(sols))}.`,
    'pd-alle', { koef: p, r, sol: sols });
};
export const genNullPoly = bau([[pdQuot(1)], [pdProbe], [pdQuot(() => pick([2, 3])), pdAlle(3, 1)], [pdAlle(3, 1)], [pdAlle(6, () => pick([2, 3, -2]))]]);

for (const [fn, name, topic] of [[genNullAuskl, 'genNullAuskl', 'Nullstellen: Ausklammern'], [genNullSubst, 'genNullSubst', 'Nullstellen: Substitution'], [genNullPoly, 'genNullPoly', 'Nullstellen: Polynomdivision']]) { Object.defineProperty(fn, 'name', { value: name }); fn.topic = topic; }
export const GENS14 = { genNullAuskl, genNullSubst, genNullPoly };
