// Aufgaben-Erzeuger, Teil 13 (Version 2.5.5): Gauß-Verfahren (drei Gleichungen, drei Unbekannte) und – für Klasse 9/10, auf Wunsch von Marcel nach
// seinem Arbeitsblatt „Potenzen und Wurzeln“ – Potenzgleichungen, Wurzelgleichungen mit Probe und Scheinlösungen, Bruchgleichungen mit Definitionsmenge
// und rationale Hochzahlen. Jede Aufgabenart hat fünf eigene Stufen; die falschen Antworten sind typische Fehler mit Diagnose; der Lösungsweg nennt alle
// Schritte mit den Zahlen der Aufgabe. Brüche werden exakt gerechnet. Zufall nur über ri/pick/shuffle.
import { ri, pick, shuffle } from './math.js';
import { tex } from './ui.js';
import { uniq } from './gen.js';

const T = (t, correct, why) => ({ tex: t, correct, why: correct ? undefined : why });
const A = (prompt, formula, opts, hints, explain, kind, daten) => (opts && opts.length === 4 && uniq(opts) && opts.filter((o) => o.correct).length === 1 && opts.every((o) => o.correct || o.why) ? { prompt, formula, options: shuffle(opts), hints, explain, kind, daten } : null);
const stufe = (lv) => Math.min(5, Math.max(1, lv | 0 || 3));
const bau = (formen) => (lv = 3) => { const liste = formen[stufe(lv) - 1]; for (;;) { const q = pick(liste)(); if (q) return q; } };
/** Richtige Antwort und die ersten drei verschiedenen Ablenker (kand: [tex, Diagnose] oder leer). */
const wahl = (richtig, kand) => { const aus = [], da = new Set([richtig]); for (const k of kand) { if (!k || da.has(k[0]) || aus.length === 3) continue; da.add(k[0]); aus.push(T(k[0], false, k[1])); } return aus.length === 3 ? [T(richtig, true), ...aus] : null; };
const nz = (m) => pick([...Array(m).keys()].flatMap((i) => [i + 1, -(i + 1)]));
const kl = (x) => (x < 0 ? `(${x})` : `${x}`);

/* ───── Brüche exakt ───── */
const ggT = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
const Q = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = ggT(n, d); return { n: n / g + 0, d: d / g }; };
const qa = (x, y) => Q(x.n * y.d + y.n * x.d, x.d * y.d), qs = (x, y) => Q(x.n * y.d - y.n * x.d, x.d * y.d);
const qm = (x, y) => Q(x.n * y.n, x.d * y.d), qd = (x, y) => Q(x.n * y.d, x.d * y.n);
const qw = (x) => x.n / x.d, qg = (x, y) => x.n === y.n && x.d === y.d;
const qt = (x) => (x.d === 1 ? `${x.n}` : `${x.n < 0 ? '-' : ''}\\dfrac{${Math.abs(x.n)}}{${x.d}}`);
const qk = (x) => (x.n < 0 ? `\\left(${qt(x)}\\right)` : qt(x));
/** Lösungsmenge als TeX (aufsteigend, ohne Doppelte); leer: { }. */
const menge = (arr) => { const u = []; for (const x of arr) if (!u.some((y) => qg(x, y))) u.push(x); u.sort((a, b) => qw(a) - qw(b)); return u.length ? `\\left\\{${u.map(qt).join(';\\,')}\\right\\}` : '\\left\\{\\ \\right\\}'; };
const LM = (arr) => `L=${menge(arr)}`;
const gleich = (a, b) => menge(a) === menge(b);
/** a·x+b als Term: "2x-3", "-x+5", "x". */
const ax = (a, b = 0, v = 'x') => `${a === 1 ? '' : a === -1 ? '-' : a}${v}${b ? (b > 0 ? `+${b}` : `${b}`) : ''}`;

