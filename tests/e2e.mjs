// Spielt die ganze App im Handy-Browser durch (Playwright). Aufruf: node tests/e2e.mjs [Bilder-Ordner]
// Erwartet die App unter http://localhost:8123 (npm start). LEVEL=1..5 wählt die Schwierigkeit, DARK=1 das dunkle Gerät.
import { createRequire } from 'node:module';
const { chromium, devices } = createRequire(import.meta.url)('playwright');
globalThis.window = { katex: { renderToString: (s) => s } };
const LEVEL = +(process.env.LEVEL || 3);
const game = async (name) => (await import(`../app/js/games/${name}.js`)).levelsFor(LEVEL);   // jede Schwierigkeit hat eigene Level
const { UNITS } = await import('../app/js/units.js');
const { lookAlong } = await import('../app/js/games/raum.js');
const MB = await game('murmelbahn'), TG = await game('tangente'), ZR = await game('zeichnen'), FL = await game('flaeche'), LB = await game('labor');
const LO = await game('lotse'), WK = await game('werkstatt'), RM = await game('raum'), FG = await game('flug');
const { BADGES } = await import('../app/js/badges.js');
const BASE = process.env.BASE || 'http://localhost:8123/';
const shots = process.argv[2];

const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices['Pixel 7'], colorScheme: process.env.DARK ? 'dark' : 'light', acceptDownloads: true });
await ctx.addInitScript(() => { window.__mtTest = true; });   // markiert in Boss und Blitz die richtige Antwort
const page = await ctx.newPage();
const errors = [];
let serverAus = false;   // solange der nachgestellte Melde-Server „nicht erreichbar“ spielt, sind seine Lade-Fehler erwartet
page.on('console', (m) => { if (m.type() === 'error' && !(serverAus && /Failed to load resource/.test(m.text()))) errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));
const apiCalls = [];
page.on('request', (r) => { const p = new URL(r.url()).pathname; if (p.startsWith('/api/') && p !== '/api/meldung') apiCalls.push(p); });
const shot = async (name) => { if (shots) await page.screenshot({ path: `${shots}/${name}.png` }); };
process.on('uncaughtException', async (e) => { console.error(String(e).split('\n')[0]); if (shots) await page.screenshot({ path: `${shots}/fehler.png` }).catch(() => {}); process.exit(1); });
const fail = (msg) => { throw new Error(msg); };
const sheetNext = async () => { await page.waitForSelector('#sheet:not([hidden]) #sh-go'); await page.waitForTimeout(250); await page.click('#sh-go'); await page.waitForSelector('#sheet', { state: 'hidden' }); };
const px = async (sel, view, x, y) => {
  await page.locator(sel).scrollIntoViewIfNeeded();
  const b = await page.locator(sel).boundingBox();
  return [b.x + ((x - view.x0) / (view.x1 - view.x0)) * b.width, b.y + b.height - ((y - view.y0) / (view.y1 - view.y0)) * b.height];
};
const setRange = (sel, v) => page.locator(sel).evaluate((el, val) => { el.value = val; el.dispatchEvent(new Event('input')); }, v);
const once = new Set();
const first = (key) => (once.has(key) ? false : (once.add(key), true));

