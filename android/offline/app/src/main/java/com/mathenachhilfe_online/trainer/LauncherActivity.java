package com.mathenachhilfe_online.trainer;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.pm.PackageManager;
import android.print.PrintAttributes;
import android.print.PrintManager;
import android.provider.Settings;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowInsets;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

/**
 * Die App: ein Fenster, das die fest eingepackte Web-App zeigt – ohne Internet.
 * Mit Internet holt sie sich neuere Inhalte selbst (Update.java); sie gelten ab dem nächsten Start.
 * Alle Dateien der Web-App liegen in der App-Datei (Ordner www) und werden unter der echten Adresse
 * ausgeliefert. Nur Anfragen an /api/ (Rangliste, Fehler melden) gehen ins Netz, wenn es eines gibt.
 */
public class LauncherActivity extends Activity {
    static final String HOST = "trainer.mathenachhilfe-online.com";
    static final String BASIS = "https://" + HOST + "/";
    private WebView web;

    /* Selbst-Aktualisierung der Inhalte (siehe Update.java). Kanal „test“ lädt den Test-Stand, „store“ den freigegebenen. */
    static final String REPO = "https://raw.githubusercontent.com/marceldaum-commits/mathe-trainer/";
    static final String APK = REPO + "apk/Mathe-Trainer.apk";
    /** Ordner mit dem geladenen Stand in Benutzung – oder null: dann gilt die eingepackte Fassung. */
    private volatile File geladen;
    private volatile String inhalt = "", bereit = "";
    private volatile boolean huelleNeu;
    private String kanal() { return getString(R.string.mt_kanal); }
    private String quelle() {
        String k = kanal();
        return "test".equals(k) ? REPO + "test/app/" : "store".equals(k) ? REPO + "live/app/" : null;
    }
    private File updateOrdner() { return new File(getFilesDir(), "update"); }
    /** Beim Start: fertig Geladenes übernehmen. */
    private void updateStarte() {
        try {
            String v = Update.starte(updateOrdner(), BuildConfigInfo.version(this));
            geladen = v == null ? null : Update.aktiv(updateOrdner());
            inhalt = v == null ? "" : v;
            bereit = "";
        } catch (RuntimeException egal) { geladen = null; inhalt = ""; }
    }
    /** Im Hintergrund bei der Quelle nachsehen; die Web-App erfährt das Ergebnis über das Ereignis mt-update. */
    private void updateSuche() {
        final String q = quelle();
        if (q == null) return;
        new Thread(() -> {
            try {
                Update.Ergebnis e = Update.lade(updateOrdner(), q, BuildConfigInfo.version(this), pfad -> getAssets().open("www/" + pfad), Update.NETZ);
                bereit = e.bereit == null ? "" : e.bereit;
                huelleNeu = "test".equals(kanal()) && e.huelle > getResources().getInteger(R.integer.mt_huelle);
                if (!bereit.isEmpty() || huelleNeu) runOnUiThread(() -> { if (web != null) web.evaluateJavascript("window.dispatchEvent(new Event('mt-update'))", null); });
            } catch (Exception ohneNetz) { /* kein Netz oder Quelle nicht erreichbar: beim nächsten Start wieder */ }
        }, "mt-update").start();
    }

    /** Für die Web-App sichtbar als window.MTApp: Sie weiß dann, dass sie in der Offline-App läuft. */
    public final class Bruecke {
        @JavascriptInterface public String version() { return BuildConfigInfo.version(LauncherActivity.this); }
        @JavascriptInterface public boolean offlineFest() { return true; }

