// Freischalt-Link im Browser (Chromium und WebKit): #pro=CODE (neu) und ?pro=CODE (alte Mails) → eingelöst, Code sofort aus der Adresse weg,
// Server-Anfragen tragen den Code nur im Body von POST /api/zugang (nie in einer Adresse). Aufruf: node tests/prolink.mjs
import { createRequire } from 'node:module'; const { chromium, webkit } = createRequire(import.meta.url)('playwright');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const APP = new URL('../app/', import.meta.url).pathname, CODE = 'MT-AB12-CD34-EF56';
const typ = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
const adressen = [];
const srv = http.createServer((q, r) => { const u = new URL(q.url, 'http://x'); adressen.push(q.url);
  if (u.pathname === '/api/zugang') { let b = ''; q.on('data', (c) => { b += c; }); q.on('end', () => { r.setHeader('content-type', 'application/json'); const ok = JSON.parse(b || '{}').code === CODE; r.statusCode = ok ? 200 : 404; r.end(ok ? '{"art":"pass","bis":"2027-07-31","ki":true}' : '{"error":"unbekannt"}'); }); return; }
  if (u.pathname.startsWith('/api/')) { r.setHeader('content-type', 'application/json'); r.statusCode = u.pathname === '/api/status' ? 200 : 404; return r.end(u.pathname === '/api/status' ? '{"ok":true,"premium":true,"ki":true}' : '{}'); }
  const f = path.join(APP, u.pathname === '/' ? 'index.html' : u.pathname); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.statusCode = 404; return r.end(); }
  r.setHeader('content-type', typ[path.extname(f)] || 'application/octet-stream'); fs.createReadStream(f).pipe(r); }).listen(0);
const BASE = `http://localhost:${srv.address().port}/`;
let n = 0, fehler = 0; const ok = (b, t) => { n++; if (!b) { fehler++; console.error('FEHLER:', t); } };
try {
  for (const [name, engine] of [['Chromium', chromium], ['WebKit', webkit]]) {
    const b = await engine.launch();
    for (const [art, url] of [['#pro=', `${BASE}#pro=${CODE}`], ['?pro=', `${BASE}?pro=${CODE}#/`]]) {
      adressen.length = 0;
      const c = await b.newContext({ serviceWorkers: 'block' }); const p = await c.newPage(); const err = []; p.on('pageerror', (e) => err.push(String(e)));
      await p.goto(url); await p.waitForFunction(() => !!JSON.parse(localStorage.getItem('mathetrainer.v1') || '{}').zugang, null, { timeout: 10000 }).catch(() => {});
      const z = await p.evaluate(() => ({ href: location.href, zugang: JSON.parse(localStorage.getItem('mathetrainer.v1') || '{}').zugang, text: document.body.innerText }));
      ok(z.zugang?.code === CODE && z.zugang.ki === true, `${name} ${art}: Code eingelöst`);
      ok(!z.href.includes(CODE) && !z.href.includes('pro='), `${name} ${art}: Code aus der Adresse entfernt (${z.href})`);
      ok(/freigeschaltet/.test(z.text), `${name} ${art}: Hinweis „freigeschaltet“`);
      ok(art !== '#pro=' || !adressen.some((a) => a.includes(CODE)), `${name} ${art}: Code steht in keiner Server-Adresse`);
      ok(!err.length, `${name} ${art}: keine Skriptfehler (${err.join(' | ')})`);
      await c.close();
    }
    // Code-Eingabe von Hand geht immer – auch wenn der Server keine Zugänge meldet
    const c = await b.newContext({ serviceWorkers: 'block' }); const p = await c.newPage();
    await p.route('**/api/status', (r) => r.fulfill({ status: 503, body: '' }));
    await p.goto(`${BASE}#/einstellungen`); await p.waitForSelector('#st-pro-code');
    ok(await p.locator('#st-pro').isVisible(), `${name}: Code-Feld sichtbar, auch ohne Antwort vom Server`);
    await c.close(); await b.close();
  }
} finally { srv.close(); }
console.log(fehler ? `${fehler} Fehler` : `prolink: ${n} Prüfungen bestanden (Chromium und WebKit)`);
if (fehler) process.exit(1);
