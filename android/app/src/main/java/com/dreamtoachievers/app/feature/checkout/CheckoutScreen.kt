package com.dreamtoachievers.app.feature.checkout

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.dreamtoachievers.app.core.designsystem.components.DtaPrimaryButton
import com.dreamtoachievers.app.core.designsystem.components.DtaSecondaryTopBar
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme
import com.dreamtoachievers.app.core.firebase.FirebaseConfig
import com.dreamtoachievers.app.core.model.PaymentMethodType

@Composable
fun CheckoutScreen(
    viewModel: CheckoutViewModel,
    onNavigateBack: () -> Unit,
    onOrderPlaced: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current

    // Android Modern Photo Picker Launcher
    val photoPickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia()
    ) { uri ->
        viewModel.onReceiptSelected(uri)
    }

    LaunchedEffect(uiState.submittedOrderId) {
        uiState.submittedOrderId?.let { orderId ->
            onOrderPlaced(orderId)
        }
    }

    val selectedAccount = FirebaseConfig.OFFICIAL_PAYMENT_ACCOUNTS.find {
        it.type == uiState.selectedPaymentMethod
    } ?: FirebaseConfig.OFFICIAL_PAYMENT_ACCOUNTS.first()

    Scaffold(
        topBar = {
            DtaSecondaryTopBar(
                title = "Checkout & Payment",
                onBackClick = onNavigateBack
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
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = DtaTheme.spacing.ScreenHorizontal, vertical = 12.dp)
                ) {
                    DtaPrimaryButton(
                        text = "Confirm & Place Order",
                        isLoading = uiState.isSubmitting,
                        onClick = { viewModel.submitOrder() }
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
            contentPadding = PaddingValues(
                start = DtaTheme.spacing.ScreenHorizontal,
                end = DtaTheme.spacing.ScreenHorizontal,
                top = 12.dp,
                bottom = 24.dp
            ),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Error notice
            if (uiState.error != null) {
                item {
                    Surface(
                        shape = DtaTheme.shapes.Small,
                        color = DtaTheme.colors.surfaceAlt,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            text = uiState.error!!,
                            color = DtaTheme.colors.error,
                            style = DtaTheme.typography.Metadata,
                            modifier = Modifier.padding(12.dp)
                        )
                    }
                }
            }

            // 1. Delivery Details
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
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Outlined.LocalShipping,
                                contentDescription = null,
                                tint = DtaTheme.colors.primary,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Delivery Information",
                                style = DtaTheme.typography.SectionHeading.copy(
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            )
                        }

                        OutlinedTextField(
                            value = uiState.fullName,
                            onValueChange = { viewModel.onFullNameChanged(it) },
                            label = { Text("Full Recipient Name") },
                            singleLine = true,
                            shape = DtaTheme.shapes.Input,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = DtaTheme.colors.primary,
                                unfocusedBorderColor = DtaTheme.colors.line
                            ),
                            modifier = Modifier.fillMaxWidth()
                        )

                        OutlinedTextField(
                            value = uiState.phone,
                            onValueChange = { viewModel.onPhoneChanged(it) },
                            label = { Text("WhatsApp / Phone Number") },
                            placeholder = { Text("0300 1234567") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                            singleLine = true,
                            shape = DtaTheme.shapes.Input,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = DtaTheme.colors.primary,
                                unfocusedBorderColor = DtaTheme.colors.line
                            ),
                            modifier = Modifier.fillMaxWidth()
                        )

                        OutlinedTextField(
                            value = uiState.address,
                            onValueChange = { viewModel.onAddressChanged(it) },
                            label = { Text("Complete Street Address") },
                            placeholder = { Text("House #, Street, Area") },
                            shape = DtaTheme.shapes.Input,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = DtaTheme.colors.primary,
                                unfocusedBorderColor = DtaTheme.colors.line
                            ),
                            modifier = Modifier.fillMaxWidth()
                        )

                        OutlinedTextField(
                            value = uiState.city,
                            onValueChange = { viewModel.onCityChanged(it) },
                            label = { Text("City (e.g. Lahore, Karachi, Islamabad)") },
                            singleLine = true,
                            shape = DtaTheme.shapes.Input,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = DtaTheme.colors.primary,
                                unfocusedBorderColor = DtaTheme.colors.line
                            ),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }
            }

            // 2. Payment Method Selection
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
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Outlined.Payment,
                                contentDescription = null,
                                tint = DtaTheme.colors.primary,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Select Payment Method",
                                style = DtaTheme.typography.SectionHeading.copy(
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            )
                        }

                        listOf(
                            PaymentMethodType.BANK_TRANSFER,
                            PaymentMethodType.EASYPAISA,
                            PaymentMethodType.JAZZCASH,
                            PaymentMethodType.SADAPAY,
                            PaymentMethodType.NAYAPAY
                        ).forEach { method ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(DtaTheme.shapes.Button)
                                    .background(
                                        if (uiState.selectedPaymentMethod == method) DtaTheme.colors.primaryContainer
                                        else DtaTheme.colors.surfaceAlt
                                    )
                                    .clickable { viewModel.onPaymentMethodSelected(method) }
                                    .padding(horizontal = 14.dp, vertical = 10.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = method.title,
                                    style = DtaTheme.typography.Body.copy(
                                        fontWeight = if (uiState.selectedPaymentMethod == method) FontWeight.Bold else FontWeight.Medium,
                                        color = if (uiState.selectedPaymentMethod == method) DtaTheme.colors.primary else DtaTheme.colors.inkPrimary
                                    )
                                )
                                RadioButton(
                                    selected = uiState.selectedPaymentMethod == method,
                                    onClick = { viewModel.onPaymentMethodSelected(method) },
                                    colors = RadioButtonDefaults.colors(selectedColor = DtaTheme.colors.primary)
                                )
                            }
                        }

                        // Official Bank / Account Details Card
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(DtaTheme.shapes.Small)
                                .background(DtaTheme.colors.surfaceAlt)
                                .padding(12.dp),
                            verticalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Text(
                                text = "Transfer To: ${selectedAccount.bankName}",
                                style = DtaTheme.typography.CardTitle.copy(
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = DtaTheme.colors.primary
                                )
                            )
                            Text(
                                text = "Title: ${selectedAccount.accountTitle}",
                                style = DtaTheme.typography.Metadata
                            )

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "Account: ${selectedAccount.accountNumber}",
                                    style = DtaTheme.typography.Metadata.copy(fontWeight = FontWeight.Bold)
                                )

                                TextButton(
                                    onClick = {
                                        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                        clipboard.setPrimaryClip(ClipData.newPlainText("Account", selectedAccount.accountNumber))
                                        Toast.makeText(context, "Account number copied!", Toast.LENGTH_SHORT).show()
                                    }
                                ) {
                                    Text("Copy", color = DtaTheme.colors.primary)
                                }
                            }

                            if (selectedAccount.iban != null) {
                                Text(
                                    text = "IBAN: ${selectedAccount.iban}",
                                    style = DtaTheme.typography.Metadata
                                )
                            }
                        }
                    }
                }
            }

            // 3. Payment Receipt Slip Upload (Photo Picker)
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
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Outlined.ReceiptLong,
                                contentDescription = null,
                                tint = DtaTheme.colors.primary,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Payment Transfer Receipt",
                                style = DtaTheme.typography.SectionHeading.copy(
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            )
                        }

                        Text(
                            text = "Upload the transfer screenshot / receipt from your banking or wallet app for instant verification.",
                            style = DtaTheme.typography.Metadata.copy(color = DtaTheme.colors.inkSecondary)
                        )

                        if (uiState.paymentReceiptUri != null) {
                            // Preview box with remove action
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(180.dp)
                                    .clip(DtaTheme.shapes.Small)
                                    .background(DtaTheme.colors.surfaceAlt)
                            ) {
                                AsyncImage(
                                    model = uiState.paymentReceiptUri,
                                    contentDescription = "Receipt Screenshot",
                                    modifier = Modifier.fillMaxSize(),
                                    contentScale = ContentScale.Crop
                                )

                                IconButton(
                                    onClick = { viewModel.onReceiptSelected(null) },
                                    modifier = Modifier
                                        .align(Alignment.TopEnd)
                                        .padding(8.dp)
                                        .size(36.dp)
                                        .background(DtaTheme.colors.surface.copy(alpha = 0.9f), DtaTheme.shapes.Full)
                                ) {
                                    Icon(
                                        imageVector = Icons.Outlined.Close,
                                        contentDescription = "Remove receipt",
                                        tint = DtaTheme.colors.error
                                    )
                                }
                            }
                        } else {
                            // Upload Button invoking Android Photo Picker
                            OutlinedButton(
                                onClick = {
                                    photoPickerLauncher.launch(
                                        PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)
                                    )
                                },
                                shape = DtaTheme.shapes.Button,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Icon(
                                    imageVector = Icons.Outlined.UploadFile,
                                    contentDescription = null,
                                    tint = DtaTheme.colors.primary
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "Select Receipt Slip Image",
                                    color = DtaTheme.colors.primary,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
