// Prüft (oder aktualisiert mit --fix) die Dateiliste des Service Workers und die Versionsnummern.
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';

const APP = new URL('../app/', import.meta.url).pathname;
const fix = process.argv.includes('--fix');

function walk(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [relative(APP, p)];
  });
}
const files = walk(APP).filter((f) => f !== 'sw.js' && f !== 'stand.json' && !/LICENSE/.test(f)).sort();
// Bilder für den Installations-Dialog (img/shots) braucht die App offline nicht.
const assets = ['./', ...files.filter((f) => f !== 'index.html' && !f.startsWith('img/shots/'))];

const swPath = join(APP, 'sw.js');
let sw = readFileSync(swPath, 'utf8');
const version = readFileSync(join(APP, 'js/config.js'), 'utf8').match(/VERSION = '([^']+)'/)[1];
const want = `const ASSETS = ${JSON.stringify(assets, null, 2)};`;
const wantCache = `const CACHE = 'mt-${version}';`;

const errors = [];
// Datum der Version: Wird die VERSION erhöht (sw.js trägt noch die alte), setzt --fix das heutige Datum (deutsche Zeit).
const cfgPath = join(APP, 'js/config.js');
let cfg = readFileSync(cfgPath, 'utf8');
const stand = cfg.match(/STAND = '([^']*)'/)?.[1];
const heute = new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date());
if (fix && (!sw.includes(wantCache) || !/^\d{2}\.\d{2}\.\d{4}$/.test(stand || '')) && stand !== heute) {
  cfg = cfg.replace(/STAND = '[^']*'/, `STAND = '${heute}'`); writeFileSync(cfgPath, cfg); console.log(`config.js: Datum der Version auf ${heute} gesetzt`);
}
if (!fix && !/^\d{2}\.\d{2}\.\d{4}$/.test(stand || '')) errors.push('STAND in app/js/config.js fehlt oder hat nicht das Format TT.MM.JJJJ → npm run fix');
if (fix) {
  sw = sw.replace(/const ASSETS = \[[\s\S]*?\];/, want).replace(/const CACHE = '[^']*';/, wantCache);
  writeFileSync(swPath, sw);
  console.log(`sw.js aktualisiert: ${assets.length} Dateien, Version ${version}`);
} else {
  if (!sw.includes(want)) errors.push('Dateiliste in app/sw.js ist veraltet → npm run fix');
  if (!sw.includes(wantCache)) errors.push(`CACHE in app/sw.js passt nicht zu VERSION ${version} → npm run fix`);
}
// Selbst-Aktualisierung der Android-App: android/huelle.json zählt die Fassungen der App-Hülle (steigt von selbst,
// sobald sich android/ ändert); app/stand.json nennt Version, Hülle und die Prüfsumme jeder Datei der Web-App.
const sha = (buf) => createHash('sha256').update(buf).digest('hex');
const ANDROID = new URL('../android/', import.meta.url).pathname;
const walkAll = (dir, base) => readdirSync(dir).flatMap((n) => { const p = join(dir, n); return ['build', '.gradle', 'huelle.json'].includes(n) ? [] : statSync(p).isDirectory() ? walkAll(p, base) : [relative(base, p)]; });
const huelleSha = sha(walkAll(ANDROID, ANDROID).filter((f) => f.startsWith('offline/') || f.startsWith('widget/')).sort().map((f) => `${f}:${sha(readFileSync(join(ANDROID, f)))}`).join('\n'));
const huellePath = join(ANDROID, 'huelle.json');
let huelle = { nr: 0, sha: '' }; try { huelle = JSON.parse(readFileSync(huellePath, 'utf8')); } catch { /* fehlt noch */ }
if (huelle.sha !== huelleSha) {
  if (fix) { huelle = { nr: huelle.nr + 1, sha: huelleSha }; writeFileSync(huellePath, `${JSON.stringify(huelle)}\n`); console.log(`android/huelle.json: Hülle Nr. ${huelle.nr}`); }
  else errors.push('android/ hat sich geändert, android/huelle.json passt nicht mehr → npm run fix');
}
const standPath = join(APP, 'stand.json');
const dateien = {};
for (const f of walk(APP).filter((f) => f !== 'stand.json' && !f.startsWith('img/shots/')).sort()) dateien[f] = sha(readFileSync(join(APP, f)));
const wantStand = `${JSON.stringify({ version, huelle: huelle.nr, dateien }, null, 1)}\n`;
let istStand = ''; try { istStand = readFileSync(standPath, 'utf8'); } catch { /* fehlt noch */ }
if (istStand !== wantStand) { if (fix) { writeFileSync(standPath, wantStand); console.log('stand.json aktualisiert'); } else errors.push('app/stand.json ist veraltet → npm run fix'); }

// Jede Datei, die index.html lädt, muss existieren.
const html = readFileSync(join(APP, 'index.html'), 'utf8');
for (const m of html.matchAll(/(?:href|src)="([^"#:]+)"/g)) if (!files.includes(m[1])) errors.push(`index.html verweist auf fehlende Datei: ${m[1]}`);

if (files.some((f) => f.startsWith('icons/'))) errors.push('Ordner app/icons/ ist auf dem Server belegt (Apache-Alias) → app/img/ verwenden');
const OK_EXT = /\.(html|css|js|mjs|json|webmanifest|svg|png|jpg|webp|ico|woff2|txt)$/;
for (const f of walk(APP)) if (!OK_EXT.test(f)) errors.push(`Dateiart auf dem Server nicht erlaubt: ${f}`);
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
if (!fix) console.log(`check: sw.js und Verweise in Ordnung (${assets.length} Dateien, Version ${version})`);
