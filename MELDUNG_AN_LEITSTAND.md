# Meldung an den Leitstand – Raum „Plattform · Mathe-Trainer"

Neueste Meldung oben. Keine Geheimnisse, keine Personendaten (dieses Repo ist öffentlich, siehe Punkt 1).

## 14.11.2026 (38) – 0.22.0: Android-App aktualisiert ihre Inhalte selbst (Marcels Auftrag)

Nichts für den Server zu tun, aber drei Dinge zur Kenntnis:

1. **Neue Datei `app/stand.json`** (Version + Prüfsumme jeder Datei, erzeugt `npm run fix`). Sie wird mit ausgeliefert, die
   Web-App selbst braucht sie nicht. Die Android-App liest sie von GitHub (raw.githubusercontent.com), nicht von eurem Server.
2. **Zweig `live` wird damit zur Quelle der Store-Fassung:** Eine mit `MT_KANAL=store` gebaute App lädt nach jeder
   Live-Freigabe die neuen Inhalte von selbst aus dem Zweig `live`. Für euch ändert sich am Ablauf nichts. Marcels
   Test-Fassung lädt aus `test`.
3. **Neuer Zweig `apk`** (nur eine Datei: die aktuelle Test-App-Datei zum Herunterladen). Bitte nicht ausliefern.
4. **Datenschutzerklärung:** Bitte einen Satz ergänzen – die Android-App fragt beim Start GitHub nach neuen Dateien; es wird
   nichts über den Nutzer gesendet, GitHub sieht die IP-Adresse.

Einzelheiten: docs/PLAYSTORE.md, Abschnitt „Selbst-Aktualisierung“.

## 14.11.2026 (37) – 0.21.0 liegt auf `test` (alle fünf Browser-Durchläufe grün)

Nur App-Seite, nichts für den Server: neun weitere Merkbilder (jetzt 26) und ein Funkenregen bei richtiger Antwort.
App-Datei 0.21.0 liegt im Drive. Live-Freigabe wie immer durch euch nach Marcels Go.

## 14.11.2026 (36) – 0.20.0 liegt auf `test` (alle fünf Browser-Durchläufe grün)

Enthält alles aus (34) und (35): KI-Aufgaben (mit 202-Wiederholung), KI-Auswertung, Merkbilder, Stufe sichtbar
(`#/pro`, Marken), Theorie im App-Aussehen, aufgeräumte Startseite; Probeklausur und Schwächen-Blatt verlangen bei
`premium: true` einen gültigen Zugang. App-Datei 0.20.0 liegt im Drive (neue APK nötig: ja, wie bei jeder Version der
Offline-Fassung). Bitte testen; Live-Freigabe wie immer durch euch nach Marcels Go.

## 14.11.2026 (35) – Antwort auf euren Auftrag (5 Punkte) und Stand 0.20.0

1. **0.18.0 liegt seit 09:30 auf `test`** (alle fünf Browser-Durchläufe grün): Tutor, Rechenweg-Foto mit Hinweis vor der
   Aufnahme, Guthaben in Punkten, „unbefristet“. Einlösen eines Codes ist seit 0.17.0 drin und im Test abgedeckt
   (falsche Form, unbekannter Code, richtiger Code, Neuladen, Entfernen). **Ihr könnt das Shop-Produkt aus App-Sicht freigeben.**
2. **KI-Sachaufgaben und Auswertung sind gebaut** (inkl. 202-Wiederholung) und stecken in **0.20.0**, das gerade durch den
   Testlauf geht (0.19.0 ist darin aufgegangen). Ich melde hier, sobald es auf `test` liegt.
3. **Themen-Plan als Auswahl für Marcel** – steht unten in dieser Meldung.
4. **Handy-Erinnerung:** fertig seit 0.13.1 (echter Schalter, freie Uhrzeit, Anleitung bei gesperrter Erlaubnis); in der
   Android-Offline-App seit 0.15.2 als geräteinterne Erinnerung ohne Server.
5. **`app/icons` → `app/img`:** abgeschlossen. Den Ordner gibt es nicht mehr, keine Datei der App verweist darauf;
   `tools/check.mjs` lässt den Ordner nicht wieder zu.

**Neu in 0.20.0 nach Marcels Rückmeldung vom Handy** („statisch“, „überladen“, „Pro muss sichtbar sein“): 17 bewegte
Merkbilder, Theorie im App-Aussehen, Stufe unter dem App-Namen und Seite „Deine Stufe“ (`#/pro`), Marken „PRO“/„KI“ an
allen zugehörigen Knöpfen, Startseite aufgeräumt. **Für den Server:** Probeklausur und Schwächen-Blatt verlangen jetzt
ebenfalls einen gültigen Zugang, sobald `premium: true` gemeldet wird (bisher nur Druck/PDF und „Ausführlich“).

**Themen-Plan für den laufenden Ausbau (zur Auswahl durch Marcel)** – je Woche ein Schwerpunkt, täglich ein Paket:
- **A – Lehrplan-Lücken schließen (Vorschlag):** Wurzel- und Umkehrfunktion · Integralfunktion · Newton-Verfahren ·
  zweiseitiger Test · Histogramme · Hesse-Form und Schnittgerade · windschiefe Geraden · Spiegelungen · Ortskurven.
- **B – Pro vertiefen:** Theorie ausführlich für alle 32 Einheiten · Abi-Aufgaben am Stück als PDF · Klausur-Varianten ·
  Lernkarten-Sets · Lern-Auswertung für Eltern.
- **C – Erlebnis:** ein Merkbild für jede Formel · Bildschirm für Bildschirm lebendiger · neue Spiele je Gebiet.
- **D – Klasse 5–10** als zweiter Bereich (eigener Lehrplan-Abgleich, eigenes Großprojekt).
Marcel bekommt die Auswahl im Trainer-Raum als Auswahlfenster; bis dahin fahre ich A, B und C im Wechsel.

## 14.11.2026 (34) – 0.19.0: App-Seite für `/api/ki/aufgabe` und `/api/ki/auswertung`; Merkbilder

- **Angebunden nach euren Angaben:** `aufgabe` (Body `{thema, stufe, stil, geraet, zugang?}`; bei `202 {bereit:false}` wartet die
  App 25 s und fragt bis zu dreimal; `toQuestion()` prüft im Gerät erneut, abgelehnte Aufgaben werden nicht gezeigt) und
  `auswertung` (Body `{ergebnis:[{thema, richtig}], geraet, zugang?}` – nach einem in der App gelösten Arbeitsblatt).
  Einstieg „KI-Aufgaben“ erscheint auf der Prüfungs-Seite nur, wenn `kiArten` „aufgabe“ enthält.
- **Themen-Namen, die die App schickt:** die Themen der vorhandenen Aufgaben-Arten (z. B. „Kettenregel“, „Baumdiagramm“,
  „Spurpunkte“). Falls euer Vorrat andere Namen erwartet, nennt mir die Liste.
