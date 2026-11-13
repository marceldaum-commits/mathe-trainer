# Lehrplan-Abgleich Bayern und Hessen

Stand: 13.11.2026 · Erstellt aus den amtlichen Texten (Quellen unten). Dieser Abgleich steuert den
Bundesland-Schalter der App (`NICHT` in `app/js/units.js`) und die Reihenfolge des täglichen Ausbaus.
**Kein Ersatz für eine Lehrkraft** – die Liste „Bitte gegenprüfen" unten ist ernst gemeint.

## Die fünf Befunde, die den Schalter steuern

1. **Bayern hat in Mathematik kein grundlegendes Niveau.** Kurs und Abitur laufen für alle auf erhöhtem
   Anforderungsniveau. Ein Schlüssel `BY` genügt.
2. **Hessen-Grundkurs: kein Hypothesentest** (Q3.3 ist nur im Leistungskurs verbindlich).
3. **Hessen-Grundkurs: keine Normalverteilung, keine Sigma-Regeln** (im Abiturerlass ausdrücklich ausgenommen).
4. **Hessen-Grundkurs: kein Ableiten der ln-Funktion, kein Vektorprodukt** (beides nur Leistungskurs).
5. **Bayern: Hypothesentest nur einseitig**; Hessen-Leistungskurs auch zweiseitig.

Umsetzung in der App: Für `HE-GK` sind die Einheit `s-test` und die Schritte `expln/ln`, `s-verteilung/sigma`,
`g-ebene/kreuz` als „nicht im Grundkurs" markiert, stehen hinten und fehlen in Abi-Modus, Boss, gemischten
Runden und freiem Üben. Alles bleibt spielbar. Tages-Runde und Duell bleiben für alle gleich (nicht gefiltert).

## Einheiten

| Einheit | Bayern | Hessen GK | Hessen LK | Anmerkung |
| --- | --- | --- | --- | --- |
| formen | ja (Jgst. 10/11) | ja (E.1, E.5) | ja | Hessen nennt zusätzlich die Verschiebung c in a·sin(b(x−c))+d – fehlt in der App |
| steigung | ja (M11 4.1) | ja (E.2) | ja | |
| zeichnen | ja (M11 4.1) | ja (E.2) | ja | „grafisches Ableiten" steht in Hessen wörtlich |
| regeln | ja (M11 4.1, M12 1.2) | ja (E.2, E.4) | ja | Bayern verlangt zusätzlich die Quotientenregel |
| extrema | ja (M11 4.2) | ja (E.3) | ja | |
| integral | ja (M13 1) | ja (Q1.1, Q1.2) | ja | „Ober-/Untersumme" in Bayern nicht wörtlich |
| kurve | ja (M11 1, 2, 4.2) | ja (E.1, E.3) | ja | gebrochen-rational: Hessen nur 1/xⁿ, Bayern mit Asymptoten |
| extremwert | ja (M13 4) | ja (E.3) | ja | |
| anwenden | ja | ja (E.2, E.3, Q4.1) | ja, dazu Ortskurven | „Steckbrief" heißt amtlich „Rekonstruktion" |
| expln | ja (M12 4.3) | **teilweise** – Wachstum ja, ln ableiten nein | ja (Q2.1) | |
| s-labor | ja (M12 2) | ja (Q3.2) | ja | |
| s-baum | ja | ja (Q3.1) | ja | |
| s-bedingt | ja (M11 3) | ja (Q3.1) | ja | der Name „Satz von Bayes" steht in keinem der Texte |
| s-verteilung | ja (M12 2, M13 2) | **teilweise** – kumuliert ja, Normalverteilung/Sigma nein | ja (Q3.2) | „Standardisieren" verlangt kein Land |
| s-test | ja, nur einseitig (M12 3) | **nein** | ja, ein- und zweiseitig (Q3.3) | |
| s-kombi | ja (M12 2) | ja (Q3.1) | ja | |
| g-vektor | ja (M12 5, M13 3) | ja (Q2.2) | ja | „Linearkombination" in Hessen nicht wörtlich |
| g-skalar | ja (M12 5) | ja (Q2.2) | ja | |
| g-gerade | ja (M13 3) | ja (Q2.3) | ja | |
| g-ebene | ja (M13 3, M12 5) | **teilweise** – Kreuzprodukt nein | ja (Q2.3) | im GK Normalenvektor über Gleichungssystem |
| g-mass | ja (M13 3) | ja (Q2.2, Q2.3) | ja | Bayern: Hesse'sche Normalform; Hessen: Lotfußpunkt |
| operatoren | unsicher (keine amtliche Liste gefunden) | ja (Liste Landesabitur 2027) | ja | |
| Grundlagen | Vorwissen | Vorwissen | Vorwissen | nicht gegen die Mittelstufen-Lehrpläne geprüft |

