// Umzug auf lernen.mathenachhilfe-online.com/mathetrainer/ im Browser (Chromium und WebKit), ohne echtes Netz:
// alte und neue Adresse werden per Routing aus app/ ausgeliefert, der Eltern-Server (/eltern/v1/s) ist nachgebaut.
// Geprüft: alte Schlüssel „mt.…“ → „mathetrainer.…“, Einmal-Sicherung verschlüsselt (kein Klartext beim Server),
// Weiterleitung mit #umzug=… und bisherigem Hash, Übernahme nur in leeren Speicher, danach DELETE und Hash weg,
// vorhandener Lernstand bleibt, ohne bereite neue Adresse keine Weiterleitung. Aufruf: node tests/umzug.mjs
import { createRequire } from 'node:module'; const { chromium, webkit } = createRequire(import.meta.url)('playwright');
import fs from 'node:fs'; import path from 'node:path';
const APP = new URL('../app/', import.meta.url).pathname;
const ALT = 'https://trainer-test.mathenachhilfe-online.com', NEU = 'https://lernen-test.mathenachhilfe-online.com';
const typ = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
let n = 0, fehler = 0; const ok = (b, t) => { n++; if (!b) { fehler++; console.error('FEHLER:', t); } };
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'Content-Type, X-Schreib', 'access-control-allow-methods': 'GET, PUT, DELETE, OPTIONS' };

async function lauf(engine, name, { neuBereit = true, neuHatSchon = false } = {}) {
  const ablage = new Map(), log = [];
  const b = await engine.launch(); const c = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  const datei = (route, rel) => { const f = path.join(APP, rel || 'index.html'); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) return route.fulfill({ status: 404, body: '' }); return route.fulfill({ status: 200, headers: { 'content-type': typ[path.extname(f)] || 'application/octet-stream' }, body: fs.readFileSync(f) }); };
  await c.route(/^https:\/\/(trainer-test|lernen-test)\.mathenachhilfe-online\.com\/.*/, async (route) => {
    const req = route.request(), u = new URL(req.url());
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS });
    const m = /^\/eltern\/v1\/s\/([\w-]{22})$/.exec(u.pathname);
    if (m && u.host.startsWith('trainer-test')) {
      log.push(`${req.method()} s`);
      if (req.method() === 'PUT') { ablage.set(m[1], { d: req.postData(), schreib: req.headers()['x-schreib'] }); return route.fulfill({ status: 204, headers: CORS }); }
      if (req.method() === 'GET') { const e = ablage.get(m[1]); return e ? route.fulfill({ status: 200, headers: { ...CORS, 'content-type': 'application/json' }, body: JSON.stringify({ d: e.d }) }) : route.fulfill({ status: 404, headers: CORS }); }
      if (req.method() === 'DELETE') { const e = ablage.get(m[1]); if (e && e.schreib === req.headers()['x-schreib']) ablage.delete(m[1]); return route.fulfill({ status: 204, headers: CORS }); }
    }
    if (u.pathname.startsWith('/api/') || u.pathname.startsWith('/zaehler/')) return route.fulfill({ status: u.pathname.startsWith('/api/') ? 404 : 204, headers: { ...CORS, 'content-type': 'application/json' }, body: '{}' });
    if (u.host.startsWith('lernen-test')) {
      if (!u.pathname.startsWith('/mathetrainer/')) return route.fulfill({ status: 404, body: '' });
      if (!neuBereit) return route.fulfill({ status: 404, body: '' });
      return datei(route, u.pathname.slice('/mathetrainer/'.length));
    }
    return datei(route, u.pathname.slice(1));
  });
  await c.route(/^https:\/\/(www|staging)\.mathenachhilfe-online\.com\/.*/, (r) => r.fulfill({ status: 200, body: 'ok' }));
  await c.addInitScript(([alt, neuHat]) => {
    if (location.host.startsWith('trainer-test') && !sessionStorage.getItem('vorbereitet')) {
      sessionStorage.setItem('vorbereitet', '1');
      localStorage.setItem('mt.v1', JSON.stringify({ jahrgangGewaehlt: true, jahrgang: '9', xp: 77, geraet: 'GERAET-ALT-123456789' }));
      localStorage.setItem('mt.look', 'dunkel');
      localStorage.setItem('fremd.app', 'bleibt');
    }
    if (location.host.startsWith('lernen-test') && neuHat && !localStorage.getItem('mathetrainer.v1')) localStorage.setItem('mathetrainer.v1', JSON.stringify({ jahrgangGewaehlt: true, jahrgang: '7', xp: 5 }));
    if (location.host.startsWith('lernen-test')) localStorage.setItem('andereapp.v1', 'fremd');
  }, [ALT, neuHatSchon]);
  const p = await c.newPage(); const err = []; p.on('pageerror', (e) => err.push(String(e)));
  await p.goto(`${ALT}/#/einstellungen`);
  let neuSeite = false;
  try { await p.waitForURL((u) => u.host.startsWith('lernen-test'), { timeout: neuBereit ? 20000 : 6000 }); neuSeite = true; } catch { /* bleibt */ }
  await p.waitForTimeout(neuBereit ? 3500 : 500);
  const ergebnis = { neuSeite, url: p.url(), log, ablage: ablage.size, err };
  if (neuSeite) {
    ergebnis.speicher = await p.evaluate(() => ({ v1: JSON.parse(localStorage.getItem('mathetrainer.v1') || 'null'), look: localStorage.getItem('mathetrainer.look'), alt: localStorage.getItem('mt.v1'), fremd: localStorage.getItem('andereapp.v1'), umzug: sessionStorage.getItem('mathetrainer-umzug') }));
    ergebnis.text = await p.textContent('body');
  } else {
    ergebnis.alt = await p.evaluate(() => ({ v1: localStorage.getItem('mathetrainer.v1'), mt: localStorage.getItem('mt.v1'), fremd: localStorage.getItem('fremd.app') }));
  }
  await b.close();
  return ergebnis;
}