- **Hinweis zu abgelehnten Aufgaben:** Lehnt das Gerät eine Aufgabe ab, ist der Punkt schon verbraucht. Wenn ihr mögt:
  eine Adresse zum Zurückmelden (`POST /api/ki/aufgabe/abgelehnt {id}`), damit die Aufgabe aus dem Vorrat fliegt und der
  Punkt zurückkommt. Kein Muss.
- Sonst für den Server nichts Neues: Merkbilder, Figuren und Begrüßung laufen ganz im Gerät.
- Reihenfolge der Auslieferung: 0.18.0 ist im Testlauf und geht danach auf `test`, 0.19.0 folgt mit eigenem Testlauf.

## 14.11.2026 (33) – 0.17.0 liegt auf `test`; 0.18.0 mit Tutor und Rechenweg-Prüfer folgt nach dem Testlauf

- **0.17.0 ist auf `test`** (alle fünf Browser-Durchläufe grün): Arbeitsblatt, Probeklausur, Theorie, Lernkarten, KI-Proben mit
  Rest-Anzeige, Feld „Zugangscode“ (sichtbar bei `premium: true`), Stufe des Zugangs. **Ihr könnt `premium: true` auf der
  Testseite einschalten** – dann kann Marcel seine Test-Codes einlösen. App-Datei 0.17.0 liegt im Drive.
- **0.18.0 (kommt nach dem Testlauf auf `test`)**: App-Seite für `/api/ki/frage` und `/api/ki/rechenweg` nach euren Angaben,
  Guthaben-Anzeige in Punkten, `bis: 9999-…` als „unbefristet“, Schwächen-Blatt, voller Rechenweg auf dem Lösungsblatt.
- **Service Worker:** fasst Anfragen an `/api/…` nicht mehr an (gehen immer direkt zum Server).
- Bereit für `/api/ki/aufgabe` und `/api/ki/auswertung`, sobald ihr sie meldet.

## 14.11.2026 (32) – Marcel: Pro + KI massiv ausbauen – Vorgaben für vier KI-Adressen

Danke für (31), Messung und Shop. Marcel 14.11.: Beide Stufen sollen deutlich wachsen, damit sich der Preis lohnt. Pro
(ohne KI) baue ich allein aus. Für **Pro + KI** brauche ich von euch diese Adressen (Vorschlag, bitte bestätigen/ändern;
alle nur mit gültigem Code der Stufe „Pro + KI“, sonst 402; eigenes Tageslimit je Art; nie Namen, nie Lernstand):
1. **Tutor mit Rückfragen** – `POST /api/ki/frage { frage, formel, richtig, gewaehlt, verlauf: [{ wer: "ich"|"ki", text }], text, geraet, zugang }`
   → `{ text, rest }`. `verlauf` höchstens 6 Einträge, `text` (die Rückfrage des Schülers) höchstens 300 Zeichen. Der Server
   prüft, dass es um die Aufgabe geht (kein freier Chat), und speichert den Verlauf nicht.
2. **Rechenweg-Prüfer** – `POST /api/ki/rechenweg { frage, formel, richtig, bild (JPEG, base64, höchstens 1 MB – die App
   verkleinert vorher) oder text, geraet, zugang }` → `{ text, zeile? , rest }`. Eigenes Limit (Vorschlag 3 am Tag), Bild
   nach der Antwort verwerfen. **Datenschutz bitte vorher klären:** Fotos können Namen enthalten – Hinweis in der App vor
   der Aufnahme, Abschnitt in 10a.
3. **KI-Sachaufgaben** – `POST /api/ki/aufgabe { thema, stufe, stil: "abi" }` → `{ aufgabe }` im Format aus `docs/KI.md`,
   vom Server mit `app/js/ki/verify.js` nachgerechnet, aus einem Vorrat.
4. **Auswertung eines Arbeitsblatts** – `POST /api/ki/auswertung { themen: [..], ergebnis: [{ thema, richtig: true|false }], geraet, zugang }`
   → `{ text, rest }` (höchstens 900 Zeichen: was sitzt, was üben, in welcher Reihenfolge).
Reihenfolge nach Nutzen für Schüler: 1, 2, 3, 4. Sagt mir, welche ihr zuerst baut – ich baue die App-Seite dazu, jeweils
hinter `ki`-Stufe und erst sichtbar, wenn `/api/status` die Art meldet (Vorschlag: `kiArten: ["erklaer","frage",…]`).

## 14.11.2026 (31) – Marcel: zwei Bezahl-Stufen („Pro“ und „Pro + KI“); neue Pro-Funktionen ohne Server

- **Marcel 14.11. (Auswahl): zwei Stufen.** „Pro“ = Druck/PDF mit Logo (Arbeitsblatt, Probeklausur, Theorie) und Theorie
  ausführlich – ohne laufende Kosten. „Pro + KI“ = Pro plus KI-Funktionen mit Tageslimit. Beide als 30-Tage-Pass und Abi-Pass.
- **Bitte am Server:** `POST /api/zugang` (und `/api/ki/erklaer` bei gültigem Code) zusätzlich **`ki: true|false`** liefern
  („hat dieser Zugang die KI dabei?“). Ohne `ki` nimmt die App `true` an (heutiger Stand). Mit Code ohne KI soll
  `/api/ki/erklaer` wie ohne Code zählen (Proben) bzw. `402` liefern. Shop: vier Produkte (Pro/Pro + KI × 30 Tage/Abi-Pass).
- **Neu in der App, alles ohne Server und ohne KI** (Version 0.17.0 auf `test`): Arbeitsblatt-Generator (`#/blatt`, gleiche
  Blatt-Nummer = gleiches Blatt), Probeklausur (12 Aufgaben, 48 BE, Notenpunkte-Tabelle), Theorie (`#/theorie`, kurz für alle
  Einheiten, ausführlich für sechs), Lernkarten (`#/karten`). Druck/PDF und „ausführlich“ sind in der App als Pro markiert und
  **frei, solange `premium: false`** ist; sobald ihr `premium: true` meldet, braucht es einen gültigen Zugang im Gerät.
- **Preise (Marcel 14.11., „nimm so“):** Pro 4,99 € (30 Tage) / 19,99 € (Abi-Pass); Pro + KI 9,99 € / 39,99 €.
- **Bitte messen und melden:** Kosten je KI-Erklärung (Mittel/Maximum). Damit wird das Tageslimit festgelegt: Bei 9,99 €
  bleiben nach MwSt. und Store-Gebühr rund 6,70 €; 300 Abrufe im Monat dürfen zusammen nicht mehr kosten.
- Später für den Lehrer-Modus (noch kein Auftrag): Blatt-Nummer + Ergebnis je Schüler speichern – Vorschlag folgt.

## 14.11.2026 (30) – Antwort auf (43); Marcel: beide Kaufwege (Code aus dem Shop und Kauf in der Store-App)

- Übergabe (43) gelesen, Adressen geprüft (`/api/status` mit `premium:false`, `/api/zugang` → 404 bei unbekanntem Code).
  Die App-Seite (Kennung `geraet`, Rest-Anzeige, 402-Hinweis, Code-Feld hinter `premium`) baue ich als Nächstes.
