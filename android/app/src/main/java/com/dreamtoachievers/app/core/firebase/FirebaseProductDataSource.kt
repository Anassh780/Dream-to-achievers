package com.dreamtoachievers.app.core.firebase

import com.dreamtoachievers.app.core.model.Product
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

class FirebaseProductDataSource(
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance(),
    private val rtdb: FirebaseDatabase = FirebaseDatabase.getInstance()
) {

    // Offline seed fallback products matching web project SEED_PRODUCTS
    val defaultSeedProducts = listOf(
        Product(
            id = "prod-dta-5328",
            name = "Libas-e-Yousaf",
            slug = "libas-e-yousaf",
            shortDescription = "Premium executive festive wear & gift set with luxury packaging.",
            description = "Authentic Libas-e-Yousaf executive collection fabricated from high-grade woven textiles with signature presentation chest. Top-selling lifestyle and corporate gifting parcel.",
            category = "Executive Gift Sets",
            categoryId = "cat-lifestyle-gifting",
            categoryIds = listOf("cat-lifestyle", "cat-lifestyle-gifting"),
            retailPrice = 4500.0,
            originalPrice = 5200.0,
            currency = "PKR",
            imageUrl = "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80",
            sku = "DTA-5328",
            inStock = true,
            isFeatured = true,
            status = "active",
            rating = 4.9,
            reviewCount = 38
        ),
        Product(
            id = "prod-dta-6004",
            name = "Max 1150",
            slug = "max-1150",
            shortDescription = "Ultra HD fitness smartwatch with Bluetooth calling and biometric tracking.",
            description = "Engineered with high-resolution responsive display, sports modes, IP68 water resistance, dynamic heart-rate and blood oxygen monitoring with wireless rapid magnetic charger.",
            category = "Smartwatches & Fitness Trackers",
            categoryId = "cat-tech-wearables",
            categoryIds = listOf("cat-tech", "cat-tech-wearables"),
            retailPrice = 3800.0,
            originalPrice = 4500.0,
            currency = "PKR",
            imageUrl = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
            sku = "DTA-6004",
            inStock = true,
            isFeatured = true,
            status = "active",
            rating = 4.8,
            reviewCount = 26
        ),
        Product(
            id = "prod-dta-7315",
            name = "Crown C500",
            slug = "crown-c500",
            shortDescription = "Executive crown series smartwatch with high-fidelity speaker & dual straps.",
            description = "Premium bezel finish with multi-day battery life, activity and sleep monitoring, custom watch faces, and instant message notifications.",
            category = "Smartwatches & Fitness Trackers",
            categoryId = "cat-tech-wearables",
            categoryIds = listOf("cat-tech", "cat-tech-wearables"),
            retailPrice = 3800.0,
            originalPrice = 4200.0,
            currency = "PKR",
            imageUrl = "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80",
            sku = "DTA-7315",
            inStock = true,
            isFeatured = true,
            status = "active",
            rating = 4.7,
            reviewCount = 19
        ),
        Product(
            id = "prod-dta-3948",
            name = "Luxury Watch",
            slug = "luxury-watch",
            shortDescription = "Sleek luxury timepiece smartwatch with metallic alloy strap and AMOLED display.",
            description = "Distinguished styling suitable for executive attire. Delivers precise timekeeping, health telemetry, notifications, and all-day battery efficiency.",
            category = "Smartwatches & Fitness Trackers",
            categoryId = "cat-tech-wearables",
            categoryIds = listOf("cat-tech", "cat-tech-wearables"),
            retailPrice = 3500.0,
            originalPrice = 3900.0,
            currency = "PKR",
            imageUrl = "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
            sku = "DTA-3948",
            inStock = true,
            isFeatured = true,
            status = "active",
            rating = 4.9,
            reviewCount = 42
        )
    )

    fun observeProducts(): Flow<List<Product>> = callbackFlow {
        // Realtime Firestore Listener
        val listener = firestore.collection(FirebaseConfig.COLLECTION_PRODUCTS)
            .whereEqualTo("status", "active")
            .addSnapshotListener { snapshot, error ->
                if (error != null || snapshot == null) {
                    trySend(emptyList())
                    return@addSnapshotListener
                }

                val products = snapshot.documents.mapNotNull { doc ->
                    try {
                        Product(
                            id = doc.getString("id") ?: doc.id,
                            name = doc.getString("name") ?: "",
                            slug = doc.getString("slug") ?: "",
                            shortDescription = doc.getString("shortDescription") ?: "",
                            description = doc.getString("description") ?: "",
                            category = doc.getString("category") ?: "General",
                            categoryId = doc.getString("categoryId"),
                            categoryIds = (doc.get("categoryIds") as? List<*>)?.filterIsInstance<String>() ?: emptyList(),
                            retailPrice = doc.getDouble("retailPrice") ?: doc.getDouble("suggestedSellingPrice") ?: 0.0,
                            originalPrice = doc.getDouble("originalPrice"),
                            currency = doc.getString("currency") ?: "PKR",
                            imageUrl = doc.getString("imageUrl") ?: "",
                            sku = doc.getString("sku") ?: "",
                            inStock = doc.getBoolean("inStock") ?: true,
                            isFeatured = doc.getBoolean("isFeatured") ?: false,
                            status = doc.getString("status") ?: "active",
                            rating = doc.getDouble("rating") ?: 4.8,
                            reviewCount = (doc.getLong("reviewCount") ?: 24).toInt(),
                            createdAt = doc.getString("createdAt") ?: ""
                        )
                    } catch (e: Exception) {
                        null
                    }
                }

                trySend(products)
            }

        awaitClose { listener.remove() }
    }

    suspend fun getProductById(productId: String): Product? {
        return try {
            val doc = firestore.collection(FirebaseConfig.COLLECTION_PRODUCTS).document(productId).get().await()
            if (doc.exists()) {
                Product(
                    id = doc.getString("id") ?: doc.id,
                    name = doc.getString("name") ?: "",
                    slug = doc.getString("slug") ?: "",
                    shortDescription = doc.getString("shortDescription") ?: "",
                    description = doc.getString("description") ?: "",
                    category = doc.getString("category") ?: "General",
                    categoryId = doc.getString("categoryId"),
                    categoryIds = (doc.get("categoryIds") as? List<*>)?.filterIsInstance<String>() ?: emptyList(),
                    retailPrice = doc.getDouble("retailPrice") ?: 0.0,
                    originalPrice = doc.getDouble("originalPrice"),
                    currency = doc.getString("currency") ?: "PKR",
                    imageUrl = doc.getString("imageUrl") ?: "",
                    sku = doc.getString("sku") ?: "",
                    inStock = doc.getBoolean("inStock") ?: true,
                    isFeatured = doc.getBoolean("isFeatured") ?: false,
                    status = doc.getString("status") ?: "active"
                )
            } else {
                defaultSeedProducts.find { it.id == productId }
            }
        } catch (e: Exception) {
            defaultSeedProducts.find { it.id == productId }
        }
    }
}
