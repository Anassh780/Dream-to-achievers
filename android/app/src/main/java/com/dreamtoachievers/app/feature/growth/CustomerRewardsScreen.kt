package com.dreamtoachievers.app.feature.growth

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dreamtoachievers.app.core.designsystem.components.DtaPrimaryButton
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme

@Composable
fun CustomerRewardsScreen(
    viewModel: CustomerRewardsViewModel,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current

    val shareUrl = "https://dreamtoachievers.com/?ref=${uiState.referralCode}"

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
                    text = "Rewards & Growth",
                    style = DtaTheme.typography.ScreenHeading.copy(
                        color = DtaTheme.colors.primary,
                        fontWeight = FontWeight.Bold,
                        fontSize = 26.sp
                    )
                )
                Text(
                    text = "Invite friends & earn shopping credits across Pakistan",
                    style = DtaTheme.typography.Metadata.copy(color = DtaTheme.colors.inkSecondary)
                )
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
                top = 8.dp,
                bottom = 28.dp
            ),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // 1. Reward Balance Hero Card
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(DtaTheme.shapes.HeroCard)
                        .background(
                            Brush.linearGradient(
                                colors = listOf(
                                    DtaTheme.colors.primaryDark,
                                    DtaTheme.colors.primary,
                                    Color(0xFF235544)
                                )
                            )
                        )
                        .padding(20.dp)
                ) {
                    Column {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Shopping Reward Credit",
                                style = DtaTheme.typography.Label.copy(
                                    color = Color.White.copy(alpha = 0.8f),
                                    fontSize = 12.sp
                                )
                            )

                            Box(
                                modifier = Modifier
                                    .clip(DtaTheme.shapes.Full)
                                    .background(DtaTheme.colors.accentGold)
                                    .padding(horizontal = 8.dp, vertical = 3.dp)
                            ) {
                                Text(
                                    text = "${uiState.rewardPoints} Points",
                                    style = DtaTheme.typography.Label.copy(
                                        color = Color.White,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 11.sp
                                    )
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Text(
                            text = "PKR ${uiState.totalCreditsPKR.toInt().toString().reversed().chunked(3).joinToString(",").reversed()}",
                            style = DtaTheme.typography.LargeMetric.copy(
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 32.sp
                            )
                        )

                        Spacer(modifier = Modifier.height(6.dp))

                        Text(
                            text = "Usable towards any executive purchase or checkout discount",
                            style = DtaTheme.typography.Metadata.copy(
                                color = Color.White.copy(alpha = 0.85f),
                                fontSize = 12.sp
                            )
                        )
                    }
                }
            }

            // 2. Referral Invite Box
            item {
                Card(
                    shape = DtaTheme.shapes.Card,
                    colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, DtaTheme.colors.line, DtaTheme.shapes.Card)
                ) {
                    Column(
                        modifier = Modifier.padding(18.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Outlined.CardGiftcard,
                                contentDescription = null,
                                tint = DtaTheme.colors.primary,
                                modifier = Modifier.size(22.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Invite Friends & Earn",
                                style = DtaTheme.typography.SectionHeading.copy(
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            )
                        }

                        Text(
                            text = "Share your unique referral link. When friends register and place their first order, you both receive PKR 500 in shopping rewards!",
                            style = DtaTheme.typography.Body.copy(
                                color = DtaTheme.colors.inkSecondary,
                                fontSize = 13.sp,
                                lineHeight = 19.sp
                            )
                        )

                        // Referral Code Row
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(DtaTheme.shapes.Button)
                                .background(DtaTheme.colors.surfaceAlt)
                                .border(1.dp, DtaTheme.colors.line, DtaTheme.shapes.Button)
                                .padding(horizontal = 14.dp, vertical = 10.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text(
                                    text = "YOUR INVITATION CODE",
                                    style = DtaTheme.typography.Label.copy(
                                        color = DtaTheme.colors.inkMuted,
                                        fontSize = 10.sp
                                    )
                                )
                                Text(
                                    text = uiState.referralCode,
                                    style = DtaTheme.typography.CardTitle.copy(
                                        color = DtaTheme.colors.primary,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 16.sp
                                    )
                                )
                            }

                            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                IconButton(
                                    onClick = {
                                        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                        clipboard.setPrimaryClip(ClipData.newPlainText("Referral", uiState.referralCode))
                                        Toast.makeText(context, "Referral code copied!", Toast.LENGTH_SHORT).show()
                                    },
                                    modifier = Modifier
                                        .size(36.dp)
                                        .background(DtaTheme.colors.surface, CircleShape)
                                ) {
                                    Icon(
                                        imageVector = Icons.Outlined.ContentCopy,
                                        contentDescription = "Copy code",
                                        tint = DtaTheme.colors.primary,
                                        modifier = Modifier.size(18.dp)
                                    )
                                }

                                IconButton(
                                    onClick = {
                                        val sendIntent = Intent().apply {
                                            action = Intent.ACTION_SEND
                                            putExtra(Intent.EXTRA_TEXT, "Join Dream to Achievers with my invitation code ${uiState.referralCode}: $shareUrl")
                                            type = "text/plain"
                                        }
                                        context.startActivity(Intent.createChooser(sendIntent, "Share Referral Link"))
                                    },
                                    modifier = Modifier
                                        .size(36.dp)
                                        .background(DtaTheme.colors.surface, CircleShape)
                                ) {
                                    Icon(
                                        imageVector = Icons.Outlined.Share,
                                        contentDescription = "Share link",
                                        tint = DtaTheme.colors.primary,
                                        modifier = Modifier.size(18.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }

            // 3. Customer Achievements Section
            item {
                Card(
                    shape = DtaTheme.shapes.Card,
                    colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, DtaTheme.colors.line, DtaTheme.shapes.Card)
                ) {
                    Column(
                        modifier = Modifier.padding(18.dp),
                        verticalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        Text(
                            text = "Shopping Achievements",
                            style = DtaTheme.typography.SectionHeading.copy(
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold
                            )
                        )

                        AchievementRow(
                            title = "Welcome Bonus",
                            description = "Registered account on Dream to Achievers",
                            reward = "+100 Pts",
                            isUnlocked = true
                        )

                        AchievementRow(
                            title = "Community Builder",
                            description = "Invited first friend to the platform",
                            reward = "+500 PKR",
                            isUnlocked = uiState.invitedCount > 0
                        )

                        AchievementRow(
                            title = "VIP Shopper",
                            description = "Place 3 successful product deliveries",
                            reward = "+1000 PKR",
                            isUnlocked = false
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun AchievementRow(
    title: String,
    description: String,
    reward: String,
    isUnlocked: Boolean
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(40.dp)
                .clip(CircleShape)
                .background(
                    if (isUnlocked) DtaTheme.colors.primaryContainer else DtaTheme.colors.surfaceAlt
                ),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = if (isUnlocked) Icons.Default.CheckCircle else Icons.Outlined.Lock,
                contentDescription = null,
                tint = if (isUnlocked) DtaTheme.colors.primary else DtaTheme.colors.inkMuted,
                modifier = Modifier.size(20.dp)
            )
        }

        Spacer(modifier = Modifier.width(12.dp))

        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = title,
                style = DtaTheme.typography.CardTitle.copy(
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold
                )
            )
            Text(
                text = description,
                style = DtaTheme.typography.Metadata.copy(color = DtaTheme.colors.inkSecondary)
            )
        }

        Box(
            modifier = Modifier
                .clip(DtaTheme.shapes.Small)
                .background(
                    if (isUnlocked) DtaTheme.colors.accentGoldSoft else DtaTheme.colors.surfaceAlt
                )
                .padding(horizontal = 8.dp, vertical = 4.dp)
        ) {
            Text(
                text = reward,
                style = DtaTheme.typography.Label.copy(
                    color = if (isUnlocked) DtaTheme.colors.accentGold else DtaTheme.colors.inkMuted,
                    fontWeight = FontWeight.Bold,
                    fontSize = 11.sp
                )
            )
        }
    }
}
