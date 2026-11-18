# Meldung an den Leitstand – Raum „Plattform · Mathe-Trainer"

Neueste Meldung oben. Keine Geheimnisse, keine Personendaten (dieses Repo ist öffentlich, siehe Punkt 1).

## 18.11.2026 (108) – Korrekturen aus Ratgeber-Update 11 (mit 2.3.10)

1. **Freischalt-Link `#pro=CODE`: drin.**
   - Die App liest `#pro=` (neu) und `?pro=` (alte Mails) und entfernt den Code sofort per `history.replaceState` aus der Adresse.
   - Danach ist die Adresse `#/einstellungen`; der Code wird wie von Hand eingelöst (POST `/api/zugang`, Code nur im Body). Hinweis „Pro (+ KI) ist freigeschaltet“ bzw. was nicht passt.
   - **Test:** `tests/prolink.mjs` in Chromium und WebKit, 22/22. Er prüft: eingelöst, Code aus der Adresse weg, bei `#pro=` steht der Code in keiner Server-Adresse.
2. **iPhone/iPad, Code von Hand:** Das Code-Feld in den Einstellungen ist jetzt **immer** sichtbar, auch wenn der Server gerade nicht antwortet (vorher erst nach `/api/status → premium`). Dazu der Satz: „Auf iPhone und iPad hat die App vom Home-Bildschirm einen eigenen Speicher – dort den Code einfach noch einmal eingeben.“ Getestet mit `/api/status` = 503.
3. **Zählung ohne `sendBeacon`:** Der Mathe-Trainer nutzt `sendBeacon` nirgends. Eine Zählung gibt es bisher gar nicht (siehe 4).
4. **A3 (Zählung in der App) und C1 (Nachhilfe-Hinweis im Lernstand):**
   - **C1 ist drin:** „Bericht für Eltern“ (Lernstand) mit „Gratis Probestunde“, außerdem nach Runden mit vielen Fehlern, auf der Startseite, unter „Mehr“ und im Klassenarbeits-Trainer. Mathe heißt: immer.
   - **A3 fehlt noch:** Den Ratgeber (Teil 5/6) kann ich von hier nicht lesen; er ist weder im Mathe-Trainer-Repo noch über die Suche erreichbar. Bitte die Spezifikation von A3 schicken (Adresse, Felder, wann gezählt wird) – oder die Datei ins Repo legen. Ich baue es dann mit `fetch(…, { method: 'POST', credentials: 'omit', keepalive: true, headers: { 'Content-Type': 'text/plain' } })`.

## 18.11.2026 (107) – Version 2.3.10: Themen der gemeinsamen Liste

- **Kennungen:** Der Eltern-Bericht nutzt für `thema` jetzt nur noch Kennungen der gemeinsamen Liste.
  - **Oberstufe:** analysis, stochastik, vektoren, exponential-log, trigonometrie.
  - **Klasse 5–10** genauer nach Einheit: brueche, dezimalzahlen, prozent, negative-zahlen, teilbarkeit, runden, einheiten, dreisatz, zuordnungen, terme-gleichungen, lineare-funktionen, gleichungssysteme, quadratische-funktionen, potenzen-wurzeln, pythagoras, trigonometrie, geometrie, statistik, wahrscheinlichkeit, funktionen; sonst grundrechenarten.
- **Test** (`tests/run.mjs`): Jedes Aufgaben-Thema aller Erzeuger landet in einer Kennung der Liste; Stichproben je Klasse sind richtig zugeordnet.
- **2.3.9:** Mein e2e lief nach eurer Freigabe zu Ende, alle fünf Stufen grün. main = test = live = 75d1bd4.

## 18.11.2026 (106) – Themen-Roadmap festgeschrieben

`docs/THEMEN-ROADMAP.md` hält Marcels Entscheidung fest: 1 Einheit pro Woche (Mittwoch auf test), die letzte Woche im Monat ist Pflegewoche mit der Monatsprüfung nach `docs/PRUEFPLAN.md`, Oberstufe zuerst, Länder-Wahlthemen danach (bis dahin „Kommt bald“).

- **Kommender Mittwoch:** Der 25.11. liegt in der ersten Pflegewoche (23.–30.11., Monatsprüfung Block A). Deshalb kommt die erste neue Einheit am **2.12.**: „Integral anwenden: Mittelwert, Rekonstruktion, Bestand aus Änderungsrate“ (Oberstufe). Soll sie trotzdem schon am 25.11. kommen, bitte Bescheid geben – sie ist dann die Ausnahme von der Pflegewoche.
- **Danach:**
  - 9.12. Gauß-Verfahren;
  - 16.12. Nullstellen finden (Substitution, Polynomdivision);
  - 23.12. Satz von Bayes;
  - Januar: Normalverteilung rückwärts, Transformationen, Kreuzprodukt;
  - Februar: Abi-Pflichtteil ohne Taschenrechner, dann die Lücken in Klasse 5–10 (Körper, Boxplot, Scheitelpunktform, Symmetrie, mehrstufige Zufallsversuche, Konstruieren, Ungleichungen).
- **Wahlthemen:** Matrizen u. a. danach.
- **Vorrang:** Lehrplan-Prüfliste und Theorie-Korrektur (inkl. Exponentialfunktionen) sind erledigt und gemeldet in (103); sie stehen mit 2.3.8 auf test.

## 18.11.2026 (105) – Version 2.3.9: Eltern-Handy koppeln mit Sicherung, Monatsverlauf, Klassen nach Lehrplan

**Eltern-Handy koppeln** (App-Teil, nach eurer Spezifikation):
1. **Knopf „Eltern-Handy koppeln“:** unter „Mehr“ (eigene Seite `#/eltern`, für alle Stufen inkl. Oberstufe) und in den Einstellungen. Feld „Spitzname“ ist freiwillig (höchstens 20 Zeichen).
   - **Schlüssel:** id (16 Byte), schreib (16 Byte) und key (32 Byte) mit `crypto.getRandomValues`, base64url ohne Padding (22/22/43 Zeichen). Sie liegen nur lokal (`mt.eltern`).
   - **QR-Code und Link:** QR-Code mit dem Link `…/eltern-bericht/#<id>.<key>`, dazu ein Knopf „Link teilen“ (Teilen bzw. Kopieren). Der QR-Code entsteht im Gerät mit qrcode-generator 1.4.4 (MIT), eingebunden als `app/js/qrcode.js`.
   - **Stufen:** test → `https://staging.mathenachhilfe-online.com/eltern-bericht/`, live → `https://www.mathenachhilfe-online.com/eltern-bericht/`.
2. **Bericht:**
   - **Wann:** nach jeder Lern-Sitzung (Seite verlassen bzw. zurück zum Start, wieder online), höchstens alle 10 Minuten; „Senden“ von Hand jederzeit.
   - **Wie:** AES-GCM-256 mit neuem 12-Byte-IV je Sendung, `PUT /eltern/v1/b/<id>` mit `X-Schreib`, Body `text/plain` „iv.ciphertext“, höchstens 24 KB.
   - **Felder:** format, app (mathetrainer), appName, name (nur wenn eingetragen), klasse, stand, zeitraum („letzte 7 Tage“), lernzeitMin, tageAktiv, aufgaben, richtigProzent, staerken, schwach (mit Tipp), fortschritt (je Gebiet geschafft/von), letzte (bis 7 Tage), klassenarbeit (falls geplant), hinweis und neu **verlauf** ([{monat, min, aufgaben, richtigProzent}], höchstens 12, älteste zuerst). Keine weiteren Personendaten, keine Geräte-Kennung.
3. **Kopplung aufheben:** DELETE `/eltern/v1/b/<id>` (und `/s/<id>`), danach sind die Schlüssel im Gerät gelöscht. Ohne Netz bleibt die Kopplung bestehen, mit Hinweis.
4. **Sicherung des Lernstands** (Zusatz):
   - **Hochladen:** zusammen mit dem Bericht, nur bei Änderung (Prüfsumme), `PUT /eltern/v1/s/<id>`, höchstens 512 KB. Ist sie zu groß, wird sie erst gekürzt (Läufe, Abi-Versuche, Tagesliste; Monatssummen bleiben).
   - **Klartext:** `{format:1, app:"mathe-trainer", v, stand, schreib, daten}`; daten = alle `mt.*`-Speicher (Lernstand, Statistik, Monatssummen, Einstellungen, Pro-Code), ohne Geräte-Kennung, ohne Kopplungsschlüssel und ohne Zwischenspeicher.
   - **„Neues Gerät? Fortschritt wiederherstellen“** (aufklappbar in der Eltern-Karte), Feld „Kopplungs-Link einfügen“: Die App liest id und key, holt die Sicherung mit GET und entschlüsselt sie.
     - Bei vorhandenem Lernstand fragt sie: „Ja, ersetzen“ / „Abbrechen“.
     - Danach ist das Gerät wieder gekoppelt (id, key und schreib aus der Sicherung) und schreibt weiter.
     - Hinweise: „Keine Sicherung gefunden“ (404), „Dieser Link gehört zu einer anderen App“, falscher Link oder Schlüssel, keine Verbindung.
   - **Der Satz zur Datenschutzerklärung 10i** steht in der Eltern-Karte.
5. **Monatssummen** werden dauerhaft gespeichert (24 Monate), dazu Tageswerte (35 Tage). Lernzeit = Zeit zwischen zwei Aufgaben, wenn die Pause unter 3 Minuten liegt, sonst 30 Sekunden je Aufgabe.
6. **Rundlauf-Test** `tests/eltern.mjs` (`npm run test:eltern`) in Chromium und WebKit, mit einem Server, der genau nach Spezifikation nachgestellt ist. **40 von 40 Prüfungen bestanden:**
   - Koppeln, Schlüssellängen, Link (test/staging);
   - PUT als Geheimtext, Entschlüsseln mit dem key aus dem Link, Pflichtfelder, keine weiteren Felder, Monatsverlauf;
   - Sicherung ohne Geräte-Kennung, nur bei Änderung;
   - **zweites Gerät** (anderes Profil): unbekannter Link → „Keine Sicherung gefunden“; Link einfügen → derselbe Lernstand, wieder gekoppelt, schreibt weiter (204);
   - fremdes schreib → 403 und Hinweis „gilt nicht mehr“;
   - Aufheben löscht Bericht und Sicherung;
   - kein Überlauf; Knöpfe brechen bei 360 px nicht um.
   - **Gegen den echten Server auf trainer-test** (18.11., 17:55) mit echter AES-GCM-Verschlüsselung:
     - PUT Bericht 204, PUT Sicherung 204;
     - GET Sicherung 200, entschlüsselt mit app „mathe-trainer“ und richtigem schreib;
     - fremdes schreib 403;
     - DELETE Bericht 204, danach ist die Sicherung weg (404).
     - Die Eltern-Seite auf staging antwortet mit 200.
     - Ein zu kurzer Dummy-Body wird mit 400 abgewiesen; die App sendet immer echten Geheimtext.
- **Bitte noch:** die vollständige gemeinsame Themen-Liste schicken. Ich nutze analysis, stochastik, vektoren, exponential-log und für Klasse 5–10 zahlen, algebra, geometrie, daten.

**Klassen nach Lehrplan** (Marcel: „ja“):
- „Baumdiagramm und Vierfeldertafel“ ist jetzt in Klasse 9, „Flächen und Prismen“ in Klasse 7.
- „Trigonometrie und Körper“ bleibt in Klasse 10: Kugel und Kegel sind dort Lehrplan, und Klasse 10 braucht mindestens zwei Einheiten mit Spiel.
- Der Lernstand bleibt erhalten (gleiche Kennung). „Kommt bald“ ohne die jetzt abgedeckten Baumdiagramme.

**Geprüft:** `npm run check` grün, `tests/eltern.mjs` 40/40, `tests/webkit.mjs` 102/102, `tests/web-update.mjs` 12/12; e2e läuft.

## 18.11.2026 (104) – Prüfplan angelegt; Entscheidungen von Marcel

- **`docs/PRUEFPLAN.md`** (Dauerregel: jede Woche neuer Inhalt, Monatsprüfung in der letzten Woche).
  - **Wöchentlich:** eine neue Einheit (Mittwoch auf `test`).
  - **Monatlich:** ein Inhaltsblock gründlich (Aufgaben richtig, Eindeutigkeit/alle Lösungswege, Formel in der Theorie, Lehrplan-Klasse, Stufen) + der neue Inhalt des Monats + eine Rundum-Prüfung (e2e alle Stufen, WebKit iPhone/iPad, Auto-Update, Links, KI-Probe, Push-Schlüssel, Bildschirme, Meldungen).
  - **Blöcke:** A Oberstufe Analysis (18), B Oberstufe Stochastik und Geometrie (18), C Klasse 5–7 (22), D Klasse 8–10 (15) – im Kreis, alle vier Monate ist jeder Block wieder dran.
  - **Erster Prüfmonat:** November, 23.–30.11., Block A.
- **Marcel hat hier im Raum entschieden:**
  1. Themen in die Lehrplan-Klasse verschieben: **ja** (kommt als 2.3.9: Baumdiagramm/Vierfeldertafel nach Klasse 9, Flächen und Prismen nach Klasse 7; „Trigonometrie und Körper“ bleibt in 10, siehe (105)).
  2. **Jede Woche eine neue Einheit**; die Pflegewoche entfällt und wird durch die Monatsprüfung ersetzt. Reihenfolge der nächsten 12 Wochen in `docs/THEMEN-ROADMAP.md`, beginnend mit „Dreiecke konstruieren, Kongruenz“ (Kl. 7).

## 18.11.2026 (103) – Version 2.3.8: Theorie geprüft und ergänzt, Lehrplan-Abgleich, „Kommt bald“

**1. Prüfliste Theorie** (vollständig je Thema: `docs/THEORIE-PRUEFUNG.md`, Spalten „Thema → passt? → Formel+Bedeutung+Beispiel vorher? → korrigiert“)

| | Oberstufe | Klasse 5–10 | zusammen |
| --- | --- | --- | --- |
| geprüft | 36 | 37 | 73 |
| passt nicht zur Überschrift | 0 | 1 | 1 |
| Formel/Bedeutung/Beispiel fehlte vorher | 12 | 34 | 46 |
| korrigiert | 12 | 37 (3 vollständige bekamen ein Zusatzbeispiel) | 49 |

- **Nicht passend:** Klasse 9 „Ähnlichkeit und Strahlensätze“. Im Schritt „Festigen“ waren Pythagoras-Aufgaben eingemischt; jetzt sind es nur Strahlensatz-Aufgaben.
- **Exponentialfunktionen** (Marcels Beispiel): Im Mathe-Trainer enthalten die Einheiten Klasse 10 „Exponential- und Sinusfunktion“ und Oberstufe „ln-Funktion und Wachstum“ wirklich a·bˣ, eˣ, ln, Wachstum und Zerfall. Es fehlten aber Verfahren, die die Aufgaben brauchen:
  - Prozent je Schritt → Faktor 1 ± p/100;
  - „Wann verdreifacht?“ mit bˣ = 3 → x = lg 3 / lg b;
  - Halbwertszeit;
  - Ableitung der e-Funktion mit Kettenregel, aˣ = e^{x·ln a}, k = ln a.
  Alles ist jetzt ergänzt, jeweils mit Beispiel.
- **Größte Lücken vorher** (Verfahren für einen Hauptteil der Aufgaben fehlte):
  - Klasse 5: ggT/kgV, Rechenregeln/schriftliches Rechnen, Quadranten/Dreiecksfläche/Durchschnitt.
  - Klasse 6: „p % von“ und „wie viel Prozent“.
  - Oberstufe:
    - Hesse-Form (genHesse fragt danach, die Theorie hatte sie nicht);
    - partielle Integration (Sinus/Kosinus Stufe 5, Rotationskörper ∫x·e^{−cx});
    - stetige Zufallsgrößen (∫f = 1, E(X) = ∫x·f(x)dx).
- **Insgesamt:** 75 neue Erklärkarten (233 → 308; Formel, Bedeutung der Größen, durchgerechnetes Beispiel mit eigenen Zahlen), dazu viele bestehende Karten um Bedeutung und Beispiel erweitert. 56 neue „Formeln zum Merken“ (177 → 233) und 11 neue Abschnitte in der ausführlichen Theorie (395 → 406).
- **Alle 112 Theorie-Kapitel** (kurz und ausführlich) rendern ohne Formelfehler (geprüft mit KaTeX im Browser). Die Zahlen der Beispiele sind nachgerechnet.

**2. Vektor-Geometrie** – jetzt jeweils mit Formel, Bedeutung und Beispiel:

| Punkt | Einheit |
| --- | --- |
| Hessesche Normalform (… = 0 und mit n₀) | Hesse-Form, Schnittgerade, Spiegelung |
| Abstand Punkt–Ebene | Abstände und Winkel; Hesse-Form |
| Abstand Gerade–Ebene (parallel), Ebene–Ebene (parallel) | Abstände und Winkel; Hesse-Form |
| Abstand Gerade–Gerade (parallel) | Kugeln, Abstände, Ebenen |
| Abstand Gerade–Gerade (windschief) | Hesse-Form, Schnittgerade, Spiegelung |
| Winkel Gerade–Gerade, Ebene–Ebene, Gerade–Ebene (mit Sinus) | Abstände und Winkel (Karte „Schnittwinkel“, Beispiel 7) |
| Winkel zwischen Vektoren cos α = a·b/(\|a\|·\|b\|) | Skalarprodukt; Abstände und Winkel |

**3. Lehrplan-Abgleich** (`docs/LEHRPLAN-ABGLEICH.md`): Bayern, Baden-Württemberg, NRW, Niedersachsen und Hessen (Gymnasium und Realschule, Sek. I und Oberstufe) sowie die KMK-Standards MSA und Abitur.
- **159 Themen:** 97 vorhanden, 28 teilweise, 34 fehlen.
- **Einschränkung:** Die offiziellen Lehrplan-Seiten (u. a. lehrplanplus.bayern.de, kmk.org) waren aus dieser Umgebung nicht erreichbar. Die Klassen-Zuordnung beruht auf Fachwissen und ist in jeder Zeile mit „(n.o.g.)“ markiert. Zum Nachprüfen müssten diese Seiten im Netz der Sitzung freigegeben werden.
- **Top 10 fehlend:**
  1. mehrstufige Zufallsversuche/Baumdiagramm in Kl. 8/9;
  2. Dreiecke konstruieren und Kongruenz (Kl. 7);
  3. Gauß-Verfahren (Oberstufe);
  4. Terme aufstellen (Kl. 7);
  5. Körper und Netze (Kl. 5);
  6. Achsen- und Punktspiegelung (Kl. 6/7);
  7. Prüfungstraining Mittlerer Abschluss;
  8. Nullstellen finden: Substitution/Polynomdivision (Oberstufe);
  9. Trigonometrie am Einheitskreis (Kl. 10);
  10. Potenzfunktionen (Kl. 10).
- **„Kommt bald“ ist jetzt in der App sichtbar** (ohne Datum, ohne Kaufhinweis): je Klasse 5–10 und je Oberstufen-Gebiet, die wichtigsten fehlenden Themen zuerst, 4–8 je Gruppe.
- **Bauen:** Die Reihenfolge der Themen-Roadmap (`docs/THEMEN-ROADMAP.md`) passt zum Abgleich. Ich schlage vor, sie mit den Top 10 abzugleichen und dann 1 Einheit pro Woche zu bauen, sobald Marcel den Rhythmus gewählt hat.
- **Auffällig** (Klasse im Trainer ≠ übliche Lehrplanklasse): Baumdiagramm nur in Kl. 10 (meist 8/9), Trigonometrie in Kl. 10 (meist 9), Flächen in Kl. 8 (meist 6/7). Das ist noch nicht verschoben, weil es den Lernstand der Nutzer berührt; bitte entscheiden.

**4. Offen:**
- Klasse 8 „Flächen und Prismen“, Stufe 5: Eine Trapez-Aufgabe braucht den Pythagoras (kommt erst in Klasse 9). Die Karte erklärt den Weg; den Erzeuger selbst habe ich im Betriebstest nicht geändert.
- **Tests:** `npm run check` grün. Die Grenze für die Bündelgröße ist von 2,1 auf 2,3 MB angehoben, wegen der neuen Theorie-Texte.

## 18.11.2026 (102) – Offene Punkte „fertig machen“: KI, Erinnerung, Roadmap, iPhone/iPad

Stand auf `test`: **Version 2.3.7**, mit allem aus (99), (100) und (101): nur Web-App, Vorlesen aus, Auto-Update, Logo überall gleich. Live gibt der Leitstand frei. In diesem Schritt ändert sich an der App nichts, nur Tests und Unterlagen.

1. **KI-Funktionen: fertig.** In der App laufen alle fünf über `/api/ki/*` auf dem Trainer-Server:
   - „Erklär's mir anders“ (einfacher, mit Beispiel, Eselsbrücke); ohne Code 3 kostenlose Proben.
   - KI-Tutor-Nachfrage, Rechenweg prüfen (Foto oder Text), Blatt-Auswertung, KI-Aufgaben (im Gerät nachgerechnet).
   - KI-Punkte des Tages (`/api/ki/rest`).
   - Knopf „KI dazubuchen“ zum Shop-Produkt MT-KIUP (Web) und Nachprüfen beim Zurückkommen („KI ist freigeschaltet“).
   - **Geprüft:** Der Test-Server meldet `ki: true` mit allen fünf Arten. Eine echte Probe-Erklärung über `/api/ki/erklaer` kam als ganzer, passender Text zurück (zufällige Gerätekennung, kein Name, kein Lernstand).
2. **Handy-Erinnerung (Push): fertig.** In den Einstellungen gibt es:
   - echten An/Aus-Schalter und frei wählbare Uhrzeit (5-Minuten-Schritte);
   - bei gesperrten Mitteilungen eine Anleitung je Gerät;
   - den Hinweis „Als App installieren“ samt Knopf. Auf dem iPhone geht Web-Push nur in der installierten App; das sagt die App.
   - **Server:** `/api/push/schluessel` liefert den Schlüssel, `/api/push` nimmt Anmeldungen an.
   - **Tests:** e2e (Erinnerung an, gesperrt, Uhrzeit).
3. **Themen-Roadmap:** `docs/THEMEN-ROADMAP.md` – zur Auswahl für Marcel.
   - **Rhythmus:** 1 neue Einheit pro Woche (Mittwoch auf test, Freitag frei), jede 4. Woche eine Pflegewoche; täglich nur Fehlersuche.
   - **Reihenfolge:** Lücken in Klasse 5–10 zuerst:
     - Körper (Kl. 9), Daten/Boxplot (Kl. 7), Scheitelpunktform (Kl. 9), Symmetrie (Kl. 5);
     - mehrstufige Zufallsversuche (Kl. 9), Konstruieren (Kl. 7);
     - Integral anwenden (Oberstufe), Ungleichungen (Kl. 8), Matrizen (Länder-Wahlthema).
   - **Zu entscheiden:** Rhythmus mit oder ohne Pflegewoche; Lücken oder Oberstufe zuerst; Länder-Wahlthemen ja oder nein.
4. **2.3.6 und 2.3.7** sind gemeldet in (100) und (101) und liegen als 2.3.7 auf `test`.
5. **iPhone/iPad (WebKit):** Der Mathe-Trainer ist reines JavaScript (kein Kotlin/Wasm). Neuer Test `tests/webkit.mjs` (`npm run test:webkit`) mit der Safari-Engine (Playwright WebKit), iPhone 13 und iPad:
   - 23 Seiten geöffnet, je Seite: Inhalt da (keine weiße Seite), nichts ragt über den Rand;
   - Blitz-Runde gespielt, Übungsaufgaben beantwortet;
   - Anleitung „App installieren“ für Safari;
   - keine Skriptfehler.
   - **Ergebnis:** 102 von 102 Prüfungen bestanden.
   - **Zusätzlich lief der ganze e2e-Durchlauf einmal in WebKit:** Alle Seiten und Spiele bauen sich auf. Er brach nur an Stellen ab, an denen der Test-Roboter in WebKit anders wischt bzw. Playwright bei aktivem Service Worker keine Anfragen abfängt – keine Fehler der App.

## 18.11.2026 (101) – Version 2.3.7: nur noch Web-App (PWA)

Marcel hat es hier im Raum bestätigt.

1. **Android ruht:**
   - Der Code bleibt im Repo (`android/`).
   - Der Workflow `.github/workflows/apk.yml` baut nicht mehr: Der Job `bauen` steht auf `if: false`, und die Auslöser über Inhalte sind weg.
   - Die Android-Tests ruhen mit.
   - Der Update-Knopf aus 2.3.6 bleibt nur als Code in der Hülle; eine neue Hülle wird nicht mehr ausgeliefert.
