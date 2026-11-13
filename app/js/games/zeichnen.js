// Ableitung zeichnen: Zum Graphen von f die Ableitung mit dem Finger skizzieren.
import { Plot } from '../plot.js';
import { tex, cssVar, sfx } from '../ui.js';
import { fmt } from '../math.js';
import { store } from '../store.js';

const VIEW = { x0: -4, x1: 4, y0: -2.4, y1: 2.4 };
const N = 161;

export const ROUNDS = [
  { tex: 'f(x)=0{,}2x^2-1{,}5', f: (x) => 0.2 * x * x - 1.5, d: (x) => 0.4 * x, tip: 'Links fällt der Graph, rechts steigt er – und zwar immer steiler.' },
  { tex: 'f(x)=\\tfrac1{12}x^3-x', f: (x) => x ** 3 / 12 - x, d: (x) => x * x / 4 - 1, tip: 'Suche zuerst Hoch- und Tiefpunkt: Dort schneidet die Ableitung die x-Achse.' },
  { tex: 'f(x)=1{,}5\\sin(x)', f: (x) => 1.5 * Math.sin(x), d: (x) => 1.5 * Math.cos(x), tip: 'An jedem Berg und in jedem Tal ist die Steigung 0.' },
];

export const colX = (i) => VIEW.x0 + ((VIEW.x1 - VIEW.x0) * i) / (N - 1);

/** Bewertet die Skizze. ys: gezeichnete Werte je Spalte (NaN = nichts). */
export function grade(round, ys, lv = 3) {
  const k = [1.45, 1.2, 1, 0.85, 0.7][lv - 1];
  let n = 0, err = 0, wrongRun = null, best = null, wrongCols = 0;
  for (let i = 0; i < N; i++) {
    const y = ys[i];
    if (Number.isNaN(y)) { if (wrongRun) { wrongRun = null; } continue; }
    const t = round.d(colX(i));
    n++; err += Math.abs(Math.max(VIEW.y0, Math.min(VIEW.y1, t)) - y);
    const wrong = Math.abs(t) > 0.35 && Math.sign(t) !== Math.sign(y);
    if (wrong) {
      wrongCols++;
      if (!wrongRun) wrongRun = { a: i, b: i, sign: Math.sign(t) }; else wrongRun.b = i;
      if (!best || wrongRun.b - wrongRun.a > best.b - best.a) best = { ...wrongRun };
    } else wrongRun = null;
  }
  const coverage = n / N;
  if (coverage < 0.7) return { coverage, stars: 0, err: Infinity, wrong: null };
  const mean = err / n;
  // Wer auf mehr als einem Viertel der Breite das falsche Vorzeichen hat (steigend statt fallend), besteht auf keiner Stufe.
  const stars = wrongCols / n > 0.25 ? 0 : mean <= 0.28 * k ? 3 : mean <= 0.5 * k ? 2 : mean <= 0.75 * k ? 1 : 0;
  const wrong = best && best.b - best.a >= 10 ? { x0: colX(best.a), x1: colX(best.b), sign: best.sign } : null;
  return { coverage, stars, err: mean, wrong };
}

