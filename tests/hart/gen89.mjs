// Harte Prüfung für das Paket gen89 (app/js/gen8.js, app/js/gen9.js): Je Erzeuger und Stufe 200 Aufgaben.
// Allgemein: genau eine richtige Antwort, vier verschiedene Antworten, Ablenker wirklich falsch, Tipps vorhanden, keine kaputten Werte.
// Je neuer oder geänderter Aufgaben-Form: Die richtige Antwort wird unabhängig nachgerechnet – numerisch abgeleitet, numerisch
// integriert, durch Probieren, Abzählen oder Einsetzen; nie mit der Formel des Erzeugers.
globalThis.window = { katex: { renderToString: (s) => s } };
const { GENS8 } = await import('../../app/js/gen8.js');
const { GENS9 } = await import('../../app/js/gen9.js');

let n = 0; const fehler = new Map();
const ok = (b, m) => { n++; if (!b) fehler.set(m, (fehler.get(m) || 0) + 1); };
const nah = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
const nahL = (a, b, tol) => a.length === b.length && a.every((v, i) => nah(v, b[i], tol));
const abl = (f, x, h = 1e-5) => (f(x + h) - f(x - h)) / (2 * h);
const abl2 = (f, x, h = 1e-3) => (f(x + h) - 2 * f(x) + f(x - h)) / (h * h);
const simpson = (f, a, b, m = 4000) => { let s = f(a) + f(b); for (let i = 1; i < m; i++) s += f(a + ((b - a) * i) / m) * (i % 2 ? 4 : 2); return (s * (b - a)) / (3 * m); };
const bisekt = (f, lo, hi) => { let a = lo, b = hi, fa = f(a); for (let i = 0; i < 200; i++) { const m = (a + b) / 2, fm = f(m); if ((fa < 0) === (fm < 0)) { a = m; fa = fm; } else b = m; } return (a + b) / 2; };
const mini = (f, lo, hi) => { let a = lo, b = hi; for (let i = 0; i < 300; i++) { const m1 = a + (b - a) / 3, m2 = b - (b - a) / 3; if (f(m1) < f(m2)) b = m2; else a = m1; } return (a + b) / 2; };
const dot = (a, b) => a.reduce((s, c, i) => s + c * b[i], 0), plus = (a, b, t = 1) => a.map((c, i) => c + t * b[i]), len = (a) => Math.sqrt(dot(a, a));
const kreuz = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
/** Abstand Punkt–Ebene über das Lot: Schnitt der Lotgeraden mit der Ebene durch Bisektion. */
const abstPE = (nv, d, P) => Math.abs(bisekt((t) => dot(nv, plus(P, nv, t)) - d, -1e4, 1e4)) * len(nv);
/** Nächste Punkte zweier Geraden p+r·u und q+s·v über die beiden Lot-Bedingungen (2×2-Gleichungssystem). */
const naechste = (p, u, q, v) => { const w = plus(q, p, -1), a = dot(u, u), b = dot(u, v), c = dot(v, v), e1 = dot(w, u), e2 = dot(w, v), det = b * b - a * c, r = (b * e2 - c * e1) / det, s = (a * e2 - b * e1) / det; return { r, s, G: plus(p, u, r), H: plus(q, v, s) }; };
/** Binomialverteilung – eigene Summen. */
const bk = (m, k) => { let r = 1; for (let j = 0; j < k; j++) r = (r * (m - j)) / (j + 1); return r; };
const pmf = (m, p, k) => (k < 0 || k > m ? 0 : bk(m, k) * p ** k * (1 - p) ** (m - k));
const cdf = (m, p, k) => { let s = 0; for (let j = 0; j <= k; j++) s += pmf(m, p, j); return s; };
/** Extrempunkt prüfen: Ableitung null, Funktionswert stimmt, Art stimmt (1 = Hochpunkt, 0 = Tiefpunkt). */
const extrem = (f, x, y, art) => Math.abs(abl(f, x)) < 1e-5 * Math.max(1, Math.abs(y)) && nah(f(x), y, 1e-7) && (abl2(f, x) < 0) === (art === 1);
const wende = (f, x) => Math.abs(abl2(f, x)) < 2e-4 * Math.max(1, Math.abs(f(x))) && (abl2(f, x - 0.05) < 0) !== (abl2(f, x + 0.05) < 0);
const ebeneKoeff = (t) => { const [l, r] = t.replace(/^E(_\d)?:\\ /, '').split('='); return { nv: [1, 2, 3].map((i) => { const m = l.match(new RegExp(`([+-]?\\d*)x_${i}`)); return !m ? 0 : m[1] === '' || m[1] === '+' ? 1 : m[1] === '-' ? -1 : +m[1]; }), d: +r }; };
const kx = [1.3, 2.1];
/** Zu x den Parameter k suchen, bei dem die Schar dort ihre besondere Stelle hat (Ableitung bzw. zweite Ableitung null), und den y-Wert liefern. */
const ortsY = (fk, x, lo, hi, zweite = false) => { const k = bisekt((kk) => (zweite ? abl2 : abl)((t) => fk(t, kk), x), lo, hi); return fk(x, k); };

