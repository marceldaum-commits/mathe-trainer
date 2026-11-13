# Server-Teil – Vorgaben (noch nicht gebaut)

Stand: 13.11.2026 · Status: **vorbereitet, abgeschaltet**. Die App enthält die Gegenstelle (`app/js/api.js`) und die
Ansicht für die Klassen-Rangliste; beides ist unsichtbar, solange `CONFIG.api` in `app/js/config.js` leer ist.
Der Server selbst gehört nicht in dieses öffentliche Repo und wird über den Leitstand entschieden und betrieben.

## Was der Server leisten soll

| Funktion | App-Seite | Stand |
| --- | --- | --- |
| Klassen-Rangliste (Wochenwertung der Tages-Runde) | fertig, im Browser-Test mit nachgestelltem Server geprüft | Server fehlt |
| Wochen-Liga (Auf- und Abstieg) | noch nicht gebaut | Vorgabe unten |
| Echtzeit-Duell | noch nicht gebaut | Vorgabe unten |
| Ansicht für Lehrkräfte/Nachhilfe (Lernstand der eigenen Schüler) | noch nicht gebaut | Vorgabe unten, braucht Einwilligung |
| KI-Funktionen | Prüfer und Format fertig | siehe `docs/KI.md` |

## Grundsätze

- **Gleiche Adresse wie die App**, z. B. `https://trainer.mathenachhilfe-online.com/api/…`. Die App erlaubt nur
  Verbindungen zur eigenen Adresse (`connect-src 'self'`). Keine fremden Dienste aus dem Browser heraus.
- **Kein Konto, keine E-Mail, kein Passwort.** Ein Spieler ist eine zufällige Kennung, die der Server beim
  Beitritt vergibt und die nur im Gerät liegt. Dazu ein frei gewählter Spitzname (2–16 Zeichen).
- **So wenig Daten wie möglich:** Klassen-Code, Spitzname, Spieler-Kennung, Punkte je Woche. Keine Namen,
  keine Schule, keine Geräte-Kennungen, keine IP-Adressen in der Datenbank (nur kurzlebig zur Missbrauchs-Abwehr).
- **Minderjährige:** Spitznamen sind öffentlich innerhalb der Klasse → Wortfilter und Meldemöglichkeit;
  Hinweis im Formular „kein echter Name nötig" (steht schon in der App). Datenschutztext über den Leitstand.
- **Löschen:** Klasse verlassen löscht den Spieler-Eintrag; Klassen ohne Aktivität verfallen nach 12 Monaten.

## Schutz vor Schummeln: der Server rechnet nach

Die Tages-Runde ist für alle gleich, weil die Aufgaben aus einem Startwert entstehen (`makeTasks(n, stufe, startwert)`
in `app/js/exam.js`, Zufall über `seedRandom` in `app/js/math.js`). Der Server nutzt **denselben Code**:

1. Die App meldet nur: Startwert (das Datum), Stufe, die gewählten Antwort-Nummern und die Dauer.
2. Der Server erzeugt aus Startwert und Stufe dieselben Aufgaben, zählt die richtigen Antworten selbst und
   berechnet die Punkte mit `scoreOf`. Die von der App gemeldete Punktzahl ist nur ein Vergleichswert.
3. Unplausible Meldungen werden verworfen: falscher Tag, Dauer unter 1 Sekunde je Aufgabe, mehr als eine
   gewertete Runde je Spieler und Tag (die erste zählt), zu viele Anfragen je Minute.

Dafür müssen `app/js/gen.js`, `gen2.js`, `math.js` und `exam.js` (nur `makeTasks`, `scoreOf`, `POOL`) auf dem
Server laufen. Sie sind reines JavaScript ohne Browser-Abhängigkeit, wenn `tex()` durch eine leere Funktion
ersetzt wird (so macht es `tests/run.mjs`).

## Schnittstelle (so ruft die App sie auf)

