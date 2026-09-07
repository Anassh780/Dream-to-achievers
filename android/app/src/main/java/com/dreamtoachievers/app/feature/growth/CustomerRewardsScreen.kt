package com.dreamtoachievers.app.feature.growth

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import com.dreamtoachievers.app.core.designsystem.util.openExternalIntent
import android.content.Intent
import android.widget.Toast
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ArrowForward
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
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage

/**
 * Dream To Achievers - Growth / Referral System Screen.
 * Exactly matches reference design (media_1788611527538.png).
 */
@Composable
fun CustomerRewardsScreen(
    viewModel: CustomerRewardsViewModel,
    onNavigateToNotifications: () -> Unit,
    onNavigateToLogin: () -> Unit,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current

    var showRanks by remember { mutableStateOf(false) }
    if (showRanks) {
        AlertDialog(onDismissRequest = { showRanks = false }, title = { Text("Rank Journey") },
            text = { Text("Explore Starter, Silver, Gold, Platinum and Diamond milestones. Partner rank eligibility is shown in the partner Growth screen.") },
            confirmButton = { TextButton(onClick = { showRanks = false }) { Text("Close") } })
    }
    val referralCode = uiState.referralCode
    if (uiState.user == null) {
        com.dreamtoachievers.app.core.designsystem.components.DtaEmptyState(
            title = "Your referral journey starts here",
            description = "Sign in to see your referral code and earned rewards.",
            icon = Icons.Default.Group,
            actionButtonText = "Sign In",
            onActionClick = onNavigateToLogin,
            modifier = Modifier.statusBarsPadding()
        )
        return
    }

    val shareUrl = "https://dreamtoachievers.com/?ref=$referralCode"

    val brandGreen = Color(0xFF006B45)
    val emeraldGreen = Color(0xFF10B981)
    val lightMint = Color(0xFFE8F7F1)
    val darkText = Color(0xFF071A14)
    val grayText = Color(0xFF6B7280)
    val borderLight = Color(0xFFE5E7EB)

    Scaffold(
        topBar = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White)
                    .statusBarsPadding()
            ) {
                // App Brand Row: DA Logo + Company Name & Tagline + Notification Bell with Red Dot
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        // DA Logo with crown
                        Box(modifier = Modifier.size(38.dp), contentAlignment = Alignment.Center) {
                            AsyncImage(
                                model = com.dreamtoachievers.app.R.drawable.brand_logo,
                                contentDescription = "Logo",
                                modifier = Modifier.size(36.dp)
                            )
                        }

                        Column {
                            Text(
                                text = "DREAM TO ACHIEVERS",
                                color = Color.Black,
                                fontWeight = FontWeight.Black,
                                fontSize = 13.sp,
                                letterSpacing = 0.5.sp
                            )
                            Text(
                                text = "TOGETHER FOR A BIGGER TOMORROW",
                                color = brandGreen,
                                fontWeight = FontWeight.Bold,
                                fontSize = 7.5.sp,
                                letterSpacing = 0.8.sp
                            )
                        }
                    }

                    // Notification Bell with small red unread dot
                    Box(
                        modifier = Modifier.size(48.dp).clickable(onClick = onNavigateToNotifications),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Outlined.Notifications,
                            contentDescription = "Notifications",
                            tint = Color(0xFF111827),
                            modifier = Modifier.size(24.dp)
                        )
                        Box(
                            modifier = Modifier
                                .align(Alignment.TopEnd)
                                .offset(x = (-2).dp, y = 2.dp)
                                .size(7.dp)
                                .clip(CircleShape)
                                .background(Color(0xFFEF4444))
                        )
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
                top = 6.dp,
                bottom = 28.dp
            ),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // 1. Header Section: "Refer & Grow Together" + Community Illustration
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column(modifier = Modifier.weight(1f).padding(end = 8.dp)) {
                        Text(
                            text = "Refer & Grow Together",
                            color = darkText,
                            fontWeight = FontWeight.Bold,
                            fontSize = 28.sp,
                            lineHeight = 32.sp
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Invite friends, help them shop and move up the ranks",
                            color = grayText,
                            fontSize = 13.sp,
                            lineHeight = 17.sp
                        )
                    }

                    // Community Illustration & Mint Badge
                    GrowthCommunityBadge()
                }
            }

            // 2. Current Rank Card: "Starter"
            item {
                Card(
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.Transparent),
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            brush = Brush.horizontalGradient(
                                colors = listOf(Color(0xFFE8F7F1), Color(0xFFD8F3E5))
                            ),
                            shape = RoundedCornerShape(18.dp)
                        )
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(14.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            // Circular dark green container with golden medal
                            Box(
                                modifier = Modifier
                                    .size(54.dp)
                                    .clip(CircleShape)
                                    .background(Color(0xFF004D30)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Filled.MilitaryTech,
                                    contentDescription = "Medal",
                                    tint = Color(0xFFF59E0B),
                                    modifier = Modifier.size(34.dp)
                                )
                            }

                            Column {
                                Text(
                                    text = "YOUR CURRENT RANK",
                                    color = grayText,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 10.5.sp,
                                    letterSpacing = 0.5.sp
                                )
                                Text(
                                    text = "Starter",
                                    color = Color(0xFF111827),
                                    fontWeight = FontWeight.ExtraBold,
                                    fontSize = 22.sp
                                )
                                Text(
                                    text = "Invite more friends to unlock higher ranks\nand bigger rewards.",
                                    color = Color(0xFF4B5563),
                                    fontSize = 11.5.sp,
                                    lineHeight = 15.sp
                                )
                            }
                        }

                        Icon(
                            imageVector = Icons.Default.KeyboardArrowRight,
                            contentDescription = "Details",
                            tint = Color(0xFF4B5563),
                            modifier = Modifier.size(24.dp)
                        )
                    }
                }
            }

            // Customer Referral Code Card
            item {
                Card(
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, borderLight, RoundedCornerShape(18.dp))
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(18.dp),
                        verticalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(40.dp)
                                        .clip(CircleShape)
                                        .background(lightMint),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = Icons.Outlined.Share,
                                        contentDescription = null,
                                        tint = brandGreen,
                                        modifier = Modifier.size(20.dp)
                                    )
                                }
                                Column {
                                    Text(
                                        text = "Your Referral Code",
                                        color = Color(0xFF111827),
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 15.sp
                                    )
                                    Text(
                                        text = "Share with friends & family to earn points",
                                        color = grayText,
                                        fontSize = 11.sp
                                    )
                                }
                            }
                        }

                        // Referral Code Box with Copy
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(12.dp))
                                .background(Color(0xFFF9FAFB))
                                .border(1.dp, borderLight, RoundedCornerShape(12.dp))
                                .padding(horizontal = 14.dp, vertical = 8.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = referralCode.ifBlank { "DTA-GROWTH" },
                                color = brandGreen,
                                fontWeight = FontWeight.ExtraBold,
                                fontSize = 17.sp,
                                letterSpacing = 1.sp
                            )

                            TextButton(
                                onClick = {
                                    val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                    clipboard.setPrimaryClip(ClipData.newPlainText("Referral Code", referralCode.ifBlank { "DTA-GROWTH" }))
                                    Toast.makeText(context, "Referral code copied!", Toast.LENGTH_SHORT).show()
                                }
                            ) {
                                Icon(Icons.Outlined.ContentCopy, contentDescription = null, tint = brandGreen, modifier = Modifier.size(16.dp))
                                Spacer(Modifier.width(4.dp))
                                Text("Copy", color = brandGreen, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                            }
                        }

                        // WhatsApp Share Action
                        Button(
                            onClick = {
                                val sendIntent = Intent().apply {
                                    action = Intent.ACTION_SEND
                                    putExtra(Intent.EXTRA_TEXT, "Join Dream to Achievers using my referral link and enjoy exclusive rewards: $shareUrl")
                                    type = "text/plain"
                                }
                                context.openExternalIntent(Intent.createChooser(sendIntent, "Share via"))
                            },
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF25D366)),
                            modifier = Modifier.fillMaxWidth().height(48.dp)
                        ) {
                            Icon(Icons.Outlined.Send, contentDescription = null, tint = Color.White, modifier = Modifier.size(18.dp))
                            Spacer(Modifier.width(8.dp))
                            Text("Share on WhatsApp", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        }
                    }
                }
            }

            // 5. Rank Progress Section
            item {
                Card(
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, borderLight, RoundedCornerShape(18.dp))
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Rank Progress",
                                color = Color(0xFF111827),
                                fontWeight = FontWeight.Bold,
                                fontSize = 17.sp
                            )
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.clickable {
                                    showRanks = true
                                }
                            ) {
                                Text(
                                    text = "View All Ranks →",
                                    color = Color(0xFF111827),
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 12.5.sp
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(18.dp))

                        // Timeline Ranks (Starter, Silver, Gold, Platinum, Diamond)
                        RankTimelineRow()
                    }
                }
            }

            // 6. Bottom Opportunity Card: "Bigger Opportunities"
            item {
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = lightMint),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(44.dp)
                                    .clip(CircleShape)
                                    .background(Color.White),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Filled.EmojiEvents,
                                    contentDescription = "Crown",
                                    tint = Color(0xFFF59E0B),
                                    modifier = Modifier.size(26.dp)
                                )
                            }

                            Column {
                                Text(
                                    text = "A Stronger Community",
                                    color = Color(0xFF4B5563),
                                    fontSize = 12.sp
                                )
                                Text(
                                    text = "Bigger Opportunities",
                                    color = Color(0xFF111827),
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 18.sp
                                )
                                Text(
                                    text = "Invite, shop, earn and grow with\nDream To Achievers.",
                                    color = grayText,
                                    fontSize = 11.5.sp,
                                    lineHeight = 15.sp
                                )
                            }
                        }

                        Button(
                            onClick = {
                                val shareIntent = Intent().apply {
                                    action = Intent.ACTION_SEND
                                    putExtra(Intent.EXTRA_TEXT, "Join Dream to Achievers: $shareUrl")
                                    type = "text/plain"
                                }
                                context.openExternalIntent(Intent.createChooser(shareIntent, "Invite Now"))
                            },
                            shape = RoundedCornerShape(20.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF009B67)),
                            contentPadding = PaddingValues(horizontal = 14.dp, vertical = 8.dp)
                        ) {
                            Text(
                                text = "Invite Now →",
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.5.sp
                            )
                        }
                    }
                }
            }
        }
    }
}

