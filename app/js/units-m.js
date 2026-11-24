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
import { waage } from './games/waage.js';
import { zahlenpaare } from './games/zahlenpaare.js';
import { bruchmal } from './games/bruchmal.js';
import { gitter } from './games/gitter.js';
import { zeiger } from './games/zeiger.js';
import { genSchriftlich, genKoordinaten, genDiagramm, genProzentStart, genWinkelArt, genZufallStart, genRational, genGleichungKlammer, genVieleck, genPrisma, genExpFunktion, genSinusFkt } from './a/gen7.js';
import { prozent } from './games/prozent.js';
import { geraden } from './games/geraden.js';
import { gluecksrad } from './games/gluecksrad.js';
import { quadrate } from './games/quadrate.js';
import { zinsen } from './games/zinsen.js';
import { kreis } from './games/kreis.js';
import { murmelbahn } from './games/murmelbahn.js';
import { mixOf, genScheitel, genBaum } from './a/gen.js';
import { genVierfelder, genBedingt } from './a/gen2.js';
import { genBruch, genKlammer, genLinGl, genQuadGl, genPotenz, genSteigung, genHaeufigkeit, genProzent, genKennwerte, genLaplace, genGegen, genPythagoras, genTrig, genFlaeche } from './a/gen3.js';
import { genRunden, genRechenregel, genTeiler, genEinheit, genRechteck, genKuerzen, genBruchVergleich, genDezimal, genBruchDezimal, genNegativ, genTerm, genDreisatz, genLinFunktion, genWurzel, genZinseszins, genQuader, genKoerper, genWinkel, genLGS, genBinom, genStrahlensatz, genLog, genVorteil, genBruchMal, genZuordnung, genZins, genKreis, genParabelSach, genSinussatz } from './a/gen6.js';
import { haerter as H } from './a/gen10.js';
import { genPotenzGl, genWurzelGl, genBruchGl, genRatPot } from './a/gen13.js';

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
export const MITTEL_BALD = {   // Lehrplan-Abgleich 18.11.2026 (docs/LEHRPLAN-ABGLEICH.md), Wichtigstes zuerst.
  // Verschoben in die Lehrplan-Klasse (Marcel 18.11.): Baumdiagramm/Vierfeldertafel nach 9, Flächen und Prismen nach 7.
  // Abgleich mit den anderen Apps (19.11.): Maßstab (Kl. 5) und Potenzfunktionen (Kl. 10) übt KurvenFlug am Graphen,
  // Zehnerpotenzen (Kl. 9) Rechenblitz im Kopf – dort verlinkt statt doppelt gebaut.
  // „Trigonometrie und Körper“ bleibt in 10 (Kugel und Kegel sind dort Lehrplan; Klasse 10 braucht zwei Einheiten mit Spiel).
  5: ['Körper und Netze', 'Geraden, Strecken, senkrecht und parallel', 'Vierecke erkennen und zeichnen', 'Potenzen und Quadratzahlen', 'Zeit und Geld im Alltag', 'Römische Zahlen und Zweiersystem'],
  6: ['Symmetrie und Spiegeln', 'Flächen zusammengesetzter Figuren', 'Dreisatz im Alltag', 'Periodische Dezimalzahlen'],
  7: ['Dreiecke konstruieren', 'Terme aufstellen', 'Achsen- und Punktspiegelung', 'Satz des Thales', 'Umkreis, Inkreis und Höhen im Dreieck', 'Boxplot und Quartile'],
  8: ['Was ist eine Funktion?', 'Lineare Ungleichungen', 'Bruchterme', 'Hyperbeln: die Funktion a/x'],
  9: ['Kreis und Zylinder im Sachzusammenhang', 'Parabel trifft Gerade', 'Kathetensatz und Höhensatz'],
  10: ['Prüfungstraining Mittlerer Abschluss', 'Trigonometrie am Einheitskreis', 'Kreisbogen und Kreisausschnitt', 'Wachstum vergleichen', 'Kugel und Kegel im Sachzusammenhang', 'Ganzrationale Funktionen'],
};

