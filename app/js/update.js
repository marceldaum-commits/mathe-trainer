// Selbst-Aktualisierung in der Android-App: Die App-Hülle lädt neuere Inhalte selbst (android/…/Update.java)
// und meldet das hier. Im Browser gibt es das nicht – dort aktualisiert der Service Worker.
import { h, esc } from './ui.js';

/** Stand aus der App-Hülle – oder null (Browser, alte App-Datei, unlesbar). */
export function updateStand(app = globalThis.window?.MTApp) {
  if (typeof app?.updateStand !== 'function') return null;
  try {
    const s = JSON.parse(app.updateStand());
    const v = (x) => (typeof x === 'string' && /^\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(x) ? x : '');
    return { kanal: ['test', 'store'].includes(s.kanal) ? s.kanal : 'aus', inhalt: v(s.inhalt), bereit: v(s.bereit), huelle: s.huelle === true && s.kanal === 'test' };
  } catch { return null; }
}

/**
 * Von Hand nach einer neuen Version suchen (Knopf in den Einstellungen).
 * Antwort: { art: 'neu' | 'aktuell' | 'netz' | 'laeuft', text } – in der Android-App über die Hülle, im Browser über den Service Worker.
 */
export function updateSuchen(app = globalThis.window?.MTApp, w = globalThis.window, warte = 45000) {
  if (app) {
    if (typeof app.updateSuchen !== 'function') return Promise.resolve({ art: 'aktuell', text: 'Diese App-Datei sucht bei jedem Start von selbst nach Neuem.' });
    if (updateStand(app)?.kanal === 'aus') return Promise.resolve({ art: 'aktuell', text: 'Diese App-Datei lädt keine Inhalte nach.' });
    return new Promise((fertig) => {
      let t = null;
      const ende = (ev) => { clearTimeout(t); w.removeEventListener('mt-update-fertig', ende);
        const s = updateStand(app);
        if (s?.bereit) return fertig({ art: 'neu', text: `Version ${s.bereit} ist geladen.` });
        if (s?.huelle) return fertig({ art: 'neu', text: 'Es gibt eine neue App-Datei (APK im Test-Ordner) – bitte einmal installieren.' });
        const d = typeof ev?.detail === 'string' ? ev.detail : '';
        if (d === 'ok') return fertig({ art: 'aktuell', text: 'Alles aktuell.' });
        const nr = /^antwort(\d{3})$/.exec(d)?.[1];
        fertig({ art: 'netz', text: nr ? `Der Server antwortet gerade nicht richtig (Meldung ${nr}) – bitte später noch einmal versuchen.`
          : d === 'zeit' ? 'Der Server antwortet zu langsam – bitte später noch einmal versuchen.'
          : d === 'inhalt' ? 'Die neuen Inhalte ließen sich nicht sauber laden – bitte später noch einmal versuchen.'
          : d === 'netz' ? 'Keine Verbindung zum Server – bitte später noch einmal versuchen.'
          : 'Keine Antwort von der App – bitte App schließen, neu öffnen und noch einmal versuchen.' }); };
      w.addEventListener('mt-update-fertig', ende); t = setTimeout(() => ende(null), warte);
      try { app.updateSuchen(); } catch { ende(null); }
    });
  }
  const sw = w?.navigator?.serviceWorker;
  if (!sw?.getRegistration) return Promise.resolve({ art: 'aktuell', text: 'Lade die Seite neu, um die neueste Version zu holen.' });
  return sw.getRegistration().then((reg) => (reg ? reg.update().then(() => reg) : null)).then((reg) => (reg && (reg.installing || reg.waiting)
    ? { art: 'neu', text: 'Neue Version gefunden – sie wird gerade geladen.' } : { art: 'aktuell', text: 'Alles aktuell.' }))
    .catch(() => ({ art: 'netz', text: 'Keine Verbindung – bitte später noch einmal versuchen.' }));
}

/** Der Hinweis-Streifen über der Seite. Leer und versteckt, solange es nichts Neues gibt. */
export function updateLeiste(app = globalThis.window?.MTApp) {
  const el = h('<div class="upd" id="upd" hidden></div>');
  const male = () => {
    const s = updateStand(app);
    const teile = [];
    if (s?.bereit) teile.push(`<div class="upd-zeile"><span><b>Neue Inhalte geladen</b> (Version ${esc(s.bereit)})</span><button class="btn small" id="upd-los" type="button">Jetzt nutzen</button></div>`);
    if (s?.huelle) teile.push('<div class="upd-zeile" id="upd-apk"><span><b>Neue App-Datei verfügbar.</b> Sie wird nicht hier in der App geladen: Die neue APK liegt im Test-Ordner. Einmal installieren (über die alte drüber), deine Daten bleiben erhalten. Bis dahin läuft alles wie bisher.</span></div>');
    el.innerHTML = teile.join(''); el.hidden = !teile.length;
    el.querySelector('#upd-los')?.addEventListener('click', () => { if (typeof app?.updateAnwenden === 'function') app.updateAnwenden(); });
  };
  globalThis.window?.addEventListener('mt-update', male);
  male();
  return el;
}
