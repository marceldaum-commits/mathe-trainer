// Vorlesen mit der Stimme „Nova“ (eine mit KI von OpenAI erzeugte Stimme; Marcel, 17.11.2026: „zukünftig nur Nova“).
// Die App spricht nie mit OpenAI. Sie holt fertige Audiodateien von unserem Server stimmen.mathenachhilfe-online.com:
//   • feste Texte (Theorie, Formelkarten, „Wo brauche ich das?“) stehen in vorlesen/texte.json und werden dort vorab vertont;
//   • Texte, die erst in der Aufgabe entstehen, schickt die App als ganze Sätze (Stücke bis 300 Zeichen, an Satzenden geteilt)
//     an /jetzt (ohne Angaben zur Person). Nie Schnipsel aus Wörtern und Zahlen.
// Nie die Android-Stimme, solange Netz da ist (Leitstand, 17.11.2026): lieber warten (mit „Lädt …“ am Knopf), einmal neu versuchen,
// und wenn Nova trotzdem nicht kommt, einmal je Sitzung „Nova ist gerade nicht erreichbar“. Die Stimme des Geräts liest nur,
// wenn wirklich kein Netz da ist und nichts offline gespeichert ist. KI-Antworten werden nicht vorgelesen.
// Wird erst geladen, wenn jemand vorlesen lässt (kein Einfluss auf den Start).
import { vorlese } from './ui.js';
import { htmlSprech, normal, stuecke } from './sprech.js';

export const STIMMEN = 'https://stimmen.mathenachhilfe-online.com';
const FEST_MAX = 1500, JETZT_MAX = 300, SPEICHER = 'stimme-mathetrainer';   // eindeutig (gemeinsame Adresse), aber ohne „mathetrainer-“: der Service Worker räumt bei Updates nur diese Speicher auf
const AUS = { credentials: 'omit', referrerPolicy: 'no-referrer' };   // keine Cookies, keine Herkunftsangabe

/** Kennung einer Audiodatei: SHA-256 von "nova|de|" + Text (Normalform), die ersten 32 Hex-Zeichen. */
export async function kennung(text, sprache = 'de') {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`nova|${sprache}|${normal(text)}`));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}
export const adresse = (h) => `${STIMMEN}/nova/${h.slice(0, 2)}/${h}.mp3`;

/* ───────────── Sprechfassung aus der Seite ───────────── */
/** Ein Bereich der Seite als Sprechfassung: Formeln aus ihrer TeX-Quelle; Knöpfe, Merkbilder und KI-Antworten bleiben weg.
 *  Für Theorie-Abschnitte ergibt das genau den Text aus vorlesen/texte.json. */
export function sprechText(el) {
  const k = el.cloneNode(true);
  k.querySelectorAll('.katex').forEach((x) => { const t = x.querySelector('annotation')?.textContent; x.replaceWith(document.createTextNode(t ? `⟦${t}⟧` : x.textContent)); });
  k.querySelectorAll('details:not([open])').forEach((d) => { const s = d.querySelector('summary'); d.replaceWith(s ? s.cloneNode(true) : ''); });
  k.querySelectorAll('.opt').forEach((o) => { const b = o.querySelector('.k')?.textContent?.trim() || ''; o.querySelector('.k')?.remove(); const p = document.createElement('p'); p.innerHTML = `Antwort ${b}: ${o.innerHTML}`; o.replaceWith(p); });
  k.querySelectorAll('button, .vl-knopf, .mission .tag, figure.merk, .ki, .ki-frage, .ki-auswertung, .ki-ich, [hidden], [aria-hidden="true"], script, style, canvas, svg, .noread').forEach((x) => x.remove());
  return htmlSprech(k.innerHTML);
}

