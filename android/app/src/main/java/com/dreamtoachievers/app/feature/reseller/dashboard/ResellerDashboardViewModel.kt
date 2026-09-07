package com.dreamtoachievers.app.feature.reseller.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.dreamtoachievers.app.core.data.DataStoreManager
import com.dreamtoachievers.app.core.data.ResellerRepository
import com.dreamtoachievers.app.core.model.*
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.time.Instant

data class ResellerDashboardUiState(
    val isLoading: Boolean = false,
    val period: String = "30D", // "Today", "7D", "30D", "All"
    val grossSales: Double = 0.0,
    val ordersCount: Int = 0,
    val networkCount: Int = 0,
    val walletLedger: WalletLedger = WalletLedger(),
    val rankProgress: RankProgress = RankProgress(currentRank = RankDefinition(name = "Starter", slug = "starter")),
    val recentSales: List<ResellerSale> = emptyList(),
    val partnerProducts: List<PartnerProduct> = emptyList()
)

class ResellerDashboardViewModel(
    private val resellerRepository: ResellerRepository,
    private val dataStoreManager: DataStoreManager? = null
) : ViewModel() {

    private val _uiState = MutableStateFlow(ResellerDashboardUiState())
    private var allSales: List<ResellerSale> = emptyList()
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
                val userId = dataStoreManager?.userId?.first().orEmpty()
                val ledger = resellerRepository.getWalletLedger(userId)
                val progress = resellerRepository.getRankProgress(userId)

                allSales = sales
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    grossSales = totalForPeriod(sales, _uiState.value.period),
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
        _uiState.value = _uiState.value.copy(period = period, grossSales = totalForPeriod(allSales, period))
    }

    private fun totalForPeriod(sales: List<ResellerSale>, period: String): Double {
        val cutoff = when (period) {
            "Today" -> System.currentTimeMillis() - 24L * 60 * 60 * 1000
            "7D" -> System.currentTimeMillis() - 7L * 24 * 60 * 60 * 1000
            "30D" -> System.currentTimeMillis() - 30L * 24 * 60 * 60 * 1000
            else -> Long.MIN_VALUE
        }
        return sales.filter { sale ->
            period == "All" || runCatching { Instant.parse(sale.createdAt).toEpochMilli() >= cutoff }.getOrDefault(false)
        }.sumOf { it.totalCustomerBill }
    }
}
