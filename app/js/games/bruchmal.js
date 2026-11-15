// Bruch-Felder: Ein Bruch von einem Bruch als doppelt gefärbtes Feld. Spalten zeigen den ersten Bruch,
// Zeilen den zweiten – was beide Farben hat, ist das Produkt. So sieht man, warum Zähler mal Zähler und Nenner mal Nenner gilt.
import { sfx, buzz, funken, tex } from '../ui.js';
import { store } from '../store.js';
import { piKlein } from './strahl.js';

const B = (a, b, c, d) => ({ a, b, c, d });   // c/d von a/b
const L1 = [B(1, 2, 1, 2), B(1, 3, 1, 2), B(2, 3, 1, 2)];
const L2 = [B(1, 2, 1, 3), B(3, 4, 1, 2), B(2, 3, 1, 3)];
const L3 = [B(2, 3, 3, 4), B(3, 4, 2, 3), B(2, 5, 1, 2), B(3, 5, 2, 3)];
const L4 = [B(3, 4, 3, 4), B(4, 5, 2, 3), B(5, 6, 1, 2), B(2, 5, 3, 4)];
const L5 = [B(5, 6, 3, 4), B(3, 5, 5, 6), B(4, 5, 3, 4), B(5, 6, 2, 5)];
/** Eigene Level für jede der fünf Schwierigkeiten. */
export const levelsFor = (lv) => [L1, L2, L3, L4, L5][Math.min(5, Math.max(1, lv | 0 || 3)) - 1];
const ggt = (x, y) => (y ? ggt(y, x % y) : x);
/** Produkt gekürzt als [Zähler, Nenner]. */
export const produkt = (M) => { const z = M.a * M.c, n = M.b * M.d, g = ggt(z, n); return [z / g, n / g]; };
export const richtig = (M, spalten, zeilen) => spalten === M.a && zeilen === M.c;

export function bruchmal(el, ctx) {
  const LS = levelsFor(store.level), zeigen = store.level <= 2;
  let mi = 0, fehler = 0, fertig = false;
  el.innerHTML = `
    <div class="stack kind-spiel">
      <div class="mission"><b class="tag" id="bm-n"></b><p><span id="bm-t"></span><small id="bm-s"></small></p>${piKlein()}</div>
      <div class="stage kind-buehne"><svg id="bm" viewBox="0 0 320 190" role="img" aria-label="Feld mit gefärbten Spalten und Zeilen"></svg></div>
      <div class="stack kg-regler bm-regler">
        <div class="slider"><label for="bm-a">Spalten</label><input id="bm-a" type="range" min="0" step="1" aria-label="Gefärbte Spalten"><output id="bm-ao"></output></div>
        <div class="slider"><label for="bm-c">Zeilen</label><input id="bm-c" type="range" min="0" step="1" aria-label="Gefärbte Zeilen"><output id="bm-co"></output></div>
      </div>
      <div id="bm-note"></div>
      <div class="row"><button class="btn block" id="bm-go" type="button">Prüfen</button></div>
    </div>`;
  const $ = (s) => el.querySelector(s), svg = $('#bm'), ia = $('#bm-a'), ic = $('#bm-c'), go = $('#bm-go'), note = $('#bm-note');
  const M = () => LS[mi];
  function zeichne() {
    const m = M(), a = +ia.value, c = +ic.value, W = 250, H = 150, x0 = 35, y0 = 14, w = W / m.b, hh = H / m.d, t = [];
    for (let i = 0; i < m.b; i++) for (let j = 0; j < m.d; j++) { const sp = i < a, ze = j < c;
      t.push(`<rect x="${x0 + i * w}" y="${y0 + j * hh}" width="${w}" height="${hh}" class="bm-z ${sp && ze ? 'beide' : sp ? 'spalte' : ze ? 'zeile' : ''}"/>`); }
    t.push(`<rect x="${x0}" y="${y0}" width="${W}" height="${H}" fill="none" stroke="var(--head)" stroke-width="2.5" rx="3"/>`);
    t.push(`<text x="160" y="184" text-anchor="middle" class="strahl-zahl">${zeigen || fertig ? `${a * c} von ${m.b * m.d} Feldern sind doppelt gefärbt` : 'Doppelt gefärbt = beides zugleich'}</text>`);
    svg.innerHTML = t.join(''); $('#bm-ao').textContent = `${a}/${m.b}`; $('#bm-co').textContent = `${c}/${m.d}`;
  }
  function lade() {
    const m = M(); fertig = false; $('#bm-n').textContent = `${mi + 1}/${LS.length}`;
    $('#bm-t').innerHTML = `Zeige ${tex(`\\tfrac{${m.c}}{${m.d}}`)} von ${tex(`\\tfrac{${m.a}}{${m.b}}`)}.`;
    $('#bm-s').textContent = `Färbe erst ${m.a} von ${m.b} Spalten, dann davon ${m.c} von ${m.d} Zeilen.`;
    ia.max = m.b; ic.max = m.d; ia.value = 0; ic.value = 0; ia.disabled = ic.disabled = false; note.innerHTML = ''; go.textContent = 'Prüfen'; delete go.dataset.next; zeichne();
  }
  for (const i of [ia, ic]) i.addEventListener('input', () => { if (!fertig) zeichne(); });
  go.onclick = () => {
    if (go.dataset.next) { if (mi < LS.length - 1) { mi++; lade(); return; } ctx.done({ stars: fehler === 0 ? 3 : fehler <= 2 ? 2 : 1, mistakes: fehler }); return; }
    const m = M(), a = +ia.value, c = +ic.value, [z, n] = produkt(m);
    if (richtig(m, a, c)) { fertig = true; ia.disabled = ic.disabled = true; zeichne(); sfx('ok'); buzz(); funken(svg);
      note.innerHTML = `<div class="note ok"><b>Genau!</b> ${m.a * m.c} von ${m.b * m.d} Feldern: ${tex(`\\tfrac{${m.c}}{${m.d}}\\cdot\\tfrac{${m.a}}{${m.b}}=\\tfrac{${m.c}\\cdot${m.a}}{${m.d}\\cdot${m.b}}=\\tfrac{${m.a * m.c}}{${m.b * m.d}}${n !== m.b * m.d ? `=\\tfrac{${z}}{${n}}` : ''}`)}. Zähler mal Zähler, Nenner mal Nenner.</div>`;
      go.dataset.next = '1'; go.textContent = mi < LS.length - 1 ? 'Weiter' : 'Fertig'; ctx.progress((mi + 1) / LS.length); }
    else { fehler++; sfx('bad'); note.innerHTML = `<div class="note tip">${a !== m.a ? `Die Spalten zeigen den Bruch ${m.a}/${m.b}: ${m.a} von ${m.b} färben.` : `Die Zeilen zeigen ${m.c}/${m.d}: ${m.c} von ${m.d} färben.`}</div>`; }
  };
  lade(); ctx.progress(0);
  return () => {};
}
