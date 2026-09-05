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
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme
import com.dreamtoachievers.app.core.navigation.DtaDestinations

/**
 * Point 64: Admin 5-Item Navigation Architecture
 * Dashboard, Orders, Finance, Catalog, Account.
 * Secondary screens accessed from dashboard/inner links.
 */
enum class AdminNavDestination(
    val route: String,
    val title: String,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector
) {
    DASHBOARD(DtaDestinations.ADMIN_HUB, "Dashboard", Icons.Filled.Dashboard, Icons.Outlined.Dashboard),
    ORDERS(DtaDestinations.ADMIN_ORDERS, "Orders", Icons.Filled.FactCheck, Icons.Outlined.FactCheck),
    FINANCE(DtaDestinations.ADMIN_WITHDRAWALS, "Finance", Icons.Filled.AccountBalance, Icons.Outlined.AccountBalance),
    CATALOG(DtaDestinations.ADMIN_PRODUCTS, "Catalog", Icons.Filled.Inventory2, Icons.Outlined.Inventory2),
    ACCOUNT(DtaDestinations.ADMIN_ACCOUNT, "Account", Icons.Filled.AdminPanelSettings, Icons.Outlined.AdminPanelSettings)
}

@Composable
fun AdminBottomNavigation(
    currentRoute: String,
    onNavigate: (AdminNavDestination) -> Unit,
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
            AdminNavDestination.entries.forEach { destination ->
                val isSelected = currentRoute.startsWith(destination.route.substringBefore("?"))

                val animatedIconColor by animateColorAsState(
                    targetValue = if (isSelected) DtaTheme.colors.primary else DtaTheme.colors.inkSecondary,
                    label = "AdminNavIconColor"
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
                                if (isSelected) DtaTheme.colors.primaryContainer else Color.Transparent
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = if (isSelected) destination.selectedIcon else destination.unselectedIcon,
                            contentDescription = destination.title,
                            tint = animatedIconColor,
                            modifier = Modifier.size(20.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(2.dp))

                    Text(
                        text = destination.title,
                        style = DtaTheme.typography.NavigationLabel.copy(
                            color = if (isSelected) DtaTheme.colors.primary else DtaTheme.colors.inkSecondary,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                            fontSize = 10.sp
                        )
                    )
                }
            }
        }
    }
}
