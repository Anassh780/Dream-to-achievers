package com.dreamtoachievers.app.feature.reseller.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.dreamtoachievers.app.core.data.DataStoreManager
import com.dreamtoachievers.app.core.data.ResellerRepository
import com.dreamtoachievers.app.core.model.*
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class ResellerDashboardUiState(
    val isLoading: Boolean = false,
    val period: String = "30D", // "Today", "7D", "30D", "All"
    val grossSales: Double = 245800.0,
    val ordersCount: Int = 24,
    val networkCount: Int = 48,
    val walletLedger: WalletLedger = WalletLedger(
        realizedProfit = 22500.0,
        pendingProfit = 6800.0,
        withdrawnProfit = 4000.0,
        availableBalance = 18500.0
    ),
    val rankProgress: RankProgress = RankProgress(
        currentRank = RankDefinition(name = "Silver Rank", slug = "silver", order = 1, rewardAmount = 2000.0),
        nextRank = RankDefinition(name = "Platinum Rank", slug = "platinum", order = 2, requiredSales = 25, requiredCommunity = 45, rewardAmount = 4000.0),
        qualifyingSales = 18,
        qualifyingCommunity = 32,
        salesProgressPercent = 72,
        communityProgressPercent = 71,
        overallProgressPercent = 71
    ),
    val recentSales: List<ResellerSale> = emptyList(),
    val partnerProducts: List<PartnerProduct> = emptyList()
)

class ResellerDashboardViewModel(
    private val resellerRepository: ResellerRepository,
    private val dataStoreManager: DataStoreManager? = null
) : ViewModel() {

    private val _uiState = MutableStateFlow(ResellerDashboardUiState())
    val uiState: StateFlow<ResellerDashboardUiState> = _uiState.asStateFlow()

    init {
        loadDashboardData()
    }

    private fun loadDashboardData() {
        viewModelScope.launch {
            combine(
                resellerRepository.resellerSales,
                resellerRepository.partnerProducts,
                resellerRepository.communityMembers
            ) { sales, products, members ->
                val ledger = resellerRepository.getWalletLedger()
                val progress = resellerRepository.getRankProgress()

                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    ordersCount = sales.size,
                    networkCount = members.size,
                    walletLedger = ledger,
                    rankProgress = progress,
                    recentSales = sales.take(5),
                    partnerProducts = products
                )
            }.collect()
        }
    }

    fun selectPeriod(period: String) {
        val gross = when (period) {
            "Today" -> 18500.0
            "7D" -> 64200.0
            "30D" -> 245800.0
            else -> 480000.0
        }
        _uiState.value = _uiState.value.copy(period = period, grossSales = gross)
    }
}
