package com.dreamtoachievers.app.feature.admin.orders

import android.content.Intent
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectTransformGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import coil.compose.AsyncImage
import com.dreamtoachievers.app.core.data.AdminRepository
import com.dreamtoachievers.app.core.designsystem.components.*
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme
import com.dreamtoachievers.app.core.designsystem.util.DtaHaptics
import com.dreamtoachievers.app.core.model.OrderStatus
import com.dreamtoachievers.app.core.model.ResellerSale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminOrderReviewScreen(
    orderId: String,
    adminRepository: AdminRepository,
    onNavigateBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val haptic = LocalHapticFeedback.current
    val orders by adminRepository.platformOrders.collectAsState()
    val conflictError by adminRepository.lastConflictError.collectAsState()
    val order = orders.firstOrNull { it.id.equals(orderId, ignoreCase = true) }
        ?: orders.firstOrNull { it.id == "DS1008" } // Fallback to Screen 08 sample

    var showLightbox by remember { mutableStateOf(false) }
    var showVerifyConfirmation by remember { mutableStateOf(false) }
    var showRejectBottomSheet by remember { mutableStateOf(false) }
    var showDispatchDialog by remember { mutableStateOf(false) }
    var showProcessingDialog by remember { mutableStateOf(false) }
    var showDeliveryDialog by remember { mutableStateOf(false) }

    var selectedRejectionReason by remember { mutableStateOf("Unreadable / Incomplete Payment Slip") }
    var otherReasonDetail by remember { mutableStateOf("") }

    var selectedCourier by remember { mutableStateOf("TCS") }
    var trackingNumberInput by remember { mutableStateOf("") }
    var dispatchNoteInput by remember { mutableStateOf("") }

    // Lightbox Fullscreen Modal (Point 45: pinch-to-zoom, pan, rotate 90°, fit to screen)
    if (showLightbox && order?.paymentScreenshotUrl != null) {
        Dialog(
            onDismissRequest = { showLightbox = false },
            properties = DialogProperties(usePlatformDefaultWidth = false)
        ) {
            PaymentSlipLightboxViewer(
                imageUrl = order.paymentScreenshotUrl,
                onClose = { showLightbox = false },
                onShare = {
                    val shareIntent = Intent(Intent.ACTION_SEND).apply {
                        putExtra(Intent.EXTRA_TEXT, "Payment slip for Order #${order.id}: ${order.paymentScreenshotUrl}")
                        type = "text/plain"
                    }
                    context.startActivity(Intent.createChooser(shareIntent, "Share Payment Slip"))
                }
            )
        }
    }

    // Rejection Reasons BottomSheet (Points 49, 51: Destructive Action Safety)
    if (showRejectBottomSheet && order != null) {
        ModalBottomSheet(
            onDismissRequest = { showRejectBottomSheet = false },
            containerColor = DtaTheme.colors.surface
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 16.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Warning,
                        contentDescription = null,
                        tint = DtaTheme.colors.semanticError
                    )
                    Text(
                        text = "Reject Order #${order.id}?",
                        style = DtaTheme.typography.TitleMedium.copy(
                            fontWeight = FontWeight.Bold,
                            color = DtaTheme.colors.semanticError
                        )
                    )
                }

                Text(
                    text = "The reseller will be notified immediately. Please select an official reason:",
                    style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.inkSecondary)
                )

                // Selectable Reasons (Point 49)
                val reasons = listOf(
                    "Unreadable / Incomplete Payment Slip",
                    "Bank Account / Sender Name Mismatch",
                    "Amount Transferred Is Less Than Required",
                    "Duplicate / Reused Transaction ID",
                    "Invalid Delivery Address",
                    "Other"
                )

                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    reasons.forEach { reason ->
                        val isSelected = selectedRejectionReason == reason
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(DtaTheme.shapes.Chip)
                                .background(
                                    if (isSelected) DtaTheme.colors.semanticError.copy(alpha = 0.1f)
                                    else DtaTheme.colors.surfaceAlt
                                )
                                .border(
                                    width = 1.dp,
                                    color = if (isSelected) DtaTheme.colors.semanticError else Color.Transparent,
                                    shape = DtaTheme.shapes.Chip
                                )
                                .clickable { selectedRejectionReason = reason }
                                .padding(horizontal = 12.dp, vertical = 10.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = reason,
                                style = DtaTheme.typography.BodySmall.copy(
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                    color = if (isSelected) DtaTheme.colors.semanticError else DtaTheme.colors.ink
                                )
                            )
                            if (isSelected) {
                                Icon(
                                    imageVector = Icons.Default.CheckCircle,
                                    contentDescription = null,
                                    tint = DtaTheme.colors.semanticError,
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        }
                    }
                }

                if (selectedRejectionReason == "Other") {
                    OutlinedTextField(
                        value = otherReasonDetail,
                        onValueChange = { otherReasonDetail = it },
                        label = { Text("Specific Rejection Details *") },
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                // Confirm / Cancel Buttons (Point 51)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedButton(
                        onClick = { showRejectBottomSheet = false },
                        shape = DtaTheme.shapes.Button,
                        modifier = Modifier.weight(1f).height(48.dp)
                    ) {
                        Text("Cancel")
                    }

                    Button(
                        onClick = {
                            val detail = if (selectedRejectionReason == "Other") otherReasonDetail else null
                            val ok = adminRepository.rejectOrder(
                                order.id,
                                selectedRejectionReason,
                                detail,
                                expectedStatus = order.status
                            )
                            if (ok) {
                                DtaHaptics.action(haptic)
                                showRejectBottomSheet = false
                                onNavigateBack()
                            }
                        },
                        shape = DtaTheme.shapes.Button,
                        colors = ButtonDefaults.buttonColors(containerColor = DtaTheme.colors.semanticError),
                        modifier = Modifier.weight(1f).height(48.dp)
                    ) {
                        Text("Reject Order")
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))
            }
        }
    }

    // Point 96: Verification Confirmation Sheet
    if (showVerifyConfirmation && order != null) {
        AdminConfirmationSheet(
            title = "Verify Customer Payment",
            subtitle = "Review and verify customer payment proof for Order #${order.id}",
            entityId = order.id,
            consequences = listOf(
                "Order state advances to 'Payment Verified'",
                "Warehouse operations team is notified to pick & pack items",
                "Reseller is notified of client payment approval",
                "Action is permanently logged in system audit records"
            ),
            confirmButtonText = "Confirm Payment Verified",
            onConfirm = {
                val ok = adminRepository.verifyPayment(order.id, expectedStatus = order.status)
                if (ok) {
                    DtaHaptics.success(haptic)
                    showVerifyConfirmation = false
                }
            },
            onDismiss = { showVerifyConfirmation = false }
        )
    }

    // Point 96: Move to Processing Confirmation Sheet
    if (showProcessingDialog && order != null) {
        AdminConfirmationSheet(
            title = "Advance to Processing",
            subtitle = "Transfer Order #${order.id} into active fulfillment",
            entityId = order.id,
            consequences = listOf(
                "Order status advances to 'Processing'",
                "Packing slip is locked and ready for courier label generation",
                "Reseller timeline updates to show order in preparation"
            ),
            confirmButtonText = "Confirm Processing",
            onConfirm = {
                val ok = adminRepository.moveToProcessing(order.id, expectedStatus = order.status)
                if (ok) {
                    DtaHaptics.action(haptic)
                    showProcessingDialog = false
                }
            },
            onDismiss = { showProcessingDialog = false }
        )
    }

    // Point 96: Delivery Confirmation Sheet
    if (showDeliveryDialog && order != null) {
        AdminConfirmationSheet(
            title = "Confirm Final Delivery",
            subtitle = "Confirm client has received Order #${order.id}",
            entityId = order.id,
            consequences = listOf(
                "Wholesale margin (+${order.formattedTotalProfit}) is unlocked into partner wallet",
                "Order is permanently recorded as qualifying for rank advancement",
                "Customer and reseller receive delivery completion confirmation",
                "State is finalized and can no longer transition"
            ),
            confirmButtonText = "Confirm Delivery & Release Funds",
            onConfirm = {
                val ok = adminRepository.markDelivered(order.id, expectedStatus = order.status)
                if (ok) {
                    DtaHaptics.milestone(haptic)
                    showDeliveryDialog = false
                }
            },
            onDismiss = { showDeliveryDialog = false }
        )
    }

    // Dispatch Dialog (Point 54)
    if (showDispatchDialog && order != null) {
        AlertDialog(
            onDismissRequest = { showDispatchDialog = false },
            title = {
                Text(
                    text = "Dispatch Order #${order.id}",
                    style = DtaTheme.typography.TitleMedium.copy(fontWeight = FontWeight.Bold)
                )
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(
                        text = "Select courier service and enter tracking number:",
                        style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.inkSecondary)
                    )

                    // Courier Selection
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        items(listOf("TCS", "Leopard", "Trax", "PostEx")) { c ->
                            val isSelected = selectedCourier == c
                            Box(
                                modifier = Modifier
                                    .clip(DtaTheme.shapes.Chip)
                                    .background(if (isSelected) DtaTheme.colors.primary else DtaTheme.colors.surfaceAlt)
                                    .clickable { selectedCourier = c }
                                    .padding(horizontal = 10.dp, vertical = 6.dp)
                            ) {
                                Text(
                                    text = c,
                                    style = DtaTheme.typography.Label.copy(
                                        color = if (isSelected) Color.White else DtaTheme.colors.ink,
                                        fontWeight = FontWeight.Bold
                                    )
                                )
                            }
                        }
                    }

                    OutlinedTextField(
                        value = trackingNumberInput,
                        onValueChange = { trackingNumberInput = it },
                        label = { Text("Tracking Number *") },
                        placeholder = { Text("e.g. TCS123456789") },
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = dispatchNoteInput,
                        onValueChange = { dispatchNoteInput = it },
                        label = { Text("Dispatch Note (Optional)") },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (trackingNumberInput.isNotBlank()) {
                            val ok = adminRepository.dispatchOrder(
                                order.id,
                                selectedCourier,
                                trackingNumberInput,
                                dispatchNoteInput,
                                expectedStatus = order.status
                            )
                            if (ok) {
                                DtaHaptics.success(haptic)
                                showDispatchDialog = false
                                trackingNumberInput = ""
                            }
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = DtaTheme.colors.primary)
                ) {
                    Text("Confirm Dispatch")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDispatchDialog = false }) { Text("Cancel") }
            }
        )
    }

    Scaffold(
        topBar = {
            Surface(
                color = DtaTheme.colors.surface,
                modifier = Modifier
                    .fillMaxWidth()
                    .border(0.5.dp, DtaTheme.colors.line)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .statusBarsPadding()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        IconButton(
                            onClick = onNavigateBack,
                            modifier = Modifier.size(36.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.ArrowBack,
                                contentDescription = "Back",
                                tint = DtaTheme.colors.inkPrimary
                            )
                        }
                        Text(
                            text = "Order Review",
                            style = DtaTheme.typography.ScreenHeading.copy(
                                color = DtaTheme.colors.inkPrimary,
                                fontWeight = FontWeight.Bold,
                                fontSize = 20.sp
                            )
                        )
                    }

                    // Screen 08 Red Admin Badge Pill
                    Box(
                        modifier = Modifier
                            .clip(DtaTheme.shapes.Chip)
                            .background(Color(0xFFDC2626))
                            .padding(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = "Admin",
                            style = DtaTheme.typography.Label.copy(
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 11.sp
                            )
                        )
                    }
                }
            }
        },
        bottomBar = {
            if (order != null) {
                AdminStateAwareActionsBar(
                    order = order,
                    onVerifyPayment = {
                        showVerifyConfirmation = true
                    },
                    onMoveToProcessing = {
                        showProcessingDialog = true
                    },
                    onOpenDispatch = {
                        showDispatchDialog = true
                    },
                    onMarkDelivered = {
                        showDeliveryDialog = true
                    },
                    onReject = {
                        showRejectBottomSheet = true
                    }
                )
            }
        },
        containerColor = DtaTheme.colors.background,
        modifier = modifier.fillMaxSize()
    ) { paddingValues ->
        if (order == null) {
            DtaEmptyState(
                title = "Order Not Found",
                message = "The selected order could not be retrieved.",
                actionLabel = "Back",
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
                // Point 91: Concurrency Conflict Banner
                if (conflictError != null) {
                    item {
                        Surface(
                            color = DtaTheme.colors.errorContainer,
                            shape = DtaTheme.shapes.Card,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier.padding(14.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.SyncProblem,
                                    contentDescription = null,
                                    tint = DtaTheme.colors.error,
                                    modifier = Modifier.size(24.dp)
                                )
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = "Order Updated Elsewhere",
                                        style = DtaTheme.typography.BodyMedium.copy(
                                            fontWeight = FontWeight.Bold,
                                            color = DtaTheme.colors.error
                                        )
                                    )
                                    Text(
                                        text = conflictError ?: "This order was updated elsewhere. Refresh to continue.",
                                        style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.error)
                                    )
                                }
                                DtaButton(
                                    text = "Refresh",
                                    onClick = { adminRepository.clearConflictError() },
                                    modifier = Modifier.height(36.dp),
                                    containerColor = DtaTheme.colors.error
                                )
                            }
                        }
                    }
                }

                // Header (Point 44: Match Screen 08: #DS1008 Pending Review + Admin Badge)
                item {
                    AdminOrderHeaderCard(order = order)
                }

                // Payment Slip Review (Point 45: Prominent preview with tap-to-expand)
                item {
                    PaymentSlipPreviewCard(
                        order = order,
                        onExpandLightbox = { showLightbox = true }
                    )
                }

                // Payment Information (Point 46)
                item {
                    PaymentInfoCard(order = order)
                }

                // Order Details (Point 47)
                item {
                    AdminOrderDetailCard(order = order)
                }

                // Reseller Details for Admin (Point 48)
                item {
                    ResellerAdminDetailCard(order = order)
                }
            }
        }
    }
}

