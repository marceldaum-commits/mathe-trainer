// Zentrale Einstellungen. VERSION muss mit CACHE in ../sw.js übereinstimmen (npm run check prüft das).
export const VERSION = '0.12.1';

export const CONFIG = {
  // Server-Teil (Klassen-Rangliste): eingeschaltet am 13.11.2026 nach Übergabe (25) des Leitstands. Leer = abgeschaltet.
  api: '/api',
  // KI-Funktionen des Servers einschalten (nur mit api).
  ki: false,
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
