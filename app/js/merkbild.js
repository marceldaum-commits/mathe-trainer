// Merkbilder: kleine bewegte Bilder zum Anfassen – eine Idee, ein Bild, ein Regler.
// Jedes Bild läuft erst von selbst und gehört dem Finger, sobald man den Regler berührt.
// Alles selbst gezeichnet (Canvas), keine fremden Bilder, keine Daten nach außen.
import { h, esc, cssVar } from './ui.js';

const TAU = Math.PI * 2;
const farbe = () => ({ tinte: cssVar('--head') || '#101b43', leise: cssVar('--muted') || '#61718a', linie: cssVar('--line') || '#dbe4ef', gitter: cssVar('--grid') || '#e6ecf5',
  orange: cssVar('--orange') || '#ff7418', blau: '#2f6fd0', gruen: '#2fae7a', rot: '#d85042', gelb: '#f0b429', flaeche: 'rgba(47,111,208,.22)' });
const ruhig = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const zahl = (v, n = 1) => (Math.round(v * 10 ** n) / 10 ** n).toFixed(n).replace('.', ',').replace(/,0+$/, '');

/** Gemeinsame Bühne: Zeichenfläche, Regler, Textzeile. zeichne(g, B, H, wert, zeit, F) malt ein Bild, text(wert) beschreibt es. */
function buehne({ titel, regler, zeichne, text, hoehe = 190, dauer = 5200, start }) {
  const el = h(`<figure class="merk"><figcaption>${esc(titel)}</figcaption><canvas aria-label="${esc(titel)}"></canvas>
    <output class="merk-text" aria-live="off"></output>
    <label class="merk-regler"><span>${esc(regler.label)}</span><input type="range" min="${regler.min}" max="${regler.max}" step="${regler.step ?? 0.01}" value="${start ?? regler.min}" aria-label="${esc(regler.label)}"></label></figure>`);
  const c = el.querySelector('canvas'), inp = el.querySelector('input'), out = el.querySelector('output'), g = c.getContext('2d');
  let selbst = !ruhig(), t0 = 0, raf = 0, B = 320;
  const mass = () => { const d = Math.min(window.devicePixelRatio || 1, 2); B = Math.max(220, Math.round(c.getBoundingClientRect().width) || 320); c.width = B * d; c.height = hoehe * d; c.style.height = `${hoehe}px`; g.setTransform(d, 0, 0, d, 0, 0); };
  const bild = (zeit) => { const w = +inp.value; g.clearRect(0, 0, B, hoehe); zeichne(g, B, hoehe, w, zeit, farbe()); out.textContent = text(w); };
  const takt = (jetzt) => {
    if (!el.isConnected) { raf = 0; return; }            // Bild ist weg: Schleife endet von selbst
    if (!t0) t0 = jetzt;
    const zeit = (jetzt - t0) / 1000;
    if (selbst) { const p = 0.5 - 0.5 * Math.cos((TAU * (jetzt - t0)) / dauer); inp.value = String(+regler.min + p * (regler.max - regler.min)); }
    bild(zeit); raf = requestAnimationFrame(takt);
  };
  const an = () => { if (!raf && el.isConnected) { mass(); raf = requestAnimationFrame(takt); } };
  inp.addEventListener('input', () => { selbst = false; });
  inp.addEventListener('pointerdown', () => { selbst = false; });
  // startet, sobald das Bild wirklich in der Seite steht
  queueMicrotask(() => { if (el.isConnected) an(); else { const mo = new MutationObserver(() => { if (el.isConnected) { mo.disconnect(); an(); } }); mo.observe(document.documentElement, { childList: true, subtree: true }); } });
  return el;
}

/* Hilfen zum Zeichnen */
function achsen(g, F, X, Y, x0, x1, y0, y1) {
  g.strokeStyle = F.gitter; g.lineWidth = 1; g.beginPath();
  for (let x = Math.ceil(x0); x <= x1; x++) { g.moveTo(X(x), Y(y0)); g.lineTo(X(x), Y(y1)); }
  for (let y = Math.ceil(y0); y <= y1; y++) { g.moveTo(X(x0), Y(y)); g.lineTo(X(x1), Y(y)); }
  g.stroke();
  g.strokeStyle = F.leise; g.lineWidth = 1.3; g.beginPath(); g.moveTo(X(x0), Y(0)); g.lineTo(X(x1), Y(0)); g.moveTo(X(0), Y(y0)); g.lineTo(X(0), Y(y1)); g.stroke();
}
function kurve(g, f, X, Y, x0, x1, col, breit = 3) {
  g.strokeStyle = col; g.lineWidth = breit; g.lineJoin = 'round'; g.beginPath();
  for (let i = 0; i <= 120; i++) { const x = x0 + ((x1 - x0) * i) / 120; if (i) g.lineTo(X(x), Y(f(x))); else g.moveTo(X(x), Y(f(x))); }
  g.stroke();
}
function pfeil(g, x1, y1, x2, y2, col, breit = 3) {
  const a = Math.atan2(y2 - y1, x2 - x1), L = Math.hypot(x2 - x1, y2 - y1), k = Math.min(11, L * 0.45);
  g.strokeStyle = col; g.fillStyle = col; g.lineWidth = breit; g.lineCap = 'round';
  g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
  if (L > 4) { g.beginPath(); g.moveTo(x2, y2); g.lineTo(x2 - k * Math.cos(a - 0.42), y2 - k * Math.sin(a - 0.42)); g.lineTo(x2 - k * Math.cos(a + 0.42), y2 - k * Math.sin(a + 0.42)); g.closePath(); g.fill(); }
}
const schrift = (g, txt, x, y, col, gr = 12, fett = true, mitte = false) => { g.fillStyle = col; g.font = `${fett ? 700 : 500} ${gr}px system-ui,sans-serif`; g.textAlign = mitte ? 'center' : 'left'; g.fillText(txt, x, y); };
function rad(g, cx, cy, r, zaehne, winkel, col) {
  g.save(); g.translate(cx, cy); g.rotate(winkel); g.fillStyle = col; g.beginPath();
  for (let i = 0; i < zaehne * 2; i++) { const a = (i / (zaehne * 2)) * TAU, rr = i % 2 ? r : r + Math.max(5, r * 0.2); g.lineTo(rr * Math.cos(a - 0.09), rr * Math.sin(a - 0.09)); g.lineTo(rr * Math.cos(a + 0.09), rr * Math.sin(a + 0.09)); }
  g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.arc(0, 0, r * 0.32, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 0); g.lineTo(r * 0.86, 0); g.stroke();
  g.restore();
}

/* ───────────── Die Bilder ───────────── */

