// Start-Wache: Bleibt die Seite leer, weil das Programm nicht geladen werden konnte (schwaches Netz, abgebrochener Abruf),
// lädt sie einmal von selbst neu. Hilft das nicht, erscheint ein klarer Hinweis mit Knopf – nie eine leere Seite.
// Bewusst ein einfaches Skript ohne Abhängigkeiten: Es muss auch dann laufen, wenn sonst nichts geladen wurde.
(function () {
  var MERK = 'mt.wache', warte = window.__mtWacheMs || 12000;
  function zahl() { try { return +sessionStorage.getItem(MERK) || 0; } catch (e) { return 1; } }
  function merke(n) { try { sessionStorage.setItem(MERK, String(n)); } catch (e) { /* privater Modus */ } }
  // Ladebild (steht in index.html): Der Balken zeigt, wie viele der Programm-Dateien schon da sind.
  var SOLL = 'mt.ladeN', lade = document.getElementById('lade'), balken = document.getElementById('lade-balken'), da = 0, soll = 85, weit = 4, schau = null;
  try { soll = +localStorage.getItem(SOLL) || soll; } catch (e) { /* privater Modus */ }
  function zeig() {
    if (!balken) return;
    var p = Math.min(96, Math.round(100 * da / soll));
    if (p <= weit) return;
    weit = p; balken.style.animation = 'none'; balken.style.width = p + '%';
    if (balken.parentNode) balken.parentNode.setAttribute('aria-valuenow', String(p));
  }
  function ladebildWeg() {
    if (schau) { try { schau.disconnect(); } catch (e) { /* egal */ } schau = null; }
    if (!lade) return;
    var l = lade; lade = null;
    if (balken) { balken.style.animation = 'none'; balken.style.width = '100%'; }
    l.className = 'weg'; setTimeout(function () { if (l.parentNode) l.parentNode.removeChild(l); }, 260);
  }
  try {
    schau = new PerformanceObserver(function (liste) { da += liste.getEntries().filter(function (e) { return /\.(js|css)(\?|$)/.test(e.name); }).length; zeig(); });
    schau.observe({ type: 'resource', buffered: true });
  } catch (e) { /* alter Browser: Der Balken läuft dann von selbst */ }
  window.__mtGestartet = function () {
    window.__mtBereit = true;
    try { performance.mark('mt-bereit'); } catch (e) { /* egal */ }
    try { sessionStorage.removeItem(MERK); if (da > 20) localStorage.setItem(SOLL, String(da)); } catch (e) { /* egal */ }
    ladebildWeg();
  };
  setTimeout(function () {
    if (window.__mtBereit) return;
    if (zahl() < 1 && navigator.onLine !== false) { merke(1); location.reload(); return; }
    var v = document.getElementById('view');
    ladebildWeg();
    if (!v || v.children.length) return;
    v.innerHTML = '<div class="view stack" id="wache"><section class="card stack"><h2>Der Mathe-Trainer lädt gerade nicht</h2>'
      + '<p>Wahrscheinlich ist die Internet-Verbindung zu schwach. Prüfe sie kurz und versuche es noch einmal – dein Lernstand ist sicher auf diesem Gerät gespeichert.</p>'
      + '<button class="btn block" id="wache-neu" type="button">Neu laden</button></section></div>';
    document.getElementById('wache-neu').onclick = function () { merke(0); location.reload(); };
  }, warte);
}());
