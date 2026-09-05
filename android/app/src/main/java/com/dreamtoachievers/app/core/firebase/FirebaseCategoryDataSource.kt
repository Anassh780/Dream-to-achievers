package com.dreamtoachievers.app.core.firebase

import com.dreamtoachievers.app.core.model.Category
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow

class FirebaseCategoryDataSource(
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance(),
    private val rtdb: FirebaseDatabase = FirebaseDatabase.getInstance()
) {

    val defaultCategories = listOf(
        Category(
            id = "cat-all",
            name = "All Products",
            slug = "all",
            description = "Browse our full wholesale & retail catalog.",
            icon = "Storefront",
            featured = true,
            sortOrder = 0,
            status = "active"
        ),
        Category(
            id = "cat-tech",
            name = "Tech & Electronics",
            slug = "tech-electronics",
            description = "Consumer audio, Bluetooth devices, and smart sports fitness accessories.",
            icon = "Cpu",
            bannerUrl = "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1600&q=80",
            featured = true,
            sortOrder = 20,
            status = "active"
        ),
        Category(
            id = "cat-lifestyle",
            name = "Home & Executive",
            slug = "lifestyle",
            description = "Curated corporate gifting, luxury matte desk ensembles, and lifestyle merchandise.",
            icon = "Package",
            bannerUrl = "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1600&q=80",
            featured = true,
            sortOrder = 30,
            status = "active"
        ),
        Category(
            id = "cat-skincare",
            name = "Skincare & Beauty",
            slug = "skincare",
            description = "Clean organic formulas, high-demand serums, and barrier restoration cosmetics.",
            icon = "Sparkle",
            bannerUrl = "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1600&q=80",
            featured = true,
            sortOrder = 10,
            status = "active"
        ),
        Category(
            id = "cat-wellness",
            name = "Health & Wellness",
            slug = "health-wellness",
            description = "Nutritional wellness, essential oils, and daily vitality boosters.",
            icon = "Heart",
            bannerUrl = "https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?auto=format&fit=crop&w=1600&q=80",
            featured = false,
            sortOrder = 40,
            status = "active"
        )
    )

    fun observeCategories(): Flow<List<Category>> = callbackFlow {
        val listener = firestore.collection(FirebaseConfig.COLLECTION_CATEGORIES)
            .whereEqualTo("status", "active")
            .addSnapshotListener { snapshot, error ->
                if (error != null || snapshot == null) {
                    trySend(emptyList())
                    return@addSnapshotListener
                }

                val categories = snapshot.documents.mapNotNull { doc ->
                    try {
                        Category(
                            id = doc.getString("id") ?: doc.id,
                            name = doc.getString("name") ?: "",
                            slug = doc.getString("slug") ?: "",
                            description = doc.getString("description") ?: "",
                            icon = doc.getString("icon") ?: "Sparkle",
                            bannerUrl = doc.getString("bannerUrl"),
                            thumbnailUrl = doc.getString("thumbnailUrl"),
                            featured = doc.getBoolean("featured") ?: false,
                            sortOrder = (doc.getLong("sortOrder") ?: 0).toInt(),
                            status = doc.getString("status") ?: "active",
                            parentId = doc.getString("parentId"),
                            depth = (doc.getLong("depth") ?: 0).toInt()
                        )
                    } catch (e: Exception) {
                        null
                    }
                }

                val allCategory = Category(
                    id = "cat-all",
                    name = "All Products",
                    slug = "all",
                    description = "Browse our full catalog.",
                    icon = "Storefront",
                    featured = true,
                    sortOrder = 0,
                    status = "active"
                )

                val fullList = if (categories.any { it.slug == "all" }) {
                    categories.sortedBy { it.sortOrder }
                } else if (categories.isNotEmpty()) {
                    (listOf(allCategory) + categories).sortedBy { it.sortOrder }
                } else {
                    emptyList()
                }

                trySend(fullList)
            }

        awaitClose { listener.remove() }
    }
}
