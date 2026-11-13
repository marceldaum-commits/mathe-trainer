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
  return window.katex.renderToString(src, { throwOnError: false, displayMode: display });
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
  close: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.500" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  check: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg>',
};

export function starsHtml(n, max = 3) {
  let s = `<span class="stars" role="img" aria-label="${n} von ${max} Sternen">`;
  for (let i = 0; i < max; i++) s += ICON.star.replace('<svg', `<svg class="${i < n ? 'on' : ''}"`);
  return s + '</span>';
}

let toastTimer;
export function toast(msg, action) {
  const el = $('#toast');
  el.innerHTML = `<span>${esc(msg)}</span>`;
  if (action) {
    const b = h(`<button type="button">${esc(action.label)}</button>`);
    b.onclick = action.run;
    el.append(b);
  }
  el.hidden = false;
  clearTimeout(toastTimer);
  if (!action) toastTimer = setTimeout(() => { el.hidden = true; }, 3200);
}

/* Töne: werden im Browser erzeugt (Web Audio) – keine Sounddateien, keine Lizenzen. */
const SOUND_KEY = 'mt.sound';
let soundOn = (() => { try { return localStorage.getItem(SOUND_KEY) !== '0'; } catch { return true; } })();
let ac = null, plingN = 0, plingT = 0;
export const sound = {
  get on() { return soundOn; },
  set on(v) { soundOn = !!v; try { localStorage.setItem(SOUND_KEY, soundOn ? '1' : '0'); } catch { /* egal */ } },
};
function tone(freq, at, dur, { type = 'sine', vol = 0.14, to = null } = {}) {
  const o = ac.createOscillator(), g = ac.createGain(), t0 = ac.currentTime + at;
  o.type = type; o.frequency.setValueAtTime(freq, t0);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(ac.destination); o.start(t0); o.stop(t0 + dur + 0.02);
}
/** Spielt einen kurzen Ton: 'tap', 'pling' (Stern, steigt bei Serien), 'ok', 'bad', 'win', 'roll'. */
export function sfx(name) {
  if (!soundOn) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac ||= new AC();
    if (ac.state === 'suspended') ac.resume();
    if (name === 'tap') tone(520, 0, 0.05, { type: 'triangle', vol: 0.07 });
    else if (name === 'pling') {
      const now = performance.now();
      plingN = now - plingT < 2500 ? Math.min(plingN + 1, 7) : 0; plingT = now;
      const f = 784 * 2 ** ([0, 2, 4, 5, 7, 9, 11, 12][plingN] / 12);
      tone(f, 0, 0.22, { type: 'sine', vol: 0.16 }); tone(f * 2, 0.02, 0.18, { type: 'sine', vol: 0.05 });
    } else if (name === 'ok') { tone(659, 0, 0.13, { type: 'triangle' }); tone(988, 0.1, 0.22, { type: 'triangle' }); }
    else if (name === 'bad') tone(233, 0, 0.24, { type: 'sine', vol: 0.13, to: 165 });
    else if (name === 'roll') tone(180, 0, 0.5, { type: 'sine', vol: 0.05, to: 320 });
    else if (name === 'win') [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, i === 3 ? 0.5 : 0.16, { type: 'triangle', vol: 0.15 }));
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

export const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
