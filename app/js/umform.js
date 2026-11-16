// Formel-Dungeon – Rechenkern: Gleichungen und Formeln Schritt für Schritt umstellen.
// Eine Gleichung ist ein Paar aus zwei Termen (Bäumen). Die gesuchte Größe steht genau einmal darin; jeder Schritt macht
// die äußerste Rechnung um sie herum auf beiden Seiten rückgängig („von außen nach innen“). Zu jedem richtigen Schritt
// gibt es typische Fehler als Ablenker – jeder wird gegen echte Zahlen geprüft, damit er sicher falsch ist.
import { ri, pick, shuffle, rand } from './math.js';

// ---------------------------------------------------------------- Bruchzahlen
const ggT = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
const Q = (p, q = 1) => { if (q < 0) { p = -p; q = -q; } const g = ggT(p, q); return { p: p / g, q: q / g }; };
const sicher = (r) => Math.abs(r.p) < 1e9 && Math.abs(r.q) < 1e9;

// ---------------------------------------------------------------- Bausteine
/** Zahl (als Bruch p/q). d: Schreibweise 'dez' (Dezimalzahl) oder 'bruch'. */
export const N = (p, q = 1, d = '') => ({ t: 'n', ...Q(p, q), d });
const KONST = { '\\pi': Math.PI, e: Math.E };
/** Buchstabe (Größe) – mit TeX-Namen. \\pi und e sind Konstanten. */
export const S = (n) => ({ t: 's', n });
const flach = (t, xs) => xs.flatMap((x) => (x.t === t ? x.a : [x]));
export const add = (...a) => ({ t: 'add', a: flach('add', a) });
export const mul = (...a) => ({ t: 'mul', a: flach('mul', a) });
export const div = (a, b) => ({ t: 'div', a: [a, b] });
export const pow = (a, e) => ({ t: 'pow', a: [a, e] });
export const wurzel = (a, k = N(2)) => ({ t: 'wurzel', a: [a, k] });
export const log = (b, a) => ({ t: 'log', a: [b, a] });
export const neg = (a) => ({ t: 'neg', a: [a] });
const ist = (e, t) => e && e.t === t;
const istZahl = (e, v) => ist(e, 'n') && (v === undefined || e.p === v * e.q);
const istE = (e) => ist(e, 's') && e.n === 'e';

export const enthaelt = (e, x) => (ist(e, 's') ? e.n === x : (e.a || []).some((k) => enthaelt(k, x)));
export const zaehle = (e, x) => (ist(e, 's') ? +(e.n === x) : (e.a || []).reduce((s, k) => s + zaehle(k, x), 0));
export const ersetze = (e, x, w) => (ist(e, 's') ? (e.n === x ? w : e) : e.a ? { ...e, a: e.a.map((k) => ersetze(k, x, w)) } : e);
/** Alle Buchstaben (ohne Konstanten). */
export const groessen = (e, m = new Set()) => { if (ist(e, 's') && !(e.n in KONST)) m.add(e.n); (e.a || []).forEach((k) => groessen(k, m)); return m; };

// ---------------------------------------------------------------- Ausrechnen
export function wert(e, env = {}) {
  switch (e.t) {
    case 'n': return e.p / e.q;
    case 's': return e.n in env ? env[e.n] : e.n in KONST ? KONST[e.n] : NaN;
    case 'add': return e.a.reduce((s, k) => s + wert(k, env), 0);
    case 'mul': return e.a.reduce((s, k) => s * wert(k, env), 1);
    case 'div': return wert(e.a[0], env) / wert(e.a[1], env);
    case 'neg': return -wert(e.a[0], env);
    case 'pow': { const b = wert(e.a[0], env), x = wert(e.a[1], env); return b < 0 && !Number.isInteger(x) ? NaN : b ** x; }
    case 'wurzel': { const r = wert(e.a[0], env), k = wert(e.a[1], env); return r < 0 ? (k % 2 === 1 ? -((-r) ** (1 / k)) : NaN) : r ** (1 / k); }
    case 'log': { const b = wert(e.a[0], env), a = wert(e.a[1], env); return Math.log(a) / Math.log(b); }
    default: return NaN;
  }
}
/** Gilt die Gleichung l = r für diese Belegung? */
export function gilt(l, r, env) {
  const a = wert(l, env), b = wert(r, env);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  return Math.abs(a - b) <= 1e-7 * Math.max(1, Math.abs(a), Math.abs(b));
}

// ---------------------------------------------------------------- Vereinfachen (nur für die Seite ohne die gesuchte Größe)
const zahlQ = (e) => ({ p: e.p, q: e.q });
const ganzeWurzel = (n, k) => { if (n < 0) return null; const r = Math.round(n ** (1 / k)); return r ** k === n ? r : null; };
const schluessel = (e) => JSON.stringify(e, (k, v) => (k === 'd' ? undefined : v));
const negTerm = (e) => (ist(e, 'n') ? e.p < 0 : ist(e, 'neg') ? true : ist(e, 'mul') && ist(e.a[0], 'n') && e.a[0].p < 0);
const betrag = (e) => (ist(e, 'n') ? { ...e, p: Math.abs(e.p) } : ist(e, 'neg') ? e.a[0] : ist(e, 'mul') && ist(e.a[0], 'n') ? (e.a[0].p === -e.a[0].q && e.a.length === 2 ? e.a[1] : e.a[0].p === -e.a[0].q ? mul(...e.a.slice(1)) : mul({ ...e.a[0], p: -e.a[0].p }, ...e.a.slice(1))) : e);

