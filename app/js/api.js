// Verbindung zum Server-Teil (Klassen-Bestenliste, später Liga und KI). Ohne Server ist alles hier abgeschaltet:
// CONFIG.api ist dann leer, und die App zeigt die Server-Funktionen gar nicht erst an.
// Vertrag (Adressen, Felder, Regeln): docs/SERVER.md und docs/KI.md.
import { serverBasis } from './ort.js';
import { CONFIG } from './config.js';
import { store } from './store.js';

export const serverOn = () => typeof CONFIG.api === 'string' && CONFIG.api.length > 0;
let stufe = '', kiServer = false, premium = false, arten = [];   // was der Server über sich sagt
const kiEin = () => CONFIG.ki === true || CONFIG.ki === 'test';
export const kiOn = () => serverOn() && ((CONFIG.ki === true && kiServer) || (CONFIG.ki === 'test' && stufe === 'test'));
/** Verkauft der Server schon Zugänge? Erst dann zeigt die App das Feld „Zugangscode“. */
export const premiumOn = () => serverOn() && kiEin() && premium;
/** Antwort von GET /api/status auswerten. Nur „Testseite und KI bereit“ schaltet bei ki: 'test' die Erklärungen frei. */
export const statusLesen = (r) => { const gut = !!r && r.ok === true; kiServer = gut && r.ki === true; stufe = kiServer && r.stufe === 'test' ? 'test' : ''; premium = gut && r.premium === true;
  arten = gut && Array.isArray(r.kiArten) ? r.kiArten.filter((x) => typeof x === 'string') : [];
  return stufe; };
/** Kann der Server diese KI-Funktion schon? (z. B. 'frage' = Rückfragen an den Tutor) */
export const kiArt = (name) => kiOn() && arten.includes(name);
let gefragt = null;
/** Den Server höchstens einmal je Sitzung nach seinem Stand fragen – und erst dann, wenn es jemand braucht
 *  (hängt an einer Aufgabe, öffnet die Einstellungen). Wer nur spielt, löst keine Anfrage aus. Bei Netzfehler wird später neu gefragt. */
function status() {
  if (!serverOn() || !kiEin()) return Promise.resolve();
  gefragt ??= call('/status').then((r) => { if (r.ok !== true) gefragt = null; statusLesen(r); });
  return gefragt;
}
/** Sind KI-Erklärungen hier erlaubt? */
export const kiBereit = () => status().then(kiOn);
/** Gibt es hier schon Zugänge zu kaufen bzw. einzulösen? */
export const premiumBereit = () => status().then(premiumOn);
/** Zugangscode in die Form MT-XXXX-XXXX-XXXX bringen (Groß/klein, Leerzeichen und Striche egal). Leer, wenn er nicht passt. */
export function codeNorm(s) {
  const t = String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  return /^MT[A-Z0-9]{12}$/.test(t) ? `MT-${t.slice(2, 6)}-${t.slice(6, 10)}-${t.slice(10, 14)}` : '';
}
/** Verweise nach einem „gehört zu Pro“-Hinweis: Code-Feld (sobald es Zugänge gibt) und – außer in der Android-App – die Website. */
/* KI dazubuchen (Leitstand, 17.11.2026): Pro ohne KI zahlt die Differenz, derselbe Code bekommt KI dazu – gleiche Laufzeit.
   Nur in der Web-App: In der Android-App gibt es keinen Kauf außerhalb des Stores (Marcel/Play-Richtlinie). */
export const KI_UPGRADE = 'https://www.mathenachhilfe-online.com/produkt/mathe-trainer-ki-upgrade/';
const inApp = () => typeof window !== 'undefined' && !!window.MTApp;
/** Gültiges „Pro“ ohne KI – hier kann KI dazugebucht werden. */
export const proOhneKi = () => store.zugangGilt() && store.zugang?.ki === false;
/** Knopf „KI dazubuchen“ (leer in der Android-App und ohne gültiges Pro ohne KI). */
export const kiDazuKnopf = (klasse = 'btn small') => (store.jahrgang === 'os' && proOhneKi() && !inApp() && codeNorm(store.zugang.code)
  ? `<a class="${klasse} ki-dazu" href="${KI_UPGRADE}?code=${encodeURIComponent(codeNorm(store.zugang.code))}" target="_blank" rel="noopener">KI dazubuchen ↗</a>` : '');
