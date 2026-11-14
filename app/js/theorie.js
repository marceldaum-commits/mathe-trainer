// Theorie zum Nachlesen: jede Einheit als Kapitel in zwei Längen.
// „Kurz“ entsteht aus den Erklär-Karten und Formeln der Einheit (immer aktuell, für alle).
// „Ausführlich“ ist eigens geschriebener Text mit Herleitung und durchgerechnetem Beispiel (Pro) – wächst Thema für Thema.
import { $, h, tex, esc, ICON, sfx, drucken } from './ui.js';
import { store } from './store.js';
import { UNITS, AREAS, unitExtra, NICHT_TEXT } from './units.js';
import { CONFIG } from './config.js';
import { premiumOn, premiumBereit } from './api.js';
import { merkbilderEinsetzen, hatMerkbild } from './merkbild.js';
import { marke } from './pro.js';

const D = (s) => `<div class="t-formel">${tex(s, true)}</div>`;
const t = (s) => tex(s);

/** Ausführliche Kapitel: Abschnitte mit Überschrift. Eigene Texte, keine fremden Quellen. */
export const LANG = {
  regeln: [
    ['Worum es geht', `<p>Die Ableitung ${t("f'(x)")} sagt, wie steil der Graph von ${t('f')} an der Stelle ${t('x')} ist. Man könnte sie jedes Mal über den Grenzwert des Differenzenquotienten ausrechnen – das ist mühsam. Die Ableitungsregeln sind die Abkürzung: Mit vier Regeln lässt sich fast jede Funktion der Oberstufe ableiten.</p>`],
    ['Potenzregel, Faktor und Summe', `${D("(x^n)'=n\\cdot x^{n-1}")}<p>Der Exponent kommt als Faktor nach vorn und wird um 1 kleiner. Ein Zahlenfaktor bleibt einfach stehen, eine Summe wird Summand für Summand abgeleitet, eine einzelne Zahl fällt weg (sie ändert die Steigung nicht).</p>${D("f(x)=4x^3-5x+7\\quad\\Rightarrow\\quad f'(x)=12x^2-5")}`],
    ['Kettenregel: innen und außen', `<p>Steckt eine Funktion in einer anderen, etwa ${t('(2x+1)^3')}, dann gibt es ein <b>Außen</b> („etwas hoch 3“) und ein <b>Innen</b> (${t('2x+1')}).</p>${D("f(x)=u(v(x))\\quad\\Rightarrow\\quad f'(x)=u'(v(x))\\cdot v'(x)")}<p>In Worten: äußere Ableitung (das Innere bleibt stehen) mal innere Ableitung.</p>${D("\\bigl((2x+1)^3\\bigr)'=3\\,(2x+1)^2\\cdot 2=6\\,(2x+1)^2")}<p>Der häufigste Fehler: die innere Ableitung vergessen. Faustregel: Steht in der Klammer mehr als nur ${t('x')}, immer nachableiten.</p>`],
    ['e-Funktion', `${D("(e^x)'=e^x\\qquad (e^{kx})'=k\\cdot e^{kx}")}<p>Die e-Funktion ist ihre eigene Ableitung. Steht im Exponenten mehr als ${t('x')}, greift wieder die Kettenregel: Der Faktor ${t('k')} kommt nach vorn. Achtung: Die Potenzregel gilt hier <b>nicht</b> – ${t('x')} steht im Exponenten, nicht in der Basis.</p>`],
    ['Produktregel', `${D("(u\\cdot v)'=u'\\cdot v+u\\cdot v'")}<p>Zwei Faktoren, die beide ${t('x')} enthalten, darf man nicht einzeln ableiten und malnehmen. Stattdessen: erst den einen ableiten und den anderen stehen lassen, dann umgekehrt, und beides addieren.</p>${D("f(x)=(x+2)\\,e^{x}\\quad\\Rightarrow\\quad f'(x)=1\\cdot e^{x}+(x+2)\\cdot e^{x}=(x+3)\\,e^{x}")}`],
    ['So gehst du vor', `<ol><li>Welche Bauart hat die Funktion: Summe, Produkt, Verkettung?</li><li>Die passende Regel hinschreiben und ${t('u')}, ${t('v')} benennen.</li><li>Einzeln ableiten, einsetzen, zusammenfassen.</li><li>Probe mit einem Zahlenwert oder am Graphen: Ist die Ableitung dort positiv, wo der Graph steigt?</li></ol>`],
  ],
  extrema: [
    ['Worum es geht', `<p>Hoch- und Tiefpunkte sind die Stellen, an denen ein Graph „umkehrt“. In Anwendungen sind das der größte Gewinn, der geringste Verbrauch, die höchste Flugbahn. Gefunden werden sie mit der Ableitung.</p>`],
    ['Notwendige Bedingung', `${D("f'(x_0)=0")}<p>An einem Hoch- oder Tiefpunkt ist die Tangente waagerecht. Deshalb sucht man zuerst alle Stellen mit ${t("f'(x)=0")}. Das sind die <b>Kandidaten</b> – mehr nicht: Auch an einem Sattelpunkt ist die Tangente waagerecht.</p>`],
    ['Hinreichende Bedingung', `${D("f'(x_0)=0\\ \\text{und}\\ f''(x_0)<0:\\ \\text{Hochpunkt}\\qquad f'(x_0)=0\\ \\text{und}\\ f''(x_0)>0:\\ \\text{Tiefpunkt}")}<p>Die zweite Ableitung beschreibt die Krümmung. Ist sie negativ, ist der Graph dort nach rechts gekrümmt wie ein Berg – also ein Hochpunkt. Ist ${t("f''(x_0)=0")}, entscheidet der <b>Vorzeichenwechsel</b> von ${t("f'")}: von Plus nach Minus ist es ein Hochpunkt, von Minus nach Plus ein Tiefpunkt, ohne Wechsel ein Sattelpunkt.</p>`],
    ['Durchgerechnetes Beispiel', `${D("f(x)=2x^3-3x^2-12x+4")}<p>Ableiten: ${t("f'(x)=6x^2-6x-12=6\\,(x^2-x-2)=6\\,(x+1)(x-2)")}. Also ${t('x_1=-1')} und ${t('x_2=2')}.</p><p>Zweite Ableitung: ${t("f''(x)=12x-6")}. ${t("f''(-1)=-18<0")}: Hochpunkt. ${t("f''(2)=18>0")}: Tiefpunkt.</p><p>Die y-Werte kommen aus ${t('f')}, nicht aus ${t("f'")}: ${t('f(-1)=11')} und ${t('f(2)=-16')}. Also ${t('H(-1\\mid 11)')} und ${t('T(2\\mid -16)')}.</p>`],
    ['Typische Fehler', `<ul><li>y-Wert mit ${t("f'")} statt mit ${t('f')} berechnet.</li><li>Nur die notwendige Bedingung geprüft und den Sattelpunkt übersehen.</li><li>Bei einem Intervall die Randwerte vergessen: Das größte ${t('f')} kann am Rand liegen.</li></ul>`],
  ],
  integral: [
    ['Worum es geht', `<p>Die Ableitung macht aus einem Bestand eine Änderungsrate. Das Integral geht den Weg zurück: Aus der Änderungsrate wird wieder der Bestand – aus der Geschwindigkeit der Weg, aus dem Zufluss die Wassermenge. Geometrisch ist das Integral eine (mit Vorzeichen gezählte) Fläche zwischen Graph und x-Achse.</p>`],
    ['Stammfunktion', `${D("F'(x)=f(x)\\qquad \\int x^n\\,dx=\\frac{1}{n+1}\\,x^{n+1}+C")}<p>Eine Stammfunktion ${t('F')} ist eine Funktion, deren Ableitung ${t('f')} ist. Beim „Aufleiten“ wird der Exponent um 1 größer und durch den neuen Exponenten geteilt. Die Probe ist immer möglich: ${t('F')} ableiten, es muss ${t('f')} herauskommen.</p>`],
    ['Hauptsatz', `${D("\\int_a^b f(x)\\,dx=F(b)-F(a)")}<p>Obere Grenze einsetzen, untere Grenze einsetzen, abziehen. Die Konstante ${t('C')} fällt dabei weg.</p>${D("\\int_1^3 (2x+1)\\,dx=\\bigl[x^2+x\\bigr]_1^3=(9+3)-(1+1)=10")}`],
    ['Fläche ist nicht gleich Integral', `<p>Liegt der Graph unter der x-Achse, zählt das Integral die Fläche negativ. Wer eine echte <b>Fläche</b> sucht, muss deshalb an den Nullstellen aufteilen und die Beträge addieren.</p>${D("A=\\left|\\int_a^{x_0} f(x)\\,dx\\right|+\\left|\\int_{x_0}^{b} f(x)\\,dx\\right|")}<p>Zwischen zwei Graphen gilt: obere Funktion minus untere Funktion integrieren, zwischen den Schnittstellen.</p>`],
    ['So gehst du vor', `<ol><li>Ist eine Fläche oder ein Integral (Bilanz) gefragt?</li><li>Für Flächen: Nullstellen bzw. Schnittstellen bestimmen.</li><li>Stammfunktion bilden und mit der Ableitung prüfen.</li><li>Grenzen einsetzen – Klammern setzen, besonders bei negativen Zahlen.</li><li>Einheit und Bedeutung im Sachzusammenhang nennen.</li></ol>`],
  ],
  's-labor': [
    ['Worum es geht', `<p>Ein Versuch mit genau zwei Ausgängen (Treffer oder kein Treffer) heißt Bernoulli-Versuch. Wird er ${t('n')}-mal unabhängig mit derselben Trefferwahrscheinlichkeit ${t('p')} wiederholt, zählt die Zufallsgröße ${t('X')} die Treffer – sie ist binomialverteilt.</p>`],
    ['Die Formel und woher sie kommt', `${D("P(X=k)=\\binom{n}{k}\\cdot p^{k}\\cdot (1-p)^{n-k}")}<p>Ein einzelner Pfad mit ${t('k')} Treffern und ${t('n-k')} Nieten hat die Wahrscheinlichkeit ${t('p^k(1-p)^{n-k}')} (Pfadregel). Solche Pfade gibt es ${t('\\binom{n}{k}')} viele, denn so viele Möglichkeiten gibt es, die ${t('k')} Treffer auf ${t('n')} Plätze zu verteilen.</p>`],
    ['Erwartungswert und Streuung', `${D("\\mu=n\\cdot p\\qquad \\sigma=\\sqrt{n\\cdot p\\cdot(1-p)}")}<p>${t('\\mu')} ist die Trefferzahl, die man auf lange Sicht im Mittel erwartet. ${t('\\sigma')} sagt, wie stark die Trefferzahl typischerweise davon abweicht.</p>`],
    ['Mindestens, höchstens, genau', `<p>„Höchstens ${t('k')}“ ist ${t('P(X\\le k)')} (kumuliert, aus Tabelle oder Rechner). „Mindestens ${t('k')}“ rechnet man über das Gegenereignis:</p>${D("P(X\\ge k)=1-P(X\\le k-1)\\qquad P(X\\ge 1)=1-(1-p)^n")}`],
    ['Durchgerechnetes Beispiel', `<p>Ein Basketballer trifft mit ${t('p=0{,}8')}. Er wirft 5-mal. Wahrscheinlichkeit für genau 4 Treffer:</p>${D("P(X=4)=\\binom{5}{4}\\cdot 0{,}8^4\\cdot 0{,}2^1=5\\cdot 0{,}4096\\cdot 0{,}2\\approx 0{,}41")}<p>Mindestens ein Treffer: ${t('1-0{,}2^5\\approx 0{,}9997')}. Erwartete Trefferzahl: ${t('\\mu=5\\cdot 0{,}8=4')}.</p>`],
    ['Wann passt das Modell nicht?', `<p>Wenn sich die Wahrscheinlichkeit von Zug zu Zug ändert (Ziehen ohne Zurücklegen aus einer kleinen Menge) oder wenn die Versuche einander beeinflussen. Im Abitur wird oft gefragt, warum die Binomialverteilung trotzdem als Näherung taugt: bei großer Grundmenge ändert sich ${t('p')} kaum.</p>`],
  ],
  's-bedingt': [
    ['Worum es geht', `<p>Viele Fragen haben eine Vorbedingung: „Wie wahrscheinlich ist die Krankheit, <b>wenn</b> der Test positiv ist?“ Das ist eine bedingte Wahrscheinlichkeit. Sie bezieht sich nicht mehr auf alle, sondern nur noch auf die Gruppe, für die die Bedingung gilt.</p>`],
    ['Definition', `${D("P_B(A)=\\frac{P(A\\cap B)}{P(B)}")}<p>Gelesen: Wahrscheinlichkeit von ${t('A')} unter der Bedingung ${t('B')}. Im Nenner steht die neue Grundgesamtheit ${t('B')}, im Zähler der Teil davon, der auch zu ${t('A')} gehört.</p>`],
    ['Vierfeldertafel als Werkzeug', `<p>Mit absoluten Zahlen wird es anschaulich. 1000 Personen, 50 krank. Der Test erkennt 45 Kranke und schlägt bei 95 Gesunden fälschlich an.</p><table class="t-tafel"><tr><th></th><th>krank</th><th>gesund</th><th>gesamt</th></tr><tr><th>Test positiv</th><td>45</td><td>95</td><td>140</td></tr><tr><th>Test negativ</th><td>5</td><td>855</td><td>860</td></tr><tr><th>gesamt</th><td>50</td><td>950</td><td>1000</td></tr></table><p>Von 140 positiv Getesteten sind nur 45 krank:</p>${D("P_{\\text{positiv}}(\\text{krank})=\\frac{45}{140}\\approx 32\\,\\%")}<p>Obwohl der Test 90 % der Kranken erkennt, ist ein positives Ergebnis hier meist ein Fehlalarm – weil die Krankheit selten ist.</p>`],
    ['Nicht verwechseln', `<p>${t('P_B(A)')} und ${t('P_A(B)')} sind verschiedene Dinge. „90 % der Kranken haben einen positiven Test“ ist nicht dasselbe wie „90 % der positiv Getesteten sind krank“. Frage dich immer: <b>Welche Gruppe ist die Grundgesamtheit?</b></p>`],
    ['Unabhängigkeit', `${D("A,\\ B\\ \\text{unabhängig}\\iff P(A\\cap B)=P(A)\\cdot P(B)\\iff P_B(A)=P(A)")}<p>Ändert die Bedingung nichts an der Wahrscheinlichkeit, sind die Ereignisse unabhängig.</p>`],
  ],
  steigung: [
    ['Worum es geht', `<p>Eine Gerade hat überall dieselbe Steigung. Eine Kurve nicht: Sie ist mal steil, mal flach. Die Ableitung beantwortet die Frage „Wie steil ist der Graph genau an dieser einen Stelle?“ – und damit auch „Wie schnell ändert sich die Größe gerade jetzt?“.</p>`],
    ['Von der Sekante zur Tangente', `<p>Zwischen zwei Punkten des Graphen lässt sich die Steigung leicht ausrechnen – das ist die <b>mittlere Änderungsrate</b> (Steigung der Sekante):</p>${D("m=\\frac{f(x_0+h)-f(x_0)}{h}")}<p>Rückt der zweite Punkt immer näher an den ersten (${t('h\\to 0')}), wird aus der Sekante die <b>Tangente</b>. Ihre Steigung ist die <b>momentane Änderungsrate</b>:</p>${D("f'(x_0)=\\lim_{h\\to 0}\\frac{f(x_0+h)-f(x_0)}{h}")}`],
    ['Durchgerechnetes Beispiel', `<p>${t('f(x)=x^2')} an der Stelle ${t('x_0=3')}:</p>${D("\\frac{(3+h)^2-3^2}{h}=\\frac{6h+h^2}{h}=6+h\\ \\xrightarrow{h\\to 0}\\ 6")}<p>Die Tangente bei ${t('x=3')} hat also die Steigung 6. Mit der Potenzregel geht es schneller: ${t("f'(x)=2x")}, also ${t("f'(3)=6")}.</p>`],
    ['Was die Ableitung im Sachzusammenhang bedeutet', `<p>Beschreibt ${t('f(t)')} einen Weg, ist ${t("f'(t)")} die Geschwindigkeit. Beschreibt ${t('f(t)')} einen Wasserstand, ist ${t("f'(t)")} die Zu- oder Abflussrate. Die Einheit der Ableitung ist immer „Einheit von ${t('f')} pro Einheit von ${t('x')}“ – zum Beispiel Meter pro Sekunde.</p>`],
    ['Vorzeichen lesen', `<ul><li>${t("f'(x)>0")}: Der Graph steigt.</li><li>${t("f'(x)<0")}: Der Graph fällt.</li><li>${t("f'(x)=0")}: waagerechte Tangente – Kandidat für Hoch-, Tief- oder Sattelpunkt.</li></ul>`],
  ],
  kurve: [
    ['Worum es geht', `<p>Eine Kurvendiskussion ist ein Steckbrief des Graphen: Wo steigt er, wo fällt er, wo dreht er seine Krümmung, was passiert weit außen? Jede dieser Fragen hat ein festes Werkzeug.</p>`],
    ['Monotonie', `<p>Das Vorzeichen von ${t("f'")} entscheidet. Man bestimmt die Nullstellen von ${t("f'")} und prüft in jedem Abschnitt dazwischen ein Vorzeichen.</p>${D("f'(x)>0\\ \\Rightarrow\\ \\text{streng monoton steigend}\\qquad f'(x)<0\\ \\Rightarrow\\ \\text{streng monoton fallend}")}`],
    ['Krümmung und Wendepunkte', `${D("f''(x_W)=0\\ \\text{und}\\ f'''(x_W)\\ne 0\\ \\Rightarrow\\ \\text{Wendestelle}")}<p>${t("f''>0")} heißt Linkskurve, ${t("f''<0")} Rechtskurve. An der Wendestelle wechselt die Krümmung – und die Steigung ist dort am größten oder am kleinsten. Deshalb ist der Wendepunkt in Anwendungen der Moment der stärksten Zu- oder Abnahme.</p>`],
    ['Symmetrie', `${D("f(-x)=f(x):\\ \\text{achsensymmetrisch zur y-Achse}\\qquad f(-x)=-f(x):\\ \\text{punktsymmetrisch zum Ursprung}")}<p>Bei ganzrationalen Funktionen reicht ein Blick auf die Exponenten: nur gerade Exponenten (und Zahlen) → achsensymmetrisch, nur ungerade → punktsymmetrisch, gemischt → keine dieser Symmetrien.</p>`],
    ['Verhalten im Unendlichen', `<p>Für sehr große ${t('|x|')} bestimmt bei ganzrationalen Funktionen allein der Summand mit dem höchsten Exponenten das Verhalten. Bei ${t('f(x)=-2x^3+5x')} gilt: für ${t('x\\to\\infty')} geht ${t('f(x)\\to -\\infty')}, für ${t('x\\to -\\infty')} geht ${t('f(x)\\to\\infty')}.</p><p>Bei e-Funktionen gewinnt ${t('e^x')} gegen jede Potenz: ${t('x^2\\cdot e^{-x}\\to 0')} für ${t('x\\to\\infty')}.</p>`],
    ['Reihenfolge für die Prüfung', `<ol><li>Definitionsmenge, Symmetrie, Verhalten außen</li><li>Nullstellen</li><li>Extrempunkte (mit ${t("f'")} und ${t("f''")})</li><li>Wendepunkte (mit ${t("f''")} und ${t("f'''")})</li><li>Skizze mit allen gefundenen Punkten</li></ol>`],
  ],
  expln: [
    ['Worum es geht', `<p>Wächst oder fällt eine Größe in gleichen Zeitspannen immer um denselben <b>Faktor</b>, ist das exponentiell: Zinseszins, Bakterien, radioaktiver Zerfall, abkühlender Kaffee. Der natürliche Logarithmus ist das Werkzeug, um solche Gleichungen nach der Zeit aufzulösen.</p>`],
    ['Die Funktion', `${D("f(t)=a\\cdot e^{k\\,t}")}<p>${t('a')} ist der Anfangswert (${t('t=0')}), ${t('k')} die Wachstumskonstante: ${t('k>0')} Wachstum, ${t('k<0')} Zerfall. Die Änderungsrate ist proportional zum Bestand:</p>${D("f'(t)=k\\cdot f(t)")}`],
    ['Der Logarithmus als Umkehrung', `${D("e^{x}=b\\iff x=\\ln b\\qquad \\ln(e^x)=x\\qquad e^{\\ln x}=x")}<p>${t('\\ln b')} ist die Hochzahl, mit der man ${t('e')} potenzieren muss, um ${t('b')} zu bekommen. Merke: ${t('\\ln 1=0')} und ${t('\\ln e=1')}. Für Zahlen zwischen 0 und 1 ist der Logarithmus negativ, für Zahlen ≤ 0 gibt es keinen.</p>`],
    ['Verdopplungs- und Halbwertszeit', `${D("T_2=\\frac{\\ln 2}{k}\\qquad T_{1/2}=\\frac{\\ln 2}{|k|}")}<p>Herleitung: ${t('a\\,e^{kT}=2a')} führt auf ${t('e^{kT}=2')}, also ${t('kT=\\ln 2')}. Bemerkenswert: Die Verdopplungszeit hängt nicht vom Anfangswert ab.</p>`],
    ['Durchgerechnetes Beispiel', `<p>Ein Kapital von 2000 € wächst nach ${t('f(t)=2000\\cdot e^{0{,}03t}')} (${t('t')} in Jahren). Wann sind es 3000 €?</p>${D("2000\\,e^{0{,}03t}=3000\\ \\Rightarrow\\ e^{0{,}03t}=1{,}5\\ \\Rightarrow\\ t=\\frac{\\ln 1{,}5}{0{,}03}\\approx 13{,}5")}<p>Nach etwa 13,5 Jahren. Probe: ${t('2000\\cdot e^{0{,}405}\\approx 3000')}.</p>`],
    ['Ableiten', `${D("(e^{kx})'=k\\,e^{kx}\\qquad (\\ln x)'=\\frac{1}{x}")}<p>Bei ${t('\\ln')} mit innerer Funktion gilt die Kettenregel: ${t("(\\ln(2x+1))'=\\tfrac{2}{2x+1}")}.</p>`],
  ],
  's-baum': [
    ['Worum es geht', `<p>Viele Zufallsversuche laufen in mehreren Schritten ab: zweimal würfeln, drei Kugeln ziehen, Hin- und Rückspiel. Ein Baumdiagramm ordnet alle möglichen Abläufe – und zwei einfache Regeln liefern jede gesuchte Wahrscheinlichkeit.</p>`],
    ['Aufbau', `<p>Jede Stufe ist ein Teilversuch. Von jedem Knoten gehen Äste zu den möglichen Ergebnissen, an jedem Ast steht seine Wahrscheinlichkeit. <b>Die Äste, die von einem Knoten ausgehen, ergeben zusammen immer 1.</b> Ein Weg von der Wurzel bis ans Ende heißt Pfad.</p>`],
    ['Die zwei Pfadregeln', `${D("\\text{1. Pfadregel: entlang eines Pfades multiplizieren}")}${D("\\text{2. Pfadregel: passende Pfade addieren}")}<p>Die erste Regel gibt die Wahrscheinlichkeit für einen bestimmten Ablauf. Gehören mehrere Abläufe zum gesuchten Ereignis, werden ihre Wahrscheinlichkeiten addiert.</p>`],
    ['Mit oder ohne Zurücklegen', `<p><b>Mit Zurücklegen</b> bleibt die Urne gleich – die Wahrscheinlichkeiten sind auf jeder Stufe dieselben. <b>Ohne Zurücklegen</b> fehlt nach jedem Zug eine Kugel: Zähler und Nenner ändern sich.</p>${D("\\text{4 rote, 2 blaue, ohne Zurücklegen:}\\quad P(\\text{rot, rot})=\\frac{4}{6}\\cdot\\frac{3}{5}=\\frac{2}{5}")}`],
    ['Durchgerechnetes Beispiel', `<p>Dieselbe Urne, zwei Züge ohne Zurücklegen. Wahrscheinlichkeit für zwei verschiedene Farben:</p>${D("P=\\frac{4}{6}\\cdot\\frac{2}{5}+\\frac{2}{6}\\cdot\\frac{4}{5}=\\frac{8}{30}+\\frac{8}{30}=\\frac{8}{15}")}<p>Zwei Pfade gehören dazu (rot–blau und blau–rot). Wer nur einen rechnet, macht den häufigsten Fehler bei dieser Aufgabe.</p>`],
    ['Abkürzung über das Gegenereignis', `${D("P(\\text{mindestens ein Treffer})=1-P(\\text{kein Treffer})")}<p>Statt viele Pfade zu addieren, rechnet man den einen Pfad ohne Treffer aus und zieht ihn von 1 ab.</p>`],
  ],
  'g-gerade': [
    ['Worum es geht', `<p>Eine Gerade im Raum lässt sich nicht mit ${t('y=mx+b')} beschreiben – dafür braucht man Vektoren. Die Idee: Man startet an einem Punkt und läuft beliebig weit in eine feste Richtung.</p>`],
    ['Parameterform', `${D("g:\\ \\vec x=\\vec p+t\\cdot\\vec u")}<p>${t('\\vec p')} ist der <b>Stützvektor</b> (führt zu einem Punkt der Geraden), ${t('\\vec u')} der <b>Richtungsvektor</b>. Jeder Wert des Parameters ${t('t')} liefert genau einen Punkt. Durch zwei Punkte ${t('A')} und ${t('B')} geht die Gerade mit ${t('\\vec p=\\overrightarrow{OA}')} und ${t('\\vec u=\\overrightarrow{AB}')}.</p>`],
    ['Punktprobe', `<p>Liegt ${t('Q')} auf ${t('g')}? Man setzt ${t('Q')} ein und löst jede der drei Zeilen nach ${t('t')} auf. Kommt überall <b>dasselbe</b> ${t('t')} heraus, liegt der Punkt auf der Geraden.</p>${D("\\begin{pmatrix}7\\\\4\\\\1\\end{pmatrix}=\\begin{pmatrix}1\\\\0\\\\3\\end{pmatrix}+t\\begin{pmatrix}3\\\\2\\\\-1\\end{pmatrix}\\ \\Rightarrow\\ t=2,\\ t=2,\\ t=2\\ \\checkmark")}`],
    ['Lage zweier Geraden', `<p>Erst die Richtungsvektoren vergleichen:</p><ul><li><b>Vielfache voneinander:</b> parallel – oder sogar identisch, wenn ein Punkt der einen auf der anderen liegt.</li><li><b>Keine Vielfachen:</b> gleichsetzen. Hat das Gleichungssystem eine Lösung, schneiden sich die Geraden; hat es keine, sind sie <b>windschief</b> (sie laufen aneinander vorbei).</li></ul>`],
    ['Schnittpunkt berechnen', `<p>Gleichsetzen ergibt drei Gleichungen für zwei Parameter. Zwei Gleichungen liefern ${t('t')} und ${t('s')}, die dritte ist die <b>Probe</b>. Wichtig: verschiedene Buchstaben für die Parameter der beiden Geraden verwenden. Den Schnittpunkt bekommt man, indem man ${t('t')} in die erste Gerade einsetzt.</p>`],
  ],
  'g-ebene': [
    ['Worum es geht', `<p>Eine Ebene ist eine unendlich ausgedehnte, flache Fläche im Raum. Die Koordinatenform beschreibt sie mit einer einzigen Gleichung – damit lässt sich schnell prüfen, ob ein Punkt in der Ebene liegt und wo eine Gerade sie trifft.</p>`],
    ['Koordinatenform und Normalenvektor', `${D("E:\\ a\\,x_1+b\\,x_2+c\\,x_3=d\\qquad \\vec n=\\begin{pmatrix}a\\\\b\\\\c\\end{pmatrix}")}<p>Die drei Zahlen vor ${t('x_1,x_2,x_3')} bilden den <b>Normalenvektor</b>. Er steht senkrecht auf der Ebene und legt ihre Lage im Raum fest; ${t('d')} verschiebt die Ebene entlang dieser Richtung.</p>`],
    ['Punktprobe', `<p>Koordinaten des Punktes einsetzen. Stimmt die Gleichung, liegt der Punkt in der Ebene.</p>${D("E:\\ 2x_1-x_2+2x_3=6,\\quad P(1\\mid 2\\mid 3):\\quad 2\\cdot1-2+2\\cdot3=6\\ \\checkmark")}`],
    ['Normalenvektor aus zwei Richtungen', `<p>Sind zwei Richtungsvektoren ${t('\\vec u')} und ${t('\\vec v')} der Ebene bekannt, liefert das Kreuzprodukt einen Vektor, der auf beiden senkrecht steht:</p>${D("\\vec n=\\vec u\\times\\vec v=\\begin{pmatrix}u_2v_3-u_3v_2\\\\u_3v_1-u_1v_3\\\\u_1v_2-u_2v_1\\end{pmatrix}")}<p>Probe: ${t('\\vec n\\cdot\\vec u=0')} und ${t('\\vec n\\cdot\\vec v=0')}.</p>`],
    ['Schnittpunkt Gerade – Ebene', `<p>Die Gerade zeilenweise in die Ebenengleichung einsetzen, nach ${t('t')} auflösen, ${t('t')} zurück in die Gerade.</p>${D("g:\\ \\vec x=\\begin{pmatrix}1\\\\0\\\\2\\end{pmatrix}+t\\begin{pmatrix}1\\\\1\\\\0\\end{pmatrix},\\quad E:\\ x_1+x_2+x_3=7")}<p>${t('(1+t)+t+2=7')}, also ${t('t=2')} und ${t('S(3\\mid 2\\mid 2)')}. Fällt ${t('t')} heraus, ist die Gerade parallel zur Ebene (falsche Aussage) oder liegt darin (wahre Aussage).</p>`],
  ],
};

