// Klassenarbeits-Trainer: Termin und Themen eintragen – die App macht daraus einen Plan für jeden Tag.
import { h, $, esc, ICON, sfx, confetti } from './ui.js';
import { store, dayKey } from './store.js';
import { UNITS, ALLE_UNITS, istOber } from './units.js';
import { quiz } from './quiz.js';
import { pick } from './math.js';
import { CONFIG } from './config.js';
import { themaVon } from './eltern.js';
import { linkMitHerkunft } from './zaehler.js';

const tagVon = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
/** Ganze Tage von heute bis zum Datum (negativ: vorbei). */
export const tageBis = (datum, heute = new Date()) => Math.round((tagVon(datum) - new Date(heute.getFullYear(), heute.getMonth(), heute.getDate())) / 86400000);

/**
 * Der Plan: was offen ist und was heute dran ist.
 * Die offenen Schritte werden gleichmäßig auf die Tage bis zum Vortag der Arbeit verteilt (höchstens 6 am Tag);
 * der letzte Tag vor der Arbeit bleibt zum Wiederholen frei, sobald genug Zeit ist.
 */
/** Vor Klausuren: Link zur Probestunden-Anfrage mit Herkunft, Thema und Klasse (Marcel 18.11.: Crashkurs bleibt nur für Kunden). */
export const probeLink = (p, jg = store.jahrgang) => linkMitHerkunft(CONFIG.probestunde, 'klassenarbeit',
  { thema: p?.units?.[0] ? themaVon(p.units[0].title, istOber()) : '', klasse: jg });
export function arbeitPlan(arbeit, units = ALLE_UNITS, fertig = (u, s) => store.isDone(u, s), heute = new Date()) {
  if (!arbeit) return null;
  const us = arbeit.units.map((id) => units.find((u) => u.id === id)).filter(Boolean);
  const alle = us.flatMap((u) => u.steps.map((s, i) => ({ u, i, s })));
  const offen = alle.filter((x) => !fertig(x.u.id, x.s.id));
  const tage = tageBis(arbeit.datum, heute);
  const lernTage = Math.max(1, tage >= 3 ? tage - 1 : tage);
  const proTag = offen.length ? Math.min(6, Math.max(1, Math.ceil(offen.length / lernTage))) : 0;
  return { tage, units: us, total: alle.length, erledigt: alle.length - offen.length, offen, heute: tage < 0 ? [] : offen.slice(0, proTag), proTag,
    knapp: tage >= 0 && offen.length > lernTage * 6, phase: tage < 0 ? 'vorbei' : tage === 0 ? 'heute' : !offen.length ? 'fit' : 'lernen' };
}
/** Aufgaben-Arten der gewählten Einheiten (für den Themen-Mix). */
export const arbeitGens = (us) => [...new Set(us.flatMap((u) => u.bossGens || []))];

const datumText = (s) => tagVon(s).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });

