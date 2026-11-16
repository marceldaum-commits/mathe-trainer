// Winkel-Zeiger: Einen Zeiger drehen, bis der Winkel stimmt. So bekommen 30°, 90° und 135° ein Gesicht –
// und die Namen spitz, recht, stumpf, gestreckt, überstumpf eine Bedeutung.
import { sfx, buzz, funken } from '../ui.js';
import { store } from '../store.js';
import { piKlein } from './strahl.js';

const W = (text, ziel) => ({ text, ziel });
const L1 = [W('Stell einen rechten Winkel ein: 90°.', 90), W('Stell die Hälfte davon ein: 45°.', 45), W('Stell einen gestreckten Winkel ein: 180°.', 180)];
const L2 = [W('Stell 60° ein – ein spitzer Winkel.', 60), W('Stell 120° ein – ein stumpfer Winkel.', 120), W('Stell 30° ein.', 30), W('Stell 150° ein.', 150)];
const L3 = [W('Stell 135° ein.', 135), W('Stell 75° ein.', 75), W('Der Winkel soll 20° kleiner sein als ein rechter Winkel.', 70), W('Stell den Nebenwinkel von 40° ein.', 140)];
const L4 = [W('Stell 270° ein – eine Dreivierteldrehung.', 270), W('Stell 225° ein.', 225), W('Stell einen überstumpfen Winkel von 300° ein.', 300), W('Stell eine Dritteldrehung ein.', 120)];
const L5 = [W('Stell 315° ein.', 315), W('Der Winkel soll doppelt so groß sein wie 105°.', 210), W('Stell eine Sechsteldrehung ein.', 60), W('Zwei Winkel ergeben zusammen eine ganze Drehung. Einer ist 95°. Stell den anderen ein.', 265)];
/** Eigene Level für jede der fünf Schwierigkeiten. */
export const levelsFor = (lv) => [L1, L2, L3, L4, L5][Math.min(5, Math.max(1, lv | 0 || 3)) - 1];
/** Name der Winkelart. */
export const art = (w) => (w === 0 ? 'kein Winkel' : w < 90 ? 'spitz' : w === 90 ? 'recht' : w < 180 ? 'stumpf' : w === 180 ? 'gestreckt' : w < 360 ? 'überstumpf' : 'voll');

export function zeiger(el, ctx) {
  const LS = levelsFor(store.level), max = store.level >= 4 ? 360 : 180;
  let mi = 0, fehler = 0, fertig = false;
  el.innerHTML = `
    <div class="stack kind-spiel">
      <div class="mission"><b class="tag" id="wz-n"></b><p><span id="wz-t"></span><small id="wz-s"></small></p>${piKlein()}</div>
      <div class="stage kind-buehne"><svg id="wz" viewBox="0 0 320 ${max === 360 ? 230 : 170}" role="img" aria-label="Winkel zwischen zwei Zeigern"></svg></div>
      <div class="strahl-zug"><button class="btn small ghost" id="wz-minus" type="button" aria-label="5 Grad weniger">◀</button><input id="wz-in" type="range" min="0" max="${max}" step="5" aria-label="Winkel einstellen"><button class="btn small ghost" id="wz-plus" type="button" aria-label="5 Grad mehr">▶</button></div>
      <div id="wz-note"></div>
      <div class="row"><button class="btn block" id="wz-go" type="button">Prüfen</button></div>
    </div>`;
  const $ = (s) => el.querySelector(s), svg = $('#wz'), inp = $('#wz-in'), go = $('#wz-go'), note = $('#wz-note');
  const M = () => LS[mi];
  function zeichne() {
    const w = +inp.value, a = (w * Math.PI) / 180, cx = 160, cy = max === 360 ? 118 : 148, r = 100, x = cx + r * Math.cos(a), y = cy - r * Math.sin(a), gross = w > 180 ? 1 : 0;
    svg.innerHTML = `${w > 0 ? `<path d="M${cx} ${cy} L${cx + 38} ${cy} A38 38 0 ${gross} 0 ${cx + 38 * Math.cos(a)} ${cy - 38 * Math.sin(a)} Z" class="wz-keil"/>` : ''}
      ${w === 90 ? `<rect x="${cx}" y="${cy - 20}" width="20" height="20" fill="none" stroke="var(--head)" stroke-width="2"/>` : ''}
      <line x1="${cx}" y1="${cy}" x2="${cx + r + 14}" y2="${cy}" stroke="var(--head)" stroke-width="4" stroke-linecap="round"/>
      <line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="var(--orange)" stroke-width="5" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="9" fill="var(--orange)" stroke="#fff" stroke-width="2.5"/><circle cx="${cx}" cy="${cy}" r="5" fill="var(--head)"/>
      <text x="${cx}" y="${max === 360 ? 224 : 166}" text-anchor="middle" class="strahl-wert">${w}° · ${art(w)}</text>`;
  }
  function lade() { fertig = false; $('#wz-n').textContent = `${mi + 1}/${LS.length}`; $('#wz-t').textContent = M().text; $('#wz-s').textContent = 'Dreh den orangen Zeiger mit dem Regler.'; inp.value = 0; inp.disabled = false; note.innerHTML = ''; go.textContent = 'Prüfen'; delete go.dataset.next; zeichne(); }
  inp.addEventListener('input', () => { if (!fertig) zeichne(); });
  const schritt = (d) => { if (fertig) return; inp.value = Math.min(max, Math.max(0, +inp.value + 5 * d)); zeichne(); sfx('tap'); };
  $('#wz-minus').onclick = () => schritt(-1); $('#wz-plus').onclick = () => schritt(1);
  go.onclick = () => {
    if (go.dataset.next) { if (mi < LS.length - 1) { mi++; lade(); return; } ctx.done({ stars: fehler === 0 ? 3 : fehler <= 2 ? 2 : 1, mistakes: fehler }); return; }
    const m = M(), w = +inp.value;
    if (w === m.ziel) { fertig = true; inp.disabled = true; sfx('ok'); buzz(); funken(svg); note.innerHTML = `<div class="note ok"><b>Genau!</b> ${m.ziel}° ist ein ${art(m.ziel)}er Winkel${m.ziel === 90 ? ' – das kleine Quadrat im Bild ist sein Zeichen' : ''}.</div>`;
      go.dataset.next = '1'; go.textContent = mi < LS.length - 1 ? 'Weiter' : 'Fertig'; ctx.progress((mi + 1) / LS.length); }
    else { fehler++; sfx('bad'); note.innerHTML = `<div class="note tip">Du hast ${w}° eingestellt. ${w < m.ziel ? 'Der Winkel muss größer werden.' : 'Der Winkel muss kleiner werden.'}</div>`; }
  };
  lade(); ctx.progress(0);
  return () => {};
}