const fT = (x) => 0.18 * x ** 3 - 1.1 * x + 0.4, dT = (x) => 0.54 * x * x - 1.1;
function tangente() {
  return buehne({ titel: 'Die Tangente fährt mit', regler: { label: 'Stelle x', min: -2.6, max: 2.6 }, text: (x) => `Bei x = ${zahl(x)} ist die Steigung f′(x) = ${zahl(dT(x))} – ${Math.abs(dT(x)) < 0.08 ? 'waagerecht!' : dT(x) > 0 ? 'es geht bergauf' : 'es geht bergab'}`,
    zeichne(g, B, H, x, _t, F) {
      const X = (a) => ((a + 3) / 6) * B, Y = (b) => H / 2 - b * (H / 6.4);
      achsen(g, F, X, Y, -3, 3, -3, 3); kurve(g, fT, X, Y, -3, 3, F.blau);
      const m = dT(x), y = fT(x), col = Math.abs(m) < 0.08 ? F.gelb : m > 0 ? F.gruen : F.rot;
      g.strokeStyle = col; g.lineWidth = 3; g.beginPath(); g.moveTo(X(x - 1.3), Y(y - 1.3 * m)); g.lineTo(X(x + 1.3), Y(y + 1.3 * m)); g.stroke();
      g.fillStyle = F.orange; g.beginPath(); g.arc(X(x), Y(y), 7, 0, TAU); g.fill();
      schrift(g, `m = ${zahl(m)}`, 10, 18, col, 14);
    } });
}
function kette() {
  return buehne({ titel: 'Kettenregel: zwei Zahnräder', regler: { label: 'x drehen', min: 0, max: 1 }, dauer: 6400, text: (w) => `x dreht ${zahl(w, 2)} Runden → innen ×2 → außen ×3. Zusammen dreht es 2 · 3 = 6-mal so schnell: ${zahl(w * 6, 1)} Runden`,
    zeichne(g, B, H, w, _t, F) {
      const cy = H / 2 + 6, r1 = 24, r2 = 38, r3 = 52, x1 = B * 0.16, x2 = x1 + r1 + r2 + 12, x3 = x2 + r2 + r3 + 14;
      rad(g, x1, cy, r1, 8, w * TAU, F.leise); rad(g, x2, cy, r2, 12, -w * 2 * TAU, F.blau); rad(g, Math.min(x3, B - r3 - 10), cy, r3, 16, w * 6 * TAU, F.orange);
      schrift(g, 'x', x1, cy - r1 - 14, F.leise, 13, true, true); schrift(g, 'innen ·2', x2, cy - r2 - 14, F.blau, 13, true, true); schrift(g, 'außen ·3', Math.min(x3, B - r3 - 10), cy - r3 - 12, F.orange, 13, true, true);
    } });
}
function produkt() {
  return buehne({ titel: 'Produktregel: Das Rechteck wächst', regler: { label: 'ein Stück weiter', min: 0, max: 1 }, text: (w) => (w < 0.05 ? 'Fläche = u · v. Zieh den Regler: Beide Seiten wachsen ein Stück.' : 'Dazu kommen zwei Streifen: u′·v (rechts) und u·v′ (oben). Die kleine Ecke zählt nicht.'),
    zeichne(g, B, H, w, _t, F) {
      const u = B * 0.46, v = H * 0.5, du = w * B * 0.2, dv = w * H * 0.26, x0 = B * 0.12, y0 = H - 22;
      g.fillStyle = F.flaeche; g.fillRect(x0, y0 - v, u, v); g.strokeStyle = F.blau; g.lineWidth = 2; g.strokeRect(x0, y0 - v, u, v);
      g.fillStyle = 'rgba(47,174,122,.45)'; g.fillRect(x0 + u, y0 - v, du, v);
      g.fillStyle = 'rgba(255,116,24,.45)'; g.fillRect(x0, y0 - v - dv, u, dv);
      g.fillStyle = 'rgba(97,113,138,.3)'; g.fillRect(x0 + u, y0 - v - dv, du, dv);
      schrift(g, 'u · v', x0 + u / 2, y0 - v / 2 + 5, F.blau, 15, true, true); schrift(g, 'u', x0 + u / 2, y0 + 15, F.leise, 12, true, true); schrift(g, 'v', x0 - 12, y0 - v / 2, F.leise, 12, true, true);
      if (w > 0.12) { schrift(g, "u′·v", x0 + u + du / 2, y0 - v / 2 + 4, F.gruen, 12, true, true); schrift(g, "u·v′", x0 + u / 2, y0 - v - dv / 2 + 4, F.orange, 12, true, true); }
    } });
}
const fI = (x) => 0.25 * x * x + 0.6, FI = (x) => x ** 3 / 12 + 0.6 * x;
function flaeche() {
  return buehne({ titel: 'Integral: Die Fläche füllt sich', regler: { label: 'obere Grenze b', min: 0.2, max: 3.6 }, text: (b) => `Von 0 bis ${zahl(b)}: Fläche = F(${zahl(b)}) − F(0) = ${zahl(FI(b), 2)}`,
    zeichne(g, B, H, b, _t, F) {
      const X = (a) => 24 + (a / 4) * (B - 36), Y = (y) => H - 20 - y * ((H - 34) / 4.4);
      achsen(g, F, X, Y, 0, 4, 0, 4);
      g.fillStyle = F.flaeche; g.beginPath(); g.moveTo(X(0), Y(0));
      for (let i = 0; i <= 60; i++) { const x = (b * i) / 60; g.lineTo(X(x), Y(fI(x))); }
      g.lineTo(X(b), Y(0)); g.closePath(); g.fill();
      kurve(g, fI, X, Y, 0, 4, F.blau);
      g.strokeStyle = F.orange; g.lineWidth = 2.5; g.beginPath(); g.moveTo(X(b), Y(0)); g.lineTo(X(b), Y(fI(b))); g.stroke();
      schrift(g, 'b', X(b), H - 5, F.orange, 13, true, true);
    } });
}
function galton() {
  // Nagelbrett: Jede Kugel fällt 8 Reihen, geht mit Wahrscheinlichkeit p nach rechts. Fest gewürfelt, damit das Bild ruhig bleibt.
  const N = 8, W = Array.from({ length: 400 }, (_, i) => Array.from({ length: N }, (_, j) => (Math.sin(i * 12.9898 + j * 78.233) * 43758.5453) % 1).map((v) => Math.abs(v)));
  return buehne({ titel: 'Nagelbrett: So entsteht die Verteilung', regler: { label: 'Trefferwahrscheinlichkeit p', min: 0.15, max: 0.85 }, start: 0.5, dauer: 9000, hoehe: 200,
    text: (p) => `p = ${zahl(p, 2)}: Die meisten Kugeln landen bei μ = n · p = ${zahl(8 * p, 1)} Treffern`,
    zeichne(g, B, H, p, t, F) {
      const bins = Array(N + 1).fill(0), sicht = Math.min(400, Math.floor(t * 55) + 40);
      for (let i = 0; i < sicht; i++) bins[W[i].filter((v) => v < p).length]++;
      const bw = (B - 24) / (N + 1), max = Math.max(...bins, 1), hoch = H - 46;
      bins.forEach((n, k) => { const hh = (n / max) * hoch; g.fillStyle = Math.abs(k - 8 * p) < 0.5 ? F.orange : F.blau; g.fillRect(12 + k * bw + 3, H - 22 - hh, bw - 6, hh); schrift(g, String(k), 12 + k * bw + bw / 2, H - 6, F.leise, 11, false, true); });
      g.fillStyle = F.leise; for (let r = 0; r < 4; r++) for (let k = 0; k <= r + 4; k++) { g.beginPath(); g.arc(B / 2 + (k - (r + 4) / 2) * 16, 10 + r * 9, 2, 0, TAU); g.fill(); }
      const fall = (t * 2.2) % 1; g.fillStyle = F.orange; g.beginPath(); g.arc(B / 2 + Math.sin(t * 9) * 14 * fall, 6 + fall * 40, 4, 0, TAU); g.fill();
    } });
}
function bedingt() {
  // 100 Personen: 10 krank (9 davon Test positiv), 90 gesund (18 davon fälschlich positiv)
  return buehne({ titel: 'Bedingte Wahrscheinlichkeit: Wer steht noch da?', regler: { label: 'Schritt', min: 0, max: 2, step: 0.02 }, dauer: 8000, hoehe: 200,
    text: (w) => (w < 0.67 ? '100 Personen: 10 sind krank (orange), 90 gesund.' : w < 1.34 ? 'Test positiv: 9 Kranke – aber auch 18 Gesunde. Der Rest tritt zurück.' : 'Von den 27 Positiven sind nur 9 krank: 9 von 27 = ein Drittel.'),
    zeichne(g, B, H, w, _t, F) {
      const st = w < 0.67 ? 0 : w < 1.34 ? 1 : 2, a = Math.min(B - 20, (H - 14) * 1.9) / 20, x0 = (B - a * 20) / 2 + a / 2, y0 = (H - a * 5) / 2 + a / 2;
      for (let i = 0; i < 100; i++) {
        const krank = i < 10, pos = krank ? i < 9 : i < 28, col = i % 20, row = Math.floor(i / 20);
        g.globalAlpha = st === 0 || pos ? 1 : 0.14; g.fillStyle = krank ? F.orange : F.blau;
        g.beginPath(); g.arc(x0 + col * a, y0 + row * a, a * 0.36, 0, TAU); g.fill();
        if (st >= 1 && pos) { g.strokeStyle = F.tinte; g.lineWidth = 2; g.stroke(); }
        if (st === 2 && pos && krank) { g.strokeStyle = F.gruen; g.lineWidth = 3.5; g.beginPath(); g.arc(x0 + col * a, y0 + row * a, a * 0.46, 0, TAU); g.stroke(); }
      }
      g.globalAlpha = 1;
    } });
}
function skalar() {
  return buehne({ titel: 'Skalarprodukt: Der Schatten', regler: { label: 'Winkel', min: 0, max: 180, step: 1 }, start: 30, text: (w) => `Winkel ${Math.round(w)}°: u · v = ${zahl(4 * 3 * Math.cos((w * Math.PI) / 180), 1)}${Math.abs(w - 90) < 1.5 ? ' – genau 0: senkrecht!' : w > 90 ? ' – negativ: Der Schatten zeigt nach hinten' : ''}`,
    zeichne(g, B, H, w, _t, F) {
      const cx = B * 0.42, cy = H - 34, e = Math.min(34, (B * 0.5) / 4), a = (w * Math.PI) / 180, ux = 4 * e, vx = 3 * e * Math.cos(a), vy = 3 * e * Math.sin(a);
      g.strokeStyle = F.gitter; g.lineWidth = 1; g.beginPath(); g.moveTo(8, cy); g.lineTo(B - 8, cy); g.stroke();
      g.strokeStyle = F.leise; g.setLineDash([4, 4]); g.beginPath(); g.moveTo(cx + vx, cy - vy); g.lineTo(cx + vx, cy); g.stroke(); g.setLineDash([]);
      pfeil(g, cx, cy, cx + ux, cy, F.blau, 4); pfeil(g, cx, cy, cx + vx, cy - vy, F.gruen, 4);
      if (Math.abs(vx) > 3) pfeil(g, cx, cy + 12, cx + vx, cy + 12, Math.abs(w - 90) < 1.5 ? F.gelb : F.orange, 5);
      schrift(g, 'u', cx + ux + 6, cy + 4, F.blau, 14); schrift(g, 'v', cx + vx + 6, cy - vy - 4, F.gruen, 14); schrift(g, 'Schatten von v auf u', cx - 8, cy + 30, F.orange, 11, false);
    } });
}
function verbindung() {
  const A = [1, 1], Bp = [5, 3];
  return buehne({ titel: 'Von A nach B: Spitze minus Fuß', regler: { label: 'losgehen', min: 0, max: 1 }, text: (w) => (w < 0.98 ? 'Der Pfeil wächst von A (Fuß) nach B (Spitze).' : 'AB = B − A = (5 − 1 | 3 − 1) = (4 | 2): 4 nach rechts, 2 nach oben.'),
    zeichne(g, B, H, w, _t, F) {
      const X = (a) => 22 + (a / 6) * (B - 40), Y = (y) => H - 18 - (y / 4) * (H - 34);
      achsen(g, F, X, Y, 0, 6, 0, 4);
      g.strokeStyle = F.leise; g.setLineDash([5, 4]); g.lineWidth = 2; g.beginPath(); g.moveTo(X(A[0]), Y(A[1])); g.lineTo(X(A[0] + 4 * w), Y(A[1])); g.lineTo(X(A[0] + 4 * w), Y(A[1] + 2 * w)); g.stroke(); g.setLineDash([]);
      pfeil(g, X(A[0]), Y(A[1]), X(A[0] + 4 * w), Y(A[1] + 2 * w), F.orange, 4);
      for (const [P, n] of [[A, 'A'], [Bp, 'B']]) { g.fillStyle = F.blau; g.beginPath(); g.arc(X(P[0]), Y(P[1]), 6, 0, TAU); g.fill(); schrift(g, n, X(P[0]) - 4, Y(P[1]) - 11, F.blau, 14); }
      if (w > 0.5) { schrift(g, '4', X(A[0] + 2), Y(A[1]) + 15, F.leise, 12, true, true); schrift(g, '2', X(A[0] + 4) + 8, Y(A[1] + 1) + 4, F.leise, 12); }
    } });
}
function begrenzt() {
  const S = 80, f = (t) => S - 60 * Math.exp(-0.45 * t);
  return buehne({ titel: 'Begrenztes Wachstum: Der Akku lädt', regler: { label: 'Zeit t', min: 0, max: 10 }, dauer: 7000, text: (t) => `Nach ${zahl(t)} Stunden: ${zahl(f(t), 0)} %. Bis zur Grenze fehlen noch ${zahl(S - f(t), 0)} – je weniger fehlt, desto langsamer geht es.`,
    zeichne(g, B, H, t, _z, F) {
      const X = (a) => 20 + (a / 10) * (B * 0.68 - 20), Y = (y) => H - 18 - (y / 100) * (H - 30);
      g.strokeStyle = F.gitter; g.lineWidth = 1; g.beginPath(); g.moveTo(X(0), Y(0)); g.lineTo(X(10), Y(0)); g.moveTo(X(0), Y(0)); g.lineTo(X(0), Y(100)); g.stroke();
      g.strokeStyle = F.rot; g.setLineDash([6, 5]); g.lineWidth = 2; g.beginPath(); g.moveTo(X(0), Y(S)); g.lineTo(X(10), Y(S)); g.stroke(); g.setLineDash([]); schrift(g, 'Grenze S', X(0) + 4, Y(S) - 5, F.rot, 11);
      kurve(g, f, X, Y, 0, 10, F.blau); g.fillStyle = F.orange; g.beginPath(); g.arc(X(t), Y(f(t)), 6, 0, TAU); g.fill();
      const bx = B * 0.76, bw = B * 0.16, bh = H - 44, voll = (f(t) / 100) * bh;   // Akku
      g.strokeStyle = F.tinte; g.lineWidth = 3; g.strokeRect(bx, 24, bw, bh); g.fillStyle = F.tinte; g.fillRect(bx + bw * 0.3, 17, bw * 0.4, 7);
      g.fillStyle = F.gruen; g.fillRect(bx + 4, 24 + bh - voll + 2, bw - 8, voll - 4);
      schrift(g, `${zahl(f(t), 0)} %`, bx + bw / 2, 24 + bh / 2 + 5, F.tinte, 13, true, true);
    } });
}
function pythagoras() {
  return buehne({ titel: 'Pythagoras: Zwei Quadrate werden eins', regler: { label: 'Seite a', min: 1.5, max: 4.5 }, start: 3, hoehe: 250, text: (a) => { const b = 4, c = Math.hypot(a, b); return `a² + b² = ${zahl(a * a, 1)} + ${zahl(b * b, 0)} = ${zahl(c * c, 1)} = c²   (c = ${zahl(c, 2)})`; },
    zeichne(g, B, H, a, _t, F) {
      const b = 4, e = Math.min((B - 20) / 13.2, (H - 16) / 12.7), x0 = (B - 13 * e) / 2 + 4.5 * e, y0 = 8 + 8.5 * e;   // Platz: links a, rechts und oben a + b, unten b
      // rechter Winkel bei (x0, y0); a nach oben, b nach rechts
      g.fillStyle = 'rgba(47,174,122,.35)'; g.fillRect(x0 - a * e, y0 - a * e, a * e, a * e);
      g.fillStyle = 'rgba(47,111,208,.3)'; g.fillRect(x0, y0, b * e, b * e);
      g.save(); g.translate(x0, y0 - a * e); g.rotate(Math.atan2(a, b)); g.fillStyle = 'rgba(255,116,24,.35)'; const c = Math.hypot(a, b) * e; g.fillRect(0, -c, c, c); g.restore();   // Quadrat über der langen Seite, nach außen
      g.fillStyle = F.tinte; g.strokeStyle = F.tinte; g.lineWidth = 3; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0, y0 - a * e); g.lineTo(x0 + b * e, y0); g.closePath(); g.stroke();
      schrift(g, 'a²', x0 - (a * e) / 2, y0 - (a * e) / 2 + 5, F.gruen, 14, true, true); schrift(g, 'b²', x0 + (b * e) / 2, y0 + (b * e) / 2 + 5, F.blau, 14, true, true); schrift(g, 'c²', x0 + (a + b) * e * 0.5, y0 - (a + b) * e * 0.5 + 5, F.orange, 14, true, true);
    } });
}