@Composable
private fun AdminOrderHeaderCard(order: ResellerSale) {
    Card(
        shape = DtaTheme.shapes.Card,
        colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
        border = androidx.compose.foundation.BorderStroke(1.dp, DtaTheme.colors.line),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = "#${order.id.uppercase()}",
                        style = DtaTheme.typography.TitleLarge.copy(fontWeight = FontWeight.Black)
                    )

                    // Admin Badge (Point 44)
                    Box(
                        modifier = Modifier
                            .clip(DtaTheme.shapes.Chip)
                            .background(DtaTheme.colors.primaryContainer)
                            .padding(horizontal = 8.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = "Admin Review Desk",
                            style = DtaTheme.typography.Label.copy(
                                color = DtaTheme.colors.primary,
                                fontWeight = FontWeight.Bold,
                                fontSize = 10.sp
                            )
                        )
                    }
                }

                DtaStatusChip(status = order.status)
            }

            Text(
                text = "Created: ${order.createdAt}",
                style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.inkSecondary)
            )
        }
    }
}

@Composable
private fun PaymentSlipPreviewCard(
    order: ResellerSale,
    onExpandLightbox: () -> Unit
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
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Payment Receipt Verification",
                    style = DtaTheme.typography.TitleMedium.copy(
                        fontWeight = FontWeight.Bold,
                        color = DtaTheme.colors.primary
                    )
                )

                TextButton(onClick = onExpandLightbox) {
                    Icon(Icons.Default.Fullscreen, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Tap to Zoom")
                }
            }

            if (order.paymentScreenshotUrl != null) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(200.dp)
                        .clip(DtaTheme.shapes.Card)
                        .background(DtaTheme.colors.surfaceAlt)
                        .clickable(onClick = onExpandLightbox),
                    contentAlignment = Alignment.Center
                ) {
                    AsyncImage(
                        model = order.paymentScreenshotUrl,
                        contentDescription = "Payment Receipt Slip",
                        contentScale = ContentScale.Fit,
                        modifier = Modifier.fillMaxSize()
                    )

                    Box(
                        modifier = Modifier
                            .align(Alignment.BottomEnd)
                            .padding(8.dp)
                            .clip(DtaTheme.shapes.Chip)
                            .background(Color.Black.copy(alpha = 0.6f))
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = "Tap for Lightbox",
                            style = DtaTheme.typography.Label.copy(color = Color.White, fontSize = 10.sp)
                        )
                    }
                }
            } else {
                Text(
                    text = "No receipt image attached.",
                    style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.inkSecondary)
                )
            }
        }
    }
}

