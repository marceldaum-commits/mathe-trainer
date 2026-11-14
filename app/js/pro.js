// Stufen der App auf einen Blick: Was ist frei, was gehört zu „Pro“, was zu „Pro + KI“ – und was ist auf diesem Gerät freigeschaltet.
import { h, esc, ICON } from './ui.js';
import { store } from './store.js';
import { CONFIG } from './config.js';
import { premiumOn, premiumBereit, ZUGANG_ART } from './api.js';

/** Alle Funktionen mit ihrer Stufe. wo = Sprungziel in der App (leer: erscheint direkt bei den Aufgaben). */
export const FUNKTIONEN = [
  ['frei', 'Lernpfad, Spiele, Abenteuer und Karte', 'Alle Einheiten mit Boss – wird laufend mehr.', '#/lernen'],
  ['frei', 'Merkbilder und Theorie kurz', 'Bewegte Bilder zum Anfassen, jedes Thema kurz erklärt.', '#/theorie'],
  ['frei', 'Lernkarten', 'Formeln und eigene Karten, wiederholt in wachsenden Abständen.', '#/karten'],
  ['frei', 'Arbeitsblatt in der App lösen', 'Themen wählen, Blatt bauen, in der App rechnen.', '#/blatt'],
  ['pro', 'Drucken und PDF', 'Arbeitsblatt, Probeklausur und Theorie mit Logo und Lösungsblatt.', '#/blatt'],
  ['pro', 'Schwächen-Blatt', 'Ein Blatt nur aus den Aufgaben, bei denen es zuletzt gehakt hat.', '#/blatt'],
  ['pro', 'Probeklausur', '12 Aufgaben aus allen Gebieten, mit Punkten und Notenpunkte-Tabelle.', '#/blatt'],
  ['pro', 'Theorie ausführlich', 'Herleitung, durchgerechnetes Beispiel, typische Fehler.', '#/theorie'],
  ['ki', 'KI-Erklärung', '„Erklär’s mir anders“ nach einem Fehler. Drei Proben sind frei.', ''],
  ['ki', 'KI-Tutor', 'Nachfragen zur selben Aufgabe, bis es klar ist.', ''],
  ['ki', 'Rechenweg-Prüfer', 'Foto vom Heft – die KI zeigt die Zeile mit dem Fehler.', ''],
  ['ki', 'KI-Aufgaben', 'Immer neue Aufgaben im Abi-Stil, vom Server nachgerechnet.', '#/kiaufgabe'],
  ['ki', 'KI-Auswertung', 'Nach einem gelösten Blatt: was sitzt, was üben.', '#/blatt'],
];
export const STUFEN = { frei: 'Frei', pro: 'Pro', ki: 'Pro + KI' };
/** Ist eine Funktion dieser Stufe auf diesem Gerät freigeschaltet? */
export const hat = (stufe) => stufe === 'frei' || (stufe === 'pro' && store.stufe !== '') || (stufe === 'ki' && store.stufe === 'proki');
/** Kleine Marke für Knöpfe und Karten: zeigt die Stufe und – mit Haken – dass sie freigeschaltet ist. */
export const marke = (stufe) => (stufe === 'frei' ? '' : `<span class="marke ${stufe}${hat(stufe) ? ' an' : ''}" title="${hat(stufe) ? 'freigeschaltet' : `gehört zu ${STUFEN[stufe]}`}">${stufe === 'ki' ? 'KI' : 'PRO'}${hat(stufe) ? ' ✓' : ''}</span>`);
/** Gültigkeit in Worten. */
export const gueltig = (z = store.zugang) => (!z ? '' : z.bis >= '9999' ? 'unbefristet gültig' : `gültig bis ${z.bis.split('-').reverse().join('.')}`);

export function proView() {
  const z = store.zugang, st = store.stufe;
  const el = h(`<div class="view stack">
    <a class="back" href="#/mehr">${ICON.left} Mehr</a>
    <section class="board pro-stand"><div class="board-top"><span>DEINE STUFE</span><b>● ${st === 'proki' ? 'PRO + KI' : st === 'pro' ? 'PRO' : 'FREI'}</b></div>
      <h2 id="pro-stufe">${st === 'proki' ? 'Pro + KI' : st === 'pro' ? 'Pro' : 'Frei'}</h2>
      <p>${st ? `${esc(ZUGANG_ART[z.art] || 'Zugang')} · ${esc(gueltig(z))}` : 'Alles zum Lernen und Spielen ist frei. Pro nimmt dir Arbeit ab, Pro + KI erklärt und prüft persönlich.'}</p>
      <div id="pro-aktion"></div></section>
    ${['frei', 'pro', 'ki'].map((s) => `<div class="sect"><h2>${STUFEN[s]}</h2></div><section class="stack">${FUNKTIONEN.filter((f) => f[0] === s).map(([, name, text, wo]) =>
      `<${wo ? `a href="${wo}"` : 'div'} class="card unit pro-zeile ${hat(s) ? 'offen' : 'zu'}"><span class="num">${hat(s) ? '✓' : '🔒'}</span><span><h3>${esc(name)} ${marke(s)}</h3><small>${esc(text)}</small></span>${wo ? `<span class="go">${ICON.right}</span>` : '<span></span>'}</${wo ? 'a' : 'div'}>`).join('')}</section>`).join('')}
  </div>`);
  const ak = el.querySelector('#pro-aktion');
  premiumBereit().then((an) => {
    if (!el.isConnected) return;
    if (an || z) ak.innerHTML = `<a class="btn small" href="#/einstellungen">${z ? 'Zugangscode ändern' : 'Zugangscode eingeben'}</a>${!st && !window.MTApp ? ` <a class="btn small line" href="${CONFIG.website}" target="_blank" rel="noopener">Zur Website ↗</a>` : ''}`;
    else ak.innerHTML = '<small>Die Pro-Fassung startet bald. Bis dahin sind die Pro-Funktionen hier zum Ausprobieren frei.</small>';
  });
  return { el };
}
