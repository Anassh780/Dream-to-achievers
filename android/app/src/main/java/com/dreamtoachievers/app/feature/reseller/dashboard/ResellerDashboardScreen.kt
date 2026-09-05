package com.dreamtoachievers.app.feature.reseller.dashboard

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dreamtoachievers.app.core.designsystem.components.*
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme
import com.dreamtoachievers.app.core.model.ResellerSale

@Composable
fun ResellerDashboardScreen(
    viewModel: ResellerDashboardViewModel,
    onNavigateToRecordSale: (String?) -> Unit,
    onNavigateToCatalog: () -> Unit,
    onNavigateToWallet: () -> Unit,
    onNavigateToGrowth: () -> Unit,
    onNavigateToOrders: () -> Unit,
    onNavigateToReferrals: () -> Unit,
    onNavigateToTracking: (String) -> Unit,
    onSwitchRole: () -> Unit,
    modifier: Modifier = Modifier
) {
    val state by viewModel.uiState.collectAsState()

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(DtaTheme.colors.background),
        contentPadding = PaddingValues(bottom = 80.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // 1. Partner Header with Role Switcher
        item {
            ResellerHeader(
                partnerName = "Ali Khan",
                rankName = state.rankProgress.currentRank.name,
                onSwitchRole = onSwitchRole
            )
        }

        // 2. Business Overview Hero Card (Emerald + Gold gradient)
        item {
            BusinessOverviewHeroCard(
                grossSales = state.grossSales,
                currentPeriod = state.period,
                onSelectPeriod = { viewModel.selectPeriod(it) }
            )
        }

        // 3. Quick Action Row
        item {
            QuickActionsRow(
                onRecordSale = { onNavigateToRecordSale(null) },
                onCatalog = onNavigateToCatalog,
                onWallet = onNavigateToWallet,
                onGrowth = onNavigateToGrowth
            )
        }

        // 4. 4-Tile Metrics Bento Grid
        item {
            MetricsBentoGrid(
                ordersCount = state.ordersCount,
                networkCount = state.networkCount,
                availableBalance = state.walletLedger.availableBalance,
                rankProgress = state.rankProgress,
                onOrdersClick = onNavigateToOrders,
                onNetworkClick = onNavigateToReferrals,
                onWalletClick = onNavigateToWallet,
                onGrowthClick = onNavigateToGrowth
            )
        }

        // 5. Wholesale Opportunity Banner
        item {
            WholesaleBanner(onExploreCatalog = onNavigateToCatalog)
        }

        // 6. Recent Sales Activity Section
        item {
            SectionHeader(
                title = "Recent Sales Activity",
                subtitle = "Track customer orders and verified profit margins",
                actionText = "View All",
                onActionClick = onNavigateToOrders,
                modifier = Modifier.padding(horizontal = 16.dp)
            )
        }

        if (state.recentSales.isEmpty()) {
            item {
                DtaEmptyState(
                    title = "No Sales Recorded Yet",
                    message = "Record your first customer order to start earning wholesale profits and climbing ranks.",
                    actionLabel = "Record Sale Now",
                    onActionClick = { onNavigateToRecordSale(null) }
                )
            }
        } else {
            items(state.recentSales) { sale ->
                ResellerSaleCard(
                    sale = sale,
                    onClick = { onNavigateToTracking(sale.id) },
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)
                )
            }
        }
    }
}

@Composable
private fun ResellerHeader(
    partnerName: String,
    rankName: String,
    onSwitchRole: () -> Unit
) {
    Surface(
        color = DtaTheme.colors.surface,
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
                .padding(horizontal = 16.dp, vertical = 14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .clip(CircleShape)
                        .background(DtaTheme.colors.primaryContainer),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = partnerName.take(2).uppercase(),
                        style = DtaTheme.typography.TitleSmall.copy(
                            color = DtaTheme.colors.primary,
                            fontWeight = FontWeight.Bold
                        )
                    )
                }

                Column {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(
                            text = partnerName,
                            style = DtaTheme.typography.TitleMedium.copy(fontWeight = FontWeight.Bold)
                        )
                        Box(
                            modifier = Modifier
                                .clip(DtaTheme.shapes.Chip)
                                .background(DtaTheme.colors.accentSoft.copy(alpha = 0.5f))
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = rankName,
                                style = DtaTheme.typography.Label.copy(
                                    color = DtaTheme.colors.accent,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 10.sp
                                )
                            )
                        }
                    }
                    Text(
                        text = "Partner Merchant Console",
                        style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.inkSecondary)
                    )
                }
            }

            // Role Switcher / Preview Chip
            OutlinedButton(
                onClick = onSwitchRole,
                shape = DtaTheme.shapes.Chip,
                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, DtaTheme.colors.primary)
            ) {
                Icon(
                    imageVector = Icons.Default.SwapHoriz,
                    contentDescription = "Switch Role",
                    tint = DtaTheme.colors.primary,
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = "Role",
                    style = DtaTheme.typography.Label.copy(
                        color = DtaTheme.colors.primary,
                        fontWeight = FontWeight.SemiBold
                    )
                )
            }
        }
    }
}

