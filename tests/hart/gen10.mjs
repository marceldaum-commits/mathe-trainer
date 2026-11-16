// Harte Prüfung für app/js/gen10.js (steile Aufgaben, Stufe 4 und 5): Jede Aufgaben-Form wird je Liste mindestens 200-mal erzeugt
// und die richtige Antwort UNABHÄNGIG nachgerechnet – durch Einsetzen in die gezeigte Formel, Abzählen aller Fälle, Durchprobieren
// oder einen zweiten Rechenweg (Heron statt Kreuzprodukt, Kosinussatz statt Skalarprodukt, Determinante statt Spatprodukt …).
// Außerdem: genau eine richtige Antwort, jeder Ablenker ist wirklich falsch, Lösungsweg vollständig, kein „undefined“/„NaN“.
globalThis.window = { katex: { renderToString: (s) => s } };
const { schwer, THEMEN10 } = await import('../../app/js/gen10.js');
const { seedRandom } = await import('../../app/js/math.js');

let n = 0, fehler = 0; const gesehen = new Set();
const ok = (bed, msg, q) => { n++; if (!bed) { fehler++; if (!gesehen.has(msg)) { gesehen.add(msg); console.error('FEHLER:', msg, q ? `\n   ${q.prompt}\n   ${q.formula ?? ''}\n   ${q.options.map((o) => (o.correct ? '*' : '') + o.tex).join('  |  ')}\n   ${JSON.stringify(q.daten)}` : ''); } } };
const nah = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));

/* ───── Werkzeuge: Formel-Quelltext ausrechnen ───── */
/** Rechnet einfachen TeX-Quelltext aus (Brüche, Wurzeln, Potenzen, „:“, weggelassene Malpunkte). */
function texWert(t, vars = {}) {
  let s = String(t).replace(/\{,\}/g, '.').replace(/\\(left|right|,|;|!|quad|qquad| )/g, '').replace(/\\cdot/g, '*').replace(/\\[dt]?frac/g, '\\F').replace(/:/g, '/').replace(/\s+/g, '');
  for (let alt = ''; alt !== s;) { alt = s;
    s = s.replace(/\\F\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))').replace(/\\sqrt\[(\d+)\]\{([^{}]*)\}/g, '(($2)**(1/$1))').replace(/\\sqrt\{([^{}]*)\}/g, '√($1)').replace(/\^\{([^{}]*)\}/g, '**($1)').replace(/\^(\d)/g, '**$1'); }
  s = s.replace(/\|([^|]*)\|/g, '∥($1)').replace(/([0-9a-z)])(?=[a-z(√∥])/g, '$1*').replace(/\)(?=\d)/g, ')*');
  s = s.replace(/(^|\()-/g, '$10-').replace(/√/g, 'Math.sqrt').replace(/∥/g, 'Math.abs');
  const namen = Object.keys(vars);
  try { return new Function(...namen, `return (${s});`)(...namen.map((k) => vars[k])); } catch (e) { if (process.env.ZEIG) console.error('texWert:', t, '→', s, e.message); return NaN; }
}
/** Zahl aus einer Antwort lesen: Bruch, Dezimalzahl (auch mit „≈“, „x=“, Einheit). */
function texZahl(t) {
  const s = String(t).replace(/\\approx ?/, '').replace(/^[a-z](_\d)?=/, '').replace(/\\,\\text\{[^}]*\}(\^\d)?|\\,\\%|\^\\circ/g, '');
  let m = s.match(/^(-?)\\dfrac\{(\d+)\}\{(\d+)\}$/); if (m) return { wert: (m[1] ? -1 : 1) * m[2] / m[3], stellen: null, z: +m[2], nn: +m[3] };
  m = s.match(/^-?\d+(\{,\}(\d+))?$/); if (m) return { wert: +s.replace('{,}', '.'), stellen: (m[2] || '').length };
  return null;
}
const ggt = (a, b) => (b ? ggt(b, a % b) : Math.abs(a));
const punkt = (t, name) => { const m = String(t).match(new RegExp(`${name.replace(/[\\^*]/g, '\\$&')}\\(([^()]*)\\)`)); return m ? m[1].split('\\mid ').map((c) => +c.replace('{,}', '.')) : null; };
const dot = (a, b) => a.reduce((s, c, i) => s + c * b[i], 0), sub = (a, b) => a.map((c, i) => c - b[i]), add = (a, b, k = 1) => a.map((c, i) => c + k * b[i]), len = (a) => Math.sqrt(dot(a, a));
const kreuz = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
/** Liegt X auf der Geraden p + t·u? Liefert t oder null. */
const aufGerade = (X, p, u) => { const i = u.findIndex((c) => c !== 0), t = (X[i] - p[i]) / u[i]; return X.every((c, j) => nah(c, p[j] + t * u[j], 1e-7)) ? t : null; };
/** Lösungsmenge aus „x_1=2,\ x_2=5“, „x=\pm 3,\ x=\pm 4“, „t=7“. */
const menge = (t) => { const out = []; for (const m of String(t).matchAll(/=(\\pm ?)?(-?\d+)/g)) { out.push(+m[2]); if (m[1]) out.push(-m[2]); } return [...new Set(out)].sort((a, b) => a - b); };
const gleich = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
/** Alle ganzzahligen Lösungen einer Bedingung im Bereich −300…300. */
const ganze = (f) => { const out = []; for (let x = -300; x <= 300; x++) if (f(x)) out.push(x); return out; };
const seiten = (formel) => formel.split('=');
const zahlen = (t) => (String(t).replace(/<[^>]+>/g, ' ').match(/\d+/g) || []).map(Number);

