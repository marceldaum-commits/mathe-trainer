// Murmelbahn: Die Funktion ist die Bahn. Nur wer die Parameter versteht, trifft alle Sterne.
import { Plot } from '../plot.js';
import { h, tex, cssVar, buzz, sfx } from '../ui.js';
import { lineTex, vertexTex, fmt } from '../math.js';
import { store } from '../store.js';

const VIEW = { x0: -6, x1: 6, y0: -2, y1: 10 };

const KINDS = {
  line: {
    f: (p, x) => p.m * x + p.b, d1: (p) => p.m, d2: () => 0,
    tex: (p) => lineTex(p.m, p.b),
  },
  par: {
    f: (p, x) => p.a * (x - p.d) ** 2 + p.e, d1: (p, x) => 2 * p.a * (x - p.d), d2: (p) => 2 * p.a,
    tex: (p) => vertexTex(p.a, p.d, p.e),
  },
};

export const LEVELS = [
  { kind: 'line', hint: 'm ist die Steigung, b der Schnittpunkt mit der y-Achse.',
    params: [{ k: 'm', min: -2, max: 2, step: 0.25, init: 0.5 }, { k: 'b', min: -1, max: 8, step: 0.5, init: 2 }],
    target: { m: -0.5, b: 4 }, starsX: [-2, 1, 4] },
  { kind: 'line', hint: 'Je steiler die Sterne abfallen, desto kleiner muss m sein.',
    params: [{ k: 'm', min: -2, max: 2, step: 0.25, init: -0.25 }, { k: 'b', min: -1, max: 8, step: 0.5, init: 6 }],
    target: { m: -1.5, b: 2 }, starsX: [-3, -1, 1] },
  { kind: 'par', hint: 'Der tiefste Stern verrät den Scheitel: d verschiebt nach rechts, e nach oben.',
    params: [{ k: 'd', min: -4, max: 4, step: 0.5, init: 1 }, { k: 'e', min: -1, max: 6, step: 0.5, init: 0 }],
    fixed: { a: 1 }, target: { a: 1, d: -1, e: 1 }, starsX: [-3, -1, 1] },
  { kind: 'par', hint: 'a macht die Parabel breiter (kleiner als 1) oder schmaler (größer als 1).',
    params: [{ k: 'a', min: -1, max: 2, step: 0.25, init: 1 }, { k: 'd', min: -4, max: 4, step: 0.5, init: 0 }, { k: 'e', min: -1, max: 6, step: 0.5, init: 2 }],
    target: { a: 0.5, d: 1, e: 0 }, starsX: [-2, 1, 3] },
  { kind: 'par', hint: 'Erst den Scheitel suchen, dann mit a die Breite anpassen.',
    params: [{ k: 'a', min: -1, max: 2, step: 0.25, init: 1 }, { k: 'd', min: -4, max: 4, step: 0.5, init: 2 }, { k: 'e', min: -1, max: 6, step: 0.5, init: 4 }],
    target: { a: 0.25, d: -2, e: 2 }, starsX: [-5, -2, 1] },
];

/** Startpunkt: dort, wo die Kurve links ins Bild kommt. */
export function startX(kind, p) {
  for (let x = -5.5; x <= 5.5; x += 0.05) {
    const y = KINDS[kind].f(p, x);
    if (y <= VIEW.y1 - 0.6 && y >= VIEW.y0 + 0.4) return x;
  }
  return null;
}

/** Simuliert die Murmel als Perle auf der Kurve. Liefert Bahn und eingesammelte Sterne. */
export function simulate(kind, p, stars, { dt = 1 / 240, tMax = 12 } = {}) {
  const K = KINDS[kind];
  const x0 = startX(kind, p);
  if (x0 === null) return { path: [], got: [], reason: 'start' };
  let x = x0, vx = 0;
  const got = new Set(), path = [];
  const G = 9.81, DAMP = 0.06;
  let reason = 'time';
  for (let t = 0, i = 0; t < tMax; t += dt, i++) {
    const s = K.d1(p, x), c = K.d2(p, x);
    vx += (-(s * (G + c * vx * vx)) / (1 + s * s)) * dt;
    vx *= 1 - DAMP * dt;
    x += vx * dt;
    const y = K.f(p, x);
    if (i % 4 === 0) path.push([x, y]);
    stars.forEach((st, k) => { if (Math.hypot(st[0] - x, st[1] - y) < 0.45) got.add(k); });
    if (x < VIEW.x0 - 0.3 || x > VIEW.x1 + 0.3 || y < VIEW.y0 - 0.3 || y > VIEW.y1 + 0.3) { reason = 'out'; break; }
    if (got.size === stars.length) { reason = 'win'; for (let j = 0; j < 60; j++) { x += vx * dt * 4; path.push([x, K.f(p, x)]); } break; }
    if (t > 1.2 && Math.abs(vx) < 0.015 && Math.abs(s) < 0.02) { reason = 'rest'; break; }
  }
  return { path, got: [...got], reason, x0 };
}

