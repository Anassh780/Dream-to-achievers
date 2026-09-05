package com.dreamtoachievers.app.feature.reseller.growth

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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
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
import com.dreamtoachievers.app.core.designsystem.components.*
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme
import com.dreamtoachievers.app.core.model.MilestoneReward
import com.dreamtoachievers.app.core.model.RankDefinition
import com.dreamtoachievers.app.core.model.RankProgress

@Composable
fun ResellerGrowthScreen(
    viewModel: ResellerGrowthViewModel,
    modifier: Modifier = Modifier
) {
    val state by viewModel.uiState.collectAsState()
    val context = LocalContext.current

    Scaffold(
        topBar = {
            DtaTopAppBar(
                title = "Rank & Milestone Rewards",
                subtitle = "Scale verified sales & community network to claim cash bonuses"
            )
        },
        containerColor = DtaTheme.colors.background,
        modifier = modifier.fillMaxSize()
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentPadding = PaddingValues(start = 16.dp, end = 16.dp, bottom = 80.dp),
            verticalArrangement = Arrangement.spacedBy(18.dp)
        ) {
            // 1. Current Rank Card
            item {
                CurrentRankHeroCard(progress = state.rankProgress)
            }

            // 2. Dual Concurrent Progress Bars
            item {
                DualRequirementCard(progress = state.rankProgress)
            }

            // 3. Referral Sharing Action Card
            item {
                ReferralInviteCard(
                    code = state.referralCode,
                    link = state.referralLink,
                    onCopy = {
                        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                        clipboard.setPrimaryClip(ClipData.newPlainText("Referral Code", state.referralCode))
                        Toast.makeText(context, "Referral code copied!", Toast.LENGTH_SHORT).show()
                    },
                    onShare = {
                        val sendIntent = Intent(Intent.ACTION_SEND).apply {
                            putExtra(Intent.EXTRA_TEXT, "Join Dream to Achievers as a partner merchant with my link: ${state.referralLink}")
                            type = "text/plain"
                        }
                        context.startActivity(Intent.createChooser(sendIntent, "Share Referral Link"))
                    }
                )
            }

            // 4. Milestone Tiers Roadmap
            item {
                Text(
                    text = "Canonical Rank Tiers Roadmap",
                    style = DtaTheme.typography.TitleLarge.copy(
                        fontWeight = FontWeight.Bold,
                        color = DtaTheme.colors.ink
                    )
                )
            }

            items(state.allRanks) { rank ->
                val isCurrent = rank.slug == state.rankProgress.currentRank.slug
                val isCompleted = rank.order <= state.rankProgress.currentRank.order
                RankTierCard(
                    rank = rank,
                    isCurrent = isCurrent,
                    isCompleted = isCompleted
                )
            }

            // 5. Milestone Rewards Ledger
            if (state.milestoneRewards.isNotEmpty()) {
                item {
                    Text(
                        text = "Milestone Cash Bonuses Earned",
                        style = DtaTheme.typography.TitleLarge.copy(
                            fontWeight = FontWeight.Bold,
                            color = DtaTheme.colors.ink
                        )
                    )
                }

                items(state.milestoneRewards) { reward ->
                    MilestoneRewardCard(reward = reward)
                }
            }
        }
    }
}

@Composable
private fun CurrentRankHeroCard(progress: RankProgress) {
    val current = progress.currentRank
    val next = progress.nextRank

    Card(
        shape = DtaTheme.shapes.Hero,
        colors = CardDefaults.cardColors(containerColor = Color.Transparent),
        modifier = Modifier.fillMaxWidth()
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
            Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "CURRENT RECOGNITION TIER",
                            style = DtaTheme.typography.Label.copy(
                                color = Color.White.copy(alpha = 0.7f),
                                letterSpacing = 1.sp,
                                fontSize = 11.sp
                            )
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = current.name,
                            style = DtaTheme.typography.DisplayLarge.copy(
                                color = Color.White,
                                fontWeight = FontWeight.Black
                            )
                        )
                    }

                    Box(
                        modifier = Modifier
                            .size(54.dp)
                            .clip(CircleShape)
                            .background(DtaTheme.colors.accentSoft.copy(alpha = 0.3f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.EmojiEvents,
                            contentDescription = null,
                            tint = DtaTheme.colors.accentLight,
                            modifier = Modifier.size(32.dp)
                        )
                    }
                }

                if (next != null) {
                    Box(
                        modifier = Modifier
                            .clip(DtaTheme.shapes.Chip)
                            .background(Color.White.copy(alpha = 0.12f))
                            .padding(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Text(
                            text = "Next: ${next.name} (Bonus: ${next.formattedReward})",
                            style = DtaTheme.typography.Label.copy(
                                color = DtaTheme.colors.accentLight,
                                fontWeight = FontWeight.Bold
                            )
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun DualRequirementCard(progress: RankProgress) {
    val next = progress.nextRank ?: return

    Card(
        shape = DtaTheme.shapes.Card,
        colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
        border = androidx.compose.foundation.BorderStroke(1.dp, DtaTheme.colors.line),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Unlock Requirements for ${next.name}",
                    style = DtaTheme.typography.TitleMedium.copy(fontWeight = FontWeight.Bold)
                )
                Text(
                    text = "${progress.overallProgressPercent}% Completed",
                    style = DtaTheme.typography.Label.copy(
                        color = DtaTheme.colors.primary,
                        fontWeight = FontWeight.Bold
                    )
                )
            }

            Text(
                text = "Both criteria (delivered customer sales and active community network) must be reached to unlock the milestone cash reward.",
                style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.inkSecondary)
            )

            // Requirement 1: Delivered Sales
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "Qualifying Product Sales",
                        style = DtaTheme.typography.BodySmall.copy(fontWeight = FontWeight.SemiBold)
                    )
                    Text(
                        text = "${progress.qualifyingSales} / ${next.requiredSales} Delivered",
                        style = DtaTheme.typography.Label.copy(
                            color = DtaTheme.colors.primary,
                            fontWeight = FontWeight.Bold
                        )
                    )
                }
                LinearProgressIndicator(
                    progress = { (progress.salesProgressPercent / 100f).coerceIn(0f, 1f) },
                    color = DtaTheme.colors.primary,
                    trackColor = DtaTheme.colors.surfaceAlt,
                    modifier = Modifier.fillMaxWidth().height(8.dp).clip(CircleShape)
                )
            }

            // Requirement 2: Community Members
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "Verified Community Network",
                        style = DtaTheme.typography.BodySmall.copy(fontWeight = FontWeight.SemiBold)
                    )
                    Text(
                        text = "${progress.qualifyingCommunity} / ${next.requiredCommunity} Members",
                        style = DtaTheme.typography.Label.copy(
                            color = DtaTheme.colors.accent,
                            fontWeight = FontWeight.Bold
                        )
                    )
                }
                LinearProgressIndicator(
                    progress = { (progress.communityProgressPercent / 100f).coerceIn(0f, 1f) },
                    color = DtaTheme.colors.accent,
                    trackColor = DtaTheme.colors.surfaceAlt,
                    modifier = Modifier.fillMaxWidth().height(8.dp).clip(CircleShape)
                )
            }
        }
    }
}