        /* Erinnerung – ganz im Gerät (siehe Erinnerung.java). */
        /** Zustand als JSON: {"an":true,"zeit":"18:00","erlaubt":true} */
        @JavascriptInterface public String erinnerungStand() {
            Context c = LauncherActivity.this;
            return "{\"an\":" + (Erinnerung.an(c) && Erinnerung.erlaubt(c)) + ",\"zeit\":\"" + Erinnerung.zeit(c) + "\",\"erlaubt\":" + Erinnerung.erlaubt(c) + "}";
        }
        /** Einschalten. Antwort: "ok", "frage" (Android fragt gerade nach der Erlaubnis – Ergebnis kommt als Ereignis mt-erinnerung) oder "gesperrt". */
        @JavascriptInterface public String erinnerungAn(String zeit) {
            Context c = LauncherActivity.this;
            if (!Erinnerung.zeitOk(zeit)) return "zeit";
            if (Erinnerung.erlaubt(c)) { Erinnerung.setze(c, true, zeit); return "ok"; }
            if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                wunschZeit = zeit;
                runOnUiThread(() -> requestPermissions(new String[] { Manifest.permission.POST_NOTIFICATIONS }, 7));
                return "frage";
            }
            return "gesperrt";
        }
        @JavascriptInterface public void erinnerungAus() { Erinnerung.setze(LauncherActivity.this, false, null); }
        /** Die Web-App meldet: heute wurde geübt – dann kommt heute keine Mitteilung mehr. */
        @JavascriptInterface public void geuebt() { Erinnerung.geuebt(LauncherActivity.this); }
        /** Druckt die angezeigte Seite bzw. speichert sie als PDF (Android-Druckdialog). */
        @JavascriptInterface public void drucken(String titel) {
            final String name = titel == null || titel.isEmpty() ? "Mathe-Trainer" : titel;
            runOnUiThread(() -> {
                try {
                    PrintManager pm = (PrintManager) getSystemService(Context.PRINT_SERVICE);
                    if (pm != null) pm.print(name, web.createPrintDocumentAdapter(name), new PrintAttributes.Builder().setMediaSize(PrintAttributes.MediaSize.ISO_A4).build());
                } catch (Exception keinDruck) { /* kein Druckdienst: nichts tun */ }
            });
        }
        /** Stand der Selbst-Aktualisierung als JSON: {"kanal":"test","inhalt":"0.22.0","bereit":"0.23.0","huelle":false} */
        @JavascriptInterface public String updateStand() {
            return "{\"kanal\":\"" + kanal() + "\",\"inhalt\":\"" + inhalt + "\",\"bereit\":\"" + bereit + "\",\"huelle\":" + huelleNeu + "}";
        }
        /** Geladene Inhalte jetzt übernehmen: Die App startet ihre Seite neu. */
        @JavascriptInterface public void updateAnwenden() {
            runOnUiThread(() -> { updateStarte(); web.clearCache(true); web.loadUrl(BASIS); });
        }
        /** Neue App-Datei im Browser herunterladen (nur Test-Fassung – im Store kommt die App über den Store). */
        @JavascriptInterface public void apkHolen() {
            if (!"test".equals(kanal())) return;
            runOnUiThread(() -> { try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(APK))); } catch (Exception keinBrowser) { /* nichts tun */ } });
        }
        /** Öffnet die Android-Einstellungen für die Mitteilungen dieser App. */
        @JavascriptInterface public void mitteilungenEinstellen() {
            runOnUiThread(() -> {
                try {
                    Intent i = Build.VERSION.SDK_INT >= 26
                        ? new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).putExtra(Settings.EXTRA_APP_PACKAGE, getPackageName())
                        : new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + getPackageName()));
                    startActivity(i);
                } catch (Exception nichtDa) { /* Einstellungen nicht erreichbar: nichts tun */ }
            });
        }
    }
    private volatile String wunschZeit;
    private ValueCallback<Uri[]> dateiAntwort;

    @Override
    protected void onActivityResult(int nr, int ergebnis, Intent daten) {
        super.onActivityResult(nr, ergebnis, daten);
        if (nr != 9 || dateiAntwort == null) return;
        Uri u = ergebnis == RESULT_OK && daten != null ? daten.getData() : null;
        dateiAntwort.onReceiveValue(u == null ? null : new Uri[] { u });
        dateiAntwort = null;
    }

    @Override
    public void onRequestPermissionsResult(int nr, String[] was, int[] antwort) {
        super.onRequestPermissionsResult(nr, was, antwort);
        if (nr != 7) return;
        boolean ja = antwort.length > 0 && antwort[0] == PackageManager.PERMISSION_GRANTED;
        if (ja && wunschZeit != null) Erinnerung.setze(this, true, wunschZeit);
        wunschZeit = null;
        melde();
    }
    /** Sagt der Web-App, dass sich an der Erinnerung etwas geändert hat. */
    private void melde() { if (web != null) web.evaluateJavascript("window.dispatchEvent(new Event('mt-erinnerung'))", null); }

    @Override
    protected void onResume() {
        super.onResume();
        Erinnerung.plane(this);   // Wecker sicher gestellt halten
        melde();                  // z. B. nach Rückkehr aus den Android-Einstellungen
    }

    @Override
    protected void onCreate(Bundle zustand) {
        super.onCreate(zustand);
        updateStarte();
        FrameLayout rahmen = new FrameLayout(this);
        rahmen.setBackgroundColor(Color.rgb(13, 23, 51));
        web = new WebView(this);
        web.setBackgroundColor(Color.rgb(13, 23, 51));
        rahmen.addView(web, new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        setContentView(rahmen);
        // Platz für Statusleiste, Gestenleiste und Tastatur lassen (neue Android-Versionen zeichnen sonst darunter).
        rahmen.setOnApplyWindowInsetsListener((View v, WindowInsets in) -> {
            if (Build.VERSION.SDK_INT >= 30) {
                android.graphics.Insets r = in.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout() | WindowInsets.Type.ime());
                v.setPadding(r.left, r.top, r.right, r.bottom);
            } else {
                v.setPadding(in.getSystemWindowInsetLeft(), in.getSystemWindowInsetTop(), in.getSystemWindowInsetRight(), in.getSystemWindowInsetBottom());
            }
            return in;
        });

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);          // Lernstand (localStorage) bleibt im Gerät
        s.setTextZoom(100);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setMediaPlaybackRequiresUserGesture(true);
        web.addJavascriptInterface(new Bruecke(), "MTApp");
        web.setWebViewClient(new Auslieferung());
        // Datei-Auswahl (Foto für den Rechenweg-Prüfer): Android zeigt seine eigene Auswahl; die App braucht dafür keine Berechtigung.
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> antwort, FileChooserParams p) {
                if (dateiAntwort != null) dateiAntwort.onReceiveValue(null);
                dateiAntwort = antwort;
                try {
                    Intent wahl = new Intent(Intent.ACTION_GET_CONTENT).addCategory(Intent.CATEGORY_OPENABLE).setType("image/*");
                    startActivityForResult(Intent.createChooser(wahl, "Foto auswählen"), 9);
                    return true;
                } catch (Exception keineAuswahl) { dateiAntwort = null; return false; }
            }
        });
        updateSuche();
        if (zustand != null && web.restoreState(zustand) != null) return;
        web.loadUrl(ziel(getIntent()));
    }

    /** Wohin beim Start? Kurzbefehle und das Widget geben eine Adresse der App mit. */
    static String ziel(Intent i) {
        Uri d = i == null ? null : i.getData();
        if (d != null && "https".equals(d.getScheme()) && HOST.equals(d.getHost())) return d.toString();
        return BASIS;
    }

    @Override
    protected void onNewIntent(Intent i) {
        super.onNewIntent(i);
        setIntent(i);
        if (i != null && i.getData() != null) web.loadUrl(ziel(i));
    }

    @Override
    protected void onSaveInstanceState(Bundle aus) {
        super.onSaveInstanceState(aus);
        web.saveState(aus);
    }

    @Override
    public void onBackPressed() {
        if (web.canGoBack()) web.goBack(); else super.onBackPressed();
    }

    static String mime(String pfad) {
        String e = pfad.substring(pfad.lastIndexOf('.') + 1).toLowerCase();
        switch (e) {
            case "html": return "text/html";
            case "js": case "mjs": return "text/javascript";
            case "css": return "text/css";
            case "json": return "application/json";
            case "webmanifest": return "application/manifest+json";
            case "svg": return "image/svg+xml";
            case "png": return "image/png";
            case "jpg": case "jpeg": return "image/jpeg";
            case "woff2": return "font/woff2";
            case "txt": return "text/plain";
            default: return "application/octet-stream";
        }
    }
    static boolean text(String m) { return m.startsWith("text/") || m.endsWith("json") || m.endsWith("xml"); }

    private final class Auslieferung extends WebViewClient {
        @Override
        public WebResourceResponse shouldInterceptRequest(WebView v, WebResourceRequest r) {
            Uri u = r.getUrl();
            if (!"GET".equals(r.getMethod()) || !HOST.equals(u.getHost())) return null;
            String p = u.getPath();
            if (p == null || p.isEmpty() || p.equals("/")) p = "/index.html";
            if (p.startsWith("/api/") || p.contains("..")) return null;   // Server-Anfragen gehen ins Netz
            try {
                File g = geladen;
                InputStream in = g != null ? new FileInputStream(new File(g, p.substring(1))) : getAssets().open("www" + p);
                String m = mime(p);
                Map<String, String> kopf = new HashMap<>();
                kopf.put("Cache-Control", "no-cache");
                return new WebResourceResponse(m, text(m) ? "utf-8" : null, 200, "OK", kopf, in);
            } catch (IOException fehlt) {
                // Nicht eingepackt: als „nicht gefunden“ beantworten statt ins Netz zu gehen – die App bleibt offline berechenbar.
                return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found", new HashMap<String, String>(), new java.io.ByteArrayInputStream(new byte[0]));
            }
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
            Uri u = r.getUrl();
            if ("https".equals(u.getScheme()) && HOST.equals(u.getHost())) return false;
            try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception keinProgramm) { /* kein Browser da: nichts tun */ }
            return true;   // Website, Probestunde, Impressum: im Browser öffnen
        }
    }
}
