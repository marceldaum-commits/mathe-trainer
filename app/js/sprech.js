// Sprechfassung: macht aus Formeln (TeX) und Text einen Satz, den eine Stimme richtig vorlesen kann.
// Brüche, Potenzen, Wurzeln, Integrale, Ableitungen (f′), Vektoren, Punkte, Tabellen und griechische Buchstaben werden zu Wörtern.
// Reine Textverarbeitung ohne DOM – damit es in Tests und in der App gleich arbeitet.

const GRIECH = { alpha: 'Alpha', beta: 'Beta', gamma: 'Gamma', delta: 'Delta', varepsilon: 'Epsilon', epsilon: 'Epsilon', lambda: 'Lambda', mu: 'My', pi: 'Pi', rho: 'Rho',
  sigma: 'Sigma', tau: 'Tau', varphi: 'Phi', phi: 'Phi', omega: 'Omega', theta: 'Theta', Delta: 'Delta', Phi: 'Phi', Omega: 'Omega', Sigma: 'Sigma' };
const FUNK = { sin: 'Sinus', cos: 'Kosinus', tan: 'Tangens', ln: 'l n', lg: 'Logarithmus', log: 'Logarithmus', exp: 'e hoch' };
const ZEICHEN = { cdot: 'mal', times: 'mal', div: 'geteilt durch', pm: 'plus minus', mp: 'minus plus', approx: 'ungefähr', neq: 'ungleich', ne: 'ungleich',
  le: 'kleiner gleich', leq: 'kleiner gleich', ge: 'größer gleich', geq: 'größer gleich', infty: 'unendlich', to: 'gegen', Rightarrow: ', also', Leftrightarrow: ', genau dann, wenn',
  cap: 'geschnitten', cup: 'vereinigt', in: 'Element von', perp: 'senkrecht zu', parallel: 'parallel zu', angle: 'Winkel', square: 'Lücke', dots: 'und so weiter', ldots: 'und so weiter',
  '%': 'Prozent', circ: 'Grad', colon: ':', mid: '|', '{': '', '}': '', ' ': ' ', ',': ' ', ';': ' ', '!': '', quad: ', ', qquad: ', ' };
const WEG = new Set(['left', 'right', 'bigl', 'bigr', 'Bigl', 'Bigr', 'big', 'Big', 'displaystyle', 'textstyle', 'limits', 'hline', 'mathrm', 'mathbf', 'mathit', 'operatorname']);
const ORDNUNG = ['', '', 'Quadrat', 'dritte', 'vierte', 'fünfte', 'sechste', 'siebte', 'achte', 'neunte', 'zehnte'];
const STRICHE = ['', 'Strich', 'zwei Strich', 'drei Strich'];

/** Ein Argument in geschweiften Klammern (oder ein einzelnes Zeichen/Befehl) ab Position i lesen. */
function arg(s, i) {
  while (s[i] === ' ') i++;
  if (s[i] === '{') { let t = 1, j = i + 1; for (; j < s.length && t; j++) { if (s[j] === '\\') { j++; continue; } if (s[j] === '{') t++; else if (s[j] === '}') t--; } return [s.slice(i + 1, j - 1), j]; }
  if (s[i] === '\\') { const m = /^\\([a-zA-Z]+|.)/.exec(s.slice(i)); return [m[0], i + m[0].length]; }
  return [s[i] || '', i + 1];
}
const einfach = (t) => /^[\w,. ]+$/.test(t.trim()) || /^\\[a-zA-Z]+$/.test(t.trim());

