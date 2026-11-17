// Wachstums-Säulen: Jahr für Jahr wird mit demselben Faktor malgenommen. Die Säulen zeigen, wie aus kleinen
// Prozenten große Sprünge werden – und wann sich ein Betrag verdoppelt oder halbiert.
import { sfx, buzz, funken, tex } from '../ui.js';
import { store } from '../store.js';
import { fmt, ft } from '../math.js';
import { piKlein } from './strahl.js';

/** Erstes Jahr, in dem der Faktor q^n das Ziel erreicht (über- bzw. unterschreitet). */
export const erstesJahr = (p, ziel) => { const q = 1 + p / 100; for (let n = 1; n <= 40; n++) if (p > 0 ? q ** n >= ziel - 1e-9 : q ** n <= ziel + 1e-9) return n; return null; };
const J = (text, p, ziel) => ({ text, p, ziel, art: 'jahre', sol: erstesJahr(p, ziel) });
const Z = (text, n, ziel, sol) => ({ text, n, ziel, art: 'zins', sol });
const L1 = [J('1000 € wachsen jedes Jahr um 50 %. Nach wie vielen Jahren sind es mindestens doppelt so viel?', 50, 2), J('1000 € wachsen jedes Jahr um 25 %. Wann sind es mindestens 2000 €?', 25, 2), J('1000 € wachsen jedes Jahr um 20 %. Wann sind es mindestens 2000 €?', 20, 2)];
const L2 = [J('1000 € wachsen jedes Jahr um 10 %. Wann haben sie sich verdoppelt?', 10, 2), J('1000 € wachsen jedes Jahr um 15 %. Wann haben sie sich verdoppelt?', 15, 2), J('1000 € wachsen jedes Jahr um 10 %. Wann sind es mindestens 1500 €?', 10, 1.5)];
const L3 = [J('1000 € wachsen jedes Jahr um 20 %. Wann haben sie sich verdreifacht?', 20, 3), J('1000 € wachsen jedes Jahr um 8 %. Wann haben sie sich verdoppelt?', 8, 2), J('1000 € wachsen jedes Jahr um 12 %. Wann sind es mindestens 2500 €?', 12, 2.5)];
const L4 = [Z('Welcher Zinssatz verdoppelt 1000 € in 5 Jahren? Such den kleinsten, der reicht.', 5, 2, 15), Z('Welcher Zinssatz verdoppelt 1000 € in 10 Jahren? Such den kleinsten, der reicht.', 10, 2, 8), Z('Welcher Zinssatz macht in 4 Jahren aus 1000 € mindestens 1500 €? Such den kleinsten, der reicht.', 4, 1.5, 11)];
const L5 = [J('Ein Auto für 10 000 € verliert jedes Jahr 10 % an Wert. Wann ist es höchstens noch die Hälfte wert?', -10, 0.5), J('Ein Wert sinkt jedes Jahr um 20 %. Wann ist er höchstens halb so groß?', -20, 0.5), J('Ein Wert sinkt jedes Jahr um 5 %. Wann ist er höchstens halb so groß?', -5, 0.5), Z('Welcher Zinssatz verdreifacht 1000 € in 10 Jahren? Such den kleinsten, der reicht.', 10, 3, 12)];
/** Eigene Level für jede der fünf Schwierigkeiten. */
export const levelsFor = (lv) => [L1, L2, L3, L4, L5][Math.min(5, Math.max(1, lv | 0 || 3)) - 1];
/** Kleinster ganzzahliger Zinssatz, der in n Jahren das Ziel erreicht. */
export const kleinsterZins = (n, ziel) => { for (let p = 1; p <= 40; p++) if ((1 + p / 100) ** n >= ziel - 1e-9) return p; return null; };

