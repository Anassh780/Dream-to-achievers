package com.dreamtoachievers.app.core.designsystem.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Verified
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme

@Composable
fun DtaDiscountBadge(
    discountPercent: Int,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .clip(DtaTheme.shapes.Small)
            .background(DtaTheme.colors.accentGold)
            .padding(horizontal = 7.dp, vertical = 3.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = "-$discountPercent%",
            style = DtaTheme.typography.Label.copy(
                color = Color.White,
                fontWeight = FontWeight.Bold,
                fontSize = 11.sp
            )
        )
    }
}

@Composable
fun DtaVerifiedBadge(
    modifier: Modifier = Modifier,
    label: String = "Verified"
) {
    Row(
        modifier = modifier
            .clip(DtaTheme.shapes.Small)
            .background(DtaTheme.colors.primaryContainer)
            .padding(horizontal = 8.dp, vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = Icons.Default.Verified,
            contentDescription = "Verified Quality",
            tint = DtaTheme.colors.primary,
            modifier = Modifier.size(13.dp)
        )
        Spacer(modifier = Modifier.width(4.dp))
        Text(
            text = label,
            style = DtaTheme.typography.Label.copy(
                color = DtaTheme.colors.primary,
                fontWeight = FontWeight.Bold,
                fontSize = 11.sp
            )
        )
    }
}

@Composable
fun DtaStockBadge(
    inStock: Boolean,
    modifier: Modifier = Modifier
) {
    val (bg, textColor, text) = if (inStock) {
        Triple(DtaTheme.colors.primaryContainer, DtaTheme.colors.primary, "In Stock")
    } else {
        Triple(DtaTheme.colors.surfaceAlt, DtaTheme.colors.inkSecondary, "Out of Stock")
    }

    Row(
        modifier = modifier
            .clip(DtaTheme.shapes.Full)
            .background(bg)
            .padding(horizontal = 8.dp, vertical = 3.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(6.dp)
                .clip(CircleShape)
                .background(textColor)
        )
        Spacer(modifier = Modifier.width(5.dp))
        Text(
            text = text,
            style = DtaTheme.typography.Label.copy(
                color = textColor,
                fontWeight = FontWeight.SemiBold,
                fontSize = 11.sp
            )
        )
    }
}
