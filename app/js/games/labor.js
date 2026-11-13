// Zufalls-Labor: Viele Versuchsreihen laufen lassen und sehen, wo der „Berg" der Verteilung liegt.
import { h, tex, cssVar, buzz, sfx, onLook } from '../ui.js';
import { fmt, ft } from '../math.js';
import { store } from '../store.js';

export const MISSIONS = [
  { text: 'Stell die Trefferwahrscheinlichkeit so ein, dass der Berg bei 3 Treffern liegt.', sub: 'Es wird 10-mal gedreht.', fix: { n: 10 }, init: { p: 0.6 }, target: 3, sol: { n: 10, p: 0.3 } },
  { text: 'Wie oft muss gedreht werden, damit der Berg bei 8 Treffern liegt?', sub: 'Die Trefferwahrscheinlichkeit ist 0,5.', fix: { p: 0.5 }, init: { n: 8 }, target: 8, sol: { n: 16, p: 0.5 } },
  { text: 'Der Berg soll bei 9 Treffern liegen.', sub: 'Die Trefferwahrscheinlichkeit ist 0,75.', fix: { p: 0.75 }, init: { n: 20 }, target: 9, sol: { n: 12, p: 0.75 } },
  { text: 'Beide Regler frei: Der Berg soll bei 6 liegen – mit genau 8 Drehungen.', sub: 'Erst n einstellen, dann das passende p suchen.', fix: {}, init: { n: 15, p: 0.5 }, target: 6, needN: 8, sol: { n: 8, p: 0.75 } },
];
const RUNS = 400;

/** Prüft die Einstellung: Erwartungswert n·p muss das Ziel treffen. */
export function solved(M, n, p) {
  return Math.abs(n * p - M.target) < 1e-9 && (!M.needN || n === M.needN);
}

function simulate(n, p) {
  const counts = Array(n + 1).fill(0);
  for (let r = 0; r < RUNS; r++) { let k = 0; for (let i = 0; i < n; i++) if (Math.random() < p) k++; counts[k]++; }
  return counts;
}

const LEICHT = [
  { text: 'Stell die Trefferwahrscheinlichkeit so ein, dass der Berg bei 5 Treffern liegt.', sub: 'Es wird 10-mal gedreht.', fix: { n: 10 }, init: { p: 0.2 }, target: 5, sol: { n: 10, p: 0.5 } },
  { text: 'Jetzt soll der Berg bei 4 Treffern liegen.', sub: 'Es wird 20-mal gedreht.', fix: { n: 20 }, init: { p: 0.6 }, target: 4, sol: { n: 20, p: 0.2 } },
  { text: 'Wie oft muss gedreht werden, damit der Berg bei 6 Treffern liegt?', sub: 'Die Trefferwahrscheinlichkeit ist 0,5 – jede zweite Drehung trifft.', fix: { p: 0.5 }, init: { n: 6 }, target: 6, sol: { n: 12, p: 0.5 } },
];
const SCHWER = [
  { text: 'Wie oft muss gedreht werden, damit der Berg bei 6 Treffern liegt?', sub: 'Die Trefferwahrscheinlichkeit ist 0,4.', fix: { p: 0.4 }, init: { n: 8 }, target: 6, sol: { n: 15, p: 0.4 } },
  { text: 'Der Berg soll bei 12 Treffern liegen.', sub: 'Es wird 16-mal gedreht.', fix: { n: 16 }, init: { p: 0.3 }, target: 12, sol: { n: 16, p: 0.75 } },
  { text: 'Beide Regler frei: Der Berg soll bei 3 liegen – mit genau 20 Drehungen.', sub: 'Welche Trefferwahrscheinlichkeit gehört dazu?', fix: {}, init: { n: 10, p: 0.5 }, target: 3, needN: 20, sol: { n: 20, p: 0.15 } },
  { text: 'Beide Regler frei: Der Berg soll bei 9 liegen – mit genau 12 Drehungen.', sub: 'Rechne erst, dann stell ein.', fix: {}, init: { n: 18, p: 0.5 }, target: 9, needN: 12, sol: { n: 12, p: 0.75 } },
  { text: 'Der Berg soll bei 7 Treffern liegen.', sub: 'Die Trefferwahrscheinlichkeit ist 0,35.', fix: { p: 0.35 }, init: { n: 10 }, target: 7, sol: { n: 20, p: 0.35 } },
];
/** Eigene Aufträge je Schwierigkeit: leicht (Stufe 1–2), mittel (3), schwer (4–5). */
export const levelsFor = (lv) => [LEICHT, MISSIONS, SCHWER][lv <= 2 ? 0 : lv === 3 ? 1 : 2];

