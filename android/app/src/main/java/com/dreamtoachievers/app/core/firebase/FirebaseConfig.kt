package com.dreamtoachievers.app.core.firebase

import com.dreamtoachievers.app.core.model.CompanyPaymentAccount
import com.dreamtoachievers.app.core.model.PaymentMethodType

object FirebaseConfig {
    const val COLLECTION_PRODUCTS = "products"
    const val COLLECTION_CATEGORIES = "categories"
    const val COLLECTION_USERS = "users"
    const val COLLECTION_SALES = "sales"
    const val COLLECTION_NOTIFICATIONS = "notifications"
    const val COLLECTION_REFERRALS = "referrals"

    const val RTDB_PATH_PRODUCTS = "products"
    const val RTDB_PATH_CATEGORIES = "categories"
    const val RTDB_PATH_USERS = "users"
    const val RTDB_PATH_SALES = "sales"
    const val RTDB_PATH_USER_SALES = "user_sales"

    // Official company payment accounts for customer checkout transfers
    val OFFICIAL_PAYMENT_ACCOUNTS = listOf(
        CompanyPaymentAccount(
            type = PaymentMethodType.BANK_TRANSFER,
            bankName = "Meezan Bank Limited",
            accountTitle = "Dream to Achievers Global",
            accountNumber = "01020304050607",
            iban = "PK00MEZN0001020304050607",
            instructions = "Transfer the order total to our official Meezan Bank account and upload the screenshot receipt slip."
        ),
        CompanyPaymentAccount(
            type = PaymentMethodType.EASYPAISA,
            bankName = "EasyPaisa",
            accountTitle = "Dream to Achievers",
            accountNumber = "03054511395",
            instructions = "Send payment via EasyPaisa mobile transfer to 03054511395 and capture the transfer confirmation slip."
        ),
        CompanyPaymentAccount(
            type = PaymentMethodType.JAZZCASH,
            bankName = "JazzCash",
            accountTitle = "Dream to Achievers",
            accountNumber = "03054511395",
            instructions = "Send payment via JazzCash mobile transfer to 03054511395 and upload the transfer receipt screenshot."
        ),
        CompanyPaymentAccount(
            type = PaymentMethodType.SADAPAY,
            bankName = "SadaPay",
            accountTitle = "Dream to Achievers",
            accountNumber = "03054511395",
            iban = "PK88SADA0000003054511395",
            instructions = "Send via SadaPay using number 03054511395 or IBAN, then upload the receipt screenshot."
        ),
        CompanyPaymentAccount(
            type = PaymentMethodType.NAYAPAY,
            bankName = "NayaPay",
            accountTitle = "Dream to Achievers",
            accountNumber = "03054511395",
            instructions = "Send payment via NayaPay to 03054511395 and attach your transaction receipt proof."
        )
    )
}
