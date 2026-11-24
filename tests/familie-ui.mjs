// Familien-Speicher in der App (Chromium und WebKit), gegen den nachgebauten Server (familie-mock.mjs): Einwilligung (Recht A6), Anlegen, Beitreten
// mit zweitem Gerät, Sicherheitshinweis (V8), Stand ohne Zugangscode, Löschen mit Familien-Nummer, „Familie weg“ auf dem zweiten Gerät.
// Aufruf: node tests/familie-ui.mjs
import { createRequire } from 'node:module'; const { chromium, webkit } = createRequire(import.meta.url)('playwright');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { einstellungenAuf } from './tor-hilfe.mjs';
import { server } from './familie-mock.mjs';
const F = await import('../app/js/familie.js');
const APP = new URL('../app/', import.meta.url).pathname;
const typ = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { const u = new URL(q.url, 'http://x');
  if (u.pathname.startsWith('/api/') || u.pathname.startsWith('/zaehler')) { r.setHeader('content-type', 'application/json'); r.statusCode = u.pathname === '/api/status' ? 200 : 204; return r.end(u.pathname === '/api/status' ? '{"ok":true,"premium":true}' : ''); }
  const f = path.join(APP, u.pathname === '/' ? 'index.html' : u.pathname); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.statusCode = 404; return r.end(); }
  r.setHeader('content-type', typ[path.extname(f)] || 'application/octet-stream'); fs.createReadStream(f).pipe(r); }).listen(0);
