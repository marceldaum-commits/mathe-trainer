// Fläche füllen: Die Fläche unter der Kurve mit Streifen annähern – so entsteht das Integral.
import { Plot } from '../plot.js';
import { h, tex, cssVar, buzz, sfx } from '../ui.js';
import { fmt, ft } from '../math.js';
import { store } from '../store.js';

export const LEVELS = [
  { tex: 'f(x)=0{,}5x^2+1', f: (x) => 0.5 * x * x + 1, a: 0, b: 3, area: 7.5, view: { x0: -0.6, x1: 4.2, y0: -0.6, y1: 6.2 } },
  { tex: 'f(x)=-x^2+4x', f: (x) => -x * x + 4 * x, a: 0, b: 4, area: 32 / 3, view: { x0: -0.6, x1: 4.8, y0: -0.6, y1: 4.8 } },
];

/** Unter- und Obersumme mit n Streifen. */
export function sums(L, n) {
  const dx = (L.b - L.a) / n;
  let lo = 0, hi = 0;
  const bars = [];
  for (let i = 0; i < n; i++) {
    const x0 = L.a + i * dx;
    let mn = Infinity, mx = -Infinity;
    for (let k = 0; k <= 24; k++) { const y = L.f(x0 + (dx * k) / 24); mn = Math.min(mn, y); mx = Math.max(mx, y); }
    lo += mn * dx; hi += mx * dx; bars.push([x0, dx, mn, mx]);
  }
  return { lo, hi, bars };
}

/** Wie nah Ober- und Untersumme zusammenliegen müssen (je nach Schwierigkeit). */
export const gap = (lv) => [2, 1.5, 1, 0.8, 0.6][lv - 1];

export function flaeche(el, ctx) {
  let li = 0, n = 2, phase = 'fill', wrong = 0, plot;
  const need = gap(store.level);

  el.innerHTML = `
    <div class="stack">
      <div class="mission"><b class="tag" id="fl-n"></b><p><span id="fl-t"></span><small id="fl-s"></small></p></div>
      <div class="stage"><span class="tagline f" id="fl-fx"></span><canvas id="fl-c" aria-label="Fläche unter der Kurve mit Streifen"></canvas></div>
      <div class="readout"><span>Untersumme <b class="val" id="fl-lo"></b></span><span>Obersumme <b class="val" id="fl-hi"></b></span></div>
      <div class="slider"><label for="fl-r">n</label><input id="fl-r" type="range" min="1" max="60" step="1" value="2" aria-label="Anzahl der Streifen"><output id="fl-o">2</output></div>
      <div id="fl-body"></div>
      <div id="fl-note"></div>
      <div class="row" id="fl-next" hidden><button class="btn block" type="button">Weiter</button></div>
    </div>`;
  const note = el.querySelector('#fl-note'), body = el.querySelector('#fl-body'), nextRow = el.querySelector('#fl-next'), range = el.querySelector('#fl-r');
  const L = () => LEVELS[li];

  function draw() {
    const lv = L(), s = sums(lv, n), g = plot.ctx;
    plot.clear(); plot.grid();
    s.bars.forEach(([x0, dx, mn, mx]) => {
      g.fillStyle = 'rgba(255,116,24,.20)';
      g.fillRect(plot.X(x0), plot.Y(mx), plot.X(x0 + dx) - plot.X(x0), plot.Y(0) - plot.Y(mx));
      g.fillStyle = 'rgba(115,224,169,.55)';
      g.fillRect(plot.X(x0), plot.Y(mn), plot.X(x0 + dx) - plot.X(x0), plot.Y(0) - plot.Y(mn));
      g.strokeStyle = cssVar('--card'); g.lineWidth = 1;
      g.strokeRect(plot.X(x0), plot.Y(mx), plot.X(x0 + dx) - plot.X(x0), plot.Y(0) - plot.Y(mx));
    });
    plot.fn(lv.f, { width: 4 });
    el.querySelector('#fl-lo').textContent = fmt(s.lo); el.querySelector('#fl-hi').textContent = fmt(s.hi);
    if (phase === 'fill' && s.hi - s.lo <= need) {
      phase = 'ask'; buzz(20);
      note.innerHTML = `<div class="note ok"><b>Eng genug.</b> Die wahre Fläche liegt immer zwischen Unter- und Obersumme – je mehr Streifen, desto genauer.</div>`;
      ask();
    }
  }

  function ask() {
    const lv = L(), rough = sums(lv, 3);
    el.querySelector('#fl-t').textContent = 'Wie groß ist die Fläche unter der Kurve genau?';
    el.querySelector('#fl-s').textContent = 'Sie liegt zwischen Unter- und Obersumme.';
    const opts = [[lv.area, true], [rough.lo, false], [rough.hi, false]].sort(() => Math.random() - 0.5);
    const box = h('<div class="opts"></div>');
    opts.forEach(([v, ok], i) => {
      const b = h(`<button class="opt" type="button" data-ok="${ok ? 1 : 0}"><span class="k">${'ABC'[i]}</span><span>${tex(ft(v))}</span></button>`);
      b.addEventListener('click', () => {
        if (!nextRow.hidden) return;
        if (ok) {
          b.classList.add('right'); nextRow.hidden = false; sfx('ok');
          note.innerHTML = `<div class="note ok"><b>Genau.</b> Diese Zahl ist das Integral ${tex(`\\int_{${lv.a}}^{${lv.b}}f(x)\\,dx=${ft(lv.area)}`)}.</div>`;
          ctx.progress((li + 1) / LEVELS.length);
        } else {
          wrong++; sfx('bad'); b.classList.add('wrong');
          note.innerHTML = `<div class="note bad"><b>Nicht ganz.</b> Dieser Wert passt nur zu wenigen, groben Streifen. Schau, wohin Unter- und Obersumme bei vielen Streifen laufen.</div>`;
        }
      });
      box.append(b);
    });
    body.replaceChildren(box);
  }

  function load() {
    plot?.destroy();
    plot = new Plot(el.querySelector('#fl-c'), L().view, { ratio: 1.25 });
    plot.onResize = draw;
    n = 2; phase = 'fill'; range.value = 2; el.querySelector('#fl-o').textContent = '2';
    el.querySelector('#fl-n').textContent = `${li + 1}/${LEVELS.length}`;
    el.querySelector('#fl-fx').innerHTML = tex(L().tex);
    el.querySelector('#fl-t').textContent = 'Fülle die Fläche unter der Kurve: Mach die Streifen schmaler.';
    el.querySelector('#fl-s').textContent = `Ziel: Ober- und Untersumme liegen höchstens ${fmt(need)} auseinander.`;
    body.replaceChildren(); note.innerHTML = ''; nextRow.hidden = true;
    draw();
  }

  range.addEventListener('input', () => { n = +range.value; el.querySelector('#fl-o').textContent = String(n); draw(); });
  nextRow.querySelector('button').addEventListener('click', () => {
    if (li < LEVELS.length - 1) { li++; load(); return; }
    ctx.done({ stars: wrong === 0 ? 3 : wrong <= 1 ? 2 : 1, mistakes: wrong });
  });

  load();
  return () => plot.destroy();
}
