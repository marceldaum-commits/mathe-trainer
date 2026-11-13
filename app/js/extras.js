// Einstellungen, Eltern-Bericht und Fehler-Kartei.
import * as G from './gen.js';
import * as H from './gen2.js';
import { quiz } from './quiz.js';
import { store, LEVELS, LAENDER, KARTEI_TAGE } from './store.js';
import { UNITS, AREAS } from './units.js';
import { $, h, esc, ICON, sfx, toast, confetti } from './ui.js';
import { CONFIG } from './config.js';

const GEN = { ...G, ...H };

const LEVEL_NOTES = ['Kleine Zahlen, großzügige Bewertung, alle Tipps.', 'Einfache Zahlen, alle Tipps.', 'Wie im Unterricht.', 'Größere Zahlen, mehr Regeln gemischt, weniger Hinweise.', 'Prüfungsniveau und darüber – ohne Tipps.'];
/** Schwierigkeits-Wahl (1–5) als Karte. */
export function levelCard() {
  const el = h(`<section class="card level" aria-label="Schwierigkeit">
    <div class="row"><h3 class="grow">Schwierigkeit</h3><b id="lv-name" class="orange"></b></div>
    <div class="seg" id="lv" role="radiogroup" aria-label="Schwierigkeit wählen"></div>
    <small class="muted" id="lv-note"></small></section>`);
  const seg = $('#lv', el);
  const paint = () => {
    seg.querySelectorAll('button').forEach((b, i) => { const on = i + 1 === store.level; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); });
    $('#lv-name', el).textContent = LEVELS[store.level - 1]; $('#lv-note', el).textContent = LEVEL_NOTES[store.level - 1];
  };
  LEVELS.forEach((name, i) => { const b = h(`<button type="button" role="radio" aria-label="${name}">${i + 1}</button>`); b.onclick = () => { store.level = i + 1; paint(); sfx('tap'); }; seg.append(b); });
  paint();
  return el;
}

/* ───────────── Einstellungen ───────────── */

export function settingsView() {
  const el = h(`<div class="view stack">
    <a class="back" href="#/mehr">${ICON.left} Mehr</a>
    <div><span class="eyebrow">Einstellungen</span><h1 style="margin-top:8px">Für dein Abi</h1></div>
    <div id="st-level"></div>
    <section class="card stack"><h3>Bundesland und Kurs</h3><div class="picks col" id="st-land" role="radiogroup" aria-label="Bundesland und Kurs"></div>
      <small class="muted">Die Auswahl steuert Umfang und Niveau im Abi-Modus. Alle Lernpfade bleiben für alle offen.</small></section>
    <section class="card stack"><h3>Abi-Termin Mathe</h3>
      <input class="field" id="st-abi" type="date" aria-label="Datum der Mathe-Prüfung" value="${esc(store.abi)}">
      <small class="muted" id="st-abi-note"></small></section>
    <section class="card stack"><h3>Fortschritt</h3><small class="muted">Alles liegt nur auf diesem Gerät. Es gibt kein Konto.</small>
      <button class="btn ghost" id="st-reset" type="button">Fortschritt zurücksetzen</button></section>
  </div>`);
  $('#st-level', el).append(levelCard());
  const box = $('#st-land', el);
  const paint = () => box.querySelectorAll('button').forEach((b) => { const on = b.dataset.k === store.land; b.classList.toggle('sel', on); b.setAttribute('aria-checked', on); });
  Object.entries(LAENDER).forEach(([k, name]) => {
    const b = h(`<button class="pick" type="button" role="radio" data-k="${k}">${esc(name)}</button>`);
    b.onclick = () => { store.land = k; paint(); sfx('tap'); };
    box.append(b);
  });
  paint();
  const note = () => { const d = store.abiDays(); $('#st-abi-note', el).textContent = store.abi ? (d === null ? 'Der Termin liegt in der Vergangenheit.' : `Noch ${d} ${d === 1 ? 'Tag' : 'Tage'}. Der Countdown steht auf der Startseite.`) : 'Mit Termin zeigt die Startseite einen Countdown und ein Tagesziel.'; };
  $('#st-abi', el).addEventListener('change', (ev) => { store.abi = ev.target.value; note(); });
  note();
  $('#st-reset', el).onclick = () => { if (window.confirm('Wirklich allen Fortschritt auf diesem Gerät löschen?')) { store.reset(); toast('Fortschritt gelöscht.'); location.hash = '#/'; } };
  return { el };
}

