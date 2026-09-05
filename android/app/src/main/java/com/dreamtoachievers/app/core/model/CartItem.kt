package com.dreamtoachievers.app.core.model

import kotlinx.serialization.Serializable

@Serializable
data class CartItem(
    val product: Product,
    val quantity: Int = 1,
    val selectedVariant: String? = null
) {
    val totalPrice: Double
        get() = product.retailPrice * quantity

    val formattedTotalPrice: String
        get() = "PKR ${totalPrice.toInt().toString().reversed().chunked(3).joinToString(",").reversed()}"
}