const BASE = `http://localhost:${srv.address().port}/`;
let n = 0, fehler = 0; const ok = (b, t) => { n++; if (!b) { fehler++; console.error('FEHLER:', t); } };
const PFLICHT = 'Eure Lernstände werden verschlüsselt auf unserem Server in Deutschland gespeichert. Der Schlüssel liegt auf euren Geräten. Damit wir euch helfen können, falls ihr den Familien-Zugang verliert, hinterlegen wir zusätzlich eine verschlüsselte Notfall-Kopie. Sie lässt sich nur mit einem getrennt und offline aufbewahrten Schlüssel von Mathenachhilfe Online öffnen. Technisch könnten wir damit eure Lernstände lesen; wir tun das nicht und nutzen ihn nur, wenn ihr uns um Wiederherstellung bittet. Jede Wiederherstellung seht ihr hier im Protokoll.';
const SICHER = 'Wer den Familien-Link oder den QR-Code hat, kann die Lernstände eurer Familie öffnen, ändern und löschen. Teilt ihn nur mit Personen, denen ihr vertraut, und bewahrt das Notfall-Blatt sicher auf.';
const KANON = { 'x-schreib': 'X-Schreib', 'x-notfall-pruef': 'X-Notfall-Pruef', 'if-match': 'If-Match', 'content-type': 'Content-Type' };
async function anschliessen(ctx, S) {
  await ctx.route('**/familie/v1/**', async (route) => { const rq = route.request(), h = {}; for (const [k, v] of Object.entries(rq.headers())) h[KANON[k] || k] = v;
    const r = await S.f(rq.url(), { method: rq.method(), headers: h, body: rq.postData() || undefined }); const body = r.status === 204 ? undefined : JSON.stringify(await r.json());
    await route.fulfill({ status: r.status, contentType: 'application/json', body }); });
}
try {
  for (const [name, engine] of [['Chromium', chromium], ['WebKit', webkit]]) {
    const b = await engine.launch(); const S = server();
    const c1 = await b.newContext({ serviceWorkers: 'block' }), c2 = await b.newContext({ serviceWorkers: 'block' });
    await anschliessen(c1, S); await anschliessen(c2, S);
    const p1 = await c1.newPage(), p2 = await c2.newPage(), err = [];
    for (const p of [p1, p2]) p.on('pageerror', (e) => err.push(String(e)));
    await p1.addInitScript(() => { if (!localStorage.getItem('mathetrainer.v1')) localStorage.setItem('mathetrainer.v1', JSON.stringify({ jahrgang: '8', xp: 777, geraet: 'GERAET-EINS-1234567890', zugang: { code: 'MT-AB23-CD45-EF67', art: 'tage30', bis: '2099-01-01', ki: true } })); });
    await p2.addInitScript(() => { if (!localStorage.getItem('mathetrainer.v1')) localStorage.setItem('mathetrainer.v1', JSON.stringify({ jahrgang: '8', xp: 5, geraet: 'GERAET-ZWEI-1234567890' })); });
    // Gerät 1: Familie anlegen
    await p1.goto(`${BASE}#/einstellungen`); await einstellungenAuf(p1); await p1.waitForSelector('#fa-neu');
    ok(S.log.length === 0, `${name}: vor der Einwilligung keine Server-Anfrage`);
    await p1.click('#fa-neu'); await p1.waitForSelector('#fa-ok');
    ok((await p1.textContent('.fa-einw p')).trim() === PFLICHT, `${name}: Pflichttext wörtlich`);
    ok(/Mehr dazu in der Datenschutzerklärung \(Abschnitt 10m\)/.test(await p1.textContent('.fa-einw')) && (await p1.textContent('#fa-ok')) === 'Einverstanden – Familie anlegen', `${name}: Link zu 10m und Knopf „Einverstanden – Familie anlegen“`);
    ok(S.log.length === 0 && await p1.locator('.fa-einw input[type=checkbox]').count() === 0, `${name}: nichts vorausgewählt, noch keine Anfrage`);
    await p1.fill('#fa-name', 'Lea'); await p1.click('#fa-ok'); await p1.waitForSelector('#fa-nr', { timeout: 15000 });
    const z1 = await p1.evaluate(() => JSON.parse(localStorage.getItem('mathetrainer.familie')));
    ok(S.fam.size === 1 && z1.famKey && z1.kindId, `${name}: Familie angelegt, Schlüssel nur im Gerät`);
    ok(await p1.locator('#familie .fa-sicher').count() >= 1 && (await p1.textContent('#familie .fa-sicher')).trim() === SICHER, `${name}: Sicherheitshinweis dauerhaft auf der Familien-Seite`);
    await p1.click('#familie summary:has-text("Link, QR-Code")'); await p1.waitForSelector('#fa-qr, #fa-notfall');
    ok(await p1.locator('#fa-blatt .fa-sicher').count() === 3, `${name}: Sicherheitshinweis bei Link, QR-Code und Notfall-Blatt (${await p1.locator('#fa-blatt .fa-sicher').count()})`);
    await p1.waitForFunction(() => document.querySelector('#fa-notfall')?.textContent.includes('Familien-Nummer'));
    // Stand liegt verschlüsselt auf dem Server, ohne Zugangscode und Geräte-Kennung
    const fid = z1.famId, ent = S.fam.get(fid); const blob = [...ent.blobs].find(([k]) => k.startsWith('/s/mathetrainer/'));
    ok(!!blob, `${name}: Stand von Gerät 1 liegt auf dem Server`);
    const klar = blob ? await F.entschluesseln(blob[1].d, z1.famKey, `lernapps/v1/mathetrainer/${z1.kindId}`) : null;
    const v1 = klar?.daten?.['mathetrainer.v1'];
    ok(v1?.xp === 777 && !v1.zugang && !v1.geraet, `${name}: Stand ohne Zugangscode (Rechte) und ohne Geräte-Kennung, xp 777`);
    ok(!JSON.stringify(blob?.[1]).includes('777') && !JSON.stringify(blob?.[1]).includes('GERAET'), `${name}: Server sieht keinen Klartext`);
    // Gerät 2: beitreten
    const link = `https://lernen.mathenachhilfe-online.com/mathetrainer/#familie=${z1.famId}.${z1.famKey}.${z1.schreib}`;
    await p2.goto(`${BASE}#/einstellungen`); await einstellungenAuf(p2); await p2.waitForSelector('#fa-bei'); await p2.click('#fa-bei'); await p2.waitForSelector('#fa-link');
    const vorher = S.log.length; await p2.fill('#fa-link', link);
    ok(S.log.length === vorher && (await p2.textContent('#fa-ok')) === 'Einverstanden – Familie beitreten', `${name}: Beitreten erst nach „Einverstanden – Familie beitreten“`);
    await p2.click('#fa-ok'); await p2.waitForFunction(() => JSON.parse(localStorage.getItem('mathetrainer.v1') || '{}').xp === 777, null, { timeout: 15000 }).catch(() => {});
    const z2 = await p2.evaluate(() => ({ v1: JSON.parse(localStorage.getItem('mathetrainer.v1')), fam: JSON.parse(localStorage.getItem('mathetrainer.familie') || 'null') }));
    ok(z2.v1.xp === 777 && z2.v1.geraet === 'GERAET-ZWEI-1234567890' && !z2.v1.zugang, `${name}: Gerät 2 hat den Stand (xp 777), behält die eigene Geräte-Kennung, bekommt keinen Zugangscode`);
    ok(z2.fam?.famId === z1.famId, `${name}: Gerät 2 ist in der Familie`);
    // Löschen mit Familien-Nummer auf Gerät 1
    await p1.reload(); await einstellungenAuf(p1); await p1.waitForSelector('#fa-nr');
    await p1.click('#familie summary:has-text("Familie löschen")');
    ok(/Das löscht die Familie in ALLEN Lern-Apps: alle Lernstände aller Kinder auf unserem Server, die Notfall-Kopie und das Protokoll\. Gekaufte Codes werden wieder frei und lassen sich in einer neuen Familie erneut einlösen\. Die Lernstände auf diesem Gerät bleiben erhalten\./.test(await p1.textContent('#familie')), `${name}: Löschen-Warnung wörtlich`);
    ok(await p1.locator('#fa-loeschen').isDisabled(), `${name}: Löschen gesperrt, bis die Familien-Nummer getippt ist`);
    await p1.fill('#fa-loesch-nr', 'FALSCH-00'); await p1.click('#fa-loeschen', { timeout: 1500 }).catch(() => {});
    ok(S.fam.size === 1, `${name}: falsche Nummer löscht nichts`);
    const nr = await p1.textContent('#fa-nr'); await p1.fill('#fa-loesch-nr', nr.toLowerCase()); await p1.click('#fa-loeschen'); await p1.waitForSelector('#fa-neu', { timeout: 15000 });
    ok(S.fam.size === 0 && await p1.evaluate(() => localStorage.getItem('mathetrainer.familie') === null && JSON.parse(localStorage.getItem('mathetrainer.v1')).xp === 777), `${name}: Familie gelöscht; im Gerät nur die Schlüssel weg, Lernstand bleibt`);
    // Gerät 2: 404 → „Diese Familie gibt es nicht mehr.“
    await p2.reload(); await einstellungenAuf(p2); await p2.waitForSelector('#fa-laden'); await p2.click('#fa-laden');
    await p2.waitForSelector('#fa-neu', { timeout: 15000 });
    ok(/Diese Familie gibt es nicht mehr\. Lernstand bleibt auf diesem Gerät\./.test(await p2.textContent('#familie')) && (await p2.evaluate(() => JSON.parse(localStorage.getItem('mathetrainer.v1')).xp)) === 777, `${name}: Gerät 2: „Diese Familie gibt es nicht mehr. Lernstand bleibt auf diesem Gerät.“`);
    // ohne Einwilligung keine Familie
    const keine = await p2.evaluate(async (b) => { const FS = await import(`${b}js/familie-sync.js`); return [await FS.anlegen({}), await FS.beitreten('x', {})]; }, BASE).catch(() => null);
    ok(!keine || (keine[0].grund === 'einwilligung' && keine[1].grund === 'einwilligung'), `${name}: ohne ausdrückliche Einwilligung wird nichts angelegt`);
    ok(!err.length, `${name}: keine Skriptfehler (${err.join(' | ')})`);
    await c1.close(); await c2.close(); await b.close();
  }
} finally { srv.close(); }
console.log(fehler ? `${fehler} Fehler` : `familie-ui: ${n} Prüfungen bestanden`);
if (fehler) process.exit(1);
