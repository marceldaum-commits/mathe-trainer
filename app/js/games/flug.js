// Kurven-Flug: Den Flieger auf einer Sinus-Kurve durch alle Tore steuern – Amplitude, Periode und Verschiebung als Spielzug.
import { Plot } from '../plot.js';
import { h, tex, cssVar, buzz, sfx } from '../ui.js';
import { fmt, ft } from '../math.js';
import { store } from '../store.js';

const VIEW = { x0: -0.5, x1: 13, y0: -5, y1: 5 };
export const f = (p, x) => p.a * Math.sin(p.b * x) + p.d;

export const LEVELS = [
  { hint: 'a ist die Amplitude: So hoch und so tief schwingt die Kurve.', params: [{ k: 'a', min: 0.5, max: 4, step: 0.5, init: 1 }], fixed: { b: 1, d: 0 }, target: { a: 3, b: 1, d: 0 }, gatesX: [1.57, 4.71, 7.85] },
  { hint: 'd verschiebt die ganze Kurve nach oben oder unten.', params: [{ k: 'a', min: 0.5, max: 4, step: 0.5, init: 1 }, { k: 'd', min: -3, max: 3, step: 0.5, init: 0 }], fixed: { b: 1 }, target: { a: 2, b: 1, d: 1.5 }, gatesX: [1.57, 4.71, 7.85, 11] },
  { hint: 'b staucht die Kurve: Bei b = 2 passen doppelt so viele Wellen ins Bild.', params: [{ k: 'a', min: 0.5, max: 4, step: 0.5, init: 2 }, { k: 'b', min: 0.5, max: 2, step: 0.5, init: 1 }], fixed: { d: 0 }, target: { a: 2, b: 2, d: 0 }, gatesX: [0.785, 2.356, 3.927, 5.498] },
  { hint: 'Alle drei Regler: erst die Mitte (d), dann die Höhe (a), dann die Wellenlänge (b).', params: [{ k: 'a', min: 0.5, max: 4, step: 0.5, init: 1 }, { k: 'b', min: 0.5, max: 2, step: 0.5, init: 1 }, { k: 'd', min: -3, max: 3, step: 0.5, init: 0 }], fixed: {}, target: { a: 1.5, b: 0.5, d: -1 }, gatesX: [3.14, 6.28, 9.42, 12.2] },
];
/** Halbe Tor-Öffnung je nach Schwierigkeit. */
export const gateTol = (lv) => [0.7, 0.55, 0.45, 0.35, 0.28][lv - 1];
/** Welche Tore durchfliegt die Kurve mit diesen Werten? */
export function passed(L, p, lv = 3) { return L.gatesX.map((x) => Math.abs(f(p, x) - f(L.target, x)) <= gateTol(lv)); }
const sinTex = (p) => `${p.a === 1 ? '' : ft(p.a)}\\sin(${p.b === 1 ? '' : ft(p.b)}x)${p.d === 0 ? '' : `${p.d > 0 ? '+' : '-'}${ft(Math.abs(p.d))}`}`;

