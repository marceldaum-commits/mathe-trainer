package com.mathenachhilfe_online.trainer;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.security.MessageDigest;
import java.util.HashMap;
import java.util.Map;

/** Prüft die Selbst-Aktualisierung am Rechner (ohne Android): bash tests/android/pruefen.sh */
public final class UpdateTest {
    static int n = 0;
    static void pruefe(boolean ok, String was) { n++; if (!ok) throw new AssertionError(was); }
    static String sha(String s) throws Exception {
        StringBuilder h = new StringBuilder();
        for (byte b : MessageDigest.getInstance("SHA-256").digest(s.getBytes(StandardCharsets.UTF_8))) h.append(String.format("%02x", b));
        return h.toString();
    }
    static String stand(String version, int huelle, Map<String, String> dateien) throws Exception {
        StringBuilder s = new StringBuilder("{\n \"version\": \"" + version + "\",\n \"huelle\": " + huelle + ",\n \"dateien\": {");
        boolean erst = true;
        for (Map.Entry<String, String> d : dateien.entrySet()) { s.append(erst ? "\n" : ",\n").append("  \"").append(d.getKey()).append("\": \"").append(sha(d.getValue())).append('"'); erst = false; }
        return s.append("\n }\n}\n").toString();
    }
    static String lies(File f) throws IOException { return new String(Files.readAllBytes(f.toPath()), StandardCharsets.UTF_8); }

