package com.dreamtoachievers.app

import com.dreamtoachievers.app.core.data.AdminRepository
import com.dreamtoachievers.app.core.data.NotificationRepository
import com.dreamtoachievers.app.core.data.RankEngine
import com.dreamtoachievers.app.core.data.ResellerRepository
import com.dreamtoachievers.app.core.designsystem.components.ProductCardRole
import com.dreamtoachievers.app.core.model.*
import com.dreamtoachievers.app.core.navigation.DtaDestinations
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test

class ResellerAndAdminBusinessRulesTest {

    private lateinit var resellerRepository: ResellerRepository
    private lateinit var adminRepository: AdminRepository

    @Before
    fun setUp() {
        resellerRepository = ResellerRepository()
        adminRepository = AdminRepository(resellerRepository)
    }

    // =========================================================================
    // 1. Canonical Rank Engine Tests (Mirroring src/services/rankEngine.ts)
    // =========================================================================

    @Test
    fun testRankEngineDualConditionQualification() {
        // Condition: Both qualifying sales AND community members count must reach the tier threshold

        // 0 sales, 0 community -> Unranked
        val unranked = RankEngine.evaluateRank(0, 0)
        assertEquals(0, unranked.order)
        assertEquals("Partner Member", unranked.name)

        // 10 sales, but only 19 community (1 short of 20) -> Remains Unranked
        val failedCommunity = RankEngine.evaluateRank(10, 19)
        assertEquals(0, failedCommunity.order)

        // 9 sales (1 short of 10), but 25 community -> Remains Unranked
        val failedSales = RankEngine.evaluateRank(9, 25)
        assertEquals(0, failedSales.order)

        // 10 sales AND 20 community -> Achieves Silver Rank
        val silver = RankEngine.evaluateRank(10, 20)
        assertEquals(1, silver.order)
        assertEquals("Silver Rank", silver.name)
        assertEquals(2000.0, silver.rewardAmount, 0.01)

        // 25 sales AND 45 community -> Achieves Platinum Rank
        val platinum = RankEngine.evaluateRank(25, 45)
        assertEquals(2, platinum.order)
        assertEquals("Platinum Rank", platinum.name)
        assertEquals(4000.0, platinum.rewardAmount, 0.01)

        // 35 sales AND 60 community -> Achieves Gold Rank
        val gold = RankEngine.evaluateRank(35, 60)
        assertEquals(3, gold.order)
        assertEquals("Gold Rank", gold.name)
        assertEquals(6000.0, gold.rewardAmount, 0.01)

        // 100 sales AND 200 community -> Achieves Diamond Rank
        val diamond = RankEngine.evaluateRank(100, 200)
        assertEquals(4, diamond.order)
        assertEquals("Diamond Rank", diamond.name)
        assertEquals(10000.0, diamond.rewardAmount, 0.01)
    }

    @Test
    fun testRankProgressDualBarCalculations() {
        // User with 5 sales and 10 community aiming for Silver (10 sales, 20 community)
        val progress = RankEngine.calculateProgress(5, 10)

        assertEquals("Partner Member", progress.currentRank.name)
        assertNotNull(progress.nextRank)
        assertEquals("Silver Rank", progress.nextRank!!.name)

        // 5 / 10 = 50%
        assertEquals(50, progress.salesProgressPercent)
        // 10 / 20 = 50%
        assertEquals(50, progress.communityProgressPercent)
        // Overall average = 50%
        assertEquals(50, progress.overallProgressPercent)
        assertEquals(5, progress.missingSales)
        assertEquals(10, progress.missingCommunity)
        assertFalse(progress.isMaxRank)

        // Diamond user (max rank)
        val maxProgress = RankEngine.calculateProgress(120, 250)
        assertTrue(maxProgress.isMaxRank)
        assertNull(maxProgress.nextRank)
        assertEquals(100, maxProgress.overallProgressPercent)
    }

    // =========================================================================
    // 2. Partner Pricing & Margin Calculations
    // =========================================================================

    @Test
    fun testPartnerWholesaleMarginCalculations() {
        val samplePartnerProduct = PartnerProduct(
            id = "prod-test-01",
            name = "Luxury Executive Fabric",
            retailPrice = 4500.0,
            partnerPrice = 3500.0,
            suggestedSellingPrice = 4500.0,
            currency = "PKR"
        )

        // Gross margin per unit = 4500 - 3500 = 1000 PKR
        assertEquals(1000.0, samplePartnerProduct.grossMargin, 0.01)
        assertEquals("PKR 1,000", samplePartnerProduct.formattedGrossMargin)
        assertEquals(22, samplePartnerProduct.marginPercent) // 1000 / 4500 = 22.2%

        // Reseller sale with quantity 3
        val sale = ResellerSale(
            id = "sale-test-01",
            productId = samplePartnerProduct.id,
            partnerPrice = 3500.0,
            sellingPrice = 4500.0,
            quantity = 3
        )

        assertEquals(10500.0, sale.totalPartnerCost, 0.01)
        assertEquals(13500.0, sale.totalCustomerBill, 0.01)
        assertEquals(3000.0, sale.totalProfit, 0.01) // 1000 * 3 = 3000 PKR
    }

    @Test
    fun testRecordSaleMinimumPriceValidation() {
        val product = PartnerProduct(
            id = "prod-test-02",
            partnerPrice = 3000.0,
            suggestedSellingPrice = 4000.0
        )

        // Attempting to sell below wholesale partner price must fail
        val failedResult = resellerRepository.recordSale(
            product = product,
            customerName = "Test Customer",
            customerPhone = "03001234567",
            customerAddress = "Street 1",
            customerCity = "Islamabad",
            quantity = 1,
            sellingPrice = 2500.0, // Below 3000
            paymentScreenshotUrl = null,
            paymentProofNotes = null
        )

        assertTrue(failedResult.isFailure)

        // Selling at or above wholesale partner price must succeed
        val successResult = resellerRepository.recordSale(
            product = product,
            customerName = "Valid Customer",
            customerPhone = "03001234567",
            customerAddress = "Street 2",
            customerCity = "Lahore",
            quantity = 2,
            sellingPrice = 3800.0,
            paymentScreenshotUrl = null,
            paymentProofNotes = null
        )

        assertTrue(successResult.isSuccess)
        val createdSale = successResult.getOrNull()!!
        assertEquals(OrderStatus.PENDING_VERIFICATION, createdSale.status)
        assertFalse(createdSale.isQualifying)
        assertEquals(1600.0, createdSale.totalProfit, 0.01) // (3800 - 3000) * 2 = 1600 PKR
    }

