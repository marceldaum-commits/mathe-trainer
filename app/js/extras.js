// Einstellungen, Eltern-Bericht und Fehler-Kartei.
import * as G from './a/gen.js';
import * as H from './a/gen2.js';
import * as G3 from './a/gen3.js';
import * as G4 from './a/gen4.js';
import * as G5 from './a/gen5.js';
import * as G6 from './a/gen6.js';
import * as G7 from './a/gen7.js';
import * as G8 from './a/gen8.js';
import * as G9 from './a/gen9.js';
import { quiz } from './quiz.js';
import { store, LEVELS, LAENDER, KARTEI_TAGE } from './store.js';
import { UNITS, AREAS, istOber, jgName } from './units.js';
import { pi, HUETE, BRILLEN, outfitFrei, outfitJetzt } from './figuren.js';
import { kiPunkteText } from './pro.js';
import { $, h, esc, ICON, sfx, sound, klang, vorlese, toast, confetti, drucken } from './ui.js';
import { CONFIG, VERSION, STAND } from './config.js';
import { updateStand, updateSuchen } from './update.js';
import { merkbilderEinsetzen, hatMerkbild } from './merkbild.js';
import { BADGES, TITLES, SKINS, titleOf, skinOpen, checkBadges } from './badges.js';
import { tex } from './ui.js';
import { api, serverOn, nameOk, codeOk, codeNorm, premiumBereit, ZUGANG_ART } from './api.js';
import { pushOn, pushCan, pushAn, pushAus, pushStand, pushGesperrt, zeitOk, installiert, SPERR_HILFE, SPERR_SCHRITTE, SPERR_SCHRITTE_APP, nativ } from './erinnern.js';
import { WOCHEN_ZIEL, WOCHEN_BONUS } from './store.js';

const GEN = { ...G, ...H, ...G3, ...G4, ...G5, ...G6, ...G7, ...G8, ...G9 };   // alle Erzeuger: Die Fehler-Kartei kann jede Aufgaben-Art wiederholen, auch Klasse 5 bis 10

const LEVEL_NOTES = ['Kleine Zahlen, großzügige Bewertung, alle Tipps.', 'Einfache Zahlen, alle Tipps.', 'Wie im Unterricht.', 'Größere Zahlen, mehr Regeln gemischt, weniger Hinweise.', 'Prüfungsniveau und darüber – ohne Tipps.'];
/** Schwierigkeits-Wahl (1–5) als Karte. */
export function levelCard() {
  const el = h(`<section class="card level" aria-label="Schwierigkeit">
    <div class="row"><h3 class="grow">Schwierigkeit</h3><b id="lv-name" class="orange"></b></div>
    <div class="seg" id="lv" role="radiogroup" aria-label="Schwierigkeit wählen"></div>
    <small class="muted" id="lv-note"></small></section>`);
  const seg = $('#lv', el);
  const paint = () => {
    seg.querySelectorAll('button').forEach((b, i) => { const on = i + 1 === store.level; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); });
    $('#lv-name', el).textContent = LEVELS[store.level - 1]; $('#lv-note', el).textContent = LEVEL_NOTES[store.level - 1];
  };
  LEVELS.forEach((name, i) => { const b = h(`<button type="button" role="radio" aria-label="${name}">${i + 1}</button>`); b.onclick = () => { store.level = i + 1; paint(); sfx('tap'); }; seg.append(b); });
  paint();
  return el;
}

/* ───────────── Einstellungen ───────────── */

