# Play Store – Vorbereitung (noch nicht veröffentlicht)

Stand: 13.11.2026. Marcel: „Play Store, wenn die App voller ist.“ Dieses Dokument hält fest, was fertig ist und
welche Schritte nur Marcel bzw. der Leitstand gehen können.

## Weg: Trusted Web Activity (TWA)

Die Web-App wird nicht neu gebaut, sondern in eine kleine Android-Hülle gesteckt, die die Live-Adresse
`https://trainer.mathenachhilfe-online.com` im Vollbild zeigt. Updates kommen weiter über die Website – ohne
neue Store-Version.

## Was die App schon erfüllt

- Installierbare Web-App: `manifest.webmanifest` mit Name, Farben, Symbolen 192/512 und „maskable“-Symbol.
- Service Worker mit Offline-Betrieb und Updates.
- Läuft vollständig über HTTPS auf eigener Adresse, keine fremden Dienste, kein Tracking, keine Werbung Dritter.
- Bedienung auf kleinen Bildschirmen geprüft (360 × 640), Hell/Dunkel, Hochformat.

## Was nur Marcel oder der Leitstand tun kann

1. **Google-Play-Entwicklerkonto** anlegen (einmalig 25 US-Dollar, Ausweis-Prüfung). Für neue persönliche Konten
   verlangt Google vor der Veröffentlichung einen geschlossenen Test mit mehreren Testern über etwa zwei Wochen –
   aktuelle Regeln bitte bei Google nachlesen.
2. **Hülle bauen** (Werkzeug „Bubblewrap“ von Google oder die Website pwabuilder.com): erzeugt die Android-Datei
   und einen **Signier-Schlüssel**. Der Schlüssel ist ein Geheimnis – in Bitwarden ablegen, nie ins Repo.
3. **Datei `/.well-known/assetlinks.json`** auf `trainer.mathenachhilfe-online.com` ablegen (Leitstand/Verwaltung).
   Sie enthält den Fingerabdruck des Signier-Schlüssels und beweist, dass App und Website zusammengehören. Ohne
   sie zeigt die App oben eine Adressleiste. (Hinweis: Der Trainer-Raum liefert nur `app/` aus; diese Datei liegt
   außerhalb und gehört in die Server-Einrichtung.)
4. **Store-Eintrag:** Titel, Kurz- und Langbeschreibung, Bildschirmfotos (liegen als Testbilder vor), Symbol
   512 × 512, Titelbild 1024 × 500, Kategorie „Lernen“.
5. **Pflichtangaben:** Datenschutzerklärung (vorhanden, Abschnitt Mathe-Trainer), Formular „Datensicherheit“
   (die App erhebt ohne Zutun nichts; freiwillig: Spitzname für die Rangliste, Text einer Fehlermeldung),
   Altersfreigabe-Fragebogen, Zielgruppe (Jugendliche – Googles Familien-Richtlinien beachten).

## Was der Trainer-Raum beisteuern kann, sobald es losgeht

- Texte und Bildschirmfotos für den Store-Eintrag.
- Prüfen, dass Manifest und Symbole den Anforderungen der Hülle genügen.
- Nach dem ersten Upload: Test der TWA auf der Testspur.

## iPhone

Als Web-App über „Zum Home-Bildschirm“ installierbar. Der App Store wäre ein eigener, größerer Schritt
(Apple-Entwicklerkonto 99 US-Dollar im Jahr, eigene Hülle, strengere Prüfung von Web-Hüllen).
