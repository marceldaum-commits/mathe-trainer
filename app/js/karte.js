// Karte mit Geschichte: der Lernpfad als Reise durch drei Länder. Jede Einheit ist eine Station,
// ihr Boss bewacht sie. Die Karte zeigt nur, was ohnehin gespeichert ist – sie ändert nichts am Fortschritt.
import { h, esc, ICON } from './ui.js';
import { store } from './store.js';
import { UNITS, unitExtra } from './units.js';
import { figurFor, pi } from './figuren.js';

/** Die drei Länder der Geschichte, in der Reihenfolge der Reise. */
export const LAENDER_KARTE = [
  { id: 'analysis', name: 'Das Kurvental', farbe: ['#ff7418', '#d85042'],
    text: ['Im Kurvental hängt der Nebel am dichtesten. Keiner sieht mehr, wo ein Graph steigt und wo er fällt.', 'Der Nebel im Kurvental lichtet sich. Die ersten Wege sind wieder frei.', 'Das Kurvental liegt klar vor dir – jede Kurve lässt sich wieder lesen.'] },
  { id: 'stochastik', name: 'Die Würfelküste', farbe: ['#2f6fd0', '#173a74'],
    text: ['An der Würfelküste regiert der Zufall. Niemand traut sich mehr, etwas vorherzusagen.', 'An der Würfelküste wird wieder gerechnet statt geraten.', 'Die Würfelküste ist frei – der Zufall hat seinen Schrecken verloren.'] },
  { id: 'geometrie', name: 'Das Vektorgebirge', farbe: ['#3fbf88', '#177a52'],
    text: ['Im Vektorgebirge sind alle Wegweiser verschwunden. Ohne Richtung kommt hier keiner durch.', 'Im Vektorgebirge stehen die ersten Wegweiser wieder.', 'Das Vektorgebirge ist vermessen – jeder Punkt hat wieder seinen Platz.'] },
];
export const INTRO = 'Über dem Land Mathea liegt Nebel. Seit die Wächter die Wege versperren, findet niemand mehr durch das Kurvental, die Würfelküste und das Vektorgebirge. Pi kennt die Pfade – aber gegen die Wächter braucht Pi dich. Station für Station räumt ihr den Weg frei, bis zum Abi-Tor.';

/** Stationen eines Landes: Grundlagen zuerst, Zusatz-Stoff zuletzt (wie in der Gebiets-Übersicht). */
export function stationen(areaId, land = store.land) {
  return UNITS.filter((u) => u.area === areaId).sort((x, y) => (y.grund ? 1 : 0) - (x.grund ? 1 : 0) || (unitExtra(x, land) ? 1 : 0) - (unitExtra(y, land) ? 1 : 0));
}
/** Wo steht Pi? An der ersten Station der Reise, die noch nicht fertig ist (Zusatz-Stoff zählt nicht). */
export function standort(land = store.land) {
  for (const l of LAENDER_KARTE) for (const u of stationen(l.id, land)) if (!unitExtra(u, land) && !store.unitProgress(u).done) return u.id;
  return null;
}
/** Zickzack-Weg: Punkt i von n in einem Feld der Breite 320. */
export const punkt = (i) => ({ x: [70, 160, 250, 160][i % 4], y: 60 + i * 104 });
export const hoehe = (n) => 60 + (n - 1) * 104 + 84;

function landKarte(l, hier) {
  const us = stationen(l.id), n = us.length, H = hoehe(n);
  const done = us.filter((u) => store.unitProgress(u).done).length, phase = done === 0 ? 0 : done >= us.filter((u) => !unitExtra(u)).length ? 2 : 1;
  const pts = us.map((_, i) => punkt(i));
  const weg = pts.map((p, i) => (i === 0 ? `M${p.x} ${p.y}` : `C${pts[i - 1].x} ${pts[i - 1].y + 52} ${p.x} ${p.y - 52} ${p.x} ${p.y}`)).join(' ');
  const nodes = us.map((u, i) => {
    const p = pts[i], pr = store.unitProgress(u), bossDa = !store.isDone(u.id, 'boss'), zusatz = unitExtra(u);
    const seite = p.x > 200 ? 'links' : 'rechts';
    return `<a class="k-st ${pr.done ? 'fertig' : pr.n ? 'begonnen' : ''} ${zusatz ? 'zusatz' : ''} ${u.id === hier ? 'hier' : ''} ${seite}" href="#/u/${u.id}" style="left:${(p.x / 320) * 100}%;top:${(p.y / H) * 100}%" data-u="${u.id}">
      <span class="k-fig">${u.bossName ? figurFor(u.bossName, u.bossSymbol, { grau: !bossDa }) : ''}${u.id === hier ? `<span class="k-pi">${pi()}</span>` : ''}</span>
      <span class="k-txt"><b>${esc(u.title)}</b><small>${pr.done ? 'Weg frei' : u.bossName ? `${esc(u.bossName)} ${bossDa ? 'bewacht die Station' : 'ist besiegt'}` : ''}${zusatz ? ' · Zusatz' : ''} · ${pr.n}/${pr.total}</small></span></a>`;
  }).join('');
  return `<section class="k-land" id="k-${l.id}" style="--k1:${l.farbe[0]};--k2:${l.farbe[1]}">
    <div class="k-kopf"><span class="eyebrow">${done}/${n} Stationen frei</span><h2>${esc(l.name)}</h2><p>${esc(l.text[phase])}</p></div>
    <div class="k-feld ${phase === 2 ? 'klar' : ''}" style="aspect-ratio:320/${H}">
      <svg viewBox="0 0 320 ${H}" preserveAspectRatio="none" aria-hidden="true"><path class="k-weg" d="${weg}"/></svg>${nodes}</div></section>`;
}

export function karteView() {
  const hier = standort(), alle = LAENDER_KARTE.flatMap((l) => stationen(l.id)), frei = alle.filter((u) => store.unitProgress(u).done).length;
  const el = h(`<div class="view stack karte">
    <a class="back" href="#/lernen">${ICON.left} Lernen</a>
    <section class="board k-intro"><div class="board-top"><span>DIE REISE DURCH MATHEA</span><b>● ${frei}/${alle.length}</b></div>
      <div class="k-erz"><span class="k-pi gross">${pi()}</span><p>${esc(INTRO)}</p></div>
      ${hier ? `<a class="btn" id="k-weiter" href="#/u/${hier}">Zu Pi: ${esc(UNITS.find((u) => u.id === hier).title)} ${ICON.right}</a>` : '<p><b>Alle Wege sind frei.</b> Mathea liegt im Sonnenlicht.</p>'}</section>
    ${LAENDER_KARTE.map((l) => landKarte(l, hier)).join('')}
    <section class="card k-tor"><span class="k-fig">${figurFor('Der Abi-Drache', 'Abi', { form: 'zack', farbe: ['#ff7418', '#d85042'], horn: 1 })}</span>
      <span><h3>Das Abi-Tor</h3><small>Hinter dem Tor wartet die Prüfung – und im Abenteuer-Modus der Abi-Drache.</small>
      <span class="row" style="margin-top:10px"><a class="btn small" href="#/abenteuer">Abenteuer</a><a class="btn ghost small" href="#/pruefung">Prüfung</a></span></span></section>
  </div>`);
  return { el };
}
