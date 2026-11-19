// Durchklick-Prüfung: sucht Abstürze, leere Seiten und Sackgassen, die beim „Herumklicken“ entstehen.
// Aufruf: node tests/klick.mjs   (App unter http://localhost:8123, wie bei e2e.mjs)
//   JG=5,7   nur diese Klassenstufen   ·   N=350   Zahl der Zufalls-Klicks   ·   STAND=1   mit angefangenem Lernstand
// Bekannte Fehlalarme: Spiele mit Zeichenfläche („nichts zum Tippen“), Boss-Schritte mit kürzerer Aufgabe („weniger Inhalt“).
import { createRequire } from 'node:module';
const { chromium, devices } = createRequire(import.meta.url)('playwright');
const B = process.env.BASE || 'http://localhost:8123/', probleme = [];
const b = await chromium.launch();
const neu = async (jg) => { const c = await b.newContext({ ...devices['Pixel 7'], serviceWorkers: 'block' }); await c.route('**/api/**', (r) => r.fulfill({ json: { ok: true, stufe: 'live', ki: false } }));
  const p = await c.newPage(); p.wo = ''; p.on('pageerror', (e) => probleme.push(`[${jg}] FEHLER ${p.wo}: ${e.message.slice(0, 160)}`)); p.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) probleme.push(`[${jg}] Konsole ${p.wo}: ${m.text().slice(0, 160)}`); });
  p.on('dialog', (d) => d.dismiss());
  await p.goto(B); await p.evaluate((x) => localStorage.setItem('mathetrainer.v1', JSON.stringify({ jahrgang: x })), jg); await p.reload(); await p.waitForSelector('#home');
  if (process.env.STAND) { await p.evaluate(async () => { const U = await import('./js/units.js'); const done = {}; U.UNITS.slice(0, 2).forEach((u, k) => u.steps.forEach((s, i) => { if (k === 0 || i < 3) done[`${u.id}/${s.id}`] = 1 + ((i + k) % 3); }));
      const d = new Date(), tag = (n) => { const x = new Date(d); x.setDate(x.getDate() + n); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };
      const m = JSON.parse(localStorage.getItem('mathetrainer.v1')); Object.assign(m, { done, xp: 640, last: U.UNITS[1].id, streak: { n: 3, last: tag(0) }, stats: { Terme: { ok: 2, bad: 5, last: tag(0) }, Prozent: { ok: 6, bad: 1, last: tag(-1) } }, kartei: { genLinGl: { topic: 'Gleichungen', step: 0, due: tag(0) }, genProzent: { topic: 'Prozent', step: 1, due: tag(-1) } },
        runs: [{ kind: 'blitz', score: 120, correct: 9, total: 11, date: tag(-1) }], exams: [{ date: tag(-2), np: 9, part: 'A', score: 60 }], badges: { erster: tag(-3) }, count: { ueben: 4, kopf_mal: 12, knobelTag: 20200101 }, outfit: { hut: 'kappe', brille: 'rund' }, abi: tag(40), land: 'BY',
        arbeit: { datum: tag(4), units: U.UNITS.slice(0, 3).map((u) => u.id) }, week: { key: '', days: [], claimed: false }, lernStand: {}, einstufung: null });
      localStorage.setItem('mathetrainer.v1', JSON.stringify(m)); }); await p.reload(); await p.waitForSelector('#home'); }
  return p; };
