// Anonyme Nutzungszählung (Ratgeber A3, Marcel 18.11.2026: „Ja, wie beschrieben“): nur Zahlen je Ereignis an den eigenen Server
// (POST /zaehler/v1/e, gleiche Herkunft). Keine Kennung, keine Geräte-ID, kein Lernstand, kein Code. Abschaltbar in den Einstellungen
// (Standard: an); aus = kein einziger Aufruf. Fehler werden ignoriert, nie gewartet, nie wiederholt. Kein sendBeacon.
// Links zur Website und zum Shop bekommen ?src=mathetrainer-<ort> (dazu thema und klasse, wo bekannt).
import { VERSION, CONFIG } from './config.js';
import { THEMEN, themaVon } from './eltern.js';

const SCHALTER = 'mt.zaehlung';
export const EREIGNISSE = ['start', 'elternbereich', 'pro_ansehen', 'pro_kasse', 'code_eingeloest', 'probestunde_klick', 'neukunde_klick', 'crashkurs_klick', 'nachhilfe_hinweis', 'geschenk_klick', 'level_start', 'level_geschafft', 'theorie'];
export const ORTE = ['elternbericht', 'elternbereich', 'lernstand', 'gesperrt', 'klassenarbeit', 'geschenk', 'einstellungen', 'fusszeile', 'link', 'eingabe', 'kopf'];

export function zaehlungAn() { try { return globalThis.localStorage?.getItem(SCHALTER) !== 'aus'; } catch { return true; } }
export function zaehlungSetzen(an) { try { globalThis.localStorage?.setItem(SCHALTER, an ? 'an' : 'aus'); } catch { /* ohne Speicher */ } }

/** Ein Ereignis zählen. Nur bekannte Ereignisse, Orte und Themen; sonst wird das Feld weggelassen. */
export function zaehle(ev, ort = '', thema = '', f = globalThis.fetch) {
  if (!zaehlungAn() || !EREIGNISSE.includes(ev) || typeof f !== 'function') return null;
  const body = { app: 'mathetrainer', v: VERSION, ev };
  if (ORTE.includes(ort)) body.ort = ort;
  if (THEMEN.includes(thema)) body.thema = thema;
  try { const p = f('/zaehler/v1/e', { method: 'POST', body: JSON.stringify(body), keepalive: true, credentials: 'omit', headers: { 'Content-Type': 'text/plain' } }); p?.catch?.(() => {}); } catch { /* egal */ }
  return body;
}

/* ───────────── Ort und Thema aus dem, was gerade zu sehen ist ───────────── */
const SEITE_ORT = { '#/bericht': 'lernstand', '#/arbeit': 'klassenarbeit', '#/eltern': 'elternbereich', '#/einstellungen': 'einstellungen' };
/** Ort eines angetippten Elements: Fußzeile, gesperrter Inhalt („gehört zu Pro“), sonst nach Seite; Standard lernstand. */
export function ortVon(el, hash = globalThis.location?.hash || '') {
  if (el?.closest?.('footer')) return 'fusszeile';
  if (el?.closest?.('[data-ort]')) return el.closest('[data-ort]').dataset.ort;
  if (el?.closest?.('#b-tor, .gesperrt, .note.tip')) return 'gesperrt';
  return SEITE_ORT[(String(hash).match(/^#\/[a-z]+/) || [''])[0]] || 'lernstand';
}
/** Link zur Website/zum Shop mit Herkunft (src, thema, klasse). */
export function linkMitHerkunft(href, ort, { thema = '', klasse = '' } = {}) {
  try {
    const u = new URL(href);
    if (!/(^|\.)mathenachhilfe-online\.com$/.test(u.hostname)) return href;
    u.searchParams.set('src', `mathetrainer-${ORTE.includes(ort) ? ort : 'lernstand'}`);
    if (THEMEN.includes(thema)) u.searchParams.set('thema', thema);
    if (/^(5|6|7|8|9|10|11|12|13)$/.test(String(klasse))) u.searchParams.set('klasse', String(klasse));
    return u.toString();
  } catch { return href; }
}
/** Übersicht aller Lern-Apps (Website). Test-Stufe → staging, sonst www. Gleicher Tab, Herkunft src=mathetrainer-kopf. */
export function alleAppsLink(host = globalThis.location?.hostname || '') {
  const basis = /^(trainer-test\.|localhost$|127\.)/.test(host) ? 'https://staging.mathenachhilfe-online.com' : 'https://www.mathenachhilfe-online.com';
  return linkMitHerkunft(`${basis}/lern-apps/`, 'kopf');
}
/** Knopf „← Alle Apps“ – nur auf Start und Übersicht, nie in Aufgaben, Prüfungen oder Spielen. */
export const alleAppsKnopf = () => `<a class="alle-apps nur-web" data-ort="kopf" href="${alleAppsLink()}">← Alle Apps</a>`;
/** Welches Ereignis gehört zu einem Link? */
export function ereignisFuer(href) {
  const h = String(href || '');
  if (h.startsWith(CONFIG.probestunde) || /\/probestunde(-anfrage)?\//.test(h)) return 'probestunde_klick';
  if (/neukunde/.test(h)) return 'neukunde_klick';
  if (/crashkurs/.test(h)) return 'crashkurs_klick';
  if (/geschenk/.test(h)) return 'geschenk_klick';
  if (/\/produkt\/|\/shop\/|warenkorb|kasse/.test(h)) return 'pro_kasse';
  return '';
}

/**
 * Einmal beim Start: zählt „start“ und hört auf Antippen von Links (Website, Shop, Pro-Info).
 * kontext() liefert { thema, klasse, unitTitel, ober } der aktuellen Seite.
 */
export function zaehlungStarten(kontext = () => ({}), w = globalThis.window) {
  if (!w?.document?.addEventListener) return;
  zaehle('start');
  w.document.addEventListener('click', (e) => {
    const a = e.target?.closest?.('a[href]'); if (!a) return;
    const href = a.getAttribute('href') || '', ort = ortVon(a, w.location.hash);
    if (href === '#/pro' || href.startsWith('#/pro')) { zaehle('pro_ansehen', ['gesperrt', 'elternbereich', 'lernstand'].includes(ort) ? ort : 'lernstand'); return; }
    if (!/^https:\/\/(www\.)?mathenachhilfe-online\.com/.test(href)) return;
    const k = kontext() || {}, thema = k.unitTitel ? themaVon(k.unitTitel, k.ober) : '';
    a.href = linkMitHerkunft(href, ort, { thema, klasse: k.klasse });   // vor dem Öffnen – der Browser nimmt die neue Adresse
    const ev = ereignisFuer(href); if (ev) zaehle(ev, ort, thema);
  }, true);
}
/** Nachhilfe-Hinweise zählen, sobald sie erscheinen (Elemente .promo bzw. [data-hinweis] mit Probestunden-Link), jeden nur einmal. */
export function hinweiseBeobachten(w = globalThis.window) {
  if (typeof w?.MutationObserver !== 'function') return;
  const gesehen = new WeakSet();
  const pruefe = () => w.document.querySelectorAll('.promo, [data-hinweis]').forEach((el) => {
    if (gesehen.has(el) || !el.querySelector('a[href*="probestunde"]') || !el.isConnected || el.closest('[hidden]')) return;
    gesehen.add(el); zaehle('nachhilfe_hinweis', el.dataset.hinweis || ortVon(el, w.location.hash));
  });
  new w.MutationObserver(pruefe).observe(w.document.body, { childList: true, subtree: true }); pruefe();
}
