// Harte Prüfung für das Paket gen6a (Klasse 5–10): Jede Aufgabe wird unabhängig vom Erzeuger nachgerechnet.
// Die Formeln werden aus dem angezeigten TeX-Quelltext gelesen und ausgewertet, Sachaufgaben aus den Zahlen im Aufgabentext
// (durchzählen, einsetzen, numerisch integrieren) – nichts wird aus den Rechenwegen des Erzeugers übernommen.
// Zusätzlich wird der Lösungsweg geprüft: Jede Rechenkette in Tipps, Erklärung und Diagnosen (… = … = …, … ≈ …, … < …) muss zahlenmäßig stimmen.
globalThis.window = { katex: { renderToString: (s) => `⟦${s}⟧` } };   // Formeln bleiben Quelltext; die Klammern ⟦ ⟧ markieren sie für die Prüfung der Rechenketten
const roh = (s) => String(s ?? '').replace(/[⟦⟧]/g, '');
const { seedRandom } = await import('../../app/js/math.js');
const G = await import('../../app/js/gen6.js');

let pruefungen = 0, fehler = 0;
const gemeldet = new Map();   // je Aufgaben-Form höchstens drei Meldungen, damit die Ausgabe lesbar bleibt
const ok = (b, msg) => { pruefungen++; if (!b) { fehler++; const k = String(msg).split(':')[0], n = (gemeldet.get(k) || 0) + 1; gemeldet.set(k, n); if (n <= 3) console.error('FEHLER:', msg); } };
const nah = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
const ggt = (a, b) => (b ? ggt(b, a % b) : Math.abs(a));

