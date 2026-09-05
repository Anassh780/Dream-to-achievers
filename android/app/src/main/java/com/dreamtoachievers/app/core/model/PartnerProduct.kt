package com.dreamtoachievers.app.core.model

import kotlinx.serialization.Serializable

@Serializable
data class PartnerProduct(
    val id: String = "",
    val name: String = "",
    val slug: String = "",
    val category: String = "",
    val shortDescription: String = "",
    val description: String = "",
    val retailPrice: Double = 0.0,
    val partnerPrice: Double = 0.0,
    val suggestedSellingPrice: Double = 0.0,
    val currency: String = "PKR",
    val imageUrl: String = "",
    val additionalImages: List<String> = emptyList(),
    val inStock: Boolean = true,
    val stockCount: Int = 50,
    val rating: Double = 4.9,
    val specifications: Map<String, String> = emptyMap()
) {
    val effectiveSuggestedPrice: Double
        get() = if (suggestedSellingPrice > 0) suggestedSellingPrice else retailPrice

    val grossMargin: Double
        get() = (effectiveSuggestedPrice - partnerPrice).coerceAtLeast(0.0)

    val marginPercent: Int
        get() = if (effectiveSuggestedPrice > 0) {
            ((grossMargin / effectiveSuggestedPrice) * 100).toInt()
        } else 0

    val formattedPartnerPrice: String
        get() = "PKR ${partnerPrice.toInt().toString().reversed().chunked(3).joinToString(",").reversed()}"

    val formattedRetailPrice: String
        get() = "PKR ${retailPrice.toInt().toString().reversed().chunked(3).joinToString(",").reversed()}"

    val formattedSuggestedPrice: String
        get() = "PKR ${effectiveSuggestedPrice.toInt().toString().reversed().chunked(3).joinToString(",").reversed()}"

    val formattedGrossMargin: String
        get() = "PKR ${grossMargin.toInt().toString().reversed().chunked(3).joinToString(",").reversed()}"
}
