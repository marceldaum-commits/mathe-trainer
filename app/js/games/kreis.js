// Dreieck im Einheitskreis: Ein Punkt wandert auf dem Kreis mit Radius 1. Seine Höhe ist der Sinus,
// sein Abstand nach rechts der Kosinus. Winkel einstellen und ablesen.
import { sfx, buzz, funken, tex } from '../ui.js';
import { store } from '../store.js';
import { fmt, ft } from '../math.js';
import { piKlein } from './strahl.js';

const W = (text, ziel) => ({ text, ziel });
const L1 = [W('Stell den Winkel auf 30°. Wie hoch steht der Punkt?', 30), W('Stell den Winkel so ein, dass der Punkt genau halb so hoch ist wie der Radius.', 30), W('Stell den Winkel auf 90°: ganz oben.', 90)];
const L2 = [W('Der Sinus (die Höhe) soll 0,5 sein.', 30), W('Der Kosinus (die Breite) soll 0,5 sein.', 60), W('Höhe und Breite sollen gleich groß sein.', 45)];
const L3 = [W('Der Sinus soll etwa 0,87 sein.', 60), W('Der Kosinus soll etwa 0,71 sein.', 45), W('Der Sinus soll etwa 0,26 sein.', 15)];
const L4 = [W('Der Kosinus soll etwa 0,26 sein.', 75), W('Der Sinus soll etwa 0,97 sein.', 75), W('Der Tangens (Höhe durch Breite) soll 1 sein.', 45)];
const L5 = [W('Der Sinus soll genauso groß sein wie der Kosinus von 20°.', 70), W('Der Kosinus soll etwa 0,34 sein.', 70), W('Der Sinus soll etwa 0,57 sein.', 35), W('Der Kosinus soll genauso groß sein wie der Sinus von 80°.', 10)];
/** Eigene Level für jede der fünf Schwierigkeiten. */
export const levelsFor = (lv) => [L1, L2, L3, L4, L5][Math.min(5, Math.max(1, lv | 0 || 3)) - 1];

export function kreis(el, ctx) {
  const LS = levelsFor(store.level);
  let mi = 0, fehler = 0, fertig = false;
  el.innerHTML = `
    <div class="stack kind-spiel">
      <div class="mission"><b class="tag" id="ek-n"></b><p><span id="ek-t"></span><small id="ek-s"></small></p>${piKlein()}</div>
      <div class="stage kind-buehne"><svg id="ek" viewBox="0 0 320 190" role="img" aria-label="Viertelkreis mit Dreieck"></svg></div>
      <div class="strahl-zug"><button class="btn small ghost" id="ek-minus" type="button" aria-label="5 Grad weniger">◀</button><input id="ek-in" type="range" min="0" max="90" step="5" aria-label="Winkel einstellen"><button class="btn small ghost" id="ek-plus" type="button" aria-label="5 Grad mehr">▶</button></div>
      <div id="ek-note"></div>
      <div class="row"><button class="btn block" id="ek-go" type="button">Prüfen</button></div>
    </div>`;
  const $ = (s) => el.querySelector(s), svg = $('#ek'), inp = $('#ek-in'), go = $('#ek-go'), note = $('#ek-note');
  const M = () => LS[mi];
  function zeichne() {
    const w = +inp.value, r = 150, x0 = 70, y0 = 172, a = (w * Math.PI) / 180, px = x0 + r * Math.cos(a), py = y0 - r * Math.sin(a);
    svg.innerHTML = `<path d="M${x0} ${y0 - r} A${r} ${r} 0 0 1 ${x0 + r} ${y0}" fill="none" stroke="var(--line)" stroke-width="3"/>
      <line x1="${x0}" y1="${y0}" x2="${x0 + r + 12}" y2="${y0}" stroke="var(--muted)" stroke-width="1.5"/><line x1="${x0}" y1="${y0}" x2="${x0}" y2="${y0 - r - 12}" stroke="var(--muted)" stroke-width="1.5"/>
      <polygon points="${x0},${y0} ${px},${y0} ${px},${py}" fill="var(--orange)" fill-opacity=".15"/>
      <line x1="${x0}" y1="${y0}" x2="${px}" y2="${y0}" stroke="var(--kind-2,#2f9bff)" stroke-width="5" stroke-linecap="round"/><line x1="${px}" y1="${y0}" x2="${px}" y2="${py}" stroke="var(--mint)" stroke-width="5" stroke-linecap="round"/>
      <line x1="${x0}" y1="${y0}" x2="${px}" y2="${py}" stroke="var(--head)" stroke-width="2.5"/><circle cx="${px}" cy="${py}" r="8" fill="var(--orange)" stroke="#fff" stroke-width="2.5"/>
      <path d="M${x0 + 30} ${y0} A30 30 0 0 0 ${x0 + 30 * Math.cos(a)} ${y0 - 30 * Math.sin(a)}" fill="none" stroke="var(--head)" stroke-width="1.5"/><text x="${x0 + 40}" y="${y0 - 8}" class="strahl-zahl">${w}°</text>
      <text x="312" y="40" text-anchor="end" class="strahl-zahl">Höhe: ${fmt(Math.sin(a), 2)}</text><text x="312" y="60" text-anchor="end" class="strahl-zahl">Breite: ${fmt(Math.cos(a), 2)}</text>`;
  }
  function lade() {
    fertig = false; $('#ek-n').textContent = `${mi + 1}/${LS.length}`; $('#ek-t').textContent = M().text;
    $('#ek-s').textContent = 'Der Radius ist 1. Grün ist die Höhe (Sinus), blau die Breite (Kosinus).';
    inp.value = 0; inp.disabled = false; note.innerHTML = ''; go.textContent = 'Prüfen'; delete go.dataset.next; zeichne();
  }
  inp.addEventListener('input', () => { if (!fertig) zeichne(); });
  const schritt = (d) => { if (fertig) return; inp.value = Math.min(90, Math.max(0, +inp.value + 5 * d)); zeichne(); sfx('tap'); };
  $('#ek-minus').onclick = () => schritt(-1); $('#ek-plus').onclick = () => schritt(1);
  go.onclick = () => {
    if (go.dataset.next) { if (mi < LS.length - 1) { mi++; lade(); return; } ctx.done({ stars: fehler === 0 ? 3 : fehler <= 2 ? 2 : 1, mistakes: fehler }); return; }
    const m = M(), w = +inp.value, a = (m.ziel * Math.PI) / 180;
    if (w === m.ziel) { fertig = true; inp.disabled = true; sfx('ok'); buzz(); funken(svg);
      note.innerHTML = `<div class="note ok"><b>Genau!</b> Bei ${m.ziel}° ist ${tex(`\\sin ${m.ziel}^\\circ\\approx${ft(Math.sin(a), 2)}`)} und ${tex(`\\cos ${m.ziel}^\\circ\\approx${ft(Math.cos(a), 2)}`)}.${m.ziel !== 45 ? ` Zum Vergleich: ${tex(`\\sin ${m.ziel}^\\circ=\\cos ${90 - m.ziel}^\\circ`)}.` : ''}</div>`;
      go.dataset.next = '1'; go.textContent = mi < LS.length - 1 ? 'Weiter' : 'Fertig'; ctx.progress((mi + 1) / LS.length); }
    else { fehler++; sfx('bad'); note.innerHTML = `<div class="note tip">Noch nicht. Schau auf die Zahlen rechts oben und dreh ${w < m.ziel ? 'weiter nach oben' : 'ein Stück zurück'}.</div>`; }
  };
  lade(); ctx.progress(0);
  return () => {};
}
