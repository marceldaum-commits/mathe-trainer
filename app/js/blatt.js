// Arbeitsblatt-Generator und Probeklausur: Aufgaben aus den vorhandenen Erzeugern, in der App lösbar oder
// als Blatt zum Drucken / als PDF – mit Logo, Namen-Zeile, Lösungsblatt. Ohne KI: jede Lösung ist nachgerechnet.
// Ein Blatt ist durch (Themen, Stufe, Anzahl, Blatt-Nummer) eindeutig bestimmt: gleiche Nummer = gleiches Blatt.
import { $, h, tex, esc, ICON, sfx, drucken, starsHtml } from './ui.js';
import { store, LEVELS } from './store.js';
import { seedRandom, shuffle } from './math.js';
import { UNITS, landList, unitExtra } from './units.js';
import { quiz } from './quiz.js';
import { marke } from './pro.js';
import { CONFIG } from './config.js';
import { api, premiumOn, premiumBereit, kiBereit, kiArt, kaufLinks } from './api.js';

export const ANZAHL = [5, 8, 10, 12];
export const GEBIETE = [['analysis', 'Analysis'], ['stochastik', 'Stochastik'], ['geometrie', 'Analytische Geometrie']];
/** Probeklausur: so viele Aufgaben je Gebiet, mit diesen Punkten (BE) reihum. */
export const KLAUSUR = { analysis: 5, stochastik: 3, geometrie: 4 };
export const KLAUSUR_BE = [3, 4, 5];
/** Notenpunkte aus Prozent (übliche Oberstufen-Tabelle, Orientierung). */
export const NP_GRENZEN = [[95, 15], [90, 14], [85, 13], [80, 12], [75, 11], [70, 10], [65, 9], [60, 8], [55, 7], [50, 6], [45, 5], [40, 4], [33, 3], [27, 2], [20, 1], [0, 0]];

/** Themen, aus denen ein Blatt gebaut werden kann: alle Lern-Einheiten mit Auswahl-Aufgaben. */
export const themen = (land = store.land) => UNITS.filter((u) => u.area !== 'pruefung' && u.bossGens?.length).map((u) => ({ id: u.id, area: u.area, title: u.title, extra: unitExtra(u, land) }));
export const neueNummer = () => 100000 + Math.floor(Math.random() * 900000);   // Blatt-Nummer: bewusst echter Zufall, danach ist alles festgelegt

/** Baut die Aufgaben eines Blatts. Gleiche Eingaben liefern immer dieselben Aufgaben (Startwert = Blatt-Nummer). */
export function bauBlatt({ units, lv, n, seed }, land = store.land) {
  const us = units.map((id) => UNITS.find((u) => u.id === id)).filter((u) => u?.bossGens?.length);
  if (!us.length) return [];
  seedRandom(seed);
  try {
    const fragen = [];
    // reihum durch die gewählten Themen, je Thema reihum durch seine Aufgaben-Arten – so ist jedes Thema vertreten
    const beutel = us.map((u) => ({ u, gens: shuffle(landList(u.bossGens, land)), i: 0 }));
    for (let k = 0; fragen.length < n && k < n * 4; k++) {
      const b = beutel[k % beutel.length], fn = b.gens[b.i++ % b.gens.length], q = fn(lv);
      if (!q?.options?.length) continue;
      q.gen ??= fn.name; q.topic ??= fn.topic || b.u.title; q.unit = b.u.title;
      fragen.push(q);
    }
    return fragen;
  } finally { seedRandom(null); }   // danach wieder echter Zufall für alles andere
}
/** Probeklausur: gemischt aus allen drei Gebieten, ohne Stoff, der im gewählten Land nicht geprüft wird. */
export function bauKlausur({ lv, seed }, land = store.land) {
  const fragen = [];
  GEBIETE.forEach(([area], gi) => {
    const ids = UNITS.filter((u) => u.area === area && u.bossGens?.length && !u.grund && !unitExtra(u, land)).map((u) => u.id);
    bauBlatt({ units: ids, lv, n: KLAUSUR[area], seed: seed + gi * 7919 }, land).forEach((q) => fragen.push(q));
  });
  fragen.forEach((q, i) => { q.be = KLAUSUR_BE[i % KLAUSUR_BE.length]; });
  return fragen;
}

