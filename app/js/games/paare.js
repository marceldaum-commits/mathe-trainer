// Graphen-Paare: Jedem Graphen von f den Graphen seiner Ableitung zuordnen.
import { Plot } from '../plot.js';
import { h, cssVar, buzz, sfx } from '../ui.js';
import { shuffle } from '../math.js';
import { store } from '../store.js';

const VIEW = { x0: -3, x1: 3, y0: -3, y1: 3 };

export const POOL = [
  { f: (x) => x * x / 2 - 1, d: (x) => x, why: 'Die Parabel fällt links und steigt rechts – ihre Ableitung ist eine steigende Gerade durch den Scheitel.' },
  { f: (x) => -x * x / 2 + 1, d: (x) => -x, why: 'Die Parabel steigt links und fällt rechts – ihre Ableitung ist eine fallende Gerade.' },
  { f: (x) => x ** 3 / 3 - x, d: (x) => x * x - 1, why: 'Zwei Extrempunkte bei x = −1 und x = 1: Dort hat die Ableitung ihre Nullstellen.' },
  { f: (x) => -(x ** 3) / 3 + x, d: (x) => 1 - x * x, why: 'Zwischen den Extrempunkten steigt der Graph – dort liegt die Ableitung über der x-Achse.' },
  { f: (x) => 1.5 * Math.sin(x), d: (x) => 1.5 * Math.cos(x), why: 'Bei jedem Berg und Tal der Sinuskurve hat die Ableitung eine Nullstelle.' },
  { f: (x) => 0.5 * x + 0.5, d: () => 0.5, why: 'Eine Gerade steigt überall gleich – ihre Ableitung ist konstant.' },
];

const LEICHT = [
  { f: (x) => x, d: () => 1, why: 'Die Gerade steigt überall gleich stark – ihre Ableitung ist konstant 1.' },
  { f: (x) => -0.5 * x + 1, d: () => -0.5, why: 'Die Gerade fällt gleichmäßig – ihre Ableitung ist konstant negativ.' },
  { f: () => 1.5, d: () => 0, why: 'Eine waagerechte Gerade hat überall die Steigung 0.' },
  { f: (x) => x * x / 2 - 1, d: (x) => x, why: 'Die Parabel fällt links und steigt rechts – ihre Ableitung ist eine steigende Gerade durch den Scheitel.' },
  { f: (x) => -x * x / 2 + 1, d: (x) => -x, why: 'Die Parabel steigt links und fällt rechts – ihre Ableitung ist eine fallende Gerade.' },
  { f: (x) => (x - 1) ** 2 / 2 - 1, d: (x) => x - 1, why: 'Der Scheitel liegt bei x = 1 – genau dort schneidet die Ableitung die x-Achse.' },
];
const SCHWER = [
  { f: (x) => x ** 4 / 8 - x * x, d: (x) => x ** 3 / 2 - 2 * x, why: 'Drei Extrempunkte – also drei Nullstellen der Ableitung.' },
  { f: (x) => -(x ** 4) / 8 + x * x, d: (x) => -(x ** 3) / 2 + 2 * x, why: 'Zwei Hochpunkte und ein Tiefpunkt: Die Ableitung wechselt dreimal das Vorzeichen.' },
  { f: (x) => 1.5 * Math.sin(2 * x), d: (x) => 3 * Math.cos(2 * x), why: 'Doppelt so viele Wellen – und durch die Kettenregel schwingt die Ableitung doppelt so hoch.' },
  { f: (x) => 1.5 * Math.cos(x), d: (x) => -1.5 * Math.sin(x), why: 'Der Kosinus hat bei x = 0 einen Hochpunkt – dort geht die Ableitung fallend durch 0.' },
  { f: (x) => Math.exp(x / 2) - 1.5, d: (x) => Math.exp(x / 2) / 2, why: 'Die e-Funktion steigt immer – ihre Ableitung liegt überall über der x-Achse und wächst mit.' },
  { f: (x) => x ** 3 / 6, d: (x) => x * x / 2, why: 'Sattelpunkt bei x = 0: Die Ableitung berührt die x-Achse nur, ohne das Vorzeichen zu wechseln.' },
];
/** Eigene Graphen je Schwierigkeit: leicht (Stufe 1–2), mittel (3), schwer (4–5). */
export const levelsFor = (lv) => [LEICHT, POOL, SCHWER][lv <= 2 ? 0 : lv === 3 ? 1 : 2];

