// Aufgaben-Runde: Auswahl- und Lücken-Aufgaben mit gestuften Tipps und Fehler-Diagnose.
import { Plot } from './plot.js';
import { h, tex, cssVar, buzz, sfx } from './ui.js';
import { store } from './store.js';
import { CONFIG } from './config.js';
import { ft } from './math.js';
import { inputSpec, parseInput, isRight, diagnose } from './eingabe.js';
import { api, kiBereit, premiumOn, kiArt } from './api.js';
import { rechenwegFeld } from './rechenweg.js';
import { merkZuTitel, merkbilderEinsetzen } from './merkbild.js';
import { marke } from './pro.js';

/** sequence: Liste von Erzeugern (eine Aufgabe je Eintrag). */
export function quiz(sequence, opts = {}) {
  return (el, ctx) => {
    let qi = 0, mistakes = 0, plot = null, combo = 0;

    function show() {
      plot?.destroy(); plot = null;
      const lv = store.level;
      const fn = sequence[qi];
      const q = fn(lv);
      q.gen ??= fn.name; q.topic ??= fn.topic;
      window.__mtLast = { gen: q.gen, thema: q.topic, stufe: lv, frage: String(q.prompt).replace(/<[^>]+>/g, ''), formel: q.formula || '' };   // für „Fehler melden“
      const spec = !opts.noInput && store.tippen ? inputSpec(q) : null;
      let asInput = !!spec;
      let firstTry = true;
      const miss = () => { if (firstTry) { firstTry = false; store.record(q.topic, false); store.kartePut(q.gen, q.topic); } };
      let tipN = 0, solved = false, kombo = '', wrongHere = 0;
      // Rechenweg Schritt für Schritt: die gestuften Tipps als Schritte, am Ende das Ergebnis mit Begründung.
      const weg = (open = false) => `<details class="weg"${open ? ' open' : ''}><summary>Rechenweg Schritt für Schritt</summary><ol>${q.hints.map((t) => `<li>${t}</li>`).join('')}<li><b>Ergebnis:</b> ${q.explain}</li></ol></details>`;
      // „Erklär's mir anders“ (KI, nur mit eingeschaltetem Server): bekommt nur die Aufgabe und die gewählte Antwort.
      let gewaehlt = '';
      const richtigTex = () => q.options?.find((o) => o.correct)?.tex || '';
      const kauf = () => `${premiumOn() ? ' <a href="#/einstellungen">Zugangscode eingeben</a>' : ''}${window.MTApp ? '' : ` <a href="${CONFIG.website}" target="_blank" rel="noopener">Zur Website</a>`}`;
      // KI-Tutor: Rückfragen zur selben Aufgabe (Stufe „Pro + KI“). Der Verlauf bleibt nur hier im Bild, gespeichert wird nichts.
      const nachfragen = (out, erste) => {
        const verlauf = [{ wer: 'ki', text: erste }];
        const form = h(`<form class="ki-frage" novalidate><label for="ki-text">Noch eine Frage dazu? ${marke('ki')}</label><div class="row"><input class="field grow" id="ki-text" type="text" maxlength="300" autocomplete="off" placeholder="z. B. Warum mal 2?"><button class="btn small" type="submit">Fragen</button></div></form>`);
        form.onsubmit = async (ev) => {
          ev.preventDefault();
          const feld = form.querySelector('input'), knopf = form.querySelector('button'), text = feld.value.trim();
          if (text.length < 2 || knopf.disabled) return;
          knopf.disabled = true; feld.disabled = true;
          const ich = h('<div class="note ki-ich"></div>'); ich.textContent = text; form.before(ich);
          const warte = h('<div class="note tip ki-laedt">Der Tutor antwortet<span aria-hidden="true"></span></div>'); form.before(warte);
          const r = await api.frage({ frage: String(q.prompt).replace(/<[^>]+>/g, '').slice(0, 400), formel: String(q.formula || '').slice(0, 300), richtig: richtigTex().slice(0, 200), gewaehlt: gewaehlt.slice(0, 200),
            verlauf: verlauf.slice(-6), text, geraet: store.geraet, ...(store.zugangGilt() ? { zugang: store.zugang.code } : {}) });
          const div = h('<div class="note"></div>'); div.className = `note ${r.ok && r.text ? 'ok' : 'tip'}`;
          if (r.ok && r.text) { div.textContent = String(r.text).replace(/<[^>]*>/g, '').slice(0, 900); verlauf.push({ wer: 'ich', text }, { wer: 'ki', text: div.textContent }); feld.value = ''; }
          else if (r.status === 402) div.innerHTML = `<b>Rückfragen an den Tutor gehören zur Stufe „Pro + KI“.</b>${kauf()}`;
          else div.textContent = r.status === 429 ? 'Dein KI-Guthaben für heute ist aufgebraucht. Morgen geht es weiter.' : (r.error || 'Der Tutor ist gerade nicht erreichbar.');
          warte.replaceWith(div);
          if (r.ok && Number.isInteger(r.rest)) { form.querySelector('.ki-rest')?.remove(); form.append(h(`<small class="muted ki-rest">Heute noch ${r.rest} KI-Punkte.</small>`)); }
          const zu = r.status === 402 || r.status === 429 || verlauf.length >= 13;   // nach sechs Rückfragen ist Schluss – dann lieber die Aufgabe noch einmal rechnen
          knopf.disabled = zu; feld.disabled = zu; if (!zu) feld.focus();
        };
        out.append(form);
      };
      const erklaer = async () => {
        if (note.querySelector('.ki') || !(await kiBereit()) || note.querySelector('.ki') || !note.isConnected) return;
        const box = h(`<div class="ki"><small class="muted">Noch nicht klar? Die KI erklärt es anders ${marke('ki')}</small><div class="picks">${[['einfacher', 'Einfacher erklären'], ['beispiel', 'Mit Beispiel'], ['eselsbruecke', 'Eselsbrücke']].map(([k, n]) => `<button class="pick" type="button" data-k="${k}">${n}</button>`).join('')}</div><div class="ki-out" aria-live="polite"></div><small class="muted ki-hinweis">Dafür gehen nur die Aufgabe und deine Antwort an einen KI-Dienst – kein Name, kein Lernstand.</small></div>`);
        box.querySelectorAll('button').forEach((b) => { b.onclick = async () => {
          const out = box.querySelector('.ki-out'); box.querySelectorAll('button').forEach((x) => { x.disabled = true; });
          out.innerHTML = '<div class="note tip ki-laedt">Die Erklärung wird geschrieben. Das dauert ein paar Sekunden<span aria-hidden="true"></span></div>';
          const r = await api.erklaer({ frage: String(q.prompt).replace(/<[^>]+>/g, '').slice(0, 400), formel: String(q.formula || '').slice(0, 300), richtig: richtigTex().slice(0, 200), gewaehlt: gewaehlt.slice(0, 200), art: b.dataset.k, geraet: store.geraet, ...(store.zugangGilt() ? { zugang: store.zugang.code } : {}) });
          const div = h('<div class="note"></div>');
          div.className = `note ${r.ok && r.text ? 'ok' : 'tip'}`;
          if (r.status === 402) {   // die drei kostenlosen Proben sind verbraucht
            // In der Android-App kein Verweis auf einen Kauf außerhalb (Regel des Play Store) – dort nur das Code-Feld.
            div.innerHTML = `<b>Deine drei kostenlosen Erklärungen sind aufgebraucht.</b> Mit „Pro + KI“ geht es weiter.${kauf()}`;
          } else div.textContent = r.ok && r.text ? String(r.text).replace(/<[^>]*>/g, '').slice(0, 900) : r.status === 429 ? 'Dein KI-Guthaben für heute ist aufgebraucht. Morgen geht es weiter.' : (r.error || 'Die Erklärung ist gerade nicht erreichbar.');
          const rest = r.ok && Number.isInteger(r.rest) && r.rest >= 0 ? h(`<small class="muted ki-rest">${r.art === 'probe' ? (r.rest === 0 ? 'Das war deine letzte kostenlose Erklärung.' : `Noch ${r.rest} von 3 kostenlosen Erklärungen.`) : `Heute noch ${r.rest} KI-Punkte.`}</small>`) : '';
          out.replaceChildren(div, rest);
          if (r.ok && r.text && kiArt('frage')) nachfragen(out, String(r.text).slice(0, 900), b.dataset.k); box.querySelectorAll('button').forEach((x) => { x.disabled = false; });
        }; });
        if (kiArt('rechenweg')) box.append(rechenwegFeld(q, richtigTex()));   // erst nach den Erklär-Knöpfen anhängen: Die bekommen oben ihre eigene Aufgabe
        note.append(box);
      };
      const stuck = () => { wrongHere++; if (wrongHere >= 2) queueMicrotask(erklaer); if (wrongHere === 2 && !solved) note.insertAdjacentHTML('beforeend', `<div class="weg-wrap">${weg()}</div>`); };
      el.innerHTML = `
        <div class="q">
          ${opts.kopf ? `<div class="kopf">${opts.kopf}</div>` : ''}
          <div class="mission"><b class="tag">${qi + 1}/${sequence.length}</b><p>${q.prompt}</p></div>
          ${q.graph ? '<div class="stage"><canvas aria-label="Graph"></canvas></div>' : ''}
          ${q.formula ? `<div class="formula" id="q-f">${tex(q.formula, true)}</div>` : ''}
          <div id="q-body"></div>
          <div id="q-note"></div>
          <div class="row"><button class="btn ghost small" id="q-tip" type="button" ${lv >= 5 ? 'hidden' : ''}>Tipp</button><span class="grow"></span>
            <button class="btn" id="q-next" type="button" hidden>Weiter</button></div>
        </div>`;
      const body = el.querySelector('#q-body'), note = el.querySelector('#q-note'), next = el.querySelector('#q-next'), tip = el.querySelector('#q-tip');

      if (q.graph) {
        plot = new Plot(el.querySelector('canvas'), q.graph.view);
        const draw = () => {
          plot.clear(); plot.grid(); plot.fn(q.graph.f, { width: 4 });
          if (q.graph.mark) plot.dot(q.graph.mark[0], q.graph.mark[1], { r: 6, color: cssVar('--orange') });
        };
        plot.onResize = draw; draw();
      }

      const finish = () => {
        solved = true; tip.hidden = true; next.hidden = false;
        if (firstTry) {
          store.record(q.topic, true); opts.onRight?.(q);
          combo++; store.max('komboMax', combo);
          if (combo >= 2) { const b = Math.min(combo - 1, 5); store.bonus(b); kombo = `<span class="kombo" id="q-kombo">Kombo ×${combo} · +${b}</span> `; }
        } else { opts.onWrong?.(q); combo = 0; }
        note.innerHTML = `<div class="note ok">${kombo}<b>Richtig.</b> ${q.explain}</div>${firstTry ? '' : `<div class="weg-wrap">${weg()}</div>`}`;
        if (!firstTry) erklaer();
        ctx.progress((qi + 1) / sequence.length);
        buzz();
      };

      if (q.type === 'gap') {
        const picked = q.slots.map(() => null);
        const formula = h(`<div class="formula">${tex(q.show(null, null), true)}</div>`);
        body.append(formula);
        q.slots.forEach((slot, si) => {
          const row = h(`<div class="gaprow"><span>${slot.label}</span><div class="picks"></div></div>`);
          slot.choices.forEach((c) => {
            const b = h(`<button class="pick" type="button">${tex(ft(c))}</button>`);
            b.addEventListener('click', () => {
              if (solved) return;
              row.querySelectorAll('.pick').forEach((n) => n.classList.remove('sel', 'wrong'));
              b.classList.add('sel'); picked[si] = c;
              formula.innerHTML = tex(q.show(picked[0], picked[1]), true);
              check.disabled = picked.includes(null);
            });
            row.querySelector('.picks').append(b);
          });
          body.append(row);
        });
        const check = h('<button class="btn block" type="button" disabled>Prüfen</button>');
        check.addEventListener('click', () => {
          const bad = q.slots.map((s, i) => picked[i] !== s.correct);
          if (!bad.includes(true)) {
            body.querySelectorAll('.pick.sel').forEach((n) => n.classList.add('right'));
            check.hidden = true; finish(); return;
          }
          mistakes++; sfx('bad'); miss();
          body.querySelectorAll('.gaprow').forEach((row, i) => { if (bad[i]) row.querySelector('.pick.sel')?.classList.add('wrong'); });
          note.innerHTML = `<div class="note bad"><b>Noch nicht.</b> ${bad[0] ? 'Der Vorfaktor stimmt nicht: alter Vorfaktor mal alter Exponent.' : 'Der Exponent stimmt nicht: Er wird um 1 kleiner.'}</div>`;
        });
        body.append(h('<div style="height:4px"></div>'), check);
      } else if (asInput) {
        const sh = spec.sh;
        let wrongN = 0;
        const form = h(`<form class="tipp" novalidate><label for="q-in">${sh.pre || 'Ergebnis'}</label>
          <input id="q-in" type="text" inputmode="${sh.frac || /-/.test(sh.plain) || q.options.some((o) => o.num < 0) ? 'text' : 'decimal'}" autocomplete="off" autocapitalize="off" maxlength="12" aria-label="Dein Ergebnis"${window.__mtTest ? ` data-sol="${sh.plain}"` : ''}>
          ${sh.post ? `<span>${sh.post}</span>` : ''}<button class="btn small" type="submit">Prüfen</button></form>`);
        const inp = form.querySelector('input');
        const hint = h(`<small class="muted">${sh.frac ? 'Als Bruch (zum Beispiel 3/4) oder als Dezimalzahl.' : /,/.test(sh.plain) ? `Runde auf ${sh.plain.split(',')[1].length} ${sh.plain.split(',')[1].length === 1 ? 'Nachkommastelle' : 'Nachkommastellen'}.` : 'Tippe dein Ergebnis ein.'}</small>`);
        form.addEventListener('submit', (ev) => {
          ev.preventDefault();
          if (solved) return;
          const v = parseInput(inp.value);
          if (v === null) { note.innerHTML = '<div class="note tip">Bitte eine Zahl eintippen, zum Beispiel 3,5 oder 7/4.</div>'; inp.focus(); return; }
          if (isRight(v, spec.num, sh.plain)) { inp.classList.add('ok'); inp.classList.remove('no'); inp.readOnly = true; form.querySelector('button').hidden = true; finish(); return; }
          mistakes++; wrongN++; sfx('bad'); miss(); inp.classList.add('no');
          gewaehlt = inp.value.trim();
          const why = diagnose(v, q, spec.faktor);
          note.innerHTML = `<div class="note bad"><b>${why ? 'Typischer Fehler.' : 'Noch nicht.'}</b> ${why || 'Rechne noch einmal nach – oder nimm einen Tipp.'}</div>`;
          stuck();
          if (wrongN >= 2 && !form.querySelector('#q-wahl')) {
            const w = h('<button class="btn ghost small" id="q-wahl" type="button">Auswahl zeigen</button>');
            w.onclick = () => { asInput = false; body.replaceChildren(); choices(); note.innerHTML = ''; };
            form.after(w);
          }
        });
        inp.addEventListener('input', () => inp.classList.remove('no'));
        body.append(form, hint);
      } else choices();

      function choices() {
        const box = h('<div class="opts"></div>');
        q.options.forEach((o, i) => {
          const b = h(`<button class="opt" type="button"><span class="k">${'ABCD'[i]}</span><span>${o.html ?? tex(o.tex)}</span></button>`);
          b.addEventListener('click', () => {
            if (solved || b.classList.contains('wrong')) return;
            if (o.correct) {
              b.classList.add('right');
              box.querySelectorAll('.opt').forEach((n) => { n.disabled = true; });
              finish();
            } else {
              mistakes++; sfx('bad'); miss();
              b.classList.add('wrong'); gewaehlt = o.tex || '';
              note.innerHTML = `<div class="note bad"><b>Typischer Fehler.</b> ${o.why}</div>`;
              stuck();
            }
          });
          box.append(b);
        });
        body.append(box);
      }

      tip.addEventListener('click', () => {
        if (tipN >= q.hints.length) return;
        sfx('tap');
        note.innerHTML = `<div class="note tip"><b>Tipp ${tipN + 1}.</b> ${q.hints[tipN]}</div>`;
        tipN++;
        if (tipN >= q.hints.length) tip.disabled = true; else tip.textContent = 'Noch ein Tipp';
      });
      next.addEventListener('click', () => {
        if (qi < sequence.length - 1) { qi++; show(); window.scrollTo(0, 0); return; }
        ctx.done({ stars: mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1, mistakes });
      });
    }

    show();
    return () => plot?.destroy();
  };
}

