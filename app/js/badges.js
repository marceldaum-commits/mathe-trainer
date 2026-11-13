// Abzeichen und Level-Titel. Belohnt wird Können (richtig beim ersten Versuch, Serien, Abschlüsse) – nicht bloße Spielzeit.
import { store } from './store.js';
import { UNITS, AREAS } from './units.js';

export const TITLES = [[0, 'Einsteiger'], [100, 'Rechner'], [300, 'Kurvenleser'], [700, 'Ableitungsprofi'], [1500, 'Integral-Ass'], [3000, 'Abi-Kandidat'], [6000, 'Mathe-Legende']];

/** Aktueller Titel, nächster Titel und Fortschritt dorthin (0–1). */
export function titleOf(xp = store.xp) {
  let i = 0; while (i + 1 < TITLES.length && xp >= TITLES[i + 1][0]) i++;
  const next = TITLES[i + 1] || null;
  return { level: i + 1, title: TITLES[i][1], next: next ? next[1] : null, need: next ? next[0] - xp : 0, pct: next ? (xp - TITLES[i][0]) / (next[0] - TITLES[i][0]) : 1 };
}

const unitsDone = (area) => UNITS.filter((u) => (!area || u.area === area) && store.unitProgress(u).done).length;
const areaAll = (area) => { const us = UNITS.filter((u) => u.area === area); return us.length > 0 && us.every((u) => store.unitProgress(u).done); };

