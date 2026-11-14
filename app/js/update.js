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

/** Der Hinweis-Streifen über der Seite. Leer und versteckt, solange es nichts Neues gibt. */
export function updateLeiste(app = globalThis.window?.MTApp) {
  const el = h('<div class="upd" id="upd" hidden></div>');
  const male = () => {
    const s = updateStand(app);
    const teile = [];
    if (s?.bereit) teile.push(`<div class="upd-zeile"><span><b>Neue Inhalte geladen</b> (Version ${esc(s.bereit)})</span><button class="btn small" id="upd-los" type="button">Jetzt nutzen</button></div>`);
    if (s?.huelle) teile.push('<div class="upd-zeile"><span><b>Neue App-Datei verfügbar.</b> Sie bringt Neues für Widget oder Erinnerung.</span><button class="btn small ghost" id="upd-apk" type="button">Herunterladen</button></div>');
    el.innerHTML = teile.join(''); el.hidden = !teile.length;
    el.querySelector('#upd-los')?.addEventListener('click', () => app.updateAnwenden?.());
    el.querySelector('#upd-apk')?.addEventListener('click', () => app.apkHolen?.());
  };
  globalThis.window?.addEventListener('mt-update', male);
  male();
  return el;
}
