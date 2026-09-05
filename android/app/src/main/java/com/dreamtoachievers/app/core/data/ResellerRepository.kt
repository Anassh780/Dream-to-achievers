package com.dreamtoachievers.app.core.data

import com.dreamtoachievers.app.core.firebase.FirebaseConfig
import com.dreamtoachievers.app.core.model.*
import com.google.firebase.firestore.DocumentSnapshot
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.text.SimpleDateFormat
import java.util.*

class ResellerRepository(
    private val dataStoreManager: DataStoreManager? = null
) {
    // Referral & Identity info
    val currentReferralCode = "DTA-ALEX91"
    val currentReferralLink = "https://dreamtoachievers.com/?ref=DTA-ALEX91"
    val joiningDate = "15 Jan 2025"

    private fun getFirestoreSafe(): FirebaseFirestore? {
        return try {
            FirebaseFirestore.getInstance()
        } catch (_: Exception) {
            null
        }
    }

    // 1. Partner Wholesale Catalog
    private val _partnerProducts = MutableStateFlow<List<PartnerProduct>>(createInitialPartnerProducts())
    val partnerProducts: StateFlow<List<PartnerProduct>> = _partnerProducts.asStateFlow()

    // 2. Reseller Sales Ledger
    private val _resellerSales = MutableStateFlow<List<ResellerSale>>(createInitialResellerSales())
    val resellerSales: StateFlow<List<ResellerSale>> = _resellerSales.asStateFlow()

    // 3. Reseller Withdrawals
    private val _withdrawals = MutableStateFlow<List<WithdrawalRequest>>(createInitialWithdrawals())
    val withdrawals: StateFlow<List<WithdrawalRequest>> = _withdrawals.asStateFlow()

    // 4. Milestone Rewards
    private val _milestoneRewards = MutableStateFlow<List<MilestoneReward>>(createInitialRewards())
    val milestoneRewards: StateFlow<List<MilestoneReward>> = _milestoneRewards.asStateFlow()

    // 5. Community Members & Team
    private val _teamMembers = MutableStateFlow<List<TeamMember>>(createInitialTeamMembers())
    val teamMembers: StateFlow<List<TeamMember>> = _teamMembers.asStateFlow()
    val communityMembers: StateFlow<List<TeamMember>> get() = teamMembers

    // 6. Network Overview Analytics
    private val _networkAnalytics = MutableStateFlow(NetworkAnalytics())
    val networkAnalytics: StateFlow<NetworkAnalytics> = _networkAnalytics.asStateFlow()

    init {
        initFirestoreSync()
    }

    private fun initFirestoreSync() {
        val fs = getFirestoreSafe() ?: return

        fs.collection(FirebaseConfig.COLLECTION_PRODUCTS)
            .addSnapshotListener { snap, err ->
                if (err != null || snap == null) return@addSnapshotListener
                val list = snap.documents.mapNotNull { parsePartnerProduct(it) }
                if (list.isNotEmpty()) _partnerProducts.value = list
            }

        fs.collection(FirebaseConfig.COLLECTION_SALES)
            .orderBy("createdAt", Query.Direction.DESCENDING)
            .addSnapshotListener { snap, err ->
                if (err != null || snap == null) return@addSnapshotListener
                val list = snap.documents.mapNotNull { parseResellerSale(it) }
                if (list.isNotEmpty()) _resellerSales.value = list
            }

        fs.collection("withdrawals")
            .orderBy("requestedAt", Query.Direction.DESCENDING)
            .addSnapshotListener { snap, err ->
                if (err != null || snap == null) return@addSnapshotListener
                val list = snap.documents.mapNotNull { parseWithdrawalRequest(it) }
                if (list.isNotEmpty()) _withdrawals.value = list
            }

        fs.collection("rewards")
            .addSnapshotListener { snap, err ->
                if (err != null || snap == null) return@addSnapshotListener
                val list = snap.documents.mapNotNull { parseMilestoneReward(it) }
                if (list.isNotEmpty()) _milestoneRewards.value = list
            }

        fs.collection(FirebaseConfig.COLLECTION_USERS)
            .addSnapshotListener { snap, err ->
                if (err != null || snap == null) return@addSnapshotListener
                val list = snap.documents.mapNotNull { parseTeamMember(it) }
                if (list.isNotEmpty()) _teamMembers.value = list
            }
    }

    // -------------------------------------------------------------
    // Query Helpers
    // -------------------------------------------------------------

    fun getOrderById(orderId: String): ResellerSale? {
        return _resellerSales.value.firstOrNull { it.id.equals(orderId, ignoreCase = true) }
    }

    // -------------------------------------------------------------
    // Wallet Calculations (Mirroring src/services/salesService.ts)
    // -------------------------------------------------------------

    fun getQualifyingSalesCount(userId: String = "reseller-1"): Int {
        return _resellerSales.value.filter { sale ->
            sale.userId == userId && (
                sale.isQualifying ||
                sale.status == OrderStatus.DELIVERED ||
                sale.status == OrderStatus.CONFIRMED ||
                sale.status == OrderStatus.FULFILLED
            )
        }.size
    }

    fun getQualifyingCommunityCount(userId: String = "reseller-1"): Int {
        return _teamMembers.value.filter { it.isActive && it.isQualifying }.size
    }

    fun getMyTeamMembers(resellerId: String = "reseller-1"): List<TeamMember> {
        return _teamMembers.value
    }

    fun getRealizedProfit(userId: String = "reseller-1"): Double {
        return _resellerSales.value.filter { sale ->
            sale.userId == userId && (
                sale.status == OrderStatus.DELIVERED ||
                sale.status == OrderStatus.CONFIRMED ||
                sale.status == OrderStatus.FULFILLED ||
                sale.isQualifying
            )
        }.sumOf { it.totalProfit }
    }

    fun getPendingProfit(userId: String = "reseller-1"): Double {
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

    fun getWithdrawnProfit(userId: String = "reseller-1"): Double {
        return _withdrawals.value.filter { it.userId == userId && it.status == WithdrawalStatus.PAID }
            .sumOf { it.amount }
    }

    fun getAvailableBalance(userId: String = "reseller-1"): Double {
        val realizedProfit = getRealizedProfit(userId)
        val lockedOrPaidWithdrawals = _withdrawals.value
            .filter { it.userId == userId && it.status != WithdrawalStatus.REJECTED }
            .sumOf { it.amount }
        return (realizedProfit - lockedOrPaidWithdrawals).coerceAtLeast(0.0)
    }

    fun getWalletLedger(userId: String = "reseller-1"): WalletLedger {
        return WalletLedger(
            realizedProfit = getRealizedProfit(userId),
            pendingProfit = getPendingProfit(userId),
            withdrawnProfit = getWithdrawnProfit(userId),
            availableBalance = getAvailableBalance(userId)
        )
    }

    fun getRankProgress(userId: String = "reseller-1"): RankProgress {
        val salesCount = getQualifyingSalesCount(userId)
        val communityCount = getQualifyingCommunityCount(userId)
        return RankEngine.calculateProgress(salesCount, communityCount)
    }

    // -------------------------------------------------------------
    // Actions: Record Sale, Request Withdrawal
    // -------------------------------------------------------------

    fun recordSale(
        userId: String = "reseller-1",
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
        val saleId = "DS${1000 + (_resellerSales.value.size + 10)}"
        val now = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).format(Date())

        val newSale = ResellerSale(
            id = saleId,
            userId = userId,
            resellerName = "Ali Khan",
            resellerReferralCode = currentReferralCode,
            resellerRank = "Silver Partner",
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
        return Result.success(newSale)
    }

    fun createWithdrawalRequest(
        userId: String = "reseller-1",
        userName: String = "Ali Khan",
        userEmail: String = "partner@dreamtoachievers.com",
        userPhone: String = "+92 300 1234567",
        amount: Double,
        payoutMethod: PaymentMethod
    ): Result<WithdrawalRequest> {
        val available = getAvailableBalance(userId)

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
            userId = userId,
            userName = userName,
            userEmail = userEmail,
            userPhone = userPhone,
            amount = amount,
            currency = "PKR",
            payoutMethod = payoutMethod,
            status = WithdrawalStatus.PENDING,
            requestedAt = now
        )

        _withdrawals.value = listOf(request) + _withdrawals.value
        return Result.success(request)
    }

    // -------------------------------------------------------------
    // Initial Seed Data matching official platform products
    // -------------------------------------------------------------

    private fun createInitialPartnerProducts(): List<PartnerProduct> {
        return listOf(
            PartnerProduct(
                id = "prod-nike-air",
                name = "Nike Air Max Sneakers",
                slug = "nike-air-max",
                category = "Executive Footwear",
                shortDescription = "Premium lightweight breathable athletic sneakers with air cushioning.",
                retailPrice = 8999.0,
                partnerPrice = 6499.0,
                suggestedSellingPrice = 8999.0,
                imageUrl = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
                inStock = true,
                stockCount = 42,
                rating = 4.9,
                specifications = mapOf(
                    "Size" to "42",
                    "Color" to "Black/White",
                    "Material" to "Breathable Mesh & Air Sole"
                )
            ),
            PartnerProduct(
                id = "prod-dta-5328",
                name = "Libas-e-Yousaf Executive Fabric",
                slug = "libas-e-yousaf",
                category = "Executive Gift Sets",
                shortDescription = "Pure premium Egyptian blended unstitched executive fabric with official cuff buttons.",
                retailPrice = 4500.0,
                partnerPrice = 3500.0,
                suggestedSellingPrice = 4500.0,
                imageUrl = "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80",
                inStock = true,
                stockCount = 85,
                rating = 4.9,
                specifications = mapOf(
                    "Fabric" to "Egyptian Blended Luxury",
                    "Length" to "4.5 Meters Standard Suit",
                    "Packaging" to "Executive Hardbox with Badges"
                )
            ),
            PartnerProduct(
                id = "prod-dta-6004",
                name = "Max 1150 Ultra AMOLED Smartwatch",
                slug = "max-1150",
                category = "Smartwatches & Fitness",
                shortDescription = "2.02-inch AMOLED Display, Stainless Steel Bezel, Dual Straps, Bluetooth Calling.",
                retailPrice = 3800.0,
                partnerPrice = 2800.0,
                suggestedSellingPrice = 3800.0,
                imageUrl = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
                inStock = true,
                stockCount = 120,
                rating = 4.8,
                specifications = mapOf(
                    "Display" to "2.02 AMOLED 60Hz",
                    "Battery" to "5 to 7 Days Backup",
                    "Straps" to "Alpine Loop + Ocean Band"
                )
            ),
            PartnerProduct(
                id = "prod-dta-7102",
                name = "Executive Signature Pen & Leather Wallet Set",
                slug = "signature-pen-wallet",
                category = "Executive Gift Sets",
                shortDescription = "Top-grain genuine cowhide bifold wallet coupled with a heavy brass rollerball pen.",
                retailPrice = 2600.0,
                partnerPrice = 1800.0,
                suggestedSellingPrice = 2600.0,
                imageUrl = "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80",
                inStock = true,
                stockCount = 64,
                rating = 4.9,
                specifications = mapOf(
                    "Leather" to "Full Grain Top Layer",
                    "Pen Cartridge" to "German 0.5mm Schmidt Rollerball",
                    "Slots" to "8 Card Slots + Dual Cash Compartments"
                )
            )
        )
    }

    private fun createInitialResellerSales(): List<ResellerSale> {
        return listOf(
            ResellerSale(
                id = "sale-dta-9102",
                userId = "reseller-1",
                resellerName = "Ali Khan",
                resellerReferralCode = "DTA-ALEX91",
                resellerRank = "Silver Partner",
                productId = "prod-dta-5328",
                productName = "Libas-e-Yousaf Executive Fabric",
                customerName = "Bilal Ahmed",
                quantity = 1,
                retailPrice = 5000.0,
                partnerPrice = 3000.0,
                sellingPrice = 5000.0,
                profitMargin = 2000.0,
                status = OrderStatus.DELIVERED,
                isQualifying = true,
                createdAt = "2026-03-01T10:00:00Z"
            ),
            ResellerSale(
                id = "sale-dta-9088",
                userId = "reseller-1",
                resellerName = "Ali Khan",
                resellerReferralCode = "DTA-ALEX91",
                resellerRank = "Silver Partner",
                productId = "prod-dta-6004",
                productName = "Max 1150 Ultra AMOLED Smartwatch",
                customerName = "Zainab Tariq",
                quantity = 1,
                retailPrice = 4500.0,
                partnerPrice = 3500.0,
                sellingPrice = 4500.0,
                profitMargin = 1000.0,
                status = OrderStatus.DELIVERED,
                isQualifying = true,
                createdAt = "2026-03-02T10:00:00Z"
            ),
            ResellerSale(
                id = "sale-dta-9071",
                userId = "reseller-1",
                resellerName = "Ali Khan",
                resellerReferralCode = "DTA-ALEX91",
                resellerRank = "Silver Partner",
                productId = "prod-dta-7102",
                productName = "Executive Signature Pen & Leather Wallet Set",
                customerName = "Fatima Noor",
                quantity = 1,
                retailPrice = 5400.0,
                partnerPrice = 3000.0,
                sellingPrice = 5400.0,
                profitMargin = 2400.0,
                status = OrderStatus.DISPATCHED,
                isQualifying = false,
                createdAt = "2026-03-03T10:00:00Z"
            ),
            ResellerSale(
                id = "sale-dta-9055",
                userId = "reseller-1",
                resellerName = "Ali Khan",
                resellerReferralCode = "DTA-ALEX91",
                resellerRank = "Silver Partner",
                productId = "prod-nike-air",
                productName = "Nike Air Max Sneakers",
                customerName = "Muhammad Usman",
                quantity = 1,
                retailPrice = 3500.0,
                partnerPrice = 2750.0,
                sellingPrice = 3500.0,
                profitMargin = 750.0,
                status = OrderStatus.PENDING_VERIFICATION,
                isQualifying = false,
                createdAt = "2026-03-04T10:00:00Z"
            ),
            // Matches Screen 07: #DS1007 Processing with Nike Air Max
            ResellerSale(
                id = "DS1007",
                userId = "reseller-2",
                resellerName = "Hamza Malik",
                resellerReferralCode = "DTA-HAMZA22",
                resellerRank = "Silver Partner",
                productId = "prod-nike-air",
                productName = "Nike Air Max Sneakers",
                productImage = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
                productSpecs = "Size 42 • Black/White",
                customerName = "Muhammad Usman",
                customerPhone = "+92 321 9876543",
                customerAddress = "House 14B, Street 3, F-8/2",
                customerCity = "Islamabad",
                paymentScreenshotUrl = "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80",
                paymentProofNotes = "Paid via Meezan Bank mobile transfer",
                paymentMethod = "Bank Transfer (Meezan Bank)",
                transactionReference = "MB-TRX-9821443",
                quantity = 2,
                retailPrice = 8999.0,
                partnerPrice = 6499.0,
                sellingPrice = 8999.0,
                profitMargin = 2500.0,
                status = OrderStatus.PROCESSING,
                isQualifying = false,
                shippingCourier = "TCS",
                trackingNumber = "TCS123456789",
                createdAt = "2026-03-04T10:15:00Z",
                confirmedAt = "2026-03-04T11:00:00Z",
                processingAt = "2026-03-04T12:30:00Z"
            ),
            // Matches Screen 08: #DS1008 Pending Review with Libas-e-Yousaf
            ResellerSale(
                id = "DS1008",
                userId = "reseller-2",
                resellerName = "Hamza Malik",
                resellerReferralCode = "DTA-HAMZA22",
                resellerRank = "Silver Partner",
                productId = "prod-dta-5328",
                productName = "Libas-e-Yousaf Executive Fabric",
                productImage = "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80",
                productSpecs = "Egyptian Blended • 4.5 Meters",
                customerName = "Bilal Ahmed",
                customerPhone = "+92 301 2345678",
                customerAddress = "Plot 89, Phase 6, DHA",
                customerCity = "Karachi",
                paymentScreenshotUrl = "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80",
                paymentProofNotes = "EasyPaisa TRX 887123",
                paymentMethod = "EasyPaisa Mobile Account",
                transactionReference = "EP-TXN-887123",
                quantity = 2,
                retailPrice = 4500.0,
                partnerPrice = 3500.0,
                sellingPrice = 4500.0,
                profitMargin = 1000.0,
                status = OrderStatus.PENDING_VERIFICATION,
                isQualifying = false,
                createdAt = "2026-03-05T09:12:00Z"
            ),
            ResellerSale(
                id = "DS1006",
                userId = "reseller-2",
                resellerName = "Hamza Malik",
                resellerReferralCode = "DTA-ALEX91",
                resellerRank = "Silver Partner",
                productId = "prod-dta-6004",
                productName = "Max 1150 Ultra AMOLED Smartwatch",
                productImage = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
                productSpecs = "2.02 AMOLED • Ocean Band",
                customerName = "Zainab Tariq",
                customerPhone = "+92 333 4567890",
                customerAddress = "Flat 402, Al-Razi Heights, Gulberg III",
                customerCity = "Lahore",
                paymentScreenshotUrl = "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80",
                paymentProofNotes = "JazzCash TRX 441029",
                paymentMethod = "JazzCash Mobile Account",
                transactionReference = "JC-TXN-441029",
                quantity = 1,
                retailPrice = 3800.0,
                partnerPrice = 2800.0,
                sellingPrice = 3800.0,
                profitMargin = 1000.0,
                status = OrderStatus.DELIVERED,
                isQualifying = true,
                shippingCourier = "Trax",
                trackingNumber = "TRX9981245",
                createdAt = "2026-03-02T10:15:00Z",
                confirmedAt = "2026-03-02T11:00:00Z",
                processingAt = "2026-03-02T14:00:00Z",
                dispatchedAt = "2026-03-03T09:00:00Z",
                inTransitAt = "2026-03-03T18:00:00Z",
                deliveredAt = "2026-03-04T12:30:00Z"
            ),
            ResellerSale(
                id = "DS1005",
                userId = "reseller-2",
                resellerName = "Hamza Malik",
                resellerReferralCode = "DTA-ALEX91",
                resellerRank = "Silver Partner",
                productId = "prod-dta-7102",
                productName = "Executive Signature Pen & Leather Wallet Set",
                productImage = "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80",
                productSpecs = "Full Grain Cowhide • Schmidt Rollerball",
                customerName = "Fatima Noor",
                customerPhone = "+92 345 8765432",
                customerAddress = "House 22, Sector B, Bahria Town",
                customerCity = "Rawalpindi",
                paymentScreenshotUrl = "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80",
                paymentProofNotes = "Bank Transfer",
                quantity = 1,
                retailPrice = 2600.0,
                partnerPrice = 1800.0,
                sellingPrice = 2600.0,
                profitMargin = 800.0,
                status = OrderStatus.DISPATCHED,
                isQualifying = false,
                shippingCourier = "Leopard",
                trackingNumber = "LEO5561230",
                createdAt = "2026-03-03T11:00:00Z",
                dispatchedAt = "2026-03-04T08:30:00Z"
            ),
            ResellerSale(
                id = "DS1004",
                userId = "reseller-1",
                resellerName = "Ali Khan",
                resellerReferralCode = "DTA-ALEX91",
                resellerRank = "Silver Partner",
                productId = "prod-dta-5328",
                productName = "Libas-e-Yousaf Executive Fabric",
                customerName = "Tariq Mehmood",
                customerPhone = "+92 300 5544332",
                customerAddress = "Civil Lines, Sialkot",
                customerCity = "Sialkot",
                quantity = 1,
                retailPrice = 4500.0,
                partnerPrice = 3500.0,
                sellingPrice = 4500.0,
                profitMargin = 1000.0,
                status = OrderStatus.REJECTED,
                rejectionReason = "Unreadable / Incomplete Payment Slip",
                adminReviewNote = "Payment receipt cut off, unable to verify transaction ID.",
                createdAt = "2026-03-01T15:00:00Z"
            )
        )
    }

    private fun createInitialWithdrawals(): List<WithdrawalRequest> {
        return listOf(
            WithdrawalRequest(
                id = "wd-dta-1002",
                userId = "reseller-1",
                userName = "Ali Khan",
                userEmail = "partner@dreamtoachievers.com",
                userPhone = "+92 300 1234567",
                amount = 2000.0,
                currency = "PKR",
                payoutMethod = PaymentMethod(
                    id = "pm-ep-1",
                    methodType = PaymentMethodType.EASYPAISA,
                    accountTitle = "Ali Khan",
                    accountNumber = "03001234567",
                    bankName = "EasyPaisa Mobile Account",
                    isDefault = true
                ),
                status = WithdrawalStatus.PAID,
                transactionReference = "EP-TXN-887123",
                requestedAt = "2026-02-28T10:00:00Z",
                processedAt = "2026-02-28T14:30:00Z"
            )
        )
    }

    private fun createInitialRewards(): List<MilestoneReward> {
        return listOf(
            MilestoneReward(
                id = "rew-silver-01",
                userId = "reseller-1",
                rankSlug = "silver",
                rankName = "Silver Rank",
                amount = 2000.0,
                currency = "PKR",
                status = RewardStatus.APPROVED,
                earnedAt = "2026-02-25T18:00:00Z",
                adminNote = "Approved Silver Rank achievement bonus."
            )
        )
    }

    private fun createInitialTeamMembers(): List<TeamMember> {
        return listOf(
            TeamMember(id = "tm-1", name = "Hamza Malik", joinDate = "12 Feb 2026", isActive = true, isQualifying = true, rankName = "Silver Partner"),
            TeamMember(id = "tm-2", name = "Sana Sheikh", joinDate = "18 Feb 2026", isActive = true, isQualifying = true, rankName = "Partner Member"),
            TeamMember(id = "tm-3", name = "Omar Farooq", joinDate = "22 Feb 2026", isActive = true, isQualifying = true, rankName = "Silver Partner"),
            TeamMember(id = "tm-4", name = "Ayesha Siddiqui", joinDate = "25 Feb 2026", isActive = true, isQualifying = false, rankName = "Partner Member"),
            TeamMember(id = "tm-5", name = "Hassan Raza", joinDate = "01 Mar 2026", isActive = true, isQualifying = true, rankName = "Platinum Partner"),
            TeamMember(id = "tm-6", name = "Mariam Javed", joinDate = "02 Mar 2026", isActive = false, isQualifying = false, rankName = "Partner Member"),
            TeamMember(id = "tm-7", name = "Kashif Ali", joinDate = "03 Mar 2026", isActive = true, isQualifying = true, rankName = "Silver Partner"),
            TeamMember(id = "tm-8", name = "Zahra Batool", joinDate = "04 Mar 2026", isActive = true, isQualifying = false, rankName = "Partner Member")
        )
    }

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
            WithdrawalRequest(
                id = doc.getString("id") ?: doc.id,
                userId = doc.getString("userId") ?: "",
                userName = doc.getString("userName") ?: "",
                userEmail = doc.getString("userEmail") ?: "",
                userPhone = doc.getString("userPhone") ?: "",
                amount = doc.getDouble("amount") ?: 0.0,
                currency = doc.getString("currency") ?: "PKR",
                payoutMethod = PaymentMethod(
                    accountTitle = doc.getString("accountTitle") ?: "",
                    accountNumber = doc.getString("accountNumber") ?: "",
                    bankName = doc.getString("bankName") ?: ""
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
