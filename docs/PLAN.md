# Mathe-Trainer – Plan

Stand: 11.11.2026 · Status: **nur Planung – gebaut wird erst nach Marcels „los"**.

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