/** TeX → Wörter. */
export function texSprech(src) {
  let s = String(src).replace(/\\def\\arraystretch\{[^}]*\}/g, '').replace(/\\,\s*d([a-z])(?![a-zA-Z])/g, ' d $1').replace(/(\d)([a-zA-Z])/g, '$1 $2').replace(/\{,\}/g, ',').replace(/\\!|\\,|\\;|\\:/g, ' ').replace(/\\text(?:bf|it)?\{/g, '\\text{');
  return sprich(s).replace(/\s+/g, ' ').replace(/\s+([,.:])/g, '$1').replace(/,\s*,/g, ',').trim();
}
function sprich(s) {
  let out = '', i = 0;
  const hin = (w) => { out += ` ${w} `; };
  while (i < s.length) {
    const c = s[i];
    if (c === '\\') {
      const m = /^\\([a-zA-Z]+|.)/.exec(s.slice(i)); const n = m[1]; i += m[0].length;
      if (n === 'frac' || n === 'dfrac' || n === 'tfrac') { const [z, j] = arg(s, i); const [nn, k] = arg(s, j); i = k;
        hin(einfach(z) && einfach(nn) ? `${sprich(z)} durch ${sprich(nn)}` : `Bruch: ${sprich(z)}, geteilt durch ${sprich(nn)}, Ende des Bruchs`); }
      else if (n === 'sqrt') { let grad = ''; if (s[i] === '[') { const e = s.indexOf(']', i); grad = s.slice(i + 1, e); i = e + 1; } const [a, j] = arg(s, i); i = j;
        hin(`${grad ? `${ORDNUNG[+grad] || `${grad}-te`} ` : ''}Wurzel aus ${einfach(a) ? sprich(a) : `${sprich(a)}, Ende der Wurzel`}`); }
      else if (n === 'binom') { const [a, j] = arg(s, i); const [b, k] = arg(s, j); i = k; hin(`${sprich(a)} über ${sprich(b)}`); }
      else if (n === 'text' || n === 'mathrm' || n === 'operatorname') { const [a, j] = arg(s, i); i = j; hin(a); }
      else if (n === 'vec') { const [a, j] = arg(s, i); i = j; hin(`Vektor ${sprich(a)}`); }
      else if (n === 'overrightarrow') { const [a, j] = arg(s, i); i = j; hin(`Vektor ${sprich(a).split('').join(' ')}`); }
      else if (n === 'overline') { const [a, j] = arg(s, i); i = j; hin(/^[A-Z]{2}$/.test(a) ? `Strecke ${a[0]} ${a[1]}` : `${sprich(a)} quer`); }
      else if (n === 'bar') { const [a, j] = arg(s, i); i = j; hin(`${sprich(a)} quer`); }
      else if (n === 'widehat' || n === 'hat') { const [a, j] = arg(s, i); i = j; hin(`Winkel ${sprich(a).split('').join(' ')}`); }
      else if (n === 'mathbb') { const [a, j] = arg(s, i); i = j; hin(a === 'R' ? 'die reellen Zahlen' : a === 'N' ? 'die natürlichen Zahlen' : a === 'Z' ? 'die ganzen Zahlen' : a); }
      else if (n === 'int') { let von = '', bis = ''; for (let k = 0; k < 2; k++) { if (s[i] === '_') [von, i] = arg(s, i + 1); else if (s[i] === '^') [bis, i] = arg(s, i + 1); }
        hin(von || bis ? `Integral von ${sprich(von)} bis ${sprich(bis)} über` : 'Integral über'); }
      else if (n === 'lim') { let unter = ''; if (s[i] === '_') [unter, i] = arg(s, i + 1); hin(`Limes für ${sprich(unter)} von`); }
      else if (n === 'sum') { let von = '', bis = ''; for (let k = 0; k < 2; k++) { if (s[i] === '_') [von, i] = arg(s, i + 1); else if (s[i] === '^') [bis, i] = arg(s, i + 1); } hin(`Summe ${von ? `von ${sprich(von)} ` : ''}${bis ? `bis ${sprich(bis)}` : ''}`); }
      else if (n === 'begin') { const [env, j] = arg(s, i); i = j; if (s[i] === '{') i = arg(s, i)[1];
        const e = s.indexOf(`\\end{${env}}`, i), inhalt = s.slice(i, e < 0 ? s.length : e); i = e < 0 ? s.length : e + env.length + 6;
        const zeilen = inhalt.split(/\\\\(?:\[[^\]]*\])?/).map((z) => z.replace(/\\hline/g, '').trim()).filter(Boolean);
        if (/matrix/.test(env)) { const w = zeilen.map((z) => sprich(z)); hin(`Spaltenvektor ${w.slice(0, -1).join(', ')}${w.length > 1 ? ' und ' : ''}${w[w.length - 1] || ''},`); }
        else if (/cases/.test(env)) hin(zeilen.map((z) => sprich(z.replace(/&/g, ' für '))).join('; '));
        else hin(zeilen.map((z) => z.split('&').map((x) => sprich(x)).filter(Boolean).join(', ')).join('. ') + '.'); }
      else if (n in GRIECH) hin(GRIECH[n]);
      else if (n in FUNK) hin(n === 'exp' ? 'e hoch' : `${FUNK[n]} von`);
      else if (n in ZEICHEN) hin(ZEICHEN[n]);
      else if (WEG.has(n) || n === 'end') { if (n === 'end') i = arg(s, i)[1]; }
      else hin(n);
      continue;
    }
    if (c === '^') { const [a, j] = arg(s, i + 1); i = j; const t = a.trim();
      if (t === '\\circ') hin('Grad'); else if (t === '2') hin('Quadrat'); else if (/^\\prime+$|^'+$/.test(t)) hin(STRICHE[t.length] || 'Strich');
      else hin(`hoch ${sprich(a)}${einfach(a) ? '' : ','}`); continue; }
    if (c === '_') { const [a, j] = arg(s, i + 1); i = j; hin(/^\d+$/.test(a) ? a : sprich(a)); continue; }
    if (c === "'") { let k = 0; while (s[i] === "'") { k++; i++; } hin(STRICHE[k] || `${k} Strich`); continue; }
    if (c === '{' || c === '}') { i++; continue; }
    if (c === '&') { hin(','); i++; continue; }
    if (c === '=') { hin('gleich'); i++; continue; }
    if (c === '+') { hin('plus'); i++; continue; }
    if (c === '-' || c === '−') { hin(/[\w)]\s*$/.test(out.trim()) ? 'minus' : 'minus'); i++; continue; }
    if (c === '<') { hin('kleiner als'); i++; continue; }
    if (c === '>') { hin('größer als'); i++; continue; }
    if (c === '|') { const zu = s.indexOf('|', i + 1); if (zu > i) { const a = s.slice(i + 1, zu); hin(`Betrag von ${sprich(a)}${einfach(a) ? '' : ', Ende des Betrags'}`); i = zu + 1; continue; } i++; continue; }
    if (c === '/') { hin('durch'); i++; continue; }
    if (c === '*') { hin('mal'); i++; continue; }
    if (c === '(' ) {
      // Funktion: f(x) → „f von x“; Punkt: A(2|3|0) → „A mit den Koordinaten 2, 3 und 0“
      const zu = klammerEnde(s, i), innen = s.slice(i + 1, zu);
      if (/\\mid/.test(innen) && /[A-Z]\s*'*$/.test(out.trim())) { const k = innen.split('\\mid').map((x) => sprich(x)); hin(`mit den Koordinaten ${k.slice(0, -1).join(', ')} und ${k[k.length - 1]}`); i = zu + 1; continue; }
      const vor = s.slice(0, i).trimEnd(), fkt = /(?:^|[^\w^_{\\])[a-zA-Z]'*$/.test(vor) || /\\(sin|cos|tan|ln|lg|log)$/.test(vor);
      if (fkt && /\S/.test(innen) && innen.length < 40) { hin(`${/\bvon\s*$/.test(out) ? '' : 'von '}${einfach(innen) ? sprich(innen) : `${sprich(innen)},`}`); i = zu + 1; continue; }
      out += ' (Klammer auf) '; i++; continue; }
    if (c === ')') { out += ' (Klammer zu) '; i++; continue; }
    if (c === '[' || c === ']') { hin(' '); i++; continue; }
    out += c; i++;
  }
  // Klammern nur ansagen, wenn es nötig ist: einfache Klammern um eine Zahl oder einen Buchstaben fallen weg
  return out.replace(/\(Klammer auf\)\s*(-?\s*minus\s+)?([\w,]+)\s*\(Klammer zu\)/g, (_, m, x) => `${m || ''}${x}`).replace(/\((Klammer auf|Klammer zu)\)/g, '$1');
}
function klammerEnde(s, i) { let t = 0; for (let j = i; j < s.length; j++) { if (s[j] === '(') t++; else if (s[j] === ')' && !--t) return j; } return s.length; }

/** Text mit eingebetteten Formeln (⟦…⟧ oder $…$) und HTML → Sprechfassung. */
export function textSprech(t) {
  return String(t).replace(/⟦([^⟧]*)⟧/g, (_, x) => ` ${texSprech(x)} `).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/⟦([^⟧]*)⟧/g, (_, x) => ` ${texSprech(x)} `)
    .replace(/(\d)\s*%/g, '$1 Prozent').replace(/[„“”"]/g, '').replace(/–/g, ', ').replace(/→/g, ', dann').replace(/≈/g, 'ungefähr').replace(/·/g, 'mal')
    .replace(/\s+/g, ' ').replace(/\s+([,.:;?!])/g, '$1').trim();
}

/** HTML (Formeln als ⟦TeX⟧) → Sprechfassung. Dieselbe Regel beim Bauen der Liste für das Tonstudio (vorlesen/texte.json) und in der App –
 *  nur so findet die App die vorab vertonte Datei wieder. */
export function htmlSprech(html) {
  // Formeln zuerst (sie können < und > enthalten); in der App kommen sie als Text mit &lt; usw. an, beim Bauen roh
  const ent = (x) => x.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
  const t = textSprech(String(html).replace(/⟦([^⟧]*)⟧/g, (_, x) => ` ${texSprech(ent(x))} `).replace(/&quot;/g, '"').replace(/<\/(p|li|h[1-6]|div|section|tr|summary|figcaption|ol|ul)>|<br\s*\/?>/gi, '. ').replace(/<[^>]+>/g, ' '));
  return normal(t.replace(/([:;,!?])\s*\.(\s*\.)*/g, '$1').replace(/(\.\s*){2,}/g, '. ').replace(/^[.\s]+/, ''));
}
/** Normalform für den Abgleich mit dem Stimmen-Werk: NFC, jeder Leerraum ein Leerzeichen, außen abgeschnitten. */
export const normal = (t) => String(t).normalize('NFC').replace(/\s+/g, ' ').trim();
/** Text in Stücke von höchstens max Zeichen schneiden – an Satzenden, notfalls an Kommas oder Leerzeichen. */
export function stuecke(text, max) {
  const out = []; let rest = normal(text);
  while (rest.length > max) {
    const kopf = rest.slice(0, max + 1); let k = Math.max(kopf.lastIndexOf('. '), kopf.lastIndexOf('? '), kopf.lastIndexOf('! '));
    if (k < max * 0.4) k = kopf.lastIndexOf(', '); if (k < max * 0.4) k = kopf.lastIndexOf(' ');
    if (k <= 0) k = max - 1;
    out.push(rest.slice(0, k + 1).trim()); rest = rest.slice(k + 1).trim();
  }
  if (rest) out.push(rest);
  return out;
}