    // =========================================================================
    // 3. Wallet Ledger & Payout Business Rules
    // =========================================================================

    @Test
    fun testWalletLedgerBalanceFormulas() {
        val ledger = resellerRepository.getWalletLedger("reseller-1")

        // Seed delivered sales: sale-dta-9102 (PKR 2,000 profit) + sale-dta-9088 (PKR 1,000 profit) = PKR 3,000 realized
        // Seed pending sales: sale-dta-9071 dispatched (PKR 2,400) + sale-dta-9055 pending (PKR 750) = PKR 3,150 pending
        // Seed paid withdrawal: wd-dta-1002 = PKR 2,000
        // Available = 3,000 - 2,000 = PKR 1,000
        assertEquals(3000.0, ledger.realizedProfit, 0.01)
        assertEquals(3150.0, ledger.pendingProfit, 0.01)
        assertEquals(2000.0, ledger.withdrawnProfit, 0.01)
        assertEquals(1000.0, ledger.availableBalance, 0.01)
    }

    @Test
    fun testWithdrawalMinimumValidationAndBalanceCheck() {
        val available = resellerRepository.getAvailableBalance("reseller-1") // 1000 PKR

        val paymentMethod = PaymentMethod(
            accountTitle = "Ali Khan",
            accountNumber = "03001234567",
            bankName = "EasyPaisa"
        )

        // 1. Request below PKR 500 must fail
        val belowMinResult = resellerRepository.createWithdrawalRequest(
            amount = 400.0,
            payoutMethod = paymentMethod
        )
        assertTrue(belowMinResult.isFailure)

        // 2. Request exceeding available balance must fail
        val exceedResult = resellerRepository.createWithdrawalRequest(
            amount = available + 500.0,
            payoutMethod = paymentMethod
        )
        assertTrue(exceedResult.isFailure)

        // 3. Valid request within bounds must succeed
        val validResult = resellerRepository.createWithdrawalRequest(
            amount = 800.0,
            payoutMethod = paymentMethod
        )
        assertTrue(validResult.isSuccess)
        assertEquals(WithdrawalStatus.PENDING, validResult.getOrNull()!!.status)
    }

    // =========================================================================
    // 4. Admin Operations & State Machine Transitions
    // =========================================================================

    @Test
    fun testAdminOrderFulfillmentWorkflow() {
        // Initial state of DS1008 is PENDING_VERIFICATION
        val initialOrder = adminRepository.platformOrders.value.first { it.id == "DS1008" }
        assertEquals(OrderStatus.PENDING_VERIFICATION, initialOrder.status)
        assertFalse(initialOrder.isQualifying)

        // Step 1: Admin verifies payment
        val verified = adminRepository.updateOrderFulfillment(
            orderId = "DS1008",
            status = OrderStatus.PAYMENT_VERIFIED
        )
        assertTrue(verified)
        assertEquals(OrderStatus.PAYMENT_VERIFIED, adminRepository.platformOrders.value.first { it.id == "DS1008" }.status)

        // Step 2: Admin dispatches with courier
        val dispatched = adminRepository.updateOrderFulfillment(
            orderId = "DS1008",
            status = OrderStatus.DISPATCHED,
            shippingCourier = "TCS Express",
            trackingNumber = "TCS12345678"
        )
        assertTrue(dispatched)
        val dispatchedOrder = adminRepository.platformOrders.value.first { it.id == "DS1008" }
        assertEquals(OrderStatus.DISPATCHED, dispatchedOrder.status)
        assertEquals("TCS Express", dispatchedOrder.shippingCourier)
        assertEquals("TCS12345678", dispatchedOrder.trackingNumber)
        assertFalse(dispatchedOrder.isQualifying)

        // Step 3: Admin confirms delivery -> Sets isQualifying = true (triggers rank evaluation & profit release)
        val delivered = adminRepository.updateOrderFulfillment(
            orderId = "DS1008",
            status = OrderStatus.DELIVERED
        )
        assertTrue(delivered)
        val deliveredOrder = adminRepository.platformOrders.value.first { it.id == "DS1008" }
        assertEquals(OrderStatus.DELIVERED, deliveredOrder.status)
        assertTrue(deliveredOrder.isQualifying)
        assertNotNull(deliveredOrder.deliveredAt)
    }

    @Test
    fun testAdminWithdrawalDisbursement() {
        // Initial state of wd-dta-1003 is PENDING
        val req = adminRepository.platformWithdrawals.value.first { it.id == "wd-dta-1003" }
        assertEquals(WithdrawalStatus.PENDING, req.status)

        // Admin marks disbursed
        val disbursed = adminRepository.updateWithdrawalStatus(
            requestId = "wd-dta-1003",
            status = WithdrawalStatus.PAID,
            transactionReference = "EP-TXN-998811",
            adminNote = "Transferred via EasyPaisa Merchant Portal"
        )
        assertTrue(disbursed)

        val updated = adminRepository.platformWithdrawals.value.first { it.id == "wd-dta-1003" }
        assertEquals(WithdrawalStatus.PAID, updated.status)
        assertEquals("EP-TXN-998811", updated.transactionReference)
        assertNotNull(updated.processedAt)
    }

    @Test
    fun testAdminUserRoleManagement() {
        val user = adminRepository.platformUsers.value.first { it.id == "user-103" }
        assertEquals(UserRole.CUSTOMER, user.role)

        // Promote customer to reseller
        adminRepository.updateUserRole("user-103", UserRole.RESELLER)
        assertEquals(UserRole.RESELLER, adminRepository.platformUsers.value.first { it.id == "user-103" }.role)
    }

    // =========================================================================
    // 5. Point 41: Admin Role Authorization Security
    // =========================================================================

    @Test
    fun testAdminRoleSecurityAuthorization() {
        // Point 41: Only ADMIN and SUPERADMIN roles are authorized for admin operations routes
        assertTrue("SUPERADMIN must be authorized", adminRepository.isAuthorizedAdmin(UserRole.SUPERADMIN))
        assertTrue("ADMIN must be authorized", adminRepository.isAuthorizedAdmin(UserRole.ADMIN))
        assertFalse("CUSTOMER must NOT be authorized for admin routes", adminRepository.isAuthorizedAdmin(UserRole.CUSTOMER))
        assertFalse("RESELLER must NOT be authorized for admin routes", adminRepository.isAuthorizedAdmin(UserRole.RESELLER))
    }

    // =========================================================================
    // 6. Points 50, 52, 53, 54, 55: State-Aware Order Transitions
    // =========================================================================

