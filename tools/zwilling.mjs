// Erzeugt die leichten Platzhalter app/js/a/gen*.js zu den schweren Aufgaben-Dateien app/js/gen*.js (siehe app/js/faul.js).
// Jede exportierte Funktion bekommt einen Platzhalter mit gleichem Namen und Thema. Aufruf über tools/check.mjs (--fix schreibt, sonst wird verglichen).
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

const APP = new URL('../app/', import.meta.url).pathname;
export const NAMEN = ['gen', 'gen2', 'gen3', 'gen4', 'gen5', 'gen6', 'gen7', 'gen8', 'gen9', 'gen10', 'gen11', 'gen12'];
const SELBST = { mixOf: 'mixOf', leiter: 'leiter' };   // diese Helfer gibt es leicht und echt in faul.js

export async function zwillinge() {
  globalThis.window ??= { katex: { renderToString: (s) => s } };
  const aus = {};
  for (const n of NAMEN) {
    const M = await import(`../app/js/${n}.js`), zeilen = [], echt = [];
    for (const [k, v] of Object.entries(M).sort(([a], [b]) => a.localeCompare(b))) {
      if (typeof v !== 'function') continue;
      if (SELBST[k]) { echt.push(k); continue; }
      if (n === 'gen10' && k === 'haerter') continue;
      zeilen.push(`export const ${k} = S('${n}', '${k}', ${JSON.stringify(v.name)}${v.topic ? `, ${JSON.stringify(v.topic)}` : ''});`);
    }
    let kopf = `// Erzeugt von tools/zwilling.mjs – nicht von Hand ändern. Leichte Platzhalter für app/js/${n}.js (siehe app/js/faul.js).\nimport { S${n === 'gen10' ? ', haerterMit' : ''} } from '../faul.js';\n`;
    if (echt.length) kopf += `export { ${echt.join(', ')} } from '../faul.js';\n`;
    if (n === 'gen10') zeilen.push(`export const haerter = haerterMit(${JSON.stringify(Object.fromEntries(Object.entries(M.HART).sort(([a], [b]) => a.localeCompare(b)).map(([k, f]) => [k, f.name.replace(/^schwer_/, '')])))});`);
    aus[`js/a/${n}.js`] = `${kopf}${zeilen.join('\n')}\n`;
  }
  return aus;
}

/** Schreibt (fix) oder prüft die Platzhalter. Gibt die Liste der Abweichungen zurück. */
export async function zwillingePflegen(fix) {
  const soll = await zwillinge(), ab = [], ordner = join(APP, 'js/a');
  if (fix) mkdirSync(ordner, { recursive: true });
  for (const [f, text] of Object.entries(soll)) { const p = join(APP, f), ist = existsSync(p) ? readFileSync(p, 'utf8') : null; if (ist !== text) { if (fix) writeFileSync(p, text); else ab.push(f); } }
  if (existsSync(ordner)) for (const f of readdirSync(ordner)) if (!soll[`js/a/${f}`]) { if (fix) unlinkSync(join(ordner, f)); else ab.push(`js/a/${f} (überzählig)`); }
  return ab;
}
