// Theorie zur Übung: öffnet das passende Kapitel als Fenster über der Aufgabe.
// Die Runde bleibt darunter stehen – nach dem Schließen geht es genau dort weiter (kein Seitenwechsel, kein verlorener Fortschritt).
import { h, esc, sfx, formelnEinpassen } from './ui.js';
import { UNITS } from './units.js';
import { premiumBereit } from './api.js';
import { merkbilderEinsetzen } from './merkbild.js';
import { marke } from './pro.js';

/** Hat die Einheit Theorie zum Nachlesen (Erklär-Karten)? */
export const hatTheorie = (u) => !!u && u.area !== 'pruefung' && u.steps.some((s) => s.run?.cards?.length);

/** Einheit zu einer Aufgabenart (Name des Erzeugers) im gewählten Jahrgang – für Runden außerhalb einer Einheit. */
export function einheitZu(gen) {
  if (!gen) return null;
  return UNITS.find((u) => hatTheorie(u) && (u.bossGens || []).some((g) => g.name === gen || g.basis?.name === gen)) || null;
}

/** Knopf „Theorie“ (leer, wenn es zur Einheit keine Theorie gibt). */
export const theorieKnopf = (u) => (hatTheorie(u) ? `<button class="btn ghost small theo" type="button" data-theo="${esc(u.id)}" aria-haspopup="dialog">Theorie</button>` : '');

/** Alle Theorie-Knöpfe in el anklicken lassen. */
export function theorieKnoepfe(el) {
  el.querySelectorAll('[data-theo]').forEach((b) => { b.onclick = () => theorieOeffnen(b.dataset.theo, b); });
}

/** Das Fenster mit dem Kapitel (kurz; ausführlich, wenn vorhanden und freigeschaltet). */
export async function theorieOeffnen(id, zurueck = null) {
  const u = UNITS.find((x) => x.id === id);
  if (!hatTheorie(u) || document.querySelector('.t-fenster')) return;
  sfx('tap');
  const T = await import('./theorie.js');
  const fenster = h(`<div class="t-fenster" role="dialog" aria-modal="true" aria-label="Theorie: ${esc(u.title)}"><div class="t-fenster-in">
    <div class="t-fenster-kopf"><b>Theorie: ${esc(u.title)}</b><button class="btn small" type="button" id="tf-zu">Zurück zur Aufgabe</button></div>
    ${T.hatLang(u) ? `<div class="umschalt" id="tf-art" role="radiogroup" aria-label="Länge"><button class="pick sel" type="button" role="radio" aria-checked="true" data-l="0">Kurz</button><button class="pick" type="button" role="radio" aria-checked="false" data-l="1">Ausführlich ${marke('pro')}</button></div>` : ''}
    <div id="tf-pro"></div><div id="tf-text"></div></div></div>`);
  const text = fenster.querySelector('#tf-text'), pro = fenster.querySelector('#tf-pro');
  const zeige = (lang) => {
    fenster.querySelectorAll('#tf-art .pick').forEach((b) => { const an = (b.dataset.l === '1') === lang; b.classList.toggle('sel', an); b.setAttribute('aria-checked', an); });
    text.innerHTML = T.kapitelHtml(u, lang); merkbilderEinsetzen(text); formelnEinpassen();
  };
  fenster.querySelectorAll('#tf-art .pick').forEach((b) => { b.onclick = async () => {
    const will = b.dataset.l === '1'; pro.innerHTML = '';
    if (will) { await premiumBereit(); if (!T.proOffen()) { pro.innerHTML = '<div class="note tip"><b>Die ausführliche Fassung gehört zur Pro-Fassung.</b> Die kurze Fassung enthält schon alles Wichtige.</div>'; return; } }
    zeige(will);
  }; });
  const zu = () => { fenster.remove(); removeEventListener('hashchange', zu); removeEventListener('keydown', taste); if (zurueck?.isConnected) zurueck.focus(); };
  const taste = (ev) => { if (ev.key === 'Escape') zu(); };
  fenster.querySelector('#tf-zu').onclick = zu;
  addEventListener('hashchange', zu); addEventListener('keydown', taste);
  document.body.append(fenster);
  zeige(false);
  fenster.querySelector('#tf-zu').focus();
}
