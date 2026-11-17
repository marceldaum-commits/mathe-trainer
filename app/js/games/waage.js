// Gleichungs-Waage: Eine Gleichung ist eine Waage im Gleichgewicht. Was man auf der einen Seite wegnimmt,
// muss man auch auf der anderen wegnehmen – bis eine Kiste allein übrig bleibt.
import { sfx, buzz, funken, tex } from '../ui.js';
import { store } from '../store.js';
import { piKlein } from './strahl.js';

const G = (a, b, c, d) => ({ a, b, c, d, x: (d - b) / (a - c) });   // a·x + b = c·x + d
const L1 = [G(1, 3, 0, 7), G(2, 0, 0, 8), G(1, 5, 0, 9)];
const L2 = [G(2, 1, 0, 7), G(3, 2, 0, 11), G(2, 4, 0, 10)];
const L3 = [G(3, 4, 0, 19), G(5, 3, 0, 18), G(4, 6, 0, 22)];
const L4 = [G(3, 2, 1, 8), G(4, 1, 2, 9), G(5, 2, 2, 11)];
const L5 = [G(5, 3, 2, 15), G(6, 5, 2, 17), G(7, 1, 3, 13), G(4, 6, 1, 18)];
/** Eigene Level für jede der fünf Schwierigkeiten. */
export const levelsFor = (lv) => [L1, L2, L3, L4, L5][Math.min(5, Math.max(1, lv | 0 || 3)) - 1];
const seite = (k, e) => [k ? `${k === 1 ? '' : k}x` : '', e ? String(e) : ''].filter(Boolean).join('+') || '0';
export const gleichung = (M) => `${seite(M.a, M.b)}=${seite(M.c, M.d)}`;

export function waage(el, ctx) {
  const LS = levelsFor(store.level);
  let mi = 0, fehler = 0, L = {}, R = {}, fertig = false;
  el.innerHTML = `
    <div class="stack kind-spiel">
      <div class="mission"><b class="tag" id="wg-n"></b><p><span id="wg-t"></span><small id="wg-s"></small></p>${piKlein()}</div>
      <div class="stage kind-buehne wg-buehne"><div class="wg-gl" id="wg-f"></div><div class="wg-waage" id="wg"><div class="wg-schale" id="wg-l"></div><div class="wg-mitte">=</div><div class="wg-schale" id="wg-r"></div></div></div>
      <div class="wg-knoepfe"><button class="pick" id="wg-e" type="button" aria-label="Auf beiden Seiten 1 Gewicht wegnehmen">Gewicht weg</button><button class="pick" id="wg-x" type="button" aria-label="Auf beiden Seiten 1 Kiste wegnehmen">Kiste weg</button><button class="pick" id="wg-t2" type="button" aria-label="Gerecht teilen">Teilen</button></div>
      <div id="wg-note"></div>
      <div class="row"><button class="btn block" id="wg-go" type="button" hidden>Weiter</button></div>
    </div>`;
  const $ = (s) => el.querySelector(s), go = $('#wg-go'), note = $('#wg-note');
  const M = () => LS[mi];
  const schale = (S) => `${'<i class="wg-kiste">x</i>'.repeat(S.x)}${'<i class="wg-gew"></i>'.repeat(S.e)}` || '<small class="muted">leer</small>';
  function zeichne() {
    $('#wg-l').innerHTML = schale(L); $('#wg-r').innerHTML = schale(R);
    $('#wg-f').innerHTML = tex(`${seite(L.x, L.e)}=${seite(R.x, R.e)}`, true);
    $('#wg-x').hidden = M().c === 0;
  }
  function lade() {
    const m = M(); L = { x: m.a, e: m.b }; R = { x: m.c, e: m.d }; fertig = false;
    $('#wg-n').textContent = `${mi + 1}/${LS.length}`; $('#wg-t').textContent = 'Wie schwer ist eine Kiste? Halte die Waage im Gleichgewicht.';
    $('#wg-s').textContent = 'Nimm auf beiden Seiten dasselbe weg, bis links nur noch Kisten liegen.';
    note.innerHTML = ''; go.hidden = true; zeichne();
  }
  const tipp = (t) => { fehler++; sfx('bad'); note.innerHTML = `<div class="note tip">${t}</div>`; };
  $('#wg-e').onclick = () => { if (fertig) return; if (L.e > 0 && R.e > 0) { L.e--; R.e--; sfx('tap'); note.innerHTML = ''; zeichne(); } else tipp(L.e === 0 ? 'Links liegt kein einzelnes Gewicht mehr.' : 'Rechts liegt kein einzelnes Gewicht mehr.'); };
  $('#wg-x').onclick = () => { if (fertig) return; if (L.x > 0 && R.x > 0) { L.x--; R.x--; sfx('tap'); note.innerHTML = ''; zeichne(); } else tipp('Auf einer Seite liegt keine Kiste mehr.'); };
  $('#wg-t2').onclick = () => {
    if (fertig) return;
    if (L.e > 0) return tipp('Erst die einzelnen Gewichte links wegnehmen – sonst lässt sich nicht gerecht teilen.');
    if (R.x > 0) return tipp('Rechts liegen noch Kisten. Nimm erst auf beiden Seiten gleich viele Kisten weg.');
    const m = M(), k = L.x; fertig = true; L = { x: 1, e: 0 }; R = { x: 0, e: m.x }; zeichne(); sfx('ok'); buzz(); funken($('#wg'));
    note.innerHTML = `<div class="note ok"><b>Gelöst:</b> ${k > 1 ? `${k} Kisten wiegen ${k * m.x}, also wiegt eine Kiste ${m.x}.` : `Eine Kiste wiegt ${m.x}.`} In Mathe-Schrift: ${tex(`${gleichung(m)}\\ \\Rightarrow\\ x=${m.x}`)}.</div>`;
    go.hidden = false; go.textContent = mi < LS.length - 1 ? 'Weiter' : 'Fertig'; ctx.progress((mi + 1) / LS.length);
  };
  go.onclick = () => { if (mi < LS.length - 1) { mi++; lade(); return; } ctx.done({ stars: fehler === 0 ? 3 : fehler <= 2 ? 2 : 1, mistakes: fehler }); };
  lade(); ctx.progress(0);
  return () => {};
}
