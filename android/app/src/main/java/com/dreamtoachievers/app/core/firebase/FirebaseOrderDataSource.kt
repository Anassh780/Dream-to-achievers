package com.dreamtoachievers.app.core.firebase

import android.net.Uri
import com.dreamtoachievers.app.core.model.Order
import com.dreamtoachievers.app.core.model.OrderStatus
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import com.google.firebase.storage.FirebaseStorage
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await
import java.text.SimpleDateFormat
import java.util.*

class FirebaseOrderDataSource(
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance(),
    private val rtdb: FirebaseDatabase = FirebaseDatabase.getInstance(),
    private val storage: FirebaseStorage = FirebaseStorage.getInstance()
) {

    suspend fun uploadPaymentReceipt(orderId: String, imageUri: Uri): String {
        return try {
            val ref = storage.reference.child("orders/$orderId/payment_receipt.jpg")
            ref.putFile(imageUri).await()
            ref.downloadUrl.await().toString()
        } catch (e: Exception) {
            // Fallback to local representation if storage upload encounters offline mode
            imageUri.toString()
        }
    }

    suspend fun submitOrder(order: Order): Result<Order> {
        return try {
            val orderId = if (order.id.isNotBlank()) order.id else "sale-${System.currentTimeMillis()}-${(100..999).random()}"
            val isoDate = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).apply {
                timeZone = TimeZone.getTimeZone("UTC")
            }.format(Date())

            val finalOrder = order.copy(
                id = orderId,
                status = OrderStatus.PENDING_VERIFICATION,
                createdAt = isoDate
            )

            val orderData = hashMapOf(
                "id" to finalOrder.id,
                "userId" to finalOrder.userId,
                "productId" to finalOrder.productId,
                "productName" to finalOrder.productName,
                "productImage" to finalOrder.productImage,
                "customerName" to finalOrder.customerName,
                "customerPhone" to finalOrder.customerPhone,
                "customerEmail" to finalOrder.customerEmail,
                "customerAddress" to finalOrder.customerAddress,
                "customerCity" to finalOrder.customerCity,
                "paymentScreenshotUrl" to (finalOrder.paymentScreenshotUrl ?: ""),
                "paymentProofNotes" to (finalOrder.paymentProofNotes ?: ""),
                "paymentMethod" to finalOrder.paymentMethod,
                "quantity" to finalOrder.quantity,
                "retailPrice" to finalOrder.retailPrice,
                "sellingPrice" to finalOrder.sellingPrice,
                "profitMargin" to 0.0, // Hidden / zeroed for customer creation
                "currency" to finalOrder.currency,
                "status" to finalOrder.status.rawValue,
                "isQualifying" to false,
                "createdAt" to finalOrder.createdAt
            )

            // 1. Write to Firestore 'sales' collection
            firestore.collection(FirebaseConfig.COLLECTION_SALES).document(orderId).set(orderData).await()

            // 2. Write to user's sales subcollection if userId present
            if (finalOrder.userId.isNotBlank()) {
                firestore.collection("users/${finalOrder.userId}/sales").document(orderId).set(orderData).await()
            }

            // 3. Sync to Realtime Database
            try {
                rtdb.reference.child("${FirebaseConfig.RTDB_PATH_SALES}/$orderId").setValue(orderData).await()
                if (finalOrder.userId.isNotBlank()) {
                    rtdb.reference.child("${FirebaseConfig.RTDB_PATH_USER_SALES}/${finalOrder.userId}/$orderId").setValue(orderData).await()
                }
            } catch (e: Exception) {
                // RTDB best-effort sync
            }

            Result.success(finalOrder)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun observeUserOrders(userId: String): Flow<List<Order>> = callbackFlow {
        val query = if (userId.isNotBlank()) {
            firestore.collection(FirebaseConfig.COLLECTION_SALES)
                .whereEqualTo("userId", userId)
                .orderBy("createdAt", Query.Direction.DESCENDING)
        } else {
            firestore.collection(FirebaseConfig.COLLECTION_SALES)
                .orderBy("createdAt", Query.Direction.DESCENDING)
                .limit(20)
        }

        val listener = query.addSnapshotListener { snapshot, error ->
            if (error != null || snapshot == null) {
                trySend(emptyList())
                return@addSnapshotListener
            }

            val orders = snapshot.documents.mapNotNull { doc ->
                try {
                    Order(
                        id = doc.getString("id") ?: doc.id,
                        userId = doc.getString("userId") ?: "",
                        productId = doc.getString("productId") ?: "",
                        productName = doc.getString("productName") ?: "",
                        productImage = doc.getString("productImage") ?: "",
                        customerName = doc.getString("customerName") ?: "",
                        customerPhone = doc.getString("customerPhone") ?: "",
                        customerEmail = doc.getString("customerEmail") ?: "",
                        customerAddress = doc.getString("customerAddress") ?: "",
                        customerCity = doc.getString("customerCity") ?: "",
                        paymentScreenshotUrl = doc.getString("paymentScreenshotUrl"),
                        paymentProofNotes = doc.getString("paymentProofNotes"),
                        paymentMethod = doc.getString("paymentMethod") ?: "bank_transfer",
                        quantity = (doc.getLong("quantity") ?: 1).toInt(),
                        retailPrice = doc.getDouble("retailPrice") ?: 0.0,
                        sellingPrice = doc.getDouble("sellingPrice") ?: 0.0,
                        currency = doc.getString("currency") ?: "PKR",
                        status = OrderStatus.fromString(doc.getString("status") ?: "pending_verification"),
                        shippingCourier = doc.getString("shippingCourier"),
                        trackingNumber = doc.getString("trackingNumber"),
                        shippingNotes = doc.getString("shippingNotes"),
                        createdAt = doc.getString("createdAt") ?: "",
                        confirmedAt = doc.getString("confirmedAt"),
                        deliveredAt = doc.getString("deliveredAt")
                    )
                } catch (e: Exception) {
                    null
                }
            }

            trySend(orders)
        }

        awaitClose { listener.remove() }
    }

    suspend fun getOrderById(orderId: String): Order? {
        return try {
            val doc = firestore.collection(FirebaseConfig.COLLECTION_SALES).document(orderId).get().await()
            if (doc.exists()) {
                Order(
                    id = doc.getString("id") ?: doc.id,
                    userId = doc.getString("userId") ?: "",
                    productId = doc.getString("productId") ?: "",
                    productName = doc.getString("productName") ?: "",
                    productImage = doc.getString("productImage") ?: "",
                    customerName = doc.getString("customerName") ?: "",
                    customerPhone = doc.getString("customerPhone") ?: "",
                    customerEmail = doc.getString("customerEmail") ?: "",
                    customerAddress = doc.getString("customerAddress") ?: "",
                    customerCity = doc.getString("customerCity") ?: "",
                    paymentScreenshotUrl = doc.getString("paymentScreenshotUrl"),
                    paymentProofNotes = doc.getString("paymentProofNotes"),
                    paymentMethod = doc.getString("paymentMethod") ?: "bank_transfer",
                    quantity = (doc.getLong("quantity") ?: 1).toInt(),
                    retailPrice = doc.getDouble("retailPrice") ?: 0.0,
                    sellingPrice = doc.getDouble("sellingPrice") ?: 0.0,
                    currency = doc.getString("currency") ?: "PKR",
                    status = OrderStatus.fromString(doc.getString("status") ?: "pending_verification"),
                    shippingCourier = doc.getString("shippingCourier"),
                    trackingNumber = doc.getString("trackingNumber"),
                    shippingNotes = doc.getString("shippingNotes"),
                    createdAt = doc.getString("createdAt") ?: "",
                    confirmedAt = doc.getString("confirmedAt"),
                    deliveredAt = doc.getString("deliveredAt")
                )
            } else null
        } catch (e: Exception) {
            null
        }
    }
}