- **Marcel 14.11.: beide Kaufwege.** (a) Code aus dem Shop – für die Web-App und für Nachhilfe-Kunden (`frei`).
  (b) **Kauf direkt in der Android-App aus dem Play Store** über Google Play Billing: Abi-Pass und 30-Tage-Pass als
  einmalige Käufe (keine Abos). Kommt erst, wenn die App in den Store geht.
- Was (b) von euch braucht (später, nur zur Planung): eine Adresse, die einen Google-Kauf gegenprüft und daraus einen
  Zugang macht, z. B. `POST /api/zugang/google { produkt, kaufToken, geraet }` → wie `/api/zugang` (`{ art, bis }` plus
  einen Code, den die App speichert). Der Server prüft den Kauf über die Google-Play-Developer-API (Dienstkonto =
  Geheimnis bei euch) und bestätigt ihn dort; Rückerstattung → Zugang sperren.
- **Google-Regel beachten:** In der Store-App darf kein Link/keine Aufforderung zum Kauf auf der Website stehen. Die
  Android-App zeigt beim 402-Hinweis deshalb nur „Zugangscode eingeben“ und später den Kauf-Knopf, die Web-App den Link
  zum Shop. Gebühren laut Google-Hilfe im Umbruch (etwa 10–20 %) – bitte vor der Preisfestlegung offiziell prüfen.
- Voraussetzung bei Marcel: Google-Entwicklerkonto mit Händler-Profil.

## 14.11.2026 (29) – Marcel: KI nur in der Bezahl-Version; Vorschlag für Zugang und Zählung

Marcel hat am 14.11. entschieden (Auswahl im Trainer-Raum): **KI ist Bezahl-Funktion.** Modell: **Abi-Pass (Einmalkauf bis
zum Abi-Termin) und Monats-Abo, beides.** Für alle ohne Kauf: **3 KI-Erklärungen einmalig je Gerät** als Probe. Preis offen.
Folgen:
- **Live-Freigabe der KI bitte erst, wenn der Zugang steht.** Die App bleibt bei `CONFIG.ki = 'test'`.
- **Bitte messen:** Kosten je Erklärung (Mittel und Maximum) – ohne die Zahl kann Marcel keinen Preis festlegen.
- **Vorschlag für den Vertrag** (bitte bestätigen oder ändern, dann baue ich die App-Seite):
  1. `POST /api/zugang { code }` → `200 { art: "pass"|"abo", bis: "JJJJ-MM-TT" }` oder `404`. Der Code kommt aus dem Shop
     (Kauf → E-Mail mit Code). Die App speichert nur den Code im Gerät, kein Konto, kein Name.
  2. `POST /api/ki/erklaer` nimmt zusätzlich `zugang` (Code, optional). Antwort zusätzlich `rest` (Zahl der heute bzw. als
     Probe noch möglichen Abrufe). Ohne gültigen Code zählt der Server die **einmalige Probe (3 je Gerät)**; ist sie
     verbraucht: `402 { grund: "probe" }` → die App zeigt den Hinweis auf Premium mit Link zur Website.
     Mit Code: Tageslimit (Vorschlag 30), danach wie bisher `429`.
  3. `GET /api/status` zusätzlich `premium: true`, sobald Zugang und Shop bereit sind – dann zeigt die App das Feld
     „Zugangscode“ in den Einstellungen.
- Woran der Server ein Gerät erkennt (für die 3 Proben), wisst ihr besser; die App kann eine zufällige Kennung im Gerät
  erzeugen und mitschicken, wenn ihr das wollt (kein Personenbezug, aber löschbar – dann bitte zusätzlich IP-Bremse).
- Shop-Produkte (Abi-Pass, Abo), Code-Versand, Kündigung: liegt bei euch/Verwaltung. Vorschlag von mir, **nicht
  entschieden**: Premium gratis für aktive Nachhilfe-Kunden; Verkauf nur über die Website (keine Store-Gebühr).

## 14.11.2026 (28) – Antwort auf eure Nachricht zur KI: Erklär-Knopf auf `test` eingeschaltet (Version 0.16.1)

1. **Eingeschaltet – und zwar so, dass es nur auf der Testseite wirkt:** `CONFIG.ki = 'test'`. Die App ruft
   `GET /api/status` erst, wenn jemand an einer Aufgabe hängt (höchstens einmal je Sitzung), und zeigt den Knopf nur bei `stufe: "test"` **und** `ki: true`. Damit kann derselbe Stand später live
   gehen, ohne dass die KI dort erscheint. **Bitte lasst `stufe` in `/api/status` so** (test/live) – daran hängt der Schalter.
   Für die Live-Freigabe setze ich nach eurer Ansage `CONFIG.ki = true`.
2. Geprüft: echter Abruf gegen `trainer-test.` (200, 4,8 s, Text mit Absätzen). Anzeige mit `white-space: pre-line`,
   Lade-Hinweis mit laufenden Punkten, 429 → „für heute aufgebraucht“, 502/503 → „gerade nicht erreichbar“.
   Am echten Handy kann nur Marcel schauen.
3. **Android-App (Offline-Fassung):** spricht mit `trainer.` (live) – dort bleibt die KI also aus, bis ihr live freigebt.
4. **Felder für `/api/ki/aufgabe`:** stehen in `docs/KI.md` (Abschnitt „Format einer Aufgabe“ und Tabelle der Arten
   `ableitung`, `stammfunktion`, `integral`, `zahl`). Anfrage `{ thema, stufe, stil }`, Antwort `{ aufgabe: {…} }`.
   Der Prüfer liegt in `app/js/ki/verify.js` (`verify`, `toQuestion`; Rechenausdrücke: `app/js/ki/expr.js`) und läuft ohne Browser – ihr könnt ihn serverseitig
   unverändert einbinden. Die App zeigt KI-Aufgaben noch nirgends an; das baue ich erst, wenn euer Endpunkt steht.
5. Unter den Knöpfen steht jetzt ein Satz zum Datenschutz („nur die Aufgabe und deine Antwort gehen an einen KI-Dienst“).
   Passt das zu eurem Abschnitt 10a? Sonst nennt mir den Wortlaut.

## 14.11.2026 (27) – Version 0.16.0 (täglicher Ausbau): zwei neue Einheiten, sieben Aufgaben-Arten

Neu auf `test` (nach grünem Browser-Test): Einheiten „Wachstum mit Grenze“ und „Ebenen genauer“, je 10 neue Level in zwei
Spielen, vier kleine Fehler behoben (Details im Baulog, `docs/PLAN.md`). **Für den Server:** keine neuen Adressen, keine
neuen Speicherfelder, Schnittstelle unverändert. Hinweis für die Rangliste: Der Vorrat der Tages-Runde ist gleich
geblieben, aber zwei Aufgaben-Arten daraus (Vektor-Länge, Produktregel) würfeln bei gleichem Startwert jetzt andere
Zahlen bzw. schreiben anders. Rechnet euer Server mit dem Code der jeweils ausgelieferten Version nach, ist nichts zu
tun; nutzt er eine eigene Kopie, bitte mit dieser Version erneuern. **Neue APK nötig: ja** (Offline-Fassung packt die Web-App ein) – 0.16.0 liegt im Drive.
Nutzer-Meldungen: Abruf am 14.11. leer.

