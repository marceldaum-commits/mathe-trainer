// Kästchen-Baumeister: Rechtecke auf Kästchenpapier aufziehen. Fläche = wie viele Kästchen hineinpassen,
// Umfang = wie viele Kästchenlängen der Rand hat. Erst zählen, dann rechnen.
import { sfx, buzz, funken } from '../ui.js';
import { store } from '../store.js';
import { piKlein } from './strahl.js';

const BREIT = 12, HOCH = 8;
const K = (text, A, U, sol, extra = {}) => ({ text, A, U, sol, ...extra });
const L1 = [K('Baue ein Rechteck aus genau 6 Kästchen.', 6, null, [3, 2]), K('Baue ein Rechteck aus genau 12 Kästchen.', 12, null, [4, 3]), K('Baue ein Rechteck, dessen Rand genau 10 Kästchenlängen lang ist.', null, 10, [3, 2])];
const L2 = [K('Baue ein Rechteck mit dem Flächeninhalt 20.', 20, null, [5, 4]), K('Baue ein Rechteck mit dem Umfang 16.', null, 16, [5, 3]), K('Baue ein Quadrat mit dem Flächeninhalt 9.', 9, null, [3, 3], { quadrat: true })];
const L3 = [K('Flächeninhalt 12 und Umfang 14 – beides zugleich.', 12, 14, [4, 3]), K('Flächeninhalt 12, aber Umfang 16.', 12, 16, [6, 2]), K('Umfang 12 und Flächeninhalt 9.', 9, 12, [3, 3])];
const L4 = [K('Flächeninhalt 24 und Umfang 20.', 24, 20, [6, 4]), K('Flächeninhalt 16 und Umfang 16.', 16, 16, [4, 4]), K('Flächeninhalt 18 und Umfang 22.', 18, 22, [9, 2])];
const L5 = [K('Flächeninhalt 24 – mit möglichst kleinem Umfang.', 24, 20, [6, 4], { ziel: 'kleinster Umfang' }), K('Umfang 20 – mit möglichst großem Flächeninhalt.', 25, 20, [5, 5], { ziel: 'größte Fläche' }), K('Flächeninhalt 36 und Umfang 26.', 36, 26, [9, 4])];
/** Eigene Level für jede der fünf Schwierigkeiten. */
export const levelsFor = (lv) => [L1, L2, L3, L4, L5][Math.min(5, Math.max(1, lv | 0 || 3)) - 1];
/** Erfüllt das Rechteck b mal h die Aufgabe? */
export const gebaut = (M, b, h) => (M.A === null || b * h === M.A) && (M.U === null || 2 * (b + h) === M.U) && (!M.quadrat || b === h);