/* ───── Unabhängiges Nachrechnen je Aufgaben-Form: liefert eine Prüfung „stimmt diese Antwort?“ ───── */
const zahl = (soll, tol = 1e-9) => (o) => nah(o.num, soll, tol);
const XS = [0.7, -1.3, 2.1, 3.4];
const term = (q) => (o) => XS.every((x) => nah(texWert(q.formula, { x }), texWert(o.tex, { x }), 1e-7));
const loest = (q, v = 'x') => (o) => { const [l, r] = seiten(q.formula), x = texZahl(o.tex)?.wert ?? o.num; return nah(texWert(l, { [v]: x }), texWert(r, { [v]: x }), 1e-7); };
const wurzeln = (q, ohneNull) => { const [l, r] = seiten(q.formula), soll = ganze((x) => !(ohneNull && x === 0) && nah(texWert(l, { x }), texWert(r, { x }), 1e-9)); return (o) => gleich(menge(o.tex), soll) && soll.length > 0; };
const MERK = {}, merk = (k, f) => (MERK[k] ??= f());
const folge = (B, n) => merk(`f${B},${n}`, () => { const out = []; for (let c = 0; c < B ** n; c++) { const z = []; let x = c; for (let j = 0; j < n; j++) { z.push(x % B); x = Math.floor(x / B); } out.push(z); } return out; });
const anteil = (alle, gut) => alle.filter(gut).length / alle.length;
const teilmengen = (N, k) => merk(`t${N},${k}`, () => { const out = []; for (let x = 0; x < 1 << N; x++) { const m = []; for (let j = 0; j < N; j++) if ((x >> j) & 1) m.push(j); if (m.length === k) out.push(m); } return out; });
const perm0 = (a) => (a.length <= 1 ? [a] : a.flatMap((x, i) => perm0([...a.slice(0, i), ...a.slice(i + 1)]).map((p) => [x, ...p])));
const perm = (a) => merk(`p${a.length}`, () => perm0(a));
const urne = (r, b) => merk(`u${r},${b}`, () => { const k = [...Array(r).fill(1), ...Array(b).fill(0)], out = []; for (let x = 0; x < k.length; x++) for (let y = 0; y < k.length; y++) for (let z = 0; z < k.length; z++) if (x !== y && y !== z && x !== z) out.push([k[x], k[y], k[z]]); return out; });
/** 100 Personen mal 100 (mal 100) Testausgänge durchzählen: Anteil der Personen mit Eigenschaft unter allen, die die Bedingung erfüllen. */
const test100 = (k, s, f, zwei, bed) => { let alle = 0, mit = 0; for (let i = 0; i < 100; i++) for (let j = 0; j < 100; j++) for (let l = 0; l < (zwei ? 100 : 1); l++) { const hat = i < k, pos = (v) => (hat ? v < s : v < f); if (bed(pos(j), pos(l))) { alle++; if (hat) mit++; } } return mit / alle; };
const grad = (x) => (x * 180) / Math.PI;

