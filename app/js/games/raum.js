// Raum-Blick: ein drehbares 3D-Koordinatensystem. Geraden von allen Seiten ansehen.
import { h, tex, cssVar, buzz, sfx, onLook } from '../ui.js';

const V = (v) => `\\begin{pmatrix}${v.join('\\\\')}\\end{pmatrix}`;
const lineTex = (name, P, u, par) => `${name}:\\ \\vec x=${V(P)}+${par}\\cdot${V(u)}`;

export const MISSIONS = [
  { type: 'look', lines: [{ P: [1, 1, 1], u: [2, 1, 1] }], text: 'Dreh den Raum so, dass du genau entlang der Geraden schaust.', sub: 'Dann schrumpft sie zu einem Punkt – du blickst in Richtung des Richtungsvektors.' },
  { type: 'ask', lines: [{ P: [-2, 0, 1], u: [2, 1, 0] }, { P: [0, -2, 3], u: [0, 2, -1] }], answer: 'windschief', text: 'Schneiden sich die beiden Geraden?', sub: 'Dreh den Raum: Was von einer Seite wie ein Schnittpunkt aussieht, muss keiner sein.' },
  { type: 'ask', lines: [{ P: [-2, -1, 0], u: [2, 1, 1] }, { P: [0, 2, 3], u: [1, -1, -1] }], answer: 'schnitt', text: 'Und diese beiden?', sub: 'Ein echter Schnittpunkt bleibt aus jeder Blickrichtung ein Schnittpunkt.' },
];

/** Blickwinkel (Drehung, Neigung), bei denen man entlang von u schaut. */
export function lookAlong(u) {
  const len = Math.hypot(...u);
  return { yaw: Math.atan2(u[1], u[0]), pitch: Math.asin(u[2] / len) };
}
/** Wie genau schaut man entlang von u? 1 = exakt. */
export function alignment(u, yaw, pitch) {
  const d = [Math.cos(pitch) * Math.cos(yaw), Math.cos(pitch) * Math.sin(yaw), Math.sin(pitch)];
  return Math.abs(d[0] * u[0] + d[1] * u[1] + d[2] * u[2]) / Math.hypot(...u);
}

