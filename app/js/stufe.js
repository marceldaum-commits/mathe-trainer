// Schwierigkeit messbar machen: Kennzahlen einer Aufgabe und die Auswahl nach Stufe.
// Jede Aufgabe bekommt aus ihrer Stellung und ihrem Lösungsweg feste Kennzahlen. Für eine Stufe werden mehrere Aufgaben
// erzeugt und nach der Kennzahl „Anspruch“ sortiert: Stufe 1 bekommt die leichteste, Stufe 5 die schwerste.
// So steigt jede Aufgaben-Art nachweislich von Stufe zu Stufe (geprüft in tests/stufen.mjs).

const ANNOT = /<annotation encoding="application\/x-tex">([\s\S]*?)<\/annotation>/g;
const ENT = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#x27;': "'", '&#39;': "'" };
const klar = (s) => s.replace(/&(amp|lt|gt|quot|#x27|#39);/g, (m) => ENT[m]);

/** Trennt einen Text der App in Formel-Quelltext und reinen Lesetext (fertig gesetzte Formeln werden an ihrem Quelltext erkannt). */
export function zerlegen(html) {
  const s = String(html ?? ''); let tex = '', text = '', i = 0;
  for (;;) {
    const a = s.indexOf('<span class="katex', i);
    if (a < 0) { text += s.slice(i); break; }
    text += s.slice(i, a) + ' ';
    let tief = 0, j = a; const re = /<span\b|<\/span>/g; re.lastIndex = a;
    for (let m; (m = re.exec(s));) { tief += m[0] === '</span>' ? -1 : 1; if (!tief) { j = re.lastIndex; break; } }
    if (j === a) j = s.length;
    for (const m of s.slice(a, j).matchAll(ANNOT)) tex += ' ' + klar(m[1]);
    i = j;
  }
  return { tex, text: klar(text.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim() };
}

const sauber = (t) => String(t ?? '').replace(/\{,\}/g, ',').replace(/\\(begin|end)\{[a-z*]+\}(\{[^}]*\})?/g, ' ').replace(/\\(text|mathrm|operatorname|textbf|mathbf)\{[^}]*\}/g, ' ').replace(/\\(left|right|big|Big|bigl|bigr|Bigl|Bigr|displaystyle|quad|qquad|,|;|!| )/g, ' ').replace(/\\\\(\[[^\]]*\])?/g, ' ');
const ZEICHEN = /\\(cdot|times|div|d?frac|tfrac|sqrt|int|sum|prod|binom|sin|cos|tan|ln|log|exp|lim|vec|overline|pm|mp|le|ge|leq|geq|neq|approx|Rightarrow|Leftrightarrow|to)(?![a-zA-Z])|[+\-:=^'<>]/g;
/** Zahl der Rechenzeichen in einem Formel-Quelltext (Plus, Mal, Bruch, Potenz, Wurzel, Integral, Funktionen, Gleichheitszeichen …). */
export const zeichen = (t) => (sauber(t).match(ZEICHEN) || []).length;
/** Größte Verschachtelung: wie tief Klammern, Brüche, Hochzahlen und Wurzeln ineinander stecken. */
export function tiefe(t) {
  let d = 0, max = 0;
  for (const c of sauber(t)) { if (c === '(' || c === '{' || c === '[') max = Math.max(max, ++d); else if ((c === ')' || c === '}' || c === ']') && d > 0) d--; }
  return max;
}
/** Höchste Hochzahl (Grad). */
export const grad = (t) => Math.max(0, ...[...sauber(t).matchAll(/\^\{?(\d+)/g)].map((m) => +m[1]).filter((n) => n < 30));
const PARAM = new Set('abckmnpqrstuvw');
/** Zahl der verschiedenen Buchstaben-Parameter (a, k, t …) – ohne x, y, z, Funktionsnamen und Befehle. */
export function parameter(t) {
  const s = sauber(t).replace(/\\[a-zA-Z]+/g, ' '), gef = new Set();
  for (const m of s.matchAll(/[a-zA-Z]+/g)) if (m[0].length === 1 && PARAM.has(m[0])) gef.add(m[0]);
  return gef.size;
}
const REGELN = /Kettenregel|Produktregel|Quotientenregel|Substitution|partiell|Mitternachtsformel|pq-Formel|Satz des Pythagoras|Pythagoras|Gegenereignis|Pfadregel|Satz von Bayes|Bayes|Kreuzprodukt|Skalarprodukt|Hauptsatz|Vorzeichenwechsel|Polynomdivision|Ausklammern|binomische|Logarithm|Normalenvektor|Hesse|Sigma-Regel|Summenregel|Faktorregel|Potenzregel|Erweitern|Kehrwert|Dreisatz|Strahlensatz|Sinussatz|Kosinussatz/gi;
const krumm = (o) => (typeof o?.num === 'number' ? Math.abs(o.num - Math.round(o.num)) > 1e-9 : /,\d|\\d?frac|\\sqrt|\\pi|\\ln|e\^/.test(sauber(o?.tex)));

/**
 * Kennzahlen einer Aufgabe:
 *  schritte  = Rechenzeichen im Lösungsweg (Tipps + Erklärung) · regeln = genannte Regeln im Lösungsweg
 *  grad      = höchste Hochzahl der Aufgabe · tiefe = größte Verschachtelung der Aufgabe
 *  parameter = Buchstaben-Parameter der Aufgabe · weg = Länge des Lösungswegs in Zeichen
 *  krumm     = 1, wenn das Ergebnis keine ganze Zahl ist · aufgabe = Rechenzeichen in der Aufgabe selbst
 *  anspruch  = alles zusammen in einer Zahl (danach wird sortiert)
 */
export function kennzahlen(q) {
  const p = zerlegen(q.prompt), A = `${q.formula ?? ''} ${p.tex}`;
  const l = zerlegen([...(q.hints || []), q.explain ?? ''].join(' '));
  const richtig = (q.options || []).find((o) => o.correct);
  const k = {
    schritte: zeichen(l.tex), regeln: new Set((l.text.match(REGELN) || []).map((r) => r.toLowerCase())).size,
    grad: grad(A), tiefe: tiefe(A), parameter: parameter(A), weg: l.text.length + sauber(l.tex).replace(/\\[a-zA-Z]+|[{}\s]/g, '').length,
    krumm: krumm(richtig) ? 1 : 0, aufgabe: zeichen(A), ziffern: (sauber(A).match(/\d/g) || []).length + (p.text.match(/\d/g) || []).length, text: p.text.length,
  };
  k.anspruch = k.schritte + 2 * k.regeln + k.grad + 2 * k.tiefe + 3 * k.parameter + k.weg / 30 + 4 * k.krumm + k.aufgabe + k.ziffern / 2 + k.text / 40;
  return k;
}

const PROBEN = [3, 2, 1, 2, 3];
/**
 * Aufgabe einer Art für eine Stufe. Unterhalb der Mitte wird aus mehreren erzeugten Aufgaben die leichteste genommen
 * (Stufe 1: aus drei, Stufe 2: aus zwei), oberhalb die schwerste (Stufe 4: aus zwei, Stufe 5: aus drei). Stufe 3 nimmt die Aufgabe, wie sie kommt.
 */
export function stelle(fn, lv = 3) {
  const L = Math.min(5, Math.max(1, lv | 0 || 3)), hoch = L > 3; let best = null, wert = 0;
  for (let i = 0; i < PROBEN[L - 1]; i++) { const q = fn(L), a = PROBEN[L - 1] > 1 ? kennzahlen(q).anspruch : 0; if (!best || (hoch ? a > wert : a < wert)) { best = q; wert = a; } }
  return best;
}
