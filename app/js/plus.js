// Einstufungstest, Abi-Aufgaben am Stück, Lernplan bis zum Abi, Zertifikat.
import { UNITS, AREAS, unitExtra } from './units.js';
import { store, LEVELS, dayKey } from './store.js';
import { CONFIG } from './config.js';
import { $, h, esc, tex, ICON, starsHtml, sfx, confetti } from './ui.js';
import { quiz } from './quiz.js';
import { VERBUND } from './verbund.js';
import { genPolynom, genExtremstellen, genBaum, genErwartung, genVektorAB, genSkalar } from './gen.js';
import { genLinGl, genKlammer, genProzent, genLaplace, genPythagoras, genVektorRechnen } from './gen3.js';

const LERN = () => AREAS.filter((a) => a.id !== 'pruefung');
const again = () => window.dispatchEvent(new HashChangeEvent('hashchange'));

/** Gemeinsamer Rahmen für Runden: Kopf mit Schließen und Fortschritt, darunter die Bühne. */
function frame(back, run, onDone) {
  const el = h(`<div class="view">
    <div class="stephead"><a class="x" href="${back}" aria-label="Schließen">${ICON.close}</a><div class="prog"><i></i></div></div>
    <div id="stage"></div></div>`);
  const bar = $('.prog i', el);
  let stop = null;
  const ctx = { progress: (f) => { bar.style.width = `${Math.round(Math.max(0, Math.min(1, f)) * 100)}%`; }, done: onDone };
  queueMicrotask(() => { stop = run($('#stage', el), ctx) || null; });
  return { el, cleanup: () => stop?.() };
}
function sheet(html) {
  const s = $('#sheet'); s.innerHTML = `<div class="sheet-in" role="dialog" aria-modal="true">${html}</div>`; s.hidden = false; sfx('win');
  return s;
}

