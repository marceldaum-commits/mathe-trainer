// Stufen der App auf einen Blick: Was ist frei, was gehört zu „Pro“, was zu „Pro + KI“ – und was ist auf diesem Gerät freigeschaltet.
import { h, esc, ICON, toast } from './ui.js';
import { store } from './store.js';
import { CONFIG } from './config.js';
import { premiumOn, premiumBereit, ZUGANG_ART, kiRestHeute, kiLimitHeute, kiRestHolen, kiDazuKnopf, kiNachpruefen, UNTER18 } from './api.js';
import { torOffen } from './tor.js';

/** Alle Funktionen mit ihrer Stufe. wo = Sprungziel in der App (leer: erscheint direkt bei den Aufgaben). */
export const FUNKTIONEN = [
  ['frei', 'Lernpfad, Spiele, Abenteuer und Karte', 'Alle Einheiten mit Boss – es werden laufend mehr.', '#/lernen'],
  ['frei', 'Merkbilder und Theorie kurz', 'Bewegte Bilder zum Anfassen, jedes Thema kurz erklärt.', '#/theorie'],
  ['frei', 'Lernkarten', 'Formeln und eigene Karten, wiederholt in wachsenden Abständen.', '#/karten'],
  ['frei', 'Arbeitsblatt in der App lösen', 'Themen wählen, Blatt bauen, in der App rechnen.', '#/blatt'],
  ['pro', 'Drucken und PDF', 'Arbeitsblatt, Probeklausur und Theorie mit Logo und Lösungsblatt.', '#/blatt'],
  ['pro', 'Schwächen-Blatt', 'Ein Blatt nur aus den Aufgaben, bei denen es zuletzt gehakt hat.', '#/blatt'],
  ['pro', 'Probeklausur', '12 Aufgaben aus allen Gebieten, mit Punkten und Notenpunkte-Tabelle.', '#/blatt'],
  ['pro', 'Umstell-Blatt', 'Gleichungen und Formeln zum Umstellen drucken – mit jedem Schritt auf dem Lösungsblatt.', '#/dungeon'],
  ['pro', 'Theorie ausführlich', 'Herleitung, durchgerechnetes Beispiel, typische Fehler.', '#/theorie'],
  ['ki', 'KI-Erklärung', `„Erklär’s mir anders“ nach einem Fehler. Drei Proben sind frei, mit Pro + KI 10 KI-Punkte pro Tag.`, ''],
  ['ki', 'KI-Tutor', 'Nachfragen zur selben Aufgabe, bis es klar ist.', ''],
  ['ki', 'Rechenweg-Prüfer', 'Foto vom Heft – die KI zeigt die Zeile mit dem Fehler.', ''],
  ['ki', 'KI-Aufgaben', 'Immer neue Aufgaben im Abi-Stil, vom Server nachgerechnet.', '#/kiaufgabe'],
  ['ki', 'KI-Auswertung', 'Nach einem gelösten Blatt: was sitzt, was üben.', '#/blatt'],
];
export const STUFEN = { frei: 'Frei', pro: 'Pro', ki: 'Pro + KI' };
/** Endpreise inkl. 19 % MwSt. (Marcel, 14.11.2026). Stehen nur in der Web-App bei der Kauf-Möglichkeit – in der Android-App gibt es keinen Kauf außerhalb des Stores. */
export const PREISE = [['Pro', '4,99 €', '19,99 €'], ['Pro + KI', '9,99 €', '39,99 €']];
/** KI-Punkte pro Tag mit „Pro + KI“ (Marcel, 17.11.2026: 10). Die Grenze setzt der Server durch. */
export const KI_PRO_TAG = 10;
const preisTabelle = () => `<section class="card stack pro-preise nur-web" id="pro-preise"><h3>Preise</h3>
  <table class="pro-tab"><thead><tr><th></th><th>30 Tage</th><th>Abi-Pass</th></tr></thead><tbody>${PREISE.map(([n, a, b]) => `<tr><th>${esc(n)}</th><td>${a}</td><td>${b}</td></tr>`).join('')}</tbody></table>
  <small class="muted">Alle Preise inkl. 19 % MwSt. Alle Zugänge gelten in der Web-App (im Browser oder als installierte App). Der 30-Tage-Zugang läuft ab dem ersten Einlösen (einlösbar bis zum 31.12. des dritten Jahres nach dem Kauf, gut als Geschenk). Der Abi-Pass gilt bis zum 31.07. deines Abi-Jahres. „Pro + KI“ enthält ${KI_PRO_TAG} KI-Punkte pro Tag.</small></section>`;
