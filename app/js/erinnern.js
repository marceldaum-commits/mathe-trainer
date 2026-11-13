// Erinnerung aufs Handy (Web-Push). Vorbereitet und abgeschaltet: Sie braucht den öffentlichen Schlüssel des Servers
// (CONFIG.push) und die Gegenstelle POST /api/push – siehe docs/SERVER.md. Ohne Schlüssel erscheint in der App nichts davon.
import { CONFIG } from './config.js';
import { store } from './store.js';

export const pushOn = () => typeof CONFIG.push === 'string' && CONFIG.push.length > 20 && typeof CONFIG.api === 'string' && CONFIG.api.length > 0;
/** Kann dieses Gerät Mitteilungen empfangen? (iPhone: nur als installierte App.) */
export const pushCan = () => typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
/** Öffentlichen Schlüssel (base64url) in Bytes umwandeln. */
export function keyBytes(b64) {
  const s = atob(String(b64).replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(b64.length / 4) * 4, '='));
  return Uint8Array.from(s, (ch) => ch.charCodeAt(0));
}
export const ZEITEN = ['07:00', '15:00', '18:00', '20:00'];
const post = (path, body) => fetch(`${CONFIG.api}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

/** Einschalten: Erlaubnis einholen, Abo anlegen, dem Server melden. Liefert { ok, grund }. */
export async function pushAn(zeit) {
  if (!pushOn() || !pushCan()) return { ok: false, grund: 'Auf diesem Gerät nicht möglich.' };
  if ((await Notification.requestPermission()) !== 'granted') return { ok: false, grund: 'Mitteilungen sind im Browser nicht erlaubt.' };
  try {
    const reg = await navigator.serviceWorker.ready;
    const abo = (await reg.pushManager.getSubscription()) || (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(CONFIG.push) }));
    const res = await post('/push', { abo: abo.toJSON(), zeit: ZEITEN.includes(zeit) ? zeit : '18:00' });
    if (!res.ok) return { ok: false, grund: 'Der Server hat die Anmeldung abgelehnt.' };
    store.erinnern = { zeit }; return { ok: true };
  } catch { return { ok: false, grund: 'Anmeldung nicht möglich. Bitte später noch einmal versuchen.' }; }
}
/** Ausschalten: Abo beim Server abmelden und im Gerät löschen. */
export async function pushAus() {
  try {
    const reg = await navigator.serviceWorker.ready, abo = await reg.pushManager.getSubscription();
    if (abo) { await post('/push/aus', { endpoint: abo.endpoint }).catch(() => {}); await abo.unsubscribe(); }
  } catch { /* im Gerät trotzdem ausschalten */ }
  store.erinnern = null;
}