/** Aufgaben-Arten nach Namen (aus allen Lern-Einheiten) – für das Schwächen-Blatt. */
export function genNachName() {
  const m = new Map();
  for (const u of UNITS) if (u.area !== 'pruefung') for (const fn of u.bossGens || []) if (!m.has(fn.name)) m.set(fn.name, { fn, unit: u.title });
  return m;
}
/** Was steht in der Fehler-Kartei und lässt sich als Aufgabe stellen? */
export const schwaechen = () => { const m = genNachName(); return store.karteAlle.map((k) => k.gen).filter((g) => m.has(g)); };
/** Schwächen-Blatt: nur Aufgaben-Arten, bei denen es zuletzt Fehler gab. Hängt vom Lernstand dieses Geräts ab. */
export function bauSchwach({ lv, n, seed }, arten = schwaechen()) {
  const m = genNachName(), liste = arten.map((g) => m.get(g)).filter(Boolean);
  if (!liste.length) return [];
  seedRandom(seed);
  try {
    const fragen = [], reihe = shuffle(liste);
    for (let k = 0; fragen.length < n && k < n * 4; k++) {
      const { fn, unit } = reihe[k % reihe.length], q = fn(lv);
      if (!q?.options?.length) continue;
      q.gen ??= fn.name; q.topic ??= fn.topic || unit; q.unit = unit; fragen.push(q);
    }
    return fragen;
  } finally { seedRandom(null); }
}
/** Baut das Blatt zu einer Beschreibung (Arbeitsblatt, Probeklausur oder Schwächen-Blatt). */
export const bau = (c) => (c.klausur ? bauKlausur(c) : c.schwach ? bauSchwach(c) : bauBlatt(c));
export const blattName = (c) => (c.klausur ? 'Probeklausur' : c.schwach ? 'Schwächen-Blatt' : 'Arbeitsblatt');

/** Adresse eines Blatts: #/blatt/<Themen mit Punkt getrennt>_<Stufe>_<Anzahl>_<Nummer> bzw. #/blatt/klausur_<Stufe>_<Nummer> */
export const blattHash = (c) => (c.klausur ? `#/blatt/klausur_${c.lv}_${c.seed}` : c.schwach ? `#/blatt/schwach_${c.lv}_${c.n}_${c.seed}` : `#/blatt/${c.units.join('.')}_${c.lv}_${c.n}_${c.seed}`);
export function leseHash(teil) {
  const p = String(teil || '').split('_'), zahl = (s) => (/^\d{1,9}$/.test(s) ? +s : NaN);
  if (p[0] === 'klausur' && p.length === 3) { const lv = zahl(p[1]), seed = zahl(p[2]); return lv >= 1 && lv <= 5 && seed > 0 ? { klausur: true, lv, seed } : null; }
  if (p.length !== 4) return null;
  if (p[0] === 'schwach') { const lv = zahl(p[1]), n = zahl(p[2]), seed = zahl(p[3]); return lv >= 1 && lv <= 5 && n >= 1 && n <= 20 && seed > 0 ? { schwach: true, lv, n, seed } : null; }
  const units = p[0].split('.').filter((id) => UNITS.some((u) => u.id === id && u.bossGens?.length)), lv = zahl(p[1]), n = zahl(p[2]), seed = zahl(p[3]);
  return units.length && units.length <= 12 && lv >= 1 && lv <= 5 && n >= 1 && n <= 20 && seed > 0 ? { units, lv, n, seed } : null;
}

/** PDF und Druck gehören zur Pro-Fassung. Solange der Verkauf nicht gestartet ist (Testphase), ist alles offen. */
export const proOffen = () => store.zugangGilt() || !premiumOn();

