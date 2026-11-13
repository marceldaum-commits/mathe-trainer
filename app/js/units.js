// Lernpfad. Jede Einheit folgt dem Bauplan: entdecken → benennen → Brücke zur Prüfungs-Schreibweise → festigen.
import { tex } from './ui.js';
import { store } from './store.js';
import { quiz, info } from './quiz.js';
import { murmelbahn } from './games/murmelbahn.js';
import { tangente } from './games/tangente.js';
import { zeichnen } from './games/zeichnen.js';
import { paare } from './games/paare.js';
import { flaeche } from './games/flaeche.js';
import { labor } from './games/labor.js';
import { lotse } from './games/lotse.js';
import { boss } from './games/boss.js';
import { flug } from './games/flug.js';
import { werkstatt } from './games/werkstatt.js';
import { raum } from './games/raum.js';
import { tafel } from './games/tafel.js';
import { mixOf } from './gen.js';
import {
  genBruch, genKlammer, genLinGl, genQuadGl, genPotenz, genSteigung, genHaeufigkeit, genProzent, genKennwerte, genLaplace, genGegen,
  genPythagoras, genTrig, genFlaeche, genMittelpunkt, genVektorRechnen,
} from './gen3.js';
import {
  genPolstelle, genAsymptote, genQuotient, genTrigAbl, genTrigInt, genRotation, genUneigentlich, genUnabhaengig, genVarianz, genHyper, genKugel, genAbstandPG, genEbenenLage,
} from './gen4.js';
import {
  genWendestelle, genMonotonie, genSymmetrie, genGrenzwert, genTangente, genSteckbrief, genSchar, genExtremwert, genLn, genWachstum, genFlaecheZwischen,
  genVierfelder, genBedingt, genKumuliert, genSigma, genHypothese, genNormal, genKombinatorik,
  genGeradePunkt, genEbene, genLage, genSchnittpunkt, genAbstand, genWinkel, genKreuz, genOperator,
} from './gen2.js';
import {
  genScheitel, genPotenzLuecke, genPolynom, genKette, genExp, genProdukt, genMix,
  genExtremstellen, genHochTief, genExtremaMix, genStammfunktion, genIntegral, genIntegralMix,
  genErwartung, genBinomial, genBaum, genStochastikMix, genVektorAB, genBetrag, genSkalar, genGeometrieMix,
} from './gen.js';

const T = (s) => `<div class="big">${tex(s, true)}</div>`;

/**
 * Lehrplan-Abgleich (docs/LEHRPLAN.md): Diese Aufgaben-Arten sind im hessischen Grundkurs kein Prüfungsstoff.
 * Bayern und Hessen-Leistungskurs: alles gilt.
 */
const NICHT = {
  'HE-GK': [genLn, genSigma, genNormal, genKreuz, genHypothese, genPolstelle, genAsymptote, genQuotient, genRotation, genUneigentlich, genKugel, genAbstandPG, genEbenenLage],
  'HE-LK': [genPolstelle, genAsymptote, genQuotient, genKugel],
};
export const NICHT_TEXT = { 'HE-GK': 'nicht im Grundkurs', 'HE-LK': 'in Hessen kein Prüfungsstoff' };
/** Gilt die Aufgaben-Art im gewählten Land/Kurs? */
export const landOk = (fn, land = store.land) => !(NICHT[land] || []).includes(fn);
/** Liste nach Land filtern – bleibt nichts übrig, gilt die ganze Liste (die Einheit ist dann ohnehin als Zusatz markiert). */
export const landList = (fns, land = store.land) => { const ok = fns.filter((f) => landOk(f, land)); return ok.length ? ok : fns; };
/** Gemischte Runde, die sich nach dem gewählten Land richtet. */
const mixLand = (fns) => (lv = 3) => mixOf([landList(fns)])(lv);
/** Ist ein Schritt bzw. eine ganze Einheit im gewählten Land/Kurs kein Prüfungsstoff? */
export const stepExtra = (s, land = store.land) => !!s.nicht?.includes(land);
export const unitExtra = (u, land = store.land) => !!u.nicht?.includes(land);

/** Grundlagen-Aufgaben je Gebiet (für die Grundlagen-Einheiten und das freie Üben). */
export const GRUND = {
  analysis: [genBruch, genKlammer, genPotenz, genLinGl, genQuadGl, genSteigung],
  stochastik: [genProzent, genHaeufigkeit, genKennwerte, genLaplace, genGegen, genVierfelder],
  geometrie: [genPythagoras, genTrig, genFlaeche, genMittelpunkt, genVektorRechnen],
};

