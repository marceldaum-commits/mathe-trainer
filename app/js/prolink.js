// Freischalt-Link aus der Kauf-Mail (Leitstand 18.11.2026, Ratgeber-Update 11): …/#pro=MT-XXXX-XXXX-XXXX (neu) –
// der Teil hinter # geht nie an einen Server und landet so in keinem Server-Log. Alte Mails mit ?pro= gelten weiter.
// Der Code wird sofort aus der Adresszeile entfernt (history.replaceState), dann wie von Hand eingelöst (POST /api/zugang).
import { api, codeNorm } from './api.js';
import { store } from './store.js';

/** Code aus der Adresse: null = kein Freischalt-Link; '' = Link mit ungültigem Code; sonst der Code in Normalform. */
export function codeAusAdresse(loc = globalThis.location) {
  const h = /^#pro=([^&]*)/.exec(loc?.hash || '');
  let q = null; try { q = new URLSearchParams(loc?.search || '').get('pro'); } catch { /* ohne Suchteil */ }
  const roh = h ? h[1] : q;
  if (roh === null || roh === undefined) return null;
  let t = roh; try { t = decodeURIComponent(roh); } catch { /* so lassen */ }
  return codeNorm(t);
}
/** Adresse ohne Code (für replaceState): ?pro= weg, #pro=… wird zu #/einstellungen. */
export function adresseOhneCode(href) {
  const u = new URL(href); u.searchParams.delete('pro'); if (/^#pro=/.test(u.hash)) u.hash = '#/einstellungen';
  return u.pathname + u.search + u.hash;
}
/** Code einlösen wie von Hand. → { ok, ki } oder { ok: false, text } */
export async function einloesen(code) {
  const r = await api.zugang(code);
  if (r.ok && /^\d{4}-\d{2}-\d{2}$/.test(r.bis || '')) { store.zugang = { code, art: String(r.art || ''), bis: r.bis, ki: r.ki !== false }; return { ok: true, ki: r.ki !== false }; }
  return { ok: false, text: r.status === 404 ? 'Diesen Code kennen wir nicht, oder er ist abgelaufen.' : 'Der Code konnte gerade nicht geprüft werden. Du kannst ihn in den Einstellungen von Hand eingeben.' };
}
/** Beim Start: Freischalt-Link erkennen, Adresse sofort säubern, einlösen. melde(text) zeigt das Ergebnis. */
export function freischaltLink(melde = () => {}, w = globalThis.window) {
  const code = codeAusAdresse(w?.location);
  if (code === null) return null;
  try { w.history.replaceState(null, '', adresseOhneCode(w.location.href)); } catch { /* alte Browser */ }
  if (!code) { melde('Der Freischalt-Link enthält keinen gültigen Code. Bitte den Code in den Einstellungen von Hand eingeben.'); return Promise.resolve({ ok: false }); }
  return einloesen(code).then((r) => {
    melde(r.ok ? (r.ki ? 'Pro + KI ist freigeschaltet.' : 'Pro ist freigeschaltet.') : r.text);
    try { w.dispatchEvent(new Event('mt-ruhig')); w.dispatchEvent(new Event('hashchange')); } catch { /* egal */ }
    return r;
  }).catch(() => { melde('Der Code konnte gerade nicht geprüft werden. Du kannst ihn in den Einstellungen von Hand eingeben.'); return { ok: false }; });
}