export function simp(e) {
  if (ist(e, 'n') || ist(e, 's')) return e;
  const a = e.a.map(simp);
  switch (e.t) {
    case 'neg': {
      const x = a[0];
      if (ist(x, 'n')) return { ...x, p: -x.p };
      if (ist(x, 'neg')) return x.a[0];
      if (ist(x, 'add')) return simp(add(...x.a.map(neg)));
      if (ist(x, 'mul')) return simp(mul(N(-1), ...x.a));
      if (ist(x, 'div') && ist(x.a[0], 'n')) return simp(div(neg(x.a[0]), x.a[1]));
      return neg(x);
    }
    case 'add': {
      let z = Q(0), d = '';
      const rest = [];
      for (const k of flach('add', a)) if (ist(k, 'n')) { const n = Q(z.p * k.q + k.p * z.q, z.q * k.q); if (!sicher(n)) rest.push(k); else { z = n; d = d || k.d; } } else rest.push(k);
      // gleiche Terme zusammenfassen (z. B. a − a)
      const gruppe = new Map();
      for (const k of rest) {
        const [c, kern] = ist(k, 'mul') && ist(k.a[0], 'n') ? [zahlQ(k.a[0]), k.a.length === 2 ? k.a[1] : mul(...k.a.slice(1))] : ist(k, 'neg') ? [Q(-1), k.a[0]] : [Q(1), k];
        const s = schluessel(kern), g = gruppe.get(s);
        if (g) g.c = Q(g.c.p * c.q + c.p * g.c.q, g.c.q * c.q); else gruppe.set(s, { c, kern });
      }
      const out = [];
      for (const { c, kern } of gruppe.values()) if (c.p !== 0) out.push(c.p === c.q ? kern : simp(mul(N(c.p, c.q), kern)));
      if (z.p !== 0) out.push(N(z.p, z.q, d));
      return out.length === 0 ? N(0) : out.length === 1 ? out[0] : add(...out);
    }
    case 'mul': {
      let z = Q(1), d = '';
      const rest = [];
      for (const k of flach('mul', a)) {
        if (ist(k, 'n')) { const n = Q(z.p * k.p, z.q * k.q); if (sicher(n)) { z = n; d = d || (k.q === 1 ? '' : k.d); continue; } }
        if (ist(k, 'neg')) { z = Q(-z.p, z.q); rest.push(k.a[0]); continue; }
        rest.push(k);
      }
      if (z.p === 0) return N(0);
      const bi = rest.findIndex((k) => ist(k, 'div'));
      if (bi >= 0) { const b = rest[bi]; const o = rest.filter((_, i) => i !== bi); return simp(div(mul(N(z.p, z.q, d), ...o, b.a[0]), b.a[1])); }
      if (!rest.length) return N(z.p, z.q, d);
      if (z.q !== 1 && d !== 'dez') { const zae = z.p === 1 ? rest : [N(z.p), ...rest]; return simp(div(zae.length === 1 ? zae[0] : mul(...zae), N(z.q))); }
      if (z.p === z.q) return rest.length === 1 ? rest[0] : mul(...rest);
      return mul(N(z.p, z.q, d), ...rest);
    }
    case 'div': {
      let [x, y] = a;
      if (istZahl(y, 0)) return div(x, y);
      if (ist(x, 'div')) return simp(div(x.a[0], mul(x.a[1], y)));
      if (ist(y, 'div')) return simp(div(mul(x, y.a[1]), y.a[0]));
      if (ist(x, 'n') && ist(y, 'n')) return N(x.p * y.q, x.q * y.p, x.d || y.d);
      if (istZahl(x, 0)) return N(0);
      if (ist(y, 'n')) {
        if (y.p === y.q) return x;
        if (y.p === -y.q) return simp(neg(x));
        if (y.q !== 1 && y.d === 'dez') return div(x, y);
        if (y.q !== 1) return simp(mul(N(y.q, y.p), x));
        if (y.p < 0) return simp(neg(div(x, N(-y.p))));
        if (ist(x, 'mul') && ist(x.a[0], 'n') && x.a[0].q === 1 && x.a[0].p % y.p === 0) return simp(mul(N(x.a[0].p / y.p), ...x.a.slice(1)));
        if (ist(x, 'n')) return N(x.p, x.q * y.p);
      }
      // gemeinsame Zahl im Zähler und Nenner kürzen
      const cx = ist(x, 'mul') && ist(x.a[0], 'n') && x.a[0].q === 1 ? x.a[0].p : ist(x, 'n') && x.q === 1 ? x.p : 1;
      const cy = ist(y, 'mul') && ist(y.a[0], 'n') && y.a[0].q === 1 ? y.a[0].p : 1;
      const g = ggT(cx, cy);
      if (g > 1 && cy !== 1) { const teil = (e2, c) => (ist(e2, 'n') ? N(e2.p / c) : simp(mul(N(e2.a[0].p / c), ...e2.a.slice(1)))); x = teil(x, g); y = teil(y, g); return simp(div(x, y)); }
      if (schluessel(x) === schluessel(y)) return N(1);
      if (negTerm(y) && ist(y, 'mul')) return simp(neg(div(x, betrag(y))));
      return div(x, y);
    }
    case 'pow': {
      const [b, k] = a;
      if (istZahl(k, 1)) return b;
      if (istZahl(k, 0)) return N(1);
      if (ist(b, 'n') && ist(k, 'n') && k.q === 1 && k.p > 0 && k.p <= 12) { const p = b.p ** k.p, q = b.q ** k.p; if (Math.abs(p) < 1e9 && q < 1e9) return N(p, q); }
      if (ist(b, 'wurzel') && schluessel(b.a[1]) === schluessel(k)) return b.a[0];
      return pow(b, k);
    }
    case 'wurzel': {
      const [r, k] = a;
      if (ist(r, 'n') && ist(k, 'n') && k.q === 1 && r.p >= 0) { const p = ganzeWurzel(r.p, k.p), q = ganzeWurzel(r.q, k.p); if (p !== null && q !== null) return N(p, q); }
      if (ist(r, 'pow') && schluessel(r.a[1]) === schluessel(k)) return r.a[0];
      return wurzel(r, k);
    }
    case 'log': {
      const [b, x] = a;
      if (ist(x, 'pow') && schluessel(x.a[0]) === schluessel(b)) return x.a[1];
      if (ist(b, 'n') && ist(x, 'n') && b.q === 1 && x.q === 1 && b.p > 1 && x.p > 0) { let v = 1, n = 0; while (v < x.p && n < 40) { v *= b.p; n++; } if (v === x.p) return N(n); }
      if (ist(b, 'n') && ist(x, 'n') && b.q === 1 && x.p === 1 && x.q > 1 && b.p > 1) { let v = 1, n = 0; while (v < x.q && n < 40) { v *= b.p; n++; } if (v === x.q) return N(-n); }
      if (istZahl(x, 1)) return N(0);
      return log(b, x);
    }
    default: return { ...e, a };
  }
}

// ---------------------------------------------------------------- TeX
const dez = (v) => String(Math.round(v * 1e6) / 1e6).replace('.', '{,}');
function zahlTex(e) {
  const v = e.p / e.q, s = v < 0 ? '-' : '';
  if (e.q === 1) return String(e.p);
  if (e.d === 'dez' && 1000 % e.q === 0) return dez(v);
  return `${s}\\frac{${Math.abs(e.p)}}{${e.q}}`;
}
const klammer = (s) => `\\left(${s}\\right)`;
const buchstabig = (e) => ist(e, 's') && e.n !== 'e' || ist(e, 'pow') && ist(e.a[0], 's') || ist(e, 'wurzel') || ist(e, 'add') || ist(e, 'log');
/** TeX eines Terms. ctx: 0 frei, 1 Summand, 2 Faktor, 3 Basis einer Potenz. */
export function tx(e, ctx = 0) {
  switch (e.t) {
    case 'n': { const s = zahlTex(e); return (e.p < 0 && ctx >= 2) || (e.q !== 1 && ctx >= 3) ? klammer(s) : s; }
    case 's': return e.n;
    case 'add': {
      const ts = [...e.a];
      if (negTerm(ts[0])) { const i = ts.findIndex((t) => !negTerm(t)); if (i > 0) ts.unshift(ts.splice(i, 1)[0]); }
      let s = tx(ts[0], 1);
      for (const t of ts.slice(1)) s += negTerm(t) ? ` - ${tx(betrag(t), 1)}` : ` + ${tx(t, 1)}`;
      return ctx >= 2 ? klammer(s) : s;
    }
    case 'neg': { const s = `-${tx(e.a[0], 2)}`; return ctx >= 2 ? klammer(s) : s; }
    case 'mul': {
      let fs = e.a, c = null;
      if (ist(fs[0], 'n') && fs.length > 1) { c = fs[0]; fs = fs.slice(1); }
      const zahlVorn = c && c.p !== c.q && c.p !== -c.q;
      let s = c ? (c.p === c.q ? '' : c.p === -c.q ? '-' : zahlTex(c)) : '';
      fs.forEach((f, j) => {
        const vor = j ? fs[j - 1] : null, gut = buchstabig(f) || (ist(f, 's') && f.n === 'e');
        const sep = j === 0 ? (zahlVorn ? (gut ? ' ' : ' \\cdot ') : '') : gut && (buchstabig(vor) || ist(vor, 's') || ist(vor, 'n')) ? ' ' : ' \\cdot ';
        s += sep + tx(f, 2);
      });
      return (ctx >= 2 && s.startsWith('-')) || ctx >= 3 ? klammer(s) : s;
    }
    case 'div': { const s = `\\frac{${tx(e.a[0])}}{${tx(e.a[1])}}`; return ctx >= 3 ? klammer(s) : s; }
    case 'pow': { const b = e.a[0]; const bs = ist(b, 's') || (ist(b, 'n') && b.p > 0 && b.q === 1) ? tx(b) : klammer(tx(b)); return `${bs}^{${tx(e.a[1])}}`; }
    case 'wurzel': return istZahl(e.a[1], 2) ? `\\sqrt{${tx(e.a[0])}}` : `\\sqrt[${tx(e.a[1])}]{${tx(e.a[0])}}`;
    case 'log': { const [b, x] = e.a, arg = ist(x, 's') ? ` ${tx(x)}` : klammer(tx(x)); return istE(b) ? `\\ln${arg}` : istZahl(b, 10) ? `\\lg${arg}` : `\\log_{${tx(b)}}${arg}`; }
    default: return '?';
  }
}
export const gleichungTex = (l, r) => `${tx(l)} = ${tx(r)}`;

