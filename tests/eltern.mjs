// Rundlauf „Eltern-Handy koppeln“ (Marcel 18.11.2026) in Chromium und WebKit (Safari):
// koppeln → Bericht verschlüsselt per PUT → mit dem Schlüssel aus dem Eltern-Link entschlüsseln und prüfen → fremdes „schreib“ = 403
// → Sicherung (PUT /s/) → zweites Gerät stellt über den Kopplungs-Link denselben Lernstand wieder her und schreibt weiter (204)
// → aufheben (DELETE) → Bericht und Sicherung weg, Kopplung im Gerät weg. Der Server ist hier nachgestellt, genau nach der Spezifikation des Leitstands.
// Aufruf: node tests/eltern.mjs
import { createRequire } from 'node:module'; const { chromium, webkit } = createRequire(import.meta.url)('playwright');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { webcrypto as wc } from 'node:crypto';
const APP = new URL('../app/', import.meta.url).pathname;
const typ = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
const ablage = new Map(), sicher = new Map(); const log = [];
const srv = http.createServer((q, r) => { const u = new URL(q.url, 'http://x');
  const ms = /^\/eltern\/v1\/s\/([\w-]{22})$/.exec(u.pathname);
  if (ms) { let body = ''; q.on('data', (c) => { body += c; }); q.on('end', () => {
    const da = sicher.get(ms[1]), schreib = q.headers['x-schreib'] || ''; log.push({ art: `S-${q.method}`, id: ms[1], laenge: body.length });
    if (q.method === 'GET') { if (!da) { r.statusCode = 404; return r.end(); } r.setHeader('content-type', 'application/json'); return r.end(JSON.stringify({ d: da.body, t: da.t })); }
    const b = ablage.get(ms[1]); if ((da && da.schreib !== schreib) || (b && b.schreib !== schreib)) { r.statusCode = 403; return r.end(); }
    if (q.method === 'PUT') { if (body.length > 512 * 1024 || !/^[\w-]{16}\.[\w-]+$/.test(body)) { r.statusCode = 400; return r.end(); } sicher.set(ms[1], { schreib, body, t: new Date().toISOString() }); r.statusCode = 204; return r.end(); }
    if (q.method === 'DELETE') { sicher.delete(ms[1]); r.statusCode = 204; return r.end(); }
    r.statusCode = 405; r.end(); }); return; }
  const m = /^\/eltern\/v1\/b\/([\w-]{22})$/.exec(u.pathname);
  if (m) { let body = ''; q.on('data', (c) => { body += c; }); q.on('end', () => {
    const da = ablage.get(m[1]), schreib = q.headers['x-schreib'] || ''; log.push({ art: q.method, id: m[1], laenge: body.length, typ: q.headers['content-type'] || '' });
    if (da && da.schreib !== schreib) { r.statusCode = 403; return r.end(); }
    if (q.method === 'PUT') { if (body.length > 24 * 1024 || !/^[\w-]{16}\.[\w-]+$/.test(body)) { r.statusCode = 400; return r.end(); } ablage.set(m[1], { schreib, body }); r.statusCode = 204; return r.end(); }
    if (q.method === 'DELETE') { ablage.delete(m[1]); sicher.delete(m[1]); r.statusCode = 204; return r.end(); }
    r.statusCode = 405; r.end(); }); return; }
  if (u.pathname.startsWith('/api/')) { r.setHeader('content-type', 'application/json'); r.statusCode = 404; return r.end('{}'); }
  const f = path.join(APP, u.pathname === '/' ? 'index.html' : u.pathname); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.statusCode = 404; return r.end(); }
  r.setHeader('content-type', typ[path.extname(f)] || 'application/octet-stream'); fs.createReadStream(f).pipe(r); }).listen(0);