export const UNITS = [
  {
    id: 'formen', area: 'analysis', title: 'Funktionen formen', sub: 'Was Parameter mit einem Graphen machen',
    steps: [
      { id: 'murmelbahn', kind: 'Entdecken', title: 'Murmelbahn', run: murmelbahn },
      { id: 'flug', kind: 'Entdecken', title: 'Kurven-Flug', run: flug },
      { id: 'sinus', kind: 'Benennen', title: 'Was a, b und d beim Sinus tun', run: info([
        { title: 'Die allgemeine Sinusfunktion', html: `${T('f(x)=a\\cdot\\sin(b\\,x)+d')}<p>${tex('a')} ist die <b>Amplitude</b>: so weit schwingt die Kurve nach oben und unten. ${tex('d')} verschiebt die Mittellinie.</p>` },
        { title: 'Die Periode', html: `${T('p=\\dfrac{2\\pi}{b}')}<p>${tex('b')} staucht oder streckt die Kurve in x-Richtung. Bei ${tex('b=2')} ist eine Welle nur noch halb so lang.</p>` },
      ]) },
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
      { id: 'zwischen', kind: 'Brücke', title: 'Fläche zwischen zwei Graphen', run: quiz([genFlaecheZwischen, genFlaecheZwischen, genFlaecheZwischen]) },
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
  {
    id: 'kurve', area: 'analysis', title: 'Kurvendiskussion', sub: 'Wendepunkte, Monotonie, Symmetrie, Verhalten im Unendlichen',
    steps: [
      { id: 'regel', kind: 'Benennen', title: 'Der Fahrplan', run: info([
        { eyebrow: 'Fahrplan', title: 'Eine Kurvendiskussion in sechs Schritten', html: `<p><b>1.</b> Symmetrie · <b>2.</b> Verhalten für große ${tex('x')} · <b>3.</b> Nullstellen · <b>4.</b> Extrempunkte · <b>5.</b> Wendepunkte · <b>6.</b> Skizze</p><p class="muted">Extrempunkte kennst du schon. Hier kommen die übrigen Bausteine.</p>` },
        { title: 'Wendepunkte', html: `${T("f''(x_0)=0\\quad\\text{und}\\quad f'''(x_0)\\neq 0")}<p>Am Wendepunkt wechselt der Graph die Krümmung – von einer Links- in eine Rechtskurve oder umgekehrt. Dort ist er am steilsten.</p>` },
        { title: 'Monotonie und Symmetrie', html: `<p>${tex("f'(x)>0")}: steigend, ${tex("f'(x)<0")}: fallend.</p><p>Nur gerade Exponenten: achsensymmetrisch zur y-Achse. Nur ungerade: punktsymmetrisch zum Ursprung.</p>${T('f(-x)=f(x)\\qquad f(-x)=-f(x)')}` },
        { title: 'Verhalten im Unendlichen', html: `<p>Bei Brüchen aus Polynomen entscheidet der höchste Exponent:</p><p>Nenner höher: Grenzwert 0. Gleich hoch: Verhältnis der Leitkoeffizienten. Zähler höher: unendlich.</p>` },
      ]) },
      { id: 'wende', kind: 'Brücke', title: 'Wendepunkte und Monotonie', run: quiz([genWendestelle, genWendestelle, genMonotonie, genMonotonie]) },
      { id: 'sym', kind: 'Brücke', title: 'Symmetrie und Grenzwerte', run: quiz([genSymmetrie, genSymmetrie, genGrenzwert, genGrenzwert]) },
      { id: 'mix', kind: 'Festigen', title: 'Kurvendiskussion am Stück', run: quiz(Array(6).fill(mixLand([genSymmetrie, genGrenzwert, genExtremstellen, genHochTief, genWendestelle, genMonotonie]))) },
    ],
  },
  {
    id: 'extremwert', area: 'analysis', title: 'Extremwertaufgaben', sub: 'Die beste Lösung finden',
    steps: [
      { id: 'werkstatt', kind: 'Entdecken', title: 'Extremwert-Werkstatt', run: werkstatt },
      { id: 'regel', kind: 'Benennen', title: 'So gehst du vor', run: info([
        { eyebrow: 'In vier Schritten', title: 'Von der Aufgabe zur Zielfunktion', html: `<p><b>1.</b> Was soll möglichst groß oder klein werden? Das ist die Zielgröße.</p><p><b>2.</b> Nebenbedingung nutzen, bis nur noch eine Variable übrig ist.</p><p><b>3.</b> Zielfunktion ableiten und null setzen.</p><p><b>4.</b> Prüfen: Liegt die Lösung im sinnvollen Bereich? Was passiert am Rand?</p>` },
        { title: 'Beispiel Zaun an der Mauer', html: `${T("A(x)=x\\cdot(20-2x)=20x-2x^2")}${T("A'(x)=20-4x=0\\ \\Rightarrow\\ x=5")}<p>Genau das hast du in der Werkstatt mit dem Regler gefunden.</p>` },
      ]) },
      { id: 'aufgaben', kind: 'Brücke', title: 'Optimale Abmessungen', run: quiz([genExtremwert, genExtremwert, genExtremwert, genExtremwert]) },
    ],
  },
  {
    id: 'anwenden', area: 'analysis', title: 'Tangente, Steckbrief, Scharen', sub: 'Typische Abi-Aufgaben',
    steps: [
      { id: 'regel', kind: 'Benennen', title: 'Drei Werkzeuge', run: info([
        { title: 'Tangente', html: `${T("t(x)=f'(x_0)\\cdot(x-x_0)+f(x_0)")}<p>Steigung aus der Ableitung, dann den Berührpunkt einsetzen. Die Normale steht senkrecht dazu: ${tex("m_n=-\\tfrac{1}{m_t}")}.</p>` },
        { title: 'Steckbrief', html: `<p>Jede Angabe wird zu einer Gleichung:</p><p>Punkt ${tex('P(a\\mid b)')}: ${tex('f(a)=b')} · Extrempunkt bei ${tex('a')}: ${tex("f'(a)=0")} · Wendepunkt bei ${tex('a')}: ${tex("f''(a)=0")} · Steigung ${tex('m')} bei ${tex('a')}: ${tex("f'(a)=m")}</p>` },
        { title: 'Funktionenscharen', html: `<p>Der Parameter ${tex('k')} ist eine feste, aber unbekannte Zahl. Abgeleitet wird nach ${tex('x')} – ${tex('k')} bleibt wie eine Zahl stehen.</p>${T("f_k(x)=x^2-2kx\\ \\Rightarrow\\ f_k'(x)=2x-2k")}` },
      ]) },
      { id: 'tangente', kind: 'Brücke', title: 'Tangentengleichung', run: quiz([genTangente, genTangente, genTangente]) },
      { id: 'steckbrief', kind: 'Brücke', title: 'Bedingungen aufstellen', run: quiz([genSteckbrief, genSteckbrief, genSteckbrief]) },
      { id: 'schar', kind: 'Brücke', title: 'Scharen untersuchen', run: quiz([genSchar, genSchar, genSchar]) },
    ],
  },
  {
    id: 'expln', area: 'analysis', title: 'ln-Funktion und Wachstum', sub: 'Logarithmus ableiten, Wachstum beschreiben',
    steps: [
      { id: 'regel', kind: 'Benennen', title: 'ln und Wachstum', run: info([
        { eyebrow: 'Merken', title: 'Die ln-Funktion', html: `${T("(\\ln x)'=\\dfrac1x\\qquad \\bigl(\\ln(ax+b)\\bigr)'=\\dfrac{a}{ax+b}")}<p>${tex('\\ln')} ist die Umkehrung von ${tex('e^x')}: Aus ${tex('e^{kt}=2')} wird ${tex('kt=\\ln(2)')}.</p>` },
        { title: 'Exponentielles Wachstum', html: `${T('N(t)=N_0\\cdot a^t=N_0\\cdot e^{kt}')}<p>Pro Zeitschritt wird mit demselben Faktor multipliziert. Bei ${tex('p\\,\\%')} Zunahme ist ${tex('a=1+\\tfrac{p}{100}')}, bei Abnahme ${tex('a=1-\\tfrac{p}{100}')}.</p>` },
      ]) },
      { id: 'ln', nicht: ['HE-GK'], kind: 'Brücke', title: 'ln ableiten', run: quiz([genLn, genLn, genLn]) },
      { id: 'wachstum', kind: 'Brücke', title: 'Wachstum und Zerfall', run: quiz([genWachstum, genWachstum, genWachstum]) },
    ],
  },
  {
    id: 's-bedingt', area: 'stochastik', title: 'Bedingte Wahrscheinlichkeit', sub: 'Vierfeldertafel und „rückwärts" schließen',
    steps: [
      { id: 'regel', kind: 'Benennen', title: 'Die Grundmenge wechselt', run: info([
        { title: 'Bedingte Wahrscheinlichkeit', html: `${T('P_B(A)=\\dfrac{P(A\\cap B)}{P(B)}')}<p>„Unter der Bedingung ${tex('B')}" heißt: Wir schauen nur noch auf die Fälle, in denen ${tex('B')} zutrifft. Die Grundmenge wird kleiner.</p>` },
        { title: 'Vierfeldertafel', html: `<p>In den vier inneren Feldern stehen die Schnittmengen, am Rand die Summen. Für ${tex('P_B(A)')} teilst du das Feld ${tex('A\\cap B')} durch die <b>Spaltensumme</b> von ${tex('B')}.</p>` },
        { title: 'Vorsicht, Umkehrung', html: `<p>${tex('P_B(A)')} und ${tex('P_A(B)')} sind verschieden. „Kranke werden zu 90 % erkannt" heißt nicht, dass 90 % der positiv Getesteten krank sind.</p>` },
      ]) },
      { id: 'tafel', kind: 'Brücke', title: 'Vierfeldertafel lesen', run: quiz([genVierfelder, genVierfelder, genVierfelder]) },
      { id: 'test', kind: 'Brücke', title: 'Vom Testergebnis zurückschließen', run: quiz([genBedingt, genBedingt, genBedingt]) },
    ],
  },
  {
    id: 's-verteilung', area: 'stochastik', title: 'Verteilungen', sub: 'Kumuliert rechnen, Sigma-Regeln, Normalverteilung',
    steps: [
      { id: 'regel', kind: 'Benennen', title: 'Höchstens, mindestens, zwischen', run: info([
        { title: 'Kumulierte Wahrscheinlichkeit', html: `${T('P(X\\le k)=P(X=0)+\\dots+P(X=k)')}<p>Tabellen und Taschenrechner liefern ${tex('P(X\\le k)')}. Alles andere wird darauf zurückgeführt:</p><p>${tex('P(X\\ge k)=1-P(X\\le k-1)')}<br>${tex('P(a\\le X\\le b)=P(X\\le b)-P(X\\le a-1)')}</p>` },
        { eyebrow: 'Merken', title: 'Sigma-Regeln', html: `<p>Um den Erwartungswert ${tex('\\mu')} liegen</p><p>in ${tex('\\mu\\pm\\sigma')} etwa 68,3 %, in ${tex('\\mu\\pm2\\sigma')} etwa 95,4 %, in ${tex('\\mu\\pm3\\sigma')} etwa 99,7 % der Werte.</p>` },
        { title: 'Normalverteilung', html: `${T('z=\\dfrac{x-\\mu}{\\sigma}')}<p>Mit ${tex('z')} misst man, wie viele Standardabweichungen ein Wert vom Erwartungswert entfernt liegt. So wird jede Normalverteilung vergleichbar.</p>` },
      ]) },
      { id: 'kumuliert', kind: 'Brücke', title: 'Die richtige Übersetzung', run: quiz([genKumuliert, genKumuliert, genKumuliert]) },
      { id: 'sigma', nicht: ['HE-GK'], kind: 'Brücke', title: 'Sigma-Regeln und Normalverteilung', run: quiz([genSigma, genSigma, genNormal, genNormal]) },
    ],
  },
  {
    id: 's-test', area: 'stochastik', nicht: ['HE-GK'], title: 'Hypothesentests', sub: 'Begriffe und Ablehnungsbereich',
    steps: [
      { id: 'regel', kind: 'Benennen', title: 'So funktioniert ein Test', run: info([
        { title: 'Die Idee', html: `<p>Man nimmt eine Behauptung an (Nullhypothese ${tex('H_0')}) und prüft, ob das Ergebnis der Stichprobe dazu passt. Ist es unter ${tex('H_0')} sehr unwahrscheinlich, wird ${tex('H_0')} abgelehnt.</p>` },
        { title: 'Zwei mögliche Fehler', html: `<p><b>Fehler 1. Art:</b> ${tex('H_0')} wird abgelehnt, obwohl sie stimmt. Seine Wahrscheinlichkeit ist höchstens das Signifikanzniveau ${tex('\\alpha')}.</p><p><b>Fehler 2. Art:</b> ${tex('H_0')} wird beibehalten, obwohl sie falsch ist.</p>` },
        { title: 'Ablehnungsbereich (rechtsseitig)', html: `<p>Vermutet man ${tex('p>p_0')}, sprechen große Trefferzahlen gegen ${tex('H_0')}. Gesucht ist das kleinste ${tex('k')} mit</p>${T('P(X\\ge k)\\le\\alpha')}` },
      ]) },
      { id: 'test', kind: 'Brücke', title: 'Tests verstehen und auswerten', run: quiz([genHypothese, genHypothese, genHypothese, genHypothese]) },
    ],
  },
  {
    id: 's-kombi', area: 'stochastik', title: 'Kombinatorik', sub: 'Geschickt zählen',
    steps: [
      { id: 'regel', kind: 'Benennen', title: 'Zwei Fragen entscheiden', run: info([
        { title: 'Reihenfolge? Wiederholung?', html: `<p>Mit Wiederholung, Reihenfolge wichtig: ${tex('n^k')}</p><p>Ohne Wiederholung, Reihenfolge wichtig: ${tex('\\dfrac{n!}{(n-k)!}')}</p><p>Ohne Wiederholung, Reihenfolge egal: ${tex('\\binom{n}{k}')}</p><p>Alle anordnen: ${tex('n!')}</p>` },
      ]) },
      { id: 'zaehlen', kind: 'Brücke', title: 'Das passende Zählmodell', run: quiz([genKombinatorik, genKombinatorik, genKombinatorik, genKombinatorik]) },
      { id: 'mix', kind: 'Festigen', title: 'Stochastik – alles gemischt', run: quiz(Array(6).fill(mixLand([genErwartung, genBinomial, genBaum, genVierfelder, genBedingt, genKumuliert, genSigma, genHypothese, genNormal, genKombinatorik]))) },
    ],
  },
  {
    id: 'g-gerade', area: 'geometrie', title: 'Geraden im Raum', sub: '3D-Ansicht, Punktprobe, Lagebeziehungen',
    steps: [
      { id: 'raum', kind: 'Entdecken', title: 'Raum-Blick', run: raum },
      { id: 'regel', kind: 'Benennen', title: 'Geraden beschreiben', run: info([
        { title: 'Stützpunkt und Richtung', html: `${T('g\\colon\\ \\vec x=\\vec p+t\\cdot\\vec u')}<p>${tex('\\vec p')} sagt, wo die Gerade liegt, ${tex('\\vec u')}, wohin sie läuft. Für jedes ${tex('t')} entsteht ein Punkt der Geraden.</p>` },
        { title: 'Punktprobe', html: `<p>Liegt ${tex('Q')} auf ${tex('g')}? Aus einer Zeile ${tex('t')} bestimmen, dann die anderen beiden Zeilen prüfen. Alle drei müssen mit demselben ${tex('t')} stimmen.</p>` },
        { title: 'Vier mögliche Lagen', html: `<p><b>Richtungen Vielfache?</b> Ja: parallel oder identisch (Punktprobe entscheidet).</p><p>Nein: Gleichsetzen. Lösbar: Schnittpunkt. Widerspruch: windschief.</p>` },
      ]) },
      { id: 'punkt', kind: 'Brücke', title: 'Punktprobe', run: quiz([genGeradePunkt, genGeradePunkt, genGeradePunkt]) },
      { id: 'lage', kind: 'Brücke', title: 'Lage zweier Geraden', run: quiz([genLage, genLage, genLage, genLage]) },
    ],
  },
  {
    id: 'g-ebene', area: 'geometrie', title: 'Ebenen', sub: 'Koordinatenform, Schnittpunkte, Kreuzprodukt',
    steps: [
      { id: 'regel', kind: 'Benennen', title: 'Ebenen beschreiben', run: info([
        { title: 'Koordinatenform', html: `${T('E\\colon\\ n_1x_1+n_2x_2+n_3x_3=d')}<p>Die Zahlen vor ${tex('x_1,x_2,x_3')} bilden den Normalenvektor ${tex('\\vec n')}: Er steht senkrecht auf der Ebene. Ein Punkt liegt in ${tex('E')}, wenn seine Koordinaten die Gleichung erfüllen.</p>` },
        { title: 'Gerade trifft Ebene', html: `<p>Die drei Zeilen der Geraden in die Ebenengleichung einsetzen. Es bleibt eine Gleichung für ${tex('t')}. Dieses ${tex('t')} in die Gerade einsetzen – fertig ist der Schnittpunkt.</p>` },
        { eyebrow: 'Merken', title: 'Kreuzprodukt', html: `${T('\\vec u\\times\\vec v=\\begin{pmatrix}u_2v_3-u_3v_2\\\\u_3v_1-u_1v_3\\\\u_1v_2-u_2v_1\\end{pmatrix}')}<p>Das Ergebnis steht senkrecht auf beiden Vektoren. So bekommt man aus zwei Spannvektoren den Normalenvektor.</p>` },
      ]) },
      { id: 'punkt', kind: 'Brücke', title: 'Punkte in der Ebene', run: quiz([genEbene, genEbene, genEbene]) },
      { id: 'schnitt', kind: 'Brücke', title: 'Schnittpunkt Gerade–Ebene', run: quiz([genSchnittpunkt, genSchnittpunkt, genSchnittpunkt]) },
      { id: 'kreuz', nicht: ['HE-GK'], kind: 'Brücke', title: 'Kreuzprodukt', run: quiz([genKreuz, genKreuz, genKreuz]) },
    ],
  },
  {
    id: 'g-mass', area: 'geometrie', title: 'Abstände und Winkel', sub: 'Messen im Raum',
    steps: [
      { id: 'regel', kind: 'Benennen', title: 'Messen im Raum', run: info([
        { title: 'Abstand Punkt–Ebene', html: `${T('d(P;E)=\\dfrac{|n_1p_1+n_2p_2+n_3p_3-d|}{|\\vec n|}')}<p>Punkt in die Ebenengleichung einsetzen, die rechte Seite abziehen, Betrag bilden und durch die Länge des Normalenvektors teilen.</p>` },
        { title: 'Winkel zwischen Vektoren', html: `${T('\\cos\\varphi=\\dfrac{\\vec u\\cdot\\vec v}{|\\vec u|\\cdot|\\vec v|}')}<p>Oben das Skalarprodukt, unten das Produkt der beiden Längen. Bei ${tex('\\vec u\\cdot\\vec v=0')} ist der Winkel 90°.</p>` },
      ]) },
      { id: 'abstand', kind: 'Brücke', title: 'Abstände', run: quiz([genAbstand, genAbstand, genAbstand]) },
      { id: 'winkel', kind: 'Brücke', title: 'Winkel', run: quiz([genWinkel, genWinkel, genWinkel]) },
      { id: 'mix', kind: 'Festigen', title: 'Geometrie – alles gemischt', run: quiz(Array(6).fill(mixLand([genVektorAB, genBetrag, genSkalar, genGeradePunkt, genEbene, genLage, genSchnittpunkt, genAbstand, genWinkel, genKreuz]))) },
    ],
  },
  {
    id: 'operatoren', area: 'pruefung', title: 'Operatoren', sub: 'Was die Aufgabe wirklich verlangt',
    steps: [
      { id: 'regel', kind: 'Benennen', title: 'Warum Operatoren Punkte kosten', run: info([
        { title: 'Das Verb entscheidet', html: `<p>„Geben Sie an" und „Zeigen Sie" verlangen ganz verschiedene Dinge. Wer nur das Ergebnis hinschreibt, wo ein Nachweis verlangt ist, verschenkt Punkte – und wer alles begründet, wo „angeben" steht, verliert Zeit.</p>` },
        { title: 'Drei Stufen', html: `<p><b>Nur Ergebnis:</b> angeben, nennen.</p><p><b>Mit Weg:</b> berechnen, bestimmen, ermitteln, zeichnen.</p><p><b>Mit Begründung:</b> zeigen, nachweisen, begründen, beurteilen.</p><p class="muted">Die Formulierungen lehnen sich an die Operatorenlisten der Länder an; im Detail unterscheiden sie sich leicht.</p>` },
      ]) },
      { id: 'training', kind: 'Festigen', title: 'Operatoren-Training', run: quiz([genOperator, genOperator, genOperator, genOperator, genOperator, genOperator]) },
    ],
  },
  /* ───────────── Grundlagen (Mittelstufen-Wissen, das die Oberstufe voraussetzt) ───────────── */
  {
    id: 'a-grund', area: 'analysis', grund: true, title: 'Grundlagen: Rechnen und Gleichungen', sub: 'Brüche, Klammern, Potenzen, Gleichungen, Geraden',
    steps: [
      { id: 'terme', kind: 'Benennen', title: 'Rechnen mit Termen', run: info([
        { title: 'Brüche', html: `${T('\\dfrac ab+\\dfrac cd=\\dfrac{ad+cb}{bd}\\qquad \\dfrac ab\\cdot\\dfrac cd=\\dfrac{ac}{bd}')}<p>Addieren geht nur mit <b>gleichem Nenner</b>. Multiplizieren: Zähler mal Zähler, Nenner mal Nenner. Dividieren: mit dem Kehrwert multiplizieren.</p>` },
        { title: 'Klammern und binomische Formeln', html: `${T('(a\\pm b)^2=a^2\\pm 2ab+b^2\\qquad (a+b)(a-b)=a^2-b^2')}<p>Jedes Glied der einen Klammer wird mit jedem Glied der anderen multipliziert.</p><p class="muted">Der häufigste Fehler: ${tex('(a+b)^2=a^2+b^2')} – das mittlere Glied fehlt.</p>` },
        { title: 'Potenzgesetze', html: `${T('x^a\\cdot x^b=x^{a+b}\\qquad (x^a)^b=x^{ab}\\qquad x^{-n}=\\dfrac1{x^n}\\qquad \\sqrt[n]{x^m}=x^{\\frac mn}')}<p>Diese vier Regeln brauchst du bei jeder Ableitung und jedem Integral.</p>` },
      ]) },
      { id: 'bruch', kind: 'Brücke', title: 'Brüche und Klammern', run: quiz([genBruch, genBruch, genKlammer, genKlammer]) },
      { id: 'potenz', kind: 'Brücke', title: 'Potenzgesetze', run: quiz([genPotenz, genPotenz, genPotenz]) },
      { id: 'gleichung', kind: 'Benennen', title: 'Gleichungen lösen', run: info([
        { title: 'Lineare Gleichung', html: `<p>Alles mit ${tex('x')} auf eine Seite, alle Zahlen auf die andere. Was die Seite wechselt, wechselt das Vorzeichen.</p>${T('3x+4=x-6\\ \\Rightarrow\\ 2x=-10\\ \\Rightarrow\\ x=-5')}` },
        { title: 'Quadratische Gleichung', html: `${T('x^2+px+q=0\\ \\Rightarrow\\ x_{1,2}=-\\dfrac p2\\pm\\sqrt{\\left(\\dfrac p2\\right)^2-q}')}<p>Vorher durch die Zahl vor ${tex('x^2')} teilen. Probe: Die Lösungen ergeben als Summe ${tex('-p')} und als Produkt ${tex('q')}.</p>` },
        { title: 'Gerade durch zwei Punkte', html: `${T('m=\\dfrac{y_2-y_1}{x_2-x_1}\\qquad y=m\\,x+b')}<p>Erst die Steigung, dann einen Punkt einsetzen und ${tex('b')} ausrechnen.</p>` },
      ]) },
      { id: 'loesen', kind: 'Brücke', title: 'Gleichungen', run: quiz([genLinGl, genLinGl, genQuadGl, genQuadGl]) },
      { id: 'gerade', kind: 'Brücke', title: 'Geraden durch zwei Punkte', run: quiz([genSteigung, genSteigung, genSteigung]) },
      { id: 'mix', kind: 'Festigen', title: 'Grundlagen gemischt', run: quiz(Array(6).fill(mixOf([GRUND.analysis]))) },
    ],
  },
  {
    id: 's-grund', area: 'stochastik', grund: true, title: 'Grundlagen: Daten und Zufall', sub: 'Prozent, Häufigkeit, Laplace, Vierfeldertafel',
    steps: [
      { id: 'daten', kind: 'Benennen', title: 'Anteile und Kennwerte', run: info([
        { title: 'Prozent', html: `${T('W=G\\cdot\\dfrac{p}{100}')}<p>${tex('G')} ist das Ganze (100 %), ${tex('W')} der Anteil, ${tex('p')} der Prozentsatz. „Um 20 % erhöht" heißt: mal ${tex('1{,}2')}.</p>` },
        { title: 'Absolute und relative Häufigkeit', html: `${T('h=\\dfrac{\\text{Anzahl der Treffer}}{\\text{Anzahl der Versuche}}')}<p>Die absolute Häufigkeit zählt. Die relative Häufigkeit gibt den <b>Anteil</b> an – und ist bei vielen Versuchen ein Schätzwert für die Wahrscheinlichkeit.</p>` },
        { title: 'Mittelwert und Median', html: `<p><b>Arithmetisches Mittel:</b> alle Werte addieren, durch die Anzahl teilen.</p><p><b>Median:</b> der mittlere Wert der sortierten Liste. Er bleibt ruhig, wenn ein einzelner Wert extrem ausreißt.</p>` },
      ]) },
      { id: 'prozent', kind: 'Brücke', title: 'Prozent und Häufigkeit', run: quiz([genProzent, genProzent, genHaeufigkeit, genHaeufigkeit]) },
      { id: 'kennwerte', kind: 'Brücke', title: 'Mittelwert, Median, Spannweite', run: quiz([genKennwerte, genKennwerte, genKennwerte]) },
      { id: 'zufall', kind: 'Benennen', title: 'Wahrscheinlichkeit', run: info([
        { title: 'Laplace-Regel', html: `${T('P(E)=\\dfrac{\\text{günstige Ergebnisse}}{\\text{mögliche Ergebnisse}}')}<p>Gilt, wenn alle Ergebnisse gleich wahrscheinlich sind: Würfel, Münze, Urne, Glücksrad mit gleich großen Feldern.</p>` },
        { title: 'Gegenereignis', html: `${T('P(\\overline{E})=1-P(E)')}<p>„Mindestens einmal" rechnet man fast immer über das Gegenteil „kein einziges Mal".</p>` },
        { title: 'Vierfeldertafel', html: `<p>Zwei Merkmale mit je zwei Ausprägungen. Innen stehen die vier Kombinationen, am Rand die Summen, unten rechts die Gesamtzahl.</p><p class="muted">Jede Zeile und jede Spalte ergibt ihre Summe – damit lässt sich aus vier passenden Angaben die ganze Tafel füllen.</p>` },
      ]) },
      { id: 'laplace', kind: 'Brücke', title: 'Laplace und Gegenereignis', run: quiz([genLaplace, genLaplace, genGegen, genGegen]) },
      { id: 'tafel', kind: 'Entdecken', title: 'Vierfeldertafel füllen', run: tafel },
      { id: 'mix', kind: 'Festigen', title: 'Grundlagen gemischt', run: quiz(Array(6).fill(mixOf([GRUND.stochastik]))) },
    ],
  },
  {
    id: 'g-grund', area: 'geometrie', grund: true, title: 'Grundlagen: Dreiecke, Flächen, Vektoren', sub: 'Pythagoras, Sinus und Kosinus, Volumen, Mittelpunkt',
    steps: [
      { id: 'dreieck', kind: 'Benennen', title: 'Das rechtwinklige Dreieck', run: info([
        { title: 'Satz des Pythagoras', html: `${T('a^2+b^2=c^2')}<p>${tex('c')} ist die <b>Hypotenuse</b> – die längste Seite, gegenüber dem rechten Winkel. Genau so entsteht später die Länge eines Vektors.</p>` },
        { title: 'Sinus, Kosinus, Tangens', html: `${T('\\sin\\alpha=\\dfrac{\\text{Gegenkathete}}{\\text{Hypotenuse}}\\quad \\cos\\alpha=\\dfrac{\\text{Ankathete}}{\\text{Hypotenuse}}\\quad \\tan\\alpha=\\dfrac{\\text{Gegenkathete}}{\\text{Ankathete}}')}<p>Erst klären, welche zwei Seiten vorkommen – dann die passende Funktion wählen und umstellen.</p>` },
        { title: 'Flächen und Volumen', html: `${T('A_{\\triangle}=\\tfrac12\\,g\\,h\\qquad A_{\\circ}=\\pi r^2\\qquad V_{\\text{Zyl}}=\\pi r^2h\\qquad V_{\\text{Pyr}}=\\tfrac13\\,G\\,h')}<p>Spitze Körper (Pyramide, Kegel) haben ein Drittel des Volumens des passenden Prismas oder Zylinders.</p>` },
      ]) },
      { id: 'pythagoras', kind: 'Brücke', title: 'Satz des Pythagoras', run: quiz([genPythagoras, genPythagoras, genPythagoras]) },
      { id: 'trig', kind: 'Brücke', title: 'Sinus, Kosinus, Tangens', run: quiz([genTrig, genTrig, genTrig]) },
      { id: 'flaeche', kind: 'Brücke', title: 'Flächen und Volumen', run: quiz([genFlaeche, genFlaeche, genFlaeche]) },
      { id: 'punkte', kind: 'Benennen', title: 'Punkte und Vektoren', run: info([
        { title: 'Mittelpunkt', html: `${T('M=\\tfrac12\\,(A+B)')}<p>In jeder Koordinate den Mittelwert der beiden Punkte bilden.</p>` },
        { title: 'Mit Vektoren rechnen', html: `${T('\\begin{pmatrix}u_1\\\\u_2\\end{pmatrix}+\\begin{pmatrix}v_1\\\\v_2\\end{pmatrix}=\\begin{pmatrix}u_1+v_1\\\\u_2+v_2\\end{pmatrix}\\qquad k\\cdot\\begin{pmatrix}u_1\\\\u_2\\end{pmatrix}=\\begin{pmatrix}k\\,u_1\\\\k\\,u_2\\end{pmatrix}')}<p>Immer Zeile für Zeile. Ein Faktor vor dem Vektor gilt für jede Zeile.</p>` },
      ]) },
      { id: 'vektor', kind: 'Brücke', title: 'Mittelpunkt und Vektoren', run: quiz([genMittelpunkt, genMittelpunkt, genVektorRechnen, genVektorRechnen]) },
      { id: 'mix', kind: 'Festigen', title: 'Grundlagen gemischt', run: quiz(Array(6).fill(mixOf([GRUND.geometrie]))) },
    ],
  },
  /* ───────────── Lehrplan-Ergänzungen (docs/LEHRPLAN.md, „Was noch fehlt") ───────────── */
  {
    id: 'a-gebrochen', area: 'analysis', nicht: ['HE-GK', 'HE-LK'], title: 'Gebrochen-rationale Funktionen', sub: 'Polstellen, Asymptoten, Quotientenregel',
    steps: [
      { id: 'regel', kind: 'Benennen', title: 'Brüche mit x im Nenner', run: info([
        { title: 'Polstelle und Lücke', html: `${T('f(x)=\\dfrac{z(x)}{n(x)}')}<p>Wo der <b>Nenner null</b> wird, ist die Funktion nicht definiert. Ist der Zähler dort nicht null, schießt der Graph ins Unendliche: eine <b>Polstelle</b> mit senkrechter Asymptote.</p><p class="muted">Werden Zähler und Nenner an derselben Stelle null, lässt sich kürzen – dann bleibt nur eine Lücke.</p>` },
        { title: 'Verhalten für große x', html: `<p>Vergleiche die Grade: <b>Nennergrad größer</b> → der Graph nähert sich der x-Achse. <b>Gleicher Grad</b> → waagerechte Asymptote beim Verhältnis der Vorfaktoren. <b>Zählergrad um 1 größer</b> → schräge Asymptote (Polynomdivision).</p>${T('\\dfrac{6x+1}{2x+4}\\ \\to\\ 3')}` },
        { title: 'Quotientenregel', html: `${T("\\left(\\dfrac uv\\right)'=\\dfrac{u'v-uv'}{v^2}")}<p>Reihenfolge und Minus im Zähler beachten, der Nenner wird quadriert.</p>` },
      ]) },
      { id: 'pol', kind: 'Brücke', title: 'Polstellen finden', run: quiz([genPolstelle, genPolstelle, genPolstelle]) },
      { id: 'asym', kind: 'Brücke', title: 'Asymptoten', run: quiz([genAsymptote, genAsymptote, genAsymptote]) },
      { id: 'quot', kind: 'Brücke', title: 'Quotientenregel', run: quiz([genQuotient, genQuotient, genQuotient]) },
    ],
  },
  {
    id: 'a-trig', area: 'analysis', title: 'Sinus und Kosinus', sub: 'Ableiten und integrieren',
    steps: [
      { id: 'regel', kind: 'Benennen', title: 'Der Kreis der Ableitungen', run: info([
        { title: 'Ableiten', html: `${T("\\sin x\\ \\to\\ \\cos x\\ \\to\\ -\\sin x\\ \\to\\ -\\cos x\\ \\to\\ \\sin x")}<p>Jeder Pfeil ist eine Ableitung. Nach vier Schritten ist man wieder am Anfang.</p><p class="muted">Mit innerer Funktion gilt die Kettenregel: ${tex("(\\sin(bx))'=b\\cos(bx)")}.</p>` },
        { title: 'Aufleiten', html: `${T('\\int\\sin x\\,dx=-\\cos x+C\\qquad\\int\\cos x\\,dx=\\sin x+C')}<p>Der Kreis rückwärts. Bei ${tex('\\sin(bx)')} wird durch ${tex('b')} geteilt.</p>` },
        { title: 'Ein Bogen', html: `${T('\\int_0^{\\pi}\\sin x\\,dx=2')}<p>Die Fläche unter einem Sinus-Bogen ist genau 2 – ein Wert zum Merken.</p>` },
      ]) },
      { id: 'abl', kind: 'Brücke', title: 'Sinus und Kosinus ableiten', run: quiz([genTrigAbl, genTrigAbl, genTrigAbl, genTrigAbl]) },
      { id: 'int', kind: 'Brücke', title: 'Integrale mit Sinus und Kosinus', run: quiz([genTrigInt, genTrigInt, genTrigInt]) },
    ],
  },
  {
    id: 'a-rotation', area: 'analysis', nicht: ['HE-GK'], title: 'Rotationskörper und Flächen ins Unendliche', sub: 'Rotationsvolumen, uneigentliche Integrale',
    steps: [
      { id: 'regel', kind: 'Benennen', title: 'Drehen und ins Unendliche gehen', run: info([
        { title: 'Rotationsvolumen', html: `${T('V=\\pi\\int_a^b f(x)^2\\,dx')}<p>Dreht sich der Graph um die x-Achse, entsteht ein Körper aus lauter dünnen Kreisscheiben mit Radius ${tex('f(x)')}. Jede hat die Fläche ${tex('\\pi\\,f(x)^2')}.</p>` },
        { title: 'Uneigentliches Integral', html: `${T('\\int_1^{\\infty}\\dfrac{1}{x^2}\\,dx=\\lim_{b\\to\\infty}\\left[-\\dfrac1x\\right]_1^b=1')}<p>Eine Fläche, die unendlich weit reicht, kann trotzdem endlich groß sein – wenn die Funktion schnell genug fällt.</p>` },
      ]) },
      { id: 'rot', kind: 'Brücke', title: 'Rotationsvolumen', run: quiz([genRotation, genRotation, genRotation]) },
      { id: 'uneig', kind: 'Brücke', title: 'Uneigentliche Integrale', run: quiz([genUneigentlich, genUneigentlich, genUneigentlich]) },
    ],
  },
  {
    id: 's-zufall', area: 'stochastik', title: 'Zufallsgrößen und Unabhängigkeit', sub: 'Erwartungswert, Varianz, Ziehen ohne Zurücklegen',
    steps: [
      { id: 'regel', kind: 'Benennen', title: 'Drei Werkzeuge', run: info([
        { title: 'Unabhängigkeit', html: `${T('P(A\\cap B)=P(A)\\cdot P(B)')}<p>Gilt das, beeinflussen sich ${tex('A')} und ${tex('B')} nicht. Gilt es nicht, sind sie abhängig.</p><p class="muted">Nicht verwechseln mit „unvereinbar" – das heißt, beide können nicht zugleich eintreten.</p>` },
        { title: 'Erwartungswert und Varianz', html: `${T('\\mu=\\sum x_i\\,p_i\\qquad V(X)=\\sum x_i^2\\,p_i-\\mu^2\\qquad\\sigma=\\sqrt{V(X)}')}<p>Der Erwartungswert ist der Durchschnitt auf lange Sicht, die Standardabweichung die typische Abweichung davon.</p>` },
        { title: 'Ziehen ohne Zurücklegen', html: `${T('P(X=k)=\\dfrac{\\binom{K}{k}\\binom{N-K}{n-k}}{\\binom{N}{n}}')}<p>Günstige durch mögliche Auswahlen. So rechnet man Lotto – die Bernoulli-Formel gilt hier nicht, weil sich die Wahrscheinlichkeit mit jedem Zug ändert.</p>` },
      ]) },
      { id: 'unab', kind: 'Brücke', title: 'Unabhängig oder nicht?', run: quiz([genUnabhaengig, genUnabhaengig, genUnabhaengig]) },
      { id: 'var', kind: 'Brücke', title: 'Erwartungswert und Varianz', run: quiz([genVarianz, genVarianz, genVarianz]) },
      { id: 'hyper', kind: 'Brücke', title: 'Ziehen ohne Zurücklegen', run: quiz([genHyper, genHyper, genHyper]) },
    ],
  },
  {
    id: 'g-kugel', area: 'geometrie', nicht: ['HE-GK'], title: 'Kugeln, Abstände, Ebenen', sub: 'Kugelgleichung, Abstand Punkt–Gerade, Lage zweier Ebenen',
    steps: [
      { id: 'regel', kind: 'Benennen', title: 'Weiter messen im Raum', run: info([
        { title: 'Kugel', html: `${T('(x_1-m_1)^2+(x_2-m_2)^2+(x_3-m_3)^2=r^2')}<p>Alle Punkte mit Abstand ${tex('r')} vom Mittelpunkt ${tex('M')}. Punkt einsetzen: kleiner als ${tex('r^2')} → innerhalb, größer → außerhalb.</p>` },
        { title: 'Abstand Punkt–Gerade', html: `<p>Gesucht ist der <b>Lotfußpunkt</b> ${tex('F')} auf der Geraden: Der Vektor von ${tex('F')} zum Punkt steht senkrecht auf dem Richtungsvektor.</p>${T('\\overrightarrow{FP}\\cdot\\vec u=0')}` },
        { title: 'Zwei Ebenen', html: `<p>Vergleiche die <b>Normalenvektoren</b>: keine Vielfachen → die Ebenen schneiden sich in einer Geraden. Vielfache → parallel oder sogar identisch (dann passt auch die rechte Seite).</p>` },
      ]) },
      { id: 'kugel', kind: 'Brücke', nicht: ['HE-GK', 'HE-LK'], title: 'Kugeln', run: quiz([genKugel, genKugel, genKugel]) },
      { id: 'pg', kind: 'Brücke', title: 'Abstand Punkt–Gerade', run: quiz([genAbstandPG, genAbstandPG, genAbstandPG]) },
      { id: 'lage', kind: 'Brücke', title: 'Lage zweier Ebenen', run: quiz([genEbenenLage, genEbenenLage, genEbenenLage]) },
    ],
  },
];
export const AREAS = [
  { id: 'analysis', title: 'Analysis', soon: ['Wurzel- und Umkehrfunktion', 'Begrenztes und logistisches Wachstum', 'Integralfunktion', 'Newton-Verfahren'] },
  { id: 'stochastik', title: 'Stochastik', soon: ['Zweiseitige Tests', 'Histogramme lesen', 'Rückwärts nach n und p fragen'] },
  { id: 'geometrie', title: 'Analytische Geometrie', soon: ['Ebenen in Parameterform', 'Spiegelungen', 'Spurpunkte', 'Abstand windschiefer Geraden'] },
  { id: 'pruefung', title: 'Prüfung', soon: ['Musterlösungen lesen', 'Zeit einteilen'] },
];

/* ───────────── Zusatz je Einheit: Boss, „Wo brauche ich das?", Formelkarten ───────────── */
const META = {
  formen: { boss: ['Parabel-Golem', 'x²', [genScheitel]], why: 'Parabeln beschreiben Wurfbahnen, Brückenbögen und Satellitenschüsseln. Sinus-Kurven beschreiben Töne, Wechselstrom und Gezeiten.',
    formeln: [['Gerade', 'f(x)=m\\,x+b'], ['Scheitelform', 'f(x)=a\\,(x-d)^2+e,\\quad S(d\\mid e)'], ['Sinusfunktion', 'f(x)=a\\sin(b\\,x)+d,\\quad p=\\tfrac{2\\pi}{b}']] },
  steigung: { boss: ['Tangenten-Titan', 'm', [genPolynom, genTangente]], why: 'Die Steigung ist eine Änderungsrate: Geschwindigkeit ist die Änderungsrate des Weges, Inflation die der Preise.',
    formeln: [['Ableitung', "f'(x_0)=\\text{Steigung der Tangente bei }x_0"], ['Waagerechte Tangente', "f'(x_0)=0"]] },
  zeichnen: { boss: ['Skizzen-Schatten', "f′", [genMonotonie, genHochTief, genPolynom]], why: 'Ärzte lesen aus einer Fieberkurve, ob es besser oder schlechter wird – das ist grafisches Ableiten.',
    formeln: [['Vorzeichen der Ableitung', "f'(x)>0:\\ \\text{steigend}\\qquad f'(x)<0:\\ \\text{fallend}"]] },
  regeln: { boss: ['Regel-Rex', 'd/dx', [genPolynom, genKette, genExp, genProdukt]], why: 'KI-Modelle lernen, indem ein Computer Millionen Ableitungen mit der Kettenregel berechnet. Ohne Ableitungsregeln gäbe es keine Bild- oder Spracherkennung.',
    formeln: [['Potenzregel', "(x^n)'=n\\,x^{n-1}"], ['Kettenregel', "\\bigl(u(v(x))\\bigr)'=u'(v(x))\\cdot v'(x)"], ['Produktregel', "(u\\cdot v)'=u'v+uv'"], ['e-Funktion', "(e^{kx})'=k\\,e^{kx}"]] },
  extrema: { boss: ['Extrem-Drache', 'H|T', [genExtremstellen, genHochTief]], why: 'Firmen suchen den Preis mit dem höchsten Gewinn, Ingenieure die Form mit dem geringsten Luftwiderstand. Beides sind Extrempunkte.',
    formeln: [['Extrempunkt', "f'(x_0)=0,\\quad f''(x_0)<0:\\text{ Hochpunkt},\\quad f''(x_0)>0:\\text{ Tiefpunkt}"]] },
  integral: { boss: ['Integral-Riese', '∫', [genStammfunktion, genIntegral, genFlaecheZwischen]], why: 'Aus der Geschwindigkeit eines Autos wird per Integral der gefahrene Weg, aus dem Stromverbrauch pro Stunde die Stromrechnung.',
    formeln: [['Hauptsatz', '\\int_a^b f(x)\\,dx=F(b)-F(a)'], ['Aufleiten', '\\int x^n\\,dx=\\tfrac{1}{n+1}x^{n+1}+C'], ['Fläche zwischen Graphen', 'A=\\int_{x_1}^{x_2}\\bigl(g(x)-f(x)\\bigr)dx']] },
  kurve: { boss: ['Kurven-Krake', '∿', [genWendestelle, genMonotonie, genSymmetrie, genGrenzwert]], why: 'Bei einer Epidemie ist der Wendepunkt der Moment, ab dem die Zahlen langsamer steigen.',
    formeln: [['Wendepunkt', "f''(x_0)=0,\\quad f'''(x_0)\\neq 0"], ['Symmetrie', 'f(-x)=f(x):\\text{ Achse}\\qquad f(-x)=-f(x):\\text{ Punkt}']] },
  extremwert: { boss: ['Optimus Maximus', 'max', [genExtremwert]], why: 'Getränkedosen haben fast genau die Form, die bei festem Inhalt am wenigsten Blech braucht.',
    formeln: [['Extremwertaufgabe', "\\text{Zielfunktion aufstellen}\\ \\to\\ \\text{ableiten}\\ \\to\\ \\text{null setzen}\\ \\to\\ \\text{Rand prüfen}"]] },
  anwenden: { boss: ['Steckbrief-Sheriff', '?', [genTangente, genSteckbrief, genSchar]], why: 'Straßen und Achterbahnen werden aus Kurvenstücken gebaut, die am Übergang in Höhe und Steigung zusammenpassen müssen. Das sind Steckbriefaufgaben.',
    formeln: [['Tangente', "t(x)=f'(x_0)\\cdot(x-x_0)+f(x_0)"], ['Steckbrief', "f(a)=b\\quad f'(a)=m\\quad f''(a)=0"]] },
  expln: { boss: ['Graf Logarithmus', 'ln', [genLn, genWachstum]], why: 'Zinseszins, radioaktiver Zerfall und abkühlender Kaffee folgen Exponentialfunktionen. Mit dem ln berechnet man die Zeit – so wird das Alter von Funden bestimmt.',
    formeln: [['ln ableiten', "(\\ln x)'=\\dfrac1x"], ['Wachstum', 'N(t)=N_0\\cdot a^t=N_0\\cdot e^{kt}'], ['Verdopplungszeit', 't=\\dfrac{\\ln 2}{k}']] },
  's-labor': { boss: ['Würfel-Baron', 'μ', [genErwartung, genBinomial]], why: 'Versicherungen und Qualitätsprüfer rechnen mit dem Erwartungswert: Wie viele von 1000 Teilen sind vermutlich defekt?',
    formeln: [['Erwartungswert', '\\mu=n\\cdot p'], ['Standardabweichung', '\\sigma=\\sqrt{n\\,p\\,(1-p)}'], ['Bernoulli-Formel', 'P(X=k)=\\binom{n}{k}p^k(1-p)^{n-k}']] },
  's-baum': { boss: ['Urnen-Geist', '⑂', [genBaum]], why: 'Jede mehrstufige Entscheidung unter Unsicherheit ist ein Baum – vom Elfmeterschießen bis zur Lieferkette.',
    formeln: [['Pfadregeln', '\\text{entlang eines Pfades: mal}\\qquad\\text{mehrere Pfade: plus}']] },
  's-bedingt': { boss: ['Doktor Bedingt', 'P|B', [genVierfelder, genBedingt]], why: 'Bei seltenen Krankheiten heißt ein positiver Test oft trotzdem „wahrscheinlich gesund". Das versteht man nur mit bedingter Wahrscheinlichkeit.',
    formeln: [['Bedingte Wahrscheinlichkeit', 'P_B(A)=\\dfrac{P(A\\cap B)}{P(B)}']] },
  's-verteilung': { boss: ['Die Glocke', 'σ', [genKumuliert, genSigma, genNormal]], why: 'Körpergrößen, Messfehler, Prüfungsergebnisse: Vieles ist ungefähr normalverteilt. Die Sigma-Regeln sagen, was üblich und was auffällig ist.',
    formeln: [['Mindestens', 'P(X\\ge k)=1-P(X\\le k-1)'], ['Standardisieren', 'z=\\dfrac{x-\\mu}{\\sigma}'], ['Sigma-Regeln', '1\\sigma:68{,}3\\,\\%\\quad 2\\sigma:95{,}4\\,\\%\\quad 3\\sigma:99{,}7\\,\\%']] },
  's-test': { boss: ['Hypo-These', 'H₀', [genHypothese]], why: 'Ob ein neues Medikament wirkt oder eine Münze gezinkt ist, entscheidet man mit Hypothesentests.',
    formeln: [['Ablehnungsbereich (rechtsseitig)', '\\text{kleinstes }k\\text{ mit }P(X\\ge k)\\le\\alpha']] },
  's-kombi': { boss: ['Zähl-Zyklop', 'n!', [genKombinatorik]], why: 'Passwörter, Lotto, Turnierpläne: Kombinatorik sagt, wie viele Möglichkeiten es gibt – und wie sicher ein Passwort ist.',
    formeln: [['Zählmodelle', 'n^k\\qquad \\dfrac{n!}{(n-k)!}\\qquad \\binom{n}{k}\\qquad n!']] },
  'g-vektor': { boss: ['Vektor-Wächter', '→', [genVektorAB, genBetrag]], why: 'Navigationsgeräte, Computerspiele und Roboterarme berechnen jede Bewegung mit Vektoren.',
    formeln: [['Verbindungsvektor', '\\overrightarrow{AB}=B-A'], ['Betrag', '|\\vec v|=\\sqrt{v_1^2+v_2^2+v_3^2}']] },
  'g-skalar': { boss: ['Skalar-Sphinx', '·', [genSkalar]], why: 'Solarzellen liefern am meisten, wenn die Sonne senkrecht auftrifft. Wie viel Licht ankommt, berechnet man mit dem Skalarprodukt.',
    formeln: [['Skalarprodukt', '\\vec u\\cdot\\vec v=u_1v_1+u_2v_2+u_3v_3'], ['Senkrecht', '\\vec u\\cdot\\vec v=0\\iff\\vec u\\perp\\vec v']] },
  'g-gerade': { boss: ['Linien-Lord', 'g', [genGeradePunkt, genLage]], why: 'Zwei Flugrouten können sich auf der Karte kreuzen und trotzdem aneinander vorbeiführen – in verschiedenen Höhen. Das ist „windschief".',
    formeln: [['Gerade', 'g\\colon\\ \\vec x=\\vec p+t\\cdot\\vec u']] },
  'g-ebene': { boss: ['Ebenen-Eminenz', 'E', [genEbene, genSchnittpunkt, genKreuz]], why: 'In 3D-Grafik besteht alles aus ebenen Flächen. Ob ein Lichtstrahl eine Fläche trifft, ist genau die Aufgabe „Gerade schneidet Ebene".',
    formeln: [['Koordinatenform', 'E\\colon\\ n_1x_1+n_2x_2+n_3x_3=d'], ['Kreuzprodukt', '\\vec u\\times\\vec v=\\begin{pmatrix}u_2v_3-u_3v_2\\\\u_3v_1-u_1v_3\\\\u_1v_2-u_2v_1\\end{pmatrix}']] },
  'g-mass': { boss: ['Maßmeister', '∠', [genAbstand, genWinkel]], why: 'Abstände und Winkel braucht man beim Vermessen von Grundstücken, in der Architektur und für Sicherheitsabstände von Drohnen.',
    formeln: [['Abstand Punkt–Ebene', 'd(P;E)=\\dfrac{|\\vec n\\cdot\\vec p-d|}{|\\vec n|}'], ['Winkel', '\\cos\\varphi=\\dfrac{\\vec u\\cdot\\vec v}{|\\vec u|\\cdot|\\vec v|}']] },
  'a-grund': { boss: ['Term-Troll', 'x', GRUND.analysis], why: 'Wer in der Oberstufe Punkte verliert, verliert sie selten an der neuen Idee – meist an einem Vorzeichen, einem Bruch oder einer Klammer. Sichere Grundlagen sind die schnellsten Punkte im Abi.',
    formeln: [['Binomische Formeln', '(a\\pm b)^2=a^2\\pm 2ab+b^2,\\quad (a+b)(a-b)=a^2-b^2'], ['Potenzgesetze', 'x^a\\cdot x^b=x^{a+b},\\quad (x^a)^b=x^{ab},\\quad x^{-n}=\\tfrac1{x^n}'], ['pq-Formel', 'x_{1,2}=-\\tfrac p2\\pm\\sqrt{\\left(\\tfrac p2\\right)^2-q}'], ['Steigung', 'm=\\dfrac{y_2-y_1}{x_2-x_1}']] },
  's-grund': { boss: ['Prozent-Pirat', '%', GRUND.stochastik], why: 'Rabatte, Umfragen, Wahlergebnisse, Testergebnisse beim Arzt: Wer Anteile und Vierfeldertafeln lesen kann, lässt sich von Zahlen nicht täuschen.',
    formeln: [['Prozentwert', 'W=G\\cdot\\dfrac{p}{100}'], ['Laplace', 'P(E)=\\dfrac{\\text{günstige}}{\\text{mögliche}}'], ['Gegenereignis', 'P(\\overline{E})=1-P(E)']] },
  'g-grund': { boss: ['Pythagoras-Phantom', '△', GRUND.geometrie], why: 'Handwerker prüfen rechte Winkel mit dem 3-4-5-Dreieck, Vermesser bestimmen Höhen mit dem Tangens. Dieselben Ideen stecken später in Vektorlänge und Winkel.',
    formeln: [['Pythagoras', 'a^2+b^2=c^2'], ['Sinus, Kosinus, Tangens', '\\sin\\alpha=\\tfrac GH,\\quad \\cos\\alpha=\\tfrac AH,\\quad \\tan\\alpha=\\tfrac GA'], ['Volumen', 'V_{\\text{Zyl}}=\\pi r^2h,\\quad V_{\\text{Pyr}}=\\tfrac13\\,G\\,h'], ['Mittelpunkt', 'M=\\tfrac12\\,(A+B)']] },
  'a-gebrochen': { boss: ['Bruch-Basilisk', '÷', [genPolstelle, genAsymptote, genQuotient]], why: 'Kosten pro Stück, Konzentration eines Medikaments im Blut, Linsengleichung in der Physik: Überall, wo durch eine veränderliche Größe geteilt wird, entstehen gebrochen-rationale Funktionen.',
    formeln: [['Polstelle', 'n(x_0)=0\\ \\text{und}\\ z(x_0)\\neq 0'], ['Quotientenregel', "\\left(\\dfrac uv\\right)'=\\dfrac{u'v-uv'}{v^2}"]] },
  'a-trig': { boss: ['Wellen-Wächter', '∿', [genTrigAbl, genTrigInt]], why: 'Wechselstrom, Schall, Gezeiten, Pendel: Schwingungen sind Sinus-Kurven. Ihre Ableitung sagt, wie schnell sich etwas gerade ändert.',
    formeln: [['Ableitungen', "(\\sin x)'=\\cos x,\\quad(\\cos x)'=-\\sin x"], ['Stammfunktionen', '\\int\\sin x\\,dx=-\\cos x,\\quad\\int\\cos x\\,dx=\\sin x']] },
  'a-rotation': { boss: ['Dreh-Dämon', '↻', [genRotation, genUneigentlich]], why: 'Vasen, Flaschen, Düsen und Tanks sind Rotationskörper – ihr Volumen berechnet man genau so. Uneigentliche Integrale braucht man für alles, was „nie ganz aufhört", etwa radioaktiven Zerfall.',
    formeln: [['Rotationsvolumen', 'V=\\pi\\int_a^b f(x)^2\\,dx'], ['Uneigentliches Integral', '\\int_a^{\\infty}f(x)\\,dx=\\lim_{b\\to\\infty}\\int_a^b f(x)\\,dx']] },
  's-zufall': { boss: ['Los-Lord', 'σ²', [genUnabhaengig, genVarianz, genHyper]], why: 'Ob ein Glücksspiel fair ist, sagt der Erwartungswert. Wie riskant es ist, sagt die Varianz. Und Lotto ist nichts anderes als Ziehen ohne Zurücklegen.',
    formeln: [['Unabhängigkeit', 'P(A\\cap B)=P(A)\\cdot P(B)'], ['Varianz', 'V(X)=\\sum x_i^2\\,p_i-\\mu^2'], ['Ohne Zurücklegen', 'P(X=k)=\\dfrac{\\binom{K}{k}\\binom{N-K}{n-k}}{\\binom{N}{n}}']] },
  'g-kugel': { boss: ['Kugel-Koloss', '◯', [genKugel, genAbstandPG, genEbenenLage]], why: 'GPS bestimmt deinen Standort als Schnittpunkt von Kugeln um Satelliten. Abstände zu Geraden braucht jede Flugsicherung.',
    formeln: [['Kugel', '(x_1-m_1)^2+(x_2-m_2)^2+(x_3-m_3)^2=r^2'], ['Lotfußpunkt', '\\overrightarrow{FP}\\cdot\\vec u=0']] },
  operatoren: { boss: ['Operator-Orakel', '!', [genOperator]], why: 'Wer den Operator genau liest, schreibt in der Prüfung weder zu wenig noch zu viel.', formeln: [] },
};
for (const u of UNITS) {
  const m = META[u.id]; if (!m) continue;
  u.why = m.why; u.formeln = m.formeln; u.bossName = m.boss[0]; u.bossGens = m.boss[2];
  u.steps.push({ id: 'boss', kind: 'Boss', title: `Boss: ${m.boss[0]}`, run: (el, ctx) => boss(landList(m.boss[2]), m.boss[0], m.boss[1])(el, ctx) });
}

/** Freies Üben: alle Auswahl-Aufgaben eines Gebiets (aus den Boss-Listen der Einheiten). */
export const practiceGens = (areaId, nurGrund = false, land = store.land) => (nurGrund ? GRUND[areaId] : landList([...new Set(UNITS.filter((u) => u.area === areaId).flatMap((u) => u.bossGens || []))], land));
