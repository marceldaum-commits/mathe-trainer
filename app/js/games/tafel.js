// Vierfeldertafel füllen: Aus wenigen Angaben die ganze Tafel erschließen – Zeile für Zeile, Spalte für Spalte.
import { h, buzz, sfx, esc } from '../ui.js';
import { store } from '../store.js';

/** Alle neun Felder einer Tafel: innen a b / c d, Rand r1 r2 (Zeilen), c1 c2 (Spalten), n (gesamt). */
export const KEYS = ['a', 'b', 'r1', 'c', 'd', 'r2', 'c1', 'c2', 'n'];
export function full(R) {
  const [a, b, c, d] = R.cells;
  return { a, b, c, d, r1: a + b, r2: c + d, c1: a + c, c2: b + d, n: a + b + c + d };
}

const T = (title, A, nA, B, nB, cells, given, text) => ({ title, A, nA, B, nB, cells, given, text });
const LEICHT = [
  T('Sportverein', 'im Verein', 'nicht im Verein', 'Mädchen', 'Jungen', [8, 6, 5, 9], ['a', 'b', 'c', 'd']),
  T('Führerschein', 'bestanden', 'nicht bestanden', 'erster Versuch', 'zweiter Versuch', [14, 4, 6, 1], ['a', 'b', 'c', 'c2', 'n']),
  T('Mensa', 'isst vegetarisch', 'isst Fleisch', 'Unterstufe', 'Oberstufe', [12, 18, 28, 22], ['n', 'r1', 'c1', 'a', 'd']),
];
const MITTEL = [
  T('Haustiere', 'hat ein Haustier', 'hat kein Haustier', 'Stadt', 'Land', [18, 27, 42, 13], ['n', 'r1', 'c1', 'a']),
  T('Bus oder Rad', 'kommt mit dem Bus', 'kommt mit dem Rad', 'wohnt im Ort', 'wohnt außerhalb', [9, 36, 41, 14], ['n', 'r1', 'a', 'd']),
  T('Qualitätskontrolle', 'fehlerfrei', 'fehlerhaft', 'Maschine 1', 'Maschine 2', [112, 68, 8, 12], ['c1', 'c2', 'a', 'd']),
];
const SCHWER = [
  T('Medikamententest', 'geheilt', 'nicht geheilt', 'Medikament', 'Placebo', [84, 36, 36, 44], [],
    'An einer Studie nehmen 200 Personen teil. 120 erhalten das Medikament, die übrigen ein Placebo. Insgesamt werden 120 Personen geheilt, davon 36 aus der Placebo-Gruppe.'),
  T('Schnelltest', 'Test positiv', 'Test negativ', 'krank', 'gesund', [45, 19, 5, 931], [],
    'Von 1000 Personen sind 50 krank. Der Test erkennt 45 der Kranken. Von den Gesunden erhalten 19 fälschlich ein positives Ergebnis.'),
  T('Umfrage', 'nutzt die App', 'nutzt sie nicht', 'unter 18', 'ab 18', [156, 84, 104, 56], [],
    'Befragt wurden 400 Personen, davon 260 unter 18. 60 % aller Befragten nutzen die App. Von den Befragten ab 18 nutzen 56 die App nicht.'),
];
export const LEVELS = MITTEL;
const SEHR_LEICHT = [
  T('Klassenfahrt', 'fährt mit', 'bleibt da', 'Klasse 10a', 'Klasse 10b', [20, 18, 5, 7], ['a', 'b', 'c', 'd']),
  T('Geschwister', 'hat Geschwister', 'Einzelkind', 'Mädchen', 'Jungen', [9, 7, 4, 5], ['a', 'b', 'c', 'd', 'r1']),
  T('Frühstück', 'frühstückt', 'frühstückt nicht', 'Unterstufe', 'Oberstufe', [30, 15, 10, 25], ['a', 'b', 'c', 'd', 'n']),
];
const ANSPRUCH = [
  T('Wahlfach', 'wählt Informatik', 'wählt Kunst', 'Klasse 11', 'Klasse 12', [34, 26, 41, 19], ['r1', 'c1', 'n', 'd']),
  T('Impfung', 'geimpft', 'nicht geimpft', 'erkrankt', 'gesund', [12, 188, 48, 52], ['n', 'c1', 'a', 'r2']),
  T('Lieferdienst', 'pünktlich', 'verspätet', 'Fahrrad', 'Auto', [72, 48, 18, 62], [],
    'Ein Lieferdienst wertet 200 Fahrten aus. 90 Fahrten wurden mit dem Fahrrad gemacht, davon waren 72 pünktlich. Insgesamt waren 80 Fahrten verspätet.'),
];
/** Eigene Level für jede der fünf Schwierigkeiten. */
export const levelsFor = (lv) => [SEHR_LEICHT, LEICHT, MITTEL, ANSPRUCH, SCHWER][Math.min(5, Math.max(1, lv | 0 || 3)) - 1];