// ---------------------------------------------------------------- Schritte
// Jeder Schritt: label (TeX, was auf beiden Seiten gerechnet wird), rest (die Seite mit der gesuchten Größe danach),
// auf(o) (was mit der anderen Seite passiert), tipp (Merksatz), falsch (typische Fehler).
const minusLabel = (c) => (negTerm(c) ? `+${tx(betrag(c), 1)}` : `-${tx(c, 2)}`);
const plusLabel = (c) => (negTerm(c) ? `-${tx(betrag(c), 2)}` : `+${tx(c, 1)}`);
const geteiltLabel = (c) => (ist(c, 'n') && c.q !== 1 && c.d !== 'dez' ? `\\cdot ${tx(N(c.q, c.p), 2)}` : `:${tx(c, 2)}`);
const malLabel = (c) => `\\cdot ${tx(c, 2)}`;
const wurzelLabel = (k) => (istZahl(k, 2) ? '\\sqrt{\\;\\;}' : `\\sqrt[${tx(k)}]{\\;\\;}`);
const wort = (c) => tx(c, 2);

/** Der richtige Schritt für einen Term, der die gesuchte Größe x enthält (und nicht x selbst ist). */
export function schritt(e, x) {
  const i = (e.a || []).findIndex((k) => enthaelt(k, x));
  const innen = e.a[i], neu = (k2) => ({ ...e, a: e.a.map((k, j) => (j === i ? k2 : k)) });
  switch (e.t) {
    case 'add': {
      const andere = e.a.filter((_, j) => j !== i), c = pick(andere), rest = e.a.filter((k) => k !== c);
      return { label: minusLabel(c), rest: rest.length === 1 ? rest[0] : add(...rest), auf: (o) => add(o, neg(c)), innen, neu,
        tipp: `Zuletzt wurde ${tex$(negTerm(c) ? `-${wort(betrag(c))}` : wort(c))} ${negTerm(c) ? 'abgezogen' : 'addiert'}. Gegenrechnung auf beiden Seiten: ${tex$(minusLabel(c))}.`,
        falsch: [
          { auf: (o) => add(o, c), why: `Vorzeichen: Die Gegenrechnung von ${tex$(plusLabel(c))} ist ${tex$(minusLabel(c))} – auch auf der anderen Seite.` },
          { auf: (o) => o, why: 'Was du auf einer Seite rechnest, musst du auch auf der anderen Seite rechnen – sonst ist es keine Gleichung mehr.' },
          ...(negTerm(c) ? [] : [{ auf: (o) => add(c, neg(o)), why: 'Verdreht: Von der anderen Seite wird abgezogen, nicht umgekehrt.' }]),
        ] };
    }
    case 'mul': {
      const andere = e.a.filter((_, j) => j !== i), zahlen = andere.filter((k) => ist(k, 'n'));
      const c = zahlen.length && rand() < 0.6 ? pick(zahlen) : pick(andere), rest = e.a.filter((k) => k !== c);
      const r = rest.length === 1 ? rest[0] : mul(...rest);
      return { label: geteiltLabel(c), rest: r, auf: (o) => div(o, c), innen, neu,
        tipp: `${tex$(wort(c))} ist ein Faktor. Einen Faktor wirst du los, indem du beide Seiten durch ihn teilst: ${tex$(geteiltLabel(c))}.`,
        falsch: [
          { auf: (o) => mul(o, c), why: `Die Gegenrechnung von „mal ${tex$(wort(c))}“ ist „geteilt durch ${tex$(wort(c))}“ – auf der anderen Seite wird geteilt, nicht malgenommen.` },
          { label: minusLabel(c), auf: (o) => add(o, neg(c)), why: `${tex$(wort(c))} ist ein Faktor, kein Summand. Einen Faktor wirst du durch Teilen los, nicht durch Abziehen.` },
          { auf: (o) => div(c, o), why: 'Bruch verdreht: Die andere Seite gehört in den Zähler, der Faktor in den Nenner.' },
        ] };
    }
    case 'div': {
      const [z, nn] = e.a;
      if (i === 0) return { label: malLabel(nn), rest: z, auf: (o) => mul(o, nn), innen, neu,
        tipp: `Es wurde durch ${tex$(wort(nn))} geteilt. Gegenrechnung: Beide Seiten mal ${tex$(wort(nn))}.`,
        falsch: [
          { auf: (o) => div(o, nn), why: `Die Gegenrechnung von „geteilt durch ${tex$(wort(nn))}“ ist „mal ${tex$(wort(nn))}“ – nicht noch einmal teilen.` },
          { label: minusLabel(nn), auf: (o) => add(o, neg(nn)), why: 'Ein Nenner verschwindet nicht durch Abziehen, sondern wenn du beide Seiten mit ihm malnimmst.' },
          { auf: (o) => div(nn, o), why: 'Verdreht: Mal den Nenner heißt, die andere Seite wird mit ihm malgenommen.' },
        ] };
      return { label: '\\text{Kehrwert}', rest: istZahl(z, 1) ? nn : div(nn, z), auf: (o) => div(N(1), o), innen, neu,
        tipp: 'Die gesuchte Größe steht im Nenner. Nimm auf beiden Seiten den Kehrwert – dann steht sie oben.',
        falsch: [
          { auf: (o) => o, why: 'Den Kehrwert musst du auf beiden Seiten nehmen.' },
          { auf: (o) => (ist(o, 'add') ? add(...o.a.map((t) => (negTerm(t) ? neg(div(N(1), betrag(t))) : div(N(1), t)))) : null), why: `Der Kehrwert einer Summe ist nicht die Summe der Kehrwerte: ${tex$('\\frac{1}{a+b}\\neq\\frac1a+\\frac1b')}.` },
          { label: istZahl(z, 1) ? null : malLabel(z), rest: nn, auf: (o) => mul(o, z), why: 'Der Zähler hilft nicht: Die gesuchte Größe steckt im Nenner. Erst den Kehrwert nehmen (oder mit dem Nenner malnehmen).' },
        ].filter((f) => f.label !== null) };
    }
    case 'neg': return { label: '\\cdot(-1)', rest: e.a[0], auf: (o) => neg(o), innen, neu,
      tipp: 'Vor der gesuchten Größe steht ein Minus. Nimm beide Seiten mal (−1).',
      falsch: [
        { auf: (o) => o, why: 'Mal (−1) auf beiden Seiten: Auch auf der anderen Seite wechselt das Vorzeichen.' },
        { label: '+1', auf: (o) => add(o, N(1)), why: 'Das Minus vor der gesuchten Größe ist ein Vorzeichen: Es verschwindet durch „mal (−1)“, nicht durch „+ 1“.' },
        { auf: (o) => (ist(o, 'add') ? add(neg(o.a[0]), ...o.a.slice(1)) : null), why: 'Mal (−1) wirkt auf jeden Summanden – alle Vorzeichen wechseln, nicht nur das erste.' },
      ] };
    case 'pow': {
      const [b, k] = e.a;
      if (i === 0) return { label: wurzelLabel(k), rest: b, auf: (o) => wurzel(o, k), innen, neu,
        tipp: `Die Gegenrechnung von „hoch ${tex$(tx(k))}“ ist die ${istZahl(k, 2) ? 'Wurzel' : `${tex$(tx(k))}-te Wurzel`}. (Alle Größen sind hier positiv.)`,
        falsch: [
          ...(ist(k, 'n') ? [{ label: geteiltLabel(k), auf: (o) => div(o, k), why: `„Hoch ${tex$(tx(k))}“ heißt „mal sich selbst“, nicht „mal ${tex$(tx(k))}“ – die Gegenrechnung ist die Wurzel, nicht das Teilen.` }] : []),
          { auf: (o) => pow(o, k), why: `Die Gegenrechnung von „hoch ${tex$(tx(k))}“ ist die Wurzel – nicht noch einmal „hoch ${tex$(tx(k))}“.` },
          { auf: (o) => (ist(o, 'add') ? add(...o.a.map((t) => (negTerm(t) ? neg(wurzel(betrag(t), k)) : wurzel(t, k)))) : null), why: `Die Wurzel aus einer Summe ist nicht die Summe der Wurzeln: ${tex$('\\sqrt{a^2-b^2}\\neq a-b')}.` },
        ] };
      const ln = istE(b);
      return { label: ln ? '\\ln' : `\\log_{${tx(b, 3)}}`, rest: k, auf: (o) => log(b, o), innen, neu,
        tipp: `Die gesuchte Größe steht im Exponenten. Der ${ln ? 'natürliche Logarithmus' : `Logarithmus zur Basis ${tex$(tx(b))}`} holt ihn herunter.`,
        falsch: [
          { label: geteiltLabel(b), auf: (o) => div(o, b), why: 'Die gesuchte Größe steht im Exponenten – Teilen durch die Basis hilft nicht. Den Exponenten holt der Logarithmus herunter.' },
          { label: wurzelLabel(b), auf: (o) => wurzel(o, b), why: 'Eine Wurzel holt die Basis heraus, nicht den Exponenten. Hier hilft nur der Logarithmus.' },
          ...(ln ? [] : [{ auf: (o) => log(o, b), why: 'Basis und Zahl vertauscht: Gesucht ist die Hochzahl, mit der man die Basis potenzieren muss.' }]),
        ] };
    }
    case 'wurzel': {
      const k = e.a[1];
      return { label: istZahl(k, 2) ? '(\\;\\;)^2' : `(\\;\\;)^{${tx(k)}}`, rest: e.a[0], auf: (o) => pow(o, k), innen, neu,
        tipp: `Die Gegenrechnung der Wurzel ist das ${istZahl(k, 2) ? 'Quadrieren' : `Potenzieren mit ${tex$(tx(k))}`} – auf beiden Seiten.`,
        falsch: [
          ...(istZahl(k, 2) ? [{ label: malLabel(N(2)), auf: (o) => mul(N(2), o), why: 'Quadrieren heißt „mal sich selbst“, nicht „mal 2“.' }] : []),
          { auf: (o) => wurzel(o, k), why: 'Die Gegenrechnung der Wurzel ist das Quadrieren – nicht noch einmal die Wurzel.' },
          { auf: (o) => (ist(o, 'add') && istZahl(k, 2) ? add(...o.a.map((t) => (negTerm(t) ? neg(pow(betrag(t), k)) : pow(t, k)))) : null), why: `Vorsicht, binomische Formel: ${tex$('(a+b)^2\\neq a^2+b^2')}.` },
        ] };
    }
    case 'log': {
      const [b] = e.a, ln = istE(b);
      return { label: ln ? 'e^{\\,\\square}' : `${tx(b, 3)}^{\\,\\square}`, rest: e.a[1], auf: (o) => pow(b, o), innen, neu,
        tipp: `Die Gegenrechnung des Logarithmus ist das Potenzieren: ${tex$(`${ln ? 'e' : tx(b, 3)}`)} hoch beide Seiten.`,
        falsch: [
          { label: geteiltLabel(b), auf: (o) => div(o, b), why: 'Der Logarithmus ist kein Faktor – er wird durch Potenzieren rückgängig gemacht.' },
          { auf: (o) => mul(b, o), why: `„${tex$(ln ? 'e' : tx(b, 3))} hoch“ heißt potenzieren, nicht malnehmen.` },
          { auf: (o) => pow(o, b), why: 'Basis und Hochzahl vertauscht: Die Basis des Logarithmus wird zur Basis der Potenz.' },
        ] };
    }
    default: return null;
  }
}
// Fließtext-Formeln werden später gesetzt (das macht die Ansicht); hier nur markiert.
const tex$ = (s) => `⟨${s}⟩`;

