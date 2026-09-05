package com.dreamtoachievers.app.feature.orders

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.dreamtoachievers.app.core.data.DataStoreManager
import com.dreamtoachievers.app.core.data.OrderRepository
import com.dreamtoachievers.app.core.model.Order
import com.dreamtoachievers.app.core.model.OrderStatus
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

enum class OrderFilterTab(val label: String) {
    ALL("All"),
    PENDING("Pending"),
    PROCESSING("Processing"),
    DISPATCHED("Shipped"),
    DELIVERED("Delivered"),
    CANCELLED("Cancelled")
}

data class OrdersUiState(
    val isLoading: Boolean = true,
    val orders: List<Order> = emptyList(),
    val selectedTab: OrderFilterTab = OrderFilterTab.ALL,
    val error: String? = null
)

class OrdersViewModel(
    private val orderRepository: OrderRepository,
    private val dataStoreManager: DataStoreManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(OrdersUiState())
    val uiState: StateFlow<OrdersUiState> = _uiState.asStateFlow()

    private var allOrders: List<Order> = emptyList()

    init {
        loadOrders()
    }

    fun loadOrders() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            val userId = dataStoreManager.userId.first() ?: ""

            orderRepository.getUserOrders(userId).catch { err ->
                _uiState.update { it.copy(isLoading = false, error = err.localizedMessage) }
            }.collect { orders ->
                allOrders = orders
                filterOrders(_uiState.value.selectedTab)
            }
        }
    }

    fun selectTab(tab: OrderFilterTab) {
        _uiState.update { it.copy(selectedTab = tab) }
        filterOrders(tab)
    }

    private fun filterOrders(tab: OrderFilterTab) {
        val filtered = when (tab) {
            OrderFilterTab.ALL -> allOrders
            OrderFilterTab.PENDING -> allOrders.filter { it.status == OrderStatus.PENDING_VERIFICATION || it.status == OrderStatus.PAYMENT_VERIFIED }
            OrderFilterTab.PROCESSING -> allOrders.filter { it.status == OrderStatus.PROCESSING }
            OrderFilterTab.DISPATCHED -> allOrders.filter { it.status == OrderStatus.DISPATCHED || it.status == OrderStatus.IN_TRANSIT }
            OrderFilterTab.DELIVERED -> allOrders.filter { it.status == OrderStatus.DELIVERED || it.status == OrderStatus.CONFIRMED || it.status == OrderStatus.FULFILLED }
            OrderFilterTab.CANCELLED -> allOrders.filter { it.status == OrderStatus.CANCELLED || it.status == OrderStatus.REJECTED }
        }
        _uiState.update { it.copy(isLoading = false, orders = filtered) }
    }
}
