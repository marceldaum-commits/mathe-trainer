// Wo läuft die App? Eine Stelle für Test/Live und alte/neue Adresse (Umzug auf lernen.mathenachhilfe-online.com,
// Marcel 19.11.2026, Standard docs/plattform/appzentrale/UMZUG-LERNEN.md im Repo website_backup).
// Alte Adressen: trainer. / trainer-test. – neue: lernen. / lernen-test. im Ordner /mathetrainer/.
export const host = () => globalThis.location?.hostname || '';
/** Test-Stufe: lernen-test., trainer-test. oder lokal. */
export const istTest = (h = host()) => /^(lernen-test\.|trainer-test\.|localhost$|127\.)/.test(h);
/** Neue gemeinsame Adresse aller Lern-Apps. */
export const aufLernen = (h = host()) => /^lernen(-test)?\./.test(h);
/** Alte Adresse des Mathe-Trainers (von hier wird umgezogen). */
export const alteAdresse = (h = host()) => /^trainer(-test)?\./.test(h);
/** Ziel des Umzugs (mit Schrägstrich am Ende). */
export const neueAdresse = (h = host()) => `https://${/^trainer-test\./.test(h) ? 'lernen-test' : 'lernen'}.mathenachhilfe-online.com/mathetrainer/`;
/**
 * Server-Teil (/api, /zaehler, /eltern) liegt auf dem Trainer-Server. Auf lernen.… zeigen die Abrufe dorthin
 * (CORS richtet der Leitstand ein), sonst bleibt es bei der gleichen Herkunft ('').
 */
export function serverBasis(h = host()) {
  if (/^lernen-test\./.test(h)) return 'https://trainer-test.mathenachhilfe-online.com';
  if (/^lernen\./.test(h)) return 'https://trainer.mathenachhilfe-online.com';
  return '';
}
/** Eindeutiges Präfix aller Speicher-Schlüssel und Caches (gemeinsame Domain mit anderen Apps). */
export const PRAEFIX = 'mathetrainer.';
export const CACHE_PRAEFIX = 'mathetrainer-';