export function tafel(el, ctx) {
  const LS = levelsFor(store.level);
  let ri = 0, tries = 0, total = 0, solved = false;

  el.innerHTML = `<div class="stack">
    <div class="mission"><b class="tag" id="tf-n"></b><p><span id="tf-t"></span><small id="tf-s"></small></p></div>
    <div class="tafel-wrap"><table class="tafel" id="tf"></table></div>
    <div id="tf-note"></div>
    <div class="row"><button class="btn block" id="tf-go" type="button">Prüfen</button></div></div>`;
  const note = el.querySelector('#tf-note'), go = el.querySelector('#tf-go'), table = el.querySelector('#tf');

  function load() {
    const R = LS[ri], sol = full(R);
    tries = 0; solved = false;
    el.querySelector('#tf-n').textContent = `${ri + 1}/${LS.length}`;
    el.querySelector('#tf-t').textContent = R.text || `${R.title}: Fülle die Vierfeldertafel aus.`;
    el.querySelector('#tf-s').textContent = R.text ? 'Trage erst die Angaben aus dem Text ein, dann den Rest.' : (store.level >= 4 ? '' : 'Jede Zeile und jede Spalte ergibt ihre Summe.');
    const cell = (k) => (R.given.includes(k)
      ? `<td class="fix">${sol[k]}</td>`
      : `<td><input id="tf-${k}" data-k="${k}" type="text" inputmode="numeric" autocomplete="off" maxlength="5" aria-label="Feld ${k}"${window.__mtTest ? ` data-sol="${sol[k]}"` : ''}></td>`);
    table.innerHTML = `<tr><th></th><th>${esc(R.B)}</th><th>${esc(R.nB)}</th><th>gesamt</th></tr>
      <tr><th>${esc(R.A)}</th>${cell('a')}${cell('b')}${cell('r1')}</tr>
      <tr><th>${esc(R.nA)}</th>${cell('c')}${cell('d')}${cell('r2')}</tr>
      <tr><th>gesamt</th>${cell('c1')}${cell('c2')}${cell('n')}</tr>`;
    table.querySelectorAll('input').forEach((inp) => inp.addEventListener('input', () => {
      inp.classList.remove('ok', 'no');
      if (solved) return;
      note.innerHTML = '';
    }));
    note.innerHTML = ''; go.textContent = 'Prüfen';
  }

  go.addEventListener('click', () => {
    if (solved) {
      if (ri < LS.length - 1) { ri++; ctx.progress(ri / LS.length); load(); window.scrollTo(0, 0); return; }
      ctx.progress(1); ctx.done({ stars: Math.max(1, Math.round(total / LS.length)) }); return;
    }
    const R = LS[ri], sol = full(R), inputs = [...table.querySelectorAll('input')];
    const empty = inputs.filter((i) => i.value.trim() === '');
    if (empty.length) { note.innerHTML = `<div class="note tip">Es ${empty.length === 1 ? 'fehlt noch ein Feld' : `fehlen noch ${empty.length} Felder`}.</div>`; empty[0].focus(); return; }
    tries++;
    let wrong = 0;
    inputs.forEach((i) => { const good = Number(i.value.trim().replace(',', '.')) === sol[i.dataset.k]; i.classList.toggle('ok', good); i.classList.toggle('no', !good); if (!good) wrong++; });
    if (!wrong) {
      solved = true; sfx('ok'); buzz(20);
      total += tries <= 1 ? 3 : tries <= 3 ? 2 : 1;
      inputs.forEach((i) => { i.readOnly = true; });
      const pct = Math.round((sol.a / sol.c1) * 100);
      note.innerHTML = `<div class="note ok"><b>Stimmt.</b> Damit lässt sich jetzt alles ablesen – zum Beispiel: Unter „${esc(R.B)}“ ist der Anteil „${esc(R.A)}“ ${sol.a} von ${sol.c1}, also rund ${pct} %.</div>`;
      go.textContent = ri < LS.length - 1 ? 'Nächste Tafel' : 'Fertig';
    } else {
      sfx('bad');
      const v = Object.fromEntries(inputs.map((i) => [i.dataset.k, Number(i.value.trim().replace(',', '.'))])), g = (k) => (k in v ? v[k] : sol[k]);
      const why = g('a') + g('b') !== g('r1') ? 'Die erste Zeile ergibt nicht ihre Summe.' : g('c') + g('d') !== g('r2') ? 'Die zweite Zeile ergibt nicht ihre Summe.'
        : g('a') + g('c') !== g('c1') ? 'Die erste Spalte ergibt nicht ihre Summe.' : g('b') + g('d') !== g('c2') ? 'Die zweite Spalte ergibt nicht ihre Summe.'
        : g('r1') + g('r2') !== g('n') ? 'Die beiden Zeilensummen ergeben nicht die Gesamtzahl.' : 'Die Summen passen zueinander, aber nicht zu den Angaben. Lies die Angaben noch einmal genau.';
      note.innerHTML = `<div class="note tip"><b>${wrong === 1 ? 'Ein Feld stimmt' : `${wrong} Felder stimmen`} noch nicht.</b> ${why}</div>`;
    }
  });

  load();
}