const P8 = {
  genUmkehr: {
    bruch: (q, r, { a, bb, c }) => [7.3, -0.4].every((y, i) => nah((a * r.val[i] + bb) / (r.val[i] + c), y)),
    explin: (q, r, { A, k, c }) => [c + 1.5, c + 7].every((y, i) => nah(A * Math.exp(k * r.val[i]) + c, y)),
    quadscheitel: (q, r, { d, cc, e }) => [Math.abs(e) + 3, Math.abs(e) + 8].every((y, i) => r.val[i] >= d && nah(r.val[i] ** 2 - 2 * d * r.val[i] + cc, y)),
    lnlin: (q, r, { A, bq, c, d0 }) => [d0 + 1, d0 + 2.5].every((y, i) => nah(A * Math.log(bq * r.val[i] + c) + d0, y)),
    ablumkehr: (q, r, { a, b0, y0 }) => { const f = (x) => x ** 3 + a * x + b0, x0 = bisekt((x) => f(x) - y0, -10, 10); return nah(1 / abl(f, x0), r.val, 1e-6); },
  },
  genWurzelAbl: {
    kettequad: (q, r, { a, c }) => nahL([0.7, 1.9].map((x) => abl((t) => Math.sqrt(a * t * t + c), x)), r.val),
    produkt: (q, r, { a, c }) => nahL([0.7, 1.9].map((x) => abl((t) => (a * t + c) * Math.sqrt(t), x)), r.val),
    tangentek: (q, r, { m, c, x0 }) => { const f = (x) => Math.sqrt(m * x + c), s = abl(f, x0); return nahL([s, f(x0) - s * x0], r.val); },
    extrem: (q, r, { a }) => { const f = (x) => x - a * Math.sqrt(x); return nah(mini(f, 0.01, 50), r.val[0], 1e-5) && extrem(f, r.val[0], r.val[1], r.val[2]) && r.val[2] === 0; },
    schar: (q, r, { a }) => [3, 5].every((k, i) => { const f = (x) => a * Math.sqrt(x) * (x - k); return nah(mini(f, 0.01, k), r.val[3 * i], 1e-5) && extrem(f, r.val[3 * i], r.val[3 * i + 1], 0) && r.val[3 * i + 2] === 0; }),
  },
  genIntegralfunktion: {
    extremart: (q, r, { p, q: qq, max }) => { const f = (t) => t * t - (p + qq) * t + p * qq, J = (x) => simpson(f, 0, x, 400), x = r.num; return Math.abs(f(x)) < 1e-9 && (max ? J(x) > J(x - 0.1) && J(x) > J(x + 0.1) : J(x) < J(x - 0.1) && J(x) < J(x + 0.1)); },
    kette: (q, r, { m, b, a }) => nahL([0.7, 1.6].map((x) => abl((t) => simpson((s) => m * s + b, a, t * t, 200), x)), r.val, 1e-5),
    nullstellen: (q, r, { m, b, a }) => !nah(r.num, a) && Math.abs(simpson((t) => m * t + b, a, r.num, 400)) < 1e-8,
    tiefpunkt: (q, r, { c, p }) => { const f = (t) => c * (t * t - p * p), J = (x) => simpson(f, 0, x, 400); return nah(mini(J, 0, 3 * p), r.val[0], 1e-5) && nah(J(r.val[0]), r.val[1], 1e-7) && r.val[2] === 0; },
  },
  genNewton: {
    allg: (q, r, { a, c, x0 }) => { const f = (x) => x ** 3 + a * x - c; return Math.abs(x0 - f(x0) / abl(f, x0) - r.num) < 6e-4; },
    zweischritt: (q, r, { c, x0 }) => { const f = (x) => x * x - c, st = (x) => x - f(x) / abl(f, x); return Math.abs(st(st(x0)) - r.num) < 6e-5; },
    exp: (q, r, { k, c, x0 }) => { const f = (x) => Math.exp(x) + k * x - c; return Math.abs(x0 - f(x0) / abl(f, x0) - r.num) < 6e-5; },
    schnitt: (q, r, { a, c, x0 }) => { const f = (x) => Math.log(x) - (c - a * x); return Math.abs(x0 - f(x0) / abl(f, x0) - r.num) < 6e-5; },
  },
  genOrtskurve: {
    scheitelallg: (q, r, { cc, d }) => kx.every((x, i) => nah(ortsY((t, k) => t * t - 2 * k * t + cc * k + d, x, -50, 50), r.val[i], 1e-6)),
    kubikallg: (q, r, { a, c }) => kx.every((x, i) => nah(ortsY((t, k) => a * t ** 3 - 3 * a * k * t * t + c, x, 0.01, 50), r.val[i], 1e-5)),
    expschar: (q, r, { a }) => kx.every((x, i) => nah(ortsY((t, k) => a * t * Math.exp(-k * t), x, 0.01, 50), r.val[i], 1e-6)),
    wendeort: (q, r, { a, c }) => kx.every((x, i) => nah(ortsY((t, k) => a * t ** 3 + k * t * t + c, x, -200, 200, true), r.val[i], 1e-4)),
    lnschar: (q, r, { a }) => kx.every((x, i) => nah(ortsY((t, k) => a * Math.log(t) - k * t, x, 0.01, 50), r.val[i], 1e-6)),
  },
  genHesse: {
    normale: (q, r) => r.tex === `\\begin{pmatrix}${ebeneKoeff(q.formula).nv.join('\\\\')}\\end{pmatrix}`,
    abstandbruch: (q, r, { n: nv, d, P }) => nah(abstPE(nv, d, P), r.num, 1e-7),
    parallelebene: (q, r, { n: nv, d, D }) => r.val.length === 2 && r.val[0] !== r.val[1] && r.val.every((e) => nah(abstPE(nv, d, nv.map((c) => (c * e) / dot(nv, nv))), D, 1e-7)),
    parameter: (q, r, { n: nv, d, D, p1, p2 }) => r.val.length === 2 && !nah(r.val[0], r.val[1]) && r.val.every((a) => nah(abstPE(nv, d, [p1, p2, a]), D, 1e-7)),
    geradepunkt: (q, r, { n: nv, d, D, A, u }) => { const P = [r.val.slice(0, 3), r.val.slice(3)]; return r.val.length === 6 && !nahL(P[0], P[1]) && P.every((X) => len(kreuz(plus(X, A, -1), u)) < 1e-9 && nah(abstPE(nv, d, X), D, 1e-7)); },
    kugel: (q, r, { n: nv, d, M }) => { const B = r.val.slice(1); return nah(dot(nv, B), d) && len(kreuz(plus(M, B, -1), nv)) < 1e-9 && nah(len(plus(M, B, -1)), r.val[0]) && nah(abstPE(nv, d, M), r.val[0], 1e-7); },
  },
  genSchnittgerade: {
    senkrecht: (q, r, { m1, b2, b3 }) => Math.abs(dot(m1, [r.num, b2, b3])) < 1e-9,
    spurpunkt: (q, r, { n1, n2, e1, e2 }) => r.val[2] === 0 && nah(dot(n1, r.val), e1) && nah(dot(n2, r.val), e2),
    winkelallg: (q, r, { n1, n2 }) => Math.abs((Math.atan2(len(kreuz(n1, n2)), Math.abs(dot(n1, n2))) * 180) / Math.PI - r.num) < 0.051,
    gerade: (q) => dot(q.n1, q.A) === q.d1 && dot(q.n2, q.A) === q.d2 && dot(q.r, q.n1) === 0 && dot(q.r, q.n2) === 0,
  },
  genWindschief: {
    abstandbruch: (q, r, { u, v, p, q: qq }) => { const { G, H } = naechste(p, u, qq, v); return Math.abs(len(plus(G, H, -1)) - r.num) < 0.0051; },
    nachweis: (q, r, { u, v, p, q: qq }) => { const { G, H } = naechste(p, u, qq, v); return (len(plus(G, H, -1)) > 1e-9) === /windschief/.test(r.tex) && len(kreuz(u, v)) > 0; },
    lotfuss: (q, r, { u, v, p, q: qq }) => nahL(naechste(p, u, qq, v).G, r.val, 1e-9),
    abstand: (q, r) => Number.isInteger(q.d) && nah(r.num, q.d),
  },
  genSpiegelung: {
    gerade: (q, r, { A, u, P0 }) => { const M = plus(P0, r.val).map((c) => c / 2); return len(kreuz(plus(M, A, -1), u)) < 1e-9 && Math.abs(dot(plus(r.val, P0, -1), u)) < 1e-9 && !nahL(r.val, P0); },
    ebenefinden: (q, r, { Q, S }) => { const nv = r.val.slice(0, 3), d = r.val[3], M = plus(Q, S).map((c) => c / 2); return nah(dot(nv, M), d, 1e-9) && len(kreuz(plus(S, Q, -1), nv)) < 1e-9; },
    strecke: (q, r, { n: nv, d, Q }) => nah(2 * abstPE(nv, d, Q), r.num, 1e-7),
    ebene: (q) => q.Q.every((c, j) => (c + q.S[j]) / 2 === q.F[j]) && dot(q.n, q.F) === q.d,
    lot: (q) => dot(q.n, q.F) === q.d && len(kreuz(plus(q.Q, q.F, -1), q.n)) === 0,
  },
  genBewegung: {
    steigwinkel: (q, r, { v }) => Math.abs((Math.atan2(v[2], Math.hypot(v[0], v[1])) * 180) / Math.PI - r.num) < 0.051,
    sinkflug: (q, r, { A2, vd }) => { const w = plus(r.val, A2, -1); return r.val[2] === 0 && len(kreuz(w, vd)) < 1e-9 && dot(w, vd) > 0; },
    minabstand: (q, r, { A, v, Bs, w2 }) => { const d = (t) => len(plus(plus(Bs, w2, t), plus(A, v, t), -1)), t = mini(d, 0, 100); return nah(t, r.val[0], 1e-5) && nah(d(t), r.val[1], 1e-7); },
    warnzone: (q, r, { A, v, Bs, w2 }) => { const d = (t) => len(plus(plus(Bs, w2, t), plus(A, v, t), -1)), [lo, hi, aussen] = r.val; return aussen === 0 && nah(d(lo), 15) && nah(d(hi), 15) && d((lo + hi) / 2) < 15 && d(lo - 0.01) > 15 && d(hi + 0.01) > 15; },
    abstandpunkt: (q, r, { A, v, S }) => { const d = (t) => len(plus(S, plus(A, v, t), -1)), t = mini(d, -50, 100); return nah(t, r.val[0], 1e-5) && nah(d(t), r.val[1], 1e-7); },
  },
  genZweiseitig: {
    niveau: (q, r, { n: m, p, z }) => { const mu = m * p, si = Math.sqrt(m * p * (1 - p)); let lo = 0, hi = m; while (lo < mu - z * si) lo++; while (hi > mu + z * si) hi--; return r.tex === `[${lo};\\ ${hi}]`; },
    irrtum: (q, r, { nn, pp, l2, h2 }) => { let s = 0; for (let k = 0; k <= nn; k++) if (k < l2 || k > h2) s += pmf(nn, pp, k); return Math.abs(s - r.num) < 1.6e-4 && Math.abs(l2 - (nn * pp - 1.96 * Math.sqrt(nn * pp * (1 - pp)))) < 1 && Math.abs(h2 - (nn * pp + 1.96 * Math.sqrt(nn * pp * (1 - pp)))) < 1; },
    fehler2: (q, r, { nn, p1, l2, h2 }) => { let s = 0; for (let k = l2; k <= h2; k++) s += pmf(nn, p1, k); return Math.abs(s - r.num) < 1.6e-4; },
    komplett: (q, r, { n: m, p, k }) => { const mu = m * p, si = Math.sqrt(m * p * (1 - p)); let lo = 0, hi = m; while (lo < mu - 1.96 * si) lo++; while (hi > mu + 1.96 * si) hi--; return r.tex.startsWith(`[${lo};\\ ${hi}]`) && r.tex.includes(k >= lo && k <= hi ? 'beibehalten' : 'abgelehnt'); },
  },
  genHistogramm: {
    sigma2: (q, r, { n: m, p }) => { const mu = m * p, si = Math.sqrt(m * p * (1 - p)); let lo = 0, hi = m; while (lo < mu - 2 * si) lo++; while (hi > mu + 2 * si) hi--; return r.tex === `[${lo};\\ ${hi}]`; },
    verhaeltnis: (q, r, { n: m, p, k }) => Math.abs(pmf(m, p, k + 1) / pmf(m, p, k) - r.num) < 6e-4,
    rueck: (q, r, { mu, si }) => nah(r.val[0] * r.val[1], mu, 1e-9) && nah(Math.sqrt(r.val[0] * r.val[1] * (1 - r.val[1])), si, 1e-9) && Number.isInteger(Math.round(r.val[0] * 1e6) / 1e6),
  },
  genRueckwaerts: {
    mindp: (q, r, { n: m, s }) => 1 - (1 - r.num) ** m >= s && 1 - (1 - (r.num - 0.001)) ** m < s,
    mindzwei: (q, r, { p, s }) => { let m = 1; while (1 - cdf(m, p, 1) < s) m++; return m === r.num; },
    pqformel: (q, r, { n: m, si }) => r.num < 0.5 && nah(Math.sqrt(m * r.num * (1 - r.num)), si, 1e-3),
    mindestens: (q, r) => 1 - (1 - q.p) ** q.n >= q.s && 1 - (1 - q.p) ** (q.n - 1) < q.s && r.num === q.n,
  },
  genStetig: {
    normierung: (q, r, { mq, bq }) => nah(simpson((x) => r.num * x ** mq, 0, bq), 1, 1e-9),
    wkeitdichte: (q, r, { b2, c, d }) => nah(simpson((x) => (2 * x) / (b2 * b2), 0, b2), 1, 1e-9) && nah(simpson((x) => (2 * x) / (b2 * b2), c, d), r.num, 1e-9),
    erwartungdichte: (q, r, { mq, bq }) => nah(simpson((x) => r.val[0] * x ** mq, 0, bq), 1, 1e-9) && nah(simpson((x) => x * r.val[0] * x ** mq, 0, bq), r.val[1], 1e-9),
    median: (q, r, { mq, b2 }) => { const k = 1 / simpson((x) => x ** mq, 0, b2); return Math.abs(bisekt((m) => simpson((x) => k * x ** mq, 0, m, 400) - 0.5, 0, b2) - r.num) < 6e-4; },
    exponential: (q, r, { la, a2, b2 }) => Math.abs(simpson((x) => la * Math.exp(-la * x), a2, b2) - r.num) < 6e-5,
  },
  genMengen: (() => { const zaehl = (q, r, { a, b, c, u }, f, tol = 1e-9) => { const A = new Set(), B = new Set(); for (let i = 0; i < a / 5; i++) A.add(i); for (let i = (a - c) / 5; i < (a - c + b) / 5; i++) B.add(i); const O = Array.from({ length: 20 }, (_, i) => i), z = (g) => O.filter(g).length; return z((i) => A.has(i) || B.has(i)) * 5 === u && Math.abs(f(z, A, B) - r.num) < tol; };
    return { additionssatz: (q, r, p) => zaehl(q, r, p, (z, A, B) => z((i) => A.has(i) || B.has(i)) / 20), genau1: (q, r, p) => zaehl(q, r, p, (z, A, B) => z((i) => A.has(i) !== B.has(i)) / 20), weder: (q, r, p) => zaehl(q, r, p, (z, A, B) => z((i) => !A.has(i) && !B.has(i)) / 20), rueckschnitt: (q, r, p) => zaehl(q, r, p, (z, A, B) => z((i) => A.has(i) && !B.has(i)) / 20), bedingt: (q, r, p) => zaehl(q, r, p, (z, A, B) => z((i) => A.has(i) && B.has(i)) / B.size, 6e-4) }; })(),
  genBinomVerteilung: (() => { const t = 2.1e-4; return { einzel: (q, r) => Math.abs(pmf(q.n, q.p, q.k) - r.num) < t, genau: (q, r) => Math.abs(pmf(q.n, q.p, q.k) - r.num) < t && (!/erwartete/.test(q.prompt) || nah(q.n * q.p, q.k)), summe: (q, r) => Math.abs(cdf(q.n, q.p, 2) - r.num) < t, hoechstens: (q, r) => Math.abs(cdf(q.n, q.p, q.k) - r.num) < t, mindestens: (q, r) => Math.abs(1 - cdf(q.n, q.p, q.k - 1) - r.num) < t, mehr: (q, r) => Math.abs(1 - cdf(q.n, q.p, q.k) - r.num) < t,
    zwischen: (q, r) => { const mu = q.n * q.p, si = Math.sqrt(q.n * q.p * (1 - q.p)); let lo = 0, hi = q.n; while (lo < mu - si) lo++; while (hi > mu + si) hi--; return Math.abs(cdf(q.n, q.p, q.b) - cdf(q.n, q.p, q.a - 1) - r.num) < t && (!/sigma/.test(q.prompt) || (lo === q.a && hi === q.b)); },
    grenze: (q, r) => { let g = 0; while (cdf(q.n, q.p, g) < q.s) g++; return g === r.num; } }; })(),
};
const eF = (xs, f) => xs.map(f), xI = [0.5, 1.2];
const P9 = {
  genIntegralE: {
    partiellwert: (q, r, { m, c }) => nah(simpson((x) => (m * x + c) * Math.exp(x), 0, 1), r.val, 1e-9),
    uneigentlich: (q, r, { a, b, k }) => nah(simpson((x) => (a * x + b) * Math.exp(-k * x), 0, 60 / k, 40000), r.val, 1e-7),
    parameter: (q, r, { m, c0, w }) => nah(simpson((x) => m * c0 * Math.exp(m * x), 0, r.val), w, 1e-9),
    zweifach: (q, r, { kk }) => nah(simpson((x) => x * x * Math.exp(kk * x), 0.5, 1.2), r.val, 1e-9),
    logabl: (q, r, { a1, c, g }) => nah(simpson((x) => (a1 * Math.exp(x)) / (Math.exp(x) + c), 0, Math.log(g)), r.val, 1e-9),
    substitution: (q, r, { am, k2, bb }) => nah(simpson((x) => am * x * Math.exp(k2 * x * x), 0, bb), r.val, 1e-8),
    partiellln: (q, r, { c, g }) => nah(simpson((x) => (x + c) * Math.exp(x), 0, Math.log(g)), r.val, 1e-9),
  },
  genIntegralLn: {
    xnln: (q, r, { n: m }) => nah(simpson((x) => x ** m * Math.log(x), 1, Math.E), r.val, 1e-9),
    lndurchx: (q, r, { m, n: e }) => nah(simpson((x) => Math.log(x) ** m / x, 1, Math.E ** e, 20000), r.val, 1e-8),
    lnquadrat: (q, r, { n: e, a1 }) => nah(simpson((x) => a1 * Math.log(x) ** 2, 1, Math.E ** e, 20000), r.val, 1e-8),
    partialbruch: (q, r, { c, lo, hi }) => nah(simpson((x) => (2 * c) / (x * x - c * c), lo, hi), r.val, 1e-9),
  },
  genKurveE: {
    hochpunkt: (q, r, { k }) => extrem((x) => x * Math.exp(-k * x), r.val[0], r.val[1], 1) && r.val[2] === 1,
    wendexe: (q, r, { k }) => { const f = (x) => x * Math.exp(-k * x); return wende(f, r.val[0]) && nah(f(r.val[0]), r.val[1]); },
    summe: (q, r, { a2 }) => extrem((x) => Math.exp(x) + a2 * Math.exp(-x), r.val[0], r.val[1], 0) && r.val[2] === 0,
    quadrat: (q, r, { kq }) => { const f = (x) => x * x * Math.exp(-kq * x), v = r.val; return v.length === 6 && extrem(f, v[0], v[1], v[2]) && v[2] === 1 && extrem(f, v[3], v[4], v[5]) && v[5] === 0; },
    quadratwende: (q, r, { kq }) => { const f = (x) => x * x * Math.exp(-kq * x); return r.val.length === 2 && r.val[0] < r.val[1] && r.val.every((x) => wende(f, x)); },
    ortskurve: (q, r, { a3 }) => kx.every((x, i) => nah(ortsY((t, k) => (t - k) * Math.exp(a3 * t), x, -20, 20), r.val[i], 1e-6)),
    quotient: (q, r, { kq }) => extrem((x) => Math.exp(kq * x) / x, r.val[0], r.val[1], 0) && r.val[2] === 0 && r.val[0] > 0,
    dreiterm: (q, r, { c }) => { const f = (x) => (x * x - c) * Math.exp(x), v = r.val; return v.length === 6 && extrem(f, v[0], v[1], 1) && v[2] === 1 && extrem(f, v[3], v[4], 0) && v[5] === 0; },
  },
  genKurveLn: {
    wendelndurchx: (q, r, { n: m }) => wende((x) => Math.log(x) / x ** m, r.val),
    lnquadrat: (q, r) => { const f = (x) => Math.log(x) ** 2, v = r.val; return v.length === 5 && extrem(f, v[0], v[1], 0) && v[2] === 0 && wende(f, v[3]) && nah(f(v[3]), v[4]); },
    lnx2plus1: (q, r, { c }) => { const f = (x) => Math.log(x * x + c), v = r.val; return v.length === 4 && extrem(f, v[0], v[1], 0) && v[2] === 0 && wende(f, v[3]) && wende(f, -v[3]); },
    tangente: (q, r, { a1 }) => { const f = (x) => Math.log(a1 * x), [m, t] = r.val, u = bisekt((x) => abl(f, x) - m, 1e-3, 100); return t === 0 && nah(f(u), m * u, 1e-6); },
    xlnquadrat: (q, r) => { const f = (x) => x * Math.log(x) ** 2, v = r.val; return v.length === 6 && extrem(f, v[0], v[1], 1) && v[2] === 1 && extrem(f, v[3], v[4], 0) && v[5] === 0; },
    scharort: (q, r, { a1 }) => kx.every((x, i) => nah(ortsY((t, k) => a1 * t * (Math.log(t) - k), x, -10, 10), r.val[i], 1e-6)),
  },
  genAbleitenSteil: {
    quotkette: (q, r, { k2, b }) => nahL(eF(kx, (x) => abl((t) => Math.exp(k2 * t) / (t * t + b), x)), r.val, 1e-6),
    prodwurzel: (q, r, { a1, b, c, d }) => nahL(eF(kx, (x) => abl((t) => (a1 * t * t + b) * Math.sqrt(c * t + d), x)), r.val, 1e-6),
    scharzweite: (q, r, { a1 }) => nahL([[1.3, 0.7], [2.1, 1.4]].map(([x, t]) => abl2((s) => a1 * (s * s - t) * Math.exp(-t * s), x, 1e-4)), r.val, 1e-4),
    dreifach: (q, r, { a1, c }) => nahL(eF(kx, (x) => abl((t) => Math.log(c + Math.exp(a1 * t * t)), x)), r.val, 1e-6),
    scharprodukt: (q, r, { a1 }) => nahL([[1.3, 0.7], [2.1, 1.4]].map(([x, k]) => abl((s) => (s + k) ** 2 * Math.exp(-a1 * s), x)), r.val, 1e-6),
  },
  genIntegrierenSteil: {
    negativ: (q, r, { a, m }) => nah(simpson((x) => a / x ** m, 1.3, 2.1), r.val, 1e-9),
    wurzel: (q, r, { c }) => nah(simpson((x) => c * Math.sqrt(x), 1.3, 2.1), r.val, 1e-9),
    bestimmt: (q, r, { a, b }) => nah(simpson((x) => 3 * a * x * x - 2 * b * x, 1, 3), r.num, 1e-9),
    linearsub: (q, r, { a, b, n: e }) => nah(simpson((x) => (a * x + b) ** e, 1.3, 2.1), r.val, 1e-9),
    linearsubwert: (q, r, { a, b }) => nah(simpson((x) => (a * x + b) ** 2, 0, 1), r.val, 1e-9),
    flaeche: (q, r, { c }) => nah(simpson((x) => Math.abs(x ** 3 - c * c * x), -c, 0) + simpson((x) => Math.abs(x ** 3 - c * c * x), 0, c), r.val, 1e-9),
    mittelwert: (q, r, { a, L }) => nah(simpson((x) => a * x * x, 0, L) / L, r.num, 1e-9),
    wurzelwert: (q, r, { c1, c2 }) => nah(simpson((x) => c1 * Math.sqrt(x) + c2 / (x * x), 1, 4), r.val, 1e-9),
    symmetrie: (q, r, { a, b, k, g }) => nah(simpson((x) => k * x ** 3 + 3 * a * x * x + b * x, -g, g), r.num, 1e-9),
    halbieren: (q, r, { g }) => nah(simpson((x) => x, 0, r.val), simpson((x) => x, 0, g) / 2, 1e-9),
    substitution: (q, r, { A, c, bb, m }) => nah(simpson((x) => 2 * A * x * (A * x * x + c) ** m, 0, bb), r.val, 1e-9),
    partiell: (q, r, { m, c }) => nah(simpson((x) => (m * x + c) * Math.exp(-x), 0, 1), r.val, 1e-9),
    parameterflaeche: (q, r, { k0 }) => nah(simpson((x) => r.num * x - x * x, 0, r.num), k0 ** 3 / 6, 1e-9) && r.num > 0,
    zwischen: (q, r, { s, p }) => { const h = (x) => s * x - p - x * x, xm = s / 2, x1 = bisekt(h, xm - 50, xm), x2 = bisekt(h, xm, xm + 50); return x2 - x1 > 0.5 && nah(simpson((x) => Math.abs(h(x)), x1, x2), r.val, 1e-8); },
    uneigentlich: (q, r, { a, m, c }) => nah(simpson((u) => a * u ** (m - 2), 0, 1 / c), r.val, 1e-9),   // mit x = 1/u umgerechnet
  },
  genKurveSteil: {
    extrem3: (q, r, { b }) => { const f = (x) => x ** 3 - 3 * b * b * x; return r.tex === `x=\\pm ${b}` && [b, -b].every((x) => Math.abs(abl(f, x)) < 1e-5); },
    wende3: (q, r, { b, c }) => wende((x) => x ** 3 - 3 * b * x * x + c, r.num),
    monoton3: (q, r, { b }) => { const f = (x) => x ** 3 - 3 * b * x * x, z = bisekt((x) => abl(f, x), 0.5, 100); return r.tex === `0<x<${Math.round(z)}` && abl(f, z / 2) < 0 && abl(f, -1) > 0 && abl(f, z + 1) > 0 && Math.abs(abl(f, 0)) < 1e-6; },
    punkt3: (q, r, { b }) => { const f = (x) => x ** 3 - 3 * b * b * x; return extrem(f, -b, f(-b), 1) && extrem(f, b, f(b), 0) && r.tex === `H(-${b}\\mid ${f(-b)}),\\ T(${b}\\mid ${f(b)})`; },
    sattel: (q, r, { b, c }) => { const f = (x) => (x - b) ** 3 + c; return Math.abs(abl(f, b)) < 1e-8 && abl(f, b - 0.3) > 0 && abl(f, b + 0.3) > 0 && r.tex === `\\text{Sattelpunkt } S(${b}\\mid ${f(b)})`; },
    wendetangente: (q, r, { b }) => { const f = (x) => x ** 3 - 3 * b * x * x, w = bisekt((x) => abl2(f, x), -50, 50), m = abl(f, w); return nahL([m, f(w) - m * w], r.val, 1e-5); },
    grad4werte: (q, r, { b }) => { const f = (x) => x ** 4 - 2 * b * b * x * x; return extrem(f, 0, 0, 1) && extrem(f, b, f(b), 0) && extrem(f, -b, f(b), 0) && r.tex === `H(0\\mid 0),\\ T(\\pm ${b}\\mid ${f(b)})`; },
    wende4: (q, r, { b }) => { const f = (x) => x ** 4 - 6 * b * b * x * x; return wende(f, b) && wende(f, -b) && r.tex === `W(\\pm ${b}\\mid ${f(b)})`; },
    parameterk: (q, r, { x0 }) => Math.abs(abl((x) => x ** 3 - r.num * x, x0)) < 1e-6,
    gebrochen: (q, r, { b }) => { const f = (x) => x + (b * b) / x; return extrem(f, b, f(b), 0) && extrem(f, -b, f(-b), 1) && r.tex === `T(${b}\\mid ${f(b)}),\\ H(-${b}\\mid ${f(-b)})`; },
    scharextrem: (q, r, { cc }) => { const k = 1.5, f = (x) => x ** 3 - 3 * k * k * x + cc, v = r.val; return v.length === 6 && extrem(f, v[0], v[1], 1) && v[2] === 1 && extrem(f, v[3], v[4], 0) && v[5] === 0 && v[0] < v[3]; },
    scharwende: (q, r) => { const k = 1.5, f = (x) => x ** 4 - 6 * k * k * x * x, [x, y, m] = r.val; return wende(f, x) && wende(f, -x) && nah(f(x), y) && nah(abl(f, x), m, 1e-6) && nah(abl(f, -x), -m, 1e-6) && /\\mp/.test(r.tex); },
    gebrochenschar: (q, r) => { const k = 1.5, f = (x) => x + (k * k) / x, v = r.val; return v.length === 8 && extrem(f, v[0], v[1], 0) && v[2] === 0 && extrem(f, v[3], v[4], 1) && v[5] === 1 && nah(v[6] * v[0] + v[7], v[1]) && nah(v[6] * v[3] + v[7], v[4]) && v[7] === 0; },
    vollschar: (q, r) => { const k = 1.5, f = (x) => x ** 3 - 3 * k * x * x, v = r.val; return v.length === 6 && v[0] === 1 && extrem(f, 0, 0, 1) && extrem(f, v[1], v[2], 0) && v[3] === 0 && wende(f, v[4]) && nah(f(v[4]), v[5]); },
    steckbrief: (q, r, { x1, x2 }) => { const f = (x) => x ** 3 + r.val[0] * x * x + r.val[1] * x; return Math.abs(abl(f, x1)) < 1e-5 && Math.abs(abl2(f, x2)) < 1e-4 && Math.abs(abl2(f, x1)) > 0.1; },
  },
};

