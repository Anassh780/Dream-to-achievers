package com.dreamtoachievers.app.core.model

import kotlinx.serialization.Serializable

@Serializable
data class Product(
    val id: String = "",
    val name: String = "",
    val slug: String = "",
    val shortDescription: String = "",
    val description: String = "",
    val category: String = "",
    val categoryId: String? = null,
    val categoryIds: List<String> = emptyList(),
    val retailPrice: Double = 0.0,
    val originalPrice: Double? = null,
    val currency: String = "PKR",
    val imageUrl: String = "",
    val additionalImages: List<String> = emptyList(),
    val sku: String = "",
    val inStock: Boolean = true,
    val isFeatured: Boolean = false,
    val status: String = "active",
    val rating: Double = 4.8,
    val reviewCount: Int = 24,
    val specifications: Map<String, String> = emptyMap(),
    val createdAt: String = ""
) {
    val formattedPrice: String
        get() = "PKR ${retailPrice.toInt().toString().reversed().chunked(3).joinToString(",").reversed()}"

    val formattedOriginalPrice: String?
        get() = originalPrice?.let {
            "PKR ${it.toInt().toString().reversed().chunked(3).joinToString(",").reversed()}"
        }

    val discountPercentage: Int?
        get() = originalPrice?.let { orig ->
            if (orig > retailPrice) {
                (((orig - retailPrice) / orig) * 100).toInt()
            } else null
        }
}
