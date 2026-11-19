# familie.js – öffentliche Schnittstelle (Familien-Speicher aller Lern-Apps)

Stand 19.11.2026, passend zu `ops/familie/SCHNITTSTELLE.md` (Leitstand, verbindlich) und Bauplan v1.4. Datei: `app/js/familie.js`. Sie hat keine Abhängigkeiten und kann 1:1 kopiert werden.
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
| `gibt-es-schon` | Familie existiert schon (anlegen) |
| `code-unbekannt`, `code-gesperrt`, `code-vergeben` | Einlösen |
| `noch-nicht-live` | Server auf live noch gesperrt |
| `fehler` | alles andere |

## Familie und Link
| Funktion | Rückgabe |
| --- | --- |
| `neueFamilie()` | `{ famId, famKey, schreib }` (base64url; 16/32/16 Byte) |
| `familieLink(fam, app, basis?)` | `https://lernen.mathenachhilfe-online.com/<app>/#familie=<famId>.<famKey>.<schreib>` |
| `familieLesen(textOderHash)` | `{ famId, famKey, schreib }` oder `null`. Ein angehängtes `&…` ist erlaubt. |
| `familienNummer(famId)` | `"XXXX-XXXX"`: erste 5 Byte der famId in Crockford-Base32 (groß, ohne I/L/O/U), zum Vorlesen am Telefon |
| `nummerNormal(text)` | Eingabe normalisiert wie der Server (ohne Bindestrich, groß, O→0, I/L→1) |
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
| `fa.anlegen(pub = REC_PUB)` | `{ ok }` (201). PUT mit Notfall-Kopie und Header `X-Notfall-Pruef`. Standard ist der feste Wiederherstellungs-Schlüssel `REC_PUB`. |
| `fa.indexLaden()` | `{ ok, daten: index, rev, t }` |
| `fa.indexSichern(index, rev)` | `{ ok, rev }`, bei Konflikt `{ ok: false, grund: 'konflikt', daten, rev }` |
| `fa.standLaden(app, kindId)` | `{ ok, daten, stand, rev, t }` – `daten` im App-Format, `stand` als ISO-Zeit des Sicherns |
| `fa.standSichern(app, kindId, daten, rev)` | `{ ok, rev }`, bei Konflikt `{ ok: false, grund: 'konflikt', daten, stand, rev }`. Die App führt zusammen und sichert mit dem neuen `rev` erneut; nie still überschreiben. Neu: `rev = 0`. |
| `fa.liste()` | `{ ok, daten: { blobs: [{ pfad, rev, t }] } }` |
| `fa.rechte()` | `{ ok, daten: { rechte: [...] } }` |
| `fa.einloesen(code)` | `{ ok, daten: { rechte, recht } }` mit `recht.codeNr`, nur hinter dem Eltern-Tor. Fehler: `code-unbekannt`, `code-gesperrt`, `code-vergeben`, `schreibrecht` |
| `fa.protokoll()` | `{ ok, daten: { eintraege: [...] } }` |
| `fa.loeschen()` | `{ ok }` – löscht alles inklusive Notfall-Kopie |
| `fa.nummer`, `fa.link(app)` | Familien-Nummer, Familien-Link |

## Sperrliste (gesperrte bzw. erstattete Codes)
| Funktion | Rückgabe |
| --- | --- |
| `sperrlisteLaden({ basis, f, speicher, schluessel })` | `{ ok, anzahl }`. Lädt `GET /familie/v1/sperrliste` → `{ sperrliste: [base64url(SHA-256(codeNr))] }` und speichert sie unter `schluessel` (z. B. `"<app>.sperrliste"`). Bei Fehlern bleibt die alte Liste gültig. |
| `codeGesperrt(codeOderNr, { speicher, schluessel })` | `true`/`false`, funktioniert offline. Nimmt einen Code (MT-… oder Lern-App-Code) oder direkt eine Code-Nummer. |
| `codeNummer(code)` | Code-Nummer wie beim Server: `"M.<erste 16 Hex von sha256(codeNorm)>"` für MT-Zugänge, `"L<app>.<produkt>.<serie>"` (serie dezimal) für Lern-App-Codes. Die Signatur prüft die App selbst; unbekannt → `''`. |
| `codeNrHash(codeNr)` | base64url(SHA-256(codeNr)) |

## Konstanten und Prüfwerte
| Name | Inhalt |
| --- | --- |
| `REC_PUB` | öffentlicher Wiederherstellungs-Schlüssel (X25519, 32 B), erzeugt von Marcel am 19.11.2026 |
| `notfallPruef(famKey)` | Wert für `X-Notfall-Pruef`: base64url(SHA-256(HKDF-SHA256(famKey, salt leer, info "lernapps/v1/notfall-pruef", 32 B))) |

## Technik (für einen Kotlin-Port)
- **Blob-Schlüssel:** `HKDF-SHA256(famKey, salt leer (= 32 Nullbytes nach RFC 5869), info = "lernapps/v1/<app>/<kindId>")`; für den Index `info = "lernapps/v1/index"`.
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
