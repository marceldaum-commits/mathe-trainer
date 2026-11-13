# Meldung an den Leitstand – Raum „Plattform · Mathe-Trainer"

Neueste Meldung oben. Keine Geheimnisse, keine Personendaten (dieses Repo ist öffentlich, siehe Punkt 1).

## 13.11.2026 (14) – Version 0.9.1: Spiele ohne Scrollen, Knöpfe zur Website

Nur Gestaltung. Neue Links führen auf `www.mathenachhilfe-online.com` (Startseite) – wie bisher nur als normale Links, kein Abruf im Hintergrund.

## 13.11.2026 (13) – Version 0.9.0: Breitbild-Ansicht, Knopf immer sichtbar

Nur Gestaltung (CSS) und Tests. Keine neuen Speicher-Schlüssel, keine fremden Abrufe.

## 13.11.2026 (12) – Version 0.8.0: Bundesland-Schalter filtert nach Lehrplan

Abgleich mit den amtlichen Vorgaben (Bayern, Hessen GK/LK) in `docs/LEHRPLAN.md`. Für Hessen-Grundkurs werden
vier Themen als „nicht im Grundkurs“ markiert. Keine neuen Speicher-Schlüssel, keine fremden Abrufe. Neue
Adresse in der App: `#/lehrplan`. Für die Website interessant: Die Liste „Was noch fehlt“ zeigt, welche Themen
je Land als Nächstes kommen.

## 13.11.2026 (11) – Version 0.7.0: „Fehler melden“ braucht einen kleinen Server-Teil – bitte entscheiden und bauen

Marcels Auftrag: schwebender Knopf unten rechts mit Menü „Fehler melden“; die Meldungen sollen **als E-Mail an
Marcel gehen (Absender: die system@-Adresse)** und **automatisch beim Trainer-Raum ankommen**.

- App-Seite ist fertig und auf `test`. **Der Versand ist aus** (`CONFIG.melden` leer): Die App macht weiterhin
  keine einzige Anfrage an `/api`. Meldungen warten im Gerät (im vorhandenen Schlüssel `mt.v1`, kein neuer
  Speicher-Schlüssel) und werden nachgereicht, sobald ihr den Versand freigebt.
- **Von euch gebraucht:** `POST /api/meldung` (prüfen, bremsen, E-Mail senden, ablegen) und
  `GET /api/meldungen` mit Geheimnis für die tägliche Routine. Genaue Vorgabe: `docs/SERVER.md`, erster Abschnitt.
  Absender- und Empfänger-Adresse stehen nur auf dem Server, nicht im Repo.
- **Datenschutz:** neuer Abschnitt nötig (Zweck Fehlerbehebung, Freitext, keine Kennung). Text im Formular:
  „Bitte keine Namen oder Kontaktdaten eintragen.“
- Sonst neu in 0.7.0: freie Eingabe von Ergebnissen (nur App-Logik). Außerdem Marcels Fahrplan: drei Wochen
  täglicher großer Ausbau, Play Store später (siehe `docs/PLAN.md`, „Ausbau-Fahrplan“).

## 13.11.2026 (10) – Version 0.6.0: Grundlagen-Einheiten, Vierfeldertafel zum Ausfüllen, freies Üben

Marcels Auftrag: Grundlagen in jedem Gebiet und allgemeine Übungen. Einzelheiten im Baulog (`docs/PLAN.md`).
Für euch wichtig: **keine neuen Speicher-Schlüssel** (weiter nur `mt.v1`, `mt.sound`, `mt.look`), keine fremden
Abrufe, keine neuen Dateitypen; zwei neue Dateien (`app/js/gen3.js`, `app/js/games/tafel.js`) stehen in der
Liste des Service Workers. Neue Adressen innerhalb der App: `#/ueben/<gebiet>` und `#/ueben/<gebiet>-grund`.

## 13.11.2026 (9) – Version 0.5.1: Schwierigkeit wirkt jetzt in Spielen und Aufgaben

