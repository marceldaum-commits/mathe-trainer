// Mathe-Trainer – Start, Navigation und Ansichten.
import { UNITS, AREAS } from './units.js';
import { store, LEVELS } from './store.js';
import { CONFIG, VERSION } from './config.js';
import { $, h, esc, ICON, starsHtml, toast, sfx, sound, confetti, look } from './ui.js';
import { abiView, rundeView } from './exam.js';
import { settingsView, berichtView, karteiView, dailyGoal, openSteps, levelCard } from './extras.js';

const view = $('#view');
let cleanup = null;
let installEvent = null;

function chips() {
  $('#chips').innerHTML =
    `<button class="look" type="button" id="look" aria-pressed="${look.dark}" aria-label="${look.dark ? 'Helles' : 'Dunkles'} Design einschalten">${ICON.moon}${ICON.sun}</button>` +
    `<button class="chip snd" type="button" id="snd" aria-pressed="${sound.on}" aria-label="Ton ${sound.on ? 'ausschalten' : 'einschalten'}">${sound.on ? ICON.speaker : ICON.mute}</button>` +
    `<span class="chip fire" title="Lern-Serie in Tagen">${ICON.fire}${store.streak}</span>` +
    `<span class="chip xp" title="Punkte">${ICON.bolt}${store.xp}</span>`;
  $('#snd').onclick = () => { sound.on = !sound.on; chips(); sfx('ok'); };
  $('#look').onclick = () => { look.toggle(); chips(); sfx('tap'); };
}

function nextSpot() {
  for (const u of UNITS) for (let i = 0; i < u.steps.length; i++) if (!store.isDone(u.id, u.steps[i].id)) return { u, i };
  return null;
}

const AREA_INFO = {
  analysis: 'Funktionen, Ableitung, Integral',
  stochastik: 'Zufall, Verteilungen, Tests',
  geometrie: 'Vektoren, Geraden, Ebenen',
  pruefung: 'Abi-Modus, Runden, Operatoren',
};
const LERN_AREAS = () => AREAS.filter((a) => a.id !== 'pruefung');
const areaStat = (area) => {
  const us = UNITS.filter((u) => u.area === area.id);
  const steps = us.reduce((s, u) => s + u.steps.length, 0), done = us.reduce((s, u) => s + store.unitProgress(u).n, 0);
  return { units: us, n: us.length, doneUnits: us.filter((u) => store.unitProgress(u).done).length, pct: steps ? (done / steps) * 100 : 0 };
};
const areaCard = (area, href = `#/g/${area.id}`) => {
  const s = areaStat(area);
  return `<a class="card area" href="${href}"><h3>${esc(area.title)}</h3><small>${esc(AREA_INFO[area.id])}</small>
    <div class="bar"><i style="width:${s.pct}%"></i></div><small class="muted">${s.doneUnits}/${s.n} Einheiten</small></a>`;
};
const unitCard = (u, k) => {
  const p = store.unitProgress(u);
  return `<a class="card unit ${p.done ? 'done' : ''}" href="#/u/${u.id}">
    <span class="num">${p.done ? ICON.check : String(k + 1).padStart(2, '0')}</span>
    <span><h3>${esc(u.title)}</h3><small>${esc(u.sub)}</small><div class="bar"><i style="width:${(p.n / p.total) * 100}%"></i></div></span>
    <span class="go">${ICON.right}</span></a>`;
};
const linkCard = (href, num, title, sub) => `<a class="card unit" href="${href}"><span class="num">${num}</span><span><h3>${esc(title)}</h3><small>${sub}</small></span><span class="go">${ICON.right}</span></a>`;
const footer = () => `<footer class="foot">
    <a href="${CONFIG.website}" target="_blank" rel="noopener">${esc(CONFIG.firma)}</a>
    <a href="${CONFIG.impressum}" target="_blank" rel="noopener">Impressum</a>
    <a href="${CONFIG.datenschutz}" target="_blank" rel="noopener">Datenschutz</a>
    <span>Version ${VERSION}</span></footer>`;

