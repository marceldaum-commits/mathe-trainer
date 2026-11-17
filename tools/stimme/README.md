# Stimme „Thorsten“ – Lautschrift-Wörterbuch erzeugen (nur Entwicklungsrechner)

Die natürliche Stimme „Thorsten“ (Piper-Modell `de_DE-thorsten-medium`, Aufnahmen CC0) braucht Lautschrift statt Buchstaben.
Das Umsetzen erledigt üblicherweise espeak-ng (**GPL-3**). Damit die App diesen Baustein **nicht** enthält, entsteht die Lautschrift
hier vorab und kommt als Daten in die App:

| Datei | Inhalt |
|---|---|
| `app/stimme/woerter.txt` | `wort<Tab>Laute` (alle Wörter der App + Zahlen 0–999; als .txt, weil der Server nur bestimmte Dateiarten ausliefert) |
| `app/stimme/laute.json` | Zeichenliste der Stimme (Laut → Nummer im Modell, aus `de_DE-thorsten-medium.onnx.json`) |

Die App macht aus Text und Formeln eine Sprechfassung (`app/js/sprech.js`), setzt sie Wort für Wort aus dem Wörterbuch zusammen
(`app/js/vorlesen.js`) und rechnet daraus mit ONNX Runtime Web (MIT, `app/vendor/ort/`; der Rechenkern liegt als `ort-wasm-simd-threaded.wasm.txt` dort, weil der Server keine .wasm-Dateien ausliefert – die App lädt ihn als Daten) die Sprache. Unbekannte Wörter werden buchstabiert.

## Neu erzeugen (nach neuen Texten oder Erzeugern)

```bash
python3 -m venv /tmp/stimme && /tmp/stimme/bin/pip install piper-tts      # bringt espeak-ng mit – nur hier
node tools/stimme/sammeln.mjs /tmp/proben.json 40                         # Texte und Formeln aller Erzeuger
node tools/stimme/woerter.mjs /tmp/proben.json /tmp/woerter.txt           # alle Wörter (Erzeuger, Theorie, Oberfläche)
curl -so /tmp/thorsten.json https://stimmen.mathenachhilfe-online.com/thorsten/de_DE-thorsten-medium.onnx.json
/tmp/stimme/bin/python tools/stimme/lautschrift.py /tmp/woerter.txt /tmp/thorsten.json /tmp/woerter.tsv
cp /tmp/woerter.tsv app/stimme/woerter.txt
npm run check                                                              # prüft u. a., dass die Wörter der Aufgaben im Wörterbuch stehen
```
