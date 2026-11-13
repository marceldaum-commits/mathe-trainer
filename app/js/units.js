// Lernpfad. Jede Einheit folgt dem Bauplan: entdecken → benennen → Brücke zur Prüfungs-Schreibweise → festigen.
import { tex } from './ui.js';
import { quiz, info } from './quiz.js';
import { murmelbahn } from './games/murmelbahn.js';
import { tangente } from './games/tangente.js';
import { zeichnen } from './games/zeichnen.js';
import { paare } from './games/paare.js';
import { flaeche } from './games/flaeche.js';
import { labor } from './games/labor.js';
import { lotse } from './games/lotse.js';
import {
  genScheitel, genPotenzLuecke, genPolynom, genKette, genExp, genProdukt, genMix,
  genExtremstellen, genHochTief, genExtremaMix, genStammfunktion, genIntegral, genIntegralMix,
  genErwartung, genBinomial, genBaum, genStochastikMix, genVektorAB, genBetrag, genSkalar, genGeometrieMix,
} from './gen.js';

const T = (s) => `<div class="big">${tex(s, true)}</div>`;

export const UNITS = [
  {
    id: 'formen', area: 'analysis', title: 'Funktionen formen', sub: 'Was Parameter mit einem Graphen machen',
    steps: [
      { id: 'murmelbahn', kind: 'Entdecken', title: 'Murmelbahn', run: murmelbahn },
      { id: 'regel', kind: 'Benennen', title: 'Was die Parameter tun', run: info([
        { title: 'Du hast gerade Parameter gesteuert.', html: `<p>Bei der Geraden bestimmt ${tex('m')} die Steigung und ${tex('b')} die Höhe an der y-Achse.</p>${T('f(x)=m\\,x+b')}<p class="muted">Negatives ${tex('m')}: Die Gerade fällt – nur dann rollt die Murmel los.</p>` },
        { title: 'Die Scheitelform der Parabel', html: `${T('f(x)=a\\,(x-d)^2+e')}<p>${tex('d')} verschiebt nach <b>rechts</b>, ${tex('e')} nach <b>oben</b>. Der Scheitel liegt bei ${tex('S(d\\mid e)')}.</p><p class="muted">Vorsicht: In der Klammer steht ein Minus. ${tex('(x+1)^2')} heißt also: Scheitel bei ${tex('x=-1')}.</p>` },
        { title: 'Was a bewirkt', html: `<p>${tex('|a|>1')}: schmaler (gestreckt). ${tex('|a|<1')}: breiter (gestaucht).</p><p>${tex('a<0')}: nach unten geöffnet – die Murmel wäre herausgefallen.</p>${T('a=0{,}25:\\ \\text{breit}\\qquad a=2:\\ \\text{schmal}')}` },
      ]) },
      { id: 'bruecke', kind: 'Brücke', title: 'Graph und Gleichung', run: quiz([genScheitel, genScheitel, genScheitel, genScheitel]) },
    ],
  },
  {
    id: 'steigung', area: 'analysis', title: 'Steigung entdecken', sub: 'Von der Tangente zur Ableitung',
    steps: [
      { id: 'surfer', kind: 'Entdecken', title: 'Tangenten-Surfer', run: tangente },
      { id: 'regel', kind: 'Benennen', title: 'Was die Ableitung ist', run: info([
        { title: 'Die Ableitung ist die Steigung.', html: `<p>An jeder Stelle hat der Graph eine Tangente. Ihre Steigung heißt Ableitung an dieser Stelle:</p>${T("f'(x_0)=\\text{Steigung der Tangente bei }x_0")}<p class="muted">Deine Spur im Spiel war genau der Graph von ${tex("f'")}.</p>` },
        { title: 'Waagerechte Tangente', html: `${T("f'(x_0)=0")}<p>An Hoch- und Tiefpunkten liegt die Tangente waagerecht. Deshalb sucht man Extremstellen über die Nullstellen der Ableitung.</p>` },
        { title: 'Vorzeichen lesen', html: `<p>${tex("f'(x)>0")}: Der Graph steigt.<br>${tex("f'(x)<0")}: Der Graph fällt.</p><p>Wo ${tex("f'")} am größten oder kleinsten ist, ist ${tex('f')} am steilsten – das ist eine Wendestelle.</p>` },
      ]) },
      { id: 'paare', kind: 'Festigen', title: 'Graphen-Paare', run: paare },
    ],
  },
  {
    id: 'zeichnen', area: 'analysis', title: 'Ableitung zeichnen', sub: 'Vom Graphen zur Ableitung – mit dem Finger',
    steps: [
      { id: 'skizze', kind: 'Entdecken', title: 'Ableitung skizzieren', run: zeichnen },
      { id: 'regel', kind: 'Benennen', title: 'So gehst du vor', run: info([
        { eyebrow: 'In drei Schritten', title: 'Grafisch ableiten', html: `<p><b>1.</b> Hoch- und Tiefpunkte von ${tex('f')} markieren – dort hat ${tex("f'")} Nullstellen.</p><p><b>2.</b> Dazwischen: steigt ${tex('f')}, liegt ${tex("f'")} oberhalb der x-Achse, sonst unterhalb.</p><p><b>3.</b> Die steilste Stelle von ${tex('f')} (Wendestelle) wird zum Extrempunkt von ${tex("f'")}.</p>` },
        { title: 'Der Grad sinkt um 1', html: `${T("f\\ \\text{Grad }3\\ \\Rightarrow\\ f'\\ \\text{Grad }2")}<p>Aus einer Parabel wird eine Gerade, aus einer Funktion dritten Grades eine Parabel. Das ist die Potenzregel – die kommt als Nächstes.</p>` },
      ]) },
    ],
  },
  {
    id: 'regeln', area: 'analysis', title: 'Ableitungsregeln', sub: 'In Prüfungs-Schreibweise sicher ableiten',
    steps: [
      { id: 'potenz', kind: 'Brücke', title: 'Potenzregel mit Lücken', run: quiz([genPotenzLuecke, genPotenzLuecke, genPotenzLuecke, genPolynom]) },
      { id: 'regel', kind: 'Benennen', title: 'Die Regeln auf einen Blick', run: info([
        { eyebrow: 'Merken', title: 'Potenz- und Summenregel', html: `${T("(x^n)'=n\\,x^{n-1}")}<p>Summen werden Summand für Summand abgeleitet, Zahlen ohne ${tex('x')} fallen weg.</p>${T("(3x^4-2x+5)'=12x^3-2")}` },
        { eyebrow: 'Merken', title: 'Kettenregel', html: `${T("\\bigl(u(v(x))\\bigr)'=u'(v(x))\\cdot v'(x)")}<p>Äußere Ableitung mal innere Ableitung.</p>${T("\\bigl((2x+1)^3\\bigr)'=3(2x+1)^2\\cdot 2")}` },
        { eyebrow: 'Merken', title: 'e-Funktion', html: `${T("(e^x)'=e^x\\qquad (e^{kx})'=k\\,e^{kx}")}<p class="muted">Der Faktor ${tex('k')} ist die innere Ableitung.</p>` },
      ]) },
      { id: 'kette', kind: 'Brücke', title: 'Kettenregel und e-Funktion', run: quiz([genKette, genKette, genExp, genExp]) },
      { id: 'produkt', kind: 'Brücke', title: 'Produktregel', run: quiz([genProdukt, genProdukt, genProdukt]) },
      { id: 'mix', kind: 'Festigen', title: 'Gemischte Runde', run: quiz([genMix, genMix, genMix, genMix, genMix]) },
    ],
  },
  {
    id: 'extrema', area: 'analysis', title: 'Extrempunkte', sub: 'Hoch- und Tiefpunkte berechnen',
    steps: [
      { id: 'regel', kind: 'Benennen', title: 'So findest du Extrempunkte', run: info([
        { eyebrow: 'In zwei Schritten', title: 'Notwendige Bedingung', html: `${T("f'(x)=0")}<p>Im Tangenten-Surfer lagen Hügel und Täler genau dort, wo die Steigung 0 war. Rechnerisch heißt das: Ableitung null setzen und nach ${tex('x')} auflösen.</p>` },
        { title: 'Hoch oder tief?', html: `<p>Die zweite Ableitung entscheidet:</p>${T("f''(x_0)<0\\ \\Rightarrow\\ \\text{Hochpunkt}\\qquad f''(x_0)>0\\ \\Rightarrow\\ \\text{Tiefpunkt}")}<p class="muted">Merkhilfe: negativ wie ein trauriger Mund (Hügel), positiv wie ein lachender Mund (Tal).</p>` },
        { title: 'Der Punkt selbst', html: `<p>Die Stelle ${tex('x_0')} in ${tex('f')} einsetzen – nicht in ${tex("f'")}. So bekommst du die y-Koordinate:</p>${T('E\\bigl(x_0\\mid f(x_0)\\bigr)')}` },
      ]) },
      { id: 'stellen', kind: 'Brücke', title: 'Extremstellen finden', run: quiz([genExtremstellen, genExtremstellen, genExtremstellen]) },
      { id: 'art', kind: 'Brücke', title: 'Hochpunkt oder Tiefpunkt?', run: quiz([genHochTief, genHochTief, genHochTief]) },
      { id: 'mix', kind: 'Festigen', title: 'Gemischte Runde', run: quiz([genExtremaMix, genExtremaMix, genExtremaMix, genExtremaMix]) },
    ],
  },
  {
    id: 'integral', area: 'analysis', title: 'Fläche und Integral', sub: 'Von Streifen zur Stammfunktion',
    steps: [
      { id: 'flaeche', kind: 'Entdecken', title: 'Fläche füllen', run: flaeche },
      { id: 'regel', kind: 'Benennen', title: 'Was das Integral ist', run: info([
        { title: 'Unendlich viele Streifen', html: `<p>Je schmaler die Streifen, desto näher rücken Unter- und Obersumme zusammen. Ihr gemeinsamer Grenzwert ist das Integral:</p>${T('\\int_a^b f(x)\\,dx')}` },
        { title: 'Der Hauptsatz', html: `${T('\\int_a^b f(x)\\,dx=F(b)-F(a)')}<p>${tex('F')} ist eine Stammfunktion von ${tex('f')}, also ${tex("F'=f")}. Statt Streifen zu zählen, leitest du „rückwärts" ab.</p>` },
        { eyebrow: 'Merken', title: 'Aufleiten', html: `${T('\\int x^n\\,dx=\\tfrac{1}{n+1}\\,x^{n+1}+C')}<p>Exponent um 1 erhöhen, durch den neuen Exponenten teilen. Probe: Ableiten muss wieder ${tex('f')} ergeben.</p>` },
      ]) },
      { id: 'stamm', kind: 'Brücke', title: 'Stammfunktionen', run: quiz([genStammfunktion, genStammfunktion, genStammfunktion]) },
      { id: 'bestimmt', kind: 'Brücke', title: 'Integrale berechnen', run: quiz([genIntegral, genIntegral, genIntegral]) },
      { id: 'mix', kind: 'Festigen', title: 'Gemischte Runde', run: quiz([genIntegralMix, genIntegralMix, genIntegralMix, genIntegralMix]) },
    ],
  },
  {
    id: 's-labor', area: 'stochastik', title: 'Zufall sichtbar machen', sub: 'Binomialverteilung und Erwartungswert',
    steps: [
      { id: 'labor', kind: 'Entdecken', title: 'Zufalls-Labor', run: labor },
      { id: 'regel', kind: 'Benennen', title: 'Binomialverteilung', run: info([
        { title: 'Immer dasselbe Experiment', html: `<p>Ein Versuch mit nur zwei Ausgängen (Treffer oder nicht) wird ${tex('n')}-mal unabhängig wiederholt. Die Trefferzahl ${tex('X')} heißt dann binomialverteilt.</p>${T('\\mu=n\\cdot p')}<p class="muted">Der Berg im Labor lag immer bei ${tex('n\\cdot p')}.</p>` },
        { title: 'Genau k Treffer', html: `${T('P(X=k)=\\binom{n}{k}\\,p^k\\,(1-p)^{n-k}')}<p>${tex('p^k(1-p)^{n-k}')} ist ein Pfad mit ${tex('k')} Treffern. ${tex('\\binom{n}{k}')} zählt, wie viele solche Pfade es gibt.</p>` },
        { title: 'Wie breit ist der Berg?', html: `${T('\\sigma=\\sqrt{n\\cdot p\\cdot(1-p)}')}<p>Die Standardabweichung sagt, wie stark die Trefferzahlen um den Erwartungswert streuen.</p>` },
      ]) },
      { id: 'kenn', kind: 'Brücke', title: 'Erwartungswert und Streuung', run: quiz([genErwartung, genErwartung, genErwartung]) },
      { id: 'formel', kind: 'Brücke', title: 'Die richtige Rechnung', run: quiz([genBinomial, genBinomial, genBinomial]) },
    ],
  },
  {
    id: 's-baum', area: 'stochastik', title: 'Baumdiagramme', sub: 'Pfadregeln sicher anwenden',
    steps: [
      { id: 'regel', kind: 'Benennen', title: 'Die zwei Pfadregeln', run: info([
        { eyebrow: 'Merken', title: 'Entlang eines Pfades: mal', html: `<p>Die Wahrscheinlichkeit eines Pfades ist das Produkt der Wahrscheinlichkeiten an seinen Ästen.</p>${T('P(\\text{rot, rot})=\\tfrac{3}{7}\\cdot\\tfrac{2}{6}')}` },
        { eyebrow: 'Merken', title: 'Mehrere Pfade: plus', html: `<p>Gehören mehrere Pfade zum Ereignis, werden ihre Wahrscheinlichkeiten addiert.</p><p class="muted">„Verschiedene Farben" heißt: rot–blau <b>oder</b> blau–rot.</p>` },
        { title: 'Mit oder ohne Zurücklegen', html: `<p><b>Mit</b> Zurücklegen bleibt die Urne gleich. <b>Ohne</b> Zurücklegen fehlt beim zweiten Zug eine Kugel – Zähler und Nenner ändern sich.</p>` },
      ]) },
      { id: 'pfad', kind: 'Brücke', title: 'Ziehen aus der Urne', run: quiz([genBaum, genBaum, genBaum, genBaum]) },
      { id: 'mix', kind: 'Festigen', title: 'Stochastik gemischt', run: quiz([genStochastikMix, genStochastikMix, genStochastikMix, genStochastikMix, genStochastikMix]) },
    ],
  },
  {
    id: 'g-vektor', area: 'geometrie', title: 'Vektoren steuern', sub: 'Verbindungsvektor, Linearkombination, Länge',
    steps: [
      { id: 'lotse', kind: 'Entdecken', title: 'Vektor-Lotse', run: lotse },
      { id: 'regel', kind: 'Benennen', title: 'Was ein Vektor ist', run: info([
        { title: 'Ein Vektor ist eine Verschiebung.', html: `<p>Er sagt, wie weit es in jede Richtung geht. Vom Punkt ${tex('A')} zum Punkt ${tex('B')}:</p>${T('\\overrightarrow{AB}=B-A')}<p class="muted">Merke: Spitze minus Fuß.</p>` },
        { title: 'Linearkombination', html: `${T('r\\cdot\\vec u+s\\cdot\\vec v')}<p>Vektoren lassen sich strecken und aneinanderhängen. Ein negativer Faktor dreht die Richtung um – so hast du auch Ziele „hinter" dir erreicht.</p>` },
        { title: 'Im Raum kommt eine Zeile dazu', html: `${T('|\\vec v|=\\sqrt{v_1^2+v_2^2+v_3^2}')}<p>Alles funktioniert genauso mit drei Koordinaten. Die Länge eines Vektors ist Pythagoras im Raum.</p>` },
      ]) },
      { id: 'ab', kind: 'Brücke', title: 'Verbindungsvektoren', run: quiz([genVektorAB, genVektorAB, genVektorAB]) },
      { id: 'betrag', kind: 'Brücke', title: 'Länge eines Vektors', run: quiz([genBetrag, genBetrag, genBetrag]) },
    ],
  },
  {
    id: 'g-skalar', area: 'geometrie', title: 'Skalarprodukt', sub: 'Rechnen und Orthogonalität erkennen',
    steps: [
      { id: 'regel', kind: 'Benennen', title: 'Das Skalarprodukt', run: info([
        { eyebrow: 'Merken', title: 'Zeile mal Zeile, dann addieren', html: `${T('\\vec u\\cdot\\vec v=u_1v_1+u_2v_2+u_3v_3')}<p>Das Ergebnis ist eine Zahl, kein Vektor.</p>` },
        { title: 'Senkrecht?', html: `${T('\\vec u\\cdot\\vec v=0\\ \\Longleftrightarrow\\ \\vec u\\perp\\vec v')}<p>Ist das Skalarprodukt 0, stehen die Vektoren senkrecht aufeinander. Das ist die häufigste Anwendung im Abitur.</p>` },
      ]) },
      { id: 'rechnen', kind: 'Brücke', title: 'Skalarprodukt berechnen', run: quiz([genSkalar, genSkalar, genSkalar, genSkalar]) },
      { id: 'mix', kind: 'Festigen', title: 'Geometrie gemischt', run: quiz([genGeometrieMix, genGeometrieMix, genGeometrieMix, genGeometrieMix, genGeometrieMix]) },
    ],
  },
];

export const AREAS = [
  { id: 'analysis', title: 'Analysis', soon: ['Kurvendiskussion komplett', 'Extremwert-Werkstatt', 'Steckbriefaufgaben', 'Funktionenscharen'] },
  { id: 'stochastik', title: 'Stochastik', soon: ['Bedingte Wahrscheinlichkeit und Vierfeldertafel', 'Hypothesentests', 'Normalverteilung'] },
  { id: 'geometrie', title: 'Analytische Geometrie', soon: ['Geraden im Raum', 'Ebenen', 'Abstände und Winkel'] },
];