2. **Downloads weg:**
   - Der Workflow löscht beim Ausliefern von 2.3.7 das öffentliche Release `apk-test` samt Marke. Das ist seit 2.3.6 die einzige öffentliche APK.
   - In der App gab es keine APK- oder Play-Links; der Hinweis „Neue App-Datei“ erscheint nur in einer schon installierten Android-Hülle.
   - `docs/PLAYSTORE.md` ist als „ruht“ markiert.
   - „Web = Android“ führe ich in den Meldungen nicht mehr.
   - **Wo noch APKs liegen** (zum Aufräumen):
     - Drive-Ordner „Mathe-Trainer“: `Mathe-Trainer-2.3.6-2026-11-18.apk` und `…-PlayStore.aab`.
     - Drive-Ordner „Alt“: ältere APK/AAB bis 2.3.4.
     - GitHub-Actions-Artefakte der Läufe „Mathe-Trainer – Android-App bauen“: nur angemeldet sichtbar, laufen nach 30 Tagen von selbst ab.
3. **Auto-Update der Web-App:** wie in (100), gilt für alle; Test `tests/web-update.mjs`.
4. **Neu: „App installieren“** auf der Startseite (unter „Nächster Schritt“), unter „Mehr“ und in den Einstellungen. Die Karte erscheint nur, wenn die App noch nicht installiert ist (eigenes Fenster bzw. `navigator.standalone`).
   - **Android/Chrome/Edge:** `beforeinstallprompt`; ein Tippen öffnet das Installieren-Fenster.
   - **iPhone/iPad:** Anleitung „Teilen → Zum Home-Bildschirm → Hinzufügen“, dazu der Hinweis auf Safari.
   - **Sonst** (z. B. Firefox am Rechner): keine Karte.
   - **Manifest geprüft:** Name, Symbole 192/512 + maskable 512, `display: standalone`, `start_url`, `theme_color`.
   - Die App startet offline (Startseite und alle Dateien im Service Worker).
   - Tests: e2e (Angebot → Karte auf Start und in den Einstellungen → Tippen ruft das Angebot auf; iPhone zeigt die Anleitung; installiert: keine Karte) und `tests/run.mjs` (Manifest, iOS-Erkennung, Offline-Start).
5. **Pro und Kauf:** Pro-Seite und Einstellungen sagen jetzt „gilt in der Web-App (im Browser oder als installierte App)“.

Mit drin: Vorlesen aus und Logo überall farbig (siehe (99) und (100)).

## 18.11.2026 (100) – Version 2.3.6: fertig für den Betriebstest (Vorlesen aus, Update in der App, Eindeutigkeit, Web-Update)

**Vorlesen aus** (Marcel hat es hier im Raum bestätigt):
- Schalter `VORLESEN = false` in `app/js/ui.js`. Der Code bleibt, zum Wiedereinschalten genügt `true`.
- Weg sind: Vorlese-Knöpfe (Aufgaben, Theorie), der Einstellungsbereich (Stimme, Sprechtempo, Probe, „Alle Nova-Texte offline laden“) und die Hinweise „Nova nicht erreichbar“.
- Es gibt keine Abrufe mehr an stimmen.mathenachhilfe-online.com oder /jetzt und keine Gerätestimme.
- `vorlesen/texte.json` ist leer (`{"format":1,"app":"mathe-trainer","texte":[]}`), damit das Stimmen-Werk nichts mehr spricht.
- Schon geladene Nova-Dateien im Gerät (Cache `stimme-nova`) werden beim Start aufgeräumt.
- Nova-Stand vor dem Abschalten: 774 von 774 festen Texten (100 %). Von der Gesamtliste mit Laufzeit-Sätzen (2.3.5) waren 1 300 von 2 226 vertont (58 %), der Rest ist durch das Abschalten hinfällig.
- **Musik und Klänge** waren schon da und bleiben:
  - Lernmusik und Effekte (richtig/falsch, Stern, Level) sind getrennt schaltbar, jede mit eigener Lautstärke.
  - Die Musik startet in der App beim Öffnen, im Web beim ersten Tippen; früher geht es im Browser nicht.

**Update komplett in der App** (Marcel: „Das Update sollte komplett in der App laufen“):
- **Inhalte** kamen schon immer von selbst.
- **Neue App-Hülle** (jetzt Nr. 8): In der Test-App steht im Hinweis „Neue App-Version verfügbar“ ein Knopf „Jetzt aktualisieren“.
  - Die App lädt die APK selbst (mit Fortschritt) und übergibt sie an Android (PackageInstaller).
  - Android fragt einmal „Installieren?“; das ist bei Android immer so.
- **Adresse der APK:** GitHub legt bei jedem Bau auf `test` die Test-APK als Release `apk-test` ab (`Mathe-Trainer-test.apk`, das Repo ist öffentlich).
  - Android installiert sie nur, wenn sie mit demselben Schlüssel signiert ist.
- **Play-Store-Fassung** (Kanal store): Sie bekommt die Installations-Erlaubnis nicht, geprüft im gebauten Paket. Dort aktualisiert der Store, es gibt keinen Kauf- oder Download-Hinweis.
- **Hülle 8** muss Marcel einmal von Hand installieren, danach geht es per Knopf.

**Eindeutigkeit** (Marcel: „zwei Wege, aber bei der Kontrolle nur einer“):
- **Geprüft:** alle 152 Erzeuger × 5 Stufen × 30 Startwerte, dazu die 23 schweren Themen (Stufe 4/5) und die 3 Verbund-Aufgaben.
  - Das sind 25 925 Aufgaben mit 226 403 Prüfungen; 84 % der richtigen Antworten werden mathematisch gelesen.
  - Neuer Test `tests/hart/eindeutig.mjs` (läuft in `npm run check`, ohne fremde Bibliothek).
- **Gleichwertigkeit:** Jede Antwort wird ausgewertet:
  - Zahl, Bruch, Wurzel, Dezimalzahl;
  - Terme an Zufallsstellen (ausmultipliziert = faktorisiert);
  - Lösungsmengen (Reihenfolge egal, ±);
  - Punkte und Vektoren, Ebenen bis auf einen Faktor, Geraden in jeder Darstellung.
- **Fälle:**
  1. „Kürze vollständig“ (genKuerzen) und „Bringe die Ebene in die Hesse-Form“ (genHesse): Ein Ablenker hat denselben Wert, aber nicht die verlangte Form. Die Aufgabe verlangt die Form ausdrücklich, ist also eindeutig (b).
  2. „Berechne den Normalenvektor n = AB × AC“ (schwer, Kreuzprodukt): −n wäre auch ein Normalenvektor, aber die Formel legt n fest, also eindeutig (b).
  3. **Eintippen, Bruch-Lösung:** Bisher galt nur der Bruch oder eine sehr genaue Dezimalzahl. Neu gilt auch die gerundete Dezimalzahl ab zwei Stellen (2/3 → 0,67 oder 0,667), also mathematisch gleichwertig geprüft (a). Mit Test.
  4. **Keine Funde** bei: zweiter gleichwertiger Antwort, Stammfunktion nur +C anders, falscher Antwort, die die Gleichung vollständig löst, richtiger Antwort, der eine Lösung fehlt, Vielfachem eines Richtungs- oder Normalenvektors, derselben Geraden in anderer Darstellung, Eintippen mit gleichwertigem Ablenker.
- **Nicht maschinell lesbar** (16 %): Text-Antworten wie Lage von Geraden, Symmetrie, Begriffe, Intervalle. Stichprobe angesehen: Die Antworten schließen sich gegenseitig aus.

**Web-App immer aktuell:**
1. **Prüfen:** beim Öffnen, bei jeder Rückkehr in den Tab (`visibilitychange`/`focus`, höchstens einmal je Minute), wieder online und spätestens alle 30 Minuten.
   - Dabei laufen `registration.update()` und der Abgleich `stand.json?nc=…` mit `cache: 'no-store'`.
2. **Übernehmen:** Die neue Fassung wird übernommen, sobald es ungefährlich ist, also nicht mitten in Aufgabe, Runde oder Fenster, sonst beim nächsten Wechsel zum Start. Dann `skipWaiting` + `clients.claim` und automatisches Neuladen, danach „Neue Version x.y.z geladen.“.
   - Die neue Fassung wird bewusst erst in diesem Moment aktiv und nicht sofort: Sonst holte eine alte, offene Seite Bündel-Teile, die es nicht mehr gibt.
3. **Daten:** localStorage bleibt. Alte `mt-…`-Speicher werden aufgeräumt. Nova-Dateien sind wegen „Vorlesen aus“ jetzt bewusst weg; bei eingeschaltetem Vorlesen blieben sie.
4. **Zwei echte Fehler behoben:**
   - Wer die Seite zum allerersten Mal geöffnet hatte und offen ließ, bekam nie automatisch das Update.
   - Die Übernahme nach dem Verlassen einer Aufgabe hing am Zeitpunkt des Seitenaufbaus; jetzt wird alle 3 Sekunden nachgesehen.
5. **Version sichtbar:** in den Einstellungen und in der Fußzeile.
- **Browser-Test:** `node tests/web-update.mjs`, 12 Prüfungen:
  - alte Fassung offen, neue mitten in der Aufgabe → kein Neuladen; zurück zum Start → neue Version mit Hinweis;
  - Daten bleiben, alter Speicher weg;
  - neue Fassung bei geschlossener Seite → beim nächsten Öffnen ohne Neuladen von Hand die neueste.

**Geprüft:** `npm run check` grün (mit Eindeutigkeit), `tests/web-update.mjs` grün. Android: Test- und Store-Fassung gebaut, Erlaubnis nur in der Test-Fassung, gleicher Schlüssel. e2e: siehe Baulog.

**Web = Android**, Version 2.3.6.

## 18.11.2026 (99) – Version 2.3.5: ein Logo überall

Marcel hat bestätigt: das farbige Symbol überall.

- **Kopf der App:** das farbige Symbol (klein, ohne Schrift), daneben der Schriftzug „Mathe-Trainer“.
- **Ladebild beim Start:** das farbige Symbol mit f'(x), direkt in der Seite eingebettet.
- **Zertifikat und Teilen-Bild:** das farbige Symbol mit f'(x) (`img/symbol.svg`).
- **Arbeitsblätter und Theorie-PDF:** im Kopf ebenfalls das farbige Symbol statt des alten schwarz-weißen Logos.
- **Entfernt:** `img/marke.svg` und `img/logo.svg` (die alten schwarz-weißen Logos).
- **Unverändert:** Favicon, PWA-Icons und Android-Symbol. Die App-Hülle bleibt Nr. 7, es ist keine neue APK-Installation nötig.
- **Tests:** Der alte Schwarz-weiß-Test ist ersetzt. Jetzt wird geprüft, dass Kopf, Zertifikat, Ladebild, Teilen-Bild und Arbeitsblätter das farbige Symbol zeigen und kein altes Logo mehr vorkommt.
- **Geprüft:** `npm run check` grün; Bildschirmfotos von Ladebild und Kopf bei 360 px, hell und dunkel, ohne Fehler. Der e2e-Lauf auf allen fünf Stufen läuft.

**Web = Android**, Version 2.3.5.

## 18.11.2026 (98) – Betriebstest Tag 1: Version 2.3.4 (nur Fehlerbehebungen)

- **Logo:** Seit 2.3.3 zeigte der Kopf der App das neue farbige Symbol. Das war ein Fehler: Marcel hat entschieden, dass das Logo schwarz-weiß bleibt. Jetzt zeigen Kopf und Zertifikat wieder das schwarz-weiße Logo (`img/marke.svg`). Favicon, PWA-Icons und Android-Symbol bleiben farbig. Ein Test sichert das ab.
- **Aufgaben:**
  - Stichprobe: 20 schwere Aufgaben-Formen (Stufe 4/5) und die 3 Verbund-Aufgaben, 232 Einzelfragen nachgerechnet.
  - Alle Lösungen stimmen. 15 Fehler-Erklärungen und Texte habe ich korrigiert (Liste in `docs/PLAN.md`, Baulog 2.3.4).
  - Offen für nach dem Betriebstest: Bei den Verbund-Aufgaben ist Stufe 5 kaum schwerer als Stufe 4.
- **Nutzer-Meldungen** seit 16.11.: keine.
- **Bildschirm Einstellungen:** 360/393/1440 px, hell/dunkel, große Schrift. Nichts läuft über, auch der Knopf „KI dazubuchen“ passt.
- **Technik:** Keine Änderung an Speicherfeldern, Schnittstelle oder Abrufen. App-Hülle unverändert (Nr. 7), keine neue APK nötig. Die Inhalte kommen von selbst.
- **Geprüft:** `npm run check` zweimal grün, e2e auf allen fünf Stufen grün (3, 1, 5, 2, 4; je 36 Einheiten ohne Fehler).
- **Stand:** main = test = a010ec5, live unverändert. APK/AAB 2.3.4 (versionCode 20304, bekannter Schlüssel) liegen im Drive-Ordner, 2.3.3 ist nach „Alt“ verschoben.

**Web = Android**, Version 2.3.4.

## 17.11.2026 (97) – Fertig für den Betriebstest – Version 2.3.3

Eure Aufträge: KI-Punkte-Abfrage (Endpunkt live), Nachtauftrag „Aufgaben prüfen“ und „Nova – ganze Sätze, nie die Android-Stimme“.
**Version 2.3.3 liegt auf `test`.** `live` habe ich nicht angefasst. Wegen des neuen App-Symbols hat die App-Hülle jetzt Nr. 7. Die neue APK/AAB 2.3.3 (versionCode 20303, gleicher Schlüssel) liegt im Drive-Ordner „Mathe-Trainer“, 2.3.2 liegt in „Alt“. **Web = Android**, beide 2.3.3.

### Zahlen
- **Aufgaben geprüft:**
  - Alle 152 Aufgaben-Erzeuger, automatisch: 152 000 Aufgaben (Stufe 1–5, je 200 Startwerte).
  - Dazu 5 Prüfer mit Stichproben: je Erzeuger und Stufe bis zu 3 Varianten, alle Lösungen nachgerechnet.
- **Aufgaben geändert:** 91 Befunde in über 70 Aufgabenarten behoben. Einer war ein Fehlalarm.
  - Automatische Befunde: 11 Arten vorher (Rundung ohne Angabe, Anzeige ≠ gespeicherter Wert, zwei gleichwertige Antworten). Jetzt 3, und die sind gewollt (interne Werte, die der Schüler nie sieht).
- **Nova-Abdeckung: 100 %.**
  - Theorie: 555 von 555 Abschnitten (alle 72 Einheiten, kurz und ausführlich) finden ihre Datei. Der Server hat 774 von 774 Texten aus `texte.json` (alle HTTP 200).
  - Live-Durchlauf mit eurem echten Server: 24 vorlesbare Stellen (Aufgaben aus Kl. 5, 7, 9, 11, Oberstufe und Theorie), 27 von 27 Sprachstücken kamen von Nova (`/jetzt` 17× „200 neu“, Dateien 25× 200). Die Gerätestimme kam 0-mal.
  - Einmal antwortete `/jetzt` mit 502, der zweite Versuch klappte.

### Nova: Ursache und Änderung
- **Ursachen für die Android-Stimme in dieser App:**
  1. Kam eine Nova-Datei nicht (404 bei einem festen Text, `/jetzt` ≠ 200, Netzfehler), sprang die App sofort auf die Gerätestimme.
  2. Feste Texte hatten keinen Rückweg über `/jetzt`.
  3. Verweigerte das Gerät das Abspielen (Android verlangt ein Tippen), las ebenfalls die Gerätestimme.
  4. KI-Antworten waren für die Gerätestimme vorgesehen.
  - Ein Hash-Fehler war es nicht: Laufzeit-Texte und `texte.json` stimmen 555 von 555 überein.
- **Jetzt:**
  - Immer ganze Sätze. Feste Texte nimmt die App vorab vertont. Fehlt eine Datei oder entsteht der Text erst in der Aufgabe, gehen Stücke bis 300 Zeichen an `/jetzt`, geteilt an Satzenden. Nie Wort- oder Zahlenschnipsel.
  - Der Knopf zeigt „Lädt …“, bis der Ton läuft. Die App wartet bis 15 s je Abruf (`/jetzt` braucht meist 2–3 s) und versucht es bei einer Störung ein zweites Mal.
  - Die Gerätestimme liest nur, wenn wirklich kein Netz da ist (`navigator.onLine === false`) und nichts offline gespeichert ist.
  - Sonst bleibt die App still und zeigt einmal je Sitzung: „Nova ist gerade nicht erreichbar – bitte gleich noch einmal versuchen.“
  - Verweigert das Gerät das Abspielen: „Zum Vorlesen bitte noch einmal auf ‚Vorlesen‘ tippen.“ Die Datei liegt dann schon im Speicher.
  - KI-Antworten werden nicht vorgelesen.
  - Geprüft mit nachgebautem Server in 7 Fällen: Datei da, Datei fehlt, Aufgabe, `/jetzt` erst 500, Server kaputt, kaputt zum zweiten Mal, ohne Netz. Ergebnis: Gerätestimme nur ohne Netz, Hinweis einmal.
- **Einmaleins vorab:** Nicht nötig. Aufgaben werden samt Antworten als ganze Sätze über `/jetzt` vertont und danach auf dem Gerät gespeichert.

### KI-Punkte (`POST /api/ki/rest`)
- Die App fragt höchstens einmal je Stunde nach, nur mit gültigem Pro + KI.
- Sie zeigt „heute noch N KI-Punkte“ auf Startseite, Pro-Seite und in den Einstellungen und aktualisiert das von selbst. Das Limit 15 alter Codes wird übernommen.
- Ein 429 dieser Abfrage setzt den Rest nicht auf 0.

### KI dazubuchen (euer Auftrag von 23:03)
- **Web-App:**
  - Bei gültigem „Pro“ ohne KI steht an den KI-Stellen statt „Pro holen“ der Knopf **„KI dazubuchen ↗“**. Das sind die Hinweise „gehört zur Stufe Pro + KI“ bei Tutor-Rückfragen, Erklärungen, KI-Aufgaben, KI-Auswertung und Rechenweg-Prüfer.
  - Den Knopf gibt es auch auf der Pro-Seite und in den Einstellungen.
  - Er öffnet `…/produkt/mathe-trainer-ki-upgrade/?code=<eigener Code>` in einem neuen Tab.
- **Android-App:** **kein** Kauflink, auch nicht im externen Browser. Das bleibt bei Marcels Regel und der Play-Richtlinie: kein Kauf außerhalb des Stores.
  - Bitte bei Marcel bestätigen, falls das anders gewollt ist.
  - Wer am Rechner oder im Browser dazubucht, bekommt KI trotzdem auch in der App, über die erneute Prüfung.
- **Erneute Prüfung:** beim Zurückkehren (`visibilitychange` → sichtbar, auch Android-Resume) und beim Öffnen von Pro-Seite und Einstellungen.
  - `POST /api/zugang {code}` läuft nur bei gültigem Pro ohne KI, höchstens alle 20 s.
  - Bei `ki: true` schaltet die App KI sofort frei, zeigt „KI ist freigeschaltet.“ und baut die Seite neu auf. Laufzeit und Art übernimmt sie vom Server.
- **Test-/Live-Seite:** Die App nimmt immer den Link oben, wie beim Pro-Kauflink. Welche Shop-Umgebung den Code prüft, regelt ihr am Server.
- **Geprüft:** Browser mit nachgebautem Server.
  - Web: Knopf mit Code, passt bei 360 px; nach dem „Kauf“ und dem Zurückkehren erscheint „KI ist freigeschaltet“, das Abzeichen zeigt „Pro + KI aktiv“.
  - Android: kein Knopf, die Freischaltung klappt trotzdem.
  - Dazu 5 Selbsttests.

### Neues App-Symbol (euer Auftrag von 23:26)
- **Marcels Entscheidung (eben gefragt):** Das neue Symbol gilt als App-Symbol: Favicon, PWA-Icons, apple-touch-icon und Android-Launcher. Das Logo oben in der App bleibt schwarz-weiß.
- **Umsetzung:** „f'(x)“ ist als Pfad gesetzt (Inter ExtraBold), nicht als Schrift.
  - Favicon (SVG) und das Android-Symbol in mdpi (48 px) kommen ohne Text.
  - Maskable 512: volle Fläche, Motiv auf 80 % für den sicheren Rand.
  - apple-touch-icon 180: ohne runde Ecken (iOS rundet selbst).
  - Android adaptiv: Hintergrund = Verlauf (Shape-Drawable), Vordergrund = Kurve und Text auf 62 % im sicheren Bereich; dazu ein monochromes Symbol.
- **Icon-Adressen für den Shop:**
  - https://trainer.mathenachhilfe-online.com/img/icon-512.png (512 px, abgerundet)
  - https://trainer.mathenachhilfe-online.com/img/icon-maskable-512.png (volle Fläche)
  - auf der Testseite dieselben Pfade unter trainer-test.mathenachhilfe-online.com

### Weitere Korrektur
- Kumulierte Binomialverteilung (Stufe 4–5): Die Anzeige ist jetzt der exakte Wert, auf 4 Nachkommastellen gerundet. Vorher stand dort die Differenz gerundeter Tabellenwerte, die bei freier Eingabe abgelehnt wurde.
- Diese Aufgaben gibt es nur noch als Auswahl, weil Tabellenwerte in der 4. Stelle abweichen können.

### Geprüft
- `npm run check` grün, inklusive der strengen Nachrechen-Prüfungen und der Stufen-Steigerung aller 147 Arten.
- e2e auf allen fünf Stufen grün (3, 1, 5, 2, 4). Nach dem neuen Symbol lief Stufe 3 noch einmal grün.
- APK gebaut und die Signatur geprüft.

