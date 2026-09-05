package com.dreamtoachievers.app.core.designsystem.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.ErrorOutline
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme

import androidx.compose.ui.graphics.vector.ImageVector

@Composable
fun DtaErrorState(
    title: String = "Something went wrong",
    message: String = "An error occurred",
    description: String? = null,
    onRetry: (() -> Unit)? = null,
    action: (() -> Unit)? = onRetry,
    actionLabel: String = "Retry",
    icon: ImageVector? = null,
    selected: Boolean = false,
    modifier: Modifier = Modifier
) {
    val displayMessage = description ?: message
    val handleRetry = action ?: onRetry

    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(DtaTheme.spacing.xl),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Box(
            modifier = Modifier
                .size(68.dp)
                .clip(CircleShape)
                .background(DtaTheme.colors.surfaceAlt),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon ?: Icons.Outlined.ErrorOutline,
                contentDescription = null,
                tint = DtaTheme.colors.error,
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

        if (handleRetry != null) {
            Spacer(modifier = Modifier.height(DtaTheme.spacing.lg))

            DtaPrimaryButton(
                text = actionLabel,
                onClick = handleRetry,
                modifier = Modifier.widthIn(max = 200.dp)
            )
        }
    }
}
