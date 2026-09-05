package com.dreamtoachievers.app.feature.account

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.dreamtoachievers.app.core.designsystem.components.DtaProfileRow
import com.dreamtoachievers.app.core.designsystem.components.DtaVerifiedBadge
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme

@Composable
fun AccountScreen(
    viewModel: AccountViewModel,
    onNavigateToOrders: () -> Unit,
    onNavigateToWishlist: () -> Unit,
    onNavigateToNotifications: () -> Unit,
    onNavigateToAddresses: () -> Unit,
    onNavigateToPaymentMethods: () -> Unit,
    onNavigateToHelp: () -> Unit,
    onNavigateToLegal: (String) -> Unit,
    onNavigateToLogin: () -> Unit,
    onSwitchRole: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()
    var showLogoutDialog by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(DtaTheme.colors.surface)
                    .statusBarsPadding()
                    .padding(horizontal = DtaTheme.spacing.ScreenHorizontal, vertical = 14.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "Account",
                    style = DtaTheme.typography.ScreenHeading.copy(
                        color = DtaTheme.colors.inkPrimary,
                        fontWeight = FontWeight.Bold,
                        fontSize = 22.sp
                    )
                )

                IconButton(
                    onClick = { /* Settings / Configuration */ },
                    modifier = Modifier.size(36.dp)
                ) {
                    Icon(
                        imageVector = Icons.Outlined.Settings,
                        contentDescription = "Settings",
                        tint = DtaTheme.colors.inkPrimary,
                        modifier = Modifier.size(22.dp)
                    )
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
            contentPadding = PaddingValues(
                start = DtaTheme.spacing.ScreenHorizontal,
                end = DtaTheme.spacing.ScreenHorizontal,
                top = 12.dp,
                bottom = 36.dp
            ),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // 1. Profile Header Card (Reference 1 Screen 6)
            item {
                Card(
                    shape = DtaTheme.shapes.Card,
                    colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, DtaTheme.colors.line, DtaTheme.shapes.Card)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(64.dp)
                                .clip(CircleShape)
                                .background(DtaTheme.colors.surfaceAlt)
                                .border(1.5.dp, DtaTheme.colors.primary.copy(alpha = 0.3f), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            val avatarUrl = uiState.user?.avatarUrl
                            if (!avatarUrl.isNullOrBlank()) {
                                AsyncImage(
                                    model = avatarUrl,
                                    contentDescription = "Avatar",
                                    modifier = Modifier.fillMaxSize(),
                                    contentScale = ContentScale.Crop
                                )
                            } else {
                                Text(
                                    text = (uiState.user?.fullName ?: "Alex Morgan").take(2).uppercase(),
                                    style = DtaTheme.typography.SectionHeading.copy(
                                        color = DtaTheme.colors.primary,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 22.sp
                                    )
                                )
                            }
                        }

                        Spacer(modifier = Modifier.width(14.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Text(
                                    text = uiState.user?.fullName ?: "Alex Morgan",
                                    style = DtaTheme.typography.SectionHeading.copy(
                                        color = DtaTheme.colors.inkPrimary,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 17.sp
                                    )
                                )

                                // Gold Partner Crown Badge (Reference 1 Screen 6)
                                Box(
                                    modifier = Modifier
                                        .clip(DtaTheme.shapes.Chip)
                                        .background(DtaTheme.colors.accentGold.copy(alpha = 0.15f))
                                        .border(0.5.dp, DtaTheme.colors.accentGold, DtaTheme.shapes.Chip)
                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(
                                            imageVector = Icons.Default.Star,
                                            contentDescription = null,
                                            tint = DtaTheme.colors.accentGold,
                                            modifier = Modifier.size(10.dp)
                                        )
                                        Spacer(modifier = Modifier.width(2.dp))
                                        Text(
                                            text = "Gold Partner",
                                            style = DtaTheme.typography.Label.copy(
                                                color = DtaTheme.colors.accentGold,
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 9.sp
                                            )
                                        )
                                    }
                                }
                            }

                            Spacer(modifier = Modifier.height(2.dp))

                            Text(
                                text = "ID: DTA782945 • ${uiState.user?.email ?: "alex.morgan@dreamtoachievers.com"}",
                                style = DtaTheme.typography.Metadata.copy(
                                    color = DtaTheme.colors.inkSecondary,
                                    fontSize = 11.sp
                                ),
                                maxLines = 1
                            )

                            Spacer(modifier = Modifier.height(6.dp))

                            DtaVerifiedBadge(label = "Verified Business Partner")
                        }
                    }
                }
            }

            // 2. Dual Balance Metric Cards (Reference 1 Screen 6)
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    // Available Balance Pill Card
                    Card(
                        shape = DtaTheme.shapes.Card,
                        colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
                        modifier = Modifier
                            .weight(1f)
                            .border(1.dp, DtaTheme.colors.line, DtaTheme.shapes.Card)
                            .clickable(onClick = onNavigateToPaymentMethods)
                    ) {
                        Column(
                            modifier = Modifier.padding(14.dp)
                        ) {
                            Text(
                                text = "Available Balance",
                                style = DtaTheme.typography.Label.copy(
                                    color = DtaTheme.colors.inkSecondary,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Medium
                                )
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "Rs 28,450",
                                style = DtaTheme.typography.TitleMedium.copy(
                                    color = DtaTheme.colors.primary,
                                    fontWeight = FontWeight.Black,
                                    fontSize = 18.sp
                                )
                            )
                        }
                    }

                    // Reward Points Pill Card
                    Card(
                        shape = DtaTheme.shapes.Card,
                        colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
                        modifier = Modifier
                            .weight(1f)
                            .border(1.dp, DtaTheme.colors.line, DtaTheme.shapes.Card)
                            .clickable(onClick = onNavigateToOrders)
                    ) {
                        Column(
                            modifier = Modifier.padding(14.dp)
                        ) {
                            Text(
                                text = "Reward Points",
                                style = DtaTheme.typography.Label.copy(
                                    color = DtaTheme.colors.inkSecondary,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Medium
                                )
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "12,480 pts",
                                style = DtaTheme.typography.TitleMedium.copy(
                                    color = DtaTheme.colors.accentGold,
                                    fontWeight = FontWeight.Black,
                                    fontSize = 18.sp
                                )
                            )
                        }
                    }
                }
            }

            // 3. Main Menu Card (11 Reference Menu Rows)
            item {
                Card(
                    shape = DtaTheme.shapes.Card,
                    colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, DtaTheme.colors.line, DtaTheme.shapes.Card)
                ) {
                    Column(modifier = Modifier.padding(vertical = 4.dp)) {
                        DtaProfileRow(
                            title = "My Orders",
                            icon = Icons.Outlined.ReceiptLong,
                            subtitle = "View order tracking & delivery status",
                            onClick = onNavigateToOrders
                        )

                        DtaProfileRow(
                            title = "Wallet & Payouts",
                            icon = Icons.Outlined.AccountBalanceWallet,
                            subtitle = "Rs 28,450 Available • Direct withdrawal",
                            onClick = onNavigateToPaymentMethods
                        )

                        DtaProfileRow(
                            title = "My Team & Network",
                            icon = Icons.Outlined.Groups,
                            subtitle = "126 Active Partners • Direct referrals",
                            onClick = onNavigateToOrders
                        )

                        DtaProfileRow(
                            title = "Rank Journey",
                            icon = Icons.Outlined.EmojiEvents,
                            subtitle = "Gold Partner • 84% to Platinum",
                            onClick = onNavigateToOrders
                        )

                        DtaProfileRow(
                            title = "Saved Addresses",
                            icon = Icons.Outlined.LocationOn,
                            subtitle = "Manage delivery & client destinations",
                            onClick = onNavigateToAddresses
                        )

                        DtaProfileRow(
                            title = "Payment Methods",
                            icon = Icons.Outlined.Payment,
                            subtitle = "Bank accounts, EasyPaisa & JazzCash",
                            onClick = onNavigateToPaymentMethods
                        )

                        DtaProfileRow(
                            title = "Notifications",
                            icon = Icons.Outlined.Notifications,
                            subtitle = "Realtime delivery & payout alerts (2 new)",
                            onClick = onNavigateToNotifications
                        )

                        DtaProfileRow(
                            title = "Wholesale Catalog Access",
                            icon = Icons.Outlined.Storefront,
                            subtitle = "Verified partner wholesale pricing enabled",
                            onClick = onNavigateToOrders
                        )

                        DtaProfileRow(
                            title = "Help & Customer Support",
                            icon = Icons.Outlined.SupportAgent,
                            subtitle = "WhatsApp & official support lines",
                            onClick = onNavigateToHelp
                        )

                        DtaProfileRow(
                            title = "Privacy Policy & Terms",
                            icon = Icons.Outlined.Policy,
                            subtitle = "Terms of service & data privacy",
                            onClick = { onNavigateToLegal("privacy") }
                        )

                        if (onSwitchRole != null) {
                            DtaProfileRow(
                                title = "Switch Experience Mode",
                                icon = Icons.Outlined.SwapHoriz,
                                subtitle = "Customer • Partner Console • Superadmin",
                                onClick = onSwitchRole
                            )
                        }

                        if (uiState.user != null) {
                            DtaProfileRow(
                                title = "Sign Out",
                                icon = Icons.Outlined.ExitToApp,
                                subtitle = "Log out from this device",
                                onClick = { showLogoutDialog = true }
                            )
                        } else {
                            DtaProfileRow(
                                title = "Sign In / Register",
                                icon = Icons.Outlined.Login,
                                subtitle = "Sign in to save orders & points",
                                onClick = onNavigateToLogin
                            )
                        }
                    }
                }
            }

            // 4. Official Brand Footer
            item {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    androidx.compose.foundation.Image(
                        painter = androidx.compose.ui.res.painterResource(id = com.dreamtoachievers.app.R.drawable.brand_logo),
                        contentDescription = "Dream to Achievers Logo",
                        modifier = Modifier.size(56.dp)
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Dream to Achievers v1.0.0",
                        style = DtaTheme.typography.Metadata.copy(
                            color = DtaTheme.colors.inkMuted,
                            fontWeight = FontWeight.Medium,
                            fontSize = 12.sp
                        )
                    )
                }
            }
        }
    }

    if (showLogoutDialog) {
        AlertDialog(
            onDismissRequest = { showLogoutDialog = false },
            title = { Text("Sign Out") },
            text = { Text("Are you sure you want to sign out of Dream to Achievers?") },
            confirmButton = {
                TextButton(
                    onClick = {
                        showLogoutDialog = false
                        viewModel.logout()
                        onNavigateToLogin()
                    }
                ) {
                    Text("Sign Out", color = DtaTheme.colors.error)
                }
            },
            dismissButton = {
                TextButton(onClick = { showLogoutDialog = false }) {
                    Text("Cancel", color = DtaTheme.colors.inkPrimary)
                }
            },
            shape = DtaTheme.shapes.Card,
            containerColor = DtaTheme.colors.surface
        )
    }
}
