package com.dreamtoachievers.app.feature.reseller.account

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dreamtoachievers.app.core.data.ResellerRepository
import com.dreamtoachievers.app.core.designsystem.components.*
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme

/**
 * Point 85: Role-Specific Reseller Account Screen
 * Personal profile, partner business verification, referral code,
 * payout accounts, rank status, and security settings.
 * Never mixed into customer mode.
 */
@Composable
fun ResellerAccountScreen(
    resellerRepository: ResellerRepository,
    onNavigateToWallet: () -> Unit,
    onNavigateToGrowth: () -> Unit,
    onNavigateToReferrals: () -> Unit,
    onSwitchRole: () -> Unit,
    onSignOut: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var showSignOutDialog by remember { mutableStateOf(false) }

    val referralCode = resellerRepository.currentReferralCode

    if (showSignOutDialog) {
        AlertDialog(
            onDismissRequest = { showSignOutDialog = false },
            title = { Text("Sign Out of Partner Console?", style = DtaTheme.typography.TitleMedium) },
            text = { Text("You will need to sign in again to access wholesale pricing and client orders.", style = DtaTheme.typography.BodyMedium) },
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
                            text = "Partner Account",
                            style = DtaTheme.typography.TitleLarge.copy(fontWeight = FontWeight.Bold)
                        )
                        Text(
                            text = "Merchant profile, verification & payout preferences",
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
            // 1. Partner Profile Card
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
                                .background(DtaTheme.colors.primaryContainer),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "AK",
                                style = DtaTheme.typography.TitleLarge.copy(
                                    color = DtaTheme.colors.primary,
                                    fontWeight = FontWeight.Bold
                                )
                            )
                        }

                        Column(modifier = Modifier.weight(1f)) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Text(
                                    text = "Ali Khan",
                                    style = DtaTheme.typography.TitleMedium.copy(fontWeight = FontWeight.Bold)
                                )
                                Box(
                                    modifier = Modifier
                                        .clip(DtaTheme.shapes.Chip)
                                        .background(DtaTheme.colors.accentSoft.copy(alpha = 0.5f))
                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                ) {
                                    Text(
                                        text = "Silver Rank",
                                        style = DtaTheme.typography.Label.copy(
                                            color = DtaTheme.colors.accent,
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                    )
                                }
                            }
                            Text(
                                text = "+92 300 1234567 • Islamabad",
                                style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.inkSecondary)
                            )
                            Text(
                                text = "Partner Merchant ID: DTA-M9921",
                                style = DtaTheme.typography.Label.copy(
                                    color = DtaTheme.colors.primary,
                                    fontSize = 10.sp
                                )
                            )
                        }
                    }
                }
            }

            // 2. Business Verification Status Card
            item {
                Card(
                    shape = DtaTheme.shapes.Card,
                    colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
                    border = androidx.compose.foundation.BorderStroke(1.dp, DtaTheme.colors.line),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Text(
                            text = "Business Verification",
                            style = DtaTheme.typography.TitleSmall.copy(fontWeight = FontWeight.Bold)
                        )

                        AccountInfoRow(
                            label = "National CNIC",
                            value = "61101-*******-9",
                            badgeText = "Verified",
                            badgeColor = DtaTheme.colors.primary
                        )
                        HorizontalDivider(color = DtaTheme.colors.line)

                        AccountInfoRow(
                            label = "Wholesale Authorization",
                            value = "Tier-1 Partner Contract",
                            badgeText = "Active",
                            badgeColor = DtaTheme.colors.primary
                        )
                    }
                }
            }

            // 3. Referral Code & Share Card
            item {
                Card(
                    shape = DtaTheme.shapes.Card,
                    colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surfaceAlt),
                    border = androidx.compose.foundation.BorderStroke(1.dp, DtaTheme.colors.line),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "Your Referral Code",
                                style = DtaTheme.typography.Label.copy(color = DtaTheme.colors.inkSecondary)
                            )
                            Text(
                                text = referralCode,
                                style = DtaTheme.typography.TitleLarge.copy(
                                    color = DtaTheme.colors.primary,
                                    fontWeight = FontWeight.Black
                                )
                            )
                        }

                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            FilledTonalButton(
                                onClick = {
                                    val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                    clipboard.setPrimaryClip(ClipData.newPlainText("Referral Code", referralCode))
                                    Toast.makeText(context, "Copied code $referralCode", Toast.LENGTH_SHORT).show()
                                },
                                shape = DtaTheme.shapes.Chip
                            ) {
                                Icon(Icons.Default.ContentCopy, contentDescription = "Copy", modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Copy")
                            }

                            Button(
                                onClick = onNavigateToReferrals,
                                shape = DtaTheme.shapes.Chip,
                                colors = ButtonDefaults.buttonColors(containerColor = DtaTheme.colors.primary)
                            ) {
                                Text("QR / Team")
                            }
                        }
                    }
                }
            }

            // 4. Operations & Preferences Menu
            item {
                Card(
                    shape = DtaTheme.shapes.Card,
                    colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
                    border = androidx.compose.foundation.BorderStroke(1.dp, DtaTheme.colors.line),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column {
                        AccountActionRow(
                            icon = Icons.Default.AccountBalanceWallet,
                            title = "Payout Accounts & Ledger",
                            subtitle = "Manage EasyPaisa, JazzCash, and Bank IBAN",
                            onClick = onNavigateToWallet
                        )
                        HorizontalDivider(color = DtaTheme.colors.line)

                        AccountActionRow(
                            icon = Icons.Default.EmojiEvents,
                            title = "Rank Goals & Rewards",
                            subtitle = "Review milestone roadmap and bonus eligibility",
                            onClick = onNavigateToGrowth
                        )
                        HorizontalDivider(color = DtaTheme.colors.line)

                        AccountActionRow(
                            icon = Icons.Default.Security,
                            title = "Security & PIN",
                            subtitle = "Two-factor authentication and withdrawal PIN",
                            onClick = {
                                Toast.makeText(context, "Withdrawal PIN protection enabled", Toast.LENGTH_SHORT).show()
                            }
                        )
                        HorizontalDivider(color = DtaTheme.colors.line)

                        AccountActionRow(
                            icon = Icons.Default.HelpOutline,
                            title = "Partner Support Desk",
                            subtitle = "Wholesale inventory inquiries and logistics assistance",
                            onClick = {
                                Toast.makeText(context, "Connecting to Partner Logistics Support", Toast.LENGTH_SHORT).show()
                            }
                        )
                    }
                }
            }

            // 5. Sign Out Button
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
                    Text("Sign Out", fontWeight = FontWeight.Bold)
                }
            }

            // 6. Brand Footer
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
                        text = "Dream to Achievers • Partner Console",
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
private fun AccountInfoRow(
    label: String,
    value: String,
    badgeText: String,
    badgeColor: Color
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column {
            Text(label, style = DtaTheme.typography.Label.copy(color = DtaTheme.colors.inkSecondary))
            Text(value, style = DtaTheme.typography.BodyMedium.copy(fontWeight = FontWeight.SemiBold))
        }

        Box(
            modifier = Modifier
                .clip(DtaTheme.shapes.Chip)
                .background(badgeColor.copy(alpha = 0.12f))
                .padding(horizontal = 8.dp, vertical = 3.dp)
        ) {
            Text(
                text = badgeText,
                style = DtaTheme.typography.Label.copy(
                    color = badgeColor,
                    fontWeight = FontWeight.Bold,
                    fontSize = 10.sp
                )
            )
        }
    }
}

@Composable
private fun AccountActionRow(
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
