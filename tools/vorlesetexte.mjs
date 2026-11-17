// Liste aller FESTEN Vorlese-Texte für das Stimmen-Werk (Nova): app/vorlesen/texte.json.
// Feste Texte = Theorie kurz und ausführlich (je Abschnitt; darin auch Formelkarten und „Wo brauche ich das?“) und feste Hinweise.
// Formeln stehen so drin, wie sie gesprochen werden (app/js/sprech.js) – dieselbe Regel nutzt die App beim Vorlesen,
// damit sie die vorab vertonte Datei wiederfindet. Je Text höchstens 1 500 Zeichen. Aufruf durch tools/check.mjs (npm run fix).
globalThis.window = { katex: { renderToString: (s) => `⟦${s}⟧` } };
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
globalThis.document = { documentElement: { dataset: {} }, createElement: () => ({}), addEventListener() {} };
const R = new URL('../app/js/', import.meta.url).href;
const { htmlSprech, stuecke } = await import(`${R}sprech.js`);
const T = await import(`${R}theorie.js`); const U = await import(`${R}units.js`);
/** Feste Sätze der App selbst (Probe in den Einstellungen). */
export const FESTE_SAETZE = ['Hallo! So klinge ich. Ich lese dir Aufgaben und Theorie vor, auch Formeln wie f von x gleich x Quadrat.'];
const texte = new Set(FESTE_SAETZE);
for (const u of U.ALLE_UNITS) for (const lang of [false, true]) {
  if (lang && !T.hatLang(u)) continue;
  for (const m of T.kapitelHtml(u, lang).matchAll(/<section class="t-teil[^"]*">([\s\S]*?)<\/section>/g)) for (const s of stuecke(htmlSprech(m[1]), 1500)) if (s) texte.add(s);
}
process.stdout.write(`${JSON.stringify({ format: 1, app: 'mathe-trainer', texte: [...texte].sort().map((text) => ({ text, sprache: 'de' })) }, null, 1)}\n`);
