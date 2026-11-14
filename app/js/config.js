// Zentrale Einstellungen. VERSION muss mit CACHE in ../sw.js übereinstimmen (npm run check prüft das).
export const VERSION = '0.22.0';
// Datum dieser Version (TT.MM.JJJJ). Setzt `npm run fix` von selbst, sobald VERSION erhöht wurde; `npm run check` prüft das Format.
export const STAND = '14.11.2026';

export const CONFIG = {
  // Server-Teil (Klassen-Rangliste): eingeschaltet am 13.11.2026 nach Übergabe (25) des Leitstands. Leer = abgeschaltet.
  api: '/api',
  // KI-Funktionen, nur mit api. false = aus, true = überall dort an, wo der Server sie meldet (GET /api/status → ki: true),
  // 'test' = nur dort, wo der Server sich zusätzlich als Testseite meldet (stufe: "test").
  // Stand 14.11.2026: Verkaufsstart – von Marcel für die Live-Seite freigegeben.
  ki: true,
  // Erinnerung aufs Handy: eingeschaltet am 13.11.2026 nach Übergabe (30) des Leitstands. Den öffentlichen Schlüssel holt die App vom Server (GET /api/push/schluessel).
  push: true,
  // Rückmeldungen („Fehler melden“): Adresse des Servers (siehe docs/SERVER.md; eingeschaltet am 13.11.2026 nach Übergabe (28) des Leitstands). Leer = Versand aus, Meldungen warten im Gerät.
  melden: '/api/meldung',
  firma: 'Mathenachhilfe Online',
  website: 'https://www.mathenachhilfe-online.com/',
  probestunde: 'https://www.mathenachhilfe-online.com/probestunde/',
  impressum: 'https://www.mathenachhilfe-online.com/impressum/',
  // Shop-Seite der Pro-Fassung (nur in der Web-App verlinkt – in der Android-App gibt es keinen Kauflink).
  shop: 'https://www.mathenachhilfe-online.com/produkt/mathe-trainer-pro/',
  datenschutz: 'https://www.mathenachhilfe-online.com/datenschutz/#mathe-trainer',
};
