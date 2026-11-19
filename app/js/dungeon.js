// Formel-Dungeon: Gleichungen und Formeln umstellen – Schritt für Schritt, Stockwerk für Stockwerk.
// In jedem Raum wählt man den nächsten Umform-Schritt (mit dem Ergebnis daneben). Falsche Schritte kosten ein Leben
// und werden erklärt. Fallen-Räume: den Fehler in einer fertigen Rechnung finden. Am Ende jedes Stockwerks ein Wächter.
// Wird erst geladen, wenn man den Dungeon betritt. Nichts wird gekauft, nichts kostet Geld.
import { $, h, tex, esc, ICON, sfx, buzz, confetti, funken, drucken } from './ui.js';
import { store } from './store.js';
import { shuffle, ri } from './math.js';
import { figurFor } from './figuren.js';
import { kopf, proOffen } from './blatt.js';
import { premiumBereit, premiumOn, schloss } from './api.js';
import { marke } from './pro.js';
import { CONFIG } from './config.js';
import { aufgabe, falle, auswahl, zuege, gleichungTex, ergebnisTex, probeTex, fertig, blattAufgaben } from './umform.js';

/** Gleichung groß setzen: Brüche in voller Höhe – am Handy besser lesbar. */
const gl = (l, r) => tex(`\\displaystyle ${gleichungTex(l, r)}`);

export const STOCKWERKE = [
  { name: 'Die Vorhalle', text: 'Gleichungen mit einem Schritt', waechter: ['Der Plus-Pförtner', '+'], farbe: ['#73e0a9', '#177a52'] },
  { name: 'Die Gewölbe', text: 'Zwei Schritte, Klammern und Brüche', waechter: ['Die Klammer-Krake', '( )'], farbe: ['#7cc4ff', '#2563b8'] },
  { name: 'Die Spiegelhalle', text: 'x auf beiden Seiten, drei Schritte', waechter: ['Der Spiegel-Golem', '='], farbe: ['#c7a6ff', '#6b3fc4'] },
  { name: 'Die Formelkammer', text: 'Formeln aus Physik und Geometrie umstellen', waechter: ['Die Formel-Hydra', 'F'], farbe: ['#ffb020', '#c46a00'] },
  { name: 'Die Tiefe', text: 'Wurzeln, Kehrwerte, Logarithmen', waechter: ['Der Wurzel-Lich', '√'], farbe: ['#ff7418', '#d85042'] },
];
export const START_LEBEN = 3, MAX_LEBEN = 5, RAEUME = 5;
/** Startstockwerk nach Klassenstufe. */
export const startStock = (jg) => ({ 5: 1, 6: 1, 7: 1, 8: 2, 9: 3, 10: 3, os: 3 }[jg] || 1);
/** Bis zu welchem Stockwerk man einsteigen darf: nach Klasse – oder so tief, wie man schon gekommen ist. */
export const freiBis = (jg = store.jahrgang) => Math.min(5, Math.max(startStock(jg), store.n('dungeonTiefe')));
/** Die Räume eines Stockwerks: drei Umform-Räume und eine Falle in zufälliger Reihenfolge, zuletzt der Wächter. */
export const raumPlan = () => [...shuffle(['umform', 'umform', 'umform', 'falle']), 'waechter'];
export const neuerLauf = (stock, ruhig = false) => ({ stock, raum: 0, plan: raumPlan(), leben: START_LEBEN, max: START_LEBEN, punkte: 0, fehler: 0, schritte: 0, ruhig, waechter: 0 });

/** Text mit ⟨Formel⟩-Stellen setzen. */
export const satz = (s) => String(s ?? '').split(/⟨|⟩/).map((t, i) => (i % 2 ? tex(t) : esc(t))).join('');

