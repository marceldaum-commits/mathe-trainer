# KI-Funktionen – Vorgaben (vorbereitet, abgeschaltet)

Stand: 13.11.2026 · Gehört zur späteren Premium-Fassung (siehe `docs/PLAN.md`, „Free und Premium").
In der App vorhanden: das Aufgaben-Format, ein **Prüfer, der jede KI-Aufgabe nachrechnet** (`app/js/ki/verify.js`),
ein sicherer Rechenausdruck-Leser (`app/js/ki/expr.js`) und die Aufrufe in `app/js/api.js`. Eingeschaltet wird
erst mit Server (`CONFIG.api`) und `CONFIG.ki = true`. Der KI-Schlüssel liegt **nur** auf dem Server.

## Grundregel

Keine KI-Antwort geht ungeprüft an Schüler. KI-Modelle verrechnen sich; deshalb:

1. Die KI liefert eine Aufgabe im festen Format unten – inklusive **maschinenlesbarer Rechenausdrücke**.
2. Der Server prüft mit `verify()` (derselbe Code wie in der App): Lösung rechnerisch richtig, jeder Ablenker
   rechnerisch falsch, vier verschiedene Antworten, Diagnose und Tipps vorhanden, kein eingeschleuster Code.
3. Nur bestandene Aufgaben kommen in den Vorrat und von dort zum Schüler. Die App prüft beim Empfang erneut
   (`toQuestion()` lehnt Ungeprüftes ab).
4. Durchgefallene Aufgaben werden verworfen und gezählt (Fehlerquote = Messgröße für Modell und Anweisung).

## Aufgaben-Format

```json
{
  "art": "ableitung",
  "thema": "Kettenregel",
  "stufe": 3,
  "frage": "Welche Ableitung ist richtig?",
  "formel": "f(x)=(2x+1)^3",
  "funktion": "(2*x+1)^3",
  "antworten": [
    { "tex": "6(2x+1)^2", "ausdruck": "6*(2*x+1)^2", "richtig": true },
    { "tex": "3(2x+1)^2", "ausdruck": "3*(2*x+1)^2", "fehler": "Die innere Ableitung 2 fehlt." },
    { "tex": "6(2x+1)^3", "ausdruck": "6*(2*x+1)^3", "fehler": "Der Exponent muss um 1 kleiner werden." },
    { "tex": "2(2x+1)^2", "ausdruck": "2*(2*x+1)^2", "fehler": "Der alte Exponent fehlt als Faktor." }
  ],
  "tipps": ["Hier steckt eine Funktion in einer anderen.", "Äußere Ableitung mal innere Ableitung."],
  "erklaerung": "Kettenregel: 3·(2x+1)²·2 = 6(2x+1)²."
}
```

| Art | Zusatzfelder | Was nachgerechnet wird |
| --- | --- | --- |
| `ableitung` | `funktion`, je Antwort `ausdruck` | Antwort gleich der numerischen Ableitung an mehreren Stellen |
| `stammfunktion` | `funktion`, je Antwort `ausdruck` | Ableitung der Antwort gleich der Funktion |
| `integral` | `funktion`, `von`, `bis`, je Antwort `wert` | numerisches Integral |
| `zahl` | `rechnung` (reiner Zahlenausdruck), je Antwort `wert` | Ergebnis der Rechnung – für Stochastik, Geometrie, Sachaufgaben |

Rechenausdrücke: Zahlen, `x`, `+ − * / ^`, Klammern, `sin cos tan exp ln sqrt abs`, `pi`, `e`. Mal-Zeichen
immer ausschreiben (`2*x`). Kein Programmcode – der Leser führt nichts aus, er rechnet nur.

**Grenze:** Geprüft wird die Rechnung, nicht der Text. Ob eine Sachaufgabe zum Rechenausdruck passt, kann der
Prüfer nicht erkennen. Dafür: zweiter KI-Durchgang als Gegenleser plus Stichproben durch einen Menschen, bevor
ein neuer Aufgabentyp freigegeben wird. Aufgaben mit Begründung („Zeigen Sie …") bleiben ohne automatische
Wertung und werden als „mit Musterlösung" gekennzeichnet.

## Schnittstelle

| Aufruf | Anfrage | Antwort |
| --- | --- | --- |
| `POST /api/ki/aufgabe` | `{ "thema": "Kettenregel", "stufe": 3, "stil": "abi" }` | `{ "aufgabe": { … Format oben … } }` – aus dem Vorrat, bereits geprüft |
| `POST /api/ki/erklaer` | `{ "frage", "formel", "richtig", "gewaehlt", "art": "einfacher" }` | `{ "text": "…" }` |

- „Erklär's mir anders" (`art`: `einfacher`, `beispiel`, `eselsbruecke`) bekommt **nur** die Aufgabe und die
  gewählte Antwort – keinen Namen, keine Statistik, keine Kennung.
- Erklär-Texte werden vor der Anzeige von HTML befreit und in der Länge begrenzt.

## Kosten und Missbrauch

- **Vorrat statt Echtzeit:** Aufgaben werden auf Vorrat erzeugt und geprüft; Schüler ziehen aus dem Vorrat.
  Das trennt Kosten von Nutzung und macht die App schnell.
- **Tageslimit je Zugang** für Erklärungen (wie beim Hacklab), dazu eine Monats-Obergrenze insgesamt.
- Kleines Modell für Aufgaben und Erklärungen, größeres nur für den Gegenleser. Was eine Aufgabe wirklich
  kostet und wie viele durchfallen, misst Stufe P1 – vorher gibt es keine belastbare Zahl.

## Datenschutz

Nutzer sind oft minderjährig. Vor dem Start: Einwilligung der Eltern beim Kauf, Vertrag zur Auftragsverarbeitung
mit dem KI-Anbieter, keine personenbezogenen Angaben in den Anfragen, eigener Abschnitt in der
Datenschutzerklärung. Über den Leitstand klären und rechtlich prüfen lassen.

## Foto vom Rechenweg (später)

Schüler fotografiert seine Rechnung; die KI nennt die erste falsche Zeile. Technisch möglich, aber: Fotos können
Namen und Gesichter enthalten → nur mit klarer Einwilligung, Foto wird nicht gespeichert, Antwort ist ein
Hinweis und keine Bewertung. Nicht vorbereitet.

## Stufen

| Stufe | Inhalt | Voraussetzung |
| --- | --- | --- |
| P1 | 200 Aufgaben je Art erzeugen, mit `verify()` prüfen, Fehlerquote und Kosten messen; nichts geht an Schüler | KI-Schlüssel (Geheimnis – ein Schritt von Marcel), kleiner Server-Teil |
| P2 | Vorrat, Zugang über den Shop, Tageslimit | Leitstand/Verwaltung, Datenschutz |
| P3 | KI-Aufgaben und „Erklär's mir anders" für Premium | Preis/Angebot (Marketing-Raum) |
