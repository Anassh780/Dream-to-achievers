package com.dreamtoachievers.app.feature.reseller.referrals

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.widget.Toast
import androidx.compose.foundation.Canvas
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
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dreamtoachievers.app.core.data.ResellerRepository
import com.dreamtoachievers.app.core.designsystem.components.*
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme
import com.dreamtoachievers.app.core.model.NetworkAnalytics

@Composable
fun ReferralsScreen(
    resellerRepository: ResellerRepository,
    onNavigateBack: () -> Unit,
    onNavigateToTeam: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val analytics by resellerRepository.networkAnalytics.collectAsState()
    val referralCode = resellerRepository.currentReferralCode
    val referralLink = resellerRepository.currentReferralLink
    val joinDate = resellerRepository.joiningDate

    Scaffold(
        topBar = {
            DtaTopAppBar(
                title = "Referral Network & Growth",
                subtitle = "Share your partner link and build an active distribution network",
                navigationIcon = Icons.Default.ArrowBack,
                onNavigationClick = onNavigateBack
            )
        },
        containerColor = DtaTheme.colors.background,
        modifier = modifier.fillMaxSize()
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // 1. Referral Code & QR Section (Point 31)
            item {
                ReferralHeroCard(
                    code = referralCode,
                    link = referralLink,
                    joinDate = joinDate,
                    onCopyCode = {
                        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                        clipboard.setPrimaryClip(ClipData.newPlainText("Referral Code", referralCode))
                        Toast.makeText(context, "Referral Code Copied: $referralCode", Toast.LENGTH_SHORT).show()
                    },
                    onShareLink = {
                        val sendIntent = Intent(Intent.ACTION_SEND).apply {
                            putExtra(Intent.EXTRA_TEXT, "Join my merchant network on Dream to Achievers: $referralLink")
                            type = "text/plain"
                        }
                        context.startActivity(Intent.createChooser(sendIntent, "Share Referral Link"))
                    }
                )
            }

            // 2. Compact Network Analytics (Point 33)
            item {
                NetworkOverviewSection(
                    analytics = analytics,
                    onViewTeam = onNavigateToTeam
                )
            }

            // 3. Team Preview CTA Tile (Point 32)
            item {
                Card(
                    shape = DtaTheme.shapes.Card,
                    colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
                    border = androidx.compose.foundation.BorderStroke(1.dp, DtaTheme.colors.line),
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable(onClick = onNavigateToTeam)
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(48.dp)
                                .clip(DtaTheme.shapes.Card)
                                .background(DtaTheme.colors.primaryContainer),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Groups,
                                contentDescription = null,
                                tint = DtaTheme.colors.primary,
                                modifier = Modifier.size(24.dp)
                            )
                        }

                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "View My Team Directory",
                                style = DtaTheme.typography.TitleMedium.copy(fontWeight = FontWeight.Bold)
                            )
                            Text(
                                text = "Inspect direct members, join dates, and active qualifying statuses.",
                                style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.inkSecondary)
                            )
                        }

                        Icon(
                            imageVector = Icons.Default.ArrowForwardIos,
                            contentDescription = null,
                            tint = DtaTheme.colors.inkSecondary,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun ReferralHeroCard(
    code: String,
    link: String,
    joinDate: String,
    onCopyCode: () -> Unit,
    onShareLink: () -> Unit
) {
    Card(
        shape = DtaTheme.shapes.Card,
        colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
        border = androidx.compose.foundation.BorderStroke(1.dp, DtaTheme.colors.line),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(18.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Status & Joining Date Badge
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .clip(DtaTheme.shapes.Chip)
                        .background(DtaTheme.colors.primaryContainer)
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = "● Verified Partner",
                        style = DtaTheme.typography.Label.copy(
                            color = DtaTheme.colors.primary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 11.sp
                        )
                    )
                }

                Text(
                    text = "Joined: $joinDate",
                    style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.inkSecondary)
                )
            }

            // Stylized QR Code Preview Canvas (Point 31)
            Box(
                modifier = Modifier
                    .size(130.dp)
                    .clip(DtaTheme.shapes.Card)
                    .background(Color.White)
                    .border(2.dp, DtaTheme.colors.line, DtaTheme.shapes.Card)
                    .padding(8.dp),
                contentAlignment = Alignment.Center
            ) {
                Canvas(modifier = Modifier.fillMaxSize()) {
                    val step = size.width / 9f
                    // Draw a crisp, stylized QR representation with corner finder patterns
                    drawRect(Color.Black, Offset(0f, 0f), androidx.compose.ui.geometry.Size(step * 3, step * 3))
                    drawRect(Color.White, Offset(step, step), androidx.compose.ui.geometry.Size(step, step))

                    drawRect(Color.Black, Offset(size.width - step * 3, 0f), androidx.compose.ui.geometry.Size(step * 3, step * 3))
                    drawRect(Color.White, Offset(size.width - step * 2, step), androidx.compose.ui.geometry.Size(step, step))

                    drawRect(Color.Black, Offset(0f, size.height - step * 3), androidx.compose.ui.geometry.Size(step * 3, step * 3))
                    drawRect(Color.White, Offset(step, size.height - step * 2), androidx.compose.ui.geometry.Size(step, step))

                    // Center data blocks
                    drawRect(Color.Black, Offset(step * 4, step * 2), androidx.compose.ui.geometry.Size(step, step * 2))
                    drawRect(Color.Black, Offset(step * 4, step * 5), androidx.compose.ui.geometry.Size(step * 2, step))
                    drawRect(Color.Black, Offset(step * 7, step * 4), androidx.compose.ui.geometry.Size(step, step * 3))
                }
            }

            // Referral Code Pill
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = "YOUR REFERRAL CODE",
                    style = DtaTheme.typography.Label.copy(
                        color = DtaTheme.colors.inkSecondary,
                        fontSize = 10.sp,
                        letterSpacing = 1.sp
                    )
                )
                Spacer(modifier = Modifier.height(2.dp))
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier
                        .clip(DtaTheme.shapes.Card)
                        .background(DtaTheme.colors.surfaceAlt)
                        .border(1.dp, DtaTheme.colors.line, DtaTheme.shapes.Card)
                        .clickable(onClick = onCopyCode)
                        .padding(horizontal = 16.dp, vertical = 8.dp)
                ) {
                    Text(
                        text = code,
                        style = DtaTheme.typography.TitleLarge.copy(
                            fontWeight = FontWeight.Black,
                            color = DtaTheme.colors.primary,
                            letterSpacing = 2.sp
                        )
                    )
                    Icon(
                        imageVector = Icons.Default.ContentCopy,
                        contentDescription = "Copy",
                        tint = DtaTheme.colors.primary,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }

            // Share CTA Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedButton(
                    onClick = onCopyCode,
                    shape = DtaTheme.shapes.Button,
                    modifier = Modifier.weight(1f).height(44.dp)
                ) {
                    Icon(Icons.Default.ContentCopy, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Copy Code", style = DtaTheme.typography.Label.copy(fontWeight = FontWeight.Bold))
                }

                Button(
                    onClick = onShareLink,
                    shape = DtaTheme.shapes.Button,
                    colors = ButtonDefaults.buttonColors(containerColor = DtaTheme.colors.primary),
                    modifier = Modifier.weight(1f).height(44.dp)
                ) {
                    Icon(Icons.Default.Share, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Share Link", style = DtaTheme.typography.Label.copy(fontWeight = FontWeight.Bold))
                }
            }
        }
    }
}

