// Vorlesen: Aufgaben, Tipps, Lösungswege und Theorie – mit einer Stimme des Geräts oder der natürlichen Stimme „Thorsten“.
// Wird erst geladen, wenn jemand vorlesen lässt (kein Einfluss auf den Start).
// Thorsten rechnet ganz auf dem Gerät (ONNX Runtime Web, MIT). Die Stimmdatei (63 MB, Aufnahmen CC0) kommt nur auf Wunsch einmal
// vom Server von Mathenachhilfe Online und liegt danach im Speicher des Browsers bzw. der App. Kein Text verlässt das Gerät.
// Die Lautschrift (Wort → Laute) entsteht vorab am Entwicklungsrechner (tools/stimme/) – kein espeak-ng (GPL) in der App.
import { audio, vorlese } from './ui.js';
import { textSprech, texSprech } from './sprech.js';

export const MODELL = 'https://stimmen.mathenachhilfe-online.com/thorsten/de_DE-thorsten-medium.onnx';
// Der Rechenkern liegt als .wasm.txt auf dem Server (dort sind nur bestimmte Dateiarten erlaubt); die App lädt ihn als Daten.
const ORT = ['stimme/woerter.txt', 'stimme/laute.json', 'vendor/ort/ort.wasm.min.js', 'vendor/ort/ort-wasm-simd-threaded.mjs', 'vendor/ort/ort-wasm-simd-threaded.wasm.txt'];
const GROESSE = 63201294, SHA = '7e64762d8e5118bb578f2eea6207e1a35a8e0c30595010b666f983fc87bb7819', SPEICHER = 'stimme-thorsten', RATE = 22050;

/* ───────────── Sprechfassung aus der Seite ───────────── */
/** Text eines Bereichs der Seite als Sprechfassung: Formeln aus ihrer TeX-Quelle, Knöpfe und Versteckes bleiben weg. */
export function sprechText(el) {
  const teile = [];
  const lauf = (n) => {
    if (n.nodeType === 3) { teile.push(n.textContent); return; }
    if (n.nodeType !== 1) return;
    if (n.matches('.katex')) { const t = n.querySelector('annotation')?.textContent; teile.push(t ? ` ⟦${t}⟧ ` : n.textContent); return; }
    if (n.matches('details:not([open])')) { const s = n.querySelector('summary'); if (s) lauf(s); return; }
    if (n.matches('button:not(.opt), .vl-knopf, [hidden], [aria-hidden="true"], script, style, canvas, svg, .noread')) return;
    if (n.matches('.opt')) { const b = n.querySelector('.key, b')?.textContent?.trim(); teile.push(` Antwort ${b || ''}: `); n.childNodes.forEach((k) => { if (!k.matches?.('.key')) lauf(k); }); teile.push('. '); return; }
    const block = /^(P|LI|H1|H2|H3|DIV|SECTION|TR|SUMMARY)$/.test(n.tagName);
    n.childNodes.forEach(lauf); if (block) teile.push('. ');
  };
  lauf(el);
  return textSprech(teile.join(' ')).replace(/(\.\s*){2,}/g, '. ').replace(/^[.\s]+/, '');
}

/* ───────────── Gerätestimmen (nur solche, die auf dem Gerät sprechen) ───────────── */
export const geraeteStimmen = () => ('speechSynthesis' in window ? speechSynthesis.getVoices() : []).filter((v) => v.localService && /^de/i.test(v.lang));
function geraetSprich(text, tempo, fertig) {
  const vs = geraeteStimmen(); if (!vs.length) return false;
  const v = vs.find((x) => `geraet:${x.voiceURI}` === vorlese.stimme) || vs.find((x) => /de-DE/i.test(x.lang)) || vs[0];
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text); u.voice = v; u.lang = v.lang; u.rate = tempo;
  u.onend = u.onerror = () => fertig(); speechSynthesis.speak(u); return true;
}

