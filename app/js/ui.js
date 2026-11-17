// Kleine Helfer für Oberfläche und Formeln.
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function h(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

/** LaTeX → HTML (KaTeX ist als globales Skript geladen). */
export function tex(src, display = false) {
  // Abgesetzte Formeln mit mehreren Teilen („\\qquad“) stehen untereinander – nebeneinander liefen sie auf dem Handy aus dem Bild.
  if (display) { const teile = texTeile(src); if (teile.length > 1) return teile.map((t) => window.katex.renderToString(t, { throwOnError: false, displayMode: true })).join(''); }
  return window.katex.renderToString(src, { throwOnError: false, displayMode: display });
}
/** Teilt eine Formel an jedem „\\qquad“, das nicht in Klammern oder einer Umgebung (\\begin…\\end) steht. */
export function texTeile(src) {
  const s = String(src), teile = []; let tief = 0, start = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '\\') {
      if (s.startsWith('\\begin', i)) tief++; else if (s.startsWith('\\end', i)) tief--;
      else if (s.startsWith('\\left', i) && !/[a-z]/i.test(s[i + 5] || '')) tief++; else if (s.startsWith('\\right', i) && !/[a-z]/i.test(s[i + 6] || '')) tief--;
      else if (tief === 0 && s.startsWith('\\qquad', i) && !/[a-z]/i.test(s[i + 6] || '')) { teile.push(s.slice(start, i)); start = i + 6; i += 5; continue; }
      i++; continue;   // maskiertes Zeichen (\\{, \\\\ …) überspringen
    }
    if (c === '{') tief++; else if (c === '}') tief--;
  }
  teile.push(s.slice(start));
  const aus = teile.map((t) => t.trim()).filter(Boolean);
  return aus.length ? aus : [s];
}
/** Abgesetzte Formeln, die breiter sind als ihr Platz, etwas kleiner setzen (bis etwa zwei Drittel); der Rest bleibt wischbar. */
export function formelnEinpassen(root = document) {
  for (const el of root.querySelectorAll('.katex-display')) {
    const platz = el.clientWidth; if (!platz || el.dataset.fit === String(platz)) continue;
    el.style.fontSize = ''; el.dataset.fit = String(platz);
    const breit = el.scrollWidth; if (breit <= platz + 1) continue;
    const fs = parseFloat(getComputedStyle(el).fontSize) || 16;
    el.style.fontSize = `${Math.max(fs * 0.66, (fs * platz) / breit - 0.3).toFixed(2)}px`;
  }
}

export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export const ICON = {
  fire: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c1 4 5 5.500 5 10.500a5 5 0 0 1-10 0c0-1.700.700-3 1.500-4 .300 1.500 1 2.300 2 2.500C10 8 10.500 5 12 2z"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2 3.100 6.300 6.900 1-5 4.900 1.200 6.800-6.200-3.200L5.800 21 7 14.200 2 9.300l6.900-1z"/></svg>',
  right: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.500" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>',
  left: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.500" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 6-6 6 6 6"/></svg>',
  speaker: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.500 8.500 0 0 1 0 12"/></svg>',
  mute: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="m17 9 5 6M22 9l-5 6"/></svg>',
  moon: '<svg class="moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  sun: '<svg class="sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  gear: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8"/></svg>',
  close: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.500" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  check: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg>',
};

export function starsHtml(n, max = 3) {
  let s = `<span class="stars" role="img" aria-label="${n} von ${max} Sternen">`;
  for (let i = 0; i < max; i++) s += ICON.star.replace('<svg', `<svg class="${i < n ? 'on' : ''}"`);
  return s + '</span>';
}

let toastTimer;
/** Kurze Meldung oben. Mit Knopf bleibt sie 7 Sekunden, mit sticky bis zum Tippen (z. B. Update-Hinweis). */
export function toast(msg, action, { sticky = false } = {}) {
  const el = $('#toast');
  el.innerHTML = `<span>${esc(msg)}</span>`;
  if (action) {
    const b = h(`<button type="button">${esc(action.label)}</button>`);
    b.onclick = action.run;
    el.append(b);
  }
  el.hidden = false;
  clearTimeout(toastTimer);
  if (!sticky) toastTimer = setTimeout(() => { el.hidden = true; }, action ? 7000 : 3200);
}

/* Klang: alles wird im Browser erzeugt (Web Audio) – selbst komponiert, keine Sounddateien, keine fremden Samples, keine Lizenzen.
   Klang-Identität: ruhig, konzentriert, erwachsen – weiches Piano in D-Dur mit sanften Flächen. Web und Android klingen gleich (dieselbe Seite).
   sound.on ist die Stummschaltung oben (gilt für alles). klang regelt Effekte und Lernmusik getrennt, jeweils mit eigener Lautstärke. */
