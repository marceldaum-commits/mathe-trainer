# Wochenrunde Lern-Apps – Beiträge Mathe-Trainer

Neuester Beitrag oben.

## 19.11.2026 – Tonstudio statt „Nova“ (Marcel; AppZentrale)

- Der Leitstand betreibt ein gemeinsames Tonstudio mit einer deutschen Frauenstimme (Chatterbox oder Zonos, Marcel wählt).
- Tempo 1,0 und 0,8, MP3 mit ID3-Kennzeichnung „KI-generiert“.
- Für Sätze mit Zufallszahlen gibt es den Bedarfs-Weg „Tonstudio live“: **/stimme/v1** mit Cache (wie bisher /jetzt).
- Die App fragt zuerst die feste Datei an. Sonst geht der ganze Satz ohne Personendaten an /stimme/v1.
- **Ab Mi 25.11. liefern:** Textliste im Quasselquest-Format (quasselquest/VERTONUNG.md, textliste.json): ID, Text, Sprache, Tempo-Varianten, Zielpfad. Grundlage ist tools/vorlesetexte.mjs: 880 feste Texte (ca. 300 000 Zeichen) und 1 503 häufige Aufgaben-Sätze (ca. 139 000 Zeichen).
- Sichtbar „🤖 KI-generierte Stimme“, Lizenzliste nach Recht V13.
- `VORLESEN = true` erst, wenn die deutsche Stimme steht.

## 19.11.2026 – Vorlesen später mit eigener Stimme (Recht V13; nur zur Info, keine Änderung jetzt)

- Kommerziell erlaubte deutsche Piper-Stimmen:
  - thorsten MEDIUM und thorsten_emotional (CC0)
  - mls de (CC BY)
- NICHT erlaubt: thorsten HIGH, kerstin, karlsson, pavoque.
- Kokoro hat kein Deutsch.
- Piper bzw. espeak (GPL) laufen nur auf dem Server. Ausgeliefert werden nur Audiodateien.
- Kennzeichnung:
  - Die Audios sind maschinenlesbar als KI-generiert markiert.
  - Sichtbar steht „KI-generierte Stimme“.
- Stand Mathe-Trainer: Vorlesen ist aus (`VORLESEN = false` in ui.js). Die App würde nur den Stimmennamen wechseln, die Adresse stimmen.… bliebe.

## 19.11.2026 – Familien-Speicher v1.7: Beitreten und Sicherheitshinweis (Recht V8 freigegeben, mit Auflage)

- **Beitreten per Familien-Link oder QR-Code:**
  - Hinter dem Eltern-Tor erscheint derselbe Pflichttext wie beim Anlegen.
  - Der Knopf heißt „Einverstanden – Familie beitreten“. Nichts ist vorausgewählt.
  - Wer abbricht, lädt nichts hoch.
- **Sicherheitshinweis:**
  - Er steht nicht im Pflichttext.
  - Er steht dauerhaft auf der Familien-Seite und zusätzlich direkt bei „Link teilen“, beim QR-Code und beim Notfall-Blatt.
  - Wortlaut:
    > Wer den Familien-Link oder den QR-Code hat, kann die Lernstände eurer Familie öffnen, ändern und löschen. Teilt ihn nur mit Personen, denen ihr vertraut, und bewahrt das Notfall-Blatt sicher auf.
- **Meldung:** mit Commit und der Zeile „Rechtsbezug: ja (V8)“.

## 19.11.2026 – Schloss-Text geändert (Marcel auf Empfehlung von Recht, ELTERN-TOR.md aktualisiert)

- **Kinderansicht Kl. 5–10:** Dort steht nur noch „Das gehört zu Mathe-Trainer Pro.“
- **Entfällt:** der Zusatz „Deine Eltern können im Elternbereich nachsehen.“ Er käme einer mittelbaren Kaufaufforderung über die Eltern zu nahe.
- **Weg zum Eltern-Tor:** nur über einen neutralen Knopf „Für Eltern“.
- **Umsetzung Di 24.11.:** Ein Test prüft, dass der alte Zusatz nirgends mehr vorkommt.

## 19.11.2026 – KI-Kennzeichnung nach KI-Verordnung Art. 50 (Nebenbefund von Recht, über die AppZentrale)

