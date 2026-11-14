// Theorie zum Nachlesen: jede Einheit als Kapitel in zwei Längen.
// „Kurz“ entsteht aus den Erklär-Karten und Formeln der Einheit (immer aktuell, für alle).
// „Ausführlich“ ist eigens geschriebener Text mit Herleitung und durchgerechnetem Beispiel (Pro) – wächst Thema für Thema.
import { $, h, tex, esc, ICON, sfx, drucken } from './ui.js';
import { store } from './store.js';
import { UNITS, AREAS, unitExtra, NICHT_TEXT } from './units.js';
import { CONFIG } from './config.js';
import { premiumOn, premiumBereit } from './api.js';

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
  const formeln = u.formeln?.length ? `<section class="t-teil t-merk"><h2>Formeln zum Merken</h2>${u.formeln.map(([n, f]) => `<div class="t-zeile"><small>${esc(n)}</small><div class="t-formel">${tex(f, true)}</div></div>`).join('')}</section>` : '';
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
    <section class="card stack noprint"><div class="picks" id="t-art" role="radiogroup" aria-label="Länge"><button class="pick" type="button" role="radio" data-l="0">Kurz</button><button class="pick" type="button" role="radio" data-l="1">Ausführlich</button></div>
      <div class="row"><a class="btn grow" href="#/u/${u.id}">Zur Einheit: üben</a><button class="btn ghost grow" id="t-druck" type="button">Drucken / als PDF</button></div>
      <div id="t-pro"></div></section>
    <div id="t-text"></div>
  </div>`);
  let lang = !!startLang && hatLang(u);
  const pro = $('#t-pro', el);
  const paint = () => {
    el.querySelectorAll('#t-art .pick').forEach((b) => { const on = (b.dataset.l === '1') === lang; b.classList.toggle('sel', on); b.setAttribute('aria-checked', on); });
    $('#t-text', el).innerHTML = kapitelHtml(u, lang);
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
