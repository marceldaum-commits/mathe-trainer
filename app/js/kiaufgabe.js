// KI-Aufgaben (Stufe „Pro + KI“): immer neue Aufgaben vom Server. Jede Aufgabe ist dort nachgerechnet und wird
// hier im Gerät ein zweites Mal geprüft (toQuestion), bevor sie jemand sieht.
import { $, h, esc, ICON, sfx } from './ui.js';
import { store, LEVELS } from './store.js';
import { shuffle } from './math.js';
import { UNITS } from './units.js';
import { quiz } from './quiz.js';
import { api, kiBereit, kiArt, kaufLinks } from './api.js';
import { toQuestion } from './ki/verify.js';

const GEBIETE = [['analysis', 'Analysis'], ['stochastik', 'Stochastik'], ['geometrie', 'Analytische Geometrie']];
/** Themen zur Auswahl: die Themen-Namen der vorhandenen Aufgaben-Arten, nach Gebiet. */
export function kiThemen() {
  return GEBIETE.map(([id, name]) => [name, [...new Set(UNITS.filter((u) => u.area === id).flatMap((u) => (u.bossGens || []).map((fn) => fn.topic)).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'de'))]);
}
/** Wartezeit, bis der Server seinen Vorrat nachgefüllt hat (im automatischen Test kurz). */
const warteMs = () => (window.__mtTest ? 250 : 25000);
export const VERSUCHE = 3;

