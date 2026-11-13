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

## Erinnerungen in der Play-Store-App (Marcel, 13.11.2026: „erst Schalter, dann Play Store“)

Im Browser hängt die Erlaubnis für Mitteilungen am Browser – deshalb kann sie dort gesperrt oder gelöscht werden.
In der Play-Store-App (TWA) verwaltet **Android** die Mitteilungen wie bei jeder App
(Einstellungen → Apps → Mathe-Trainer → Benachrichtigungen). Dafür braucht die Hülle die
**Benachrichtigungs-Delegation**:

- Bubblewrap: beim Anlegen (`bubblewrap init`) die Frage nach „notification delegation“ mit Ja beantworten bzw. in
  `twa-manifest.json` `"enableNotifications": true` setzen. pwabuilder.com: Option „Notification delegation“ anhaken.
- Ab Android 13 fragt die App beim ersten Einschalten der Erinnerung selbst nach der Erlaubnis – der Schalter in
  den Einstellungen des Trainers löst das aus; am Code der Web-App ändert sich nichts.
- Der Versand bleibt derselbe (Web-Push über den Server des Leitstands).

### Datei für den Server: `/.well-known/assetlinks.json` auf `trainer.mathenachhilfe-online.com`

Inhalt (Paketname und Fingerabdruck trägt ein, wer die Hülle baut – der Fingerabdruck ist nicht geheim, der
Signier-Schlüssel selbst schon):

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "<PAKETNAME, z. B. com.mathenachhilfe_online.trainer>",
    "sha256_cert_fingerprints": ["<SHA-256-FINGERABDRUCK DES SIGNIER-ZERTIFIKATS>"]
  }
}]
```

- Wird die App über „Play App Signing“ von Google signiert, gehört **Googles** Fingerabdruck hinein (Play Console →
  Einrichten → App-Signatur); zusätzlich der eigene Upload-Schlüssel, solange lokal getestet wird.
- Die Datei muss ohne Weiterleitung mit `Content-Type: application/json` ausgeliefert werden. Sie liegt außerhalb
  von `app/` und gehört in die Server-Einrichtung (Leitstand/Verwaltung).
- Prüfen: `https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://trainer.mathenachhilfe-online.com&relation=delegate_permission/common.handle_all_urls`

### Reihenfolge für Marcel

1. Google-Play-Entwicklerkonto anlegen (25 US-Dollar, einmalig).
2. Hülle bauen lassen (Leitstand oder Marcel mit pwabuilder.com): Adresse `https://trainer.mathenachhilfe-online.com/`,
   Benachrichtigungs-Delegation an. Signier-Schlüssel und Passwort **nur** in Bitwarden.
3. Fingerabdruck an den Leitstand → `assetlinks.json` auf den Server.
4. In der Play Console: App anlegen, Datei in die Testspur laden, Tester einladen (Google verlangt bei neuen
   persönlichen Konten eine Testphase mit mehreren Testern), Store-Eintrag und Pflichtangaben ausfüllen.
5. Nach der Testphase: Veröffentlichung beantragen.

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
