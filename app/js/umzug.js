// Umzug auf die gemeinsame Adresse lernen.mathenachhilfe-online.com/mathetrainer/ (Marcel 19.11.2026,
// Standard docs/plattform/appzentrale/UMZUG-LERNEN.md im Repo website_backup).
// Dieselbe Version läuft auf der alten und der neuen Adresse:
//  • alt (trainer. / trainer-test.): eigene Schlüssel einsammeln, verschlüsseln (AES-GCM-256, neuer Zufallsschlüssel),
//    als Einmal-Sicherung PUT /eltern/v1/s/<id> ablegen, eigenen Service Worker abmelden, weiterleiten mit #umzug=<id>.<key>
//    (#umzug=<id>.<key>.<schreib>; bisheriger Hash wie #/u/… oder #pro=… bleibt, mit „&“ angehängt). Ohne Lernstand: ohne #umzug.
//    Bei einem Fehler NICHT weiterleiten – beim nächsten Start wird es erneut versucht (Standard, bestätigt vom Leitstand).
//    Weitergeleitet wird nur, wenn die neue Adresse die App schon ausliefert (Bild-Probe auf eine eigene Datei).
//  • neu (lernen. / lernen-test.): look.js hat #umzug=… schon beim Laden aus der Adresse genommen (sessionStorage) und
//    vermerkt, ob hier vorher ein Lernstand lag. Holen, entschlüsseln, NUR schreiben, wenn vorher leer, dann DELETE.
// Der Schlüssel steht nur im Link-Teil nach „#“ und geht nie an einen Server.
import { alteAdresse, aufLernen, neueAdresse, serverBasis } from './ort.js';
import { b64url, b64urlLesen, verschluesseln } from './eltern.js';

export const UMZUG_AUS = true;   // NUR im Zweig rueckweg-ohne-umzug
export const MERK = 'mathetrainer-umzug';   // sessionStorage: { t: '<id>.<key>.<schreib>', leer: true|false }
const zufall = (n) => b64url(crypto.getRandomValues(new Uint8Array(n)));

/** Alle eigenen Schlüssel („mathetrainer.…“; die Eltern-Kopplung reist mit, der KI-Zähler des Tages nicht). */
export function eigeneDaten(ls = globalThis.localStorage) {
  const daten = {};
  for (let i = 0; i < ls.length; i++) {
    const name = ls.key(i);
    if (!/^mathetrainer\./.test(name) || name === 'mathetrainer.kirest') continue;
    daten[name] = ls.getItem(name);
  }
  return daten;
}

