package com.dreamtoachievers.app.core.data

import com.dreamtoachievers.app.core.firebase.FirebaseConfig
import com.dreamtoachievers.app.core.model.Notification
import com.dreamtoachievers.app.core.model.UserRole
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.tasks.await

class NotificationRepository(
    private val firestore: FirebaseFirestore? = null
) {
    private fun getFirestoreSafe(): FirebaseFirestore? {
        if (firestore != null) return firestore
        return try {
            FirebaseFirestore.getInstance()
        } catch (_: Exception) {
            null
        }
    }

    /**
     * Point 62 & 87: Role-Aware Notification observation with deepLink routing
     */
    fun observeNotifications(userId: String, role: UserRole = UserRole.CUSTOMER): Flow<List<Notification>> = callbackFlow {
        val fs = getFirestoreSafe()
        if (userId.isBlank() || fs == null) {
            trySend(emptyList())
            close()
            return@callbackFlow
        }

        val listener = fs.collection(FirebaseConfig.COLLECTION_NOTIFICATIONS)
            .whereEqualTo("userId", userId)
            .orderBy("createdAt", Query.Direction.DESCENDING)
            .limit(30)
            .addSnapshotListener { snapshot, error ->
                if (error != null || snapshot == null) {
                    trySend(emptyList())
                    return@addSnapshotListener
                }

                val list = snapshot.documents.mapNotNull { doc ->
                    try {
                        Notification(
                            id = doc.getString("id") ?: doc.id,
                            userId = doc.getString("userId") ?: "",
                            targetRole = doc.getString("targetRole")?.let { r ->
                                try { UserRole.valueOf(r.uppercase()) } catch (_: Exception) { null }
                            } ?: role,
                            type = doc.getString("type") ?: "info",
                            category = doc.getString("category") ?: "general",
                            title = doc.getString("title") ?: "",
                            message = doc.getString("message") ?: "",
                            isRead = doc.getBoolean("isRead") ?: false,
                            linkUrl = doc.getString("linkUrl"),
                            deepLinkRoute = doc.getString("deepLinkRoute"),
                            createdAt = doc.getString("createdAt") ?: ""
                        )
                    } catch (_: Exception) {
                        null
                    }
                }
                trySend(list)
            }

        awaitClose { listener.remove() }
    }

    suspend fun markAsRead(notificationId: String) {
        val fs = getFirestoreSafe() ?: return
        try {
            fs.collection(FirebaseConfig.COLLECTION_NOTIFICATIONS)
                .document(notificationId)
                .update("isRead", true)
                .await()
        } catch (e: Exception) {
            // Best effort offline
        }
    }

    /**
     * Point 62 & 87: Canonical Role-Aware Notifications matching reference specifications
     */
    fun createInitialRoleNotifications(role: UserRole): List<Notification> {
        return when (role) {
            UserRole.RESELLER -> listOf(
                Notification(
                    id = "notif-reseller-1",
                    userId = "reseller-1",
                    targetRole = UserRole.RESELLER,
                    type = "success",
                    category = "PAYMENT_VERIFIED",
                    title = "Payment Verified",
                    message = "Payment proof verified for order #DS1007.",
                    deepLinkRoute = com.dreamtoachievers.app.core.navigation.DtaDestinations.resellerOrderTracking("DS1007")
                ),
                Notification(
                    id = "notif-reseller-2",
                    userId = "reseller-1",
                    targetRole = UserRole.RESELLER,
                    type = "info",
                    category = "ORDER_PROCESSING",
                    title = "Order Processing",
                    message = "Order #DS1007 is now in processing.",
                    deepLinkRoute = com.dreamtoachievers.app.core.navigation.DtaDestinations.RESELLER_ORDERS
                ),
                Notification(
                    id = "notif-reseller-3",
                    userId = "reseller-1",
                    targetRole = UserRole.RESELLER,
                    type = "success",
                    category = "ORDER_DELIVERED",
                    title = "Order Delivered",
                    message = "Order #DS1006 has been delivered.",
                    deepLinkRoute = com.dreamtoachievers.app.core.navigation.DtaDestinations.RESELLER_ORDERS
                ),
                Notification(
                    id = "notif-reseller-4",
                    userId = "reseller-1",
                    targetRole = UserRole.RESELLER,
                    type = "success",
                    category = "PROFIT_RELEASED",
                    title = "Profit Released",
                    message = "Wholesale profit credited to your wallet.",
                    deepLinkRoute = com.dreamtoachievers.app.core.navigation.DtaDestinations.RESELLER_WALLET
                ),
                Notification(
                    id = "notif-reseller-5",
                    userId = "reseller-1",
                    targetRole = UserRole.RESELLER,
                    type = "success",
                    category = "WITHDRAWAL_APPROVED",
                    title = "Withdrawal Approved",
                    message = "Your withdrawal request was disbursed.",
                    deepLinkRoute = com.dreamtoachievers.app.core.navigation.DtaDestinations.RESELLER_WALLET
                ),
                Notification(
                    id = "notif-reseller-6",
                    userId = "reseller-1",
                    targetRole = UserRole.RESELLER,
                    type = "achievement",
                    category = "RANK_ACHIEVED",
                    title = "Rank Milestone Achieved",
                    message = "Congratulations! You reached Silver Rank.",
                    deepLinkRoute = com.dreamtoachievers.app.core.navigation.DtaDestinations.RESELLER_GROWTH
                )
            )
            UserRole.ADMIN, UserRole.SUPERADMIN -> listOf(
                Notification(
                    id = "notif-admin-1",
                    userId = "admin-1",
                    targetRole = UserRole.ADMIN,
                    type = "warning",
                    category = "PAYMENT_PROOF_SUBMITTED",
                    title = "New Payment Receipt",
                    message = "Order #DS1008 submitted payment proof.",
                    deepLinkRoute = com.dreamtoachievers.app.core.navigation.DtaDestinations.adminOrderReview("DS1008")
                ),
                Notification(
                    id = "notif-admin-2",
                    userId = "admin-1",
                    targetRole = UserRole.ADMIN,
                    type = "info",
                    category = "PENDING_WITHDRAWAL",
                    title = "Withdrawal Request Pending",
                    message = "New payout request awaiting approval.",
                    deepLinkRoute = com.dreamtoachievers.app.core.navigation.DtaDestinations.ADMIN_WITHDRAWALS
                ),
                Notification(
                    id = "notif-admin-3",
                    userId = "admin-1",
                    targetRole = UserRole.ADMIN,
                    type = "info",
                    category = "REWARD_REVIEW",
                    title = "Rank Reward Audit",
                    message = "Rank milestone reward pending review.",
                    deepLinkRoute = com.dreamtoachievers.app.core.navigation.DtaDestinations.ADMIN_RANK_REWARDS
                ),
                Notification(
                    id = "notif-admin-4",
                    userId = "admin-1",
                    targetRole = UserRole.ADMIN,
                    type = "warning",
                    category = "LOW_STOCK",
                    title = "Low Stock Alert",
                    message = "Item inventory is running low.",
                    deepLinkRoute = com.dreamtoachievers.app.core.navigation.DtaDestinations.ADMIN_PRODUCTS
                ),
                Notification(
                    id = "notif-admin-5",
                    userId = "admin-1",
                    targetRole = UserRole.ADMIN,
                    type = "alert",
                    category = "VERIFICATION_ISSUE",
                    title = "Verification Issue",
                    message = "Payment receipt rejected for review.",
                    deepLinkRoute = com.dreamtoachievers.app.core.navigation.DtaDestinations.ADMIN_ORDERS
                )
            )
            UserRole.CUSTOMER -> listOf(
                Notification(
                    id = "notif-cust-1",
                    userId = "user-101",
                    targetRole = UserRole.CUSTOMER,
                    type = "info",
                    category = "ORDER_CREATED",
                    title = "Order Confirmed",
                    message = "Your order has been received.",
                    deepLinkRoute = com.dreamtoachievers.app.core.navigation.DtaDestinations.ORDER_TRACKING
                ),
                Notification(
                    id = "notif-cust-2",
                    userId = "user-101",
                    targetRole = UserRole.CUSTOMER,
                    type = "promo",
                    category = "SPECIAL_PROMO",
                    title = "Promotional Discount",
                    message = "Exclusive deals available.",
                    deepLinkRoute = com.dreamtoachievers.app.core.navigation.DtaDestinations.MARKET
                )
            )
        }
    }
}