export function arbeitView(onEnd) {
  const el = h('<div class="view stack"></div>');
  const wort = istOber() ? 'Klausur' : 'Klassenarbeit';
  function formular() {
    const alt = store.arbeit, min = dayKey(), gewaehlt = new Set(alt?.units || []);
    el.innerHTML = `<a class="back" href="#/pruefung">${ICON.left} Zurück</a>
      <div><span class="eyebrow">${wort}s-Trainer</span><h1 style="margin-top:8px">Wann schreibst du?</h1>
      <p class="lead" style="margin-top:8px">Trag den Termin ein und tippe die Themen an, die drankommen. Du bekommst für jeden Tag einen kleinen Plan – ohne Stress am letzten Abend.</p></div>
      <section class="card stack"><label for="ar-datum"><b>Termin der ${wort}</b></label><input id="ar-datum" type="date" min="${min}" value="${esc(alt?.datum || '')}"></section>
      <section class="card stack"><h3>Welche Themen kommen dran?</h3><div class="ar-themen" id="ar-themen">${UNITS.map((u) => `<button class="check ${gewaehlt.has(u.id) ? 'on' : ''}" type="button" role="checkbox" aria-checked="${gewaehlt.has(u.id)}" data-u="${u.id}"><span>${esc(u.title)}</span></button>`).join('')}</div></section>
      <div id="ar-note"></div>
      <button class="btn block" id="ar-los" type="button">Plan erstellen</button>${alt ? '<button class="btn ghost block" id="ar-weg" type="button">Plan löschen</button>' : ''}`;
    el.querySelectorAll('#ar-themen .check').forEach((b) => { b.onclick = () => { const an = !b.classList.contains('on'); b.classList.toggle('on', an); b.setAttribute('aria-checked', an); sfx('tap'); }; });
    $('#ar-los', el).onclick = () => {
      const datum = $('#ar-datum', el).value, units = [...el.querySelectorAll('#ar-themen .check.on')].map((b) => b.dataset.u);
      const fehlt = !/^\d{4}-\d{2}-\d{2}$/.test(datum) ? 'Bitte trag den Termin ein.' : tageBis(datum) < 0 ? 'Der Termin liegt in der Vergangenheit.' : !units.length ? 'Bitte wähle mindestens ein Thema.' : '';
      if (fehlt) { $('#ar-note', el).innerHTML = `<div class="note tip">${fehlt}</div>`; return; }
      store.arbeit = { datum, units }; sfx('ok'); onEnd?.(); plan();
    };
    const weg = $('#ar-weg', el); if (weg) weg.onclick = () => { store.arbeit = null; onEnd?.(); formular(); };
  }
  function plan() {
    const p = arbeitPlan(store.arbeit);
    if (!p || !p.units.length) { store.arbeit = null; return formular(); }
    const proz = p.total ? Math.round((p.erledigt / p.total) * 100) : 100, gens = arbeitGens(p.units);
    const kopf = p.phase === 'vorbei' ? `<section class="board" style="text-align:center"><h2>Die ${wort} ist geschrieben</h2><p>Wie lief es? Wenn du magst, plane gleich die nächste.</p></section>`
      : `<a class="card count" id="ar-count"><b class="big">${p.tage}</b><span><h3>${p.tage === 0 ? `Heute ist die ${wort}` : `${p.tage === 1 ? 'Tag' : 'Tage'} bis zur ${wort}`}</h3><small class="muted">${esc(datumText(store.arbeit.datum))} · ${esc(p.units.map((u) => u.title).join(' · '))}</small></span></a>`;
    const heute = p.phase === 'heute' ? '<div class="note ok"><b>Viel Erfolg!</b> Heute nichts Neues mehr lernen. Lies die Aufgaben in Ruhe, fang mit der an, die dir leichtfällt, und heb dir fünf Minuten zum Nachrechnen auf.</div>'
      : p.phase === 'fit' ? '<div class="note ok"><b>Alle Schritte geschafft.</b> Jetzt hilft Wiederholen: Mach jeden Tag einen Themen-Mix, bis es locker von der Hand geht.</div>'
      : p.phase === 'lernen' ? `<section class="stack" id="ar-heute"><h2>Heute dran</h2>${p.knapp ? '<div class="note tip">Es ist viel Stoff für die Zeit. Nimm dir die Themen zuerst vor, bei denen du unsicher bist.</div>' : ''}${p.heute.map((x) => `<a class="card unit" href="#/u/${x.u.id}/${x.i}"><span class="num">${x.i + 1}</span><span><h3>${esc(x.s.title)}</h3><small>${esc(x.u.title)} · ${esc(x.s.kind)}</small></span><span class="go">${ICON.right}</span></a>`).join('')}
          <small class="muted">${p.offen.length} ${p.offen.length === 1 ? 'Schritt ist' : 'Schritte sind'} insgesamt noch offen – etwa ${p.proTag} pro Tag reichen.</small></section>` : '';
    el.innerHTML = `<a class="back" href="#/pruefung">${ICON.left} Zurück</a>
      <div><span class="eyebrow">${wort}s-Trainer</span><h1 style="margin-top:8px">Dein Plan</h1></div>
      ${kopf}
      ${p.phase === 'vorbei' ? '' : `<section class="card stack"><div class="ar-balken"><div class="prog"><i style="width:${proz}%"></i></div><b id="ar-proz">${proz} %</b></div><small class="muted">${p.erledigt} von ${p.total} Schritten geschafft</small></section>`}
      ${heute}
      ${p.phase !== 'vorbei' && gens.length ? `<section class="stack"><h2>Wiederholen</h2><button class="card unit" id="ar-mix" type="button"><span class="num">8</span><span><h3>Themen-Mix</h3><small>Acht Aufgaben quer durch deine Themen – wie in der ${wort}.</small></span><span class="go">${ICON.right}</span></button>
        <a class="card unit" href="#/blatt"><span class="num">PDF</span><span><h3>Probe-Arbeit zum Ausdrucken</h3><small>Auf Papier üben, mit Lösungsblatt.</small></span><span class="go">${ICON.right}</span></a></section>` : ''}
      <button class="btn ghost block" id="ar-neu" type="button">${p.phase === 'vorbei' ? `Nächste ${wort} planen` : 'Termin oder Themen ändern'}</button>`;
    $('#ar-neu', el).onclick = () => { if (p.phase === 'vorbei') store.arbeit = null; formular(); };
    const mix = $('#ar-mix', el); if (mix) mix.onclick = () => mixRunde(gens);
  }
  function mixRunde(gens) {
    const N = 8, folge = Array.from({ length: N }, () => pick(gens));
    el.innerHTML = `<div class="stephead"><button class="x" id="ar-x" type="button" aria-label="Schließen">${ICON.close}</button><div class="prog"><i></i></div></div><div id="stage"></div>`;
    const bar = $('.prog i', el);
    $('#ar-x', el).onclick = plan;
    quiz(folge)($('#stage', el), { progress: (f) => { bar.style.width = `${Math.round(f * 100)}%`; },
      done: (res) => {
        const fehler = res.mistakes ?? 0, gain = 10 + 2 * Math.max(0, N - fehler);
        store.bonus(gain); store.touch(); store.bump('arbeitMix'); onEnd?.(); sfx('win'); if (fehler <= 1) confetti(30);
        el.innerHTML = `<section class="board" style="text-align:center"><div class="board-top"><span>THEMEN-MIX</span><b>● ERGEBNIS</b></div><div class="npbig" id="ar-end">${Math.max(0, N - fehler)}</div><h2>von ${N} auf Anhieb</h2>
          <p>${fehler <= 1 ? 'Das sitzt. Bleib dran, dann klappt es auch in der Arbeit.' : fehler <= 3 ? 'Schon gut! Schau dir die Stellen an, an denen du gezögert hast.' : 'Da ist noch Luft. Geh die offenen Schritte im Plan durch und probier es dann noch einmal.'}</p></section>
          <button class="btn block" id="ar-nochmal" type="button">Noch ein Mix</button><button class="btn ghost block" id="ar-zurueck" type="button">Zum Plan</button>`;
        $('#ar-nochmal', el).onclick = () => mixRunde(gens); $('#ar-zurueck', el).onclick = plan; window.scrollTo(0, 0);
      } });
  }
  if (store.arbeit) plan(); else formular();
  return { el };
}
