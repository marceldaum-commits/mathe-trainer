// Vektor-Lotse: Das Schiff mit Vektoren zum Stern steuern – erst direkt, dann als Linearkombination.
import { Plot } from '../plot.js';
import { h, tex, cssVar, buzz, sfx } from '../ui.js';
import { ft } from '../math.js';
import { store } from '../store.js';

const VIEW = { x0: -6, x1: 6, y0: -6, y1: 6 };
const V = (v) => `\\begin{pmatrix}${ft(v[0])}\\\\${ft(v[1])}\\end{pmatrix}`;

export const MISSIONS = [
  { type: 'vec', A: [-4, -3], B: [2, 1], sol: [6, 4], text: 'Steuere das Schiff zum Stern.', sub: 'Stell den Vektor ein: erst nach rechts/links, dann nach oben/unten.' },
  { type: 'vec', A: [3, 4], B: [-2, -1], sol: [-5, -5], text: 'Und jetzt in die andere Richtung.', sub: 'Nach links und nach unten sind die Koordinaten negativ.' },
  { type: 'combo', A: [-4, -4], u: [2, 1], v: [1, 3], sol: [2, 1], text: 'Du darfst nur in zwei Richtungen fahren.', sub: 'Wie oft brauchst du jeden der beiden Vektoren?' },
  { type: 'combo', A: [0, -4], u: [2, 1], v: [-1, 2], sol: [1, 2], text: 'Neue Richtungen, neues Ziel.', sub: 'Probier aus, wie sich der Weg mit r und s verändert.' },
  { type: 'combo', A: [4, 3], u: [1, 2], v: [3, -1], sol: [-2, -1], text: 'Diesmal liegt der Stern „hinter" dir.', sub: 'Negative Faktoren drehen einen Vektor um.' },
];

/** Zielpunkt einer Mission. */
export function goal(M) {
  if (M.type === 'vec') return M.B;
  return [M.A[0] + M.sol[0] * M.u[0] + M.sol[1] * M.v[0], M.A[1] + M.sol[0] * M.u[1] + M.sol[1] * M.v[1]];
}
/** Endpunkt für die eingestellten Werte. */
export function endPoint(M, a, b) {
  if (M.type === 'vec') return [M.A[0] + a, M.A[1] + b];
  return [M.A[0] + a * M.u[0] + b * M.v[0], M.A[1] + a * M.u[1] + b * M.v[1]];
}