const SPICKZETTEL = `<details class="card dg-spick" id="dg-spick"><summary><b>Spickzettel: So stellst du um</b></summary>
  <ol>
    <li><b>Waage:</b> Was du auf einer Seite rechnest, rechnest du auch auf der anderen.</li>
    <li><b>Gegenrechnung:</b> ${tex('+\\leftrightarrow -')}, ${tex('\\cdot \\leftrightarrow :')}, ${tex('x^2\\leftrightarrow\\sqrt{x}')}, ${tex('b^x\\leftrightarrow\\log_b')}, Bruch im Nenner ${tex('\\leftrightarrow')} Kehrwert.</li>
    <li><b>Von außen nach innen:</b> Was zuletzt gerechnet wurde, kommt zuerst weg – erst Plus und Minus, dann Mal und Geteilt, dann Hochzahlen und Wurzeln.</li>
    <li><b>x auf beiden Seiten:</b> Erst Klammern auflösen, dann alle ${tex('x')} auf eine Seite bringen.</li>
    <li><b>Probe:</b> Ergebnis in die Ausgangsgleichung einsetzen – beide Seiten müssen gleich sein.</li>
  </ol></details>`;

export function dungeonView(after) {
  const el = h('<div class="view stack"></div>');
  let s = null;
  const cleanup = () => {};

  /** Umstell-Blatt (Pro): Aufgabenblatt und Lösungsblatt mit jedem Schritt – in der App ansehen, drucken mit Pro. */
  function blatt(stock, nr) {
    const W = STOCKWERKE[stock - 1], as = blattAufgaben(stock, nr, store.jahrgang);
    const heute = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const auftrag = (a) => `${a.art === 'formel' ? `<b>${esc(a.th)}:</b> ` : ''}Stelle nach ${tex(a.x)} um.`;
    const fuss = `<footer class="b-fuss"><span>${esc(CONFIG.firma)}</span><span>Umstell-Blatt Nr. ${nr} · erstellt am ${heute}</span></footer>`;
    el.className = 'view stack blatt-view';
    el.innerHTML = `<button class="back noprint" type="button" id="dg-zurueck">${ICON.left} Formel-Dungeon</button>
      <section class="card stack noprint" id="dg-blatt-aktion"><h3>Umstell-Blatt Nr. ${nr} · ${esc(W.name)}</h3>
        <small class="muted">${esc(W.text)}. Unter dieser Nummer entsteht immer genau dieses Blatt.</small>
        <div class="row"><button class="btn grow" id="dg-druck" type="button">PDF ${marke('pro')}</button><button class="btn ghost" id="dg-neu" type="button">Neues Blatt</button></div><div id="dg-pro"></div></section>
      <article class="blatt" id="blatt">
        <section class="b-seite">${kopf('Umstell-Blatt Mathematik', `${esc(W.name)}: ${esc(W.text)}<br>${as.length} Aufgaben · Schreibe jeden Schritt mit Strich auf: ${tex('3x+5=20\\ \\mid -5')}`)}
          <div class="b-name"><span>Name: <i></i></span><span>Klasse: <i class="kurz"></i></span><span>Datum: <i class="kurz"></i></span></div>
          <ol class="b-liste">${as.map((a, i) => `<li class="b-aufgabe"><div class="b-nr"><b>${i + 1}</b></div><div class="b-inhalt"><p>${auftrag(a)}</p><div class="b-formel">${gl(a.l, a.r)}</div><div class="b-platz" aria-hidden="true">Platz für deine Rechnung</div></div></li>`).join('')}</ol>${fuss}</section>
        <section class="b-seite b-loesung">${kopf(`Lösungen – Umstell-Blatt Nr. ${nr}`, `${esc(W.name)}: ${esc(W.text)}`)}
          <ol class="b-liste">${as.map((a, i) => {
            let vor = { l: a.l, r: a.r };
            const zeilen = a.weg.map((z) => { const r = `<tr><td>${gl(vor.l, vor.r)}</td><td class="dg-b-op">${tex(`\\mid ${z.label}`)}</td></tr>`; vor = z; return r; }).join('');
            const probe = probeTex(a);
            return `<li class="b-lsg"><div class="b-nr"><b>${i + 1}</b></div><div class="b-inhalt"><p>${auftrag(a)}</p><table class="dg-b-weg">${zeilen}<tr><td>${gl(vor.l, vor.r)}</td><td></td></tr></table><p class="b-weg"><b>Ergebnis:</b> ${tex(`\\displaystyle ${ergebnisTex(a)}`)}${probe ? ` · Probe: ${tex(probe)}` : ''}</p></div></li>`;
          }).join('')}</ol>${fuss}</section></article>`;
    $('#dg-zurueck', el).onclick = () => { sfx('tap'); start(); };
    $('#dg-neu', el).onclick = () => { sfx('tap'); blatt(stock, ri(1000, 9999)); };
    const pro = $('#dg-pro', el);
    $('#dg-druck', el).onclick = async () => {
      await premiumBereit();
      if (!proOffen()) { pro.innerHTML = `<div class="note tip">${schloss('Drucken und PDF gehören zur Pro-Fassung.')} Ansehen und im Dungeon üben kannst du trotzdem.</div>`; return; }
      drucken(`Umstell-Blatt-${nr}`);
    };
    premiumBereit().then(() => { if (el.isConnected && !premiumOn()) pro.innerHTML = '<small class="muted">Drucken und PDF gehören später zur Pro-Fassung. In der Testphase sind sie für alle frei.</small>'; });
    window.scrollTo(0, 0);
  }

  function start() {
    const frei = freiBis(), rek = store.n('dungeonRekord');
    el.className = 'view stack';
    el.innerHTML = `<a class="back" href="#/pruefung">${ICON.left} Zurück</a>
      <div><span class="eyebrow">Gleichungen und Formeln umstellen</span><h1 style="margin-top:8px">Formel-Dungeon</h1>
      <p class="lead" style="margin-top:8px">Steig Stockwerk für Stockwerk hinab. In jedem Raum stellst du eine Gleichung oder Formel um – Schritt für Schritt. Wähle den richtigen nächsten Schritt; ein falscher kostet ein Leben, und du erfährst, warum er falsch war.</p></div>
      ${rek ? `<div class="chips"><span class="chip xp">${ICON.bolt}Rekord ${rek}</span>${store.n('dungeonSieg') ? '<span class="chip">Wurzel-Lich besiegt</span>' : ''}</div>` : ''}
      <section class="stack" id="dg-stock">${STOCKWERKE.map((w, i) => {
        const n = i + 1, offen = n <= frei;
        return `<button class="card unit dg-wahl${offen ? '' : ' soon'}" type="button" data-s="${n}"${offen ? '' : ' disabled'}><span class="num">${n}</span><span><h3>${esc(w.name)}</h3><small>${esc(w.text)}${offen ? '' : ` · öffnet sich, wenn du Stockwerk ${n - 1} schaffst`}</small></span><span class="go">${offen ? ICON.right : ''}</span></button>`;
      }).join('')}</section>
      ${SPICKZETTEL}
      <section class="card stack" id="dg-blatt-wahl"><div class="row"><h3 class="grow">Umstell-Blatt zum Drucken ${marke('pro')}</h3></div>
        <small class="muted">Acht Aufgaben eines Stockwerks – auf dem Lösungsblatt steht jeder Schritt.</small>
        <div class="row dg-blatt-stock" role="radiogroup" aria-label="Stockwerk">${STOCKWERKE.map((_, i) => `<button class="pick${i + 1 === Math.min(3, freiBis()) ? ' sel' : ''}" type="button" role="radio" data-s="${i + 1}">${i + 1}</button>`).join('')}</div>
        <button class="btn ghost block" id="dg-blatt" type="button">Blatt bauen</button></section>
      <p class="muted small">Du startest mit ${START_LEBEN} Leben. Jeder besiegte Wächter schenkt dir eins dazu. ${store.ruhig ? 'Im ruhigen Modus gibt es keine Leben – du kannst in Ruhe probieren.' : ''}</p>`;
    let blattStock = Math.min(3, freiBis());
    el.querySelectorAll('.dg-blatt-stock .pick').forEach((b) => { b.onclick = () => { blattStock = +b.dataset.s; sfx('tap'); el.querySelectorAll('.dg-blatt-stock .pick').forEach((x) => x.classList.toggle('sel', x === b)); }; });
    $('#dg-blatt', el).onclick = () => { sfx('tap'); blatt(blattStock, ri(1000, 9999)); };
    el.querySelectorAll('.dg-wahl:not([disabled])').forEach((b) => { b.onclick = () => { sfx('tap'); s = neuerLauf(+b.dataset.s, store.ruhig); raum(); }; });
    window.scrollTo(0, 0);
  }

  function rahmen() {
    el.className = 'view';
    el.innerHTML = `<div class="stephead"><a class="x" href="#/dungeon" id="dg-x" aria-label="Dungeon verlassen">${ICON.close}</a><div class="prog"><i></i></div></div>
      <div class="ab-bar" id="dg-bar"></div><div id="stage"></div>`;
    $('#dg-x', el).onclick = (ev) => { ev.preventDefault(); if (s && s.punkte > 0) ende(false, true); else start(); };
  }
  function leiste() {
    const bar = $('#dg-bar', el); if (!bar) return;
    $('.prog i', el).style.width = `${Math.round((s.raum / RAEUME) * 100)}%`;
    bar.innerHTML = `<span class="ab-raum">Stockwerk ${s.stock} · Raum ${Math.min(RAEUME, s.raum + 1)}/${RAEUME}</span>
      ${s.ruhig ? '' : `<span class="hearts ab-leben" role="img" aria-label="${s.leben} von ${s.max} Leben">${Array.from({ length: s.max }, (_, i) => `<span class="${i < s.leben ? 'on' : ''}">♥</span>`).join('')}</span>`}
      <span class="chip xp ab-pkt" id="dg-pkt">${ICON.bolt}${Math.round(s.punkte)}</span>`;
  }
  /** Ein Fehler: kostet ein Leben (nicht im ruhigen Modus). Rückgabe: true, wenn die Reise vorbei ist. */
  function patzer() { s.fehler++; sfx('bad'); buzz(); if (!s.ruhig) s.leben--; leiste(); return !s.ruhig && s.leben <= 0; }

  function raum() {
    if (!$('#dg-bar', el)) rahmen();
    leiste();
    const art = s.plan[s.raum];
    if (art === 'falle') fallenRaum(); else umformRaum(art === 'waechter');
    window.scrollTo(0, 0);
  }
  function weiterKnopf(st, text, fn) {
    const r = $('#dg-row', st); r.innerHTML = ''; const b = h(`<button class="btn block" id="dg-weiter" type="button">${esc(text)}</button>`);
    b.onclick = () => { sfx('tap'); fn(); }; r.append(b); r.hidden = false; b.scrollIntoView({ block: 'nearest' });
  }
  function naechsterRaum() { s.raum++; if (s.raum >= RAEUME) return stockFertig(); raum(); }

  /** Umform-Raum (und Wächter): Schritt für Schritt bis zur gesuchten Größe. */
  function umformRaum(waechter) {
    const a = aufgabe(s.stock, store.jahrgang, waechter), st = $('#stage', el), W = STOCKWERKE[s.stock - 1];
    let z = { l: a.l, r: a.r, x: a.x }, hp = a.weg.length, fehlerHier = 0, tippGenutzt = false, lock = false;
    const ziel = tex(a.x), formel = a.art === 'formel';
    st.innerHTML = `<div class="stack">
      ${waechter ? `<div class="boss ab-gegner"><div class="boss-face mit-figur" id="dg-face">${figurFor(W.waechter[0], W.waechter[1], { form: 'zack', farbe: W.farbe, horn: 1 })}</div>
        <div class="boss-info"><b>${esc(W.waechter[0])}</b><small>Wächter von Stockwerk ${s.stock} · ${hp} Schritte bis zum Sieg</small><div class="hp" role="img" id="dg-hp" aria-label=""><i></i></div></div></div>` : ''}
      <div class="mission"><b class="tag">${waechter ? '▲' : s.raum + 1}</b><p>${formel ? `<b>${esc(a.th)}.</b> ` : ''}Stelle nach ${ziel} um.<small>${formel ? 'Alle Größen sind positiv.' : 'Wähle den richtigen nächsten Schritt.'}</small></p></div>
      <div class="card dg-rechnung" id="dg-weg"></div>
      <div class="dg-frage" id="dg-frage">Welcher Schritt ist richtig?</div>
      <div class="opts dg-opts" id="dg-opts"></div>
      <div class="row"><button class="btn ghost small" id="dg-tipp" type="button">Tipp</button></div>
      <div id="dg-note"></div><div class="row" id="dg-row" hidden></div></div>`;
    const weg = $('#dg-weg', st), opts = $('#dg-opts', st), note = $('#dg-note', st);
    const zeile = (zz, label = '') => `<div class="dg-zeile"><span class="dg-gl">${gl(zz.l, zz.r)}</span><span class="dg-op">${label ? `|&nbsp;${tex(label)}` : ''}</span></div>`;
    weg.innerHTML = zeile(z);
    const hpZeigen = () => { if (!waechter) return; $('#dg-hp i', st).style.width = `${(hp / a.weg.length) * 100}%`; $('#dg-hp', st).setAttribute('aria-label', `${W.waechter[0]}: noch ${hp} Schritte`); };
    hpZeigen();
    let w = null;
    function frage() {
      lock = false;
      for (let k = 0; k < 6; k++) { w = auswahl(z, a.wahr); if (w && w.opts.length >= 3) break; }
      opts.innerHTML = '';
      w.opts.forEach((o) => {
        const b = h(`<button class="opt dg-opt" type="button"><span class="dg-op">|&nbsp;${tex(o.label)}</span><span class="dg-gl">${gl(o.l, o.r)}</span></button>`);
        if (window.__mtTest) b.dataset.ok = o.ok ? '1' : '0';
        b.onclick = () => waehle(o, b);
        opts.append(b);
      });
      $('#dg-tipp', st).hidden = false;
    }
    function waehle(o, b) {
      if (lock || b.disabled) return;
      if (!o.ok) {
        b.classList.add('wrong'); b.disabled = true; fehlerHier++;
        const aus = patzer();
        note.innerHTML = `<div class="note bad">${satz(o.why)}</div>`;
        if (aus) { lock = true; opts.querySelectorAll('.opt').forEach((n) => { n.disabled = true; }); return weiterKnopf(st, 'Weiter', () => ende(false)); }
        return;
      }
      lock = true; sfx(waechter ? 'pling' : 'ok'); buzz(10);
      s.schritte++; s.punkte += 10 * s.stock; hp = Math.max(0, hp - 1); hpZeigen(); leiste();
      if (waechter) { const f = $('#dg-face', st); f.classList.remove('hit'); void f.offsetWidth; f.classList.add('hit'); }
      // Schritt in die Rechnung übernehmen
      weg.lastElementChild.querySelector('.dg-op').innerHTML = `|&nbsp;${tex(o.label)}`;
      z = { ...z, l: o.l, r: o.r }; weg.insertAdjacentHTML('beforeend', zeile(z));
      note.innerHTML = '';
      if (!fertig(z)) return frage();
      // geschafft
      opts.innerHTML = ''; $('#dg-tipp', st).hidden = true; $('#dg-frage', st).hidden = true;
      const perfekt = fehlerHier === 0 && !tippGenutzt;
      if (perfekt) s.punkte += 10 * s.stock;
      leiste(); funken(weg);
      const fin = { ...a, weg: [{ l: z.l, r: z.r }] };
      const probe = probeTex(a);
      note.innerHTML = `<div class="note ok"><b>${waechter ? `${esc(W.waechter[0])} ist besiegt!` : 'Geschafft!'}</b> ${tex(ergebnisTex(fin))}${probe ? `<br><small>Probe: ${tex(probe)} ✓</small>` : ''}${perfekt ? '<br><small>Ohne Fehler: Bonuspunkte.</small>' : ''}</div>`;
      if (waechter) $('#dg-face', st).classList.add('down');
      weiterKnopf(st, waechter ? 'Weiter' : 'Nächster Raum', naechsterRaum);
    }
    $('#dg-tipp', st).onclick = () => {
      if (lock) return; tippGenutzt = true; sfx('tap');
      note.innerHTML = `<div class="note tip"><b>Tipp:</b> ${satz(w.tipp)}</div>`;
    };
    frage();
  }

  /** Fallen-Raum: eine fertige Rechnung mit genau einem Fehler. */
  function fallenRaum() {
    const f = falle(s.stock, store.jahrgang), st = $('#stage', el), a = f.aufgabe;
    let versuche = 0, lock = false;
    st.innerHTML = `<div class="stack">
      <div class="mission"><b class="tag">!</b><p>Fallen-Raum: ${a.art === 'formel' ? `<b>${esc(a.th)}</b> – ` : ''}diese Rechnung stellt nach ${tex(a.x)} um, aber in einer Zeile steckt ein Fehler.<small>Tippe die erste falsche Zeile an.</small></p></div>
      <div class="card dg-rechnung dg-falle" id="dg-falle">${f.zeilen.map((zz, i) => `<button class="dg-zeile dg-fz" type="button" data-i="${i}"${i === 0 ? ' disabled' : ''}>${i ? `<span class="dg-op">|&nbsp;${tex(zz.label)}</span>` : '<span class="dg-op">Aufgabe</span>'}<span class="dg-gl">${gl(zz.l, zz.r)}</span></button>`).join('')}</div>
      <div id="dg-note"></div><div class="row" id="dg-row" hidden></div></div>`;
    const note = $('#dg-note', st);
    st.querySelectorAll('.dg-fz:not([disabled])').forEach((b) => {
      if (window.__mtTest) b.dataset.f = +b.dataset.i === f.fehler ? '1' : '0';
      b.onclick = () => {
        if (lock || b.disabled) return;
        const i = +b.dataset.i;
        if (i !== f.fehler) {
          b.disabled = true; b.classList.add(i > f.fehler ? 'dg-folge' : 'dg-wahr'); versuche++;
          const aus = patzer();
          note.innerHTML = `<div class="note bad">${i > f.fehler ? 'Diese Zeile ist zwar falsch – aber nur, weil vorher schon ein Fehler passiert ist. Such weiter oben.' : 'Diese Zeile stimmt noch. Rechne sie nach.'}</div>`;
          if (aus) { lock = true; return weiterKnopf(st, 'Weiter', () => ende(false)); }
          return;
        }
        lock = true; b.classList.add('dg-falsch'); sfx('ok'); buzz(10);
        s.punkte += (versuche ? 10 : 30) * s.stock; leiste();
        // „Richtig wäre“: derselbe Schritt, richtig ausgeführt (bei mehreren Faktoren denselben wählen wie in der Rechnung)
        const vor = f.zeilen[i - 1]; let richtig = null;
        for (let k = 0; k < 12 && !richtig; k++) { const r2 = zuege({ l: vor.l, r: vor.r, x: a.x }, a.wahr)?.richtig; if (r2 && r2.label === f.zeilen[i].label) richtig = r2; }
        note.innerHTML = `<div class="note ok"><b>Gefunden!</b> ${satz(f.why)}${richtig ? `<br>Richtig wäre: ${tex(gleichungTex(richtig.l, richtig.r))}` : ''}<br><small>Richtiges Ergebnis: ${tex(ergebnisTex(a))}</small></div>`;
        weiterKnopf(st, 'Nächster Raum', naechsterRaum);
      };
    });
  }

  function stockFertig() {
    s.waechter++; store.bump('dungeonWaechter');
    store.max('dungeonTiefe', Math.min(5, s.stock + 1));
    if (s.stock >= 5) return ende(true);
    const plus = !s.ruhig && s.max < MAX_LEBEN;
    if (!s.ruhig) { if (plus) s.max++; s.leben = Math.min(s.max, s.leben + 1); }
    const st = $('#stage', el), N2 = STOCKWERKE[s.stock];
    leiste(); sfx('win'); confetti(30);
    st.innerHTML = `<div class="stack"><div class="note ok"><b>Stockwerk ${s.stock} geschafft!</b> ${s.ruhig ? '' : plus ? 'Du bekommst ein Leben dazu.' : 'Ein Leben kommt zurück.'}</div>
      <div class="ab-ups"><button class="card ab-up" type="button" id="dg-tiefer"><span class="num">${s.stock + 1}</span><span><h3>Tiefer: ${esc(N2.name)}</h3><small>${esc(N2.text)}</small></span></button>
      <button class="card ab-up" type="button" id="dg-stop"><span class="num">${ICON.bolt}</span><span><h3>Aufhören</h3><small>${Math.round(s.punkte)} Punkte sichern.</small></span></button></div></div>`;
    $('#dg-tiefer', st).onclick = () => { sfx('tap'); s.stock++; s.raum = 0; s.plan = raumPlan(); raum(); };
    $('#dg-stop', st).onclick = () => { sfx('tap'); ende(true, true); };
    window.scrollTo(0, 0);
  }

  function ende(sieg, freiwillig = false) {
    const gain = Math.round(s.punkte), neu = gain > store.n('dungeonRekord');
    store.bonus(gain); store.touch(); store.bump('dungeon'); if (sieg && !freiwillig) store.bump('dungeonSieg');
    store.max('dungeonRekord', gain); store.max('dungeonSchritte', s.schritte);
    const W = STOCKWERKE[s.stock - 1], ganz = sieg && !freiwillig;
    el.className = 'view stack';
    el.innerHTML = `<a class="back" href="#/pruefung">${ICON.left} Zurück</a>
      <section class="board" style="text-align:center"><div class="board-top"><span>FORMEL-DUNGEON</span><b>● ${ganz ? 'GANZ UNTEN' : `STOCKWERK ${s.stock}`}</b></div>
        <div class="ab-held">${figurFor(W.waechter[0], W.waechter[1], { form: 'zack', farbe: W.farbe, horn: 1, grau: ganz })}</div>
        <h2 id="dg-ende">${ganz ? 'Der Wurzel-Lich ist besiegt – du hast den ganzen Dungeon geschafft!' : freiwillig ? 'Gut gemacht – Punkte gesichert.' : 'Die Leben sind aufgebraucht – diesmal.'}</h2>
        <p>${s.schritte} richtige Schritte · ${s.fehler} ${s.fehler === 1 ? 'Fehler' : 'Fehler'} · ${s.waechter} ${s.waechter === 1 ? 'Wächter' : 'Wächter'}${neu && gain ? ' · <b>neuer Rekord</b>' : ''}</p>
        <div class="gain" style="justify-content:center"><span class="chip xp">${ICON.bolt}+${gain} Punkte</span></div></section>
      ${!ganz && !freiwillig ? '<div class="note tip">Lies dir die Erklärungen zu deinen Fehlern noch einmal durch – meist ist es die Reihenfolge (von außen nach innen) oder ein Vorzeichen. Der nächste Abstieg ist wieder anders.</div>' : ''}
      <div class="row"><button class="btn block" id="dg-again" type="button">Noch einmal hinab</button></div>`;
    sfx(sieg ? 'win' : 'bad'); if (ganz) confetti(60);
    $('#dg-again', el).onclick = () => { sfx('tap'); start(); };
    s = null; after?.(); window.scrollTo(0, 0);
  }

  start();
  return { el, cleanup };
}
