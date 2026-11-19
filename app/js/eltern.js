// Eltern-Handy koppeln (Marcel, 18.11.2026): Eltern sehen auf ihrem eigenen Handy Fortschritt und Problemstellen –
// ohne Konto, Ende-zu-Ende verschlüsselt. Server und Eltern-Seite (/eltern-bericht/) baut der Leitstand; hier der App-Teil.
// • Koppeln: id (16 Byte), schreib (16 Byte) und key (32 Byte) entstehen mit crypto.getRandomValues und bleiben nur im Gerät.
//   Der Link für die Eltern trägt id und key hinter dem # – der Teil hinter dem # geht nie an einen Server.
// • Senden: nach einer Lern-Sitzung (höchstens alle 10 Minuten) den Bericht als JSON bauen, mit AES-GCM-256 (12-Byte-IV)
//   verschlüsseln und per PUT /eltern/v1/b/<id> (Kopfzeile X-Schreib) hochladen. Der Server sieht nur Zufallszeichen.
// • Aufheben: DELETE mit X-Schreib; danach ist der Bericht weg und die Kopplung im Gerät gelöscht.
// • Sicherung (Marcel 18.11.: „Verschlüsselte Sicherung über die Kopplung“): Zusammen mit dem Bericht – nur bei Änderung –
//   der ganze Lernstand mit DEMSELBEN Schlüssel verschlüsselt per PUT /eltern/v1/s/<id>. Wiederherstellen auf einem neuen Gerät
//   über den Kopplungs-Link (GET /eltern/v1/s/<id>); „schreib“ steht nur IN der verschlüsselten Sicherung.
// Im Bericht steht nichts außer Lernstand und – nur wenn eingetragen – ein Spitzname. Keine weiteren Personendaten, keine Geräte-Kennung.
import { serverBasis, istTest } from './ort.js';
import { store, dayKey } from './store.js';
import { UNITS, AREAS, ALLE_UNITS, jgName, istOber } from './units.js';

const SPEICHER = 'mathetrainer.eltern', ABSTAND = 10 * 60 * 1000, MAX_BYTES = 24 * 1024, MAX_SICHERUNG = 512 * 1024;
import { VERSION } from './config.js';
/** Bytes → base64url ohne Auffüllzeichen. */
export const b64url = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
export const b64urlLesen = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), (c) => c.charCodeAt(0));
const zufall = (n) => b64url(crypto.getRandomValues(new Uint8Array(n)));

/** Gespeicherte Kopplung oder null. */
export function kopplung() {
  try {
    const k = JSON.parse(localStorage.getItem(SPEICHER) || 'null');
    return k && /^[\w-]{22}$/.test(k.id) && /^[\w-]{22}$/.test(k.schreib) && /^[\w-]{43}$/.test(k.key) ? k : null;
  } catch { return null; }
}
const merke = (k) => { try { if (k) localStorage.setItem(SPEICHER, JSON.stringify(k)); else localStorage.removeItem(SPEICHER); } catch { /* ohne Speicher */ } };

/** Neue Kopplung anlegen (id 22, schreib 22, key 43 Zeichen). name: optionaler Spitzname (höchstens 20 Zeichen). */
export function koppeln(name = '') {
  const k = { id: zufall(16), schreib: zufall(16), key: zufall(32), name: String(name).trim().slice(0, 20), seit: new Date().toISOString(), gesendet: '', fehler: '' };
  merke(k); return k;
}
/** Wo die Eltern-Seite liegt: Test-Stufe → staging, sonst die Website. */
export function elternBasis(host = globalThis.location?.hostname || '') {
  return istTest(host) ? 'https://staging.mathenachhilfe-online.com/eltern-bericht/' : 'https://www.mathenachhilfe-online.com/eltern-bericht/';
}
export const elternLink = (k = kopplung()) => (k ? `${elternBasis()}#${k.id}.${k.key}` : '');