@Composable
private fun PaymentSlipLightboxViewer(
    imageUrl: String,
    onClose: () -> Unit,
    onShare: () -> Unit
) {
    var scale by remember { mutableFloatStateOf(1f) }
    var offsetX by remember { mutableFloatStateOf(0f) }
    var offsetY by remember { mutableFloatStateOf(0f) }
    var rotationAngle by remember { mutableFloatStateOf(0f) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
    ) {
        // Top action bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onClose) {
                Icon(Icons.Default.Close, contentDescription = "Close", tint = Color.White)
            }

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                // Rotate 90 deg
                IconButton(onClick = { rotationAngle = (rotationAngle + 90f) % 360f }) {
                    Icon(Icons.Default.RotateRight, contentDescription = "Rotate", tint = Color.White)
                }

                // Reset zoom
                IconButton(onClick = {
                    scale = 1f
                    offsetX = 0f
                    offsetY = 0f
                    rotationAngle = 0f
                }) {
                    Icon(Icons.Default.FitScreen, contentDescription = "Fit Screen", tint = Color.White)
                }

                // Share
                IconButton(onClick = onShare) {
                    Icon(Icons.Default.Share, contentDescription = "Share", tint = Color.White)
                }
            }
        }

        // Pinch-to-zoom & Pan Image Box (Point 45)
        Box(
            modifier = Modifier
                .fillMaxSize()
                .pointerInput(Unit) {
                    detectTransformGestures { _, pan, zoom, _ ->
                        scale = (scale * zoom).coerceIn(1f, 5f)
                        offsetX += pan.x * scale
                        offsetY += pan.y * scale
                    }
                },
            contentAlignment = Alignment.Center
        ) {
            AsyncImage(
                model = imageUrl,
                contentDescription = "Payment Slip Fullscreen",
                contentScale = ContentScale.Fit,
                modifier = Modifier
                    .fillMaxSize()
                    .graphicsLayer(
                        scaleX = scale,
                        scaleY = scale,
                        translationX = offsetX,
                        translationY = offsetY,
                        rotationZ = rotationAngle
                    )
            )
        }
    }
}

