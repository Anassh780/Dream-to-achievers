package com.dreamtoachievers.app.feature.orders

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.ReceiptLong
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dreamtoachievers.app.core.designsystem.components.*
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme

@Composable
fun OrdersScreen(
    viewModel: OrdersViewModel,
    onNavigateToTracking: (String) -> Unit,
    onNavigateToMarket: () -> Unit,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(DtaTheme.colors.background)
                    .statusBarsPadding()
                    .padding(horizontal = DtaTheme.spacing.ScreenHorizontal, vertical = 12.dp)
            ) {
                Text(
                    text = "My Orders",
                    style = DtaTheme.typography.ScreenHeading.copy(
                        color = DtaTheme.colors.primary,
                        fontWeight = FontWeight.Bold,
                        fontSize = 26.sp
                    )
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Order Status Tabs
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    items(OrderFilterTab.entries) { tab ->
                        DtaFilterChip(
                            label = tab.label,
                            isSelected = uiState.selectedTab == tab,
                            onClick = { viewModel.selectTab(tab) }
                        )
                    }
                }
            }
        },
        containerColor = DtaTheme.colors.background,
        modifier = modifier.fillMaxSize()
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            if (uiState.isLoading) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = androidx.compose.ui.Alignment.Center
                ) {
                    CircularProgressIndicator(color = DtaTheme.colors.primary)
                }
            } else if (uiState.orders.isEmpty()) {
                DtaEmptyState(
                    title = "No orders found",
                    description = "You haven't placed any orders in this status yet.",
                    icon = Icons.Outlined.ReceiptLong,
                    actionButtonText = "Start Shopping",
                    onActionClick = onNavigateToMarket
                )
            } else {
                LazyColumn(
                    contentPadding = PaddingValues(
                        start = DtaTheme.spacing.ScreenHorizontal,
                        end = DtaTheme.spacing.ScreenHorizontal,
                        top = 12.dp,
                        bottom = 24.dp
                    ),
                    verticalArrangement = Arrangement.spacedBy(14.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    items(uiState.orders, key = { it.id }) { order ->
                        DtaOrderCard(
                            order = order,
                            onTrackClick = { onNavigateToTracking(order.id) }
                        )
                    }
                }
            }
        }
    }
}
