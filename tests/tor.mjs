// Eltern-Tor im Browser (Chromium und WebKit) nach ELTERN-TOR.md und Recht V10: Kl. 8 → Pro-Seite ohne Preise, „Für Eltern“ öffnet das Tor,
// Aufgabe in Worten, eigene Ziffern-Tasten, Fehler → neue Aufgabe, richtig → Pro-Seite mit Preisen; „← Alle Apps“ und Shop-Links nur über das Tor;
// Impressum und Datenschutz frei; Probestunden-Hinweise in Kl. 5–10 unsichtbar; Oberstufe: Preise sichtbar, Kauf über das Tor,
// „Wer unter 18 ist, kauft nicht selbst.“ Aufruf: node tests/tor.mjs
import { createRequire } from 'node:module'; const { chromium, webkit } = createRequire(import.meta.url)('playwright');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const APP = new URL('../app/', import.meta.url).pathname;
const typ = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { const u = new URL(q.url, 'http://x');
  if (u.pathname.startsWith('/api/') || u.pathname.startsWith('/zaehler')) { r.setHeader('content-type', 'application/json'); r.statusCode = u.pathname === '/api/status' ? 200 : 204; return r.end(u.pathname === '/api/status' ? '{"ok":true,"premium":true}' : ''); }
  const f = path.join(APP, u.pathname === '/' ? 'index.html' : u.pathname); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.statusCode = 404; return r.end(); }
  r.setHeader('content-type', typ[path.extname(f)] || 'application/octet-stream'); fs.createReadStream(f).pipe(r); }).listen(0);
