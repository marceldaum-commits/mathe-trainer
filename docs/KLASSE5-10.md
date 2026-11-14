# Mathe-Trainer für alle Stufen: Klasse 5 bis 10

Marcel, 14.11.2026: „Nicht mehr nur Oberstufe, sondern auch Mittelstufe ab Klasse 5. Startseite und alles so umbauen, dass
es nicht überladen ist, sondern fein säuberlich der Stufe entsprechend. Am Ende soll der Mathe-Trainer für alle Schüler sein.“

## Wie es gebaut ist (seit 0.26.0)

- **Jahrgang** (`store.jahrgang`): `'5'` bis `'10'` oder `'os'` (Oberstufe). Wer nichts gewählt hat, sieht die Oberstufe –
  für bisherige Nutzer ändert sich nichts. Die Startseite fragt einmal „Für welche Klasse lernst du?“; wechseln geht über
  den Knopf auf der Startseite, die Seite `#/stufe` und die Einstellungen. Der Fortschritt jeder Stufe bleibt erhalten.
- **Einheiten:** Oberstufe wie bisher in `app/js/units.js`, Mittelstufe in `app/js/units-m.js` (Feld `jg`).
  `UNITS` und `AREAS` sind lebende Bindungen und enthalten immer nur die gewählte Stufe (`jahrgangAnwenden()`); alle
  Einheiten zusammen stehen in `ALLE_UNITS`. Dadurch passen sich Lernen, Theorie, Formelsammlung, Lernkarten,
  Arbeitsblatt, Bericht und Zertifikate von selbst an.
- **Gebiete der Mittelstufe:** Zahlen und Rechnen (`mzahl`), Terme und Funktionen (`malgebra`), Geometrie (`mgeo`),
  Daten und Zufall (`mdaten`). Gezeigt werden nur die Gebiete, zu denen die Klasse Einheiten hat.
- **Aufgaben:** `app/js/gen6.js` (17 Erzeuger) plus die Grundlagen-Erzeuger aus `gen3.js`. Gleiche Regeln wie überall:
  fünf Schwierigkeiten, typische Fehler mit Diagnose, zwei Tipps, Erklärung.
- **Nur Oberstufe:** Abi-Modus, Abi-Aufgabe am Stück, Tages-Runde, Blitz, Duell, Abenteuer, Karte „Mathea“, Einstufungstest,
  Lernplan bis zum Abi, Bundesland und Kurs, KI-Aufgaben. In der Mittelstufe heißt der Reiter „Testen“ und bietet
  Arbeitsblatt, Probe-Arbeit, freies Üben, Fehler-Kartei und Lernkarten.

## Regel: Schwierigkeit ist nicht Klassenstufe

Die Schwierigkeit 1 bis 5 macht eine Aufgabe schwerer, darf aber **keinen Stoff einer späteren Klasse** hereinholen.
Deshalb ist z. B. „Körper“ in zwei Erzeuger geteilt: `genQuader` (Klasse 6) und `genKoerper` (Klasse 10).

## Lehrplan-Zuordnung (Stand 14.11.2026, erste Fassung)

Grundlage: Gymnasium in Bayern (LehrplanPLUS) und Hessen (Kerncurriculum Sekundarstufe I). Wo die Länder abweichen, steht
das Thema in der früheren Klasse. **Noch nicht Zeile für Zeile mit den Lehrplänen abgeglichen** – das ist der nächste Schritt.

| Klasse | Einheiten in der App | Abweichung |
|---|---|---|
| 5 | Natürliche Zahlen · Teiler und Vielfache · Negative Zahlen · Größen und Flächen | Negative Zahlen: Bayern Klasse 5, Hessen eher Klasse 6/7 |
| 6 | Brüche · Dezimalzahlen · Quader und Würfel · Daten auswerten | – |
| 7 | Terme und Gleichungen · Prozent und Dreisatz | Prozent: Bayern teils schon Klasse 6 |
| 8 | Lineare Funktionen · Wahrscheinlichkeit | – |
| 9 | Wurzeln und quadratische Gleichungen · Satz des Pythagoras | – |
| 10 | Potenzen und Wachstum · Trigonometrie und Körper | – |

## Was als Nächstes kommt (je Termin der täglichen Routine eine Klasse)

1. **Lehrplan-Abgleich** je Klasse für Bayern und Hessen; danach Realschule und Mittelschule (gleiche Themen, teils später).
2. **Mehr Einheiten** – die Liste „Kommt bald“ je Klasse steht in `MITTEL_BALD` (`units-m.js`).
3. **Erlebbar:** eigene Spiele und Merkbilder für die Mittelstufe (Bruch-Streifen, Zahlengerade, Waage für Gleichungen,
   Flächen legen). Bisher bestehen die Einheiten aus Erklär-Karten, Aufgaben-Runden und Boss.
4. **Runden für die Mittelstufe:** Tages-Runde, Blitz, Duell und Abenteuer mit dem Stoff der Klasse.
5. **Ausführliche Theorie** (Pro) für die Mittelstufen-Einheiten; KI-Aufgaben (Pro + KI), sobald der Server Vorrat dafür hat.
6. **Texte nach außen:** App-Titel, Beschreibung und Store-Texte sprechen noch von „Oberstufe“.

## Offene Richtungsfragen für Marcel

- Schulart wählbar machen (Gymnasium, Realschule, Mittelschule) – oder bei „Klasse“ allein bleiben?
- Sollen jüngere Kinder (Klasse 5/6) eine eigene, verspieltere Ansprache und Figur bekommen?
- Eigene Preise für die Mittelstufe (z. B. Jahres-Pass statt Abi-Pass)?