Alle Antworten sind JSON. Fehler: passender HTTP-Status und `{ "error": "Text für den Nutzer" }`.

| Aufruf | Anfrage | Antwort |
| --- | --- | --- |
| `POST /api/klasse` | `{ "name": "Q12 Mathe" }` | `{ "code": "K7M2QX" }` |
| `POST /api/klasse/beitreten` | `{ "code": "K7M2QX", "name": "Spitzname" }` | `{ "klasse": "Q12 Mathe", "spieler": "zufällige Kennung" }` |
| `POST /api/ergebnis` | `{ "art": "tag", "code", "spieler", "tag": 20261113, "stufe": 3, "antworten": [0,2,1,3,0,1], "sekunden": 142, "punkte": 437 }` | `{ "ok": true, "punkte": 437 }` (vom Server berechnet) |
| `GET /api/klasse/<code>/rangliste?spieler=<kennung>` | – | `{ "woche": "2026-11-09", "liste": [{ "name", "punkte", "ich": true }] }` |

- Klassen-Code: 6 Zeichen aus `A–Z` ohne `I` und `O` und aus `2–9` (keine verwechselbaren Zeichen).
- Spitzname: 2–16 Zeichen, Buchstaben, Ziffern, Leerzeichen, `._-`. Die App prüft das vorab (`nameOk`),
  der Server muss es erneut prüfen. Die App gibt Namen immer als Text aus, nie als HTML (im Test geprüft).
- Rangliste: Summe der gewerteten Tages-Runden der laufenden Woche (Montag bis Sonntag), höchstens 50 Einträge.

## Datenmodell (Vorschlag)

| Tabelle | Felder |
| --- | --- |
| `klasse` | `code` (Schlüssel), `name`, `angelegt`, `zuletzt_aktiv` |
| `spieler` | `id` (zufällig), `klasse_code`, `spitzname`, `angelegt` |
| `ergebnis` | `spieler_id`, `tag` (JJJJMMTT), `stufe`, `richtig`, `punkte`, `sekunden`, `gemeldet_am` – eindeutig je Spieler und Tag |

## Spätere Stufen

- **Wochen-Liga:** Am Montag werden Spieler nach Wochenpunkten in Gruppen zu 20 eingeteilt; die besten 5 steigen
  auf, die letzten 5 ab. Braucht nur die Tabelle `ergebnis` plus `liga` (Spieler, Stufe, Woche).
- **Echtzeit-Duell:** Zwei Geräte, derselbe Startwert, Fortschritt über eine stehende Verbindung (WebSocket oder
  Server-Sent Events). Aufwendiger Betrieb; das Duell per Link deckt den Bedarf bis dahin.
- **Ansicht für Lehrkräfte/Nachhilfe:** Schüler gibt einen Lehrer-Code frei und überträgt damit die Statistik je
  Thema (richtig/falsch) – nur nach ausdrücklicher Einwilligung, bei Minderjährigen der Eltern. Eigener
  Datenschutz-Abschnitt und Vertrag nötig; passt zum Nachhilfe-Angebot („Wir sehen, wo es hakt").

## Offene Entscheidungen (Marcel, über den Leitstand)

1. Wo läuft der Server-Teil: auf dem eigenen Server (Verwaltung als Betreiber) oder bei einem Dienst wie
   Supabase (wie beim Hacklab)? Davon hängt ab, wer ihn baut und betreibt.
2. Datenschutz-Abschnitt und Einwilligungen (Spitznamen Minderjähriger, Lehrer-Ansicht).
3. Reihenfolge: erst Klassen-Rangliste, dann Liga, dann Lehrer-Ansicht?

## Einschalten

`api: '/api'` in `app/js/config.js` setzen, Version erhöhen, `npm run fix`, prüfen, auf `test` schieben.
Mehr ist in der App nicht nötig – die Klassen-Karte erscheint dann unter „Prüfung".