const LEICHT = [
  { tex: 'f(x)=0{,}5x', f: (x) => 0.5 * x, d: () => 0.5, tip: 'Eine Gerade steigt überall gleich – die Ableitung ist eine waagerechte Linie.' },
  { tex: 'f(x)=0{,}25x^2-1', f: (x) => 0.25 * x * x - 1, d: (x) => 0.5 * x, tip: 'Links fällt der Graph, rechts steigt er – und zwar immer steiler.' },
  { tex: 'f(x)=-0{,}25x^2+1{,}5', f: (x) => -0.25 * x * x + 1.5, d: (x) => -0.5 * x, tip: 'Links steigt der Graph, rechts fällt er. Am Hochpunkt ist die Steigung 0.' },
];
const SCHWER = [
  { tex: 'f(x)=\\tfrac1{32}x^4-\\tfrac12x^2', f: (x) => x ** 4 / 32 - x * x / 2, d: (x) => x ** 3 / 8 - x, tip: 'Drei Extrempunkte: Dort schneidet die Ableitung die x-Achse.' },
  { tex: 'f(x)=1{,}2\\cos(x)', f: (x) => 1.2 * Math.cos(x), d: (x) => -1.2 * Math.sin(x), tip: 'Bei x = 0 liegt ein Hochpunkt. Danach fällt der Graph.' },
  { tex: 'f(x)=0{,}5e^{0{,}5x}-2', f: (x) => 0.5 * Math.exp(0.5 * x) - 2, d: (x) => 0.25 * Math.exp(0.5 * x), tip: 'Der Graph steigt überall – und immer schneller.' },
];
const SEHR_LEICHT = [
  { tex: 'f(x)=x', f: (x) => x, d: () => 1, tip: 'Die Gerade steigt überall gleich stark: Die Ableitung ist eine waagerechte Linie bei 1.' },
  { tex: 'f(x)=-0{,}5x', f: (x) => -0.5 * x, d: () => -0.5, tip: 'Die Gerade fällt überall gleich: Die Ableitung liegt unter der x-Achse.' },
  { tex: 'f(x)=0{,}15x^2', f: (x) => 0.15 * x * x, d: (x) => 0.3 * x, tip: 'Im Tiefpunkt ist die Steigung 0, rechts davon positiv, links negativ.' },
];
const ANSPRUCH = [
  { tex: 'f(x)=\\tfrac19x^3-x', f: (x) => x ** 3 / 9 - x, d: (x) => x * x / 3 - 1, tip: 'Hoch- und Tiefpunkt liegen nicht auf dem Gitter – schätze sie am Graphen ab.' },
  { tex: 'f(x)=\\sin(1{,}5x)', f: (x) => Math.sin(1.5 * x), d: (x) => 1.5 * Math.cos(1.5 * x), tip: 'Viele Berge und Täler: An jedem ist die Steigung 0.' },
  { tex: 'f(x)=-\\tfrac1{64}x^4+\\tfrac14x^2', f: (x) => -(x ** 4) / 64 + x * x / 4, d: (x) => -(x ** 3) / 16 + x / 2, tip: 'Zwei Hochpunkte außen, ein Tiefpunkt in der Mitte.' },
];
/** Eigene Level für jede der fünf Schwierigkeiten. */
export const levelsFor = (lv) => [SEHR_LEICHT, LEICHT, ROUNDS, ANSPRUCH, SCHWER][Math.min(5, Math.max(1, lv | 0 || 3)) - 1];