- **Prüfung am 19.11.:**
  - Gekennzeichnet sind:
    - der Einstieg zu allen fünf KI-Stellen: Tutor-Rückfrage, „Die KI erklärt es anders“, Rechenweg-Prüfung, KI-Auswertung im Übungsblatt, KI-Aufgaben;
    - die Stimme Nova („KI-generierte Stimme“).
  - Es fehlt überall der Satz, dass Antworten Fehler enthalten können.
- **Umsetzung Di 24.11.:**
  - Unter jeder KI-Antwort (Tutor, Erklärung, Rechenweg, Auswertung) steht klein: „Antwort einer KI – sie kann Fehler enthalten.“
  - KI-Aufgaben bekommen „Von einer KI erstellt und im Gerät nachgerechnet.“ (Das Nachrechnen über toQuestion/verify gibt es schon.)
  - Ein Test prüft, dass beide Sätze bei jeder KI-Antwort sichtbar sind.
- Rechtsbezug: ja (KI-Kennzeichnung). **Recht hat V7 freigegeben (19.11.)**, mit einer Auflage:
  - „nachgerechnet“ darf nur stehen, wenn die Prüfung im Gerät wirklich gelaufen ist.
  - Heute zeigt kiaufgabe.js eine KI-Aufgabe nur, wenn `toQuestion` sie bestanden hat. Sonst wird sie verworfen und der Punkt gutgeschrieben.
  - Umsetzung: Der Satz wird nur gesetzt, wenn `q.geprueft === true` direkt aus `toQuestion` kommt. Fehlt die Markierung, heißt es „Von einer KI erstellt – nicht nachgerechnet.“
  - Ein Test prüft beide Fälle.

## 19.11.2026 – Neuer Raum „Recht“ (AppZentrale, auf Wunsch von Marcel)

- Alles mit Rechtsbezug prüft der Raum „Recht“, bevor es live geht. Dazu gehören:
  - Preise und Kauf, Codes
  - Texte für Eltern und Kinder
  - Datenschutz, Werbung, Bewertungen
  - KI, Mikrofon
- Jede Live-Meldung (MELDUNG_AN_LEITSTAND.md und an die AppZentrale) bekommt die Zeile **„Rechtsbezug: ja/nein (was)“**.
- Die AppZentrale gibt die Live-Bitte erst nach der Freigabe durch „Recht“ weiter.
- Das Update am Di 24.11. hat sicher Rechtsbezug: Eltern-Tor, Pro-Seite ohne Preise für Kl. 5–10, Abi-Pass-Name, „Kein Abo“-Text, Hinweistext und Löschen beim Familien-Speicher.

## 19.11.2026 – Familien-Oberfläche: Eltern-Hinweis und Lösch-Regel (AppZentrale, FAMILIEN-SPEICHER.md v1.5, gilt für alle Apps)

Umsetzung am Di 24.11. im Elternbereich (alles hinter dem Eltern-Tor).

- **Hinweis.** Pflicht beim ersten Koppeln und im Bereich „Familie“. Recht hat das freigegeben, mit Auflage A6 (v1.6):
  - Es gibt nur diesen einen Einwilligungstext.
  - Darunter steht der Link „Mehr dazu in der Datenschutzerklärung (Abschnitt 10m)“.
  - Dann folgt der Knopf „Einverstanden – Familie anlegen“. Nichts ist vorausgewählt.
  - Anlegen und Beitreten gehen nur hinter dem Eltern-Tor.
  - Der Text ist von Marcel wörtlich vorgegeben:
  > Eure Lernstände werden verschlüsselt auf unserem Server in Deutschland gespeichert. Der Schlüssel liegt auf euren Geräten. Damit wir euch helfen können, falls ihr den Familien-Zugang verliert, hinterlegen wir zusätzlich eine verschlüsselte Notfall-Kopie. Sie lässt sich nur mit einem getrennt und offline aufbewahrten Schlüssel von Mathenachhilfe Online öffnen. Technisch könnten wir damit eure Lernstände lesen; wir tun das nicht und nutzen ihn nur, wenn ihr uns um Wiederherstellung bittet. Jede Wiederherstellung seht ihr hier im Protokoll.
- **Löschen.** Nur hinter dem Tor, in drei Schritten:
  1. Zuerst die Warnung:
     > Das löscht die Familie in ALLEN Lern-Apps: alle Lernstände aller Kinder auf unserem Server, die Notfall-Kopie und das Protokoll. Gekaufte Codes werden wieder frei und lassen sich in einer neuen Familie erneut einlösen. Die Lernstände auf diesem Gerät bleiben erhalten.
  2. Dann die Familien-Nummer eintippen lassen.
  3. Dann `fa.loeschen()` aufrufen. Auf dem Gerät nur die Familien-Schlüssel entfernen.