function scheitel() {
  return buehne({ titel: 'Scheitelform: Die Parabel wandert', regler: { label: 'd verschieben', min: -2.5, max: 2.5 }, text: (d) => `f(x) = (x ${d < 0 ? '+' : '−'} ${zahl(Math.abs(d))})² − 1: Der Scheitel liegt bei S(${zahl(d)} | −1). Minus in der Klammer heißt: nach rechts.`,
    zeichne(g, B, H, d, _t, F) {
      const X = (a) => ((a + 4) / 8) * B, Y = (b) => H * 0.72 - b * (H / 6.2);
      achsen(g, F, X, Y, -4, 4, -2, 4); kurve(g, (x) => x * x - 1, X, Y, -4, 4, F.linie, 2); kurve(g, (x) => (x - d) ** 2 - 1, X, Y, -4, 4, F.blau);
      g.fillStyle = F.orange; g.beginPath(); g.arc(X(d), Y(-1), 7, 0, TAU); g.fill(); schrift(g, 'S', X(d) + 9, Y(-1) + 14, F.orange, 13);
      if (Math.abs(d) > 0.15) pfeil(g, X(0), Y(-1.6), X(d), Y(-1.6), F.orange, 2.5);
    } });
}
function sinus() {
  return buehne({ titel: 'Sinus: Welle auf und ab', regler: { label: 'Amplitude a', min: 0.4, max: 2.6 }, start: 1, text: (a) => `f(x) = ${zahl(a)} · sin(x): Die Welle schlägt ${zahl(a)} nach oben und unten aus. Die Periode bleibt 2π.`,
    zeichne(g, B, H, a, t, F) {
      const X = (x) => (x / (TAU * 1.25)) * B, Y = (y) => H / 2 - y * (H / 6.2);
      achsen(g, F, X, Y, 0, 8, -3, 3);
      g.strokeStyle = F.rot; g.setLineDash([5, 5]); g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, Y(a)); g.lineTo(B, Y(a)); g.moveTo(0, Y(-a)); g.lineTo(B, Y(-a)); g.stroke(); g.setLineDash([]);
      kurve(g, (x) => a * Math.sin(x), X, Y, 0, TAU * 1.25, F.blau);
      const x = (t * 1.3) % (TAU * 1.25); g.fillStyle = F.orange; g.beginPath(); g.arc(X(x), Y(a * Math.sin(x)), 7, 0, TAU); g.fill();
      schrift(g, 'a', 6, Y(a) - 5, F.rot, 12);
    } });
}
const fE = (x) => 0.22 * x ** 3 - 1.3 * x, dE = (x) => 0.66 * x * x - 1.3;
function extrem() {
  return buehne({ titel: 'Hoch- und Tiefpunkt: Die Kugel rollt', regler: { label: 'Kugel schieben', min: -2.8, max: 2.8 }, text: (x) => (Math.abs(dE(x)) < 0.12 ? (x < 0 ? 'Hochpunkt: Die Kugel liegt oben, die Tangente ist waagerecht – f′(x) = 0.' : 'Tiefpunkt: Die Kugel liegt im Tal, die Tangente ist waagerecht – f′(x) = 0.') : `Hier ist f′(x) = ${zahl(dE(x))}: Die Kugel würde ${dE(x) > 0 ? 'nach links' : 'nach rechts'} rollen.`),
    zeichne(g, B, H, x, _t, F) {
      const X = (a) => ((a + 3.2) / 6.4) * B, Y = (b) => H / 2 - b * (H / 6.8);
      achsen(g, F, X, Y, -3.2, 3.2, -3, 3); kurve(g, fE, X, Y, -3.2, 3.2, F.blau, 4);
      const xs = Math.sqrt(1.3 / 0.66);
      for (const [xe, n] of [[-xs, 'H'], [xs, 'T']]) { g.strokeStyle = F.gelb; g.lineWidth = 2.5; g.beginPath(); g.moveTo(X(xe - 0.7), Y(fE(xe))); g.lineTo(X(xe + 0.7), Y(fE(xe))); g.stroke(); schrift(g, n, X(xe), Y(fE(xe)) + (n === 'H' ? -12 : 22), F.gelb, 14, true, true); }
      g.fillStyle = F.orange; g.beginPath(); g.arc(X(x), Y(fE(x)) - 8, 8, 0, TAU); g.fill();
    } });
}
const fW = (x) => 0.2 * x ** 3 - 0.9 * x;
function wende() {
  return buehne({ titel: 'Wendepunkt: Das Lenkrad dreht um', regler: { label: 'Auto fahren', min: -2.8, max: 2.8 }, dauer: 6500, text: (x) => (Math.abs(x) < 0.12 ? 'Wendepunkt: Das Lenkrad steht einen Moment gerade – f″(x) = 0.' : x < 0 ? 'Rechtskurve: f″(x) < 0. Das Lenkrad ist nach rechts eingeschlagen.' : 'Linkskurve: f″(x) > 0. Das Lenkrad ist nach links eingeschlagen.'),
    zeichne(g, B, H, x, _t, F) {
      const X = (a) => ((a + 3.2) / 6.4) * (B * 0.72), Y = (b) => H / 2 - b * (H / 6.4);
      kurve(g, fW, X, Y, -3.2, 3.2, F.linie, 14); kurve(g, fW, X, Y, -3.2, 3.2, F.blau, 2);
      g.fillStyle = F.gelb; g.beginPath(); g.arc(X(0), Y(0), 5, 0, TAU); g.fill(); schrift(g, 'W', X(0) + 8, Y(0) - 8, F.gelb, 13);
      const m = 0.6 * x * x - 0.9, w = Math.atan2(-m * (H / 6.4), (B * 0.72) / 6.4);
      g.save(); g.translate(X(x), Y(fW(x))); g.rotate(w); g.fillStyle = F.orange; g.fillRect(-11, -6, 22, 12); g.fillStyle = F.tinte; g.fillRect(4, -5, 5, 10); g.restore();
      const cx = B * 0.87, cy = H / 2, r = Math.min(34, B * 0.1), dreh = Math.max(-1.2, Math.min(1.2, -1.2 * x * 0.6));   // f″ = 1,2·x: Vorzeichen bestimmt den Einschlag
      g.save(); g.translate(cx, cy); g.rotate(dreh); g.strokeStyle = F.tinte; g.lineWidth = 6; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.stroke(); g.lineWidth = 5; g.beginPath(); g.moveTo(-r, 0); g.lineTo(r, 0); g.moveTo(0, 0); g.lineTo(0, r); g.stroke(); g.restore();
    } });
}
function pfade() {
  return buehne({ titel: 'Pfadregeln: Den Weg entlang malnehmen', regler: { label: 'Pfad wählen', min: 0, max: 3.99, step: 0.01 }, dauer: 8000, text: (w) => { const k = Math.floor(w), z = [['rot', 'rot', '4/6 · 3/5 = 12/30'], ['rot', 'blau', '4/6 · 2/5 = 8/30'], ['blau', 'rot', '2/6 · 4/5 = 8/30'], ['blau', 'blau', '2/6 · 1/5 = 2/30']][k]; return `${z[0]} – ${z[1]}: ${z[2]}. Alle vier Pfade zusammen ergeben 30/30 = 1.`; },
    zeichne(g, B, H, w, _t, F) {
      const k = Math.floor(w), x0 = B * 0.1, x1 = B * 0.45, x2 = B * 0.84, y = [H * 0.3, H * 0.74], yy = [H * 0.14, H * 0.42, H * 0.6, H * 0.88];
      const ast = (ax, ay, bx, by, txt, an, col) => { g.strokeStyle = an ? col : F.linie; g.lineWidth = an ? 5 : 2.5; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke(); schrift(g, txt, (ax + bx) / 2, (ay + by) / 2 - 7, an ? F.tinte : F.leise, 12, an, true); };
      const kugel = (x, yv, rot, an) => { g.globalAlpha = an ? 1 : 0.35; g.fillStyle = rot ? F.rot : F.blau; g.beginPath(); g.arc(x, yv, 9, 0, TAU); g.fill(); g.globalAlpha = 1; };
      ast(x0, H / 2, x1, y[0], '4/6', k < 2, F.orange); ast(x0, H / 2, x1, y[1], '2/6', k >= 2, F.orange);
      ast(x1, y[0], x2, yy[0], '3/5', k === 0, F.orange); ast(x1, y[0], x2, yy[1], '2/5', k === 1, F.orange); ast(x1, y[1], x2, yy[2], '4/5', k === 2, F.orange); ast(x1, y[1], x2, yy[3], '1/5', k === 3, F.orange);
      g.fillStyle = F.tinte; g.beginPath(); g.arc(x0, H / 2, 6, 0, TAU); g.fill();
      kugel(x1, y[0], true, k < 2); kugel(x1, y[1], false, k >= 2); [true, false, true, false].forEach((rot, i) => kugel(x2, yy[i], rot, k === i));
    } });
}
function glocke() {
  const nv = (z) => Math.exp(-0.5 * z * z);
  return buehne({ titel: 'Sigma-Regeln: Das Band wird breiter', regler: { label: 'Breite in σ', min: 0.3, max: 3 }, start: 1, text: (k) => { const p = [[1, '68,3'], [2, '95,4'], [3, '99,7']].find(([s]) => Math.abs(k - s) < 0.12); return p ? `Genau ${p[0]}σ: ${p[1]} % aller Werte liegen im Band.` : `Zwischen μ − ${zahl(k)}σ und μ + ${zahl(k)}σ liegen etwa ${zahl(100 * erf(k / Math.SQRT2), 0)} % der Werte.`; },
    zeichne(g, B, H, k, _t, F) {
      const X = (z) => ((z + 3.6) / 7.2) * B, Y = (v) => H - 26 - v * (H - 48);
      g.fillStyle = F.flaeche; g.beginPath(); g.moveTo(X(-k), Y(0)); for (let i = 0; i <= 60; i++) { const z = -k + (2 * k * i) / 60; g.lineTo(X(z), Y(nv(z))); } g.lineTo(X(k), Y(0)); g.closePath(); g.fill();
      kurve(g, nv, X, Y, -3.6, 3.6, F.blau);
      g.strokeStyle = F.leise; g.lineWidth = 1.3; g.beginPath(); g.moveTo(0, Y(0)); g.lineTo(B, Y(0)); g.stroke();
      for (let s = -3; s <= 3; s++) schrift(g, s === 0 ? 'μ' : `${s > 0 ? '+' : '−'}${Math.abs(s)}σ`, X(s), H - 8, Math.abs(s) <= k + 0.05 ? F.tinte : F.leise, 11, Math.abs(s) <= k + 0.05, true);
      g.strokeStyle = F.orange; g.lineWidth = 2.5; g.beginPath(); g.moveTo(X(-k), Y(0)); g.lineTo(X(-k), Y(nv(k))); g.moveTo(X(k), Y(0)); g.lineTo(X(k), Y(nv(k))); g.stroke();
    } });
}
/** Fehlerfunktion (Näherung nach Abramowitz/Stegun) – für den Anteil unter der Glockenkurve. */
function erf(x) { const t = 1 / (1 + 0.3275911 * Math.abs(x)), y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; }
function gerade() {
  return buehne({ titel: 'Gerade: Mit t die Strecke entlang', regler: { label: 'Parameter t', min: -1, max: 3 }, text: (t) => `t = ${zahl(t)}: Vom Stützpunkt P aus ${zahl(Math.abs(t))}-mal den Richtungsvektor ${t < 0 ? 'rückwärts' : 'vorwärts'} → X(${zahl(1 + 1.2 * t)} | ${zahl(1 + 0.6 * t)})`,
    zeichne(g, B, H, t, _z, F) {
      const X = (a) => 22 + ((a + 1) / 7) * (B - 40), Y = (y) => H - 18 - ((y + 0.5) / 4) * (H - 34), P = [1, 1], u = [1.2, 0.6];
      achsen(g, F, X, Y, -1, 6, -0.5, 3.5);
      g.strokeStyle = F.linie; g.lineWidth = 3; g.beginPath(); g.moveTo(X(P[0] - 2 * u[0]), Y(P[1] - 2 * u[1])); g.lineTo(X(P[0] + 4.2 * u[0]), Y(P[1] + 4.2 * u[1])); g.stroke();
      pfeil(g, X(P[0]), Y(P[1]), X(P[0] + u[0]), Y(P[1] + u[1]), F.gruen, 4);
      for (let k = -1; k <= 3; k++) { g.fillStyle = F.leise; g.beginPath(); g.arc(X(P[0] + k * u[0]), Y(P[1] + k * u[1]), 3, 0, TAU); g.fill(); }
      g.fillStyle = F.blau; g.beginPath(); g.arc(X(P[0]), Y(P[1]), 6, 0, TAU); g.fill(); schrift(g, 'P', X(P[0]) - 4, Y(P[1]) + 20, F.blau, 13);
      g.fillStyle = F.orange; g.beginPath(); g.arc(X(P[0] + t * u[0]), Y(P[1] + t * u[1]), 8, 0, TAU); g.fill(); schrift(g, 'X', X(P[0] + t * u[0]) - 4, Y(P[1] + t * u[1]) - 13, F.orange, 13);
    } });
}