const SOUND_KEY = 'mt.sound', KLANG_KEY = 'mt.klang';
let soundOn = (() => { try { return localStorage.getItem(SOUND_KEY) !== '0'; } catch { return true; } })();
// Musik ab Werk an (Marcel, 17.11.2026: „beim Start direkt laufen“) – „Musik aus“ in den Einstellungen bleibt gemerkt.
const KLANG_VORGABE = { fx: true, fxVol: 0.7, musik: true, musikVol: 0.5, pruefung: false };
let klangWerte = (() => { try { return { ...KLANG_VORGABE, ...JSON.parse(localStorage.getItem(KLANG_KEY) || '{}') }; } catch { return { ...KLANG_VORGABE }; } })();
let ac = null, bus = null, plingN = 0, plingT = 0, inPruefung = false;
const klangMelder = new Set();   // wer wissen will, dass sich am Klang etwas geändert hat (die Lernmusik)
const melde = () => klangMelder.forEach((f) => { try { f(); } catch { /* weiter */ } });
export const sound = {
  get on() { return soundOn; },
  set on(v) { soundOn = !!v; try { localStorage.setItem(SOUND_KEY, soundOn ? '1' : '0'); } catch { /* egal */ } melde(); },
};
const zahl01 = (v, d) => (Number.isFinite(+v) ? Math.min(1, Math.max(0, +v)) : d);
/** Einstellungen für Effekte und Lernmusik (werden gemerkt). */
export const klang = {
  get fx() { return klangWerte.fx !== false; }, get fxVol() { return zahl01(klangWerte.fxVol, 0.7); },
  get musik() { return klangWerte.musik === true; }, get musikVol() { return zahl01(klangWerte.musikVol, 0.5); },
  get pruefung() { return klangWerte.pruefung === true; },
  setze(werte) { klangWerte = { ...klangWerte, ...werte }; try { localStorage.setItem(KLANG_KEY, JSON.stringify(klangWerte)); } catch { /* egal */ } melde(); },
  /** Prüfung läuft (Abi-Modus, Probeklausur): Klang standardmäßig aus, außer „Klang auch in Prüfungen“ ist an. */
  set pruefungLaeuft(v) { inPruefung = !!v; melde(); },
  get stumm() { return !soundOn || (inPruefung && !klangWerte.pruefung); },
  beobachte(f) { klangMelder.add(f); return () => klangMelder.delete(f); },
};
/* Vorlesen mit der Stimme „Nova“ (KI-generiert): Einstellung an/aus wird gemerkt (von Haus aus aus).
   Die Stimme selbst steckt in vorlesen.js und wird erst geladen, wenn jemand vorlesen lässt. */
const VORLESE_KEY = 'mt.vorlesen';
export const TEMPI = [0.75, 0.9, 1, 1.15, 1.3, 1.5];
let vorleseWerte = (() => { try { return { an: false, ...JSON.parse(localStorage.getItem(VORLESE_KEY) || '{}') }; } catch { return { an: false }; } })();
export const vorlese = {
  get an() { return vorleseWerte.an === true; },
  /** Sprechtempo (Marcel): 1,0 = Tempo des Servers. */
  get tempo() { return TEMPI.includes(+vorleseWerte.tempo) ? +vorleseWerte.tempo : 1; },
  /** Qualität für „offline laden“: 'normal' (Standard) oder 'best'. */
  get qual() { return vorleseWerte.qual === 'best' ? 'best' : 'normal'; },
  setze(w) { vorleseWerte = { ...vorleseWerte, ...w }; try { localStorage.setItem(VORLESE_KEY, JSON.stringify(vorleseWerte)); } catch { /* egal */ } },
};
/** Knopf „Vorlesen“ – nur, wenn Vorlesen eingeschaltet ist. */
export const vorleseKnopf = (was = 'Vorlesen') => (vorlese.an ? `<button class="btn ghost small vl-knopf" type="button" aria-label="${esc(was)}">${ICON.speaker || ''}<span>Vorlesen</span></button>` : '');
let vorleseGeladen = false;
/** Den Player fürs Vorlesen noch während des Antippens freigeben: In der Android-App (WebView) darf Ton nur nach einem Tippen starten –
 *  Nova kommt aber erst Sekunden später aus dem Netz. Einmal still angespielt, darf derselbe Player danach weiterspielen. */
