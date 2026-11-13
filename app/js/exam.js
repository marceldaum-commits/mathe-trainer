// Runden auf Zeit: Abi-Modus (mit Punkte-Prognose), Tages-Runde (für alle gleich) und Duell per Link.
import * as G from './gen.js';
import * as H from './gen2.js';
import { seedRandom, shuffle, fmt } from './math.js';
import { store, LEVELS, LAENDER, dayKey } from './store.js';
import { $, h, tex, esc, ICON, sfx, confetti, toast } from './ui.js';
import { CONFIG } from './config.js';

/** Auswahl-Aufgaben je Gebiet (ohne Lücken- und Graph-Aufgaben, die brauchen mehr Platz und Zeit). */
export const POOL = {
  analysis: [G.genPolynom, G.genKette, G.genExp, G.genProdukt, G.genExtremstellen, G.genHochTief, G.genStammfunktion, G.genIntegral,
    H.genWendestelle, H.genMonotonie, H.genSymmetrie, H.genGrenzwert, H.genTangente, H.genSteckbrief, H.genSchar, H.genExtremwert, H.genLn, H.genWachstum, H.genFlaecheZwischen],
  stochastik: [G.genErwartung, G.genBinomial, G.genBaum, H.genVierfelder, H.genBedingt, H.genKumuliert, H.genSigma, H.genHypothese, H.genNormal, H.genKombinatorik],
  geometrie: [G.genVektorAB, G.genBetrag, G.genSkalar, H.genGeradePunkt, H.genEbene, H.genLage, H.genSchnittpunkt, H.genAbstand, H.genWinkel, H.genKreuz],
};

/** Erzeugt n Aufgaben, reihum aus den drei Gebieten. Mit seed bekommen alle dieselben Aufgaben. */
export function makeTasks(n, lv, seed = null) {
  seedRandom(seed);
  const areas = Object.keys(POOL), bags = Object.fromEntries(areas.map((a) => [a, shuffle(POOL[a])]));
  const tasks = [];
  for (let i = 0; i < n; i++) {
    const a = areas[i % areas.length], fn = bags[a][Math.floor(i / areas.length) % bags[a].length];
    const q = fn(lv); q.gen = fn.name; q.topic = fn.topic; q.area = a;
    tasks.push(q);
  }
  seedRandom(null);
  return tasks;
}

/** Notenpunkte (0–15) aus dem Anteil richtiger Antworten – übliche Oberstufen-Schwellen. */
export function notenpunkte(pct) {
  const T = [95, 90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 33, 27, 20];
  const i = T.findIndex((t) => pct >= t);
  return i < 0 ? 0 : 15 - i;
}

/** Punktzahl einer Runde: 100 je richtiger Antwort plus Zeit-Bonus (Restsekunden mal Anteil richtiger Antworten) –
 *  wer nur schnell rät, bekommt dafür nichts. */
export const scoreOf = (correct, total, answered, secsLeft) => correct * 100 + (answered === total ? Math.max(0, Math.round((secsLeft * correct) / total)) : 0);

const clock = (s) => `${Math.floor(s / 60)}:${String(Math.max(0, Math.floor(s % 60))).padStart(2, '0')}`;

