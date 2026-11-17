// Vorlesen mit der Stimme „Nova“ (eine mit KI von OpenAI erzeugte Stimme; Marcel, 17.11.2026: „zukünftig nur Nova“).
// Die App spricht nie mit OpenAI. Sie holt fertige Audiodateien von unserem Server stimmen.mathenachhilfe-online.com:
//   • feste Texte (Theorie, Formelkarten, „Wo brauche ich das?“) stehen in vorlesen/texte.json und werden dort vorab vertont;
//   • Texte, die erst in der Aufgabe entstehen, schickt die App in Stücken bis 300 Zeichen an /jetzt (ohne Angaben zur Person).
// KI-Antworten gehen nicht an /jetzt (einmalig, nur Kosten) – sie liest still die Stimme des Geräts.
// Klappt es nicht (offline, 204), liest still die Stimme des Geräts (nur eingebaute Stimmen, kein Text an fremde Server).
// Wird erst geladen, wenn jemand vorlesen lässt (kein Einfluss auf den Start).
import { vorlese } from './ui.js';
import { htmlSprech, normal, stuecke } from './sprech.js';

export const STIMMEN = 'https://stimmen.mathenachhilfe-online.com';
const FEST_MAX = 1500, JETZT_MAX = 300, SPEICHER = 'stimme-nova';   // ohne „mt-“: der Service Worker räumt bei Updates nur mt-Speicher auf
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

/* ───────────── Gerätestimme als stille Notlösung ───────────── */
const geraeteStimmen = () => ('speechSynthesis' in window ? speechSynthesis.getVoices() : []).filter((v) => v.localService && /^de/i.test(v.lang));
function geraet(text) {
  return new Promise((fertig) => {
    const vs = geraeteStimmen(); if (!vs.length || !text) { fertig(false); return; }
    const u = new SpeechSynthesisUtterance(text); u.voice = vs.find((x) => /de-DE/i.test(x.lang)) || vs[0]; u.lang = u.voice.lang; u.rate = vorlese.tempo;
    u.onend = () => fertig(true); u.onerror = () => fertig(false); speechSynthesis.speak(u);
  });
}

/* ───────────── Nova-Dateien holen ───────────── */
/** Adresse der Bestqualität (128 kbit/s) zu einer normalen Nova-Adresse. */
export const original = (u) => u.replace(`${STIMMEN}/nova/`, `${STIMMEN}/nova/original/`);
async function holeDatei(url) {
  // auf dem Gerät zuerst die Bestqualität (falls offline geladen), dann die normale Datei; aus dem Netz immer die normale
  let c = null; try { c = await caches.open(SPEICHER); const da = (await c.match(original(url))) || (await c.match(url)); if (da) return da.arrayBuffer(); } catch { /* ohne Zwischenspeicher */ }
  const r = await fetch(url, AUS);
  if (!r.ok) return null;
  if (c) c.put(url, r.clone()).catch(() => {});
  return r.arrayBuffer();
}
/** Audiodatei zu einem Stück: erst die feste Adresse, sonst (wenn erlaubt) über /jetzt vertonen lassen. null = nicht da. */
async function datei(stueck, jetzt) {
  try {
    const roh = await holeDatei(adresse(await kennung(stueck)));
    if (roh) return roh;
    if (!jetzt) return null;
    const r = await fetch(`${STIMMEN}/jetzt`, { ...AUS, method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: normal(stueck), sprache: 'de' }) });
    if (r.status !== 200) return null;
    const { url } = await r.json();
    return typeof url === 'string' && url.startsWith(`${STIMMEN}/`) ? holeDatei(url) : null;
  } catch { return null; }
}

/* ───────────── Sprechen ───────────── */
let runde = 0, quellen = [];
const melde = (an) => { try { window.dispatchEvent(new CustomEvent('mt-spricht', { detail: an })); } catch { /* egal */ } };
export function stopp() { runde++; quellen.forEach((q) => { try { q.pause(); } catch { /* schon aus */ } }); quellen = []; try { speechSynthesis?.cancel(); } catch { /* egal */ } melde(false); }

/**
 * Liest einen Text vor. art: 'fest' (Theorie – vorab vertont), 'aufgabe' (erst in der Aufgabe entstanden – über /jetzt), 'ki' (nur Gerätestimme).
 * Stück für Stück: Was Nova nicht liefert, liest die Gerätestimme. Liefert, ob etwas zu hören war.
 */
export async function sprich(text, art = 'aufgabe') {
  stopp(); const meine = runde; if (!normal(text)) return false;
  melde(true); let gehoert = false;
  const teile = art === 'ki' ? [text] : stuecke(text, art === 'fest' ? FEST_MAX : JETZT_MAX);
  // nächste Datei schon holen, während die aktuelle spielt
  let naechste = art === 'ki' ? null : datei(teile[0], art === 'aufgabe');
  for (let i = 0; i < teile.length; i++) {
    const roh = naechste ? await naechste : null;
    naechste = art !== 'ki' && i + 1 < teile.length ? datei(teile[i + 1], art === 'aufgabe') : null;
    if (meine !== runde) return gehoert;
    let ok = false;
    if (roh) {
      // Abspielen mit eingestelltem Tempo bei gleicher Tonhöhe (1,0 = Tempo des Servers)
      const url = URL.createObjectURL(new Blob([roh], { type: 'audio/mpeg' }));
      try {
        // derselbe Player, der beim Antippen freigegeben wurde (siehe vorleseFreigeben in ui.js) – sonst ein neuer
        const el = window.__mtVorleser || new Audio(); el.src = url; el.preservesPitch = true; el.mozPreservesPitch = true; el.webkitPreservesPitch = true;
        el.defaultPlaybackRate = vorlese.tempo; el.playbackRate = vorlese.tempo; quellen.push(el);
        ok = await new Promise((fertig) => { el.onended = () => fertig(true); el.onerror = () => fertig(false); el.onpause = () => { if (!el.ended) fertig(true); }; el.play().catch(() => fertig(false)); });
      } catch { ok = false; }
      URL.revokeObjectURL(url);
    }
    if (!ok && meine === runde) ok = await geraet(teile[i]);   // stille Notlösung
    if (meine !== runde) return gehoert || ok;
    gehoert ||= ok;
  }
  if (meine === runde) melde(false);
  return gehoert;
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