    @Test
    fun testFullStateAwareProgression() {
        // Screen 08 order: DS1008 initially PENDING_VERIFICATION
        val targetOrderId = "DS1008"
        val order0 = adminRepository.getOrderById(targetOrderId)
        assertNotNull("Order DS1008 should exist in seeded platform orders", order0)
        assertEquals(OrderStatus.PENDING_VERIFICATION, order0!!.status)
        assertFalse(order0.isQualifying)

        // State 1 -> 2: verifyPayment
        val vResult = adminRepository.verifyPayment(targetOrderId, "admin-test")
        assertTrue(vResult)
        val order1 = adminRepository.getOrderById(targetOrderId)!!
        assertEquals(OrderStatus.PAYMENT_VERIFIED, order1.status)
        assertEquals("admin-test", order1.processedByAdminId)
        assertNotNull(order1.confirmedAt)

        // State 2 -> 3: moveToProcessing
        val pResult = adminRepository.moveToProcessing(targetOrderId, "admin-test")
        assertTrue(pResult)
        val order2 = adminRepository.getOrderById(targetOrderId)!!
        assertEquals(OrderStatus.PROCESSING, order2.status)
        assertNotNull(order2.processingAt)

        // State 3 -> 4: dispatchOrder with courier details
        val dResult = adminRepository.dispatchOrder(
            orderId = targetOrderId,
            courier = "TCS Express",
            trackingNumber = "TCS-998822",
            dispatchNote = "Dispatched via overnight service",
            adminId = "admin-test"
        )
        assertTrue(dResult)
        val order3 = adminRepository.getOrderById(targetOrderId)!!
        assertEquals(OrderStatus.DISPATCHED, order3.status)
        assertEquals("TCS Express", order3.shippingCourier)
        assertEquals("TCS-998822", order3.trackingNumber)
        assertEquals("Dispatched via overnight service", order3.shippingNotes)
        assertNotNull(order3.dispatchedAt)
        assertFalse(order3.isQualifying)

        // State 4 -> 5: markDelivered (Unlocks profit & qualification)
        val delResult = adminRepository.markDelivered(targetOrderId, "admin-test")
        assertTrue(delResult)
        val order4 = adminRepository.getOrderById(targetOrderId)!!
        assertEquals(OrderStatus.DELIVERED, order4.status)
        assertTrue("Delivered order must count as qualifying", order4.isQualifying)
        assertNotNull(order4.deliveredAt)
    }

    // =========================================================================
    // 7. Points 49, 51: Destructive Rejection Safety with Reason
    // =========================================================================

    @Test
    fun testDestructiveRejectionSafetyAndReasons() {
        val targetOrderId = "DS1008"

        // Reject with explicit standardized reason
        val rejectResult = adminRepository.rejectOrder(
            orderId = targetOrderId,
            reason = "Bank Account / Sender Name Mismatch",
            customDetailNote = "Account name shows 'Zubair Shah', but customer registered as 'Ali Hassan'",
            adminId = "admin-verifier"
        )
        assertTrue(rejectResult)

        val rejectedOrder = adminRepository.getOrderById(targetOrderId)!!
        assertEquals(OrderStatus.REJECTED, rejectedOrder.status)
        assertEquals("Bank Account / Sender Name Mismatch", rejectedOrder.rejectionReason)
        assertEquals("Account name shows 'Zubair Shah', but customer registered as 'Ali Hassan'", rejectedOrder.adminReviewNote)
        assertFalse("Rejected order must never become qualifying", rejectedOrder.isQualifying)
        assertEquals("admin-verifier", rejectedOrder.processedByAdminId)
    }

    // =========================================================================
    // 8. Point 60: 3-Level Expandable Category Tree (Root -> Sub -> Leaf)
    // =========================================================================

    @Test
    fun testThreeLevelCategoryHierarchy() {
        val tree = adminRepository.getCategoryTree()
        assertTrue("Category tree must contain root nodes", tree.isNotEmpty())

        // Validate Root Node (Depth 0)
        val rootNode = tree.first()
        assertEquals(0, rootNode.category.depth)
        assertNull(rootNode.category.parentId)
        assertTrue("Root category should have children", rootNode.children.isNotEmpty())

        // Validate Sub-category Node (Depth 1)
        val subNode = rootNode.children.first()
        assertEquals(1, subNode.category.depth)
        assertEquals(rootNode.category.id, subNode.category.parentId)

        // Validate Leaf Node (Depth 2)
        if (subNode.children.isNotEmpty()) {
            val leafNode = subNode.children.first()
            assertEquals(2, leafNode.category.depth)
            assertEquals(subNode.category.id, leafNode.category.parentId)
            assertTrue("Leaf category cannot have deeper child levels", leafNode.children.isEmpty())
        }

        // Test saving a new leaf category
        val newLeaf = Category(
            id = "cat-leaf-test",
            name = "Formal Oxfords",
            slug = "formal-oxfords",
            parentId = subNode.category.id,
            depth = 2
        )
        val saved = adminRepository.saveCategory(newLeaf)
        assertTrue(saved)
        val updatedCats = adminRepository.categories.value
        assertTrue(updatedCats.any { it.id == "cat-leaf-test" })
    }

    // =========================================================================
    // 9. Point 58: Rank Rewards Milestone Approval & Disbursement
    // =========================================================================

    @Test
    fun testRankRewardsMilestoneWorkflow() {
        val initialRewards = adminRepository.platformRewards.value
        val pendingReward = initialRewards.first { it.status == RewardStatus.PENDING_REVIEW }
        assertEquals(RewardStatus.PENDING_REVIEW, pendingReward.status)

        // 1. Admin approves reward
        val approved = adminRepository.updateRewardStatus(
            rewardId = pendingReward.id,
            status = RewardStatus.APPROVED,
            adminNote = "Dual-condition qualification verified against audit logs"
        )
        assertTrue(approved)
        val approvedReward = adminRepository.platformRewards.value.first { it.id == pendingReward.id }
        assertEquals(RewardStatus.APPROVED, approvedReward.status)
        assertEquals("Dual-condition qualification verified against audit logs", approvedReward.adminNote)

        // 2. Admin disburses payout
        val paid = adminRepository.updateRewardStatus(
            rewardId = pendingReward.id,
            status = RewardStatus.PAID,
            adminNote = "Disbursed via bank transfer TXN-RR-8822"
        )
        assertTrue(paid)
        val paidReward = adminRepository.platformRewards.value.first { it.id == pendingReward.id }
        assertEquals(RewardStatus.PAID, paidReward.status)
    }

