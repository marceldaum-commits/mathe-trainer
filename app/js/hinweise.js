// Weg zur Probestunde (Recht V15; PROBESTUNDE.md d672374; Marcel 19.11./21.11.). Alles wird nur im Gerät berechnet und gemerkt.
//  • Kinderansicht bei Schwierigkeiten: NUR ein Hilfesatz mit [Leichter üben] [Erklärung ansehen] – kein Außenlink, kein Bezug auf Probestunde.
//  • Kl. 9–10: kurzer Tipp mit [Mehr erfahren] (höchstens 1× pro Woche, wegklickbar, kein Preis), ohne Tor.
//  • Elternbericht (hinter dem Tor): Hinweis bei objektiven Schwierigkeiten (Thema mit mindestens 10 Versuchen, davon mindestens die Hälfte falsch),
//    höchstens 1× in 4 Wochen je Thema, wegklickbar, mit Schalter „Hinweise auf Nachhilfe ausblenden“ (Einstellungen hinter dem Tor).
//  • Zählung „Probestunden-Link angetippt“ nur anonym: Links tragen data-anonym → zaehler.js hängt weder Thema noch Klasse an.
import { esc } from './ui.js';
import { store } from './store.js';

const KEY = 'mathetrainer.hinweise', TAG = 864e5;
const lese = () => { try { return JSON.parse(globalThis.localStorage?.getItem(KEY) || '{}') || {}; } catch { return {}; } };
const schreibe = (o) => { try { globalThis.localStorage?.setItem(KEY, JSON.stringify(o)); } catch { /* ohne Speicher */ } };
export const PROBE_LINK = 'https://www.mathenachhilfe-online.com/probestunde/?src=mathetrainer';
/** Sind Hinweise auf Nachhilfe ausgeblendet? */
export const hinweiseAus = () => lese().aus === true;
export const hinweiseSetzen = (an) => { const o = lese(); o.aus = !an; schreibe(o); };

/** Hilfesatz für Kinder (alle Klassen) bei Schwierigkeiten – nie ein Außenlink. */
export const hilfeKind = () => `<div class="hilfe-kind" role="note"><p>Du kommst hier gerade nicht weiter? Das ist okay. Probier eine leichtere Stufe oder schau dir die Erklärung noch einmal an. Und du kannst jederzeit deine Eltern oder deine Lehrkraft fragen.</p>
  <div class="row"><button class="btn small" type="button" data-leichter>Leichter üben</button><a class="btn small line" href="#/theorie">Erklärung ansehen</a></div></div>`;

/** Tipp für Kl. 9–10, höchstens einmal pro Woche; leer in anderen Klassen oder wenn ausgeblendet. */
export function tippKl910(jetzt = Date.now()) {
  if (!['9', '10'].includes(store.jahrgang) || hinweiseAus()) return '';
  const o = lese(); if (o.tipp && jetzt - o.tipp < 7 * TAG) return '';
  o.tipp = jetzt; schreibe(o);
  return `<div class="tipp-910" role="note"><p>Tipp: Wenn ein Thema länger hakt, kann eine persönliche Erklärung helfen. Mit deinen Eltern könnt ihr bei uns eine kostenlose, unverbindliche Probestunde anfragen.</p>
  <div class="row"><a class="btn small line" data-anonym href="${PROBE_LINK}" target="_blank" rel="noopener">Mehr erfahren</a><button class="btn small ghost" type="button" data-tipp-weg aria-label="Tipp ausblenden">✕</button></div></div>`;
}

/** Hinweis im Elternbericht: Thema mit objektiven Schwierigkeiten (nur im Gerät berechnet) oder ''. */
export function elternHinweis(name = '', jetzt = Date.now()) {
  if (hinweiseAus()) return '';
  const o = lese(), zuletzt = o.zuletzt || {};
  const kand = Object.entries(store.stats).map(([thema, s]) => ({ thema, n: s.ok + s.bad, rate: s.bad / Math.max(1, s.ok + s.bad) }))
    .filter((s) => s.n >= 10 && s.rate >= 0.5 && !(zuletzt[s.thema] && jetzt - zuletzt[s.thema] < 28 * TAG)).sort((a, b) => b.rate - a.rate || b.n - a.n)[0];
  if (!kand) return '';
  zuletzt[kand.thema] = jetzt; o.zuletzt = zuletzt; schreibe(o);
  const wer = name ? esc(name) : 'euer Kind';
  return `<section class="card stack nur-web elternhinweis" data-hinweis="elternbericht" role="note"><p><b>Hinweis:</b> In ${esc(kand.thema)} hat ${wer} in den letzten Wochen öfter Schwierigkeiten. Das ist normal und lässt sich üben – die App zeigt dazu passende Übungen. Wenn ihr persönliche Unterstützung möchtet: Unser Angebot – eine kostenlose, unverbindliche Probestunde Online-Nachhilfe.</p>
  <div class="row"><a class="btn small" data-anonym href="${PROBE_LINK}" target="_blank" rel="noopener">Probestunde anfragen</a><button class="btn small ghost" type="button" data-hinweise-aus>Solche Hinweise ausblenden</button></div></section>`;
}

/** Einmal beim Start: Knöpfe [Leichter üben], ✕ am Tipp und „Hinweise ausblenden“. */
export function hinweiseStarten(w = globalThis.window, toast = () => {}) {
  w?.document?.addEventListener('click', (e) => {
    const t = e.target?.closest?.('[data-leichter], [data-tipp-weg], [data-hinweise-aus]'); if (!t) return;
    if (t.matches('[data-leichter]')) { store.level = Math.max(1, store.level - 1); t.disabled = true; toast('Die nächsten Aufgaben sind etwas leichter.'); }
    else if (t.matches('[data-tipp-weg]')) t.closest('.tipp-910')?.remove();
    else { hinweiseSetzen(false); t.closest('.elternhinweis')?.remove(); toast('Hinweise auf Nachhilfe sind ausgeblendet. Du findest den Schalter unter „Für Eltern“ in den Einstellungen.'); }
  });
}