/* ───────────── Gerätestimme: nur ohne Netz ───────────── */
const geraeteStimmen = () => ('speechSynthesis' in window ? speechSynthesis.getVoices() : []).filter((v) => v.localService && /^de/i.test(v.lang));
function geraet(text) {
  return new Promise((fertig) => {
    try {
      const vs = geraeteStimmen(); if (!vs.length || !text) { fertig(false); return; }
      const u = new SpeechSynthesisUtterance(text), v = vs.find((x) => /de-DE/i.test(x.lang)) || vs[0]; u.lang = v.lang; u.rate = vorlese.tempo;
      try { u.voice = v; } catch { /* nur die Sprache */ }
      u.onend = () => fertig(true); u.onerror = () => fertig(false); speechSynthesis.speak(u);
    } catch { fertig(false); }
  });
}

/* ───────────── Nova-Dateien holen ───────────── */
/** Adresse der Bestqualität (128 kbit/s) zu einer normalen Nova-Adresse. */
export const original = (u) => u.replace(`${STIMMEN}/nova/`, `${STIMMEN}/nova/original/`);
const WARTE_MS = 15000;   // so lange darf eine Datei aus dem Netz dauern (/jetzt vertont neu: meist 2–3 s)
const warte = (ms) => new Promise((r) => setTimeout(r, ms));
async function netz(url, o = {}) {
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), WARTE_MS);
  try { return await fetch(url, { ...AUS, ...o, signal: ctl.signal }); } finally { clearTimeout(t); }
}
/** Aus dem Gerätespeicher (Bestqualität zuerst) oder null. */
async function ausSpeicher(url) {
  try { const c = await caches.open(SPEICHER); const da = (await c.match(original(url))) || (await c.match(url)); return da ? await da.arrayBuffer() : null; } catch { return null; }
}
/** Eine Nova-Datei holen. Liefert { roh } – oder { fehlt: true } (404) bzw. { fehler: 'netz' | 'server' }. */
async function holeDatei(url) {
  const da = await ausSpeicher(url); if (da) return { roh: da };
  let r; try { r = await netz(url); } catch { return { fehler: 'netz' }; }
  if (r.status === 404) return { fehlt: true };
  if (!r.ok) return { fehler: 'server' };
  try { const c = await caches.open(SPEICHER); await c.put(url, r.clone()); } catch { /* ohne Zwischenspeicher */ }
  return { roh: await r.arrayBuffer() };
}
/** Einen ganzen Satz (bis 300 Zeichen) über /jetzt vertonen lassen – bei einer Störung einmal neu versuchen. */
async function jetzt(satz) {
  let letzter = { fehler: 'server' };
  for (let versuch = 0; versuch < 2; versuch++) {
    if (versuch) await warte(700);
    let r; try { r = await netz(`${STIMMEN}/jetzt`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: normal(satz), sprache: 'de' }) }); }
    catch { letzter = { fehler: 'netz' }; continue; }
    if (r.status !== 200) { letzter = { fehler: 'server' }; continue; }
    let url = null; try { ({ url } = await r.json()); } catch { /* unlesbar */ }
    if (typeof url !== 'string' || !url.startsWith(`${STIMMEN}/nova/`)) { letzter = { fehler: 'server' }; continue; }
    const d = await holeDatei(url); if (d.roh) return d; letzter = d.fehler ? d : { fehler: 'server' };
  }
  return letzter;
}
/**
 * Alle Audiodateien zu einem Stück: erst die feste Adresse (vorab vertont), sonst über /jetzt – als ganze Sätze bis 300 Zeichen.
 * Liefert { teile: [ArrayBuffer…] } oder { fehler: 'netz' | 'server' }. Protokoll für Prüfungen: window.__mtNova (nur im Test).
 */
async function dateien(stueck) {
  const fest = await holeDatei(adresse(await kennung(stueck)));
  if (fest.roh) { log(stueck, 'fest'); return { teile: [fest.roh] }; }
  if (fest.fehler === 'netz') { log(stueck, 'netz'); return fest; }
  const saetze = stuecke(stueck, JETZT_MAX), teile = await Promise.all(saetze.map(jetzt));
  const kaputt = teile.find((t) => !t.roh);
  log(stueck, kaputt ? kaputt.fehler : 'jetzt');
  return kaputt || { teile: teile.map((t) => t.roh) };
}
const log = (text, wie) => { if (window.__mtTest) (window.__mtNova ||= []).push({ wie, text: text.slice(0, 80) }); };

