// Extremwert-Werkstatt: Eine Größe verändern, die Zielgröße wächst und fällt – das Maximum finden.
import { Plot } from '../plot.js';
import { tex, cssVar, buzz, sfx, onLook } from '../ui.js';
import { fmt } from '../math.js';

export const LEVELS = [
  { id: 'zaun', text: 'Mit 20 m Zaun wird an einer Mauer ein Beet abgegrenzt. Wie breit muss es sein, damit die Fläche am größten ist?', sub: 'Schieb den Regler und beobachte die Fläche.',
    min: 0.5, max: 9.5, step: 0.5, init: 1.5, sol: 5, obj: (x) => x * (20 - 2 * x), unit: 'm²', name: 'Fläche', view: { x0: -0.6, x1: 10.5, y0: -6, y1: 58 },
    term: 'A(x)=x\\cdot(20-2x)', done: `Bei ${'x=5'} ist die Fläche am größten: 50 m². Rechnerisch: ${"A'(x)=20-4x=0"}.` },
  { id: 'schachtel', text: 'Aus einem Karton (12 cm × 12 cm) werden die Ecken ausgeschnitten und die Ränder hochgeklappt. Wie groß müssen die Ecken sein, damit möglichst viel hineinpasst?', sub: 'Zu kleine Ecken: flache Schachtel. Zu große: kein Boden mehr.',
    min: 0.5, max: 5.5, step: 0.5, init: 4.5, sol: 2, obj: (x) => x * (12 - 2 * x) ** 2, unit: 'cm³', name: 'Volumen', view: { x0: -0.4, x1: 6.4, y0: -15, y1: 145 },
    term: 'V(x)=x\\cdot(12-2x)^2', done: 'Bei x = 2 passt am meisten hinein: 128 cm³.' },
];

