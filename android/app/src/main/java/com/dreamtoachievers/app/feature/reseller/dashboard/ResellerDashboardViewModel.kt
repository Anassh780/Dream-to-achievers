package com.dreamtoachievers.app.feature.reseller.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.dreamtoachievers.app.core.data.DataStoreManager
import com.dreamtoachievers.app.core.data.ResellerRepository
import com.dreamtoachievers.app.core.model.*
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.time.ZoneId
import java.time.format.TextStyle
import java.time.Instant
import java.util.Locale

data class ResellerDashboardUiState(
    val isLoading: Boolean = false,
    val period: String = "7D", // "Today", "7D", "30D", "All"
    val grossSales: Double = 0.0,
    val previousPeriodSales: Double = 0.0,
    val growthPercent: Double = 0.0,
    val chartPoints: List<Double> = List(7) { 0.0 },
    val chartLabels: List<String> = List(7) { "–" },
    val ordersCount: Int = 0,
    val weeklyOrders: Int = 0,
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
                val metrics = metricsForPeriod(sales, _uiState.value.period)
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    grossSales = metrics.total,
                    previousPeriodSales = metrics.previous,
                    growthPercent = metrics.growth,
                    chartPoints = metrics.points,
                    chartLabels = metrics.labels,
                    ordersCount = sales.size,
                    weeklyOrders = sales.count { timestamp(it) >= System.currentTimeMillis() - 7L * DAY },
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
        val metrics = metricsForPeriod(allSales, period)
        _uiState.value = _uiState.value.copy(
            period = period,
            grossSales = metrics.total,
            previousPeriodSales = metrics.previous,
            growthPercent = metrics.growth,
            chartPoints = metrics.points,
            chartLabels = metrics.labels,
        )
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

    private fun metricsForPeriod(sales: List<ResellerSale>, period: String): PeriodMetrics {
        val now = System.currentTimeMillis()
        val (span, bucket) = when (period) {
            "Today" -> DAY to 4L * HOUR
            "7D" -> 7L * DAY to DAY
            "30D" -> 35L * DAY to 5L * DAY
            else -> {
                val oldest = sales.minOfOrNull(::timestamp)?.takeIf { it > 0 } ?: (now - 7L * DAY)
                val allSpan = (now - oldest).coerceAtLeast(7L * DAY)
                allSpan to (allSpan / 7L).coerceAtLeast(HOUR)
            }
        }
        val start = now - span
        val points = MutableList(7) { 0.0 }
        sales.forEach { sale ->
            val time = timestamp(sale)
            if (time in start..now) {
                val index = ((time - start) / bucket).toInt().coerceIn(0, 6)
                points[index] += sale.totalCustomerBill
            }
        }
        val labels = List(7) { index ->
            val time = start + index * bucket
            when (period) {
                "Today" -> Instant.ofEpochMilli(time).atZone(ZoneId.systemDefault()).hour.let { hour -> if (hour == 0) "12a" else if (hour < 12) "${hour}a" else if (hour == 12) "12p" else "${hour - 12}p" }
                "7D" -> Instant.ofEpochMilli(time).atZone(ZoneId.systemDefault()).dayOfWeek.getDisplayName(TextStyle.NARROW, Locale.ENGLISH)
                "30D" -> Instant.ofEpochMilli(time).atZone(ZoneId.systemDefault()).dayOfMonth.toString()
                else -> (index + 1).toString()
            }
        }
        val total = if (period == "All") sales.sumOf { it.totalCustomerBill } else points.sum()
        val previousStart = start - span
        val previous = if (period == "All") 0.0 else sales.filter { timestamp(it) in previousStart until start }.sumOf { it.totalCustomerBill }
        val growth = if (previous > 0.0) (total - previous) / previous * 100.0 else if (total > 0.0) 100.0 else 0.0
        return PeriodMetrics(total, previous, growth, points, labels)
    }

    private fun timestamp(sale: ResellerSale): Long = runCatching { Instant.parse(sale.createdAt).toEpochMilli() }.getOrDefault(0L)

    private data class PeriodMetrics(val total: Double, val previous: Double, val growth: Double, val points: List<Double>, val labels: List<String>)

    private companion object {
        const val HOUR = 60L * 60L * 1000L
        const val DAY = 24L * HOUR
    }
}
