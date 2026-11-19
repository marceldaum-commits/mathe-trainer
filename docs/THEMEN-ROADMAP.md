# Themen-Roadmap Mathe-Trainer (Vorschlag, 18.11.2026)

Für den Leitstand, zur Auswahl durch Marcel. Stand heute: **73 Einheiten** (Oberstufe 36, Klasse 5–10 zusammen 37).
Die Oberstufe ist gut abgedeckt. In Klasse 5–10 fehlen einzelne Bereiche ganz, zum Beispiel Daten in Klasse 7 und 9 oder Körper in Klasse 9.

## Rhythmus: Dienstag und Freitag (Dauerregel Marcel, 18.11.2026 – ersetzt „1 Einheit mittwochs“ und die Pflegewoche)

- **Jeden Dienstag und Freitag bis 16 Uhr ein großes Inhaltsupdate auf `test`**, dazu eine Meldung (was neu ist, wie viele Aufgaben, wie geprüft). Der Leitstand prüft am selben Tag und gibt frei.
- **Inhalt nach Wirkung:** neue Themen mit Aufgaben, bestehende Themen ausweiten, Aufgaben korrigieren und vervollständigen, neue Optionen in der App.
- **Pflicht (Marcel wörtlich): „mathematisch korrekt, vollständig, nachvollziehbar. Keine Abkürzungen, weil die Schüler damit lernen.“**
  - Jeder Lösungsweg zeigt alle Schritte.
  - Jede nötige Formel steht in der Theorie, mit Beispiel.
  - Jedes Ergebnis ist nachgerechnet (`tests/run.mjs`, harte Tests `tests/hart/*.mjs`, `tests/hart/eindeutig.mjs`).
- **Richtschnur der Reihenfolge:** Oberstufe zuerst, danach Lücken in Klasse 5–10, Länder-Wahlthemen zuletzt (bis dahin „Kommt bald“).
- **Monatsprüfung** nach `docs/PRUEFPLAN.md` läuft zusätzlich weiter (letzte Woche im Monat).
- **Themen in die Lehrplan-Klasse verschoben** (2.3.9): Baumdiagramm/Vierfeldertafel → Klasse 9, Flächen und Prismen → Klasse 7; „Trigonometrie und Körper“ bleibt in 10.

## Kalender (Richtschnur, Inhalt je Update nach Wirkung)

| Update | Schwerpunkt |
| --- | --- |
| **Fr 20.11.2026** | **Neue Einheit Oberstufe: Integral anwenden** (Mittelwert einer Funktion, Rekonstruktion eines Bestands aus der Änderungsrate) |
| Di 24.11. | Gauß-Verfahren (LGS mit drei Unbekannten) + Korrekturen aus der Monatsprüfung Block A |
| Fr 27.11. | Nullstellen finden: Ausklammern, Substitution, Polynomdivision |
| Di 1.12. | Satz von Bayes: Baum umdrehen |
| Fr 4.12. | Normalverteilung rückwärts und Dichtefunktion |
| Di 8.12. | Prognose- und Konfidenzintervalle (statt Transformationen – die übt KurvenFlug am Graphen, Abgleich 19.11.) |
| Fr 11.12. | Kreuzprodukt: Fläche und Volumen |
| Di 15.12. | Abi-Pflichtteil ohne Taschenrechner |
| Fr 18.12. | Klasse 9: Körper (Zylinder, Kegel, Pyramide, Kugel) |
| Di 22.12. | Klasse 7: Mittelwert, Median, Boxplot |
| danach | Kl. 9 Scheitelpunktform, Kl. 6 Symmetrie, Kl. 9 mehrstufige Zufallsversuche, Kl. 7 Konstruieren, Kl. 8 Ungleichungen, Kl. 7 Terme aufstellen, Kl. 5 Körper und Netze; dann Wahlthemen (Matrizen u. a.) |

Jedes Update kann zusätzlich bestehende Themen ausweiten oder Aufgaben verbessern. Jede fertige Einheit verschwindet aus „Kommt bald“.

## Rhythmus (ursprünglicher Vorschlag, überholt)

- **1 neue Einheit pro Woche.** Fertig gebaut und getestet am Mittwoch, auf `test` am Mittwochabend; Marcel schaut, und der Leitstand gibt sie am Freitag frei.
  Eine Einheit hat 5–8 Schritte mit Spiel bzw. Aufgaben, Theorie (kurz und ausführlich), Formelkarten, Boss und harten Tests.
