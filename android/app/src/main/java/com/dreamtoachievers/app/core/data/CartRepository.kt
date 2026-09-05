package com.dreamtoachievers.app.core.data

import com.dreamtoachievers.app.core.model.CartItem
import com.dreamtoachievers.app.core.model.Product
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

class CartRepository {

    private val _items = MutableStateFlow<List<CartItem>>(emptyList())
    val items: StateFlow<List<CartItem>> = _items.asStateFlow()

    private val _appliedPromoCode = MutableStateFlow<String?>(null)
    val appliedPromoCode: StateFlow<String?> = _appliedPromoCode.asStateFlow()

    fun addToCart(product: Product, quantity: Int = 1, variant: String? = null) {
        _items.update { current ->
            val existingIndex = current.indexOfFirst { it.product.id == product.id && it.selectedVariant == variant }
            if (existingIndex != -1) {
                current.toMutableList().apply {
                    val existing = this[existingIndex]
                    this[existingIndex] = existing.copy(quantity = existing.quantity + quantity)
                }
            } else {
                current + CartItem(product = product, quantity = quantity, selectedVariant = variant)
            }
        }
    }

    fun updateQuantity(productId: String, quantity: Int) {
        if (quantity <= 0) {
            removeFromCart(productId)
            return
        }
        _items.update { current ->
            current.map {
                if (it.product.id == productId) it.copy(quantity = quantity) else it
            }
        }
    }

    fun removeFromCart(productId: String) {
        _items.update { current -> current.filterNot { it.product.id == productId } }
    }

    fun clearCart() {
        _items.value = emptyList()
        _appliedPromoCode.value = null
    }

    fun applyPromoCode(code: String): Boolean {
        val clean = code.trim().uppercase()
        return if (clean == "DTA10" || clean == "WELCOME10" || clean == "ACHIEVER") {
            _appliedPromoCode.value = clean
            true
        } else {
            false
        }
    }

    fun removePromoCode() {
        _appliedPromoCode.value = null
    }

    fun getSubtotal(): Double = _items.value.sumOf { it.totalPrice }

    fun getDeliveryFee(): Double {
        val subtotal = getSubtotal()
        return if (subtotal == 0.0 || subtotal >= 5000.0) 0.0 else 250.0
    }

    fun getDiscount(): Double {
        val subtotal = getSubtotal()
        return if (_appliedPromoCode.value != null && subtotal > 0) {
            subtotal * 0.10 // 10% discount
        } else {
            0.0
        }
    }

    fun getTotal(): Double {
        val subtotal = getSubtotal()
        if (subtotal == 0.0) return 0.0
        return subtotal - getDiscount() + getDeliveryFee()
    }

    companion object {
        val instance = CartRepository()
    }
}
