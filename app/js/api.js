// Verbindung zum Server-Teil (Klassen-Bestenliste, später Liga und KI). Ohne Server ist alles hier abgeschaltet:
// CONFIG.api ist dann leer, und die App zeigt die Server-Funktionen gar nicht erst an.
// Vertrag (Adressen, Felder, Regeln): docs/SERVER.md und docs/KI.md.
import { CONFIG } from './config.js';

export const serverOn = () => typeof CONFIG.api === 'string' && CONFIG.api.length > 0;
let stufe = '', premium = false, arten = [];   // was der Server über sich sagt
const kiEin = () => CONFIG.ki === true || CONFIG.ki === 'test';
export const kiOn = () => serverOn() && (CONFIG.ki === true || (CONFIG.ki === 'test' && stufe === 'test'));
/** Verkauft der Server schon Zugänge? Erst dann zeigt die App das Feld „Zugangscode“. */
export const premiumOn = () => serverOn() && kiEin() && premium;
/** Antwort von GET /api/status auswerten. Nur „Testseite und KI bereit“ schaltet bei ki: 'test' die Erklärungen frei. */
export const statusLesen = (r) => { const gut = !!r && r.ok === true; stufe = gut && r.ki === true && r.stufe === 'test' ? 'test' : ''; premium = gut && r.premium === true;
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
export const ZUGANG_ART = { pass: 'Abi-Pass', tage30: '30-Tage-Pass', frei: 'Freier Zugang' };

async function call(path, body) {
  if (!serverOn()) return { ok: false, off: true };
  try {
    const res = await fetch(`${CONFIG.api}${path}`, body === undefined ? { headers: { Accept: 'application/json' } }
      : { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
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
  /** Zugangscode prüfen → { art: 'pass'|'tage30'|'frei', bis: 'JJJJ-MM-TT' }; 404 = unbekannt oder abgelaufen */
  zugang: (code) => call('/zugang', { code }),
  /** KI: neue, vom Server nachgerechnete Aufgabe → { aufgabe } */
  aufgabe: (wunsch) => call('/ki/aufgabe', wunsch),
};
