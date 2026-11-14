// Abenteuer-Modus: eine Reise durch sieben Räume. Richtige Antworten sind Treffer, zwischen den Räumen
// wählt man eine von drei Belohnungen und eine von zwei Türen. Am Ende wartet der Abi-Drache.
// Jede Reise ist anders (Zufall), nichts wird gekauft, nichts kostet Geld.
import { $, h, tex, esc, ICON, sfx, buzz, confetti, cssVar } from './ui.js';
import { store, LEVELS } from './store.js';
import { pick, shuffle, rand } from './math.js';
import { practiceGens } from './units.js';
import { Plot } from './plot.js';
import { figurFor } from './figuren.js';

export const RAEUME = 7;
export const START_LEBEN = 4;
export const GEBIETE = { gemischt: 'Alles gemischt', analysis: 'Analysis', stochastik: 'Stochastik', geometrie: 'Geometrie' };
const ECHTE = ['analysis', 'stochastik', 'geometrie'];

/** Gegner je Gebiet: [Name, Zeichen]. Eigene Erfindungen. */
export const GEGNER = {
  analysis: [['Nullstellen-Nager', '0'], ['Steigungs-Schleim', 'm'], ['Kurven-Kauz', '∿'], ['Limes-Larve', 'lim'], ['Wende-Wiesel', 'W']],
  stochastik: [['Würfel-Wicht', '6'], ['Zufalls-Zecke', 'P'], ['Pfad-Puck', '⑂'], ['Prozent-Pilz', '%'], ['Münz-Motte', '½']],
  geometrie: [['Vektor-Wespe', '→'], ['Winkel-Wurm', '∠'], ['Ebenen-Egel', 'E'], ['Punkt-Panzer', 'P'], ['Normalen-Natter', 'n']],
};
export const ELITE = { analysis: ['Formel-Fürst', "f′"], stochastik: ['Sigma-Spuk', 'σ'], geometrie: ['Raum-Ritter', 'x₃'] };
export const DRACHE = ['Der Abi-Drache', 'Abi'];

/** Belohnungen. einmal: höchstens einmal je Reise. leben: hat nur mit Leben Sinn (nicht im ruhigen Modus). */
export const UPGRADES = [
  { id: 'trank', name: 'Heiltrank', text: 'Sofort 2 Leben zurück.', zeichen: '+2', leben: true, use: (s) => { s.leben = Math.min(s.max, s.leben + 2); } },
  { id: 'herz', name: 'Großes Herz', text: 'Ein Leben mehr – für die ganze Reise.', zeichen: '♥', leben: true, use: (s) => { s.max++; s.leben++; } },
  { id: 'schild', name: 'Schild', text: 'Der nächste Fehler kostet kein Leben.', zeichen: '◈', leben: true, use: (s) => { s.schild++; } },
  { id: 'klinge', name: 'Kombo-Klinge', text: 'Ab dem zweiten Treffer in Folge: doppelter Schaden.', zeichen: '×2', einmal: true, use: (s) => { s.klinge = true; } },
  { id: 'wucht', name: 'Erster Schlag', text: 'Der erste Treffer in jedem Raum zählt doppelt.', zeichen: '1.', einmal: true, use: (s) => { s.wucht = true; } },
  { id: 'kristall', name: 'Tipp-Kristall', text: '3 Ladungen: streicht eine falsche Antwort.', zeichen: '◇', use: (s) => { s.kristall += 3; } },
  { id: 'amulett', name: 'Punkte-Amulett', text: '+50 % Punkte für den Rest der Reise.', zeichen: '★', einmal: true, use: (s) => { s.faktor += 0.5; } },
  { id: 'funke', name: 'Funken-Stein', text: 'Der nächste Gegner startet mit einem Lebenspunkt weniger.', zeichen: '✦', use: (s) => { s.funke++; } },
  { id: 'schatz', name: 'Schatztruhe', text: 'Sofort 15 Punkte.', zeichen: '15', use: (s) => { s.punkte += 15; } },
];