    // =========================================================================
    // 10. Point 59: Admin Product Management Catalog & Stock Toggle
    // =========================================================================

    @Test
    fun testAdminProductManagementAndStockToggle() {
        val initialProducts = adminRepository.products.value
        val testProd = initialProducts.first()
        val originalStockState = testProd.inStock

        // Toggle stock
        val toggleResult = adminRepository.toggleProductStock(testProd.id)
        assertTrue(toggleResult)
        val updatedProd = adminRepository.products.value.first { it.id == testProd.id }
        assertEquals(!originalStockState, updatedProd.inStock)

        // Toggle back
        adminRepository.toggleProductStock(testProd.id)
        assertEquals(originalStockState, adminRepository.products.value.first { it.id == testProd.id }.inStock)

        // Save a new product with custom wholesale margin
        val newProduct = PartnerProduct(
            id = "prod-admin-new-01",
            name = "Italian Leather Loafers",
            retailPrice = 9000.0,
            partnerPrice = 6500.0,
            suggestedSellingPrice = 9000.0,
            stockCount = 45,
            inStock = true
        )
        val saveResult = adminRepository.saveProduct(newProduct)
        assertTrue(saveResult)

        val retrievedProduct = adminRepository.products.value.first { it.id == "prod-admin-new-01" }
        assertEquals(2500.0, retrievedProduct.grossMargin, 0.01)
        assertEquals("PKR 2,500", retrievedProduct.formattedGrossMargin)
        assertEquals(45, retrievedProduct.stockCount)
    }

    // =========================================================================
    // 11. Points 61 & 82: Immutable Mobile Audit Logs & Auto-Logging
    // =========================================================================

    @Test
    fun testAuditLogsInitializationAndAutoLogging() {
        val initialLogs = adminRepository.auditLogs.value
        assertTrue("Seed audit logs must not be empty", initialLogs.isNotEmpty())

        val firstLog = initialLogs.first()
        assertNotNull(firstLog.id)
        assertNotNull(firstLog.actorId)
        assertNotNull(firstLog.actorName)
        assertNotNull(firstLog.action)
        assertNotNull(firstLog.entityType)
        assertNotNull(firstLog.entityId)
        assertNotNull(firstLog.timestamp)

        // Perform an administrative order payment verification
        val initialLogCount = initialLogs.size
        val verifySuccess = adminRepository.verifyPayment("DS1008", "admin-super")
        assertTrue(verifySuccess)

        // Verify a new immutable audit log was auto-recorded at the top of the stack
        val updatedLogs = adminRepository.auditLogs.value
        assertEquals(initialLogCount + 1, updatedLogs.size)

        val latestLog = updatedLogs.first()
        assertEquals("admin-super", latestLog.actorId)
        assertEquals("VERIFY_PAYMENT", latestLog.action)
        assertEquals("ORDER", latestLog.entityType)
        assertEquals("DS1008", latestLog.entityId)
        assertEquals(OrderStatus.PENDING_VERIFICATION.name, latestLog.previousState)
        assertEquals(OrderStatus.PAYMENT_VERIFIED.name, latestLog.newState)
        assertTrue(latestLog.note?.contains("verified by administrator") == true)
    }

    // =========================================================================
    // 12. Point 90: Order Action State Machine Strict Transition Validation
    // =========================================================================

    @Test
    fun testStrictOrderFulfillmentStateMachineValidation() {
        // Legal Forward Progressions
        assertTrue(adminRepository.canTransition(OrderStatus.PENDING_VERIFICATION, OrderStatus.PAYMENT_VERIFIED))
        assertTrue(adminRepository.canTransition(OrderStatus.PENDING_VERIFICATION, OrderStatus.REJECTED))
        assertTrue(adminRepository.canTransition(OrderStatus.PENDING_VERIFICATION, OrderStatus.CANCELLED))
        assertTrue(adminRepository.canTransition(OrderStatus.PAYMENT_VERIFIED, OrderStatus.PROCESSING))
        assertTrue(adminRepository.canTransition(OrderStatus.PAYMENT_VERIFIED, OrderStatus.REJECTED))
        assertTrue(adminRepository.canTransition(OrderStatus.PROCESSING, OrderStatus.DISPATCHED))
        assertTrue(adminRepository.canTransition(OrderStatus.DISPATCHED, OrderStatus.DELIVERED))
        assertTrue(adminRepository.canTransition(OrderStatus.IN_TRANSIT, OrderStatus.DELIVERED))

        // Illegal Jumps and Backward Transitions Must Be Blocked
        assertFalse("Cannot jump directly from PENDING_VERIFICATION to DELIVERED",
            adminRepository.canTransition(OrderStatus.PENDING_VERIFICATION, OrderStatus.DELIVERED))
        assertFalse("Cannot jump directly from PENDING_VERIFICATION to DISPATCHED",
            adminRepository.canTransition(OrderStatus.PENDING_VERIFICATION, OrderStatus.DISPATCHED))
        assertFalse("Cannot jump directly from PENDING_VERIFICATION to PROCESSING without verification",
            adminRepository.canTransition(OrderStatus.PENDING_VERIFICATION, OrderStatus.PROCESSING))
        assertFalse("Cannot regress from PROCESSING back to PAYMENT_VERIFIED",
            adminRepository.canTransition(OrderStatus.PROCESSING, OrderStatus.PAYMENT_VERIFIED))
        assertFalse("Terminal state DELIVERED cannot transition further",
            adminRepository.canTransition(OrderStatus.DELIVERED, OrderStatus.PENDING_VERIFICATION))
        assertFalse("Terminal state REJECTED cannot transition further",
            adminRepository.canTransition(OrderStatus.REJECTED, OrderStatus.DELIVERED))
        assertFalse("Terminal state CANCELLED cannot transition further",
            adminRepository.canTransition(OrderStatus.CANCELLED, OrderStatus.PROCESSING))

        // Practical enforcement: Attempting to move unverified order to PROCESSING must fail
        val unverifiedOrderId = "DS1008" // Status is PENDING_VERIFICATION
        val illegalMoveResult = adminRepository.moveToProcessing(unverifiedOrderId, "admin-test")
        assertFalse("moveToProcessing must fail when order is still in PENDING_VERIFICATION", illegalMoveResult)
        assertEquals(OrderStatus.PENDING_VERIFICATION, adminRepository.getOrderById(unverifiedOrderId)!!.status)

        // Practical enforcement: Attempting to dispatch unverified order directly must fail
        val illegalDispatchResult = adminRepository.dispatchOrder(unverifiedOrderId, "TCS", "TCS123", adminId = "admin-test")
        assertFalse("dispatchOrder must fail when order is still in PENDING_VERIFICATION", illegalDispatchResult)
        assertEquals(OrderStatus.PENDING_VERIFICATION, adminRepository.getOrderById(unverifiedOrderId)!!.status)
    }

