package com.dreamtoachievers.app.feature.reseller.tracking

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
import androidx.compose.material.icons.filled.*
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
import com.dreamtoachievers.app.core.data.ResellerRepository
import com.dreamtoachievers.app.core.designsystem.components.*
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme
import com.dreamtoachievers.app.core.model.OrderStatus
import com.dreamtoachievers.app.core.model.ResellerSale

@Composable
fun ResellerOrderTrackingScreen(
    orderId: String,
    resellerRepository: ResellerRepository,
    onNavigateBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val sales by resellerRepository.resellerSales.collectAsState()
    val order = sales.firstOrNull { it.id.equals(orderId, ignoreCase = true) }
        ?: sales.firstOrNull { it.id == "DS1007" } // Fallback to Screen 07 sample

    Scaffold(
        topBar = {
            DtaTopAppBar(
                title = "Order Details",
                subtitle = "Fulfillment timeline, client information & courier tracking",
                navigationIcon = Icons.Default.ArrowBack,
                onNavigationClick = onNavigateBack
            )
        },
        containerColor = DtaTheme.colors.background,
        modifier = modifier.fillMaxSize()
    ) { paddingValues ->
        if (order == null) {
            DtaEmptyState(
                title = "Order Not Found",
                message = "The order details could not be retrieved.",
                actionLabel = "Go Back",
                onActionClick = onNavigateBack,
                modifier = Modifier.padding(paddingValues)
            )
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Header (Point 35: Match Screen 07: #DS1007 Processing)
                item {
                    OrderTrackingHeaderCard(order = order)
                }

                // Customer Information (Point 36)
                item {
                    CustomerInfoCard(order = order)
                }

                // Product Summary (Point 37)
                item {
                    ProductSummaryCard(order = order)
                }

                // Fulfillment Timeline (Point 38: Exact backend progression)
                item {
                    FulfillmentTimelineCard(order = order)
                }

                // Courier Information (Point 39: Screen 07 Bottom Card with Copy Button)
                item {
                    val courierName = order.shippingCourier ?: "TCS Express"
                    val trackingNo = order.trackingNumber ?: "TCS-92847105PK"
                    CourierInfoCard(
                        courier = courierName,
                        trackingNumber = trackingNo,
                        orderStatus = order.status,
                        onCopyTracking = {
                            val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                            clipboard.setPrimaryClip(ClipData.newPlainText("Tracking Number", trackingNo))
                            Toast.makeText(context, "Tracking # Copied: $trackingNo", Toast.LENGTH_SHORT).show()
                        }
                    )
                }
            }
        }
    }
}

@Composable
private fun OrderTrackingHeaderCard(order: ResellerSale) {
    Card(
        shape = DtaTheme.shapes.Card,
        colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
        border = androidx.compose.foundation.BorderStroke(1.dp, DtaTheme.colors.line),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(16.dp).fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "ORDER ID",
                    style = DtaTheme.typography.Label.copy(
                        color = DtaTheme.colors.inkSecondary,
                        fontSize = 10.sp,
                        letterSpacing = 1.sp
                    )
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = "#${order.id.uppercase()}",
                    style = DtaTheme.typography.TitleLarge.copy(fontWeight = FontWeight.Black)
                )
            }

            DtaStatusChip(status = order.status)
        }
    }
}

@Composable
private fun CustomerInfoCard(order: ResellerSale) {
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
                text = "Customer Information",
                style = DtaTheme.typography.TitleMedium.copy(
                    fontWeight = FontWeight.Bold,
                    color = DtaTheme.colors.primary
                )
            )

            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Icon(Icons.Default.Person, contentDescription = null, tint = DtaTheme.colors.primary, modifier = Modifier.size(18.dp))
                Text(
                    text = order.customerName,
                    style = DtaTheme.typography.BodyMedium.copy(fontWeight = FontWeight.SemiBold)
                )
            }

            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Icon(Icons.Default.Phone, contentDescription = null, tint = DtaTheme.colors.primary, modifier = Modifier.size(18.dp))
                Text(
                    text = order.customerPhone,
                    style = DtaTheme.typography.BodyMedium
                )
            }

            Row(verticalAlignment = Alignment.Top, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Icon(Icons.Default.LocationOn, contentDescription = null, tint = DtaTheme.colors.primary, modifier = Modifier.size(18.dp))
                Text(
                    text = "${order.customerAddress}, ${order.customerCity}",
                    style = DtaTheme.typography.BodyMedium.copy(color = DtaTheme.colors.inkSecondary)
                )
            }
        }
    }
}

