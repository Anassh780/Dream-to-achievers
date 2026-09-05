package com.dreamtoachievers.app

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.lifecycle.lifecycleScope
import androidx.navigation.compose.rememberNavController
import com.dreamtoachievers.app.core.data.*
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme
import com.dreamtoachievers.app.core.navigation.DtaNavHost
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    private lateinit var dataStoreManager: DataStoreManager
    private lateinit var productRepository: ProductRepository
    private lateinit var categoryRepository: CategoryRepository
    private lateinit var cartRepository: CartRepository
    private lateinit var orderRepository: OrderRepository
    private lateinit var userRepository: UserRepository
    private lateinit var referralRepository: ReferralRepository
    private lateinit var notificationRepository: NotificationRepository
    private lateinit var resellerRepository: ResellerRepository
    private lateinit var adminRepository: AdminRepository

    override fun onCreate(savedInstanceState: Bundle?) {
        // Install Android modern splash screen
        installSplashScreen()
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // Initialize dependencies
        dataStoreManager = (application as DreamToAchieversApp).dataStoreManager
        productRepository = ProductRepository()
        categoryRepository = CategoryRepository()
        cartRepository = CartRepository.instance
        orderRepository = OrderRepository()
        userRepository = UserRepository(dataStoreManager = dataStoreManager)
        referralRepository = ReferralRepository(dataStoreManager = dataStoreManager)
        notificationRepository = NotificationRepository()
        resellerRepository = ResellerRepository(dataStoreManager = dataStoreManager)
        adminRepository = AdminRepository(resellerRepository = resellerRepository)

        // Handle referral deep link if app was opened via link
        handleIncomingIntent(intent)

        setContent {
            DtaTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = DtaTheme.colors.background
                ) {
                    val navController = rememberNavController()

                    DtaNavHost(
                        navController = navController,
                        productRepository = productRepository,
                        categoryRepository = categoryRepository,
                        cartRepository = cartRepository,
                        orderRepository = orderRepository,
                        userRepository = userRepository,
                        referralRepository = referralRepository,
                        notificationRepository = notificationRepository,
                        resellerRepository = resellerRepository,
                        adminRepository = adminRepository,
                        dataStoreManager = dataStoreManager
                    )
                }
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleIncomingIntent(intent)
    }

    private fun handleIncomingIntent(intent: Intent?) {
        val data: Uri? = intent?.data
        if (data != null) {
            // Check for referral parameters: ?ref=CODE or ?r=CODE or ?referral=CODE
            val refCode = data.getQueryParameter("ref")
                ?: data.getQueryParameter("r")
                ?: data.getQueryParameter("referral")

            if (!refCode.isNullOrBlank()) {
                lifecycleScope.launch {
                    referralRepository.saveIncomingReferralCode(refCode)
                }
            }
        }
    }
}