/** Spielt eine Runde: eine Antwort je Aufgabe, keine Tipps, Zeit läuft. */
export function round(el, { tasks, seconds, onEnd }) {
  let i = 0, correct = 0, answered = 0, left = seconds, lock = false, ended = false;
  const wrong = [];
  const t0 = performance.now();
  el.innerHTML = `<div class="stack">
    <div class="examhead"><b id="ex-n"></b><div class="prog"><i id="ex-bar"></i></div><b class="timer" id="ex-t"></b></div>
    <div class="q" id="ex-q"></div></div>`;
  const tick = () => {
    left = seconds - (performance.now() - t0) / 1000;
    const tm = $('#ex-t', el); if (!tm) return;
    tm.textContent = clock(left); tm.classList.toggle('low', left < 30);
    if (left <= 0) end();
  };
  const timer = setInterval(tick, 250);
  function end() {
    if (ended) return; ended = true; clearInterval(timer);
    onEnd({ correct, total: tasks.length, answered, secsLeft: Math.max(0, left), secsUsed: Math.min(seconds, seconds - left), wrong });
  }
  function show() {
    const q = tasks[i];
    $('#ex-n', el).textContent = `${i + 1}/${tasks.length}`;
    $('#ex-bar', el).style.width = `${(i / tasks.length) * 100}%`;
    const box = $('#ex-q', el);
    box.innerHTML = `<div class="mission"><p>${q.prompt}</p></div>${q.formula ? `<div class="formula">${tex(q.formula, true)}</div>` : ''}<div class="opts"></div>`;
    q.options.forEach((o, k) => {
      const b = h(`<button class="opt" type="button"><span class="k">${'ABCD'[k]}</span><span>${o.html ?? tex(o.tex)}</span></button>`);
      b.addEventListener('click', () => {
        if (lock || ended) return; lock = true; answered++;
        if (o.correct) { correct++; b.classList.add('right'); sfx('pling'); store.record(q.topic, true); }
        else {
          b.classList.add('wrong'); sfx('bad'); store.record(q.topic, false); store.kartePut(q.gen, q.topic); wrong.push({ q, chosen: o });
          box.querySelectorAll('.opt').forEach((n, j) => { if (q.options[j].correct) n.classList.add('right'); });
        }
        setTimeout(() => { lock = false; i++; if (i >= tasks.length) end(); else { show(); window.scrollTo(0, 0); } }, o.correct ? 380 : 900);
      });
      $('.opts', box).append(b);
    });
  }
  tick(); show();
  return () => { ended = true; clearInterval(timer); };
}

const review = (wrong) => (wrong.length ? `<h3>Das war noch nicht richtig</h3>${wrong.map(({ q, chosen }) => `<div class="card rev"><p>${q.prompt}</p>${q.formula ? `<div class="formula">${tex(q.formula, true)}</div>` : ''}
  <div class="note bad"><b>Deine Antwort:</b> ${chosen.html ?? tex(chosen.tex)}${chosen.why ? `<br>${chosen.why}` : ''}</div><div class="note ok">${q.explain}</div></div>`).join('')}` : '');

/* ───────────── Abi-Modus ───────────── */

export function abiPlan(part, land = store.land, level = store.level) {
  const lk = land === 'HE-LK' ? 1 : 0;
  return part === 'A'
    ? { part, title: 'Teil A – ohne Hilfsmittel', n: 9 + 3 * lk, seconds: (12 + 3 * lk) * 60, lv: Math.min(3, Math.max(1, level)) + 0 }
    : { part, title: 'Teil B – mit Hilfsmitteln', n: 12 + 3 * lk, seconds: (20 + 5 * lk) * 60, lv: Math.min(5, Math.max(3, level + 1) + lk) };
}