const BASE = `http://localhost:${srv.address().port}/`;
let n = 0, fehler = 0; const ok = (b, t) => { n++; if (!b) { fehler++; console.error('FEHLER:', t); } };
const WORT = { dreizehn: 13, vierzehn: 14, 'fünfzehn': 15, sechzehn: 16, siebzehn: 17, achtzehn: 18, neunzehn: 19, sechs: 6, sieben: 7, acht: 8, neun: 9 };
const loesung = async (p) => { const t = (await p.textContent('#tor-aufgabe')).toLowerCase(); const [a, b] = t.split(' mal '); return WORT[a] * WORT[b]; };
const tippe = async (p, zahl) => { for (const z of String(zahl)) await p.click(`#eltern-tor [data-z="${z}"]`); await p.click('#eltern-tor [data-z="ok"]'); };
try {
  for (const [name, engine] of [['Chromium', chromium], ['WebKit', webkit]]) {
    const b = await engine.launch();
    for (const jg of ['8', 'os']) {
      const c = await b.newContext({ serviceWorkers: 'block' }); const p = await c.newPage(); const err = [], neu = [];
      p.on('pageerror', (e) => err.push(String(e))); c.on('page', (x) => neu.push(x));
      await c.route(/mathenachhilfe-online\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/html', body: '<p>extern</p>' }));
      await p.addInitScript((j) => { if (!localStorage.getItem('mathetrainer.v1')) localStorage.setItem('mathetrainer.v1', JSON.stringify({ jahrgang: j })); }, jg);
      await p.goto(`${BASE}#/`); await p.waitForSelector('#home');
      const kinder = await p.evaluate(() => document.documentElement.classList.contains('kinder'));
      ok(kinder === (jg !== 'os'), `${name} Kl. ${jg}: Klasse „kinder“ ${jg !== 'os' ? 'gesetzt' : 'nicht gesetzt'}`);
      const promo = await p.evaluate(() => [...document.querySelectorAll('.cta, .promo, .werbung')].filter((e) => e.getClientRects().length).length);
      ok(jg === 'os' ? true : promo === 0, `${name} Kl. ${jg}: keine sichtbaren Probestunden-Hinweise (${promo})`);
      // „← Alle Apps“ → Tor
      await p.click('.alle-apps'); await p.waitForSelector('#eltern-tor');
      ok(/Hier geht es zur Website\./.test(await p.textContent('#tor-grund')), `${name} Kl. ${jg}: Grund „Hier geht es zur Website.“`);
      ok(/^(Dreizehn|Vierzehn|Fünfzehn|Sechzehn|Siebzehn|Achtzehn|Neunzehn) mal (sechs|sieben|acht|neun)$/.test(await p.textContent('#tor-aufgabe')), `${name} Kl. ${jg}: Aufgabe in Worten`);
      ok(await p.locator('#eltern-tor input').count() === 0 && await p.locator('#eltern-tor .tor-taste').count() === 12, `${name} Kl. ${jg}: eigene Ziffern-Tasten, kein Eingabefeld`);
      await p.click('#tor-abbrechen');
      ok(await p.locator('#eltern-tor').count() === 0 && p.url().startsWith(BASE), `${name} Kl. ${jg}: Abbrechen schließt das Tor, keine Weiterleitung`);
      // Fehler → neue Aufgabe
      await p.click('.alle-apps'); await p.waitForSelector('#eltern-tor');
      const vorher = await p.textContent('#tor-aufgabe'); const falsch = (await loesung(p)) + 1; await tippe(p, falsch);
      ok(/Leider falsch – hier ist eine neue Aufgabe\./.test(await p.textContent('#tor-fehler')) && await p.locator('#eltern-tor').count() === 1, `${name} Kl. ${jg}: Fehler → Hinweis und neue Aufgabe (${vorher})`);
      await tippe(p, await loesung(p));
      await p.waitForURL(/mathenachhilfe-online\.com\/lern-apps\//, { timeout: 8000 }).catch(() => {});
      ok(/\/lern-apps\//.test(p.url()), `${name} Kl. ${jg}: richtig gelöst → „Alle Apps“ öffnet (${p.url()})`);
      await p.goto(`${BASE}#/`); await p.waitForSelector('#home');   // neu geladen: Tor wieder zu (nur Arbeitsspeicher)
      // Impressum frei
      const vorNeu = neu.length; await p.click('footer a[href*="impressum"]'); await p.waitForTimeout(400);
      ok(await p.locator('#eltern-tor').count() === 0 && neu.length > vorNeu, `${name} Kl. ${jg}: Impressum ohne Tor`);
      // Pro-Seite
      await p.goto(`${BASE}#/pro`); await p.waitForSelector('#pro-stufe');
      const t = await p.evaluate(() => document.querySelector('.view').innerText);
      if (jg !== 'os') {
        ok(!/€|Pro holen|Preise/.test(t) && await p.locator('#pro-eltern').count() === 1, `${name} Kl. ${jg}: Pro-Seite ohne Preise und Kaufknopf, nur „Für Eltern“`);
        await p.click('#pro-eltern'); await p.waitForSelector('#eltern-tor'); await tippe(p, await loesung(p));
        await p.waitForSelector('#pro-preise', { timeout: 5000 }).catch(() => {});
        ok(await p.locator('#pro-preise').count() === 1, `${name} Kl. ${jg}: nach dem Tor Pro-Seite mit Preisen`);
        ok(/Wer unter 18 ist, kauft nicht selbst\./.test(await p.evaluate(() => document.querySelector('.view').innerText)), `${name} Kl. ${jg}: Hinweis „Wer unter 18 ist, kauft nicht selbst.“`);
        // 10 Minuten offen: Shop-Link jetzt ohne zweites Tor
        const n0 = neu.length; await p.click('#pro-aktion a[href*="/produkt/"]'); await p.waitForTimeout(400);
        ok(await p.locator('#eltern-tor').count() === 0 && neu.length > n0, `${name} Kl. ${jg}: Tor bleibt offen (Shop ohne zweite Aufgabe)`);
      } else {
        ok(await p.locator('#pro-preise').count() === 1, `${name} Oberstufe: Preise sichtbar`);
        ok(/Wer unter 18 ist, kauft nicht selbst\./.test(t), `${name} Oberstufe: Hinweis „Wer unter 18 ist, kauft nicht selbst.“`);
        await p.click('#pro-aktion a[href*="/produkt/"]'); await p.waitForSelector('#eltern-tor');
        ok(/Hier geht es zum Shop\./.test(await p.textContent('#tor-grund')), `${name} Oberstufe: Shop nur über das Tor („Hier geht es zum Shop.“)`);
      }
      ok(!err.length, `${name} Kl. ${jg}: keine Skriptfehler (${err.join(' | ')})`);
      await c.close();
    }
    await b.close();
  }
} finally { srv.close(); }
console.log(fehler ? `${fehler} Fehler` : `tor: ${n} Prüfungen bestanden`);
if (fehler) process.exit(1);
