package com.mathenachhilfe_online.trainer;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.view.View;
import android.widget.RemoteViews;

import java.util.Calendar;

/**
 * Widget für den Startbildschirm: Merksatz des Tages (passend zur Klassenstufe), der nächste Lernschritt
 * und drei Knöpfe, die direkt in die App springen.
 * Was es anzeigt, hat die App vorher selbst abgelegt (Klassenstufe, nächster Schritt, Lernserie) – es bleibt im Gerät.
 * Das Widget sendet nichts und fragt nichts im Netz ab.
 */
public class TrainerWidget extends AppWidgetProvider {
    private static final String BASIS = "https://trainer.mathenachhilfe-online.com/";
    private static final String ABLAGE = "widget";

    private static PendingIntent sprung(Context c, String ziel, int nr) {
        Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(BASIS + ziel), c, LauncherActivity.class);
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        return PendingIntent.getActivity(c, nr, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    /** Nur Adressen innerhalb der App: „#/…“ aus Buchstaben, Ziffern, Schräg- und Bindestrich. */
    static boolean zielOk(String z) { return z != null && z.length() <= 60 && z.matches("#/[A-Za-z0-9/_-]*"); }
    static boolean jgOk(String j) { return j != null && j.matches("5|6|7|8|9|10|os"); }
    private static String kurz(String s, int max) {
        if (s == null) return "";
        String t = s.replaceAll("[\\p{Cntrl}<>]", " ").trim();
        return t.length() > max ? t.substring(0, max - 1) + "…" : t;
    }

    /** Die App legt ab, was das Widget zeigen soll. Danach wird das Widget neu gezeichnet. */
    static void merke(Context c, String jg, String weiterTitel, String weiterZiel, int serie) {
        SharedPreferences.Editor e = c.getSharedPreferences(ABLAGE, Context.MODE_PRIVATE).edit();
        e.putString("jg", jgOk(jg) ? jg : "os");
        e.putString("titel", kurz(weiterTitel, 40));
        e.putString("ziel", zielOk(weiterZiel) ? weiterZiel : "");
        e.putInt("serie", Math.max(0, Math.min(9999, serie)));
        e.apply();
        AppWidgetManager m = AppWidgetManager.getInstance(c);
        int[] ids = m.getAppWidgetIds(new ComponentName(c, TrainerWidget.class));
        if (ids != null && ids.length > 0) zeichne(c, m, ids);
    }

    @Override
    public void onUpdate(Context c, AppWidgetManager m, int[] ids) { zeichne(c, m, ids); }

    private static void zeichne(Context c, AppWidgetManager m, int[] ids) {
        SharedPreferences p = c.getSharedPreferences(ABLAGE, Context.MODE_PRIVATE);
        String jg = p.getString("jg", "os"), titel = p.getString("titel", ""), ziel = p.getString("ziel", "");
        int serie = p.getInt("serie", 0);
        boolean ober = "os".equals(jg), jung = "5".equals(jg) || "6".equals(jg);
        String[] saetze = c.getResources().getStringArray(ober ? R.array.widget_formeln : jung ? R.array.widget_merk_jung : R.array.widget_merk_mittel);
        String heute = saetze[Calendar.getInstance().get(Calendar.DAY_OF_YEAR) % saetze.length];
        for (int id : ids) {
            RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.widget_trainer);
            v.setTextViewText(R.id.widget_kicker, serie > 1 ? serie + " TAGE IN FOLGE" : c.getString(ober ? R.string.widget_kicker : R.string.widget_kicker_merk));
            v.setTextViewText(R.id.widget_formel, heute);
            boolean weiter = !titel.isEmpty() && zielOk(ziel);
            v.setViewVisibility(R.id.widget_weiter, weiter ? View.VISIBLE : View.GONE);
            if (weiter) { v.setTextViewText(R.id.widget_weiter, c.getString(R.string.widget_weiter) + " " + titel); v.setOnClickPendingIntent(R.id.widget_weiter, sprung(c, ziel, 5)); }
            v.setTextViewText(R.id.widget_tag, c.getString(ober ? R.string.widget_tag : R.string.widget_lernen));
            v.setTextViewText(R.id.widget_abenteuer, c.getString(ober ? R.string.widget_abenteuer : R.string.widget_karten));
            v.setOnClickPendingIntent(R.id.widget_kopf, sprung(c, "", 0));
            v.setOnClickPendingIntent(R.id.widget_formel, sprung(c, "#/formeln", 1));
            v.setOnClickPendingIntent(R.id.widget_tag, sprung(c, ober ? "#/tag" : "#/lernen", 2));
            v.setOnClickPendingIntent(R.id.widget_abenteuer, sprung(c, ober ? "#/abenteuer" : "#/karten", 3));
            v.setOnClickPendingIntent(R.id.widget_wiederholen, sprung(c, "#/wiederholen", 4));
            m.updateAppWidget(id, v);
        }
    }
}
