// Querverweise zu den anderen Lern-Apps (AppZentrale 19.11.2026: Spezialisierung und Aufräumen vorgezogen; Marcel).
// Nur unter der Theorie, nur auf freie Inhalte, nie auf Kaufseiten. Gleicher Tab, Herkunft src=mathetrainer-theorie.
// Kennungen aus den Absprachen der Räume (docs/WOCHENRUNDE.md); Rechenblitz-Themen in der App selbst nachgesehen.
// Raumlicht: nur freie Ziele (erleben, rotation, galton, zufall, raumflug – Marcel 19.11.); binomial und baumeister sind Raumlicht Pro – nicht verlinken.
// Unbekannte Kennungen öffnen bei allen Apps die Startseite – es gibt also nie einen toten Link.
import { istTest } from './ort.js';
import { linkMitHerkunft } from './zaehler.js';
import { esc } from './ui.js';

export const APPS = {
  kurvenflug: { name: 'KurvenFlug', text: 'Am Graphen ausprobieren', link: (k) => `/#kapitel=${k}` },
  rechenblitz: { name: 'Rechenblitz', text: 'Im Kopf trainieren', link: (k) => `/?thema=${k}&stufe=auto&modus=training` },
  raumlicht: { name: 'Raumlicht', text: 'Im Raum erleben', link: (k) => `/?ziel=${k}` },
  experimentopia: { name: 'Experimentopia', text: 'Im Experiment erleben', link: (k) => `/#thema=${k}` },
  wissensgarten: { name: 'Wissensgarten', text: 'Formeln und Begriffe wiederholen', link: (k) => (k ? `/#paket=${k}` : '/') },
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
  'k9-gleichungen': [['rechenblitz', 'pow']],
  'k9-pythagoras': [['kurvenflug', 'pythagoras']],
  'k9-aehnlich': [['experimentopia', 'optik']],
  'k9-parabel': [['kurvenflug', 'parabeln']],
  'k10-wachstum': [['kurvenflug', 'wellen'], ['rechenblitz', 'zehner']],
  'k10-koerper': [['kurvenflug', 'trigonometrie']],
  'k10-sinussatz': [['kurvenflug', 'trigonometrie']],
  'k10-log': [['kurvenflug', 'logarithmus'], ['experimentopia', 'saeure']],
  'k10-funktionen': [['kurvenflug', 'wellen']],
  'regeln': [['raumlicht', 'erleben']],
  'kurve': [['raumlicht', 'erleben']],
  'extremwert': [['raumlicht', 'erleben']],
  'integral': [['raumlicht', 'erleben']],
  'expln': [['raumlicht', 'erleben']],
  'a-rotation': [['raumlicht', 'rotation']],
  'a-gauss': [['rechenblitz', 'lgs']],
  's-baum': [['raumlicht', 'zufall']],
  's-bedingt': [['raumlicht', 'zufall']],
  's-labor': [['raumlicht', 'zufall']],
  's-zufall': [['raumlicht', 'zufall']],
  's-verteilung': [['raumlicht', 'galton']],
  's-test': [['raumlicht', 'galton']],
  's-test2': [['raumlicht', 'galton']],
  'g-vektor': [['raumlicht', 'raumflug']],
  'g-gerade': [['raumlicht', 'raumflug']],
  'g-ebene': [['raumlicht', 'raumflug']],
  'g-mass': [['raumlicht', 'raumflug']],
};

/** Adresse einer App unter lernen.mathenachhilfe-online.com/<app>/: auf der Test-Stufe lernen-test., sonst lernen. */
export function appAdresse(app, kennung, host = globalThis.location?.hostname || '') {
  const a = APPS[app]; if (!a) return '';
  const test = istTest(host);
  return linkMitHerkunft(`https://lernen${test ? '-test' : ''}.mathenachhilfe-online.com/${app}${a.link(kennung)}`, 'theorie');   // alle Apps liegen unter lernen.…/<app>/ (Leitstand 22.11.: alte Subdomains werden später umgeleitet)
}

/** Wissensgarten-Pakete (freie Pakete Kl. 5–10; das Analysis-Paket ist Plus und wird nicht verlinkt). */
export const PAKETE = {
  's1-mathe-algebra': ['k7-terme', 'k8-linear', 'k8-binom', 'k9-parabel', 'k10-funktionen'],
  's1-mathe-brueche-prozent': ['k6-bruch', 'k6-bruchmal', 'k6-dezimal', 'k6-prozent', 'k7-prozent', 'k7-zinsen'],
  's1-mathe-geometrie-formeln': ['k5-groessen', 'k6-quader', 'k8-kreis', 'k8-flaechen'],
  's1-mathe-gleichungen': ['k7-gleichungen', 'k8-lgs', 'k9-quadrat'],
  's1-mathe-kopfrechnen': ['k5-rechnen'],
  's1-mathe-negative-zahlen': ['k5-ganz', 'k7-rational'],
  's1-mathe-pythagoras-trigo': ['k9-pythagoras', 'k10-koerper', 'k10-sinussatz'],
  's1-mathe-wahrscheinlichkeit': ['k6-daten', 'k6-zufall', 'k8-zufall', 'k10-daten'],
};
const paketVon = (unitId) => Object.keys(PAKETE).find((p) => PAKETE[p].includes(unitId)) || '';

/** Liste der Verweise einer Einheit; Klasse 5–10 bekommt zusätzlich den Wissensgarten (passendes Paket, sonst die Startseite). */
export function verweiseFuer(unitId) {
  const v = [...(VERWEISE[unitId] || [])];
  if (/^k\d+-/.test(unitId)) v.push(['wissensgarten', paketVon(unitId)]);
  return v;
}

/** Kasten „Passt dazu in anderen Apps“ unter der Theorie (leer, wenn es nichts gibt). */
export function verweisKasten(unitId, host) {
  const v = verweiseFuer(unitId); if (!v.length) return '';
  return `<section class="card stack noprint nur-web t-apps" id="t-apps"><h3>Passt dazu in anderen Apps</h3>${v.map(([app, k]) =>
    `<a class="t-app" data-ort="theorie" href="${esc(appAdresse(app, k, host))}"><b>${esc(APPS[app].name)}</b><small>${esc(APPS[app].text)}</small></a>`).join('')}</section>`;
}

/** Hinweis am Ende der „Entdecken“-Spiele (Marcel/AppZentrale: „Mehr davon in KurvenFlug/Raumlicht“; nur freie Ziele). */
export const SPIEL_HINWEIS = { flug: ['kurvenflug', 'wellen'], lotse: ['raumlicht', 'raumflug'], raum: ['raumlicht', 'raumflug'] };
export function spielHinweis(step, host) {
  const z = step?.kind === 'Entdecken' && SPIEL_HINWEIS[step.id]; if (!z) return '';
  const [app, k] = z; return `<div class="note tip spiel-mehr"><a data-ort="theorie" href="${esc(appAdresse(app, k, host))}">Mehr davon in ${esc(APPS[app].name)}</a></div>`;
}
