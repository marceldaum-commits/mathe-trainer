# Play Store – Vorbereitung (noch nicht veröffentlicht)

Stand: 13.11.2026. Marcel: „Play Store, wenn die App voller ist.“ Dieses Dokument hält fest, was fertig ist und
welche Schritte nur Marcel bzw. der Leitstand gehen können.

## Weg: Trusted Web Activity (TWA)

Die Web-App wird nicht neu gebaut, sondern in eine kleine Android-Hülle gesteckt, die die Live-Adresse
`https://trainer.mathenachhilfe-online.com` im Vollbild zeigt. Updates kommen weiter über die Website – ohne
neue Store-Version.

## Erste App-Datei gebaut (13.11.2026)

- Gebaut aus `android/twa-manifest.json` mit Bubblewrap (Java 17, Android-Baupaket 36): Paket
  `com.mathenachhilfe_online.trainer`, Version 1.0.0 (Code 1), ab Android 7, Ziel Android 16, Mitteilungen über
  Android (`POST_NOTIFICATIONS`), vier Kurzbefehle. Die Hülle zeigt `https://trainer.mathenachhilfe-online.com/`.
- Dateien liegen in Marcels Drive-Ordner für die App: `…​.apk` (direkt aufs Handy) und `…​-PlayStore.aab` (für die
  Play Console). Sie stehen **nicht** im Repo.
- **Fingerabdruck des Signier-Zertifikats (SHA-256, nicht geheim):**
  `D6:A4:0D:42:7B:21:36:54:E6:66:F0:24:AD:C9:D2:F8:48:5F:A1:AA:51:26:62:CF:3A:EA:66:27:FE:56:D8:F8`
