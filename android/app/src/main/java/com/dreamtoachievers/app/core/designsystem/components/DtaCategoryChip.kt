package com.dreamtoachievers.app.core.designsystem.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Category
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
fun DtaCategoryChip(
    name: String,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val bg = if (isSelected) DtaTheme.colors.primary else DtaTheme.colors.surface
    val border = if (isSelected) DtaTheme.colors.primary else DtaTheme.colors.line
    val textColor = if (isSelected) DtaTheme.colors.surface else DtaTheme.colors.inkPrimary

    Row(
        modifier = modifier
            .clip(DtaTheme.shapes.Chip)
            .background(bg)
            .border(1.dp, border, DtaTheme.shapes.Chip)
            .clickable(onClick = onClick)
            .padding(horizontal = 14.dp, vertical = 9.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(8.dp)
                .clip(CircleShape)
                .background(if (isSelected) DtaTheme.colors.accentGold else DtaTheme.colors.line)
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text(
            text = name,
            style = DtaTheme.typography.Button.copy(
                color = textColor,
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                fontSize = 13.sp
            )
        )
    }
}
