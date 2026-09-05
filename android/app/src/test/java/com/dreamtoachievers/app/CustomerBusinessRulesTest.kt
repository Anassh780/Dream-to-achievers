package com.dreamtoachievers.app

import com.dreamtoachievers.app.core.data.CartRepository
import com.dreamtoachievers.app.core.model.OrderStatus
import com.dreamtoachievers.app.core.model.Product
import com.dreamtoachievers.app.core.model.User
import com.dreamtoachievers.app.core.model.UserRole
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test

class CustomerBusinessRulesTest {

    private lateinit var cartRepository: CartRepository

    private val sampleProduct1 = Product(
        id = "prod-dta-5328",
        name = "Libas-e-Yousaf",
        slug = "libas-e-yousaf",
        category = "Executive Gift Sets",
        retailPrice = 4500.0,
        originalPrice = 5200.0,
        currency = "PKR",
        inStock = true
    )

    private val sampleProduct2 = Product(
        id = "prod-dta-6004",
        name = "Max 1150",
        slug = "max-1150",
        category = "Smartwatches & Fitness Trackers",
        retailPrice = 3800.0,
        originalPrice = 4500.0,
        currency = "PKR",
        inStock = true
    )

    @Before
    fun setUp() {
        cartRepository = CartRepository()
        cartRepository.clearCart()
    }

    @Test
    fun testCustomerProductExposesOnlyRetailPrice() {
        // Assert public customer model has retail price and formatted string
        assertEquals(4500.0, sampleProduct1.retailPrice, 0.01)
        assertEquals("PKR 4,500", sampleProduct1.formattedPrice)
        assertEquals("PKR 5,200", sampleProduct1.formattedOriginalPrice)
        assertEquals(13, sampleProduct1.discountPercentage)

        // Reflection verify that partner price or gross margin fields are NOT accessible on public Product class
        val productFields = Product::class.java.declaredFields.map { it.name }
        assertFalse("Customer model must not contain partnerPrice", productFields.contains("partnerPrice"))
        assertFalse("Customer model must not contain grossMargin", productFields.contains("grossMargin"))
    }

    @Test
    fun testCartCalculationsAndVoucher() {
        cartRepository.addToCart(sampleProduct1, quantity = 1)
        cartRepository.addToCart(sampleProduct2, quantity = 1)

        // Subtotal = 4500 + 3800 = 8300
        assertEquals(8300.0, cartRepository.getSubtotal(), 0.01)

        // Orders >= 5000 get free delivery
        assertEquals(0.0, cartRepository.getDeliveryFee(), 0.01)

        // Total without voucher
        assertEquals(8300.0, cartRepository.getTotal(), 0.01)

        // Apply 10% voucher DTA10
        val voucherApplied = cartRepository.applyPromoCode("DTA10")
        assertTrue(voucherApplied)
        assertEquals(830.0, cartRepository.getDiscount(), 0.01)

        // Total with voucher: 8300 - 830 = 7470
        assertEquals(7470.0, cartRepository.getTotal(), 0.01)
    }

    @Test
    fun testCartQuantityUpdatesAndBoundaryRemoval() {
        cartRepository.addToCart(sampleProduct1, quantity = 2)
        assertEquals(9000.0, cartRepository.getSubtotal(), 0.01)

        // Update quantity
        cartRepository.updateQuantity(sampleProduct1.id, 3)
        assertEquals(13500.0, cartRepository.getSubtotal(), 0.01)

        // Update to 0 removes item
        cartRepository.updateQuantity(sampleProduct1.id, 0)
        assertEquals(0, cartRepository.items.value.size)
        assertEquals(0.0, cartRepository.getSubtotal(), 0.01)
    }

    @Test
    fun testFulfillmentOrderStatusMapping() {
        // Test all backend status mappings exactly correspond
        assertEquals(OrderStatus.PENDING_VERIFICATION, OrderStatus.fromString("pending_verification"))
        assertEquals(OrderStatus.PAYMENT_VERIFIED, OrderStatus.fromString("payment_verified"))
        assertEquals(OrderStatus.PROCESSING, OrderStatus.fromString("processing"))
        assertEquals(OrderStatus.DISPATCHED, OrderStatus.fromString("dispatched"))
        assertEquals(OrderStatus.IN_TRANSIT, OrderStatus.fromString("in_transit"))
        assertEquals(OrderStatus.DELIVERED, OrderStatus.fromString("delivered"))
        assertEquals(OrderStatus.CANCELLED, OrderStatus.fromString("cancelled"))
        assertEquals(OrderStatus.REJECTED, OrderStatus.fromString("rejected"))
    }

    @Test
    fun testCustomerRoleSecurity() {
        val customer = User(id = "user-123", email = "customer@example.com", role = UserRole.CUSTOMER)
        assertTrue(customer.isCustomerOnly)

        val reseller = User(id = "res-123", email = "reseller@example.com", role = UserRole.RESELLER)
        assertFalse(reseller.isCustomerOnly)
    }
}