/* ═════════════ 1. Gauß-Verfahren ═════════════ */
const lin = (c, v = ['x', 'y', 'z']) => { let s = ''; c.forEach((a, i) => { if (!a) return; const ab = Math.abs(a); s += `${a < 0 ? '-' : s ? '+' : ''}${ab === 1 ? '' : ab}${v[i]}`; }); return s || '0'; };
const RO = ['\\text{I}', '\\text{II}', '\\text{III}'];
const syst = (M, b) => `\\begin{array}{ll}${M.map((r, i) => `${RO[i]}: & ${lin(r)}=${b[i]}`).join('\\\\')}\\end{array}`;
const mulv = (M, s) => M.map((r) => r[0] * s[0] + r[1] * s[1] + r[2] * s[2]);
const trip = (c) => `x=${c[0]},\\ y=${c[1]},\\ z=${c[2]}`;
/** Gleichungssystem mit ganzzahliger Lösung. A = L·U (L unten links mit Einsen), damit jeder Eliminationsschritt aufgeht. */
function gaussSystem(lv) {
  for (;;) {
    const gr = lv >= 5 ? 5 : lv >= 4 ? 4 : 3, lm = lv >= 4 ? 3 : 2;
    const U = [[lv >= 5 ? pick([2, 3]) : pick([1, 1, 2]), ri(-gr, gr), ri(-gr, gr)], [0, nz(gr), ri(-gr, gr)], [0, 0, nz(gr)]];
    const l21 = lv === 1 ? 0 : nz(lv >= 3 ? lm : 3), l31 = lv <= 2 ? 0 : nz(lm), l32 = lv <= 3 ? 0 : nz(lm);
    const A_ = [[...U[0]], U[0].map((v, j) => l21 * v + U[1][j]), U[0].map((v, j) => l31 * v + l32 * U[1][j] + U[2][j])];
    const sg = lv >= 5 ? 8 : 4, s = [ri(-sg, sg), ri(-sg, sg), ri(-sg, sg)]; if (s[0] === s[1] && s[1] === s[2]) continue;
    const b = mulv(A_, s);
    if (A_.flat().some((a) => Math.abs(a) > (lv >= 5 ? 20 : lv >= 4 ? 14 : 9)) || b.some((x) => Math.abs(x) > (lv >= 5 ? 160 : lv >= 4 ? 90 : 45))) continue;
    return { A: A_, b, s, U };
  }
}
/** Eliminieren: Zeile z := Zeile z − f·Zeile q (f ganzzahlig). Liefert Schritte, Dreiecksform. */
function eliminiere(A_, b) {
  const M = A_.map((r) => [...r]), c = [...b], st = [];
  for (const [z, q] of [[1, 0], [2, 0], [2, 1]]) {
    const f = M[z][q] / M[q][q]; if (!f) continue;
    for (let j = 0; j < 3; j++) M[z][j] -= f * M[q][j]; c[z] -= f * c[q];
    st.push({ z, q, f, t: `${RO[z]}${f < 0 ? '+' : '-'}${Math.abs(f) === 1 ? '' : `${Math.abs(f)}\\cdot `}${RO[q]}` });
  }
  return { M, c, st };
}
/** Erste Gleichung, die der Vorschlag nicht erfüllt (für Diagnosen). */
const probe = (A_, b, cand) => { for (let i = 0; i < 3; i++) { const w = A_[i][0] * cand[0] + A_[i][1] * cand[1] + A_[i][2] * cand[2]; if (w !== b[i]) return `Einsetzen in Gleichung ${['I', 'II', 'III'][i]} ergibt ${tex(`${w}`)} statt ${tex(`${b[i]}`)} – das ist keine Lösung.`; } return null; };
const rueck = (E, s) => {   // Rückwärtseinsetzen in der Dreiecksform
  const [, , u33] = [E.M[2][0], E.M[2][1], E.M[2][2]], u22 = E.M[1][1], u23 = E.M[1][2], u11 = E.M[0][0];
  const t = [];
  t.push(`Aus ${tex('\\text{III}')}: ${tex(`${u33 === 1 ? '' : u33}z=${E.c[2]}`)}, also ${tex(`z=${s[2]}`)}.`);
  t.push(`In ${tex('\\text{II}')} einsetzen: ${tex(`${u22 === 1 ? '' : u22}y${u23 ? `${u23 < 0 ? '-' : '+'}${Math.abs(u23) === 1 ? '' : `${Math.abs(u23)}\\cdot `}${kl(s[2])}` : ''}=${E.c[1]}`)}, also ${tex(`y=${s[1]}`)}.`);
  t.push(`In ${tex('\\text{I}')} einsetzen: ${tex(`${u11 === 1 ? '' : u11}x${E.M[0][1] ? `${E.M[0][1] < 0 ? '-' : '+'}${Math.abs(E.M[0][1]) === 1 ? '' : `${Math.abs(E.M[0][1])}\\cdot `}${kl(s[1])}` : ''}${E.M[0][2] ? `${E.M[0][2] < 0 ? '-' : '+'}${Math.abs(E.M[0][2]) === 1 ? '' : `${Math.abs(E.M[0][2])}\\cdot `}${kl(s[2])}` : ''}=${E.c[0]}`)}, also ${tex(`x=${s[0]}`)}.`);
  return t.join(' ');
};
const gaussLoesen = (lv) => () => {
  const { A: M, b, s } = gaussSystem(lv), E = eliminiere(M, b);
  const richtig = trip(s);
  const o = wahl(richtig, [[[s[2], s[1], s[0]], 'Die Werte sind vertauscht: x und z.'], [[s[0], s[1], -s[2]], 'Das Vorzeichen von z ist falsch.'], [[s[0], -s[1], s[2]], 'Das Vorzeichen von y ist falsch.'], [[s[0] + 1, s[1], s[2]], 'Das Ergebnis für x ist um 1 daneben.'], [[-s[0], s[1], s[2]], 'Das Vorzeichen von x ist falsch.']]
    .map(([c, w]) => { const p = probe(M, b, c); return p ? [trip(c), `${w} ${p}`] : null; }));
  if (!o) return null;
  const schritte = lv === 1 ? 'Das System hat schon Dreiecksform: unten beginnen.' : E.st.length ? `Eliminieren (Zeilen mit passenden Vielfachen abziehen): ${E.st.map((x) => tex(`${x.t}`)).join(', ')}. Dreiecksform: ${tex(syst(E.M, E.c))}.` : `Das System hat schon Dreiecksform: ${tex(syst(E.M, E.c))}.`;
  return A('Löse das Gleichungssystem mit dem Gauß-Verfahren.', syst(M, b), o,
    [lv === 1 ? 'Dreiecksform: Beginne unten bei der Gleichung mit nur einer Unbekannten und setze Schritt für Schritt nach oben ein.' : `Ziel ist die Dreiecksform: Zuerst ${tex('x')} aus Zeile II und III entfernen, dann ${tex('y')} aus Zeile III.`, 'Probe: Das Ergebnis muss in allen drei Gleichungen stimmen.'],
    `${schritte} ${rueck(E, s)} Probe in ${tex('\\text{I}')}: ${tex(`${lin(M[0])}\\to ${M[0][0]}\\cdot ${kl(s[0])}+${kl(M[0][1])}\\cdot ${kl(s[1])}+${kl(M[0][2])}\\cdot ${kl(s[2])}=${b[0]}`)} ✓.`,
    'gauss', { M, b, s });
};
/** Welche Zeile entsteht nach dem ersten Eliminationsschritt? */
const gaussSchritt = () => {
  const { A: M, b, s } = gaussSystem(4), E = eliminiere(M, b), st = E.st[0]; if (!st || st.z !== 1 || Math.abs(st.f) < 2) return null;
  const f = st.f, neu = M[1].map((v, j) => v - f * M[0][j]), nb = b[1] - f * b[0];
  const row = (r, c) => `${lin(r)}=${c}`;
  const falsch = [[M[1].map((v, j) => v - M[0][j]), b[1] - b[0], `Die erste Zeile wurde nur einmal abgezogen, nicht ${Math.abs(f)}-mal.`],
    [M[1].map((v, j) => v + f * M[0][j]), b[1] + f * b[0], 'Das Vorzeichen der Operation stimmt nicht: Es wird abgezogen (bzw. mit umgekehrtem Vorzeichen addiert), sodass das x wegfällt.'],
    [neu, b[1], 'Die rechte Seite wurde nicht mitgerechnet: Rechne auch rechts ' + tex(`${b[1]}-${kl(f)}\\cdot ${kl(b[0])}`) + '.'],
    [neu.map((v, j) => (j === 2 ? v + 2 * f * M[0][2] : v)), nb, 'Beim ' + tex('z') + '-Glied ist ein Rechenfehler: Vielfaches der Zeile I falsch abgezogen.']];
  const o = wahl(row(neu, nb), falsch.map(([r, c, w]) => (r[0] === 0 || r.some((v) => v === 0 && false) ? null : [row(r, c), w])).map((k) => (k && k[0] !== row(neu, nb) ? k : null)).concat([[row(neu.map((v, j) => (j === 1 ? -v : v)), nb), 'Das Vorzeichen des ' + tex('y') + '-Glieds ist falsch.']]));
  if (!o) return null;
  return A(`Im ersten Schritt des Gauß-Verfahrens wird ${tex('x')} aus Zeile II entfernt: ${tex(st.t)}. Wie lautet die neue Zeile II?`, syst(M, b), o,
    [`Rechne jede Seite der Gleichung: Zeile II minus ${Math.abs(f)} mal Zeile I – links und rechts.`, `Das ${tex('x')}-Glied muss wegfallen.`],
    `Zeile I mal ${f}: ${tex(row(M[0].map((v) => v * f), b[0] * f))}. Davon wird abgezogen ${tex(`\\text{II}`)}: ${tex(`${lin(M[1])}-\\left(${lin(M[0].map((v) => v * f))}\\right)`)} ergibt links ${tex(lin(neu))}, rechts ${tex(`${b[1]}-${kl(f * b[0])}=${nb}`)}. Neue Zeile II: ${tex(row(neu, nb))}.`,
    'gauss-schritt', { M, b, f, neu, nb });
};
/** Wie viele Lösungen hat das System? (keine, genau eine, unendlich viele) */
const gaussAnzahl = () => {
  const art = pick(['eine', 'keine', 'viele']);
  if (art === 'eine') { const { A: M, b, s } = gaussSystem(3); const E = eliminiere(M, b);
    return A('Wie viele Lösungen hat das Gleichungssystem?', syst(M, b), wahl('\\text{genau eine Lösung}', [['\\text{keine Lösung}', 'Nach dem Eliminieren entsteht eine Dreiecksform ohne Widerspruch – das System hat eine Lösung.'], ['\\text{unendlich viele Lösungen}', 'Es bleibt am Ende in jeder Zeile eine Unbekannte stehen – dann ist die Lösung eindeutig.'], ['\\text{genau zwei Lösungen}', 'Ein lineares System hat nie genau zwei Lösungen: entweder keine, genau eine oder unendlich viele.']]),
      ['Eliminiere bis zur Dreiecksform und sieh dir die letzte Zeile an.'], `Dreiecksform: ${tex(syst(E.M, E.c))}. Die letzte Zeile ${tex(`${lin(E.M[2])}=${E.c[2]}`)} legt ${tex('z')} fest, rückwärts folgen ${tex('y')} und ${tex('x')}: ${tex(trip(s))}. Genau eine Lösung (die drei Ebenen schneiden sich in einem Punkt).`, 'gauss-anzahl', { M, b, art: 'eine' }); }
  for (;;) {
    const r1 = [ri(-3, 3), ri(-3, 3), ri(-3, 3)], r2 = [ri(-3, 3), ri(-3, 3), ri(-3, 3)];
    if (!(r1[0] * r2[1] - r1[1] * r2[0] || r1[0] * r2[2] - r1[2] * r2[0] || r1[1] * r2[2] - r1[2] * r2[1])) continue;
    const s = [ri(-3, 3), ri(-3, 3), ri(-3, 3)], b1 = mulv([r1], s)[0], b2 = mulv([r2], s)[0], plus = pick([true, false]);
    const r3 = r1.map((v, j) => (plus ? v + r2[j] : v - r2[j])), d = art === 'keine' ? pick([-3, -2, -1, 1, 2, 3]) : 0, b3 = (plus ? b1 + b2 : b1 - b2) + d;
    if (r3.every((v) => !v) || [...r1, ...r2, ...r3].some((v) => Math.abs(v) > 6)) continue;
    const M = [r1, r2, r3], b = [b1, b2, b3], op = plus ? `\\text{III}-\\text{I}-\\text{II}` : `\\text{III}-\\text{I}+\\text{II}`;
    const keine = art === 'keine', richtig = keine ? '\\text{keine Lösung}' : '\\text{unendlich viele Lösungen}';
    const o = wahl(richtig, keine ? [['\\text{unendlich viele Lösungen}', `Am Ende steht ${tex(`0=${d}`)} – eine falsche Aussage. Bei unendlich vielen Lösungen würde ${tex('0=0')} stehen.`], ['\\text{genau eine Lösung}', 'Zeile III ist keine neue Information: Sie widerspricht den Zeilen I und II, deshalb gibt es keine Lösung.'], ['\\text{genau zwei Lösungen}', 'Ein lineares System hat nie genau zwei Lösungen.']]
      : [['\\text{keine Lösung}', `Am Ende steht ${tex('0=0')} – das ist wahr, es gibt keinen Widerspruch.`], ['\\text{genau eine Lösung}', 'Zeile III ist nur eine Kombination von I und II: Es fehlt eine unabhängige Gleichung, deshalb ist die Lösung nicht eindeutig.'], ['\\text{genau zwei Lösungen}', 'Ein lineares System hat nie genau zwei Lösungen.']]);
    if (!o) continue;
    return A('Wie viele Lösungen hat das Gleichungssystem?', syst(M, b), o, ['Prüfe, ob eine Zeile aus den anderen zusammengesetzt ist (Summe oder Differenz).', 'Beim Eliminieren entsteht links nur Nullen: Steht rechts 0, gibt es unendlich viele Lösungen; steht dort etwas anderes, gibt es keine.'],
      `Rechne ${tex(op)}: Links ergibt sich ${tex('0x+0y+0z=0')}, rechts ${tex(`${b3}${plus ? `-${kl(b1)}-${kl(b2)}` : `-${kl(b1)}+${kl(b2)}`}=${d}`)}. ${keine ? `Es steht ${tex(`0=${d}`)} – ein Widerspruch: keine Lösung (die Ebenen haben keinen gemeinsamen Punkt).` : `Es steht ${tex('0=0')} – immer wahr: Zeile III enthält nichts Neues, es bleibt eine Unbekannte frei: unendlich viele Lösungen (die Ebenen schneiden sich in einer Geraden).`}`,
      'gauss-anzahl', { M, b, art });
  }
};
export const genGauss = bau([[gaussLoesen(1), gaussAnzahl, gaussSchritt], [gaussLoesen(2)], [gaussLoesen(3)], [gaussLoesen(4)], [gaussLoesen(5)]]);

