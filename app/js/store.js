// Lernfortschritt – liegt nur auf dem Gerät (localStorage), kein Konto.
const KEY = 'mt.v1';
const XP_STEP = 10;

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
const FRESH = () => ({ done: {}, xp: 0, streak: { n: 0, last: '' }, level: 3, stats: {}, kartei: {}, land: '', abi: '', exams: [], runs: [], tag: {},
  badges: {}, count: {}, skin: 'orange', week: { key: '', days: [], claimed: false }, klasse: null });
let mem = Object.assign(FRESH(), load());

export const LAENDER = { '': 'Nicht gewählt', BY: 'Bayern', 'HE-GK': 'Hessen – Grundkurs', 'HE-LK': 'Hessen – Leistungskurs' };
/** Abstände der Fehler-Kartei in Tagen: nach jeder richtigen Wiederholung eine Stufe weiter. */
export const KARTEI_TAGE = [1, 3, 7, 16];
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

export const LEVELS = ['Sehr leicht', 'Leicht', 'Mittel', 'Schwer', 'Sehr schwer'];

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch { /* privater Modus: läuft ohne Speichern weiter */ }
}

/** Montag der Woche als Schlüssel (für das Wochen-Ziel). */
export function weekKey(d = new Date()) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
}
export const WOCHEN_ZIEL = 5, WOCHEN_BONUS = 50;

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

