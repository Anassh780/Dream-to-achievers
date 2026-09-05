package com.dreamtoachievers.app.feature.account

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.LocationOn
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dreamtoachievers.app.core.designsystem.components.DtaPrimaryButton
import com.dreamtoachievers.app.core.designsystem.components.DtaSecondaryTopBar
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme

@Composable
fun AddressesScreen(
    viewModel: AccountViewModel,
    onNavigateBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()
    var showAddDialog by remember { mutableStateOf(false) }
    var newAddressInput by remember { mutableStateOf("") }

    Scaffold(
        topBar = {
            DtaSecondaryTopBar(
                title = "Delivery Addresses",
                onBackClick = onNavigateBack,
                actionIcon = Icons.Outlined.Add,
                onActionClick = { showAddDialog = true }
            )
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
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(uiState.savedAddresses) { address ->
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
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Outlined.LocationOn,
                            contentDescription = null,
                            tint = DtaTheme.colors.primary,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Saved Address",
                                style = DtaTheme.typography.CardTitle.copy(
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = address,
                                style = DtaTheme.typography.Metadata.copy(
                                    color = DtaTheme.colors.inkSecondary,
                                    lineHeight = 18.sp
                                )
                            )
                        }
                    }
                }
            }

            item {
                Spacer(modifier = Modifier.height(12.dp))
                DtaPrimaryButton(
                    text = "Add New Delivery Address",
                    onClick = { showAddDialog = true }
                )
            }
        }
    }

    if (showAddDialog) {
        AlertDialog(
            onDismissRequest = { showAddDialog = false },
            title = { Text("Add Delivery Address") },
            text = {
                OutlinedTextField(
                    value = newAddressInput,
                    onValueChange = { newAddressInput = it },
                    label = { Text("Full Address (City, Area, House #)") },
                    shape = DtaTheme.shapes.Input,
                    modifier = Modifier.fillMaxWidth()
                )
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        if (newAddressInput.isNotBlank()) {
                            viewModel.addAddress(newAddressInput)
                            newAddressInput = ""
                            showAddDialog = false
                        }
                    }
                ) {
                    Text("Save", color = DtaTheme.colors.primary)
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddDialog = false }) {
                    Text("Cancel", color = DtaTheme.colors.inkPrimary)
                }
            },
            containerColor = DtaTheme.colors.surface,
            shape = DtaTheme.shapes.Card
        )
    }
}
