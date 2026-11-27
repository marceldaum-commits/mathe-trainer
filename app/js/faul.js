// Aufgaben erst bei Bedarf laden (Paket 0.40): Die Aufgaben-Erzeuger (gen.js … gen12.js) sind zusammen rund 1,5 MB groß.
// Der erste Bildschirm braucht sie nicht. Die App arbeitet deshalb mit leichten Platzhaltern (app/js/a/*.js, erzeugt von
// tools/zwilling.mjs): gleiche Namen, gleiche Themen – der Aufruf wird an den echten Erzeuger weitergereicht, sobald
// ladeAufgaben() die schweren Dateien im Hintergrund geholt hat. Vorher wirft ein Aufruf NichtGeladen; der Router fängt das ab.
import { ri, pick } from './math.js';

const kern = {};
let fertig = false, lauf = null;
export class NichtGeladen extends Error { constructor(name) { super(`Aufgaben noch nicht geladen: ${name}`); this.name = 'NichtGeladen'; } }
/** Sind die Aufgaben-Erzeuger schon da? */
export const aufgabenDa = () => fertig;
const DATEIEN = [
  ['gen', () => import('./gen.js')], ['gen2', () => import('./gen2.js')], ['gen3', () => import('./gen3.js')], ['gen4', () => import('./gen4.js')],
  ['gen5', () => import('./gen5.js')], ['gen6', () => import('./gen6.js')], ['gen7', () => import('./gen7.js')], ['gen8', () => import('./gen8.js')],
  ['gen9', () => import('./gen9.js')], ['gen10', () => import('./gen10.js')], ['gen11', () => import('./gen11.js')],
  ['gen12', () => import('./gen12.js')],
  ['gen13', () => import('./gen13.js')],
  ['gen14', () => import('./gen14.js')],
];
/** Holt alle Aufgaben-Erzeuger (einmal; weitere Aufrufe bekommen dasselbe Versprechen). Schlägt das Laden fehl, darf neu versucht werden. */
export function ladeAufgaben() {
  return (lauf ||= Promise.all(DATEIEN.map(([n, hol]) => hol().then((m) => { kern[n] = m; }))).then(() => { fertig = true; }).catch((e) => { lauf = null; throw e; }));
}
/** Platzhalter für einen Erzeuger oder Helfer aus einer schweren Datei. */
export function S(datei, schluessel, name, topic) {
  const f = (...a) => { const m = kern[datei]; if (!m) throw new NichtGeladen(schluessel); return m[schluessel](...a); };
  if (name !== undefined) Object.defineProperty(f, 'name', { value: name });
  if (topic) f.topic = topic;
  return f;
}

/** Gemischte Runde: je Stufe eine Liste von Erzeugern, daraus wird zufällig gezogen. */
export function mixOf(lists) {
  return (lv = 3) => { const fn = pick(lists[Math.min(lists.length, Math.max(1, lv)) - 1]); const q = fn(lv); q.gen = fn.name; q.topic = fn.topic; return q; };
}

/**
 * Leiter aus einem einfachen und einem steilen Erzeuger.
 * Stufe 1 und 2: nur der einfache · Stufe 3: jede dritte Aufgabe steil · Stufe 4: zwei von drei · Stufe 5: immer steil.
 * Name und Thema bleiben die des einfachen Erzeugers (für Statistik, Länder-Filter, Schwächen-Blatt und Fehler-Kartei); q.von nennt, wer die Aufgabe wirklich gebaut hat.
 */
export function leiter(basis, steil) {
  const fn = (lv = 3) => { const s = lv >= 5 || (lv === 4 && ri(1, 3) <= 2) || (lv === 3 && ri(1, 3) === 1); const g = s ? steil : basis, qq = g(lv); qq.gen = basis.name; qq.topic = basis.topic; qq.von = g.name; return qq; };
  Object.defineProperty(fn, 'name', { value: basis.name }); fn.topic = basis.topic; fn.basis = basis; fn.steil = steil;
  return fn;
}

/** haerter() für die Platzhalter: hängt an die genannten Erzeuger die steilen Aufgaben aus gen10.js (Tabelle: Name → Thema). */
export function haerterMit(tabelle) {
  const merk = new Map(), steil = {}, echt = {};
  const steilFuer = (t) => (steil[t] ||= Object.defineProperty((lv) => { const m = kern.gen10; if (!m) throw new NichtGeladen(`schwer_${t}`); return (echt[t] ||= m.schwer(t))(lv); }, 'name', { value: `schwer_${t}` }));
  return (g) => { const t = tabelle[g.name]; if (!t) return g; if (!merk.has(g)) merk.set(g, leiter(g, steilFuer(t))); return merk.get(g); };
}