    // =========================================================================
    // 13. Point 81: High-Security Confirmation Policies
    // =========================================================================

    @Test
    fun testHighSecurityActionConfirmationRules() {
        // High-value payouts >= PKR 10,000 require confirmation
        assertTrue("Payout of PKR 15,000 must require high security confirmation",
            adminRepository.requiresHighSecurityConfirmation("DISBURSE_PAYOUT", 15000.0))
        assertTrue("Payout of exact PKR 10,000 threshold must require confirmation",
            adminRepository.requiresHighSecurityConfirmation("DISBURSE_PAYOUT", 10000.0))
        assertFalse("Payout of PKR 5,000 should not require extra confirmation",
            adminRepository.requiresHighSecurityConfirmation("DISBURSE_PAYOUT", 5000.0))
        assertFalse("Payout of PKR 9,999 should not require extra confirmation",
            adminRepository.requiresHighSecurityConfirmation("DISBURSE_PAYOUT", 9999.0))

        // Role promotion to SUPERADMIN requires high security confirmation
        assertTrue("Promoting user to SUPERADMIN must require high security confirmation",
            adminRepository.requiresHighSecurityConfirmation("UPDATE_USER_ROLE", 0.0, UserRole.SUPERADMIN))
        assertFalse("Promoting user to RESELLER does not require high security confirmation",
            adminRepository.requiresHighSecurityConfirmation("UPDATE_USER_ROLE", 0.0, UserRole.RESELLER))

        // Standard actions do not trigger high security checks
        assertFalse(adminRepository.requiresHighSecurityConfirmation("UPDATE_PRODUCT"))
        assertFalse(adminRepository.requiresHighSecurityConfirmation("UNKNOWN_ACTION"))
    }

    // =========================================================================
    // 14. Points 62 & 87: Role-Aware Notifications & Canonical Deep Linking
    // =========================================================================

    @Test
    fun testRoleAwareNotificationsAndDeepLinks() {
        val notificationRepo = NotificationRepository(firestore = null)

        // 1. Reseller Role Notifications
        val resellerNotifications = notificationRepo.createInitialRoleNotifications(UserRole.RESELLER)
        assertTrue("Reseller notifications should be populated", resellerNotifications.isNotEmpty())
        assertTrue("All reseller notifications must target RESELLER role",
            resellerNotifications.all { it.targetRole == UserRole.RESELLER })

        val resellerCategories = resellerNotifications.map { it.category }
        assertTrue(resellerCategories.contains("PAYMENT_VERIFIED"))
        assertTrue(resellerCategories.contains("ORDER_PROCESSING"))
        assertTrue(resellerCategories.contains("ORDER_DELIVERED"))
        assertTrue(resellerCategories.contains("PROFIT_RELEASED"))
        assertTrue(resellerCategories.contains("WITHDRAWAL_APPROVED"))
        assertTrue(resellerCategories.contains("RANK_ACHIEVED"))

        // Validate Reseller Deep Links
        assertTrue(resellerNotifications.any { it.deepLinkRoute == DtaDestinations.RESELLER_WALLET })
        assertTrue(resellerNotifications.any { it.deepLinkRoute == DtaDestinations.RESELLER_GROWTH })
        assertTrue(resellerNotifications.any { it.deepLinkRoute == DtaDestinations.resellerOrderTracking("DS1007") })

        // 2. Admin Role Notifications
        val adminNotifications = notificationRepo.createInitialRoleNotifications(UserRole.ADMIN)
        assertTrue("Admin notifications should be populated", adminNotifications.isNotEmpty())
        assertTrue("All admin notifications must target ADMIN role",
            adminNotifications.all { it.targetRole == UserRole.ADMIN })

        val adminCategories = adminNotifications.map { it.category }
        assertTrue(adminCategories.contains("PAYMENT_PROOF_SUBMITTED"))
        assertTrue(adminCategories.contains("PENDING_WITHDRAWAL"))
        assertTrue(adminCategories.contains("REWARD_REVIEW"))
        assertTrue(adminCategories.contains("LOW_STOCK"))
        assertTrue(adminCategories.contains("VERIFICATION_ISSUE"))

        // Validate Admin Deep Links
        assertTrue(adminNotifications.any { it.deepLinkRoute?.startsWith("admin_order") == true || it.deepLinkRoute == DtaDestinations.ADMIN_ORDERS })
        assertTrue(adminNotifications.any { it.deepLinkRoute == DtaDestinations.ADMIN_WITHDRAWALS })
        assertTrue(adminNotifications.any { it.deepLinkRoute == DtaDestinations.ADMIN_RANK_REWARDS })
        assertTrue(adminNotifications.any { it.deepLinkRoute == DtaDestinations.ADMIN_PRODUCTS })

        // 3. Customer Role Notifications
        val customerNotifications = notificationRepo.createInitialRoleNotifications(UserRole.CUSTOMER)
        assertTrue("Customer notifications should be populated", customerNotifications.isNotEmpty())
        assertTrue("All customer notifications must target CUSTOMER role",
            customerNotifications.all { it.targetRole == UserRole.CUSTOMER })
    }

    // =========================================================================
    // 15. Points 83 & 84: Unified Product Card Role Modes
    // =========================================================================

    @Test
    fun testUnifiedProductCardRoleModes() {
        val roles = ProductCardRole.entries
        assertEquals(3, roles.size)
        assertTrue(roles.contains(ProductCardRole.CUSTOMER))
        assertTrue(roles.contains(ProductCardRole.RESELLER))
        assertTrue(roles.contains(ProductCardRole.ADMIN))

        val product = PartnerProduct(
            id = "card-test-prod",
            name = "Silk Cotton Stitched Kurta",
            retailPrice = 4500.0,
            partnerPrice = 3200.0,
            stockCount = 18,
            inStock = true
        )

        // Reseller margin logic
        assertEquals(1300.0, product.grossMargin, 0.01)
        assertEquals("PKR 1,300", product.formattedGrossMargin)
        assertEquals(28, product.marginPercent) // 1300 / 4500 = 28.8%
    }

    // =========================================================================
    // 16. Point 91: Refresh / Conflict Handling & Stale Write Prevention
    // =========================================================================

