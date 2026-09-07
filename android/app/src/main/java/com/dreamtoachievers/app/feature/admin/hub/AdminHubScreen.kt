package com.dreamtoachievers.app.feature.admin.hub

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dreamtoachievers.app.core.designsystem.components.*
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme
import com.dreamtoachievers.app.core.model.User

@Composable
fun AdminHubScreen(
    viewModel: AdminHubViewModel,
    currentUser: User?,
    onNavigateToOrders: () -> Unit,
    onNavigateToWithdrawals: () -> Unit,
    onNavigateToRewards: () -> Unit,
    onNavigateToProducts: () -> Unit,
    onNavigateToCategories: () -> Unit,
    onNavigateToUsers: () -> Unit,
    onSwitchRole: () -> Unit,
    modifier: Modifier = Modifier
) {
    val state by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            Surface(
                color = DtaTheme.colors.primaryDark,
                tonalElevation = 4.dp,
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
                    Column(modifier = Modifier.weight(1f)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Text(
                                text = "Admin Operations Hub",
                                style = DtaTheme.typography.TitleLarge.copy(color = Color.White, fontWeight = FontWeight.Bold)
                            )
                            Box(
                                modifier = Modifier
                                    .clip(DtaTheme.shapes.Chip)
                                    .background(Color.White.copy(alpha = 0.14f))
                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                            ) {
                                Text(
                                    text = if (currentUser?.role?.rawValue == "superadmin") "SUPER ADMIN" else "ADMIN",
                                    style = DtaTheme.typography.Label.copy(
                                        color = Color.White,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 10.sp
                                    )
                                )
                            }
                        }
                        Text(
                            text = "Platform fulfillment, payouts & partner controls",
                            style = DtaTheme.typography.BodySmall.copy(color = Color.White.copy(alpha = 0.72f))
                        )
                    }

                    // Role Switcher
                    OutlinedButton(
                        onClick = onSwitchRole,
                        shape = DtaTheme.shapes.Chip,
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color.White.copy(alpha = 0.5f)),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.White)
                    ) {
                        Icon(
                            imageVector = Icons.Default.SwapHoriz,
                            contentDescription = "Switch Role",
                            tint = Color.White,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "Role",
                            style = DtaTheme.typography.Label.copy(
                                color = Color.White,
                                fontWeight = FontWeight.SemiBold
                            )
                        )
                    }
                }
            }
        },
        containerColor = DtaTheme.colors.background,
        modifier = modifier.fillMaxSize()
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            item {
                AdminCommandHero(
                    revenue = state.totalRevenueFormatted,
                    pendingOrders = state.pendingVerificationsCount,
                    pendingPayouts = state.pendingWithdrawalsCount,
                    onReviewOrders = onNavigateToOrders
                )
            }

            // 6 Mobile Operational Metric Cards (Point 42: Compact cards, no giant desktop graphs)
            item {
                Text(
                    text = "LIVE PLATFORM METRICS",
                    style = DtaTheme.typography.Label.copy(
                        color = DtaTheme.colors.inkSecondary,
                        fontSize = 11.sp,
                        letterSpacing = 1.sp
                    )
                )
            }

            // Row 1: Pending Verification & Processing Orders
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    AdminMetricTile(
                        title = "Pending Verification",
                        value = "${state.pendingVerificationsCount} Orders",
                        icon = Icons.Default.AssignmentLate,
                        badgeColor = if (state.pendingVerificationsCount > 0) DtaTheme.colors.semanticPending else DtaTheme.colors.semanticSuccess,
                        modifier = Modifier.weight(1f).clickable(onClick = onNavigateToOrders)
                    )
                    AdminMetricTile(
                        title = "Processing Orders",
                        value = "${state.processingOrdersCount} Orders",
                        icon = Icons.Default.Inventory,
                        badgeColor = DtaTheme.colors.primary,
                        modifier = Modifier.weight(1f).clickable(onClick = onNavigateToOrders)
                    )
                }
            }

            // Row 2: Pending Withdrawals & Pending Rank Rewards
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    AdminMetricTile(
                        title = "Pending Withdrawals",
                        value = "${state.pendingWithdrawalsCount} Requests",
                        icon = Icons.Default.Payments,
                        badgeColor = if (state.pendingWithdrawalsCount > 0) DtaTheme.colors.accent else DtaTheme.colors.semanticSuccess,
                        modifier = Modifier.weight(1f).clickable(onClick = onNavigateToWithdrawals)
                    )
                    AdminMetricTile(
                        title = "Pending Rank Rewards",
                        value = "${state.pendingRankRewardsCount} Milestones",
                        icon = Icons.Default.EmojiEvents,
                        badgeColor = DtaTheme.colors.accent,
                        modifier = Modifier.weight(1f).clickable(onClick = onNavigateToRewards)
                    )
                }
            }

            // Row 3: Low Stock & Users/Resellers
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    AdminMetricTile(
                        title = "Low Stock Alerts",
                        value = "${state.lowStockCount} Products",
                        icon = Icons.Default.Warning,
                        badgeColor = if (state.lowStockCount > 0) DtaTheme.colors.semanticError else DtaTheme.colors.semanticSuccess,
                        modifier = Modifier.weight(1f).clickable(onClick = onNavigateToProducts)
                    )
                    AdminMetricTile(
                        title = "Users & Resellers",
                        value = "${state.totalUsersCount} Total",
                        icon = Icons.Default.People,
                        badgeColor = DtaTheme.colors.primary,
                        modifier = Modifier.weight(1f).clickable(onClick = onNavigateToUsers)
                    )
                }
            }

            // Operational Action Cards Section
            item {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "OPERATIONAL QUEUES & WORKFLOWS",
                    style = DtaTheme.typography.Label.copy(
                        color = DtaTheme.colors.inkSecondary,
                        fontSize = 11.sp,
                        letterSpacing = 1.sp
                    )
                )
            }

            item {
                WorkflowActionCard(
                    title = "Order Verification Queue",
                    description = "Verify payment slips, review lightbox proofs, dispatch via TCS/Trax/Leopard, and release profit.",
                    badgeText = "${state.pendingVerificationsCount} Review Pending",
                    icon = Icons.Default.FactCheck,
                    onClick = onNavigateToOrders
                )
            }

            item {
                WorkflowActionCard(
                    title = "Withdrawal Requests & Payouts",
                    description = "Process reseller earnings withdrawal requests, input transaction reference IDs, and disburse payouts.",
                    badgeText = "${state.pendingWithdrawalsCount} Payouts Pending",
                    icon = Icons.Default.Payments,
                    onClick = onNavigateToWithdrawals
                )
            }

            item {
                WorkflowActionCard(
                    title = "Milestone Rank Rewards",
                    description = "Review qualifying sales and community criteria to approve and disburse milestone cash bonuses.",
                    badgeText = "${state.pendingRankRewardsCount} Milestones",
                    icon = Icons.Default.EmojiEvents,
                    onClick = onNavigateToRewards
                )
            }

            item {
                WorkflowActionCard(
                    title = "Product Inventory & Margins",
                    description = "Manage products, stock toggles, wholesale pricing, retail price, and guaranteed profit margins.",
                    badgeText = "Catalog Desk",
                    icon = Icons.Default.Storefront,
                    onClick = onNavigateToProducts
                )
            }

            item {
                WorkflowActionCard(
                    title = "Category Hierarchy",
                    description = "Expandable 3-level catalog tree (Root → Sub → Leaf) with node creation controls.",
                    badgeText = "Tree Hierarchy",
                    icon = Icons.Default.AccountTree,
                    onClick = onNavigateToCategories
                )
            }

            item {
                WorkflowActionCard(
                    title = "User Directory & Role Controls",
                    description = "Inspect user directory, switch roles (Customer <-> Reseller <-> Admin), and track account statuses.",
                    badgeText = "${state.activeResellersCount} Active Partners",
                    icon = Icons.Default.ManageAccounts,
                    onClick = onNavigateToUsers
                )
            }
        }
    }
}