export function settingsView() {
  const el = h(`<div class="view stack">
    <a class="back" href="#/mehr">${ICON.left} Mehr</a>
    <div><span class="eyebrow">Einstellungen</span><h1 style="margin-top:8px">${istOber() ? 'Für dein Abi' : 'So lernst du'}</h1></div>
    <div id="st-level"></div>
    <section class="card stack" id="st-jg"><h3>Klassenstufe</h3><a class="btn ghost block" id="st-jg-los" href="#/stufe">${esc(jgName(store.jahrgang))} – wechseln</a>
      <small class="muted">Der Mathe-Trainer zeigt nur den Stoff dieser Stufe. Dein Fortschritt in anderen Stufen bleibt erhalten.</small></section>
    <section class="card stack" ${istOber() ? '' : 'hidden'}><h3>Bundesland und Kurs</h3><div class="picks col" id="st-land" role="radiogroup" aria-label="Bundesland und Kurs"></div>
      <small class="muted">Die Auswahl steuert Umfang und Stoff im Abi-Modus und kennzeichnet, was in deinem Kurs kein Prüfungsstoff ist. Alle Lernpfade bleiben offen. <a href="#/lehrplan">Was gilt wo?</a></small></section>
    <section class="card stack"><h3>Ruhiger Modus</h3>
      <button class="schalter" id="st-ruhig" type="button" role="switch" aria-checked="false"><span class="knopf" aria-hidden="true"></span><span>Ohne Druck lernen</span></button>
      <small class="muted">Keine Lernserie, kein Wochen-Ziel, keine Herzen beim Boss, Abi-Modus ohne Uhr. Du lernst in deinem Tempo – Punkte und Fortschritt bleiben. Tages-Runde, Duell und Blitz-Runde sind weiter auf Zeit, weil dort alle dieselben Bedingungen brauchen.</small></section>
    <section class="card stack" id="st-klang"><h3>Klang</h3>
      <button class="schalter" id="st-fx" type="button" role="switch" aria-checked="false"><span class="knopf" aria-hidden="true"></span><span>Töne bei Antworten</span></button>
      <label class="regler"><span>Lautstärke Töne</span><input type="range" id="st-fx-vol" min="0" max="100" step="5" aria-label="Lautstärke der Töne"></label>
      <button class="schalter" id="st-musik" type="button" role="switch" aria-checked="false"><span class="knopf" aria-hidden="true"></span><span>Lernmusik</span></button>
      <label class="regler"><span>Lautstärke Musik</span><input type="range" id="st-musik-vol" min="0" max="100" step="5" aria-label="Lautstärke der Lernmusik"></label>
      <button class="schalter" id="st-pruef" type="button" role="switch" aria-checked="false"><span class="knopf" aria-hidden="true"></span><span>Klang auch in Prüfungen</span></button>
      <button class="btn ghost small" id="st-klang-probe" type="button">Probe hören</button>
      <small class="muted" id="st-klang-note">Leises Piano, eigens für den Mathe-Trainer komponiert. Die Musik startet erst, wenn du die App berührst, und macht nach jedem Stück eine Pause. Im Abi-Modus und bei der Probeklausur ist alles still, außer du schaltest „Klang auch in Prüfungen“ ein. Alles, was ein Ton meldet, siehst du auch auf dem Bildschirm.</small></section>
    <section class="card stack" id="st-vorlesen"><h3>Vorlesen</h3>
      <button class="schalter" id="st-vl" type="button" role="switch" aria-checked="false"><span class="knopf" aria-hidden="true"></span><span>Aufgaben und Theorie vorlesen</span></button>
      <div class="stack" id="st-vl-mehr">
        <div class="picks col" id="st-vl-stimme" role="radiogroup" aria-label="Stimme"></div>
        <div id="st-vl-thorsten"></div>
        <label class="regler"><span id="st-vl-tempo-text">Sprechtempo</span><input type="range" id="st-vl-tempo" min="70" max="130" step="5" aria-label="Sprechtempo"></label>
        <button class="btn ghost small" id="st-vl-probe" type="button">Probe hören</button>
      </div>
      <small class="muted">Ein Knopf „Vorlesen“ erscheint bei jeder Aufgabe und bei jedem Theorie-Abschnitt. Vorgelesen werden Aufgabe, Antworten, der offene Tipp oder Lösungsweg – Formeln werden in Worten gesprochen. Es wird kein Text gesendet: Gerätestimmen nur, wenn sie auf dem Gerät eingebaut sind. Die Stimme „Thorsten“ kommt einmal vom Server von Mathenachhilfe Online (er sieht dabei nur die IP-Adresse) und liest danach ohne Internet.</small></section>
    <section class="card stack"><h3>Schriftgröße</h3>
      <div class="umschalt drei" id="st-schrift" role="radiogroup" aria-label="Schriftgröße"><button class="pick" type="button" role="radio" data-s="klein">Klein</button><button class="pick" type="button" role="radio" data-s="normal">Normal</button><button class="pick" type="button" role="radio" data-s="gross">Groß</button></div>
      <small class="muted">Gilt für die ganze App. Ausdrucke bleiben in normaler Größe.</small></section>
    <section class="card stack"><h3>Ergebnis selbst eintippen</h3><div class="picks" id="st-tipp" role="radiogroup" aria-label="Ergebnis selbst eintippen"></div>
      <small class="muted">Bei Rechenaufgaben tippst du das Ergebnis ein, statt aus vier Antworten zu wählen. „Automatisch“ schaltet das ab Schwierigkeit 4 ein.</small></section>
    <section class="card stack" ${istOber() ? '' : 'hidden'}><h3>Abi-Termin Mathe</h3>
      <input class="field" id="st-abi" type="date" aria-label="Datum der Mathe-Prüfung" value="${esc(store.abi)}">
      <small class="muted" id="st-abi-note"></small></section>
    <section class="card stack"><h3>Farbe</h3><div class="skins" id="st-skin" role="radiogroup" aria-label="Akzentfarbe"></div>
      <small class="muted">Neue Farben schaltest du mit Punkten frei.</small></section>
    ${pushOn() ? `<section class="card stack" id="st-push"><h3>Erinnerung</h3><small class="muted">${nativ() ? 'Einmal am Tag eine kurze Mitteilung „Zeit für Mathe“ – nur, wenn du an dem Tag noch nicht geübt hast. Das Handy stellt sie selbst zu: ohne Server, ohne Internet. Jederzeit abschaltbar.' : 'Einmal am Tag eine kurze Mitteilung „Zeit für deine Mathe-Runde“. Gespeichert wird beim Server nur die Adresse für die Mitteilung und die Uhrzeit – kein Name, kein Lernstand. Jederzeit abschaltbar.'}</small>
      <button class="schalter" id="st-push-schalter" type="button" role="switch" aria-checked="false"><span class="knopf" aria-hidden="true"></span><span id="st-push-stand">Erinnerung ist aus</span></button>
      <div class="row push-row" id="st-push-zeile" hidden><label for="st-push-time"><b>Uhrzeit</b></label><input class="field" id="st-push-time" type="time" step="300" aria-label="Uhrzeit der Erinnerung">
        <button class="btn small" id="st-push-an" type="button">Speichern</button></div>
      <div id="st-push-note"></div><div id="st-push-install"></div></section>` : ''}
    <section class="card stack" id="st-pro" hidden><h3>Pro-Fassung</h3>
      <small class="muted">Mit einem Zugangscode schaltest du die Pro-Funktionen frei: Drucken und PDF, ausführliche Theorie – und mit „Pro + KI“ auch die KI-Funktionen. Der Code liegt nur in diesem Gerät, es gibt kein Konto.</small>
      <div id="st-pro-stand"></div>
      <div class="row push-row" id="st-pro-zeile"><input class="field" id="st-pro-code" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="24" placeholder="MT-XXXX-XXXX-XXXX" aria-label="Zugangscode">
        <button class="btn small" id="st-pro-go" type="button">Einlösen</button></div>
      <div id="st-pro-note"></div></section>
    <section class="card stack"><h3>Fortschritt</h3><small class="muted">Alles liegt nur auf diesem Gerät. Es gibt kein Konto.</small>
      <button class="btn ghost" id="st-reset" type="button">Zurücksetzen …</button>
      <div class="stack st-reset-wahl" id="st-reset-wahl" hidden>
        <button class="card unit" type="button" data-r="geuebt"><span><h3>Nur das Geübte</h3><small>Aufgaben-Statistik, Fehler-Kartei und Runden-Ergebnisse löschen. Sterne, Punkte und Abzeichen bleiben.</small></span></button>
        <button class="card unit" type="button" data-r="klasse"><span><h3 id="st-reset-klasse"></h3><small>Die Sterne aller Einheiten dieser Stufe löschen, um sie noch einmal von vorn zu machen. Punkte und Abzeichen bleiben.</small></span></button>
        <button class="card unit" type="button" data-r="alles"><span><h3>Alles</h3><small>Den gesamten Fortschritt auf diesem Gerät löschen.</small></span></button>
      </div></section>
    <section class="card stack"><h3>Pi anziehen</h3><small class="muted" id="st-pi-info"></small><div class="st-pi"><span class="pi-fig" id="st-pi-bild"></span><div class="stack grow"><div class="picks" id="st-hut" role="radiogroup" aria-label="Hut"></div><div class="picks" id="st-brille" role="radiogroup" aria-label="Brille"></div></div></div></section>
    <section class="card stack"><h3>Über diese App</h3><dl class="st-info" id="st-info"></dl>
      <button class="btn ghost" id="st-update" type="button">Nach Update suchen</button><small class="muted" id="st-update-note" role="status"></small></section>
  </div>`);
  $('#st-level', el).append(levelCard());
  const sk = $('#st-skin', el);
  const paintSkin = () => sk.querySelectorAll('button').forEach((b) => { const on = b.dataset.k === store.skin; b.classList.toggle('sel', on); b.setAttribute('aria-checked', on); });
  SKINS.forEach(([id, name, need, color]) => {
    const open = skinOpen(id);
    const b = h(`<button class="skin" type="button" role="radio" data-k="${id}" ${open ? '' : 'disabled'} aria-label="${name}${open ? '' : `, ab ${need} Punkten`}"><i style="background:${color}"></i><span>${esc(name)}</span><small>${open ? '' : `ab ${need}`}</small></button>`);
    b.onclick = () => { store.skin = id; applySkin(); paintSkin(); sfx('tap'); };
    sk.append(b);
  });
  paintSkin();
  const box = $('#st-land', el);
  const paint = () => box.querySelectorAll('button').forEach((b) => { const on = b.dataset.k === store.land; b.classList.toggle('sel', on); b.setAttribute('aria-checked', on); });
  Object.entries(LAENDER).forEach(([k, name]) => {
    const b = h(`<button class="pick" type="button" role="radio" data-k="${k}">${esc(name)}</button>`);
    b.onclick = () => { store.land = k; paint(); sfx('tap'); };
    box.append(b);
  });
  paint();
  if (pushOn()) {
    const pn = $('#st-push-note', el), tf = $('#st-push-time', el), sw = $('#st-push-schalter', el), save = $('#st-push-an', el), stand = $('#st-push-stand', el), zeile = $('#st-push-zeile', el), inst = $('#st-push-install', el);
    const sperre = () => `<div class="note tip" id="st-push-sperre"><b>${esc(SPERR_HILFE)}</b> So gibst du sie frei:<ol>${(nativ() ? SPERR_SCHRITTE_APP : SPERR_SCHRITTE).map(([wo, was]) => `<li><b>${esc(wo)}:</b> ${esc(was)}</li>`).join('')}</ol>${nativ() && typeof window.MTApp?.mitteilungenEinstellen === 'function' ? '<button class="btn ghost small" id="st-push-android" type="button">Android-Einstellungen öffnen</button>' : ''}</div>`;
    let st = { an: false, zeit: store.erinnern?.zeit || '18:00', kann: pushCan(), gesperrt: pushGesperrt() };
    const paintP = () => {
      sw.setAttribute('aria-checked', st.an); sw.classList.toggle('an', st.an);
      stand.textContent = st.an ? `Erinnerung täglich um ${st.zeit} Uhr${nativ() ? '' : ' (deutsche Zeit)'}` : 'Erinnerung ist aus';
      zeile.hidden = !st.an; if (document.activeElement !== tf) tf.value = st.zeit;
    };
    const sync = async () => { st = await pushStand(); paintP(); if (!st.kann) pn.innerHTML = '<div class="note tip">Auf diesem Gerät geht das nur, wenn die App auf dem Startbildschirm installiert ist (iPhone: Teilen → „Zum Home-Bildschirm“).</div>'; else if (st.gesperrt) pn.innerHTML = sperre(); };
    const schalten = async (zeit) => {
      sw.disabled = save.disabled = true; pn.innerHTML = '';
      const r = await pushAn(zeit); sw.disabled = save.disabled = false;
      if (!r.ok) pn.innerHTML = r.gesperrt ? sperre() : `<div class="note bad">${esc(r.grund)}</div>`;
      $('#st-push-android', el)?.addEventListener('click', () => { if (typeof window.MTApp?.mitteilungenEinstellen === 'function') window.MTApp.mitteilungenEinstellen(); });
      await sync(); if (r.ok) pn.innerHTML = `<div class="note ok">Eingeschaltet. Du bekommst höchstens eine Mitteilung am Tag${nativ() ? ' – und keine, wenn du an dem Tag schon geübt hast. Das Handy stellt sie selbst zu, ganz ohne Internet' : ''}.</div>`;
      sfx(r.ok ? 'ok' : 'tap');
    };
    sw.onclick = async () => {
      if (st.an) { sw.disabled = true; await pushAus(); sw.disabled = false; await sync(); pn.innerHTML = `<div class="note ok">Ausgeschaltet.${nativ() ? '' : ' Die Anmeldung beim Server ist gelöscht.'}</div>`; sfx('tap'); }
      else await schalten(zeitOk(tf.value) ? tf.value : st.zeit);
    };
    save.onclick = () => { if (!zeitOk(tf.value)) { pn.innerHTML = '<div class="note bad">Bitte eine Uhrzeit wählen.</div>'; return; } schalten(tf.value); };
    // Nicht installiert: dezenter Hinweis – als App kommt die Erinnerung wie bei jeder App.
    if (!installiert()) {
      inst.innerHTML = `<small class="muted">Am besten als App installieren – dann kommt die Erinnerung wie bei jeder App.</small>${window.__mtInstall ? ' <button class="btn ghost small" id="st-push-inst" type="button">App installieren</button>' : ''}`;
      $('#st-push-inst', el)?.addEventListener('click', async () => { const ev = window.__mtInstall; if (!ev) return; ev.prompt(); await ev.userChoice; window.__mtInstall = null; inst.innerHTML = ''; });
    }
    if (nativ()) { const neu = () => { if (el.isConnected) sync(); else window.removeEventListener('mt-erinnerung', neu); }; window.addEventListener('mt-erinnerung', neu); }
    paintP(); sync();
  }
  { // Pro-Fassung: erscheint erst, wenn der Server Zugänge anbietet (GET /api/status → premium) oder schon ein Code im Gerät liegt.
    const box = $('#st-pro', el), stand = $('#st-pro-stand', el), pn = $('#st-pro-note', el), feld = $('#st-pro-code', el), go = $('#st-pro-go', el), zeile = $('#st-pro-zeile', el);
    const datum = (d) => d.split('-').reverse().join('.');
    const paintZ = () => { const z = store.zugang;
      stand.innerHTML = z ? `<div class="note ${store.zugangGilt() ? 'ok' : 'tip'}"><b>${z.ki === false ? 'Pro' : 'Pro + KI'}${store.zugangGilt() ? ' aktiv ✓' : ''}</b> · ${esc(ZUGANG_ART[z.art] || 'Zugang')} – ${z.bis >= '9999' ? 'unbefristet gültig' : store.zugangGilt() ? `gültig bis ${esc(datum(z.bis))}` : `abgelaufen am ${esc(datum(z.bis))}`}${store.zugangGilt() && z.ki !== false ? `, ${kiPunkteText()}` : ''}. <button class="linkbtn" id="st-pro-weg" type="button">Code entfernen</button></div>` : '';
      zeile.hidden = !!z && store.zugangGilt();
      $('#st-pro-weg', el)?.addEventListener('click', () => { store.zugang = null; pn.innerHTML = ''; paintZ(); window.dispatchEvent(new Event('mt-ruhig')); }); };
    go.onclick = async () => {
      const code = codeNorm(feld.value);
      if (!code) { pn.innerHTML = '<div class="note bad">Der Code hat die Form MT-XXXX-XXXX-XXXX.</div>'; return; }
      go.disabled = true; pn.innerHTML = ''; const r = await api.zugang(code); go.disabled = false;
      if (r.ok && /^\d{4}-\d{2}-\d{2}$/.test(r.bis || '')) { store.zugang = { code, art: String(r.art || ''), bis: r.bis, ki: r.ki !== false /* false = Stufe „Pro“ ohne KI */ }; feld.value = ''; pn.innerHTML = `<div class="note ok">Eingelöst. ${r.ki !== false ? 'Drucken, PDF, ausführliche Theorie und die KI-Funktionen sind freigeschaltet.' : 'Drucken, PDF und die ausführliche Theorie sind freigeschaltet.'}</div>`; sfx('ok'); paintZ(); window.dispatchEvent(new Event('mt-ruhig')); }
      else pn.innerHTML = `<div class="note bad">${r.status === 404 ? 'Diesen Code kennen wir nicht, oder er ist abgelaufen.' : esc(r.error || 'Der Code konnte gerade nicht geprüft werden.')}</div>`;
    };
    paintZ(); if (store.zugang) box.hidden = false;
    premiumBereit().then((an) => { if (an && el.isConnected) box.hidden = false; }); }
  { const paintS = () => el.querySelectorAll('#st-schrift .pick').forEach((b) => { const on = b.dataset.s === store.schrift; b.classList.toggle('sel', on); b.setAttribute('aria-checked', on); });
    el.querySelectorAll('#st-schrift .pick').forEach((b) => { b.onclick = () => { store.schrift = b.dataset.s; applySchrift(); paintS(); sfx('tap'); }; }); paintS(); }
  { const u = updateStand(), app = typeof window.MTApp?.version === 'function' ? String(window.MTApp.version()).slice(0, 12) : '';
    $('#st-info', el).innerHTML = `<dt>Version</dt><dd id="st-version">${esc(VERSION)}</dd><dt>Stand</dt><dd id="st-datum">${esc(STAND)}</dd>`
      + (app ? `<dt>App-Datei</dt><dd>${esc(app)}</dd>` : '')
      + (u && u.kanal !== 'aus' ? `<dt>Aktualisierung</dt><dd>${u.bereit ? `Version ${esc(u.bereit)} ist geladen` : 'holt neue Inhalte von selbst'}</dd>` : '')
      + (window.MTApp ? '' : '<dt>Aktualisierung</dt><dd id="st-auto">automatisch</dd>'); }
  { const ub = $('#st-update', el), un = $('#st-update-note', el);
    if (!window.MTApp) { ub.hidden = true; un.hidden = true; }   // Web-App: aktualisiert sich von selbst, kein Knopf
    ub.onclick = () => { ub.disabled = true; un.textContent = 'Suche …';
      updateSuchen().then((r) => { ub.disabled = false; un.textContent = r.text; if (r.art === 'neu') window.dispatchEvent(new Event('mt-update')); }); }; }
  { // Vorlesen: an/aus, Stimme (Gerät oder Thorsten), Tempo, Probe – die Wahl wird gemerkt
    const sw = $('#st-vl', el), mehr = $('#st-vl-mehr', el), wahl = $('#st-vl-stimme', el), th = $('#st-vl-thorsten', el), tempo = $('#st-vl-tempo', el);
    let V = null; const holen = async () => (V ||= await import('./vorlesen.js'));
    const zeichne = async () => {
      sw.setAttribute('aria-checked', vorlese.an); sw.classList.toggle('an', vorlese.an); mehr.hidden = !vorlese.an; tempo.value = Math.round(vorlese.tempo * 100);
      $('#st-vl-tempo-text', el).textContent = `Sprechtempo ${Math.round(vorlese.tempo * 100)} %`;
      if (!vorlese.an) return;
      const M = await holen(), z = M.thorsten.zustand === 'laedt' ? 'laedt' : await M.thorsten.pruefen(), geraete = M.geraeteStimmen();
      const opt = [['thorsten', 'Thorsten – natürliche Stimme'], ...geraete.map((v) => [`geraet:${v.voiceURI}`, `${v.name} (Gerät)`])];
      const aktiv = vorlese.stimme && opt.some(([k]) => k === vorlese.stimme) ? vorlese.stimme : (z === 'bereit' || !geraete.length ? 'thorsten' : opt[1]?.[0]);
      wahl.innerHTML = opt.map(([k, n]) => `<button class="pick${k === aktiv ? ' sel' : ''}" type="button" role="radio" aria-checked="${k === aktiv}" data-k="${esc(k)}">${esc(n)}</button>`).join('');
      wahl.querySelectorAll('button').forEach((b) => { b.onclick = () => { vorlese.setze({ stimme: b.dataset.k }); sfx('tap'); zeichne(); }; });
      th.innerHTML = z === 'bereit' ? '<div class="note ok"><b>Thorsten ist geladen</b> und liest auch ohne Internet. <button class="linkbtn" id="st-vl-weg" type="button">Stimme entfernen</button></div>'
        : z === 'laedt' ? `<div class="note tip" role="status">Thorsten wird geladen … ${M.thorsten.prozent} % <button class="linkbtn" id="st-vl-stopp" type="button">Abbrechen</button></div>`
        : z === 'geht-nicht' ? '<small class="muted">Thorsten läuft in diesem Browser nicht. Es liest die Stimme des Geräts.</small>'
        : `${z === 'fehler' ? `<div class="note tip">${esc(M.thorsten.grund)}</div>` : ''}<button class="btn small" id="st-vl-laden" type="button">Thorsten laden (ca. 75 MB)</button><small class="muted"> Am besten im WLAN. Danach liest er ohne Internet.</small>${geraete.length ? '' : '<div class="note tip">Auf diesem Gerät gibt es keine eingebaute deutsche Stimme – zum Vorlesen bitte Thorsten laden.</div>'}`;
      $('#st-vl-laden', th)?.addEventListener('click', () => { M.thorsten.laden(() => { if (el.isConnected) zeichne(); }); zeichne(); });
      $('#st-vl-stopp', th)?.addEventListener('click', () => M.thorsten.abbrechen());
      $('#st-vl-weg', th)?.addEventListener('click', async () => { await M.thorsten.entfernen(); zeichne(); });
    };
    sw.onclick = () => { vorlese.setze({ an: !vorlese.an }); sfx('tap'); zeichne(); };
    tempo.oninput = () => { vorlese.setze({ tempo: tempo.value / 100 }); $('#st-vl-tempo-text', el).textContent = `Sprechtempo ${tempo.value} %`; };
    $('#st-vl-probe', el).onclick = async () => { const M = await holen(); const wer = await M.sprich('Hallo! So klinge ich. Die Ableitung von f von x gleich x Quadrat ist 2 x.'); if (!wer) toast('Keine Stimme verfügbar – bitte Thorsten laden.'); };
    if ('speechSynthesis' in window) speechSynthesis.addEventListener?.('voiceschanged', () => { if (el.isConnected) zeichne(); });
    zeichne(); }
  { // Klang: Effekte und Lernmusik getrennt, eigene Lautstärke, gemerkt; der Lautsprecher oben schaltet alles stumm
    const sch = [['#st-fx', 'fx'], ['#st-musik', 'musik'], ['#st-pruef', 'pruefung']], note = $('#st-klang-note', el), fv = $('#st-fx-vol', el), mv = $('#st-musik-vol', el);
    const paintK = () => { sch.forEach(([id, k]) => { const b = $(id, el); b.setAttribute('aria-checked', klang[k]); b.classList.toggle('an', klang[k]); });
      fv.value = Math.round(klang.fxVol * 100); mv.value = Math.round(klang.musikVol * 100); fv.disabled = !klang.fx; mv.disabled = !klang.musik;
      note.classList.toggle('warn', !sound.on); if (!sound.on && !note.dataset.stumm) { note.dataset.stumm = '1'; note.insertAdjacentHTML('afterbegin', '<b>Der Ton ist oben ausgeschaltet (Lautsprecher).</b> '); } };
    sch.forEach(([id, k]) => { $(id, el).onclick = () => { klang.setze({ [k]: !klang[k] }); paintK(); if (k === 'fx' && klang.fx) sfx('ok'); }; });
    fv.oninput = () => klang.setze({ fxVol: fv.value / 100 }); fv.onchange = () => sfx('ok');
    mv.oninput = () => klang.setze({ musikVol: mv.value / 100 });
    $('#st-klang-probe', el).onclick = () => sfx('start', { probe: true });
    paintK(); }
  { const rb = $('#st-ruhig', el), paintR = () => { rb.setAttribute('aria-checked', store.ruhig); rb.classList.toggle('an', store.ruhig); };
    rb.onclick = () => { store.ruhig = !store.ruhig; paintR(); sfx('tap'); window.dispatchEvent(new Event('mt-ruhig')); }; paintR(); }
  const tb = $('#st-tipp', el);
  const paintT = () => tb.querySelectorAll('button').forEach((b) => { const on = b.dataset.k === store.tippenWahl; b.classList.toggle('sel', on); b.setAttribute('aria-checked', on); });
  [['auto', 'Automatisch'], ['an', 'Immer'], ['aus', 'Nie']].forEach(([k, name]) => { const b = h(`<button class="pick" type="button" role="radio" data-k="${k}">${name}</button>`); b.onclick = () => { store.tippenWahl = k; paintT(); sfx('tap'); }; tb.append(b); });
  paintT();
  const note = () => { const d = store.abiDays(); $('#st-abi-note', el).textContent = store.abi ? (d === null ? 'Der Termin liegt in der Vergangenheit.' : `Noch ${d} ${d === 1 ? 'Tag' : 'Tage'}. Der Countdown steht auf der Startseite.`) : 'Mit Termin zeigt die Startseite einen Countdown und ein Tagesziel.'; };
  $('#st-abi', el).addEventListener('change', (ev) => { store.abi = ev.target.value; note(); });
  note();
  { const wahl = $('#st-reset-wahl', el); $('#st-reset-klasse', el).textContent = `Nur ${jgName(store.jahrgang)}`;
    $('#st-reset', el).onclick = () => { wahl.hidden = !wahl.hidden; };
    wahl.querySelectorAll('button').forEach((b) => { b.onclick = () => {
      const r = b.dataset.r, frage = r === 'geuebt' ? 'Wirklich alles Geübte löschen? Sterne, Punkte und Abzeichen bleiben.' : r === 'klasse' ? `Wirklich die Sterne aller Einheiten in „${jgName(store.jahrgang)}“ löschen?` : 'Wirklich allen Fortschritt auf diesem Gerät löschen?';
      if (!window.confirm(frage)) return;
      if (r === 'geuebt') store.resetGeuebt(); else if (r === 'klasse') store.resetEinheiten(UNITS.map((u) => u.id)); else store.reset();
      toast(r === 'geuebt' ? 'Geübtes gelöscht.' : r === 'klasse' ? `${jgName(store.jahrgang)} zurückgesetzt.` : 'Fortschritt gelöscht.'); location.hash = '#/';
    }; }); }
  { const male = () => { const jetzt = outfitJetzt(), n = store.sterne;
      $('#st-pi-bild', el).innerHTML = pi(); $('#st-pi-info', el).textContent = `Mit Sternen aus dem Lernpfad schaltest du Hüte und Brillen frei. Du hast ${n} ${n === 1 ? 'Stern' : 'Sterne'}.`;
      for (const [sel, liste, key] of [['#st-hut', HUETE, 'hut'], ['#st-brille', BRILLEN, 'brille']]) {
        const box = $(sel, el); box.innerHTML = '';
        liste.forEach(([id, name, need]) => { const frei = outfitFrei(liste, id), b = h(`<button class="pick ${jetzt[key] === id ? 'sel' : ''}" type="button" role="radio" aria-checked="${jetzt[key] === id}" data-k="${id}" ${frei ? '' : 'disabled'}>${esc(name)}${frei ? '' : `<small> ab ${need} ★</small>`}</button>`);
          b.onclick = () => { store.outfit = { ...outfitJetzt(), [key]: id }; sfx('tap'); male(); }; box.append(b); }); } };
    male(); }
  return { el };
}

