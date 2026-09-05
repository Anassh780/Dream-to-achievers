package com.dreamtoachievers.app.feature.account

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.ContentCopy
import androidx.compose.material.icons.outlined.Payment
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dreamtoachievers.app.core.designsystem.components.DtaSecondaryTopBar
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme
import com.dreamtoachievers.app.core.firebase.FirebaseConfig

@Composable
fun PaymentMethodsScreen(
    onNavigateBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val accounts = FirebaseConfig.OFFICIAL_PAYMENT_ACCOUNTS

    Scaffold(
        topBar = {
            DtaSecondaryTopBar(
                title = "Payment Methods",
                onBackClick = onNavigateBack
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
                bottom = 32.dp
            ),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            item {
                Text(
                    text = "Official Dream to Achievers Accounts",
                    style = DtaTheme.typography.SectionHeading.copy(
                        color = DtaTheme.colors.primary,
                        fontWeight = FontWeight.Bold,
                        fontSize = 17.sp
                    )
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = "Transfers sent to these accounts are verified automatically upon payment proof slip upload.",
                    style = DtaTheme.typography.Metadata.copy(color = DtaTheme.colors.inkSecondary)
                )
            }

            items(accounts) { account ->
                Card(
                    shape = DtaTheme.shapes.Card,
                    colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, DtaTheme.colors.line, DtaTheme.shapes.Card)
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
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Outlined.Payment,
                                    contentDescription = null,
                                    tint = DtaTheme.colors.primary,
                                    modifier = Modifier.size(20.dp)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = account.bankName,
                                    style = DtaTheme.typography.CardTitle.copy(
                                        fontSize = 15.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                )
                            }

                            IconButton(
                                onClick = {
                                    val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                    clipboard.setPrimaryClip(ClipData.newPlainText("Account", account.accountNumber))
                                    Toast.makeText(context, "${account.bankName} account copied!", Toast.LENGTH_SHORT).show()
                                }
                            ) {
                                Icon(
                                    imageVector = Icons.Outlined.ContentCopy,
                                    contentDescription = "Copy",
                                    tint = DtaTheme.colors.primary,
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                        }

                        Divider(color = DtaTheme.colors.line)

                        Text(
                            text = "Account Title: ${account.accountTitle}",
                            style = DtaTheme.typography.Metadata
                        )
                        Text(
                            text = "Account Number: ${account.accountNumber}",
                            style = DtaTheme.typography.Metadata.copy(
                                fontWeight = FontWeight.Bold,
                                color = DtaTheme.colors.primary
                            )
                        )
                        if (account.iban != null) {
                            Text(
                                text = "IBAN: ${account.iban}",
                                style = DtaTheme.typography.Metadata
                            )
                        }
                    }
                }
            }
        }
    }
}
