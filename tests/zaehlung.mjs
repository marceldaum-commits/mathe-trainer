// Anonyme Nutzungszählung (Ratgeber A3) im Browser: start wird gezählt, Links tragen ?src=mathetrainer-<ort>, Ereignisse enthalten
// nur app, v, ev, ort, thema – keine Kennung, keine Geräte-ID, kein Lernstand, kein Code. Schalter aus → kein einziger Aufruf.
// Dazu ein echter Aufruf gegen trainer-test (204). Aufruf: node tests/zaehlung.mjs [Bilder-Ordner]
import { createRequire } from 'node:module'; const { chromium, webkit } = createRequire(import.meta.url)('playwright');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const APP = new URL('../app/', import.meta.url).pathname, shots = process.argv[2];
const typ = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
const zaehl = [];
const srv = http.createServer((q, r) => { const u = new URL(q.url, 'http://x');
  if (u.pathname === '/zaehler/v1/e') { let b = ''; q.on('data', (c) => { b += c; }); q.on('end', () => { zaehl.push({ typ: q.headers['content-type'], cookie: q.headers.cookie || '', body: b }); r.statusCode = 204; r.end(); }); return; }
  if (u.pathname === '/api/zugang') { r.setHeader('content-type', 'application/json'); return r.end('{"art":"pass","bis":"2027-07-31","ki":true}'); }
  if (u.pathname.startsWith('/api/')) { r.setHeader('content-type', 'application/json'); r.statusCode = 404; return r.end('{}'); }
  const f = path.join(APP, u.pathname === '/' ? 'index.html' : u.pathname); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.statusCode = 404; return r.end(); }
  r.setHeader('content-type', typ[path.extname(f)] || 'application/octet-stream'); fs.createReadStream(f).pipe(r); }).listen(0);
