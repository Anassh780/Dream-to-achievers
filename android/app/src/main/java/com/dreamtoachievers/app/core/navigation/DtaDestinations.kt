package com.dreamtoachievers.app.core.navigation

object DtaDestinations {
    const val SPLASH = "splash"
    const val LOGIN = "login"
    const val REGISTER = "register"

    // Primary Customer Bottom Navigation Destinations
    const val HOME = "home"
    const val MARKET = "market"
    const val ORDERS = "orders"
    const val GROWTH = "growth"
    const val ACCOUNT = "account"

    // Commerce Flow Destinations
    const val SEARCH = "search"
    const val CATEGORY = "category/{slug}"
    const val PRODUCT_DETAIL = "product/{productId}"
    const val WISHLIST = "wishlist"
    const val CART = "cart"
    const val CHECKOUT = "checkout"
    const val ORDER_CONFIRMATION = "order_confirmation/{orderId}"
    const val ORDER_TRACKING = "order_tracking/{orderId}"

    // Secondary Account Destinations
    const val NOTIFICATIONS = "notifications"
    const val PROFILE = "profile"
    const val ADDRESSES = "addresses"
    const val PAYMENT_METHODS = "payment_methods"
    const val HELP_SUPPORT = "help_support"
    const val LEGAL = "legal/{type}"

    // -------------------------------------------------------------
    // Phase 2: Reseller / Partner Experience Destinations
    // -------------------------------------------------------------
    const val RESELLER_DASHBOARD = "reseller_dashboard"
    const val PARTNER_CATALOG = "partner_catalog"
    const val RECORD_SALE = "record_sale?productId={productId}"
    const val RESELLER_WALLET = "reseller_wallet"
    const val RESELLER_GROWTH = "reseller_growth"

    // Points 31, 32, 34, 35: Referrals, My Team, Orders List, Order Tracking Detail (Screen 07)
    const val RESELLER_REFERRALS = "reseller_referrals"
    const val RESELLER_TEAM = "reseller_team"
    const val RESELLER_ORDERS = "reseller_orders"
    const val RESELLER_ORDER_TRACKING = "reseller_order_tracking/{orderId}"
    const val RESELLER_ACCOUNT = "reseller_account"

    // -------------------------------------------------------------
    // Phase 2: Admin / Operations Experience Destinations
    // -------------------------------------------------------------
    const val ADMIN_HUB = "admin_hub"
    const val ADMIN_ORDERS = "admin_orders"
    const val ADMIN_WITHDRAWALS = "admin_withdrawals"
    const val ADMIN_USERS = "admin_users"
    const val ADMIN_ACCOUNT = "admin_account"
    const val ADMIN_AUDIT_LOGS = "admin_audit_logs"

    // Points 44, 58, 59, 60: Order Review (Screen 08), Rank Rewards, Products, Categories
    const val ADMIN_ORDER_REVIEW = "admin_order_review/{orderId}"
    const val ADMIN_RANK_REWARDS = "admin_rank_rewards"
    const val ADMIN_PRODUCTS = "admin_products"
    const val ADMIN_CATEGORIES = "admin_categories"

    // Navigation Argument Helpers
    fun productDetail(productId: String) = "product/$productId"
    fun category(slug: String) = "category/$slug"
    fun orderConfirmation(orderId: String) = "order_confirmation/$orderId"
    fun orderTracking(orderId: String) = "order_tracking/$orderId"
    fun legal(type: String) = "legal/$type"
    fun recordSale(productId: String? = null) = if (productId != null) "record_sale?productId=$productId" else "record_sale"
    fun resellerOrderTracking(orderId: String) = "reseller_order_tracking/$orderId"
    fun adminOrderReview(orderId: String) = "admin_order_review/$orderId"
}