const BASE = `http://localhost:${srv.address().port}/`;
let n = 0, fehler = 0; const ok = (b, t) => { n++; if (!b) { fehler++; console.error('FEHLER:', t); } };
const b64 = (s) => Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
async function entschluesseln(text, keyB64) {
  const [iv, ct] = text.split('.'); const key = await wc.subtle.importKey('raw', b64(keyB64), { name: 'AES-GCM' }, false, ['decrypt']);
  return JSON.parse(new TextDecoder().decode(await wc.subtle.decrypt({ name: 'AES-GCM', iv: b64(iv) }, key, b64(ct))));
}
try {
  for (const [name, engine] of [['Chromium', chromium], ['WebKit', webkit]]) {
    ablage.clear(); sicher.clear(); log.length = 0;
    const b = await engine.launch(); const c = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' }); const p = await c.newPage();
    const err = []; p.on('pageerror', (e) => err.push(String(e)));
    await c.addInitScript(() => { if (!localStorage.getItem('mathetrainer.v1')) localStorage.setItem('mathetrainer.v1', JSON.stringify({ jahrgangGewaehlt: true, jahrgang: 'os', stats: { Ableitung: { ok: 9, bad: 1 }, Binomialverteilung: { ok: 2, bad: 4 } }, xp: 420, geraet: 'GERAET-KENNUNG-ALT-12345', monate: { '2026-10': { ms: 1800000, aufgaben: 40, richtig: 30 } } })); });
    await p.goto(`${BASE}#/mehr`); await p.waitForSelector('a[href="#/eltern"]');
    await p.click('a[href="#/eltern"]'); await p.waitForSelector('#el-los');
    await p.fill('#el-name', 'Lea'); await p.click('#el-los');
    await p.waitForSelector('#el-qr svg', { timeout: 10000 });
    await p.waitForFunction(() => /Zuletzt gesendet/.test(document.querySelector('#el-status')?.textContent || ''), null, { timeout: 10000 });
    const k = await p.evaluate(() => JSON.parse(localStorage.getItem('mathetrainer.eltern')));
    const link = await p.evaluate(async () => (await import('./js/eltern.js')).elternLink());
    ok(/^[\w-]{22}$/.test(k.id) && /^[\w-]{22}$/.test(k.schreib) && /^[\w-]{43}$/.test(k.key), `${name}: id 22, schreib 22, key 43 Zeichen (base64url)`);
    ok(link === `https://staging.mathenachhilfe-online.com/eltern-bericht/#${k.id}.${k.key}`, `${name}: Eltern-Link auf der Test-Stufe (${link.slice(0, 60)}…)`);
    const put = log.find((x) => x.art === 'PUT');
    ok(put && put.id === k.id && /text\/plain/.test(put.typ) && put.laenge < 24 * 1024, `${name}: PUT /eltern/v1/b/<id> als text/plain unter 24 KB`);
    const roh = ablage.get(k.id)?.body || '';
    ok(!/Lea|Ableitung|mathetrainer/.test(roh) && /^[\w-]{16}\./.test(roh), `${name}: Der Server sieht nur Geheimtext (IV 16 Zeichen)`);
    const B = await entschluesseln(roh, k.key);
    ok(B.format === 1 && B.app === 'mathetrainer' && B.appName === 'Mathe-Trainer' && !Number.isNaN(Date.parse(B.stand)), `${name}: Pflichtfelder format, app, appName, stand`);
    ok(B.name === 'Lea' && B.klasse === 'Oberstufe' && Array.isArray(B.staerken) && Array.isArray(B.schwach) && Array.isArray(B.fortschritt) && Array.isArray(B.letzte), `${name}: Bericht mit Spitzname, Klasse, Stärken, Schwächen, Fortschritt`);
    ok(B.staerken.some((s) => s.titel === 'Ableitung' && s.prozent === 90 && s.thema === 'analysis') && B.schwach.some((s) => s.titel === 'Binomialverteilung' && s.thema === 'stochastik' && s.tipp), `${name}: Stärken und Problemstellen mit Thema und Tipp`);
    const erlaubt = ['format', 'app', 'appName', 'name', 'klasse', 'stand', 'zeitraum', 'lernzeitMin', 'tageAktiv', 'aufgaben', 'richtigProzent', 'staerken', 'schwach', 'fortschritt', 'letzte', 'verlauf', 'klassenarbeit', 'hinweis'];
    ok(Object.keys(B).every((x) => erlaubt.includes(x)), `${name}: keine weiteren Felder (${Object.keys(B).filter((x) => !erlaubt.includes(x)).join(', ')})`);
    ok(Array.isArray(B.verlauf) && B.verlauf[0]?.monat === '2026-10' && B.verlauf[0].min === 30 && B.verlauf[0].richtigProzent === 75, `${name}: Monatsverlauf im Bericht (${JSON.stringify(B.verlauf)})`);
    // Sicherung: ging mit dem Bericht hoch, verschlüsselt, mit schreib, ohne Geräte-Kennung
    ok(sicher.has(k.id) && !/Ableitung|GERAET/.test(sicher.get(k.id).body), `${name}: Sicherung hochgeladen (nur Geheimtext)`);
    const S = await entschluesseln(sicher.get(k.id).body, k.key);
    ok(S.format === 1 && S.app === 'mathe-trainer' && S.schreib === k.schreib && S.daten['mathetrainer.v1']?.stats?.Ableitung?.ok === 9 && !S.daten['mathetrainer.v1'].geraet && !S.daten['mathetrainer.eltern'], `${name}: Sicherung enthält Lernstand und schreib, keine Geräte-Kennung, keine Kopplungsschlüssel`);
    const vorher = log.filter((x) => x.art === 'S-PUT').length; await p.click('#el-senden'); await p.waitForTimeout(800);
    ok(log.filter((x) => x.art === 'S-PUT').length === vorher, `${name}: Sicherung nur bei Änderung`);
    // zweites Gerät (anderes Profil): Link einfügen → derselbe Lernstand → schreibt weiter
    const c2 = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' }); const p2 = await c2.newPage(); p2.on('pageerror', (e) => err.push(`Gerät 2: ${e}`));
    await p2.goto(`${BASE}#/eltern`); await p2.waitForSelector('#el-los'); await p2.click('.el-wieder summary');
    await p2.fill('#el-wieder-link', 'https://staging.mathenachhilfe-online.com/eltern-bericht/#AAAAAAAAAAAAAAAAAAAAAA.' + 'B'.repeat(43)); await p2.click('#el-wieder-los');
    await p2.waitForFunction(() => /Keine Sicherung gefunden/.test(document.querySelector('#el-wieder-note')?.textContent || ''));
    ok(true, `${name}: unbekannter Link → „Keine Sicherung gefunden“`);
    await p2.fill('#el-wieder-link', link); await p2.click('#el-wieder-los');
    await p2.waitForFunction(() => document.readyState === 'complete' && !!localStorage.getItem('mathetrainer.eltern') && /Eltern-Handy gekoppelt/.test(document.body.innerText), null, { timeout: 15000 }).catch(() => {});
    await p2.waitForTimeout(1200); await p2.goto(`${BASE}#/eltern`); await p2.waitForSelector('#el-senden', { timeout: 10000 });
    const v2 = await p2.evaluate(() => ({ v: JSON.parse(localStorage.getItem('mathetrainer.v1')), e: JSON.parse(localStorage.getItem('mathetrainer.eltern')) }));
    ok(v2.v.stats?.Ableitung?.ok === 9 && v2.v.xp === 420 && v2.v.geraet !== 'GERAET-KENNUNG-ALT-12345' && v2.e.id === k.id && v2.e.schreib === k.schreib, `${name}: neues Gerät hat denselben Lernstand und ist wieder gekoppelt`);
    const puts = log.filter((x) => x.art === 'PUT').length; await p2.click('#el-senden');
    await p2.waitForFunction(() => /Zuletzt gesendet/.test(document.querySelector('#el-status')?.textContent || ''), null, { timeout: 10000 });
    ok(log.filter((x) => x.art === 'PUT').length === puts + 1, `${name}: neues Gerät schreibt weiter (204)`);
    await c2.close();
    // fremdes schreib → 403 → „gilt nicht mehr“
    await p.evaluate(() => { const k = JSON.parse(localStorage.getItem('mathetrainer.eltern')); k.schreib = 'AAAAAAAAAAAAAAAAAAAAAA'; localStorage.setItem('mathetrainer.eltern', JSON.stringify(k)); });
    await p.click('#el-senden'); await p.waitForFunction(() => /gilt nicht mehr/.test(document.querySelector('#el-status')?.textContent || ''), null, { timeout: 10000 });
    ok(ablage.get(k.id)?.body !== undefined, `${name}: fremdes „schreib“ wird abgewiesen (403), der Bericht bleibt unverändert`);
    await p.evaluate((s) => { const k = JSON.parse(localStorage.getItem('mathetrainer.eltern')); k.schreib = s; localStorage.setItem('mathetrainer.eltern', JSON.stringify(k)); }, k.schreib);
    await p.click('#el-weg'); await p.waitForSelector('#el-los', { timeout: 10000 });
    ok(log.some((x) => x.art === 'DELETE' && x.id === k.id) && !ablage.has(k.id) && !sicher.has(k.id) && !(await p.evaluate(() => localStorage.getItem('mathetrainer.eltern'))), `${name}: Kopplung aufheben löscht Bericht und Sicherung (DELETE) und die Schlüssel im Gerät`);
    // Einstellungen zeigen die Karte auch
    await p.goto(`${BASE}#/einstellungen`); await p.waitForSelector('#eltern #el-los');
    ok(!(await p.evaluate(() => document.documentElement.scrollWidth - innerWidth > 1)), `${name}: nichts ragt über den Rand`);
    await p.setViewportSize({ width: 360, height: 800 }); await p.goto(`${BASE}#/eltern`); await p.waitForSelector('#el-los');
    ok(await p.evaluate(() => [...document.querySelectorAll('#eltern button')].every((b) => b.getBoundingClientRect().height < 2.2 * parseFloat(getComputedStyle(b).lineHeight) + 30)), `${name}: Knöpfe brechen bei 360 px nicht um`);
    ok(!err.length, `${name}: keine Skriptfehler (${err.slice(0, 2).join(' | ')})`);
    await b.close();
  }
} finally { srv.close(); }
console.log(fehler ? `${fehler} Fehler` : `eltern: ${n} Prüfungen bestanden (Chromium und WebKit)`);
if (fehler) process.exit(1);