/* ───────────── Schritt-Arten ───────────── */
async function info() { while (!(await page.locator('#sheet').isVisible())) { await page.click('#i-next'); await page.waitForTimeout(50); } }
let getippt = 0, wegGesehen = false;
async function solveQuestion() {
  if (await page.locator('#q-in').count()) {   // freie Eingabe: erst Unsinn, dann zweimal falsch (→ „Auswahl zeigen“ erscheint), dann richtig
    const sol = await page.getAttribute('#q-in', 'data-sol');
    if (first('tippen')) {
      await page.fill('#q-in', 'abc'); await page.click('.tipp .btn'); await page.waitForSelector('#q-note .note.tip');
      for (const w of ['987654', '987653']) { await page.fill('#q-in', w); await page.click('.tipp .btn'); await page.waitForSelector('#q-note .note.bad'); }
      if (!(await page.locator('#q-wahl').count())) fail('Eingabe: nach zwei Fehlversuchen fehlt „Auswahl zeigen“');
      await shot('65-eingabe-falsch');
    }
    if (first('tippen-wahl')) { await page.fill('#q-in', '987652'); await page.click('.tipp .btn'); await page.click('#q-wahl'); await page.waitForSelector('.opt'); return solveQuestion(); }
    await page.fill('#q-in', sol); await page.click('.tipp .btn'); getippt++;
    if (first('tippen-ok')) await shot('66-eingabe-richtig');
  } else if (await page.locator('.gaprow').count()) {
    const rows = page.locator('.gaprow');
    const a = await rows.nth(0).locator('.pick').count(), b = await rows.nth(1).locator('.pick').count();
    search: for (let i = 0; i < a; i++) for (let j = 0; j < b; j++) {
      await rows.nth(0).locator('.pick').nth(i).click(); await rows.nth(1).locator('.pick').nth(j).click();
      await page.click('#q-body .btn');
      if (await page.locator('#q-next').isVisible()) break search;
    }
  } else for (let i = 0; i < 4; i++) { if (await page.locator('#q-next').isVisible()) break; await page.locator('.opt').nth(i).click(); }
  if (!(await page.locator('#q-next').isVisible())) fail('Quiz: keine Antwort wurde als richtig erkannt');
  if (await page.locator('.weg').count()) wegGesehen = true;
  await page.click('#q-next'); await page.waitForTimeout(50);
}
async function quiz(endSel = '#sheet') {
  if (first('tipp') && !(await page.locator('.gaprow').count()) && !(await page.locator('#q-in').count())) {
    await page.locator('.opt').first().click(); await page.waitForTimeout(150);
    if (await page.locator('#q-tip').isVisible()) await page.click('#q-tip');
    await shot('08-aufgabe-tipp');
  }
  while (!(await page.locator(endSel).isVisible())) await solveQuestion();
}
async function playMurmelbahn() {
  await page.click('#mb-go'); await page.waitForSelector('#mb-note .note', { timeout: 20000 });
  if (!(await page.locator('#mb-note .note.tip, #mb-note .note.bad').count())) fail('Murmelbahn: Startwerte dürfen nicht gewinnen');
  await shot('02-murmelbahn-fehlversuch');
  for (let i = 0; i < MB.length; i++) {
    for (const q of MB[i].params) await setRange(`#mb-${q.k}`, MB[i].target[q.k]);
    await page.click('#mb-go'); await page.waitForSelector('#mb-note .note.ok', { timeout: 25000 });
    if (i === 2) await shot('04-murmelbahn-gewonnen');
    await page.click('#mb-go');
  }
}
async function playFlug() {
  await page.click('#fg-go'); await page.waitForSelector('#fg-note .note.tip', { timeout: 15000 });
  for (let i = 0; i < FG.length; i++) {
    for (const q of FG[i].params) await setRange(`#fg-${q.k}`, FG[i].target[q.k]);
    await page.click('#fg-go'); await page.waitForSelector('#fg-note .note.ok', { timeout: 15000 });
    if (i === 1) await shot('43-flug');
    await page.click('#fg-go');
  }
}
async function playTangente() {
  for (let li = 0; li < TG.length; li++) {
    const L = TG[li];
    for (let mi = 0; mi < L.missions.length; mi++) {
      const M = L.missions[mi];
      let targets = M.xs;
      if (M.type === 'slope') { for (let x = L.view.x0 + 0.2; x < L.view.x1; x += 0.005) if (Math.abs(L.d(x) - M.m) < 0.02) { targets = [x]; break; } }
      const [sx, sy] = await px('#tg-c', L.view, L.view.x0 + 0.3, 0);
      await page.mouse.move(sx, sy); await page.mouse.down();
      const [ex] = await px('#tg-c', L.view, L.view.x1 - 0.3, 0);
      if (mi === 0) await page.mouse.move(ex, sy, { steps: 60 });
      for (const t of targets) { const [tx] = await px('#tg-c', L.view, t, 0); await page.mouse.move(tx, sy, { steps: 12 }); await page.waitForTimeout(600); }
      await page.mouse.up();
      await page.waitForSelector('#tg-next:not([hidden])', { timeout: 5000 });
      if (li === 0 && mi === L.missions.length - 1) await shot('10-surfer-spur');
      await page.click('#tg-next button');
    }
  }
}
async function playPaare() {
  for (let round = 0; round < 2; round++) {
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      const f = page.locator('#p-f .pcard').nth(i);
      if (await f.evaluate((n) => n.classList.contains('ok'))) break;
      const d = page.locator('#p-d .pcard').nth(j);
      if (await d.evaluate((n) => n.classList.contains('ok'))) continue;
      await f.click(); await d.click(); await page.waitForTimeout(380);
    }
    await page.waitForSelector('#p-next:not([hidden])'); await page.click('#p-next button');
  }
}
async function playZeichnen() {
  const V = { x0: -4, x1: 4, y0: -2.4, y1: 2.4 }, clampY = (y) => Math.max(-2.3, Math.min(2.3, y));
  const sketch = async (fn) => {
    let down = false;
    for (let x = -3.7; x <= 3.7; x += 0.1) { const [a, b] = await px('#z-d', V, x, clampY(fn(x))); await page.mouse.move(a, b); if (!down) { await page.mouse.down(); down = true; } }
    await page.mouse.up();
  };
  for (let r = 0; r < ZR.length; r++) {
    if (r === 1) { await sketch((x) => -ZR[r].d(x)); await page.click('#z-check'); await page.waitForSelector('#z-note .note.tip'); await shot('13-zeichnen-falsch'); await page.click('#z-check'); }
    await sketch(ZR[r].d);
    await page.click('#z-check'); await page.waitForSelector('#z-note .note.ok');
    await page.click('#z-check');
  }
}
async function playFlaeche() {
  for (let i = 0; i < FL.length; i++) {
    await setRange('#fl-r', 60); await page.waitForSelector('#fl-body .opt');
    for (let k = 0; k < 3; k++) { if (await page.locator('#fl-next').isVisible()) break; await page.locator('#fl-body .opt').nth(k).click(); }
    await page.click('#fl-next button');
  }
}
async function playLabor() {
  for (let i = 0; i < LB.length; i++) {
    if (await page.locator('#lb-rn').isVisible()) await setRange('#lb-in', LB[i].sol.n);
    if (await page.locator('#lb-rp').isVisible()) await setRange('#lb-ip', LB[i].sol.p);
    await page.click('#lb-go'); await page.waitForSelector('#lb-note .note.ok', { timeout: 15000 });
    await page.click('#lb-go');
  }
  await page.waitForSelector('#lb-body .opt');
  for (let k = 0; k < 4; k++) { if (await page.locator('#lb-go').isVisible()) break; await page.locator('#lb-body .opt').nth(k).click(); }
  await page.click('#lb-go');
}
async function playLotse() {
  for (let i = 0; i < LO.length; i++) {
    if (i === 2) { await setRange('#lo-a', 1); await page.click('#lo-go'); await page.waitForSelector('#lo-note .note.tip'); }
    await setRange('#lo-a', LO[i].sol[0]); await setRange('#lo-b', LO[i].sol[1]);
    await page.click('#lo-go'); await page.waitForSelector('#lo-note .note.ok');
    await page.click('#lo-go');
  }
}
async function playWerkstatt() {
  for (let i = 0; i < WK.length; i++) {
    await page.click('#wk-go'); await page.waitForSelector('#wk-note .note.tip');
    await setRange('#wk-r', WK[i].sol); await page.click('#wk-go'); await page.waitForSelector('#wk-note .note.ok');
    await page.click('#wk-go');
  }
}
async function playRaum() {
  for (let i = 0; i < RM.length; i++) {
    if (RM[i].type === 'look') {
      const b = await page.locator('#rm-c').boundingBox();
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down(); await page.mouse.move(b.x + b.width / 2 + 60, b.y + b.height / 2 - 30, { steps: 8 }); await page.mouse.up();
      if (await page.locator('#rm-next').isVisible()) fail('Raum: zufälliges Drehen darf nicht lösen');
      await page.locator('#rm-c').evaluate((el, v) => el.setView(v.yaw, v.pitch), lookAlong(RM[i].lines[0].u));
      await page.waitForSelector('#rm-next:not([hidden])');
    } else for (let k = 0; k < 3; k++) { if (await page.locator('#rm-next').isVisible()) break; await page.locator('#rm-body .opt').nth(k).click(); }
    await page.click('#rm-next button');
  }
}
async function playBoss() {
  if (first('boss-verlieren')) {   // einmal absichtlich verlieren: drei falsche Antworten → „Noch einmal"
    for (let k = 0; k < 3; k++) { await page.locator('#bs-q .opt[data-ok="0"]').first().click(); await page.click('#bs-next'); }
    await page.waitForSelector('#bs-again'); await shot('44-boss-verloren'); await page.click('#bs-again');
  }
  for (let guard = 0; guard < 12; guard++) {
    if (await page.locator('#bs-done').count()) break;
    await page.locator('#bs-q .opt[data-ok="1"]').click();
    if (first('boss-bild')) await shot('45-boss');
    await page.click('#bs-next');
  }
  await page.waitForSelector('#bs-done'); await page.click('#bs-done');
}
async function playTafel() {
  const fill = async (wrongFirst) => {
    const inputs = page.locator('#tf input'), n = await inputs.count();
    for (let i = 0; i < n; i++) { const sol = +(await inputs.nth(i).getAttribute('data-sol')); await inputs.nth(i).fill(String(wrongFirst && i === 0 ? sol + 1 : sol)); }
  };
  for (let guard = 0; guard < 6; guard++) {
    if (guard === 0) {
      await page.click('#tf-go'); await page.waitForSelector('#tf-note .note.tip');            // leere Felder: Hinweis
      await fill(true); await page.click('#tf-go'); await page.waitForSelector('#tf input.no');   // ein falsches Feld wird markiert
      if (!(await page.textContent('#tf-note')).includes('stimmt')) fail('Tafel: Hinweis auf das falsche Feld fehlt');
      await shot('60-tafel-falsch');
    }
    await fill(false); await page.click('#tf-go'); await page.waitForSelector('#tf-note .note.ok');
    if (guard === 0) await shot('61-tafel-richtig');
    await page.click('#tf-go'); await page.waitForTimeout(120);
    if (await page.locator('#sheet').isVisible()) return;
  }
  fail('Tafel endet nicht');
}
const HANDLERS = [['#tf', playTafel], ['#mb-c', playMurmelbahn], ['#fg-c', playFlug], ['#tg-c', playTangente], ['#p-f', playPaare], ['#z-d', playZeichnen], ['#fl-c', playFlaeche], ['#lb-c', playLabor], ['#lo-c', playLotse], ['#wk-c', playWerkstatt], ['#rm-c', playRaum], ['#bs', playBoss], ['#i-next', info]];