/** Graph in festen Druckfarben zeichnen (unabhängig von Hell/Dunkel). */
export function zeichne(c, g) {
  const v = g.view, W = 300, H = Math.round((W * (v.y1 - v.y0)) / (v.x1 - v.x0)), d = 2, x = c.getContext('2d');
  c.width = W * d; c.height = H * d; c.style.aspectRatio = `${W}/${H}`; x.setTransform(d, 0, 0, d, 0, 0);
  const X = (a) => ((a - v.x0) / (v.x1 - v.x0)) * W, Y = (b) => H - ((b - v.y0) / (v.y1 - v.y0)) * H;
  x.fillStyle = '#fff'; x.fillRect(0, 0, W, H);
  x.strokeStyle = '#d5dbe6'; x.lineWidth = 1; x.beginPath();
  for (let a = Math.ceil(v.x0); a <= v.x1; a++) { x.moveTo(X(a), 0); x.lineTo(X(a), H); }
  for (let b = Math.ceil(v.y0); b <= v.y1; b++) { x.moveTo(0, Y(b)); x.lineTo(W, Y(b)); }
  x.stroke();
  x.strokeStyle = '#333'; x.lineWidth = 1.4; x.beginPath(); x.moveTo(0, Y(0)); x.lineTo(W, Y(0)); x.moveTo(X(0), 0); x.lineTo(X(0), H); x.stroke();
  x.fillStyle = '#333'; x.font = '10px system-ui,sans-serif';
  for (let a = Math.ceil(v.x0); a <= v.x1; a++) if (a) x.fillText(String(a), X(a) - 3, Math.min(H - 3, Y(0) + 12));
  for (let b = Math.ceil(v.y0); b <= v.y1; b++) if (b) x.fillText(String(b), Math.max(2, X(0) + 4), Y(b) + 3);
  x.strokeStyle = '#173a74'; x.lineWidth = 2.4; x.beginPath();
  let stift = false;
  for (let px = 0; px <= W; px++) { const a = v.x0 + (px / W) * (v.x1 - v.x0), b = g.f(a); if (!Number.isFinite(b) || Math.abs(b) > 1e3) { stift = false; continue; } if (stift) x.lineTo(px, Y(b)); else { x.moveTo(px, Y(b)); stift = true; } }
  x.stroke();
  if (g.mark) { x.fillStyle = '#ff7418'; x.beginPath(); x.arc(X(g.mark[0]), Y(g.mark[1]), 5, 0, 7); x.fill(); }
}

const heute = () => new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
const kopf = (titel, unter) => `<header class="b-kopf"><img class="b-logo" src="img/logo.svg" alt="Logo ${esc(CONFIG.firma)}"><div class="b-firma"><b>${esc(CONFIG.firma)}</b><span>${esc(CONFIG.website.replace(/^https?:\/\/|\/$/g, ''))}</span></div>
  <div class="b-titel"><h1>${esc(titel)}</h1><span>${unter}</span></div></header>`;
const fuss = (c) => `<footer class="b-fuss"><span>${esc(CONFIG.firma)} · ${esc(CONFIG.website.replace(/^https?:\/\/|\/$/g, ''))}</span><span>${blattName(c)} Nr. ${c.seed} · erstellt am ${heute()}</span></footer>`;

