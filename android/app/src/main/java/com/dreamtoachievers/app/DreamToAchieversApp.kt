package com.dreamtoachievers.app

import android.app.Application
import com.dreamtoachievers.app.core.data.DataStoreManager
import com.google.firebase.FirebaseApp

class DreamToAchieversApp : Application() {

    lateinit var dataStoreManager: DataStoreManager
        private set

    override fun onCreate() {
        super.onCreate()
        instance = this

        // Initialize Firebase
        FirebaseApp.initializeApp(this)

        // Initialize DataStore
        dataStoreManager = DataStoreManager(this)
    }

    companion object {
        lateinit var instance: DreamToAchieversApp
            private set
    }
}
