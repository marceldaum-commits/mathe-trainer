// Spielt die ganze App im Handy-Browser durch (Playwright). Aufruf: node tests/e2e.mjs [Bilder-Ordner]
// Erwartet die App unter http://localhost:8123 (npm start). LEVEL=1..5 wählt die Schwierigkeit, DARK=1 das dunkle Gerät.
import { createRequire } from 'node:module';
import { torFalls, einstellungenAuf } from './tor-hilfe.mjs';
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
await ctx.addInitScript(() => { window.__mtTest = true; });
await ctx.route('**/zaehler/v1/e', (r) => r.fulfill({ status: 204, body: '' }));   // anonyme Nutzungszählung: der Test-Server (reine Dateien) kennt sie nicht   // markiert in Boss und Blitz die richtige Antwort
const page = await ctx.newPage();
const errors = [];
let serverAus = false;   // solange der nachgestellte Melde-Server „nicht erreichbar“ spielt, sind seine Lade-Fehler erwartet
page.on('console', (m) => { if (m.type() === 'error' && !(serverAus && /Failed to load resource/.test(m.text()))) errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));
page.on('response', (r) => { if (r.status() === 404 && !serverAus) errors.push(`404: ${r.url()}`); });   // damit ein fehlender Abruf beim Namen genannt wird
// Der Test-Server (reine Dateien) kennt /api/status nicht – hier antwortet er wie die Live-Seite: KI aus, kein Verkauf.
await page.route('**/api/status', (r) => r.fulfill({ json: { ok: true, stufe: 'live', ki: false, premium: false } }));
const apiCalls = [];
page.on('request', (r) => { const p = new URL(r.url()).pathname; if (p.startsWith('/api/') && p !== '/api/meldung') apiCalls.push(p); });
const shot = async (name) => { if (shots) await page.screenshot({ path: `${shots}/${name}.png` }); };
const spur = [];   // die letzten Ereignisse der Seite – wird nur ausgegeben, wenn der Test abbricht
const merke = (t) => { spur.push(`${new Date().toISOString().slice(11, 23)} ${t}`); if (spur.length > 60) spur.shift(); };
page.on('requestfailed', (r) => merke(`Abruf gescheitert: ${r.url().replace(BASE, '')} ${r.failure()?.errorText || ''}`)); page.on('pageerror', (e) => merke(`Seitenfehler: ${String(e).slice(0, 200)}`)); page.on('console', (m) => { if (m.type() !== 'log') merke(`Konsole ${m.type()}: ${m.text().slice(0, 200)}`); });
page.on('framenavigated', (f) => { if (f === page.mainFrame()) merke(`Seite: ${f.url().replace(BASE, '/')}`); }); page.on('response', (r) => { if (r.status() >= 400) merke(`Antwort ${r.status()}: ${r.url().replace(BASE, '')}`); });
// Pausiert die Test-Umgebung den Rechner (Cloud-Container werden manchmal angehalten und fortgesetzt), reißen Abrufe ab und Seiten bleiben leer.
// Der Herzschlag erkennt das: Zwischen zwei Schlägen sollte etwa eine Sekunde liegen.
{ let zuletzt = Date.now(); setInterval(() => { const jetzt = Date.now(); if (jetzt - zuletzt > 8000) merke(`RECHNER PAUSIERT: ${Math.round((jetzt - zuletzt) / 1000)} s ohne Herzschlag`); zuletzt = jetzt; }, 1000).unref(); }
process.on('uncaughtException', async (e) => { console.error(String(e).split('\n')[0]); console.error('Letzte Ereignisse:\n  ' + spur.slice(-25).join('\n  ')); try { console.error('Zustand: ' + JSON.stringify(await page.evaluate(() => ({ adresse: location.href, bereit: document.readyState, sw: !!navigator.serviceWorker?.controller, ansicht: document.querySelector('#view')?.children.length, skripte: performance.getEntriesByType('resource').filter((r) => r.name.endsWith('.js')).length })))); } catch { /* Seite antwortet nicht */ } console.error((String(e?.stack || '').split('\n').find((z) => /e2e\.mjs:\d+/.test(z)) || '').trim()); if (shots) await page.screenshot({ path: `${shots}/fehler.png` }).catch(() => {}); process.exit(1); });
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
  { const breit = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth, scrollX]); if (breit[0] > breit[1] + 1 || breit[2] !== 0) fail(`Seite ragt seitlich über den Bildschirm (${breit[0]} > ${breit[1]}) bei: ${(await page.textContent('.mission')).slice(0, 80)}`); }
  if (await page.locator('.ki').count()) fail('KI-Knopf darf ohne eingeschaltete KI nicht erscheinen');
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
const ZS = await game('strahl'), SFL = await game('streifen'), KGL = await game('kaestchen'), FRL = (await import('../app/js/games/strahl.js')).levelsFrost(LEVEL);
async function playStrahl(LS, k) {
  for (const M of LS) { await setRange(`#${k}-in`, M.ziel); await page.click(`#${k}-go`); await page.waitForSelector(`#${k}-note .note.ok`); if (M.runde) await page.click(`#${k}-r [data-v="${M.richtig}"]`); await page.click(`#${k}-go`); }
}
async function playStreifen() {
  for (const M of SFL) { await page.waitForFunction((n) => document.querySelectorAll('.sf-teil').length === n && !document.querySelector('.sf-teil.an'), M.teile);
    if (first('streifen-falsch')) { await page.click('#sf-go'); await page.waitForSelector('#sf-note .note.tip'); }
    for (let i = 0; i < M.soll; i++) await page.locator('.sf-teil').nth(i).click();
    if (first('streifen-bild')) await shot('87-bruch-streifen');
    await page.click('#sf-go'); await page.waitForSelector('#sf-note .note.ok'); await page.click('#sf-go'); }
}
async function playKaestchen() {
  for (const M of KGL) { await page.waitForFunction((t) => document.querySelector('#kg-t').textContent === t && !document.querySelector('#kg-note').innerHTML, M.text);
    await setRange('#kg-b', M.sol[0]); await setRange('#kg-h', M.sol[1]); if (first('kaestchen-bild')) await shot('88-kaestchen');
    await page.click('#kg-go'); await page.waitForSelector('#kg-note .note.ok'); await page.click('#kg-go'); }
}
const FDL = await game('felder'), SWL = await game('stellen'), WUL = await game('wuerfel'), AUL = await game('ausgleich');
const WGL = await game('waage'), PZL = await game('prozent'), GZL = await game('geraden'), GRL = await game('gluecksrad'), PQL = await game('quadrate'), ZWL = await game('zinsen'), EKL = await game('kreis');
const stufe = async (id, i, n) => page.waitForFunction(([s, t]) => document.querySelector(s).textContent === t && !document.querySelector(s.replace('-n', '-note')).innerHTML, [`#${id}-n`, `${i + 1}/${n}`]);
const ZPL = await game('zahlenpaare'), BML = await game('bruchmal');
async function playZahlenpaare() {
  for (let i = 0; i < ZPL.length; i++) { const M = ZPL[i]; await page.waitForFunction(([t, n]) => document.querySelector('#zp-n').textContent === t && document.querySelectorAll('.zp-karte').length === n && !document.querySelector('.zp-karte.weg'), [`${i + 1}/${ZPL.length}`, M.zahlen.length]);
    if (first('zp-falsch')) { await page.click('.zp-karte[data-i="0"]'); await page.click('.zp-karte[data-i="2"]'); await page.waitForSelector('#zp-note .note.tip'); }
    for (let p = 0; p < M.paare.length; p++) { await page.click(`.zp-karte[data-i="${2 * p}"]`); await page.click(`.zp-karte[data-i="${2 * p + 1}"]`); if (first('zp-bild')) await shot('92-zahlenpaare'); }
    await page.waitForSelector('#zp-go:not([hidden])'); await page.click('#zp-go'); }
}
const SKL = await game('gitter'), WZL = await game('zeiger');
async function playGitter() {
  for (let i = 0; i < SKL.length; i++) { const M = SKL[i]; await page.waitForFunction(([t, n]) => document.querySelector('#sk-n').textContent === t && document.querySelectorAll('.sk-schatz').length === 0 && document.querySelector('#sk-go').hidden && /von/.test(document.querySelector('#sk-s').textContent) && document.querySelectorAll('.sk-punkt').length === n, [`${i + 1}/${SKL.length}`, (M.max - M.min + 1) ** 2]);
    if (first('sk-falsch')) { const [x, y] = M.punkte[0]; await page.locator(`.sk-punkt[data-x="${y}"][data-y="${x}"]`).click({ force: true }); await page.waitForSelector('#sk-note .note.tip'); }
    for (const [x, y] of M.punkte) { await page.locator(`.sk-punkt[data-x="${x}"][data-y="${y}"]`).click({ force: true }); if (first('sk-bild')) await shot('91-schatzkarte'); }
    await page.waitForSelector('#sk-go:not([hidden])'); await page.click('#sk-go'); }
}
async function playWaage() {
  for (let i = 0; i < WGL.length; i++) { const M = WGL[i]; await stufe('wg', i, WGL.length);
    if (first('waage-falsch') && M.b > 0) { await page.click('#wg-t2'); await page.waitForSelector('#wg-note .note.tip'); }
    for (let k = 0; k < M.b; k++) await page.click('#wg-e');
    for (let k = 0; k < M.c; k++) await page.click('#wg-x');
    if (first('waage-bild')) await shot('93-waage');
    await page.click('#wg-t2'); await page.waitForSelector('#wg-note .note.ok'); await page.click('#wg-go'); }
}
async function playEinsteller(id, L, wert, bild) {
  for (let i = 0; i < L.length; i++) { await stufe(id, i, L.length);
    if (first(`${id}-falsch`)) { await page.click(`#${id}-go`); await page.waitForSelector(`#${id}-note .note.tip`); }
    for (const [sel, v] of wert(L[i])) await setRange(sel, v);
    if (first(`${id}-bild`)) await shot(bild);
    await page.click(`#${id}-go`); await page.waitForSelector(`#${id}-note .note.ok`); await page.click(`#${id}-go`); }
}
async function playRad() {
  for (let i = 0; i < GRL.length; i++) { await stufe('gr', i, GRL.length);
    if (first('gr-falsch')) { await page.click('#gr-go'); await page.waitForSelector('#gr-note .note.tip'); }
    for (let k = 0; k < GRL[i].soll; k++) await page.locator(`.gr-feld[data-i="${k}"]`).click();
    if (first('gr-bild')) await shot('96-gluecksrad');
    await page.click('#gr-go'); await page.waitForSelector('#gr-note .note.ok'); await page.click('#gr-go'); }
}
async function playFelder() {
  for (const M of FDL) { await page.waitForFunction((n) => document.querySelector('#fd-in').max === String(n) && !document.querySelector('#fd-in').disabled, M.n);
    if (first('felder-falsch') && M.n % 4 !== 0) { await setRange('#fd-in', 4); await page.click('#fd-go'); await page.waitForSelector('#fd-note .note.tip'); }
    for (const d of M.sol) { await setRange('#fd-in', d); if (first('felder-bild') && d > 1) await shot('89-felder'); await page.click('#fd-go'); }
    await page.waitForFunction(() => /Alle gefunden/.test(document.querySelector('#fd-note').textContent)); await page.click('#fd-go'); }
}
async function playStellen() {
  for (const M of SWL) { await page.waitForFunction(() => !document.querySelector('#sw-mal').disabled && !document.querySelector('#sw-note').innerHTML);
    for (let k = 0; k < Math.abs(M.schritte); k++) await page.click(M.schritte > 0 ? '#sw-mal' : '#sw-durch');
    if (first('stellen-bild')) await shot('90-stellenwert');
    await page.click('#sw-go'); await page.waitForSelector('#sw-note .note.ok'); await page.click('#sw-go'); }
}
async function playWuerfel() {
  for (const M of WUL) { await page.waitForFunction((t) => document.querySelector('#wu-t').textContent === t && !document.querySelector('#wu-note').innerHTML, M.text);
    await setRange('#wu-a', M.sol[0]); await setRange('#wu-b', M.sol[1]); await setRange('#wu-h', M.sol[2]); if (first('wuerfel-bild')) await shot('91-wuerfel');
    await page.click('#wu-go'); await page.waitForSelector('#wu-note .note.ok'); await page.click('#wu-go'); }
}
async function playAusgleich() {
  for (let r = 0; r < AUL.length; r++) { await page.waitForFunction((n) => document.querySelectorAll('.au-turm').length === n && document.querySelector('#au-go').hidden, AUL[r].werte.length);
    for (let guard = 0; guard < 80 && !(await page.locator('#au-go').isVisible()); guard++) {
      const h = await page.evaluate(() => [...document.querySelectorAll('.au-turm')].map((b) => +b.dataset.h));
      await page.locator('.au-turm').nth(h.indexOf(Math.max(...h))).click(); await page.locator('.au-turm').nth(h.indexOf(Math.min(...h))).click(); }
    if (first('ausgleich-bild')) await shot('92-tuerme');
    await page.click('#au-go'); }
}
const HANDLERS = [['#sk', playGitter], ['#wz', () => playEinsteller('wz', WZL, (M) => [['#wz-in', M.ziel]], '91-winkelzeiger')], ['#zp', playZahlenpaare], ['#bm', () => playEinsteller('bm', BML, (M) => [['#bm-a', M.a], ['#bm-c', M.c]], '92-bruchfelder')], ['#wg', playWaage], ['#pz', () => playEinsteller('pz', PZL, (M) => [['#pz-in', M.ziel]], '94-prozent')], ['#gz', () => playEinsteller('gz', GZL, (M) => [['#gz-m', M.m], ['#gz-b', M.b]], '95-geraden')], ['#gr', playRad], ['#pq', () => playEinsteller('pq', PQL, (M) => [['#pq-a', M.sol[0]], ['#pq-b', M.sol[1]]], '97-pythagoras')], ['#zw', () => playEinsteller('zw', ZWL, (M) => [['#zw-in', M.sol]], '98-wachstum')], ['#ek', () => playEinsteller('ek', EKL, (M) => [['#ek-in', M.ziel]], '99-einheitskreis')], ['#fd', playFelder], ['#sw', playStellen], ['#wu', playWuerfel], ['#au', playAusgleich], ['#zs', () => playStrahl(ZS, 'zs')], ['#fr', () => playStrahl(FRL, 'fr')], ['#sf', playStreifen], ['#kg', playKaestchen], ['#tf', playTafel], ['#mb-c', playMurmelbahn], ['#fg-c', playFlug], ['#tg-c', playTangente], ['#p-f', playPaare], ['#z-d', playZeichnen], ['#fl-c', playFlaeche], ['#lb-c', playLabor], ['#lo-c', playLotse], ['#wk-c', playWerkstatt], ['#rm-c', playRaum], ['#bs', playBoss], ['#i-next', info]];