/** Das Blatt selbst (Vorschau = Druckbild): Aufgaben-Seiten und Lösungsblatt. */
export function blattHtml(c, fragen) {
  const titel = `${blattName(c)} Mathematik`, be = fragen.reduce((s, q) => s + (q.be || 0), 0);
  const themenText = c.klausur ? 'Analysis · Stochastik · Analytische Geometrie' : [...new Set(fragen.map((q) => q.unit))].map(esc).join(' · ');
  const unter = `${themenText}<br>Schwierigkeit: ${LEVELS[c.lv - 1]} · ${fragen.length} Aufgaben${c.klausur ? ` · ${be} Punkte (BE) · Zeit: ${fragen.length * 5} Minuten · ohne Hilfsmittel` : ''}`;
  const aufgabe = (q, i) => `<li class="b-aufgabe"><div class="b-nr"><b>${i + 1}</b>${q.be ? `<small>${q.be} BE</small>` : ''}</div><div class="b-inhalt">
      <p>${q.prompt}</p>${q.formula ? `<div class="b-formel">${tex(q.formula, true)}</div>` : ''}${q.graph ? `<canvas class="b-graph" data-i="${i}" aria-label="Graph zu Aufgabe ${i + 1}"></canvas>` : ''}
      <div class="b-opts">${q.options.map((o, k) => `<span class="b-opt"><i>${'ABCD'[k]}</i><span>${o.html ?? tex(o.tex)}</span></span>`).join('')}</div>
      <div class="b-platz" aria-hidden="true">Platz für deine Rechnung</div></div></li>`;
  const loesung = (q, i) => { const k = q.options.findIndex((o) => o.correct), o = q.options[k];
    return `<li class="b-lsg"><div class="b-nr"><b>${i + 1}</b></div><div class="b-inhalt"><p><b>${'ABCD'[k]}</b> &nbsp; ${o.html ?? tex(o.tex)}</p>${q.hints?.length ? `<ol class="b-schritte">${q.hints.map((t) => `<li>${t}</li>`).join('')}</ol>` : ''}<p class="b-weg"><b>Lösung:</b> ${q.explain || ''}</p></div></li>`; };
  const np = c.klausur ? `<table class="b-np"><tr><th>Punkte (BE)</th>${NP_GRENZEN.slice(0, 8).map(([p]) => `<td>ab ${Math.ceil((p * be) / 100)}</td>`).join('')}</tr><tr><th>Notenpunkte</th>${NP_GRENZEN.slice(0, 8).map(([, n]) => `<td>${n}</td>`).join('')}</tr>
      <tr><th>Punkte (BE)</th>${NP_GRENZEN.slice(8).map(([p]) => `<td>ab ${Math.ceil((p * be) / 100)}</td>`).join('')}</tr><tr><th>Notenpunkte</th>${NP_GRENZEN.slice(8).map(([, n]) => `<td>${n}</td>`).join('')}</tr></table>
      <p class="b-hinweis">Bewertung zur Orientierung: Im echten Abitur zählen auch Rechenweg und Begründung.</p>` : '';
  return `<article class="blatt" id="blatt">
    <section class="b-seite">${kopf(titel, unter)}
      <div class="b-name"><span>Name: <i></i></span><span>Klasse: <i class="kurz"></i></span><span>Datum: <i class="kurz"></i></span>${c.klausur ? '<span>Punkte: <i class="kurz"></i></span>' : ''}</div>
      <ol class="b-liste">${fragen.map(aufgabe).join('')}</ol>${fuss(c)}</section>
    <section class="b-seite b-loesung">${kopf(`Lösungen – ${blattName(c)} Nr. ${c.seed}`, `${themenText}<br>Schwierigkeit: ${LEVELS[c.lv - 1]}`)}
      <ol class="b-liste">${fragen.map(loesung).join('')}</ol>${np}${fuss(c)}</section></article>`;
}

/* ───────────── Ansichten ───────────── */

