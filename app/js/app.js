// Mathe-Trainer – Start, Navigation und Ansichten.
import { UNITS, AREAS } from './units.js';
import { store, LEVELS } from './store.js';
import { CONFIG, VERSION } from './config.js';
import { $, h, esc, ICON, starsHtml, toast, sfx, sound, confetti } from './ui.js';
import { abiView, rundeView } from './exam.js';
import { settingsView, berichtView, karteiView, dailyGoal, openSteps } from './extras.js';

const view = $('#view');
let cleanup = null;
let installEvent = null;

function chips() {
  $('#chips').innerHTML =
    `<button class="chip snd" type="button" id="snd" aria-pressed="${sound.on}" aria-label="Ton ${sound.on ? 'ausschalten' : 'einschalten'}">${sound.on ? ICON.speaker : ICON.mute}</button>` +
    `<span class="chip fire" title="Lern-Serie in Tagen">${ICON.fire}${store.streak}</span>` +
    `<span class="chip xp" title="Punkte">${ICON.bolt}${store.xp}</span>`;
  $('#snd').onclick = () => { sound.on = !sound.on; chips(); sfx('ok'); };
}

function nextSpot() {
  for (const u of UNITS) for (let i = 0; i < u.steps.length; i++) if (!store.isDone(u.id, u.steps[i].id)) return { u, i };
  return null;
}