/* ───────────── Sprechen ───────────── */
let runde = 0, quellen = [], gemeldet = false;
const melde = (an) => { try { window.dispatchEvent(new CustomEvent('mt-spricht', { detail: an })); } catch { /* egal */ } };
export function stopp() { runde++; quellen.forEach((q) => { try { q.pause(); } catch { /* schon aus */ } }); quellen = []; try { speechSynthesis?.cancel(); } catch { /* egal */ } melde(false); }
/** Einmal je Sitzung: Nova kommt gerade nicht. Liefert den Hinweistext oder ''. */
const einmalMelden = () => { if (gemeldet) return ''; gemeldet = true; return 'Nova ist gerade nicht erreichbar – bitte gleich noch einmal versuchen.'; };

/** Eine Datei abspielen (Tempo bei gleicher Tonhöhe). Liefert 'ok' | 'gesperrt' (Gerät verlangt ein Tippen) | 'fehler'. */
async function abspielen(roh, meine) {
  const url = URL.createObjectURL(new Blob([roh], { type: 'audio/mpeg' }));
  try {
    // derselbe Player, der beim Antippen freigegeben wurde (siehe vorleseFreigeben in ui.js) – sonst ein neuer
    const el = window.__mtVorleser || new Audio(); el.src = url; el.preservesPitch = true; el.mozPreservesPitch = true; el.webkitPreservesPitch = true;
    el.defaultPlaybackRate = vorlese.tempo; el.playbackRate = vorlese.tempo; quellen.push(el);
    return await new Promise((fertig) => {
      el.onended = () => fertig('ok'); el.onerror = () => fertig('fehler'); el.onpause = () => { if (!el.ended) fertig(meine === runde ? 'fehler' : 'ok'); };
      el.play().catch((e) => fertig(e?.name === 'NotAllowedError' ? 'gesperrt' : 'fehler'));
    });
  } catch { return 'fehler'; } finally { URL.revokeObjectURL(url); }
}

/**
 * Liest einen Text mit Nova vor. art: 'fest' (Theorie – vorab vertont) oder 'aufgabe' (erst in der Aufgabe entstanden).
 * beimStart() wird gerufen, sobald der erste Ton läuft (für „Lädt …“ am Knopf).
 * Liefert { ok, hinweis }: ok = etwas war zu hören; hinweis = Text für eine kurze Meldung (oder '').
 */
export async function sprich(text, art = 'aufgabe', { beimStart = () => {} } = {}) {
  stopp(); const meine = runde; if (!normal(text)) return { ok: false, hinweis: '' };
  melde(true); let gehoert = false, hinweis = '', gestartet = false;
  const start = () => { if (!gestartet) { gestartet = true; beimStart(); } };
  const teile = stuecke(text, art === 'fest' ? FEST_MAX : JETZT_MAX);
  let naechste = dateien(teile[0]);   // nächste Dateien schon holen, während die aktuellen spielen
  for (let i = 0; i < teile.length; i++) {
    const d = await naechste;
    naechste = i + 1 < teile.length ? dateien(teile[i + 1]) : null;
    if (meine !== runde) return { ok: gehoert, hinweis: '' };
    if (d.teile) {
      for (const roh of d.teile) {
        start(); const w = await abspielen(roh, meine);
        if (meine !== runde) return { ok: true, hinweis: '' };
        if (w === 'gesperrt') { melde(false); return { ok: gehoert, hinweis: 'Zum Vorlesen bitte noch einmal auf „Vorlesen“ tippen.' }; }
        if (w === 'ok') gehoert = true;
      }
      continue;
    }
    // Nova kam nicht. Ohne Netz (und nichts offline gespeichert): die Stimme des Geräts. Sonst lieber still als die Android-Stimme.
    if (d.fehler === 'netz' && navigator.onLine === false) { start(); if (await geraet(teile[i])) gehoert = true; hinweis ||= einmalMelden(); continue; }
    hinweis = einmalMelden() || hinweis; break;
  }
  if (meine === runde) melde(false);
  return { ok: gehoert, hinweis };
}
if (typeof window !== 'undefined') addEventListener('hashchange', stopp);

