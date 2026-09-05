package com.dreamtoachievers.app.core.designsystem.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme

/**
 * Point 96: Admin Critical Action Confirmation Bottom Sheet
 * Enforces the strict multi-step safety pattern:
 * Tap Action -> Confirmation Bottom Sheet -> Show consequences -> Confirm -> Backend request -> Progress -> Success / Error
 * Prevents accidental financial or destructive mutations from a single misclick.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminConfirmationSheet(
    title: String,
    subtitle: String,
    entityId: String,
    consequences: List<String>,
    confirmButtonText: String,
    isDestructive: Boolean = false,
    isLoading: Boolean = false,
    errorMessage: String? = null,
    icon: ImageVector = if (isDestructive) Icons.Default.WarningAmber else Icons.Default.CheckCircle,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier
) {
    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = DtaTheme.colors.surface,
        modifier = modifier
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .navigationBarsPadding()
                .padding(horizontal = 24.dp, vertical = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Icon Badge
            Box(
                modifier = Modifier
                    .size(56.dp)
                    .clip(CircleShape)
                    .background(
                        if (isDestructive) DtaTheme.colors.errorContainer
                        else DtaTheme.colors.primaryContainer
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = if (isDestructive) DtaTheme.colors.error else DtaTheme.colors.primary,
                    modifier = Modifier.size(32.dp)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Title & Entity Reference
            Text(
                text = title,
                style = DtaTheme.typography.TitleMedium.copy(fontWeight = FontWeight.Bold),
                textAlign = TextAlign.Center
            )

            if (entityId.isNotBlank()) {
                Spacer(modifier = Modifier.height(4.dp))
                Surface(
                    color = DtaTheme.colors.surfaceAlt,
                    shape = DtaTheme.shapes.Chip,
                    modifier = Modifier.padding(vertical = 4.dp)
                ) {
                    Text(
                        text = "Target Entity: $entityId",
                        style = DtaTheme.typography.Label.copy(
                            fontWeight = FontWeight.SemiBold,
                            color = DtaTheme.colors.inkSecondary
                        ),
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = subtitle,
                style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.inkSecondary),
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(20.dp))

            // Consequences List Card
            Surface(
                color = if (isDestructive) DtaTheme.colors.errorContainer.copy(alpha = 0.4f) else DtaTheme.colors.surfaceAlt,
                shape = DtaTheme.shapes.Card,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Text(
                        text = "System Consequences & Impact:",
                        style = DtaTheme.typography.BodySmall.copy(fontWeight = FontWeight.Bold)
                    )

                    consequences.forEach { consequence ->
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                            verticalAlignment = Alignment.Top
                        ) {
                            Icon(
                                imageVector = if (isDestructive) Icons.Default.ReportProblem else Icons.Default.Check,
                                contentDescription = null,
                                tint = if (isDestructive) DtaTheme.colors.error else DtaTheme.colors.primary,
                                modifier = Modifier
                                    .size(16.dp)
                                    .padding(top = 2.dp)
                            )
                            Text(
                                text = consequence,
                                style = DtaTheme.typography.BodySmall.copy(
                                    color = if (isDestructive) DtaTheme.colors.error else DtaTheme.colors.ink
                                )
                            )
                        }
                    }
                }
            }

            // Error Feedback if any
            if (!errorMessage.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(14.dp))
                Surface(
                    color = DtaTheme.colors.errorContainer,
                    shape = DtaTheme.shapes.Card,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.ErrorOutline,
                            contentDescription = null,
                            tint = DtaTheme.colors.error,
                            modifier = Modifier.size(20.dp)
                        )
                        Text(
                            text = errorMessage,
                            style = DtaTheme.typography.BodySmall.copy(
                                color = DtaTheme.colors.error,
                                fontWeight = FontWeight.SemiBold
                            )
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Action Buttons
            if (isLoading) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(28.dp),
                        color = if (isDestructive) DtaTheme.colors.error else DtaTheme.colors.primary,
                        strokeWidth = 3.dp
                    )
                }
            } else {
                DtaButton(
                    text = confirmButtonText,
                    onClick = onConfirm,
                    modifier = Modifier.fillMaxWidth(),
                    containerColor = if (isDestructive) DtaTheme.colors.error else DtaTheme.colors.primary
                )

                Spacer(modifier = Modifier.height(10.dp))

                DtaOutlinedButton(
                    text = "Cancel",
                    onClick = onDismiss,
                    modifier = Modifier.fillMaxWidth()
                )
            }

            Spacer(modifier = Modifier.height(12.dp))
        }
    }
}
