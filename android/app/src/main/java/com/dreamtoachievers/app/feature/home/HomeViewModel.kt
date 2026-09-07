package com.dreamtoachievers.app.feature.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.dreamtoachievers.app.core.data.*
import com.dreamtoachievers.app.core.model.*
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class HomeUiState(
    val currentUser: User? = null,
    val categories: List<Category> = emptyList(),
    val searchableProducts: List<Product> = emptyList(),
    val trendingProducts: List<Product> = emptyList(),
    val banners: List<StorefrontBanner> = emptyList(),
    val favoriteProductIds: Set<String> = emptySet(),
    val cartCount: Int = 0,
    val unreadNotificationsCount: Int = 0,
    val openOrdersCount: Int = 0,
    val recentSearches: List<String> = emptyList(),
    val searchSuggestions: List<String> = emptyList(),
    val catalogLoading: Boolean = true,
    val bannersLoading: Boolean = true,
    val userDataLoading: Boolean = true,
    val catalogError: String? = null,
    val bannersError: String? = null,
    val userDataError: String? = null,
    val writeError: String? = null
)

class HomeViewModel(
    private val productRepository: ProductRepository,
    private val categoryRepository: CategoryRepository,
    private val cartRepository: CartRepository,
    private val userRepository: UserRepository,
    private val notificationRepository: NotificationRepository,
    private val orderRepository: OrderRepository,
    private val storefrontRepository: StorefrontRepository
) : ViewModel() {
    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()
    private var userJob: Job? = null

    init { loadCatalog(); loadBanners(); observeCart(); observeUser() }

    private fun loadCatalog() = viewModelScope.launch {
        _uiState.update { it.copy(catalogLoading = true, catalogError = null) }
        combine(categoryRepository.getCategories(), productRepository.getProducts(), productRepository.getTrendingProducts()) { categories, products, trending ->
            Triple(categories.sortedBy { it.sortOrder }, products, trending)
        }.catch { e -> _uiState.update { it.copy(catalogLoading = false, catalogError = e.message ?: "Could not load the catalog") } }
            .collect { (categories, products, trending) ->
                val activeTrending = if (trending.isNotEmpty()) trending else products.take(6)
                _uiState.update { it.copy(categories = categories, searchableProducts = products, trendingProducts = activeTrending, catalogLoading = false) }
            }
    }

    private fun loadBanners() = viewModelScope.launch {
        _uiState.update { it.copy(bannersLoading = true, bannersError = null) }
        storefrontRepository.observeBanners()
            .catch { e -> _uiState.update { it.copy(bannersLoading = false, bannersError = e.message ?: "Could not load banners") } }
            .collect { banners -> _uiState.update { it.copy(banners = banners, bannersLoading = false) } }
    }

    private fun observeCart() = viewModelScope.launch {
        cartRepository.totalQuantity.collect { count -> _uiState.update { it.copy(cartCount = count) } }
    }

    private fun observeUser() = viewModelScope.launch {
        userRepository.currentUser.collectLatest { user ->
            userJob?.cancel(); cartRepository.bindUser(user?.id)
            _uiState.update { it.copy(currentUser = user, userDataLoading = user != null, favoriteProductIds = emptySet(), recentSearches = emptyList(), unreadNotificationsCount = 0, openOrdersCount = 0) }
            if (user == null) return@collectLatest
            userJob = viewModelScope.launch {
                launch { storefrontRepository.observeWishlist(user.id).catch { recordUserError(it) }.collect { ids -> _uiState.update { s -> s.copy(favoriteProductIds = ids, userDataLoading = false) } } }
                launch { storefrontRepository.observeRecentSearches(user.id).catch { recordUserError(it) }.collect { searches -> _uiState.update { s -> s.copy(recentSearches = searches, userDataLoading = false) } } }
                launch { notificationRepository.observeNotifications(user.id).catch { recordUserError(it) }.collect { values -> _uiState.update { s -> s.copy(unreadNotificationsCount = values.count { !it.isRead }, userDataLoading = false) } } }
                launch { orderRepository.getUserOrders(user.id).catch { recordUserError(it) }.collect { orders ->
                    val finals = setOf(OrderStatus.DELIVERED, OrderStatus.CANCELLED, OrderStatus.REJECTED, OrderStatus.CONFIRMED, OrderStatus.FULFILLED)
                    _uiState.update { s -> s.copy(openOrdersCount = orders.count { it.status !in finals }, userDataLoading = false) }
                } }
            }
        }
    }

    private fun recordUserError(error: Throwable) { _uiState.update { it.copy(userDataLoading = false, userDataError = error.message ?: "Could not load your account data") } }

    fun updateSearch(query: String) {
        val q = query.trim()
        val suggestions = if (q.isBlank()) emptyList() else (_uiState.value.searchableProducts.flatMap { listOf(it.name, it.brand) } + _uiState.value.categories.map { it.name })
            .filter { it.contains(q, ignoreCase = true) }.distinct().take(6)
        _uiState.update { it.copy(searchSuggestions = suggestions) }
    }

    fun submitSearch(query: String, navigate: (String) -> Unit) {
        val clean = query.trim(); if (clean.isBlank()) return
        _uiState.value.currentUser?.id?.let { uid -> viewModelScope.launch { runCatching { storefrontRepository.saveSearch(uid, clean) }.onFailure { e -> _uiState.update { it.copy(writeError = e.message) } } } }
        navigate(clean)
    }

    fun toggleFavorite(productId: String) {
        val uid = _uiState.value.currentUser?.id ?: return
        val saved = productId in _uiState.value.favoriteProductIds
        _uiState.update { it.copy(favoriteProductIds = if (saved) it.favoriteProductIds - productId else it.favoriteProductIds + productId) }
        viewModelScope.launch { runCatching { storefrontRepository.toggleWishlist(uid, productId, saved) }.onFailure { e ->
            _uiState.update { it.copy(favoriteProductIds = if (saved) it.favoriteProductIds + productId else it.favoriteProductIds - productId, writeError = e.message) }
        } }
    }

    fun changeQuantity(product: Product, quantity: Int) {
        if (quantity < product.moq) return
        if (cartRepository.items.value.none { it.product.id == product.id }) cartRepository.addToCart(product, quantity)
        else cartRepository.updateQuantity(product.id, quantity)
    }

    fun quantityFor(productId: String): Int = cartRepository.items.value.firstOrNull { it.product.id == productId }?.quantity ?: 0
    fun retryCatalog() { loadCatalog() }
    fun retryBanners() { loadBanners() }
}