/* ───────────── Start, Menü, Schwierigkeit, Hell/Dunkel ───────────── */
await page.goto(BASE); await page.waitForSelector('#home'); await shot('01-start');
if ((await page.locator('#nav a').count()) !== 4) fail('Menüleiste fehlt');
{ const man = await page.evaluate(async () => (await fetch(document.querySelector('link[rel="manifest"]').href)).json());   // App-Manifest: Kurzbefehle und Vorschaubilder sind erreichbar
  for (const f of [...man.icons, ...man.screenshots, ...man.shortcuts.flatMap((s) => s.icons)]) if (!(await page.evaluate(async (src) => (await fetch(src)).ok, f.src))) fail(`Manifest: ${f.src} fehlt`);
  if ((await page.getAttribute('meta[name="theme-color"]', 'content')) !== (process.env.DARK ? '#0b1330' : '#ffffff')) fail('Statusleisten-Farbe auf der Startseite passt nicht zur Kopfzeile'); }
if (await page.locator('#home a[href^="#/u/"]:not(.btn)').count()) fail('Startseite listet wieder einzelne Einheiten auf');
const startHeight = await page.evaluate(() => document.documentElement.scrollHeight);
if (startHeight > 2400) fail(`Startseite zu lang: ${startHeight}px`);
if (!(await page.locator('.week').count())) fail('Wochen-Ziel fehlt auf der Startseite');
if ((await page.locator('#home .tile').count()) > 4) fail('Startseite: mehr als vier Kacheln');
if ((await page.textContent('#stufe')) !== 'von Mathenachhilfe Online' || await page.locator('#stufe.stufe').count()) fail('Ohne Zugang darf keine Stufe unter dem App-Namen stehen');
await page.click('#nav a[data-tab="lernen"]'); await page.waitForSelector('a[href="#/g/analysis"]');
await page.waitForSelector('#nav a[data-tab="lernen"].on', { timeout: 5000 }).catch(() => fail('Menü markiert „Lernen" nicht'));
await page.waitForFunction(() => document.querySelector('#view h1')?.textContent.includes('Wähle ein Gebiet'));
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
await page.goto(BASE); await page.waitForSelector('#ver'); if (!/^Version \d+\.\d+\.\d+ · \d{2}\.\d{2}\.\d{4}$/.test((await page.textContent('#ver')).trim())) fail(`Version mit Datum fehlt in der Fußzeile: ${await page.textContent('#ver')}`);
await page.goto(`${BASE}#/lernen`); await page.waitForSelector('#fab');
{ const lg = page.locator('.top a.brand-logo'); if (await page.locator('.sitebar').count()) fail('Die Leiste über der Kopfzeile soll weg sein'); if (!(await lg.isVisible()) || (await lg.getAttribute('href')) !== 'https://www.mathenachhilfe-online.com/' || (await lg.getAttribute('target')) !== '_blank') fail('Logo oben links führt nicht zur Website'); if ((await page.locator('.top a.brand-text').getAttribute('href')) !== '#/') fail('Schriftzug führt nicht zur Startseite'); if ((await page.locator('.top').boundingBox()).y > 1) fail('Kopfzeile sitzt nicht ganz oben'); }
serverAus = true; let versuche = 0;
await page.route('**/api/meldung', (r) => { versuche++; r.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"nicht erreichbar"}' }); });   // Server fällt aus → Meldung muss im Gerät warten
await page.click('#fab'); await page.waitForSelector('#help:not([hidden]) #hp-menu'); await shot('67-hilfe-menue');
await page.click('#hp-menu button[data-art="idee"]'); await page.waitForSelector('#hp-form:not([hidden])');
await page.click('#hp-form button[type="submit"]'); await page.waitForSelector('#hp-note .note.tip');   // leerer Text wird abgelehnt
await page.fill('#hp-text', 'Testmeldung aus dem Browser-Test <b>ohne HTML</b>'); await shot('68-hilfe-formular');
await page.click('#hp-form button[type="submit"]'); await page.waitForSelector('#help', { state: 'hidden' });
await page.waitForSelector('#toast:not([hidden])');
const wartend = await page.evaluate(() => JSON.parse(localStorage.getItem('mathetrainer.v1')).meldungen);
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
await page.waitForFunction(() => JSON.parse(localStorage.getItem('mathetrainer.v1')).meldungen.length === 0, null, { timeout: 5000 }).catch(() => fail('Meldungen wurden nicht gesendet'));
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
const xpVor = await page.evaluate(() => JSON.parse(localStorage.getItem('mathetrainer.v1')).xp);
await page.click('a[href="#/ueben/geometrie-grund"]'); await page.waitForSelector('#stage .q');
if (await page.locator('#nav').isVisible()) fail('Üben: Menü muss ausgeblendet sein');
await shot('63-ueben');
await quiz();
if (!/von 10 auf Anhieb/.test(await page.textContent('#sheet'))) fail('Üben: Ergebnis fehlt');
if ((await page.evaluate(() => JSON.parse(localStorage.getItem('mathetrainer.v1')).xp)) <= xpVor) fail('Üben: keine Punkte gutgeschrieben');
await shot('64-ueben-ergebnis');
await page.click('#sh-go'); await page.waitForSelector('#stage .q');   // „Noch eine Runde" startet neu
if (await page.locator('#sheet').isVisible()) fail('Üben: neue Runde startet nicht');
await page.goto(`${BASE}#/ueben/analysis`); await page.waitForSelector('#stage .q, #stage .gaprow');

/* ───────────── Einstufungstest, Abi-Aufgabe am Stück, Zertifikat, Rechenweg ───────────── */
if (!wegGesehen) fail('Rechenweg Schritt für Schritt wurde nach Fehlversuchen nie angeboten');
await page.goto(`${BASE}#/lernen`); await page.waitForSelector('a[href="#/einstufung/ergebnis"]'); await page.click('a[href="#/einstufung/ergebnis"]');
await page.waitForSelector('#es-go'); await page.click('#es-go'); await page.waitForSelector('#stage .q');
if (await page.locator('#q-in').count()) fail('Einstufung: muss Auswahl-Aufgaben stellen');
await quiz('.es-area[data-a="analysis"]');
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
if (await page.evaluate(() => localStorage.getItem('mathetrainer.v1').includes('Test Person'))) fail('Zertifikat: Name darf nicht gespeichert werden');
await shot('74-zertifikat');

/* ───────────── Arbeitsblatt, Probeklausur, Theorie, Lernkarten ───────────── */
await page.goto(`${BASE}#/pruefung`); await page.click('a[href="#/blatt"]'); await page.waitForSelector('#b-go');
await page.click('#b-go'); if (!/mindestens ein Thema/.test(await page.textContent('#b-note'))) fail('Arbeitsblatt: ohne Thema muss ein Hinweis kommen');
await page.click('[data-u="regeln"]'); await page.click('[data-u="s-baum"]'); await page.click('#b-n [data-n="5"]'); await page.click('#b-go'); await page.waitForSelector('#blatt');
{ const b = await page.evaluate(() => ({ auf: document.querySelectorAll('.b-aufgabe').length, lsg: document.querySelectorAll('.b-lsg').length, logo: !!document.querySelector('.b-logo')?.complete && document.querySelector('.b-logo').naturalWidth > 0,
    firma: document.querySelector('.b-firma').textContent, breit: document.documentElement.scrollWidth - innerWidth, hash: location.hash }));
  if (b.auf !== 5 || b.lsg !== 5) fail(`Arbeitsblatt: ${b.auf} Aufgaben und ${b.lsg} Lösungen statt 5`);
  if (!b.logo || !/Mathenachhilfe Online/.test(b.firma)) fail('Arbeitsblatt: Logo oder Firmenname fehlt');
  if (b.breit > 1) fail(`Arbeitsblatt: Seite ${b.breit}px zu breit`);
  const erste = await page.textContent('.b-aufgabe'); await page.reload(); await page.waitForSelector('#blatt');
  if ((await page.textContent('.b-aufgabe')) !== erste) fail('Arbeitsblatt: nach Neuladen ein anderes Blatt (Nummer muss das Blatt festlegen)'); }
await shot('77-arbeitsblatt');
await page.click('#b-los'); await page.waitForSelector('#stage');
await page.waitForSelector('#stage .opt, #stage #q-in');
for (let i = 0; i < 6 && !(await page.$('#b-ergebnis')); i++) await solveQuestion();
if (!(await page.$('#b-ergebnis'))) fail('Arbeitsblatt: Lösen in der App endet nicht');
await page.goto(`${BASE}#/blatt/klausur_${LEVEL}_4711`); await page.waitForSelector('#blatt');
if ((await page.locator('.b-aufgabe').count()) !== 12 || !/48 Punkte/.test(await page.textContent('.b-titel')) || !(await page.locator('.b-np').count())) fail('Probeklausur: 12 Aufgaben, 48 Punkte und Notenpunkte-Tabelle erwartet');
await page.goto(`${BASE}#/blatt/kaputt_1_2`); await page.waitForSelector('#b-go');   // kaputte Adresse → Auswahl statt Fehler
await page.goto(`${BASE}#/pro`); await page.waitForSelector('#pro-stufe');   // Übersicht der Stufen: ohne Zugang „Frei“, Pro-Funktionen als gesperrt markiert
if ((await page.textContent('#pro-stufe')) !== 'Frei' || (await page.locator('.pro-zeile.zu').count()) < 8 || (await page.locator('.pro-zeile.offen').count()) < 4) fail('Stufen-Übersicht: ohne Zugang falsch');
if (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth > 1)) fail('Stufen-Übersicht: Seite zu breit');
await page.goto(`${BASE}#/blatt`); await page.waitForSelector('#b-go');
// Schwächen-Blatt: entsteht aus der Fehler-Kartei (der Test hat bis hierher absichtlich Fehler gemacht)
if (await page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('mathetrainer.v1')).kartei || {}).length) === 0) fail('Schwächen-Blatt: Fehler-Kartei ist leer, obwohl der Test Fehler gemacht hat');
if (await page.locator('#b-schwach').isHidden()) fail('Schwächen-Blatt: Knopf fehlt trotz gefüllter Fehler-Kartei');
await page.click('#b-schwach'); await page.waitForSelector('#blatt');
if (!/Schwächen-Blatt/.test(await page.textContent('.b-titel')) || !(await page.locator('.b-schritte').count()) || !(await page.locator('.b-aufgabe').count())) fail('Schwächen-Blatt: Titel, Aufgaben oder Rechenweg fehlen');
if (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth > 1)) fail('Schwächen-Blatt: Seite zu breit');
await page.goto(`${BASE}#/lernen`); await page.click('a[href="#/theorie"]'); await page.waitForSelector('a[href="#/theorie/extrema"]');
if ((await page.locator('a[href^="#/theorie/"]').count()) !== UNITS.filter((u) => u.area !== 'pruefung').length) fail('Theorie: nicht jede Lern-Einheit hat ein Kapitel');
await page.click('a[href="#/theorie/extrema"]'); await page.waitForSelector('#kapitel');
if (/Durchgerechnetes Beispiel/.test(await page.textContent('#kapitel'))) fail('Theorie: startet nicht mit der Kurzfassung');
await page.click('#t-art [data-l="1"]'); await page.waitForFunction(() => /Durchgerechnetes Beispiel/.test(document.querySelector('#kapitel').textContent));
if (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth > 1)) fail('Theorie: Seite zu breit');
await shot('78-theorie');
// Merkbilder: bewegte Bilder unter den passenden Formeln; der Regler gehört dem Finger, sobald man ihn berührt
await page.goto(`${BASE}#/theorie/regeln`); await page.waitForSelector('#kapitel .merk canvas');
{ const m = await page.evaluate(async () => { const el = document.querySelector('#kapitel .merk'), inp = el.querySelector('input'), c = el.querySelector('canvas');
    const bunt = () => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 400) if (d[i] > 0) n++; return n; };
    await new Promise((r) => setTimeout(r, 400)); const v1 = inp.value; await new Promise((r) => setTimeout(r, 500)); const laeuft = inp.value !== v1;
    inp.dispatchEvent(new Event('pointerdown')); inp.value = inp.max; inp.dispatchEvent(new Event('input')); await new Promise((r) => setTimeout(r, 400));
    return { anzahl: document.querySelectorAll('#kapitel .merk').length, laeuft, bleibt: inp.value === inp.max, gemalt: bunt(), text: el.querySelector('.merk-text').textContent.length, breit: document.documentElement.scrollWidth - innerWidth }; });
  if (m.anzahl < 2) fail(`Merkbilder: im Kapitel „Ableitungsregeln“ nur ${m.anzahl} statt mindestens 2`);
  if (!m.laeuft) fail('Merkbild: bewegt sich nicht von selbst');
  if (!m.bleibt) fail('Merkbild: Regler springt nach dem Anfassen wieder weg');
  if (m.gemalt < 20 || m.text < 10) fail('Merkbild: Bild oder Text bleibt leer');
  if (m.breit > 1) fail('Merkbild: Seite zu breit'); }
