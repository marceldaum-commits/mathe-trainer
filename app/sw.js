// Service Worker: macht die App offline nutzbar und liefert Updates aus.
// CACHE muss zur VERSION in js/config.js passen; ASSETS pflegt `npm run fix` (tools/check.mjs).
const CACHE = 'mt-2.3.3';
const ASSETS = [
  "./",
  "b/app.js",
  "b/teil-2E3UXY2L.js",
  "b/teil-2SO3UCOX.js",
  "b/teil-2XQAWIBH.js",
  "b/teil-63WD7WFM.js",
  "b/teil-7RFESBZB.js",
  "b/teil-CXFPRGGN.js",
  "b/teil-DGROGRXW.js",
  "b/teil-IDJ3TGLE.js",
  "b/teil-JNJUMITK.js",
  "b/teil-KRAJG7PF.js",
  "b/teil-L2DX4ELE.js",
  "b/teil-MHMSWVYU.js",
  "b/teil-MNNEPJCR.js",
  "b/teil-NF74LIHZ.js",
  "b/teil-P3XCD7O5.js",
  "b/teil-Q3DUIFGQ.js",
  "b/teil-R7AD3Y75.js",
  "b/teil-RPN2ALTV.js",
  "b/teil-UC4AGDK7.js",
  "b/teil-UFJGXADT.js",
  "b/teil-UY6WSJHJ.js",
  "b/teil-Y625ZBGB.js",
  "b/teil-YBRZNWKF.js",
  "css/app.css",
  "fonts/inter-latin-wght-normal.woff2",
  "img/apple-touch-icon.png",
  "img/favicon.svg",
  "img/icon-192.png",
  "img/icon-512.png",
  "img/icon-maskable-512.png",
  "img/logo.svg",
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
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('mt-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (ev) => { if (ev.data === 'skip') self.skipWaiting(); });

self.addEventListener('fetch', (ev) => {
  const req = ev.request;
  const ziel = new URL(req.url);
  // Anfragen an den Server-Teil (/api/…) fasst der Service Worker nicht an: nie aus dem Speicher, immer direkt.
  if (req.method !== 'GET' || ziel.origin !== location.origin || ziel.pathname.startsWith('/api/')) return;
  ev.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req).catch(() => (req.mode === 'navigate' ? caches.match('./') : Response.error()))),
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
