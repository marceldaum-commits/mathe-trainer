// Selbst gezeichnete Figuren: einfache Vektor-Formen mit Gesicht und einem Mathe-Zeichen auf dem Bauch.
// Alles eigene Zeichnungen – keine fremden Bilder. Jede Figur entsteht aus Name und Zeichen immer gleich.
import { esc } from './ui.js';
import { store } from './store.js';

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
export function figur({ form = 'blob', farbe = FARBEN[0], zeichen = '', horn = 0, augen = 2, grau = false, titel = '', drauf = '' } = {}) {
  const id = `fg${++lauf}`, y = form === 'berg' ? 58 : form === 'tropfen' ? 52 : 40;
  const auge = (x) => `<circle cx="${x}" cy="${y}" r="7.5" fill="#fff"/><circle cx="${x + 1.5}" cy="${y + 1.5}" r="3.4" fill="#0d1733"/>`;
  const eyes = augen === 1 ? auge(50) : augen === 3 ? auge(34) + auge(50) + auge(66) : auge(39) + auge(61);
  const horns = horn === 1 ? '<path d="M30 16l-8-13 15 7zM70 16l8-13-15 7z"/>' : horn === 2 ? '<path d="M50 9l-6-9h12z"/><circle cx="50" cy="2" r="3"/>' : '';
  const size = [...zeichen].length > 2 ? 15 : 20;
  return `<svg class="figur${grau ? ' grau' : ''}" viewBox="0 0 100 100" role="img" aria-label="${esc(titel)}">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${farbe[0]}"/><stop offset="1" stop-color="${farbe[1]}"/></linearGradient></defs>
    <g fill="url(#${id})">${horns}<path d="${FORMEN[form] || FORMEN.blob}"/></g>${eyes}${drauf}
    ${zeichen ? `<text x="50" y="${y + 34}" text-anchor="middle" font-size="${size}" font-weight="900" fill="#fff" font-family="system-ui,sans-serif">${esc(zeichen)}</text>` : `<path d="M40 ${y + 20}q10 8 20 0" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>`}
  </svg>`;
}

/** Figur zu einem Namen: Form, Farbe, Hörner und Augen folgen fest aus dem Namen. */
export function figurFor(name, zeichen = '', extra = {}) {
  const s = streu(name), formen = Object.keys(FORMEN);
  return figur({ form: formen[s % formen.length], farbe: FARBEN[(s >>> 4) % FARBEN.length], horn: (s >>> 8) % 3, augen: [2, 2, 1, 3][(s >>> 11) % 4], zeichen, titel: name, ...extra });
}

/** Pi – die Begleitfigur durch die Geschichte. */
const stern = (cx, cy, r) => `<path d="M${Array.from({ length: 10 }, (_, i) => { const a = (i * Math.PI) / 5 - Math.PI / 2, q = i % 2 ? r * 0.45 : r; return `${(cx + q * Math.cos(a)).toFixed(1)} ${(cy + q * Math.sin(a)).toFixed(1)}`; }).join('L')}Z" fill="#f0b429" stroke="#d9730d" stroke-width="1.2"/>`;
/** Outfits für Pi: [Kennung, Name, nötige Sterne, Zeichnung]. Eigene Zeichnungen. */
export const HUETE = [
  ['', 'Ohne', 0, ''],
  ['kappe', 'Kappe', 10, '<path d="M32 16a18 14 0 0 1 36 0z" fill="#2f6fd0"/><path d="M62 13h15a3 3 0 0 1 0 6H65z" fill="#173a74"/>'],
  ['party', 'Partyhut', 30, '<path d="M50 0l12 18H38z" fill="#e0559a"/><path d="M44 9h12M41 14h18" stroke="#fff" stroke-width="2"/><circle cx="50" cy="2" r="2.6" fill="#f0b429"/>'],
  ['zylinder', 'Zylinder', 60, '<rect x="38" y="0" width="24" height="13" rx="2" fill="#101b43"/><rect x="38" y="8" width="24" height="3.5" fill="#ff7418"/><rect x="30" y="12" width="40" height="4.5" rx="2.2" fill="#101b43"/>'],
  ['doktor', 'Doktorhut', 100, '<path d="M50 1l24 7-24 7-24-7z" fill="#101b43"/><path d="M36 12v5q14 6 28 0v-5" fill="#101b43"/><path d="M71 9v9" stroke="#f0b429" stroke-width="2"/><circle cx="71" cy="19.5" r="2.2" fill="#f0b429"/>'],
  ['krone', 'Krone', 150, '<path d="M33 17l1-14 9 8 7-11 7 11 9-8 1 14z" fill="#f0b429" stroke="#d9730d" stroke-width="1.5" stroke-linejoin="round"/><circle cx="50" cy="12" r="2" fill="#e0559a"/>'],
];
export const BRILLEN = [
  ['', 'Ohne', 0, ''],
  ['rund', 'Runde Brille', 20, '<g fill="none" stroke="#101b43" stroke-width="2.6"><circle cx="39" cy="40" r="10.5"/><circle cx="61" cy="40" r="10.5"/><path d="M49.5 40h1M28.5 39l-9-3M71.5 39l9-3"/></g>'],
  ['sonne', 'Sonnenbrille', 45, '<g fill="#101b43"><rect x="27" y="33" width="21" height="14" rx="6"/><rect x="52" y="33" width="21" height="14" rx="6"/><rect x="47" y="37" width="6" height="3"/></g><path d="M31 37l6 0M56 37l6 0" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".6"/>'],
  ['sterne', 'Sternenbrille', 80, `${stern(39, 40, 12)}${stern(61, 40, 12)}<circle cx="39" cy="40" r="3" fill="#0d1733"/><circle cx="61" cy="40" r="3" fill="#0d1733"/>`],
];
/** Ist ein Teil mit so vielen Sternen schon frei? */
export const outfitFrei = (liste, id, sterne = store.sterne) => { const t = liste.find((x) => x[0] === id); return !!t && sterne >= t[2]; };
/** Gewähltes Outfit – nur Teile, die es gibt und die frei sind. */
export function outfitJetzt(o = store.outfit, sterne = store.sterne) {
  return { hut: outfitFrei(HUETE, o.hut, sterne) ? o.hut : '', brille: outfitFrei(BRILLEN, o.brille, sterne) ? o.brille : '' };
}
export const pi = (extra = {}, o = outfitJetzt()) => figur({ form: 'blob', farbe: ['#73e0a9', '#177a52'], zeichen: 'π', horn: o.hut ? 0 : 2, augen: 2, titel: 'Pi',
  drauf: (BRILLEN.find((x) => x[0] === o.brille)?.[3] || '') + (HUETE.find((x) => x[0] === o.hut)?.[3] || ''), ...extra });
