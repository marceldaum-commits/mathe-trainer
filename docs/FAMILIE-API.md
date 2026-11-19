# familie.js – öffentliche Schnittstelle (Familien-Speicher aller Lern-Apps)

Stand 19.11.2026, passend zum Bauplan v1.2 (AppZentrale). Datei: `app/js/familie.js`. Sie hat keine Abhängigkeiten und kann 1:1 kopiert werden.
Alle Netz-Funktionen **werfen nie**: Sie liefern `{ ok: true, … }` oder `{ ok: false, grund }`.

**Gründe für `ok: false`:**

| grund | bedeutet |
| --- | --- |
| `netz` | offline |
| `keine` | 404 |
| `konflikt` | 409 |
| `schreibrecht` | 403 |
| `zu-gross` | 413 |
| `zu-oft` | 429 |
| `schluessel` | entschlüsseln fehlgeschlagen oder falscher Blob |
| `ungueltig` | falscher App-Name oder falsche kindId |
| `fehler` | alles andere |

## Familie und Link
| Funktion | Rückgabe |
| --- | --- |
| `neueFamilie()` | `{ famId, famKey, schreib }` (base64url; 16/32/16 Byte) |
| `familieLink(fam, app, basis?)` | `https://lernen.mathenachhilfe-online.com/<app>/#familie=<famId>.<famKey>.<schreib>` |
| `familieLesen(textOderHash)` | `{ famId, famKey, schreib }` oder `null`. Ein angehängtes `&…` ist erlaubt. |
| `familienNummer(famId)` | `"XXXX-XXXX"` (erste 8 Zeichen, zum Finden bei der Wiederherstellung) |
| `notfallBlatt(fam, app, basis?)` | `{ link, nummer, text }` – den QR erzeugt die App aus `link` |
| `neueKindId()` | 16 Byte base64url (22 Zeichen) |
| `geraetKindId(id)` | `"geraet-<id>"` für Gerätedaten |

## Index (Kinder, Apps)
| Funktion | Rückgabe |
| --- | --- |
| `neuerIndex()` | `{ v: 1, kinder: [], apps: [] }` |
| `kindHinzu(index, { name, klasse, farbe })` | `{ index, kind }` mit `kind = { kindId, name, klasse, farbe }` |
| `appMerken(index, app)` | Index mit `app` in `apps` |

## Zugang zum Server: `const fa = familie(fam, { basis, f })`
`basis` ist `''` (gleiche Herkunft) oder z. B. `'https://trainer-test.mathenachhilfe-online.com'`. `f` ist fetch und für Tests austauschbar.

| Aufruf | Rückgabe |
| --- | --- |
| `fa.anlegen(wiederherstellPub)` | `{ ok }` – PUT mit Notfall-Kopie (öffentlicher Schlüssel: 32 Byte base64url) |
| `fa.indexLaden()` | `{ ok, daten: index, rev, t }` |
| `fa.indexSichern(index, rev)` | `{ ok, rev }`, bei Konflikt `{ ok: false, grund: 'konflikt', daten, rev }` |
| `fa.standLaden(app, kindId)` | `{ ok, daten, stand, rev, t }` – `daten` im App-Format, `stand` als ISO-Zeit des Sicherns |
| `fa.standSichern(app, kindId, daten, rev)` | `{ ok, rev }`, bei Konflikt `{ ok: false, grund: 'konflikt', daten, stand, rev }`. Die App führt zusammen und sichert mit dem neuen `rev` erneut; nie still überschreiben. Neu: `rev = 0`. |
| `fa.liste()` | `{ ok, daten: { blobs: [{ pfad, rev, t }] } }` |
| `fa.rechte()` | `{ ok, daten: { rechte: [...] } }` |
| `fa.einloesen(code)` | `{ ok, daten: { rechte } }` – nur hinter dem Eltern-Tor aufrufen |
| `fa.protokoll()` | `{ ok, daten: { eintraege: [...] } }` |
| `fa.loeschen()` | `{ ok }` – löscht alles inklusive Notfall-Kopie |
| `fa.nummer`, `fa.link(app)` | Familien-Nummer, Familien-Link |

## Sperrliste (gesperrte bzw. erstattete Codes)
| Funktion | Rückgabe |
| --- | --- |
| `sperrlisteLaden({ basis, f, speicher, schluessel })` | `{ ok, anzahl }`. Lädt `GET /familie/v1/sperrliste` und speichert sie im Gerät unter `schluessel` (z. B. `"<app>.sperrliste"`). Bei Fehlern bleibt die alte Liste gültig. |
| `codeGesperrt(code, { speicher, schluessel })` | `true`/`false`, funktioniert offline. Vor jeder Offline-Prüfung eines Codes fragen. |
| `codeHash(code)` | SHA-256 von `code.trim().toUpperCase()`, base64url |

## Technik (für einen Kotlin-Port)
- **Blob-Schlüssel:** `HKDF-SHA256(famKey, salt = 32 Nullbytes, info = "lernapps/v1/<app>/<kindId>")`; für den Index `info = "lernapps/v1/index"`.
- **Verschlüsselung:** AES-GCM-256 mit 12-Byte-IV. Body `text/plain` `"<iv>.<ct>"` (base64url).
- **Klartext:** erstes Zeichen `z` = gzip(JSON) oder `j` = JSON. Lesen müssen beide können.
- **Stand-JSON:** `{ app, v: 1, kind, stand, daten }`. Rechte stehen nie im Kind-Blob.
- **Notfall-Kopie:**
  - `eph` = neues X25519-Paar; `geteilt = X25519(eph.priv, pub)`.
  - `k = HKDF-SHA256(geteilt, salt = eph.pub ‖ pub, info = "lernapps/v1/notfall")`.
  - Kopie = `"<eph.pub>.<iv>.<AES-GCM(k, famKey)>"`.
  - Das Gegenstück `notfallOeffnen(kopie, priv)` ist nur für das Werkzeug des Leitstands.
- **Server-Antworten:**
  - GET-Blob `{ d, rev, t }`; PUT mit `If-Match: <rev>` → `{ rev }`.
  - 409 → `{ rev, d, t }`; 403 bei falschem `X-Schreib`; 404 = nicht vorhanden.
- **Tests:** `node tests/familie.mjs` mit nachgebautem Server und RFC-7748-Vektoren.