/* ═════════════ 2. Potenzgleichungen ═════════════ */
const hoch = (c, n) => `${c ? `\\left(${ax(1, -c)}\\right)` : 'x'}^{${n}}`;
const pot = ({ a, c, n, s, keine }) => {   // a·(x−c)^n = b, Lösung x = c ± s bzw. c + s (b = a·s^n bzw. negativ)
  const b = (keine ? -1 : 1) * a * s ** n, gerade = n % 2 === 0, r = Math.abs(s);
  const sols = keine ? [] : gerade ? [Q(c - r), Q(c + r)] : [Q(c + s)], ls = `${a === 1 ? '' : a}${hoch(c, n)}=${b}`;
  const ea = (x) => Q(a * (x - c) ** n);
  const falsch = [];
  if (!keine && gerade) falsch.push([[Q(c + r)], `Bei gerader Hochzahl gibt es zwei Lösungen: ${tex(`(x${c ? `-${kl(c)}` : ''})`)} kann ${tex(`+${r}`)} oder ${tex(`-${r}`)} sein.`]);
  if (!keine && !gerade) falsch.push([[Q(c - r), Q(c + r)], `Bei ungerader Hochzahl gibt es nur eine Lösung: ${tex(`(${s})^{${n}}=${s ** n}`)}, aber ${tex(`(${-s})^{${n}}=${(-s) ** n}`)} passt nicht.`]);
  if (c && !keine) falsch.push([gerade ? [Q(-r), Q(r)] : [Q(s)], `Die Verschiebung ${tex(`x${c > 0 ? `-${c}` : `+${-c}`}`)} wurde vergessen: Die Lösung der Klammer ${tex(`x${c > 0 ? `-${c}` : `+${-c}`}=${gerade ? `\\pm ${r}` : s}`)} muss noch um ${tex(`${c}`)} verschoben werden.`]);
  if (c && !keine) falsch.push([gerade ? [Q(-c - r), Q(-c + r)] : [Q(-c + s)], `Das Vorzeichen der Verschiebung stimmt nicht: Aus ${tex(`x${c > 0 ? `-${c}` : `+${-c}`}=${gerade ? `\\pm ${r}` : s}`)} folgt ${tex(`x=${c}${gerade ? '\\pm' : '+'}${gerade ? r : kl(s)}`)}.`]);
  if (!keine) falsch.push([[], `Es gibt Lösungen: ${tex(`x=${qt(sols[0])}`)} erfüllt die Gleichung ${tex(ls)}.`]);
  if (!keine && a !== 1) falsch.push([gerade ? [Q(c - Math.round(Math.abs(b) / n)), Q(c + Math.round(Math.abs(b) / n))] : [Q(c + Math.round(b / n))], `Hier wurde durch ${tex(`${n}`)} geteilt statt die ${n}-te Wurzel zu ziehen – und der Faktor ${tex(`${a}`)} wurde nicht bedacht.`]);
  if (!keine) falsch.push([gerade ? [Q(c - Math.round(b / a / n)), Q(c + Math.round(b / a / n))] : [Q(c + Math.round(b / a / n))], `Durch ${tex(`${n}`)} geteilt statt die ${n}-te Wurzel gezogen: ${tex(`${n}`)} ist die Hochzahl, nicht der Wurzelexponent des Ergebnisses.`]);
  if (keine) falsch.push([[Q(-r), Q(r)], `${tex(`x^{${n}}`)} ist bei gerader Hochzahl nie negativ – ${tex(`(\\pm ${r})^{${n}}=${r ** n}`)} ist positiv, nicht ${tex(`${b / a}`)}. Probe zeigt: das passt nicht.`], [[Q(r)], `Auch ${tex(`${r}`)} ist keine Lösung: ${tex(`${r}^{${n}}=${r ** n}`)} ist positiv.`], [[Q(b / a)], `Probe: ${tex(`(${b / a})^{${n}}`)} ist positiv und nicht ${tex(`${b / a}`)}.`], [[Q(0)], `${tex(`0^{${n}}=0`)}, nicht ${tex(`${b / a}`)}.`]);
  const o = wahl(LM(sols), falsch.filter(([arr]) => !gleich(arr, sols)).map(([arr, w]) => [LM(arr), w]));
  if (!o) return null;
  const ver = c ? `${tex(`x${c > 0 ? `-${c}` : `+${-c}`}`)}` : tex('x');
  const weg = a === 1 ? '' : `Durch ${tex(`${a}`)} teilen: ${tex(`${hoch(c, n)}=${b / a}`)}. `;
  const wurzel = keine ? `${tex(`${hoch(c, n)}`)} ist bei gerader Hochzahl nie negativ, aber rechts steht ${tex(`${b / a}`)}: keine Lösung.`
    : gerade ? `${n}-te Wurzel ziehen, beide Vorzeichen: ${ver}${tex(`=\\pm ${r}`)}${c ? `, also ${tex(`x=${c}\\pm ${r}`)}` : ''}. ` : `${n}-te Wurzel (nur eine Lösung bei ungerader Hochzahl): ${ver}${tex(`=${s}`)}${c ? `, also ${tex(`x=${c}${s < 0 ? s : `+${s}`}=${c + s}`)}` : ''}. `;
  return A(`Löse die Gleichung.`, ls, o,
    [a === 1 ? 'Ziehe auf beiden Seiten die Wurzel – bei gerader Hochzahl gibt es zwei Vorzeichen.' : `Teile zuerst durch ${a}, dann die Wurzel ziehen.`, 'Gerade Hochzahl: ± oder keine Lösung. Ungerade Hochzahl: genau eine Lösung.'],
    `${weg}${wurzel}${keine ? '' : `Probe: ${sols.map((x) => tex(`${a === 1 ? '' : `${a}\\cdot `}\\left(${qt(Q(x.n - c * x.d, x.d))}\\right)^{${n}}=${b}`)).join(' und ')} ✓.`} Lösungsmenge: ${tex(LM(sols))}.`,
    'potenz', { a, c, n, b, s: sols.map(qw) });
};
const p1 = () => pot({ a: 1, c: 0, n: 2, s: ri(2, 12) });
const p2 = () => pot({ a: 1, c: 0, n: pick([3, 5]), s: nz(3) });
const p3 = () => pot({ a: pick([1, 1, 2, 3]), c: 0, n: pick([2, 4]), s: ri(1, 4), keine: true });
const p3b = () => pot({ a: 1, c: 0, n: pick([4, 6]), s: ri(1, 3) });
const p4 = () => pot({ a: ri(2, 4), c: 0, n: pick([2, 3, 4]), s: nz(3) });
const p5 = () => pot({ a: pick([2, 3, 5]), c: nz(7), n: pick([2, 3, 4]), s: nz(4) });
export const genPotenzGl = bau([[p2], [p1], [p3, p3b, p4], [p4, p5], [p5]]);