// ---------------------------------------------------------------- Lineare Gleichungen mit x auf beiden Seiten
/** Linearer Term in x? → [a, b] als Bruchzahlen (a·x + b), sonst null. */
export function linear(e, x) {
  switch (e.t) {
    case 'n': return [Q(0), zahlQ(e)];
    case 's': return e.n === x ? [Q(1), Q(0)] : null;
    case 'neg': { const l = linear(e.a[0], x); return l && [Q(-l[0].p, l[0].q), Q(-l[1].p, l[1].q)]; }
    case 'add': { let a = Q(0), b = Q(0); for (const k of e.a) { const l = linear(k, x); if (!l) return null; a = Q(a.p * l[0].q + l[0].p * a.q, a.q * l[0].q); b = Q(b.p * l[1].q + l[1].p * b.q, b.q * l[1].q); } return [a, b]; }
    case 'mul': { let c = Q(1), lin = null; for (const k of e.a) { if (ist(k, 'n')) c = Q(c.p * k.p, c.q * k.q); else { if (lin) return null; lin = linear(k, x); if (!lin) return null; } } return lin ? [Q(c.p * lin[0].p, c.q * lin[0].q), Q(c.p * lin[1].p, c.q * lin[1].q)] : [Q(0), c]; }
    case 'div': { const l = linear(e.a[0], x); if (!l || !ist(e.a[1], 'n')) return null; const d = e.a[1]; return [Q(l[0].p * d.q, l[0].q * d.p), Q(l[1].p * d.q, l[1].q * d.p)]; }
    default: return null;
  }
}
const linTerm = (a, b, x) => simp(add(mul(N(a.p, a.q), S(x)), N(b.p, b.q)));
const klammerTerm = (e, x) => (ist(e, 'mul') && e.a.some((k) => ist(k, 'add') && enthaelt(k, x)) ? e : ist(e, 'add') ? e.a.find((k) => klammerTerm(k, x)) : null);