function potenz() {
  return buehne({ titel: 'Potenzregel: Die Hochzahl hüpft nach vorn', regler: { label: 'Hochzahl n', min: 2, max: 6, step: 1 }, start: 3, dauer: 9000, text: (n) => `(x^${Math.round(n)})′ = ${Math.round(n)} · x^${Math.round(n) - 1}: Die ${Math.round(n)} kommt als Faktor nach vorn, oben bleibt eins weniger.`,
    zeichne(g, B, H, nn, t, F) {
      const n = Math.round(nn), p = Math.min(1, ((t % 3.2) / 3.2) * 1.6), e = p * p * (3 - 2 * p), cx = B / 2, cy = H / 2 + 14;
      schrift(g, 'x', cx - 70, cy, F.leise, 54); schrift(g, String(n), cx - 38, cy - 34, F.leise, 26);
      schrift(g, '→', cx - 10, cy - 6, F.leise, 26);
      schrift(g, 'x', cx + 62, cy, F.blau, 54); schrift(g, String(n - 1), cx + 94, cy - 34, F.blau, 26);
      // die Hochzahl fliegt in einem Bogen von oben rechts nach vorn
      const x0 = cx - 38, y0 = cy - 34, x1 = cx + 30, y1 = cy, x = x0 + (x1 - x0) * e, y = y0 + (y1 - y0) * e - Math.sin(Math.PI * e) * 46;
      schrift(g, String(n), x, y, F.orange, 26 + 22 * e); if (e > 0.95) schrift(g, '·', cx + 52, cy - 4, F.orange, 30);
    } });
}
function efunk() {
  return buehne({ titel: 'e-Funktion: so hoch wie steil', regler: { label: 'Stelle x', min: -1.6, max: 1.5 }, text: (x) => `Bei x = ${zahl(x)}: Höhe e^x = ${zahl(Math.exp(x), 2)} – und die Steigung ist genau dieselbe Zahl: ${zahl(Math.exp(x), 2)}.`,
    zeichne(g, B, H, x, _t, F) {
      const X = (a) => ((a + 2.2) / 4.4) * B, Y = (b) => H - 20 - b * ((H - 34) / 5);
      achsen(g, F, X, Y, -2.2, 2.2, 0, 5); kurve(g, Math.exp, X, Y, -2.2, 1.65, F.blau);
      const y = Math.exp(x);
      g.strokeStyle = F.gruen; g.lineWidth = 5; g.beginPath(); g.moveTo(X(x), Y(0)); g.lineTo(X(x), Y(y)); g.stroke();
      g.strokeStyle = F.orange; g.lineWidth = 3; g.beginPath(); g.moveTo(X(x - 0.8), Y(y - 0.8 * y)); g.lineTo(X(x + 0.6), Y(y + 0.6 * y)); g.stroke();
      g.fillStyle = F.orange; g.beginPath(); g.arc(X(x), Y(y), 6, 0, TAU); g.fill();
      schrift(g, `Höhe ${zahl(y, 2)}`, 10, 18, F.gruen, 13); schrift(g, `Steigung ${zahl(y, 2)}`, 10, 36, F.orange, 13);
    } });
}
function zwischen() {
  const f = (x) => -0.5 * x * x + 2.5, gg = (x) => 0.5 * x * x - 0.5;   // schneiden sich bei ±√3
  return buehne({ titel: 'Fläche zwischen zwei Graphen', regler: { label: 'bis x =', min: -1.73, max: 1.73 }, text: (b) => { const A = (t) => 3 * t - t ** 3 / 3, w = A(b) - A(-Math.sqrt(3)); return `Oben minus unten: f(x) − g(x) = 3 − x². Fläche bis hier: ${zahl(w, 2)} von ${zahl(2 * A(Math.sqrt(3)), 2)}.`; },
    zeichne(g, B, H, b, _t, F) {
      const X = (a) => ((a + 2.6) / 5.2) * B, Y = (y) => H / 2 + 26 - y * (H / 5.4), s = Math.sqrt(3);
      achsen(g, F, X, Y, -2.6, 2.6, -1, 3);
      g.fillStyle = F.flaeche; g.beginPath(); for (let i = 0; i <= 50; i++) { const x = -s + ((b + s) * i) / 50; g.lineTo(X(x), Y(f(x))); } for (let i = 50; i >= 0; i--) { const x = -s + ((b + s) * i) / 50; g.lineTo(X(x), Y(gg(x))); } g.closePath(); g.fill();
      kurve(g, f, X, Y, -2.6, 2.6, F.blau); kurve(g, gg, X, Y, -2.6, 2.6, F.gruen);
      g.strokeStyle = F.orange; g.lineWidth = 3; g.beginPath(); g.moveTo(X(b), Y(gg(b))); g.lineTo(X(b), Y(f(b))); g.stroke();
      schrift(g, 'f (oben)', X(-0.3), Y(2.6) - 6, F.blau, 12); schrift(g, 'g (unten)', X(-0.35), Y(-0.5) + 16, F.gruen, 12);
    } });
}
function betrag() {
  return buehne({ titel: 'Länge eines Vektors: Pythagoras', regler: { label: 'Vektor drehen', min: 0.25, max: 1.3 }, text: (w) => { const a = 5 * Math.cos(w), b = 5 * Math.sin(w); return `v = (${zahl(a)} | ${zahl(b)}): |v| = √(${zahl(a)}² + ${zahl(b)}²) = √${zahl(a * a + b * b, 0)} = 5 – die Länge bleibt gleich.`; },
    zeichne(g, B, H, w, _t, F) {
      const e = Math.min((B - 60) / 5.4, (H - 40) / 5.2), x0 = 34, y0 = H - 24, a = 5 * Math.cos(w) * e, b = 5 * Math.sin(w) * e;
      g.strokeStyle = F.gitter; g.lineWidth = 1; g.beginPath(); g.arc(x0, y0, 5 * e, -Math.PI / 2, 0); g.stroke();
      g.strokeStyle = F.leise; g.lineWidth = 1.3; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + 5.3 * e, y0); g.moveTo(x0, y0); g.lineTo(x0, y0 - 5.2 * e); g.stroke();
      g.strokeStyle = F.gruen; g.lineWidth = 4; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + a, y0); g.stroke();
      g.strokeStyle = F.blau; g.beginPath(); g.moveTo(x0 + a, y0); g.lineTo(x0 + a, y0 - b); g.stroke();
      pfeil(g, x0, y0, x0 + a, y0 - b, F.orange, 5);
      schrift(g, zahl(a / e), x0 + a / 2, y0 + 16, F.gruen, 13, true, true); schrift(g, zahl(b / e), x0 + a + 8, y0 - b / 2 + 4, F.blau, 13); schrift(g, '|v| = 5', x0 + a / 2 - 62, y0 - b / 2 - 10, F.orange, 13);
    } });
}
function gegen() {
  return buehne({ titel: 'Gegenereignis: Der Rest bis 1', regler: { label: 'P(E)', min: 0.05, max: 0.95 }, start: 0.3, hoehe: 120, text: (p) => `P(E) = ${zahl(p, 2)}, also P(nicht E) = 1 − ${zahl(p, 2)} = ${zahl(1 - p, 2)}. Zusammen immer 1.`,
    zeichne(g, B, H, p, _t, F) {
      const x0 = 14, w = B - 28, y = 30, hh = 44;
      g.fillStyle = F.blau; g.fillRect(x0, y, w * p, hh); g.fillStyle = F.orange; g.fillRect(x0 + w * p, y, w * (1 - p), hh);
      schrift(g, 'E', x0 + (w * p) / 2, y + 28, '#fff', 16, true, true); schrift(g, 'nicht E', x0 + w * p + (w * (1 - p)) / 2, y + 28, '#fff', 14, true, true);
      schrift(g, '0', x0, y + hh + 16, F.leise, 12); schrift(g, '1', x0 + w - 6, y + hh + 16, F.leise, 12);
    } });
}
function logist() {
  const S = 100, f = (t) => S / (1 + 19 * Math.exp(-0.7 * t));
  return buehne({ titel: 'Logistisches Wachstum: Ein Gerücht macht die Runde', regler: { label: 'Zeit t', min: 0, max: 10 }, dauer: 7500, hoehe: 200, text: (t) => { const y = f(t); return `${zahl(y, 0)} von 100 wissen es. ${y < 30 ? 'Noch langsam – es erzählen erst wenige weiter.' : y < 70 ? 'Jetzt geht es am schnellsten – genau bei der Hälfte.' : 'Es wird langsamer – fast alle wissen es schon.'}`; },
    zeichne(g, B, H, t, _z, F) {
      const X = (a) => 18 + (a / 10) * (B * 0.56 - 18), Y = (y) => H - 18 - (y / 110) * (H - 30), n = Math.round(f(t));
      g.strokeStyle = F.rot; g.setLineDash([6, 5]); g.lineWidth = 2; g.beginPath(); g.moveTo(X(0), Y(S)); g.lineTo(X(10), Y(S)); g.stroke(); g.setLineDash([]);
      g.strokeStyle = F.gelb; g.setLineDash([3, 4]); g.beginPath(); g.moveTo(X(0), Y(S / 2)); g.lineTo(X(10), Y(S / 2)); g.stroke(); g.setLineDash([]); schrift(g, 'S/2', X(0) + 3, Y(S / 2) - 4, F.gelb, 10);
      kurve(g, f, X, Y, 0, 10, F.blau); g.fillStyle = F.orange; g.beginPath(); g.arc(X(t), Y(f(t)), 6, 0, TAU); g.fill();
      const gx = B * 0.62, a = (B * 0.36) / 10;   // 100 Köpfe
      for (let i = 0; i < 100; i++) { g.fillStyle = i < n ? F.orange : F.linie; g.beginPath(); g.arc(gx + (i % 10) * a + a / 2, 16 + Math.floor(i / 10) * a + a / 2, a * 0.36, 0, TAU); g.fill(); }
    } });
}
function symm() {
  return buehne({ titel: 'Symmetrie: Spiegel oder halbe Drehung', regler: { label: 'Punkt x', min: 0.3, max: 2.4 }, text: (x) => `Links (gerade Hochzahlen): f(−x) = f(x) – gleiche Höhe. Rechts (ungerade): f(−x) = −f(x) – gegenüber durch den Ursprung.`,
    zeichne(g, B, H, x, _t, F) {
      const halb = B / 2, f1 = (a) => 0.5 * a * a - 1, f2 = (a) => 0.25 * a ** 3 - 0.6 * a;
      [[0, f1, true], [halb, f2, false]].forEach(([dx, f, achse]) => {
        const X = (a) => dx + ((a + 2.7) / 5.4) * halb, Y = (b) => H / 2 - b * (H / 5.6);
        g.save(); g.beginPath(); g.rect(dx, 0, halb, H); g.clip();
        g.strokeStyle = F.leise; g.lineWidth = 1.2; g.beginPath(); g.moveTo(X(-2.7), Y(0)); g.lineTo(X(2.7), Y(0)); g.moveTo(X(0), 0); g.lineTo(X(0), H); g.stroke();
        kurve(g, f, X, Y, -2.7, 2.7, F.blau);
        g.strokeStyle = F.orange; g.setLineDash([4, 4]); g.lineWidth = 2; g.beginPath(); g.moveTo(X(x), Y(f(x))); g.lineTo(X(-x), Y(f(-x))); g.stroke(); g.setLineDash([]);
        for (const s of [x, -x]) { g.fillStyle = F.orange; g.beginPath(); g.arc(X(s), Y(f(s)), 6, 0, TAU); g.fill(); }
        schrift(g, achse ? 'Achse' : 'Punkt', dx + 8, 16, F.leise, 12); g.restore();
      });
      g.strokeStyle = F.linie; g.lineWidth = 1; g.beginPath(); g.moveTo(halb, 6); g.lineTo(halb, H - 6); g.stroke();
    } });
}
function doppel() {
  return buehne({ titel: 'Exponentiell: immer das Doppelte', regler: { label: 'Zeit in Verdopplungen', min: 0, max: 6 }, dauer: 8000, hoehe: 200, text: (t) => `Nach ${zahl(t)} Verdopplungszeiten: ${zahl(2 ** t, t < 3 ? 1 : 0)}-mal so viel. Jede Verdopplung dauert gleich lang – egal, wie viel schon da ist.`,
    zeichne(g, B, H, t, _z, F) {
      const n = Math.min(64, Math.floor(2 ** t)), spalten = 16, a = (B - 20) / spalten, voll = 2 ** t;
      for (let i = 0; i < 64; i++) { g.fillStyle = i < n ? F.gruen : F.linie; g.beginPath(); g.arc(10 + (i % spalten) * a + a / 2, 14 + Math.floor(i / spalten) * a + a / 2, a * 0.36, 0, TAU); g.fill(); }
      const X = (x) => 16 + (x / 6) * (B - 32), Y = (y) => H - 14 - (y / 64) * (H - 14 - (4 * a + 26));
      kurve(g, (x) => 2 ** x, X, Y, 0, 6, F.blau); g.fillStyle = F.orange; g.beginPath(); g.arc(X(t), Y(voll), 6, 0, TAU); g.fill();
      for (let k = 0; k <= 6; k++) { g.fillStyle = F.leise; g.fillRect(X(k), H - 14, 1.5, 5); }
    } });
}
function rotation() {
  const f = (x) => 0.5 + 0.35 * x;
  return buehne({ titel: 'Rotationskörper: Die Kurve dreht sich', regler: { label: 'Drehung', min: 0, max: 1 }, dauer: 6000, text: (w) => (w < 0.98 ? 'Der Graph dreht sich um die x-Achse. Jeder Punkt beschreibt einen Kreis mit Radius f(x).' : 'Fertig: lauter Kreisscheiben mit Fläche π · f(x)². Aufsummiert: V = π · ∫ f(x)² dx.'),
    zeichne(g, B, H, w, _t, F) {
      const X = (x) => 30 + (x / 3) * (B - 60), cy = H / 2, e = (H / 2 - 16) / 1.6;
      g.strokeStyle = F.leise; g.lineWidth = 1.3; g.beginPath(); g.moveTo(10, cy); g.lineTo(B - 10, cy); g.stroke();
      for (let i = 0; i <= 12; i++) { const x = (3 * i) / 12, r = f(x) * e;
        g.strokeStyle = i % 4 === 0 ? F.blau : F.flaeche; g.lineWidth = i % 4 === 0 ? 2 : 1.4; g.beginPath(); g.ellipse(X(x), cy, r * 0.22, r, 0, -Math.PI / 2, -Math.PI / 2 + w * TAU); g.stroke(); }
      g.strokeStyle = F.blau; g.lineWidth = 3.5; g.beginPath(); g.moveTo(X(0), cy - f(0) * e); g.lineTo(X(3), cy - f(3) * e); g.stroke();
      if (w > 0.5) { g.globalAlpha = Math.min(1, (w - 0.5) * 2); g.beginPath(); g.moveTo(X(0), cy + f(0) * e); g.lineTo(X(3), cy + f(3) * e); g.stroke(); g.globalAlpha = 1; }
      const a = -Math.PI / 2 + w * TAU, xm = 1.5, r = f(xm) * e; g.fillStyle = F.orange; g.beginPath(); g.arc(X(xm) + Math.cos(a) * r * 0.22, cy + Math.sin(a) * r, 6, 0, TAU); g.fill();
    } });
}

