// Kopfrechen-Arena: 60 Sekunden, Zahlen eintippen, so viele wie möglich. Dazu jeden Tag eine Knobelaufgabe.
import { h, $, esc, ICON, sfx, buzz, confetti, funken } from './ui.js';
import { store, dayKey } from './store.js';
import { ri, pick } from './math.js';
import { streu, pi } from './figuren.js';

export const KOPF_SEKUNDEN = 60;
/** Die Übungsarten: [Kennung, Name, Beschreibung, ab Klasse (0 = alle)]. */
export const KOPF_ARTEN = [
  ['mal', 'Einmaleins', 'Malnehmen bis 10 mal 10 – und darüber hinaus.', 0],
  ['plus', 'Plus und Minus', 'Zweistellige Zahlen im Kopf.', 0],
  ['geteilt', 'Geteilt', 'Das Einmaleins rückwärts.', 0],
  ['quadrat', 'Quadratzahlen', 'Quadrate und Wurzeln bis 20.', 5],
  ['minus', 'Unter null', 'Rechnen mit negativen Zahlen.', 7],
  ['prozent', 'Prozente', 'Schnelle Anteile: 10 %, 25 %, 50 % …', 7],
];
const jgZahl = (jg) => (jg === 'os' ? 11 : +jg || 11);
/** Arten, die zur Klassenstufe passen. */
export const kopfArten = (jg = store.jahrgang) => KOPF_ARTEN.filter((a) => jgZahl(jg) >= a[3]);

/** Eine Aufgabe: { text, sol } – sol ist immer eine ganze Zahl. stufe 1 (leicht) bis 3 (schwer). */
export function kopfAufgabe(art, stufe = 2) {
  const s = Math.min(3, Math.max(1, stufe | 0 || 2));
  if (art === 'mal') { const a = ri(2, s === 1 ? 5 : 10), b = ri(2, s === 3 ? 15 : 10); return { text: `${a} · ${b}`, sol: a * b }; }
  if (art === 'geteilt') { const b = ri(2, s === 1 ? 5 : 10), q = ri(2, s === 3 ? 15 : 10); return { text: `${b * q} : ${b}`, sol: q }; }
  if (art === 'plus') { const max = [30, 60, 100][s - 1], a = ri(11, max), b = ri(3, max);
    return ri(0, 1) || b > a ? { text: `${a} + ${b}`, sol: a + b } : { text: `${a} − ${b}`, sol: a - b }; }
  if (art === 'quadrat') { const n = ri(2, [10, 15, 20][s - 1]); return ri(0, 2) ? { text: `${n}²`, sol: n * n } : { text: `√${n * n}`, sol: n }; }
  if (art === 'minus') { const m = [9, 15, 30][s - 1], a = ri(-m, m), b = ri(2, m), f = ri(2, 9), k = ri(0, s === 1 ? 1 : 2);
    return k === 0 ? { text: `${a} − ${b}`, sol: a - b } : k === 1 ? { text: `${-b} + ${Math.abs(a) + 1}`, sol: -b + Math.abs(a) + 1 } : { text: `(${-b}) · ${f}`, sol: -b * f }; }
  if (art === 'prozent') { const p = pick([[10, 50], [10, 25, 50], [5, 10, 20, 25, 75]][s - 1]), ggt = (x, y) => (y ? ggt(y, x % y) : x), G = ri(1, [10, 20, 30][s - 1]) * (100 / ggt(p, 100));
    return { text: `${p} % von ${G}`, sol: (G * p) / 100 }; }
  return kopfAufgabe('mal', s);
}
/** Text der Aufgabe passt zur Lösung? (für Tests) */
export function kopfProbe(q) {
  const t = q.text, z = (t.match(/-?\d+/g) || []).map(Number);
  if (/²/.test(t)) return z[0] ** 2 === q.sol;
  if (/√/.test(t)) return q.sol ** 2 === z[0];
  if (/% von/.test(t)) return (z[1] * z[0]) / 100 === q.sol;
  if (/ · /.test(t)) return z[0] * z[1] === q.sol;
  if (/ : /.test(t)) return z[0] / z[1] === q.sol;
  if (/ \+ /.test(t)) return z[0] + z[1] === q.sol;
  if (/ − /.test(t)) return z[0] - z[1] === q.sol;
  return false;
}

