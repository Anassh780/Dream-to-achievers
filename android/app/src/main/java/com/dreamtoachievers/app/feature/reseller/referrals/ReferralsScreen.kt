package com.dreamtoachievers.app.feature.reseller.referrals

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.widget.Toast
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ArrowBack
import androidx.compose.material.icons.automirrored.outlined.KeyboardArrowRight
import androidx.compose.material.icons.outlined.CheckCircle
import androidx.compose.material.icons.outlined.ContentCopy
import androidx.compose.material.icons.outlined.Groups
import androidx.compose.material.icons.outlined.Share
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dreamtoachievers.app.core.data.ResellerRepository
import com.dreamtoachievers.app.core.designsystem.util.openExternalIntent
import com.dreamtoachievers.app.core.model.NetworkAnalytics
import com.dreamtoachievers.app.core.model.User
import kotlin.math.max

private val PartnerInk = Color(0xFF081A36)
private val PartnerMuted = Color(0xFF536783)
private val PartnerGreen = Color(0xFF07845E)
private val PartnerGreenDark = Color(0xFF046D50)
private val PartnerGreenSoft = Color(0xFFE1F6ED)
private val PartnerLine = Color(0xFFD6DFE7)
private val PartnerBackground = Color(0xFFF8FAF8)
private val PartnerCard = Color(0xFFFEFFFE)
private val CardShape = RoundedCornerShape(16.dp)
private val ButtonShape = RoundedCornerShape(12.dp)
private val PillShape = RoundedCornerShape(50)

@Composable
fun ReferralsScreen(
    resellerRepository: ResellerRepository,
    currentUser: User?,
    onNavigateBack: () -> Unit,
    onNavigateToTeam: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val context = LocalContext.current
    val analytics by resellerRepository.networkAnalytics.collectAsState()
    val referralCode = currentUser?.referralCode?.takeIf(String::isNotBlank) ?: "Not assigned"
    val hasReferralCode = referralCode != "Not assigned"
    val referralLink = if (hasReferralCode) "https://dreamtoachievers.com/?ref=$referralCode" else ""
    val joinDate = currentUser?.createdAt?.take(10)?.takeIf(String::isNotBlank) ?: "Not available"

    Scaffold(
        topBar = { ReferralHeader(onNavigateBack) },
        containerColor = PartnerBackground,
        modifier = modifier.fillMaxSize(),
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(paddingValues),
            contentPadding = PaddingValues(start = 18.dp, end = 18.dp, top = 10.dp, bottom = 28.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            item {
                ReferralHeroCard(
                    code = referralCode,
                    hasReferralCode = hasReferralCode,
                    joinDate = joinDate,
                    onCopyCode = {
                        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                        clipboard.setPrimaryClip(ClipData.newPlainText("Referral code", referralCode))
                        Toast.makeText(context, "Referral code copied", Toast.LENGTH_SHORT).show()
                    },
                    onShareLink = {
                        val shareIntent = Intent(Intent.ACTION_SEND).apply {
                            putExtra(Intent.EXTRA_TEXT, "Join my partner network on DreamToAchievers: $referralLink")
                            type = "text/plain"
                        }
                        context.openExternalIntent(Intent.createChooser(shareIntent, "Share referral link"))
                    },
                )
            }
            item { NetworkOverviewSection(analytics) }
            item { TeamDirectoryCard(onNavigateToTeam) }
        }
    }
}

