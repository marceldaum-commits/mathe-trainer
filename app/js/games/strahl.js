// Zahlenstrahl: Zahlen einordnen, runden und unter null rechnen – erst mit dem Finger, dann mit der Regel.
// Zwei Spiele mit derselben Mechanik: „strahl“ (Lage einer Zahl und der nähere Zehner/Hunderter) und „frost“ (Temperaturen unter null).
import { sfx, buzz, funken } from '../ui.js';
import { store } from '../store.js';
import { pi } from '../figuren.js';

/** Zahl in Dreiergruppen (12 500). */
const z = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ').replace('-', '−');
const R = (text, min, max, schritt, grob, tol, ziel, was) => { const lo = Math.floor(ziel / was[0]) * was[0], hi = lo + was[0]; return { text, min, max, schritt, grob, tol, ziel, runde: [lo, hi], stelle: was[1], richtig: ziel - lo >= hi - ziel ? hi : lo }; };
const ZE = [10, 'Zehner'], HU = [100, 'Hunderter'], TA = [1000, 'Tausender'];
const L1 = [R('Wo liegt die 37?', 0, 100, 1, 10, 2, 37, ZE), R('Wo liegt die 62?', 0, 100, 1, 10, 2, 62, ZE), R('Wo liegt die 18?', 0, 100, 1, 10, 2, 18, ZE)];
const L2 = [R('Wo liegt die 74?', 0, 100, 1, 10, 2, 74, ZE), R('Wo liegt die 45?', 0, 100, 1, 10, 2, 45, ZE), R('Wo liegt die 91?', 0, 100, 1, 10, 2, 91, ZE)];
const L3 = [R('Wo liegt die 370?', 0, 1000, 10, 100, 10, 370, HU), R('Wo liegt die 640?', 0, 1000, 10, 100, 10, 640, HU), R('Wo liegt die 850?', 0, 1000, 10, 100, 10, 850, HU)];
const L4 = [R('Wo liegt die 4 300?', 0, 10000, 100, 1000, 100, 4300, TA), R('Wo liegt die 7 500?', 0, 10000, 100, 1000, 100, 7500, TA), R('Wo liegt die 2 600?', 0, 10000, 100, 1000, 100, 2600, TA)];
const L5 = [R('Wo liegt die 2 470?', 2000, 3000, 10, 100, 10, 2470, HU), R('Wo liegt die 2 950?', 2000, 3000, 10, 100, 10, 2950, HU), R('Wo liegt die 2 050?', 2000, 3000, 10, 100, 10, 2050, HU), R('Wo liegt die 2 720?', 2000, 3000, 10, 100, 10, 2720, HU)];
/** Eigene Level für jede der fünf Schwierigkeiten. */
export const levelsFor = (lv) => [L1, L2, L3, L4, L5][Math.min(5, Math.max(1, lv | 0 || 3)) - 1];

const F = (text, start, ziel, min = -10, max = 10) => ({ text, min, max, schritt: 1, grob: 5, tol: 0, start, ziel, grad: true });
const F1 = [F('Es sind 3 Grad. In der Nacht wird es 5 Grad kälter. Wie kalt ist es dann?', 3, -2), F('Es ist 1 Grad. Es wird 6 Grad kälter.', 1, -5), F('Es sind 4 Grad. Es wird 4 Grad kälter.', 4, 0)];
const F2 = [F('Es sind −2 Grad. Es wird noch 4 Grad kälter.', -2, -6), F('Es sind 5 Grad. Es wird 9 Grad kälter.', 5, -4), F('Es sind −1 Grad. Es wird 7 Grad kälter.', -1, -8)];
const F3 = [F('Es sind −6 Grad. Am Mittag ist es 4 Grad wärmer.', -6, -2), F('Es sind −3 Grad. Es wird 8 Grad wärmer.', -3, 5), F('Es sind −9 Grad. Es wird 9 Grad wärmer.', -9, 0)];
const F4 = [F('Es sind −12 Grad. Es wird 7 Grad wärmer.', -12, -5, -20, 20), F('Es sind 6 Grad. Es wird 19 Grad kälter.', 6, -13, -20, 20), F('Es sind −15 Grad. Es wird 18 Grad wärmer.', -15, 3, -20, 20)];
const F5 = [F('Es sind −4 Grad. Erst wird es 6 Grad kälter, dann 9 Grad wärmer.', -4, -1, -20, 20), F('Es sind 7 Grad. Erst wird es 15 Grad kälter, dann 3 Grad kälter.', 7, -11, -20, 20), F('Es sind −13 Grad. Erst wird es 20 Grad wärmer, dann 12 Grad kälter.', -13, -5, -20, 20), F('Es sind −8 Grad. Erst wird es 8 Grad wärmer, dann 17 Grad kälter.', -8, -17, -20, 20)];
export const levelsFrost = (lv) => [F1, F2, F3, F4, F5][Math.min(5, Math.max(1, lv | 0 || 3)) - 1];

