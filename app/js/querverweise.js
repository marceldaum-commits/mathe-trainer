// Querverweise zu den anderen Lern-Apps (AppZentrale 19.11.2026: Spezialisierung und Aufräumen vorgezogen; Marcel).
// Nur unter der Theorie, nur auf freie Inhalte, nie auf Kaufseiten. Gleicher Tab, Herkunft src=mathetrainer-theorie.
// Kennungen aus den Absprachen der Räume (docs/WOCHENRUNDE.md); Rechenblitz-Themen in der App selbst nachgesehen.
// Unbekannte Kennungen öffnen bei allen Apps die Startseite – es gibt also nie einen toten Link.
import { linkMitHerkunft } from './zaehler.js';
import { esc } from './ui.js';

export const APPS = {
  kurvenflug: { name: 'KurvenFlug', text: 'Am Graphen ausprobieren', link: (k) => `/#kapitel=${k}` },
  rechenblitz: { name: 'Rechenblitz', text: 'Im Kopf trainieren', link: (k) => `/?thema=${k}&stufe=auto&modus=training` },
  raumlicht: { name: 'Raumlicht', text: 'Im Raum erleben', link: (k) => `/?ziel=${k}` },
  experimentopia: { name: 'Experimentopia', text: 'Im Experiment erleben', link: (k) => `/#thema=${k}` },
  wissensgarten: { name: 'Wissensgarten', text: 'Formeln und Begriffe wiederholen', link: () => '/' },
};

/** Einheit → [[App, Kennung], …] */
export const VERWEISE = {
  'k5-zahlen': [['rechenblitz', 'round']],
  'k5-teiler': [['rechenblitz', 'divis']],
  'k5-ganz': [['rechenblitz', 'neg']],
  'k5-groessen': [['rechenblitz', 'unit']],
  'k5-rechnen': [['rechenblitz', 'order']],
  'k5-daten': [['kurvenflug', 'koordinaten']],
  'k6-bruch': [['kurvenflug', 'brueche'], ['rechenblitz', 'frac']],
  'k6-dezimal': [['kurvenflug', 'brueche'], ['rechenblitz', 'dec']],
  'k6-prozent': [['rechenblitz', 'pct']],
  'k6-winkel': [['kurvenflug', 'winkel']],
  'k6-daten': [['rechenblitz', 'stat']],
  'k6-zufall': [['rechenblitz', 'wahr']],
  'k7-terme': [['kurvenflug', 'terme'], ['rechenblitz', 'term']],
  'k7-gleichungen': [['kurvenflug', 'terme'], ['rechenblitz', 'eq']],
  'k7-prozent': [['kurvenflug', 'prozent'], ['rechenblitz', 'pct'], ['experimentopia', 'zellen']],
  'k7-zuordnung': [['kurvenflug', 'zuordnungen'], ['rechenblitz', 'dreisatz'], ['experimentopia', 'hebel']],
  'k7-zinsen': [['kurvenflug', 'prozent'], ['rechenblitz', 'zins']],
  'k7-winkel': [['kurvenflug', 'winkel']],
  'k7-rational': [['rechenblitz', 'neg']],
  'k8-linear': [['kurvenflug', 'geraden'], ['rechenblitz', 'linear'], ['experimentopia', 'strom']],
  'k8-lgs': [['kurvenflug', 'rendezvous'], ['rechenblitz', 'lgs']],
  'k8-zufall': [['rechenblitz', 'wahr'], ['experimentopia', 'vererbung']],
  'k8-kreis': [['rechenblitz', 'kreis']],
  'k9-quadrat': [['kurvenflug', 'nullstellen']],
  'k9-pythagoras': [['kurvenflug', 'pythagoras']],
  'k9-aehnlich': [['experimentopia', 'optik']],
  'k9-parabel': [['kurvenflug', 'parabeln']],
  'k10-wachstum': [['kurvenflug', 'wellen'], ['rechenblitz', 'zehner']],
  'k10-koerper': [['kurvenflug', 'trigonometrie']],
  'k10-sinussatz': [['kurvenflug', 'trigonometrie']],
  'k10-log': [['kurvenflug', 'logarithmus'], ['experimentopia', 'saeure']],
  'k10-funktionen': [['kurvenflug', 'wellen']],
  'extremwert': [['raumlicht', 'baumeister']],
  'anwenden': [['raumlicht', 'baumeister']],
  's-labor': [['raumlicht', 'zufall']],
  's-zufall': [['raumlicht', 'zufall']],
  's-verteilung': [['raumlicht', 'galton']],
  's-test': [['raumlicht', 'binomial']],
  's-test2': [['raumlicht', 'binomial']],
  'g-vektor': [['raumlicht', 'raumflug']],
  'g-gerade': [['raumlicht', 'raumflug']],
  'g-ebene': [['raumlicht', 'raumflug']],
  'g-mass': [['raumlicht', 'raumflug']],
};

/** Adresse einer App: auf der Test-Stufe die Test-Fassung, sonst die Live-Fassung. */
export function appAdresse(app, kennung, host = globalThis.location?.hostname || '') {
  const a = APPS[app]; if (!a) return '';
  const test = /^(trainer-test\.|localhost$|127\.)/.test(host);
  return linkMitHerkunft(`https://${app}${test ? '-test' : ''}.mathenachhilfe-online.com${a.link(kennung)}`, 'theorie');
}

/** Liste der Verweise einer Einheit; Klasse 5–10 bekommt zusätzlich den Wissensgarten. */
export function verweiseFuer(unitId) {
  const v = [...(VERWEISE[unitId] || [])];
  if (/^k\d+-/.test(unitId)) v.push(['wissensgarten', '']);
  return v;
}

/** Kasten „Passt dazu in anderen Apps“ unter der Theorie (leer, wenn es nichts gibt). */
export function verweisKasten(unitId, host) {
  const v = verweiseFuer(unitId); if (!v.length) return '';
  return `<section class="card stack noprint nur-web t-apps" id="t-apps"><h3>Passt dazu in anderen Apps</h3>${v.map(([app, k]) =>
    `<a class="t-app" data-ort="theorie" href="${esc(appAdresse(app, k, host))}"><b>${esc(APPS[app].name)}</b><small>${esc(APPS[app].text)}</small></a>`).join('')}</section>`;
}
