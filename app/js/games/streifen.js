// Bruch-Streifen: Anteile mit dem Finger färben. Aus „3 von 4 Teilen“ wird der Bruch – und aus feineren oder gröberen
// Streifen wird sichtbar, warum Erweitern und Kürzen den Wert nicht ändern.
import { tex, sfx, buzz, funken } from '../ui.js';
import { store } from '../store.js';
import { piKlein } from './strahl.js';

const B = (zaehler, nenner, teile) => ({ zaehler, nenner, teile, soll: (zaehler * teile) / nenner });
const L1 = [B(1, 2, 2), B(1, 4, 4), B(3, 4, 4), B(2, 3, 3)];
const L2 = [B(2, 5, 5), B(5, 6, 6), B(3, 8, 8), B(7, 10, 10)];
const L3 = [B(1, 2, 4), B(1, 2, 6), B(3, 4, 8), B(2, 3, 6)];
const L4 = [B(2, 3, 9), B(3, 4, 12), B(2, 5, 10), B(5, 6, 12)];
const L5 = [B(6, 8, 4), B(4, 6, 3), B(9, 12, 4), B(3, 5, 10), B(10, 12, 6)];
/** Eigene Level für jede der fünf Schwierigkeiten. */
export const levelsFor = (lv) => [L1, L2, L3, L4, L5][Math.min(5, Math.max(1, lv | 0 || 3)) - 1];
/** Stimmt die Zahl der gefärbten Teile? */
export const passt = (M, gefaerbt) => gefaerbt === M.soll;

export function streifen(el, ctx) {
  const LS = levelsFor(store.level);
  let mi = 0, fehler = 0, versuche = 0, fertig = false;
  el.innerHTML = `
    <div class="stack kind-spiel">
      <div class="mission"><b class="tag" id="sf-n"></b><p><span id="sf-t"></span><small id="sf-s"></small></p>${piKlein()}</div>
      <div class="stage kind-buehne sf-buehne"><div class="sf-bruch" id="sf-f"></div><div class="sf-streifen" id="sf" role="group" aria-label="Streifen zum Färben"></div><div class="sf-zaehl" id="sf-z"></div></div>
      <div id="sf-note"></div>
      <div class="row"><button class="btn block" id="sf-go" type="button">Prüfen</button></div>
    </div>`;
  const $ = (s) => el.querySelector(s), bar = $('#sf'), go = $('#sf-go'), note = $('#sf-note');
  const M = () => LS[mi], an = () => bar.querySelectorAll('.an').length;
  const zaehl = () => { $('#sf-z').textContent = `${an()} von ${M().teile} Teilen gefärbt`; };
  function lade() {
    const m = M(); fertig = false; versuche = 0;
    $('#sf-n').textContent = `${mi + 1}/${LS.length}`; $('#sf-t').textContent = 'Färbe diesen Anteil des Streifens.';
    $('#sf-s').textContent = m.teile === m.nenner ? 'Tippe die Teile an.' : m.teile > m.nenner ? `Der Streifen hat ${m.teile} Teile – feiner als der Bruch.` : `Der Streifen hat nur ${m.teile} Teile – gröber als der Bruch.`;
    $('#sf-f').innerHTML = tex(`\\dfrac{${m.zaehler}}{${m.nenner}}`, true);
    bar.innerHTML = Array.from({ length: m.teile }, (_, i) => `<button class="sf-teil" type="button" aria-pressed="false" aria-label="Teil ${i + 1}"></button>`).join('');
    bar.style.setProperty('--n', m.teile);
    bar.querySelectorAll('.sf-teil').forEach((b) => { b.onclick = () => { if (fertig) return; const on = !b.classList.contains('an'); b.classList.toggle('an', on); b.setAttribute('aria-pressed', on); sfx('tap'); zaehl(); }; });
    note.innerHTML = ''; go.textContent = 'Prüfen'; delete go.dataset.next; zaehl();
  }
  go.onclick = () => {
    if (go.dataset.next) { if (mi < LS.length - 1) { mi++; lade(); return; } ctx.done({ stars: fehler === 0 ? 3 : fehler <= 2 ? 2 : 1, mistakes: fehler }); return; }
    const m = M(), k = an();
    if (passt(m, k)) { fertig = true; sfx('ok'); buzz(); funken(bar);
      note.innerHTML = `<div class="note ok"><b>Stimmt!</b> ${m.teile === m.nenner ? `${m.zaehler} von ${m.nenner} Teilen.` : `${tex(`\\tfrac{${m.zaehler}}{${m.nenner}}=\\tfrac{${m.soll}}{${m.teile}}`)} – gleich viel vom Streifen, nur ${m.teile > m.nenner ? 'feiner' : 'gröber'} geteilt. ${m.teile > m.nenner ? 'Das nennt man Erweitern.' : 'Das nennt man Kürzen.'}`}</div>`;
      go.dataset.next = '1'; go.textContent = mi < LS.length - 1 ? 'Weiter' : 'Fertig'; ctx.progress((mi + 1) / LS.length); }
    else { fehler++; versuche++; sfx('bad');
      const tipp = m.teile === m.nenner ? `Der Nenner ${m.nenner} sagt, wie viele Teile es gibt – der Zähler ${m.zaehler}, wie viele du färbst.` : m.teile > m.nenner ? `Bilde ${m.nenner} gleich große Gruppen: Jede Gruppe hat ${m.teile / m.nenner} Teile.` : `Je ${m.nenner / m.teile} Teile des Bruchs passen in ein Teil des Streifens.`;
      note.innerHTML = `<div class="note tip">${k < m.soll ? 'Das ist noch zu wenig.' : 'Das ist zu viel.'}${versuche >= 2 ? ` ${tipp}` : ''}</div>`; }
  };
  lade(); ctx.progress(0);
  return () => {};
}
