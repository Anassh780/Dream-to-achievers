package com.dreamtoachievers.app.feature.reseller.dashboard

import android.graphics.Paint
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.TrendingUp
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.dreamtoachievers.app.R
import com.dreamtoachievers.app.core.model.RankProgress
import com.dreamtoachievers.app.core.model.User
import java.text.NumberFormat
import java.util.Locale
import kotlin.math.abs
import kotlin.math.max

private val PartnerInk = Color(0xFF081A36)
private val PartnerMuted = Color(0xFF536783)
private val PartnerGreen = Color(0xFF07845E)
private val PartnerGreenDark = Color(0xFF046D50)
private val PartnerGreenSoft = Color(0xFFE1F6ED)
private val PartnerOrange = Color(0xFFF58220)
private val PartnerLine = Color(0xFFD6DFE7)
private val PartnerBackground = Color(0xFFF8FAF8)
private val PartnerCard = Color(0xFFFEFFFE)
private val DashboardCardShape = RoundedCornerShape(16.dp)
private val DashboardPillShape = RoundedCornerShape(50)

@Composable
fun ResellerDashboardScreen(
    viewModel: ResellerDashboardViewModel,
    currentUser: User?,
    onNavigateToRecordSale: (String?) -> Unit,
    onNavigateToWallet: () -> Unit,
    onNavigateToGrowth: () -> Unit,
    onNavigateToOrders: () -> Unit,
    onNavigateToReferrals: () -> Unit,
    onNavigateToNotifications: () -> Unit,
    onSwitchRole: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val state by viewModel.uiState.collectAsState()
    val firstName = currentUser?.fullName?.trim()?.substringBefore(' ')?.takeIf(String::isNotBlank) ?: "Partner"

    LazyColumn(
        modifier = modifier.fillMaxSize().background(PartnerBackground).statusBarsPadding(),
        contentPadding = PaddingValues(start = 18.dp, end = 18.dp, bottom = 24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        item {
            PartnerHeader(
                name = firstName,
                fullName = currentUser?.fullName.orEmpty(),
                avatarUrl = currentUser?.avatarUrl,
                onNotifications = onNavigateToNotifications,
                onProfile = onSwitchRole,
            )
        }
        item {
            BusinessSummaryCard(
                grossSales = state.grossSales,
                previousSales = state.previousPeriodSales,
                growthPercent = state.growthPercent,
                chartPoints = state.chartPoints,
                chartLabels = state.chartLabels,
                currentPeriod = state.period,
                onSelectPeriod = viewModel::selectPeriod,
            )
        }
        item {
            Text("Quick actions", color = PartnerInk, fontSize = 21.sp, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(10.dp))
            QuickActions(
                onRecordSale = { onNavigateToRecordSale(null) },
                onTeam = onNavigateToReferrals,
                onPayout = onNavigateToWallet,
            )
        }
        item {
            DashboardMetrics(
                ordersCount = state.ordersCount,
                weeklyOrders = state.weeklyOrders,
                networkCount = state.networkCount,
                availableBalance = state.walletLedger.availableBalance,
                rankProgress = state.rankProgress,
                onOrders = onNavigateToOrders,
                onTeam = onNavigateToReferrals,
                onWallet = onNavigateToWallet,
                onRank = onNavigateToGrowth,
            )
        }
        item { PartnerInviteBanner(onInvite = onNavigateToReferrals) }
    }
}

@Composable
private fun PartnerHeader(name: String, fullName: String, avatarUrl: String?, onNotifications: () -> Unit, onProfile: () -> Unit) {
    Column(Modifier.fillMaxWidth().padding(top = 6.dp)) {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            PartnerWordmark(Modifier.weight(1f))
            IconButton(onClick = onNotifications, modifier = Modifier.size(48.dp)) {
                Icon(Icons.Outlined.NotificationsNone, "Notifications", tint = PartnerInk, modifier = Modifier.size(27.dp))
            }
            Spacer(Modifier.width(4.dp))
            Surface(onClick = onProfile, shape = CircleShape, color = PartnerGreenSoft, border = BorderStroke(1.dp, PartnerLine), modifier = Modifier.size(46.dp)) {
                if (!avatarUrl.isNullOrBlank()) {
                    AsyncImage(avatarUrl, "$fullName profile", Modifier.fillMaxSize(), contentScale = ContentScale.Crop)
                } else {
                    Box(contentAlignment = Alignment.Center) {
                        Text(fullName.split(' ').mapNotNull { it.firstOrNull() }.take(2).joinToString("").ifBlank { "P" }.uppercase(), color = PartnerGreen, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    }
                }
            }
        }
        Spacer(Modifier.height(10.dp))
        Text("Good morning, $name", color = PartnerInk, fontSize = 24.sp, lineHeight = 28.sp, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
        Text("Here’s how your business is doing", color = PartnerMuted, fontSize = 15.sp, lineHeight = 20.sp)
    }
}

@Composable
private fun PartnerWordmark(modifier: Modifier = Modifier) {
    Row(modifier, verticalAlignment = Alignment.CenterVertically) {
        Image(
            painter = painterResource(R.drawable.brand_logo),
            contentDescription = "DreamToAchievers logo",
            contentScale = ContentScale.Fit,
            modifier = Modifier.size(42.dp),
        )
        Spacer(Modifier.width(7.dp))
        Column {
            Text("DreamToAchievers", color = PartnerInk, fontSize = 15.sp, lineHeight = 16.sp, fontWeight = FontWeight.Bold, maxLines = 1)
            Text("P A R T N E R", color = PartnerInk, fontSize = 8.sp, letterSpacing = 1.5.sp, fontWeight = FontWeight.SemiBold)
        }
    }
}

@Composable
private fun BusinessSummaryCard(grossSales: Double, previousSales: Double, growthPercent: Double, chartPoints: List<Double>, chartLabels: List<String>, currentPeriod: String, onSelectPeriod: (String) -> Unit) {
    var selectedPoint by remember(chartPoints) { mutableIntStateOf(chartPoints.lastIndex.coerceAtLeast(0)) }
    Surface(shape = DashboardCardShape, color = Color.Transparent, modifier = Modifier.fillMaxWidth()) {
        Column(Modifier.background(Brush.horizontalGradient(listOf(PartnerGreen, PartnerGreenDark))).padding(15.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text("TOTAL BUSINESS", color = Color.White.copy(alpha = .86f), fontSize = 10.sp, letterSpacing = 1.sp, fontWeight = FontWeight.Medium)
            Text(formatRupees(grossSales), color = Color.White, fontSize = 32.sp, lineHeight = 35.sp, fontWeight = FontWeight.ExtraBold)
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.AutoMirrored.Outlined.TrendingUp, null, tint = Color(0xFFB9F3D7), modifier = Modifier.size(20.dp))
                Spacer(Modifier.width(6.dp))
                Text("${if (growthPercent >= 0) "+" else ""}${oneDecimal(growthPercent)}% this period", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
            }
            PeriodSelector(currentPeriod, onSelectPeriod)
            SalesChart(chartPoints, chartLabels, selectedPoint) { selectedPoint = it }
            Text("Previous period: ${formatRupees(previousSales)}", color = Color.White.copy(alpha = .9f), fontSize = 11.sp)
        }
    }
}

@Composable
private fun PeriodSelector(current: String, onSelect: (String) -> Unit) {
    Row(Modifier.fillMaxWidth().height(40.dp).border(1.dp, Color.White.copy(alpha = .45f), DashboardPillShape).padding(3.dp), verticalAlignment = Alignment.CenterVertically) {
        listOf("Today", "7D", "30D", "All").forEach { period ->
            val selected = period == current
            Box(Modifier.weight(1f).fillMaxHeight().clip(DashboardPillShape).background(if (selected) Color(0xFFE7FAF1) else Color.Transparent).clickable { onSelect(period) }, contentAlignment = Alignment.Center) {
                Text(period, color = if (selected) PartnerInk else Color.White, fontSize = 13.sp, fontWeight = if (selected) FontWeight.Bold else FontWeight.Medium)
            }
        }
    }
}

@Composable
private fun SalesChart(points: List<Double>, chartLabels: List<String>, selected: Int, onSelect: (Int) -> Unit) {
    val values = points.takeIf { it.size == 7 } ?: List(7) { 0.0 }
    val maxValue = max(values.maxOrNull() ?: 0.0, 1.0)
    val labels = chartLabels.takeIf { it.size == 7 } ?: List(7) { "–" }
    Canvas(Modifier.fillMaxWidth().height(120.dp).pointerInput(values) {
        detectTapGestures { tap ->
            val left = 32.dp.toPx()
            val usable = size.width - left * 2
            onSelect((((tap.x - left) / usable) * 6f).toInt().coerceIn(0, 6))
        }
    }) {
        val left = 32.dp.toPx()
        val top = 26.dp.toPx()
        val bottom = size.height - 20.dp.toPx()
        val chartHeight = bottom - top
        val step = (size.width - left * 2) / 6f
        val axisPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = android.graphics.Color.WHITE; textSize = 9.sp.toPx(); textAlign = Paint.Align.RIGHT; alpha = 220 }
        repeat(4) { row ->
            val y = top + chartHeight * row / 3f
            drawLine(Color.White.copy(alpha = .18f), androidx.compose.ui.geometry.Offset(left, y), androidx.compose.ui.geometry.Offset(size.width - left, y), 1.dp.toPx())
            val axisValue = maxValue * (3 - row) / 3.0
            drawContext.canvas.nativeCanvas.drawText(compactNumber(axisValue), left - 6.dp.toPx(), y + 3.dp.toPx(), axisPaint)
        }
        val coordinates = values.mapIndexed { index, value -> androidx.compose.ui.geometry.Offset(left + step * index, bottom - ((value / maxValue).toFloat() * chartHeight * .82f)) }
        val path = Path().apply { coordinates.forEachIndexed { index, point -> if (index == 0) moveTo(point.x, point.y) else lineTo(point.x, point.y) } }
        drawPath(path, Color(0xFFB9F3D7), style = Stroke(2.5.dp.toPx(), cap = StrokeCap.Round))
        coordinates.forEachIndexed { index, point ->
            drawCircle(Color.White, if (index == selected) 6.dp.toPx() else 4.5.dp.toPx(), point)
            if (index == selected) drawCircle(PartnerGreen, 3.dp.toPx(), point)
        }
        val labelPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = android.graphics.Color.WHITE; textSize = 9.sp.toPx(); textAlign = Paint.Align.CENTER }
        labels.forEachIndexed { index, label -> drawContext.canvas.nativeCanvas.drawText(label, left + step * index, size.height - 3.dp.toPx(), labelPaint) }
        coordinates.getOrNull(selected)?.let { point ->
            val text = "${labels[selected]} · ${formatRupees(values[selected])}"
            val tooltipPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = android.graphics.Color.WHITE; textSize = 9.sp.toPx(); textAlign = Paint.Align.CENTER; typeface = android.graphics.Typeface.DEFAULT_BOLD }
            val width = tooltipPaint.measureText(text) + 22.dp.toPx()
            val centerX = point.x.coerceIn(width / 2f, size.width - width / 2f)
            val topY = (point.y - 28.dp.toPx()).coerceAtLeast(0f)
            val tooltipBackground = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = android.graphics.Color.rgb(4, 69, 53) }
            drawContext.canvas.nativeCanvas.drawRoundRect(centerX - width / 2f, topY, centerX + width / 2f, topY + 22.dp.toPx(), 8.dp.toPx(), 8.dp.toPx(), tooltipBackground)
            drawContext.canvas.nativeCanvas.drawText(text, centerX, topY + 15.dp.toPx(), tooltipPaint)
        }
    }
}

