// Türme ausgleichen: Klötze von hohen Türmen auf niedrige legen, bis alle gleich hoch sind.
// Die gemeinsame Höhe ist der Mittelwert – „gerecht verteilt“, bevor die Formel kommt.
import { sfx, buzz, funken } from '../ui.js';
import { store } from '../store.js';
import { piKlein } from './strahl.js';

const T = (...werte) => ({ werte, mittel: werte.reduce((s, v) => s + v, 0) / werte.length });
const L1 = [T(2, 6, 4), T(1, 5, 3), T(5, 1)];
const L2 = [T(3, 7, 5, 1), T(6, 2, 4), T(1, 1, 7, 3)];
const L3 = [T(2, 8, 5, 4, 1), T(7, 3, 5, 5), T(6, 1, 2, 7, 4)];
const L4 = [T(9, 3, 6, 2, 5), T(1, 8, 8, 3), T(4, 9, 2, 6, 7, 2)];
const L5 = [T(10, 2, 7, 5, 1, 5), T(3, 9, 9, 1, 8), T(8, 1, 6, 10, 2, 3)];
/** Eigene Level für jede der fünf Schwierigkeiten. */
export const levelsFor = (lv) => [L1, L2, L3, L4, L5][Math.min(5, Math.max(1, lv | 0 || 3)) - 1];
/** Sind alle Türme gleich hoch? */
export const gleich = (h) => h.every((v) => v === h[0]);

export function ausgleich(el, ctx) {
  const LS = levelsFor(store.level);
  let mi = 0, zuege = 0, hoehen = [], hand = -1, fertig = false, zuViel = 0;
  el.innerHTML = `
    <div class="stack kind-spiel">
      <div class="mission"><b class="tag" id="au-n"></b><p><span id="au-t"></span><small id="au-s"></small></p>${piKlein()}</div>
      <div class="stage kind-buehne"><div class="au-tuerme" id="au"></div></div>
      <div id="au-note"></div>
      <div class="row"><button class="btn block" id="au-go" type="button" hidden>Weiter</button></div>
    </div>`;
  const $ = (s) => el.querySelector(s), feld = $('#au'), go = $('#au-go'), note = $('#au-note');
  const M = () => LS[mi];
  function zeichne() {
    const max = Math.max(...M().werte, 4);
    feld.style.setProperty('--max', max);
    feld.innerHTML = hoehen.map((v, i) => `<button class="au-turm ${hand === i ? 'hand' : ''}" type="button" data-i="${i}" data-h="${v}" aria-label="Turm ${i + 1} mit ${v} Klötzen"><span class="au-stapel">${'<i></i>'.repeat(v)}</span><b>${v}</b></button>`).join('');
    feld.querySelectorAll('.au-turm').forEach((b) => { b.onclick = () => tippe(+b.dataset.i); });
    $('#au-s').textContent = hand < 0 ? 'Tippe einen hohen Turm an – dann den Turm, der den Klotz bekommt.' : 'Wohin mit dem Klotz? Tippe einen niedrigeren Turm an.';
  }
  function tippe(i) {
    if (fertig) return;
    if (hand < 0) { if (hoehen[i] === 0) return; hand = i; sfx('tap'); zeichne(); return; }
    if (hand === i) { hand = -1; zeichne(); return; }
    hoehen[hand]--; hoehen[i]++; hand = -1; zuege++; sfx('tap'); zeichne();
    if (gleich(hoehen)) { fertig = true; sfx('ok'); buzz(); funken(feld);
      const m = M(), summe = m.werte.reduce((s, v) => s + v, 0); if (zuege > summe) zuViel++;
      note.innerHTML = `<div class="note ok"><b>Alle gleich hoch!</b> Jeder Turm hat ${m.mittel} Klötze. Das ist der <b>Mittelwert</b>: ${m.werte.join(' + ')} = ${summe}, geteilt durch ${m.werte.length} Türme.</div>`;
      go.hidden = false; go.textContent = mi < LS.length - 1 ? 'Weiter' : 'Fertig'; ctx.progress((mi + 1) / LS.length); }
  }
  function lade() {
    hoehen = [...M().werte]; hand = -1; zuege = 0; fertig = false;
    $('#au-n').textContent = `${mi + 1}/${LS.length}`; $('#au-t').textContent = 'Verteile die Klötze gerecht: Alle Türme sollen gleich hoch werden.';
    note.innerHTML = ''; go.hidden = true; zeichne();
  }
  go.onclick = () => { if (mi < LS.length - 1) { mi++; lade(); return; } ctx.done({ stars: zuViel === 0 ? 3 : zuViel === 1 ? 2 : 1, mistakes: zuViel }); };
  lade(); ctx.progress(0);
  return () => {};
}
