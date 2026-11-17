#!/usr/bin/env python3
"""Lautschrift-Wörterbuch für die Stimme „Thorsten“ (Mathe-Trainer) – Werkzeug für den Entwicklungsrechner, NICHT Teil der App.
espeak-ng (GPL-3, kommt mit `pip install piper-tts`) läuft nur hier; die App bekommt nur die fertigen Laute als Daten.
Aufruf: python3 lautschrift.py woerter.txt thorsten.onnx.json ausgabe.tsv"""
import json, os, re, sys
import piper
from piper.phonemize_espeak import EspeakPhonemizer
woerter_datei, cfg_datei, aus = sys.argv[1:4]
ids = json.load(open(cfg_datei, encoding='utf-8'))['phoneme_id_map']
P = EspeakPhonemizer(os.path.join(os.path.dirname(piper.__file__), 'espeak-ng-data'))
def saetze(t): return [''.join(s).strip() for s in P.phonemize('de', t) if ''.join(s).strip()]
def allein(w): return ' '.join(saetze(w)).rstrip('.').strip()
TAIL = allein('Tisch')
def im_satz(w):
    got = ' '.join(saetze(w + ' Tisch'))
    if got.endswith(' ' + TAIL) and ' ' not in got[:-len(TAIL) - 1].strip(): return got[:-len(TAIL) - 1].strip()
    return allein(w)
VOKAL = re.compile('[AEIOUÄÖÜ]')
def abk(w):
    if re.fullmatch('[IVXLCDM]+', w) or (len(w) > 3 and VOKAL.search(w)): return allein(w)
    return allein(' '.join(w))
keys = [w.strip() for w in open(woerter_datei, encoding='utf-8') if w.strip()]
ks = set(keys); keys = [w for w in keys if not (w.isupper() and len(w) >= 2 and w.lower() in ks)]
keys += list('abcdefghijklmnopqrstuvwxyzäöüß')
zeilen, fehlt = {}, 0
for w in keys:
    ph = abk(w) if (len(w) >= 2 and w.isupper()) else allein(w) if len(w) == 1 else im_satz(w)
    if not ph or any(c not in ids for c in ph): fehlt += 1; continue
    zeilen[w] = ph
for n in range(0, 1000): zeilen[str(n)] = allein(str(n))
with open(aus, 'w', encoding='utf-8') as f:
    for k in sorted(zeilen): f.write(k + '\t' + zeilen[k] + '\n')
print(len(zeilen), 'Einträge,', fehlt, 'ohne passende Laute,', os.path.getsize(aus) // 1024, 'KB')