/* ───────────── Start, Menü, Schwierigkeit, Hell/Dunkel ───────────── */
await page.goto(BASE); await page.waitForSelector('#home'); await shot('01-start');
if ((await page.locator('#nav a').count()) !== 4) fail('Menüleiste fehlt');
if (await page.locator('#home a[href^="#/u/"]:not(.btn)').count()) fail('Startseite listet wieder einzelne Einheiten auf');
const startHeight = await page.evaluate(() => document.documentElement.scrollHeight);
if (startHeight > 2400) fail(`Startseite zu lang: ${startHeight}px`);
if (!(await page.locator('.week').count())) fail('Wochen-Ziel fehlt auf der Startseite');
await page.click('#nav a[data-tab="lernen"]'); await page.waitForSelector('a[href="#/g/analysis"]');
if (!(await page.locator('#nav a[data-tab="lernen"].on').count())) fail('Menü markiert „Lernen" nicht');
await page.click('a[href="#/g/stochastik"]'); await page.waitForSelector('a[href="#/u/s-labor"]');
await page.click('a[href="#/u/s-labor"]'); await page.waitForSelector('.steps');
if (!(await page.textContent('.back')).includes('Stochastik')) fail('Zurück-Link nennt das Gebiet nicht');
if (!(await page.locator('details.why').count())) fail('„Wo brauche ich das?" fehlt');
await page.click('details.why summary'); await shot('46-einheit-warum');
await page.click('.steps a'); await page.waitForSelector('#stage > *');
if (await page.locator('#nav').isVisible()) fail('Menü muss beim Spielen ausgeblendet sein');
await page.click('.x'); await page.click('.back'); await page.click('.back'); await page.waitForSelector('#lv');
await page.locator('#lv button').nth(LEVEL - 1).click();
await page.reload(); await page.waitForSelector('#lv');
if (!(await page.locator('#lv button').nth(LEVEL - 1).evaluate((n) => n.classList.contains('on')))) fail('Schwierigkeit nach Neuladen vergessen');
const bgOf = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
const look0 = await page.getAttribute('html', 'data-look'), bg0 = await bgOf();
if (look0 !== (process.env.DARK ? 'dunkel' : 'hell')) fail(`Start-Design folgt nicht dem Gerät: ${look0}`);
await page.click('#look');
if ((await page.getAttribute('html', 'data-look')) === look0 || (await bgOf()) === bg0) fail('Hell/Dunkel-Schalter ohne Wirkung');
await page.reload(); await page.waitForSelector('#lv');
if ((await page.getAttribute('html', 'data-look')) === look0) fail('Hell/Dunkel-Wahl nach Neuladen vergessen');
await page.click('#look');

