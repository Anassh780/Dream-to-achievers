package com.dreamtoachievers.app

import com.dreamtoachievers.app.core.data.CartRepository
import com.dreamtoachievers.app.core.model.Product
import org.junit.Assert.*
import org.junit.Test

class CartInteractionRegressionTest {
    private val product = Product(id = "shirt", retailPrice = 1000.0)

    @Test fun changingOneVariantDoesNotChangeAnother() {
        val cart = CartRepository()
        cart.addToCart(product, 2, "Small")
        cart.addToCart(product, 3, "Large")
        cart.updateQuantity(product.id, 5, "Small")
        assertEquals(listOf(5, 3), cart.items.value.map { it.quantity })
        cart.removeFromCart(product.id, "Small")
        assertEquals("Large", cart.items.value.single().selectedVariant)
        assertEquals(3000.0, cart.getSubtotal(), 0.001)
    }

    @Test fun invalidAndUnavailableItemsCannotBeAdded() {
        val cart = CartRepository()
        cart.addToCart(product.copy(inStock = false))
        cart.addToCart(product, 0)
        cart.addToCart(product, -2)
        assertTrue(cart.items.value.isEmpty())
    }

    @Test fun repeatedAdditionsRespectQuantityControlLimit() {
        val cart = CartRepository()
        cart.addToCart(product, 98)
        cart.addToCart(product, Int.MAX_VALUE)
        assertEquals(99, cart.items.value.single().quantity)
        cart.updateQuantity(product.id, 1000)
        assertEquals(99, cart.items.value.single().quantity)
        cart.updateQuantity(product.id, 0)
        assertTrue(cart.items.value.isEmpty())
    }
}
