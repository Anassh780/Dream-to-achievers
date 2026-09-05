package com.dreamtoachievers.app.core.model

import kotlinx.serialization.Serializable

@Serializable
enum class OrderStatus(val rawValue: String, val displayName: String) {
    PENDING_VERIFICATION("pending_verification", "Pending Verification"),
    PAYMENT_VERIFIED("payment_verified", "Payment Verified"),
    PROCESSING("processing", "Processing"),
    DISPATCHED("dispatched", "Dispatched"),
    IN_TRANSIT("in_transit", "In Transit"),
    DELIVERED("delivered", "Delivered"),
    CANCELLED("cancelled", "Cancelled"),
    REJECTED("rejected", "Payment Rejected"),
    CONFIRMED("confirmed", "Confirmed"),
    FULFILLED("fulfilled", "Fulfilled");

    companion object {
        fun fromString(value: String): OrderStatus {
            return entries.firstOrNull { it.rawValue.equals(value, ignoreCase = true) }
                ?: PENDING_VERIFICATION
        }
    }
}

@Serializable
data class Order(
    val id: String = "",
    val userId: String = "",
    val productId: String = "",
    val productName: String = "",
    val productImage: String = "",
    val customerName: String = "",
    val customerPhone: String = "",
    val customerEmail: String = "",
    val customerAddress: String = "",
    val customerCity: String = "",
    val paymentScreenshotUrl: String? = null,
    val paymentProofNotes: String? = null,
    val paymentMethod: String = "bank_transfer",
    val quantity: Int = 1,
    val retailPrice: Double = 0.0,
    val sellingPrice: Double = 0.0,
    val currency: String = "PKR",
    val status: OrderStatus = OrderStatus.PENDING_VERIFICATION,
    val shippingCourier: String? = null, // e.g. TCS, Leopard, Trax, PostEx
    val trackingNumber: String? = null,
    val shippingNotes: String? = null,
    val createdAt: String = "",
    val confirmedAt: String? = null,
    val deliveredAt: String? = null
) {
    val totalAmount: Double
        get() = retailPrice * quantity

    val formattedTotal: String
        get() = "$currency ${totalAmount.toInt().toString().reversed().chunked(3).joinToString(",").reversed()}"
}
