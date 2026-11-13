// Kleiner Rechenausdruck-Leser für KI-Aufgaben. Kein eval: nur Zahlen, x (und weitere erlaubte Namen), + − * / ^,
// Klammern und die Funktionen sin, cos, tan, exp, ln, sqrt, abs. Liefert eine Rechenfunktion.
const FUNCS = { sin: Math.sin, cos: Math.cos, tan: Math.tan, exp: Math.exp, ln: Math.log, sqrt: Math.sqrt, abs: Math.abs };
const CONSTS = { pi: Math.PI, e: Math.E };

export function parse(src, vars = ['x']) {
  if (typeof src !== 'string' || src.length === 0 || src.length > 200) throw new Error('Ausdruck fehlt oder ist zu lang');
  const s = src.replace(/\s+/g, '').replace(/,/g, '.').replace(/−/g, '-').replace(/·/g, '*');
  let i = 0;
  const peek = () => s[i];
  const eat = (c) => { if (s[i] !== c) throw new Error(`„${c}" erwartet an Stelle ${i + 1}`); i++; };
  function expr() { let a = term(); for (;;) { if (peek() === '+') { i++; const b = term(), l = a; a = (v) => l(v) + b(v); } else if (peek() === '-') { i++; const b = term(), l = a; a = (v) => l(v) - b(v); } else return a; } }
  function term() { let a = unary(); for (;;) { if (peek() === '*') { i++; const b = unary(), l = a; a = (v) => l(v) * b(v); } else if (peek() === '/') { i++; const b = unary(), l = a; a = (v) => l(v) / b(v); } else return a; } }
  function unary() { if (peek() === '-') { i++; const a = unary(); return (v) => -a(v); } if (peek() === '+') { i++; return unary(); } return power(); }
  function power() { const a = atom(); if (peek() === '^') { i++; const b = unary(); return (v) => a(v) ** b(v); } return a; }
  function atom() {
    const c = peek();
    if (c === '(') { i++; const a = expr(); eat(')'); return a; }
    if (/[0-9.]/.test(c || '')) { const m = /^\d*\.?\d+(?:e[+-]?\d+)?/i.exec(s.slice(i)); if (!m) throw new Error(`Zahl erwartet an Stelle ${i + 1}`); i += m[0].length; const n = +m[0]; return () => n; }
    const m = /^[a-z]+/i.exec(s.slice(i));
    if (!m) throw new Error(`Unerwartetes Zeichen an Stelle ${i + 1}`);
    const name = m[0].toLowerCase(); i += m[0].length;
    if (FUNCS[name]) { eat('('); const a = expr(); eat(')'); const f = FUNCS[name]; return (v) => f(a(v)); }
    if (vars.includes(name)) return (v) => v[name];
    if (name in CONSTS) { const n = CONSTS[name]; return () => n; }
    throw new Error(`Unbekannter Name „${name}"`);
  }
  const f = expr();
  if (i !== s.length) throw new Error(`Unerwartetes Zeichen an Stelle ${i + 1}`);
  return (x) => f(typeof x === 'object' && x !== null ? x : { x });
}
