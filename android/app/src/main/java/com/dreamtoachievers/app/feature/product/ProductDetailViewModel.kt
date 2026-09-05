package com.dreamtoachievers.app.feature.product

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.dreamtoachievers.app.core.data.CartRepository
import com.dreamtoachievers.app.core.data.DataStoreManager
import com.dreamtoachievers.app.core.data.ProductRepository
import com.dreamtoachievers.app.core.model.Product
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class ProductDetailUiState(
    val isLoading: Boolean = true,
    val product: Product? = null,
    val quantity: Int = 1,
    val selectedVariant: String? = null,
    val isFavorite: Boolean = false,
    val error: String? = null
)

class ProductDetailViewModel(
    private val productId: String,
    private val productRepository: ProductRepository,
    private val cartRepository: CartRepository,
    private val dataStoreManager: DataStoreManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(ProductDetailUiState())
    val uiState: StateFlow<ProductDetailUiState> = _uiState.asStateFlow()

    init {
        loadProduct()
        observeFavorite()
    }

    private fun loadProduct() {
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
        cartRepository.addToCart(prod, _uiState.value.quantity, _uiState.value.selectedVariant)
        return true
    }
}
