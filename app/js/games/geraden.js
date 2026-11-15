// Geraden-Zieher: Steigung und Achsenabschnitt einstellen, bis die Gerade durch beide Punkte geht.
import { sfx, buzz, funken, tex } from '../ui.js';
import { store } from '../store.js';
import { ft } from '../math.js';
import { piKlein } from './strahl.js';

const G = (m, b, x1, x2) => ({ m, b, A: [x1, m * x1 + b], B: [x2, m * x2 + b] });
const L1 = [G(1, 0, 1, 3), G(1, 2, 0, 2), G(2, 0, 1, 2)];
const L2 = [G(2, 1, 0, 2), G(1, -3, 1, 4), G(3, -2, 0, 2)];
const L3 = [G(-1, 3, 0, 4), G(2, -4, 1, 4), G(-2, 4, 0, 3)];
const L4 = [G(0.5, 1, 0, 4), G(-0.5, 3, 2, 6), G(1.5, -2, 0, 4)];
const L5 = [G(-1.5, 4, 0, 4), G(2.5, -5, 2, 4), G(-0.5, -2, -4, 2), G(0.5, -3, 2, 6)];
/** Eigene Level für jede der fünf Schwierigkeiten. */
export const levelsFor = (lv) => [L1, L2, L3, L4, L5][Math.min(5, Math.max(1, lv | 0 || 3)) - 1];
const term = (m, b) => `${m === 1 ? '' : m === -1 ? '-' : ft(m)}x${b === 0 ? '' : b > 0 ? `+${ft(b)}` : ft(b)}`;

export function geraden(el, ctx) {
  const LS = levelsFor(store.level);
  let mi = 0, fehler = 0, fertig = false;
  el.innerHTML = `
    <div class="stack kind-spiel">
      <div class="mission"><b class="tag" id="gz-n"></b><p><span id="gz-t"></span><small id="gz-s"></small></p>${piKlein()}</div>
      <div class="stage kind-buehne"><svg id="gz" viewBox="0 0 320 200" role="img" aria-label="Koordinatensystem mit Gerade"></svg></div>
      <div class="stack kg-regler">
        <div class="slider"><label for="gz-m">m</label><input id="gz-m" type="range" min="-3" max="3" step="0.5" aria-label="Steigung"><output id="gz-mo"></output></div>
        <div class="slider"><label for="gz-b">b</label><input id="gz-b" type="range" min="-6" max="6" step="1" aria-label="y-Achsenabschnitt"><output id="gz-bo"></output></div>
      </div>
      <div id="gz-note"></div>
      <div class="row"><button class="btn block" id="gz-go" type="button">Prüfen</button></div>
    </div>`;
  const $ = (s) => el.querySelector(s), svg = $('#gz'), im = $('#gz-m'), ib = $('#gz-b'), go = $('#gz-go'), note = $('#gz-note');
  const M = () => LS[mi], X = (x) => 160 + x * 20, Y = (y) => 100 - y * 13;
  function zeichne() {
    const m = +im.value, b = +ib.value, t = [];
    for (let x = -7; x <= 7; x++) t.push(`<line x1="${X(x)}" y1="${Y(7)}" x2="${X(x)}" y2="${Y(-7)}" stroke="var(--line)" stroke-width="${x === 0 ? 0 : 1}"/>`);
    for (let y = -7; y <= 7; y++) t.push(`<line x1="${X(-7.5)}" y1="${Y(y)}" x2="${X(7.5)}" y2="${Y(y)}" stroke="var(--line)" stroke-width="${y === 0 ? 0 : 1}"/>`);
    t.push(`<line x1="${X(-7.5)}" y1="${Y(0)}" x2="${X(7.5)}" y2="${Y(0)}" stroke="var(--muted)" stroke-width="1.6"/><line x1="${X(0)}" y1="${Y(7)}" x2="${X(0)}" y2="${Y(-7)}" stroke="var(--muted)" stroke-width="1.6"/>`);
    t.push(`<clipPath id="gz-clip"><rect x="10" y="9" width="300" height="182"/></clipPath><line clip-path="url(#gz-clip)" x1="${X(-8)}" y1="${Y(-8 * m + b)}" x2="${X(8)}" y2="${Y(8 * m + b)}" stroke="var(--orange)" stroke-width="3.5" stroke-linecap="round"/>`);
    t.push(`<circle cx="${X(0)}" cy="${Y(b)}" r="4.5" fill="#fff" stroke="var(--orange)" stroke-width="2.5"/>`);
    for (const [n, [x, y]] of [['A', M().A], ['B', M().B]]) t.push(`<circle cx="${X(x)}" cy="${Y(y)}" r="6.5" fill="var(--kind-2,#2f9bff)" stroke="#fff" stroke-width="2"/><text x="${X(x) + 10}" y="${Y(y) - 8}" class="strahl-zahl">${n}</text>`);
    svg.innerHTML = t.join(''); $('#gz-mo').textContent = String(m).replace('.', ','); $('#gz-bo').textContent = b;
  }
  function lade() {
    const m = M(); fertig = false; $('#gz-n').textContent = `${mi + 1}/${LS.length}`;
    $('#gz-t').innerHTML = `Die Gerade soll durch ${tex(`A(${m.A[0]}\\mid ${ft(m.A[1])})`)} und ${tex(`B(${m.B[0]}\\mid ${ft(m.B[1])})`)} gehen.`;
    $('#gz-s').textContent = 'm dreht die Gerade, b schiebt sie hoch und runter.';
    im.value = 0; ib.value = 0; im.disabled = ib.disabled = false; note.innerHTML = ''; go.textContent = 'Prüfen'; delete go.dataset.next; zeichne();
  }
  for (const i of [im, ib]) i.addEventListener('input', () => { if (!fertig) zeichne(); });
  go.onclick = () => {
    if (go.dataset.next) { if (mi < LS.length - 1) { mi++; lade(); return; } ctx.done({ stars: fehler === 0 ? 3 : fehler <= 2 ? 2 : 1, mistakes: fehler }); return; }
    const z = M(), m = +im.value, b = +ib.value;
    if (m === z.m && b === z.b) { fertig = true; im.disabled = ib.disabled = true; sfx('ok'); buzz(); funken(svg);
      note.innerHTML = `<div class="note ok"><b>Getroffen!</b> ${tex(`f(x)=${term(z.m, z.b)}`)}: Von A nach B geht es ${z.B[0] - z.A[0]} nach rechts und ${ft(Math.abs(z.B[1] - z.A[1]))} nach ${z.B[1] >= z.A[1] ? 'oben' : 'unten'} – das ergibt die Steigung ${tex(ft(z.m))}.</div>`;
      go.dataset.next = '1'; go.textContent = mi < LS.length - 1 ? 'Weiter' : 'Fertig'; ctx.progress((mi + 1) / LS.length); }
    else { fehler++; sfx('bad'); note.innerHTML = `<div class="note tip">${m !== z.m ? 'Die Gerade ist noch nicht richtig geneigt: Wie viel geht es von A nach B hoch oder runter, wenn man nach rechts geht?' : 'Die Neigung stimmt. Schieb die Gerade jetzt mit b nach oben oder unten.'}</div>`; }
  };
  lade(); ctx.progress(0);
  return () => {};
}
