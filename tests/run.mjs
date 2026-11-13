// Selbstprüfung ohne Browser: Aufgaben-Erzeuger, Spiel-Logik und Serien-Regel.
globalThis.window = { katex: { renderToString: (s) => s } };
const { genScheitel, genPotenzLuecke, genPolynom, genKette, genExp, genMix } = await import('../app/js/gen.js');
const { nDeriv, polyTex, vertexTex, lineTex, fmt } = await import('../app/js/math.js');
const { LEVELS: MB, simulate } = await import('../app/js/games/murmelbahn.js');
const { LEVELS: TG, hit } = await import('../app/js/games/tangente.js');
const { ROUNDS: ZR, grade, colX } = await import('../app/js/games/zeichnen.js');
const { POOL } = await import('../app/js/games/paare.js');
const { nextStreak } = await import('../app/js/store.js').catch(() => ({}));

let fails = 0, n = 0;
const ok = (cond, msg) => { n++; if (!cond) { fails++; console.error('FEHLER:', msg); } };
const XS = [-1.3, -0.4, 0.7, 1.9];
const close = (a, b) => Math.abs(a - b) < 1e-3 * (1 + Math.abs(a) + Math.abs(b));

// 1) Formel-Ausgabe
ok(polyTex([5, 0, -2, 0, 3]) === '3x^{4}-2x^{2}+5', 'polyTex');
ok(polyTex([0, -1]) === '-x' && polyTex([0]) === '0', 'polyTex Sonderfälle');
ok(vertexTex(1, -1, 1) === '(x+1)^2+1' && vertexTex(-0.5, 2, 0) === '-0{,}5(x-2)^2' && vertexTex(2, 0, -3) === '2x^2-3', 'vertexTex');
ok(lineTex(-0.5, 4) === '-0{,}5x+4' && lineTex(0, 2) === '2' && lineTex(1, 0) === 'x', 'lineTex');
ok(fmt(-0.001) === '0' && fmt(1.5) === '1,5', 'fmt');

// 2) Ableitungs-Aufgaben: genau eine richtige Antwort, sie stimmt numerisch, alle anderen sind wirklich falsch.
for (const gen of [genPolynom, genKette, genExp]) for (let i = 0; i < 300; i++) {
  const q = gen();
  const right = q.options.filter((o) => o.correct);
  ok(right.length === 1 && q.options.length === 4, `${gen.name}: genau eine richtige von vier`);
  ok(new Set(q.options.map((o) => o.tex)).size === 4, `${gen.name}: Antworten verschieden (${q.formula})`);
  ok(XS.every((x) => close(right[0].val(x), nDeriv(q.f, x))), `${gen.name}: richtige Antwort stimmt (${q.formula})`);
  for (const o of q.options) if (!o.correct) {
    ok(XS.some((x) => !close(o.val(x), nDeriv(q.f, x))), `${gen.name}: Ablenker ist falsch (${q.formula} → ${o.tex})`);
    ok(typeof o.why === 'string' && o.why.length > 10, `${gen.name}: Ablenker hat Diagnose`);
  }
  ok(q.hints.length >= 2 && q.explain, `${gen.name}: Tipps und Erklärung`);
}
for (let i = 0; i < 300; i++) {
  const q = genPotenzLuecke();
  ok(q.slots.every((s) => s.choices.includes(s.correct) && new Set(s.choices).size === s.choices.length), 'Lücke: richtige Wahl vorhanden, keine Doppelten');
  ok(XS.every((x) => close(q.val(x), nDeriv(q.f, x))), 'Lücke: Lösung stimmt');
  ok(XS.every((x) => close(q.slots[0].correct * x ** q.slots[1].correct, q.val(x))), 'Lücke: Slots ergeben die Lösung');
}
for (let i = 0; i < 300; i++) {
  const q = genScheitel();
  const right = q.options.filter((o) => o.correct);
  ok(right.length === 1 && new Set(q.options.map((o) => o.tex)).size === 4, 'Scheitel: eine richtige, vier verschiedene');
  ok(XS.every((x) => close(right[0].val(x), q.f(x))), 'Scheitel: richtige Gleichung passt zum Graphen');
  for (const o of q.options) if (!o.correct) ok(XS.some((x) => !close(o.val(x), q.f(x))), 'Scheitel: Ablenker passt nicht zum Graphen');
  ok(close(q.graph.f(q.graph.mark[0]), q.graph.mark[1]), 'Scheitel: markierter Punkt liegt auf dem Graphen');
}
for (let i = 0; i < 100; i++) ok(genMix().prompt, 'genMix liefert Aufgabe');