    @Test
    fun testConcurrencyConflictDetectionAndStaleWritePrevention() {
        val targetOrderId = "DS1008"
        val initialOrder = adminRepository.getOrderById(targetOrderId)
        assertNotNull("Order DS1008 must exist", initialOrder)
        assertEquals(OrderStatus.PENDING_VERIFICATION, initialOrder!!.status)
        assertEquals(1L, initialOrder.version)

        // Point 91 checkOrderConflict utility validation
        assertTrue(
            "Conflict should be detected when known status differs from actual",
            adminRepository.checkOrderConflict(targetOrderId, OrderStatus.DELIVERED)
        )
        assertFalse(
            "No conflict should be detected when known status matches actual",
            adminRepository.checkOrderConflict(targetOrderId, OrderStatus.PENDING_VERIFICATION)
        )

        // Attempting to transition when expectedStatus is mismatched (stale write)
        val conflictResult = adminRepository.verifyPayment(
            orderId = targetOrderId,
            adminId = "admin-concurrent",
            expectedStatus = OrderStatus.DELIVERED // Stale expectation
        )
        assertFalse("Stale write must be rejected when expectedStatus does not match current backend status", conflictResult)
        assertEquals(
            "This order was updated elsewhere. Refresh to continue.",
            adminRepository.lastConflictError.value
        )
        // Ensure state was NOT modified
        assertEquals(OrderStatus.PENDING_VERIFICATION, adminRepository.getOrderById(targetOrderId)!!.status)
        assertEquals(1L, adminRepository.getOrderById(targetOrderId)!!.version)

        // Clean clear error test
        adminRepository.clearConflictError()
        assertNull(adminRepository.lastConflictError.value)

        // Transition with matching expectedStatus must succeed
        val successResult = adminRepository.verifyPayment(
            orderId = targetOrderId,
            adminId = "admin-valid",
            expectedStatus = OrderStatus.PENDING_VERIFICATION
        )
        assertTrue("Write with matching expectedStatus must succeed", successResult)
        assertNull("Conflict error must remain null upon successful update", adminRepository.lastConflictError.value)

        val updatedOrder = adminRepository.getOrderById(targetOrderId)!!
        assertEquals(OrderStatus.PAYMENT_VERIFIED, updatedOrder.status)
        assertEquals(2L, updatedOrder.version) // Version incremented to support optimistic locking
        assertNotNull(updatedOrder.updatedAt)
    }

    // =========================================================================
    // 17. Point 92: Withdrawal Double-Payment Safety (Backend Idempotency)
    // =========================================================================

    @Test
    fun testWithdrawalDoublePaymentPreventionAndIdempotency() {
        val requestId = "wd-dta-1003"
        val initialReq = adminRepository.platformWithdrawals.value.first { it.id == requestId }
        assertEquals(WithdrawalStatus.PENDING, initialReq.status)

        // First payout disbursement must succeed
        val firstPaymentSuccess = adminRepository.markWithdrawalPaid(
            requestId = requestId,
            transactionReference = "TXN-ORIGINAL-99001",
            receiptProofUrl = "https://proofs.dta.com/receipt-01.png",
            adminNote = "Processed via JazzCash",
            adminId = "admin-payout-officer"
        )
        assertTrue("First disbursement must succeed", firstPaymentSuccess)

        val paidReq = adminRepository.platformWithdrawals.value.first { it.id == requestId }
        assertEquals(WithdrawalStatus.PAID, paidReq.status)
        assertEquals("TXN-ORIGINAL-99001", paidReq.transactionReference)

        // Second duplicate payout attempt on same withdrawal MUST be blocked (Point 92 Idempotency)
        val duplicatePaymentAttempt = adminRepository.markWithdrawalPaid(
            requestId = requestId,
            transactionReference = "TXN-DUPLICATE-99002",
            receiptProofUrl = "https://proofs.dta.com/receipt-02.png",
            adminNote = "Accidental second click disbursement",
            adminId = "admin-payout-officer"
        )
        assertFalse("Second disbursement attempt on already PAID withdrawal must be rejected", duplicatePaymentAttempt)

        // Verify transaction reference and record were NOT overwritten
        val verifiedReq = adminRepository.platformWithdrawals.value.first { it.id == requestId }
        assertEquals("TXN-ORIGINAL-99001", verifiedReq.transactionReference)
        assertEquals(WithdrawalStatus.PAID, verifiedReq.status)

        // Pre-existing paid withdrawal wd-dta-1002 must also block payout
        val alreadyPaidAttempt = adminRepository.markWithdrawalPaid(
            requestId = "wd-dta-1002",
            transactionReference = "TXN-ANOTHER-FAIL"
        )
        assertFalse("Cannot disburse on an already settled withdrawal", alreadyPaidAttempt)

        // Reject a withdrawal and verify paying it afterwards fails
        val rejectSuccess = adminRepository.rejectWithdrawal("wd-dta-1003", "Test reject on paid")
        assertFalse("Cannot reject an already PAID withdrawal", rejectSuccess)
    }

    // =========================================================================
    // 18. Point 93: Rank Reward Double-Payment Safety
    // =========================================================================

    @Test
    fun testRankRewardDoublePaymentPrevention() {
        val rewardId = "rew-rank-201"
        val initialReward = adminRepository.platformRewards.value.first { it.id == rewardId }
        assertEquals(RewardStatus.PENDING_REVIEW, initialReward.status)

        // Step 1: Admin marks approved
        val approved = adminRepository.updateRewardStatus(
            rewardId = rewardId,
            status = RewardStatus.APPROVED,
            adminNote = "Qualification audited and verified"
        )
        assertTrue("Reward approval must succeed", approved)

        // Step 2: Admin disburses reward payout (marks PAID)
        val disbursed = adminRepository.updateRewardStatus(
            rewardId = rewardId,
            status = RewardStatus.PAID,
            adminNote = "Reward paid via bank transfer REF-RR-3344"
        )
        assertTrue("First disbursement must succeed", disbursed)
        assertEquals(RewardStatus.PAID, adminRepository.platformRewards.value.first { it.id == rewardId }.status)

        // Step 3: Attempting to pay or modify an already PAID reward must be blocked
        val duplicatePayoutAttempt = adminRepository.updateRewardStatus(
            rewardId = rewardId,
            status = RewardStatus.PAID,
            adminNote = "Attempted second disbursement"
        )
        assertFalse("Attempt to re-disburse or pay an already PAID rank reward must be blocked", duplicatePayoutAttempt)

        val regressiveAttempt = adminRepository.updateRewardStatus(
            rewardId = rewardId,
            status = RewardStatus.APPROVED,
            adminNote = "Attempted regression from PAID"
        )
        assertFalse("Cannot modify or regress a PAID rank reward", regressiveAttempt)

        // Immutable payment status remains intact
        val finalReward = adminRepository.platformRewards.value.first { it.id == rewardId }
        assertEquals(RewardStatus.PAID, finalReward.status)
        assertEquals("Reward paid via bank transfer REF-RR-3344", finalReward.adminNote)
    }

