// Würfel-Baumeister: Quader aus kleinen Würfeln bauen. Rauminhalt = wie viele Würfel hineinpassen:
// Würfel in einer Schicht mal Zahl der Schichten.
import { sfx, buzz, funken } from '../ui.js';
import { store } from '../store.js';
import { piKlein } from './strahl.js';

const W = (text, V, sol, fest = {}) => ({ text, V, sol, fest });
const L1 = [W('Baue einen Quader aus genau 8 Würfeln.', 8, [2, 2, 2]), W('Baue einen Quader aus genau 12 Würfeln.', 12, [3, 2, 2]), W('Baue einen Quader aus genau 6 Würfeln, der nur 1 Würfel hoch ist.', 6, [3, 2, 1], { h: 1 })];
const L2 = [W('Baue einen Quader aus genau 18 Würfeln.', 18, [3, 3, 2]), W('Baue einen Quader aus 20 Würfeln, der 2 Würfel hoch ist.', 20, [5, 2, 2], { h: 2 }), W('Baue einen Würfel aus 27 kleinen Würfeln.', 27, [3, 3, 3], { wuerfel: true })];
const L3 = [W('Rauminhalt 24, Höhe 3.', 24, [4, 2, 3], { h: 3 }), W('Rauminhalt 30, Länge 5.', 30, [5, 3, 2], { a: 5 }), W('Rauminhalt 36, Höhe 4.', 36, [3, 3, 4], { h: 4 })];
const L4 = [W('Rauminhalt 40, Breite 2.', 40, [5, 2, 4], { b: 2 }), W('Rauminhalt 48, Höhe 4 und Breite 3.', 48, [4, 3, 4], { h: 4, b: 3 }), W('Rauminhalt 60, Länge 5.', 60, [5, 4, 3], { a: 5 })];
const L5 = [W('Rauminhalt 64 – als Würfel.', 64, [4, 4, 4], { wuerfel: true }), W('Rauminhalt 72, Höhe 3 und Länge 6.', 72, [6, 4, 3], { h: 3, a: 6 }), W('Rauminhalt 90, Breite 3.', 90, [6, 3, 5], { b: 3 })];
/** Eigene Level für jede der fünf Schwierigkeiten. */
export const levelsFor = (lv) => [L1, L2, L3, L4, L5][Math.min(5, Math.max(1, lv | 0 || 3)) - 1];
/** Erfüllt der Quader a·b·h die Aufgabe? */
export const gebaut = (M, a, b, h) => a * b * h === M.V && (M.fest.h === undefined || h === M.fest.h) && (M.fest.a === undefined || a === M.fest.a) && (M.fest.b === undefined || b === M.fest.b) && (!M.fest.wuerfel || (a === b && b === h));