export function abiView(part) {
  const el = h('<div class="view stack"></div>');
  let stop = null;
  if (!part) {
    const last = store.exams.slice(0, 3);
    el.innerHTML = `<a class="back" href="#/">${ICON.left} Start</a>
      <div><span class="eyebrow">Prüfung</span><h1 style="margin-top:8px">Abi-Modus</h1><p class="lead" style="margin-top:8px">Gemischte Aufgaben auf Zeit, eine Antwort je Aufgabe, keine Tipps. Am Ende gibt es eine Punkte-Prognose.</p></div>
      <small class="muted">Einstellung: ${esc(LAENDER[store.land])} · ${store.land ? '' : '<a href="#/einstellungen">Bundesland wählen</a> · '}Schwierigkeit ${LEVELS[store.level - 1]}</small>
      ${['A', 'B'].map((p) => { const pl = abiPlan(p); return `<a class="card unit" href="#/abi/${p}"><span class="num">${p}</span><span><h3>${pl.title}</h3><small>${pl.n} Aufgaben · ${pl.seconds / 60} Minuten · ${p === 'A' ? 'Zahlen, die im Kopf gehen' : 'größere Zahlen und mehr Regeln gemischt'}</small></span><span class="go">${ICON.right}</span></a>`; }).join('')}
      ${last.length ? `<h3>Letzte Ergebnisse</h3>${last.map((e) => `<div class="card row"><span class="grow">Teil ${esc(e.part)} · ${esc(e.date)}<br><small class="muted">${e.correct}/${e.total} richtig</small></span><b class="np">${e.np}</b></div>`).join('')}` : ''}
      <small class="muted">Die Prognose ist eine Orientierung aus Auswahl-Aufgaben. Im echten Abitur zählen auch Rechenweg und Begründung.</small>`;
    return { el };
  }
  const plan = abiPlan(part);
  el.innerHTML = `<div class="stephead"><a class="x" href="#/abi" aria-label="Abbrechen">${ICON.close}</a><b>${plan.title}</b></div><div id="stage"></div>`;
  queueMicrotask(() => {
    stop = round($('#stage', el), { tasks: makeTasks(plan.n, plan.lv), seconds: plan.seconds, onEnd: (r) => {
      const pct = Math.round((r.correct / r.total) * 100), np = notenpunkte(pct);
      store.addExam({ part, pct, np, correct: r.correct, total: r.total, xp: r.correct * 3 });
      sfx('win'); if (np >= 8) confetti(np >= 12 ? 60 : 30);
      const weakT = [...new Set(r.wrong.map((w) => w.q.topic))];
      el.innerHTML = `<a class="back" href="#/abi">${ICON.left} Abi-Modus</a>
        <section class="board" style="text-align:center"><div class="board-top"><span>${esc(plan.title.toUpperCase())}</span><b>● PROGNOSE</b></div>
          <div class="npbig" id="ex-np">${np}</div><h2>Notenpunkte</h2><p>${r.correct} von ${r.total} richtig (${pct} %) · ${clock(r.secsUsed)} Minuten${r.answered < r.total ? ` · ${r.total - r.answered} nicht beantwortet` : ''}</p></section>
        ${weakT.length ? `<div class="promo">Hier lohnt sich Üben: <b>${weakT.map(esc).join(', ')}</b>. Diese Aufgabenarten liegen jetzt in deiner Fehler-Kartei. Wenn es an einem Thema länger hakt, hilft eine <a href="${CONFIG.probestunde}" target="_blank" rel="noopener">kostenlose Probestunde</a>.</div>` : '<div class="note ok"><b>Fehlerfrei.</b> Probier die nächste Schwierigkeit.</div>'}
        ${review(r.wrong)}
        <a class="btn block" id="ex-again" href="#/abi">Zurück zum Abi-Modus</a>`;
      window.scrollTo(0, 0);
    } });
  });
  return { el, cleanup: () => stop?.() };
}

/* ───────────── Tages-Runde und Duell ───────────── */

const daySeed = (d = new Date()) => d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
const linkFor = (hash) => `${location.origin}${location.pathname}${hash}`;
async function share(text, url) {
  try {
    if (navigator.share) { await navigator.share({ title: 'Mathe-Trainer', text, url }); return; }
    await navigator.clipboard.writeText(`${text} ${url}`); toast('Link kopiert.');
  } catch { toast('Teilen nicht möglich – kopiere die Adresse aus der Adresszeile.'); }
}

