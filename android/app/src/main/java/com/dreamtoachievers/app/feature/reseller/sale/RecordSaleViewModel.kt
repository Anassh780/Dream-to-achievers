package com.dreamtoachievers.app.feature.reseller.sale

import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.dreamtoachievers.app.core.data.ResellerRepository
import com.dreamtoachievers.app.core.model.PartnerProduct
import com.dreamtoachievers.app.core.model.ResellerSale
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class RecordSaleUiState(
    val products: List<PartnerProduct> = emptyList(),
    val selectedProduct: PartnerProduct? = null,
    val quantity: Int = 1,
    val sellingPriceInput: String = "",
    val customerName: String = "",
    val customerPhone: String = "",
    val customerEmail: String = "",
    val customerAddress: String = "",
    val customerCity: String = "",
    val paymentSlipUri: Uri? = null,
    val paymentNotes: String = "",
    val isSubmitting: Boolean = false,
    val errorMessage: String? = null,
    val submittedSale: ResellerSale? = null
) {
    val sellingPrice: Double
        get() = sellingPriceInput.toDoubleOrNull() ?: selectedProduct?.suggestedSellingPrice ?: 0.0

    val partnerCost: Double
        get() = (selectedProduct?.partnerPrice ?: 0.0) * quantity

    val totalClientBill: Double
        get() = sellingPrice * quantity

    val estimatedProfit: Double
        get() = ((sellingPrice - (selectedProduct?.partnerPrice ?: 0.0)) * quantity).coerceAtLeast(0.0)

    val isPriceValid: Boolean
        get() = sellingPrice >= (selectedProduct?.partnerPrice ?: 0.0)

    val canSubmit: Boolean
        get() = selectedProduct != null &&
                customerName.isNotBlank() &&
                customerPhone.isNotBlank() &&
                customerAddress.isNotBlank() &&
                customerCity.isNotBlank() &&
                isPriceValid &&
                !isSubmitting
}

class RecordSaleViewModel(
    private val initialProductId: String?,
    private val resellerRepository: ResellerRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(RecordSaleUiState())
    val uiState: StateFlow<RecordSaleUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            resellerRepository.partnerProducts.collect { products ->
                val preSelected = if (!initialProductId.isNullOrBlank()) {
                    products.firstOrNull { it.id == initialProductId }
                } else {
                    products.firstOrNull()
                }

                _uiState.value = _uiState.value.copy(
                    products = products,
                    selectedProduct = preSelected,
                    sellingPriceInput = preSelected?.suggestedSellingPrice?.toInt()?.toString() ?: ""
                )
            }
        }
    }

    fun onProductSelected(product: PartnerProduct) {
        _uiState.value = _uiState.value.copy(
            selectedProduct = product,
            sellingPriceInput = product.suggestedSellingPrice.toInt().toString()
        )
    }

    fun onQuantityChanged(delta: Int) {
        val newQty = (_uiState.value.quantity + delta).coerceIn(1, 50)
        _uiState.value = _uiState.value.copy(quantity = newQty)
    }

    fun onSellingPriceChanged(input: String) {
        _uiState.value = _uiState.value.copy(sellingPriceInput = input)
    }

    fun onCustomerNameChanged(name: String) {
        _uiState.value = _uiState.value.copy(customerName = name)
    }

    fun onCustomerPhoneChanged(phone: String) {
        _uiState.value = _uiState.value.copy(customerPhone = phone)
    }

    fun onCustomerAddressChanged(address: String) {
        _uiState.value = _uiState.value.copy(customerAddress = address)
    }

    fun onCustomerCityChanged(city: String) {
        _uiState.value = _uiState.value.copy(customerCity = city)
    }

    fun onPaymentSlipSelected(uri: Uri?) {
        _uiState.value = _uiState.value.copy(paymentSlipUri = uri)
    }

    fun onPaymentNotesChanged(notes: String) {
        _uiState.value = _uiState.value.copy(paymentNotes = notes)
    }

    fun submitSale(onSuccess: (String) -> Unit) {
        val state = _uiState.value
        val product = state.selectedProduct ?: return

        if (!state.canSubmit) return

        _uiState.value = _uiState.value.copy(isSubmitting = true, errorMessage = null)

        val result = resellerRepository.recordSale(
            userId = "reseller-1",
            product = product,
            customerName = state.customerName,
            customerPhone = state.customerPhone,
            customerEmail = state.customerEmail,
            customerAddress = state.customerAddress,
            customerCity = state.customerCity,
            quantity = state.quantity,
            sellingPrice = state.sellingPrice,
            paymentScreenshotUrl = state.paymentSlipUri?.toString() ?: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80",
            paymentProofNotes = state.paymentNotes
        )

        result.onSuccess { sale ->
            _uiState.value = _uiState.value.copy(isSubmitting = false, submittedSale = sale)
            onSuccess(sale.id)
        }.onFailure { ex ->
            _uiState.value = _uiState.value.copy(isSubmitting = false, errorMessage = ex.message)
        }
    }
}