@Composable
private fun ProductSummaryCard(order: ResellerSale) {
    Card(
        shape = DtaTheme.shapes.Card,
        colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
        border = androidx.compose.foundation.BorderStroke(1.dp, DtaTheme.colors.line),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text(
                text = "Product Summary",
                style = DtaTheme.typography.TitleMedium.copy(
                    fontWeight = FontWeight.Bold,
                    color = DtaTheme.colors.primary
                )
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Product Image
                Box(
                    modifier = Modifier
                        .size(76.dp)
                        .clip(DtaTheme.shapes.Card)
                        .background(DtaTheme.colors.surfaceAlt)
                ) {
                    AsyncImage(
                        model = order.productImage.ifBlank { "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80" },
                        contentDescription = order.productName,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize()
                    )
                }

                // Details (e.g. Nike Air Max Sneakers, Size 42 • Black/White, Qty: 2, Rs 17,998)
                Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(3.dp)) {
                    Text(
                        text = order.productName,
                        style = DtaTheme.typography.TitleSmall.copy(fontWeight = FontWeight.Bold)
                    )

                    if (order.productSpecs.isNotBlank()) {
                        Text(
                            text = order.productSpecs,
                            style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.inkSecondary)
                        )
                    }

                    Text(
                        text = "Qty: ${order.quantity}",
                        style = DtaTheme.typography.BodySmall.copy(fontWeight = FontWeight.Medium)
                    )

                    Text(
                        text = order.formattedTotalBill.replace("PKR", "Rs"),
                        style = DtaTheme.typography.TitleMedium.copy(
                            fontWeight = FontWeight.Black,
                            color = DtaTheme.colors.primary
                        )
                    )
                }
            }
        }
    }
}

@Composable
private fun CourierInfoCard(
    courier: String,
    trackingNumber: String,
    orderStatus: OrderStatus,
    onCopyTracking: () -> Unit
) {
    Card(
        shape = DtaTheme.shapes.Card,
        colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surfaceAlt),
        border = androidx.compose.foundation.BorderStroke(1.dp, DtaTheme.colors.line),
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
                Text(
                    text = "Courier Dispatch Information",
                    style = DtaTheme.typography.TitleSmall.copy(fontWeight = FontWeight.Bold)
                )

                Box(
                    modifier = Modifier
                        .clip(DtaTheme.shapes.Chip)
                        .background(DtaTheme.colors.primaryContainer)
                        .padding(horizontal = 8.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = when (orderStatus) {
                            OrderStatus.DELIVERED -> "Delivered"
                            OrderStatus.IN_TRANSIT -> "In Transit with $courier"
                            else -> "Dispatched via $courier"
                        },
                        style = DtaTheme.typography.Label.copy(
                            color = DtaTheme.colors.primary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 10.sp
                        )
                    )
                }
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Courier Partner: $courier",
                        style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.inkSecondary)
                    )
                    Text(
                        text = "Tracking #: $trackingNumber",
                        style = DtaTheme.typography.TitleSmall.copy(
                            fontWeight = FontWeight.Black,
                            letterSpacing = 1.sp
                        )
                    )
                }

                IconButton(onClick = onCopyTracking) {
                    Icon(Icons.Default.ContentCopy, contentDescription = "Copy Tracking", tint = DtaTheme.colors.primary)
                }
            }
        }
    }
}

