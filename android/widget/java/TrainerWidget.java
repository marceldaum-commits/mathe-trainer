package com.mathenachhilfe_online.trainer;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.widget.RemoteViews;

import java.util.Calendar;

/**
 * Widget für den Startbildschirm: Formel des Tages und drei Knöpfe, die direkt in die App springen.
 * Das Widget liest keine Daten und sendet nichts – es zeigt nur festen Text aus der App-Datei.
 */
public class TrainerWidget extends AppWidgetProvider {
    private static final String BASIS = "https://trainer.mathenachhilfe-online.com/";

    private static PendingIntent sprung(Context c, String ziel, int nr) {
        Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(BASIS + ziel), c, LauncherActivity.class);
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        return PendingIntent.getActivity(c, nr, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    @Override
    public void onUpdate(Context c, AppWidgetManager m, int[] ids) {
        String[] formeln = c.getResources().getStringArray(R.array.widget_formeln);
        String heute = formeln[Calendar.getInstance().get(Calendar.DAY_OF_YEAR) % formeln.length];
        for (int id : ids) {
            RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.widget_trainer);
            v.setTextViewText(R.id.widget_formel, heute);
            v.setOnClickPendingIntent(R.id.widget_kopf, sprung(c, "", 0));
            v.setOnClickPendingIntent(R.id.widget_formel, sprung(c, "#/formeln", 1));
            v.setOnClickPendingIntent(R.id.widget_tag, sprung(c, "#/tag", 2));
            v.setOnClickPendingIntent(R.id.widget_abenteuer, sprung(c, "#/abenteuer", 3));
            v.setOnClickPendingIntent(R.id.widget_wiederholen, sprung(c, "#/wiederholen", 4));
            m.updateAppWidget(id, v);
        }
    }
}