/** Tagesziel bis zum Abi: offene Schritte gleichmäßig auf die Tage verteilt (mindestens 1, höchstens 6). */
export function dailyGoal(openSteps, days) {
  if (days === null || openSteps <= 0) return 0;
  return Math.min(6, Math.max(1, Math.ceil(openSteps / Math.max(1, days))));
}
export const openSteps = () => UNITS.reduce((s, u) => s + u.steps.filter((st) => !store.isDone(u.id, st.id)).length, 0);

/* ───────────── Eltern-Bericht ───────────── */

export function berichtView() {
  const stats = Object.entries(store.stats).map(([topic, s]) => ({ topic, ...s, n: s.ok + s.bad, rate: s.ok / (s.ok + s.bad) }));
  const strong = stats.filter((s) => s.n >= 3 && s.rate >= 0.8).sort((a, b) => b.n - a.n).slice(0, 6);
  const weak = store.weak(6);
  const total = stats.reduce((s, x) => s + x.n, 0), right = stats.reduce((s, x) => s + x.ok, 0);
  const today = new Date().toLocaleDateString('de-DE');
  const areaRows = AREAS.map((a) => {
    const us = UNITS.filter((u) => u.area === a.id), steps = us.reduce((s, u) => s + u.steps.length, 0), done = us.reduce((s, u) => s + store.unitProgress(u).n, 0);
    return `<div class="rep-row"><span>${esc(a.title)}</span><div class="bar"><i style="width:${steps ? (done / steps) * 100 : 0}%"></i></div><b>${done}/${steps}</b></div>`;
  }).join('');
  const exams = store.exams.slice(0, 5);
  const el = h(`<div class="view stack report">
    <a class="back noprint" href="#/mehr">${ICON.left} Mehr</a>
    <div><span class="eyebrow">Lernstand</span><h1 style="margin-top:8px">Bericht für Eltern</h1><p class="lead" style="margin-top:8px">Stand ${today} · Mathe-Trainer von ${esc(CONFIG.firma)}</p></div>
    <section class="card stack"><h3>Überblick</h3>
      <div class="rep-grid"><div><b>${store.xp}</b><small>Punkte</small></div><div><b>${store.streak}</b><small>Tage in Folge</small></div><div><b>${total}</b><small>Aufgaben</small></div><div><b>${total ? Math.round((right / total) * 100) : 0} %</b><small>beim ersten Versuch richtig</small></div></div>
      <small class="muted">Zuletzt geübt: ${store.lastDay ? esc(store.lastDay.split('-').reverse().join('.')) : 'noch nicht'} · Schwierigkeit: ${LEVELS[store.level - 1]}${store.land ? ` · ${esc(LAENDER[store.land])}` : ''}</small></section>
    <section class="card stack"><h3>Lernpfade</h3>${areaRows}</section>
    <section class="card stack"><h3>Das sitzt</h3>${strong.length ? `<ul class="rep-list">${strong.map((s) => `<li>${esc(s.topic)} <small class="muted">${s.ok} von ${s.n} richtig</small></li>`).join('')}</ul>` : '<small class="muted">Noch zu wenige Aufgaben für eine Aussage (mindestens drei je Thema).</small>'}</section>
    <section class="card stack"><h3>Hier hakt es noch</h3>${weak.length ? `<ul class="rep-list">${weak.map((s) => `<li>${esc(s.topic)} <small class="muted">${s.bad} von ${s.ok + s.bad} nicht auf Anhieb</small></li>`).join('')}</ul>` : '<small class="muted">Bisher keine auffälligen Themen.</small>'}
      <small class="muted">In der Fehler-Kartei zum Wiederholen: ${store.karteCount} Aufgabenart${store.karteCount === 1 ? '' : 'en'}.</small></section>
    ${exams.length ? `<section class="card stack"><h3>Abi-Modus</h3>${exams.map((e) => `<div class="rep-row"><span>Teil ${esc(e.part)} · ${esc(e.date)}</span><small class="muted">${e.correct}/${e.total} richtig</small><b>${e.np} NP</b></div>`).join('')}<small class="muted">Prognose aus Auswahl-Aufgaben – eine Orientierung, kein Notenersatz.</small></section>` : ''}
    <section class="cta nur-web"><h2>Gemeinsam geht es schneller.</h2><p>${weak.length ? `Bei ${esc(weak.slice(0, 2).map((s) => s.topic).join(' und '))} unterstützen wir gezielt.` : 'Wir zeigen in einer Probestunde, wie persönliche Nachhilfe den nächsten Schritt leichter macht.'} Die erste Stunde ist kostenlos.</p>
      <a class="btn" href="${CONFIG.probestunde}" target="_blank" rel="noopener">Gratis Probestunde ${ICON.right}</a><small>${esc(CONFIG.website.replace(/^https?:\/\/|\/$/g, ''))}</small></section>
    <div class="row noprint"><button class="btn ghost grow" id="rp-print" type="button">Drucken / PDF</button><button class="btn grow" id="rp-share" type="button">Teilen</button></div>
    <small class="muted noprint">Der Bericht entsteht nur auf diesem Gerät. Es werden keine Daten übertragen.</small>
  </div>`);
  $('#rp-print', el).onclick = () => drucken();
  $('#rp-share', el).onclick = async () => {
    const text = `Mathe-Trainer – Lernstand vom ${today}: ${total} Aufgaben, ${total ? Math.round((right / total) * 100) : 0} % beim ersten Versuch richtig.${weak.length ? ` Übungsbedarf: ${weak.map((s) => s.topic).join(', ')}.` : ''}`;
    try { if (navigator.share) await navigator.share({ title: 'Mathe-Trainer – Lernstand', text }); else { await navigator.clipboard.writeText(text); toast('Text kopiert.'); } } catch { toast('Teilen nicht möglich – nutze „Drucken“.'); }
  };
  return { el };
}

