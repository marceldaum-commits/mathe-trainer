// Familien-Speicher für alle Lern-Apps – gemeinsame Client-Bibliothek (Marcel 19.11.2026: „Sofort bauen“;
// Bauplan docs/plattform/appzentrale/FAMILIEN-SPEICHER.md im Repo website_backup, Branch appzentrale).
// Keine Abhängigkeiten außer WebCrypto (und CompressionStream, wenn vorhanden). Kann 1:1 in andere Apps kopiert werden.
//
// Schlüssel: famId (16 B), famKey (32 B, nie im Klartext beim Server), schreib (16 B, Header X-Schreib), alles base64url.
// Link:      …/#familie=<famId>.<famKey>.<schreib>
// Blobs:     AES-GCM-256, 12-Byte-IV, Schlüssel HKDF-SHA256(famKey, salt = 32 Nullbytes, info "lernapps/v1/<app>/<kindId>" bzw.
//            "lernapps/v1/index"); Klartext = 1 Zeichen Art + Inhalt: „z“ = gzip(JSON), „j“ = JSON (Gerät ohne gzip).
//            Stand-JSON: { app, v: 1, kind, stand (ISO-Zeit), daten } – Rechte nie im Kind-Blob. kindId 16 B oder „geraet-<id>“.
//            Body text/plain „<iv>.<ct>“ (base64url) wie bei eltern/v1.
// Notfall:   famKey zusätzlich für den öffentlichen Wiederherstellungs-Schlüssel (X25519, 32 B) verschlüsselt:
//            eph = neues X25519-Paar; geteilt = X25519(eph.priv, pub); k = HKDF-SHA256(geteilt, salt = eph.pub ‖ pub,
//            info "lernapps/v1/notfall"); Kopie = „<eph.pub>.<iv>.<AES-GCM(k, famKey)>“ (base64url).
// Server:    /familie/v1/<famId>[/index|/s/<app>/<kindId>|/liste|/rechte|/einloesen|/protokoll] (Bauplan).
//            GET liefert { d, rev, t }, PUT liefert { rev }; PUT mit If-Match: <rev> (neu: If-Match: 0), 409 → { rev, d, t }.
//            Sperrliste: GET /familie/v1/sperrliste → { hashes: [SHA-256(Code) base64url, …] } (Bauplan v1.2).

