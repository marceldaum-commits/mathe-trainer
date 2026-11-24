// KI-Kennzeichnung (KI-Verordnung Art. 50; Recht V7 freigegeben 19.11.2026): Jede Antwort einer KI trägt sichtbar den Hinweis, dass sie Fehler enthalten kann.
// KI-Aufgaben tragen zusätzlich „im Gerät nachgerechnet“ – aber NUR, wenn die Prüfung im Gerät (toQuestion) wirklich gelaufen ist (Auflage von Recht).
export const KI_ANTWORT = 'Antwort einer KI – sie kann Fehler enthalten.';
/** Kleiner Hinweis-Block unter einer KI-Antwort. */
export function kiHinweis() {
  const s = document.createElement('small'); s.className = 'muted ki-marke'; s.textContent = KI_ANTWORT; s.style.display = 'block'; return s;
}
/** Hinweis bei KI-Aufgaben: „nachgerechnet“ nur mit geprueft === true, sonst „nicht nachgerechnet“. */
export const kiAufgabeText = (geprueft) => `Von einer KI erstellt${geprueft === true ? ' und im Gerät nachgerechnet.' : ' – nicht nachgerechnet.'}`;
