// Pythagoras-Quadrate: Über jeder Seite eines rechtwinkligen Dreiecks steht ein Quadrat.
// Die beiden kleinen Flächen sind zusammen genau so groß wie die große.
import { sfx, buzz, funken, tex } from '../ui.js';
import { store } from '../store.js';
import { piKlein } from './strahl.js';

const Q = (text, c2, sol) => ({ text, c2, sol });
const L1 = [Q('Stell die Katheten auf 3 und 4. Wie groß wird das große Quadrat?', 25, [3, 4]), Q('Das große Quadrat soll 8 Kästchen groß sein.', 8, [2, 2]), Q('Das große Quadrat soll 13 Kästchen groß sein.', 13, [2, 3])];
const L2 = [Q('Das große Quadrat soll 25 Kästchen groß sein.', 25, [3, 4]), Q('Das große Quadrat soll 20 Kästchen groß sein.', 20, [2, 4]), Q('Das große Quadrat soll 34 Kästchen groß sein.', 34, [3, 5])];
const L3 = [Q('Die Hypotenuse soll genau 5 lang sein.', 25, [3, 4]), Q('Die Hypotenuse soll genau 10 lang sein.', 100, [6, 8]), Q('Das große Quadrat soll 50 Kästchen groß sein.', 50, [5, 5])];
const L4 = [Q('Die Hypotenuse soll genau 13 lang sein.', 169, [5, 12]), Q('Das große Quadrat soll 65 Kästchen groß sein.', 65, [4, 7]), Q('Das große Quadrat soll 52 Kästchen groß sein.', 52, [4, 6])];
const L5 = [Q('Die Hypotenuse soll genau 15 lang sein.', 225, [9, 12]), Q('Das große Quadrat soll 85 Kästchen groß sein.', 85, [6, 7]), Q('Die Hypotenuse soll genau 10 lang sein – mit zwei verschieden langen Katheten.', 100, [6, 8]), Q('Das große Quadrat soll 145 Kästchen groß sein.', 145, [8, 9])];
/** Eigene Level für jede der fünf Schwierigkeiten. */
export const levelsFor = (lv) => [L1, L2, L3, L4, L5][Math.min(5, Math.max(1, lv | 0 || 3)) - 1];
export const getroffen = (M, a, b) => a * a + b * b === M.c2;