/* ───────────── Bericht ───────────── */
/** Thema aus der gemeinsamen Liste der Apps (Leitstand 18.11.2026; nur diese Kennungen zählen), grob nach Stichworten im Titel. */
export const THEMEN = ['grundrechenarten', 'einmaleins', 'brueche', 'dezimalzahlen', 'prozent', 'zuordnungen', 'terme-gleichungen', 'lineare-funktionen', 'gleichungssysteme', 'pythagoras',
  'quadratische-funktionen', 'potenzen-wurzeln', 'exponential-log', 'trigonometrie', 'geometrie', 'vektoren', 'analysis', 'stochastik', 'negative-zahlen', 'potenzen', 'runden', 'einheiten',
  'teilbarkeit', 'terme', 'gleichungen', 'funktionen', 'sachaufgaben', 'dreisatz', 'wahrscheinlichkeit', 'statistik', 'folgen'];
export function themaVon(text, ober = true) {
  const t = String(text).toLowerCase(), ist = (re) => re.test(t);
  if (ist(/expon|e-funktion|\bln\b|logarith|wachstum|zerfall|halbwert/)) return 'exponential-log';
  if (ober) {
    if (ist(/vektor|ebene|gerade|abstand|skalar|kreuz|hesse|spiegel|kugel|windschief|im raum|mittelpunkt|parameter/)) return 'vektoren';
    if (ist(/wahrschein|binom|baum|zufall|erwartung|test|kombinat|vierfeld|stichprob|normalvert|hypothes|laplace|bedingt|varianz|sigma|bernoulli|kumuliert|urne|würfel/)) return 'stochastik';
    if (ist(/sinus|kosinus|trigon/)) return 'trigonometrie';
    return 'analysis';
  }
  if (ist(/binomische formel|klammer|term/)) return 'terme-gleichungen';
  if (ist(/pythagoras|kathete|hypotenuse/)) return 'pythagoras';
  if (ist(/sinus|kosinus|tangens|trigon/)) return 'trigonometrie';
  if (ist(/gleichungssystem|lgs|zwei gleichungen|einsetzungs|additions/)) return 'gleichungssysteme';
  if (ist(/parabel|quadratisch|scheitel|pq-formel|mitternacht/)) return 'quadratische-funktionen';
  if (ist(/wurzel|potenz|hochzahl|exponent/)) return 'potenzen-wurzeln';
  if (ist(/linear|steigung|gerade/)) return 'lineare-funktionen';
  if (ist(/funktion|graph|ableit|integral|extrem|monoton|tangente/)) return 'funktionen';
  if (ist(/wahrschein|zufall|baum|vierfeld|würfel|laplace|ereignis|kombinat|urne|binom/)) return 'wahrscheinlichkeit';
  if (ist(/daten|mittelwert|median|durchschnitt|diagramm|statistik|häufigkeit|boxplot|spannweite/)) return 'statistik';
  if (ist(/bruch|brüche|kürzen|erweitern|nenner/)) return 'brueche';
  if (ist(/dezimal|komma/)) return 'dezimalzahlen';
  if (ist(/prozent|zins/)) return 'prozent';
  if (ist(/dreisatz/)) return 'dreisatz';
  if (ist(/zuordnung|proportional/)) return 'zuordnungen';
  if (ist(/negativ|ganze zahl|rationale zahl|minus/)) return 'negative-zahlen';
  if (ist(/teiler|vielfach|ggt|kgv|prim|teilbar/)) return 'teilbarkeit';
  if (ist(/runden|überschlag/)) return 'runden';
  if (ist(/größe|einheit|umrechn|maßstab/)) return 'einheiten';
  if (ist(/term|gleichung|klammer|binomisch|umform/)) return 'terme-gleichungen';
  if (ist(/winkel|dreieck|kreis|fläche|körper|prisma|zylinder|kegel|quader|würfel|strahlensatz|ähnlich|umfang|volumen|koordinat|geometr|viereck|spiegel|raum|mittelpunkt|symmetr/)) return 'geometrie';
  return 'grundrechenarten';
}
const prozent = (ok, n) => (n ? Math.round((ok / n) * 100) : 0);

