// Eltern-Tor nach dem gemeinsamen Standard aller Lern-Apps (ELTERN-TOR.md, AppZentrale 19.11.2026; Recht V10, UWG Anh. Nr. 28).
// Malaufgabe 13–19 × 6–9 in Worten, Vorlese-Knopf, eigene Ziffern-Tasten, nach einem Fehler sofort eine neue Aufgabe,
// kein Zeitdruck, jederzeit abbrechen. Gelöst bleibt das Tor 10 Minuten offen – nur im Arbeitsspeicher (nach dem Neuladen fragt es wieder).
// Ein gelöstes Tor zählt als anonymes Ereignis „elternbereich“.
// Steht vor: allen Links nach außen außer Impressum und Datenschutz (Website, Shop, Probestunde, „← Alle Apps“) und vor
// Elementen mit data-tor (z. B. Pro-Seite mit Preisen in Kl. 5–10). Links zu den anderen Lern-Apps brauchen kein Tor (V10 b).
import { CONFIG } from './config.js';
import { esc } from './ui.js';
import { zaehle } from './zaehler.js';
import { ri } from './math.js';

const ZEHNER = { 13: 'dreizehn', 14: 'vierzehn', 15: 'fünfzehn', 16: 'sechzehn', 17: 'siebzehn', 18: 'achtzehn', 19: 'neunzehn' };
const EINER = { 6: 'sechs', 7: 'sieben', 8: 'acht', 9: 'neun' };
export const OFFEN_MS = 10 * 60 * 1000;
let offenBis = 0;
export const torOffen = (jetzt = Date.now()) => jetzt < offenBis;
/** Nur für Tests: Tor wieder schließen. */
export const torSchliessen = () => { offenBis = 0; };

/** Neue Aufgabe { a, b, text } – text in Worten („siebzehn mal acht“). */
export function torAufgabe() {
  const a = ri(13, 19), b = ri(6, 9);
  return { a, b, text: `${ZEHNER[a]} mal ${EINER[b]}` };
}

/** Lern-App-Hosts (eigene Apps nach demselben Standard) – Links dorthin ohne Tor. */
const LERNAPP = /^(kurvenflug|rechenblitz|raumlicht|experimentopia|wissensgarten|quasselquest|mathetrainer|trainer)(-test)?\.mathenachhilfe-online\.com$/;
const LERNEN = /^lernen(-test)?\.mathenachhilfe-online\.com$/;
const ohneSuche = (u) => `${u.origin}${u.pathname}`.replace(/\/+$/, '');
const FREI = () => [CONFIG.impressum, CONFIG.datenschutz].map((x) => { try { return ohneSuche(new URL(x)); } catch { return ''; } });