/* ───────────── Grundbausteine ───────────── */
export const b64url = (bytes) => { let s = ''; for (const b of bytes) s += String.fromCharCode(b); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
export const b64urlLesen = (s) => Uint8Array.from(atob(String(s).replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((String(s).length + 3) % 4)), (c) => c.charCodeAt(0));
const zufall = (n) => crypto.getRandomValues(new Uint8Array(n));
const text = new TextEncoder(), lesen = new TextDecoder();
const ID22 = /^[\w-]{22}$/, KEY43 = /^[\w-]{43}$/, KIND = /^([\w-]{22}|geraet-[\w-]{1,40})$/, APP = /^[a-z][a-z0-9-]{1,30}$/;

/* ───────────── X25519 (RFC 7748), eigene kleine Rechnung mit BigInt ─────────────
   Damit läuft die Notfall-Kopie auch auf Geräten, deren WebCrypto noch kein X25519 kennt. Nur für die Notfall-Kopie
   (einmal beim Anlegen) – Laufzeit ein paar Millisekunden. */
const P = 2n ** 255n - 19n, A24 = 121665n;
const mod = (a) => { const r = a % P; return r < 0n ? r + P : r; };
const pot = (b, e) => { let r = 1n; b = mod(b); while (e > 0n) { if (e & 1n) r = mod(r * b); b = mod(b * b); e >>= 1n; } return r; };
const leLesen = (u) => { let n = 0n; for (let i = u.length - 1; i >= 0; i--) n = (n << 8n) + BigInt(u[i]); return n; };
const leSchreiben = (n) => { const u = new Uint8Array(32); for (let i = 0; i < 32; i++) { u[i] = Number(n & 255n); n >>= 8n; } return u; };
export function x25519(skalar, punkt) {
  const k = Uint8Array.from(skalar); k[0] &= 248; k[31] &= 127; k[31] |= 64;
  const u = Uint8Array.from(punkt); u[31] &= 127;
  const kk = leLesen(k), x1 = leLesen(u);
  let x2 = 1n, z2 = 0n, x3 = x1, z3 = 1n, tausch = 0n;
  for (let t = 254n; t >= 0n; t--) {
    const kt = (kk >> t) & 1n; tausch ^= kt;
    if (tausch) { [x2, x3] = [x3, x2]; [z2, z3] = [z3, z2]; }
    tausch = kt;
    const a = mod(x2 + z2), aa = mod(a * a), b = mod(x2 - z2), bb = mod(b * b), e = mod(aa - bb);
    const c = mod(x3 + z3), d = mod(x3 - z3), da = mod(d * a), cb = mod(c * b);
    x3 = mod((da + cb) ** 2n); z3 = mod(x1 * mod((da - cb) ** 2n)); x2 = mod(aa * bb); z2 = mod(e * mod(aa + A24 * e));
  }
  if (tausch) { [x2, x3] = [x3, x2]; [z2, z3] = [z3, z2]; }
  return leSchreiben(mod(x2 * pot(z2, P - 2n)));
}
const BASIS = (() => { const u = new Uint8Array(32); u[0] = 9; return u; })();
export const x25519Oeffentlich = (priv) => x25519(priv, BASIS);

/* ───────────── HKDF, AES-GCM, gzip ───────────── */
async function hkdf(geheim, info, salt = new Uint8Array(32)) {   // Blobs: salt = 32 Nullbytes (Bauplan v1.1)
  const k = await crypto.subtle.importKey('raw', geheim, 'HKDF', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'HKDF', hash: 'SHA-256', salt, info: text.encode(info) }, k, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
async function aesZu(key, klar) { const iv = zufall(12); return `${b64url(iv)}.${b64url(new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, klar)))}`; }
async function aesAuf(key, body) { const [iv, ct] = String(body).split('.'); return new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64urlLesen(iv) }, key, b64urlLesen(ct))); }
const kannGzip = () => typeof CompressionStream === 'function' && typeof DecompressionStream === 'function';
async function strom(bytes, s) { return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(s)).arrayBuffer()); }
/** Objekt → Klartext-Bytes („z“ + gzip oder „j“ + JSON). */
export async function packen(obj, { gzip = kannGzip() } = {}) {
  const json = text.encode(JSON.stringify(obj));
  const inhalt = gzip ? await strom(json, new CompressionStream('gzip')) : json;
  const out = new Uint8Array(inhalt.length + 1); out[0] = (gzip ? 'z' : 'j').charCodeAt(0); out.set(inhalt, 1); return out;
}
export async function auspacken(bytes) {
  const art = String.fromCharCode(bytes[0]), rest = bytes.subarray(1);
  if (art === 'j') return JSON.parse(lesen.decode(rest));
  if (art === 'z') { if (!kannGzip()) throw new Error('gzip fehlt auf diesem Gerät'); return JSON.parse(lesen.decode(await strom(rest, new DecompressionStream('gzip')))); }
  throw new Error('unbekanntes Format');
}
const infoStand = (app, kindId) => `lernapps/v1/${app}/${kindId}`, INFO_INDEX = 'lernapps/v1/index', INFO_NOTFALL = 'lernapps/v1/notfall';
/** Blob verschlüsseln bzw. entschlüsseln (für Index und Stände). */
export async function verschluesseln(obj, famKey, info, opt) { return aesZu(await hkdf(b64urlLesen(famKey), info), await packen(obj, opt)); }
export async function entschluesseln(body, famKey, info) { return auspacken(await aesAuf(await hkdf(b64urlLesen(famKey), info), body)); }

/* ───────────── Notfall-Kopie ───────────── */
/** famKey für den öffentlichen Wiederherstellungs-Schlüssel (base64url, 32 B) verschlüsseln → „<eph>.<iv>.<ct>“. */
export async function notfallKopie(famKey, pubB64) {
  const pub = b64urlLesen(pubB64); if (pub.length !== 32) throw new Error('Wiederherstellungs-Schlüssel ungültig');
  const ephPriv = zufall(32), ephPub = x25519Oeffentlich(ephPriv), geteilt = x25519(ephPriv, pub);
  if (geteilt.every((b) => b === 0)) throw new Error('Wiederherstellungs-Schlüssel ungültig');
  const salt = new Uint8Array(64); salt.set(ephPub, 0); salt.set(pub, 32);
  return `${b64url(ephPub)}.${await aesZu(await hkdf(geteilt, INFO_NOTFALL, salt), b64urlLesen(famKey))}`;
}
/** Gegenstück (nur für das Werkzeug „familie-wiederherstellen“ und die Tests – der private Schlüssel ist nie in einer App). */
export async function notfallOeffnen(kopie, privB64) {
  const [eph, iv, ct] = String(kopie).split('.'), priv = b64urlLesen(privB64), ephPub = b64urlLesen(eph), pub = x25519Oeffentlich(priv);
  const salt = new Uint8Array(64); salt.set(ephPub, 0); salt.set(pub, 32);
  return b64url(await aesAuf(await hkdf(x25519(priv, ephPub), INFO_NOTFALL, salt), `${iv}.${ct}`));
}