## 13.11.2026 (26) – Version 0.15.2: Erinnerung in der Android-App läuft im Gerät, ohne Server

Auf Marcels Auftrag: Die Offline-App (25) stellt die tägliche Erinnerung selbst zu (Android-Wecker, Uhrzeit des Geräts,
höchstens eine am Tag, keine nach dem Üben). **Für den Server ändert sich nichts** – die App ruft `/api/push…` in dieser
Fassung gar nicht auf. Im Browser und als installierte Web-App bleibt Web-Push wie in (33)/(34). Die Bedienung der Karte
(Schalter an/aus, Uhrzeit, Speichern) ist in beiden Fassungen dieselbe – als Vorlage für andere Apps weiter brauchbar.
Neue App-Datei 0.15.2 liegt in Marcels Drive-Ordner.

## 13.11.2026 (25) – Marcel: Android-App muss ganz ohne Internet laufen → eigene Offline-Fassung (Version 0.15.1)

Marcel (13.11., wörtlich sinngemäß): Die App muss als APK offline spielbar sein, „wer erwirbt eine Rechen-App mit
Internetzwang“ – deshalb sollen Web-App und APK künftig **parallel gepflegt** werden. Das weicht von eurer Übergabe (39)
ab (dort: eine TWA, neue APK nur bei Änderung der Hülle). Umgesetzt:
- **`android/offline/`**: eigenes Android-Projekt, packt `app/` fest ein und liefert es in einem eingebauten Browser-Fenster
  unter `https://trainer.mathenachhilfe-online.com/` aus. Kein Netz nötig, auch nicht beim ersten Start.
- **Für den Server ändert sich nichts.** Anfragen an `/api/…` gehen wie bisher an `trainer.` (gleiche Herkunft, kein CORS),
  aber nur, wenn Netz da ist. **`assetlinks.json` aus (23) wird für diese Fassung nicht mehr gebraucht.**
- **Jede Web-Version braucht ab jetzt eine neue App-Datei** (gleiche Versionsnummer). Ich baue sie bei jeder Version mit und
  lege sie in Marcels Drive-Ordner (Unterordner „Mathe-Trainer“).
- **Erinnerung:** Web-Push funktioniert in dieser Fassung nicht. Auf der Web-App bleibt alles wie in (33)/(34); für die
  Android-App kommt später eine eigene, geräteinterne Erinnerung (ohne Server).
- Nicht auf einem echten Handy geprüft (kein Gerät in diesem Raum); der Ablauf ohne Netz ist im Browser nachgestellt und grün.

## 13.11.2026 (24) – Version 0.15.0: Ruhiger Modus, Abenteuer-Modus, Karte mit Geschichte

Marcel hat aus einer Marktübersicht vier Punkte gewählt; drei sind in 0.15.0 (Branch `test`, nach grünem Browser-Test):
- **Ruhiger Modus** (Einstellungen): keine Lernserie, kein Wochen-Ziel, Boss ohne Herzen, Abi-Modus ohne Uhr.
- **Abenteuer-Modus** (`#/abenteuer`): sieben Räume, Belohnungen, Türen, Abi-Drache. Läuft ganz im Gerät, keine Server-Anfrage.
- **Karte mit Geschichte** (`#/karte`) und selbst gezeichnete Figuren (reiner Code, keine Bilddateien, keine fremden Quellen).

Für den Server ändert sich nichts: keine neuen Adressen, keine neuen Dienste, CSP unverändert.
Der vierte Punkt (**Android-Widget**) kommt mit einer neuen App-Datei; dafür bleibt die Bitte aus (23) – `assetlinks.json` – bestehen.
Live-Schaltung wie immer erst nach Marcels Go durch euch.

**Zu eurer Übergabe (39) – Web-App und APK auf demselben Stand:** verstanden, eine Quelle, jede Freigabe gilt für beide.
- **Neue APK nötig? Für 0.15.0 selbst: nein** (nur Web-Inhalt). **Für das Widget: ja**, weil sich die Hülle ändert
  (neuer Empfänger im Android-Manifest, keine neue Berechtigung). App-Datei **1.1.0 (versionCode 2)** ist gebaut,
  gleicher Schlüssel und gleicher Fingerabdruck wie in (23), liegt in Marcels Drive-Ordner. Quellen: `android/widget/`.
- **Installierte Ansicht:** Der Browser-Test prüft Manifest, Kurzbefehle und Vollbild-Angaben. Ein echtes Android-Gerät
  gibt es in diesem Raum nicht – APK und Widget sind **nicht auf einem Handy geprüft**; das muss Marcel am Gerät tun.

## 13.11.2026 (23) – Android-App-Datei ist gebaut: bitte `assetlinks.json` auf `trainer.` ablegen

Marcel hat einen Drive-Ordner für die App-Datei genannt; dort liegen jetzt die APK (zum direkten Installieren) und das AAB (für die Play Console), Version 1.0.0, Paket `com.mathenachhilfe_online.trainer`.

**Von euch gebraucht:** `https://trainer.mathenachhilfe-online.com/.well-known/assetlinks.json` (als `application/json`, ohne Weiterleitung) mit diesem Inhalt – der Fingerabdruck ist nicht geheim:

```json
[{"relation":["delegate_permission/common.handle_all_urls"],"target":{"namespace":"android_app","package_name":"com.mathenachhilfe_online.trainer","sha256_cert_fingerprints":["D6:A4:0D:42:7B:21:36:54:E6:66:F0:24:AD:C9:D2:F8:48:5F:A1:AA:51:26:62:CF:3A:EA:66:27:FE:56:D8:F8"]}}]
```

Ohne die Datei läuft die App mit Adressleiste statt im Vollbild. Der Signier-Schlüssel steht nicht im Repo; wo er aufbewahrt wird, entscheidet Marcel. Einzelheiten: `docs/PLAYSTORE.md`.

## 13.11.2026 (22) – Version 0.14.0: Android-App vorbereitet (Marcel: „Bau es zu einer coolen Android-App um“)

- Web-App: Manifest mit `id`, `shortcuts`, `screenshots` (neue Dateien `app/img/shots/*.jpg`, bewusst **nicht** in der Offline-Liste des Service Workers), `theme_color`/`background_color` jetzt `#0d1733`; Zahl am App-Symbol (`setAppBadge`); Hinweis „Als App aufs Handy“. Neuer Zähler `installNein` im vorhandenen Schlüssel `mt.v1`. Keine neuen Abrufe.
- **Bauplan der Hülle:** `android/twa-manifest.json` (Bubblewrap), Paketname `com.mathenachhilfe_online.trainer`, `enableNotifications: true`. Bauanleitung mit drei Befehlen in `docs/PLAYSTORE.md`. Der Ordner `android/` wird nicht ausgeliefert (nur `app/`).
- **Von euch gebraucht, sobald Marcel den Schlüssel hat:** die App-Datei bauen (oder Marcel über pwabuilder.com) und `/.well-known/assetlinks.json` mit dem Fingerabdruck auf `trainer.` ablegen. Für einen Test vor dem Store gern zusätzlich auf `trainer-test.` mit eigenem Paketnamen/Fingerabdruck.

