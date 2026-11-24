// Weg zur Probestunde (Recht V15) und Einstellungen hinter dem Eltern-Tor, im Browser (Chromium und WebKit). Aufruf: node tests/hinweise.mjs
import { createRequire } from 'node:module'; const { chromium, webkit } = createRequire(import.meta.url)('playwright');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { torFalls, einstellungenAuf } from './tor-hilfe.mjs';
const APP = new URL('../app/', import.meta.url).pathname;
const typ = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { const u = new URL(q.url, 'http://x');
  if (u.pathname.startsWith('/api/') || u.pathname.startsWith('/zaehler')) { r.setHeader('content-type', 'application/json'); r.statusCode = u.pathname === '/api/status' ? 200 : 204; return r.end(u.pathname === '/api/status' ? '{"ok":true,"premium":true}' : ''); }
  const f = path.join(APP, u.pathname === '/' ? 'index.html' : u.pathname); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.statusCode = 404; return r.end(); }
  r.setHeader('content-type', typ[path.extname(f)] || 'application/octet-stream'); fs.createReadStream(f).pipe(r); }).listen(0);
const BASE = `http://localhost:${srv.address().port}/`;
let n = 0, fehler = 0; const ok = (b, t) => { n++; if (!b) { fehler++; console.error('FEHLER:', t); } };
const SATZ = 'Du kommst hier gerade nicht weiter? Das ist okay. Probier eine leichtere Stufe oder schau dir die Erklärung noch einmal an. Und du kannst jederzeit deine Eltern oder deine Lehrkraft fragen.';
try {
  for (const [name, engine] of [['Chromium', chromium], ['WebKit', webkit]]) {
    const b = await engine.launch();
    for (const jg of ['8', '9', 'os']) {
      const c = await b.newContext({ serviceWorkers: 'block' }); const p = await c.newPage(); const err = [];
      p.on('pageerror', (e) => err.push(String(e)));
      await p.addInitScript((j) => { if (!localStorage.getItem('mathetrainer.v1')) localStorage.setItem('mathetrainer.v1', JSON.stringify({ jahrgang: j, stats: { Brüche: { ok: 2, bad: 10 } } })); }, jg);
      await p.goto(`${BASE}#/`); await p.waitForSelector('#home');
      const was = `${name} Kl. ${jg}`;
      // Funktionen aus hinweise.js (gleiche Daten im Speicher)
      const r = await p.evaluate(async (b) => { const H = await import(`${b}js/hinweise.js`); localStorage.removeItem('mathetrainer.hinweise');
        const kind = H.hilfeKind(), t1 = H.tippKl910(), t2 = H.tippKl910(), e1 = H.elternHinweis('Lea'), e2 = H.elternHinweis('Lea'); H.hinweiseSetzen(false); const e3 = H.elternHinweis('Lea'), t3 = H.tippKl910(Date.now() + 8 * 864e5); H.hinweiseSetzen(true);
        const spaeter = H.elternHinweis('Lea', Date.now() + 29 * 864e5); return { kind, t1, t2, e1, e2, e3, t3, spaeter }; }, BASE);
      ok(r.kind.includes(SATZ) && !/https?:|Probestunde|Eltern(bereich|-?bericht)/.test(r.kind.replace(SATZ, '')) && /Leichter üben/.test(r.kind) && /Erklärung ansehen/.test(r.kind), `${was}: Hilfesatz wörtlich, ohne Außenlink und ohne Probestunde`);
      if (jg === '9') ok(/Tipp: Wenn ein Thema länger hakt/.test(r.t1) && /Mehr erfahren/.test(r.t1) && r.t2 === '' && /data-anonym/.test(r.t1) && !/€/.test(r.t1), `${was}: Tipp Kl. 9–10, 1× pro Woche, anonym, ohne Preis`);
      else ok(r.t1 === '', `${was}: kein Tipp außerhalb Kl. 9–10`);
      ok(/In Brüche hat Lea in den letzten Wochen öfter Schwierigkeiten/.test(r.e1) && /Probestunde anfragen/.test(r.e1) && /data-hinweise-aus/.test(r.e1) && r.e2 === '' && r.e3 === '' && /In Brüche hat Lea/.test(r.spaeter), `${was}: Elternhinweis wörtlich; 1× in 4 Wochen je Thema; ausblendbar`);
      ok(jg !== '9' || r.t3 === '', `${was}: Tipp bei ausgeblendeten Hinweisen nie`);
      // Einstellungen: Schnell-Schalter frei, Eltern-Bereiche hinter dem Tor
      await p.goto(`${BASE}#/einstellungen`); await p.waitForSelector('#st-klang');
      const vor = await p.evaluate(() => ({ klang: !!document.querySelector('#st-klang')?.offsetParent, schrift: !!document.querySelector('#st-schrift, #st-skin')?.offsetParent, zaehl: !!document.querySelector('#st-zaehl-box')?.offsetParent, reset: !!document.querySelector('#st-reset')?.offsetParent, update: !!document.querySelector('#st-update')?.offsetParent, knopf: !!document.querySelector('#st-eltern-auf')?.offsetParent }));
      ok(vor.klang && vor.knopf && !vor.zaehl && !vor.reset && !vor.update, `${was}: Einstellungen: Klang frei; Zählung, Zurücksetzen, Update unsichtbar bis zum Tor (${JSON.stringify(vor)})`);
      await einstellungenAuf(p);
      const nach = await p.evaluate(() => ({ zaehl: !!document.querySelector('#st-zaehl-box')?.offsetParent, reset: !!document.querySelector('#st-reset')?.offsetParent, update: !!document.querySelector('#st-update')?.offsetParent, hin: !!document.querySelector('#st-hinweise')?.offsetParent }));
      ok(nach.zaehl && nach.reset && nach.hin, `${was}: nach dem Tor sichtbar: Zählung, Zurücksetzen, Hinweise-Schalter (Update-Knopf gibt es nur in der App) (${JSON.stringify(nach)})`);
      // Elternbericht, Elternbereich und Klassen-Code: Tor statt Inhalt
      for (const route of ['#/bericht', '#/eltern', '#/klasse']) { await p.reload(); await p.goto(`${BASE}${route}`); await p.waitForSelector('#eltern-tor');
        ok(/Für Eltern/.test(await p.textContent('#view')), `${was} ${route}: Tor mit Platzhalter statt Inhalt`);
        await p.click('#tor-abbrechen'); await p.waitForTimeout(300); ok(p.url().endsWith('#/'), `${was} ${route}: Abbrechen führt zur Startseite (${p.url()})`); }
      ok(!(await p.evaluate(() => /Vorlesen/.test(document.body.innerText))), `${was}: kein Vorlese-Knopf`);
      ok(!err.length, `${was}: keine Skriptfehler (${err.join(' | ')})`);
      await c.close();
    }
    await b.close();
  }
} finally { srv.close(); }
console.log(fehler ? `${fehler} Fehler` : `hinweise: ${n} Prüfungen bestanden`);
if (fehler) process.exit(1);
