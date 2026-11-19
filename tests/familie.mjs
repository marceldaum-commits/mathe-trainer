// Familien-Speicher: Client-Bibliothek app/js/familie.js gegen einen nachgebauten Server /familie/v1/ (nur zum Testen –
// den echten Server baut und betreibt der Leitstand). Geprüft: X25519 nach RFC 7748, Notfall-Kopie hin und zurück,
// Anlegen, Index, Stände je App und Kind mit rev/If-Match und 409, Liste, Löschen, kein Klartext beim Server,
// falscher Schlüssel, ohne gzip lesbar. Aufruf: node tests/familie.mjs
const F = await import('../app/js/familie.js');
const NC = await import('node:crypto');   // unabhängige Gegenrechnung (Node-eigene Krypto)
let n = 0, fehler = 0; const ok = (b, t) => { n++; if (!b) { fehler++; console.error('FEHLER:', t); } };
const hex = (s) => Uint8Array.from(s.match(/../g), (x) => parseInt(x, 16));
const zuHex = (u) => [...u].map((b) => b.toString(16).padStart(2, '0')).join('');

// RFC 7748, Abschnitt 5.2 und 6.1
ok(zuHex(F.x25519(hex('a546e36bf0527c9d3b16154b82465edd62144c0ac1fc5a18506a2244ba449ac4'), hex('e6db6867583030db3594c1a424b15f7c726624ec26b3353b10a903a6d0ab1c4c'))) === 'c3da55379de9c6908e94ea4df28d084f32eccf03491c71f754b4075577a28552', 'X25519: RFC 7748 Testvektor 1');
const aPriv = hex('77076d0a7318a57d3c16c17251b26645df4c2f87ebc0992ab177fba51db92c2a'), bPriv = hex('5dab087e624a8a4b79e17f8b83800ee66f3bb1292618b6fd1c2f8b27ff88e0eb');
ok(zuHex(F.x25519Oeffentlich(aPriv)) === '8520f0098930a754748b7ddcb43ef75a0dbf3a0d26381af4eba4a98eaa9b4e6a' && zuHex(F.x25519Oeffentlich(bPriv)) === 'de9edb7d7b7dc1b4d35b61c2ece435373f8343c85b78674dadfc7e146f882b4f', 'X25519: öffentliche Schlüssel nach RFC 7748');
ok(zuHex(F.x25519(aPriv, F.x25519Oeffentlich(bPriv))) === '4a5d9d5ba4ce2de1728e3bf480350f25e07e21c947d19e3376f09b3c1e161742' && zuHex(F.x25519(bPriv, F.x25519Oeffentlich(aPriv))) === '4a5d9d5ba4ce2de1728e3bf480350f25e07e21c947d19e3376f09b3c1e161742', 'X25519: gemeinsames Geheimnis nach RFC 7748');