export const BADGES = [
  { id: 'start', icon: '1', name: 'Erster Schritt', text: 'Den ersten Schritt im Lernpfad geschafft.', ok: () => store.xp > 0 },
  { id: 'serie3', icon: '3', name: 'Dranbleiber', text: '3 Tage in Folge geübt.', ok: () => store.streakN >= 3 },
  { id: 'serie7', icon: '7', name: 'Eine Woche stark', text: '7 Tage in Folge geübt.', ok: () => store.streakN >= 7 },
  { id: 'serie30', icon: '30', name: 'Unaufhaltsam', text: '30 Tage in Folge geübt.', ok: () => store.streakN >= 30 },
  { id: 'r10', icon: '✓', name: 'Auf Anhieb', text: '10 Aufgaben beim ersten Versuch richtig.', ok: () => store.tasksRight >= 10 },
  { id: 'r100', icon: '100', name: 'Hundert sitzen', text: '100 Aufgaben beim ersten Versuch richtig.', ok: () => store.tasksRight >= 100 },
  { id: 'r500', icon: '500', name: 'Rechenmaschine', text: '500 Aufgaben beim ersten Versuch richtig.', ok: () => store.tasksRight >= 500 },
  { id: 'kombo5', icon: '×5', name: 'Kombo 5', text: '5 Aufgaben in Folge auf Anhieb richtig.', ok: () => store.n('komboMax') >= 5 },
  { id: 'kombo10', icon: '×10', name: 'Kombo 10', text: '10 Aufgaben in Folge auf Anhieb richtig.', ok: () => store.n('komboMax') >= 10 },
  { id: 'sterne10', icon: '★', name: 'Sternensammler', text: '10 Schritte mit drei Sternen.', ok: () => store.stars3 >= 10 },
  { id: 'einheit1', icon: 'E', name: 'Erste Einheit', text: 'Eine ganze Einheit abgeschlossen.', ok: () => unitsDone() >= 1 },
  { id: 'analysis', icon: '∫', name: 'Analysis gemeistert', text: 'Alle Einheiten der Analysis abgeschlossen.', ok: () => areaAll('analysis') },
  { id: 'stochastik', icon: 'σ', name: 'Stochastik gemeistert', text: 'Alle Einheiten der Stochastik abgeschlossen.', ok: () => areaAll('stochastik') },
  { id: 'geometrie', icon: '∠', name: 'Geometrie gemeistert', text: 'Alle Einheiten der Analytischen Geometrie abgeschlossen.', ok: () => areaAll('geometrie') },
  { id: 'alles', icon: '∞', name: 'Alles geschafft', text: 'Jede Einheit in jedem Gebiet abgeschlossen.', ok: () => AREAS.every((a) => areaAll(a.id)) },
  { id: 'boss1', icon: 'B', name: 'Boss-Bezwinger', text: 'Den ersten Boss besiegt.', ok: () => store.n('boss') >= 1 },
  { id: 'boss10', icon: 'B10', name: 'Boss-Jäger', text: '10 Bosse besiegt.', ok: () => store.n('boss') >= 10 },
  { id: 'drache', icon: '▲', name: 'Drachenbezwinger', text: 'Im Abenteuer-Modus den Abi-Drachen besiegt.', ok: () => store.n('abenteuerSieg') >= 1 },
  { id: 'bossPerfekt', icon: '♥', name: 'Ohne Kratzer', text: 'Einen Boss besiegt, ohne ein Herz zu verlieren.', ok: () => store.n('bossPerfekt') >= 1 },
  { id: 'blitz10', icon: '10', name: 'Blitzmerker', text: '10 richtige Antworten in einer Blitz-Runde.', ok: () => store.n('blitzBest') >= 10 },
  { id: 'blitz20', icon: '20', name: 'Gedankenblitz', text: '20 richtige Antworten in einer Blitz-Runde.', ok: () => store.n('blitzBest') >= 20 },
  { id: 'abi5', icon: '5', name: 'Bestanden', text: '5 Notenpunkte oder mehr im Abi-Modus.', ok: () => store.exams.some((e) => e.np >= 5) },
  { id: 'abi10', icon: '10', name: 'Zweistellig', text: '10 Notenpunkte oder mehr im Abi-Modus.', ok: () => store.exams.some((e) => e.np >= 10) },
  { id: 'abi15', icon: '15', name: 'Volle Punktzahl', text: '15 Notenpunkte im Abi-Modus.', ok: () => store.exams.some((e) => e.np >= 15) },
  { id: 'tag1', icon: 'T', name: 'Tages-Runde', text: 'Eine Tages-Runde gespielt.', ok: () => store.n('tagRunden') >= 1 },
  { id: 'duell', icon: 'VS', name: 'Herausforderer', text: 'Ein Duell gewonnen.', ok: () => store.n('duellSiege') >= 1 },
  { id: 'kartei', icon: '↻', name: 'Aus Fehlern gelernt', text: 'Eine Aufgabenart aus der Fehler-Kartei endgültig abgehakt.', ok: () => store.n('karteiFertig') >= 1 },
  { id: 'truhe', icon: '5/7', name: 'Wochen-Ziel', text: 'An 5 Tagen einer Woche geübt und die Truhe geöffnet.', ok: () => store.n('truhen') >= 1 },
  { id: 'schwer', icon: 'S5', name: 'Sehr schwer', text: 'Einen Schritt auf der höchsten Schwierigkeit geschafft.', ok: () => store.n('stufe5') >= 1 },
];

/** Prüft alle Abzeichen und vergibt neue. Liefert die neu verdienten. */
export function checkBadges() {
  return BADGES.filter((b) => { try { return b.ok() && store.award(b.id); } catch { return false; } });
}

/** Freischaltbare Akzentfarben: [Kennung, Name, ab Punkten, Farbe, dunklere Farbe]. */
export const SKINS = [['orange', 'Orange', 0, '#ff7418', '#df5e0c'], ['blau', 'Ozean', 200, '#2f7df6', '#1f63cf'], ['gruen', 'Wald', 500, '#18a36b', '#0f8556'], ['pink', 'Magenta', 1000, '#e83e8c', '#c62a73'], ['violett', 'Galaxie', 2000, '#7c4dff', '#6236de'], ['gold', 'Gold', 4000, '#d99a00', '#b57f00']];
export const skinOpen = (id, xp = store.xp) => { const s = SKINS.find((x) => x[0] === id); return !!s && xp >= s[2]; };