export function wuerfel(el, ctx) {
  const LS = levelsFor(store.level), zeigen = store.level <= 2;
  let mi = 0, fehler = 0, fertig = false;
  const regler = (id, name, max, zeichen) => `<div class="slider"><label for="wu-${id}">${zeichen}</label><input id="wu-${id}" type="range" min="1" max="${max}" step="1" aria-label="${name}"><output id="wu-${id}o"></output></div>`;
  el.innerHTML = `
    <div class="stack kind-spiel">
      <div class="mission"><b class="tag" id="wu-n"></b><p><span id="wu-t"></span><small id="wu-s"></small></p>${piKlein()}</div>
      <div class="stage kind-buehne"><svg id="wu" viewBox="0 0 320 190" role="img" aria-label="Quader aus Würfeln"></svg></div>
      <div class="stack kg-regler">${regler('a', 'Länge', 6, '↔')}${regler('b', 'Breite', 5, '⤢')}${regler('h', 'Höhe', 5, '↕')}</div>
      <div id="wu-note"></div>
      <div class="row"><button class="btn block" id="wu-go" type="button">Prüfen</button></div>
    </div>`;
  const $ = (s) => el.querySelector(s), svg = $('#wu'), ia = $('#wu-a'), ib = $('#wu-b'), ih = $('#wu-h'), go = $('#wu-go'), note = $('#wu-note');
  const M = () => LS[mi];
  function zeichne() {
    const a = +ia.value, b = +ib.value, h = +ih.value, k = Math.min(24, 172 / ((a + b) * 0.5 + h), 296 / ((a + b) * 0.86)), t = [];
    const P = (x, y, z) => [160 + (x - y) * k * 0.86 + (b - a) * k * 0.43, 95 + (x + y) * k * 0.5 - z * k - (a + b) * k * 0.25 + h * k * 0.5];
    const poly = (pts, farbe) => `<polygon points="${pts.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' ')}" fill="${farbe}" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/>`;
    for (let z = 0; z < h; z++) for (let x = 0; x < a; x++) for (let y = 0; y < b; y++) {
      if (z === h - 1) t.push(poly([P(x, y, z + 1), P(x + 1, y, z + 1), P(x + 1, y + 1, z + 1), P(x, y + 1, z + 1)], '#ffb46b'));
      if (y === b - 1) t.push(poly([P(x, y + 1, z + 1), P(x + 1, y + 1, z + 1), P(x + 1, y + 1, z), P(x, y + 1, z)], '#ff7418'));
      if (x === a - 1) t.push(poly([P(x + 1, y, z + 1), P(x + 1, y + 1, z + 1), P(x + 1, y + 1, z), P(x + 1, y, z)], '#d85a0c'));
    }
    svg.innerHTML = t.join('');
    $('#wu-ao').textContent = a; $('#wu-bo').textContent = b; $('#wu-ho').textContent = h;
    $('#wu-s').textContent = zeigen || fertig ? `Jetzt: ${a * b} Würfel in einer Schicht, ${h} ${h === 1 ? 'Schicht' : 'Schichten'} – zusammen ${a * b * h}.` : 'Zähl die Würfel einer Schicht und nimm mit den Schichten mal.';
  }
  function lade() {
    fertig = false; $('#wu-n').textContent = `${mi + 1}/${LS.length}`; $('#wu-t').textContent = M().text;
    ia.value = 2; ib.value = 1; ih.value = 1; ia.disabled = ib.disabled = ih.disabled = false; note.innerHTML = ''; go.textContent = 'Prüfen'; delete go.dataset.next; zeichne();
  }
  for (const i of [ia, ib, ih]) i.addEventListener('input', () => { if (!fertig) zeichne(); });
  go.onclick = () => {
    if (go.dataset.next) { if (mi < LS.length - 1) { mi++; lade(); return; } ctx.done({ stars: fehler === 0 ? 3 : fehler <= 2 ? 2 : 1, mistakes: fehler }); return; }
    const m = M(), a = +ia.value, b = +ib.value, h = +ih.value, V = a * b * h;
    if (gebaut(m, a, b, h)) { fertig = true; ia.disabled = ib.disabled = ih.disabled = true; zeichne(); sfx('ok'); buzz(); funken(svg);
      note.innerHTML = `<div class="note ok"><b>Gebaut!</b> ${a} · ${b} = ${a * b} Würfel in einer Schicht, mal ${h} ${h === 1 ? 'Schicht' : 'Schichten'}: ${V} Würfel. Länge mal Breite mal Höhe.</div>`;
      go.dataset.next = '1'; go.textContent = mi < LS.length - 1 ? 'Weiter' : 'Fertig'; ctx.progress((mi + 1) / LS.length); }
    else { fehler++; sfx('bad'); const t = [];
      if (V !== m.V) t.push(`Dein Quader hat ${V} Würfel – gesucht sind ${m.V}.`);
      if (m.fest.h !== undefined && h !== m.fest.h) t.push(`Er soll ${m.fest.h} hoch sein.`);
      if (m.fest.a !== undefined && a !== m.fest.a) t.push(`Er soll ${m.fest.a} lang sein.`);
      if (m.fest.b !== undefined && b !== m.fest.b) t.push(`Er soll ${m.fest.b} breit sein.`);
      if (m.fest.wuerfel && !(a === b && b === h)) t.push('Bei einem Würfel sind alle drei Kanten gleich lang.');
      note.innerHTML = `<div class="note tip">${t.join(' ')}</div>`; }
  };
  lade(); ctx.progress(0);
  return () => {};
}