export function vorleseFreigeben() {
  try {
    let el = window.__mtVorleser; if (!el) { el = window.__mtVorleser = new Audio(); el.preservesPitch = true; }
    if (el.dataset.frei) return;
    const n = 800, buf = new ArrayBuffer(44 + n), v = new DataView(buf), w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
    w(0, 'RIFF'); v.setUint32(4, 36 + n, true); w(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, 8000, true); v.setUint32(28, 8000, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true); w(36, 'data'); v.setUint32(40, n, true);
    for (let i = 0; i < n; i++) v.setUint8(44 + i, 128);   // 0,1 s Stille
    el.src = URL.createObjectURL(new Blob([buf], { type: 'audio/wav' })); el.play().then(() => { el.dataset.frei = '1'; }).catch(() => {});
  } catch { /* ohne Freigabe weiter */ }
}
/** Vorlesen anhalten (z. B. bei der nächsten Aufgabe). */
export const vorleseStopp = () => { if (vorleseGeladen) import('./vorlesen.js').then((V) => V.stopp()).catch(() => {}); };
/** Theorie: neben jede Abschnitts-Überschrift einen Knopf „Vorlesen“ (nicht im Ausdruck). Diese Texte sind vorab vertont. */
export function vorleseKnoepfe(root) {
  if (!vorlese.an) return;
  root.querySelectorAll('.t-teil').forEach((sec) => { const h2 = sec.querySelector('h2'); if (!h2 || sec.querySelector('.vl-knopf')) return;
    h2.insertAdjacentHTML('afterend', vorleseKnopf(`${h2.textContent} vorlesen`)); const b = sec.querySelector('.vl-knopf'); b.classList.add('noprint'); b.onclick = () => vorlies(sec, b, 'fest'); });
}
/** Liest einen Bereich der Seite vor (lädt den Baustein beim ersten Mal nach). Noch einmal tippen hält an.
 *  art: 'fest' (vorab vertont) · 'aufgabe' (erst in der Aufgabe entstanden). */