/** Zweizeilig gesetzte Formel (array mit einer Spalte) wieder in eine Zeile bringen. */
const flach = (t) => String(t).replace(/\\begin\{array\}\{l\}|\\end\{array\}|\\\\\[6pt\]|\\quad|\{\}/g, '');
/** Wertet einen TeX-Ausdruck aus (Zahlen mit Komma und Periodenstrich, Brüche, Potenzen, Wurzeln, Logarithmen, π, Variablen, Mal ohne Malpunkt). */
function texWert(src, vars = {}) {
  const s = flach(src).replace(/\\left|\\right|\\,|\\!|\;|\\displaystyle/g, '').replace(/\\text\{[^}]*\}/g, '').replace(/\{,\}/g, '.')
    .replace(/(\d)\\tfrac\{(\d+)\}\{(\d+)\}/g, '($1+\\frac{$2}{$3})').replace(/\\[dt]frac/g, '\\frac').replace(/\\cdot/g, '*').replace(/\s+/g, '');
  let i = 0;
  const peek = () => s[i] ?? '', eat = (t) => (s.startsWith(t, i) ? ((i += t.length), true) : false), halt = (m) => { throw new Error(`${m} an Stelle ${i} in „${s}“`); };
  const gruppe = () => { if (!eat('{')) halt('{ erwartet'); const v = summe(); if (!eat('}')) halt('} erwartet'); return v; };
  const zahl = () => { const m = /^\d+(\.\d*)?/.exec(s.slice(i)); if (!m) halt('Zahl erwartet'); i += m[0].length; let v = +m[0]; const st = Math.max(0, (m[1] || '.').length - 1);
    if (eat('\\overline{')) { const p = /^\d+/.exec(s.slice(i))[0]; i += p.length; if (!eat('}')) halt('} erwartet'); v += +p / ((10 ** p.length - 1) * 10 ** st); } return v; };
  const atom = () => {
    if (eat('(')) { const v = summe(); if (!eat(')')) halt(') erwartet'); return v; }
    if (eat('[')) { const v = summe(); if (!eat(']')) halt('] erwartet'); return v; }
    if (peek() === '{') return gruppe();
    if (eat('\\frac')) { if (/\d/.test(peek())) { const a = +s[i++], b = +s[i++]; return a / b; } const a = gruppe(), b = gruppe(); return a / b; }
    if (eat('\\sqrt')) return Math.sqrt(gruppe());
    if (eat('\\pi')) return Math.PI;
    if (eat('\\log_')) { const b = peek() === '{' ? gruppe() : zahl(); return Math.log(potenz()) / Math.log(b); }
    if (eat('\\lg')) return Math.log10(potenz());
    if (/\d/.test(peek())) return zahl();
    if (/[a-zA-Z]/.test(peek())) { const c = s[i++]; if (!(c in vars)) halt(`unbekannte Variable ${c}`); return vars[c]; }
    return halt('unerwartetes Zeichen');
  };
  const potenz = () => { let v = atom(); if (eat('^')) { const e = peek() === '{' ? gruppe() : atom(); v **= e; } return v; };
  const unaer = () => (eat('-') ? -unaer() : eat('+') ? unaer() : potenz());
  const beginntFaktor = () => /[\da-zA-Z({]/.test(peek()) || ['\\frac', '\\pi', '\\sqrt', '\\log_', '\\lg'].some((t) => s.startsWith(t, i));
  const produkt = () => { let v = unaer(); for (;;) { if (eat('*')) v *= unaer(); else if (eat(':')) v /= unaer(); else if (i < s.length && beginntFaktor()) v *= potenz(); else return v; } };
  function summe() { let v = produkt(); for (;;) { if (eat('+')) v += produkt(); else if (eat('-')) v -= produkt(); else return v; } }
  const v = summe(); if (i < s.length) halt('Rest nicht gelesen'); return v;
}
/** Zahlenwert einer Antwort: ohne Vorsatz (x=, k=, ≈) und ohne Einheit; Prozent als Anteil. */
const antwort = (t, vars) => { let s = String(t).replace(/^(?:[a-z](?:\\approx|=)|\\approx)/, ''); const proz = /\\,\\%$/.test(s); s = s.replace(/\\,\\%$/, '').replace(/\\,\\text\{[^}]*\}(\^\d)?$/, ''); const v = texWert(s, vars); return proz ? v / 100 : v; };
/** Alle Zahlen eines Textes in Lesereihenfolge (Dezimalkomma, Dreiergruppen, ohne Hochzahlen der Einheiten). */
const zahlen = (s) => [...String(s).replace(/\{,\}/g, ',').replace(/\^\{?\d+\}?/g, '').replace(/\\,/g, '').replace(/(\d) (?=\d{3}(?!\d))/g, '$1').matchAll(/-?\d+(?:,\d+)?/g)].map((m) => +m[0].replace(',', '.'));
const richtig = (q) => q.options.find((o) => o.correct), falsche = (q) => q.options.filter((o) => !o.correct);
const bruchTeile = (t) => { const m = /^(-?)\\dfrac\{(\d+)\}\{(\d+)\}$/.exec(t); return m ? [+m[2], +m[3]] : /^-?\d+$/.test(t) ? [Math.abs(+t), 1] : null; };
/** Simpson-Regel – für Rauminhalte aus Querschnittsflächen. */
const simpson = (f, a, b, n = 200) => { const h = (b - a) / n; let s = f(a) + f(b); for (let k = 1; k < n; k++) s += f(a + k * h) * (k % 2 ? 4 : 2); return (s * h) / 3; };
const VIELECK = 1e6, kreisUmfang = (r) => VIELECK * 2 * r * Math.sin(Math.PI / VIELECK), kreisFlaeche = (r) => (VIELECK / 2) * r * r * Math.sin((2 * Math.PI) / VIELECK);   // Kreis als Vieleck mit einer Million Ecken