export function werkstatt(el, ctx) {
  let li = 0, x = 0, trace = new Map(), tries = 0, total = 0, solved = false, plot, raf = 0;

  el.innerHTML = `
    <div class="stack">
      <div class="mission"><b class="tag" id="wk-n"></b><p><span id="wk-t"></span><small id="wk-s"></small></p></div>
      <div class="stage"><canvas id="wk-pic" style="aspect-ratio:1.9" aria-label="Skizze"></canvas></div>
      <div class="readout"><span id="wk-x"></span><span><span id="wk-name"></span> <b class="val" id="wk-v"></b></span></div>
      <div class="slider"><label for="wk-r">x</label><input id="wk-r" type="range" aria-label="Größe x"><output id="wk-o"></output></div>
      <div class="stage"><span class="tagline" id="wk-tag"></span><canvas id="wk-c" aria-label="Zielgröße in Abhängigkeit von x"></canvas></div>
      <div id="wk-note"></div>
      <div class="row"><button class="btn block" id="wk-go" type="button">Größer geht es nicht</button></div>
    </div>`;
  const pic = el.querySelector('#wk-pic'), g = pic.getContext('2d'), range = el.querySelector('#wk-r'), note = el.querySelector('#wk-note'), go = el.querySelector('#wk-go');
  const L = () => LEVELS[li];
  let W = 300, H = 160;
  const ro = new ResizeObserver(() => { size(); draw(); }); ro.observe(pic);
  const offLook = onLook(() => draw());
  function size() { const r = pic.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 3); W = r.width || 300; H = r.height || 160; pic.width = Math.round(W * d); pic.height = Math.round(H * d); g.setTransform(d, 0, 0, d, 0, 0); }

  function sketch() {
    g.clearRect(0, 0, W, H);
    const ink = cssVar('--curve'), or = cssVar('--orange');
    if (L().id === 'zaun') {
      const s = Math.min((W - 60) / 20, (H - 50) / 10), len = 20 - 2 * x, x0 = (W - len * s) / 2, y0 = 22;
      g.fillStyle = cssVar('--axis'); g.fillRect(20, y0 - 8, W - 40, 8);
      g.fillStyle = 'rgba(115,224,169,.45)'; g.fillRect(x0, y0, len * s, x * s);
      g.strokeStyle = or; g.lineWidth = 4; g.lineJoin = 'round'; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0, y0 + x * s); g.lineTo(x0 + len * s, y0 + x * s); g.lineTo(x0 + len * s, y0); g.stroke();
      g.fillStyle = ink; g.font = '700 12px Inter, sans-serif'; g.textAlign = 'center';
      g.fillText('Mauer', W / 2, y0 - 12); g.fillText(`${fmt(len)} m`, W / 2, y0 + x * s + 16);
      g.textAlign = 'right'; g.fillText(`x = ${fmt(x)} m`, x0 - 8, y0 + (x * s) / 2 + 4);
    } else {
      const s = (H - 24) / 12, x0 = (W - 12 * s) / 2, y0 = 12, c = x * s;
      g.fillStyle = 'rgba(115,224,169,.45)'; g.fillRect(x0 + c, y0 + c, (12 - 2 * x) * s, (12 - 2 * x) * s);
      g.strokeStyle = ink; g.lineWidth = 2.5; g.strokeRect(x0, y0, 12 * s, 12 * s);
      g.fillStyle = 'rgba(255,116,24,.35)'; g.strokeStyle = or; g.lineWidth = 2;
      [[0, 0], [12 * s - c, 0], [0, 12 * s - c], [12 * s - c, 12 * s - c]].forEach(([dx, dy]) => { g.fillRect(x0 + dx, y0 + dy, c, c); g.strokeRect(x0 + dx, y0 + dy, c, c); });
      g.fillStyle = ink; g.font = '700 12px Inter, sans-serif'; g.textAlign = 'left';
      g.fillText(`x = ${fmt(x)} cm`, x0 + 12 * s + 10, y0 + c / 2 + 4); g.fillText(`Boden: ${fmt(12 - 2 * x)} cm`, x0 + 12 * s + 10, y0 + 6 * s + 4);
    }
  }

  function draw() {
    sketch();
    const lv = L(), v = lv.obj(x);
    el.querySelector('#wk-x').innerHTML = tex(lv.term);
    el.querySelector('#wk-v').textContent = `${fmt(v, 1)} ${lv.unit}`;
    plot.clear(); plot.grid({ labels: false });
    const c = plot.ctx; c.fillStyle = cssVar('--orange');
    trace.forEach((tv, tx) => { c.beginPath(); c.arc(plot.X(tx), plot.Y(tv), 4, 0, 7); c.fill(); });
    if (solved) plot.fn(lv.obj, { color: cssVar('--mint'), width: 3, x0: 0, x1: lv.max + lv.step });
    plot.dot(x, v, { r: 8, color: cssVar('--orange'), ring: 'rgba(255,116,24,.22)' });
  }

  function load() {
    const lv = L();
    plot?.destroy(); plot = new Plot(el.querySelector('#wk-c'), lv.view, { ratio: 1.9 }); plot.onResize = draw;
    x = lv.init; trace = new Map([[x, lv.obj(x)]]); tries = 0; solved = false;
    range.min = lv.min; range.max = lv.max; range.step = lv.step; range.value = x;
    el.querySelector('#wk-o').textContent = fmt(x);
    el.querySelector('#wk-n').textContent = `${li + 1}/${LEVELS.length}`;
    el.querySelector('#wk-t').textContent = lv.text; el.querySelector('#wk-s').textContent = lv.sub;
    el.querySelector('#wk-name').textContent = lv.name; el.querySelector('#wk-tag').textContent = `${lv.name} für jedes x`;
    note.innerHTML = ''; go.textContent = 'Größer geht es nicht';
    size(); draw();
  }

  range.addEventListener('input', () => {
    x = +range.value; trace.set(x, L().obj(x)); el.querySelector('#wk-o').textContent = fmt(x);
    if (solved) { solved = false; go.textContent = 'Größer geht es nicht'; note.innerHTML = ''; }
    draw();
  });
  go.addEventListener('click', () => {
    if (solved) { if (li < LEVELS.length - 1) { li++; ctx.progress(li / LEVELS.length); load(); return; } ctx.progress(1); ctx.done({ stars: Math.max(1, Math.round(total / LEVELS.length)) }); return; }
    tries++;
    const lv = L(), v = lv.obj(x), best = Math.max(...trace.values());
    if (x === lv.sol) {
      solved = true; buzz(20); total += tries <= 1 ? 3 : tries <= 3 ? 2 : 1;
      note.innerHTML = `<div class="note ok"><b>Genau.</b> Die grüne Kurve ist die Zielfunktion ${tex(lv.term)}. Ihr Hochpunkt liegt bei ${tex(`x=${lv.sol}`)} – dort ist die Ableitung 0.</div>`;
      go.textContent = li < LEVELS.length - 1 ? 'Nächste Aufgabe' : 'Fertig';
    } else {
      sfx('bad');
      note.innerHTML = `<div class="note tip"><b>Da geht noch mehr.</b> ${best > v + 1e-9 ? 'Du hattest schon einen größeren Wert – schau auf deine Punkte.' : 'Probier Werte links und rechts davon aus.'}</div>`;
    }
    draw();
  });

  load();
  return () => { cancelAnimationFrame(raf); ro.disconnect(); offLook(); plot.destroy(); };
}
