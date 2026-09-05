package com.dreamtoachievers.app.core.designsystem.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme

@Composable
fun DtaQuantitySelector(
    quantity: Int,
    onQuantityChange: (Int) -> Unit,
    modifier: Modifier = Modifier,
    minQuantity: Int = 1,
    maxQuantity: Int = 99
) {
    Row(
        modifier = modifier
            .clip(DtaTheme.shapes.Chip)
            .background(DtaTheme.colors.surfaceAlt)
            .border(1.dp, DtaTheme.colors.line, DtaTheme.shapes.Chip)
            .padding(4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Decrease Button (min 44x44 touch target)
        Box(
            modifier = Modifier
                .size(36.dp)
                .clip(CircleShape)
                .background(
                    if (quantity > minQuantity) DtaTheme.colors.surface else DtaTheme.colors.surfaceAlt
                )
                .clickable(
                    enabled = quantity > minQuantity,
                    onClick = { onQuantityChange(quantity - 1) }
                ),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Default.Remove,
                contentDescription = "Decrease Quantity",
                tint = if (quantity > minQuantity) DtaTheme.colors.inkPrimary else DtaTheme.colors.inkMuted,
                modifier = Modifier.size(16.dp)
            )
        }

        // Quantity count
        Box(
            modifier = Modifier.widthIn(min = 36.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = quantity.toString(),
                style = DtaTheme.typography.CardTitle.copy(
                    color = DtaTheme.colors.inkPrimary,
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp
                )
            )
        }

        // Increase Button
        Box(
            modifier = Modifier
                .size(36.dp)
                .clip(CircleShape)
                .background(
                    if (quantity < maxQuantity) DtaTheme.colors.surface else DtaTheme.colors.surfaceAlt
                )
                .clickable(
                    enabled = quantity < maxQuantity,
                    onClick = { onQuantityChange(quantity + 1) }
                ),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Default.Add,
                contentDescription = "Increase Quantity",
                tint = if (quantity < maxQuantity) DtaTheme.colors.inkPrimary else DtaTheme.colors.inkMuted,
                modifier = Modifier.size(16.dp)
            )
        }
    }
}