@Composable
private fun QuickActions(onRecordSale: () -> Unit, onTeam: () -> Unit, onPayout: () -> Unit) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        ActionTile("Record Sale", Icons.Outlined.AddCircleOutline, PartnerGreen, Color.White, onRecordSale, Modifier.weight(1f))
        ActionTile("My Team", Icons.Outlined.Groups, PartnerCard, PartnerInk, onTeam, Modifier.weight(1f), PartnerLine)
        ActionTile("Payout", Icons.Outlined.AccountBalanceWallet, PartnerOrange, Color.White, onPayout, Modifier.weight(1f))
    }
}

@Composable
private fun ActionTile(title: String, icon: ImageVector, background: Color, foreground: Color, onClick: () -> Unit, modifier: Modifier, border: Color? = null) {
    Surface(onClick = onClick, shape = DashboardCardShape, color = background, border = border?.let { BorderStroke(1.dp, it) }, modifier = modifier.height(84.dp)) {
        Column(Modifier.fillMaxSize().padding(10.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
            Icon(icon, title, tint = foreground, modifier = Modifier.size(25.dp))
            Spacer(Modifier.height(7.dp))
            Text(title, color = foreground, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, maxLines = 1)
        }
    }
}

@Composable
private fun DashboardMetrics(ordersCount: Int, weeklyOrders: Int, networkCount: Int, availableBalance: Double, rankProgress: RankProgress, onOrders: () -> Unit, onTeam: () -> Unit, onWallet: () -> Unit, onRank: () -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            MetricCard("TOTAL ORDERS", ordersCount.toString(), "$weeklyOrders this week", Icons.Outlined.Inventory2, onOrders, Modifier.weight(1f))
            MetricCard("TEAM MEMBERS", networkCount.toString(), "$networkCount active partners", Icons.Outlined.Groups, onTeam, Modifier.weight(1f))
        }
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            MetricCard("AVAILABLE WALLET", formatRupees(availableBalance), "Ready to withdraw", Icons.Outlined.AccountBalanceWallet, onWallet, Modifier.weight(1f)) {
                OutlinedButton(onClick = onWallet, modifier = Modifier.fillMaxWidth().heightIn(min = 42.dp), shape = DashboardPillShape, border = BorderStroke(1.2.dp, PartnerOrange), colors = ButtonDefaults.outlinedButtonColors(contentColor = PartnerOrange), contentPadding = PaddingValues(horizontal = 8.dp)) {
                    Text("Withdraw", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                }
            }
            MetricCard("CURRENT RANK", rankProgress.currentRank.name.replace(" Rank", ""), "${rankProgress.overallProgressPercent}% to next rank", Icons.Outlined.WorkspacePremium, onRank, Modifier.weight(1f)) {
                Box(Modifier.align(Alignment.End).clip(DashboardPillShape).background(PartnerGreenSoft).padding(horizontal = 12.dp, vertical = 7.dp)) {
                    Text("${rankProgress.overallProgressPercent}% next", color = PartnerGreenDark, fontSize = 11.sp, fontWeight = FontWeight.Medium)
                }
            }
        }
    }
}