/** Allgemeine Prüfungen: Aufbau, genau eine richtige Antwort, Diagnosen, Lösungsweg, keine kaputten Werte. */
function aufbau(q, wo) {
  ok(Array.isArray(q.options) && q.options.length === 4, `${wo}: vier Antworten`);
  ok(q.options.filter((o) => o.correct).length === 1, `${wo}: genau eine richtige Antwort`);
  ok(new Set(q.options.map((o) => o.tex)).size === q.options.length, `${wo}: Antworten verschieden (${q.options.map((o) => o.tex).join(' | ')})`);
  ok(falsche(q).every((o) => typeof o.why === 'string' && o.why.length > 12), `${wo}: jeder Ablenker hat eine Diagnose`);
  ok(Array.isArray(q.hints) && q.hints.length >= 2 && q.hints.every((h) => typeof h === 'string' && h.trim().length > 3), `${wo}: Tipps nicht leer`);
  ok(typeof q.explain === 'string' && q.explain.length > 5 && typeof q.prompt === 'string' && q.prompt.length > 5, `${wo}: Aufgabe und Erklärung vorhanden`);
  const alles = [q.prompt, q.formula, q.explain, ...q.hints, ...q.options.flatMap((o) => [o.tex, o.why])].filter((x) => x !== undefined && x !== null).join(' ¦ ');
  ok(!/NaN|undefined|Infinity|\[object/.test(alles), `${wo}: keine kaputten Werte (${(alles.match(/.{0,30}(NaN|undefined|Infinity|\[object).{0,30}/) || [''])[0]})`);
  ok(!/\d\.\d/.test(alles), `${wo}: Komma statt Punkt`);
  ok(q.options.every((o) => o.num === undefined || Number.isFinite(o.num)), `${wo}: Zahlenwerte endlich`);
}
/** Die als richtig markierte Antwort hat den erwarteten Wert, alle anderen nicht. */
function wertPruefen(q, wo, soll, tol = 1e-9, abstand = 1e-7, vars) {
  const r = antwort(richtig(q).tex, vars);
  ok(nah(r, soll, tol), `${wo}: richtige Antwort ${richtig(q).tex} = ${r}, nachgerechnet ${soll} · ${q.prompt} ${q.formula ?? ''}`);
  for (const o of falsche(q)) ok(!nah(antwort(o.tex, vars), soll, abstand), `${wo}: Ablenker ${o.tex} ist auch richtig · ${q.prompt} ${q.formula ?? ''}`);
}

const BASIS = { mm: 0.001, cm: 0.01, dm: 0.1, m: 1, km: 1000, g: 1, kg: 1000, t: 1e6, s: 1, min: 60, h: 3600, ml: 0.001, l: 1 };
/** Größe einer Einheit in der Grundeinheit ihrer Art; ² und ³ potenzieren die Längen-Zahl. */
const einheit = (u) => { const m = /^([a-z]+)([²³]?)$/.exec(u); if (!m || !(m[1] in BASIS)) throw new Error(`Einheit ${u}`); return BASIS[m[1]] ** (m[2] === '²' ? 2 : m[2] === '³' ? 3 : 1); };
const texEinheit = (t) => { const m = /^(.*?)\\,\\text\{([a-z]+)\}(?:\^(\d))?$/.exec(t); return [texWert(m[1]), m[2] + (m[3] === '2' ? '²' : m[3] === '3' ? '³' : '')]; };

const PRUEFER = {
  genEinheit(q, wo) {
    let soll; const z = zahlen(q.prompt);
    if (q.kind === 'um') { const m = /^Rechne um: (.*) in (\S+)\.$/.exec(q.prompt), [v, von] = texEinheit(m[1]); soll = (v * einheit(von)) / einheit(m[2]); }
    else if (q.kind === 'tempo') soll = /in km\/h\?$/.test(q.prompt) ? (z[0] * 3600) / 1000 : (z[0] * 1000) / 3600;
    else if (q.kind === 'summe') { const ziel = /in (\S+)\?$/.exec(q.prompt)[1]; soll = flach(q.formula).split('+').map(texEinheit).reduce((s, [v, u]) => s + (v * einheit(u)) / einheit(ziel), 0); }
    else if (/Wasserhahn/.test(q.prompt)) { let ml = 0; for (let tag = 0; tag < z[1]; tag++) for (let st = 0; st < 24; st++) for (let mi = 0; mi < 60; mi++) ml += z[0]; soll = ml / 1000; }
    else if (/Aquarium/.test(q.prompt)) soll = (z[0] / 10) * (z[1] / 10) * (z[2] / 10);   // in Dezimetern gerechnet: dm³ = Liter
    else if (/Regen/.test(q.prompt)) soll = z[0] * z[1];   // 1 mm Regen auf 1 m² ist genau 1 Liter
    else if (/Feld/.test(q.prompt)) soll = (z[0] / 100) * (z[1] / 100);   // 1 ha = 100 m mal 100 m
    else throw new Error('unbekannte Form');
    wertPruefen(q, wo, soll);
    ok(nah(q.r, soll) && nah(q.r, q.runter ? q.v * q.f : q.v / q.f), `${wo}: Felder v, f, r passen zusammen`);
  },
  genKuerzen(q, wo) {
    const F = texWert(q.formula), r = richtig(q), [rz, rn] = bruchTeile(r.tex);
    ok(nah(rz / rn, F), `${wo}: richtige Antwort ${r.tex} hat den Wert von ${q.formula}`);
    if (q.erw) { const ziel = zahlen(q.prompt)[0]; ok(rn === ziel, `${wo}: erweitert auf den verlangten Nenner`); for (const o of falsche(q)) { const [z, n] = bruchTeile(o.tex); ok(!(nah(z / n, F) && n === ziel), `${wo}: Ablenker ${o.tex} ist auch richtig`); } }
    else { let kn = 1; while (!nah(F * kn, Math.round(F * kn), 1e-9)) kn++;   // kleinster Nenner durch Probieren
      ok(rn === kn && rz === Math.round(F * kn) && ggt(rz, rn) === 1, `${wo}: vollständig gekürzt (${q.formula} → ${r.tex}, erwartet ${Math.round(F * kn)}/${kn})`);
      for (const o of falsche(q)) { const [z, n] = bruchTeile(o.tex); ok(!nah(z / n, F) || ggt(z, n) > 1, `${wo}: Ablenker ${o.tex} ist auch richtig (${q.formula})`); } }
    ok(nah(r.wert, q.a / q.b) && r.zaehler === rz && r.nenner === rn, `${wo}: Felder a, b, wert, zaehler, nenner`);
  },
  genBruchVergleich(q, wo) {
    const w = q.options.map((o) => antwort(o.tex)), i = q.options.findIndex((o) => o.correct); let guete;
    if (/am nächsten an/.test(q.prompt)) { const t = texWert(/an (\\dfrac\{\d+\}\{\d+\})\?/.exec(q.prompt)[1]); guete = w.map((x) => -Math.abs(x - t)); }
    else guete = /größte/.test(q.prompt) ? w : /kleinste/.test(q.prompt) ? w.map((x) => -x) : null;
    ok(guete && guete.every((g, k) => k === i || g < guete[i] - 1e-9), `${wo}: ${q.options[i].tex} ist eindeutig die gesuchte Zahl (${q.options.map((o) => o.tex).join(' | ')}) · ${q.prompt}`);
    ok(q.options.every((o, k) => nah(o.num, w[k], 1e-9)), `${wo}: Zahlenwerte passen zur Anzeige`);
  },
  genDezimal(q, wo) {
    if (q.formula) return wertPruefen(q, wo, texWert(q.formula));
    const [g1, p1, g2, p2, schein] = zahlen(q.prompt); wertPruefen(q, wo, Math.round(schein * 100 - Math.round(g1 * 1000) * Math.round(p1 * 100) / 1000 - Math.round(g2 * 1000) * Math.round(p2 * 100) / 1000) / 100);
  },
  genBruchDezimal(q, wo) {
    const soll = antwort(q.formula), r = richtig(q); wertPruefen(q, wo, soll, 1e-9, 1e-7);
    ok(nah(soll, q.z / q.n), `${wo}: Felder z, n`);
    if (/gekürzten Bruch/.test(q.prompt)) { const t = bruchTeile(r.tex); ok(t && ggt(t[0], t[1]) === 1, `${wo}: Bruch vollständig gekürzt (${r.tex})`); }
    if (/Dezimalzahl/.test(q.prompt)) { ok(!/frac|%/.test(r.tex), `${wo}: Antwort ist eine Dezimalzahl`);
      const m = /^(\d+)\{,\}(\d*)(?:\\overline\{(\d+)\})?$/.exec(r.tex), [z, n] = bruchTeile(q.formula); let ziffern = '', rest = z % n;
      for (let k = 0; k < 30; k++) { rest *= 10; ziffern += Math.floor(rest / n); rest %= n; }   // schriftliche Division, 30 Stellen
      const anzeige = (m[2] + (m[3] ? m[3].repeat(30) : '0'.repeat(30))).slice(0, 30);
      ok(+m[1] === Math.floor(z / n) && anzeige === ziffern, `${wo}: Ziffernfolge von ${q.formula} stimmt (${r.tex})`); }
    if (/Prozentsatz/.test(q.prompt)) ok(/\\%$/.test(r.tex), `${wo}: Antwort ist ein Prozentsatz`);
  },
  genNegativ(q, wo) { wertPruefen(q, wo, texWert(q.formula)); ok(nah(richtig(q).num, texWert(q.formula)), `${wo}: Zahlenwert`); },
  genDreisatz(q, wo) {
    const z = zahlen(q.prompt); let soll;
    if (['vielfach', 'prop', 'propkrumm'].includes(q.kind)) soll = (z[1] / z[0]) * z[2];
    else if (q.kind === 'anti') soll = (z[0] * z[1]) / z[2];
    else if (q.kind === 'doppelt') soll = (z[2] / z[0] / z[1]) * z[3] * z[4];
    else if (q.kind === 'doppeltanti') soll = (z[0] * z[1] * z[2]) / (z[3] * z[4]);   // Reihenfolge im Text: Arbeiter, Tage, Stunden täglich
    else if (q.kind === 'vorrat') { let rationen = z[0] * z[1]; for (let tag = 0; tag < z[2]; tag++) rationen -= z[0]; soll = rationen / (/dazu/.test(q.prompt) ? z[0] + z[3] : z[0] - z[3]); }
    else throw new Error('unbekannte Form');
    wertPruefen(q, wo, soll, 1e-9, 1e-6); ok(nah(q.y2, soll), `${wo}: Feld y2`);
  },
  genLinFunktion(q, wo) {
    const fs = (q.formula || '').split('\\qquad').filter(Boolean).map((t) => t.trim().replace(/^[fg](?:_k)?\(x\)=/, '')), f = (x, k) => texWert(fs[0], { x, k }), g = (x) => texWert(fs[1], { x }), z = zahlen(q.prompt), r = richtig(q);
    const gerade = (o) => { const t = o.tex.replace(/^f\(x\)=/, ''); return (x) => texWert(t, { x }); };
    if (q.kind === 'wert') { wertPruefen(q, wo, f(z[0])); ok(nah(q.r, f(z[0])), `${wo}: Feld r`); }
    else if (q.kind === 'abschnitt') wertPruefen(q, wo, /Steigung/.test(q.prompt) ? f(1) - f(0) : f(0));
    else if (q.kind === 'steigung2') wertPruefen(q, wo, (z[3] - z[1]) / (z[2] - z[0]));
    else if (q.kind === 'null') { ok(nah(f(antwort(r.tex)), 0) && nah(q.r, antwort(r.tex)), `${wo}: ${r.tex} ist Nullstelle von ${q.formula}`); for (const o of falsche(q)) ok(Math.abs(f(antwort(o.tex))) > 1e-7, `${wo}: Ablenker ${o.tex} ist auch Nullstelle`); }
    else if (q.kind === 'punkt') { const [m, px, py] = z, trifft = (o) => nah(gerade(o)(px), py) && nah(gerade(o)(1) - gerade(o)(0), m); ok(trifft(r), `${wo}: ${r.tex} hat Steigung ${m} und geht durch P`); for (const o of falsche(q)) ok(!trifft(o), `${wo}: Ablenker ${o.tex} passt auch`); }
    else if (q.kind === 'schnitt') { const xs = antwort(r.tex); ok(nah(f(xs), g(xs)), `${wo}: Schnittstelle ${r.tex}`); for (const o of falsche(q)) ok(!nah(f(antwort(o.tex)), g(antwort(o.tex)), 1e-7), `${wo}: Ablenker ${o.tex} ist auch Schnittstelle`); }
    else if (q.kind === 'zweipunkt') { const trifft = (o) => nah(gerade(o)(z[0]), z[1]) && nah(gerade(o)(z[2]), z[3]); ok(trifft(r), `${wo}: ${r.tex} geht durch beide Punkte · ${q.prompt}`); for (const o of falsche(q)) ok(!trifft(o), `${wo}: Ablenker ${o.tex} geht auch durch beide Punkte`); }
    else if (q.kind === 'schnittpunkt') { const xs = (g(0) - f(0)) / (f(1) - f(0) - (g(1) - g(0))); wertPruefen(q, wo, f(xs)); ok(nah(f(xs), g(xs)), `${wo}: Schnittpunkt liegt auf beiden Geraden`); }
    else if (q.kind === 'param') { const x0 = z[z.length - 1]; ok(nah(f(x0, antwort(r.tex)), 0), `${wo}: für ${r.tex} ist ${x0} Nullstelle von ${q.formula}`); for (const o of falsche(q)) ok(Math.abs(f(x0, antwort(o.tex))) > 1e-7, `${wo}: Ablenker ${o.tex} passt auch`); }
    else if (q.kind === 'tarif') { const [g1, p1, g2, p2] = z.length === 4 ? z : [0, ...z], gleich = (x) => nah(g1 + p1 * x, g2 + p2 * x, 1e-9); ok(gleich(antwort(r.tex)) && antwort(r.tex) > 0, `${wo}: bei ${r.tex} kosten beide Tarife gleich viel · ${q.prompt}`); for (const o of falsche(q)) ok(!gleich(antwort(o.tex)), `${wo}: Ablenker ${o.tex} passt auch`); }
    else throw new Error('unbekannte Form');
  },
  genKoerper(q, wo) {
    const z = zahlen(q.prompt), kegel = (r, h) => simpson((t) => Math.PI * (r * (1 - t / h)) ** 2, 0, h), kugel = (R) => simpson((t) => Math.PI * (R * R - t * t), -R, R); let soll;
    if (q.kind === 'grund') soll = z[0] * z[1];
    else if (q.kind === 'prisma') soll = simpson((t) => z[0] * (1 - t / z[1]), 0, z[1]) * z[2];   // Dreiecksfläche als Integral über die Breite
    else if (q.kind === 'zylinder') soll = kreisFlaeche(z[0]) * z[1];
    else if (q.kind === 'zyldurch') soll = kreisFlaeche(z[0] / 2) * z[1];
    else if (q.kind === 'kegel') soll = kegel(z[0], z[1]);
    else if (q.kind === 'pyramide') soll = simpson((t) => (z[0] * (1 - t / z[1])) ** 2, 0, z[1]);
    else if (q.kind === 'kugel') soll = kugel(z[0]);
    else if (q.kind === 'durchmesser') soll = kugel(z[0] / 2);
    else if (q.kind === 'hoehe') soll = (z[1] * Math.PI) / kreisFlaeche(z[0]);
    else if (q.kind === 'oberfl') soll = 2 * kreisFlaeche(z[0]) + kreisUmfang(z[0]) * z[1];
    else if (q.kind === 'silo') soll = kreisFlaeche(z[0]) * z[1] + kegel(z[0], z[2]);
    else if (q.kind === 'kegels') soll = kegel(z[0], Math.sqrt(z[1] ** 2 - z[0] ** 2));
    else if (q.kind === 'eis') soll = kegel(z[0], z[1]) + kugel(z[0]) / 2;
    else if (q.kind === 'rohr') soll = (kreisFlaeche(z[1]) - kreisFlaeche(z[1] - z[2])) * z[0];
    else throw new Error('unbekannte Form');
    wertPruefen(q, wo, soll, 1e-8, 1e-6);
  },
  genKreis(q, wo) {
    const z = zahlen(q.prompt); let soll;
    if (q.kind === 'umfang') soll = kreisUmfang(z[0]);
    else if (q.kind === 'flaeche') soll = kreisFlaeche(z[0]);
    else if (q.kind === 'durchu') soll = kreisUmfang(z[0] / 2);
    else if (q.kind === 'durcha') soll = kreisFlaeche(z[0] / 2);
    else if (q.kind === 'rueck') soll = (z[0] * Math.PI) / kreisUmfang(1);
    else if (q.kind === 'rueckflaeche') soll = kreisUmfang(Math.sqrt((z[0] * Math.PI) / kreisFlaeche(1)));
    else if (q.kind === 'halb') soll = kreisFlaeche(z[0]) / (/Viertelkreis/.test(q.prompt) ? 4 : 2);
    else if (q.kind === 'ring') soll = kreisFlaeche(z[0]) - kreisFlaeche(z[1]);
    else if (q.kind === 'sektor') soll = (kreisFlaeche(z[0]) * z[1]) / 360;
    else if (q.kind === 'bogen') soll = (kreisUmfang(z[0]) * z[1]) / 360;
    else if (q.kind === 'stadion') soll = /Flächeninhalt/.test(q.prompt) ? z[0] * z[1] + kreisFlaeche(z[1] / 2) : 2 * z[0] + kreisUmfang(z[1] / 2);
    else if (q.kind === 'rest') soll = z[0] ** 2 - kreisFlaeche(z[0] / 2);
    else if (q.kind === 'sektorumfang') soll = 2 * z[0] + (kreisUmfang(z[0]) * z[1]) / 360;
    else if (q.kind === 'ringrueck') soll = Math.sqrt((z[0] * Math.PI + kreisFlaeche(z[1])) / kreisFlaeche(1));
    else throw new Error('unbekannte Form');
    wertPruefen(q, wo, soll, 1e-8, 1e-6);
  },
  genLGS(q, wo) {
    const r = richtig(q);
    if (q.kind === 'sach') { const [n, pE, pK, E] = zahlen(q.prompt), treffer = []; for (let x = 0; x <= n; x++) if (x * pE + (n - x) * pK === E) treffer.push(`x=${x},\\ y=${n - x}`);   // alle Möglichkeiten durchprobieren
      ok(treffer.length === 1 && treffer[0] === r.tex, `${wo}: einzige Lösung ${treffer.join(' ; ')} ist die markierte (${r.tex})`); return; }
    const gl = q.formula.replace(/\\begin\{array\}\{l\}|\\end\{array\}/g, '').split('\\\\').map((t) => t.split('=')), seite = (t, x, y, k) => texWert(t, { x, y, k });
    if (q.kind === 'param') { const pruef = (k) => { const a1 = seite(gl[0][0], 1, 0, k), b1 = seite(gl[0][0], 0, 1, k), a2 = seite(gl[1][0], 1, 0, k), b2 = seite(gl[1][0], 0, 1, k), c1 = texWert(gl[0][1]), c2 = texWert(gl[1][1]); return nah(a1 * b2 - a2 * b1, 0) && !nah(a1 * c2 - a2 * c1, 0); };
      ok(pruef(antwort(r.tex)), `${wo}: für ${r.tex} hat ${q.formula} keine Lösung`); for (const o of falsche(q)) ok(!pruef(antwort(o.tex)), `${wo}: Ablenker ${o.tex} passt auch`); return; }
    const paar = (o) => { const m = /^x=(.*),\\ y=(.*)$/.exec(o.tex); return [texWert(m[1]), texWert(m[2])]; }, loest = (o) => { const [x, y] = paar(o); return gl.every(([l, re]) => nah(seite(l, x, y), texWert(re))); };
    ok(loest(r), `${wo}: ${r.tex} löst ${q.formula}`); for (const o of falsche(q)) ok(!loest(o), `${wo}: Ablenker ${o.tex} löst das System auch`);
    ok(!nah(seite(gl[0][0], 1, 0) * seite(gl[1][0], 0, 1) - seite(gl[1][0], 1, 0) * seite(gl[0][0], 0, 1), 0), `${wo}: eindeutig lösbar`);
    ok(nah(q.x0, paar(r)[0]) && nah(q.y0, paar(r)[1]), `${wo}: Felder x0, y0`);
  },
  genBinom(q, wo) {
    const r = richtig(q), stellen = [{ x: 0.7, y: 1.9 }, { x: -1.3, y: 0.4 }, { x: 2.1, y: -0.6 }, { x: 5.5, y: 3.2 }];
    if (q.kind === 'ergaenzen') { const quadrat = (o) => { const p = (x) => texWert(q.formula.replace('\\square', `(${o.tex})`), { x }), c = p(0), a = (p(1) + p(-1)) / 2 - c, b = (p(1) - p(-1)) / 2; return nah(b * b - 4 * a * c, 0); };   // vollständiges Quadrat: Diskriminante null
      ok(quadrat(r), `${wo}: mit ${r.tex} wird ${q.formula} ein Quadrat`); for (const o of falsche(q)) ok(!quadrat(o), `${wo}: Ablenker ${o.tex} ergibt auch ein Quadrat`); return; }
    const gleich = (o) => stellen.every((v) => nah(texWert(o.tex, v), texWert(q.formula, v), 1e-9));
    ok(gleich(r), `${wo}: ${r.tex} ist gleich ${q.formula}`); for (const o of falsche(q)) ok(!gleich(o), `${wo}: Ablenker ${o.tex} ist auch gleich ${q.formula}`);
    if (/Produkt|Faktoren|Quadrat/.test(q.prompt)) ok(/\(/.test(r.tex) && !/[+-][^()]*$/.test(r.tex.replace(/\^2$/, '')), `${wo}: Antwort ist ein Produkt (${r.tex})`);
  },
  genLog(q, wo) {
    const r = richtig(q);
    if (q.kind === 'sach') { const p = zahlen(q.prompt)[0], F = /verdreifacht/.test(q.prompt) ? 3 : 2; let lo = 0, hi = 200; for (let k = 0; k < 80; k++) { const mi = (lo + hi) / 2; if ((1 + p / 100) ** mi < F) lo = mi; else hi = mi; }   // Intervallhalbierung
      ok(Math.abs(antwort(r.tex) - lo) <= 0.0501, `${wo}: ${r.tex} (nachgerechnet ${lo}) · ${q.prompt}`); for (const o of falsche(q)) ok(Math.abs(antwort(o.tex) - lo) > 0.2, `${wo}: Ablenker ${o.tex} liegt zu nah an ${lo}`); return; }
    if (/Gleichung/.test(q.prompt)) { const [l, re] = q.formula.split('='), R = texWert(re), abw = (o) => { const d = Math.abs(texWert(l, { x: antwort(o.tex) }) - R) / Math.abs(R); return Number.isNaN(d) ? Infinity : d; }, tol = /Runde/.test(q.prompt) ? 0.012 : 1e-9;
      ok(abw(r) <= tol, `${wo}: ${r.tex} löst ${q.formula} (Abweichung ${abw(r)})`); for (const o of falsche(q)) ok(abw(o) > Math.max(3 * tol, 1e-6), `${wo}: Ablenker ${o.tex} löst ${q.formula} auch (Abweichung ${abw(o)})`); return; }
    wertPruefen(q, wo, texWert(q.formula));
  },
  genBruchMal(q, wo) {
    const z = zahlen(q.prompt), r = richtig(q); let soll;
    if (q.formula) soll = texWert(q.formula);
    else if (q.kind === 'von') soll = (z[2] / z[1]) * z[0];
    else if (q.kind === 'sach') { const inhalt = (z[0] / z[2]) * z[1]; soll = inhalt - (inhalt / z[4]) * z[3]; }
    else throw new Error('unbekannte Form');
    wertPruefen(q, wo, soll); const t = bruchTeile(r.tex); ok(t && ggt(t[0], t[1]) === 1, `${wo}: Ergebnis vollständig gekürzt (${r.tex})`);
  },
};

/** Lösungsweg: Alle Rechenketten ohne Unbekannte müssen stimmen (bei genBinom auch Term-Umformungen, mit Probewerten für die Variablen). */
function ketten(q, wo, name) {
  const texte = [...q.hints, q.explain, ...q.options.map((o) => o.why || '')].join(' ¦ '), vars = name === 'genBinom' ? { x: 0.37, y: 1.21, a: 0.83, b: 1.57 } : {};
  const teil = (t) => { let u = t.trim(); if (!u) return null; const sig = [...u.matchAll(/\\text\{([^}]*)\}(\^\d)?/g)].map((m) => m[1] + (m[2] || '')).join('|'), proz = /\\,\\%$/.test(u);
    u = u.replace(/\\,\\%$/, '').replace(/\\text\{[^}]*\}(\^\d)?/g, ''); try { const v = texWert(u, vars); return Number.isFinite(v) ? { v: proz ? v / 100 : v, sig } : null; } catch { return null; } };
  for (const m of texte.matchAll(/⟦([^⟧]*)⟧( Rest)?/g)) {
    const seg = m[1]; if (m[2] || /\\begin|\\ldots|\\square|\\mid|\?/.test(seg) || (name === 'genBinom' && /^[ab]=/.test(seg))) continue;
    const st = seg.split(/(=|\\approx|\\neq|<|>)/), w = st.map((t, k) => (k % 2 ? t : teil(t)));
    for (let k = 0; k + 2 < w.length; k += 2) { const a = w[k], b = w[k + 2], op = w[k + 1]; if (!a || !b || (a.sig && b.sig && a.sig !== b.sig)) continue;
      const gut = op === '=' ? nah(a.v, b.v, 1e-9) : op === '\\approx' ? Math.abs(a.v - b.v) <= Math.max(0.051, 0.001 * Math.abs(b.v)) : op === '\\neq' ? !nah(a.v, b.v, 1e-9) : op === '<' ? a.v < b.v : a.v > b.v;
      ok(gut, `${wo}: Rechenkette im Lösungsweg stimmt nicht – ${st[k]} ${op} ${st[k + 2]} (${a.v} gegen ${b.v}) in „${seg}“`); }
  }
}

