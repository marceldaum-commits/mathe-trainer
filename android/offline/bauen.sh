#!/usr/bin/env bash
# Baut die Offline-App (APK + Play-Store-Paket) aus dem aktuellen Stand der Web-App im Ordner app/.
# Braucht: JDK 17, Android-SDK (ANDROID_HOME) und für eine signierte Datei
#   MT_KEYSTORE=<Pfad zum Schlüssel>  MT_KEYSTORE_PASS=<Passwort>   (beides nie ins Repo!)
# Ergebnis: android/offline/app/build/outputs/apk/release/ und …/bundle/release/
set -euo pipefail
cd "$(dirname "$0")"
./gradlew --no-daemon -q assembleRelease bundleRelease
ls -la app/build/outputs/apk/release/*.apk app/build/outputs/bundle/release/*.aab
