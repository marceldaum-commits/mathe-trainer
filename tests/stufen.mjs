// Nachweis: Jede Aufgaben-Art wird von Stufe zu Stufe messbar schwerer.
// Erzeugt je Art und Stufe viele Aufgaben (fester Zufall), misst die Kennzahlen aus app/js/stufe.js und schlägt fehl,
// wenn der Anspruch einer Stufe nicht deutlich über dem der vorigen liegt. Mit --tabelle wird docs/STUFEN.md neu geschrieben.
import { writeFileSync, readFileSync } from 'node:fs';
globalThis.window = { katex: { renderToString: (s) => `<span class="katex"><annotation encoding="application/x-tex">${String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</annotation></span>` } };
const { seedRandom } = await import('../app/js/math.js');
const U = await import('../app/js/units.js');
await (await import('../app/js/faul.js')).ladeAufgaben();
const { kennzahlen, stelle } = await import('../app/js/stufe.js');

const N = +(process.env.N || 300), ROH = process.argv.includes('--roh');
const arten = new Map(), gesehen = new Set();
const gehe = (v, gebiet, d = 0) => {
  if (!v || d > 6 || gesehen.has(v)) return;
  if (typeof v === 'function') { if (v.topic || /^(gen|schwer)/.test(v.name)) { gesehen.add(v); (roh.get(v.name) || roh.set(v.name, []).get(v.name)).push({ fn: v, gebiet }); } return; }
  if (typeof v === 'object') { gesehen.add(v); for (const w of Object.values(v)) gehe(w, gebiet, d + 1); }
};
const roh = new Map();
for (const u of U.ALLE_UNITS) gehe(u, u.jg ? `Klasse 5–10` : ({ analysis: 'Analysis', stochastik: 'Stochastik', geometrie: 'Geometrie' }[u.area] || u.area));
// Erzeuger, die nur in einzelnen Schritten oder gemischten Runden vorkommen, zählen auch mit: alle exportierten Erzeuger mit Thema.
const GEBIET = (t) => (/Vektor|Gerade|Ebene|Punkt|Viereck|Spiegel|Abst|Winkel|Kugel|Kreuz|Lage|Skalar/.test(t) ? 'Geometrie' : 'Analysis');
for (const datei of ['gen', 'gen2', 'gen3', 'gen4', 'gen5', 'gen6', 'gen7', 'gen8', 'gen9', 'gen10', 'gen11', 'gen12', 'gen13']) { const M = await import(`../app/js/${datei}.js`);
  for (const fn of Object.values(M)) if (typeof fn === 'function' && /^gen[A-Z]/.test(fn.name) && fn.topic && !/Steil$|Mix$/.test(fn.name) && !roh.has(fn.name)) roh.set(fn.name, [{ fn, gebiet: ['gen6', 'gen7'].includes(datei) ? 'Klasse 5–10' : GEBIET(fn.topic) }]); }
// Gleicher Name in zwei Fassungen (eingehängt und einfach): beide messen.
for (const [name, fass] of roh) { const eingehaengt = fass.some((f) => f.fn.basis); for (const f of fass) arten.set(fass.length < 2 ? name : eingehaengt ? `${name}${f.fn.basis ? '' : ' (einfach)'}` : `${name} (${f.gebiet})`, f); }
const FELDER = ['anspruch', 'schritte', 'regeln', 'grad', 'tiefe', 'parameter', 'weg', 'krumm'];
const zeilen = [], fehler = [];
for (const [name, { fn, gebiet }] of [...arten].sort((a, b) => a[1].gebiet.localeCompare(b[1].gebiet) || a[0].localeCompare(b[0]))) {
  const je = [];
  for (let lv = 1; lv <= 5; lv++) {
    seedRandom(7000 + lv); const sum = Object.fromEntries(FELDER.map((f) => [f, 0]));
    for (let i = 0; i < N; i++) { const k = kennzahlen(ROH ? fn(lv) : stelle(fn, lv)); for (const f of FELDER) sum[f] += k[f]; }
    je.push(Object.fromEntries(FELDER.map((f) => [f, sum[f] / N])));
  }
  seedRandom(null);
  zeilen.push({ name, gebiet, je });
  for (let lv = 1; lv < 5; lv++) { const a = je[lv - 1].anspruch, b = je[lv].anspruch; if (!(b >= a * 1.03 && b - a >= 0.3)) fehler.push(`${name} (${gebiet}): Stufe ${lv + 1} ist nicht deutlich schwerer als Stufe ${lv} (Anspruch ${a.toFixed(1)} → ${b.toFixed(1)})`); }
  if (!(je[4].anspruch >= je[0].anspruch * 1.5)) fehler.push(`${name} (${gebiet}): Stufe 5 ist nicht mindestens anderthalbmal so schwer wie Stufe 1 (Anspruch ${je[0].anspruch.toFixed(1)} → ${je[4].anspruch.toFixed(1)})`);
}

