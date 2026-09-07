package com.dreamtoachievers.app.feature.orders

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.ShoppingCart
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dreamtoachievers.app.core.designsystem.components.DtaOrderCard

/**
 * Dream to Achievers - B2B Wholesale "My Orders" Screen.
 * Exactly matching media_1788611002681.png.
 */
@Composable
fun OrdersScreen(
    viewModel: OrdersViewModel,
    onNavigateToTracking: (String) -> Unit,
    onNavigateToMarket: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val uiState by viewModel.uiState.collectAsState()

    val primaryGreen = Color(0xFF009B67)
    val textPrimary = Color(0xFF111827)
    val textSecondary = Color(0xFF6B7280)
    val borderLight = Color(0xFFE5E7EB)
    val lightMintBg = Color(0xFFE8F7F2)

    val visibleTabs = listOf(
        OrderFilterTab.ALL,
        OrderFilterTab.PENDING,
        OrderFilterTab.PROCESSING,
        OrderFilterTab.DISPATCHED,
        OrderFilterTab.DELIVERED,
    )

    Scaffold(
        topBar = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White)
                    .statusBarsPadding(),
            ) {
                // Large bold heading: "My Orders" (32sp ExtraBold, 24dp horizontal padding)
                Text(
                    text = "My Orders",
                    color = textPrimary,
                    fontWeight = FontWeight.ExtraBold,
                    fontSize = 32.sp,
                    lineHeight = 38.sp,
                    modifier = Modifier.padding(start = 24.dp, end = 24.dp, top = 16.dp, bottom = 12.dp),
                )

                // Horizontal scrolling category chips (Height ~48dp, rounded pills)
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    contentPadding = PaddingValues(horizontal = 24.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 12.dp),
                ) {
                    items(visibleTabs) { tab ->
                        val isSelected = uiState.selectedTab == tab
                        Box(
                            modifier = Modifier
                                .height(44.dp)
                                .clip(RoundedCornerShape(24.dp))
                                .background(if (isSelected) primaryGreen else Color.White)
                                .border(
                                    width = 1.dp,
                                    color = if (isSelected) primaryGreen else borderLight,
                                    shape = RoundedCornerShape(24.dp)
                                )
                                .clickable { viewModel.selectTab(tab) }
                                .padding(horizontal = 22.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = tab.label,
                                color = if (isSelected) Color.White else Color(0xFF374151),
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                fontSize = 14.sp
                            )
                        }
                    }
                }
            }
        },
        containerColor = Color.White,
        modifier = modifier.fillMaxSize()
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            if (uiState.isLoading) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = primaryGreen)
                }
            } else if (uiState.orders.isEmpty()) {
                // Centered Empty Orders State matching media_1788611002681.png
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    // Soft light green circular container with custom receipt illustration
                    Box(
                        modifier = Modifier.size(140.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        // Soft glow underneath
                        Box(
                            modifier = Modifier
                                .size(120.dp, 24.dp)
                                .align(Alignment.BottomCenter)
                                .background(lightMintBg.copy(alpha = 0.7f), CircleShape)
                        )

                        // Main Circle
                        Box(
                            modifier = Modifier
                                .size(136.dp)
                                .clip(CircleShape)
                                .background(lightMintBg),
                            contentAlignment = Alignment.Center
                        ) {
                            OrdersEmptyIllustration(
                                strokeColor = primaryGreen,
                                modifier = Modifier.size(80.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(28.dp))

                    // Heading: "No orders found"
                    Text(
                        text = "No orders found",
                        color = textPrimary,
                        fontWeight = FontWeight.Bold,
                        fontSize = 24.sp
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    // Description: "You haven't placed any orders in this\nstatus yet."
                    Text(
                        text = "You haven't placed any orders in this\nstatus yet.",
                        color = textSecondary,
                        fontSize = 15.sp,
                        lineHeight = 22.sp,
                        textAlign = TextAlign.Center
                    )

                    Spacer(modifier = Modifier.height(28.dp))

                    // "Start Shopping" Button
                    Button(
                        onClick = onNavigateToMarket,
                        shape = RoundedCornerShape(30.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = primaryGreen),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(60.dp)
                            .shadow(
                                elevation = 6.dp,
                                shape = RoundedCornerShape(30.dp),
                                spotColor = primaryGreen.copy(alpha = 0.4f)
                            )
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center
                        ) {
                            Icon(
                                imageVector = Icons.Outlined.ShoppingCart,
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                text = "Start Shopping",
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp
                            )
                        }
                    }
                }
            } else {
                LazyColumn(
                    contentPadding = PaddingValues(
                        start = 24.dp,
                        end = 24.dp,
                        top = 12.dp,
                        bottom = 24.dp
                    ),
                    verticalArrangement = Arrangement.spacedBy(14.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    items(uiState.orders, key = { it.id }) { order ->
                        DtaOrderCard(
                            order = order,
                            onTrackClick = { onNavigateToTracking(order.id) }
                        )
                    }
                }
            }
        }
    }
}

/**
 * Custom vector illustration matching the receipt in media_1788611002681.png:
 * - Green receipt document with serrated top edge and folded bottom-right corner.
 * - Two horizontal receipt content lines.
 * - 4 decorative radiating accent dashes (2 on left, 2 on right).
 */
@Composable
fun OrdersEmptyIllustration(
    strokeColor: Color,
    modifier: Modifier = Modifier
) {
    Canvas(modifier = modifier) {
        val w = size.width
        val h = size.height
        val strokeWidth = 3.6.dp.toPx()

        // 1. Left radiating accent dashes
        drawLine(
            color = strokeColor,
            start = Offset(w * 0.16f, h * 0.38f),
            end = Offset(w * 0.23f, h * 0.41f),
            strokeWidth = strokeWidth,
            cap = StrokeCap.Round
        )
        drawLine(
            color = strokeColor,
            start = Offset(w * 0.16f, h * 0.62f),
            end = Offset(w * 0.23f, h * 0.59f),
            strokeWidth = strokeWidth,
            cap = StrokeCap.Round
        )

        // 2. Right radiating accent dashes
        drawLine(
            color = strokeColor,
            start = Offset(w * 0.84f, h * 0.38f),
            end = Offset(w * 0.77f, h * 0.41f),
            strokeWidth = strokeWidth,
            cap = StrokeCap.Round
        )
        drawLine(
            color = strokeColor,
            start = Offset(w * 0.84f, h * 0.62f),
            end = Offset(w * 0.77f, h * 0.59f),
            strokeWidth = strokeWidth,
            cap = StrokeCap.Round
        )

        // 3. Receipt body with zig-zag serrated top & folded lower corner
        val receiptPath = Path().apply {
            val left = w * 0.32f
            val right = w * 0.68f
            val top = h * 0.30f
            val bottom = h * 0.74f
            val foldOffset = w * 0.11f

            // Start at bottom-left corner
            moveTo(left, bottom)
            // Left edge
            lineTo(left, top)
            // Serrated teeth across top edge
            val toothW = (right - left) / 6f
            val toothH = h * 0.035f
            lineTo(left + (toothW * 1), top + toothH)
            lineTo(left + (toothW * 2), top)
            lineTo(left + (toothW * 3), top + toothH)
            lineTo(left + (toothW * 4), top)
            lineTo(left + (toothW * 5), top + toothH)
            lineTo(right, top)
            // Right edge down to fold
            lineTo(right, bottom - foldOffset)
            // Fold diagonal cut
            lineTo(right - foldOffset, bottom)
            // Bottom edge back to left
            lineTo(left, bottom)
            close()
        }

        drawPath(
            path = receiptPath,
            color = strokeColor,
            style = Stroke(width = strokeWidth, cap = StrokeCap.Round, join = StrokeJoin.Round)
        )

        // 4. Folded corner triangle crease
        val foldPath = Path().apply {
            val right = w * 0.68f
            val bottom = h * 0.74f
            val foldOffset = w * 0.11f
            moveTo(right - foldOffset, bottom)
            lineTo(right - foldOffset, bottom - foldOffset)
            lineTo(right, bottom - foldOffset)
        }
        drawPath(
            path = foldPath,
            color = strokeColor,
            style = Stroke(width = strokeWidth, cap = StrokeCap.Round, join = StrokeJoin.Round)
        )

        // 5. Receipt horizontal text lines
        val line1Start = Offset(w * 0.42f, h * 0.45f)
        val line1End = Offset(w * 0.58f, h * 0.45f)
        drawLine(
            color = strokeColor,
            start = line1Start,
            end = line1End,
            strokeWidth = strokeWidth,
            cap = StrokeCap.Round
        )

        val line2Start = Offset(w * 0.42f, h * 0.54f)
        val line2End = Offset(w * 0.53f, h * 0.54f)
        drawLine(
            color = strokeColor,
            start = line2Start,
            end = line2End,
            strokeWidth = strokeWidth,
            cap = StrokeCap.Round
        )
    }
}