export const MITTEL = [
  /* ───────────── Klasse 5 ───────────── */
  { id: 'k5-zahlen', jg: '5', area: 'mzahl', title: 'Natürliche Zahlen', sub: 'Stellenwerte, Runden, Rechenregeln',
    meta: { boss: ['Runden-Riese', '≈', [genRunden, genRechenregel]], why: 'Gerundet wird überall, wo es auf den genauen Wert nicht ankommt: Einwohnerzahlen, Entfernungen, Preise im Kopf. Und ohne feste Rechenregeln käme bei derselben Aufgabe jeder auf ein anderes Ergebnis.',
      formeln: [['Runden', '0,1,2,3,4:\\ \\text{abrunden}\\qquad 5,6,7,8,9:\\ \\text{aufrunden}'], ['Rechenregeln', '\\text{Klammer}\\ \\to\\ \\text{Potenz}\\ \\to\\ \\text{Punkt}\\ \\to\\ \\text{Strich}'], ['Durchschnitt', '\\text{Summe}:\\text{Anzahl}']] },
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
        { title: 'Beispiel: alles zusammen', html: `${T('20-(2+3\\cdot 2^2):7')}<p>Klammer zuerst, darin Potenz vor Punkt vor Strich: ${tex('3\\cdot 4=12')}, ${tex('2+12=14')}. Dann Punkt vor Strich: ${tex('14:7=2')}, ${tex('20-2=18')}.</p>` },
        { title: 'Durchschnitt', html: `<p>Den <b>Durchschnitt</b> bekommst du so: alle Zahlen addieren und die Summe durch ihre Anzahl teilen.</p>${T('(120+150+180):3=450:3=150')}<p>An 3 Tagen kamen 120, 150 und 180 Besucher – im Durchschnitt 150 pro Tag.</p><p class="muted">Soll gerundet werden, rundest du erst ganz am Ende.</p>` },
      ]) },
      { id: 'rechnen', kind: 'Brücke', title: 'Rechenregeln', run: quiz([genRechenregel, genRechenregel, genRechenregel, genRechenregel]) },
      { id: 'mix', kind: 'Festigen', title: 'Zahlen gemischt', run: mix(genRunden, genRechenregel) },
    ] },
  { id: 'k5-teiler', jg: '5', area: 'mzahl', title: 'Teiler und Vielfache', sub: 'Primzahlen, Teilbarkeit, ggT und kgV',
    meta: { boss: ['Prim-Pirat', 'ggT', [genTeiler]], why: 'Mit dem größten gemeinsamen Teiler kürzt man Brüche, mit dem kleinsten gemeinsamen Vielfachen findet man gemeinsame Nenner. Primzahlen sichern heute jede Bezahlung im Internet.',
      formeln: [['Primzahl', '\\text{genau zwei Teiler: }1\\text{ und sich selbst}'], ['Teilbar durch 3 und 9', '\\text{Quersumme durch 3 bzw. 9 teilbar}'], ['ggT und kgV', '\\text{ggT: größter gemeinsamer Teiler}\\qquad\\text{kgV: kleinstes gemeinsames Vielfaches}']] },
    steps: [
      { id: 'felder', kind: 'Entdecken', title: 'Plättchen-Felder', run: felder },
      { id: 'begriffe', kind: 'Benennen', title: 'Teiler, Vielfache, Primzahlen', run: info([
        { title: 'Teiler und Vielfache', html: `<p>3 ist ein <b>Teiler</b> von 12, weil 12 : 3 ohne Rest aufgeht. Umgekehrt ist 12 ein <b>Vielfaches</b> von 3.</p><p>Teiler von 12: 1, 2, 3, 4, 6, 12. Vielfache von 3: 3, 6, 9, 12, 15 …</p>` },
        { title: 'Primzahlen', html: `<p>Eine <b>Primzahl</b> hat genau zwei Teiler: 1 und sich selbst. Die ersten sind 2, 3, 5, 7, 11, 13.</p><p class="muted">Die 1 ist keine Primzahl – sie hat nur einen Teiler.</p>` },
        { title: 'Teilbarkeit auf einen Blick', html: `<p><b>Durch 2:</b> letzte Ziffer gerade. <b>Durch 5:</b> letzte Ziffer 0 oder 5. <b>Durch 3 oder 9:</b> Quersumme durch 3 bzw. 9 teilbar.</p><p>Beispiel 3 015: Quersumme 3 + 0 + 1 + 5 = 9, also durch 9 teilbar.</p>` },
        { title: 'ggT und kgV', html: `<p>Der <b>größte gemeinsame Teiler</b> von 12 und 18 ist 6. Das <b>kleinste gemeinsame Vielfache</b> ist 36.</p><p class="muted">Den ggT braucht man zum Kürzen, das kgV für gemeinsame Nenner.</p>` },
        { title: 'So findest du ggT und kgV', html: `<p><b>ggT:</b> Schreib die Teiler beider Zahlen auf und nimm den größten, der in beiden Listen steht. Teiler von 12: 1, 2, 3, <b>4</b>, 6, 12. Teiler von 16: 1, 2, <b>4</b>, 8, 16. Also ist der ggT 4.</p><p><b>kgV:</b> Schreib die Vielfachen der größeren Zahl auf, bis eines auch durch die andere teilbar ist. Vielfache von 10: 10, 20, <b>30</b> – 30 ist auch durch 6 teilbar. Also ist das kgV von 6 und 10 gleich 30.</p>` },
        { title: 'Beispiel: Wann wieder gleichzeitig?', html: `<p>Zwei Busse fahren alle 20 und alle 30 Minuten ab – gerade eben gleichzeitig. Wann wieder? Gesucht ist das <b>kgV</b>: Vielfache von 30 sind 30, <b>60</b> – und 60 ist auch durch 20 teilbar. Nach 60 Minuten fahren beide wieder zusammen ab.</p><p class="muted">Durch 15 teilbar heißt: durch 3 <b>und</b> durch 5 teilbar.</p>` },
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
        { title: 'Beispiel: alles zusammen', html: `${T('(-3)^2+4\\cdot(-2)=9+(-8)=1')}<p>Erst die Potenz: ${tex('(-3)^2=(-3)\\cdot(-3)=9')} (gleiche Vorzeichen, also Plus). Dann Punkt vor Strich: ${tex('4\\cdot(-2)=-8')}. Zum Schluss ${tex('9+(-8)=9-8=1')}.</p>` },
      ]) },
      { id: 'ueben', kind: 'Brücke', title: 'Mit negativen Zahlen rechnen', run: quiz([genNegativ, genNegativ, genNegativ, genNegativ]) },
      { id: 'mix', kind: 'Festigen', title: 'Negative Zahlen gemischt', run: quiz(Array(6).fill(genNegativ)) },
    ] },
  { id: 'k5-groessen', jg: '5', area: 'mgeo', title: 'Größen und Flächen', sub: 'Einheiten umrechnen, Umfang, Flächeninhalt',
    meta: { boss: ['Flächen-Fuchs', 'cm²', [genEinheit, genRechteck]], why: 'Wie viel Farbe braucht eine Wand, wie viel Zaun ein Garten? Für das eine brauchst du die Fläche, für das andere den Umfang – und beide Male die richtige Einheit.',
      formeln: [['Rechteck', 'A=a\\cdot b\\qquad U=2\\cdot(a+b)'], ['Längen', '1\\,\\text{km}=1000\\,\\text{m}\\qquad 1\\,\\text{m}=100\\,\\text{cm}'], ['Zeit', '1\\,\\text{h}=60\\,\\text{min}\\qquad 1\\,\\text{min}=60\\,\\text{s}'], ['Geschwindigkeit', '\\text{km/h}:3{,}6=\\text{m/s}']] },
    steps: [
      { id: 'einheiten', kind: 'Benennen', title: 'Einheiten umrechnen', run: info([
        { title: 'Länge, Masse, Zeit', html: `${T('1\\,\\text{km}=1000\\,\\text{m}\\qquad 1\\,\\text{m}=100\\,\\text{cm}\\qquad 1\\,\\text{cm}=10\\,\\text{mm}')}<p>${tex('1\\,\\text{kg}=1000\\,\\text{g}')}, ${tex('1\\,\\text{t}=1000\\,\\text{kg}')}. Bei der Zeit ist die Umrechnungszahl 60.</p>` },
        { title: 'Größer oder kleiner?', html: `<p>In die <b>kleinere</b> Einheit: malnehmen (man braucht mehr davon). In die <b>größere</b> Einheit: teilen.</p><p>3,5 m sind 350 cm. 4 500 g sind 4,5 kg.</p>` },
        { title: 'Zeit und Geschwindigkeit', html: `${T('1\\,\\text{h}=60\\,\\text{min}=3600\\,\\text{s}')}<p>Bei der Zeit ist die Umrechnungszahl 60: 1 h = 60 min, 1 min = 60 s.</p><p>Beispiel: 36 km/h heißt 36 000 m in 3600 s. In jeder Sekunde sind das ${tex('36\\,000:3600=10')} m, also 10 m/s.</p><p class="muted">Kurz: km/h geteilt durch 3,6 ergibt m/s.</p>` },
      ]) },
      { id: 'umrechnen', kind: 'Brücke', title: 'Größen umrechnen', run: quiz([genEinheit, genEinheit, genEinheit, genEinheit]) },
      { id: 'legen', kind: 'Entdecken', title: 'Kästchen-Baumeister', run: kaestchen },
      { id: 'flaeche', kind: 'Benennen', title: 'Umfang und Flächeninhalt', run: info([
        { title: 'Umfang', html: `${T('U=2\\cdot(a+b)')}<p>Der Umfang ist der Weg einmal außen herum. Er wird in cm oder m gemessen.</p>` },
        { title: 'Flächeninhalt', html: `${T('A=a\\cdot b')}<p>Der Flächeninhalt sagt, wie viele Einheitsquadrate hineinpassen. Er wird in cm² oder m² gemessen.</p><p class="muted">Zusammengesetzte Figuren zerlegt man in Rechtecke – oder zieht ein fehlendes Stück ab.</p>` },
        { title: 'Beispiel: rückwärts und zusammengesetzt', html: `<p><b>Umfang bekannt:</b> Ein Rechteck hat U = 30 cm und ist 9 cm lang. Die halbe Umrandung ist ${tex('a+b=15')} cm, also ist ${tex('b=15-9=6')} cm und ${tex('A=9\\cdot 6=54\\,\\text{cm}^2')}.</p><p><b>Ecke herausgeschnitten:</b> Rechteck 10 m mal 6 m, an einer Ecke fehlen 3 m mal 2 m: ${tex('A=60-6=54\\,\\text{m}^2')}. Der Umfang ist genauso groß wie beim ganzen Rechteck: ${tex('2\\cdot(10+6)=32')} m.</p><p class="muted">Kosten: Fläche mal Preis pro m², Länge mal Preis pro m – dann addieren.</p>` },
      ]) },
      { id: 'rechteck', kind: 'Brücke', title: 'Rechtecke berechnen', run: quiz([genRechteck, genRechteck, genRechteck, genRechteck]) },
      { id: 'mix', kind: 'Festigen', title: 'Größen gemischt', run: mix(genEinheit, genRechteck) },
    ] },

  /* ───────────── Klasse 6 ───────────── */
  { id: 'k5-rechnen', jg: '5', area: 'mzahl', title: 'Geschickt rechnen', sub: 'Rechenvorteile und Überschlag',
    meta: { boss: ['Trick-Tiger', '+·', [genVorteil, genRechenregel, genSchriftlich]], why: 'Wer geschickt rechnet, ist im Kopf schneller als andere mit dem Taschenrechner. Und mit einem Überschlag merkst du sofort, wenn an der Kasse oder in der Klassenarbeit ein Ergebnis nicht stimmen kann.',
      formeln: [['Tauschen', 'a+b=b+a\\qquad a\\cdot b=b\\cdot a'], ['Verteilen', 'a\\cdot(b+c)=a\\cdot b+a\\cdot c'], ['Überschlag', '\\text{erst runden, dann rechnen}'], ['Reihenfolge', '\\text{Klammer}\\ \\to\\ \\text{Potenz}\\ \\to\\ \\text{Punkt}\\ \\to\\ \\text{Strich}']] },
    steps: [
      { id: 'paare', kind: 'Entdecken', title: 'Zahlen-Paare', run: zahlenpaare },
      { id: 'vorteile', kind: 'Benennen', title: 'Rechenvorteile', run: info([
        { title: 'Tauschen und geschickt zusammenfassen', html: `${T('37+48+63=(37+63)+48=148')}<p>Beim Addieren und beim Malnehmen darfst du die Reihenfolge ändern. Such dir Zahlen, die zusammen etwas Rundes ergeben – wie im Spiel eben.</p>${T('4\\cdot 17\\cdot 25=(4\\cdot 25)\\cdot 17=1700')}` },
        { title: 'Verteilen', html: `${T('6\\cdot 99=6\\cdot 100-6\\cdot 1=594')}<p>Eine schwierige Zahl zerlegst du in zwei einfache. Umgekehrt geht es auch: ${tex('7\\cdot 23+7\\cdot 77=7\\cdot 100')}.</p>` },
        { title: 'Was zuerst gerechnet wird', html: `${T('(9+7)\\cdot 3-8:4=16\\cdot 3-2=48-2=46')}<p>Zuerst die Klammer, dann Potenzen, dann Mal und Geteilt (Punktrechnung), zuletzt Plus und Minus (Strichrechnung).</p>` },
      ]) },
      { id: 'tricks', kind: 'Brücke', title: 'Geschickt rechnen', run: quiz([genVorteil, genVorteil, genVorteil, genVorteil]) },
      { id: 'schaetzen', kind: 'Benennen', title: 'Überschlag', run: info([
        { title: 'Erst runden, dann rechnen', html: `<p>Beim Überschlag rundest du die Zahlen so, dass du im Kopf rechnen kannst.</p>${T('389+212\\approx 400+200=600')}<p class="muted">Das genaue Ergebnis ist 601 – der Überschlag liegt ganz nah dran und zeigt, ob eine Rechnung stimmen kann.</p>` },
        { title: 'Schriftlich addieren und malnehmen', html: `<p><b>Addieren:</b> Einer unter Einer, Zehner unter Zehner schreiben und von rechts nach links rechnen. 453 + 68: 3 + 8 = 11, schreibe 1, merke 1. 5 + 6 + 1 = 12, schreibe 2, merke 1. 4 + 1 = 5. Ergebnis: 521.</p><p><b>Malnehmen:</b> 444 · 6: 4 · 6 = 24, schreibe 4, merke 2. 4 · 6 + 2 = 26, schreibe 6, merke 2. 4 · 6 + 2 = 26. Ergebnis: 2664.</p><p class="muted">Mal eine zweistellige Zahl: 123 · 34 = 123 · 30 + 123 · 4 = 3690 + 492 = 4182.</p>` },
        { title: 'Schriftlich teilen', html: `<p>Von links Ziffer für Ziffer teilen und den Rest mitnehmen. 2760 : 5: 27 : 5 = 5 Rest 2. Die 6 dazu: 26 : 5 = 5 Rest 1. Die 0 dazu: 10 : 5 = 2. Ergebnis: 552.</p><p class="muted">Probe: 552 · 5 = 2760. Bei langen Aufgaben gelten dieselben Regeln: Klammer zuerst, dann Punkt vor Strich.</p>` },
      ]) },
      { id: 'ueben', kind: 'Brücke', title: 'Tricks und Überschlag', run: quiz([genVorteil, genRechenregel, genVorteil, genVorteil]) },
      { id: 'schriftlich', kind: 'Brücke', title: 'Schriftlich rechnen', run: quiz([genSchriftlich, genSchriftlich, genSchriftlich, genSchriftlich]) },
      { id: 'mix', kind: 'Festigen', title: 'Rechnen gemischt', run: mix(genVorteil, genRechenregel, genSchriftlich) },
    ] },
  { id: 'k5-daten', jg: '5', area: 'mdaten', title: 'Koordinaten und Diagramme', sub: 'Punkte finden, Umfragen auswerten',
    meta: { boss: ['Karten-Krabbe', '(x|y)', [genKoordinaten, genDiagramm]], why: 'Stadtpläne, Schiffe versenken, jedes Computerspiel: Überall werden Orte mit zwei Zahlen beschrieben. Und Diagramme zeigen auf einen Blick, was in langen Zahlenlisten steckt – in den Nachrichten genauso wie bei der Klassensprecherwahl.',
      formeln: [['Punkt', 'P(x\\mid y):\\ \\text{erst zur Seite, dann nach oben}'], ['Anteil', '\\text{Teil}:\\text{Ganzes}'], ['Quadranten', '\\text{I}:(+\\mid +)\\quad\\text{II}:(-\\mid +)\\quad\\text{III}:(-\\mid -)\\quad\\text{IV}:(+\\mid -)'], ['Durchschnitt', '\\text{Summe}=\\text{Durchschnitt}\\cdot\\text{Anzahl}']] },
    steps: [
      { id: 'schatz', kind: 'Entdecken', title: 'Schatzkarte', run: gitter },
      { id: 'punkte', kind: 'Benennen', title: 'Das Koordinatensystem', run: info([
        { title: 'Zwei Zahlen für einen Ort', html: `${T('P(3\\mid 2)')}<p>Die erste Zahl ist der <b>x-Wert</b>: so weit geht es vom Nullpunkt zur Seite. Die zweite ist der <b>y-Wert</b>: so weit geht es nach oben.</p><p class="muted">Merkhilfe: erst durch die Tür, dann die Treppe hoch.</p>` },
        { title: 'Verschieben', html: `<p>Nach rechts oder links ändert sich nur der x-Wert, nach oben oder unten nur der y-Wert. Von ${tex('(2\\mid 5)')} drei nach rechts und zwei nach unten: ${tex('(5\\mid 3)')}.</p>` },
        { title: 'Vier Quadranten', html: `<p>Die beiden Achsen teilen die Ebene in vier Viertel, die <b>Quadranten</b>. Gezählt wird rechts oben beginnend gegen den Uhrzeigersinn:</p>${T('\\text{I}:(+\\mid +)\\quad\\text{II}:(-\\mid +)\\quad\\text{III}:(-\\mid -)\\quad\\text{IV}:(+\\mid -)')}<p>${tex('P(-6\\mid 2)')}: x negativ, y positiv – also II. Quadrant.</p>` },
        { title: 'Beispiel: Fläche im Gitter', html: `<p>Leg ein Rechteck um das Dreieck, das genau durch die äußersten Ecken geht. Dann ziehst du die drei Rest-Dreiecke ab – jedes ist ein halbes Rechteck.</p><p>Dreieck ${tex('A(0\\mid 0)')}, ${tex('B(4\\mid 1)')}, ${tex('C(1\\mid 3)')}: Rechteck 4 mal 3 = 12 Kästchen. Rest-Dreiecke: ${tex('4\\cdot 1:2=2')}, ${tex('3\\cdot 2:2=3')}, ${tex('1\\cdot 3:2=1{,}5')}. Fläche: ${tex('12-6{,}5=5{,}5')} Kästchen.</p>` },
      ]) },
      { id: 'finden', kind: 'Brücke', title: 'Punkte und Wege', run: quiz([genKoordinaten, genKoordinaten, genKoordinaten, genKoordinaten]) },
      { id: 'diagramm', kind: 'Benennen', title: 'Diagramme lesen', run: info([
        { title: 'Jede Säule ist eine Zahl', html: `<p>In einem Säulendiagramm zeigt die Höhe jeder Säule, wie oft etwas vorkommt. Alle Säulen zusammen ergeben die Zahl der Befragten.</p><p>„Wie viele mehr?“ fragt nach dem <b>Unterschied</b>, „wie viele zusammen?“ nach der <b>Summe</b>.</p>` },
        { title: 'Beispiel: die fehlende Zahl', html: `<p><b>Gesamtzahl bekannt:</b> 30 Kinder, Bus 8, Fahrrad 12, zu Fuß ?: ${tex('30-8-12=10')}.</p><p><b>Durchschnitt bekannt:</b> 4 Antworten bekamen im Durchschnitt 10 Stimmen – zusammen also ${tex('4\\cdot 10=40')} Stimmen. Kennst du 12, 9 und 11, dann fehlen ${tex('40-12-9-11=8')}.</p>` },
      ]) },
      { id: 'lesen', kind: 'Brücke', title: 'Umfragen auswerten', run: quiz([genDiagramm, genDiagramm, genDiagramm, genDiagramm]) },
      { id: 'mix', kind: 'Festigen', title: 'Karten und Diagramme', run: mix(genKoordinaten, genDiagramm) },
    ] },
  { id: 'k6-bruch', jg: '6', area: 'mzahl', title: 'Brüche', sub: 'Kürzen, erweitern, vergleichen, rechnen',
    meta: { boss: ['Bruch-Bändiger', '¾', [genKuerzen, genBruchVergleich, H(genBruch)]], why: 'Eine halbe Pizza, ein Viertelliter Milch, drei Achtel einer Strecke: Brüche beschreiben Anteile. Ohne sie gäbe es weder Rezepte noch Prozentrechnung.',
      formeln: [['Kürzen und Erweitern', '\\dfrac ab=\\dfrac{a\\cdot k}{b\\cdot k}'], ['Brüche addieren', '\\dfrac ab+\\dfrac cd=\\dfrac{a\\,d+c\\,b}{b\\,d}'], ['Brüche malnehmen', '\\dfrac ab\\cdot\\dfrac cd=\\dfrac{a\\,c}{b\\,d}'], ['Vergleichen', '\\text{gleicher Nenner: größerer Zähler ist größer}']] },
    steps: [
      { id: 'streifen', kind: 'Entdecken', title: 'Bruch-Streifen', run: streifen },
      { id: 'anteil', kind: 'Benennen', title: 'Was ein Bruch bedeutet', run: info([
        { title: 'Zähler und Nenner', html: `${T('\\dfrac34')}<p>Der <b>Nenner</b> (unten) sagt, in wie viele gleiche Teile das Ganze geteilt ist. Der <b>Zähler</b> (oben) zählt, wie viele davon gemeint sind.</p>` },
        { title: 'Kürzen und Erweitern', html: `${T('\\dfrac{6}{8}=\\dfrac{3}{4}\\qquad\\dfrac{3}{4}=\\dfrac{9}{12}')}<p>Zähler und Nenner werden durch dieselbe Zahl geteilt (kürzen) oder mit derselben Zahl malgenommen (erweitern). Der Wert bleibt gleich.</p>` },
        { title: 'Beispiel: vollständig kürzen', html: `${T('\\dfrac{45}{81}=\\dfrac{45:9}{81:9}=\\dfrac{5}{9}')}<p>Teile Zähler und Nenner durch den ggT (hier 9) – dann ist der Bruch vollständig gekürzt. Stehen oben oder unten Summen, rechne sie zuerst aus: ${tex('\\dfrac{4+10}{72+54}=\\dfrac{14}{126}=\\dfrac19')}.</p>` },
        { title: 'Brüche vergleichen', html: `<p><b>Gleicher Nenner:</b> Der größere Zähler gewinnt: ${tex('\\tfrac37<\\tfrac57')}.</p><p><b>Verschiedene Nenner:</b> erst auf einen gemeinsamen Nenner erweitern: ${tex('\\tfrac23=\\tfrac{8}{12}')} und ${tex('\\tfrac34=\\tfrac{9}{12}')}, also ist ${tex('\\tfrac34')} größer.</p><p class="muted">Welcher Bruch liegt am nächsten an einem anderen? Alle auf denselben Nenner bringen (oder als Kommazahl schreiben) und die Abstände vergleichen.</p>` },
      ]) },
      { id: 'kuerzen', kind: 'Brücke', title: 'Kürzen und Erweitern', run: quiz([genKuerzen, genKuerzen, genKuerzen, genKuerzen]) },
      { id: 'vergleich', kind: 'Brücke', title: 'Brüche vergleichen', run: quiz([genBruchVergleich, genBruchVergleich, genBruchVergleich]) },
      { id: 'rechenregeln', kind: 'Benennen', title: 'Mit Brüchen rechnen', run: info([
        { title: 'Addieren und Abziehen', html: `${T('\\dfrac12+\\dfrac13=\\dfrac36+\\dfrac26=\\dfrac56')}<p>Erst auf denselben Nenner bringen, dann nur die Zähler verrechnen.</p>` },
        { title: 'Malnehmen und Teilen', html: `${T('\\dfrac23\\cdot\\dfrac45=\\dfrac{8}{15}\\qquad\\dfrac23:\\dfrac45=\\dfrac23\\cdot\\dfrac54')}<p>Malnehmen: Zähler mal Zähler, Nenner mal Nenner. Teilen: mit dem Kehrwert malnehmen.</p>` },
      ]) },
      { id: 'rechnen', kind: 'Brücke', title: 'Brüche rechnen', run: quiz([H(genBruch), H(genBruch), H(genBruch), H(genBruch)]) },
      { id: 'mix', kind: 'Festigen', title: 'Brüche gemischt', run: mix(genKuerzen, genBruchVergleich, H(genBruch)) },
    ] },
  { id: 'k6-bruchmal', jg: '6', area: 'mzahl', title: 'Brüche malnehmen und teilen', sub: 'Bruch von Bruch, Kehrwert',
    meta: { boss: ['Kehrwert-Kobold', '÷', [genBruchMal, genKuerzen]], why: 'Ein halbes Rezept, drei Viertel einer halben Pizza, ein Fünftel vom Taschengeld sparen: „Bruchteil von etwas“ ist Malnehmen mit Brüchen. Teilen brauchst du, wenn du wissen willst, wie oft ein Stück in etwas hineinpasst.',
      formeln: [['Malnehmen', '\\dfrac ab\\cdot\\dfrac cd=\\dfrac{a\\cdot c}{b\\cdot d}'], ['Teilen', '\\dfrac ab:\\dfrac cd=\\dfrac ab\\cdot\\dfrac dc'], ['Ganze Zahl', 'n\\cdot\\dfrac ab=\\dfrac{n\\cdot a}{b}\\qquad\\dfrac ab:n=\\dfrac{a}{b\\cdot n}']] },
    steps: [
      { id: 'felder', kind: 'Entdecken', title: 'Bruch-Felder', run: bruchmal },
      { id: 'mal', kind: 'Benennen', title: 'Brüche malnehmen', run: info([
        { title: 'Zähler mal Zähler, Nenner mal Nenner', html: `${T('\\dfrac23\\cdot\\dfrac34=\\dfrac{2\\cdot 3}{3\\cdot 4}=\\dfrac{6}{12}=\\dfrac12')}<p>Im Spiel hast du es gesehen: Die doppelt gefärbten Felder sind „Zähler mal Zähler“, alle Felder zusammen „Nenner mal Nenner“.</p><p class="muted">„Von“ bedeutet malnehmen: ${tex('\\tfrac34')} von 20 sind ${tex('20:4\\cdot 3=15')}.</p>` },
        { title: 'Vorher kürzen', html: `${T('\\dfrac{4}{9}\\cdot\\dfrac{3}{8}=\\dfrac{1}{3}\\cdot\\dfrac{1}{2}=\\dfrac16')}<p>Über Kreuz kürzen, bevor du ausrechnest – dann bleiben die Zahlen klein.</p>` },
      ]) },
      { id: 'malueben', kind: 'Brücke', title: 'Malnehmen', run: quiz([genBruchMal, genBruchMal, genBruchMal, genBruchMal]) },
      { id: 'teilen', kind: 'Benennen', title: 'Durch Brüche teilen', run: info([
        { title: 'Mit dem Kehrwert malnehmen', html: `${T('\\dfrac34:\\dfrac12=\\dfrac34\\cdot\\dfrac21=\\dfrac64=\\dfrac32')}<p>Die Frage „Wie oft passt ein Halbes in drei Viertel?“ hat die Antwort anderthalbmal. Den <b>Kehrwert</b> bekommst du, indem du Zähler und Nenner vertauschst.</p>` },
        { title: 'Ganze Zahl und Bruch', html: `${T('5\\cdot\\dfrac34=\\dfrac{5\\cdot 3}{4}=\\dfrac{15}{4}\\qquad\\dfrac12:5=\\dfrac{1}{2\\cdot 5}=\\dfrac1{10}')}<p>Eine ganze Zahl ist ein Bruch mit dem Nenner 1. Mal einer ganzen Zahl: nur den Zähler malnehmen. Durch eine ganze Zahl teilen: nur den Nenner malnehmen.</p><p class="muted">Ketten wie ${tex('\\tfrac12\\cdot\\tfrac23:\\tfrac13')} rechnest du von links nach rechts – das Teilen wird zum Malnehmen mit dem Kehrwert: ${tex('\\tfrac12\\cdot\\tfrac23\\cdot\\tfrac31=1')}.</p>` },
      ]) },
      { id: 'teilueben', kind: 'Brücke', title: 'Teilen', run: quiz([genBruchMal, genBruchMal, genBruchMal, genKuerzen]) },
      { id: 'mix', kind: 'Festigen', title: 'Brüche gemischt', run: mix(genBruchMal, genKuerzen) },
    ] },
  { id: 'k6-dezimal', jg: '6', area: 'mzahl', title: 'Dezimalzahlen', sub: 'Rechnen mit Komma, Bruch und Prozent',
    meta: { boss: ['Komma-Kobold', '0,1', [genDezimal, genBruchDezimal]], why: 'Preise, Zeiten im Sport, Messwerte: Fast alles, was genau gemessen wird, steht als Kommazahl da. Wer Bruch, Kommazahl und Prozent ineinander umrechnen kann, versteht dieselbe Angabe in jeder Form.',
      formeln: [['Bruch und Dezimalzahl', '\\dfrac14=0{,}25=25\\,\\%'], ['Mal 10, 100, 1000', '\\cdot 10:\\ \\text{Komma nach rechts}\\qquad :10:\\ \\text{Komma nach links}'], ['Periode', '0{,}\\overline{a}=\\dfrac a9\\qquad 0{,}\\overline{ab}=\\dfrac{ab}{99}']] },
    steps: [
      { id: 'schieber', kind: 'Entdecken', title: 'Stellenwert-Schieber', run: stellen },
      { id: 'komma', kind: 'Benennen', title: 'Zahlen mit Komma', run: info([
        { title: 'Zehntel, Hundertstel, Tausendstel', html: `<p>Rechts vom Komma geht es weiter: In 3,47 steht die 4 für vier Zehntel und die 7 für sieben Hundertstel.</p>${T('3{,}47=3+\\dfrac{4}{10}+\\dfrac{7}{100}')}` },
        { title: 'Addieren und Abziehen', html: `<p>Komma unter Komma schreiben. Fehlt eine Stelle, hilft eine Null: 3,5 = 3,50.</p>${T('3{,}5+0{,}25=3{,}75')}` },
        { title: 'Malnehmen und Teilen', html: `${T('0{,}3\\cdot 0{,}4=0{,}12')}<p>Erst ohne Komma rechnen (3 · 4 = 12). Das Ergebnis bekommt so viele Nachkommastellen wie beide Faktoren zusammen. Beim Teilen verschiebt man in beiden Zahlen das Komma, bis der Teiler ganz ist.</p>` },
        { title: 'Beispiel: durch eine Kommazahl teilen', html: `${T('1{,}2:0{,}5=12:5=2{,}4')}<p>Verschiebe das Komma in <b>beiden</b> Zahlen um gleich viele Stellen nach rechts, bis der Teiler keine Nachkommastelle mehr hat. Das Ergebnis ändert sich dabei nicht.</p>` },
      ]) },
      { id: 'rechnen', kind: 'Brücke', title: 'Mit Komma rechnen', run: quiz([genDezimal, genDezimal, genDezimal, genDezimal]) },
      { id: 'formen', kind: 'Benennen', title: 'Drei Schreibweisen', run: info([
        { title: 'Bruch, Dezimalzahl, Prozent', html: `${T('\\dfrac34=0{,}75=75\\,\\%')}<p>Der Bruchstrich bedeutet „geteilt“: 3 : 4 = 0,75. Prozent heißt „Hundertstel“: 0,75 sind 75 Hundertstel.</p>` },
        { title: 'Prozent und Periode in einen Bruch', html: `<p><b>Prozent → Bruch:</b> ${tex('12\\,\\%=\\dfrac{12}{100}=\\dfrac{3}{25}')} (mit 4 gekürzt). <b>Bruch → Prozent:</b> auf den Nenner 100 erweitern: ${tex('\\dfrac1{25}=\\dfrac4{100}=4\\,\\%')}.</p><p><b>Periode → Bruch:</b> Wiederholt sich eine Ziffer, ist der Nenner 9. Wiederholen sich zwei Ziffern, ist er 99.</p>${T('0{,}\\overline{7}=\\dfrac79\\qquad 0{,}\\overline{63}=\\dfrac{63}{99}=\\dfrac{7}{11}')}` },
      ]) },
      { id: 'umwandeln', kind: 'Brücke', title: 'Umwandeln', run: quiz([genBruchDezimal, genBruchDezimal, genBruchDezimal, genBruchDezimal]) },
      { id: 'mix', kind: 'Festigen', title: 'Dezimalzahlen gemischt', run: mix(genDezimal, genBruchDezimal) },
    ] },
  { id: 'k6-quader', jg: '6', area: 'mgeo', title: 'Quader und Würfel', sub: 'Rauminhalt und Oberfläche',
    meta: { boss: ['Kisten-Krake', 'cm³', [genQuader]], why: 'Wie viel passt in den Umzugskarton, wie viel Wasser ins Aquarium, wie viel Geschenkpapier braucht das Paket? Das eine ist der Rauminhalt, das andere die Oberfläche.',
      formeln: [['Quader', 'V=a\\cdot b\\cdot c'], ['Oberfläche des Quaders', 'O=2\\cdot(a\\,b+a\\,c+b\\,c)'], ['Würfel', 'V=a^3\\qquad O=6\\,a^2'], ['Höhe aus dem Rauminhalt', 'c=V:(a\\cdot b)']] },
    steps: [
      { id: 'bauen', kind: 'Entdecken', title: 'Würfel-Baumeister', run: wuerfel },
      { id: 'raum', kind: 'Benennen', title: 'Rauminhalt und Oberfläche', run: info([
        { title: 'Rauminhalt', html: `${T('V=a\\cdot b\\cdot c')}<p>Länge mal Breite mal Höhe. Gemessen wird in cm³ oder m³ – oder in Litern: 1 Liter ist 1 dm³.</p>` },
        { title: 'Oberfläche', html: `${T('O=2\\cdot(a\\,b+a\\,c+b\\,c)')}<p>Ein Quader hat sechs Flächen, je zwei sind gleich groß. Die Oberfläche ist die Summe aller sechs.</p>` },
        { title: 'Würfel', html: `${T('V=a^3\\qquad O=6\\,a^2')}<p>Beim Würfel sind alle Kanten gleich lang und alle sechs Flächen gleiche Quadrate.</p>` },
        { title: 'Beispiel: rückwärts und Wasserstand', html: `<p><b>Höhe gesucht:</b> V = 120 cm³, 6 cm lang, 4 cm breit: ${tex('c=120:(6\\cdot 4)=5')} cm.</p><p><b>Wasser steigt:</b> Ein Stein mit 600 cm³ wird in ein Becken mit der Grundfläche 30 cm mal 20 cm gelegt. Das Wasser steigt um ${tex('600:(30\\cdot 20)=1')} cm.</p><p class="muted">Zusammengesetzte Körper: die Rauminhalte der Teile addieren.</p>` },
      ]) },
      { id: 'ueben', kind: 'Brücke', title: 'Quader berechnen', run: quiz([genQuader, genQuader, genQuader, genQuader]) },
      { id: 'mix', kind: 'Festigen', title: 'Quader gemischt', run: quiz(Array(6).fill(genQuader)) },
    ] },
  { id: 'k6-daten', jg: '6', area: 'mdaten', title: 'Daten auswerten', sub: 'Häufigkeit, Mittelwert, Median',
    meta: { boss: ['Daten-Dachs', 'Ø', [genHaeufigkeit, H(genKennwerte)]], why: 'Notendurchschnitt, Umfragen, Sporttabellen: Mit wenigen Kennwerten lässt sich eine ganze Liste von Zahlen zusammenfassen und vergleichen.',
      formeln: [['Relative Häufigkeit', 'h=\\dfrac{\\text{Anzahl der Treffer}}{\\text{Anzahl der Versuche}}'], ['Mittelwert', '\\bar x=\\dfrac{\\text{Summe aller Werte}}{\\text{Anzahl der Werte}}'], ['Median', '\\text{mittlerer Wert der sortierten Liste}'], ['Spannweite', '\\text{größter Wert}-\\text{kleinster Wert}']] },
    steps: [
      { id: 'tuerme', kind: 'Entdecken', title: 'Türme ausgleichen', run: ausgleich },
      { id: 'kennwerte', kind: 'Benennen', title: 'Listen zusammenfassen', run: info([
        { title: 'Absolute und relative Häufigkeit', html: `<p>Die <b>absolute</b> Häufigkeit zählt, wie oft etwas vorkommt. Die <b>relative</b> Häufigkeit ist der Anteil: 6 von 24 Kindern sind ${tex('\\tfrac{6}{24}=0{,}25=25\\,\\%')}.</p>` },
        { title: 'Mittelwert und Median', html: `<p><b>Mittelwert:</b> alle Werte addieren und durch ihre Anzahl teilen. <b>Median:</b> der mittlere Wert der sortierten Liste.</p><p class="muted">Ein einzelner Ausreißer verändert den Mittelwert stark, den Median kaum.</p>` },
        { title: 'Beispiel: Median, Mittelwert, Spannweite', html: `<p>Daten: 5; 14; 5; 13; 20; 15. Sortiert: 5; 5; 13; 14; 15; 20.</p><p><b>Median:</b> Bei einer geraden Anzahl gibt es zwei mittlere Werte – nimm ihren Mittelwert: ${tex('(13+14):2=13{,}5')}.</p><p><b>Mittelwert:</b> ${tex('72:6=12')}. <b>Spannweite:</b> größter minus kleinster Wert: ${tex('20-5=15')}.</p>` },
        { title: 'Beispiel: relative Häufigkeit', html: `${T('\\dfrac{18}{25}=0{,}72=72\\,\\%')}<p>18 von 25 Bauteilen sind fehlerhaft. Sind Teile in Prozent gegeben, rechne sie zuerst in Anzahlen um: 10 % von 200 Personen sind 20 Personen.</p>` },
      ]) },
      { id: 'haeufig', kind: 'Brücke', title: 'Häufigkeiten', run: quiz([genHaeufigkeit, genHaeufigkeit, genHaeufigkeit]) },
      { id: 'mittel', kind: 'Brücke', title: 'Mittelwert und Median', run: quiz([H(genKennwerte), H(genKennwerte), H(genKennwerte)]) },
      { id: 'mix', kind: 'Festigen', title: 'Daten gemischt', run: mix(genHaeufigkeit, H(genKennwerte)) },
    ] },

  /* ───────────── Klasse 7 ───────────── */
  { id: 'k6-prozent', jg: '6', area: 'mzahl', title: 'Prozent: erste Schritte', sub: 'Brüche, Hundertstel, Anteile',
    meta: { boss: ['Hundert-Hummel', '%', [genProzentStart, genBruchDezimal]], why: 'Akku bei 25 %, 50 % Rabatt, 10 % Trinkgeld: Prozente sind Brüche mit dem Nenner 100 – und begegnen dir jeden Tag. Wer die wichtigsten auswendig kann, rechnet im Laden schneller als die Kasse.',
      formeln: [['Bedeutung', '1\\,\\%=\\dfrac{1}{100}'], ['Wichtige Anteile', '50\\,\\%=\\tfrac12\\qquad 25\\,\\%=\\tfrac14\\qquad 10\\,\\%=\\tfrac1{10}'], ['Prozent von', '\\dfrac{p}{100}\\cdot\\text{Ganzes}'], ['Anteil in Prozent', '\\dfrac{\\text{Teil}}{\\text{Ganzes}}\\cdot 100\\,\\%']] },
    steps: [
      { id: 'streifen', kind: 'Entdecken', title: 'Prozent-Streifen', run: prozent },
      { id: 'hundert', kind: 'Benennen', title: 'Von hundert', run: info([
        { title: 'Prozent heißt Hundertstel', html: `${T('1\\,\\%=\\dfrac{1}{100}')}<p>Stell dir ein Feld aus 100 Kästchen vor. Sind 37 gefärbt, dann sind das 37 % – und 63 % sind noch frei.</p>` },
        { title: 'Die wichtigsten Anteile', html: `${T('50\\,\\%=\\tfrac12\\qquad 25\\,\\%=\\tfrac14\\qquad 10\\,\\%=\\tfrac1{10}')}<p>25 % von 80 ist ein Viertel von 80, also 20. Für 75 % nimmst du das Viertel dreimal.</p>` },
        { title: 'Prozent von einer Zahl', html: `${T('10\\,\\%\\ \\text{von}\\ 50=\\dfrac{10}{100}\\cdot 50=5')}<p>Den Prozentsatz durch 100 teilen und mit dem Ganzen malnehmen.</p>` },
        { title: 'Wie viel Prozent?', html: `${T('\\dfrac{21}{70}=\\dfrac{3}{10}=\\dfrac{30}{100}=30\\,\\%')}<p>Teil durch Ganzes rechnen, dann auf den Nenner 100 erweitern (oder als Kommazahl schreiben).</p>` },
        { title: 'Beispiel: erhöhen und senken', html: `<p>200 € werden um 10 % erhöht: 10 % sind 20 €, neu 220 €. Danach wird um 50 % gesenkt: Die Hälfte von 220 € sind 110 €, neu 110 €.</p><p class="muted">Die zweite Änderung rechnet immer vom <b>neuen</b> Preis aus.</p>` },
      ]) },
      { id: 'anteile', kind: 'Brücke', title: 'Bruch und Prozent', run: quiz([genProzentStart, genProzentStart, genProzentStart, genProzentStart]) },
      { id: 'komma', kind: 'Brücke', title: 'Prozent, Bruch, Komma', run: quiz([genBruchDezimal, genProzentStart, genBruchDezimal, genProzentStart]) },
      { id: 'mix', kind: 'Festigen', title: 'Prozent gemischt', run: mix(genProzentStart, genBruchDezimal) },
    ] },
  { id: 'k6-winkel', jg: '6', area: 'mgeo', title: 'Winkel', sub: 'Winkelarten, Drehungen, Uhrzeiger',
    meta: { boss: ['Zeiger-Ziege', '∡', [genWinkelArt]], why: 'Skateboard-Tricks heißen 180 und 360, Fußballer schießen „in den Winkel“, und jede Uhr zeigt mit ihren Zeigern einen Winkel. Wer Winkel schätzen und benennen kann, findet sich in der Geometrie überall zurecht.',
      formeln: [['Winkelarten', '\\text{spitz}<90^\\circ<\\text{stumpf}<180^\\circ<\\text{überstumpf}'], ['Ganze Drehung', '360^\\circ'], ['Uhr', '\\text{großer Zeiger: }6^\\circ\\ \\text{pro min}\\qquad\\text{kleiner: }0{,}5^\\circ\\ \\text{pro min}']] },
    steps: [
      { id: 'zeiger', kind: 'Entdecken', title: 'Winkel-Zeiger', run: zeiger },
      { id: 'arten', kind: 'Benennen', title: 'Winkelarten', run: info([
        { title: 'Fünf Namen', html: `<p><b>Spitz:</b> kleiner als 90°. <b>Recht:</b> genau 90°. <b>Stumpf:</b> zwischen 90° und 180°. <b>Gestreckt:</b> genau 180°. <b>Überstumpf:</b> größer als 180°.</p><p class="muted">Ein rechter Winkel sieht aus wie die Ecke eines Blattes Papier.</p>` },
        { title: 'Drehungen', html: `${T('\\text{ganze Drehung}=360^\\circ')}<p>Eine halbe Drehung sind 180°, eine Vierteldrehung 90°. Auf der Uhr liegen zwischen zwei Zahlen ${tex('360^\\circ:12=30^\\circ')}.</p>` },
        { title: 'Beispiel: Uhrzeiger', html: `<p>Der große Zeiger läuft in jeder Minute ${tex('6^\\circ')} weiter (360° : 60). Der kleine Zeiger schafft in einer Stunde 30°, also in jeder Minute ${tex('0{,}5^\\circ')}.</p><p>Um 3:20 Uhr steht der große Zeiger bei ${tex('20\\cdot 6^\\circ=120^\\circ')}, der kleine bei ${tex('3\\cdot 30^\\circ+20\\cdot 0{,}5^\\circ=100^\\circ')}. Dazwischen liegen 20°.</p><p class="muted">Kommt mehr als 180° heraus, nimm 360° minus diesen Wert. Und: Ein gestreckter Winkel in Teilen – 180° minus die bekannten Teile.</p>` },
      ]) },
      { id: 'benennen', kind: 'Brücke', title: 'Winkel erkennen', run: quiz([genWinkelArt, genWinkelArt, genWinkelArt, genWinkelArt]) },
      { id: 'mix', kind: 'Festigen', title: 'Winkel gemischt', run: mix(genWinkelArt) },
    ] },
  { id: 'k6-zufall', jg: '6', area: 'mdaten', title: 'Zufall', sub: 'Wahrscheinlichkeit und relative Häufigkeit',
    meta: { boss: ['Würfel-Wicht', '⚅', [genZufallStart]], why: 'Lohnt sich das Los? Wie oft fällt die Sechs? Wer Chancen einschätzen kann, fällt nicht auf jedes Gewinnspiel herein – und versteht, warum man beim Würfeln manchmal einfach Pech hat.',
      formeln: [['Wahrscheinlichkeit', 'P=\\dfrac{\\text{günstige}}{\\text{mögliche}}'], ['Relative Häufigkeit', '\\dfrac{\\text{Treffer}}{\\text{Versuche}}'], ['Erwartete Anzahl', 'P\\cdot\\text{Anzahl der Versuche}']] },
    steps: [
      { id: 'rad', kind: 'Entdecken', title: 'Glücksrad', run: gluecksrad },
      { id: 'chance', kind: 'Benennen', title: 'Chancen als Bruch', run: info([
        { title: 'Günstige durch mögliche', html: `${T('P=\\dfrac{\\text{günstige}}{\\text{mögliche}}')}<p>Im Beutel liegen 3 rote und 5 blaue Kugeln. Die Chance auf Rot ist ${tex('\\tfrac38')}: 3 günstige von 8 möglichen.</p><p class="muted">Unmöglich hat die Wahrscheinlichkeit 0, sicher die Wahrscheinlichkeit 1.</p>` },
        { title: 'Ausprobieren: relative Häufigkeit', html: `<p>Bei einem Reißnagel kennt niemand die Chancen. Dann hilft Ausprobieren: Landet er bei 50 Würfen 20-mal auf dem Kopf, ist die relative Häufigkeit ${tex('\\tfrac{20}{50}=40\\,\\%')}.</p>` },
        { title: 'Beispiel: Erwartung und zweimal ziehen', html: `<p><b>Wie oft zu erwarten?</b> Wahrscheinlichkeit mal Anzahl der Versuche: ${tex('\\tfrac14\\cdot 200=50')}.</p><p><b>Zweimal mit Zurücklegen:</b> Die Wahrscheinlichkeiten werden malgenommen. 2 rote und 3 blaue Kugeln, zweimal Rot: ${tex('\\tfrac25\\cdot\\tfrac25=\\tfrac4{25}')}. „Beide gleich“ heißt zweimal Rot oder zweimal Blau – dann addieren: ${tex('\\tfrac4{25}+\\tfrac9{25}=\\tfrac{13}{25}')}.</p>` },
      ]) },
      { id: 'rechnen', kind: 'Brücke', title: 'Chancen berechnen', run: quiz([genZufallStart, genZufallStart, genZufallStart, genZufallStart]) },
      { id: 'mix', kind: 'Festigen', title: 'Zufall gemischt', run: mix(genZufallStart) },
    ] },
  { id: 'k7-terme', jg: '7', area: 'malgebra', title: 'Terme und Gleichungen', sub: 'Zusammenfassen, Klammern, lineare Gleichungen',
    meta: { boss: ['Term-Troll', 'x', [genTerm, H(genKlammer), H(genLinGl)]], why: 'Mit Variablen lässt sich ein Rechenweg aufschreiben, bevor man die Zahlen kennt – so funktionieren Formeln, Tabellenkalkulation und jedes Computerprogramm. Gleichungen beantworten die Frage: Für welche Zahl stimmt das?',
      formeln: [['Zusammenfassen', '3x+5x=8x'], ['Ausmultiplizieren', 'a\\cdot(b+c)=a\\,b+a\\,c'], ['Gleichung lösen', '3x+4=19\\ \\Rightarrow\\ 3x=15\\ \\Rightarrow\\ x=5'], ['Klammer mal Klammer', '(a+b)(c+d)=ac+ad+bc+bd']] },
    steps: [
      { id: 'waage', kind: 'Entdecken', title: 'Gleichungs-Waage', run: waage },
      { id: 'terme', kind: 'Benennen', title: 'Rechnen mit Variablen', run: info([
        { title: 'Was ein Term ist', html: `<p>Ein Term ist ein Rechenausdruck mit Platzhaltern. In ${tex('4x+7')} steht ${tex('4x')} für „4 mal ${tex('x')}“ – der Malpunkt wird weggelassen.</p><p>Für ${tex('x=2')}: ${tex('4\\cdot 2+7=15')}.</p>` },
        { title: 'Zusammenfassen', html: `${T('3x+5x-2x=6x\\qquad 2x+3y+4x=6x+3y')}<p>Nur gleichartige Glieder gehören zusammen: ${tex('x')} zu ${tex('x')}, ${tex('y')} zu ${tex('y')}. Äpfel und Birnen bleiben getrennt.</p>` },
        { title: 'Klammern auflösen', html: `${T('3\\cdot(x+2)=3x+6\\qquad -(x-4)=-x+4')}<p>Jedes Glied in der Klammer wird mit dem Faktor davor malgenommen. Ein Minus vor der Klammer dreht alle Vorzeichen um.</p>` },
        { title: 'Klammer mal Klammer', html: `${T('(x+2)(x+3)=x^2+3x+2x+6=x^2+5x+6')}<p>Jedes Glied der ersten Klammer wird mit jedem Glied der zweiten malgenommen. So auch ${tex('(x-7)^2=(x-7)(x-7)=x^2-14x+49')}.</p><p class="muted">Verschachtelte Klammern löst du von innen nach außen auf: ${tex('2[x-(3-x)]=2[2x-3]=4x-6')}.</p>` },
      ]) },
      { id: 'term', kind: 'Brücke', title: 'Terme', run: quiz([genTerm, genTerm, genTerm, genTerm]) },
      { id: 'klammer', kind: 'Brücke', title: 'Klammern', run: quiz([H(genKlammer), H(genKlammer), H(genKlammer)]) },
      { id: 'gleichung', kind: 'Benennen', title: 'Gleichungen lösen', run: info([
        { title: 'Die Waage', html: `<p>Eine Gleichung ist wie eine Waage im Gleichgewicht: Was du auf der einen Seite tust, musst du auch auf der anderen tun.</p>${T('3x+4=19\\ \\Rightarrow\\ 3x=15\\ \\Rightarrow\\ x=5')}<p>Erst die Zahl ohne ${tex('x')} wegschaffen, dann durch die Zahl vor ${tex('x')} teilen. Probe: ${tex('3\\cdot 5+4=19')}.</p>` },
      ]) },
      { id: 'loesen', kind: 'Brücke', title: 'Gleichungen', run: quiz([H(genLinGl), H(genLinGl), H(genLinGl), H(genLinGl)]) },
      { id: 'mix', kind: 'Festigen', title: 'Terme gemischt', run: mix(genTerm, H(genKlammer), H(genLinGl)) },
    ] },
  { id: 'k7-prozent', jg: '7', area: 'malgebra', title: 'Prozent und Dreisatz', sub: 'Anteile, Rabatt, Zuordnungen',
    meta: { boss: ['Rabatt-Rabe', '%', [H(genProzent), genDreisatz]], why: 'Rabatte, Zinsen, Wahlergebnisse, Akkustand: Prozente begegnen dir jeden Tag. Mit dem Dreisatz rechnest du Rezepte um, vergleichst Preise und planst, wie lange etwas dauert.',
      formeln: [['Prozentwert', 'W=G\\cdot\\dfrac{p}{100}'], ['Dreisatz', '\\text{erst auf 1, dann auf die gesuchte Anzahl}'], ['Prozentsatz', 'p=\\dfrac WG\\cdot 100'], ['Grundwert', 'G=\\dfrac Wp\\cdot 100']] },
    steps: [
      { id: 'streifen', kind: 'Entdecken', title: 'Prozent-Streifen', run: prozent },
      { id: 'prozent', kind: 'Benennen', title: 'Prozent', run: info([
        { title: 'Grundwert, Prozentsatz, Prozentwert', html: `${T('W=G\\cdot\\dfrac{p}{100}')}<p>${tex('G')} ist das Ganze (100 %), ${tex('p')} der Prozentsatz, ${tex('W')} der Anteil. 20 % von 80 € sind ${tex('80\\cdot 0{,}2=16')} €.</p>` },
        { title: 'Mehr und weniger', html: `<p>„Um 20 % erhöht“ heißt: mal ${tex('1{,}2')}. „Um 20 % gesenkt“ heißt: mal ${tex('0{,}8')}. So geht es in einem Schritt.</p>` },
        { title: 'Prozentsatz oder Grundwert gesucht', html: `${T('p=\\dfrac{W}{G}\\cdot 100\\qquad G=\\dfrac{W}{p}\\cdot 100')}<p>Wie viel Prozent sind 30 von 120? ${tex('30:120=0{,}25=25\\,\\%')}. 45 € sind 15 % – wie viel sind 100 %? ${tex('45:15\\cdot 100=300')} €.</p>` },
      ]) },
      { id: 'prozentrechnen', kind: 'Brücke', title: 'Prozent rechnen', run: quiz([H(genProzent), H(genProzent), H(genProzent), H(genProzent)]) },
      { id: 'dreisatz', kind: 'Benennen', title: 'Dreisatz', run: info([
        { title: 'Je mehr, desto mehr', html: `<p>4 Hefte kosten 6 €. Ein Heft kostet 6 : 4 = 1,50 €. 7 Hefte kosten 7 · 1,50 = 10,50 €.</p><p class="muted">Erst auf 1 herunterrechnen, dann auf die gesuchte Anzahl hoch.</p>` },
        { title: 'Je mehr, desto weniger', html: `<p>3 Maler brauchen 12 Tage. Einer allein bräuchte 3 · 12 = 36 Tage, 4 Maler brauchen 36 : 4 = 9 Tage.</p><p class="muted">Hier bleibt das <b>Produkt</b> gleich – das nennt man antiproportional.</p>` },
        { title: 'Zwei Größen ändern sich', html: `<p>4 Maschinen schaffen in 5 Stunden 200 Teile. Erst auf <b>eine</b> Maschine und <b>eine</b> Stunde herunterrechnen: ${tex('200:4:5=10')} Teile. Dann hoch: 6 Maschinen in 3 Stunden schaffen ${tex('10\\cdot 6\\cdot 3=180')} Teile.</p>` },
      ]) },
      { id: 'dreisatzrechnen', kind: 'Brücke', title: 'Dreisatz rechnen', run: quiz([genDreisatz, genDreisatz, genDreisatz, genDreisatz]) },
      { id: 'mix', kind: 'Festigen', title: 'Prozent und Dreisatz gemischt', run: mix(H(genProzent), genDreisatz) },
    ] },

  /* ───────────── Klasse 8 ───────────── */
  { id: 'k7-zuordnung', jg: '7', area: 'malgebra', title: 'Zuordnungen', sub: 'Proportional und antiproportional',
    meta: { boss: ['Je-desto-Dachs', '∝', [genZuordnung, genDreisatz]], why: 'Doppelt so viele Brötchen kosten doppelt so viel – aber doppelt so viele Helfer brauchen nur halb so lang. Wer diese beiden Muster auseinanderhält, löst fast jede Sachaufgabe.',
      formeln: [['Proportional', 'y=k\\cdot x\\quad(\\text{Quotient bleibt gleich})'], ['Antiproportional', 'x\\cdot y=k\\quad(\\text{Produkt bleibt gleich})']] },
    steps: [
      { id: 'prop', kind: 'Benennen', title: 'Zwei Muster', run: info([
        { title: 'Proportional: je mehr, desto mehr', html: `<p>Zum Doppelten gehört das Doppelte, zum Dreifachen das Dreifache. 3 Hefte kosten 6 €, also kosten 6 Hefte 12 €.</p>${T('y=k\\cdot x')}<p class="muted">Teilst du y durch x, kommt immer dieselbe Zahl heraus – der Preis für ein Stück.</p>` },
        { title: 'Antiproportional: je mehr, desto weniger', html: `<p>Zum Doppelten gehört die Hälfte. 2 Maler brauchen 12 Stunden, 4 Maler nur 6 Stunden.</p>${T('x\\cdot y=k')}<p class="muted">Nimmst du x mal y, kommt immer dieselbe Zahl heraus – die gesamte Arbeit.</p>` },
        { title: 'Achtung: nicht alles passt', html: `<p>„Je älter, desto größer“ stimmt zwar – aber ein doppelt so altes Kind ist nicht doppelt so groß. Das ist weder proportional noch antiproportional.</p>` },
        { title: 'Beispiel: Werte berechnen', html: `<p><b>Proportional:</b> Zu x = 5 gehört y = 40. Dann ist ${tex('k=40:5=8')}, und zu x = 7 gehört ${tex('y=8\\cdot 7=56')}.</p><p><b>Antiproportional:</b> Zu x = 4 gehört y = 15. Das Produkt ist ${tex('4\\cdot 15=60')}, also gehört zu x = 6 der Wert ${tex('60:6=10')}.</p>` },
        { title: 'Zwei Größen auf einmal', html: `<p>3 Maschinen stellen in 4 Stunden 120 Teile her. Erst auf eine Maschine und eine Stunde herunterrechnen: ${tex('120:3:4=10')}. Dann hoch: 5 Maschinen in 6 Stunden schaffen ${tex('10\\cdot 5\\cdot 6=300')} Teile.</p>` },
      ]) },
      { id: 'erkennen', kind: 'Brücke', title: 'Zuordnungen erkennen und rechnen', run: quiz([genZuordnung, genZuordnung, genZuordnung, genZuordnung]) },
      { id: 'dreisatz', kind: 'Brücke', title: 'Dreisatz', run: quiz([genDreisatz, genZuordnung, genDreisatz, genZuordnung]) },
      { id: 'mix', kind: 'Festigen', title: 'Zuordnungen gemischt', run: mix(genZuordnung, genDreisatz) },
    ] },
  { id: 'k7-zinsen', jg: '7', area: 'malgebra', title: 'Zinsrechnung', sub: 'Kapital, Zinssatz, Zinsen',
    meta: { boss: ['Zins-Zebra', '€', [genZins, H(genProzent)]], why: 'Sparbuch, Kredit fürs erste Auto, Ratenkauf beim Handy: Überall stecken Zinsen. Wer sie ausrechnen kann, erkennt, was ein Angebot wirklich kostet.',
      formeln: [['Jahreszinsen', 'Z=K\\cdot\\dfrac{p}{100}'], ['Monate', 'Z_m=Z\\cdot\\dfrac{m}{12}'], ['Tage', 'Z_t=Z\\cdot\\dfrac{t}{360}'], ['Kapital', 'K=\\dfrac{Z\\cdot 100}{p}']] },
    steps: [
      { id: 'begriffe', kind: 'Benennen', title: 'Zinsen sind Prozente', run: info([
        { title: 'Neue Namen, gleiche Rechnung', html: `${T('Z=K\\cdot\\dfrac{p}{100}')}<p>Das <b>Kapital</b> ${tex('K')} ist der Grundwert, der <b>Zinssatz</b> ${tex('p')} der Prozentsatz, die <b>Zinsen</b> ${tex('Z')} der Prozentwert. 800 € zu 3 % bringen in einem Jahr ${tex('800\\cdot 0{,}03=24')} €.</p>` },
        { title: 'Weniger als ein Jahr', html: `${T('Z_m=Z\\cdot\\dfrac{m}{12}\\qquad Z_t=Z\\cdot\\dfrac{t}{360}')}<p>Der Zinssatz gilt immer für ein ganzes Jahr. Für 6 Monate gibt es die Hälfte der Jahreszinsen. Banken rechnen mit 30 Tagen pro Monat und 360 Tagen pro Jahr.</p>` },
        { title: 'Kapital oder Zinssatz gesucht', html: `${T('K=\\dfrac{Z\\cdot 100}{p}\\qquad p=\\dfrac{Z\\cdot 100}{K}')}<p>Bei 4 % gibt es 60 € Zinsen. Kapital: ${tex('60\\cdot 100:4=1500')} €.</p><p class="muted">Monate: 2400 € zu 5 % bringen im Jahr 120 €, in 4 Monaten ${tex('120\\cdot\\tfrac{4}{12}=40')} €.</p>` },
        { title: 'Beispiel: Geld auf zwei Konten', html: `<p>10 000 € liegen auf zwei Konten mit 2 % und 4 %. Zusammen gibt es 300 € Zinsen. Liegt ${tex('x')} auf dem 2-%-Konto, liegt ${tex('10\\,000-x')} auf dem anderen:</p>${T('0{,}02x+0{,}04\\,(10\\,000-x)=300')}<p>${tex('0{,}02x+400-0{,}04x=300')}, also ${tex('-0{,}02x=-100')} und ${tex('x=5000')} €.</p>` },
      ]) },
      { id: 'jahr', kind: 'Brücke', title: 'Zinsen berechnen', run: quiz([genZins, genZins, genZins, genZins]) },
      { id: 'prozent', kind: 'Brücke', title: 'Zinsen und Prozente', run: quiz([H(genProzent), genZins, H(genProzent), genZins]) },
      { id: 'mix', kind: 'Festigen', title: 'Zinsen gemischt', run: mix(genZins, H(genProzent)) },
    ] },
  { id: 'k7-winkel', jg: '7', area: 'mgeo', title: 'Winkel und Dreiecke', sub: 'Nebenwinkel, Scheitelwinkel, Winkelsumme',
    meta: { boss: ['Winkel-Wiesel', '∠', [genWinkel]], why: 'Dachdecker, Vermesser und Spiele-Programmierer rechnen ständig mit Winkeln. Wer die wenigen Winkel-Regeln kennt, kann fehlende Winkel ausrechnen, ohne zu messen.',
      formeln: [['Nebenwinkel', '\\alpha+\\beta=180^\\circ'], ['Winkelsumme im Dreieck', '\\alpha+\\beta+\\gamma=180^\\circ'], ['Winkelsumme im Viereck', '360^\\circ'], ["Außenwinkel", "\\alpha'=180^\\circ-\\alpha"]] },
    steps: [
      { id: 'kreuzung', kind: 'Benennen', title: 'Winkel an Geraden', run: info([
        { title: 'Nebenwinkel', html: `${T('\\alpha+\\beta=180^\\circ')}<p>Zwei Winkel, die nebeneinander an einer Geraden liegen, ergänzen sich zu einem gestreckten Winkel. Ist der eine 70°, dann ist der andere 110°.</p>` },
        { title: 'Scheitelwinkel', html: `<p>Schneiden sich zwei Geraden, entstehen vier Winkel. Die Winkel, die sich <b>gegenüberliegen</b>, sind gleich groß – wie bei einer geöffneten Schere.</p>` },
      ]) },
      { id: 'geraden', kind: 'Brücke', title: 'Winkel an Geraden', run: quiz([genWinkel, genWinkel, genWinkel, genWinkel]) },
      { id: 'summe', kind: 'Benennen', title: 'Winkelsumme', run: info([
        { title: 'Im Dreieck: 180°', html: `${T('\\alpha+\\beta+\\gamma=180^\\circ')}<p>Reißt du die drei Ecken eines Papierdreiecks ab und legst sie aneinander, entsteht immer eine gerade Linie. Kennst du zwei Winkel, kennst du auch den dritten.</p>` },
        { title: 'Gleichschenklig und Viereck', html: `<p>Im <b>gleichschenkligen</b> Dreieck sind die beiden Basiswinkel gleich groß. Ein <b>Viereck</b> lässt sich in zwei Dreiecke zerlegen – seine Winkelsumme ist ${tex('2\\cdot 180^\\circ=360^\\circ')}.</p>` },
        { title: 'Außenwinkel', html: `<p>Verlängert man eine Dreiecksseite, entsteht an der Ecke ein <b>Außenwinkel</b>. Er ist der Nebenwinkel des Innenwinkels: Innenwinkel = 180° minus Außenwinkel.</p><p>Beispiel: Gleichschenkliges Dreieck, Außenwinkel an der Basis 140°. Basiswinkel: ${tex('180^\\circ-140^\\circ=40^\\circ')} – beide Basiswinkel sind gleich. Spitze: ${tex('180^\\circ-2\\cdot 40^\\circ=100^\\circ')}.</p>` },
      ]) },
      { id: 'dreieck', kind: 'Brücke', title: 'Fehlende Winkel', run: quiz([genWinkel, genWinkel, genWinkel, genWinkel]) },
      { id: 'mix', kind: 'Festigen', title: 'Winkel gemischt', run: mix(genWinkel) },
    ] },
  { id: 'k7-rational', jg: '7', area: 'mzahl', title: 'Rationale Zahlen', sub: 'Rechnen mit negativen Brüchen und Kommazahlen',
    meta: { boss: ['Minus-Marder', '±', [genRational, genNegativ]], why: 'Kontostand im Minus, Temperaturen unter null, Höhenangaben unter dem Meeresspiegel: Sobald Zahlen negativ werden, brauchst du sichere Vorzeichenregeln – auch für jede Gleichung, die später kommt.',
      formeln: [['Mal und Geteilt', '(-)\\cdot(-)=(+)\\qquad(+)\\cdot(-)=(-)'], ['Minus Minus', 'a-(-b)=a+b']] },
    steps: [
      { id: 'regeln', kind: 'Benennen', title: 'Vorzeichenregeln', run: info([
        { title: 'Addieren und Abziehen', html: `${T('-4{,}5+2=-2{,}5\\qquad -3-(-5)=-3+5=2')}<p>Stell dir die Zahlengerade vor: Plus geht nach rechts, Minus nach links. Minus eine negative Zahl dreht die Richtung um – es wird Plus.</p>` },
        { title: 'Malnehmen und Teilen', html: `${T('(-)\\cdot(-)=(+)\\qquad(+)\\cdot(-)=(-)')}<p>Gleiche Vorzeichen ergeben Plus, verschiedene ergeben Minus. Beim Teilen gilt genau dasselbe.</p><p class="muted">Achtung: ${tex('(-3)^2=9')}, aber ${tex('-3^2=-9')}.</p>` },
        { title: 'Beispiel: alles zusammen', html: `${T('(-1{,}5+0{,}5)\\cdot(-4)-(-3):0{,}5')}<p>Klammer zuerst: ${tex('-1{,}5+0{,}5=-1')}. Dann Punkt vor Strich: ${tex('(-1)\\cdot(-4)=4')} und ${tex('(-3):0{,}5=-6')}. Zum Schluss ${tex('4-(-6)=4+6=10')}.</p>` },
      ]) },
      { id: 'strich', kind: 'Brücke', title: 'Rechnen mit Vorzeichen', run: quiz([genRational, genRational, genRational, genRational]) },
      { id: 'punkt', kind: 'Brücke', title: 'Negative Zahlen sicher', run: quiz([genNegativ, genRational, genNegativ, genRational]) },
      { id: 'mix', kind: 'Festigen', title: 'Rationale Zahlen gemischt', run: mix(genRational, genNegativ) },
    ] },
  { id: 'k7-gleichungen', jg: '7', area: 'malgebra', title: 'Gleichungen mit Klammern', sub: 'x auf beiden Seiten, Klammern auflösen',
    meta: { boss: ['Klammer-Kauz', '( )', [genGleichungKlammer, H(genLinGl)]], why: 'Zwei Handytarife vergleichen, ein Alter ausrechnen, einen Preis mit Rabatt zurückrechnen: Echte Fragen führen fast immer zu Gleichungen, in denen x mehrmals vorkommt oder in einer Klammer steckt.',
      formeln: [['Klammer auflösen', 'a(x+b)=ax+ab'], ['Minus vor der Klammer', '-(x-b)=-x+b'], ['Brüche beseitigen', '\\text{beide Seiten mit dem Hauptnenner malnehmen}']] },
    steps: [
      { id: 'weg', kind: 'Benennen', title: 'Der Weg zur Lösung', run: info([
        { title: 'Erst aufräumen, dann lösen', html: `${T('3(x+2)=18\\ \\Rightarrow\\ 3x+6=18\\ \\Rightarrow\\ x=4')}<p>Löse zuerst die Klammern auf und fasse zusammen. Danach geht es wie gewohnt: Zahlen auf die eine Seite, x auf die andere.</p>` },
        { title: 'x auf beiden Seiten', html: `${T('5x+3=2x+15\\ \\Rightarrow\\ 3x=12\\ \\Rightarrow\\ x=4')}<p>Zieh auf beiden Seiten so viele x ab, dass sie auf einer Seite verschwinden. Am Ende immer die Probe machen.</p>` },
        { title: 'Minus vor der Klammer', html: `${T('-(x-4)=-x+4')}<p>Ein Minus vor der Klammer dreht <b>jedes</b> Vorzeichen in der Klammer um. Das ist der häufigste Fehler bei Gleichungen.</p>` },
        { title: 'Beispiel: x im Bruch', html: `${T('\\dfrac{x}{2}+2=11\\ \\mid -2\\quad\\Rightarrow\\quad\\dfrac x2=9\\ \\mid\\cdot 2\\quad\\Rightarrow\\quad x=18')}<p>Stehen mehrere Brüche da, nimm die ganze Gleichung mit dem gemeinsamen Nenner mal – dann verschwinden alle Brüche: ${tex('\\dfrac x2+\\dfrac x3=5\\ \\mid\\cdot 6')} ergibt ${tex('3x+2x=30')}, also ${tex('x=6')}.</p><p class="muted">Ein Ergebnis wie ${tex('x=\\tfrac{60}{13}')} ist richtig – nicht runden.</p>` },
      ]) },
      { id: 'klammern', kind: 'Brücke', title: 'Gleichungen lösen', run: quiz([genGleichungKlammer, genGleichungKlammer, genGleichungKlammer, genGleichungKlammer]) },
      { id: 'einfach', kind: 'Brücke', title: 'Sicher umformen', run: quiz([H(genLinGl), genGleichungKlammer, H(genLinGl), genGleichungKlammer]) },
      { id: 'mix', kind: 'Festigen', title: 'Gleichungen gemischt', run: mix(genGleichungKlammer, H(genLinGl)) },
    ] },
  { id: 'k8-linear', jg: '8', area: 'malgebra', title: 'Lineare Funktionen', sub: 'Steigung, Achsenabschnitt, Nullstelle',
    meta: { boss: ['Geraden-Greif', 'm', [genLinFunktion, H(genSteigung)]], why: 'Ein Handytarif mit Grundgebühr, eine Taxifahrt, ein gleichmäßig voll laufendes Becken: Alles, was gleichmäßig wächst oder fällt, ist eine lineare Funktion.',
      formeln: [['Geradengleichung', 'f(x)=m\\,x+b'], ['Steigung', 'm=\\dfrac{y_2-y_1}{x_2-x_1}'], ['Nullstelle', 'm\\,x+b=0\\ \\Rightarrow\\ x=-\\dfrac bm'], ['Achsenabschnitt', 'b=y_1-m\\,x_1']] },
    steps: [
      { id: 'zieher', kind: 'Entdecken', title: 'Geraden-Zieher', run: geraden },
      { id: 'gerade', kind: 'Benennen', title: 'Die Geradengleichung', run: info([
        { title: 'Steigung und Achsenabschnitt', html: `${T('f(x)=m\\,x+b')}<p>${tex('m')} ist die <b>Steigung</b>: ein Schritt nach rechts, ${tex('m')} Schritte nach oben. ${tex('b')} ist der <b>y-Achsenabschnitt</b>: Dort schneidet die Gerade die y-Achse.</p>` },
        { title: 'Nullstelle', html: `${T('2x-6=0\\ \\Rightarrow\\ x=3')}<p>Die Nullstelle ist die Stelle, an der die Gerade die x-Achse schneidet – dort ist der Funktionswert null.</p>` },
        { title: 'Steigung aus zwei Punkten', html: `${T('m=\\dfrac{y_2-y_1}{x_2-x_1}')}<p>Höhenunterschied geteilt durch den Unterschied nach rechts.</p>` },
        { title: 'Geradengleichung aus zwei Punkten', html: `<p>1. Die Steigung ${tex('m')} ausrechnen. 2. Einen Punkt in ${tex('y=m\\,x+b')} einsetzen und nach ${tex('b')} auflösen.</p><p>Beispiel ${tex('P(1\\mid 3)')}, ${tex('Q(3\\mid 7)')}: ${tex('m=\\dfrac{7-3}{3-1}=2')}. P einsetzen: ${tex('3=2\\cdot 1+b')}, also ${tex('b=1')}. Ergebnis: ${tex('y=2x+1')}.</p>` },
      ]) },
      { id: 'funktion', kind: 'Brücke', title: 'Mit Geraden rechnen', run: quiz([genLinFunktion, genLinFunktion, genLinFunktion, genLinFunktion]) },
      { id: 'steigung', kind: 'Brücke', title: 'Geraden durch zwei Punkte', run: quiz([H(genSteigung), H(genSteigung), H(genSteigung)]) },
      { id: 'mix', kind: 'Festigen', title: 'Geraden gemischt', run: mix(genLinFunktion, H(genSteigung)) },
    ] },
  { id: 'k8-zufall', jg: '8', area: 'mdaten', title: 'Wahrscheinlichkeit', sub: 'Laplace und Gegenereignis',
    meta: { boss: ['Würfel-Wicht', 'P', [H(genLaplace), H(genGegen)]], why: 'Wie wahrscheinlich ist ein Sechser, ein Regentag, ein Gewinn? Wahrscheinlichkeiten machen Zufall berechenbar – für Spiele, Versicherungen und Wettervorhersagen.',
      formeln: [['Laplace', 'P(E)=\\dfrac{\\text{günstige}}{\\text{mögliche}}'], ['Gegenereignis', 'P(\\overline E)=1-P(E)'], ['Mindestens einmal', '1-q^n\\quad(q:\\ \\text{Gegenwahrscheinlichkeit},\\ n:\\ \\text{Versuche})']] },
    steps: [
      { id: 'rad', kind: 'Entdecken', title: 'Glücksrad', run: gluecksrad },
      { id: 'laplace', kind: 'Benennen', title: 'Wahrscheinlichkeit berechnen', run: info([
        { title: 'Günstige durch mögliche', html: `${T('P(E)=\\dfrac{\\text{günstige}}{\\text{mögliche}}')}<p>Beim Würfeln gibt es sechs gleich wahrscheinliche Ergebnisse. „Gerade Zahl“ sind drei davon: ${tex('\\tfrac36=\\tfrac12')}.</p><p class="muted">Das gilt nur, wenn alle Ergebnisse gleich wahrscheinlich sind.</p>` },
        { title: 'Das Gegenteil hilft', html: `${T('P(\\overline E)=1-P(E)')}<p>Oft ist das Gegenteil leichter: „Keine Sechs“ hat die Wahrscheinlichkeit ${tex('1-\\tfrac16=\\tfrac56')}.</p>` },
        { title: 'Zwei Würfel', html: `<p>Bei zwei Würfeln gibt es ${tex('6\\cdot 6=36')} gleich wahrscheinliche Paare: (1|1), (1|2) … (6|6). Zähle die günstigen Paare. Augensumme 4: (1|3), (2|2), (3|1) – also ${tex('\\tfrac{3}{36}')}.</p>` },
        { title: 'Mindestens einmal', html: `${T('P(\\text{mindestens einmal})=1-P(\\text{keinmal})')}<p>Ein Würfel wird 4-mal geworfen. „Keine Sechs“ hat in einem Wurf ${tex('\\tfrac56')}, in allen vier Würfen ${tex('\\left(\\tfrac56\\right)^4')}. Also gilt für mindestens eine Sechs: ${tex('1-\\left(\\tfrac56\\right)^4\\approx 0{,}52')}.</p>` },
      ]) },
      { id: 'rechnen', kind: 'Brücke', title: 'Laplace', run: quiz([H(genLaplace), H(genLaplace), H(genLaplace), H(genLaplace)]) },
      { id: 'gegen', kind: 'Brücke', title: 'Gegenereignis', run: quiz([H(genGegen), H(genGegen), H(genGegen)]) },
      { id: 'mix', kind: 'Festigen', title: 'Zufall gemischt', run: mix(H(genLaplace), H(genGegen)) },
    ] },

  /* ───────────── Klasse 9 ───────────── */
  { id: 'k8-lgs', jg: '8', area: 'malgebra', title: 'Gleichungssysteme', sub: 'Zwei Gleichungen, zwei Unbekannte',
    meta: { boss: ['Doppel-Drache', 'x y', [genLGS]], why: 'Zwei Handytarife, zwei Angebote, zwei Züge, die sich begegnen: Sobald zwei Bedingungen gleichzeitig gelten sollen, entsteht ein Gleichungssystem. Seine Lösung ist der Punkt, an dem sich zwei Geraden schneiden.',
      formeln: [['Einsetzen', 'y=2x\\ \\text{in}\\ x+y=9:\\quad x+2x=9'], ['Addieren', '(x+y)+(x-y)=2x']] },
    steps: [
      { id: 'idee', kind: 'Benennen', title: 'Zwei Bedingungen gleichzeitig', run: info([
        { title: 'Was eine Lösung ist', html: `${T('\\begin{array}{l}x+y=7\\\\x-y=1\\end{array}')}<p>Gesucht ist ein Zahlenpaar, das <b>beide</b> Gleichungen erfüllt. Hier passt ${tex('x=4')}, ${tex('y=3')}: ${tex('4+3=7')} und ${tex('4-3=1')}.</p>` },
        { title: 'Additionsverfahren', html: `<p>Addierst du beide Gleichungen, fällt ${tex('y')} heraus:</p>${T('2x=8\\ \\Rightarrow\\ x=4')}<p>Dann ${tex('x')} in eine der Gleichungen einsetzen: ${tex('4+y=7')}, also ${tex('y=3')}.</p>` },
        { title: 'Einsetzungsverfahren', html: `<p>Ist eine Gleichung schon nach einer Unbekannten aufgelöst, setzt du sie in die andere ein:</p>${T('y=2x\\ \\text{in}\\ x+y=9:\\quad 3x=9')}<p class="muted">Am Ende immer die Probe in beiden Gleichungen machen.</p>` },
        { title: 'Beispiel: erst passend malnehmen', html: `${T('\\begin{array}{l}2x+y=8\\\\3x-2y=5\\end{array}')}<p>Die erste Gleichung mal 2: ${tex('4x+2y=16')}. Jetzt addieren, ${tex('y')} fällt weg: ${tex('7x=21')}, also ${tex('x=3')}. Einsetzen: ${tex('6+y=8')}, also ${tex('y=2')}. Probe: ${tex('9-4=5')}.</p>` },
      ]) },
      { id: 'loesen', kind: 'Brücke', title: 'Systeme lösen', run: quiz([genLGS, genLGS, genLGS, genLGS]) },
      { id: 'mix', kind: 'Festigen', title: 'Gleichungssysteme', run: mix(genLGS, H(genLinGl)) },
    ] },
  { id: 'k8-binom', jg: '8', area: 'malgebra', title: 'Binomische Formeln', sub: 'Klammern quadrieren und zurück',
    meta: { boss: ['Klammer-Krake', '( )²', [genBinom, H(genKlammer)]], why: 'Mit den binomischen Formeln rechnest du 31² oder 49 mal 51 im Kopf. Später brauchst du sie für Parabeln, für die pq-Formel und überall, wo Klammern quadriert werden.',
      formeln: [['Erste binomische Formel', '(a+b)^2=a^2+2ab+b^2'], ['Zweite binomische Formel', '(a-b)^2=a^2-2ab+b^2'], ['Dritte binomische Formel', '(a+b)(a-b)=a^2-b^2']] },
    steps: [
      { id: 'formeln', kind: 'Benennen', title: 'Die drei Formeln', run: info([
        { title: 'Erste und zweite Formel', html: `${T('(a+b)^2=a^2+2ab+b^2')}${T('(a-b)^2=a^2-2ab+b^2')}<p>Ein Quadrat mit der Seite ${tex('a+b')} besteht aus zwei Quadraten und <b>zwei</b> gleichen Rechtecken – daher das ${tex('2ab')}. Der häufigste Fehler: das gemischte Glied vergessen.</p>` },
        { title: 'Dritte Formel', html: `${T('(a+b)(a-b)=a^2-b^2')}<p>Die gemischten Glieder heben sich auf. Kopfrechnen damit: ${tex('49\\cdot 51=(50-1)(50+1)=2500-1=2499')}.</p>` },
        { title: 'Beispiel: rückwärts und gemischt', html: `<p><b>Rückwärts:</b> ${tex('x^2+10x+25')} – vorn und hinten stehen Quadrate (${tex('x^2')} und ${tex('5^2')}), in der Mitte ${tex('2\\cdot x\\cdot 5')}. Also ${tex('(x+5)^2')}.</p><p><b>Mit Zahl vor x:</b> ${tex('(2x-3)^2=4x^2-12x+9')}.</p><p><b>Minus vor einem Produkt:</b> erst ausrechnen, in Klammern lassen, dann alle Vorzeichen umdrehen: ${tex('(x+1)^2-(x+2)(x-2)=x^2+2x+1-(x^2-4)=2x+5')}.</p>` },
      ]) },
      { id: 'aus', kind: 'Brücke', title: 'Ausmultiplizieren', run: quiz([genBinom, genBinom, genBinom, genBinom]) },
      { id: 'klammer', kind: 'Brücke', title: 'Klammern', run: quiz([H(genKlammer), genBinom, H(genKlammer)]) },
      { id: 'mix', kind: 'Festigen', title: 'Binome gemischt', run: mix(genBinom, H(genKlammer)) },
    ] },
  { id: 'k8-kreis', jg: '8', area: 'mgeo', title: 'Kreis', sub: 'Umfang und Flächeninhalt',
    meta: { boss: ['Pi-Pirat', 'π', [genKreis]], why: 'Wie weit rollt ein Fahrrad bei einer Radumdrehung? Wie viel Teig braucht eine Pizza mit doppeltem Durchmesser? Für alles Runde brauchst du die Kreiszahl π.',
      formeln: [['Umfang', 'U=2\\cdot\\pi\\cdot r=\\pi\\cdot d'], ['Flächeninhalt', 'A=\\pi\\cdot r^2'], ['Kreiszahl', '\\pi\\approx 3{,}14']] },
    steps: [
      { id: 'pi', kind: 'Benennen', title: 'Die Kreiszahl π', run: info([
        { title: 'Umfang: einmal abrollen', html: `${T('U=2\\cdot\\pi\\cdot r=\\pi\\cdot d')}<p>Legst du ein Maßband um einen Teller und teilst durch den Durchmesser, kommt immer ungefähr 3,14 heraus – egal wie groß der Teller ist. Diese Zahl heißt ${tex('\\pi')}.</p>` },
        { title: 'Flächeninhalt', html: `${T('A=\\pi\\cdot r^2')}<p>Hier wird der <b>Radius</b> quadriert. Bei doppeltem Radius ist die Fläche viermal so groß – deshalb ist die große Pizza oft das bessere Angebot.</p><p class="muted">Ergebnisse wie ${tex('9\\pi')} sind genau. Mit ${tex('\\pi\\approx 3{,}14')} sind das etwa 28,3.</p>` },
      ]) },
      { id: 'umfang', kind: 'Brücke', title: 'Umfang und Fläche', run: quiz([genKreis, genKreis, genKreis, genKreis]) },
      { id: 'teile', kind: 'Benennen', title: 'Rückwärts und in Teilen', run: info([
        { title: 'Vom Umfang zum Radius', html: `${T('U=10\\pi\\ \\Rightarrow\\ r=\\dfrac{10\\pi}{2\\pi}=5')}<p>Ist der Durchmesser gegeben, halbiere ihn zuerst – in die Flächenformel gehört der Radius.</p>` },
        { title: 'Halbkreis, Viertelkreis, Kreisring', html: `<p>Rechne den ganzen Kreis aus und teile dann. Beim Kreisring ziehst du den kleinen Kreis vom großen ab:</p>${T('A=\\pi\\cdot r_a^2-\\pi\\cdot r_i^2')}` },
        { title: 'Beispiel: zusammengesetzte Fläche', html: `<p>An den beiden kurzen Seiten eines Rechtecks (20 m mal 10 m) sitzt je ein Halbkreis. Zwei Halbkreise sind zusammen ein ganzer Kreis mit ${tex('r=5')} m.</p>${T('A=20\\cdot 10+\\pi\\cdot 5^2=200+25\\pi\\approx 278{,}5\\,\\text{m}^2')}` },
      ]) },
      { id: 'rueck', kind: 'Brücke', title: 'Kreisteile', run: quiz([genKreis, genKreis, genKreis, genKreis]) },
      { id: 'mix', kind: 'Festigen', title: 'Kreis gemischt', run: mix(genKreis) },
    ] },
  { id: 'k8-flaechen', jg: '7', area: 'mgeo', title: 'Flächen und Prismen', sub: 'Dreieck, Trapez, Prisma, Zylinder',
    meta: { boss: ['Trapez-Tapir', '▱', [genVieleck, genPrisma]], why: 'Wie viel Farbe braucht die Giebelwand? Wie viel Wasser passt in die Regentonne? Mit wenigen Formeln für Flächen und Körper beantwortest du solche Fragen – beim Renovieren, Verpacken und Bauen.',
      formeln: [['Dreieck', 'A=\\tfrac12\\cdot g\\cdot h'], ['Trapez', 'A=\\tfrac12\\cdot(a+c)\\cdot h'], ['Prisma', 'V=G\\cdot h'], ['Zylinder', 'V=\\pi\\cdot r^2\\cdot h'], ['Rohr', 'V=\\pi\\,(r_a^2-r_i^2)\\cdot h'], ['Masse', '\\text{Masse}=V\\cdot\\text{Masse pro cm}^3']] },
    steps: [
      { id: 'flaechen', kind: 'Benennen', title: 'Dreieck, Parallelogramm, Trapez', run: info([
        { title: 'Alles kommt vom Rechteck', html: `${T('A_{\\text{Parallelogramm}}=g\\cdot h\\qquad A_{\\text{Dreieck}}=\\tfrac12\\cdot g\\cdot h')}<p>Ein Parallelogramm lässt sich zu einem Rechteck umlegen. Ein Dreieck ist genau die Hälfte eines Parallelogramms. Wichtig ist immer die <b>Höhe</b>, nicht die schräge Seite.</p>` },
        { title: 'Trapez', html: `${T('A=\\tfrac12\\cdot(a+c)\\cdot h')}<p>Nimm den Mittelwert der beiden parallelen Seiten mal die Höhe.</p>` },
        { title: 'Beispiel: rückwärts und Trapez-Höhe', html: `<p><b>Höhe gesucht:</b> Dreieck mit A = 30 cm² und g = 10 cm: ${tex('h=2A:g=6')} cm.</p><p><b>Gleichschenkliges Trapez, nur schräge Seite s bekannt:</b> An der Seite entsteht ein rechtwinkliges Dreieck, ${tex('(a-c):2')} breit, mit s als längster Seite. Mit dem Satz des Pythagoras: ${tex('h=\\sqrt{s^2-\\left(\\tfrac{a-c}{2}\\right)^2}')}.</p><p>a = 14 m, c = 6 m, s = 5 m: ${tex('(14-6):2=4')}, ${tex('h=\\sqrt{25-16}=3')} m, ${tex('A=\\tfrac12\\cdot 20\\cdot 3=30\\,\\text{m}^2')}.</p>` },
      ]) },
      { id: 'ebene', kind: 'Brücke', title: 'Flächen berechnen', run: quiz([genVieleck, genVieleck, genVieleck, genVieleck]) },
      { id: 'koerper', kind: 'Benennen', title: 'Prisma und Zylinder', run: info([
        { title: 'Grundfläche mal Höhe', html: `${T('V=G\\cdot h')}<p>Bei jedem Prisma und beim Zylinder wird die Grundfläche Schicht für Schicht gestapelt. Beim Zylinder ist die Grundfläche ein Kreis: ${tex('V=\\pi r^2h')}.</p>` },
        { title: 'Mantel des Zylinders', html: `${T('M=2\\pi r\\cdot h')}<p>Wickelst du das Etikett einer Dose ab, entsteht ein Rechteck: so breit wie der Umfang, so hoch wie die Dose.</p>` },
        { title: 'Beispiel: Rohr und Gewicht', html: `<p>Ein Rohr ist ein Zylinder mit Loch: Die Grundfläche ist ein Kreisring.</p>${T('V=\\pi\\,(r_a^2-r_i^2)\\cdot h')}<p>Außenradius 2 cm, Innenradius 1 cm, Länge 100 cm: ${tex('V=\\pi\\cdot(4-1)\\cdot 100\\approx 942')} cm³. Wiegt 1 cm³ genau 8 g, wiegt das Rohr ${tex('942\\cdot 8\\approx 7540')} g, also etwa 7,5 kg.</p>` },
      ]) },
      { id: 'raum', kind: 'Brücke', title: 'Körper berechnen', run: quiz([genPrisma, genPrisma, genPrisma, genPrisma]) },
      { id: 'mix', kind: 'Festigen', title: 'Flächen und Körper', run: mix(genVieleck, genPrisma) },
    ] },
  { id: 'k9-quadrat', jg: '9', area: 'malgebra', title: 'Wurzeln und quadratische Gleichungen', sub: 'Wurzeln, Parabeln, pq-Formel',
    meta: { boss: ['Parabel-Panther', 'x²', [genWurzel, H(genQuadGl), genScheitel]], why: 'Wurfbahnen, Bremswege und Brückenbögen sind Parabeln. Mit quadratischen Gleichungen findest du heraus, wann ein Ball landet oder wie breit ein Tor sein muss.',
      formeln: [['Wurzelgesetz', '\\sqrt a\\cdot\\sqrt b=\\sqrt{a\\cdot b}'], ['pq-Formel', 'x_{1,2}=-\\dfrac p2\\pm\\sqrt{\\left(\\dfrac p2\\right)^2-q}'], ['Scheitelform', 'f(x)=a\\,(x-d)^2+e'], ['Nenner rational', '\\dfrac{1}{\\sqrt a+\\sqrt b}=\\dfrac{\\sqrt a-\\sqrt b}{a-b}']] },
    steps: [
      { id: 'wurzel', kind: 'Benennen', title: 'Quadratwurzeln', run: info([
        { title: 'Die Umkehrung des Quadrierens', html: `${T('\\sqrt{49}=7')}<p>Die Wurzel aus 49 ist die positive Zahl, die mit sich selbst malgenommen 49 ergibt.</p>` },
        { title: 'Rechnen mit Wurzeln', html: `${T('\\sqrt 2\\cdot\\sqrt 8=\\sqrt{16}=4\\qquad\\sqrt{50}=\\sqrt{25\\cdot 2}=5\\sqrt 2')}<p>Beim Malnehmen darf man unter einer Wurzel zusammenfassen. Beim <b>Addieren nicht</b>: ${tex('\\sqrt 9+\\sqrt{16}=7')}, aber ${tex('\\sqrt{25}=5')}.</p>` },
        { title: 'Brüche und Nenner ohne Wurzel', html: `${T('\\sqrt{\\dfrac{9}{25}}=\\dfrac35')}<p>Aus Zähler und Nenner einzeln die Wurzel ziehen.</p><p><b>Nenner rational machen:</b> Mit der dritten binomischen Formel erweitern – dann verschwindet die Wurzel unten:</p>${T('\\dfrac{2}{\\sqrt5+\\sqrt3}=\\dfrac{2(\\sqrt5-\\sqrt3)}{5-3}=\\sqrt5-\\sqrt3')}` },
      ]) },
      { id: 'wurzeln', kind: 'Brücke', title: 'Wurzeln', run: quiz([genWurzel, genWurzel, genWurzel, genWurzel]) },
      { id: 'bahn', kind: 'Entdecken', title: 'Murmelbahn', run: murmelbahn },
      { id: 'quad', kind: 'Benennen', title: 'Quadratische Gleichungen und Parabeln', run: info([
        { title: 'pq-Formel', html: `${T('x^2+p\\,x+q=0')}${T('x_{1,2}=-\\dfrac p2\\pm\\sqrt{\\left(\\dfrac p2\\right)^2-q}')}<p>Vorher durch die Zahl vor ${tex('x^2')} teilen. Steht unter der Wurzel eine negative Zahl, gibt es keine Lösung.</p>` },
        { title: 'Scheitelform', html: `${T('f(x)=a\\,(x-d)^2+e')}<p>Der Scheitel liegt bei ${tex('S(d\\mid e)')}. Ist ${tex('a')} positiv, ist die Parabel nach oben offen.</p>` },
        { title: 'Beispiel: pq-Formel', html: `<p>${tex('x^2-5x+6=0')}: also ${tex('p=-5')} und ${tex('q=6')}.</p>${T('x_{1,2}=2{,}5\\pm\\sqrt{6{,}25-6}=2{,}5\\pm 0{,}5')}<p>Also ${tex('x_1=2')} und ${tex('x_2=3')}. Stehen auf beiden Seiten Terme, bring zuerst alles auf eine Seite (${tex('\\ldots=0')}). ${tex('x^2=49')} geht ohne Formel: ${tex('x=\\pm 7')}.</p>` },
        { title: 'Gleichung aus dem Graphen', html: `<p>Scheitel ablesen gibt ${tex('d')} und ${tex('e')}. Für ${tex('a')} einen weiteren Punkt einsetzen. Scheitel ${tex('S(1\\mid -2)')}, Punkt ${tex('P(3\\mid 0)')}: ${tex('0=a\\,(3-1)^2-2')}, also ${tex('4a=2')} und ${tex('a=0{,}5')}.</p><p>Ausmultipliziert: ${tex('f(x)=0{,}5(x-1)^2-2=0{,}5x^2-x-1{,}5')}.</p><p class="muted">Ohne Punkt: Geh vom Scheitel einen Schritt nach rechts – so weit es dann hoch (oder runter) geht, so groß ist ${tex('a')}.</p>` },
      ]) },
      { id: 'gleichung', kind: 'Brücke', title: 'Quadratische Gleichungen', run: quiz([H(genQuadGl), H(genQuadGl), H(genQuadGl), H(genQuadGl)]) },
      { id: 'parabel', kind: 'Brücke', title: 'Parabeln erkennen', run: quiz([genScheitel, genScheitel, genScheitel]) },
      { id: 'mix', kind: 'Festigen', title: 'Quadratisches gemischt', run: mix(genWurzel, H(genQuadGl), genScheitel) },
    ] },
  { id: 'k9-gleichungen', jg: '9', area: 'malgebra', title: 'Potenz-, Wurzel- und Bruchgleichungen', sub: 'Probe, Scheinlösungen, Definitionsmenge, Hochzahlen mit Bruch',
    meta: { boss: ['Wurzel-Wolf', '√', [genPotenzGl, genWurzelGl, genBruchGl, genRatPot]], why: 'Wenn ein Wert unter einer Wurzel steht oder im Nenner, reicht „einfach umstellen“ nicht: Beim Quadrieren können falsche Lösungen entstehen, ein Nenner darf nie null werden. Wer das prüft, rechnet in Physik (Fallzeit, Schwingung), Technik und Wirtschaft sicher.',
      formeln: [['Potenzgleichung', 'x^n=a:\\ \\ n\\ \\text{gerade, }a>0\\to x=\\pm\\sqrt[n]{a};\\ \\ n\\ \\text{ungerade}\\to x=\\sqrt[n]{a}'], ['Wurzel nie negativ', '\\sqrt{u}\\ge 0\\quad\\Rightarrow\\quad\\sqrt{x}=-3\\ \\text{hat keine Lösung}'], ['Quadrieren und Probe', '\\sqrt{u}=v\\ \\Rightarrow\\ u=v^2\\ \\text{(Probe: }v\\ge 0\\text{!)}'], ['Nicht durch x teilen', 'x\\,(ax-b)=0\\ \\Rightarrow\\ x=0\\ \\text{oder}\\ x=\\dfrac{b}{a}'], ['Definitionsmenge', '\\dfrac{a}{x-b}:\\ D=\\mathbb{R}\\setminus\\{b\\}'], ['Hochzahlen mit Bruch', 'a^{\\frac mn}=\\left(\\sqrt[n]{a}\\right)^{m}\\qquad a^{-\\frac mn}=\\dfrac{1}{a^{\\frac mn}}']] },
    steps: [
      { id: 'potenz', kind: 'Benennen', title: 'Potenzgleichungen', run: info([
        { title: 'Wurzel ziehen – aber richtig', html: `${T('x^n=a')}<p><b>Gerade Hochzahl</b> (${tex('x^2,\\,x^4,\\,\\dots')}): Ist ${tex('a>0')}, gibt es zwei Lösungen ${tex('x=\\pm\\sqrt[n]{a}')}. Ist ${tex('a<0')}, gibt es keine Lösung, weil eine gerade Potenz nie negativ ist.</p><p><b>Ungerade Hochzahl</b> (${tex('x^3,\\,x^5,\\,\\dots')}): immer genau eine Lösung, auch für negatives ${tex('a')}.</p><p>${tex('x^2=49\\ \\Rightarrow\\ x=\\pm 7')}, ${tex('x^3=-8\\ \\Rightarrow\\ x=-2')}, ${tex('x^4=-16')}: keine Lösung.</p>` },
        { title: 'Mit Faktor und Verschiebung', html: `<p>Erst den Faktor wegteilen, dann die Wurzel ziehen: ${tex('2x^2=50\\ \\Rightarrow\\ x^2=25\\ \\Rightarrow\\ x=\\pm 5')}.</p><p>Steht eine Klammer in der Potenz, löst man die Klammer zuletzt: ${tex('(x-3)^2=16\\ \\Rightarrow\\ x-3=\\pm 4\\ \\Rightarrow\\ x=7\\ \\text{oder}\\ x=-1')}.</p>` },
      ]) },
      { id: 'potenzueben', kind: 'Brücke', title: 'Potenzgleichungen lösen', run: quiz([genPotenzGl, genPotenzGl, genPotenzGl, genPotenzGl]) },
      { id: 'wurzel', kind: 'Benennen', title: 'Wurzelgleichungen und die Probe', run: info([
        { title: 'Eine Wurzel ist nie negativ', html: `${T('2\\sqrt{x}=6\\ \\Rightarrow\\ \\sqrt{x}=3\\ \\Rightarrow\\ x=9')}<p>Erst die Wurzel allein stellen (hier durch 2 teilen), dann quadrieren. Probe: ${tex('2\\cdot\\sqrt 9=6')} ✓. ${tex('L=\\{9\\}')}.</p><p>Aber: ${tex('5\\sqrt{x}=-\\tfrac1{16}')} hat <b>keine Lösung</b>, denn links steht etwas, das nie negativ ist. ${tex('L=\\{\\ \\}')}.</p>` },
        { title: 'Die Wurzel mit einem Term darunter', html: `${T('\\sqrt{-x+5}=10\\ \\Rightarrow\\ -x+5=100\\ \\Rightarrow\\ x=-95')}<p>Probe: ${tex('\\sqrt{95+5}=\\sqrt{100}=10')} ✓. Also ${tex('L=\\{-95\\}')}. Auch eine negative Lösung kann stimmen: Es kommt auf den Wert unter der Wurzel an (hier ${tex('100\\ge 0')}).</p>` },
        { title: 'Scheinlösungen entlarven', html: `${T('\\sqrt{x+6}=x\\ \\Rightarrow\\ x+6=x^2\\ \\Rightarrow\\ x^2-x-6=0')}<p>Lösungen der quadratischen Gleichung: ${tex('x=3')} oder ${tex('x=-2')}. <b>Probe:</b> ${tex('x=3')}: ${tex('\\sqrt 9=3')} ✓. ${tex('x=-2')}: ${tex('\\sqrt4=2\\neq -2')} ✗. Das Quadrieren hat eine <b>Scheinlösung</b> erzeugt. ${tex('L=\\{3\\}')}.</p><p class="muted">Quadrieren ist keine Äquivalenzumformung – darum immer die Probe in der Ausgangsgleichung.</p>` },
        { title: 'Nicht durch x teilen', html: `${T('2\\sqrt{5x}=10x\\ \\Rightarrow\\ 20x=100x^2\\ \\Rightarrow\\ 20x\\,(5x-1)=0')}<p>Ausklammern statt teilen: ${tex('x=0')} oder ${tex('x=\\tfrac15')}. Wer durch ${tex('x')} teilt, verliert die Lösung 0.</p><p>Probe ${tex('x=\\tfrac15')}: links ${tex('2\\sqrt{1}=2')}, rechts ${tex('10\\cdot\\tfrac15=2')} ✓. Probe ${tex('x=0')}: ${tex('0=0')} ✓. ${tex('L=\\{0;\\ \\tfrac15\\}')}.</p>` },
      ]) },
      { id: 'wurzelueben', kind: 'Brücke', title: 'Wurzelgleichungen lösen', run: quiz([genWurzelGl, genWurzelGl, genWurzelGl, genWurzelGl, genWurzelGl]) },
      { id: 'bruch', kind: 'Benennen', title: 'Bruchgleichungen', run: info([
        { title: 'Erst die Definitionsmenge', html: `${T('\\dfrac{6}{x-2}=3\\qquad D=\\mathbb{R}\\setminus\\{2\\}')}<p>Ein Nenner darf nie 0 sein. Das schreibst du <b>zuerst</b> auf. Dann mit dem Nenner multiplizieren: ${tex('6=3\\,(x-2)')}, also ${tex('x=4')}. ${tex('4\\in D')} ✓. Probe: ${tex('\\tfrac{6}{4-2}=3')} ✓.</p>` },
        { title: 'Überkreuz oder Hauptnenner', html: `${T('\\dfrac{2}{x-1}=\\dfrac{3}{x+2}\\qquad D=\\mathbb{R}\\setminus\\{-2;\\,1\\}')}<p>Überkreuz: ${tex('2\\,(x+2)=3\\,(x-1)')}, also ${tex('2x+4=3x-3')} und ${tex('x=7')}. Beide Nenner sind für ${tex('x=7')} nicht 0 ✓.</p><p>Bei mehreren Brüchen: Hauptnenner bilden (Nenner faktorisieren, zum Beispiel ${tex('x^2-9=(x-3)(x+3)')}), mit ihm multiplizieren.</p>` },
        { title: 'Wenn die Lösung nicht erlaubt ist', html: `${T('\\dfrac{x+1}{x-3}=\\dfrac{4}{x-3}\\ \\Rightarrow\\ x+1=4\\ \\Rightarrow\\ x=3')}<p>Aber ${tex('3\\notin D=\\mathbb{R}\\setminus\\{3\\}')}: Der Nenner wäre 0. Das ist eine <b>Scheinlösung</b>, es gibt keine Lösung: ${tex('L=\\{\\ \\}')}.</p>` },
      ]) },
      { id: 'bruchueben', kind: 'Brücke', title: 'Bruchgleichungen lösen', run: quiz([genBruchGl, genBruchGl, genBruchGl, genBruchGl]) },
      { id: 'hoch', kind: 'Benennen', title: 'Hochzahlen mit Bruch', run: info([
        { title: 'Wurzel als Hochzahl', html: `${T('a^{\\frac1n}=\\sqrt[n]{a}\\qquad a^{\\frac mn}=\\left(\\sqrt[n]{a}\\right)^{m}')}<p>Der Nenner der Hochzahl ist die Wurzel, der Zähler die Potenz. Erst die Wurzel ziehen, dann potenzieren: ${tex('27^{\\frac23}=\\left(\\sqrt[3]{27}\\right)^2=3^2=9')}.</p>` },
        { title: 'Negative Hochzahlen und Gesetze', html: `${T('a^{-\\frac mn}=\\dfrac{1}{a^{\\frac mn}}\\qquad x^{\\frac pq}\\cdot x^{\\frac rt}=x^{\\frac pq+\\frac rt}')}<p>${tex('16^{-\\frac34}=\\dfrac{1}{16^{\\frac34}}=\\dfrac{1}{2^3}=\\dfrac18')}. Die Potenzgesetze gelten weiter: gleiche Basis malnehmen → Hochzahlen addieren, teilen → subtrahieren, Potenz einer Potenz → multiplizieren.</p>` },
        { title: 'Gleichungen mit gebrochener Hochzahl', html: `${T('x^{\\frac23}=9\\ \\Rightarrow\\ x=9^{\\frac32}=27')}<p>Mit dem <b>Kehrbruch</b> der Hochzahl potenzieren. Probe: ${tex('27^{\\frac23}=\\left(\\sqrt[3]{27}\\right)^2=9')} ✓.</p>` },
      ]) },
      { id: 'hochueben', kind: 'Brücke', title: 'Rationale Hochzahlen', run: quiz([genRatPot, genRatPot, genRatPot, genRatPot]) },
      { id: 'mix', kind: 'Festigen', title: 'Gleichungen gemischt', run: mix(genPotenzGl, genWurzelGl, genBruchGl, genRatPot) },
    ] },
  { id: 'k9-pythagoras', jg: '9', area: 'mgeo', title: 'Satz des Pythagoras', sub: 'Rechtwinklige Dreiecke berechnen',
    meta: { boss: ['Dreiecks-Drache', 'c²', [H(genPythagoras)]], why: 'Wie lang muss die Leiter sein, wie groß ist die Bildschirmdiagonale, wie weit ist es quer über den Platz? Überall, wo ein rechter Winkel ist, hilft Pythagoras.',
      formeln: [['Pythagoras', 'a^2+b^2=c^2'], ['Kathete', 'b=\\sqrt{c^2-a^2}'], ['Raumdiagonale', 'd=\\sqrt{a^2+b^2+c^2}']] },
    steps: [
      { id: 'quadrate', kind: 'Entdecken', title: 'Pythagoras-Quadrate', run: quadrate },
      { id: 'satz', kind: 'Benennen', title: 'Der Satz', run: info([
        { title: 'Katheten und Hypotenuse', html: `${T('a^2+b^2=c^2')}<p>Im rechtwinkligen Dreieck heißt die längste Seite <b>Hypotenuse</b> – sie liegt dem rechten Winkel gegenüber. Die beiden anderen sind die <b>Katheten</b>.</p>` },
        { title: 'Eine Seite berechnen', html: `<p>Hypotenuse gesucht: Quadrate addieren, Wurzel ziehen. Kathete gesucht: Quadrate abziehen, Wurzel ziehen.</p>${T('c=\\sqrt{3^2+4^2}=5\\qquad b=\\sqrt{13^2-5^2}=12')}` },
        { title: 'Beispiel: Sachaufgabe und Raumdiagonale', html: `<p><b>Leiter:</b> Eine 5 m lange Leiter steht unten 3 m von der Wand weg. Sie reicht ${tex('\\sqrt{5^2-3^2}=\\sqrt{16}=4')} m hoch – die Leiter ist die Hypotenuse.</p><p><b>Raumdiagonale im Quader:</b> zweimal Pythagoras – erst über die Grundfläche, dann mit der Höhe:</p>${T('d=\\sqrt{a^2+b^2+c^2}')}<p>Quader 2 cm, 3 cm, 6 cm: ${tex('d=\\sqrt{4+9+36}=\\sqrt{49}=7')} cm.</p>` },
      ]) },
      { id: 'ueben', kind: 'Brücke', title: 'Seiten berechnen', run: quiz([H(genPythagoras), H(genPythagoras), H(genPythagoras), H(genPythagoras)]) },
      { id: 'mix', kind: 'Festigen', title: 'Pythagoras gemischt', run: quiz(Array(6).fill(H(genPythagoras))) },
    ] },

  /* ───────────── Klasse 10 ───────────── */
  { id: 'k9-aehnlich', jg: '9', area: 'mgeo', title: 'Ähnlichkeit und Strahlensätze', sub: 'Vergrößern, Verkleinern, Höhen bestimmen',
    meta: { boss: ['Schatten-Schakal', '∼', [genStrahlensatz]], why: 'Mit einem Stab und seinem Schatten lässt sich die Höhe eines Baums bestimmen, ohne hinaufzuklettern. Landkarten, Modelle und Zoom am Handy funktionieren genauso: alles wird mit demselben Faktor gestreckt.',
      formeln: [['Streckfaktor', "k=\\dfrac{\\text{Bildlänge}}{\\text{Originallänge}}"], ['Flächen', "A'=k^2\\cdot A"], ['Strahlensatz', "\\dfrac{ZA'}{ZA}=\\dfrac{A'B'}{AB}"], ["Faktor aus Flächen", "k=\\sqrt{\\dfrac{A'}{A}}"]] },
    steps: [
      { id: 'faktor', kind: 'Benennen', title: 'Ähnliche Figuren', run: info([
        { title: 'Derselbe Faktor für jede Länge', html: `<p>Zwei Figuren sind <b>ähnlich</b>, wenn die eine eine Vergrößerung oder Verkleinerung der anderen ist. Jede Länge wird mit demselben Faktor ${tex('k')} malgenommen, die Winkel bleiben gleich.</p>${T("k=\\dfrac{\\text{Bildlänge}}{\\text{Originallänge}}")}` },
        { title: 'Flächen wachsen schneller', html: `${T("A'=k^2\\cdot A")}<p>Wird ein Foto doppelt so breit <b>und</b> doppelt so hoch, ist seine Fläche viermal so groß.</p>` },
        { title: 'Fläche bekannt, Länge gesucht', html: `${T("k=\\sqrt{\\dfrac{A'}{A}}")}<p>Zwei ähnliche Dreiecke haben 8 cm² und 72 cm². Dann ist ${tex("k=\\sqrt{72:8}=\\sqrt9=3")}: Eine Seite von 5 cm wird im großen Dreieck 15 cm lang.</p>` },
      ]) },
      { id: 'strecken', kind: 'Brücke', title: 'Vergrößern und Verkleinern', run: quiz([genStrahlensatz, genStrahlensatz, genStrahlensatz, genStrahlensatz]) },
      { id: 'strahlen', kind: 'Benennen', title: 'Strahlensätze', run: info([
        { title: 'Zwei Strahlen, zwei Parallelen', html: `<p>Gehen zwei Strahlen von einem Punkt Z aus und werden von zwei <b>parallelen</b> Geraden geschnitten, entstehen zwei ähnliche Dreiecke.</p>${T("\\dfrac{ZA'}{ZA}=\\dfrac{A'B'}{AB}")}<p>Die Parallelen verhalten sich wie die Abschnitte vom Punkt Z aus.</p>` },
        { title: 'Höhe mit Schatten', html: `<p>Stab und Baum stehen beide senkrecht, die Sonne scheint für beide im selben Winkel. Also gilt: Höhe durch Schatten ist bei beiden gleich.</p>` },
        { title: 'Beispiel: Baum und Fluss', html: `<p><b>Schatten:</b> Ein 2 m langer Stab wirft 3 m Schatten, der Baum 12 m. Höhe : Schatten ist gleich: ${tex('h=12\\cdot\\dfrac23=8')} m.</p><p><b>Fluss:</b> Die Strecke AB = 20 m am Ufer ist x von Z entfernt, die parallele Strecke CD = 30 m liegt 10 m weiter, also ${tex('x+10')} von Z entfernt:</p>${T("\\dfrac{x}{x+10}=\\dfrac{20}{30}")}<p>Über Kreuz malnehmen: ${tex('30x=20x+200')}, also ${tex('x=20')} m.</p>` },
      ]) },
      { id: 'anwenden', kind: 'Brücke', title: 'Längen bestimmen', run: quiz([genStrahlensatz, genStrahlensatz, genStrahlensatz, genStrahlensatz]) },
      { id: 'mix', kind: 'Festigen', title: 'Ähnlichkeit gemischt', run: quiz(Array(6).fill(genStrahlensatz)) },
    ] },
  { id: 'k9-parabel', jg: '9', area: 'malgebra', title: 'Parabeln im Alltag', sub: 'Wurfbahn, Brückenbogen, größter Wert',
    meta: { boss: ['Wurf-Wal', '⌒', [genParabelSach, genScheitel]], why: 'Jeder geworfene Ball, jeder Wasserstrahl und viele Brückenbögen sind Parabeln. Aus der Gleichung liest du ab, wie hoch der Ball fliegt und wo er landet – oder wie ein Zaun gestellt werden muss, damit das Beet möglichst groß wird.',
      formeln: [['Scheitel', 'h(x)=-(x-d)^2+e\\ \\Rightarrow\\ S(d\\mid e)'], ['Landung', 'h(x)=0'], ['Größter Wert', '\\text{liegt am Scheitel}'], ['Allgemeine Form', 'h(x)=0\\ \\to\\ \\text{Normalform, dann pq-Formel}']] },
    steps: [
      { id: 'lesen', kind: 'Benennen', title: 'Die Bahn lesen', run: info([
        { title: 'Was der Scheitel verrät', html: `${T('h(x)=-(x-3)^2+9')}<p>Das Minus vor der Klammer heißt: Die Parabel ist nach unten geöffnet. Der Scheitel ${tex('S(3\\mid 9)')} ist der höchste Punkt – nach 3 m Weite ist der Ball 9 m hoch.</p>` },
        { title: 'Abwurf und Landung', html: `<p><b>Abwurf:</b> ${tex('x=0')} einsetzen: ${tex('h(0)=-9+9=0')}.</p><p><b>Landung:</b> Die Höhe ist 0: ${tex('(x-3)^2=9')}, also ${tex('x=3\\pm 3')}. Der Ball landet bei 6 m.</p>` },
        { title: 'Beispiel: Breite und Landung', html: `<p><b>Breite eines Bogens:</b> Nullstellen suchen. ${tex('-(x-5)^2+9=0')} ergibt ${tex('(x-5)^2=9')}, also ${tex('x=5\\pm 3')}: 2 und 8. Breite: ${tex('8-2=6')} m.</p><p><b>Ohne Scheitelform:</b> ${tex('h(x)=-0{,}5x^2+x+4=0')}. Durch ${tex('-0{,}5')} teilen: ${tex('x^2-2x-8=0')}. pq-Formel: ${tex('x=1\\pm\\sqrt{1+8}=1\\pm 3')}. Der Ball landet bei 4 m – die negative Lösung passt nicht.</p>` },
        { title: 'Gleichung aus dem Graphen', html: `${T('f(x)=a\\,(x-d)^2+e')}<p>${tex('d')} und ${tex('e')} sind die Koordinaten des Scheitels. Für ${tex('a')} einen weiteren Punkt einsetzen: Scheitel ${tex('S(2\\mid 3)')}, Punkt ${tex('P(4\\mid 1)')}: ${tex('1=a\\cdot 2^2+3')}, also ${tex('a=-0{,}5')}.</p><p class="muted">Ist ${tex('a')} negativ, ist die Parabel nach unten offen.</p>` },
      ]) },
      { id: 'wurf', kind: 'Brücke', title: 'Wurfbahnen', run: quiz([genParabelSach, genParabelSach, genParabelSach, genParabelSach]) },
      { id: 'scheitel', kind: 'Brücke', title: 'Scheitel ablesen', run: quiz([genScheitel, genParabelSach, genScheitel]) },
      { id: 'mix', kind: 'Festigen', title: 'Parabeln gemischt', run: mix(genParabelSach, genScheitel) },
    ] },
  { id: 'k10-wachstum', jg: '10', area: 'malgebra', title: 'Potenzen und Wachstum', sub: 'Potenzgesetze, Zinseszins, Zerfall',
    meta: { boss: ['Zins-Zyklop', 'qⁿ', [H(genPotenz), genZinseszins]], why: 'Zinsen auf dem Sparkonto, die Ausbreitung einer Nachricht, der Wertverlust eines Autos: Was sich jedes Jahr um denselben Prozentsatz ändert, wächst oder fällt exponentiell – am Anfang unauffällig, dann rasant.',
      formeln: [['Potenzgesetze', 'x^a\\cdot x^b=x^{a+b}\\qquad(x^a)^b=x^{a\\cdot b}'], ['Zinseszins', 'K_n=K_0\\cdot q^n\\qquad q=1+\\dfrac{p}{100}'], ['Abnahme', 'q=1-\\dfrac{p}{100}'], ['Wurzel als Potenz', '\\sqrt[n]{x}=x^{\\frac1n}']] },
    steps: [
      { id: 'saeulen', kind: 'Entdecken', title: 'Wachstums-Säulen', run: zinsen },
      { id: 'potenzen', kind: 'Benennen', title: 'Potenzgesetze', run: info([
        { title: 'Gleiche Basis', html: `${T('x^a\\cdot x^b=x^{a+b}\\qquad\\dfrac{x^a}{x^b}=x^{a-b}')}<p>Beim Malnehmen werden die Hochzahlen addiert, beim Teilen abgezogen.</p>` },
        { title: 'Potenz einer Potenz, negative Hochzahl', html: `${T('(x^a)^b=x^{a\\cdot b}\\qquad x^{-n}=\\dfrac{1}{x^n}')}<p>Eine negative Hochzahl bedeutet: Kehrwert.</p>` },
        { title: 'Wurzeln als Potenz', html: `${T('\\sqrt[n]{x}=x^{\\frac1n}')}<p>Eine Wurzel ist eine Potenz mit Bruch in der Hochzahl. Dann gelten dieselben Gesetze: ${tex('\\dfrac{\\sqrt{x}\\cdot x^3}{x^2}=x^{\\frac12+3-2}=x^{\\frac32}')}.</p>` },
      ]) },
      { id: 'potenz', kind: 'Brücke', title: 'Potenzen vereinfachen', run: quiz([H(genPotenz), H(genPotenz), H(genPotenz), H(genPotenz)]) },
      { id: 'zins', kind: 'Benennen', title: 'Wachstum in Prozent', run: info([
        { title: 'Der Wachstumsfaktor', html: `${T('q=1+\\dfrac{p}{100}')}<p>Wächst etwas um 5 %, wird es mit ${tex('1{,}05')} malgenommen. Nimmt es um 5 % ab, mit ${tex('0{,}95')}.</p>` },
        { title: 'Jahr für Jahr', html: `${T('K_n=K_0\\cdot q^n')}<p>Jedes Jahr wird neu malgenommen – auch die Zinsen des Vorjahres wachsen mit. 1000 € bei 5 % nach 2 Jahren: ${tex('1000\\cdot 1{,}05^2=1102{,}50')} €.</p>` },
        { title: 'Beispiel: Zerfall und Wechsel', html: `<p><b>Abnahme:</b> Ein Auto (20 000 €) verliert jedes Jahr 15 % an Wert. Faktor ${tex('q=0{,}85')}. Nach 3 Jahren: ${tex('20\\,000\\cdot 0{,}85^3\\approx 12\\,282{,}50')} €.</p><p><b>Zinssatz wechselt:</b> 1000 € erst 2 Jahre zu 2 %, dann 2 Jahre zu 3 %: ${tex('1000\\cdot 1{,}02^2\\cdot 1{,}03^2\\approx 1103{,}76')} €.</p><p class="muted">Halbwertszeit: Nach dieser Zeit ist nur noch die Hälfte da – nach der doppelten Zeit ein Viertel.</p>` },
      ]) },
      { id: 'zinseszins', kind: 'Brücke', title: 'Zinseszins', run: quiz([genZinseszins, genZinseszins, genZinseszins, genZinseszins]) },
      { id: 'mix', kind: 'Festigen', title: 'Wachstum gemischt', run: mix(H(genPotenz), genZinseszins) },
    ] },
  { id: 'k10-koerper', jg: '10', area: 'mgeo', title: 'Trigonometrie und Körper', sub: 'Sinus, Kosinus, Zylinder, Kegel, Kugel',
    meta: { boss: ['Kegel-König', 'π', [genTrig, genKoerper, genFlaeche]], why: 'Mit Sinus und Kosinus berechnet man Höhen, die man nicht messen kann – Türme, Berge, Flugbahnen. Und fast jeder Gegenstand um dich herum ist aus Zylindern, Kegeln und Kugeln zusammengesetzt.',
      formeln: [['Sinus, Kosinus, Tangens', '\\sin\\alpha=\\dfrac{\\text{Gegenkathete}}{\\text{Hypotenuse}}\\qquad\\cos\\alpha=\\dfrac{\\text{Ankathete}}{\\text{Hypotenuse}}'], ['Zylinder und Kegel', 'V_Z=\\pi\\,r^2\\,h\\qquad V_K=\\tfrac13\\,\\pi\\,r^2\\,h'], ['Kugel', 'V=\\tfrac43\\,\\pi\\,r^3'], ['Tangens', '\\tan\\alpha=\\dfrac{\\text{Gegenkathete}}{\\text{Ankathete}}'], ['Kegelhöhe', 'h=\\sqrt{s^2-r^2}'], ['Liter', '1\\,\\text{dm}^3=1\\,\\text{l}\\qquad 1\\,\\text{m}^3=1000\\,\\text{l}']] },
    steps: [
      { id: 'kreis', kind: 'Entdecken', title: 'Dreieck im Kreis', run: kreis },
      { id: 'trig', kind: 'Benennen', title: 'Sinus, Kosinus, Tangens', run: info([
        { title: 'Seitenverhältnisse im rechtwinkligen Dreieck', html: `${T('\\sin\\alpha=\\dfrac{\\text{Gegenkathete}}{\\text{Hypotenuse}}\\qquad\\cos\\alpha=\\dfrac{\\text{Ankathete}}{\\text{Hypotenuse}}')}${T('\\tan\\alpha=\\dfrac{\\text{Gegenkathete}}{\\text{Ankathete}}')}<p>Die Gegenkathete liegt dem Winkel gegenüber, die Ankathete liegt an ihm an.</p>` },
        { title: 'Beispiel: Seite berechnen', html: `<p>Erst klären: Welche Seiten sind bekannt, welche gesucht – Gegenkathete, Ankathete, Hypotenuse? Dann die passende Formel umstellen.</p><p>${tex('\\alpha=30^\\circ')}, Gegenkathete 4 cm, Hypotenuse gesucht: ${tex('\\sin 30^\\circ=\\dfrac{4}{c}')}, also ${tex('c=\\dfrac{4}{\\sin 30^\\circ}=\\dfrac{4}{0{,}5}=8')} cm.</p><p class="muted">Höhe auf die Hypotenuse (rechter Winkel bei C): erst ${tex('b=c\\cdot\\cos\\alpha')}, dann im kleinen rechtwinkligen Dreieck ${tex('h=b\\cdot\\sin\\alpha')}.</p>` },
      ]) },
      { id: 'winkel', kind: 'Brücke', title: 'Dreiecke berechnen', run: quiz([genTrig, genTrig, genTrig, genTrig]) },
      { id: 'koerper', kind: 'Benennen', title: 'Körper', run: info([
        { title: 'Prisma und Zylinder', html: `${T('V=G\\cdot h\\qquad V_{\\text{Zylinder}}=\\pi\\,r^2\\,h')}<p>Grundfläche mal Höhe – beim Zylinder ist die Grundfläche ein Kreis.</p>` },
        { title: 'Pyramide, Kegel, Kugel', html: `${T('V=\\tfrac13\\,G\\,h\\qquad V_{\\text{Kugel}}=\\tfrac43\\,\\pi\\,r^3')}<p>Körper mit Spitze haben ein Drittel des Rauminhalts des passenden Prismas oder Zylinders.</p>` },
        { title: 'Beispiel: Kegel, Silo und Liter', html: `<p><b>Kegel mit Mantellinie s:</b> Radius, Höhe und s bilden ein rechtwinkliges Dreieck: ${tex('h=\\sqrt{s^2-r^2}')}. Mit r = 3 cm, s = 5 cm: h = 4 cm, ${tex('V=\\tfrac13\\pi\\cdot 9\\cdot 4=12\\pi\\approx 37{,}7')} cm³.</p><p><b>Zusammengesetzt:</b> Zylinder mit aufgesetztem Kegel – Rauminhalte addieren.</p><p><b>Liter:</b> ${tex('1\\,\\text{dm}^3=1\\,\\text{l}')}, ${tex('1\\,\\text{m}^3=1000\\,\\text{l}')}. Teilweise gefüllt: Rauminhalt mal Anteil.</p>` },
      ]) },
      { id: 'volumen', kind: 'Brücke', title: 'Rauminhalte', run: quiz([genKoerper, genKoerper, genKoerper, genKoerper]) },
      { id: 'mix', kind: 'Festigen', title: 'Geometrie gemischt', run: mix(genTrig, genKoerper, genFlaeche) },
    ] },
  { id: 'k10-log', jg: '10', area: 'malgebra', title: 'Logarithmus', sub: 'Hochzahlen suchen, Exponentialgleichungen',
    meta: { boss: ['Log-Luchs', 'log', [genLog, H(genPotenz)]], why: 'Wie lange dauert es, bis sich ein Guthaben verdoppelt? Wann ist ein Medikament abgebaut? Immer wenn die gesuchte Zahl in der Hochzahl steht, hilft der Logarithmus. Auch Lautstärke (Dezibel) und Erdbebenstärke werden so gemessen.',
      formeln: [['Bedeutung', '\\log_b a=x\\ \\Leftrightarrow\\ b^x=a'], ['Produkt', '\\log_b(u\\cdot v)=\\log_b u+\\log_b v'], ['Potenz', '\\log_b(u^n)=n\\cdot\\log_b u'], ['Taschenrechner', '\\log_b a=\\dfrac{\\lg a}{\\lg b}'], ['Quotient', '\\log_b\\dfrac uv=\\log_b u-\\log_b v']] },
    steps: [
      { id: 'idee', kind: 'Benennen', title: 'Die Frage nach der Hochzahl', run: info([
        { title: 'Was der Logarithmus bedeutet', html: `${T('\\log_b a=x\\ \\Leftrightarrow\\ b^x=a')}<p>${tex('\\log_2 8')} fragt: 2 hoch wie viel ergibt 8? Antwort: 3, denn ${tex('2^3=8')}.</p><p class="muted">${tex('\\lg')} ist die Abkürzung für die Basis 10: ${tex('\\lg 1000=3')}.</p>` },
        { title: 'Besondere Werte', html: `${T('\\log_b 1=0\\qquad\\log_b b=1\\qquad\\log_b\\dfrac1b=-1')}<p>Denn ${tex('b^0=1')}, ${tex('b^1=b')} und ${tex('b^{-1}=\\tfrac1b')}.</p>` },
        { title: 'Beispiel: Brüche', html: `${T('\\log_5\\dfrac{1}{125}=\\log_5 5^{-3}=-3')}<p>Schreibe die Zahl als Potenz der Basis. Ein Bruch mit 1 im Zähler ergibt eine negative Hochzahl.</p>` },
      ]) },
      { id: 'werte', kind: 'Brücke', title: 'Logarithmen berechnen', run: quiz([genLog, genLog, genLog, genLog]) },
      { id: 'gesetze', kind: 'Benennen', title: 'Rechengesetze', run: info([
        { title: 'Aus Mal wird Plus', html: `${T('\\log_b(u\\cdot v)=\\log_b u+\\log_b v')}${T('\\log_b(u^n)=n\\cdot\\log_b u')}<p>Das sind die Potenzgesetze, rückwärts gelesen: Beim Malnehmen werden Hochzahlen addiert.</p>` },
        { title: 'Exponentialgleichungen', html: `${T('2^x=32\\ \\Rightarrow\\ x=\\log_2 32=5')}<p>Steht die Unbekannte in der Hochzahl, ist die Lösung ein Logarithmus.</p>` },
        { title: 'Mit dem Taschenrechner', html: `${T('\\log_b a=\\dfrac{\\lg a}{\\lg b}')}<p>Der Taschenrechner kennt ${tex('\\lg')} (Basis 10). Jede andere Basis rechnest du so um.</p><p><b>Verdopplungszeit:</b> 5 % Zinsen pro Jahr, wann verdoppelt? ${tex('K\\cdot 1{,}05^x=2K')} – das Kapital kürzt sich weg: ${tex('1{,}05^x=2')}, also ${tex('x=\\dfrac{\\lg 2}{\\lg 1{,}05}\\approx 14{,}2')} Jahre.</p>` },
        { title: 'Wurzeln in Hochzahlen', html: `${T('\\sqrt[4]{x}=x^{\\frac14}')}<p>So lassen sich auch Terme mit Wurzeln mit den Potenzgesetzen vereinfachen: ${tex('\\dfrac{\\sqrt[4]{x}\\cdot x^2}{x^3}=x^{\\frac14+2-3}=x^{-\\frac34}')}.</p>` },
      ]) },
      { id: 'rechnen', kind: 'Brücke', title: 'Gesetze anwenden', run: quiz([genLog, genLog, H(genPotenz), genLog]) },
      { id: 'mix', kind: 'Festigen', title: 'Logarithmus gemischt', run: mix(genLog, H(genPotenz)) },
    ] },
  { id: 'k10-daten', jg: '9', area: 'mdaten', title: 'Baumdiagramm und Vierfeldertafel', sub: 'Mehrstufige Versuche, bedingte Wahrscheinlichkeit',
    meta: { boss: ['Tafel-Tiger', '▦', [H(genBaum), H(genVierfelder), H(genBedingt)]], why: 'Ein positiver Schnelltest heißt nicht sicher „krank“ – wie wahrscheinlich es wirklich ist, zeigt die Vierfeldertafel. Mit Baumdiagrammen berechnest du Chancen, wenn mehrere Zufälle hintereinander passieren.',
      formeln: [['Pfadregel', '\\text{entlang des Pfads malnehmen}'], ['Summenregel', '\\text{passende Pfade addieren}'], ['Bedingt', 'P_B(A)=\\dfrac{P(A\\cap B)}{P(B)}'], ['Ohne Zurücklegen', '\\text{2. Stufe: eine Kugel weniger}'], ['Vierfeldertafel', 'P(A\\cap B)=P(A)+P(B)-P(A\\cup B)']] },
    steps: [
      { id: 'baum', kind: 'Benennen', title: 'Baumdiagramm', run: info([
        { title: 'Pfadregel', html: `<p>Passieren zwei Zufälle nacheinander, zeichnest du einen Baum. Entlang eines Pfads werden die Wahrscheinlichkeiten <b>malgenommen</b>.</p>${T('P(\\text{zweimal Sechs})=\\tfrac16\\cdot\\tfrac16=\\tfrac1{36}')}` },
        { title: 'Summenregel', html: `<p>Gehören mehrere Pfade zum Ereignis, werden ihre Wahrscheinlichkeiten <b>addiert</b>. Beim Ziehen ohne Zurücklegen ändern sich die Wahrscheinlichkeiten in der zweiten Stufe.</p>` },
        { title: 'Beispiel: ohne Zurücklegen', html: `<p>3 rote und 2 blaue Kugeln, zweimal ohne Zurücklegen. Nach einer roten Kugel sind nur noch 4 Kugeln da, davon 2 rote:</p>${T('P(\\text{rot, rot})=\\tfrac35\\cdot\\tfrac24=\\tfrac{6}{20}=\\tfrac{3}{10}')}<p><b>Genau eine rote:</b> zwei Pfade addieren: ${tex('\\tfrac35\\cdot\\tfrac24+\\tfrac25\\cdot\\tfrac34=\\tfrac{6}{20}+\\tfrac{6}{20}=\\tfrac35')}.</p>` },
      ]) },
      { id: 'pfade', kind: 'Brücke', title: 'Pfade berechnen', run: quiz([H(genBaum), H(genBaum), H(genBaum), H(genBaum)]) },
      { id: 'tafel', kind: 'Benennen', title: 'Vierfeldertafel', run: info([
        { title: 'Zwei Merkmale auf einen Blick', html: `<p>Eine Vierfeldertafel ordnet eine Gruppe nach zwei Merkmalen, zum Beispiel „Sportverein ja/nein“ und „Klasse 9/10“. Zeilen und Spalten ergeben am Rand jeweils die Summen – so lassen sich fehlende Felder ausrechnen.</p>` },
        { title: 'Bedingte Wahrscheinlichkeit', html: `${T('P_B(A)=\\dfrac{P(A\\cap B)}{P(B)}')}<p>„Unter der Bedingung B“ heißt: Du schaust nur noch auf die Zeile oder Spalte von B – sie ist das neue Ganze.</p>` },
        { title: 'Beispiel: Tafel ergänzen', html: `<p>Jede Zeile und jede Spalte ergibt ihre Randsumme – ein fehlendes Feld ist Summe minus bekanntes Feld. Bei Anteilen ist die Gesamtsumme 1.</p><p>Gegeben ${tex('P(A)=0{,}4')}, ${tex('P(B)=0{,}5')} und ${tex('P(\\overline A\\cap\\overline B)=0{,}3')}. Mindestens eins von beiden: ${tex('1-0{,}3=0{,}7')}. Beides: ${tex('P(A\\cap B)=0{,}4+0{,}5-0{,}7=0{,}2')}. Also ${tex('P_B(A)=\\dfrac{0{,}2}{0{,}5}=40\\,\\%')}.</p>` },
        { title: 'Beispiel: Test positiv', html: `<p>1 % sind krank. Der Test erkennt 90 % der Kranken und schlägt bei 5 % der Gesunden fälschlich an. Denk dir 10 000 Personen: 100 krank, davon 90 positiv. 9900 gesund, davon 495 positiv.</p>${T('P_{\\text{positiv}}(\\text{krank})=\\dfrac{90}{90+495}\\approx 15{,}4\\,\\%')}<p class="muted">Bei drei Maschinen genauso: Für jede Maschine Anteil mal Ausschussquote, dann den gesuchten Teil durch die Summe teilen.</p>` },
      ]) },
      { id: 'felder', kind: 'Brücke', title: 'Tafeln ausfüllen', run: quiz([H(genVierfelder), H(genVierfelder), H(genVierfelder)]) },
      { id: 'bedingt', kind: 'Brücke', title: 'Unter einer Bedingung', run: quiz([H(genBedingt), H(genBedingt), H(genBedingt)]) },
      { id: 'mix', kind: 'Festigen', title: 'Zufall gemischt', run: mix(H(genBaum), H(genVierfelder), H(genBedingt)) },
    ] },
  { id: 'k10-sinussatz', jg: '10', area: 'mgeo', title: 'Sinus- und Kosinussatz', sub: 'Rechnen in beliebigen Dreiecken',
    meta: { boss: ['Dreiecks-Dachs', '△', [genSinussatz, genTrig]], why: 'Vermesser, Seeleute und Navigations-Apps rechnen mit Dreiecken, die keinen rechten Winkel haben. Mit Sinus- und Kosinussatz bestimmst du Entfernungen, die sich nicht direkt messen lassen – etwa die Breite eines Flusses.',
      formeln: [['Sinussatz', '\\dfrac{a}{\\sin\\alpha}=\\dfrac{b}{\\sin\\beta}=\\dfrac{c}{\\sin\\gamma}'], ['Kosinussatz', 'c^2=a^2+b^2-2ab\\cdot\\cos\\gamma'], ['Flächeninhalt', 'A=\\tfrac12\\cdot a\\cdot b\\cdot\\sin\\gamma'], ['Winkel aus drei Seiten', '\\cos\\gamma=\\dfrac{a^2+b^2-c^2}{2ab}'], ['Winkelsumme', '\\alpha+\\beta+\\gamma=180^\\circ']] },
    steps: [
      { id: 'sinus', kind: 'Benennen', title: 'Der Sinussatz', run: info([
        { title: 'Seite und Winkel gegenüber', html: `${T('\\dfrac{a}{\\sin\\alpha}=\\dfrac{b}{\\sin\\beta}=\\dfrac{c}{\\sin\\gamma}')}<p>Jede Seite geteilt durch den Sinus des Winkels gegenüber ergibt dieselbe Zahl. Du brauchst also ein bekanntes Paar aus Seite und gegenüberliegendem Winkel.</p>` },
        { title: 'Beispiel: Seite mit dem Sinussatz', html: `<p>Gegeben: ${tex('c=10')} cm, ${tex('\\alpha=40^\\circ')}, ${tex('\\beta=60^\\circ')}. Dritter Winkel: ${tex('\\gamma=180^\\circ-40^\\circ-60^\\circ=80^\\circ')}.</p>${T('a=\\dfrac{c\\cdot\\sin\\alpha}{\\sin\\gamma}=\\dfrac{10\\cdot 0{,}643}{0{,}985}\\approx 6{,}53\\,\\text{cm}')}<p class="muted">Abstand eines Punkts C von der Seite AB: Ist ${tex('b')} bekannt, gilt im rechtwinkligen Teildreieck ${tex('h=b\\cdot\\sin\\alpha')}.</p>` },
      ]) },
      { id: 'sinueben', kind: 'Brücke', title: 'Mit dem Sinussatz rechnen', run: quiz([genSinussatz, genSinussatz, genSinussatz]) },
      { id: 'kosinus', kind: 'Benennen', title: 'Der Kosinussatz', run: info([
        { title: 'Pythagoras mit Korrektur', html: `${T('c^2=a^2+b^2-2ab\\cdot\\cos\\gamma')}<p>Bei 90° ist ${tex('\\cos\\gamma=0')} – dann bleibt der Satz des Pythagoras übrig. Bei spitzem Winkel wird ${tex('c')} kürzer, bei stumpfem länger.</p>` },
        { title: 'Welcher Satz wann?', html: `<p><b>Sinussatz:</b> wenn ein Paar aus Seite und Winkel gegenüber bekannt ist.</p><p><b>Kosinussatz:</b> bei zwei Seiten mit eingeschlossenem Winkel oder bei drei Seiten.</p>` },
        { title: 'Beispiel: Kosinussatz', html: `<p>a = 3 cm, b = 8 cm, eingeschlossener Winkel ${tex('\\gamma=60^\\circ')} (${tex('\\cos 60^\\circ=0{,}5')}):</p>${T('c^2=9+64-2\\cdot 3\\cdot 8\\cdot 0{,}5=49\\ \\Rightarrow\\ c=7\\,\\text{cm}')}<p class="muted">Bei drei Seiten nach dem Winkel umstellen: ${tex('\\cos\\gamma=\\dfrac{a^2+b^2-c^2}{2ab}')}.</p>` },
      ]) },
      { id: 'kosueben', kind: 'Brücke', title: 'Mit dem Kosinussatz rechnen', run: quiz([genSinussatz, genSinussatz, genSinussatz, genSinussatz]) },
      { id: 'mix', kind: 'Festigen', title: 'Dreiecke gemischt', run: mix(genSinussatz, genTrig) },
    ] },
  { id: 'k10-funktionen', jg: '10', area: 'malgebra', title: 'Exponential- und Sinusfunktion', sub: 'Wachstum mit Faktor, Schwingungen',
    meta: { boss: ['Wellen-Wolf', '∿', [genExpFunktion, genSinusFkt]], why: 'Bakterien, Zinsen und Internet-Hypes wachsen exponentiell – erst unauffällig, dann rasend. Töne, Wechselstrom, Ebbe und Flut schwingen wie eine Sinuskurve. Beide Funktionen brauchst du in der Oberstufe ständig.',
      formeln: [['Exponentialfunktion', 'f(x)=a\\cdot b^x'], ['Sinusfunktion', 'f(x)=a\\cdot\\sin(b\\,x)+d'], ['Periode', 'p=\\dfrac{2\\pi}{b}'], ['Prozent pro Schritt', 'b=1\\pm\\dfrac{p}{100}'], ['Verdopplungszeit', 'b^x=2\\ \\Rightarrow\\ x=\\dfrac{\\lg 2}{\\lg b}'], ['Größter Wert', 'd+a\\qquad\\text{kleinster Wert: }d-a'], ['Zweite Lösung', '\\sin x=s:\\quad x_2=180^\\circ-x_1']] },
    steps: [
      { id: 'exp', kind: 'Benennen', title: 'Exponentialfunktionen', run: info([
        { title: 'Startwert und Faktor', html: `${T('f(x)=a\\cdot b^x')}<p>${tex('a')} ist der Startwert (für ${tex('x=0')}), ${tex('b')} der Wachstumsfaktor: In jedem Schritt wird mit ${tex('b')} malgenommen. Ist ${tex('b')} größer als 1, wächst die Funktion; liegt ${tex('b')} zwischen 0 und 1, fällt sie.</p>` },
        { title: 'Linear oder exponentiell?', html: `<p><b>Linear:</b> In jedem Schritt kommt derselbe <b>Betrag</b> dazu (5, 8, 11, 14).</p><p><b>Exponentiell:</b> In jedem Schritt wird mit demselben <b>Faktor</b> malgenommen (5, 10, 20, 40). „Plus 20 %“ bedeutet Faktor 1,2.</p>` },
        { title: 'Prozent pro Schritt', html: `${T('b=1+\\dfrac{p}{100}\\qquad b=1-\\dfrac{p}{100}')}<p>${tex('p')} ist die Änderung in Prozent pro Schritt. Wachstum um 7 % pro Stunde: ${tex('b=1{,}07')}. Abnahme um 20 % pro Jahr: ${tex('b=0{,}8')}. Start 500, plus 10 % pro Tag: ${tex('f(x)=500\\cdot 1{,}1^x')}.</p><p class="muted">Den Faktor aus einer Wertereihe bekommst du durch Teilen: 4, 12, 36 – also ${tex('12:4=3')}.</p>` },
        { title: 'Verdopplungs- und Halbwertszeit', html: `<p>Wann hat sich der Bestand verdreifacht? Gesucht ist ${tex('x')} mit ${tex('a\\cdot b^x=3a')} – der Startwert kürzt sich weg, es bleibt ${tex('b^x=3')}. Die Lösung liefert der Logarithmus (Einheit „Logarithmus“):</p>${T('1{,}07^x=3\\ \\Rightarrow\\ x=\\dfrac{\\lg 3}{\\lg 1{,}07}\\approx 16{,}2')}<p><b>Halbwertszeit</b> genauso mit ${tex('b^x=0{,}5')}: Bei 10 % Abnahme pro Jahr ist ${tex('x=\\dfrac{\\lg 0{,}5}{\\lg 0{,}9}\\approx 6{,}6')} Jahre.</p>` },
      ]) },
      { id: 'expueben', kind: 'Brücke', title: 'Wachstum mit Faktor', run: quiz([genExpFunktion, genExpFunktion, genExpFunktion, genExpFunktion]) },
      { id: 'sinus', kind: 'Benennen', title: 'Die Sinusfunktion', run: info([
        { title: 'Amplitude und Mittellinie', html: `${T('f(x)=a\\cdot\\sin(b\\,x)+d')}<p>${tex('a')} ist die <b>Amplitude</b>: so weit schlägt die Kurve nach oben und unten aus. ${tex('d')} verschiebt die Mittellinie.</p>` },
        { title: 'Periode', html: `${T('p=\\dfrac{2\\pi}{b}')}<p>Nach einer Periode wiederholt sich alles. Ein größeres ${tex('b')} staucht die Kurve: ${tex('\\sin(2x)')} schwingt doppelt so schnell.</p>` },
        { title: 'Größter Wert und Gleichungen', html: `<p>Der Sinus pendelt zwischen −1 und 1. Darum ist der größte Wert von ${tex('a\\cdot\\sin(b\\,x)+d')} gleich ${tex('d+a')}, der kleinste ${tex('d-a')}. Periode von ${tex('\\sin(0{,}5x)')}: ${tex('2\\pi:0{,}5=4\\pi')}.</p><p><b>Gleichung:</b> ${tex('2\\sin(x)+1=2')} ergibt ${tex('\\sin(x)=0{,}5')}. Der Taschenrechner (${tex('\\sin^{-1}')}) liefert ${tex('x_1=30^\\circ')}. Die zweite Lösung zwischen 0° und 360° ist ${tex('x_2=180^\\circ-30^\\circ=150^\\circ')}.</p>` },
      ]) },
      { id: 'sinueben', kind: 'Brücke', title: 'Schwingungen lesen', run: quiz([genSinusFkt, genSinusFkt, genSinusFkt, genSinusFkt]) },
      { id: 'mix', kind: 'Festigen', title: 'Funktionen gemischt', run: mix(genExpFunktion, genSinusFkt) },
    ] },
];
