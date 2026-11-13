// Verbindung zum Server-Teil (Klassen-Bestenliste, später Liga und KI). Ohne Server ist alles hier abgeschaltet:
// CONFIG.api ist dann leer, und die App zeigt die Server-Funktionen gar nicht erst an.
// Vertrag (Adressen, Felder, Regeln): docs/SERVER.md und docs/KI.md.
import { CONFIG } from './config.js';

export const serverOn = () => typeof CONFIG.api === 'string' && CONFIG.api.length > 0;
export const kiOn = () => serverOn() && CONFIG.ki === true;

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
  /** KI: Erklärung in anderen Worten → { text } */
  erklaer: (q) => call('/ki/erklaer', q),
  /** KI: neue, vom Server nachgerechnete Aufgabe → { aufgabe } */
  aufgabe: (wunsch) => call('/ki/aufgabe', wunsch),
};
