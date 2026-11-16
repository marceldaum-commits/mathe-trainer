// Harte Prüfung für app/js/gen7.js (Themen der Klassen 5 bis 10): Jede Aufgaben-Form wird je Stufe 200-mal erzeugt
// und die richtige Antwort unabhängig nachgerechnet (auswerten, einsetzen, abzählen, durchprobieren, numerisch abtasten).
// Aufruf: node tests/hart/gen7.mjs
globalThis.window = { katex: { renderToString: (s) => s } };
const { GENS7 } = await import('../../app/js/gen7.js');
const { seedRandom } = await import('../../app/js/math.js');

const START = +(process.env.SEED || 4200), ANZAHL = +(process.env.N || 200);   // fester Zufall; mit SEED=… und N=… lässt sich breiter suchen
let n = 0; const fehler = [];
const ok = (bed, text) => { n++; if (!bed && fehler.length < 40) fehler.push(text); };
const nah = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol;
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const dez = (s) => +String(s).replace(/\\,/g, '').replace(/\{,\}/g, '.').replace(',', '.');
const RAD = Math.PI / 180;

/** Liest den Zahlenwert einer Antwort aus ihrer Anzeige (ganze Zahl, Dezimalzahl, Bruch, mit Einheit) – oder null. */
function anzeige(t) {
  let s = String(t).replace(/^x=/, '').replace(/\\approx ?/, '').replace(/\\,\\text\{[^}]*\}(\^\d)?$/, '').replace(/\\,\\%$/, '').replace(/\^\\circ$/, '');
  let m = s.match(/^(-?)\\dfrac\{(\d+)\}\{(\d+)\}$/); if (m) return (m[1] ? -1 : 1) * (+m[2] / +m[3]);
  m = s.match(/^(-?[\d{},\\]*\d)?\\pi$/); if (m) return m[1] === undefined ? 1 : dez(m[1]);
  return /^-?\d[\d{},\\]*$/.test(s) ? dez(s) : null;
}
const punkt = (t) => { const m = String(t).match(/\((-?[\d{},]+)\\mid ?(-?[\d{},]+)\)/); return m ? [dez(m[1]), dez(m[2])] : null; };
const punkte = (t) => [...String(t).matchAll(/\((-?[\d{},]+)\\mid ?(-?[\d{},]+)\)/g)].map((m) => [dez(m[1]), dez(m[2])]);
const zahlen = (t) => [...String(t).replace(/<[^>]+>/g, ' ').matchAll(/-?\d+(?:,\d+)?/g)].map((m) => dez(m[0]));
/** Rechenausdruck (TeX der App) auswerten: Dezimalkomma, Mal-Punkt, Geteilt-Zeichen, Potenzen mit richtiger Bindung. */
const rechne = (f) => Function(`return (${f.replace(/\\,/g, '').replace(/\{,\}/g, '.').replace(/\\cdot ?/g, '*').replace(/:/g, '/').replace(/(\(-?[\d.]+\)|[\d.]+)\^(\d)/g, '($1**$2)')})`)();
/** Lineare Gleichung der App nach x lösen: beide Seiten als Funktion von x, dann über zwei Stützstellen. */
function loese(formula) {
  const [li, re] = formula.split('='), f = (t) => Function('x', `return (${t.replace(/\\dfrac\{x\}\{(\d+)\}/g, '(x/$1)').replace(/(\d)\(/g, '$1*(').replace(/(\d)x/g, '$1*x')})`);
  const g = (x) => f(li)(x) - f(re)(x), g0 = g(0), g1 = g(1);
  return { x: -g0 / (g1 - g0), g };
}

