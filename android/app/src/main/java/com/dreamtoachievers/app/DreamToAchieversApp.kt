package com.dreamtoachievers.app

import android.app.Application
import com.dreamtoachievers.app.core.data.*
import com.google.firebase.FirebaseApp

class DreamToAchieversApp : Application() {

    lateinit var dataStoreManager: DataStoreManager
        private set

    // Keep the same repositories when the Activity is recreated (for example on rotation).
    val productRepository by lazy { ProductRepository() }
    val categoryRepository by lazy { CategoryRepository() }
    val cartRepository by lazy { CartRepository.instance }
    val orderRepository by lazy { OrderRepository() }
    val userRepository by lazy { UserRepository(dataStoreManager = dataStoreManager) }
    val referralRepository by lazy { ReferralRepository(dataStoreManager = dataStoreManager) }
    val notificationRepository by lazy { NotificationRepository() }
    val storefrontRepository by lazy { StorefrontRepository() }
    val resellerRepository by lazy { ResellerRepository(dataStoreManager = dataStoreManager) }
    val adminRepository by lazy { AdminRepository(resellerRepository = resellerRepository) }

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