/* ───────────── Fehler-Kartei ───────────── */

export function karteiView() {
  const due = store.karteDue().filter((k) => typeof GEN[k.gen] === 'function').slice(0, 8);
  const el = h('<div class="view stack"></div>');
  if (!due.length) {
    el.innerHTML = `<a class="back" href="#/">${ICON.left} Start</a>
      <div><span class="eyebrow">Fehler-Kartei</span><h1 style="margin-top:8px">Heute nichts fällig</h1>
      <p class="lead" style="margin-top:8px">${store.karteCount ? `${store.karteCount} Aufgabenart${store.karteCount === 1 ? '' : 'en'} warten auf ihren nächsten Termin.` : 'Aufgaben, die nicht auf Anhieb klappen, landen hier und kommen nach 1, 3, 7 und 16 Tagen wieder.'}</p></div>
      <a class="btn block" href="#/">Zum Lernpfad</a>`;
    return { el };
  }
  el.innerHTML = `<div class="stephead"><a class="x" href="#/" aria-label="Schließen">${ICON.close}</a><div class="prog"><i></i></div></div><div id="stage"></div>`;
  let cleanup = null, ok = 0;
  const bar = $('.prog i', el);
  queueMicrotask(() => {
    cleanup = quiz(due.map((k) => GEN[k.gen]), { onRight: (q) => { ok++; store.karteResult(q.gen, true); }, onWrong: (q) => store.karteResult(q.gen, false) })($('#stage', el), {
      progress: (f) => { bar.style.width = `${Math.round(f * 100)}%`; },
      done: () => {
        sfx('win'); if (ok === due.length) confetti(40);
        el.innerHTML = `<div><span class="eyebrow">Fehler-Kartei</span><h1 style="margin-top:8px" id="kt-done">Wiederholung geschafft</h1>
          <p class="lead" style="margin-top:8px">${ok} von ${due.length} saßen auf Anhieb. Was geklappt hat, kommt später wieder (nach ${KARTEI_TAGE.join(', ')} Tagen), der Rest schon morgen.</p></div>
          <a class="btn block" href="#/">Zum Lernpfad</a>`;
      },
    }) || null;
  });
  return { el, cleanup: () => cleanup?.() };
}