/** Ist eine Funktion dieser Stufe auf diesem Gerät freigeschaltet? */
export const hat = (stufe) => stufe === 'frei' || (stufe === 'pro' && store.stufe !== '') || (stufe === 'ki' && store.stufe === 'proki');
/** Kleine Marke für Knöpfe und Karten: zeigt die Stufe und – mit Haken – dass sie freigeschaltet ist. */
export const marke = (stufe) => (stufe === 'frei' ? '' : `<span class="marke ${stufe}${hat(stufe) ? ' an' : ''}" title="${hat(stufe) ? 'freigeschaltet' : `gehört zu ${STUFEN[stufe]}`}">${stufe === 'ki' ? 'KI' : 'PRO'}${hat(stufe) ? ' ✓' : ''}</span>`);
/** Heute noch freie KI-Punkte (zuletzt vom Server gemeldet; ohne Meldung heute das volle Tagesguthaben). */
const punkteWort = () => { const r = kiRestHeute() ?? kiLimitHeute() ?? KI_PRO_TAG; return `heute noch ${r} ${r === 1 ? 'KI-Punkt' : 'KI-Punkte'}`; };
/** „heute noch N KI-Punkte“ – aktualisiert sich von selbst, sobald der Server einen neuen Stand meldet. Fragt ihn höchstens stündlich nach. */
export const kiPunkteText = () => {
  if (store.stufe === 'proki') kiRestHolen(store.zugang.code, store.geraet).catch(() => {});
  return `<span class="ki-punkte">${punkteWort()}</span>`;
};
if (typeof addEventListener === 'function') addEventListener('mt-kirest', () => document.querySelectorAll('.ki-punkte').forEach((e) => { e.textContent = punkteWort(); }));
/** Abzeichen „Pro aktiv“ bzw. „Pro + KI aktiv“ mit Ablaufdatum (Startseite) – leer ohne gültigen Zugang. */
export function proAbzeichen() {
  if (!store.zugangGilt()) return '';
  const ki = store.stufe === 'proki';
  return `<a class="pro-aktiv ${ki ? 'ki' : ''}" id="pro-aktiv" href="#/pro"><b>${ki ? 'Pro + KI aktiv' : 'Pro aktiv'} ✓</b><small>${esc(gueltig())}${ki ? ` · ${kiPunkteText()}` : ''}</small></a>`;
}
/** Gültigkeit in Worten. */
export const gueltig = (z = store.zugang) => (!z ? '' : z.bis >= '9999' ? 'unbefristet gültig' : `gültig bis ${z.bis.split('-').reverse().join('.')}`);

/** Kl. 5–10 ohne gelöstes Eltern-Tor: nur die eigene Stufe und der neutrale Knopf „Für Eltern“ – keine Preise, kein Kaufknopf (ELTERN-TOR.md, Recht V10). */
function proKind() {
  const z = store.zugang, st = store.stufe;
  const el = h(`<div class="view stack">
    <a class="back" href="#/mehr">${ICON.left} Mehr</a>
    <section class="board pro-stand"><div class="board-top"><span>DEINE STUFE</span><b>● ${st === 'proki' ? 'PRO + KI' : st === 'pro' ? 'PRO' : 'FREI'}</b></div>
      <h2 id="pro-stufe">${st === 'proki' ? 'Pro + KI' : st === 'pro' ? 'Pro' : 'Frei'}</h2>
      <p>${st ? `${esc(ZUGANG_ART[z.art] || 'Zugang')} · ${esc(gueltig(z))}` : 'Alles zum Lernen und Spielen ist frei.'}</p>
      <button class="btn small line" type="button" id="pro-eltern" data-tor="Hier stehen Preise und Kaufmöglichkeiten.">Für Eltern</button></section>
  </div>`);
  el.querySelector('#pro-eltern').addEventListener('click', () => { if (torOffen()) window.dispatchEvent(new HashChangeEvent('hashchange')); });
  return { el };
}

export function proView() {
  if (store.jahrgang !== 'os' && !torOffen()) return proKind();
  const z = store.zugang, st = store.stufe;
  const el = h(`<div class="view stack">
    <a class="back" href="#/mehr">${ICON.left} Mehr</a>
    <section class="board pro-stand"><div class="board-top"><span>DEINE STUFE</span><b>● ${st === 'proki' ? 'PRO + KI' : st === 'pro' ? 'PRO' : 'FREI'}</b></div>
      <h2 id="pro-stufe">${st === 'proki' ? 'Pro + KI' : st === 'pro' ? 'Pro' : 'Frei'}</h2>
      <p>${st ? `${esc(ZUGANG_ART[z.art] || 'Zugang')} · ${esc(gueltig(z))}${st === 'proki' ? ` · ${kiPunkteText()}` : ''}` : 'Alles zum Lernen und Spielen ist frei. Pro nimmt dir Arbeit ab, Pro + KI erklärt und prüft persönlich.'}</p>
      <div id="pro-aktion"></div></section>
    ${window.MTApp ? '' : preisTabelle()}
    ${['frei', 'pro', 'ki'].map((s) => `<div class="sect"><h2>${STUFEN[s]}</h2></div><section class="stack">${FUNKTIONEN.filter((f) => f[0] === s).map(([, name, text, wo]) =>
      `<${wo ? `a href="${wo}"` : 'div'} class="card unit pro-zeile ${hat(s) ? 'offen' : 'zu'}"><span class="num">${hat(s) ? '✓' : '🔒'}</span><span><h3>${esc(name)} ${marke(s)}</h3><small>${esc(text)}</small></span>${wo ? `<span class="go">${ICON.right}</span>` : '<span></span>'}</${wo ? 'a' : 'div'}>`).join('')}</section>`).join('')}
  </div>`);
  const ak = el.querySelector('#pro-aktion');
  premiumBereit().then((an) => {
    if (!el.isConnected) return;
    if (an || z) ak.innerHTML = `<a class="btn small" href="#/einstellungen">${z ? 'Zugangscode ändern' : 'Zugangscode eingeben'}</a>${!st && !window.MTApp ? ` <a class="btn small line" href="${CONFIG.shop}" target="_blank" rel="noopener">Pro holen ↗</a>` : ''}${kiDazuKnopf() ? ` ${kiDazuKnopf()}` : ''}${(!st && !window.MTApp) || kiDazuKnopf() ? `<small class="muted unter18">${UNTER18}</small>` : ''}`;
    else ak.innerHTML = '<small>Die Pro-Fassung startet bald. Bis dahin sind die Pro-Funktionen hier zum Ausprobieren frei.</small>';
  });
  // Nach dem Dazubuchen im Shop: Code neu prüfen, KI sofort freischalten
  kiNachpruefen().then((neu) => { if (neu && el.isConnected) { toast('KI ist freigeschaltet.'); window.dispatchEvent(new HashChangeEvent('hashchange')); } }).catch(() => {});
  return { el };
}
