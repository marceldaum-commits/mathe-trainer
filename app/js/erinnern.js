// Erinnerung aufs Handy (Web-Push), siehe docs/SERVER.md. Der Server schickt höchstens einmal am Tag eine Mitteilung ohne Inhalt;
// den Text setzt der Service Worker. Den öffentlichen Schlüssel holt die App vom Server (GET /api/push/schluessel).
import { CONFIG } from './config.js';
import { store } from './store.js';

export const pushOn = () => CONFIG.push === true && typeof CONFIG.api === 'string' && CONFIG.api.length > 0;
/** Kann dieses Gerät Mitteilungen empfangen? (iPhone: nur als installierte App.) */
export const pushCan = () => typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
/** Öffentlichen Schlüssel (base64url) in Bytes umwandeln. */
export function keyBytes(b64) {
  const s = atob(String(b64).replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(b64.length / 4) * 4, '='));
  return Uint8Array.from(s, (ch) => ch.charCodeAt(0));
}
/** Gültige Uhrzeit HH:MM (00:00–23:59). */
export const zeitOk = (z) => /^([01]\d|2[0-3]):[0-5]\d$/.test(String(z));
export const ZEIT_VORGABE = '18:00';
/** Sind Mitteilungen für diese Seite im Browser gesperrt? */
export const pushGesperrt = () => typeof Notification !== 'undefined' && Notification.permission === 'denied';
/** Erklärt, wie man eine gesperrte Erlaubnis wieder aufhebt. */
export const SPERR_HILFE = 'Mitteilungen sind für diese Seite gesperrt. So hebst du die Sperre auf: Auf Android in Chrome links neben der Adresse auf das Schloss bzw. den Regler tippen → Berechtigungen → Benachrichtigungen → Zulassen, dann die Seite neu laden. Auf dem iPhone: die App zum Home-Bildschirm hinzufügen und dort öffnen.';
/** Service Worker abwarten – aber nicht ewig (ohne ihn gibt es keine Mitteilungen). */
const bereit = () => Promise.race([navigator.serviceWorker.ready, new Promise((_, no) => setTimeout(() => no(new Error('kein Service Worker')), 5000))]);
const post = (path, body) => fetch(`${CONFIG.api}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

/** Einschalten oder Uhrzeit ändern: Erlaubnis einholen, Abo anlegen, dem Server melden. Liefert { ok, grund, gesperrt? }. */
export async function pushAn(zeit) {
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
    store.erinnern = { zeit }; return { ok: true };
  } catch { return { ok: false, grund: 'Anmeldung nicht möglich. Bitte später noch einmal versuchen.' }; }
}
/** Ausschalten: Abo beim Server abmelden und im Gerät löschen. */
export async function pushAus() {
  try {
    const reg = await bereit(), abo = await reg.pushManager.getSubscription();
    if (abo) { await post('/push/aus', { endpoint: abo.endpoint }).catch(() => {}); await abo.unsubscribe(); }
  } catch { /* im Gerät trotzdem ausschalten */ }
  store.erinnern = null;
}
