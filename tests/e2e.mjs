// Spielt die ganze App im Handy-Browser durch (Playwright). Aufruf: node tests/e2e.mjs [Bilder-Ordner]
// Erwartet die App unter http://localhost:8123 (npm start).
import { createRequire } from 'node:module';
const { chromium, devices } = createRequire(import.meta.url)('playwright');
globalThis.window = { katex: { renderToString: (s) => s } };
const { LEVELS: MB } = await import('../app/js/games/murmelbahn.js');
const { LEVELS: TG } = await import('../app/js/games/tangente.js');
const { ROUNDS: ZR } = await import('../app/js/games/zeichnen.js');
const { UNITS } = await import('../app/js/units.js').catch(() => ({ UNITS: null }));

const BASE = process.env.BASE || 'http://localhost:8123/';
const shots = process.argv[2];
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices['Pixel 7'], colorScheme: process.env.DARK ? 'dark' : 'light' });
const page = await ctx.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));
const shot = async (name) => { if (shots) await page.screenshot({ path: `${shots}/${name}.png` }); };
process.on('uncaughtException', async (e) => { console.error(String(e).split('\n')[0]); if (shots) await page.screenshot({ path: `${shots}/fehler.png` }).catch(() => {}); process.exit(1); });
const sheetNext = async () => { await page.waitForSelector('#sheet:not([hidden]) #sh-go'); await page.waitForTimeout(350); await page.click('#sh-go'); await page.waitForSelector('#sheet', { state: 'hidden' }); };
const px = async (sel, view, x, y) => {
  await page.locator(sel).scrollIntoViewIfNeeded();
  const b = await page.locator(sel).boundingBox();
  return [b.x + ((x - view.x0) / (view.x1 - view.x0)) * b.width, b.y + b.height - ((y - view.y0) / (view.y1 - view.y0)) * b.height];
};

async function info() {
  for (;;) {
    const sheet = await page.locator('#sheet').isVisible();
    if (sheet) break;
    await page.click('#i-next');
    await page.waitForTimeout(60);
  }
}
async function quiz() {
  for (;;) {
    if (await page.locator('#sheet').isVisible()) break;
    if (await page.locator('.gaprow').count()) {
      const rows = page.locator('.gaprow');
      const a = await rows.nth(0).locator('.pick').count(), b = await rows.nth(1).locator('.pick').count();
      search: for (let i = 0; i < a; i++) for (let j = 0; j < b; j++) {
        await rows.nth(0).locator('.pick').nth(i).click(); await rows.nth(1).locator('.pick').nth(j).click();
        await page.click('#q-body .btn');
        if (await page.locator('#q-next').isVisible()) break search;
      }
    } else {
      for (let i = 0; i < 4; i++) { if (await page.locator('#q-next').isVisible()) break; await page.locator('.opt').nth(i).click(); }
    }
    if (!(await page.locator('#q-next').isVisible())) throw new Error('Quiz: keine Antwort wurde als richtig erkannt');
    await page.click('#q-next');
    await page.waitForTimeout(60);
  }
}

// Start
await page.goto(BASE); await page.waitForSelector('.unit'); await shot('01-start');
const title = await page.textContent('h1');
if (!title.includes('Verstehen')) throw new Error('Startseite fehlt');

// Einheit 1: Murmelbahn
await page.click('.board .btn'); await page.waitForSelector('#mb-c');
// erst ein Fehlversuch (Startwerte), dann die Lösung
await page.click('#mb-go'); await page.waitForSelector('#mb-note .note', { timeout: 20000 });
if (!(await page.locator('#mb-note .note.tip, #mb-note .note.bad').count())) throw new Error('Murmelbahn: Startwerte dürfen nicht gewinnen');
await shot('02-murmelbahn-fehlversuch');
for (let i = 0; i < MB.length; i++) {
  for (const q of MB[i].params) await page.locator(`#mb-${q.k}`).evaluate((el, v) => { el.value = v; el.dispatchEvent(new Event('input')); }, MB[i].target[q.k]);
  await page.click('#mb-go');
  if (i === 3) { await page.waitForTimeout(700); await shot('03-murmelbahn-rollt'); }
  await page.waitForSelector('#mb-note .note.ok', { timeout: 25000 });
  if (i === 2) await shot('04-murmelbahn-gewonnen');
  await page.click('#mb-go');
}
await page.waitForSelector('#sheet:not([hidden])'); await shot('05-geschafft'); await sheetNext();
await page.waitForSelector('#i-next'); await shot('06-benennen'); await info(); await sheetNext();
await page.waitForSelector('.opt'); await shot('07-bruecke-graph');
await page.locator('.opt').first().click(); await page.waitForTimeout(200); if (await page.locator('#q-tip').isVisible()) await page.click('#q-tip'); await shot('08-bruecke-tipp');
await quiz(); await sheetNext();

