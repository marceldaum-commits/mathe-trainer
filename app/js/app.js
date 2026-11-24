// Mathe-Trainer – Start, Navigation und Ansichten.
import { UNITS, AREAS, practiceGens, stepExtra, unitExtra, NICHT_TEXT, GRUND, JAHRGAENGE, jgName, jahrgangAnwenden, istOber, baldHier, ALLE_UNITS, jgVon } from './units.js';
import { quiz } from './quiz.js';
import { initMelden } from './melden.js';
import { abenteuerView } from './abenteuer.js';
import { blattView } from './blatt.js';
import { proView, proAbzeichen } from './pro.js';
import { kiAufgabeView } from './kiaufgabe.js';
import { kartenView, faellig } from './karten.js';
import { karteView } from './karte.js';
import { pi, figurFor } from './figuren.js';
import { einstufungView, einstufungErgebnis, verbundView, planView, planNow, zertifikatView, areaDone } from './plus.js';
import { mixOf } from './a/gen.js';
import { ladeAufgaben, aufgabenDa, NichtGeladen } from './faul.js';
import { store, LEVELS } from './store.js';
import { CONFIG, VERSION, STAND } from './config.js';
import { $, h, esc, ICON, starsHtml, toast, sfx, sound, klang, confetti, look, formelnEinpassen, VORLESEN } from './ui.js';
import { abiView, rundeView, blitzView } from './exam.js';
import { kopfView, knobelHeuteGeloest } from './kopf.js';
import { arbeitView, arbeitPlan } from './arbeit.js';
import { checkBadges, titleOf } from './badges.js';
import { api, serverOn, kiBereit, kiArt, kiNachpruefen } from './api.js';
import { updateLeiste } from './update.js';
import { installKarte, beiInstallWechsel } from './install.js';
import { elternView } from './eltern-ui.js';
import { freischaltLink } from './prolink.js';
import { umzugBeimStart } from './umzug.js';
import { aufLernen } from './ort.js';
import { torStarten, torOffen, elternTor } from './tor.js';
import { hilfeKind, tippKl910, hinweiseStarten } from './hinweise.js';
import { spielHinweis } from './querverweise.js';
import { familieAutomatik } from './familie-sync.js';
import { zaehle, zaehlungStarten, hinweiseBeobachten, linkMitHerkunft, alleAppsKnopf } from './zaehler.js';
import { elternAutomatik } from './eltern.js';
import { theorieKnopf, theorieKnoepfe, hatTheorie } from './theoriefenster.js';
import { settingsView, berichtView, karteiView, dailyGoal, openSteps, levelCard, erfolgeView, formelnView, klasseView, weekCard, readiness, applySkin, applySchrift, lehrplanView } from './extras.js';
// Lernmusik (ab Werk an): In der Android-App startet sie gleich beim Öffnen (die App-Hülle erlaubt Ton ohne Tippen),
// im Browser beim allerersten Tippen oder Klick irgendwo (Browser blockieren Ton davor). Geladen wird sie erst dann (kein Einfluss auf den Start).
{ let beruehrt = typeof window !== 'undefined' && !!window.MTApp, m = null;
  const stimmen = () => { if (!beruehrt || (!m && !klang.musik)) return; (m ? Promise.resolve(m) : import('./musik.js').then((x) => (m = x))).then((x) => x.musikStimmen()).catch(() => {}); };
  const erste = () => { beruehrt = true; removeEventListener('pointerdown', erste, true); removeEventListener('keydown', erste, true); stimmen(); };
  if (typeof window !== 'undefined') { addEventListener('pointerdown', erste, true); addEventListener('keydown', erste, true); document.addEventListener('visibilitychange', stimmen); klang.beobachte(stimmen);
    if (beruehrt) setTimeout(stimmen, 800); } }   // Android: kurz nach dem ersten Bild
// Lernserie: ein eigener kleiner Klang, wenn die Serie heute wächst (nicht im ruhigen Modus – dort gibt es keine Serie).
if (typeof window !== 'undefined') addEventListener('mt-serie', () => { if (!store.ruhig) setTimeout(() => sfx('serie'), 700); });
// Android-App: keine Links zur Website und keine Nachhilfe-Werbung (Regel des Play Store) – stattdessen ein offener Hinweis ohne Link (.nur-app).
if (typeof window !== 'undefined' && window.MTApp) {
  document.documentElement.classList.add('in-app');
  const logo = document.querySelector('a.brand-logo');   // Logo oben: in der App nur Bild, kein Link zur Website
  if (logo) { logo.removeAttribute('href'); logo.removeAttribute('target'); logo.setAttribute('role', 'img'); logo.setAttribute('aria-label', 'Logo Mathenachhilfe Online'); logo.removeAttribute('title'); }
}

const view = $('#view');
let cleanup = null;

function chips() {
  $('#chips').innerHTML =
    `<button class="look" type="button" id="look" aria-pressed="${look.dark}" aria-label="${look.dark ? 'Helles' : 'Dunkles'} Design einschalten">${ICON.moon}${ICON.sun}</button>` +
    `<button class="chip snd" type="button" id="snd" aria-pressed="${sound.on}" aria-label="Ton ${sound.on ? 'ausschalten' : 'einschalten'}">${sound.on ? ICON.speaker : ICON.mute}</button>` +
    (store.ruhig ? '' : `<span class="chip fire" title="Lern-Serie in Tagen">${ICON.fire}${store.streak}</span>`) +
    `<span class="chip xp" title="Punkte">${ICON.bolt}${store.xp}</span>`;
  // Stufe steht unter dem Namen der App: „PRO“ oder „PRO + KI“ (statt „von Mathenachhilfe Online“)
  const unter = document.querySelector('.brand-text small');
  if (unter) { unter.textContent = store.stufe ? (store.stufe === 'proki' ? 'PRO + KI' : 'PRO') : 'von Mathenachhilfe Online'; unter.classList.toggle('stufe', !!store.stufe); unter.id = 'stufe'; }
  $('#snd').onclick = () => { sound.on = !sound.on; chips(); sfx('ok'); };
  $('#look').onclick = () => { look.toggle(); chips(); sfx('tap'); };
}

/** Prüft nach jedem Ereignis auf neue Abzeichen und meldet sie. */
function badgeCheck() {
  const neu = checkBadges();
  if (!neu.length) return;
  sfx('win'); confetti(30);
  toast(neu.length === 1 ? `Neues Abzeichen: ${neu[0].name}` : `${neu.length} neue Abzeichen: ${neu.map((b) => b.name).join(', ')}`, { label: 'Ansehen', run: () => { $('#toast').hidden = true; location.hash = '#/erfolge'; } });
  chips();
}

function nextSpot() {
  // Zuerst dort weiter, wo zuletzt gespielt wurde; sonst der erste offene Schritt.
  // Erst der Prüfungsstoff des gewählten Kurses, danach die Zusatz-Schritte.
  const last = UNITS.find((u) => u.id === store.last);
  if (last) { const i = last.steps.findIndex((s) => !store.isDone(last.id, s.id)); if (i >= 0) return { u: last, i, last: true }; }
  for (const extra of [false, true]) for (const u of UNITS) for (let i = 0; i < u.steps.length; i++) {
    if ((unitExtra(u) || stepExtra(u.steps[i])) === extra && !store.isDone(u.id, u.steps[i].id)) return { u, i };
  }
  return null;
}

