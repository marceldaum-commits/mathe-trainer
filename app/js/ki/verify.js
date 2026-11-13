// Prüfer für KI-Aufgaben: Nichts von einer KI geht ungeprüft an Schüler. Der Server (und zur Sicherheit auch die App)
// rechnet jede Aufgabe nach. Schema und Ablauf: docs/KI.md.
import { parse } from './expr.js';

export const ARTEN = ['ableitung', 'stammfunktion', 'integral', 'zahl'];
const XS = [-1.7, -0.6, 0.4, 1.3, 2.2];
const close = (a, b) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= 1e-4 * (1 + Math.abs(a) + Math.abs(b));
const deriv = (f, x, hh = 1e-5) => (f(x + hh) - f(x - hh)) / (2 * hh);
const simpson = (f, a, b, m = 400) => { const hh = (b - a) / m; let s = f(a) + f(b); for (let i = 1; i < m; i++) s += f(a + i * hh) * (i % 2 ? 4 : 2); return (s * hh) / 3; };
const text = (v, min, max) => typeof v === 'string' && v.trim().length >= min && v.length <= max;
const clean = (v) => typeof v === 'string' && !/<\s*(script|iframe|img|svg|a|style|link)\b|javascript:|on\w+\s*=/i.test(v);

/** Prüft eine KI-Aufgabe. Liefert { ok, errors } – ok nur, wenn die Lösung rechnerisch stimmt und alle Ablenker falsch sind. */
export function verify(t) {
  const errors = [];
  const bad = (m) => { errors.push(m); };
  if (!t || typeof t !== 'object') return { ok: false, errors: ['Aufgabe fehlt'] };
  if (!ARTEN.includes(t.art)) bad(`Unbekannte Art „${t.art}"`);
  if (!text(t.frage, 8, 600) || !clean(t.frage)) bad('Frage fehlt, ist zu lang oder enthält unerlaubte Zeichen');
  if (!text(t.erklaerung, 8, 800) || !clean(t.erklaerung)) bad('Erklärung fehlt oder ist unzulässig');
  if (!text(t.thema, 2, 60)) bad('Thema fehlt');
  if (!Number.isInteger(t.stufe) || t.stufe < 1 || t.stufe > 5) bad('Stufe muss 1 bis 5 sein');
  if (!Array.isArray(t.tipps) || t.tipps.length < 2 || !t.tipps.every((x) => text(x, 4, 300) && clean(x))) bad('Mindestens zwei Tipps nötig');
  const o = t.antworten;
  if (!Array.isArray(o) || o.length !== 4) { bad('Genau vier Antworten nötig'); return { ok: false, errors }; }
  const right = o.filter((a) => a && a.richtig === true);
  if (right.length !== 1) bad('Genau eine Antwort muss als richtig markiert sein');
  for (const a of o) {
    if (!a || !text(a.tex, 1, 200) || !clean(a.tex)) bad('Jede Antwort braucht eine Darstellung (tex)');
    else if (a.richtig !== true && (!text(a.fehler, 6, 300) || !clean(a.fehler))) bad('Jede falsche Antwort braucht eine Fehler-Diagnose');
  }
  if (new Set(o.map((a) => a && a.tex)).size !== 4) bad('Antworten müssen verschieden sein');
  if (errors.length) return { ok: false, errors };

  try {
    if (t.art === 'ableitung' || t.art === 'stammfunktion') {
      const f = parse(t.funktion), fs = o.map((a) => parse(a.ausdruck));
      const xs = XS.filter((x) => Number.isFinite(f(x)) && Number.isFinite(deriv(f, x)));
      if (xs.length < 3) bad('Funktion ist an zu wenigen Prüfstellen definiert');
      const passt = (g) => (t.art === 'ableitung' ? xs.every((x) => close(g(x), deriv(f, x))) : xs.every((x) => close(deriv(g, x), f(x))));
      o.forEach((a, i) => {
        const p = passt(fs[i]);
        if (a.richtig && !p) bad('Die als richtig markierte Antwort stimmt rechnerisch nicht');
        if (!a.richtig && p) bad(`Ablenker „${a.tex}" ist rechnerisch ebenfalls richtig`);
      });
    } else if (t.art === 'integral') {
      const f = parse(t.funktion);
      if (![t.von, t.bis].every(Number.isFinite) || t.von >= t.bis) bad('Grenzen fehlen oder sind vertauscht');
      else { const want = simpson(f, t.von, t.bis); o.forEach((a) => { const p = close(Number(a.wert), want); if (a.richtig && !p) bad(`Integralwert stimmt nicht (berechnet ${want.toFixed(4)})`); if (!a.richtig && p) bad('Ein Ablenker hat denselben Wert wie die Lösung'); }); }
    } else if (t.art === 'zahl') {
      const want = parse(t.rechnung, [])({});
      if (!Number.isFinite(want)) bad('Rechnung ergibt keine Zahl');
      o.forEach((a) => { const p = close(Number(a.wert), want); if (a.richtig && !p) bad(`Ergebnis stimmt nicht (berechnet ${want})`); if (!a.richtig && p) bad('Ein Ablenker hat denselben Wert wie die Lösung'); });
    }
  } catch (e) { bad(`Rechenausdruck nicht lesbar: ${e.message}`); }
  return { ok: errors.length === 0, errors };
}

/** Wandelt eine geprüfte KI-Aufgabe in das Aufgaben-Format der App um. Ungeprüfte Aufgaben werden abgelehnt. */
export function toQuestion(t) {
  const v = verify(t);
  if (!v.ok) throw new Error(`KI-Aufgabe abgelehnt: ${v.errors.join('; ')}`);
  return {
    prompt: t.frage, formula: t.formel || undefined, topic: t.thema, gen: 'ki', ki: true,
    options: t.antworten.map((a) => ({ tex: a.tex, correct: a.richtig === true, why: a.fehler })),
    hints: t.tipps, explain: t.erklaerung,
  };
}