/** Karten einer Einheit (aus den „Benennen“-Schritten) – die Kurzfassung. */
export const karten = (u) => u.steps.flatMap((s) => s.run.cards || []);
export const hatLang = (u) => Array.isArray(LANG[u.id]);
/** Ausführlich und PDF gehören zur Pro-Fassung; solange der Verkauf nicht gestartet ist, ist alles offen. */
export const proOffen = () => store.zugangGilt() || !premiumOn();

const website = () => CONFIG.website.replace(/^https?:\/\/|\/$/g, '');
const kopf = (u, art) => `<header class="b-kopf"><img class="b-logo" src="img/logo.svg" alt="Logo ${esc(CONFIG.firma)}"><div class="b-firma"><b>${esc(CONFIG.firma)}</b><span>${esc(website())}</span></div>
  <div class="b-titel"><h1>${esc(u.title)}</h1><span>${esc(u.sub || '')} · ${art}</span></div></header>`;

/** Das Kapitel als Lesetext (Vorschau = Druckbild). lang = true: ausführliche Fassung, falls vorhanden. */
export function kapitelHtml(u, lang) {
  const K = karten(u), L = lang && hatLang(u) ? LANG[u.id] : null;
  const teile = L ? L.map(([titel, html]) => `<section class="t-teil"><h2>${esc(titel)}</h2>${html}</section>`).join('')
    : K.map((c) => `<section class="t-teil"><h2>${esc(c.title)}</h2>${c.html}</section>`).join('');
  const formeln = u.formeln?.length ? `<section class="t-teil t-merk"><h2>Formeln zum Merken</h2>${u.formeln.map(([n, f]) => `<div class="t-zeile"${hatMerkbild(n) ? ` data-merk="${esc(n)}"` : ''}><small>${esc(n)}</small><div class="t-formel">${tex(f, true)}</div></div>`).join('')}</section>` : '';
  const wozu = u.why ? `<section class="t-teil"><h2>Wo brauche ich das?</h2><p>${esc(u.why)}</p></section>` : '';
  return `<article class="blatt theorie" id="kapitel"><section class="b-seite">${kopf(u, L ? 'ausführlich' : 'kurz')}${teile}${formeln}${wozu}
    <footer class="b-fuss"><span>${esc(CONFIG.firma)} · ${esc(website())}</span><span>Theorie: ${esc(u.title)} (${L ? 'ausführlich' : 'kurz'})</span></footer></section></article>`;
}

