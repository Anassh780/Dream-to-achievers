package com.dreamtoachievers.app.feature.admin.hub

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.dreamtoachievers.app.core.data.AdminRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class AdminHubUiState(
    val pendingVerificationsCount: Int = 0,
    val processingOrdersCount: Int = 0,
    val pendingWithdrawalsCount: Int = 0,
    val pendingRankRewardsCount: Int = 0,
    val lowStockCount: Int = 0,
    val totalUsersCount: Int = 0,
    val totalRevenueFormatted: String = "PKR 0",
    val activeResellersCount: Int = 0
)

class AdminHubViewModel(
    private val adminRepository: AdminRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(AdminHubUiState())
    val uiState: StateFlow<AdminHubUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            combine(
                adminRepository.platformOrders,
                adminRepository.platformWithdrawals,
                adminRepository.platformRewards,
                adminRepository.platformUsers,
                adminRepository.products
            ) { _, _, _, _, _ ->
                _uiState.value = AdminHubUiState(
                    pendingVerificationsCount = adminRepository.pendingVerificationsCount,
                    processingOrdersCount = adminRepository.processingOrdersCount,
                    pendingWithdrawalsCount = adminRepository.pendingWithdrawalsCount,
                    pendingRankRewardsCount = adminRepository.pendingRankRewardsCount,
                    lowStockCount = adminRepository.lowStockCount,
                    totalUsersCount = adminRepository.totalUsersCount,
                    totalRevenueFormatted = adminRepository.formattedPlatformRevenue,
                    activeResellersCount = adminRepository.activeResellersCount
                )
            }.collect()
        }
    }
}
