package com.dreamtoachievers.app.feature.admin.orders

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.dreamtoachievers.app.core.data.AdminRepository
import com.dreamtoachievers.app.core.model.OrderStatus
import com.dreamtoachievers.app.core.model.ResellerSale
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class AdminOrderVerificationUiState(
    val orders: List<ResellerSale> = emptyList(),
    val filteredOrders: List<ResellerSale> = emptyList(),
    val selectedStatus: String = "All",
    val searchQuery: String = "",
    val selectedOrder: ResellerSale? = null,
    val isUpdating: Boolean = false,
    val successMessage: String? = null
)

class AdminOrderVerificationViewModel(
    private val adminRepository: AdminRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(AdminOrderVerificationUiState())
    val uiState: StateFlow<AdminOrderVerificationUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            adminRepository.platformOrders.collect { orders ->
                _uiState.value = _uiState.value.copy(
                    orders = orders,
                    filteredOrders = filterOrders(orders, _uiState.value.selectedStatus, _uiState.value.searchQuery)
                )
            }
        }
    }

    fun onStatusTabSelected(statusRaw: String) {
        _uiState.value = _uiState.value.copy(
            selectedStatus = statusRaw,
            filteredOrders = filterOrders(_uiState.value.orders, statusRaw, _uiState.value.searchQuery)
        )
    }

    fun onSearchQueryChanged(query: String) {
        _uiState.value = _uiState.value.copy(
            searchQuery = query,
            filteredOrders = filterOrders(_uiState.value.orders, _uiState.value.selectedStatus, query)
        )
    }

    fun selectOrderForReview(order: ResellerSale?) {
        _uiState.value = _uiState.value.copy(selectedOrder = order)
    }

    fun verifyPayment(orderId: String) {
        adminRepository.verifyPayment(orderId)
    }

    fun moveToProcessing(orderId: String) {
        adminRepository.moveToProcessing(orderId)
    }

    fun dispatchOrder(orderId: String, courier: String, trackingNumber: String) {
        adminRepository.dispatchOrder(orderId, courier, trackingNumber)
    }

    fun markDelivered(orderId: String) {
        adminRepository.markDelivered(orderId)
    }

    fun rejectOrder(orderId: String, reason: String, detail: String? = null) {
        adminRepository.rejectOrder(orderId, reason, detail)
    }

    private fun filterOrders(orders: List<ResellerSale>, statusRaw: String, query: String): List<ResellerSale> {
        return orders.filter { order ->
            val matchesStatus = if (statusRaw == "All") true else order.status.rawValue.equals(statusRaw, ignoreCase = true)
            val matchesQuery = if (query.isBlank()) true else {
                order.id.contains(query, ignoreCase = true) ||
                order.customerName.contains(query, ignoreCase = true) ||
                order.resellerName.contains(query, ignoreCase = true) ||
                order.customerPhone.contains(query, ignoreCase = true) ||
                (order.transactionReference?.contains(query, ignoreCase = true) == true)
            }
            matchesStatus && matchesQuery
        }
    }
}