const PRUEF = {
  // Grundlagen: in die gezeigte Formel einsetzen
  dreibrueche: (q) => zahl(texWert(q.formula)), klammerbruch: (q) => zahl(texWert(q.formula)), doppelbruch: (q) => zahl(texWert(q.formula)), klammerquotient: (q) => zahl(texWert(q.formula)),
  anteilkette: (q, d) => { let v = d.a / d.b; v -= (v * d.c) / d.d; v += d.e / d.f; v -= (v * d.g) / d.h; return zahl(v); },
  zweiklammern: term, differenz: term, binomsumme: term, binomdifferenz: term, dreiklammern: term, dreiterm: term,
  bruchgleichung: (q) => loest(q), kreuz: (q) => loest(q), dreibruch: (q) => loest(q),
  tarif: (q, d) => { const f = (x) => 12 * d.g1 + (d.p1 / 100) * x - (12 * d.g2 - d.bo + (d.p2 / 100) * x); return zahl(-f(0) / (f(1) - f(0)), 1e-7); },
  parametergl: (q, d) => (o) => [d.c + 2.5, d.c - 1.75].every((a) => { const x = texWert(o.tex.replace('x=', ''), { a }); return nah(a * (x - d.b), d.c * x + d.d, 1e-7); }),
  faktor: (q) => wurzeln(q), umstellen: (q) => wurzeln(q), biquadratisch: (q) => wurzeln(q), bruchquadrat: (q) => wurzeln(q, true), kehrwertform: (q) => wurzeln(q, true),
  potenzpotenz: (q) => (o) => nah(texWert(q.formula, { x: 1.37 }), texWert(o.tex, { x: 1.37 }), 1e-7), negativ: (q) => (o) => nah(texWert(q.formula, { x: 1.37 }), texWert(o.tex, { x: 1.37 }), 1e-7),
  rational: (q) => (o) => nah(texWert(q.formula, { x: 1.37 }), texWert(o.tex, { x: 1.37 }), 1e-7),
  zweivariablen: (q) => (o) => nah(texWert(q.formula, { x: 1.37, y: 0.83 }), texWert(o.tex, { x: 1.37, y: 0.83 }), 1e-7),
  zahlpotenz: (q) => (o) => [2, 3, 5].every((nn) => nah(texWert(q.formula, { n: nn }), o.num, 1e-7)),
  kette: (q, d) => { let p = d.G; p += (p * d.p1) / 100; p -= (p * d.p2) / 100; return zahl(p); },
  anteil: (q, d) => { let c = 0; for (let i = 0; i < d.M; i++) if (i < (d.M * d.p) / 100 && i < (((d.M * d.p) / 100) * d.k) / 100) c++; return zahl(c); },
  rueckwaerts: (q, d) => (o) => nah(o.num * (1 - d.p / 100), d.neu, 1e-9),
  ausgleich: (q, d) => (o) => nah(100 * (1 + d.p1 / 100) * (1 + d.p2 / 100) * (1 - o.num / 100), 100, 1e-9),
  mischung: (q, d) => zahl((100 * ((d.m1 * d.p1) / 100 + (d.m2 * d.p2) / 100)) / (d.m1 + d.m2 - d.w)),
  // Geometrie der Mittelstufe: mit Koordinaten nachmessen
  raumdiagonale: (q, d) => zahl(len([d.a, d.b, d.c])), kiste: (q, d) => zahl(len([d.a, d.b, d.c])),
  trapez: (q, d) => (o) => { const x = (d.a - d.c) / 2, e = o.num, h2 = e * e - (d.a - x) ** 2; return h2 > 0 && nah(Math.hypot(x, Math.sqrt(h2)), d.s, 1e-9); },
  pyramide: (q, d) => (o) => { const h = (3 * o.num) / (d.a * d.a); return nah(len([d.a / 2, d.a / 2, h]), d.s, 1e-9); },
  leiter: (q, d) => (o) => { const h1 = Math.sqrt(d.l * d.l - d.a * d.a); return o.num > 0 && nah(Math.hypot(d.a + d.r, h1 - o.num), d.l, 1e-9); },
  fehlend: (q, d) => (o) => nah((d.w.reduce((s, v) => s + v, 0) + o.num) / d.n, d.m), neuerwert: (q, d) => (o) => nah((d.n * d.m + o.num) / (d.n + 1), d.neu), absinken: (q, d) => (o) => nah((d.n * d.m + o.num) / (d.n + 1), d.neu),
  // Stochastik: alle Fälle abzählen
  augensumme: (q, d) => zahl(anteil(folge(6, 2), (z) => z[0] + z[1] + 2 === d.s)),
  mindestens: (q, d) => zahl(anteil(folge(6, d.n), (z) => z.includes(5))), maximum: (q, d) => zahl(anteil(folge(6, d.n), (z) => Math.max(...z) === 5)),
  verschieden: (q, d) => zahl(anteil(urne(d.r, d.b), (z) => z[0] !== z[1])), dreistufig: (q, d) => zahl(anteil(urne(d.r, d.b), (z) => z[0] + z[1] + z[2] >= 2)), lostrommel: (q, d) => zahl(anteil(urne(d.r, d.b), (z) => 3 - z[0] - z[1] - z[2] <= 1)),
  mindestenseiner: (q, d) => zahl(anteil(folge(d.B, d.n), (z) => z.filter((v) => v < d.a).length >= 1)), genau: (q, d) => zahl(anteil(folge(d.B, d.n), (z) => z.filter((v) => v < d.a).length === d.k)), mindestensk: (q, d) => zahl(anteil(folge(d.B, d.n), (z) => z.filter((v) => v < d.a).length >= d.k)),
  mindestanzahl: (q, d) => { const p = d.k0 / d.N0; let m = 1; while (1 - (1 - p) ** m < d.s / 100) m++; return zahl(m); },
  trefferp: (q, d) => { let lo = 0, hi = 1; for (let i = 0; i < 80; i++) { const p = (lo + hi) / 2; if (1 - (1 - p) ** d.n < d.c) lo = p; else hi = p; } const p = (lo + hi) / 2; let s = 0; for (const z of folge(2, d.n)) if (z.filter((v) => v).length === 1) s += z.reduce((w, v) => w * (v ? p : 1 - p), 1); return zahl(s, 2e-4); },
  bayes: (q, d) => zahl(test100(d.k, d.s, d.f, false, (p1) => p1)),
  negativtest: (q, d) => zahl(test100(d.k, d.s, d.f, false, (p1) => !p1)),
  zweitest: (q, d) => zahl(merk(`z${d.k},${d.s},${d.f}`, () => test100(d.k, d.s, d.f, true, (p1, p2) => p1 && p2))),
  dreimaschinen: (q, d) => { let f = 0, c = 0; for (let i = 0; i < 100; i++) for (let j = 0; j < 100; j++) { const m = i < d.a1 ? 0 : i < d.a1 + d.a2 ? 1 : 2; if (j < [d.p1, d.p2, d.p3][m]) { f++; if (m === 2) c++; } } return zahl(c / f); },
  spiel: (q, d) => zahl([1, 2, 3, 4, 5, 6].reduce((s, w) => s + (w === 6 ? d.g : w === 5 ? d.h : 0) - d.e, 0) / 6),
  tombola: (q, d) => { let s = 0; for (let i = 0; i < d.L; i++) s += (i === 0 ? d.H : i <= d.k ? d.t : 0) - d.e; return zahl(s / d.L); },
  fair: (q, d) => (o) => { let s = 0; for (let i = 0; i < d.nn; i++) s += (i < d.zz ? o.num : 0) - d.e; return nah(s / d.nn, 0, 1e-9); },
  zweistufigfair: (q, d) => (o) => { let s = 0; for (let m = 0; m < 2; m++) for (let i = 0; i < d.nn; i++) s += (m === 1 && i < d.zz ? 2 * o.num : 0) - d.e; return nah(s / (2 * d.nn), 0, 1e-9); },
  auswahl: (q, d) => zahl(teilmengen(d.n, d.k).length),
  gemischterausschuss: (q, d) => zahl(teilmengen(d.m + d.j, 4).filter((t) => t.some((x) => x < d.m) && t.some((x) => x >= d.m)).length),
  getrennt: (q, d) => zahl(perm([...Array(d.n - 1).keys()].map((i) => i + 1)).filter((p) => Math.abs(p.indexOf(1) - p.indexOf(2)) !== 1).length),
  anagramm: (q, d) => { const z = (rest) => (rest.length === 0 ? 1 : [...new Set(rest)].reduce((s, c) => { const i = rest.indexOf(c); return s + z([...rest.slice(0, i), ...rest.slice(i + 1)]); }, 0)), b = [...d.w], i = b.indexOf(d.b); b.splice(i, 1); return zahl(z(b)); },
  // Geraden in der Ebene
  zweipunkte: (q, d) => (o) => { const f = (x) => texWert(o.tex.replace('y=', ''), { x }); return nah(f(d.x1), d.y1) && nah(f(d.x2), d.y2); },
  parallele: (q, d) => (o) => { const f = (x) => texWert(o.tex.replace('y=', ''), { x }); return nah(f(1) - f(0), d.m) && nah(f(d.x0), d.y0); },
  lot: (q, d) => (o) => { const f = (x) => texWert(o.tex.replace('y=', ''), { x }); return nah((f(1) - f(0)) * ((d.y2 - d.y1) / (d.x2 - d.x1)), -1) && nah(f(d.x0), d.y0); },
  schnittbruch: (q, d) => (o) => { const m = o.tex.match(/^S\\left\((.*)\\mid (.*)\\right\)$/), x = texWert(m[1]), y = texWert(m[2]); return nah(y, (d.m1[0] / d.m1[1]) * x + d.b1) && nah(y, (d.m2[0] / d.m2[1]) * x + d.b2); },
  achsendreieck: (q, d) => { const m = (d.y2 - d.y1) / (d.x2 - d.x1), b = d.y1 - m * d.x1, x0 = -b / m, e = [[0, 0], [x0, 0], [0, b]]; let s = 0; for (let i = 0; i < 3; i++) s += e[i][0] * e[(i + 1) % 3][1] - e[(i + 1) % 3][0] * e[i][1]; return zahl(Math.abs(s) / 2); },
  // Vektoren
  abstandpunkte: (q, d) => zahl(len(sub(d.B, d.P))), vielfaches: (q, d) => zahl(len(d.a.map((c, i) => d.k * c - d.b[i]))),
  parameterabstand: (q, d) => { const soll = ganze((t) => nah(len(sub([d.b1, t, d.b3], d.P)), d.l)); return (o) => gleich(menge(o.tex), soll) && soll.length === 2; },
  parameterquadrat: (q, d) => { const L = Math.round(texWert(q.prompt.match(/Länge (.*)\?/)[1]) ** 2), soll = ganze((t) => t * t + (t + d.c) ** 2 + d.d * d.d === L); return (o) => L === d.L && gleich(menge(o.tex), soll) && soll.length === 2; },
  minimalabstand: (q, d) => { const ab = (t) => len(sub(add(d.p, d.u, t), d.Q)); let lo = -50, hi = 50; for (let i = 0; i < 200; i++) { const a = lo + (hi - lo) / 3, b = hi - (hi - lo) / 3; if (ab(a) < ab(b)) hi = b; else lo = a; } const t = (lo + hi) / 2;
    return (o) => { const F = punkt(o.tex, 'F'), dd = texWert(o.tex.match(/d=([^\\]*(\\sqrt\{\d+\})?)/)[1]); return F.every((c, i) => nah(c, d.p[i] + t * d.u[i], 1e-5)) && nah(dd, ab(t), 1e-6); }; },
  orthogonalparameter: (q, d) => (o) => nah(dot(d.a, [d.b[0], d.b[1], o.num]), 0),
  winkelglatt: (q, d) => zahl(grad(Math.atan2(len(kreuz(d.a, d.b)), dot(d.a, d.b))), 1e-7),
  winkelkrumm: (q, d) => { const c = len(sub(d.B, d.P)), b = len(sub(d.C, d.P)), a = len(sub(d.C, d.B)); return zahl(grad(Math.acos((b * b + c * c - a * a) / (2 * b * c))), 1e-7); },
  orthoquadrat: (q, d) => { const soll = ganze((t) => dot([t, d.p, 1], [t, d.q, d.r * t]) === 0); return (o) => gleich(menge(o.tex), soll) && soll.length === 2; },
  rechterwinkel: (q, d) => { const soll = ganze((t) => { const C = [t, d.c2, d.c3], l2 = (a, b) => dot(sub(a, b), sub(a, b)); return l2(d.P, C) + l2(d.B, C) === l2(d.P, d.B); }); return (o) => gleich(menge(o.tex), soll) && soll.length === 2; },
  parameter: (q, d) => (o) => d.p.every((c, i) => c + o.num * d.u[i] === d.X[i]),
  spurpunkt: (q, d) => (o) => { const S = punkt(o.tex, 'S'); return S[2] === 0 && aufGerade(S, d.p, d.u) !== null; },
  abstandaufgerade: (q, d) => (o) => { const X1 = punkt(o.tex, 'X_1'), X2 = punkt(o.tex, 'X_2'); return !!X1 && !!X2 && [X1, X2].every((X) => aufGerade(X, d.p, d.u) !== null && nah(len(sub(X, d.p)), d.D)) && !X1.every((c, i) => c === X2[i]); },
  schnittgeraden: (q, d) => (o) => { const S = punkt(o.tex, 'S'); return aufGerade(S, d.p, d.u) !== null && aufGerade(S, d.q, d.v) !== null; },
  parameterschnitt: (q, d) => (o) => { const qq = [d.q[0], d.q[1], o.num], det = d.u[0] * -d.v[1] + d.v[0] * d.u[1], e = sub(qq, d.p), r = (e[0] * -d.v[1] + d.v[0] * e[1]) / det, s = (d.u[0] * e[1] - d.u[1] * e[0]) / det; return [0, 1, 2].every((i) => nah(d.p[i] + r * d.u[i], qq[i] + s * d.v[i], 1e-9)); },
  durchstoss: (q, d) => (o) => { const S = punkt(o.tex, 'S'); return aufGerade(S, d.p, d.u) !== null && dot(d.n, S) === d.d; },
  punktparameter: (q, d) => (o) => nah(dot(d.n, [d.p1, o.num, d.p3]), d.d),
  parallelabstand: (q, d) => (o) => { const m = o.tex.match(/^a=(-?\d+),\\ \\text\{Abstand \} (.*)$/), a = +m[1], ab = texWert(m[2]), F = add(d.P, d.n, -(dot(d.n, d.P) - d.dE) / dot(d.n, d.n)); return dot(d.n, [d.u0, d.u1, a]) === 0 && nah(dot(d.n, F), d.dE) && nah(len(sub(F, d.P)), ab); },
  spiegelpunkt: (q, d) => (o) => { const S = punkt(o.tex, 'P^*'), M = S.map((c, i) => (c + d.P[i]) / 2); return nah(dot(d.n, M), d.d) && len(kreuz(sub(S, d.P), d.n)) < 1e-9 && len(sub(S, d.P)) > 0; },
  schnittwinkel: (q, d) => zahl(grad(Math.atan2(Math.abs(dot(d.u, d.n)), len(kreuz(d.u, d.n)))), 1e-7),
  kreuzprodukt: (q, d) => (o) => { const c = o.tex.match(/-?\d+/g).map(Number), det = d.u[0] * (d.v[1] * c[2] - d.v[2] * c[1]) - d.u[1] * (d.v[0] * c[2] - d.v[2] * c[0]) + d.u[2] * (d.v[0] * c[1] - d.v[1] * c[0]);
    return c.length === 3 && dot(c, d.u) === 0 && dot(c, d.v) === 0 && dot(c, c) === dot(d.u, d.u) * dot(d.v, d.v) - dot(d.u, d.v) ** 2 && det > 0; },
  parallelogramm: (q, d) => zahl(Math.sqrt(dot(d.u, d.u) * dot(d.v, d.v) - dot(d.u, d.v) ** 2), 1e-7),
  dreieckkrumm: (q, d) => { const a = len(sub(d.B, d.P)), b = len(sub(d.C, d.P)), c = len(sub(d.C, d.B)), s = (a + b + c) / 2; return zahl(Math.sqrt(s * (s - a) * (s - b) * (s - c)), 1e-6); },
  pyramidenvolumen: (q, d) => { const [u, v, w] = [d.B, d.C, d.D].map((X) => sub(X, d.P)), det = u[0] * v[1] * w[2] + v[0] * w[1] * u[2] + w[0] * u[1] * v[2] - u[2] * v[1] * w[0] - v[2] * w[1] * u[0] - w[2] * u[1] * v[0]; return zahl(Math.abs(det) / 6); },
  hoehe: (q, d) => { const u = sub(d.B, d.P), v = sub(d.C, d.P); return zahl(len(add(v, u, -dot(v, u) / dot(u, u))), 1e-7); },
};
// Zahlen aus „daten“, die nicht als Ziffern in der Aufgabe stehen (ausgeschrieben oder als Wurzel gezeigt)
const VERDECKT = { mindestensk: ['k'], mindestenseiner: ['k'], parameterquadrat: ['L'], rational: ['n'] };

