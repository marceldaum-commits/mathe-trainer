// Glücksrad: Felder färben, bis die Gewinnchance stimmt. Wahrscheinlichkeit = günstige Felder durch alle Felder –
// und die Chance zu verlieren ist der Rest bis 1.
import { sfx, buzz, funken, tex } from '../ui.js';
import { store } from '../store.js';
import { piKlein } from './strahl.js';

const R = (felder, z, n, verlieren = false) => ({ felder, z, n, verlieren, soll: verlieren ? felder - (z * felder) / n : (z * felder) / n });
const L1 = [R(4, 1, 4), R(6, 1, 2), R(8, 3, 8)];
const L2 = [R(8, 1, 4), R(6, 2, 3), R(10, 1, 5)];
const L3 = [R(8, 3, 4), R(12, 1, 3), R(10, 3, 5), R(12, 5, 6)];
const L4 = [R(6, 1, 3, true), R(8, 1, 4, true), R(10, 2, 5, true)];
const L5 = [R(12, 1, 4, true), R(12, 5, 12), R(10, 7, 10, true), R(12, 2, 3, true)];
/** Eigene Level für jede der fünf Schwierigkeiten. */
export const levelsFor = (lv) => [L1, L2, L3, L4, L5][Math.min(5, Math.max(1, lv | 0 || 3)) - 1];
export const passt = (M, gefaerbt) => gefaerbt === M.soll;

export function gluecksrad(el, ctx) {
  const LS = levelsFor(store.level);
  let mi = 0, fehler = 0, versuche = 0, fertig = false, an = new Set();
  el.innerHTML = `
    <div class="stack kind-spiel">
      <div class="mission"><b class="tag" id="gr-n"></b><p><span id="gr-t"></span><small id="gr-s"></small></p>${piKlein()}</div>
      <div class="stage kind-buehne"><svg id="gr" viewBox="0 0 320 200" role="group" aria-label="Glücksrad mit Feldern zum Färben"></svg></div>
      <div id="gr-note"></div>
      <div class="row"><button class="btn block" id="gr-go" type="button">Prüfen</button></div>
    </div>`;
  const $ = (s) => el.querySelector(s), svg = $('#gr'), go = $('#gr-go'), note = $('#gr-note');
  const M = () => LS[mi];
  function zeichne() {
    const n = M().felder, t = [];
    for (let i = 0; i < n; i++) { const a0 = (i / n) * 2 * Math.PI - Math.PI / 2, a1 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2, p = (a) => `${(160 + 88 * Math.cos(a)).toFixed(1)} ${(100 + 88 * Math.sin(a)).toFixed(1)}`;
      t.push(`<path class="gr-feld ${an.has(i) ? 'an' : ''}" data-i="${i}" d="M160 100 L${p(a0)} A88 88 0 0 1 ${p(a1)} Z" tabindex="0" role="button" aria-pressed="${an.has(i)}" aria-label="Feld ${i + 1}"/>`); }
    t.push('<circle cx="160" cy="100" r="9" fill="var(--head)"/><path d="M160 4 l-9 -0 l9 16 l9 -16 Z" fill="var(--head)"/>');
    svg.innerHTML = t.join('');
    svg.querySelectorAll('.gr-feld').forEach((f) => { const tippe = () => { if (fertig) return; const i = +f.dataset.i; if (an.has(i)) an.delete(i); else an.add(i); sfx('tap'); zeichne(); }; f.onclick = tippe; f.onkeydown = (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); tippe(); } }; });
    $('#gr-s').textContent = `${an.size} von ${n} Feldern sind Gewinnfelder.`;
  }
  function lade() {
    const m = M(); an = new Set(); fertig = false; versuche = 0;
    $('#gr-n').textContent = `${mi + 1}/${LS.length}`;
    $('#gr-t').innerHTML = m.verlieren ? `Färbe Gewinnfelder so, dass die Chance zu <b>verlieren</b> ${tex(`\\tfrac{${m.z}}{${m.n}}`)} ist.` : `Färbe so viele Felder, dass die Gewinnchance ${tex(`\\tfrac{${m.z}}{${m.n}}`)} ist.`;
    note.innerHTML = ''; go.textContent = 'Prüfen'; delete go.dataset.next; zeichne();
  }
  go.onclick = () => {
    if (go.dataset.next) { if (mi < LS.length - 1) { mi++; lade(); return; } ctx.done({ stars: fehler === 0 ? 3 : fehler <= 2 ? 2 : 1, mistakes: fehler }); return; }
    const m = M(), k = an.size;
    if (passt(m, k)) { fertig = true; sfx('ok'); buzz(); funken(svg);
      note.innerHTML = `<div class="note ok"><b>Stimmt!</b> ${k} von ${m.felder} Feldern gewinnen: ${tex(`P(\\text{Gewinn})=\\tfrac{${k}}{${m.felder}}`)}.${m.verlieren ? ` Verlieren ist der Rest: ${tex(`1-\\tfrac{${k}}{${m.felder}}=\\tfrac{${m.felder - k}}{${m.felder}}`)}.` : ''}</div>`;
      go.dataset.next = '1'; go.textContent = mi < LS.length - 1 ? 'Weiter' : 'Fertig'; ctx.progress((mi + 1) / LS.length); }
    else { fehler++; versuche++; sfx('bad');
      note.innerHTML = `<div class="note tip">${k < m.soll ? 'Das sind noch zu wenige Gewinnfelder.' : 'Das sind zu viele Gewinnfelder.'}${versuche >= 2 ? (m.verlieren ? ` Verlieren soll ${m.z} von ${m.n} sein – Gewinnen ist der Rest.` : ` ${m.felder} Felder in ${m.n} gleiche Gruppen: je ${m.felder / m.n} Felder.`) : ''}</div>`; }
  };
  lade(); ctx.progress(0);
  return () => {};
}
