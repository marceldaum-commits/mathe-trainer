// Stellenwert-Schieber: Mal 10 rückt jede Ziffer eine Stelle nach links, geteilt durch 10 eine nach rechts.
// Das Komma bleibt stehen – die Ziffern wandern. So wird aus der Regel ein Bild.
import { sfx, buzz, funken } from '../ui.js';
import { store } from '../store.js';
import { piKlein } from './strahl.js';

const S = (ziffern, start, ziel) => ({ ziffern, start, ziel, schritte: ziel - start });   // start/ziel: Zehnerpotenz der letzten Ziffer (0 = Einer, -2 = Hundertstel)
const L1 = [S('34', -1, 0), S('7', 0, 1), S('125', -1, 1)];
const L2 = [S('46', 0, -1), S('305', 0, -2), S('8', 1, -1)];
const L3 = [S('347', -2, 0), S('5', -1, 2), S('1250', 0, -3)];
const L4 = [S('63', -3, -1), S('9', 2, -1), S('2075', -3, 0)];
const L5 = [S('4', -3, 1), S('815', 1, -2), S('36', -4, -1), S('7', 3, -2)];
/** Eigene Level für jede der fünf Schwierigkeiten. */
export const levelsFor = (lv) => [L1, L2, L3, L4, L5][Math.min(5, Math.max(1, lv | 0 || 3)) - 1];
/** Zahl als Text: Ziffernfolge, deren letzte Ziffer an der Stelle 10^pos steht. */
export function zahlText(ziffern, pos) {
  let ganz = pos >= 0 ? ziffern + '0'.repeat(pos) : ziffern.slice(0, Math.max(0, ziffern.length + pos)), nach = pos >= 0 ? '' : ziffern.padStart(-pos, '0').slice(pos);
  ganz = ganz.replace(/^0+(?=\d)/, '') || '0'; nach = nach.replace(/0+$/, '');
  return (ganz.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')) + (nach ? `,${nach}` : '');
}
const SPALTEN = [['T', 3], ['H', 2], ['Z', 1], ['E', 0], ['z', -1], ['h', -2], ['t', -3], ['zt', -4]];

export function stellen(el, ctx) {
  const LS = levelsFor(store.level);
  let mi = 0, fehler = 0, pos = 0, zuege = [];
  el.innerHTML = `
    <div class="stack kind-spiel">
      <div class="mission"><b class="tag" id="sw-n"></b><p><span id="sw-t"></span><small id="sw-s"></small></p>${piKlein()}</div>
      <div class="stage kind-buehne"><div class="sw-tafel" id="sw"></div><div class="sw-zahl" id="sw-z"></div></div>
      <div class="kind-wahl"><button class="pick" id="sw-durch" type="button">: 10</button><button class="pick" id="sw-mal" type="button">· 10</button></div>
      <div id="sw-note"></div>
      <div class="row"><button class="btn block" id="sw-go" type="button">Prüfen</button></div>
    </div>`;
  const $ = (s) => el.querySelector(s), go = $('#sw-go'), note = $('#sw-note');
  const M = () => LS[mi];
  function zeichne() {
    const z = M().ziffern;
    $('#sw').innerHTML = SPALTEN.map(([name, p]) => { const i = z.length - 1 - (p - pos), zf = i >= 0 && i < z.length ? z[i] : ''; return `<div class="sw-sp ${p === -1 ? 'komma' : ''}"><small>${name}</small><b class="${zf ? 'da' : ''}">${zf}</b></div>`; }).join('');
    $('#sw-z').textContent = zahlText(z, pos);
    $('#sw-s').textContent = zuege.length ? `Bisher: ${zuege.join(' ')}` : 'Tippe auf „· 10“ oder „: 10“ und schau, wohin die Ziffern rücken.';
  }
  function lade() {
    const m = M(); pos = m.start; zuege = [];
    $('#sw-n').textContent = `${mi + 1}/${LS.length}`; $('#sw-t').textContent = `Mach aus ${zahlText(m.ziffern, m.start)} die Zahl ${zahlText(m.ziffern, m.ziel)}.`;
    note.innerHTML = ''; go.textContent = 'Prüfen'; delete go.dataset.next; $('#sw-mal').disabled = $('#sw-durch').disabled = false; zeichne();
  }
  const zug = (d) => {
    if (go.dataset.next) return;
    const neu = pos + d;
    if (neu < -4 || neu + M().ziffern.length - 1 > 3) { note.innerHTML = '<div class="note tip">Weiter reicht die Tafel nicht.</div>'; return; }
    pos = neu; zuege.push(d > 0 ? '· 10' : ': 10'); sfx('tap'); note.innerHTML = ''; zeichne();
  };
  $('#sw-mal').onclick = () => zug(1); $('#sw-durch').onclick = () => zug(-1);
  go.onclick = () => {
    if (go.dataset.next) { if (mi < LS.length - 1) { mi++; lade(); return; } ctx.done({ stars: fehler === 0 ? 3 : fehler <= 2 ? 2 : 1, mistakes: fehler }); return; }
    const m = M();
    if (pos === m.ziel) { sfx('ok'); buzz(); funken($('#sw')); $('#sw-mal').disabled = $('#sw-durch').disabled = true;
      const k = Math.abs(m.schritte), f = 10 ** k;
      note.innerHTML = `<div class="note ok"><b>Geschafft!</b> ${k}-mal ${m.schritte > 0 ? 'mal 10' : 'geteilt durch 10'} ist dasselbe wie ${m.schritte > 0 ? '·' : ':'} ${zahlText(String(f), 0)}. Jede Ziffer ist ${k} ${k === 1 ? 'Stelle' : 'Stellen'} nach ${m.schritte > 0 ? 'links' : 'rechts'} gerückt.</div>`;
      go.dataset.next = '1'; go.textContent = mi < LS.length - 1 ? 'Weiter' : 'Fertig'; ctx.progress((mi + 1) / LS.length); }
    else { fehler++; sfx('bad'); note.innerHTML = `<div class="note tip">Noch nicht: Da steht ${zahlText(m.ziffern, pos)}. Die Zahl soll ${pos < m.ziel ? 'größer' : 'kleiner'} werden.</div>`; }
  };
  lade(); ctx.progress(0);
  return () => {};
}