/* ───── Durchlauf ───── */
const JE = +(process.env.N || 200), arten = { 4: {}, 5: {} };
seedRandom(20261116);
for (const th of THEMEN10) for (const lv of [4, 5]) { const zahlJe = {};
  for (let i = 0; i < 6000 && (i < 400 || Object.values(zahlJe).some((v) => v < JE)); i++) {
    const q = schwer(th)(lv), tag = `${th} ${lv} (${q.kind})`, r = q.options.filter((o) => o.correct); zahlJe[q.kind] = (zahlJe[q.kind] || 0) + 1; arten[lv][q.kind] = th;
    ok(q.options.length === 4 && r.length === 1, `${tag}: vier Antworten, genau eine richtige`, q);
    ok(new Set(q.options.map((o) => o.tex)).size === 4, `${tag}: Antworten verschieden`, q);
    ok(q.options.every((o) => o.correct || (typeof o.why === 'string' && o.why.length > 20)), `${tag}: jeder Ablenker erklärt den typischen Fehler`, q);
    ok(Array.isArray(q.hints) && q.hints.length >= (lv === 5 ? 3 : 2) && q.hints.length <= 7 && q.hints.every((h) => typeof h === 'string' && h.length > 10), `${tag}: Lösungsweg mit ${lv === 5 ? '3 bis 7' : '2 bis 7'} Schritten`, q);
    ok(typeof q.explain === 'string' && q.explain.length > 12 && typeof q.prompt === 'string' && q.prompt.length > 10, `${tag}: Frage und Erklärung vorhanden`, q);
    const alles = JSON.stringify([q.prompt, q.formula ?? '', q.explain, q.hints, q.options.map((o) => [o.tex, o.why ?? ''])]);
    ok(!/undefined|NaN|Infinity|\[object|null/.test(alles), `${tag}: kein „undefined“/„NaN“ im Text`, q);
    ok(!/\d\.\d/.test(alles.replace(/\[6pt\]/g, '')), `${tag}: Dezimalkomma statt Punkt`, q);
    { const m = alles.replace(/<[^>]+>/g, '').match(/.{0,25}(\+-|--|\+\+|-\+|\{\}|\(\)|==).{0,15}/); ok(!m, `${tag}: keine doppelten Vorzeichen, keine leeren Klammern`, m ? { ...q, daten: m[0] } : q); }
    ok(!/\}\{-/.test(q.options.map((o) => o.tex).join(' ')), `${tag}: kein Minus im Nenner einer Antwort`, q);
    const pr = PRUEF[q.kind]; ok(!!pr, `${tag}: Form hat eine Nachrechnung`, q); if (!pr) continue;
    // Ausgangszahlen der Nachrechnung müssen in der Aufgabe stehen
    const sicht = new Set(zahlen(`${q.prompt} ${q.formula ?? ''}`)), text = `${q.prompt} ${q.formula ?? ''}`;
    for (const [k, v] of Object.entries(q.daten)) { if ((VERDECKT[q.kind] || []).includes(k)) continue;
      for (const w of [v].flat(3)) { if (typeof w === 'string') ok(text.includes(w), `${tag}: „${k}“ steht in der Aufgabe`, q); else if (Number.isInteger(w) && Math.abs(w) >= 2) ok(sicht.has(Math.abs(w)), `${tag}: Zahl „${k}“ steht in der Aufgabe`, q); } }
    let stimmt; try { stimmt = pr(q, q.daten); } catch (e) { ok(false, `${tag}: Nachrechnung wirft ${e.message}`, q); continue; }
    for (const o of q.options) { let s; try { s = !!stimmt(o); } catch (e) { s = `Fehler: ${e.message}`; }
      ok(s === !!o.correct, o.correct ? `${tag}: richtige Antwort unabhängig bestätigt` : `${tag}: Ablenker ist wirklich falsch`, q);
      // Anzeige und gespeicherter Zahlenwert passen zusammen; Brüche sind gekürzt
      if (typeof o.num === 'number') { const z = texZahl(o.tex); if (z) { ok(Math.abs(z.wert - o.num) <= (z.stellen === null ? 1e-9 : 0.5 * 10 ** -z.stellen + 1e-9), `${tag}: Anzeige passt zum Zahlenwert`, q); if (z.nn) ok(ggt(z.z, z.nn) === 1 && z.nn > 1, `${tag}: Bruch ist gekürzt`, q); if (z.stellen !== null && !/approx/.test(o.tex)) ok(Math.abs(z.wert - o.num) < 1e-7, `${tag}: gerundete Zahl trägt „≈“`, q); } }
    }
  }
  ok(Object.keys(zahlJe).length >= (lv === 5 ? 2 : 1), `${th} ${lv}: mindestens ${lv === 5 ? 'zwei Formen' : 'eine Form'}`);
  for (const [k, v] of Object.entries(zahlJe)) ok(v >= JE, `${th} ${lv} (${k}): mindestens ${JE} Aufgaben erzeugt (${v})`);
}
ok(Object.keys(arten[4]).every((k) => !(k in arten[5])), 'Stufe 4 und Stufe 5 haben verschiedene Aufgaben-Formen');
ok(Object.keys(PRUEF).every((k) => k in arten[4] || k in arten[5]), `jede Nachrechnung gehört zu einer Form (${Object.keys(PRUEF).filter((k) => !(k in arten[4]) && !(k in arten[5])).join(', ')})`);
ok(Object.keys(arten[5]).length >= 50 && Object.keys(arten[4]).length >= 30, `Formen: ${Object.keys(arten[4]).length} für Stufe 4, ${Object.keys(arten[5]).length} für Stufe 5`);

/* ───── Stufen-Nachweis: Liste 5 liegt im Maßstab klar über Liste 4 ───── */
{ globalThis.window.katex.renderToString = (s) => `<span class="katex"><annotation encoding="application/x-tex">${String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</annotation></span>`;
  const { kennzahlen } = await import('../../app/js/stufe.js');
  // Anspruch der einfachen Aufgaben auf Stufe 1 vor diesem Paket (tests/stufen.mjs, N=200) – Liste 5 soll mindestens das Doppelte erreichen
  const S1 = { bruch: 17.5, klammer: 11.9, lingl: 11.7, quadgl: 26.2, potenz: 39.0, prozent: 10.4, pythagoras: 30.0, kennwerte: 7.5, laplace: 16.4, steigung: 21.3, baum: 19.6, binomial: 34.3, bedingt: 26.1, erwartung: 20.7, kombinatorik: 9.3, betrag: 38.5, skalar: 39.0, gerade: 23.4, ebene: 27.9, kreuz: 39.4 };
  for (const th of THEMEN10) { const m = [4, 5].map((lv) => { seedRandom(500 + lv); let s = 0; for (let i = 0; i < 300; i++) s += kennzahlen(schwer(th)(lv)).anspruch; return s / 300; });
    ok(m[1] >= 1.25 * m[0], `${th}: Liste 5 mindestens 1,25-mal so anspruchsvoll wie Liste 4 (${m[0].toFixed(1)} → ${m[1].toFixed(1)})`);
    ok(m[1] >= 2 * S1[th], `${th}: Liste 5 mindestens doppelt so anspruchsvoll wie die einfachen Aufgaben auf Stufe 1 (${S1[th]} → ${m[1].toFixed(1)})`);
    ok(m[0] >= 1.25 * S1[th], `${th}: Liste 4 klar über den einfachen Aufgaben auf Stufe 1 (${S1[th]} → ${m[0].toFixed(1)})`); }
  seedRandom(null); }

if (fehler) { console.error(`hart/gen10: ${fehler} Fehler bei ${n} Prüfungen`); process.exit(1); }
console.log(`hart/gen10: ${n} Prüfungen bestanden`);
