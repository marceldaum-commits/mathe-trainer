// Lernpfad der Mittelstufe (Klasse 5 bis 10). Gleicher Bauplan wie in der Oberstufe: benennen → üben → festigen → Boss.
// Jede Einheit trägt ihren Jahrgang (jg). Zuordnung nach dem Gymnasium in Bayern und Hessen – siehe docs/KLASSE5-10.md.
import { tex } from './ui.js';
import { quiz, info } from './quiz.js';
import { strahl, frost } from './games/strahl.js';
import { streifen } from './games/streifen.js';
import { kaestchen } from './games/kaestchen.js';
import { felder } from './games/felder.js';
import { stellen } from './games/stellen.js';
import { wuerfel } from './games/wuerfel.js';
import { ausgleich } from './games/ausgleich.js';
import { mixOf, genScheitel } from './gen.js';
import { genBruch, genKlammer, genLinGl, genQuadGl, genPotenz, genSteigung, genHaeufigkeit, genProzent, genKennwerte, genLaplace, genGegen, genPythagoras, genTrig, genFlaeche } from './gen3.js';
import { genRunden, genRechenregel, genTeiler, genEinheit, genRechteck, genKuerzen, genBruchVergleich, genDezimal, genBruchDezimal, genNegativ, genTerm, genDreisatz, genLinFunktion, genWurzel, genZinseszins, genQuader, genKoerper } from './gen6.js';

const T = (s) => `<div class="big">${tex(s, true)}</div>`;
const mix = (...g) => quiz(Array(6).fill(mixOf([g])));

/** Gebiete der Mittelstufe (für alle Klassen gleich; gezeigt werden nur die, zu denen die Klasse Einheiten hat). */
export const MITTEL_AREAS = [
  { id: 'mzahl', mittel: true, title: 'Zahlen und Rechnen', info: 'Runden, Brüche, Dezimalzahlen, Wurzeln', soon: [] },
  { id: 'malgebra', mittel: true, title: 'Terme und Funktionen', info: 'Terme, Gleichungen, Prozent, Funktionen', soon: [] },
  { id: 'mgeo', mittel: true, title: 'Geometrie', info: 'Größen, Flächen, Körper, Dreiecke', soon: [] },
  { id: 'mdaten', mittel: true, title: 'Daten und Zufall', info: 'Diagramme, Mittelwert, Wahrscheinlichkeit', soon: [] },
];
/** Was je Klasse als Nächstes kommt (für die Karte „Kommt bald“). */
export const MITTEL_BALD = {
  5: ['Schriftlich rechnen', 'Winkel messen', 'Diagramme lesen', 'Koordinatensystem'],
  6: ['Brüche malnehmen und teilen', 'Winkel im Dreieck', 'Kreis', 'Zufallsversuche'],
  7: ['Gleichungen mit Klammern', 'Zinsen', 'Dreiecke konstruieren', 'Achsen- und Punktspiegelung'],
  8: ['Gleichungssysteme', 'Binomische Formeln', 'Kreis: Umfang und Fläche', 'Baumdiagramme'],
  9: ['Ähnlichkeit und Strahlensätze', 'Quadratische Funktionen im Sachzusammenhang', 'Mehrstufige Zufallsversuche'],
  10: ['Logarithmus', 'Sinus- und Kosinussatz', 'Kugel und Kegel im Sachzusammenhang', 'Bedingte Wahrscheinlichkeit'],
};