// 3) Murmelbahn: Ziel-Parameter sind einstellbar und gewinnen; die Startwerte gewinnen nicht.
MB.forEach((L, i) => {
  const K = { line: (p, x) => p.m * x + p.b, par: (p, x) => p.a * (x - p.d) ** 2 + p.e }[L.kind];
  const stars = L.starsX.map((x) => [x, K(L.target, x)]);
  ok(stars.every(([x, y]) => x > -6 && x < 6 && y > -1.5 && y < 9.5), `Murmelbahn ${i + 1}: Sterne im Bild`);
  for (const q of L.params) {
    const t = L.target[q.k];
    ok(t >= q.min && t <= q.max && Math.abs((t - q.min) / q.step - Math.round((t - q.min) / q.step)) < 1e-9, `Murmelbahn ${i + 1}: Ziel ${q.k}=${t} mit dem Regler erreichbar`);
  }
  ok(simulate(L.kind, L.target, stars).reason === 'win', `Murmelbahn ${i + 1}: Zielkurve gewinnt`);
  const init = { ...(L.fixed || {}) }; L.params.forEach((q) => { init[q.k] = q.init; });
  ok(simulate(L.kind, init, stars).reason !== 'win', `Murmelbahn ${i + 1}: Startwerte gewinnen nicht`);
});

// 4) Tangenten-Surfer: Ableitung stimmt, jede Mission ist im Bild lösbar.
TG.forEach((L, i) => {
  ok([-2, -0.5, 1.3].every((x) => close(L.d(x), nDeriv(L.f, x))), `Surfer ${i + 1}: Ableitung stimmt`);
  L.missions.forEach((M, j) => {
    let solvable;
    if (M.type === 'zero') solvable = M.xs.every((t, k) => Math.abs(L.d(t)) < 1e-9 && hit(L, M, t, new Set()) === k && t > L.view.x0 && t < L.view.x1);
    else if (M.type === 'at') solvable = hit(L, M, M.xs[0], new Set()) === 0;
    else { solvable = false; for (let x = L.view.x0 + 0.1; x <= L.view.x1 - 0.1; x += 0.01) if (hit(L, M, x, new Set()) === 0) solvable = true; }
    ok(solvable, `Surfer ${i + 1}, Mission ${j + 1}: lösbar`);
    if (M.type === 'at') {
      // „steilste Stelle" muss wirklich ein Extremum der Ableitung sein
      const t = M.xs[0];
      ok(Math.abs(nDeriv(L.d, t)) < 1e-3, `Surfer ${i + 1}, Mission ${j + 1}: Stelle ist Extremum der Steigung`);
    }
  });
});

// 5) Ableitung zeichnen: perfekte Skizze = 3 Sterne, gespiegelte Skizze = 0 Sterne mit Vorzeichen-Hinweis, leer = nichts.
ZR.forEach((R, i) => {
  ok([-3, -1, 0.5, 2].every((x) => close(R.d(x), nDeriv(R.f, x))), `Zeichnen ${i + 1}: Ableitung stimmt`);
  const perfect = Float32Array.from({ length: 161 }, (_, k) => Math.max(-2.4, Math.min(2.4, R.d(colX(k)))));
  ok(grade(R, perfect).stars === 3, `Zeichnen ${i + 1}: perfekte Skizze gibt 3 Sterne`);
  const flipped = perfect.map((y) => -y);
  const g = grade(R, flipped);
  ok(g.stars === 0 && g.wrong, `Zeichnen ${i + 1}: gespiegelte Skizze fällt durch und nennt die Stelle`);
  ok(grade(R, new Float32Array(161).fill(NaN)).stars === 0, `Zeichnen ${i + 1}: leere Skizze`);
  const rough = perfect.map((y, k) => y + 0.2 * Math.sin(k));
  ok(grade(R, rough).stars >= 2, `Zeichnen ${i + 1}: leicht wackelige Skizze wird akzeptiert`);
});

// 6) Graphen-Paare: Ableitungen stimmen und sind unterscheidbar.
POOL.forEach((P, i) => ok([-2, -0.7, 0.4, 1.8].every((x) => close(P.d(x), nDeriv(P.f, x))), `Paare ${i + 1}: Ableitung stimmt`));
for (let i = 0; i < POOL.length; i++) for (let j = i + 1; j < POOL.length; j++)
  ok([-2, -0.7, 0.4, 1.8].some((x) => Math.abs(POOL[i].d(x) - POOL[j].d(x)) > 0.3), `Paare ${i + 1}/${j + 1}: Ableitungen unterscheidbar`);

// 7) Serie „ohne Druck"
if (nextStreak) {
  const D = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d, 12); };
  ok(nextStreak({ n: 0, last: '' }, D('2026-11-13')).n === 1, 'Serie: erster Tag');
  ok(nextStreak({ n: 3, last: '2026-11-12' }, D('2026-11-13')).n === 4, 'Serie: Folgetag');
  ok(nextStreak({ n: 3, last: '2026-11-13' }, D('2026-11-13')).n === 3, 'Serie: gleicher Tag zählt einmal');
  ok(nextStreak({ n: 3, last: '2026-11-13' }, D('2026-11-16')).n === 4, 'Serie: Wochenende darf ausfallen (Fr → Mo)');
  ok(nextStreak({ n: 3, last: '2026-11-10' }, D('2026-11-12')).n === 1, 'Serie: ausgelassener Werktag setzt zurück');
} else ok(false, 'store.js nicht ladbar');

console.log(fails ? `${fails} von ${n} Prüfungen fehlgeschlagen` : `tests: alle ${n} Prüfungen bestanden`);
process.exit(fails ? 1 : 0);
