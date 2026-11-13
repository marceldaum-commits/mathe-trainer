# Mathe-Trainer

Kostenloses Lernspiel für Oberstufen-Mathe (zuerst Analysis, Bayern und Hessen) – als Web-App fürs Handy,
installierbar und offline nutzbar. Von Mathenachhilfe Online.

- **Plan:** [docs/PLAN.md](docs/PLAN.md) · **Recherche:** [docs/RECHERCHE.md](docs/RECHERCHE.md) · **Online stellen:** [docs/DEPLOY.md](docs/DEPLOY.md)
- **Die App** liegt komplett im Ordner `app/` (reine Dateien, kein Build-Schritt, keine Datenbank).

## Entwickeln

```bash
npm start
```

öffnet die App unter http://localhost:8123.

```bash
npm run check
```

prüft die Dateiliste des Service Workers, die Versionsnummer und alle Aufgaben-Erzeuger und Spiel-Logik.

```bash
node tests/e2e.mjs
```

spielt die ganze App im Handy-Browser durch (braucht Playwright und die laufende App).

Nach Änderungen an Dateien in `app/`: `VERSION` in `app/js/config.js` erhöhen und `npm run fix` ausführen –
nur dann bekommen installierte Apps das Update.

## Aufbau

| Ort | Inhalt |
| --- | --- |
| `app/js/units.js` | Lernpfad: Einheiten und Schritte (entdecken → benennen → Brücke → festigen) |
| `app/js/games/` | Spiele: Murmelbahn, Tangenten-Surfer, Ableitung zeichnen, Graphen-Paare |
| `app/js/gen.js` | Aufgaben-Erzeuger mit Fehler-Diagnose |
| `app/js/quiz.js` | Aufgaben-Runde und Erklär-Karten |
| `app/js/plot.js` | Zeichenfläche für Graphen |
| `app/js/store.js` | Fortschritt (nur auf dem Gerät) |
| `app/vendor/katex` | Formel-Anzeige (KaTeX, MIT-Lizenz) |