/** Startseite: kurz – weitermachen, was heute ansteht, Gebiet wählen. */
function home() {
  const spot = nextSpot();
  const started = store.xp > 0;
  const el = h(`<div class="view stack" id="home">
    <section class="hero">
      <span class="eyebrow">Oberstufen-Mathe zum Anfassen</span>
      <h1>Verstehen<br>schafft <span class="orange">Sicherheit.</span></h1>
    </section>
    <section class="board">
      <div class="board-top"><span>${started ? 'WEITER MACHEN' : 'LOS GEHT’S'}</span><b>● ${spot ? esc(AREAS.find((a) => a.id === spot.u.area).title.toUpperCase()) : 'FERTIG'}</b></div>
      ${spot
        ? `<h2>${esc(spot.u.steps[spot.i].title)}</h2><p>${esc(spot.u.title)} · Schritt ${spot.i + 1} von ${spot.u.steps.length}</p>
           <a class="btn" href="#/u/${spot.u.id}/${spot.i}">${started ? 'Weiter' : 'Erste Runde starten'} ${ICON.right}</a>`
        : '<h2>Alles geschafft!</h2><p>Wiederhole gern eine Runde – die Aufgaben sind jedes Mal neu. Oder teste dich im Abi-Modus.</p>'}
    </section>
    <div id="today" class="stack"></div>
    <div class="sect"><h2>Was möchtest du üben?</h2></div>
    <section class="areas">${AREAS.map((a) => areaCard(a, a.id === 'pruefung' ? '#/pruefung' : `#/g/${a.id}`)).join('')}</section>
    <section class="cta">
      <h2>Hängt es an einer Stelle?</h2>
      <p>In einer kostenlosen Probestunde klären wir gemeinsam, was gerade hilft.</p>
      <a class="btn" href="${CONFIG.probestunde}" target="_blank" rel="noopener">Gratis Probestunde ${ICON.right}</a>
    </section>
    ${footer()}
  </div>`);
  const days = store.abiDays(), due = store.karteDue().length, tb = store.tagBest();
  const today = $('#today', el);
  if (days !== null) {
    const goal = dailyGoal(openSteps(), days);
    today.append(h(`<section class="card count"><b class="big">${days}</b><span><h3>${days === 1 ? 'Tag' : 'Tage'} bis zum Mathe-Abi</h3><small class="muted">${goal ? `Tagesziel: ${goal} ${goal === 1 ? 'Schritt' : 'Schritte'} im Lernpfad.` : 'Alle Schritte geschafft – jetzt Abi-Modus und Wiederholen.'}</small></span></section>`));
  }
  if (due) today.append(h(linkCard('#/wiederholen', due, 'Wiederholen', `${due === 1 ? 'Eine Aufgabenart ist' : `${due} Aufgabenarten sind`} heute fällig.`)));
  today.append(h(linkCard('#/tag', ICON.bolt, 'Tages-Runde', tb !== undefined ? `Heute: ${tb} Punkte – noch einmal?` : 'Sechs Aufgaben, heute für alle gleich.')));
  return el;
}

/** Lernen: erst das Gebiet wählen. */
function lernenView() {
  const el = h(`<div class="view stack">
    <div><span class="eyebrow">Lernen</span><h1 style="margin-top:8px">Wähle ein Gebiet</h1></div>
    <section class="stack">${LERN_AREAS().map((a) => { const s = areaStat(a); return linkCard(`#/g/${a.id}`, `<i class="pct">${Math.round(s.pct)} %</i>`, a.title, `${esc(AREA_INFO[a.id])} · ${s.doneUnits}/${s.n} Einheiten`); }).join('')}</section>
    <div id="lvbox"></div>
  </div>`);
  $('#lvbox', el).append(levelCard());
  return el;
}

/** Ein Gebiet: seine Einheiten. */
function areaView(area) {
  const s = areaStat(area);
  return h(`<div class="view stack">
    <a class="back" href="#/lernen">${ICON.left} Gebiete</a>
    <div><span class="eyebrow">${s.doneUnits}/${s.n} Einheiten · Schwierigkeit ${LEVELS[store.level - 1]}</span><h1 style="margin-top:8px">${esc(area.title)}</h1><p class="lead" style="margin-top:8px">${esc(AREA_INFO[area.id])}</p></div>
    <section class="stack">${s.units.map(unitCard).join('')}
      <div class="card unit soon"><span class="num">+</span><span><h3>Kommt bald</h3><small>${esc(area.soon.join(' · '))}</small></span><span></span></div></section>
  </div>`);
}

/** Prüfung: alles, was auf Zeit und auf das Abi vorbereitet. */
function pruefungView() {
  const ex = store.exams[0], tb = store.tagBest(), best = store.best(1)[0];
  const area = AREAS.find((a) => a.id === 'pruefung');
  return h(`<div class="view stack">
    <div><span class="eyebrow">Prüfung</span><h1 style="margin-top:8px">Zeig, was sitzt</h1></div>
    <section class="stack">
      ${linkCard('#/abi', 'A·B', 'Abi-Modus', ex ? `Zuletzt: ${ex.np} Notenpunkte (Teil ${esc(ex.part)})` : 'Auf Zeit, ohne Tipps, mit Punkte-Prognose.')}
      ${linkCard('#/tag', ICON.bolt, 'Tages-Runde', tb !== undefined ? `Heute: ${tb} Punkte` : 'Sechs Aufgaben, heute für alle gleich.')}
      ${linkCard('#/duell', 'VS', 'Duell', best ? `Dein Bestwert: ${best.score} Punkte` : 'Fordere Mitschüler per Link heraus.')}
    </section>
    <div class="sect"><h2>Prüfungswissen</h2></div>
    <section class="stack">${areaStat(area).units.map(unitCard).join('')}</section>
  </div>`);
}

/** Mehr: Wiederholen, Bericht, Einstellungen, App installieren, Kontakt. */
function mehrView() {
  const due = store.karteDue().length;
  const el = h(`<div class="view stack">
    <div><span class="eyebrow">Mehr</span><h1 style="margin-top:8px">Dein Trainer</h1></div>
    <section class="stack">
      ${linkCard('#/wiederholen', due || ICON.check, 'Fehler-Kartei', due ? `${due} ${due === 1 ? 'Aufgabenart ist' : 'Aufgabenarten sind'} heute fällig.` : `${store.karteCount} in der Kartei, heute nichts fällig.`)}
      ${linkCard('#/bericht', ICON.star, 'Bericht für Eltern', 'Lernstand zum Drucken oder Teilen.')}
      ${linkCard('#/einstellungen', ICON.gear, 'Einstellungen', `Schwierigkeit ${LEVELS[store.level - 1]} · Bundesland · Abi-Termin`)}
    </section>
    <div id="install"></div>
    <section class="cta">
      <h2>Persönliche Nachhilfe</h2>
      <p>Wenn es an einem Thema länger hakt: In einer kostenlosen Probestunde klären wir gemeinsam, was hilft.</p>
      <a class="btn" href="${CONFIG.probestunde}" target="_blank" rel="noopener">Gratis Probestunde ${ICON.right}</a>
    </section>
    ${footer()}
  </div>`);
  if (installEvent) {
    const box = h(`<div class="card install"><span class="grow"><h3>Als App aufs Handy</h3><small class="muted">Ein Tipp – dann liegt der Mathe-Trainer auf dem Startbildschirm.</small></span><button class="btn small" type="button">Installieren</button></div>`);
    box.querySelector('button').onclick = async () => { installEvent.prompt(); await installEvent.userChoice; installEvent = null; box.remove(); };
    $('#install', el).append(box);
  }
  return el;
}

function unitView(u) {
  const area = AREAS.find((a) => a.id === u.area);
  const el = h(`<div class="view stack">
    <a class="back" href="${u.area === 'pruefung' ? '#/pruefung' : `#/g/${u.area}`}">${ICON.left} ${esc(area.title)}</a>
    <div><span class="eyebrow">${esc(area.title)}</span><h1 style="margin-top:8px">${esc(u.title)}</h1><p class="lead" style="margin-top:8px">${esc(u.sub)}</p></div>
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
    <a class="btn block" id="sh-go" href="${nextI !== null ? `#/u/${u.id}/${nextI}` : u.area === 'pruefung' ? '#/pruefung' : `#/g/${u.area}`}">${nextI !== null ? `Weiter: ${esc(u.steps[nextI].title)}` : 'Zur Übersicht'}</a>
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
  const gm = hash.match(/^#\/g\/(\w+)$/), g = gm && LERN_AREAS().find((a) => a.id === gm[1]);
  let el;
  if (u && m[2] !== undefined && u.steps[+m[2]]) el = stepView(u, +m[2]);
  else if (u) el = unitView(u);
  else if (x) {
    const r = { abi: () => abiView(['A', 'B'].includes(x[2]) ? x[2] : null), tag: () => rundeView('tag'), duell: () => rundeView('duell', x[2]),
      bericht: berichtView, einstellungen: settingsView, wiederholen: karteiView }[x[1]]();
    el = r.el; cleanup = r.cleanup || null;
  } else if (hash === '#/lernen') el = lernenView();
  else if (hash === '#/pruefung') el = pruefungView();
  else if (hash === '#/mehr') el = mehrView();
  else if (g) el = areaView(g);
  else el = home();
  view.replaceChildren(el);
  chips(); nav();
  window.scrollTo(0, 0);
}

/** Untere Menüleiste: zeigt, wo man ist; verschwindet, solange gespielt wird. */
function nav() {
  const hash = location.hash || '#/';
  const um = hash.match(/^#\/u\/([\w-]+)/), unit = um && UNITS.find((x) => x.id === um[1]);
  const tab = unit ? (unit.area === 'pruefung' ? 'pruefung' : 'lernen')
    : /^#\/(lernen|g\/)/.test(hash) ? 'lernen' : /^#\/(pruefung|abi|tag|duell)/.test(hash) ? 'pruefung' : /^#\/(mehr|bericht|einstellungen|wiederholen)/.test(hash) ? 'mehr' : 'start';
  document.querySelectorAll('#nav a').forEach((a) => { const on = a.dataset.tab === tab; a.classList.toggle('on', on); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  $('#nav').hidden = !!view.querySelector('.stephead');
}
new MutationObserver(() => { $('#nav').hidden = !!view.querySelector('.stephead'); }).observe(view, { childList: true, subtree: true });
look.follow();
window.addEventListener('hashchange', route);
window.addEventListener('beforeinstallprompt', (ev) => { ev.preventDefault(); installEvent = ev; if (location.hash === '#/mehr') route(); });
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
