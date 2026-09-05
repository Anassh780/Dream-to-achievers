package com.dreamtoachievers.app.core.designsystem.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme
import com.dreamtoachievers.app.core.model.OrderStatus

@Composable
fun DtaStatusChip(
    status: OrderStatus,
    modifier: Modifier = Modifier
) {
    val (bg, textColor) = when (status) {
        OrderStatus.PENDING_VERIFICATION -> Pair(DtaTheme.colors.surfaceAlt, DtaTheme.colors.pending)
        OrderStatus.PAYMENT_VERIFIED -> Pair(DtaTheme.colors.primaryContainer, DtaTheme.colors.primary)
        OrderStatus.PROCESSING -> Pair(DtaTheme.colors.surfaceAlt, DtaTheme.colors.primary)
        OrderStatus.DISPATCHED -> Pair(DtaTheme.colors.primaryContainer, DtaTheme.colors.primary)
        OrderStatus.IN_TRANSIT -> Pair(DtaTheme.colors.surfaceAlt, DtaTheme.colors.info)
        OrderStatus.DELIVERED, OrderStatus.CONFIRMED, OrderStatus.FULFILLED ->
            Pair(DtaTheme.colors.primaryContainer, DtaTheme.colors.success)
        OrderStatus.CANCELLED, OrderStatus.REJECTED ->
            Pair(DtaTheme.colors.surfaceAlt, DtaTheme.colors.error)
    }

    Box(
        modifier = modifier
            .clip(DtaTheme.shapes.Chip)
            .background(bg)
            .padding(horizontal = 10.dp, vertical = 4.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = status.displayName,
            style = DtaTheme.typography.Label.copy(
                color = textColor,
                fontWeight = FontWeight.Bold,
                fontSize = 11.sp
            )
        )
    }
}
