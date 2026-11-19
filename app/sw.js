// Service Worker: macht die App offline nutzbar und liefert Updates aus.
// CACHE muss zur VERSION in js/config.js passen; ASSETS pflegt `npm run fix` (tools/check.mjs).
const CACHE = 'mathetrainer-2.5.4';
const ASSETS = [
  "./",
  "b/app.js",
  "b/teil-6YPP5Y2A.js",
  "b/teil-7JFIQ52I.js",
  "b/teil-AEZ25ZGF.js",
  "b/teil-AS6KYEIB.js",
  "b/teil-AUE25XH7.js",
  "b/teil-AZWTSUU2.js",
  "b/teil-FWQ24JPX.js",
  "b/teil-IDKPAFEY.js",
  "b/teil-IU2Q2TH3.js",
  "b/teil-KTQ3GSC6.js",
  "b/teil-LCORL54V.js",
  "b/teil-LS4AAZS5.js",
  "b/teil-MHDY67UO.js",
  "b/teil-MJBLGJXL.js",
  "b/teil-MS54AG6X.js",
  "b/teil-NIO7452L.js",
  "b/teil-NXK5KEGM.js",
  "b/teil-Q46Z3GML.js",
  "b/teil-Q5PUZU4U.js",
  "b/teil-RL45PKN5.js",
  "b/teil-RUYDIZ5N.js",
  "b/teil-U2NXPJCT.js",
  "b/teil-W6SVZTH4.js",
  "b/teil-WWL5D3SO.js",
  "b/teil-Y6JZNNOX.js",
  "b/teil-YZAHFDPL.js",
  "b/teil-ZKBBX4PM.js",
  "css/app.css",
  "fonts/inter-latin-wght-normal.woff2",
  "img/apple-touch-icon.png",
  "img/favicon.svg",
  "img/icon-192.png",
  "img/icon-512.png",
  "img/icon-maskable-512.png",
  "img/symbol.svg",
  "js/familie.js",
  "js/look.js",
  "js/wache.js",
  "manifest.webmanifest",
  "vendor/katex/fonts/KaTeX_AMS-Regular.woff2",
  "vendor/katex/fonts/KaTeX_Caligraphic-Bold.woff2",
  "vendor/katex/fonts/KaTeX_Caligraphic-Regular.woff2",
  "vendor/katex/fonts/KaTeX_Fraktur-Bold.woff2",
  "vendor/katex/fonts/KaTeX_Fraktur-Regular.woff2",
  "vendor/katex/fonts/KaTeX_Main-Bold.woff2",
  "vendor/katex/fonts/KaTeX_Main-BoldItalic.woff2",
  "vendor/katex/fonts/KaTeX_Main-Italic.woff2",
  "vendor/katex/fonts/KaTeX_Main-Regular.woff2",
  "vendor/katex/fonts/KaTeX_Math-BoldItalic.woff2",
  "vendor/katex/fonts/KaTeX_Math-Italic.woff2",
  "vendor/katex/fonts/KaTeX_SansSerif-Bold.woff2",
  "vendor/katex/fonts/KaTeX_SansSerif-Italic.woff2",
  "vendor/katex/fonts/KaTeX_SansSerif-Regular.woff2",
  "vendor/katex/fonts/KaTeX_Script-Regular.woff2",
  "vendor/katex/fonts/KaTeX_Size1-Regular.woff2",
  "vendor/katex/fonts/KaTeX_Size2-Regular.woff2",
  "vendor/katex/fonts/KaTeX_Size3-Regular.woff2",
  "vendor/katex/fonts/KaTeX_Size4-Regular.woff2",
  "vendor/katex/fonts/KaTeX_Typewriter-Regular.woff2",
  "vendor/katex/katex.min.css",
  "vendor/katex/katex.min.js"
];

// Jede Datei einzeln laden: Fehlt eine Nebendatei (z. B. ein Bild), wird trotzdem installiert.
// Nur die Startseite selbst ist Pflicht.
self.addEventListener('install', (ev) => {
  ev.waitUntil(caches.open(CACHE).then(async (c) => {
    await c.add('./');
    const res = await Promise.allSettled(ASSETS.filter((a) => a !== './').map((a) => c.add(a)));
    const missing = res.filter((r) => r.status === 'rejected').length;
    if (missing) console.warn(`Mathe-Trainer: ${missing} Datei(en) konnten nicht vorgeladen werden.`);
  }));
});

self.addEventListener('activate', (ev) => {
  ev.waitUntil(
    caches.keys()
      // Nur eigene Caches löschen (gemeinsame Adresse lernen.… mit anderen Apps). „mt-“ ist das alte Präfix und wird nur auf der
      // alten Adresse aufgeräumt, wo kein anderer Cache liegen kann.
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE && (k.startsWith('mathetrainer-') || (k.startsWith('mt-') && !/^lernen(-test)?\./.test(location.hostname)))).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (ev) => { if (ev.data === 'skip') self.skipWaiting(); });

self.addEventListener('fetch', (ev) => {
  const req = ev.request;
  const ziel = new URL(req.url);
  // Anfragen an den Server-Teil (/api/…) fasst der Service Worker nicht an: nie aus dem Speicher, immer direkt.
  if (req.method !== 'GET' || ziel.origin !== location.origin || ziel.pathname.startsWith('/api/') || ziel.pathname.startsWith('/zaehler/') || ziel.pathname.startsWith('/eltern/')) return;
  ev.respondWith(
    caches.open(CACHE).then((c) => c.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req).catch(() => (req.mode === 'navigate' ? c.match('./') : Response.error())))),
  );
});

// Erinnerungen (nur wenn der Nutzer sie eingeschaltet hat): Mitteilung anzeigen, beim Antippen die App öffnen.
self.addEventListener('push', (ev) => {
  let text = 'Zeit für deine Mathe-Runde';
  try { const d = ev.data?.json(); if (d && typeof d.text === 'string') text = d.text.slice(0, 120); } catch { /* Standardtext */ }
  ev.waitUntil(self.registration.showNotification('Mathe-Trainer', { body: text, icon: 'img/icon-192.png', badge: 'img/icon-192.png', tag: 'mt-erinnerung' }));
});
self.addEventListener('notificationclick', (ev) => {
  ev.notification.close();
  ev.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => (list[0] ? list[0].focus() : self.clients.openWindow('./'))));
});
