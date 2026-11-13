# Mathe-Trainer – Plan

Stand: 13.11.2026 · Status: **im Bau** (Marcels „los" am 13.11.2026).

## Baulog (neueste zuerst)

| Datum | Was | Stand |
| --- | --- | --- |
| 13.11.2026 | **Version 0.12.1 – nichts ragt mehr seitlich über den Bildschirm.** Im Browser-Test aufgefallen: Bei der „Abi-Aufgabe am Stück“ (Geometrie) war die Zeile mit den drei Punkten bei großen Zahlen breiter als das Handy; die Seite ließ sich seitlich verschieben und der „Weiter“-Knopf rutschte aus dem Bild (der Fehler lag seit 0.10.0 auf `test` und erklärte mehrere abgebrochene Testläufe). Jetzt bekommen breite Formeln einen eigenen Rollbalken, die Seite selbst nie. Der Browser-Test prüft bei jeder Aufgabe, dass nichts seitlich übersteht; zusätzlich 42 Abi-Aufgaben auf 360 px Breite nachgemessen. | Auf `test`. |
| 13.11.2026 | **Version 0.12.0 – Erinnerung aufs Handy eingeschaltet, Website-Knopf ganz oben (Marcel; Übergabe (30) des Leitstands).** **Erinnerung:** `CONFIG.push = true`; Karte „Erinnerung“ in den Einstellungen (Aus / 07:00 / 15:00 / 18:00 / 20:00). Erst auf Tipp fragt die App um Erlaubnis, holt den Schlüssel vom Server und meldet das Gerät an; abschalten löscht die Anmeldung beim Server. Mitteilung „Zeit für deine Mathe-Runde“, höchstens einmal am Tag. **Website:** dunkle Leiste ganz oben auf allen Seiten mit Knopf „Zur Website ↗“ (am breiten Bildschirm stattdessen „Nachhilfe buchen“ in der Kopfzeile), beim Spielen ausgeblendet. **Fehler behoben:** „Ableitung zeichnen“ ließ auf Stufe 1 eine komplett falsch herum gezeichnete Ableitung durchgehen – jetzt besteht auf keiner Stufe, wer auf mehr als einem Viertel der Breite das falsche Vorzeichen zeichnet. | Auf `test`. Die Erinnerung ist nur gegen einen nachgestellten Server geprüft – Test auf echtem Handy steht aus. |
| 13.11.2026 | **Version 0.11.0 – „umsetzen und abschließen“ (Marcel): fünf Level-Sätze je Spiel, PC zweispaltig für alle Spiele, „Erklär's mir anders“, Erinnerung (App-Seite), fünf neue Lehrplan-Einheiten.** **Spiele:** Alle elf Spiele haben jetzt für jede der fünf Schwierigkeiten einen eigenen Level-Satz (neu: „sehr leicht“ und „anspruchsvoll“, zusammen rund 70 neue Level); Tests prüfen jeden Satz auf Lösbarkeit und dass kein Level doppelt vorkommt (dabei zwei alte Doppelungen gefunden und ersetzt). **PC:** Auch Surfer, Ableitung zeichnen und Werkstatt zweispaltig. **KI:** „Erklär's mir anders“ (einfacher / mit Beispiel / Eselsbrücke) nach Fehlversuchen – sichtbar erst mit `CONFIG.ki = true`; gesendet werden nur Aufgabe, richtige und gewählte Antwort; Antwort als reiner Text; Tageslimit-Hinweis. **Erinnerung aufs Handy:** App-Seite fertig (`app/js/erinnern.js`, Einstellungen, Service Worker), unsichtbar bis `CONFIG.push` den Server-Schlüssel enthält. **Neue Einheiten** (`app/js/gen4.js`, 13 Aufgaben-Arten): gebrochen-rationale Funktionen, Sinus und Kosinus, Rotationskörper und uneigentliche Integrale, Zufallsgrößen und Unabhängigkeit, Kugeln/Abstände/Ebenen – mit Länder-Zuordnung (`docs/LEHRPLAN.md`, Nachtrag). **Fehler behoben:** Abi-Aufgabe Geometrie konnte selten eine zweite richtige Geradengleichung anbieten (war seit 0.10.0 auf `test`). **Play Store:** Vorbereitung in `docs/PLAYSTORE.md`. | Auf `test`. Jetzt 30 Einheiten, 71 Aufgaben-Arten, 11 Spiele mit je 5 Level-Sätzen. Nicht gebaut: englische Fassung (Entscheidung Marcel nötig). Push und KI warten auf Schlüssel bzw. Freigabe des Leitstands. Play Store braucht Marcels Google-Konto. |
| 13.11.2026 | **Version 0.10.0 – „alles einbauen“ (Marcel): Einstufungstest, Rechenweg, Abi-Aufgaben am Stück, Lernplan, Zertifikat, Spiele am PC zweispaltig, Klassen-Rangliste an.** **Einstufungstest** (`#/einstufung`): zwölf Aufgaben (je Gebiet zwei Grundlagen, zwei Oberstufe), Ergebnis je Gebiet mit Rat (Grundlagen / Oberstufen-Stoff / schwerer üben), Vorschlag für die Schwierigkeit zum Übernehmen, bei schwachem Ergebnis Hinweis auf die Probestunde; für neue Nutzer auf der Startseite angeboten. **Rechenweg Schritt für Schritt:** nach dem zweiten Fehlversuch und nach jeder nicht auf Anhieb gelösten Aufgabe aufklappbar (Schritte aus den gestuften Tipps, am Ende das Ergebnis). **Abi-Aufgaben am Stück** (`#/aufgabe`, `app/js/verbund.js`): ein Sachverhalt mit vier bis fünf Teilaufgaben a)–e) für Analysis (Funktionsuntersuchung), Stochastik (Bernoulli-Kette) und Geometrie (Punkte im Raum), Bewertung in BE nur für den ersten Versuch. **Lernplan** (`#/plan`): verteilt die offenen Einheiten auf die Wochen bis zum Abi-Termin, „diese Woche“ steht auf der Startseite. **Zertifikat** (`#/zertifikat`): je geschafftem Gebiet zum Ausdrucken, Name nur für den Ausdruck, wird nicht gespeichert. **PC:** Spiele mit einer Zeichenfläche zweispaltig (Grafik links, Regler rechts). **Klassen-Rangliste eingeschaltet** nach Übergabe (25) des Leitstands (`CONFIG.api = '/api'`): Klasse anlegen, beitreten, **verlassen** (Server löscht den Eintrag). `CONFIG.ki` bleibt aus. | Auf `test`. Noch nicht gebaut: Erinnerung aufs Handy (braucht Server und Einwilligung, Vorgabe in `docs/SERVER.md`), „Erklär's mir anders“ (App-Seite für die KI), englische Fassung (zurückgestellt, sehr großer Umfang). |
| 13.11.2026 | **Version 0.9.3 – „Fehler melden“ ist eingeschaltet.** Der Leitstand hat den Server-Teil gebaut (Übergabe (28)): `POST /api/meldung` nimmt Meldungen an und schickt sie als E-Mail von der system@-Adresse an Marcel; `GET /api/meldungen` liefert sie dem Trainer-Raum. In der App `CONFIG.melden = '/api/meldung'`. Das Lese-Geheimnis liegt als Netzwerk-Geheimnis in der Umgebung des Trainer-Raums (nicht im Repo); Abruf geprüft (Antwort 200, Liste leer). Die tägliche Routine holt die Meldungen ab jetzt ab. Browser-Test: wartende und neue Meldung kommen beim nachgestellten Server an, nur erlaubte Felder, Warteschlange wird leer. | Auf `test`. `live` setzt der Leitstand, sobald der Datenschutztext live ist. Offen aus Übergabe (25): Rangliste einschalten (`CONFIG.api`) und „Klasse verlassen“ einbauen. |
| 13.11.2026 | **Version 0.9.2 – Startseite in sinnvoller Reihenfolge (Marcel: „wieso steht oben Murmelbahn und unten erst die Auswahl?“).** Oben jetzt die Auswahl der Gebiete, darunter der klar benannte Vorschlag: „Neu hier? Empfohlener Einstieg“ beim ersten Besuch, „Zuletzt gespielt – hier geht es weiter“ danach (die App merkt sich die zuletzt gespielte Einheit im vorhandenen Speicher `mt.v1`), sonst „Dein nächster Schritt“. | Auf `test`. |
| 13.11.2026 | **Version 0.9.1 – alle Spiele passen auf eine Seite, Knöpfe zur Website (Marcel).** Beim Spielen ist die App-Kopfzeile ausgeblendet, Abstände sind kleiner, und jede Zeichenfläche richtet ihre Höhe nach dem Bildschirm (eigene Regeln für Spiele mit zwei Zeichenflächen: Surfer, Ableitung zeichnen, Werkstatt). Vermessen mit allen zehn Spielen auf 360 × 640 und 393 × 760, Stufe 3 und 5: kein Scrollen nötig (Werkstatt auf dem kleinsten Bildschirm: 4 px). **Website:** Knopf „Zur Website von Mathenachhilfe Online“ in den Werbe-Kästen auf Start und „Mehr“, Eintrag „Zur Website“ im Hilfe-Menü, am PC zusätzlich „Nachhilfe buchen“ in der Kopfzeile. | Auf `test`. |
| 13.11.2026 | **Version 0.9.0 – Knopf immer sichtbar, Breitbild-Ansicht für den PC (Marcel: „immer so, dass auch der Button auf einer Seite ist, ohne Scrollen“; „am PC ist es nicht schön“).** **Handy:** Der Haupt-Knopf jedes Spiels und jeder Aufgabe („Murmel los!“, „Prüfen“, „Weiter“) klebt unten am Bildschirm; auf kleinen Bildschirmen wird die Zeichenfläche niedriger, damit Regler und Knopf auf eine Seite passen. Der Hilfe-Knopf sitzt beim Spielen oben neben dem Fortschrittsbalken und verdeckt nichts. **PC/Tablet quer (ab 900 px):** Menü oben in der Kopfzeile, Seite bis 1000 px breit, Einheiten und Schritte in zwei Spalten, Gebiete in vier, Hover-Effekte, Spiel-Bühne mittig. **Prüfung:** Der Browser-Test prüft bei jedem Schritt, dass der Haupt-Knopf ohne Scrollen im Bild ist, und testet zusätzlich ein PC-Fenster (1440 × 860). | Auf `test`. Offen: Spiele am PC zweispaltig (Grafik links, Regler rechts). |
| 13.11.2026 | **Version 0.8.0 – Lehrplan-Abgleich Bayern/Hessen, Bundesland-Schalter filtert jetzt.** Alle Einheiten gegen LehrplanPLUS (Bayern) sowie Kerncurriculum und Abiturerlasse 2027/2028 (Hessen) geprüft; Ergebnis, fehlende Themen, Unsicherheiten und Quellen in `docs/LEHRPLAN.md`. **Wirkung in der App:** Für „Hessen – Grundkurs“ sind Hypothesentests, Normalverteilung/Sigma-Regeln, ln ableiten und Kreuzprodukt als „nicht im Grundkurs“ markiert, stehen am Ende und kommen in Abi-Modus, Boss, gemischten Runden und freiem Üben nicht vor; „weitermachen“ führt erst durch den Prüfungsstoff. Bayern und Hessen-LK: alles gilt. Neue Seite „Was gilt wo?“ (aus den Einstellungen). Tages-Runde und Duell bleiben ungefiltert, damit sie für alle gleich sind. | Auf `test`. Offen: Gegenprüfung durch eine Lehrkraft (Liste in `docs/LEHRPLAN.md`); fehlende Themen je Land haben Vorrang im täglichen Ausbau. |
| 13.11.2026 | **Version 0.7.0 – freie Eingabe und Hilfe-Knopf mit „Fehler melden“ (Marcel).** **Freie Eingabe:** Bei 19 Aufgaben-Arten mit Zahlen-Ergebnis tippt man das Ergebnis ein, statt auszuwählen (Komma-Zahlen, Brüche wie 7/4, Prozent). Wer einen typischen Fehler eintippt, bekommt genau dessen Diagnose; nach zwei Fehlversuchen gibt es „Auswahl zeigen“ als Ausweg. Einstellung „Ergebnis selbst eintippen“: Automatisch (ab Stufe 4) / Immer / Nie. Boss, Blitz und Runden auf Zeit bleiben Auswahl. **Hilfe-Knopf** unten rechts auf jeder Seite: Fehler melden, Idee schicken, Probestunde. Die Meldung nimmt Version, Seite, Stufe und – bei Aufgaben-Fehlern – die zuletzt gezeigte Aufgabe mit; keine Namen, keine Kennung. **Versand ist vorbereitet, aber aus** (`CONFIG.melden`): Er braucht einen kleinen Server-Teil (E-Mail von der system@-Adresse an Marcel, Ablage für den Trainer-Raum) – Vorgabe in `docs/SERVER.md`. Bis dahin warten Meldungen im Gerät und werden nachgereicht. **Prüfung:** Jede eintippbare Lösung wird im Test „eingetippt“ und muss anerkannt werden, jeder Ablenker abgelehnt; dabei fiel auf, dass eine Aufgaben-Art Prozent anzeigt, aber Anteile speichert – wird jetzt erkannt und umgerechnet. | Auf `test`. Offen: Server-Teil für den Versand (Leitstand). |
| 13.11.2026 | **Version 0.6.0 – Grundlagen in jedem Gebiet und freies Üben (Marcel: „in jedem Bereich auch Grundlagen … zum Beispiel Vierfeldertafel … allgemeine Übungen“).** **Drei Grundlagen-Einheiten**, in jedem Gebiet an erster Stelle: *Rechnen und Gleichungen* (Brüche, Klammern/binomische Formeln, Potenzgesetze, lineare und quadratische Gleichungen, Gerade durch zwei Punkte), *Daten und Zufall* (Prozent, relative Häufigkeit, Mittelwert/Median/Spannweite, Laplace, Gegenereignis, Vierfeldertafel), *Dreiecke, Flächen, Vektoren* (Pythagoras, Sinus/Kosinus/Tangens, Flächen und Volumen, Mittelpunkt, Rechnen mit Vektoren) – je mit Erklärkarten, Boss, „Wo brauche ich das?“ und Formelkarten. **16 neue Aufgaben-Arten** (`app/js/gen3.js`), alle mit fünf Stufen und Fehler-Diagnose. **Neues Spiel „Vierfeldertafel füllen“** (`games/tafel.js`): Zahlen eintippen, falsche Felder werden markiert, der Hinweis nennt die Zeile oder Spalte, deren Summe nicht stimmt; leicht = viele Angaben, mittel = vier Angaben, schwer = Angaben nur im Text (Medikamententest, Schnelltest, Umfrage). **Freies Üben** je Gebiet (`#/ueben/<gebiet>` und `…-grund`): zehn gemischte Aufgaben, immer neu, mit Punkten und „Noch eine Runde“. Blitz-Runde um sieben Grundlagen-Arten erweitert; der Abi-Modus bleibt bei Oberstufen-Stoff. | Auf `test`. 25 Einheiten, 58 Aufgaben-Arten, 11 Spiele. Die neue Erst-Runde eines Nutzers bleibt die Murmelbahn. |
| 13.11.2026 | **Version 0.5.1 – Schwierigkeit wirkt jetzt wirklich (Marcel: „Stufe 5 gewählt, das sind die gleichen Aufgaben“).** Ursache: Die zehn Spiele hatten auf jeder Stufe dieselben Level, nur Toleranz und Tipps änderten sich; dazu waren fünf Aufgaben-Arten auf Stufe 3 und 5 zu 50–100 % gleich. **Spiele:** jedes Spiel hat drei eigene Level-Sätze – leicht (Stufe 1–2), mittel (3), schwer (4–5) – über `levelsFor(stufe)`; innerhalb eines Satzes unterscheiden weiterhin Toleranz und Tipps. Schwer heißt z. B.: Murmelbahn mit drei Reglern in Viertelschritten, Flug mit gespiegelten Kurven (negatives a), Surfer mit Sinus und unsymmetrischem Polynom, Fläche unter Sinus und e-Funktion, Lotse nur Linearkombinationen mit negativen Faktoren, Werkstatt mit vier Aufgaben. **Aufgaben:** Integral (höherer Grad, negative Grenzen), Produktregel (Stufe 5 quadratischer Faktor), ln (Stufe 4–5: x^n·ln x und ln(ax²+b)), Scharen (Stufe 5 kubisch mit Verschiebung), Sigma-Regeln (Stufe 4–5 „außerhalb“). **Prüfung:** neuer Test – jede Aufgaben-Art muss auf Stufe 5 andere Aufgaben stellen als auf Stufe 1 (höchstens 25 % gleich) und Stufe 3 (höchstens 60 %); alle Level-Sätze aller Spiele werden auf Lösbarkeit geprüft; leicht/mittel/schwer dürfen kein Level teilen. | Auf `test`. Offen: Stufe 1 und 2 sowie 4 und 5 teilen sich in den Spielen den Level-Satz – eigene Sätze je Stufe folgen im täglichen Ausbau. |
| 13.11.2026 | **Version 0.5.0 – „cool für Schüler" (Marcel: drei Favoriten, alles ohne Server, Server und KI vorbereiten).** **Abzeichen und Titel:** 28 Abzeichen für Können (auf Anhieb richtig, Serien, Abschlüsse, Boss, Blitz, Abi-Modus), sieben Titel von „Einsteiger" bis „Mathe-Legende", Seite „Erfolge". **Kombo:** richtige Antworten in Folge geben Bonus-Punkte und eine Kombo-Anzeige. **Blitz-Runde:** 60 Sekunden, Kombo-Faktor bis ×5, Rekord. **Boss-Aufgabe** am Ende jeder der 22 Einheiten: eine Stufe schwerer, ohne Tipps, drei Herzen, Lebensbalken. **Erfolgskarte:** Ergebnis als Bild mit Logo zum Teilen oder Speichern. **Kurven-Flug:** neues Spiel zur Sinusfunktion (Amplitude, Periode, Verschiebung). **Farben zum Freischalten** (sechs Akzentfarben nach Punkten). **Wochen-Ziel** mit Truhe (5 Tage, +50 Punkte). **„Wo brauche ich das?"** in jeder Einheit. **Abi-bereit-Balken**. **Formelsammlung:** 41 Formelkarten, je Einheit freigeschaltet, druckbar. **Server vorbereitet:** Gegenstelle `app/js/api.js` und Klassen-Rangliste, abgeschaltet bis es einen Server gibt; Vorgaben in `docs/SERVER.md`. **KI vorbereitet:** Aufgaben-Format, Rechenausdruck-Leser ohne `eval` und Prüfer, der jede KI-Aufgabe nachrechnet (`app/js/ki/`); Vorgaben in `docs/KI.md`. Meldungen erscheinen jetzt oben und verdecken keine Knöpfe mehr. Jetzt 22 Einheiten, 100 Schritte, 11 Spiele. **Nicht gebaut:** Jump-and-Run (zu aufwendig für dieses Paket), Wochen-Liga, Echtzeit-Duell, Lehrer-Ansicht, Foto-Korrektur – dafür nur Vorgaben. | siehe Meldung |
| 13.11.2026 | **Version 0.4.0 – Menüführung, aufgeräumte Startseite (Marcel: „mach ein Menü rein, räume es intuitiv auf").** Untere Menüleiste mit vier Einträgen: **Start** (weitermachen, Countdown, fällige Wiederholung, Tages-Runde, vier Gebiets-Karten), **Lernen** (erst Gebiet wählen: Analysis, Stochastik, Analytische Geometrie → dann die Einheiten; Schwierigkeit dort und in den Einstellungen), **Prüfung** (Abi-Modus, Tages-Runde, Duell, Operatoren), **Mehr** (Fehler-Kartei, Eltern-Bericht, Einstellungen, App installieren, Probestunde, Impressum/Datenschutz). Die Startseite listet keine einzelnen Einheiten mehr und ist kurz. Zurück-Links führen eine Ebene hoch (Einheit → Gebiet → Gebiete). Die Leiste verschwindet, solange gespielt wird. Browser-Durchlauf prüft Menü, Markierung, Länge der Startseite und den Weg Lernen → Gebiet → Einheit. | Auf `test` → trainer-test |
| 13.11.2026 | **Version 0.3.1 – Hell/Dunkel-Schalter wie auf der Website (Marcel).** Runder Knopf mit Mond/Sonne oben rechts, gleiche Logik wie `nho-look` der Website: gespeicherte Wahl, sonst Geräte-Einstellung; kein Aufblitzen beim Laden (`js/look.js`). Wahl liegt nur im Gerät (`localStorage`, Schlüssel `mt.look`). Laufende Spiele färben ihre Zeichenflächen beim Umschalten sofort neu. Kopfzeile passt auch auf 360 px Breite. Geprüft: Schalter-Test im Browser-Durchlauf (wechselt, bleibt nach Neuladen), Durchlauf hell und dunkel. | Auf `test` → trainer-test |
| 13.11.2026 | **Version 0.3.0 – Trainer inhaltlich komplett (Marcel: „das machst du jetzt, damit der Trainer soweit komplett ist").** Alle Punkte der Fehl-Liste gebaut. **Analysis:** Kurvendiskussion (Wendepunkte, Monotonie, Symmetrie, Grenzwerte, gemischte Runde), Extremwertaufgaben mit Spiel **Extremwert-Werkstatt**, Tangentengleichung, Steckbrief, Funktionenscharen, ln-Funktion, Wachstum, Fläche zwischen Graphen. **Stochastik:** Vierfeldertafel, bedingte Wahrscheinlichkeit, kumulierte Binomialverteilung, Sigma-Regeln, Normalverteilung, Hypothesentests (Begriffe, Ablehnungsbereich), Kombinatorik. **Geometrie:** drehbare 3D-Ansicht (Spiel **Raum-Blick**), Punktprobe, Lage von Geraden, Ebenen, Schnittpunkt Gerade–Ebene, Kreuzprodukt, Abstände, Winkel. **Prüfung:** Operatoren-Training. **Übergreifend:** Bundesland-/Kurs-Schalter und Abi-Termin (Einstellungen), **Abi-Modus** auf Zeit in Teil A (ohne Hilfsmittel) und Teil B (mit Hilfsmitteln) mit Notenpunkte-Prognose und Fehler-Rückblick, **Abi-Countdown** mit Tagesziel, **Fehler-Kartei** (Wiederholen nach 1, 3, 7, 16 Tagen), **Eltern-Bericht** (Stärken, Schwächen, Abi-Ergebnisse; Drucken/Teilen), **Tages-Runde** (für alle dieselben Aufgaben) und **Duell per Link** (Gegner bekommt dieselben Aufgaben), eigene Bestwerte. Jetzt **22 Einheiten, 76 Schritte, 9 Spiele, 42 Aufgaben-Erzeuger**. Geprüft: `npm run check` (264.971 Prüfungen, alle Stufen) und Browser-Durchlauf aller Einheiten und Funktionen auf Stufe 1, 3 und 5. **Grenzen, ehrlich:** Duell und Tages-Runde laufen ohne Server (über einen Link bzw. das Datum) – eine gemeinsame Bestenliste für alle gibt es erst mit Server. Der Bundesland-Schalter steuert bisher nur den Abi-Modus; der Abgleich jeder Einheit mit den Lehrplänen von Bayern und Hessen steht aus. Die Notenpunkte sind eine Orientierung aus Auswahl-Aufgaben. Kein Test auf einem echten Handy. | Auf `test` → trainer-test |
| 13.11.2026 | **Version 0.2.1 – Befunde der Testseite behoben (Leitstand).** Ordner `app/icons/` → `app/img/` (auf dem Server ist `/icons/` belegt), Service Worker installiert auch, wenn eine Nebendatei fehlt, Probestunden-Link → `/probestunde/`, Datenschutz-Link → `/datenschutz/#mathe-trainer`, Lizenzdateien als `.txt`. `npm run check` prüft jetzt auch die auf dem Server erlaubten Dateiarten; der Browser-Durchlauf prüft, dass jede vorgeladene Datei erreichbar ist. Branch `test` angelegt. | Auf `test` → trainer-test |
| 13.11.2026 | **Version 0.2.0 – Schwierigkeit, Stochastik, Geometrie, mehr Analysis, Töne (Marcel: „von sehr einfach bis sehr schwer", „Stochastik und Geometrie auch", „Sounds einbauen").** (1) **Schwierigkeit 1–5** auf der Startseite (sehr leicht … sehr schwer), wird gemerkt; steuert Zahlen und Aufgabentypen aller Erzeuger, die Strenge beim Zeichnen, die Toleranz im Surfer, Hinweise und Tipps (Stufe 5 ohne Tipps). (2) **Analysis** erweitert: Produktregel, Einheit *Extrempunkte* (Extremstellen, Hoch-/Tiefpunkt), Einheit *Fläche und Integral* mit Spiel **Fläche füllen** (Unter-/Obersumme), Stammfunktionen, bestimmte Integrale. (3) **Stochastik** neu: Spiel **Zufalls-Labor** (400 Versuchsreihen, Erwartungswert entdecken), Erwartungswert/Standardabweichung, Bernoulli-Formel, Baumdiagramme mit/ohne Zurücklegen. (4) **Analytische Geometrie** neu: Spiel **Vektor-Lotse** (Verbindungsvektor, Linearkombination), Verbindungsvektoren, Betrag, Skalarprodukt/Orthogonalität. (5) **Töne** (im Browser erzeugt, keine Dateien) für Tippen, Stern, richtig, falsch, Abschluss; Schalter zum Stummschalten oben rechts; **Konfetti** beim Abschluss. Startseite nach Gebieten gegliedert. Jetzt 10 Einheiten, 36 Schritte, 7 Spiele, 16 Aufgaben-Erzeuger. Geprüft: `npm run check` (102.204 Prüfungen über alle fünf Stufen) und Browser-Durchlauf aller Einheiten auf Stufe 1, 3 und 5. **Täglicher Ausbau** per Routine eingerichtet (siehe unten). | Im Repo, noch nicht online |
| 13.11.2026 | **Version 0.1.0 – Gerüst und erste vier Einheiten (Phase 0 und Anfang Phase 1).** Installierbare Web-App im Website-Design (hell/dunkel), offline nutzbar, Update-Hinweis. Lernpfad Analysis: (1) *Funktionen formen* – Murmelbahn (5 Bahnen), Erklär-Karten, Graph-und-Gleichung-Aufgaben; (2) *Steigung entdecken* – Tangenten-Surfer mit Spur der Steigung, Erklär-Karten, Graphen-Paare; (3) *Ableitung zeichnen* – Skizze mit dem Finger samt Vorzeichen-Rückmeldung; (4) *Ableitungsregeln* – Lücken- und Auswahl-Aufgaben (Potenz-, Ketten-, e-Regel) mit gestuften Tipps und Fehler-Diagnose. Punkte, Sterne, Serie ohne Druck (Wochenende zählt nicht), Probestunden-Kasten. Fortschritt nur auf dem Gerät. Geprüft: `npm run check` (11.883 Prüfungen) und kompletter Durchlauf im Handy-Browser hell und dunkel, auch offline (`tests/e2e.mjs`). Graphen laufen über eine eigene kleine Zeichenfläche statt JSXGraph (leichter, reicht bisher). | Im Repo, **noch nicht online** – siehe `docs/DEPLOY.md` |

**Zusammenarbeit (13.11.2026):** Dieser Chat ist der Raum „Plattform · Mathe-Trainer" im Projekt
„Nachhilfe – online". Es gelten die Regeln aus `AGENTS.md` im Repo `Website_Backup` (Branch `premium-design`):
kein Serverzugriff, Veröffentlichung nur über den Leitstand (Testseite → Marcels Go → live), keine Tracking-/
Werbedienste ohne Freigabe, Entscheidungsfragen als Auswahlfenster, neue Ideen sammeln statt vorziehen.
Meldungen an den Leitstand: `MELDUNG_AN_LEITSTAND.md`.

**Wege nach draußen (Leitstand, 13.11.2026):** Branch `test` → automatisch auf `trainer-test.mathenachhilfe-online.com`.
Branch `live` → `trainer.mathenachhilfe-online.com`, wird **nie von diesem Raum gesetzt**, nur nach Marcels Go über den
Leitstand. Erlaubte Dateiarten in `app/`: html, css, js, mjs, json, webmanifest, svg, png, jpg, webp, ico, woff2, txt.

## Ausbau-Fahrplan (Marcel, 13.11.2026)

- **Bis 04.12.2026 (drei Wochen): jeden Tag sehr viel erweitern**, bis eine große Basis steht – neue Einheiten,
  neue Aufgaben-Arten, neue Spiel-Level, eigene Level-Sätze je Stufe. Danach Schritt für Schritt.
- **Jeden Tag auf Fehler prüfen:** `npm run check`, Browser-Test auf Stufe 1, 3 und 5, Stichprobe echter Aufgaben
  je Stufe lesen (stimmt die Mathematik, stimmt der Text?), eingegangene Meldungen abarbeiten, sobald der
  Versand läuft.
- **Play Store später**, wenn die App voller ist: Die Web-App lässt sich als „Trusted Web Activity“ verpacken
  (gleiche App, gleiche Adresse, automatische Updates). Braucht ein Google-Entwicklerkonto (einmalig 25 $),
  Datenschutzangaben und Altersfreigabe – Entscheidung und Konto bei Marcel, Vorbereitung über den Leitstand.
  iOS: als Web-App installierbar; App Store wäre ein eigener, größerer Schritt.

## Free und Premium (Marcel, 13.11.2026) – nur Plan, noch nicht beauftragt

Marcels Idee: Die kostenlose Fassung bleibt, wie sie ist, und wird stetig erweitert. Später kommt eine
Bezahl-Fassung, in der eine KI immer neue Aufgaben erzeugt.

**Einordnung:** Schon die kostenlose Fassung erzeugt ihre Aufgaben selbst (gewürfelte Zahlen, nie dieselbe Aufgabe).
Sie kann aber nur Aufgaben-*Arten*, die programmiert wurden. Die KI bringt, was Regeln nicht können: neue
Aufgabenarten, Textaufgaben mit wechselnden Sachzusammenhängen, Erklärungen passend zum eigenen Fehler, Rückfragen.

| | Free | Premium (KI) |
| --- | --- | --- |
| Lernpfade, Spiele, Erklär-Karten | alle, wird laufend erweitert | alle |
| Aufgaben | unbegrenzt, aus programmierten Erzeugern | zusätzlich KI-Aufgaben: Sachaufgaben, Abi-Stil, gemischte Themen |
| Schwierigkeit | 5 Stufen, selbst gewählt | passt sich automatisch an Stärken und Schwächen an |
| Hilfe | gestufte Tipps, Fehler-Diagnose | KI-Tutor: „Erklär mir das anders", Rückfragen zum eigenen Rechenweg |
| Prüfung | Abi-Modus auf Zeit (Phase 2) | individuelle Probeklausur aus den eigenen Schwächen, mit Auswertung |
| Eltern | Bericht zum Teilen (Phase 2) | Wochenbericht, Lernplan bis zum Abi-Termin |
| Konto | keines, alles im Gerät | Konto nötig (Zugang, Geräte-Wechsel) |
| Internet | nur zum ersten Laden | für KI-Funktionen nötig |

**So bleibt die KI verlässlich (wichtigster Punkt):** KI-Modelle verrechnen sich. Deshalb liefert die KI nie
ungeprüft aus.
1. Die KI liefert eine Aufgabe in fester Form: Text, Funktion/Zahlen, Lösung, typische Fehler, Tipps.
2. Der Server **rechnet die Lösung selbst nach** (derselbe Prüf-Ansatz wie in `tests/run.mjs`: Ableitung numerisch,
   Integral numerisch, Wahrscheinlichkeit nachgezählt, Vektoren nachgerechnet).
3. Nur geprüfte Aufgaben gehen an den Schüler; durchgefallene werden verworfen und neu erzeugt.
4. Geprüfte Aufgaben wandern in einen Vorrat – das spart Kosten und macht die App schnell.
5. Für Bereiche, die sich nicht automatisch nachrechnen lassen (Begründungen), bleibt es bei Aufgaben mit
   Musterlösung und Selbstkontrolle, klar gekennzeichnet.

**Was technisch dazukommt** (die Free-Fassung braucht davon nichts):
- **Server-Teil** für die KI-Anfragen. Der KI-Schlüssel liegt nur dort – nie in der App und nie in diesem
  öffentlichen Repo. Premium-Code käme in ein eigenes, privates Repo.
- **Konto und Zugang:** am einfachsten über den bestehenden Shop der Website (Kauf → Zugangscode oder Login).
  Das läuft über den Leitstand (Shop, Zahlung, Kundendaten sind dort zuständig).
- **Kostenbremse:** Tageslimit je Konto (wie beim Hacklab), Vorrat geprüfter Aufgaben, kleines Modell für
  Aufgaben, größeres nur für den Tutor.
- **Datenschutz:** Nutzer sind oft minderjährig → Einwilligung der Eltern beim Kauf, Vertrag zur
  Auftragsverarbeitung mit dem KI-Anbieter, keine Namen oder persönlichen Angaben in den KI-Anfragen,
  eigener Abschnitt in der Datenschutzerklärung. Vor dem Bau rechtlich prüfen lassen.
- **App-Stores (falls später):** Käufe in der App kosten dort 15–30 % Gebühr; Kauf über die Website vermeidet das.

**Stufen (jede einzeln entscheidbar, keine ist beauftragt):**

| Stufe | Inhalt | Voraussetzung |
| --- | --- | --- |
| P0 | Free-Fassung: inhaltlich komplett seit Version 0.3.0, wird laufend erweitert (Daueraufgabe unten) | läuft |
| P1 | Probe ohne Bezahlung: KI-Aufgaben mit Nachrechnen, nur intern auf der Testseite; Fehlerquote und Kosten je Aufgabe messen | KI-Schlüssel (Geheimnis, ein Schritt von Marcel), kleiner Server-Teil |
| P2 | Konto und Zugang über den Shop, Tageslimit, Vorrat | Leitstand/Verwaltung, Datenschutz geklärt |
| P3 | Premium-Start: KI-Aufgaben und KI-Tutor | Preis und Angebot (Marketing-Raum) |
| P4 | Anpassende Schwierigkeit, Probeklausur, Wochenbericht, Lernplan | Erfahrungen aus P3 |

**Offene Entscheidungen für später:** Abo oder Einmalkauf; eigenes Produkt oder Zugabe für Nachhilfe-Kunden
(z. B. Premium gratis für aktive Schüler – starkes Werbe-Argument); welche Funktionen genau hinter die Bezahlschranke;
Preis. Die Preis- und Angebotsfragen gehören in Marcels Marketing-Raum.

## Stand der Free-Fassung (13.11.2026, Version 0.3.0)

Die Fehl-Liste vom 13.11. ist abgearbeitet. Ab jetzt wird nur noch erweitert.

| Gebiet | Enthalten |
| --- | --- |
| Analysis (10 Einheiten) | Parameter/Scheitelform, Ableitungsbegriff, grafisches Ableiten, Potenz-/Ketten-/Produkt-/e-Regel, Extrempunkte, Kurvendiskussion (Wendepunkte, Monotonie, Symmetrie, Grenzwerte), Extremwertaufgaben, Tangente, Steckbrief, Scharen, ln, Wachstum, Stammfunktion, Integral, Fläche zwischen Graphen |
| Stochastik (6 Einheiten) | Erwartungswert, Standardabweichung, Bernoulli-Formel, Baumdiagramm, Vierfeldertafel, bedingte Wahrscheinlichkeit, kumulierte Binomialverteilung, Sigma-Regeln, Normalverteilung, Hypothesentests, Kombinatorik |
| Analytische Geometrie (5 Einheiten) | Verbindungsvektor, Linearkombination, Betrag, Skalarprodukt, 3D-Ansicht, Punktprobe, Lage von Geraden, Ebenen, Schnittpunkt, Kreuzprodukt, Abstände, Winkel |
| Prüfung (1 Einheit + Modi) | Operatoren, Abi-Modus Teil A/B mit Prognose, Tages-Runde, Duell per Link |
| Übergreifend | Schwierigkeit 1–5, Töne, Serie, Fehler-Kartei, Eltern-Bericht, Bundesland/Kurs, Abi-Countdown, Offline |

**Bewusst offen (braucht Entscheidung oder Zuarbeit):**
- Gemeinsame Bestenliste und Duell in Echtzeit: brauchen einen Server-Teil (über den Leitstand).
- Lehrplan-Abgleich Bayern/Hessen je Einheit: gegen die offiziellen Vorgaben prüfen, dann den Schalter auf die Lernpfade ausdehnen.
- Test auf echten Handys (Android und iPhone), vor allem Zeichnen, Drehen, Töne.
- Aufgaben mit freier Eingabe (Rechenweg Zeile für Zeile, Formel-Tastatur) – bisher Auswahl-, Lücken- und Spiel-Aufgaben.

**Daueraufgabe (Marcel, 13.11.2026: „Es muss definitiv dazu, dass die App stetig erweitert wird"; „du erweiterst es dann nur immer"):**
feste Reihenfolge, Gebiete im Wechsel, je Paket dasselbe Prüfniveau (`npm run check` + Browser-Durchlauf), jede Version erst auf `test`.

| Runde | Analysis | Stochastik | Analytische Geometrie | Prüfung/Übergreifend |
| --- | --- | --- | --- | --- |
| 1 | Normale, Schnittwinkel, Berührpunkte | Zweiseitige Tests | Ebenen in Parameterform, Umrechnen | Mehr Varianten je Erzeuger (Sachtexte) |
| 2 | Trigonometrische Funktionen ableiten/integrieren | Zufallsgrößen: Erwartungswert und Varianz allgemein | Abstand Punkt–Gerade, windschiefe Geraden | Rechenweg-Puzzle (Schritte ordnen) |
| 3 | Rotationskörper, Mittelwert einer Funktion | Konfidenzintervalle (wo im Lehrplan) | Spiegelungen, Lotfußpunkt | Freie Zahleneingabe mit Toleranz |
| 4 | Integration durch Substitution/partielle Integration (LK) | Stochastische Unabhängigkeit | Kugeln, Lage Ebene–Ebene | Lehrplan-Abgleich und Bundesland-Filter |
| 5 | Sachaufgaben im Abi-Stil (Bestand, Änderungsrate) | Urnenmodelle vertieft | Flächen- und Volumenberechnung mit Vektoren | Mittelstufe: Algebra- und Funktionen-Grundlagen |

**Täglicher Ausbau (Marcel, 13.11.2026):** Eine Routine erweitert jeden Tag die Aufgaben und setzt neue dazu.
Regeln dafür: in der Reihenfolge der „Kommt bald"-Listen in `app/js/units.js` (Gebiete abwechselnd), jede neue
Aufgabe mit Fehler-Diagnose, Tipps und allen fünf Schwierigkeiten, jede mit Selbstprüfung in `tests/run.mjs`;
nur pushen, wenn `npm run check` und `tests/e2e.mjs` grün sind; Version erhöhen, Baulog fortschreiben; nichts
veröffentlichen, keine fremden Aufgaben kopieren, keine neuen Dienste.

**Als Nächstes:** online stellen (über den Leitstand), dann Extrempunkte/Kurvendiskussion, „Fläche füllen"
(Integral), Extremwert-Werkstatt, Steckbrief; danach Phase 2 (Bundesland, Abi-Modus, Eltern-Bericht).

**Richtungswechsel (Marcel, 11.11.2026):** Handy zuerst. Jugendliche nutzen kaum noch PCs.
Statt eines Windows-Programms bauen wir eine **Web-App auf dem Server, als Lernspiel**.
Windows ist nur noch ein optionaler Zusatz für später.

## Ziel

Ein kostenloses Mathe-Lernspiel für Schüler der **Oberstufe** (zuerst **Bayern und Hessen**),
das im Browser auf Android, iPhone, Tablet und PC läuft. Es lässt sich wie eine App auf den
Startbildschirm legen, aktualisiert sich von selbst und wirbt dezent für die Nachhilfe-Firma
mathenachhilfe-online.com (Seite ist aktuell offline, kommt wieder).

## Leitbild (Marcel, 11.11.2026): interaktiv, pädagogisch wertvoll, modern

Kein digitales Arbeitsblatt. Der Schüler **tut** etwas und **versteht**, statt nur Ergebnisse
einzutippen. Das Spielerische ist die Verpackung, das Verstehen der Kern.

**Interaktiv (für den Finger gebaut)**
- Graphen anfassen: Punkte ziehen, Schieberegler, Tangente an der Kurve entlangschieben und
  die Steigung live sehen.
- Selbst skizzieren: z. B. den Graphen der Ableitung zeichnen, das Programm vergleicht.
- Rechenschritte sortieren, Lücken füllen, passende Antwort antippen – statt Formeln zu tippen.
- Rechenweg Zeile für Zeile; das Programm zeigt die erste falsche Zeile.
- Geometrie in 3D: Geraden und Ebenen drehen und von allen Seiten ansehen.
- Stochastik als Experiment: 1000-mal würfeln lassen und sehen, wie die Verteilung entsteht.

**Pädagogisch wertvoll**
- Erst entdecken, dann Regel: kurze Erkundung vor der Formel.
- Gestufte Hilfen (Tipp 1 → Tipp 2 → Tipp 3 → Lösung) statt sofort die Lösung.
- Fehler-Diagnose: typische Fehler erkennen und benennen
  (z. B. „innere Ableitung vergessen – Kettenregel").
- Verständnis-Fragen neben Rechenaufgaben (z. B. „Welcher Graph gehört zur Ableitung?").
- Vom Beispiel zur eigenen Lösung: erst vorgerechnet, dann mit Lücken, dann allein.
- Wiederholen in wachsenden Abständen; Themen gemischt statt blockweise.
- Selbsteinschätzung („Wie sicher warst du?") und ehrliche Rückmeldung zum Stand.

**Modern**
- Aufgeräumte Oberfläche, Hell/Dunkel, flüssige Animationen.
- Kurze Runden: 5 Aufgaben in etwa 3 Minuten (Bus, Pause), klares Tagesziel.
- Mathe-Tastatur nur dort, wo eine Formel-Eingabe wirklich nötig ist.
- Optional später: KI-Tutor für Rückfragen (braucht Internet und verursacht laufende Kosten –
  Entscheidung offen).

## Kein Rechenspiel (Marcel, 11.11.2026) – Ergebnis der Recherche

Ausführlich in `docs/RECHERCHE.md`. Kurz:
- **Die Spielmechanik ist die Mathematik.** Kein Quiz mit aufgeklebten Punkten.
- **Bauplan jeder Einheit:** spielen/entdecken → benennen (Regel) → Brücke zur
  Prüfungs-Schreibweise → festigen.
- **Spielideen Analysis:** Murmelbahn, Ableitung zeichnen, Tangenten-Surfer, Graphen-Paare,
  Fläche füllen, Steckbrief, Extremwert-Werkstatt, Rechenweg-Puzzle.
- **Technik:** JSXGraph für alles zum Anfassen; GeoGebra und Desmos nicht einbetten (Lizenz).
- **Serien ohne Druck:** mit „Luft" (Wochenende, Einfrieren).

## Spiel-Elemente

- Level, Punkte, Tages-Serie, Abzeichen, freischaltbare Themen.
- **Tages-Aufgabe:** jeden Tag eine neue Aufgabe für alle.
- **Duell:** zwei Schüler, dieselben Aufgaben, per Link an einen Mitschüler.
- **Bestenliste** (mit Spitznamen).
- Abi-Modus auf Zeit mit Punkte-Prognose (0–15 Punkte).

## Design: orientiert an der Website (Marcel, 11.11.2026)

Das Spiel soll aussehen wie mathenachhilfe-online.com, damit Schüler und Eltern die Firma
wiedererkennen. Werte aus dem Theme der Website übernommen:

| Element | Wert |
| --- | --- |
| Hauptfarbe (Knöpfe, Akzente) | Orange `#ff7418`, dunkler `#df5e0c` |
| Dunkle Flächen, Überschriften | Navy `#101b43` / `#0d1733`, Blau `#173a74` |
| Erfolg / „richtig" | Mint `#73e0a9` |
| Text | `#1f2b3e`, gedämpft `#61718a` |
| Hintergrund | Weiß, weiche Flächen `#f7f9fd`, Linien `#dbe4ef` |
| Schrift | Inter, große fette Überschriften mit engem Buchstabenabstand |
| Formen | Karten mit 20–30 px Rundung, Knöpfe 12 px, weiche Schatten |
| Bausteine | Kleine orange Überzeile in Großbuchstaben, nummerierte Schritt-Karten, dunkle „Tafel"-Karte, oranger Abschluss-Kasten mit Knopf |
| Bewegung | Sanftes Einblenden; aus bei „Bewegung reduzieren" |

**Lernablauf wie das pädagogische Konzept der Website** („Verstehen schafft Sicherheit"):
1. Lernstand klären (kurzer Einstiegstest je Thema)
2. Verständnislücke schließen (erklären, entdecken, vorrechnen)
3. Mit Übungen festigen
4. Mit Sicherheit weiterlernen (Wiederholung, nächstes Thema)

Ton wie auf der Website: ruhig, ohne Druck, Fehler als Hinweise.

**Logo** (von Marcel, 11.11.2026) liegt in `assets/logo/` – **nur Schwarz/Weiß, nicht einfärben**:
Original (weiß auf schwarz), invertiert, sowie freigestellt in Weiß und Schwarz – als PNG und
als SVG (aus dem Bild nachgezeichnet; `logo.svg` übernimmt die Textfarbe,
`logo-symbol-schwarz.svg` / `logo-symbol-weiss.svg` haben einen Hintergrund).
Einsatz: Weiß auf Schwarz als App-Symbol und auf dunklen Flächen, Schwarz auf Weiß auf hellen.

## Grundsätze

- **Handy zuerst:** jede Ansicht wird für den kleinen Bildschirm und den Finger entworfen;
  am PC sieht sie dann ebenfalls gut aus.
- **Aufgaben erzeugt das Spiel selbst** (Zufallszahlen, eigener Lösungsweg). Marcels
  Drive-Ordner „Mathe" dient nur als Orientierung für Themen und Stufen.
- **Keine fremden Aufgaben kopieren.** In dem Ordner liegt auch Material anderer Anbieter;
  das darf nicht in ein öffentliches Angebot. Marcels eigene Aufgaben dürfen 1:1 hinein,
  wenn er die Dateien benennt.
- **Ohne Anmeldung spielbar.** Lernfortschritt liegt zuerst nur auf dem Gerät; für Duell und
  Bestenliste genügt ein Spitzname (einfachster Weg beim Datenschutz für Minderjährige).
- **Selbst-einrichtend:** Bauen, Ausliefern und Updates laufen automatisch.
- **Klein anfangen:** erst Analysis, dann erweitern.
- Dieses Projekt ist **getrennt vom Nachtfalter Hacklab**.

## Technik

- **Bauart:** Web-App (HTML/JS), installierbar auf dem Startbildschirm (PWA), läuft nach dem
  ersten Laden auch ohne Internet.
- **Ausliefern:** Die Grundversion besteht nur aus Dateien. Sie kann kostenlos bei GitHub
  liegen (kein Warten auf Marcels Server nötig) oder später auf seinem Server unter eigener
  Adresse.
- **Updates:** Push ins Repo → automatisch gebaut und ausgeliefert → alle haben beim nächsten
  Öffnen die neue Version. Kein Signatur-Schlüssel, keine Windows-Warnung.
- **Server-Teil (erst ab Phase 3):** kleine Datenbank für Duell, Bestenliste und Tages-Aufgabe
  (z. B. Supabase wie beim Hacklab). Antworten für Wertungen werden serverseitig geprüft.
- **Stores (später):** Android/Play Store aus der Web-App heraus (Play-Konto einmalig ca. 25 $).
  iOS/App Store aufwendiger (Apple-Konto 99 $/Jahr). Windows-Programm nur bei Bedarf.

## Phasen

| Phase | Inhalt | Ergebnis |
| --- | --- | --- |
| 0 – Gerüst | Leere Web-App im Website-Design, installierbar, automatisches Ausliefern, Formel-Anzeige | Ein Link, der auf jedem Handy läuft |
| 1 – Erste Version (Analysis) | Ableiten, Tangente/Normale, Kurvendiskussion, Integrale und Flächen, Extremwertaufgaben. Lernablauf in 4 Schritten, 3 Stufen, gestufte Hilfen, kurze Runden, Punkte und Tages-Serie, Fehler-Kartei, Logo und Probestunden-Knopf | Erste Version zum Verteilen (Link/QR-Code) |
| 2 – Abi-Funktionen | Bundesland-Schalter (Bayern, Hessen Grundkurs/Leistungskurs), Teil ohne und mit Hilfsmitteln, Abi-Modus auf Zeit mit Punkte-Prognose, Eltern-Bericht | Abi-Trainer |
| 3 – Gemeinsam spielen | Spitzname, Tages-Aufgabe, Duell per Link, Bestenliste (Server-Teil) | Lernspiel mit Mitschülern |
| 4 – Weitere Gebiete | Analytische Geometrie (3D), dann Stochastik (Experimente) | Alle drei Abi-Gebiete |
| 5 – Extras | Operatoren-Training, Abi-Countdown mit Lernplan, Gutschein-Code, Weiterempfehlen | Feinschliff und Werbung |
| 6 – Später | Play Store, evtl. App Store, Grundlagen-Auffrischung (Algebra, Funktionen), optionales Konto, evtl. Windows-Programm | Nach Bedarf |

## Werbung (dezent)

- Logo und „von mathenachhilfe-online.com" im Spiel.
- Hinweis auf kostenlose Probestunde, wenn ein Thema mehrfach schiefgeht; die Anfrage
  nennt das Problem-Thema.
- Eltern-Bericht (was geübt wurde, was klappt, wo es hakt) zum Teilen oder Drucken,
  mit Firmenadresse.
- Gutschein-Code, z. B. nach 7 Tagen Lern-Serie (macht messbar, wie viele Kunden kommen).
- „Schick das Spiel einem Mitschüler" – Link oder QR-Code; das Duell wirbt von selbst.

## Themen-Landkarte (aus Marcels Ordner, als Orientierung)

01 Rechengrundlagen · 02 Algebra · 03 Funktionen (linear, quadratisch, Potenz, Exponential) ·
04 Analysis (Grenzwerte und Stetigkeit, Differentialrechnung, Integralrechnung,
Extremwertaufgaben, Kurvendiskussion und Funktionenscharen) · 05 Geometrie · 06 Stochastik ·
07 Übersichten und Prüfungen · 08 Physik

Stufen in der Vorlage: Grundlagen → Fortgeschritten → Expert (→ Universität).

## Offen – braucht Marcel (erst beim Start)

1. Ziel des Probestunden-Knopfs, solange die Seite offline ist (E-Mail oder Telefon).
2. Dateinamen der eigenen Aufgaben, falls welche 1:1 hinein sollen.
3. Unter welcher Adresse das Spiel laufen soll (zuerst GitHub-Adresse oder gleich eine eigene).

## Offene Entscheidungen

- **Start ohne Marcels Server?** Die Grundversion könnte sofort kostenlos bei GitHub laufen.
- **Name:** „Mathe-Trainer" ist Arbeitstitel.
- **Lehrplan:** Themen für Bayern und Hessen beim Start gegen die offiziellen Vorgaben prüfen.
- **KI-Tutor:** später prüfen (laufende Kosten).
