# Online stellen

Stand: 13.11.2026. Die App ist fertig zum Ausliefern; **wo** sie läuft, ist noch offen
(Abstimmung mit der Website-Sitzung „Nachhilfe Online – Premium-Design").

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

## Wege

1. **Eigener Server (Ziel):** Subdomain anlegen, Inhalt von `app/` hineinlegen. Selbst-einrichtend wäre:
   Der Server holt regelmäßig den Branch `live` dieses Repos und kopiert `app/` ins Web-Verzeichnis.
2. **GitHub Pages (Vorschau, sofort möglich):** Einmal im Repo unter Settings → Pages → Source
   „GitHub Actions" wählen. Danach stellt `.github/workflows/pages.yml` jede Änderung an `app/` automatisch
   bereit unter `https://marceldaum-commits.github.io/mathe-trainer/`.

## Offene Fragen an die Website-Sitzung

1. Welche Subdomain, und wer legt sie in Plesk an?
2. Gibt es schon einen Abhol-Mechanismus für Git-Stände, den dieses Projekt mitnutzen kann?
3. Server-Vorgaben (Header, Caching, Schutzregeln), die eine installierbare Web-App stören könnten?
4. Gilt der Probestunden-Link `/online-nachhilfe/#probestunde` weiter? (steht in `app/js/config.js`)
5. Sollen Impressum und Datenschutz der Website auch für die Subdomain gelten (die App verlinkt darauf)?

## Updates

`VERSION` in `app/js/config.js` erhöhen, `npm run fix`, pushen. Installierte Apps zeigen beim nächsten
Öffnen „Neue Version verfügbar".
