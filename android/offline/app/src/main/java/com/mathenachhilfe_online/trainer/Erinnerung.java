package com.mathenachhilfe_online.trainer;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;

/**
 * Tägliche Erinnerung – ganz im Gerät, ohne Server und ohne Internet.
 * Die App merkt sich nur: an/aus, die Uhrzeit und den Tag, an dem zuletzt geübt wurde.
 * Höchstens eine Mitteilung am Tag; wer heute schon geübt hat, bekommt keine.
 */
public class Erinnerung extends BroadcastReceiver {
    static final String SPEICHER = "erinnerung", KANAL = "erinnerung", WECKER = "com.mathenachhilfe_online.trainer.ERINNERN";
    static final String VORGABE = "18:00";

    static SharedPreferences sp(Context c) { return c.getSharedPreferences(SPEICHER, Context.MODE_PRIVATE); }
    static boolean an(Context c) { return sp(c).getBoolean("an", false); }
    static String zeit(Context c) { String z = sp(c).getString("zeit", VORGABE); return zeitOk(z) ? z : VORGABE; }
    static boolean zeitOk(String z) { return z != null && z.matches("([01]\\d|2[0-3]):[0-5]\\d"); }
    static String heute() { return new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date()); }
    static void geuebt(Context c) { sp(c).edit().putString("geuebt", heute()).apply(); }

    /** Dürfen wir Mitteilungen zeigen? (Ab Android 13 fragt das System einmal nach.) */
    static boolean erlaubt(Context c) {
        NotificationManager m = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        return m != null && m.areNotificationsEnabled();
    }

    static void setze(Context c, boolean an, String zeit) {
        sp(c).edit().putBoolean("an", an).putString("zeit", zeitOk(zeit) ? zeit : zeit(c)).apply();
        plane(c);
    }

    private static PendingIntent wecker(Context c) {
        Intent i = new Intent(c, Erinnerung.class).setAction(WECKER);
        return PendingIntent.getBroadcast(c, 1, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    /** Nächster Zeitpunkt zur gewählten Uhrzeit (Uhrzeit des Geräts): heute, sonst morgen. */
    static long naechster(String zeit, long jetzt) {
        Calendar k = Calendar.getInstance();
        k.setTimeInMillis(jetzt);
        k.set(Calendar.HOUR_OF_DAY, Integer.parseInt(zeit.substring(0, 2)));
        k.set(Calendar.MINUTE, Integer.parseInt(zeit.substring(3, 5)));
        k.set(Calendar.SECOND, 0); k.set(Calendar.MILLISECOND, 0);
        if (k.getTimeInMillis() <= jetzt + 30_000) k.add(Calendar.DAY_OF_YEAR, 1);
        return k.getTimeInMillis();
    }

    /** Wecker stellen oder löschen. Ungefähre Uhrzeit genügt – dafür braucht die App keine Sonder-Erlaubnis. */
    static void plane(Context c) {
        AlarmManager a = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        if (a == null) return;
        PendingIntent p = wecker(c);
        a.cancel(p);
        if (!an(c)) return;
        a.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, naechster(zeit(c), System.currentTimeMillis()), p);
    }

    @Override
    public void onReceive(Context c, Intent i) {
        if (i != null && WECKER.equals(i.getAction())) zeige(c);
        plane(c);   // nach Wecker, Neustart, App-Update, Zeit- oder Zeitzonen-Wechsel: neu stellen
    }

    static void zeige(Context c) {
        if (!an(c) || !erlaubt(c) || heute().equals(sp(c).getString("geuebt", ""))) return;
        NotificationManager m = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        if (m == null) return;
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationChannel k = new NotificationChannel(KANAL, c.getString(R.string.erinnerung_kanal), NotificationManager.IMPORTANCE_DEFAULT);
            k.setDescription(c.getString(R.string.erinnerung_kanal_text));
            m.createNotificationChannel(k);
        }
        Intent auf = new Intent(c, LauncherActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent tipp = PendingIntent.getActivity(c, 2, auf, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(c, KANAL) : new Notification.Builder(c);
        b.setSmallIcon(R.drawable.ic_erinnerung).setColor(0xFFFF7418)
            .setContentTitle(c.getString(R.string.erinnerung_titel)).setContentText(c.getString(R.string.erinnerung_text))
            .setContentIntent(tipp).setAutoCancel(true);
        m.notify(1, b.build());
    }
}