/** Der Bericht als Objekt (Format 1, siehe Auftrag). Pflicht: format, app, appName, stand. */
export function bericht(k = kopplung(), heute = new Date()) {
  const ober = istOber();
  const tage = store.tagLog;   // { 'JJJJ-MM-TT': { min, aufgaben, richtig } }
  const letzte7 = Array.from({ length: 7 }, (_, i) => { const d = new Date(heute); d.setDate(d.getDate() - i); return dayKey(d); });
  const woche = letzte7.map((t) => tage[t]).filter(Boolean);
  const stats = Object.entries(store.stats).map(([titel, s]) => ({ titel, ok: s.ok, n: s.ok + s.bad }));
  let aufgaben = woche.reduce((s, x) => s + x.aufgaben, 0), richtig = woche.reduce((s, x) => s + x.richtig, 0), zeitraum = 'letzte 7 Tage';
  if (!woche.length) { aufgaben = stats.reduce((s, x) => s + x.n, 0); richtig = stats.reduce((s, x) => s + x.ok, 0); zeitraum = 'bisher insgesamt'; }
  const staerken = stats.filter((s) => s.n >= 3 && s.ok / s.n >= 0.8).sort((a, b) => b.n - a.n).slice(0, 5)
    .map((s) => ({ thema: themaVon(s.titel, ober), titel: s.titel, prozent: prozent(s.ok, s.n) }));
  const schwach = store.weak(5).map((s) => ({ thema: themaVon(s.topic, ober), titel: s.topic, prozent: prozent(s.ok, s.ok + s.bad),
    tipp: `Im Mathe-Trainer „${s.topic}“ noch einmal üben – die Fehler-Kartei bringt diese Aufgaben von selbst wieder.` }));
  const fortschritt = AREAS.filter((a) => a.id !== 'pruefung').map((a) => {
    const us = UNITS.filter((u) => u.area === a.id);
    return { titel: a.title, geschafft: us.reduce((s, u) => s + store.unitProgress(u).n, 0), von: us.reduce((s, u) => s + u.steps.length, 0) };
  }).filter((f) => f.von > 0);
  const letzte = Object.keys(tage).sort().reverse().slice(0, 7).map((t) => ({ tag: t, min: tage[t].min, aufgaben: tage[t].aufgaben, richtig: tage[t].richtig }));
  const b = { format: 1, app: 'mathetrainer', appName: 'Mathe-Trainer' };
  if (k?.name) b.name = k.name;
  Object.assign(b, { klasse: jgName(store.jahrgang), stand: heute.toISOString(), zeitraum,
    lernzeitMin: woche.reduce((s, x) => s + x.min, 0), tageAktiv: woche.length, aufgaben, richtigProzent: prozent(richtig, aufgaben),
    staerken, schwach, fortschritt, letzte,
    verlauf: Object.entries(store.monate).sort(([a], [b]) => a.localeCompare(b)).slice(-12).map(([monat, m]) => ({ monat, min: m.min, aufgaben: m.aufgaben, richtigProzent: prozent(m.richtig, m.aufgaben) })) });
  const ka = store.arbeit;
  if (ka) b.klassenarbeit = { tag: ka.datum, thema: ka.units.map((id) => ALLE_UNITS.find((u) => u.id === id)?.title).filter(Boolean).slice(0, 3).join(', ') };
  b.hinweis = schwach.length ? `Am meisten Übung braucht gerade: ${schwach.slice(0, 2).map((s) => s.titel).join(' und ')}.` : aufgaben ? 'Läuft gut – weiter so.' : 'Diese Woche wurde noch nicht geübt.';
  return b;
}

