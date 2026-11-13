package com.mathenachhilfe_online.trainer;

import android.content.Context;

/** Versionsname der installierten App (gleich der Version der eingepackten Web-App). */
final class BuildConfigInfo {
    private BuildConfigInfo() {}
    static String version(Context c) {
        try { return c.getPackageManager().getPackageInfo(c.getPackageName(), 0).versionName; }
        catch (Exception e) { return ""; }
    }
}
