package com.dreamtoachievers.app.core.designsystem.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme

@Composable
fun DtaProfileRow(
    title: String,
    icon: ImageVector,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    subtitle: String? = null,
    trailingText: String? = null
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .clip(DtaTheme.shapes.Button)
            .clickable(onClick = onClick)
            .padding(vertical = 12.dp, horizontal = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(40.dp)
                .clip(DtaTheme.shapes.Small)
                .background(DtaTheme.colors.surfaceAlt),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = DtaTheme.colors.primary,
                modifier = Modifier.size(20.dp)
            )
        }

        Spacer(modifier = Modifier.width(DtaTheme.spacing.md))

        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = title,
                style = DtaTheme.typography.CardTitle.copy(
                    color = DtaTheme.colors.inkPrimary,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Medium
                )
            )
            if (subtitle != null) {
                Text(
                    text = subtitle,
                    style = DtaTheme.typography.Metadata.copy(
                        color = DtaTheme.colors.inkSecondary,
                        fontSize = 12.sp
                    )
                )
            }
        }

        if (trailingText != null) {
            Text(
                text = trailingText,
                style = DtaTheme.typography.Metadata.copy(
                    color = DtaTheme.colors.inkMuted,
                    fontSize = 13.sp
                )
            )
            Spacer(modifier = Modifier.width(4.dp))
        }

        Icon(
            imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
            contentDescription = null,
            tint = DtaTheme.colors.inkMuted,
            modifier = Modifier.size(20.dp)
        )
    }
}