function home() {
  const spot = nextSpot();
  const started = store.xp > 0;
  const el = h(`<div class="view stack">
    <section class="hero">
      <span class="eyebrow">Oberstufen-Mathe zum Anfassen</span>
      <h1>Verstehen<br>schafft <span class="orange">Sicherheit.</span></h1>
      <p class="lead">Kurze Spiele statt Arbeitsblätter: erst ausprobieren, dann die Regel, dann wie in der Prüfung.</p>
    </section>
    <section class="board">
      <div class="board-top"><span>${started ? 'WEITER MACHEN' : 'LOS GEHT’S'}</span><b>● ${spot ? esc(AREAS.find((a) => a.id === spot.u.area).title.toUpperCase()) : 'FERTIG'}</b></div>
      ${spot
        ? `<h2>${esc(spot.u.steps[spot.i].title)}</h2><p>${esc(spot.u.title)} · Schritt ${spot.i + 1} von ${spot.u.steps.length}</p>
           <a class="btn" href="#/u/${spot.u.id}/${spot.i}">${started ? 'Weiter' : 'Erste Runde starten'} ${ICON.right}</a>`
        : '<h2>Alles geschafft!</h2><p>Neue Einheiten sind in Arbeit. Wiederhole gern eine Runde – die Aufgaben sind jedes Mal neu.</p>'}
    </section>
    <div id="today" class="stack"></div>
    <section class="tiles" aria-label="Runden">
      <a class="tile" href="#/tag"><b>Tages-Runde</b><small id="tl-tag">Heute für alle gleich</small></a>
      <a class="tile" href="#/abi"><b>Abi-Modus</b><small id="tl-abi">Auf Zeit, mit Prognose</small></a>
      <a class="tile" href="#/duell"><b>Duell</b><small>Mitschüler herausfordern</small></a>
    </section>
    <section class="card level" aria-label="Schwierigkeit">
      <div class="row"><h3 class="grow">Schwierigkeit</h3><b id="lv-name" class="orange"></b></div>
      <div class="seg" id="lv" role="radiogroup" aria-label="Schwierigkeit wählen"></div>
      <small class="muted" id="lv-note"></small>
    </section>
    <div id="areas" class="stack"></div>
    <div id="install"></div>
    <section class="tiles two" aria-label="Mehr">
      <a class="tile" href="#/bericht"><b>Bericht für Eltern</b><small>Lernstand zum Drucken oder Teilen</small></a>
      <a class="tile" href="#/einstellungen"><b>Einstellungen</b><small id="tl-set">Bundesland, Abi-Termin</small></a>
    </section>
    <section class="cta">
      <h2>Hängt es an einer Stelle?</h2>
      <p>In einer kostenlosen Probestunde klären wir gemeinsam, was gerade hilft – persönlich und ohne Druck.</p>
      <a class="btn" href="${CONFIG.probestunde}" target="_blank" rel="noopener">Gratis Probestunde ${ICON.right}</a>
    </section>
    <footer class="foot">
      <a href="${CONFIG.website}" target="_blank" rel="noopener">${esc(CONFIG.firma)}</a>
      <a href="${CONFIG.impressum}" target="_blank" rel="noopener">Impressum</a>
      <a href="${CONFIG.datenschutz}" target="_blank" rel="noopener">Datenschutz</a>
      <span>Version ${VERSION}</span>
    </footer>
  </div>`);
  // Heute: Abi-Countdown mit Tagesziel und fällige Wiederholungen
  const days = store.abiDays(), due = store.karteDue().length, tb = store.tagBest(), ex = store.exams[0];
  if (days !== null) {
    const goal = dailyGoal(openSteps(), days);
    $('#today', el).append(h(`<section class="card count"><b class="big">${days}</b><span><h3>${days === 1 ? 'Tag' : 'Tage'} bis zum Mathe-Abi</h3><small class="muted">${goal ? `Tagesziel: ${goal} ${goal === 1 ? 'Schritt' : 'Schritte'} im Lernpfad – dann bist du rechtzeitig durch.` : 'Alle Schritte geschafft – jetzt Abi-Modus und Wiederholen.'}</small></span></section>`));
  }
  if (due) $('#today', el).append(h(`<a class="card unit" href="#/wiederholen"><span class="num">${due}</span><span><h3>Wiederholen</h3><small>${due === 1 ? 'Eine Aufgabenart ist' : `${due} Aufgabenarten sind`} heute in der Fehler-Kartei fällig.</small></span><span class="go">${ICON.right}</span></a>`));
  if (tb !== undefined) $('#tl-tag', el).textContent = `Heute: ${tb} Punkte`;
  if (ex) $('#tl-abi', el).textContent = `Zuletzt: ${ex.np} Notenpunkte`;
  // Schwierigkeit
  const NOTES = ['Kleine Zahlen, großzügige Bewertung, alle Tipps.', 'Einfache Zahlen, alle Tipps.', 'Wie im Unterricht.', 'Größere Zahlen, mehr Regeln gemischt, weniger Hinweise.', 'Prüfungsniveau und darüber – ohne Tipps.'];
  const seg = $('#lv', el);
  const paint = () => {
    seg.querySelectorAll('button').forEach((b, i) => { const on = i + 1 === store.level; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); });
    $('#lv-name', el).textContent = LEVELS[store.level - 1];
    $('#lv-note', el).textContent = NOTES[store.level - 1];
  };
  LEVELS.forEach((name, i) => {
    const b = h(`<button type="button" role="radio" aria-label="${name}">${i + 1}</button>`);
    b.onclick = () => { store.level = i + 1; paint(); sfx('tap'); };
    seg.append(b);
  });
  paint();
  // Lernpfade je Gebiet
  AREAS.forEach((area) => {
    const units = UNITS.filter((u) => u.area === area.id);
    const doneN = units.filter((u) => store.unitProgress(u).done).length;
    const sec = h(`<section class="stack"><div class="sect"><h2>${esc(area.title)}</h2><small class="muted">${doneN}/${units.length} Einheiten</small></div><div class="stack list"></div></section>`);
    const list = $('.list', sec);
    units.forEach((u, k) => {
      const p = store.unitProgress(u);
      list.append(h(`<a class="card unit ${p.done ? 'done' : ''}" href="#/u/${u.id}">
        <span class="num">${p.done ? ICON.check : String(k + 1).padStart(2, '0')}</span>
        <span><h3>${esc(u.title)}</h3><small>${esc(u.sub)}</small><div class="bar"><i style="width:${(p.n / p.total) * 100}%"></i></div></span>
        <span class="go">${ICON.right}</span></a>`));
    });
    list.append(h(`<div class="card unit soon"><span class="num">+</span><span><h3>Kommt bald</h3><small>${esc(area.soon.join(' · '))}</small></span><span></span></div>`));
    $('#areas', el).append(sec);
  });
  if (installEvent) {
    const box = h(`<div class="card install"><span class="grow"><h3>Als App aufs Handy</h3><small class="muted">Ein Tipp – dann liegt der Mathe-Trainer auf dem Startbildschirm.</small></span><button class="btn small" type="button">Installieren</button></div>`);
    box.querySelector('button').onclick = async () => { installEvent.prompt(); await installEvent.userChoice; installEvent = null; box.remove(); };
    $('#install', el).append(box);
  }
  return el;
}

function unitView(u) {
  const el = h(`<div class="view stack">
    <a class="back" href="#/">${ICON.left} Lernpfad</a>
    <div><span class="eyebrow">${esc(AREAS.find((a) => a.id === u.area).title)}</span><h1 style="margin-top:8px">${esc(u.title)}</h1><p class="lead" style="margin-top:8px">${esc(u.sub)}</p></div>
    <div class="steps"></div>
  </div>`);
  u.steps.forEach((s, i) => {
    const st = store.stars(u.id, s.id);
    $('.steps', el).append(h(`<a class="card step ${st !== undefined ? 'done' : ''}" href="#/u/${u.id}/${i}">
      <b class="n">${st !== undefined ? ICON.check : i + 1}</b>
      <span><span class="kind">${esc(s.kind)}</span><h3>${esc(s.title)}</h3></span>
      ${st !== undefined ? starsHtml(st) : `<span class="muted">${ICON.right}</span>`}</a>`));
  });
  return el;
}

