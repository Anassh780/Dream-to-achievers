package com.dreamtoachievers.app.feature.product

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.dreamtoachievers.app.core.data.CartRepository
import com.dreamtoachievers.app.core.data.DataStoreManager
import com.dreamtoachievers.app.core.data.ProductRepository
import com.dreamtoachievers.app.core.data.UserRepository
import com.dreamtoachievers.app.core.model.Product
import com.dreamtoachievers.app.core.model.ProductReview
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class ProductDetailUiState(
    val isLoading: Boolean = true,
    val product: Product? = null,
    val quantity: Int = 1,
    val selectedVariant: String? = null,
    val isFavorite: Boolean = false,
    val error: String? = null,
    val reviews: List<ProductReview> = emptyList(),
    val canReview: Boolean = false,
    val reviewMessage: String? = null,
    val reviewError: String? = null,
)

class ProductDetailViewModel(
    private val productId: String,
    private val productRepository: ProductRepository,
    private val cartRepository: CartRepository,
    private val dataStoreManager: DataStoreManager,
    private val userRepository: UserRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(ProductDetailUiState())
    val uiState: StateFlow<ProductDetailUiState> = _uiState.asStateFlow()

    init {
        loadProduct()
        observeFavorite()
        observeReviews()
        viewModelScope.launch { userRepository.currentUser.collect { user -> _uiState.update { it.copy(canReview = user != null) } } }
    }

    private fun observeReviews() {
        viewModelScope.launch { productRepository.observeReviews(productId).collect { reviews -> _uiState.update { it.copy(reviews = reviews) } } }
    }

    fun submitReview(rating: Int, comment: String) {
        viewModelScope.launch {
            val user = userRepository.currentUser.firstOrNull()
            if (user == null) { _uiState.update { it.copy(reviewError = "Sign in to review this product") }; return@launch }
            productRepository.submitReview(productId, user.fullName, rating, comment).fold(
                onSuccess = { _uiState.update { it.copy(reviewMessage = "Review submitted", reviewError = null) } },
                onFailure = { error -> _uiState.update { it.copy(reviewError = error.message ?: "Review could not be submitted") } },
            )
        }
    }

    fun loadProduct() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            val prod = productRepository.getProductById(productId)
            if (prod != null) {
                _uiState.update { it.copy(isLoading = false, product = prod) }
            } else {
                _uiState.update { it.copy(isLoading = false, error = "Product not found") }
            }
        }
    }

    private fun observeFavorite() {
        viewModelScope.launch {
            dataStoreManager.favoriteProductIds.collect { ids ->
                _uiState.update { it.copy(isFavorite = ids.contains(productId)) }
            }
        }
    }

    fun setQuantity(qty: Int) {
        if (qty in 1..99) {
            _uiState.update { it.copy(quantity = qty) }
        }
    }

    fun selectVariant(variant: String) {
        _uiState.update { it.copy(selectedVariant = variant) }
    }

    fun toggleFavorite() {
        viewModelScope.launch {
            dataStoreManager.toggleFavorite(productId)
        }
    }

    fun addToCart(): Boolean {
        val prod = _uiState.value.product ?: return false
        if (!prod.inStock) return false
        cartRepository.addToCart(prod, _uiState.value.quantity, _uiState.value.selectedVariant)
        return true
    }
}
