package com.dreamtoachievers.app.core.designsystem.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Inbox
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme

@Composable
fun DtaEmptyState(
    title: String = "No Items Found",
    message: String = "There are no items to display right now.",
    description: String = message,
    icon: ImageVector = Icons.Outlined.Inbox,
    actionLabel: String? = null,
    actionButtonText: String? = actionLabel,
    onActionClick: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    val displayMessage = if (description.isNotBlank()) description else message
    val buttonText = actionButtonText ?: actionLabel

    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(DtaTheme.spacing.xl),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Box(
            modifier = Modifier
                .size(72.dp)
                .clip(CircleShape)
                .background(DtaTheme.colors.surfaceAlt),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = DtaTheme.colors.primary,
                modifier = Modifier.size(36.dp)
            )
        }

        Spacer(modifier = Modifier.height(DtaTheme.spacing.md))

        Text(
            text = title,
            style = DtaTheme.typography.SectionHeading.copy(
                color = DtaTheme.colors.inkPrimary,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center
            )
        )

        Spacer(modifier = Modifier.height(DtaTheme.spacing.xs))

        Text(
            text = displayMessage,
            style = DtaTheme.typography.Body.copy(
                color = DtaTheme.colors.inkSecondary,
                textAlign = TextAlign.Center,
                fontSize = 14.sp
            ),
            modifier = Modifier.padding(horizontal = DtaTheme.spacing.md)
        )

        if (!buttonText.isNullOrBlank() && onActionClick != null) {
            Spacer(modifier = Modifier.height(DtaTheme.spacing.lg))
            DtaPrimaryButton(
                text = buttonText,
                onClick = onActionClick,
                modifier = Modifier.widthIn(max = 240.dp)
            )
        }
    }
}
