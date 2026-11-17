// Harte Prüfung für das Paket gen2b (Stochastik, Geometrie, Operatoren aus app/js/gen2.js):
// Je Stufe 200 Aufgaben; die richtige Antwort wird unabhängig nachgerechnet – aus dem, was der Lernende sieht
// (Aufgabentext und Formel werden gelesen), mit eigenen Verfahren (Abzählen, Determinanten, Projektion, numerische Integration).
globalThis.window = { katex: { renderToString: (s) => s } };
const H = await import('../../app/js/gen2.js');
const { seedRandom } = await import('../../app/js/math.js');

let n = 0, fails = 0; const seen = new Set();
const ok = (cond, msg) => { n++; if (!cond && !seen.has(msg)) { seen.add(msg); fails++; if (fails <= 60) console.error('FEHLER:', msg); } };
const nah = (a, b, eps = 1e-9) => Math.abs(a - b) <= eps * (1 + Math.abs(a) + Math.abs(b));
const Z = (s) => +String(s).replace(/\{,\}/g, '.').replace(/,/g, '.').replace(/−/g, '-');
const ZAHL = '-?\\d+(?:\\{,\\}\\d+)?';
const vecs = (t) => [...String(t).matchAll(/\\begin\{pmatrix\}(.*?)\\end\{pmatrix\}/g)].map((m) => m[1].split('\\\\').map((x) => (x === 'a' ? 'a' : Z(x))));
const pts = (t) => Object.fromEntries([...String(t).matchAll(new RegExp(`([A-Z])\\((${ZAHL})\\\\mid ?(${ZAHL})\\\\mid ?(${ZAHL}|a)\\)`, 'g'))].map((m) => [m[1], [Z(m[2]), Z(m[3]), m[4] === 'a' ? 'a' : Z(m[4])]]));
const ebene = (t) => { const m = String(t).match(/E:\\ ([^=]*)=(-?\d+(?:\{,\}\d+)?)/); if (!m) return null; const nn = [0, 0, 0]; for (const g of m[1].matchAll(/([+-]?)(\d+(?:\{,\}\d+)?)?x_(\d)/g)) nn[+g[3] - 1] = (g[1] === '-' ? -1 : 1) * (g[2] ? Z(g[2]) : 1); return { n: nn, d: Z(m[2]) }; };
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const sub = (a, b) => a.map((c, i) => c - b[i]);
const det = (a, b, c) => a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0]);
const len = (a) => Math.hypot(...a);
const kreuz = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const istNull = (a) => a.every((c) => Math.abs(c) < 1e-9);
// Binomialverteilung über die Rekursion p(k) = p(k-1)·(n-k+1)/k·p/(1-p)
const binListe = (N, p) => { const L = [(1 - p) ** N]; for (let k = 1; k <= N; k++) L.push((L[k - 1] * (N - k + 1) * p) / (k * (1 - p))); return L; };
const summe = (N, p, lo, hi) => { const L = binListe(N, p); let s = 0; for (let k = Math.max(0, lo); k <= Math.min(N, hi); k++) s += L[k]; return s; };
// Normalverteilung: Dichte numerisch integrieren (Simpson)
const PhiNum = (z) => { const f = (x) => Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI), a = -9, m = 4000, h = (z - a) / m; let s = f(a) + f(z); for (let i = 1; i < m; i++) s += f(a + i * h) * (i % 2 ? 4 : 2); return (s * h) / 3; };

