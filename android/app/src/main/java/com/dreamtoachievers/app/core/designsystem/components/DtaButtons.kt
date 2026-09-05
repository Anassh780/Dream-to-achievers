package com.dreamtoachievers.app.core.designsystem.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme

@Composable
fun DtaPrimaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    isLoading: Boolean = false,
    icon: ImageVector? = null,
    trailingIcon: ImageVector? = null,
    containerColor: Color = DtaTheme.colors.primary,
    contentColor: Color = Color.White
) {
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val scale by animateFloatAsState(
        targetValue = if (isPressed) 0.97f else 1.0f,
        label = "ButtonPressScale"
    )

    Box(
        modifier = modifier
            .scale(scale)
            .heightIn(min = 52.dp)
            .fillMaxWidth()
            .clip(DtaTheme.shapes.Button)
            .background(
                if (enabled) containerColor else containerColor.copy(alpha = 0.5f)
            )
            .clickable(
                interactionSource = interactionSource,
                indication = ripple(color = Color.White.copy(alpha = 0.3f)),
                enabled = enabled && !isLoading,
                onClick = onClick
            )
            .padding(horizontal = DtaTheme.spacing.lg, vertical = 14.dp),
        contentAlignment = Alignment.Center
    ) {
        if (isLoading) {
            CircularProgressIndicator(
                modifier = Modifier.size(22.dp),
                color = contentColor,
                strokeWidth = 2.5.dp
            )
        } else {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center
            ) {
                if (icon != null) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = contentColor,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(DtaTheme.spacing.xs))
                }
                Text(
                    text = text,
                    style = DtaTheme.typography.Button.copy(
                        color = contentColor,
                        fontWeight = FontWeight.Bold
                    )
                )
                if (trailingIcon != null) {
                    Spacer(modifier = Modifier.width(DtaTheme.spacing.xs))
                    Icon(
                        imageVector = trailingIcon,
                        contentDescription = null,
                        tint = contentColor,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun DtaSecondaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    icon: ImageVector? = null
) {
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val scale by animateFloatAsState(
        targetValue = if (isPressed) 0.97f else 1.0f,
        label = "SecondaryPressScale"
    )

    Box(
        modifier = modifier
            .scale(scale)
            .heightIn(min = DtaTheme.spacing.MinTouchTarget)
            .fillMaxWidth()
            .clip(DtaTheme.shapes.Button)
            .background(DtaTheme.colors.surface)
            .border(1.dp, DtaTheme.colors.line, DtaTheme.shapes.Button)
            .clickable(
                interactionSource = interactionSource,
                indication = ripple(color = DtaTheme.colors.line),
                enabled = enabled,
                onClick = onClick
            )
            .padding(horizontal = DtaTheme.spacing.lg, vertical = DtaTheme.spacing.sm),
        contentAlignment = Alignment.Center
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            if (icon != null) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = DtaTheme.colors.inkPrimary,
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(DtaTheme.spacing.xs))
            }
            Text(
                text = text,
                style = DtaTheme.typography.Button.copy(
                    color = DtaTheme.colors.inkPrimary,
                    fontWeight = FontWeight.SemiBold
                )
            )
        }
    }
}

@Composable
fun DtaButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    isLoading: Boolean = false,
    icon: ImageVector? = null,
    trailingIcon: ImageVector? = null,
    containerColor: Color = DtaTheme.colors.primary,
    contentColor: Color = Color.White
) {
    DtaPrimaryButton(
        text = text,
        onClick = onClick,
        modifier = modifier,
        enabled = enabled,
        isLoading = isLoading,
        icon = icon,
        trailingIcon = trailingIcon,
        containerColor = containerColor,
        contentColor = contentColor
    )
}

@Composable
fun DtaOutlinedButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    icon: ImageVector? = null
) {
    DtaSecondaryButton(
        text = text,
        onClick = onClick,
        modifier = modifier,
        enabled = enabled,
        icon = icon
    )
}