const LEICHT = [
  { type: 'vec', A: [-3, -2], B: [1, 2], sol: [4, 4], text: 'Steuere das Schiff zum Stern.', sub: 'Stell den Vektor ein: erst nach rechts, dann nach oben.' },
  { type: 'vec', A: [-2, 3], B: [3, 1], sol: [5, -2], text: 'Der Stern liegt rechts unten.', sub: 'Nach unten ist die zweite Koordinate negativ.' },
  { type: 'vec', A: [4, -1], B: [-1, 3], sol: [-5, 4], text: 'Und jetzt nach links oben.', sub: 'Nach links ist die erste Koordinate negativ.' },
  { type: 'combo', A: [-4, -3], u: [2, 0], v: [0, 1], sol: [3, 3], text: 'Du darfst nur nach rechts und nach oben fahren.', sub: 'Wie oft brauchst du jeden der beiden Vektoren?' },
];
const SCHWER = [
  { type: 'combo', A: [-3, 2], u: [2, 1], v: [1, -2], sol: [2, 3], text: 'Steuere das Schiff mit den beiden Vektoren zum Stern.', sub: 'Überlege erst, dann stell r und s ein.' },
  { type: 'combo', A: [3, -4], u: [-1, 2], v: [2, 1], sol: [3, -1], text: 'Ein Vektor muss rückwärts gefahren werden.', sub: 'Negative Faktoren drehen einen Vektor um.' },
  { type: 'combo', A: [5, 4], u: [3, 1], v: [1, 2], sol: [-2, -2], text: 'Der Stern liegt „hinter" dir.', sub: 'Beide Faktoren sind negativ.' },
  { type: 'combo', A: [-5, -1], u: [1, 3], v: [3, -1], sol: [1, 3], text: 'Die Vektoren stehen senkrecht aufeinander.', sub: 'Das macht es übersichtlicher – nutze es.' },
  { type: 'combo', A: [0, 5], u: [2, -1], v: [-1, -2], sol: [-1, 3], text: 'Letzte Fahrt.', sub: 'Stelle zwei Gleichungen für r und s auf.' },
];
const SEHR_LEICHT = [
  { type: 'vec', A: [-4, -2], B: [0, -2], sol: [4, 0], text: 'Der Stern liegt genau rechts vom Schiff.', sub: 'Nur die erste Koordinate ändert sich.' },
  { type: 'vec', A: [-1, -3], B: [-1, 2], sol: [0, 5], text: 'Jetzt liegt der Stern genau über dem Schiff.', sub: 'Nur die zweite Koordinate ändert sich.' },
  { type: 'vec', A: [-3, -1], B: [2, 3], sol: [5, 4], text: 'Schräg nach rechts oben.', sub: 'Erst nach rechts, dann nach oben.' },
];
const ANSPRUCH = [
  { type: 'combo', A: [-4, 1], u: [2, 1], v: [1, -1], sol: [3, 2], text: 'Du darfst nur in zwei Richtungen fahren.', sub: 'Wie oft brauchst du jeden der beiden Vektoren?' },
  { type: 'combo', A: [2, -4], u: [1, 2], v: [-2, 1], sol: [2, 1], text: 'Die Richtungen stehen senkrecht aufeinander.', sub: 'Erst die eine Richtung ganz, dann die andere.' },
  { type: 'combo', A: [4, 4], u: [2, 1], v: [1, 3], sol: [-3, -1], text: 'Der Stern liegt „hinter" dir.', sub: 'Negative Faktoren drehen einen Vektor um.' },
  { type: 'combo', A: [-2, -5], u: [1, 2], v: [2, -1], sol: [3, -2], text: 'Ein Faktor positiv, einer negativ.', sub: 'Überlege, welcher Vektor zurückgefahren werden muss.' },
];
/** Eigene Level für jede der fünf Schwierigkeiten. */
export const levelsFor = (lv) => [SEHR_LEICHT, LEICHT, MISSIONS, ANSPRUCH, SCHWER][Math.min(5, Math.max(1, lv | 0 || 3)) - 1];

