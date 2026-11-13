// Lernpfad. Jede Einheit folgt dem Bauplan: entdecken → benennen → Brücke zur Prüfungs-Schreibweise → festigen.
import { tex } from './ui.js';
import { quiz, info } from './quiz.js';
import { murmelbahn } from './games/murmelbahn.js';
import { tangente } from './games/tangente.js';
import { zeichnen } from './games/zeichnen.js';
import { paare } from './games/paare.js';
import { genScheitel, genPotenzLuecke, genPolynom, genKette, genExp, genMix } from './gen.js';

const T = (s) => `<div class="big">${tex(s, true)}</div>`;

export const UNITS = [
  {
    id: 'formen', title: 'Funktionen formen', sub: 'Was Parameter mit einem Graphen machen',
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
    id: 'steigung', title: 'Steigung entdecken', sub: 'Von der Tangente zur Ableitung',
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
    id: 'zeichnen', title: 'Ableitung zeichnen', sub: 'Vom Graphen zur Ableitung – mit dem Finger',
    steps: [
      { id: 'skizze', kind: 'Entdecken', title: 'Ableitung skizzieren', run: zeichnen },
      { id: 'regel', kind: 'Benennen', title: 'So gehst du vor', run: info([
        { eyebrow: 'In drei Schritten', title: 'Grafisch ableiten', html: `<p><b>1.</b> Hoch- und Tiefpunkte von ${tex('f')} markieren – dort hat ${tex("f'")} Nullstellen.</p><p><b>2.</b> Dazwischen: steigt ${tex('f')}, liegt ${tex("f'")} oberhalb der x-Achse, sonst unterhalb.</p><p><b>3.</b> Die steilste Stelle von ${tex('f')} (Wendestelle) wird zum Extrempunkt von ${tex("f'")}.</p>` },
        { title: 'Der Grad sinkt um 1', html: `${T("f\\ \\text{Grad }3\\ \\Rightarrow\\ f'\\ \\text{Grad }2")}<p>Aus einer Parabel wird eine Gerade, aus einer Funktion dritten Grades eine Parabel. Das ist die Potenzregel – die kommt als Nächstes.</p>` },
      ]) },
    ],
  },
  {
    id: 'regeln', title: 'Ableitungsregeln', sub: 'In Prüfungs-Schreibweise sicher ableiten',
    steps: [
      { id: 'potenz', kind: 'Brücke', title: 'Potenzregel mit Lücken', run: quiz([genPotenzLuecke, genPotenzLuecke, genPotenzLuecke, genPolynom]) },
      { id: 'regel', kind: 'Benennen', title: 'Die Regeln auf einen Blick', run: info([
        { eyebrow: 'Merken', title: 'Potenz- und Summenregel', html: `${T("(x^n)'=n\\,x^{n-1}")}<p>Summen werden Summand für Summand abgeleitet, Zahlen ohne ${tex('x')} fallen weg.</p>${T("(3x^4-2x+5)'=12x^3-2")}` },
        { eyebrow: 'Merken', title: 'Kettenregel', html: `${T("\\bigl(u(v(x))\\bigr)'=u'(v(x))\\cdot v'(x)")}<p>Äußere Ableitung mal innere Ableitung.</p>${T("\\bigl((2x+1)^3\\bigr)'=3(2x+1)^2\\cdot 2")}` },
        { eyebrow: 'Merken', title: 'e-Funktion', html: `${T("(e^x)'=e^x\\qquad (e^{kx})'=k\\,e^{kx}")}<p class="muted">Der Faktor ${tex('k')} ist die innere Ableitung.</p>` },
      ]) },
      { id: 'kette', kind: 'Brücke', title: 'Kettenregel und e-Funktion', run: quiz([genKette, genKette, genExp, genExp]) },
      { id: 'mix', kind: 'Festigen', title: 'Gemischte Runde', run: quiz([genMix, genMix, genMix, genMix, genMix]) },
    ],
  },
];

export const SOON = ['Extrempunkte und Kurvendiskussion', 'Fläche füllen: das Integral', 'Extremwert-Werkstatt', 'Steckbriefaufgaben'];