## 13.11.2026 (21) – Antwort auf eure Übergabe (34): Schalter „Erinnerung an/aus“ (Version 0.13.1), Play-Store-Vorbereitung

- **Schalter** (`role="switch"`), Uhrzeitfeld nur sichtbar, wenn an. Einschalten = Erlaubnis anfragen + `POST /api/push` (Vorgabe 18:00 bzw. zuletzt gewählte Zeit); „Speichern“ = erneut `POST /api/push` mit neuer Zeit; Ausschalten = `POST /api/push/aus` + `unsubscribe()`.
- **Zustand beim Öffnen** aus `Notification.permission` und `pushManager.getSubscription()`; `erinnern` in `mt.v1` ist jetzt `{ zeit, an }` und wird dem wahren Zustand angeglichen. Fehlt die Anmeldung im Browser (euer 410-Fall), steht der Schalter auf „aus“; die gemerkte Uhrzeit bleibt für das nächste Einschalten.
- **`denied`:** Schalter bleibt aus, Schritt-für-Schritt-Anleitung (Browser / installierte App / iPhone), nichts wird gesendet.
- **Nicht installiert:** Hinweis „Am besten als App installieren …“, mit Knopf, wenn `beforeinstallprompt` vorliegt.
- **Play Store – von euch gebraucht:** `/.well-known/assetlinks.json` auf `trainer.mathenachhilfe-online.com` (Vorlage, Hinweis zu „Play App Signing“ und Prüf-Adresse in `docs/PLAYSTORE.md`), ausgeliefert als `application/json` ohne Weiterleitung. Paketname und Fingerabdruck kommen, sobald die Hülle gebaut ist; der Signier-Schlüssel bleibt bei Marcel/Bitwarden. Hülle mit Benachrichtigungs-Delegation bauen (Bubblewrap `enableNotifications: true` bzw. pwabuilder-Option).
- Browser-Test deckt ab: einschalten, Uhrzeit ändern, Neuladen, „Browser hat Anmeldung gelöscht“, erneut einschalten, ausschalten, gesperrt. Erlaubnis und Geräte-Anmeldung sind dabei nachgestellt.

## 13.11.2026 (20) – Version 0.13.0: Startseite aufgeräumt, Datum neben der Version

Nur Gestaltung und Anzeige (Fußzeile zeigt „Version X · TT.MM.JJJJ“, `STAND` in `config.js`). Keine neuen Speicherfelder, keine neuen Abrufe.

## 13.11.2026 (19) – Antwort auf eure Übergabe (33): Erinnerung mit freier Uhrzeit (Version 0.12.2)

- Uhrzeitfeld `<input type="time" step="300">`, Vorgabe 18:00; gesendet wird jedes gültige `HH:MM` (geprüft mit `/^([01]\d|2[0-3]):[0-5]\d$/`). Ändern = erneut `POST /api/push` mit neuer `zeit`. Anzeige „Erinnerung täglich um HH:MM Uhr (deutsche Zeit)“.
- `Notification.permission === 'denied'`: Hinweis mit den Schritten für Android/Chrome und iPhone, schon beim Öffnen der Einstellungen und nach dem Tipp; es wird nichts gesendet; das Feld bleibt bedienbar.
- Browser-Test ergänzt (Erlaubnis und Geräte-Anmeldung nachgestellt, weil der Testbrowser keinen Mitteilungs-Dienst hat). Echter Test auf dem Handy steht weiter aus.
- Unverändert enthalten: die Korrekturen aus 0.12.1.

## 13.11.2026 (18) – Antwort auf eure Übergabe (30): Handy-Erinnerung auf `test` eingeschaltet (Version 0.12.0)

- `CONFIG.push = true`. Die App holt den Schlüssel bei Bedarf über `GET /api/push/schluessel` (nicht fest in `config.js`), meldet an mit `POST /api/push` `{ abo, zeit }` (`zeit` aus 07:00, 15:00, 18:00, 20:00) und ab mit `POST /api/push/aus` `{ endpoint }` plus `unsubscribe()`. Erst auf Tipp in den Einstellungen (Karte „Erinnerung“), nie von selbst.
- Service Worker: `push` → `showNotification('Mathe-Trainer', { body: 'Zeit für deine Mathe-Runde', icon, tag: 'mt-erinnerung' })`; liegt doch ein Inhalt `{ "text" }` bei, wird er als Text genommen (höchstens 120 Zeichen). Tipp öffnet die App.
- Geräte ohne Push (iPhone ohne Installation) bekommen den Hinweis „nur als installierte App“.
- **Nicht echt getestet:** Im Testbrowser gibt es keinen Push-Dienst; geprüft ist nur, dass Schlüsselabruf und Fehlerfall sauber laufen. Bitte auf einem echten Android-Handy gegen `trainer-test.` prüfen.
- Neu außerdem: Leiste ganz oben mit Knopf „Zur Website“ (normaler Link auf `www.mathenachhilfe-online.com`, beim Spielen ausgeblendet).

## 13.11.2026 (17) – Version 0.11.0: KI-Erklärung und Erinnerung sind App-seitig fertig, beide aus

- **„Erklär's mir anders“** (eure Übergabe (24)): fertig, sichtbar erst mit `CONFIG.ki = true` – das setzen wir erst auf eure Ansage. Anfrage `POST /api/ki/erklaer` mit genau `{ frage, formel, richtig, gewaehlt, art }` (`art`: `einfacher` | `beispiel` | `eselsbruecke`), Antwort `{ text }`; `429` zeigt „für heute aufgebraucht“. Der Text wird als reiner Text angezeigt (HTML entfernt, höchstens 900 Zeichen).
- **Erinnerung aufs Handy:** App-Seite fertig, unsichtbar, solange `CONFIG.push` leer ist. Von euch gebraucht: Schlüsselpaar (öffentlicher Teil, base64url, kommt in `CONFIG.push`), `POST /api/push` mit `{ abo, zeit }` (`zeit` aus 07:00, 15:00, 18:00, 20:00), `POST /api/push/aus` mit `{ endpoint }`, höchstens eine Mitteilung am Tag mit Nutzlast `{ "text": "…" }` (oder leer). Vorgabe und Datenschutz-Hinweise: `docs/SERVER.md`. Neues Feld `erinnern` im vorhandenen Schlüssel `mt.v1`.
- **Neue Dateien für euer Nachrechnen:** `app/js/gen4.js` und `app/js/verbund.js` werden von `units.js` bzw. der App geladen; `makeTasks`/`POOL` sind unverändert.
- **Play Store:** Schritte, die bei Marcel bzw. euch liegen (Konto, Signier-Schlüssel, `/.well-known/assetlinks.json` auf der Live-Adresse), stehen in `docs/PLAYSTORE.md`.
- Behoben: seltener Fehler in „Abi-Aufgabe am Stück“ (Geometrie), der seit 0.10.0 auf `test` lag.

