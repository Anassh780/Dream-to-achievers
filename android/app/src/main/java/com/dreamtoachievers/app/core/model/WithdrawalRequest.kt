package com.dreamtoachievers.app.core.model

import kotlinx.serialization.Serializable

@Serializable
enum class WithdrawalStatus(val rawValue: String, val displayName: String) {
    PENDING("pending", "Pending Review"),
    APPROVED("approved", "Approved"),
    PAID("paid", "Paid & Disbursed"),
    REJECTED("rejected", "Rejected");

    companion object {
        fun fromString(value: String): WithdrawalStatus {
            return entries.firstOrNull { it.rawValue.equals(value, ignoreCase = true) } ?: PENDING
        }
    }
}

@Serializable
data class WithdrawalRequest(
    val id: String = "",
    val userId: String = "",
    val userName: String = "",
    val userEmail: String = "",
    val userPhone: String? = null,
    val amount: Double = 0.0,
    val currency: String = "PKR",
    val payoutMethod: PaymentMethod = PaymentMethod(),
    val status: WithdrawalStatus = WithdrawalStatus.PENDING,
    val transactionReference: String? = null,
    val adminNote: String? = null,
    val payoutProofUrl: String? = null,
    val requestedAt: String = "",
    val processedAt: String? = null
) {
    val formattedAmount: String
        get() = "Rs ${amount.toInt().toString().reversed().chunked(3).joinToString(",").reversed()}"
}
