package com.dreamtoachievers.app.feature.account

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.dreamtoachievers.app.core.data.DataStoreManager
import com.dreamtoachievers.app.core.data.NotificationRepository
import com.dreamtoachievers.app.core.data.OrderRepository
import com.dreamtoachievers.app.core.data.UserRepository
import com.dreamtoachievers.app.core.model.Notification
import com.dreamtoachievers.app.core.model.User
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import kotlinx.coroutines.coroutineScope

data class AccountUiState(
    val user: User? = null,
    val totalOrders: Int = 0,
    val savedAddresses: List<String> = emptyList(),
    val notifications: List<Notification> = emptyList(),
    val isLoggedOut: Boolean = false
)

class AccountViewModel(
    private val userRepository: UserRepository,
    private val orderRepository: OrderRepository,
    private val notificationRepository: NotificationRepository,
    private val dataStoreManager: DataStoreManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(AccountUiState())
    val uiState: StateFlow<AccountUiState> = _uiState.asStateFlow()

    init {
        loadProfile()
    }

    private fun loadProfile() {
        viewModelScope.launch {
            userRepository.currentUser.collectLatest { user ->
                coroutineScope {
                    _uiState.update { it.copy(user = user, totalOrders = 0, savedAddresses = emptyList(), notifications = emptyList(), isLoggedOut = false) }
                    if (user != null) {
                        launch {
                            userRepository.observeAddresses(user.id).collect { addresses ->
                                _uiState.update { it.copy(savedAddresses = addresses.sorted()) }
                            }
                        }
                        launch {
                            orderRepository.getUserOrders(user.id).collect { orders ->
                                _uiState.update { it.copy(totalOrders = orders.size) }
                            }
                        }
                        launch {
                            notificationRepository.observeNotifications(user.id).collect { notifs ->
                                _uiState.update { it.copy(notifications = notifs) }
                            }
                        }
                    }
                }
            }
        }
    }

    fun addAddress(addr: String) {
        if (addr.isNotBlank()) {
            viewModelScope.launch { userRepository.addAddress(addr.trim()) }
        }
    }

    fun removeAddress(address: String) {
        viewModelScope.launch { userRepository.removeAddress(address) }
    }

    fun markNotificationRead(id: String) {
        viewModelScope.launch { notificationRepository.markAsRead(id) }
    }

    fun logout() {
        viewModelScope.launch {
            userRepository.logout()
            _uiState.update { it.copy(isLoggedOut = true, user = null) }
        }
    }
}