@Composable
private fun PaymentInfoCard(order: ResellerSale) {
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
                text = "Payment Information (Manual Verification)",
                style = DtaTheme.typography.TitleMedium.copy(fontWeight = FontWeight.Bold)
            )

            DetailRow("Transaction Amount", order.formattedTotalBill)
            DetailRow("Payment Method", order.paymentMethod)
            DetailRow("Transaction ID", order.transactionReference ?: "Not logged")
            DetailRow("Submitted Date", order.createdAt.take(10))
            DetailRow("Customer Name", order.customerName)
            DetailRow("Reseller Name", order.resellerName)
            DetailRow("Order Total Bill", order.formattedTotalBill)
        }
    }
}

@Composable
private fun AdminOrderDetailCard(order: ResellerSale) {
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
                text = "Order & Customer Details",
                style = DtaTheme.typography.TitleMedium.copy(fontWeight = FontWeight.Bold)
            )

            DetailRow("Customer", order.customerName)
            DetailRow("Phone", order.customerPhone)
            DetailRow("Delivery Address", "${order.customerAddress}, ${order.customerCity}")
            DetailRow("Product", order.productName)
            DetailRow("Quantity", order.quantity.toString())
            DetailRow("Retail Amount", "PKR ${(order.retailPrice * order.quantity).toInt()}")
            DetailRow("Partner Cost (Admin View)", order.formattedPartnerCost)
            DetailRow("Reseller Profit", "+${order.formattedTotalProfit}")
        }
    }
}