/* ═════════════ 3. Wurzelgleichungen mit Probe ═════════════ */
const sq = (x) => Q(x.n * x.n, x.d * x.d);
const wurz = (v, s) => `\\sqrt{${v}}${s}`;
/** k·√x = r (r Bruch): Quadrieren; r < 0: keine Lösung. */
export const wurzelLin = (k, r) => {
  const x = qd(r, Q(k)), keine = r.n < 0, sol = keine ? [] : [sq(x)], ls = `${k === 1 ? '' : k}\\sqrt{x}=${qt(r)}`;
  const o = wahl(LM(sol), keine
    ? [[LM([sq(x)]), `Probe: ${tex(`${k === 1 ? '' : `${k}\\cdot `}\\sqrt{${qt(sq(x))}}=${k === 1 ? '' : `${k}\\cdot `}${qt(Q(Math.abs(x.n), x.d))}`)} ist positiv, rechts steht aber ${tex(qt(r))}. Die Quadratwurzel ist nie negativ – das ist eine Scheinlösung.`], [LM([x]), `Hier wurde nicht quadriert und das Vorzeichen ignoriert. Eine Quadratwurzel ist nie negativ, deshalb gibt es gar keine Lösung.`], [LM([qm(r, Q(k))]), 'Hier wurde mit dem Faktor multipliziert statt zu teilen. Außerdem ist eine Wurzel nie negativ – es gibt keine Lösung.'], [LM([Q(0)]), `${tex('\\sqrt{0}=0')}, aber rechts steht ${tex(qt(r))}.`]]
    : [[LM([x]), `Es wurde durch ${tex(`${k}`)} geteilt, aber nicht quadriert: ${tex(`\\sqrt{x}=${qt(x)}`)} bedeutet ${tex(`x=${qt(x)}^2=${qt(sq(x))}`)}.`], [LM([qm(r, Q(k))]), 'Es wurde mit dem Faktor multipliziert statt zu teilen.'], [LM([sq(r)]), `Es wurde nicht zuerst durch ${tex(`${k}`)} geteilt: ${tex(`\\sqrt{x}=${qt(x)}`)} – erst dann quadrieren.`], [LM([]), `Es gibt eine Lösung: ${tex(`x=${qt(sq(x))}`)} erfüllt die Gleichung.`]]);
  if (!o) return null;
  return A('Löse die Gleichung. Mache die Probe.', ls, o,
    [k === 1 ? 'Eine Quadratwurzel ist nie negativ.' : `Teile zuerst durch ${k}, bevor du quadrierst.`, 'Quadrieren, auflösen und zum Schluss die Probe in der Ausgangsgleichung.'],
    keine ? `${tex(`\\sqrt{x}=${qt(x)}`)}: Die Quadratwurzel ist nie negativ, rechts steht aber ${tex(qt(x))}. Es gibt keine Lösung – ${tex(LM([]))}. (Würde man trotzdem quadrieren, käme ${tex(`x=${qt(sq(x))}`)} heraus; die Probe zeigt: ${tex(`${k}\\cdot\\sqrt{${qt(sq(x))}}=${qt(qm(Q(k), Q(Math.abs(x.n), x.d)))}\\neq ${qt(r)}`)} – Scheinlösung.)`
      : `Durch ${tex(`${k}`)} teilen: ${tex(`\\sqrt{x}=${qt(x)}`)}. Quadrieren: ${tex(`x=${qk(x)}^2=${qt(sq(x))}`)}. Probe: ${tex(`${k === 1 ? '' : `${k}\\cdot `}\\sqrt{${qt(sq(x))}}=${k === 1 ? '' : `${k}\\cdot `}${qt(x)}=${qt(r)}`)} ✓. ${tex(LM(sol))}.`,
    'wurzel-lin', { k, r: qw(r), sol: sol.map(qw), art: 'lin' });
};
/** √(a·x+b) = c (c ganz, auch negativ). */
export const wurzelTerm = (a, b, c, p = 0) => {
  const x = Q(c * c - b, a), keine = c < 0, sol = keine ? [] : [x], inn = ax(a, b), ls = p ? `\\sqrt{${inn}}${p > 0 ? `+${p}` : p}=${c + p}` : `\\sqrt{${inn}}=${c}`;
  const o = wahl(LM(sol), keine
    ? [[LM([x]), `Das Quadrieren liefert ${tex(`x=${qt(x)}`)}, aber die Probe scheitert: Die Wurzel ist nie negativ, rechts steht ${tex(`${c}`)}. Scheinlösung.`], [LM([Q(c, a)]), 'Hier wurde die Wurzel ignoriert. Außerdem ist die Wurzel nie negativ – rechts steht eine negative Zahl: keine Lösung.'], [LM([Q(-c * c - b, a)]), `Nach dem Quadrieren hat die Zahl ${tex(`${c}`)} ihr Vorzeichen verloren: ${tex(`(${c})^2=${c * c}`)}. Außerdem darf die Wurzel nie ${tex(`${c}`)} ergeben.`], [LM([Q(0)]), `Probe mit ${tex('x=0')}: ${tex(`\\sqrt{${b}}`)} ist nicht ${tex(`${c}`)}.`]]
    : [[LM([Q(c - b, a)]), `Es wurde nicht quadriert, sondern ${tex(`c=${c}`)} wie eine normale Zahl behandelt: Richtig ist ${tex(`${inn}=${c}^2=${c * c}`)}.`], [LM([Q(c * c + b, a)]), `Das Vorzeichen von ${tex(`${b}`)} ist beim Umstellen falsch: ${tex(`${a === 1 ? '' : a}x=${c * c}${b >= 0 ? `-${b}` : `+${-b}`}`)}.`], [LM([Q(c * c - b, 1)]), a === 1 ? 'Es wurde durch den Faktor vor x nicht geteilt.' : `Es wurde durch ${tex(`${a}`)} nicht geteilt.`], [LM([Q(c * c - b, -a)]), 'Beim Auflösen nach x ist das Vorzeichen des Faktors verloren gegangen.']]);
  if (!o) return null;
  return A('Löse die Gleichung. Mache die Probe.', ls, o,
    [p ? `Isoliere zuerst die Wurzel: ${tex(`\\sqrt{${inn}}=${c}`)}.` : 'Quadriere beide Seiten – aber vorher prüfen: Die Wurzel kann nie negativ sein.', 'Nach dem Auflösen immer die Probe in der Ausgangsgleichung.'],
    `${p ? `Wurzel allein: ${tex(`\\sqrt{${inn}}=${c + p}${p > 0 ? `-${p}` : `+${-p}`}=${c}`)}. ` : ''}${keine ? `Die Wurzel ist nie negativ, rechts steht aber ${tex(`${c}`)}: ${tex(LM([]))}. (Quadrieren würde ${tex(`${inn}=${c * c}`)} und ${tex(`x=${qt(x)}`)} liefern; die Probe ${tex(`\\sqrt{${c * c}}=${-c}\\neq ${c}`)} zeigt: Scheinlösung.)`
      : `Quadrieren: ${tex(`${inn}=${c * c}`)}. Auflösen: ${tex(`${a === 1 ? '' : a === -1 ? '-' : a}x=${c * c - b}`)}, also ${tex(`x=${qt(x)}`)}. Probe: ${tex(`\\sqrt{${a}\\cdot ${kl(x.n)}${b >= 0 ? `+${b}` : b}}=\\sqrt{${c * c}}=${c}`)} ✓ ${tex(LM(sol))}.`}`,
    'wurzel-term', { a, b, c: c + p, p, sol: sol.map(qw), art: 'term' });
};
/** √(x+a) = x+b mit Scheinlösung: Quadrieren liefert zwei Lösungen, nur eine besteht die Probe. */
export const wurzelSchein = (r1, r2) => {
  const b = (1 - r1 - r2) / 2, a = b * b - r1 * r2, rechts = (x) => x + b, pr = (x) => `\\sqrt{${x + a}}=${Math.sqrt(x + a)}\\ \\text{und}\\ ${x}${b >= 0 ? `+${b}` : b}=${rechts(x)}`;
  const x0 = r1, x1 = r2, ls = `\\sqrt{${ax(1, a)}}=${ax(1, b)}`, eq2 = `x^{2}${2 * b - 1 >= 0 ? `+${2 * b - 1}` : 2 * b - 1}x${b * b - a >= 0 ? `+${b * b - a}` : b * b - a}=0`;
  const o = wahl(LM([Q(x0)]), [[LM([Q(x0), Q(x1)]), `${tex(`x=${x1}`)} besteht die Probe nicht: ${tex(`\\sqrt{${x1 + a}}=${Math.sqrt(x1 + a)}`)} ist positiv, rechts steht aber ${tex(`${x1}${b >= 0 ? `+${b}` : b}=${rechts(x1)}`)} – das ist eine Scheinlösung (sie entsteht erst durch das Quadrieren).`], [LM([Q(x1)]), `${tex(`x=${x1}`)} besteht die Probe nicht (rechts ${tex(`${rechts(x1)}`)} ist negativ), dafür gilt ${tex(`x=${x0}`)}.`], [LM([]), `Es gibt eine Lösung: ${tex(`x=${x0}`)}. Probe: ${tex(`\\sqrt{${x0 + a}}=${Math.sqrt(x0 + a)}`)} und ${tex(`${x0}${b >= 0 ? `+${b}` : b}=${rechts(x0)}`)}.`], [LM([Q(-x0)]), `Probe mit ${tex(`x=${-x0}`)}: ${tex(`\\sqrt{${-x0 + a}}`)} passt nicht zu ${tex(`${rechts(-x0)}`)}.`]]);
  if (!o) return null;
  return A('Löse die Gleichung. Mache unbedingt die Probe.', ls, o,
    ['Quadriere beide Seiten und löse die entstehende quadratische Gleichung. Quadrieren kann Scheinlösungen erzeugen!', 'Setze jede Lösung in die Ausgangsgleichung ein: Die rechte Seite darf nicht negativ sein.'],
    `Quadrieren: ${tex(`${ax(1, a)}=\\left(${ax(1, b)}\\right)^2`)}, zusammengefasst ${tex(eq2)}. Lösungen: ${tex(`x_1=${x0}`)} und ${tex(`x_2=${x1}`)}. Probe für ${tex(`x=${x0}`)}: ${tex(pr(x0))} ✓. Probe für ${tex(`x=${x1}`)}: ${tex(`\\sqrt{${x1 + a}}=${Math.sqrt(x1 + a)}`)}, aber rechts ${tex(`${x1}${b >= 0 ? `+${b}` : b}=${rechts(x1)}`)}${rechts(x1) < 0 ? ' ist negativ' : ''}: Scheinlösung. ${tex(LM([Q(x0)]))}.`,
    'wurzel-schein', { a, b, sol: [x0], art: 'schein' });
};
/** k·√(m·x) = n·x: Quadrieren führt auf x·(n²x − k²m) = 0 – beide Lösungen bestehen die Probe. */
export const wurzelMalX = (k, m, n) => {
  const x2 = Q(k * k * m, n * n), sol = [Q(0), x2], ls = `${k === 1 ? '' : k}\\sqrt{${m === 1 ? '' : m}x}=${n === 1 ? '' : n}x`;
  const o = wahl(LM(sol), [[LM([x2]), `Die Lösung ${tex('x=0')} ging verloren, weil durch ${tex('x')} geteilt wurde. Das ist verboten, wenn ${tex('x=0')} möglich ist. Besser ausklammern: ${tex('x\\cdot(\\dots)=0')}.`], [LM([Q(0)]), `Es gibt noch eine zweite Lösung: ${tex(`x=${qt(x2)}`)} erfüllt die Gleichung.`], [LM([Q(k * m, n)]), `Hier wurde nur die Wurzel entfernt, aber nicht richtig quadriert: Auch ${tex(`${k}`)} und ${tex(`${n}`)} müssen quadriert werden.`], [LM([Q(0), Q(k * k * m, n)]), `Beim Quadrieren muss auch ${tex(`${n}`)} zum Quadrat genommen werden: ${tex(`(${n}x)^2=${n * n}x^2`)}.`]]);
  if (!o) return null;
  return A('Löse die Gleichung. Mache die Probe.', ls, o,
    ['Quadriere beide Seiten und bringe alles auf eine Seite. Dann ausklammern – nicht durch x teilen!', 'Probe beider Lösungen in der Ausgangsgleichung (die Wurzel darf nur aus nichtnegativen Zahlen gezogen werden).'],
    `Quadrieren: ${tex(`${k * k}\\cdot ${m === 1 ? '' : `${m}\\cdot `}x=${n * n}x^{2}`)}, also ${tex(`${n * n}x^{2}-${k * k * m}x=0`)}. Ausklammern: ${tex(`x\\cdot(${n * n}x-${k * k * m})=0`)}. Ein Produkt ist 0, wenn ein Faktor 0 ist: ${tex('x=0')} oder ${tex(`x=${qt(x2)}`)}. Probe für ${tex('x=0')}: ${tex('0=0')} ✓. Probe für ${tex(`x=${qt(x2)}`)}: links ${tex(`${k}\\cdot\\sqrt{${m}\\cdot ${qk(x2)}}=${k}\\cdot\\sqrt{${qt(qm(Q(m), x2))}}=${qt(Q(k * k * m, n))}`)}, rechts ${tex(`${n}\\cdot ${qk(x2)}=${qt(Q(k * k * m, n))}`)} ✓. ${tex(LM(sol))}.`,
    'wurzel-malx', { k, m, n, sol: sol.map(qw), art: 'malx' });
};
const wl0 = () => { const k = ri(1, 3); return wurzelLin(k, Q(k * ri(1, 6))); };
const wl1 = () => wurzelLin(ri(1, 4), pick([Q(ri(1, 5) * 0 + ri(1, 3) * ri(1, 4)), Q(ri(1, 12)), Q(-ri(1, 6)), Q(-1, pick([4, 8, 16])), Q(ri(1, 6), 2)]));
const wl2 = () => wurzelTerm(pick([-1, 1, 1, 2, 3, -2]), ri(-6, 8), ri(1, 6));
const wl2b = () => wurzelTerm(pick([-1, 1, 2, 3]), ri(-4, 8), -ri(1, 7));
const wl3 = () => wurzelTerm(pick([1, 2, -1, 3, -2]), ri(-5, 9), ri(1, 5), ri(-4, 5));
const wl4 = () => { const r2 = ri(-5, 3); return wurzelSchein(r2 + pick([3, 5, 7]), r2); };
const wl5 = () => { const k = ri(1, 3), m = pick([1, 2, 3, 5, 6]), n = ri(2, 10); return k * k * m / (n * n) < 0.15 ? null : wurzelMalX(k, m, n); };
export const genWurzelGl = bau([[wl0], [wl2, wl2b, wl1], [wl3, wl2b], [wl4], [wl5, wl4]]);

