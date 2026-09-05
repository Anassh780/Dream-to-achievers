package com.dreamtoachievers.app.core.designsystem.components

import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme

@Composable
fun DtaPriceText(
    price: Double,
    modifier: Modifier = Modifier,
    currency: String = "Rs",
    originalPrice: Double? = null,
    fontSize: TextUnit = 17.sp
) {
    val formattedPrice = "$currency ${price.toInt().toString().reversed().chunked(3).joinToString(",").reversed()}"

    Row(
        modifier = modifier,
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        Text(
            text = formattedPrice,
            style = DtaTheme.typography.CardTitle.copy(
                color = DtaTheme.colors.primary,
                fontWeight = FontWeight.Bold,
                fontSize = fontSize
            )
        )

        if (originalPrice != null && originalPrice > price) {
            val formattedOriginal = "$currency ${originalPrice.toInt().toString().reversed().chunked(3).joinToString(",").reversed()}"
            Text(
                text = formattedOriginal,
                style = DtaTheme.typography.Metadata.copy(
                    color = DtaTheme.colors.inkMuted,
                    textDecoration = TextDecoration.LineThrough,
                    fontSize = (fontSize.value * 0.8).sp
                )
            )
        }
    }
}
