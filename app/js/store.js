// Lernfortschritt – liegt nur auf dem Gerät (localStorage), kein Konto.
const KEY = 'mt.v1';
const XP_STEP = 10;

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
let mem = Object.assign({ done: {}, xp: 0, streak: { n: 0, last: '' }, level: 3 }, load());

export const LEVELS = ['Sehr leicht', 'Leicht', 'Mittel', 'Schwer', 'Sehr schwer'];

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch { /* privater Modus: läuft ohne Speichern weiter */ }
}

export function dayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Serie „ohne Druck": Wochenenden dürfen ausfallen, ohne dass die Serie reißt. */
export function nextStreak(streak, today = new Date()) {
  const t = dayKey(today);
  if (streak.last === t) return streak;
  if (!streak.last) return { n: 1, last: t };
  const [y, m, d] = streak.last.split('-').map(Number);
  const cur = new Date(y, m - 1, d);
  let ok = true;
  for (;;) {
    cur.setDate(cur.getDate() + 1);
    if (dayKey(cur) === t) break;
    if (cur > today) { ok = false; break; }
    const wd = cur.getDay();
    if (wd !== 0 && wd !== 6) { ok = false; break; }
  }
  return { n: ok ? streak.n + 1 : 1, last: t };
}

export const store = {
  get xp() { return mem.xp; },
  /** Schwierigkeit 1 (sehr leicht) bis 5 (sehr schwer). */
  get level() { return Math.min(5, Math.max(1, mem.level | 0 || 3)); },
  set level(v) { mem.level = Math.min(5, Math.max(1, v | 0)); save(); },
  get streak() {
    // Anzeige: Serie gilt noch, wenn heute oder am letzten Werktag gespielt wurde.
    const probe = nextStreak(mem.streak);
    return probe.n > mem.streak.n || probe.last === mem.streak.last ? mem.streak.n : 0;
  },
  stars(unitId, stepId) { return mem.done[`${unitId}/${stepId}`]; },
  isDone(unitId, stepId) { return mem.done[`${unitId}/${stepId}`] !== undefined; },
  complete(unitId, stepId, stars) {
    const k = `${unitId}/${stepId}`;
    const first = mem.done[k] === undefined;
    mem.done[k] = Math.max(mem.done[k] ?? 0, stars);
    const gain = first ? XP_STEP + stars * 2 : 2;
    mem.xp += gain;
    mem.streak = nextStreak(mem.streak);
    save();
    return { gain, first, streak: mem.streak.n };
  },
  unitProgress(unit) {
    const n = unit.steps.filter((s) => this.isDone(unit.id, s.id)).length;
    return { n, total: unit.steps.length, done: n === unit.steps.length };
  },
  reset() { mem = { done: {}, xp: 0, streak: { n: 0, last: '' }, level: 3 }; save(); },
};