@Composable
private fun ResellerAdminDetailCard(order: ResellerSale) {
    Card(
        shape = DtaTheme.shapes.Card,
        colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surfaceAlt),
        border = androidx.compose.foundation.BorderStroke(1.dp, DtaTheme.colors.line),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(
                text = "Reseller Merchant Information",
                style = DtaTheme.typography.TitleMedium.copy(fontWeight = FontWeight.Bold)
            )

            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Box(
                    modifier = Modifier.size(36.dp).clip(CircleShape).background(DtaTheme.colors.primaryContainer),
                    contentAlignment = Alignment.Center
                ) {
                    Text(order.resellerName.take(2).uppercase(), fontWeight = FontWeight.Bold, color = DtaTheme.colors.primary)
                }
                Column {
                    Text(order.resellerName, style = DtaTheme.typography.TitleSmall.copy(fontWeight = FontWeight.Bold))
                    Text("Partner ID: ${order.userId}", style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.inkSecondary))
                }
            }

            DetailRow("Referral Code", order.resellerReferralCode)
            DetailRow("Current Rank", order.resellerRank)
            DetailRow("Account Status", order.resellerStatus)
        }
    }
}

@Composable
private fun DetailRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(label, style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.inkSecondary))
        Text(value, style = DtaTheme.typography.BodySmall.copy(fontWeight = FontWeight.SemiBold, color = DtaTheme.colors.ink))
    }
}

