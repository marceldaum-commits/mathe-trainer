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

export function buzz(ms = 12) {
  try { navigator.vibrate?.(ms); } catch { /* nicht überall erlaubt */ }
}

export const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
