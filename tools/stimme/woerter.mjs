// Alle Wörter, die vorgelesen werden können: Erzeuger-Ausgaben (über die Sprechfassung), alle Zeichenketten im Quellcode (Theorie, Tipps, Oberfläche)
import fs from 'node:fs'; import { texSprech, textSprech } from '../../app/js/sprech.js';
const R = new URL('../../app/js/', import.meta.url).pathname; const d = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const W = new Map(); const nimm = (t) => { for (const w of String(t).match(/[A-Za-zÄÖÜäöüß]+/g) || []) { const k = w.length >= 2 && w === w.toUpperCase() ? w : w.toLowerCase(); W.set(k, (W.get(k) || 0) + 1); } };
for (const t of d.texte) nimm(textSprech(t)); for (const t of d.tex) nimm(texSprech(t));
const dateien = []; const lauf = (p) => { for (const f of fs.readdirSync(p, { withFileTypes: true })) { if (f.isDirectory()) { if (!['a', 'ki'].includes(f.name)) lauf(p + f.name + '/'); } else if (f.name.endsWith('.js')) dateien.push(p + f.name); } }; lauf(R);
for (const f of dateien) { const src = fs.readFileSync(f, 'utf8').replace(/^\s*\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  for (const m of src.matchAll(/'((?:[^'\\\n]|\\.)*)'|`((?:[^`\\]|\\.)*)`|"((?:[^"\\\n]|\\.)*)"/g)) { let s = m[1] ?? m[2] ?? m[3]; if (!/\s/.test(s) && !/^[A-ZÄÖÜ][a-zäöüß]{2,}$/.test(s)) continue;
    s = s.replace(/\$\{[^}]*\}/g, ' ').replace(/\\\\/g, '\\'); nimm(textSprech(s.replace(/\\[a-zA-Z]+\{[^}]*\}|\\[a-zA-Z]+/g, (x) => ` ${texSprech(x)} `))); } }
for (const x of 'Bruch geteilt durch Ende des Bruchs Wurzel aus über Integral von bis Limes für gegen unendlich Summe Spaltenvektor mit den Koordinaten und Vektor Strecke quer Winkel Betrag Klammer auf zu Strich zwei drei Quadrat hoch mal plus minus gleich ungleich ungefähr kleiner größer als Grad Prozent Komma tausend Million Millionen Lücke Element senkrecht parallel geschnitten vereinigt also genau dann wenn reellen natürlichen ganzen Zahlen dritte vierte fünfte Tabelle Aufgabe Tipp Lösung Erklärung'.split(' ')) nimm(x);
for (const g of ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Lambda', 'My', 'Pi', 'Rho', 'Sigma', 'Tau', 'Phi', 'Omega', 'Theta', 'Sinus', 'Kosinus', 'Tangens', 'Logarithmus']) nimm(g);
const liste = [...W.keys()].filter((w) => w.length <= 40).sort();
fs.writeFileSync(process.argv[3], liste.join('\n') + '\n'); console.log('Wörter:', liste.length, 'Dateien:', dateien.length);