export function quadrate(el, ctx) {
  const LS = levelsFor(store.level), zeigen = store.level <= 2;
  let mi = 0, fehler = 0, fertig = false;
  el.innerHTML = `
    <div class="stack kind-spiel">
      <div class="mission"><b class="tag" id="pq-n"></b><p><span id="pq-t"></span><small id="pq-s"></small></p>${piKlein()}</div>
      <div class="stage kind-buehne"><svg id="pq" viewBox="0 0 320 200" role="img" aria-label="Rechtwinkliges Dreieck mit Quadraten über den Seiten"></svg></div>
      <div class="stack kg-regler">
        <div class="slider"><label for="pq-a">a</label><input id="pq-a" type="range" min="1" max="12" step="1" aria-label="Kathete a"><output id="pq-ao"></output></div>
        <div class="slider"><label for="pq-b">b</label><input id="pq-b" type="range" min="1" max="12" step="1" aria-label="Kathete b"><output id="pq-bo"></output></div>
      </div>
      <div id="pq-note"></div>
      <div class="row"><button class="btn block" id="pq-go" type="button">Prüfen</button></div>
    </div>`;
  const $ = (s) => el.querySelector(s), svg = $('#pq'), ia = $('#pq-a'), ib = $('#pq-b'), go = $('#pq-go'), note = $('#pq-note');
  const M = () => LS[mi];
  function zeichne() {
    const a = +ia.value, b = +ib.value, breit = 2 * a + 2 * b, hoch = 2 * a + b + Math.max(0, b - a) * 0 + b, k = Math.min(300 / (a + 2 * b), 184 / (2 * a + b)), x0 = 160 - ((a + 2 * b) * k) / 2 + b * k, y0 = 100 + ((2 * a + b) * k) / 2 - a * k;
    const P = (x, y) => `${(x0 + x * k).toFixed(1)},${(y0 - y * k).toFixed(1)}`, poly = (pts, cls) => `<polygon points="${pts.map(([x, y]) => P(x, y)).join(' ')}" class="${cls}"/>`;
    void breit; void hoch;
    svg.innerHTML = [poly([[0, 0], [a, 0], [a, -a], [0, -a]], 'pq-q pq-a'), poly([[0, 0], [0, b], [-b, b], [-b, 0]], 'pq-q pq-b'), poly([[a, 0], [0, b], [b, a + b], [a + b, a]], 'pq-q pq-c'), poly([[0, 0], [a, 0], [0, b]], 'pq-d'),
      a * k < 18 ? '' : `<text x="${x0 + (a * k) / 2}" y="${y0 + (a * k) / 2 + 5}" text-anchor="middle" class="strahl-zahl">${zeigen || fertig ? a * a : 'a²'}</text>`, b * k < 18 ? '' : `<text x="${x0 - (b * k) / 2}" y="${y0 - (b * k) / 2 + 5}" text-anchor="middle" class="strahl-zahl">${zeigen || fertig ? b * b : 'b²'}</text>`, `<text x="${x0 + ((a + b) * k) / 2}" y="${y0 - ((a + b) * k) / 2 + 5}" text-anchor="middle" class="strahl-wert">${zeigen || fertig ? a * a + b * b : 'c²'}</text>`].join('');
    $('#pq-ao').textContent = a; $('#pq-bo').textContent = b;
    $('#pq-s').textContent = zeigen || fertig ? `${a * a} + ${b * b} = ${a * a + b * b}` : 'Die zwei kleinen Quadrate zusammen ergeben das große.';
  }
  function lade() {
    fertig = false; $('#pq-n').textContent = `${mi + 1}/${LS.length}`; $('#pq-t').textContent = M().text;
    ia.value = 1; ib.value = 1; ia.disabled = ib.disabled = false; note.innerHTML = ''; go.textContent = 'Prüfen'; delete go.dataset.next; zeichne();
  }
  for (const i of [ia, ib]) i.addEventListener('input', () => { if (!fertig) zeichne(); });
  go.onclick = () => {
    if (go.dataset.next) { if (mi < LS.length - 1) { mi++; lade(); return; } ctx.done({ stars: fehler === 0 ? 3 : fehler <= 2 ? 2 : 1, mistakes: fehler }); return; }
    const m = M(), a = +ia.value, b = +ib.value, c2 = a * a + b * b, c = Math.sqrt(m.c2);
    if (getroffen(m, a, b) && !(/verschieden/.test(m.text) && a === b)) { fertig = true; ia.disabled = ib.disabled = true; zeichne(); sfx('ok'); buzz(); funken(svg);
      note.innerHTML = `<div class="note ok"><b>Genau!</b> ${tex(`${a}^2+${b}^2=${a * a}+${b * b}=${c2}`)}${Number.isInteger(c) ? ` – die Hypotenuse ist ${tex(`\\sqrt{${c2}}=${c}`)} lang.` : `. Die Hypotenuse ist ${tex(`\\sqrt{${c2}}`)} lang.`}</div>`;
      go.dataset.next = '1'; go.textContent = mi < LS.length - 1 ? 'Weiter' : 'Fertig'; ctx.progress((mi + 1) / LS.length); }
    else { fehler++; sfx('bad'); note.innerHTML = `<div class="note tip">Das große Quadrat hat jetzt ${c2} Kästchen – gesucht sind ${m.c2}. ${c2 < m.c2 ? 'Mach eine Kathete länger.' : 'Mach eine Kathete kürzer.'}</div>`; }
  };
  lade(); ctx.progress(0);
  return () => {};
}
