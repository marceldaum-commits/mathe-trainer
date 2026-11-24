// Familien-Speicher im Mathe-Trainer (Plattform-Baustein familie.js @ af01c5c; Bauplan FAMILIEN-SPEICHER.md v1.7; Recht A6/V8).
// Alles hier läuft nur hinter dem Eltern-Tor (Anlegen, Beitreten, Löschen). Lernstände gehen verschlüsselt zum Server; der Schlüssel bleibt im Gerät.
// Rechte (Codes) liegen nie im Kind-Stand. Nie ohne ausdrückliche Einwilligung („Einverstanden – Familie anlegen/beitreten“, nichts vorausgewählt).
import { serverBasis } from './ort.js';
import { store } from './store.js';
import { sicherungDaten } from './eltern.js';

const LS = globalThis.localStorage;
export const FKEY = 'mathetrainer.familie', APP = 'mathetrainer';
/** Was zum Familien-Zugang im Gerät liegt: { famId, famKey, schreib, kindId, rev?, kinder?, weg? } – oder null. */
export const lies = () => { try { const o = JSON.parse(LS?.getItem(FKEY) || 'null'); return o && /^[\w-]{22}$/.test(o.famId || '') ? o : null; } catch { return null; } };
const merke = (o) => { try { if (o) LS.setItem(FKEY, JSON.stringify(o)); else LS.removeItem(FKEY); } catch { /* ohne Speicher */ } };
export const DSE_10M = 'https://www.mathenachhilfe-online.com/datenschutz/#10m';
/** Pflichttext (Marcel wörtlich, FAMILIEN-SPEICHER.md v1.5; Recht A6: nur dieser eine Einwilligungstext). */
export const PFLICHTTEXT = 'Eure Lernstände werden verschlüsselt auf unserem Server in Deutschland gespeichert. Der Schlüssel liegt auf euren Geräten. Damit wir euch helfen können, falls ihr den Familien-Zugang verliert, hinterlegen wir zusätzlich eine verschlüsselte Notfall-Kopie. Sie lässt sich nur mit einem getrennt und offline aufbewahrten Schlüssel von Mathenachhilfe Online öffnen. Technisch könnten wir damit eure Lernstände lesen; wir tun das nicht und nutzen ihn nur, wenn ihr uns um Wiederherstellung bittet. Jede Wiederherstellung seht ihr hier im Protokoll.';
/** Sicherheitshinweis (Recht V8): steht NICHT im Pflichttext, sondern dauerhaft auf der Familien-Seite und bei Link, QR-Code und Notfall-Blatt. */
export const SICHERHEITSHINWEIS = 'Wer den Familien-Link oder den QR-Code hat, kann die Lernstände eurer Familie öffnen, ändern und löschen. Teilt ihn nur mit Personen, denen ihr vertraut, und bewahrt das Notfall-Blatt sicher auf.';
export const FAMILIE_WEG = 'Diese Familie gibt es nicht mehr. Lernstand bleibt auf diesem Gerät.';

