package com.dreamtoachievers.app.core.navigation

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.*
import androidx.navigation.navArgument
import com.dreamtoachievers.app.core.data.*
import com.dreamtoachievers.app.core.designsystem.components.*
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme
import com.dreamtoachievers.app.core.model.UserRole
import com.dreamtoachievers.app.feature.account.*
import com.dreamtoachievers.app.feature.admin.account.*
import com.dreamtoachievers.app.feature.admin.audit.*
import com.dreamtoachievers.app.feature.admin.categories.*
import com.dreamtoachievers.app.feature.admin.hub.*
import com.dreamtoachievers.app.feature.admin.orders.*
import com.dreamtoachievers.app.feature.admin.products.*
import com.dreamtoachievers.app.feature.admin.rewards.*
import com.dreamtoachievers.app.feature.admin.users.*
import com.dreamtoachievers.app.feature.admin.withdrawals.*
import com.dreamtoachievers.app.feature.auth.*
import com.dreamtoachievers.app.feature.cart.*
import com.dreamtoachievers.app.feature.checkout.*
import com.dreamtoachievers.app.feature.growth.*
import com.dreamtoachievers.app.feature.home.*
import com.dreamtoachievers.app.feature.market.*
import com.dreamtoachievers.app.feature.orders.*
import com.dreamtoachievers.app.feature.product.*
import com.dreamtoachievers.app.feature.tracking.*
import com.dreamtoachievers.app.feature.reseller.account.*
import com.dreamtoachievers.app.feature.reseller.catalog.*
import com.dreamtoachievers.app.feature.reseller.dashboard.*
import com.dreamtoachievers.app.feature.reseller.growth.*
import com.dreamtoachievers.app.feature.reseller.orders.*
import com.dreamtoachievers.app.feature.reseller.referrals.*
import com.dreamtoachievers.app.feature.reseller.sale.*
import com.dreamtoachievers.app.feature.reseller.team.*
import com.dreamtoachievers.app.feature.reseller.tracking.*
import com.dreamtoachievers.app.feature.reseller.wallet.*
import com.dreamtoachievers.app.feature.splash.SplashScreen

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DtaNavHost(
    navController: NavHostController,
    productRepository: ProductRepository,
    categoryRepository: CategoryRepository,
    cartRepository: CartRepository,
    orderRepository: OrderRepository,
    userRepository: UserRepository,
    referralRepository: ReferralRepository,
    notificationRepository: NotificationRepository,
    resellerRepository: ResellerRepository,
    adminRepository: AdminRepository,
    dataStoreManager: DataStoreManager,
    modifier: Modifier = Modifier
) {
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route ?: DtaDestinations.SPLASH

    // Active Role State (Defaults to RESELLER or CUSTOMER, can be switched on the fly)
    var activeRole by remember { mutableStateOf(UserRole.CUSTOMER) }
    var showRoleSwitcherSheet by remember { mutableStateOf(false) }

    val customerTopLevelRoutes = listOf(
        DtaDestinations.HOME,
        DtaDestinations.MARKET,
        DtaDestinations.ORDERS,
        DtaDestinations.GROWTH,
        DtaDestinations.ACCOUNT
    )

    val resellerTopLevelRoutes = listOf(
        DtaDestinations.RESELLER_DASHBOARD,
        DtaDestinations.PARTNER_CATALOG,
        DtaDestinations.RESELLER_ORDERS,
        DtaDestinations.RESELLER_GROWTH,
        DtaDestinations.RESELLER_ACCOUNT
    )

    val adminTopLevelRoutes = listOf(
        DtaDestinations.ADMIN_HUB,
        DtaDestinations.ADMIN_ORDERS,
        DtaDestinations.ADMIN_WITHDRAWALS,
        DtaDestinations.ADMIN_PRODUCTS,
        DtaDestinations.ADMIN_ACCOUNT
    )

    val isCustomerNav = activeRole == UserRole.CUSTOMER && currentRoute in customerTopLevelRoutes
    val isResellerNav = activeRole == UserRole.RESELLER && currentRoute.substringBefore("?") in resellerTopLevelRoutes
    val isAdminNav = (activeRole == UserRole.ADMIN || activeRole == UserRole.SUPERADMIN) && currentRoute.substringBefore("?") in adminTopLevelRoutes

    // ViewModels
    val homeViewModel = remember { HomeViewModel(productRepository, categoryRepository, cartRepository, userRepository, dataStoreManager) }
    val marketViewModel = remember { MarketViewModel(productRepository, categoryRepository, cartRepository, dataStoreManager) }
    val cartViewModel = remember { CartViewModel(cartRepository) }
    val ordersViewModel = remember { OrdersViewModel(orderRepository, dataStoreManager) }
    val customerRewardsViewModel = remember { CustomerRewardsViewModel(userRepository, referralRepository, dataStoreManager) }
    val accountViewModel = remember { AccountViewModel(userRepository, orderRepository, notificationRepository, dataStoreManager) }
    val authViewModel = remember { AuthViewModel(userRepository, dataStoreManager) }

    val resellerDashboardViewModel = remember { ResellerDashboardViewModel(resellerRepository, dataStoreManager) }
    val partnerCatalogViewModel = remember { PartnerCatalogViewModel(resellerRepository) }
    val resellerWalletViewModel = remember { ResellerWalletViewModel(resellerRepository) }
    val resellerGrowthViewModel = remember { ResellerGrowthViewModel(resellerRepository) }

    val adminHubViewModel = remember { AdminHubViewModel(adminRepository) }
    val adminOrderViewModel = remember { AdminOrderVerificationViewModel(adminRepository) }
    val adminWithdrawalViewModel = remember { AdminWithdrawalApprovalViewModel(adminRepository) }
    val adminUserViewModel = remember { AdminUserManagementViewModel(adminRepository) }

    // Role Switcher Modal Bottom Sheet
    if (showRoleSwitcherSheet) {
        ModalBottomSheet(
            onDismissRequest = { showRoleSwitcherSheet = false },
            containerColor = DtaTheme.colors.surface
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Text(
                    text = "Select Experience Mode",
                    style = DtaTheme.typography.TitleLarge.copy(fontWeight = FontWeight.Bold)
                )
                Text(
                    text = "Switch between customer shopping, partner wholesale, and superadmin controls in real-time.",
                    style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.inkSecondary)
                )

                // 1. Customer Option
                RoleOptionCard(
                    title = "Customer Experience",
                    subtitle = "Retail shopping, cart, checkout & delivery tracking",
                    icon = Icons.Default.ShoppingCart,
                    isSelected = activeRole == UserRole.CUSTOMER,
                    onClick = {
                        activeRole = UserRole.CUSTOMER
                        showRoleSwitcherSheet = false
                        navController.navigate(DtaDestinations.HOME) {
                            popUpTo(0) { inclusive = true }
                        }
                    }
                )

                // 2. Reseller Option
                RoleOptionCard(
                    title = "Reseller / Partner Console",
                    subtitle = "Wholesale catalog, record client sales, wallet & ranks",
                    icon = Icons.Default.Storefront,
                    isSelected = activeRole == UserRole.RESELLER,
                    onClick = {
                        activeRole = UserRole.RESELLER
                        showRoleSwitcherSheet = false
                        navController.navigate(DtaDestinations.RESELLER_DASHBOARD) {
                            popUpTo(0) { inclusive = true }
                        }
                    }
                )

                // 3. Admin Option
                RoleOptionCard(
                    title = "Admin / SuperAdmin Console",
                    subtitle = "Verify payment slips, dispatch couriers & disburse payouts",
                    icon = Icons.Default.AdminPanelSettings,
                    isSelected = activeRole == UserRole.SUPERADMIN || activeRole == UserRole.ADMIN,
                    onClick = {
                        activeRole = UserRole.SUPERADMIN
                        showRoleSwitcherSheet = false
                        navController.navigate(DtaDestinations.ADMIN_HUB) {
                            popUpTo(0) { inclusive = true }
                        }
                    }
                )

                Spacer(modifier = Modifier.height(10.dp))
            }
        }
    }

    Scaffold(
        bottomBar = {
            if (isCustomerNav) {
                DtaBottomNavigation(
                    currentRoute = currentRoute,
                    onNavigate = { destination ->
                        navController.navigate(destination.route) {
                            popUpTo(DtaDestinations.HOME) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                )
            } else if (isResellerNav) {
                ResellerBottomNavigation(
                    currentRoute = currentRoute,
                    onNavigate = { destination ->
                        navController.navigate(destination.route) {
                            popUpTo(DtaDestinations.RESELLER_DASHBOARD) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                )
            } else if (isAdminNav) {
                AdminBottomNavigation(
                    currentRoute = currentRoute,
                    onNavigate = { destination ->
                        navController.navigate(destination.route) {
                            popUpTo(DtaDestinations.ADMIN_HUB) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                )
            }
        },
        containerColor = DtaTheme.colors.background,
        modifier = modifier.fillMaxSize()
    ) { paddingValues ->
        NavHost(
            navController = navController,
            startDestination = DtaDestinations.SPLASH,
            modifier = Modifier
                .fillMaxSize()
                .padding(bottom = if (isCustomerNav || isResellerNav || isAdminNav) paddingValues.calculateBottomPadding() else 0.dp)
        ) {
            // -------------------------------------------------------------
            // 1. Splash & Auth
            // -------------------------------------------------------------
            composable(DtaDestinations.SPLASH) {
                SplashScreen(
                    onSplashFinished = {
                        val destination = when (activeRole) {
                            UserRole.RESELLER -> DtaDestinations.RESELLER_DASHBOARD
                            UserRole.ADMIN, UserRole.SUPERADMIN -> DtaDestinations.ADMIN_HUB
                            else -> DtaDestinations.HOME
                        }
                        navController.navigate(destination) {
                            popUpTo(DtaDestinations.SPLASH) { inclusive = true }
                        }
                    }
                )
            }

            composable(DtaDestinations.LOGIN) {
                LoginScreen(
                    viewModel = authViewModel,
                    onLoginSuccess = {
                        navController.navigate(DtaDestinations.HOME) {
                            popUpTo(DtaDestinations.LOGIN) { inclusive = true }
                        }
                    },
                    onNavigateToRegister = { navController.navigate(DtaDestinations.REGISTER) },
                    onContinueAsGuest = {
                        navController.navigate(DtaDestinations.HOME) {
                            popUpTo(DtaDestinations.LOGIN) { inclusive = true }
                        }
                    }
                )
            }

            composable(DtaDestinations.REGISTER) {
                RegisterScreen(
                    viewModel = authViewModel,
                    onRegisterSuccess = {
                        navController.navigate(DtaDestinations.HOME) {
                            popUpTo(DtaDestinations.REGISTER) { inclusive = true }
                        }
                    },
                    onNavigateToLogin = { navController.popBackStack() }
                )
            }

            // -------------------------------------------------------------
            // 2. Customer Screens
            // -------------------------------------------------------------
            composable(DtaDestinations.HOME) {
                HomeScreen(
                    viewModel = homeViewModel,
                    onNavigateToProductDetail = { productId ->
                        navController.navigate(DtaDestinations.productDetail(productId))
                    },
                    onNavigateToMarket = { categorySlug ->
                        if (categorySlug != null) marketViewModel.onCategorySelected(categorySlug)
                        navController.navigate(DtaDestinations.MARKET)
                    },
                    onNavigateToCart = { navController.navigate(DtaDestinations.CART) },
                    onNavigateToNotifications = { navController.navigate(DtaDestinations.NOTIFICATIONS) },
                    onNavigateToAccount = { navController.navigate(DtaDestinations.ACCOUNT) }
                )
            }

            composable(DtaDestinations.MARKET) {
                MarketScreen(
                    viewModel = marketViewModel,
                    onNavigateToProductDetail = { productId ->
                        navController.navigate(DtaDestinations.productDetail(productId))
                    },
                    onNavigateBack = { navController.popBackStack() },
                    onNavigateToCart = { navController.navigate(DtaDestinations.CART) }
                )
            }

            composable(DtaDestinations.WISHLIST) {
                WishlistScreen(
                    viewModel = marketViewModel,
                    onNavigateBack = { navController.popBackStack() },
                    onNavigateToProductDetail = { productId ->
                        navController.navigate(DtaDestinations.productDetail(productId))
                    }
                )
            }

            composable(
                route = DtaDestinations.PRODUCT_DETAIL,
                arguments = listOf(navArgument("productId") { type = NavType.StringType })
            ) { backStackEntry ->
                val productId = backStackEntry.arguments?.getString("productId") ?: ""
                val productDetailViewModel = remember(productId) {
                    ProductDetailViewModel(productId, productRepository, cartRepository, dataStoreManager)
                }

                ProductDetailScreen(
                    viewModel = productDetailViewModel,
                    onNavigateBack = { navController.popBackStack() },
                    onNavigateToCart = { navController.navigate(DtaDestinations.CART) },
                    onNavigateToCheckout = { navController.navigate(DtaDestinations.CHECKOUT) }
                )
            }

            composable(DtaDestinations.CART) {
                CartScreen(
                    viewModel = cartViewModel,
                    onNavigateBack = { navController.popBackStack() },
                    onNavigateToCheckout = { navController.navigate(DtaDestinations.CHECKOUT) },
                    onNavigateToMarket = { navController.navigate(DtaDestinations.MARKET) }
                )
            }

            composable(DtaDestinations.CHECKOUT) {
                val checkoutViewModel = remember {
                    CheckoutViewModel(cartRepository, orderRepository, userRepository)
                }

                CheckoutScreen(
                    viewModel = checkoutViewModel,
                    onNavigateBack = { navController.popBackStack() },
                    onOrderPlaced = { orderId ->
                        navController.navigate(DtaDestinations.orderConfirmation(orderId)) {
                            popUpTo(DtaDestinations.CHECKOUT) { inclusive = true }
                        }
                    }
                )
            }

            composable(
                route = DtaDestinations.ORDER_CONFIRMATION,
                arguments = listOf(navArgument("orderId") { type = NavType.StringType })
            ) { backStackEntry ->
                val orderId = backStackEntry.arguments?.getString("orderId") ?: ""
                OrderConfirmationScreen(
                    orderId = orderId,
                    onTrackOrder = { id ->
                        navController.navigate(DtaDestinations.orderTracking(id)) {
                            popUpTo(DtaDestinations.HOME)
                        }
                    },
                    onContinueShopping = {
                        navController.navigate(DtaDestinations.HOME) {
                            popUpTo(DtaDestinations.HOME) { inclusive = true }
                        }
                    }
                )
            }

            composable(DtaDestinations.ORDERS) {
                OrdersScreen(
                    viewModel = ordersViewModel,
                    onNavigateToTracking = { orderId ->
                        navController.navigate(DtaDestinations.orderTracking(orderId))
                    },
                    onNavigateToMarket = { navController.navigate(DtaDestinations.MARKET) }
                )
            }

            composable(
                route = DtaDestinations.ORDER_TRACKING,
                arguments = listOf(navArgument("orderId") { type = NavType.StringType })
            ) { backStackEntry ->
                val orderId = backStackEntry.arguments?.getString("orderId") ?: ""
                val trackingViewModel = remember(orderId) {
                    OrderTrackingViewModel(orderId, orderRepository)
                }

                OrderTrackingScreen(
                    viewModel = trackingViewModel,
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(DtaDestinations.GROWTH) {
                CustomerRewardsScreen(viewModel = customerRewardsViewModel)
            }

            composable(DtaDestinations.ACCOUNT) {
                AccountScreen(
                    viewModel = accountViewModel,
                    onNavigateToOrders = { navController.navigate(DtaDestinations.ORDERS) },
                    onNavigateToWishlist = { navController.navigate(DtaDestinations.WISHLIST) },
                    onNavigateToNotifications = { navController.navigate(DtaDestinations.NOTIFICATIONS) },
                    onNavigateToAddresses = { navController.navigate(DtaDestinations.ADDRESSES) },
                    onNavigateToPaymentMethods = { navController.navigate(DtaDestinations.PAYMENT_METHODS) },
                    onNavigateToHelp = { navController.navigate(DtaDestinations.HELP_SUPPORT) },
                    onNavigateToLegal = { type -> navController.navigate(DtaDestinations.legal(type)) },
                    onNavigateToLogin = { navController.navigate(DtaDestinations.LOGIN) },
                    onSwitchRole = { showRoleSwitcherSheet = true }
                )
            }

            composable(DtaDestinations.NOTIFICATIONS) {
                NotificationsScreen(viewModel = accountViewModel, onNavigateBack = { navController.popBackStack() })
            }

            composable(DtaDestinations.ADDRESSES) {
                AddressesScreen(viewModel = accountViewModel, onNavigateBack = { navController.popBackStack() })
            }

            composable(DtaDestinations.PAYMENT_METHODS) {
                PaymentMethodsScreen(onNavigateBack = { navController.popBackStack() })
            }

            composable(DtaDestinations.HELP_SUPPORT) {
                HelpSupportScreen(onNavigateBack = { navController.popBackStack() })
            }

            composable(
                route = DtaDestinations.LEGAL,
                arguments = listOf(navArgument("type") { type = NavType.StringType })
            ) { backStackEntry ->
                val type = backStackEntry.arguments?.getString("type") ?: "privacy"
                LegalScreen(legalType = type, onNavigateBack = { navController.popBackStack() })
            }

            // -------------------------------------------------------------
            // 3. Reseller / Partner Screens
            // -------------------------------------------------------------
            composable(DtaDestinations.RESELLER_DASHBOARD) {
                ResellerDashboardScreen(
                    viewModel = resellerDashboardViewModel,
                    onNavigateToRecordSale = { productId ->
                        navController.navigate(DtaDestinations.recordSale(productId))
                    },
                    onNavigateToCatalog = { navController.navigate(DtaDestinations.PARTNER_CATALOG) },
                    onNavigateToWallet = { navController.navigate(DtaDestinations.RESELLER_WALLET) },
                    onNavigateToGrowth = { navController.navigate(DtaDestinations.RESELLER_GROWTH) },
                    onNavigateToOrders = { navController.navigate(DtaDestinations.RESELLER_ORDERS) },
                    onNavigateToReferrals = { navController.navigate(DtaDestinations.RESELLER_REFERRALS) },
                    onNavigateToTracking = { orderId ->
                        navController.navigate(DtaDestinations.resellerOrderTracking(orderId))
                    },
                    onSwitchRole = { showRoleSwitcherSheet = true }
                )
            }

            composable(DtaDestinations.PARTNER_CATALOG) {
                PartnerCatalogScreen(
                    viewModel = partnerCatalogViewModel,
                    onSellProduct = { productId ->
                        navController.navigate(DtaDestinations.recordSale(productId))
                    }
                )
            }

            composable(
                route = DtaDestinations.RECORD_SALE,
                arguments = listOf(navArgument("productId") {
                    type = NavType.StringType
                    nullable = true
                    defaultValue = null
                })
            ) { backStackEntry ->
                val productId = backStackEntry.arguments?.getString("productId")
                val recordSaleViewModel = remember(productId) {
                    RecordSaleViewModel(productId, resellerRepository)
                }

                RecordSaleScreen(
                    viewModel = recordSaleViewModel,
                    onNavigateBack = { navController.popBackStack() },
                    onSaleRecorded = {
                        navController.navigate(DtaDestinations.RESELLER_DASHBOARD) {
                            popUpTo(DtaDestinations.RESELLER_DASHBOARD)
                        }
                    }
                )
            }

            composable(DtaDestinations.RESELLER_WALLET) {
                ResellerWalletScreen(
                    viewModel = resellerWalletViewModel,
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(DtaDestinations.RESELLER_GROWTH) {
                ResellerGrowthScreen(
                    viewModel = resellerGrowthViewModel
                )
            }

            composable(DtaDestinations.RESELLER_REFERRALS) {
                ReferralsScreen(
                    resellerRepository = resellerRepository,
                    onNavigateBack = { navController.popBackStack() },
                    onNavigateToTeam = { navController.navigate(DtaDestinations.RESELLER_TEAM) }
                )
            }

            composable(DtaDestinations.RESELLER_TEAM) {
                MyTeamScreen(
                    resellerRepository = resellerRepository,
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(DtaDestinations.RESELLER_ORDERS) {
                ResellerOrdersScreen(
                    resellerRepository = resellerRepository,
                    onNavigateBack = { navController.popBackStack() },
                    onNavigateToDetail = { orderId ->
                        navController.navigate(DtaDestinations.resellerOrderTracking(orderId))
                    },
                    onRecordNewSale = {
                        navController.navigate(DtaDestinations.recordSale())
                    }
                )
            }

            composable(
                route = DtaDestinations.RESELLER_ORDER_TRACKING,
                arguments = listOf(navArgument("orderId") { type = NavType.StringType })
            ) { backStackEntry ->
                val orderId = backStackEntry.arguments?.getString("orderId") ?: "DS1007"
                ResellerOrderTrackingScreen(
                    orderId = orderId,
                    resellerRepository = resellerRepository,
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(DtaDestinations.RESELLER_ACCOUNT) {
                ResellerAccountScreen(
                    resellerRepository = resellerRepository,
                    onNavigateToWallet = { navController.navigate(DtaDestinations.RESELLER_WALLET) },
                    onNavigateToGrowth = { navController.navigate(DtaDestinations.RESELLER_GROWTH) },
                    onNavigateToReferrals = { navController.navigate(DtaDestinations.RESELLER_REFERRALS) },
                    onSwitchRole = { showRoleSwitcherSheet = true },
                    onSignOut = {
                        navController.navigate(DtaDestinations.LOGIN) {
                            popUpTo(0) { inclusive = true }
                        }
                    }
                )
            }

            // -------------------------------------------------------------
            // 4. Admin / Operations Screens (Role Authorized via Point 41)
            // -------------------------------------------------------------
            composable(DtaDestinations.ADMIN_HUB) {
                AdminRouteGuard(
                    activeRole = activeRole,
                    adminRepository = adminRepository,
                    onSwitchRole = { showRoleSwitcherSheet = true },
                    onNavigateHome = {
                        navController.navigate(if (activeRole == UserRole.RESELLER) DtaDestinations.RESELLER_DASHBOARD else DtaDestinations.HOME) {
                            popUpTo(0) { inclusive = true }
                        }
                    }
                ) {
                    AdminHubScreen(
                        viewModel = adminHubViewModel,
                        onNavigateToOrders = { navController.navigate(DtaDestinations.ADMIN_ORDERS) },
                        onNavigateToWithdrawals = { navController.navigate(DtaDestinations.ADMIN_WITHDRAWALS) },
                        onNavigateToRewards = { navController.navigate(DtaDestinations.ADMIN_RANK_REWARDS) },
                        onNavigateToProducts = { navController.navigate(DtaDestinations.ADMIN_PRODUCTS) },
                        onNavigateToCategories = { navController.navigate(DtaDestinations.ADMIN_CATEGORIES) },
                        onNavigateToUsers = { navController.navigate(DtaDestinations.ADMIN_USERS) },
                        onSwitchRole = { showRoleSwitcherSheet = true }
                    )
                }
            }

            composable(DtaDestinations.ADMIN_ORDERS) {
                AdminRouteGuard(
                    activeRole = activeRole,
                    adminRepository = adminRepository,
                    onSwitchRole = { showRoleSwitcherSheet = true },
                    onNavigateHome = {
                        navController.navigate(if (activeRole == UserRole.RESELLER) DtaDestinations.RESELLER_DASHBOARD else DtaDestinations.HOME) {
                            popUpTo(0) { inclusive = true }
                        }
                    }
                ) {
                    AdminAdaptiveOrderVerificationScreen(
                        viewModel = adminOrderViewModel,
                        adminRepository = adminRepository,
                        onNavigateBack = { navController.popBackStack() },
                        onNavigateToReview = { orderId ->
                            navController.navigate(DtaDestinations.adminOrderReview(orderId))
                        }
                    )
                }
            }

            composable(
                route = DtaDestinations.ADMIN_ORDER_REVIEW,
                arguments = listOf(navArgument("orderId") { type = NavType.StringType })
            ) { backStackEntry ->
                val orderId = backStackEntry.arguments?.getString("orderId") ?: "DS1008"
                AdminRouteGuard(
                    activeRole = activeRole,
                    adminRepository = adminRepository,
                    onSwitchRole = { showRoleSwitcherSheet = true },
                    onNavigateHome = {
                        navController.navigate(if (activeRole == UserRole.RESELLER) DtaDestinations.RESELLER_DASHBOARD else DtaDestinations.HOME) {
                            popUpTo(0) { inclusive = true }
                        }
                    }
                ) {
                    AdminOrderReviewScreen(
                        orderId = orderId,
                        adminRepository = adminRepository,
                        onNavigateBack = { navController.popBackStack() }
                    )
                }
            }

            composable(DtaDestinations.ADMIN_WITHDRAWALS) {
                AdminRouteGuard(
                    activeRole = activeRole,
                    adminRepository = adminRepository,
                    onSwitchRole = { showRoleSwitcherSheet = true },
                    onNavigateHome = {
                        navController.navigate(if (activeRole == UserRole.RESELLER) DtaDestinations.RESELLER_DASHBOARD else DtaDestinations.HOME) {
                            popUpTo(0) { inclusive = true }
                        }
                    }
                ) {
                    AdminWithdrawalApprovalScreen(
                        viewModel = adminWithdrawalViewModel,
                        onNavigateBack = { navController.popBackStack() }
                    )
                }
            }

            composable(DtaDestinations.ADMIN_USERS) {
                AdminRouteGuard(
                    activeRole = activeRole,
                    adminRepository = adminRepository,
                    onSwitchRole = { showRoleSwitcherSheet = true },
                    onNavigateHome = {
                        navController.navigate(if (activeRole == UserRole.RESELLER) DtaDestinations.RESELLER_DASHBOARD else DtaDestinations.HOME) {
                            popUpTo(0) { inclusive = true }
                        }
                    }
                ) {
                    AdminUserManagementScreen(
                        viewModel = adminUserViewModel,
                        onNavigateBack = { navController.popBackStack() }
                    )
                }
            }

            composable(DtaDestinations.ADMIN_RANK_REWARDS) {
                AdminRouteGuard(
                    activeRole = activeRole,
                    adminRepository = adminRepository,
                    onSwitchRole = { showRoleSwitcherSheet = true },
                    onNavigateHome = {
                        navController.navigate(if (activeRole == UserRole.RESELLER) DtaDestinations.RESELLER_DASHBOARD else DtaDestinations.HOME) {
                            popUpTo(0) { inclusive = true }
                        }
                    }
                ) {
                    AdminRankRewardsScreen(
                        adminRepository = adminRepository,
                        onNavigateBack = { navController.popBackStack() }
                    )
                }
            }

            composable(DtaDestinations.ADMIN_PRODUCTS) {
                AdminRouteGuard(
                    activeRole = activeRole,
                    adminRepository = adminRepository,
                    onSwitchRole = { showRoleSwitcherSheet = true },
                    onNavigateHome = {
                        navController.navigate(if (activeRole == UserRole.RESELLER) DtaDestinations.RESELLER_DASHBOARD else DtaDestinations.HOME) {
                            popUpTo(0) { inclusive = true }
                        }
                    }
                ) {
                    AdminProductManagementScreen(
                        adminRepository = adminRepository,
                        onNavigateBack = { navController.popBackStack() }
                    )
                }
            }

            composable(DtaDestinations.ADMIN_CATEGORIES) {
                AdminRouteGuard(
                    activeRole = activeRole,
                    adminRepository = adminRepository,
                    onSwitchRole = { showRoleSwitcherSheet = true },
                    onNavigateHome = {
                        navController.navigate(if (activeRole == UserRole.RESELLER) DtaDestinations.RESELLER_DASHBOARD else DtaDestinations.HOME) {
                            popUpTo(0) { inclusive = true }
                        }
                    }
                ) {
                    AdminCategoryManagementScreen(
                        adminRepository = adminRepository,
                        onNavigateBack = { navController.popBackStack() }
                    )
                }
            }

            composable(DtaDestinations.ADMIN_ACCOUNT) {
                AdminRouteGuard(
                    activeRole = activeRole,
                    adminRepository = adminRepository,
                    onSwitchRole = { showRoleSwitcherSheet = true },
                    onNavigateHome = {
                        navController.navigate(if (activeRole == UserRole.RESELLER) DtaDestinations.RESELLER_DASHBOARD else DtaDestinations.HOME) {
                            popUpTo(0) { inclusive = true }
                        }
                    }
                ) {
                    AdminAccountScreen(
                        adminRepository = adminRepository,
                        onNavigateToAuditLogs = { navController.navigate(DtaDestinations.ADMIN_AUDIT_LOGS) },
                        onNavigateToUsers = { navController.navigate(DtaDestinations.ADMIN_USERS) },
                        onSwitchRole = { showRoleSwitcherSheet = true },
                        onSignOut = {
                            navController.navigate(DtaDestinations.LOGIN) {
                                popUpTo(0) { inclusive = true }
                            }
                        }
                    )
                }
            }

            composable(DtaDestinations.ADMIN_AUDIT_LOGS) {
                AdminRouteGuard(
                    activeRole = activeRole,
                    adminRepository = adminRepository,
                    onSwitchRole = { showRoleSwitcherSheet = true },
                    onNavigateHome = {
                        navController.navigate(if (activeRole == UserRole.RESELLER) DtaDestinations.RESELLER_DASHBOARD else DtaDestinations.HOME) {
                            popUpTo(0) { inclusive = true }
                        }
                    }
                ) {
                    AuditLogScreen(
                        adminRepository = adminRepository,
                        onNavigateBack = { navController.popBackStack() }
                    )
                }
            }
        }
    }
}

@Composable
private fun RoleOptionCard(
    title: String,
    subtitle: String,
    icon: ImageVector,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Card(
        shape = DtaTheme.shapes.Card,
        colors = CardDefaults.cardColors(
            containerColor = if (isSelected) DtaTheme.colors.primaryContainer else DtaTheme.colors.surfaceAlt
        ),
        border = androidx.compose.foundation.BorderStroke(
            width = if (isSelected) 2.dp else 1.dp,
            color = if (isSelected) DtaTheme.colors.primary else DtaTheme.colors.line
        ),
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .clip(CircleShape)
                    .background(
                        if (isSelected) DtaTheme.colors.primary else DtaTheme.colors.surface
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = if (isSelected) Color.White else DtaTheme.colors.primary,
                    modifier = Modifier.size(22.dp)
                )
            }

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    style = DtaTheme.typography.TitleSmall.copy(fontWeight = FontWeight.Bold)
                )
                Text(
                    text = subtitle,
                    style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.inkSecondary)
                )
            }

            if (isSelected) {
                Icon(
                    imageVector = Icons.Default.CheckCircle,
                    contentDescription = "Active",
                    tint = DtaTheme.colors.primary,
                    modifier = Modifier.size(22.dp)
                )
            }
        }
    }
}

/**
 * Point 41: Role Authorization Security Guard.
 * Blocks non-admin users from viewing or manipulating admin destinations.
 */
@Composable
private fun AdminRouteGuard(
    activeRole: UserRole,
    adminRepository: AdminRepository,
    onSwitchRole: () -> Unit,
    onNavigateHome: () -> Unit,
    content: @Composable () -> Unit
) {
    if (adminRepository.isAuthorizedAdmin(activeRole)) {
        content()
    } else {
        AdminAccessDeniedScreen(
            currentRole = activeRole,
            onSwitchRole = onSwitchRole,
            onNavigateHome = onNavigateHome
        )
    }
}

/**
 * Point 41: Unauthorized / Access Denied Screen with Role Switch Action.
 */
@Composable
private fun AdminAccessDeniedScreen(
    currentRole: UserRole,
    onSwitchRole: () -> Unit,
    onNavigateHome: () -> Unit
) {
    Scaffold(
        topBar = {
            DtaTopAppBar(
                title = "Access Restricted",
                subtitle = "Authorized Personnel Only",
                navigationIcon = Icons.Default.ArrowBack,
                onNavigationClick = onNavigateHome
            )
        },
        containerColor = DtaTheme.colors.background
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(24.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Box(
                modifier = Modifier
                    .size(80.dp)
                    .clip(CircleShape)
                    .background(DtaTheme.colors.errorContainer),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.AdminPanelSettings,
                    contentDescription = "Restricted",
                    tint = DtaTheme.colors.error,
                    modifier = Modifier.size(44.dp)
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            Text(
                text = "Administrator Authorization Required",
                style = DtaTheme.typography.HeadlineSmall.copy(fontWeight = FontWeight.Bold),
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = "This console controls platform order verification, courier dispatch, payout disbursement, and catalog management. Your active session is currently set to ${currentRole.name}.",
                style = DtaTheme.typography.BodyMedium.copy(color = DtaTheme.colors.inkSecondary),
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(28.dp))

            DtaButton(
                text = "Switch to Admin Console",
                onClick = onSwitchRole,
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(10.dp))

            DtaOutlinedButton(
                text = "Return to Dashboard",
                onClick = onNavigateHome,
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}