/** Braucht dieser Link das Tor? Liefert den sachlichen Grund oder ''. */
export function torGrund(href, basis = globalThis.location?.href || 'https://lernen.mathenachhilfe-online.com/mathetrainer/') {
  let u; try { u = new URL(String(href || ''), basis); } catch { return ''; }
  if (u.protocol === 'mailto:' || u.protocol === 'tel:') return 'Hier geht es nach außen.';
  if (!/^https?:$/.test(u.protocol)) return '';
  let hier = ''; try { hier = new URL(basis).origin; } catch { /* egal */ }
  if (u.origin === hier) return '';
  if (FREI().includes(ohneSuche(u))) return '';   // Impressum und Datenschutz bleiben frei
  if (LERNAPP.test(u.hostname)) return '';
  if (LERNEN.test(u.hostname) && /^\/[a-z][a-z-]+\//.test(u.pathname) && !/^\/lern-apps\b/.test(u.pathname)) return '';   // …/<app>/
  if (/\/produkt\/|\/shop\b|warenkorb|kasse/.test(u.pathname)) return 'Hier geht es zum Shop.';
  if (/probestunde/.test(u.pathname)) return 'Hier geht es zur Probestunde.';
  return 'Hier geht es zur Website.';
}

/** Tor zeigen → Promise<boolean> (true = gelöst bzw. schon offen). */
export function elternTor(grund = 'Dieser Bereich ist für Eltern.', d = globalThis.document) {
  if (torOffen()) return Promise.resolve(true);
  return new Promise((fertig) => {
    let auf = torAufgabe(), eingabe = '';
    const zurueck = d.activeElement;
    const hg = d.createElement('div'); hg.className = 'tor-hg'; hg.id = 'eltern-tor';
    hg.innerHTML = `<div class="tor" role="dialog" aria-modal="true" aria-labelledby="tor-titel" aria-describedby="tor-grund">
      <h2 id="tor-titel">Für Eltern</h2>
      <p id="tor-grund">${esc(grund)}</p>
      <p class="tor-frage">Bitte rechnen Sie:</p>
      <p class="tor-aufgabe" id="tor-aufgabe" aria-live="polite"></p>
      ${'speechSynthesis' in globalThis ? '<button class="btn ghost small" type="button" id="tor-vorlesen">🔊 Vorlesen</button>' : ''}
      <output class="tor-anzeige" id="tor-anzeige" aria-label="Ihre Eingabe"></output>
      <p class="tor-fehler" id="tor-fehler" role="alert"></p>
      <div class="tor-tasten">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((z) => `<button type="button" class="tor-taste" data-z="${z}">${z}</button>`).join('')}
        <button type="button" class="tor-taste" data-z="weg" aria-label="Löschen">⌫</button><button type="button" class="tor-taste" data-z="0">0</button><button type="button" class="tor-taste ok" data-z="ok">OK</button></div>
      <button class="btn line small" type="button" id="tor-abbrechen">Abbrechen</button>
    </div>`;
    const $ = (s) => hg.querySelector(s);
    const zeige = () => { $('#tor-aufgabe').textContent = `${auf.text[0].toUpperCase()}${auf.text.slice(1)}`; $('#tor-aufgabe').setAttribute('aria-label', auf.text); $('#tor-anzeige').textContent = eingabe || '–'; };
    const ende = (ok) => {
      d.removeEventListener('keydown', taste, true); hg.remove(); try { globalThis.speechSynthesis?.cancel(); } catch { /* egal */ }
      try { zurueck?.focus?.(); } catch { /* egal */ }
      fertig(ok);
    };
    const pruefe = () => {
      if (!eingabe) return;
      if (Number(eingabe) === auf.a * auf.b) { offenBis = Date.now() + OFFEN_MS; zaehle('elternbereich'); ende(true); return; }
      auf = torAufgabe(); eingabe = ''; $('#tor-fehler').textContent = 'Leider falsch – hier ist eine neue Aufgabe.'; zeige();
    };
    const druecke = (z) => {
      if (z === 'ok') return pruefe();
      $('#tor-fehler').textContent = '';
      if (z === 'weg') eingabe = eingabe.slice(0, -1); else if (eingabe.length < 4) eingabe += z;
      zeige();
    };
    function taste(e) {
      if (e.key === 'Escape') { e.preventDefault(); ende(false); } else if (/^[0-9]$/.test(e.key)) { e.preventDefault(); druecke(e.key); }
      else if (e.key === 'Backspace') { e.preventDefault(); druecke('weg'); } else if (e.key === 'Enter' && !e.target?.closest?.('#tor-abbrechen, #tor-vorlesen')) { e.preventDefault(); druecke('ok'); }
    }
    hg.addEventListener('click', (e) => {
      const t = e.target.closest('[data-z]'); if (t) { druecke(t.dataset.z); return; }
      if (e.target.closest('#tor-abbrechen')) ende(false);
      else if (e.target.closest('#tor-vorlesen')) { try { const s = new globalThis.SpeechSynthesisUtterance(`Bitte rechnen Sie: ${auf.text}`); s.lang = 'de-DE'; globalThis.speechSynthesis.cancel(); globalThis.speechSynthesis.speak(s); } catch { /* ohne Sprachausgabe */ } }
    });
    d.addEventListener('keydown', taste, true);
    d.body.append(hg); zeige(); hg.querySelector('.tor-taste')?.focus();
  });
}

/** Einmal beim Start: Klicks auf Links nach außen und auf [data-tor] laufen erst durch das Tor. Läuft vor der Zählung. */
export function torStarten(w = globalThis.window) {
  if (!w?.addEventListener) return;
  w.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button > 0) return;
    const el = e.target?.closest?.('a[href], [data-tor]'); if (!el || el.closest('#eltern-tor')) return;
    const grund = el.hasAttribute('data-tor') ? (el.dataset.tor || 'Dieser Bereich ist für Eltern.') : torGrund(el.getAttribute('href'), w.location.href);
    if (!grund || torOffen()) return;
    e.preventDefault(); e.stopImmediatePropagation();
    elternTor(grund, w.document).then((ok) => { if (ok && el.isConnected) el.click(); });
  }, true);
}
