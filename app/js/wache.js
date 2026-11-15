// Start-Wache: Bleibt die Seite leer, weil das Programm nicht geladen werden konnte (schwaches Netz, abgebrochener Abruf),
// lädt sie einmal von selbst neu. Hilft das nicht, erscheint ein klarer Hinweis mit Knopf – nie eine leere Seite.
// Bewusst ein einfaches Skript ohne Abhängigkeiten: Es muss auch dann laufen, wenn sonst nichts geladen wurde.
(function () {
  var MERK = 'mt.wache', warte = window.__mtWacheMs || 12000;
  function zahl() { try { return +sessionStorage.getItem(MERK) || 0; } catch (e) { return 1; } }
  function merke(n) { try { sessionStorage.setItem(MERK, String(n)); } catch (e) { /* privater Modus */ } }
  window.__mtGestartet = function () { window.__mtBereit = true; try { sessionStorage.removeItem(MERK); } catch (e) { /* egal */ } };
  setTimeout(function () {
    if (window.__mtBereit) return;
    if (zahl() < 1 && navigator.onLine !== false) { merke(1); location.reload(); return; }
    var v = document.getElementById('view');
    if (!v || v.children.length) return;
    v.innerHTML = '<div class="view stack" id="wache"><section class="card stack"><h2>Der Mathe-Trainer lädt gerade nicht</h2>'
      + '<p>Wahrscheinlich ist die Internet-Verbindung zu schwach. Prüfe sie kurz und versuche es noch einmal – dein Lernstand ist sicher auf diesem Gerät gespeichert.</p>'
      + '<button class="btn block" id="wache-neu" type="button">Neu laden</button></section></div>';
    document.getElementById('wache-neu').onclick = function () { merke(0); location.reload(); };
  }, warte);
}());
