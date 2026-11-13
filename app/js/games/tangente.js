// Tangenten-Surfer: Den Punkt über die Kurve ziehen, die Steigung spüren – die Spur ergibt die Ableitung.
import { Plot } from '../plot.js';
import { h, tex, cssVar, buzz, ICON } from '../ui.js';
import { fmt } from '../math.js';

export const LEVELS = [
  {
    tex: 'f(x)=\\tfrac13x^3-x', f: (x) => x ** 3 / 3 - x, d: (x) => x * x - 1,
    view: { x0: -3, x1: 3, y0: -3, y1: 3 }, dview: { x0: -3, x1: 3, y0: -2, y1: 5 }, start: -2.2,
    missions: [
      { text: 'Sammle alle Stellen, an denen die Tangente waagerecht liegt.', sub: 'Dort ist die Steigung 0.', type: 'zero', xs: [-1, 1] },
      { text: 'Finde die Stelle mit dem steilsten Gefälle.', sub: 'Wo ist die Steigung am kleinsten?', type: 'at', xs: [0], tol: 0.12 },
      { text: 'Finde eine Stelle mit der Steigung 3.', sub: 'Es gibt zwei davon – eine genügt.', type: 'slope', m: 3 },
    ],
  },
  {
    tex: 'f(x)=\\tfrac14x^4-2x^2+1', f: (x) => x ** 4 / 4 - 2 * x * x + 1, d: (x) => x ** 3 - 4 * x,
    view: { x0: -3.2, x1: 3.2, y0: -3.8, y1: 2.6 }, dview: { x0: -3.2, x1: 3.2, y0: -5, y1: 5 }, start: -2.7,
    missions: [
      { text: 'Sammle alle drei Stellen mit waagerechter Tangente.', sub: 'Zwei Täler und ein Hügel.', type: 'zero', xs: [-2, 0, 2] },
      { text: 'Finde den steilsten Anstieg zwischen dem linken Tal und dem Hügel.', sub: 'Dort hat die Steigung ihren größten Wert.', type: 'at', xs: [-2 / Math.sqrt(3)], tol: 0.12 },
      { text: 'Finde eine Stelle mit der Steigung −3.', sub: 'Achte auf das Vorzeichen: es geht bergab.', type: 'slope', m: -3 },
    ],
  },
];

/** Prüft, ob die Stelle x die Mission erfüllt. Liefert den Index des getroffenen Ziels oder -1. */
export function hit(level, mission, x, found) {
  const m = level.d(x);
  if (mission.type === 'zero') {
    if (Math.abs(m) > 0.09) return -1;
    return mission.xs.findIndex((t, i) => !found.has(i) && Math.abs(t - x) < 0.25);
  }
  if (mission.type === 'at') return Math.abs(x - mission.xs[0]) < mission.tol ? 0 : -1;
  return Math.abs(m - mission.m) < 0.12 ? 0 : -1;
}