await shot('79-merkbild');
await page.goto(`${BASE}#/theorie/a-trig`); await page.waitForSelector('#kapitel'); await page.click('#t-art [data-l="1"]');
await page.waitForFunction(() => /Durchgerechnetes Beispiel/.test(document.querySelector('#kapitel').textContent)).catch(() => fail('Theorie: ausführliche Fassung von „Sinus und Kosinus“ erscheint nicht'));
if (await page.evaluate(() => document.querySelectorAll('#kapitel .katex-error').length)) fail('Theorie: Formel-Fehler im ausführlichen Kapitel');
await page.goto(`${BASE}#/u/extrema`); if (!(await page.locator('#u-theorie').count())) fail('Theorie: Link in der Einheit fehlt');
await page.goto(`${BASE}#/mehr`); await page.click('a[href="#/karten"]'); await page.waitForSelector('#lk-go');
await page.fill('#lk-vorn', 'Test <i>vorn</i>'); await page.fill('#lk-hinten', 'Test hinten'); await page.click('#lk-neu'); await page.waitForSelector('.lk-weg');
if (await page.locator('.lk-zeile i').count()) fail('Lernkarten: eigener Text darf kein HTML werden');
const lkVor = parseInt(await page.textContent('#view h1'), 10);
await page.click('#lk-go'); await page.waitForSelector('#lk-dreh');
if (await page.locator('#lk-rueck').isVisible()) fail('Lernkarten: Rückseite ist schon vor dem Umdrehen zu sehen');
for (let i = 0; i < 600 && !(await page.$('#lk-ende')); i++) { if (await page.$('#lk-dreh')) { const r = await page.locator('#lk-dreh').boundingBox(); if (r.y + r.height > page.viewportSize().height + 1) fail('Lernkarten: Knopf nicht ohne Scrollen sichtbar'); await page.click('#lk-dreh'); } else await page.click(i % 3 ? '#lk-ja' : '#lk-nein'); }
if (!(await page.$('#lk-ende'))) fail('Lernkarten: Runde endet nicht');
await page.click('#lk-zurueck'); await page.waitForSelector('#lk-go');
{ const nach = parseInt(await page.textContent('#view h1'), 10); if (!(nach === Math.max(0, lkVor - 20))) fail(`Lernkarten: nach einer Runde sollten ${Math.max(0, lkVor - 20)} Karten übrig sein, es sind ${nach}`); if (nach === 0 && !(await page.locator('#lk-go').isDisabled())) fail('Lernkarten: Knopf muss ohne fällige Karten gesperrt sein'); }
await page.click('.lk-weg'); if (await page.locator('.lk-weg').count()) fail('Lernkarten: eigene Karte lässt sich nicht löschen');

/* ───────────── Karte mit Geschichte, Abenteuer-Modus, ruhiger Modus ───────────── */
await page.goto(`${BASE}#/karte`); await page.waitForSelector('.k-land');
{ const k = await page.evaluate(() => ({ laender: document.querySelectorAll('.k-land').length, st: document.querySelectorAll('.k-st').length, fig: document.querySelectorAll('.k-st svg.figur').length, breit: document.documentElement.scrollWidth - innerWidth,
    raus: [...document.querySelectorAll('.k-st')].filter((n) => { const r = n.getBoundingClientRect(), f = n.parentElement.getBoundingClientRect(); return r.left < f.left - 2 || r.right > f.right + 2; }).length }));
  const soll = UNITS.filter((u) => u.area !== 'pruefung').length;
  if (k.laender !== 3 || k.st !== soll || k.fig < soll) fail(`Karte: ${k.laender} Länder, ${k.st} Stationen, ${k.fig} Figuren (erwartet 3/${soll})`);
  if (k.breit > 1) fail(`Karte: Seite ist ${k.breit}px zu breit`);
  if (k.raus) fail(`Karte: ${k.raus} Stationen ragen aus dem Feld`); }
await shot('75-karte');
await page.locator('.k-st').first().click(); await page.waitForSelector('.steps'); if (!/#\/u\//.test(page.url())) fail('Karte: Station führt nicht zur Einheit');
await page.goto(`${BASE}#/pruefung`); await page.click('a[href="#/abenteuer"]'); await page.waitForSelector('#ab-start');
await page.click('.ab-geb [data-g="analysis"]'); await page.click('#ab-start'); await page.waitForSelector('#ab-q .opt');
{ const herzen = () => page.locator('.ab-leben .on').count(), vor = await herzen();
  await page.locator('#ab-q .opt[data-ok="0"]').first().click(); await page.waitForSelector('#ab-next');
  if ((await herzen()) !== vor - 1) fail('Abenteuer: Fehler kostet kein Leben');
  let raeume = 0, wahl = 0;
  for (let i = 0; i < 120 && !(await page.$('#ab-ende')); i++) {
    if (await page.$('.ab-tuer')) { raeume++; const ohneRast = page.locator('.ab-tuer:not(.rast)'); await ((await ohneRast.count()) ? ohneRast : page.locator('.ab-tuer')).first().click(); continue; }   // Rastplätze geben keine Belohnung – sonst hinge die Zählung unten vom Zufall ab
    if (await page.$('.ab-up')) { wahl++; if ((await page.locator('.ab-up').count()) !== 3) fail('Abenteuer: nicht drei Belohnungen zur Wahl'); await page.locator('.ab-up').first().click(); continue; }
    if (await page.$('#ab-weiter')) { await page.click('#ab-weiter'); continue; }
    if (await page.$('#ab-next')) {
      const r = await page.locator('#ab-next').boundingBox(), vh = page.viewportSize().height;
      if (!r || r.y < 0 || r.y + r.height > vh + 1) fail('Abenteuer: Weiter-Knopf nicht ohne Scrollen sichtbar');
      if (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth > 1)) fail('Abenteuer: Seite zu breit');
      await page.click('#ab-next'); continue; }
    if (await page.$('#ab-kristall')) { const n = await page.locator('#ab-q .opt:not([disabled])').count(); await page.click('#ab-kristall'); if ((await page.locator('#ab-q .opt:not([disabled])').count()) !== n - 1) fail('Abenteuer: Tipp-Kristall streicht keine Antwort'); }
    await page.locator('#ab-q .opt[data-ok="1"]').first().click();
  }
  if (!/besiegt/.test(await page.textContent('#ab-ende'))) fail('Abenteuer: Reise mit lauter richtigen Antworten nicht gewonnen');
  if (raeume < 5 || wahl < 4) fail(`Abenteuer: zu wenig Türen (${raeume}) oder Belohnungen (${wahl})`);
  const c = await page.evaluate(() => JSON.parse(localStorage.getItem('mathetrainer.v1')).count);
  if (!(c.abenteuerSieg >= 1 && c.abenteuerRekord > 20 && c.abenteuerRaum === 7)) fail('Abenteuer: Sieg oder Rekord nicht gespeichert'); }
await shot('76-abenteuer');
await page.goto(`${BASE}#/einstellungen`); await page.waitForSelector('#st-ruhig');
if (!(await page.$('.chip.fire'))) fail('Lernserie fehlt im normalen Modus');
await page.click('#st-ruhig'); if ((await page.getAttribute('#st-ruhig', 'aria-checked')) !== 'true') fail('Ruhiger Modus: Schalter geht nicht an');
if (await page.$('.chip.fire')) fail('Ruhiger Modus: Lernserie noch zu sehen');
await page.reload(); await page.waitForSelector('#st-ruhig.an'); if (await page.$('.chip.fire')) fail('Ruhiger Modus: nach Neuladen vergessen');
await page.goto(`${BASE}#/abi`); await page.waitForSelector('a[href="#/abi/A"]'); if (!/ohne Uhr/.test(await page.textContent('a[href="#/abi/A"]'))) fail('Ruhiger Modus: Abi-Modus zeigt noch Minuten');
await page.click('a[href="#/abi/A"]'); await page.waitForSelector('#ex-q .opt'); await page.waitForTimeout(400); if (await page.locator('#ex-t').isVisible()) fail('Ruhiger Modus: Uhr im Abi-Modus sichtbar');
await page.goto(`${BASE}#/abenteuer`); await page.click('#ab-start'); await page.waitForSelector('#ab-q .opt'); if (await page.$('.ab-leben')) fail('Ruhiger Modus: Abenteuer zeigt Leben');
await page.goto(`${BASE}#/`); await page.waitForSelector('#home'); if (await page.$('.week')) fail('Ruhiger Modus: Wochen-Ziel noch auf der Startseite');
await page.goto(`${BASE}#/einstellungen`); await page.click('#st-ruhig'); if (!(await page.$('.chip.fire'))) fail('Ruhiger Modus: lässt sich nicht ausschalten');