    public static void main(String[] a) throws Exception {
        File basis = Files.createTempDirectory("mt-update").toFile();
        Map<String, String> paket = new HashMap<>();
        paket.put("index.html", "<alt>"); paket.put("js/app.js", "alt()"); paket.put("css/app.css", "gleich{}");
        Update.Paket p = pfad -> { String s = paket.get(pfad); if (s == null) throw new IOException("fehlt"); return new ByteArrayInputStream(s.getBytes(StandardCharsets.UTF_8)); };
        Map<String, String> netz = new HashMap<>();
        int[] abrufe = { 0 };
        Update.Holer h = adr -> { abrufe[0]++; String s = netz.get(adr); if (s == null) throw new IOException("404 " + adr); return new ByteArrayInputStream(s.getBytes(StandardCharsets.UTF_8)); };
        String q = "https://quelle/app/";

        pruefe(Update.vergleich("0.21.0", "0.9.9") > 0 && Update.vergleich("1.0.0", "0.99.99") > 0 && Update.vergleich("0.21.0", "0.21.0") == 0 && Update.vergleich("quatsch", "0.0.1") < 0, "Versionsvergleich");
        pruefe(Update.starte(basis, "0.21.0") == null, "ohne Geladenes gilt die eingepackte Fassung");

        // 1. gleiche Version: nichts laden
        Map<String, String> neu = new HashMap<>(paket);
        netz.put(q + "stand.json", stand("0.21.0", 1, neu));
        Update.Ergebnis e = Update.lade(basis, q, "0.21.0", p, h);
        pruefe(e.bereit == null && e.huelle == 1 && abrufe[0] == 1, "gleiche Version lädt nichts");

        // 2. neuere Version: nur Geändertes kommt aus dem Netz
        neu.put("index.html", "<neu>"); neu.put("js/neu.js", "neu()");
        netz.put(q + "stand.json", stand("0.22.0", 2, neu)); netz.put(q + "index.html", "<neu>"); netz.put(q + "js/neu.js", "neu()");
        abrufe[0] = 0; e = Update.lade(basis, q, "0.21.0", p, h);
        pruefe("0.22.0".equals(e.bereit) && e.huelle == 2, "neue Version geladen");
        pruefe(abrufe[0] == 3, "nur stand.json und zwei geänderte Dateien geholt, war " + abrufe[0]);
        pruefe(!Update.aktiv(basis).exists(), "vor dem Neustart ändert sich nichts");
        pruefe("0.22.0".equals(Update.wartet(basis)), "wartet auf den Neustart");
        abrufe[0] = 0; e = Update.lade(basis, q, "0.21.0", p, h);
        pruefe("0.22.0".equals(e.bereit) && abrufe[0] == 1, "zweites Nachsehen lädt nicht doppelt");
        pruefe("0.22.0".equals(Update.starte(basis, "0.21.0")), "nach dem Neustart gilt der geladene Stand");
        pruefe(lies(new File(Update.aktiv(basis), "index.html")).equals("<neu>") && lies(new File(Update.aktiv(basis), "css/app.css")).equals("gleich{}") && lies(new File(Update.aktiv(basis), "js/neu.js")).equals("neu()"), "Dateien vollständig");
        pruefe(Update.wartet(basis) == null, "nichts wartet mehr");

        // 3. nächste Version: Unverändertes kommt aus dem geladenen Stand
        neu.put("js/app.js", "neuer()");
        netz.put(q + "stand.json", stand("0.23.0", 2, neu)); netz.put(q + "js/app.js", "neuer()");
        abrufe[0] = 0; e = Update.lade(basis, q, "0.21.0", p, h);
        pruefe("0.23.0".equals(e.bereit) && abrufe[0] == 2, "nur eine Datei neu, war " + abrufe[0]);
        pruefe("0.23.0".equals(Update.starte(basis, "0.21.0")), "0.23.0 gilt");

        // 4. falsche Prüfsumme: alles bleibt beim Alten
        neu.put("js/app.js", "echt()");
        netz.put(q + "stand.json", stand("0.24.0", 2, neu)); netz.put(q + "js/app.js", "untergeschoben()");
        boolean geworfen = false;
        try { Update.lade(basis, q, "0.21.0", p, h); } catch (IOException erwartet) { geworfen = true; }
        pruefe(geworfen && Update.wartet(basis) == null && "0.23.0".equals(Update.starte(basis, "0.21.0")), "falsche Prüfsumme wird verworfen");

        // 5. unerlaubte Pfade und kaputte Listen
        for (String boese : new String[] { "../x.js", "/etc/passwd", "js/../../x", "a b.js", "js//x.js", ".versteckt" }) {
            geworfen = false;
            try { Update.lies("{\"version\":\"9.0.0\",\"dateien\":{\"index.html\":\"" + sha("x") + "\",\"" + boese + "\":\"" + sha("x") + "\"}}"); } catch (IOException erwartet) { geworfen = true; }
            pruefe(geworfen, "Pfad abgelehnt: " + boese);
        }
        geworfen = false; try { Update.lies("{\"version\":\"abc\"}"); } catch (IOException erwartet) { geworfen = true; } pruefe(geworfen, "Version muss stimmen");
        geworfen = false; try { Update.lies("{\"version\":\"1.0.0\",\"dateien\":{}}"); } catch (IOException erwartet) { geworfen = true; } pruefe(geworfen, "index.html muss dabei sein");

        // 6. ältere Version bei der Quelle: kein Rückschritt
        netz.put(q + "stand.json", stand("0.20.0", 1, paket));
        e = Update.lade(basis, q, "0.21.0", p, h);
        pruefe(e.bereit == null && "0.23.0".equals(Update.starte(basis, "0.21.0")), "kein Rückschritt");

        // 7. neue App-Datei mit neuerer eingepackter Fassung: Geladenes wird verworfen
        pruefe(Update.starte(basis, "0.23.0") == null && !Update.aktiv(basis).exists(), "eingepackte Fassung gewinnt bei Gleichstand");

        // 8. Netz weg: Fehler, nichts kaputt
        netz.clear(); geworfen = false;
        try { Update.lade(basis, q, "0.21.0", p, h); } catch (IOException erwartet) { geworfen = true; }
        pruefe(geworfen && Update.starte(basis, "0.21.0") == null, "ohne Netz bleibt alles beim Alten");

        // 9. die echte stand.json der Web-App lässt sich lesen
        if (a.length > 0) { Update.Stand s = Update.lies(lies(new File(a[0]))); pruefe(s.dateien.size() > 50 && s.dateien.containsKey("js/app.js") && s.huelle >= 1, "echte stand.json: " + s.dateien.size() + " Dateien"); }
        Update.weg(basis);
        System.out.println("UpdateTest: " + n + " Prüfungen bestanden");
    }
}