- **Jede 4. Woche keine neue Einheit**, sondern eine Pflegewoche: Nutzer-Meldungen, Erklärungen, Stufen-Ordnung, Bildschirm-Prüfung.
- **Täglich** (die bestehende Routine): nur Fehlersuche und kleine Verbesserungen an bestehenden Aufgaben, keine neuen Einheiten.
- Wer schneller will: 2 Einheiten pro Woche gehen nur ohne die Pflegewoche und mit kürzerer Theorie, das empfehle ich nicht.

## Reihenfolge nach Lehrplan-Abgleich (überholt durch „Oberstufe zuerst“)

| Woche | Klasse | Neue Einheit |
| --- | --- | --- |
| 1 | 7 | Dreiecke konstruieren, Kongruenz |
| 2 | 7 | Terme aufstellen |
| 3 | 5 | Körper und Netze |
| 4 | 6 | Symmetrie: Achsen- und Punktspiegelung |
| 5 | Oberstufe | Gauß-Verfahren: drei Gleichungen, drei Unbekannte |
| 6 | Oberstufe | Nullstellen finden: Ausklammern, Substitution, Polynomdivision |
| 7 | 10 | Trigonometrie am Einheitskreis |
| 8 | 10 | ~~Potenzfunktionen~~ → KurvenFlug (verlinkt, Abgleich 19.11.) |
| 9 | 10 | Prüfungstraining Mittlerer Abschluss |
| 10 | 9 | ~~Zehnerpotenzen und wissenschaftliche Schreibweise~~ → Rechenblitz (verlinkt, Abgleich 19.11.) |
| 11 | 7 | Satz des Thales |
| 12 | Oberstufe | Satz von Bayes: Baum umdrehen |

(Baumdiagramm Kl. 8/9 ist mit dem Verschieben nach Klasse 9 abgedeckt. Fertige Einheiten verschwinden aus „Kommt bald“.)

## Reihenfolge des ersten Vorschlags (12 Wochen, Lücken zuerst)

| Woche | Klasse | Gebiet | Neue Einheit | Warum jetzt |
| --- | --- | --- | --- | --- |
| 1 | 9 | Geometrie | Körper: Zylinder, Kegel, Pyramide, Kugel | Klasse 9 hat keine Körper; Standardthema der Abschlussprüfung |
| 2 | 7 | Daten | Mittelwert, Median, Spannweite, Boxplot | Klasse 7 hat noch gar keine Daten |
| 3 | 9 | Algebra | Quadratische Funktionen: Scheitelpunktform, Verschieben, Strecken | ergänzt „Parabeln im Alltag“, Brücke zur Oberstufe |
| 4 | – | Pflegewoche | – | Meldungen, Erklärungen, Stufen |
| 5 | 5 | Geometrie | Achsensymmetrie, Spiegeln, Verschieben | Klasse 5 hat nur eine Geometrie-Einheit |
| 6 | 9 | Daten | Mehrstufige Zufallsversuche und Zählprinzip | Klasse 9 hat keine Daten |
| 7 | 7 | Geometrie | Konstruieren: Dreiecke, Kongruenz, besondere Linien | zweite Geometrie-Einheit für Klasse 7 |
| 8 | – | Pflegewoche | – | |
| 9 | Oberstufe | Analysis | Integral anwenden: Mittelwert, Rekonstruktion, Bestand aus Änderungsrate | häufige Abi-Aufgabe, bisher nur am Rand |
| 10 | 8 | Algebra | Lineare Ungleichungen und Betrag | Lücke vor den Gleichungssystemen |
| 11 | Oberstufe | Stochastik | Matrizen und Übergangsprozesse (nur Länder mit diesem Abi-Stoff) | Wahlthema einzelner Länder; mit Länder-Filter |
| 12 | – | Pflegewoche | – | |

**Danach** (Ideen für die nächste Runde): Klasse 5 „Große Zahlen, Runden, Überschlag“; Klasse 6 „Rechnen mit Dezimalzahlen und Größen“; Klasse 8 „Prozent- und Zinsrechnung vertieft“; Klasse 10 „Kreisbogen und Kreissektor“; Oberstufe „Abi-Aufgaben am Stück je Land“.

## Was Marcel entscheiden soll

1. Rhythmus: **1 Einheit pro Woche mit Pflegewoche** (empfohlen) oder ohne Pflegewoche.
2. Reihenfolge: wie oben (Lücken in Klasse 5–10 zuerst) oder Oberstufe zuerst (Abi-Nähe).
3. Wahlthemen einzelner Länder (Matrizen) ja oder nein.
