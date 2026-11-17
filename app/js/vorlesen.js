// Vorlesen mit der Stimme „Nova“ (eine mit KI von OpenAI erzeugte Stimme; Marcel, 17.11.2026: „zukünftig nur Nova“).
// Die App spricht nie mit OpenAI. Sie holt fertige Audiodateien von unserem Server stimmen.mathenachhilfe-online.com:
//   • feste Texte (Theorie, Formelkarten, „Wo brauche ich das?“) stehen in vorlesen/texte.json und werden dort vorab vertont;
//   • Texte, die erst in der Aufgabe entstehen, schickt die App in Stücken bis 300 Zeichen an /jetzt (ohne Angaben zur Person).
// KI-Antworten gehen nicht an /jetzt (einmalig, nur Kosten) – sie liest still die Stimme des Geräts.
// Klappt es nicht (offline, 204), liest still die Stimme des Geräts (nur eingebaute Stimmen, kein Text an fremde Server).
// Wird erst geladen, wenn jemand vorlesen lässt (kein Einfluss auf den Start).
import { audio } from './ui.js';
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
    const u = new SpeechSynthesisUtterance(text); u.voice = vs.find((x) => /de-DE/i.test(x.lang)) || vs[0]; u.lang = u.voice.lang;
    u.onend = () => fertig(true); u.onerror = () => fertig(false); speechSynthesis.speak(u);
  });
}

/* ───────────── Nova-Dateien holen ───────────── */
async function holeDatei(url) {
  let c = null; try { c = await caches.open(SPEICHER); const da = await c.match(url); if (da) return da.arrayBuffer(); } catch { /* ohne Zwischenspeicher */ }
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
export function stopp() { runde++; quellen.forEach((q) => { try { q.stop(); } catch { /* schon aus */ } }); quellen = []; try { speechSynthesis?.cancel(); } catch { /* egal */ } melde(false); }

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
      try {
        const a = audio(), buf = await a.ac.decodeAudioData(roh);
        if (meine !== runde) return gehoert;
        await new Promise((fertig) => { const q = a.ac.createBufferSource(); q.buffer = buf; q.connect(a.out); q.onended = fertig; quellen.push(q); q.start(); });
        ok = true;
      } catch { ok = false; }
    }
    if (!ok && meine === runde) ok = await geraet(teile[i]);   // stille Notlösung
    if (meine !== runde) return gehoert || ok;
    gehoert ||= ok;
  }
  if (meine === runde) melde(false);
  return gehoert;
}
if (typeof window !== 'undefined') addEventListener('hashchange', stopp);
