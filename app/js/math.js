// Rechen- und Formel-Helfer. Polynome als Koeffizienten-Liste: c[i] gehört zu x^i.

let rng = Math.random;
/** Zufallszahl in [0,1). Mit seedRandom(zahl) wird die Folge festgelegt (gleiche Aufgaben für alle), mit seedRandom(null) wieder frei. */
export const rand = () => rng();
export function seedRandom(seed) {
  if (seed === null || seed === undefined) { rng = Math.random; return; }
  let a = (seed >>> 0) || 1;
  rng = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let x = Math.imul(a ^ (a >>> 15), 1 | a); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
}
export const ri = (a, b) => a + Math.floor(rand() * (b - a + 1));
export const pick = (arr) => arr[Math.floor(rand() * arr.length)];
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

/** Zahl mit deutschem Komma, ohne überflüssige Nullen. */
export function fmt(n, digits = 2) {
  const v = +(+n).toFixed(digits);
  return String(Object.is(v, -0) ? 0 : v).replace('.', ',');
}
/** Zahl für LaTeX (Komma ohne Abstand). */
export const ft = (n, digits = 2) => fmt(n, digits).replace(',', '{,}');

export const polyEval = (c, x) => c.reduceRight((acc, a) => acc * x + a, 0);
export const polyDeriv = (c) => (c.length <= 1 ? [0] : c.slice(1).map((a, i) => a * (i + 1)));

export function polyTex(c, v = 'x') {
  let out = '';
  for (let i = c.length - 1; i >= 0; i--) {
    const a = c[i];
    if (!a) continue;
    const abs = Math.abs(a);
    const sign = a < 0 ? '-' : out ? '+' : '';
    const coef = i > 0 && abs === 1 ? '' : ft(abs);
    const xp = i === 0 ? '' : i === 1 ? v : `${v}^{${i}}`;
    out += `${sign}${coef}${xp}`;
  }
  return out || '0';
}

/** Scheitelform a(x-d)^2+e als LaTeX. */
export function vertexTex(a, d, e) {
  const A = a === 1 ? '' : a === -1 ? '-' : ft(a);
  const core = d === 0 ? 'x^2' : `(x${d > 0 ? '-' : '+'}${ft(Math.abs(d))})^2`;
  const E = e === 0 ? '' : `${e > 0 ? '+' : '-'}${ft(Math.abs(e))}`;
  return `${A}${core}${E}`;
}

/** Gerade m·x+b als LaTeX. */
export function lineTex(m, b) {
  const M = m === 0 ? '' : m === 1 ? 'x' : m === -1 ? '-x' : `${ft(m)}x`;
  if (!M) return ft(b);
  return `${M}${b === 0 ? '' : `${b > 0 ? '+' : '-'}${ft(Math.abs(b))}`}`;
}

/** Numerische Ableitung (zentraler Differenzenquotient). */
export const nDeriv = (f, x, hh = 1e-4) => (f(x + hh) - f(x - hh)) / (2 * hh);