/* ───────────── Thorsten: Stimmdatei laden, prüfen, merken ───────────── */
export const thorsten = { zustand: 'pruefen', prozent: 0, grund: '' };
thorsten.moeglich = () => 'caches' in window && 'WebAssembly' in window && !!crypto?.subtle && typeof BigInt64Array !== 'undefined';
thorsten.pruefen = async () => {
  if (!thorsten.moeglich()) { thorsten.zustand = 'geht-nicht'; return thorsten.zustand; }
  try { thorsten.zustand = (await (await caches.open(SPEICHER)).match(MODELL)) ? 'bereit' : 'fehlt'; } catch { thorsten.zustand = 'fehlt'; }
  return thorsten.zustand;
};
let abbruch = null;
const hex = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
thorsten.laden = async (melde = () => {}) => {
  if (thorsten.zustand === 'laedt' || thorsten.zustand === 'bereit') return;
  thorsten.zustand = 'laedt'; thorsten.prozent = 0; thorsten.grund = ''; melde();
  const ctl = new AbortController(); abbruch = ctl;
  try {
    // ohne Cookies und ohne Herkunftsangabe – der Server sieht nur IP-Adresse und Zeitpunkt
    const r = await fetch(MODELL, { signal: ctl.signal, credentials: 'omit', referrerPolicy: 'no-referrer', cache: 'no-store' });
    if (!r.ok || !r.body) throw new Error(`Der Server antwortet mit ${r.status}.`);
    const leser = r.body.getReader(), buf = new Uint8Array(GROESSE); let da = 0;
    for (;;) { const { done, value } = await leser.read(); if (done) break;
      if (da + value.length > GROESSE) throw new Error('Die Datei ist größer als erwartet.');
      buf.set(value, da); da += value.length; const p = Math.min(99, Math.floor((da * 100) / GROESSE)); if (p !== thorsten.prozent) { thorsten.prozent = p; melde(); } }
    if (da !== GROESSE) throw new Error('Die Datei ist unvollständig angekommen.');
    if (hex(await crypto.subtle.digest('SHA-256', buf)) !== SHA) throw new Error('Die Datei ist beschädigt angekommen.');
    const c = await caches.open(SPEICHER);
    await c.put(MODELL, new Response(buf, { headers: { 'Content-Type': 'application/octet-stream' } }));
    // Rechen-Bausteine (12 MB) gleich mit in den Speicher – dann liest Thorsten auch ohne Internet
    await Promise.all(ORT.map((f) => c.add(f).catch(() => {})));
    try { await navigator.storage?.persist?.(); } catch { /* nicht überall */ }
    thorsten.zustand = 'bereit';
  } catch (e) {
    if (ctl.signal.aborted) thorsten.zustand = 'fehlt';
    else { thorsten.zustand = 'fehler'; thorsten.grund = e?.name === 'QuotaExceededError' ? 'Auf dem Gerät ist nicht genug Platz für die Stimme.' : e?.message && !/fetch|network|load/i.test(e.message) ? e.message : 'Keine Verbindung. Bitte später noch einmal versuchen.'; }
  }
  abbruch = null; melde();
};
thorsten.abbrechen = () => abbruch?.abort();
thorsten.entfernen = async () => { thorsten.abbrechen(); stopp(); sitzung = null; try { await caches.delete(SPEICHER); } catch { /* egal */ } thorsten.zustand = 'fehlt'; };

/* ───────────── Thorsten: Lautschrift und Rechnen ───────────── */
let lexikon = null, laute = null, sitzung = null;
async function lexikonLaden() {
  if (lexikon) return;
  const [w, l] = await Promise.all([fetch('stimme/woerter.txt'), fetch('stimme/laute.json')]);
  const text = await w.text();
  lexikon = new Map(text.split('\n').filter(Boolean).map((z) => z.split('\t'))); laute = await l.json();
}
/** Zahl → Wörter des Wörterbuchs (0–999 stehen drin, größere werden zusammengesetzt; nach dem Komma Ziffer für Ziffer). */
function zahlTeile(z) {
  const [ganz, nach] = z.split(','), out = [];
  const g = (n) => { if (n < 1000) return [String(n)]; if (n < 1e6) { const t = Math.floor(n / 1000), r = n % 1000; return [...(t === 1 ? ['ein'] : g(t)), 'tausend', ...(r ? g(r) : [])]; }
    const m = Math.floor(n / 1e6), r = n % 1e6; return [...(m === 1 ? ['eine', 'million'] : [...g(m), 'millionen']), ...(r ? g(r) : [])]; };
  out.push(...(ganz.length > 9 ? ganz.split('') : g(+ganz)));
  if (nach !== undefined && nach !== '') out.push('komma', ...(nach.length <= 2 && !nach.startsWith('0') ? [String(+nach)] : nach.split('')));
  return out;
}
/** Satz → Laut-Nummern für das Modell: ^ Laut _ Laut _ … $. Unbekannte Wörter werden buchstabiert. */
function lautNummern(satz) {
  const nr = (c) => laute[c]?.[0], seq = [nr('^')], laut = (c) => { const i = nr(c); if (i !== undefined) seq.push(i, 0); };
  const woerter = satz.match(/\d+(?:,\d+)?|[A-Za-zÄÖÜäöüß]+|[,.:;?!]/g) || [];
  woerter.forEach((w, k) => {
    if (/^[,.:;?!]$/.test(w)) { laut(w === ';' ? ',' : w); laut(' '); return; }
    const teile = /^\d/.test(w) ? zahlTeile(w) : [w];
    for (const t of teile) {
      const ph = lexikon.get(t.length >= 2 && t === t.toUpperCase() && /[A-Z]/.test(t) ? t : t.toLowerCase()) ?? lexikon.get(t.toLowerCase())
        ?? [...t.toLowerCase()].map((b) => lexikon.get(b) || '').join(' ');
      [...ph].forEach(laut); laut(' ');
    }
    if (k === woerter.length - 1 && !/[.?!]/.test(w)) laut('.');
  });
  seq.push(nr('$'));
  return seq;
}
function skriptLaden(src) { return new Promise((ok, nein) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => nein(new Error(src)); document.head.append(s); }); }
async function vorbereiten() {
  if (sitzung) return sitzung;
  sitzung = (async () => {
    await lexikonLaden();
    if (!window.ort) await skriptLaden('vendor/ort/ort.wasm.min.js');
    window.ort.env.wasm.wasmPaths = new URL('vendor/ort/', location.href).href; window.ort.env.wasm.numThreads = 1; window.ort.env.logLevel = 'error';
    window.ort.env.wasm.wasmBinary = await (await fetch('vendor/ort/ort-wasm-simd-threaded.wasm.txt')).arrayBuffer();
    const r = await (await caches.open(SPEICHER)).match(MODELL); if (!r) throw new Error('Stimmdatei fehlt');
    return window.ort.InferenceSession.create(new Uint8Array(await r.arrayBuffer()), { executionProviders: ['wasm'], graphOptimizationLevel: 'all' });
  })();
  sitzung.catch(() => { sitzung = null; });
  return sitzung;
}
async function rechne(ids, tempo) {
  const s = await vorbereiten(), ort = window.ort;
  const out = await s.run({ input: new ort.Tensor('int64', BigInt64Array.from(ids, BigInt), [1, ids.length]), input_lengths: new ort.Tensor('int64', BigInt64Array.from([BigInt(ids.length)]), [1]),
    scales: new ort.Tensor('float32', Float32Array.from([0.667, 1 / tempo, 0.8]), [3]) });
  return out[s.outputNames[0]].data;
}
/** Sätze schneiden: an Satzzeichen, höchstens etwa 220 Zeichen je Stück (sonst rechnet es zu lange am Stück). */
export function saetze(text) {
  const roh = text.match(/[^.!?]+[.!?]?/g) || [], out = [];
  for (let s of roh) { s = s.trim(); while (s.length > 220) { const k = s.lastIndexOf(',', 220); const cut = k > 60 ? k + 1 : 220; out.push(s.slice(0, cut)); s = s.slice(cut).trim(); } if (s) out.push(s); }
  return out;
}