@Composable
private fun AdminMetricTile(
    title: String,
    value: String,
    icon: ImageVector,
    badgeColor: Color,
    modifier: Modifier = Modifier
) {
    Card(
        shape = DtaTheme.shapes.Card,
        colors = CardDefaults.cardColors(containerColor = badgeColor.copy(alpha = 0.07f)),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = modifier
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
                    text = title,
                    style = DtaTheme.typography.Label.copy(color = DtaTheme.colors.inkSecondary, fontSize = 11.sp),
                    modifier = Modifier.weight(1f).padding(end = 6.dp),
                    maxLines = 2,
                    overflow = androidx.compose.ui.text.style.TextOverflow.Ellipsis
                )
                Surface(shape = DtaTheme.shapes.Chip, color = badgeColor.copy(alpha = 0.14f)) {
                    Icon(imageVector = icon, contentDescription = null, tint = badgeColor, modifier = Modifier.padding(7.dp).size(18.dp))
                }
            }

            Text(
                text = value,
                style = DtaTheme.typography.TitleMedium.copy(fontWeight = FontWeight.Bold)
            )
        }
    }
}

@Composable
private fun WorkflowActionCard(
    title: String,
    description: String,
    badgeText: String,
    icon: ImageVector,
    onClick: () -> Unit
) {
    Card(
        shape = DtaTheme.shapes.Card,
        colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp, pressedElevation = 6.dp),
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(46.dp)
                    .clip(DtaTheme.shapes.Card)
                    .background(DtaTheme.colors.primaryContainer),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = DtaTheme.colors.primary,
                    modifier = Modifier.size(22.dp)
                )
            }

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    style = DtaTheme.typography.TitleSmall.copy(fontWeight = FontWeight.Bold)
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = description,
                    style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.inkSecondary, fontSize = 11.sp)
                )
                Spacer(modifier = Modifier.height(4.dp))
                Box(
                    modifier = Modifier
                        .clip(DtaTheme.shapes.Chip)
                        .background(DtaTheme.colors.surfaceAlt)
                        .padding(horizontal = 8.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = badgeText,
                        style = DtaTheme.typography.Label.copy(
                            color = DtaTheme.colors.primary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 10.sp
                        )
                    )
                }
            }

            Icon(
                imageVector = Icons.Default.ArrowForwardIos,
                contentDescription = null,
                tint = DtaTheme.colors.inkSecondary,
                modifier = Modifier.size(14.dp)
            )
        }
    }
}

