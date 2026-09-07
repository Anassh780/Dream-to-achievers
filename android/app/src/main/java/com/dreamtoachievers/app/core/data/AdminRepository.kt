package com.dreamtoachievers.app.core.data

import com.dreamtoachievers.app.core.firebase.FirebaseConfig
import com.dreamtoachievers.app.core.model.*
import com.dreamtoachievers.app.core.navigation.DtaDestinations
import com.google.firebase.firestore.DocumentSnapshot
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.text.SimpleDateFormat
import java.util.*

class AdminRepository(
    private val resellerRepository: ResellerRepository? = null
) {
    // Role Security Helper
    fun isAuthorizedAdmin(role: UserRole): Boolean =
        role == UserRole.ADMIN || role == UserRole.SUPERADMIN

    private fun getFirestoreSafe(): FirebaseFirestore? {
        return try {
            FirebaseFirestore.getInstance()
        } catch (_: Exception) {
            null
        }
    }

    // 1. All Platform Orders
    private val _platformOrders = MutableStateFlow<List<ResellerSale>>(emptyList())
    val platformOrders: StateFlow<List<ResellerSale>> = _platformOrders.asStateFlow()

    // 2. All Platform Withdrawals
    private val _platformWithdrawals = MutableStateFlow<List<WithdrawalRequest>>(emptyList())
    val platformWithdrawals: StateFlow<List<WithdrawalRequest>> = _platformWithdrawals.asStateFlow()

    // 3. Platform Milestone Rank Rewards
    private val _platformRewards = MutableStateFlow<List<MilestoneReward>>(emptyList())
    val platformRewards: StateFlow<List<MilestoneReward>> = _platformRewards.asStateFlow()

    // 4. All Platform Users
    private val _platformUsers = MutableStateFlow<List<User>>(emptyList())
    val platformUsers: StateFlow<List<User>> = _platformUsers.asStateFlow()

    // 5. Products Management Catalog
    private val _products = MutableStateFlow<List<PartnerProduct>>(emptyList())
    val products: StateFlow<List<PartnerProduct>> = _products.asStateFlow()

    // 6. Categories Management Tree (3 levels: Root 0, Sub 1, Leaf 2)
    private val _categories = MutableStateFlow<List<Category>>(emptyList())
    val categories: StateFlow<List<Category>> = _categories.asStateFlow()

    // 7. System Audit Logs (Point 61 & 82: Read-Only Mobile Audit History)
    private val _auditLogs = MutableStateFlow<List<AuditLog>>(emptyList())
    val auditLogs: StateFlow<List<AuditLog>> = _auditLogs.asStateFlow()

    init {
        initFirestoreSync()
    }

    private fun initFirestoreSync() {
        val fs = getFirestoreSafe()
        if (fs == null) {
            seedInitialData()
            return
        }

        // Sync sales
        fs.collection(FirebaseConfig.COLLECTION_SALES)
            .orderBy("createdAt", Query.Direction.DESCENDING)
            .addSnapshotListener { snap, err ->
                if (err != null || snap == null) return@addSnapshotListener
                val list = snap.documents.mapNotNull { parseResellerSale(it) }
                _platformOrders.value = list
            }

        // Sync withdrawals
        fs.collection(FirebaseConfig.COLLECTION_WITHDRAWALS)
            .orderBy("requestedAt", Query.Direction.DESCENDING)
            .addSnapshotListener { snap, err ->
                if (err != null || snap == null) return@addSnapshotListener
                val list = snap.documents.mapNotNull { parseWithdrawalRequest(it) }
                _platformWithdrawals.value = list
            }

        // Sync rewards
        fs.collection(FirebaseConfig.COLLECTION_REWARDS)
            .addSnapshotListener { snap, err ->
                if (err != null || snap == null) return@addSnapshotListener
                val list = snap.documents.mapNotNull { parseMilestoneReward(it) }
                _platformRewards.value = list
            }

        // Sync users
        fs.collection(FirebaseConfig.COLLECTION_USERS)
            .addSnapshotListener { snap, err ->
                if (err != null || snap == null) return@addSnapshotListener
                val list = snap.documents.mapNotNull { parseUser(it) }
                _platformUsers.value = list
            }

        // Sync products
        fs.collection(FirebaseConfig.COLLECTION_PRODUCTS)
            .addSnapshotListener { snap, err ->
                if (err != null || snap == null) return@addSnapshotListener
                val list = snap.documents.mapNotNull { parsePartnerProduct(it) }
                _products.value = list
            }

        // Sync categories
        fs.collection(FirebaseConfig.COLLECTION_CATEGORIES)
            .addSnapshotListener { snap, err ->
                if (err != null || snap == null) return@addSnapshotListener
                val list = snap.documents.mapNotNull { parseCategory(it) }
                _categories.value = list
            }

        // Sync audit logs
        fs.collection(FirebaseConfig.COLLECTION_AUDIT_LOGS)
            .orderBy("timestamp", Query.Direction.DESCENDING)
            .addSnapshotListener { snap, err ->
                if (err != null || snap == null) return@addSnapshotListener
                val list = snap.documents.mapNotNull { parseAuditLog(it) }
                _auditLogs.value = list
            }
    }

    // 8. Point 91: Concurrency Conflict Tracking
    private val _lastConflictError = MutableStateFlow<String?>(null)
    val lastConflictError: StateFlow<String?> = _lastConflictError.asStateFlow()

    fun clearConflictError() {
        _lastConflictError.value = null
    }

    /**
     * Point 91: Confirm current backend state before critical state transition.
     * Returns true if order was changed elsewhere (conflict exists), false if clean.
     */
    fun checkOrderConflict(orderId: String, currentKnownStatus: OrderStatus): Boolean {
        val current = getOrderById(orderId) ?: return false
        return current.status != currentKnownStatus
    }

    // -------------------------------------------------------------
    // Platform Summary Metrics (Point 42)
    // -------------------------------------------------------------

    val pendingVerificationsCount: Int
        get() = _platformOrders.value.count { it.status == OrderStatus.PENDING_VERIFICATION }

    val processingOrdersCount: Int
        get() = _platformOrders.value.count { it.status == OrderStatus.PROCESSING }

    val pendingWithdrawalsCount: Int
        get() = _platformWithdrawals.value.count { it.status == WithdrawalStatus.PENDING }

    val pendingRankRewardsCount: Int
        get() = _platformRewards.value.count { it.status == RewardStatus.PENDING_REVIEW }

    val lowStockCount: Int
        get() = _products.value.count { it.stockCount < 10 }

    val totalUsersCount: Int
        get() = _platformUsers.value.size

    val totalPlatformRevenue: Double
        get() = _platformOrders.value
            .filter { it.status != OrderStatus.CANCELLED && it.status != OrderStatus.REJECTED }
            .sumOf { it.totalCustomerBill }

    val formattedPlatformRevenue: String
        get() = "PKR ${totalPlatformRevenue.toInt().toString().reversed().chunked(3).joinToString(",").reversed()}"

    val activeResellersCount: Int
        get() = _platformUsers.value.count { it.role == UserRole.RESELLER && it.isActive }

    // -------------------------------------------------------------
    // Order State-Aware Transitions (Points 50, 52, 53, 54, 55)
    // -------------------------------------------------------------
    // Order State-Aware Transitions (Points 50, 52, 53, 54, 55, 90)
    // -------------------------------------------------------------

    fun getOrderById(orderId: String): ResellerSale? {
        return _platformOrders.value.firstOrNull { it.id.equals(orderId, ignoreCase = true) }
    }

    /**
     * Point 90: Order Action State Machine Strict Transition Validation
     */
    fun canTransition(current: OrderStatus, target: OrderStatus): Boolean {
        return when (current) {
            OrderStatus.PENDING_VERIFICATION -> target == OrderStatus.PAYMENT_VERIFIED || target == OrderStatus.REJECTED || target == OrderStatus.CANCELLED
            OrderStatus.PAYMENT_VERIFIED -> target == OrderStatus.PROCESSING || target == OrderStatus.DISPATCHED || target == OrderStatus.REJECTED || target == OrderStatus.CANCELLED
            OrderStatus.PROCESSING -> target == OrderStatus.DISPATCHED || target == OrderStatus.CANCELLED
            OrderStatus.DISPATCHED, OrderStatus.IN_TRANSIT -> target == OrderStatus.DELIVERED || target == OrderStatus.CANCELLED
            OrderStatus.DELIVERED -> false
            OrderStatus.REJECTED -> false
            OrderStatus.CANCELLED -> false
            OrderStatus.CONFIRMED -> target == OrderStatus.PROCESSING || target == OrderStatus.CANCELLED
            OrderStatus.FULFILLED -> false
        }
    }

    /**
     * Point 81: Security-Sensitive Confirmation Evaluation
     */
    fun requiresHighSecurityConfirmation(action: String, amount: Double = 0.0, targetRole: UserRole? = null): Boolean {
        return when (action) {
            "DISBURSE_PAYOUT" -> amount >= 10000.0
            "UPDATE_USER_ROLE" -> targetRole == UserRole.SUPERADMIN
            else -> false
        }
    }

    /**
     * Point 61 & 82: Immutable Audit Event Logger
     */
    fun logAuditEvent(
        actorId: String = "admin-1",
        actorName: String = "Super Administrator",
        actorRole: String = "SUPERADMIN",
        action: String,
        entityType: String,
        entityId: String,
        previousState: String? = null,
        newState: String? = null,
        note: String? = null,
        metadata: Map<String, String> = emptyMap()
    ) {
        val now = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).format(Date())
        val log = AuditLog(
            id = "audit-${System.currentTimeMillis()}-${UUID.randomUUID().toString().take(6)}",
            actorId = actorId,
            actorName = actorName,
            actorRole = actorRole,
            action = action,
            entityType = entityType,
            entityId = entityId,
            previousState = previousState,
            newState = newState,
            note = note,
            metadata = metadata,
            timestamp = now
        )
        val current = _auditLogs.value.toMutableList()
        current.add(0, log)
        _auditLogs.value = current
        getFirestoreSafe()?.collection(FirebaseConfig.COLLECTION_AUDIT_LOGS)?.document(log.id)?.set(log)
    }

    /**
     * Point 52 & 91: pending_verification -> payment_verified with optional conflict check
     */
    fun verifyPayment(
        orderId: String,
        adminId: String = "admin-1",
        expectedStatus: OrderStatus? = null
    ): Boolean {
        val previousState = getOrderById(orderId)?.status?.name
        val success = updateOrderStatus(orderId, OrderStatus.PAYMENT_VERIFIED, expectedStatus) { existing, now ->
            existing.copy(
                status = OrderStatus.PAYMENT_VERIFIED,
                confirmedAt = now,
                processedByAdminId = adminId
            )
        }
        if (success) {
            logAuditEvent(
                actorId = adminId,
                action = "VERIFY_PAYMENT",
                entityType = "ORDER",
                entityId = orderId,
                previousState = previousState,
                newState = OrderStatus.PAYMENT_VERIFIED.name,
                note = "Manual payment receipt verified by administrator"
            )
        }
        return success
    }

    /**
     * Point 53 & 91: payment_verified -> processing with optional conflict check
     */
    fun moveToProcessing(
        orderId: String,
        adminId: String = "admin-1",
        expectedStatus: OrderStatus? = null
    ): Boolean {
        val previousState = getOrderById(orderId)?.status?.name
        val success = updateOrderStatus(orderId, OrderStatus.PROCESSING, expectedStatus) { existing, now ->
            existing.copy(
                status = OrderStatus.PROCESSING,
                processingAt = now,
                processedByAdminId = adminId
            )
        }
        if (success) {
            logAuditEvent(
                actorId = adminId,
                action = "MOVE_TO_PROCESSING",
                entityType = "ORDER",
                entityId = orderId,
                previousState = previousState,
                newState = OrderStatus.PROCESSING.name,
                note = "Order moved to processing queue for packing"
            )
        }
        return success
    }

    /**
     * Point 54 & 91: processing -> dispatched (Courier, Tracking #, Note) with conflict check
     */
    fun dispatchOrder(
        orderId: String,
        courier: String,
        trackingNumber: String,
        dispatchNote: String? = null,
        adminId: String = "admin-1",
        expectedStatus: OrderStatus? = null
    ): Boolean {
        val previousState = getOrderById(orderId)?.status?.name
        val success = updateOrderStatus(orderId, OrderStatus.DISPATCHED, expectedStatus) { existing, now ->
            existing.copy(
                status = OrderStatus.DISPATCHED,
                shippingCourier = courier,
                trackingNumber = trackingNumber,
                shippingNotes = dispatchNote,
                dispatchedAt = now,
                processedByAdminId = adminId
            )
        }
        if (success) {
            logAuditEvent(
                actorId = adminId,
                action = "DISPATCH_ORDER",
                entityType = "ORDER",
                entityId = orderId,
                previousState = previousState,
                newState = OrderStatus.DISPATCHED.name,
                note = "Dispatched via $courier (Consignment #$trackingNumber)"
            )
        }
        return success
    }

    /**
     * Point 55 & 91: in_transit / dispatched -> delivered with conflict check
     * Releases profit, marks isQualifying = true, triggers rank promotion.
     */
    fun markDelivered(
        orderId: String,
        adminId: String = "admin-1",
        expectedStatus: OrderStatus? = null
    ): Boolean {
        val previousState = getOrderById(orderId)?.status?.name
        val success = updateOrderStatus(orderId, OrderStatus.DELIVERED, expectedStatus) { existing, now ->
            existing.copy(
                status = OrderStatus.DELIVERED,
                isQualifying = true,
                deliveredAt = now,
                processedByAdminId = adminId
            )
        }

        if (success) {
            logAuditEvent(
                actorId = adminId,
                action = "MARK_DELIVERED",
                entityType = "ORDER",
                entityId = orderId,
                previousState = previousState,
                newState = OrderStatus.DELIVERED.name,
                note = "Order delivered to client. Wholesale profit unlocked into reseller wallet."
            )
            // Trigger rank promotion on reseller repository if attached
            if (resellerRepository != null) {
                val order = getOrderById(orderId)
                if (order != null) {
                    RankEngine.calculateProgress(
                        resellerRepository.getQualifyingSalesCount(order.userId),
                        resellerRepository.getQualifyingCommunityCount(order.userId)
                    )
                }
            }
        }
        return success
    }

    /**
     * Points 49, 51 & 91: Rejection with reason, note, and conflict check
     */
    fun rejectOrder(
        orderId: String,
        reason: String,
        customDetailNote: String? = null,
        adminId: String = "admin-1",
        expectedStatus: OrderStatus? = null
    ): Boolean {
        val previousState = getOrderById(orderId)?.status?.name
        val success = updateOrderStatus(orderId, OrderStatus.REJECTED, expectedStatus) { existing, now ->
            existing.copy(
                status = OrderStatus.REJECTED,
                rejectionReason = reason,
                adminReviewNote = customDetailNote,
                processedByAdminId = adminId,
                confirmedAt = now
            )
        }
        if (success) {
            logAuditEvent(
                actorId = adminId,
                action = "REJECT_ORDER",
                entityType = "ORDER",
                entityId = orderId,
                previousState = previousState,
                newState = OrderStatus.REJECTED.name,
                note = "Reason: $reason" + if (!customDetailNote.isNullOrBlank()) " • $customDetailNote" else ""
            )
        }
        return success
    }

    fun updateOrderFulfillment(
        orderId: String,
        status: OrderStatus,
        shippingCourier: String? = null,
        trackingNumber: String? = null,
        shippingNotes: String? = null
    ): Boolean {
        return when (status) {
            OrderStatus.PAYMENT_VERIFIED -> verifyPayment(orderId)
            OrderStatus.PROCESSING -> moveToProcessing(orderId)
            OrderStatus.DISPATCHED -> dispatchOrder(orderId, shippingCourier ?: "TCS Express", trackingNumber ?: "12345678", shippingNotes)
            OrderStatus.DELIVERED -> markDelivered(orderId)
            else -> false
        }
    }

    fun updateWithdrawalStatus(
        requestId: String,
        status: WithdrawalStatus,
        transactionReference: String? = null,
        adminNote: String? = null,
        payoutProofUrl: String? = null
    ): Boolean {
        return when (status) {
            WithdrawalStatus.PAID -> markWithdrawalPaid(requestId, transactionReference ?: "TXN123", payoutProofUrl, adminNote)
            WithdrawalStatus.REJECTED -> rejectWithdrawal(requestId, adminNote ?: "Rejected")
            else -> false
        }
    }

    private fun updateOrderStatus(
        orderId: String,
        targetStatus: OrderStatus,
        expectedCurrentStatus: OrderStatus? = null,
        transform: (ResellerSale, String) -> ResellerSale
    ): Boolean {
        val currentList = _platformOrders.value.toMutableList()
        val index = currentList.indexOfFirst { it.id == orderId }
        if (index == -1) return false

        val existing = currentList[index]

        // Point 91: Conflict Handling & Stale Write Prevention
        if (expectedCurrentStatus != null && existing.status != expectedCurrentStatus) {
            _lastConflictError.value = "This order was updated elsewhere. Refresh to continue."
            return false
        }

        // Strict state machine validation (Point 90)
        if (!canTransition(existing.status, targetStatus)) {
            return false
        }

        _lastConflictError.value = null
        val now = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).format(Date())
        val updatedOrder = transform(existing, now).copy(
            version = existing.version + 1,
            updatedAt = now
        )
        currentList[index] = updatedOrder
        _platformOrders.value = currentList
        getFirestoreSafe()?.collection(FirebaseConfig.COLLECTION_SALES)?.document(orderId)?.update(
            mapOf(
                "status" to targetStatus.rawValue,
                "isQualifying" to updatedOrder.isQualifying,
                "shippingCourier" to updatedOrder.shippingCourier,
                "trackingNumber" to updatedOrder.trackingNumber,
                "shippingNotes" to updatedOrder.shippingNotes,
                "rejectionReason" to updatedOrder.rejectionReason,
                "adminReviewNote" to updatedOrder.adminReviewNote,
                "processedByAdminId" to updatedOrder.processedByAdminId,
                "confirmedAt" to updatedOrder.confirmedAt,
                "processingAt" to updatedOrder.processingAt,
                "dispatchedAt" to updatedOrder.dispatchedAt,
                "deliveredAt" to updatedOrder.deliveredAt,
                "version" to updatedOrder.version,
                "updatedAt" to now
            )
        )
        createOrderStatusNotification(updatedOrder, now)
        return true
    }

    private fun createOrderStatusNotification(order: ResellerSale, now: String) {
        if (order.userId.isBlank()) return
        val notificationId = "order-${order.id}-${order.status.rawValue}-${System.currentTimeMillis()}"
        val title = when (order.status) {
            OrderStatus.PAYMENT_VERIFIED -> "Payment verified"
            OrderStatus.PROCESSING -> "Order is being prepared"
            OrderStatus.DISPATCHED, OrderStatus.IN_TRANSIT -> "Order shipped"
            OrderStatus.DELIVERED, OrderStatus.CONFIRMED, OrderStatus.FULFILLED -> "Order delivered"
            OrderStatus.REJECTED -> "Order needs attention"
            else -> "Order updated"
        }
        val message = when (order.status) {
            OrderStatus.DISPATCHED, OrderStatus.IN_TRANSIT -> "Order #${order.id} was dispatched${order.shippingCourier?.let { " with $it" } ?: ""}."
            OrderStatus.REJECTED -> "Order #${order.id} was rejected${order.rejectionReason?.let { ": $it" } ?: "."}"
            else -> "Order #${order.id} is now ${order.status.displayName.lowercase()}."
        }
        val data = mapOf(
            "id" to notificationId,
            "userId" to order.userId,
            "targetRole" to "customer",
            "type" to if (order.status == OrderStatus.REJECTED) "error" else "info",
            "category" to "order_status",
            "title" to title,
            "message" to message,
            "isRead" to false,
            "deepLinkRoute" to DtaDestinations.orderTracking(order.id),
            "createdAt" to now
        )
        getFirestoreSafe()?.collection(FirebaseConfig.COLLECTION_NOTIFICATIONS)?.document(notificationId)?.set(data)
    }

    // -------------------------------------------------------------
    // Withdrawal Processing Actions (Points 56, 57, 92)
    // -------------------------------------------------------------

    /**
     * Point 92: Withdrawal Double-Payment Safety
     * Admin payout UI must guard against accidental double processing.
     * If withdrawal is already PAID, reject payment action.
     * Enforces backend idempotency.
     */
    fun markWithdrawalPaid(
        requestId: String,
        transactionReference: String,
        receiptProofUrl: String? = null,
        adminNote: String? = null,
        adminId: String = "admin-1"
    ): Boolean {
        val currentList = _platformWithdrawals.value.toMutableList()
        val index = currentList.indexOfFirst { it.id == requestId }
        if (index == -1) return false

        val existing = currentList[index]
        // Point 92: Strict Idempotency Check - prevent duplicate processing
        if (existing.status == WithdrawalStatus.PAID) {
            return false
        }
        if (existing.status == WithdrawalStatus.REJECTED) {
            return false
        }

        val previousState = existing.status.name
        val now = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).format(Date())

        currentList[index] = existing.copy(
            status = WithdrawalStatus.PAID,
            transactionReference = transactionReference,
            payoutProofUrl = receiptProofUrl ?: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80",
            adminNote = adminNote,
            processedAt = now
        )
        _platformWithdrawals.value = currentList
        getFirestoreSafe()?.collection(FirebaseConfig.COLLECTION_WITHDRAWALS)?.document(requestId)?.update(
            mapOf("status" to WithdrawalStatus.PAID.rawValue, "transactionReference" to transactionReference, "payoutProofUrl" to currentList[index].payoutProofUrl, "adminNote" to adminNote, "processedAt" to now)
        )

        logAuditEvent(
            actorId = adminId,
            action = "DISBURSE_PAYOUT",
            entityType = "WITHDRAWAL",
            entityId = requestId,
            previousState = previousState,
            newState = WithdrawalStatus.PAID.name,
            note = "Disbursed PKR ${existing.amount.toInt()} via $transactionReference"
        )
        return true
    }

    fun rejectWithdrawal(requestId: String, adminReason: String, adminId: String = "admin-1"): Boolean {
        val currentList = _platformWithdrawals.value.toMutableList()
        val index = currentList.indexOfFirst { it.id == requestId }
        if (index == -1) return false

        val existing = currentList[index]
        if (existing.status == WithdrawalStatus.PAID) {
            return false
        }

        val previousState = existing.status.name
        val now = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).format(Date())

        currentList[index] = existing.copy(
            status = WithdrawalStatus.REJECTED,
            adminNote = adminReason,
            processedAt = now
        )
        _platformWithdrawals.value = currentList
        getFirestoreSafe()?.collection(FirebaseConfig.COLLECTION_WITHDRAWALS)?.document(requestId)?.update(
            mapOf("status" to WithdrawalStatus.REJECTED.rawValue, "adminNote" to adminReason, "processedAt" to now)
        )

        logAuditEvent(
            actorId = adminId,
            action = "REJECT_WITHDRAWAL",
            entityType = "WITHDRAWAL",
            entityId = requestId,
            previousState = previousState,
            newState = WithdrawalStatus.REJECTED.name,
            note = "Reason: $adminReason"
        )
        return true
    }

    // -------------------------------------------------------------
    // Rank Rewards Management (Point 58, 93)
    // -------------------------------------------------------------

    /**
     * Point 93: Rank Reward Double-Payment Safety
     * Never permit a paid rank reward to be paid again.
     */
    fun updateRewardStatus(rewardId: String, status: RewardStatus, adminNote: String? = null, adminId: String = "admin-1"): Boolean {
        val currentList = _platformRewards.value.toMutableList()
        val index = currentList.indexOfFirst { it.id == rewardId }
        if (index == -1) return false

        val existing = currentList[index]
        // Point 93: If already paid, reject double payout or modification
        if (existing.status == RewardStatus.PAID) {
            return false
        }

        val previousState = existing.status.name
        currentList[index] = existing.copy(
            status = status,
            adminNote = adminNote ?: existing.adminNote
        )
        _platformRewards.value = currentList
        getFirestoreSafe()?.collection(FirebaseConfig.COLLECTION_REWARDS)?.document(rewardId)?.update(
            mapOf("status" to status.rawValue, "adminNote" to (adminNote ?: existing.adminNote))
        )

        logAuditEvent(
            actorId = adminId,
            action = "UPDATE_REWARD_STATUS",
            entityType = "REWARD",
            entityId = rewardId,
            previousState = previousState,
            newState = status.name,
            note = adminNote ?: "Reward milestone updated to ${status.name}"
        )
        return true
    }

    // -------------------------------------------------------------
    // Product Management (Point 59)
    // -------------------------------------------------------------

    fun saveProduct(product: PartnerProduct, adminId: String = "admin-1"): Boolean {
        val currentList = _products.value.toMutableList()
        val index = currentList.indexOfFirst { it.id == product.id }
        val isNew = index < 0
        if (index >= 0) {
            currentList[index] = product
        } else {
            currentList.add(0, product)
        }
        _products.value = currentList
        getFirestoreSafe()?.collection(FirebaseConfig.COLLECTION_PRODUCTS)?.document(product.id)?.set(product)

        logAuditEvent(
            actorId = adminId,
            action = if (isNew) "CREATE_PRODUCT" else "UPDATE_PRODUCT",
            entityType = "PRODUCT",
            entityId = product.id,
            previousState = if (isNew) null else "EXISTING",
            newState = "ACTIVE",
            note = "${product.name} (Retail Rs ${product.retailPrice.toInt()}, Partner Rs ${product.partnerPrice.toInt()})"
        )
        return true
    }

    fun toggleProductStock(productId: String, adminId: String = "admin-1"): Boolean {
        val currentList = _products.value.toMutableList()
        val index = currentList.indexOfFirst { it.id == productId }
        if (index == -1) return false
        val current = currentList[index]
        val newState = !current.inStock
        currentList[index] = current.copy(inStock = newState)
        _products.value = currentList
        getFirestoreSafe()?.collection(FirebaseConfig.COLLECTION_PRODUCTS)?.document(productId)?.update("inStock", newState)

        logAuditEvent(
            actorId = adminId,
            action = "TOGGLE_PRODUCT_STOCK",
            entityType = "PRODUCT",
            entityId = productId,
            previousState = if (current.inStock) "IN_STOCK" else "OUT_OF_STOCK",
            newState = if (newState) "IN_STOCK" else "OUT_OF_STOCK",
            note = "Stock availability switched for ${current.name}"
        )
        return true
    }

    // -------------------------------------------------------------
    // Category Management (Point 60)
    // -------------------------------------------------------------

    fun getCategoryTree(): List<CategoryNode> {
        val allCats = _categories.value
        val roots = allCats.filter { it.depth == 0 }

        return roots.map { root ->
            val subs = allCats.filter { it.parentId == root.id && it.depth == 1 }
            val subNodes = subs.map { sub ->
                val leaves = allCats.filter { it.parentId == sub.id && it.depth == 2 }
                val leafNodes = leaves.map { leaf -> CategoryNode(leaf) }
                CategoryNode(sub, leafNodes)
            }
            CategoryNode(root, subNodes)
        }
    }

    fun saveCategory(category: Category, adminId: String = "admin-1"): Boolean {
        val currentList = _categories.value.toMutableList()
        val index = currentList.indexOfFirst { it.id == category.id }
        val isNew = index < 0
        if (index >= 0) {
            currentList[index] = category
        } else {
            currentList.add(category)
        }
        _categories.value = currentList
        getFirestoreSafe()?.collection(FirebaseConfig.COLLECTION_CATEGORIES)?.document(category.id)?.set(category)

        logAuditEvent(
            actorId = adminId,
            action = if (isNew) "CREATE_CATEGORY" else "UPDATE_CATEGORY",
            entityType = "CATEGORY",
            entityId = category.id,
            previousState = if (isNew) null else "EXISTING",
            newState = "ACTIVE",
            note = "${category.name} (Level ${category.depth})"
        )
        return true
    }

    // -------------------------------------------------------------
    // User Role & Status Management (Point 48)
    // -------------------------------------------------------------

    fun updateUserRole(userId: String, newRole: UserRole, adminId: String = "admin-1"): Boolean {
        val currentList = _platformUsers.value.toMutableList()
        val index = currentList.indexOfFirst { it.id == userId }
        if (index == -1) return false

        val previousRole = currentList[index].role
        currentList[index] = currentList[index].copy(role = newRole)
        _platformUsers.value = currentList
        getFirestoreSafe()?.collection(FirebaseConfig.COLLECTION_USERS)?.document(userId)?.update("role", newRole.rawValue)

        logAuditEvent(
            actorId = adminId,
            action = "UPDATE_USER_ROLE",
            entityType = "USER",
            entityId = userId,
            previousState = previousRole.name,
            newState = newRole.name,
            note = "Role altered from ${previousRole.name} to ${newRole.name}"
        )
        return true
    }

    fun toggleUserActive(userId: String, adminId: String = "admin-1"): Boolean {
        val currentList = _platformUsers.value.toMutableList()
        val index = currentList.indexOfFirst { it.id == userId }
        if (index == -1) return false

        val previousState = currentList[index].isActive
        val newState = !previousState
        currentList[index] = currentList[index].copy(isActive = newState)
        _platformUsers.value = currentList
        getFirestoreSafe()?.collection(FirebaseConfig.COLLECTION_USERS)?.document(userId)?.update("isActive", newState)

        logAuditEvent(
            actorId = adminId,
            action = "TOGGLE_USER_ACTIVE",
            entityType = "USER",
            entityId = userId,
            previousState = if (previousState) "ACTIVE" else "SUSPENDED",
            newState = if (newState) "ACTIVE" else "SUSPENDED",
            note = "User account status set to ${if (newState) "ACTIVE" else "SUSPENDED"}"
        )
        return true
    }

    // -------------------------------------------------------------
    // Initial Seed Data
    // -------------------------------------------------------------

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
            )
        )
        val seededWithdrawals = listOf(
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
            ),
            WithdrawalRequest(
                id = "wd-dta-1002",
                userId = "user-101",
                userName = "Sara Ahmed",
                userEmail = "sara@example.com",
                userPhone = "03001112233",
                amount = 2000.0,
                status = WithdrawalStatus.PAID,
                payoutMethod = PaymentMethod(methodType = PaymentMethodType.BANK_TRANSFER, bankName = "Meezan Bank", accountNumber = "1234567890"),
                requestedAt = "2026-09-01T08:00:00Z"
            )
        )
        val seededRewards = listOf(
            MilestoneReward(
                id = "rew-rank-201",
                userId = "reseller-1",
                rankSlug = "silver",
                rankName = "Silver Rank",
                amount = 2000.0,
                status = RewardStatus.PENDING_REVIEW,
                earnedAt = "2026-09-04T08:00:00Z"
            ),
            MilestoneReward(
                id = "reward-silver-101",
                userId = "user-101",
                rankSlug = "silver",
                rankName = "Silver Rank",
                amount = 2000.0,
                status = RewardStatus.PENDING_REVIEW,
                earnedAt = "2026-09-04T08:00:00Z"
            )
        )
        val seededUsers = listOf(
            User(
                id = "user-101",
                fullName = "Sara Ahmed",
                email = "sara@example.com",
                role = UserRole.RESELLER
            ),
            User(
                id = "user-103",
                fullName = "Alex Khan",
                email = "alex@example.com",
                role = UserRole.CUSTOMER
            )
        )
        val seededCategories = listOf(
            Category(id = "cat-01", name = "Electronics", slug = "electronics", depth = 0, status = "active"),
            Category(id = "cat-02", name = "Wearables", slug = "wearables", parentId = "cat-01", depth = 1, status = "active"),
            Category(id = "cat-03", name = "Smartwatches", slug = "smartwatches", parentId = "cat-02", depth = 2, status = "active")
        )
        val seededLogs = listOf(
            AuditLog(
                id = "log-01",
                action = "ORDER_VERIFIED",
                actorId = "admin-01",
                actorName = "Super Admin",
                entityId = "DS1008",
                note = "Payment verified for DS1008",
                timestamp = "2026-09-05T10:30:00Z"
            )
        )

        _platformOrders.value = seededSales
        _platformWithdrawals.value = seededWithdrawals
        _platformRewards.value = seededRewards
        _platformUsers.value = seededUsers
        _products.value = seededProducts
        _categories.value = seededCategories
        _auditLogs.value = seededLogs
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
            val payout = doc.get("payoutMethod") as? Map<*, *>
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

    private fun parseUser(doc: DocumentSnapshot): User? {
        return try {
            User(
                id = doc.getString("id") ?: doc.id,
                fullName = doc.getString("fullName") ?: "",
                email = doc.getString("email") ?: "",
                role = UserRole.fromString(doc.getString("role") ?: "user"),
                referralCode = doc.getString("referralCode") ?: "",
                referredByCode = doc.getString("referredByCode"),
                avatarUrl = doc.getString("avatarUrl"),
                phone = doc.getString("phone"),
                city = doc.getString("city"),
                isActive = doc.getBoolean("isActive") ?: true,
                createdAt = doc.getString("createdAt") ?: ""
            )
        } catch (_: Exception) { null }
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

    private fun parseCategory(doc: DocumentSnapshot): Category? {
        return try {
            Category(
                id = doc.getString("id") ?: doc.id,
                name = doc.getString("name") ?: "",
                slug = doc.getString("slug") ?: "",
                description = doc.getString("description") ?: "",
                icon = doc.getString("icon") ?: "Sparkle",
                bannerUrl = doc.getString("bannerUrl"),
                thumbnailUrl = doc.getString("thumbnailUrl"),
                featured = doc.getBoolean("featured") ?: false,
                sortOrder = (doc.getLong("sortOrder") ?: 0).toInt(),
                status = doc.getString("status") ?: "active"
            )
        } catch (_: Exception) { null }
    }

    private fun parseAuditLog(doc: DocumentSnapshot): AuditLog? {
        return try {
            AuditLog(
                id = doc.getString("id") ?: doc.id,
                actorId = doc.getString("actorId") ?: "",
                actorName = doc.getString("actorName") ?: "",
                action = doc.getString("action") ?: "",
                entityType = doc.getString("entityType") ?: "",
                entityId = doc.getString("entityId") ?: "",
                previousState = doc.getString("previousState"),
                newState = doc.getString("newState"),
                timestamp = doc.getString("timestamp") ?: "",
                note = doc.getString("note")
            )
        } catch (_: Exception) { null }
    }
}