const z = (x, n = 1) => x.toFixed(n).replace('.', ',');
function tabelle() {
  const gebiete = [...new Set(zeilen.map((r) => r.gebiet))];
  let t = `# Stufen-Nachweis: Kennzahlen je Aufgaben-Art und Stufe\n\nErzeugt von \`node tests/stufen.mjs --tabelle\` (${N} Aufgaben je Art und Stufe, fester Zufall). Nicht von Hand ändern.\n\n`;
  t += 'Kennzahlen (Mittelwerte): **Anspruch** = Gesamtzahl, nach der sortiert wird · **Schritte** = Rechenzeichen im Lösungsweg · **Regeln** = genannte Regeln im Lösungsweg · **Grad** = höchste Hochzahl · **Tiefe** = Verschachtelung · **Param.** = Buchstaben-Parameter · **Weg** = Länge des Lösungswegs in Zeichen · **krumm** = Anteil nicht-ganzzahliger Ergebnisse.\n\n';
  t += '## Überblick je Gebiet\n\n| Gebiet | Stufe | Anspruch | Schritte | Regeln | Grad | Tiefe | Param. | Weg | krumm |\n|---|---|---|---|---|---|---|---|---|---|\n';
  for (const g of gebiete) for (let lv = 0; lv < 5; lv++) { const rs = zeilen.filter((r) => r.gebiet === g), m = (f) => rs.reduce((s, r) => s + r.je[lv][f], 0) / rs.length;
    t += `| ${lv ? '' : `${g} (${rs.length} Arten)`} | ${lv + 1} | ${z(m('anspruch'))} | ${z(m('schritte'))} | ${z(m('regeln'), 2)} | ${z(m('grad'), 2)} | ${z(m('tiefe'), 2)} | ${z(m('parameter'), 2)} | ${z(m('weg'), 0)} | ${z(100 * m('krumm'), 0)} % |\n`; }
  for (const g of gebiete) { t += `\n## ${g}\n\n| Aufgaben-Art | Stufe | Anspruch | Schritte | Regeln | Grad | Tiefe | Param. | Weg | krumm |\n|---|---|---|---|---|---|---|---|---|---|\n`;
    for (const r of zeilen.filter((x) => x.gebiet === g)) r.je.forEach((k, i) => { t += `| ${i ? '' : r.name} | ${i + 1} | ${z(k.anspruch)} | ${z(k.schritte)} | ${z(k.regeln, 2)} | ${z(k.grad, 2)} | ${z(k.tiefe, 2)} | ${z(k.parameter, 2)} | ${z(k.weg, 0)} | ${z(100 * k.krumm, 0)} % |\n`; }); }
  return t;
}
if (process.argv.includes('--tabelle')) writeFileSync(new URL('../docs/STUFEN.md', import.meta.url), tabelle());
if (process.argv.includes('--kurz')) for (const r of zeilen) console.log(r.name.padEnd(24), r.gebiet.padEnd(12), r.je.map((k) => k.anspruch.toFixed(1).padStart(6)).join(' '));
for (const f of fehler) console.error('FEHLER:', f);
if (fehler.length) { console.error(`stufen: ${fehler.length} Befunde bei ${zeilen.length} Aufgaben-Arten`); process.exit(1); }
console.log(`stufen: alle ${zeilen.length} Aufgaben-Arten steigen von Stufe 1 bis 5 messbar an (${N} Aufgaben je Art und Stufe)`);