export function zinsen(el, ctx) {
  const LS = levelsFor(store.level);
  let mi = 0, fehler = 0, fertig = false;
  el.innerHTML = `
    <div class="stack kind-spiel">
      <div class="mission"><b class="tag" id="zw-n"></b><p><span id="zw-t"></span><small id="zw-s"></small></p>${piKlein()}</div>
      <div class="stage kind-buehne"><svg id="zw" viewBox="0 0 320 170" role="img" aria-label="Säulen: Betrag Jahr für Jahr"></svg></div>
      <div class="slider fd-regler"><label for="zw-in" id="zw-l"></label><input id="zw-in" type="range" min="1" step="1" aria-label="Wert einstellen"><output id="zw-o"></output></div>
      <div id="zw-note"></div>
      <div class="row"><button class="btn block" id="zw-go" type="button">Prüfen</button></div>
    </div>`;
  const $ = (s) => el.querySelector(s), svg = $('#zw'), inp = $('#zw-in'), go = $('#zw-go'), note = $('#zw-note');
  const M = () => LS[mi];
  function zeichne() {
    const m = M(), v = +inp.value, p = m.art === 'jahre' ? m.p : v, n = m.art === 'jahre' ? v : m.n, q = 1 + p / 100, werte = Array.from({ length: n + 1 }, (_, i) => q ** i);
    const max = Math.max(m.ziel, ...werte, 1) * 1.08, w = Math.min(26, 280 / (n + 1)), Y = (f) => 150 - (f / max) * 130, x0 = 160 - ((n + 1) * w) / 2, t = [];
    werte.forEach((f, i) => t.push(`<rect x="${x0 + i * w + 2}" y="${Y(f)}" width="${w - 4}" height="${150 - Y(f)}" rx="3" fill="${(p > 0 ? f >= m.ziel - 1e-9 : f <= m.ziel + 1e-9) ? 'var(--mint)' : 'var(--orange)'}"/>${n <= 12 || i % 2 === 0 ? `<text x="${x0 + i * w + w / 2}" y="164" text-anchor="middle" class="strahl-klein">${i}</text>` : ''}`));
    t.push(`<line x1="12" y1="${Y(m.ziel)}" x2="308" y2="${Y(m.ziel)}" stroke="var(--head)" stroke-width="2" stroke-dasharray="6 5"/><text x="306" y="${Y(m.ziel) - 5}" text-anchor="end" class="strahl-zahl" stroke="var(--card)" stroke-width="5" paint-order="stroke" stroke-linejoin="round">Ziel: ${fmt(m.ziel)}-fach</text>`);
    svg.innerHTML = t.join(''); $('#zw-o').textContent = m.art === 'jahre' ? v : `${v} %`;
    $('#zw-s').textContent = `Faktor pro Jahr: ${fmt(q)}. Nach ${n} ${n === 1 ? 'Jahr' : 'Jahren'}: das ${fmt(q ** n, 2)}-Fache.`;
  }
  function lade() {
    const m = M(); fertig = false; $('#zw-n').textContent = `${mi + 1}/${LS.length}`; $('#zw-t').textContent = m.text;
    $('#zw-l').textContent = m.art === 'jahre' ? 'Jahre' : 'Zins'; inp.max = m.art === 'jahre' ? 15 : 20; inp.value = 1; inp.disabled = false;
    note.innerHTML = ''; go.textContent = 'Prüfen'; delete go.dataset.next; zeichne();
  }
  inp.addEventListener('input', () => { if (!fertig) zeichne(); });
  go.onclick = () => {
    if (go.dataset.next) { if (mi < LS.length - 1) { mi++; lade(); return; } ctx.done({ stars: fehler === 0 ? 3 : fehler <= 2 ? 2 : 1, mistakes: fehler }); return; }
    const m = M(), v = +inp.value;
    if (v === m.sol) { fertig = true; inp.disabled = true; sfx('ok'); buzz(); funken(svg);
      const q = 1 + (m.art === 'jahre' ? m.p : v) / 100, n = m.art === 'jahre' ? v : m.n;
      note.innerHTML = `<div class="note ok"><b>Richtig!</b> ${tex(`${ft(q)}^{${n}}\\approx${ft(q ** n, 2)}`)} – ${m.art === 'jahre' ? `nach ${n} Jahren ist das Ziel zum ersten Mal erreicht` : `${v} % ist der kleinste Zinssatz, der reicht`}. Jedes Jahr wächst auch das mit, was schon dazugekommen ist.</div>`;
      go.dataset.next = '1'; go.textContent = mi < LS.length - 1 ? 'Weiter' : 'Fertig'; ctx.progress((mi + 1) / LS.length); }
    else { fehler++; sfx('bad'); note.innerHTML = `<div class="note tip">${v < m.sol ? 'Die letzte Säule erreicht die gestrichelte Linie noch nicht.' : (m.art === 'jahre' ? 'Das Ziel war schon früher erreicht – gesucht ist das erste Mal.' : 'Ein kleinerer Zinssatz reicht auch schon – gesucht ist der kleinste.')}</div>`; }
  };
  lade(); ctx.progress(0);
  return () => {};
}
