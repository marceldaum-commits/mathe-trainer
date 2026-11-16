// Schatzkarte: Punkte im Koordinatensystem finden. Erst nach rechts (x), dann nach oben (y) –
// wer das einmal mit dem Finger gemacht hat, verwechselt die beiden Zahlen nicht mehr.
import { sfx, buzz, funken, tex } from '../ui.js';
import { store } from '../store.js';
import { piKlein } from './strahl.js';

const K = (min, max, ...punkte) => ({ min, max, punkte });
const L1 = [K(0, 5, [2, 1], [4, 3]), K(0, 5, [1, 4], [3, 2], [5, 5]), K(0, 5, [0, 3], [4, 0])];
const L2 = [K(0, 6, [2, 5], [5, 2]), K(0, 6, [6, 1], [1, 6], [3, 3]), K(0, 6, [0, 4], [4, 0], [5, 6])];
const L3 = [K(0, 8, [7, 2], [2, 7], [5, 5]), K(0, 8, [8, 3], [3, 8], [0, 6]), K(0, 8, [6, 0], [4, 7], [7, 4])];
const L4 = [K(-4, 4, [2, -3], [-3, 2]), K(-4, 4, [-2, -4], [4, -1], [-1, 4]), K(-4, 4, [0, -3], [-3, 0], [-4, -4])];
const L5 = [K(-5, 5, [-4, 3], [3, -4], [-5, -2]), K(-5, 5, [5, -5], [-2, 5], [0, -4]), K(-5, 5, [-3, -3], [-5, 0], [4, -1]), K(-5, 5, [-1, -5], [2, -2], [-4, 4])];
/** Eigene Level für jede der fünf Schwierigkeiten. */
export const levelsFor = (lv) => [L1, L2, L3, L4, L5][Math.min(5, Math.max(1, lv | 0 || 3)) - 1];

export function gitter(el, ctx) {
  const LS = levelsFor(store.level);
  let mi = 0, pi2 = 0, fehler = 0, gefunden = [];
  el.innerHTML = `
    <div class="stack kind-spiel">
      <div class="mission"><b class="tag" id="sk-n"></b><p><span id="sk-t"></span><small id="sk-s"></small></p>${piKlein()}</div>
      <div class="stage kind-buehne"><svg id="sk" viewBox="0 0 300 300" role="group" aria-label="Koordinatensystem zum Antippen"></svg></div>
      <div id="sk-note"></div>
      <div class="row"><button class="btn block" id="sk-go" type="button" hidden>Weiter</button></div>
    </div>`;
  const $ = (s) => el.querySelector(s), svg = $('#sk'), go = $('#sk-go'), note = $('#sk-note');
  const M = () => LS[mi], ziel = () => M().punkte[pi2];
  function zeichne() {
    const m = M(), n = m.max - m.min, s = 264 / n, X = (x) => 18 + (x - m.min) * s, Y = (y) => 282 - (y - m.min) * s, t = [];
    for (let v = m.min; v <= m.max; v++) { t.push(`<line x1="${X(v)}" y1="${Y(m.min)}" x2="${X(v)}" y2="${Y(m.max)}" class="sk-linie"/><line x1="${X(m.min)}" y1="${Y(v)}" x2="${X(m.max)}" y2="${Y(v)}" class="sk-linie"/>`);
      if (v !== 0 || m.min === 0) t.push(`<text x="${X(v)}" y="${Y(Math.max(0, m.min)) + 13}" text-anchor="middle" class="strahl-klein">${v}</text>`); if (v !== 0) t.push(`<text x="${X(Math.max(0, m.min)) - 6}" y="${Y(v) + 4}" text-anchor="end" class="strahl-klein">${v}</text>`); }
    const ax = Math.max(0, m.min); t.push(`<line x1="${X(m.min)}" y1="${Y(ax)}" x2="${X(m.max)}" y2="${Y(ax)}" class="sk-achse"/><line x1="${X(ax)}" y1="${Y(m.min)}" x2="${X(ax)}" y2="${Y(m.max)}" class="sk-achse"/>`);
    for (const [x, y] of gefunden) t.push(`<circle cx="${X(x)}" cy="${Y(y)}" r="8" class="sk-schatz"/>`);
    for (let x = m.min; x <= m.max; x++) for (let y = m.min; y <= m.max; y++) t.push(`<circle cx="${X(x)}" cy="${Y(y)}" r="${Math.min(15, s / 2)}" class="sk-punkt" data-x="${x}" data-y="${y}" role="button" aria-label="Punkt ${x} ${y}"/>`);
    svg.innerHTML = t.join('');
    svg.querySelectorAll('.sk-punkt').forEach((p) => { p.onclick = () => tippe(+p.dataset.x, +p.dataset.y); });
  }
  function frage() { const [x, y] = ziel(); $('#sk-n').textContent = `${mi + 1}/${LS.length}`; $('#sk-t').innerHTML = `Wo liegt der Schatz? Tippe auf ${tex(`(${x}\\mid ${y})`)}.`; $('#sk-s').textContent = `Schatz ${pi2 + 1} von ${M().punkte.length} · erst ${x < 0 ? 'nach links' : 'nach rechts'}, dann ${y < 0 ? 'nach unten' : 'nach oben'}`; }
  function tippe(x, y) {
    if (!go.hidden) return; const [zx, zy] = ziel();
    if (x === zx && y === zy) { gefunden.push([x, y]); sfx('ok'); note.innerHTML = `<div class="note ok"><b>Gefunden!</b> ${Math.abs(x)} nach ${x < 0 ? 'links' : 'rechts'}, ${Math.abs(y)} nach ${y < 0 ? 'unten' : 'oben'}.</div>`;
      if (pi2 < M().punkte.length - 1) { pi2++; zeichne(); frage(); } else { zeichne(); buzz(); funken(svg); go.hidden = false; go.textContent = mi < LS.length - 1 ? 'Weiter' : 'Fertig'; ctx.progress((mi + 1) / LS.length); } }
    else { fehler++; sfx('bad'); note.innerHTML = `<div class="note tip">${x === zy && y === zx && zx !== zy ? 'Fast – du hast die beiden Zahlen vertauscht. Die erste Zahl sagt, wie weit es zur Seite geht.' : `Das ist ${`(${x} | ${y})`}. Geh vom Nullpunkt ${Math.abs(zx)} zur Seite und ${Math.abs(zy)} ${zy < 0 ? 'nach unten' : 'nach oben'}.`}</div>`; }
  }
  function lade() { pi2 = 0; gefunden = []; note.innerHTML = ''; go.hidden = true; zeichne(); frage(); }
  go.onclick = () => { if (mi < LS.length - 1) { mi++; lade(); return; } ctx.done({ stars: fehler === 0 ? 3 : fehler <= 3 ? 2 : 1, mistakes: fehler }); };
  lade(); ctx.progress(0);
  return () => {};
}