/** Zusammenführen zweier Stände: Zahlen größer gewinnt, Objekte feldweise, Listen vereinigt, sonst der eigene Wert (nie still überschreiben). */
export function mischen(a, b) {
  if (a === undefined || a === null) return b;
  if (b === undefined || b === null) return a;
  if (typeof a === 'number' && typeof b === 'number') return Math.max(a, b);
  if (Array.isArray(a) && Array.isArray(b)) { const seen = new Set(a.map((x) => JSON.stringify(x))); return [...a, ...b.filter((x) => !seen.has(JSON.stringify(x)))]; }
  if (typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) { const out = { ...b }; for (const k of Object.keys(a)) out[k] = mischen(a[k], b[k]); return out; }
  if (typeof a === 'boolean' && typeof b === 'boolean') return a || b;
  return a;
}
const SPERR = ['mathetrainer.eltern', 'mathetrainer.kirest', FKEY, 'mathetrainer.hinweise', 'mathetrainer.sperrliste', 'mathetrainer.umzug'];
/** Kind-Stand für den Server: alle App-Daten – ohne Geräte-Kennung, Zugangscode (Rechte), Klassen-Code und Familien-Schlüssel. */
export function familienDaten(ls = LS) {
  const d = sicherungDaten(ls);
  for (const n of SPERR) delete d[n];
  const v = d['mathetrainer.v1']; if (v && typeof v === 'object') { const x = { ...v }; delete x.zugang; delete x.klasse; delete x.geraet; d['mathetrainer.v1'] = x; }
  return d;
}
/** Server-Stand in den eigenen mischen (eigener Zugang, eigene Geräte-Kennung und Klasse bleiben). */
export function einmischen(fremd, ls = LS) {
  const eigen = familienDaten(ls); let n = 0;
  for (const [name, wert] of Object.entries(fremd || {})) {
    if (!/^mathetrainer\./.test(name) || SPERR.includes(name)) continue;
    const v = mischen(eigen[name], wert); if (JSON.stringify(v) === JSON.stringify(eigen[name])) continue;
    if (name === 'mathetrainer.v1' && v && typeof v === 'object') { let alt = {}; try { alt = JSON.parse(ls.getItem(name) || '{}') || {}; } catch { /* leer */ } ls.setItem(name, JSON.stringify({ ...v, ...(alt.zugang ? { zugang: alt.zugang } : {}), ...(alt.klasse ? { klasse: alt.klasse } : {}), ...(alt.geraet ? { geraet: alt.geraet } : {}) })); }
    else ls.setItem(name, typeof v === 'string' ? v : JSON.stringify(v));
    n++;
  }
  return n;
}
const F = () => import('./familie.js');
const mit = async (z = lies()) => { if (!z) return null; const L = await F(); return L.familie({ famId: z.famId, famKey: z.famKey, schreib: z.schreib }, { basis: serverBasis() }); };
/** Familie wurde auf dem Server gelöscht: Schlüssel im Gerät vergessen (Lernstand bleibt), Hinweis merken. */
const vergessen = () => { merke(null); try { LS.setItem('mathetrainer.familie-weg', '1'); } catch { /* egal */ } };
export const wegGemeldet = () => { try { const w = LS.getItem('mathetrainer.familie-weg') === '1'; return w; } catch { return false; } };
export const wegQuittieren = () => { try { LS.removeItem('mathetrainer.familie-weg'); } catch { /* egal */ } };
/** Antwort des Servers prüfen: 'familie-weg' → vergessen. */
const pruefe = (r) => { if (r && r.grund === 'familie-weg') { vergessen(); return { ok: false, grund: 'familie-weg' }; } return r; };

