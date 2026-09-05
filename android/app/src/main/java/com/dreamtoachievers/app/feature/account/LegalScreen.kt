package com.dreamtoachievers.app.feature.account

import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dreamtoachievers.app.core.designsystem.components.DtaSecondaryTopBar
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme

@Composable
fun LegalScreen(
    legalType: String,
    onNavigateBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val title = if (legalType == "terms") "Terms of Service" else "Privacy Policy & Legal"

    Scaffold(
        topBar = {
            DtaSecondaryTopBar(
                title = title,
                onBackClick = onNavigateBack
            )
        },
        containerColor = DtaTheme.colors.background,
        modifier = modifier.fillMaxSize()
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = DtaTheme.spacing.ScreenHorizontal, vertical = 14.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            Card(
                shape = DtaTheme.shapes.Card,
                colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, DtaTheme.colors.line, DtaTheme.shapes.Card)
            ) {
                Column(
                    modifier = Modifier.padding(18.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "Dream to Achievers Global Network (Pvt) Ltd",
                        style = DtaTheme.typography.SectionHeading.copy(
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = DtaTheme.colors.primary
                        )
                    )

                    Text(
                        text = "1. Customer Purchases & Orders\nAll orders placed on the Dream to Achievers customer application are fulfilled through verified logistics couriers (TCS, Leopard, Trax, PostEx). Retail prices are shown in PKR and inclusive of all applicable standard taxes.",
                        style = DtaTheme.typography.Body.copy(
                            color = DtaTheme.colors.inkSecondary,
                            lineHeight = 22.sp
                        )
                    )

                    Text(
                        text = "2. Payment Slip Verification\nOrders paid via bank transfer or mobile wallets require valid screenshot receipt submission. Orders remain in pending status until the finance team approves the transaction reference.",
                        style = DtaTheme.typography.Body.copy(
                            color = DtaTheme.colors.inkSecondary,
                            lineHeight = 22.sp
                        )
                    )

                    Text(
                        text = "3. Customer Privacy & Data Protection\nYour personal data, contact number, and delivery addresses are encrypted and exclusively utilized for shipping and order fulfillment. We do not sell or share customer data with unauthorized third parties.",
                        style = DtaTheme.typography.Body.copy(
                            color = DtaTheme.colors.inkSecondary,
                            lineHeight = 22.sp
                        )
                    )

                    Text(
                        text = "4. Return & Replacement Policy\nCustomers are eligible for inspection and replacement requests within 7 days of package delivery in the event of manufacturing defect or parcel damage.",
                        style = DtaTheme.typography.Body.copy(
                            color = DtaTheme.colors.inkSecondary,
                            lineHeight = 22.sp
                        )
                    )
                }
            }
        }
    }
}
