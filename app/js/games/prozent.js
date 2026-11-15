// Prozent-Streifen: Oben stehen die Prozente, unten die Werte – derselbe Streifen, zwei Skalen.
// So wird sichtbar, dass „25 % von 80“ ein Viertel des Streifens ist.
import { sfx, buzz, funken } from '../ui.js';
import { store } from '../store.js';
import { fmt } from '../math.js';
import { piKlein } from './strahl.js';

const P = (text, G, ziel, max = 100) => ({ text, G, ziel, max });
const L1 = [P('Stell 50 % ein. Wie viel sind das von 80 €?', 80, 50), P('Stell 25 % von 80 € ein.', 80, 25), P('Stell 10 % von 200 € ein.', 200, 10)];
const L2 = [P('Wie viel Prozent sind 30 € von 60 €? Stell es ein.', 60, 50), P('Wie viel Prozent sind 15 € von 60 €?', 60, 25), P('Wie viel Prozent sind 90 € von 120 €?', 120, 75)];
const L3 = [P('Wie viel Prozent sind 24 € von 80 €?', 80, 30), P('Wie viel Prozent sind 36 € von 240 €?', 240, 15), P('Wie viel Prozent sind 63 € von 140 €?', 140, 45)];
const L4 = [P('Ein Preis von 80 € steigt um 25 %. Stell den neuen Preis ein.', 80, 125, 150), P('Ein Preis von 60 € sinkt um 20 %. Stell den neuen Preis ein.', 60, 80, 150), P('Ein Preis von 200 € steigt um 15 %.', 200, 115, 150)];
const L5 = [P('Ein Preis von 80 € steigt um 20 %. Stell den neuen Preis ein.', 80, 120, 150), P('Ein Preis von 140 € sinkt um 35 %.', 140, 65, 150), P('Ein Preis von 40 € steigt um 45 %.', 40, 145, 150), P('Wie viel Prozent sind 42 € von 120 €?', 120, 35)];
/** Eigene Level für jede der fünf Schwierigkeiten. */
export const levelsFor = (lv) => [L1, L2, L3, L4, L5][Math.min(5, Math.max(1, lv | 0 || 3)) - 1];

export function prozent(el, ctx) {
  const LS = levelsFor(store.level), zeigen = store.level <= 2;
  let mi = 0, fehler = 0, fertig = false;
  el.innerHTML = `
    <div class="stack kind-spiel">
      <div class="mission"><b class="tag" id="pz-n"></b><p><span id="pz-t"></span><small id="pz-s"></small></p>${piKlein()}</div>
      <div class="stage kind-buehne"><svg id="pz" viewBox="0 0 320 120" role="img" aria-label="Prozent-Streifen"></svg></div>
      <div class="strahl-zug"><button class="btn small ghost" id="pz-minus" type="button" aria-label="5 Prozent weniger">◀</button><input id="pz-in" type="range" min="0" step="5" aria-label="Prozent einstellen"><button class="btn small ghost" id="pz-plus" type="button" aria-label="5 Prozent mehr">▶</button></div>
      <div id="pz-note"></div>
      <div class="row"><button class="btn block" id="pz-go" type="button">Prüfen</button></div>
    </div>`;
  const $ = (s) => el.querySelector(s), svg = $('#pz'), inp = $('#pz-in'), go = $('#pz-go'), note = $('#pz-note');
  const M = () => LS[mi];
  function zeichne() {
    const m = M(), p = +inp.value, X = (q) => 24 + (q / m.max) * 272, t = [];
    t.push(`<rect x="24" y="44" width="272" height="30" rx="8" fill="var(--line)"/><rect x="24" y="44" width="${X(Math.min(p, 100)) - 24}" height="30" rx="8" fill="var(--orange)"/>`);
    if (p > 100) t.push(`<rect x="${X(100)}" y="44" width="${X(p) - X(100)}" height="30" fill="var(--kind-2,#2f9bff)"/>`);
    for (let q = 0; q <= m.max; q += 25) { t.push(`<line x1="${X(q)}" y1="38" x2="${X(q)}" y2="80" stroke="var(--muted)" stroke-width="${q % 100 === 0 ? 2 : 1}"/><text x="${X(q)}" y="30" text-anchor="middle" class="strahl-zahl">${q} %</text>`); if (zeigen || q % 100 === 0 || fertig) t.push(`<text x="${X(q)}" y="98" text-anchor="middle" class="strahl-klein">${fmt((m.G * q) / 100)} €</text>`); }
    if (zeigen || fertig) t.push(`<text x="160" y="116" text-anchor="middle" class="strahl-wert">${p} % sind ${fmt((m.G * p) / 100)} €</text>`);
    svg.innerHTML = t.join('');
  }
  function lade() {
    const m = M(); fertig = false; $('#pz-n').textContent = `${mi + 1}/${LS.length}`; $('#pz-t').textContent = m.text;
    $('#pz-s').textContent = `Der ganze Streifen (100 %) sind ${m.G} €.`;
    inp.max = m.max; inp.value = 0; inp.disabled = false; note.innerHTML = ''; go.textContent = 'Prüfen'; delete go.dataset.next; zeichne();
  }
  inp.addEventListener('input', () => { if (!fertig) zeichne(); });
  const schritt = (d) => { if (fertig) return; inp.value = Math.min(M().max, Math.max(0, +inp.value + 5 * d)); zeichne(); sfx('tap'); };
  $('#pz-minus').onclick = () => schritt(-1); $('#pz-plus').onclick = () => schritt(1);
  go.onclick = () => {
    if (go.dataset.next) { if (mi < LS.length - 1) { mi++; lade(); return; } ctx.done({ stars: fehler === 0 ? 3 : fehler <= 2 ? 2 : 1, mistakes: fehler }); return; }
    const m = M(), p = +inp.value;
    if (p === m.ziel) { fertig = true; inp.disabled = true; zeichne(); sfx('ok'); buzz(); funken(svg);
      note.innerHTML = `<div class="note ok"><b>Passt!</b> ${m.ziel} % von ${m.G} € sind ${fmt((m.G * m.ziel) / 100)} €${m.ziel > 100 ? ` – das ist der alte Preis plus ${m.ziel - 100} %.` : m.max > 100 ? ` – der alte Preis minus ${100 - m.ziel} %.` : '.'}</div>`;
      go.dataset.next = '1'; go.textContent = mi < LS.length - 1 ? 'Weiter' : 'Fertig'; ctx.progress((mi + 1) / LS.length); }
    else { fehler++; sfx('bad'); note.innerHTML = `<div class="note tip">${p < m.ziel ? 'Das ist noch zu wenig.' : 'Das ist zu viel.'} ${zeigen ? '' : `Hilfe: 10 % von ${m.G} € sind ${fmt(m.G / 10)} €.`}</div>`; }
  };
  lade(); ctx.progress(0);
  return () => {};
}