export function flug(el, ctx) {
  let li = 0, p = {}, tries = 0, total = 0, solved = false, raf = 0, pos = null, hit = [];
  const tol = gateTol(store.level);
  el.innerHTML = `<div class="stack">
    <div class="mission"><b class="tag" id="fg-n"></b><p>Stell die Kurve so ein, dass der Flieger durch alle Tore kommt.<small id="fg-hint"></small></p></div>
    <div class="stage"><canvas id="fg-c" aria-label="Flugbahn mit Toren"></canvas></div>
    <div class="readout"><span id="fg-f"></span></div>
    <div class="stack" id="fg-sl"></div><div id="fg-note"></div>
    <div class="row"><button class="btn block" id="fg-go" type="button">Abflug!</button></div></div>`;
  const plot = new Plot(el.querySelector('#fg-c'), VIEW, { ratio: 1.35 });
  const note = el.querySelector('#fg-note'), go = el.querySelector('#fg-go');
  const L = () => LEVELS[li];

  function draw() {
    plot.clear(); plot.grid({ labels: false });
    L().gatesX.forEach((x, i) => {
      const y = f(L().target, x), ok = hit[i];
      plot.seg(x, y + tol, x, VIEW.y1, { color: ok ? cssVar('--mint') : cssVar('--axis'), width: 5 });
      plot.seg(x, y - tol, x, VIEW.y0, { color: ok ? cssVar('--mint') : cssVar('--axis'), width: 5 });
    });
    plot.fn((x) => f(p, x), { width: 3, dash: pos ? null : [7, 6], x0: 0 });
    const P = pos ?? [0, f(p, 0)];
    plot.dot(P[0], P[1], { r: 9, color: cssVar('--orange'), ring: 'rgba(255,116,24,.22)' });
  }
  plot.onResize = draw;
  const formula = () => { el.querySelector('#fg-f').innerHTML = tex(`f(x)=${sinTex(p)}`); };

  function load() {
    const lv = L(); p = { ...lv.fixed }; lv.params.forEach((q) => { p[q.k] = q.init; });
    tries = 0; solved = false; pos = null; hit = [];
    el.querySelector('#fg-n').textContent = `${li + 1}/${LEVELS.length}`;
    el.querySelector('#fg-hint').textContent = store.level >= 4 ? '' : lv.hint;
    const box = el.querySelector('#fg-sl'); box.innerHTML = '';
    lv.params.forEach((q) => {
      const row = h(`<div class="slider"><label for="fg-${q.k}">${q.k}</label><input id="fg-${q.k}" type="range" min="${q.min}" max="${q.max}" step="${q.step}" value="${q.init}" aria-label="Parameter ${q.k}"><output>${fmt(q.init)}</output></div>`);
      const inp = row.querySelector('input');
      inp.addEventListener('input', () => {
        cancelAnimationFrame(raf); p[q.k] = +inp.value; row.querySelector('output').textContent = fmt(p[q.k]);
        pos = null; hit = []; note.innerHTML = ''; go.disabled = false; if (solved) { solved = false; go.textContent = 'Abflug!'; }
        formula(); draw();
      });
      box.append(row);
    });
    note.innerHTML = ''; go.textContent = 'Abflug!'; go.disabled = false; formula(); draw();
  }

  go.addEventListener('click', () => {
    if (solved) { if (li < LEVELS.length - 1) { li++; ctx.progress(li / LEVELS.length); load(); return; } ctx.progress(1); ctx.done({ stars: Math.max(1, Math.round(total / LEVELS.length)) }); return; }
    tries++; go.disabled = true; hit = []; sfx('roll');
    const res = passed(L(), p, store.level), gates = L().gatesX;
    let x = 0, crashed = false;
    const tick = () => {
      x += 0.16; pos = [x, f(p, x)];
      gates.forEach((gx, i) => { if (hit[i] === undefined && x >= gx) { hit[i] = res[i]; if (res[i]) buzz(); else crashed = true; } });
      draw();
      if (crashed || x >= VIEW.x1 - 0.3) {
        go.disabled = false;
        if (!crashed && res.every(Boolean)) {
          solved = true; sfx('ok'); total += tries <= 2 ? 3 : tries <= 4 ? 2 : 1;
          note.innerHTML = `<div class="note ok"><b>Sauber durchgeflogen!</b> ${tex(`f(x)=${sinTex(p)}`)}</div>`;
          go.textContent = li < LEVELS.length - 1 ? 'Nächste Strecke' : 'Fertig';
        } else {
          sfx('bad'); const i = res.indexOf(false), dy = f(L().target, gates[i]) - f(p, gates[i]);
          note.innerHTML = `<div class="note tip"><b>Am ${i + 1}. Tor hängen geblieben.</b> Die Kurve liegt dort ${fmt(Math.abs(dy), 1)} zu ${dy > 0 ? 'tief' : 'hoch'}. Verändere die Regler und starte neu.</div>`;
        }
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  });
  load();
  return () => { cancelAnimationFrame(raf); plot.destroy(); };
}