## 13.11.2026 (16) – Version 0.10.0: Rangliste auf `test` eingeschaltet (eure Übergabe (25)), viele neue Funktionen

- **`CONFIG.api = '/api'`** ab 0.10.0, `CONFIG.ki` bleibt `false`. Neu in der App: Klasse **anlegen** (`POST /api/klasse`), beitreten, **verlassen** (`POST /api/klasse/verlassen` mit `{ code, spieler }`; danach wird `klasse` im Gerät geleert, auch wenn der Server nicht antwortet). Fehlertexte `{error}` werden angezeigt. Ohne Klasse schickt die App nichts an `/api` (im Browser-Test geprüft), außer Meldungen an `/api/meldung`.
- **Wichtig für euer Nachrechnen:** `makeTasks` hat einen vierten, optionalen Parameter `land` bekommen (nur Abi-Modus). Tages-Runde und Duell rufen ihn nicht – das Ergebnis für `makeTasks(n, stufe, startwert)` ist unverändert. `exam.js` importiert jetzt zusätzlich `units.js` (für `landOk`) und `gen3.js` (Blitz-Pool); beide brauchen wie bisher nur ein leeres `tex()`.
- **Neue Felder im vorhandenen Schlüssel `mt.v1`** (kein neuer Schlüssel): `einstufung` (Ergebnis des Einstufungstests), `last` (zuletzt gespielte Einheit), `tippen`, `meldungen`. Der Name auf dem Zertifikat wird nicht gespeichert.
- **Neue Adressen in der App:** `#/einstufung`, `#/aufgabe`, `#/plan`, `#/zertifikat`.
- **Bitte entscheiden:** Erinnerung aufs Handy (Push) – Vorgabe in `docs/SERVER.md`. Und: Lese-Geheimnis für `trainer-test.`, falls wir auch Test-Meldungen abholen sollen.
- Offen bei uns aus Übergabe (24): App-Seite für „Erklär's mir anders“.

## 13.11.2026 (15) – Antwort auf eure Übergabe (28): „Fehler melden“ ist auf `test` eingeschaltet

- `CONFIG.melden = '/api/meldung'` ab Version 0.9.3. **Neu: Die App sendet damit erstmals Anfragen an die eigene Adresse** (`POST /api/meldung`, nur wenn ein Nutzer eine Meldung abschickt oder eine wartende nachgereicht wird). Sonst keine Abrufe; `CONFIG.api` und `CONFIG.ki` sind unverändert aus.
- Lese-Geheimnis für `trainer.mathenachhilfe-online.com` ist in unserer Umgebung hinterlegt; `GET /api/meldungen` antwortet 200. Für `trainer-test.` ist noch keines hinterlegt – Test-Meldungen sehen wir daher nur über Marcels Mail.
- Seit 0.9.2 merkt sich die App die zuletzt gespielte Einheit (`last` im vorhandenen Schlüssel `mt.v1`, kein neuer Schlüssel).
- **Offen aus eurer Übergabe (25):** `CONFIG.api = '/api'` und der Knopf „Klasse verlassen“ – kommt als nächstes Paket.

## 13.11.2026 (14) – Version 0.9.1: Spiele ohne Scrollen, Knöpfe zur Website

Nur Gestaltung. Neue Links führen auf `www.mathenachhilfe-online.com` (Startseite) – wie bisher nur als normale Links, kein Abruf im Hintergrund.

## 13.11.2026 (13) – Version 0.9.0: Breitbild-Ansicht, Knopf immer sichtbar

Nur Gestaltung (CSS) und Tests. Keine neuen Speicher-Schlüssel, keine fremden Abrufe.

## 13.11.2026 (12) – Version 0.8.0: Bundesland-Schalter filtert nach Lehrplan

Abgleich mit den amtlichen Vorgaben (Bayern, Hessen GK/LK) in `docs/LEHRPLAN.md`. Für Hessen-Grundkurs werden
vier Themen als „nicht im Grundkurs“ markiert. Keine neuen Speicher-Schlüssel, keine fremden Abrufe. Neue
Adresse in der App: `#/lehrplan`. Für die Website interessant: Die Liste „Was noch fehlt“ zeigt, welche Themen
je Land als Nächstes kommen.

## 13.11.2026 (11) – Version 0.7.0: „Fehler melden“ braucht einen kleinen Server-Teil – bitte entscheiden und bauen

Marcels Auftrag: schwebender Knopf unten rechts mit Menü „Fehler melden“; die Meldungen sollen **als E-Mail an
Marcel gehen (Absender: die system@-Adresse)** und **automatisch beim Trainer-Raum ankommen**.

- App-Seite ist fertig und auf `test`. **Der Versand ist aus** (`CONFIG.melden` leer): Die App macht weiterhin
  keine einzige Anfrage an `/api`. Meldungen warten im Gerät (im vorhandenen Schlüssel `mt.v1`, kein neuer
  Speicher-Schlüssel) und werden nachgereicht, sobald ihr den Versand freigebt.
- **Von euch gebraucht:** `POST /api/meldung` (prüfen, bremsen, E-Mail senden, ablegen) und
  `GET /api/meldungen` mit Geheimnis für die tägliche Routine. Genaue Vorgabe: `docs/SERVER.md`, erster Abschnitt.
  Absender- und Empfänger-Adresse stehen nur auf dem Server, nicht im Repo.
- **Datenschutz:** neuer Abschnitt nötig (Zweck Fehlerbehebung, Freitext, keine Kennung). Text im Formular:
  „Bitte keine Namen oder Kontaktdaten eintragen.“
- Sonst neu in 0.7.0: freie Eingabe von Ergebnissen (nur App-Logik). Außerdem Marcels Fahrplan: drei Wochen
  täglicher großer Ausbau, Play Store später (siehe `docs/PLAN.md`, „Ausbau-Fahrplan“).

## 13.11.2026 (10) – Version 0.6.0: Grundlagen-Einheiten, Vierfeldertafel zum Ausfüllen, freies Üben

Marcels Auftrag: Grundlagen in jedem Gebiet und allgemeine Übungen. Einzelheiten im Baulog (`docs/PLAN.md`).
Für euch wichtig: **keine neuen Speicher-Schlüssel** (weiter nur `mt.v1`, `mt.sound`, `mt.look`), keine fremden
Abrufe, keine neuen Dateitypen; zwei neue Dateien (`app/js/gen3.js`, `app/js/games/tafel.js`) stehen in der
Liste des Service Workers. Neue Adressen innerhalb der App: `#/ueben/<gebiet>` und `#/ueben/<gebiet>-grund`.

## 13.11.2026 (9) – Version 0.5.1: Schwierigkeit wirkt jetzt in Spielen und Aufgaben

Marcel hat gemeldet, dass Stufe 5 dieselben Aufgaben zeigt. Stimmte für die Spiele (gleiche Level auf jeder
Stufe) und für fünf Aufgaben-Arten. Behoben, Einzelheiten im Baulog (`docs/PLAN.md`). Nur Inhalte und Tests
geändert: keine neuen Speicher-Schlüssel, keine fremden Abrufe, keine neuen Dateitypen.

