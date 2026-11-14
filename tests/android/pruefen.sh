#!/usr/bin/env bash
# Prüft die Selbst-Aktualisierung der Android-App am Rechner (braucht nur ein JDK).
set -euo pipefail
cd "$(dirname "$0")/../.."
aus=$(mktemp -d)
javac -encoding UTF-8 -d "$aus" android/offline/app/src/main/java/com/mathenachhilfe_online/trainer/Update.java tests/android/UpdateTest.java
java -Dfile.encoding=UTF-8 -cp "$aus" com.mathenachhilfe_online.trainer.UpdateTest app/stand.json
rm -rf "$aus"
