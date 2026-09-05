package com.dreamtoachievers.app.core.designsystem.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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

@Composable
fun DtaFilterChip(
    label: String,
    isSelected: Boolean = false,
    selected: Boolean = isSelected,
    onClick: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    val active = isSelected || selected
    val bg = if (active) DtaTheme.colors.primaryContainer else DtaTheme.colors.surface
    val border = if (active) DtaTheme.colors.primary else DtaTheme.colors.line
    val textColor = if (active) DtaTheme.colors.primary else DtaTheme.colors.inkSecondary

    Box(
        modifier = modifier
            .clip(DtaTheme.shapes.Chip)
            .background(bg)
            .border(1.dp, border, DtaTheme.shapes.Chip)
            .clickable(onClick = onClick)
            .padding(horizontal = 14.dp, vertical = 8.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = label,
            style = DtaTheme.typography.Button.copy(
                color = textColor,
                fontWeight = if (active) FontWeight.Bold else FontWeight.Medium,
                fontSize = 13.sp
            )
        )
    }
}
