# Änderungen Mathe-Trainer

Kurzfassung für Nutzer und Leitstand. Einzelheiten: `docs/PLAN.md` (Baulog) und `MELDUNG_AN_LEITSTAND.md`.

## 2.5.5 – 24.11.2026 (Dienstag-Update)
- **Neue Inhalte:**
  - Oberstufe: Einheit „Gauß-Verfahren“ (drei Gleichungen, drei Unbekannte; Dreiecksform, Eliminieren, keine/eine/unendlich viele Lösungen) mit Theorie, Formeln und Boss.
  - Klasse 9: Einheit „Potenz-, Wurzel- und Bruchgleichungen“ (Probe, Scheinlösungen, Definitionsmenge, Hochzahlen mit Bruch). Prüfstein war Marcels Arbeitsblatt: 2√x=6, 5√x=−1/16, √(−x+5)=10 und 2·√(5x)=10x werden richtig gelöst.
  - Jede Aufgabe wird in einem eigenen Test unabhängig nachgerechnet.
- **Eltern-Tor** nach dem gemeinsamen Standard aller Lern-Apps:
  - Eine Malaufgabe in Worten mit eigenen Zifferntasten. Nach einem Fehler kommt sofort eine neue Aufgabe. Danach bleibt das Tor 10 Minuten offen.
  - Dahinter liegen Shop, Probestunde, fremde Seiten, Elternbereich, Elternbericht, Klassen-Code und die Eltern-Einstellungen. Die eigene Website (Startseite, Lern-Apps, Impressum, Datenschutz) und die anderen Lern-Apps sind frei.
  - Einstellungen: Schalter wie Schrift, Ton und Look bleiben frei, der Rest steht hinter „Für Eltern“.
- **Klasse 5–10:** Die Pro-Seite zeigt Preise und Kaufknöpfe erst nach dem Tor. Gesperrte Inhalte zeigen nur „Das gehört zu Mathe-Trainer Pro.“ und „Für Eltern“. Keine Werbung für Nachhilfe in der Kinderansicht.
- **Oberstufe:** Die Preise bleiben sichtbar. Kaufen geht über das Tor, dazu der Hinweis „Wer unter 18 ist, kauft nicht selbst.“
- **Probestunde (V15):** Bei Schwierigkeiten sehen Kinder nur einen Hilfesatz mit „Leichter üben“ und „Erklärung ansehen“. In Klasse 9–10 gibt es höchstens einmal pro Woche einen Tipp. Im Elternbericht erscheint ein Hinweis, wenn ein Thema mit mindestens 10 Versuchen mindestens zur Hälfte falsch war (höchstens einmal in 4 Wochen je Thema, ausblendbar).
- **KI-Kennzeichnung (V7):** Jede KI-Antwort trägt „Antwort einer KI – sie kann Fehler enthalten.“ KI-Aufgaben sagen, ob sie im Gerät nachgerechnet wurden.
- **Familien-Speicher** hinter dem Tor: anlegen, beitreten (mit Einwilligung), Kinder, Stand abgleichen, Rechte, Protokoll, Link/QR/Notfall-Blatt, Löschen mit Familien-Nummer. `familie.js` auf af01c5c.
- **Pro-Seite:** „Abi-Pass (bis 31.07.)“, „Kein Abo – endet automatisch.“, 30-Tage-Code einlösbar bis zum 31.12. des dritten Jahres nach dem Kauf.
- **Spiele umbenannt:** Sinus-Slalom, Vektor-Kompass, Geraden-Drehbühne. Dazu der Hinweis „Mehr davon in KurvenFlug/Raumlicht“. Querverweise zeigen auf lernen.…/<app>/.
- **Startanimation** wie in den anderen Lern-Apps: dunkler Start, atmendes Logo, weicher Übergang (mit Rücksicht auf „weniger Bewegung“).
- **PC-Vollbild** ab 1200 px: breitere Seite, Kacheln in drei Spalten, Aufgaben mit Frage links und Antworten rechts, Theorie mit fester Formelspalte. Handy und iPad bleiben unverändert.
- **Vorlesen:** Alle Hinweise auf Nova und OpenAI sind aus Code und Texten entfernt. Das Vorlesen bleibt aus, bis die Stimme vom Tonstudio steht. Die Textliste fürs Tonstudio liegt in `docs/tonstudio-texte.json` (Format 1, nur Deutsch).

## 2.5.4 – 19.11.2026 (Fehlerbehebung, enthält 2.5.3)
- **Server-Verbindung auf der neuen Adresse repariert:** Seit dem Umzug (2.5.0) hat der Browser auf lernen.mathenachhilfe-online.com alle Abrufe an trainer.…/api blockiert. Ursache: Der Server schickt dafür keine CORS-Erlaubnis. Betroffen waren:
  - KI-Funktionen
  - Prüfung und Einlösen von Zugangscodes
  - Pro-Status
  - Fehlermeldungen
  - Handy-Erinnerungen

  Jetzt laufen diese Abrufe über den Weiterleiter auf derselben Adresse (…/mathetrainer/api). Zählung, Eltern-Kopplung und Familien-Speicher waren nicht betroffen, weil der Server für sie CORS schickt.