const formen = {};
for (const [name, pruefe] of Object.entries(PRUEFER)) {
  const fn = G[name]; ok(typeof fn === 'function', `${name}: Erzeuger vorhanden`); if (typeof fn !== 'function') continue;
  for (let lv = 1; lv <= 5; lv++) {
    seedRandom(4200 + lv * 17 + name.length);
    for (let i = 0; i < 200; i++) {
      const q = fn(lv), wo = `${name} Stufe ${lv} [${q.kind ?? ''}]`; ((formen[name] ||= {})[lv] ||= new Set()).add(q.kind ?? '-');
      aufbau(q, wo); ketten(q, wo, name);
      try { pruefe({ ...q, prompt: roh(q.prompt) }, wo); } catch (e) { ok(false, `${wo}: Nachrechnen gescheitert – ${e.message} · ${q.prompt} ${q.formula ?? ''} · ${q.options.map((o) => o.tex).join(' | ')}`); }
    }
  }
}
seedRandom(null);
if (process.argv.includes('--formen')) for (const [name, je] of Object.entries(formen)) console.log(name.padEnd(18), Object.entries(je).map(([lv, s]) => `${lv}: ${[...s].join(', ')}`).join(' · '));
if (fehler) { console.error(`hart/gen6a: ${fehler} von ${pruefungen} Prüfungen fehlgeschlagen`); process.exit(1); }
console.log(`hart/gen6a: ${pruefungen} Prüfungen bestanden`);