export function tangente(el, ctx) {
  let li = 0, mi = 0, x = 0, found = new Set(), trace = [], hold = 0, holdIdx = -1, dragging = false, revealed = false, slips = 0;

  el.innerHTML = `
    <div class="stack">
      <div class="mission"><b class="tag" id="tg-n"></b><p><span id="tg-t"></span><small id="tg-s"></small></p></div>
      <div class="stage"><span class="tagline f" id="tg-fx"></span><canvas id="tg-c" aria-label="Graph von f mit verschiebbarer Tangente"></canvas></div>
      <div class="readout"><span>Steigung der Tangente</span><span class="val" id="tg-m"></span></div>
      <div class="stage"><span class="tagline">Spur der Steigung</span><canvas id="tg-d" aria-label="Spur der Steigung"></canvas></div>
      <div id="tg-note"></div>
      <div class="row" id="tg-next" hidden><button class="btn block" type="button">Weiter</button></div>
    </div>`;
  const cv = el.querySelector('#tg-c');
  let plot, dplot;
  const note = el.querySelector('#tg-note'), nextRow = el.querySelector('#tg-next');

  const L = () => LEVELS[li];
  const M = () => L().missions[mi];
  const totalMissions = LEVELS.reduce((s, l) => s + l.missions.length, 0);
  const doneMissions = () => LEVELS.slice(0, li).reduce((s, l) => s + l.missions.length, 0) + mi;

  function draw() {
    const lv = L(), m = lv.d(x), y = lv.f(x);
    plot.clear(); plot.grid();
    plot.fn(lv.f, { width: 4 });
    // bereits gefundene Ziele
    if (M()?.type === 'zero') M().xs.forEach((t, i) => plot.star(t, lv.f(t), { hollow: !found.has(i), r: 10 }));
    // Tangente
    const len = 1.6 / Math.hypot(1, m);
    const zero = Math.abs(m) < 0.09;
    plot.seg(x - len, y - m * len, x + len, y + m * len, { color: zero ? cssVar('--mint') : cssVar('--orange'), width: 4 });
    plot.dot(x, y, { r: 9, color: cssVar('--orange'), ring: 'rgba(255,116,24,.22)' });
    const out = el.querySelector('#tg-m');
    out.textContent = fmt(m, 1); out.classList.toggle('zero', zero);

    dplot.clear(); dplot.grid();
    if (revealed) dplot.fn(lv.d, { color: cssVar('--mint'), width: 3 });
    const g = dplot.ctx;
    g.fillStyle = cssVar('--orange');
    trace.forEach(([tx, tm]) => { g.beginPath(); g.arc(dplot.X(tx), dplot.Y(tm), 2.4, 0, 7); g.fill(); });
    dplot.dot(x, m, { r: 6, color: cssVar('--orange') });
  }

  function setMission() {
    found = new Set(); hold = 0; holdIdx = -1;
    el.querySelector('#tg-n').textContent = `${doneMissions() + 1}/${totalMissions}`;
    el.querySelector('#tg-t').textContent = M().text;
    el.querySelector('#tg-s').textContent = M().sub;
    note.innerHTML = ''; nextRow.hidden = true;
    draw();
  }

  function loadLevel() {
    plot?.destroy(); dplot?.destroy();
    plot = new Plot(cv, L().view);
    dplot = new Plot(el.querySelector('#tg-d'), L().dview, { ratio: 2.2 });
    plot.onResize = draw; dplot.onResize = draw;
    x = L().start; trace = []; revealed = false; mi = 0;
    el.querySelector('#tg-fx').innerHTML = tex(L().tex);
    setMission();
  }

  function missionDone() {
    buzz(25);
    const lastM = mi === L().missions.length - 1;
    if (lastM) {
      revealed = true;
      note.innerHTML = `<div class="note ok"><b>Schau auf die Spur:</b> Deine orangen Punkte liegen auf einer Kurve. Das ist der Graph der Ableitung ${tex("f'")} – sie gibt an jeder Stelle die Steigung von ${tex('f')} an.</div>`;
    } else {
      note.innerHTML = '<div class="note ok"><b>Gefunden!</b></div>';
    }
    nextRow.hidden = false;
    ctx.progress((doneMissions() + 1) / totalMissions);
    draw();
  }

  function probe() {
    if (!nextRow.hidden) return;
    const idx = hit(L(), M(), x, found);
    if (idx < 0) { hold = 0; holdIdx = -1; return; }
    if (idx !== holdIdx) { holdIdx = idx; hold = performance.now(); return; }
    if (performance.now() - hold < 320) return;
    hold = 0; holdIdx = -1;
    if (M().type === 'zero') {
      found.add(idx); buzz();
      x = M().xs[idx];
      if (found.size === M().xs.length) missionDone(); else draw();
    } else missionDone();
  }

  function move(ev) {
    const v = L().view;
    x = Math.max(v.x0 + 0.1, Math.min(v.x1 - 0.1, plot.at(ev).x));
    const last = trace[trace.length - 1];
    if (!last || Math.abs(last[0] - x) > 0.04) trace.push([x, L().d(x)]);
    if (trace.length > 900) trace.shift();
    probe(); draw();
  }
  cv.addEventListener('pointerdown', (ev) => { dragging = true; cv.setPointerCapture(ev.pointerId); move(ev); });
  cv.addEventListener('pointermove', (ev) => { if (dragging) move(ev); });
  const up = () => { dragging = false; };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  // Auch beim Stillhalten weiter prüfen (Haltezeit).
  const timer = setInterval(() => { if (dragging) { probe(); } }, 120);
  // Tastatur: Pfeiltasten bewegen den Punkt.
  cv.tabIndex = 0;
  cv.addEventListener('keydown', (ev) => {
    if (ev.key !== 'ArrowLeft' && ev.key !== 'ArrowRight') return;
    ev.preventDefault();
    const v = L().view;
    x = Math.max(v.x0 + 0.1, Math.min(v.x1 - 0.1, +(x + (ev.key === 'ArrowLeft' ? -0.05 : 0.05)).toFixed(2)));
    trace.push([x, L().d(x)]);
    holdIdx = hit(L(), M(), x, found); hold = holdIdx >= 0 ? performance.now() - 400 : 0;
    probe(); draw();
  });

  nextRow.querySelector('button').addEventListener('click', () => {
    if (mi < L().missions.length - 1) { mi++; setMission(); return; }
    if (li < LEVELS.length - 1) { li++; loadLevel(); return; }
    ctx.done({ stars: 3 - Math.min(2, slips) });
  });

  loadLevel();
  return () => { clearInterval(timer); plot.destroy(); dplot.destroy(); };
}
