package com.dreamtoachievers.app.feature.admin.rewards

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dreamtoachievers.app.core.data.AdminRepository
import com.dreamtoachievers.app.core.designsystem.components.*
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme
import com.dreamtoachievers.app.core.designsystem.util.DtaHaptics
import com.dreamtoachievers.app.core.model.MilestoneReward
import com.dreamtoachievers.app.core.model.RewardStatus

@Composable
fun AdminRankRewardsScreen(
    adminRepository: AdminRepository,
    onNavigateBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val haptic = LocalHapticFeedback.current
    val rewards by adminRepository.platformRewards.collectAsState()

    var showRejectDialog by remember { mutableStateOf<MilestoneReward?>(null) }
    var rejectionReasonInput by remember { mutableStateOf("") }

    if (showRejectDialog != null) {
        val reward = showRejectDialog!!
        AlertDialog(
            onDismissRequest = { showRejectDialog = null },
            title = {
                Text("Reject Milestone Reward", style = DtaTheme.typography.TitleMedium.copy(fontWeight = FontWeight.Bold))
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(
                        text = "Specify rejection note for reseller ${reward.userId}:",
                        style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.inkSecondary)
                    )
                    OutlinedTextField(
                        value = rejectionReasonInput,
                        onValueChange = { rejectionReasonInput = it },
                        label = { Text("Reason *") },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val ok = adminRepository.updateRewardStatus(reward.id, RewardStatus.REJECTED, rejectionReasonInput)
                        if (ok) DtaHaptics.action(haptic)
                        showRejectDialog = null
                        rejectionReasonInput = ""
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = DtaTheme.colors.semanticError)
                ) {
                    Text("Reject")
                }
            },
            dismissButton = {
                TextButton(onClick = { showRejectDialog = null }) { Text("Cancel") }
            }
        )
    }

    Scaffold(
        topBar = {
            DtaTopAppBar(
                title = "Milestone Rank Rewards",
                subtitle = "Review and disburse partner qualification cash bonuses",
                navigationIcon = Icons.Default.ArrowBack,
                onNavigationClick = onNavigateBack
            )
        },
        containerColor = DtaTheme.colors.background,
        modifier = modifier.fillMaxSize()
    ) { paddingValues ->
        if (rewards.isEmpty()) {
            DtaEmptyState(
                title = "No Milestone Rewards Pending",
                message = "Achieved partner rank reward bonuses will appear here for verification.",
                modifier = Modifier.padding(paddingValues)
            )
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(rewards) { reward ->
                    AdminRewardCard(
                        reward = reward,
                        onApprove = {
                            val ok = adminRepository.updateRewardStatus(reward.id, RewardStatus.APPROVED)
                            if (ok) DtaHaptics.action(haptic)
                        },
                        onMarkPaid = {
                            val ok = adminRepository.updateRewardStatus(reward.id, RewardStatus.PAID, "Disbursed via bank transfer")
                            if (ok) DtaHaptics.milestone(haptic)
                        },
                        onReject = { showRejectDialog = reward }
                    )
                }
            }
        }
    }
}

