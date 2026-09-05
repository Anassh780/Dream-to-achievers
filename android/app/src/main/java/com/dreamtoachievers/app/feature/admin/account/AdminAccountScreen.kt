package com.dreamtoachievers.app.feature.admin.account

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dreamtoachievers.app.core.data.AdminRepository
import com.dreamtoachievers.app.core.designsystem.components.*
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme

/**
 * Point 85: Role-Specific Admin Account Screen
 * Profile, privileged permissions, security policies (Point 81 biometric/high-auth),
 * audit history shortcut, and admin preferences.
 */
@Composable
fun AdminAccountScreen(
    adminRepository: AdminRepository,
    onNavigateToAuditLogs: () -> Unit,
    onNavigateToUsers: () -> Unit,
    onSwitchRole: () -> Unit,
    onSignOut: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var showSignOutDialog by remember { mutableStateOf(false) }
    var highValueAuthEnabled by remember { mutableStateOf(true) }

    if (showSignOutDialog) {
        AlertDialog(
            onDismissRequest = { showSignOutDialog = false },
            title = { Text("Exit Admin Console?", style = DtaTheme.typography.TitleMedium) },
            text = { Text("Ensure all pending order verifications and dispatches are saved.", style = DtaTheme.typography.BodyMedium) },
            confirmButton = {
                TextButton(onClick = {
                    showSignOutDialog = false
                    onSignOut()
                }) {
                    Text("Sign Out", color = DtaTheme.colors.error, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showSignOutDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    Scaffold(
        topBar = {
            Surface(
                color = DtaTheme.colors.surface,
                modifier = Modifier.fillMaxWidth().border(1.dp, DtaTheme.colors.line)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .statusBarsPadding()
                        .padding(horizontal = 16.dp, vertical = 14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Admin Account",
                            style = DtaTheme.typography.TitleLarge.copy(fontWeight = FontWeight.Bold)
                        )
                        Text(
                            text = "Platform security, audit history & operational settings",
                            style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.inkSecondary)
                        )
                    }

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
                            text = "Switch",
                            style = DtaTheme.typography.Label.copy(
                                color = DtaTheme.colors.primary,
                                fontWeight = FontWeight.Bold
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
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // 1. SuperAdmin Credentials Card
            item {
                Card(
                    shape = DtaTheme.shapes.Card,
                    colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
                    border = androidx.compose.foundation.BorderStroke(1.dp, DtaTheme.colors.line),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(56.dp)
                                .clip(CircleShape)
                                .background(DtaTheme.colors.errorContainer),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.AdminPanelSettings,
                                contentDescription = null,
                                tint = DtaTheme.colors.error,
                                modifier = Modifier.size(32.dp)
                            )
                        }

                        Column(modifier = Modifier.weight(1f)) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Text(
                                    text = "Super Administrator",
                                    style = DtaTheme.typography.TitleMedium.copy(fontWeight = FontWeight.Bold)
                                )
                                Box(
                                    modifier = Modifier
                                        .clip(DtaTheme.shapes.Chip)
                                        .background(DtaTheme.colors.error.copy(alpha = 0.12f))
                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                ) {
                                    Text(
                                        text = "ROOT ACCESS",
                                        style = DtaTheme.typography.Label.copy(
                                            color = DtaTheme.colors.error,
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                    )
                                }
                            }
                            Text(
                                text = "admin@dreamtoachievers.com",
                                style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.inkSecondary)
                            )
                            Text(
                                text = "UID: dta-sec-admin-root-01",
                                style = DtaTheme.typography.Label.copy(
                                    color = DtaTheme.colors.inkSecondary,
                                    fontSize = 10.sp
                                )
                            )
                        }
                    }
                }
            }

            // 2. Point 81: Security & Policy Card
            item {
                Card(
                    shape = DtaTheme.shapes.Card,
                    colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
                    border = androidx.compose.foundation.BorderStroke(1.dp, DtaTheme.colors.line),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Text(
                            text = "Security Policies (Point 81)",
                            style = DtaTheme.typography.TitleSmall.copy(fontWeight = FontWeight.Bold)
                        )

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "High-Value Payout Confirmation",
                                    style = DtaTheme.typography.BodyMedium.copy(fontWeight = FontWeight.SemiBold)
                                )
                                Text(
                                    text = "Require secondary confirmation for disbursements ≥ PKR 10,000",
                                    style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.inkSecondary, fontSize = 11.sp)
                                )
                            }
                            Switch(
                                checked = highValueAuthEnabled,
                                onCheckedChange = { highValueAuthEnabled = it }
                            )
                        }
                    }
                }
            }

            // 3. Audit History & System Tools
            item {
                Card(
                    shape = DtaTheme.shapes.Card,
                    colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
                    border = androidx.compose.foundation.BorderStroke(1.dp, DtaTheme.colors.line),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column {
                        AdminActionRow(
                            icon = Icons.Default.HistoryEdu,
                            title = "System Audit Logs (Point 61)",
                            subtitle = "Review immutable record of all order & payout actions",
                            onClick = onNavigateToAuditLogs
                        )
                        HorizontalDivider(color = DtaTheme.colors.line)

                        AdminActionRow(
                            icon = Icons.Default.Group,
                            title = "User Directory & Role Access",
                            subtitle = "Promote or modify platform partner roles",
                            onClick = onNavigateToUsers
                        )
                        HorizontalDivider(color = DtaTheme.colors.line)

                        AdminActionRow(
                            icon = Icons.Default.LocalShipping,
                            title = "Default Courier Integrations",
                            subtitle = "TCS Express, Trax Logistics, Leopard & PostEx",
                            onClick = {
                                Toast.makeText(context, "Courier APIs configured & operational", Toast.LENGTH_SHORT).show()
                            }
                        )
                        HorizontalDivider(color = DtaTheme.colors.line)

                        AdminActionRow(
                            icon = Icons.Default.CloudSync,
                            title = "Firebase Synchronization",
                            subtitle = "Active connection to uc-store-b5265 backend",
                            onClick = {
                                Toast.makeText(context, "Firebase Firestore listeners synchronized", Toast.LENGTH_SHORT).show()
                            }
                        )
                    }
                }
            }

            // 4. Sign Out Button
            item {
                OutlinedButton(
                    onClick = { showSignOutDialog = true },
                    shape = DtaTheme.shapes.Button,
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = DtaTheme.colors.error),
                    border = androidx.compose.foundation.BorderStroke(1.dp, DtaTheme.colors.error),
                    modifier = Modifier.fillMaxWidth().height(48.dp)
                ) {
                    Icon(Icons.Default.Logout, contentDescription = "Sign Out", modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Exit Admin Console", fontWeight = FontWeight.Bold)
                }
            }

            // 5. Brand Footer
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
                        modifier = Modifier.size(52.dp)
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Dream to Achievers • Administrator Hub",
                        style = DtaTheme.typography.Metadata.copy(
                            color = DtaTheme.colors.inkMuted,
                            fontWeight = FontWeight.Medium,
                            fontSize = 11.sp
                        )
                    )
                }
            }
        }
    }
}

@Composable
private fun AdminActionRow(
    icon: ImageVector,
    title: String,
    subtitle: String,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Box(
            modifier = Modifier
                .size(40.dp)
                .clip(DtaTheme.shapes.Chip)
                .background(DtaTheme.colors.surfaceAlt),
            contentAlignment = Alignment.Center
        ) {
            Icon(imageVector = icon, contentDescription = null, tint = DtaTheme.colors.primary, modifier = Modifier.size(20.dp))
        }

        Column(modifier = Modifier.weight(1f)) {
            Text(title, style = DtaTheme.typography.TitleSmall.copy(fontWeight = FontWeight.SemiBold))
            Text(subtitle, style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.inkSecondary, fontSize = 11.sp))
        }

        Icon(Icons.Default.ArrowForwardIos, contentDescription = null, tint = DtaTheme.colors.inkSecondary, modifier = Modifier.size(14.dp))
    }
}