/* ───────────── Link, Familien-Nummer ───────────── */
export function familieLink(fam, app, basis = 'https://lernen.mathenachhilfe-online.com') { return `${basis}/${app}/#familie=${fam.famId}.${fam.famKey}.${fam.schreib}`; }
/** Liest „#familie=<famId>.<famKey>.<schreib>“ aus einem Link oder Hash – oder null. */
export function familieLesen(textOderHash) {
  const m = /#?familie=([\w-]{22})\.([\w-]{43})\.([\w-]{22})(?:$|&)/.exec(String(textOderHash).trim());
  return m ? { famId: m[1], famKey: m[2], schreib: m[3] } : null;
}
/** Familien-Nummer zum Finden bei einer Wiederherstellung (öffnet nichts): die ersten 8 Zeichen der famId. */
export const familienNummer = (famId) => `${famId.slice(0, 4)}-${famId.slice(4, 8)}`;
export const neueFamilie = () => ({ famId: b64url(zufall(16)), famKey: b64url(zufall(32)), schreib: b64url(zufall(16)) });
export const neueKindId = () => b64url(zufall(16));
/** Kennung für Gerätedaten (Einstellungen, die keinem Kind gehören). */
export const geraetKindId = (id) => `geraet-${String(id).replace(/[^\w-]/g, '').slice(0, 40)}`;

/* ───────────── Server ───────────── */
/**
 * Zugang zum Familien-Speicher. basis: z. B. '' (gleiche Herkunft) oder 'https://trainer-test.mathenachhilfe-online.com';
 * f: fetch (für Tests austauschbar). Alle Aufrufe werfen nie; sie liefern { ok, … } bzw. { ok: false, grund }.
 */
export function familie(fam, { basis = '', f = globalThis.fetch } = {}) {
  if (!fam || !ID22.test(fam.famId) || !KEY43.test(fam.famKey) || !ID22.test(fam.schreib)) throw new Error('Familie ungültig');
  const url = (pfad = '') => `${basis}/familie/v1/${fam.famId}${pfad}`;
  const schreibKopf = { 'X-Schreib': fam.schreib };
  const ruf = async (pfad, o = {}) => {
    let r; try { r = await f(url(pfad), { cache: 'no-store', ...o }); } catch { return { ok: false, grund: 'netz' }; }
    let daten = null; try { daten = r.status === 204 ? null : await r.json(); } catch { /* ohne Inhalt */ }
    if (r.ok) return { ok: true, status: r.status, daten };
    return { ok: false, status: r.status, daten, grund: r.status === 404 ? 'keine' : r.status === 409 ? 'konflikt' : r.status === 403 ? 'schreibrecht' : r.status === 413 ? 'zu-gross' : r.status === 429 ? 'zu-oft' : 'fehler' };
  };
  const blobLaden = async (pfad, info) => {
    const r = await ruf(pfad); if (!r.ok) return r;
    try { return { ok: true, daten: await entschluesseln(r.daten.d, fam.famKey, info), rev: r.daten.rev, t: r.daten.t }; } catch { return { ok: false, grund: 'schluessel' }; }
  };
  const blobSichern = async (pfad, info, obj, rev) => {
    const body = await verschluesseln(obj, fam.famKey, info);
    const r = await ruf(pfad, { method: 'PUT', headers: { ...schreibKopf, 'Content-Type': 'text/plain', 'If-Match': String(rev ?? 0) }, body });
    if (r.ok) return { ok: true, rev: r.daten?.rev };
    if (r.status === 409 && r.daten?.d) {   // { rev, d, t }   // anderes Gerät war schneller: aktuellen Stand mitliefern, die App führt zusammen
      try { return { ok: false, grund: 'konflikt', daten: await entschluesseln(r.daten.d, fam.famKey, info), rev: r.daten.rev }; } catch { return { ok: false, grund: 'konflikt', rev: r.daten.rev }; }
    }
    return r;
  };
  return {
    fam,
    nummer: familienNummer(fam.famId),
    link: (app, b) => familieLink(fam, app, b),
    /** Familie beim Server anlegen (einmalig), mit Notfall-Kopie für den öffentlichen Wiederherstellungs-Schlüssel. */
    async anlegen(wiederherstellPub) { return ruf('', { method: 'PUT', headers: { ...schreibKopf, 'Content-Type': 'text/plain' }, body: await notfallKopie(fam.famKey, wiederherstellPub) }); },
    indexLaden: () => blobLaden('/index', INFO_INDEX),
    indexSichern: (index, rev) => blobSichern('/index', INFO_INDEX, index, rev),
    /** Stand laden → { ok, daten, stand, rev, t } (daten = App-Format, stand = ISO-Zeit des Sicherns). */
    async standLaden(app, kindId) {
      if (!APP.test(app) || !KIND.test(kindId)) return { ok: false, grund: 'ungueltig' };
      const r = await blobLaden(`/s/${app}/${kindId}`, infoStand(app, kindId)); if (!r.ok) return r;
      if (r.daten?.app !== app || r.daten?.kind !== kindId) return { ok: false, grund: 'schluessel' };
      return { ok: true, daten: r.daten.daten, stand: r.daten.stand, rev: r.rev, t: r.t };
    },
    /** Stand sichern → { ok, rev } | { ok: false, grund: 'konflikt', daten, stand, rev } | { ok: false, grund }. */
    async standSichern(app, kindId, daten, rev) {
      if (!APP.test(app) || !KIND.test(kindId)) return { ok: false, grund: 'ungueltig' };
      const r = await blobSichern(`/s/${app}/${kindId}`, infoStand(app, kindId), { app, v: 1, kind: kindId, stand: new Date().toISOString(), daten }, rev);
      return r.grund === 'konflikt' && r.daten ? { ...r, daten: r.daten.daten, stand: r.daten.stand } : r;
    },
    liste: () => ruf('/liste'),
    rechte: () => ruf('/rechte'),
    einloesen: (code) => ruf('/einloesen', { method: 'POST', headers: { ...schreibKopf, 'Content-Type': 'application/json' }, body: JSON.stringify({ code: String(code).trim().toUpperCase() }) }),
    protokoll: () => ruf('/protokoll'),
    loeschen: () => ruf('', { method: 'DELETE', headers: schreibKopf }),
  };
}

