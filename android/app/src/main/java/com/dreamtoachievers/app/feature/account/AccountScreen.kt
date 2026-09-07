package com.dreamtoachievers.app.feature.account

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.automirrored.outlined.Logout
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage

/**
 * Dream To Achievers - Account Screen.
 * Exactly matches reference design (media_1788613173850.png).
 *
 * Information Architecture:
 * 1. Brand Header (DA Crown Logo + Title + Tagline + Notification Bell & Settings)
 * 2. Profile Card (Avatar with AK initials, camera icon, Alex Khan, email, Gold Partner badge, Edit Profile >)
 * 3. 4 Quick Actions (My Orders, My Wishlist, Addresses, Payments) in a single horizontal row.
 * 4. Account Menu (Deduplicated: Rank Journey, Notifications, Help & Support, Terms & Policies, About).
 * 5. Log Out Card (Soft red container, red logout icon, bold red text).
 */
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
    modifier: Modifier = Modifier,
    onNavigateToGrowth: (() -> Unit)? = null,
    onNavigateToSettings: (() -> Unit)? = null,
    onEditProfile: (() -> Unit)? = null,
    onSwitchRole: (() -> Unit)? = null,
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current
    var showLogoutDialog by remember { mutableStateOf(value = false) }
    var showAboutDialog by remember { mutableStateOf(value = false) }

    val primaryEmerald = Color(0xFF009B67)
    val darkEmerald = Color(0xFF006B49)
    val cardMintBg = Color(0xFFF3FBF8)
    val mainText = Color(0xFF0B1324)
    val secondaryText = Color(0xFF667085)
    val borderLight = Color(0xFFE7ECEB)
    val goldRankBg = Color(0xFFFFF5DC)
    val goldRankText = Color(0xFFB45309)
    val goldIcon = Color(0xFFF4B321)
    val dangerRed = Color(0xFFEF4444)
    val dangerSurface = Color(0xFFFFF5F5)

    // User data with sensible defaults matching reference
    val userName = uiState.user?.fullName?.ifEmpty { "Guest" } ?: "Guest"
    val userEmail = uiState.user?.email?.ifEmpty { "Sign in to manage your account" } ?: "Sign in to manage your account"
    val userInitials = if (userName.isNotBlank()) {
        userName.split(" ").asSequence().mapNotNull { it.firstOrNull()?.toString() }.take(2).joinToString("").uppercase()
    } else {
        "AK"
    }

    Scaffold(
        topBar = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White)
                    .statusBarsPadding(),
            ) {
                // Brand Header Row: DA Logo + DREAM TO ACHIEVERS + Bell & Settings
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        // DA Logo with crown
                        Box(modifier = Modifier.size(38.dp), contentAlignment = Alignment.Center) {
                            AsyncImage(
                                model = com.dreamtoachievers.app.R.drawable.brand_logo,
                                contentDescription = "Logo",
                                modifier = Modifier.size(36.dp),
                            )
                        }

                        Column {
                            Text(
                                text = "DREAM TO ACHIEVERS",
                                color = Color.Black,
                                fontWeight = FontWeight.Black,
                                fontSize = 13.sp,
                                letterSpacing = 0.5.sp,
                            )
                            Text(
                                text = "TOGETHER FOR A BIGGER TOMORROW",
                                color = primaryEmerald,
                                fontWeight = FontWeight.Bold,
                                fontSize = 7.5.sp,
                                letterSpacing = 0.8.sp
                            )
                        }
                    }

                    // Top-right action icons: Bell with red dot + Settings gear
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        // Notification Bell with red indicator
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clickable { onNavigateToNotifications() },
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Outlined.Notifications,
                                contentDescription = "Notifications",
                                tint = mainText,
                                modifier = Modifier.size(24.dp)
                            )
                            Box(
                                modifier = Modifier
                                    .align(Alignment.TopEnd)
                                    .offset(x = (-2).dp, y = 2.dp)
                                    .size(7.dp)
                                    .clip(CircleShape)
                                    .background(dangerRed)
                            )
                        }

                        // Settings Gear
                        IconButton(
                            onClick = {
                                onNavigateToSettings?.invoke() ?: onSwitchRole?.invoke()
                            },
                            modifier = Modifier.size(36.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Outlined.Settings,
                                contentDescription = "Switch experience",
                                tint = mainText,
                                modifier = Modifier.size(23.dp)
                            )
                        }
                    }
                }
            }
        },
        containerColor = Color.White,
        modifier = modifier.fillMaxSize()
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentPadding = PaddingValues(
                start = 20.dp,
                end = 20.dp,
                top = 8.dp,
                bottom = 32.dp
            ),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Card(
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = cardMintBg),
                    modifier = Modifier.fillMaxWidth(),
                    border = androidx.compose.foundation.BorderStroke(1.dp, borderLight)
                ) {
                    Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                            Box(Modifier.size(56.dp).clip(CircleShape).background(Color(0xFFD1FAE5)), contentAlignment = Alignment.Center) {
                                Text(userInitials, color = darkEmerald, fontWeight = FontWeight.Bold, fontSize = 22.sp)
                            }
                            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                Text(userName, color = mainText, fontSize = 22.sp, fontWeight = FontWeight.Bold)
                                Text(userEmail, color = secondaryText, fontSize = 14.sp)
                            }
                        }
                        OutlinedButton(
                            onClick = { if (uiState.user == null) onNavigateToLogin() else onEditProfile?.invoke() },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(if (uiState.user == null) "Sign In" else "Edit Profile", color = darkEmerald)
                        }
                    }
                }
            }
            item {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        AccountQuickActionCard("My Orders", "Track your orders", Icons.Outlined.ShoppingBag,
                            onNavigateToOrders, Modifier.weight(1f))
                        AccountQuickActionCard("My Wishlist", "Saved products", Icons.Outlined.FavoriteBorder,
                            onNavigateToWishlist, Modifier.weight(1f))
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        AccountQuickActionCard("Addresses", "Delivery locations", Icons.Outlined.LocationOn,
                            onNavigateToAddresses, Modifier.weight(1f))
                        AccountQuickActionCard("Payments", "Payment information", Icons.Outlined.CreditCard,
                            onNavigateToPaymentMethods, Modifier.weight(1f))
                    }
                }
            }
            // 3. Main Account Menu Container (Deduplicated - begins cleanly with Rank Journey)
            item {
                Card(
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, borderLight, RoundedCornerShape(18.dp))
                ) {
                    Column(modifier = Modifier.fillMaxWidth()) {
                        // 1. Rank Journey
                        AccountMenuItem(
                            title = "Rank Journey",
                            subtitle = "Check your progress and benefits",
                            icon = Icons.Outlined.EmojiEvents,
                            onClick = {
                                if (onNavigateToGrowth != null) onNavigateToGrowth()
                                else Toast.makeText(context, "Rank Journey", Toast.LENGTH_SHORT).show()
                            }
                        )

                        HorizontalDivider(color = Color(0xFFE8ECEF), thickness = 0.8.dp)

                        // 2. Notifications
                        AccountMenuItem(
                            title = "Notifications",
                            subtitle = "Manage your notifications",
                            icon = Icons.Outlined.Notifications,
                            onClick = onNavigateToNotifications
                        )

                        HorizontalDivider(color = Color(0xFFE8ECEF), thickness = 0.8.dp)

                        // 3. Help & Support
                        AccountMenuItem(
                            title = "Help & Support",
                            subtitle = "Get assistance anytime",
                            icon = Icons.Outlined.HeadsetMic,
                            onClick = onNavigateToHelp
                        )

                        HorizontalDivider(color = Color(0xFFE8ECEF), thickness = 0.8.dp)

                        // 4. Terms & Policies
                        AccountMenuItem(
                            title = "Terms & Policies",
                            subtitle = "Privacy, terms and other policies",
                            icon = Icons.Outlined.Description,
                            onClick = { onNavigateToLegal("terms") }
                        )

                        HorizontalDivider(color = Color(0xFFE8ECEF), thickness = 0.8.dp)

                        // 5. About Dream To Achievers
                        AccountMenuItem(
                            title = "About Dream To Achievers",
                            subtitle = "App version 1.0.0",
                            icon = Icons.Outlined.Info,
                            onClick = { showAboutDialog = true }
                        )
                    }
                }
            }

            // 4. Log Out Card (Destructive action card in very pale red/pink)
            item {
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = dangerSurface),
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, Color(0xFFFEE2E2), RoundedCornerShape(16.dp))
                        .clickable { if (uiState.user == null) onNavigateToLogin() else showLogoutDialog = true }
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(14.dp)
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Outlined.Logout,
                                contentDescription = "Log Out",
                                tint = dangerRed,
                                modifier = Modifier.size(24.dp)
                            )

                            Column {
                                Text(
                                    text = if (uiState.user == null) "Sign In" else "Log Out",
                                    color = dangerRed,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 15.sp
                                )
                                Text(
                                    text = if (uiState.user == null) "Access your orders and account" else "Sign out from your account",
                                    color = secondaryText,
                                    fontSize = 12.sp
                                )
                            }
                        }

                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
                            contentDescription = null,
                            tint = Color(0xFF9CA3AF),
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            }
        }
    }

    // Confirmation Logout Dialog
    if (showLogoutDialog) {
        AlertDialog(
            onDismissRequest = { showLogoutDialog = false },
            title = { Text(text = if (uiState.user == null) "Sign In" else "Log Out", fontWeight = FontWeight.Bold, color = mainText) },
            text = { Text("Are you sure you want to log out from Dream To Achievers?", color = secondaryText) },
            confirmButton = {
                TextButton(
                    onClick = {
                        showLogoutDialog = false
                        viewModel.logout()
                        onNavigateToLogin()
                    }
                ) {
                    Text("Log Out", color = dangerRed, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showLogoutDialog = false }) {
                    Text("Cancel", color = secondaryText)
                }
            },
            containerColor = Color.White,
            shape = RoundedCornerShape(16.dp)
        )
    }

    // About App Dialog
    if (showAboutDialog) {
        AlertDialog(
            onDismissRequest = { showAboutDialog = false },
            title = { Text(text = "About Dream To Achievers", fontWeight = FontWeight.Bold, color = mainText) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text("Dream To Achievers B2B Marketplace", fontWeight = FontWeight.Bold, color = primaryEmerald)
                    Text("App Version 1.0.0 (Production Release)", color = mainText, fontSize = 13.sp)
                    Text("Together for a Bigger Tomorrow. Delivering premier wholesale and consumer products across Pakistan.", color = secondaryText, fontSize = 12.5.sp)
                }
            },
            confirmButton = {
                TextButton(onClick = { showAboutDialog = false }) {
                    Text("Close", color = primaryEmerald, fontWeight = FontWeight.Bold)
                }
            },
            containerColor = Color.White,
            shape = RoundedCornerShape(16.dp)
        )
    }
}