export function kiAufgabeView() {
  const el = h('<div class="view stack"></div>');
  let thema = '', lv = store.level, stil = 'abi', cleanup = null, laeuft = 0;
  function wahl(hinweis = '') {
    cleanup?.(); cleanup = null; laeuft++;
    el.className = 'view stack';
    el.innerHTML = `<a class="back" href="#/pruefung">${ICON.left} Prüfung</a>
      <div><span class="eyebrow">Pro + KI</span><h1 style="margin-top:8px">KI-Aufgaben</h1><p class="lead" style="margin-top:8px">Immer neue Aufgaben – jede vom Server nachgerechnet, bevor du sie siehst.</p></div>
      <section class="card stack"><h3>Thema</h3><select class="field" id="ka-thema" aria-label="Thema">${kiThemen().map(([g, ts]) => `<optgroup label="${esc(g)}">${ts.map((t) => `<option${t === thema ? ' selected' : ''}>${esc(t)}</option>`).join('')}</optgroup>`).join('')}</select>
        <h3>Schwierigkeit</h3><div class="picks" id="ka-lv" role="radiogroup" aria-label="Schwierigkeit">${LEVELS.map((n, i) => `<button class="pick" type="button" role="radio" data-lv="${i + 1}" aria-label="${n}">${i + 1}</button>`).join('')}</div>
        <h3>Art</h3><div class="picks" id="ka-stil" role="radiogroup" aria-label="Art"><button class="pick" type="button" role="radio" data-s="abi">Abi-Stil</button><button class="pick" type="button" role="radio" data-s="uebung">Übung</button></div></section>
      <div id="ka-note">${hinweis}</div>
      <div class="row"><button class="btn block" id="ka-go" type="button">Aufgabe holen (1 KI-Punkt)</button></div>`;
    const paint = () => {
      el.querySelectorAll('#ka-lv .pick').forEach((b) => { const on = +b.dataset.lv === lv; b.classList.toggle('sel', on); b.setAttribute('aria-checked', on); });
      el.querySelectorAll('#ka-stil .pick').forEach((b) => { const on = b.dataset.s === stil; b.classList.toggle('sel', on); b.setAttribute('aria-checked', on); });
    };
    el.querySelectorAll('#ka-lv .pick').forEach((b) => { b.onclick = () => { lv = +b.dataset.lv; sfx('tap'); paint(); }; });
    el.querySelectorAll('#ka-stil .pick').forEach((b) => { b.onclick = () => { stil = b.dataset.s; sfx('tap'); paint(); }; });
    $('#ka-go', el).onclick = () => { thema = $('#ka-thema', el).value; hole(1); };
    paint();
  }
  async function hole(versuch) {
    const lauf = ++laeuft, note = $('#ka-note', el), go = $('#ka-go', el);
    go.disabled = true;
    note.innerHTML = `<div class="note tip ki-laedt">${versuch === 1 ? 'Die Aufgabe wird geholt' : 'Der Vorrat wird gerade gefüllt – gleich geht es weiter'}<span aria-hidden="true"></span></div>`;
    await kiBereit();
    if (lauf !== laeuft) return;
    if (!kiArt('aufgabe')) { go.disabled = false; note.innerHTML = '<div class="note tip">KI-Aufgaben sind hier noch nicht freigeschaltet.</div>'; return; }
    const r = await api.aufgabe({ thema, stufe: lv, stil, geraet: store.geraet, ...(store.zugangGilt() ? { zugang: store.zugang.code } : {}) });
    if (lauf !== laeuft || !el.isConnected) return;
    if (r.ok && r.aufgabe) {
      let q; try { q = toQuestion(r.aufgabe); } catch { q = null; }
      if (!q) { go.disabled = false; note.innerHTML = '<div class="note bad">Diese Aufgabe hat die Prüfung im Gerät nicht bestanden und wird nicht gezeigt. Bitte hol eine neue.</div>'; return; }
      q.options = shuffle(q.options); q.gen = 'kiAufgabe';
      return zeige(q, r.rest);
    }
    if (r.ok && r.bereit === false) {
      if (versuch >= VERSUCHE) { go.disabled = false; note.innerHTML = `<div class="note tip">${esc(r.text || 'Für dieses Thema ist der Vorrat noch leer.')} Versuch es in einer Minute noch einmal oder wähle ein anderes Thema.</div>`; return; }
      setTimeout(() => { if (lauf === laeuft && el.isConnected) hole(versuch + 1); }, warteMs());
      return;
    }
    go.disabled = r.status === 402;
    note.innerHTML = r.status === 402 ? `<div class="note tip"><b>KI-Aufgaben gehören zur Stufe „Pro + KI“.</b>${kaufLinks()}</div>`
      : `<div class="note ${r.status === 429 ? 'tip' : 'bad'}">${r.status === 429 ? 'Dein KI-Guthaben für heute ist aufgebraucht. Morgen geht es weiter.' : esc(r.error || 'Die Aufgabe konnte gerade nicht geholt werden.')}</div>`;
  }
  function zeige(q, rest) {
    el.className = 'view';
    el.innerHTML = `<div class="stephead"><a class="x" href="#/kiaufgabe" id="ka-x" aria-label="Schließen">${ICON.close}</a><div class="prog"><i></i></div></div><div id="stage"></div>`;
    $('#ka-x', el).onclick = (ev) => { ev.preventDefault(); wahl(); };
    let richtig = false;
    const ctx = { progress: (f) => { $('.prog i', el).style.width = `${Math.round(f * 100)}%`; },
      done: () => { store.bonus(richtig ? 6 : 3); store.touch(); store.bump('kiAufgabe'); window.dispatchEvent(new Event('mt-ruhig'));
        wahl(`<div class="note ok" id="ka-fertig"><b>${richtig ? 'Auf Anhieb richtig.' : 'Geschafft.'}</b>${Number.isInteger(rest) ? ` Heute noch ${rest} KI-Punkte.` : ''}</div>`); } };
    const run = quiz([() => q], { onRight: () => { richtig = true; }, kopf: `KI-Aufgabe · ${esc(q.topic || '')}` });
    queueMicrotask(() => { cleanup = run($('#stage', el), ctx) || null; });
  }
  wahl();
  return { el, cleanup: () => { laeuft++; cleanup?.(); } };
}