@Composable
private fun BusinessOverviewHeroCard(
    grossSales: Double,
    currentPeriod: String,
    onSelectPeriod: (String) -> Unit
) {
    Card(
        shape = DtaTheme.shapes.Hero,
        colors = CardDefaults.cardColors(containerColor = Color.Transparent),
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    brush = Brush.verticalGradient(
                        colors = listOf(
                            DtaTheme.colors.primary,
                            DtaTheme.colors.primaryDark
                        )
                    )
                )
                .padding(20.dp)
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                // Header row: Label + Period Tabs
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "TOTAL BUSINESS",
                            style = DtaTheme.typography.Label.copy(
                                color = Color.White.copy(alpha = 0.75f),
                                letterSpacing = 1.sp,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = "Rs ${grossSales.toInt().toString().reversed().chunked(3).joinToString(",").reversed()}",
                            style = DtaTheme.typography.DisplayLarge.copy(
                                color = Color.White,
                                fontWeight = FontWeight.Black,
                                fontSize = 28.sp
                            )
                        )
                    }

                    // Growth Pill
                    Box(
                        modifier = Modifier
                            .clip(DtaTheme.shapes.Chip)
                            .background(Color.White.copy(alpha = 0.18f))
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.TrendingUp,
                                contentDescription = null,
                                tint = Color(0xFFA7F3D0),
                                modifier = Modifier.size(13.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "+18.4% this month",
                                style = DtaTheme.typography.Label.copy(
                                    color = Color(0xFFA7F3D0),
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 11.sp
                                )
                            )
                        }
                    }
                }

                // Smooth Continuous Sparkline Wave Curve
                Canvas(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(36.dp)
                ) {
                    val width = size.width
                    val height = size.height

                    val path = Path().apply {
                        moveTo(0f, height * 0.8f)
                        cubicTo(
                            width * 0.2f, height * 0.85f,
                            width * 0.35f, height * 0.45f,
                            width * 0.5f, height * 0.5f
                        )
                        cubicTo(
                            width * 0.65f, height * 0.55f,
                            width * 0.8f, height * 0.2f,
                            width, height * 0.15f
                        )
                    }

                    drawPath(
                        path = path,
                        color = Color(0xFF6EE7B7),
                        style = Stroke(width = 2.5.dp.toPx(), cap = StrokeCap.Round)
                    )

                    val fillPath = Path().apply {
                        addPath(path)
                        lineTo(width, height)
                        lineTo(0f, height)
                        close()
                    }

                    drawPath(
                        path = fillPath,
                        brush = Brush.verticalGradient(
                            colors = listOf(
                                Color(0xFF6EE7B7).copy(alpha = 0.25f),
                                Color.Transparent
                            )
                        )
                    )
                }

                // Period Selector Tabs
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(DtaTheme.shapes.Chip)
                        .background(Color.Black.copy(alpha = 0.2f))
                        .padding(4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    listOf("Today", "7D", "30D", "All").forEach { period ->
                        val isSelected = currentPeriod == period
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(DtaTheme.shapes.Chip)
                                .background(
                                    if (isSelected) DtaTheme.colors.accent
                                    else Color.Transparent
                                )
                                .clickable { onSelectPeriod(period) }
                                .padding(vertical = 6.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = period,
                                style = DtaTheme.typography.Label.copy(
                                    color = if (isSelected) Color.Black else Color.White.copy(alpha = 0.75f),
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                                )
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun QuickActionsRow(
    onRecordSale: () -> Unit,
    onCatalog: () -> Unit,
    onWallet: () -> Unit,
    onGrowth: () -> Unit
) {
    LazyRow(
        modifier = Modifier.fillMaxWidth(),
        contentPadding = PaddingValues(horizontal = 16.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            QuickActionButton(
                icon = Icons.Default.AddCircle,
                title = "Record Sale",
                subtitle = "Enter Client Order",
                isPrimary = true,
                onClick = onRecordSale
            )
        }
        item {
            QuickActionButton(
                icon = Icons.Default.Storefront,
                title = "Wholesale",
                subtitle = "35% Margins",
                isPrimary = false,
                onClick = onCatalog
            )
        }
        item {
            QuickActionButton(
                icon = Icons.Default.AccountBalanceWallet,
                title = "Payout",
                subtitle = "Withdraw Profit",
                isPrimary = false,
                onClick = onWallet
            )
        }
        item {
            QuickActionButton(
                icon = Icons.Default.MilitaryTech,
                title = "Ranks",
                subtitle = "Milestone Goals",
                isPrimary = false,
                onClick = onGrowth
            )
        }
    }
}

@Composable
private fun QuickActionButton(
    icon: ImageVector,
    title: String,
    subtitle: String,
    isPrimary: Boolean,
    onClick: () -> Unit
) {
    Card(
        shape = DtaTheme.shapes.Card,
        colors = CardDefaults.cardColors(
            containerColor = if (isPrimary) DtaTheme.colors.primaryContainer else DtaTheme.colors.surface
        ),
        border = androidx.compose.foundation.BorderStroke(
            width = 1.dp,
            color = if (isPrimary) DtaTheme.colors.primary.copy(alpha = 0.3f) else DtaTheme.colors.line
        ),
        modifier = Modifier
            .width(140.dp)
            .clickable(onClick = onClick)
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(DtaTheme.shapes.Chip)
                    .background(
                        if (isPrimary) DtaTheme.colors.primary else DtaTheme.colors.surfaceAlt
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = if (isPrimary) Color.White else DtaTheme.colors.primary,
                    modifier = Modifier.size(20.dp)
                )
            }

            Column {
                Text(
                    text = title,
                    style = DtaTheme.typography.TitleSmall.copy(fontWeight = FontWeight.Bold)
                )
                Text(
                    text = subtitle,
                    style = DtaTheme.typography.BodySmall.copy(
                        color = DtaTheme.colors.inkSecondary,
                        fontSize = 11.sp
                    )
                )
            }
        }
    }
}

@Composable
private fun MetricsBentoGrid(
    ordersCount: Int,
    networkCount: Int,
    availableBalance: Double,
    rankProgress: com.dreamtoachievers.app.core.model.RankProgress,
    onOrdersClick: () -> Unit,
    onNetworkClick: () -> Unit,
    onWalletClick: () -> Unit,
    onGrowthClick: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            // Tile 1: Total Orders (Clickable -> Reseller Orders List)
            MetricTile(
                title = "Total Orders",
                value = "$ordersCount Sales",
                badgeText = "View All",
                icon = Icons.Default.ShoppingCart,
                modifier = Modifier
                    .weight(1f)
                    .clickable(onClick = onOrdersClick)
            )

            // Tile 2: Active Community (Clickable -> Referrals / My Team)
            MetricTile(
                title = "Network Team",
                value = "$networkCount Partners",
                badgeText = "My Team",
                icon = Icons.Default.Group,
                modifier = Modifier
                    .weight(1f)
                    .clickable(onClick = onNetworkClick)
            )
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            // Tile 3: Available Balance (Clickable -> Wallet & Payout)
            MetricTile(
                title = "Available Wallet",
                value = "Rs ${availableBalance.toInt().toString().reversed().chunked(3).joinToString(",").reversed()}",
                badgeText = "Withdraw",
                icon = Icons.Default.AccountBalanceWallet,
                highlightColor = DtaTheme.colors.accent,
                modifier = Modifier
                    .weight(1f)
                    .clickable(onClick = onWalletClick)
            )

            // Tile 4: Rank Progress (Clickable -> Growth & Milestone Goals)
            MetricTile(
                title = "Rank Status",
                value = rankProgress.currentRank.name.replace(" Rank", ""),
                badgeText = "${rankProgress.overallProgressPercent}% Next",
                icon = Icons.Default.EmojiEvents,
                highlightColor = DtaTheme.colors.primary,
                modifier = Modifier
                    .weight(1f)
                    .clickable(onClick = onGrowthClick)
            )
        }
    }
}