Marcel hat gemeldet, dass Stufe 5 dieselben Aufgaben zeigt. Stimmte für die Spiele (gleiche Level auf jeder
Stufe) und für fünf Aufgaben-Arten. Behoben, Einzelheiten im Baulog (`docs/PLAN.md`). Nur Inhalte und Tests
geändert: keine neuen Speicher-Schlüssel, keine fremden Abrufe, keine neuen Dateitypen.

## 13.11.2026 (8) – Version 0.5.0; Server-Teil und KI sind vorbereitet und brauchen eure Entscheidung

Marcels Auftrag: Abzeichen, Kombo/Blitz-Runde, Boss-Aufgaben und weitere Ideen ohne Server einbauen; die
Server-Ideen und die KI vorbereiten. Gebaut ist alles, was ohne Server geht (Baulog in `docs/PLAN.md`).

**Unverändert:** kein Server-Teil, keine Cookies, keine fremden Abrufe. `CONFIG.api` ist leer; damit macht die
App keine einzige Anfrage an `/api`, und die Klassen-Rangliste ist unsichtbar (im Browser-Test geprüft).

**Für den Datenschutz-Abschnitt (Gerätespeicher):** weiterhin `mt.v1`, `mt.sound`, `mt.look`. In `mt.v1` neu:
Abzeichen mit Datum, Zähler (Kombo, Boss, Blitz), gewählte Farbe, Wochen-Ziel (aktive Tage der Woche).
**Erfolgskarte:** ein Bild, das im Gerät entsteht und nur auf Tippen geteilt oder gespeichert wird.

**Bitte entscheiden bzw. Marcel vorlegen (`docs/SERVER.md`, `docs/KI.md`):**
1. Wo läuft ein Server-Teil für Klassen-Rangliste (später Liga, Lehrer-Ansicht) – eigener Server unter
   `/api` auf der Trainer-Adresse oder ein Dienst wie Supabase? Wer baut und betreibt ihn?
2. Datenschutz: Spitznamen Minderjähriger in einer Klassen-Rangliste; Einwilligung für eine Lehrer-Ansicht.
3. KI (Premium): Schlüssel, Kostenbremse, Vertrag mit dem KI-Anbieter. Vorab ist nur Stufe P1 sinnvoll
   (Aufgaben erzeugen und nachrechnen, nichts geht an Schüler).
Die App-Seite ist fertig: Sobald es `/api` nach dem Vertrag in `docs/SERVER.md` gibt, reicht `api: '/api'`.

**Marcels Entscheidung (13.11.2026, Auswahlfenster):** Der Server-Teil läuft **über den Leitstand**. Dieser Raum
baut keinen Server und bindet keinen externen Dienst an; er wartet auf eure Vorgabe (Ort, Betreiber, Datenschutz).
Version 0.5.0 liegt auf `test` (Browser-Durchlauf grün, Testseite liefert 0.5.0 aus).

## 13.11.2026 (7) – Version 0.4.0: Menüführung

Auf Marcels Wunsch: untere Menüleiste (Start, Lernen, Prüfung, Mehr), kurze Startseite, Einheiten nach Gebiet.
Nur Oberfläche – keine Änderung an Speicher, Abrufen oder Dateiarten. Neue Adressen innerhalb der App
(alles hinter `#`): `#/lernen`, `#/g/<gebiet>`, `#/pruefung`, `#/mehr`.

## 13.11.2026 (6) – Version 0.3.1: Hell/Dunkel-Schalter, neuer Speicherschlüssel

Auf Marcels Wunsch („wie auf meiner Website") gibt es oben rechts den runden Mond/Sonne-Schalter mit derselben
Logik wie `nho-look`. **Für den Datenschutz-Abschnitt:** dritter Schlüssel im Gerät: `mt.look` (Wert „hell" oder
„dunkel"), wird nicht übertragen. Damit insgesamt: `mt.v1`, `mt.sound`, `mt.look`. Neue Datei `js/look.js` (lädt vor
dem Stylesheet, damit nichts aufblitzt; eigenes Skript, kein Inline-Skript – die CSP bleibt unverändert).

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
