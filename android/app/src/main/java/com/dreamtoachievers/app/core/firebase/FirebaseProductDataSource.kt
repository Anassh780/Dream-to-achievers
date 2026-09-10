package com.dreamtoachievers.app.core.firebase

import android.net.Uri
import com.dreamtoachievers.app.core.model.Product
import com.dreamtoachievers.app.core.model.ProductColor
import com.dreamtoachievers.app.core.model.ProductFeature
import com.dreamtoachievers.app.core.model.ProductReview
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.storage.FirebaseStorage
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

class FirebaseProductDataSource(
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance(),
    private val storage: FirebaseStorage = FirebaseStorage.getInstance(),
    private val auth: FirebaseAuth = FirebaseAuth.getInstance(),
) {

    fun observeProducts(): Flow<List<Product>> = observeProducts(trendingOnly = false)

    fun observeTrendingProducts(): Flow<List<Product>> = observeProducts(trendingOnly = true)

    private fun observeProducts(trendingOnly: Boolean): Flow<List<Product>> = callbackFlow {
        // Realtime Firestore Listener
        val listener = firestore.collection(FirebaseConfig.COLLECTION_PRODUCTS)
            .addSnapshotListener { snapshot, error ->
                if ((error != null) || (snapshot == null)) {
                    trySend(emptyList())
                    return@addSnapshotListener
                }

                var products = snapshot.documents.mapNotNull { doc ->
                    try {
                        Product(
                            id = doc.getString("id") ?: doc.id,
                            name = doc.getString("name") ?: "",
                            slug = doc.getString("slug") ?: "",
                            shortDescription = doc.getString("shortDescription") ?: "",
                            description = doc.getString("description") ?: "",
                            category = doc.getString("category") ?: "General",
                            categoryId = doc.getString("categoryId"),
                            categoryIds = (doc["categoryIds"] as? List<*>)?.filterIsInstance<String>() ?: emptyList(),
                            retailPrice = doc.getDouble("retailPrice") ?: doc.getDouble("suggestedSellingPrice") ?: 0.0,
                            originalPrice = doc.getDouble("originalPrice"),
                            currency = doc.getString("currency") ?: "PKR",
                            imageUrl = doc.getString("imageUrl") ?: "",
                            additionalImages = (doc["additionalImages"] as? List<*>)?.filterIsInstance<String>() ?: emptyList(),
                            colors = parseColors(doc["colors"]),
                            features = parseFeatures(doc["features"]),
                            sku = doc.getString("sku") ?: "",
                            barcode = doc.getString("barcode") ?: "",
                            inStock = doc.getBoolean("inStock") ?: true,
                            stockCount = (doc.getLong("stockCount") ?: 0L).toInt(),
                            allowMultipleQuantity = doc.getBoolean("allowMultipleQuantity") ?: true,
                            isFeatured = doc.getBoolean("isFeatured") ?: false,
                            isTrending = doc.getBoolean("isTrending") ?: false,
                            brand = doc.getString("brand") ?: "",
                            moq = (doc.getLong("moq") ?: 1L).toInt().coerceAtLeast(1),
                            tierPricing = parseTierPricing(doc.get("tierPricing")),
                            status = doc.getString("status") ?: "active",
                            rating = doc.getDouble("rating") ?: 4.8,
                            reviewCount = (doc.getLong("reviewCount") ?: 24).toInt(),
                            specifications = parseStringMap(doc["specifications"]),
                            sellerId = doc.getString("sellerId") ?: "",
                            sellerName = doc.getString("sellerName") ?: "Dream To Achievers",
                            sellerCity = doc.getString("sellerCity") ?: "Pakistan",
                            createdAt = doc.getString("createdAt") ?: ""
                        )
                    } catch (_: Exception) {
                        null
                    }
                }.filter { it.status == "active" }

                if (trendingOnly) {
                    products = products.filter { it.isTrending }
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
                    additionalImages = (doc["additionalImages"] as? List<*>)?.filterIsInstance<String>() ?: emptyList(),
                    colors = parseColors(doc["colors"]),
                    features = parseFeatures(doc["features"]),
                    sku = doc.getString("sku") ?: "",
                    barcode = doc.getString("barcode") ?: "",
                    inStock = doc.getBoolean("inStock") ?: true,
                    stockCount = (doc.getLong("stockCount") ?: 0L).toInt(),
                    allowMultipleQuantity = doc.getBoolean("allowMultipleQuantity") ?: true,
                    isFeatured = doc.getBoolean("isFeatured") ?: false,
                    isTrending = doc.getBoolean("isTrending") ?: false,
                    brand = doc.getString("brand") ?: "",
                    moq = (doc.getLong("moq") ?: 1L).toInt().coerceAtLeast(1),
                    tierPricing = parseTierPricing(doc.get("tierPricing")),
                    status = doc.getString("status") ?: "active",
                    rating = doc.getDouble("rating") ?: 0.0,
                    reviewCount = (doc.getLong("reviewCount") ?: 0L).toInt(),
                    specifications = parseStringMap(doc["specifications"]),
                    sellerId = doc.getString("sellerId") ?: "",
                    sellerName = doc.getString("sellerName") ?: "Dream To Achievers",
                    sellerCity = doc.getString("sellerCity") ?: "Pakistan",
                )
            } else null
        } catch (e: Exception) {
            null
        }
    }

    private fun parseTierPricing(raw: Any?): List<com.dreamtoachievers.app.core.model.TierPrice> =
        (raw as? List<*>)?.mapNotNull { entry ->
            val map = entry as? Map<*, *> ?: return@mapNotNull null
            val minimum = (map["minQuantity"] ?: map["minQty"] ?: map["quantity"] as? Number)
            val price = map["price"] as? Number
            val minNumber = minimum as? Number
            if (minNumber != null && price != null) com.dreamtoachievers.app.core.model.TierPrice(minNumber.toInt(), price.toDouble()) else null
        }?.sortedBy { it.minQuantity } ?: emptyList()

    suspend fun submitResellerProduct(product: Product, imageUris: List<Uri>): Result<String> = runCatching {
        val uid = auth.currentUser?.uid ?: error("Sign in before adding a product")
        require(imageUris.size >= 3 || (product.imageUrl.isNotBlank() && product.additionalImages.size >= 2)) { "Add at least 3 product pictures" }
        val id = product.id.ifBlank { firestore.collection(FirebaseConfig.COLLECTION_PRODUCTS).document().id }
        val uploaded = imageUris.mapIndexed { index, uri ->
            val ref = storage.reference.child("product_submissions/$uid/$id/image_$index.jpg")
            ref.putFile(uri).await(); ref.downloadUrl.await().toString()
        }
        val main = uploaded.firstOrNull() ?: product.imageUrl
        val extras = if (uploaded.size > 1) uploaded.drop(1) else product.additionalImages
        val saved = product.copy(id = id, imageUrl = main, additionalImages = extras, sellerId = uid, status = "pending_review")
        firestore.collection(FirebaseConfig.COLLECTION_PRODUCTS).document(id).set(saved).await()
        id
    }

    fun observeReviews(productId: String): Flow<List<ProductReview>> = callbackFlow {
        val registration = firestore.collection(FirebaseConfig.COLLECTION_PRODUCTS).document(productId)
            .collection(FirebaseConfig.COLLECTION_REVIEWS).orderBy("createdAt", com.google.firebase.firestore.Query.Direction.DESCENDING)
            .addSnapshotListener { snapshot, _ ->
                trySend(snapshot?.documents?.mapNotNull { it.toObject(ProductReview::class.java)?.copy(id = it.id) } ?: emptyList())
            }
        awaitClose { registration.remove() }
    }

    suspend fun submitReview(productId: String, userName: String, rating: Int, comment: String): Result<Unit> = runCatching {
        val uid = auth.currentUser?.uid ?: error("Sign in to review this product")
        require(rating in 1..5) { "Choose a rating" }; require(comment.trim().length >= 10) { "Review must contain at least 10 characters" }
        val reviewRef = firestore.collection(FirebaseConfig.COLLECTION_PRODUCTS).document(productId).collection(FirebaseConfig.COLLECTION_REVIEWS).document(uid)
        reviewRef.set(ProductReview(id = uid, productId = productId, userId = uid, userName = userName, rating = rating, comment = comment.trim(), createdAt = System.currentTimeMillis())).await()
    }

    private fun parseStringMap(raw: Any?): Map<String, String> = (raw as? Map<*, *>)?.entries?.mapNotNull { (k, v) -> if (k is String && v is String) k to v else null }?.toMap() ?: emptyMap()
    private fun parseColors(raw: Any?): List<ProductColor> = (raw as? List<*>)?.mapNotNull { (it as? Map<*, *>)?.let { map -> ProductColor(map["name"] as? String ?: return@let null, map["hex"] as? String ?: "#1F2937", map["imageUrl"] as? String ?: "") } } ?: emptyList()
    private fun parseFeatures(raw: Any?): List<ProductFeature> = (raw as? List<*>)?.mapNotNull { (it as? Map<*, *>)?.let { map -> ProductFeature(map["title"] as? String ?: return@let null, map["detail"] as? String ?: "", map["icon"] as? String ?: "verified") } } ?: emptyList()
}

