package com.dreamtoachievers.app.core.data

import com.dreamtoachievers.app.core.firebase.FirebaseConfig
import com.dreamtoachievers.app.core.model.StorefrontBanner
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

class StorefrontRepository(
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance()
) {
    val defaultBanners = listOf(
        StorefrontBanner(
            id = "banner-summer-wholesale",
            image = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
            eyebrow = "Limited Time Wholesale",
            headline = "Mega Season Deals",
            subheadline = "Up to 40% OFF on Bulk Apparel, Tech & Cosmetics.",
            ctaLabel = "Explore Catalog",
            ctaLink = "all",
            sortOrder = 10,
            active = true
        ),
        StorefrontBanner(
            id = "banner-premium-beauty",
            image = "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
            eyebrow = "High Margin Skincare",
            headline = "Luxury Formulas",
            subheadline = "Original imported skincare, barriers & premium fragrances.",
            ctaLabel = "Shop Beauty",
            ctaLink = "skincare",
            sortOrder = 20,
            active = true
        ),
        StorefrontBanner(
            id = "banner-partner-network",
            image = "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80",
            eyebrow = "Reseller Network",
            headline = "Earn With DTA",
            subheadline = "Deliver verified wholesale orders with guaranteed commissions.",
            ctaLabel = "Join Partners",
            ctaLink = "all",
            sortOrder = 30,
            active = true
        )
    )

    fun observeBanners(): Flow<List<StorefrontBanner>> = callbackFlow {
        val registration = firestore.collection(FirebaseConfig.COLLECTION_BANNERS)
            .addSnapshotListener { snapshot, error ->
                if (error != null || snapshot == null) {
                    trySend(defaultBanners)
                    return@addSnapshotListener
                }
                val banners = snapshot.documents.mapNotNull { doc ->
                    val image = doc.getString("image") ?: doc.getString("imageUrl") ?: return@mapNotNull null
                    StorefrontBanner(
                        id = doc.id,
                        image = image,
                        headline = doc.getString("headline").orEmpty(),
                        eyebrow = doc.getString("eyebrow").orEmpty(),
                        subheadline = doc.getString("subheadline").orEmpty(),
                        ctaLabel = doc.getString("ctaLabel").orEmpty(),
                        ctaLink = doc.getString("ctaLink").orEmpty(),
                        sortOrder = (doc.getLong("sortOrder") ?: 0L).toInt(),
                        active = doc.getBoolean("active") ?: false
                    )
                }.filter { it.active }.sortedBy { it.sortOrder }

                trySend(banners.ifEmpty { defaultBanners })
            }
        awaitClose { registration.remove() }
    }

    fun observeWishlist(userId: String): Flow<Set<String>> = callbackFlow {
        val registration = firestore.collection(FirebaseConfig.COLLECTION_WISHLISTS).document(userId)
            .addSnapshotListener { snapshot, error ->
                if (error != null) { trySend(emptySet()); return@addSnapshotListener }
                val ids = (snapshot?.get("productIds") as? List<*>)?.filterIsInstance<String>()?.toSet().orEmpty()
                trySend(ids)
            }
        awaitClose { registration.remove() }
    }

    suspend fun toggleWishlist(userId: String, productId: String, currentlySaved: Boolean) {
        val update = if (currentlySaved) FieldValue.arrayRemove(productId) else FieldValue.arrayUnion(productId)
        firestore.collection(FirebaseConfig.COLLECTION_WISHLISTS).document(userId)
            .set(mapOf("productIds" to update, "updatedAt" to FieldValue.serverTimestamp()), com.google.firebase.firestore.SetOptions.merge())
            .await()
    }

    fun observeRecentSearches(userId: String, limit: Int = 5): Flow<List<String>> = callbackFlow {
        val registration = firestore.collection(FirebaseConfig.COLLECTION_RECENT_SEARCHES).document(userId)
            .addSnapshotListener { snapshot, error ->
                if (error != null) { trySend(emptyList()); return@addSnapshotListener }
                val searches = (snapshot?.get("queries") as? List<*>)?.filterIsInstance<String>().orEmpty().take(limit)
                trySend(searches)
            }
        awaitClose { registration.remove() }
    }

    suspend fun saveSearch(userId: String, query: String, limit: Int = 5) {
        val ref = firestore.collection(FirebaseConfig.COLLECTION_RECENT_SEARCHES).document(userId)
        firestore.runTransaction { transaction ->
            val current = (transaction.get(ref).get("queries") as? List<*>)?.filterIsInstance<String>().orEmpty()
            val updated = listOf(query) + current.filterNot { it.equals(query, true) }
            transaction.set(ref, mapOf("queries" to updated.take(limit), "updatedAt" to FieldValue.serverTimestamp()))
        }.await()
    }
}
