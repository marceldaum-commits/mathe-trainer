# Mathe-Trainer – Plan

Stand: 11.11.2026 · Status: **nur Planung – gebaut wird erst nach Marcels „los"**
(sobald sein normaler Server wieder läuft).

## Ziel

Ein kostenloses Windows-Programm zum Herunterladen, mit dem Schüler der **Oberstufe**
(zuerst **Bayern und Hessen**) Mathe üben und lernen. Es läuft ohne Internet und ohne Konto,
aktualisiert sich selbst und wirbt dezent für die Nachhilfe-Firma mathenachhilfe-online.com
(Seite ist aktuell offline, kommt wieder).

## Leitbild (Marcel, 11.11.2026): interaktiv, pädagogisch wertvoll, modern

Kein digitales Arbeitsblatt. Der Schüler **tut** etwas und **versteht**, statt nur Ergebnisse einzutippen.

**Interaktiv**
- Graphen anfassen: Punkte ziehen, Schieberegler, Tangente an der Kurve entlangschieben und
  die Steigung live sehen.
- Selbst skizzieren: z. B. den Graphen der Ableitung zeichnen, das Programm vergleicht.
- Rechenweg Zeile für Zeile eingeben; das Programm prüft jede Zeile und zeigt die erste falsche.
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
- Formel-Eingabe mit Mathe-Tastatur (Brüche, Wurzeln, Potenzen) statt Tipp-Kürzeln.
- Kurze Einheiten von 10–15 Minuten mit klarem Tagesziel.
- Optional später: KI-Tutor für Rückfragen (braucht Internet und verursacht laufende Kosten –
  Entscheidung offen).

## Grundsätze

- **Aufgaben erzeugt das Programm selbst** (Zufallszahlen, eigener Lösungsweg). Marcels
  Drive-Ordner „Mathe" dient nur als Orientierung für Themen und Stufen.
- **Keine fremden Aufgaben kopieren.** In dem Ordner liegt auch Material anderer Anbieter;
  das darf nicht in ein öffentliches Programm. Marcels eigene Aufgaben dürfen 1:1 hinein,
  wenn er die Dateien benennt.
- **Lernfortschritt bleibt lokal** auf dem PC (kein Konto, kein Datenschutz-Thema bei Schülern).
- **Selbst-einrichtend:** Bauen, Verteilen und Updates laufen automatisch über GitHub.
- **Klein anfangen:** erst Analysis, dann erweitern.
- Dieses Projekt ist **getrennt vom Nachtfalter Hacklab**.

## Technik

- **Bauart:** Web-Technik (HTML/JS) in einem Windows-Fenster, verpackt mit Tauri
  (kleine Datei, eingebautes Auto-Update). Derselbe Code kann später im Browser/Handy laufen.
- **Bauen und Verteilen:** GitHub Actions baut die `.exe` bei jedem Release; Download über
  GitHub Releases.
- **Updates:**
  - Programm prüft beim Start auf eine neue Version, lädt sie im Hintergrund und fragt nach
    einem Neustart. Ohne Internet läuft die alte Version weiter.
  - Neue Aufgaben/Themen kommen als kleine Datendatei – ohne Neuinstallation.
- **Signatur-Schlüssel** für das Auto-Update: einmaliger Schritt von Marcel
  (als GitHub-Geheimnis hinterlegen, Anleitung folgt beim Start).

## Phasen

| Phase | Inhalt | Ergebnis |
| --- | --- | --- |
| 0 – Gerüst | Leeres Programm, automatischer Bau, Auto-Update, Formel-Anzeige | `.exe`, die startet und sich aktualisiert |
| 1 – Erste Version (Analysis) | Ableiten, Tangente/Normale, Kurvendiskussion, Integrale und Flächen, Extremwertaufgaben. 3 Stufen, Lösungsweg Schritt für Schritt, Punkte und Tages-Serie, Fehler-Kartei, Logo und Probestunden-Knopf | Erste Version zum Verteilen |
| 2 – Abi-Funktionen | Bundesland-Schalter (Bayern, Hessen Grundkurs/Leistungskurs), Teil ohne und mit Hilfsmitteln, Test auf Zeit mit Punkte-Prognose, Eltern-Bericht zum Drucken | Abi-Trainer |
| 3 – Weitere Gebiete | Analytische Geometrie, dann Stochastik, Graphen mit Schiebereglern | Alle drei Abi-Gebiete |
| 4 – Extras | Operatoren-Training, Abi-Countdown mit Lernplan, Gutschein-Code, Weiterempfehlen | Feinschliff und Werbung |
| 5 – Später | Grundlagen-Auffrischung (Algebra, Funktionen), Browser-/Handy-Version, optionales Konto | Nach Bedarf |

## Funktionen im Detail

**Lernen**
- Üben nach Thema und Stufe, Aufgaben gehen nie aus.
- Lösungsweg Schritt für Schritt bei Fehlern.
- Schwächen-Erkennung: was nicht sitzt, kommt häufiger.
- Fehler-Kartei: falsche Aufgaben kommen nach ein paar Tagen wieder.
- Klassenarbeits-/Abi-Modus auf Zeit, mit Punkte-Prognose (0–15 Punkte).
- Zwei Prüfungsteile wie im Abi: ohne und mit Hilfsmitteln.
- Operatoren-Training („bestimmen", „zeigen", „begründen", „skizzieren" …).
- Abi-Countdown mit täglichem Lernplan.
- Graphen mit Schiebereglern.
- Motivation: Punkte, Tages-Serie, Abzeichen.

**Werbung (dezent)**
- Logo und „von mathenachhilfe-online.com" im Programm.
- Hinweis auf kostenlose Probestunde, wenn ein Thema mehrfach schiefgeht; die Anfrage
  nennt das Problem-Thema.
- Eltern-Bericht zum Ausdrucken (was geübt wurde, was klappt, wo es hakt) mit Firmenadresse.
- Gutschein-Code, z. B. nach 7 Tagen Lern-Serie (macht messbar, wie viele Kunden kommen).
- „Schick das Programm einem Mitschüler".

## Themen-Landkarte (aus Marcels Ordner, als Orientierung)

01 Rechengrundlagen · 02 Algebra · 03 Funktionen (linear, quadratisch, Potenz, Exponential) ·
04 Analysis (Grenzwerte und Stetigkeit, Differentialrechnung, Integralrechnung,
Extremwertaufgaben, Kurvendiskussion und Funktionenscharen) · 05 Geometrie · 06 Stochastik ·
07 Übersichten und Prüfungen · 08 Physik

Stufen in der Vorlage: Grundlagen → Fortgeschritten → Expert (→ Universität).

## Offen – braucht Marcel (erst beim Start)

1. Logo und Farben der Firma (sonst neutraler Vorschlag).
2. Ziel des Probestunden-Knopfs, solange die Seite offline ist (E-Mail oder Telefon).
3. Signatur-Schlüssel bei GitHub hinterlegen (mit Anleitung).
4. Dateinamen der eigenen Aufgaben, falls welche 1:1 hinein sollen.

## Offene Entscheidungen

- **Windows-Warnung „unbekannter Herausgeber":** Vorschlag – ohne Zertifikat starten,
  später kaufen, wenn das Programm ankommt (Alternative: Microsoft Store).
- **Name:** „Mathe-Trainer" ist Arbeitstitel.
- **Lehrplan:** Themen für Bayern und Hessen beim Start gegen die offiziellen Vorgaben prüfen.