/** Tagesziel bis zum Abi: offene Schritte gleichmäßig auf die Tage verteilt (mindestens 1, höchstens 6). */
export function dailyGoal(openSteps, days) {
  if (days === null || openSteps <= 0) return 0;
  return Math.min(6, Math.max(1, Math.ceil(openSteps / Math.max(1, days))));
}
export const openSteps = () => UNITS.reduce((s, u) => s + u.steps.filter((st) => !store.isDone(u.id, st.id)).length, 0);

/* ───────────── Eltern-Bericht ───────────── */

export function berichtView() {
  const stats = Object.entries(store.stats).map(([topic, s]) => ({ topic, ...s, n: s.ok + s.bad, rate: s.ok / (s.ok + s.bad) }));
  const strong = stats.filter((s) => s.n >= 3 && s.rate >= 0.8).sort((a, b) => b.n - a.n).slice(0, 6);
  const weak = store.weak(6);
  const total = stats.reduce((s, x) => s + x.n, 0), right = stats.reduce((s, x) => s + x.ok, 0);
  const today = new Date().toLocaleDateString('de-DE');
  const areaRows = AREAS.map((a) => {
    const us = UNITS.filter((u) => u.area === a.id), steps = us.reduce((s, u) => s + u.steps.length, 0), done = us.reduce((s, u) => s + store.unitProgress(u).n, 0);
    return `<div class="rep-row"><span>${esc(a.title)}</span><div class="bar"><i style="width:${steps ? (done / steps) * 100 : 0}%"></i></div><b>${done}/${steps}</b></div>`;
  }).join('');
  const exams = store.exams.slice(0, 5);
  const el = h(`<div class="view stack report">
    <a class="back noprint" href="#/mehr">${ICON.left} Mehr</a>
    <div><span class="eyebrow">Lernstand</span><h1 style="margin-top:8px">Bericht für Eltern</h1><p class="lead" style="margin-top:8px">Stand ${today} · Mathe-Trainer von ${esc(CONFIG.firma)}</p></div>
    <section class="card stack"><h3>Überblick</h3>
      <div class="rep-grid"><div><b>${store.xp}</b><small>Punkte</small></div><div><b>${store.streak}</b><small>Tage in Folge</small></div><div><b>${total}</b><small>Aufgaben</small></div><div><b>${total ? Math.round((right / total) * 100) : 0} %</b><small>beim ersten Versuch richtig</small></div></div>
      <small class="muted">Zuletzt geübt: ${store.lastDay ? esc(store.lastDay.split('-').reverse().join('.')) : 'noch nicht'} · Schwierigkeit: ${LEVELS[store.level - 1]}${store.land ? ` · ${esc(LAENDER[store.land])}` : ''}</small></section>
    <section class="card stack"><h3>Lernpfade</h3>${areaRows}</section>
    <section class="card stack"><h3>Das sitzt</h3>${strong.length ? `<ul class="rep-list">${strong.map((s) => `<li>${esc(s.topic)} <small class="muted">${s.ok} von ${s.n} richtig</small></li>`).join('')}</ul>` : '<small class="muted">Noch zu wenige Aufgaben für eine Aussage (mindestens drei je Thema).</small>'}</section>
    <section class="card stack"><h3>Hier hakt es noch</h3>${weak.length ? `<ul class="rep-list">${weak.map((s) => `<li>${esc(s.topic)} <small class="muted">${s.bad} von ${s.ok + s.bad} nicht auf Anhieb</small></li>`).join('')}</ul>` : '<small class="muted">Bisher keine auffälligen Themen.</small>'}
      <small class="muted">In der Fehler-Kartei zum Wiederholen: ${store.karteCount} Aufgabenart${store.karteCount === 1 ? '' : 'en'}.</small></section>
    ${exams.length ? `<section class="card stack"><h3>Abi-Modus</h3>${exams.map((e) => `<div class="rep-row"><span>Teil ${esc(e.part)} · ${esc(e.date)}</span><small class="muted">${e.correct}/${e.total} richtig</small><b>${e.np} NP</b></div>`).join('')}<small class="muted">Prognose aus Auswahl-Aufgaben – eine Orientierung, kein Notenersatz.</small></section>` : ''}
    <section class="cta"><h2>Gemeinsam geht es schneller.</h2><p>${weak.length ? `Bei ${esc(weak.slice(0, 2).map((s) => s.topic).join(' und '))} unterstützen wir gezielt.` : 'Wir zeigen in einer Probestunde, wie persönliche Nachhilfe den nächsten Schritt leichter macht.'} Die erste Stunde ist kostenlos.</p>
      <a class="btn" href="${CONFIG.probestunde}" target="_blank" rel="noopener">Gratis Probestunde ${ICON.right}</a><small>${esc(CONFIG.website.replace(/^https?:\/\/|\/$/g, ''))}</small></section>
    <div class="row noprint"><button class="btn ghost grow" id="rp-print" type="button">Drucken oder als PDF sichern</button><button class="btn grow" id="rp-share" type="button">Teilen</button></div>
    <small class="muted noprint">Der Bericht entsteht nur auf diesem Gerät. Es werden keine Daten übertragen.</small>
  </div>`);
  $('#rp-print', el).onclick = () => window.print();
  $('#rp-share', el).onclick = async () => {
    const text = `Mathe-Trainer – Lernstand vom ${today}: ${total} Aufgaben, ${total ? Math.round((right / total) * 100) : 0} % beim ersten Versuch richtig.${weak.length ? ` Übungsbedarf: ${weak.map((s) => s.topic).join(', ')}.` : ''}`;
    try { if (navigator.share) await navigator.share({ title: 'Mathe-Trainer – Lernstand', text }); else { await navigator.clipboard.writeText(text); toast('Text kopiert.'); } } catch { toast('Teilen nicht möglich – nutze „Drucken".'); }
  };
  return { el };
}