@Composable
private fun ReferralHeader(onBack: () -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth().background(PartnerBackground).statusBarsPadding().padding(horizontal = 18.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Surface(onClick = onBack, shape = CircleShape, color = PartnerCard, border = BorderStroke(1.dp, PartnerLine), modifier = Modifier.size(48.dp)) {
            Box(contentAlignment = Alignment.Center) {
                Icon(Icons.AutoMirrored.Outlined.ArrowBack, "Back", tint = PartnerInk, modifier = Modifier.size(25.dp))
            }
        }
        Spacer(Modifier.width(12.dp))
        Column(Modifier.weight(1f)) {
            Text("Referral Network & Growth", color = PartnerInk, fontSize = 20.sp, lineHeight = 23.sp, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
            Text("Share your link and grow your partner network", color = PartnerMuted, fontSize = 12.sp, lineHeight = 16.sp, maxLines = 2)
        }
    }
}

@Composable
private fun ReferralHeroCard(code: String, hasReferralCode: Boolean, joinDate: String, onCopyCode: () -> Unit, onShareLink: () -> Unit) {
    Surface(shape = CardShape, color = PartnerCard, border = BorderStroke(1.dp, PartnerLine), modifier = Modifier.fillMaxWidth()) {
        Column(Modifier.padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Row(Modifier.clip(PillShape).background(PartnerGreenSoft).padding(horizontal = 10.dp, vertical = 6.dp), verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Outlined.CheckCircle, null, tint = PartnerGreen, modifier = Modifier.size(15.dp))
                    Spacer(Modifier.width(5.dp))
                    Text("Verified Partner", color = PartnerGreenDark, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                }
                Text("Joined: $joinDate", color = PartnerMuted, fontSize = 11.sp, maxLines = 1)
            }

            ReferralQrPreview(Modifier.size(94.dp))

            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("YOUR REFERRAL CODE", color = PartnerMuted, fontSize = 10.sp, letterSpacing = 1.sp, fontWeight = FontWeight.Medium)
                Spacer(Modifier.height(4.dp))
                Row(
                    modifier = Modifier.clip(ButtonShape).background(PartnerBackground).border(1.dp, PartnerLine, ButtonShape).clickable(enabled = hasReferralCode, onClick = onCopyCode).padding(horizontal = 18.dp, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    Text(code, color = if (hasReferralCode) PartnerGreenDark else PartnerMuted, fontSize = 24.sp, lineHeight = 27.sp, letterSpacing = 1.5.sp, fontWeight = FontWeight.ExtraBold)
                    Icon(Icons.Outlined.ContentCopy, "Copy referral code", tint = if (hasReferralCode) PartnerGreen else PartnerMuted, modifier = Modifier.size(20.dp))
                }
            }

            Button(
                onClick = onShareLink,
                enabled = hasReferralCode,
                shape = ButtonShape,
                colors = ButtonDefaults.buttonColors(containerColor = PartnerGreen, disabledContainerColor = PartnerLine, disabledContentColor = PartnerMuted),
                contentPadding = PaddingValues(horizontal = 18.dp),
                modifier = Modifier.fillMaxWidth().height(48.dp),
            ) {
                Icon(Icons.Outlined.Share, null, modifier = Modifier.size(19.dp))
                Spacer(Modifier.width(8.dp))
                Text("Share link", fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
            }
        }
    }
}

@Composable
private fun ReferralQrPreview(modifier: Modifier = Modifier) {
    Box(modifier.clip(ButtonShape).background(Color.White).border(1.dp, PartnerLine, ButtonShape).padding(7.dp), contentAlignment = Alignment.Center) {
        Canvas(Modifier.fillMaxSize()) {
            val step = size.width / 9f
            fun finder(x: Float, y: Float) {
                drawRect(Color.Black, Offset(x, y), androidx.compose.ui.geometry.Size(step * 3, step * 3))
                drawRect(Color.White, Offset(x + step, y + step), androidx.compose.ui.geometry.Size(step, step))
            }
            finder(0f, 0f)
            finder(size.width - step * 3, 0f)
            finder(0f, size.height - step * 3)
            drawRect(Color.Black, Offset(step * 4, step * 2), androidx.compose.ui.geometry.Size(step, step * 2))
            drawRect(Color.Black, Offset(step * 4, step * 5), androidx.compose.ui.geometry.Size(step * 2, step))
            drawRect(Color.Black, Offset(step * 7, step * 4), androidx.compose.ui.geometry.Size(step, step * 3))
        }
    }
}

@Composable
private fun NetworkOverviewSection(analytics: NetworkAnalytics) {
    Surface(shape = CardShape, color = PartnerCard, border = BorderStroke(1.dp, PartnerLine), modifier = Modifier.fillMaxWidth()) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            Text("Network overview", color = PartnerInk, fontSize = 18.sp, fontWeight = FontWeight.Bold)
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                NetworkStat("Total partners", analytics.totalPartners.toString(), Modifier.weight(1f))
                NetworkStat("Active", analytics.activePartners.toString(), Modifier.weight(1f))
                NetworkStat("New this month", "+${analytics.newThisMonth}", Modifier.weight(1f))
            }
            HorizontalDivider(color = PartnerLine)
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("Monthly joining trend · last 6 months", color = PartnerMuted, fontSize = 10.sp, letterSpacing = .4.sp, fontWeight = FontWeight.Medium)
                NetworkTrendChart(analytics.monthlyGrowthTrend)
            }
        }
    }
}