/**
 * Reusable Quick Action Shortcut Card (1 of 4 in the top row)
 */
@Composable
fun AccountQuickActionCard(
    title: String,
    subtitle: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        modifier = modifier
            .border(1.dp, Color(0xFFE7ECEB), RoundedCornerShape(14.dp))
            .clickable(onClick = onClick)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 8.dp, vertical = 12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                // Mint rounded-square icon container
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(Color(0xFFE8F8F2)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = icon,
                        contentDescription = title,
                        tint = Color(0xFF009B67),
                        modifier = Modifier.size(19.dp)
                    )
                }

                Icon(
                    imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
                    contentDescription = null,
                    tint = Color(0xFF9CA3AF),
                    modifier = Modifier.size(15.dp)
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = title,
                color = Color(0xFF0B1324),
                fontWeight = FontWeight.Bold,
                fontSize = 12.sp,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )

            Text(
                text = subtitle,
                color = Color(0xFF667085),
                fontSize = 9.5.sp,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}

/**
 * Reusable Account Settings Menu Item Row
 */
@Composable
fun AccountMenuItem(
    title: String,
    subtitle: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(14.dp),
            modifier = Modifier.weight(1f)
        ) {
            // Pale-mint rounded-square icon container
            Box(
                modifier = Modifier
                    .size(46.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color(0xFFE8F8F2)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = title,
                    tint = Color(0xFF009B67),
                    modifier = Modifier.size(24.dp)
                )
            }

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    color = Color(0xFF0B1324),
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    text = subtitle,
                    color = Color(0xFF667085),
                    fontSize = 12.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }
        }

        Icon(
            imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
            contentDescription = null,
            tint = Color(0xFF9CA3AF),
            modifier = Modifier.size(20.dp)
        )
    }
}