/** Liegt der Zeiger nah genug am Ziel? */
export const gesetzt = (M, v) => Math.abs(v - M.ziel) <= M.tol;

function spiel(levels, kennung) {
  return (el, ctx) => {
    const LS = levels(store.level), k = kennung;
    let mi = 0, fehler = 0, phase = 'setzen';
    el.innerHTML = `
      <div class="stack kind-spiel">
        <div class="mission"><b class="tag" id="${k}-n"></b><p><span id="${k}-t"></span><small id="${k}-s"></small></p>${piKlein()}</div>
        <div class="stage kind-buehne"><svg id="${k}" viewBox="0 0 320 130" role="img" aria-label="Zahlenstrahl"></svg></div>
        <div class="strahl-zug"><button class="btn small ghost" id="${k}-minus" type="button" aria-label="Ein Stück nach links">◀</button><input id="${k}-in" type="range" aria-label="Zeiger verschieben"><button class="btn small ghost" id="${k}-plus" type="button" aria-label="Ein Stück nach rechts">▶</button></div>
        <div class="kind-wahl" id="${k}-r" hidden></div>
        <div id="${k}-note"></div>
        <div class="row"><button class="btn block" id="${k}-go" type="button">Prüfen</button></div>
      </div>`;
    const $ = (s) => el.querySelector(s), svg = $(`#${k}`), inp = $(`#${k}-in`), go = $(`#${k}-go`), note = $(`#${k}-note`), wahl = $(`#${k}-r`);
    const M = () => LS[mi], X = (v) => 16 + ((v - M().min) / (M().max - M().min)) * 288;

    function zeichne(zeigen) {
      const m = M(), v = +inp.value, teile = [], viele = (m.max - m.min) / m.grob >= 10;
      if (m.grad) teile.push(`<rect x="16" y="73" width="${X(0) - 16}" height="10" rx="5" fill="var(--kalt)"/><rect x="${X(0)}" y="73" width="${304 - X(0)}" height="10" rx="5" fill="var(--warm)"/>`);
      else teile.push('<rect x="16" y="75" width="288" height="6" rx="3" fill="var(--line)"/>');
      let nr = 0;
      for (let t = m.min; t <= m.max + 1e-9; t += m.grob / (m.grad ? 5 : 2)) { const gross = Math.round((t - m.min) / m.grob * 1000) % 1000 === 0; teile.push(`<line x1="${X(t)}" y1="${gross ? 64 : 71}" x2="${X(t)}" y2="${gross ? 92 : 85}" stroke="var(--muted)" stroke-width="${gross ? 2 : 1}"/>`); if (gross) { if (!viele || nr % 2 === 0) teile.push(`<text x="${X(t)}" y="110" text-anchor="middle" class="strahl-zahl">${z(t)}</text>`); nr++; } }
      if (m.start !== undefined) teile.push(`<circle cx="${X(m.start)}" cy="78" r="8" fill="none" stroke="var(--head)" stroke-width="2" stroke-dasharray="3 3"/><text x="${X(m.start)}" y="126" text-anchor="middle" class="strahl-klein">Start</text>`);
      if (zeigen && m.runde) for (const r of m.runde) teile.push(`<path d="M${X(r)} 60 Q${(X(r) + X(m.ziel)) / 2} ${r === m.richtig ? 30 : 22} ${X(m.ziel)} 60" fill="none" stroke="${r === m.richtig ? 'var(--mint)' : 'var(--muted)'}" stroke-width="${r === m.richtig ? 4 : 2.5}" stroke-linecap="round"${r === m.richtig ? '' : ' stroke-dasharray="5 5"'}/>`);
      teile.push(`<g transform="translate(${X(zeigen ? m.ziel : v)} 78)"><circle r="12" fill="var(--orange)" stroke="#fff" stroke-width="3"/></g>`);
      if (zeigen) teile.push(`<text x="${Math.min(286, Math.max(34, X(m.ziel)))}" y="16" text-anchor="middle" class="strahl-wert">${z(m.ziel)}${m.grad ? ' °C' : ''}</text>`);
      svg.innerHTML = teile.join('');
    }
    function lade() {
      const m = M(); phase = 'setzen';
      $(`#${k}-n`).textContent = `${mi + 1}/${LS.length}`; $(`#${k}-t`).textContent = m.text;
      $(`#${k}-s`).textContent = m.grad ? 'Schieb den Punkt auf die neue Temperatur.' : 'Schieb den Punkt an die richtige Stelle.';
      inp.min = m.min; inp.max = m.max; inp.step = m.schritt; inp.value = m.start ?? (m.min + m.max) / 2; inp.disabled = false;
      wahl.hidden = true; wahl.innerHTML = ''; note.innerHTML = ''; go.hidden = false; go.textContent = 'Prüfen'; delete go.dataset.next;
      zeichne(false);
    }
    const weiter = () => { go.hidden = false; go.dataset.next = '1'; go.textContent = mi < LS.length - 1 ? 'Weiter' : 'Fertig'; ctx.progress((mi + 1) / LS.length); };
    function runden() {
      const m = M(); phase = 'runden'; go.hidden = true;
      $(`#${k}-s`).textContent = `Welcher ${m.stelle} liegt näher?`;
      wahl.hidden = false; wahl.innerHTML = m.runde.map((r) => `<button class="pick" type="button" data-v="${r}">${z(r)}</button>`).join('');
      wahl.querySelectorAll('button').forEach((b) => { b.onclick = () => {
        if (phase !== 'runden') return;
        const lo = m.runde[0], hi = m.runde[1], mitte = m.ziel - lo === hi - m.ziel;
        if (+b.dataset.v === m.richtig) { phase = 'fertig'; b.classList.add('sel'); sfx('ok'); buzz(); funken(b);
          note.innerHTML = `<div class="note ok"><b>Genau.</b> ${mitte ? `${z(m.ziel)} liegt genau in der Mitte – dann wird aufgerundet.` : `Bis ${z(m.richtig)} sind es nur ${z(Math.abs(m.richtig - m.ziel))}, bis ${z(m.richtig === lo ? hi : lo)} wären es ${z(Math.abs((m.richtig === lo ? hi : lo) - m.ziel))}.`} Gerundet: <b>${z(m.richtig)}</b>.</div>`; weiter(); }
        else { fehler++; sfx('bad'); note.innerHTML = `<div class="note tip">Schau auf die Bögen: Welcher Weg ist kürzer? Bis ${z(lo)} sind es ${z(m.ziel - lo)}, bis ${z(hi)} sind es ${z(hi - m.ziel)}.</div>`; }
      }; });
    }
    inp.addEventListener('input', () => { if (phase === 'setzen') zeichne(false); });
    const schritt = (d) => { if (phase !== 'setzen') return; inp.value = Math.min(M().max, Math.max(M().min, +inp.value + d * M().schritt)); zeichne(false); sfx('tap'); };
    $(`#${k}-minus`).onclick = () => schritt(-1); $(`#${k}-plus`).onclick = () => schritt(1);
    go.onclick = () => {
      if (go.dataset.next) { if (mi < LS.length - 1) { mi++; lade(); return; } ctx.done({ stars: fehler === 0 ? 3 : fehler <= 2 ? 2 : 1, mistakes: fehler }); return; }
      const m = M(), v = +inp.value;
      if (gesetzt(m, v)) { inp.disabled = true; zeichne(true); sfx('ok');
        if (m.runde) { note.innerHTML = `<div class="note ok"><b>Gefunden!</b> Dort liegt die ${z(m.ziel)}.</div>`; runden(); }
        else { phase = 'fertig'; buzz(); funken(go); note.innerHTML = `<div class="note ok"><b>Richtig:</b> ${z(m.ziel)} Grad.${m.ziel < 0 && m.start > 0 ? ` Bis zur Null ${m.start === 1 ? 'war es 1 Schritt' : `waren es ${m.start} Schritte`}, dann ging es noch ${-m.ziel} weiter.` : ''}</div>`; weiter(); } }
      else { fehler++; sfx('bad'); note.innerHTML = `<div class="note tip">${m.grad ? (v > m.ziel ? 'Noch nicht – es ist kälter. Zähl die Schritte nach links.' : 'Fast – so kalt wird es nicht. Zähl die Schritte noch einmal.') : (v > m.ziel ? 'Fast! Die Zahl liegt weiter links.' : 'Fast! Die Zahl liegt weiter rechts.')}</div>`; }
    };
    lade(); ctx.progress(0);
    return () => {};
  };
}
/** Pi als Begleiter (kleine Figur) – für die Spiele der unteren Klassen. */
export function piKlein() { return `<span class="kind-pi" aria-hidden="true">${pi()}</span>`; }
export const strahl = spiel(levelsFor, 'zs');
export const frost = spiel(levelsFrost, 'fr');