/* ───────────── Hilfe-Knopf: Menü, Fehler melden (Versand aus → Meldung wartet im Gerät) ───────────── */
if (!(await page.locator('#fab').isVisible())) fail('Hilfe-Knopf fehlt');
serverAus = true; let versuche = 0;
await page.route('**/api/meldung', (r) => { versuche++; r.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"nicht erreichbar"}' }); });   // Server fällt aus → Meldung muss im Gerät warten
await page.click('#fab'); await page.waitForSelector('#help:not([hidden]) #hp-menu'); await shot('67-hilfe-menue');
await page.click('#hp-menu button[data-art="idee"]'); await page.waitForSelector('#hp-form:not([hidden])');
await page.click('#hp-form button[type="submit"]'); await page.waitForSelector('#hp-note .note.tip');   // leerer Text wird abgelehnt
await page.fill('#hp-text', 'Testmeldung aus dem Browser-Test <b>ohne HTML</b>'); await shot('68-hilfe-formular');
await page.click('#hp-form button[type="submit"]'); await page.waitForSelector('#help', { state: 'hidden' });
await page.waitForSelector('#toast:not([hidden])');
const wartend = await page.evaluate(() => JSON.parse(localStorage.getItem('mt.v1')).meldungen);
if (wartend?.length !== 1 || wartend[0].art !== 'idee' || !wartend[0].version || 'aufgabe' in wartend[0]) fail('Meldung wurde nicht richtig gespeichert');
if (!versuche) fail('Meldung: kein Sende-Versuch an /api/meldung');
if (LEVEL === 3) { await page.goto(`${BASE}#/einstellungen`); await page.click('#st-tipp [data-k="an"]'); await page.reload(); await page.waitForSelector('#st-tipp [data-k="an"].sel'); }

/* ───────────── Alle Einheiten, alle Schritte ───────────── */
await page.click('#nav a[data-tab="start"]'); await page.waitForSelector('#home');
if (!(await page.textContent('h1')).includes('Verstehen')) fail('Startseite fehlt');
if (!(await page.locator('.cta a.site[href^="https://www.mathenachhilfe-online.com"]').count()) || !(await page.locator('.foot a.site').count())) fail('Startseite: Knopf zur Website fehlt');
await page.click('#fab'); await page.waitForSelector('#hp-menu a.site'); await page.click('#hp-x');
await page.click('.board .btn'); await page.waitForSelector('#mb-c');   // „Erste Runde starten" führt zum ersten Schritt
let kombo = false;
for (const u of UNITS) {
  for (let i = 0; i < u.steps.length; i++) {
    if (!(u === UNITS[0] && i === 0)) { await page.goto(`${BASE}#/u/${u.id}/${i}`); await page.waitForSelector('#stage > *'); }
    await page.evaluate(() => window.scrollTo(0, 0));
    { const btn = page.locator('#stage .row:last-child:not([hidden]) .btn:not([hidden])').last();   // Haupt-Knopf muss ohne Scrollen im Bild sein
      if (await btn.count() && await btn.isVisible()) { const r = await btn.boundingBox(), vh = page.viewportSize().height;
        if (!(r.y >= 0 && r.y + r.height <= vh + 1)) fail(`${u.id}/${u.steps[i].id}: Haupt-Knopf nicht ohne Scrollen sichtbar (y=${Math.round(r.y)}, Höhe Fenster ${vh})`); } }
    let done = false;
    for (const [sel, fn] of HANDLERS) if (await page.locator(sel).count()) { await fn(); done = true; break; }
    if (!done) { if (first(`quiz-${u.area}`)) await shot(`30-aufgabe-${u.area}`); await quiz(); if (await page.locator('#q-kombo').count()) kombo = true; }
    await page.waitForSelector('#sheet:not([hidden])');
    if (first('blatt')) await shot('05-geschafft');
    await sheetNext();
  }
}

if (LEVEL >= 3 && getippt < 20) fail(`Freie Eingabe kam zu selten vor: ${getippt}`);
if (LEVEL < 3 && getippt) fail('Freie Eingabe darf auf leichter Stufe nicht von selbst erscheinen');
// Im Spiel: Hilfe-Knopf sichtbar, verdeckt aber keinen Knopf der Aufgabe; Meldung nimmt die Aufgabe mit
await page.goto(`${BASE}#/u/regeln/3`); await page.waitForSelector('#stage .q');
if (await page.locator('#fab').isVisible()) fail('Im Spiel darf der schwebende Hilfe-Knopf nichts verdecken (er sitzt oben)');
// Jetzt antwortet ein nachgestellter Server: Die wartende und die neue Meldung müssen ankommen, die Warteschlange wird leer.
const gesendet = [];
await page.unroute('**/api/meldung'); serverAus = false;
await page.route('**/api/meldung', (r) => { gesendet.push(JSON.parse(r.request().postData())); r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }); });
await page.click('.stephead .help-x'); await page.click('#hp-menu button[data-art="aufgabe"]');
if (!(await page.textContent('#hp-ctx')).includes('Zuletzt gezeigte Aufgabe')) fail('Meldung: Aufgabe wird nicht mitgenommen');
await page.fill('#hp-text', 'Diese Aufgabe prüfen'); await page.click('#hp-form button[type="submit"]'); await page.waitForSelector('#help', { state: 'hidden' });
await page.waitForFunction(() => JSON.parse(localStorage.getItem('mt.v1')).meldungen.length === 0, null, { timeout: 5000 }).catch(() => fail('Meldungen wurden nicht gesendet'));
if (gesendet.length !== 2 || gesendet[0].art !== 'idee' || !gesendet[1].aufgabe?.gen || !gesendet[1].ort.startsWith('#/u/regeln') || Object.keys(gesendet[1]).some((k) => !['art', 'text', 'version', 'ort', 'stufe', 'zeit', 'aufgabe'].includes(k))) fail('Gesendete Meldungen unvollständig oder mit fremden Feldern');
if (!(await page.textContent('#toast')).includes('angekommen')) fail('Meldung: Bestätigung fehlt');
await page.unroute('**/api/meldung');