/** Unabhängige Rechnung je Erzeuger und Aufgaben-Form. Liefert den Sollwert (Zahl, Punkt [x, y] oder Wahrheitswert). */
const SOLL = {
  genSchriftlich: () => (q) => rechne(q.formula),
  genRational: () => (q) => rechne(q.formula),
  genGleichungKlammer: () => (q, r) => { const { x, g } = loese(q.formula); return nah(g(r.num), 0, 1e-9) && nah(g(r.num + 1) - g(r.num), g(1) - g(0), 1e-9) ? x : NaN; },
  genKoordinaten: {
    weg: (q) => { const z = zahlen(q.prompt); return [z[0], z[1]]; },
    schieben: (q) => { const [A] = punkte(q.prompt), z = zahlen(q.prompt.split('wird um')[1]); return [A[0] + z[0], A[1] - z[1]]; },
    abstand: (q) => { const [A, B] = punkte(q.prompt); let d = 0; for (let x = Math.min(A[0], B[0]); x < Math.max(A[0], B[0]); x++) d++; for (let y = Math.min(A[1], B[1]); y < Math.max(A[1], B[1]); y++) d++; return d; },
    ecke: (q) => { const [A, B, C] = punkte(q.prompt); return [A[0] + C[0] - B[0], A[1] + C[1] - B[1]]; },
    quadrant: (q) => { const [P] = punkte(q.prompt); return P[0] > 0 && P[1] > 0 ? 1 : P[0] < 0 && P[1] > 0 ? 2 : P[0] < 0 && P[1] < 0 ? 3 : 4; },
    mitte: (q) => { const [A, B] = punkte(q.prompt); return [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2]; },
    flaeche: (q) => { const { x1, y1, x2, y2 } = q.daten; let k = 0; for (let x = x1; x < x2; x++) for (let y = y1; y < y2; y++) k++; return k; },   // Kästchen abzählen
    spiegeln: (q) => { const { x, y, ay, dx, dy } = q.daten, s = ay ? [-x, y] : [x, -y]; return [s[0] + dx, s[1] - dy]; },
    parallelogramm: (q, r) => { const { A, B, C } = q.daten, D = punkt(r.tex); return nah(A[0] + C[0], B[0] + D[0]) && nah(A[1] + C[1], B[1] + D[1]) ? D : [NaN, NaN]; },   // Diagonalen halbieren sich
    dreieck: (q) => { const { A, B, C } = q.daten; return Math.abs(A[0] * (B[1] - C[1]) + B[0] * (C[1] - A[1]) + C[0] * (A[1] - B[1])) / 2; },   // Gaußsche Trapezformel
    bild: (q) => { const { x, y, ay, u, h } = q.daten, Q = [(ay ? -x : x) + u, (ay ? y : -y) + h]; return [(x + Q[0]) / 2, (y + Q[1]) / 2]; },
    diagonal: (q, r) => { const { A, B, M } = q.daten, D = punkt(r.tex), C = [2 * M[0] - A[0], 2 * M[1] - A[1]]; return nah((B[0] + D[0]) / 2, M[0]) && nah((B[1] + D[1]) / 2, M[1]) && nah(C[0] - B[0], D[0] - A[0]) && nah(C[1] - B[1], D[1] - A[1]) ? D : [NaN, NaN]; },
  },
  genDiagramm: {
    summe: (q) => { let s = 0; for (const v of q.daten.w) s += v; return s; },
    meist: (q) => [...q.daten.w].sort((a, b) => b - a)[0],
    unterschied: (q) => Math.abs(q.daten.w[q.daten.i1] - q.daten.w[q.daten.i2]),
    zusammen: (q) => q.daten.w.filter((_, i) => i !== q.daten.i1 && i !== q.daten.i2).reduce((s, v) => s + v, 0),
    fehlt: (q) => { const z = zahlen(q.prompt); return z[0] - z.slice(1).reduce((s, v) => s + v, 0); },
    anteil: (q) => q.daten.w[q.daten.i1] / q.daten.w.reduce((s, v) => s + v, 0),
    mittel: (q) => q.daten.w.reduce((s, v) => s + v, 0) / q.daten.w.length,
    doppelt: (q, r) => { const namen = [...q.prompt.matchAll(/([A-Za-zäöüß ]+): (\d+)/g)].map((m) => [m[1].trim(), +m[2]]), ziel = q.prompt.match(/wie „([^“]+)“/)[1], wahl = r.tex.match(/\\text\{(.+)\}/)[1];
      const wert = (na) => namen.find((x) => x[0] === na || x[0].endsWith(na))[1]; return wert(wahl) === 2 * wert(ziel) && namen.filter((x) => x[1] === 2 * wert(ziel)).length === 1 ? r.num : NaN; },
    mittelfehlt: (q) => { const teil = q.prompt.split('Im Durchschnitt'), bekannt = zahlen(teil[0].split('):')[1]), z = zahlen(teil[1]); return z[1] * z[0] - bekannt.reduce((s, v) => s + v, 0); },
    bild: (q) => { let kinder = 0; for (const s of q.daten.sy) kinder += s * q.daten.k; return kinder / q.daten.sy.length; },
    nachher: (q) => { const { w, i1, z } = q.daten; let alle = 0, gut = 0; w.forEach((v, i) => { alle += v; if (i === i1) gut += v; }); return (gut + z) / (alle + z); },
  },
  genProzentStart: {
    feld: (q) => zahlen(q.prompt)[0],
    bruch: (q) => { const m = q.formula.match(/\{(\d+)\}\{(\d+)\}/); return (100 * m[1]) / m[2]; },
    von: (q) => { const [p, G] = zahlen(q.prompt); let s = 0; for (let i = 0; i < p; i++) s += G / 100; return s; },
    hundert: (q) => 100 - zahlen(q.prompt)[0],
    zurueck: (q) => { const [W, G] = zahlen(q.prompt); return (W / G) * 100; },
    rest: (q) => { const [G, p] = zahlen(q.prompt); return G - (G * p) / 100; },
    vergleich: (q) => ((100 * q.daten.z) / q.daten.n > q.daten.p2 ? 1 : 2),
    grundwert: (q) => { for (let G = 1; G < 1000; G++) if (nah((G * q.daten.p) / 100, q.daten.W)) return G; return NaN; },   // durchprobieren
    rabatt: (q) => q.daten.P0 * (1 - q.daten.q / 100),
    kette: (q) => { let P = q.daten.P0; P += (P * q.daten.p1) / 100; P -= (P * q.daten.p2) / 100; return P; },
    misch: (q) => { const { n1, p1, n2, p2 } = q.daten; let im = 0; for (let i = 0; i < n1; i++) if (i < (n1 * p1) / 100) im++; for (let i = 0; i < n2; i++) if (i < (n2 * p2) / 100) im++; return (im / (n1 + n2)) * 100; },
    vorher: (q, r) => (nah(r.num * (1 - q.daten.q / 100), q.daten.Nn, 1e-6) ? r.num : NaN),   // Probe: alter Preis minus Senkung = neuer Preis
  },
  genWinkelArt: {
    art: (q, r) => { const w = q.daten.w, name = w < 90 ? 'spitzer' : w === 90 ? 'rechter' : w < 180 ? 'stumpfer' : w === 180 ? 'gestreckter' : 'überstumpfer'; return r.tex.includes(`{${name} Winkel}`) ? r.num : NaN; },
    drehung: (q) => (360 / q.daten.nn) * q.daten.zl,
    uhr: (q) => { const { h, min } = q.daten, st = ((h % 12) + min / 60) * 30, mi = (min / 60) * 360, d = Math.abs(st - mi); return Math.min(d, 360 - d); },
    uhrmin: (q) => { const { h, m } = q.daten; let st = (h % 12) * 30, mi = 0; for (let i = 0; i < m; i++) { st += 0.5; mi += 6; } const d = Math.abs(st - mi) % 360; return Math.min(d, 360 - d); },   // Minute für Minute weiterdrehen
    rest: (q, r) => (nah(q.daten.a + q.daten.b + r.num, 180) ? r.num : NaN),
    voll: (q, r) => (nah(q.daten.a + r.num, 360) ? r.num : NaN),
    ueber: (q, r) => (nah(r.num + q.daten.k * r.num, 180) ? r.num : NaN),
    dreieck: (q) => 180 - (180 - q.daten.a - q.daten.b),
    gleichschenklig: (q) => { for (let b = 0.25; b < 90; b += 0.25) if (nah(2 * b + q.daten.g, 180)) return 180 - b; return NaN; },
    verhaeltnis: (q, r) => { const { a, b, c } = q.daten, t = r.num / c; return nah(a * t + b * t + c * t, 180) && c > b && b > a ? r.num : NaN; },
  },
  genZufallStart: {
    sicher: (q) => (/eine 7\.|eine blaue/.test(q.prompt) ? 0 : /Münze/.test(q.prompt) ? 0.5 : 1),
    urne: (q) => { const { r, b, g } = q.daten, kugeln = [...'r'.repeat(r), ...'b'.repeat(b), ...'g'.repeat(g)]; return kugeln.filter((k) => k === 'r').length / kugeln.length; },
    nicht: (q) => { const { r, b, g } = q.daten, kugeln = [...'r'.repeat(r), ...'b'.repeat(b), ...'g'.repeat(g)]; return kugeln.filter((k) => k !== 'r').length / kugeln.length; },
    wuerfel: (q) => { const t = q.daten.t, prim = (k) => k > 1 && [2, 3, 5].includes(k), pass = { 'eine gerade Zahl': (k) => k % 2 === 0, 'eine Zahl größer als 4': (k) => k > 4, 'eine 6': (k) => k === 6, 'eine Zahl kleiner als 6': (k) => k < 6, 'eine Primzahl': prim, 'eine Zahl, die durch 3 teilbar ist': (k) => k % 3 === 0 }[t]; return [1, 2, 3, 4, 5, 6].filter(pass).length / 6; },
    haeufig: (q) => (q.daten.k / q.daten.n) * 100,
    erwartet: (q) => (q.daten.wuerfe * q.daten.z) / q.daten.n,
    zweiwuerfel: (q) => { let k = 0; for (let i = 1; i <= 6; i++) for (let j = 1; j <= 6; j++) if (i + j === q.daten.s) k++; return k / 36; },
    rad: (q) => { let gelb = 0; for (let w = 0; w < 360; w++) if (w >= q.daten.a + q.daten.b) gelb++; return gelb / 360; },
    ohne: (q) => { const { r, b, k } = q.daten, kugeln = [...'r'.repeat(r - k), ...'b'.repeat(b)]; return kugeln.filter((x) => x === 'r').length / kugeln.length; },
    zweimal: (q) => { const { r, b, g, mz } = q.daten, kugeln = [...'r'.repeat(r), ...'b'.repeat(b), ...'g'.repeat(g)]; let alle = 0, gleich = 0;
      for (let i = 0; i < kugeln.length; i++) for (let j = 0; j < kugeln.length; j++) { if (!mz && i === j) continue; alle++; if (kugeln[i] === kugeln[j]) gleich++; } return gleich / alle; },   // alle Paare abzählen
    nachlegen: (q) => { const { r, b, z, nn } = q.daten; for (let x = 0; x < 500; x++) if (nah((r + x) / (r + b + x), z / nn, 1e-12)) return x; return NaN; },   // durchprobieren
    mindestens: (q) => { const { z, nn } = q.daten; let k = 0; for (let i = 0; i < nn; i++) for (let j = 0; j < nn; j++) if (i < z || j < z) k++; return k / (nn * nn); },   // alle Feld-Paare abzählen
  },
  genVieleck: {
    parallelogramm: (q) => { const { g, h } = q.daten; return schuh([[0, 0], [g, 0], [g + 1.5, h], [1.5, h]]); },
    dreieck: (q) => { const { g, h } = q.daten; return schuh([[0, 0], [g, 0], [g / 3, h]]); },
    trapez: (q) => { const { a, c, h } = q.daten; return schuh([[0, 0], [a, 0], [c + 0.5, h], [0.5, h]]); },
    trapezdez: (q) => { const { a, c, h } = q.daten; return schuh([[0, 0], [a, 0], [c + 0.5, h], [0.5, h]]); },
    rueck: (q, r) => (nah(schuh([[0, 0], [q.daten.g, 0], [1, r.num]]), q.daten.A) ? r.num : NaN),
    rueckt: (q, r) => (nah(schuh([[0, 0], [q.daten.a, 0], [r.num + 0.5, q.daten.h], [0.5, q.daten.h]]), q.daten.A) ? r.num : NaN),
    zusammen: (q) => { const { g, r, hd } = q.daten; return schuh([[0, 0], [g, 0], [g, r], [g / 2, r + hd], [0, r]]); },
    schenkel: (q) => { const { a, c, s } = q.daten, e = (a - c) / 2, h = Math.sqrt(s * s - e * e); return schuh([[0, 0], [a, 0], [a - e, h], [e, h]]); },
    parameter: (q, r) => { const { k, d, h, F } = q.daten, c = r.num, a = k * c + d; return nah(schuh([[0, 0], [a, 0], [c + 0.5, h], [0.5, h]]), F) ? c : NaN; },
    grundstueck: (q) => { const { a, c, h, gd, hd, pr } = q.daten; return (schuh([[0, 0], [a, 0], [c + 1, h], [1, h]]) - schuh([[0, 0], [gd, 0], [0, hd]])) * pr; },
  },
  genPrisma: {
    prisma: (q) => q.daten.G * q.daten.h,
    rueck: (q, r) => (nah(q.daten.G * r.num, q.daten.V) ? r.num : NaN),
    liter: (q) => { const { a, b, c } = q.daten; let w = 0; for (let x = 0; x < a; x++) for (let y = 0; y < b; y++) for (let z = 0; z < c; z++) w++; return w; },   // Dezimeter-Würfel abzählen
    dreiprisma: (q) => schuh([[0, 0], [q.daten.g, 0], [1, q.daten.hd]]) * q.daten.h,
    trapezprisma: (q) => schuh([[0, 0], [q.daten.a, 0], [q.daten.c + 1, q.daten.ht], [1, q.daten.ht]]) * q.daten.l,
    zylinder: (q) => kreis(q.daten.r) * q.daten.h / Math.PI,
    mantel: (q) => (2 * Math.PI * q.daten.r * q.daten.h) / Math.PI,
    oberflaeche: (q) => (2 * kreis(q.daten.r) + 2 * Math.PI * q.daten.r * q.daten.h) / Math.PI,
    rohr: (q) => { const { Ra, ri, l, rho } = q.daten; return ((kreis(Ra) - kreis(ri)) * l * rho) / 1000; },
    fuell: (q, r) => { const V = kreis(q.daten.dcm / 2) * r.num; return Math.abs(V / 1000 - q.daten.L) < (kreis(q.daten.dcm / 2) * 0.051) / 1000 ? r.num : NaN; },   // Probe: Volumen bei dieser Höhe
    rampe: (q) => { const { ka, kb, l } = q.daten; return 2 * schuh([[0, 0], [ka, 0], [0, kb]]) + ka * l + kb * l + Math.hypot(ka, kb) * l; },
  },
  genExpFunktion: {
    start: (q) => q.daten.a * q.daten.b ** 0,
    wert: (q) => { let v = q.daten.a; for (let i = 0; i < q.daten.n; i++) v *= q.daten.b; return v; },
    faktor: (q) => (nah(q.daten.y1 / q.daten.a, q.daten.y2 / q.daten.y1) ? q.daten.y2 / q.daten.y1 : NaN),
    prozent: (q) => (100 + (q.daten.ab ? -1 : 1) * q.daten.p) / 100,
    term: (q, r) => { const m = r.tex.match(/^(\d+)\\cdot ?([\d{},]+)\^x$/), { s, p, ab } = q.daten; let v = s; for (let x = 1; x <= 4; x++) { v += ((ab ? -1 : 1) * v * p) / 100; if (!m || !nah(+m[1] * dez(m[2]) ** x, v, 1e-6)) return false; } return true; },
    art: (q, r) => { const w = q.daten.w, lin = nah(w[1] - w[0], w[2] - w[1]) && nah(w[2] - w[1], w[3] - w[2]), ex = nah(w[1] / w[0], w[2] / w[1]) && nah(w[2] / w[1], w[3] / w[2]); return lin !== ex && r.tex === `\\text{${lin ? 'linear' : 'exponentiell'}}`; },
    halb: (q) => { let v = q.daten.s; for (let t = q.daten.T2; t <= q.daten.T2 * q.daten.k; t += q.daten.T2) v /= 2; return v; },
    zweipunkte: (q, r) => { const b = q.daten.y1 / r.num; return b > 0 && nah(r.num * b ** 3, q.daten.y3, 1e-6) ? r.num : NaN; },
    zins: (q) => { let K = q.daten.K0; for (let j = 0; j < q.daten.jahre; j++) K += (K * q.daten.p) / 100; return K; },
    wachszeit: (q) => halbiere((t) => (1 + q.daten.p / 100) ** t - q.daten.k, 0, 400),
    zerfall: (q) => halbiere((t) => q.daten.x / 100 - 0.5 ** (t / q.daten.T2), 0, 4000),
    dreipunkt: (q, r) => { const b = Math.sqrt(q.daten.y2 / r.num); return nah(r.num * b ** 5, q.daten.y5, 1e-3) ? r.num : NaN; },
  },
  genSinusFkt: {
    amplitude: (q) => { let mx = -1e9; for (let x = 0; x <= 720; x += 0.5) mx = Math.max(mx, q.daten.a * Math.sin(q.daten.b * x * RAD)); return mx; },
    wert: (q) => q.daten.a * Math.sin(q.daten.w * RAD),
    mittel: (q) => (q.daten.lo + q.daten.hi) / 2,
    periode: (q) => periode((x) => Math.sin(q.daten.b * x * RAD)) / 180,
    periodegrad: (q) => periode((x) => Math.sin(q.daten.b * x * RAD)),
    bereich: (q) => { let mn = 1e9; for (let x = 0; x <= 360; x += 0.5) mn = Math.min(mn, q.daten.a * Math.sin(x * RAD) + q.daten.d); return mn; },
    max: (q) => { let mx = -1e9; for (let x = 0; x <= 360; x += 0.5) mx = Math.max(mx, q.daten.a * Math.sin(x * RAD) + q.daten.d); return mx; },
    wertb: (q) => q.daten.a * Math.sin(q.daten.bb * q.daten.x0 * RAD) + q.daten.d,
    term: (q, r) => { const m = r.tex.match(/^([\d{},]+)\\sin\(([\d{},]*)x\)([+-][\d{},]+)$/); if (!m) return false; const A = dez(m[1]), Bf = m[2] ? dez(m[2]) : 1, D = dez(m[3]), f = (x) => A * Math.sin(Bf * x) + D;   // x im Bogenmaß
      let mn = 1e9, mx = -1e9; for (let x = 0; x <= 8 * Math.PI; x += 0.001) { mn = Math.min(mn, f(x)); mx = Math.max(mx, f(x)); } const p = (2 * Math.PI) / q.daten.bb;
      return nah(mn, q.daten.lo, 1e-4) && nah(mx, q.daten.hi, 1e-4) && [0.3, 1.1, 2.9].every((x) => nah(f(x + p), f(x), 1e-9) && !nah(f(x + p / 2), f(x), 1e-6)); },
    gleichung: (q) => { const { aa, d, cc } = q.daten, f = (x) => aa * Math.sin(x * RAD) + d - cc, ns = []; for (let x = 0; x < 360; x += 0.05) if (f(x) === 0 || f(x) * f(x + 0.05) < 0) ns.push(halbiere(f, x, x + 0.05)); return ns.length === 2 ? Math.max(...ns) : NaN; },
    riesenrad: (q) => { const { rr, k, m0, H } = q.daten, T = 360 / k, f = (t) => rr * Math.sin(k * t * RAD) + m0 - H, w = []; for (let t = 0; t < T; t += 0.01) if (f(t) * f(t + 0.01) < 0) w.push(halbiere(f, t, t + 0.01));   // Zeitpunkte abtasten, an denen die Höhe gekreuzt wird
      return w.length === 2 && f((w[0] + w[1]) / 2) > 0 ? w[1] - w[0] : NaN; },
    kennwerte: (q) => { const { hi, lo, Pg, w } = q.daten; return ((hi - lo) / 2) * Math.sin((360 / Pg) * w * RAD) + (hi + lo) / 2; },
  },
};
function schuh(P) { let s = 0; for (let i = 0; i < P.length; i++) { const [x1, y1] = P[i], [x2, y2] = P[(i + 1) % P.length]; s += x1 * y2 - x2 * y1; } return Math.abs(s) / 2; }   // Fläche eines Vielecks aus den Ecken
function kreis(r) { let s = 0; const N = 20000; for (let i = 0; i < N; i++) { const x = ((i + 0.5) / N) * r; s += 2 * Math.PI * x * (r / N); } return s; }   // Kreisfläche als Summe dünner Ringe
function halbiere(f, a, b) { let fa = f(a); for (let i = 0; i < 200; i++) { const m = (a + b) / 2, fm = f(m); if ((fa < 0) === (fm < 0)) { a = m; fa = fm; } else b = m; } return (a + b) / 2; }
function periode(f) { for (let p = 5; p <= 1440; p += 5) if ([7, 31, 113, 200].every((x) => nah(f(x + p), f(x), 1e-9))) return p; return NaN; }   // kleinste Verschiebung, bei der sich alles wiederholt