/** Sonderschritte, solange x auf beiden Seiten steht: erst Klammern auflösen, dann sammeln. */
function linSchritt(st, x) {
  const kl = klammerTerm(st.l, x) ? 'l' : klammerTerm(st.r, x) ? 'r' : null;
  if (kl) {
    const T = st[kl], k = klammerTerm(T, x), c = k.a.find((f) => ist(f, 'n')) || N(1), inn = k.a.find((f) => ist(f, 'add'));
    const aus = simp(add(...inn.a.map((t) => mul(c, t)))), ersetz = (T2, durch) => (T2 === k ? durch : ist(T2, 'add') ? add(...T2.a.map((t) => (t === k ? durch : t))) : T2);
    const nur1 = add(mul(c, inn.a[0]), ...inn.a.slice(1)), vz = add(...inn.a.map((t, j) => (j === 0 ? mul(c, t) : mul(N(-c.p, c.q), t))));
    const mach = (durch) => ({ ...st, [kl]: ordne(ersetz(T, durch), x) });
    return { richtig: { label: '\\text{Klammer auflösen}', ...mach(aus) }, tipp: `Löse zuerst die Klammer auf: Jeder Summand in der Klammer wird mit ${tex$(tx(c, 2))} malgenommen.`,
      falsch: [
        { label: '\\text{Klammer auflösen}', ...mach(nur1), why: `Jeder Summand in der Klammer wird mit ${tex$(tx(c, 2))} malgenommen – nicht nur der erste.` },
        { label: '\\text{Klammer auflösen}', ...mach(vz), why: 'Vorzeichenfehler beim Ausmultiplizieren: Minus mal Minus ergibt Plus, Plus mal Minus ergibt Minus.' },
      ] };
  }
  const L = linear(st.l, x), R = linear(st.r, x);
  if (!L || !R) return null;
  const links = L[0].p * R[0].q >= R[0].p * L[0].q;   // x bleibt auf der Seite mit der größeren Zahl davor
  const c = links ? R[0] : L[0], cx = mul(N(c.p, c.q), S(x)), weg = (l, r) => ({ ...st, l: ordne(simp(add(l, neg(cx))), x), r: ordne(simp(add(r, neg(cx))), x) });
  const richtig = { label: minusLabel(simp(cx)), ...weg(st.l, st.r) };
  return { richtig, tipp: `Bring alle ${tex$(x)} auf eine Seite: Ziehe auf beiden Seiten ${tex$(tx(simp(cx), 1))} ab – dann bleibt die Zahl vor ${tex$(x)} positiv.`,
    falsch: [
      { label: plusLabel(simp(cx)), ...st, l: ordne(simp(add(st.l, cx)), x), r: ordne(simp(add(st.r, neg(cx))), x), why: `Wer ${tex$(tx(simp(cx), 1))} auf die andere Seite bringt, muss es auf beiden Seiten abziehen – nicht auf einer addieren.` },
      { label: minusLabel(N(c.p, c.q)), ...st, l: ordne(simp(add(st.l, N(-c.p, c.q))), x), r: ordne(simp(add(st.r, N(-c.p, c.q))), x), why: `${tex$(tx(simp(cx), 1))} heißt ${tex$(`${tx(N(c.p, c.q), 2)}\\cdot ${x}`)} – abgezogen wird der ganze Term, nicht nur die Zahl.` },
      { label: minusLabel(simp(cx)), ...st, [links ? 'l' : 'r']: ordne(simp(add(links ? st.l : st.r, neg(cx))), x), why: 'Auf beiden Seiten abziehen – nicht nur auf einer.' },
    ] };
}
/** Linearen Term hübsch ordnen: erst das x-Glied, dann die Zahl. */
function ordne(e, x) { const l = linear(e, x); return l ? linTerm(l[0], l[1], x) : e; }

// ---------------------------------------------------------------- Zustand und Züge
/** Zustand: l, r (linke/rechte Seite), x (gesuchte Größe). */
export const fertig = (st) => (ist(st.l, 's') && st.l.n === st.x && !enthaelt(st.r, st.x)) || (ist(st.r, 's') && st.r.n === st.x && !enthaelt(st.l, st.x));
const seiteMitX = (st) => (enthaelt(st.l, st.x) ? 'l' : 'r');
const andereSeite = (s) => (s === 'l' ? 'r' : 'l');

/**
 * Die Wahl für den nächsten Schritt: { richtig, falsch[], tipp }. Jede Möglichkeit ist { label, l, r, why? }.
 * wahr: Belegungen, unter denen die Ausgangsgleichung stimmt – damit wird geprüft, dass jeder Ablenker wirklich falsch ist.
 */
export function zuege(st, wahr) {
  const x = st.x;
  let r;
  if (zaehle(st.l, x) + zaehle(st.r, x) > 1) {
    r = linSchritt(st, x); if (!r) return null;
  } else {
    const s = seiteMitX(st), o = andereSeite(s), T = st[s];
    const sch = schritt(T, x); if (!sch) return null;
    const mach = (rest, other) => ({ ...st, [s]: rest, [o]: other });
    const richtig = { label: sch.label, ...mach(sch.rest, simp(sch.auf(st[o]))) };
    const falsch = [];
    for (const f of sch.falsch) { const ot = f.auf(st[o]); if (ot) falsch.push({ label: f.label ?? sch.label, ...mach(f.rest ?? sch.rest, simp(ot)), why: f.why }); }
    // Falsche Reihenfolge: die innere Rechnung zuerst rückgängig machen
    if (sch.innen && !(ist(sch.innen, 's') && sch.innen.n === x)) {
      const inn = schritt(sch.innen, x);
      if (inn) falsch.push({ label: inn.label, ...mach(sch.neu(inn.rest), simp(inn.auf(st[o]))), why: `Falsche Reihenfolge: Von außen nach innen! Zuerst muss ${tex$(sch.label)} gerechnet werden – was zuletzt dazukam, kommt zuerst weg.` });
    }
    r = { richtig, falsch, tipp: sch.tipp };
  }
  // Ablenker prüfen: wirklich falsch, voneinander und von der richtigen Antwort verschieden
  const tr = gleichungTex(r.richtig.l, r.richtig.r), seen = new Set([tr]);
  r.falsch = r.falsch.filter((f) => {
    const t = gleichungTex(f.l, f.r) + '|' + f.label, nurGl = gleichungTex(f.l, f.r);
    if (seen.has(nurGl) || seen.has(t)) return false;
    if (/NaN|undefined|Infinity/.test(t)) return false;
    if (wahr.some((env) => gilt(f.l, f.r, env) || !Number.isFinite(wert(f.l, env)) || !Number.isFinite(wert(f.r, env)))) return false;
    seen.add(nurGl); return true;
  });
  return r;
}

/** Der ganze richtige Lösungsweg ab einem Zustand: Liste von { label, l, r }. */
export function loesungsweg(st, wahr, max = 12) {
  const weg = []; let s = st;
  while (!fertig(s) && weg.length < max) { const z = zuege(s, wahr); if (!z) return null; s = { ...s, l: z.richtig.l, r: z.richtig.r }; weg.push({ label: z.richtig.label, l: s.l, r: s.r, tipp: z.tipp }); }
  return fertig(s) ? weg : null;
}