/* ═════════════ 4. Bruchgleichungen mit Definitionsmenge ═════════════ */
const DM = (arr) => `\\mathbb{R}\\setminus\\left\\{${arr.map((x) => qt(Q(x))).join(';\\,')}\\right\\}`;
const DL = (D, L) => `D=${D},\\ ${LM(L)}`;
const bruchOpt = (Dr, Lr, falsch, Dall) => wahl(DL(Dr, Lr), falsch.map(([D, L, w]) => [DL(D, L), w]));
/** a/(x−b) = c */
const bg1 = () => {
  const b = ri(-4, 4), c = nz(4), x0 = ri(-5, 6); if (x0 === b) return null; const a = c * (x0 - b); if (!a || Math.abs(a) > 20) return null;
  const nenner = ax(1, -b), sol = [Q(x0)], D = DM([b]);
  const o = bruchOpt(D, sol, [['\\mathbb{R}', sol, `Die Definitionsmenge fehlt: Der Nenner ${tex(nenner)} darf nicht 0 werden, also ${tex(`x\\neq ${b}`)}.`], [DM([-b]), sol, `Der Nenner ${tex(nenner)} ist 0 für ${tex(`x=${b}`)}, nicht für ${tex(`x=${-b}`)}.`], [D, [Q(a, c)], `Es wurde durch ${tex(`${c}`)} geteilt, aber das ${tex(`${b}`)} im Nenner vergessen: ${tex(`x${b > 0 ? `-${b}` : `+${-b}`}=${qt(Q(a, c))}`)} liefert noch ${tex(`x=${qt(Q(a, c))}${b > 0 ? `+${b}` : `-${-b}`}`)}.`], [D, [Q(2 * b - x0)], `Beim Umstellen ist das Vorzeichen falsch: ${tex(`x${b > 0 ? `-${b}` : `+${-b}`}=${qt(Q(a, c))}`)} ergibt ${tex(`x=${b}+${kl(a / c)}`)}.`]]);
  if (!o) return null;
  return A('Bestimme zuerst die Definitionsmenge und löse dann die Gleichung.', `\\dfrac{${a}}{${nenner}}=${c}`, o,
    ['Der Nenner darf nicht 0 sein – das gibt die Definitionsmenge.', `Multipliziere mit dem Nenner ${tex(nenner)} und löse nach ${tex('x')} auf.`],
    `Nenner ${tex(`${nenner}\\neq 0`)}, also ${tex(`D=${D}`)}. Mit ${tex(nenner)} multiplizieren: ${tex(`${a}=${c}\\cdot(${nenner})`)}. Durch ${tex(`${c}`)} teilen: ${tex(`${nenner}=${qt(Q(a, c))}`)}, also ${tex(`x=${x0}`)}. ${tex(`${x0}\\in D`)} ✓. Probe: ${tex(`\\dfrac{${a}}{${x0}${b >= 0 ? `-${b}` : `+${-b}`}}=\\dfrac{${a}}{${x0 - b}}=${c}`)} ✓. ${tex(DL(D, sol))}.`,
    'bruch', { art: 'bg1', a, b, c, D: [b], sol: [x0] });
};
/** p/(x−a) = q/(x−b) */
const bg2 = () => {
  const a = ri(-4, 4), b = ri(-4, 4), p = nz(5), q = nz(5); if (a === b || p === q) return null;
  const x = Q(p * b - q * a, p - q); if (x.d > 4 || Math.abs(x.n) > 30) return null; if (qg(x, Q(a)) || qg(x, Q(b))) return null;
  const D = DM([a, b]), sol = [x], na = ax(1, -a), nb = ax(1, -b);
  const o = bruchOpt(D, sol, [['\\mathbb{R}', sol, `Die Definitionsmenge fehlt: Beide Nenner dürfen nicht 0 werden, also ${tex(`x\\neq ${a}`)} und ${tex(`x\\neq ${b}`)}.`], [DM([a]), sol, `Auch der zweite Nenner ${tex(nb)} darf nicht 0 werden: ${tex(`x\\neq ${b}`)} gehört zur Definitionsmenge dazu.`], [D, [Q(p * a - q * b, p - q)], `Beim Überkreuz-Multiplizieren wurden ${tex(`${a}`)} und ${tex(`${b}`)} vertauscht: ${tex(`${p}\\cdot(${nb})=${q}\\cdot(${na})`)} ist richtig.`], [D, [Q(p * b + q * a, p - q)], 'Beim Ausmultiplizieren ist ein Vorzeichen falsch: Auf der rechten Seite steht ein Minus vor dem Glied mit dem Nenner.']]);
  if (!o) return null;
  return A('Bestimme zuerst die Definitionsmenge und löse dann die Gleichung.', `\\dfrac{${p}}{${na}}=\\dfrac{${q}}{${nb}}`, o,
    ['Definitionsmenge: Beide Nenner dürfen nicht 0 werden.', 'Überkreuz multiplizieren (oder mit dem Hauptnenner), dann nach x auflösen.'],
    `Nenner: ${tex(`${na}\\neq 0`)} und ${tex(`${nb}\\neq 0`)}, also ${tex(`D=${D}`)}. Überkreuz: ${tex(`${p}\\cdot(${nb})=${q}\\cdot(${na})`)}. Ausmultiplizieren: ${tex(`${ax(p, -p * b)}=${ax(q, -q * a)}`)}. Sortieren: ${tex(`${p - q}x=${p * b - q * a}`)}, also ${tex(`x=${qt(x)}`)}. ${tex(`${qt(x)}\\in D`)} ✓. ${tex(DL(D, sol))}.`,
    'bruch', { art: 'bg2', a, b, p, q, D: [a, b], sol: [qw(x)] });
};
/** (x+p)/(x−b) = (b+p)/(x−b): einzige „Lösung“ x = b liegt nicht in D → keine Lösung. */
const bg3 = () => {
  const b = ri(-4, 4), p = nz(4); if (b + p === 0) return null; const nb = ax(1, -b), D = DM([b]);
  const o = bruchOpt(D, [], [[D, [Q(b)], `${tex(`x=${b}`)} ist die einzige Zahl, die beim Auflösen herauskommt – sie macht den Nenner aber 0 und gehört nicht zu ${tex('D')}. Es ist eine Scheinlösung.`], ['\\mathbb{R}', [Q(b)], `Ohne Definitionsmenge wirkt ${tex(`x=${b}`)} wie eine Lösung – es macht aber den Nenner 0.`], [D, [Q(-p)], `Probe mit ${tex(`x=${-p}`)}: Links steht ${tex('0')}, rechts ${tex(`\\dfrac{${b + p}}{${-p - b}}=-1`)}. Die Gleichung ist nicht erfüllt.`]].concat([['\\mathbb{R}', [], `Die Definitionsmenge fehlt: ${tex(`x\\neq ${b}`)} muss ausgeschlossen werden.`]]));
  if (!o) return null;
  return A('Bestimme zuerst die Definitionsmenge und löse dann die Gleichung.', `\\dfrac{x${p > 0 ? `+${p}` : p}}{${nb}}=\\dfrac{${b + p}}{${nb}}`, o,
    ['Definitionsmenge zuerst – und am Ende prüfen, ob die Lösung dazugehört.', 'Beide Seiten haben denselben Nenner.'],
    `Nenner ${tex(`${nb}\\neq 0`)}: ${tex(`D=${D}`)}. Mit ${tex(nb)} multiplizieren: ${tex(`x${p > 0 ? `+${p}` : p}=${b + p}`)}, also ${tex(`x=${b}`)}. Aber ${tex(`${b}\\notin D`)}: Der Nenner wäre 0. Das ist eine Scheinlösung, die Gleichung hat keine Lösung: ${tex(DL(D, []))}.`,
    'bruch', { art: 'bg3', b, p, D: [b], sol: [] });
};
/** a/(x−b) + c/(x+b) = d/(x²−b²) – wenn x = ±b herauskommt, ist es eine Scheinlösung. */
const bg4 = () => {
  const b = ri(1, 4), a = nz(3), c = nz(3); if (a + c === 0) return null; const x0 = pick([ri(-4, 5), b, -b]), d = (a + c) * x0 + a * b - c * b; if (!d || Math.abs(d) > 30) return null;
  const schein = x0 === b || x0 === -b, D = DM([-b, b]), sol = schein ? [] : [Q(x0)];
  const falsch = [['\\mathbb{R}', sol, `Die Definitionsmenge fehlt: ${tex(`x^2-${b * b}=(x-${b})(x+${b})`)} ist 0 für ${tex(`x=${b}`)} und ${tex(`x=${-b}`)}.`], [DM([b]), sol, `Es fehlt ${tex(`x\\neq ${-b}`)}: Der Nenner ${tex(`x+${b}`)} wird für ${tex(`x=${-b}`)} zu 0.`], [D, schein ? [Q(x0)] : [], schein ? `${tex(`x=${x0}`)} macht einen Nenner 0 und liegt nicht in ${tex('D')}: Scheinlösung.` : `Es gibt eine Lösung: ${tex(`x=${x0}`)} liegt in ${tex('D')} und erfüllt die Gleichung.`], [D, [Q(x0 + 1)], 'Beim Erweitern der Brüche wurde ein Vorzeichen falsch gesetzt: Der zweite Bruch wird mit ' + tex(`(x-${b})`) + ' erweitert, der erste mit ' + tex(`(x+${b})`) + '.']];
  const o = bruchOpt(D, sol, falsch);
  if (!o) return null;
  return A('Bestimme zuerst die Definitionsmenge und löse dann die Gleichung.', `\\dfrac{${a}}{x-${b}}+\\dfrac{${c}}{x+${b}}=\\dfrac{${d}}{x^{2}-${b * b}}`, o,
    [`Zerlege den Nenner: ${tex(`x^2-${b * b}=(x-${b})(x+${b})`)}. Das ist der Hauptnenner.`, 'Mit dem Hauptnenner multiplizieren und prüfen, ob die Lösung zur Definitionsmenge gehört.'],
    `${tex(`x^2-${b * b}=(x-${b})(x+${b})`)}, also ${tex(`D=${D}`)}. Mit dem Hauptnenner multiplizieren: ${tex(`${a}(x+${b})+${c}(x-${b})=${d}`)}. Ausmultiplizieren: ${tex(`${a + c}x${a * b - c * b >= 0 ? `+${a * b - c * b}` : a * b - c * b}=${d}`)}, also ${tex(`x=${x0}`)}. ${schein ? `Aber ${tex(`${x0}\\notin D`)}: Der Nenner wäre 0 – Scheinlösung, keine Lösung.` : `${tex(`${x0}\\in D`)} ✓.`} ${tex(DL(D, sol))}.`,
    'bruch', { art: 'bg4', a, b, c, d, D: [-b, b], sol: sol.map(qw) });
};
/** x + p/x = s: quadratische Gleichung mit zwei Lösungen, D = ℝ∖{0} */
const bg5 = () => {
  const r1 = nz(5), r2 = nz(5); if (r1 === r2) return null; const p = r1 * r2, s = r1 + r2, D = DM([0]), sol = [Q(r1), Q(r2)];
  const o = bruchOpt(D, sol, [[D, [Q(r1)], `Es gibt zwei Lösungen: Auch ${tex(`x=${r2}`)} erfüllt die Gleichung (Probe: ${tex(`${r2}+\\dfrac{${p}}{${kl(r2)}}=${r2}${r1 >= 0 ? `+${r1}` : r1}=${s}`)}).`], ['\\mathbb{R}', sol, `Die Definitionsmenge fehlt: ${tex('x=0')} macht den Nenner 0.`], [D, [Q(-r1), Q(-r2)], `Die Vorzeichen sind falsch: Probe mit ${tex(`x=${-r1}`)}: ${tex(`${-r1}+\\dfrac{${p}}{${kl(-r1)}}=${-r1}${-r2 >= 0 ? `+${-r2}` : -r2}=${-s}`)}, nicht ${tex(`${s}`)}.`], [D, [Q(p), Q(s)], 'Hier wurden die Zahlen aus der Gleichung als Lösungen genommen. Gelöst werden muss die quadratische Gleichung nach Multiplikation mit x.']]);
  if (!o) return null;
  return A('Bestimme zuerst die Definitionsmenge und löse dann die Gleichung.', `x+\\dfrac{${p}}{x}=${s}`, o,
    ['Mit x multiplizieren. Es entsteht eine quadratische Gleichung.', 'Zwei Lösungen sind möglich – beide müssen in der Definitionsmenge liegen.'],
    `${tex('x\\neq 0')}, also ${tex(`D=${D}`)}. Mit ${tex('x')} multiplizieren: ${tex(`x^{2}+${p}=${s}x`)}, also ${tex(`x^{2}${-s >= 0 ? `+${-s}` : -s}x${p >= 0 ? `+${p}` : p}=0`)}. pq-Formel oder Faktorisieren: ${tex(`(x${r1 > 0 ? `-${r1}` : `+${-r1}`})(x${r2 > 0 ? `-${r2}` : `+${-r2}`})=0`)}, also ${tex(`x=${r1}`)} oder ${tex(`x=${r2}`)}. Beide liegen in ${tex('D')} ✓. ${tex(DL(D, sol))}.`,
    'bruch', { art: 'bg5', p, s, D: [0], sol: [r1, r2] });
};
export const genBruchGl = bau([[bg3, bg1], [bg5, bg1], [bg1, bg2], [bg2, bg4], [bg4]]);