/* ───────────── Einstellungen, Countdown, Farben ───────────── */
await page.goto(`${BASE}#/einstellungen`); await page.waitForSelector('#st-land');
if ((await page.getAttribute('#st-push-schalter', 'aria-checked')) !== 'false' || (await page.getAttribute('#st-push-schalter', 'role')) !== 'switch' || await page.locator('#st-push-zeile').isVisible()) fail('Erinnerung: Schalter fehlt oder steht nicht auf „aus“ (Uhrzeit darf erst sichtbar sein, wenn an)');
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
const kn = await page.evaluate(() => { const m = JSON.parse(localStorage.getItem('mathetrainer.v1')); for (const k of Object.values(m.kartei)) k.due = '2020-01-01'; localStorage.setItem('mathetrainer.v1', JSON.stringify(m)); return Object.keys(m.kartei).length; });
if (!kn) fail('Fehler-Kartei ist leer, obwohl Fehler gemacht wurden');
await page.goto(BASE); await page.reload(); await page.waitForSelector('a[href="#/wiederholen"]');
await page.click('a[href="#/wiederholen"]'); await page.waitForSelector('#stage > *');
await quiz('#kt-done');
await page.goto(`${BASE}#/bericht`); await torFalls(page, 3000); await page.waitForSelector('.rep-grid'); await shot('42-bericht');
const rep = await page.textContent('.report');
if (!rep.includes('Bericht für Eltern') || !rep.includes('Abi-Modus') || !rep.includes('Hier hakt es noch')) fail('Bericht unvollständig');
await page.goto(`${BASE}#/erfolge`); await page.waitForSelector('.badges'); await shot('49-erfolge');
const got = await page.locator('.badge.on').count();
if (!(got >= 12 && got < BADGES.length)) fail(`Abzeichen unplausibel: ${got} von ${BADGES.length}`);
for (const id of ['start', 'einheit1', 'alles', 'boss1', 'boss10', 'bossPerfekt', 'blitz10', 'tag1', 'kombo5']) {
  if (!(await page.evaluate((k) => !!JSON.parse(localStorage.getItem('mathetrainer.v1')).badges[k], id))) fail(`Abzeichen „${id}" fehlt`);
}
if (!kombo && LEVEL >= 3) fail('Kombo-Anzeige in den Aufgaben-Runden nie gesehen');   // auf leichter Stufe rät der Test und trifft selten zweimal in Folge
await page.goto(`${BASE}#/formeln`); await page.waitForSelector('.fcard'); await shot('50-formeln');
if (await page.locator('.fcard.locked').count()) fail('Formelkarten sind trotz abgeschlossener Einheiten gesperrt');
if (await page.locator('.katex-error').count()) fail('Eine Formel lässt sich nicht darstellen');
// Wochen-Ziel: fünf Tage → Truhe genau einmal
await page.evaluate(() => { const m = JSON.parse(localStorage.getItem('mathetrainer.v1')); const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); const key = (x) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; const days = []; for (let i = 0; i < 5; i++) { const x = new Date(d); x.setDate(d.getDate() + i); days.push(key(x)); } m.week = { key: key(d), days, claimed: false }; localStorage.setItem('mathetrainer.v1', JSON.stringify(m)); });
await page.goto(BASE); await page.reload(); await page.waitForSelector('#wk-claim'); await shot('51-wochenziel');
const xpBefore = +(await page.textContent('.chip.xp'));
await page.click('#wk-claim'); await page.waitForSelector('#wk-claim', { state: 'detached' });
if (+(await page.textContent('.chip.xp')) !== xpBefore + 50) fail('Truhe gibt nicht 50 Punkte');
// Klassen-Rangliste wird angeboten; ohne Klasse hat die App bis hierher nichts an /api geschickt (außer Meldungen)
await page.goto(`${BASE}#/pruefung`); await page.waitForSelector('a[href="#/blitz"]');
if (!(await page.locator('a[href="#/klasse"]').count())) fail('Klassen-Rangliste wird nicht angeboten');
{ // /api/status trägt keine Daten (reine Abfrage „Testseite? KI bereit?“) und darf erst kommen, wenn jemand an einer Aufgabe hängt – höchstens einmal je Seitenaufruf.
  const sonst = apiCalls.filter((u) => u !== '/api/status');
  if (await page.evaluate(() => { const el = document.querySelector('#st-pro'); return !!el && !el.hidden; })) fail('Pro: Code-Feld darf ohne „premium“ vom Server nicht erscheinen');
  if (sonst.length) fail(`Unerwartete Anfragen an den Server ohne Klasse: ${sonst.join(', ')}`); }

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
let kiAufgaben = 0;
const KI_AUFGABE = { id: 'a1', art: 'ableitung', thema: 'Kettenregel', stufe: 3, frage: 'Welche Ableitung ist richtig?', formel: 'f(x)=(2x+1)^3', funktion: '(2*x+1)^3',
  antworten: [{ tex: '6(2x+1)^2', ausdruck: '6*(2*x+1)^2', richtig: true }, { tex: '3(2x+1)^2', ausdruck: '3*(2*x+1)^2', fehler: 'Die innere Ableitung 2 fehlt.' }, { tex: '6(2x+1)^3', ausdruck: '6*(2*x+1)^3', fehler: 'Der Exponent muss um 1 kleiner werden.' }, { tex: '2(2x+1)^2', ausdruck: '2*(2*x+1)^2', fehler: 'Der alte Exponent fehlt als Faktor.' }],
  tipps: ['Hier steckt eine Funktion in einer anderen.', 'Äußere Ableitung mal innere Ableitung.'], erklaerung: 'Kettenregel: 3·(2x+1)²·2 = 6(2x+1)².' };