/* ───────────── Einstufungstest ───────────── */
export const EINSTUFUNG = {
  analysis: { grund: [genLinGl, genKlammer], kern: [genPolynom, genExtremstellen] },
  stochastik: { grund: [genProzent, genLaplace], kern: [genBaum, genErwartung] },
  geometrie: { grund: [genPythagoras, genVektorRechnen], kern: [genVektorAB, genSkalar] },
};
/** Auswertung: res = { gebiet: [grundRichtig, kernRichtig] } (je 0–2). */
export function einstufung(res) {
  const total = Object.values(res).reduce((s, [g, k]) => s + g + k, 0);
  const rat = Object.fromEntries(Object.entries(res).map(([a, [g, k]]) => [a, g < 2 ? 'grund' : k < 2 ? 'kern' : 'sicher']));
  const stufe = total >= 11 ? 4 : total >= 7 ? 3 : total >= 4 ? 2 : 1;
  const schwach = Object.entries(res).sort((x, y) => (x[1][0] + x[1][1]) - (y[1][0] + y[1][1]))[0][0];
  return { total, rat, stufe, schwach };
}
export function einstufungView() {
  const res = Object.fromEntries(Object.keys(EINSTUFUNG).map((a) => [a, [0, 0]]));
  const seq = [];
  for (const [a, set] of Object.entries(EINSTUFUNG)) for (const [teil, fns] of Object.entries(set)) for (const fn of fns) {
    seq.push(() => { const q = fn(teil === 'grund' ? 2 : 3); q.gen = fn.name; q.topic = fn.topic; q.ein = [a, teil === 'grund' ? 0 : 1]; return q; });
  }
  return frame('#/lernen', quiz(seq, { noInput: true, onRight: (q) => { res[q.ein[0]][q.ein[1]]++; } }), () => {
    const e = einstufung(res);
    store.einstufung = { tag: dayKey(), res, stufe: e.stufe };
    store.bonus(20); store.touch();
    location.hash = '#/einstufung/ergebnis';
  });
}
export function einstufungErgebnis() {
  const d = store.einstufung;
  if (!d) return { el: h(`<div class="view stack"><a class="back" href="#/lernen">${ICON.left} Lernen</a><div><span class="eyebrow">Einstufung</span><h1 style="margin-top:8px">Wo stehst du?</h1><p class="lead" style="margin-top:8px">Zwölf Aufgaben, etwa fünf Minuten. Danach weißt du, wo du am besten anfängst.</p></div><a class="btn block" id="es-go" href="#/einstufung">Einstufungstest starten ${ICON.right}</a></div>`) };
  const e = einstufung(d.res);
  const TXT = { grund: 'Fang mit den Grundlagen an – dann geht der Rest leichter.', kern: 'Grundlagen sitzen. Jetzt den Oberstufen-Stoff Schritt für Schritt.', sicher: 'Sicher! Hier darfst du schwerer üben.' };
  const ziel = (a) => { if (e.rat[a] === 'grund') return [`#/u/${a[0]}-grund`, 'Zu den Grundlagen']; const u = UNITS.find((x) => x.area === a && !x.grund && !unitExtra(x) && !store.unitProgress(x).done); return u ? [`#/u/${u.id}`, `Weiter mit „${u.title}“`] : [`#/ueben/${a}`, 'Gemischt üben']; };
  const el = h(`<div class="view stack">
    <a class="back" href="#/lernen">${ICON.left} Lernen</a>
    <div><span class="eyebrow">Einstufung vom ${esc(d.tag.split('-').reverse().join('.'))}</span><h1 style="margin-top:8px">${e.total} von 12 auf Anhieb</h1><p class="lead" style="margin-top:8px">So würden wir an deiner Stelle anfangen.</p></div>
    ${LERN().map((a) => { const [g, k] = d.res[a.id], [href, label] = ziel(a.id); return `<section class="card stack es-area" data-a="${a.id}"><div class="row"><h3 class="grow">${esc(a.title)}</h3><b class="orange">${g + k}/4</b></div>
      <div class="bar big"><i style="width:${((g + k) / 4) * 100}%"></i></div><small class="muted">Grundlagen ${g}/2 · Oberstufe ${k}/2</small><p>${TXT[e.rat[a.id]]}</p><a class="btn ghost" href="${href}">${esc(label)} ${ICON.right}</a></section>`; }).join('')}
    <section class="card stack"><h3>Passende Schwierigkeit: ${LEVELS[e.stufe - 1]}</h3><small class="muted">Aktuell eingestellt: ${LEVELS[store.level - 1]}. Du kannst sie jederzeit ändern.</small>
      ${store.level === e.stufe ? '' : '<button class="btn" id="es-lv" type="button">Schwierigkeit übernehmen</button>'}</section>
    ${e.total <= 8 ? `<section class="cta"><h2>${esc(AREAS.find((a) => a.id === e.schwach).title)} hakt noch?</h2><p>Genau dafür gibt es die kostenlose Probestunde: Wir schauen gemeinsam, woran es liegt.</p><a class="btn" href="${CONFIG.probestunde}" target="_blank" rel="noopener">Gratis Probestunde ${ICON.right}</a></section>` : ''}
    <a class="btn ghost block" href="#/einstufung">Test wiederholen</a></div>`);
  $('#es-lv', el)?.addEventListener('click', (ev) => { store.level = e.stufe; sfx('ok'); ev.target.replaceWith(h('<div class="note ok">Übernommen.</div>')); });
  return { el };
}