@Composable
private fun AdminCommandHero(
    revenue: String,
    pendingOrders: Int,
    pendingPayouts: Int,
    onReviewOrders: () -> Unit
) {
    Card(shape = RoundedCornerShape(24.dp), modifier = Modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier
                .background(Brush.linearGradient(listOf(DtaTheme.colors.primaryDark, DtaTheme.colors.primary)))
                .padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.Top) {
                Column {
                    Text("PLATFORM REVENUE", color = Color.White.copy(alpha = 0.7f), fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                    Text(revenue, color = Color.White, fontSize = 28.sp, fontWeight = FontWeight.Black)
                }
                Surface(shape = CircleShape, color = Color.White.copy(alpha = 0.14f)) {
                    Icon(Icons.Default.AutoGraph, null, tint = Color.White, modifier = Modifier.padding(12.dp).size(24.dp))
                }
            }
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                AdminHeroStat("$pendingOrders", "Orders to review", Modifier.weight(1f))
                AdminHeroStat("$pendingPayouts", "Payouts waiting", Modifier.weight(1f))
            }
            Button(
                onClick = onReviewOrders,
                colors = ButtonDefaults.buttonColors(containerColor = Color.White, contentColor = DtaTheme.colors.primaryDark),
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier.fillMaxWidth().heightIn(min = 48.dp)
            ) {
                Icon(Icons.Default.FactCheck, null)
                Spacer(Modifier.width(8.dp))
                Text("Open priority order queue", fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
private fun AdminHeroStat(value: String, label: String, modifier: Modifier = Modifier) {
    Surface(modifier = modifier, shape = RoundedCornerShape(14.dp), color = Color.White.copy(alpha = 0.12f)) {
        Column(Modifier.padding(12.dp)) {
            Text(value, color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.ExtraBold)
            Text(label, color = Color.White.copy(alpha = 0.75f), fontSize = 11.sp)
        }
    }
}
