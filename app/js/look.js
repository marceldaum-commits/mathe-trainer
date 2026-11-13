// Hell/Dunkel wie auf mathenachhilfe-online.com: gespeicherte Wahl, sonst die Einstellung des Geräts.
// Läuft vor dem ersten Zeichnen (kein Aufblitzen). Die Wahl liegt nur im Browser (localStorage "mt.look").
(function () {
  var l = null;
  try { l = localStorage.getItem('mt.look'); } catch (e) { /* privater Modus */ }
  if (l !== 'dunkel' && l !== 'hell') l = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dunkel' : 'hell';
  document.documentElement.setAttribute('data-look', l);
})();