/* ───────────── Grundlagen stehen vorn, freies Üben ───────────── */
for (const a of ['analysis', 'stochastik', 'geometrie']) {
  await page.goto(`${BASE}#/g/${a}`); await page.waitForSelector('a.unit');
  if (!(await page.locator('a.unit').first().getAttribute('href')).endsWith('-grund')) fail(`${a}: Grundlagen stehen nicht an erster Stelle`);
  if (!(await page.locator(`a[href="#/ueben/${a}-grund"]`).count()) || !(await page.locator(`a[href="#/ueben/${a}"]`).count())) fail(`${a}: Freies Üben fehlt`);
}
await shot('62-gebiet-grundlagen');
const xpVor = await page.evaluate(() => JSON.parse(localStorage.getItem('mt.v1')).xp);
await page.click('a[href="#/ueben/geometrie-grund"]'); await page.waitForSelector('#stage .q');
if (await page.locator('#nav').isVisible()) fail('Üben: Menü muss ausgeblendet sein');
await shot('63-ueben');
await quiz();
if (!/von 10 auf Anhieb/.test(await page.textContent('#sheet'))) fail('Üben: Ergebnis fehlt');
if ((await page.evaluate(() => JSON.parse(localStorage.getItem('mt.v1')).xp)) <= xpVor) fail('Üben: keine Punkte gutgeschrieben');
await shot('64-ueben-ergebnis');
await page.click('#sh-go'); await page.waitForSelector('#stage .q');   // „Noch eine Runde" startet neu
if (await page.locator('#sheet').isVisible()) fail('Üben: neue Runde startet nicht');
await page.goto(`${BASE}#/ueben/analysis`); await page.waitForSelector('#stage .q, #stage .gaprow');

/* ───────────── Einstufungstest, Abi-Aufgabe am Stück, Zertifikat, Rechenweg ───────────── */
if (!wegGesehen) fail('Rechenweg Schritt für Schritt wurde nach Fehlversuchen nie angeboten');
await page.goto(`${BASE}#/lernen`); await page.waitForSelector('a[href="#/einstufung/ergebnis"]'); await page.click('a[href="#/einstufung/ergebnis"]');
await page.waitForSelector('#es-go'); await page.click('#es-go'); await page.waitForSelector('#stage .q');
if (await page.locator('#q-in').count()) fail('Einstufung: muss Auswahl-Aufgaben stellen');
await quiz('.es-area');
if ((await page.locator('.es-area').count()) !== 3 || !/von 12 auf Anhieb/.test(await page.textContent('h1'))) fail('Einstufung: Ergebnis unvollständig');
await shot('71-einstufung');
if (await page.locator('#es-lv').count()) { await page.click('#es-lv'); await page.waitForSelector('.note.ok'); }
await page.goto(`${BASE}#/einstellungen`); await page.waitForSelector('#lv'); await page.locator('#lv button').nth(LEVEL - 1).click();   // Stufe für den Rest des Tests zurückstellen
await page.goto(`${BASE}#/pruefung`); await page.click('a[href="#/aufgabe"]'); await page.waitForSelector('a[href="#/aufgabe/stochastik"]');
for (const a of ['analysis', 'stochastik', 'geometrie']) {
  await page.goto(`${BASE}#/aufgabe/${a}`); await page.waitForSelector('#stage .kopf');
  if (!(await page.textContent('.mission')).includes('a)')) fail(`Abi-Aufgabe ${a}: Teilaufgabe a) fehlt`);
  if (a === 'analysis') await shot('72-abi-aufgabe');
  await quiz();
  if (!/\d+ von \d+ BE/.test(await page.textContent('#vb-be'))) fail(`Abi-Aufgabe ${a}: Bewertung fehlt`);
}
await shot('73-abi-aufgabe-ergebnis');
await page.click('#sh-go'); await page.waitForSelector('#stage .kopf');
await page.goto(`${BASE}#/mehr`); await page.click('a[href="#/zertifikat"]'); await page.waitForSelector('a[href="#/zertifikat/analysis"]');
await page.click('a[href="#/zertifikat/analysis"]'); await page.waitForSelector('#zert');
await page.fill('#zt-name', 'Test Person'); if ((await page.textContent('#zt-out')) !== 'Test Person') fail('Zertifikat: Name erscheint nicht');
if (await page.evaluate(() => localStorage.getItem('mt.v1').includes('Test Person'))) fail('Zertifikat: Name darf nicht gespeichert werden');
await shot('74-zertifikat');