/** Knobelaufgaben: eine pro Tag, für alle Stufen lösbar. Antwort ist eine ganze Zahl. Eigene Aufgaben. */
export const KNOBEL = [
  ['Lina ist doppelt so alt wie Tom. Zusammen sind sie 18 Jahre alt. Wie alt ist Lina?', 12, 'Tom einmal, Lina zweimal: 18 sind drei gleiche Teile.', 'Ein Teil ist 6. Tom ist 6, Lina 12.'],
  ['Auf einem Hof leben Hühner und Kaninchen: zusammen 7 Köpfe und 20 Beine. Wie viele Kaninchen sind es?', 3, 'Wären alle Hühner, gäbe es 14 Beine. Jedes Kaninchen bringt 2 Beine mehr.', '6 Beine fehlen – das sind 3 Kaninchen.'],
  ['Eine Schnecke klettert an einer 10 m hohen Mauer jeden Tag 3 m hoch und rutscht nachts 2 m zurück. Am wievielten Tag ist sie oben?', 8, 'Am letzten Tag rutscht sie nicht mehr zurück.', 'Nach 7 Nächten ist sie auf 7 m. Am 8. Tag schafft sie die letzten 3 m.'],
  ['Wie viele Quadrate (aller Größen) stecken in einem 3 mal 3 Kästchen großen Feld?', 14, 'Zähle kleine, mittlere und das große Quadrat getrennt.', '9 kleine + 4 mittlere + 1 großes = 14.'],
  ['Die Summe von drei aufeinanderfolgenden Zahlen ist 48. Wie heißt die größte?', 17, 'Die mittlere Zahl ist der Durchschnitt.', '48 : 3 = 16 ist die mittlere, also 15, 16, 17.'],
  ['Ein Buch hat 120 Seiten. Wie oft kommt beim Nummerieren die Ziffer 9 vor?', 22, 'Zähle die Einer (9, 19, …) und die Zehner (90 bis 99) getrennt.', 'Einerstelle: 12-mal (9 bis 119). Zehnerstelle: 10-mal (90 bis 99). Zusammen 22.'],
  ['Fünf Freunde geben sich alle gegenseitig die Hand. Wie oft wird geschüttelt?', 10, 'Jeder schüttelt 4 Hände – aber jede Begrüßung zählt nur einmal.', '5 mal 4 geteilt durch 2 = 10.'],
  ['Eine Zahl wird verdoppelt, dann werden 6 addiert, dann wird durch 2 geteilt. Es kommt 10 heraus. Wie hieß die Zahl?', 7, 'Rechne rückwärts.', '10 mal 2 = 20, minus 6 = 14, geteilt durch 2 = 7.'],
  ['Eine Uhr schlägt zu jeder vollen Stunde so oft, wie es spät ist (1 bis 12). Wie oft schlägt sie in 12 Stunden?', 78, 'Addiere 1 + 2 + … + 12 geschickt in Paaren.', '6 Paare zu je 13 ergeben 78.'],
  ['Ein Rechteck hat den Umfang 30 cm und ist doppelt so lang wie breit. Wie viele cm² ist es groß?', 50, 'Länge plus Breite ist der halbe Umfang.', 'Breite 5, Länge 10: 5 mal 10 = 50.'],
  ['In einer Schublade liegen 6 rote und 6 blaue Socken durcheinander. Wie viele musst du im Dunkeln mindestens herausnehmen, um sicher ein gleichfarbiges Paar zu haben?', 3, 'Was passiert im ungünstigsten Fall mit zwei Socken?', 'Zwei könnten verschieden sein – die dritte passt sicher zu einer davon.'],
  ['Wie viele Zahlen von 1 bis 100 sind durch 3, aber nicht durch 6 teilbar?', 17, 'Durch 3 teilbar sind 33 Zahlen. Wie viele davon sind gerade?', '33 minus 16 (durch 6 teilbar) = 17.'],
  ['Ein T-Shirt kostet 12 € plus die Hälfte seines Preises. Wie viele Euro kostet es?', 24, 'Die 12 € sind die andere Hälfte.', 'Die Hälfte ist 12 €, das Ganze 24 €.'],
  ['Du hast 3 Hosen, 4 T-Shirts und 2 Paar Schuhe. Wie viele verschiedene Outfits kannst du zusammenstellen?', 24, 'Zu jeder Hose passt jedes T-Shirt, dazu jedes Paar Schuhe.', '3 mal 4 mal 2 = 24.'],
  ['Der Durchschnitt von vier Zahlen ist 8. Drei davon sind 5, 9 und 10. Wie heißt die vierte?', 8, 'Vier Zahlen mit Durchschnitt 8 haben zusammen die Summe 32.', '32 − 5 − 9 − 10 = 8.'],
  ['Ein Würfel wird außen rot angemalt und dann in 27 gleiche kleine Würfel zersägt. Wie viele kleine Würfel haben genau zwei rote Seiten?', 12, 'Das sind die Würfel in der Mitte jeder Kante.', 'Ein Würfel hat 12 Kanten, an jeder liegt genau einer.'],
  ['Welche ist die kleinste Zahl, die beim Teilen durch 2, 3, 4, 5 und 6 jeweils den Rest 1 lässt (und größer als 1 ist)?', 61, 'Die Zahl davor muss durch 2, 3, 4, 5 und 6 teilbar sein.', 'Das kleinste gemeinsame Vielfache ist 60, also 61.'],
  ['Ein Zug ist 200 m lang und fährt 20 m pro Sekunde. Wie viele Sekunden braucht er, um ganz durch einen 400 m langen Tunnel zu fahren?', 30, 'Der Zug muss den Tunnel und seine eigene Länge zurücklegen.', '600 m bei 20 m pro Sekunde sind 30 Sekunden.'],
  ['Wie viele Diagonalen hat ein Sechseck?', 9, 'Von jeder Ecke gehen 3 Diagonalen aus – jede wird doppelt gezählt.', '6 mal 3 geteilt durch 2 = 9.'],
  ['Opa ist 6-mal so alt wie Mia. In 4 Jahren ist er nur noch 5-mal so alt. Wie alt ist Mia heute?', 16, 'Stelle beide Alter in 4 Jahren mit einer Unbekannten auf.', '6m + 4 = 5 (m + 4), also m = 16.'],
  ['Wie viele Nullen stehen am Ende des Produkts 1 · 2 · 3 · … · 25?', 6, 'Eine Null entsteht aus 2 mal 5. Fünfen sind seltener als Zweien.', '5, 10, 15, 20 liefern je eine 5, die 25 gleich zwei: 6.'],
  ['Zwei Kerzen sind gleich lang. Die eine brennt in 4 Stunden ab, die andere in 2 Stunden. Nach wie vielen Minuten ist die eine doppelt so lang wie die andere?', 80, 'Schreibe die Restlängen nach t Stunden als Bruchteil auf.', '1 − t/4 = 2 (1 − t/2) ergibt t = 4/3 Stunden = 80 Minuten.'],
  ['Die Quersumme einer zweistelligen Zahl ist 9. Vertauscht man die Ziffern, wird die Zahl um 27 größer. Wie heißt die Zahl?', 36, 'Beim Vertauschen ändert sich die Zahl um 9 mal den Unterschied der Ziffern.', 'Unterschied 3, Summe 9: Ziffern 3 und 6, also 36.'],
  ['Ein Quadrat und ein gleichseitiges Dreieck haben beide den Umfang 24 cm. Um wie viele cm ist die Dreiecksseite länger als die Quadratseite?', 2, 'Teile den Umfang durch die Zahl der Seiten.', '8 cm minus 6 cm = 2 cm.'],
  ['In einem Turnier spielt jede von 6 Mannschaften einmal gegen jede andere. Wie viele Spiele gibt es?', 15, 'Jede Mannschaft hat 5 Gegner – jedes Spiel zählt nur einmal.', '6 mal 5 geteilt durch 2 = 15.'],
  ['Eine Seerose verdoppelt ihre Fläche jeden Tag. Nach 20 Tagen bedeckt sie den ganzen Teich. Nach wie vielen Tagen war der Teich halb bedeckt?', 19, 'Denk vom Ende her.', 'Einen Tag vorher war es die Hälfte: Tag 19.'],
  ['Wie viele dreistellige Zahlen kann man aus den Ziffern 1, 2, 3 und 4 bilden, wenn keine Ziffer doppelt vorkommen darf?', 24, 'Für die erste Stelle gibt es 4 Möglichkeiten, dann 3, dann 2.', '4 mal 3 mal 2 = 24.'],
  ['Ein Schwimmbecken ist 25 m lang, 10 m breit und 2 m tief. Wie viele Kubikmeter Wasser passen hinein?', 500, 'Rauminhalt ist Länge mal Breite mal Höhe.', '25 mal 10 mal 2 = 500.'],
];
/** Die Knobelaufgabe eines Tages (für alle gleich). */
export const knobelFuer = (tag = dayKey()) => { const k = KNOBEL[streu(`knobel-${tag}`) % KNOBEL.length]; return { text: k[0], sol: k[1], tipp: k[2], erkl: k[3] }; };
const tagZahl = (tag = dayKey()) => +tag.replace(/-/g, '');
export const knobelHeuteGeloest = () => store.n('knobelTag') === tagZahl();

