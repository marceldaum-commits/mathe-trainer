// Spielt die ganze App im Handy-Browser durch (Playwright). Aufruf: node tests/e2e.mjs [Bilder-Ordner]
// Erwartet die App unter http://localhost:8123 (npm start).
import { createRequire } from 'node:module';
const { chromium, devices } = createRequire(import.meta.url)('playwright');
globalThis.window = { katex: { renderToString: (s) => s } };
const { LEVELS: MB } = await import('../app/js/games/murmelbahn.js');
const { LEVELS: TG } = await import('../app/js/games/tangente.js');
const { ROUNDS: ZR } = await import('../app/js/games/zeichnen.js');
const { UNITS } = await import('../app/js/units.js');
const { LEVELS: FL } = await import('../app/js/games/flaeche.js');
const { MISSIONS: LB } = await import('../app/js/games/labor.js');
const { MISSIONS: LO } = await import('../app/js/games/lotse.js');
const { LEVELS: WK } = await import('../app/js/games/werkstatt.js');
const { MISSIONS: RM, lookAlong } = await import('../app/js/games/raum.js');
const LEVEL = +(process.env.LEVEL || 3);

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
// Menü: vier Einträge, Start ist kurz (keine Einheiten-Liste), Lernen führt über das Gebiet zur Einheit
if ((await page.locator('#nav a').count()) !== 4) throw new Error('Menüleiste fehlt');
if (await page.locator('#home a[href^="#/u/"]:not(.btn)').count()) throw new Error('Startseite listet wieder einzelne Einheiten auf');
const startHeight = await page.evaluate(() => document.documentElement.scrollHeight);
if (startHeight > 2200) throw new Error(`Startseite zu lang: ${startHeight}px`);
await page.click('#nav a[data-tab="lernen"]'); await page.waitForSelector('a[href="#/g/analysis"]'); await shot('01b-lernen');
if (!(await page.locator('#nav a[data-tab="lernen"].on').count())) throw new Error('Menü markiert „Lernen" nicht');
await page.click('a[href="#/g/stochastik"]'); await page.waitForSelector('a[href="#/u/s-labor"]'); await shot('01c-gebiet');
await page.click('a[href="#/u/s-labor"]'); await page.waitForSelector('.steps');
if (!(await page.textContent('.back')).includes('Stochastik')) throw new Error('Zurück-Link nennt das Gebiet nicht');
await page.click('.steps a'); await page.waitForSelector('#stage > *');
if (await page.locator('#nav').isVisible()) throw new Error('Menü muss beim Spielen ausgeblendet sein');
await page.click('.x'); await page.click('.back'); await page.click('.back'); await page.waitForSelector('#lv');
// Schwierigkeit einstellen und prüfen, dass sie gemerkt wird
await page.locator('#lv button').nth(LEVEL - 1).click();
if (!(await page.locator('#lv button').nth(LEVEL - 1).evaluate((n) => n.classList.contains('on')))) throw new Error('Schwierigkeit wurde nicht übernommen');
await page.reload(); await page.waitForSelector('.unit');
if (!(await page.locator('#lv button').nth(LEVEL - 1).evaluate((n) => n.classList.contains('on')))) throw new Error('Schwierigkeit nach Neuladen vergessen');
// Hell/Dunkel-Schalter: wechselt, bleibt nach Neuladen, Hintergrund ändert sich wirklich
const bgOf = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
const look0 = await page.getAttribute('html', 'data-look'), bg0 = await bgOf();
if (look0 !== (process.env.DARK ? 'dunkel' : 'hell')) throw new Error(`Start-Design folgt nicht dem Gerät: ${look0}`);
await page.click('#look');
const look1 = await page.getAttribute('html', 'data-look'), bg1 = await bgOf();
if (look1 === look0 || bg1 === bg0) throw new Error('Hell/Dunkel-Schalter ohne Wirkung');
await page.reload(); await page.waitForSelector('.unit');
if ((await page.getAttribute('html', 'data-look')) !== look1) throw new Error('Hell/Dunkel-Wahl nach Neuladen vergessen');
await shot('00-start-umgeschaltet');
await page.click('#look');
if ((await page.getAttribute('html', 'data-look')) !== look0) throw new Error('Zurückschalten klappt nicht');
await page.click('#nav a[data-tab="start"]'); await page.waitForSelector('#home');
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

