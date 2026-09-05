package com.dreamtoachievers.app.feature.tracking

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.dreamtoachievers.app.core.data.OrderRepository
import com.dreamtoachievers.app.core.model.Order
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class OrderTrackingUiState(
    val isLoading: Boolean = true,
    val order: Order? = null,
    val error: String? = null
)

class OrderTrackingViewModel(
    private val orderId: String,
    private val orderRepository: OrderRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(OrderTrackingUiState())
    val uiState: StateFlow<OrderTrackingUiState> = _uiState.asStateFlow()

    init {
        loadTracking()
    }

    fun loadTracking() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            val order = orderRepository.getOrderById(orderId)
            if (order != null) {
                _uiState.update { it.copy(isLoading = false, order = order) }
            } else {
                _uiState.update { it.copy(isLoading = false, error = "Order not found") }
            }
        }
    }
}