export function neuerLauf(gebiet = 'gemischt', lv = 3, ruhig = false) {
  return { gebiet: gebiet in GEBIETE ? gebiet : 'gemischt', lv, ruhig, raum: 0, leben: START_LEBEN, max: START_LEBEN, schild: 0, klinge: false, wucht: false, kristall: 0, funke: 0, faktor: 1, punkte: 0, kombo: 0, treffer: 0, fehler: 0, hat: [] };
}

/** Drei verschiedene Belohnungen zur Wahl – nur solche, die gerade etwas bringen. */
export function ziehe(s, n = 3) {
  const pool = UPGRADES.filter((u) => !(u.einmal && s.hat.includes(u.id)) && !(u.leben && s.ruhig) && !(u.id === 'trank' && s.leben >= s.max));
  return shuffle(pool).slice(0, n);
}
export function nimm(s, id) {
  const u = UPGRADES.find((x) => x.id === id); if (!u) return false;
  u.use(s); s.hat.push(id); return true;
}

/** Türen zum nächsten Raum: vor dem letzten Raum nur das Drachentor, sonst zwei verschiedene. */
export function tueren(s) {
  const geb = () => (s.gebiet === 'gemischt' ? pick(ECHTE) : s.gebiet);
  if (s.raum + 1 >= RAEUME) return [{ art: 'boss', gebiet: geb() }];
  const a = { art: 'kampf', gebiet: geb() };
  let b = { art: pick(s.raum >= 1 ? ['elite', 'elite', 'rast', 'schatz'] : ['rast', 'schatz', 'kampf']), gebiet: geb() };
  if (b.art === 'rast' && s.ruhig) b.art = 'schatz';
  if (b.art === 'kampf' && b.gebiet === a.gebiet) b = { art: 'schatz', gebiet: b.gebiet };
  return rand() < 0.5 ? [a, b] : [b, a];
}
export const TUER_TEXT = {
  kampf: ['Kampf', 'Ein Gegner. Danach wählst du eine Belohnung.'],
  elite: ['Starker Gegner', 'Eine Stufe schwerer – dafür zwei Belohnungen.'],
  rast: ['Rastplatz', 'Kein Kampf. Du bekommst 2 Leben zurück.'],
  schatz: ['Schatzkammer', 'Kein Kampf. Du wählst sofort eine Belohnung.'],
  boss: ['Das Drachentor', 'Der letzte Raum. Der Abi-Drache wartet.'],
};

/** Der Gegner eines Raums: Name, Zeichen, Lebenspunkte, Aufgaben-Stufe. */
export function gegner(art, gebiet, raum, lv) {
  if (art === 'boss') return { name: DRACHE[0], zeichen: DRACHE[1], hp: lv >= 4 ? 6 : 5, lv: Math.min(5, lv + 1), art };
  if (art === 'elite') return { name: ELITE[gebiet][0], zeichen: ELITE[gebiet][1], hp: 4, lv: Math.min(5, lv + 1), art };
  const [name, zeichen] = pick(GEGNER[gebiet]);
  return { name, zeichen, hp: raum >= 3 ? 3 : 2, lv, art: 'kampf' };
}
/** Funken-Stein: zieht dem Gegner vor dem Kampf einen Lebenspunkt ab (mindestens einer bleibt). */
export function funke(s, g) {
  if (s.funke > 0 && g.hp > 1) { s.funke--; return g.hp - 1; }
  return g.hp;
}

/** Ein Treffer: gibt den Schaden zurück und zählt Punkte und Kombo. */
export function treffer(s, ersterImRaum) {
  let d = 1;
  if (s.klinge && s.kombo >= 1) d = 2;
  if (s.wucht && ersterImRaum) d = 2;
  s.kombo++; s.treffer++; s.punkte += 3 * s.faktor;
  return d;
}
/** Ein Fehler: Schild fängt ihn ab, sonst kostet er ein Leben (nicht im ruhigen Modus). Gibt zurück, was passiert ist. */
export function patzer(s) {
  s.kombo = 0; s.fehler++;
  if (s.ruhig) return 'ruhig';
  if (s.schild > 0) { s.schild--; return 'schild'; }
  s.leben--; return 'leben';
}
export const RAUM_PUNKTE = { kampf: 5, elite: 10, boss: 25 };