/** Auswahl: Themen, Stufe, Anzahl. */
function wahlView() {
  const T = themen(), el = h(`<div class="view stack">
    <a class="back" href="#/pruefung">${ICON.left} Prüfung</a>
    <div><span class="eyebrow">Arbeitsblatt</span><h1 style="margin-top:8px">Arbeitsblatt bauen</h1><p class="lead" style="margin-top:8px">Wähle Themen, Schwierigkeit und Anzahl. Das Blatt lässt sich in der App lösen oder drucken – mit Lösungsblatt.</p></div>
    ${GEBIETE.map(([id, name]) => `<section class="card stack"><div class="row"><h3 class="grow">${name}</h3><button class="linkbtn b-alle" type="button" data-a="${id}">alle</button></div>
      <div class="picks b-themen">${T.filter((t) => t.area === id).map((t) => `<button class="pick" type="button" role="checkbox" aria-checked="false" data-u="${t.id}">${esc(t.title)}${t.extra ? ' <small>(Zusatz)</small>' : ''}</button>`).join('')}</div></section>`).join('')}
    <section class="card stack"><h3>Schwierigkeit</h3><div class="picks" id="b-lv" role="radiogroup" aria-label="Schwierigkeit">${LEVELS.map((n, i) => `<button class="pick" type="button" role="radio" data-lv="${i + 1}" aria-label="${n}">${i + 1}</button>`).join('')}</div>
      <h3>Anzahl der Aufgaben</h3><div class="picks" id="b-n" role="radiogroup" aria-label="Anzahl">${ANZAHL.map((n) => `<button class="pick" type="button" role="radio" data-n="${n}">${n}</button>`).join('')}</div></section>
    <div id="b-note"></div>
    <div class="row"><button class="btn block" id="b-go" type="button">Arbeitsblatt erstellen</button></div>
    <a class="btn ghost block" id="b-klausur" href="#/blatt">Probeklausur erstellen ${marke('pro')}</a>
    <section class="card stack" id="b-schwach-box"><h3>Mein Schwächen-Blatt ${marke('pro')}</h3><small class="muted" id="b-schwach-text"></small><a class="btn ghost" id="b-schwach" href="#/blatt">Schwächen-Blatt erstellen</a></section>
  </div>`);
  let lv = store.level, n = 8; const wahl = new Set();
  const paint = () => {
    el.querySelectorAll('.b-themen .pick').forEach((b) => { const on = wahl.has(b.dataset.u); b.classList.toggle('sel', on); b.setAttribute('aria-checked', on); });
    el.querySelectorAll('#b-lv .pick').forEach((b) => { const on = +b.dataset.lv === lv; b.classList.toggle('sel', on); b.setAttribute('aria-checked', on); });
    el.querySelectorAll('#b-n .pick').forEach((b) => { const on = +b.dataset.n === n; b.classList.toggle('sel', on); b.setAttribute('aria-checked', on); });
    $('#b-klausur', el).href = blattHash({ klausur: true, lv, seed: nr });
    const sw = schwaechen(), sb = $('#b-schwach', el);
    $('#b-schwach-text', el).textContent = sw.length ? `Aus deiner Fehler-Kartei: ${sw.length} ${sw.length === 1 ? 'Aufgaben-Art' : 'Aufgaben-Arten'}, bei denen es zuletzt gehakt hat. Stufe und Anzahl wie oben gewählt.` : 'Noch leer: Sobald du bei Aufgaben Fehler machst, sammelt die App sie – daraus entsteht dein persönliches Blatt.';
    sb.hidden = !sw.length; sb.href = blattHash({ schwach: true, lv, n, seed: nr });
  };
  const nr = neueNummer();
  el.querySelectorAll('.b-themen .pick').forEach((b) => { b.onclick = () => { if (wahl.has(b.dataset.u)) wahl.delete(b.dataset.u); else if (wahl.size < 12) wahl.add(b.dataset.u); sfx('tap'); $('#b-note', el).innerHTML = ''; paint(); }; });
  el.querySelectorAll('.b-alle').forEach((b) => { b.onclick = () => { const ids = T.filter((t) => t.area === b.dataset.a && !t.extra).map((t) => t.id), alle = ids.every((id) => wahl.has(id)); ids.forEach((id) => (alle ? wahl.delete(id) : wahl.size < 12 && wahl.add(id))); paint(); }; });
  el.querySelectorAll('#b-lv .pick').forEach((b) => { b.onclick = () => { lv = +b.dataset.lv; sfx('tap'); paint(); }; });
  el.querySelectorAll('#b-n .pick').forEach((b) => { b.onclick = () => { n = +b.dataset.n; sfx('tap'); paint(); }; });
  $('#b-go', el).onclick = () => {
    if (!wahl.size) { $('#b-note', el).innerHTML = '<div class="note tip">Wähle mindestens ein Thema.</div>'; return; }
    location.hash = blattHash({ units: T.filter((t) => wahl.has(t.id)).map((t) => t.id), lv, n, seed: nr });
  };
  paint();
  return { el };
}