/* ───────────── Sprechen ───────────── */
let runde = 0, quellen = [];
const meldeSprechen = (an) => { try { window.dispatchEvent(new CustomEvent('mt-spricht', { detail: an })); } catch { /* egal */ } };
export function stopp() { runde++; quellen.forEach((q) => { try { q.stop(); } catch { /* schon aus */ } }); quellen = []; try { speechSynthesis?.cancel(); } catch { /* egal */ } meldeSprechen(false); }
/** Liest einen Text (Sprechfassung) vor. Liefert, womit gelesen wird: 'thorsten', 'geraet' oder '' (keine Stimme da). */
export async function sprich(text) {
  stopp(); const meine = runde, tempo = vorlese.tempo;
  if (!text) return '';
  // Wahl: Thorsten (oder „automatisch“, wenn er geladen ist), sonst Gerätestimme; fehlt die gewählte, nimmt sie die andere.
  const willGeraet = vorlese.stimme.startsWith('geraet:') && geraeteStimmen().length > 0;
  if (!willGeraet && (await thorsten.pruefen()) === 'bereit') {
    try {
      const a = audio(); meldeSprechen(true); let um = 0;
      await vorbereiten(); if (meine !== runde) return 'thorsten';
      for (const satz of saetze(text)) {
        const pcm = await rechne(lautNummern(satz), tempo);
        if (meine !== runde) return 'thorsten';
        const b = a.ac.createBuffer(1, pcm.length, RATE); b.copyToChannel(pcm, 0);
        const q = a.ac.createBufferSource(), g = a.ac.createGain(); g.gain.value = 1.4; q.buffer = b; q.connect(g).connect(a.out);
        um = Math.max(um, a.ac.currentTime + 0.05); q.start(um); um += b.duration + 0.12; quellen.push(q);
      }
      const ende = () => { if (meine === runde) { if (a.ac.currentTime < um - 0.05) setTimeout(ende, 150); else meldeSprechen(false); } }; ende();
      return 'thorsten';
    } catch (e) { console.warn('Thorsten', e); if (meine !== runde) return 'thorsten'; }
  }
  meldeSprechen(true);
  return geraetSprich(text, tempo, () => { if (meine === runde) meldeSprechen(false); }) ? 'geraet' : (meldeSprechen(false), '');
}
export const sprichFormel = (tex) => sprich(texSprech(tex));
if (typeof window !== 'undefined') addEventListener('hashchange', stopp);
