// Erinnerung aufs Handy (Web-Push), siehe docs/SERVER.md. Der Server schickt höchstens einmal am Tag eine Mitteilung ohne Inhalt;
// den Text setzt der Service Worker. Den öffentlichen Schlüssel holt die App vom Server (GET /api/push/schluessel).
import { CONFIG } from './config.js';
import { store } from './store.js';

/** Android-App (Offline-Fassung): Die Erinnerung stellt das Gerät selbst – ohne Server, ohne Internet. */
export const nativ = () => typeof window !== 'undefined' && typeof window.MTApp?.erinnerungAn === 'function';
/** Zustand aus der Android-App lesen: { an, zeit, erlaubt } – oder null, wenn die Antwort unlesbar ist. */
export function nativStand() {
  try { const s = JSON.parse(window.MTApp.erinnerungStand()); return { an: s.an === true, zeit: zeitOk(s.zeit) ? s.zeit : ZEIT_VORGABE, erlaubt: s.erlaubt === true }; } catch { return null; }
}
export const pushOn = () => nativ() || (CONFIG.push === true && typeof CONFIG.api === 'string' && CONFIG.api.length > 0);
/** Kann dieses Gerät Mitteilungen empfangen? (iPhone: nur als installierte App.) */
export const pushCan = () => nativ() || (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window);
/** Öffentlichen Schlüssel (base64url) in Bytes umwandeln. */
export function keyBytes(b64) {
  const s = atob(String(b64).replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(b64.length / 4) * 4, '='));
  return Uint8Array.from(s, (ch) => ch.charCodeAt(0));
}
/** Gültige Uhrzeit HH:MM (00:00–23:59). */
export const zeitOk = (z) => /^([01]\d|2[0-3]):[0-5]\d$/.test(String(z));
export const ZEIT_VORGABE = '18:00';
/** Sind Mitteilungen für diese Seite im Browser gesperrt? */
export const pushGesperrt = () => !nativ() && typeof Notification !== 'undefined' && Notification.permission === 'denied';
/** Schritte, um eine gesperrte Erlaubnis wieder freizugeben. */
export const SPERR_SCHRITTE = [
  ['Im Browser (Android, Chrome)', 'Links neben der Adresse auf das Schloss bzw. den Regler tippen → „Berechtigungen“ → „Benachrichtigungen“ → „Zulassen“. Danach die Seite neu laden.'],
  ['Als installierte App (Android)', 'Android-Einstellungen → „Apps“ → „Mathe-Trainer“ → „Benachrichtigungen“ einschalten.'],
  ['iPhone', 'Mitteilungen gehen nur, wenn die App auf dem Home-Bildschirm liegt: Teilen → „Zum Home-Bildschirm“, dann dort öffnen.'],
];
export const SPERR_SCHRITTE_APP = [['In der Android-App', 'Android-Einstellungen → „Apps“ → „Mathe-Trainer“ → „Benachrichtigungen“ einschalten. Danach hier noch einmal einschalten.']];
export const SPERR_HILFE = 'Mitteilungen sind für den Mathe-Trainer gesperrt.';
/** Läuft die App schon als installierte App? */
export const installiert = () => typeof window !== 'undefined' && (!!window.MTApp || window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true);
/** Wahrer Zustand: an ist die Erinnerung nur, wenn der Browser es erlaubt UND das Gerät noch angemeldet ist. */
export async function pushStand() {
  const zeit = zeitOk(store.erinnern?.zeit) ? store.erinnern.zeit : ZEIT_VORGABE;
  if (nativ()) {
    const s = nativStand() || { an: false, zeit, erlaubt: true };
    if (!!store.erinnern?.an !== s.an || store.erinnern?.zeit !== s.zeit) store.erinnern = { zeit: s.zeit, an: s.an };
    return { an: s.an, zeit: s.zeit, kann: true, gesperrt: false };
  }
  if (!pushOn() || !pushCan()) return { an: false, zeit, kann: false, gesperrt: false };
  let abo = null;
  try { abo = Notification.permission === 'granted' ? await (await bereit()).pushManager.getSubscription() : null; } catch { abo = null; }
  const an = !!abo;
  if (!!store.erinnern?.an !== an) store.erinnern = { zeit, an };   // Speicher dem wahren Zustand angleichen (z. B. wenn der Browser die Anmeldung gelöscht hat)
  return { an, zeit, kann: true, gesperrt: pushGesperrt() };
}
/** Service Worker abwarten – aber nicht ewig (ohne ihn gibt es keine Mitteilungen). */
function bereit() { return Promise.race([navigator.serviceWorker.ready, new Promise((_, no) => setTimeout(() => no(new Error('kein Service Worker')), 5000))]); }
const post = (path, body) => fetch(`${CONFIG.api}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

/** Einschalten oder Uhrzeit ändern: Erlaubnis einholen, Abo anlegen, dem Server melden. Liefert { ok, grund, gesperrt? }. */
export async function pushAn(zeit) {
  if (nativ()) {
    if (!zeitOk(zeit)) return { ok: false, grund: 'Bitte eine Uhrzeit wählen.' };
    let r = window.MTApp.erinnerungAn(zeit);
    if (r === 'frage') {   // Android fragt nach der Erlaubnis – auf die Antwort warten (höchstens zwei Minuten)
      await new Promise((ok) => { const fertig = () => { window.removeEventListener('mt-erinnerung', fertig); ok(); }; window.addEventListener('mt-erinnerung', fertig); setTimeout(fertig, 120000); });
      r = nativStand()?.an ? 'ok' : 'gesperrt';
    }
    if (r !== 'ok') return { ok: false, gesperrt: true, grund: SPERR_HILFE };
    store.erinnern = { zeit, an: true }; return { ok: true };
  }
  if (!pushOn() || !pushCan()) return { ok: false, grund: 'Auf diesem Gerät nicht möglich.' };
  if (!zeitOk(zeit)) return { ok: false, grund: 'Bitte eine Uhrzeit wählen.' };
  if (pushGesperrt() || (await Notification.requestPermission()) !== 'granted') return pushGesperrt() ? { ok: false, gesperrt: true, grund: SPERR_HILFE } : { ok: false, grund: 'Ohne deine Erlaubnis kann die App keine Mitteilung schicken. Tippe noch einmal auf „Erinnern“ und wähle „Zulassen“.' };
  try {
    const reg = await bereit();
    let abo = await reg.pushManager.getSubscription();
    if (!abo) {
      const k = await (await fetch(`${CONFIG.api}/push/schluessel`, { headers: { Accept: 'application/json' } })).json();
      if (typeof k?.key !== 'string' || k.key.length < 20) return { ok: false, grund: 'Der Server hat keinen Schlüssel geliefert.' };
      abo = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(k.key) });
    }
    const res = await post('/push', { abo: abo.toJSON(), zeit });
    if (!res.ok) return { ok: false, grund: res.status === 429 ? 'Zu viele Versuche. Bitte später noch einmal.' : 'Der Server hat die Anmeldung abgelehnt.' };
    store.erinnern = { zeit, an: true }; return { ok: true };
  } catch { return { ok: false, grund: 'Anmeldung nicht möglich. Bitte später noch einmal versuchen.' }; }
}
/** Ausschalten: Abo beim Server abmelden und im Gerät löschen. */
export async function pushAus() {
  if (nativ()) { window.MTApp.erinnerungAus(); store.erinnern = { zeit: zeitOk(store.erinnern?.zeit) ? store.erinnern.zeit : ZEIT_VORGABE, an: false }; return; }
  try {
    const reg = await bereit(), abo = await reg.pushManager.getSubscription();
    if (abo) { await post('/push/aus', { endpoint: abo.endpoint }).catch(() => {}); await abo.unsubscribe(); }
  } catch { /* im Gerät trotzdem ausschalten */ }
  store.erinnern = { zeit: zeitOk(store.erinnern?.zeit) ? store.erinnern.zeit : ZEIT_VORGABE, an: false };
}
