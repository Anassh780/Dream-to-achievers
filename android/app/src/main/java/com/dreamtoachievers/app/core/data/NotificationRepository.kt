package com.dreamtoachievers.app.core.data

import com.dreamtoachievers.app.core.firebase.FirebaseConfig
import com.dreamtoachievers.app.core.model.Notification
import com.dreamtoachievers.app.core.model.UserRole
import com.dreamtoachievers.app.core.navigation.DtaDestinations
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
                    } catch (e: Exception) {
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
                    id = "notif-res-1",
                    targetRole = UserRole.RESELLER,
                    category = "PAYMENT_VERIFIED",
                    title = "Payment Slip Verified",
                    message = "Client payment of Rs 17,998 for Order #DS1007 verified by Admin.",
                    deepLinkRoute = DtaDestinations.resellerOrderTracking("DS1007"),
                    createdAt = "2026-09-03T09:15:00Z"
                ),
                Notification(
                    id = "notif-res-2",
                    targetRole = UserRole.RESELLER,
                    category = "ORDER_PROCESSING",
                    title = "Order in Fulfillment",
                    message = "Order #DS1007 is packed and awaiting courier pickup.",
                    deepLinkRoute = DtaDestinations.resellerOrderTracking("DS1007"),
                    createdAt = "2026-09-03T11:30:00Z"
                ),
                Notification(
                    id = "notif-res-3",
                    targetRole = UserRole.RESELLER,
                    category = "ORDER_DELIVERED",
                    title = "Delivery Confirmed",
                    message = "Order #DS1002 delivered to customer in Lahore.",
                    deepLinkRoute = DtaDestinations.resellerOrderTracking("DS1002"),
                    createdAt = "2026-09-02T16:45:00Z"
                ),
                Notification(
                    id = "notif-res-4",
                    targetRole = UserRole.RESELLER,
                    category = "PROFIT_RELEASED",
                    title = "Wholesale Profit Released",
                    message = "+PKR 2,000 profit unlocked into your Available Wallet balance.",
                    deepLinkRoute = DtaDestinations.RESELLER_WALLET,
                    createdAt = "2026-09-02T16:46:00Z"
                ),
                Notification(
                    id = "notif-res-5",
                    targetRole = UserRole.RESELLER,
                    category = "WITHDRAWAL_APPROVED",
                    title = "Withdrawal Disbursed",
                    message = "PKR 2,000 sent to EasyPaisa (03001234567). TXN: EP-776611.",
                    deepLinkRoute = DtaDestinations.RESELLER_WALLET,
                    createdAt = "2026-09-02T12:00:00Z"
                ),
                Notification(
                    id = "notif-res-6",
                    targetRole = UserRole.RESELLER,
                    category = "RANK_ACHIEVED",
                    title = "Milestone Rank Unlocked!",
                    message = "You achieved Silver Rank! (10 sales • 20 community members)",
                    deepLinkRoute = DtaDestinations.RESELLER_GROWTH,
                    createdAt = "2026-09-01T18:00:00Z"
                ),
                Notification(
                    id = "notif-res-7",
                    targetRole = UserRole.RESELLER,
                    category = "REWARD_APPROVED",
                    title = "Milestone Reward Approved",
                    message = "Admin approved your PKR 2,000 Silver bonus reward.",
                    deepLinkRoute = DtaDestinations.RESELLER_GROWTH,
                    createdAt = "2026-09-01T18:30:00Z"
                ),
                Notification(
                    id = "notif-res-8",
                    targetRole = UserRole.RESELLER,
                    category = "NEW_REFERRAL",
                    title = "New Partner Joined Your Team",
                    message = "Hamza joined your direct community tier using code DTA-ALEX91.",
                    deepLinkRoute = DtaDestinations.RESELLER_TEAM,
                    createdAt = "2026-08-31T14:10:00Z"
                )
            )
            UserRole.ADMIN, UserRole.SUPERADMIN -> listOf(
                Notification(
                    id = "notif-adm-1",
                    targetRole = role,
                    category = "PAYMENT_PROOF_SUBMITTED",
                    title = "New Payment Proof Submitted",
                    message = "Order #DS1008 uploaded EasyPaisa slip (Rs 12,500) awaiting verification.",
                    deepLinkRoute = DtaDestinations.adminOrderReview("DS1008"),
                    createdAt = "2026-09-03T15:40:00Z"
                ),
                Notification(
                    id = "notif-adm-2",
                    targetRole = role,
                    category = "PENDING_WITHDRAWAL",
                    title = "Pending Partner Payout",
                    message = "Ali Khan requested PKR 6,500 payout to JazzCash.",
                    deepLinkRoute = DtaDestinations.ADMIN_WITHDRAWALS,
                    createdAt = "2026-09-03T14:00:00Z"
                ),
                Notification(
                    id = "notif-adm-3",
                    targetRole = role,
                    category = "REWARD_REVIEW",
                    title = "Pending Milestone Rank Reward",
                    message = "Platinum rank bonus (PKR 4,000) for Ali Khan ready for verification.",
                    deepLinkRoute = DtaDestinations.ADMIN_RANK_REWARDS,
                    createdAt = "2026-09-03T10:00:00Z"
                ),
                Notification(
                    id = "notif-adm-4",
                    targetRole = role,
                    category = "LOW_STOCK",
                    title = "Low Stock Consignment Alert",
                    message = "Max 1150 Ultra AMOLED Smartwatch has only 6 units left in stock.",
                    deepLinkRoute = DtaDestinations.ADMIN_PRODUCTS,
                    createdAt = "2026-09-03T08:00:00Z"
                ),
                Notification(
                    id = "notif-adm-5",
                    targetRole = role,
                    category = "VERIFICATION_ISSUE",
                    title = "Verification Flag",
                    message = "Duplicate transaction ID reported for manual slip review on Order #DS1005.",
                    deepLinkRoute = DtaDestinations.adminOrderReview("DS1005"),
                    createdAt = "2026-09-02T13:30:00Z"
                )
            )
            UserRole.CUSTOMER -> listOf(
                Notification(
                    id = "notif-cus-1",
                    targetRole = UserRole.CUSTOMER,
                    category = "ORDER_STATUS",
                    title = "Order #ORD-8822 Confirmed",
                    message = "Your order for Executive Formal Shoes has been dispatched via TCS.",
                    deepLinkRoute = DtaDestinations.orderTracking("ORD-8822"),
                    createdAt = "2026-09-03T12:00:00Z"
                ),
                Notification(
                    id = "notif-cus-2",
                    targetRole = UserRole.CUSTOMER,
                    category = "PROMO",
                    title = "New Autumn Arrivals",
                    message = "Discover the 2026 Luxury Egyptian Fabric collection.",
                    deepLinkRoute = DtaDestinations.MARKET,
                    createdAt = "2026-09-01T10:00:00Z"
                )
            )
        }
    }
}