const TASTEN = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '±', '0', '⌫'];
const tastatur = (id) => `<div class="kopf-tasten" id="${id}">${TASTEN.map((t) => `<button class="pick" type="button" data-t="${t}" aria-label="${t === '±' ? 'Vorzeichen' : t === '⌫' ? 'Löschen' : t}">${t}</button>`).join('')}</div>`;
/** Eingabe mit Zifferntasten und echter Tastatur. onChange bekommt den Text. Rückgabe: { set, weg }. */
function eingabe(box, onChange) {
  let wert = '';
  const drueck = (t) => {
    if (t === '⌫' || t === 'Backspace') wert = wert.slice(0, -1);
    else if (t === '±' || t === '-') wert = wert.startsWith('-') ? wert.slice(1) : `-${wert}`;
    else if (/^\d$/.test(t) && wert.replace('-', '').length < 6) wert += t;
    else return;
    onChange(wert);
  };
  box.querySelectorAll('button').forEach((b) => { b.onclick = () => { sfx('tap'); drueck(b.dataset.t); }; });
  const taste = (ev) => { if (ev.target instanceof HTMLInputElement) return; drueck(ev.key); };
  window.addEventListener('keydown', taste);
  return { set: (v) => { wert = v; }, weg: () => window.removeEventListener('keydown', taste) };
}

