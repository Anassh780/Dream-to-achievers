package com.dreamtoachievers.app.feature.reseller.wallet

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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dreamtoachievers.app.core.designsystem.components.*
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme
import com.dreamtoachievers.app.core.model.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ResellerWalletScreen(
    viewModel: ResellerWalletViewModel,
    onNavigateBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val state by viewModel.uiState.collectAsState()
    var showSuccessSnackbar by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            DtaTopAppBar(
                title = "Merchant Wallet & Payout",
                subtitle = "Track realized profits and withdraw to mobile wallet or bank"
            )
        },
        snackbarHost = {
            if (showSuccessSnackbar) {
                Snackbar(
                    modifier = Modifier.padding(16.dp),
                    action = {
                        TextButton(onClick = { showSuccessSnackbar = false }) {
                            Text("OK", color = DtaTheme.colors.accent)
                        }
                    }
                ) {
                    Text("Payout request submitted successfully for verification!")
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
            contentPadding = PaddingValues(start = 16.dp, end = 16.dp, bottom = 80.dp),
            verticalArrangement = Arrangement.spacedBy(18.dp)
        ) {
            // 1. Hero Balance Card (Available, Realized, Pending, Withdrawn)
            item {
                WalletHeroCard(ledger = state.ledger)
            }

            // 2. Request Payout Section
            item {
                PayoutRequestCard(
                    amountInput = state.amountInput,
                    onAmountChange = { viewModel.onAmountChanged(it) },
                    selectedMethodType = state.selectedMethodType,
                    onMethodSelect = { viewModel.onMethodTypeSelected(it) },
                    accountTitle = state.accountTitle,
                    onAccountTitleChange = { viewModel.onAccountTitleChanged(it) },
                    accountNumber = state.accountNumber,
                    onAccountNumberChange = { viewModel.onAccountNumberChanged(it) },
                    bankName = state.bankName,
                    onBankNameChange = { viewModel.onBankNameChanged(it) },
                    isAmountValid = state.isAmountValid,
                    canSubmit = state.canSubmit,
                    isSubmitting = state.isSubmitting,
                    errorMessage = state.errorMessage,
                    onSubmit = {
                        viewModel.submitWithdrawalRequest {
                            showSuccessSnackbar = true
                        }
                    }
                )
            }

            // 3. Withdrawal History Header
            item {
                Text(
                    text = "Payout History & Ledger",
                    style = DtaTheme.typography.TitleLarge.copy(
                        fontWeight = FontWeight.Bold,
                        color = DtaTheme.colors.ink
                    )
                )
            }

            if (state.withdrawals.isEmpty()) {
                item {
                    DtaEmptyState(
                        title = "No Payout Requests",
                        message = "Your requested payouts and ledger disbursements will appear here."
                    )
                }
            } else {
                items(state.withdrawals) { withdrawal ->
                    WithdrawalHistoryCard(withdrawal = withdrawal)
                }
            }
        }
    }
}

