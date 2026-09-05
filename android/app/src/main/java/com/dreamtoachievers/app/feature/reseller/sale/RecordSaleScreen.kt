package com.dreamtoachievers.app.feature.reseller.sale

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.dreamtoachievers.app.core.designsystem.components.*
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme
import com.dreamtoachievers.app.core.designsystem.util.DtaHaptics
import com.dreamtoachievers.app.core.model.PartnerProduct

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RecordSaleScreen(
    viewModel: RecordSaleViewModel,
    onNavigateBack: () -> Unit,
    onSaleRecorded: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val haptic = LocalHapticFeedback.current
    val state by viewModel.uiState.collectAsState()

    // Android 13+ modern Photo Picker
    val photoPickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia()
    ) { uri: Uri? ->
        viewModel.onPaymentSlipSelected(uri)
    }

    var showSuccessDialog by remember { mutableStateOf(false) }

    if (showSuccessDialog) {
        AlertDialog(
            onDismissRequest = {
                showSuccessDialog = false
                onNavigateBack()
            },
            icon = {
                Icon(
                    imageVector = Icons.Default.CheckCircle,
                    contentDescription = null,
                    tint = DtaTheme.colors.primary,
                    modifier = Modifier.size(48.dp)
                )
            },
            title = {
                Text(
                    text = "Sale Submitted!",
                    style = DtaTheme.typography.TitleLarge.copy(fontWeight = FontWeight.Bold)
                )
            },
            text = {
                Text(
                    text = "The order has been placed into the verification queue. Admin will verify customer payment slip and dispatch with courier.",
                    style = DtaTheme.typography.BodyMedium
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        showSuccessDialog = false
                        onNavigateBack()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = DtaTheme.colors.primary)
                ) {
                    Text("Go to Dashboard")
                }
            }
        )
    }

    Scaffold(
        topBar = {
            DtaTopAppBar(
                title = "Record Customer Sale",
                subtitle = "Enter client details and upload payment receipt",
                navigationIcon = Icons.Default.ArrowBack,
                onNavigationClick = onNavigateBack
            )
        },
        bottomBar = {
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
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // Live summary pill
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Estimated Net Profit:",
                            style = DtaTheme.typography.BodyMedium.copy(color = DtaTheme.colors.inkSecondary)
                        )
                        Text(
                            text = "PKR ${state.estimatedProfit.toInt().toString().reversed().chunked(3).joinToString(",").reversed()}",
                            style = DtaTheme.typography.TitleMedium.copy(
                                color = DtaTheme.colors.primary,
                                fontWeight = FontWeight.Bold
                            )
                        )
                    }

                    DtaPrimaryButton(
                        text = if (state.isSubmitting) "Submitting..." else "Submit Order for Verification",
                        onClick = {
                            viewModel.submitSale {
                                DtaHaptics.success(haptic)
                                showSuccessDialog = true
                            }
                        },
                        enabled = state.canSubmit,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }
        },
        containerColor = DtaTheme.colors.background,
        modifier = modifier.fillMaxSize()
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(18.dp)
        ) {
            // 1. Select Product Section
            item {
                SectionTitle("1. Select Wholesale Product")
                Spacer(modifier = Modifier.height(8.dp))

                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(state.products) { product ->
                        val isSelected = state.selectedProduct?.id == product.id
                        Card(
                            shape = DtaTheme.shapes.Card,
                            colors = CardDefaults.cardColors(
                                containerColor = if (isSelected) DtaTheme.colors.primaryContainer else DtaTheme.colors.surface
                            ),
                            border = androidx.compose.foundation.BorderStroke(
                                width = if (isSelected) 2.dp else 1.dp,
                                color = if (isSelected) DtaTheme.colors.primary else DtaTheme.colors.line
                            ),
                            modifier = Modifier
                                .width(200.dp)
                                .clickable { viewModel.onProductSelected(product) }
                        ) {
                            Column(
                                modifier = Modifier.padding(10.dp),
                                verticalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(90.dp)
                                        .clip(DtaTheme.shapes.Image)
                                        .background(DtaTheme.colors.surfaceAlt)
                                ) {
                                    AsyncImage(
                                        model = product.imageUrl,
                                        contentDescription = product.name,
                                        contentScale = ContentScale.Crop,
                                        modifier = Modifier.fillMaxSize()
                                    )
                                }
                                Text(
                                    text = product.name,
                                    style = DtaTheme.typography.TitleSmall.copy(fontWeight = FontWeight.Bold),
                                    maxLines = 1
                                )
                                Text(
                                    text = "Wholesale: ${product.formattedPartnerPrice}",
                                    style = DtaTheme.typography.BodySmall.copy(
                                        color = DtaTheme.colors.primary,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                )
                            }
                        }
                    }
                }
            }

            // 2. Quantity & Custom Selling Price
            item {
                SectionTitle("2. Quantity & Retail Pricing")
                Spacer(modifier = Modifier.height(8.dp))

                Card(
                    shape = DtaTheme.shapes.Card,
                    colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
                    border = androidx.compose.foundation.BorderStroke(1.dp, DtaTheme.colors.line),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(14.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        // Quantity Stepper
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = "Quantity",
                                    style = DtaTheme.typography.TitleSmall.copy(fontWeight = FontWeight.Bold)
                                )
                                Text(
                                    text = "Number of units for this customer",
                                    style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.inkSecondary)
                                )
                            }

                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                IconButton(
                                    onClick = { viewModel.onQuantityChanged(-1) },
                                    modifier = Modifier
                                        .size(36.dp)
                                        .clip(CircleShape)
                                        .background(DtaTheme.colors.surfaceAlt)
                                ) {
                                    Icon(Icons.Default.Remove, contentDescription = "Decrease", tint = DtaTheme.colors.ink)
                                }
                                Text(
                                    text = state.quantity.toString(),
                                    style = DtaTheme.typography.TitleMedium.copy(fontWeight = FontWeight.Bold)
                                )
                                IconButton(
                                    onClick = { viewModel.onQuantityChanged(1) },
                                    modifier = Modifier
                                        .size(36.dp)
                                        .clip(CircleShape)
                                        .background(DtaTheme.colors.surfaceAlt)
                                ) {
                                    Icon(Icons.Default.Add, contentDescription = "Increase", tint = DtaTheme.colors.ink)
                                }
                            }
                        }

                        Divider(color = DtaTheme.colors.line)

                        // Selling Price Input
                        OutlinedTextField(
                            value = state.sellingPriceInput,
                            onValueChange = { viewModel.onSellingPriceChanged(it) },
                            label = { Text("Customer Selling Price (PKR per unit)") },
                            supportingText = {
                                if (!state.isPriceValid) {
                                    Text(
                                        text = "Selling price cannot be below partner wholesale price (${state.selectedProduct?.formattedPartnerPrice})",
                                        color = DtaTheme.colors.semanticError
                                    )
                                } else {
                                    Text("Suggested retail: ${state.selectedProduct?.formattedSuggestedPrice}")
                                }
                            },
                            isError = !state.isPriceValid,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }
            }

            // 3. Customer Delivery Details
            item {
                SectionTitle("3. Customer Delivery Information")
                Spacer(modifier = Modifier.height(8.dp))

                Card(
                    shape = DtaTheme.shapes.Card,
                    colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
                    border = androidx.compose.foundation.BorderStroke(1.dp, DtaTheme.colors.line),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(14.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        OutlinedTextField(
                            value = state.customerName,
                            onValueChange = { viewModel.onCustomerNameChanged(it) },
                            label = { Text("Customer Full Name *") },
                            leadingIcon = { Icon(Icons.Default.Person, contentDescription = null) },
                            modifier = Modifier.fillMaxWidth()
                        )

                        OutlinedTextField(
                            value = state.customerPhone,
                            onValueChange = { viewModel.onCustomerPhoneChanged(it) },
                            label = { Text("WhatsApp / Mobile Number *") },
                            placeholder = { Text("e.g. 0300 1234567") },
                            leadingIcon = { Icon(Icons.Default.Phone, contentDescription = null) },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                            modifier = Modifier.fillMaxWidth()
                        )

                        OutlinedTextField(
                            value = state.customerCity,
                            onValueChange = { viewModel.onCustomerCityChanged(it) },
                            label = { Text("Destination City *") },
                            placeholder = { Text("e.g. Islamabad, Lahore, Karachi") },
                            leadingIcon = { Icon(Icons.Default.LocationCity, contentDescription = null) },
                            modifier = Modifier.fillMaxWidth()
                        )

                        OutlinedTextField(
                            value = state.customerAddress,
                            onValueChange = { viewModel.onCustomerAddressChanged(it) },
                            label = { Text("Full Street Delivery Address *") },
                            leadingIcon = { Icon(Icons.Default.Home, contentDescription = null) },
                            minLines = 2,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }
            }

            // 4. Client Payment Slip Proof
            item {
                SectionTitle("4. Client Payment Slip / Receipt")
                Spacer(modifier = Modifier.height(8.dp))

                Card(
                    shape = DtaTheme.shapes.Card,
                    colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
                    border = androidx.compose.foundation.BorderStroke(1.dp, DtaTheme.colors.line),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(14.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Text(
                            text = "Upload the payment screenshot sent by your customer (EasyPaisa, JazzCash, or Bank Transfer).",
                            style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.inkSecondary)
                        )

                        if (state.paymentSlipUri != null) {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(160.dp)
                                    .clip(DtaTheme.shapes.Card)
                                    .background(DtaTheme.colors.surfaceAlt)
                            ) {
                                AsyncImage(
                                    model = state.paymentSlipUri,
                                    contentDescription = "Payment Slip",
                                    contentScale = ContentScale.Crop,
                                    modifier = Modifier.fillMaxSize()
                                )
                                IconButton(
                                    onClick = { viewModel.onPaymentSlipSelected(null) },
                                    modifier = Modifier
                                        .align(Alignment.TopEnd)
                                        .padding(8.dp)
                                        .background(Color.Black.copy(alpha = 0.6f), CircleShape)
                                ) {
                                    Icon(Icons.Default.Close, contentDescription = "Remove", tint = Color.White)
                                }
                            }
                        } else {
                            OutlinedButton(
                                onClick = {
                                    photoPickerLauncher.launch(
                                        PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)
                                    )
                                },
                                shape = DtaTheme.shapes.Button,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(50.dp)
                            ) {
                                Icon(Icons.Default.UploadFile, contentDescription = null, tint = DtaTheme.colors.primary)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "Choose Payment Slip Image",
                                    style = DtaTheme.typography.Button.copy(color = DtaTheme.colors.primary)
                                )
                            }
                        }

                        OutlinedTextField(
                            value = state.paymentNotes,
                            onValueChange = { viewModel.onPaymentNotesChanged(it) },
                            label = { Text("Transaction Reference / Notes") },
                            placeholder = { Text("e.g. EasyPaisa TRX # 882199") },
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun SectionTitle(text: String) {
    Text(
        text = text,
        style = DtaTheme.typography.TitleMedium.copy(
            fontWeight = FontWeight.Bold,
            color = DtaTheme.colors.primary
        )
    )
}
