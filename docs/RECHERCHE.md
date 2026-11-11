# Recherche: spielerisch und anschaulich statt Rechenspiel

Stand: 11.11.2026 · Internet-Recherche zur Frage, wie man Oberstufen-Mathe als Spiel umsetzt,
das anschaulich ist und nicht nur Rechnen abfragt. Quellen am Ende.

## 1. Wichtigste Erkenntnis: Die Spielmechanik muss die Mathematik sein

- Forschung von Habgood und Ainsworth: Zwei Fassungen desselben Spiels. In der einen steckte
  die Mathematik im Spielzug selbst, in der anderen kam nach dem Spielen eine getrennte
  Mathe-Aufgabe. Die Kinder mit der ersten Fassung lernten mehr.
- Der schlechte Weg heißt in der Forschung „Schokolade über Brokkoli": ein Quiz, auf das man
  Punkte und Figuren klebt. Genau das wäre ein „reines Rechenspiel".
- Folge für uns: Punkte, Serien und Bestenliste sind nur Beiwerk. Jede Spielidee muss so gebaut
  sein, dass man sie nur gewinnt, wenn man das mathematische Prinzip verstanden hat.

## 2. Vorbilder

| Vorbild | Was man tut | Was wir daraus lernen |
| --- | --- | --- |
| Desmos „Marbleslides" | Parabeln so verändern, dass Murmeln durch Sterne rollen; ausprobieren, nachbessern | Parameter einer Funktion werden zum Spielzug; sofortige, sichtbare Rückmeldung |
| SineRider (Hack Club) | Zwei Figuren rodeln über einen Hang, den man per Funktionsgleichung formt | Funktion als Landschaft; quelloffen, in reinem JavaScript – zeigt, dass es im Browser geht |
| „Hands-On Calculus" (School Yourself) | Ableitung einer Funktion mit dem Finger skizzieren; umgekehrt Stammfunktion zeichnen | Analysis über Zeichnen statt Rechnen – ideal fürs Handy |
| Brilliant | Kleine Schritte, einfachster Fall zuerst, Fragen/Rückmeldung/Erklärung abwechselnd, keine Videos | Aufbau einer Lerneinheit |
| DragonBox Algebra | Algebra versteckt in einem Rätselspiel | Warnung, siehe Punkt 3 |
| Seeing Theory (Brown University) | Wahrscheinlichkeit durch Experimente und Animationen erleben | Vorlage für Stochastik (Phase 4) |

## 3. Was die Forschung zur Wirkung sagt (ehrlich)

- Mathe-Lernspiele wirken im Schnitt **positiv, aber nur klein bis mittel** (Übersichtsstudien
  nennen etwa 0,13 bis 0,30). Ein Spiel allein ist kein Wundermittel; die Gestaltung entscheidet.
- **DragonBox:** gemischte Ergebnisse. Eine Studie in Klasse 8 fand mehr Motivation, aber
  weniger Lernzuwachs als bei normalen Übungsaufgaben. Lehre: Spielen allein überträgt sich
  nicht von selbst auf Schulaufgaben. Es braucht eine **Brücke zur Schreibweise der Prüfung**.
- **Erst probieren, dann erklären** („Productive Failure", Sinha und Kapur, Auswertung von
  53 Studien): Wer vor der Erklärung selbst an einem Problem knobelt, versteht das Konzept
  danach besser. Bedingung: etwas Vorwissen muss da sein. Die sehr hohen Zahlen stammen von
  den Autoren selbst – als Richtung brauchbar, nicht als Versprechen.