## 13.11.2026 (8) – Version 0.5.0; Server-Teil und KI sind vorbereitet und brauchen eure Entscheidung

Marcels Auftrag: Abzeichen, Kombo/Blitz-Runde, Boss-Aufgaben und weitere Ideen ohne Server einbauen; die
Server-Ideen und die KI vorbereiten. Gebaut ist alles, was ohne Server geht (Baulog in `docs/PLAN.md`).

**Unverändert:** kein Server-Teil, keine Cookies, keine fremden Abrufe. `CONFIG.api` ist leer; damit macht die
App keine einzige Anfrage an `/api`, und die Klassen-Rangliste ist unsichtbar (im Browser-Test geprüft).

**Für den Datenschutz-Abschnitt (Gerätespeicher):** weiterhin `mt.v1`, `mt.sound`, `mt.look`. In `mt.v1` neu:
Abzeichen mit Datum, Zähler (Kombo, Boss, Blitz), gewählte Farbe, Wochen-Ziel (aktive Tage der Woche).
**Erfolgskarte:** ein Bild, das im Gerät entsteht und nur auf Tippen geteilt oder gespeichert wird.

**Bitte entscheiden bzw. Marcel vorlegen (`docs/SERVER.md`, `docs/KI.md`):**
1. Wo läuft ein Server-Teil für Klassen-Rangliste (später Liga, Lehrer-Ansicht) – eigener Server unter
   `/api` auf der Trainer-Adresse oder ein Dienst wie Supabase? Wer baut und betreibt ihn?
2. Datenschutz: Spitznamen Minderjähriger in einer Klassen-Rangliste; Einwilligung für eine Lehrer-Ansicht.
3. KI (Premium): Schlüssel, Kostenbremse, Vertrag mit dem KI-Anbieter. Vorab ist nur Stufe P1 sinnvoll
   (Aufgaben erzeugen und nachrechnen, nichts geht an Schüler).
Die App-Seite ist fertig: Sobald es `/api` nach dem Vertrag in `docs/SERVER.md` gibt, reicht `api: '/api'`.

**Marcels Entscheidung (13.11.2026, Auswahlfenster):** Der Server-Teil läuft **über den Leitstand**. Dieser Raum
baut keinen Server und bindet keinen externen Dienst an; er wartet auf eure Vorgabe (Ort, Betreiber, Datenschutz).
Version 0.5.0 liegt auf `test` (Browser-Durchlauf grün, Testseite liefert 0.5.0 aus).

## 13.11.2026 (7) – Version 0.4.0: Menüführung

Auf Marcels Wunsch: untere Menüleiste (Start, Lernen, Prüfung, Mehr), kurze Startseite, Einheiten nach Gebiet.
Nur Oberfläche – keine Änderung an Speicher, Abrufen oder Dateiarten. Neue Adressen innerhalb der App
(alles hinter `#`): `#/lernen`, `#/g/<gebiet>`, `#/pruefung`, `#/mehr`.

## 13.11.2026 (6) – Version 0.3.1: Hell/Dunkel-Schalter, neuer Speicherschlüssel