// ---------------------------------------------------------------- Formel-Lesen (für die Formel-Sammlung)
const GRIECH = new Set(['alpha', 'beta', 'gamma', 'lambda', 'rho', 'omega', 'eta', 'mu', 'pi', 'varphi', 'Delta']);
function name(id) {
  if (id === 'pi') return '\\pi';
  if (id === 'e') return 'e';
  if (id === 'dT') return '\\Delta T';
  if (id === 'BMI') return '\\mathrm{BMI}';
  if (GRIECH.has(id)) return `\\${id}`;
  const u = id.match(/^([A-Za-z]+)_(\w+)$/); if (u) return `${name(u[1])}_{${u[2].length > 1 ? `\\text{${u[2]}}` : u[2]}}`;
  const z = id.match(/^([A-Za-z])(\d)$/); if (z) return `${z[1]}_${z[2]}`;
  return id;
}
/** Liest „A = 1/2*g*h“ als Termbaum. Zahlen-Brüche wie 1/2 werden zu einer Zahl. */
export function lies(src) {
  const tok = src.match(/\d+(?:\.\d+)?|[A-Za-z][A-Za-z0-9_]*|[-+*/^()=,]/g); let i = 0;
  const peek = () => tok[i], nimm = (t) => { if (tok[i] !== t) throw new Error(`erwartet ${t} in ${src}`); i++; };
  const summe = () => { let a = [produkt()]; while (peek() === '+' || peek() === '-') { const op = tok[i++]; const b = produkt(); a.push(op === '-' ? (ist(b, 'n') ? { ...b, p: -b.p } : neg(b)) : b); } return a.length === 1 ? a[0] : add(...a); };
  const produkt = () => {
    let a = vorz();
    while (peek() === '*' || peek() === '/') {
      const op = tok[i++], b = vorz();
      if (op === '*') a = mul(a, b);
      else a = ist(a, 'n') && ist(b, 'n') ? N(a.p * b.q, a.q * b.p, 'bruch') : ist(a, 'mul') && ist(b, 'n') && a.a.length === 2 && ist(a.a[0], 'n') ? div(a, b) : div(a, b);
    }
    return a;
  };
  const vorz = () => (peek() === '-' ? (i++, ((b) => (ist(b, 'n') ? { ...b, p: -b.p } : neg(b)))(potenz())) : potenz());
  const potenz = () => { const b = atom(); if (peek() === '^') { i++; return pow(b, vorz()); } return b; };
  const atom = () => {
    const t = tok[i++];
    if (t === '(') { const a = summe(); nimm(')'); return a; }
    if (/^\d/.test(t)) { if (t.includes('.')) { const [g, f] = t.split('.'); return N(+(g + f), 10 ** f.length, 'dez'); } return N(+t); }
    if (t === 'sqrt' || t === 'ln' || t === 'lg' || t === 'cbrt') { nimm('('); const a = summe(); nimm(')'); return t === 'sqrt' ? wurzel(a) : t === 'cbrt' ? wurzel(a, N(3)) : t === 'ln' ? log(S('e'), a) : log(N(10), a); }
    return S(name(t));
  };
  const l = summe(); nimm('='); const r = summe();
  if (i !== tok.length) throw new Error(`Rest in ${src}`);
  return { l, r };
}

// ---------------------------------------------------------------- Aufgaben
/**
 * Formeln: f (Formel), th (Thema), st (Stockwerk 4 oder 5), ziele (gesuchte Größen), dep/wert (welche Größe sich aus den anderen
 * ergibt, falls nicht links allein), bereich (Zufallswerte zum Nachprüfen, alle positiv). Eigene Zusammenstellung.
 */
export const FORMELN = [
  { f: 'A = 1/2*g*h', th: 'Fläche eines Dreiecks', st: 4, ziele: ['g', 'h'] },
  { f: 'U = 2*pi*r', th: 'Umfang eines Kreises', st: 4, ziele: ['r'] },
  { f: 'U = 2*(a+b)', th: 'Umfang eines Rechtecks', st: 4, ziele: ['a', 'b'] },
  { f: 'A = 1/2*(a+c)*h', th: 'Fläche eines Trapezes', st: 4, ziele: ['a', 'c', 'h'] },
  { f: 'V = a*b*c', th: 'Volumen eines Quaders', st: 4, ziele: ['a', 'c'] },
  { f: 'v = s/t', th: 'Geschwindigkeit', st: 4, ziele: ['s', 't'] },
  { f: 'F = m*a', th: 'Kraft', st: 4, ziele: ['m', 'a'] },
  { f: 'p = F/A', th: 'Druck', st: 4, ziele: ['F', 'A'] },
  { f: 'rho = m/V', th: 'Dichte', st: 4, ziele: ['m', 'V'] },
  { f: 'R = U/I', th: 'Ohmsches Gesetz', st: 4, ziele: ['U', 'I'] },
  { f: 'P = U*I', th: 'Elektrische Leistung', st: 4, ziele: ['U', 'I'] },
  { f: 'E_pot = m*g*h', th: 'Lageenergie', st: 4, ziele: ['m', 'h'] },
  { f: 'Z = K*p*t/100', th: 'Zinsen', st: 4, ziele: ['K', 'p', 't'] },
  { f: 'W = G*p/100', th: 'Prozentwert', st: 4, ziele: ['G', 'p'] },
  { f: 'v = a*t + v0', th: 'Gleichmäßig beschleunigt', st: 4, ziele: ['a', 't', 'v0'] },
  { f: 'y = m*x + b', th: 'Geradengleichung', st: 4, ziele: ['m', 'x', 'b'] },
  { f: 'F = 1.8*C + 32', th: 'Celsius in Fahrenheit', st: 4, ziele: ['C'] },
  { f: 'V = 1/3*G*h', th: 'Volumen einer Pyramide', st: 4, ziele: ['G', 'h'] },
  { f: 'Q = c*m*dT', th: 'Wärmemenge', st: 4, ziele: ['c', 'm', 'dT'] },
  { f: 'c = lambda*f', th: 'Wellen', st: 4, ziele: ['lambda', 'f'] },
  { f: 'P = W/t', th: 'Leistung', st: 4, ziele: ['W', 't'] },
  { f: 'eta = P_ab/P_zu', th: 'Wirkungsgrad', st: 4, ziele: ['P_ab', 'P_zu'] },
  { f: 'F1*a1 = F2*a2', th: 'Hebelgesetz', st: 4, ziele: ['F1', 'a1', 'a2'], dep: 'F2', wert: 'F2 = F1*a1/a2' },
  { f: 'b = alpha/360*2*pi*r', th: 'Kreisbogen', st: 4, ziele: ['alpha', 'r'] },
  { f: 'A = pi*r^2', th: 'Fläche eines Kreises', st: 4, ziele: ['r'] },
  { f: 'V = pi*r^2*h', th: 'Volumen eines Zylinders', st: 4, ziele: ['h', 'r'] },
  { f: 'O = 2*pi*r^2 + 2*pi*r*h', th: 'Oberfläche eines Zylinders', st: 4, ziele: ['h'] },
  { f: 'M = pi*r*s', th: 'Mantel eines Kegels', st: 4, ziele: ['r', 's'] },
  { f: 's = v*t + s0', th: 'Gleichförmige Bewegung', st: 4, ziele: ['v', 't'] },
  { f: 'P = m*g*h/t', th: 'Hubleistung', st: 4, ziele: ['h', 't'] },
  { f: 'E_kin = 1/2*m*v^2', th: 'Bewegungsenergie', st: 4, ziele: ['m'] },
  { f: 'n = c/v', th: 'Brechzahl', st: 4, ziele: ['v'] },
  { f: 'a = (v - v0)/t', th: 'Beschleunigung', st: 4, ziele: ['v', 't', 'v0'] },
  { f: 'E = m*c^2', th: 'Masse und Energie', st: 4, ziele: ['m', 'c'] },
  { f: 'E_kin = 1/2*m*v^2', th: 'Bewegungsenergie', st: 5, ziele: ['v'] },
  { f: 'a^2 + b^2 = c^2', th: 'Satz des Pythagoras', st: 5, ziele: ['a', 'b'], dep: 'c', wert: 'c = sqrt(a^2 + b^2)' },
  { f: 'T = 2*pi*sqrt(l/g)', th: 'Fadenpendel', st: 5, ziele: ['l', 'g'] },
  { f: 'T = 2*pi*sqrt(m/D)', th: 'Federpendel', st: 5, ziele: ['m', 'D'] },
  { f: '1/f = 1/g + 1/b', th: 'Linsengleichung', st: 5, ziele: ['b', 'g', 'f'], dep: 'f', wert: 'f = 1/(1/g + 1/b)' },
  { f: 'K = K0*(1 + p/100)^n', th: 'Zinseszins', st: 5, ziele: ['n', 'p', 'K0'] },
  { f: 'N = N0*e^(k*t)', th: 'Exponentielles Wachstum', st: 5, ziele: ['t', 'k'] },
  { f: 'N = N0*(1/2)^(t/T)', th: 'Halbwertszeit', st: 5, ziele: ['t', 'T'] },
  { f: 'F = G*m1*m2/r^2', th: 'Gravitationsgesetz', st: 5, ziele: ['r', 'm1'] },
  { f: 'v^2 = v0^2 + 2*a*s', th: 'Bremsweg', st: 5, ziele: ['s', 'a', 'v0'], dep: 'v', wert: 'v = sqrt(v0^2 + 2*a*s)' },
  { f: 'V = 4/3*pi*r^3', th: 'Volumen einer Kugel', st: 5, ziele: ['r'] },
  { f: 'BMI = m/l^2', th: 'Body-Mass-Index', st: 5, ziele: ['l', 'm'] },
  { f: 'R = rho*l/A', th: 'Widerstand eines Drahts', st: 5, ziele: ['A', 'l'] },
  { f: 'A = pi*(R^2 - r^2)', th: 'Fläche eines Kreisrings', st: 5, ziele: ['R', 'r'], bereich: { R: [6, 9], r: [1, 5] } },
  { f: 'h = 1/2*g*t^2', th: 'Freier Fall', st: 5, ziele: ['t', 'g'] },
  { f: 'f = 1/(2*pi*sqrt(L*C))', th: 'Schwingkreis', st: 5, ziele: ['L', 'C'] },
  { f: 'p = p0*e^(-h/H)', th: 'Luftdruck in der Höhe', st: 5, ziele: ['h', 'H'] },
  { f: 'r = sqrt(A/pi)', th: 'Radius aus der Kreisfläche', st: 5, ziele: ['A'] },
  { f: 'L = 10*lg(I/I0)', th: 'Schallpegel', st: 5, ziele: ['I', 'I0'] },
  { f: 'x = v0*t + 1/2*a*t^2', th: 'Weg bei Beschleunigung', st: 5, ziele: ['a', 'v0'] },
  { f: 'O = 4*pi*r^2', th: 'Oberfläche einer Kugel', st: 5, ziele: ['r'] },
];
const idOf = (zielId) => name(zielId);

