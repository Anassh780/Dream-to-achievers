package com.dreamtoachievers.app.feature.checkout

import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.dreamtoachievers.app.core.data.CartRepository
import com.dreamtoachievers.app.core.data.OrderRepository
import com.dreamtoachievers.app.core.data.UserRepository
import com.dreamtoachievers.app.core.model.*
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class CheckoutUiState(
    val fullName: String = "",
    val phone: String = "",
    val address: String = "",
    val city: String = "",
    val selectedPaymentMethod: PaymentMethodType = PaymentMethodType.BANK_TRANSFER,
    val paymentReceiptUri: Uri? = null,
    val paymentReceiptUrl: String? = null,
    val isSubmitting: Boolean = false,
    val error: String? = null,
    val submittedOrderId: String? = null
)

class CheckoutViewModel(
    private val cartRepository: CartRepository = CartRepository.instance,
    private val orderRepository: OrderRepository,
    private val userRepository: UserRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(CheckoutUiState())
    val uiState: StateFlow<CheckoutUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            userRepository.currentUser.collect { user ->
                if (user != null) {
                    _uiState.update {
                        it.copy(
                            fullName = it.fullName.ifEmpty { user.fullName },
                            phone = it.phone.ifEmpty { user.phone ?: "" },
                            city = it.city.ifEmpty { user.city ?: "" }
                        )
                    }
                }
            }
        }
    }

    fun onFullNameChanged(name: String) = _uiState.update { it.copy(fullName = name, error = null) }
    fun onPhoneChanged(phone: String) = _uiState.update { it.copy(phone = phone, error = null) }
    fun onAddressChanged(addr: String) = _uiState.update { it.copy(address = addr, error = null) }
    fun onCityChanged(city: String) = _uiState.update { it.copy(city = city, error = null) }
    fun onPaymentMethodSelected(method: PaymentMethodType) = _uiState.update { it.copy(selectedPaymentMethod = method) }

    fun onReceiptSelected(uri: Uri?) {
        _uiState.update { it.copy(paymentReceiptUri = uri, error = null) }
    }

    fun submitOrder() {
        val state = _uiState.value
        if (state.fullName.isBlank() || state.phone.isBlank() || state.address.isBlank() || state.city.isBlank()) {
            _uiState.update { it.copy(error = "Please fill in all delivery details") }
            return
        }

        val cartItems = cartRepository.items.value
        if (cartItems.isEmpty()) {
            _uiState.update { it.copy(error = "Cart is empty") }
            return
        }

        viewModelScope.launch {
            _uiState.update { it.copy(isSubmitting = true, error = null) }

            val primaryProduct = cartItems.first().product
            val totalQuantity = cartItems.sumOf { it.quantity }
            val totalAmount = cartRepository.getTotal()

            // 1. Upload receipt screenshot if selected
            var receiptUrl = ""
            state.paymentReceiptUri?.let { uri ->
                val tempOrderId = "sale-${System.currentTimeMillis()}"
                receiptUrl = orderRepository.uploadReceipt(tempOrderId, uri)
            }

            val newOrder = Order(
                userId = "",
                productId = primaryProduct.id,
                productName = if (cartItems.size == 1) primaryProduct.name else "${primaryProduct.name} + ${cartItems.size - 1} items",
                productImage = primaryProduct.imageUrl,
                customerName = state.fullName,
                customerPhone = state.phone,
                customerAddress = state.address,
                customerCity = state.city,
                paymentScreenshotUrl = receiptUrl.ifEmpty { null },
                paymentMethod = state.selectedPaymentMethod.rawValue,
                quantity = totalQuantity,
                retailPrice = totalAmount / totalQuantity,
                sellingPrice = totalAmount / totalQuantity,
                currency = primaryProduct.currency,
                status = OrderStatus.PENDING_VERIFICATION
            )

            val result = orderRepository.submitOrder(newOrder)
            result.fold(
                onSuccess = { order ->
                    cartRepository.clearCart()
                    _uiState.update { it.copy(isSubmitting = false, submittedOrderId = order.id) }
                },
                onFailure = { err ->
                    _uiState.update { it.copy(isSubmitting = false, error = err.localizedMessage ?: "Failed to place order") }
                }
            )
        }
    }
}
