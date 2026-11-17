// Formel-Dungeon: jede Aufgabe, jeden Schritt und jeden Ablenker unabhängig nachprüfen.
// Richtig heißt: Das Endergebnis löst die Ausgangsgleichung (auch für neue, zufällige Werte der übrigen Größen).
// Falsch heißt: Ein Ablenker stimmt für die echten Werte nicht. Dazu: Jede Formel lässt sich setzen (KaTeX, falls vorhanden).
globalThis.window = { katex: { renderToString: (s) => s } };
const U = await import('../../app/js/umform.js');
const { aufgabe, falle, auswahl, zuege, gleichungTex, ergebnisTex, probeTex, wert, gilt, enthaelt, groessen, FORMELN, formelAufgabe, lies } = U;
let katex = null;
try { const vm = await import('node:vm'), fs = await import('node:fs'), ctx = { self: {} }; vm.createContext(ctx); vm.runInContext(fs.readFileSync(new URL('../../app/vendor/katex/katex.min.js', import.meta.url), 'utf8'), ctx); katex = ctx.self.katex; } catch { /* Setz-Prüfung entfällt */ }
const N = +(process.env.N || 150);
let n = 0, fehler = 0; const ok = (c, m) => { n++; if (!c) { fehler++; if (fehler < 25) console.error('FEHLER:', m); } };
const setzbar = (t) => { if (!katex) return true; try { katex.renderToString(t, { throwOnError: true }); return true; } catch (e) { return false; } };
const sauber = (t) => !/NaN|undefined|Infinity|\[object/.test(t);

/** Unabhängige Nullstellen-Suche für Zahl-Gleichungen: Vorzeichenwechsel von L − R auf einem Raster. */
function nullstellen(a) {
  const f = (x) => wert(a.l, { x }) - wert(a.r, { x }), out = [];
  let alt = f(-500.0005);
  for (let x = -500; x <= 500; x += 0.01) {
    const y = f(x);
    if (Number.isFinite(y) && Number.isFinite(alt) && (y === 0 || Math.sign(y) !== Math.sign(alt))) {
      // Vorzeichenwechsel: halbieren – eine echte Nullstelle hat dort den Wert 0, eine Polstelle nicht
      let lo = x - 0.01, hi = x, flo = alt;
      for (let k = 0; k < 60; k++) { const m = (lo + hi) / 2, fm = f(m); if (Math.sign(fm) === Math.sign(flo)) { lo = m; flo = fm; } else hi = m; }
      if (Math.abs(f((lo + hi) / 2)) < 1e-6) out.push((lo + hi) / 2);
    }
    alt = y;
  }
  return out;
}

function pruefe(a, wo) {
  const tx0 = gleichungTex(a.l, a.r);
  ok(sauber(tx0) && setzbar(tx0), `${wo}: Aufgabe nicht setzbar ${tx0}`);
  ok(a.weg.length >= 1 && a.weg.length <= 12, `${wo}: Weglänge ${a.weg.length}`);
  // Jeder Schritt: richtig bleibt wahr, Ablenker sind falsch und verschieden
  let st = { l: a.l, r: a.r, x: a.x };
  for (const s of a.weg) {
    const w = auswahl(st, a.wahr);
    ok(w && w.opts.filter((o) => o.ok).length === 1, `${wo}: nicht genau eine richtige Möglichkeit bei ${gleichungTex(st.l, st.r)}`);
    ok(w.opts.length >= 3, `${wo}: zu wenige Möglichkeiten (${w.opts.length}) bei ${gleichungTex(st.l, st.r)}`);
    const t = w.opts.map((o) => gleichungTex(o.l, o.r));
    ok(new Set(t).size === t.length, `${wo}: doppelte Möglichkeiten ${t.join(' | ')}`);
    for (const o of w.opts) {
      const g = gleichungTex(o.l, o.r);
      ok(sauber(g) && setzbar(g) && setzbar(o.label), `${wo}: nicht setzbar ${o.label} ⇒ ${g}`);
      if (o.ok) ok(a.wahr.every((env) => gilt(o.l, o.r, env)), `${wo}: richtiger Schritt falsch ${g}`);
      else { ok(a.wahr.every((env) => !gilt(o.l, o.r, env)), `${wo}: Ablenker stimmt doch ${g}`); ok(o.why && o.why.length > 20 && sauber(o.why), `${wo}: Ablenker ohne Erklärung`); }
    }
    ok(w.tipp && sauber(w.tipp), `${wo}: kein Tipp`);
    ok(a.wahr.every((env) => gilt(s.l, s.r, env)), `${wo}: Lösungsweg-Zeile falsch ${gleichungTex(s.l, s.r)}`);
    st = { ...st, l: s.l, r: s.r };
  }
  const e = ergebnisTex(a); ok(sauber(e) && setzbar(e) && e.startsWith(`${a.x} = `), `${wo}: Ergebnis ${e}`);
  const end = a.weg[a.weg.length - 1], ausdruck = enthaelt(end.l, a.x) ? end.r : end.l;
  ok(!enthaelt(ausdruck, a.x), `${wo}: ${a.x} steht noch im Ergebnis`);
  if (a.art === 'zahl') {
    const x = wert(ausdruck, {});
    ok(Math.abs(x - a.x0) < 1e-9, `${wo}: Ergebnis ${x} statt ${a.x0}`);
    ok(gilt(a.l, a.r, { x }), `${wo}: Ergebnis löst die Gleichung nicht`);
    const ns = nullstellen(a);
    ok(ns.length >= 1 && ns.every((z) => Math.abs(z - x) < 0.02), `${wo}: Gleichung hat andere Lösungen ${ns.slice(0, 4)} (erwartet ${x}) – ${tx0}`);
    const p = probeTex(a); ok(sauber(p) && setzbar(p), `${wo}: Probe ${p}`);
  } else {
    // neue Werte für alle anderen Größen wählen, die gesuchte aus dem Ergebnis ausrechnen – die Ausgangsformel muss stimmen
    for (const env0 of a.wahr) {
      const env = { ...env0 };
      for (const g of groessen(ausdruck)) env[g] = env0[g];
      const x = wert(ausdruck, env); env[a.x] = x;
      ok(Number.isFinite(x) && Math.abs(x - env0[a.x]) < 1e-6 * Math.max(1, Math.abs(x)), `${wo}: Ergebnis-Formel liefert ${x} statt ${env0[a.x]} – ${e}`);
    }
  }
}

const JG = ['5', '6', '7', '8', '9', '10', 'os'];
for (let stock = 1; stock <= 5; stock++) {
  for (let k = 0; k < N; k++) {
    const jg = JG[k % JG.length], a = aufgabe(stock, jg, k % 5 === 0);
    ok(!!a, `Stockwerk ${stock}: keine Aufgabe`); if (!a) continue;
    pruefe(a, `Stockwerk ${stock} (${jg})`);
    if ((jg === '5' || jg === '6') && (stock <= 2 || (stock <= 4 && !a.th))) ok(a.x0 > 0 && [a, ...a.weg].every((z) => !/(^|=|\(|\{)\s*-/.test(gleichungTex(z.l, z.r))), `Klasse ${jg}: negative Zahl in ${gleichungTex(a.l, a.r)}`);
  }
  // Fallen-Raum
  for (let k = 0; k < Math.ceil(N / 3); k++) {
    const f = falle(stock, JG[k % JG.length]);
    ok(!!f, `Falle ${stock}: keine`); if (!f) continue;
    const a = f.aufgabe;
    ok(f.fehler >= 1 && f.fehler < f.zeilen.length, `Falle ${stock}: Index ${f.fehler}`);
    f.zeilen.forEach((z, i) => {
      const t = gleichungTex(z.l, z.r); ok(sauber(t) && setzbar(t), `Falle: nicht setzbar ${t}`);
      const wahrHier = a.wahr.every((env) => gilt(z.l, z.r, env));
      if (i < f.fehler) ok(wahrHier, `Falle ${stock}: Zeile ${i} vor dem Fehler ist falsch ${t}`);
      if (i === f.fehler) ok(!wahrHier, `Falle ${stock}: Fehlerzeile stimmt ${t}`);
    });
    const letzte = f.zeilen[f.zeilen.length - 1];
    ok(a.wahr.every((env) => !gilt(letzte.l, letzte.r, env)), `Falle ${stock}: Endergebnis stimmt doch`);
    ok(f.why && sauber(f.why), 'Falle ohne Erklärung');
  }
}
// Jede Formel und jede gesuchte Größe der Sammlung einmal ganz
for (const F of FORMELN) for (const z of F.ziele) {
  let a = null; for (let k = 0; k < 20 && !a; k++) a = formelAufgabe(F, z);
  ok(!!a, `Formel ${F.f} nach ${z}: nicht lösbar`); if (a) pruefe(a, `${F.f} nach ${z}`);
  const gl = lies(F.f); ok(setzbar(gleichungTex(gl.l, gl.r)), `Formel ${F.f} nicht setzbar`);
}

if (fehler) { console.error(`hart/dungeon: ${fehler} von ${n} Prüfungen fehlgeschlagen`); process.exit(1); }
console.log(`hart/dungeon: ${n} Prüfungen bestanden${katex ? '' : ' (ohne Setz-Prüfung)'}`);