const zustand = (p) => p.evaluate(() => { const v = document.querySelector('#app .view, main .view, .view'); const sheet = document.querySelector('#sheet');
  return { hash: location.hash, text: (v?.innerText || '').trim().length, breit: document.documentElement.scrollWidth - innerWidth, undef: /undefined|NaN|\[object/.test(v?.innerText || ''), sheet: sheet && !sheet.hidden,
    weg: !!document.querySelector('#nav:not([hidden]) a, .view a.back, .view .x, .view a[href^="#/"]') }; });
const pruefe = async (p, jg, was) => { p.wo = was; await p.waitForTimeout(120); const z = await zustand(p);
  if (z.text < 15) probleme.push(`[${jg}] LEER ${was} (${z.hash})`); if (z.breit > 1) probleme.push(`[${jg}] ZU BREIT ${was} (${z.breit}px)`); if (z.undef) probleme.push(`[${jg}] „undefined/NaN“ im Text ${was}`); if (!z.weg) probleme.push(`[${jg}] KEIN WEG ZURÜCK ${was}`); return z; };
const los = async (p, h) => { await p.evaluate((x) => { location.hash = x; }, h); };

for (const jg of (process.env.JG || '5,6,7,8,9,10,os').split(',')) {
  const p = await neu(jg);
  const info = await p.evaluate(async () => { const U = await import('./js/units.js'); return { units: U.UNITS.map((u) => ({ id: u.id, n: u.steps.length, kinds: u.steps.map((s) => s.kind) })), areas: [...new Set(U.UNITS.map((u) => u.area))] }; });
  // 1) Alle Seiten: öffnen, neu laden (Tiefen-Link), zurück
  const seiten = ['#/', '#/lernen', '#/pruefung', '#/mehr', '#/kopf', '#/arbeit', '#/einstellungen', '#/bericht', '#/erfolge', '#/formeln', '#/wiederholen', '#/karten', '#/theorie', '#/blatt', '#/stufe', '#/pro', '#/lehrplan', '#/blitz', '#/tag', '#/duell', '#/abi', '#/plan', '#/karte', '#/abenteuer', '#/aufgabe', '#/einstufung', '#/klasse', '#/zertifikat', '#/kiaufgabe', '#/gibtsnicht',
    ...info.areas.flatMap((a) => [`#/g/${a}`, `#/ueben/${a}`]), ...info.units.map((u) => `#/u/${u.id}`), ...info.units.map((u) => `#/theorie/${u.id}`)];
  for (const h of seiten) { await los(p, h); await pruefe(p, jg, h); }
  for (const h of ['#/kopf', '#/arbeit', `#/u/${info.units[0].id}/0`, `#/u/${info.units.at(-1).id}/1`, '#/einstellungen', `#/g/${info.areas[0]}`]) { await los(p, h); await p.reload(); await p.waitForTimeout(250); await pruefe(p, jg, `neu geladen ${h}`); }
  // 2) Jeder Schritt jeder Einheit: öffnen, etwas tippen, raus, wieder rein – muss wieder sauber starten
  for (const u of info.units) for (let i = 0; i < u.n; i++) { const h = `#/u/${u.id}/${i}`;
    await los(p, h); const z1 = await pruefe(p, jg, h);
    const tipp = async () => { const k = p.locator('#stage button:visible, #stage input[type=range]:visible, #stage .opt:visible, #stage svg [role=button]:visible'); const n = await k.count(); for (let t = 0; t < Math.min(3, n); t++) { try { await k.nth((t * 7) % n).click({ timeout: 800, force: true }); } catch { /* verdeckt */ } } };
    await tipp(); await pruefe(p, jg, `${h} nach Tippen`);
    await los(p, `#/u/${u.id}`); await pruefe(p, jg, `zurück aus ${h}`);
    await los(p, h); const z2 = await pruefe(p, jg, `wieder rein ${h}`);
    if (z2.text < z1.text * 0.5) probleme.push(`[${jg}] NACH WIEDER-REIN WENIGER INHALT ${h} (${z1.text} → ${z2.text})`);
    const bedienbar = await p.locator('#stage button:visible, #stage input:visible, #stage .opt:visible, #stage [role=button]:visible, .view .btn:visible').count(); if (!bedienbar) probleme.push(`[${jg}] NICHTS ZUM TIPPEN nach Wieder-Rein ${h}`);
    await tipp(); await p.goBack(); await p.waitForTimeout(80); await pruefe(p, jg, `Zurück-Taste aus ${h}`); await p.goForward(); await pruefe(p, jg, `Vor-Taste nach ${h}`);
    if ((await zustand(p)).sheet) { await p.keyboard.press('Escape'); } }
  // 3) Mitten im Lauf raus: Kopfrechnen, Blitz, Themen-Mix – danach dürfen keine Fehler nachlaufen
  await los(p, '#/kopf'); await p.click('.kopf-art'); await p.click('#kopf-tasten [data-t="3"]'); await los(p, '#/'); await p.waitForTimeout(1500); await pruefe(p, jg, 'aus laufender Kopfrechen-Runde');
  await p.keyboard.press('5'); await p.keyboard.press('Backspace');
  await los(p, '#/kopf'); await pruefe(p, jg, 'Kopfrechnen wieder rein'); if (!(await p.locator('.kopf-art').count())) probleme.push(`[${jg}] Kopfrechen-Arena zeigt nach Wieder-Rein keine Auswahl`);
  await los(p, '#/arbeit'); await p.waitForSelector('#ar-datum, #ar-neu'); if (!(await p.locator('#ar-datum').count())) { await pruefe(p, jg, 'Klassenarbeits-Plan mit Lernstand'); await p.click('#ar-neu'); await p.waitForSelector('#ar-datum'); } const dat = await p.evaluate(() => { const d = new Date(); d.setDate(d.getDate() + 5); return d.toISOString().slice(0, 10); }); await p.fill('#ar-datum', dat); await p.locator('#ar-themen .check').first().click(); await p.click('#ar-los'); await p.waitForSelector('#ar-neu');
  if (await p.locator('#ar-mix').count()) { await p.click('#ar-mix'); await p.waitForTimeout(200); await los(p, '#/'); await los(p, '#/arbeit'); await pruefe(p, jg, 'Klassenarbeit nach Abbruch im Mix'); if (!(await p.locator('#ar-neu').count())) probleme.push(`[${jg}] Klassenarbeits-Plan nach Wieder-Rein weg`); }
  if (await p.locator('#ar-heute a.card').count()) { await p.locator('#ar-heute a.card').first().click(); await pruefe(p, jg, 'Schritt aus dem Plan'); await p.goBack(); await pruefe(p, jg, 'zurück zum Plan'); if (!(await p.locator('#ar-neu').count())) probleme.push(`[${jg}] Zurück vom Plan-Schritt landet nicht im Plan`); }
  // 4) Zufalls-Klicker
  let seed = 12345 + jg.charCodeAt(0); const zf = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  await los(p, '#/');
  for (let k = 0; k < +(process.env.N || 350); k++) {
    const els = p.locator('a[href^="#/"]:visible, button:visible:not([disabled]), .opt:visible, input[type=range]:visible, [role=button]:visible, [role=radio]:visible, [role=checkbox]:visible'); const n = await els.count();
    if (!n) { probleme.push(`[${jg}] SACKGASSE: nichts mehr anklickbar auf ${await p.evaluate(() => location.hash)}`); await los(p, '#/'); continue; }
    const e = els.nth(Math.floor(zf() * n)); const txt = (await e.innerText().catch(() => '')).slice(0, 30).replace(/\s+/g, ' ');
    p.wo = `Zufall ${k} „${txt}“ auf ${await p.evaluate(() => location.hash)}`;
    if (/zurücksetzen|löschen|Website|Probestunde|Impressum|Datenschutz|Teilen|Drucken|PDF/i.test(txt)) continue;
    try { await e.click({ timeout: 700 }); } catch { continue; }
    if (zf() < 0.08) await p.goBack().catch(() => {}); if (zf() < 0.03) await p.reload();
    if (!p.url().startsWith(B)) { await p.goto(B); continue; }
    const z = await zustand(p); if (z.text < 15 && !z.sheet) { await p.waitForTimeout(400); const z2 = await zustand(p); if (z2.text < 15) { probleme.push(`[${jg}] LEER nach ${p.wo}`); await los(p, '#/'); } }
    if (z.breit > 1) probleme.push(`[${jg}] ZU BREIT nach ${p.wo}`); if (z.undef) probleme.push(`[${jg}] „undefined/NaN“ nach ${p.wo}`);
  }
  console.log(`Klasse ${jg}: ${info.units.length} Einheiten, ${info.units.reduce((s, u) => s + u.n, 0)} Schritte geprüft`);
  await p.context().close();
}
const eind = [...new Set(probleme)]; console.log(`\n${eind.length} Auffälligkeiten:`); eind.slice(0, 60).forEach((x) => console.log(' -', x)); await b.close();
if (eind.some((x) => / FEHLER | Konsole | LEER | SACKGASSE| KEIN WEG /.test(x))) process.exit(1);
