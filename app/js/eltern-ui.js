// Karte „Eltern-Handy koppeln“ (Einstellungen und eigene Seite #/eltern, erreichbar über „Mehr“). Logik: eltern.js.
import { $, h, esc, ICON, toast, sfx } from './ui.js';
import { familieKarte } from './familie-ui.js';
import { kopplung, koppeln, elternLink, senden, aufheben, sicherungHolen, uebernehmen, hatLernstand } from './eltern.js';

const zeit = (iso) => { try { return new Date(iso).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }); } catch { return ''; } };
const STATUS = { ok: 'Bericht gesendet.', warten: 'Gerade erst gesendet – der nächste Bericht geht nach der nächsten Lern-Sitzung raus.', netz: 'Keine Verbindung – der Bericht geht raus, sobald wieder Netz da ist.', ungueltig: 'Diese Kopplung gilt nicht mehr. Bitte aufheben und neu koppeln.', fehler: 'Senden hat nicht geklappt – bitte später noch einmal versuchen.', aus: '' };

/** Die Karte; male() zeichnet sie je nach Zustand neu. */
export function elternKarte() {
  const el = h('<section class="card stack" id="eltern"></section>');
  const male = () => {
    const k = kopplung();
    if (!k) {
      el.innerHTML = `<h3>Eltern-Handy koppeln</h3>
        <small class="muted">Eltern sehen dann auf ihrem eigenen Handy, wie viel geübt wurde, was schon sitzt und wo es hakt – ohne Konto. Der Bericht wird hier im Gerät verschlüsselt; der Server kann ihn nicht lesen. Aufheben geht jederzeit.</small>
        <label class="stack" style="gap:4px"><small><b>Spitzname</b> (freiwillig, steht dann über dem Bericht)</small><input class="field" id="el-name" type="text" maxlength="20" autocomplete="off" placeholder="z. B. Lea"></label>
        <button class="btn" id="el-los" type="button">Eltern-Handy koppeln</button>
        <small class="muted">Bei gekoppeltem Eltern-Handy wird zusätzlich eine Ende-zu-Ende-verschlüsselte Sicherung des Lernstands gespeichert (siehe Datenschutzerklärung 10i). So geht beim Handywechsel nichts verloren.</small>
        ${WIEDER}`;
      wiederVerdrahten();
      $('#el-los', el).onclick = async () => {
        sfx('tap'); koppeln($('#el-name', el).value); male();
        const r = await senden({ sofort: true }); if (!el.isConnected) return; male(); const s = $('#el-status', el); if (s && r !== 'ok') s.textContent = STATUS[r] || '';
      };
      return;
    }
    const link = elternLink(k);
    el.innerHTML = `<h3>Eltern-Handy gekoppelt</h3>
      <small class="muted">Mit dem Handy der Eltern den Code scannen oder den Link schicken. Der Link ist der Schlüssel zum Bericht – nur an die Eltern weitergeben.</small>
      <div class="eltern-qr" id="el-qr" aria-label="QR-Code mit dem Link für die Eltern"></div>
      <div class="row"><button class="btn grow" id="el-teilen" type="button">Link teilen</button><button class="btn ghost grow" id="el-senden" type="button">Senden</button></div>
      <small class="muted" id="el-status" role="status">${k.fehler ? esc(STATUS[k.fehler] || '') : k.gesendet ? `Zuletzt gesendet: ${esc(zeit(k.gesendet))}${k.name ? ` · Spitzname: ${esc(k.name)}` : ''}` : 'Noch nicht gesendet.'}</small>
      <small class="muted">Nach jeder Lern-Sitzung geht der Bericht von selbst raus (höchstens alle 10 Minuten).</small>
      <small class="muted">Dazu wird der Lernstand verschlüsselt gesichert (siehe Datenschutzerklärung 10i). Auf einem neuen Gerät: „Fortschritt wiederherstellen“ und diesen Link einfügen.</small>
      <button class="btn ghost small" id="el-weg" type="button">Kopplung aufheben</button>`;
    import('./qrcode.js').then(({ default: qrcode }) => {
      const qr = qrcode(0, 'M'); qr.addData(link); qr.make();
      const ziel = $('#el-qr', el); if (ziel) ziel.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
    }).catch(() => { const ziel = $('#el-qr', el); if (ziel) ziel.textContent = link; });
    $('#el-teilen', el).onclick = async () => {
      try { if (navigator.share) await navigator.share({ title: 'Mathe-Trainer – Bericht für Eltern', text: 'Hier siehst du, wie ich im Mathe-Trainer übe:', url: link }); else { await navigator.clipboard.writeText(link); toast('Link kopiert.'); } } catch { /* abgebrochen */ }
    };
    $('#el-senden', el).onclick = async () => { const b = $('#el-senden', el); b.disabled = true; const r = await senden({ sofort: true }); if (!el.isConnected) return; male(); const s = $('#el-status', el); if (s && r !== 'ok') s.textContent = STATUS[r] || ''; };
    $('#el-weg', el).onclick = async () => {
      const b = $('#el-weg', el); b.disabled = true;
      const r = await aufheben(); if (!el.isConnected) return;
      if (r === 'ok') { toast('Kopplung aufgehoben. Der Bericht ist gelöscht.'); male(); } else { b.disabled = false; $('#el-status', el).textContent = 'Keine Verbindung – zum Aufheben braucht es Internet. Bitte gleich noch einmal versuchen.'; }
    };
  };
  // Fortschritt wiederherstellen (neues Gerät): Kopplungs-Link einfügen → Sicherung holen → nachfragen → übernehmen
  const GRUND = { link: 'Das ist kein Kopplungs-Link. Er endet auf „#…“ und kommt von der Eltern-Seite („Fortschritt übertragen“).', keine: 'Keine Sicherung gefunden.', 'andere-app': 'Dieser Link gehört zu einer anderen App.', schluessel: 'Der Link passt nicht zur Sicherung – bitte genau kopieren.', netz: 'Keine Verbindung – bitte gleich noch einmal versuchen.' };
  function wiederVerdrahten() {
    const los = $('#el-wieder-los', el), note = $('#el-wieder-note', el); if (!los) return;
    los.onclick = async () => {
      los.disabled = true; note.textContent = 'Wird geholt …';
      const s = await sicherungHolen($('#el-wieder-link', el).value); los.disabled = false;
      if (!s.ok) { note.textContent = GRUND[s.grund] || GRUND.netz; return; }
      const fertig = () => { uebernehmen(s); toast('Fortschritt übernommen.'); setTimeout(() => location.reload(), 600); };
      if (!hatLernstand()) { fertig(); return; }
      note.innerHTML = `<b>Auf diesem Gerät gibt es schon Lernstand.</b> Soll er durch die Sicherung${s.stand ? ` vom ${esc(zeit(s.stand))}` : ''} ersetzt werden?<div class="row" style="margin-top:8px"><button class="btn small" id="el-wieder-ja" type="button">Ja, ersetzen</button><button class="btn ghost small" id="el-wieder-nein" type="button">Abbrechen</button></div>`;
      $('#el-wieder-ja', el).onclick = fertig;
      $('#el-wieder-nein', el).onclick = () => { note.textContent = 'Nichts geändert.'; };
    };
  }
  male();
  return el;
}
const WIEDER = `<details class="el-wieder"><summary>Neues Gerät? Fortschritt wiederherstellen</summary>
  <div class="stack" style="margin-top:8px"><small class="muted">Auf der Eltern-Seite „Neues Gerät des Kindes? Fortschritt übertragen“ tippen und den Link hier einfügen.</small>
  <input class="field" id="el-wieder-link" type="url" autocomplete="off" placeholder="Kopplungs-Link einfügen" aria-label="Kopplungs-Link einfügen">
  <button class="btn ghost" id="el-wieder-los" type="button">Fortschritt wiederherstellen</button><div id="el-wieder-note" role="status" class="muted"></div></div></details>`;

/** Eigene Seite #/eltern (über „Mehr“). */
export function elternView() {
  const el = h(`<div class="view stack"><a class="back" href="#/mehr">${ICON.left} Mehr</a>
    <div><span class="eyebrow">Für Eltern</span><h1 style="margin-top:8px">Eltern-Handy koppeln</h1></div></div>`);
  el.append(familieKarte(), elternKarte());
  return { el };
}
