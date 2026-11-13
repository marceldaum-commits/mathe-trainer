# Online stellen

Stand: 13.11.2026. Die App ist fertig zum Ausliefern. **Veröffentlicht wird nur über den Leitstand**
(Chat „Nachhilfe Online – Premium-Design"): Testseite → Marcels Go → live. Dieser Raum hat keinen Serverzugriff.
Meldungen an den Leitstand stehen in `MELDUNG_AN_LEITSTAND.md`.

## Was ausgeliefert wird

Nur der Ordner `app/`. Reine Dateien: HTML, CSS, JavaScript, Schriften, Bilder.
Kein PHP, keine Datenbank, kein Build-Schritt, keine Cookies, keine Anfragen an fremde Server.

## Was der Server können muss

- **HTTPS** (Pflicht für die Installation als App und den Offline-Betrieb).
- Eigene Adresse, am besten eine **Subdomain** (z. B. `lernen.…` oder `trainer.…`), getrennt von WordPress.
  Ein Unterordner geht auch – alle Pfade in der App sind relativ.
- `manifest.webmanifest` mit Content-Type `application/manifest+json` (oder `application/json`).
- `.woff2` als `font/woff2`, `.svg` als `image/svg+xml`, `.js` als `text/javascript`.
- **Caching:** `sw.js` und `index.html` nicht lange cachen (`Cache-Control: no-cache`), sonst kommen Updates
  verzögert an. Alles andere darf lange gecacht werden.
- **Sicherheits-Header:** Die App bringt eine eigene Content-Security-Policy mit (nur eigene Quellen;
  Inline-Styles sind für die Formel-Anzeige nötig). Ein strengerer Server-Header ohne
  `style-src 'unsafe-inline'` würde die Formeln zerstören.

## Wege (mit dem Leitstand abgestimmt, 13.11.2026)

| Branch | Ziel | Wer setzt ihn |
| --- | --- | --- |
| `main` | Arbeitsstand, wird nirgends ausgeliefert | dieser Raum |
| `test` | `trainer-test.mathenachhilfe-online.com` (noindex), wird automatisch abgeholt | dieser Raum, nach grünen Prüfungen |
| `live` | `trainer.mathenachhilfe-online.com` | **nur nach Marcels Go über den Leitstand** – nie von diesem Raum |

Der Server prüft `app/` auf erlaubte Dateiarten (html, css, js, mjs, json, webmanifest, svg, png, jpg, webp, ico,
woff2, txt; kein php/htaccess, keine Symlinks, unter 50 MB) und schaltet je Commit um. `npm run check` prüft
dieselbe Liste vorab. Der Ordnername `icons/` ist auf dem Server belegt – Bilder liegen in `app/img/`.

Die GitHub-Pages-Vorschau (`.github/workflows/pages.yml`) bleibt ausgeschaltet.

## Updates

`VERSION` in `app/js/config.js` erhöhen, `npm run fix`, pushen. Installierte Apps zeigen beim nächsten
Öffnen „Neue Version verfügbar".
