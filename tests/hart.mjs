// Startet alle Prüfdateien in tests/hart/ nacheinander (jede rechnet die Aufgaben eines Pakets unabhängig nach).
import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const ordner = new URL('./hart/', import.meta.url);
let fehler = 0;
for (const f of readdirSync(ordner).filter((n) => n.endsWith('.mjs')).sort()) {
  const r = spawnSync(process.execPath, [new URL(f, ordner).pathname], { encoding: 'utf8', maxBuffer: 1 << 26 });
  const aus = `${r.stdout}${r.stderr}`.trim().split('\n');
  if (r.status !== 0) { fehler++; console.error(aus.slice(-15).join('\n')); console.error(`FEHLER: ${f}`); } else console.log(aus[aus.length - 1]);
}
if (fehler) process.exit(1);