/** Übersicht aller Kapitel. */
function listeView() {
  const el = h(`<div class="view stack">
    <a class="back" href="#/lernen">${ICON.left} Lernen</a>
    <div><span class="eyebrow">Theorie</span><h1 style="margin-top:8px">Nachlesen</h1><p class="lead" style="margin-top:8px">Jedes Thema als kurzes Kapitel – und Schritt für Schritt auch ausführlich mit Herleitung und Beispiel.</p></div>
    ${AREAS.filter((a) => a.id !== 'pruefung').map((a) => `<div class="sect"><h2>${esc(a.title)}</h2></div><section class="stack">${UNITS.filter((u) => u.area === a.id && karten(u).length).map((u) =>
      `<a class="card unit" href="#/theorie/${u.id}"><span class="num">${hatLang(u) ? '2' : '1'}</span><span><h3>${esc(u.title)}</h3><small>${hatLang(u) ? 'kurz und ausführlich' : 'kurz'}${unitExtra(u) ? ` · ${esc(NICHT_TEXT[store.land] || 'Zusatz')}` : ''}</small></span><span class="go">${ICON.right}</span></a>`).join('')}</section>`).join('')}
  </div>`);
  return { el };
}

function kapitelView(u, startLang) {
  const el = h(`<div class="view stack blatt-view">
    <a class="back noprint" href="#/theorie">${ICON.left} Theorie</a>
    <div class="noprint"><span class="eyebrow">Theorie</span><h1 style="margin-top:8px">${esc(u.title)}</h1><p class="lead" style="margin-top:6px">${esc(u.sub || '')}</p></div>
    <div class="t-leiste noprint"><div class="umschalt" id="t-art" role="radiogroup" aria-label="Länge"><button class="pick" type="button" role="radio" data-l="0">Kurz</button><button class="pick" type="button" role="radio" data-l="1">Ausführlich ${marke('pro')}</button></div>
      <a class="btn small" href="#/u/${u.id}">Üben</a><button class="btn ghost small" id="t-druck" type="button">PDF ${marke('pro')}</button></div>
    <div id="t-pro" class="noprint"></div>
    <div id="t-text"></div>
  </div>`);
  let lang = !!startLang && hatLang(u);
  const pro = $('#t-pro', el);
  const paint = () => {
    el.querySelectorAll('#t-art .pick').forEach((b) => { const on = (b.dataset.l === '1') === lang; b.classList.toggle('sel', on); b.setAttribute('aria-checked', on); });
    $('#t-text', el).innerHTML = kapitelHtml(u, lang);
    merkbilderEinsetzen($('#t-text', el));   // bewegte Merkbilder unter die passenden Formeln
  };
  el.querySelectorAll('#t-art .pick').forEach((b) => { b.onclick = async () => {
    const will = b.dataset.l === '1'; sfx('tap'); pro.innerHTML = '';
    if (will && !hatLang(u)) { pro.innerHTML = '<div class="note tip">Die ausführliche Fassung zu diesem Thema ist in Arbeit. Die kurze Fassung enthält schon alles Wichtige.</div>'; return; }
    if (will) { await premiumBereit(); if (!proOffen()) { pro.innerHTML = '<div class="note tip"><b>Die ausführliche Fassung gehört zur Pro-Fassung.</b> <a href="#/einstellungen">Zugangscode eingeben</a></div>'; return; } }
    lang = will; paint();
  }; });
  $('#t-druck', el).onclick = async () => {
    await premiumBereit();
    if (!proOffen()) { pro.innerHTML = '<div class="note tip"><b>Drucken und PDF gehören zur Pro-Fassung.</b> <a href="#/einstellungen">Zugangscode eingeben</a></div>'; return; }
    drucken(`Theorie-${u.title}`);
  };
  premiumBereit().then(() => { if (el.isConnected && !premiumOn() && !pro.innerHTML) pro.innerHTML = '<small class="muted">„Ausführlich“ und PDF gehören später zur Pro-Fassung. In der Testphase sind sie für alle frei.</small>'; });
  paint();
  return { el };
}

/** Einstieg für den Router: #/theorie oder #/theorie/<Einheit>[-lang] */
export function theorieView(teil) {
  const lang = /-lang$/.test(teil || ''), id = String(teil || '').replace(/-lang$/, ''), u = UNITS.find((x) => x.id === id && karten(x).length);
  return u ? kapitelView(u, lang) : listeView();
}