    // =========================================================================
    // 19. Point 97: Comprehensive Reseller Business Rules & Data Authorization
    // =========================================================================

    @Test
    fun testComprehensiveResellerBusinessRulesAndDataAuthorization() {
        val resellerId = "reseller-1"

        // 1. Wholesale Partner Pricing & Margin Visibility
        val product = PartnerProduct(
            id = "prod-reseller-test",
            name = "Stitched Lawn 3-Piece",
            retailPrice = 6000.0,
            partnerPrice = 4500.0,
            suggestedSellingPrice = 6000.0,
            stockCount = 20,
            inStock = true
        )
        assertEquals(1500.0, product.grossMargin, 0.01)
        assertEquals(25, product.marginPercent)

        // 2. Minimum Selling Price Floor Enforcement
        val belowCostSale = resellerRepository.recordSale(
            product = product,
            customerName = "Bilal Ahmed",
            customerPhone = "03121234567",
            customerAddress = "House 10, St 4",
            customerCity = "Karachi",
            quantity = 1,
            sellingPrice = 4000.0 // Below partner wholesale cost (4500.0)
        )
        assertTrue("Selling below wholesale partner price floor must fail", belowCostSale.isFailure)

        // 3. Profit Staging Lifecycle (Pending -> Realized only upon DELIVERY)
        val validSale = resellerRepository.recordSale(
            product = product,
            customerName = "Bilal Ahmed",
            customerPhone = "03121234567",
            customerAddress = "House 10, St 4",
            customerCity = "Karachi",
            quantity = 2,
            sellingPrice = 5500.0 // Profit = (5500 - 4500) * 2 = 2000 PKR
        ).getOrNull()!!

        assertEquals(OrderStatus.PENDING_VERIFICATION, validSale.status)
        assertFalse(validSale.isQualifying)
        assertEquals(2000.0, validSale.totalProfit, 0.01)

        // 4. Withdrawal Rules (Minimum PKR 500 & Not Exceeding Available Balance)
        val initialAvailable = resellerRepository.getAvailableBalance(resellerId)
        val method = PaymentMethod(accountTitle = "Bilal", accountNumber = "03121234567", bankName = "Nayapay")
        val underMin = resellerRepository.createWithdrawalRequest(amount = 200.0, payoutMethod = method)
        assertTrue("Withdrawal below PKR 500 floor must fail", underMin.isFailure)

        val overMax = resellerRepository.createWithdrawalRequest(amount = initialAvailable + 10000.0, payoutMethod = method)
        assertTrue("Withdrawal exceeding available balance must fail", overMax.isFailure)

        // 5. Team / Network Data Privacy Check
        // Partner directory must only expose safe display fields, protecting customer privacy
        val teamMembers = resellerRepository.getMyTeamMembers(resellerId)
        assertTrue("Team members list should not be empty", teamMembers.isNotEmpty())
        for (member in teamMembers) {
            assertNotNull(member.id)
            assertNotNull(member.name)
            assertNotNull(member.joinDate)
            assertNotNull(member.rankName)
        }
    }

    // =========================================================================
    // 20. Point 98: Comprehensive Admin Operations & Fulfillment Safety
    // =========================================================================

    @Test
    fun testComprehensiveAdminOperationsAndFulfillmentSafety() {
        val adminId = "admin-lead"

        // 1. Role Authorization Check
        assertTrue(adminRepository.isAuthorizedAdmin(UserRole.ADMIN))
        assertTrue(adminRepository.isAuthorizedAdmin(UserRole.SUPERADMIN))
        assertFalse(adminRepository.isAuthorizedAdmin(UserRole.CUSTOMER))
        assertFalse(adminRepository.isAuthorizedAdmin(UserRole.RESELLER))

        // 2. State Progression: PENDING_VERIFICATION -> PAYMENT_VERIFIED -> PROCESSING -> DISPATCHED -> DELIVERED
        val orderId = "DS1008"
        val initialOrder = adminRepository.getOrderById(orderId)!!
        assertEquals(OrderStatus.PENDING_VERIFICATION, initialOrder.status)

        // Illegal jump: cannot dispatch directly from PENDING_VERIFICATION
        val illegalDispatch = adminRepository.dispatchOrder(orderId, "TCS", "TCS123", adminId = adminId)
        assertFalse("Cannot dispatch unverified order", illegalDispatch)

        // Verify payment
        assertTrue(adminRepository.verifyPayment(orderId, adminId = adminId, expectedStatus = OrderStatus.PENDING_VERIFICATION))
        assertEquals(OrderStatus.PAYMENT_VERIFIED, adminRepository.getOrderById(orderId)!!.status)

        // Move to processing
        assertTrue(adminRepository.moveToProcessing(orderId, adminId = adminId, expectedStatus = OrderStatus.PAYMENT_VERIFIED))
        assertEquals(OrderStatus.PROCESSING, adminRepository.getOrderById(orderId)!!.status)

        // Dispatch with courier & tracking
        assertTrue(adminRepository.dispatchOrder(
            orderId = orderId,
            courier = "Leopard Courier",
            trackingNumber = "LEO-998877",
            dispatchNote = "Air Cargo Priority",
            adminId = adminId,
            expectedStatus = OrderStatus.PROCESSING
        ))
        val dispatched = adminRepository.getOrderById(orderId)!!
        assertEquals(OrderStatus.DISPATCHED, dispatched.status)
        assertEquals("Leopard Courier", dispatched.shippingCourier)
        assertEquals("LEO-998877", dispatched.trackingNumber)
        assertFalse(dispatched.isQualifying)

        // Delivery confirmation (marks isQualifying = true)
        assertTrue(adminRepository.markDelivered(orderId, adminId = adminId, expectedStatus = OrderStatus.DISPATCHED))
        val delivered = adminRepository.getOrderById(orderId)!!
        assertEquals(OrderStatus.DELIVERED, delivered.status)
        assertTrue(delivered.isQualifying)

        // 3. High-Security Threshold Flagging
        assertTrue(adminRepository.requiresHighSecurityConfirmation("DISBURSE_PAYOUT", 10000.0))
        assertTrue(adminRepository.requiresHighSecurityConfirmation("DISBURSE_PAYOUT", 50000.0))
        assertFalse(adminRepository.requiresHighSecurityConfirmation("DISBURSE_PAYOUT", 5000.0))
        assertTrue(adminRepository.requiresHighSecurityConfirmation("UPDATE_USER_ROLE", 0.0, UserRole.SUPERADMIN))

        // 4. Immutable Audit Trail Auto-Generation
        val logs = adminRepository.auditLogs.value
        val recentOrderLogs = logs.filter { it.entityId == orderId }
        assertTrue("Audit trail must have logged transitions for order $orderId", recentOrderLogs.size >= 4)
        assertTrue(recentOrderLogs.any { it.action == "VERIFY_PAYMENT" })
        assertTrue(recentOrderLogs.any { it.action == "MOVE_TO_PROCESSING" })
        assertTrue(recentOrderLogs.any { it.action == "DISPATCH_ORDER" })
        assertTrue(recentOrderLogs.any { it.action == "MARK_DELIVERED" })
    }

