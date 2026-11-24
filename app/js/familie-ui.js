// Karte „Familie“ (Familien-Speicher aller Lern-Apps) – nur hinter dem Eltern-Tor (Einstellungen › Für Eltern und Seite #/eltern). Logik: familie-sync.js.
import { $, h, esc, toast, sfx } from './ui.js';
import { store } from './store.js';
import * as FS from './familie-sync.js';

const zeit = (iso) => { try { return new Date(iso).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }); } catch { return ''; } };
const GRUND = { netz: 'Keine Verbindung – bitte später noch einmal versuchen.', link: 'Das ist kein Familien-Link. Er enthält „#familie=…“ und kommt aus der Familien-Seite einer Lern-App.', keine: 'Dazu gibt es auf dem Server noch nichts.',
  'familie-weg': FS.FAMILIE_WEG, 'code-unbekannt': 'Diesen Code kennen wir nicht, oder er ist abgelaufen.', 'code-gesperrt': 'Dieser Code ist gesperrt.', 'code-vergeben': 'Dieser Code gehört schon zu einer anderen Familie.',
  schreibrecht: 'Dafür fehlt auf diesem Gerät das Schreibrecht.', 'zu-oft': 'Zu viele Versuche – bitte später noch einmal.', einwilligung: 'Bitte erst „Einverstanden“ antippen.', nummer: 'Die Familien-Nummer stimmt nicht.', 'noch-nicht-live': 'Der Familien-Speicher ist noch nicht freigeschaltet.' };
const text = (r) => GRUND[r?.grund] || 'Das hat gerade nicht geklappt.';
/** Sicherheitshinweis (Recht V8) – dauerhaft auf der Familien-Seite und bei Link, QR-Code und Notfall-Blatt. */
const sicher = () => `<small class="muted fa-sicher" role="note">${esc(FS.SICHERHEITSHINWEIS)}</small>`;
/** Einwilligung (Recht A6): nur dieser Text, Link zur Datenschutzerklärung, Knopf nicht vorausgewählt. */
const einwilligung = (knopf) => `<div class="fa-einw"><p>${esc(FS.PFLICHTTEXT)}</p><p><a href="${FS.DSE_10M}" target="_blank" rel="noopener">Mehr dazu in der Datenschutzerklärung (Abschnitt 10m)</a></p>
  <div class="row"><button class="btn" id="fa-ok" type="button">${knopf}</button><button class="btn ghost" id="fa-nein" type="button">Abbrechen</button></div><small class="muted" id="fa-note" role="status"></small></div>`;

