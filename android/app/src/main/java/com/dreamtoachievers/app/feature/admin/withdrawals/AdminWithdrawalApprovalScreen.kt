package com.dreamtoachievers.app.feature.admin.withdrawals

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dreamtoachievers.app.core.designsystem.components.*
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme
import com.dreamtoachievers.app.core.designsystem.util.DtaHaptics
import com.dreamtoachievers.app.core.model.WithdrawalRequest
import com.dreamtoachievers.app.core.model.WithdrawalStatus

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminWithdrawalApprovalScreen(
    viewModel: AdminWithdrawalApprovalViewModel,
    onNavigateBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val haptic = LocalHapticFeedback.current
    val state by viewModel.uiState.collectAsState()

    var searchQuery by remember { mutableStateOf("") }
    var debouncedSearchQuery by remember { mutableStateOf("") }

    LaunchedEffect(searchQuery) {
        kotlinx.coroutines.delay(300)
        debouncedSearchQuery = searchQuery
    }

    var showDisburseDialog by remember { mutableStateOf<WithdrawalRequest?>(null) }
    var txnReferenceInput by remember { mutableStateOf("") }
    var adminNoteInput by remember { mutableStateOf("") }

    var showRejectDialog by remember { mutableStateOf<WithdrawalRequest?>(null) }
    var rejectReasonInput by remember { mutableStateOf("") }

    // Disburse Dialog
    if (showDisburseDialog != null) {
        val req = showDisburseDialog!!
        AlertDialog(
            onDismissRequest = { showDisburseDialog = null },
            title = {
                Text(
                    text = "Disburse ${req.formattedAmount}",
                    style = DtaTheme.typography.TitleMedium.copy(fontWeight = FontWeight.Bold)
                )
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(
                        text = "Transfer to: ${req.payoutMethod.bankName}\nAccount Title: ${req.payoutMethod.accountTitle}\nAccount #: ${req.payoutMethod.accountNumber}",
                        style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.ink)
                    )

                    OutlinedTextField(
                        value = txnReferenceInput,
                        onValueChange = { txnReferenceInput = it },
                        label = { Text("Transaction Reference ID / Bank Trx # *") },
                        placeholder = { Text("e.g. EP-TXN-998822") },
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = adminNoteInput,
                        onValueChange = { adminNoteInput = it },
                        label = { Text("Admin Note (Optional)") },
                        placeholder = { Text("Transferred from company account") },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (txnReferenceInput.isNotBlank()) {
                            viewModel.markWithdrawalPaid(req.id, txnReferenceInput, adminNoteInput)
                            DtaHaptics.success(haptic)
                            showDisburseDialog = null
                            txnReferenceInput = ""
                            adminNoteInput = ""
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = DtaTheme.colors.primary)
                ) {
                    Text("Confirm Disbursed")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDisburseDialog = null }) {
                    Text("Cancel")
                }
            }
        )
    }

    // Reject Dialog
    if (showRejectDialog != null) {
        val req = showRejectDialog!!
        AlertDialog(
            onDismissRequest = { showRejectDialog = null },
            title = {
                Text("Reject Payout Request", style = DtaTheme.typography.TitleMedium.copy(fontWeight = FontWeight.Bold))
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(
                        text = "Provide reason for rejection (unfreezes reseller balance):",
                        style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.inkSecondary)
                    )
                    OutlinedTextField(
                        value = rejectReasonInput,
                        onValueChange = { rejectReasonInput = it },
                        label = { Text("Rejection Reason *") },
                        placeholder = { Text("e.g. Invalid account title / number mismatch") },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (rejectReasonInput.isNotBlank()) {
                            viewModel.rejectWithdrawal(req.id, rejectReasonInput)
                            showRejectDialog = null
                            rejectReasonInput = ""
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = DtaTheme.colors.semanticError)
                ) {
                    Text("Reject")
                }
            },
            dismissButton = {
                TextButton(onClick = { showRejectDialog = null }) {
                    Text("Cancel")
                }
            }
        )
    }

    Scaffold(
        topBar = {
            DtaTopAppBar(
                title = "Withdrawal Requests Queue",
                subtitle = "Process and disburse reseller merchant profit withdrawals",
                navigationIcon = Icons.Default.ArrowBack,
                onNavigationClick = onNavigateBack
            )
        },
        containerColor = DtaTheme.colors.background,
        modifier = modifier.fillMaxSize()
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // Point 94: Debounced Search Bar
            Box(modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)) {
                DtaSearchBar(
                    query = searchQuery,
                    onQueryChange = { searchQuery = it },
                    placeholder = "Search merchant, bank, account, or transaction ID...",
                    modifier = Modifier.fillMaxWidth()
                )
            }

            // Status Tabs
            val tabs = listOf(
                "All" to "All",
                "Pending" to "pending",
                "Paid" to "paid",
                "Rejected" to "rejected"
            )

            LazyRow(
                modifier = Modifier.fillMaxWidth(),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 4.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(tabs) { (label, raw) ->
                    DtaFilterChip(
                        label = label,
                        selected = state.selectedStatus == raw,
                        onClick = { viewModel.onStatusTabSelected(raw) }
                    )
                }
            }

            val displayedWithdrawals = remember(state.filteredWithdrawals, debouncedSearchQuery) {
                if (debouncedSearchQuery.isBlank()) {
                    state.filteredWithdrawals
                } else {
                    state.filteredWithdrawals.filter { req ->
                        req.userName.contains(debouncedSearchQuery, ignoreCase = true) ||
                        (req.userPhone?.contains(debouncedSearchQuery, ignoreCase = true) == true) ||
                        req.payoutMethod.bankName.contains(debouncedSearchQuery, ignoreCase = true) ||
                        req.payoutMethod.accountNumber.contains(debouncedSearchQuery, ignoreCase = true) ||
                        (req.transactionReference?.contains(debouncedSearchQuery, ignoreCase = true) == true)
                    }
                }
            }

            if (displayedWithdrawals.isEmpty()) {
                DtaEmptyState(
                    title = "No Withdrawal Requests",
                    message = if (debouncedSearchQuery.isNotBlank()) "No payout requests match '$debouncedSearchQuery'." else "Payout requests matching this filter will appear here."
                )
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 8.dp, bottom = 80.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    items(displayedWithdrawals) { req ->
                        AdminWithdrawalCard(
                            request = req,
                            onDisburse = { showDisburseDialog = req },
                            onReject = { showRejectDialog = req }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun AdminWithdrawalCard(
    request: WithdrawalRequest,
    onDisburse: () -> Unit,
    onReject: () -> Unit
) {
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
            // Header: ID + Status
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = request.id.uppercase(),
                    style = DtaTheme.typography.TitleSmall.copy(fontWeight = FontWeight.Bold)
                )

                Box(
                    modifier = Modifier
                        .clip(DtaTheme.shapes.Chip)
                        .background(
                            when (request.status) {
                                WithdrawalStatus.PAID -> DtaTheme.colors.semanticSuccess.copy(alpha = 0.15f)
                                WithdrawalStatus.APPROVED -> DtaTheme.colors.semanticInfo.copy(alpha = 0.15f)
                                WithdrawalStatus.PENDING -> DtaTheme.colors.semanticPending.copy(alpha = 0.15f)
                                WithdrawalStatus.REJECTED -> DtaTheme.colors.semanticError.copy(alpha = 0.15f)
                            }
                        )
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Text(
                        text = request.status.displayName,
                        style = DtaTheme.typography.Label.copy(
                            color = when (request.status) {
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

            // Reseller Details & Amount
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Merchant: ${request.userName}",
                        style = DtaTheme.typography.TitleSmall.copy(fontWeight = FontWeight.SemiBold)
                    )
                    Text(
                        text = "Contact: ${request.userPhone ?: request.userEmail}",
                        style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.inkSecondary)
                    )
                }

                Text(
                    text = request.formattedAmount,
                    style = DtaTheme.typography.TitleLarge.copy(
                        color = DtaTheme.colors.primary,
                        fontWeight = FontWeight.Bold
                    )
                )
            }

            // Destination Bank Account
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(DtaTheme.shapes.Card)
                    .background(DtaTheme.colors.surfaceAlt)
                    .padding(10.dp)
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                    Text(
                        text = "Destination: ${request.payoutMethod.bankName}",
                        style = DtaTheme.typography.BodySmall.copy(fontWeight = FontWeight.SemiBold)
                    )
                    Text(
                        text = "Title: ${request.payoutMethod.accountTitle} • Account: ${request.payoutMethod.accountNumber}",
                        style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.ink)
                    )
                }
            }

            // Point 92: Withdrawal Double-Payment Safety
            if (request.status == WithdrawalStatus.PAID) {
                Divider(color = DtaTheme.colors.line)
                Surface(
                    color = DtaTheme.colors.semanticSuccess.copy(alpha = 0.08f),
                    shape = DtaTheme.shapes.Card,
                    border = androidx.compose.foundation.BorderStroke(1.dp, DtaTheme.colors.semanticSuccess.copy(alpha = 0.3f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = "Paid",
                            tint = DtaTheme.colors.semanticSuccess,
                            modifier = Modifier.size(24.dp)
                        )
                        Column {
                            Text(
                                text = "Paid",
                                style = DtaTheme.typography.TitleSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = DtaTheme.colors.semanticSuccess
                                )
                            )
                            Text(
                                text = "Transaction ID: ${request.transactionReference ?: "TXN-RECORDED"}",
                                style = DtaTheme.typography.BodySmall.copy(
                                    fontWeight = FontWeight.SemiBold,
                                    color = DtaTheme.colors.ink
                                )
                            )
                        }
                    }
                }
            } else if (request.status == WithdrawalStatus.PENDING) {
                Divider(color = DtaTheme.colors.line)

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Button(
                        onClick = onDisburse,
                        shape = DtaTheme.shapes.Chip,
                        colors = ButtonDefaults.buttonColors(containerColor = DtaTheme.colors.primary),
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.Payments, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Disburse Payout", style = DtaTheme.typography.Label.copy(fontSize = 11.sp))
                    }

                    OutlinedButton(
                        onClick = onReject,
                        shape = DtaTheme.shapes.Chip,
                        border = androidx.compose.foundation.BorderStroke(1.dp, DtaTheme.colors.semanticError)
                    ) {
                        Text("Reject", style = DtaTheme.typography.Label.copy(color = DtaTheme.colors.semanticError, fontSize = 11.sp))
                    }
                }
            }
        }
    }
}
