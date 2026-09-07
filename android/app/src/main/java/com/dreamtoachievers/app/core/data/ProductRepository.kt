package com.dreamtoachievers.app.core.data

import android.net.Uri
import com.dreamtoachievers.app.core.firebase.FirebaseProductDataSource
import com.dreamtoachievers.app.core.model.Product
import com.dreamtoachievers.app.core.model.ProductReview
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

enum class ProductSortOrder {
    FEATURED,
    PRICE_LOW_TO_HIGH,
    PRICE_HIGH_TO_LOW,
    NEWEST
}

class ProductRepository(
    private val dataSource: FirebaseProductDataSource = FirebaseProductDataSource()
) {

    fun getProducts(): Flow<List<Product>> = dataSource.observeProducts()
    fun getTrendingProducts(): Flow<List<Product>> = dataSource.observeTrendingProducts()

    fun getFeaturedProducts(): Flow<List<Product>> = getProducts().map { list ->
        list.filter { it.isFeatured }
    }

    fun getProductsByCategory(categorySlug: String): Flow<List<Product>> = getProducts().map { list ->
        if (categorySlug.isBlank() || categorySlug.equals("all", ignoreCase = true)) {
            list
        } else {
            list.filter { product ->
                product.category.contains(categorySlug, ignoreCase = true) ||
                        product.categoryId?.contains(categorySlug, ignoreCase = true) == true ||
                        product.categoryIds.any { it.contains(categorySlug, ignoreCase = true) }
            }
        }
    }

    fun searchAndFilterProducts(
        query: String,
        categorySlug: String = "all",
        sortOrder: ProductSortOrder = ProductSortOrder.FEATURED
    ): Flow<List<Product>> = getProducts().map { rawList ->
        var list = rawList

        // 1. Filter by category
        if (categorySlug.isNotBlank() && !categorySlug.equals("all", ignoreCase = true)) {
            list = list.filter { p ->
                p.category.contains(categorySlug, ignoreCase = true) ||
                        p.categoryId?.contains(categorySlug, ignoreCase = true) == true ||
                        p.categoryIds.any { it.contains(categorySlug, ignoreCase = true) }
            }
        }

        // 2. Filter by search query
        if (query.isNotBlank()) {
            val q = query.trim().lowercase()
            list = list.filter { p ->
                p.name.lowercase().contains(q) ||
                        p.shortDescription.lowercase().contains(q) ||
                        p.category.lowercase().contains(q) ||
                        p.sku.lowercase().contains(q)
            }
        }

        // 3. Sort
        when (sortOrder) {
            ProductSortOrder.FEATURED -> list.sortedByDescending { it.isFeatured }
            ProductSortOrder.PRICE_LOW_TO_HIGH -> list.sortedBy { it.retailPrice }
            ProductSortOrder.PRICE_HIGH_TO_LOW -> list.sortedByDescending { it.retailPrice }
            ProductSortOrder.NEWEST -> list.sortedByDescending { it.createdAt }
        }
    }

    suspend fun getProductById(productId: String): Product? = dataSource.getProductById(productId)
    suspend fun submitResellerProduct(product: Product, imageUris: List<Uri>): Result<String> = dataSource.submitResellerProduct(product, imageUris)
    fun observeReviews(productId: String): Flow<List<ProductReview>> = dataSource.observeReviews(productId)
    suspend fun submitReview(productId: String, userName: String, rating: Int, comment: String): Result<Unit> = dataSource.submitReview(productId, userName, rating, comment)
}
