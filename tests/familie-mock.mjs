// Nachgebauter Familien-Server (nach ops/familie/SCHNITTSTELLE.md) für Browser-Tests. Nur zum Testen – den echten Server betreibt der Leitstand.
const F = await import('../app/js/familie.js');
export const GESPERRT = [], VERGEBEN = new Map();
const sha = async (s) => F.b64url(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))));
export function server() {
  const fam = new Map(); let uhr = 0; const log = [];
  const antwort = (status, obj) => ({ status, ok: status >= 200 && status < 300, json: async () => obj });
  const f = async (url, o = {}) => {
    const m = /\/familie\/v1\/([\w-]{22})(\/.*)?$/.exec(url); if (!m) return antwort(404, {});
    const [, id, pfad = ''] = m, meth = o.method || 'GET', h = o.headers || {}, e = fam.get(id);
    log.push(`${meth} ${pfad || '/'}`);
    const darf = async () => e && e.schreib === await sha(h['X-Schreib'] || '');
    if (pfad === '' && meth === 'PUT') { if (!/^[\w-]{43}$/.test(h['X-Notfall-Pruef'] || '')) return antwort(400, { fehler: 'notfall_pruef' }); if (e) return antwort(409, { fehler: 'gibt_es_schon' }); fam.set(id, { schreib: await sha(h['X-Schreib']), notfall: o.body, pruef: h['X-Notfall-Pruef'], blobs: new Map(), rechte: [] }); return antwort(201, {}); }
    if (!e) return antwort(404, { fehler: 'unbekannt' });
    if (pfad === '' && meth === 'DELETE') { if (!(await darf())) return antwort(403, {}); fam.delete(id); return antwort(204, null); }
    if (pfad === '/liste') return antwort(200, { blobs: [...e.blobs].map(([k, b]) => ({ pfad: k, rev: b.rev, t: b.t })) });
    if (pfad === '/rechte') return antwort(200, { rechte: e.rechte });
    if (pfad === '/protokoll') return antwort(200, { eintraege: [] });
    if (pfad === '/einloesen' && meth === 'POST') {
      if (!(await darf())) return antwort(403, { fehler: 'schreibrecht' });
      const nr = await F.codeNummer(JSON.parse(o.body).code); if (!nr) return antwort(404, { fehler: 'code_unbekannt' });
      if (GESPERRT.includes(nr)) return antwort(403, { fehler: 'code_gesperrt' });
      if (VERGEBEN.has(nr) && VERGEBEN.get(nr) !== id) return antwort(409, { fehler: 'code_vergeben' });
      VERGEBEN.set(nr, id); const recht = { app: 'mathetrainer', produkt: 'pass', codeNr: nr, bis: '2027-07-31', ki: true }; e.rechte = [...e.rechte.filter((r) => r.codeNr !== nr), recht];
      return antwort(200, { rechte: e.rechte, recht });
    }
    if (/^\/(index|s\/[a-z][a-z0-9-]+\/([\w-]{22}|geraet-[\w-]+))$/.test(pfad)) {
      const b = e.blobs.get(pfad);
      if (meth === 'GET') return b ? antwort(200, { d: b.d, rev: b.rev, t: b.t }) : antwort(404, { fehler: 'leer' });
      if (meth === 'PUT') {
        if (!(await darf())) return antwort(403, {});
        if (String(b ? b.rev : 0) !== String(h['If-Match'])) return antwort(409, { fehler: 'veraltet', rev: b?.rev ?? 0, d: b?.d, t: b?.t });
        const nb = { d: o.body, rev: (b?.rev || 0) + 1, t: ++uhr }; e.blobs.set(pfad, nb); return antwort(200, { rev: nb.rev });
      }
    }
    return antwort(404, {});
  };
  return { f, fam, log };
}