/**
 * Reusable How-It-Works Step item
 */
@Composable
fun HowItWorksStep(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    stepTitle: String,
    stepDesc: String,
    modifier: Modifier = Modifier
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = modifier
    ) {
        Box(
            modifier = Modifier
                .size(52.dp)
                .clip(CircleShape)
                .background(Color(0xFFE8F7F1)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = stepTitle,
                tint = Color(0xFF009B67),
                modifier = Modifier.size(24.dp)
            )
        }

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = stepTitle,
            color = Color(0xFF111827),
            fontWeight = FontWeight.Bold,
            fontSize = 12.sp,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(2.dp))

        Text(
            text = stepDesc,
            color = Color(0xFF6B7280),
            fontSize = 10.sp,
            lineHeight = 13.sp,
            textAlign = TextAlign.Center
        )
    }
}

/**
 * Horizontal Rank Progress Timeline matching media_1788611527538.png
 */
@Composable
fun RankTimelineRow() {
    val ranks = listOf(
        RankItem("Starter", "Current Rank", isCurrent = true, isUnlocked = true),
        RankItem("Silver", "Invite 3 Friends", isCurrent = false, isUnlocked = false),
        RankItem("Gold", "Invite 10 Friends", isCurrent = false, isUnlocked = false),
        RankItem("Platinum", "Invite 25 Friends", isCurrent = false, isUnlocked = false),
        RankItem("Diamond", "Invite 50 Friends", isCurrent = false, isUnlocked = false)
    )

    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.Top
    ) {
        ranks.forEachIndexed { index, rank ->
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.width(62.dp)
            ) {
                // Circle with icon + connecting lines
                Box(
                    modifier = Modifier.fillMaxWidth(),
                    contentAlignment = Alignment.Center
                ) {
                    // Line to next circle
                    if (index < ranks.size - 1) {
                        val isNextUnlocked = ranks[index + 1].isUnlocked
                        Box(
                            modifier = Modifier
                                .fillMaxWidth(0.5f)
                                .align(Alignment.CenterEnd)
                                .height(2.5.dp)
                                .background(if (rank.isCurrent) Color(0xFF10B981) else Color(0xFFE5E7EB))
                        )
                    }

                    // Line from previous circle
                    if (index > 0) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth(0.5f)
                                .align(Alignment.CenterStart)
                                .height(2.5.dp)
                                .background(if (rank.isUnlocked) Color(0xFF10B981) else Color(0xFFE5E7EB))
                        )
                    }

                    // The Rank Circle
                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .clip(CircleShape)
                            .background(
                                if (rank.isCurrent) Color(0xFF10B981)
                                else Color(0xFFF3F4F6)
                            )
                            .border(
                                width = 1.dp,
                                color = if (rank.isCurrent) Color(0xFF10B981) else Color(0xFFE5E7EB),
                                shape = CircleShape
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        if (rank.isCurrent) {
                            Icon(
                                imageVector = Icons.Filled.Star,
                                contentDescription = "Active",
                                tint = Color.White,
                                modifier = Modifier.size(20.dp)
                            )
                        } else {
                            Icon(
                                imageVector = Icons.Outlined.Lock,
                                contentDescription = "Locked",
                                tint = Color(0xFF9CA3AF),
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                    text = rank.name,
                    color = if (rank.isCurrent) Color(0xFF10B981) else Color(0xFF374151),
                    fontWeight = FontWeight.Bold,
                    fontSize = 11.sp,
                    textAlign = TextAlign.Center
                )

                Text(
                    text = rank.requirement,
                    color = Color(0xFF6B7280),
                    fontSize = 9.sp,
                    lineHeight = 11.sp,
                    textAlign = TextAlign.Center
                )
            }
        }
    }
}