for (const [name, engine] of [['Chromium', chromium], ['WebKit', webkit]]) {
  // 1) normaler Umzug: Lernstand reist mit, Hash bleibt, Sicherung wird danach gelöscht
  const a = await lauf(engine, name);
  ok(a.neuSeite && /^https:\/\/lernen-test\.mathenachhilfe-online\.com\/mathetrainer\/#\/einstellungen$/.test(a.url), `${name}: weitergeleitet, #umzug weg, bisheriger Hash bleibt (${a.url})`);
  ok(a.speicher?.v1?.xp === 77 && a.speicher.v1.jahrgang === '9' && a.speicher.look === 'dunkel', `${name}: Lernstand und Einstellungen übernommen (xp ${a.speicher?.v1?.xp})`);
  ok(a.speicher?.fremd === 'fremd' && a.speicher?.alt === null && a.speicher?.umzug === null, `${name}: Schlüssel anderer Apps unberührt, kein „mt.“-Schlüssel, Umzugs-Merker weg`);
  ok(a.log.join(',') === 'PUT s,GET s,DELETE s' && a.ablage === 0, `${name}: Einmal-Sicherung PUT → GET → DELETE (${a.log.join(',')}, übrig ${a.ablage})`);
  ok(!a.err.length, `${name}: keine Skriptfehler (${a.err.slice(0, 2).join(' | ')})`);
  // 2) neue Adresse hat schon einen Lernstand: nichts überschreiben
  const b = await lauf(engine, name, { neuHatSchon: true });
  ok(b.neuSeite && b.speicher?.v1?.xp === 5 && b.speicher.v1.jahrgang === '7', `${name}: vorhandener Lernstand an der neuen Adresse bleibt (xp ${b.speicher?.v1?.xp})`);
  ok(/schon einen Lernstand/.test(b.text || '') && b.ablage === 0, `${name}: Hinweis gezeigt und Sicherung trotzdem gelöscht`);
  // 3) neue Adresse liefert die App noch nicht aus: bleiben, nichts hochladen
  const c = await lauf(engine, name, { neuBereit: false });
  ok(!c.neuSeite && c.log.length === 0, `${name}: ohne bereite neue Adresse keine Weiterleitung und kein Upload (${c.url})`);
  ok(c.alt?.mt === null && JSON.parse(c.alt?.v1 || '{}').xp === 77 && c.alt?.fremd === 'bleibt', `${name}: alte Schlüssel umbenannt („mt.v1“ → „mathetrainer.v1“), fremde unberührt`);
}
// Klartext darf nie beim Server liegen: Format der Sicherung „iv.geheimtext“ – geprüft in run.mjs über einpacken()
console.log(fehler ? `${fehler} Fehler` : `umzug: ${n} Prüfungen bestanden (Chromium und WebKit)`);
if (fehler) process.exit(1);
