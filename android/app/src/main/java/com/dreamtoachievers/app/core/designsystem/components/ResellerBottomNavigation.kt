package com.dreamtoachievers.app.core.designsystem.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme
import com.dreamtoachievers.app.core.navigation.DtaDestinations

enum class ResellerNavDestination(
    val route: String,
    val title: String,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector
) {
    HOME(DtaDestinations.RESELLER_DASHBOARD, "Home", Icons.Filled.Home, Icons.Outlined.Home),
    MARKET(DtaDestinations.PARTNER_CATALOG, "Market", Icons.Filled.Storefront, Icons.Outlined.Storefront),
    ORDERS(DtaDestinations.RESELLER_ORDERS, "Orders", Icons.Filled.ReceiptLong, Icons.Outlined.ReceiptLong),
    GROWTH(DtaDestinations.RESELLER_GROWTH, "Growth", Icons.Filled.TrendingUp, Icons.Outlined.TrendingUp),
    ACCOUNT(DtaDestinations.RESELLER_ACCOUNT, "Account", Icons.Filled.Person, Icons.Outlined.Person)
}

@Composable
fun ResellerBottomNavigation(
    currentRoute: String,
    onNavigate: (ResellerNavDestination) -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        color = DtaTheme.colors.surface,
        modifier = modifier
            .fillMaxWidth()
            .navigationBarsPadding()
            .border(
                width = 1.dp,
                color = DtaTheme.colors.line
            )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(64.dp)
                .padding(horizontal = 8.dp),
            horizontalArrangement = Arrangement.SpaceAround,
            verticalAlignment = Alignment.CenterVertically
        ) {
            ResellerNavDestination.entries.forEach { destination ->
                val isSelected = currentRoute.startsWith(destination.route.substringBefore("?"))
                val isRecordSale = false

                val animatedIconColor by animateColorAsState(
                    targetValue = if (isSelected) DtaTheme.colors.primary else DtaTheme.colors.inkSecondary,
                    label = "ResellerNavIconColor"
                )

                val interactionSource = remember { MutableInteractionSource() }

                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center,
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxHeight()
                        .clip(DtaTheme.shapes.Chip)
                        .clickable(
                            interactionSource = interactionSource,
                            indication = null,
                            onClick = { onNavigate(destination) }
                        )
                        .padding(vertical = 4.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .height(30.dp)
                            .width(54.dp)
                            .clip(DtaTheme.shapes.Full)
                            .background(
                                when {
                                    isSelected -> DtaTheme.colors.primaryContainer
                                    isRecordSale -> DtaTheme.colors.accentSoft.copy(alpha = 0.4f)
                                    else -> androidx.compose.ui.graphics.Color.Transparent
                                }
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = if (isSelected) destination.selectedIcon else destination.unselectedIcon,
                            contentDescription = destination.title,
                            tint = if (isRecordSale && !isSelected) DtaTheme.colors.accent else animatedIconColor,
                            modifier = Modifier.size(20.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(2.dp))

                    Text(
                        text = destination.title,
                        style = DtaTheme.typography.Label.copy(
                            color = animatedIconColor,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                            fontSize = 11.sp
                        )
                    )
                }
            }
        }
    }
}