### Liste der geänderten Aufgaben (Erzeuger, Stufe, was unklar oder falsch war)
- genStammfunktion (auch genIntegralMix) (Stufe 4): Ablenker „Das ist die Ableitung“ ist nicht die Ableitung (Konstante angehängt): bei f=2x^2+7x-1 „F(x)=4x-5“, richtig f'=4x+7.
- genPolynom (Stufe 5, auch genMix) (Stufe 5): Erklärung passt nicht: Ablenker 48x^3-12x^2+26x, Erklärung „Die Zahl 3 ohne x fällt beim Ableiten weg.“ (Fall e=-d, b·d und b·e heben sich auf).
- genKollinear (Stufe 1,3): Vorzeichen-Ablenker „ja: AC=-3·AB — Der Faktor muss in jeder Zeile derselbe sein“ – Faktor ist überall gleich, nur das Vorzeichen falsch.
- genBinomial / genStochastikMix (Stufe 4 „mindestens ein Treffer“): p=0,2, n=4: 4·0,2·0,8^3=0,4096=0,8^4 → Ablenker „genau ein Treffer“ fällt mit P(X=0) zusammen.
- genBinomial / genStochastikMix (Stufe 4–5 Fehlversuche): X nicht genannt, p stillschweigend 1-0,7 umdefiniert.
- genBinomial (Stufe 5): Ablenker „≈ 0,0000“; Tipp „Potenzen: 0,15≈0,15“ leer.
- genKoordSpiegel (Stufe 4): Fehler-Erklärung beschreibt die richtige Rechnung: „✘ (8
- genKoordSpiegel (Stufe 5): „✘ c=-8 — Das ist der Abstand …“ – Abstand nie negativ.
- genBinomial / genStochastikMix (Stufe 2–3 (k=1)): „p gehört zu den 1 Treffern.“
- genHochTief / genExtremaMix (Stufe 5): „f_t''(t-1)=-e^{t-1} ist wegen t>0 für jedes t negativ.“ falsche Begründung.
- genMix / genPolynom (Stufe 3): Tipps „achte auf die Minuszeichen“, „Aus x allein wird 1“ obwohl kein Minus / kein x-Glied.
- genMix (2), genStammfunktion (3) (Stufe 2/3): Lösung doppelt: „f'(x)=2x+2=2x+2“.
- genErwartung / genStochastikMix (Stufe 1–2): Gerundete Ablenker ohne ≈ („4,9“ für √24, „3,46“, „11,88“).
- genHochTief / genExtremaMix (Stufe alle): why an der richtigen Antwort falsch („✔ Hochpunkt — … also ein Tiefpunkt“).
- genSigma (Stufe 1–3): Sigma-Regeln bei zu kleinem σ (n=25,p=0,2 → σ=2; μ=5,σ=2; μ=10,σ=3; n=36,p=0,5 → σ=3). Ab Stufe 4 sagt die App selbst „weil σ>3“. Echte Werte …
- genFlaecheZwischen (Stufe 5): Ablenker „A≈10,67 – Die Wurzel fehlt: 2±√2, nicht 2±2“ kommt beim beschriebenen Fehler nicht heraus (wäre ≈2,67 = anderer Ablenker); kubisch …
- genAbstand (Stufe 5): „Einheit: 10 Meter“ mehrdeutig, Lösung „≈4,37 (in der Einheit der Aufgabe)“.
- genWendestelle (Stufe 4): Ablenker „x=-7 – Vorzeichenfehler beim Auflösen von 0,25x-0,25=0“ passt nicht (Vorzeichenfehler gäbe −1).
- genMonotonie (Stufe 5): Probe „f'(2,5)≈0, f'(4)≈0“ zeigt kein Vorzeichen.
- genExtremwert (Stufe 1): Erklärungen „x=2,5 – A'(x)=10-2x=0 – teile nur durch 2.“ und „x≈6,67 – Leite A(x)=… ab und setze null.“ beschreiben den Fehler nicht.
- genWachstum (Stufe 2): Abnahme: „Bei Prozenten wächst der Betrag mit.“; Zunahme-Tipp: „Es bleiben 105 % des Vorjahres.“
- genWachstum (Stufe 3): Lösung „t=\dfrac{\ln(2)}{0{,}04}=\dfrac{\ln(2)}{0{,}04}\approx17{,}3“ doppelt, keine Zeiteinheit.
- genSigma (Stufe 3–4): „Nur mit etwa 31,7 % … außerhalb eines dieser Intervalle. Außerhalb von welchem?“ schwer lesbar.
- genKombinatorik (Stufe 2): „für die Plätze 1 bis 2“
- genGeradePunkt, genSymmetrie (Stufe alle): why an der richtigen Antwort widerspricht ihr.
- genKumuliert (Stufe 4): Antworten als Differenz gerundeter Tabellenwerte (0,5449) statt gerundetem Ergebnis (0,5448); bei freier Eingabe wird die angezeigte richtige …
- genBedingt (Stufe 3–5): Gerundete Lösung ohne ≈/Rundungsangabe.
- genVierfelder (Stufe 5): Gerundete Lösung ohne ≈/Rundungsangabe.
- genPotenz (Stufe 2): Ablenker passt nicht zur Erklärung: Bei (x^5)^5 steht „✘ x^{11} — Die Exponenten werden multipliziert, nicht potenziert.“ Der Code ersetzt a**b>99 …
- genRotation (Stufe 4): Tipp falsch: „… auf den Hauptnenner 15 bringen.“ Hauptnenner fest eingetragen (gen4.js:351).
- genPythagoras (Stufe 3): Mast-Aufgabe: Tipp „Wand und Boden bilden einen rechten Winkel“, es gibt keine Wand.
- genPythagoras (Stufe 3/4): Unrealistisch: „50 m lange Leiter … Fuß 30 m von der Wand“, „19 m Leiter … 16 m von der Wand“.
- genLaplace (Stufe 5): „Zwei Würfel werden geworfen … zweite Zahl größer als die erste?“ – keine Reihenfolge bei gleichzeitigem Wurf.
- genHaeufigkeit (Stufe 1/2): „Wie groß ist die relative Häufigkeit?“ – wovon?
- genTrig (Stufe 4): Leiter mit Winkel zur Wand: Fehler-Erklärung „≈ 2,14 — Kosinus gehört zu Ankathete und Hypotenuse.“ irreführend (2,14 = 3,2·sin42°; 3,2·cos42° ist …
- genLinGl (Stufe 3): Lösung „x=3, also x=3.“ bei Faktor 1.
- genUnabhaengig (Stufe 5): „Von den Schülern besitzen 10 % ein Fahrrad (Ereignis B).“ – B unklar.
- genVarianz (Stufe 3–5): Gerundete Werte ohne ≈/Rundungshinweis (1,19 statt 1,1875; σ 2,49 …).
- genSteigung (Stufe 1–3): Ablenker „0{,}333“, „-1{,}333“ als scheinbar exakte Werte.
- genAbstandPG (Stufe 5): „Koordinaten in 100 m … (in Einheiten, auf zwei Nachkommastellen)“ widersprüchlich.
- genUneigentlich (Stufe 4): Lösung „\dfrac{6}{3\cdot 27}=\dfrac{2}{27}“ passt nicht zu Tipps (F(x)=-2x^{-3/2}); „\dfrac{12}{3\cdot 8}=\dfrac12 … ≈0,5“.
- genProzent (Stufe 3): „Wie hoch ist der neue Preis?“ Einheit fehlt (Optionen nackte Zahlen).
- genGegen (Stufe 5): Bauteile: „Treffer“ statt „defekt“ in Ablenker/Tipps.
- genRotation (Stufe 4): „Kugelschicht zwischen x=1 und x=4“ (x=4 ist Pol) → Kugelkappe.
- genQuotient (Stufe 5): „(vollständig gekürzt)“ – Ablenker „\dfrac{3}{3x^{3}}“ ungekürzt.
- genVarianz (Stufe 5): Tipp: „ergeben zusammen 1 (Gegenwahrscheinlichkeit)“ – falscher Begriff.
- genBruch (Stufe 4/5): Fehler-Erklärung „✘ 5/13 — Brüche dividiert man, indem man mit dem Kehrwert multipliziert.“ (5/13 = getrennt addiert).
- genFlaeche (Stufe 4): „Wie groß ist die Glasfläche (in m²)?“, „✔ ≈ 4“ neben „≈ 3,2“ – Genauigkeit wechselt.
- genHyper (Stufe 3–5): Gerundete Prozent-Lösung „53,57 %“ (genau 53,5714…) ohne ≈ und ohne Rundungsangabe.
- genLGS (Stufe 3): Lösung kaputt: „x=6 ergibt x=6; eingesetzt …“ (gen6.js ~Z. 1173, Koeffizient 1).
- genSinussatz (Stufe 1): Erklärung an der richtigen Option widerspricht ihr (Texte fest an Optionen, gen6.js ~Z. 1718).
- genZuordnung (Stufe 1): Gleiches Muster: „✔ keins von beiden – Doch: …“; beim Alters-Beispiel „doppelte Seitenzahl“ (gen6.js ~Z. 1493).
- genLog (Stufe 5): „Nach wie vielen Jahren hat es sich verdoppelt? ✔ ≈11,9 Jahre“ – bei jährlicher Verzinsung widersprüchlich zu genZinseszins (12 Jahre).
- genBegrenzt (Stufe 5): „✘ 21,15 – Beim Ausmultiplizieren ging 15·e^{-0,64} verloren.“ – tatsächlich fehlt nur der Faktor q.
- genBegrenzt (Stufe 5): „✘ 35 – So ginge es bei linearem Wachstum weiter.“ unverständlich als Grenze (auch „60“ Pflanze).
- genSinussatz (Stufe 1): „Welcher Satz hilft zuerst weiter?“ – Winkelsumme auch vertretbar.
- genWachstumArt (Stufe 1): „Ein Akku lädt: … bis 500 Minuten Laufzeit erreicht sind“ – liest sich wie Ladezeit.
- genZuordnung (Stufe 1–2): Bei Litern „Stück“: „3 Liter Saft kosten 12 €“, Tipp „Ein Stück kostet 12:3 €“.
- genEinheit (Stufe 3): „0,75 min in s“, Tipp „erst die ganzen Minuten …“ – keine ganzen Minuten.
- genBegrenzt (Stufe 3): „Medikament als Tropf“ mit fallender Formel 70+60e^{-0,1t}.
- genKreis (Stufe 5): „Tortenstück“ mit 270°.
- genKreis (Stufe 5): Lösung „8+1\pi“ – Faktor 1 vor π.
- genTerm (Stufe 2): Ablenker „1x^3“ – Faktor 1.
- genLinFunktion (Stufe 2): Bei f(x)=5x−4: „Punkt vor Strich: Erst malnehmen, dann addieren.“
- genNegativ (Stufe 1–2): „✘ -14 – Von der Zahl geht es nur um die Differenz ins Minus, nicht um die Summe.“ unverständlich.
- genSpurpunkt (Stufe 3): „Teile durch 5 und achte auf das Vorzeichen“ obwohl alles positiv.
- genZufallStart (Stufe 2): Ablenker 2/3 bei k=3 mit „Das ist die Wahrscheinlichkeit für das Gegenteil“ falsch (Gegenteil 3/6).
- genRational (Stufe 2–3): Plus mal Minus: Erklärungen passen nicht (12·(−6): „6 – nicht abgezogen“, ist aber 12+(−6); „−18 – nicht addiert“).
- genWindschief (Stufe 2–3): Ablenker „5,39 — Abstand zweier Stützpunkte“ falsch, Code Math.hypot(a,h) ohne y.
- genHistogramm (Stufe 1–2): „Gesamtfläche aller Säulen …?“ ohne n und p, Ablenker beziehen sich darauf.
- genHistogramm (Stufe 3): p=0,5: Erklärungen „100 — Mitte … nur bei p=0,5 der Gipfel“ und „51 — Gipfel für die Gegenwahrscheinlichkeit“ falsch.
- genBinomVerteilung (Stufe 1): n=2,p=0,2: „0,1 — ein Faktor fehlt“ (wäre 0,2).
- genBinomVerteilung (Stufe 5): „(vier Nachkommastellen)“ aber ✔ „0{,}196“.
- genMengen (Stufe 5): „(drei Nachkommastellen)“, Antworten 0,25/0,75 exakt, Lösung „≈ 0,25“.
- genNewton (Stufe 5): „(auf vier Nachkommastellen)“, ✔ „2{,}875“.
- genSinusFkt (Stufe 3): b=0,5: „π — Ein größerer Faktor vor x staucht …“ falsch.
- genSinusFkt (Stufe 4): „2\sin(0{,}5x)-1 — Der Faktor vor x ist 2π/p – nicht die Periode selbst“ passt nicht; „-1\sin(4x)+2“.
- genSinusFkt (Stufe 3): „um d nach oben verschoben“ – kein d in der Formel.
- genIntegrierenSteil (Stufe 4): „Differenz auf dem Hauptnenner 12: 14+\dfrac{3}{2}“ – Hauptnenner falsch fest.
- genSchnittgerade (Stufe 5): Tipp „2·I−(−2)·II …“ verdreht (= I+II).
- genKurveSteil (Stufe 3): „x=0 und x=±4 — Nullstellen der Ableitung, nicht die von f“ passt nicht (f-Nullstellen 0, ±√48).
- genPrisma (Stufe 5): „Wie schwer ist das Rohr? Runde auf zwei Nachkommastellen.“ ohne Einheit; Ablenker 1 Nachkommastelle.
- genZufallStart (Stufe 3): „33 % — Geteilt wird Treffer durch Würfe, nicht umgekehrt.“ (80:24 = 333 %).
- genHistogramm (Stufe 5): „n=33,33, p=0,3 — σ muss erst quadriert werden“ – zwei Fehler.
- genWinkelArt (Stufe 3): „liegen 1 Abschnitte“.
- genWinkelArt (Stufe 2): „360^\circ=360^\circ.“
- genKurveE (Stufe 3): „f''(x)=(x-0)e^x“.
- genIntegralE (Stufe 3/5): „1e^{2x}“, „\int_0^{\ln 4}(x)\,e^x\,dx“.
- genWurzelAbl (Stufe 3): Ablenker „f'(x)=1\sqrt{x}“.
- genBinomVerteilung (Stufe 2): „Auch die 1 Nieten gehören dazu“.
- genStetig (Stufe 1): P(X genau 5) bei Gleichverteilung: zwei Ablenker 0,5 und 1/2 gleichwertig.

**Web = Android**, Version 2.3.3.

## 17.11.2026 (96) – Danke für live 2.3.2; Vorschlag: KI-Punkte abfragen ohne Verbrauch

Gesehen: `live` = 5ebad06, `stand.json` zeigt 2.3.2 und Hülle 6. Die Punkte CSP, Datenschutz (10g) und APK sind damit für mich erledigt.

**Vorschlag für `ops/trainer-api`: `POST /api/ki/rest`**
- **Anfrage:** `{ "zugang": "MT-XXXX-XXXX-XXXX", "geraet": "<Gerätekennung>" }`. Das sind dieselben Felder wie bei `/api/ki/erklaer`. Absichtlich POST, damit der Code nicht in Adresse und Zugriffsprotokoll steht.
- **Antwort 200:** `{ "rest": 7, "limit": 10, "tag": "2026-11-17" }`.
  - `rest` ist dieselbe Zahl, die `/ki/*` nach einer Antwort meldet.
  - `tag` ist der Tag, für den das Limit gilt, in der Zeitzone des Servers.
- **Kein Verbrauch:** kein Aufruf bei OpenAI, kein Punkt abgezogen, kein Eintrag in die Nutzung.
- **Fehler:**
  - Zugang ungültig, abgelaufen oder Stufe „Pro“ ohne KI: `403 { "error": "…" }`.
  - Zu viele Abfragen: `429` (Vorschlag: 30 je Minute und Gerät).
- **Datenschutz:** speichert nichts Neues und schickt keine Lernstände und keine Namen.

**App-Seite:**
- Die App wertet `rest` aus jeder `/api/ki/*`-Antwort schon aus. Sie braucht nur noch **einen** Aufruf: beim Öffnen von Pro-Seite und Startseite, höchstens einmal je Stunde und nur bei gültigem Pro + KI.
- Den baue ich ein, sobald der Endpunkt live ist (kleiner Eingriff, geht als Fehlerbehebung im Betriebstest).
- Bis dahin zeigt die App den Rest aus der letzten KI-Antwort, am neuen Tag wieder 10.

**Betriebstest läuft**, ab jetzt nur noch Fehlerbehebungen. **Web = Android**, Version 2.3.2.

## 17.11.2026 (95) – Fertig für den Betriebstest – Version 2.3.2

**Version 2.3.2 liegt auf `test`** (main = test = 2702dd6). `live` habe ich nicht angefasst.
APK und AAB 2.3.2 liegen im Drive-Ordner „Mathe-Trainer“ (versionCode 20302, gleicher Schlüssel wie bisher), 2.3.0 liegt jetzt in „Alt“.

**Eure letzte Vorgabe umgesetzt:**
- **Musik startet direkt:** ab Werk an. In der Android-App beim Öffnen, im Web beim ersten Tippen irgendwo. „Musik aus“ wird gemerkt und eingehalten. Im Abi-Modus und in der Probeklausur bleibt es still, beim Vorlesen wird die Musik leiser.
- **Thorsten ist ganz entfernt:** Die Codesuche nach „thorsten“ und „sherpa“ findet 0 Treffer außer im Änderungsprotokoll (PLAN-Baulog und diese Meldungen). Ein Test prüft das bei jedem `npm run check`.

**Geprüft in der Abschlussphase:**
- `npm run check` grün, e2e auf allen fünf Stufen grün (3, 1, 5, 2, 4).
- Klick-Prüfung aller Knöpfe auf allen Klassen, auch mit Stand.
- 320 px und 1440 px Breite: nichts läuft über, Knopftexte brechen nicht um, Konsole sauber.
- Offline: App und Theorie laufen ohne Netz.
- Update von 2.2.0 auf die neue Version: alle Daten bleiben erhalten (Fortschritt, Einstellungen, Pro-Status).
- Android: Selbsttest der Hülle (27 Prüfungen) grün.
- Nova: Abspielen einer echten Datei, Tempo in 6 Stufen, offline laden in Standard und Bestqualität, Abbrechen und Weitermachen.
- Musik-Start: Web erst nach dem ersten Tippen, Android sofort, „Musik aus“ bleibt still.

**Behoben in 2.3.1/2.3.2:**
- Der Vorlese-Player wird beim Antippen freigegeben. Sonst blockiert die Android-WebView das Abspielen, wenn die Datei erst später ankommt.
- Alte Abi-Einträge zeigen kein „undefined“ mehr.
- Musik ab Werk an.
- Hülle Nr. 6: Damit die Musik in der Android-App sofort spielt, muss die neue APK einmal installiert werden. Bis dahin startet sie auch dort beim ersten Tippen.

**Bekannte offene Punkte:**
- Nicht auf einem echten Handy getestet und nicht mit dem echten Server aus der App heraus (nur im Browser mit nachgeahmtem Server und echter Nova-Datei).
- Die Abfrage der KI-Punkte ohne Verbrauch fehlt noch auf dem Server. Bis dahin zeigt die App den Rest aus der letzten KI-Antwort.
- Der CSP-Header des Servers muss dieselben Einträge erlauben wie die App: `connect-src 'self' https://stimmen.mathenachhilfe-online.com; media-src 'self' blob:`.
- Die Datenschutzerklärung auf der Website braucht noch Nova und den Hinweis auf /jetzt.
- Android braucht die neue APK, damit die Musik sofort spielt.

Ab jetzt gilt für mich: eine Woche Betriebstest, nur noch Fehler beheben.

**Web = Android**, Version 2.3.2.

## 17.11.2026 (94) – Alle Nova-Texte offline laden (Version 2.3.0)

Eure Vorgabe von 16:30. **Stand der Nova-Umstellung:**
- 2.2.0 mit Nova liegt seit 14:20 auf test, Einzelheiten in (91) und (93).
- `texte.json` ist dort mit 774 Texten erreichbar.
- Euer `stand-trainer-test…json` meldet 774 von 774 vertont, 242,7 MB.
- Eine echte Nova-Datei habe ich geladen und in der App abgespielt (14,2 s, MP3). Das klappt.

**Neu in 2.3.0** (Einstellungen → Vorlesen):
- **Knopf „Alle Nova-Texte offline laden (ca. X MB)“.**
  - X kommt aus `…/nova/stand-<host>.json` (`bytes`), abzüglich dessen, was schon auf dem Gerät liegt. Der Host ist die Adresse, unter der die App läuft (lokal: trainer-test).
  - Dazu der Hinweis „Am besten im WLAN“.
- **Laden:**
  - Die Liste kommt aus der eigenen `vorlesen/texte.json`, geladen wird nur, was fehlt.
  - 4 Downloads gleichzeitig, Fortschritt „x von n“ und „Abbrechen“. Nach einem Abbruch geht es beim nächsten Tippen dort weiter. 404 wird still übersprungen.
  - Laufzeit-Texte (/jetzt) gehören nicht dazu.
- **Speicher:** Cache Storage `stimme-nova`. In der Android-App liegt dieser im App-Speicher (dieselbe Web-Seite). Die App bittet um dauerhaften Speicher.
- **Bestqualität** (euer Nachtrag 16:34): zwei Knöpfe, „Offline laden – Standard (ca. X MB)“ (`bytes`) und „Offline laden – Bestqualität (ca. Z MB)“ (`bytes_original`, …/nova/original/…).
  - Die zuletzt gewählte Qualität wird gemerkt und als Hauptknopf gezeigt.
  - Liefert `original/` 404, nimmt die App die normale Datei.
  - Eine Bestqualitäts-Datei ersetzt auf dem Gerät die normale. Auf dem Gerät wird zuerst die Bestqualität abgespielt, aus dem Netz immer die Standard-Datei.
- **Knopf „Offline-Stimme löschen (Y MB)“**, sobald etwas gespeichert ist. Er löscht beide Qualitäten.
- **Fertig:** wenn so viele Dateien auf dem Gerät liegen, wie der Server meldet (`vorhanden`). Dann steht dort „Alle Nova-Texte liegen auf diesem Gerät.“
- **Wiedergabe:** Die App sieht immer zuerst auf dem Gerät nach. Offline liest Nova damit die ganze Theorie.

**Geprüft** (Browser, euer Server im Test nachgeahmt, mit einer echten Nova-Datei):
- Größe angezeigt, Laden gestartet, nach 20 von 774 abgebrochen. Beim nächsten Tippen ging es mit den fehlenden weiter bis „Alle Nova-Texte liegen auf diesem Gerät“.
- Dann ohne Netz Theorie vorgelesen: abgespielt bis zum Ende, 0 Netzabrufe. Löschen gibt den Speicher frei.
- Bestqualität: 774 Original-Abrufe, davon 15 im Test absichtlich mit 404. Für diese wurden die normalen Dateien geholt, danach stand dort „Alle Nova-Texte liegen auf diesem Gerät (Bestqualität)“. Offline wurde die Original-Datei abgespielt, die Wahl ist gemerkt.
- Keine Fehler in der Konsole.
- `npm run check` und e2e auf allen fünf Stufen grün.

**Web = Android**, Version 2.3.0.

## 17.11.2026 (93) – 2.2.0 liegt auf `test`, texte.json ist erreichbar

- **Stand:** main und test zeigen auf 70e6180, Version 2.2.0, Android-versionCode 20200. `live` habe ich nicht angefasst.
- **Prüfungen:** `npm run check` grün, e2e auf allen fünf Stufen grün.
- **Android:** APK und AAB 2.2.0 liegen im Drive-Ordner, 2.1.0 ist in „Alt“.
- **texte.json:** `https://trainer-test.mathenachhilfe-online.com/vorlesen/texte.json` antwortet mit 200 (`application/json`): `format` 1, `app` „mathe-trainer“, **774 Texte**. Euer Stimmen-Werk kann loslegen.
- **CORS `/jetzt`:** Die Vorabanfrage von trainer-test liefert 204 mit `POST`, `Content-Type`. Das passt.
- **Nova-Dateien:** Zum Zeitpunkt der Prüfung gab es für die ersten 10 Texte noch keine Datei (404). Bis dahin liest die Gerätestimme bzw. `/jetzt`. Nach dem nächsten Lauf des Werks prüfe ich gern noch einmal mit echten Dateien.
- Die Musik aus (90) gehört ebenfalls zu diesem Stand. **Web = Android.**

## 17.11.2026 (91) – Vorlesen mit Nova, texte.json, Abzeichen „Pro aktiv“ (Version 2.2.0)

Nach euren Vorgaben von 12:36 und 12:53 (Marcel: „zukünftig nur Nova“). **Thorsten ist nicht drin.** Ein Entwurf mit Thorsten war schon fertig, er ist vollständig entfernt (keine Rechen-Bausteine, kein Wörterbuch). (92) mit der Zählung ist damit erledigt.

### (a) texte.json – liegt mit 2.2.0 auf test
- **Adresse:** `https://trainer-test.mathenachhilfe-online.com/vorlesen/texte.json`. Auf live erst nach Marcels Go.
- **Format:** `{"format":1,"app":"mathe-trainer","texte":[{"text":"…","sprache":"de"},…]}`
- **Inhalt:** **774 feste Texte, zusammen 232 000 Zeichen, der längste hat 960.**
  - Jeder Theorie-Abschnitt, kurz und ausführlich, aller 73 Einheiten von Klasse 5 bis Oberstufe. Darin stecken „Formeln zum Merken“ (Formelkarten) und „Wo brauche ich das?“ (Infokarten).
  - Dazu der Probe-Satz aus den Einstellungen.
- **Erzeugung:** automatisch bei jedem Bau (`npm run fix` → `tools/vorlesetexte.mjs`). `npm run check` meldet, wenn die Liste veraltet ist. Ein Text hat höchstens 1 500 Zeichen.
- **Formeln** stehen in Worten drin, ohne KaTeX, nach einer einheitlichen Regel (`app/js/sprech.js`). Beispiele: „f Strich von x“, „x Quadrat“, „3 durch 4“, „Wurzel aus …“, „Integral von 0 bis 2 über x d x“, „Vektor A B“, „A mit den Koordinaten 2, 3 und 0“, „Alpha“.
- **Abgleich:** Die App bildet beim Vorlesen denselben Text aus der Seite. Geprüft im Browser: 213 von 213 Theorie-Abschnitten stimmen genau mit der Liste überein (Oberstufe, Klasse 7 und 9, kurz und ausführlich).
- **Kennung:** SHA-256 von `nova|de|` + Normalform, die ersten 32 Hex-Zeichen. Euer Prüfwert `cb1e6d67882767042ebaa54d163e450c` steht als Selbstprüfung im Test.

### (b) Nova in der App
- **Vorlesen:**
  - Knopf „Vorlesen“ bei jeder Aufgabe (Aufgabe, Antworten A–D, offener Tipp bzw. Lösungsweg) und bei jedem Theorie-Abschnitt.
  - Noch einmal tippen hält an. Bei der nächsten Aufgabe oder einem Seitenwechsel ist Schluss. Die Musik wird beim Vorlesen leiser.
- **Feste Texte:** direkt `…/nova/<h[0:2]>/<h>.mp3`.
- **Erzeugte Texte:**
  - In Stücken bis 300 Zeichen, an Satzenden geschnitten. Erst die direkte `/nova/`-Adresse, sonst `POST /jetzt {text, sprache}`.
  - Bei 200 `{url}` wird abgespielt und im Speicher `stimme-nova` zwischengespeichert (dann auch offline).
  - Bei 204, Fehler oder offline liest still die Gerätestimme, nur eingebaute Stimmen.
  - Gesendet wird nur `text` und `sprache`, ohne Cookies, ohne Referer, ohne Kennungen (im Test geprüft).
  - Die nächste Datei wird schon geholt, während die aktuelle spielt.
- **KI-Antworten** werden nicht über /jetzt vorgelesen; sie werden beim Vorlesen der Aufgabe ausgelassen.
- **Einstellungen → „Vorlesen“:**
  - Schalter (Werk: aus) und als Stimme „Nova – KI-generierte Stimme“ (Pflicht-Kennzeichnung).
  - „Probe hören“ und euer Datenschutz-Text vom 12:53 wörtlich.
  - **Sprechtempo** (eure Ergänzung 12:59): Regler in sechs Stufen 0,75 · 0,9 · 1,0 (Standard = euer Server-Tempo) · 1,15 · 1,3 · 1,5, gemerkt.
  - Technik: Nova-MP3 über `HTMLAudioElement` mit `playbackRate` und `preservesPitch = true`. Die Gerätestimme als Notlösung bekommt dieselbe Rate.
  - Die Android-App nutzt dieselbe Web-Seite, braucht also keinen eigenen Player.
- **Die App spricht nie mit OpenAI.** Die CSP erlaubt nur `connect-src 'self' https://stimmen.mathenachhilfe-online.com`, dazu `media-src 'self' blob:` zum Abspielen der geladenen Dateien.
- **Bitte prüfen:** CORS auf `/nova/…` und `/jetzt` für `trainer`, `trainer-test` und POST mit `Content-Type: application/json` (Vorabanfrage OPTIONS). Falls der Server einen eigenen CSP-Header schickt, braucht er dieselbe `connect-src`-Angabe.

### Abzeichen „Pro aktiv“ (eure Bitte 11:35)
- **Startseite** (ganz oben): „Pro aktiv ✓“ bzw. „Pro + KI aktiv ✓“ mit „gültig bis TT.MM.JJJJ“, bei Pro + KI dazu „heute noch N KI-Punkte“. Antippen führt zur Pro-Seite.
- **Einstellungen** und **Pro-Seite** zeigen dasselbe. Im Kopf stand die Stufe schon vorher („PRO“ bzw. „PRO + KI“).
- **KI-Punkte:**
  - Der Server meldet den Rest bisher nur mit einer KI-Antwort. Die App merkt sich diesen Wert für den Tag, ohne Meldung zeigt sie das volle Tagesguthaben (10).
  - **Bitte, wenn möglich:** eine Abfrage ohne Verbrauch, z. B. `POST /api/ki/rest {geraet, zugang} → {rest}` oder `rest` in `/api/status` bzw. `/api/zugang`.

### Geprüft
- Browser-Test (360 px), Stimmen-Server im Test nachgeahmt:
  - Theorie spielt die feste Datei ab, ohne /jetzt. Abgespielt bis zum Ende mit Tempo 1,3 und gleicher Tonhöhe.
  - Eine Aufgabe ruft /jetzt in Stücken unter 300 Zeichen auf, dann wird abgespielt.
  - Keine Cookies oder Referer, keine Fehler in der Konsole.
  - Abzeichen auf Start und in den Einstellungen.
- Selbstprüfungen: Formeln in Worten, Kennung mit eurem Prüfwert, Stücke, Format von texte.json (ohne TeX und HTML), keine OpenAI-Adresse in der App.
- `npm run check` und e2e auf allen fünf Stufen grün.
- **Nicht geprüft:** mit eurem echten Server und echten Nova-Dateien, auf einem echten Handy.

**Web = Android**, Version 2.2.0.

## 17.11.2026 (90) – Eigene Musik und Klänge (Version 2.1.0)

Euer Auftrag von 07:52 (Marcel: „Jede App soll eigene, passende Musik komponieren“). Vorlesen folgt als Nächstes, Marcel will es nacheinander.

**Klang-Identität Mathe-Trainer:**
- Ruhig, konzentriert, erwachsen: weiches Piano in D-Dur mit sanften Flächen, Lo-Fi-Farben (maj9-, m9- und sus-Akkorde).
- **Erkennungsmelodie:** d″ – a′ – e″ – fis″ – a″ über einem Dmaj9-Akkord.

**Entstehung:**
- Alles ist selbst komponiert und wird live im Browser mit Web Audio erzeugt. Es gibt keine Dateien, keine fremden Samples oder Loops und damit keine Lizenzfragen.
- **Klavierton:** Dreieck-Grundton plus zwei leise Obertöne, schneller Anschlag, langes Ausklingen, ein Tiefpass, der sich schließt („Filz-Klavier“).
- **Raum:** ein kleiner Nachhall aus selbst berechnetem, abklingendem Rauschen.
- **Fläche:** zwei leicht verstimmte Sägezahn-Stimmen hinter einem Tiefpass bei 650 Hz.
- **Bass:** ein Sinus.

**Musik** (`app/js/musik.js`, 2,5 KB, wird erst geladen, wenn die Musik eingeschaltet ist):
- Drei Stücke mit eigener Akkordfolge (A A B A) und eigenem Tempo (64–72 BPM).
- Die Melodie entsteht jedes Mal neu aus der D-Dur-Pentatonik, im leichten Swing, mal still, mal 2–5 Töne je Takt. Anschlag und Lautstärke schwanken leicht.
- Gegen nervige Schleifen: Ein Stück läuft gut drei Minuten, dann folgen 25–40 Sekunden Ruhe und ein anderes Stück.

**Effekte** (in `ui.js`):

| Effekt | Klang |
|---|---|
| richtig | Quinte d″ → a″ |
| falsch | neutral: leise offene Quinte unten, kein Fehler-Brummen |
| Stern | steigt bei Serien |
| geschafft | Akkord mit drei Tönen nach oben |
| Tages-Runde | die Erkennungsmelodie |
| Duell | Frage und Antwort, zwei Aufstiege |
| Abi-Modus geschafft | Kadenz G – A – D |
| Lernserie wächst | vier Töne nach oben mit hellem Glanz |

**Bedienung** (Einstellungen → „Klang“):
- Je ein Schalter mit eigener Lautstärke für „Töne bei Antworten“ und „Lernmusik“.
- Dazu „Klang auch in Prüfungen“ und „Probe hören“. Die Wahl wird gemerkt.
- Der Lautsprecher-Knopf oben schaltet alles stumm.

**Respekt:**
- Die Musik ist ab Werk aus und startet nie vor der ersten Berührung. Ist sie eingeschaltet, setzt sie mit der ersten Berührung ein.
- Sie folgt der Stummschaltung oben und pausiert, wenn die App im Hintergrund ist.
- Im Abi-Modus und bei der Probeklausur ist ab Werk alles still, Musik und Effekte. Zum Schluss erklingt der Abi-Klang.
- Barrierefreiheit: Jeder Ton begleitet nur, was auch auf dem Bildschirm steht.

**Schnell:** Der Start lädt 5,5 KB mehr (unkomprimiert), die Musik wird nur bei Bedarf geladen.

**Web = Android:** Die Android-App zeigt dieselbe Seite, also klingt sie gleich, mit gleicher Version 2.1.0.

**Geprüft:**
- Browser-Test: Musik-Teil beim Start nicht geladen; Pegel mit Musik 0,05, bei Stummschaltung 0, im Abi-Modus 0, danach wieder da; Einstellung nach Neuladen gemerkt; keine Fehler in der Konsole.
- Neue Selbstprüfungen in `tests/run.mjs`.
- `npm run check` und e2e auf allen fünf Stufen grün.
- Eine Hörprobe (MP3, 1:21) hat Marcel bekommen. Die Musik wurde bisher nur gemessen und nicht angehört. Marcel entscheidet nach Gehör.

## 17.11.2026 (89) – Marcels Antworten zur Korrektheitsprüfung, Theorie zu jeder Übung (Version 2.0.0)

Marcel hat die offenen Punkte aus (87) beantwortet und einen Wunsch ergänzt. Alles ist gebaut und liegt auf `test`.

1. **KI-Limit: 10 pro Tag** (Marcel: „10, vielleicht später korrigieren“).
   - Die App nennt jetzt „10 KI-Punkte pro Tag“ auf der Pro-Seite.
   - **Bitte am Server prüfen:** Die Grenze muss dort auf 10 stehen. Der Auftrag vom 17.11. nannte 15.
2. **Preise inkl. MwSt. bei der Pro-Option:**
   - Die Pro-Seite der Web-App zeigt jetzt eine Preistabelle.
     | | 30 Tage | Abi-Pass |
     |---|---|---|
     | Pro | 4,99 € | 19,99 € |
     | Pro + KI | 9,99 € | 39,99 € |
   - Darunter steht: „Alle Preise inkl. 19 % MwSt.“, der Abi-Pass gilt bis zum 31.07. des Abi-Jahres, „Pro + KI“ enthält 10 KI-Punkte pro Tag.
   - In der Android-App erscheint die Tabelle nicht, weil es dort keinen Kauf außerhalb des Stores gibt.
   - Korrektur zu (75): Erst ab jetzt zeigt die App Preise.
3. **Android: keine Website-Links, aber offen ein Hinweis auf Marcel.**
   - In der Android-App sind ausgeblendet: Probestunden- und Website-Knöpfe, Werbe-Hinweise nach Fehlern und der Website-Link im Logo oben. Impressum und Datenschutz bleiben.
   - Neu unter „Mehr“: „Wer steckt dahinter?“. Der Text nennt Mathenachhilfe Online, persönliche Mathe-Nachhilfe online und die Adresse mathenachhilfe-online.com als Text ohne Link.
   - In der Web-App ändert sich nichts.
4. **„ohne Hilfsmittel“ nur, wenn es ein Teil ohne ist.**
   - Die Probeklausur auf dem Blatt heißt bei Stufe 1–3 „ohne Hilfsmittel“, wie Teil A im Abi-Modus.
   - Ab Stufe 4 heißt sie „mit Hilfsmitteln (Taschenrechner, Formelsammlung)“.
   - Teil A/B im Abi-Modus waren schon richtig.
5. **Neu: Theorie zu jeder Übung** (Marcel: „damit es nicht frustet“).
   - Knopf „Theorie“ in jedem Schritt einer Einheit, oben neben dem Fortschritt. Das gilt auch für Spiele und den Boss.
   - Außerhalb der Einheiten steht er bei jeder Aufgabe neben „Tipp“: freies Üben, Fehler-Kartei, Klassenarbeits-Trainer, Arbeitsblatt, KI-Aufgabe.
   - Der Knopf öffnet die Theorie der passenden Einheit als Fenster über der Aufgabe, kurz und mit Pro ausführlich. Nach „Zurück zur Aufgabe“ geht die Runde genau dort weiter.
   - Nicht beim Einstufungstest und bei der Probeklausur, weil das Prüfungen sind.
   - Im freien Üben haben in allen Jahrgängen 5–10 und Oberstufe alle Aufgaben einen Theorie-Knopf (Stichprobe: 6 Aufgaben je Gebiet).
6. **Neues Versionsschema (eure Vorgabe von 07:53):**
   - Diese Version heißt **2.0.0**, war als 0.44.0 geplant.
   - Der Android-versionCode wird aus der Nummer berechnet und steigt von 4300 (0.43.0) auf 20000. Danach ergibt 2.1.0 den Code 20100, 2.1.1 den Code 20101.
   - Die Selbst-Aktualisierung vergleicht die Versionen Teil für Teil als Zahlen, also gilt 2.0.0 als neuer als 0.43.0.
7. **Web = Android:**
   - Inhalt, Funktionen, Texte und die Versionsnummer 2.0.0 sind gleich.
   - Bewusste Ausnahmen wegen der Play-Store-Regeln, mit Marcels Antwort vom 17.11.:
     - In der Android-App fehlen Website-Links, Probestunden-Werbung und die Preistabelle, denn es gibt dort keinen Kauf außerhalb des Stores.
     - Dafür steht dort der Hinweis „Wer steckt dahinter?“.
   - Vorlesen gibt es noch nicht. Musik und Vorlesen sind die nächsten Aufträge, Marcel: „erst eines fertig, dann den Rest“.
8. **Nebenbei:** Die Waage-Knöpfe („Gewicht weg“) brachen auf schmalen Handys um. Das ist behoben.

**Geprüft:**
- `npm run check` ist grün, mit neuen Selbstprüfungen für Preise, KI-Limit und Hilfsmittel.
- Browser-Test Web und Android (simuliert): Links, Hinweis, Preise und Theorie-Fenster ohne Fehler, KaTeX ohne Fehler, Seite nicht zu breit.
- 320-px-Prüfung Oberstufe und Klasse 7.
- e2e auf allen fünf Stufen grün.

## 17.11.2026 (88) – 0.43.0 liegt auf `test`

- **Stand:** main und test zeigen auf denselben Commit (06376d3), Version 0.43.0. `live` nicht angefasst.
- **Prüfungen vor dem Hochladen:**
  - `npm run check` grün.
  - Browser-Gesamttest (e2e) auf allen fünf Stufen 3, 1, 5, 2 und 4 grün: „kompletter Durchlauf ohne Fehler“, jeweils mit 36 Einheiten samt Boss und „offline ok“.
- **Android:** APK und AAB 0.43.0 lokal mit dem bisherigen Schlüssel gebaut und im Drive-Ordner „Mathe-Trainer“ abgelegt. 0.42.0 liegt jetzt in „Alt“. Der GitHub-Bau für `test` wurde gestartet.
- **Bitte:** 0.43.0 auf test prüfen und nach Marcels Go auf `live` stellen. Die offenen Fragen stehen in (87).

## 17.11.2026 (87) – Korrektheitsprüfung 17.11. (Version 0.43.0)

Auftrag laut Leitstand: vollständige Korrektheitsprüfung (Marcel per Auswahl bestätigt: „Jetzt“).

### Was geprüft wurde und wie
- **Alle Aufgaben-Erzeuger** (gen.js bis gen11.js, rund 190 Erzeuger, jeweils Stufe 1–5):
  - Je Erzeuger und Stufe 200–400 Aufgaben mit eigenen Skripten erzeugt.
  - Lösungen unabhängig nachgerechnet (harte Tests mit über 2,5 Mio. Prüfungen, dazu je Aufgaben-Art ein vollständiges Beispiel von Hand).
  - Jeden Ablenker samt Fehler-Diagnose, jeden Tipp und jeden Lösungsweg gelesen.
  - **4,18 Mio. Formeln** mit echtem KaTeX gesetzt: 0 Fehler.
- **Theorie:** alle Seiten (kurz und ausführlich) gelesen, rund 150 Beispielrechnungen nachgerechnet (Binomial, Normal, Logarithmus mit eigener Rechnung).
- **Weitere Inhalte:**
  - Infokarten, Formelkarten, Merkbild-Zuordnungen, Karteikarten.
  - Probeklausuren: 3150 Blätter (Punkte 48, Notenschlüssel, Gebiete, Länderfilter, ein Lösungsbuchstabe je Aufgabe).
  - Abi-Modus: 1600 Runden.
  - Arbeitsblätter mit Lösungsblatt, Umstell-Blatt.
  - Formel-Dungeon: alle 55 Formeln mit jeder Zielgröße, Fallen, Wächter, Spickzettel.
- **Spiele (30) und übrige Module:** Spielaufgaben mit eigenem Skript nachgerechnet (4803 Prüfungen), Eingabe-Erkennung mit 34 Grenzfällen.
- **KI-Teile:**
  - Ausdruck-Leser und KI-Prüfer mit rund 45 Grenzfällen geprüft (Polstellen, doppelte Antworten, fehlende Werte, eingeschleuste HTML-Teile).
  - Begrenzungen und „nur Klartext“ geprüft.
  - Keine Namen und keine Lernstände an die KI (geprüft).
- **Funktion:**
  - Durchklick-Prüfung jeder Seite und jedes Schritts in Klasse 5–9 (Klasse 10, Oberstufe und „mit Lernstand“ siehe unten).
  - **320-px-Prüfung** jeder Seite, jeder Theorie (kurz und lang) und jedes Schritts in allen Klassen: Formeln über dem Rand, KaTeX-Fehler, Platzhalter, Knöpfe ohne Namen, Bilder ohne alt, umbrechende Knopftexte, Konsolenfehler.
  - **Offline-Test:** App laden, Netz aus, neu laden, Seiten und Aufgabe.
  - **Android-Selbstaktualisierung:** 27 Prüfungen am Rechner.
  - Browser-Gesamttest (e2e: Pro-Codes, Klassen-Rangliste, Updates, Duell, Kartei, Bericht und mehr) auf allen fünf Stufen, Ergebnis unter (88).
- **Stufen-Test** (`tests/stufen.mjs`): grün.

### Abweichungen mit Korrektur (vorher → nachher)

**Fachliche Fehler (Aufgabe oder Bewertung betroffen)**
- **Eingabe:** „1 1/2“ wurde als 11/2 = 5,5 gelesen → jetzt gemischte Zahl 1,5. „–3“ (Halbgeviertstrich) wurde nicht erkannt → jetzt Minus.
- **gen9 (Ableitung ln, Wert):** Ein Ablenker „2/2·ln(…)“ war wertgleich mit der Lösung, es gab also zwei richtige Antworten → Ablenker geändert.
- **Formel-Dungeon Klasse 5/6:** In etwa 1 % der Aufgaben in Stockwerk 3/4 kamen negative Zwischenwerte vor → jeder Zwischenwert wird geprüft (Test erweitert).
- **Zinsen-Spiel:** Drei Zinssatz-Aufgaben waren mehrdeutig, auch höhere Sätze waren richtig → „Such den kleinsten, der reicht.“
- **gen6 Parabel „Landung“:** Ball startete teils unter dem Boden, die Frage war mehrdeutig → nur noch Abwurfhöhe > 0.
- **gen6 Zinseszins „wechsel“:** Die gerundete Zwischenzahl ergab eine um 1 Cent falsche Rechenkette → Zwischenwert mit 4 Nachkommastellen.
- **KI-Prüfer:**
  - Doppelte Antworten („x“ und „x+0“) → werden abgelehnt.
  - Antwort ohne Wert zählte als 0 → zählt nicht.
  - Integrale über Polstellen gaben Zufallswerte → werden abgelehnt.
  - „Konstante = 2“ wurde fälschlich als Code abgelehnt → behoben.
  - Name „constructor(x)“ wurde als Funktion angenommen → abgelehnt.
  - Frage, Tipps und Erklärung der KI werden jetzt als Klartext maskiert.
  - Feld „formel“ wird jetzt geprüft (max. 300 Zeichen).
- **gen6 Binomische Formel „zurück“:** Erklärung bei Vorfaktor 1 nicht setzbar (`2\cdotx`) → behoben.
- **gen2 Schar:** `k\cdotk^2` nicht setzbar → behoben.

**Falsche Tipps und Erklärungen**
- **gen4 Kosinus-Ableitung:** Tipp „(−2)·4 = −8“, Lösung +8 → „(−2)·(−1)·4 = 8“.
- **gen7 Sinusfunktion:** Ablenker 540° hieß „Das ist die Amplitude“ → richtige Fehler-Diagnose.
- **gen2:**
  - ln-Diagnose sachlich falsch.
  - „lineares Wachstum“-Ablenker mit falschem Wert.
  - Halbierungs-Diagnose sprach von Verdopplung.
  - Kombinatorik „Kreuzungen“ → „Häuserblöcke“.
- **gen8:**
  - Rueckwaerts-Ablenker (Werte passten nicht zur Diagnose).
  - Rundung 0,33/0,333 vereinheitlicht.
  - „≈“ bzw. „=“ richtig gesetzt.
- **gen11:** Frage nach dem Verhältnis AC:AB, die keine Antwort beantwortete → gestrichen.
- **Spiel Tangente:** „Links vom Hochpunkt am steilsten“ (falsch) → „je weiter links, desto steiler“.
- **Spiel Kästchen:** Erklärung „bei gleicher Fläche den kürzesten Rand“ passte nicht zur Aufgabe → „bei gleichem Rand die größte Fläche“.
- **Einheit Kurvendiskussion:** „Wendepunkt: dort ist er am steilsten“ → „Steigung am größten oder kleinsten“, denn bei x³ ist er die flachste Stelle.
- **Exponentialfunktion:** „sonst fällt sie“ → „liegt b zwischen 0 und 1, fällt sie“, denn b = 1 ist konstant.
- **Extremwert-Einleitung:** „Getränkedosen haben fast genau die Form …“ (sachlich falsch) → richtig gestellt.
- **Merkbilder:** „Scheitelwinkel“ bekam das Parabel-Bild, „Sinus, Kosinus, Tangens“ die Sinuswelle, „Gerade“ (Klasse 8) das Bild der Raumgeraden → richtige Zuordnung.
- **Formel-Dungeon:**
  - „v² = v0² + 2as“ hieß „Bremsweg“ → „Geschwindigkeit und Weg“.
  - „Hoch 3 heißt mal sich selbst“ → „3 gleiche Faktoren“.
  - Spickzettel „Bruch im Nenner“ → „Gesuchte Größe im Nenner“.
- **Probe-Arbeit Klasse 5–10:** Der Kopf nannte fest „Analysis · Stochastik · Geometrie“ → die tatsächlichen Gebiete.
- **Theorie s-test2:** Beispiele in der Reihenfolge 4, 2, 3 → 2, 3, 4.

**Sprache, Darstellung, Barrierefreiheit (Auswahl, insgesamt über 150 Stellen)**
- **Einzahl/Mehrzahl:**
  - „genau 1 Fehlversuche“, „bei 1 Treffern“, „1 Schritte bis zum Sieg“, „Es sind 1 Grad“, „Heute noch 1 KI-Punkte“, „Auch die 1 nicht-roten Kugeln“ → jeweils richtig gebeugt.
- **Schreibweise:**
  - „1x“, „−1x“, „2·0x“, „x^{3}-1x“, „3·1k²“ → „x“, „−x“, entfällt, „x³−x“, „3k²“.
  - Geld: „2,5 €“, „58,5 €“, „0,6 €“ → „2,50 €“, „58,50 €“, „0,60 €“.
  - „x=6.25“ → „6,25“.
  - „480:3 ≈ 160“ → „= 160“.
- **Grammatik:**
  - „Wie viele fehlerhaften“, „Nüsse muss“, „Bei einem Glücksrad Jedes Mal“, „wird laufend mehr“ → korrigiert.
  - Zahnrad- und Wanderer-Texte neu gefasst.
- **Typografie:** über 100 gerade Schlusszeichen (") → „…“.
- **320 px:**
  - Vier Formeln in der Theorie „Kugel“ ragten über den Rand → abgesetzt oder zweizeilig. Weitere lange Formeln vorsorglich abgesetzt.
  - Waage-Knöpfe brachen um („1 Gewicht wegnehmen“) → „Gewicht weg“ / „Teilen“, mit vollem Namen für Screenreader.
- **Schriftgrößen:** zwei feste Angaben (abenteuer.js, raum.js) → `calc(…*var(--fs,1))`, damit „große Schrift“ greift.
- **Android-Brücke:** fünf Aufrufe ohne `typeof … === 'function'` (Mitteilungen, Erinnerung aus/Stand, Update, geübt) → abgesichert.
- **Store-Text (docs/PLAYSTORE.md):**
  - „keine fremden Dienste“ war falsch, denn KI-Anfragen gehen über den eigenen Server an einen KI-Dienst → richtig gestellt.
  - Formular „Datensicherheit“ vervollständigt (Klassen-Code, Zugangscode, KI-Anfragen, Geräte-Kennung).
  - Satz zur Selbst-Aktualisierung aktualisiert.

### Was nicht prüfbar war oder offen ist
- **KI-Limit „15 Punkte pro Tag“:** Steht im Repo nirgends. Die App zeigt nur den Rest an, den der Server meldet. Die Grenze setzt der Server durch, dessen Code nicht in diesem Repo liegt. In PLAN.md und älteren Meldungen steht als Plan „Tageslimit 10“. **Bitte Zahl festlegen und am Server prüfen.** In der App ist nichts zu ändern.
- **Preise inkl. MwSt.:**
  - Die App und PLAYSTORE.md nennen keine Preise. Die Preise stehen nur in PLAN.md und den Meldungen und sind dort einheitlich (4,99 / 19,99 / 9,99 / 39,99 €).
  - Meldung (≈ Zeile 178 alt) sagt, die App zeige Preise „inkl. MwSt.“ an. Das stimmt nicht, sie zeigt keine. Preise und MwSt. stehen auf der Website (nicht in diesem Repo).
- **Store-Beschreibungen** (Kurz- und Langtext) liegen nicht im Repo.
- **Grauzone Android:** „Nachhilfe buchen“ und „Zur Website“ erscheinen auch in der Android-App. Die Website führt den Pro-Shop. Einen direkten Kauflink gibt es in der App nicht. Bitte entscheiden, ob die Links in der Android-App ausgeblendet werden sollen.
- **Nicht im Browser prüfbar:** Zeichnungen der Merkbilder (Canvas) nur über Text und Zuordnung. Echte Android-Geräte habe ich nicht getestet (nur Rechner-Test der Hülle).
- **Lehrplan-Angaben** einzelner Länder (Hessen, Bayern) nicht gegen amtliche Quellen geprüft.
- **Stilfragen bewusst gelassen:** Zum Beispiel heißt es „Probeklausur ohne Hilfsmittel“, obwohl ab Stufe 4 auch Tabellen-Aufgaben vorkommen. Das ist eine inhaltliche Entscheidung für Marcel.

## 17.11.2026 (86) – 0.42.0 liegt auf test (Commit af0b88f)

- Gesamtprüfung zweimal grün (`npm run check`), Browser-Gesamttest auf allen fünf Stufen ohne Fehler. `main` und `test` stehen auf demselben Commit.
- App-Hülle unverändert; die App-Datei 0.42.0 liegt wie gewohnt im Drive-Ordner, die alte ist in „Alt“.
- Bitte nach eurer Prüfung wie gewohnt nach Marcels Go auf `live`.

## 17.11.2026 (85) – 0.42.0 (tägliche Routine: Pro vertiefen) – Meldung „liegt auf test“ folgt nach dem Testlauf

- **Neu:** vier ausführliche Theorie-Kapitel für Klasse 7–9 (Gleichungen) und das Pro-Blatt „Umstell-Blatt“ im Formel-Dungeon (Drucken/PDF Pro, Ansehen frei; Pro-Liste in der App ergänzt).
- **Fehler:** keine Nutzer-Meldungen; ein Datenfehler in einer Klasse-6-Aufgabe behoben, zwei Anzeige-Kleinigkeiten (Bruchgröße im Dungeon, Einzahl in der Theorie).
- **Für euch:** keine neuen Speicherfelder, keine Änderung an Schnittstelle oder Abrufen, App-Hülle unverändert (`android/` nicht angefasst).

## 16.11.2026 (84) – 0.41.0 liegt auf test

- Formel-Dungeon aus (83). Gesamtprüfung grün (`npm run check`, davon `hart/dungeon` über 40 000 Prüfungen), Browser-Gesamttest Stufe 3 ohne Fehler einschließlich neuem Block „Paket 0.41.0“ (Klasse 5 bei 320 px: Stockwerk 1 komplett mit Fehler, Falle, Wächter, Freischalten; Oberstufe Stockwerk 5 mit Formeln).
- Bitte nach eurer Prüfung wie gewohnt nach Marcels Go auf `live`.

## 16.11.2026 (83) – 0.41.0: Formel-Dungeon (Gleichungen und Formeln umstellen) – Meldung „liegt auf test“ folgt nach dem Testlauf

- **Was:** Marcels Wunsch („Da haben viele echte Probleme. Bau dies sehr umfangreich ein“), Konzept von Marcel per Auswahl bestätigt. Neuer Spielmodus für **alle Klassen**: fünf Stockwerke von „x + 4 = 9“ bis „Linsengleichung nach b“, „Zinseszins nach n“ und „Schwingkreis nach L“. Jeder Schritt wird gewählt (mit Ergebnis), falsche Schritte sind typische Schülerfehler und werden erklärt; Fallen-Räume (Fehler finden) und Wächter je Stockwerk.
- **Für euch wichtig:** Keine neuen Dienste, kein Server, keine Daten nach außen – alles läuft im Gerät. Neue Seite `#/dungeon`, neuer Teil im Bündel (wird erst beim Betreten geladen). Zwei neue Abzeichen (`dungeon1`, `dungeon5`) und neue Zähler im Gerätespeicher (`dungeonRekord`, `dungeonTiefe`, …).
- **Idee für euch (nur Vorschlag, nicht gebaut):** Der Rechenkern `app/js/umform.js` hängt an nichts außer `math.js` – er ließe sich auch in der Lehrkraft-Ansicht oder in anderen Apps nutzen.

## 16.11.2026 (82) – 0.40.0 liegt auf test (Commit d103422)

- Browser-Gesamttest auf allen fünf Stufen ohne Fehler, Durchklick Oberstufe und Klassen 5, 7, 9 nur mit den bekannten Fehlalarmen. `stand.json` auf `test` zeigt 0.40.0.
- Bitte nach eurer Prüfung wie gewohnt nach Marcels Go auf `live`. Hinweise aus (81) zu `app/b/` und Kompression beachten.
- Als Nächstes baue ich auf Marcels Wunsch den **Formel-Dungeon** (Gleichungen und Formeln umstellen, Schritt für Schritt) als 0.41.0.

## 16.11.2026 (81) – 0.40.0: Aufgaben werden nachgeladen, erster Start wieder schnell (Marcel: „bau um“) – Meldung „liegt auf test“ folgt nach dem Testlauf

- **Was:** Der erste Bildschirm lädt nur noch 0,57 MB Programm (vorher 1,96 MB). Die Aufgaben-Erzeuger (rund 1,4 MB in 13 Teilen) holt die App direkt danach im Hintergrund. Start, Lernen, Prüfung, Mehr und Stufe sind sofort da; Seiten mit Aufgaben zeigen bis dahin „Aufgaben werden geladen …“.
- **Messwerte, erster Start bis bedienbar (Labor wie in (70)):**

| Netz | 0.37.0 | 0.39.0 | 0.40.0 |
|---|---|---|---|
| Slow 4G ohne Kompression | 7,6 s | 11,6 s | **5,4 s** |
| Slow 4G mit gzip | 2,9 s | 4,1 s | **2,2 s** |
| schnelles Netz | 0,17 s | 0,18 s | 0,16 s |
| zweiter Start | 0,13 s | 0,14 s | 0,10 s |

- **Für euch wichtig:** (1) `app/b/` enthält jetzt 18 Dateien statt 3; alle `teil-….js` tragen eine Prüfsumme im Namen und dürfen lange im Zwischenspeicher bleiben, `b/app.js` weiter mit `no-cache`. (2) Der Offline-Speicher und `stand.json` führen alle Teile – nach dem ersten Besuch läuft die App wie bisher ganz ohne Netz. (3) Neuer Ordner `app/js/a/` (erzeugte Platzhalter, `npm run fix` pflegt sie; `npm run check` schlägt fehl, wenn sie veraltet sind). Nachrechnen am Server weiter mit `app/js/gen*.js` – daran ändert sich nichts. (4) Kompression bleibt die größte Stellschraube (5,4 s → 2,2 s).

## 16.11.2026 (80) – KI für Schulen: Preisvorschlag (Marcel, 16.11.: „KI für Schulen auch, mit Preisvorschlag“)

**Nachtrag, Marcel 16.11. abends: „Erstmal ohne.“ – KI für Schulen kommt vorerst nicht; der Vorschlag unten bleibt nur als Vorrat.**

Marcel will KI für Schulen doch anbieten. Vorschlag als Zusatz zur Lehrkraft- bzw. Schul-Lizenz (je Schuljahr bis 31.07., inkl. 19 % USt), gerechnet mit eurer Messung von 1,1 Cent je Abruf und 10 Monaten Nutzung:

| Zusatz „KI“ | Preis | Netto | Deckel am Server | KI-Kosten höchstens | bleibt netto mindestens |
|---|---|---|---|---|---|
| je Klasse (zur Lehrkraft-Lizenz) | 79 € | 66,39 € | 400 Abrufe je Monat | 44 € | 22 € |
| je Schule (zur Schul-Lizenz) | 499 € | 419,33 € | 2 500 Abrufe je Monat | 275 € | 144 € |

- **Enthalten:** KI-Erklärung, KI-Tutor und KI-Auswertung für alle Schüler der Klasse. Nicht enthalten: Rechenweg-Prüfer per Foto und KI-Aufgaben (teurer je Abruf – erst messen).
- **Schutz:** Deckel je Klasse bzw. Schule und Monat am Server, dazu Tageslimit 3 je Schüler. Ist der Deckel erreicht, zeigt die App „Für diesen Monat aufgebraucht“ statt eines Fehlers; im Prüfungsmodus ist KI immer aus.
- **Daten:** wie bei Pro + KI – nur Aufgabe und Rechenweg, nie Name, Klasse oder Lernstand.
- Die Zahlen sind ein Vorschlag; der Deckel ist die Stellschraube, nicht der Preis. Marcel entscheidet.

## 16.11.2026 (79) – 0.39.0 liegt auf `test` (enthält 0.38.0)

- Zweig `test` = `main` = Version **0.39.0**: Stufen-Nachweis (76) und die fünf Geometrie-Arten (77).
- Geprüft: `npm run check` grün (Grundprüfungen, Stufen-Test für alle 147 Erzeuger, rund 3,4 Mio. unabhängige Nachrechnungen); Gesamttest im Browser alle fünf Stufen ohne Fehler; Durchklick Oberstufe, Klasse 5, 7 und 9 ohne echte Befunde.
- Offen bei euch: Kompression am Server (jetzt wichtiger, siehe (76)), `b/app.js` mit `no-cache`. `live` setzt nur ihr nach Marcels Go.

## 16.11.2026 (78) – Konzept Lehrerzugang (euer Auftrag vom 16.11., von Marcel direkt bestätigt) – nur Vorschlag, nichts gebaut

**1. Was die Lehrkraft im Mathe-Trainer sieht und steuert**
- **Aufträge an die Klasse:** Themen (Einheiten oder einzelne Aufgaben-Arten), Stufe 1–5 (fest oder „mindestens“), Anzahl Aufgaben, Frist. Sonderformen: Probeklausur bzw. Probe-Arbeit (feste Aufgaben für alle über einen Startwert, damit vergleichbar) und Abi-Prüfungsmodus.
- **Ergebnisse:** je Schüler und Auftrag erledigt ja/nein, Anteil richtig, Stufe, Dauer; je Schüler und Thema Anteil richtig der letzten 20 Aufgaben; für die Klasse die drei schwächsten Themen. Kein Verlauf einzelner Antworten.
- **Prüfungsmodus:** Auftrag ohne Tipps, ohne KI, ohne Lösungsweg bis zur Abgabe; Ergebnis erst nach der Frist sichtbar.
- Was die Lehrkraft nicht sieht: Streak, Spielstände, Punkte außerhalb von Aufträgen (bleibt freiwillig in der Rangliste).

**2. Daten aus der App (so knapp wie möglich)**
- Beim Beitritt wie heute: Klassen-Code, Spitzname, zufällige Kennung des Geräts. Kein Konto, keine Mail, kein Klarname.
- Je Auftrag eine Meldung: Auftrags-Kennung, Kennung, erledigt, richtig/gesamt, Stufe, Dauer in Minuten, Zeitpunkt.
- Für die Themen-Übersicht höchstens einmal am Tag: je Thema richtig/gesamt (nur Themen der Klasse, nur solange der Schüler Mitglied ist).
- Die App holt Aufträge ab (`GET …/klasse/<code>/auftraege`), der Server schickt nichts von sich aus außer der vorhandenen Erinnerung.
- Verlassen der Klasse löscht die Daten des Schülers am Server; Lehrkraft kann Schüler und Klasse löschen und Ergebnisse als CSV ausgeben.

**3. Beitritt**
- Wie heute über Klassen-Code; neu zusätzlich QR bzw. Link `…/#/klasse/<CODE>` (öffnet die App mit eingetragenem Code, Schüler tippt nur den Spitznamen). In der Android-App derselbe Link als App-Link.
- Spitznamen prüft die Lehrkraft in ihrer Liste und kann sie entfernen. Ein Gerät kann in mehreren Klassen sein.

**4. Frei und Schullizenz, Preisvorschlag**
- **Frei für jede Lehrkraft:** eine Klasse, Beitritt, Rangliste, einfache Aufträge (Thema + Anzahl + Frist), „erledigt ja/nein“.
- **Schullizenz:** beliebig viele Klassen, Ergebnisse je Schüler und Thema, Prüfungsmodus, Probeklausur als Auftrag, Export – und **Pro für alle Schüler der Klasse**, solange die Lizenz gilt (Drucken/PDF, Schwächen-Blatt, Theorie ausführlich und die neu nach Pro verschobenen Teile). KI ist nicht enthalten (laufende Kosten); als Zusatz buchbar.
- **Zusammenspiel mit MT-PRO:** Der Server meldet der App beim Klassen-Abruf `pro: true, bis: <Lizenzende>`; die App behandelt das wie einen Zugang der Art „Schule“. Ein eigener Pro-Code des Schülers bleibt gültig und gewinnt, wenn er mehr kann (Pro + KI) oder länger läuft. Tritt der Schüler aus oder endet die Lizenz, fällt nur der Schul-Zugang weg.
- **Preisvorschlag (inkl. 19 % USt, je Schuljahr):** Klassenlizenz 59 € (eine Lehrkraft, bis 35 Schüler; netto 49,58 €) · Schullizenz 349 € (alle Klassen einer Schule; netto 293,28 €) · Zusatz KI für eine Klasse 249 € (netto 209,24 €; Tageslimit je Schüler 5). Ohne Deckel könnten 30 Schüler bei voller Nutzung über 10 Monate rund 500 € KI-Kosten erzeugen – deshalb am Server je Klasse deckeln, Vorschlag 1 500 Abrufe je Monat (≈ 16,50 € im Monat, ≈ 165 € in 10 Monaten bei 1,1 Cent je Abruf). Vergleichspreise anderer Anbieter für Schulen habe ich nicht belastbar gefunden – bitte gegenprüfen. Schulen brauchen Rechnung mit ausgewiesener USt und meist Zahlung auf Rechnung (Überweisung).

**Offen für Marcel:** Preise, ob KI für Schulen angeboten wird, ob die freie Stufe eine oder mehrere Klassen erlaubt.
## 16.11.2026 (77) – 0.39.0: fünf Aufgaben-Arten zur Analytischen Geometrie (euer Auftrag vom 16.11., von Marcel direkt bestätigt) – Meldung „liegt auf test“ folgt nach dem Testlauf

- **Schon vorhanden war:** Mittelpunkt und Diagonalen-Schnittpunkt (genMittelpunkt), Spiegelung an beliebiger Ebene/Gerade (genSpiegelung), Punktprobe (genGeradePunkt), Lage zweier Geraden (genLage).
- **Neu** (`app/js/gen11.js`, eigene Aufgaben und Zahlen, nichts von der Vorlage übernommen):
  1. **Punkte im Raum** – in welcher Koordinatenebene, auf welcher Achse, in zwei Ebenen zugleich, gleich weit von zwei Achsen, Parameter t (Abstand von einer Achse; gleich weit).
  2. **Spiegeln** – an Koordinatenebene, an Achse, zwei Spiegelungen nacheinander, an der Ebene x_i = c, rückwärts (Urbild bzw. Lage der Spiegelebene bestimmen).
  3. **Parallelogramm** – vierter Punkt, Nachweis über Vektoren, Raute über Seitenlängen, Ecke und Diagonalenlänge aus dem Diagonalen-Schnittpunkt, Rechteck/Raute/Quadrat.
  4. **Gerade in Parameterform** – anderer Richtungsvektor, anderer Stützpunkt, zweite Gleichung derselben Geraden, identisch oder echt parallel, Parameter a und b.
  5. **Drei Punkte auf einer Geraden** – Prüfung über Vielfache (auch gebrochene Faktoren), eine bzw. zwei fehlende Koordinaten.
- „Punkt angeben“ ist als Auswahl-Aufgabe gebaut (die App prüft Antworten über Auswahl); die Bedingungen rechnet die Prüfdatei unabhängig nach.
- **Stufen:** Jede der fünf Arten hat fünf Stufen und besteht `tests/stufen.mjs`. Anspruch Stufe 1…5: Punkte im Raum 10 · 16 · 17 · 44 · 65 (gerundet), Spiegeln 16 · 19 · 30 · 42 · 57, Parallelogramm 17 · 24 · 39 · 65 · 83, Gerade 28 · 30 · 45 · 68 · 82, drei Punkte 18 · 40 · 46 · 50 · 77.
- **Nachtrag zu (76):** Der Stufen-Test hat bisher nur die Erzeuger gemessen, die über Endgegner und Übungslisten erreichbar sind (141). Jetzt misst er **alle 147 exportierten Erzeuger**. Dabei fiel die Lücken-Aufgabe zur Potenzregel durch; sie hat jetzt fünf echte Stufen. **0.38.0 lade ich deshalb nicht einzeln hoch – 0.39.0 enthält sie.** Aktuelle Überblicks-Tabelle (volle Tabelle: `docs/STUFEN.md`):

| Gebiet | Stufe | Anspruch | Schritte | Regeln | Grad | Tiefe | Param. | Weg | krumm |
|---|---|---|---|---|---|---|---|---|---|
| Analysis (50 Arten) | 1 | 21,6 | 7,9 | 0,16 | 0,99 | 0,96 | 0,16 | 119 | 24 % |
|  | 2 | 31,0 | 14,0 | 0,30 | 1,18 | 1,01 | 0,18 | 157 | 31 % |
|  | 3 | 44,7 | 22,7 | 0,74 | 1,63 | 1,08 | 0,20 | 210 | 40 % |
|  | 4 | 64,6 | 37,5 | 1,08 | 1,85 | 1,29 | 0,17 | 276 | 51 % |
|  | 5 | 89,9 | 56,0 | 1,59 | 1,56 | 1,32 | 0,45 | 371 | 73 % |
| Geometrie (31 Arten) | 1 | 22,8 | 7,2 | 0,23 | 0,06 | 0,42 | 0,61 | 126 | 5 % |
|  | 2 | 34,7 | 15,8 | 0,28 | 0,06 | 0,39 | 0,63 | 176 | 7 % |
|  | 3 | 50,6 | 26,8 | 0,38 | 0,06 | 0,44 | 0,76 | 223 | 22 % |
|  | 4 | 72,3 | 42,3 | 0,76 | 0,06 | 0,55 | 0,71 | 316 | 41 % |
|  | 5 | 102,0 | 61,8 | 1,34 | 0,06 | 0,51 | 1,39 | 420 | 54 % |
| Klasse 5–10 (41 Arten) | 1 | 12,2 | 3,8 | 0,07 | 0,10 | 0,25 | 0,00 | 113 | 13 % |
|  | 2 | 16,3 | 7,1 | 0,13 | 0,06 | 0,23 | 0,00 | 113 | 17 % |
|  | 3 | 23,2 | 11,4 | 0,22 | 0,10 | 0,33 | 0,00 | 141 | 26 % |
|  | 4 | 36,2 | 19,7 | 0,23 | 0,25 | 0,34 | 0,03 | 198 | 44 % |
|  | 5 | 53,4 | 29,3 | 0,38 | 0,35 | 0,57 | 0,07 | 290 | 58 % |
| Prüfungs-Operatoren (1 Art) | 1 | 8,6 | 0,0 | 0,00 | 0,00 | 0,00 | 0,00 | 227 | 0 % |
|  | 2 | 15,4 | 0,0 | 0,00 | 0,00 | 0,00 | 0,00 | 431 | 0 % |
|  | 3 | 20,5 | 0,0 | 0,00 | 0,00 | 0,00 | 0,00 | 506 | 0 % |
|  | 4 | 23,0 | 0,0 | 0,00 | 0,00 | 0,00 | 0,00 | 594 | 0 % |
|  | 5 | 31,9 | 0,0 | 0,00 | 0,00 | 0,00 | 0,00 | 602 | 54 % |
| Stochastik (24 Arten) | 1 | 16,3 | 4,3 | 0,08 | 0,00 | 0,17 | 0,26 | 118 | 39 % |
|  | 2 | 23,7 | 7,8 | 0,17 | 0,00 | 0,23 | 0,39 | 170 | 45 % |
|  | 3 | 35,9 | 15,9 | 0,40 | 0,00 | 0,37 | 0,50 | 209 | 58 % |
|  | 4 | 52,6 | 25,6 | 0,63 | 0,04 | 0,45 | 0,45 | 259 | 76 % |
|  | 5 | 74,1 | 39,1 | 1,05 | 0,04 | 0,43 | 0,37 | 416 | 79 % |

## 16.11.2026 (76) – 0.38.0: Stufen-Nachweis (euer Auftrag vom 16.11., von Marcel direkt bestätigt) – Meldung „liegt auf test“ folgt nach dem Testlauf

- **Maßstab** (`app/js/stufe.js`): Jede Aufgabe wird gemessen – Rechenzeichen im Lösungsweg (Schritte), genannte Regeln (Ketten-/Produkt-/Quotientenregel, Substitution, pq-Formel, Gegenereignis …), Grad, Verschachtelung, Buchstaben-Parameter, Länge des Lösungswegs, nicht-ganzzahliges Ergebnis; zusammen die Zahl „Anspruch“.
- **Auswahl:** Für Stufe 1 wird aus drei erzeugten Aufgaben die leichteste genommen, für Stufe 2 aus zwei; Stufe 3 wie erzeugt; Stufe 4 die schwerere aus zwei, Stufe 5 die schwerste aus drei. Das gilt in Quiz, Boss, Abi-Modus, Tages-Runde, Duell und Arbeitsblatt.
- **Inhalt:** Alle 141 Aufgaben-Arten haben jetzt fünf echte Stufen mit vollständigem Lösungsweg. Stufe 5: Scharen und Parameter, verkettete e-/ln-Funktionen, Produkt + Kette + Quotient, partielle Integration und Substitution, mehrschrittige Sachaufgaben, krumme Zahlen; in Klasse 5–10 deutlich über Schulbuch-Standard.
- **Test** `tests/stufen.mjs` (läuft in `npm run check`): je Art und Stufe 300 Aufgaben mit festem Zufall; schlägt fehl, wenn eine Stufe nicht mindestens 3 % (und 0,3 Punkte) über der vorigen liegt oder Stufe 5 nicht mindestens das 1,5-Fache von Stufe 1 erreicht. Ergebnis: alle 141 Arten bestehen. Dazu `tests/hart/*.mjs`: rund 3,3 Mio. unabhängige Nachrechnungen der neuen Aufgaben.
- **Tabelle** (Mittelwerte je Gebiet; die volle Tabelle je Aufgaben-Art × Stufe steht in `docs/STUFEN.md`):

| Gebiet | Stufe | Anspruch | Schritte | Regeln | Grad | Tiefe | Param. | Weg | krumm |
|---|---|---|---|---|---|---|---|---|---|
| Analysis (49 Arten) | 1 | 21,8 | 7,9 | 0,15 | 0,97 | 0,96 | 0,16 | 120 | 25 % |
|  | 2 | 31,0 | 14,0 | 0,28 | 1,15 | 1,01 | 0,19 | 157 | 32 % |
|  | 3 | 44,8 | 22,8 | 0,74 | 1,57 | 1,08 | 0,20 | 210 | 40 % |
|  | 4 | 64,8 | 37,6 | 1,08 | 1,84 | 1,27 | 0,17 | 274 | 52 % |
|  | 5 | 90,3 | 56,3 | 1,61 | 1,50 | 1,31 | 0,46 | 370 | 75 % |
| Geometrie (26 Arten) | 1 | 23,8 | 7,5 | 0,27 | 0,08 | 0,35 | 0,69 | 123 | 6 % |
|  | 2 | 36,4 | 17,0 | 0,33 | 0,08 | 0,35 | 0,71 | 170 | 9 % |
|  | 3 | 53,6 | 29,2 | 0,45 | 0,08 | 0,41 | 0,87 | 208 | 24 % |
|  | 4 | 75,8 | 45,4 | 0,81 | 0,08 | 0,54 | 0,73 | 314 | 43 % |
|  | 5 | 107,6 | 66,0 | 1,52 | 0,08 | 0,45 | 1,38 | 431 | 56 % |
| Klasse 5–10 (41 Arten) | 1 | 12,2 | 3,8 | 0,07 | 0,10 | 0,25 | 0,00 | 113 | 13 % |
|  | 2 | 16,3 | 7,1 | 0,13 | 0,06 | 0,23 | 0,00 | 113 | 17 % |
|  | 3 | 23,2 | 11,4 | 0,22 | 0,10 | 0,33 | 0,00 | 141 | 26 % |
|  | 4 | 36,2 | 19,7 | 0,23 | 0,25 | 0,34 | 0,03 | 198 | 44 % |
|  | 5 | 53,4 | 29,3 | 0,38 | 0,35 | 0,57 | 0,07 | 290 | 58 % |
| Prüfungs-Operatoren (1 Art) | 1 | 8,6 | 0,0 | 0,00 | 0,00 | 0,00 | 0,00 | 227 | 0 % |
|  | 2 | 15,4 | 0,0 | 0,00 | 0,00 | 0,00 | 0,00 | 431 | 0 % |
|  | 3 | 20,5 | 0,0 | 0,00 | 0,00 | 0,00 | 0,00 | 506 | 0 % |
|  | 4 | 23,0 | 0,0 | 0,00 | 0,00 | 0,00 | 0,00 | 594 | 0 % |
|  | 5 | 31,9 | 0,0 | 0,00 | 0,00 | 0,00 | 0,00 | 602 | 54 % |
| Stochastik (24 Arten) | 1 | 16,3 | 4,3 | 0,08 | 0,00 | 0,17 | 0,26 | 118 | 39 % |
|  | 2 | 23,7 | 7,8 | 0,17 | 0,00 | 0,23 | 0,39 | 170 | 45 % |
|  | 3 | 35,9 | 15,9 | 0,40 | 0,00 | 0,37 | 0,50 | 209 | 58 % |
|  | 4 | 52,6 | 25,6 | 0,63 | 0,04 | 0,45 | 0,45 | 259 | 76 % |
|  | 5 | 74,1 | 39,1 | 1,05 | 0,04 | 0,43 | 0,37 | 416 | 79 % |

- **Grenzen des Maßstabs, ehrlich:** Er liest den Lösungsweg, den der Lernende sieht – er misst also auch, wie ausführlich der Weg geschrieben ist. Deshalb haben alle schweren Aufgaben jetzt ihren vollen Rechenweg bekommen. „Grad“ sinkt in der Analysis von Stufe 4 auf 5, weil dort e-, ln- und Wurzel-Funktionen die hohen Potenzen ablösen. Die Operatoren-Aufgabe ist reine Textaufgabe (keine Rechenzeichen).
- **Für euch wichtig:** (1) Tages-Runde und Duell ziehen dadurch andere Aufgaben als 0.37.0 – Geräte mit verschiedenen Versionen sehen am selben Tag verschiedene Aufgaben. (2) **Ladezeit:** Das Bündel wächst durch die Lösungswege von 1,15 auf 1,9 MB. Erster Start im Labor bei Slow 4G: 7,6 → 11,6 s ohne Kompression, 2,9 → 4,1 s mit gzip; schnelles Netz und zweiter Start unverändert (0,18 s / 0,14 s). **Kompression am Server ist damit noch wichtiger** (Bitte aus (70)). Als nächsten Schritt schlage ich vor, die Aufgaben-Erzeuger erst bei Bedarf zu laden. (3) `npm run check` dauert jetzt etwa eine Minute länger.

## 16.11.2026 (75) – Konzept Pro: Umsatzsteuer (euer Nachtrag vom 16.11.)

Alle Preise sind Endpreise **inkl. 19 % USt** und werden in der App so angezeigt („inkl. MwSt.“).

| Angebot | Brutto | Netto | USt 19 % | Web, Überweisung | Web, PayPal | Play (15 % Gebühr) |
|---|---|---|---|---|---|---|
| Pro, 30 Tage | 4,99 € | 4,19 € | 0,80 € | 4,19 € | ca. 3,72 € | 3,56 € |
| Pro, Abi-Pass | 19,99 € | 16,80 € | 3,19 € | 16,80 € | ca. 15,95 € | 14,28 € |
| Pro + KI, 30 Tage | 9,99 € | 8,39 € | 1,60 € | 8,39 € | ca. 7,80 € | 7,14 € |
| Pro + KI, Abi-Pass | 39,99 € | 33,61 € | 6,38 € | 33,61 € | ca. 32,26 € | 28,56 € |

- **Rechenweg:** Netto = Brutto : 1,19. Web mit Überweisung: Netto kommt voll an. Web mit PayPal: Netto minus PayPal-Gebühr – gerechnet mit 2,49 % vom Bruttobetrag plus 0,35 € (Annahme, bitte mit Marcels PayPal-Vertrag abgleichen). Play: Google führt die USt ab, vom Netto gehen 15 % Gebühr ab.
- **Auffällig:** Beim kleinsten Pass (4,99 €) frisst die feste PayPal-Gebühr viel (rund 11 % vom Netto); Play liegt in jeder Zeile darunter. Bei Pro + KI gehen vom Netto noch die KI-Kosten ab (höchstens rund 3,30 € je 30 Tage beim Tageslimit 10).
- **Woo:** Produkt MT-PRO braucht Steuerklasse Standard 19 % und Preise als Bruttopreise; für Privatkunden in anderen EU-Ländern gilt deren Satz (OSS). Das kann ich von hier nicht prüfen (kein Zugriff auf den Shop) – bitte bei euch nachsehen.

## 16.11.2026 (74) – Konzept Pro: Marcels Entscheidungen (per Auswahl, 16.11.)

- **Nach Pro wandern zusätzlich:** Abi-Prüfungsmodus (eine Prüfung je Woche bleibt frei), Lernbericht mit Verlauf und Zertifikat als PDF, Klassenarbeits-Trainer Klasse 5–10.
- **Android:** Kauf direkt in der App **gleich mitbauen** – also Play-Abrechnung in der Hülle plus Prüfung am Server. Dafür braucht es ein Händler-Konto bei Google (Marcel) und am Server einen Weg wie `POST /api/zugang/google`.
- **Preise bleiben:** Pro 4,99 € / 19,99 €, Pro + KI 9,99 € / 39,99 €.
- Gebaut wird erst nach eurer Rückmeldung zum gemeinsamen Weg (wie von euch gewünscht); vorher läuft noch der Stufen-Nachweis (0.38.0).

## 16.11.2026 (73) – Konzept Pro (Antwort auf euren Auftrag vom 16.11., von Marcel direkt bestätigt) – nur Vorschlag, nichts gebaut

**1. Frei und Pro heute, Verschieben, Preise**
- **Frei:** Lernpfad mit allen Einheiten, Spielen, Boss, Abenteuer, Karte; Stufen 1–5; Tages-Runde, Duell, Blitz; Theorie kurz, Merkbilder; Lernkarten; Arbeitsblatt in der App lösen; 3 KI-Proben je Gerät.
- **Pro (4,99 € / 30 Tage, 19,99 € Abi-Pass):** Drucken/PDF mit Lösungsblatt, Schwächen-Blatt, Probeklausur, Theorie ausführlich.
- **Pro + KI (9,99 € / 39,99 €):** KI-Erklärung, KI-Tutor, Rechenweg-Prüfer (Foto), KI-Aufgaben, KI-Auswertung.
- **Vorschlag Verschieben (Marcel entscheidet):** Das Lernen selbst bleibt frei (das ist die Werbung für die Nachhilfe). Nach Pro könnten: Abi-Prüfungsmodus ab der zweiten Prüfung je Woche, Lernbericht mit Verlauf und Zertifikat als PDF, Klassenarbeits-Trainer Klasse 5–10. Nicht verschieben würde ich Stufen, Spiele und Lernkarten.
- **Preise ähnlicher Apps** (aus Store-Einträgen und Drittseiten am 16.11. gesucht, nicht auf den Anbieter-Seiten geprüft): StudySmarter Premium 9,99 €/Monat bzw. 89,99 €/Jahr · Photomath Plus im deutschen App Store 7,99 € und 49,99 € (vermutlich Monat/Jahr) · sofatutor je nach Laufzeit etwa 7,99–14,95 €/Monat bei langer Bindung. Zu simpleclub und Mathegym habe ich keine belastbaren Zahlen gefunden. **Einordnung:** Unsere Preise liegen am unteren Rand und sind Pässe ohne Abo-Falle; ich würde sie lassen.

**2. Kaufweg direkt in der Web-App**
- Knopf „Pro holen“ in der App → öffnet `…/kasse/?add-to-cart=<Varianten-ID>&quelle=app` (schlanke Kasse ohne Shop-Rahmen, das Produkt liegt schon im Warenkorb; PayPal/Überweisung wie heute, Widerrufs-Häkchen bleibt).
- Nach der Zahlung zeigt die Danke-Seite den Code und einen Knopf „Zurück zur App“ → Adresse der App mit `#/zugang/<CODE>`. Die App prüft den Code wie heute über `POST /api/zugang` und schaltet frei. Rechnung und Bestellung laufen unverändert über Woo (Mail an Kunde und Marcel).
- Bei Überweisung kommt der Code erst nach Zahlungseingang per Mail; der Link in der Mail ist derselbe.
- Dafür nötig: bei euch die schlanke Kassen-Vorlage und der Rück-Link; bei mir die Route `#/zugang/<CODE>` und der Knopf mit den Varianten. **Android:** Für digitale Inhalte in Play-Store-Apps verlangt Google die Play-Abrechnung. Der Woo-Weg darf dort nicht beworben werden (deshalb fordert die Android-App heute nie zum Kauf auf). In-App-Kauf in Android heißt also: Play-Abrechnung in der Hülle plus Prüfung am Server (wie in Meldung zu `/api/zugang/google` skizziert); Rechnung stellt dann Google, in Woo käme nur ein Nachweis-Eintrag per Server.

**3. Code-Server als gemeinsamer Lizenz-Dienst**
- Taugt als Vorlage. Den Server betreibt ihr; die Schnittstelle der App ist `POST /api/zugang { code }` → `{ art, bis, ki }` oder 404.
- Was fehlt für alle Apps: (a) App-Kennung je Code (`app: "mt"`, Vorsilbe im Code wie `MT-…`) und Prüfung, dass der Code zur anfragenden App gehört; (b) Stufe als eigenes Feld statt nur `ki`; (c) Grenze für Geräte je Code über eine zufällige Geräte-Kennung, die die App selbst würfelt (keine Personendaten); (d) Sperren bei Erstattung/Widerruf per Woo-Meldung an den Server; (e) Bremse gegen Durchprobieren (Versuche je Adresse und Stunde), Codes lang und zufällig, am Server nur als Prüfsumme gespeichert.
- Prüfung ohne Konto: Die App schickt nur Code, App-Kennung und Geräte-Kennung. Name, Mail und Bestellung bleiben in Woo; der App-Server kennt nur Code → Stufe, Laufzeit, Zähler.

**4. KI mit Claude-API**
- Sinnvoll und schon gebaut: Erklärung nach Fehler, Tutor-Nachfrage, Rechenweg-Prüfer per Foto, neue Aufgaben (am Server nachgerechnet), Auswertung nach dem Blatt. Neu denkbar: Lernplan bis zur Klausur aus den Schwächen.
- Kosten laut eurer Messung vom 14.11.: im Mittel 1,1 Cent je Erklärung. Beim Tageslimit 10 sind das höchstens rund 3,30 € im Monat je Nutzer; realistisch deutlich weniger. Foto-Prüfer und Aufgaben-Erzeugung sind teurer und brauchen ein eigenes kleineres Limit – bitte messen.
- Schutz: Limit je Code und Tag am Server, zusätzlich je Gerät; Antwortlänge begrenzt; nur Aufgabe und Rechenweg an die KI, nie Name oder Lernstand; Schlüssel nur am Server.

**Offen für Marcel:** was nach Pro wandert, Android mit Play-Abrechnung ja/nein, Preise lassen oder ändern.

## 16.11.2026 (72) – 0.33.0 bis 0.37.0 liegen auf `test`

- Zweig `test` = `main` = Version **0.37.0** (enthält 0.33.0 Stufen-Spreizung Analysis, 0.34.0, 0.35.0 Spreizung Stochastik/Geometrie/Klasse 5–10, 0.36.0 Schnellstart, 0.37.0 Bündel).
- Geprüft: `npm run check` grün (1 271 349 Prüfungen); Gesamttest im Browser für 0.36.0 und 0.37.0 je alle fünf Stufen ohne Fehler; Durchklick Oberstufe und Klasse 7 ohne echte Befunde.
- Offen bei euch: Kompression (gzip/Brotli) prüfen, `b/app.js` mit `no-cache`, siehe (70) und (71). `live` setzt nur ihr nach Marcels Go.

## 16.11.2026 (71) – 0.37.0: Skripte gebündelt und verkleinert (Entscheidung Marcel) – Meldung „liegt auf test“ folgt nach dem Testlauf

- **Neu im Repo:** Ordner `app/b/` (drei erzeugte Dateien; Namen der Teile enthalten eine Prüfsumme und wechseln mit dem Inhalt), `tools/buendeln.mjs`, `package-lock.json`, Entwickler-Abhängigkeit `esbuild` (läuft nur beim Bauen, nicht in der App, kein neuer Dienst). `index.html` lädt jetzt `b/app.js` statt `js/app.js`. Die Quell-Dateien in `app/js/` liegen weiter im Repo und werden weiter ausgespielt (alte, noch gespeicherte Startseiten funktionieren), stehen aber nicht mehr in `sw.js`/`stand.json`.
- **Für euch wichtig:** (1) Wer `npm run check` ausführt, braucht vorher einmal `npm ci`. (2) `b/app.js` hat einen festen Namen → bitte wie `index.html` und `js/wache.js` mit `no-cache` ausliefern; `b/teil-*.js` dürfen lange gespeichert werden. (3) Kompression (gzip/Brotli) bleibt der größte Hebel, siehe Tabelle. (4) Falls der Server Tages-Runde/Duell mit dem Quelltext nachrechnet: unverändert `app/js/` verwenden, nicht `app/b/`.
- **Messwerte bedienbar, erster Start** (Labor wie in (70)): Slow 4G ohne Kompression 10,9 s (0.35.0) → 9,7 s (0.36.0) → 7,6 s (0.37.0); Slow 4G mit gzip 4,8 s → 4,4 s → 2,9 s; schnelles Netz 0,45 s → 0,24 s → 0,17 s. Zweiter Start 0,3 s → 0,2 s → 0,13 s. Erstes Bild (Ladebild) bei Slow 4G nach 0,28 s.

## 16.11.2026 (70) – 0.36.0: Schnellstart (euer Auftrag vom 16.11., von Marcel direkt bestätigt) – Meldung „liegt auf test“ folgt nach dem Testlauf

- **Gebaut:** (1) Ladebild in App-Farbe mit Logo und Ladebalken direkt in `index.html` (inline-CSS, eingebettetes SVG, hell/dunkel) – sichtbar ab dem ersten Byte, kein weißer Bildschirm mehr. (2) Balken zeigt den echten Fortschritt (geladene Programm-Dateien). (3) `modulepreload` für 72 Module, KaTeX vorgeladen und nicht mehr blockierend, CSS/Start-Skripte hinter dem Ladebild, Theorie (rund 150 kB) erst bei Bedarf. Service-Worker-Cache für den zweiten Start unverändert.
- **Messwerte vorher → nachher** (Labor: Chromium, 390 px, Mittel aus 3; „Slow 4G“ = 1,6 Mbit/s, 150 ms; „bedienbar“ = Startseite steht):

| | erstes Bild | bedienbar |
|---|---|---|
| Slow 4G, erster Start, ohne Kompression | 1,54 s → 0,30 s | 10,9 s → 9,7 s |
| Slow 4G, erster Start, mit gzip | 0,85 s → 0,29 s | 4,8 s → 4,4 s |
| Slow 4G, zweiter Start | 0,06 s → 0,07 s | 0,26–0,35 s → 0,20–0,21 s |
| schnelles Netz, erster Start | 0,06–0,08 s → 0,04–0,10 s | 0,43–0,48 s → 0,22–0,26 s |
| schnelles Netz, zweiter Start | 0,06 s → 0,06–0,07 s | 0,31–0,36 s → 0,17 s |

  „Erstes Bild“ war vorher nur die Kopfzeile über weißer Fläche; jetzt ist es das Ladebild.
- **Bitte an euch (größter Hebel, liegt am Server):** prüfen, ob `trainer…` JS/CSS/HTML **komprimiert** ausliefert (gzip oder Brotli). Ohne Kompression braucht der erste Start bei Slow 4G rund 10 s, mit gzip rund 4,5 s. Außerdem: `index.html` ist jetzt 14 kB (Logo eingebettet) und sollte wie bisher `no-cache` bleiben.
- **Sicherheits-Regel der Seite (CSP) unverändert** – kein eingebettetes Skript, nur eingebettetes CSS (war schon erlaubt). Android-Hülle unverändert.

## 16.11.2026 (69) – 0.35.0: Stufen steigen jetzt auch in Stochastik, Geometrie und Klasse 5 bis 10 an (Wunsch Marcel) – Meldung „liegt auf test“ folgt

- Neue Datei `app/js/gen10.js` (schwere Aufgaben für Stufe 4 und 5 zu 20 älteren Themen, `haerter()`); eingehängt in alle Einheiten von `units.js` und `units-m.js`. Keine neuen Einheiten oder Schritte, keine Schnittstelle, keine App-Hülle geändert.
- **Berichtigung zu (68) – bitte beachten:** Tages-Runde und Duell ziehen ihre Aufgaben über `practiceGens` aus den Endgegner-Listen. Dort hängen seit 0.34.0 (Analysis) und jetzt 0.35.0 (Stochastik, Geometrie) die verschärften Erzeuger. Bei gleichem Startwert entstehen deshalb **andere Aufgaben als mit 0.32.0**. Das serverseitige Nachrechnen passt nur, wenn Server und App denselben Stand haben; in der Übergangszeit (App noch alt, Server schon neu – oder umgekehrt) können eingereichte Ergebnisse abweichen. Neue Dateien für eure Liste: `gen9.js`, `gen10.js`.
- Tests: 1,27 Mio. automatische Prüfungen grün (viele Lösungen durch Abzählen aller Fälle unabhängig bestätigt); Breite bei 320 px gemessen. Browser-Gesamttest läuft nach 0.33.0 und 0.34.0.

## 16.11.2026 (68) – 0.34.0: e-Funktion und ln in Integral und Kurvendiskussion, Stufen steigen deutlich an (Wunsch Marcel) – Meldung „liegt auf test“ folgt

- Neue Datei `app/js/gen9.js` (sieben Aufgaben-Arten, `leiter()`); vier neue Schritte in den vorhandenen Einheiten `integral` und `kurve` – wer diese Einheiten schon abgeschlossen hatte, sieht dort wieder offene Schritte. Auf Stufe 4 und 5 kommen in vier Analysis-Einheiten jetzt deutlich schwerere Aufgaben. Keine Schnittstelle, keine App-Hülle.
- Tages-Runde, Duell, Abi-Modus und Blitz-Runde sind unverändert (ihre Aufgaben-Listen wurden nicht angefasst) – das serverseitige Nachrechnen ist davon nicht betroffen.

## 16.11.2026 (67) – 0.33.0: Oberstufen-Paket (euer Auftrag vom 16.11., von Marcel direkt bestätigt: „heute und sehr ausführlich“) – Meldung „liegt auf test“ folgt nach dem Testlauf

- **Umfang:** 16 neue Aufgaben-Arten (rund 85 Aufgaben-Typen, jede mit fünf Stufen, Lösungsweg/Tipps und Diagnose je Fehlantwort) in der neuen Datei `app/js/gen8.js`; vier neue Einheiten (Oberstufe jetzt 36); vier ausführliche Theorie-Kapitel. Auf Marcels Wunsch dabei: Binomialverteilung einzeln und kumuliert. Zusammen mit 0.32.0 (Klasse 5 bis 10): 28 neue Aufgaben-Arten, 12 neue Einheiten an einem Tag.
- **Tests:** 1,1 Millionen automatische Prüfungen grün (alle Erzeuger, jede Zahlen-Lösung eintippbar, keine ungültigen Werte, vieles unabhängig nachgerechnet); 381 Ansichten der neuen Einheiten bei 320 px und am PC ohne JS-Fehler und ohne Überlauf. Browser-Gesamttest (Regression, fünf Stufen) läuft.
- Neue Dateien für das serverseitige Nachrechnen, falls ihr die Liste pflegt: `gen7.js` (0.32.0) und `gen8.js`. Keine Schnittstelle, keine App-Hülle geändert.

## 16.11.2026 (66) – 0.32.0 liegt auf `test` (alle fünf Browser-Durchläufe grün, Durchklick-Prüfung Klasse 5 bis 8 und 10 ohne Befund)

- Inhalt siehe (65). Morgen (17.11.) ist auf Marcels Wunsch die Oberstufe dran.

## 16.11.2026 (65) – 0.32.0: zwölf neue Aufgaben-Arten, acht neue Einheiten für Klasse 5 bis 10 (Meldung „liegt auf test“ folgt nach dem Testlauf)

- Neue Datei `app/js/gen7.js` (wird wie die anderen Erzeuger auch vom Server zum Nachrechnen gebraucht, falls ihr die Liste dort pflegt), zwei neue Spiele. Nur Web-App, alles frei, keine Schnittstelle, keine App-Hülle.

## 16.11.2026 (64) – Entscheidung Marcel: Store-App nur über den Store, Web-App aus GitHub

- Marcel, 16.11.: „Wenn die App in den Store kommt, lädt der Store von dort. Web-App von GitHub.“
- Folge: Die Store-Fassung wird mit `MT_KANAL=aus` gebaut (kein Nachladen von Inhalten). Euer Hinweis „Store-Kanal lädt jetzt aus live“ betrifft damit keine ausgelieferte App. Die Test-App lädt weiter von GitHub (`test`). Für die Web-App ändert sich nichts. Nur Doku (`docs/PLAYSTORE.md`), kein Code.

## 16.11.2026 (63) – 0.31.0 liegt auf `test` (alle fünf Browser-Durchläufe grün)

- Inhalt siehe (62). Im Testlauf fiel eine zufallsabhängige Stelle im Abenteuer-Test auf (seit 0.15 im Test, kein App-Fehler) – behoben.
- App-Datei 0.31.0 im Drive-Ordner; die Hülle ist unverändert (Nr. 5), niemand muss neu installieren.

## 16.11.2026 (62) – 0.31.0: Tages-Paket (Meldung „liegt auf test“ folgt nach dem Testlauf)

- Danke fürs Live-Stellen von 0.30.3 (`live` = `53444f7`).
- 0.31.0: vier neue Merkbilder (Klasse 7 und 8), Serien-Anzeige in der Kopfrechen-Arena, eine Korrektur an `genBruch`. Nur Web-App, alles frei, keine Schnittstelle, keine App-Hülle.
- Hinweis zur Tages-Routine: Ihr Text sagt noch „Android lädt nie von GitHub“ – seit 15.11. (Marcel) gilt: zuerst GitHub, dann eigener Server (siehe Meldung 56).

## 15.11.2026 (61) – 0.30.3 liegt auf `test` – bereit für die Live-Freigabe (Marcel: „Warten und fixen, dann live stellen“)

- **Antwort auf eure Frage zu `klick.mjs` (Oberstufe):** Alle vier Auffälligkeiten sind Fehlalarme des Prüfskripts, einzeln nachgestellt. `steigung/0` und `g-gerade/0` sind Spiele mit Zeichenfläche (das Skript zählt nur Knöpfe); `integral/6` und `a-rotation/3` sind Boss-Schritte, nach Wieder-Rein kommt eine neue Zufallsaufgabe mit weniger Text. (Eure Nachricht kam an, meine Antwort per Nachricht wurde abgewiesen: „trusted device“ – deshalb hier.)
- **Leere Seite im Browser-Test (zweimal, bei 0.30.1 und 0.30.2):** nicht wieder aufgetreten in 7 weiteren Läufen (hell/dunkel, Stufen 2, 3, 5) und 180 gezielten Ladevorgängen. Der Test-Rechner wurde in dem Zeitraum neu gestartet (`who -b`: 21:48). Sehr wahrscheinlich Test-Umgebung, kein App-Fehler – bewiesen ist es nicht.
- **Trotzdem abgesichert (0.30.3):** Start-Wache `app/js/wache.js` – startet die App nicht binnen 12 s, lädt die Seite einmal neu, danach Hinweis mit Knopf statt leerer Seite. Der Browser-Test protokolliert Abbrüche jetzt genau.
- **0.30.3 enthält außerdem:** Leiste oben entfernt, Logo → Website (0.30.2); Web-App aktualisiert sich ohne Knopf, Such-Knopf nur in der Android-App. Für den Server: `sw.js`, `index.html` und neu `js/wache.js` bitte nicht lange zwischenspeichern.
- Geprüft: 900 000 Rechen-Prüfungen, Browser-Test hell Stufe 3 und dunkel Stufe 5 grün, Selbst-Update mit echtem Service Worker ausprobiert. Keine Änderung an App-Hülle oder Schnittstellen.

## 15.11.2026 (60) – 0.30.3: Web-App aktualisiert sich ohne Knopf (Wunsch Marcel)

- Kein „Aktualisieren“-Hinweis mehr: Die neue Fassung wird übernommen, sobald keine Aufgabe läuft. Für den Server ändert sich nichts (wie bisher `sw.js` und `index.html` nicht lange zwischenspeichern).

## 15.11.2026 (59) – 0.30.1 liegt auf `test`; 0.30.2: Leiste oben entfernt (Wunsch Marcel)

- 0.30.2: Die Leiste „Zur Website“ ganz oben ist entfernt, stattdessen öffnet das Logo oben links die Website. Nur Web-App. Meldung „liegt auf test“ folgt.

## 15.11.2026 (58) – 0.30.0 liegt auf `test`; 0.30.1 folgt (kleine Korrektur nach Durchklick-Prüfung)

- 0.30.0: alle fünf Browser-Durchläufe grün, auf `test`.
- 0.30.1: Oberstufen-Seiten leiten in Klasse 5 bis 10 auf „Testen“ um (eine davon stürzte dort ab). Neues Prüfskript `tests/klick.mjs`. Nur Web-App.

## 15.11.2026 (57) – 0.30.0: großes Paket (Meldung „liegt auf test“ folgt nach dem Testlauf)

- Neu: Zurücksetzen mit Auswahl, Kopfrechen-Arena mit Knobelaufgabe des Tages, Outfits für Pi, Klassenarbeits-Trainer, sieben neue Einheiten für Klasse 5 bis 10 (Einzelheiten im Baulog `docs/PLAN.md`).
- **Nur Inhalte der Web-App** – keine Server-Schnittstelle, keine App-Hülle. Alles im freien Teil.
- Der Klassenarbeits-Trainer verlinkt wie andere Stellen auf die Probestunde (`CONFIG.probestunde`).

## 15.11.2026 (56) – 0.29.3: Android-App holt Updates zuerst von GitHub (Entscheidung Marcel) – bitte beachten

- Marcel, 15.11.: „der Updateserver soll der Git sein“, gewählt: **GitHub zuerst, eigener Server als Ersatz**. Das ersetzt die Regel „nie GitHub“ vom 14.11.
- Folge 1: **Repo vorerst nicht privat schalten** – sonst bekommt die App von GitHub nichts mehr (sie fällt dann auf den Server zurück). Vor dem Privat-Schalten Bescheid geben, dann stelle ich auf ein öffentliches Auslieferungs-Repo um.
- Folge 2: Store-Kanal lädt aus Zweig `live` – der muss wie bisher genau das Freigegebene enthalten.
- Folge 3: Datenschutz-Text der App: Beim Aktualisieren wird GitHub aufgerufen.
- 0.28.1 liegt auf `test` (alle fünf Browser-Durchläufe grün).

## 15.11.2026 (55) – 0.29.2: Such-Knopf nennt den Grund – und eine Frage zum Test-Server

- Marcels Handy (App-Datei 0.29.1, Kanal test) meldete um ca. 13:00 beim Knopf „Nach Update suchen“: keine Verbindung, trotz WLAN. Bitte prüfen: Ist `trainer-test…/stand.json` erreichbar (Antwort 200)? Aus diesem Raum ist der Server nicht abrufbar.
- 0.29.2 zeigt künftig den genauen Grund (kein Netz / zu langsam / Antwort-Nummer / Inhalt). Hülle Nr. 4.

## 15.11.2026 (54) – 0.29.1: Knopf „Nach Update suchen“ – App-Hülle geändert (Meldung „liegt auf test“ folgt)

- Einstellungen: Knopf „Nach Update suchen“. Android: neue Brücke `MTApp.updateSuchen()` (lädt wie beim Start von der bekannten Quelle, sonst nichts Neues). Browser: Service Worker `update()`.
- Hülle Nr. 3 → Test-Geräte brauchen einmal die neue App-Datei. Keine Server-Änderung.
- Seitentitel/Beschreibung: „Klasse 5 bis Abitur“ statt „Oberstufen-Mathe“ – wird erst mit dem Live-Gang der Mittelstufe sichtbar (Marcels Go).

## 15.11.2026 (53) – 0.29.0: großes Paket für Klasse 7 bis 10 (Meldung „liegt auf test“ folgt nach dem Testlauf)

- Sieben neue Entdecker-Spiele für Klasse 7 bis 10, fünf neue Aufgaben-Arten, sechs neue Einheiten (Einzelheiten im Baulog `docs/PLAN.md`).
- **Nur Inhalte** – keine Änderung an Server, Schnittstellen oder App-Hülle. Die Android-App holt sich das selbst.
- Live-Gang der Mittelstufe weiterhin erst nach Marcels Go.

## 15.11.2026 (52) – 0.28.1: Widget der Android-App für alle Stufen – App-Hülle geändert (Meldung „liegt auf test“ folgt)

Marcels Wunsch. Das Widget zeigt Merksatz des Tages je Klassenstufe, den nächsten Lernschritt und die Lernserie.
Dafür gibt es eine neue Brücken-Funktion `MTApp.widgetStand(jahrgang, titel, adresse, serie)` – die Daten bleiben im Gerät.
**Die App-Hülle hat sich geändert** (Hüllen-Nummer steigt): Marcels Test-App zeigt „Neue App-Datei verfügbar“.
Für den Server ändert sich nichts.

## 15.11.2026 (51) – 0.28.0 liegt auf `test` (alle fünf Browser-Durchläufe grün)

Inhalt wie in (50). Nichts für den Server, App-Hülle unverändert. Für 0.26.0 bis 0.28.0 (Mittelstufe) gilt weiter:
Live-Freigabe erst nach Marcels Go.

## 15.11.2026 (50) – 0.28.0: vier weitere Entdecker-Spiele für Klasse 5 und 6 (Meldung „liegt auf test“ folgt nach dem Testlauf)

Nur App-Seite, alles frei, keine Änderung an Schnittstelle, Speicherfeldern oder App-Hülle. Keine neuen Nutzer-Meldungen
seit dem 13.11. Der Bau der Android-App bei GitHub für 0.27.0 war erfolgreich.

## 14.11.2026 (49) – 0.27.0 liegt auf `test` (alle fünf Browser-Durchläufe grün, jetzt auch mit jeder Einheit der Klassen 5 bis 10)

Inhalt wie in (47) und (48): Klassenwahl 5 bis 10 und Oberstufe, 16 Mittelstufen-Einheiten, vier Entdecker-Spiele und eigene
Optik für Klasse 5 und 6; behobener Anzeigefehler „17{,}5 %“. Nichts für den Server, App-Hülle unverändert.
Auf `test` warten damit 0.22.1 bis 0.27.0 auf die Freigabe. **Bitte vor der Live-Freigabe von 0.27.0 Marcels Go abwarten** –
die Öffnung für die Mittelstufe ist eine Richtungsänderung, die auch Texte nach außen betrifft.

## 14.11.2026 (48) – 0.27.0 ersetzt 0.26.0 im Testlauf: Spiele und kindgerechte Optik für Klasse 5 und 6

Marcels Rückmeldung zur Mittelstufe: „Bei den Kleineren spielerisch, intuitiv, pädagogisch passend, optisch für Kinder.“
0.27.0 enthält alles aus (47) und zusätzlich vier Entdecker-Spiele sowie eine eigene Optik für Klasse 5 und 6.
Nur App-Seite; für den Server ändert sich gegenüber (47) nichts. Ich melde, sobald es auf `test` liegt.

## 14.11.2026 (47) – 0.26.0: Mathe-Trainer für Klasse 5 bis 10 und Oberstufe (Meldung „liegt auf test“ folgt nach dem Testlauf)

Marcels Auftrag: Die App wird für alle Stufen geöffnet. Was das für euch bedeutet:

1. **Neues Speicherfeld** im Gerät: `jahrgang` (`'5'`…`'10'`, `'os'`). Geht nicht an den Server.
2. **Schnittstelle unverändert.** KI-Erklärung, Tutor und Rechenweg-Prüfer arbeiten in der Mittelstufe wie bisher (es gehen
   weiter nur Aufgabe, Formel und Antworten an den Server). **KI-Aufgaben** (`/api/ki/aufgabe`) bleiben vorerst nur in der
   Oberstufe sichtbar, weil euer Vorrat nach Oberstufen-Themen sortiert ist. Wenn ihr Vorrat für die Mittelstufe anlegen
   wollt: Die Themen-Namen stehen in `app/js/gen6.js` (unten, `fn.topic`).
3. **Tages-Runde, Duell, Klassen-Rangliste:** vorerst nur Oberstufe – der Server rechnet mit demselben Code nach, daran
   ändert sich nichts.
4. **Shop-Texte / Website:** Die App spricht bald nicht mehr nur von „Oberstufe“. Texte nach außen (Store, Produktseite)
   stimme ich mit Marcel ab und melde sie hier.
5. Behobener Anzeigefehler: „17{,}5 %“ im Aufgabentext von fünf Aufgaben-Arten (seit jeher, auch live).

Bauweise und Lehrplan-Zuordnung: docs/KLASSE5-10.md.

## 14.11.2026 (46) – 0.25.0 liegt auf `test` (alle fünf Browser-Durchläufe grün)

Inhalt wie in (45). Nichts für den Server, App-Hülle unverändert. Auf `test` warten damit 0.22.1 bis 0.25.0 auf die Freigabe.

## 14.11.2026 (45) – 0.25.0: ausführliche Theorie stark erweitert (Meldung „liegt auf test“ folgt nach dem Testlauf)

Marcels Rückmeldung: „Kurz und ausführlich ist fast gleich.“ Jetzt hat jedes der 31 ausführlichen Kapitel zusätzlich
Hintergrund, zwei bis vier weitere Beispiele und Sonderfälle (neue Datei `app/js/theorie-mehr.js`). Nur App-Seite, Pro.

## 14.11.2026 (44) – 0.24.0 liegt auf `test` (alle fünf Browser-Durchläufe grün)

Ausführliche Theorie für alle 31 Einheiten (Pro). Nur App-Seite, nichts für den Server, App-Hülle unverändert.

## 14.11.2026 (43) – 0.23.0 liegt auf `test` (alle fünf Browser-Durchläufe grün); 0.24.0 folgt nach dem Testlauf

0.23.0 wie in (42) beschrieben. 0.24.0 bringt die ausführliche Theorie für alle 31 Einheiten (15 neue Kapitel, Pro).
Beides nur App-Seite, keine Änderung an Schnittstelle, Speicherfeldern oder App-Hülle.

## 14.11.2026 (42) – 0.23.0: Fehlersuche und fünf neue Theorie-Kapitel (Meldung „liegt auf test“ folgt nach dem Testlauf)

Nur App-Seite. Behoben: abgeschnittener App-Name in der Kopfzeile auf schmalen Handys, überbreite Formeln in fast allen
Theorie-Kapiteln, zwei Knöpfe bei großer Schrift, Schreibweise in fünf Aufgaben-Arten. Neu: fünf ausführliche
Theorie-Kapitel (Pro). Keine Änderung an Schnittstelle, Speicherfeldern oder App-Hülle.

## 14.11.2026 (41) – fertig: Stand zum Abschluss des Verkaufsstarts

Antwort auf eure Nachricht von 15:05:

1. **Themen-Plan:** Marcel hat im Trainer-Raum per Auswahlfenster entschieden – **alle vier Schwerpunkte** (Erlebnis, Pro
   vertiefen, Lehrplan-Lücken, Klasse 5 bis 10). Steht in docs/PLAN.md, die tägliche Routine arbeitet danach.
2. **Offene Fehler:** keine bekannt. Alle fünf Browser-Durchläufe von 0.22.0 und 0.22.1 sind grün.
3. **App-Datei im Drive:** Ordner „Mathe-Trainer“ enthält **0.22.1** (APK + Play-Store-Paket), 0.22.0 liegt in „Alt“.
   Marcel hat 0.22.0 auf dem Handy installiert. Zusätzlich baut GitHub die App bei jeder neuen Fassung auf `test` selbst.

**Auf `test` liegt 0.22.1** (siehe (40)) – bitte bei Gelegenheit live freigeben (Schriftgröße, Versionsanzeige; nichts für
den Server). Offen bei euch: Zugang für das automatische Abholen einrichten, bevor Marcel das Repo privat stellt (siehe (38)).

## 14.11.2026 (40) – 0.22.1 liegt auf `test` (alle fünf Browser-Durchläufe grün)

Schriftgröße wählbar, „Über diese App“ mit Version/Datum, `POST /api/ki/aufgabe/abgelehnt {id, geraet, zugang?}` wird nach
einer im Gerät abgelehnten KI-Aufgabe gesendet (Antwort wird nicht ausgewertet). Nichts Neues für den Server.
Marcel hat die Android-App 0.22.0 installiert; mit 0.22.1 auf der Test-Seite prüft er die Selbst-Aktualisierung.

## 14.11.2026 (39) – 0.22.0 liegt auf `test` (alle fünf Browser-Durchläufe grün) – bereit für den Verkaufsstart

Inhalt wie in (38): `CONFIG.ki = true` (KI überall, wo `/api/status` → `ki: true` meldet), Shop-Link „Pro holen“,
Merkbilder/Funken aus 0.21.0, Selbst-Aktualisierung der Android-App (bitte `stand.json` mit ausliefern).
Aus App-Sicht könnt ihr live freigeben, `premium: true` live schalten und das Shop-Produkt sichtbar machen.
**0.22.1 folgt gleich** (Schriftgröße wählbar, „Über diese App“ mit Version/Datum, `POST /api/ki/aufgabe/abgelehnt` wird
genutzt) – dafür nicht warten. Neu im Repo: `.github/workflows/apk.yml` (GitHub baut die Android-App selbst; die alte
Pages-Vorschau ist entfernt). Bitte nichts davon ausliefern – betrifft nur GitHub.

## 14.11.2026 (38) – 0.22.0 statt 0.20.1: KI für live freigeschaltet + Selbst-Aktualisierung der Android-App

**Zum Verkaufsstart (eure Nachricht von 12:30):** Marcel hat hier bestätigt und entschieden, dass der KI-Schalter in
**0.22.0** kommt (nicht als eigene 0.20.1), zusammen mit 0.21.0 (Merkbilder, Funken) und der Selbst-Aktualisierung.

- `CONFIG.ki = true`. **Bedeutung:** KI ist überall dort an, wo `GET /api/status` → `ok: true, ki: true` meldet – egal ob
  `stufe` „test“ oder „live“. Meldet der Server `ki: false` (oder antwortet nicht), bleibt die KI aus. Ihr schaltet also
  weiterhin am Server.
- Shop-Link `…/produkt/mathe-trainer-pro/` steht als „Pro holen“ bei jedem „gehört zu Pro“-Hinweis und auf „Deine Stufe“ –
  nur in der Web-App, in der Android-App nicht.
- Ich melde in (39), sobald 0.22.0 nach dem Testlauf auf `test` liegt.

**Selbst-Aktualisierung der Android-App** – Quelle ist **euer Server**, nicht GitHub:

1. **Neue Datei `app/stand.json`** (Version + Prüfsumme jeder Datei, erzeugt `npm run fix`). **Bitte mit ausliefern** wie jede
   andere Datei unter `app/` (Test: `https://trainer-test…/stand.json`, live: `https://trainer…/stand.json`). Die Android-App
   liest sie beim Start, lädt nur geänderte Dateien nach und prüft jede gegen ihre Prüfsumme. Keine neuen Server-Funktionen
   nötig, nur statische Dateien; bitte keine Weiterleitung auf diesen Adressen.
2. Marcels Test-Fassung lädt von der Test-Seite, die spätere Store-Fassung (`MT_KANAL=store`) nur von der Live-Seite – also
   immer nur das, was ihr freigegeben habt.
3. **Marcel will das Repo privat stellen** („ist ja später Pay“). Bitte vorher sicherstellen, dass euer automatisches Abholen
   von GitHub dann noch Zugriff hat (Deploy-Schlüssel o. Ä.), und Marcel sagen, wann er umstellen kann.

Einzelheiten: docs/PLAYSTORE.md, Abschnitt „Selbst-Aktualisierung“.

## 14.11.2026 (37) – 0.21.0 liegt auf `test` (alle fünf Browser-Durchläufe grün)

Nur App-Seite, nichts für den Server: neun weitere Merkbilder (jetzt 26) und ein Funkenregen bei richtiger Antwort.
App-Datei 0.21.0 liegt im Drive. Live-Freigabe wie immer durch euch nach Marcels Go.

## 14.11.2026 (36) – 0.20.0 liegt auf `test` (alle fünf Browser-Durchläufe grün)

Enthält alles aus (34) und (35): KI-Aufgaben (mit 202-Wiederholung), KI-Auswertung, Merkbilder, Stufe sichtbar
(`#/pro`, Marken), Theorie im App-Aussehen, aufgeräumte Startseite; Probeklausur und Schwächen-Blatt verlangen bei
`premium: true` einen gültigen Zugang. App-Datei 0.20.0 liegt im Drive (neue APK nötig: ja, wie bei jeder Version der
Offline-Fassung). Bitte testen; Live-Freigabe wie immer durch euch nach Marcels Go.

## 14.11.2026 (35) – Antwort auf euren Auftrag (5 Punkte) und Stand 0.20.0

1. **0.18.0 liegt seit 09:30 auf `test`** (alle fünf Browser-Durchläufe grün): Tutor, Rechenweg-Foto mit Hinweis vor der
   Aufnahme, Guthaben in Punkten, „unbefristet“. Einlösen eines Codes ist seit 0.17.0 drin und im Test abgedeckt
   (falsche Form, unbekannter Code, richtiger Code, Neuladen, Entfernen). **Ihr könnt das Shop-Produkt aus App-Sicht freigeben.**
2. **KI-Sachaufgaben und Auswertung sind gebaut** (inkl. 202-Wiederholung) und stecken in **0.20.0**, das gerade durch den
   Testlauf geht (0.19.0 ist darin aufgegangen). Ich melde hier, sobald es auf `test` liegt.
3. **Themen-Plan als Auswahl für Marcel** – steht unten in dieser Meldung.
4. **Handy-Erinnerung:** fertig seit 0.13.1 (echter Schalter, freie Uhrzeit, Anleitung bei gesperrter Erlaubnis); in der
   Android-Offline-App seit 0.15.2 als geräteinterne Erinnerung ohne Server.
5. **`app/icons` → `app/img`:** abgeschlossen. Den Ordner gibt es nicht mehr, keine Datei der App verweist darauf;
   `tools/check.mjs` lässt den Ordner nicht wieder zu.

**Neu in 0.20.0 nach Marcels Rückmeldung vom Handy** („statisch“, „überladen“, „Pro muss sichtbar sein“): 17 bewegte
Merkbilder, Theorie im App-Aussehen, Stufe unter dem App-Namen und Seite „Deine Stufe“ (`#/pro`), Marken „PRO“/„KI“ an
allen zugehörigen Knöpfen, Startseite aufgeräumt. **Für den Server:** Probeklausur und Schwächen-Blatt verlangen jetzt
ebenfalls einen gültigen Zugang, sobald `premium: true` gemeldet wird (bisher nur Druck/PDF und „Ausführlich“).

**Themen-Plan für den laufenden Ausbau (zur Auswahl durch Marcel)** – je Woche ein Schwerpunkt, täglich ein Paket:
- **A – Lehrplan-Lücken schließen (Vorschlag):** Wurzel- und Umkehrfunktion · Integralfunktion · Newton-Verfahren ·
  zweiseitiger Test · Histogramme · Hesse-Form und Schnittgerade · windschiefe Geraden · Spiegelungen · Ortskurven.
- **B – Pro vertiefen:** Theorie ausführlich für alle 32 Einheiten · Abi-Aufgaben am Stück als PDF · Klausur-Varianten ·
  Lernkarten-Sets · Lern-Auswertung für Eltern.
- **C – Erlebnis:** ein Merkbild für jede Formel · Bildschirm für Bildschirm lebendiger · neue Spiele je Gebiet.
- **D – Klasse 5–10** als zweiter Bereich (eigener Lehrplan-Abgleich, eigenes Großprojekt).
Marcel bekommt die Auswahl im Trainer-Raum als Auswahlfenster; bis dahin fahre ich A, B und C im Wechsel.

## 14.11.2026 (34) – 0.19.0: App-Seite für `/api/ki/aufgabe` und `/api/ki/auswertung`; Merkbilder

- **Angebunden nach euren Angaben:** `aufgabe` (Body `{thema, stufe, stil, geraet, zugang?}`; bei `202 {bereit:false}` wartet die
  App 25 s und fragt bis zu dreimal; `toQuestion()` prüft im Gerät erneut, abgelehnte Aufgaben werden nicht gezeigt) und
  `auswertung` (Body `{ergebnis:[{thema, richtig}], geraet, zugang?}` – nach einem in der App gelösten Arbeitsblatt).
  Einstieg „KI-Aufgaben“ erscheint auf der Prüfungs-Seite nur, wenn `kiArten` „aufgabe“ enthält.
- **Themen-Namen, die die App schickt:** die Themen der vorhandenen Aufgaben-Arten (z. B. „Kettenregel“, „Baumdiagramm“,
  „Spurpunkte“). Falls euer Vorrat andere Namen erwartet, nennt mir die Liste.
- **Hinweis zu abgelehnten Aufgaben:** Lehnt das Gerät eine Aufgabe ab, ist der Punkt schon verbraucht. Wenn ihr mögt:
  eine Adresse zum Zurückmelden (`POST /api/ki/aufgabe/abgelehnt {id}`), damit die Aufgabe aus dem Vorrat fliegt und der
  Punkt zurückkommt. Kein Muss.
- Sonst für den Server nichts Neues: Merkbilder, Figuren und Begrüßung laufen ganz im Gerät.
- Reihenfolge der Auslieferung: 0.18.0 ist im Testlauf und geht danach auf `test`, 0.19.0 folgt mit eigenem Testlauf.

## 14.11.2026 (33) – 0.17.0 liegt auf `test`; 0.18.0 mit Tutor und Rechenweg-Prüfer folgt nach dem Testlauf

- **0.17.0 ist auf `test`** (alle fünf Browser-Durchläufe grün): Arbeitsblatt, Probeklausur, Theorie, Lernkarten, KI-Proben mit
  Rest-Anzeige, Feld „Zugangscode“ (sichtbar bei `premium: true`), Stufe des Zugangs. **Ihr könnt `premium: true` auf der
  Testseite einschalten** – dann kann Marcel seine Test-Codes einlösen. App-Datei 0.17.0 liegt im Drive.
- **0.18.0 (kommt nach dem Testlauf auf `test`)**: App-Seite für `/api/ki/frage` und `/api/ki/rechenweg` nach euren Angaben,
  Guthaben-Anzeige in Punkten, `bis: 9999-…` als „unbefristet“, Schwächen-Blatt, voller Rechenweg auf dem Lösungsblatt.
- **Service Worker:** fasst Anfragen an `/api/…` nicht mehr an (gehen immer direkt zum Server).
- Bereit für `/api/ki/aufgabe` und `/api/ki/auswertung`, sobald ihr sie meldet.

## 14.11.2026 (32) – Marcel: Pro + KI massiv ausbauen – Vorgaben für vier KI-Adressen

Danke für (31), Messung und Shop. Marcel 14.11.: Beide Stufen sollen deutlich wachsen, damit sich der Preis lohnt. Pro
(ohne KI) baue ich allein aus. Für **Pro + KI** brauche ich von euch diese Adressen (Vorschlag, bitte bestätigen/ändern;
alle nur mit gültigem Code der Stufe „Pro + KI“, sonst 402; eigenes Tageslimit je Art; nie Namen, nie Lernstand):
1. **Tutor mit Rückfragen** – `POST /api/ki/frage { frage, formel, richtig, gewaehlt, verlauf: [{ wer: "ich"|"ki", text }], text, geraet, zugang }`
   → `{ text, rest }`. `verlauf` höchstens 6 Einträge, `text` (die Rückfrage des Schülers) höchstens 300 Zeichen. Der Server
   prüft, dass es um die Aufgabe geht (kein freier Chat), und speichert den Verlauf nicht.
2. **Rechenweg-Prüfer** – `POST /api/ki/rechenweg { frage, formel, richtig, bild (JPEG, base64, höchstens 1 MB – die App
   verkleinert vorher) oder text, geraet, zugang }` → `{ text, zeile? , rest }`. Eigenes Limit (Vorschlag 3 am Tag), Bild
   nach der Antwort verwerfen. **Datenschutz bitte vorher klären:** Fotos können Namen enthalten – Hinweis in der App vor
   der Aufnahme, Abschnitt in 10a.
3. **KI-Sachaufgaben** – `POST /api/ki/aufgabe { thema, stufe, stil: "abi" }` → `{ aufgabe }` im Format aus `docs/KI.md`,
   vom Server mit `app/js/ki/verify.js` nachgerechnet, aus einem Vorrat.
4. **Auswertung eines Arbeitsblatts** – `POST /api/ki/auswertung { themen: [..], ergebnis: [{ thema, richtig: true|false }], geraet, zugang }`
   → `{ text, rest }` (höchstens 900 Zeichen: was sitzt, was üben, in welcher Reihenfolge).
Reihenfolge nach Nutzen für Schüler: 1, 2, 3, 4. Sagt mir, welche ihr zuerst baut – ich baue die App-Seite dazu, jeweils
hinter `ki`-Stufe und erst sichtbar, wenn `/api/status` die Art meldet (Vorschlag: `kiArten: ["erklaer","frage",…]`).

## 14.11.2026 (31) – Marcel: zwei Bezahl-Stufen („Pro“ und „Pro + KI“); neue Pro-Funktionen ohne Server

- **Marcel 14.11. (Auswahl): zwei Stufen.** „Pro“ = Druck/PDF mit Logo (Arbeitsblatt, Probeklausur, Theorie) und Theorie
  ausführlich – ohne laufende Kosten. „Pro + KI“ = Pro plus KI-Funktionen mit Tageslimit. Beide als 30-Tage-Pass und Abi-Pass.
- **Bitte am Server:** `POST /api/zugang` (und `/api/ki/erklaer` bei gültigem Code) zusätzlich **`ki: true|false`** liefern
  („hat dieser Zugang die KI dabei?“). Ohne `ki` nimmt die App `true` an (heutiger Stand). Mit Code ohne KI soll
  `/api/ki/erklaer` wie ohne Code zählen (Proben) bzw. `402` liefern. Shop: vier Produkte (Pro/Pro + KI × 30 Tage/Abi-Pass).
- **Neu in der App, alles ohne Server und ohne KI** (Version 0.17.0 auf `test`): Arbeitsblatt-Generator (`#/blatt`, gleiche
  Blatt-Nummer = gleiches Blatt), Probeklausur (12 Aufgaben, 48 BE, Notenpunkte-Tabelle), Theorie (`#/theorie`, kurz für alle
  Einheiten, ausführlich für sechs), Lernkarten (`#/karten`). Druck/PDF und „ausführlich“ sind in der App als Pro markiert und
  **frei, solange `premium: false`** ist; sobald ihr `premium: true` meldet, braucht es einen gültigen Zugang im Gerät.
- **Preise (Marcel 14.11., „nimm so“):** Pro 4,99 € (30 Tage) / 19,99 € (Abi-Pass); Pro + KI 9,99 € / 39,99 €.
- **Bitte messen und melden:** Kosten je KI-Erklärung (Mittel/Maximum). Damit wird das Tageslimit festgelegt: Bei 9,99 €
  bleiben nach MwSt. und Store-Gebühr rund 6,70 €; 300 Abrufe im Monat dürfen zusammen nicht mehr kosten.
- Später für den Lehrer-Modus (noch kein Auftrag): Blatt-Nummer + Ergebnis je Schüler speichern – Vorschlag folgt.

## 14.11.2026 (30) – Antwort auf (43); Marcel: beide Kaufwege (Code aus dem Shop und Kauf in der Store-App)

- Übergabe (43) gelesen, Adressen geprüft (`/api/status` mit `premium:false`, `/api/zugang` → 404 bei unbekanntem Code).
  Die App-Seite (Kennung `geraet`, Rest-Anzeige, 402-Hinweis, Code-Feld hinter `premium`) baue ich als Nächstes.
- **Marcel 14.11.: beide Kaufwege.** (a) Code aus dem Shop – für die Web-App und für Nachhilfe-Kunden (`frei`).
  (b) **Kauf direkt in der Android-App aus dem Play Store** über Google Play Billing: Abi-Pass und 30-Tage-Pass als
  einmalige Käufe (keine Abos). Kommt erst, wenn die App in den Store geht.
- Was (b) von euch braucht (später, nur zur Planung): eine Adresse, die einen Google-Kauf gegenprüft und daraus einen
  Zugang macht, z. B. `POST /api/zugang/google { produkt, kaufToken, geraet }` → wie `/api/zugang` (`{ art, bis }` plus
  einen Code, den die App speichert). Der Server prüft den Kauf über die Google-Play-Developer-API (Dienstkonto =
  Geheimnis bei euch) und bestätigt ihn dort; Rückerstattung → Zugang sperren.
- **Google-Regel beachten:** In der Store-App darf kein Link/keine Aufforderung zum Kauf auf der Website stehen. Die
  Android-App zeigt beim 402-Hinweis deshalb nur „Zugangscode eingeben“ und später den Kauf-Knopf, die Web-App den Link
  zum Shop. Gebühren laut Google-Hilfe im Umbruch (etwa 10–20 %) – bitte vor der Preisfestlegung offiziell prüfen.
- Voraussetzung bei Marcel: Google-Entwicklerkonto mit Händler-Profil.

## 14.11.2026 (29) – Marcel: KI nur in der Bezahl-Version; Vorschlag für Zugang und Zählung

Marcel hat am 14.11. entschieden (Auswahl im Trainer-Raum): **KI ist Bezahl-Funktion.** Modell: **Abi-Pass (Einmalkauf bis
zum Abi-Termin) und Monats-Abo, beides.** Für alle ohne Kauf: **3 KI-Erklärungen einmalig je Gerät** als Probe. Preis offen.
Folgen:
- **Live-Freigabe der KI bitte erst, wenn der Zugang steht.** Die App bleibt bei `CONFIG.ki = 'test'`.
- **Bitte messen:** Kosten je Erklärung (Mittel und Maximum) – ohne die Zahl kann Marcel keinen Preis festlegen.
- **Vorschlag für den Vertrag** (bitte bestätigen oder ändern, dann baue ich die App-Seite):
  1. `POST /api/zugang { code }` → `200 { art: "pass"|"abo", bis: "JJJJ-MM-TT" }` oder `404`. Der Code kommt aus dem Shop
     (Kauf → E-Mail mit Code). Die App speichert nur den Code im Gerät, kein Konto, kein Name.
  2. `POST /api/ki/erklaer` nimmt zusätzlich `zugang` (Code, optional). Antwort zusätzlich `rest` (Zahl der heute bzw. als
     Probe noch möglichen Abrufe). Ohne gültigen Code zählt der Server die **einmalige Probe (3 je Gerät)**; ist sie
     verbraucht: `402 { grund: "probe" }` → die App zeigt den Hinweis auf Premium mit Link zur Website.
     Mit Code: Tageslimit (Vorschlag 30), danach wie bisher `429`.
  3. `GET /api/status` zusätzlich `premium: true`, sobald Zugang und Shop bereit sind – dann zeigt die App das Feld
     „Zugangscode“ in den Einstellungen.
- Woran der Server ein Gerät erkennt (für die 3 Proben), wisst ihr besser; die App kann eine zufällige Kennung im Gerät
  erzeugen und mitschicken, wenn ihr das wollt (kein Personenbezug, aber löschbar – dann bitte zusätzlich IP-Bremse).
- Shop-Produkte (Abi-Pass, Abo), Code-Versand, Kündigung: liegt bei euch/Verwaltung. Vorschlag von mir, **nicht
  entschieden**: Premium gratis für aktive Nachhilfe-Kunden; Verkauf nur über die Website (keine Store-Gebühr).

## 14.11.2026 (28) – Antwort auf eure Nachricht zur KI: Erklär-Knopf auf `test` eingeschaltet (Version 0.16.1)

1. **Eingeschaltet – und zwar so, dass es nur auf der Testseite wirkt:** `CONFIG.ki = 'test'`. Die App ruft
   `GET /api/status` erst, wenn jemand an einer Aufgabe hängt (höchstens einmal je Sitzung), und zeigt den Knopf nur bei `stufe: "test"` **und** `ki: true`. Damit kann derselbe Stand später live
   gehen, ohne dass die KI dort erscheint. **Bitte lasst `stufe` in `/api/status` so** (test/live) – daran hängt der Schalter.
   Für die Live-Freigabe setze ich nach eurer Ansage `CONFIG.ki = true`.
2. Geprüft: echter Abruf gegen `trainer-test.` (200, 4,8 s, Text mit Absätzen). Anzeige mit `white-space: pre-line`,
   Lade-Hinweis mit laufenden Punkten, 429 → „für heute aufgebraucht“, 502/503 → „gerade nicht erreichbar“.
   Am echten Handy kann nur Marcel schauen.
3. **Android-App (Offline-Fassung):** spricht mit `trainer.` (live) – dort bleibt die KI also aus, bis ihr live freigebt.
4. **Felder für `/api/ki/aufgabe`:** stehen in `docs/KI.md` (Abschnitt „Format einer Aufgabe“ und Tabelle der Arten
   `ableitung`, `stammfunktion`, `integral`, `zahl`). Anfrage `{ thema, stufe, stil }`, Antwort `{ aufgabe: {…} }`.
   Der Prüfer liegt in `app/js/ki/verify.js` (`verify`, `toQuestion`; Rechenausdrücke: `app/js/ki/expr.js`) und läuft ohne Browser – ihr könnt ihn serverseitig
   unverändert einbinden. Die App zeigt KI-Aufgaben noch nirgends an; das baue ich erst, wenn euer Endpunkt steht.
5. Unter den Knöpfen steht jetzt ein Satz zum Datenschutz („nur die Aufgabe und deine Antwort gehen an einen KI-Dienst“).
   Passt das zu eurem Abschnitt 10a? Sonst nennt mir den Wortlaut.

## 14.11.2026 (27) – Version 0.16.0 (täglicher Ausbau): zwei neue Einheiten, sieben Aufgaben-Arten

Neu auf `test` (nach grünem Browser-Test): Einheiten „Wachstum mit Grenze“ und „Ebenen genauer“, je 10 neue Level in zwei
Spielen, vier kleine Fehler behoben (Details im Baulog, `docs/PLAN.md`). **Für den Server:** keine neuen Adressen, keine
neuen Speicherfelder, Schnittstelle unverändert. Hinweis für die Rangliste: Der Vorrat der Tages-Runde ist gleich
geblieben, aber zwei Aufgaben-Arten daraus (Vektor-Länge, Produktregel) würfeln bei gleichem Startwert jetzt andere
Zahlen bzw. schreiben anders. Rechnet euer Server mit dem Code der jeweils ausgelieferten Version nach, ist nichts zu
tun; nutzt er eine eigene Kopie, bitte mit dieser Version erneuern. **Neue APK nötig: ja** (Offline-Fassung packt die Web-App ein) – 0.16.0 liegt im Drive.
Nutzer-Meldungen: Abruf am 14.11. leer.

## 13.11.2026 (26) – Version 0.15.2: Erinnerung in der Android-App läuft im Gerät, ohne Server

Auf Marcels Auftrag: Die Offline-App (25) stellt die tägliche Erinnerung selbst zu (Android-Wecker, Uhrzeit des Geräts,
höchstens eine am Tag, keine nach dem Üben). **Für den Server ändert sich nichts** – die App ruft `/api/push…` in dieser
Fassung gar nicht auf. Im Browser und als installierte Web-App bleibt Web-Push wie in (33)/(34). Die Bedienung der Karte
(Schalter an/aus, Uhrzeit, Speichern) ist in beiden Fassungen dieselbe – als Vorlage für andere Apps weiter brauchbar.
Neue App-Datei 0.15.2 liegt in Marcels Drive-Ordner.

## 13.11.2026 (25) – Marcel: Android-App muss ganz ohne Internet laufen → eigene Offline-Fassung (Version 0.15.1)

Marcel (13.11., wörtlich sinngemäß): Die App muss als APK offline spielbar sein, „wer erwirbt eine Rechen-App mit
Internetzwang“ – deshalb sollen Web-App und APK künftig **parallel gepflegt** werden. Das weicht von eurer Übergabe (39)
ab (dort: eine TWA, neue APK nur bei Änderung der Hülle). Umgesetzt:
- **`android/offline/`**: eigenes Android-Projekt, packt `app/` fest ein und liefert es in einem eingebauten Browser-Fenster
  unter `https://trainer.mathenachhilfe-online.com/` aus. Kein Netz nötig, auch nicht beim ersten Start.
- **Für den Server ändert sich nichts.** Anfragen an `/api/…` gehen wie bisher an `trainer.` (gleiche Herkunft, kein CORS),
  aber nur, wenn Netz da ist. **`assetlinks.json` aus (23) wird für diese Fassung nicht mehr gebraucht.**
- **Jede Web-Version braucht ab jetzt eine neue App-Datei** (gleiche Versionsnummer). Ich baue sie bei jeder Version mit und
  lege sie in Marcels Drive-Ordner (Unterordner „Mathe-Trainer“).
- **Erinnerung:** Web-Push funktioniert in dieser Fassung nicht. Auf der Web-App bleibt alles wie in (33)/(34); für die
  Android-App kommt später eine eigene, geräteinterne Erinnerung (ohne Server).
- Nicht auf einem echten Handy geprüft (kein Gerät in diesem Raum); der Ablauf ohne Netz ist im Browser nachgestellt und grün.

## 13.11.2026 (24) – Version 0.15.0: Ruhiger Modus, Abenteuer-Modus, Karte mit Geschichte

Marcel hat aus einer Marktübersicht vier Punkte gewählt; drei sind in 0.15.0 (Branch `test`, nach grünem Browser-Test):
- **Ruhiger Modus** (Einstellungen): keine Lernserie, kein Wochen-Ziel, Boss ohne Herzen, Abi-Modus ohne Uhr.
- **Abenteuer-Modus** (`#/abenteuer`): sieben Räume, Belohnungen, Türen, Abi-Drache. Läuft ganz im Gerät, keine Server-Anfrage.
- **Karte mit Geschichte** (`#/karte`) und selbst gezeichnete Figuren (reiner Code, keine Bilddateien, keine fremden Quellen).

Für den Server ändert sich nichts: keine neuen Adressen, keine neuen Dienste, CSP unverändert.
Der vierte Punkt (**Android-Widget**) kommt mit einer neuen App-Datei; dafür bleibt die Bitte aus (23) – `assetlinks.json` – bestehen.
Live-Schaltung wie immer erst nach Marcels Go durch euch.

**Zu eurer Übergabe (39) – Web-App und APK auf demselben Stand:** verstanden, eine Quelle, jede Freigabe gilt für beide.
- **Neue APK nötig? Für 0.15.0 selbst: nein** (nur Web-Inhalt). **Für das Widget: ja**, weil sich die Hülle ändert
  (neuer Empfänger im Android-Manifest, keine neue Berechtigung). App-Datei **1.1.0 (versionCode 2)** ist gebaut,
  gleicher Schlüssel und gleicher Fingerabdruck wie in (23), liegt in Marcels Drive-Ordner. Quellen: `android/widget/`.
- **Installierte Ansicht:** Der Browser-Test prüft Manifest, Kurzbefehle und Vollbild-Angaben. Ein echtes Android-Gerät
  gibt es in diesem Raum nicht – APK und Widget sind **nicht auf einem Handy geprüft**; das muss Marcel am Gerät tun.

## 13.11.2026 (23) – Android-App-Datei ist gebaut: bitte `assetlinks.json` auf `trainer.` ablegen

Marcel hat einen Drive-Ordner für die App-Datei genannt; dort liegen jetzt die APK (zum direkten Installieren) und das AAB (für die Play Console), Version 1.0.0, Paket `com.mathenachhilfe_online.trainer`.

**Von euch gebraucht:** `https://trainer.mathenachhilfe-online.com/.well-known/assetlinks.json` (als `application/json`, ohne Weiterleitung) mit diesem Inhalt – der Fingerabdruck ist nicht geheim:

```json
[{"relation":["delegate_permission/common.handle_all_urls"],"target":{"namespace":"android_app","package_name":"com.mathenachhilfe_online.trainer","sha256_cert_fingerprints":["D6:A4:0D:42:7B:21:36:54:E6:66:F0:24:AD:C9:D2:F8:48:5F:A1:AA:51:26:62:CF:3A:EA:66:27:FE:56:D8:F8"]}}]
```

Ohne die Datei läuft die App mit Adressleiste statt im Vollbild. Der Signier-Schlüssel steht nicht im Repo; wo er aufbewahrt wird, entscheidet Marcel. Einzelheiten: `docs/PLAYSTORE.md`.

## 13.11.2026 (22) – Version 0.14.0: Android-App vorbereitet (Marcel: „Bau es zu einer coolen Android-App um“)

- Web-App: Manifest mit `id`, `shortcuts`, `screenshots` (neue Dateien `app/img/shots/*.jpg`, bewusst **nicht** in der Offline-Liste des Service Workers), `theme_color`/`background_color` jetzt `#0d1733`; Zahl am App-Symbol (`setAppBadge`); Hinweis „Als App aufs Handy“. Neuer Zähler `installNein` im vorhandenen Schlüssel `mt.v1`. Keine neuen Abrufe.
- **Bauplan der Hülle:** `android/twa-manifest.json` (Bubblewrap), Paketname `com.mathenachhilfe_online.trainer`, `enableNotifications: true`. Bauanleitung mit drei Befehlen in `docs/PLAYSTORE.md`. Der Ordner `android/` wird nicht ausgeliefert (nur `app/`).
- **Von euch gebraucht, sobald Marcel den Schlüssel hat:** die App-Datei bauen (oder Marcel über pwabuilder.com) und `/.well-known/assetlinks.json` mit dem Fingerabdruck auf `trainer.` ablegen. Für einen Test vor dem Store gern zusätzlich auf `trainer-test.` mit eigenem Paketnamen/Fingerabdruck.

## 13.11.2026 (21) – Antwort auf eure Übergabe (34): Schalter „Erinnerung an/aus“ (Version 0.13.1), Play-Store-Vorbereitung

- **Schalter** (`role="switch"`), Uhrzeitfeld nur sichtbar, wenn an. Einschalten = Erlaubnis anfragen + `POST /api/push` (Vorgabe 18:00 bzw. zuletzt gewählte Zeit); „Speichern“ = erneut `POST /api/push` mit neuer Zeit; Ausschalten = `POST /api/push/aus` + `unsubscribe()`.
- **Zustand beim Öffnen** aus `Notification.permission` und `pushManager.getSubscription()`; `erinnern` in `mt.v1` ist jetzt `{ zeit, an }` und wird dem wahren Zustand angeglichen. Fehlt die Anmeldung im Browser (euer 410-Fall), steht der Schalter auf „aus“; die gemerkte Uhrzeit bleibt für das nächste Einschalten.
- **`denied`:** Schalter bleibt aus, Schritt-für-Schritt-Anleitung (Browser / installierte App / iPhone), nichts wird gesendet.
- **Nicht installiert:** Hinweis „Am besten als App installieren …“, mit Knopf, wenn `beforeinstallprompt` vorliegt.
- **Play Store – von euch gebraucht:** `/.well-known/assetlinks.json` auf `trainer.mathenachhilfe-online.com` (Vorlage, Hinweis zu „Play App Signing“ und Prüf-Adresse in `docs/PLAYSTORE.md`), ausgeliefert als `application/json` ohne Weiterleitung. Paketname und Fingerabdruck kommen, sobald die Hülle gebaut ist; der Signier-Schlüssel bleibt bei Marcel/Bitwarden. Hülle mit Benachrichtigungs-Delegation bauen (Bubblewrap `enableNotifications: true` bzw. pwabuilder-Option).
- Browser-Test deckt ab: einschalten, Uhrzeit ändern, Neuladen, „Browser hat Anmeldung gelöscht“, erneut einschalten, ausschalten, gesperrt. Erlaubnis und Geräte-Anmeldung sind dabei nachgestellt.

## 13.11.2026 (20) – Version 0.13.0: Startseite aufgeräumt, Datum neben der Version

Nur Gestaltung und Anzeige (Fußzeile zeigt „Version X · TT.MM.JJJJ“, `STAND` in `config.js`). Keine neuen Speicherfelder, keine neuen Abrufe.

## 13.11.2026 (19) – Antwort auf eure Übergabe (33): Erinnerung mit freier Uhrzeit (Version 0.12.2)

- Uhrzeitfeld `<input type="time" step="300">`, Vorgabe 18:00; gesendet wird jedes gültige `HH:MM` (geprüft mit `/^([01]\d|2[0-3]):[0-5]\d$/`). Ändern = erneut `POST /api/push` mit neuer `zeit`. Anzeige „Erinnerung täglich um HH:MM Uhr (deutsche Zeit)“.
- `Notification.permission === 'denied'`: Hinweis mit den Schritten für Android/Chrome und iPhone, schon beim Öffnen der Einstellungen und nach dem Tipp; es wird nichts gesendet; das Feld bleibt bedienbar.
- Browser-Test ergänzt (Erlaubnis und Geräte-Anmeldung nachgestellt, weil der Testbrowser keinen Mitteilungs-Dienst hat). Echter Test auf dem Handy steht weiter aus.
- Unverändert enthalten: die Korrekturen aus 0.12.1.

## 13.11.2026 (18) – Antwort auf eure Übergabe (30): Handy-Erinnerung auf `test` eingeschaltet (Version 0.12.0)

- `CONFIG.push = true`. Die App holt den Schlüssel bei Bedarf über `GET /api/push/schluessel` (nicht fest in `config.js`), meldet an mit `POST /api/push` `{ abo, zeit }` (`zeit` aus 07:00, 15:00, 18:00, 20:00) und ab mit `POST /api/push/aus` `{ endpoint }` plus `unsubscribe()`. Erst auf Tipp in den Einstellungen (Karte „Erinnerung“), nie von selbst.
- Service Worker: `push` → `showNotification('Mathe-Trainer', { body: 'Zeit für deine Mathe-Runde', icon, tag: 'mt-erinnerung' })`; liegt doch ein Inhalt `{ "text" }` bei, wird er als Text genommen (höchstens 120 Zeichen). Tipp öffnet die App.
- Geräte ohne Push (iPhone ohne Installation) bekommen den Hinweis „nur als installierte App“.
- **Nicht echt getestet:** Im Testbrowser gibt es keinen Push-Dienst; geprüft ist nur, dass Schlüsselabruf und Fehlerfall sauber laufen. Bitte auf einem echten Android-Handy gegen `trainer-test.` prüfen.
- Neu außerdem: Leiste ganz oben mit Knopf „Zur Website“ (normaler Link auf `www.mathenachhilfe-online.com`, beim Spielen ausgeblendet).

## 13.11.2026 (17) – Version 0.11.0: KI-Erklärung und Erinnerung sind App-seitig fertig, beide aus

- **„Erklär's mir anders“** (eure Übergabe (24)): fertig, sichtbar erst mit `CONFIG.ki = true` – das setzen wir erst auf eure Ansage. Anfrage `POST /api/ki/erklaer` mit genau `{ frage, formel, richtig, gewaehlt, art }` (`art`: `einfacher` | `beispiel` | `eselsbruecke`), Antwort `{ text }`; `429` zeigt „für heute aufgebraucht“. Der Text wird als reiner Text angezeigt (HTML entfernt, höchstens 900 Zeichen).
- **Erinnerung aufs Handy:** App-Seite fertig, unsichtbar, solange `CONFIG.push` leer ist. Von euch gebraucht: Schlüsselpaar (öffentlicher Teil, base64url, kommt in `CONFIG.push`), `POST /api/push` mit `{ abo, zeit }` (`zeit` aus 07:00, 15:00, 18:00, 20:00), `POST /api/push/aus` mit `{ endpoint }`, höchstens eine Mitteilung am Tag mit Nutzlast `{ "text": "…" }` (oder leer). Vorgabe und Datenschutz-Hinweise: `docs/SERVER.md`. Neues Feld `erinnern` im vorhandenen Schlüssel `mt.v1`.
- **Neue Dateien für euer Nachrechnen:** `app/js/gen4.js` und `app/js/verbund.js` werden von `units.js` bzw. der App geladen; `makeTasks`/`POOL` sind unverändert.
- **Play Store:** Schritte, die bei Marcel bzw. euch liegen (Konto, Signier-Schlüssel, `/.well-known/assetlinks.json` auf der Live-Adresse), stehen in `docs/PLAYSTORE.md`.
- Behoben: seltener Fehler in „Abi-Aufgabe am Stück“ (Geometrie), der seit 0.10.0 auf `test` lag.

## 13.11.2026 (16) – Version 0.10.0: Rangliste auf `test` eingeschaltet (eure Übergabe (25)), viele neue Funktionen

- **`CONFIG.api = '/api'`** ab 0.10.0, `CONFIG.ki` bleibt `false`. Neu in der App: Klasse **anlegen** (`POST /api/klasse`), beitreten, **verlassen** (`POST /api/klasse/verlassen` mit `{ code, spieler }`; danach wird `klasse` im Gerät geleert, auch wenn der Server nicht antwortet). Fehlertexte `{error}` werden angezeigt. Ohne Klasse schickt die App nichts an `/api` (im Browser-Test geprüft), außer Meldungen an `/api/meldung`.
- **Wichtig für euer Nachrechnen:** `makeTasks` hat einen vierten, optionalen Parameter `land` bekommen (nur Abi-Modus). Tages-Runde und Duell rufen ihn nicht – das Ergebnis für `makeTasks(n, stufe, startwert)` ist unverändert. `exam.js` importiert jetzt zusätzlich `units.js` (für `landOk`) und `gen3.js` (Blitz-Pool); beide brauchen wie bisher nur ein leeres `tex()`.
- **Neue Felder im vorhandenen Schlüssel `mt.v1`** (kein neuer Schlüssel): `einstufung` (Ergebnis des Einstufungstests), `last` (zuletzt gespielte Einheit), `tippen`, `meldungen`. Der Name auf dem Zertifikat wird nicht gespeichert.
- **Neue Adressen in der App:** `#/einstufung`, `#/aufgabe`, `#/plan`, `#/zertifikat`.
- **Bitte entscheiden:** Erinnerung aufs Handy (Push) – Vorgabe in `docs/SERVER.md`. Und: Lese-Geheimnis für `trainer-test.`, falls wir auch Test-Meldungen abholen sollen.
- Offen bei uns aus Übergabe (24): App-Seite für „Erklär's mir anders“.

## 13.11.2026 (15) – Antwort auf eure Übergabe (28): „Fehler melden“ ist auf `test` eingeschaltet

- `CONFIG.melden = '/api/meldung'` ab Version 0.9.3. **Neu: Die App sendet damit erstmals Anfragen an die eigene Adresse** (`POST /api/meldung`, nur wenn ein Nutzer eine Meldung abschickt oder eine wartende nachgereicht wird). Sonst keine Abrufe; `CONFIG.api` und `CONFIG.ki` sind unverändert aus.
- Lese-Geheimnis für `trainer.mathenachhilfe-online.com` ist in unserer Umgebung hinterlegt; `GET /api/meldungen` antwortet 200. Für `trainer-test.` ist noch keines hinterlegt – Test-Meldungen sehen wir daher nur über Marcels Mail.
- Seit 0.9.2 merkt sich die App die zuletzt gespielte Einheit (`last` im vorhandenen Schlüssel `mt.v1`, kein neuer Schlüssel).
- **Offen aus eurer Übergabe (25):** `CONFIG.api = '/api'` und der Knopf „Klasse verlassen“ – kommt als nächstes Paket.

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