/** Vorschau des Blatts mit den Knöpfen „In der App lösen“ und „Drucken / als PDF“. */
function vorschauView(c) {
  const fragen = bau(c);
  if (!fragen.length) return wahlView();
  if (c.klausur || c.schwach) {   // Probeklausur und Schwächen-Blatt gehören zu Pro (frei, solange der Verkauf nicht gestartet ist)
    const tor = h(`<div class="view stack"><a class="back" href="#/blatt">${ICON.left} Arbeitsblatt</a><div class="note tip ki-laedt">Einen Moment<span aria-hidden="true"></span></div></div>`);
    premiumBereit().then(() => {
      if (!tor.isConnected) return;
      if (proOffen()) tor.replaceWith(vorschau(c, fragen));
      else tor.innerHTML = `<a class="back" href="#/blatt">${ICON.left} Arbeitsblatt</a><section class="card stack" id="b-tor"><h3>${blattName(c)} ${marke('pro')}</h3><p>${c.klausur ? 'Die Probeklausur' : 'Das Schwächen-Blatt'} gehört zur Pro-Fassung.</p><a class="btn" href="#/pro">Was ist in Pro?</a></section>`;
    });
    return { el: tor };
  }
  return { el: vorschau(c, fragen) };
}
function vorschau(c, fragen) {
  const el = h(`<div class="view stack blatt-view">
    <a class="back noprint" href="#/blatt">${ICON.left} Neues Blatt</a>
    <section class="card stack noprint" id="b-aktion"><h3>${blattName(c)} Nr. ${c.seed}</h3>
      <small class="muted">${c.schwach ? 'Dieses Blatt ist aus deiner Fehler-Kartei gebaut: nur Aufgaben-Arten, bei denen es zuletzt gehakt hat.' : 'Unter dieser Nummer entsteht immer genau dieses Blatt – praktisch, wenn mehrere dasselbe rechnen sollen.'}</small>
      <div class="row"><a class="btn grow" id="b-los" href="${blattHash(c)}/los">In der App lösen</a><button class="btn ghost" id="b-druck" type="button">PDF ${marke('pro')}</button></div>
      <div id="b-pro"></div></section>
    ${blattHtml(c, fragen)}
  </div>`);
  el.querySelectorAll('canvas.b-graph').forEach((cv) => zeichne(cv, fragen[+cv.dataset.i].graph));
  const pro = $('#b-pro', el);
  $('#b-druck', el).onclick = async () => {
    await premiumBereit();
    if (!proOffen()) { pro.innerHTML = '<div class="note tip"><b>Drucken und PDF gehören zur Pro-Fassung.</b> In der App lösen kannst du das Blatt trotzdem. <a href="#/einstellungen">Zugangscode eingeben</a></div>'; return; }
    drucken(`${blattName(c)}-${c.seed}`);
  };
  premiumBereit().then(() => { if (el.isConnected && !premiumOn()) pro.innerHTML = '<small class="muted">Drucken und PDF gehören später zur Pro-Fassung. In der Testphase sind sie für alle frei.</small>'; });
  return el;
}

