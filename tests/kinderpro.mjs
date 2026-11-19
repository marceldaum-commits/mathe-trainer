// Sofortkorrektur 2.5.2-1 (Recht, UWG Anh. I Nr. 28; Marcel 19.11.: „Heute ausblenden“): In Kl. 5–10 keine Pro-Karte, #/pro auch per
// direktem Link ohne Preise und Kaufknöpfe; Oberstufe unverändert. Chromium (PC) und WebKit (iPhone). Aufruf: node tests/kinderpro.mjs
import { createRequire } from 'node:module'; const { chromium, webkit, devices } = createRequire(import.meta.url)('playwright');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const APP = new URL('../app/', import.meta.url).pathname;
const typ = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { const u = new URL(q.url, 'http://x');
  if (u.pathname.startsWith('/api/') || u.pathname.startsWith('/zaehler')) { r.setHeader('content-type', 'application/json'); r.statusCode = u.pathname === '/api/status' ? 200 : 204; return r.end(u.pathname === '/api/status' ? '{"ok":true,"premium":true,"ki":true}' : ''); }
  const f = path.join(APP, u.pathname === '/' ? 'index.html' : u.pathname); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.statusCode = 404; return r.end(); }
  r.setHeader('content-type', typ[path.extname(f)] || 'application/octet-stream'); fs.createReadStream(f).pipe(r); }).listen(0);
const BASE = `http://localhost:${srv.address().port}/`;
let n = 0, fehler = 0; const ok = (b, t) => { n++; if (!b) { fehler++; console.error('FEHLER:', t); } };
const KAUF = /€|Pro holen|KI dazubuchen|Preise|\/produkt\//;
try {
  for (const [name, engine, geraet] of [['PC Chromium', chromium, { viewport: { width: 1440, height: 900 } }], ['iPhone WebKit', webkit, devices['iPhone 13']]]) {
    const b = await engine.launch();
    for (const [jg, zugang] of [['5', null], ['8', null], ['10', null], ['8', { code: 'MT-AB23-CD45-EF67', art: 'tage30', bis: '2099-01-01', ki: false }], ['os', null]]) {
      const c = await b.newContext({ ...geraet, serviceWorkers: 'block' }); const p = await c.newPage(); const err = [];
      p.on('pageerror', (e) => err.push(String(e)));
      await p.addInitScript(([j, z]) => { if (!localStorage.getItem('mathetrainer.v1')) localStorage.setItem('mathetrainer.v1', JSON.stringify({ jahrgang: j, ...(z ? { zugang: z } : {}) })); }, [jg, zugang]);
      const was = `${name} Kl. ${jg}${zugang ? ' (Pro ohne KI)' : ''}`;
      // direkter Link / Lesezeichen
      await p.goto(`${BASE}#/pro`); await p.waitForSelector('#pro-stufe'); await p.waitForTimeout(600);
      const t = await p.evaluate(() => ({ text: document.querySelector('.view').innerText, html: document.querySelector('.view').innerHTML }));
      if (jg === 'os') ok(/€/.test(t.text) && /Pro holen/.test(t.html), `${was}: Oberstufe unverändert (Preise und „Pro holen“)`);
      else {
        ok(!KAUF.test(t.text) && !KAUF.test(t.html), `${was}: #/pro per direktem Link ohne Preise und Kaufknöpfe`);
        ok(zugang ? /Pro/.test(t.text) : /Das gehört zu Mathe-Trainer Pro\./.test(t.text), `${was}: nur Stufe bzw. „Das gehört zu Mathe-Trainer Pro.“`);
      }
      await p.goto(`${BASE}#/mehr`); await p.waitForTimeout(600);
      const karte = await p.locator('a[href="#/pro"]').count();
      ok(jg === 'os' ? karte >= 1 : karte === 0, `${was}: Karte „PRO“ ${jg === 'os' ? 'da' : 'ausgeblendet'} (${karte})`);
      await p.goto(`${BASE}#/`); await p.waitForSelector('#home');
      ok(!(await p.locator('#home a[href*="/produkt/"]').count()), `${was}: Startseite ohne Shop-Link`);
      ok(!err.length, `${was}: keine Skriptfehler (${err.join(' | ')})`);
      await c.close();
    }
    await b.close();
  }
} finally { srv.close(); }
console.log(fehler ? `${fehler} Fehler` : `kinderpro: ${n} Prüfungen bestanden`);
if (fehler) process.exit(1);
