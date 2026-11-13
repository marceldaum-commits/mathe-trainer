#!/usr/bin/env bash
# Baut das Widget in das von Bubblewrap erzeugte Android-Projekt ein.
# Aufruf: android/widget/einbauen.sh <Ordner des erzeugten Projekts>
# Mehrfach ausführbar: schon vorhandene Einträge werden nicht doppelt gesetzt.
set -euo pipefail
ZIEL="${1:?Ordner des erzeugten Android-Projekts angeben}"
HIER="$(cd "$(dirname "$0")" && pwd)"
MAIN="$ZIEL/app/src/main"
cp "$HIER/java/TrainerWidget.java" "$MAIN/java/com/mathenachhilfe_online/trainer/"
cp -r "$HIER/res/." "$MAIN/res/"
if ! grep -q 'TrainerWidget' "$MAIN/AndroidManifest.xml"; then
  python3 - "$MAIN/AndroidManifest.xml" "$HIER/manifest-eintrag.xml" <<'PY'
import sys
m, e = sys.argv[1], sys.argv[2]
s = open(m, encoding='utf-8').read()
assert s.count('</application>') == 1
open(m, 'w', encoding='utf-8').write(s.replace('</application>', open(e, encoding='utf-8').read() + '    </application>'))
PY
fi
echo "Widget eingebaut in $ZIEL"