export const MITTEL = [
  /* ───────────── Klasse 5 ───────────── */
  { id: 'k5-zahlen', jg: '5', area: 'mzahl', title: 'Natürliche Zahlen', sub: 'Stellenwerte, Runden, Rechenregeln',
    meta: { boss: ['Runden-Riese', '≈', [genRunden, genRechenregel]], why: 'Gerundet wird überall, wo es auf den genauen Wert nicht ankommt: Einwohnerzahlen, Entfernungen, Preise im Kopf. Und ohne feste Rechenregeln käme bei derselben Aufgabe jeder auf ein anderes Ergebnis.',
      formeln: [['Runden', '0,1,2,3,4:\\ \\text{abrunden}\\qquad 5,6,7,8,9:\\ \\text{aufrunden}'], ['Rechenregeln', '\\text{Klammer}\\ \\to\\ \\text{Potenz}\\ \\to\\ \\text{Punkt}\\ \\to\\ \\text{Strich}']] },
    steps: [
      { id: 'strahl', kind: 'Entdecken', title: 'Zahlenstrahl', run: strahl },
      { id: 'stellen', kind: 'Benennen', title: 'Stellenwerte und Runden', run: info([
        { title: 'Jede Ziffer hat ihren Platz', html: `<p>In der Zahl 4 728 steht die 7 an der <b>Hunderterstelle</b>: Sie ist 700 wert. Von rechts nach links heißen die Stellen Einer, Zehner, Hunderter, Tausender, Zehntausender …</p><p class="muted">Große Zahlen schreibt man in Dreiergruppen: 25 306.</p>` },
        { title: 'Runden', html: `<p>Schau auf die Ziffer <b>rechts</b> von der Stelle, auf die gerundet wird.</p>${T('0,1,2,3,4:\\ \\text{abrunden}\\qquad 5,6,7,8,9:\\ \\text{aufrunden}')}<p>4 728 auf Hunderter: Rechts von der 7 steht eine 2 – abrunden auf 4 700.</p>` },
      ]) },
      { id: 'runden', kind: 'Brücke', title: 'Runden', run: quiz([genRunden, genRunden, genRunden, genRunden]) },
      { id: 'regeln', kind: 'Benennen', title: 'Was zuerst gerechnet wird', run: info([
        { title: 'Punkt vor Strich', html: `${T('3+4\\cdot 5=3+20=23')}<p>Malnehmen und Teilen (Punktrechnung) kommen vor Plus und Minus (Strichrechnung).</p>` },
        { title: 'Klammern zuerst', html: `${T('(3+4)\\cdot 5=7\\cdot 5=35')}<p>Was in der Klammer steht, wird als Erstes ausgerechnet. Potenzen wie ${tex('4^2')} kommen noch vor der Punktrechnung.</p>` },
      ]) },
      { id: 'rechnen', kind: 'Brücke', title: 'Rechenregeln', run: quiz([genRechenregel, genRechenregel, genRechenregel, genRechenregel]) },
      { id: 'mix', kind: 'Festigen', title: 'Zahlen gemischt', run: mix(genRunden, genRechenregel) },
    ] },
  { id: 'k5-teiler', jg: '5', area: 'mzahl', title: 'Teiler und Vielfache', sub: 'Primzahlen, Teilbarkeit, ggT und kgV',
    meta: { boss: ['Prim-Pirat', 'ggT', [genTeiler]], why: 'Mit dem größten gemeinsamen Teiler kürzt man Brüche, mit dem kleinsten gemeinsamen Vielfachen findet man gemeinsame Nenner. Primzahlen sichern heute jede Bezahlung im Internet.',
      formeln: [['Primzahl', '\\text{genau zwei Teiler: }1\\text{ und sich selbst}'], ['Teilbar durch 3 und 9', '\\text{Quersumme durch 3 bzw. 9 teilbar}']] },
    steps: [
      { id: 'felder', kind: 'Entdecken', title: 'Plättchen-Felder', run: felder },
      { id: 'begriffe', kind: 'Benennen', title: 'Teiler, Vielfache, Primzahlen', run: info([
        { title: 'Teiler und Vielfache', html: `<p>3 ist ein <b>Teiler</b> von 12, weil 12 : 3 ohne Rest aufgeht. Umgekehrt ist 12 ein <b>Vielfaches</b> von 3.</p><p>Teiler von 12: 1, 2, 3, 4, 6, 12. Vielfache von 3: 3, 6, 9, 12, 15 …</p>` },
        { title: 'Primzahlen', html: `<p>Eine <b>Primzahl</b> hat genau zwei Teiler: 1 und sich selbst. Die ersten sind 2, 3, 5, 7, 11, 13.</p><p class="muted">Die 1 ist keine Primzahl – sie hat nur einen Teiler.</p>` },
        { title: 'Teilbarkeit auf einen Blick', html: `<p><b>Durch 2:</b> letzte Ziffer gerade. <b>Durch 5:</b> letzte Ziffer 0 oder 5. <b>Durch 3 oder 9:</b> Quersumme durch 3 bzw. 9 teilbar.</p><p>Beispiel 3 015: Quersumme 3 + 0 + 1 + 5 = 9, also durch 9 teilbar.</p>` },
        { title: 'ggT und kgV', html: `<p>Der <b>größte gemeinsame Teiler</b> von 12 und 18 ist 6. Das <b>kleinste gemeinsame Vielfache</b> ist 36.</p><p class="muted">Den ggT braucht man zum Kürzen, das kgV für gemeinsame Nenner.</p>` },
      ]) },
      { id: 'ueben', kind: 'Brücke', title: 'Teiler und Primzahlen', run: quiz([genTeiler, genTeiler, genTeiler, genTeiler]) },
      { id: 'mix', kind: 'Festigen', title: 'Teiler gemischt', run: quiz(Array(6).fill(genTeiler)) },
    ] },
  { id: 'k5-ganz', jg: '5', area: 'mzahl', title: 'Negative Zahlen', sub: 'Unter null rechnen',
    meta: { boss: ['Frost-Fuchs', '−', [genNegativ]], why: 'Temperaturen unter null, Schulden auf dem Konto, Tiefgaragen und Meerestiefen: Überall dort braucht man Zahlen, die kleiner als null sind.',
      formeln: [['Vorzeichen beim Malnehmen', '(+)\\cdot(-)=(-)\\qquad(-)\\cdot(-)=(+)'], ['Minus vor der Klammer', 'a-(-b)=a+b']] },
    steps: [
      { id: 'frost', kind: 'Entdecken', title: 'Thermometer', run: frost },
      { id: 'gerade', kind: 'Benennen', title: 'Zahlen unter null', run: info([
        { title: 'Die Zahlengerade', html: `<p>Links von der Null geht es weiter: −1, −2, −3 … Je weiter links, desto kleiner. Deshalb ist −5 kleiner als −2.</p><p class="muted">Denk an ein Thermometer: −5 °C ist kälter als −2 °C.</p>` },
        { title: 'Addieren und Abziehen', html: `${T('3-8=-5\\qquad -3-4=-7')}<p>Plus heißt nach rechts gehen, Minus nach links. Eine negative Zahl abziehen heißt nach rechts gehen: ${tex('5-(-2)=7')}.</p>` },
        { title: 'Malnehmen und Teilen', html: `${T('(-3)\\cdot 4=-12\\qquad(-3)\\cdot(-4)=12')}<p>Verschiedene Vorzeichen ergeben Minus, gleiche Vorzeichen ergeben Plus.</p>` },
      ]) },
      { id: 'ueben', kind: 'Brücke', title: 'Mit negativen Zahlen rechnen', run: quiz([genNegativ, genNegativ, genNegativ, genNegativ]) },
      { id: 'mix', kind: 'Festigen', title: 'Negative Zahlen gemischt', run: quiz(Array(6).fill(genNegativ)) },
    ] },
  { id: 'k5-groessen', jg: '5', area: 'mgeo', title: 'Größen und Flächen', sub: 'Einheiten umrechnen, Umfang, Flächeninhalt',
    meta: { boss: ['Flächen-Fuchs', 'cm²', [genEinheit, genRechteck]], why: 'Wie viel Farbe braucht eine Wand, wie viel Zaun ein Garten? Für das eine brauchst du die Fläche, für das andere den Umfang – und beide Male die richtige Einheit.',
      formeln: [['Rechteck', 'A=a\\cdot b\\qquad U=2\\cdot(a+b)'], ['Längen', '1\\,\\text{km}=1000\\,\\text{m}\\qquad 1\\,\\text{m}=100\\,\\text{cm}']] },
    steps: [
      { id: 'einheiten', kind: 'Benennen', title: 'Einheiten umrechnen', run: info([
        { title: 'Länge, Masse, Zeit', html: `${T('1\\,\\text{km}=1000\\,\\text{m}\\qquad 1\\,\\text{m}=100\\,\\text{cm}\\qquad 1\\,\\text{cm}=10\\,\\text{mm}')}<p>${tex('1\\,\\text{kg}=1000\\,\\text{g}')}, ${tex('1\\,\\text{t}=1000\\,\\text{kg}')}. Bei der Zeit ist die Umrechnungszahl 60.</p>` },
        { title: 'Größer oder kleiner?', html: `<p>In die <b>kleinere</b> Einheit: malnehmen (man braucht mehr davon). In die <b>größere</b> Einheit: teilen.</p><p>3,5 m sind 350 cm. 4 500 g sind 4,5 kg.</p>` },
      ]) },
      { id: 'umrechnen', kind: 'Brücke', title: 'Größen umrechnen', run: quiz([genEinheit, genEinheit, genEinheit, genEinheit]) },
      { id: 'legen', kind: 'Entdecken', title: 'Kästchen-Baumeister', run: kaestchen },
      { id: 'flaeche', kind: 'Benennen', title: 'Umfang und Flächeninhalt', run: info([
        { title: 'Umfang', html: `${T('U=2\\cdot(a+b)')}<p>Der Umfang ist der Weg einmal außen herum. Er wird in cm oder m gemessen.</p>` },
        { title: 'Flächeninhalt', html: `${T('A=a\\cdot b')}<p>Der Flächeninhalt sagt, wie viele Einheitsquadrate hineinpassen. Er wird in cm² oder m² gemessen.</p><p class="muted">Zusammengesetzte Figuren zerlegt man in Rechtecke – oder zieht ein fehlendes Stück ab.</p>` },
      ]) },
      { id: 'rechteck', kind: 'Brücke', title: 'Rechtecke berechnen', run: quiz([genRechteck, genRechteck, genRechteck, genRechteck]) },
      { id: 'mix', kind: 'Festigen', title: 'Größen gemischt', run: mix(genEinheit, genRechteck) },
    ] },

  /* ───────────── Klasse 6 ───────────── */
  { id: 'k6-bruch', jg: '6', area: 'mzahl', title: 'Brüche', sub: 'Kürzen, erweitern, vergleichen, rechnen',
    meta: { boss: ['Bruch-Bändiger', '¾', [genKuerzen, genBruchVergleich, genBruch]], why: 'Eine halbe Pizza, ein Viertelliter Milch, drei Achtel einer Strecke: Brüche beschreiben Anteile. Ohne sie gäbe es weder Rezepte noch Prozentrechnung.',
      formeln: [['Kürzen und Erweitern', '\\dfrac ab=\\dfrac{a\\cdot k}{b\\cdot k}'], ['Brüche addieren', '\\dfrac ab+\\dfrac cd=\\dfrac{a\\,d+c\\,b}{b\\,d}'], ['Brüche malnehmen', '\\dfrac ab\\cdot\\dfrac cd=\\dfrac{a\\,c}{b\\,d}']] },
    steps: [
      { id: 'streifen', kind: 'Entdecken', title: 'Bruch-Streifen', run: streifen },
      { id: 'anteil', kind: 'Benennen', title: 'Was ein Bruch bedeutet', run: info([
        { title: 'Zähler und Nenner', html: `${T('\\dfrac34')}<p>Der <b>Nenner</b> (unten) sagt, in wie viele gleiche Teile das Ganze geteilt ist. Der <b>Zähler</b> (oben) zählt, wie viele davon gemeint sind.</p>` },
        { title: 'Kürzen und Erweitern', html: `${T('\\dfrac{6}{8}=\\dfrac{3}{4}\\qquad\\dfrac{3}{4}=\\dfrac{9}{12}')}<p>Zähler und Nenner werden durch dieselbe Zahl geteilt (kürzen) oder mit derselben Zahl malgenommen (erweitern). Der Wert bleibt gleich.</p>` },
      ]) },
      { id: 'kuerzen', kind: 'Brücke', title: 'Kürzen und Erweitern', run: quiz([genKuerzen, genKuerzen, genKuerzen, genKuerzen]) },
      { id: 'vergleich', kind: 'Brücke', title: 'Brüche vergleichen', run: quiz([genBruchVergleich, genBruchVergleich, genBruchVergleich]) },
      { id: 'rechenregeln', kind: 'Benennen', title: 'Mit Brüchen rechnen', run: info([
        { title: 'Addieren und Abziehen', html: `${T('\\dfrac12+\\dfrac13=\\dfrac36+\\dfrac26=\\dfrac56')}<p>Erst auf denselben Nenner bringen, dann nur die Zähler verrechnen.</p>` },
        { title: 'Malnehmen und Teilen', html: `${T('\\dfrac23\\cdot\\dfrac45=\\dfrac{8}{15}\\qquad\\dfrac23:\\dfrac45=\\dfrac23\\cdot\\dfrac54')}<p>Malnehmen: Zähler mal Zähler, Nenner mal Nenner. Teilen: mit dem Kehrwert malnehmen.</p>` },
      ]) },
      { id: 'rechnen', kind: 'Brücke', title: 'Brüche rechnen', run: quiz([genBruch, genBruch, genBruch, genBruch]) },
      { id: 'mix', kind: 'Festigen', title: 'Brüche gemischt', run: mix(genKuerzen, genBruchVergleich, genBruch) },
    ] },
  { id: 'k6-dezimal', jg: '6', area: 'mzahl', title: 'Dezimalzahlen', sub: 'Rechnen mit Komma, Bruch und Prozent',
    meta: { boss: ['Komma-Kobold', '0,1', [genDezimal, genBruchDezimal]], why: 'Preise, Zeiten im Sport, Messwerte: Fast alles, was genau gemessen wird, steht als Kommazahl da. Wer Bruch, Kommazahl und Prozent ineinander umrechnen kann, versteht dieselbe Angabe in jeder Form.',
      formeln: [['Bruch und Dezimalzahl', '\\dfrac14=0{,}25=25\\,\\%'], ['Mal 10, 100, 1000', '\\text{Komma nach rechts}\\qquad :10:\\ \\text{Komma nach links}']] },
    steps: [
      { id: 'schieber', kind: 'Entdecken', title: 'Stellenwert-Schieber', run: stellen },
      { id: 'komma', kind: 'Benennen', title: 'Zahlen mit Komma', run: info([
        { title: 'Zehntel, Hundertstel, Tausendstel', html: `<p>Rechts vom Komma geht es weiter: In 3,47 steht die 4 für vier Zehntel und die 7 für sieben Hundertstel.</p>${T('3{,}47=3+\\dfrac{4}{10}+\\dfrac{7}{100}')}` },
        { title: 'Addieren und Abziehen', html: `<p>Komma unter Komma schreiben. Fehlt eine Stelle, hilft eine Null: 3,5 = 3,50.</p>${T('3{,}5+0{,}25=3{,}75')}` },
        { title: 'Malnehmen und Teilen', html: `${T('0{,}3\\cdot 0{,}4=0{,}12')}<p>Erst ohne Komma rechnen (3 · 4 = 12). Das Ergebnis bekommt so viele Nachkommastellen wie beide Faktoren zusammen. Beim Teilen verschiebt man in beiden Zahlen das Komma, bis der Teiler ganz ist.</p>` },
      ]) },
      { id: 'rechnen', kind: 'Brücke', title: 'Mit Komma rechnen', run: quiz([genDezimal, genDezimal, genDezimal, genDezimal]) },
      { id: 'formen', kind: 'Benennen', title: 'Drei Schreibweisen', run: info([
        { title: 'Bruch, Dezimalzahl, Prozent', html: `${T('\\dfrac34=0{,}75=75\\,\\%')}<p>Der Bruchstrich bedeutet „geteilt“: 3 : 4 = 0,75. Prozent heißt „Hundertstel“: 0,75 sind 75 Hundertstel.</p>` },
      ]) },
      { id: 'umwandeln', kind: 'Brücke', title: 'Umwandeln', run: quiz([genBruchDezimal, genBruchDezimal, genBruchDezimal, genBruchDezimal]) },
      { id: 'mix', kind: 'Festigen', title: 'Dezimalzahlen gemischt', run: mix(genDezimal, genBruchDezimal) },
    ] },
  { id: 'k6-quader', jg: '6', area: 'mgeo', title: 'Quader und Würfel', sub: 'Rauminhalt und Oberfläche',
    meta: { boss: ['Kisten-Krake', 'cm³', [genQuader]], why: 'Wie viel passt in den Umzugskarton, wie viel Wasser ins Aquarium, wie viel Geschenkpapier braucht das Paket? Das eine ist der Rauminhalt, das andere die Oberfläche.',
      formeln: [['Quader', 'V=a\\cdot b\\cdot c'], ['Oberfläche des Quaders', 'O=2\\cdot(a\\,b+a\\,c+b\\,c)'], ['Würfel', 'V=a^3\\qquad O=6\\,a^2']] },
    steps: [
      { id: 'bauen', kind: 'Entdecken', title: 'Würfel-Baumeister', run: wuerfel },
      { id: 'raum', kind: 'Benennen', title: 'Rauminhalt und Oberfläche', run: info([
        { title: 'Rauminhalt', html: `${T('V=a\\cdot b\\cdot c')}<p>Länge mal Breite mal Höhe. Gemessen wird in cm³ oder m³ – oder in Litern: 1 Liter ist 1 dm³.</p>` },
        { title: 'Oberfläche', html: `${T('O=2\\cdot(a\\,b+a\\,c+b\\,c)')}<p>Ein Quader hat sechs Flächen, je zwei sind gleich groß. Die Oberfläche ist die Summe aller sechs.</p>` },
        { title: 'Würfel', html: `${T('V=a^3\\qquad O=6\\,a^2')}<p>Beim Würfel sind alle Kanten gleich lang und alle sechs Flächen gleiche Quadrate.</p>` },
      ]) },
      { id: 'ueben', kind: 'Brücke', title: 'Quader berechnen', run: quiz([genQuader, genQuader, genQuader, genQuader]) },
      { id: 'mix', kind: 'Festigen', title: 'Quader gemischt', run: quiz(Array(6).fill(genQuader)) },
    ] },
  { id: 'k6-daten', jg: '6', area: 'mdaten', title: 'Daten auswerten', sub: 'Häufigkeit, Mittelwert, Median',
    meta: { boss: ['Daten-Dachs', 'Ø', [genHaeufigkeit, genKennwerte]], why: 'Notendurchschnitt, Umfragen, Sporttabellen: Mit wenigen Kennwerten lässt sich eine ganze Liste von Zahlen zusammenfassen und vergleichen.',
      formeln: [['Relative Häufigkeit', 'h=\\dfrac{\\text{Anzahl der Treffer}}{\\text{Anzahl der Versuche}}'], ['Mittelwert', '\\bar x=\\dfrac{\\text{Summe aller Werte}}{\\text{Anzahl der Werte}}']] },
    steps: [
      { id: 'tuerme', kind: 'Entdecken', title: 'Türme ausgleichen', run: ausgleich },
      { id: 'kennwerte', kind: 'Benennen', title: 'Listen zusammenfassen', run: info([
        { title: 'Absolute und relative Häufigkeit', html: `<p>Die <b>absolute</b> Häufigkeit zählt, wie oft etwas vorkommt. Die <b>relative</b> Häufigkeit ist der Anteil: 6 von 24 Kindern sind ${tex('\\tfrac{6}{24}=0{,}25=25\\,\\%')}.</p>` },
        { title: 'Mittelwert und Median', html: `<p><b>Mittelwert:</b> alle Werte addieren und durch ihre Anzahl teilen. <b>Median:</b> der mittlere Wert der sortierten Liste.</p><p class="muted">Ein einzelner Ausreißer verändert den Mittelwert stark, den Median kaum.</p>` },
      ]) },
      { id: 'haeufig', kind: 'Brücke', title: 'Häufigkeiten', run: quiz([genHaeufigkeit, genHaeufigkeit, genHaeufigkeit]) },
      { id: 'mittel', kind: 'Brücke', title: 'Mittelwert und Median', run: quiz([genKennwerte, genKennwerte, genKennwerte]) },
      { id: 'mix', kind: 'Festigen', title: 'Daten gemischt', run: mix(genHaeufigkeit, genKennwerte) },
    ] },

  /* ───────────── Klasse 7 ───────────── */
  { id: 'k7-terme', jg: '7', area: 'malgebra', title: 'Terme und Gleichungen', sub: 'Zusammenfassen, Klammern, lineare Gleichungen',
    meta: { boss: ['Term-Troll', 'x', [genTerm, genKlammer, genLinGl]], why: 'Mit Variablen lässt sich ein Rechenweg aufschreiben, bevor man die Zahlen kennt – so funktionieren Formeln, Tabellenkalkulation und jedes Computerprogramm. Gleichungen beantworten die Frage: Für welche Zahl stimmt das?',
      formeln: [['Zusammenfassen', '3x+5x=8x'], ['Ausmultiplizieren', 'a\\cdot(b+c)=a\\,b+a\\,c'], ['Gleichung lösen', '3x+4=19\\ \\Rightarrow\\ 3x=15\\ \\Rightarrow\\ x=5']] },
    steps: [
      { id: 'terme', kind: 'Benennen', title: 'Rechnen mit Variablen', run: info([
        { title: 'Was ein Term ist', html: `<p>Ein Term ist ein Rechenausdruck mit Platzhaltern. In ${tex('4x+7')} steht ${tex('4x')} für „4 mal ${tex('x')}“ – der Malpunkt wird weggelassen.</p><p>Für ${tex('x=2')}: ${tex('4\\cdot 2+7=15')}.</p>` },
        { title: 'Zusammenfassen', html: `${T('3x+5x-2x=6x\\qquad 2x+3y+4x=6x+3y')}<p>Nur gleichartige Glieder gehören zusammen: ${tex('x')} zu ${tex('x')}, ${tex('y')} zu ${tex('y')}. Äpfel und Birnen bleiben getrennt.</p>` },
        { title: 'Klammern auflösen', html: `${T('3\\cdot(x+2)=3x+6\\qquad -(x-4)=-x+4')}<p>Jedes Glied in der Klammer wird mit dem Faktor davor malgenommen. Ein Minus vor der Klammer dreht alle Vorzeichen um.</p>` },
      ]) },
      { id: 'term', kind: 'Brücke', title: 'Terme', run: quiz([genTerm, genTerm, genTerm, genTerm]) },
      { id: 'klammer', kind: 'Brücke', title: 'Klammern', run: quiz([genKlammer, genKlammer, genKlammer]) },
      { id: 'gleichung', kind: 'Benennen', title: 'Gleichungen lösen', run: info([
        { title: 'Die Waage', html: `<p>Eine Gleichung ist wie eine Waage im Gleichgewicht: Was du auf der einen Seite tust, musst du auch auf der anderen tun.</p>${T('3x+4=19\\ \\Rightarrow\\ 3x=15\\ \\Rightarrow\\ x=5')}<p>Erst die Zahl ohne ${tex('x')} wegschaffen, dann durch die Zahl vor ${tex('x')} teilen. Probe: ${tex('3\\cdot 5+4=19')}.</p>` },
      ]) },
      { id: 'loesen', kind: 'Brücke', title: 'Gleichungen', run: quiz([genLinGl, genLinGl, genLinGl, genLinGl]) },
      { id: 'mix', kind: 'Festigen', title: 'Terme gemischt', run: mix(genTerm, genKlammer, genLinGl) },
    ] },
  { id: 'k7-prozent', jg: '7', area: 'malgebra', title: 'Prozent und Dreisatz', sub: 'Anteile, Rabatt, Zuordnungen',
    meta: { boss: ['Rabatt-Rabe', '%', [genProzent, genDreisatz]], why: 'Rabatte, Zinsen, Wahlergebnisse, Akkustand: Prozente begegnen dir jeden Tag. Mit dem Dreisatz rechnest du Rezepte um, vergleichst Preise und planst, wie lange etwas dauert.',
      formeln: [['Prozentwert', 'W=G\\cdot\\dfrac{p}{100}'], ['Dreisatz', '\\text{erst auf 1, dann auf die gesuchte Anzahl}']] },
    steps: [
      { id: 'prozent', kind: 'Benennen', title: 'Prozent', run: info([
        { title: 'Grundwert, Prozentsatz, Prozentwert', html: `${T('W=G\\cdot\\dfrac{p}{100}')}<p>${tex('G')} ist das Ganze (100 %), ${tex('p')} der Prozentsatz, ${tex('W')} der Anteil. 20 % von 80 € sind ${tex('80\\cdot 0{,}2=16')} €.</p>` },
        { title: 'Mehr und weniger', html: `<p>„Um 20 % erhöht“ heißt: mal ${tex('1{,}2')}. „Um 20 % gesenkt“ heißt: mal ${tex('0{,}8')}. So geht es in einem Schritt.</p>` },
      ]) },
      { id: 'prozentrechnen', kind: 'Brücke', title: 'Prozent rechnen', run: quiz([genProzent, genProzent, genProzent, genProzent]) },
      { id: 'dreisatz', kind: 'Benennen', title: 'Dreisatz', run: info([
        { title: 'Je mehr, desto mehr', html: `<p>4 Hefte kosten 6 €. Ein Heft kostet 6 : 4 = 1,50 €. 7 Hefte kosten 7 · 1,50 = 10,50 €.</p><p class="muted">Erst auf 1 herunterrechnen, dann auf die gesuchte Anzahl hoch.</p>` },
        { title: 'Je mehr, desto weniger', html: `<p>3 Maler brauchen 12 Tage. Einer allein bräuchte 3 · 12 = 36 Tage, 4 Maler brauchen 36 : 4 = 9 Tage.</p><p class="muted">Hier bleibt das <b>Produkt</b> gleich – das nennt man antiproportional.</p>` },
      ]) },
      { id: 'dreisatzrechnen', kind: 'Brücke', title: 'Dreisatz rechnen', run: quiz([genDreisatz, genDreisatz, genDreisatz, genDreisatz]) },
      { id: 'mix', kind: 'Festigen', title: 'Prozent und Dreisatz gemischt', run: mix(genProzent, genDreisatz) },
    ] },

  /* ───────────── Klasse 8 ───────────── */
  { id: 'k8-linear', jg: '8', area: 'malgebra', title: 'Lineare Funktionen', sub: 'Steigung, Achsenabschnitt, Nullstelle',
    meta: { boss: ['Geraden-Greif', 'm', [genLinFunktion, genSteigung]], why: 'Ein Handytarif mit Grundgebühr, eine Taxifahrt, ein gleichmäßig voll laufendes Becken: Alles, was gleichmäßig wächst oder fällt, ist eine lineare Funktion.',
      formeln: [['Gerade', 'f(x)=m\\,x+b'], ['Steigung', 'm=\\dfrac{y_2-y_1}{x_2-x_1}'], ['Nullstelle', 'm\\,x+b=0\\ \\Rightarrow\\ x=-\\dfrac bm']] },
    steps: [
      { id: 'gerade', kind: 'Benennen', title: 'Die Geradengleichung', run: info([
        { title: 'Steigung und Achsenabschnitt', html: `${T('f(x)=m\\,x+b')}<p>${tex('m')} ist die <b>Steigung</b>: ein Schritt nach rechts, ${tex('m')} Schritte nach oben. ${tex('b')} ist der <b>y-Achsenabschnitt</b>: Dort schneidet die Gerade die y-Achse.</p>` },
        { title: 'Nullstelle', html: `${T('2x-6=0\\ \\Rightarrow\\ x=3')}<p>Die Nullstelle ist die Stelle, an der die Gerade die x-Achse schneidet – dort ist der Funktionswert null.</p>` },
        { title: 'Steigung aus zwei Punkten', html: `${T('m=\\dfrac{y_2-y_1}{x_2-x_1}')}<p>Höhenunterschied geteilt durch den Unterschied nach rechts.</p>` },
      ]) },
      { id: 'funktion', kind: 'Brücke', title: 'Mit Geraden rechnen', run: quiz([genLinFunktion, genLinFunktion, genLinFunktion, genLinFunktion]) },
      { id: 'steigung', kind: 'Brücke', title: 'Geraden durch zwei Punkte', run: quiz([genSteigung, genSteigung, genSteigung]) },
      { id: 'mix', kind: 'Festigen', title: 'Geraden gemischt', run: mix(genLinFunktion, genSteigung) },
    ] },
  { id: 'k8-zufall', jg: '8', area: 'mdaten', title: 'Wahrscheinlichkeit', sub: 'Laplace und Gegenereignis',
    meta: { boss: ['Würfel-Wicht', 'P', [genLaplace, genGegen]], why: 'Wie wahrscheinlich ist ein Sechser, ein Regentag, ein Gewinn? Wahrscheinlichkeiten machen Zufall berechenbar – für Spiele, Versicherungen und Wettervorhersagen.',
      formeln: [['Laplace', 'P(E)=\\dfrac{\\text{günstige}}{\\text{mögliche}}'], ['Gegenereignis', 'P(\\overline E)=1-P(E)']] },
    steps: [
      { id: 'laplace', kind: 'Benennen', title: 'Wahrscheinlichkeit berechnen', run: info([
        { title: 'Günstige durch mögliche', html: `${T('P(E)=\\dfrac{\\text{günstige}}{\\text{mögliche}}')}<p>Beim Würfeln gibt es sechs gleich wahrscheinliche Ergebnisse. „Gerade Zahl“ sind drei davon: ${tex('\\tfrac36=\\tfrac12')}.</p><p class="muted">Das gilt nur, wenn alle Ergebnisse gleich wahrscheinlich sind.</p>` },
        { title: 'Das Gegenteil hilft', html: `${T('P(\\overline E)=1-P(E)')}<p>Oft ist das Gegenteil leichter: „Keine Sechs“ hat die Wahrscheinlichkeit ${tex('1-\\tfrac16=\\tfrac56')}.</p>` },
      ]) },
      { id: 'rechnen', kind: 'Brücke', title: 'Laplace', run: quiz([genLaplace, genLaplace, genLaplace, genLaplace]) },
      { id: 'gegen', kind: 'Brücke', title: 'Gegenereignis', run: quiz([genGegen, genGegen, genGegen]) },
      { id: 'mix', kind: 'Festigen', title: 'Zufall gemischt', run: mix(genLaplace, genGegen) },
    ] },

  /* ───────────── Klasse 9 ───────────── */
  { id: 'k9-quadrat', jg: '9', area: 'malgebra', title: 'Wurzeln und quadratische Gleichungen', sub: 'Wurzeln, Parabeln, pq-Formel',
    meta: { boss: ['Parabel-Panther', 'x²', [genWurzel, genQuadGl, genScheitel]], why: 'Wurfbahnen, Bremswege und Brückenbögen sind Parabeln. Mit quadratischen Gleichungen findest du heraus, wann ein Ball landet oder wie breit ein Tor sein muss.',
      formeln: [['Wurzelgesetz', '\\sqrt a\\cdot\\sqrt b=\\sqrt{a\\cdot b}'], ['pq-Formel', 'x_{1,2}=-\\dfrac p2\\pm\\sqrt{\\left(\\dfrac p2\\right)^2-q}'], ['Scheitelform', 'f(x)=a\\,(x-d)^2+e']] },
    steps: [
      { id: 'wurzel', kind: 'Benennen', title: 'Quadratwurzeln', run: info([
        { title: 'Die Umkehrung des Quadrierens', html: `${T('\\sqrt{49}=7')}<p>Die Wurzel aus 49 ist die positive Zahl, die mit sich selbst malgenommen 49 ergibt.</p>` },
        { title: 'Rechnen mit Wurzeln', html: `${T('\\sqrt 2\\cdot\\sqrt 8=\\sqrt{16}=4\\qquad\\sqrt{50}=\\sqrt{25\\cdot 2}=5\\sqrt 2')}<p>Beim Malnehmen darf man unter einer Wurzel zusammenfassen. Beim <b>Addieren nicht</b>: ${tex('\\sqrt 9+\\sqrt{16}=7')}, aber ${tex('\\sqrt{25}=5')}.</p>` },
      ]) },
      { id: 'wurzeln', kind: 'Brücke', title: 'Wurzeln', run: quiz([genWurzel, genWurzel, genWurzel, genWurzel]) },
      { id: 'quad', kind: 'Benennen', title: 'Quadratische Gleichungen und Parabeln', run: info([
        { title: 'pq-Formel', html: `${T('x^2+p\\,x+q=0')}${T('x_{1,2}=-\\dfrac p2\\pm\\sqrt{\\left(\\dfrac p2\\right)^2-q}')}<p>Vorher durch die Zahl vor ${tex('x^2')} teilen. Steht unter der Wurzel eine negative Zahl, gibt es keine Lösung.</p>` },
        { title: 'Scheitelform', html: `${T('f(x)=a\\,(x-d)^2+e')}<p>Der Scheitel liegt bei ${tex('S(d\\mid e)')}. Ist ${tex('a')} positiv, ist die Parabel nach oben offen.</p>` },
      ]) },
      { id: 'gleichung', kind: 'Brücke', title: 'Quadratische Gleichungen', run: quiz([genQuadGl, genQuadGl, genQuadGl, genQuadGl]) },
      { id: 'parabel', kind: 'Brücke', title: 'Parabeln erkennen', run: quiz([genScheitel, genScheitel, genScheitel]) },
      { id: 'mix', kind: 'Festigen', title: 'Quadratisches gemischt', run: mix(genWurzel, genQuadGl, genScheitel) },
    ] },
  { id: 'k9-pythagoras', jg: '9', area: 'mgeo', title: 'Satz des Pythagoras', sub: 'Rechtwinklige Dreiecke berechnen',
    meta: { boss: ['Dreiecks-Drache', 'c²', [genPythagoras]], why: 'Wie lang muss die Leiter sein, wie groß ist die Bildschirmdiagonale, wie weit ist es quer über den Platz? Überall, wo ein rechter Winkel ist, hilft Pythagoras.',
      formeln: [['Pythagoras', 'a^2+b^2=c^2']] },
    steps: [
      { id: 'satz', kind: 'Benennen', title: 'Der Satz', run: info([
        { title: 'Katheten und Hypotenuse', html: `${T('a^2+b^2=c^2')}<p>Im rechtwinkligen Dreieck heißt die längste Seite <b>Hypotenuse</b> – sie liegt dem rechten Winkel gegenüber. Die beiden anderen sind die <b>Katheten</b>.</p>` },
        { title: 'Eine Seite berechnen', html: `<p>Hypotenuse gesucht: Quadrate addieren, Wurzel ziehen. Kathete gesucht: Quadrate abziehen, Wurzel ziehen.</p>${T('c=\\sqrt{3^2+4^2}=5\\qquad b=\\sqrt{13^2-5^2}=12')}` },
      ]) },
      { id: 'ueben', kind: 'Brücke', title: 'Seiten berechnen', run: quiz([genPythagoras, genPythagoras, genPythagoras, genPythagoras]) },
      { id: 'mix', kind: 'Festigen', title: 'Pythagoras gemischt', run: quiz(Array(6).fill(genPythagoras)) },
    ] },

  /* ───────────── Klasse 10 ───────────── */
  { id: 'k10-wachstum', jg: '10', area: 'malgebra', title: 'Potenzen und Wachstum', sub: 'Potenzgesetze, Zinseszins, Zerfall',
    meta: { boss: ['Zins-Zyklop', 'qⁿ', [genPotenz, genZinseszins]], why: 'Zinsen auf dem Sparkonto, die Ausbreitung einer Nachricht, der Wertverlust eines Autos: Was sich jedes Jahr um denselben Prozentsatz ändert, wächst oder fällt exponentiell – am Anfang unauffällig, dann rasant.',
      formeln: [['Potenzgesetze', 'x^a\\cdot x^b=x^{a+b}\\qquad(x^a)^b=x^{a\\cdot b}'], ['Zinseszins', 'K_n=K_0\\cdot q^n\\qquad q=1+\\dfrac{p}{100}']] },
    steps: [
      { id: 'potenzen', kind: 'Benennen', title: 'Potenzgesetze', run: info([
        { title: 'Gleiche Basis', html: `${T('x^a\\cdot x^b=x^{a+b}\\qquad\\dfrac{x^a}{x^b}=x^{a-b}')}<p>Beim Malnehmen werden die Hochzahlen addiert, beim Teilen abgezogen.</p>` },
        { title: 'Potenz einer Potenz, negative Hochzahl', html: `${T('(x^a)^b=x^{a\\cdot b}\\qquad x^{-n}=\\dfrac{1}{x^n}')}<p>Eine negative Hochzahl bedeutet: Kehrwert.</p>` },
      ]) },
      { id: 'potenz', kind: 'Brücke', title: 'Potenzen vereinfachen', run: quiz([genPotenz, genPotenz, genPotenz, genPotenz]) },
      { id: 'zins', kind: 'Benennen', title: 'Wachstum in Prozent', run: info([
        { title: 'Der Wachstumsfaktor', html: `${T('q=1+\\dfrac{p}{100}')}<p>Wächst etwas um 5 %, wird es mit ${tex('1{,}05')} malgenommen. Nimmt es um 5 % ab, mit ${tex('0{,}95')}.</p>` },
        { title: 'Jahr für Jahr', html: `${T('K_n=K_0\\cdot q^n')}<p>Jedes Jahr wird neu malgenommen – auch die Zinsen des Vorjahres wachsen mit. 1000 € bei 5 % nach 2 Jahren: ${tex('1000\\cdot 1{,}05^2=1102{,}50')} €.</p>` },
      ]) },
      { id: 'zinseszins', kind: 'Brücke', title: 'Zinseszins', run: quiz([genZinseszins, genZinseszins, genZinseszins, genZinseszins]) },
      { id: 'mix', kind: 'Festigen', title: 'Wachstum gemischt', run: mix(genPotenz, genZinseszins) },
    ] },
  { id: 'k10-koerper', jg: '10', area: 'mgeo', title: 'Trigonometrie und Körper', sub: 'Sinus, Kosinus, Zylinder, Kegel, Kugel',
    meta: { boss: ['Kegel-König', 'π', [genTrig, genKoerper, genFlaeche]], why: 'Mit Sinus und Kosinus berechnet man Höhen, die man nicht messen kann – Türme, Berge, Flugbahnen. Und fast jeder Gegenstand um dich herum ist aus Zylindern, Kegeln und Kugeln zusammengesetzt.',
      formeln: [['Sinus, Kosinus, Tangens', '\\sin\\alpha=\\dfrac{\\text{Gegenkathete}}{\\text{Hypotenuse}}\\qquad\\cos\\alpha=\\dfrac{\\text{Ankathete}}{\\text{Hypotenuse}}'], ['Zylinder und Kegel', 'V_Z=\\pi\\,r^2\\,h\\qquad V_K=\\tfrac13\\,\\pi\\,r^2\\,h'], ['Kugel', 'V=\\tfrac43\\,\\pi\\,r^3']] },
    steps: [
      { id: 'trig', kind: 'Benennen', title: 'Sinus, Kosinus, Tangens', run: info([
        { title: 'Seitenverhältnisse im rechtwinkligen Dreieck', html: `${T('\\sin\\alpha=\\dfrac{\\text{Gegenkathete}}{\\text{Hypotenuse}}\\qquad\\cos\\alpha=\\dfrac{\\text{Ankathete}}{\\text{Hypotenuse}}')}${T('\\tan\\alpha=\\dfrac{\\text{Gegenkathete}}{\\text{Ankathete}}')}<p>Die Gegenkathete liegt dem Winkel gegenüber, die Ankathete liegt an ihm an.</p>` },
      ]) },
      { id: 'winkel', kind: 'Brücke', title: 'Dreiecke berechnen', run: quiz([genTrig, genTrig, genTrig, genTrig]) },
      { id: 'koerper', kind: 'Benennen', title: 'Körper', run: info([
        { title: 'Prisma und Zylinder', html: `${T('V=G\\cdot h\\qquad V_{\\text{Zylinder}}=\\pi\\,r^2\\,h')}<p>Grundfläche mal Höhe – beim Zylinder ist die Grundfläche ein Kreis.</p>` },
        { title: 'Pyramide, Kegel, Kugel', html: `${T('V=\\tfrac13\\,G\\,h\\qquad V_{\\text{Kugel}}=\\tfrac43\\,\\pi\\,r^3')}<p>Körper mit Spitze haben ein Drittel des Rauminhalts des passenden Prismas oder Zylinders.</p>` },
      ]) },
      { id: 'volumen', kind: 'Brücke', title: 'Rauminhalte', run: quiz([genKoerper, genKoerper, genKoerper, genKoerper]) },
      { id: 'mix', kind: 'Festigen', title: 'Geometrie gemischt', run: mix(genTrig, genKoerper, genFlaeche) },
    ] },
];