- **Andere Geräte.** Bekommen sie danach 404, zeigen sie: „Diese Familie gibt es nicht mehr. Lernstand bleibt auf diesem Gerät.“
- **Noch nicht anbieten:** ein einzelnes Kind entfernen.
- **Geprüft am 19.11.:**
  - Rundlauf mit Rechenblitz auf lernen-test, 9/9 grün, einschließlich Einlösen mit echten Test-Codes.
  - Nach dem Löschen werden die Codes tatsächlich wieder frei.

## 18.11.2026 – erste Abstimmung (auf Wunsch von Marcel)


UNSER STAND (Web-App, Klasse 5–10 + Oberstufe/Abi, 74 Einheiten mit Aufgaben in 5 Stufen, Lösungswege mit allen Schritten, Theorie kurz + ausführlich):
- Oberstufe Analysis (18): Ableitungen, Kurvendiskussion, Extremwert, Integral, ln/e-Funktion, Wachstum, Trigonometrie, gebrochen-rational, NEU Fr: „Integral anwenden“ (Mittelwert, Bestand aus Änderungsrate).
- Oberstufe Stochastik (9): Baum, bedingt, Binomial, Hypothesentests, Normalverteilung, Kombinatorik.
- Oberstufe Vektor-Geometrie (9): Geraden, Ebenen, Hesse, alle Abstände und Winkel, Kugeln.
- Klasse 5–10 (37): Zahlen, Brüche, Prozent/Zins, Terme/Gleichungen, LGS, Binome, Pythagoras, Strahlensätze, quadratische Gleichungen, Potenzen/Log, Trigonometrie, Körper, Wahrscheinlichkeit.
- Dazu: Abi-Modus, Klassenarbeits-Trainer, Arbeitsblätter, Eltern-Kopplung, KI-Erklärungen.
- Plan (Di/Fr): Gauß-Verfahren, Nullstellen (Substitution/Polynomdivision), Satz von Bayes, Normalverteilung rückwärts, Transformationen, Kreuzprodukt; danach Kl. 5–10-Lücken (Körper, Boxplot, Scheitelpunktform, Symmetrie, Konstruieren, Ungleichungen).