@Composable
private fun AdminRewardCard(
    reward: MilestoneReward,
    onApprove: () -> Unit,
    onMarkPaid: () -> Unit,
    onReject: () -> Unit
) {
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
            // Header: Rank Name + Status Chip
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Icon(Icons.Default.EmojiEvents, contentDescription = null, tint = DtaTheme.colors.accent)
                    Text(
                        text = reward.rankName,
                        style = DtaTheme.typography.TitleMedium.copy(fontWeight = FontWeight.Bold)
                    )
                }

                Box(
                    modifier = Modifier
                        .clip(DtaTheme.shapes.Chip)
                        .background(
                            when (reward.status) {
                                RewardStatus.PAID -> DtaTheme.colors.semanticSuccess.copy(alpha = 0.15f)
                                RewardStatus.APPROVED -> DtaTheme.colors.semanticInfo.copy(alpha = 0.15f)
                                RewardStatus.PENDING_REVIEW -> DtaTheme.colors.semanticPending.copy(alpha = 0.15f)
                                RewardStatus.REJECTED -> DtaTheme.colors.semanticError.copy(alpha = 0.15f)
                            }
                        )
                        .padding(horizontal = 8.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = reward.status.displayName,
                        style = DtaTheme.typography.Label.copy(
                            color = when (reward.status) {
                                RewardStatus.PAID -> DtaTheme.colors.semanticSuccess
                                RewardStatus.APPROVED -> DtaTheme.colors.semanticInfo
                                RewardStatus.PENDING_REVIEW -> DtaTheme.colors.semanticPending
                                RewardStatus.REJECTED -> DtaTheme.colors.semanticError
                            },
                            fontWeight = FontWeight.Bold,
                            fontSize = 11.sp
                        )
                    )
                }
            }

            // Reseller details & Amount (Point 58)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Partner ID: ${reward.userId}",
                        style = DtaTheme.typography.BodySmall.copy(fontWeight = FontWeight.SemiBold)
                    )
                    Text(
                        text = "Achieved: ${reward.earnedAt.take(10)}",
                        style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.inkSecondary)
                    )
                }

                Text(
                    text = reward.formattedAmount,
                    style = DtaTheme.typography.TitleLarge.copy(
                        color = DtaTheme.colors.accent,
                        fontWeight = FontWeight.Black
                    )
                )
            }

            if (reward.adminNote != null) {
                Text(
                    text = "Note: ${reward.adminNote}",
                    style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.inkSecondary)
                )
            }

            // Action Buttons & Point 93 Double-Payment Safety
            if (reward.status == RewardStatus.PAID) {
                Divider(color = DtaTheme.colors.line)
                Surface(
                    color = DtaTheme.colors.semanticSuccess.copy(alpha = 0.08f),
                    shape = DtaTheme.shapes.Card,
                    border = androidx.compose.foundation.BorderStroke(1.dp, DtaTheme.colors.semanticSuccess.copy(alpha = 0.3f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = "Paid",
                            tint = DtaTheme.colors.semanticSuccess,
                            modifier = Modifier.size(24.dp)
                        )
                        Column {
                            Text(
                                text = "Paid & Disbursed",
                                style = DtaTheme.typography.TitleSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = DtaTheme.colors.semanticSuccess
                                )
                            )
                            Text(
                                text = "Milestone cash reward released • ${reward.adminNote ?: "Verified & Finalized"}",
                                style = DtaTheme.typography.BodySmall.copy(
                                    fontWeight = FontWeight.SemiBold,
                                    color = DtaTheme.colors.ink
                                )
                            )
                        }
                    }
                }
            } else if (reward.status == RewardStatus.PENDING_REVIEW || reward.status == RewardStatus.APPROVED) {
                Divider(color = DtaTheme.colors.line)

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    if (reward.status == RewardStatus.PENDING_REVIEW) {
                        Button(
                            onClick = onApprove,
                            shape = DtaTheme.shapes.Chip,
                            colors = ButtonDefaults.buttonColors(containerColor = DtaTheme.colors.primary),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Approve", style = DtaTheme.typography.Label.copy(fontSize = 11.sp))
                        }
                    }

                    Button(
                        onClick = onMarkPaid,
                        shape = DtaTheme.shapes.Chip,
                        colors = ButtonDefaults.buttonColors(containerColor = DtaTheme.colors.semanticSuccess),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Mark Paid", style = DtaTheme.typography.Label.copy(fontSize = 11.sp))
                    }

                    OutlinedButton(
                        onClick = onReject,
                        shape = DtaTheme.shapes.Chip,
                        border = androidx.compose.foundation.BorderStroke(1.dp, DtaTheme.colors.semanticError)
                    ) {
                        Text("Reject", style = DtaTheme.typography.Label.copy(color = DtaTheme.colors.semanticError, fontSize = 11.sp))
                    }
                }
            }
        }
    }
}
