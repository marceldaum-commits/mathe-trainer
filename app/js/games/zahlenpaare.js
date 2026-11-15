// Zahlen-Paare: Zwei Zahlen antippen, die zusammen die Zielzahl ergeben. Wer die „Freunde“ einer runden Zahl kennt,
// rechnet später geschickt: 37 + 48 + 63 = (37 + 63) + 48.
import { sfx, buzz, funken } from '../ui.js';
import { store } from '../store.js';
import { piKlein } from './strahl.js';

const R = (ziel, ...paare) => ({ ziel, paare, zahlen: paare.flat() });
const L1 = [R(10, [3, 7], [4, 6], [2, 8]), R(20, [5, 15], [8, 12], [9, 11]), R(10, [1, 9], [5, 5], [6, 4], [7, 3])];
const L2 = [R(20, [3, 17], [6, 14], [9, 11]), R(50, [20, 30], [15, 35], [5, 45]), R(100, [40, 60], [25, 75], [10, 90], [45, 55])];
const L3 = [R(100, [37, 63], [48, 52], [15, 85]), R(100, [29, 71], [44, 56], [8, 92], [66, 34]), R(50, [17, 33], [26, 24], [9, 41], [38, 12])];
const L4 = [R(100, [27, 73], [46, 54], [19, 81], [62, 38]), R(1000, [250, 750], [400, 600], [125, 875], [310, 690]), R(200, [65, 135], [88, 112], [47, 153], [120, 80])];
const L5 = [R(1000, [365, 635], [480, 520], [275, 725], [199, 801]), R(500, [137, 363], [248, 252], [75, 425], [316, 184]), R(1000, [455, 545], [72, 928], [609, 391], [840, 160]), R(250, [125, 125], [68, 182], [99, 151], [37, 213])];
/** Eigene Level für jede der fünf Schwierigkeiten. */
export const levelsFor = (lv) => [L1, L2, L3, L4, L5][Math.min(5, Math.max(1, lv | 0 || 3)) - 1];
/** Feste, gemischte Reihenfolge der Kärtchen (damit Paare nicht nebeneinander liegen). */
export const gemischt = (M) => { const k = M.paare.length; return M.paare.flatMap((p, i) => [{ v: p[0], i: 2 * i }, { v: M.paare[(i + 2) % k][1], i: 2 * ((i + 2) % k) + 1 }]); };

export function zahlenpaare(el, ctx) {
  const LS = levelsFor(store.level);
  let mi = 0, fehler = 0, wahl = null, weg = new Set();
  el.innerHTML = `
    <div class="stack kind-spiel">
      <div class="mission"><b class="tag" id="zp-n"></b><p><span id="zp-t"></span><small id="zp-s"></small></p>${piKlein()}</div>
      <div class="stage kind-buehne"><div class="zp-feld" id="zp"></div></div>
      <div id="zp-note"></div>
      <div class="row"><button class="btn block" id="zp-go" type="button" hidden>Weiter</button></div>
    </div>`;
  const $ = (s) => el.querySelector(s), feld = $('#zp'), go = $('#zp-go'), note = $('#zp-note');
  const M = () => LS[mi];
  function zeichne() {
    feld.innerHTML = gemischt(M()).map(({ v, i }) => `<button class="zp-karte ${weg.has(i) ? 'weg' : ''} ${wahl === i ? 'sel' : ''}" type="button" data-i="${i}" data-v="${v}" ${weg.has(i) ? 'disabled' : ''}>${v}</button>`).join('');
    feld.querySelectorAll('.zp-karte').forEach((b) => { b.onclick = () => tippe(+b.dataset.i, +b.dataset.v); });
    $('#zp-s').textContent = `${weg.size / 2} von ${M().paare.length} Paaren gefunden.`;
  }
  function tippe(i, v) {
    if (weg.has(i)) return;
    if (wahl === null) { wahl = i; sfx('tap'); zeichne(); return; }
    if (wahl === i) { wahl = null; zeichne(); return; }
    const v1 = M().zahlen[wahl];
    if (v1 + v === M().ziel) { weg.add(wahl); weg.add(i); wahl = null; sfx('ok'); note.innerHTML = `<div class="note ok"><b>${v1} + ${v} = ${M().ziel}</b></div>`; zeichne();
      if (weg.size === M().zahlen.length) { buzz(); funken(feld); go.hidden = false; go.textContent = mi < LS.length - 1 ? 'Weiter' : 'Fertig'; ctx.progress((mi + 1) / LS.length); } }
    else { fehler++; sfx('bad'); note.innerHTML = `<div class="note tip">${v1} + ${v} = ${v1 + v} – das ${v1 + v < M().ziel ? 'ist zu wenig' : 'ist zu viel'}. Was fehlt von ${v1} bis ${M().ziel}?</div>`; wahl = null; zeichne(); }
  }
  function lade() { wahl = null; weg = new Set(); $('#zp-n').textContent = `${mi + 1}/${LS.length}`; $('#zp-t').textContent = `Finde immer zwei Zahlen, die zusammen ${M().ziel} ergeben.`; note.innerHTML = ''; go.hidden = true; zeichne(); }
  go.onclick = () => { if (mi < LS.length - 1) { mi++; lade(); return; } ctx.done({ stars: fehler === 0 ? 3 : fehler <= 3 ? 2 : 1, mistakes: fehler }); };
  lade(); ctx.progress(0);
  return () => {};
}