const geprueft = new Set(), ungeprueft = new Set();
for (const [G, P] of [[GENS8, P8], [GENS9, P9]]) for (const [name, fn] of Object.entries(G)) for (let lv = 1; lv <= 5; lv++) for (let i = 0; i < 200; i++) {
  const q = fn(lv), t = `${name}/${q.kind} (Stufe ${lv})`, richtig = q.options.filter((o) => o.correct), r = richtig[0];
  ok(richtig.length === 1 && q.options.length === 4, `${t}: genau eine richtige von vier Antworten`);
  ok(new Set(q.options.map((o) => o.tex)).size === 4, `${t}: Antworten verschieden geschrieben`);
  ok(Array.isArray(q.hints) && q.hints.length >= 2 && q.hints.every((h) => typeof h === 'string' && h.length > 5) && typeof q.explain === 'string' && q.explain.length > 3, `${t}: Tipps und Erklärung vorhanden`);
  ok(!/undefined|NaN|Infinity|\[object/.test(JSON.stringify([q.prompt, q.formula ?? '', q.explain, q.hints, q.options.map((o) => [o.tex, o.why ?? ''])])), `${t}: keine kaputten Werte`);
  ok(q.options.every((o) => o.correct || (typeof o.why === 'string' && o.why.length > 10)), `${t}: jeder Ablenker hat eine Diagnose`);
  ok(typeof q.kind === 'string', `${t}: Art benannt`);
  if (!r) continue;
  // Ablenker wirklich falsch: anderer Rechenwert als die richtige Antwort (wo ein Rechenwert mitgegeben ist)
  for (const o of q.options) if (!o.correct) {
    if (r.val !== undefined && o.val !== undefined) ok(!nahL([].concat(o.val), [].concat(r.val), 1e-9), `${t}: Ablenker hat denselben Rechenwert wie die Lösung`);
    if (typeof r.num === 'number' && typeof o.num === 'number') ok(Math.abs(o.num - r.num) > 1e-6, `${t}: Ablenker hat denselben Zahlwert wie die Lösung`);
  }
  // Schreibweise und Rechenwert der Lösung passen zusammen (einfache Zahlen und Brüche)
  { const m = String(r.tex).match(/^(\\approx ?)?(-?)(?:(\d+(?:\{,\}\d+)?)|\\dfrac\{(\d+)\}\{(\d+)\})$/), w = typeof r.num === 'number' ? r.num : typeof r.val === 'number' ? r.val : null;
    if (m && w !== null) { const z = (m[2] ? -1 : 1) * (m[3] ? +m[3].replace('{,}', '.') : +m[4] / +m[5]), st = m[3] && m[3].includes('{,}') ? m[3].split('{,}')[1].length : 0; ok(Math.abs(z - w) <= (m[3] ? 0.5 * 10 ** -st + 1e-9 : 1e-9), `${t}: gezeigte Zahl passt zum Rechenwert`); } }
  const pruef = P[name]?.[q.kind];
  if (pruef) { geprueft.add(`${name}/${q.kind}`); let gut = false; try { gut = !!pruef(q, r, q.probe || {}); } catch (e) { gut = false; } ok(gut, `${t}: Lösung unabhängig nachgerechnet`); } else ungeprueft.add(`${name}/${q.kind}`);
}
const soll = Object.entries({ ...P8, ...P9 }).flatMap(([g, p]) => Object.keys(p).map((k) => `${g}/${k}`)).filter((x) => !geprueft.has(x));
ok(soll.length === 0, `Prüfungen ohne Aufgabe: ${soll.join(', ')}`);
for (const [m, k] of [...fehler].sort()) console.error(`FEHLER (${k}×): ${m}`);
if (process.argv.includes('--arten')) console.log(`unabhängig nachgerechnet: ${geprueft.size} Arten · nur allgemein geprüft (unveränderte Antwort-Logik): ${[...ungeprueft].sort().join(', ')}`);
if (fehler.size) { console.error(`hart/gen89: ${fehler.size} verschiedene Fehler bei ${n} Prüfungen`); process.exit(1); }
console.log(`hart/gen89: ${n} Prüfungen bestanden`);
