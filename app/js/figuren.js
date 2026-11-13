// Selbst gezeichnete Figuren: einfache Vektor-Formen mit Gesicht und einem Mathe-Zeichen auf dem Bauch.
// Alles eigene Zeichnungen – keine fremden Bilder. Jede Figur entsteht aus Name und Zeichen immer gleich.
import { esc } from './ui.js';

export const FORMEN = {
  blob: 'M50 8c22 0 36 16 36 40 0 26-12 44-36 44S14 74 14 48C14 24 28 8 50 8z',
  eck: 'M24 12h52a10 10 0 0 1 10 10v52a16 16 0 0 1-16 16H30a16 16 0 0 1-16-16V22a10 10 0 0 1 10-10z',
  zack: 'M50 5l11 13 17-5-1 18 15 9-11 13 6 17-18 1-8 16-11-14-17 5 2-18-15-10 12-12-5-17 17 1z',
  tropfen: 'M50 5c13 19 34 33 34 53a34 34 0 0 1-68 0C16 38 37 24 50 5z',
  geist: 'M16 48a34 38 0 0 1 68 0v44l-11-9-11 9-12-9-12 9-11-9-11 9z',
  berg: 'M44 12a7 7 0 0 1 12 0l34 66a9 9 0 0 1-8 13H18a9 9 0 0 1-8-13z',
};
export const FARBEN = [['#ff7418', '#d85042'], ['#2f6fd0', '#173a74'], ['#3fbf88', '#177a52'], ['#8a5cf0', '#4a2ea8'], ['#f0b429', '#d9730d'], ['#e0559a', '#9c2b6a']];

/** Kleine, feste Streuzahl aus einem Text – damit dieselbe Figur immer gleich aussieht. */
export function streu(text) {
  let x = 2166136261;
  for (const c of String(text)) { x ^= c.codePointAt(0); x = Math.imul(x, 16777619); }
  return x >>> 0;
}

let lauf = 0;
/** Zeichnet eine Figur als SVG. opt: { form, farbe:[hell,dunkel], zeichen, horn, augen, grau } */
export function figur({ form = 'blob', farbe = FARBEN[0], zeichen = '', horn = 0, augen = 2, grau = false, titel = '' } = {}) {
  const id = `fg${++lauf}`, y = form === 'berg' ? 58 : form === 'tropfen' ? 52 : 40;
  const auge = (x) => `<circle cx="${x}" cy="${y}" r="7.5" fill="#fff"/><circle cx="${x + 1.5}" cy="${y + 1.5}" r="3.4" fill="#0d1733"/>`;
  const eyes = augen === 1 ? auge(50) : augen === 3 ? auge(34) + auge(50) + auge(66) : auge(39) + auge(61);
  const horns = horn === 1 ? '<path d="M30 16l-8-13 15 7zM70 16l8-13-15 7z"/>' : horn === 2 ? '<path d="M50 9l-6-9h12z"/><circle cx="50" cy="2" r="3"/>' : '';
  const size = [...zeichen].length > 2 ? 15 : 20;
  return `<svg class="figur${grau ? ' grau' : ''}" viewBox="0 0 100 100" role="img" aria-label="${esc(titel)}">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${farbe[0]}"/><stop offset="1" stop-color="${farbe[1]}"/></linearGradient></defs>
    <g fill="url(#${id})">${horns}<path d="${FORMEN[form] || FORMEN.blob}"/></g>${eyes}
    ${zeichen ? `<text x="50" y="${y + 34}" text-anchor="middle" font-size="${size}" font-weight="900" fill="#fff" font-family="system-ui,sans-serif">${esc(zeichen)}</text>` : `<path d="M40 ${y + 20}q10 8 20 0" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>`}
  </svg>`;
}

/** Figur zu einem Namen: Form, Farbe, Hörner und Augen folgen fest aus dem Namen. */
export function figurFor(name, zeichen = '', extra = {}) {
  const s = streu(name), formen = Object.keys(FORMEN);
  return figur({ form: formen[s % formen.length], farbe: FARBEN[(s >>> 4) % FARBEN.length], horn: (s >>> 8) % 3, augen: [2, 2, 1, 3][(s >>> 11) % 4], zeichen, titel: name, ...extra });
}

/** Pi – die Begleitfigur durch die Geschichte. */
export const pi = (extra = {}) => figur({ form: 'blob', farbe: ['#73e0a9', '#177a52'], zeichen: 'π', horn: 2, augen: 2, titel: 'Pi', ...extra });
