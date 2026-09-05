package com.dreamtoachievers.app.feature.tracking

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.outlined.ContentCopy
import androidx.compose.material.icons.outlined.LocalShipping
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.dreamtoachievers.app.core.designsystem.components.*
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme
import com.dreamtoachievers.app.core.model.OrderStatus

data class TimelineStep(
    val title: String,
    val description: String,
    val isCompleted: Boolean,
    val isCurrent: Boolean
)

@Composable
fun OrderTrackingScreen(
    viewModel: OrderTrackingViewModel,
    onNavigateBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current

    Scaffold(
        topBar = {
            DtaSecondaryTopBar(
                title = "Order Tracking",
                onBackClick = onNavigateBack
            )
        },
        containerColor = DtaTheme.colors.background,
        modifier = modifier.fillMaxSize()
    ) { paddingValues ->
        if (uiState.isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = DtaTheme.colors.primary)
            }
        } else if (uiState.error != null || uiState.order == null) {
            DtaErrorState(
                message = uiState.error ?: "Order not found",
                onRetry = { viewModel.loadTracking() },
                modifier = Modifier.padding(paddingValues)
            )
        } else {
            val order = uiState.order!!

            // Build timeline steps based on fulfillment state
            val currentStatus = order.status
            val steps = listOf(
                TimelineStep(
                    title = "Order Placed",
                    description = "Payment screenshot submitted for review",
                    isCompleted = true,
                    isCurrent = currentStatus == OrderStatus.PENDING_VERIFICATION
                ),
                TimelineStep(
                    title = "Payment Verified",
                    description = "Payment confirmed by finance team",
                    isCompleted = currentStatus != OrderStatus.PENDING_VERIFICATION,
                    isCurrent = currentStatus == OrderStatus.PAYMENT_VERIFIED
                ),
                TimelineStep(
                    title = "Processing in Warehouse",
                    description = "Quality checks, packing & invoice preparation",
                    isCompleted = currentStatus == OrderStatus.PROCESSING || currentStatus == OrderStatus.DISPATCHED || currentStatus == OrderStatus.IN_TRANSIT || currentStatus == OrderStatus.DELIVERED,
                    isCurrent = currentStatus == OrderStatus.PROCESSING
                ),
                TimelineStep(
                    title = "Dispatched",
                    description = "Handed over to courier service",
                    isCompleted = currentStatus == OrderStatus.DISPATCHED || currentStatus == OrderStatus.IN_TRANSIT || currentStatus == OrderStatus.DELIVERED,
                    isCurrent = currentStatus == OrderStatus.DISPATCHED
                ),
                TimelineStep(
                    title = "In Transit",
                    description = "Out for delivery to destination city",
                    isCompleted = currentStatus == OrderStatus.IN_TRANSIT || currentStatus == OrderStatus.DELIVERED,
                    isCurrent = currentStatus == OrderStatus.IN_TRANSIT
                ),
                TimelineStep(
                    title = "Delivered",
                    description = "Package received by customer",
                    isCompleted = currentStatus == OrderStatus.DELIVERED || currentStatus == OrderStatus.FULFILLED || currentStatus == OrderStatus.CONFIRMED,
                    isCurrent = currentStatus == OrderStatus.DELIVERED
                )
            )

            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentPadding = PaddingValues(
                    start = DtaTheme.spacing.ScreenHorizontal,
                    end = DtaTheme.spacing.ScreenHorizontal,
                    top = 12.dp,
                    bottom = 32.dp
                ),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // 1. Courier & Tracking Header Card
                item {
                    Card(
                        shape = DtaTheme.shapes.Card,
                        colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(1.dp, DtaTheme.colors.line, DtaTheme.shapes.Card)
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
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        imageVector = Icons.Outlined.LocalShipping,
                                        contentDescription = null,
                                        tint = DtaTheme.colors.primary,
                                        modifier = Modifier.size(22.dp)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = order.shippingCourier ?: "Standard Express Courier",
                                        style = DtaTheme.typography.SectionHeading.copy(
                                            fontSize = 16.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                    )
                                }

                                DtaStatusChip(status = order.status)
                            }

                            Divider(color = DtaTheme.colors.line)

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text(
                                        text = "TRACKING NUMBER",
                                        style = DtaTheme.typography.Label.copy(
                                            color = DtaTheme.colors.inkMuted,
                                            fontWeight = FontWeight.Bold
                                        )
                                    )
                                    Text(
                                        text = order.trackingNumber ?: "Awaiting Courier Assignment",
                                        style = DtaTheme.typography.CardTitle.copy(
                                            color = DtaTheme.colors.primary,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 15.sp
                                        )
                                    )
                                }

                                if (!order.trackingNumber.isNullOrBlank()) {
                                    IconButton(
                                        onClick = {
                                            val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                            clipboard.setPrimaryClip(ClipData.newPlainText("Tracking", order.trackingNumber))
                                            Toast.makeText(context, "Tracking number copied!", Toast.LENGTH_SHORT).show()
                                        }
                                    ) {
                                        Icon(
                                            imageVector = Icons.Outlined.ContentCopy,
                                            contentDescription = "Copy Tracking",
                                            tint = DtaTheme.colors.primary
                                        )
                                    }
                                }
                            }
                        }
                    }
                }

                // 2. Vertical Fulfillment Timeline
                item {
                    Card(
                        shape = DtaTheme.shapes.Card,
                        colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(1.dp, DtaTheme.colors.line, DtaTheme.shapes.Card)
                    ) {
                        Column(
                            modifier = Modifier.padding(18.dp)
                        ) {
                            Text(
                                text = "Fulfillment Status Timeline",
                                style = DtaTheme.typography.SectionHeading.copy(
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            )

                            Spacer(modifier = Modifier.height(16.dp))

                            steps.forEachIndexed { index, step ->
                                Row(
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    // Timeline Indicator column
                                    Column(
                                        horizontalAlignment = Alignment.CenterHorizontally,
                                        modifier = Modifier.width(28.dp)
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .size(24.dp)
                                                .clip(CircleShape)
                                                .background(
                                                    if (step.isCompleted) DtaTheme.colors.primary
                                                    else if (step.isCurrent) DtaTheme.colors.accentGold
                                                    else DtaTheme.colors.line
                                                ),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            if (step.isCompleted) {
                                                Icon(
                                                    imageVector = Icons.Default.Check,
                                                    contentDescription = null,
                                                    tint = Color.White,
                                                    modifier = Modifier.size(14.dp)
                                                )
                                            } else if (step.isCurrent) {
                                                Box(
                                                    modifier = Modifier
                                                        .size(8.dp)
                                                        .clip(CircleShape)
                                                        .background(Color.White)
                                                )
                                            }
                                        }

                                        if (index < steps.size - 1) {
                                            Box(
                                                modifier = Modifier
                                                    .width(2.dp)
                                                    .height(38.dp)
                                                    .background(
                                                        if (step.isCompleted) DtaTheme.colors.primary else DtaTheme.colors.line
                                                    )
                                            )
                                        }
                                    }

                                    Spacer(modifier = Modifier.width(12.dp))

                                    // Content
                                    Column(modifier = Modifier.padding(bottom = 18.dp)) {
                                        Text(
                                            text = step.title,
                                            style = DtaTheme.typography.CardTitle.copy(
                                                color = if (step.isCompleted || step.isCurrent) DtaTheme.colors.inkPrimary else DtaTheme.colors.inkMuted,
                                                fontWeight = if (step.isCurrent) FontWeight.Bold else FontWeight.SemiBold,
                                                fontSize = 14.sp
                                            )
                                        )
                                        Text(
                                            text = step.description,
                                            style = DtaTheme.typography.Metadata.copy(
                                                color = DtaTheme.colors.inkSecondary,
                                                fontSize = 12.sp
                                            )
                                        )
                                    }
                                }
                            }
                        }
                    }
                }

                // 3. Delivery Information Card
                item {
                    Card(
                        shape = DtaTheme.shapes.Card,
                        colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(1.dp, DtaTheme.colors.line, DtaTheme.shapes.Card)
                    ) {
                        Column(
                            modifier = Modifier.padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Text(
                                text = "Delivery Address",
                                style = DtaTheme.typography.SectionHeading.copy(
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            )

                            Text(
                                text = order.customerName,
                                style = DtaTheme.typography.Body.copy(fontWeight = FontWeight.SemiBold)
                            )
                            Text(
                                text = order.customerAddress,
                                style = DtaTheme.typography.Metadata.copy(color = DtaTheme.colors.inkSecondary)
                            )
                            Text(
                                text = "${order.customerCity} • Phone: ${order.customerPhone}",
                                style = DtaTheme.typography.Metadata.copy(color = DtaTheme.colors.inkSecondary)
                            )
                        }
                    }
                }

                // 4. Ordered Items Card
                item {
                    Card(
                        shape = DtaTheme.shapes.Card,
                        colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(1.dp, DtaTheme.colors.line, DtaTheme.shapes.Card)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(14.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(60.dp)
                                    .clip(DtaTheme.shapes.Small)
                                    .background(DtaTheme.colors.surfaceAlt)
                            ) {
                                AsyncImage(
                                    model = order.productImage,
                                    contentDescription = order.productName,
                                    modifier = Modifier.fillMaxSize(),
                                    contentScale = ContentScale.Crop
                                )
                            }

                            Spacer(modifier = Modifier.width(12.dp))

                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = order.productName,
                                    style = DtaTheme.typography.CardTitle.copy(
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                )
                                Text(
                                    text = "Quantity: ${order.quantity}",
                                    style = DtaTheme.typography.Metadata.copy(color = DtaTheme.colors.inkSecondary)
                                )
                            }

                            Text(
                                text = order.formattedTotal,
                                style = DtaTheme.typography.CardTitle.copy(
                                    color = DtaTheme.colors.primary,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 15.sp
                                )
                            )
                        }
                    }
                }
            }
        }
    }
}
