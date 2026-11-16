// Bündelt und verkleinert die Programm-Dateien für die Auslieferung: app/js/app.js (+ alles, was es einbindet) → app/b/.
// Der Quelltext in app/js/ bleibt die Wahrheit; app/b/ wird nur erzeugt („npm run fix“) und von „npm run check“ nachgeprüft.
// keepNames ist Pflicht: Die App merkt sich Aufgaben-Arten über die Namen der Funktionen (Lernstand, Fehler-Kartei, Stufen-Leiter).
import { build } from 'esbuild';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP = join(dirname(fileURLToPath(import.meta.url)), '..', 'app');
/** Liefert { 'b/app.js': Text, 'b/teil-….js': Text, … } und die Liste der gebündelten Quell-Dateien. */
export async function buendeln() {
  const r = await build({ entryPoints: { app: join(APP, 'js/app.js') }, outdir: join(APP, 'b'), bundle: true, splitting: true, format: 'esm', minify: true, keepNames: true, target: ['es2020'],
    chunkNames: 'teil-[hash]', legalComments: 'none', charset: 'utf8', write: false, metafile: true, logLevel: 'silent', absWorkingDir: APP });
  const dateien = {}; for (const f of r.outputFiles) dateien[`b/${f.path.split(/[\\/]b[\\/]/).pop()}`] = f.text;
  const quellen = Object.keys(r.metafile.inputs).map((f) => f.replace(/\\/g, '/')).sort();
  // Teile, die app.js fest einbindet (für die Vorlade-Liste) – nicht die erst später nachgeladenen
  const fest = new Set(), aus = r.metafile.outputs, such = (k) => { for (const i of aus[k].imports) if (i.kind === 'import-statement' && !fest.has(i.path)) { fest.add(i.path); such(i.path); } };
  such(Object.keys(aus).find((k) => /b\/app\.js$/.test(k)));
  return { dateien, quellen, fest: [...fest].map((k) => `b/${k.split('b/').pop()}`).sort() };
}