let zuletztGeprueft = 0;
/** Hat der Shop KI für den eigenen Code freigeschaltet? Fragt POST /zugang erneut (höchstens alle 20 s, nur bei Pro ohne KI).
 *  Liefert true, wenn KI eben freigeschaltet wurde (dann ist store.zugang schon aktualisiert). */
export async function kiNachpruefen() {
  if (!proOhneKi() || !serverOn() || Date.now() - zuletztGeprueft < 20000) return false;
  zuletztGeprueft = Date.now();
  const z = store.zugang, r = await call('/zugang', { code: z.code });
  if (!r.ok || r.ki === false || store.zugang?.code !== z.code) return false;
  store.zugang = { ...z, ki: true, ...(/^\d{4}-\d{2}-\d{2}$/.test(r.bis || '') ? { bis: r.bis } : {}), ...(r.art ? { art: String(r.art) } : {}) };
  try { window.dispatchEvent(new Event('mt-ruhig')); } catch { /* ohne Fenster */ }
  return true;
}
export const kaufLinks = () => (store.jahrgang !== 'os' ? '' : proOhneKi() ? (inApp() ? '' : ` ${kiDazuKnopf('btn small line')}`) : `${premiumOn() ? ' <a href="#/einstellungen">Zugangscode eingeben</a>' : ''}${typeof window !== 'undefined' && window.MTApp ? '' : ` <a href="${CONFIG.shop}" target="_blank" rel="noopener">Pro holen</a>`}`);
export const ZUGANG_ART = { pass: 'Abi-Pass', tage30: '30-Tage-Pass', frei: 'Freier Zugang' };

/** Übrige KI-Punkte von heute: der letzte Stand, den der Server gemeldet hat (null = heute noch keiner gemeldet). */
const REST_KEY = 'mathetrainer.kirest', heute = () => new Date().toLocaleDateString('sv-SE');
const kiRestLesen = () => { try { const r = JSON.parse(localStorage.getItem(REST_KEY) || 'null'); return r && r.tag === heute() ? r : null; } catch { return null; } };
function kiRestMerken(rest, limit) {
  const alt = kiRestLesen(), lim = Number.isInteger(limit) && limit > 0 ? limit : alt?.limit;
  try { localStorage.setItem(REST_KEY, JSON.stringify({ tag: heute(), rest, ...(lim ? { limit: lim } : {}), ...(alt?.zeit ? { zeit: alt.zeit } : {}) })); } catch { /* egal */ }
  try { window.dispatchEvent(new Event('mt-kirest')); } catch { /* ohne Fenster */ }
}
export function kiRestHeute() { const r = kiRestLesen(); return r && Number.isInteger(r.rest) ? r.rest : null; }
/** Tageslimit des Zugangs, wie es der Server zuletzt gemeldet hat (alte Codes: 15) – null = unbekannt. */
export function kiLimitHeute() { const r = kiRestLesen(); return r && Number.isInteger(r.limit) ? r.limit : null; }
/** Übrige KI-Punkte beim Server nachfragen (POST /ki/rest – verbraucht nichts). Höchstens einmal je Stunde, nur mit gültigem Pro + KI.
 *  zugang: der Zugangscode, geraet: die Gerätekennung. Meldet sich über das Ereignis „mt-kirest“. */
export async function kiRestHolen(zugang, geraet) {
  if (!zugang || !kiEin()) return;
  const r = kiRestLesen();
  if (r?.zeit && Date.now() - r.zeit < 3600e3) return;
  try { localStorage.setItem(REST_KEY, JSON.stringify({ ...(r || { tag: heute() }), zeit: Date.now() })); } catch { /* egal */ }
  await call('/ki/rest', { zugang, geraet });
}