/* ═════════════ 5. Rationale Hochzahlen ═════════════ */
const brz = (m, n) => (n === 1 ? `${m}` : `\\tfrac{${m}}{${n}}`);
const rp = ({ s, m, n, neg }) => {   // a^(±m/n) mit a = s^n
  const a = s ** n, ex = `${neg ? '-' : ''}${brz(m, n)}`, w = Q(s ** m), erg = neg ? Q(1, s ** m) : w, ls = `${a}^{${ex}}`;
  const o = wahl(qt(erg), [neg ? [qt(w), `Das Minus in der Hochzahl bedeutet den Kehrwert: ${tex(`${a}^{-${brz(m, n)}}=\\dfrac{1}{${a}^{${brz(m, n)}}}`)}.`] : null, neg ? [qt(Q(-(s ** m))), 'Eine negative Hochzahl macht die Zahl nicht negativ, sondern bildet den Kehrwert.'] : null,
    [qt(Q(s * m)), `Es wurde ${tex(`${s}\\cdot ${m}`)} gerechnet. Die Hochzahl ${tex(`${m}`)} gehört zur Potenz: ${tex(`${s}^{${m}}=${s ** m}`)}.`], [qt(Q(a * m, n)), `Es wurde ${tex(`${a}\\cdot ${brz(m, n)}`)} gerechnet. Die Hochzahl ist keine Zahl zum Multiplizieren, sondern gibt Wurzel und Potenz an.`], [qt(Q(s ** n)), `Der Nenner ${tex(`${n}`)} der Hochzahl bedeutet die ${n}-te Wurzel, nicht die ${n}-te Potenz.`], [qt(neg ? Q(1, s * m) : Q(s ** (m + 1))), 'Rechenfehler beim Potenzieren.'], [qt(Q(m * s ** (m - 1 || 1))), 'Das ist die Ableitung, nicht der Wert der Potenz.'], [qt(Q(s + n)), `Die ${n}-te Wurzel wurde nicht gezogen, sondern ${tex(`${n}`)} dazugezählt.`], [qt(Q(s + 1)), `Rechenfehler: ${tex(`\\sqrt[${n}]{${a}}=${s}`)}, nicht ${tex(`${s + 1}`)}.`]]);
  if (!o) return null;
  return A('Berechne ohne Taschenrechner.', ls, o,
    [`Der Nenner der Hochzahl ist der Wurzelexponent: ${tex(`a^{\\frac{m}{n}}=\\left(\\sqrt[n]{a}\\right)^{m}`)}.`, neg ? 'Eine negative Hochzahl bedeutet: Kehrwert bilden.' : 'Erst die Wurzel ziehen, dann potenzieren – das ist einfacher.'],
    `${tex(`${a}^{${brz(m, n)}}=${m === 1 ? '' : '\\left('}\\sqrt[${n}]{${a}}${m === 1 ? '' : `\\right)^{${m}}=${s}^{${m}}`}=${s ** m}`)}.${neg ? ` Negative Hochzahl: Kehrwert, ${tex(`${a}^{${ex}}=\\dfrac{1}{${s ** m}}`)}.` : ''} Ergebnis: ${tex(qt(erg))}.`,
    'ratpot', { a, m, n, neg: !!neg, wert: qw(erg) });
};
const rt = (kind) => () => {   // Potenzgesetze mit gebrochenen Hochzahlen
  let p = ri(1, 4), q = ri(2, 5), r = ri(1, 4), t = ri(2, 5), ls, res, expl;
  const E = (m, n) => Q(m, n);
  if (kind === 'mal') { if (q === t) return null; res = qa(E(p, q), E(r, t)); ls = `x^{${brz(p, q)}}\\cdot x^{${brz(r, t)}}`; expl = `Gleiche Basis, Hochzahlen addieren: ${tex(`${brz(p, q)}+${brz(r, t)}=${qt(res)}`)}.`; }
  else if (kind === 'durch') { res = qs(E(p, q), E(r, t)); if (res.n === 0 || qw(res) <= 0 || (q === t && p === r)) return null; ls = `\\dfrac{x^{${brz(p, q)}}}{x^{${brz(r, t)}}}`; expl = `Gleiche Basis, Hochzahlen subtrahieren: ${tex(`${brz(p, q)}-${brz(r, t)}=${qt(res)}`)}.`; }
  else { res = qm(E(p, q), E(r, t)); ls = `\\left(x^{${brz(p, q)}}\\right)^{${brz(r, t)}}`; expl = `Potenz einer Potenz, Hochzahlen multiplizieren: ${tex(`${brz(p, q)}\\cdot ${brz(r, t)}=${qt(res)}`)}.`; }
  const X = (v) => `x^{${qt(v)}}`;
  const sum = qa(E(p, q), E(r, t)), dif = qs(E(p, q), E(r, t)), prod = qm(E(p, q), E(r, t));
  const o = wahl(X(res), [kind !== 'mal' ? [X(sum), 'Addiert wurde nur beim Malnehmen gleicher Basen. Hier gilt eine andere Regel.'] : null, kind !== 'durch' ? [X(dif), 'Subtrahiert wird nur beim Teilen gleicher Basen.'] : null, kind !== 'pot' ? [X(prod), 'Multipliziert werden die Hochzahlen nur bei „Potenz einer Potenz“.'] : null,
    [X(Q(p + r, q + t)), 'Zähler und Nenner wurden getrennt addiert. Brüche addiert man mit gemeinsamem Nenner.'], [`${qt(Q(p * r, q))}`, 'Das ist keine Potenz von x mehr: Die Basis x darf nicht verloren gehen.']]);
  if (!o) return null;
  return A('Vereinfache. Schreibe das Ergebnis als Potenz von x.', ls, o, ['Welches Potenzgesetz passt: gleiche Basis malnehmen, teilen oder Potenz einer Potenz?', 'Die Hochzahlen sind Brüche – mit gemeinsamem Nenner rechnen.'], `${expl} Ergebnis: ${tex(`x^{${qt(res)}}`)}.`, 'ratpot-term', { kind, p, q, r, t, ex: qw(res) });
};
/** x^(m/n) = k → x = s^n mit k = s^m */
const rg = () => {
  const n = pick([2, 3, 4]), m = pick([1, 2, 3].filter((v) => v !== n)), s = ri(2, 4); if (s ** n > 400 || ggT(m, n) !== 1) return null;
  const k = s ** m, x = s ** n, ls = `x^{${brz(m, n)}}=${k}`;
  const o = wahl(`${x}`, [[`${k}`, `Die Hochzahl ${tex(brz(m, n))} wurde einfach weggelassen. Zum Auflösen muss mit dem Kehrbruch ${tex(brz(n, m))} potenziert werden.`], [`${s}`, `Das ist ${tex(`${k}^{\\frac{1}{${m}}}`)}: Es wurde nur die ${m}-te Wurzel gezogen. Danach muss noch mit ${tex(`${n}`)} potenziert werden.`], [`${qt(Q(k * n, m))}`, 'Die Hochzahl wurde als Faktor behandelt. Zum Auflösen potenziert man mit dem Kehrbruch.'], [`${s ** (n + 1)}`, `Probe: ${tex(`${s ** (n + 1)}^{${brz(m, n)}}`)} ist nicht ${tex(`${k}`)}.`]]);
  if (!o) return null;
  return A('Löse die Gleichung.', ls, o, ['Potenziere beide Seiten mit dem Kehrbruch der Hochzahl.', `Kehrbruch von ${tex(brz(m, n))} ist ${tex(brz(n, m))}.`],
    `Beide Seiten mit ${tex(brz(n, m))} potenzieren: ${tex(`x=${k}^{${brz(n, m)}}=\\left(\\sqrt[${m}]{${k}}\\right)^{${n}}=${s}^{${n}}=${x}`)}. Probe: ${tex(`${x}^{${brz(m, n)}}=\\left(\\sqrt[${n}]{${x}}\\right)^{${m}}=${s}^{${m}}=${k}`)} ✓.`, 'ratpot-gl', { m, n, k, x });
};
const rpot0 = () => rp({ s: ri(2, 6), m: 1, n: 2 });
const rpot1 = () => rp({ s: ri(2, 5), m: 1, n: pick([3, 4]) });
const rpot2 = () => rp({ s: ri(2, 4), m: ri(2, 3), n: pick([2, 3, 4]) });
const rpot2b = () => { const n = pick([2, 3, 4]), m = pick([2, 3, 5].filter((v) => v !== n)); return rp({ s: ri(2, 3), m, n }); };
const rpot3 = () => rp({ s: ri(2, 3), m: ri(1, 3), n: pick([2, 3]), neg: true });
export const genRatPot = bau([[rpot0, rpot1], [rpot2, rpot2b], [rt('mal'), rt('durch')], [rg, rt('pot')], [rpot3, rg]]);

for (const [fn, name, topic] of [[genGauss, 'genGauss', 'Gauß-Verfahren'], [genPotenzGl, 'genPotenzGl', 'Potenzgleichungen'], [genWurzelGl, 'genWurzelGl', 'Wurzelgleichungen'], [genBruchGl, 'genBruchGl', 'Bruchgleichungen'], [genRatPot, 'genRatPot', 'Rationale Hochzahlen']]) { Object.defineProperty(fn, 'name', { value: name }); fn.topic = topic; }
export const GENS13 = { genGauss, genPotenzGl, genWurzelGl, genBruchGl, genRatPot };