export function murmelbahn(el, ctx) {
  let li = 0, p = {}, attempts = 0, totalStars = 0, raf = 0, running = false, collected = new Set(), ball = null, solved = false;

  el.innerHTML = `
    <div class="stack">
      <div class="mission"><b class="tag" id="mb-lv"></b><p>Stell die Funktion so ein, dass die Murmel alle Sterne einsammelt.<small id="mb-hint"></small></p></div>
      <div class="stage"><canvas id="mb-c" aria-label="Murmelbahn"></canvas></div>
      <div class="readout"><span id="mb-f"></span></div>
      <div class="stack" id="mb-sl"></div>
      <div id="mb-note"></div>
      <div class="row"><button class="btn block" id="mb-go" type="button">Murmel los!</button></div>
    </div>`;
  const plot = new Plot(el.querySelector('#mb-c'), VIEW);
  const note = el.querySelector('#mb-note'), go = el.querySelector('#mb-go');

  const lvl = () => LEVELS[li];
  const K = () => KINDS[lvl().kind];
  const stars = () => lvl().starsX.map((x) => [x, K().f(lvl().target, x)]);

  function draw() {
    plot.clear(); plot.grid();
    const x0 = startX(lvl().kind, p);
    plot.fn((x) => K().f(p, x), { width: 4 });
    stars().forEach((s, k) => plot.star(s[0], s[1], { hollow: collected.has(k), r: 12 }));
    if (x0 !== null && !ball) {
      plot.dot(x0, K().f(p, x0), { r: 9, color: cssVar('--orange'), ring: 'rgba(255,116,24,.22)' });
      plot.text('Start', x0, K().f(p, x0), { dx: 16, dy: -14, color: cssVar('--orange') });
    }
    if (ball) plot.dot(ball[0], ball[1], { r: 9, color: cssVar('--orange'), ring: 'rgba(255,116,24,.22)' });
  }
  plot.onResize = draw;

  function formula() { el.querySelector('#mb-f').innerHTML = tex(`f(x)=${K().tex(p)}`); }

  function loadLevel() {
    const L = lvl();
    p = { ...(L.fixed || {}) };
    L.params.forEach((q) => { p[q.k] = q.init; });
    attempts = 0; collected = new Set(); ball = null; solved = false;
    el.querySelector('#mb-lv').textContent = `${li + 1}/${LEVELS.length}`;
    el.querySelector('#mb-hint').textContent = store.level >= 4 ? '' : L.hint;
    const box = el.querySelector('#mb-sl');
    box.innerHTML = '';
    L.params.forEach((q) => {
      const row = h(`<div class="slider"><label for="mb-${q.k}">${q.k}</label>
        <input id="mb-${q.k}" type="range" min="${q.min}" max="${q.max}" step="${q.step}" value="${q.init}" aria-label="Parameter ${q.k}">
        <output>${fmt(q.init)}</output></div>`);
      const inp = row.querySelector('input');
      inp.addEventListener('input', () => {
        if (running) stop();
        p[q.k] = +inp.value; row.querySelector('output').textContent = fmt(p[q.k]);
        collected = new Set(); ball = null; note.innerHTML = '';
        if (solved) { solved = false; go.textContent = 'Murmel los!'; }
        formula(); draw();
      });
      box.append(row);
    });
    note.innerHTML = ''; go.textContent = 'Murmel los!'; go.disabled = false;
    formula(); draw();
  }

  function stop() { cancelAnimationFrame(raf); running = false; go.disabled = false; }

  function run() {
    if (solved) { next(); return; }
    attempts++;
    const sim = simulate(lvl().kind, p, stars());
    if (sim.reason === 'start') {
      sfx('bad');
      note.innerHTML = '<div class="note bad">Die Kurve liegt links außerhalb des Bildes – die Murmel findet keinen Start.</div>';
      return;
    }
    running = true; go.disabled = true; collected = new Set(); note.innerHTML = ''; sfx('roll');
    const st = stars();
    let i = 0;
    const tick = () => {
      i = Math.min(i + 1, sim.path.length - 1);
      ball = sim.path[i];
      st.forEach((s, k) => { if (!collected.has(k) && Math.hypot(s[0] - ball[0], s[1] - ball[1]) < 0.45) { collected.add(k); buzz(); } });
      draw();
      if (i < sim.path.length - 1) { raf = requestAnimationFrame(tick); return; }
      running = false; go.disabled = false;
      if (sim.reason === 'win') {
        solved = true; sfx('ok');
        const easy = store.level <= 2 ? 2 : 0;
        const s = attempts <= 2 + easy ? 3 : attempts <= 4 + easy ? 2 : 1;
        totalStars += s;
        const last = li === LEVELS.length - 1;
        note.innerHTML = `<div class="note ok"><b>Alle Sterne!</b> ${tex(`f(x)=${K().tex(p)}`)} passt genau.</div>`;
        go.textContent = last ? 'Fertig' : 'Nächste Bahn';
      } else {
        sfx('bad');
        const miss = st.length - sim.got.length;
        const why = sim.reason === 'rest' ? 'Die Murmel bleibt liegen – sie braucht Gefälle.'
          : sim.reason === 'out' && sim.path[sim.path.length - 1][0] < sim.x0 ? 'Die Murmel rollt nach links aus dem Bild – die Bahn muss vom Start aus nach rechts abfallen.'
          : `Noch ${miss} ${miss === 1 ? 'Stern fehlt' : 'Sterne fehlen'}.`;
        note.innerHTML = `<div class="note tip"><b>Fast.</b> ${why} Verändere die Kurve und probier es nochmal.</div>`;
        ball = null; collected = new Set(sim.got); draw();
      }
    };
    raf = requestAnimationFrame(tick);
  }

  function next() {
    if (li < LEVELS.length - 1) { li++; loadLevel(); ctx.progress(li / LEVELS.length); return; }
    ctx.progress(1);
    ctx.done({ stars: Math.max(1, Math.round(totalStars / LEVELS.length)) });
  }

  go.addEventListener('click', run);
  loadLevel();
  return () => { stop(); plot.destroy(); };
}