export async function vorlies(el, knopf = null, art = 'aufgabe') {
  vorleseFreigeben();   // noch im Antippen – vor allem, was wartet
  const V = await import('./vorlesen.js'); vorleseGeladen = true;
  if (knopf?.classList.contains('spricht')) { V.stopp(); return; }
  document.querySelectorAll('.vl-knopf.spricht').forEach((b) => { b.classList.remove('spricht', 'laedt'); const t = b.querySelector('span'); if (t) t.textContent = 'Vorlesen'; });
  const wort = knopf?.querySelector('span'), setze = (t) => { if (wort) wort.textContent = t; };
  knopf?.classList.add('spricht', 'laedt'); setze('Lädt …');   // Nova braucht für neue Sätze 2–3 Sekunden
  const { hinweis } = await V.sprich(V.sprechText(el), art, { beimStart: () => { knopf?.classList.remove('laedt'); setze('Stopp'); } });
  knopf?.classList.remove('spricht', 'laedt'); setze('Vorlesen');
  if (hinweis && knopf?.isConnected) toast(hinweis);
}
const D4 = 293.66, ton = (st) => D4 * 2 ** (st / 12);   // Halbtöne über d′
/** Gemeinsamer Klangweg (Effekte und Musik): sanfter Tiefpass und ein kleiner Raum. Erst nach einer Berührung erzeugt. */
export function audio() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ac) {
    ac = new AC();
    const out = ac.createDynamicsCompressor(); out.threshold.value = -14; out.ratio.value = 3; out.connect(ac.destination);
    const raum = ac.createConvolver(), len = Math.floor(ac.sampleRate * 1.8), ir = ac.createBuffer(2, len, ac.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); let s = 12345 + c * 777; for (let i = 0; i < len; i++) { s = (s * 1103515245 + 12345) >>> 0; d[i] = ((s / 4294967296) * 2 - 1) * (1 - i / len) ** 3; } }
    raum.buffer = ir; const nass = ac.createGain(); nass.gain.value = 0.22; raum.connect(nass).connect(out);
    const fx = ac.createGain(); fx.connect(out); fx.connect(raum);
    const musik = ac.createGain(); musik.gain.value = 0; musik.connect(out); musik.connect(raum);
    bus = { out, raum, fx, musik };
  }
  if (ac.state === 'suspended') ac.resume().catch(() => {});
  return { ac, ...bus };
}
// Nur für die Browser-Tests: Zugriff auf den Klangweg, um den Pegel zu messen.
if (globalThis.window?.__mtTest) window.__mtAudio = () => (ac ? { ac, ...bus, klang, sfx } : null);
/** Weicher Klavierton: Grundton plus leise Obertöne, schneller Anschlag, langes Ausklingen, Filz-Filter. */
export function klavier(a, ziel, f, t0, dauer = 1.2, vol = 0.12) {
  const { ac: c } = a, g = c.createGain(), lp = c.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.setValueAtTime(Math.min(4200, f * 6), t0); lp.frequency.exponentialRampToValueAtTime(Math.max(500, f * 1.6), t0 + dauer * 0.8); lp.Q.value = 0.4;
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.006); g.gain.exponentialRampToValueAtTime(vol * 0.35, t0 + 0.25); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dauer);
  g.connect(lp).connect(ziel);
  [[1, 'triangle', 1, 0], [2, 'sine', 0.32, 3], [3, 'sine', 0.1, -4]].forEach(([m, typ, anteil, cent]) => {
    const o = c.createOscillator(), og = c.createGain(); o.type = typ; o.frequency.value = f * m; o.detune.value = cent; og.gain.value = anteil;
    o.connect(og).connect(g); o.start(t0); o.stop(t0 + dauer + 0.05);
  });
}
// Effekte: Halbtöne über d′. Die Erkennungsmelodie (d″ – a′ – e″ – fis″ – a″ über Dmaj9) steckt in „tag“ und „start“.
const MOTIV = [[12, 0], [7, 0.16], [14, 0.32], [16, 0.48], [19, 0.66, 1.8]];
const EFFEKTE = {
  tap: (a, z, t) => klavier(a, z, ton(24), t, 0.12, 0.035),
  ok: (a, z, t) => { klavier(a, z, ton(12), t, 0.7, 0.1); klavier(a, z, ton(19), t + 0.09, 0.9, 0.1); },
  // falsch: neutral und leise – eine offene Quinte tief unten, kein „Fehler-Brummen“
  bad: (a, z, t) => { klavier(a, z, ton(-3), t, 0.8, 0.09); klavier(a, z, ton(4), t + 0.02, 0.8, 0.06); },
  roll: (a, z, t) => [0, 4, 7, 12].forEach((s, i) => klavier(a, z, ton(s), t + i * 0.07, 0.5, 0.04)),
  win: (a, z, t) => { [[-12, 0], [4, 0], [9, 0]].forEach(([s]) => klavier(a, z, ton(s), t, 1.6, 0.05)); [[16, 0], [19, 0.12], [24, 0.26, 1.4]].forEach(([s, d, l = 0.6]) => klavier(a, z, ton(s), t + d, l, 0.11)); },
  tag: (a, z, t) => { [-12, -5, 4, 9].forEach((s) => klavier(a, z, ton(s), t, 2.4, 0.045)); MOTIV.forEach(([s, d, l = 0.7]) => klavier(a, z, ton(s), t + d, l, 0.11)); },
  start: (a, z, t) => EFFEKTE.tag(a, z, t),
  // Duell: Frage und Antwort – zwei kurze Aufstiege, der zweite landet höher
  duell: (a, z, t) => { [7, 12, 16].forEach((s, i) => klavier(a, z, ton(s), t + i * 0.09, 0.5, 0.1)); [9, 14, 19, 24].forEach((s, i) => klavier(a, z, ton(s), t + 0.4 + i * 0.09, i === 3 ? 1.4 : 0.5, 0.1)); },
  // Abi-Modus geschafft: ruhige Kadenz G – A – D, als Akkorde
  abi: (a, z, t) => { [[-7, -3, 2, 7], [-5, -1, 4, 9], [-12, 4, 9, 12, 16]].forEach((ak, i) => ak.forEach((s, k) => klavier(a, z, ton(s), t + i * 0.42 + k * 0.012, i === 2 ? 2.2 : 0.9, 0.06))); },
  // Lernserie: vier Töne nach oben, oben ein heller Glanz
  serie: (a, z, t) => { [0, 4, 7, 12].forEach((s, i) => klavier(a, z, ton(s + 12), t + i * 0.1, 0.6, 0.09)); klavier(a, z, ton(31), t + 0.42, 1.2, 0.04); },
};
/** Spielt einen Effekt: 'tap', 'pling' (Stern, steigt bei Serien), 'ok', 'bad', 'win', 'roll', 'tag', 'duell', 'abi', 'serie', 'start'. */
export function sfx(name, { probe = false } = {}) {
  if (!probe && (klang.stumm || !klang.fx)) return;
  try {
    const a = audio(); if (!a) return;
    const t = a.ac.currentTime + 0.01;
    a.fx.gain.setValueAtTime(klang.fxVol * 1.1, t);
    if (name === 'pling') {
      const now = performance.now();
      plingN = now - plingT < 2500 ? Math.min(plingN + 1, 7) : 0; plingT = now;
      klavier(a, a.fx, ton(19 + [0, 2, 4, 5, 7, 9, 11, 12][plingN]), t, 0.6, 0.09);
    } else EFFEKTE[name]?.(a, a.fx, t);
  } catch { /* ohne Ton weiter */ }
}

