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
export const ZEITEN = ['07:00', '15:00', '18:00', '20:00'];
/** Service Worker abwarten – aber nicht ewig (ohne ihn gibt es keine Mitteilungen). */
const bereit = () => Promise.race([navigator.serviceWorker.ready, new Promise((_, no) => setTimeout(() => no(new Error('kein Service Worker')), 5000))]);
const post = (path, body) => fetch(`${CONFIG.api}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

/** Einschalten: Erlaubnis einholen, Abo anlegen, dem Server melden. Liefert { ok, grund }. */
export async function pushAn(zeit) {
  if (!pushOn() || !pushCan()) return { ok: false, grund: 'Auf diesem Gerät nicht möglich.' };
  if ((await Notification.requestPermission()) !== 'granted') return { ok: false, grund: 'Mitteilungen sind im Browser nicht erlaubt.' };
  try {
    const reg = await bereit();
    let abo = await reg.pushManager.getSubscription();
    if (!abo) {
      const k = await (await fetch(`${CONFIG.api}/push/schluessel`, { headers: { Accept: 'application/json' } })).json();
      if (typeof k?.key !== 'string' || k.key.length < 20) return { ok: false, grund: 'Der Server hat keinen Schlüssel geliefert.' };
      abo = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(k.key) });
    }
    const res = await post('/push', { abo: abo.toJSON(), zeit: ZEITEN.includes(zeit) ? zeit : '18:00' });
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