/* ───────────── Alle Nova-Texte offline (Marcel, 17.11.2026) ───────────── */
// Nur die festen Texte aus vorlesen/texte.json – Laufzeit-Texte (/jetzt) gehören nicht dazu. Gespeichert im Cache Storage
// (in der Android-App liegt der im App-Speicher). Fehlende Dateien (404) werden still übersprungen; nach einem Abbruch geht es dort weiter.
const standHost = () => (/^(localhost|127\.)/.test(location.hostname) ? 'trainer-test.mathenachhilfe-online.com' : location.hostname);
/** Was der Server für diese Adresse vorhält: { bytes, bytes_original, vorhanden } – oder null (offline). */
export async function offlineStand() {
  try { const r = await fetch(`${STIMMEN}/nova/stand-${standHost()}.json`, { ...AUS, cache: 'no-store' }); if (!r.ok) return null; const d = await r.json(); return Number.isFinite(d.bytes) ? d : null; } catch { return null; }
}
/** Was schon auf dem Gerät liegt: { anzahl, bytes } gesamt, dazu je Qualität (normal, best). */
export async function offlineLokal() {
  const leer = () => ({ anzahl: 0, bytes: 0 }), out = { ...leer(), normal: leer(), best: leer() };
  try {
    const c = await caches.open(SPEICHER), keys = await c.keys();
    for (const k of keys) { const r = await c.match(k); const n = +r?.headers.get('content-length'), b = Number.isFinite(n) && n > 0 ? n : (await r.clone().blob()).size;
      const q = k.url.includes('/nova/original/') ? out.best : out.normal; q.anzahl++; q.bytes += b; out.anzahl++; out.bytes += b; }
  } catch { /* leer */ }
  return out;
}
let ladeStopp = null;
/** Alle fehlenden Dateien laden, 4 gleichzeitig – qual 'normal' (40 kbit/s) oder 'best' (128 kbit/s, bei 404 die normale).
 *  melde({ fertig, gesamt }) nach jeder Datei. Liefert 'fertig' | 'abgebrochen' | 'fehler'. */
export async function offlineLaden(melde = () => {}, qual = 'normal') {
  const ctl = new AbortController(); ladeStopp = ctl;
  try {
    const liste = (await (await fetch('vorlesen/texte.json')).json()).texte.map((t) => t.text);
    const c = await caches.open(SPEICHER), offen = [];
    for (const t of liste) { const u = adresse(await kennung(t)); if (!(await c.match(original(u))) && (qual === 'best' || !(await c.match(u)))) offen.push(u); }
    let fertig = 0; const gesamt = offen.length; melde({ fertig, gesamt });
    try { await navigator.storage?.persist?.(); } catch { /* nicht überall */ }
    const arbeiter = async () => {
      while (offen.length && !ctl.signal.aborted) {
        const u = offen.shift();
        try {
          let r = qual === 'best' ? await fetch(original(u), { ...AUS, signal: ctl.signal }) : null;
          if (r?.ok) { await c.put(original(u), r); await c.delete(u); }   // Bestqualität ersetzt die normale Datei
          else if (!(await c.match(u))) { r = await fetch(u, { ...AUS, signal: ctl.signal }); if (r.ok) await c.put(u, r); }
        } catch { if (ctl.signal.aborted) return; }   // 404 und Netzfehler: still weiter
        fertig++; melde({ fertig, gesamt });
      }
    };
    await Promise.all([arbeiter(), arbeiter(), arbeiter(), arbeiter()]);
    return ctl.signal.aborted ? 'abgebrochen' : 'fertig';
  } catch { return ctl.signal.aborted ? 'abgebrochen' : 'fehler'; } finally { ladeStopp = null; }
}
export const offlineAbbrechen = () => ladeStopp?.abort();
export const offlineLaedt = () => !!ladeStopp;
export async function offlineLoeschen() { offlineAbbrechen(); try { await caches.delete(SPEICHER); } catch { /* egal */ } }