export function zeichnen(el, ctx) {
  const LS = levelsFor(store.level);
  let ri = 0, ys = new Float32Array(N).fill(NaN), last = null, drawing = false, checked = null, sum = 0, tries = 0;

  el.innerHTML = `
    <div class="stack">
      <div class="mission"><b class="tag" id="z-n"></b><p>Skizziere unten den Graphen der Ableitung.<small id="z-tip"></small></p></div>
      <div class="stage"><span class="tagline f" id="z-fx"></span><canvas id="z-f" aria-label="Graph von f"></canvas></div>
      <div class="stage"><span class="tagline">Hier zeichnen</span><canvas id="z-d" aria-label="Zeichenfläche für die Ableitung"></canvas></div>
      <div id="z-note"></div>
      <div class="row"><button class="btn ghost" id="z-clear" type="button">Löschen</button><button class="btn grow" id="z-check" type="button" disabled>Prüfen</button></div>
    </div>`;
  const fp = new Plot(el.querySelector('#z-f'), VIEW);
  const dc = el.querySelector('#z-d');
  const dp = new Plot(dc, VIEW);
  const note = el.querySelector('#z-note'), btn = el.querySelector('#z-check'), clr = el.querySelector('#z-clear');
  const R = () => LS[ri];

  function draw() {
    fp.clear(); fp.grid(); fp.fn(R().f, { width: 4 });
    dp.clear(); dp.grid();
    if (checked) dp.fn(R().d, { color: cssVar('--mint'), width: 4 });
    const g = dp.ctx;
    g.save(); g.strokeStyle = cssVar('--orange'); g.lineWidth = 4; g.lineJoin = 'round'; g.lineCap = 'round'; g.beginPath();
    let pen = false;
    for (let i = 0; i < N; i++) {
      if (Number.isNaN(ys[i])) { pen = false; continue; }
      if (pen) g.lineTo(dp.X(colX(i)), dp.Y(ys[i])); else { g.moveTo(dp.X(colX(i)), dp.Y(ys[i])); pen = true; }
    }
    g.stroke(); g.restore();
  }
  fp.onResize = draw; dp.onResize = draw;

  function load() {
    ys = new Float32Array(N).fill(NaN); checked = null; tries = 0;
    el.querySelector('#z-n').textContent = `${ri + 1}/${LS.length}`;
    el.querySelector('#z-tip').textContent = store.level >= 5 ? '' : R().tip;
    el.querySelector('#z-fx').innerHTML = tex(R().tex);
    note.innerHTML = ''; btn.textContent = 'Prüfen'; btn.disabled = true; clr.hidden = false;
    draw();
  }

  function put(ev) {
    const p = dp.at(ev);
    const i = Math.round(((p.x - VIEW.x0) / (VIEW.x1 - VIEW.x0)) * (N - 1));
    const y = Math.max(VIEW.y0, Math.min(VIEW.y1, p.y));
    if (i < 0 || i >= N) { last = null; return; }
    if (last && last.i !== i) {
      const step = i > last.i ? 1 : -1;
      for (let k = last.i; k !== i + step; k += step) ys[k] = last.y + ((y - last.y) * (k - last.i)) / (i - last.i);
    } else ys[i] = y;
    last = { i, y };
    let n = 0; for (let k = 0; k < N; k++) if (!Number.isNaN(ys[k])) n++;
    btn.disabled = n / N < 0.7;
    draw();
  }
  dc.addEventListener('pointerdown', (ev) => {
    if (checked) return;
    drawing = true; last = null; dc.setPointerCapture(ev.pointerId); put(ev);
  });
  dc.addEventListener('pointermove', (ev) => { if (drawing && !checked) put(ev); });
  const up = () => { drawing = false; last = null; };
  dc.addEventListener('pointerup', up); dc.addEventListener('pointercancel', up);

  clr.addEventListener('click', () => { ys.fill(NaN); checked = null; note.innerHTML = ''; btn.textContent = 'Prüfen'; btn.disabled = true; draw(); });

  btn.addEventListener('click', () => {
    if (checked) {
      if (checked.stars === 0) { ys.fill(NaN); checked = null; note.innerHTML = ''; btn.textContent = 'Prüfen'; btn.disabled = true; clr.hidden = false; draw(); return; }
      sum += Math.max(1, checked.stars - Math.min(1, tries - 1));
      if (ri < LS.length - 1) { ri++; ctx.progress(ri / LS.length); load(); return; }
      ctx.progress(1); ctx.done({ stars: Math.max(1, Math.round(sum / LS.length)) });
      return;
    }
    tries++;
    checked = grade(R(), ys, store.level);
    clr.hidden = true; sfx(checked.stars ? 'ok' : 'bad');
    let msg;
    if (checked.wrong) {
      const w = checked.wrong;
      msg = `Zwischen ${tex(`x\\approx${fmt(w.x0, 1).replace(',', '{,}')}`)} und ${tex(`x\\approx${fmt(w.x1, 1).replace(',', '{,}')}`)} ${w.sign > 0 ? 'steigt' : 'fällt'} der Graph von ${tex('f')}. Dort muss ${tex("f'")} ${w.sign > 0 ? 'über' : 'unter'} der x-Achse liegen.`;
    } else if (checked.stars === 3) msg = 'Sehr genau – Vorzeichen, Nullstellen und Verlauf passen.';
    else if (checked.stars > 0) msg = 'Der Verlauf stimmt. Vergleiche die Höhe mit der grünen Kurve: Je steiler f, desto größer der Betrag von f′.';
    else msg = 'Das passt noch nicht. Schau, wo f steigt (f′ positiv), fällt (f′ negativ) und wo ein Hoch- oder Tiefpunkt liegt (f′ = 0).';
    note.innerHTML = `<div class="note ${checked.stars ? 'ok' : 'tip'}"><b>${checked.stars ? 'Grün ist die richtige Ableitung.' : 'Noch einmal.'}</b> ${msg}</div>`;
    btn.textContent = checked.stars ? (ri < LS.length - 1 ? 'Nächste Funktion' : 'Fertig') : 'Nochmal zeichnen';
    draw();
  });

  load();
  return () => { fp.destroy(); dp.destroy(); };
}