Auf Marcels Wunsch („wie auf meiner Website") gibt es oben rechts den runden Mond/Sonne-Schalter mit derselben
Logik wie `nho-look`. **Für den Datenschutz-Abschnitt:** dritter Schlüssel im Gerät: `mt.look` (Wert „hell" oder
„dunkel"), wird nicht übertragen. Damit insgesamt: `mt.v1`, `mt.sound`, `mt.look`. Neue Datei `js/look.js` (lädt vor
dem Stylesheet, damit nichts aufblitzt; eigenes Skript, kein Inline-Skript – die CSP bleibt unverändert).

## 13.11.2026 (5) – Version 0.3.0 auf Branch `test`: Trainer inhaltlich komplett

Marcels Auftrag vom 13.11. („die fehlenden Punkte … das machst du jetzt"). Auf `test` liegt Version 0.3.0:
22 Einheiten, 76 Schritte, 9 Spiele, 42 Aufgaben-Erzeuger; dazu Abi-Modus, Tages-Runde, Duell per Link,
Fehler-Kartei, Eltern-Bericht, Einstellungen (Bundesland/Kurs, Abi-Termin). Details im Baulog (`docs/PLAN.md`).

**Für Datenschutz und Server relevant – bitte in den Abschnitt „Mathe-Trainer" aufnehmen bzw. prüfen:**
- Weiterhin **kein Server-Teil, keine Cookies, keine fremden Abrufe, kein Konto**. `connect-src 'self'` bleibt.
- Speicher nur im Gerät, weiterhin unter `mt.v1` und `mt.sound`. In `mt.v1` liegen jetzt zusätzlich: Statistik je
  Thema (richtig/falsch), Fehler-Kartei (Aufgabenart, Fälligkeit), Bundesland/Kurs, **Abi-Termin (Datum)**,
  die letzten 20 Abi-Modus- und Runden-Ergebnisse. Kein Name, keine Kontaktdaten.
- **Duell und Tages-Runde arbeiten ohne Server:** Der Duell-Link enthält nur Startwert, Schwierigkeit und Punktzahl
  (`#/duell/<zahl>-<stufe>-<punkte>`), keinen Namen. Die Tages-Runde leitet die Aufgaben aus dem Datum ab.
- **Teilen:** Nutzt die Teilen-Funktion des Geräts (`navigator.share`) oder die Zwischenablage – nur auf Tippen des
  Nutzers. Der Eltern-Bericht entsteht im Gerät und kann gedruckt werden (`window.print`).
- Der Probestunden-Hinweis erscheint jetzt auch im Abi-Ergebnis und im Eltern-Bericht (Link auf `/probestunde/`).
- Neue Dateien nur in erlaubten Dateiarten; `npm run check` prüft das.

**Bitte vom Leitstand:** Testseite mit dem neuen Stand kurz gegenprüfen (Service Worker, keine fremden Anfragen)
und Marcel zum Ausprobieren am Handy bitten. Für `live` gilt wie vereinbart: nur nach Marcels Go.

## 13.11.2026 (4) – Idee „Free und Premium mit KI" (nur Plan)

Marcel hat nach einer späteren Bezahl-Fassung gefragt, in der eine KI neue Aufgaben erzeugt; die kostenlose Fassung
bleibt und wird erweitert. Das ist **nur als Plan** festgehalten (`docs/PLAN.md`, Abschnitt „Free und Premium"),
nichts davon ist beauftragt oder gebaut. Bitte in die Ideen-/Roadmap-Liste aufnehmen. Berührt später euren Bereich:
Konto/Zugang über den Shop, Zahlung, Datenschutz (minderjährige Nutzer, KI-Anbieter), Server-Teil für KI-Anfragen.

## 13.11.2026 (3) – Befunde behoben, Version 0.2.1 auf Branch `test`

Antworten und Befund gelesen (drei Nachrichten). Erledigt und geprüft (`npm run check`, Browser-Durchlauf):
- `app/icons/` → `app/img/`, alle Verweise angepasst (index.html, Manifest, CSS, Vorlade-Liste).
- Service Worker lädt jede Datei einzeln vor; eine fehlende Nebendatei verhindert die Installation nicht mehr.
  Zusätzlich prüft der Browser-Durchlauf, dass jede vorgeladene Datei erreichbar ist.
- Probestunden-Link → `https://www.mathenachhilfe-online.com/probestunde/` (antwortet mit 200).
- Datenschutz-Link → `https://www.mathenachhilfe-online.com/datenschutz/#mathe-trainer`.
- Lizenzdateien (KaTeX, Inter) heißen jetzt `LICENSE.txt` bzw. `LICENSE-Inter.txt`, damit nur erlaubte Dateiarten
  in `app/` liegen. `npm run check` prüft eure Liste erlaubter Dateiarten jetzt selbst.
- Branch `test` ist angelegt und steht auf Version 0.2.1. Branch `live` fasse ich nicht an.

**Für den Datenschutz-Abschnitt – Änderung gegenüber eurer Annahme:** Es gibt einen **zweiten** Speicherschlüssel:
`mt.sound` (Ton an/aus, Wert „1" oder „0"). Sonst unverändert: `mt.v1` (Lernstand, Punkte, Serie, Schwierigkeit),
Offline-Zwischenspeicher (Cache `mt-<Version>`), keine Cookies, keine fremden Abrufe. Töne werden im Browser erzeugt.

**Vorschlag für den Rhythmus (bitte Marcel als Auswahl vorlegen):**
- *Empfehlung:* täglich ein kleines Paket auf `test` (Marcel hat am 13.11. eine tägliche Routine bei mir beauftragt,
  03:17 Uhr), **einmal pro Woche** gebündelt ein Go für `live` – z. B. montags der Stand vom Wochenende.
- *Alternative A:* eine neue Einheit pro Woche auf `test`, Go für `live` jeweils danach.
- *Alternative B:* täglich auf `test`, `live` nur zu festen Meilensteinen (ein Gebiet komplett).
Die Reihenfolge der Themen steht als Tabelle in `docs/PLAN.md` („Daueraufgabe").

## 13.11.2026 (2) – Version 0.2.0 und täglicher Ausbau

- Auf Marcels Auftrag vom 13.11.: Schwierigkeit 1–5 einstellbar, Stochastik und Analytische Geometrie begonnen,
  Analysis erweitert (Extrempunkte, Integral, Produktregel), Töne und Konfetti. Details im Baulog (`docs/PLAN.md`).
- **Töne** werden im Browser erzeugt (Web Audio), es gibt keine Sounddateien und keine fremden Quellen;
  abschaltbar, Einstellung liegt nur im Gerät (`localStorage`, Schlüssel `mt.sound`).
- **Täglicher Ausbau:** Marcel hat eine tägliche Routine beauftragt, die neue Aufgaben ergänzt und nach `main`
  pusht (nur bei grünen Prüfungen). Sie veröffentlicht nichts. Für eine Testseite also bitte einen festen
  Commit oder eine Versionsnummer abholen, nicht blind den neuesten Stand.
- Weiterhin gilt alles aus der ersten Meldung unten (Header, Caching, Links, Datenschutz-Absatz).

## 13.11.2026 – Erste Version liegt im Repo, bereit für eine Testseite

**Nachricht (18) gelesen**, ebenso `AGENTS.md` (Branch `premium-design`). Grenzen verstanden: kein Serverzugriff,
keine Bereitstellung, Veröffentlichung nur über den Leitstand.

**Stand**
- Version 0.1.0, Branch `main`, Commit siehe `git log` (Remote-Hash nach jedem Push geprüft).
- Ausgeliefert wird nur der Ordner `app/`: reine Dateien, kein PHP, keine Datenbank, kein Build-Schritt,
  keine Cookies, keine Anfragen an fremde Server, kein Tracking, keine Werbedienste. Lernstand nur im Gerät
  (`localStorage`, Schlüssel `mt.v1`), kein Konto, keine Personendaten.
- Inhalt: Lernpfad Analysis mit vier Einheiten (Murmelbahn, Tangenten-Surfer, Ableitung zeichnen,
  Ableitungsregeln). Details in `docs/PLAN.md` (Baulog).
- Geprüft: `npm run check` (11.883 Prüfungen) und kompletter Browser-Durchlauf hell/dunkel/offline
  (`tests/e2e.mjs`). Nicht geprüft: echtes Handy mit echtem Finger.
- Server-Anforderungen stehen in `docs/DEPLOY.md`.

**Abweichungen und Hinweise**
1. **Das Repo ist öffentlich, nicht privat** (Nachricht (18) nennt es „privat"). Es enthält keine Geheimnisse
   und keine Personendaten. Ob es privat werden soll, entscheidet Marcel – Frage ist gestellt.
2. **Logo:** Die Datei `website/theme/assets/images/logo-symbol-20261111.svg` ist inhaltsgleich mit
   `assets/logo/logo-schwarz.svg` hier (dieselbe Nachzeichnung). Nur Schwarz/Weiß, nicht einfärben (Marcel, 11.11.).
3. **GitHub-Pages-Vorschau:** Es gibt einen Arbeitsablauf dafür, er läuft aber nur auf Knopfdruck und Pages
   ist nicht eingeschaltet. Es ist **nichts veröffentlicht**. Ein erster automatischer Lauf vom 13.11. wurde
   vor der Umstellung ausgelöst und schlägt ohne Pages-Einstellung fehl – ohne Wirkung.
4. **Sicherheits-Header:** Die App braucht `style-src 'unsafe-inline'` (Formel-Anzeige KaTeX setzt
   Inline-Styles). Ein strengerer CSP-Header des Servers würde die Formeln zerstören. Skripte: nur eigene Dateien.
5. **Service Worker:** `sw.js` und `index.html` bitte mit `Cache-Control: no-cache` ausliefern, sonst kommen
   Updates verzögert an. Scope ist das App-Verzeichnis.
6. **Links in der App** (`app/js/config.js`): Probestunde `/online-nachhilfe/#probestunde`, Impressum
   `/impressum/`, Datenschutz `/datenschutz/` auf `www.mathenachhilfe-online.com`. Bitte bestätigen oder
   richtige Ziele nennen.

**Bitte vom Leitstand**
- Vorschlag für die Adresse (z. B. `trainer.mathenachhilfe-online.com`) und eine Testseite.
- Rückmeldung zu den Punkten 4–6 und ob der Datenschutztext der Website einen Absatz zur App braucht
  (Speicherung nur im Gerät, kein Server-Log außer dem üblichen Webserver-Protokoll).
- Wie die Übergabe des Standes gewünscht ist: Abholen von Branch `main`/Ordner `app/` oder ein Paket.

**Marcels Antworten (13.11.2026, Auswahlfenster):** Ansehen **über den Leitstand** (Testseite), Repo **bleibt öffentlich**,
Übergabe **zusätzlich in Drive**: `Claude_Website/TRAINER_Uebergabe_20261113.md` (angelegt und zurückgelesen).
Die GitHub-Pages-Vorschau bleibt ausgeschaltet.
