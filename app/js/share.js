// Erfolgskarte: ein Bild (1080 × 1350) mit Ergebnis und Logo – zum Teilen oder Speichern. Entsteht nur im Gerät.
import { CONFIG } from './config.js';
import { toast } from './ui.js';

let logo = null;
const loadLogo = () => (logo ||= new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = 'img/favicon.svg'; }));

function wrap(g, text, x, y, maxW, lh) {
  let line = '';
  for (const w of String(text).split(' ')) {
    if (g.measureText(`${line} ${w}`).width > maxW && line) { g.fillText(line, x, y); y += lh; line = w; } else line = line ? `${line} ${w}` : w;
  }
  if (line) g.fillText(line, x, y);
  return y + lh;
}

/** Zeichnet die Karte auf die übergebene Zeichenfläche. data: { kicker, big, unit, lines: [..] } */
export async function drawCard(canvas, data) {
  const W = 1080, H = 1350; canvas.width = W; canvas.height = H;
  const g = canvas.getContext('2d');
  const grad = g.createLinearGradient(0, 0, W, H); grad.addColorStop(0, '#101b43'); grad.addColorStop(1, '#0b1330');
  g.fillStyle = grad; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(255,116,24,.16)'; g.beginPath(); g.arc(W - 120, 170, 330, 0, 7); g.fill();
  g.fillStyle = 'rgba(115,224,169,.10)'; g.beginPath(); g.arc(90, H - 210, 280, 0, 7); g.fill();
  const im = await loadLogo();
  g.fillStyle = '#000'; g.beginPath(); g.roundRect(80, 80, 120, 120, 28); g.fill();
  if (im) g.drawImage(im, 92, 92, 96, 96);
  g.fillStyle = '#fff'; g.textBaseline = 'alphabetic'; g.font = '800 46px Inter, Arial, sans-serif'; g.fillText('Mathe-Trainer', 228, 132);
  g.fillStyle = '#c4d0e9'; g.font = '500 30px Inter, Arial, sans-serif'; g.fillText(`von ${CONFIG.firma}`, 228, 178);
  g.fillStyle = '#ff7418'; g.font = '900 34px Inter, Arial, sans-serif'; g.fillText(String(data.kicker || '').toUpperCase(), 80, 400);
  g.fillStyle = '#73e0a9'; g.font = '800 300px Inter, Arial, sans-serif'; g.fillText(String(data.big), 68, 690);
  g.fillStyle = '#fff'; g.font = '800 76px Inter, Arial, sans-serif'; g.fillText(String(data.unit || ''), 80, 800);
  g.fillStyle = '#c4d0e9'; g.font = '500 42px Inter, Arial, sans-serif';
  let y = 900; for (const l of data.lines || []) y = wrap(g, l, 80, y, W - 160, 58);
  g.fillStyle = '#ff7418'; g.beginPath(); g.roundRect(80, H - 190, W - 160, 110, 26); g.fill();
  g.fillStyle = '#fff'; g.font = '800 40px Inter, Arial, sans-serif'; g.textAlign = 'center';
  g.fillText(CONFIG.website.replace(/^https?:\/\/(www\.)?|\/$/g, ''), W / 2, H - 120); g.textAlign = 'left';
  return canvas;
}

/** Teilt die Karte als Bild; ohne Teilen-Funktion wird sie gespeichert. */
export async function shareCard(canvas, text, url) {
  const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
  if (!blob) { toast('Bild konnte nicht erzeugt werden.'); return 'fehler'; }
  const file = new File([blob], 'mathe-trainer.png', { type: 'image/png' });
  try {
    if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], text: url ? `${text} ${url}` : text, title: 'Mathe-Trainer' }); return 'geteilt'; }
  } catch (e) { if (e?.name === 'AbortError') return 'abbruch'; }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'mathe-trainer.png';
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  toast('Bild gespeichert.'); return 'gespeichert';
}

/** Baustein: Vorschau der Karte mit Teilen-Knopf. */
export function cardBox(data, text, url) {
  const box = document.createElement('div'); box.className = 'sharebox';
  box.innerHTML = '<canvas class="sharecard" aria-label="Erfolgskarte"></canvas><button class="btn ghost block" type="button" id="sc-share">Als Bild teilen</button>';
  const cv = box.querySelector('canvas');
  drawCard(cv, data);
  box.querySelector('button').onclick = () => shareCard(cv, text, url);
  return box;
}