/* ───────────── Einstellungen, Countdown, Farben ───────────── */
await page.goto(`${BASE}#/einstellungen`); await page.waitForSelector('#st-land');
await page.click('#st-land [data-k="HE-GK"]');   // Grundkurs: Zusatz-Stoff wird markiert und ans Ende gestellt
await page.click('a[href="#/lehrplan"]'); await page.waitForSelector('h1'); if (!(await page.textContent('#view')).includes('Hessen – Grundkurs')) fail('Lehrplan-Seite fehlt'); await shot('69-lehrplan');
await page.goto(`${BASE}#/g/stochastik`); await page.waitForSelector('a.unit');
const sUnits = page.locator('a.unit[href^="#/u/"]');
if ((await sUnits.last().getAttribute('href')) !== '#/u/s-test' || !(await sUnits.last().locator('.extra').count())) fail('Grundkurs: Hypothesentests nicht als Zusatz am Ende');
await shot('70-grundkurs-stochastik');
await page.goto(`${BASE}#/u/s-verteilung`); await page.waitForSelector('.steps');
if ((await page.locator('.steps .extra').count()) !== 1) fail('Grundkurs: Sigma-Schritt nicht markiert');
await page.goto(`${BASE}#/einstellungen`); await page.waitForSelector('#st-land');
await page.click('#st-land [data-k="HE-LK"]');
await page.goto(`${BASE}#/g/stochastik`); await page.waitForSelector('a.unit'); if (await page.locator('.extra').count()) fail('Leistungskurs: nichts darf markiert sein');
await page.goto(`${BASE}#/einstellungen`); await page.waitForSelector('#st-land');
const in90 = new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10);
await page.fill('#st-abi', in90); await page.locator('#st-abi').dispatchEvent('change');
if (!(await page.locator('.skin:disabled').count())) fail('Farben: es müssen noch gesperrte übrig sein');
await page.click('.skin[data-k="blau"]');
const accent = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--orange').trim());
if (accent !== '#2f7df6') fail(`Farbe wird nicht angewendet: ${accent}`);
await shot('35-einstellungen');
await page.reload(); await page.waitForSelector('#st-land');
if ((await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--orange').trim())) !== '#2f7df6') fail('Farbe nach Neuladen vergessen');
await page.click('.skin[data-k="orange"]');
await page.goto(BASE); await page.waitForSelector('.count');
const cd = +(await page.textContent('.count .big'));
if (!(cd >= 89 && cd <= 91)) fail(`Countdown falsch: ${cd}`);
await page.goto(`${BASE}#/plan`); await page.waitForSelector('h1'); if (!/Noch \d+ Tage/.test(await page.textContent('h1'))) fail('Lernplan: Tage bis zum Abi fehlen'); await shot('75-lernplan');

/* ───────────── Runden auf Zeit ───────────── */
async function playRound(endSel) {
  for (let guard = 0; guard < 40; guard++) {
    if (await page.locator(endSel).count()) return;
    const f = page.locator('#ex-q .opt').first();
    if (await f.count()) await f.click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(950);
  }
  fail('Runde endet nicht');
}
await page.goto(`${BASE}#/pruefung`); await page.waitForSelector('#rd-pct'); await shot('20b-pruefung');
const ready = parseInt(await page.textContent('#rd-pct'), 10);
if (!(ready >= 50 && ready <= 100)) fail(`Abi-Bereitschaft unplausibel: ${ready}`);
await page.click('a[href="#/abi"]'); await page.click('a[href="#/abi/A"]'); await page.waitForSelector('#ex-q .opt');
await playRound('#ex-np'); await shot('39-abi-ergebnis');
const np = +(await page.textContent('#ex-np'));
if (!(np >= 0 && np <= 15)) fail(`Notenpunkte unplausibel: ${np}`);
await page.goto(`${BASE}#/tag`); await page.click('#rd-go'); await page.waitForSelector('#ex-q .opt'); await playRound('#rd-score');
const tagScore = +(await page.textContent('#rd-score'));
await page.goto(`${BASE}#/duell`); await page.click('#rd-go'); await page.waitForSelector('#ex-q .opt');
const firstPrompt = await page.textContent('#ex-q');
await playRound('#rd-score');
const link = await page.inputValue('#rd-link');
if (!/#\/duell\/\d+-[1-5]-\d+$/.test(link)) fail(`Duell-Link falsch: ${link}`);
await page.goto(link); await page.reload(); await page.waitForSelector('#rd-go');
if (!(await page.textContent('.lead')).includes('herausgefordert')) fail('Herausforderung wird nicht angezeigt');
await page.click('#rd-go'); await page.waitForSelector('#ex-q .opt');
if ((await page.textContent('#ex-q')) !== firstPrompt) fail('Duell: Gegner bekommt nicht dieselbe erste Aufgabe');
await playRound('#rd-score');
if (!(await page.textContent('.board')).includes('Dein Gegner hatte')) fail('Duell-Vergleich fehlt');

// Blitz-Runde: 60 Sekunden, erst richtig (Kombo), zwischendurch ein Fehler
await page.goto(`${BASE}#/blitz`); await page.click('#bz-go'); await page.waitForSelector('#bz-q .opt');
let komboSeen = false;
for (let n = 0; !(await page.locator('#bz-end').count()); n++) {
  const sel = n === 4 ? '#bz-q .opt[data-ok="0"]' : '#bz-q .opt[data-ok="1"]';
  await page.locator(sel).first().click({ timeout: 2000 }).catch(() => {});
  if (!komboSeen && await page.locator('#bz-kombo:not([hidden])').count()) { komboSeen = true; await shot('47-blitz'); }
  await page.waitForTimeout(n === 4 ? 750 : 260);
  if (n > 400) fail('Blitz-Runde endet nicht');
}
if (!komboSeen) fail('Blitz: Kombo-Anzeige fehlt');
const blitz = +(await page.textContent('#bz-end'));
if (!(blitz >= 300)) fail(`Blitz-Punkte unplausibel: ${blitz}`);
// Erfolgskarte: Bild wird erzeugt und gespeichert
await page.waitForSelector('#bz-card canvas'); await page.waitForTimeout(300);
const painted = await page.locator('#bz-card canvas').evaluate((c) => { const d = c.getContext('2d').getImageData(540, 600, 1, 1).data; return c.width === 1080 && c.height === 1350 && d[3] === 255; });
if (!painted) fail('Erfolgskarte ist leer');
const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 8000 }), page.click('#bz-card #sc-share')]);
if (!/\.png$/.test(dl.suggestedFilename())) fail('Erfolgskarte wird nicht als Bild gespeichert');
await shot('48-blitz-ergebnis');