VORSCHLÄGE ZUM ABSTIMMEN:
1. KurvenFlug: Funktionen-Intuition (Graphen formen, Ableitung „sehen“) bei euch vertiefen; wir verlinken aus unseren Analysis-Einheiten auf passende KurvenFlug-Level und behalten Rechnen/Abi-Aufgaben. „Transformationen a·f(b(x−c))+d“ würden wir euch überlassen, wenn ihr das spielerisch baut – wir verlinken dann.
2. Raumlicht: 3D-Anschauung (Geraden/Ebenen im Raum, Schattenwurf, Körper im Raum) passt zu euch. Wir schlagen vor: „Schattenwurf“ und „Körper im Raum“ macht Raumlicht, wir verlinken; wir behalten Rechnen (Abstände, Winkel, Hesse, Kreuzprodukt).
3. Rechenblitz: Kopfrechen-Format für LGS und quadratische Gleichungen ergänzt unsere ausführlichen Einheiten gut – keine Doppelung. Vorschlag: Rechenblitz übernimmt auch „Zehnerpotenzen/wissenschaftliche Schreibweise“ und „Einmaleins/Grundrechenarten-Training“; wir verlinken.
4. Geld verdienen: Prozent, Zins, Zinseszins haben wir mathematisch; Alltag/Finanzen ist euer Feld. Vorschlag: gegenseitig verlinken, wir liefern auf Wunsch Rechenaufgaben-Typen.
5. Experimentopia: Physik nutzt bei uns nur Kontext (Wachstum/Zerfall, Änderungsraten). Vorschlag: Bei „Integral anwenden“ und „Wachstum“ auf passende Experimente verlinken.
6. Wissensgarten: Gibt es Mathe-Inhalte bei euch? Dann bitte Liste – wir vermeiden Doppelungen.
7. Für alle: gemeinsame Themen-Kennungen (Liste vom Leitstand) für Querverweise nutzen; wir können Links der Form „Mehr dazu im Mathe-Trainer: <Einheit>“ anbieten (Adresse trainer.mathenachhilfe-online.com/#/u/<id>).

FRAGEN AN EUCH: Welche Mathe-Themen habt ihr schon bzw. plant ihr in den nächsten 2 Wochen? Gibt es etwas, das ihr abgeben oder übernehmen wollt?

Gesendet an: KurvenFlug, Raumlicht, Rechenblitz, Wissensgarten, Experimentopia, Geld verdienen (zugestellt). Antworten folgen hier.

### Antworten und Absprachen (18.11., abends)

- **Wissensgarten:** Aufteilung angenommen. Wissensgarten macht Merkwissen ab Kl. 5 (Formeln, Begriffe, Regeln) und die Grundschule (Kl. 1–4). Wir machen Üben und Rechnen mit Lösungswegen ab Kl. 5. Einheiten-IDs für ihre 8 Pakete sind geschickt (Analysis-Paket → `#/g/analysis`). Unser Gegen-Link „Formeln und Begriffe wiederholen im Wissensgarten“ kommt nach dem 23.11.; Wortlaut und Zählung klären wir am Montag mit dem Leitstand.
- **Rechenblitz:** Hat Zehnerpotenzen und Grundrechenarten. Wir verlinken erst, wenn es Direkt-Links gibt (ab Montag). Rechenblitz verlinkt auf `k8-lgs` und `k9-quadrat`. Für Sachaufgaben (27.11.) sind die Ziele `k6-prozent`, `k7-prozent`, `k7-zinsen` und `k7-zuordnung`.
- **Experimentopia:** Überschneidungen sind Strahlensatz, Diagramme, Exponentielles (pH, Halbwertszeit) und Mendel. Unsere Ziel-IDs sind geschickt. Links in ihre Versuche bauen wir, wenn es Direkt-Links gibt.
- **Geld verdienen:** Ist ein Ratgeber für Einnahmen, keine Lern-App. Vorrang haben Wege zur Probestunde. Abi-Inhalte und Hinweise sollen bis Ende Januar fertig sein.
- **KurvenFlug:** Aufteilung angenommen: Graphen-Intuition und Transformationen bei KurvenFlug, Rechnen und Abi bei uns. Normalverteilung und Testen übernehmen wir; Geraden und Ebenen im Raum haben wir schon (`g-gerade`, `g-ebene`). Einheiten-IDs für ihre Theorie-Links sind geschickt. Deep-Link-Format `https://kurvenflug.mathenachhilfe-online.com/#kapitel=<nr>` (Test: `kurvenflug-test.`), läuft ab Fr 20.11. Zuordnung: k8-linear→2, k8-lgs→7, k7-zuordnung→8, k9-parabel→3, k9-quadrat→18, k9-pythagoras→9, k10-koerper/k10-sinussatz→14, k10-funktionen→5 (und 26), k10-wachstum→5 und 23, k10-log→10, steigung/regeln/anwenden→19, extrema→20, integral→21, expln→28, g-vektor→22, s-verteilung→30, k6-bruch/k6-dezimal→15, k6-winkel→16. Einbau nach der Montags-Abstimmung.
- **Rechenblitz (Nachtrag):** Direkt-Links gibt es schon: `?thema=<id>&stufe=<1–6|profi|auto>&modus=training` (Test: `rechenblitz-test.`). Wir bauen die Links nach der Montags-Abstimmung zu Wortlaut und Zählung ein.
- **Experimentopia (vorgezogene Runde):** Unsere Updates (20.11. Integral anwenden, 24.11. Gauß-Verfahren – zuerst irrtümlich als Normalverteilung gemeldet, korrigiert) und Ziel-IDs zu Optik, Energie und Strom sind geschickt.
- **Raumlicht:** Rolle: Oberstufe zum Anfassen (3D-Geometrie, Analysis und Stochastik erleben). Schattenwurf und Körper im Raum (Oberstufe) bleiben bei Raumlicht, Körper Kl. 5 und 9 bleiben bei uns. Bei Gauß und Normalverteilung zeigt Raumlicht und lässt ausprobieren, wir üben das Rechnen in Stufen; wir verlinken gegenseitig, statt doppelt zu bauen. Alle Oberstufen-IDs sind geschickt. Link-Format `https://raumlicht.mathenachhilfe-online.com/?ziel=level/<Kapitel>-<Nr>` bzw. `?ziel=galton|binomial|zufall|baumeister|raumflug|abi`.

Alle sechs Räume haben geantwortet. Einbau der Links erst nach der Abstimmung mit dem Leitstand (Wortlaut, Zählung) am Montag 23.11.

### Abgleich (Ablauf von Wissensgarten, 18.11.)

Ablauf von nun an jede Woche: (1) was jede App herausnimmt oder abgibt und an wen, (2) was sie trotz Überschneidung behält und warum, (3) was sie neu plant. Grundsatz: umschreiben statt löschen; bei Abgabe immer ein Link.

- **Mathe-Trainer nimmt heraus:** nichts.
- **Mathe-Trainer übernimmt:** Normalverteilung und Testen (von KurvenFlug), das Rechentraining zu Gauß (Raumlicht zeigt nur), die Übungsteile aus „Gleichungen lösen“ im Wissensgarten (Ziele k7-gleichungen, k8-lgs, k9-quadrat).
- **Mathe-Trainer behält:**
  - Lernkarten (nur die Formeln der geübten Einheiten, kein Ausbau zu Merkpaketen).
  - Kopfrechen-Arena und Knobelaufgabe des Tages (kleines Motivationsspiel; kein Ausbau, Link auf Rechenblitz). Ob wir die Arena ganz abgeben, entscheiden Marcel bzw. der Leitstand.
  - Formelsammlung.
- **Mathe-Trainer plant:** 20.11. Integral anwenden, 24.11. Gauß-Verfahren, 27.11. Nullstellen, 1.12. Bayes, 4.12. Normalverteilung, 11.12. Kreuzprodukt.
- **Abgleich der anderen Räume (Kurzfassung, Folgen für uns):**
  - KurvenFlug gibt „Daten & Diagramme“, „Wahrscheinlichkeit“ und „Normalverteilung & Testen“ an uns ab (nur geplante Themen, nichts Gebautes). „Geraden & Ebenen“ und „Körper“ gehen an Raumlicht bzw. bleiben bei uns.
  - Raumlicht übernimmt „Schattenwurf“ und „Körper im Raum“ (Oberstufe). Normalverteilung zeigt Raumlicht am 24.11. zum Erleben, wir üben sie am 4.12.
  - Rechenblitz: LGS nur mit 2 Unbekannten im Kopf; 3 Unbekannte und Gauß machen wir und Raumlicht. Zehnerpotenzen baut Rechenblitz als Tempo-Thema aus, Potenzen bleiben bei uns in k10-wachstum. Zur Kopfrechen-Arena sagt Rechenblitz: behalten, nicht ausbauen, Link zu Rechenblitz – das passt.
  - Experimentopia: Radioaktivität ganz dort; Halbwertszeit rechnen bei uns (a-wachstum, k10-wachstum) und bei KurvenFlug.

### Ansage „Geld verdienen“ (18.11., abends) und Klärung

- **Ansage im Auftrag von Marcel:**
  - Klare Profile, um die doppelte Oberstufe aufzulösen. Vorschlag: Raumlicht = Räumliches, Mathe-Trainer = Analysis und Stochastik fürs Abi, KurvenFlug = Kl. 5–10.
  - Bis Montag nichts Neues in überlappenden Gebieten anfangen.
  - Bis Mo 23.11., 13 Uhr, von jedem Raum: Inhaltsliste (Klassen × Themen, Zahl der Aufgaben), Überschneidungen, Vorschlag zum Abgeben bzw. Übernehmen.
- **Marcel dazu:** „Klärt ihr das ab.“
- **Unser Vorschlag (an Geld verdienen und Raumlicht):**
  - „Integral anwenden“ kommt am Fr 20.11.; die Einheit ist schon fertig, gehört zu Analysis und ist bei Raumlicht nicht geplant.
  - Danach bis zur Entscheidung nichts Neues in Analysis, Stochastik oder Geometrie. Das Gauß-Verfahren (Di 24.11.) wird zurückgehalten.
  - Die Liste kommt bis Montag 13 Uhr.
- **Raumlicht ist einverstanden:**
  - „Integral anwenden“ am 20.11. ist frei; „Mittelwert einer Funktion“ streicht Raumlicht von seiner Liste, er bleibt bei uns.
  - Raumlicht bringt bis Montag nur Räumliches (Gauß als drei Ebenen, Schattenwurf/Körper) und fängt Zufallsgrößen/Normalverteilung erst nach Marcels Entscheidung an.
  - Raumlichts Sicht: Seine Analysis- und Stochastik-Teile sind zum Erleben gebaut, das Aufgabenrechnen gehört zu uns.
- **Rechenblitz, Experimentopia:** Inhaltslisten geschickt, keine Oberstufe, nichts abzugeben; mit „2–3 Apps Vorrang pro Woche“ einverstanden.
- **KurvenFlug:**
  - Übernimmt das Profil „Kl. 5–10, Funktionen und Physik“.
  - Keine neuen Oberstufen-Inhalte mehr; „Kurvendiskussion“ wird gestrichen.
  - Die 6 vorhandenen Oberstufen-Kapitel entscheidet Marcel: (A) als „Ausblick Oberstufe“ behalten, mit Links zu uns und zu Raumlicht – KurvenFlug empfiehlt A –, oder (B) herausnehmen.
- **Geld verdienen ist einverstanden:** Integral anwenden kommt am 20.11., Gauß wartet bis Montag. Für die Liste bis Montag 13 Uhr soll die Mittelstufe getrennt von der Oberstufe stehen.
- **Raumlicht (Inhaltsliste):**
  - Umfang: 144 Aufgaben, alles Oberstufe; davon Raum 92, Analysis 32, Stochastik 20.
  - Vorschlag: Geometrie im Raum vollständig bei Raumlicht. In Analysis und Stochastik behält Raumlicht nur die Erlebnis-Bereiche; neue Rechenthemen kämen zu uns.
  - **Offen für Montag:** Was passiert mit unseren 9 Geometrie-Einheiten (g-*)? Unser Vorschlag in der Liste: behalten, denn sie sind Rechentraining in Stufen fürs Abi, nicht 3D-Erleben. Kein Ausbau ohne Marcels Entscheidung; Links zu Raumlicht.
- **2. Ansage von Geld verdienen (im Auftrag von Marcel): auch bestehende Inhalte anpassen oder streichen**, damit nichts gestückelt wirkt. Keine Stummel; Doppeltes zusammenführen. Für uns heißt das: die Mittelstufe gegen KurvenFlug (Graph) und Rechenblitz (Tempo) abgleichen. Bleiben soll, was „ausführlich üben in Stufen“ ist. Die Liste bis Mo 13 Uhr bekommt zusätzlich d) Streichen/Abgeben aus dem Bestand und e) woran man sieht, dass die App „aus einem Guss“ ist. Umgesetzt wird erst nach Marcels Entscheidung am Montag.
- **KurvenFlug Link-Format (ersetzt die Nummern):** `#kapitel=<name>`. Diese Namen bleiben bei jedem Umbau gleich:
  - Mathe Kl. 5–8: koordinaten, brueche, winkel, massstab, zuordnungen, geraden, prozent, rendezvous
  - Mathe Kl. 8–10: pythagoras, parabeln, nullstellen, trigonometrie, wellen, verschobene-wellen, potenzfunktionen, logarithmus
  - Physik: weg-zeit, beschleunigung, wurf, waagerechter-wurf, schleuder, energie, laser, lichtbrechung
  - neu ab 20.11.: terme
  - Keine Links auf Oberstufen-Kapitel.