- **Tages-Serien:** fördern die Gewohnheit, können aber Druck machen; nach einem Abriss hören
  manche ganz auf. Besser mit „Luft" (z. B. Wochenende zählt nicht, Serie einfrieren). Das
  passt zum Ton der Website („ohne Druck").

## 4. Daraus abgeleitet: Bauplan einer Lerneinheit

1. **Spielen/Entdecken:** eine anschauliche Aufgabe ohne Formel (z. B. Murmelbahn).
2. **Benennen:** kurze Erklärung, was man gerade getan hat – jetzt kommt die Regel.
3. **Brücke:** dieselbe Idee in Prüfungs-Schreibweise, zuerst mit Lücken, dann allein.
4. **Festigen:** gemischte kurze Runden, Wiederholung in Abständen.

Das deckt sich mit dem pädagogischen Konzept der Website (Lernstand klären → Lücke schließen →
festigen → sicher weiterlernen).

## 5. Spielideen für Analysis (Phase 1)

| Spiel | Idee | Thema |
| --- | --- | --- |
| Murmelbahn | Funktion per Schieberegler formen, bis die Murmel alle Sterne trifft | Funktionen, Parameter, Scharen |
| Ableitung zeichnen | Zum gezeigten Graphen die Ableitung mit dem Finger skizzieren; Auswertung zeigt, wo es passt | Ableitung verstehen |
| Tangenten-Surfer | Tangente an der Kurve entlangziehen; Stellen mit Steigung 0 „einsammeln" | Extrema, Monotonie |
| Graphen-Paare | f, f′ und f″ einander zuordnen | Zusammenhang der Ableitungen |
| Fläche füllen | Fläche unter der Kurve mit Streifen füllen, erst schätzen, dann verfeinern | Integral als Fläche |
| Steckbrief | Punkte und Steigungen vorgegeben; Funktion bauen, die alles erfüllt | Steckbriefaufgaben |
| Extremwert-Werkstatt | Schachtel/Zaun mit dem Finger verändern, Volumen-Graph entsteht live | Extremwertaufgaben |
| Rechenweg-Puzzle | Schritte einer Lösung in die richtige Reihenfolge bringen, Fehler finden | Brücke zur Prüfung |

## 6. Technik

- **JSXGraph** (Universität Bayreuth): Bibliothek für interaktive Graphen und Geometrie im
  Browser, Mehrfinger-Bedienung, unter 100 KB, keine Abhängigkeiten, freie Lizenz (LGPL/MIT).
  → Kandidat Nummer 1 für alles mit Ziehen und Schiebereglern.
- **GeoGebra einbetten: nein.** Kommerzielle Nutzung braucht eine Sonderlizenz; ein Spiel, das
  für eine Firma wirbt, ist kommerziell.
- **Desmos-API: eher nein.** Braucht einen eigenen Schlüssel; Bedingungen und Kosten für
  kommerzielle Nutzung waren nicht zu finden.
- **Mafs:** moderne Alternative, setzt aber React voraus; Details konnte ich nicht prüfen
  (Seite aus dieser Sitzung nicht erreichbar).
- Für die Spielszenen (Murmel, Rodeln) reicht eine eigene kleine Zeichenfläche (Canvas/SVG);
  SineRider zeigt, dass das ohne Spiele-Baukasten geht.
- Formel-Anzeige und 3D für Geometrie: beim Start auswählen (nicht Teil dieser Recherche).

## 7. Markt in Deutschland

Die Suche lieferte keinen belastbaren Vergleich. Gefunden: ANTON (bis Abitur, Übungsaufgaben),
Mathe Kit (bayerischer Lehrplan), MassMatics (Uni/Abi). Ein Oberstufen-Angebot, das wirklich
als Spiel mit Anfassen gebaut ist, tauchte nicht auf – das ist ein Hinweis auf eine Lücke,
aber **nicht gesichert**. Vor dem Start gezielt nachprüfen (simpleclub, StudySmarter, Mathegym,
bettermarks).

## Quellen

- Habgood & Ainsworth, intrinsische Integration: https://eprints.nottingham.ac.uk/10385
- Desmos Marbleslides (Ankündigung): https://blog.desmos.com/articles/new-activity-marbleslides/
- Marbleslides: Parabolas: https://classroom.amplify.com/activity/566b31784e38e1e21a10aade
- SineRider (Quellcode): https://github.com/hackclub/sinerider
- Hands-On Calculus: https://blog.schoolyourself.org/2013/01/a-sneak-peek-at-hands-on-calculus-part-2.html
- Brilliant, Lehransatz: https://brilliant.org/resources/choosing-brilliant/how-brilliant-teaches-math/
- DragonBox, Algebra Challenge: https://dragonbox.com/about/algebra-challenge
- DragonBox / From Here to There, Studienüberblick: https://sites.google.com/view/from-here-to-there/research-findings_1/summary-of-findings
- Seeing Theory: https://seeing-theory.brown.edu/
- Übersichtsstudie Mathe-Lernspiele (2019): https://zendy.io/title/10.1111/jcal.12347
- Übersichtsstudie (Dissertation 2023): https://repository.usfca.edu/diss/679
- Übersichtsstudie höheres Denken: https://ojs.ehu.eus/index.php/psicodidactica/article/view/28240
- Productive Failure (Bericht zur Studie): https://phys.org/news/2021-09-productively-wiser.html
- Duolingo zu Serien: https://blog.duolingo.com/how-duolingo-streak-builds-habit
- JSXGraph: https://jsxgraph.uni-bayreuth.de/wp/index.html
- GeoGebra-Lizenz: https://geogebra.org/license
- Desmos-API: https://www.desmos.com/api/v1.2/docs
- Mathe-Apps in Deutschland: https://www.news4teachers.de/2026/01/nach-dem-iqb-schock-wie-mathe-apps-schueler-motivieren-und-lehrkraefte-bei-wachsenden-defiziten-entlasten-sollen/
- Apps zum Abi-Lernen: https://www.superprof.de/blog/apps-zum-abi-lernen/