- **Damit die App im Vollbild läuft**, muss der Leitstand diese Datei auf dem Server ablegen
  (`https://trainer.mathenachhilfe-online.com/.well-known/assetlinks.json`):

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.mathenachhilfe_online.trainer",
    "sha256_cert_fingerprints": ["D6:A4:0D:42:7B:21:36:54:E6:66:F0:24:AD:C9:D2:F8:48:5F:A1:AA:51:26:62:CF:3A:EA:66:27:FE:56:D8:F8"]
  }
}]
```

  Bis dahin funktioniert die App, zeigt aber oben eine schmale Adressleiste.
- Im Play Store kommt später Googles eigener Fingerabdruck dazu („Play App Signing“).
- Beim Bauen in der Cloud-Umgebung aufgefallen: Bubblewrap holt Symbole ohne Proxy – dort die Symbol-Adressen im
  Bauplan vorübergehend auf einen lokalen Server zeigen lassen. `minSdkVersion` muss 24 sein.

## Stand 13.11.2026 (Version 0.14.0): App-Gefühl und Bauplan sind fertig

**In der Web-App selbst (wirkt sofort, auch ohne Play Store, sobald man sie installiert):**
- Kurzbefehle am App-Symbol (lange drücken): Tages-Runde, Blitz-Runde, Wiederholen, Abi-Aufgabe.
- Installations-Dialog mit Vorschaubildern und Beschreibung (`screenshots` im Manifest).
- Dunkelblaue Statusleiste und Startbildschirm in den Firmenfarben; beim Spielen passt sich die Leiste an.
- Zahl am App-Symbol für fällige Wiederholungen (wo Android/der Starter das unterstützt).
- Einmaliger Hinweis „Als App aufs Handy“ auf der Startseite, wegklickbar.
- Schalter „Erinnerung an/aus“ in den Einstellungen.

**Bauplan der Android-Hülle:** `android/twa-manifest.json` (für Googles Werkzeug Bubblewrap): Paketname
`com.mathenachhilfe_online.trainer`, Adresse `trainer.mathenachhilfe-online.com`, Vollbild, Firmenfarben,
Mitteilungen über Android (`enableNotifications`), dieselben Kurzbefehle. Schlüssel-Dateien sind per
`android/.gitignore` vom Repo ausgeschlossen.

**So entsteht daraus die App-Datei** (auf einem Rechner mit Node und Java; macht der Leitstand oder Marcel):

```bash
npm install -g @bubblewrap/cli
```

```bash
cd android && bubblewrap init --manifest=https://trainer.mathenachhilfe-online.com/manifest.webmanifest
```

```bash
bubblewrap build
```

`init` fragt nach dem Signier-Schlüssel und legt ihn an (Passwort wählen, **Schlüssel-Datei und Passwort in
Bitwarden sichern** – geht der Schlüssel verloren, kann die App nie wieder aktualisiert werden). `build` erzeugt
`app-release-bundle.aab` (für den Play Store) und `app-release-signed.apk` (zum direkten Testen auf dem Handy)
und zeigt den Fingerabdruck für die `assetlinks.json` an. Ohne Rechner geht dasselbe über die Website
pwabuilder.com (Adresse eintragen → „Package for stores“ → Android).

**Wichtig:** Erst wenn die `assetlinks.json` mit dem Fingerabdruck auf der Live-Adresse liegt, läuft die App im
Vollbild; vorher zeigt sie oben eine Adressleiste.

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

## Widget für den Startbildschirm (ab App-Datei 1.1.0)

Die Quellen liegen in `android/widget/`: ein kleiner Empfänger (`TrainerWidget.java`), das Aussehen und die Texte.
Das Widget zeigt die **Formel des Tages** (31 feste Sätze, wechselt nach Kalendertag) und drei Knöpfe:
Tages-Runde, Abenteuer, Wiederholen. Es liest keine Daten und sendet nichts.

Einbau nach jedem `bubblewrap init`/`update` (das Werkzeug erzeugt das Projekt neu und kennt das Widget nicht):

```bash
android/widget/einbauen.sh <Ordner des erzeugten Projekts>
```

Danach in `app/build.gradle` `versionCode` und `versionName` erhöhen und `bubblewrap build` ausführen.
Stand 13.11.2026: App-Datei 1.1.0 (versionCode 2) mit Widget gebaut, gleicher Signier-Schlüssel wie 1.0.0.
**Noch nicht auf einem echten Handy geprüft** – hier gibt es kein Android-Gerät.

## Offline-Fassung (ab 0.15.1) – das ist die App, die ausgeliefert wird

Marcels Vorgabe (13.11.2026): Die Android-App muss **ganz ohne Internet** spielbar sein. Die TWA-Hülle oben kann das
erst nach dem ersten Start mit Netz. Deshalb gibt es `android/offline/`: ein eigenes kleines Android-Projekt.

- Beim Bauen wird der Ordner `app/` in die App-Datei kopiert (`www`). `LauncherActivity` zeigt ihn in einem eingebauten
  Browser-Fenster unter der echten Adresse an. Der Lernstand liegt wie in der Web-App im Gerät.
- Nur `/api/…` geht ins Netz (Rangliste, Fehler melden) – wenn es eines gibt. Links zur Website öffnen den Browser.
- Versionsname = `VERSION` aus `app/js/config.js`, Versionsnummer = `Haupt·10000 + Neben·100 + Patch`.
- Widget (`android/widget/`) und Kurzbefehle sind eingebaut.

Bauen (JDK 17, Android-SDK; Schlüssel und Passwort nur über die Umgebung, nie im Repo):

```bash
MT_KEYSTORE=/pfad/android.keystore MT_KEYSTORE_PASS=… android/offline/bauen.sh
```

**Regel: Web-App und App-Datei haben immer dieselbe Version.** Nach jeder neuen Web-Version die App-Datei neu bauen.
Erinnerung (ab 0.15.2): `Erinnerung.java` – Wecker im Gerät, ohne Server; Rechte `POST_NOTIFICATIONS` und `RECEIVE_BOOT_COMPLETED`.
Noch offen: Drucken/Teilen, Prüfung auf einem echten Handy.

## Selbst-Aktualisierung (ab 0.22.0; Marcel, 14.11.2026: „beides zusammen“)

Die App besteht aus der **Hülle** (Android-Teil: Fenster, Widget, Erinnerung) und den **Inhalten** (die Web-App im Ordner `app/`).

- **Inhalte holt sich die App selbst.** Bei jedem Start mit Internet liest sie `app/stand.json` von GitHub (Version, Nummer der
  Hülle, Prüfsumme jeder Datei), lädt nur geänderte Dateien, prüft jede gegen ihre Prüfsumme und nutzt den neuen Stand ab dem
  nächsten Start – oder sofort über den Knopf „Jetzt nutzen“. Geht etwas schief, bleibt alles beim Alten; die eingepackte
  Fassung ist immer die Rückfallebene. Ohne Internet passiert nichts. Kein Rückschritt auf ältere Versionen.
- **Kanal** (beim Bauen über `MT_KANAL`): `test` lädt den Zweig `test` (Marcels Handy, Standard), `store` lädt nur den
  freigegebenen Zweig `live`, `aus` lädt nie. **Für den Play Store immer `MT_KANAL=store` bauen.**
- **Neue Hülle:** `android/huelle.json` zählt die Fassungen der Hülle; `npm run fix` erhöht die Nummer von selbst, sobald sich
  etwas unter `android/` ändert. Erwartet der Test-Stand eine neuere Hülle, zeigt die App (nur Kanal `test`) den Hinweis „Neue
  App-Datei verfügbar“ mit Knopf zum Herunterladen. Die Datei liegt im Zweig `apk` als `Mathe-Trainer.apk`. Im Store-Kanal
  gibt es diesen Hinweis nicht – dort kommt die App über den Store (Store-Regel).
- **Regel für neue Brücken-Funktionen:** Die Inhalte können neuer sein als die Hülle. Jede Funktion von `window.MTApp` deshalb
  immer mit `typeof … === 'function'` absichern.
- **Datenschutz:** Die Android-App fragt beim Start GitHub (raw.githubusercontent.com) nach neuen Dateien. Dabei wird nichts
  über den Nutzer gesendet; GitHub sieht wie jeder Webserver die IP-Adresse. Gehört in die Datenschutzerklärung der App.
- **Prüfen am Rechner:** `bash tests/android/pruefen.sh` (26 Prüfungen: Laden, Prüfsummen, unerlaubte Pfade, kein Rückschritt,
  Netz weg).
