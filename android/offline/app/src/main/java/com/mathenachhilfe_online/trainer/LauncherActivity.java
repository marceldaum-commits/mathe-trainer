package com.mathenachhilfe_online.trainer;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.pm.PackageManager;
import android.provider.Settings;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowInsets;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

/**
 * Die App: ein Fenster, das die fest eingepackte Web-App zeigt – ohne Internet.
 * Alle Dateien der Web-App liegen in der App-Datei (Ordner www) und werden unter der echten Adresse
 * ausgeliefert. Nur Anfragen an /api/ (Rangliste, Fehler melden) gehen ins Netz, wenn es eines gibt.
 */
public class LauncherActivity extends Activity {
    static final String HOST = "trainer.mathenachhilfe-online.com";
    static final String BASIS = "https://" + HOST + "/";
    private WebView web;

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
                InputStream in = getAssets().open("www" + p);
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
