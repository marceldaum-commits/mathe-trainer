package com.mathenachhilfe_online.trainer;

import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageInstaller;
import android.os.Build;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * Neue App-Hülle in der Test-App selbst laden und installieren (Marcel, 18.11.2026: „Das Update sollte komplett in der App laufen“).
 * Nur im Kanal „test“ – die Play-Store-Fassung hat dafür keine Erlaubnis (sie aktualisiert der Store).
 * Die APK baut GitHub bei jeder neuen Fassung auf dem Zweig test und legt sie unter einer festen Adresse ab (.github/workflows/apk.yml).
 * Android installiert sie nur, wenn sie mit demselben Schlüssel signiert ist wie die installierte App – und fragt einmal „Installieren?“.
 * Ablauf: laden (Fortschritt als Ereignis mt-apk) → PackageInstaller-Sitzung → Android zeigt die Rückfrage → App startet neu.
 */
public class ApkLaden extends BroadcastReceiver {
    static final String ADRESSE = "https://github.com/marceldaum-commits/mathe-trainer/releases/download/apk-test/Mathe-Trainer-test.apk";
    static final String ERGEBNIS = "com.mathenachhilfe_online.trainer.APK_ERGEBNIS";
    static final int MAX = 60 * 1024 * 1024;
    /** Rückmeldung an die Web-App: stand = laedt | frage | fertig | fehler | erlaubnis, dazu Prozent. */
    interface Melder { void melde(String stand, int prozent); }
    static volatile Melder melder;
    private static volatile boolean laeuft;

    static boolean laeuft() { return laeuft; }

    /** Im Hintergrund laden und die Installation anstoßen. */
    static void starte(final Context c, final Melder m) {
        if (laeuft) return;
        laeuft = true; melder = m;
        new Thread(() -> {
            PackageInstaller.Session s = null;
            try {
                HttpURLConnection h = oeffne(ADRESSE);
                int len = h.getContentLength();
                if (len > MAX) throw new java.io.IOException("zu groß");
                PackageInstaller pi = c.getPackageManager().getPackageInstaller();
                PackageInstaller.SessionParams p = new PackageInstaller.SessionParams(PackageInstaller.SessionParams.MODE_FULL_INSTALL);
                p.setAppPackageName(c.getPackageName());
                if (Build.VERSION.SDK_INT >= 31) p.setRequireUserAction(PackageInstaller.SessionParams.USER_ACTION_REQUIRED);
                int id = pi.createSession(p);
                s = pi.openSession(id);
                try (InputStream in = h.getInputStream(); OutputStream out = s.openWrite("app.apk", 0, len > 0 ? len : -1)) {
                    byte[] b = new byte[64 * 1024]; long n = 0; int r, zuletzt = -1;
                    while ((r = in.read(b)) > 0) {
                        n += r; if (n > MAX) throw new java.io.IOException("zu groß");
                        out.write(b, 0, r);
                        int pz = len > 0 ? (int) (n * 100 / len) : 0;
                        if (pz != zuletzt) { zuletzt = pz; m.melde("laedt", pz); }
                    }
                    s.fsync(out);
                }
                Intent i = new Intent(c, ApkLaden.class).setAction(ERGEBNIS).setPackage(c.getPackageName());
                int flags = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 31 ? PendingIntent.FLAG_MUTABLE : 0);
                s.commit(PendingIntent.getBroadcast(c, id, i, flags).getIntentSender());
                s.close(); s = null;
                m.melde("frage", 100);
            } catch (Exception e) {
                if (s != null) try { s.abandon(); } catch (Exception egal) { /* schon weg */ }
                laeuft = false; m.melde("fehler", 0);
            }
        }, "mt-apk").start();
    }

    /** Folgt Weiterleitungen (GitHub → Speicher) – nur über https. */
    private static HttpURLConnection oeffne(String adresse) throws java.io.IOException {
        String u = adresse;
        for (int i = 0; i < 6; i++) {
            if (!u.startsWith("https://")) throw new java.io.IOException("nur https");
            HttpURLConnection h = (HttpURLConnection) new URL(u).openConnection();
            h.setInstanceFollowRedirects(false); h.setConnectTimeout(15000); h.setReadTimeout(30000);
            int code = h.getResponseCode();
            if (code >= 300 && code < 400) { u = new URL(new URL(u), h.getHeaderField("Location")).toString(); h.disconnect(); continue; }
            if (code != 200) throw new java.io.IOException("HTTP " + code);
            return h;
        }
        throw new java.io.IOException("zu viele Weiterleitungen");
    }

    /** Antwort von Android zur Installation. */
    @Override public void onReceive(Context c, Intent intent) {
        if (!ERGEBNIS.equals(intent.getAction())) return;
        int st = intent.getIntExtra(PackageInstaller.EXTRA_STATUS, PackageInstaller.STATUS_FAILURE);
        Melder m = melder;
        if (st == PackageInstaller.STATUS_PENDING_USER_ACTION) {
            Intent frage = intent.getParcelableExtra(Intent.EXTRA_INTENT);
            if (frage != null) { frage.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK); try { c.startActivity(frage); } catch (Exception e) { laeuft = false; if (m != null) m.melde("fehler", 0); } }
            return;
        }
        laeuft = false;
        if (m != null) m.melde(st == PackageInstaller.STATUS_SUCCESS ? "fertig" : st == PackageInstaller.STATUS_FAILURE_ABORTED ? "abgebrochen" : "fehler", 0);
    }
}
