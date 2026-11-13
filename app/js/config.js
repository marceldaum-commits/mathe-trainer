// Zentrale Einstellungen. VERSION muss mit CACHE in ../sw.js übereinstimmen (npm run check prüft das).
export const VERSION = '0.8.1';

export const CONFIG = {
  // Server-Teil: leer = abgeschaltet. Erst setzen, wenn es den Server gibt (gleiche Adresse, z. B. '/api').
  api: '',
  // KI-Funktionen des Servers einschalten (nur mit api).
  ki: false,
  // Rückmeldungen („Fehler melden“): leer = Versand aus, Meldungen warten im Gerät. Mit Server: '/api/meldung' (siehe docs/SERVER.md).
  melden: '',
  firma: 'Mathenachhilfe Online',
  website: 'https://www.mathenachhilfe-online.com/',
  probestunde: 'https://www.mathenachhilfe-online.com/probestunde/',
  impressum: 'https://www.mathenachhilfe-online.com/impressum/',
  datenschutz: 'https://www.mathenachhilfe-online.com/datenschutz/#mathe-trainer',
};