export function familieKarte() {
  const el = h('<section class="card stack" id="familie"></section>');
  const male = async () => {
    const z = FS.lies();
    if (!z) {
      const weg = FS.wegGemeldet(); if (weg) FS.wegQuittieren();
      el.innerHTML = `<h3>Familie</h3>${weg ? `<div class="note tip">${esc(FS.FAMILIE_WEG)}</div>` : ''}
        <small class="muted">Alle Lern-Apps der Familie sichern ihren Lernstand gemeinsam – auch auf mehreren Geräten. Es gibt kein Konto. Mit „Familie anlegen“ beginnt ihr neu, mit „Beitreten“ nutzt ihr den Link eines anderen Geräts.</small>
        <div class="row"><button class="btn grow" id="fa-neu" type="button">Familie anlegen</button><button class="btn ghost grow" id="fa-bei" type="button">Beitreten</button></div><div id="fa-form"></div>`;
      $('#fa-neu', el).onclick = () => formAnlegen(); $('#fa-bei', el).onclick = () => formBeitreten(); return;
    }
    const nr = await FS.nummer(); if (!el.isConnected && !el.parentNode) return;
    const kinder = z.kinder || [];
    el.innerHTML = `<h3>Familie verbunden</h3><small class="muted">Familien-Nummer: <b id="fa-nr">${esc(nr)}</b> (zum Finden bei einer Wiederherstellung; sie öffnet nichts).</small>
      ${sicher()}
      <div class="stack" id="fa-kinder"></div>
      <div class="row"><button class="btn small" id="fa-sichern" type="button">Jetzt sichern</button><button class="btn small ghost" id="fa-laden" type="button">Stand holen</button></div>
      <small class="muted" id="fa-status" role="status">${z.gesichert ? `Zuletzt gesichert: ${esc(zeit(z.gesichert))}.` : ''}</small>
      <details class="fa-teil"><summary><b>Link, QR-Code und Notfall-Blatt</b></summary><div class="stack" id="fa-blatt"></div></details>
      <details class="fa-teil"><summary><b>Zugang und Rechte</b></summary><div class="stack" id="fa-rechte"><small class="muted">Wird geladen …</small></div></details>
      <details class="fa-teil"><summary><b>Protokoll</b></summary><div class="stack" id="fa-prot"><small class="muted">Wird geladen …</small></div></details>
      <details class="fa-teil"><summary><b>Familie löschen</b></summary><div class="stack">
        <div class="note bad">Das löscht die Familie in ALLEN Lern-Apps: alle Lernstände aller Kinder auf unserem Server, die Notfall-Kopie und das Protokoll. Gekaufte Codes werden wieder frei und lassen sich in einer neuen Familie erneut einlösen. Die Lernstände auf diesem Gerät bleiben erhalten.</div>
        <label class="stack" style="gap:4px"><small><b>Zur Bestätigung die Familien-Nummer eintippen</b></small><input class="field" id="fa-loesch-nr" type="text" autocomplete="off" autocapitalize="characters" maxlength="12" placeholder="XXXX-XXXX"></label>
        <button class="btn ghost" id="fa-loeschen" type="button" disabled>Familie endgültig löschen</button><small class="muted" id="fa-loesch-note" role="status"></small></div></details>`;
    const kd = $('#fa-kinder', el);
    kd.innerHTML = `<b>Kinder</b>${kinder.map((k) => `<button class="pick ${k.kindId === z.kindId ? 'sel' : ''}" type="button" role="radio" aria-checked="${k.kindId === z.kindId}" data-kind="${esc(k.kindId)}">${esc(k.name || 'Kind')}${k.klasse ? ` · Kl. ${esc(k.klasse)}` : ''}</button>`).join('')}
      <details class="fa-teil"><summary>Weiteres Kind hinzufügen</summary><div class="stack"><input class="field" id="fa-k-name" type="text" maxlength="20" placeholder="Spitzname (freiwillig)" autocomplete="off"><button class="btn small" id="fa-k-neu" type="button">Hinzufügen</button></div></details>`;
    kd.querySelectorAll('[data-kind]').forEach((b) => { b.onclick = async () => { sfx('tap'); const r = await FS.kindWaehlen(b.dataset.kind); if (!r.ok) $('#fa-status', el).textContent = text(r); else { toast('Stand geladen.'); if (r.geaendert) setTimeout(() => location.reload(), 500); else male(); } }; });
    $('#fa-k-neu', el).onclick = async () => { const r = await FS.kindHinzu({ name: $('#fa-k-name', el).value, klasse: String(store.jahrgang) }); if (r.ok) { toast('Kind hinzugefügt.'); male(); } else $('#fa-status', el).textContent = text(r); };
    $('#fa-sichern', el).onclick = async () => { const b = $('#fa-sichern', el); b.disabled = true; const r = await FS.sichern(); b.disabled = false; if (r.ok) male(); else $('#fa-status', el).textContent = text(r); if (r.grund === 'familie-weg') male(); };
    $('#fa-laden', el).onclick = async () => { const r = await FS.laden(); if (!r.ok) { $('#fa-status', el).textContent = text(r); if (r.grund === 'familie-weg') male(); } else if (r.geaendert) { toast('Stand übernommen.'); setTimeout(() => location.reload(), 500); } else $('#fa-status', el).textContent = 'Dieses Gerät ist auf dem neuesten Stand.'; };
    // Link, QR-Code, Notfall-Blatt
    FS.blatt().then(async (b) => { const ziel = $('#fa-blatt', el); if (!b || !ziel) return;
      ziel.innerHTML = `${sicher()}<div class="eltern-qr" id="fa-qr" aria-label="QR-Code mit dem Familien-Link"></div>${sicher()}
        <div class="row"><button class="btn small grow" id="fa-teilen" type="button">Link teilen</button><button class="btn small ghost grow" id="fa-kop" type="button">Notfall-Blatt kopieren</button></div>${sicher()}
        <pre class="fa-notfall" id="fa-notfall" style="white-space:pre-wrap;word-break:break-all;font-size:calc(13px*var(--fs,1))">${esc(b.text)}</pre>`;
      import('./qrcode.js').then(({ default: qrcode }) => { const q = qrcode(0, 'M'); q.addData(b.link); q.make(); const x = $('#fa-qr', el); if (x) x.innerHTML = q.createSvgTag({ cellSize: 4, margin: 2, scalable: true }); }).catch(() => { const x = $('#fa-qr', el); if (x) x.textContent = b.link; });
      $('#fa-teilen', el).onclick = async () => { try { if (navigator.share) await navigator.share({ title: 'Familie – Mathenachhilfe Online', text: 'Familien-Zugang für die Lern-Apps:', url: b.link }); else { await navigator.clipboard.writeText(b.link); toast('Link kopiert.'); } } catch { /* abgebrochen */ } };
      $('#fa-kop', el).onclick = async () => { try { await navigator.clipboard.writeText(b.text); toast('Notfall-Blatt kopiert.'); } catch { toast('Kopieren geht hier nicht – bitte den Text markieren.'); } }; });
    // Rechte
    const rechteMalen = async () => { const ziel = $('#fa-rechte', el); const r = await FS.rechte();
      if (!r.ok) { if (ziel) ziel.innerHTML = `<small class="muted">${esc(text(r))}</small>`; return; }
      const liste = r.daten?.rechte || [];
      ziel.innerHTML = `${liste.length ? `<ul class="rep-list">${liste.map((x) => `<li>${esc(x.app || '')} · ${esc(x.produkt || '')}${x.bis ? ` · bis ${esc(x.bis.split('-').reverse().join('.'))}` : ''}${x.ki === true ? ' · mit KI' : ''}</li>`).join('')}</ul>` : '<small class="muted">Noch kein Zugang eingelöst.</small>'}
        <div class="row push-row"><input class="field" id="fa-code" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="140" placeholder="Zugangscode" aria-label="Zugangscode"><button class="btn small" id="fa-code-go" type="button">Einlösen</button></div><small class="muted" id="fa-code-note" role="status"></small>`;
      $('#fa-code-go', el).onclick = async () => { const note = $('#fa-code-note', el); note.textContent = 'Wird geprüft …'; const e = await FS.einloesen($('#fa-code', el).value); if (e.ok) { toast('Zugang eingelöst.'); rechteMalen(); } else note.textContent = text(e); }; };
    $('#fa-rechte', el).closest('details').addEventListener('toggle', (ev) => { if (ev.target.open) rechteMalen(); }, { once: true });
    $('#fa-prot', el).closest('details').addEventListener('toggle', async (ev) => { if (!ev.target.open) return; const r = await FS.protokoll(); const ziel = $('#fa-prot', el); if (!ziel) return;
      ziel.innerHTML = r.ok ? ((r.daten?.eintraege || []).length ? `<ul class="rep-list">${r.daten.eintraege.map((x) => `<li>${esc((x.t || '').replace('T', ' '))} · ${esc(String(x.art || '').replace('code_eingeloest:', 'Code eingelöst: ').replace('angelegt', 'Familie angelegt').replace('wiederhergestellt', 'Wiederherstellung').replace('admin_abfrage', 'Abfrage durch Mathenachhilfe Online'))}</li>`).join('')}</ul>` : '<small class="muted">Noch keine Einträge.</small>') : `<small class="muted">${esc(text(r))}</small>`; }, { once: true });
    // Löschen
    const nrFeld = $('#fa-loesch-nr', el), lb = $('#fa-loeschen', el);
    nrFeld.oninput = () => { lb.disabled = !/^[0-9A-Za-z\- ]{8,12}$/.test(nrFeld.value.trim()); };
    lb.onclick = async () => { lb.disabled = true; const r = await FS.loeschen(nrFeld.value); if (r.ok) { toast('Familie gelöscht. Der Lernstand auf diesem Gerät bleibt.'); male(); } else { $('#fa-loesch-note', el).textContent = text(r); lb.disabled = false; } };
  };
  function formAnlegen() {
    $('#fa-form', el).innerHTML = `${einwilligung('Einverstanden – Familie anlegen')}`;
    const f = $('#fa-form', el); f.querySelector('.fa-einw').insertAdjacentHTML('afterbegin', '<label class="stack" style="gap:4px"><small><b>Spitzname</b> (freiwillig)</small><input class="field" id="fa-name" type="text" maxlength="20" autocomplete="off"></label>');
    $('#fa-nein', el).onclick = () => male();
    $('#fa-ok', el).onclick = async () => { const b = $('#fa-ok', el), n = $('#fa-note', el); b.disabled = true; n.textContent = 'Wird angelegt …'; const r = await FS.anlegen({ einverstanden: true, name: $('#fa-name', el).value }); if (r.ok) { toast('Familie angelegt.'); male(); } else { b.disabled = false; n.textContent = text(r); } };
  }
  function formBeitreten() {
    $('#fa-form', el).innerHTML = `<label class="stack" style="gap:4px"><small><b>Familien-Link</b> (aus der Familien-Seite eines anderen Geräts)</small><input class="field" id="fa-link" type="text" autocomplete="off" autocapitalize="off" spellcheck="false"></label>${einwilligung('Einverstanden – Familie beitreten')}`;
    $('#fa-nein', el).onclick = () => male();
    $('#fa-ok', el).onclick = async () => { const b = $('#fa-ok', el), n = $('#fa-note', el); b.disabled = true; n.textContent = 'Wird verbunden …'; const r = await FS.beitreten($('#fa-link', el).value, { einverstanden: true });
      if (!r.ok) { b.disabled = false; n.textContent = text(r); return; }
      if (r.kindId) { await FS.kindWaehlen(r.kindId); toast('Familie verbunden.'); setTimeout(() => location.reload(), 500); return; }
      const f = $('#fa-form', el); f.innerHTML = `<b>Welches Kind ist das?</b>${r.kinder.map((k) => `<button class="pick" type="button" data-kind="${esc(k.kindId)}">${esc(k.name || 'Kind')}${k.klasse ? ` · Kl. ${esc(k.klasse)}` : ''}</button>`).join('')}<small class="muted" id="fa-note"></small>`;
      f.querySelectorAll('[data-kind]').forEach((x) => { x.onclick = async () => { await FS.kindWaehlen(x.dataset.kind); toast('Familie verbunden.'); setTimeout(() => location.reload(), 500); }; }); };
  }
  male();
  return el;
}