/* ───────────── Verschlüsseln und senden ───────────── */
/** AES-GCM-256 mit 12-Byte-IV → „<iv b64url (16 Zeichen)>.<Geheimtext b64url>“. */
export async function verschluesseln(obj, keyB64) {
  const key = await crypto.subtle.importKey('raw', b64urlLesen(keyB64), { name: 'AES-GCM' }, false, ['encrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(obj))));
  return `${b64url(iv)}.${b64url(ct)}`;
}
const adresse = (k) => `${serverBasis()}/eltern/v1/b/${k.id}`;
const adresseS = (id) => `${serverBasis()}/eltern/v1/s/${id}`;

/* ───────────── Sicherung des Lernstands ───────────── */
/** Alles, was die App zum Weiterlernen braucht: Lernstand (mt.v1) und Einstellungen – ohne Geräte-Kennung, ohne Zwischenspeicher. */
export function sicherungDaten(ls = globalThis.localStorage) {
  const daten = {};
  for (let i = 0; i < ls.length; i++) {
    const name = ls.key(i);
    if (!/^mathetrainer\./.test(name) || ['mathetrainer.eltern', 'mathetrainer.kirest'].includes(name)) continue;
    try { daten[name] = JSON.parse(ls.getItem(name)); } catch { daten[name] = ls.getItem(name); }
  }
  if (daten['mathetrainer.v1'] && typeof daten['mathetrainer.v1'] === 'object') { const v = { ...daten['mathetrainer.v1'] }; delete v.geraet; daten['mathetrainer.v1'] = v; }
  return daten;
}
/** Zu groß? Erst Rohdaten kürzen: Läufe und Abi-Versuche auf das Nötigste, die Tagesliste auf 35 Tage (Monatssummen bleiben). */
function kuerzen(daten) {
  const v = daten['mathetrainer.v1']; if (!v || typeof v !== 'object') return daten;
  return { ...daten, 'mathetrainer.v1': { ...v, runs: (v.runs || []).slice(0, 5), exams: (v.exams || []).slice(0, 5), tage: Object.fromEntries(Object.entries(v.tage || {}).sort().slice(-35)) } };
}
const hash = async (text) => b64url(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)))).slice(0, 22);
/** Sicherung hochladen, wenn sich etwas geändert hat. 'ok' | 'gleich' | 'noch-nicht' (Server kennt sie noch nicht, 404) | 'ungueltig' | 'netz' | 'fehler'. */
export async function sichern(k = kopplung()) {
  if (!k) return 'fehler';
  let daten = sicherungDaten(); const h = await hash(JSON.stringify(daten));
  if (h === k.sicherung) return 'gleich';
  const klar = (d) => ({ format: 1, app: 'mathe-trainer', v: VERSION, stand: new Date().toISOString(), schreib: k.schreib, daten: d });
  let body = await verschluesseln(klar(daten), k.key);
  if (body.length > MAX_SICHERUNG) { daten = kuerzen(daten); body = await verschluesseln(klar(daten), k.key); }
  if (body.length > MAX_SICHERUNG) return 'fehler';
  let r; try { r = await fetch(adresseS(k.id), { method: 'PUT', headers: { 'Content-Type': 'text/plain', 'X-Schreib': k.schreib }, body }); } catch { return 'netz'; }
  if (r.status === 204 || r.ok) { const neu = kopplung(); if (neu?.id === k.id) merke({ ...neu, sicherung: h }); return 'ok'; }
  return r.status === 404 ? 'noch-nicht' : r.status === 403 ? 'ungueltig' : 'fehler';
}
/** Aus einem Kopplungs-Link (…/eltern-bericht/#<id>.<key>) id und key lesen – oder null. */
export function linkLesen(text) {
  const m = /#?([\w-]{22})\.([\w-]{43})\s*$/.exec(String(text).trim());
  return m ? { id: m[1], key: m[2] } : null;
}
/** Sicherung holen und entschlüsseln. Liefert { ok: true, id, key, schreib, daten, stand } oder { ok: false, grund: 'link'|'keine'|'andere-app'|'schluessel'|'netz' }. */
export async function sicherungHolen(text) {
  const l = linkLesen(text); if (!l) return { ok: false, grund: 'link' };
  let r; try { r = await fetch(adresseS(l.id), { cache: 'no-store' }); } catch { return { ok: false, grund: 'netz' }; }
  if (r.status === 404) return { ok: false, grund: 'keine' };
  if (!r.ok) return { ok: false, grund: 'netz' };
  let klar;
  try {
    const { d } = await r.json(); const [iv, ct] = String(d).split('.');
    const key = await crypto.subtle.importKey('raw', b64urlLesen(l.key), { name: 'AES-GCM' }, false, ['decrypt']);
    klar = JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64urlLesen(iv) }, key, b64urlLesen(ct))));
  } catch { return { ok: false, grund: 'schluessel' }; }
  if (klar?.app !== 'mathe-trainer') return { ok: false, grund: 'andere-app' };
  if (!/^[\w-]{22}$/.test(klar.schreib || '') || !klar.daten || typeof klar.daten !== 'object') return { ok: false, grund: 'schluessel' };
  return { ok: true, id: l.id, key: l.key, schreib: klar.schreib, daten: klar.daten, stand: klar.stand };
}
/** Hat dieses Gerät schon eigenen Lernstand (dann vor dem Überschreiben fragen)? */
export const hatLernstand = () => store.xp > 0 || Object.keys(store.stats).length > 0;
/** Gesicherten Lernstand übernehmen: Speicher ersetzen, Kopplung übernehmen (das Gerät schreibt danach weiter). Danach neu laden. */
export function uebernehmen(s, ls = globalThis.localStorage) {
  const geraet = (() => { try { return JSON.parse(ls.getItem('mathetrainer.v1') || '{}').geraet; } catch { return undefined; } })();
  for (const alt of Object.keys(s.daten)) if (/^(mt|mathetrainer)\./.test(alt)) {
    const name = alt.replace(/^mt\./, 'mathetrainer.');   // Sicherungen vor dem Umzug (19.11.2026) tragen noch „mt.…“
    if (['mathetrainer.eltern', 'mathetrainer.kirest'].includes(name)) continue;
    let v = s.daten[alt]; if (name === 'mathetrainer.v1' && v && typeof v === 'object' && geraet) v = { ...v, geraet };   // eigene Geräte-Kennung behalten
    ls.setItem(name, typeof v === 'string' ? v : JSON.stringify(v));
  }
  merke({ id: s.id, schreib: s.schreib, key: s.key, name: '', seit: new Date().toISOString(), gesendet: '', fehler: '', sicherung: '' });
}
let laeuft = null;
/** Bericht senden – höchstens alle 10 Minuten, außer sofort = true. Liefert 'ok' | 'warten' | 'aus' | 'netz' | 'ungueltig' | 'fehler'. */
export function senden({ sofort = false, jetzt = Date.now() } = {}) {
  const k = kopplung(); if (!k) return Promise.resolve('aus');
  if (!sofort && k.gesendet && jetzt - Date.parse(k.gesendet) < ABSTAND) return Promise.resolve('warten');
  if (globalThis.navigator?.onLine === false) return Promise.resolve('netz');
  if (laeuft) return laeuft;
  laeuft = (async () => {
    try {
      const body = await verschluesseln(bericht(k), k.key);
      if (body.length > MAX_BYTES) return 'fehler';
      let r; try { r = await fetch(adresse(k), { method: 'PUT', headers: { 'Content-Type': 'text/plain', 'X-Schreib': k.schreib }, body }); } catch { return 'netz'; }
      const neu = kopplung(); if (!neu || neu.id !== k.id) return 'aus';   // inzwischen aufgehoben
      if (r.status === 204 || r.ok) { merke({ ...neu, gesendet: new Date().toISOString(), fehler: '' }); await sichern(kopplung()).catch(() => {}); return 'ok'; }
      const art = r.status === 403 ? 'ungueltig' : 'fehler'; merke({ ...neu, fehler: art }); return art;
    } catch { return 'fehler'; } finally { laeuft = null; }
  })();
  return laeuft;
}
/** Kopplung aufheben: Bericht beim Server löschen (DELETE), dann im Gerät vergessen. Liefert 'ok' | 'netz'. */
export async function aufheben() {
  const k = kopplung(); if (!k) return 'ok';
  try { const r = await fetch(adresse(k), { method: 'DELETE', headers: { 'X-Schreib': k.schreib } }); if (!(r.status === 204 || r.status === 404 || r.ok)) return 'netz'; } catch { return 'netz'; }
  try { await fetch(adresseS(k.id), { method: 'DELETE', headers: { 'X-Schreib': k.schreib } }); } catch { /* Bericht-DELETE löscht die Sicherung mit */ }
  merke(null); return 'ok';
}
/** Nach einer Lern-Sitzung von selbst senden: beim Verlassen der Seite, beim Zurückkehren zum Start, wieder online. */
export function elternAutomatik(w = globalThis.window) {
  if (typeof w?.addEventListener !== 'function') return;
  const los = () => { senden().catch(() => {}); };
  w.document?.addEventListener?.('visibilitychange', () => { if (w.document.visibilityState === 'hidden') los(); });
  w.addEventListener('hashchange', () => { if (['', '#/', '#/mehr'].includes(w.location.hash)) los(); });
  w.addEventListener('online', los);
}
