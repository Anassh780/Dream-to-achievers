package com.dreamtoachievers.app.feature.cart

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.outlined.DeleteOutline
import androidx.compose.material.icons.outlined.LocationOn
import androidx.compose.material.icons.outlined.Payment
import androidx.compose.material.icons.outlined.Percent
import androidx.compose.material.icons.outlined.ShoppingCart
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.dreamtoachievers.app.core.designsystem.components.*
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme
import com.dreamtoachievers.app.core.model.CartItem

@Composable
fun CartScreen(
    viewModel: CartViewModel,
    onNavigateBack: () -> Unit,
    onNavigateToCheckout: () -> Unit,
    onNavigateToMarket: () -> Unit,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()
    var promoInput by remember { mutableStateOf("") }

    val itemCount = uiState.items.sumOf { it.quantity }
    val screenTitle = if (itemCount > 0) "My Cart ($itemCount)" else "My Cart"

    Scaffold(
        topBar = {
            DtaSecondaryTopBar(
                title = screenTitle,
                onBackClick = onNavigateBack
            )
        },
        bottomBar = {
            if (uiState.items.isNotEmpty()) {
                Surface(
                    color = DtaTheme.colors.surface,
                    modifier = Modifier
                        .fillMaxWidth()
                        .navigationBarsPadding()
                        .border(1.dp, DtaTheme.colors.line)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = DtaTheme.spacing.ScreenHorizontal, vertical = 14.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Total Amount",
                                style = DtaTheme.typography.BodyMedium.copy(color = DtaTheme.colors.inkSecondary)
                            )
                            Text(
                                text = "Rs ${uiState.total.toInt().toString().reversed().chunked(3).joinToString(",").reversed()}",
                                style = DtaTheme.typography.SectionHeading.copy(
                                    color = DtaTheme.colors.primary,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 20.sp
                                )
                            )
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        DtaPrimaryButton(
                            text = "Proceed to Checkout",
                            trailingIcon = Icons.AutoMirrored.Filled.ArrowForward,
                            onClick = onNavigateToCheckout
                        )
                    }
                }
            }
        },
        containerColor = DtaTheme.colors.background,
        modifier = modifier.fillMaxSize()
    ) { paddingValues ->
        if (uiState.items.isEmpty()) {
            DtaEmptyState(
                title = "Your cart is empty",
                description = "Discover executive merchandise, smart wearables & lifestyle products you'll love.",
                icon = Icons.Outlined.ShoppingCart,
                actionButtonText = "Browse Market",
                onActionClick = onNavigateToMarket,
                modifier = Modifier.padding(paddingValues)
            )
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentPadding = PaddingValues(
                    start = DtaTheme.spacing.ScreenHorizontal,
                    end = DtaTheme.spacing.ScreenHorizontal,
                    top = 12.dp,
                    bottom = 24.dp
                ),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                // Cart items
                items(uiState.items, key = { it.product.id }) { item ->
                    CartItemRow(
                        item = item,
                        onQuantityChange = { viewModel.updateQuantity(item.product.id, it) },
                        onRemove = { viewModel.removeItem(item.product.id) }
                    )
                }

                // Promo Voucher Card with % Badge (Reference 1 Screen 4)
                item {
                    Spacer(modifier = Modifier.height(4.dp))

                    Card(
                        shape = DtaTheme.shapes.Card,
                        colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(1.dp, DtaTheme.colors.line, DtaTheme.shapes.Card)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(24.dp)
                                        .clip(DtaTheme.shapes.Small)
                                        .background(DtaTheme.colors.primaryContainer),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = Icons.Outlined.Percent,
                                        contentDescription = null,
                                        tint = DtaTheme.colors.primary,
                                        modifier = Modifier.size(14.dp)
                                    )
                                }
                                Text(
                                    text = "Apply Promo Code",
                                    style = DtaTheme.typography.CardTitle.copy(
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                )
                            }

                            Spacer(modifier = Modifier.height(10.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                OutlinedTextField(
                                    value = promoInput,
                                    onValueChange = { promoInput = it },
                                    placeholder = { Text("e.g. DTA10") },
                                    singleLine = true,
                                    shape = DtaTheme.shapes.Input,
                                    colors = OutlinedTextFieldDefaults.colors(
                                        focusedBorderColor = DtaTheme.colors.primary,
                                        unfocusedBorderColor = DtaTheme.colors.line
                                    ),
                                    modifier = Modifier.weight(1f)
                                )

                                DtaPrimaryButton(
                                    text = "Apply",
                                    onClick = {
                                        if (promoInput.isNotBlank()) {
                                            viewModel.applyPromoCode(promoInput)
                                        }
                                    },
                                    modifier = Modifier.width(90.dp)
                                )
                            }

                            if (uiState.promoSuccess != null) {
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(
                                    text = uiState.promoSuccess!!,
                                    color = DtaTheme.colors.success,
                                    style = DtaTheme.typography.Metadata
                                )
                            }
                            if (uiState.promoError != null) {
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(
                                    text = uiState.promoError!!,
                                    color = DtaTheme.colors.error,
                                    style = DtaTheme.typography.Metadata
                                )
                            }
                        }
                    }
                }

                // Financial Summary Card
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
                            Text(
                                text = "Order Summary",
                                style = DtaTheme.typography.SectionHeading.copy(
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            )

                            Divider(color = DtaTheme.colors.line)

                            SummaryRow("Subtotal", "Rs ${uiState.subtotal.toInt().toString().reversed().chunked(3).joinToString(",").reversed()}")

                            if (uiState.discount > 0) {
                                SummaryRow("Wholesale Discount", "- Rs ${uiState.discount.toInt()}", isDiscount = true)
                            }

                            SummaryRow(
                                "Delivery Fee",
                                if (uiState.deliveryFee == 0.0) "FREE" else "Rs ${uiState.deliveryFee.toInt()}"
                            )

                            Divider(color = DtaTheme.colors.line)

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "Total Payable",
                                    style = DtaTheme.typography.CardTitle.copy(
                                        color = DtaTheme.colors.inkPrimary,
                                        fontWeight = FontWeight.Bold
                                    )
                                )
                                Text(
                                    text = "Rs ${uiState.total.toInt().toString().reversed().chunked(3).joinToString(",").reversed()}",
                                    style = DtaTheme.typography.CardTitle.copy(
                                        color = DtaTheme.colors.primary,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 18.sp
                                    )
                                )
                            }
                        }
                    }
                }

                // Shipping Address Selector Card (Reference 1 Screen 4)
                item {
                    Card(
                        shape = DtaTheme.shapes.Card,
                        colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(1.dp, DtaTheme.colors.line, DtaTheme.shapes.Card)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Outlined.LocationOn,
                                        contentDescription = null,
                                        tint = DtaTheme.colors.primary,
                                        modifier = Modifier.size(18.dp)
                                    )
                                    Text(
                                        text = "Shipping Address",
                                        style = DtaTheme.typography.CardTitle.copy(
                                            fontSize = 14.sp,
                                            fontWeight = FontWeight.SemiBold
                                        )
                                    )
                                }
                                Text(
                                    text = "Change",
                                    style = DtaTheme.typography.Label.copy(
                                        color = DtaTheme.colors.primary,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 12.sp
                                    ),
                                    modifier = Modifier.clickable { }
                                )
                            }

                            Spacer(modifier = Modifier.height(8.dp))

                            Text(
                                text = "Home • Flat 4B, Sector G-11/3, Islamabad, Pakistan",
                                style = DtaTheme.typography.Metadata.copy(
                                    color = DtaTheme.colors.inkSecondary,
                                    lineHeight = 18.sp
                                )
                            )
                        }
                    }
                }

                // Payment Method Selector Card (Reference 1 Screen 4)
                item {
                    Card(
                        shape = DtaTheme.shapes.Card,
                        colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(1.dp, DtaTheme.colors.line, DtaTheme.shapes.Card)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Outlined.Payment,
                                        contentDescription = null,
                                        tint = DtaTheme.colors.primary,
                                        modifier = Modifier.size(18.dp)
                                    )
                                    Text(
                                        text = "Payment Method",
                                        style = DtaTheme.typography.CardTitle.copy(
                                            fontSize = 14.sp,
                                            fontWeight = FontWeight.SemiBold
                                        )
                                    )
                                }
                                Text(
                                    text = "Change",
                                    style = DtaTheme.typography.Label.copy(
                                        color = DtaTheme.colors.primary,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 12.sp
                                    ),
                                    modifier = Modifier.clickable { }
                                )
                            }

                            Spacer(modifier = Modifier.height(8.dp))

                            Text(
                                text = "EasyPaisa / JazzCash / Bank Transfer (Screenshot Proof)",
                                style = DtaTheme.typography.Metadata.copy(
                                    color = DtaTheme.colors.inkSecondary
                                )
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun CartItemRow(
    item: CartItem,
    onQuantityChange: (Int) -> Unit,
    onRemove: () -> Unit
) {
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
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(76.dp)
                    .clip(DtaTheme.shapes.Small)
                    .background(DtaTheme.colors.surfaceAlt)
            ) {
                AsyncImage(
                    model = item.product.imageUrl,
                    contentDescription = item.product.name,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.Top
                ) {
                    Text(
                        text = item.product.name,
                        style = DtaTheme.typography.CardTitle.copy(
                            color = DtaTheme.colors.inkPrimary,
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 14.sp
                        ),
                        maxLines = 1,
                        modifier = Modifier.weight(1f)
                    )

                    IconButton(
                        onClick = onRemove,
                        modifier = Modifier.size(24.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Outlined.DeleteOutline,
                            contentDescription = "Remove",
                            tint = DtaTheme.colors.inkMuted,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(4.dp))

                DtaPriceText(price = item.product.retailPrice, fontSize = 14.sp)

                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    DtaQuantitySelector(
                        quantity = item.quantity,
                        onQuantityChange = onQuantityChange
                    )

                    Text(
                        text = item.formattedTotalPrice,
                        style = DtaTheme.typography.CardTitle.copy(
                            color = DtaTheme.colors.primary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp
                        )
                    )
                }
            }
        }
    }
}

@Composable
private fun SummaryRow(
    label: String,
    value: String,
    isDiscount: Boolean = false
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = label,
            style = DtaTheme.typography.Metadata.copy(color = DtaTheme.colors.inkSecondary)
        )
        Text(
            text = value,
            style = DtaTheme.typography.Metadata.copy(
                color = if (isDiscount) DtaTheme.colors.success else DtaTheme.colors.inkPrimary,
                fontWeight = FontWeight.SemiBold
            )
        )
    }
}
