# Prüfplan Mathe-Trainer (rollierend)

Dauerregel von Marcel (18.11.2026): **Jede Woche neuer Inhalt, einmal im Monat gegen Ende alles prüfen und fixen** – nach Plan,
damit nicht jedes Mal alles neu geprüft werden muss.

## Wochenrhythmus

- **Jede Woche eine neue Einheit:** Mittwoch auf `test`, Freigabe durch den Leitstand. Reihenfolge und Kalender: `docs/THEMEN-ROADMAP.md`.
- **Die letzte Woche im Monat ist Pflegewoche:** keine neue Einheit, nur die Monatsprüfung (unten).
- **Täglich** (bestehende Routine): Nutzer-Meldungen lesen, Fehler beheben, `npm run check`.

## Monatsprüfung (letzte Woche des Monats)

Jeden Monat dieselben drei Teile:

1. **Ein Inhaltsblock gründlich** (siehe Blöcke unten). Für jede Einheit des Blocks:
   - **Aufgaben richtig:** je Erzeuger und Stufe 1–5 Stichproben nachrechnen; harte Tests `tests/hart/*.mjs` grün.
   - **Alle Lösungswege:** `tests/hart/eindeutig.mjs` (keine zweite richtige Antwort, Bruch = Dezimalzahl, +C, ±, Reihenfolge). Text-Antworten von Hand ansehen.
   - **Formel in der Theorie:** Jede Aufgabenart ist mit der Theorie lösbar (Formel, Bedeutung der Größen, durchgerechnetes Beispiel), kurz und ausführlich. Formeln rendern ohne Fehler.
   - **Passt zur Überschrift und zur Lehrplan-Klasse:** siehe `docs/LEHRPLAN-ABGLEICH.md`.
   - **Stufen steigen:** `tests/stufen.mjs`.
2. **Der neue Inhalt des Monats** (die 4–5 Einheiten, die in diesem Monat dazugekommen sind), genauso gründlich wie ein Block.
3. **Rundum-Prüfung** (jeden Monat, ganze App, kurz):
   - e2e auf allen fünf Stufen (`tests/e2e.mjs`);
   - iPhone/iPad mit WebKit (`npm run test:webkit`);
   - Auto-Update (`npm run test:update`);
   - Links (Shop, Website, Probestunde) erreichbar; KI-Probe über `/api/ki/erklaer` auf `test`; Push-Schlüssel `/api/push/schluessel`;
   - Bildschirm: zwei Seiten in 360/393/1440 px, hell/dunkel, große Schrift;
   - offene Nutzer-Meldungen auf null.

Ergebnis jeder Monatsprüfung: Eintrag in `MELDUNG_AN_LEITSTAND.md` (Block, Zahl der geprüften Einheiten, Funde, Korrekturen) und eine Zeile im Baulog (`docs/PLAN.md`).

## Inhaltsblöcke (je etwa ein Viertel)

| Block | Inhalt | Einheiten (Stand 2.3.9) |
| --- | --- | --- |
| **A** | Oberstufe Analysis und Operatoren | 18 |
| **B** | Oberstufe Stochastik und Analytische Geometrie | 18 |
| **C** | Klasse 5–7 | 22 |
| **D** | Klasse 8–10 | 15 |

Neue Einheiten gehören ab dem Folgemonat zu ihrem Block (nach Klasse bzw. Gebiet).

## Kalender

| Monat | Prüfwoche | Block | dazu |
| --- | --- | --- | --- |
| November 2026 | 23.–30.11. | **A** Oberstufe Analysis | Rundum-Prüfung; neu im November: Theorie-Ergänzungen 2.3.8, Klassen-Verschiebung 2.3.9 |
| Dezember 2026 | 28.–31.12. | **B** Stochastik und Geometrie | Rundum-Prüfung; neue Einheiten aus Dezember |
| Januar 2027 | 25.–31.01. | **C** Klasse 5–7 | Rundum-Prüfung; neue Einheiten aus Januar |
| Februar 2027 | 22.–28.02. | **D** Klasse 8–10 | Rundum-Prüfung; neue Einheiten aus Februar |
| März 2027 | 25.–31.03. | **A** | … und so weiter im Kreis (alle vier Monate ist jeder Block wieder dran) |

Im November 2026 wurde zusätzlich schon **alles** einmal geprüft (Theorie aller 73 Themen, Eindeutigkeit aller Aufgaben, Lehrplan-Abgleich; MELDUNG (100) und (103)). Der Kreislauf beginnt deshalb mit Block A.