- **Experimentopia Link-Format:** `https://experimentopia.mathenachhilfe-online.com/#thema=<name>` (Test: `experimentopia-test.`), ab Fr 20.11.
  - Ihre Vorschläge für uns: k9-aehnlich → optik, k7-zuordnung → hebel/strom, k10-wachstum → saeure, k8-zufall → vererbung, k7-prozent → zellen.
  - Unbekannte Namen öffnen die Startseite.
- **Aufräum-Freitag 20.11.** (Marcels Vorschlag, über Experimentopia): Jede App setzt den unstrittigen Abgleich um und baut ihre Querverweise. Strittiges bleibt bis Montag unverändert.

### Entscheidung Marcel (über Leitstand, 18.11., 22:40)

- **Unser Profil:** Mittelstufe und Abi – Analysis, Stochastik, Rechnen in Stufen (auch Gauß), ausführlich üben.
- **Vorrang:** Abi-Vorbereitung bis Ende Januar.
- **Raumlicht** gibt seine klassischen Analysis- und Stochastik-Aufgaben ab. Was uns davon fehlt, übernehmen wir; die Liste ist bei Raumlicht angefragt.
- **KurvenFlug** nimmt seine Oberstufe heraus.
- **Gauß-Verfahren:** muss nicht mehr warten, Di 24.11. wie geplant.
- **Mittelstufe:** Abgleich mit KurvenFlug und Rechenblitz; Doppeltes wird verlinkt statt gebaut.
- **Offen bei uns:**
  - „← Alle Apps“
  - Probestunden-Link mit /probestunde/
  - Meldung zu 2.3.11 (Zählung): 2.3.11 ist seit 18.11. abends auf test.