/** #/tag oder #/duell[/seed-lv-punkte] */
export function rundeView(kind, arg) {
  const el = h('<div class="view stack"></div>');
  let stop = null;
  const m = /^(\d{1,9})-([1-5])(?:-(\d{1,5}))?$/.exec(arg || '');
  const cfg = kind === 'tag'
    ? { seed: daySeed(), lv: 3, n: 6, seconds: 240, title: 'Tages-Runde', back: '#/' }
    : { seed: m ? +m[1] : null, lv: m ? +m[2] : store.level, n: 6, seconds: 300, title: 'Duell', back: '#/', rival: m && m[3] !== undefined ? +m[3] : null };

  function intro() {
    const best = kind === 'tag' ? store.tagBest() : null, top = store.best(5);
    el.innerHTML = `<a class="back" href="${cfg.back}">${ICON.left} Start</a>
      <div><span class="eyebrow">${kind === 'tag' ? 'Jeden Tag neu' : 'Gegen Mitschüler'}</span><h1 style="margin-top:8px">${cfg.title}</h1>
      <p class="lead" style="margin-top:8px">${kind === 'tag' ? 'Heute bekommen alle dieselben sechs Aufgaben. Wie viele Punkte schaffst du?' : cfg.rival !== null ? `Du wurdest herausgefordert: <b>${cfg.rival} Punkte</b> sind zu schlagen. Ihr bekommt dieselben Aufgaben.` : 'Spiel eine Runde und schick den Link weiter. Dein Gegner bekommt genau dieselben Aufgaben.'}</p></div>
      <div class="card"><small class="muted">${cfg.n} Aufgaben · ${cfg.seconds / 60} Minuten · Schwierigkeit ${LEVELS[cfg.lv - 1]} · 100 Punkte je richtiger Antwort, dazu ein Zeit-Bonus für richtige Antworten</small></div>
      ${best !== undefined && best !== null ? `<div class="note ok"><b>Heute schon gespielt.</b> Dein Bestwert: ${best} Punkte. Du kannst es noch einmal versuchen.</div>` : ''}
      <button class="btn block" id="rd-go" type="button">${cfg.rival !== null ? 'Herausforderung annehmen' : 'Los geht’s'}</button>
      ${top.length ? `<h3>Deine Bestwerte</h3>${top.map((r, i) => `<div class="card row"><b class="num sm">${i + 1}</b><span class="grow">${r.kind === 'tag' ? 'Tages-Runde' : 'Duell'} · ${esc(r.date)}<br><small class="muted">${r.correct}/${r.total} richtig</small></span><b>${r.score}</b></div>`).join('')}<small class="muted">Die Bestwerte liegen nur auf diesem Gerät. Eine gemeinsame Bestenliste für alle gibt es erst mit einem Server.</small>` : ''}`;
    $('#rd-go', el).onclick = play;
  }
  function play() {
    const seed = cfg.seed ?? Math.floor(Math.random() * 899999999) + 100000000;
    el.innerHTML = `<div class="stephead"><a class="x" href="${kind === 'tag' ? '#/tag' : '#/duell'}" aria-label="Abbrechen">${ICON.close}</a><b>${cfg.title}</b></div><div id="stage"></div>`;
    stop = round($('#stage', el), { tasks: makeTasks(cfg.n, cfg.lv, seed), seconds: cfg.seconds, onEnd: (r) => {
      const score = scoreOf(r.correct, r.total, r.answered, r.secsLeft);
      store.addRun({ kind, score, correct: r.correct, total: r.total, xp: r.correct * 2 });
      if (kind === 'tag') store.setTag(score);
      const won = cfg.rival !== null ? score > cfg.rival : null;
      sfx('win'); if (won !== false && r.correct >= r.total / 2) confetti(40);
      const url = kind === 'tag' ? linkFor('#/tag') : linkFor(`#/duell/${seed}-${cfg.lv}-${score}`);
      const text = kind === 'tag' ? `Mathe-Trainer Tages-Runde: ${score} Punkte. Schaffst du mehr?` : `Ich habe ${score} Punkte im Mathe-Duell. Schlag mich – du bekommst dieselben Aufgaben:`;
      el.innerHTML = `<a class="back" href="#/">${ICON.left} Start</a>
        <section class="board" style="text-align:center"><div class="board-top"><span>${esc(cfg.title.toUpperCase())}</span><b>● ERGEBNIS</b></div>
          <div class="npbig" id="rd-score">${score}</div><h2>Punkte</h2><p>${r.correct} von ${r.total} richtig · ${clock(r.secsUsed)} Minuten</p>
          ${won === null ? '' : `<p><b>${won ? 'Gewonnen!' : score === cfg.rival ? 'Unentschieden.' : 'Knapp verloren.'}</b> Dein Gegner hatte ${cfg.rival} Punkte.</p>`}</section>
        <button class="btn block" id="rd-share" type="button">${kind === 'tag' ? 'Ergebnis teilen' : 'Mitschüler herausfordern'}</button>
        <input class="linkbox" id="rd-link" readonly value="${esc(url)}" aria-label="Link zum Weitergeben">
        ${review(r.wrong)}
        <a class="btn ghost block" href="${kind === 'tag' ? '#/tag' : '#/duell'}">Neue Runde</a>`;
      $('#rd-share', el).onclick = () => share(text, url);
      $('#rd-link', el).onclick = (ev) => ev.target.select();
      window.scrollTo(0, 0);
    } });
  }
  intro();
  return { el, cleanup: () => stop?.() };
}

export { fmt, dayKey };
