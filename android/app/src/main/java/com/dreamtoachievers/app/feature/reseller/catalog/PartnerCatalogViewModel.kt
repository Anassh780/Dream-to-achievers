package com.dreamtoachievers.app.feature.reseller.catalog

import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.dreamtoachievers.app.core.data.*
import com.dreamtoachievers.app.core.model.*
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class PartnerCatalogUiState(
    val products: List<PartnerProduct> = emptyList(),
    val filteredProducts: List<PartnerProduct> = emptyList(),
    val searchQuery: String = "",
    val selectedCategory: String = "All",
    val categories: List<String> = listOf("All"),
    val catalogCategories: List<Category> = emptyList(),
    val isSubmitting: Boolean = false,
    val submissionMessage: String? = null,
    val submissionError: String? = null,
)

class PartnerCatalogViewModel(
    private val resellerRepository: ResellerRepository,
    private val productRepository: ProductRepository,
    categoryRepository: CategoryRepository,
    private val userRepository: UserRepository,
) : ViewModel() {
    private val _uiState = MutableStateFlow(PartnerCatalogUiState())
    val uiState: StateFlow<PartnerCatalogUiState> = _uiState.asStateFlow()
    private val queryFlow = MutableStateFlow("")

    init {
        viewModelScope.launch { resellerRepository.partnerProducts.collect { products -> _uiState.update { it.copy(products = products, filteredProducts = filter(products, it.searchQuery, it.selectedCategory)) } } }
        viewModelScope.launch { categoryRepository.getCategories().collect { categories -> _uiState.update { it.copy(catalogCategories = categories, categories = listOf("All") + categories.map(Category::name).distinct()) } } }
        viewModelScope.launch { queryFlow.debounce(300).collect { query -> _uiState.update { it.copy(filteredProducts = filter(it.products, query, it.selectedCategory)) } } }
    }

    fun onSearchQueryChanged(query: String) { _uiState.update { it.copy(searchQuery = query) }; queryFlow.value = query }
    fun onCategorySelected(category: String) { _uiState.update { it.copy(selectedCategory = category, filteredProducts = filter(it.products, it.searchQuery, category)) } }
    fun clearSubmissionStatus() { _uiState.update { it.copy(submissionMessage = null, submissionError = null) } }

    fun submitProduct(product: Product, images: List<Uri>) {
        viewModelScope.launch {
            val seller = userRepository.currentUser.firstOrNull()
            if (seller == null) { _uiState.update { it.copy(submissionError = "Sign in before adding a product") }; return@launch }
            _uiState.update { it.copy(isSubmitting = true, submissionError = null, submissionMessage = null) }
            val ready = product.copy(sellerId = seller.id, sellerName = seller.fullName, sellerCity = seller.city.orEmpty().ifBlank { "Pakistan" })
            productRepository.submitResellerProduct(ready, images).fold(
                onSuccess = { _uiState.update { it.copy(isSubmitting = false, submissionMessage = "Product submitted for admin review") } },
                onFailure = { error -> _uiState.update { it.copy(isSubmitting = false, submissionError = error.message ?: "Product submission failed") } },
            )
        }
    }

    private fun filter(products: List<PartnerProduct>, query: String, category: String) = products.filter { product ->
        (category == "All" || product.category.equals(category, true)) && (query.isBlank() || product.name.contains(query, true) || product.shortDescription.contains(query, true))
    }
}