/* ───────────── Design ───────────── */
/** Schriftgröße aus den Einstellungen anwenden (Faktor --fs im Stil). */
export function applySchrift() { const s = store.schrift; if (s === 'normal') delete document.documentElement.dataset.schrift; else document.documentElement.dataset.schrift = s; }
export function applySkin() {
  const s = SKINS.find((x) => x[0] === store.skin && skinOpen(x[0])) || SKINS[0];
  const r = document.documentElement.style;
  if (s[0] === 'orange') { r.removeProperty('--orange'); r.removeProperty('--orange-dark'); } else { r.setProperty('--orange', s[3]); r.setProperty('--orange-dark', s[4]); }
}

/* ───────────── Abi-Bereitschaft ───────────── */
/** Schätzt, wie weit man ist (0–100): 55 % Lernpfad, 25 % Trefferquote, 20 % bestes Abi-Ergebnis. */
export function readiness() {
  const steps = UNITS.reduce((s, u) => s + u.steps.length, 0), done = UNITS.reduce((s, u) => s + store.unitProgress(u).n, 0);
  const st = Object.values(store.stats), n = st.reduce((s, x) => s + x.ok + x.bad, 0), ok = st.reduce((s, x) => s + x.ok, 0);
  const rate = n >= 20 ? ok / n : (ok / Math.max(1, n)) * (n / 20);
  const np = store.exams.reduce((m, e) => Math.max(m, e.np), 0) / 15;
  return Math.round(100 * (0.55 * (steps ? done / steps : 0) + 0.25 * rate + 0.2 * np));
}

