// Runden auf Zeit: Abi-Modus (mit Punkte-Prognose), Tages-Runde (für alle gleich) und Duell per Link.
import * as G from './gen.js';
import * as H from './gen2.js';
import * as K from './gen3.js';
import { seedRandom, shuffle, fmt } from './math.js';
import { store, LEVELS, LAENDER, dayKey } from './store.js';
import { $, h, tex, esc, ICON, sfx, confetti, toast } from './ui.js';
import { CONFIG } from './config.js';
import { cardBox } from './share.js';

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
  let i = 0, correct = 0, answered = 0, left = seconds, lock = false, ended = false, combo = 0;
  const wrong = [], answers = [];
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
    onEnd({ correct, total: tasks.length, answered, answers, secsLeft: Math.max(0, left), secsUsed: Math.min(seconds, seconds - left), wrong });
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
        if (lock || ended) return; lock = true; answered++; answers.push(k);
        if (o.correct) { correct++; combo++; store.max('komboMax', combo); b.classList.add('right'); sfx('pling'); store.record(q.topic, true); }
        else {
          combo = 0; b.classList.add('wrong'); sfx('bad'); store.record(q.topic, false); store.kartePut(q.gen, q.topic); wrong.push({ q, chosen: o });
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

export function abiView(part, opts_onEnd) {
  const el = h('<div class="view stack"></div>');
  let stop = null;
  if (!part) {
    const last = store.exams.slice(0, 3);
    el.innerHTML = `<a class="back" href="#/pruefung">${ICON.left} Prüfung</a>
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
        <div id="ex-card"></div>
        ${review(r.wrong)}
        <a class="btn block" id="ex-again" href="#/abi">Zurück zum Abi-Modus</a>`;
      if (np >= 5) $('#ex-card', el).append(cardBox({ kicker: `Abi-Modus · ${plan.title.split(' – ')[0]}`, big: np, unit: 'Notenpunkte', lines: [`${r.correct} von ${r.total} Aufgaben richtig.`, 'Prognose aus dem Mathe-Trainer.'] }, `Abi-Modus im Mathe-Trainer: ${np} Notenpunkte.`, linkFor('#/abi')));
      opts_onEnd?.();
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
export function rundeView(kind, arg, opts_onEnd) {
  const el = h('<div class="view stack"></div>');
  let stop = null;
  const m = /^(\d{1,9})-([1-5])(?:-(\d{1,5}))?$/.exec(arg || '');
  const cfg = kind === 'tag'
    ? { seed: daySeed(), lv: 3, n: 6, seconds: 240, title: 'Tages-Runde', back: '#/' }
    : { seed: m ? +m[1] : null, lv: m ? +m[2] : store.level, n: 6, seconds: 300, title: 'Duell', back: '#/', rival: m && m[3] !== undefined ? +m[3] : null };

  function intro() {
    const best = kind === 'tag' ? store.tagBest() : null, top = store.best(5);
    el.innerHTML = `<a class="back" href="#/pruefung">${ICON.left} Prüfung</a>
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
      if (kind === 'tag') { store.setTag(score); store.bump('tagRunden'); }
      const won = cfg.rival !== null ? score > cfg.rival : null;
      if (won) store.bump('duellSiege');
      sfx('win'); if (won !== false && r.correct >= r.total / 2) confetti(40);
      const url = kind === 'tag' ? linkFor('#/tag') : linkFor(`#/duell/${seed}-${cfg.lv}-${score}`);
      const text = kind === 'tag' ? `Mathe-Trainer Tages-Runde: ${score} Punkte. Schaffst du mehr?` : `Ich habe ${score} Punkte im Mathe-Duell. Schlag mich – du bekommst dieselben Aufgaben:`;
      el.innerHTML = `<a class="back" href="#/pruefung">${ICON.left} Prüfung</a>
        <section class="board" style="text-align:center"><div class="board-top"><span>${esc(cfg.title.toUpperCase())}</span><b>● ERGEBNIS</b></div>
          <div class="npbig" id="rd-score">${score}</div><h2>Punkte</h2><p>${r.correct} von ${r.total} richtig · ${clock(r.secsUsed)} Minuten</p>
          ${won === null ? '' : `<p><b>${won ? 'Gewonnen!' : score === cfg.rival ? 'Unentschieden.' : 'Knapp verloren.'}</b> Dein Gegner hatte ${cfg.rival} Punkte.</p>`}</section>
        <button class="btn block" id="rd-share" type="button">${kind === 'tag' ? 'Ergebnis teilen' : 'Mitschüler herausfordern'}</button>
        <input class="linkbox" id="rd-link" readonly value="${esc(url)}" aria-label="Link zum Weitergeben">
        <div id="rd-card"></div>
        ${review(r.wrong)}
        <a class="btn ghost block" href="${kind === 'tag' ? '#/tag' : '#/duell'}">Neue Runde</a>`;
      $('#rd-share', el).onclick = () => share(text, url);
      $('#rd-link', el).onclick = (ev) => ev.target.select();
      if (r.correct > 0) $('#rd-card', el).append(cardBox({ kicker: cfg.title, big: score, unit: 'Punkte', lines: [`${r.correct} von ${r.total} richtig.`, kind === 'tag' ? 'Heute bekommen alle dieselben Aufgaben.' : 'Schaffst du mehr? Du bekommst dieselben Aufgaben.'] }, text, url));
      opts_onEnd?.({ seed, lv: cfg.lv, answers: r.answers, secs: Math.round(r.secsUsed), score });
      window.scrollTo(0, 0);
    } });
  }
  intro();
  return { el, cleanup: () => stop?.() };
}

