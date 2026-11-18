// „App installieren“ (Marcel, 18.11.2026: für die nächsten Monate nur die Web-App, installierbar als PWA).
// Erscheint nur, wenn die App noch nicht installiert ist: Android/Chrome/Edge über beforeinstallprompt (ein Tippen),
// iPhone/iPad mit kurzer Anleitung „Teilen → Zum Home-Bildschirm“. Sonst (z. B. Firefox am Rechner) nichts.
import { h, toast } from './ui.js';
import { installiert } from './erinnern.js';

let angebot = null;   // das aufgehobene beforeinstallprompt-Ereignis
export const installAngebot = () => angebot;
const melder = new Set();
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('beforeinstallprompt', (ev) => { ev.preventDefault(); angebot = ev; window.__mtInstall = ev; melder.forEach((f) => f()); });
  window.addEventListener('appinstalled', () => { angebot = null; window.__mtInstall = null; melder.forEach((f) => f()); toast('Installiert. Der Mathe-Trainer liegt jetzt bei deinen Apps.'); });
}
/** iPhone/iPad (auch iPad mit Desktop-Kennung) – dort gibt es kein Installations-Fenster, nur „Zum Home-Bildschirm“. */
export const istIos = (nav = globalThis.navigator) => /iPhone|iPad|iPod/.test(nav?.userAgent || '') || (nav?.platform === 'MacIntel' && nav?.maxTouchPoints > 1);

/** Karte „App installieren“ – oder null (schon installiert, oder dieses Gerät kann es nicht). wo: 'start' | 'einstellungen' */
export function installKarte(wo = 'start') {
  if (installiert()) return null;
  const ios = istIos();
  if (!angebot && !ios) return null;
  const el = h(`<section class="card install stack" id="install-${wo}">
    <h3>App installieren</h3><small class="muted">Dann liegt der Mathe-Trainer wie eine App auf deinem Startbildschirm – startet schneller, auch ohne Internet, und hält sich selbst aktuell.</small>
    ${angebot ? '<button class="btn block" type="button" id="install-los">App installieren</button>' : ''}
    ${ios && !angebot ? '<ol class="install-ios"><li>Unten auf <b>Teilen</b> tippen (Quadrat mit Pfeil nach oben).</li><li><b>Zum Home-Bildschirm</b> wählen.</li><li>Oben rechts auf <b>Hinzufügen</b> tippen.</li></ol><small class="muted">Das geht in Safari. In einem anderen Browser erst die Seite in Safari öffnen.</small>' : ''}
  </section>`);
  el.querySelector('#install-los')?.addEventListener('click', async () => {
    const ev = angebot; if (!ev) return;
    try { ev.prompt(); const w = await ev.userChoice; if (w?.outcome === 'accepted') { angebot = null; window.__mtInstall = null; el.remove(); } } catch { /* schon benutzt */ }
  });
  return el;
}
/** Bei neuem Angebot oder nach der Installation Bescheid geben (Seite neu zeichnen). */
export function beiInstallWechsel(f) { melder.add(f); return () => melder.delete(f); }