@Composable
private fun ReferralInviteCard(
    code: String,
    link: String,
    onCopy: () -> Unit,
    onShare: () -> Unit
) {
    Card(
        shape = DtaTheme.shapes.Card,
        colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surfaceAlt),
        border = androidx.compose.foundation.BorderStroke(1.dp, DtaTheme.colors.line),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text(
                text = "Expand Your Partner Network",
                style = DtaTheme.typography.TitleMedium.copy(fontWeight = FontWeight.Bold)
            )
            Text(
                text = "Share your official referral link with potential sellers. New members join your network tier upon registration.",
                style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.inkSecondary)
            )

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(DtaTheme.shapes.Card)
                    .background(DtaTheme.colors.surface)
                    .border(1.dp, DtaTheme.colors.line, DtaTheme.shapes.Card)
                    .padding(horizontal = 14.dp, vertical = 10.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = code,
                    style = DtaTheme.typography.TitleSmall.copy(
                        fontWeight = FontWeight.Bold,
                        color = DtaTheme.colors.primary,
                        letterSpacing = 1.sp
                    )
                )

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    IconButton(onClick = onCopy) {
                        Icon(Icons.Default.ContentCopy, contentDescription = "Copy", tint = DtaTheme.colors.primary)
                    }
                    IconButton(onClick = onShare) {
                        Icon(Icons.Default.Share, contentDescription = "Share", tint = DtaTheme.colors.primary)
                    }
                }
            }
        }
    }
}

@Composable
private fun RankTierCard(
    rank: RankDefinition,
    isCurrent: Boolean,
    isCompleted: Boolean
) {
    Card(
        shape = DtaTheme.shapes.Card,
        colors = CardDefaults.cardColors(
            containerColor = if (isCurrent) DtaTheme.colors.primaryContainer.copy(alpha = 0.3f) else DtaTheme.colors.surface
        ),
        border = androidx.compose.foundation.BorderStroke(
            width = if (isCurrent) 2.dp else 1.dp,
            color = if (isCurrent) DtaTheme.colors.primary else DtaTheme.colors.line
        ),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(
                                if (isCompleted) DtaTheme.colors.primary else DtaTheme.colors.surfaceAlt
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = if (isCompleted) Icons.Default.Check else Icons.Default.Lock,
                            contentDescription = null,
                            tint = if (isCompleted) Color.White else DtaTheme.colors.inkSecondary,
                            modifier = Modifier.size(20.dp)
                        )
                    }

                    Column {
                        Text(
                            text = rank.name,
                            style = DtaTheme.typography.TitleMedium.copy(fontWeight = FontWeight.Bold)
                        )
                        Text(
                            text = "${rank.requiredSales} Sales • ${rank.requiredCommunity} Community Members",
                            style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.inkSecondary)
                        )
                    }
                }

                // Reward Pill
                Box(
                    modifier = Modifier
                        .clip(DtaTheme.shapes.Chip)
                        .background(DtaTheme.colors.accentSoft.copy(alpha = 0.5f))
                        .padding(horizontal = 10.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = "Bonus: ${rank.formattedReward}",
                        style = DtaTheme.typography.Label.copy(
                            color = DtaTheme.colors.accent,
                            fontWeight = FontWeight.Bold,
                            fontSize = 11.sp
                        )
                    )
                }
            }

            Text(
                text = rank.description,
                style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.inkSecondary)
            )
        }
    }
}

@Composable
private fun MilestoneRewardCard(reward: MilestoneReward) {
    Card(
        shape = DtaTheme.shapes.Card,
        colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
        border = androidx.compose.foundation.BorderStroke(1.dp, DtaTheme.colors.line),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(14.dp).fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "${reward.rankName} Achievement Bonus",
                    style = DtaTheme.typography.TitleSmall.copy(fontWeight = FontWeight.Bold)
                )
                Text(
                    text = "Status: ${reward.status.displayName}",
                    style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.semanticSuccess)
                )
            }

            Text(
                text = reward.formattedAmount,
                style = DtaTheme.typography.TitleMedium.copy(
                    color = DtaTheme.colors.accent,
                    fontWeight = FontWeight.Bold
                )
            )
        }
    }
}