/* ───────────── Abi-Aufgaben am Stück ───────────── */
export function verbundView(areaId) {
  const make = VERBUND[areaId], area = AREAS.find((a) => a.id === areaId);
  if (!make) return { el: h(`<div class="view stack"><a class="back" href="#/pruefung">${ICON.left} Prüfung</a><div><span class="eyebrow">Wie in der Prüfung</span><h1 style="margin-top:8px">Abi-Aufgabe am Stück</h1><p class="lead" style="margin-top:8px">Ein Sachverhalt, mehrere Teilaufgaben – a), b), c) … Jede Runde ist neu.</p></div>
    <section class="stack">${LERN().map((a) => `<a class="card unit" href="#/aufgabe/${a.id}"><span class="num">a–${'abcdef'[VERBUND[a.id](1).parts.length - 1]}</span><span><h3>${esc(a.title)}</h3><small>${esc(VERBUND[a.id].topic)}</small></span><span class="go">${ICON.right}</span></a>`).join('')}</section></div>`) };
  const A = make(store.level);
  let be = 0, right = 0;
  const total = A.be.reduce((s, x) => s + x, 0);
  const kopf = `<b>${esc(A.title)}.</b> ${A.intro} ${tex(A.formula, true)}`;
  return frame('#/aufgabe', quiz(A.parts.map((q, i) => () => ({ ...q, gen: make.name, topic: make.topic, be: A.be[i] })), { kopf, noInput: true, onRight: (q) => { right++; be += q.be; } }), (r) => {
    const gain = 10 + 3 * be;
    store.bonus(gain); store.touch(); store.bump('verbund'); if (be === total) store.bump('verbundVoll');
    const s = sheet(`${starsHtml(r.stars ?? 1)}<small class="muted">${esc(area.title)} · Schwierigkeit: ${LEVELS[store.level - 1]}</small>
      <h2 id="vb-be">${be} von ${total} BE</h2><p class="muted">${right} von ${A.parts.length} Teilaufgaben auf Anhieb. Gewertet wird wie in der Prüfung nur der erste Versuch.</p>
      <div class="gain"><span class="chip xp">${ICON.bolt}+${gain} Punkte</span></div>
      ${be < total / 2 ? `<div class="promo">Solche Aufgaben am Stück sind Übungssache. In einer <a href="${CONFIG.probestunde}" target="_blank" rel="noopener">kostenlosen Probestunde</a> rechnen wir eine gemeinsam durch.</div>` : ''}
      <button class="btn block" id="sh-go" type="button">Neue Aufgabe</button><a class="btn ghost block" href="#/aufgabe">Zur Übersicht</a>`);
    if (be === total) confetti(40);
    $('#sh-go', s).onclick = () => { s.hidden = true; again(); };
  });
}

/* ───────────── Lernplan bis zum Abi ───────────── */
/** Verteilt die offenen Einheiten auf die Wochen bis zum Termin. Liefert [{ start: Date, units: [...] }]. */
export function planWeeks(open, days, today = new Date()) {
  const weeks = Math.max(1, Math.ceil(Math.max(1, days) / 7));
  const used = Math.min(weeks, Math.max(1, open.length)), out = [];
  for (let w = 0; w < used; w++) {
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7 * w);
    out.push({ start, units: open.slice(Math.floor((w * open.length) / used), Math.floor(((w + 1) * open.length) / used)) });
  }
  return out;
}
/** Offene Einheiten in sinnvoller Reihenfolge: Grundlagen zuerst, Zusatz-Stoff des Kurses zuletzt. */
export const openUnits = () => [...UNITS].filter((u) => !store.unitProgress(u).done)
  .sort((x, y) => (y.grund ? 1 : 0) - (x.grund ? 1 : 0) || (unitExtra(x) ? 1 : 0) - (unitExtra(y) ? 1 : 0));
export function planNow() { const d = store.abiDays(); return d === null ? null : planWeeks(openUnits(), d)[0]; }
export function planView() {
  const days = store.abiDays(), open = openUnits();
  const fmtD = (d) => `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.`;
  const head = `<a class="back" href="#/mehr">${ICON.left} Mehr</a><div><span class="eyebrow">Lernplan</span><h1 style="margin-top:8px">${days === null ? 'Dein Plan bis zum Abi' : `Noch ${days} ${days === 1 ? 'Tag' : 'Tage'}`}</h1></div>`;
  if (days === null) return { el: h(`<div class="view stack">${head}<section class="card stack"><p>Trag deinen Abi-Termin ein. Dann verteilt die App alle offenen Einheiten gleichmäßig auf die Wochen bis dahin.</p><a class="btn" href="#/einstellungen">Abi-Termin eintragen ${ICON.right}</a></section></div>`) };
  if (!open.length) return { el: h(`<div class="view stack">${head}<section class="card stack"><h3>Alle Einheiten geschafft.</h3><p>Jetzt zählt Wiederholen: Abi-Modus, Abi-Aufgaben am Stück und die Fehler-Kartei.</p><a class="btn" href="#/pruefung">Zur Prüfung ${ICON.right}</a></section></div>`) };
  const weeks = planWeeks(open, days);
  const el = h(`<div class="view stack">${head}
    <p class="lead">${open.length} offene ${open.length === 1 ? 'Einheit' : 'Einheiten'} in ${weeks.length} ${weeks.length === 1 ? 'Woche' : 'Wochen'}${weeks.length < Math.ceil(days / 7) ? ' – danach bleibt Zeit zum Wiederholen' : ''}.</p>
    ${weeks.map((w, i) => `<section class="card stack plan-w ${i === 0 ? 'now' : ''}"><div class="row"><h3 class="grow">${i === 0 ? 'Diese Woche' : `Woche ${i + 1}`}</h3><small class="muted">ab ${fmtD(w.start)}</small></div>
      ${w.units.length ? w.units.map((u) => `<a class="plan-u" href="#/u/${u.id}"><span>${esc(u.title)}</span><small class="muted">${esc(AREAS.find((a) => a.id === u.area).title)}${unitExtra(u) ? ' · Zusatz' : ''}</small></a>`).join('') : '<small class="muted">Puffer zum Wiederholen.</small>'}</section>`).join('')}
    <small class="muted">Der Plan rechnet sich jeden Tag neu aus dem, was noch offen ist.</small></div>`);
  return { el };
}