function stepView(u, i) {
  const s = u.steps[i];
  const el = h(`<div class="view">
    <div class="stephead"><a class="x" href="#/u/${u.id}" aria-label="Schließen">${ICON.close}</a><div class="prog"><i></i></div></div>
    <div id="stage"></div>
  </div>`);
  const bar = $('.prog i', el);
  const ctx = {
    progress: (f) => { bar.style.width = `${Math.round(Math.max(0, Math.min(1, f)) * 100)}%`; },
    done: (res) => finish(u, i, res),
  };
  queueMicrotask(() => { cleanup = s.run($('#stage', el), ctx) || null; });
  return el;
}

function finish(u, i, res) {
  const s = u.steps[i];
  const stars = Math.max(0, Math.min(3, res.stars ?? 3));
  const r = store.complete(u.id, s.id, stars);
  chips();
  const nextI = i + 1 < u.steps.length ? i + 1 : null;
  const unitDone = store.unitProgress(u).done && nextI === null;
  const sheet = $('#sheet');
  sheet.innerHTML = `<div class="sheet-in" role="dialog" aria-modal="true" aria-label="Schritt geschafft">
    ${starsHtml(stars)}
    <small class="muted">Schwierigkeit: ${LEVELS[store.level - 1]}</small>
    <h2>${unitDone ? 'Einheit geschafft!' : stars === 3 ? 'Stark!' : 'Geschafft!'}</h2>
    <div class="gain"><span class="chip xp">${ICON.bolt}+${r.gain} Punkte</span><span class="chip fire">${ICON.fire}${r.streak} ${r.streak === 1 ? 'Tag' : 'Tage'} in Folge</span></div>
    ${(res.mistakes ?? 0) >= 3 ? `<div class="promo">Das Thema hakt noch? Das ist normal. In einer <a href="${CONFIG.probestunde}" target="_blank" rel="noopener">kostenlosen Probestunde</a> gehen wir es gemeinsam durch.</div>` : ''}
    <a class="btn block" id="sh-go" href="${nextI !== null ? `#/u/${u.id}/${nextI}` : '#/'}">${nextI !== null ? `Weiter: ${esc(u.steps[nextI].title)}` : 'Zum Lernpfad'}</a>
    ${nextI !== null ? `<a class="btn ghost block" href="#/u/${u.id}">Zur Übersicht</a>` : ''}
  </div>`;
  sheet.hidden = false;
  sfx('win'); if (stars >= 2) confetti(unitDone ? 60 : 32);
  $('#sh-go', sheet).focus();
}

function route() {
  cleanup?.(); cleanup = null;
  $('#sheet').hidden = true;
  const hash = location.hash;
  const m = hash.match(/^#\/u\/([\w-]+)(?:\/(\d+))?$/);
  const u = m && UNITS.find((x) => x.id === m[1]);
  const x = hash.match(/^#\/(abi|tag|duell|bericht|einstellungen|wiederholen)(?:\/([\w-]+))?$/);
  let el;
  if (u && m[2] !== undefined && u.steps[+m[2]]) el = stepView(u, +m[2]);
  else if (u) el = unitView(u);
  else if (x) {
    const r = { abi: () => abiView(['A', 'B'].includes(x[2]) ? x[2] : null), tag: () => rundeView('tag'), duell: () => rundeView('duell', x[2]),
      bericht: berichtView, einstellungen: settingsView, wiederholen: karteiView }[x[1]]();
    el = r.el; cleanup = r.cleanup || null;
  } else el = home();
  view.replaceChildren(el);
  chips();
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', route);
window.addEventListener('beforeinstallprompt', (ev) => { ev.preventDefault(); installEvent = ev; if (!location.hash || location.hash === '#/') route(); });
route();

// Offline-Fähigkeit und automatische Updates.
if ('serviceWorker' in navigator && (location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(location.hostname))) {
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.register('sw.js').then((reg) => {
    const offer = (w) => toast('Neue Version verfügbar.', { label: 'Aktualisieren', run: () => w.postMessage('skip') });
    if (reg.waiting && navigator.serviceWorker.controller) offer(reg.waiting);
    reg.addEventListener('updatefound', () => {
      const w = reg.installing;
      w?.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) offer(w); });
    });
    // Nur bei einem Update neu laden – nicht beim allerersten Besuch.
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadController && !reloaded) { reloaded = true; location.reload(); } });
  }).catch(() => { /* ohne Service Worker läuft die App trotzdem */ });
}