export function labor(el, ctx) {
  const LS = levelsFor(store.level);
  let mi = 0, n = 10, p = 0.5, counts = null, shown = 0, raf = 0, tries = 0, wrongQ = 0, phase = 'lab';

  el.innerHTML = `
    <div class="stack">
      <div class="mission"><b class="tag" id="lb-n"></b><p><span id="lb-t"></span><small id="lb-s"></small></p></div>
      <div class="stage"><span class="tagline">Treffer je Versuchsreihe</span><canvas id="lb-c" style="aspect-ratio:1.35" aria-label="Säulendiagramm der Trefferzahlen"></canvas></div>
      <div class="readout"><span id="lb-f"></span><span>Mittelwert <b class="val" id="lb-m">–</b></span></div>
      <div class="stack" id="lb-sl">
        <div class="slider" id="lb-rn"><label for="lb-in">n</label><input id="lb-in" type="range" min="4" max="20" step="1" aria-label="Anzahl der Drehungen"><output></output></div>
        <div class="slider" id="lb-rp"><label for="lb-ip">p</label><input id="lb-ip" type="range" min="0.1" max="0.9" step="0.05" aria-label="Trefferwahrscheinlichkeit"><output></output></div>
      </div>
      <div id="lb-body"></div>
      <div id="lb-note"></div>
      <div class="row"><button class="btn block" id="lb-go" type="button">400 Versuchsreihen starten</button></div>
    </div>`;
  const cv = el.querySelector('#lb-c'), g = cv.getContext('2d'), note = el.querySelector('#lb-note'), go = el.querySelector('#lb-go'), body = el.querySelector('#lb-body');
  const inN = el.querySelector('#lb-in'), inP = el.querySelector('#lb-ip');
  const M = () => LS[mi];
  let W = 300, H = 220;
  const ro = new ResizeObserver(() => { size(); draw(); }); ro.observe(cv);
  const offLook = onLook(() => draw());

  function size() {
    const r = cv.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 3);
    W = r.width || 300; H = r.height || 220; cv.width = Math.round(W * d); cv.height = Math.round(H * d); g.setTransform(d, 0, 0, d, 0, 0);
  }

  function draw() {
    g.clearRect(0, 0, W, H);
    const pad = 26, bw = (W - 2 * pad) / (n + 1), base = H - 24;
    const part = counts ? counts.map((c) => (c * shown) / RUNS) : null;
    const max = Math.max(40, ...(counts || [0]));
    const tgt = M()?.target;
    for (let k = 0; k <= n; k++) {
      const x = pad + k * bw;
      if (part) {
        const hh = (part[k] / max) * (base - 26);
        g.fillStyle = phase === 'lab' && k === tgt ? cssVar('--mint') : cssVar('--orange');
        g.beginPath(); g.roundRect(x + 2, base - hh, Math.max(2, bw - 4), hh, 4); g.fill();
      }
      g.fillStyle = cssVar('--axis'); g.font = '600 10px Inter, sans-serif'; g.textAlign = 'center';
      if (n <= 12 || k % 2 === 0) g.fillText(String(k), x + bw / 2, base + 14);
    }
    g.strokeStyle = cssVar('--axis'); g.lineWidth = 1.5; g.beginPath(); g.moveTo(pad - 6, base); g.lineTo(W - pad + 6, base); g.stroke();
    if (phase === 'lab' && tgt !== undefined && tgt <= n) {
      const x = pad + tgt * bw + bw / 2;
      g.save(); g.setLineDash([5, 5]); g.strokeStyle = cssVar('--mint-ink'); g.lineWidth = 2; g.beginPath(); g.moveTo(x, 22); g.lineTo(x, base); g.stroke(); g.restore();
      g.fillStyle = cssVar('--mint-ink'); g.font = '800 11px Inter, sans-serif'; g.textAlign = 'center'; g.fillText('Ziel', x, 14);
    }
  }

  function ui() {
    inN.value = n; inP.value = p;
    el.querySelector('#lb-rn output').textContent = String(n);
    el.querySelector('#lb-rp output').textContent = fmt(p);
    el.querySelector('#lb-f').innerHTML = tex(`n=${n},\\ p=${ft(p)}`);
  }

  function setMission() {
    const m = M();
    n = m.fix.n ?? m.init.n; p = m.fix.p ?? m.init.p; counts = null; shown = 0; tries = 0;
    el.querySelector('#lb-n').textContent = `${mi + 1}/${LS.length + 1}`;
    el.querySelector('#lb-t').textContent = m.text; el.querySelector('#lb-s').textContent = m.sub;
    el.querySelector('#lb-rn').hidden = m.fix.n !== undefined; el.querySelector('#lb-rp').hidden = m.fix.p !== undefined;
    el.querySelector('#lb-m').textContent = '–';
    note.innerHTML = ''; go.textContent = '400 Versuchsreihen starten'; go.dataset.next = '';
    ui(); draw();
  }

  function change() {
    cancelAnimationFrame(raf); counts = null; shown = 0; note.innerHTML = ''; el.querySelector('#lb-m').textContent = '–';
    go.textContent = '400 Versuchsreihen starten'; go.dataset.next = ''; go.disabled = false;
    ui(); draw();
  }
  inN.addEventListener('input', () => { n = +inN.value; change(); });
  inP.addEventListener('input', () => { p = +(+inP.value).toFixed(2); change(); });

  function run() {
    tries++;
    counts = simulate(n, p); shown = 0; go.disabled = true; sfx('roll');
    const mean = counts.reduce((s, c, k) => s + c * k, 0) / RUNS;
    const tick = () => {
      shown = Math.min(RUNS, shown + 10); draw();
      if (shown < RUNS) { raf = requestAnimationFrame(tick); return; }
      go.disabled = false;
      el.querySelector('#lb-m').textContent = fmt(mean, 1);
      if (solved(M(), n, p)) {
        buzz(20);
        note.innerHTML = `<div class="note ok"><b>Getroffen.</b> Der Berg liegt bei ${M().target} – der Mittelwert der 400 Reihen ist ${fmt(mean, 1)}.</div>`;
        go.textContent = 'Weiter'; go.dataset.next = '1';
        ctx.progress((mi + 1) / (LS.length + 1));
      } else {
        sfx('bad');
        const wrongN = M().needN && n !== M().needN;
        note.innerHTML = `<div class="note tip"><b>Noch nicht.</b> ${wrongN ? `Es sollen genau ${M().needN} Drehungen sein.` : `Der Berg liegt bei etwa ${fmt(mean, 1)}, das Ziel ist ${M().target}. Verändere den Regler.`}</div>`;
      }
    };
    raf = requestAnimationFrame(tick);
  }

  function question() {
    phase = 'ask';
    el.querySelector('#lb-n').textContent = `${LS.length + 1}/${LS.length + 1}`;
    el.querySelector('#lb-t').textContent = 'Du hast es gemerkt: Wo liegt der Berg?';
    el.querySelector('#lb-s').textContent = 'Wähle die passende Formel.';
    el.querySelector('#lb-sl').hidden = true; go.hidden = true; note.innerHTML = '';
    const opts = [['n\\cdot p', true, ''], ['n+p', false, `Probier es an einem Beispiel: n = ${LS[0].sol.n} und p = ${ft(LS[0].sol.p)} ergab den Berg bei ${LS[0].target}.`], ['\\dfrac{n}{p}', false, 'Dann läge der Berg bei mehr Treffern, als es Drehungen gibt.'], ['n\\cdot(1-p)', false, 'Das ist die erwartete Zahl der Nicht-Treffer.']].sort(() => Math.random() - 0.5);
    const box = h('<div class="opts"></div>');
    opts.forEach(([t, ok, why], i) => {
      const b = h(`<button class="opt" type="button" data-ok="${ok ? 1 : 0}"><span class="k">${'ABCD'[i]}</span><span>${tex(t)}</span></button>`);
      b.addEventListener('click', () => {
        if (go.dataset.next === 'done') return;
        if (ok) {
          b.classList.add('right'); sfx('ok'); go.dataset.next = 'done'; go.hidden = false; go.textContent = 'Fertig'; go.disabled = false;
          note.innerHTML = `<div class="note ok"><b>Genau.</b> Das ist der Erwartungswert: ${tex('\\mu=n\\cdot p')}.</div>`;
          ctx.progress(1);
        } else { wrongQ++; sfx('bad'); b.classList.add('wrong'); note.innerHTML = `<div class="note bad"><b>Nicht ganz.</b> ${why}</div>`; }
      });
      box.append(b);
    });
    body.replaceChildren(box);
  }

  go.addEventListener('click', () => {
    if (go.dataset.next === 'done') { ctx.done({ stars: wrongQ === 0 ? 3 : wrongQ === 1 ? 2 : 1, mistakes: wrongQ }); return; }
    if (go.dataset.next === '1') { if (mi < LS.length - 1) { mi++; setMission(); } else question(); return; }
    run();
  });

  size(); setMission();
  return () => { cancelAnimationFrame(raf); ro.disconnect(); offLook(); };
}
