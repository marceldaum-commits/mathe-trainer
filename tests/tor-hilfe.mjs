// Hilfen für Browser-Tests: das Eltern-Tor lösen (Aufgabe in Worten lesen, Ziffern tippen) und die Einstellungen für Eltern öffnen.
const WORT = { dreizehn: 13, vierzehn: 14, 'fünfzehn': 15, sechzehn: 16, siebzehn: 17, achtzehn: 18, neunzehn: 19, sechs: 6, sieben: 7, acht: 8, neun: 9 };
/** Löst das Tor, falls es gerade offen steht (oder innerhalb von ms erscheint). Liefert true, wenn gelöst wurde. */
export async function torFalls(p, ms = 1500) {
  try { await p.waitForSelector('#eltern-tor', { timeout: ms }); } catch { return false; }
  const [a, b] = (await p.textContent('#tor-aufgabe')).toLowerCase().split(' mal ');
  for (const z of String(WORT[a] * WORT[b])) await p.click(`#eltern-tor [data-z="${z}"]`);
  await p.click('#eltern-tor [data-z="ok"]'); await p.waitForSelector('#eltern-tor', { state: 'detached' });
  return true;
}
/** Einstellungen: „Für Eltern“ antippen und das Tor lösen (wenn es nicht schon offen ist). */
export async function einstellungenAuf(p) {
  await p.waitForSelector('#st-eltern-wrap', { state: 'attached' });
  if (await p.locator('#st-eltern-auf').isVisible()) { await p.click('#st-eltern-auf'); await torFalls(p); }
  await p.waitForSelector('#st-eltern-wrap:not([hidden])');
}