export function lotse(el, ctx) {
  const LS = levelsFor(store.level);
  let mi = 0, a = 0, b = 0, tries = 0, total = 0, solved = false;

  el.innerHTML = `
    <div class="stack">
      <div class="mission"><b class="tag" id="lo-n"></b><p><span id="lo-t"></span><small id="lo-s"></small></p></div>
      <div class="stage"><canvas id="lo-c" aria-label="Koordinatensystem mit Schiff und Stern"></canvas></div>
      <div class="readout"><span id="lo-f"></span></div>
      <div class="stack" id="lo-sl"></div>
      <div id="lo-note"></div>
      <div class="row"><button class="btn block" id="lo-go" type="button">Kurs prüfen</button></div>
    </div>`;
  const plot = new Plot(el.querySelector('#lo-c'), VIEW);
  const note = el.querySelector('#lo-note'), go = el.querySelector('#lo-go');
  const M = () => LS[mi];

  function arrow(p, q, color, width = 4) {
    const g = plot.ctx;
    if (p[0] === q[0] && p[1] === q[1]) return;
    plot.seg(p[0], p[1], q[0], q[1], { color, width });
    const ang = Math.atan2(plot.Y(q[1]) - plot.Y(p[1]), plot.X(q[0]) - plot.X(p[0]));
    g.save(); g.fillStyle = color; g.translate(plot.X(q[0]), plot.Y(q[1])); g.rotate(ang);
    g.beginPath(); g.moveTo(0, 0); g.lineTo(-13, -6); g.lineTo(-13, 6); g.closePath(); g.fill(); g.restore();
  }

  function draw() {
    const m = M(), B = goal(m);
    plot.clear(); plot.grid();
    plot.star(B[0], B[1], { r: 13, hollow: solved });
    if (m.type === 'vec') arrow(m.A, endPoint(m, a, b), cssVar('--orange'));
    else {
      const mid = [m.A[0] + a * m.u[0], m.A[1] + a * m.u[1]];
      arrow(m.A, mid, cssVar('--orange')); arrow(mid, endPoint(m, a, b), cssVar('--mint-ink'));
    }
    plot.dot(m.A[0], m.A[1], { r: 8, color: cssVar('--curve'), ring: 'rgba(23,58,116,.18)' });
    plot.text('Start', m.A[0], m.A[1], { dx: 12, dy: 14 });
    const E = endPoint(m, a, b);
    el.querySelector('#lo-f').innerHTML = m.type === 'vec'
      ? tex(`\\vec v=${V([a, b])}`)
      : tex(`${ft(a)}\\cdot${V(m.u)}+${b < 0 ? `(${ft(b)})` : ft(b)}\\cdot${V(m.v)}=${V([E[0] - m.A[0], E[1] - m.A[1]])}`);
  }
  plot.onResize = draw;

  function slider(key, label, min, max, get, set) {
    const row = h(`<div class="slider"><label for="lo-${key}">${label}</label><input id="lo-${key}" type="range" min="${min}" max="${max}" step="1" value="${get()}" aria-label="${label}"><output>${get()}</output></div>`);
    const inp = row.querySelector('input');
    inp.addEventListener('input', () => {
      set(+inp.value); row.querySelector('output').textContent = String(get());
      if (solved) { solved = false; go.textContent = 'Kurs prüfen'; }
      note.innerHTML = ''; draw();
    });
    return row;
  }

  function load() {
    const m = M();
    a = 0; b = 0; tries = 0; solved = false;
    el.querySelector('#lo-n').textContent = `${mi + 1}/${LS.length}`;
    el.querySelector('#lo-t').textContent = m.text; el.querySelector('#lo-s').textContent = m.sub;
    const box = el.querySelector('#lo-sl'); box.innerHTML = '';
    if (m.type === 'vec') box.append(slider('a', 'x', -8, 8, () => a, (v) => { a = v; }), slider('b', 'y', -8, 8, () => b, (v) => { b = v; }));
    else box.append(slider('a', 'r', -3, 3, () => a, (v) => { a = v; }), slider('b', 's', -3, 3, () => b, (v) => { b = v; }));
    note.innerHTML = ''; go.textContent = 'Kurs prüfen';
    draw();
  }

  go.addEventListener('click', () => {
    const m = M();
    if (solved) {
      if (mi < LS.length - 1) { mi++; load(); return; }
      ctx.done({ stars: Math.max(1, Math.round(total / LS.length)) }); return;
    }
    tries++;
    const E = endPoint(m, a, b), B = goal(m);
    if (E[0] === B[0] && E[1] === B[1]) {
      solved = true; buzz(20);
      total += tries <= 1 ? 3 : tries <= 3 ? 2 : 1;
      note.innerHTML = m.type === 'vec'
        ? `<div class="note ok"><b>Angekommen.</b> ${tex(`\\overrightarrow{AB}=${V([a, b])}`)} – das ist „Ziel minus Start".</div>`
        : `<div class="note ok"><b>Angekommen.</b> Der Weg ist eine Linearkombination: ${tex(`${ft(a)}\\cdot\\vec u+${b < 0 ? `(${ft(b)})` : ft(b)}\\cdot\\vec v`)}.</div>`;
      go.textContent = mi < LS.length - 1 ? 'Nächstes Ziel' : 'Fertig';
      ctx.progress((mi + 1) / LS.length);
    } else {
      sfx('bad');
      const dx = B[0] - E[0], dy = B[1] - E[1];
      const dir = [dx > 0 ? `${dx} nach rechts` : dx < 0 ? `${-dx} nach links` : '', dy > 0 ? `${dy} nach oben` : dy < 0 ? `${-dy} nach unten` : ''].filter(Boolean).join(' und ');
      note.innerHTML = `<div class="note tip"><b>Knapp daneben.</b> Dem Schiff fehlen noch ${dir}.</div>`;
    }
    draw();
  });

  load();
  return () => plot.destroy();
}
