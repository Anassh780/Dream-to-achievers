package com.dreamtoachievers.app.core.designsystem.util

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.widget.Toast

fun Context.openExternalIntent(intent: Intent) {
    try {
        startActivity(intent)
    } catch (_: ActivityNotFoundException) {
        Toast.makeText(this, "No compatible app is installed to open this action.", Toast.LENGTH_LONG).show()
    } catch (_: SecurityException) {
        Toast.makeText(this, "This action could not be opened on your device.", Toast.LENGTH_LONG).show()
    }
}