function allgemein(name, q, lv) {
  const tag = `${name} (Stufe ${lv})`, r = q.options.filter((o) => o.correct);
  ok(r.length === 1 && q.options.length === 4, `${tag}: genau eine richtige von vier Antworten`);
  ok(new Set(q.options.map((o) => o.html ?? o.tex)).size === 4 && new Set(q.options.map((o) => o.tex)).size === 4, `${tag}: Antworten verschieden`);
  for (const o of q.options) if (!o.correct) ok(typeof o.why === 'string' && o.why.length > 10, `${tag}: Ablenker mit Diagnose`);
  ok(Array.isArray(q.hints) && q.hints.length >= 2 && q.hints.every((h) => typeof h === 'string' && h.length > 5) && typeof q.explain === 'string' && q.explain.length > 10, `${tag}: Tipps und Erklärung vorhanden`);
  const alles = JSON.stringify([q.prompt, q.formula, q.hints, q.explain, q.options.map((o) => [o.tex, o.html, o.why])]);
  ok(!/undefined|NaN|Infinity|\[object/.test(alles), `${tag}: kein undefined/NaN im Text`);
  ok(!/\d\.\d/.test(alles.replace(/arraystretch\{[\d.]+\}/g, '')), `${tag}: Dezimalkomma statt Punkt (${(alles.replace(/arraystretch\{[\d.]+\}/g, '').match(/.{12}\d\.\d.{6}/) || [''])[0]})`);
  ok(!/\+-|--\d|\+\+/.test(alles.replace(/<[^>]+>/g, '')), `${tag}: keine doppelten Vorzeichen (${(alles.match(/.{12}(\+-|--\d).{6}/) || [''])[0]})`);
  return r[0];
}
const falsche = (q) => q.options.filter((o) => !o.correct);

const P = {
  genVierfelder(q, r, lv, tag) {
    ok(q.a + q.b + q.c + q.d === q.N && [q.a, q.b, q.c, q.d].every((x) => Number.isInteger(x) && x > 0), `${tag}: Tafel stimmt in sich`);
    let a, b, c, d, N;
    if (lv >= 5) {
      const m = [...q.prompt.matchAll(/(\d+(?:,\d+)?) %/g)].map((x) => Z(x[1]) / 100); N = +q.prompt.match(/Von (\d+)/)[1];
      const [pA, pB, pN] = m, pAB = pA + pB - (1 - pN);   // Additionssatz
      a = pAB * N; b = (pA - pAB) * N; c = (pB - pAB) * N; d = pN * N;
      ok([a, b, c, d].every((x, i) => nah(x, [q.a, q.b, q.c, q.d][i], 1e-7)) && N === q.N, `${tag}: Text passt zu den Feldern`);
    } else {
      // Tafel aus der Formel lesen und fehlende Felder durch Zeilen-/Spaltensummen ergänzen
      const zellen = q.formula.replace(/\\def\\arraystretch\{[\d.]+\}/, '').match(/\\hline A&(.*?)&(.*?)&(.*?)\\\\\\overline\{A\}&(.*?)&(.*?)&(.*?)\\\\\\hline &(.*?)&(.*?)&(.*?)\\end/).slice(1).map((x) => (x === '\\square' ? null : +x));
      const T = [zellen.slice(0, 3), zellen.slice(3, 6), zellen.slice(6, 9)];
      for (let runde = 0; runde < 6; runde++) for (let i = 0; i < 3; i++) {
        const zeile = [T[i][0], T[i][1], T[i][2]], spalte = [T[0][i], T[1][i], T[2][i]];
        for (const [L, setze] of [[zeile, (j, v) => { T[i][j] = v; }], [spalte, (j, v) => { T[j][i] = v; }]]) if (L.filter((x) => x === null).length === 1) { const j = L.indexOf(null); setze(j, j === 2 ? L[0] + L[1] : L[2] - L[1 - j]); }
      }
      ok(T.flat().every((x) => x !== null), `${tag}: Tafel lässt sich vollständig ergänzen`);
      [a, b, c, d, N] = [T[0][0], T[0][1], T[1][0], T[1][1], T[2][2]];
      ok(a === q.a && b === q.b && c === q.c && d === q.d && N === q.N, `${tag}: ergänzte Tafel passt zu den Feldern`);
      if (lv >= 3) ok(zellen.filter((x) => x === null).length >= 4, `${tag}: Tafel hat Lücken`);
    }
    // Wahrscheinlichkeit durch Abzählen der passenden Gruppen
    const gesucht = /P_A\(\\overline\{B\}\)/.test(q.prompt + q.explain) && q.kind === 'bedingtA' ? b / (a + b) : q.kind === 'bedingt' ? a / (a + c) : q.kind === 'A' ? (a + b) / N : a / N;
    ok(nah(r.num, gesucht, 1e-7), `${tag}: Wahrscheinlichkeit stimmt`);
    if (lv >= 5) ok(Math.abs(Z(r.tex.replace('\\,\\%', '')) - gesucht * 100) <= 0.0501, `${tag}: angezeigter Wert gerundet richtig`);
    else { const m = r.tex.match(/\\dfrac\{(\d+)\}\{(\d+)\}/); ok(nah(+m[1] / +m[2], gesucht), `${tag}: angezeigter Bruch richtig`); }
    for (const o of falsche(q)) ok(Math.abs(o.num - gesucht) > 3e-3, `${tag}: Ablenker falsch`);
  },
  genBedingt(q, r, lv, tag) {
    let want;
    if (lv <= 2) { const z = q.prompt.match(/\d+/g).map(Number), [T, S, TP, FP, G] = z; ok(T - S === G && TP <= S && FP <= G, `${tag}: Angaben stimmig`); want = TP / (TP + FP); const m = r.tex.match(/\\dfrac\{(\d+)\}\{(\d+)\}/); ok(nah(+m[1] / +m[2], want), `${tag}: Bruch stimmt`); }
    else if (lv <= 4) { const z = [...q.prompt.matchAll(/(\d+(?:,\d+)?) %/g)].map((x) => Z(x[1]) / 100), [p, se, dritte] = z, fp = lv === 3 ? dritte : 1 - dritte;
      // mit einer gedachten Bevölkerung von 10 Millionen abzählen
      const M = 1e7, krank = M * p, tp = krank * se, fpz = (M - krank) * fp; want = tp / (tp + fpz); }
    else { const zeilen = q.formula.split('\\\\'), proz = (s) => [...s.matchAll(/(\d+(?:\{,\}\d+)?)\\,\\%/g)].map((x) => Z(x[1]) / 100), ant = proz(zeilen[zeilen.length - 2]), gut = proz(zeilen[zeilen.length - 1]);
      ok(ant.length === 3 && gut.length === 3 && nah(ant[0] + ant[1] + ant[2], 1), `${tag}: Tabelle lesbar, Anteile ergeben 100 %`);
      const i = +q.prompt.match(/M_(\d)\?/)[1] - 1, M = 1e7, schlecht = ant.map((x, j) => M * x * (1 - gut[j])); want = schlecht[i] / (schlecht[0] + schlecht[1] + schlecht[2]); }
    ok(nah(r.num, want, 1e-7) && nah(q.TP / (q.TP + q.FP), want, 1e-7), `${tag}: Wahrscheinlichkeit stimmt`);
    if (lv >= 3) ok(Math.abs(Z(r.tex.replace('\\,\\%', '')) - want * 100) <= 0.0501, `${tag}: angezeigter Wert gerundet richtig`);
    for (const o of falsche(q)) ok(Math.abs(o.num - want) > 3e-3, `${tag}: Ablenker falsch`);
  },
  genKumuliert(q, r, lv, tag) {
    let N, p, lo, hi;
    const bereich = (t) => { let m;
      if ((m = t.match(/mindestens (\d+) und höchstens (\d+)/))) return [+m[1], +m[2]];
      if ((m = t.match(/mehr als (\d+)(?: und|, aber) weniger als (\d+)/))) return [+m[1] + 1, +m[2] - 1];
      if ((m = t.match(/höchstens (\d+)<\/b> Treffer/))) return [0, +m[1]];
      if ((m = t.match(/weniger als (\d+)<\/b> Treffer/))) return [0, +m[1] - 1];
      if ((m = t.match(/mehr als (\d+)<\/b> Treffer/))) return [+m[1] + 1, Infinity];
      if ((m = t.match(/mindestens (\d+)<\/b> Treffer/))) return [+m[1], Infinity];
      return null; };
    if (lv <= 3) { const m = q.formula.match(/n=(\d+),\\quad p=(\d\{,\}\d+)/); N = +m[1]; p = Z(m[2]); [lo, hi] = bereich(q.prompt); }
    else { N = +q.prompt.match(/(\d+) (Pakete|Personen|Samen)/)[1]; p = Z(q.prompt.match(/Wahrscheinlichkeit (0,\d+)/)[1]);
      if (lv === 4) [lo, hi] = bereich(q.prompt);
      else { const c = Z(q.prompt.match(/höchstens (\d(?:,\d)?) Standardabweichungen/)[1]), mu = N * p, sg = Math.sqrt(N * p * (1 - p)); lo = Infinity; hi = -Infinity; for (let k = 0; k <= N; k++) if (Math.abs(k - mu) <= c * sg) { lo = Math.min(lo, k); hi = Math.max(hi, k); } } }
    const want = summe(N, p, lo, hi);
    ok(N === q.n && nah(p, q.p) && lo === q.lo && Math.min(hi, N) === q.hi, `${tag}: Bereich aus dem Text passt zu den Feldern (${lo}..${hi} / ${q.lo}..${q.hi})`);
    ok(Math.abs(r.num - want) < 1e-9, `${tag}: Wahrscheinlichkeit stimmt`);
    for (const o of falsche(q)) ok(Math.abs(o.num - want) > 1e-9, `${tag}: Ablenker falsch`);
    if (lv <= 3) for (const o of q.options) { // jeden Ausdruck selbst auswerten
      let s = o.tex.replace(/P\(X\\le (\d+)\)/g, (_, j) => `(${summe(N, p, 0, +j)})`); ok(/^[\d.()e+\-\s]+$/.test(s) && Math.abs(Function(`return ${s}`)() - o.num) < 1e-9, `${tag}: Ausdruck ${o.tex} hat den gespeicherten Wert`); }
    else { ok(Math.abs(Z(r.tex) - want) <= 1.6e-4 && /^\d\{,\}\d{4}$/.test(r.tex), `${tag}: angezeigter Wert passt (${r.tex} / ${want})`);
      for (const m of q.formula.matchAll(/P\(X\\le (\d+)\)\\approx(\d\{,\}\d+)/g)) ok(Math.abs(summe(N, p, 0, +m[1]) - Z(m[2])) < 6e-5, `${tag}: Tabellenwert P(X≤${m[1]}) stimmt`);
      for (const o of falsche(q)) ok(Math.abs(Z(o.tex) - Z(r.tex)) >= 9e-4, `${tag}: Ablenker auch gerundet verschieden`); }
  },
  genSigma(q, r, lv, tag) {
    let N, p, mu, sg;
    if (lv === 1) { const m = q.formula.match(/\\mu=(\d+),\\quad\\sigma=(\d+)/); mu = +m[1]; sg = +m[2]; ok(nah(mu, q.n * q.p) && nah(sg, Math.sqrt(q.n * q.p * (1 - q.p))), `${tag}: μ und σ passen zu n und p`); }
    else { if (lv >= 5) { const m = q.prompt.match(/(\d+) von (\d+)/); p = +m[1] / +m[2]; N = +q.prompt.match(/(?:werden|sind) (\d+) /)[1]; } else { const m = q.formula.match(/n=(\d+),\\quad p=(\d\{,\}\d+)/); N = +m[1]; p = Z(m[2]); }
      ok(N === q.n && nah(p, q.p), `${tag}: n und p aus dem Text passen`); mu = N * p; sg = Math.sqrt(N * p * (1 - p)); }
    const m = q.prompt.match(/etwa <b>(\d+(?:,\d)?) %<\/b>/), pct = Z(m[1]) / 100, innen = /außerhalb/.test(q.prompt) ? 1 - pct : pct;
    // Die Normalverteilung muss für diesen Radius die genannte Wahrscheinlichkeit liefern (numerisch integriert)
    ok(Math.abs(2 * PhiNum(q.k) - 1 - innen) < 0.0015, `${tag}: Faktor ${q.k} passt zur Wahrscheinlichkeit ${innen} (${2 * PhiNum(q.k) - 1})`);
    ok(nah(r.lo, mu - q.k * sg, 1e-6) && nah(r.hi, mu + q.k * sg, 1e-6), `${tag}: Intervall stimmt`);
    const g = r.tex.match(new RegExp(`\\[(${ZAHL});\\\\ (${ZAHL})\\]`)); ok(Math.abs(Z(g[1]) - (mu - q.k * sg)) <= 0.00501 && Math.abs(Z(g[2]) - (mu + q.k * sg)) <= 0.00501, `${tag}: angezeigtes Intervall stimmt`);
    for (const o of falsche(q)) ok(Math.abs(o.lo - r.lo) > 0.05, `${tag}: Ablenker verschieden`);
    if (lv >= 4) ok(sg > 3 && Math.abs(sg - Math.round(sg)) > 0.04, `${tag}: Standardabweichung krumm und > 3`);
  },
  genHypothese(q, r, lv, tag) {
    if (lv <= 2) { ok(q.kind === 'begriff' && r.key === q.expect, `${tag}: Begriff stimmt`);
      const art = (q.prompt.match(/Fehler (\d)\. Art/) || [])[1];
      if (art === '1') ok(/ab(ge)?lehnt|aussortiert|als besser eingestuft/.test(r.tex) && /obwohl/.test(r.tex) && !/nicht als besser/.test(r.tex), `${tag}: Fehler 1. Art = zu Unrecht abgelehnt (${r.tex})`);
      if (art === '2') ok(/beibehalten|angenommen|bleibt|nicht als besser/.test(r.tex) && /obwohl/.test(r.tex), `${tag}: Fehler 2. Art = zu Unrecht beibehalten (${r.tex})`);
      return; }
    const N = lv === 3 ? +q.prompt.match(/mit (\d+) Versuchen/)[1] : +q.prompt.match(/; (\d+) (Personen|Prüfungen|Besuche)/)[1];
    const p0 = Z(q.prompt.match(/H_0\\colon p=(\d\{,\}\d+)/)[1]), al = Z(q.prompt.match(/Niveau (\d+(?:,\d+)?) %/)[1]) / 100;
    if (lv >= 4) ok(nah(Z(q.prompt.match(/(\d+) % der/)[1]) / 100, p0), `${tag}: Text und Nullhypothese passen zusammen`);
    const L = binListe(N, p0); let k = N + 1, rest = 0; while (k > 0 && rest + L[k - 1] <= al) { rest += L[k - 1]; k--; }   // von oben abzählen
    ok(r.lo === k && r.hi === N && N === q.n && nah(p0, q.p0) && nah(al, q.al), `${tag}: Ablehnungsbereich stimmt ({${k},…,${N}})`);
    ok(new RegExp(`^\\\\\\{${k},\\\\dots,${N}\\\\\\}`).test(r.tex), `${tag}: Anzeige des Bereichs stimmt`);
    for (const o of falsche(q)) ok(o.lo !== k || o.hi !== N, `${tag}: Ablenker verschieden`);
    if (lv === 3) for (const m of q.formula.matchAll(/P\(X\\ge (\d+)\)\\approx(\d\{,\}\d+)/g)) ok(Math.abs(summe(N, p0, +m[1], N) - Z(m[2])) < 6e-5, `${tag}: Tabellenwert stimmt`);
    if (lv === 4) for (const m of q.formula.matchAll(/P\(X\\le (\d+)\)\\approx(\d\{,\}\d+)/g)) ok(Math.abs(summe(N, p0, 0, +m[1]) - Z(m[2])) < 6e-5, `${tag}: Tabellenwert stimmt`);
    if (lv >= 5) { const p1 = Z(q.prompt.match(/in Wahrheit p=(\d\{,\}\d+)/)[1]), beta = summe(N, p1, 0, k - 1);
      ok(p1 > p0 && Math.abs(Z(r.tex.match(/approx(\d\{,\}\d+)/)[1]) - beta) < 6e-5, `${tag}: β stimmt (${beta})`);
      for (const m of q.formula.matchAll(/(\d+)&(\d\{,\}\d+)&(\d\{,\}\d+)/g)) ok(Math.abs(summe(N, p0, 0, +m[1]) - Z(m[2])) < 6e-5 && Math.abs(summe(N, p1, 0, +m[1]) - Z(m[3])) < 6e-5, `${tag}: Tabellenzeile ${m[1]} stimmt`); }
  },
  genNormal(q, r, lv, tag) {
    if (lv <= 2) { const m = q.formula.match(/\\mu=(\d+),\\quad\\sigma=(\d+)/), x = Z(q.prompt.match(new RegExp(`x=(${ZAHL})`))[1]), z = (x - +m[1]) / +m[2];
      ok(nah(r.num, z) && nah(Z(r.tex.replace('z=', '')), z, 1e-3), `${tag}: z stimmt`); for (const o of falsche(q)) ok(Math.abs(o.num - z) > 1e-3 * (1 + 2 * Math.abs(z)), `${tag}: Ablenker falsch`);
      if (lv === 2) ok(!Number.isInteger(z), `${tag}: z mit Komma`); return; }
    let want, anzeige = Z(r.tex.replace('\\,\\%', '')) / 100;
    if (lv <= 4) { const src = lv === 3 ? q.formula : q.prompt, m = src.match(new RegExp(`\\\\mu=(${ZAHL})[\\s\\S]*?\\\\sigma=(${ZAHL})`)), x = Z(q.prompt.match(new RegExp(`P\\(X\\\\le (${ZAHL})\\)`))[1]);
      want = PhiNum((x - Z(m[1])) / Z(m[2])); ok(nah(Z(m[1]), q.mu) && nah(Z(m[2]), q.sg) && nah(x, q.x), `${tag}: Felder passen zum Text`); }
    else { const N = +q.prompt.match(/(\d+) (befragten|Bauteile)/)[1], p = Z(q.prompt.match(/Wahrscheinlichkeit (0,\d+)/)[1]), k = +q.prompt.match(/höchstens (\d+)<\/b>/)[1], mu = N * p, sg = Math.sqrt(N * p * (1 - p));
      want = PhiNum((k + 0.5 - mu) / sg); ok(nah(mu, q.mu) && nah(sg, q.sg) && nah(k + 0.5, q.x), `${tag}: Felder passen zum Text`);
      ok(Math.abs(summe(N, p, 0, k) - want) < 0.01, `${tag}: Näherung liegt nahe am genauen Binomialwert (${summe(N, p, 0, k)} / ${want})`);
      ok(sg > 3 && Number.isInteger(Math.round(sg * 1e6) / 1e6), `${tag}: Laplace-Bedingung erfüllt`); }
    ok(Math.abs(r.num - want) < (lv === 3 ? 2e-3 : 1e-4) && Math.abs(anzeige - r.num) < 6e-4, `${tag}: Wahrscheinlichkeit stimmt (${r.num} / ${want})`);
    for (const o of falsche(q)) ok(Math.abs(o.num - want) > 0.01, `${tag}: Ablenker falsch`);
    if (lv >= 4) for (const m of q.formula.matchAll(/\\Phi\((\d(?:\{,\}\d+)?)\)\\approx(\d\{,\}\d+)/g)) ok(Math.abs(PhiNum(Z(m[1])) - Z(m[2])) < 6e-5, `${tag}: Tabellenwert Φ(${m[1]}) stimmt`);
  },
  genKombinatorik(q, r, lv, tag) {
    const t = q.prompt, z = (t.match(/\d+/g) || []).map(Number); let want;
    const fak = (m) => { let x = 1; for (let i = 2; i <= m; i++) x *= i; return x; };
    const pascal = (m, k) => { let Zeile = [1]; for (let i = 0; i < m; i++) Zeile = [1, ...Zeile.slice(1).map((x, j) => x + Zeile[j]), 1]; return Zeile[k]; };
    const fallend = (m, k) => { let x = 1; for (let i = 0; i < k; i++) x *= m - i; return x; };
    const hoch = (m, k) => { let x = 1; for (let i = 0; i < k; i++) x *= m; return x; };
    if (/in einer Reihe aufstellen/.test(t)) want = fak(z[0]);
    else if (/Zahlenschloss/.test(t)) want = hoch(z[1], z[0]);
    else if (/Rennen/.test(t)) want = fallend(z[0], z[2]);
    else if (/Team/.test(t)) want = pascal(z[0], z[1]);
    else if (/Straßennetz/.test(t)) { const [o, no] = z, G = Array.from({ length: o + 1 }, () => Array(no + 1).fill(1)); for (let i = 1; i <= o; i++) for (let j = 1; j <= no; j++) G[i][j] = G[i - 1][j] + G[i][j - 1]; want = G[o][no]; }   // Wege im Gitter abzählen
    else if (/Liga/.test(t)) { want = 0; for (let h = 0; h < z[0]; h++) for (let g = 0; g < z[0]; g++) if (h !== g) want++; }
    else if (/runden Tisch/.test(t)) { const m = z[0]; want = RUND[m] ??= (() => { const S = new Set(), perm = (rest, akt) => { if (!rest.length) { const i = akt.indexOf(0); S.add([...akt.slice(i), ...akt.slice(0, i)].join()); return; } rest.forEach((x, j) => perm(rest.filter((_, l) => l !== j), [...akt, x])); }; perm([...Array(m).keys()], []); return S.size; })(); }
    else if (/Pizzeria/.test(t)) { want = 0; for (let mask = 0; mask < 1 << z[0]; mask++) want++; }
    else if (/Türcode/.test(t)) want = hoch(26 + 10, z[0]);
    ok(want !== undefined && r.num === want, `${tag}: Anzahl stimmt (${r.num} / ${want})`);
    for (const o of falsche(q)) ok(o.num !== want, `${tag}: Ablenker falsch`);
    if (lv >= 4) ok(q.options.every((o) => /^\d+$/.test(o.tex) && +o.tex === o.num), `${tag}: Antworten sind ausgerechnete Zahlen`);
    else { const m = r.tex; const wert = /!\}\{/.test(m) ? fak(+m.match(/\{(\d+)!\}/)[1]) / fak(+m.match(/\{(\d+)!\}$/)[1]) : /binom/.test(m) ? pascal(...m.match(/\d+/g).map(Number)) : /!/.test(m) ? fak(parseInt(m, 10)) : hoch(...m.match(/\d+/g).map(Number)); ok(wert === want, `${tag}: angezeigter Ausdruck ${m} hat den richtigen Wert`); }
  },
  genGeradePunkt(q, r, lv, tag) {
    let A, u, Q;
    if (lv <= 3) { [A, u] = vecs(q.formula); Q = pts(q.prompt).Q; } else { const p = pts(q.formula); A = p.A; u = sub(p.B, p.A); Q = p.Q; }
    ok(A.every((c, i) => c === q.P[i]) && u.every((c, i) => c === q.u[i]), `${tag}: Gerade aus dem Text passt zu den Feldern`);
    if (lv >= 5) { ok(Q[2] === 'a', `${tag}: dritte Koordinate ist der Parameter`);
      const t1 = (Q[0] - A[0]) / u[0], t2 = (Q[1] - A[1]) / u[1], geht = Math.abs(t1 - t2) < 1e-9;
      if (geht) { const m = r.tex.match(new RegExp(`a=(${ZAHL}),\\\\ t=(${ZAHL})`)); ok(m && nah(Z(m[2]), t1) && nah(Z(m[1]), A[2] + t1 * u[2]) && r.t === t1, `${tag}: a und t stimmen`); } else ok(r.t === null, `${tag}: für kein a`);
      for (const o of falsche(q)) { const m = o.tex.match(new RegExp(`a=(${ZAHL}),\\\\ t=(${ZAHL})`)); ok(m ? !(geht && nah(Z(m[2]), t1)) : geht, `${tag}: Ablenker falsch`); if (m) ok(nah(Z(m[1]), A[2] + Z(m[2]) * u[2]), `${tag}: Ablenker in sich stimmig`); }
      return; }
    ok(Q.every((c, i) => c === q.Q[i]), `${tag}: Punkt passt zu den Feldern`);
    const t = dot(sub(Q, A), u) / dot(u, u), auf = istNull(sub(A.map((c, i) => c + t * u[i]), Q));   // Lotfußpunkt-Parameter
    ok(auf ? r.t !== null && nah(r.t, t) && nah(Z(r.tex.match(new RegExp(`t = (${ZAHL})`))[1]), t) : r.t === null, `${tag}: Punktprobe stimmt`);
    for (const o of falsche(q)) ok(auf ? o.t === null || !nah(o.t, t) : o.t !== null, `${tag}: Ablenker falsch`);
  },
  genEbene(q, r, lv, tag) {
    let drin;
    if (lv <= 2) { const E = ebene(q.formula); drin = (X) => dot(E.n, X) === E.d; ok(E.n.every((c, i) => c === q.n[i]) && E.d === q.d, `${tag}: Gleichung passt zu den Feldern`); if (lv === 1) ok(E.n.filter((c) => c !== 0).length === 2, `${tag}: zwei Koeffizienten`); }
    else if (lv === 3) { const [p0, nn] = vecs(q.formula); drin = (X) => dot(sub(X, p0), nn) === 0; }
    else if (lv === 4) { const [S0, a, b] = vecs(q.formula); drin = (X) => det(a, b, sub(X, S0)) === 0; ok(!istNull(kreuz(a, b)), `${tag}: Spannvektoren unabhängig`); }
    else { const p = pts(q.formula); drin = (X) => det(sub(p.B, p.A), sub(p.C, p.A), sub(X, p.A)) === 0; ok(!istNull(kreuz(sub(p.B, p.A), sub(p.C, p.A))), `${tag}: Punkte nicht auf einer Geraden`); }
    const X = (o) => pts(o.tex).P;
    ok(drin(X(r)) && X(r).every((c, i) => c === r.vec[i]), `${tag}: richtiger Punkt liegt in der Ebene`);
    for (const o of falsche(q)) ok(!drin(X(o)), `${tag}: Ablenker liegt nicht in der Ebene`);
    ok(q.options.every((o) => drin(o.vec) === (dot(q.n, o.vec) === q.d)), `${tag}: Koordinatenform der Lösung beschreibt dieselbe Ebene`);
  },
  genLage(q, r, lv, tag) {
    let A, u, C, v;
    const lage = (A_, u_, C_, v_) => (istNull(kreuz(u_, v_)) ? (istNull(kreuz(sub(C_, A_), u_)) ? 'identisch' : 'parallel') : Math.abs(det(u_, v_, sub(C_, A_))) < 1e-9 ? 'schnitt' : 'windschief');
    if (lv === 4) { const p = pts(q.formula); A = p.A; u = sub(p.B, p.A); C = p.C; v = sub(p.D, p.C); } else [A, u, C, v] = vecs(q.formula);
    if (lv >= 5) { const i = C.indexOf('a'); ok(i >= 0, `${tag}: Parameter im Stützvektor`);
      for (const o of q.options) { const a = Z(o.tex.replace('a=', '')), Ca = C.map((c, j) => (j === i ? a : c)), L = lage(A, u, Ca, v); ok(o.correct ? L === 'schnitt' : L === 'windschief', `${tag}: für ${o.tex} sind die Geraden ${L}`); }
      return; }
    const L = lage(A, u, C, v);
    ok(r.key === L && q.kind === L, `${tag}: Lage stimmt (${L})`);
    ok([A, u, C, v].every((w, j) => w.every((c, i) => c === [q.P, q.u, q.Q, q.v][j][i])), `${tag}: Felder passen zum Text`);
    if (L === 'schnitt') { const S = pts(q.explain).S; ok(S && istNull(kreuz(sub(S, A), u)) && istNull(kreuz(sub(S, C), v)), `${tag}: genannter Schnittpunkt liegt auf beiden Geraden`); }
  },
  genSchnittpunkt(q, r, lv, tag) {
    let inE, A, u;
    if (lv >= 5) { const [S0, a, b, P0, u0] = vecs(q.formula); inE = (X) => Math.abs(det(a, b, sub(X, S0))) < 1e-9; A = P0; u = u0; }
    else { const E = ebene(q.formula); inE = (X) => Math.abs(dot(E.n, X) - E.d) < 1e-9; ok(E.n.every((c, i) => c === q.n[i]) && E.d === q.d, `${tag}: Ebene passt zu den Feldern`);
      if (lv === 4) { const p = pts(q.formula); A = p.A; u = sub(p.B, p.A); } else [A, u] = vecs(q.formula); }
    const X = (o) => pts(o.tex).S;
    ok(inE(X(r)) && istNull(kreuz(sub(X(r), A), u)), `${tag}: Schnittpunkt liegt in E und auf g`);
    for (const o of falsche(q)) ok(!inE(X(o)), `${tag}: Ablenker liegt nicht in E`);
    ok(q.options.every((o) => X(o).every((c, i) => nah(c, o.vec[i]))), `${tag}: Anzeige passt zum gespeicherten Punkt`);
    if (lv >= 4) ok(X(r).some((c) => !Number.isInteger(c)), `${tag}: Schnittpunkt mit Komma`);
  },
  genAbstand(q, r, lv, tag) {
    let want; const p = pts(q.formula);
    if (lv <= 2) want = len(sub(p.B, p.A));
    else if (lv <= 4) { const E = ebene(q.formula), F = p.P.map((c, i) => c - ((dot(E.n, p.P) - E.d) / dot(E.n, E.n)) * E.n[i]);   // Lotfußpunkt
      ok(Math.abs(dot(E.n, F) - E.d) < 1e-9, `${tag}: Lotfußpunkt liegt in E`); want = len(sub(p.P, F)); }
    else { const a = sub(p.B, p.A), b = sub(p.C, p.A); want = Math.abs(det(a, b, sub(p.P, p.A))) / len(kreuz(a, b)); }   // Spatvolumen durch Grundfläche
    ok(nah(r.num, want, 1e-9), `${tag}: Abstand stimmt (${r.num} / ${want})`);
    const gezeigt = (o) => { const t = o.tex.includes('approx') ? o.tex.split('approx')[1] : o.tex.includes('sqrt') ? null : o.tex; return t === null ? null : Z(t); };
    ok(Math.abs(gezeigt(r) - want) <= 0.00501, `${tag}: angezeigter Wert stimmt`);
    for (const o of q.options) { const g = gezeigt(o); if (g !== null) ok(Math.abs(g - o.num) <= 0.00501, `${tag}: Anzeige passt zum Wert (${o.tex})`); const m = o.tex.match(/^\\dfrac\{(\d+)\}\{(\\sqrt\{)?(\d+)\}?\}/); if (m) ok(nah(+m[1] / (m[2] ? Math.sqrt(+m[3]) : +m[3]), o.num), `${tag}: Bruch passt zum Wert (${o.tex})`); }
    for (const o of falsche(q)) ok(Math.abs(o.num - want) > 2e-3 * (1 + 2 * want), `${tag}: Ablenker falsch`);
    if (lv >= 4) ok(!Number.isInteger(want) && /sqrt/.test(r.tex), `${tag}: krummes Ergebnis`);
  },
  genWinkel(q, r, lv, tag) {
    // jeden angezeigten Bruch selbst auswerten
    const wert = (t) => { const s = t.replace(/\\cos\\(varphi|alpha)=/, '').replace(/\\dfrac\{(.*?)\}\{(.*)\}$/, '(($1)/($2))').replace(/\\sqrt\{(\d+)\}/g, 'Math.sqrt($1)').replace(/\\cdot/g, '*').replace(/\^2/g, '**2').replace(/\{,\}/g, '.'); return Function(`return ${s}`)(); };
    let want;
    if (lv === 1) { const m = q.prompt.match(new RegExp(`\\\\vec v=(${ZAHL})[\\s\\S]*?\\|\\\\vec u\\|=(\\d+)[\\s\\S]*?\\|\\\\vec v\\|=(\\d+)`)); want = Z(m[1]) / (+m[2] * +m[3]); ok(nah(dot(q.u, q.v), Z(m[1])) && nah(len(q.u), +m[2]) && nah(len(q.v), +m[3]), `${tag}: Angaben passen zu den Vektoren`); }
    else if (lv <= 3) { const [u, v] = vecs(q.formula); want = Math.cos(Math.atan2(len(kreuz(u, v)), dot(u, v))); }
    else if (lv === 4) { const p = pts(q.formula), a = len(sub(p.C, p.B)), b = len(sub(p.C, p.A)), c = len(sub(p.B, p.A)); want = (b * b + c * c - a * a) / (2 * b * c); }   // Kosinussatz
    else { const [S0, a, b, P0, u] = vecs(q.formula);
      // Richtungsvektor auf die Ebene projizieren (Normalgleichungen), Winkel zwischen u und seiner Projektion
      const aa = dot(a, a), ab = dot(a, b), bb = dot(b, b), ua = dot(u, a), ub = dot(u, b), D = aa * bb - ab * ab, x = (ua * bb - ub * ab) / D, y = (ub * aa - ua * ab) / D, proj = a.map((c, i) => x * c + y * b[i]);
      const phi = (Math.acos(Math.min(1, len(proj) / len(u))) * 180) / Math.PI; want = Math.sin((phi * Math.PI) / 180);
      ok(Math.abs(Z(r.tex.match(new RegExp(`approx(${ZAHL})`))[1]) - phi) <= 0.0501, `${tag}: angezeigter Winkel stimmt (${r.tex} / ${phi})`);
      const alle = q.options.map((o) => Z(o.tex.match(new RegExp(`approx(${ZAHL})`))[1])); ok(alle.every((w, i) => alle.every((x2, j) => i === j || Math.abs(w - x2) >= 0.5)), `${tag}: Winkel deutlich verschieden`); }
    ok(nah(r.num, want, 1e-9) && Math.abs(want) < 1, `${tag}: Wert stimmt (${r.num} / ${want})`);
    ok(nah(dot(q.u, q.v) / (len(q.u) * len(q.v)), want, 1e-9), `${tag}: Felder u, v passen`);
    if (lv <= 4) for (const o of q.options) ok(nah(wert(o.tex), o.num, 1e-9), `${tag}: Ausdruck ${o.tex} hat den gespeicherten Wert`);
    for (const o of falsche(q)) ok(Math.abs(o.num - want) > 3e-3, `${tag}: Ablenker falsch`);
    if (lv >= 3 && lv <= 4) ok(/sqrt/.test(r.tex), `${tag}: krumme Längen`);
  },
  genKreuz(q, r, lv, tag) {
    let u, v;
    if (lv <= 3) [u, v] = vecs(q.formula); else { const p = pts(q.formula); u = sub(p.B, p.A); v = sub(p.C, p.A); }
    const c = vecs(r.tex)[0];
    // senkrecht auf beiden, Länge nach Lagrange, Rechtssystem
    ok(Math.abs(dot(c, u)) < 1e-9 && Math.abs(dot(c, v)) < 1e-9 && nah(dot(c, c), dot(u, u) * dot(v, v) - dot(u, v) ** 2, 1e-9) && det(u, v, c) > 0, `${tag}: Kreuzprodukt stimmt`);
    ok(c.every((x, i) => x === r.vec[i]) && u.every((x, i) => nah(x, q.u[i])) && v.every((x, i) => nah(x, q.v[i])), `${tag}: Felder passen`);
    for (const o of falsche(q)) ok(vecs(o.tex)[0].some((x, i) => Math.abs(x - c[i]) > 1e-9), `${tag}: Ablenker falsch`);
    if (lv >= 5) ok([...u, ...v].some((x) => !Number.isInteger(x)), `${tag}: Komma-Koordinaten`);
  },
  genOperator(q, r, lv, tag) {
    ok(r.key === q.expect && new Set(q.options.map((o) => o.key)).size === 4, `${tag}: Schlüssel stimmt`);
    const OP = Object.fromEntries(H.OPERATOREN);
    if (lv <= 2) { const name = q.prompt.match(/„(.*?)[“"]/)[1]; ok(OP[name] === r.tex, `${tag}: Beschreibung gehört zum Operator`); for (const o of falsche(q)) ok(OP[o.key] === o.tex && o.key !== name, `${tag}: Ablenker beschreibt einen anderen Operator`); }
    else if (lv === 3) { const stamm = { 'Angeben / Nennen': /Geben Sie .* an\./, Berechnen: /Berechnen Sie/, 'Bestimmen / Ermitteln': /Bestimmen Sie/, 'Zeigen / Nachweisen': /Zeigen Sie/, Begründen: /Begründen Sie/, Skizzieren: /Skizzieren Sie/, Zeichnen: /Zeichnen Sie/, Untersuchen: /Untersuchen Sie/, 'Interpretieren / Deuten': /Interpretieren Sie/, Beurteilen: /Beurteilen Sie/, Beschreiben: /Beschreiben Sie/, Entscheiden: /Entscheiden Sie/ };
      ok(stamm[r.key].test(q.prompt) && OP[r.key] === r.tex, `${tag}: Beispiel enthält den Operator ${r.key}`);
      ok(Object.entries(stamm).filter(([, re]) => re.test(q.prompt)).length === 1, `${tag}: genau ein Operator im Beispiel`); }
    else if (lv === 4) { const [a, b] = [...q.prompt.matchAll(/„(.*?)[“"]/g)].map((m) => m[1]); ok(OP[a] && OP[b] && a !== b && r.tex.includes(a.split(' / ')[0]) && r.tex.includes(b.split(' / ')[0]), `${tag}: Aussage nennt beide Operatoren`); }
    else ok(/Was fehlt/.test(q.prompt) && q.hints.length >= 4, `${tag}: Fall mit Lösungsweg`);
  },
};
const RUND = {};

for (const [name, pruefe] of Object.entries(P)) {
  const proStufe = [];
  for (let lv = 1; lv <= 5; lv++) {
    seedRandom(4200 + lv * 17 + name.length); const texte = new Set();
    for (let i = 0; i < 200; i++) { const q = H[name](lv), tag = `${name} (Stufe ${lv})`; const r = allgemein(name, q, lv);
      try { pruefe(q, r, lv, tag); } catch (e) { ok(false, `${tag}: Prüfung bricht ab – ${e.message} | ${q.prompt} | ${q.formula}`); }
      texte.add(`${q.prompt}|${q.formula ?? ''}`); }
    proStufe.push(texte);
  }
  seedRandom(null);
  const gemeinsam = [...proStufe[4]].filter((t) => proStufe[0].has(t)).length; ok(gemeinsam === 0 || name === 'genOperator', `${name}: Stufe 5 stellt andere Aufgaben als Stufe 1`);
}
if (fails) { console.error(`hart/gen2b: ${fails} Fehler bei ${n} Prüfungen`); process.exit(1); }
console.log(`hart/gen2b: ${n} Prüfungen bestanden`);