async function call(path, body) {
  if (!serverOn()) return { ok: false, off: true };
  try {
    const res = await fetch(`${serverBasis()}${CONFIG.api}${path}`, body === undefined ? { headers: { Accept: 'application/json' } }
      : { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (path === '/ki/rest') { if (res.ok && Number.isInteger(data.rest) && data.rest >= 0) kiRestMerken(data.rest, data.limit); }   // 429 heißt hier nur „zu oft gefragt“
    else if (path.startsWith('/ki/')) { if (res.ok && Number.isInteger(data.rest) && data.rest >= 0 && data.art !== 'probe') kiRestMerken(data.rest); else if (res.status === 429) kiRestMerken(0); }
    return res.ok ? { ok: true, ...data } : { ok: false, status: res.status, error: data.error || 'Der Server hat die Anfrage abgelehnt.' };
  } catch { return { ok: false, error: 'Keine Verbindung zum Server.' }; }
}

/** Spitzname: 2–16 Zeichen, Buchstaben/Ziffern/Leerzeichen/._- (kein Klarname nötig). */
export const nameOk = (s) => /^[\p{L}\p{N} ._-]{2,16}$/u.test(String(s || '').trim());
/** Klassen-Code: 6 Zeichen aus A–Z und 2–9 (ohne verwechselbare Zeichen). */
export const codeOk = (s) => /^[A-HJ-NP-Z2-9]{6}$/.test(String(s || '').trim().toUpperCase());

export const api = {
  /** Klasse anlegen → { code } */
  klasseNeu: (name) => call('/klasse', { name }),
  /** Klasse beitreten → { klasse, spieler } (spieler = zufällige Kennung, kein Konto) */
  beitreten: (code, name) => call('/klasse/beitreten', { code: String(code).trim().toUpperCase(), name: String(name).trim() }),
  /** Klasse verlassen → { ok } (der Server löscht den Eintrag des Spielers) */
  verlassen: (code, spieler) => call('/klasse/verlassen', { code, spieler }),
  /** Ergebnis melden. Der Server rechnet die Runde aus dem Startwert nach (siehe docs/SERVER.md). */
  melden: (r) => call('/ergebnis', r),
  /** Rangliste → { woche, liste: [{ name, punkte, ich }] } */
  rangliste: (code, spieler) => call(`/klasse/${encodeURIComponent(code)}/rangliste?spieler=${encodeURIComponent(spieler || '')}`),
  /** KI: Erklärung in anderen Worten → { text, rest, art: 'zugang'|'probe' }; 402 = Proben verbraucht, 429 = Limit */
  erklaer: (q) => call('/ki/erklaer', q),
  /** KI-Tutor: Rückfrage zur selben Aufgabe → { text, rest }; 402 { grund: 'pro' } = braucht „Pro + KI“, 429 = Tagesguthaben verbraucht */
  frage: (q) => call('/ki/frage', q),
  /** KI: Rechenweg prüfen (Foto als JPEG-base64 oder Text) → { text, rest, zeile? }; 402 { grund: 'pro' }, 429 */
  rechenweg: (q) => call('/ki/rechenweg', q),
  /** KI: Auswertung eines gelösten Blatts → { text, rest }; 402 { grund: 'pro' }, 429 */
  auswertung: (q) => call('/ki/auswertung', q),
  /** Zugangscode prüfen → { art: 'pass'|'tage30'|'frei', bis: 'JJJJ-MM-TT' }; 404 = unbekannt oder abgelaufen */
  zugang: (code) => call('/zugang', { code }),
  /** KI: neue, vom Server nachgerechnete Aufgabe → { aufgabe } */
  aufgabe: (wunsch) => call('/ki/aufgabe', wunsch),
  /** Eine Aufgabe hat die Prüfung im Gerät nicht bestanden: Der Server nimmt sie aus dem Vorrat und gibt den KI-Punkt zurück. */
  aufgabeAbgelehnt: (q) => call('/ki/aufgabe/abgelehnt', q),
};