/** Das Blatt in der App lösen: dieselben Aufgaben, mit Tipps und Rückmeldung wie überall. */
function loesenView(c) {
  const fragen = bau(c), zurueck = blattHash(c);
  const el = h(`<div class="view"><div class="stephead"><a class="x" href="${zurueck}" aria-label="Schließen">${ICON.close}</a><div class="prog"><i></i></div></div><div id="stage"></div></div>`);
  let richtig = 0, cleanup = null; const gut = new Set();
  const ctx = {
    progress: (f) => { $('.prog i', el).style.width = `${Math.round(f * 100)}%`; },
    done: (res) => {
      const gain = 10 + 2 * richtig; store.bonus(gain); store.touch(); store.bump('blatt');
      $('#stage', el).innerHTML = `<div class="stack"><section class="board" style="text-align:center"><div class="board-top"><span>${blattName(c).toUpperCase()} NR. ${c.seed}</span><b>● FERTIG</b></div>
        ${starsHtml(res.stars ?? 1)}<h2 id="b-ergebnis">${richtig} von ${fragen.length} auf Anhieb</h2><div class="gain" style="justify-content:center"><span class="chip xp">${ICON.bolt}+${gain} Punkte</span></div></section>
        <div id="b-ki"></div>
        <div class="row"><a class="btn block" href="${zurueck}">Zum Blatt mit Lösungen</a></div></div>`;
      // KI-Auswertung (Pro + KI): bekommt nur Thema und richtig/falsch je Aufgabe – keinen Namen, keinen Lernstand.
      const ki = $('#b-ki', el);
      kiBereit().then(() => {
        if (!ki.isConnected || !kiArt('auswertung')) return;
        ki.innerHTML = `<button class="btn ghost block" id="b-ki-go" type="button">KI-Auswertung: Was soll ich üben? ${marke('ki')}</button><div id="b-ki-out" aria-live="polite"></div>`;
        $('#b-ki-go', ki).onclick = async () => {
          const go = $('#b-ki-go', ki), out = $('#b-ki-out', ki); go.disabled = true;
          out.innerHTML = '<div class="note tip ki-laedt">Die Auswertung wird geschrieben<span aria-hidden="true"></span></div>';
          const r = await api.auswertung({ ergebnis: fragen.slice(0, 60).map((q) => ({ thema: String(q.topic || q.unit || '').slice(0, 60), richtig: gut.has(q) })), geraet: store.geraet, ...(store.zugangGilt() ? { zugang: store.zugang.code } : {}) });
          const div = h('<div class="note ki-auswertung"></div>'); div.className = `note ki-auswertung ${r.ok && r.text ? 'ok' : 'tip'}`;
          if (r.ok && r.text) div.textContent = String(r.text).replace(/<[^>]*>/g, '').slice(0, 900);
          else if (r.status === 402) div.innerHTML = `<b>Die KI-Auswertung gehört zur Stufe „Pro + KI“.</b>${kaufLinks()}`;
          else div.textContent = r.status === 429 ? 'Dein KI-Guthaben für heute reicht dafür nicht mehr. Morgen geht es weiter.' : (r.error || 'Die Auswertung ist gerade nicht erreichbar.');
          out.replaceChildren(div); if (r.ok && Number.isInteger(r.rest)) out.append(h(`<small class="muted ki-rest">Heute noch ${r.rest} KI-Punkte.</small>`));
          go.disabled = r.ok || r.status === 402;
        };
      });
      sfx('win'); window.dispatchEvent(new Event('mt-ruhig'));   // Punkte-Anzeige oben auffrischen
    },
  };
  const run = quiz(fragen.map((q) => () => q), { onRight: (q) => { richtig++; gut.add(q); } });
  queueMicrotask(() => { cleanup = run($('#stage', el), ctx) || null; });
  return { el, cleanup: () => cleanup?.() };
}

/** Einstieg für den Router: teil = alles hinter „#/blatt/“. */
export function blattView(teil) {
  if (!teil) return wahlView();
  const los = teil.endsWith('/los'), c = leseHash(los ? teil.slice(0, -4) : teil);
  if (!c) return wahlView();
  return los ? loesenView(c) : vorschauView(c);
}