/* ───────────── Fehler-Kartei ───────────── */

export function karteiView() {
  const due = store.karteDue().filter((k) => typeof GEN[k.gen] === 'function').slice(0, 8);
  const el = h('<div class="view stack"></div>');
  if (!due.length) {
    el.innerHTML = `<a class="back" href="#/">${ICON.left} Start</a>
      <div><span class="eyebrow">Fehler-Kartei</span><h1 style="margin-top:8px">Heute nichts fällig</h1>
      <p class="lead" style="margin-top:8px">${store.karteCount ? `${store.karteCount} Aufgabenart${store.karteCount === 1 ? '' : 'en'} warten auf ihren nächsten Termin.` : 'Aufgaben, die nicht auf Anhieb klappen, landen hier und kommen nach 1, 3, 7 und 16 Tagen wieder.'}</p></div>
      <a class="btn block" href="#/">Zum Lernpfad</a>`;
    return { el };
  }
  el.innerHTML = `<div class="stephead"><a class="x" href="#/" aria-label="Schließen">${ICON.close}</a><div class="prog"><i></i></div></div><div id="stage"></div>`;
  let cleanup = null, ok = 0;
  const bar = $('.prog i', el);
  queueMicrotask(() => {
    cleanup = quiz(due.map((k) => GEN[k.gen]), { onRight: (q) => { ok++; store.karteResult(q.gen, true); }, onWrong: (q) => store.karteResult(q.gen, false) })($('#stage', el), {
      progress: (f) => { bar.style.width = `${Math.round(f * 100)}%`; },
      done: () => {
        sfx('win'); if (ok === due.length) confetti(40);
        el.innerHTML = `<div><span class="eyebrow">Fehler-Kartei</span><h1 style="margin-top:8px" id="kt-done">Wiederholung geschafft</h1>
          <p class="lead" style="margin-top:8px">${ok} von ${due.length} saßen auf Anhieb. Was geklappt hat, kommt später wieder (nach ${KARTEI_TAGE.join(', ')} Tagen), der Rest schon morgen.</p></div>
          <a class="btn block" href="#/">Zum Lernpfad</a>`;
      },
    }) || null;
  });
  return { el, cleanup: () => cleanup?.() };
}