const BASE = `http://localhost:${srv.address().port}/`;
let n = 0, fehler = 0; const ok = (b, t) => { n++; if (!b) { fehler++; console.error('FEHLER:', t); } };
const EV = () => zaehl.map((z) => JSON.parse(z.body));
try {
  for (const [name, engine] of [['Chromium', chromium], ['WebKit', webkit]]) {
    zaehl.length = 0;
    const b = await engine.launch(); const c = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
    await c.addInitScript(() => { if (!localStorage.getItem('mathetrainer.v1')) localStorage.setItem('mathetrainer.v1', JSON.stringify({ jahrgangGewaehlt: true, jahrgang: 'os', geraet: 'GERAETEKENNUNG1234567', xp: 99, stats: { Brüche: { ok: 1, bad: 5 } } })); });
    const p = await c.newPage(); const err = []; p.on('pageerror', (e) => err.push(String(e)));
    await p.route('**/www.mathenachhilfe-online.com/**', (r) => r.fulfill({ status: 200, body: 'ok' }));
    await p.goto(`${BASE}#/pro=x`.replace('#/pro=x', `#pro=MT-AB12-CD34-EF56`)); await p.waitForTimeout(1500);
    await p.goto(`${BASE}#/mehr`); await p.waitForTimeout(800);
    // Probestunde aus dem Lernstand (Bericht für Eltern)
    await p.goto(`${BASE}#/bericht`); await p.waitForSelector('a[href*="probestunde"]');
    // Seit 2.5.3: Probestunden-Hinweis nur Oberstufe (Lernstand) und Link nur über das Eltern-Tor (ELTERN-TOR.md)
    await p.click('a[href*="probestunde"]'); await p.waitForSelector('#eltern-tor');
    const WORT = { dreizehn: 13, vierzehn: 14, 'fünfzehn': 15, sechzehn: 16, siebzehn: 17, achtzehn: 18, neunzehn: 19, sechs: 6, sieben: 7, acht: 8, neun: 9 };
    const [x, y] = (await p.textContent('#tor-aufgabe')).toLowerCase().split(' mal ');
    for (const z of String(WORT[x] * WORT[y])) await p.click(`#eltern-tor [data-z="${z}"]`);
    const [neu] = await Promise.all([c.waitForEvent('page', { timeout: 5000 }).catch(() => null), p.click('#eltern-tor [data-z="ok"]')]);
    const ziel = neu ? neu.url() : await p.evaluate(() => document.querySelector('a[href*="probestunde"]').href);
    ok(/src=mathetrainer-lernstand/.test(ziel), `${name}: Probestunden-Link (nach dem Eltern-Tor) mit src=mathetrainer-lernstand (${ziel})`);
    if (neu) await neu.close();
    await p.goto(`${BASE}#/eltern`); await p.waitForTimeout(500);
    await p.goto(`${BASE}#/theorie/k9-quadrat`); await p.waitForTimeout(500);
    await p.goto(`${BASE}#/`); await p.waitForSelector('footer a');
    const fuss = await p.evaluate(() => { const a = [...document.querySelectorAll('footer a')].find((x) => /Angebot/.test(x.textContent)); return a ? a.textContent : ''; });
    ok(/Ein Angebot von/.test(fuss), `${name}: dezenter Hinweis in der Fußzeile (${fuss})`);
    await p.waitForTimeout(800);
    const ev = EV(), arten = ev.map((e) => e.ev);
    ok(arten.filter((x) => x === 'start').length >= 1 && arten.includes('probestunde_klick') && arten.includes('nachhilfe_hinweis') && arten.includes('elternbereich') && arten.includes('theorie') && arten.includes('code_eingeloest'), `${name}: Ereignisse gezählt (${[...new Set(arten)].join(', ')})`);
    ok(ev.some((e) => e.ev === 'code_eingeloest' && e.ort === 'link') && ev.some((e) => e.ev === 'probestunde_klick' && e.ort === 'lernstand'), `${name}: Orte stimmen (link, lernstand)`);
    const erlaubt = ['app', 'v', 'ev', 'ort', 'thema'];
    ok(ev.every((e) => e.app === 'mathetrainer' && Object.keys(e).every((k) => erlaubt.includes(k))), `${name}: nur app, v, ev, ort, thema`);
    ok(zaehl.every((z) => /text\/plain/.test(z.typ) && !z.cookie && !/GERAET|MT-AB12|Brüche|"xp"/.test(z.body)), `${name}: text/plain, ohne Cookies, ohne Kennung, Code oder Lernstand`);
    // Schalter in den Einstellungen: aus → kein Aufruf mehr
    await p.goto(`${BASE}#/einstellungen`); await p.waitForSelector('#st-zaehl');
    ok(await p.evaluate(() => document.querySelector('#st-zaehl').getAttribute('aria-checked') === 'true'), `${name}: Schalter ist von Haus aus an`);
    if (shots) { await p.locator('#st-zaehl-box').scrollIntoViewIfNeeded(); await p.locator('#st-zaehl-box').screenshot({ path: `${shots}/zaehlung-schalter-${name}.png` }); }
    await p.click('#st-zaehl');
    const vorher = zaehl.length;
    await p.goto(`${BASE}#/bericht`); await p.waitForSelector('a[href*="probestunde"]'); await p.click('a[href*="probestunde"]').catch(() => {}); await p.reload(); await p.waitForTimeout(1200);
    ok(zaehl.length === vorher, `${name}: Schalter aus → kein Aufruf (${zaehl.length - vorher} gesendet)`);
    ok(!err.length, `${name}: keine Skriptfehler (${err.slice(0, 2).join(' | ')})`);
    await b.close();
  }
  // echter Aufruf gegen trainer-test
  try {
    const r = await fetch('https://trainer-test.mathenachhilfe-online.com/zaehler/v1/e', { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ app: 'mathetrainer', v: 'test', ev: 'start' }) });
    ok(r.status === 204, `echter Aufruf gegen trainer-test: ${r.status}`);
  } catch (e) { console.log('Hinweis: trainer-test nicht erreichbar –', e.message); }
} finally { srv.close(); }
console.log(fehler ? `${fehler} Fehler` : `zaehlung: ${n} Prüfungen bestanden (Chromium und WebKit)`);
if (fehler) process.exit(1);
