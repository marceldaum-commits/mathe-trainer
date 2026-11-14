// Lernkarten: Formeln der begonnenen Einheiten und eigene Karten, wiederholt in wachsenden Abständen
// (Karteikasten mit sechs Fächern). Alles bleibt im Gerät – ohne Server, ohne KI.
import { $, h, tex, esc, ICON, sfx, buzz } from './ui.js';
import { store, dayKey } from './store.js';
import { UNITS } from './units.js';

/** Abstand in Tagen bis zur nächsten Wiederholung, je Fach. */
export const FACH_TAGE = [0, 1, 3, 7, 14, 30];
/** So viele Karten hat eine Runde höchstens – lieber mehrere kurze Runden als eine endlose. */
export const RUNDE_MAX = 20;
export const plusTage = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

/** Alle Karten: Formeln aus Einheiten, in denen schon etwas geschafft wurde (sonst die Grundlagen), plus eigene. */
export function stapel() {
  const begonnen = UNITS.filter((u) => u.formeln?.length && store.unitProgress(u).n > 0), us = begonnen.length ? begonnen : UNITS.filter((u) => u.grund && u.formeln?.length);
  const formeln = us.flatMap((u) => u.formeln.map(([name, f], i) => ({ key: `f:${u.id}:${i}`, thema: u.title, vorn: esc(name), hinten: `<div class="formula">${tex(f, true)}</div>`, eigen: false })));
  const eigene = store.lernEigene.map((k) => ({ key: `e:${k.id}`, id: k.id, thema: 'Eigene Karte', vorn: esc(k.vorn), hinten: `<p>${esc(k.hinten)}</p>`, eigen: true }));
  return [...eigene, ...formeln];
}
/** Welche Karten sind heute dran? Neue Karten (ohne Stand) gelten als fällig. */
export function faellig(karten = stapel(), today = new Date()) {
  const t = dayKey(today), s = store.lernStand;
  return karten.filter((k) => !s[k.key] || s[k.key].ab <= t);
}
/** Antwort verbuchen: gewusst → ein Fach weiter, nicht gewusst → zurück ins erste Fach (morgen wieder). */
export function verbuche(key, gewusst, today = new Date()) {
  const alt = store.lernStand[key]?.fach ?? 0, fach = gewusst ? Math.min(FACH_TAGE.length - 1, alt + 1) : 1;
  store.lernSetze(key, fach, dayKey(plusTage(today, FACH_TAGE[fach])));
  return fach;
}

export function kartenView() {
  const el = h('<div class="view stack"></div>');
  function start() {
    const alle = stapel(), dran = faellig(alle);
    el.innerHTML = `<a class="back" href="#/mehr">${ICON.left} Mehr</a>
      <div><span class="eyebrow">Lernkarten</span><h1 style="margin-top:8px">${dran.length} von ${alle.length} heute dran</h1><p class="lead" style="margin-top:8px">Formeln aus deinen Einheiten und eigene Karten. Was du weißt, kommt seltener – was noch hakt, morgen wieder.</p></div>
      <div class="row"><button class="btn block" id="lk-go" type="button"${dran.length ? '' : ' disabled'}>${dran.length ? (dran.length > RUNDE_MAX ? `${RUNDE_MAX} Karten lernen` : 'Karten lernen') : 'Für heute alles gelernt'}</button></div>
      <section class="card stack"><h3>Eigene Karte anlegen</h3>
        <input class="field" id="lk-vorn" type="text" maxlength="200" placeholder="Vorderseite, z. B. „Kettenregel“" aria-label="Vorderseite">
        <textarea class="field" id="lk-hinten" rows="3" maxlength="300" placeholder="Rückseite, z. B. „äußere mal innere Ableitung“" aria-label="Rückseite"></textarea>
        <button class="btn ghost" id="lk-neu" type="button">Karte speichern</button><div id="lk-note"></div></section>
      ${store.lernEigene.length ? `<section class="card stack"><h3>Deine eigenen Karten (${store.lernEigene.length})</h3>${store.lernEigene.map((k) => `<div class="row lk-zeile"><span class="grow"><b>${esc(k.vorn)}</b><br><small class="muted">${esc(k.hinten)}</small></span><button class="x lk-weg" type="button" data-id="${k.id}" aria-label="Karte löschen">${ICON.close}</button></div>`).join('')}</section>` : ''}`;
    $('#lk-go', el).onclick = () => { sfx('tap'); runde(dran.slice(0, RUNDE_MAX)); };
    $('#lk-neu', el).onclick = () => {
      const v = $('#lk-vorn', el).value.trim(), r = $('#lk-hinten', el).value.trim();
      if (v.length < 2 || r.length < 2) { $('#lk-note', el).innerHTML = '<div class="note tip">Bitte Vorder- und Rückseite ausfüllen.</div>'; return; }
      store.lernNeu(v, r); sfx('ok'); start();
    };
    el.querySelectorAll('.lk-weg').forEach((b) => { b.onclick = () => { store.lernWeg(b.dataset.id); start(); }; });
  }
  function runde(karten) {
    let i = 0, gewusst = 0;
    const zeige = () => {
      if (i >= karten.length) {
        store.touch(); store.bonus(karten.length); store.bump('lernkarten', karten.length);
        el.innerHTML = `<section class="board" style="text-align:center"><div class="board-top"><span>LERNKARTEN</span><b>● FERTIG</b></div><h2 id="lk-ende">${gewusst} von ${karten.length} gewusst</h2><p>Was noch nicht saß, kommt morgen wieder.</p></section>
          <div class="row"><button class="btn block" id="lk-zurueck" type="button">Zur Übersicht</button></div>`;
        $('#lk-zurueck', el).onclick = start; sfx('win'); window.dispatchEvent(new Event('mt-ruhig')); return;
      }
      const k = karten[i];
      el.innerHTML = `<div class="stephead"><a class="x" href="#/karten" id="lk-x" aria-label="Schließen">${ICON.close}</a><div class="prog"><i style="width:${Math.round((i / karten.length) * 100)}%"></i></div></div>
        <div id="stage"><div class="stack"><section class="card lk-karte" id="lk-karte"><small class="muted">${esc(k.thema)}</small><h2 class="lk-vorn">${k.vorn}</h2><div class="lk-hinten" id="lk-rueck" hidden>${k.hinten}</div></section>
          <div class="row" id="lk-row"><button class="btn block" id="lk-dreh" type="button">Umdrehen</button></div></div></div>`;
      $('#lk-x', el).onclick = (ev) => { ev.preventDefault(); start(); };
      $('#lk-dreh', el).onclick = () => {
        $('#lk-rueck', el).hidden = false; sfx('tap');
        $('#lk-row', el).innerHTML = '<button class="btn ghost grow" id="lk-nein" type="button">Noch nicht</button><button class="btn grow" id="lk-ja" type="button">Wusste ich</button>';
        const weiter = (ok) => { verbuche(k.key, ok); if (ok) { gewusst++; buzz(12); } i++; zeige(); };
        $('#lk-ja', el).onclick = () => weiter(true); $('#lk-nein', el).onclick = () => weiter(false);
      };
    };
    zeige();
  }
  start();
  return { el };
}
