// Zentrale Einstellungen. VERSION muss mit CACHE in ../sw.js übereinstimmen (npm run check prüft das).
export const VERSION = '0.18.0';
// Datum dieser Version (TT.MM.JJJJ). Setzt `npm run fix` von selbst, sobald VERSION erhöht wurde; `npm run check` prüft das Format.
export const STAND = '14.11.2026';

export const CONFIG = {
  // Server-Teil (Klassen-Rangliste): eingeschaltet am 13.11.2026 nach Übergabe (25) des Leitstands. Leer = abgeschaltet.
  api: '/api',
  // KI-Erklärungen („Erklär's mir anders“), nur mit api. false = aus, true = überall an,
  // 'test' = nur dort, wo der Server sich selbst als Testseite meldet (GET /api/status → stufe: "test", ki: true).
  // Stand 14.11.2026: vom Leitstand nur für die Testseite freigegeben; live erst nach seiner Ansage.
  ki: 'test',
  // Erinnerung aufs Handy: eingeschaltet am 13.11.2026 nach Übergabe (30) des Leitstands. Den öffentlichen Schlüssel holt die App vom Server (GET /api/push/schluessel).
  push: true,
  // Rückmeldungen („Fehler melden“): Adresse des Servers (siehe docs/SERVER.md; eingeschaltet am 13.11.2026 nach Übergabe (28) des Leitstands). Leer = Versand aus, Meldungen warten im Gerät.
  melden: '/api/meldung',
  firma: 'Mathenachhilfe Online',
  website: 'https://www.mathenachhilfe-online.com/',
  probestunde: 'https://www.mathenachhilfe-online.com/probestunde/',
  impressum: 'https://www.mathenachhilfe-online.com/impressum/',
  datenschutz: 'https://www.mathenachhilfe-online.com/datenschutz/#mathe-trainer',
};