export function paare(el, ctx) {
  const LS = levelsFor(store.level);
  const ROUNDS = 2;
  let round = 0, mistakes = 0, sel = null, matched = 0, plots = [], set = [];
  const order = shuffle(LS.map((_, i) => i));

  el.innerHTML = `
    <div class="stack">
      <div class="mission"><b class="tag" id="p-n"></b><p>Tippe erst einen Graphen an, dann seine Ableitung.<small>Achte auf Hoch- und Tiefpunkte: Dort ist die Ableitung 0.</small></p></div>
      <div class="rowlabel">Funktion f</div><div class="pairs" id="p-f"></div>
      <div class="rowlabel">Ableitung f′</div><div class="pairs" id="p-d"></div>
      <div id="p-note"></div>
      <div class="row" id="p-next" hidden><button class="btn block" type="button">Weiter</button></div>
    </div>`;
  const note = el.querySelector('#p-note'), nextRow = el.querySelector('#p-next');

  function card(fn, color, label) {
    const c = h(`<button class="pcard" type="button" aria-label="${label}"><canvas></canvas></button>`);
    const p = new Plot(c.querySelector('canvas'), VIEW);
    const draw = () => { p.clear(); p.grid({ labels: false }); p.fn(fn, { color: color(), width: 3 }); };
    p.onResize = draw; draw(); plots.push(p);
    return c;
  }

  function load() {
    plots.forEach((p) => p.destroy()); plots = [];
    set = order.slice(round * 3, round * 3 + 3);
    sel = null; matched = 0;
    el.querySelector('#p-n').textContent = `${round + 1}/${ROUNDS}`;
    note.innerHTML = ''; nextRow.hidden = true;
    const fBox = el.querySelector('#p-f'), dBox = el.querySelector('#p-d');
    fBox.innerHTML = ''; dBox.innerHTML = '';
    set.forEach((id, k) => {
      const c = card(LS[id].f, () => cssVar('--curve'), `Funktion ${k + 1}`);
      c.dataset.id = id;
      c.addEventListener('click', () => {
        if (c.classList.contains('ok')) return;
        fBox.querySelectorAll('.sel').forEach((n) => n.classList.remove('sel'));
        c.classList.add('sel'); sel = c; sfx('tap');
      });
      fBox.append(c);
    });
    shuffle(set).forEach((id, k) => {
      const c = card(LS[id].d, () => cssVar('--orange'), `Ableitung ${k + 1}`);
      c.dataset.id = id;
      c.addEventListener('click', () => {
        if (c.classList.contains('ok')) return;
        if (!sel) { note.innerHTML = '<div class="note tip">Tippe zuerst oben einen Graphen von f an.</div>'; return; }
        if (sel.dataset.id === c.dataset.id) {
          const letter = 'ABC'[matched++];
          [sel, c].forEach((n) => { n.classList.remove('sel'); n.classList.add('ok'); n.append(h(`<span class="badge">${letter}</span>`)); });
          note.innerHTML = `<div class="note ok"><b>Passt.</b> ${LS[+c.dataset.id].why}</div>`;
          sel = null; buzz();
          ctx.progress((round * 3 + matched) / (ROUNDS * 3));
          if (matched === 3) nextRow.hidden = false;
        } else {
          mistakes++; sfx('bad');
          c.classList.add('no'); setTimeout(() => c.classList.remove('no'), 350);
          note.innerHTML = '<div class="note tip"><b>Noch nicht.</b> Wo f einen Hoch- oder Tiefpunkt hat, muss f′ die x-Achse schneiden. Wo f steigt, liegt f′ oberhalb.</div>';
        }
      });
      dBox.append(c);
    });
  }

  nextRow.querySelector('button').addEventListener('click', () => {
    if (round < ROUNDS - 1) { round++; load(); return; }
    ctx.done({ stars: mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1, mistakes });
  });

  load();
  return () => plots.forEach((p) => p.destroy());
}
