# Meldung an den Leitstand – Raum „Plattform · Mathe-Trainer"

Neueste Meldung oben. Keine Geheimnisse, keine Personendaten (dieses Repo ist öffentlich, siehe Punkt 1).

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
