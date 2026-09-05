package com.dreamtoachievers.app.feature.market

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.dreamtoachievers.app.core.data.*
import com.dreamtoachievers.app.core.model.Category
import com.dreamtoachievers.app.core.model.Product
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class MarketUiState(
    val isLoading: Boolean = true,
    val products: List<Product> = emptyList(),
    val categories: List<Category> = emptyList(),
    val selectedCategorySlug: String = "all",
    val searchQuery: String = "",
    val sortOrder: ProductSortOrder = ProductSortOrder.FEATURED,
    val favoriteProductIds: Set<String> = emptySet(),
    val error: String? = null
)

class MarketViewModel(
    private val productRepository: ProductRepository,
    private val categoryRepository: CategoryRepository,
    private val cartRepository: CartRepository,
    private val dataStoreManager: DataStoreManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(MarketUiState())
    val uiState: StateFlow<MarketUiState> = _uiState.asStateFlow()

    init {
        loadCategories()
        loadProducts()
        observeFavorites()
    }

    private fun loadCategories() {
        viewModelScope.launch {
            categoryRepository.getCategories().collect { cats ->
                _uiState.update { it.copy(categories = cats) }
            }
        }
    }

    fun loadProducts() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            productRepository.searchAndFilterProducts(
                query = _uiState.value.searchQuery,
                categorySlug = _uiState.value.selectedCategorySlug,
                sortOrder = _uiState.value.sortOrder
            ).catch { err ->
                _uiState.update { it.copy(isLoading = false, error = err.localizedMessage) }
            }.collect { list ->
                _uiState.update { it.copy(isLoading = false, products = list) }
            }
        }
    }

    private fun observeFavorites() {
        viewModelScope.launch {
            dataStoreManager.favoriteProductIds.collect { favIds ->
                _uiState.update { it.copy(favoriteProductIds = favIds) }
            }
        }
    }

    fun onSearchQueryChanged(newQuery: String) {
        _uiState.update { it.copy(searchQuery = newQuery) }
        loadProducts()
    }

    fun onCategorySelected(slug: String) {
        _uiState.update { it.copy(selectedCategorySlug = slug) }
        loadProducts()
    }

    fun onSortOrderChanged(newSortOrder: ProductSortOrder) {
        _uiState.update { it.copy(sortOrder = newSortOrder) }
        loadProducts()
    }

    fun toggleFavorite(productId: String) {
        viewModelScope.launch {
            dataStoreManager.toggleFavorite(productId)
        }
    }

    fun addToCart(product: Product) {
        cartRepository.addToCart(product, 1)
    }
}
