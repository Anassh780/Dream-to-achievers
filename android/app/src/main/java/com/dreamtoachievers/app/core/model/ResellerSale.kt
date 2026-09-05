package com.dreamtoachievers.app.core.model

import kotlinx.serialization.Serializable

@Serializable
data class ResellerSale(
    val id: String = "",
    val userId: String = "",
    val resellerName: String = "Ali Khan",
    val resellerReferralCode: String = "DTA-ALEX91",
    val resellerRank: String = "Silver Partner",
    val resellerStatus: String = "Active",
    val productId: String = "",
    val productName: String = "",
    val productImage: String = "",
    val productSpecs: String = "",
    val customerName: String = "",
    val customerPhone: String = "",
    val customerEmail: String = "",
    val customerAddress: String = "",
    val customerCity: String = "",
    val paymentScreenshotUrl: String? = null,
    val paymentProofNotes: String? = null,
    val paymentMethod: String = "Bank Transfer",
    val transactionReference: String? = null,
    val quantity: Int = 1,
    val retailPrice: Double = 0.0,
    val partnerPrice: Double = 0.0,
    val sellingPrice: Double = 0.0,
    val profitMargin: Double = 0.0, // (sellingPrice - partnerPrice)
    val currency: String = "PKR",
    val status: OrderStatus = OrderStatus.PENDING_VERIFICATION,
    val isQualifying: Boolean = false,
    val shippingCourier: String? = null, // "TCS Express", "Leopard Courier", "Trax Logistics", "PostEx"
    val trackingNumber: String? = null,
    val shippingNotes: String? = null,
    val rejectionReason: String? = null,
    val adminReviewNote: String? = null,
    val adminPaymentProofUrl: String? = null,
    val processedByAdminId: String? = null,
    val createdAt: String = "",
    val confirmedAt: String? = null,
    val processingAt: String? = null,
    val dispatchedAt: String? = null,
    val inTransitAt: String? = null,
    val deliveredAt: String? = null,
    val version: Long = 1L,
    val updatedAt: String? = null
) {
    val totalCustomerBill: Double
        get() = sellingPrice * quantity

    val totalPartnerCost: Double
        get() = partnerPrice * quantity

    val totalProfit: Double
        get() = (sellingPrice - partnerPrice).coerceAtLeast(0.0) * quantity

    val formattedTotalBill: String
        get() = "Rs ${totalCustomerBill.toInt().toString().reversed().chunked(3).joinToString(",").reversed()}"

    val formattedTotalProfit: String
        get() = "Rs ${totalProfit.toInt().toString().reversed().chunked(3).joinToString(",").reversed()}"

    val formattedPartnerCost: String
        get() = "Rs ${totalPartnerCost.toInt().toString().reversed().chunked(3).joinToString(",").reversed()}"
}