@Composable
private fun MetricTile(
    title: String,
    value: String,
    badgeText: String,
    icon: ImageVector,
    highlightColor: Color = DtaTheme.colors.primary,
    modifier: Modifier = Modifier
) {
    Card(
        shape = DtaTheme.shapes.Card,
        colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
        border = androidx.compose.foundation.BorderStroke(1.dp, DtaTheme.colors.line),
        modifier = modifier
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = title,
                    style = DtaTheme.typography.Label.copy(color = DtaTheme.colors.inkSecondary)
                )
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = highlightColor,
                    modifier = Modifier.size(18.dp)
                )
            }

            Text(
                text = value,
                style = DtaTheme.typography.TitleLarge.copy(fontWeight = FontWeight.Bold)
            )

            Box(
                modifier = Modifier
                    .clip(DtaTheme.shapes.Chip)
                    .background(DtaTheme.colors.surfaceAlt)
                    .padding(horizontal = 6.dp, vertical = 2.dp)
            ) {
                Text(
                    text = badgeText,
                    style = DtaTheme.typography.Label.copy(
                        color = DtaTheme.colors.ink,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                )
            }
        }
    }
}

@Composable
private fun WholesaleBanner(onExploreCatalog: () -> Unit) {
    Card(
        shape = DtaTheme.shapes.Card,
        colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surfaceAlt),
        border = androidx.compose.foundation.BorderStroke(1.dp, DtaTheme.colors.line),
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .clickable(onClick = onExploreCatalog)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(DtaTheme.shapes.Card)
                    .background(DtaTheme.colors.primary),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Inventory2,
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(24.dp)
                )
            }

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "Wholesale Partner Sourcing",
                    style = DtaTheme.typography.TitleMedium.copy(fontWeight = FontWeight.Bold)
                )
                Text(
                    text = "Direct factory pricing with up to 35% profit margin per unit.",
                    style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.inkSecondary)
                )
            }

            Icon(
                imageVector = Icons.Default.ArrowForwardIos,
                contentDescription = null,
                tint = DtaTheme.colors.inkSecondary,
                modifier = Modifier.size(16.dp)
            )
        }
    }
}

