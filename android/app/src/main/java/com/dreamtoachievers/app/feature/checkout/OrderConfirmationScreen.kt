package com.dreamtoachievers.app.feature.checkout

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dreamtoachievers.app.core.designsystem.components.DtaPrimaryButton
import com.dreamtoachievers.app.core.designsystem.components.DtaSecondaryButton
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme

@Composable
fun OrderConfirmationScreen(
    orderId: String,
    onTrackOrder: (String) -> Unit,
    onContinueShopping: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .background(DtaTheme.colors.background)
            .statusBarsPadding()
            .navigationBarsPadding()
            .padding(horizontal = DtaTheme.spacing.ScreenHorizontal),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        // Success Green Animated Check Circle
        Box(
            modifier = Modifier
                .size(90.dp)
                .clip(CircleShape)
                .background(DtaTheme.colors.primaryContainer),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Default.Check,
                contentDescription = "Success",
                tint = DtaTheme.colors.primary,
                modifier = Modifier.size(48.dp)
            )
        }

        Spacer(modifier = Modifier.height(24.dp))

        Text(
            text = "Order Placed Successfully!",
            style = DtaTheme.typography.ScreenHeading.copy(
                color = DtaTheme.colors.inkPrimary,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center
            )
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = "Your payment transfer slip has been submitted for verification. We will dispatch your package once approved.",
            style = DtaTheme.typography.Body.copy(
                color = DtaTheme.colors.inkSecondary,
                textAlign = TextAlign.Center,
                fontSize = 14.sp
            ),
            modifier = Modifier.padding(horizontal = 16.dp)
        )

        Spacer(modifier = Modifier.height(24.dp))

        // Order ID Reference Box
        Card(
            shape = DtaTheme.shapes.Card,
            colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, DtaTheme.colors.line, DtaTheme.shapes.Card)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "REFERENCE ORDER ID",
                    style = DtaTheme.typography.Label.copy(
                        color = DtaTheme.colors.inkMuted,
                        fontWeight = FontWeight.Bold
                    )
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = orderId.takeLast(12).uppercase(),
                    style = DtaTheme.typography.CardTitle.copy(
                        color = DtaTheme.colors.primary,
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp
                    )
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "Status: Pending Payment Verification",
                    style = DtaTheme.typography.Metadata.copy(color = DtaTheme.colors.pending)
                )
            }
        }

        Spacer(modifier = Modifier.height(36.dp))

        // Actions
        DtaPrimaryButton(
            text = "Track Order Progress",
            onClick = { onTrackOrder(orderId) }
        )

        Spacer(modifier = Modifier.height(12.dp))

        DtaSecondaryButton(
            text = "Continue Shopping",
            onClick = onContinueShopping
        )
    }
}