/** Kurzes Vibrieren plus passender Ton: kurz = Stern eingesammelt, länger = Aufgabe gelöst. */
export function buzz(ms = 12) {
  try { navigator.vibrate?.(ms); } catch { /* nicht überall erlaubt */ }
  sfx(ms <= 12 ? 'pling' : 'ok');
}

/** Konfetti-Regen (nur wenn Bewegung erlaubt ist). */
export function confetti(n = 36) {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  const box = document.createElement('div'); box.className = 'confetti'; box.setAttribute('aria-hidden', 'true');
  const colors = ['#ff7418', '#73e0a9', '#ffb020', '#173a74', '#ff9d36'];
  for (let i = 0; i < n; i++) {
    const s = document.createElement('i');
    s.style.cssText = `left:${Math.random() * 100}%;background:${colors[i % colors.length]};animation-delay:${Math.random() * 0.35}s;animation-duration:${1.1 + Math.random() * 0.9}s;--dx:${(Math.random() - 0.5) * 160}px;--rot:${Math.random() * 720 - 360}deg`;
    box.append(s);
  }
  document.body.append(box); setTimeout(() => box.remove(), 2600);
}

/** Kleiner Funkenregen an einem Element – die schnelle Belohnung für eine richtige Antwort. */
export function funken(el, n = 12) {
  if (!el || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  const r = el.getBoundingClientRect(); if (!r.width) return;
  const box = document.createElement('div'); box.className = 'funken'; box.setAttribute('aria-hidden', 'true');
  box.style.cssText = `left:${r.left + r.width / 2}px;top:${r.top + r.height / 2}px`;
  const farben = ['#ff7418', '#73e0a9', '#ffb020', '#ff9d36'];
  for (let i = 0; i < n; i++) {
    const w = (i / n) * Math.PI * 2 + Math.random() * 0.5, d = 46 + Math.random() * 50, s = document.createElement('i');
    s.style.cssText = `background:${farben[i % farben.length]};--fx:${Math.cos(w) * d}px;--fy:${Math.sin(w) * d - 14}px;animation-delay:${Math.random() * 0.06}s`;
    box.append(s);
  }
  document.body.append(box); setTimeout(() => box.remove(), 900);
}

/** Drucken bzw. als PDF speichern. In der Android-App übernimmt das die App selbst (dort kann die Seite nicht drucken). */
export function drucken(titel = 'Mathe-Trainer') {
  if (typeof window.MTApp?.drucken === 'function') window.MTApp.drucken(String(titel).slice(0, 60)); else window.print();
}
export const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/* Hell/Dunkel: gleiche Logik wie auf der Website (gespeicherte Wahl, sonst Geräte-Einstellung). */
const LOOK_KEY = 'mt.look';
const storedLook = () => { try { const v = localStorage.getItem(LOOK_KEY); return v === 'hell' || v === 'dunkel' ? v : null; } catch { return null; } };
export const look = {
  get dark() { return document.documentElement.getAttribute('data-look') === 'dunkel'; },
  apply(v, save) {
    document.documentElement.setAttribute('data-look', v);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', v === 'dunkel' ? '#0b1330' : '#ffffff');
    if (save) { try { localStorage.setItem(LOOK_KEY, v); } catch { /* privater Modus: nur diese Sitzung */ } }
    window.dispatchEvent(new Event('mt-look'));   // Zeichenflächen malen sich in den neuen Farben neu
  },
  toggle() { this.apply(this.dark ? 'hell' : 'dunkel', true); },
  /** Folgt dem Gerät, solange nichts gewählt wurde. */
  follow() {
    this.apply(this.dark ? 'dunkel' : 'hell', false);
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    mq?.addEventListener?.('change', () => { if (!storedLook()) this.apply(mq.matches ? 'dunkel' : 'hell', false); });
  },
};
/** Meldet eine Zeichenfunktion an, die beim Wechsel Hell/Dunkel erneut läuft. Liefert die Abmelde-Funktion. */
export function onLook(fn) { window.addEventListener('mt-look', fn); return () => window.removeEventListener('mt-look', fn); }
