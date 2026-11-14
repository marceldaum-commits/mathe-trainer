package com.mathenachhilfe_online.trainer;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Selbst-Aktualisierung der Inhalte: Die App schaut bei ihrer Quelle (dem eigenen Server) nach einer neueren Web-App,
 * lädt nur geänderte Dateien, prüft jede gegen ihre Prüfsumme und nutzt den neuen Stand ab dem nächsten Start.
 * Geht dabei irgendetwas schief, bleibt alles beim Alten – die eingepackte Fassung ist immer die Rückfallebene.
 *
 * Ordner unter {@code basis}:  aktiv/ = geladener Stand in Benutzung,  neu/ = fertig geladen (Marke „fertig“), wartet auf den Neustart.
 * Diese Klasse kommt ohne Android aus, damit sie sich am Rechner prüfen lässt (tests/android/UpdateTest.java).
 */
final class Update {
    private Update() {}

    /** Die eingepackte Web-App (Rückfallebene und Quelle für unveränderte Dateien). */
    interface Paket { InputStream oeffne(String pfad) throws IOException; }
    /** Holt eine Adresse aus dem Netz. */
    interface Holer { InputStream hole(String adresse) throws IOException; }

    static final class Stand {
        String version = ""; int huelle = 0; final Map<String, String> dateien = new LinkedHashMap<>();
    }
    static final class Ergebnis {
        /** Neu geladene Version (wartet auf den Neustart) oder null. */ String bereit;
        /** Nummer der App-Hülle, die die Quelle erwartet. */ int huelle;
    }

    private static final Pattern VERSION = Pattern.compile("\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}");
    private static final Pattern PFAD = Pattern.compile("[A-Za-z0-9_][A-Za-z0-9_.\\-]*(/[A-Za-z0-9_][A-Za-z0-9_.\\-]*)*");
    private static final Pattern P_VERSION = Pattern.compile("\"version\"\\s*:\\s*\"([^\"]*)\"");
    private static final Pattern P_HUELLE = Pattern.compile("\"huelle\"\\s*:\\s*(\\d{1,6})");
    private static final Pattern P_DATEI = Pattern.compile("\"([^\"]+)\"\\s*:\\s*\"([0-9a-f]{64})\"");
    static final int MAX_STAND = 400_000, MAX_DATEI = 8_000_000, MAX_ANZAHL = 600;

    /** Vergleicht zwei Versionen „a.b.c“: &lt;0, 0 oder &gt;0. Ungültiges zählt als 0.0.0. */
    static int vergleich(String a, String b) {
        int[] x = teile(a), y = teile(b);
        for (int i = 0; i < 3; i++) if (x[i] != y[i]) return x[i] < y[i] ? -1 : 1;
        return 0;
    }
    private static int[] teile(String v) {
        int[] r = new int[3];
        if (v == null || !VERSION.matcher(v).matches()) return r;
        String[] t = v.split("\\.");
        for (int i = 0; i < 3; i++) r[i] = Integer.parseInt(t[i]);
        return r;
    }

    /** Liest stand.json (von tools/check.mjs erzeugt). Wirft, wenn etwas nicht dem erwarteten Muster entspricht. */
    static Stand lies(String json) throws IOException {
        Stand s = new Stand();
        Matcher m = P_VERSION.matcher(json);
        if (!m.find() || !VERSION.matcher(m.group(1)).matches()) throw new IOException("stand.json: Version fehlt");
        s.version = m.group(1);
        m = P_HUELLE.matcher(json);
        if (m.find()) s.huelle = Integer.parseInt(m.group(1));
        m = P_DATEI.matcher(json);
        while (m.find()) {
            String p = m.group(1);
            if (!PFAD.matcher(p).matches() || p.contains("..") || p.length() > 200) throw new IOException("stand.json: unerlaubter Pfad");
            s.dateien.put(p, m.group(2));
            if (s.dateien.size() > MAX_ANZAHL) throw new IOException("stand.json: zu viele Dateien");
        }
        if (!s.dateien.containsKey("index.html")) throw new IOException("stand.json: index.html fehlt");
        return s;
    }

    static File aktiv(File basis) { return new File(basis, "aktiv"); }
    private static File neu(File basis) { return new File(basis, "neu"); }

    /** Version des geladenen Stands in {@code ordner} – oder null, wenn keiner (vollständig) da ist. */
    static String versionIn(File ordner) {
        try {
            File f = new File(ordner, "stand.json");
            if (!f.isFile() || f.length() > MAX_STAND) return null;
            Stand s = lies(new String(alles(new FileInputStream(f), MAX_STAND), StandardCharsets.UTF_8));
            return new File(ordner, "index.html").isFile() ? s.version : null;
        } catch (IOException kaputt) { return null; }
    }

    /**
     * Beim Start: einen fertig geladenen Stand übernehmen und sagen, ob (und welcher) geladene Stand gilt.
     * Ist die eingepackte Fassung gleich neu oder neuer (z. B. nach einer neuen App-Datei), wird Geladenes verworfen.
     * @return Version des gültigen geladenen Stands oder null (dann gilt die eingepackte Fassung)
     */
    static String starte(File basis, String eingebaut) {
        File n = neu(basis), a = aktiv(basis);
        if (new File(n, "fertig").isFile() && versionIn(n) != null) {
            weg(a);
            if (n.renameTo(a)) new File(a, "fertig").delete();
        }
        String v = versionIn(a);
        if (v != null && vergleich(v, eingebaut) > 0) return v;
        weg(a);
        return null;
    }

