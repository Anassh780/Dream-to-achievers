package com.dreamtoachievers.app.feature.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.dreamtoachievers.app.core.data.*
import com.dreamtoachievers.app.core.model.Category
import com.dreamtoachievers.app.core.model.Product
import com.dreamtoachievers.app.core.model.User
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class HomeUiState(
    val isLoading: Boolean = true,
    val currentUser: User? = null,
    val categories: List<Category> = emptyList(),
    val selectedCategorySlug: String = "all",
    val trendingProducts: List<Product> = emptyList(),
    val favoriteProductIds: Set<String> = emptySet(),
    val cartCount: Int = 0,
    val unreadNotificationsCount: Int = 2,
    val error: String? = null
)

class HomeViewModel(
    private val productRepository: ProductRepository,
    private val categoryRepository: CategoryRepository,
    private val cartRepository: CartRepository,
    private val userRepository: UserRepository,
    private val dataStoreManager: DataStoreManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    init {
        loadData()
        observeCart()
        observeFavorites()
        observeUser()
    }

    private fun loadData() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }

            // Combine categories and products
            combine(
                categoryRepository.getCategories(),
                productRepository.getProducts()
            ) { categories, products ->
                Pair(categories, products)
            }.catch { err ->
                _uiState.update { it.copy(isLoading = false, error = err.localizedMessage) }
            }.collect { (categories, products) ->
                _uiState.update { current ->
                    current.copy(
                        isLoading = false,
                        categories = categories,
                        trendingProducts = products
                    )
                }
            }
        }
    }

    private fun observeCart() {
        viewModelScope.launch {
            cartRepository.items.collect { items ->
                _uiState.update { it.copy(cartCount = items.sumOf { item -> item.quantity }) }
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

    private fun observeUser() {
        viewModelScope.launch {
            userRepository.currentUser.collect { user ->
                _uiState.update { it.copy(currentUser = user) }
            }
        }
    }

    fun selectCategory(slug: String) {
        _uiState.update { it.copy(selectedCategorySlug = slug) }
        viewModelScope.launch {
            productRepository.getProductsByCategory(slug).collect { filtered ->
                _uiState.update { it.copy(trendingProducts = filtered) }
            }
        }
    }

    fun toggleFavorite(productId: String) {
        viewModelScope.launch {
            dataStoreManager.toggleFavorite(productId)
        }
    }

    fun addToCart(product: Product) {
        cartRepository.addToCart(product, 1)
    }

    fun retry() {
        loadData()
    }
}