/* ───────────── Blitz-Runde: 60 Sekunden, so viele wie möglich ───────────── */

/** Schnelle Aufgabenarten (kurzer Text, im Kopf lösbar). */
export const BLITZ_POOL = [G.genPolynom, G.genExp, G.genKette, G.genErwartung, G.genVektorAB, G.genBetrag, G.genSkalar, H.genSymmetrie, H.genGrenzwert, H.genKombinatorik, H.genSigma, H.genWendestelle, H.genLn, H.genNormal,
  K.genKlammer, K.genPotenz, K.genLinGl, K.genProzent, K.genLaplace, K.genPythagoras, K.genVektorRechnen];
export const BLITZ_SEKUNDEN = 60;
/** Punkte je richtiger Antwort: 10 mal Kombo-Faktor (höchstens 5). */
export const blitzPunkte = (combo) => 10 * Math.min(5, Math.max(1, combo));

export function blitzView(opts_onEnd) {
  const el = h('<div class="view stack"></div>');
  let timer = 0, over = true;
  function intro() {
    el.innerHTML = `<a class="back" href="#/pruefung">${ICON.left} Prüfung</a>
      <div><span class="eyebrow">60 Sekunden</span><h1 style="margin-top:8px">Blitz-Runde</h1>
      <p class="lead" style="margin-top:8px">So viele Aufgaben wie möglich. Jede richtige Antwort in Folge erhöht den Kombo-Faktor – ein Fehler setzt ihn zurück.</p></div>
      <div class="card"><small class="muted">Schwierigkeit ${LEVELS[Math.min(3, store.level) - 1]} · 10 Punkte mal Kombo (bis ×5) · Dein Rekord: ${store.n('blitzRekord')} Punkte, ${store.n('blitzBest')} richtige</small></div>
      <button class="btn block" id="bz-go" type="button">Los!</button>`;
    $('#bz-go', el).onclick = play;
  }
  function play() {
    const lv = Math.min(3, store.level), t0 = performance.now();
    let score = 0, right = 0, total = 0, combo = 0, best = 0, lock = false, bag = [];
    over = false;
    el.innerHTML = `<div class="stephead"><a class="x" href="#/blitz" aria-label="Abbrechen">${ICON.close}</a><b>Blitz-Runde</b></div>
      <div class="examhead"><b id="bz-score">0</b><div class="prog"><i id="bz-bar" style="width:100%"></i></div><b class="timer" id="bz-t">1:00</b></div>
      <div class="kombo-line"><span class="kombo" id="bz-kombo" hidden></span></div><div class="q" id="bz-q"></div>`;
    const end = () => {
      if (over) return; over = true; clearInterval(timer);
      store.addRun({ kind: 'blitz', score, correct: right, total, xp: right });
      store.max('blitzBest', right); const rec = score > store.n('blitzRekord'); store.max('blitzRekord', score);
      sfx('win'); if (right >= 5) confetti(rec ? 60 : 30);
      el.innerHTML = `<a class="back" href="#/pruefung">${ICON.left} Prüfung</a>
        <section class="board" style="text-align:center"><div class="board-top"><span>BLITZ-RUNDE</span><b>● ${rec ? 'NEUER REKORD' : 'ERGEBNIS'}</b></div>
          <div class="npbig" id="bz-end">${score}</div><h2>Punkte</h2><p>${right} von ${total} richtig · längste Kombo ×${best}</p></section>
        <div id="bz-card"></div><button class="btn block" id="bz-again" type="button">Noch einmal</button>`;
      if (right > 0) $('#bz-card', el).append(cardBox({ kicker: 'Blitz-Runde · 60 Sekunden', big: score, unit: 'Punkte', lines: [`${right} richtige Antworten, längste Kombo ×${best}.`, 'Schaffst du mehr?'] }, `Blitz-Runde im Mathe-Trainer: ${score} Punkte in 60 Sekunden.`, linkFor('#/blitz')));
      $('#bz-again', el).onclick = play; opts_onEnd?.(); window.scrollTo(0, 0);
    };
    const tick = () => {
      const left = BLITZ_SEKUNDEN - (performance.now() - t0) / 1000, tm = $('#bz-t', el); if (!tm) return;
      tm.textContent = clock(left); tm.classList.toggle('low', left < 10); $('#bz-bar', el).style.width = `${Math.max(0, (left / BLITZ_SEKUNDEN) * 100)}%`;
      if (left <= 0) end();
    };
    const show = () => {
      if (!bag.length) bag = shuffle(BLITZ_POOL);
      const fn = bag.pop(), q = fn(lv); q.gen = fn.name; q.topic = fn.topic;
      const box = $('#bz-q', el);
      box.innerHTML = `<div class="mission"><p>${q.prompt}</p></div>${q.formula ? `<div class="formula">${tex(q.formula, true)}</div>` : ''}<div class="opts"></div>`;
      q.options.forEach((o, k) => {
        const b = h(`<button class="opt" type="button"><span class="k">${'ABCD'[k]}</span><span>${o.html ?? tex(o.tex)}</span></button>`);
        if (window.__mtTest) b.dataset.ok = o.correct ? '1' : '0';   // nur im automatischen Browser-Test
        b.addEventListener('click', () => {
          if (lock || over) return; lock = true; total++;
          const kb = $('#bz-kombo', el);
          if (o.correct) { right++; combo++; best = Math.max(best, combo); score += blitzPunkte(combo); b.classList.add('right'); sfx('pling'); store.record(q.topic, true); store.max('komboMax', combo); }
          else { combo = 0; b.classList.add('wrong'); sfx('bad'); store.record(q.topic, false); box.querySelectorAll('.opt').forEach((n, j) => { if (q.options[j].correct) n.classList.add('right'); }); }
          $('#bz-score', el).textContent = String(score);
          kb.hidden = combo < 2; kb.textContent = `Kombo ×${Math.min(5, combo)}`;
          setTimeout(() => { lock = false; if (!over) show(); }, o.correct ? 220 : 700);
        });
        $('.opts', box).append(b);
      });
    };
    timer = setInterval(tick, 200); tick(); show();
  }
  intro();
  return { el, cleanup: () => { over = true; clearInterval(timer); } };
}

export { fmt, dayKey };
