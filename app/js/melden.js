// Schwebender Hilfe-Knopf unten rechts: Fehler melden, Idee schicken, Probestunde.
// Meldungen gehen an CONFIG.melden (eigene Adresse, vom Server per E-Mail weitergeleitet). Ist der Versand noch
// nicht eingeschaltet oder das Gerät offline, wartet die Meldung im Gerät und wird später nachgereicht.
import { CONFIG, VERSION } from './config.js';
import { store } from './store.js';
import { h, esc, sfx, toast } from './ui.js';

export const ARTEN = [['aufgabe', 'Fehler in einer Aufgabe'], ['app', 'Etwas funktioniert nicht'], ['idee', 'Idee oder Wunsch']];
export const MAX_TEXT = 1000;
export const meldenOn = () => typeof CONFIG.melden === 'string' && CONFIG.melden.startsWith('/');

/** Baut die Meldung: Text plus das, was zum Nachstellen nötig ist. Keine Namen, keine Kennung, kein Lernstand. */
export function buildReport(art, text, ctx = {}) {
  const clean = String(text).replace(/[\u0000-\u0008\u000b-\u001f]/g, ' ').trim().slice(0, MAX_TEXT);
  const r = { art: ARTEN.some(([k]) => k === art) ? art : 'app', text: clean, version: VERSION, ort: String(ctx.ort || '').slice(0, 80), stufe: ctx.stufe | 0, zeit: ctx.zeit || new Date().toISOString() };
  if (ctx.aufgabe && r.art === 'aufgabe') r.aufgabe = { gen: String(ctx.aufgabe.gen || '').slice(0, 40), thema: String(ctx.aufgabe.thema || '').slice(0, 80), stufe: ctx.aufgabe.stufe | 0, frage: String(ctx.aufgabe.frage || '').slice(0, 400), formel: String(ctx.aufgabe.formel || '').slice(0, 300) };
  return r;
}

async function send(report) {
  const res = await fetch(CONFIG.melden, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(report) });
  if (!res.ok) throw new Error(String(res.status));
}
/** Reicht wartende Meldungen nach (beim Start und nach jeder neuen Meldung). */
export async function flush() {
  if (!meldenOn() || !navigator.onLine) return 0;
  let sent = 0;
  for (const r of store.meldungen) { try { await send(r); store.meldungWeg(r.zeit); sent++; } catch { break; } }
  return sent;
}

function open() {
  const box = document.querySelector('#help');
  const last = window.__mtLast, inStep = !!document.querySelector('.stephead');
  box.innerHTML = `<div class="sheet-in help-in" role="dialog" aria-modal="true" aria-label="Hilfe und Rückmeldung">
    <div class="row"><h2 class="grow">Hilfe und Rückmeldung</h2><button class="x" id="hp-x" type="button" aria-label="Schließen">✕</button></div>
    <div id="hp-menu" class="stack">
      <button class="card unit" type="button" data-art="aufgabe"><span class="num">!</span><span><h3>Fehler melden</h3><small>Eine Aufgabe stimmt nicht oder etwas funktioniert nicht.</small></span><span></span></button>
      <button class="card unit" type="button" data-art="idee"><span class="num">+</span><span><h3>Idee oder Wunsch</h3><small>Was fehlt dir? Welches Thema soll dazukommen?</small></span><span></span></button>
      <a class="card unit" href="${CONFIG.probestunde}" target="_blank" rel="noopener"><span class="num">?</span><span><h3>Hilfe von einem Menschen</h3><small>Kostenlose Probestunde bei ${esc(CONFIG.firma)}.</small></span><span></span></a>
    </div>
    <form id="hp-form" class="stack" hidden novalidate>
      <div class="picks col" id="hp-art" role="radiogroup" aria-label="Worum geht es?"></div>
      <textarea class="field" id="hp-text" rows="5" maxlength="${MAX_TEXT}" placeholder="Was ist passiert? Was hast du erwartet?" aria-label="Deine Nachricht"></textarea>
      <small class="muted" id="hp-ctx"></small>
      <small class="muted">Bitte keine Namen oder Kontaktdaten eintragen. Mitgeschickt werden nur: App-Version, die aktuelle Seite, die Schwierigkeit${last ? ' und die zuletzt gezeigte Aufgabe' : ''}.</small>
      <div id="hp-note"></div>
      <div class="row"><button class="btn ghost" id="hp-back" type="button">Zurück</button><button class="btn grow" type="submit">Senden</button></div>
    </form></div>`;
  box.hidden = false;
  const form = box.querySelector('#hp-form'), menu = box.querySelector('#hp-menu'), text = box.querySelector('#hp-text'), note = box.querySelector('#hp-note');
  let art = 'aufgabe';
  const close = () => { box.hidden = true; box.innerHTML = ''; };
  const paint = () => {
    box.querySelectorAll('#hp-art button').forEach((b) => { const on = b.dataset.k === art; b.classList.toggle('sel', on); b.setAttribute('aria-checked', on); });
    box.querySelector('#hp-ctx').textContent = art === 'aufgabe' && last ? `Zuletzt gezeigte Aufgabe: ${last.thema || last.gen} (Stufe ${last.stufe}).` : '';
  };
  ARTEN.forEach(([k, name]) => { const b = h(`<button class="pick" type="button" role="radio" data-k="${k}">${name}</button>`); b.onclick = () => { art = k; paint(); }; box.querySelector('#hp-art').append(b); });
  menu.querySelectorAll('button[data-art]').forEach((b) => { b.onclick = () => { art = b.dataset.art === 'aufgabe' && !last && !inStep ? 'app' : b.dataset.art; menu.hidden = true; form.hidden = false; paint(); text.focus(); }; });
  box.querySelector('#hp-back').onclick = () => { form.hidden = true; menu.hidden = false; note.innerHTML = ''; };
  box.querySelector('#hp-x').onclick = close;
  box.onclick = (ev) => { if (ev.target === box) close(); };
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    if (text.value.trim().length < 5) { note.innerHTML = '<div class="note tip">Schreib bitte kurz, worum es geht.</div>'; text.focus(); return; }
    store.meldungNeu(buildReport(art, text.value, { ort: location.hash || '#/', stufe: store.level, aufgabe: last }));
    close(); sfx('ok');
    const sent = await flush().catch(() => 0);
    toast(sent ? 'Danke! Deine Meldung ist angekommen.' : meldenOn() ? 'Danke! Die Meldung wird gesendet, sobald du wieder online bist.' : 'Danke! Die Meldung ist gespeichert und wird gesendet, sobald der Versand eingeschaltet ist.');
  });
}

/** Hängt den Knopf an die Seite. */
export function initMelden() {
  const fab = h('<button class="fab" id="fab" type="button" aria-label="Hilfe und Fehler melden"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14v10H10l-4 4v-4H5z"/><path d="M12 8v3M12 13.200v.100"/></svg></button>');
  fab.onclick = () => { sfx('tap'); open(); };
  document.body.append(fab, h('<div id="help" class="sheet" hidden></div>'));
  window.addEventListener('online', () => { flush(); });
  flush();
}