/* ───────────── Wochen-Ziel ───────────── */
export function weekCard(onClaim) {
  const w = store.week();
  const el = h(`<section class="card week"><div class="row"><h3 class="grow">Wochen-Ziel</h3><b class="orange">${Math.min(w.days, WOCHEN_ZIEL)}/${WOCHEN_ZIEL} Tage</b></div>
    <div class="weekdots">${Array.from({ length: WOCHEN_ZIEL }, (_, i) => `<i class="${i < w.days ? 'on' : ''}"></i>`).join('')}</div>
    ${w.claimed ? '<small class="muted">Truhe dieser Woche geöffnet. Nächste Woche gibt es eine neue.</small>' : w.done ? `<button class="btn block" id="wk-claim" type="button">Truhe öffnen · +${WOCHEN_BONUS} Punkte</button>` : `<small class="muted">Übe an ${WOCHEN_ZIEL} Tagen dieser Woche, dann wartet eine Truhe mit ${WOCHEN_BONUS} Punkten.</small>`}</section>`);
  const b = $('#wk-claim', el);
  if (b) b.onclick = () => { const got = store.claimWeek(); if (got) { sfx('win'); confetti(60); toast(`Truhe geöffnet: +${got} Punkte.`); onClaim?.(); } };
  return el;
}

