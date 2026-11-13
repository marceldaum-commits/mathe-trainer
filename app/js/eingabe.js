// Freie Eingabe: Aus einer Auswahl-Aufgabe mit Zahlen-Antwort wird eine Aufgabe zum Eintippen.
// Reine Rechen-Funktionen ohne Browser – werden in tests/run.mjs geprüft.

const NUM = '-?\\d+(?:\\{,\\}\\d+)?';
const SHAPES = [
  [new RegExp(`^(x=|\\\\approx ?)?(${NUM})(\\\\,\\\\%)?$`), (m) => ({ pre: m[1] === 'x=' ? 'x =' : m[1] ? '≈' : '', plain: m[2].replace('{,}', ','), post: m[3] ? '%' : '' })],
  [/^(-?)\\dfrac\{(\d+)\}\{(\d+)\}$/, (m) => ({ pre: '', plain: `${m[1]}${m[2]}/${m[3]}`, post: '', frac: true })],
];
/** Zerlegt eine Antwort in LaTeX in Vorsatz, tippbaren Text und Einheit – oder null, wenn sie keine einfache Zahl ist. */
export function shapeOf(texStr) {
  for (const [re, make] of SHAPES) { const m = String(texStr).match(re); if (m) return make(m); }
  return null;
}
/**
 * Eignet sich die Aufgabe zum Eintippen? Alle Antworten sind Zahlen, die richtige ist eine einfache Zahl oder ein Bruch –
 * und die Anzeige passt zum gespeicherten Wert. Liefert { sh, num, faktor } oder null. faktor 100: Anzeige in Prozent, Wert als Anteil.
 */
export function inputSpec(q) {
  if (q.type || !q.options?.every((o) => Number.isFinite(o.num))) return null;
  const r = q.options.find((o) => o.correct), sh = shapeOf(r.tex);
  if (!sh) return null;
  for (const faktor of [1, 100]) {
    const fits = (o) => { const so = shapeOf(o.tex); return !so || isRight(parseInput(so.plain), o.num * faktor, so.plain); };
    if (q.options.every(fits)) return { sh, num: r.num * faktor, faktor };
  }
  return null;
}
export const canInput = (q) => !!inputSpec(q);
/** Liest eine Eingabe: „3,5", „-2", „7/4", „25 %". Liefert eine Zahl oder null. */
export function parseInput(text) {
  const s = String(text).trim().replace(/\s+/g, '').replace(/%$/, '').replace(/^x=/i, '').replace(/−/g, '-').replace(/,/g, '.');
  let m = s.match(/^(-?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);
  if (m) return +m[2] === 0 ? null : +m[1] / +m[2];
  m = s.match(/^-?(?:\d+(?:\.\d*)?|\.\d+)$/);
  return m ? +s : null;
}
/** Wie viele Nachkommastellen zeigt die Lösung? (Danach richtet sich die erlaubte Abweichung.) */
export const decimalsOf = (plain) => (plain.includes('/') ? 3 : (plain.split(',')[1] || '').length);
/** Ist die Eingabe richtig? Erlaubt Rundung auf die gezeigte Stellenzahl. */
export function isRight(value, num, plain) {
  if (value === null) return false;
  const d = decimalsOf(plain), tol = (d === 0 ? 0.005 : 0.5 * 10 ** -d) + 1e-9;
  return Math.abs(value - num) <= (plain.includes('/') ? 0.0006 * Math.max(1, Math.abs(num)) : tol);
}
/** Passt die falsche Eingabe zu einem typischen Fehler? Liefert dessen Diagnose. */
export function diagnose(value, q, faktor = 1) {
  if (value === null) return null;
  const hit = q.options.find((o) => !o.correct && Math.abs(o.num * faktor - value) <= Math.max(0.06, 0.006 * Math.abs(o.num * faktor)));
  return hit ? hit.why : null;
}