## 2.5.3 – 19.11.2026 (Sofortkorrektur, Recht; Marcel: „Heute ausblenden“)
- **Klasse 5–10:**
  - Die Karte „PRO“ ist ausgeblendet.
  - Die Pro-Seite zeigt keine Preise und keine Kaufknöpfe mehr, auch nicht über einen direkten Link. Dort steht nur die eigene Stufe bzw. „Das gehört zu Mathe-Trainer Pro.“
  - Bei gesperrten Inhalten gibt es keine Kauf-Verweise mehr.
- Die Oberstufe bleibt unverändert.

## 2.5.2 – 19.11.2026
- Startseite am PC: Die Klassen-Wahl ist jetzt so breit wie die Karten darunter (vorher schmaler, wirkte schief).

## 2.5.0 – 19.11.2026
- **Neue Adresse:** Der Mathe-Trainer zieht zu den anderen Lern-Apps nach **lernen.mathenachhilfe-online.com/mathetrainer**. Wer die alte Adresse öffnet, wird von selbst hingebracht – der Fortschritt kommt verschlüsselt mit (er liegt dafür kurz beim Server und wird gleich danach gelöscht). Liegt an der neuen Adresse schon ein Fortschritt, bleibt er. Installierte Apps bitte an der neuen Adresse neu installieren; Handy-Erinnerungen dort neu einschalten.
- Technisch: eigene Namen für gespeicherte Daten und den Offline-Speicher, damit sich die Lern-Apps unter einer Adresse nicht in die Quere kommen.

## 2.4.3 – 19.11.2026
- Wissensgarten-Links führen direkt ins passende Lernkarten-Paket. Zu Raumlicht wird nur auf freie Bereiche verlinkt (Analysis & Zufall erleben, Rotationskörper-Labor, Galton-Brett, Zufallsmaschine, Flug durch den Raum).

## 2.4.2 – 19.11.2026 (nur intern, nicht auf test)
- **Passt dazu in anderen Apps:** Unter der Theorie vieler Themen stehen jetzt Links zu den anderen Lern-Apps – Graph ausprobieren in KurvenFlug, Kopfrechnen bei Rechenblitz, im Raum erleben in Raumlicht, Experimente in Experimentopia, Formeln wiederholen im Wissensgarten.
- „Kommt bald“ aufgeräumt: Themen, die eine andere Lern-App schon gut abdeckt, werden dort verlinkt statt hier doppelt gebaut.

## 2.4.1 – 19.11.2026
- Am PC stehen Formulare und Textkarten wieder untereinander statt im Zickzack (Lernkarten „Eigene Karte anlegen“, Eltern-Kopplung, Bericht für Eltern, Einstellungen).

## 2.4.0 – 20.11.2026
- **Neue Oberstufen-Einheit „Integral anwenden“** (Analysis): Mittelwert einer Funktion, Bestand aus der Änderungsrate (z. B. Wasser im Becken, Bakterien), größter und kleinster Bestand. Drei Aufgaben-Arten mit je fünf Stufen, jede mit vollständigem Lösungsweg; dazu Theorie mit Formel, Bedeutung der Größen und durchgerechneten Beispielen und ein Endgegner.
- **Knopf „← Alle Apps“** auf der Startseite und der Lernen-Seite: führt zur Übersicht aller Lern-Apps von Mathenachhilfe Online (nicht in Aufgaben, Prüfungen und Spielen).
- Einstellungen → Zurücksetzen: Die drei Auswahl-Felder sind wieder gut lesbar (vorher in eine schmale Spalte gequetscht).
- Klassenarbeits-Trainer: Der Probestunden-Link führt jetzt direkt zur Seite „Probestunde“.

## 2.3.11 – 18.11.2026
- **Anonyme Zählung, abschaltbar.** Die App zählt nur Zahlen wie „App geöffnet“ oder „Link angetippt“ – ohne Kennung, ohne Lernstand, ohne Code – und schickt sie an den eigenen Server. Abschalten in den Einstellungen („Anonyme Nutzungszählung“); dann wird nichts gesendet. Links zur Website tragen ihre Herkunft (`src=mathetrainer-…`). Fußzeile: „Ein Angebot von Mathenachhilfe Online“.
- Klassenarbeits-Trainer: Hinweis auf die kostenlose Probestunde vor der Arbeit.
- 30-Tage-Zugang läuft ab dem ersten Einlösen.

## 2.3.10 – 18.11.2026
- Freischalt-Link `#pro=CODE` (und weiter `?pro=` aus alten Mails); der Code verschwindet sofort aus der Adresszeile.
- Code-Eingabe von Hand immer sichtbar (wichtig für die App vom iPhone-Home-Bildschirm).
- Eltern-Bericht mit den Themen-Kennungen der gemeinsamen Liste.

## 2.3.9 – 18.11.2026
- Eltern-Handy koppeln: verschlüsselter Bericht für die Eltern, verschlüsselte Sicherung des Lernstands, Wiederherstellen auf einem neuen Gerät per Link.
- Themen in die Lehrplan-Klasse verschoben (Baumdiagramm/Vierfeldertafel → Klasse 9, Flächen und Prismen → Klasse 7).

## 2.3.8 – 18.11.2026
- Theorie aller 73 Themen geprüft und ergänzt (Formel, Bedeutung der Größen, durchgerechnetes Beispiel); Vektor-Geometrie vollständig.
- „Kommt bald“ je Klasse und Oberstufen-Gebiet nach Lehrplan-Abgleich.

## 2.3.7 – 18.11.2026
- Nur noch Web-App (installierbar), Knopf „App installieren“; Vorlesen abgeschaltet; Web-App hält sich selbst aktuell.