/** Neue Adresse mit Umzugs-Kennung und dem bisherigen Hash. */
export function zielAdresse(token, { ziel = neueAdresse(), search = globalThis.location?.search || '', hash = globalThis.location?.hash || '' } = {}) {
  const rest = hash.replace(/^#/, '');
  const teil = token ? `umzug=${token}${rest ? `&${rest}` : ''}` : rest;
  return `${ziel}${search}${teil ? `#${teil}` : ''}`;
}

/** Liefert die neue Adresse die App schon aus? Bild-Probe auf eine eigene Datei (geht ohne CORS, 404 → Fehler). */
export function zielBereit(ziel = neueAdresse(), Bild = globalThis.Image, ms = 8000) {
  return new Promise((ok) => {
    if (typeof Bild !== 'function') return ok(false);
    const img = new Bild(); const t = setTimeout(() => ok(false), ms);
    img.onload = () => { clearTimeout(t); ok(true); };
    img.onerror = () => { clearTimeout(t); ok(false); };
    img.src = `${ziel}img/icon-192.png?umzug=${Date.now()}`;
  });
}

/** Einmal-Sicherung ablegen (Body text/plain „<iv>.<ct>“). Liefert '<id>.<key>.<schreib>' oder '' (kein Lernstand) – wirft bei Fehlern. */
export async function einpacken({ ls = globalThis.localStorage, f = globalThis.fetch } = {}) {
  const daten = eigeneDaten(ls);
  if (!daten['mathetrainer.v1']) return '';
  const id = zufall(16), schreib = zufall(16), key = zufall(32);
  const body = await verschluesseln({ app: 'mathetrainer', v: 1, umzug: true, daten }, key);
  const r = await f(`${serverBasis()}/eltern/v1/s/${id}`, { method: 'PUT', headers: { 'Content-Type': 'text/plain', 'X-Schreib': schreib }, body });
  if (!(r.status === 204 || r.ok)) throw new Error(`Sicherung ${r.status}`);
  return `${id}.${key}.${schreib}`;
}

const installiert = () => { try { return globalThis.matchMedia?.('(display-mode: standalone)').matches || globalThis.navigator?.standalone === true; } catch { return false; } };

/** Alte Adresse: umziehen. hinweis(los) zeigt bei installierter App zuerst eine Erklärung mit Knopf; warten(an) den Hinweis „Wir ziehen um …“. */
export async function umziehen({ hinweis = null, warten = () => {} } = {}) {
  if (UMZUG_AUS) return 'aus';   // Rückweg-Fassung: keine Weiterleitung, Speicher-Namen bleiben „mathetrainer.…“
  if (!alteAdresse()) return 'nicht-alt';
  const ziel = neueAdresse();
  if (!(await zielBereit(ziel))) return 'ziel-fehlt';
  const los = async () => {
    warten(true);
    let token = '';
    try { token = await einpacken(); } catch { warten(false); return 'fehler'; }   // nicht weiterleiten, beim nächsten Start erneut
    try { const reg = await navigator.serviceWorker?.getRegistration?.(); await reg?.unregister(); } catch { /* nur die eigene Registrierung */ }
    location.replace(zielAdresse(token, { ziel }));
    return 'weiter';
  };
  if (installiert() && typeof hinweis === 'function') { hinweis(los); return 'hinweis'; }
  return los();
}

/** Neue Adresse: mitgebrachten Lernstand übernehmen. melde(text) zeigt eine kurze Nachricht. */
export async function empfangen({ melde = () => {}, ls = globalThis.localStorage, ss = globalThis.sessionStorage, f = globalThis.fetch, neuLaden = () => location.reload() } = {}) {
  let m = null; try { m = JSON.parse(ss.getItem(MERK) || 'null'); ss.removeItem(MERK); } catch { return 'nichts'; }
  if (!m?.t) return 'nichts';
  const [id, key, schreib] = String(m.t).split('.');
  if (!/^[\w-]{22}$/.test(id || '') || !/^[\w-]{43}$/.test(key || '') || !/^[\w-]{22}$/.test(schreib || '')) return 'ungueltig';
  const url = `${serverBasis()}/eltern/v1/s/${id}`;
  let klar;
  try {
    const r = await f(url, { cache: 'no-store' }); if (!r.ok) throw new Error(String(r.status));
    const { d } = await r.json(); const [iv, ct] = String(d).split('.');
    const k = await crypto.subtle.importKey('raw', b64urlLesen(key), { name: 'AES-GCM' }, false, ['decrypt']);
    klar = JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64urlLesen(iv) }, k, b64urlLesen(ct))));
  } catch { melde('Der Fortschritt konnte nicht mitgenommen werden. Hol ihn über „Wiederherstellen“ im Elternbereich.'); return 'netz'; }
  if (klar?.app !== 'mathetrainer' || !klar.daten || typeof klar.daten !== 'object') return 'ungueltig';
  let geschrieben = false;
  if (m.leer) {
    globalThis.__mtUmzugSperre = true;   // store.js speichert ab jetzt nicht mehr (sonst überschreibt er den mitgebrachten Stand)
    for (const [name, wert] of Object.entries(klar.daten)) if (/^mathetrainer\./.test(name) && typeof wert === 'string') ls.setItem(name, wert);
    geschrieben = true;
  }
  try { await f(url, { method: 'DELETE', headers: { 'X-Schreib': schreib } }); } catch { /* läuft serverseitig ohnehin ab */ }
  if (geschrieben) { neuLaden(); return 'uebernommen'; }
  melde('Hier gab es schon einen Lernstand – er bleibt, wie er ist.');
  return 'schon-da';
}

/** Beim Start: auf der alten Adresse umziehen, auf der neuen übernehmen. */
export function umzugBeimStart({ toast = () => {}, hinweis = null, warten = () => {} } = {}) {
  if (aufLernen()) return empfangen({ melde: toast });
  if (alteAdresse()) return umziehen({ hinweis, warten });
  return Promise.resolve('lokal');
}