/** Erklär-Karten („Benennen"): cards = [{title, html}] */
export function info(cards) {
  const lauf = (el, ctx) => {
    let i = 0;
    function show() {
      const c = cards[i];
      el.innerHTML = `
        <div class="info">
          <div class="card"${merkZuTitel(c.title) ? ` data-merk="${merkZuTitel(c.title)}"` : ''}><span class="eyebrow">${c.eyebrow || 'Das steckt dahinter'}</span><h2>${c.title}</h2>${c.html}</div>
          <div class="dots">${cards.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('')}</div>
          <div class="row">${i > 0 ? '<button class="btn ghost" id="i-back" type="button">Zurück</button>' : ''}
            <button class="btn grow" id="i-next" type="button">${i < cards.length - 1 ? 'Weiter' : 'Verstanden'}</button></div>
        </div>`;
      merkbilderEinsetzen(el);   // bewegtes Merkbild, wenn es zu dieser Karte eines gibt
      el.querySelector('#i-back')?.addEventListener('click', () => { i--; show(); });
      el.querySelector('#i-next').addEventListener('click', () => {
        if (i < cards.length - 1) { i++; ctx.progress(i / cards.length); show(); window.scrollTo(0, 0); return; }
        ctx.done({ stars: 3 });
      });
    }
    show();
  };
  lauf.cards = cards;   // für die Theorie-Seiten: dieselben Karten als Lesetext
  return lauf;
}