/* ───────────── Familien-Index ───────────── */
/** Leerer Index. Kinder: { kindId, name (Spitzname), klasse, farbe }; apps: genutzte Apps. */
export const neuerIndex = () => ({ v: 1, kinder: [], apps: [] });
export function kindHinzu(index, { name = '', klasse = '', farbe = '' } = {}) {
  const kind = { kindId: neueKindId(), name: String(name).trim().slice(0, 20), klasse: String(klasse).slice(0, 10), farbe: String(farbe).slice(0, 16) };
  return { index: { ...index, kinder: [...(index.kinder || []), kind] }, kind };
}
export const appMerken = (index, app) => (index.apps?.includes(app) ? index : { ...index, apps: [...(index.apps || []), app] });

/** Notfall-Blatt als Text (QR macht die App aus dem Link). */
export function notfallBlatt(fam, app, basis) {
  return { link: familieLink(fam, app, basis), nummer: familienNummer(fam.famId),
    text: `Familien-Zugang für die Lern-Apps von Mathenachhilfe Online.\nFamilien-Nummer: ${familienNummer(fam.famId)}\nLink: ${familieLink(fam, app, basis)}\nGut aufbewahren: Wer diesen Link hat, kann die Lernstände öffnen.` };
}

/* ───────────── Sperrliste (erstattete bzw. gesperrte Codes, Bauplan v1.2) ───────────── */
/** SHA-256 eines Codes (getrimmt, groß), base64url. */
export async function codeHash(code) { return b64url(new Uint8Array(await crypto.subtle.digest('SHA-256', text.encode(String(code).trim().toUpperCase())))); }
/**
 * Sperrliste laden, wenn online, und im Gerät zwischenspeichern (Schlüssel z. B. „mathetrainer.sperrliste“).
 * Liefert { ok, anzahl } – bei Fehlern bleibt die zuletzt gespeicherte Liste gültig.
 */
export async function sperrlisteLaden({ basis = '', f = globalThis.fetch, speicher = globalThis.localStorage, schluessel } = {}) {
  if (!schluessel) throw new Error('schluessel fehlt (z. B. „<app>.sperrliste“)');
  let r; try { r = await f(`${basis}/familie/v1/sperrliste`, { cache: 'no-store' }); } catch { return { ok: false, grund: 'netz' }; }
  if (!r.ok) return { ok: false, grund: 'fehler' };
  let hashes; try { hashes = (await r.json()).hashes; } catch { return { ok: false, grund: 'fehler' }; }
  if (!Array.isArray(hashes)) return { ok: false, grund: 'fehler' };
  const liste = hashes.filter((h) => /^[\w-]{43}$/.test(h));
  try { speicher?.setItem(schluessel, JSON.stringify({ t: Date.now(), hashes: liste })); } catch { /* ohne Speicher */ }
  return { ok: true, anzahl: liste.length };
}
/** Ist der Code gesperrt? Prüft die zwischengespeicherte Liste (offline nutzbar). */
export async function codeGesperrt(code, { speicher = globalThis.localStorage, schluessel } = {}) {
  let liste = []; try { liste = JSON.parse(speicher?.getItem(schluessel) || '{}').hashes || []; } catch { /* leer */ }
  return liste.includes(await codeHash(code));
}