@Composable
private fun WalletHeroCard(ledger: WalletLedger) {
    Card(
        shape = DtaTheme.shapes.Hero,
        colors = CardDefaults.cardColors(containerColor = Color.Transparent),
        modifier = Modifier.fillMaxWidth()
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    brush = Brush.verticalGradient(
                        colors = listOf(
                            DtaTheme.colors.primary,
                            DtaTheme.colors.primaryDark
                        )
                    )
                )
                .padding(22.dp)
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(18.dp)) {
                Column {
                    Text(
                        text = "AVAILABLE BALANCE FOR PAYOUT",
                        style = DtaTheme.typography.Label.copy(
                            color = Color.White.copy(alpha = 0.7f),
                            letterSpacing = 1.sp,
                            fontSize = 11.sp
                        )
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = ledger.formattedAvailable,
                        style = DtaTheme.typography.DisplayLarge.copy(
                            color = Color.White,
                            fontWeight = FontWeight.Black
                        )
                    )
                }

                Divider(color = Color.White.copy(alpha = 0.15f))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    // Realized Profit
                    Column {
                        Text(
                            text = "Realized Profit",
                            style = DtaTheme.typography.Label.copy(
                                color = Color.White.copy(alpha = 0.7f),
                                fontSize = 11.sp
                            )
                        )
                        Text(
                            text = ledger.formattedRealized,
                            style = DtaTheme.typography.TitleSmall.copy(
                                color = Color.White,
                                fontWeight = FontWeight.Bold
                            )
                        )
                    }

                    // Pending Profit
                    Column {
                        Text(
                            text = "Pending In-Transit",
                            style = DtaTheme.typography.Label.copy(
                                color = Color.White.copy(alpha = 0.7f),
                                fontSize = 11.sp
                            )
                        )
                        Text(
                            text = ledger.formattedPending,
                            style = DtaTheme.typography.TitleSmall.copy(
                                color = DtaTheme.colors.accentLight,
                                fontWeight = FontWeight.Bold
                            )
                        )
                    }

                    // Total Withdrawn
                    Column {
                        Text(
                            text = "Total Withdrawn",
                            style = DtaTheme.typography.Label.copy(
                                color = Color.White.copy(alpha = 0.7f),
                                fontSize = 11.sp
                            )
                        )
                        Text(
                            text = ledger.formattedWithdrawn,
                            style = DtaTheme.typography.TitleSmall.copy(
                                color = Color.White.copy(alpha = 0.85f),
                                fontWeight = FontWeight.SemiBold
                            )
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun PayoutRequestCard(
    amountInput: String,
    onAmountChange: (String) -> Unit,
    selectedMethodType: PaymentMethodType,
    onMethodSelect: (PaymentMethodType) -> Unit,
    accountTitle: String,
    onAccountTitleChange: (String) -> Unit,
    accountNumber: String,
    onAccountNumberChange: (String) -> Unit,
    bankName: String,
    onBankNameChange: (String) -> Unit,
    isAmountValid: Boolean,
    canSubmit: Boolean,
    isSubmitting: Boolean,
    errorMessage: String?,
    onSubmit: () -> Unit
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
            Text(
                text = "Request Profit Payout",
                style = DtaTheme.typography.TitleMedium.copy(fontWeight = FontWeight.Bold)
            )

            Text(
                text = "Minimum withdrawal is PKR 500. Funds are disbursed within 24 hours to your verified account.",
                style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.inkSecondary)
            )

            // Amount Input
            OutlinedTextField(
                value = amountInput,
                onValueChange = onAmountChange,
                label = { Text("Withdrawal Amount (PKR) *") },
                placeholder = { Text("e.g. 5000") },
                leadingIcon = {
                    Text(
                        text = "PKR",
                        style = DtaTheme.typography.Label.copy(
                            fontWeight = FontWeight.Bold,
                            color = DtaTheme.colors.primary
                        ),
                        modifier = Modifier.padding(start = 12.dp, end = 4.dp)
                    )
                },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                isError = amountInput.isNotBlank() && !isAmountValid,
                supportingText = {
                    if (amountInput.isNotBlank() && !isAmountValid) {
                        Text(
                            text = "Amount must be between PKR 500 and your available balance",
                            color = DtaTheme.colors.semanticError
                        )
                    }
                },
                modifier = Modifier.fillMaxWidth()
            )

            // Method Selector Pills
            Text(
                text = "Select Payout Destination *",
                style = DtaTheme.typography.Label.copy(fontWeight = FontWeight.SemiBold)
            )

            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(PaymentMethodType.entries) { type ->
                    val isSelected = selectedMethodType == type
                    Box(
                        modifier = Modifier
                            .clip(DtaTheme.shapes.Chip)
                            .background(
                                if (isSelected) DtaTheme.colors.primary else DtaTheme.colors.surfaceAlt
                            )
                            .clickable { onMethodSelect(type) }
                            .padding(horizontal = 12.dp, vertical = 8.dp)
                    ) {
                        Text(
                            text = type.displayName,
                            style = DtaTheme.typography.Label.copy(
                                color = if (isSelected) Color.White else DtaTheme.colors.ink,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                            )
                        )
                    }
                }
            }

            // Account Details Inputs
            OutlinedTextField(
                value = accountTitle,
                onValueChange = onAccountTitleChange,
                label = { Text("Account Title (Account Holder Name) *") },
                placeholder = { Text("e.g. Ali Khan") },
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = accountNumber,
                onValueChange = onAccountNumberChange,
                label = { Text("Account Number / IBAN / Mobile Number *") },
                placeholder = { Text("e.g. 03001234567 or PK36MEZN...") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Text),
                modifier = Modifier.fillMaxWidth()
            )

            if (selectedMethodType == PaymentMethodType.BANK_TRANSFER) {
                OutlinedTextField(
                    value = bankName,
                    onValueChange = onBankNameChange,
                    label = { Text("Bank Name *") },
                    placeholder = { Text("e.g. Meezan Bank, HBL, Allied Bank") },
                    modifier = Modifier.fillMaxWidth()
                )
            }

            if (errorMessage != null) {
                Text(
                    text = errorMessage,
                    style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.semanticError)
                )
            }

            // Submit Button
            DtaPrimaryButton(
                text = if (isSubmitting) "Processing..." else "Submit Payout Request",
                onClick = onSubmit,
                enabled = canSubmit,
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}

@Composable
private fun WithdrawalHistoryCard(withdrawal: WithdrawalRequest) {
    Card(
        shape = DtaTheme.shapes.Card,
        colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
        border = androidx.compose.foundation.BorderStroke(1.dp, DtaTheme.colors.line),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = withdrawal.id.uppercase(),
                    style = DtaTheme.typography.Label.copy(
                        color = DtaTheme.colors.inkSecondary,
                        fontWeight = FontWeight.Bold
                    )
                )

                // Status Chip
                Box(
                    modifier = Modifier
                        .clip(DtaTheme.shapes.Chip)
                        .background(
                            when (withdrawal.status) {
                                WithdrawalStatus.PAID -> DtaTheme.colors.semanticSuccess.copy(alpha = 0.15f)
                                WithdrawalStatus.APPROVED -> DtaTheme.colors.semanticInfo.copy(alpha = 0.15f)
                                WithdrawalStatus.PENDING -> DtaTheme.colors.semanticPending.copy(alpha = 0.15f)
                                WithdrawalStatus.REJECTED -> DtaTheme.colors.semanticError.copy(alpha = 0.15f)
                            }
                        )
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Text(
                        text = withdrawal.status.displayName,
                        style = DtaTheme.typography.Label.copy(
                            color = when (withdrawal.status) {
                                WithdrawalStatus.PAID -> DtaTheme.colors.semanticSuccess
                                WithdrawalStatus.APPROVED -> DtaTheme.colors.semanticInfo
                                WithdrawalStatus.PENDING -> DtaTheme.colors.semanticPending
                                WithdrawalStatus.REJECTED -> DtaTheme.colors.semanticError
                            },
                            fontWeight = FontWeight.Bold,
                            fontSize = 11.sp
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
                        text = "${withdrawal.payoutMethod.bankName} • ${withdrawal.payoutMethod.accountNumber}",
                        style = DtaTheme.typography.TitleSmall.copy(fontWeight = FontWeight.SemiBold)
                    )
                    Text(
                        text = "Title: ${withdrawal.payoutMethod.accountTitle}",
                        style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.inkSecondary)
                    )
                }

                Text(
                    text = withdrawal.formattedAmount,
                    style = DtaTheme.typography.TitleMedium.copy(
                        color = DtaTheme.colors.primary,
                        fontWeight = FontWeight.Bold
                    )
                )
            }

            if (withdrawal.transactionReference != null) {
                Divider(color = DtaTheme.colors.line)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "Txn Ref: ${withdrawal.transactionReference}",
                        style = DtaTheme.typography.BodySmall.copy(
                            color = DtaTheme.colors.semanticSuccess,
                            fontWeight = FontWeight.Medium
                        )
                    )
                }
            }
        }
    }
}
