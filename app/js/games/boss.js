// Boss-Aufgabe am Ende einer Einheit: mehrere Aufgaben am Stück, eine Antwort je Aufgabe, keine Tipps.
// Jede richtige Antwort trifft den Boss, jede falsche kostet ein Herz.
import { Plot } from '../plot.js';
import { h, tex, cssVar, sfx, esc } from '../ui.js';
import { store } from '../store.js';
import { shuffle } from '../math.js';

export const HEARTS = 3;
/** So viele Treffer braucht es je nach Schwierigkeit. */
export const bossHp = (lv) => [4, 4, 5, 5, 6][lv - 1];
/** Der Boss rechnet eine Stufe schwerer als eingestellt (höchstens 5). */
export const bossLevel = (lv) => Math.min(5, lv + 1);

export function boss(gens, name, symbol) {
  return (el, ctx) => {
    const lv = bossLevel(store.level), hpMax = bossHp(store.level);
    let hp = hpMax, hearts = HEARTS, lock = false, plot = null, bag = [], combo = 0;
    const nextGen = () => { if (!bag.length) bag = shuffle(gens); return bag.pop(); };

    el.innerHTML = `<div class="stack">
      <div class="boss" id="bs">
        <div class="boss-face" id="bs-face" aria-hidden="true"><span>${esc(symbol)}</span></div>
        <div class="boss-info"><b>${esc(name)}</b><div class="hp" role="img" id="bs-hp" aria-label=""><i></i></div>
          <div class="hearts" id="bs-hearts" role="img" aria-label=""></div></div>
      </div>
      <div class="q" id="bs-q"></div></div>`;
    const face = el.querySelector('#bs-face');

    function status() {
      el.querySelector('#bs-hp i').style.width = `${(hp / hpMax) * 100}%`;
      el.querySelector('#bs-hp').setAttribute('aria-label', `Boss: ${hp} von ${hpMax} Lebenspunkten`);
      const hb = el.querySelector('#bs-hearts');
      hb.innerHTML = Array.from({ length: HEARTS }, (_, i) => `<span class="${i < hearts ? 'on' : ''}">♥</span>`).join('');
      hb.setAttribute('aria-label', `${hearts} von ${HEARTS} Herzen`);
      ctx.progress(1 - hp / hpMax);
    }
    function end(won) {
      plot?.destroy(); plot = null;
      const box = el.querySelector('#bs-q');
      if (won) {
        store.bump('boss'); if (hearts === HEARTS) store.bump('bossPerfekt');
        face.classList.add('down');
        box.innerHTML = `<div class="note ok"><b>${esc(name)} ist besiegt!</b> ${hearts === HEARTS ? 'Ohne ein einziges Herz zu verlieren.' : `Mit ${hearts} ${hearts === 1 ? 'Herz' : 'Herzen'} Rest.`}</div><button class="btn block" id="bs-done" type="button">Weiter</button>`;
        box.querySelector('#bs-done').onclick = () => ctx.done({ stars: hearts, mistakes: HEARTS - hearts });
      } else {
        box.innerHTML = `<div class="note tip"><b>${esc(name)} hat gewonnen – diesmal.</b> Schau dir die Erklärungen oben in der Einheit noch einmal an und versuch es erneut. Die Aufgaben sind beim nächsten Mal andere.</div>
          <button class="btn block" id="bs-again" type="button">Noch einmal</button>`;
        box.querySelector('#bs-again').onclick = () => { hp = hpMax; hearts = HEARTS; combo = 0; face.classList.remove('down'); status(); show(); };
      }
    }
    function show() {
      plot?.destroy(); plot = null;
      const fn = nextGen(), q = fn(lv); q.gen ??= fn.name; q.topic ??= fn.topic;
      const box = el.querySelector('#bs-q');
      box.innerHTML = `<div class="mission"><p>${q.prompt}</p></div>${q.graph ? '<div class="stage"><canvas aria-label="Graph"></canvas></div>' : ''}${q.formula ? `<div class="formula">${tex(q.formula, true)}</div>` : ''}<div class="opts"></div><div id="bs-note"></div>`;
      if (q.graph) {
        plot = new Plot(box.querySelector('canvas'), q.graph.view);
        const draw = () => { plot.clear(); plot.grid(); plot.fn(q.graph.f, { width: 4 }); if (q.graph.mark) plot.dot(q.graph.mark[0], q.graph.mark[1], { r: 6, color: cssVar('--orange') }); };
        plot.onResize = draw; draw();
      }
      q.options.forEach((o, k) => {
        const b = h(`<button class="opt" type="button"><span class="k">${'ABCD'[k]}</span><span>${o.html ?? tex(o.tex)}</span></button>`);
        if (window.__mtTest) b.dataset.ok = o.correct ? '1' : '0';   // nur im automatischen Browser-Test
        b.addEventListener('click', () => {
          if (lock) return; lock = true;
          const note = box.querySelector('#bs-note');
          if (o.correct) {
            hp--; combo++; b.classList.add('right'); sfx(hp === 0 ? 'ok' : 'pling'); store.record(q.topic, true); store.max('komboMax', combo);
            face.classList.remove('hit'); void face.offsetWidth; face.classList.add('hit');
          } else {
            hearts--; combo = 0; b.classList.add('wrong'); sfx('bad'); store.record(q.topic, false); store.kartePut(q.gen, q.topic);
            box.querySelectorAll('.opt').forEach((n, j) => { if (q.options[j].correct) n.classList.add('right'); });
            note.innerHTML = `<div class="note bad">${o.why || ''}</div>`;
          }
          status();
          const over = hp === 0 || hearts === 0;
          const go = h(`<button class="btn block" id="bs-next" type="button">${over ? 'Weiter' : 'Nächster Angriff'}</button>`);
          go.onclick = () => { lock = false; if (hp === 0) end(true); else if (hearts === 0) end(false); else { show(); window.scrollTo(0, 0); } };
          note.append(go);
        });
        box.querySelector('.opts').append(b);
      });
    }
    status(); show();
    return () => plot?.destroy();
  };
}
