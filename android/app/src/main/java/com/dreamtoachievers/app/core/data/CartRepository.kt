package com.dreamtoachievers.app.core.data

import com.dreamtoachievers.app.core.model.CartItem
import com.dreamtoachievers.app.core.model.Product
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import com.dreamtoachievers.app.core.firebase.FirebaseConfig
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ListenerRegistration
import com.google.firebase.firestore.SetOptions
import com.dreamtoachievers.app.core.firebase.FirebaseProductDataSource
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

class CartRepository(
    private val firestore: FirebaseFirestore? = null
) {

    private fun getFirestoreSafe(): FirebaseFirestore? {
        if (firestore != null) return firestore
        return try {
            FirebaseFirestore.getInstance()
        } catch (_: Exception) {
            null
        }
    }

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val productDataSource by lazy {
        getFirestoreSafe()?.let { FirebaseProductDataSource(it) } ?: FirebaseProductDataSource()
    }
    private var userId: String? = null
    private var cartListener: ListenerRegistration? = null
    private val quantities = mutableMapOf<String, Int>()
    private val products = mutableMapOf<String, Product>()
    private val _totalQuantity = MutableStateFlow(0)
    val totalQuantity: StateFlow<Int> = _totalQuantity.asStateFlow()

    private val _items = MutableStateFlow<List<CartItem>>(emptyList())
    val items: StateFlow<List<CartItem>> = _items.asStateFlow()

    private val _appliedPromoCode = MutableStateFlow<String?>(null)
    val appliedPromoCode: StateFlow<String?> = _appliedPromoCode.asStateFlow()

    fun bindUser(uid: String?) {
        if (uid == userId) return
        cartListener?.remove()
        userId = uid
        quantities.clear()
        _totalQuantity.value = 0
        if (uid == null) { _items.value = emptyList(); return }
        cartListener = getFirestoreSafe()?.collection(FirebaseConfig.COLLECTION_CARTS)?.document(uid)
            ?.addSnapshotListener { snapshot, _ ->
                val remote = snapshot?.get("items") as? Map<*, *> ?: emptyMap<Any, Any>()
                quantities.clear()
                remote.forEach { (key, value) ->
                    val quantity = (value as? Number)?.toInt() ?: return@forEach
                    if (quantity > 0) quantities[key.toString()] = quantity
                }
                publishOptimisticState()
                val missing = quantities.keys.filterNot(products::containsKey)
                if (missing.isNotEmpty()) scope.launch {
                    missing.forEach { id -> productDataSource.getProductById(id)?.let { products[id] = it } }
                    publishOptimisticState()
                }
            }
    }

    private fun publishOptimisticState() {
        _totalQuantity.value = quantities.values.sum()
        _items.value = quantities.mapNotNull { (id, quantity) -> products[id]?.let { CartItem(it, quantity) } }
    }

    private fun writeQuantity(productId: String, quantity: Int) {
        val uid = userId ?: return
        val safeId = productId.replace(".", "_")
        getFirestoreSafe()?.collection(FirebaseConfig.COLLECTION_CARTS)?.document(uid)
            ?.set(mapOf("items" to mapOf(safeId to quantity.coerceAtLeast(0))), SetOptions.merge())
    }

    fun addToCart(product: Product, quantity: Int = 1, variant: String? = null) {
        if (!product.inStock || quantity <= 0) return
        if (userId != null) {
            products[product.id] = product
            val next = ((quantities[product.id] ?: 0) + quantity).coerceAtMost(9999)
            quantities[product.id] = next
            publishOptimisticState()
            writeQuantity(product.id, next)
            return
        }
        _items.update { current ->
            val existingIndex = current.indexOfFirst { it.product.id == product.id && it.selectedVariant == variant }
            if (existingIndex != -1) {
                current.toMutableList().apply {
                    val existing = this[existingIndex]
                    this[existingIndex] = existing.copy(quantity = (existing.quantity.toLong() + quantity).coerceAtMost(99).toInt())
                }
            } else {
                current + CartItem(product = product, quantity = quantity.coerceAtMost(99), selectedVariant = variant)
            }
        }
        _totalQuantity.value = _items.value.sumOf { it.quantity }
    }

    fun updateQuantity(productId: String, quantity: Int, variant: String? = null) {
        if (userId != null) {
            if (quantity <= 0) quantities.remove(productId) else quantities[productId] = quantity.coerceAtMost(9999)
            publishOptimisticState()
            writeQuantity(productId, quantity)
            return
        }
        if (quantity <= 0) {
            removeFromCart(productId, variant)
            return
        }
        _items.update { current ->
            current.map {
                if (it.product.id == productId && it.selectedVariant == variant) it.copy(quantity = quantity.coerceAtMost(99)) else it
            }
        }
        _totalQuantity.value = _items.value.sumOf { it.quantity }
    }

    fun removeFromCart(productId: String, variant: String? = null) {
        if (userId != null) {
            quantities.remove(productId)
            publishOptimisticState()
            writeQuantity(productId, 0)
            return
        }
        _items.update { current -> current.filterNot { it.product.id == productId && it.selectedVariant == variant } }
        _totalQuantity.value = _items.value.sumOf { it.quantity }
    }

    fun clearCart() {
        val uid = userId
        if (uid != null) getFirestoreSafe()?.collection(FirebaseConfig.COLLECTION_CARTS)?.document(uid)?.set(mapOf("items" to emptyMap<String, Int>()))
        quantities.clear()
        products.clear()
        _totalQuantity.value = 0
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
        val instance by lazy { CartRepository() }
    }
}