/* ───────────── Ansicht ───────────── */
export function abenteuerView(after) {
  const el = h('<div class="view"></div>');
  let plot = null, s = null, wahl = 'gemischt';
  const cleanup = () => { plot?.destroy(); plot = null; };

  function start() {
    cleanup(); s = null;
    const rek = store.n('abenteuerRekord'), siege = store.n('abenteuerSieg');
    el.className = 'view';
    el.innerHTML = `<div class="stephead"><a class="x" href="#/pruefung" aria-label="Schließen">${ICON.close}</a><b class="grow">Abenteuer</b></div><div id="stage"><div class="stack">
      <section class="board ab-start"><div class="board-top"><span>ABENTEUER</span><b>● ${RAEUME} RÄUME</b></div>
        <div class="ab-held">${figurFor(DRACHE[0], DRACHE[1], { form: 'zack', farbe: ['#ff7418', '#d85042'], horn: 1 })}</div>
        <h2>Die Reise zum Abi-Drachen</h2>
        <p>Jede richtige Antwort ist ein Treffer. Nach jedem Raum wählst du eine Belohnung und eine Tür. Jede Reise ist anders.</p></section>
      <section class="card stack"><h3>Welches Gebiet?</h3>
        <div class="picks ab-geb" role="radiogroup" aria-label="Gebiet">${Object.entries(GEBIETE).map(([k, v]) => `<button type="button" role="radio" class="pick" data-g="${k}" style="font-size:15px">${esc(v)}</button>`).join('')}</div>
        <small class="muted">Schwierigkeit: ${LEVELS[store.level - 1]}${store.ruhig ? ' · Ruhiger Modus: Fehler kosten kein Leben.' : ` · Du startest mit ${START_LEBEN} Leben.`}</small></section>
      ${rek ? `<div class="note tip"><b>Dein Rekord: ${rek} Punkte.</b> ${siege ? `${siege} ${siege === 1 ? 'Mal' : 'Mal'} den Drachen besiegt.` : 'Der Drache ist noch unbesiegt.'}</div>` : ''}
      <div class="row"><button class="btn block" id="ab-start" type="button">Reise starten</button></div></div></div>`;
    const paint = () => el.querySelectorAll('.ab-geb button').forEach((b) => { const on = b.dataset.g === wahl; b.classList.toggle('sel', on); b.setAttribute('aria-checked', on); });
    el.querySelectorAll('.ab-geb button').forEach((b) => { b.onclick = () => { wahl = b.dataset.g; sfx('tap'); paint(); }; });
    paint();
    $('#ab-start', el).onclick = () => { s = neuerLauf(wahl, store.level, store.ruhig); sfx('tap'); raum({ art: 'kampf', gebiet: wahl === 'gemischt' ? pick(ECHTE) : wahl }); };
  }

  function rahmen() {
    el.className = 'view';
    el.innerHTML = `<div class="stephead"><a class="x" href="#/abenteuer" id="ab-x" aria-label="Reise abbrechen">${ICON.close}</a><div class="prog"><i></i></div></div>
      <div class="ab-bar" id="ab-bar"></div><div id="stage"></div>`;
    $('#ab-x', el).onclick = (ev) => { ev.preventDefault(); start(); };
    leiste();
  }
  function leiste() {
    const bar = $('#ab-bar', el); if (!bar) return;
    $('.prog i', el).style.width = `${Math.round((s.raum / RAEUME) * 100)}%`;
    bar.innerHTML = `<span class="ab-raum">Raum ${Math.min(RAEUME, s.raum + 1)}/${RAEUME}</span>
      ${s.ruhig ? '' : `<span class="hearts ab-leben" role="img" aria-label="${s.leben} von ${s.max} Leben">${Array.from({ length: s.max }, (_, i) => `<span class="${i < s.leben ? 'on' : ''}">♥</span>`).join('')}</span>`}
      ${s.schild ? `<span class="ab-ding" title="Schild">◈ ${s.schild}</span>` : ''}${s.kristall ? `<span class="ab-ding" title="Tipp-Kristall">◇ ${s.kristall}</span>` : ''}
      <span class="chip xp ab-pkt">${ICON.bolt}${Math.round(s.punkte)}</span>`;
  }

  /** Einen Raum betreten. */
  function raum(tuer) {
    if (!$('#ab-bar', el)) rahmen();
    if (tuer.art === 'rast') { s.leben = Math.min(s.max, s.leben + 2); s.raum++; sfx('ok'); leiste(); return zwischen('Rastplatz', 'Du ruhst dich aus und bekommst 2 Leben zurück.', () => wege()); }
    if (tuer.art === 'schatz') { s.raum++; leiste(); return belohnung(1, 'Schatzkammer'); }
    kampf(gegner(tuer.art, tuer.gebiet, s.raum, s.lv), tuer.gebiet);
  }

  function zwischen(titel, text, weiter) {
    cleanup();
    const st = $('#stage', el);
    st.innerHTML = `<div class="stack"><div class="note ok"><b>${esc(titel)}.</b> ${esc(text)}</div><div class="row"><button class="btn block" id="ab-weiter" type="button">Weiter</button></div></div>`;
    $('#ab-weiter', st).onclick = () => { sfx('tap'); weiter(); };
  }

  function kampf(g, gebiet) {
    const gens = practiceGens(gebiet);
    let bag = [], hp = funke(s, g), erster = true, lock = false;
    const next = () => { if (!bag.length) bag = shuffle(gens); return bag.pop(); };
    const st = $('#stage', el);
    st.innerHTML = `<div class="stack">
      <div class="boss ab-gegner"><div class="boss-face ab-face" id="ab-face">${figurFor(g.name, g.zeichen, g.art === 'boss' ? { form: 'zack', farbe: ['#ff7418', '#d85042'], horn: 1 } : {})}</div>
        <div class="boss-info"><b>${esc(g.name)}</b><small>${esc(GEBIETE[gebiet])}${g.art === 'elite' ? ' · starker Gegner' : g.art === 'boss' ? ' · Endgegner' : ''}</small><div class="hp" role="img" id="ab-hp" aria-label=""><i></i></div></div></div>
      <div class="q" id="ab-q"></div><div class="row" id="ab-row" hidden></div></div>`;
    const face = $('#ab-face', st);
    const stand = () => { $('#ab-hp i', st).style.width = `${Math.max(0, hp / g.hp) * 100}%`; $('#ab-hp', st).setAttribute('aria-label', `${g.name}: ${Math.max(0, hp)} von ${g.hp} Lebenspunkten`); leiste(); };

    function frage() {
      cleanup(); lock = false; { const r = $('#ab-row', st); r.hidden = true; r.replaceChildren(); }
      const fn = next(), q = fn(g.lv); q.gen ??= fn.name; q.topic ??= fn.topic;
      window.__mtLast = { gen: q.gen, thema: q.topic, stufe: g.lv, frage: String(q.prompt).replace(/<[^>]+>/g, ''), formel: q.formula || '' };
      const box = $('#ab-q', st);
      box.innerHTML = `<div class="mission"><p>${q.prompt}</p></div>${q.graph ? '<div class="stage"><canvas aria-label="Graph"></canvas></div>' : ''}${q.formula ? `<div class="formula">${tex(q.formula, true)}</div>` : ''}
        <div class="opts"></div>${s.kristall ? `<button class="btn ghost small" id="ab-kristall" type="button">◇ Tipp-Kristall nutzen (${s.kristall})</button>` : ''}<div id="ab-note"></div>`;
      if (q.graph) {
        plot = new Plot(box.querySelector('canvas'), q.graph.view);
        const draw = () => { plot.clear(); plot.grid(); plot.fn(q.graph.f, { width: 4 }); if (q.graph.mark) plot.dot(q.graph.mark[0], q.graph.mark[1], { r: 6, color: cssVar('--orange') }); };
        plot.onResize = draw; draw();
      }
      const opts = box.querySelector('.opts'), note = $('#ab-note', box);
      q.options.forEach((o, k) => {
        const b = h(`<button class="opt" type="button"><span class="k">${'ABCD'[k]}</span><span>${o.html ?? tex(o.tex)}</span></button>`);
        if (window.__mtTest) b.dataset.ok = o.correct ? '1' : '0';
        b.onclick = () => {
          if (lock || b.disabled) return; lock = true;
          $('#ab-kristall', box)?.remove();
          let text = '';
          if (o.correct) {
            const d = treffer(s, erster); erster = false; hp -= d;
            b.classList.add('right'); sfx(hp <= 0 ? 'ok' : 'pling'); buzz(15); store.record(q.topic, true); store.max('komboMax', s.kombo);
            face.classList.remove('hit'); void face.offsetWidth; face.classList.add('hit');
            if (d > 1) text = '<div class="note ok"><b>Doppelter Treffer!</b></div>';
          } else {
            const was = patzer(s);
            b.classList.add('wrong'); sfx('bad'); store.record(q.topic, false); store.kartePut(q.gen, q.topic);
            opts.querySelectorAll('.opt').forEach((n, j) => { if (q.options[j].correct) n.classList.add('right'); });
            text = `<div class="note bad">${was === 'schild' ? '<b>Dein Schild fängt den Fehler ab.</b> ' : ''}${o.why || ''}</div>`;
          }
          stand();
          const tot = !s.ruhig && s.leben <= 0, sieg = hp <= 0;
          // Platz schaffen: Nur die gewählte und die richtige Antwort bleiben stehen – so passt die Rückmeldung mit aufs Bild.
          opts.querySelectorAll('.opt').forEach((n, j) => { if (n !== b && !q.options[j].correct) n.hidden = true; });
          note.innerHTML = text;
          const go = h(`<button class="btn block" id="ab-next" type="button">${tot || sieg ? 'Weiter' : 'Nächster Angriff'}</button>`);
          go.onclick = () => {
            if (tot) return ende(false);
            if (sieg) { face.classList.add('down'); s.punkte += RAUM_PUNKTE[g.art] * s.faktor; s.raum++; leiste(); return g.art === 'boss' ? ende(true) : belohnung(g.art === 'elite' ? 2 : 1, `${g.name} ist besiegt`); }
            frage(); window.scrollTo(0, 0);
          };
          { const r = $('#ab-row', st); r.replaceChildren(go); r.hidden = false; }
          (note.firstElementChild || b).scrollIntoView({ block: 'nearest' });
        };
        opts.append(b);
      });
      const kr = $('#ab-kristall', box);
      if (kr) kr.onclick = () => {
        const falsch = [...opts.querySelectorAll('.opt')].filter((n, j) => !q.options[j].correct && !n.disabled);
        if (falsch.length < 2 || s.kristall < 1) return;
        const weg = pick(falsch); weg.disabled = true; weg.classList.add('weg'); s.kristall--; sfx('tap'); leiste();
        if (s.kristall < 1 || falsch.length <= 2) kr.remove(); else kr.textContent = `◇ Tipp-Kristall nutzen (${s.kristall})`;
      };
    }
    stand(); frage(); window.scrollTo(0, 0);
  }

  /** Belohnung wählen (n Mal nacheinander), danach die Türen. */
  function belohnung(n, titel) {
    cleanup();
    const karten = ziehe(s), st = $('#stage', el);
    st.innerHTML = `<div class="stack"><div class="mission"><b class="tag">Belohnung</b><p>${esc(titel)}.<small>${n > 1 ? `Du darfst ${n} Mal wählen.` : 'Wähle eine von drei.'}</small></p></div>
      <div class="ab-ups">${karten.map((u) => `<button class="card ab-up" type="button" data-u="${u.id}"><span class="num">${esc(u.zeichen)}</span><span><h3>${esc(u.name)}</h3><small>${esc(u.text)}</small></span></button>`).join('')}</div></div>`;
    st.querySelectorAll('.ab-up').forEach((b) => { b.onclick = () => { nimm(s, b.dataset.u); sfx('ok'); leiste(); if (n > 1) belohnung(n - 1, 'Noch eine Belohnung'); else wege(); }; });
    window.scrollTo(0, 0);
  }

  function wege() {
    cleanup();
    const ts = tueren(s), st = $('#stage', el);
    st.innerHTML = `<div class="stack"><div class="mission"><b class="tag">Raum ${s.raum + 1}/${RAEUME}</b><p>${ts.length > 1 ? 'Zwei Türen. Wohin gehst du?' : 'Nur noch eine Tür.'}</p></div>
      <div class="ab-ups">${ts.map((t, i) => `<button class="card ab-up ab-tuer ${t.art}" type="button" data-i="${i}"><span class="num">${{ kampf: '⚔', elite: '⚔⚔', rast: '♥', schatz: '◆', boss: '▲' }[t.art]}</span><span><h3>${TUER_TEXT[t.art][0]}${['kampf', 'elite'].includes(t.art) ? ` · ${esc(GEBIETE[t.gebiet])}` : ''}</h3><small>${TUER_TEXT[t.art][1]}</small></span></button>`).join('')}</div></div>`;
    st.querySelectorAll('.ab-tuer').forEach((b) => { b.onclick = () => { sfx('tap'); raum(ts[+b.dataset.i]); }; });
    window.scrollTo(0, 0);
  }

  function ende(sieg) {
    cleanup();
    const gain = Math.round(s.punkte), neu = gain > store.n('abenteuerRekord');
    store.bonus(gain); store.touch(); store.bump('abenteuer'); if (sieg) store.bump('abenteuerSieg');
    store.max('abenteuerRekord', gain); store.max('abenteuerRaum', s.raum);
    el.className = 'view stack';
    el.innerHTML = `<a class="back" href="#/pruefung">${ICON.left} Zurück</a>
      <section class="board" style="text-align:center"><div class="board-top"><span>ABENTEUER</span><b>● ${sieg ? 'GESCHAFFT' : `RAUM ${Math.min(RAEUME, s.raum + 1)}/${RAEUME}`}</b></div>
        <div class="ab-held">${figurFor(DRACHE[0], DRACHE[1], { form: 'zack', farbe: ['#ff7418', '#d85042'], horn: 1, grau: sieg })}</div>
        <h2 id="ab-ende">${sieg ? 'Der Abi-Drache ist besiegt!' : 'Die Reise endet hier – diesmal.'}</h2>
        <p>${s.treffer} Treffer · ${s.fehler} ${s.fehler === 1 ? 'Fehler' : 'Fehler'}${neu ? ' · <b>neuer Rekord</b>' : ''}</p>
        <div class="gain" style="justify-content:center"><span class="chip xp">${ICON.bolt}+${gain} Punkte</span></div></section>
      ${sieg ? '' : '<div class="note tip">Die Aufgaben, bei denen es gehakt hat, liegen jetzt in deiner <a href="#/wiederholen">Fehler-Kartei</a>. Die nächste Reise ist wieder anders.</div>'}
      <div class="row"><button class="btn block" id="ab-again" type="button">Neue Reise</button></div>`;
    sfx(sieg ? 'win' : 'bad'); if (sieg) confetti(60);
    $('#ab-again', el).onclick = () => { sfx('tap'); start(); };
    after?.(); window.scrollTo(0, 0);
  }

  start();
  return { el, cleanup };
}
