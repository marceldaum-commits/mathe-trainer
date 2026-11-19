// Hell/Dunkel wie auf mathenachhilfe-online.com: gespeicherte Wahl, sonst die Einstellung des Geräts.
// Läuft vor dem ersten Zeichnen (kein Aufblitzen). Die Wahl liegt nur im Browser (localStorage "mathetrainer.look").
// Umzug auf die gemeinsame Adresse (19.11.2026): alte Schlüssel „mt.…“ einmalig in „mathetrainer.…“ umbenennen –
// nur diese eigenen, fest aufgezählten Schlüssel; nichts anderes wird angefasst. Läuft als allererstes Skript.
(function () {
  var alt = ['v1', 'eltern', 'kirest', 'klang', 'ladeN', 'look', 'sound', 'vorlesen', 'wache', 'zaehlung'];
  try {
    for (var i = 0; i < alt.length; i++) {
      var a = 'mt.' + alt[i], n = 'mathetrainer.' + alt[i], w = localStorage.getItem(a);
      if (w === null) continue;
      if (localStorage.getItem(n) === null) localStorage.setItem(n, w);
      localStorage.removeItem(a);
    }
  } catch (e) { /* privater Modus oder voller Speicher: dann bleibt es beim alten Schlüssel */ }
  // Umzug von der alten Adresse: #umzug=<id>.<key>[&bisheriger Hash] sofort aus der Adresse nehmen (der Router sieht nur den Rest)
  // und merken, ob hier vorher schon ein Lernstand lag (übernommen wird nur in einen leeren Speicher; umzug.js).
  try {
    var m = /^#umzug=([\w.-]+)(?:&(.*))?$/.exec(location.hash);
    if (m) {
      sessionStorage.setItem('mathetrainer-umzug', JSON.stringify({ t: m[1], leer: localStorage.getItem('mathetrainer.v1') === null }));
      history.replaceState(null, '', location.pathname + location.search + (m[2] ? '#' + m[2] : ''));
    }
  } catch (e) { /* ohne Speicher kein Umzug – „Wiederherstellen“ im Elternbereich bleibt */ }
})();
(function () {
  var l = null;
  try { l = localStorage.getItem('mathetrainer.look'); } catch (e) { /* privater Modus */ }
  if (l !== 'dunkel' && l !== 'hell') l = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dunkel' : 'hell';
  document.documentElement.setAttribute('data-look', l);
})();