export function kopfView(onEnd) {
  const el = h('<div class="view stack"></div>');
  let timer = 0, over = true, ein = null;
  const stufe = () => Math.min(3, Math.max(1, Math.ceil(store.level / 2) + (store.level >= 5 ? 0 : 0)));
  function intro() {
    ein?.weg(); ein = null;
    const kn = knobelFuer(), geloest = knobelHeuteGeloest();
    el.innerHTML = `<a class="back" href="#/pruefung">${ICON.left} Zurück</a>
      <div><span class="eyebrow">60 Sekunden</span><h1 style="margin-top:8px">Kopfrechen-Arena</h1>
      <p class="lead" style="margin-top:8px">Such dir eine Disziplin aus und tippe so viele Ergebnisse wie möglich. Kein Abschicken nötig – stimmt die Zahl, geht es sofort weiter.</p></div>
      <section class="stack" id="kopf-arten">${kopfArten().map(([id, name, sub]) => `<button class="card unit kopf-art" type="button" data-a="${id}"><span class="num">${store.n(`kopf_${id}`) || '–'}</span><span><h3>${esc(name)}</h3><small>${esc(sub)}${store.n(`kopf_${id}`) ? ` Rekord: ${store.n(`kopf_${id}`)}` : ''}</small></span><span class="go">${ICON.right}</span></button>`).join('')}</section>
      <section class="card stack" id="knobel"><div class="knobel-kopf"><span class="pi-fig klein">${pi()}</span><div><span class="eyebrow">Knobelaufgabe des Tages</span><p id="knobel-text">${esc(kn.text)}</p></div></div>
        ${geloest ? `<div class="note ok" id="knobel-ok"><b>Heute schon geknackt!</b> ${esc(kn.erkl)} Morgen gibt es eine neue.</div>` : `<div class="kopf-zeile"><output class="kopf-zahl klein" id="knobel-zahl" aria-live="polite">?</output><button class="btn small" id="knobel-go" type="button">Prüfen</button></div>${tastatur('knobel-tasten')}<div id="knobel-note"></div>`}</section>`;
    el.querySelectorAll('.kopf-art').forEach((b) => { b.onclick = () => play(b.dataset.a); });
    if (!geloest) {
      let wert = '', versuche = 0;
      ein = eingabe($('#knobel-tasten', el), (v) => { wert = v; $('#knobel-zahl', el).textContent = v || '?'; });
      $('#knobel-go', el).onclick = () => {
        if (wert === '' || wert === '-') return;
        if (+wert === kn.sol) { store.max('knobelTag', tagZahl()); store.bump('knobel'); if (versuche === 0) store.bonus(15); else store.bonus(5); store.touch(); sfx('win'); confetti(30); onEnd?.(); intro(); }
        else { versuche++; sfx('bad'); buzz(); $('#knobel-note', el).innerHTML = `<div class="note tip">${versuche >= 2 ? `Noch nicht. Tipp: ${esc(kn.tipp)}` : 'Das stimmt noch nicht – probier es noch einmal.'}</div>`; wert = ''; ein.set(''); $('#knobel-zahl', el).textContent = '?'; }
      };
    }
  }
  function play(art) {
    ein?.weg();
    const name = KOPF_ARTEN.find((a) => a[0] === art)?.[1] || 'Kopfrechnen', t0 = performance.now(), st = stufe(), dauer = (window.__mtTest && window.__mtKopfSek) || KOPF_SEKUNDEN;   // im automatischen Browser-Test kürzer
    let right = 0, total = 0, q = null, lock = false, letzte = '', serie = 0, beste = 0;
    const zeigeSerie = () => { const s = $('#kopf-serie', el); if (!s) return; s.hidden = store.ruhig || serie < 3; s.textContent = `${serie} in Folge`; s.classList.toggle('heiss', serie >= 10); };   // ruhiger Modus: keine Serie
    over = false;
    el.innerHTML = `<div class="stephead"><button class="x" id="kopf-x" type="button" aria-label="Abbrechen">${ICON.close}</button><b>${esc(name)}</b></div>
      <div class="examhead"><b id="kopf-score">0</b><div class="prog"><i id="kopf-bar" style="width:100%"></i></div><b class="timer" id="kopf-t">1:00</b></div>
      <div class="kopf-frage" id="kopf-q"></div><div class="kopf-serie-zeile"><span class="kombo" id="kopf-serie" hidden></span></div><output class="kopf-zahl" id="kopf-zahl" aria-live="polite">?</output>${tastatur('kopf-tasten')}`;
    const zahl = $('#kopf-zahl', el);
    const neu = () => { do q = kopfAufgabe(art, st); while (q.text === letzte); letzte = q.text; $('#kopf-q', el).textContent = `${q.text} =`; if (window.__mtTest) $('#kopf-q', el).dataset.sol = q.sol; zahl.textContent = '?'; zahl.className = 'kopf-zahl'; ein.set(''); lock = false; };
    const end = () => {
      if (over) return; over = true; clearInterval(timer); ein?.weg(); ein = null;
      const alt = store.n(`kopf_${art}`), rec = right > alt; store.max(`kopf_${art}`, right); store.bump('kopfRunden');
      store.addRun({ kind: 'kopf', score: right, correct: right, total, xp: Math.min(20, right) });
      sfx('win'); if (right >= 10) confetti(rec ? 60 : 30);
      el.innerHTML = `<a class="back" href="#/kopf">${ICON.left} Arena</a>
        <section class="board" style="text-align:center"><div class="board-top"><span>${esc(name.toUpperCase())}</span><b>● ${rec && alt ? 'NEUER REKORD' : 'ERGEBNIS'}</b></div>
          <div class="npbig" id="kopf-end">${right}</div><h2>richtige in 60 Sekunden</h2><p>${total - right ? `${total - right} daneben · ` : 'Kein einziger Fehler · '}${beste >= 3 && !store.ruhig ? `längste Serie ${beste} · ` : ''}${rec ? 'Das ist dein bestes Ergebnis.' : `Dein Rekord: ${Math.max(alt, right)}`}</p></section>
        <button class="btn block" id="kopf-again" type="button">Noch einmal</button><a class="btn ghost block" href="#/kopf">Andere Disziplin</a>`;
      $('#kopf-again', el).onclick = () => play(art); onEnd?.(); window.scrollTo(0, 0);
    };
    ein = eingabe($('#kopf-tasten', el), (v) => {
      if (lock || over) return;
      zahl.textContent = v || '?';
      const soll = String(q.sol);
      if (v === soll) { lock = true; right++; total++; serie++; beste = Math.max(beste, serie); zeigeSerie(); if (serie % 5 === 0 && !store.ruhig) funken(zahl); $('#kopf-score', el).textContent = right; zahl.classList.add('ok'); sfx('ok'); setTimeout(() => { if (!over) neu(); }, 140); }
      else if (v.replace('-', '').length >= soll.replace('-', '').length && !(soll.startsWith('-') && !v.startsWith('-') && v.length === soll.length - 1)) {
        lock = true; total++; serie = 0; zeigeSerie(); zahl.classList.add('bad'); zahl.textContent = `${v} ✗  ${q.sol}`; sfx('bad'); buzz(); setTimeout(() => { if (!over) neu(); }, 900); }
    });
    $('#kopf-x', el).onclick = () => { over = true; clearInterval(timer); intro(); };
    const tick = () => { const left = dauer - (performance.now() - t0) / 1000, tm = $('#kopf-t', el); if (!tm) return;
      const sek = Math.ceil(Math.max(0, left)); tm.textContent = `${Math.floor(sek / 60)}:${String(sek % 60).padStart(2, '0')}`; tm.classList.toggle('low', left < 10); $('#kopf-bar', el).style.width = `${Math.max(0, (left / dauer) * 100)}%`;
      if (left <= 0) end(); };
    neu(); timer = setInterval(tick, 200);
  }
  intro();
  return { el, cleanup: () => { over = true; clearInterval(timer); ein?.weg(); } };
}
