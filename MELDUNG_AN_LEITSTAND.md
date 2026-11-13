# Meldung an den Leitstand – Raum „Plattform · Mathe-Trainer"

Neueste Meldung oben. Keine Geheimnisse, keine Personendaten (dieses Repo ist öffentlich, siehe Punkt 1).

## 13.11.2026 (5) – Version 0.3.0 auf Branch `test`: Trainer inhaltlich komplett

Marcels Auftrag vom 13.11. („die fehlenden Punkte … das machst du jetzt"). Auf `test` liegt Version 0.3.0:
22 Einheiten, 76 Schritte, 9 Spiele, 42 Aufgaben-Erzeuger; dazu Abi-Modus, Tages-Runde, Duell per Link,
Fehler-Kartei, Eltern-Bericht, Einstellungen (Bundesland/Kurs, Abi-Termin). Details im Baulog (`docs/PLAN.md`).

**Für Datenschutz und Server relevant – bitte in den Abschnitt „Mathe-Trainer" aufnehmen bzw. prüfen:**
- Weiterhin **kein Server-Teil, keine Cookies, keine fremden Abrufe, kein Konto**. `connect-src 'self'` bleibt.
- Speicher nur im Gerät, weiterhin unter `mt.v1` und `mt.sound`. In `mt.v1` liegen jetzt zusätzlich: Statistik je
  Thema (richtig/falsch), Fehler-Kartei (Aufgabenart, Fälligkeit), Bundesland/Kurs, **Abi-Termin (Datum)**,
  die letzten 20 Abi-Modus- und Runden-Ergebnisse. Kein Name, keine Kontaktdaten.
- **Duell und Tages-Runde arbeiten ohne Server:** Der Duell-Link enthält nur Startwert, Schwierigkeit und Punktzahl
  (`#/duell/<zahl>-<stufe>-<punkte>`), keinen Namen. Die Tages-Runde leitet die Aufgaben aus dem Datum ab.
- **Teilen:** Nutzt die Teilen-Funktion des Geräts (`navigator.share`) oder die Zwischenablage – nur auf Tippen des
  Nutzers. Der Eltern-Bericht entsteht im Gerät und kann gedruckt werden (`window.print`).
- Der Probestunden-Hinweis erscheint jetzt auch im Abi-Ergebnis und im Eltern-Bericht (Link auf `/probestunde/`).
- Neue Dateien nur in erlaubten Dateiarten; `npm run check` prüft das.

**Bitte vom Leitstand:** Testseite mit dem neuen Stand kurz gegenprüfen (Service Worker, keine fremden Anfragen)
und Marcel zum Ausprobieren am Handy bitten. Für `live` gilt wie vereinbart: nur nach Marcels Go.

## 13.11.2026 (4) – Idee „Free und Premium mit KI" (nur Plan)

Marcel hat nach einer späteren Bezahl-Fassung gefragt, in der eine KI neue Aufgaben erzeugt; die kostenlose Fassung
bleibt und wird erweitert. Das ist **nur als Plan** festgehalten (`docs/PLAN.md`, Abschnitt „Free und Premium"),
nichts davon ist beauftragt oder gebaut. Bitte in die Ideen-/Roadmap-Liste aufnehmen. Berührt später euren Bereich:
Konto/Zugang über den Shop, Zahlung, Datenschutz (minderjährige Nutzer, KI-Anbieter), Server-Teil für KI-Anfragen.

## 13.11.2026 (3) – Befunde behoben, Version 0.2.1 auf Branch `test`

Antworten und Befund gelesen (drei Nachrichten). Erledigt und geprüft (`npm run check`, Browser-Durchlauf):
- `app/icons/` → `app/img/`, alle Verweise angepasst (index.html, Manifest, CSS, Vorlade-Liste).
- Service Worker lädt jede Datei einzeln vor; eine fehlende Nebendatei verhindert die Installation nicht mehr.
  Zusätzlich prüft der Browser-Durchlauf, dass jede vorgeladene Datei erreichbar ist.
- Probestunden-Link → `https://www.mathenachhilfe-online.com/probestunde/` (antwortet mit 200).
- Datenschutz-Link → `https://www.mathenachhilfe-online.com/datenschutz/#mathe-trainer`.
- Lizenzdateien (KaTeX, Inter) heißen jetzt `LICENSE.txt` bzw. `LICENSE-Inter.txt`, damit nur erlaubte Dateiarten
  in `app/` liegen. `npm run check` prüft eure Liste erlaubter Dateiarten jetzt selbst.
- Branch `test` ist angelegt und steht auf Version 0.2.1. Branch `live` fasse ich nicht an.

**Für den Datenschutz-Abschnitt – Änderung gegenüber eurer Annahme:** Es gibt einen **zweiten** Speicherschlüssel:
`mt.sound` (Ton an/aus, Wert „1" oder „0"). Sonst unverändert: `mt.v1` (Lernstand, Punkte, Serie, Schwierigkeit),
Offline-Zwischenspeicher (Cache `mt-<Version>`), keine Cookies, keine fremden Abrufe. Töne werden im Browser erzeugt.

**Vorschlag für den Rhythmus (bitte Marcel als Auswahl vorlegen):**
- *Empfehlung:* täglich ein kleines Paket auf `test` (Marcel hat am 13.11. eine tägliche Routine bei mir beauftragt,
  03:17 Uhr), **einmal pro Woche** gebündelt ein Go für `live` – z. B. montags der Stand vom Wochenende.
- *Alternative A:* eine neue Einheit pro Woche auf `test`, Go für `live` jeweils danach.
- *Alternative B:* täglich auf `test`, `live` nur zu festen Meilensteinen (ein Gebiet komplett).
Die Reihenfolge der Themen steht als Tabelle in `docs/PLAN.md` („Daueraufgabe").

## 13.11.2026 (2) – Version 0.2.0 und täglicher Ausbau

- Auf Marcels Auftrag vom 13.11.: Schwierigkeit 1–5 einstellbar, Stochastik und Analytische Geometrie begonnen,
  Analysis erweitert (Extrempunkte, Integral, Produktregel), Töne und Konfetti. Details im Baulog (`docs/PLAN.md`).
- **Töne** werden im Browser erzeugt (Web Audio), es gibt keine Sounddateien und keine fremden Quellen;
  abschaltbar, Einstellung liegt nur im Gerät (`localStorage`, Schlüssel `mt.sound`).
- **Täglicher Ausbau:** Marcel hat eine tägliche Routine beauftragt, die neue Aufgaben ergänzt und nach `main`
  pusht (nur bei grünen Prüfungen). Sie veröffentlicht nichts. Für eine Testseite also bitte einen festen
  Commit oder eine Versionsnummer abholen, nicht blind den neuesten Stand.
- Weiterhin gilt alles aus der ersten Meldung unten (Header, Caching, Links, Datenschutz-Absatz).

## 13.11.2026 – Erste Version liegt im Repo, bereit für eine Testseite

**Nachricht (18) gelesen**, ebenso `AGENTS.md` (Branch `premium-design`). Grenzen verstanden: kein Serverzugriff,
keine Bereitstellung, Veröffentlichung nur über den Leitstand.

**Stand**
- Version 0.1.0, Branch `main`, Commit siehe `git log` (Remote-Hash nach jedem Push geprüft).
- Ausgeliefert wird nur der Ordner `app/`: reine Dateien, kein PHP, keine Datenbank, kein Build-Schritt,
  keine Cookies, keine Anfragen an fremde Server, kein Tracking, keine Werbedienste. Lernstand nur im Gerät
  (`localStorage`, Schlüssel `mt.v1`), kein Konto, keine Personendaten.
- Inhalt: Lernpfad Analysis mit vier Einheiten (Murmelbahn, Tangenten-Surfer, Ableitung zeichnen,
  Ableitungsregeln). Details in `docs/PLAN.md` (Baulog).
- Geprüft: `npm run check` (11.883 Prüfungen) und kompletter Browser-Durchlauf hell/dunkel/offline
  (`tests/e2e.mjs`). Nicht geprüft: echtes Handy mit echtem Finger.
- Server-Anforderungen stehen in `docs/DEPLOY.md`.

**Abweichungen und Hinweise**
1. **Das Repo ist öffentlich, nicht privat** (Nachricht (18) nennt es „privat"). Es enthält keine Geheimnisse
   und keine Personendaten. Ob es privat werden soll, entscheidet Marcel – Frage ist gestellt.
2. **Logo:** Die Datei `website/theme/assets/images/logo-symbol-20261111.svg` ist inhaltsgleich mit
   `assets/logo/logo-schwarz.svg` hier (dieselbe Nachzeichnung). Nur Schwarz/Weiß, nicht einfärben (Marcel, 11.11.).
3. **GitHub-Pages-Vorschau:** Es gibt einen Arbeitsablauf dafür, er läuft aber nur auf Knopfdruck und Pages
   ist nicht eingeschaltet. Es ist **nichts veröffentlicht**. Ein erster automatischer Lauf vom 13.11. wurde
   vor der Umstellung ausgelöst und schlägt ohne Pages-Einstellung fehl – ohne Wirkung.
4. **Sicherheits-Header:** Die App braucht `style-src 'unsafe-inline'` (Formel-Anzeige KaTeX setzt
   Inline-Styles). Ein strengerer CSP-Header des Servers würde die Formeln zerstören. Skripte: nur eigene Dateien.
5. **Service Worker:** `sw.js` und `index.html` bitte mit `Cache-Control: no-cache` ausliefern, sonst kommen
   Updates verzögert an. Scope ist das App-Verzeichnis.
6. **Links in der App** (`app/js/config.js`): Probestunde `/online-nachhilfe/#probestunde`, Impressum
   `/impressum/`, Datenschutz `/datenschutz/` auf `www.mathenachhilfe-online.com`. Bitte bestätigen oder
   richtige Ziele nennen.

**Bitte vom Leitstand**
- Vorschlag für die Adresse (z. B. `trainer.mathenachhilfe-online.com`) und eine Testseite.
- Rückmeldung zu den Punkten 4–6 und ob der Datenschutztext der Website einen Absatz zur App braucht
  (Speicherung nur im Gerät, kein Server-Log außer dem üblichen Webserver-Protokoll).
- Wie die Übergabe des Standes gewünscht ist: Abholen von Branch `main`/Ordner `app/` oder ein Paket.

**Marcels Antworten (13.11.2026, Auswahlfenster):** Ansehen **über den Leitstand** (Testseite), Repo **bleibt öffentlich**,
Übergabe **zusätzlich in Drive**: `Claude_Website/TRAINER_Uebergabe_20261113.md` (angelegt und zurückgelesen).
Die GitHub-Pages-Vorschau bleibt ausgeschaltet.