const AREA_INFO = {
  analysis: 'Funktionen, Ableitung, Integral',
  stochastik: 'Zufall, Verteilungen, Tests',
  geometrie: 'Vektoren, Geraden, Ebenen',
  pruefung: 'Abi-Modus, Runden, Operatoren',
};
const LERN_AREAS = () => AREAS.filter((a) => a.id !== 'pruefung');
const areaInfo = (a) => a.info || AREA_INFO[a.id] || '';
/** Untere Klassen (5 und 6): verspieltere Optik und Ansprache. */
const jung = () => ['5', '6'].includes(store.jahrgang);
const areaLink = (href, titel, sub) => `<a class="card area" href="${href}"><h3>${esc(titel)}</h3><small>${esc(sub)}</small></a>`;
/** Knöpfe zur Wahl der Klassenstufe (Startseite beim ersten Mal, Seite „Klassenstufe“). */
const jgKnoepfe = () => `<div class="jg-wahl" role="radiogroup" aria-label="Klassenstufe">${JAHRGAENGE.map((j) => `<button class="pick ${store.jahrgangGewaehlt && store.jahrgang === j ? 'sel' : ''}" type="button" role="radio" aria-checked="${store.jahrgangGewaehlt && store.jahrgang === j}" data-jg="${j}">${j === 'os' ? 'Oberstufe' : j}</button>`).join('')}</div>`;
function jgVerdrahten(el, danach) { el.querySelectorAll('[data-jg]').forEach((b) => { b.onclick = () => { store.jahrgang = b.dataset.jg; jahrgangAnwenden(); sfx('ok'); danach(); }; }); }
const areaStat = (area) => {
  const us = UNITS.filter((u) => u.area === area.id).sort((x, y) => (y.grund ? 1 : 0) - (x.grund ? 1 : 0) || (unitExtra(x) ? 1 : 0) - (unitExtra(y) ? 1 : 0));   // Grundlagen zuerst, Zusatz-Stoff zuletzt
  const steps = us.reduce((s, u) => s + u.steps.length, 0), done = us.reduce((s, u) => s + store.unitProgress(u).n, 0);
  return { units: us, n: us.length, doneUnits: us.filter((u) => store.unitProgress(u).done).length, pct: steps ? (done / steps) * 100 : 0 };
};
const areaCard = (area, href = `#/g/${area.id}`) => {
  const s = areaStat(area);
  return `<a class="card area" href="${href}"><h3>${esc(area.title)}</h3><small>${esc(areaInfo(area))}</small>
    <div class="bar"><i style="width:${s.pct}%"></i></div><small class="muted">${s.doneUnits}/${s.n} Einheiten</small></a>`;
};
const unitCard = (u, k) => {
  const p = store.unitProgress(u);
  return `<a class="card unit ${p.done ? 'done' : ''}" href="#/u/${u.id}">
    <span class="num">${p.done ? ICON.check : String(k + 1).padStart(2, '0')}</span>
    <span><h3>${esc(u.title)}</h3><small>${unitExtra(u) ? `<b class="extra">${NICHT_TEXT[store.land]}</b> ` : ''}${esc(u.sub)}</small><div class="bar"><i style="width:${(p.n / p.total) * 100}%"></i></div></span>
    <span class="go">${ICON.right}</span></a>`;
};
const linkCard = (href, num, title, sub) => `<a class="card unit" href="${href}"><span class="num">${num}</span><span><h3>${esc(title)}</h3><small>${sub}</small></span><span class="go">${ICON.right}</span></a>`;
const footer = () => `<footer class="foot">
    <a class="site nur-web" href="${linkMitHerkunft(CONFIG.website, 'fusszeile')}" target="_blank" rel="noopener">Ein Angebot von ${esc(CONFIG.firma)}</a><span class="nur-app">${esc(CONFIG.firma)} · ${esc(CONFIG.website.replace(/^https?:\/\/(www\.)?|\/$/g, ''))}</span>
    <a href="${CONFIG.impressum}" target="_blank" rel="noopener">Impressum</a>
    <a href="${CONFIG.datenschutz}" target="_blank" rel="noopener">Datenschutz</a>
    <span id="ver">Version ${VERSION} · ${STAND}${typeof window.MTApp?.updateStand === 'function' ? ' · hält sich selbst aktuell' : ''}</span></footer>`;