@Composable
private fun AdminStateAwareActionsBar(
    order: ResellerSale,
    onVerifyPayment: () -> Unit,
    onMoveToProcessing: () -> Unit,
    onOpenDispatch: () -> Unit,
    onMarkDelivered: () -> Unit,
    onReject: () -> Unit
) {
    Surface(
        color = DtaTheme.colors.surface,
        modifier = Modifier
            .fillMaxWidth()
            .navigationBarsPadding()
            .border(1.dp, DtaTheme.colors.line)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            when (order.status) {
                OrderStatus.PENDING_VERIFICATION -> {
                    // Reject + Verify Payment (Point 50)
                    OutlinedButton(
                        onClick = onReject,
                        shape = DtaTheme.shapes.Button,
                        border = androidx.compose.foundation.BorderStroke(1.dp, DtaTheme.colors.semanticError),
                        modifier = Modifier.weight(1f).height(48.dp)
                    ) {
                        Text("Reject Order", style = DtaTheme.typography.Button.copy(color = DtaTheme.colors.semanticError))
                    }

                    Button(
                        onClick = onVerifyPayment,
                        shape = DtaTheme.shapes.Button,
                        colors = ButtonDefaults.buttonColors(containerColor = DtaTheme.colors.primary),
                        modifier = Modifier.weight(1f).height(48.dp)
                    ) {
                        Text("Verify Payment", style = DtaTheme.typography.Button.copy(fontWeight = FontWeight.Bold))
                    }
                }

                OrderStatus.PAYMENT_VERIFIED -> {
                    // Move to Processing (Point 50, 53)
                    Button(
                        onClick = onMoveToProcessing,
                        shape = DtaTheme.shapes.Button,
                        colors = ButtonDefaults.buttonColors(containerColor = DtaTheme.colors.primary),
                        modifier = Modifier.fillMaxWidth().height(48.dp)
                    ) {
                        Icon(Icons.Default.Inventory, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Move to Warehouse Processing", style = DtaTheme.typography.Button.copy(fontWeight = FontWeight.Bold))
                    }
                }

                OrderStatus.PROCESSING -> {
                    // Dispatch with Courier (Point 50, 54)
                    Button(
                        onClick = onOpenDispatch,
                        shape = DtaTheme.shapes.Button,
                        colors = ButtonDefaults.buttonColors(containerColor = DtaTheme.colors.primary),
                        modifier = Modifier.fillMaxWidth().height(48.dp)
                    ) {
                        Icon(Icons.Default.LocalShipping, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Dispatch with Courier (TCS / Trax / Leopard)", style = DtaTheme.typography.Button.copy(fontWeight = FontWeight.Bold))
                    }
                }

                OrderStatus.DISPATCHED, OrderStatus.IN_TRANSIT -> {
                    // Mark Delivered (Point 50, 55: releases profit)
                    Button(
                        onClick = onMarkDelivered,
                        shape = DtaTheme.shapes.Button,
                        colors = ButtonDefaults.buttonColors(containerColor = DtaTheme.colors.semanticSuccess),
                        modifier = Modifier.fillMaxWidth().height(48.dp)
                    ) {
                        Icon(Icons.Default.CheckCircle, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Confirm Delivery & Release Profit", style = DtaTheme.typography.Button.copy(fontWeight = FontWeight.Bold))
                    }
                }

                OrderStatus.DELIVERED -> {
                    Box(
                        modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "✓ Order Delivered & Profit Released to Merchant",
                            style = DtaTheme.typography.Label.copy(
                                color = DtaTheme.colors.semanticSuccess,
                                fontWeight = FontWeight.Bold
                            )
                        )
                    }
                }

                OrderStatus.REJECTED -> {
                    Box(
                        modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "✕ Order Payment Rejected",
                            style = DtaTheme.typography.Label.copy(
                                color = DtaTheme.colors.semanticError,
                                fontWeight = FontWeight.Bold
                            )
                        )
                    }
                }
                else -> {}
            }
        }
    }
}