// Alle weiteren Einheiten: jeden Schritt öffnen und je nach Art durchspielen.
const setRange = (sel, v) => page.locator(sel).evaluate((el, val) => { el.value = val; el.dispatchEvent(new Event('input')); }, v);
async function playFlaeche() {
  for (let i = 0; i < FL.length; i++) {
    await setRange('#fl-r', 60); await page.waitForSelector('#fl-body .opt');
    if (i === 0) await shot('21-flaeche');
    for (let k = 0; k < 3; k++) { if (await page.locator('#fl-next').isVisible()) break; await page.locator('#fl-body .opt').nth(k).click(); }
    await page.click('#fl-next button');
  }
}
async function playLabor() {
  for (let i = 0; i < LB.length; i++) {
    if (await page.locator('#lb-rn').isVisible()) await setRange('#lb-in', LB[i].sol.n);
    if (await page.locator('#lb-rp').isVisible()) await setRange('#lb-ip', LB[i].sol.p);
    await page.click('#lb-go'); await page.waitForSelector('#lb-note .note.ok', { timeout: 15000 });
    if (i === 0) await shot('22-labor');
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
    if (i === 3) await shot('23-lotse');
    await page.click('#lo-go');
  }
}
async function playWerkstatt() {
  for (let i = 0; i < WK.length; i++) {
    await page.click('#wk-go'); await page.waitForSelector('#wk-note .note.tip');
    await setRange('#wk-r', WK[i].sol); await page.click('#wk-go'); await page.waitForSelector('#wk-note .note.ok');
    if (i === 0) await shot('27-werkstatt');
    await page.click('#wk-go');
  }
}
async function playRaum() {
  for (let i = 0; i < RM.length; i++) {
    if (RM[i].type === 'look') {
      const a = lookAlong(RM[i].lines[0].u);
      // erst echt mit dem Finger drehen (Zeigerereignisse), dann die Zielrichtung einstellen
      const b = await page.locator('#rm-c').boundingBox();
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down(); await page.mouse.move(b.x + b.width / 2 + 60, b.y + b.height / 2 - 30, { steps: 8 }); await page.mouse.up();
      if (await page.locator('#rm-next').isVisible()) throw new Error('Raum: zufälliges Drehen darf nicht lösen');
      await page.locator('#rm-c').evaluate((el, v) => el.setView(v.yaw, v.pitch), a);
      await page.waitForSelector('#rm-next:not([hidden])'); await shot('28-raum-blick');
    } else {
      if (i === 1) await shot('29-raum-frage');
      for (let k = 0; k < 3; k++) { if (await page.locator('#rm-next').isVisible()) break; await page.locator('#rm-body .opt').nth(k).click(); }
    }
    await page.click('#rm-next button');
  }
}
await page.waitForSelector('.unit'); await page.click('a[href="#/u/regeln"]'); await shot('16-einheit');
let shotQuiz = { regeln: '17-luecke', extrema: '24-extrema', 's-baum': '25-baum', 'g-skalar': '26-skalar', 's-bedingt': '30-vierfelder', 'g-gerade': '31-lage', 's-test': '32-test', operatoren: '33-operatoren', anwenden: '34-tangente' };
for (const u of UNITS.filter((x) => !['formen', 'steigung', 'zeichnen'].includes(x.id))) {
  for (let i = 0; i < u.steps.length; i++) {
    await page.goto(`${BASE}#/u/${u.id}/${i}`); await page.waitForSelector('#stage > *');
    if (await page.locator('#i-next').count()) await info();
    else if (await page.locator('#fl-c').count()) await playFlaeche();
    else if (await page.locator('#lb-c').count()) await playLabor();
    else if (await page.locator('#lo-c').count()) await playLotse();
    else if (await page.locator('#wk-c').count()) await playWerkstatt();
    else if (await page.locator('#rm-c').count()) await playRaum();
    else { if (shotQuiz[u.id] && i <= 1) { await shot(shotQuiz[u.id]); delete shotQuiz[u.id]; } await quiz(); }
    await page.waitForSelector('#sheet:not([hidden])');
    if (u.id === 'operatoren' && i === u.steps.length - 1) await shot('19-einheit-geschafft');
    await sheetNext();
  }
}
await page.goto(BASE);