@Composable
private fun NetworkStat(label: String, value: String, modifier: Modifier = Modifier) {
    Column(modifier) {
        Text(label, color = PartnerMuted, fontSize = 10.sp, lineHeight = 13.sp, minLines = 2, maxLines = 2)
        Spacer(Modifier.height(3.dp))
        Text(value, color = PartnerInk, fontSize = 23.sp, lineHeight = 26.sp, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
private fun NetworkTrendChart(points: List<Int>) {
    val values = points.takeLast(6)
    val empty = values.isEmpty() || values.all { it == 0 }
    Box(
        modifier = Modifier.fillMaxWidth().height(96.dp).clip(ButtonShape).background(PartnerBackground).border(1.dp, PartnerLine.copy(alpha = .72f), ButtonShape).padding(horizontal = 12.dp, vertical = 10.dp),
        contentAlignment = Alignment.Center,
    ) {
        Canvas(Modifier.fillMaxSize()) {
            repeat(3) { row ->
                val y = size.height * row / 2f
                drawLine(PartnerLine.copy(alpha = .75f), Offset(0f, y), Offset(size.width, y), 1.dp.toPx())
            }
            if (empty) {
                drawLine(PartnerGreen.copy(alpha = .35f), Offset(0f, size.height), Offset(size.width, size.height), 2.dp.toPx(), StrokeCap.Round)
            } else {
                val maxValue = max(values.maxOrNull() ?: 0, 1).toFloat()
                val denominator = max(values.lastIndex, 1)
                val coordinates = values.mapIndexed { index, value -> Offset(size.width * index / denominator, size.height - (value / maxValue) * size.height * .82f) }
                val path = Path().apply { coordinates.forEachIndexed { index, point -> if (index == 0) moveTo(point.x, point.y) else lineTo(point.x, point.y) } }
                drawPath(path, PartnerGreen, style = Stroke(2.5.dp.toPx(), cap = StrokeCap.Round))
                coordinates.forEach { drawCircle(PartnerCard, 5.dp.toPx(), it); drawCircle(PartnerGreen, 3.dp.toPx(), it) }
            }
        }
        if (empty) Text("No joins yet — invite your first partner", color = PartnerMuted, fontSize = 11.sp, fontWeight = FontWeight.Medium)
    }
}

@Composable
private fun TeamDirectoryCard(onClick: () -> Unit) {
    Surface(onClick = onClick, shape = CardShape, color = PartnerCard, border = BorderStroke(1.dp, PartnerLine), modifier = Modifier.fillMaxWidth()) {
        Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(48.dp).clip(ButtonShape).background(PartnerGreenSoft), contentAlignment = Alignment.Center) {
                Icon(Icons.Outlined.Groups, null, tint = PartnerGreenDark, modifier = Modifier.size(25.dp))
            }
            Spacer(Modifier.width(14.dp))
            Column(Modifier.weight(1f)) {
                Text("View my team directory", color = PartnerInk, fontSize = 16.sp, lineHeight = 19.sp, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(2.dp))
                Text("Inspect members, join dates, and qualifying status.", color = PartnerMuted, fontSize = 11.sp, lineHeight = 15.sp, maxLines = 2)
            }
            Spacer(Modifier.width(8.dp))
            Icon(Icons.AutoMirrored.Outlined.KeyboardArrowRight, null, tint = PartnerMuted, modifier = Modifier.size(24.dp))
        }
    }
}