@Composable
private fun MetricCard(label: String, value: String, supporting: String, icon: ImageVector, onClick: () -> Unit, modifier: Modifier, footer: (@Composable ColumnScope.() -> Unit)? = null) {
    Surface(onClick = onClick, shape = DashboardCardShape, color = PartnerCard, border = BorderStroke(1.dp, PartnerLine), modifier = modifier.heightIn(min = 132.dp)) {
        Column(Modifier.fillMaxSize().padding(14.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(icon, null, tint = PartnerInk, modifier = Modifier.size(24.dp))
                Spacer(Modifier.width(10.dp))
                Text(label, color = PartnerMuted, fontSize = 10.sp, letterSpacing = .4.sp, fontWeight = FontWeight.Medium, maxLines = 1)
            }
            Spacer(Modifier.height(8.dp))
            Text(value, color = PartnerInk, fontSize = if (value.length > 12) 18.sp else 22.sp, lineHeight = 23.sp, fontWeight = FontWeight.SemiBold, maxLines = 2, overflow = TextOverflow.Ellipsis)
            Text(supporting, color = PartnerMuted, fontSize = 11.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
            if (footer != null) { Spacer(Modifier.weight(1f)); Spacer(Modifier.height(8.dp)); footer() }
        }
    }
}

@Composable
private fun PartnerInviteBanner(onInvite: () -> Unit) {
    Surface(shape = DashboardCardShape, color = Color(0xFFE6F8F0), border = BorderStroke(1.dp, Color(0xFFB8E6D4)), modifier = Modifier.fillMaxWidth()) {
        Row(Modifier.fillMaxWidth().padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1.55f)) {
                Text("Grow together, earn more", color = PartnerInk, fontSize = 16.sp, lineHeight = 19.sp, fontWeight = FontWeight.Bold, maxLines = 1)
                Spacer(Modifier.height(4.dp))
                Text("Invite partners and unlock team rewards.", color = PartnerMuted, fontSize = 11.sp, lineHeight = 15.sp, maxLines = 1)
                Spacer(Modifier.height(12.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                    Button(onClick = onInvite, shape = RoundedCornerShape(10.dp), colors = ButtonDefaults.buttonColors(containerColor = PartnerGreen), contentPadding = PaddingValues(horizontal = 13.dp), modifier = Modifier.heightIn(min = 44.dp)) { Text("Invite partners", fontSize = 11.sp, fontWeight = FontWeight.SemiBold) }
                    Box(Modifier.clip(DashboardPillShape).border(1.dp, Color(0xFF92D5BD), DashboardPillShape).padding(horizontal = 10.dp, vertical = 7.dp)) { Text("35% margin", color = PartnerGreenDark, fontSize = 10.sp, fontWeight = FontWeight.Medium) }
                }
            }
            Spacer(Modifier.width(8.dp))
            Image(
                painter = painterResource(R.drawable.wholesale_cartons_banner),
                contentDescription = "DreamToAchievers wholesale referral cartons",
                contentScale = ContentScale.Crop,
                alignment = Alignment.Center,
                modifier = Modifier
                    .size(width = 82.dp, height = 90.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .border(1.dp, Color.White.copy(alpha = .65f), RoundedCornerShape(12.dp)),
            )
        }
    }
}

private fun formatRupees(value: Double): String = "Rs ${NumberFormat.getIntegerInstance(Locale.forLanguageTag("en-PK")).format(value)}"
private fun oneDecimal(value: Double): String = String.format(Locale.US, "%.1f", if (abs(value) < .05) 0.0 else value)
private fun compactNumber(value: Double): String = when {
    value >= 1_000_000 -> "${oneDecimal(value / 1_000_000)}m"
    value >= 1_000 -> "${oneDecimal(value / 1_000)}k"
    else -> value.toInt().toString()
}
