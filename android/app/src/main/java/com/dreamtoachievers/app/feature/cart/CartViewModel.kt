package com.dreamtoachievers.app.feature.cart

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.dreamtoachievers.app.core.data.CartRepository
import com.dreamtoachievers.app.core.model.CartItem
import kotlinx.coroutines.flow.*

data class CartUiState(
    val items: List<CartItem> = emptyList(),
    val appliedPromoCode: String? = null,
    val promoError: String? = null,
    val promoSuccess: String? = null
) {
    val subtotal: Double
        get() = items.sumOf { it.totalPrice }

    val deliveryFee: Double
        get() = if (subtotal == 0.0 || subtotal >= 5000.0) 0.0 else 250.0

    val discount: Double
        get() = if (appliedPromoCode != null && subtotal > 0) subtotal * 0.10 else 0.0

    val total: Double
        get() = if (subtotal == 0.0) 0.0 else subtotal - discount + deliveryFee
}

class CartViewModel(
    private val cartRepository: CartRepository = CartRepository.instance
) : ViewModel() {

    private val _uiState = MutableStateFlow(CartUiState())
    val uiState: StateFlow<CartUiState> = _uiState.asStateFlow()

    init {
        combine(
            cartRepository.items,
            cartRepository.appliedPromoCode
        ) { items, promo ->
            _uiState.update { it.copy(items = items, appliedPromoCode = promo) }
        }.launchIn(viewModelScope)
    }

    fun updateQuantity(productId: String, quantity: Int) {
        cartRepository.updateQuantity(productId, quantity)
    }

    fun removeItem(productId: String) {
        cartRepository.removeFromCart(productId)
    }

    fun applyPromoCode(code: String) {
        val success = cartRepository.applyPromoCode(code)
        if (success) {
            _uiState.update { it.copy(promoSuccess = "Promo code applied (10% OFF)!", promoError = null) }
        } else {
            _uiState.update { it.copy(promoError = "Invalid promo code", promoSuccess = null) }
        }
    }

    fun removePromoCode() {
        cartRepository.removePromoCode()
        _uiState.update { it.copy(promoSuccess = null, promoError = null) }
    }
}