/** Zufällige Belegungen, unter denen die Formel stimmt (alle Größen positiv). */
function belegungen(F, gl, n = 3) {
  const alle = [...groessen(gl.l), ...groessen(gl.r)];
  const dep = F.dep ? name(F.dep) : ist(gl.l, 's') ? gl.l.n : gl.r.n;
  const wertGl = F.wert ? lies(F.wert) : null;
  const out = [];
  for (let k = 0; k < n * 4 && out.length < n; k++) {
    const env = {};
    for (const g of alle) if (g !== dep) { const id = Object.keys(F.bereich || {}).find((b) => name(b) === g), [lo, hi] = id ? F.bereich[id] : [1.2, 4.8]; env[g] = lo + rand() * (hi - lo); }
    env[dep] = wert(wertGl ? wertGl.r : ist(gl.l, 's') && gl.l.n === dep ? gl.r : gl.l, env);
    if (Number.isFinite(env[dep]) && env[dep] > 0 && gilt(gl.l, gl.r, env)) out.push(env);
  }
  return out;
}

/** Aufgabe aus einer Formel: { art:'formel', x, l, r, wahr, th, weg }. */
export function formelAufgabe(F, ziel) {
  const gl = lies(F.f), x = idOf(ziel ?? pick(F.ziele));
  if (zaehle(gl.l, x) + zaehle(gl.r, x) !== 1) return null;
  const wahr = belegungen(F, gl); if (wahr.length < 3) return null;
  const st = { l: gl.l, r: gl.r, x };
  const weg = loesungsweg(st, wahr); if (!weg || !weg.length) return null;
  return { art: 'formel', ...st, wahr, th: F.th, weg };
}

// ---------------------------------------------------------------- Zahlen-Gleichungen
const nz = (a, b) => { let v; do v = ri(a, b); while (v === 0); return v; };
/** Eine Schicht um den Term: liefert [neuer Term, neuer Wert] oder null. */
function schicht(art, T, v, o) {
  const k = (lo, hi) => (o.neg ? nz(-hi, hi) : ri(lo, hi));
  switch (art) {
    case 'plus': { const c = o.neg ? nz(-o.max, o.max) : ri(1, o.max); return [rand() < 0.25 && !ist(T, 'add') ? add(N(c), T) : add(T, N(c)), v + c]; }
    case 'minus': { const c = ri(1, o.max); return [add(T, N(-c)), v - c]; }
    case 'mal': { let c = k(2, o.faktor); if (Math.abs(c) < 2) c = c < 0 ? -2 : 2; return [mul(N(c), T), v * c]; }
    case 'durch': { const t = [2, 3, 4, 5, 6, 8, 10].filter((d) => v % d === 0 && d <= Math.max(2, o.faktor)); if (!t.length) return null; const c = pick(t); return [div(T, N(c)), v / c]; }
    case 'vonzahl': { const c = ri(Math.max(1, v + 1), v + o.max + 2); return [add(N(c), neg(T)), c - v]; }
    case 'quadratmach': { const s = ri(Math.max(2, Math.ceil(Math.sqrt(Math.max(v, 0) + 1))), 9), c = s * s - v; if (c === 0) return null; return [add(T, N(c)), s * s]; }
    case 'wurzel': { const r = Math.sqrt(v); if (!Number.isInteger(r)) return null; return [wurzel(T), r]; }
    case 'kehr': { if (v <= 0) return null; const m = ri(2, 6), c = v * m; return [div(N(c), T), m]; }
    default: return null;
  }
}
const ZAHL_MUSTER = {
  1: [['plus'], ['minus'], ['mal'], ['durch'], ['vonzahl']],
  2: [['mal', 'plus'], ['mal', 'minus'], ['durch', 'plus'], ['plus', 'mal'], ['minus', 'durch'], ['plus', 'durch'], ['mal', 'vonzahl'], ['minus', 'mal']],
  3: [['plus', 'mal', 'minus'], ['mal', 'plus', 'durch'], ['minus', 'mal', 'plus'], ['plus', 'durch', 'minus'], ['mal', 'minus', 'mal']],
  5: [['quadratmach', 'wurzel', 'mal', 'plus'], ['mal', 'plus', 'kehr', 'minus'], ['plus', 'kehr', 'mal'], ['mal', 'quadratmach', 'wurzel', 'minus'], ['plus', 'mal', 'durch', 'vonzahl']],
};
/** Zahlen-Gleichung aus Schichten um x. stock: Stockwerk, klein: Klasse 5/6 (keine negativen Zahlen). */
export function zahlAufgabe(stock, klein = false) {
  const o = { max: stock === 1 ? 20 : 30, faktor: stock === 1 ? 9 : 12, neg: !klein && stock >= 2 && rand() < 0.4 };
  for (let v = 0; v < 60; v++) {
    const muster = pick((ZAHL_MUSTER[stock] || ZAHL_MUSTER[3]).filter((m) => !(klein && m.includes('vonzahl'))));
    let x0 = klein ? ri(2, 12) : nz(-9, 15); if (muster.includes('quadratmach') || muster.includes('wurzel')) x0 = ri(1, 12);
    let T = S('x'), w = x0, ok = true;
    for (const art of muster) { const s = schicht(art, T, w, o); if (!s) { ok = false; break; } [T, w] = s; }
    if (!ok || Math.abs(w) > 400 || (klein && w < 0)) continue;
    const links = rand() < 0.8, st = { l: links ? T : N(w), r: links ? N(w) : T, x: 'x' }, wahr = [{ x: x0 }];
    const weg = loesungsweg(st, wahr); if (!weg) continue;
    return { art: 'zahl', ...st, wahr, x0, weg };
  }
  return null;
}
/** x auf beiden Seiten (Stockwerk 3), auf Wunsch mit Klammer. */
export function beideAufgabe(klein = false) {
  for (let v = 0; v < 60; v++) {
    const x0 = klein ? ri(1, 12) : nz(-8, 12), a = ri(2, 9), c = ri(1, 9); if (a === c) continue;
    const klammer = rand() < 0.5, k = ri(2, 5), m = klein ? ri(1, 6) : nz(-6, 6);
    const L = klammer ? add(mul(N(k), add(S('x'), N(m))), N(ri(1, 9) * (klein ? 1 : pick([1, -1])))) : add(mul(N(a), S('x')), N(klein ? ri(1, 15) : nz(-15, 15)));
    const Lw = wert(L, { x: x0 }), d = Lw - c * x0;
    if (klein && d < 0) continue;
    const R = d === 0 ? mul(N(c), S('x')) : add(mul(N(c), S('x')), N(d));
    if (Math.abs(Lw) > 300) continue;
    const st = rand() < 0.5 ? { l: L, r: R, x: 'x' } : { l: R, r: L, x: 'x' }, wahr = [{ x: x0 }];
    const lin = linear(L, 'x'); if (lin[0].p === c * lin[0].q) continue;
    const weg = loesungsweg(st, wahr); if (!weg) continue;
    return { art: 'zahl', ...st, wahr, x0, weg };
  }
  return null;
}
/** x im Exponenten (Stockwerk 5): c · b^x + d = w. */
export function expAufgabe() {
  for (let v = 0; v < 40; v++) {
    const b = pick([2, 3, 4, 5, 10]), x0 = ri(1, b === 2 ? 7 : b === 10 ? 3 : 4), c = ri(2, 6), d = nz(-20, 20);
    const T = add(mul(N(c), pow(N(b), S('x'))), N(d)), w = c * b ** x0 + d;
    const st = { l: T, r: N(w), x: 'x' }, wahr = [{ x: x0 }];
    const weg = loesungsweg(st, wahr); if (!weg) continue;
    return { art: 'zahl', ...st, wahr, x0, weg };
  }
  return null;
}