export function kaestchen(el, ctx) {
  const LS = levelsFor(store.level), zeigen = store.level <= 2;   // auf den leichten Stufen zählt die App mit
  let mi = 0, fehler = 0, fertig = false;
  el.innerHTML = `
    <div class="stack kind-spiel">
      <div class="mission"><b class="tag" id="kg-n"></b><p><span id="kg-t"></span><small id="kg-s"></small></p>${piKlein()}</div>
      <div class="stage kind-buehne"><svg id="kg" viewBox="0 0 ${BREIT * 24 + 16} ${HOCH * 24 + 16}" role="img" aria-label="Kästchenpapier mit Rechteck"></svg></div>
      <div class="stack kg-regler">
        <div class="slider"><label for="kg-b">↔</label><input id="kg-b" type="range" min="1" max="${BREIT}" step="1" aria-label="Breite"><output id="kg-bo"></output></div>
        <div class="slider"><label for="kg-h">↕</label><input id="kg-h" type="range" min="1" max="${HOCH}" step="1" aria-label="Höhe"><output id="kg-ho"></output></div>
      </div>
      <div id="kg-note"></div>
      <div class="row"><button class="btn block" id="kg-go" type="button">Prüfen</button></div>
    </div>`;
  const $ = (s) => el.querySelector(s), svg = $('#kg'), ib = $('#kg-b'), ih = $('#kg-h'), go = $('#kg-go'), note = $('#kg-note');
  const M = () => LS[mi];
  function zeichne() {
    const b = +ib.value, h = +ih.value, t = [];
    for (let x = 0; x <= BREIT; x++) t.push(`<line x1="${8 + x * 24}" y1="8" x2="${8 + x * 24}" y2="${8 + HOCH * 24}" stroke="var(--line)" stroke-width="1"/>`);
    for (let y = 0; y <= HOCH; y++) t.push(`<line x1="8" y1="${8 + y * 24}" x2="${8 + BREIT * 24}" y2="${8 + y * 24}" stroke="var(--line)" stroke-width="1"/>`);
    t.push(`<rect x="8" y="${8 + (HOCH - h) * 24}" width="${b * 24}" height="${h * 24}" fill="var(--orange)" fill-opacity=".28" stroke="var(--orange)" stroke-width="3" rx="3"/>`);
    for (let x = 1; x < b; x++) t.push(`<line x1="${8 + x * 24}" y1="${8 + (HOCH - h) * 24}" x2="${8 + x * 24}" y2="${8 + HOCH * 24}" stroke="var(--orange)" stroke-opacity=".45" stroke-width="1"/>`);
    for (let y = 1; y < h; y++) t.push(`<line x1="8" y1="${8 + (HOCH - y) * 24}" x2="${8 + b * 24}" y2="${8 + (HOCH - y) * 24}" stroke="var(--orange)" stroke-opacity=".45" stroke-width="1"/>`);
    svg.innerHTML = t.join('');
    $('#kg-bo').textContent = b; $('#kg-ho').textContent = h;
    $('#kg-s').textContent = zeigen || fertig ? `Jetzt: ${b * h} Kästchen, Rand ${2 * (b + h)} lang.` : 'Zieh an den Reglern – und zähl selbst nach.';
  }
  function lade() {
    fertig = false; $('#kg-n').textContent = `${mi + 1}/${LS.length}`; $('#kg-t').textContent = M().text;
    ib.value = 2; ih.value = 1; ib.disabled = ih.disabled = false; note.innerHTML = ''; go.textContent = 'Prüfen'; delete go.dataset.next; zeichne();
  }
  for (const i of [ib, ih]) i.addEventListener('input', () => { if (!fertig) zeichne(); });
  go.onclick = () => {
    if (go.dataset.next) { if (mi < LS.length - 1) { mi++; lade(); return; } ctx.done({ stars: fehler === 0 ? 3 : fehler <= 2 ? 2 : 1, mistakes: fehler }); return; }
    const m = M(), b = +ib.value, h = +ih.value, A = b * h, U = 2 * (b + h);
    if (gebaut(m, b, h)) { fertig = true; ib.disabled = ih.disabled = true; zeichne(); sfx('ok'); buzz(); funken(svg);
      note.innerHTML = `<div class="note ok"><b>Gebaut!</b> ${b} mal ${h} sind ${A} Kästchen. Der Rand: ${b} + ${h} + ${b} + ${h} = ${U}.${m.ziel ? ` Ein Quadrat oder fast ein Quadrat hat bei gleicher Fläche den kürzesten Rand.` : ''}</div>`;
      go.dataset.next = '1'; go.textContent = mi < LS.length - 1 ? 'Weiter' : 'Fertig'; ctx.progress((mi + 1) / LS.length); }
    else { fehler++; sfx('bad');
      const teile = [];
      if (m.A !== null && A !== m.A && !m.ziel) teile.push(`Dein Rechteck hat ${A} Kästchen – gesucht sind ${m.A}.`);
      if (m.U !== null && U !== m.U && !m.ziel) teile.push(`Der Rand ist ${U} lang – gesucht ist ${m.U}.`);
      if (m.quadrat && b !== h) teile.push('Bei einem Quadrat sind alle Seiten gleich lang.');
      if (m.ziel) teile.push(m.ziel === 'kleinster Umfang' ? (A !== m.A ? `Dein Rechteck hat ${A} Kästchen – gesucht sind ${m.A}.` : `Der Rand ist ${U} lang. Es geht noch kürzer – probier eine Form, die näher am Quadrat ist.`) : (U !== m.U ? `Der Rand ist ${U} lang – gesucht ist ${m.U}.` : `Das sind ${A} Kästchen. Es passen noch mehr hinein – probier eine Form, die näher am Quadrat ist.`));
      note.innerHTML = `<div class="note tip">${teile.join(' ') || 'Noch nicht ganz – probier eine andere Form.'}</div>`; }
  };
  lade(); ctx.progress(0);
  return () => {};
}