/* ───────────── Erfolge: Titel und Abzeichen ───────────── */
export function erfolgeView() {
  checkBadges();
  const t = titleOf(), have = store.badges, got = BADGES.filter((b) => have[b.id]).length;
  const el = h(`<div class="view stack">
    <a class="back" href="#/mehr">${ICON.left} Mehr</a>
    <div><span class="eyebrow">Erfolge</span><h1 style="margin-top:8px">${esc(t.title)}</h1><p class="lead" style="margin-top:8px">Stufe ${t.level} von ${TITLES.length} · ${store.xp} Punkte</p></div>
    <section class="card stack"><div class="bar big"><i style="width:${Math.round(t.pct * 100)}%"></i></div>
      <small class="muted">${t.next ? `Noch ${t.need} Punkte bis „${esc(t.next)}“.` : 'Höchster Titel erreicht.'}</small></section>
    <div class="sect"><h2>Abzeichen</h2><small class="muted" id="bd-count">${got}/${BADGES.length}</small></div>
    <section class="badges">${BADGES.map((b) => `<div class="badge ${have[b.id] ? 'on' : ''}" title="${esc(b.text)}"><b>${esc(b.icon)}</b><span>${esc(b.name)}</span><small>${esc(b.text)}</small></div>`).join('')}</section>
    <small class="muted">Abzeichen gibt es für Können – richtige Antworten beim ersten Versuch, Serien und Abschlüsse –, nicht für bloße Spielzeit.</small>
  </div>`);
  return { el };
}

/* ───────────── Formelsammlung zum Freischalten ───────────── */
export function formelnView() {
  const total = UNITS.reduce((s, u) => s + (u.formeln?.length || 0), 0);
  const open = UNITS.filter((u) => store.unitProgress(u).done).reduce((s, u) => s + (u.formeln?.length || 0), 0);
  const el = h(`<div class="view stack report">
    <a class="back noprint" href="#/mehr">${ICON.left} Mehr</a>
    <div><span class="eyebrow">Deine Formelsammlung</span><h1 style="margin-top:8px">${open} von ${total} Formeln</h1><p class="lead noprint" style="margin-top:8px">Jede abgeschlossene Einheit schaltet ihre Formelkarten frei.</p></div>
    ${AREAS.map((a) => { const us = UNITS.filter((u) => u.area === a.id && u.formeln?.length); return us.length ? `<div class="sect"><h2>${esc(a.title)}</h2></div><section class="stack">${us.map((u) => {
      const ok = store.unitProgress(u).done;
      return `<div class="card fcard ${ok ? '' : 'locked noprint'}"><div class="row"><h3 class="grow">${esc(u.title)}</h3>${ok ? '' : `<a class="btn small ghost" href="#/u/${u.id}">Freischalten</a>`}</div>
        ${ok ? u.formeln.map(([n, f]) => `<div class="fline"${hatMerkbild(n) ? ` data-merk="${esc(n)}"` : ''}><small>${esc(n)}</small><div class="formula">${tex(f, true)}</div></div>`).join('') : `<small class="muted">${u.formeln.length} ${u.formeln.length === 1 ? 'Formel' : 'Formeln'} – schließe die Einheit ab.</small>`}</div>`; }).join('')}</section>` : ''; }).join('')}
    ${open ? '<button class="btn ghost block noprint" id="fm-print" type="button">Drucken / PDF</button>' : ''}
  </div>`);
  const pb = $('#fm-print', el); if (pb) pb.onclick = () => drucken();
  queueMicrotask(() => merkbilderEinsetzen(el));
  return { el };
}