## Nachtrag 13.11.2026 (Version 0.11.0): fünf Einheiten aus der Fehl-Liste gebaut

| Einheit | Bayern | Hessen GK | Hessen LK | Anmerkung |
| --- | --- | --- | --- | --- |
| a-gebrochen (Polstellen, Asymptoten, Quotientenregel) | ja (M11 2, M12 4.1) | **nein** | **nein** (Hessen: nur 1/xⁿ) | Quotientenregel in Hessen nicht belegt – als „unsicher“ behandelt und mit ausgenommen |
| a-trig (Sinus/Kosinus ableiten und integrieren) | ja (M12 1.3, M13 1) | ja (E.5, Q1.1) | ja | |
| a-rotation (Rotationsvolumen, uneigentliche Integrale) | ja (M13 1) | **nein** | ja (Q1.2) | |
| s-zufall (Unabhängigkeit, Erwartungswert/Varianz, hypergeometrisch) | ja (M11 3, M12 2) | ja (Q3.1, Q3.2) | ja | |
| g-kugel (Kugel, Abstand Punkt–Gerade, Lage Ebene–Ebene) | ja (M13 3) | **nein** | Kugel **nein**, Rest ja (Q2.3) | Abstand Punkt–Gerade im LK nach Wortlaut „zwischen Punkten, Geraden und Ebenen“ |

Damit aus der Liste unten erledigt: gebrochen-rationale Funktionen, Quotientenregel, Ableitung und Integration
von Sinus und Kosinus, Rotationsvolumen, uneigentliche Integrale, stochastische Unabhängigkeit, Zufallsgröße und
Varianz, hypergeometrische Aufgaben, Kugeln, Abstand Punkt–Gerade, Lage Ebene–Ebene. **Weiter offen:** Wurzel- und
Umkehrfunktion, begrenztes/logistisches Wachstum, Integralfunktion, Newton-Verfahren, stetige Zufallsgrößen,
zweiseitiger Test und Gütefunktion, Histogramme, Fragen rückwärts nach n/p/k, Normalenform und Hesse-Form,
Schnittgerade zweier Ebenen, Abstand windschiefer Geraden, Spurpunkte, Parameterform der Ebene, Spiegelungen,
Bewegungen mit Geschwindigkeitsvektor, Ortskurven, Mengenschreibweise.

## Was noch fehlt (Vorrang im täglichen Ausbau)

**Bayern:** gebrochen-rationale Funktionen mit Polstellen und Asymptoten, Quotientenregel · Wurzel- und
Umkehrfunktion, rationale Exponenten · Untersuchung von ln- und e-Verknüpfungen mit Grenzwerten · Ableitung von
Sinus und Kosinus · Integralfunktion, uneigentliche Integrale, Rotationsvolumen · Newton-Verfahren, Stetigkeit
und Differenzierbarkeit anschaulich · stochastische Unabhängigkeit, Zufallsgröße und Varianz, stetige
Zufallsgrößen · Normalenform und Hesse'sche Normalform, Lage Ebene–Ebene mit Schnittgerade, Abstand
Punkt–Gerade, parallele und windschiefe Geraden, Kugeln · Vektorprodukt für Flächen und Volumen.