@Composable
private fun ResellerSaleCard(
    sale: ResellerSale,
    onClick: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    Card(
        shape = DtaTheme.shapes.Card,
        colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
        border = androidx.compose.foundation.BorderStroke(1.dp, DtaTheme.colors.line),
        modifier = modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = sale.id.uppercase(),
                    style = DtaTheme.typography.Label.copy(
                        color = DtaTheme.colors.inkSecondary,
                        fontWeight = FontWeight.Bold
                    )
                )
                DtaStatusChip(status = sale.status)
            }

            Text(
                text = sale.productName,
                style = DtaTheme.typography.TitleSmall.copy(fontWeight = FontWeight.SemiBold)
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Client: ${sale.customerName} (${sale.customerCity})",
                        style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.inkSecondary)
                    )
                    Text(
                        text = "Qty: ${sale.quantity} • Total: ${sale.formattedTotalBill}",
                        style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.ink)
                    )
                }

                // Profit Earned Badge
                Box(
                    modifier = Modifier
                        .clip(DtaTheme.shapes.Chip)
                        .background(DtaTheme.colors.primaryContainer)
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = "+${sale.formattedTotalProfit}",
                        style = DtaTheme.typography.Label.copy(
                            color = DtaTheme.colors.primary,
                            fontWeight = FontWeight.Bold
                        )
                    )
                }
            }
        }
    }
}

@Composable
private fun SectionHeader(
    title: String,
    subtitle: String,
    actionText: String? = null,
    onActionClick: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column {
            Text(
                text = title,
                style = DtaTheme.typography.TitleLarge.copy(fontWeight = FontWeight.Bold)
            )
            Text(
                text = subtitle,
                style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.inkSecondary)
            )
        }
        if (actionText != null && onActionClick != null) {
            TextButton(onClick = onActionClick) {
                Text(
                    text = actionText,
                    style = DtaTheme.typography.Label.copy(
                        color = DtaTheme.colors.primary,
                        fontWeight = FontWeight.Bold
                    )
                )
            }
        }
    }
}