// Einstellungen: Bundesland und Abi-Termin → Countdown auf der Startseite
await page.goto(`${BASE}#/einstellungen`); await page.waitForSelector('#st-land');
await page.click('#st-land [data-k="HE-LK"]');
const in90 = new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10);
await page.fill('#st-abi', in90); await page.locator('#st-abi').dispatchEvent('change'); await shot('35-einstellungen');
await page.goto(BASE); await page.waitForSelector('.count');
const cd = +(await page.textContent('.count .big'));
if (!(cd >= 89 && cd <= 91)) throw new Error(`Countdown falsch: ${cd}`);
await shot('36-start-countdown');

// Runde auf Zeit durchspielen: immer die erste Antwort (manche richtig, manche falsch)
async function playRound(endSel) {
  for (let guard = 0; guard < 40; guard++) {
    if (await page.locator(endSel).count()) return;
    const first = page.locator('#ex-q .opt').first();
    if (await first.count()) await first.click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(950);
  }
  throw new Error('Runde endet nicht');
}
// Abi-Modus
await page.goto(`${BASE}#/abi`); await page.waitForSelector('a[href="#/abi/A"]'); await shot('37-abi');
await page.click('a[href="#/abi/A"]'); await page.waitForSelector('#ex-q .opt'); await shot('38-abi-aufgabe');
await playRound('#ex-np'); await shot('39-abi-ergebnis');
const np = +(await page.textContent('#ex-np'));
if (!(np >= 0 && np <= 15)) throw new Error(`Notenpunkte unplausibel: ${np}`);
// Tages-Runde
await page.goto(`${BASE}#/tag`); await page.click('#rd-go'); await page.waitForSelector('#ex-q .opt'); await playRound('#rd-score');
const tagScore = +(await page.textContent('#rd-score'));
// Duell: spielen, Link nehmen, als Herausgeforderter öffnen
await page.goto(`${BASE}#/duell`); await page.click('#rd-go'); await page.waitForSelector('#ex-q .opt');
const firstPrompt = await page.textContent('#ex-q');
await playRound('#rd-score'); await shot('40-duell-ergebnis');
const link = await page.inputValue('#rd-link');
if (!/#\/duell\/\d+-[1-5]-\d+$/.test(link)) throw new Error(`Duell-Link falsch: ${link}`);
await page.goto(link); await page.reload(); await page.waitForSelector('#rd-go');
if (!(await page.textContent('.lead')).includes('herausgefordert')) throw new Error('Herausforderung wird nicht angezeigt');
await page.click('#rd-go'); await page.waitForSelector('#ex-q .opt');
if ((await page.textContent('#ex-q')) !== firstPrompt) throw new Error('Duell: Gegner bekommt nicht dieselbe erste Aufgabe');
await playRound('#rd-score');
if (!(await page.textContent('.board')).includes('Dein Gegner hatte')) throw new Error('Duell-Vergleich fehlt');
// Fehler-Kartei: fällig machen (Datum zurückdrehen), wiederholen
const kn = await page.evaluate(() => { const m = JSON.parse(localStorage.getItem('mt.v1')); for (const k of Object.values(m.kartei)) k.due = '2020-01-01'; localStorage.setItem('mt.v1', JSON.stringify(m)); return Object.keys(m.kartei).length; });
if (!kn) throw new Error('Fehler-Kartei ist leer, obwohl Fehler gemacht wurden');
await page.goto(BASE); await page.reload(); await page.waitForSelector('a[href="#/wiederholen"]'); await shot('41-start-wiederholen');
await page.click('a[href="#/wiederholen"]'); await page.waitForSelector('#stage > *');
for (let guard = 0; guard < 12 && !(await page.locator('#kt-done').count()); guard++) {
  if (await page.locator('.gaprow').count()) {
    const rows = page.locator('.gaprow'); const a = await rows.nth(0).locator('.pick').count(), b = await rows.nth(1).locator('.pick').count();
    search: for (let i = 0; i < a; i++) for (let j = 0; j < b; j++) { await rows.nth(0).locator('.pick').nth(i).click(); await rows.nth(1).locator('.pick').nth(j).click(); await page.click('#q-body .btn'); if (await page.locator('#q-next').isVisible()) break search; }
  } else for (let i = 0; i < 4; i++) { if (await page.locator('#q-next').isVisible()) break; await page.locator('.opt').nth(i).click(); }
  await page.click('#q-next'); await page.waitForTimeout(80);
}
await page.waitForSelector('#kt-done');
// Bericht
await page.goto(`${BASE}#/bericht`); await page.waitForSelector('.rep-grid'); await shot('42-bericht');
const rep = await page.textContent('.report');
if (!rep.includes('Bericht für Eltern') || !rep.includes('Abi-Modus') || !rep.includes('Hier hakt es noch')) throw new Error('Bericht unvollständig');
await page.goto(BASE);

// Fortschritt gespeichert?
await page.waitForSelector('#home'); await page.waitForTimeout(400); await shot('20-start-fertig');
async function countDone() {
  let n = 0;
  for (const hash of ['#/g/analysis', '#/g/stochastik', '#/g/geometrie', '#/pruefung']) { await page.goto(BASE + hash); await page.waitForSelector('.unit'); n += await page.locator('.unit.done').count(); }
  return n;
}
const done = await countDone();
if (done !== UNITS.length) throw new Error(`Erwartet ${UNITS.length} fertige Einheiten, gefunden ${done}`);
await shot('20b-pruefung'); await page.goto(`${BASE}#/mehr`); await page.waitForSelector('a[href="#/einstellungen"]'); await shot('20c-mehr');
await page.reload(); await page.waitForSelector('.unit');
if ((await countDone()) !== UNITS.length) throw new Error('Fortschritt nach Neuladen verloren');
await page.goto(BASE); await page.waitForSelector('#home');
const xp = +(await page.textContent('.chip.xp'));
if (!(xp > 100)) throw new Error(`Punkte unplausibel: ${xp}`);

// Jede Datei aus der Vorlade-Liste des Service Workers muss erreichbar sein (sonst fehlen offline Teile).
const missing = await page.evaluate(async () => {
  const sw = await (await fetch('sw.js', { cache: 'no-store' })).text();
  const list = JSON.parse(sw.match(/const ASSETS = (\[[\s\S]*?\]);/)[1]);
  const bad = [];
  for (const a of list) { const r = await fetch(a, { cache: 'no-store' }).catch(() => null); if (!r || !r.ok) bad.push(a); }
  return bad;
});
if (missing.length) throw new Error('Nicht erreichbar: ' + missing.join(', '));

// Offline: Service Worker aktiv → ohne Netz neu laden
const sw = await page.evaluate(async () => { const r = await navigator.serviceWorker?.ready; return !!r?.active; });
if (!sw) throw new Error('Service Worker nicht aktiv');
await ctx.setOffline(true); await page.reload(); await page.waitForSelector('#home');
await page.click('#nav a[data-tab="lernen"]'); await page.click('a[href="#/g/analysis"]'); await page.click('a[href="#/u/formen"]'); await page.click('a[href="#/u/formen/0"]'); await page.waitForSelector('#mb-c');
await ctx.setOffline(false);

await browser.close();
if (errors.length) { console.error('Konsolen-Fehler:\n' + errors.join('\n')); process.exit(1); }
console.log(`e2e: kompletter Durchlauf ohne Fehler (Stufe ${LEVEL}, ${xp} Punkte, ${UNITS.length} Einheiten, Abi-Modus ${np} NP, Tages-Runde ${tagScore}, Duell, Kartei, Bericht, offline ok)`);
