package com.dreamtoachievers.app.feature.admin.orders

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dreamtoachievers.app.core.designsystem.components.*
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme
import com.dreamtoachievers.app.core.model.OrderStatus
import com.dreamtoachievers.app.core.model.ResellerSale

@Composable
fun AdminOrderVerificationScreen(
    viewModel: AdminOrderVerificationViewModel,
    onNavigateBack: () -> Unit,
    onNavigateToReview: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val state by viewModel.uiState.collectAsState()

    // 7 Filters (Point 43): Pending Review, Verified, Processing, Dispatched, In Transit, Delivered, Rejected
    val tabs = listOf(
        "All" to "All",
        "Pending Review" to "pending_verification",
        "Verified" to "payment_verified",
        "Processing" to "processing",
        "Dispatched" to "dispatched",
        "In Transit" to "in_transit",
        "Delivered" to "delivered",
        "Rejected" to "rejected"
    )

    Scaffold(
        topBar = {
            DtaTopAppBar(
                title = "Order Verification Queue",
                subtitle = "Authorized administrator fulfillment queue",
                navigationIcon = Icons.Default.ArrowBack,
                onNavigationClick = onNavigateBack
            )
        },
        containerColor = DtaTheme.colors.background,
        modifier = modifier.fillMaxSize()
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // Search Input (Point 43: Order ID, Customer, Reseller, Phone, Transaction reference)
            DtaSearchBar(
                query = state.searchQuery,
                onQueryChange = { viewModel.onSearchQueryChanged(it) },
                placeholder = "Search Order ID, Client, Reseller, Phone, Trx #...",
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
            )

            // Status Filter Chips (Point 43)
            LazyRow(
                modifier = Modifier.fillMaxWidth(),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 4.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(tabs) { (label, raw) ->
                    DtaFilterChip(
                        label = label,
                        selected = state.selectedStatus == raw,
                        onClick = { viewModel.onStatusTabSelected(raw) }
                    )
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            if (state.filteredOrders.isEmpty()) {
                DtaEmptyState(
                    title = "No Orders in Queue",
                    message = "No orders matched your search and status filter."
                )
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(start = 16.dp, end = 16.dp, bottom = 80.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(state.filteredOrders) { order ->
                        AdminOrderQueueCard(
                            order = order,
                            onReviewOrder = { onNavigateToReview(order.id) }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun AdminOrderQueueCard(
    order: ResellerSale,
    onReviewOrder: () -> Unit
) {
    Card(
        shape = DtaTheme.shapes.Card,
        colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
        border = androidx.compose.foundation.BorderStroke(1.dp, DtaTheme.colors.line),
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onReviewOrder)
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // Header Row: Order ID + Status Chip
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text(
                        text = "#${order.id.uppercase()}",
                        style = DtaTheme.typography.TitleSmall.copy(fontWeight = FontWeight.Bold)
                    )
                    Text(
                        text = "• ${order.createdAt.take(10)}",
                        style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.inkSecondary, fontSize = 11.sp)
                    )
                }

                DtaStatusChip(status = order.status)
            }

            // Customer & Reseller line
            Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(
                    text = "Customer: ${order.customerName} (${order.customerCity}) • ${order.customerPhone}",
                    style = DtaTheme.typography.BodyMedium.copy(fontWeight = FontWeight.SemiBold)
                )
                Text(
                    text = "Reseller: ${order.resellerName} (${order.resellerReferralCode})",
                    style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.inkSecondary)
                )
                Text(
                    text = "Product: ${order.productName} (Qty: ${order.quantity})",
                    style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.ink)
                )
            }

            Divider(color = DtaTheme.colors.line)

            // Financials + Action Link
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Total: ${order.formattedTotalBill}",
                        style = DtaTheme.typography.BodyMedium.copy(fontWeight = FontWeight.Bold)
                    )
                    Text(
                        text = "Partner Margin: +${order.formattedTotalProfit}",
                        style = DtaTheme.typography.Label.copy(
                            color = DtaTheme.colors.primary,
                            fontWeight = FontWeight.Bold
                        )
                    )
                }

                Button(
                    onClick = onReviewOrder,
                    shape = DtaTheme.shapes.Chip,
                    colors = ButtonDefaults.buttonColors(containerColor = DtaTheme.colors.primary),
                    contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp)
                ) {
                    Text("Review Order →", style = DtaTheme.typography.Label.copy(fontWeight = FontWeight.Bold))
                }
            }
        }
    }
}
