// Plättchen-Felder: Eine Zahl als volles Rechteck legen. Jede Reihenlänge, die aufgeht, ist ein Teiler –
// und eine Zahl, die sich nur als eine einzige Reihe legen lässt, ist eine Primzahl.
import { sfx, buzz, funken } from '../ui.js';
import { store } from '../store.js';
import { piKlein } from './strahl.js';

export const teiler = (n) => Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0);
const L1 = [6, 8, 7], L2 = [12, 10, 11], L3 = [18, 16, 13], L4 = [24, 20, 17], L5 = [36, 30, 23];
/** Eigene Level für jede der fünf Schwierigkeiten: Zahlen, deren Teiler gesucht werden. */
export const levelsFor = (lv) => [L1, L2, L3, L4, L5][Math.min(5, Math.max(1, lv | 0 || 3)) - 1].map((n) => ({ n, sol: teiler(n) }));

export function felder(el, ctx) {
  const LS = levelsFor(store.level);
  let mi = 0, fehler = 0, gefunden = new Set();
  el.innerHTML = `
    <div class="stack kind-spiel">
      <div class="mission"><b class="tag" id="fd-n"></b><p><span id="fd-t"></span><small id="fd-s"></small></p>${piKlein()}</div>
      <div class="stage kind-buehne"><svg id="fd" viewBox="0 0 320 140" role="img" aria-label="Plättchen in Reihen"></svg></div>
      <div class="slider fd-regler"><label for="fd-in">Reihe</label><input id="fd-in" type="range" min="1" step="1" aria-label="Plättchen je Reihe"><output id="fd-o"></output></div>
      <div class="fd-liste" id="fd-l" aria-live="polite"></div>
      <div id="fd-note"></div>
      <div class="row"><button class="btn block" id="fd-go" type="button">Passt das?</button></div>
    </div>`;
  const $ = (s) => el.querySelector(s), svg = $('#fd'), inp = $('#fd-in'), go = $('#fd-go'), note = $('#fd-note');
  const M = () => LS[mi];
  function zeichne() {
    const n = M().n, r = +inp.value, zeilen = Math.ceil(n / r), g = Math.min(24, 300 / r, 128 / zeilen), x0 = (320 - r * g) / 2, y0 = (140 - zeilen * g) / 2, t = [];
    for (let i = 0; i < n; i++) { const voll = Math.floor(i / r) < Math.floor(n / r); t.push(`<circle cx="${x0 + (i % r) * g + g / 2}" cy="${y0 + Math.floor(i / r) * g + g / 2}" r="${g * 0.38}" fill="${voll ? 'var(--orange)' : 'var(--muted)'}" fill-opacity="${voll ? 1 : 0.55}"/>`); }
    svg.innerHTML = t.join(''); $('#fd-o').textContent = r;
  }
  const liste = () => { $('#fd-l').innerHTML = M().sol.map((d) => `<span class="fd-chip ${gefunden.has(d) ? 'an' : ''}">${gefunden.has(d) ? d : '?'}</span>`).join(''); };
  function lade() {
    gefunden = new Set(); const n = M().n;
    $('#fd-n').textContent = `${mi + 1}/${LS.length}`; $('#fd-t').textContent = `Lege ${n} Plättchen als volles Rechteck – auf jede Art, die geht.`;
    $('#fd-s').textContent = 'Stell ein, wie viele in einer Reihe liegen.';
    inp.max = n; inp.value = Math.min(n, 4) === n ? 2 : 4; inp.disabled = false; note.innerHTML = ''; go.textContent = 'Passt das?'; delete go.dataset.next; zeichne(); liste();
  }
  inp.addEventListener('input', () => { if (!go.dataset.next) { zeichne(); note.innerHTML = ''; } });
  go.onclick = () => {
    if (go.dataset.next) { if (mi < LS.length - 1) { mi++; lade(); return; } ctx.done({ stars: fehler <= 2 ? 3 : fehler <= 5 ? 2 : 1, mistakes: fehler }); return; }
    const n = M().n, r = +inp.value;
    if (n % r === 0) {
      const neu = !gefunden.has(r); gefunden.add(r); liste(); sfx('ok');
      if (gefunden.size === M().sol.length) { inp.disabled = true; buzz(); funken(svg);
        note.innerHTML = `<div class="note ok"><b>Alle gefunden!</b> Die Teiler von ${n} sind ${M().sol.join(', ')}.${M().sol.length === 2 ? ` Nur 1 und ${n} – so eine Zahl heißt <b>Primzahl</b>.` : ''}</div>`;
        go.dataset.next = '1'; go.textContent = mi < LS.length - 1 ? 'Weiter' : 'Fertig'; ctx.progress((mi + 1) / LS.length); }
      else note.innerHTML = `<div class="note ok">${neu ? `<b>Geht auf:</b> ${n / r} ${n / r === 1 ? 'Reihe' : 'Reihen'} mit je ${r}. Also ist ${r} ein Teiler von ${n}.` : `Die ${r} hast du schon gefunden.`} Es fehlen noch ${M().sol.length - gefunden.size}.</div>`;
    } else { fehler++; sfx('bad'); note.innerHTML = `<div class="note tip">Das geht nicht auf: In der letzten Reihe liegen nur ${n % r}. Probier eine andere Reihenlänge.</div>`; }
  };
  lade(); ctx.progress(0);
  return () => {};
}