/* ───────────── Klasse (nur mit Server) ───────────── */
export function klasseView() {
  const el = h('<div class="view stack"></div>');
  if (!serverOn()) {
    el.innerHTML = `<a class="back" href="#/pruefung">${ICON.left} Prüfung</a><div><span class="eyebrow">Klasse</span><h1 style="margin-top:8px">Noch nicht verfügbar</h1><p class="lead" style="margin-top:8px">Die Klassen-Bestenliste braucht einen Server. Bis dahin kannst du Mitschüler im Duell per Link herausfordern.</p></div><a class="btn block" href="#/duell">Zum Duell</a>`;
    return { el };
  }
  async function board() {
    const k = store.klasse;
    el.innerHTML = `<a class="back" href="#/pruefung">${ICON.left} Prüfung</a><div><span class="eyebrow">Klasse ${esc(k.code)}</span><h1 style="margin-top:8px">${esc(k.name || 'Rangliste')}</h1><p class="lead" style="margin-top:8px">Du spielst als <b>${esc(k.spitzname)}</b>. Gewertet wird die Tages-Runde dieser Woche.</p></div>
      <section class="stack" id="kl-list"><div class="card"><small class="muted">Lade Rangliste …</small></div></section>
      <a class="btn block" href="#/tag">Tages-Runde spielen</a><button class="btn ghost block" id="kl-leave" type="button">Klasse verlassen</button>`;
    $('#kl-leave', el).onclick = async () => {
      if (!window.confirm('Klasse wirklich verlassen? Dein Eintrag in der Rangliste wird gelöscht.')) return;
      const r = await api.verlassen(k.code, k.spieler);   // der Server löscht den Eintrag; im Gerät wird in jedem Fall aufgeräumt
      store.klasse = null; form();
      toast(r.ok ? 'Du hast die Klasse verlassen. Dein Eintrag wurde gelöscht.' : 'Im Gerät entfernt. Der Server war nicht erreichbar – der Eintrag verfällt dort von selbst.');
    };
    const r = await api.rangliste(k.code, k.spieler);
    $('#kl-list', el).innerHTML = !r.ok ? `<div class="note bad">${esc(r.error || 'Rangliste nicht erreichbar.')}</div>`
      : r.liste?.length ? r.liste.map((p, i) => `<div class="card row ${p.ich ? 'me' : ''}"><b class="num sm">${i + 1}</b><span class="grow">${esc(p.name)}${p.ich ? ' <small class="muted">(du)</small>' : ''}</span><b>${Number(p.punkte) || 0}</b></div>`).join('')
        : '<div class="card"><small class="muted">Noch keine Ergebnisse in dieser Woche. Spiel die Tages-Runde!</small></div>';
  }
  function form() {
    el.innerHTML = `<a class="back" href="#/pruefung">${ICON.left} Prüfung</a><div><span class="eyebrow">Klasse</span><h1 style="margin-top:8px">Rangliste für eure Klasse</h1><p class="lead" style="margin-top:8px">Mit einem Code tretet ihr gemeinsam bei. Es gibt kein Konto – nur einen Spitznamen.</p></div>
      <section class="card stack"><label for="kl-code"><b>Klassen-Code</b></label><input class="field" id="kl-code" maxlength="6" autocomplete="off" autocapitalize="characters" placeholder="z. B. K7M2QX">
        <label for="kl-name"><b>Spitzname</b></label><input class="field" id="kl-name" maxlength="16" autocomplete="off" placeholder="Kein echter Name nötig">
        <div id="kl-note"></div><button class="btn block" id="kl-join" type="button">Beitreten</button></section>
      <details class="card stack"><summary><b>Neue Klasse anlegen</b> <small class="muted">(für Lehrkräfte oder Klassensprecher)</small></summary>
        <label for="kl-new"><b>Name der Klasse</b></label><input class="field" id="kl-new" maxlength="30" autocomplete="off" placeholder="z. B. Q12 Mathe">
        <div id="kl-newnote"></div><button class="btn ghost block" id="kl-make" type="button">Code erzeugen</button></details>`;
    $('#kl-make', el).onclick = async () => {
      const name = $('#kl-new', el).value.trim(), note = $('#kl-newnote', el);
      if (name.length < 2) { note.innerHTML = '<div class="note bad">Der Name braucht 2 bis 30 Zeichen.</div>'; return; }
      const r = await api.klasseNeu(name);
      if (!r.ok || !r.code) { note.innerHTML = `<div class="note bad">${esc(r.error || 'Anlegen nicht möglich.')}</div>`; return; }
      note.innerHTML = `<div class="note ok"><b>Code: ${esc(r.code)}</b> – gib ihn an deine Klasse weiter. Er steht jetzt oben im Feld; wähle noch einen Spitznamen und tritt bei.</div>`;
      $('#kl-code', el).value = r.code; sfx('ok');
    };
    $('#kl-join', el).onclick = async () => {
      const code = $('#kl-code', el).value.trim().toUpperCase(), name = $('#kl-name', el).value.trim(), note = $('#kl-note', el);
      if (!codeOk(code)) { note.innerHTML = '<div class="note bad">Der Code hat 6 Zeichen (Buchstaben und Ziffern).</div>'; return; }
      if (!nameOk(name)) { note.innerHTML = '<div class="note bad">Der Spitzname braucht 2 bis 16 Zeichen.</div>'; return; }
      const r = await api.beitreten(code, name);
      if (!r.ok) { note.innerHTML = `<div class="note bad">${esc(r.error || 'Beitreten nicht möglich.')}</div>`; return; }
      store.klasse = { code, name: r.klasse || '', spitzname: name, spieler: r.spieler }; sfx('ok'); board();
    };
  }
  if (store.klasse) board(); else form();
  return { el };
}

/* ───────────── Lehrplan: Was gilt wo? ───────────── */
export const LEHRPLAN = [
  ['Bayern', 'LehrplanPLUS Gymnasium, Jahrgangsstufen 11–13. In Mathematik gibt es nur das erhöhte Anforderungsniveau.', 'Alle Einheiten der App gehören zum Prüfungsstoff. Der Hypothesentest wird nur einseitig verlangt.'],
  ['Hessen – Leistungskurs', 'Kerncurriculum gymnasiale Oberstufe (Ausgabe 2024) und Abiturerlasse 2027/2028.', 'Fast alles gehört zum Prüfungsstoff. Kein Prüfungsstoff in Hessen: gebrochen-rationale Funktionen mit Polstellen und Asymptoten (dort nur 1/xⁿ) und Kugeln – in der App als „in Hessen kein Prüfungsstoff“ markiert.'],
  ['Hessen – Grundkurs', 'Kerncurriculum gymnasiale Oberstufe (Ausgabe 2024) und Abiturerlasse 2027/2028.', 'Kein Prüfungsstoff: Hypothesentests, Normalverteilung und Sigma-Regeln, Ableiten der ln-Funktion, Kreuzprodukt, gebrochen-rationale Funktionen, Rotationskörper und uneigentliche Integrale, Kugeln, Abstand Punkt–Gerade, Lage zweier Ebenen, logistisches Wachstum, Normalenform. Diese Teile sind in der App mit „nicht im Grundkurs“ markiert und kommen im Abi-Modus, im Boss und im freien Üben nicht vor.'],
];
export function lehrplanView() {
  const el = h(`<div class="view stack">
    <a class="back" href="#/einstellungen">${ICON.left} Einstellungen</a>
    <div><span class="eyebrow">Lehrplan</span><h1 style="margin-top:8px">Was gilt wo?</h1><p class="lead" style="margin-top:8px">Abgleich der Einheiten mit den offiziellen Vorgaben, Stand 13.11.2026.</p></div>
    ${LEHRPLAN.map(([land, quelle, text]) => `<section class="card stack"><h3>${esc(land)}</h3><p>${esc(text)}</p><small class="muted">Grundlage: ${esc(quelle)}</small></section>`).join('')}
    <section class="card stack"><h3>Bitte beachten</h3><small class="muted">Der Abgleich ist sorgfältig aus den amtlichen Texten erstellt, ersetzt aber nicht die Auskunft deiner Lehrkraft. Schulen dürfen die Reihenfolge der Themen verschieben, und Vorgaben ändern sich von Jahrgang zu Jahrgang. Die Grundlagen-Einheiten wiederholen Stoff der Mittelstufe.</small></section>
  </div>`);
  return { el };
}
