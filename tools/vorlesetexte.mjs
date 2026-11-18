// Liste aller FESTEN Vorlese-Texte für das Stimmen-Werk (Nova): app/vorlesen/texte.json.
// Feste Texte = Theorie kurz und ausführlich (je Abschnitt; darin auch Formelkarten und „Wo brauche ich das?“) und feste Hinweise.
// Formeln stehen so drin, wie sie gesprochen werden (app/js/sprech.js) – dieselbe Regel nutzt die App beim Vorlesen,
// damit sie die vorab vertonte Datei wiederfindet. Je Text höchstens 1 500 Zeichen. Aufruf durch tools/check.mjs (npm run fix).
// Dazu die vorhersehbaren Laufzeit-Sätze (Leitstand 18.11.2026), markiert mit "laufzeit": true: Stücke der Aufgabenkarten
// (bis 300 Zeichen, so wie die App sie beim Vorlesen schneidet), die in einer festen Stichprobe immer wieder vorkommen –
// Tipps, typische Fehler, Lösungswege und Fragen ohne Zufallszahlen. Die App fragt jedes Stück zuerst als feste Datei an.
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

/* ── Laufzeit-Sätze: Aufgabenkarten nachbauen wie in quiz.js (Frage, Formel, Antworten bzw. Eingabefeld, je ein offener Hinweis) ── */
const ui = await import(`${R}ui.js`), Mth = await import(`${R}math.js`), Ein = await import(`${R}eingabe.js`), fs = await import('node:fs');
await (await import(`${R}faul.js`)).ladeAufgaben();
const SAAT = 20, MIN = 5;   // 20 Startwerte je Erzeuger und Stufe; ein Stück zählt, wenn es in mindestens 5 Karten vorkommt
const zaehl = new Map();
function karte(q, lv) {
  const tippen = lv >= 4 && !q.type ? Ein.inputSpec(q) : null; let body = '';
  if (tippen) { const sh = Ein.shapeOf(q.options.find((o) => o.correct).tex), nk = /,/.test(sh.plain) ? sh.plain.split(',')[1].length : 0;
    body = `<label>${sh.pre || 'Ergebnis'}</label><small>${sh.frac ? 'Als Bruch (zum Beispiel 3/4) oder als Dezimalzahl.' : nk ? `Runde auf ${nk} ${nk === 1 ? 'Nachkommastelle' : 'Nachkommastellen'}.` : 'Tippe dein Ergebnis ein.'}</small>`; }
  else if (q.options) body = `<div>${q.options.map((o, i) => `<p>Antwort ${'ABCD'[i]}: <span>${o.html ?? ui.tex(o.tex)}</span></p>`).join('')}</div>`;
  const html = (note) => `<div><p>${q.prompt}</p></div>${q.formula ? `<div>${ui.tex(q.formula, true)}</div>` : ''}<div>${body}</div><div>${note}</div>`;
  const notes = ['', ...(q.hints || []).map((t, i) => `<div><b>Tipp ${i + 1}.</b> ${t}</div>`),
    ...(tippen ? [] : (q.options || []).filter((o) => !o.correct && o.why).map((o) => `<div><b>Typischer Fehler.</b> ${o.why}</div>`)),
    `<div><b>Richtig.</b> ${q.explain}</div>`];
  const st = new Set(); for (const n of notes) for (const x of stuecke(htmlSprech(html(n)), 300)) st.add(x);
  for (const x of st) zaehl.set(x, (zaehl.get(x) || 0) + 1);
}
const erzeuger = [];
for (const d of fs.readdirSync(new URL('a/', R)).filter((f) => /^gen\d*\.js$/.test(f)).sort())
  for (const [name, fn] of Object.entries(await import(`${R}a/${d}`))) if (typeof fn === 'function' && /^gen/.test(name)) erzeuger.push([fn, [1, 2, 3, 4, 5]]);
const G10 = await import(`${R}gen10.js`);
for (const t of G10.THEMEN10) erzeuger.push([G10.schwer(t), [4, 5]]);
for (const [fn, stufen] of erzeuger) for (const lv of stufen) for (let s = 1; s <= SAAT; s++) {
  Mth.seedRandom(s * 104729 + lv * 31); let q; try { q = fn(lv); } catch { continue; } if (q?.prompt) karte(q, lv);
}
const laufzeit = [...zaehl].filter(([t, n]) => n >= MIN && t && !texte.has(t)).map(([t]) => t).sort();
const liste = [...[...texte].sort().map((text) => ({ text, sprache: 'de' })), ...laufzeit.map((text) => ({ text, sprache: 'de', laufzeit: true }))];
process.stdout.write(`${JSON.stringify({ format: 1, app: 'mathe-trainer', texte: liste }, null, 1)}\n`);
