// Browser-Test der automatischen Aktualisierung der Web-App (Leitstand 18.11.2026: „Die WebApp muss immer automatisch aktuell sein“).
// Spielt zwei neue Fassungen nach: alte Fassung offen, mitten in einer Aufgabe kommt eine neue → kein Neuladen mittendrin;
// zurück zum Start → lädt von selbst neu, Hinweis „Neue Version … geladen“, Spielstand und Nova-Offline-Dateien bleiben, alte Speicher weg.
// Danach: neue Fassung, während die Seite zu ist → beim nächsten Öffnen ohne Neuladen von Hand die neueste.
// Aufruf: node tests/web-update.mjs   (dauert gut zwei Minuten: die Prüfung bei Rückkehr in den Tab läuft höchstens einmal je Minute)
import { createRequire } from 'node:module'; const { chromium } = createRequire(import.meta.url)('playwright');
import http from 'node:http'; import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
const APP = new URL('../app/', import.meta.url).pathname;
const ALT = /export const VERSION = '([\d.]+)'/.exec(fs.readFileSync(APP + 'js/config.js', 'utf8'))[1];
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mt-upd-'));
/** Eine Fassung: Kopie der App, Versionsnummer überall ersetzt (Bündel, stand.json, Speichername im Service Worker). */
function fassung(nr) {
  const ziel = path.join(tmp, nr); fs.cpSync(APP, ziel, { recursive: true });
  if (nr === ALT) return ziel;
  for (const f of ['sw.js', 'stand.json', ...fs.readdirSync(path.join(ziel, 'b')).map((x) => `b/${x}`)]) {
    const p = path.join(ziel, f); const t = fs.readFileSync(p, 'utf8'); if (t.includes(ALT)) fs.writeFileSync(p, t.split(`"${ALT}"`).join(`"${nr}"`).split(`'${ALT}'`).join(`'${nr}'`).split(`mt-${ALT}`).join(`mt-${nr}`));
  }
  return ziel;
}
const V = [ALT, '9.9.8', '9.9.9'], wurzel = Object.fromEntries(V.map((v) => [v, fassung(v)]));
let aktiv = ALT;
const typ = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.mp3': 'audio/mpeg' };
const srv = http.createServer((q, r) => { const u = new URL(q.url, 'http://x');
  if (u.pathname.startsWith('/api/')) { r.setHeader('content-type', 'application/json'); r.statusCode = 404; return r.end('{}'); }
  const f = path.join(wurzel[aktiv], u.pathname === '/' ? 'index.html' : u.pathname);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.statusCode = 404; return r.end(); }
  r.setHeader('content-type', typ[path.extname(f)] || 'application/octet-stream');
  // Der echte Server schickt index.html und sw.js mit no-cache; die Bündel tragen dort eine Prüfsumme im Namen. Hier behalten
  // die nachgestellten Fassungen dieselben Bündel-Namen – darum gilt no-cache für alles, sonst nähme der Browser die alten.
  r.setHeader('cache-control', 'no-cache');
  fs.createReadStream(f).pipe(r); }).listen(0);
const BASE = `http://localhost:${srv.address().port}/`;
let n = 0, fehler = 0; const ok = (b, t) => { n++; if (!b) { fehler++; console.error('FEHLER:', t); } };
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 400, height: 800 } }); let p = await ctx.newPage();
const fehlerSeite = []; p.on('pageerror', (e) => fehlerSeite.push(String(e)));
const warte = async (fn, ms, was) => { const t0 = Date.now(); for (;;) { try { if (await fn()) return true; } catch { /* Seite lädt gerade neu */ } if (Date.now() - t0 > ms) { console.error('Zeit um:', was); return false; } await new Promise((r) => setTimeout(r, 300)); } };
const version = () => p.evaluate(() => document.querySelector('#ver')?.textContent || '');
try {
  await p.goto(BASE); await p.waitForSelector('#ver');
  ok(await warte(() => p.evaluate(() => !!navigator.serviceWorker.controller), 15000, 'Service Worker übernimmt'), 'Service Worker übernimmt die Seite');
  await p.evaluate(async () => { localStorage.setItem('mt-test-daten', 'bleibt'); const c = await caches.open('stimme-nova'); await c.put('/nova/test.mp3', new Response('nova')); });
  ok((await version()).includes(ALT), `Start mit Version ${ALT}`);
  // mitten in einer Aufgabe
  const ziel = await p.evaluate(() => document.querySelector('a[href^="#/u/"][href*="/"]')?.getAttribute('href'));
  await p.evaluate((z) => { location.hash = z.split('/').length > 3 ? z : `${z}/0`; }, ziel); await p.waitForSelector('.stephead', { timeout: 15000 });
  await p.evaluate(() => { window.__nichtNeu = true; });
  aktiv = '9.9.8';
  await new Promise((r) => setTimeout(r, 61000));   // die Prüfung bei Rückkehr läuft höchstens einmal je Minute
  await p.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  ok(await warte(() => p.evaluate(async () => !!(await navigator.serviceWorker.getRegistration())?.waiting), 20000, 'neue Fassung wartet'), 'Rückkehr in den Tab: neue Fassung wird gefunden und geladen');
  await new Promise((r) => setTimeout(r, 2500));
  ok(await p.evaluate(() => window.__nichtNeu === true && !!document.querySelector('.stephead')), 'Mitten in der Aufgabe wird nicht neu geladen');
  await p.evaluate(() => { location.hash = '#/'; });
  ok(await warte(async () => (await version()).includes('9.9.8'), 20000, 'Neuladen nach der Aufgabe'), 'Zurück zum Start: lädt von selbst neu und zeigt Version 9.9.8');
  ok(await warte(() => p.evaluate(() => document.body.innerText.includes('Neue Version 9.9.8 geladen')), 5000, 'Hinweis'), 'Hinweis „Neue Version 9.9.8 geladen.“');
  const daten = await p.evaluate(async () => ({ ls: localStorage.getItem('mt-test-daten'), nova: !!(await (await caches.open('stimme-nova')).match('/nova/test.mp3')), speicher: await caches.keys() }));
  ok(daten.ls === 'bleibt', 'Spielstand/Einstellungen (localStorage) bleiben');
  ok(daten.nova, 'Nova-Offline-Dateien bleiben');
  ok(!daten.speicher.includes(`mt-${ALT}`) && daten.speicher.includes('mt-9.9.8'), `Alter App-Speicher aufgeräumt (${daten.speicher.join(', ')})`);
  // Seite zu, neue Fassung kommt, später wieder öffnen
  await p.close(); aktiv = '9.9.9';
  p = await ctx.newPage(); p.on('pageerror', (e) => fehlerSeite.push(String(e)));
  await p.goto(BASE);
  ok(await warte(async () => (await version()).includes('9.9.9'), 25000, 'nächstes Öffnen'), 'Nächstes Öffnen nach längerer Zeit: ohne Neuladen von Hand Version 9.9.9');
  ok(await p.evaluate(() => localStorage.getItem('mt-test-daten') === 'bleibt'), 'Daten auch nach dem zweiten Update da');
  ok(!fehlerSeite.length, `keine Skriptfehler (${fehlerSeite.slice(0, 2).join(' | ')})`);
} finally { await b.close(); srv.close(); fs.rmSync(tmp, { recursive: true, force: true }); }
console.log(fehler ? `${fehler} Fehler` : `web-update: ${n} Prüfungen bestanden`);
if (fehler) process.exit(1);