/* ───────────── Zertifikat ───────────── */
/** Ist ein Gebiet geschafft? (Zusatz-Stoff des gewählten Kurses zählt nicht mit.) */
export const areaDone = (areaId) => { const us = UNITS.filter((u) => u.area === areaId && !unitExtra(u)); return us.length > 0 && us.every((u) => store.unitProgress(u).done); };
export function zertifikatView(areaId) {
  const area = LERN().find((a) => a.id === areaId);
  if (!area) return { el: h(`<div class="view stack"><a class="back" href="#/erfolge">${ICON.left} Erfolge</a><div><span class="eyebrow">Zertifikate</span><h1 style="margin-top:8px">Zum Ausdrucken</h1><p class="lead" style="margin-top:8px">Für jedes geschaffte Gebiet gibt es ein Zertifikat.</p></div>
    <section class="stack">${LERN().map((a) => { const us = UNITS.filter((u) => u.area === a.id && !unitExtra(u)), n = us.filter((u) => store.unitProgress(u).done).length; return areaDone(a.id)
      ? `<a class="card unit done" href="#/zertifikat/${a.id}"><span class="num">${ICON.check}</span><span><h3>${esc(a.title)}</h3><small>Zertifikat ansehen und drucken</small></span><span class="go">${ICON.right}</span></a>`
      : `<div class="card unit soon"><span class="num">${n}/${us.length}</span><span><h3>${esc(a.title)}</h3><small>Noch ${us.length - n} ${us.length - n === 1 ? 'Einheit' : 'Einheiten'} bis zum Zertifikat.</small></span><span></span></div>`; }).join('')}</section></div>`) };
  if (!areaDone(areaId)) { location.hash = '#/zertifikat'; return { el: h('<div class="view"></div>') }; }
  const us = UNITS.filter((u) => u.area === areaId && !unitExtra(u)), steps = us.reduce((s, u) => s + u.steps.length, 0);
  const stars = us.reduce((s, u) => s + u.steps.reduce((t, st) => t + (store.stars(u.id, st.id) ?? 0), 0), 0);
  const el = h(`<div class="view stack">
    <a class="back noprint" href="#/zertifikat">${ICON.left} Zertifikate</a>
    <section class="card stack noprint"><label for="zt-name"><b>Name auf dem Zertifikat</b></label><input class="field" id="zt-name" maxlength="40" autocomplete="off" placeholder="Dein Name">
      <small class="muted">Der Name wird nur für den Ausdruck verwendet und nicht gespeichert.</small><button class="btn" id="zt-print" type="button">Drucken oder als PDF speichern</button></section>
    <section class="zert" id="zert">
      <div class="zert-logo" aria-hidden="true"></div>
      <small class="zert-k">Mathe-Trainer · ${esc(CONFIG.firma)}</small>
      <h1>Zertifikat</h1>
      <p class="zert-name" id="zt-out">&nbsp;</p>
      <p>hat das Gebiet</p><h2>${esc(area.title)}</h2>
      <p>vollständig durchgearbeitet: ${us.length} Einheiten mit ${steps} Schritten, ${stars} von ${steps * 3} Sternen.</p>
      <ul>${us.map((u) => `<li>${esc(u.title)}</li>`).join('')}</ul>
      <div class="zert-foot"><span>${new Date().toLocaleDateString('de-DE')}</span><span>${esc(CONFIG.website.replace(/^https?:\/\/(www\.)?|\/$/g, ''))}</span></div>
    </section></div>`);
  $('#zt-name', el).addEventListener('input', (ev) => { $('#zt-out', el).textContent = ev.target.value.trim() || ' '; });
  $('#zt-print', el).onclick = () => window.print();
  return { el };
}