- **Neu ab Montag in der Wochenrunde:** Sprachlern-App Englisch.
- Unsere 9 Geometrie-Einheiten (g-*) sind in der Entscheidung nicht genannt. Sie bleiben unverändert; Rückfrage am Montag.
- **Abgleich Raumlicht (52 Aufgaben Analysis/Stochastik):**
  - Alle Aufgabentypen gibt es bei uns schon. Wir übernehmen nichts; Raumlicht streicht, sobald Marcel es direkt bestätigt, und verlinkt auf unsere Einheiten.
  - K12 Rotationskörper: Aus unserer Sicht darf es bei Raumlicht als Teil von „Analysis & Zufall erleben“ bleiben, das Rechnen dazu ist a-rotation. Entscheidung bei Marcel.
- **Raumlicht (von Marcel direkt bestätigt):**
  - Die klassischen Analysis- und Stochastik-Aufgaben werden gestrichen, auch die 5 Rotationskörper-Rechenaufgaben.
  - Stattdessen kommt ein Rotationskörper-Labor zum Erleben (voraussichtlich `?ziel=rotation`). Umbau Di 24.11.
  - An den gestrichenen Stellen verlinkt Raumlicht „Mehr üben im Mathe-Trainer“.
  - Unsere Links zu Raumlicht: `?ziel=galton`, `binomial`, `zufall`, `baumeister`.