/* ───────────── Fehler-Kartei, Bericht, Erfolge, Formeln, Wochen-Ziel ───────────── */
const kn = await page.evaluate(() => { const m = JSON.parse(localStorage.getItem('mt.v1')); for (const k of Object.values(m.kartei)) k.due = '2020-01-01'; localStorage.setItem('mt.v1', JSON.stringify(m)); return Object.keys(m.kartei).length; });
if (!kn) fail('Fehler-Kartei ist leer, obwohl Fehler gemacht wurden');
await page.goto(BASE); await page.reload(); await page.waitForSelector('a[href="#/wiederholen"]');
await page.click('a[href="#/wiederholen"]'); await page.waitForSelector('#stage > *');
await quiz('#kt-done');
await page.goto(`${BASE}#/bericht`); await page.waitForSelector('.rep-grid'); await shot('42-bericht');
const rep = await page.textContent('.report');
if (!rep.includes('Bericht für Eltern') || !rep.includes('Abi-Modus') || !rep.includes('Hier hakt es noch')) fail('Bericht unvollständig');
await page.goto(`${BASE}#/erfolge`); await page.waitForSelector('.badges'); await shot('49-erfolge');
const got = await page.locator('.badge.on').count();
if (!(got >= 12 && got < BADGES.length)) fail(`Abzeichen unplausibel: ${got} von ${BADGES.length}`);
for (const id of ['start', 'einheit1', 'alles', 'boss1', 'boss10', 'bossPerfekt', 'blitz10', 'tag1', 'kombo5']) {
  if (!(await page.evaluate((k) => !!JSON.parse(localStorage.getItem('mt.v1')).badges[k], id))) fail(`Abzeichen „${id}" fehlt`);
}
if (!kombo && LEVEL >= 3) fail('Kombo-Anzeige in den Aufgaben-Runden nie gesehen');   // auf leichter Stufe rät der Test und trifft selten zweimal in Folge
await page.goto(`${BASE}#/formeln`); await page.waitForSelector('.fcard'); await shot('50-formeln');
if (await page.locator('.fcard.locked').count()) fail('Formelkarten sind trotz abgeschlossener Einheiten gesperrt');
if (await page.locator('.katex-error').count()) fail('Eine Formel lässt sich nicht darstellen');
// Wochen-Ziel: fünf Tage → Truhe genau einmal
await page.evaluate(() => { const m = JSON.parse(localStorage.getItem('mt.v1')); const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); const key = (x) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; const days = []; for (let i = 0; i < 5; i++) { const x = new Date(d); x.setDate(d.getDate() + i); days.push(key(x)); } m.week = { key: key(d), days, claimed: false }; localStorage.setItem('mt.v1', JSON.stringify(m)); });
await page.goto(BASE); await page.reload(); await page.waitForSelector('#wk-claim'); await shot('51-wochenziel');
const xpBefore = +(await page.textContent('.chip.xp'));
await page.click('#wk-claim'); await page.waitForSelector('#wk-claim', { state: 'detached' });
if (+(await page.textContent('.chip.xp')) !== xpBefore + 50) fail('Truhe gibt nicht 50 Punkte');
// Klassen-Rangliste wird angeboten; ohne Klasse hat die App bis hierher nichts an /api geschickt (außer Meldungen)
await page.goto(`${BASE}#/pruefung`); await page.waitForSelector('a[href="#/blitz"]');
if (!(await page.locator('a[href="#/klasse"]').count())) fail('Klassen-Rangliste wird nicht angeboten');
if (apiCalls.length) fail(`Unerwartete Anfragen an den Server ohne Klasse: ${apiCalls.join(', ')}`);

/* ───────────── Fortschritt, Vorlade-Liste, Offline ───────────── */
async function countDone() {
  let n = 0;
  for (const hash of ['#/g/analysis', '#/g/stochastik', '#/g/geometrie', '#/pruefung']) { await page.goto(BASE + hash); await page.waitForSelector('.unit'); n += await page.locator('.unit.done').count(); }
  return n;
}
if ((await countDone()) !== UNITS.length) fail('Nicht alle Einheiten als fertig markiert');
await page.goto(`${BASE}#/mehr`); await page.waitForSelector('a[href="#/erfolge"]'); await shot('20c-mehr');
await page.reload(); await page.waitForSelector('.unit');
if ((await countDone()) !== UNITS.length) fail('Fortschritt nach Neuladen verloren');
await page.goto(BASE); await page.waitForSelector('#home'); await shot('20-start-fertig');
const xp = +(await page.textContent('.chip.xp'));
const missing = await page.evaluate(async () => {
  const sw = await (await fetch('sw.js', { cache: 'no-store' })).text();
  const list = JSON.parse(sw.match(/const ASSETS = (\[[\s\S]*?\]);/)[1]);
  const bad = [];
  for (const a of list) { const r = await fetch(a, { cache: 'no-store' }).catch(() => null); if (!r || !r.ok) bad.push(a); }
  return bad;
});
if (missing.length) fail('Nicht erreichbar: ' + missing.join(', '));
if (!(await page.evaluate(async () => { const r = await navigator.serviceWorker?.ready; return !!r?.active; }))) fail('Service Worker nicht aktiv');
await ctx.setOffline(true); await page.reload(); await page.waitForSelector('#home');
await page.click('#nav a[data-tab="lernen"]'); await page.click('a[href="#/g/analysis"]'); await page.click('a[href="#/u/formen"]'); await page.click('a[href="#/u/formen/0"]'); await page.waitForSelector('#mb-c');
await ctx.setOffline(false);