const ctx2 = await browser.newContext({ ...devices['Pixel 7'], serviceWorkers: 'block' });
const p2 = await ctx2.newPage();
p2.on('pageerror', (e) => errors.push(`Klasse: ${e}`));
const calls = [];
await ctx2.route('**/js/config.js', async (route) => { const r = await route.fetch(); await route.fulfill({ response: r, body: (await r.text()).replace("api: ''", "api: '/api'").replace("ki: 'test'", 'ki: true') }); });
let kiRufe = 0;
await ctx2.route('**/api/**', async (route) => {
  const u = new URL(route.request().url()), body = route.request().postDataJSON?.() ?? null; calls.push([u.pathname, body]);
  if (u.pathname === '/api/klasse/beitreten') return route.fulfill({ json: body.code === 'K7M2QX' ? { klasse: 'Q12 Mathe', spieler: 'p-123' } : { error: 'Diesen Code gibt es nicht.' }, status: body.code === 'K7M2QX' ? 200 : 404 });
  if (u.pathname === '/api/status') return route.fulfill({ json: { ok: true, stufe: 'test', ki: true, premium: true, kiArten: ['erklaer', 'frage', 'rechenweg', 'aufgabe', 'auswertung'] } });
  if (u.pathname === '/api/ki/aufgabe/abgelehnt') return route.fulfill({ json: { ok: true, zurueck: true } });
  if (u.pathname === '/api/ki/aufgabe') { kiAufgaben++; return kiAufgaben === 1 ? route.fulfill({ status: 202, json: { bereit: false, text: 'Vorrat wird gefüllt.' } }) : kiAufgaben === 2 ? route.fulfill({ json: { rest: 12, aufgabe: KI_AUFGABE } }) : route.fulfill({ json: { rest: 11, aufgabe: { ...KI_AUFGABE, antworten: KI_AUFGABE.antworten.map((a) => ({ ...a, richtig: true })) } } }); }
  if (u.pathname === '/api/ki/auswertung') return route.fulfill({ json: { text: 'Kettenregel sitzt.\nÜbe noch Baumdiagramme.', rest: 10 } });
  if (u.pathname === '/api/ki/rechenweg') return body.zugang ? route.fulfill({ json: { text: 'In Zeile 3 fehlt die innere Ableitung.', zeile: 3, rest: 9 } }) : route.fulfill({ status: 402, json: { grund: 'pro', error: 'nur Pro + KI' } });
  if (u.pathname === '/api/ki/frage') return body.zugang ? route.fulfill({ json: { text: 'Denk an die innere Ableitung.\nWas ist sie hier?', rest: 13 } }) : route.fulfill({ status: 402, json: { grund: 'pro', error: 'nur Pro + KI' } });
  if (u.pathname === '/api/zugang') return body.code === 'MT-AB12-CD34-EF56' ? route.fulfill({ json: { art: 'tage30', bis: '2099-12-31' } }) : route.fulfill({ status: 404, json: { error: 'unbekannt' } });
  if (u.pathname === '/api/ki/erklaer') { kiRufe++; return kiRufe === 1 ? route.fulfill({ json: { text: 'Stell dir vor: <b>fett</b> erst außen,\ndann innen.', rest: 2, art: 'probe' } }) : kiRufe === 2 ? route.fulfill({ status: 402, json: { grund: 'probe', error: 'Proben verbraucht' } }) : route.fulfill({ status: 429, json: { error: 'Limit' } }); }
  if (u.pathname === '/api/push/schluessel') return route.fulfill({ json: { key: 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U' } });
  if (u.pathname === '/api/klasse') return route.fulfill({ json: body.name?.length >= 2 ? { code: 'K7M2QX' } : { error: 'Name fehlt.' } });
  if (u.pathname.endsWith('/rangliste')) return route.fulfill({ json: { woche: '2026-11-09', liste: [{ name: 'Mia', punkte: 540 }, { name: 'Testfuchs', punkte: 480, ich: true }, { name: '<b>Frech</b>', punkte: 10 }] } });
  return route.fulfill({ json: { ok: true } });
});
await p2.goto(`${BASE}#/pruefung`); await p2.waitForSelector('a[href="#/klasse"]'); await p2.click('a[href="#/klasse"]'); await torFalls(p2, 3000); await p2.waitForSelector('#kl-code');
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
// „Erklär's mir anders“ (KI eingeschaltet, Server nachgestellt): erscheint erst nach Fehlversuchen, zeigt Text ohne HTML, meldet das Tageslimit
await p2.goto(`${BASE}#/aufgabe/stochastik`); await p2.waitForSelector('#stage .opt');   // stellt immer Auswahl-Aufgaben
for (let g = 0; g < 8 && !(await p2.locator('.ki').count()); g++) {
  for (let i = 0; i < 4 && !(await p2.locator('.ki').count()) && !(await p2.locator('#q-next').isVisible()); i++) await p2.locator('.opt').nth(i).click();
  if (!(await p2.locator('.ki').count())) { await p2.click('#q-next'); if (await p2.locator('#sheet').isVisible()) { await p2.click('#sh-go'); await p2.waitForSelector('#stage .opt'); } }
}
if (!(await p2.locator('.ki').count())) fail('KI: „Erklär\'s mir anders“ erscheint nach Fehlversuchen nicht');
await p2.locator('.ki .pick').first().click(); await p2.waitForSelector('.ki-out .note.ok');
if (!(await p2.textContent('.ki-out')).includes('Stell dir vor') || await p2.locator('.ki-out b').count()) fail('KI: Erklärung muss als reiner Text erscheinen');
const kiAnfrage = calls.find(([path]) => path === '/api/ki/erklaer')[1];
if (Object.keys(kiAnfrage).sort().join() !== 'art,formel,frage,geraet,gewaehlt,richtig' || !/^[A-Za-z0-9_-]{16,64}$/.test(kiAnfrage.geraet)) fail(`KI: Anfrage enthält andere Felder: ${Object.keys(kiAnfrage)}`);
if (!/Noch 2 von 3 kostenlosen/.test(await p2.textContent('.ki-rest'))) fail('KI: Rest der kostenlosen Proben wird nicht angezeigt');
if (!(await p2.locator('.ki-frage').count())) fail('KI-Tutor: Feld für Rückfragen fehlt nach der Erklärung');
await p2.fill('#ki-text', 'Warum mal 2?'); await p2.click('.ki-frage button'); await p2.waitForFunction(() => /Pro \+ KI/.test(document.querySelector('.ki-out')?.textContent || ''));   // ohne Code: 402
{ const fr = calls.find(([path]) => path === '/api/ki/frage')[1];
  if (Object.keys(fr).sort().join() !== 'formel,frage,geraet,gewaehlt,richtig,text,verlauf' || fr.text !== 'Warum mal 2?' || !Array.isArray(fr.verlauf) || fr.verlauf.length !== 1 || fr.verlauf[0].wer !== 'ki') fail(`KI-Tutor: Anfrage hat andere Felder: ${JSON.stringify(Object.keys(fr))}`);
  if (!(await p2.locator('.ki-frage input').isDisabled())) fail('KI-Tutor: nach 402 muss das Feld gesperrt sein'); }
// Rechenweg-Prüfer: Hinweis zum Datenschutz steht da; Foto wird im Gerät zu JPEG verkleinert; ohne „Pro + KI“-Code 402
if (!(await p2.locator('.rw').count())) fail('Rechenweg-Prüfer: Feld fehlt, obwohl der Server die Art meldet');
await p2.click('.rw summary'); if (!/keinen Namen/.test(await p2.textContent('.rw'))) fail('Rechenweg-Prüfer: Hinweis vor der Aufnahme fehlt');
await p2.click('#rw-go'); if (!/Foto oder tippe/.test(await p2.textContent('.rw-out'))) fail('Rechenweg-Prüfer: ohne Foto und Text muss ein Hinweis kommen');
{ const png = await p2.evaluate(() => { const c = document.createElement('canvas'); c.width = 2400; c.height = 1200; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 2400, 1200); x.fillStyle = '#000'; x.font = '80px sans-serif'; x.fillText("f'(x) = 3(2x+1)^2", 80, 300); return c.toDataURL('image/png').split(',')[1]; });
  await p2.setInputFiles('.rw input[type=file]', { name: 'rechenweg.png', mimeType: 'image/png', buffer: Buffer.from(png, 'base64') });
  await p2.waitForFunction(() => /Foto gewählt/.test(document.querySelector('.rw-foto').textContent));
  await p2.click('#rw-go'); await p2.waitForFunction(() => /Pro \+ KI/.test(document.querySelector('.rw-out').textContent));
  const rw = calls.find(([path]) => path === '/api/ki/rechenweg')[1];
  if (Object.keys(rw).sort().join() !== 'bild,formel,frage,geraet,richtig' || !rw.bild.startsWith('data:image/jpeg;base64,') || rw.bild.length > 1400000) fail(`Rechenweg-Prüfer: Anfrage falsch (${Object.keys(rw)}; ${rw.bild?.slice(0, 30)}; ${rw.bild?.length})`);
  // Breite und Höhe direkt aus den JPEG-Daten lesen (Rahmen-Kennung FFC0/FFC2)
  const jb = Buffer.from(rw.bild.split(',')[1], 'base64'), mass = [0, 0];
  for (let i = 2; i < jb.length - 9;) { if (jb[i] !== 0xff) { i++; continue; } const m = jb[i + 1]; if (m === 0xc0 || m === 0xc2) { mass[1] = jb.readUInt16BE(i + 5); mass[0] = jb.readUInt16BE(i + 7); break; } i += 2 + jb.readUInt16BE(i + 2); }
  if (mass[0] !== 1600 || mass[1] !== 800) fail(`Rechenweg-Prüfer: Bild nicht auf 1600 px verkleinert (${mass})`); }
if ((await p2.evaluate(() => getComputedStyle(document.querySelector('.ki-out .note')).whiteSpace)) !== 'pre-line') fail('KI: Zeilenumbrüche der Erklärung gehen verloren');
if (shots) await p2.screenshot({ path: `${shots}/76-ki-erklaerung.png` });
await p2.locator('.ki .pick').nth(1).click(); await p2.waitForFunction(() => document.querySelector('.ki-out')?.textContent.includes('kostenlosen Erklärungen sind aufgebraucht'));   // 402: Proben verbraucht
if (!(await p2.locator('.ki-out a[href="#/einstellungen"]').count())) fail('Pro: Hinweis nach den Proben nennt das Code-Feld nicht');
// KI-Tutor: nach der ersten Erklärung gibt es ein Feld für Rückfragen; ohne „Pro + KI“-Code antwortet der Server mit 402
await p2.locator('.ki .pick').nth(2).click(); await p2.waitForFunction(() => document.querySelector('.ki-out')?.textContent.includes('KI-Guthaben für heute'));   // 429: Tagesguthaben
// KI-Aufgaben: Einstieg erscheint, weil der Server die Art meldet; erst „Vorrat leer“ (202), dann eine Aufgabe; eine falsch gebaute Aufgabe wird im Gerät abgelehnt
await p2.goto(`${BASE}#/pruefung`); await p2.waitForSelector('a[href="#/kiaufgabe"]'); await p2.click('a[href="#/kiaufgabe"]'); await p2.waitForSelector('#ka-go');
await p2.evaluate(() => { window.__mtWarte = 250; });   // im Test nicht 25 Sekunden auf den Vorrat warten
await p2.selectOption('#ka-thema', 'Kettenregel'); await p2.click('#ka-go'); await p2.waitForSelector('#stage .opt, #stage #q-in', { timeout: 15000 });
{ const an = calls.filter(([path]) => path === '/api/ki/aufgabe'); if (an.length !== 2 || Object.keys(an[0][1]).sort().join() !== 'geraet,stil,stufe,thema' || an[0][1].thema !== 'Kettenregel' || an[0][1].stil !== 'abi') fail(`KI-Aufgaben: Anfrage falsch oder kein zweiter Versuch nach „Vorrat leer“ (${an.length})`); }
if (!/Welche Ableitung/.test(await p2.textContent('#stage'))) fail('KI-Aufgaben: Aufgabe wird nicht gezeigt');
// Aufgaben-Runde im zweiten Fenster zu Ende klicken (Antworten der Reihe nach probieren)
const loese2 = async (endSel) => { for (let i = 0, k = 0; i < 80 && !(await p2.$(endSel)); i++) {
  if (await p2.locator('#q-next').isVisible().catch(() => false)) { await p2.click('#q-next'); k = 0; continue; }
  if (await p2.locator('#q-wahl').isVisible().catch(() => false)) { await p2.click('#q-wahl'); continue; }
  if (await p2.locator('#q-in').isVisible().catch(() => false)) { await p2.fill('#q-in', '987654'); await p2.click('.tipp .btn'); continue; }
  if (await p2.locator('#stage .opt').count()) { await p2.locator('#stage .opt').nth(k++ % 4).click().catch(() => {}); continue; }
  await p2.waitForTimeout(100); } };
await loese2('#ka-fertig');
await p2.waitForSelector('#ka-fertig'); if (!/12 KI-Punkte/.test(await p2.textContent('#ka-fertig'))) fail('KI-Aufgaben: Rest-Guthaben fehlt');
await p2.click('#ka-go'); await p2.waitForFunction(() => /nicht bestanden/.test(document.querySelector('#ka-note').textContent));
{ await p2.waitForTimeout(200); const ab = calls.filter(([path]) => path === '/api/ki/aufgabe/abgelehnt'); if (ab.length !== 1 || ab[0][1].id !== 'a1' || !ab[0][1].geraet) fail('KI-Aufgaben: abgelehnte Aufgabe wird dem Server nicht gemeldet'); }   // vier „richtige“ Antworten: im Gerät abgelehnt
// KI-Auswertung nach einem gelösten Blatt: geschickt werden nur Thema und richtig/falsch
await p2.goto(`${BASE}#/blatt/regeln_3_5_4242/los`); await p2.waitForSelector('#stage .opt, #stage #q-in'); await loese2('#b-ergebnis');
await p2.waitForSelector('#b-ki-go'); await p2.click('#b-ki-go'); await p2.waitForFunction(() => /Kettenregel sitzt/.test(document.querySelector('#b-ki-out')?.textContent || ''));
{ const aw = calls.find(([path]) => path === '/api/ki/auswertung')[1];
  if (Object.keys(aw).sort().join() !== 'ergebnis,geraet' || aw.ergebnis.length !== 5 || !aw.ergebnis.every((x) => Object.keys(x).sort().join() === 'richtig,thema' && typeof x.richtig === 'boolean' && x.thema)) fail(`KI-Auswertung: Anfrage enthält andere Felder: ${JSON.stringify(aw).slice(0, 200)}`);
  if (!/10 KI-Punkte/.test(await p2.textContent('#b-ki-out'))) fail('KI-Auswertung: Rest-Guthaben fehlt'); }
// Zugangscode: Feld erscheint, weil der Server „premium“ meldet; falsche Form und unbekannter Code werden erklärt, der richtige wird gespeichert
await p2.goto(`${BASE}#/einstellungen`); await einstellungenAuf(p2); await p2.waitForSelector('#st-pro:not([hidden])');
await p2.fill('#st-pro-code', 'abc'); await p2.click('#st-pro-go'); if (!/Form MT-/.test(await p2.textContent('#st-pro-note'))) fail('Pro: falsche Code-Form wird nicht erklärt');
await p2.fill('#st-pro-code', 'MT-ZZZZ-ZZZZ-ZZZZ'); await p2.click('#st-pro-go'); await p2.waitForFunction(() => /kennen wir nicht/.test(document.querySelector('#st-pro-note').textContent));
await p2.fill('#st-pro-code', ' mt ab12 cd34 ef56 '); await p2.click('#st-pro-go'); await p2.waitForFunction(() => /30-Tage-Pass/.test(document.querySelector('#st-pro-stand').textContent));
if (!/31\.12\.2099/.test(await p2.textContent('#st-pro-stand')) || !(await p2.locator('#st-pro-zeile').isHidden())) fail('Pro: eingelöster Zugang wird nicht richtig angezeigt');
// Stufe ist überall sichtbar: unter dem App-Namen, auf der Übersicht „Deine Stufe“ und als Marke an den Funktionen
if ((await p2.textContent('#stufe')) !== 'PRO + KI') fail(`Pro: Stufe steht nicht unter dem App-Namen (${await p2.textContent('#stufe')})`);
await p2.goto(`${BASE}#/pro`); await p2.waitForSelector('#pro-stufe');
if ((await p2.textContent('#pro-stufe')) !== 'Pro + KI' || !/gültig bis 31\.12\.2099/.test(await p2.textContent('.pro-stand')) || await p2.locator('.pro-zeile.zu').count() || (await p2.locator('.pro-zeile.offen').count()) < 12) fail('Pro: Übersicht zeigt Stufe, Gültigkeit oder freigeschaltete Funktionen falsch');
await p2.goto(`${BASE}#/theorie/regeln`); await p2.waitForSelector('#t-art .marke.an'); if (!(await p2.locator('#t-druck .marke.an').count())) fail('Pro: Marke am PDF-Knopf zeigt die Freischaltung nicht');
await p2.goto(`${BASE}#/einstellungen`); await einstellungenAuf(p2); await p2.waitForSelector('#st-pro:not([hidden])');
if ((await p2.evaluate(() => JSON.parse(localStorage.getItem('mathetrainer.v1')).zugang?.code)) !== 'MT-AB12-CD34-EF56') fail('Pro: Zugangscode nicht gespeichert');
await p2.reload(); await einstellungenAuf(p2); await p2.waitForSelector('#st-pro:not([hidden])'); if (!/30-Tage-Pass/.test(await p2.textContent('#st-pro-stand'))) fail('Pro: Zugang nach Neuladen vergessen');
await p2.evaluate(() => { const m = JSON.parse(localStorage.getItem('mathetrainer.v1')); m.zugang.bis = '9999-12-31'; localStorage.setItem('mathetrainer.v1', JSON.stringify(m)); }); await p2.reload(); await einstellungenAuf(p2); await p2.waitForSelector('#st-pro-weg');
if (!/unbefristet/.test(await p2.textContent('#st-pro-stand')) || /9999/.test(await p2.textContent('#st-pro-stand'))) fail('Pro: Zugang ohne Ablauf muss „unbefristet“ heißen');
await p2.click('#st-pro-weg'); if (await p2.evaluate(() => JSON.parse(localStorage.getItem('mathetrainer.v1')).zugang)) fail('Pro: Code lässt sich nicht entfernen');
// Erinnerung: freie Uhrzeit wird gesendet, ändern überschreibt, ausschalten meldet ab; gesperrte Erlaubnis wird erklärt.
// Der Testbrowser hat keinen Mitteilungs-Dienst – Erlaubnis und Anmeldung des Geräts sind deshalb nachgestellt.
for (const erlaubnis of ['granted', 'denied']) {
  const p3 = await ctx2.newPage(); p3.on('pageerror', (e) => errors.push(`Erinnerung: ${e}`));
  await p3.addInitScript((perm) => {
    const abo = { endpoint: 'https://fcm.googleapis.com/fcm/send/test', toJSON() { return { endpoint: this.endpoint, keys: { p256dh: 'p', auth: 'a' } }; }, unsubscribe: async () => { sessionStorage.removeItem('test-abo'); return true; } };
    // die Anmeldung übersteht das Neuladen – wie im echten Browser
    const reg = { waiting: null, installing: null, addEventListener() {}, pushManager: { getSubscription: async () => (sessionStorage.getItem('test-abo') ? abo : null), subscribe: async () => { sessionStorage.setItem('test-abo', '1'); return abo; } } };
    Object.defineProperty(navigator, 'serviceWorker', { value: { ready: Promise.resolve(reg), register: async () => reg, addEventListener() {}, controller: null } });
    window.PushManager = function PushManager() {};
    // die erteilte Erlaubnis übersteht das Neuladen – wie im echten Browser
    window.Notification = { permission: perm === 'denied' ? 'denied' : (sessionStorage.getItem('test-erlaubt') ? 'granted' : 'default'), requestPermission: async () => { if (perm === 'granted') sessionStorage.setItem('test-erlaubt', '1'); window.Notification.permission = perm; return perm; } };
  }, erlaubnis);
  await p3.goto(`${BASE}#/einstellungen`); await p3.waitForSelector('#st-push-schalter');
  const schalter = () => p3.getAttribute('#st-push-schalter', 'aria-checked');
  const zeiten = () => calls.filter(([path]) => path === '/api/push').map(([, body]) => body.zeit).join();
  if (erlaubnis === 'denied') {
    await p3.waitForSelector('#st-push-sperre');
    if ((await p3.locator('#st-push-sperre li').count()) < 3 || !(await p3.textContent('#st-push-sperre')).includes('Berechtigungen')) fail('Erinnerung: Schritt-für-Schritt-Anleitung bei gesperrten Mitteilungen fehlt');
    const vorher = zeiten();
    await p3.click('#st-push-schalter'); await p3.waitForTimeout(400);
    if ((await schalter()) !== 'false' || zeiten() !== vorher || !(await p3.locator('#st-push-sperre').count())) fail('Erinnerung: bei gesperrter Erlaubnis bleibt der Schalter aus und es wird nichts gesendet');
    if (await p3.locator('#st-push-schalter').isDisabled()) fail('Erinnerung: Schalter muss bedienbar bleiben');
    if (shots) { await p3.locator('#st-push').scrollIntoViewIfNeeded(); await p3.screenshot({ path: `${shots}/77-erinnerung-gesperrt.png` }); }
  } else {
    if (!(await p3.textContent('#st-push-install')).includes('als App installieren')) fail('Erinnerung: Hinweis „als App installieren“ fehlt');
    await p3.click('#st-push-schalter'); await p3.waitForFunction(() => document.querySelector('#st-push-schalter').getAttribute('aria-checked') === 'true');
    if (!(await p3.locator('#st-push-zeile').isVisible()) || !(await p3.textContent('#st-push-stand')).includes('18:00 Uhr (deutsche Zeit)')) fail('Erinnerung: nach dem Einschalten fehlen Uhrzeitfeld oder Anzeige');
    await p3.fill('#st-push-time', '17:35'); await p3.click('#st-push-an'); await p3.waitForFunction(() => document.querySelector('#st-push-stand').textContent.includes('17:35'));
    if (zeiten() !== '18:00,17:35') fail(`Erinnerung: freie Uhrzeit wird nicht richtig gesendet (${zeiten()})`);
    if (shots) { await p3.locator('#st-push').scrollIntoViewIfNeeded(); await p3.screenshot({ path: `${shots}/78-erinnerung-an.png` }); }
    await p3.reload(); await p3.waitForFunction(() => document.querySelector('#st-push-schalter')?.getAttribute('aria-checked') === 'true');
    if ((await p3.inputValue('#st-push-time')) !== '17:35') fail('Erinnerung: Uhrzeit nach Neuladen vergessen');
    // Der Browser hat die Anmeldung gelöscht (wie bei Marcels Test): Der Schalter muss das beim Öffnen merken und auf „aus“ stehen.
    await p3.evaluate(() => sessionStorage.removeItem('test-abo')); await p3.reload(); await p3.waitForSelector('#st-push-schalter'); await p3.waitForTimeout(500);
    if ((await schalter()) !== 'false' || (await p3.evaluate(() => JSON.parse(localStorage.getItem('mathetrainer.v1')).erinnern.an)) !== false) fail('Erinnerung: gelöschte Anmeldung wird nicht erkannt – der Schalter zeigt fälschlich „an“');
    await p3.click('#st-push-schalter'); await p3.waitForFunction(() => document.querySelector('#st-push-schalter').getAttribute('aria-checked') === 'true');
    if (zeiten() !== '18:00,17:35,17:35') fail(`Erinnerung: erneutes Einschalten meldet nicht mit der gemerkten Uhrzeit an (${zeiten()})`);
    await p3.click('#st-push-schalter'); await p3.waitForFunction(() => document.querySelector('#st-push-schalter').getAttribute('aria-checked') === 'false');
    if (!calls.some(([path, body]) => path === '/api/push/aus' && body.endpoint) || await p3.locator('#st-push-zeile').isVisible()) fail('Erinnerung: Ausschalten meldet nicht beim Server ab oder lässt die Uhrzeit stehen');
  }
  await p3.close();
}
p2.on('dialog', (d) => d.accept());
await p2.goto(`${BASE}#/klasse`); await torFalls(p2, 3000); await p2.waitForSelector('#kl-leave'); await p2.click('#kl-leave'); await p2.waitForSelector('#kl-code');
const raus = calls.find(([path]) => path === '/api/klasse/verlassen');
if (!raus || raus[1].code !== 'K7M2QX' || raus[1].spieler !== 'p-123') fail('Klasse verlassen wird dem Server nicht gemeldet');
if (await p2.evaluate(() => JSON.parse(localStorage.getItem('mathetrainer.v1')).klasse)) fail('Klasse verlassen: Eintrag bleibt im Gerät');
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
/* ───────────── Klasse 5 bis 10: Stufe wählen, jede Einheit jeder Klasse spielen, zurück zur Oberstufe ───────────── */
{ const { ALLE_UNITS } = await import('../app/js/units.js');
  const osFertig = await countDone();
  const zaehle = async () => { await page.goto(`${BASE}#/lernen`); await page.waitForSelector('a[href^="#/g/"]'); await page.reload(); await page.waitForSelector('a[href^="#/g/"]'); const hs = await page.evaluate(() => [...new Set([...document.querySelectorAll('#view a[href^="#/g/"]')].map((a) => a.getAttribute('href')))]); let n = 0; for (const hh of hs) { await page.goto(BASE + hh); await page.reload(); await page.waitForSelector('a.back[href="#/lernen"]'); await page.waitForSelector('a.unit[href^="#/u/"]'); n += await page.locator('a.unit.done[href^="#/u/"]').count(); } return n; };
  await page.goto(BASE); await page.waitForSelector('#home');
  if (!(await page.locator('#jg-frage').isVisible())) fail('Klassenstufe: Wer noch nichts gewählt hat, wird auf der Startseite nicht gefragt');
  for (const jg of ['5', '6', '7', '8', '9', '10']) {
    await page.goto(`${BASE}#/stufe`); await page.waitForSelector(`[data-jg="${jg}"]`); await page.click(`[data-jg="${jg}"]`); await page.waitForSelector('#home #jg-chip');
    if (!(await page.textContent('#jg-chip')).includes(`Klasse ${jg}`)) fail(`Klasse ${jg}: Stufe steht nicht auf der Startseite`);
    const start = await page.textContent('#home');
    if (/Analysis|Abi|Tages-Runde/.test(start)) fail(`Klasse ${jg}: Startseite zeigt Oberstufen-Inhalte`);
    if ((await page.textContent('#nav a[data-tab="pruefung"] span')) !== 'Testen') fail(`Klasse ${jg}: Menü heißt nicht „Testen“`);
    if (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth > 1)) fail(`Klasse ${jg}: Startseite zu breit`);
    if (jg === '5') await shot('84-klasse5-start');
    const us = ALLE_UNITS.filter((u) => u.jg === jg);
    if (us.length < 2) fail(`Klasse ${jg}: weniger als zwei Einheiten`);
    await page.goto(`${BASE}#/lernen`); await page.waitForSelector('a[href^="#/g/"]');
    if (/undefined/.test(await page.textContent('#view'))) fail(`Klasse ${jg}: „undefined“ auf der Lernen-Seite`);
    for (const u of us) for (let i = 0; i < u.steps.length; i++) {
      await page.goto(`${BASE}#/u/${u.id}/${i}`); await page.waitForSelector('#stage > *'); await page.evaluate(() => window.scrollTo(0, 0));
      let done = false;
      for (const [sel, fn] of HANDLERS) if (await page.locator(sel).count()) { await fn(); done = true; break; }
      if (!done) { if (first(`quiz-klasse${jg}`)) await shot(`85-aufgabe-klasse${jg}`); await quiz(); }
      await page.waitForSelector('#sheet:not([hidden])'); await sheetNext();
    }
    { const fertig = await zaehle(); if (fertig !== us.length) fail(`Klasse ${jg}: ${fertig} von ${us.length} Einheiten als fertig markiert – offen: ${await page.evaluate(async () => { const { store } = await import('./js/store.js'); const U = await import('./js/units.js'); return U.UNITS.flatMap((u) => u.steps.filter((st) => !store.isDone(u.id, st.id)).map((st) => `${u.id}/${st.id}`)).join(', ') || 'keine'; })}`); }
    await page.goto(`${BASE}#/theorie`); await page.waitForSelector('a[href^="#/theorie/"]');
    if ((await page.locator('a[href^="#/theorie/"]').count()) !== us.length) fail(`Klasse ${jg}: Theorie zeigt nicht genau die Einheiten der Klasse`);
    await page.goto(`${BASE}#/pruefung`); await page.waitForSelector('a[href="#/blatt"]');
    if (/Abi-Modus|Duell|Blitz/.test(await page.textContent('#view'))) fail(`Klasse ${jg}: „Testen“ zeigt Oberstufen-Runden`);
    await page.goto(`${BASE}#/blatt`); await page.waitForSelector('#view .card');
    if (/Analysis|Probeklausur/.test(await page.textContent('#view'))) fail(`Klasse ${jg}: Arbeitsblatt zeigt Oberstufen-Gebiete`);
    if (jg === '5') { await page.goto(`${BASE}#/einstellungen`); await page.waitForSelector('#st-jg');
      if (await page.locator('#st-land').isVisible()) fail('Klasse 5: Bundesland und Kurs dürfen nicht erscheinen');
      if (!(await page.textContent('#st-jg')).includes('Klasse 5')) fail('Klasse 5: Einstellungen nennen die Stufe nicht'); }
  }
  await page.goto(`${BASE}#/stufe`); await page.waitForSelector('[data-jg="os"]'); await shot('86-stufe');
  await page.click('[data-jg="os"]'); await page.waitForSelector('#home');
  if (!/Analysis/.test(await page.textContent('#home')) || (await page.textContent('#nav a[data-tab="pruefung"] span')) !== 'Prüfung') fail('Zurück zur Oberstufe: Startseite oder Menü stimmt nicht');
  if ((await countDone()) !== osFertig) fail('Zurück zur Oberstufe: Fortschritt der Oberstufe ist nicht mehr da');
}

/* ───────────── Einstellungen: Schriftgröße und „Über diese App“ ───────────── */
{ await page.goto(`${BASE}#/einstellungen`); await page.waitForSelector('#st-schrift');
  const gr = () => page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('#st-info dd')).fontSize));
  const normal = await gr();
  await page.click('#st-schrift [data-s="klein"]'); const klein = await gr();
  await page.click('#st-schrift [data-s="gross"]'); const gross = await gr();
  if (!(klein < normal - 1 && gross > normal + 1)) fail(`Schrift: Größe ändert sich nicht (${klein} / ${normal} / ${gross})`);
  if (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth > 1)) fail('Schrift groß: Einstellungen zu breit');
  await shot('83-schrift-gross');
  await page.goto(BASE); await page.waitForSelector('#home');
  if (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth > 1)) fail('Schrift groß: Startseite zu breit');
  await page.reload(); await page.waitForSelector('#home');
  if ((await page.evaluate(() => document.documentElement.dataset.schrift)) !== 'gross') fail('Schrift: Auswahl wird nach dem Neuladen nicht angewendet');
  await page.goto(`${BASE}#/einstellungen`); await page.waitForSelector('#st-schrift'); await page.click('#st-schrift [data-s="normal"]');
  if ((await gr()) !== normal) fail('Schrift: „Normal“ stellt die Größe nicht wieder her');
  const info = await page.textContent('#st-info');
  if (!/\d+\.\d+\.\d+/.test(info) || !/\d{2}\.\d{2}\.\d{4}/.test(info)) fail('Einstellungen: Version und Datum fehlen'); }