/** Familie neu anlegen (nur mit Einwilligung). Spitzname und Klasse sind freiwillig. */
export async function anlegen({ einverstanden, name = '', klasse = '' } = {}) {
  if (einverstanden !== true) return { ok: false, grund: 'einwilligung' };
  const L = await F(), fam = L.neueFamilie(), fa = L.familie(fam, { basis: serverBasis() });
  const a = await fa.anlegen(); if (!a.ok) return a;
  let { index, kind } = L.kindHinzu(L.neuerIndex(), { name, klasse: klasse || String(store.jahrgang) });
  index = L.appMerken(index, APP);
  const i = await fa.indexSichern(index, 0); if (!i.ok) return i;
  merke({ ...fam, kindId: kind.kindId, rev: 0, kinder: index.kinder, indexRev: i.rev });
  await sichern().catch(() => {}); return { ok: true, nummer: fa.nummer };
}
/** Beitreten per Familien-Link (nur mit Einwilligung). Gibt die Kinder zur Auswahl zurück, wenn es mehrere gibt. */
export async function beitreten(linkText, { einverstanden } = {}) {
  if (einverstanden !== true) return { ok: false, grund: 'einwilligung' };
  const L = await F(), fam = L.familieLesen(linkText); if (!fam) return { ok: false, grund: 'link' };
  const fa = L.familie(fam, { basis: serverBasis() }), ix = await fa.indexLaden(); if (!ix.ok) return pruefe(ix);
  const kinder = ix.daten.kinder || [];
  merke({ ...fam, kindId: kinder.length === 1 ? kinder[0].kindId : '', rev: 0, kinder, indexRev: ix.rev });
  return { ok: true, kinder, nummer: fa.nummer, kindId: kinder.length === 1 ? kinder[0].kindId : '' };
}
/** Kind wählen (beim Beitreten oder später) und dessen Stand laden und einmischen. */
export async function kindWaehlen(kindId) {
  const z = lies(); if (!z) return { ok: false, grund: 'keine' };
  merke({ ...z, kindId, rev: 0 }); return laden();
}
/** Neues Kind anlegen (Spitzname, Klasse) und für dieses Gerät wählen. */
export async function kindHinzu({ name = '', klasse = '' } = {}) {
  const z = lies(), fa = await mit(z); if (!fa) return { ok: false, grund: 'keine' };
  const L = await F(); let r = await fa.indexLaden(); if (!r.ok) return pruefe(r);
  const { index, kind } = L.kindHinzu(L.appMerken(r.daten, APP), { name, klasse });
  const s = await fa.indexSichern(index, r.rev); if (!s.ok) return pruefe(s);
  merke({ ...z, kindId: kind.kindId, rev: 0, kinder: index.kinder, indexRev: s.rev }); return { ok: true, kind };
}
/** Stand vom Server holen und einmischen. */
export async function laden() {
  const z = lies(), fa = await mit(z); if (!fa || !z.kindId) return { ok: false, grund: 'keine' };
  const r = await fa.standLaden(APP, z.kindId);
  if (!r.ok) return r.grund === 'keine' ? { ok: true, neu: true } : pruefe(r);
  const n = einmischen(r.daten); merke({ ...lies(), rev: r.rev, geladen: new Date().toISOString() }); return { ok: true, geaendert: n };
}
let laeuft = null;
/** Eigenen Stand sichern (bei Konflikt: zusammenführen und erneut sichern). 'ok' | 'keine' | fehlergrund. */
export function sichern() {
  if (laeuft) return laeuft;
  laeuft = (async () => {
    try {
      const z = lies(), fa = await mit(z); if (!fa || !z.kindId) return { ok: false, grund: 'keine' };
      let rev = z.rev || 0, daten = familienDaten();
      for (let versuch = 0; versuch < 3; versuch++) {
        const r = await fa.standSichern(APP, z.kindId, daten, rev);
        if (r.ok) { merke({ ...lies(), rev: r.rev, gesichert: new Date().toISOString() }); return { ok: true }; }
        if (r.grund === 'konflikt' && r.daten) { einmischen(r.daten); daten = familienDaten(); rev = r.rev; continue; }
        return pruefe(r);
      }
      return { ok: false, grund: 'konflikt' };
    } catch { return { ok: false, grund: 'netz' }; } finally { laeuft = null; }
  })();
  return laeuft;
}
/** Rechte, Protokoll, Code einlösen – hinter dem Tor. */
export const rechte = async () => { const fa = await mit(); return fa ? pruefe(await fa.rechte()) : { ok: false, grund: 'keine' }; };
export const protokoll = async () => { const fa = await mit(); return fa ? pruefe(await fa.protokoll()) : { ok: false, grund: 'keine' }; };
export async function einloesen(code) { const fa = await mit(); return fa ? pruefe(await fa.einloesen(code)) : { ok: false, grund: 'keine' }; }
/** Familien-Nummer, Link und Notfall-Blatt. */
export async function blatt() { const z = lies(); if (!z) return null; const L = await F(); return L.notfallBlatt(z, APP, 'https://lernen.mathenachhilfe-online.com'); }
export async function nummer() { const z = lies(); if (!z) return ''; const L = await F(); return L.familienNummer(z.famId); }
/** Löschen: Familien-Nummer muss eingetippt werden. Danach nur die Familien-Schlüssel im Gerät entfernen (Lernstand bleibt). */
export async function loeschen(eingabe) {
  const z = lies(), fa = await mit(z); if (!fa) return { ok: false, grund: 'keine' };
  const L = await F(); if (L.nummerNormal(eingabe) !== L.nummerNormal(L.familienNummer(z.famId))) return { ok: false, grund: 'nummer' };
  const r = await fa.loeschen();
  if (r.ok || r.grund === 'familie-weg' || r.grund === 'keine') { merke(null); return { ok: true }; }
  return r;
}
/** Nach einer Lern-Sitzung von selbst sichern: beim Verlassen der Seite und beim Zurückkehren zum Start (höchstens alle 10 Minuten). */
export function familieAutomatik(w = globalThis.window) {
  if (typeof w?.addEventListener !== 'function') return;
  let zuletzt = 0; const los = () => { const z = lies(); if (!z?.kindId || Date.now() - zuletzt < 600e3) return; zuletzt = Date.now(); sichern().catch(() => {}); };
  w.document?.addEventListener?.('visibilitychange', () => { if (w.document.visibilityState === 'hidden') los(); });
  w.addEventListener('hashchange', () => { if (['', '#/', '#/mehr'].includes(w.location.hash)) los(); });
  w.addEventListener('online', los);
  setTimeout(() => { const z = lies(); if (z?.kindId) laden().catch(() => {}); }, 4000);   // beim Start: neuesten Stand von anderen Geräten holen
}
