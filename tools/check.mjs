// Prüft (oder aktualisiert mit --fix) die Dateiliste des Service Workers und die Versionsnummern.
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const APP = new URL('../app/', import.meta.url).pathname;
const fix = process.argv.includes('--fix');

function walk(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [relative(APP, p)];
  });
}
const files = walk(APP).filter((f) => f !== 'sw.js' && !/LICENSE/.test(f)).sort();
const assets = ['./', ...files.filter((f) => f !== 'index.html')];

const swPath = join(APP, 'sw.js');
let sw = readFileSync(swPath, 'utf8');
const version = readFileSync(join(APP, 'js/config.js'), 'utf8').match(/VERSION = '([^']+)'/)[1];
const want = `const ASSETS = ${JSON.stringify(assets, null, 2)};`;
const wantCache = `const CACHE = 'mt-${version}';`;

const errors = [];
if (fix) {
  sw = sw.replace(/const ASSETS = \[[\s\S]*?\];/, want).replace(/const CACHE = '[^']*';/, wantCache);
  writeFileSync(swPath, sw);
  console.log(`sw.js aktualisiert: ${assets.length} Dateien, Version ${version}`);
} else {
  if (!sw.includes(want)) errors.push('Dateiliste in app/sw.js ist veraltet → npm run fix');
  if (!sw.includes(wantCache)) errors.push(`CACHE in app/sw.js passt nicht zu VERSION ${version} → npm run fix`);
}
// Jede Datei, die index.html lädt, muss existieren.
const html = readFileSync(join(APP, 'index.html'), 'utf8');
for (const m of html.matchAll(/(?:href|src)="([^"#:]+)"/g)) if (!files.includes(m[1])) errors.push(`index.html verweist auf fehlende Datei: ${m[1]}`);

if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
if (!fix) console.log(`check: sw.js und Verweise in Ordnung (${assets.length} Dateien, Version ${version})`);