    /** Fertig geladene Version, die auf den Neustart wartet – oder null. */
    static String wartet(File basis) { return new File(neu(basis), "fertig").isFile() ? versionIn(neu(basis)) : null; }

    /**
     * Schaut bei der Quelle nach und lädt einen neueren Stand nach neu/. Verändert den Stand in Benutzung nicht.
     * @param quelle Adresse des Ordners mit stand.json, mit „/“ am Ende
     * @param eingebaut Version der eingepackten Web-App
     */
    static Ergebnis lade(File basis, String quelle, String eingebaut, Paket paket, Holer holer) throws IOException {
        Ergebnis e = new Ergebnis();
        String json = new String(alles(holer.hole(quelle + "stand.json"), MAX_STAND), StandardCharsets.UTF_8);
        Stand ziel = lies(json);
        e.huelle = ziel.huelle;
        String jetzt = eingebaut, a = versionIn(aktiv(basis)), w = wartet(basis);
        if (a != null && vergleich(a, jetzt) > 0) jetzt = a;
        if (w != null && vergleich(w, jetzt) > 0) { jetzt = w; e.bereit = w; }
        if (vergleich(ziel.version, jetzt) <= 0) return e;

        File n = neu(basis);
        weg(n);
        if (!n.mkdirs()) throw new IOException("Ordner nicht anlegbar");
        try {
            String wurzel = n.getCanonicalPath() + File.separator;
            boolean ausAktiv = a != null;
            for (Map.Entry<String, String> d : ziel.dateien.entrySet()) {
                File f = new File(n, d.getKey());
                if (!f.getCanonicalPath().startsWith(wurzel)) throw new IOException("Pfad außerhalb");
                File eltern = f.getParentFile();
                if (eltern != null && !eltern.isDirectory() && !eltern.mkdirs()) throw new IOException("Ordner nicht anlegbar");
                boolean da = false;
                if (ausAktiv) { File alt = new File(aktiv(basis), d.getKey()); if (alt.isFile()) da = kopiere(new FileInputStream(alt), f, d.getValue()); }
                if (!da) { try { da = kopiere(paket.oeffne(d.getKey()), f, d.getValue()); } catch (IOException nichtDrin) { da = false; } }
                if (!da && !kopiere(holer.hole(quelle + d.getKey()), f, d.getValue())) throw new IOException("Prüfsumme falsch: " + d.getKey());
            }
            schreibe(new File(n, "stand.json"), json.getBytes(StandardCharsets.UTF_8));
            schreibe(new File(n, "fertig"), new byte[0]);
            e.bereit = ziel.version;
            return e;
        } catch (IOException | RuntimeException fehler) {
            weg(n);
            throw fehler;
        }
    }

    /** Kopiert und prüft dabei die Prüfsumme. Stimmt sie nicht, wird die Zieldatei gelöscht und false gemeldet. */
    private static boolean kopiere(InputStream in, File ziel, String sha) throws IOException {
        MessageDigest md;
        try { md = MessageDigest.getInstance("SHA-256"); } catch (Exception nie) { throw new IOException(nie); }
        long summe = 0;
        try (InputStream ein = in; OutputStream aus = new FileOutputStream(ziel)) {
            byte[] puffer = new byte[16384];
            for (int k; (k = ein.read(puffer)) > 0; ) {
                summe += k;
                if (summe > MAX_DATEI) break;
                md.update(puffer, 0, k); aus.write(puffer, 0, k);
            }
        }
        StringBuilder hex = new StringBuilder();
        for (byte b : md.digest()) hex.append(String.format("%02x", b));
        if (summe <= MAX_DATEI && hex.toString().equals(sha)) return true;
        ziel.delete();
        return false;
    }

    private static byte[] alles(InputStream in, int max) throws IOException {
        try (InputStream ein = in) {
            ByteArrayOutputStream aus = new ByteArrayOutputStream();
            byte[] puffer = new byte[8192];
            for (int k; (k = ein.read(puffer)) > 0; ) {
                if (aus.size() + k > max) throw new IOException("zu groß");
                aus.write(puffer, 0, k);
            }
            return aus.toByteArray();
        }
    }
    private static void schreibe(File f, byte[] inhalt) throws IOException {
        try (OutputStream aus = new FileOutputStream(f)) { aus.write(inhalt); }
    }
    static void weg(File f) {
        if (f == null || !f.exists()) return;
        File[] kinder = f.listFiles();
        if (kinder != null) for (File k : kinder) weg(k);
        f.delete();
    }

    /** Holt über HTTPS, ohne Weiterleitungen zu folgen. */
    static final Holer NETZ = adresse -> {
        if (!adresse.startsWith("https://")) throw new IOException("nur https");
        HttpURLConnection c = (HttpURLConnection) new URL(adresse).openConnection();
        c.setConnectTimeout(8000); c.setReadTimeout(15000);
        c.setInstanceFollowRedirects(false); c.setUseCaches(false);
        if (c.getResponseCode() != 200) { c.disconnect(); throw new IOException("Antwort " + c.getResponseCode()); }
        return c.getInputStream();
    };
}