/** Markiert den heutigen Tag als aktiv: Serie und Wochen-Ziel. */
function touchDay(today = new Date()) {
  mem.streak = nextStreak(mem.streak, today);
  const wk = weekKey(today), dk = dayKey(today);
  if (mem.week.key !== wk) mem.week = { key: wk, days: [], claimed: false };
  if (!mem.week.days.includes(dk)) mem.week.days.push(dk);
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
    mem.last = unitId;   // für „Zuletzt gespielt“ auf der Startseite
    touchDay();
    save();
    return { gain, first, streak: mem.streak.n };
  },
  unitProgress(unit) {
    const n = unit.steps.filter((s) => this.isDone(unit.id, s.id)).length;
    return { n, total: unit.steps.length, done: n === unit.steps.length };
  },
  reset() { mem = FRESH(); save(); },

  /* Statistik je Thema (für Bericht und Schwächen-Erkennung) */
  record(topic, firstTry) {
    if (!topic) return;
    const s = (mem.stats[topic] ||= { ok: 0, bad: 0 });
    if (firstTry) s.ok++; else s.bad++;
    s.last = dayKey(); save();
  },
  get stats() { return mem.stats; },
  /** Themen mit den meisten Fehlern zuerst (mindestens 3 Versuche). */
  weak(n = 5) {
    return Object.entries(mem.stats).map(([topic, s]) => ({ topic, ...s, rate: s.bad / (s.ok + s.bad) }))
      .filter((s) => s.ok + s.bad >= 3 && s.bad > 0).sort((a, b) => b.rate - a.rate || b.bad - a.bad).slice(0, n);
  },

  /* Fehler-Kartei: falsch gelöste Aufgabenarten kommen in wachsenden Abständen wieder */
  kartePut(gen, topic, today = new Date()) {
    if (!gen) return;
    mem.kartei[gen] = { topic, step: 0, due: dayKey(addDays(today, KARTEI_TAGE[0])) }; save();
  },
  karteResult(gen, ok, today = new Date()) {
    const k = mem.kartei[gen]; if (!k) return;
    if (!ok) { k.step = 0; k.due = dayKey(addDays(today, KARTEI_TAGE[0])); }
    else if (k.step + 1 >= KARTEI_TAGE.length) { delete mem.kartei[gen]; mem.count.karteiFertig = (mem.count.karteiFertig || 0) + 1; }
    else { k.step++; k.due = dayKey(addDays(today, KARTEI_TAGE[k.step])); }
    save();
  },
  karteDue(today = new Date()) { const t = dayKey(today); return Object.entries(mem.kartei).filter(([, k]) => k.due <= t).map(([gen, k]) => ({ gen, ...k })); },
  get karteCount() { return Object.keys(mem.kartei).length; },

  /* Einstellungen */
  get land() { return mem.land in LAENDER ? mem.land : ''; },
  set land(v) { mem.land = v in LAENDER ? v : ''; save(); },
  get abi() { return /^\d{4}-\d{2}-\d{2}$/.test(mem.abi) ? mem.abi : ''; },
  set abi(v) { mem.abi = /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : ''; save(); },
  /** Tage bis zum Abi-Termin (null, wenn keiner gesetzt oder vorbei). */
  abiDays(today = new Date()) {
    if (!this.abi) return null;
    const [y, m, d] = this.abi.split('-').map(Number);
    const n = Math.round((new Date(y, m - 1, d) - new Date(today.getFullYear(), today.getMonth(), today.getDate())) / 86400000);
    return n >= 0 ? n : null;
  },

  /* Ergebnisse: Abi-Modus und Runden (nur die letzten 20) */
  addExam(r) { mem.exams.unshift({ date: dayKey(), ...r }); mem.exams = mem.exams.slice(0, 20); touchDay(); mem.xp += r.xp || 0; save(); },
  get exams() { return mem.exams; },
  addRun(r) { mem.runs.unshift({ date: dayKey(), ...r }); mem.runs = mem.runs.slice(0, 20); touchDay(); mem.xp += r.xp || 0; save(); },
  get runs() { return mem.runs; },
  /** Bestwerte der eigenen Runden. */
  best(n = 5) { return [...mem.runs].sort((a, b) => b.score - a.score).slice(0, n); },
  tagBest(day = dayKey()) { return mem.tag[day]; },
  setTag(score, day = dayKey()) { if (!(mem.tag[day] >= score)) mem.tag = { [day]: score }; save(); },
  get lastDay() { return mem.streak.last; },

  /* Zähler (für Abzeichen), Bonus-Punkte, Abzeichen */
  bump(key, by = 1) { mem.count[key] = (mem.count[key] || 0) + by; save(); return mem.count[key]; },
  max(key, v) { if (!(mem.count[key] >= v)) { mem.count[key] = v; save(); } return mem.count[key]; },
  n(key) { return mem.count[key] || 0; },
  bonus(xp) { mem.xp += Math.max(0, Math.round(xp)); save(); },
  get badges() { return mem.badges; },
  award(id) { if (mem.badges[id]) return false; mem.badges[id] = dayKey(); save(); return true; },
  get streakN() { return mem.streak.n; },
  get tasksRight() { return Object.values(mem.stats).reduce((s, x) => s + x.ok, 0); },
  get stars3() { return Object.values(mem.done).filter((s) => s === 3).length; },

  /* Design (freischaltbare Akzentfarbe) */
  get skin() { return mem.skin || 'orange'; },
  set skin(v) { mem.skin = v; save(); },

  /* Wochen-Ziel: an 5 Tagen der Woche üben, dann Truhe öffnen */
  week(today = new Date()) {
    const cur = mem.week.key === weekKey(today) ? mem.week : { key: weekKey(today), days: [], claimed: false };
    return { days: cur.days.length, goal: WOCHEN_ZIEL, done: cur.days.length >= WOCHEN_ZIEL, claimed: cur.claimed };
  },
  claimWeek(today = new Date()) {
    const w = this.week(today); if (!w.done || w.claimed) return 0;
    mem.week.claimed = true; mem.xp += WOCHEN_BONUS; mem.count.truhen = (mem.count.truhen || 0) + 1; save(); return WOCHEN_BONUS;
  },
  touch(today = new Date()) { touchDay(today); save(); },

  /* Klasse (nur mit Server): Code und Spitzname bleiben im Gerät */
  /** Freie Eingabe: 'auto' (ab Stufe 4), 'an', 'aus'. */
  get tippenWahl() { return ['an', 'aus'].includes(mem.tippen) ? mem.tippen : 'auto'; },
  set tippenWahl(v) { mem.tippen = v; save(); },
  get tippen() { return this.tippenWahl === 'an' || (this.tippenWahl === 'auto' && this.level >= 4); },
  /** Rückmeldungen, die noch nicht gesendet werden konnten (höchstens 20). */
  get meldungen() { return Array.isArray(mem.meldungen) ? mem.meldungen : []; },
  meldungNeu(r) { mem.meldungen = [...this.meldungen, r].slice(-20); save(); },
  meldungWeg(zeit) { mem.meldungen = this.meldungen.filter((r) => r.zeit !== zeit); save(); },
  /** Ergebnis des Einstufungstests: { tag, res: { gebiet: [grund, kern] }, stufe } oder null. */
  get einstufung() { return mem.einstufung && typeof mem.einstufung === 'object' ? mem.einstufung : null; },
  set einstufung(v) { mem.einstufung = v; save(); },
  /** Zuletzt gespielte Einheit (id) oder ''. */
  get last() { return typeof mem.last === 'string' ? mem.last : ''; },
  get klasse() { return mem.klasse; },
  set klasse(v) { mem.klasse = v; save(); },
};
