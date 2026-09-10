package com.dreamtoachievers.app.core.data

import com.dreamtoachievers.app.core.firebase.FirebaseConfig
import com.dreamtoachievers.app.core.model.*
import com.google.firebase.firestore.DocumentSnapshot
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ListenerRegistration
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.text.SimpleDateFormat
import java.util.*

class ResellerRepository(
    private val dataStoreManager: DataStoreManager? = null,
) {
    private val protectedListeners = mutableListOf<ListenerRegistration>()
    private var authStateListener: FirebaseAuth.AuthStateListener? = null
    private fun getAuthUserSafe() = try {
        FirebaseAuth.getInstance().currentUser
    } catch (_: Exception) {
        null
    }

    private fun currentUserId(): String = getAuthUserSafe()?.uid.orEmpty()

    private fun getFirestoreSafe(): FirebaseFirestore? {
        return try {
            FirebaseFirestore.getInstance()
        } catch (_: Exception) {
            null
        }
    }

    // 1. Partner Wholesale Catalog
    private val _partnerProducts = MutableStateFlow<List<PartnerProduct>>(emptyList())
    val partnerProducts: StateFlow<List<PartnerProduct>> = _partnerProducts.asStateFlow()

    // 2. Reseller Sales Ledger
    private val _resellerSales = MutableStateFlow<List<ResellerSale>>(emptyList())
    val resellerSales: StateFlow<List<ResellerSale>> = _resellerSales.asStateFlow()

    // 3. Reseller Withdrawals
    private val _withdrawals = MutableStateFlow<List<WithdrawalRequest>>(emptyList())
    val withdrawals: StateFlow<List<WithdrawalRequest>> = _withdrawals.asStateFlow()

    // 4. Milestone Rewards
    private val _milestoneRewards = MutableStateFlow<List<MilestoneReward>>(emptyList())
    val milestoneRewards: StateFlow<List<MilestoneReward>> = _milestoneRewards.asStateFlow()

    // 5. Community Members & Team
    private val _teamMembers = MutableStateFlow<List<TeamMember>>(emptyList())
    val teamMembers: StateFlow<List<TeamMember>> = _teamMembers.asStateFlow()
    val communityMembers: StateFlow<List<TeamMember>> get() = teamMembers

    // 6. Network Overview Analytics
    private val _networkAnalytics = MutableStateFlow(NetworkAnalytics())
    val networkAnalytics: StateFlow<NetworkAnalytics> = _networkAnalytics.asStateFlow()

    init {
        initFirestoreSync()
    }

    private fun initFirestoreSync() {
        val fs = getFirestoreSafe()
        if (fs == null) {
            seedInitialData()
            return
        }

        fs.collection(FirebaseConfig.COLLECTION_PRODUCTS)
            .addSnapshotListener { snap, err ->
                if ((err != null) || (snap == null)) return@addSnapshotListener
                val list = snap.documents.mapNotNull { parsePartnerProduct(it) }
                _partnerProducts.value = list
            }

        val firebaseAuth = FirebaseAuth.getInstance()
        authStateListener = FirebaseAuth.AuthStateListener { auth ->
            bindUserListeners(fs, auth.currentUser?.uid)
        }.also(firebaseAuth::addAuthStateListener)
    }

    private fun bindUserListeners(fs: FirebaseFirestore, currentUserId: String?) {
        protectedListeners.forEach(ListenerRegistration::remove)
        protectedListeners.clear()
        if (currentUserId.isNullOrBlank()) {
            _resellerSales.value = emptyList()
            _withdrawals.value = emptyList()
            _milestoneRewards.value = emptyList()
            return
        }

        protectedListeners += fs.collection(FirebaseConfig.COLLECTION_SALES)
            .whereEqualTo("userId", currentUserId)
            .addSnapshotListener { snap, err ->
                if ((err != null) || (snap == null)) return@addSnapshotListener
                val list = snap.documents.asSequence().mapNotNull { parseResellerSale(it) }.sortedByDescending { it.createdAt }.toList()
                _resellerSales.value = list
            }

        protectedListeners += fs.collection(FirebaseConfig.COLLECTION_WITHDRAWALS)
            .whereEqualTo("userId", currentUserId)
            .addSnapshotListener { snap, err ->
                if (err != null || snap == null) return@addSnapshotListener
                val list = snap.documents.mapNotNull { parseWithdrawalRequest(it) }.sortedByDescending { it.requestedAt }
                _withdrawals.value = list
            }

        protectedListeners += fs.collection(FirebaseConfig.COLLECTION_REWARDS)
            .whereEqualTo("userId", currentUserId)
            .addSnapshotListener { snap, err ->
                if (err != null || snap == null) return@addSnapshotListener
                val list = snap.documents.mapNotNull { parseMilestoneReward(it) }
                _milestoneRewards.value = list
            }

    }

    // -------------------------------------------------------------
    // Query Helpers
    // -------------------------------------------------------------

    fun getOrderById(orderId: String): ResellerSale? {
        return _resellerSales.value.firstOrNull { it.id.equals(orderId, ignoreCase = true) }
    }

    private fun seedInitialData() {
        val seededProducts = listOf(
            PartnerProduct(
                id = "prod-01",
                name = "Smart Watch",
                partnerPrice = 12000.0,
                retailPrice = 15000.0,
                imageUrl = "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
                inStock = true
            ),
            PartnerProduct(
                id = "prod-02",
                name = "Wireless Earbuds",
                partnerPrice = 6500.0,
                retailPrice = 8000.0,
                imageUrl = "https://images.unsplash.com/photo-1590658268037-6bf12165a8df",
                inStock = true
            )
        )
        val seededSales = listOf(
            ResellerSale(
                id = "sale-dta-9102",
                userId = "reseller-1",
                resellerName = "Alex Khan",
                productId = "prod-01",
                productName = "Smart Watch",
                sellingPrice = 14000.0,
                partnerPrice = 12000.0,
                profitMargin = 2000.0,
                quantity = 1,
                customerName = "Customer A",
                status = OrderStatus.DELIVERED,
                isQualifying = true,
                createdAt = "2026-09-01T10:00:00Z"
            ),
            ResellerSale(
                id = "sale-dta-9088",
                userId = "reseller-1",
                resellerName = "Alex Khan",
                productId = "prod-02",
                productName = "Wireless Earbuds",
                sellingPrice = 7500.0,
                partnerPrice = 6500.0,
                profitMargin = 1000.0,
                quantity = 1,
                customerName = "Customer B",
                status = OrderStatus.DELIVERED,
                isQualifying = true,
                createdAt = "2026-09-02T10:00:00Z"
            ),
            ResellerSale(
                id = "sale-dta-9071",
                userId = "reseller-1",
                resellerName = "Alex Khan",
                productId = "prod-01",
                productName = "Smart Watch",
                sellingPrice = 14400.0,
                partnerPrice = 12000.0,
                profitMargin = 2400.0,
                quantity = 1,
                customerName = "Customer C",
                status = OrderStatus.DISPATCHED,
                createdAt = "2026-09-03T10:00:00Z"
            ),
            ResellerSale(
                id = "sale-dta-9055",
                userId = "reseller-1",
                resellerName = "Alex Khan",
                productId = "prod-02",
                productName = "Wireless Earbuds",
                sellingPrice = 7250.0,
                partnerPrice = 6500.0,
                profitMargin = 750.0,
                quantity = 1,
                customerName = "Customer D",
                status = OrderStatus.PENDING_VERIFICATION,
                createdAt = "2026-09-04T10:00:00Z"
            ),
            ResellerSale(
                id = "DS1008",
                userId = "user-103",
                resellerName = "Alex Khan",
                productId = "prod-01",
                productName = "Smart Watch",
                sellingPrice = 15000.0,
                partnerPrice = 12000.0,
                profitMargin = 3000.0,
                quantity = 1,
                customerName = "Usman Ali",
                customerPhone = "03001234567",
                customerAddress = "Street 5, Sector F-7, Islamabad",
                customerCity = "Islamabad",
                status = OrderStatus.PENDING_VERIFICATION,
                paymentScreenshotUrl = "https://example.com/receipt.jpg",
                createdAt = "2026-09-05T10:00:00Z"
            ),
            ResellerSale(
                id = "DS1007",
                userId = "user-101",
                resellerName = "Sara Ahmed",
                productId = "prod-02",
                productName = "Wireless Earbuds",
                sellingPrice = 8000.0,
                partnerPrice = 6500.0,
                profitMargin = 1500.0,
                quantity = 1,
                customerName = "Zainab Bibi",
                customerPhone = "03219876543",
                customerAddress = "Model Town, Lahore",
                customerCity = "Lahore",
                status = OrderStatus.PAYMENT_VERIFIED,
                createdAt = "2026-09-04T10:00:00Z"
            ),
            ResellerSale(
                id = "DS1006",
                userId = "user-101",
                resellerName = "Sara Ahmed",
                productId = "prod-02",
                productName = "Wireless Earbuds",
                sellingPrice = 8000.0,
                partnerPrice = 6500.0,
                profitMargin = 1500.0,
                quantity = 1,
                customerName = "Bilal Ahmed",
                customerPhone = "03335554433",
                customerAddress = "Gulberg, Lahore",
                customerCity = "Lahore",
                status = OrderStatus.DELIVERED,
                createdAt = "2026-09-03T10:00:00Z"
            )
        )
        val seededWithdrawals = listOf(
            WithdrawalRequest(
                id = "wd-dta-1002",
                userId = "reseller-1",
                userName = "Alex Khan",
                userEmail = "alex@example.com",
                userPhone = "03001112233",
                amount = 2000.0,
                status = WithdrawalStatus.PAID,
                payoutMethod = PaymentMethod(methodType = PaymentMethodType.BANK_TRANSFER, bankName = "Meezan Bank", accountNumber = "1234567890"),
                requestedAt = "2026-09-01T08:00:00Z"
            ),
            WithdrawalRequest(
                id = "wd-dta-1003",
                userId = "user-101",
                userName = "Sara Ahmed",
                userEmail = "sara@example.com",
                userPhone = "03001112233",
                amount = 5000.0,
                status = WithdrawalStatus.PENDING,
                payoutMethod = PaymentMethod(methodType = PaymentMethodType.BANK_TRANSFER, bankName = "Meezan Bank", accountNumber = "1234567890"),
                requestedAt = "2026-09-05T08:00:00Z"
            )
        )
        val seededTeamMembers = listOf(
            TeamMember(
                id = "team-1",
                name = "Zain Ali",
                avatarUrl = null,
                joinDate = "2026-01-15",
                isActive = true,
                isQualifying = true,
                rankName = "Silver Partner"
            ),
            TeamMember(
                id = "team-2",
                name = "Usman Khan",
                avatarUrl = null,
                joinDate = "2026-02-10",
                isActive = true,
                isQualifying = true,
                rankName = "Partner Member"
            )
        )
        _partnerProducts.value = seededProducts
        _resellerSales.value = seededSales
        _withdrawals.value = seededWithdrawals
        _teamMembers.value = seededTeamMembers
    }

    // -------------------------------------------------------------
    // Wallet Calculations (Mirroring src/services/salesService.ts)
    // -------------------------------------------------------------

    fun getQualifyingSalesCount(userId: String = currentUserId()): Int {
        return _resellerSales.value.filter { sale ->
            sale.userId == userId && (
                sale.isQualifying ||
                sale.status == OrderStatus.DELIVERED ||
                sale.status == OrderStatus.CONFIRMED ||
                sale.status == OrderStatus.FULFILLED
            )
        }.size
    }

    fun getQualifyingCommunityCount(userId: String = currentUserId()): Int {
        return _teamMembers.value.filter { it.isActive && it.isQualifying }.size
    }

    fun getMyTeamMembers(resellerId: String = currentUserId()): List<TeamMember> {
        return _teamMembers.value
    }

    fun getRealizedProfit(userId: String = currentUserId()): Double {
        return _resellerSales.value.filter { sale ->
            sale.userId == userId && (
                sale.status == OrderStatus.DELIVERED ||
                sale.status == OrderStatus.CONFIRMED ||
                sale.status == OrderStatus.FULFILLED ||
                sale.isQualifying
            )
        }.sumOf { it.totalProfit }
    }

    fun getPendingProfit(userId: String = currentUserId()): Double {
        return _resellerSales.value.filter { sale ->
            sale.userId == userId && (
                sale.status == OrderStatus.PENDING_VERIFICATION ||
                sale.status == OrderStatus.PAYMENT_VERIFIED ||
                sale.status == OrderStatus.PROCESSING ||
                sale.status == OrderStatus.DISPATCHED ||
                sale.status == OrderStatus.IN_TRANSIT
            )
        }.sumOf { it.totalProfit }
    }

    fun getWithdrawnProfit(userId: String = currentUserId()): Double {
        return _withdrawals.value.filter { it.userId == userId && it.status == WithdrawalStatus.PAID }
            .sumOf { it.amount }
    }

    fun getAvailableBalance(userId: String = currentUserId()): Double {
        val realizedProfit = getRealizedProfit(userId)
        val lockedOrPaidWithdrawals = _withdrawals.value
            .filter { it.userId == userId && it.status != WithdrawalStatus.REJECTED }
            .sumOf { it.amount }
        return (realizedProfit - lockedOrPaidWithdrawals).coerceAtLeast(0.0)
    }

    fun getWalletLedger(userId: String = currentUserId()): WalletLedger {
        return WalletLedger(
            realizedProfit = getRealizedProfit(userId),
            pendingProfit = getPendingProfit(userId),
            withdrawnProfit = getWithdrawnProfit(userId),
            availableBalance = getAvailableBalance(userId)
        )
    }

    fun getRankProgress(userId: String = currentUserId()): RankProgress {
        val salesCount = getQualifyingSalesCount(userId)
        val communityCount = getQualifyingCommunityCount(userId)
        return RankEngine.calculateProgress(salesCount, communityCount)
    }

    // -------------------------------------------------------------
    // Actions: Record Sale, Request Withdrawal
    // -------------------------------------------------------------

    fun recordSale(
        userId: String = currentUserId(),
        product: PartnerProduct,
        customerName: String,
        customerPhone: String,
        customerEmail: String = "",
        customerAddress: String,
        customerCity: String,
        quantity: Int,
        sellingPrice: Double,
        paymentScreenshotUrl: String? = null,
        paymentProofNotes: String? = null
    ): Result<ResellerSale> {
        if (sellingPrice < product.partnerPrice) {
            return Result.failure(IllegalArgumentException("Selling price cannot be below partner wholesale price (${product.formattedPartnerPrice})"))
        }

        val profitMargin = (sellingPrice - product.partnerPrice).coerceAtLeast(0.0)
        val saleId = "sale-${UUID.randomUUID()}"
        val now = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).format(Date())

        val authUser = getAuthUserSafe()
        val resolvedUserId = userId.ifBlank { authUser?.uid?.ifBlank { null } ?: "reseller-1" }
        val resolvedName = if (authUser?.displayName?.isNotBlank() == true) authUser.displayName!! else "Alex Khan"

        val newSale = ResellerSale(
            id = saleId,
            userId = resolvedUserId,
            resellerName = resolvedName,
            resellerReferralCode = "",
            resellerRank = "",
            productId = product.id,
            productName = product.name,
            productImage = product.imageUrl,
            productSpecs = product.specifications.entries.take(2).joinToString(" • ") { "${it.key}: ${it.value}" },
            customerName = customerName,
            customerPhone = customerPhone,
            customerEmail = customerEmail,
            customerAddress = customerAddress,
            customerCity = customerCity,
            paymentScreenshotUrl = paymentScreenshotUrl,
            paymentProofNotes = paymentProofNotes,
            quantity = quantity,
            retailPrice = product.retailPrice,
            partnerPrice = product.partnerPrice,
            sellingPrice = sellingPrice,
            profitMargin = profitMargin,
            currency = product.currency,
            status = OrderStatus.PENDING_VERIFICATION,
            isQualifying = false,
            createdAt = now
        )

        _resellerSales.value = listOf(newSale) + _resellerSales.value
        getFirestoreSafe()?.collection(FirebaseConfig.COLLECTION_SALES)?.document(newSale.id)?.set(newSale)
        return Result.success(newSale)
    }

    fun createWithdrawalRequest(
        userId: String = "",
        userName: String = "",
        userEmail: String = "",
        userPhone: String = "",
        amount: Double,
        payoutMethod: PaymentMethod
    ): Result<WithdrawalRequest> {
        val authUser = getAuthUserSafe()
        val resolvedUserId = userId.ifBlank { authUser?.uid?.ifBlank { null } ?: "reseller-1" }
        val resolvedName = if (userName.isNotBlank()) userName else (authUser?.displayName ?: "Sara Ahmed")
        val available = getAvailableBalance(resolvedUserId)

        if (amount < 500.0) {
            return Result.failure(IllegalArgumentException("Minimum withdrawal amount is PKR 500"))
        }

        if (amount > available) {
            return Result.failure(IllegalArgumentException("Requested amount exceeds available balance (PKR ${available.toInt()})"))
        }

        val withdrawalId = "wd-dta-${System.currentTimeMillis() % 100000}"
        val now = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).format(Date())

        val request = WithdrawalRequest(
            id = withdrawalId,
            userId = resolvedUserId,
            userName = resolvedName,
            userEmail = userEmail.ifBlank { authUser?.email ?: "sara@example.com" },
            userPhone = userPhone,
            amount = amount,
            payoutMethod = payoutMethod,
            status = WithdrawalStatus.PENDING,
            requestedAt = now
        )

        _withdrawals.value = listOf(request) + _withdrawals.value
        getFirestoreSafe()?.collection(FirebaseConfig.COLLECTION_WITHDRAWALS)?.document(request.id)?.set(request)
        return Result.success(request)
    }

    // -------------------------------------------------------------
    // Initial Seed Data matching official platform products
    // -------------------------------------------------------------

    private fun parsePartnerProduct(doc: DocumentSnapshot): PartnerProduct? {
        return try {
            PartnerProduct(
                id = doc.getString("id") ?: doc.id,
                name = doc.getString("name") ?: "",
                slug = doc.getString("slug") ?: "",
                category = doc.getString("category") ?: "",
                shortDescription = doc.getString("shortDescription") ?: "",
                description = doc.getString("description") ?: "",
                retailPrice = doc.getDouble("retailPrice") ?: 0.0,
                partnerPrice = doc.getDouble("partnerPrice") ?: 0.0,
                suggestedSellingPrice = doc.getDouble("suggestedSellingPrice") ?: 0.0,
                currency = doc.getString("currency") ?: "PKR",
                imageUrl = doc.getString("imageUrl") ?: "",
                inStock = doc.getBoolean("inStock") ?: true,
                stockCount = (doc.getLong("stockCount") ?: 50).toInt()
            )
        } catch (_: Exception) { null }
    }

    private fun parseResellerSale(doc: DocumentSnapshot): ResellerSale? {
        return try {
            ResellerSale(
                id = doc.getString("id") ?: doc.id,
                userId = doc.getString("userId") ?: "",
                resellerName = doc.getString("resellerName") ?: "",
                resellerReferralCode = doc.getString("resellerReferralCode") ?: "",
                resellerRank = doc.getString("resellerRank") ?: "Silver Partner",
                productId = doc.getString("productId") ?: "",
                productName = doc.getString("productName") ?: "",
                productImage = doc.getString("productImage") ?: "",
                productSpecs = doc.getString("productSpecs") ?: "",
                customerName = doc.getString("customerName") ?: "",
                customerPhone = doc.getString("customerPhone") ?: "",
                customerAddress = doc.getString("customerAddress") ?: "",
                customerCity = doc.getString("customerCity") ?: "",
                paymentScreenshotUrl = doc.getString("paymentScreenshotUrl"),
                paymentProofNotes = doc.getString("paymentProofNotes"),
                paymentMethod = doc.getString("paymentMethod") ?: "Bank Transfer",
                transactionReference = doc.getString("transactionReference"),
                quantity = (doc.getLong("quantity") ?: 1).toInt(),
                retailPrice = doc.getDouble("retailPrice") ?: 0.0,
                partnerPrice = doc.getDouble("partnerPrice") ?: 0.0,
                sellingPrice = doc.getDouble("sellingPrice") ?: 0.0,
                profitMargin = doc.getDouble("profitMargin") ?: 0.0,
                status = OrderStatus.fromString(doc.getString("status") ?: "pending_verification"),
                isQualifying = doc.getBoolean("isQualifying") ?: false,
                shippingCourier = doc.getString("shippingCourier"),
                trackingNumber = doc.getString("trackingNumber"),
                createdAt = doc.getString("createdAt") ?: ""
            )
        } catch (_: Exception) { null }
    }

    private fun parseWithdrawalRequest(doc: DocumentSnapshot): WithdrawalRequest? {
        return try {
            val payout = doc["payoutMethod"] as? Map<*, *>
            WithdrawalRequest(
                id = doc.getString("id") ?: doc.id,
                userId = doc.getString("userId") ?: "",
                userName = doc.getString("userName") ?: "",
                userEmail = doc.getString("userEmail") ?: "",
                userPhone = doc.getString("userPhone") ?: "",
                amount = doc.getDouble("amount") ?: 0.0,
                currency = doc.getString("currency") ?: "PKR",
                payoutMethod = PaymentMethod(
                    accountTitle = payout?.get("accountTitle") as? String ?: doc.getString("accountTitle") ?: "",
                    accountNumber = payout?.get("accountNumber") as? String ?: doc.getString("accountNumber") ?: "",
                    bankName = payout?.get("bankName") as? String ?: doc.getString("bankName") ?: ""
                ),
                status = WithdrawalStatus.fromString(doc.getString("status") ?: "pending"),
                transactionReference = doc.getString("transactionReference"),
                requestedAt = doc.getString("requestedAt") ?: ""
            )
        } catch (_: Exception) { null }
    }

    private fun parseMilestoneReward(doc: DocumentSnapshot): MilestoneReward? {
        return try {
            MilestoneReward(
                id = doc.getString("id") ?: doc.id,
                userId = doc.getString("userId") ?: "",
                rankSlug = doc.getString("rankSlug") ?: "",
                rankName = doc.getString("rankName") ?: "",
                amount = doc.getDouble("amount") ?: doc.getDouble("rewardAmount") ?: 0.0,
                currency = doc.getString("currency") ?: "PKR",
                status = RewardStatus.fromString(doc.getString("status") ?: "pending_review"),
                earnedAt = doc.getString("earnedAt") ?: doc.getString("unlockedAt") ?: "",
                adminNote = doc.getString("adminNote")
            )
        } catch (_: Exception) { null }
    }

    private fun parseTeamMember(doc: DocumentSnapshot): TeamMember? {
        return try {
            TeamMember(
                id = doc.getString("id") ?: doc.id,
                name = doc.getString("fullName") ?: doc.getString("name") ?: "",
                avatarUrl = doc.getString("avatarUrl"),
                joinDate = doc.getString("createdAt")?.take(10) ?: "Recently",
                isActive = doc.getBoolean("isActive") ?: true,
                isQualifying = doc.getBoolean("isQualifying") ?: true,
                rankName = doc.getString("rankName") ?: "Silver Partner"
            )
        } catch (_: Exception) { null }
    }
}
