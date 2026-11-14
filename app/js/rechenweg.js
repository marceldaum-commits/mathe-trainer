// Rechenweg-Prüfer (Stufe „Pro + KI“): Foto oder abgetippter Rechenweg geht an den Server, die KI zeigt die Stelle
// mit dem ersten Fehler. Das Bild wird vorher im Gerät verkleinert; gespeichert wird nichts.
import { h, esc } from './ui.js';
import { store } from './store.js';
import { CONFIG } from './config.js';
import { api, premiumOn } from './api.js';

export const BILD_MAX_KANTE = 1600;
export const BILD_MAX_BYTES = 1_000_000;
export const TEXT_MAX = 2000;
export const FOTO_HINWEIS = 'Fotografiere nur den Rechenweg – keinen Namen, kein Gesicht, keine Klasse oder Schule.';

/** Zielgröße: längste Kante höchstens BILD_MAX_KANTE, Seitenverhältnis bleibt. */
export function zielMass(b, hoehe, max = BILD_MAX_KANTE) {
  const f = Math.min(1, max / Math.max(b, hoehe, 1));
  return { b: Math.max(1, Math.round(b * f)), h: Math.max(1, Math.round(hoehe * f)) };
}
/** Größe der Bilddaten in Bytes aus der Länge des base64-Texts. */
export const bytesVon = (dataUrl) => Math.floor((String(dataUrl).split(',')[1] || '').length * 0.75);

/** Bild im Gerät verkleinern und als JPEG ausgeben; wird es nicht klein genug, wird die Qualität schrittweise gesenkt. */
export async function verkleinern(datei) {
  const bild = await createImageBitmap(datei);
  let kante = BILD_MAX_KANTE;
  for (let versuch = 0; versuch < 6; versuch++) {
    const { b, h: hh } = zielMass(bild.width, bild.height, kante), c = document.createElement('canvas');
    c.width = b; c.height = hh;
    const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, b, hh); x.drawImage(bild, 0, 0, b, hh);
    const url = c.toDataURL('image/jpeg', versuch < 2 ? 0.8 : 0.65);
    if (bytesVon(url) <= BILD_MAX_BYTES) return url;
    kante = Math.round(kante * 0.75);
  }
  throw new Error('Bild zu groß');
}

/** Baut das Feld „Rechenweg prüfen“ für eine Aufgabe. */
export function rechenwegFeld(q, richtigTex) {
  const box = h(`<details class="rw"><summary>Meinen Rechenweg prüfen lassen</summary>
    <small class="muted">${esc(FOTO_HINWEIS)} Das Bild wird nur für die Antwort verwendet und nicht gespeichert.</small>
    <div class="row"><label class="btn ghost small grow rw-foto">Foto auswählen<input type="file" accept="image/*" capture="environment" hidden></label></div>
    <textarea class="field" rows="3" maxlength="${TEXT_MAX}" placeholder="… oder tippe deinen Rechenweg ab, Zeile für Zeile" aria-label="Rechenweg als Text"></textarea>
    <button class="btn small" type="button" id="rw-go">Prüfen (3 KI-Punkte)</button>
    <div class="rw-out" aria-live="polite"></div></details>`);
  const out = box.querySelector('.rw-out'), datei = box.querySelector('input[type=file]'), text = box.querySelector('textarea'), go = box.querySelector('#rw-go'), lab = box.querySelector('.rw-foto');
  let bild = '';
  datei.onchange = async () => {
    const f = datei.files?.[0]; bild = ''; if (!f) return;
    try { bild = await verkleinern(f); lab.firstChild.textContent = 'Foto gewählt ✓ (anderes wählen)'; out.innerHTML = ''; }
    catch { out.innerHTML = '<div class="note bad">Das Bild konnte nicht gelesen werden. Bitte ein anderes Foto wählen oder den Rechenweg abtippen.</div>'; }
  };
  go.onclick = async () => {
    const t = text.value.trim();
    if (!bild && t.length < 5) { out.innerHTML = '<div class="note tip">Wähle ein Foto oder tippe deinen Rechenweg ab.</div>'; return; }
    go.disabled = true; out.innerHTML = '<div class="note tip ki-laedt">Dein Rechenweg wird geprüft. Das dauert ein paar Sekunden<span aria-hidden="true"></span></div>';
    const r = await api.rechenweg({ frage: String(q.prompt).replace(/<[^>]+>/g, '').slice(0, 400), formel: String(q.formula || '').slice(0, 300), richtig: richtigTex.slice(0, 200),
      ...(bild ? { bild } : { text: t.slice(0, TEXT_MAX) }), geraet: store.geraet, ...(store.zugangGilt() ? { zugang: store.zugang.code } : {}) });
    const div = h('<div class="note"></div>'); div.className = `note ${r.ok && r.text ? 'ok' : 'tip'}`;
    if (r.ok && r.text) {
      div.textContent = String(r.text).replace(/<[^>]*>/g, '').slice(0, 1200);
      if (Number.isInteger(r.zeile) && r.zeile > 0) div.prepend(h(`<b class="rw-zeile">Erster Fehler in Zeile ${r.zeile}. </b>`));
    } else if (r.status === 402) div.innerHTML = `<b>Der Rechenweg-Prüfer gehört zur Stufe „Pro + KI“.</b>${premiumOn() ? ' <a href="#/einstellungen">Zugangscode eingeben</a>' : ''}${window.MTApp ? '' : ` <a href="${CONFIG.website}" target="_blank" rel="noopener">Zur Website</a>`}`;
    else div.textContent = r.status === 429 ? 'Dein KI-Guthaben für heute reicht dafür nicht mehr. Morgen geht es weiter.' : r.status === 413 ? 'Das Bild ist zu groß. Bitte näher herangehen oder den Rechenweg abtippen.' : (r.error || 'Der Prüfer ist gerade nicht erreichbar.');
    out.replaceChildren(div);
    if (r.ok && Number.isInteger(r.rest)) out.append(h(`<small class="muted ki-rest">Heute noch ${r.rest} KI-Punkte.</small>`));
    go.disabled = r.status === 402;
  };
  return box;
}
