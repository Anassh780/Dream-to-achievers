package com.dreamtoachievers.app.feature.reseller.catalog

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.dreamtoachievers.app.core.data.ResellerRepository
import com.dreamtoachievers.app.core.model.PartnerProduct
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class PartnerCatalogUiState(
    val products: List<PartnerProduct> = emptyList(),
    val filteredProducts: List<PartnerProduct> = emptyList(),
    val searchQuery: String = "",
    val selectedCategory: String = "All",
    val categories: List<String> = listOf("All", "Executive Gift Sets", "Smartwatches & Fitness", "Skincare & Cosmetics")
)

class PartnerCatalogViewModel(
    private val resellerRepository: ResellerRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(PartnerCatalogUiState())
    val uiState: StateFlow<PartnerCatalogUiState> = _uiState.asStateFlow()

    private val _searchQueryFlow = MutableStateFlow("")

    init {
        viewModelScope.launch {
            resellerRepository.partnerProducts.collect { products ->
                _uiState.update { current ->
                    current.copy(
                        products = products,
                        filteredProducts = filter(products, current.searchQuery, current.selectedCategory)
                    )
                }
            }
        }

        viewModelScope.launch {
            _searchQueryFlow
                .debounce(300)
                .collect { debouncedQuery ->
                    _uiState.update { current ->
                        current.copy(
                            filteredProducts = filter(current.products, debouncedQuery, current.selectedCategory)
                        )
                    }
                }
        }
    }

    fun onSearchQueryChanged(query: String) {
        _uiState.update { it.copy(searchQuery = query) }
        _searchQueryFlow.value = query
    }

    fun onCategorySelected(category: String) {
        _uiState.value = _uiState.value.copy(
            selectedCategory = category,
            filteredProducts = filter(_uiState.value.products, _uiState.value.searchQuery, category)
        )
    }

    private fun filter(products: List<PartnerProduct>, query: String, category: String): List<PartnerProduct> {
        return products.filter { product ->
            val matchesCategory = category == "All" || product.category.equals(category, ignoreCase = true)
            val matchesQuery = query.isBlank() || product.name.contains(query, ignoreCase = true) || product.shortDescription.contains(query, ignoreCase = true)
            matchesCategory && matchesQuery
        }
    }
}