**Hessen Grundkurs:** e-Funktion mal ganzrationale Funktion, begrenztes Wachstum, Stammfunktion durch Ableiten
nachweisen · rekonstruierter und mittlerer Bestand, mittlere Änderungsrate, Grenze oder Parameter rückwärts
bestimmen · Ableiten und Integrieren von Sinus und Kosinus, Normale · 1/xⁿ, Wurzelfunktion, Umkehrfunktion,
allgemeine Transformation a·f(b(x−c))+d · lineare Gleichungssysteme, Spurpunkte, Bewegungen mit
Geschwindigkeitsvektor, Parameterform der Ebene, Spiegelung Punkt an Ebene, Schattenwurf · Körper im Raum ·
Mengenschreibweise, Unabhängigkeit, hypergeometrische Aufgaben · Zufallsgröße, Varianz, Histogramme, Fragen
rückwärts nach n, p, k.

**Hessen Leistungskurs zusätzlich:** Rotationskörper, uneigentliche Integrale, Integrieren von (ax+b)^r und
g′(x)·e^g(x) · logistisches Wachstum, e-Funktionen mit Parametern · Verknüpfen und Verketten · Normalenform,
Lage Ebene–Ebene, Abstände zwischen Punkten, Geraden und Ebenen, Spiegelungen, Geraden- und Ebenenscharen ·
zweiseitiger Test, Gütefunktion · Ortskurven.

In Hessen nicht schriftlich prüfungsrelevant: Konfidenzintervalle, Matrizen, Integrationsmethoden,
Differenzialgleichungen, komplexe Zahlen.

## Bitte gegenprüfen (Mathelehrkraft)

1. Bayern, Operatoren: keine amtliche Liste gefunden – das belegt nicht, dass es keine gibt.
2. Hessen-LK, Abstand windschiefer Geraden: Wortlaut nicht eindeutig.
3. Begriffe, die nicht wörtlich vorkommen (Satz von Bayes, Ober-/Untersumme, Verdopplungszeit,
   Linearkombination, Standardisieren): Einstufung nach Inhalt.
4. Geprüft ist das **Thema**, nicht die **Tiefe** jeder einzelnen Aufgabe (z. B. gebrochen-rationale Grenzwerte
   im Hessen-GK, Art der Scharen).
5. Hessen: geprüft sind Landesabitur 2027 und 2028. Schulen dürfen Themen zwischen Halbjahren verschieben.
6. In den Textauszügen der amtlichen PDFs sind Formeln teils verloren gegangen – im Zweifel ins Original sehen.

## Quellen (abgerufen am 13.11.2026)

- Bayern, LehrplanPLUS Gymnasium Mathematik: Jahrgangsstufen 10, 11, 12 (erhöhtes Niveau), 13 –
  `lehrplanplus.bayern.de/fachlehrplan/gymnasium/<stufe>/mathematik`
- ISB Bayern: „Informationen zum LehrplanPLUS der Profil- und Leistungsstufe – Mathematik" (Stand 22.09.2024);
  KMS „Abiturprüfung im Fach Mathematik am neunjährigen Gymnasium" vom 23.07.2024 – `isb.bayern.de`
- Hessen: Kerncurriculum gymnasiale Oberstufe Mathematik, Ausgabe 2024, Stand 01.08.2025 – `kultus.hessen.de`
- Hessen: Abiturerlass Landesabitur 2027 (Erlass vom 02.07.2025) und 2028 (Erlass vom 28.05.2026), Abschnitt 23
- Hessen: „Hinweise für die Fächer Mathematik, Chemie, Physik und Informatik" (Stand 01.08.2025);
  Operatorenliste Landesabitur 2027