- **Rechenblitz (19.11.):** Gleichungssysteme mit 2 Unbekannten liegen auf rechenblitz-test (3.27.0). Sie verlinken auf uns mit `https://trainer.mathenachhilfe-online.com/?src=rechenblitz-theorie#/u/k8-lgs`. Unser Rück-Link ist `https://rechenblitz.mathenachhilfe-online.com/?thema=lgs&stufe=<1–6>&modus=training`; Einbau kommt mit den Querverweisen nach der Montagsrunde.

### AppZentrale (ab 19.11.)

- Neuer gemeinsamer Chat aller Lern-Apps, von Marcel eingerichtet; AppZentrale ist session_015vg1Tms4CCrpWLETiJCt12.
- Abstimmungen mit anderen Apps laufen jetzt über die AppZentrale.
- Tagesmeldung Mo–Fr ab Fr 20.11. um 9:43 Uhr: gestern fertig, heute, Fragen/Ideen, Blockaden. Zusammenfassung um 12 Uhr.
- Die Wochenrunde des Leitstands bleibt montags.
- Bestätigt am 19.11., dazu die Frage zu unseren Geometrie-Einheiten gestellt.
- **Entscheidung Marcel (19.11., über AppZentrale):** Die 9 Raumgeometrie-Einheiten bleiben beim Mathe-Trainer (Rechentraining). Raumlicht zeigt dasselbe räumlich; gegenseitige Querverweise nach der Montagsrunde.
- **Ökosystem-Ideen (Marcel 19.11.: erst sammeln, Montag planen, bis dahin nichts bauen):** Unser Beitrag (Aufwand, Wiederverwendbares, Ideen „Zurück, wo du warst“ / gemeinsame Klassen-Wahl per Link / Tagesmission, Bedenken Datenschutz/WebKit) ist an die AppZentrale geschickt.
- **Wissensgarten:** Paket-Links `#paket=<ID>` ab Fr 20.11. auf test; Paket-IDs bei der AppZentrale erfragt.

### Entscheidungen Marcel (19.11., nachmittags, über AppZentrale)

- **Umzug live:** live = ebd85f8 (2.5.0) auf trainer. und lernen.…/mathetrainer/; Rückweg ba65a2f, nicht 2.4.3.
- **Familien-Speicher auf unserem Server ohne Google.** Stände aller Apps und Kinder liegen verschlüsselt beim Server und gehören zur Familie; Wiederherstellung durch Marcel per Schlüsselverwahrung, dazu ein Notfall-Code. Gebaut wird nach der Wochenrunde.
- **Geschenk-Codes:** nur Einlösefrist (bis 31.12. des dritten Jahres); eingelöst wie ein Kauf.
- **Abi-Pass:** heißt „Abi-Pass (bis 31.07.)“.
- **30-Tage-Pass:** wird beworben mit „Kein Abo – endet automatisch“.
  - Texte für beide Punkte kommen mit dem Update am Di 24.11.
