// iPhone/iPad-Prüfung mit WebKit (der Engine von Safari) – Leitstand 18.11.2026: „auf iPhone/iPad (Safari) muss alles laufen“,
// andere Apps hatten dort eine weiße Seite. Öffnet jede Seite der App auf iPhone und iPad, löst echte Aufgaben,
// öffnet Theorie und Spiele und prüft: kein Skriptfehler, nie eine leere Seite, nichts ragt über den Rand.
// Aufruf: node tests/webkit.mjs [Bilder-Ordner]   (braucht Playwright mit WebKit: npx playwright install webkit)
import { createRequire } from 'node:module'; const { webkit, devices } = createRequire(import.meta.url)('playwright');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const APP = new URL('../app/', import.meta.url).pathname, shots = process.argv[2];
const typ = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.mp3': 'audio/mpeg' };
const srv = http.createServer((q, r) => { const u = new URL(q.url, 'http://x');
  if (u.pathname.startsWith('/api/')) { r.setHeader('content-type', 'application/json'); r.statusCode = u.pathname === '/api/status' ? 200 : 404; return r.end(u.pathname === '/api/status' ? '{"ok":true,"ki":false,"premium":false}' : '{}'); }
  const f = path.join(APP, u.pathname === '/' ? 'index.html' : decodeURIComponent(u.pathname)); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.statusCode = 404; return r.end(); }
  r.setHeader('content-type', typ[path.extname(f)] || 'application/octet-stream'); fs.createReadStream(f).pipe(r); }).listen(0);
const BASE = `http://localhost:${srv.address().port}/`;
let n = 0, fehler = 0; const ok = (b, t) => { n++; if (!b) { fehler++; console.error('FEHLER:', t); } };
const SEITEN = ['#/', '#/lernen', '#/g/analysis', '#/g/stochastik', '#/g/geometrie', '#/pruefung', '#/mehr', '#/einstellungen', '#/pro', '#/formeln', '#/erfolge', '#/bericht', '#/blatt', '#/tag', '#/blitz', '#/kopf', '#/abenteuer', '#/karte', '#/plan', '#/zertifikat', '#/wiederholen', '#/stufe', '#/theorie/formen'];
const b = await webkit.launch();
try {
  for (const [name, dev] of [['iPhone', devices['iPhone 13']], ['iPad', devices['iPad (gen 7)']]]) {
    const c = await b.newContext({ ...dev }); await c.addInitScript(() => { window.__mtTest = true; });
    const p = await c.newPage(); const err = [];
    p.on('pageerror', (e) => err.push(String(e))); p.on('console', (m) => { if (m.type() === 'error' && !/status of 404|Failed to load resource/.test(m.text())) err.push(m.text()); });
    await p.goto(BASE); await p.waitForSelector('#home', { timeout: 20000 });
    ok(await p.evaluate(() => document.querySelector('#lade')?.classList.contains('weg') !== false), `${name}: Ladebild verschwindet`);
    // Klasse wählen (Oberstufe), damit alle Seiten Inhalt haben
    const ober = p.locator('#jg-frage button', { hasText: 'Oberstufe' }); if (await ober.count()) { await ober.click(); await p.waitForSelector('#home'); }
    for (const s of SEITEN) {
      await p.goto(BASE + s); await p.waitForTimeout(700);
      const z = await p.evaluate(() => ({ text: (document.querySelector('#view')?.innerText || '').trim().length, breit: document.documentElement.scrollWidth - innerWidth }));
      ok(z.text > 20, `${name} ${s}: Seite hat Inhalt (keine weiße Seite)`);
      ok(z.breit <= 1, `${name} ${s}: nichts ragt über den Rand (${z.breit} px)`);
    }
    // echte Aufgaben: Blitz-Runde (im Test ist die richtige Antwort markiert) und eine Übungsrunde mit Probieren
    await p.goto(`${BASE}#/blitz`); await p.click('#bz-go'); await p.waitForSelector('#bz-q .opt');
    let geloest = 0;
    for (let i = 0; i < 40; i++) { const r = p.locator('#bz-q .opt[data-ok="1"]').first(); if (await r.count()) { await r.click({ timeout: 2000 }).catch(() => {}); geloest++; } await p.waitForTimeout(260); }
    ok(geloest >= 3, `${name}: Blitz-Runde lässt sich spielen (${geloest} Antworten)`);
    await p.goto(`${BASE}#/g/analysis`); await p.waitForTimeout(500);
    const unit = p.locator('a.unit').first(); await unit.click(); await p.waitForTimeout(500);
    let ueb = 0;
    for (const href of await p.locator('a.step').evaluateAll((a) => a.map((x) => x.getAttribute('href')))) {
      await p.goto(BASE + href); await p.waitForTimeout(700);
      for (let i = 0; i < 20; i++) {
        const o = p.locator('.q .opt:not(.wrong):not([disabled])').first(); if (!(await o.count())) break;
        await o.click(); await p.waitForTimeout(250);
        const w = p.locator('#q-next'); if (await w.isVisible()) { ueb++; await w.click(); await p.waitForTimeout(300); }
      }
      if (ueb) break;
    }
    ok(ueb > 0, `${name}: Übungsaufgaben lassen sich beantworten (${ueb})`);
    ok(/Zum Home-Bildschirm/.test(await p.goto(BASE).then(() => p.waitForSelector('#home')).then(() => p.textContent('body'))), `${name}: Anleitung „App installieren“ für Safari`);
    if (shots) await p.screenshot({ path: `${shots}/webkit-${name}.png` });
    ok(!err.length, `${name}: keine Skriptfehler (${err.slice(0, 3).join(' | ')})`);
    await c.close();
  }
} finally { await b.close(); srv.close(); }
console.log(fehler ? `${fehler} Fehler` : `webkit: ${n} Prüfungen bestanden (iPhone und iPad)`);
if (fehler) process.exit(1);