/** Startseite: kurz – weitermachen, was heute ansteht, Gebiet wählen. */
/** Was Pi auf der Startseite sagt: kurz, freundlich, passend zu Tageszeit und Lernstand. Ohne Druck. */
export function piSagt(spot, jetzt = new Date()) {
  const std = jetzt.getHours(), gruss = std < 5 ? 'Noch wach?' : std < 11 ? 'Guten Morgen!' : std < 14 ? 'Hallo!' : std < 18 ? 'Schön, dass du da bist!' : std < 22 ? 'Guten Abend!' : 'Späte Runde?';
  const faellig = store.karteDue().length, tage = store.abiDays();
  const satz = !spot ? (istOber() ? 'Du hast alle Wege frei gemacht. Lust auf den Abi-Drachen?' : `Du hast alles aus ${jgName(store.jahrgang)} geschafft. Stark!`)
    : faellig >= 3 ? `In deiner Fehler-Kartei warten ${faellig} Aufgaben-Arten – fünf Minuten reichen.`
    : istOber() && tage !== null && tage >= 0 && tage <= 30 ? `Noch ${tage} ${tage === 1 ? 'Tag' : 'Tage'} bis zum Abi. Ein Schritt heute zählt.`
    : spot.last ? `Weiter bei „${spot.u.steps[spot.i].title}“?` : `Als Nächstes: „${spot.u.steps[spot.i].title}“.`;
  return `${gruss} ${satz}`;
}
/** Android-App: dem Widget sagen, was als Nächstes dran ist (Klassenstufe, Schritt, Lernserie). Bleibt im Gerät. */
export function widgetMelden(spot = nextSpot()) {
  if (typeof window.MTApp?.widgetStand !== 'function') return;
  try { window.MTApp.widgetStand(store.jahrgang, spot ? spot.u.steps[spot.i].title : '', spot ? `#/u/${spot.u.id}/${spot.i}` : '', store.ruhig ? 0 : store.streak | 0); } catch { /* ältere App-Hülle */ }
}
function home() {
  const spot = nextSpot();
  widgetMelden(spot);
  const started = store.xp > 0;
  const el = h(`<div class="view stack" id="home">
    ${alleAppsKnopf()}
    <section class="hero ${started ? 'klein' : ''}">
      <span class="eyebrow">${istOber() ? 'Oberstufen-Mathe zum Anfassen' : jung() ? `${jgName(store.jahrgang)} · Los geht's!` : 'Mathe zum Anfassen'}</span>
      <h1>${jung() ? 'Mathe zum <br><span class="orange">Ausprobieren.</span>' : 'Verstehen <br>schafft <span class="orange">Sicherheit.</span>'}</h1>
      ${proAbzeichen()}
      ${store.jahrgangGewaehlt ? `<a class="jg-chip" id="jg-chip" href="#/stufe" aria-label="Klassenstufe wechseln">${esc(jgName(store.jahrgang))} <span aria-hidden="true">▾</span></a>` : ''}
      ${started || (jung() && store.jahrgangGewaehlt) ? `<div class="pi-gruss" id="pi-gruss"><span class="pi-fig">${pi()}</span><p class="blase">${esc(started ? piSagt(spot) : 'Hallo, ich bin Pi! Ich zeig dir, wie Mathe funktioniert. Probier einfach aus – falsch machen kannst du nichts.')}</p></div>` : ''}
    </section>
    ${store.jahrgangGewaehlt ? '' : `<section class="card stack jg-frage" id="jg-frage"><h3>Für welche Klasse lernst du?</h3><small class="muted">Du siehst dann genau den Stoff deiner Stufe. Wechseln kannst du jederzeit.</small>${jgKnoepfe()}</section>`}
    <section class="board">
      <div class="board-top"><span>${!started ? 'EMPFOHLENER EINSTIEG' : spot?.last ? 'ZULETZT GESPIELT' : 'NÄCHSTER SCHRITT'}</span><b>● ${spot ? esc(AREAS.find((a) => a.id === spot.u.area).title.toUpperCase()) : 'FERTIG'}</b></div>
      ${spot
        ? `<h2>${esc(spot.u.steps[spot.i].title)}</h2><p>${esc(spot.u.title)} · Schritt ${spot.i + 1} von ${spot.u.steps.length}</p>
           <a class="btn" href="#/u/${spot.u.id}/${spot.i}">${started ? 'Weiter' : 'Erste Runde starten'} ${ICON.right}</a>`
        : `<h2>Alles geschafft!</h2><p>Wiederhole gern eine Runde – die Aufgaben sind jedes Mal neu. ${istOber() ? 'Oder teste dich im Abi-Modus.' : 'Oder schau schon einmal in die nächste Klasse.'}</p>`}
    </section>
    <div id="install-platz"></div>
    <div class="sect"><h2>Was möchtest du üben?</h2></div>
    <section class="areas">${AREAS.map((a) => areaCard(a, a.id === 'pruefung' ? '#/pruefung' : `#/g/${a.id}`)).join('')}${istOber() ? '' : areaLink('#/pruefung', 'Teste dich', 'Arbeitsblatt, Probe-Arbeit, freies Üben')}</section>
    <div id="today" class="stack"></div>
    <section class="cta schmal nur-web">
      <h2>Hängt es an einer Stelle?</h2>
      <div class="row"><a class="btn small" href="${CONFIG.probestunde}" target="_blank" rel="noopener">Gratis Probestunde</a><a class="btn small line site" href="${CONFIG.website}" target="_blank" rel="noopener">Zur Website ↗</a></div>
    </section>
    ${footer()}
  </div>`);
  jgVerdrahten(el, () => route());
  { const k = installKarte('start'); if (k) $('#install-platz', el).append(k); }
  const days = store.abiDays(), due = store.karteDue().length, tb = store.tagBest();
  const today = $('#today', el);
  const tile = (href, num, title, sub) => `<a class="card tile" href="${href}"><span class="num">${num}</span><h3>${esc(title)}</h3><small>${sub}</small></a>`;
  // Abi-Countdown und Lernplan in einer Karte
  if (days !== null && istOber()) {
    const goal = dailyGoal(openSteps(), days), w = planNow();
    today.append(h(`<a class="card count" href="#/plan"><b class="big">${days}</b><span><h3>${days === 1 ? 'Tag' : 'Tage'} bis zum Mathe-Abi</h3><small class="muted">${w?.units.length ? `Diese Woche: ${esc(w.units.map((u) => u.title.replace(/^Grundlagen: /, '')).join(' · '))}` : goal ? `Tagesziel: ${goal} ${goal === 1 ? 'Schritt' : 'Schritte'} im Lernpfad.` : 'Alle Schritte geschafft – jetzt Abi-Modus und Wiederholen.'}</small></span></a>`));
  }
  { const p = arbeitPlan(store.arbeit);
    if (p && p.tage >= 0) ($('.board', el) || today).before(h(`<a class="card count" id="ar-start" href="#/arbeit"><b class="big">${p.tage}</b><span><h3>${p.tage === 0 ? `Heute ist die ${arbeitWort()}` : `${p.tage === 1 ? 'Tag' : 'Tage'} bis zur ${arbeitWort()}`}</h3><small class="muted">${p.tage === 0 ? 'Viel Erfolg!' : p.heute.length ? `Heute dran: ${p.heute.length} ${p.heute.length === 1 ? 'Schritt' : 'Schritte'} – ${esc(p.heute[0].s.title)}${p.heute.length > 1 ? ' …' : ''}` : 'Alle Schritte geschafft – jetzt den Themen-Mix.'}</small></span></a>`)); }
  // Kleine Kacheln nebeneinander statt langer Liste
  const tiles = [];
  if (istOber() && !started && !store.einstufung) tiles.push(tile('#/einstufung/ergebnis', '?', 'Einstufungstest', 'Wo fängst du am besten an?'));
  if (due) tiles.push(tile('#/wiederholen', due, 'Wiederholen', `${due === 1 ? 'Eine Aufgabenart' : `${due} Aufgabenarten`} fällig`));
  if (istOber()) tiles.push(tile('#/tag', ICON.bolt, 'Tages-Runde', tb !== undefined ? `Heute: ${tb} Punkte` : 'Heute für alle gleich'));
  else { tiles.push(tile('#/theorie', '§', 'Nachlesen', 'Jedes Thema kurz erklärt')); tiles.push(tile('#/karten', faellig().length || ICON.check, 'Lernkarten', 'Formeln wiederholen')); }
  if (started && istOber()) tiles.push(tile('#/abenteuer', '⚔', 'Abenteuer', store.n('abenteuerRekord') ? `Rekord: ${store.n('abenteuerRekord')} Punkte` : 'Sieben Räume, ein Drache'));
  if (istOber()) tiles.push(tile('#/karte', `<i class="mini-fig">${pi()}</i>`, 'Karte', 'Die Reise durch Mathea'));
  tiles.length = Math.min(tiles.length, 4);   // die Startseite bleibt kurz: höchstens vier Kacheln, alles Weitere steht in den Reitern
  today.append(h(`<div class="tiles">${tiles.join('')}</div>`));
  if (!store.ruhig) today.append(weekCard(() => { chips(); badgeCheck(); route(); }));
  // Wie bei einer echten App: Zahl am App-Symbol (fällige Wiederholungen), wo das Gerät es kann
  try { if ('setAppBadge' in navigator) { if (due) navigator.setAppBadge(due); else navigator.clearAppBadge(); } } catch { /* nicht überall erlaubt */ }
  return el;
}

/** Klassenstufe wählen oder wechseln. Der Fortschritt jeder Stufe bleibt erhalten. */
function stufeView() {
  const zeile = (j) => { const us = ALLE_UNITS.filter((u) => jgVon(u) === j), fertig = us.filter((u) => store.unitProgress(u).done).length; return `<small class="muted">${j === 'os' ? 'Oberstufe' : `Klasse ${j}`}: ${fertig}/${us.length} Einheiten</small>`; };
  const el = h(`<div class="view stack">
    <a class="back" href="#/">${ICON.left} Start</a>
    <div><span class="eyebrow">Klassenstufe</span><h1 style="margin-top:8px">Für welche Klasse lernst du?</h1><p class="lead" style="margin-top:8px">Der Mathe-Trainer zeigt dir genau den Stoff deiner Stufe – von Klasse 5 bis zum Abitur.</p></div>
    <section class="card stack">${jgKnoepfe()}<small class="muted">Du kannst jederzeit wechseln. Was du in einer Stufe geschafft hast, bleibt gespeichert.</small></section>
    <section class="card stack"><h3>Dein Stand</h3>${JAHRGAENGE.map(zeile).join('')}</section>
  </div>`);
  jgVerdrahten(el, () => { location.hash = '#/'; });
  return el;
}

/** „Teste dich“ in der Mittelstufe: Arbeitsblatt, Probe-Arbeit, freies Üben. (Abi-Modus und Co. gibt es nur in der Oberstufe.) */
const dungeonKarte = () => linkCard('#/dungeon', 'x=', 'Formel-Dungeon', store.n('dungeonRekord') ? `Gleichungen und Formeln umstellen · Rekord ${store.n('dungeonRekord')}` : 'Gleichungen und Formeln umstellen – Schritt für Schritt, Stockwerk für Stockwerk.');
const kopfKarte = () => linkCard('#/kopf', '1·1', 'Kopfrechen-Arena', knobelHeuteGeloest() ? '60 Sekunden Einmaleins, Plus, Minus und mehr.' : '60 Sekunden rechnen – und die Knobelaufgabe des Tages wartet.');
const arbeitWort = () => (istOber() ? 'Klausur' : 'Klassenarbeit');
function arbeitKarte() {
  const p = arbeitPlan(store.arbeit);
  return linkCard('#/arbeit', p && p.tage >= 0 ? p.tage : ICON.star, `${arbeitWort()}s-Trainer`, !p ? 'Termin und Themen eintragen – die App macht den Plan.' : p.tage < 0 ? 'Geschrieben! Jetzt die nächste planen.' : p.tage === 0 ? 'Heute ist es so weit – viel Erfolg!' : `Noch ${p.tage} ${p.tage === 1 ? 'Tag' : 'Tage'} · ${p.heute.length ? `heute ${p.heute.length} ${p.heute.length === 1 ? 'Schritt' : 'Schritte'}` : 'alles geschafft, jetzt wiederholen'}`);
}
/** Seiten, die nur zur Oberstufe gehören (Abi-Inhalte). In Klasse 5 bis 10 führt ihr Aufruf zu „Testen“. */
export const NUR_OBERSTUFE = ['abi', 'tag', 'duell', 'blitz', 'aufgabe', 'plan', 'abenteuer', 'karte', 'einstufung', 'lehrplan'];
function testeDichView() {
  return h(`<div class="view stack">
    <div><span class="eyebrow">Testen · ${esc(jgName(store.jahrgang))}</span><h1 style="margin-top:8px">Zeig, was sitzt</h1></div>
    <section class="stack">
      ${arbeitKarte()}
      ${dungeonKarte()}
      ${kopfKarte()}
      ${linkCard('#/blatt', 'PDF', 'Arbeitsblatt und Probe-Arbeit', 'Themen wählen, in der App lösen oder drucken – mit Lösungsblatt.')}
      ${LERN_AREAS().map((a) => linkCard(`#/ueben/${a.id}`, '10', `${esc(a.title)} gemischt`, 'Zehn Aufgaben quer durch das Gebiet – immer neu.')).join('')}
      ${linkCard('#/wiederholen', store.karteDue().length || ICON.check, 'Fehler-Kartei', 'Was schiefging, kommt hier wieder – bis es sitzt.')}
      ${linkCard('#/karten', faellig().length || ICON.check, 'Lernkarten', 'Formeln und eigene Karten wiederholen.')}
    </section>
  </div>`);
}

/** Lernen: erst das Gebiet wählen. */
function lernenView() {
  const el = h(`<div class="view stack">
    ${alleAppsKnopf()}
    <div><span class="eyebrow">Lernen · ${esc(jgName(store.jahrgang))}</span><h1 style="margin-top:8px">Wähle ein Gebiet</h1></div>
    <section class="stack">${LERN_AREAS().map((a) => { const s = areaStat(a); return linkCard(`#/g/${a.id}`, `<i class="pct">${Math.round(s.pct)} %</i>`, a.title, `${esc(areaInfo(a))} · ${s.doneUnits}/${s.n} Einheiten`); }).join('')}</section>
    <section class="stack">${dungeonKarte()}${linkCard('#/theorie', '§', 'Theorie nachlesen', istOber() ? 'Jedes Thema kurz erklärt – und ausführlich mit Beispielen, zum Drucken.' : 'Jedes Thema kurz erklärt – zum Nachschlagen und Drucken.')}</section>
    ${istOber() ? '' : `<section class="stack"><div class="card unit soon"><span class="num">+</span><span><h3>Kommt bald in ${esc(jgName(store.jahrgang))}</h3><small>${esc(baldHier().join(' · '))}</small></span><span></span></div>${linkCard('#/stufe', '⇄', 'Klassenstufe wechseln', 'Stoff einer anderen Klasse ansehen – dein Fortschritt bleibt erhalten.')}</section>`}
    ${!istOber() ? '' : `<section class="stack">${linkCard('#/karte', `<i class="mini-fig">${pi()}</i>`, 'Karte: Die Reise durch Mathea', 'Der ganze Lernpfad als Landkarte – mit Pi und den Wächtern.')}</section>
    <section class="stack">${linkCard('#/einstufung/ergebnis', '?', store.einstufung ? 'Deine Einstufung' : 'Einstufungstest', store.einstufung ? 'Ergebnis ansehen oder Test wiederholen.' : 'Zwölf Aufgaben, fünf Minuten: Wo fängst du am besten an?')}</section>`}
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
    <div><span class="eyebrow">${s.doneUnits}/${s.n} Einheiten · Schwierigkeit ${LEVELS[store.level - 1]}</span><h1 style="margin-top:8px">${esc(area.title)}</h1><p class="lead" style="margin-top:8px">${esc(areaInfo(area))}</p></div>
    <section class="stack">${s.units.map(unitCard).join('')}</section>
    <div class="sect"><h2>Freies Üben</h2></div>
    <section class="stack">
      ${GRUND[area.id] ? linkCard(`#/ueben/${area.id}-grund`, '10', 'Grundlagen üben', 'Zehn gemischte Aufgaben zu den Grundlagen – immer neu.') : ''}
      ${linkCard(`#/ueben/${area.id}`, '10', `${esc(area.title)} gemischt`, 'Zehn Aufgaben quer durch das ganze Gebiet – immer neu.')}
      ${area.soon.length ? `<div class="card unit soon"><span class="num">+</span><span><h3>Kommt bald</h3><small>${esc(area.soon.join(' · '))}</small></span><span></span></div>` : ''}</section>
  </div>`);
}

/** Prüfung: alles, was auf Zeit und auf das Abi vorbereitet. */
function pruefungView() {
  if (!istOber()) return testeDichView();
  const ex = store.exams[0], tb = store.tagBest(), best = store.best(1)[0];
  const area = AREAS.find((a) => a.id === 'pruefung');
  return h(`<div class="view stack">
    <div><span class="eyebrow">Prüfung</span><h1 style="margin-top:8px">Zeig, was sitzt</h1></div>
    <section class="card stack ready"><div class="row"><h3 class="grow">Abi-bereit</h3><b class="orange" id="rd-pct">${readiness()} %</b></div>
      <div class="bar big"><i style="width:${readiness()}%"></i></div><small class="muted">Aus Lernpfad, Trefferquote und bestem Abi-Modus-Ergebnis – eine Orientierung.</small></section>
    <section class="stack">
      ${linkCard('#/abi', 'A·B', 'Abi-Modus', ex ? `Zuletzt: ${ex.np} Notenpunkte (Teil ${esc(ex.part)})` : 'Auf Zeit, ohne Tipps, mit Punkte-Prognose.')}
      ${linkCard('#/blatt', 'PDF', 'Arbeitsblatt und Probeklausur', 'Themen wählen, in der App lösen oder drucken – mit Lösungsblatt.')}
      ${linkCard('#/aufgabe', 'a–e', 'Abi-Aufgabe am Stück', 'Ein Sachverhalt, mehrere Teilaufgaben – wie in der Prüfung.')}
      ${linkCard('#/tag', ICON.bolt, 'Tages-Runde', tb !== undefined ? `Heute: ${tb} Punkte` : 'Sechs Aufgaben, heute für alle gleich.')}
      ${linkCard('#/abenteuer', `<i class="mini-fig">${figurFor('Der Abi-Drache', 'Abi', { form: 'zack', farbe: ['#ff7418', '#d85042'], horn: 1 })}</i>`, 'Abenteuer', store.n('abenteuerRekord') ? `Dein Rekord: ${store.n('abenteuerRekord')} Punkte` : 'Sieben Räume, Belohnungen, am Ende der Abi-Drache.')}
      ${dungeonKarte()}
      ${kopfKarte()}
      ${arbeitKarte()}
      ${linkCard('#/blitz', '60', 'Blitz-Runde', store.n('blitzRekord') ? `Dein Rekord: ${store.n('blitzRekord')} Punkte` : '60 Sekunden, Kombo-Faktor, so viele wie möglich.')}
      ${linkCard('#/duell', 'VS', 'Duell', best ? `Dein Bestwert: ${best.score} Punkte` : 'Fordere Mitschüler per Link heraus.')}
      ${serverOn() ? linkCard('#/klasse', ICON.star, 'Klassen-Rangliste', store.klasse ? `Klasse ${esc(store.klasse.code)}` : 'Mit einem Code gemeinsam antreten.') : ''}
      <div id="pf-ki"></div>
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
      ${!istOber() ? '' : linkCard('#/pro', 'PRO', store.stufe ? (store.stufe === 'proki' ? 'Deine Stufe: Pro + KI' : 'Deine Stufe: Pro') : 'Pro und Pro + KI', store.stufe ? 'Was freigeschaltet ist und bis wann.' : 'Was die Pro-Fassung zusätzlich kann.')}
      ${linkCard('#/karten', faellig().length || ICON.check, 'Lernkarten', 'Formeln und eigene Karten – wiederholt in wachsenden Abständen.')}
      ${linkCard('#/erfolge', ICON.star, 'Erfolge', `${titleOf().title} · ${Object.keys(store.badges).length} Abzeichen`)}
      ${istOber() ? linkCard('#/plan', ICON.right, 'Lernplan bis zum Abi', store.abi ? 'Was diese Woche dran ist.' : 'Abi-Termin eintragen – die App verteilt den Stoff auf die Wochen.') : linkCard('#/stufe', '⇄', 'Klassenstufe', `${jgName(store.jahrgang)} – wechseln, wenn du etwas anderes üben willst.`)}
      ${linkCard('#/zertifikat', ICON.check, 'Zertifikate', 'Für jedes geschaffte Gebiet – zum Ausdrucken.')}
      ${linkCard('#/formeln', '∑', 'Formelsammlung', 'Jede abgeschlossene Einheit schaltet Formelkarten frei.')}
      ${linkCard('#/bericht', 'B', 'Bericht für Eltern', 'Lernstand zum Drucken oder Teilen.')}
      ${linkCard('#/eltern', '♥', 'Eltern-Handy koppeln', 'Eltern sehen Fortschritt und Problemstellen auf dem eigenen Handy – ohne Konto, verschlüsselt.')}
      ${linkCard('#/einstellungen', ICON.gear, 'Einstellungen', istOber() ? `Schwierigkeit ${LEVELS[store.level - 1]} · Bundesland · Abi-Termin` : `${jgName(store.jahrgang)} · Schwierigkeit ${LEVELS[store.level - 1]} · Schrift`)}
    </section>
    <div id="install"></div>
    <section class="cta nur-web">
      <h2>Persönliche Nachhilfe</h2>
      <p>Wenn es an einem Thema länger hakt: In einer kostenlosen Probestunde klären wir gemeinsam, was hilft.</p>
      <a class="btn" href="${CONFIG.probestunde}" target="_blank" rel="noopener">Gratis Probestunde ${ICON.right}</a>
      <a class="btn line site" href="${CONFIG.website}" target="_blank" rel="noopener">Zur Website ↗</a>
    </section>
    <section class="card stack nur-app" id="wer"><h3>Wer steckt dahinter?</h3><p>Den Mathe-Trainer macht ${esc(CONFIG.firma)}. Dort gibt es auch persönliche Mathe-Nachhilfe – online, eins zu eins. Mehr dazu unter ${esc(CONFIG.website.replace(/^https?:\/\/(www\.)?|\/$/g, ''))}.</p></section>
    ${footer()}
  </div>`);
  { const k = installKarte('mehr'); if (k) $('#install', el).append(k); }
  return el;
}

function unitView(u) {
  const area = AREAS.find((a) => a.id === u.area);
  const el = h(`<div class="view stack">
    <a class="back" href="${u.area === 'pruefung' ? '#/pruefung' : `#/g/${u.area}`}">${ICON.left} ${esc(area.title)}</a>
    <div><span class="eyebrow">${esc(area.title)}</span><h1 style="margin-top:8px">${esc(u.title)}</h1><p class="lead" style="margin-top:8px">${esc(u.sub)}</p></div>
    ${u.why ? `<details class="card why"><summary>Wo brauche ich das?</summary><p>${esc(u.why)}</p></details>` : ''}
    <div class="steps"></div>
    ${u.area === 'pruefung' ? '' : `<a class="btn ghost block" id="u-theorie" href="#/theorie/${u.id}">Theorie zu diesem Thema nachlesen</a>`}
  </div>`);
  u.steps.forEach((s, i) => {
    const st = store.stars(u.id, s.id);
    $('.steps', el).append(h(`<a class="card step ${st !== undefined ? 'done' : ''}" href="#/u/${u.id}/${i}">
      <b class="n">${st !== undefined ? ICON.check : i + 1}</b>
      <span><span class="kind">${esc(s.kind)}${unitExtra(u) || stepExtra(s) ? ` · <b class="extra">${NICHT_TEXT[store.land]}</b>` : ''}</span><h3>${esc(s.title)}</h3></span>
      ${st !== undefined ? starsHtml(st) : `<span class="muted">${ICON.right}</span>`}</a>`));
  });
  return el;
}

function stepView(u, i) {
  const s = u.steps[i];
  const el = h(`<div class="view">
    <div class="stephead"><a class="x" href="#/u/${u.id}" aria-label="Schließen">${ICON.close}</a><div class="prog"><i></i></div>${theorieKnopf(u)}</div>
    <div id="stage"></div>
  </div>`);
  const bar = $('.prog i', el);
  const ctx = {
    progress: (f) => { bar.style.width = `${Math.round(Math.max(0, Math.min(1, f)) * 100)}%`; },
    done: (res) => finish(u, i, res),
    mitTheorie: hatTheorie(u),   // der Knopf steht schon oben – die Aufgaben brauchen keinen eigenen
  };
  theorieKnoepfe(el);
  queueMicrotask(() => { cleanup = s.run($('#stage', el), ctx) || null; });
  return el;
}

function finish(u, i, res) {
  const s = u.steps[i];
  const stars = Math.max(0, Math.min(3, res.stars ?? 3));
  const before = titleOf().title;
  const r = store.complete(u.id, s.id, stars);
  widgetMelden();
  if (store.level >= 5) store.bump('stufe5');
  const after = titleOf().title;
  chips();
  const nextI = i + 1 < u.steps.length ? i + 1 : null;
  const unitDone = store.unitProgress(u).done && nextI === null;
  const sheet = $('#sheet');
  sheet.innerHTML = `<div class="sheet-in" role="dialog" aria-modal="true" aria-label="Schritt geschafft">
    ${starsHtml(stars)}
    <small class="muted">Schwierigkeit: ${LEVELS[store.level - 1]}</small>
    <h2>${unitDone ? 'Einheit geschafft!' : stars === 3 ? 'Stark!' : 'Geschafft!'}</h2>
    ${after !== before ? `<div class="note ok"><b>Neuer Titel:</b> ${esc(after)}</div>` : ''}
    ${unitDone && u.formeln?.length ? `<div class="note tip"><b>${u.formeln.length} ${u.formeln.length === 1 ? 'Formelkarte' : 'Formelkarten'} freigeschaltet.</b> <a href="#/formeln">Zur Formelsammlung</a></div>` : ''}
    <div class="gain"><span class="chip xp">${ICON.bolt}+${r.gain} Punkte</span>${store.ruhig ? '' : `<span class="chip fire">${ICON.fire}${r.streak} ${r.streak === 1 ? 'Tag' : 'Tage'} in Folge</span>`}</div>
    ${(res.mistakes ?? 0) >= 3 ? `${hilfeKind()}${tippKl910()}` : ''}
    ${spielHinweis(s)}
    <a class="btn block" id="sh-go" href="${nextI !== null ? `#/u/${u.id}/${nextI}` : u.area === 'pruefung' ? '#/pruefung' : `#/g/${u.area}`}">${nextI !== null ? `Weiter: ${esc(u.steps[nextI].title)}` : 'Zur Übersicht'}</a>
    ${nextI !== null ? `<a class="btn ghost block" href="#/u/${u.id}">Zur Übersicht</a>` : ''}
  </div>`;
  sheet.hidden = false;
  sfx('win'); if (stars >= 2) confetti(unitDone ? 60 : 32);
  $('#sh-go', sheet).focus();
  setTimeout(badgeCheck, 900);
}

/** Freies Üben: zehn gemischte Aufgaben eines Gebiets, auf Wunsch nur Grundlagen. Ohne Ende – jede Runde ist neu. */
function uebenView(area, nurGrund) {
  const N = 10, gens = practiceGens(area.id, nurGrund), back = `#/g/${area.id}`;
  const el = h(`<div class="view">
    <div class="stephead"><a class="x" href="${back}" aria-label="Schließen">${ICON.close}</a><div class="prog"><i></i></div></div>
    <div id="stage"></div>
  </div>`);
  const bar = $('.prog i', el);
  let right = 0;
  const ctx = {
    progress: (f) => { bar.style.width = `${Math.round(f * 100)}%`; },
    done: (res) => {
      const mistakes = res.mistakes ?? 0, gain = 10 + 2 * right;
      store.bonus(gain); store.touch(); store.bump('ueben'); chips();
      const sheet = $('#sheet');
      sheet.innerHTML = `<div class="sheet-in" role="dialog" aria-modal="true" aria-label="Runde geschafft">
        ${starsHtml(res.stars ?? 1)}
        <small class="muted">${nurGrund ? 'Grundlagen' : esc(area.title)} · Schwierigkeit: ${LEVELS[store.level - 1]}</small>
        <h2>${right} von ${N} auf Anhieb</h2>
        <div class="gain"><span class="chip xp">${ICON.bolt}+${gain} Punkte</span></div>
        ${mistakes >= 4 ? `${hilfeKind()}${tippKl910()}` : ''}
        <button class="btn block" id="sh-go" type="button">Noch eine Runde</button>
        <a class="btn ghost block" href="${back}">Zur Übersicht</a></div>`;
      sheet.hidden = false; sfx('win'); if ((res.stars ?? 1) >= 2) confetti(32);
      $('#sh-go', sheet).onclick = () => { sheet.hidden = true; route(); };
      setTimeout(badgeCheck, 900);
    },
  };
  const run = quiz(Array(N).fill(mixOf([gens])), { onRight: () => { right++; } });
  queueMicrotask(() => { cleanup = run($('#stage', el), ctx) || null; });
  return el;
}

/** Theorie wird erst beim Öffnen geladen (schnellerer Start). Solange steht ein kurzer Hinweis da. */
function theorieSpaeter(teil) {
  const el = h('<div class="view stack" id="theorie-laedt"><section class="card"><p>Die Theorie wird geladen …</p></section></div>'), hier = location.hash;
  import('./theorie.js').then((m) => { if (el.isConnected && location.hash === hier) { const r = m.theorieView(teil); el.replaceWith(r.el); cleanup = r.cleanup || null; formelnEinpassen(); } })
    .catch(() => { if (el.isConnected) el.innerHTML = '<section class="card stack"><h2>Die Theorie konnte nicht geladen werden</h2><p>Prüfe kurz die Internet-Verbindung und versuche es noch einmal.</p><a class="btn block" href="#/lernen">Zurück</a></section>'; });
  return { el };
}

/** Formel-Dungeon: wird erst beim Betreten geladen. */
function dungeonSpaeter(after) {
  const el = h('<div class="view stack" id="dungeon-laedt"><section class="card"><p>Der Formel-Dungeon wird geladen …</p></section></div>'), hier = location.hash;
  let innen = null;
  import('./dungeon.js').then((m) => { if (el.isConnected && location.hash === hier) { const r = m.dungeonView(after); el.replaceWith(r.el); innen = r.cleanup || null; } })
    .catch(() => { if (el.isConnected) el.innerHTML = '<section class="card stack"><h2>Der Formel-Dungeon konnte nicht geladen werden</h2><p>Prüfe kurz die Internet-Verbindung und versuche es noch einmal.</p><button class="btn block" id="dg-neu" type="button">Noch einmal versuchen</button></section>', el.querySelector('#dg-neu')?.addEventListener('click', () => location.reload()); });
  return { el, cleanup: () => innen?.() };
}

/** Seiten ohne Aufgaben: Sie erscheinen sofort, auch wenn die Aufgaben-Erzeuger noch im Hintergrund laden. */
const OHNE_AUFGABEN = ['', '#/', '#/lernen', '#/pruefung', '#/mehr', '#/stufe', '#/dungeon'];
/** Alle anderen Seiten warten kurz, bis die Aufgaben da sind (beim ersten Start; danach liegen sie im Offline-Speicher). */
function warteAufAufgaben(hash) {
  cleanup?.(); cleanup = null;
  const el = h(`<div class="view stack"><section class="card stack" id="auf-lade" role="status"><h3>Aufgaben werden geladen …</h3><p class="muted">Einen Moment – beim ersten Start dauert das kurz.</p></section></div>`);
  view.replaceChildren(el); chips(); nav();
  ladeAufgaben().then(() => { if (location.hash === hash) route(); }, () => {
    if (!el.isConnected) return;
    el.querySelector('#auf-lade').innerHTML = '<h3>Die Aufgaben konnten nicht geladen werden</h3><p class="muted">Prüfe deine Verbindung und versuche es noch einmal.</p><button class="btn" id="auf-neu" type="button">Noch einmal versuchen</button>';
    el.querySelector('#auf-neu').addEventListener('click', () => location.reload());   // der Browser merkt sich ein gescheitertes Nachladen – nur ein Neuladen der Seite holt die Teile wirklich neu
  });
}
function route() {
  const hash = location.hash;
  if (!aufgabenDa() && !OHNE_AUFGABEN.includes(hash)) { warteAufAufgaben(hash); return; }
  try { routeBau(); } catch (e) { if (e instanceof NichtGeladen) warteAufAufgaben(hash); else throw e; }
}
function routeBau() {
  cleanup?.(); cleanup = null; klang.pruefungLaeuft = false;   // eine Prüfung schaltet das beim Start selbst wieder ein
  $('#sheet').hidden = true;
  const hash = location.hash;
  // Eltern-Tor (ELTERN-TOR.md): Elternbereich (Kopplung, Familie), Elternbericht und Klassen-Code/Kamera erst nach der Rechenaufgabe; Abbrechen führt zur Startseite.
  if (/^#\/(eltern|klasse|bericht)\b/.test(hash) && !torOffen()) {
    view.replaceChildren(h('<div class="view stack"><section class="card stack"><h2>Für Eltern</h2><p class="muted">Dieser Bereich ist für Eltern.</p></section></div>'));
    elternTor('Dieser Bereich ist für Eltern.').then((ok) => { if (location.hash !== hash) return; if (ok) routeBau(); else location.replace('#/'); });
    return;
  }
  const m = hash.match(/^#\/u\/([\w-]+)(?:\/(\d+))?$/);
  const u = m && UNITS.find((x) => x.id === m[1]);
  const x = hash.match(/^#\/(abi|tag|duell|blitz|bericht|eltern|einstellungen|wiederholen|erfolge|formeln|klasse|lehrplan|einstufung|aufgabe|plan|zertifikat|abenteuer|karte|theorie|karten|kiaufgabe|pro|kopf|arbeit|dungeon)(?:\/([\w-]+))?$/);
  const gm = hash.match(/^#\/g\/(\w+)$/), g = gm && LERN_AREAS().find((a) => a.id === gm[1]);
  const pm = hash.match(/^#\/ueben\/(\w+?)(-grund)?$/), pa = pm && LERN_AREAS().find((a) => a.id === pm[1]);
  const bm = hash.match(/^#\/blatt(?:\/([\w.\-/]+))?$/);
  let el;
  if (bm) { const r = blattView(bm[1]); el = r.el; cleanup = r.cleanup || null; }
  else if (u && m[2] !== undefined && u.steps[+m[2]]) el = stepView(u, +m[2]);
  else if (u) el = unitView(u);
  else if (x && !istOber() && NUR_OBERSTUFE.includes(x[1])) { location.replace('#/pruefung'); return; }   // alte Links und Lesezeichen: Diese Seiten gibt es nur in der Oberstufe
  else if (x) {
    const after = () => { chips(); setTimeout(badgeCheck, 600); };
    const r = { abi: () => abiView(['A', 'B'].includes(x[2]) ? x[2] : null, after), tag: () => rundeView('tag', undefined, (res) => { after(); meldeTag(res); }), duell: () => rundeView('duell', x[2], after), blitz: () => blitzView(after),
      bericht: berichtView, eltern: elternView, einstellungen: settingsView, wiederholen: karteiView, erfolge: erfolgeView, formeln: formelnView, klasse: klasseView, lehrplan: lehrplanView,
      einstufung: () => (x[2] === 'ergebnis' ? einstufungErgebnis() : einstufungView()), aufgabe: () => verbundView(x[2]), plan: planView, zertifikat: () => zertifikatView(x[2]), abenteuer: () => abenteuerView(after), karte: karteView, theorie: () => theorieSpaeter(x[2]), karten: kartenView, kiaufgabe: kiAufgabeView, pro: proView, kopf: () => kopfView(after), arbeit: () => arbeitView(after), dungeon: () => dungeonSpaeter(after) }[x[1]]();
    el = r.el; cleanup = r.cleanup || null;
  } else if (hash === '#/stufe') el = stufeView();
  else if (hash === '#/lernen') el = lernenView();
  else if (hash === '#/pruefung') {
    el = pruefungView();
    // KI-Aufgaben: Der Einstieg erscheint nur dort, wo der Server sie anbietet.
    const platz = el.querySelector('#pf-ki');
    kiBereit().then(() => { if (platz?.isConnected && kiArt('aufgabe')) platz.innerHTML = linkCard('#/kiaufgabe', 'KI', 'KI-Aufgaben', 'Immer neue Aufgaben im Abi-Stil – vom Server nachgerechnet. Gehört zu Pro + KI.'); });
  }
  else if (hash === '#/mehr') el = mehrView();
  else if (g) el = areaView(g);
  else if (pa) el = uebenView(pa, !!pm[2]);
  else el = home();
  view.replaceChildren(el);
  document.documentElement.toggleAttribute('data-jung', jung());
  chips(); nav();
  window.scrollTo(0, 0);
}

/** Mit Server und Klasse: Ergebnis der Tages-Runde melden (der Server rechnet nach). */
function meldeTag(res) {
  if (!serverOn() || !store.klasse || !res) return;
  api.melden({ art: 'tag', code: store.klasse.code, spieler: store.klasse.spieler, tag: res.seed, stufe: res.lv, antworten: res.answers, sekunden: res.secs, punkte: res.score });
}

/** Untere Menüleiste: zeigt, wo man ist; verschwindet, solange gespielt wird. */
function nav() {
  const hash = location.hash || '#/';
  const um = hash.match(/^#\/u\/([\w-]+)/), unit = um && UNITS.find((x) => x.id === um[1]);
  const tab = unit ? (unit.area === 'pruefung' ? 'pruefung' : 'lernen')
    : /^#\/(lernen|g\/|ueben\/|einstufung|karte|theorie)/.test(hash) ? 'lernen' : /^#\/(pruefung|abi|tag|duell|blitz|klasse|aufgabe|abenteuer|blatt|kiaufgabe|kopf|arbeit|dungeon)/.test(hash) ? 'pruefung' : /^#\/(mehr|bericht|einstellungen|wiederholen|erfolge|formeln|lehrplan|plan|zertifikat|karten|pro)/.test(hash) ? 'mehr' : 'start';
  document.querySelectorAll('#nav a').forEach((a) => { const on = a.dataset.tab === tab; a.classList.toggle('on', on); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  { const pf = document.querySelector('#nav a[data-tab="pruefung"] span'); if (pf) pf.textContent = istOber() ? 'Prüfung' : 'Testen'; }
  $('#nav').hidden = !!view.querySelector('.stephead');
  tint();
}
/** Farbe der Android-Statusleiste: wie die Kopfzeile bzw. der Seitenhintergrund (hell oder dunkel). */
function tint() {
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', look.dark ? '#0b1330' : '#ffffff');
}
window.addEventListener('mt-look', () => queueMicrotask(tint));
window.addEventListener('mt-ruhig', () => chips());
new MutationObserver(() => { $('#nav').hidden = !!view.querySelector('.stephead'); }).observe(view, { childList: true, subtree: true });
look.follow(); applySkin(); applySchrift(); initMelden();
window.addEventListener('hashchange', route);
// Zurück aus dem Shop (KI dazugebucht): beim Wiederkommen den Code neu prüfen und KI sofort freischalten.
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') kiNachpruefen().then((neu) => { if (neu) { toast('KI ist freigeschaltet.'); route(); } }).catch(() => {}); });
elternAutomatik();   // gekoppeltes Eltern-Handy: Bericht und Sicherung nach jeder Lern-Sitzung (höchstens alle 10 Minuten)
beiInstallWechsel(() => { if (['#/mehr', '', '#/', '#/einstellungen'].includes(location.hash)) route(); });   // „App installieren“ (install.js)
// Anonyme Nutzungszählung (abschaltbar in den Einstellungen): „start“, Links mit Herkunft, Nachhilfe-Hinweise, Eltern-Seite, Theorie
hinweiseStarten(window, (t) => toast(t));
familieAutomatik();
torStarten();   // Eltern-Tor vor Links nach außen und [data-tor] – vor der Zählung (Fenster, Erfassungsphase)
zaehlungStarten(() => { const m = /^#\/(?:u|theorie)\/([\w-]+)/.exec(location.hash), u = m && ALLE_UNITS.find((x) => x.id === m[1].replace(/-lang$/, ''));
  return { klasse: store.jahrgang, unitTitel: u ? u.title : '', ober: istOber() }; });
window.addEventListener('hashchange', () => { if (/^#\/theorie\/[\w-]+/.test(location.hash)) zaehle('theorie'); });
if (/^#\/theorie\/[\w-]+/.test(location.hash)) zaehle('theorie');
hinweiseBeobachten();
freischaltLink((text) => toast(text));
// Umzug auf lernen.mathenachhilfe-online.com/mathetrainer/ (19.11.2026): alte Adresse → einpacken und weiterleiten,
// neue Adresse → mitgebrachten Lernstand übernehmen. Lokal und in Tests passiert nichts.
let umzugBox = null;
umzugBeimStart({ toast: (t) => toast(t), warten: (an) => {
  if (an && !umzugBox) { umzugBox = h('<div class="umzug-hinweis" role="status"><div class="card stack"><h3>Wir ziehen um …</h3><p>Der Mathe-Trainer bekommt eine neue Adresse. Dein Fortschritt kommt mit – einen Moment.</p></div></div>'); document.body.append(umzugBox); }
  if (!an && umzugBox) { umzugBox.remove(); umzugBox = null; }
}, hinweis: (los) => {
  const box = h(`<div class="umzug-hinweis" role="dialog" aria-label="Neue Adresse"><div class="card stack"><h3>Der Mathe-Trainer ist umgezogen</h3>
    <p>Neue Adresse: <b>lernen.mathenachhilfe-online.com/mathetrainer</b>. Dein Fortschritt kommt mit.</p>
    <p class="muted">Danach bitte die App vom Home-Bildschirm löschen und an der neuen Adresse neu installieren.</p>
    <button class="btn block" type="button">Zur neuen Adresse</button></div></div>`);
  box.querySelector('button').onclick = () => { box.remove(); los(); };
  document.body.append(box);
} }).catch(() => {});   // #pro=CODE (neu) bzw. ?pro=CODE (alte Mails): sofort aus der Adresse, dann einlösen
route();
// Startanimation: sobald die erste Ansicht steht, zoomt das Logo heraus (höchstens 4 s – dann blendet das CSS von selbst aus); danach Element entfernen.
{ const sp = document.getElementById('splash'), t0 = Date.now();
  const raus = () => { if (!sp.isConnected) return; if (!aufgabenDa() && Date.now() - t0 < 3600) { setTimeout(raus, 100); return; } requestAnimationFrame(() => requestAnimationFrame(() => { sp.classList.add('ende'); setTimeout(() => sp.remove(), 1300); })); };
  if (sp) raus(); }
window.__mtGestartet?.();
ladeAufgaben().catch(() => {});   // Aufgaben-Erzeuger (rund 1,5 MB) gleich nach dem ersten Bild im Hintergrund holen
// Die Theorie-Kapitel (rund 150 kB) braucht der erste Bildschirm nicht: Sie werden erst danach in Ruhe geholt.
(window.requestIdleCallback || ((f) => setTimeout(f, 2500)))(() => { import('./theorie.js').catch(() => {}); });   // Start-Wache (wache.js): Die App läuft
// Zu breite Formeln einpassen – nach jedem Umbau der Seite und wenn sich die Breite ändert.
{ let dran = false; const los = () => { if (dran) return; dran = true; requestAnimationFrame(() => { dran = false; formelnEinpassen(); }); };
  new MutationObserver(los).observe(document.body, { childList: true, subtree: true });
  const neu = () => { document.querySelectorAll('.katex-display').forEach((e) => { delete e.dataset.fit; }); los(); };
  window.addEventListener('resize', neu);
  document.fonts?.addEventListener?.('loadingdone', neu);   // Formel-Schriften kommen später – dann stimmt die Breite erst
  los(); }
// Android-App: Hinweis, wenn sie sich neue Inhalte geholt hat (siehe update.js).
if (window.MTApp) document.getElementById('view').before(updateLeiste());

// Offline-Fähigkeit und automatische Updates.
// In der Offline-App (Android) sind alle Dateien fest eingepackt – dort braucht es keinen Service Worker.
// Die Web-App aktualisiert sich von selbst, ohne Knopf (Marcel, 15.11.2026): Eine neue Fassung wird im Hintergrund geladen
// und übernommen, sobald gerade keine Aufgabe und kein Spiel läuft – mittendrin wird nie neu geladen.
// Vorlesen ist abgeschaltet (Marcel 18.11.2026): früher geladene Nova-Dateien im Gerät aufräumen.
if (!VORLESEN) { try { if (!aufLernen()) globalThis.caches?.delete('stimme-nova').catch(() => {}); globalThis.caches?.delete('stimme-mathetrainer').catch(() => {}); } catch { /* ohne Cache Storage */ } }   // alter Name nur auf der alten Adresse (dort gehört er sicher uns)
// Nach dem automatischen Neuladen kurz sagen, was jetzt läuft.
try { const alt = sessionStorage.getItem('mathetrainer-alte-version'); sessionStorage.removeItem('mathetrainer-alte-version'); if (alt && alt !== VERSION) setTimeout(() => toast(`Neue Version ${VERSION} geladen.`), 800); } catch { /* ohne sessionStorage */ }
if (!window.MTApp && 'serviceWorker' in navigator && (location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(location.hostname))) {
  let hadController = !!navigator.serviceWorker.controller;
  const mittendrin = () => !!view.querySelector('.stephead') || !$('#sheet').hidden;
  let wartet = null, ladeNeu = false, reloaded = false;
  const jetzt = () => {
    if (mittendrin()) return;
    if (ladeNeu && !reloaded) { reloaded = true; try { sessionStorage.setItem('mathetrainer-alte-version', VERSION); } catch { /* egal */ } location.reload(); return; }
    if (wartet) { const w = wartet; wartet = null; w.postMessage('skip'); }
  };
  navigator.serviceWorker.register('sw.js').then((reg) => {
    const neu = (w) => { wartet = w; jetzt(); };
    if (reg.waiting && navigator.serviceWorker.controller) neu(reg.waiting);
    reg.addEventListener('updatefound', () => {
      const w = reg.installing;
      w?.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) neu(w); });
    });
    // Nur bei einem Update neu laden – nicht beim allerersten Besuch.
    // (Beim ersten Besuch übernimmt der Service Worker die Seite einmal ohne Update – danach zählt jeder Wechsel als Update.)
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadController) { ladeNeu = true; jetzt(); } hadController = true; });
    window.addEventListener('hashchange', () => setTimeout(jetzt, 0));
    // Die neue Seite baut sich manchmal erst kurz nach dem Wechsel auf: Steht etwas aus, alle 3 Sekunden noch einmal nachsehen.
    setInterval(() => { if (wartet || ladeNeu) jetzt(); }, 3000);
    // Nachsehen (Leitstand 18.11.2026: „Die WebApp muss immer automatisch aktuell sein“): beim Öffnen, bei jeder Rückkehr
    // in den Tab (höchstens einmal je Minute) und spätestens alle 30 Minuten – Service Worker neu prüfen und stand.json abgleichen
    // (ohne Zwischenspeicher). Weicht die Version ab, sucht der Service Worker sofort noch einmal.
    let zuletzt = 0;
    const pruefe = (immer = false) => {
      if (navigator.onLine === false || (!immer && Date.now() - zuletzt < 60 * 1000)) return; zuletzt = Date.now();   // ohne Netz nicht fragen
      reg.update().catch(() => {});
      fetch(`stand.json?nc=${Date.now()}`, { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null))
        .then((d) => { if (d?.version && d.version !== VERSION) reg.update().catch(() => {}); }).catch(() => {});
    };
    pruefe(true);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') pruefe(); jetzt(); });
    window.addEventListener('focus', () => { pruefe(); jetzt(); });
    window.addEventListener('online', () => pruefe(true));
    setInterval(() => pruefe(true), 30 * 60 * 1000);
  }).catch(() => { /* ohne Service Worker läuft die App trotzdem */ });
}