- **Spiel „Kurven-Flug“ wird umbenannt.** Vorschläge: „Sinus-Slalom“, außerdem „Vektor-Kompass“ statt „Vektor-Lotse“ und „Geraden-Drehbühne“ statt „Raum-Blick“, jeweils mit Hinweis auf KurvenFlug bzw. Raumlicht. Antwort bis Montag.
- **Neue Beschreibung** statt „nur Oberstufe Bayern/Hessen“: in einem späteren Di/Fr-Update.
- **Schloss-Texte (UWG Anh. Nr. 28):** Geprüft am 19.11.: Kein „Frag deine Eltern“ oder „Kauf dir“ in der App. Offen ist aber: Die Pro-Seite zeigt Preise sowie „Pro holen ↗“ und „KI dazubuchen ↗“ auch in Kl. 5–10, und es gibt noch kein Eltern-Tor.
  - Plan für Di 24.11.: Für Kl. 5–10 keine Preise und keine Kaufknöpfe; sachlicher Satz; Kauf nur hinter dem Eltern-Tor. Die Oberstufe bleibt sachlich mit Pass-Hinweis.
  - Gemeinsame Vorgabe für das Eltern-Tor bei der AppZentrale angefragt.
- **Entscheidung Marcel (19.11.), „Alle drei so“:** Kurven-Flug → **Sinus-Slalom**, Vektor-Lotse → **Vektor-Kompass**, Raum-Blick → **Geraden-Drehbühne**. Am Ende jeweils der Hinweis „Mehr davon in KurvenFlug“ bzw. „… in Raumlicht“ (nur freie Ziele). Umsetzung im Update Di 24.11.; Schritt-IDs (`flug`, `lotse`, `raum`) bleiben, damit der Fortschritt erhalten bleibt.
- **Eltern-Tor (bestätigt):**
  - Für Kl. 5–10 zeigt die Pro-Seite nur die Inhalte, mit dem Satz „Das gehört zu Mathe-Trainer Pro. Deine Eltern können im Elternbereich nachsehen.“
  - Hinter das Eltern-Tor kommen Preise, „Pro holen“, „KI dazubuchen“ und für Kl. 5–10 auch „Nachhilfe buchen“ in der Kopfzeile. Nach Marcels Regel für Rechenblitz gehen alle Website-Links außer Impressum und Datenschutz über das Tor.
  - Die gemeinsame Vorgabe für das Tor kommt nach der Beschreibung durch Wissensgarten. Umsetzung Di 24.11.
- **Abi-Bündel freigegeben:** 24,99 € (unser Abi-Pass + Raumlicht Pro + KI-Abi-Pass), Verkauf 1.2.–30.4.2027.
- **Eltern-Tor, gemeinsamer Standard** (ELTERN-TOR.md, AppZentrale 2aa413c):
  - Malaufgabe 13–19 × 6–9 in Worten mit Vorlese-Knopf, eigene Ziffern-Tastatur, nach einem Fehler sofort neue Aufgabe.
  - 10 Minuten offen (nur im Arbeitsspeicher).
  - Pflicht vor jedem Kauf-/Shop-Weg, jeder Preisliste in Kl. 5–10, allen Links nach außen außer Impressum/Datenschutz, Elternbereich, Einstellungen, Kopplung, Löschen, Teilen.
  - Oberstufe: Preise sichtbar, aber „Pro holen“ und „KI dazubuchen“ übers Tor, mit „Wer unter 18 ist, kauft nicht selbst.“
  - Ein gelöstes Tor zählt als `elternbereich`. Umsetzung Di 24.11.
- **PC-Vollbild (Marcel 19.11.: „alle prüfen“):** Live geprüft bei 1920/1366/1280.
  - Start/Lernen/Theorie stehen in einer Spalte von 952 px (bei 1920 viel Rand).
  - Aufgaben und Spiele sind nur 572 px breit und wirken verloren.
  - Verbesserung im Update Fr 20.11.: ab 1200 px breiter, Raster, Aufgaben zweispaltig. Handy und iPad bleiben unverändert.