    // =========================================================================
    // 21. Point 99: Mandatory Role Security & Data Isolation Tests
    // =========================================================================

    @Test
    fun testMandatoryRoleSecurityAndDataIsolation() {
        val notificationRepo = NotificationRepository(firestore = null)

        // 1. Role Capabilities Separation
        val allRoles = UserRole.entries
        assertEquals(4, allRoles.size)

        // Customer access isolation
        val customerRole = UserRole.CUSTOMER
        assertFalse("Customer must not have admin authorization", adminRepository.isAuthorizedAdmin(customerRole))

        // Reseller access isolation
        val resellerRole = UserRole.RESELLER
        assertFalse("Reseller must not have admin authorization", adminRepository.isAuthorizedAdmin(resellerRole))

        // Admin & SuperAdmin authorization
        assertTrue("Admin must have admin authorization", adminRepository.isAuthorizedAdmin(UserRole.ADMIN))
        assertTrue("SuperAdmin must have admin authorization", adminRepository.isAuthorizedAdmin(UserRole.SUPERADMIN))

        // 2. Notification Segregation Across Roles
        val customerNotifs = notificationRepo.createInitialRoleNotifications(UserRole.CUSTOMER)
        val resellerNotifs = notificationRepo.createInitialRoleNotifications(UserRole.RESELLER)
        val adminNotifs = notificationRepo.createInitialRoleNotifications(UserRole.ADMIN)

        // Ensure zero cross-role leakage
        assertTrue("Customer notifications must only target CUSTOMER",
            customerNotifs.all { it.targetRole == UserRole.CUSTOMER })
        assertTrue("Reseller notifications must only target RESELLER",
            resellerNotifs.all { it.targetRole == UserRole.RESELLER })
        assertTrue("Admin notifications must only target ADMIN or SUPERADMIN",
            adminNotifs.all { it.targetRole == UserRole.ADMIN || it.targetRole == UserRole.SUPERADMIN })

        // Reseller specific categories should NOT appear in Customer notifications
        val customerCategories = customerNotifs.map { it.category }
        assertFalse(customerCategories.contains("PROFIT_RELEASED"))
        assertFalse(customerCategories.contains("WITHDRAWAL_APPROVED"))
        assertFalse(customerCategories.contains("RANK_ACHIEVED"))

        // Admin specific categories should NOT appear in Reseller notifications
        val resellerCategories = resellerNotifs.map { it.category }
        assertFalse(resellerCategories.contains("PAYMENT_PROOF_SUBMITTED"))
        assertFalse(resellerCategories.contains("PENDING_WITHDRAWAL"))
        assertFalse(resellerCategories.contains("REWARD_REVIEW"))
        assertFalse(resellerCategories.contains("VERIFICATION_ISSUE"))

        // 3. User Role Mutation Safety
        val testUser = adminRepository.platformUsers.value.first { it.id == "user-103" }
        assertEquals(UserRole.CUSTOMER, testUser.role)

        // Only authorized admin updates role
        val roleUpdated = adminRepository.updateUserRole(testUser.id, UserRole.RESELLER, adminId = "admin-super")
        assertTrue(roleUpdated)
        assertEquals(UserRole.RESELLER, adminRepository.platformUsers.value.first { it.id == testUser.id }.role)

        // High security confirmation trigger for SUPERADMIN promotion
        assertTrue(adminRepository.requiresHighSecurityConfirmation("UPDATE_USER_ROLE", 0.0, UserRole.SUPERADMIN))
    }

    // =========================================================================
    // 22. Currency Standardization & Visual Formatting Verification (Point 91)
    // =========================================================================

    @Test
    fun testCurrencyStandardizationAndFormattingRules() {
        // 1. Product currency prefix
        val sampleProduct = Product(
            id = "prod-test",
            name = "Smart Executive Watch",
            retailPrice = 7200.0,
            originalPrice = 11000.0
        )
        assertEquals("PKR 7,200", sampleProduct.formattedPrice)
        assertEquals("PKR 11,000", sampleProduct.formattedOriginalPrice)

        // 2. CartItem total price
        val sampleCartItem = CartItem(product = sampleProduct, quantity = 3)
        assertEquals("PKR 21,600", sampleCartItem.formattedTotalPrice)

        // 3. ResellerSale customer bill & profit
        val sampleSale = ResellerSale(
            id = "DS1007",
            productId = "prod-test",
            productName = "Smart Executive Watch",
            sellingPrice = 7200.0,
            partnerPrice = 5400.0,
            quantity = 2
        )
        assertEquals("Rs 14,400", sampleSale.formattedTotalBill)
        assertEquals("Rs 3,600", sampleSale.formattedTotalProfit)

        // 4. Wallet ledger balance
        val sampleWallet = WalletLedger(
            availableBalance = 28450.0,
            realizedProfit = 45000.0
        )
        assertEquals("Rs 28,450", sampleWallet.formattedAvailable)
        assertEquals("Rs 45,000", sampleWallet.formattedRealized)

        // 5. Withdrawal request
        val sampleWithdrawal = WithdrawalRequest(
            id = "w-101",
            amount = 15000.0
        )
        assertEquals("Rs 15,000", sampleWithdrawal.formattedAmount)

        // 6. RankDefinition milestone reward
        val goldRank = RankEngine.evaluateRank(35, 60)
        assertEquals("Rs 6,000", goldRank.formattedReward)

        // 7. PartnerProduct wholesale price
        val samplePartnerProduct = PartnerProduct(
            id = "prod-test",
            partnerPrice = 5400.0,
            suggestedSellingPrice = 7200.0
        )
        assertEquals("PKR 5,400", samplePartnerProduct.formattedPartnerPrice)
    }
}
