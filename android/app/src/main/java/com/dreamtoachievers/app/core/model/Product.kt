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
    val colors: List<ProductColor> = emptyList(),
    val features: List<ProductFeature> = emptyList(),
    val sku: String = "",
    val barcode: String = "",
    val inStock: Boolean = true,
    val stockCount: Int = 0,
    val allowMultipleQuantity: Boolean = true,
    val isFeatured: Boolean = false,
    val isTrending: Boolean = false,
    val brand: String = "",
    val moq: Int = 1,
    val tierPricing: List<TierPrice> = emptyList(),
    val status: String = "active",
    val rating: Double = 4.8,
    val reviewCount: Int = 24,
    val specifications: Map<String, String> = emptyMap(),
    val sellerId: String = "",
    val sellerName: String = "Dream To Achievers",
    val sellerCity: String = "Pakistan",
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

@Serializable
data class TierPrice(
    val minQuantity: Int = 1,
    val price: Double = 0.0
)

@Serializable
data class ProductColor(
    val name: String = "",
    val hex: String = "#1F2937",
    val imageUrl: String = "",
)

@Serializable
data class ProductFeature(
    val title: String = "",
    val detail: String = "",
    val icon: String = "verified",
)

@Serializable
data class ProductReview(
    val id: String = "",
    val productId: String = "",
    val userId: String = "",
    val userName: String = "",
    val rating: Int = 5,
    val comment: String = "",
    val verifiedPurchase: Boolean = false,
    val createdAt: Long = 0L,
)

@Serializable
data class StorefrontBanner(
    val id: String = "",
    val image: String = "",
    val headline: String = "",
    val eyebrow: String = "",
    val subheadline: String = "",
    val ctaLabel: String = "",
    val ctaLink: String = "",
    val sortOrder: Int = 0,
    val active: Boolean = true
)