/** Zu welcher Formel (Name aus units.js) gibt es ein Merkbild? */
export const MERK = {
  Ableitung: tangente, 'Waagerechte Tangente': tangente, 'Vorzeichen der Ableitung': tangente, Kettenregel: kette, Produktregel: produkt, Hauptsatz: flaeche,
  'Bernoulli-Formel': galton, Erwartungswert: galton, 'Bedingte Wahrscheinlichkeit': bedingt, Skalarprodukt: skalar, Senkrecht: skalar, Verbindungsvektor: verbindung,
  'Begrenztes Wachstum': begrenzt, Pythagoras: pythagoras,
  Scheitelform: scheitel, Sinusfunktion: sinus, Extrempunkt: extrem, Wendepunkt: wende, Pfadregeln: pfade, 'Sigma-Regeln': glocke, Gerade: gerade,
  Potenzregel: potenz, 'e-Funktion': efunk, 'Fläche zwischen Graphen': zwischen, Betrag: betrag, Gegenereignis: gegen, 'Logistisches Wachstum': logist, 'Stärkstes Wachstum (logistisch)': logist,
  Symmetrie: symm, Wachstum: doppel, Verdopplungszeit: doppel, Rotationsvolumen: rotation, Tangente: tangente,
};
/** Stichwörter in Karten-Überschriften → Merkbild (für die Erklär-Karten der Einheiten). */
const STICHWORT = [[/Kettenregel/i, 'Kettenregel'], [/Produktregel/i, 'Produktregel'], [/Tangente|Steigung an einer Stelle|Ableitung ist/i, 'Ableitung'], [/Hauptsatz|Fläche unter|Integral als/i, 'Hauptsatz'],
  [/Bernoulli|Binomial|Nagelbrett/i, 'Bernoulli-Formel'], [/Bedingte/i, 'Bedingte Wahrscheinlichkeit'], [/Skalarprodukt|Senkrecht/i, 'Skalarprodukt'], [/Verbindungsvektor|Spitze minus/i, 'Verbindungsvektor'],
  [/Begrenztes Wachstum/i, 'Begrenztes Wachstum'], [/Pythagoras/i, 'Pythagoras'], [/Scheitel/i, 'Scheitelform'], [/Sinus/i, 'Sinusfunktion'], [/Hoch- und Tief|Extrempunkt|Extremstelle/i, 'Extrempunkt'],
  [/Wendepunkt|Wendestelle|Krümmung/i, 'Wendepunkt'], [/Pfadregel|Baumdiagramm/i, 'Pfadregeln'], [/Sigma/i, 'Sigma-Regeln'], [/Parameterform der Geraden|Gerade im Raum|Stützvektor/i, 'Gerade'],
  [/Potenz- und Summenregel|Potenzregel/i, 'Potenzregel'], [/e-Funktion/i, 'e-Funktion'], [/Logistisch/i, 'Logistisches Wachstum'], [/Symmetrie/i, 'Symmetrie'], [/Rotationsvolumen|Rotationskörper/i, 'Rotationsvolumen'], [/Gegenereignis/i, 'Gegenereignis'], [/zwischen (zwei )?Graphen/i, 'Fläche zwischen Graphen']];
export const merkZuTitel = (titel) => { const t = String(titel || ''); return hatMerkbild(t) ? t : (STICHWORT.find(([re]) => re.test(t)) || [])[1] || ''; };
export const hatMerkbild = (name) => Object.prototype.hasOwnProperty.call(MERK, name);
/** Baut das Merkbild zu einem Formel-Namen – oder null, wenn es (noch) keines gibt. */
export const merkbild = (name) => (hatMerkbild(name) ? MERK[name]() : null);
/** Hängt in einem Stück Seite an jede Stelle mit data-merk="Name" das passende Bild an. */
export function merkbilderEinsetzen(wurzel) {
  wurzel.querySelectorAll('[data-merk]').forEach((n) => { if (n.querySelector('.merk')) return; const b = merkbild(n.dataset.merk); if (b) n.append(b); });
}
