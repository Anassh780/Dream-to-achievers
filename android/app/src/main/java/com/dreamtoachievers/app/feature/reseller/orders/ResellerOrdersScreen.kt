package com.dreamtoachievers.app.feature.reseller.orders

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dreamtoachievers.app.core.data.ResellerRepository
import com.dreamtoachievers.app.core.designsystem.components.*
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme
import com.dreamtoachievers.app.core.model.OrderStatus
import com.dreamtoachievers.app.core.model.ResellerSale

@Composable
fun ResellerOrdersScreen(
    resellerRepository: ResellerRepository,
    onNavigateBack: () -> Unit,
    onNavigateToDetail: (String) -> Unit,
    onRecordNewSale: () -> Unit,
    modifier: Modifier = Modifier
) {
    val sales by resellerRepository.resellerSales.collectAsState()

    // 8 Required Filters (Point 34)
    val filterTabs = listOf(
        "All" to "All",
        "Pending Verification" to "pending_verification",
        "Payment Verified" to "payment_verified",
        "Processing" to "processing",
        "Dispatched" to "dispatched",
        "In Transit" to "in_transit",
        "Delivered" to "delivered",
        "Rejected" to "rejected"
    )

    var selectedStatus by remember { mutableStateOf("All") }
    var searchQuery by remember { mutableStateOf("") }
    var debouncedSearchQuery by remember { mutableStateOf("") }

    LaunchedEffect(searchQuery) {
        kotlinx.coroutines.delay(300)
        debouncedSearchQuery = searchQuery
    }

    val filteredSales = remember(sales, selectedStatus, debouncedSearchQuery) {
        sales.filter { sale ->
            val matchesStatus = selectedStatus == "All" || sale.status.rawValue.equals(selectedStatus, ignoreCase = true)
            val matchesQuery = debouncedSearchQuery.isBlank() ||
                sale.id.contains(debouncedSearchQuery, ignoreCase = true) ||
                sale.customerName.contains(debouncedSearchQuery, ignoreCase = true) ||
                sale.customerPhone.contains(debouncedSearchQuery, ignoreCase = true) ||
                sale.productName.contains(debouncedSearchQuery, ignoreCase = true) ||
                (sale.trackingNumber?.contains(debouncedSearchQuery, ignoreCase = true) == true)
            matchesStatus && matchesQuery
        }
    }

    Scaffold(
        topBar = {
            DtaTopAppBar(
                title = "Customer Order Book",
                subtitle = "Track customer fulfillment, courier tracking, and profit release",
                navigationIcon = Icons.Default.ArrowBack,
                onNavigationClick = onNavigateBack
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = onRecordNewSale,
                containerColor = DtaTheme.colors.primary,
                contentColor = androidx.compose.ui.graphics.Color.White
            ) {
                Icon(Icons.Default.Add, contentDescription = "Record Sale")
            }
        },
        containerColor = DtaTheme.colors.background,
        modifier = modifier.fillMaxSize()
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // Point 94: Debounced Order Search Bar
            Box(modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp)) {
                DtaSearchBar(
                    query = searchQuery,
                    onQueryChange = { searchQuery = it },
                    placeholder = "Search order #, customer, phone, product, or tracking...",
                    modifier = Modifier.fillMaxWidth()
                )
            }

            // Horizontal Filter Chips (Point 34)
            LazyRow(
                modifier = Modifier.fillMaxWidth(),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 4.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(filterTabs) { (label, raw) ->
                    DtaFilterChip(
                        label = label,
                        selected = selectedStatus == raw,
                        onClick = { selectedStatus = raw }
                    )
                }
            }

            if (filteredSales.isEmpty()) {
                DtaEmptyState(
                    title = "No Orders Found",
                    message = if (debouncedSearchQuery.isNotBlank()) "No orders match '$debouncedSearchQuery'." else "Orders matching '$selectedStatus' will appear here.",
                    actionLabel = "Record Sale Now",
                    onActionClick = onRecordNewSale
                )
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 6.dp, bottom = 80.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(filteredSales) { sale ->
                        ResellerOrderListItemCard(
                            sale = sale,
                            onClick = { onNavigateToDetail(sale.id) }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun ResellerOrderListItemCard(
    sale: ResellerSale,
    onClick: () -> Unit
) {
    Card(
        shape = DtaTheme.shapes.Card,
        colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
        border = androidx.compose.foundation.BorderStroke(1.dp, DtaTheme.colors.line),
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // Header: Order ID + Status
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "#${sale.id.uppercase()}",
                    style = DtaTheme.typography.TitleSmall.copy(fontWeight = FontWeight.Bold)
                )
                DtaStatusChip(status = sale.status)
            }

            // Customer & Products
            Text(
                text = "${sale.productName} (Qty: ${sale.quantity})",
                style = DtaTheme.typography.TitleSmall.copy(fontWeight = FontWeight.SemiBold)
            )

            Text(
                text = "Client: ${sale.customerName} • ${sale.customerCity}",
                style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.inkSecondary)
            )

            Divider(color = DtaTheme.colors.line)

            // Amount + Profit + Date
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Total Amount: ${sale.formattedTotalBill}",
                        style = DtaTheme.typography.BodyMedium.copy(
                            color = DtaTheme.colors.ink,
                            fontWeight = FontWeight.Bold
                        )
                    )
                    Text(
                        text = "Profit: +${sale.formattedTotalProfit}",
                        style = DtaTheme.typography.Label.copy(
                            color = DtaTheme.colors.primary,
                            fontWeight = FontWeight.Bold
                        )
                    )
                }

                Text(
                    text = sale.createdAt.take(10),
                    style = DtaTheme.typography.BodySmall.copy(
                        color = DtaTheme.colors.inkSecondary,
                        fontSize = 11.sp
                    )
                )
            }
        }
    }
}