// Einheit 2: Tangenten-Surfer
await page.waitForSelector('.unit'); await page.click('a[href="#/u/steigung"]'); await page.click('a[href="#/u/steigung/0"]');
await page.waitForSelector('#tg-c');
for (let li = 0; li < TG.length; li++) {
  const L = TG[li];
  for (let mi = 0; mi < L.missions.length; mi++) {
    const M = L.missions[mi];
    let targets = M.xs;
    if (M.type === 'slope') { for (let x = L.view.x0 + 0.2; x < L.view.x1; x += 0.005) if (Math.abs(L.d(x) - M.m) < 0.02) { targets = [x]; break; } }
    // erst über die ganze Kurve fahren (zeichnet die Spur)
    const [sx, sy] = await px('#tg-c', L.view, L.view.x0 + 0.3, 0);
    await page.mouse.move(sx, sy); await page.mouse.down();
    const [ex] = await px('#tg-c', L.view, L.view.x1 - 0.3, 0);
    if (mi === 0) await page.mouse.move(ex, sy, { steps: 60 });
    for (const t of targets) {
      const [tx] = await px('#tg-c', L.view, t, 0);
      await page.mouse.move(tx, sy, { steps: 12 }); await page.waitForTimeout(600);
    }
    await page.mouse.up();
    await page.waitForSelector('#tg-next:not([hidden])', { timeout: 5000 });
    if (li === 0 && mi === 0) await shot('09-surfer');
    if (li === 0 && mi === L.missions.length - 1) await shot('10-surfer-spur');
    await page.click('#tg-next button');
  }
}
await sheetNext(); await info(); await sheetNext();

// Graphen-Paare: durchprobieren
await page.waitForSelector('#p-f .pcard'); await page.waitForTimeout(200); await shot('11-paare');
for (let round = 0; round < 2; round++) {
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    const f = page.locator('#p-f .pcard').nth(i);
    if (await f.evaluate((n) => n.classList.contains('ok'))) break;
    const d = page.locator('#p-d .pcard').nth(j);
    if (await d.evaluate((n) => n.classList.contains('ok'))) continue;
    await f.click(); await d.click(); await page.waitForTimeout(380);
  }
  await page.waitForSelector('#p-next:not([hidden])');
  if (round === 0) await shot('12-paare-geloest');
  await page.click('#p-next button');
}
await sheetNext();

// Einheit 3: Ableitung zeichnen
await page.waitForSelector('.unit'); await page.click('a[href="#/u/zeichnen"]'); await page.click('a[href="#/u/zeichnen/0"]');
await page.waitForSelector('#z-d');
const V = { x0: -4, x1: 4, y0: -2.4, y1: 2.4 };
const clampY = (y) => Math.max(-2.3, Math.min(2.3, y));
async function sketch(fn) {
  let first = true;
  for (let x = -3.7; x <= 3.7; x += 0.1) { // nicht in der abgerundeten Ecke beginnen
    const [a, b] = await px('#z-d', V, x, clampY(fn(x)));
    await page.mouse.move(a, b); if (first) { await page.mouse.down(); first = false; }
  }
  await page.mouse.up();
}
for (let r = 0; r < ZR.length; r++) {
  if (r === 1) {
    // absichtlich falsch (gespiegelt) → Hinweis, dann neu
    await sketch((x) => -ZR[r].d(x)); await page.click('#z-check'); await page.waitForSelector('#z-note .note.tip'); await shot('13-zeichnen-falsch');
    await page.click('#z-check');
  }
  await sketch(ZR[r].d);
  if (r === 0) await shot('14-zeichnen-skizze');
  await page.click('#z-check'); await page.waitForSelector('#z-note .note.ok');
  if (r === 2) await shot('15-zeichnen-richtig');
  await page.click('#z-check');
}
await sheetNext(); await info(); await sheetNext();

// Einheit 4: Regeln
await page.waitForSelector('.unit'); await page.click('a[href="#/u/regeln"]'); await shot('16-einheit');
await page.click('a[href="#/u/regeln/0"]'); await page.waitForSelector('.gaprow'); await shot('17-luecke');
await quiz(); await sheetNext(); await info(); await sheetNext();
await page.waitForSelector('.opt'); await shot('18-kette'); await quiz(); await sheetNext(); await quiz();
await page.waitForSelector('#sheet:not([hidden])'); await shot('19-einheit-geschafft'); await sheetNext();

// Fortschritt gespeichert?
await page.waitForSelector('.unit'); await page.waitForTimeout(400); await shot('20-start-fertig');
const done = await page.locator('.unit.done').count();
if (done !== 4) throw new Error(`Erwartet 4 fertige Einheiten, gefunden ${done}`);
await page.reload(); await page.waitForSelector('.unit');
if ((await page.locator('.unit.done').count()) !== 4) throw new Error('Fortschritt nach Neuladen verloren');
const xp = +(await page.textContent('.chip.xp'));
if (!(xp > 100)) throw new Error(`Punkte unplausibel: ${xp}`);

// Offline: Service Worker aktiv → ohne Netz neu laden
const sw = await page.evaluate(async () => { const r = await navigator.serviceWorker?.ready; return !!r?.active; });
if (!sw) throw new Error('Service Worker nicht aktiv');
await ctx.setOffline(true); await page.reload(); await page.waitForSelector('.unit');
await page.click('a[href="#/u/formen"]'); await page.click('a[href="#/u/formen/0"]'); await page.waitForSelector('#mb-c');
await ctx.setOffline(false);

await browser.close();
if (errors.length) { console.error('Konsolen-Fehler:\n' + errors.join('\n')); process.exit(1); }
console.log(`e2e: kompletter Durchlauf ohne Fehler (${xp} Punkte, 4 Einheiten, offline ok)`);