@Composable
private fun FulfillmentTimelineCard(order: ResellerSale) {
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
            Text(
                text = "Fulfillment Timeline",
                style = DtaTheme.typography.TitleMedium.copy(
                    fontWeight = FontWeight.Bold,
                    color = DtaTheme.colors.primary
                )
            )

            if (order.status == OrderStatus.REJECTED) {
                // Separate Red Branch for Rejected (Point 38)
                Card(
                    shape = DtaTheme.shapes.Card,
                    colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.semanticError.copy(alpha = 0.08f)),
                    border = androidx.compose.foundation.BorderStroke(1.dp, DtaTheme.colors.semanticError.copy(alpha = 0.3f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Cancel,
                            contentDescription = null,
                            tint = DtaTheme.colors.semanticError,
                            modifier = Modifier.size(24.dp)
                        )
                        Column {
                            Text(
                                text = "Order Payment Rejected",
                                style = DtaTheme.typography.TitleSmall.copy(
                                    color = DtaTheme.colors.semanticError,
                                    fontWeight = FontWeight.Bold
                                )
                            )
                            Text(
                                text = "Reason: ${order.rejectionReason ?: "Payment verification failed"}",
                                style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.ink)
                            )
                            if (order.adminReviewNote != null) {
                                Text(
                                    text = "Note: ${order.adminReviewNote}",
                                    style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.inkSecondary)
                                )
                            }
                        }
                    }
                }
            } else {
                // Exact backend 6-stage vertical timeline (Point 38)
                val stages = listOf(
                    OrderStatus.PENDING_VERIFICATION to "Pending Verification",
                    OrderStatus.PAYMENT_VERIFIED to "Payment Verified",
                    OrderStatus.PROCESSING to "Processing in Warehouse",
                    OrderStatus.DISPATCHED to "Dispatched with Courier",
                    OrderStatus.IN_TRANSIT to "In Transit for Delivery",
                    OrderStatus.DELIVERED to "Delivered to Client"
                )

                val currentIndex = stages.indexOfFirst { it.first == order.status }.coerceAtLeast(0)

                Column(modifier = Modifier.fillMaxWidth()) {
                    stages.forEachIndexed { index, (stageStatus, stageLabel) ->
                        val isCompleted = index < currentIndex
                        val isCurrent = index == currentIndex
                        val isFuture = index > currentIndex

                        TimelineStepRow(
                            stepIndex = index + 1,
                            title = stageLabel,
                            isCompleted = isCompleted,
                            isCurrent = isCurrent,
                            isFuture = isFuture,
                            isLast = index == stages.size - 1
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun TimelineStepRow(
    stepIndex: Int,
    title: String,
    isCompleted: Boolean,
    isCurrent: Boolean,
    isFuture: Boolean,
    isLast: Boolean
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // Timeline Indicator Column (Icon + Vertical line)
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Box(
                modifier = Modifier
                    .size(28.dp)
                    .clip(CircleShape)
                    .background(
                        when {
                            isCompleted -> DtaTheme.colors.semanticSuccess
                            isCurrent -> DtaTheme.colors.primary
                            else -> DtaTheme.colors.surfaceAlt
                        }
                    )
                    .border(
                        width = if (isCurrent) 2.dp else 1.dp,
                        color = if (isCurrent) DtaTheme.colors.accent else DtaTheme.colors.line,
                        shape = CircleShape
                    ),
                contentAlignment = Alignment.Center
            ) {
                if (isCompleted) {
                    Icon(Icons.Default.Check, contentDescription = null, tint = Color.White, modifier = Modifier.size(16.dp))
                } else {
                    Text(
                        text = stepIndex.toString(),
                        style = DtaTheme.typography.Label.copy(
                            color = if (isCurrent) Color.White else DtaTheme.colors.inkSecondary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 11.sp
                        )
                    )
                }
            }

            if (!isLast) {
                Box(
                    modifier = Modifier
                        .width(2.dp)
                        .height(30.dp)
                        .background(
                            if (isCompleted) DtaTheme.colors.semanticSuccess else DtaTheme.colors.line
                        )
                )
            }
        }

        // Title and description
        Column(modifier = Modifier.padding(top = 4.dp)) {
            Text(
                text = title,
                style = DtaTheme.typography.BodyMedium.copy(
                    fontWeight = if (isCurrent) FontWeight.Bold else FontWeight.Medium,
                    color = when {
                        isCompleted -> DtaTheme.colors.ink
                        isCurrent -> DtaTheme.colors.primary
                        else -> DtaTheme.colors.inkSecondary
                    }
                )
            )
        }
    }
}