export function raum(el, ctx) {
  let mi = 0, yaw = -0.9, pitch = 0.45, hold = 0, wrong = 0, done = false, drag = null;

  el.innerHTML = `
    <div class="stack">
      <div class="mission"><b class="tag" id="rm-n"></b><p><span id="rm-t"></span><small id="rm-s"></small></p></div>
      <div class="stage"><span class="tagline">Mit dem Finger drehen</span><canvas id="rm-c" style="aspect-ratio:1" aria-label="Drehbares 3D-Koordinatensystem"></canvas></div>
      <div class="formula" id="rm-f" style="font-size:16px"></div>
      <div id="rm-body"></div>
      <div id="rm-note"></div>
      <div class="row" id="rm-next" hidden><button class="btn block" type="button">Weiter</button></div>
    </div>`;
  const cv = el.querySelector('#rm-c'), g = cv.getContext('2d'), note = el.querySelector('#rm-note'), body = el.querySelector('#rm-body'), nextRow = el.querySelector('#rm-next');
  const M = () => MISSIONS[mi];
  let W = 300, H = 300;
  const ro = new ResizeObserver(() => { size(); draw(); }); ro.observe(cv);
  const offLook = onLook(() => draw());
  function size() { const r = cv.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 3); W = r.width || 300; H = r.height || 300; cv.width = Math.round(W * d); cv.height = Math.round(H * d); g.setTransform(d, 0, 0, d, 0, 0); }

  function proj(p) {
    const right = [-Math.sin(yaw), Math.cos(yaw), 0];
    const up = [-Math.sin(pitch) * Math.cos(yaw), -Math.sin(pitch) * Math.sin(yaw), Math.cos(pitch)];
    const s = W / 13;
    return [W / 2 + s * (p[0] * right[0] + p[1] * right[1]), H / 2 - s * (p[0] * up[0] + p[1] * up[1] + p[2] * up[2])];
  }
  function seg(a, b, color, width, dash) {
    const A = proj(a), B = proj(b);
    g.save(); g.strokeStyle = color; g.lineWidth = width; g.lineCap = 'round'; if (dash) g.setLineDash(dash);
    g.beginPath(); g.moveTo(A[0], A[1]); g.lineTo(B[0], B[1]); g.stroke(); g.restore();
  }
  function draw() {
    g.clearRect(0, 0, W, H);
    const ax = cssVar('--axis'), grid = cssVar('--grid');
    for (let i = -4; i <= 4; i++) { seg([i, -4, 0], [i, 4, 0], grid, 1); seg([-4, i, 0], [4, i, 0], grid, 1); }
    [['x₁', [5, 0, 0]], ['x₂', [0, 5, 0]], ['x₃', [0, 0, 5]]].forEach(([name, e]) => {
      seg([0, 0, 0], e, ax, 2); const p = proj(e.map((c) => c * 1.1));
      g.fillStyle = ax; g.font = '700 12px Inter, sans-serif'; g.textAlign = 'center'; g.fillText(name, p[0], p[1] + 4);
    });
    const colors = [cssVar('--orange'), cssVar('--mint-ink')];
    M().lines.forEach((ln, i) => {
      const a = ln.P.map((c, j) => c - 3 * ln.u[j]), b = ln.P.map((c, j) => c + 3 * ln.u[j]);
      seg([ln.P[0], ln.P[1], 0], ln.P, colors[i], 1, [3, 4]);
      seg(a, b, colors[i], 5);
      const p = proj(ln.P); g.fillStyle = colors[i]; g.beginPath(); g.arc(p[0], p[1], 5, 0, 7); g.fill();
    });
  }

  function setMission() {
    const m = M();
    done = false; hold = 0;
    el.querySelector('#rm-n').textContent = `${mi + 1}/${MISSIONS.length}`;
    el.querySelector('#rm-t').textContent = m.text; el.querySelector('#rm-s').textContent = m.sub;
    el.querySelector('#rm-f').innerHTML = m.lines.map((ln, i) => tex(lineTex('gh'[i], ln.P, ln.u, 'ts'[i]))).join('<br>');
    note.innerHTML = ''; nextRow.hidden = true; body.replaceChildren();
    if (m.type === 'ask') {
      const opts = [['schnitt', 'Ja, sie schneiden sich.'], ['windschief', 'Nein, sie laufen aneinander vorbei (windschief).'], ['parallel', 'Nein, sie sind parallel.']];
      const box = h('<div class="opts"></div>');
      opts.forEach(([key, label], i) => {
        const b = h(`<button class="opt" type="button" data-key="${key}"><span class="k">${'ABC'[i]}</span><span>${label}</span></button>`);
        b.addEventListener('click', () => {
          if (done) return;
          if (key === m.answer) {
            done = true; b.classList.add('right'); buzz(20); nextRow.hidden = false; ctx.progress((mi + 1) / MISSIONS.length);
            note.innerHTML = `<div class="note ok"><b>Richtig.</b> ${m.answer === 'windschief' ? 'Die Geraden haben keinen gemeinsamen Punkt und sind nicht parallel: windschief. Rechnerisch führt Gleichsetzen zu einem Widerspruch.' : 'Egal wie du drehst, die Geraden treffen sich. Rechnerisch hat das Gleichsetzen eine Lösung.'}</div>`;
          } else {
            wrong++; sfx('bad'); b.classList.add('wrong');
            note.innerHTML = `<div class="note bad"><b>Schau noch einmal.</b> ${key === 'parallel' ? 'Parallele Geraden zeigen in dieselbe Richtung – diese nicht.' : 'Dreh den Raum und sieh von der Seite und von oben: Bleibt der Kreuzungspunkt bestehen?'}</div>`;
          }
        });
        box.append(b);
      });
      body.append(box);
    }
    draw();
  }

  function check() {
    if (done || M().type !== 'look') return;
    if (alignment(M().lines[0].u, yaw, pitch) < 0.985) { hold = 0; return; }
    if (!hold) { hold = performance.now(); return; }
    if (performance.now() - hold < 350) return;
    done = true; buzz(20); nextRow.hidden = false; ctx.progress((mi + 1) / MISSIONS.length);
    note.innerHTML = `<div class="note ok"><b>Genau so.</b> Du schaust jetzt in Richtung ${tex(V(M().lines[0].u))}. Der Richtungsvektor legt fest, wohin die Gerade läuft – der Stützpunkt nur, wo sie liegt.</div>`;
  }
  /** Für Tastatur und Tests: Blickwinkel direkt setzen. */
  cv.setView = (y, p) => { yaw = y; pitch = Math.max(-1.5, Math.min(1.5, p)); hold = performance.now() - 400; check(); draw(); };
  cv.addEventListener('pointerdown', (ev) => { drag = { x: ev.clientX, y: ev.clientY }; cv.setPointerCapture(ev.pointerId); });
  cv.addEventListener('pointermove', (ev) => {
    if (!drag) return;
    yaw -= (ev.clientX - drag.x) * 0.012; pitch = Math.max(-1.5, Math.min(1.5, pitch + (ev.clientY - drag.y) * 0.012));
    drag = { x: ev.clientX, y: ev.clientY }; check(); draw();
  });
  const up = () => { drag = null; };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  const timer = setInterval(() => { if (drag) check(); }, 120);
  cv.tabIndex = 0;
  cv.addEventListener('keydown', (ev) => {
    const d = { ArrowLeft: [0.06, 0], ArrowRight: [-0.06, 0], ArrowUp: [0, 0.06], ArrowDown: [0, -0.06] }[ev.key];
    if (!d) return; ev.preventDefault(); cv.setView(yaw + d[0], pitch + d[1]);
  });

  nextRow.querySelector('button').addEventListener('click', () => {
    if (mi < MISSIONS.length - 1) { mi++; setMission(); return; }
    ctx.done({ stars: wrong === 0 ? 3 : wrong === 1 ? 2 : 1, mistakes: wrong });
  });

  size(); setMission();
  return () => { clearInterval(timer); ro.disconnect(); offLook(); };
}
