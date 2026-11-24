// KI-Kennzeichnung (KI-Verordnung Art. 50; Recht V7 freigegeben 19.11.2026): Jede Antwort einer KI trägt sichtbar den Hinweis, dass sie Fehler enthalten kann.
// KI-Aufgaben tragen zusätzlich „im Gerät nachgerechnet“ – aber NUR, wenn die Prüfung im Gerät (toQuestion) wirklich gelaufen ist (Auflage von Recht).
export const KI_ANTWORT = 'Antwort einer KI – sie kann Fehler enthalten.';
/** Kleiner Hinweis-Block unter einer KI-Antwort. Maschinenlesbar (Recht V36/K4): Der Hinweis und das umgebende Antwort-Feld tragen
 *  data-ki-erzeugt="true"; ein Modellname (data-ki-modell) kommt nur, wenn der Server ihn mitschickt (r.modell). */
export function kiHinweis(r = {}) {
  const s = document.createElement('small'); s.className = 'muted ki-marke'; s.textContent = KI_ANTWORT; s.style.display = 'block';
  const modell = typeof r?.modell === 'string' ? r.modell.replace(/[^\w .:-]/g, '').slice(0, 60) : '';
  const setze = (el) => { el.setAttribute('data-ki-erzeugt', 'true'); if (modell) el.setAttribute('data-ki-modell', modell); };
  setze(s); queueMicrotask(() => { if (s.parentElement) setze(s.parentElement); });   // der Aufrufer hängt den Hinweis gleich an das Antwort-Feld
  return s;
}
/** Beim Kopieren von KI-Text kommt der Vermerk „KI-erzeugt“ mit in die Zwischenablage. Einmal beim Start. */
export function kiKopierVermerk(d = globalThis.document) {
  d?.addEventListener?.('copy', (e) => {
    const sel = d.getSelection?.(); if (!sel || sel.isCollapsed || !e.clipboardData) return;
    const hin = (n) => (n?.nodeType === 1 ? n : n?.parentElement)?.closest?.('[data-ki-erzeugt]');
    if (!hin(sel.anchorNode) && !hin(sel.focusNode)) return;
    e.clipboardData.setData('text/plain', `${sel.toString()}\n[KI-erzeugt]`); e.preventDefault();
  });
}
/** Hinweis bei KI-Aufgaben: „nachgerechnet“ nur mit geprueft === true, sonst „nicht nachgerechnet“. */
export const kiAufgabeText = (geprueft) => `Von einer KI erstellt${geprueft === true ? ' und im Gerät nachgerechnet.' : ' – nicht nachgerechnet.'}`;