data class RankItem(
    val name: String,
    val requirement: String,
    val isCurrent: Boolean,
    val isUnlocked: Boolean
)

/**
 * Community avatar cluster & bubble badge for the header
 */
@Composable
fun GrowthCommunityBadge() {
    Box(
        modifier = Modifier
            .size(width = 110.dp, height = 76.dp),
        contentAlignment = Alignment.Center
    ) {
        // Mint speech bubble
        Box(
            modifier = Modifier
                .align(Alignment.TopEnd)
                .clip(RoundedCornerShape(12.dp))
                .background(Color(0xFFE8F7F1))
                .padding(horizontal = 8.dp, vertical = 6.dp)
        ) {
            Text(
                text = "Bigger\nCommunity\nBigger Rewards",
                color = Color(0xFF006B45),
                fontSize = 8.5.sp,
                fontWeight = FontWeight.Bold,
                lineHeight = 11.sp,
                textAlign = TextAlign.Center
            )
        }

        // Green community cluster with golden crown
        Box(
            modifier = Modifier
                .align(Alignment.BottomStart)
                .size(54.dp)
        ) {
            Icon(
                imageVector = Icons.Filled.Groups,
                contentDescription = null,
                tint = Color(0xFF006B45),
                modifier = Modifier
                    .size(46.dp)
                    .align(Alignment.BottomStart)
            )
            Icon(
                imageVector = Icons.Filled.EmojiEvents,
                contentDescription = null,
                tint = Color(0xFFF59E0B),
                modifier = Modifier
                    .size(18.dp)
                    .align(Alignment.TopCenter)
            )
        }
    }
}

/**
 * 3D gift box with crown for referral card
 */
@Composable
fun GrowthGiftBoxBadge() {
    Box(
        modifier = Modifier.size(76.dp),
        contentAlignment = Alignment.Center
    ) {
        // Crown atop gift box
        Icon(
            imageVector = Icons.Filled.EmojiEvents,
            contentDescription = null,
            tint = Color(0xFFF59E0B),
            modifier = Modifier
                .size(22.dp)
                .align(Alignment.TopCenter)
                .offset(y = (-4).dp)
        )

        // Gift box
        Box(
            modifier = Modifier
                .size(56.dp)
                .align(Alignment.BottomCenter)
                .clip(RoundedCornerShape(12.dp))
                .background(Color.White),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Filled.CardGiftcard,
                contentDescription = "Gift",
                tint = Color(0xFF009B67),
                modifier = Modifier.size(38.dp)
            )
        }
    }
}