/* ───────────── Mit (nachgestelltem) Server: Klassen-Rangliste ───────────── */
const ctx2 = await browser.newContext({ ...devices['Pixel 7'], serviceWorkers: 'block' });
const p2 = await ctx2.newPage();
p2.on('pageerror', (e) => errors.push(`Klasse: ${e}`));
const calls = [];
await p2.route('**/js/config.js', async (route) => { const r = await route.fetch(); await route.fulfill({ response: r, body: (await r.text()).replace("api: ''", "api: '/api'") }); });
await p2.route('**/api/**', async (route) => {
  const u = new URL(route.request().url()), body = route.request().postDataJSON?.() ?? null; calls.push([u.pathname, body]);
  if (u.pathname === '/api/klasse/beitreten') return route.fulfill({ json: body.code === 'K7M2QX' ? { klasse: 'Q12 Mathe', spieler: 'p-123' } : { error: 'Diesen Code gibt es nicht.' }, status: body.code === 'K7M2QX' ? 200 : 404 });
  if (u.pathname === '/api/klasse') return route.fulfill({ json: body.name?.length >= 2 ? { code: 'K7M2QX' } : { error: 'Name fehlt.' } });
  if (u.pathname.endsWith('/rangliste')) return route.fulfill({ json: { woche: '2026-11-09', liste: [{ name: 'Mia', punkte: 540 }, { name: 'Testfuchs', punkte: 480, ich: true }, { name: '<b>Frech</b>', punkte: 10 }] } });
  return route.fulfill({ json: { ok: true } });
});
await p2.goto(`${BASE}#/pruefung`); await p2.waitForSelector('a[href="#/klasse"]'); await p2.click('a[href="#/klasse"]'); await p2.waitForSelector('#kl-code');
await p2.click('details summary'); await p2.fill('#kl-new', 'Q12 Mathe'); await p2.click('#kl-make'); await p2.waitForSelector('#kl-newnote .note.ok');
if ((await p2.inputValue('#kl-code')) !== 'K7M2QX') fail('Klasse anlegen: Code wird nicht übernommen');
await p2.fill('#kl-code', 'abc'); await p2.fill('#kl-name', 'Testfuchs'); await p2.click('#kl-join'); await p2.waitForSelector('#kl-note .note.bad');
await p2.fill('#kl-code', 'ZZZZZZ'); await p2.click('#kl-join'); await p2.waitForFunction(() => document.querySelector('#kl-note')?.textContent.includes('gibt es nicht'));
await p2.fill('#kl-code', 'k7m2qx'); await p2.click('#kl-join'); await p2.waitForSelector('#kl-list .me');
if (shots) await p2.screenshot({ path: `${shots}/52-klasse.png` });
const listText = await p2.textContent('#kl-list');
if (!listText.includes('Mia') || !listText.includes('<b>Frech</b>') || await p2.locator('#kl-list b b').count()) fail('Rangliste: Namen müssen als Text erscheinen, nicht als HTML');
await p2.goto(`${BASE}#/tag`); await p2.click('#rd-go'); await p2.waitForSelector('#ex-q .opt');
for (let g = 0; g < 40 && !(await p2.locator('#rd-score').count()); g++) { await p2.locator('#ex-q .opt').first().click({ timeout: 3000 }).catch(() => {}); await p2.waitForTimeout(950); }
await p2.waitForTimeout(300);
const meld = calls.find(([path]) => path === '/api/ergebnis');
if (!meld || meld[1].code !== 'K7M2QX' || meld[1].spieler !== 'p-123' || !Array.isArray(meld[1].antworten) || meld[1].antworten.length !== 6 || !Number.isInteger(meld[1].tag)) fail('Ergebnis wird dem Server nicht richtig gemeldet');
p2.on('dialog', (d) => d.accept());
await p2.goto(`${BASE}#/klasse`); await p2.waitForSelector('#kl-leave'); await p2.click('#kl-leave'); await p2.waitForSelector('#kl-code');
const raus = calls.find(([path]) => path === '/api/klasse/verlassen');
if (!raus || raus[1].code !== 'K7M2QX' || raus[1].spieler !== 'p-123') fail('Klasse verlassen wird dem Server nicht gemeldet');
if (await p2.evaluate(() => JSON.parse(localStorage.getItem('mt.v1')).klasse)) fail('Klasse verlassen: Eintrag bleibt im Gerät');
await ctx2.close();

/* ───────────── Breiter Bildschirm (PC): Menü oben, Karten nebeneinander, Knopf im Spiel ohne Scrollen ───────────── */
{ const pc = await (await browser.newContext({ viewport: { width: 1440, height: 860 } })).newPage();
  await pc.goto(`${BASE}#/g/analysis`); await pc.waitForSelector('a.unit');
  const nb = await pc.locator('#nav').boundingBox(), c1 = await pc.locator('a.unit').nth(0).boundingBox(), c2 = await pc.locator('a.unit').nth(1).boundingBox();
  if (nb.y > 60) fail('PC: Menü steht nicht oben');
  if (!(await pc.locator('.site-top').isVisible())) fail('PC: Knopf zur Website fehlt in der Kopfzeile');
  if (Math.abs(c1.y - c2.y) > 4 || c2.x <= c1.x + c1.width) fail('PC: Karten stehen nicht nebeneinander');
  if (c2.x + c2.width - c1.x < 800) fail('PC: Seite nutzt die Breite nicht');
  if (shots) await pc.screenshot({ path: `${shots}/80-pc-gebiet.png` });
  for (const step of ['formen/0', 'formen/1', 's-labor/0', 'g-vektor/0']) {
    await pc.goto(`${BASE}#/u/${step}`); await pc.waitForSelector('#stage .row:last-child .btn'); await pc.waitForTimeout(300);
    const r = await pc.locator('#stage .row:last-child .btn').last().boundingBox();
    if (!(r.y >= 0 && r.y + r.height <= 861)) fail(`PC: Knopf in ${step} nicht ohne Scrollen sichtbar`);
    if (await pc.locator('#nav').isVisible()) fail('PC: Menü muss beim Spielen ausgeblendet sein');
  }
  if (shots) await pc.screenshot({ path: `${shots}/81-pc-spiel.png` });
}
await browser.close();
if (errors.length) { console.error('Konsolen-Fehler:\n' + errors.join('\n')); process.exit(1); }
console.log(`e2e: kompletter Durchlauf ohne Fehler (Stufe ${LEVEL}, ${xp} Punkte, ${UNITS.length} Einheiten mit Boss, Abi ${np} NP, Tages-Runde ${tagScore}, Blitz ${blitz}, ${got} Abzeichen, Duell, Kartei, Bericht, Formeln, Wochen-Ziel, Klasse mit nachgestelltem Server, offline ok)`);
