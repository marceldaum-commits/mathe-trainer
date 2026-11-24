// Startanimation (AUFTRAG.md 22.11.): Splash steht im HTML (#05070f, Logo inline), verschwindet nach dem ersten Bild (höchstens 4 s) und wird entfernt,
// blockiert keine Klicks, bei „weniger Bewegung“ nur Ausblenden; Manifest background_color #05070f. Aufruf: node tests/startanimation.mjs
import { createRequire } from 'node:module'; const { chromium, webkit } = createRequire(import.meta.url)('playwright');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const APP = new URL('../app/', import.meta.url).pathname;
const typ = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { const u = new URL(q.url, 'http://x');
  if (u.pathname.startsWith('/api/') || u.pathname.startsWith('/zaehler')) { r.setHeader('content-type', 'application/json'); r.statusCode = u.pathname === '/api/status' ? 200 : 204; return r.end(u.pathname === '/api/status' ? '{"ok":true}' : ''); }
  const f = path.join(APP, u.pathname === '/' ? 'index.html' : u.pathname); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.statusCode = 404; return r.end(); }
  r.setHeader('content-type', typ[path.extname(f)] || 'application/octet-stream'); fs.createReadStream(f).pipe(r); }).listen(0);
const BASE = `http://localhost:${srv.address().port}/`;
let n = 0, fehler = 0; const ok = (b, t) => { n++; if (!b) { fehler++; console.error('FEHLER:', t); } };
const html = fs.readFileSync(APP + 'index.html', 'utf8'), man = JSON.parse(fs.readFileSync(APP + 'manifest.webmanifest', 'utf8'));
ok(/<div id="splash" aria-hidden="true"><svg/.test(html) && /#splash\{[^}]*background:#05070f/.test(html) && !/<div id="splash"[^>]*>[^<]*<img/.test(html), 'Splash im HTML: #05070f, Logo als Inline-SVG, aria-hidden, kein Netzabruf');
ok(man.background_color === '#05070f', 'Manifest: background_color #05070f');
try {
  for (const [name, engine] of [['Chromium', chromium], ['WebKit', webkit]]) {
    const b = await engine.launch();
    for (const reduziert of [false, true]) {
      const c = await b.newContext({ reducedMotion: reduziert ? 'reduce' : 'no-preference', serviceWorkers: 'block' }); const p = await c.newPage(); const err = [];
      p.on('pageerror', (e) => err.push(String(e)));
      await p.addInitScript(() => localStorage.setItem('mathetrainer.v1', JSON.stringify({ jahrgang: '8' })));
      const t0 = Date.now(); await p.goto(BASE, { waitUntil: 'commit' });
      const sofort = await p.evaluate(() => { const s = document.getElementById('splash'); return s ? { bg: getComputedStyle(s).backgroundColor, pe: getComputedStyle(s).pointerEvents } : null; }).catch(() => null);
      ok(!sofort || (sofort.bg === 'rgb(5, 7, 15)' && sofort.pe === 'none'), `${name}${reduziert ? ' (weniger Bewegung)' : ''}: Splash schwarz #05070f und blockiert keine Klicks`);
      await p.waitForSelector('#home'); await p.waitForFunction(() => !document.getElementById('splash'), null, { timeout: 6000 }).catch(() => {});
      ok(await p.evaluate(() => !document.getElementById('splash')) && Date.now() - t0 < 6000, `${name}${reduziert ? ' (weniger Bewegung)' : ''}: Splash nach dem ersten Bild entfernt (${Date.now() - t0} ms)`);
      await p.goto(`${BASE}#/mehr`); ok(await p.evaluate(() => !document.getElementById('splash')), `${name}: bei Seitenwechsel kein neuer Splash`);
      ok(!err.length, `${name}: keine Skriptfehler (${err.join(' | ')})`);
      await c.close();
    }
    await b.close();
  }
} finally { srv.close(); }
console.log(fehler ? `${fehler} Fehler` : `startanimation: ${n} Prüfungen bestanden`);
if (fehler) process.exit(1);