/** Erlaubte Abweichung: gerundete Antworten („≈“, Cent-Beträge) dürfen um eine halbe letzte Stelle abweichen. */
const STELLEN = { misch: 1, rohr: 2, fuell: 1, wachszeit: 1, zerfall: 1, gleichung: 1, riesenrad: 1, zins: 2 };
const toleranz = (q) => (q.kind in STELLEN ? 0.5 * 10 ** -STELLEN[q.kind] + 1e-9 : 1e-6);

const gesehen = {};
for (const [name, fn] of Object.entries(GENS7)) for (let lv = 1; lv <= 5; lv++) { seedRandom(START + lv);
  for (let i = 0; i < ANZAHL; i++) { const q = fn(lv), wo = `${name} Stufe ${lv} (${q.kind}): ${q.formula ?? q.prompt}`, r = q.options.filter((o) => o.correct);
    ((gesehen[name] ||= {})[lv] ||= new Set()).add(q.kind);
    ok(q.options.length === 4 && r.length === 1, `${wo} – vier Antworten, genau eine richtig`);
    ok(new Set(q.options.map((o) => o.tex)).size === 4, `${wo} – Antworten doppelt`);
    ok(q.options.every((o) => o.correct || (typeof o.why === 'string' && o.why.length > 12)), `${wo} – Ablenker ohne Diagnose`);
    ok(Array.isArray(q.hints) && q.hints.length >= 2 && q.hints.every((h) => typeof h === 'string' && h.length > 3) && typeof q.explain === 'string' && q.explain.length > 5, `${wo} – Tipps/Erklärung fehlen`);
    const alles = [q.prompt, q.formula, q.explain, ...q.hints, ...q.options.flatMap((o) => [o.tex, o.why])].filter((t) => t !== undefined).join(' ¦ ');
    ok(!/undefined|NaN|Infinity|\[object|null/.test(alles), `${wo} – kaputter Wert in: ${alles.match(/.{0,30}(undefined|NaN|Infinity|\[object|null).{0,20}/)?.[0]}`);
    ok(!/\d\.\d/.test(alles), `${wo} – Punkt statt Komma: ${alles.match(/.{0,20}\d\.\d.{0,10}/)?.[0]}`);
    ok(!/[+-]-|\+\+/.test([q.formula ?? '', ...q.hints, q.explain].join(' ').replace(/\^\{-1\}/g, '')), `${wo} – doppelte Vorzeichen: ${[q.formula ?? '', ...q.hints, q.explain].join(' ').match(/.{0,25}([+-]-|\+\+).{0,15}/)?.[0]}`);
    ok(q.kind && typeof q.kind === 'string', `${wo} – Aufgaben-Form ohne Namen`);
    if (r.length !== 1) continue;
    // Anzeige und gespeicherter Wert passen zusammen (soweit die Anzeige eine Zahl ist)
    if (q.kind !== 'vergleich') for (const o of q.options) { const a = anzeige(o.tex); if (a !== null && typeof o.num === 'number') ok(nah(a, o.num, /\{,\}\d{2,}|dfrac|approx/.test(o.tex) ? 6e-3 : 1e-9) || nah(a, o.num, 5.1e-5), `${wo} – Anzeige ${o.tex} passt nicht zum Wert ${o.num}`); }
    for (const o of q.options) if (o.tex.includes('dfrac')) { const m = o.tex.match(/\\dfrac\{(\d+)\}\{(\d+)\}/); ok(gcd(+m[1], +m[2]) === 1 && +m[2] > 1, `${wo} – Bruch ${o.tex} nicht gekürzt`); }
    // unabhängig nachrechnen
    const S = SOLL[name], f = typeof S === 'function' ? S() : S[q.kind];
    ok(typeof f === 'function', `${wo} – keine Nachrechnung für diese Aufgaben-Form`); if (typeof f !== 'function') continue;
    let soll; try { soll = f(q, r[0]); } catch (e) { soll = NaN; ok(false, `${wo} – Nachrechnung wirft: ${e.message}`); }
    if (typeof soll === 'boolean') { ok(soll, `${wo} – richtige Antwort ${r[0].tex} hält der Nachrechnung nicht stand`); ok(q.options.every((o) => o.correct || o.tex !== r[0].tex), `${wo} – Ablenker gleich der Lösung`); }
    else if (Array.isArray(soll)) { const P = punkt(r[0].tex); ok(P && nah(P[0], soll[0]) && nah(P[1], soll[1]), `${wo} – Punkt ${r[0].tex}, nachgerechnet (${soll})`);
      for (const o of q.options) if (!o.correct) { const F = punkt(o.tex); ok(F && !(nah(F[0], soll[0]) && nah(F[1], soll[1])), `${wo} – Ablenker ${o.tex} ist auch richtig`); } }
    else { const tol = toleranz(q); ok(nah(r[0].num, soll, tol), `${wo} – Antwort ${r[0].tex} (${r[0].num}), nachgerechnet ${soll}`);
      const a = anzeige(r[0].tex); if (a !== null && q.kind !== 'vergleich' && !r[0].tex.includes('\\text{')) ok(nah(a, soll, Math.max(tol, 5.1e-5)), `${wo} – angezeigte Antwort ${r[0].tex}, nachgerechnet ${soll}`);
      for (const o of q.options) if (!o.correct) ok(typeof o.num === 'number' && Math.abs(o.num - soll) > Math.max(tol, 1e-6), `${wo} – Ablenker ${o.tex} ist auch richtig (${soll})`); }
  } }
seedRandom(null);
// Jede Stufe bringt eigene Aufgaben-Formen, und jede Form wurde nachgerechnet
for (const [name, je] of Object.entries(gesehen)) { const saetze = [1, 2, 3, 4, 5].map((lv) => [...je[lv]].sort().join(','));
  ok(new Set(saetze).size === 5, `${name}: nicht jede Stufe hat ihren eigenen Satz von Aufgaben-Formen (${saetze.join(' | ')})`);
  ok(new Set(saetze.join(',').split(',')).size >= 9, `${name}: weniger als neun Aufgaben-Formen`);
  ok(!saetze[4].split(',').some((k) => saetze[0].split(',').includes(k) || saetze[1].split(',').includes(k)), `${name}: Stufe 5 teilt Aufgaben-Formen mit Stufe 1 oder 2`); }

for (const f of fehler) console.error('FEHLER:', f);
if (fehler.length) { console.error(`hart/gen7: ${fehler.length}${fehler.length >= 40 ? '+' : ''} Befunde`); process.exit(1); }
console.log(`hart/gen7: ${n} Prüfungen bestanden`);