/* ───────────── Android-App: Hinweis, wenn sie sich neue Inhalte geholt hat ───────────── */
{ const ac = await browser.newContext({ ...devices['Pixel 7'], serviceWorkers: 'block' }); const ap = await ac.newPage();
  ap.on('pageerror', (e) => errors.push(`App-Hülle: ${e.message}`));
  await ap.addInitScript(() => { window.__st = { kanal: 'test', inhalt: '', bereit: '', huelle: false }; window.__widget = []; window.MTApp = { version: () => '0.22.0', widgetStand: (...a) => { window.__widget.push(a); }, updateStand: () => JSON.stringify(window.__st), updateAnwenden: () => { window.__los = true; }, updateSuchen: () => { window.__gesucht = (window.__gesucht || 0) + 1; setTimeout(() => window.dispatchEvent(new CustomEvent('mt-update-fertig', { detail: 'ok' })), 50); } }; });
  await ap.goto(BASE); await ap.waitForSelector('#home');
  if (await ap.locator('#upd').isVisible()) fail('Update: Hinweis ohne Neuigkeit sichtbar');
  { const w = await ap.evaluate(() => window.__widget.at(-1)); if (!w || w[0] !== 'os' || typeof w[1] !== 'string' || w[1].length < 3 || !/^#\/u\/[\w-]+\/\d+$/.test(w[2]) || !Number.isInteger(w[3])) fail(`Widget: Stand wird der App-Hülle nicht gemeldet (${JSON.stringify(w)})`); }
  if (!/hält sich selbst aktuell/.test(await ap.textContent('#ver'))) fail('Update: Fußzeile nennt die Selbst-Aktualisierung nicht');
  await ap.evaluate(() => { window.__st.bereit = '9.8.7'; window.__st.huelle = true; window.dispatchEvent(new Event('mt-update')); });
  await ap.waitForSelector('#upd-los');
  if (!/9\.8\.7/.test(await ap.textContent('#upd'))) fail('Update: neue Version wird nicht genannt');
  if (await ap.evaluate(() => document.documentElement.scrollWidth - innerWidth > 1)) fail('Update: Hinweis macht die Seite zu breit');
  if (shots) await ap.screenshot({ path: `${shots}/82-update.png` });
  if (!(await ap.locator('#upd-apk').isVisible())) fail('Update: Hinweis auf neue App-Datei fehlt');
  // Neue App-Hülle mit Knopf „Jetzt aktualisieren“ (Marcel 18.11.2026): laden, Fortschritt, Android fragt „Installieren?“
  await ap.evaluate(() => { window.__apk = 0; window.MTApp.apkLaden = () => { window.__apk++; return 'ok'; }; window.dispatchEvent(new Event('mt-update')); });
  await ap.waitForSelector('#upd-apk-los');
  await ap.click('#upd-apk-los');
  if ((await ap.evaluate(() => window.__apk)) !== 1 || !(await ap.locator('#upd-apk-los').isDisabled())) fail('Update: Knopf „Jetzt aktualisieren“ ruft die App-Hülle nicht');
  await ap.evaluate(() => window.dispatchEvent(new CustomEvent('mt-apk', { detail: { stand: 'laedt', prozent: 40 } })));
  if (!/40 %/.test(await ap.textContent('#upd-apk-stand'))) fail('Update: Ladefortschritt der App-Datei fehlt');
  await ap.evaluate(() => window.dispatchEvent(new CustomEvent('mt-apk', { detail: { stand: 'frage', prozent: 100 } })));
  if (!/Installieren/.test(await ap.textContent('#upd-apk-stand'))) fail('Update: Hinweis auf die Android-Rückfrage fehlt');
  await ap.evaluate(() => window.dispatchEvent(new CustomEvent('mt-apk', { detail: { stand: 'abgebrochen', prozent: 0 } })));
  if (await ap.locator('#upd-apk-los').isDisabled()) fail('Update: nach Abbruch lässt sich nicht noch einmal tippen');
  if (await ap.evaluate(() => { const b = document.querySelector('#upd-apk-los'); return b.getBoundingClientRect().height > 2.2 * parseFloat(getComputedStyle(b).lineHeight) || document.documentElement.scrollWidth - innerWidth > 1; })) fail('Update: Knopf „Jetzt aktualisieren“ bricht um oder macht die Seite zu breit');
  if (shots) await ap.screenshot({ path: `${shots}/82b-update-apk.png` });
  await ap.evaluate(() => { delete window.MTApp.apkLaden; });
  await ap.click('#upd-los');
  if (!(await ap.evaluate(() => window.__los === true))) fail('Update: Knopf ruft die App-Hülle nicht');
  await ap.goto(`${BASE}#/einstellungen`); await ap.waitForSelector('#st-info');
  if (!/App-Datei/.test(await ap.textContent('#st-info')) || !/9\.8\.7 ist geladen/.test(await ap.textContent('#st-info'))) fail('Einstellungen (App): App-Datei und Aktualisierung fehlen');
  await ap.click('#st-update'); await ap.waitForFunction(() => /9\.8\.7 ist geladen/.test(document.querySelector('#st-update-note').textContent));
  if ((await ap.evaluate(() => window.__gesucht)) !== 1) fail('Update suchen: Knopf ruft die App-Hülle nicht');
  await ap.evaluate(() => { window.__st.bereit = ''; window.__st.huelle = false; }); await ap.click('#st-update'); await ap.waitForFunction(() => document.querySelector('#st-update-note').textContent === 'Alles aktuell.' && !document.querySelector('#st-update').disabled);
  if (shots) { await ap.locator('#st-update').scrollIntoViewIfNeeded(); await ap.screenshot({ path: `${shots}/83-update-suchen.png` }); }
  await ap.evaluate(() => { window.__st.bereit = '9.8.7'; window.__st.huelle = true; window.dispatchEvent(new Event('mt-update')); });
  await ap.goto(`${BASE}#/lernen`); await ap.waitForTimeout(200);
  if (!(await ap.locator('#upd').isVisible())) fail('Update: Hinweis verschwindet beim Seitenwechsel');
  await ac.close();
}
/* ───────────── „App installieren“ (nur Web-App, Marcel 18.11.2026) ───────────── */
{ // Android/Chrome: Installations-Angebot → Karte auf Start und in den Einstellungen, Tippen ruft das Angebot auf
  const ic = await browser.newContext({ ...devices['Pixel 7'] }); const ip = await ic.newPage();
  ip.on('pageerror', (e) => errors.push(`Installieren: ${e.message}`));
  await ip.goto(BASE); await ip.waitForSelector('#home');
  if (await ip.locator('#install-start').count()) fail('Installieren: Karte ohne Angebot des Browsers');
  await ip.evaluate(() => { const ev = new Event('beforeinstallprompt', { cancelable: true }); ev.prompt = () => { window.__gefragt = (window.__gefragt || 0) + 1; }; ev.userChoice = Promise.resolve({ outcome: 'accepted' }); window.dispatchEvent(ev); });
  await ip.waitForSelector('#install-start #install-los');
  if (await ip.evaluate(() => { const b = document.querySelector('#install-los'); return b.getBoundingClientRect().height > 2.2 * parseFloat(getComputedStyle(b).lineHeight) || document.documentElement.scrollWidth - innerWidth > 1; })) fail('Installieren: Knopf bricht um oder macht die Seite zu breit');
  if (shots) await ip.screenshot({ path: `${shots}/84b-installieren.png` });
  await ip.goto(`${BASE}#/einstellungen`); await ip.waitForSelector('#install-einstellungen #install-los');
  await ip.click('#install-einstellungen #install-los'); await ip.waitForTimeout(200);
  if ((await ip.evaluate(() => window.__gefragt)) !== 1 || await ip.locator('#install-einstellungen').count()) fail('Installieren: Tippen ruft das Angebot des Browsers nicht auf');
  await ic.close();
  // iPhone: Anleitung „Teilen → Zum Home-Bildschirm“
  const ioc = await browser.newContext({ ...devices['iPhone 13'] }); const iop = await ioc.newPage();
  await iop.goto(BASE); await iop.waitForSelector('#home');
  if (!/Zum Home-Bildschirm/.test(await iop.textContent('#install-start').catch(() => ''))) fail('Installieren: iPhone ohne Anleitung');
  if (shots) await iop.screenshot({ path: `${shots}/84c-installieren-iphone.png` });
  // schon installiert (eigenes Fenster): keine Karte
  await iop.addInitScript(() => { Object.defineProperty(navigator, 'standalone', { get: () => true }); });
  await iop.goto(BASE); await iop.reload(); await iop.waitForSelector('#home');
  if (await iop.locator('#install-start').count()) fail('Installieren: Karte, obwohl die App schon installiert ist');
  await ioc.close();
}
// Start-Wache: Lädt das Programm nicht, gibt es einen Neu-Lade-Versuch und danach einen Hinweis mit Knopf – nie eine leere Seite
{ const wc = await browser.newContext({ ...devices['Pixel 7'], serviceWorkers: 'block' }); const wp = await wc.newPage();
  await wc.addInitScript(() => { window.__mtWacheMs = 1500; });
  let abrufe = 0, sperre = true; await wc.route('**/b/app.js', (r) => { abrufe++; return sperre ? r.abort() : r.continue(); });
  await wp.goto(BASE); await wp.waitForSelector('#wache-neu', { timeout: 15000 });
  if (abrufe < 2) fail('Start-Wache: kein eigener Neu-Lade-Versuch vor dem Hinweis');
  if (shots) await wp.screenshot({ path: `${shots}/88-start-wache.png` });
  sperre = false; await wp.click('#wache-neu'); await wp.waitForSelector('#home');
  if (!(await wp.evaluate(() => window.__mtBereit === true && sessionStorage.getItem('mathetrainer.wache') === null))) fail('Start-Wache: nach geglücktem Start nicht zurückgesetzt');
  await wp.waitForTimeout(2500); if (await wp.locator('#wache').count()) fail('Start-Wache: Hinweis erscheint, obwohl die App läuft');
  await wc.close();
}
// Paket 0.41.0: Formel-Dungeon – Gleichungen und Formeln Schritt für Schritt umstellen
{ const dc = await browser.newContext({ viewport: { width: 320, height: 640 }, serviceWorkers: 'block' }); const dp = await dc.newPage();
  dp.on('pageerror', (e) => errors.push(`Dungeon: ${e}`));
  await dc.addInitScript(() => { window.__mtTest = true; });
  const breit = async (wo) => { if (await dp.evaluate(() => document.documentElement.scrollWidth - innerWidth > 1)) fail(`Dungeon ${wo}: Seite ist zu breit`); };
  await dp.goto(BASE); await dp.evaluate(() => localStorage.setItem('mathetrainer.v1', JSON.stringify({ jahrgang: '5', xp: 10 })));
  await dp.goto(`${BASE}#/pruefung`); await dp.reload(); await dp.waitForSelector('a[href="#/dungeon"]'); await dp.click('a[href="#/dungeon"]'); await dp.waitForSelector('#dg-stock');
  if ((await dp.locator('.dg-wahl:not([disabled])').count()) !== 1) fail('Dungeon: Klasse 5 soll nur Stockwerk 1 offen haben');
  await dp.click('#dg-spick summary'); await breit('Start'); if (shots) await dp.screenshot({ path: `${shots}/90-dungeon-start.png` });
  await dp.click('.dg-wahl[data-s="1"]');
  let falsch = false, falleGesehen = false, waechter = false;
  for (let k = 0; k < 40; k++) {
    if (await dp.locator('#dg-tiefer').count()) break;
    if (await dp.locator('#dg-weiter').count()) { await dp.click('#dg-weiter'); continue; }
    if (await dp.locator('.dg-fz[data-f]').count()) { falleGesehen = true; if (shots) await dp.screenshot({ path: `${shots}/91-dungeon-falle.png` }); await dp.click('.dg-fz[data-f="1"]'); await dp.waitForSelector('#dg-weiter'); continue; }
    if (await dp.locator('.dg-opt').count()) {
      if (await dp.locator('#dg-face').count()) waechter = true;
      if (!falsch) { falsch = true; await dp.click('.dg-opt[data-ok="0"] >> nth=0'); await dp.waitForSelector('#dg-note .note.bad'); if (shots) await dp.screenshot({ path: `${shots}/92-dungeon-fehler.png` });
        if ((await dp.locator('.ab-leben .on').count()) !== 2) fail('Dungeon: Ein falscher Schritt soll ein Leben kosten'); }
      await breit('Raum'); await dp.click('.dg-opt[data-ok="1"]'); continue;
    }
    await dp.waitForTimeout(80);
  }
  if (!falleGesehen || !waechter) fail(`Dungeon: Stockwerk 1 ohne ${falleGesehen ? 'Wächter' : 'Fallen-Raum'}`);
  if (!(await dp.locator('#dg-tiefer').count())) fail('Dungeon: Stockwerk 1 lässt sich nicht abschließen');
  if ((await dp.locator('.ab-leben .on').count()) !== 3) fail('Dungeon: Nach dem Wächter soll es ein Leben dazu geben');
  await dp.click('#dg-stop'); await dp.waitForSelector('#dg-ende');
  const st = await dp.evaluate(() => JSON.parse(localStorage.getItem('mathetrainer.v1')));
  if (!(st.count?.dungeonRekord > 0) || st.count?.dungeonTiefe !== 2) fail(`Dungeon: Rekord oder Stockwerk nicht gespeichert (${JSON.stringify(st.count)})`);
  await dp.click('#dg-again'); await dp.waitForSelector('#dg-stock');
  // Umstell-Blatt (Pro): acht Aufgaben, Lösungsblatt mit jedem Schritt
  await dp.click('.dg-blatt-stock .pick[data-s="2"]'); await dp.click('#dg-blatt'); await dp.waitForSelector('#blatt');
  if ((await dp.locator('#blatt .b-aufgabe').count()) !== 8 || (await dp.locator('#blatt .dg-b-weg').count()) !== 8) fail('Umstell-Blatt: nicht acht Aufgaben mit Lösungsweg');
  await breit('Umstell-Blatt'); if (shots) await dp.screenshot({ path: `${shots}/94-umstell-blatt.png`, fullPage: true });
  await dp.click('#dg-zurueck'); await dp.waitForSelector('#dg-stock');
  if ((await dp.locator('.dg-wahl:not([disabled])').count()) !== 2) fail('Dungeon: Nach Stockwerk 1 soll Stockwerk 2 offen sein');
  // Oberstufe: tiefste Stockwerke mit Formeln, schmaler Bildschirm
  await dp.evaluate(() => { const m = JSON.parse(localStorage.getItem('mathetrainer.v1')); m.jahrgang = 'os'; m.count.dungeonTiefe = 5; localStorage.setItem('mathetrainer.v1', JSON.stringify(m)); });
  await dp.reload(); await dp.waitForSelector('#dg-stock'); await dp.click('.dg-wahl[data-s="5"]');
  for (let k = 0; k < 14; k++) {
    if (await dp.locator('#dg-weiter').count()) { await breit('Stockwerk 5'); await dp.click('#dg-weiter'); continue; }
    if (await dp.locator('.dg-fz[data-f]').count()) { await dp.click('.dg-fz[data-f="1"]'); continue; }
    if (await dp.locator('.dg-opt').count()) { if (k === 3) { await dp.click('#dg-tipp'); await dp.waitForSelector('#dg-note .note.tip'); if (shots) await dp.screenshot({ path: `${shots}/93-dungeon-formel.png` }); } await breit('Stockwerk 5'); await dp.click('.dg-opt[data-ok="1"]'); continue; }
    await dp.waitForTimeout(80);
  }
  if (await dp.locator('.katex-error').count()) fail('Dungeon: Formel lässt sich nicht setzen');
  await dc.close();
}
// Paket 0.40.0: Aufgaben werden im Hintergrund nachgeladen – der Start wartet nicht darauf, Aufgaben-Seiten zeigen solange eine Warte-Karte
{ const lc = await browser.newContext({ ...devices['Pixel 7'], serviceWorkers: 'block' }); const lp = await lc.newPage();
  lp.on('pageerror', (e) => errors.push(`Nachladen: ${e}`));
  const html = await (await lc.request.get(BASE)).text(), fest = new Set([...html.matchAll(/b\/(teil-[A-Z0-9]+\.js)/g)].map((m) => m[1]));
  if (!fest.size) fail('Nachladen: keine fest eingebundenen Teile in der Startseite gefunden');
  let art = 'abbruch', spaet = 0; await lc.route('**/b/teil-*.js', (r) => { if (fest.has(r.request().url().split('/').pop())) return r.continue(); spaet++; return art === 'abbruch' ? r.abort() : r.continue(); });
  await lp.goto(BASE); await lp.waitForSelector('#home');
  if (!(await lp.evaluate(() => window.__mtBereit === true))) fail('Nachladen: Start meldet sich nicht bereit, obwohl nur die Aufgaben fehlen');
  if (!spaet) fail('Nachladen: Die Aufgaben-Teile werden nach dem Start nicht von selbst geholt');
  for (const h of ['#/lernen', '#/pruefung', '#/mehr']) { await lp.evaluate((x) => { location.hash = x; }, h); await lp.waitForTimeout(250); if (await lp.locator('#auf-lade').count()) fail(`Nachladen: ${h} wartet unnötig auf die Aufgaben`); }
  await lp.evaluate(() => { location.hash = '#/tag'; }); await lp.waitForSelector('#auf-neu', { timeout: 15000 });
  if (shots) await lp.screenshot({ path: `${shots}/89-aufgaben-laden.png` });
  art = 'frei'; await lp.click('#auf-neu'); await lp.waitForFunction(() => !document.querySelector('#auf-lade') && /Tages-Runde/.test(document.querySelector('#view')?.textContent || ''), null, { timeout: 20000 });
  if (await lp.locator('#auf-lade').count()) fail('Nachladen: Warte-Karte bleibt stehen, obwohl die Aufgaben da sind');
  await lc.close();
}
// Paket 0.30.0: Kopfrechen-Arena, Knobelaufgabe, Klassenarbeits-Trainer, Pi-Outfit, Zurücksetzen mit Auswahl
{ const kc = await browser.newContext({ ...devices['Pixel 7'], serviceWorkers: 'block' }); const kp = await kc.newPage();
  kp.on('pageerror', (e) => errors.push(`Paket 30: ${e}`)); kp.on('dialog', (d) => d.accept());
  await kc.addInitScript(() => { window.__mtTest = true; window.__mtKopfSek = 6; });
  const breit = async (wo) => { if (await kp.evaluate(() => document.documentElement.scrollWidth - innerWidth > 1)) fail(`${wo}: Seite ist zu breit`); };
  const tippe = async (box, zahl) => { for (const z of String(zahl)) await kp.click(`${box} [data-t="${z === '-' ? '±' : z}"]`); };
  await kp.goto(BASE); await kp.evaluate(() => { const done = {}; for (const s of ['waage', 'terme', 'term', 'klammer', 'gleichung', 'loesen', 'mix']) done[`k7-terme/${s}`] = 3; localStorage.setItem('mathetrainer.v1', JSON.stringify({ jahrgang: '7', done, xp: 100, stats: { Terme: { ok: 3, bad: 2 } }, runs: [{ kind: 'blitz', score: 5 }] })); });
  await kp.goto(`${BASE}#/pruefung`); await kp.reload(); await kp.waitForSelector('a[href="#/kopf"]'); await kp.click('a[href="#/kopf"]'); await kp.waitForSelector('#kopf-arten');
  if ((await kp.locator('.kopf-art').count()) !== 6) fail('Kopfrechnen: Klasse 7 soll sechs Disziplinen sehen');
  await breit('Kopfrechen-Arena'); if (shots) await kp.screenshot({ path: `${shots}/84-kopfrechnen.png` });
  // Knobelaufgabe: erst falsch, dann richtig
  const kn = (await import('../app/js/kopf.js')).knobelFuer(await kp.evaluate(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }));
  if ((await kp.textContent('#knobel-text')) !== kn.text) fail('Knobelaufgabe: Text passt nicht zum Tag');
  await tippe('#knobel-tasten', kn.sol + 1); await kp.click('#knobel-go'); await kp.waitForSelector('#knobel-note .note.tip');
  await tippe('#knobel-tasten', kn.sol); await kp.click('#knobel-go'); await kp.waitForSelector('#knobel-ok');
  if ((await kp.evaluate(() => JSON.parse(localStorage.getItem('mathetrainer.v1')).xp)) !== 105) fail('Knobelaufgabe: Punkte nach zweitem Versuch stimmen nicht');
  // Eine Runde: zwei richtige, eine falsche, dann läuft die Zeit ab
  await kp.click(`.kopf-art[data-a="${LEVEL % 2 ? 'mal' : 'minus'}"]`); await kp.waitForSelector('#kopf-q');
  if (await kp.locator('#kopf-serie').isVisible()) fail('Kopfrechnen: Serie darf erst ab drei richtigen in Folge erscheinen');
  for (let k = 0; k < 2; k++) { const sol = await kp.getAttribute('#kopf-q', 'data-sol'), alt = await kp.textContent('#kopf-q'); await tippe('#kopf-tasten', sol); await kp.waitForFunction((t) => document.querySelector('#kopf-q')?.textContent !== t || !!document.querySelector('#kopf-end'), alt); if (await kp.locator('#kopf-end').count()) break; }
  if (await kp.locator('#kopf-q').count()) { const sol = +(await kp.getAttribute('#kopf-q', 'data-sol')); await tippe('#kopf-tasten', String(Math.abs(sol) + 1).padStart(String(Math.abs(sol)).length, '1')); if (shots) await kp.screenshot({ path: `${shots}/85-kopfrechnen-runde.png` }); }
  await kp.waitForSelector('#kopf-end', { timeout: 15000 });
  if (+(await kp.textContent('#kopf-end')) < 1) fail('Kopfrechnen: richtige Antworten werden nicht gezählt');
  if (!(await kp.evaluate((a) => JSON.parse(localStorage.getItem('mathetrainer.v1')).count[`kopf_${a}`] >= 1, LEVEL % 2 ? 'mal' : 'minus'))) fail('Kopfrechnen: Rekord wird nicht gespeichert');
  // Klassenarbeits-Trainer
  await kp.goto(`${BASE}#/arbeit`); await kp.waitForSelector('#ar-datum');
  await kp.click('#ar-los'); await kp.waitForSelector('#ar-note .note.tip');
  const termin = await kp.evaluate(() => { const d = new Date(); d.setDate(d.getDate() + 6); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; });
  await kp.fill('#ar-datum', termin); await kp.click('#ar-themen .check[data-u="k7-terme"]'); await kp.click('#ar-themen .check[data-u="k7-prozent"]'); await kp.click('#ar-los'); await kp.waitForSelector('#ar-heute');
  if ((await kp.textContent('#ar-count .big')) !== '6') fail('Klassenarbeit: Countdown stimmt nicht');
  if (!/^\d+ %$/.test(await kp.textContent('#ar-proz')) || (await kp.textContent('#ar-proz')) === '0 %') fail('Klassenarbeit: Fortschritt zählt Erledigtes nicht');
  if (!(await kp.locator('#ar-heute a.card').count())) fail('Klassenarbeit: kein Schritt für heute');
  await breit('Klassenarbeits-Trainer'); if (shots) await kp.screenshot({ path: `${shots}/86-klassenarbeit.png`, fullPage: true });
  await kp.click('#ar-mix'); await kp.waitForSelector('#stage .opt, #stage input'); await kp.click('#ar-x'); await kp.waitForSelector('#ar-neu');
  await kp.goto(`${BASE}#/`); await kp.waitForSelector('#ar-start');
  if (!/6/.test(await kp.textContent('#ar-start .big'))) fail('Klassenarbeit: Karte auf der Startseite fehlt');
  // Oberstufen-Seiten sind in Klasse 5 bis 10 nicht erreichbar (alte Links, Lesezeichen): Umleitung auf „Testen“
  for (const alt of ['aufgabe', 'abi', 'blitz', 'karte', 'einstufung']) { await kp.goto(`${BASE}#/${alt}`); await kp.waitForFunction(() => location.hash === '#/pruefung'); await kp.waitForSelector('a[href="#/kopf"]'); }
  // Web-App: kein Knopf zum Aktualisieren – sie aktualisiert sich von selbst
  await kp.goto(`${BASE}#/einstellungen`); await kp.waitForSelector('#st-auto'); if (await kp.locator('#st-update').isVisible()) fail('Web-App: Knopf „Nach Update suchen“ soll nur in der Android-App erscheinen');
  // Pi anziehen: Kappe ist frei (21 Sterne), Krone nicht
  await kp.goto(`${BASE}#/einstellungen`); await kp.waitForSelector('#st-hut');
  if (!(await kp.locator('#st-hut [data-k="krone"]').isDisabled()) || (await kp.locator('#st-hut [data-k="kappe"]').isDisabled())) fail('Pi-Outfit: Freischaltung nach Sternen stimmt nicht');
  const vorher = await kp.innerHTML('#st-pi-bild'); await kp.click('#st-hut [data-k="kappe"]'); await kp.click('#st-brille [data-k="rund"]');
  if ((await kp.innerHTML('#st-pi-bild')) === vorher || (await kp.evaluate(() => JSON.parse(localStorage.getItem('mathetrainer.v1')).outfit.hut)) !== 'kappe') fail('Pi-Outfit: Auswahl wird nicht übernommen');
  if (shots) { await kp.locator('#st-pi-bild').scrollIntoViewIfNeeded(); await kp.screenshot({ path: `${shots}/87-pi-outfit.png` }); }
  // Zurücksetzen mit Auswahl
  await kp.click('#st-reset'); await kp.click('#st-reset-wahl [data-r="geuebt"]'); await kp.waitForSelector('#home');
  let m = await kp.evaluate(() => JSON.parse(localStorage.getItem('mathetrainer.v1')));
  if (Object.keys(m.stats).length || m.runs.length || Object.keys(m.done).length !== 7 || m.xp < 100) fail('Zurücksetzen „Nur das Geübte“: löscht zu viel oder zu wenig');
  await kp.goto(`${BASE}#/einstellungen`); await einstellungenAuf(kp); await kp.waitForSelector('#st-reset'); await kp.click('#st-reset'); await kp.click('#st-reset-wahl [data-r="klasse"]'); await kp.waitForSelector('#home');
  m = await kp.evaluate(() => JSON.parse(localStorage.getItem('mathetrainer.v1')));
  if (Object.keys(m.done).length || m.xp < 100 || m.outfit.hut !== 'kappe' || !m.arbeit) fail('Zurücksetzen „Nur diese Klasse“: Sterne der Stufe bleiben oder anderes geht verloren');
  await kp.goto(`${BASE}#/einstellungen`); await einstellungenAuf(kp); await kp.waitForSelector('#st-reset'); await kp.click('#st-reset'); await kp.click('#st-reset-wahl [data-r="alles"]'); await kp.waitForSelector('#home');
  m = await kp.evaluate(() => JSON.parse(localStorage.getItem('mathetrainer.v1')));
  if (m.xp !== 0 || m.arbeit || m.jahrgang !== '7') fail('Zurücksetzen „Alles“: Fortschritt bleibt oder Klassenstufe geht verloren');
  await kc.close();
}
await browser.close();
if (errors.length) { console.error('Konsolen-Fehler:\n' + errors.join('\n')); process.exit(1); }
console.log(`e2e: kompletter Durchlauf ohne Fehler (Stufe ${LEVEL}, ${xp} Punkte, ${UNITS.length} Einheiten mit Boss, Abi ${np} NP, Tages-Runde ${tagScore}, Blitz ${blitz}, ${got} Abzeichen, Duell, Kartei, Bericht, Formeln, Wochen-Ziel, Klasse mit nachgestelltem Server, offline ok)`);