@Composable
private fun NetworkOverviewSection(
    analytics: NetworkAnalytics,
    onViewTeam: () -> Unit
) {
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
                    text = "Network Overview",
                    style = DtaTheme.typography.TitleMedium.copy(fontWeight = FontWeight.Bold)
                )

                TextButton(onClick = onViewTeam) {
                    Text(
                        text = "My Team →",
                        style = DtaTheme.typography.Label.copy(
                            color = DtaTheme.colors.primary,
                            fontWeight = FontWeight.Bold
                        )
                    )
                }
            }

            // 3 KPI Columns: Total Partners (126), Active (98), New This Month (+24)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(
                        text = "Total Partners",
                        style = DtaTheme.typography.Label.copy(color = DtaTheme.colors.inkSecondary, fontSize = 11.sp)
                    )
                    Text(
                        text = analytics.totalPartners.toString(),
                        style = DtaTheme.typography.TitleLarge.copy(fontWeight = FontWeight.Black)
                    )
                }

                Column {
                    Text(
                        text = "Active",
                        style = DtaTheme.typography.Label.copy(color = DtaTheme.colors.inkSecondary, fontSize = 11.sp)
                    )
                    Text(
                        text = analytics.activePartners.toString(),
                        style = DtaTheme.typography.TitleLarge.copy(
                            fontWeight = FontWeight.Black,
                            color = DtaTheme.colors.semanticSuccess
                        )
                    )
                }

                Column {
                    Text(
                        text = "New This Month",
                        style = DtaTheme.typography.Label.copy(color = DtaTheme.colors.inkSecondary, fontSize = 11.sp)
                    )
                    Text(
                        text = "+${analytics.newThisMonth}",
                        style = DtaTheme.typography.TitleLarge.copy(
                            fontWeight = FontWeight.Black,
                            color = DtaTheme.colors.accent
                        )
                    )
                }
            }

            Divider(color = DtaTheme.colors.line)

            // Subtle Monthly Growth Chart (Point 33: No oversized desktop graph)
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text(
                    text = "MONTHLY NETWORK JOINING TREND (LAST 6 MONTHS)",
                    style = DtaTheme.typography.Label.copy(
                        color = DtaTheme.colors.inkSecondary,
                        fontSize = 10.sp,
                        letterSpacing = 0.5.sp
                    )
                )

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(60.dp)
                        .clip(DtaTheme.shapes.Card)
                        .background(DtaTheme.colors.surfaceAlt)
                        .padding(horizontal = 8.dp, vertical = 6.dp)
                ) {
                    Canvas(modifier = Modifier.fillMaxSize()) {
                        val points = analytics.monthlyGrowthTrend
                        val maxVal = points.maxOrNull()?.toFloat() ?: 30f
                        val stepX = size.width / (points.size - 1)

                        val path = Path()
                        points.forEachIndexed { i, value ->
                            val x = i * stepX
                            val y = size.height - ((value / maxVal) * (size.height * 0.8f))
                            if (i == 0) path.moveTo(x, y) else path.lineTo(x, y)
                            drawCircle(Color(0xFF1F4D3E), radius = 4.dp.toPx(), center = Offset(x, y))
                        }

                        drawPath(
                            path = path,
                            color = Color(0xFF1F4D3E),
                            style = Stroke(width = 2.5.dp.toPx())
                        )
                    }
                }
            }
        }
    }
}
