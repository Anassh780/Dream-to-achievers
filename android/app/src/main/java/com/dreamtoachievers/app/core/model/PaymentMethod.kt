package com.dreamtoachievers.app.core.model

import kotlinx.serialization.Serializable

@Serializable
enum class PaymentMethodType(val rawValue: String, val title: String) {
    BANK_TRANSFER("bank_transfer", "Bank Transfer"),
    EASYPAISA("easypaisa", "EasyPaisa"),
    JAZZCASH("jazzcash", "JazzCash"),
    SADAPAY("sadapay", "SadaPay"),
    NAYAPAY("nayapay", "NayaPay"),
    OTHER("other", "Other");

    val displayName: String get() = title

    companion object {
        fun fromString(value: String): PaymentMethodType {
            return entries.firstOrNull { it.rawValue.equals(value, ignoreCase = true) }
                ?: BANK_TRANSFER
        }
    }
}

@Serializable
data class PaymentMethod(
    val id: String = "",
    val userId: String = "",
    val methodType: PaymentMethodType = PaymentMethodType.BANK_TRANSFER,
    val accountTitle: String = "",
    val accountNumber: String = "",
    val bankName: String = "",
    val branchCity: String? = null,
    val isDefault: Boolean = false,
    val createdAt: String = ""
)

data class CompanyPaymentAccount(
    val type: PaymentMethodType,
    val bankName: String,
    val accountTitle: String,
    val accountNumber: String,
    val iban: String? = null,
    val instructions: String
)