/* ───────────── nachgebauter Server (nach ops/familie/SCHNITTSTELLE.md) ───────────── */
const GESPERRT = [], VERGEBEN = new Map();
const sha = async (s) => F.b64url(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))));
function server() {
  const fam = new Map(); let uhr = 0; const log = [];
  const antwort = (status, obj) => ({ status, ok: status >= 200 && status < 300, json: async () => obj });
  const f = async (url, o = {}) => {
    const m = /\/familie\/v1\/([\w-]{22})(\/.*)?$/.exec(url); if (!m) return antwort(404, {});
    const [, id, pfad = ''] = m, meth = o.method || 'GET', h = o.headers || {}, e = fam.get(id);
    log.push(`${meth} ${pfad || '/'}`);
    const darf = async () => e && e.schreib === await sha(h['X-Schreib'] || '');
    if (pfad === '' && meth === 'PUT') { if (!/^[\w-]{43}$/.test(h['X-Notfall-Pruef'] || '')) return antwort(400, { fehler: 'notfall_pruef' }); if (e) return antwort(409, { fehler: 'gibt_es_schon' }); fam.set(id, { schreib: await sha(h['X-Schreib']), notfall: o.body, pruef: h['X-Notfall-Pruef'], blobs: new Map(), rechte: [] }); return antwort(201, {}); }
    if (!e) return antwort(404, {});
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
      if (meth === 'GET') return b ? antwort(200, { d: b.d, rev: b.rev, t: b.t }) : antwort(404, {});
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

/* ───────────── Ablauf ───────────── */
const S = server();
const testPriv = F.b64url(crypto.getRandomValues(new Uint8Array(32))), testPub = F.b64url(F.x25519Oeffentlich(F.b64urlLesen(testPriv)));
const fam = F.neueFamilie();
ok(/^[\w-]{22}$/.test(fam.famId) && /^[\w-]{43}$/.test(fam.famKey) && /^[\w-]{22}$/.test(fam.schreib), 'Neue Familie: famId 16 B, famKey 32 B, schreib 16 B (base64url)');
const link = F.familieLink(fam, 'mathetrainer');
ok(link === `https://lernen.mathenachhilfe-online.com/mathetrainer/#familie=${fam.famId}.${fam.famKey}.${fam.schreib}` && JSON.stringify(F.familieLesen(link)) === JSON.stringify(fam) && JSON.stringify(F.familieLesen(`#familie=${fam.famId}.${fam.famKey}.${fam.schreib}&/u/k8-lgs`)) === JSON.stringify(fam) && F.familieLesen('#familie=kaputt') === null, 'Familien-Link hin und zurück, auch mit angehängtem Hash');
ok(/^[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$/.test(F.familienNummer(fam.famId)), `Familien-Nummer: Crockford-Base32, groß, ohne Verwechsler (${F.familienNummer(fam.famId)})`);
ok(F.familienNummer(F.b64url(Uint8Array.from([0, 0, 0, 0, 0, ...new Array(11).fill(9)]))) === '0000-0000' && F.familienNummer(F.b64url(Uint8Array.from([255, 255, 255, 255, 255, ...new Array(11).fill(0)]))) === 'ZZZZ-ZZZZ' && F.familienNummer(F.b64url(Uint8Array.from([0x84, 0x21, 0x08, 0x42, 0x10, ...new Array(11).fill(0)]))) === 'GGGG-GGGG', 'Familien-Nummer: Randwerte und bekanntes Muster (je 5 Bit = 16 → G)');
ok(F.nummerNormal('k7qx-2mfa') === 'K7QX2MFA' && F.nummerNormal('O1LI') === '0111', 'Familien-Nummer: Eingabe vom Telefon normalisiert (O→0, I/L→1)');

const A = F.familie(fam, { f: S.f });
ok((await A.anlegen(testPub)).ok, 'Familie anlegen (PUT mit Notfall-Kopie)');
const kopie = S.fam.get(fam.famId).notfall;
ok(/^[\w-]{43}\.[\w-]{16}\.[\w-]+$/.test(kopie) && !kopie.includes(fam.famKey), 'Notfall-Kopie: „<eph>.<iv>.<ct>“, famKey nicht im Klartext');
ok(await F.notfallOeffnen(kopie, testPriv) === fam.famKey, 'Notfall-Kopie mit dem privaten Wiederherstellungs-Schlüssel geöffnet → famKey');
let falsch = false; try { await F.notfallOeffnen(kopie, F.b64url(crypto.getRandomValues(new Uint8Array(32)))); } catch { falsch = true; }
ok(falsch, 'Notfall-Kopie mit falschem Schlüssel: nicht lesbar');
ok((await A.anlegen(testPub)).grund === 'gibt-es-schon', 'Familie kein zweites Mal anlegen (409 → „gibt-es-schon“)');
const t = NC.hkdfSync('sha256', Buffer.from(F.b64urlLesen(fam.famKey)), Buffer.alloc(0), 'lernapps/v1/notfall-pruef', 32);
ok(S.fam.get(fam.famId).pruef === NC.createHash('sha256').update(Buffer.from(t)).digest('base64url') && await F.notfallPruef(fam.famKey) === S.fam.get(fam.famId).pruef, 'X-Notfall-Pruef = base64url(SHA-256(HKDF(famKey, „lernapps/v1/notfall-pruef“))) – mit Node-Krypto gegengerechnet');
const blobKey = Buffer.from(NC.hkdfSync('sha256', Buffer.from(F.b64urlLesen(fam.famKey)), Buffer.alloc(0), 'lernapps/v1/index', 32));
const probe = await F.verschluesseln({ hallo: 1 }, fam.famKey, 'lernapps/v1/index', { gzip: false }), [piv, pct] = probe.split('.').map((x) => Buffer.from(F.b64urlLesen(x)));
const dec = NC.createDecipheriv('aes-256-gcm', blobKey, piv); dec.setAuthTag(pct.subarray(-16));
ok(Buffer.concat([dec.update(pct.subarray(0, -16)), dec.final()]).toString() === 'j{"hallo":1}', 'Blob-Schlüssel HKDF(salt leer) = Node-Krypto; Klartext „j“ + JSON');
ok(F.REC_PUB === 'vMrORj9yObM3Ijd9sGStjUB9I3f6ot9E8M-70yGeQ0M' && F.b64urlLesen(F.REC_PUB).length === 32, 'REC_PUB fest eingetragen (32 B)');
const famR = F.neueFamilie(), R = F.familie(famR, { f: S.f });
ok((await R.anlegen()).ok && /^[\w-]{43}\.[\w-]{16}\.[\w-]{64}$/.test(S.fam.get(famR.famId).notfall), 'anlegen() ohne Parameter nutzt REC_PUB; Notfall-Kopie 43.16.64 Zeichen');
await R.loeschen();

// Index mit zwei Kindern
let { index, kind: lea } = F.kindHinzu(F.neuerIndex(), { name: 'Lea', klasse: '8' });
let r2 = F.kindHinzu(index, { name: 'Tim', klasse: '11' }); index = F.appMerken(r2.index, 'mathetrainer'); const tim = r2.kind;
ok(/^[\w-]{22}$/.test(lea.kindId) && lea.kindId !== tim.kindId && index.kinder.length === 2 && index.apps[0] === 'mathetrainer', 'Index: zwei Kinder mit eigener kindId, App gemerkt');
const i1 = await A.indexSichern(index, 0);
ok(i1.ok && i1.rev === 1, 'Index sichern (If-Match: 0) → rev 1');
const il = await A.indexLaden();
ok(il.ok && il.rev === 1 && il.daten.kinder[1].name === 'Tim', 'Index laden und entschlüsseln');
ok([...S.fam.get(fam.famId).blobs.values()].every((b) => /^[\w-]{16}\.[\w-]+$/.test(b.d)) && (await F.entschluesseln(S.fam.get(fam.famId).blobs.get('/index').d, fam.famKey, 'lernapps/v1/index')).kinder[1].name === 'Tim', 'Server sieht keine Spitznamen (Index nur verschlüsselt)');

// Stand je App und Kind, Konflikt zwischen zwei Geräten
const stand = { 'mathetrainer.v1': JSON.stringify({ xp: 4242, jahrgang: '8', stats: { Brüche: { ok: 9, bad: 1 } } }) };
const s1 = await A.standSichern('mathetrainer', lea.kindId, stand, 0);
ok(s1.ok && s1.rev === 1, 'Stand von Lea sichern → rev 1');
const B = F.familie(F.familieLesen(link), { f: S.f });   // zweites Gerät über den Familien-Link
const sl = await B.standLaden('mathetrainer', lea.kindId);
ok(sl.ok && JSON.parse(sl.daten['mathetrainer.v1']).xp === 4242 && sl.rev === 1 && /^\d{4}-\d{2}-\d{2}T/.test(sl.stand), 'Zweites Gerät lädt Leas Stand über den Familien-Link');
ok((await B.standLaden('mathetrainer', tim.kindId)).grund === 'keine', 'Stand eines anderen Kindes gibt es noch nicht (404)');
const s2 = await B.standSichern('mathetrainer', lea.kindId, { ...stand, 'mathetrainer.look': 'dunkel' }, 1);
ok(s2.ok && s2.rev === 2, 'Zweites Gerät sichert mit rev 1 → rev 2');
const s3 = await A.standSichern('mathetrainer', lea.kindId, { ...stand, extra: 1 }, 1);
ok(!s3.ok && s3.grund === 'konflikt' && s3.rev === 2 && s3.daten['mathetrainer.look'] === 'dunkel', 'Veraltetes rev → 409 mit aktuellem Stand zum Zusammenführen (nie still überschreiben)');
const blobs = JSON.stringify([...S.fam.get(fam.famId).blobs.values()]);
ok(!/Brüche|mathetrainer\.v1|"xp"/.test(blobs) && [...S.fam.get(fam.famId).blobs.values()].every((b) => /^[\w-]{16}\.[\w-]+$/.test(b.d)), 'Server sieht keinen Klartext der Stände (nur „<iv>.<ct>“ in base64url)');   // nur Zeichen prüfen, die in base64url nicht vorkommen können

// Schlüssel je App und Kind getrennt: Blob von Lea lässt sich nicht als Tims Blob lesen
const leaBlob = S.fam.get(fam.famId).blobs.get(`/s/mathetrainer/${lea.kindId}`).d;
let getrennt = false; try { await F.entschluesseln(leaBlob, fam.famKey, `lernapps/v1/mathetrainer/${tim.kindId}`); } catch { getrennt = true; }
ok(getrennt, 'Eigener Schlüssel je App und Kind (HKDF-info)');
const fremd = F.familie({ ...fam, famKey: F.b64url(crypto.getRandomValues(new Uint8Array(32))) }, { f: S.f });
ok((await fremd.standLaden('mathetrainer', lea.kindId)).grund === 'schluessel', 'Falscher Familien-Schlüssel: „schluessel“, kein Absturz');
const ohneRecht = F.familie({ ...fam, schreib: F.b64url(crypto.getRandomValues(new Uint8Array(16))) }, { f: S.f });
ok((await ohneRecht.standSichern('mathetrainer', lea.kindId, stand, 2)).grund === 'schreibrecht', 'Ohne Schreibrecht: 403 „schreibrecht“');

// ohne gzip gepackt bleibt lesbar; gzip-Blob ist kleiner
const gross = { daten: 'abc'.repeat(3000) };
const mitZ = await F.packen(gross), ohneZ = await F.packen(gross, { gzip: false });
ok(String.fromCharCode(mitZ[0]) === 'z' && String.fromCharCode(ohneZ[0]) === 'j' && mitZ.length < ohneZ.length / 10, 'Packen: „z“ = gzip (deutlich kleiner), „j“ = JSON');
ok(JSON.stringify(await F.auspacken(ohneZ)) === JSON.stringify(gross) && JSON.stringify(await F.auspacken(mitZ)) === JSON.stringify(gross), 'Beide Formate lesbar');

// Liste, Rechte, Einlösen, Protokoll, Löschen
const li = await A.liste();
ok(li.ok && li.daten.blobs.length === 2 && li.daten.blobs.some((b) => b.pfad === `/s/mathetrainer/${lea.kindId}` && b.rev === 2), 'Liste: rev aller Blobs');
const ein = await A.einloesen(' mt-ab23-cd45-ef67 ');
ok(ein.ok && /^M\.[0-9a-f]{16}$/.test(ein.daten.recht.codeNr) && (await A.rechte()).daten.rechte[0].codeNr === ein.daten.recht.codeNr, 'Code einlösen → { rechte, recht } mit recht.codeNr');
ok((await A.einloesen('XY-UNSINN')).grund === 'code-unbekannt', 'Einlösen: unbekannter Code → „code-unbekannt“');
const famX = F.neueFamilie(), X = F.familie(famX, { f: S.f }); await X.anlegen(testPub);
ok((await X.einloesen('MT-AB23-CD45-EF67')).grund === 'code-vergeben', 'Einlösen: an andere Familie gebunden → „code-vergeben“');
GESPERRT.push(await F.codeNummer('MT-ZZ22-ZZ22-ZZ22'));
ok((await X.einloesen('MT-ZZ22-ZZ22-ZZ22')).grund === 'code-gesperrt' && (await ohneRecht.einloesen('MT-AB23-CD45-EF67')).grund === 'schreibrecht', 'Einlösen: gesperrt → „code-gesperrt“, ohne Schreibrecht → „schreibrecht“ (beide 403, am Fehlertext unterschieden)');
await X.loeschen();
ok((await A.protokoll()).ok, 'Protokoll abrufbar');
ok(!(await ohneRecht.loeschen()).ok && S.fam.has(fam.famId), 'Löschen ohne Schreibrecht: nichts gelöscht');
ok((await A.loeschen()).ok && !S.fam.has(fam.famId), 'Löschknopf: Familie samt Notfall-Kopie weg');
ok((await A.indexLaden()).grund === 'keine', 'Nach dem Löschen: nichts mehr da');
ok((await F.familie(fam, { f: async () => { throw new Error('offline'); } }).liste()).grund === 'netz', 'Offline: „netz“, kein Absturz');
let ungueltig = false; try { F.familie({ famId: 'x', famKey: 'y', schreib: 'z' }); } catch { ungueltig = true; }
ok(ungueltig && (await A.standLaden('../x', lea.kindId)).grund === 'ungueltig', 'Ungültige Familie bzw. App-Name abgewiesen');
ok(/Familien-Nummer: /.test(F.notfallBlatt(fam, 'mathetrainer').text), 'Notfall-Blatt mit Familien-Nummer und Link');

const S2 = server(), mem = new Map(), sp = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v) };
// Code-Nummern wie der Server (ops/trainer-api/server.mjs): MT-Zugang und Lern-App-Code
const mtNr = `M.${NC.createHash('sha256').update('MTAB23CD45EF67').digest('hex').slice(0, 16)}`;
ok(await F.codeNummer(' mt-ab23-cd45-ef67 ') === mtNr && await F.codeNummer('MT AB23 CD45 EF67') === mtNr, `Code-Nummer MT: „M.<16 Hex>“ von sha256(codeNorm) (${mtNr})`);
const CR = '0123456789ABCDEFGHJKMNPQRSTVWXYZ', crock = (bytes) => { let out = '', p = 0, b = 0; for (const x of bytes) { p = (p << 8) | x; b += 8; while (b >= 5) { out += CR[(p >> (b - 5)) & 31]; b -= 5; p &= (1 << b) - 1; } } if (b) out += CR[(p << (5 - b)) & 31]; return out; };
const inhalt = [1, 5, 4, 0x00, 0x01, 0xE2, 0x40, 0x0B, 0xB8], lp = crock([...inhalt, ...new Array(64).fill(7)]);
ok(await F.codeNummer(`MT-${lp}`) === 'L5.4.123456' && await F.codeNummer(lp.toLowerCase()) === 'L5.4.123456', 'Code-Nummer Lern-App: „L<app>.<produkt>.<serie>“, serie dezimal (123456), mit Präfix und klein geschrieben');
ok(await F.codeNummer('KF-ZZZZ') === '' && await F.codeNummer('') === '', 'Unbekannter Code → leere Code-Nummer');
const sperrSrv = async (u) => (/\/familie\/v1\/sperrliste$/.test(u) ? { ok: true, status: 200, json: async () => ({ sperrliste: [NC.createHash('sha256').update('M.' + NC.createHash('sha256').update('MTGESPERRT2222').digest('hex').slice(0, 16)).digest('base64url'), NC.createHash('sha256').update('L5.4.123456').digest('base64url'), 'kaputt'] }) } : { ok: false, status: 404 });
const sperr = await F.sperrlisteLaden({ f: sperrSrv, speicher: sp, schluessel: 'mathetrainer.sperrliste' });
ok(sperr.ok && sperr.anzahl === 2, 'Sperrliste { sperrliste: [SHA-256(codeNr)] } geladen, ungültige Einträge verworfen, im Gerät gespeichert');
const gs = (c) => F.codeGesperrt(c, { speicher: sp, schluessel: 'mathetrainer.sperrliste' });
ok(await gs(' mt-gesp-errt-2222 ') && await gs(`RB-${lp}`) && await gs('L5.4.123456') && !(await gs('MT-AB23-CD45-EF67')) && !(await gs('L5.4.123457')), 'Offline-Prüfung: gesperrt per Code oder Code-Nummer erkannt, andere nicht');
ok((await F.sperrlisteLaden({ f: async () => { throw new Error('offline'); }, speicher: sp, schluessel: 'mathetrainer.sperrliste' })).grund === 'netz' && await gs('L5.4.123456'), 'Offline: alte Sperrliste bleibt gültig');
const fam2 = F.neueFamilie(), C = F.familie(fam2, { f: S2.f }); await C.anlegen(testPub);
const gid = F.geraetKindId('tablet 1');
ok(gid === 'geraet-tablet1' && (await C.standSichern('mathetrainer', gid, { look: 'dunkel' }, 0)).ok && (await C.standLaden('mathetrainer', gid)).daten.look === 'dunkel', 'Gerätedaten unter kindId „geraet-<id>“');

console.log(fehler ? `${fehler} Fehler` : `familie: ${n} Prüfungen bestanden`);
if (fehler) process.exit(1);