/** Aufgabe für ein Stockwerk (1–5). jg: Klassenstufe ('5'…'10', 'os'). schwer: für den Wächter (längste Wege). */
export function aufgabe(stock, jg = 'os', schwer = false) {
  const klein = jg === '5' || jg === '6';
  const versuch = () => {
    if (stock <= 2) return zahlAufgabe(stock, klein);
    if (stock === 3) return rand() < 0.6 ? beideAufgabe(klein) : zahlAufgabe(3, klein);
    if (stock === 4) { if (rand() < 0.15) return zahlAufgabe(3, klein); const F = pick(FORMELN.filter((f) => f.st === 4)); return formelAufgabe(F); }
    const r = rand();
    if (r < 0.15) return expAufgabe();
    if (r < 0.3) return zahlAufgabe(5, klein);
    return formelAufgabe(pick(FORMELN.filter((f) => f.st === 5)));
  };
  let best = null;
  for (let k = 0; k < (schwer ? 6 : 1) || !best; k++) {
    const a = versuch(); if (!a || !optionenOk(a)) { if (k > 40) break; continue; }
    if (!best || a.weg.length > best.weg.length) best = a;
  }
  return best;
}
/** Jeder Schritt braucht mindestens zwei echte Ablenker. */
function optionenOk(a) {
  let st = { l: a.l, r: a.r, x: a.x };
  for (const s of a.weg) { const z = zuege(st, a.wahr); if (!z || z.falsch.length < 2) return false; st = { ...st, l: s.l, r: s.r }; }
  return true;
}

/** Die Auswahl für einen Schritt: richtige Möglichkeit und bis zu drei Ablenker, gemischt. */
export function auswahl(st, wahr, n = 4) {
  const z = zuege(st, wahr); if (!z) return null;
  const opts = shuffle([{ ...z.richtig, ok: true }, ...shuffle(z.falsch).slice(0, n - 1).map((f) => ({ ...f, ok: false }))]);
  return { opts, tipp: z.tipp };
}

// ---------------------------------------------------------------- Fallen-Raum: Fehler finden
/**
 * Ein vorgerechneter Lösungsweg mit genau einem Fehler. Rückgabe: { zeilen: [{label, l, r}], fehler (Index der falschen Zeile), why, aufgabe }.
 * Zeile 0 ist die Aufgabe selbst. Nach dem Fehler wird folgerichtig weitergerechnet – das Ergebnis ist darum falsch.
 */
export function falle(stock, jg = 'os') {
  for (let v = 0; v < 40; v++) {
    const a = aufgabe(Math.max(2, stock), jg); if (!a || a.weg.length < 2) continue;
    const j = ri(0, a.weg.length - 1);
    let st = { l: a.l, r: a.r, x: a.x };
    const zeilen = [{ label: '', l: a.l, r: a.r }];
    for (let k = 0; k < j; k++) { zeilen.push({ label: a.weg[k].label, l: a.weg[k].l, r: a.weg[k].r }); st = { ...st, l: a.weg[k].l, r: a.weg[k].r }; }
    const z = zuege(st, a.wahr); if (!z) continue;
    const kand = z.falsch.filter((f) => zaehle(f.l, a.x) + zaehle(f.r, a.x) === 1); if (!kand.length) continue;
    const f = pick(kand); zeilen.push({ label: f.label, l: f.l, r: f.r });
    const rest = loesungsweg({ ...st, l: f.l, r: f.r }, [], 10); if (!rest) continue;
    for (const s of rest) zeilen.push({ label: s.label, l: s.l, r: s.r });
    if (zeilen.length > 8) continue;
    const letzte = zeilen[zeilen.length - 1];
    if (a.wahr.some((env) => gilt(letzte.l, letzte.r, env))) continue;
    if (zeilen.some((zz) => /NaN|undefined|Infinity/.test(gleichungTex(zz.l, zz.r)))) continue;
    return { zeilen, fehler: j + 1, why: f.why, aufgabe: a };
  }
  return null;
}

/** Ergebnis-Zeile („x = …“) und Probe bei Zahl-Gleichungen. */
export function ergebnisTex(a) {
  const e = a.weg[a.weg.length - 1];
  return enthaelt(e.l, a.x) ? gleichungTex(e.l, e.r) : gleichungTex(e.r, e.l);
}
export function probeTex(a) {
  if (a.art !== 'zahl') return '';
  const w = N(a.x0), T = enthaelt(a.l, 'x') ? a.l : a.r, O = T === a.l ? a.r : a.l;
  const links = ersetze(T, 'x', w), rechts = ersetze(O, 'x', w);
  return `${tx(links)} = ${tx(simp(links))}${ist(O, 'n') ? '' : ` \\quad\\text{und}\\quad ${tx(rechts)} = ${tx(simp(rechts))}`}`;
}
