package com.dreamtoachievers.app.core.designsystem.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme
import com.dreamtoachievers.app.core.model.Order

@Composable
fun DtaOrderCard(
    order: Order,
    onTrackClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        shape = DtaTheme.shapes.Card,
        colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
        modifier = modifier
            .fillMaxWidth()
            .border(1.dp, DtaTheme.colors.line, DtaTheme.shapes.Card)
            .clickable(onClick = onTrackClick)
    ) {
        Column(
            modifier = Modifier.padding(DtaTheme.spacing.md)
        ) {
            // Header: Order ID & Status
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(
                        text = "ORDER #${order.id.takeLast(8).uppercase()}",
                        style = DtaTheme.typography.Label.copy(
                            color = DtaTheme.colors.inkMuted,
                            fontWeight = FontWeight.Bold,
                            fontSize = 11.sp
                        )
                    )
                    Text(
                        text = order.createdAt.take(10),
                        style = DtaTheme.typography.Metadata.copy(
                            color = DtaTheme.colors.inkSecondary,
                            fontSize = 12.sp
                        )
                    )
                }

                DtaStatusChip(status = order.status)
            }

            Spacer(modifier = Modifier.height(DtaTheme.spacing.sm))

            // Product summary row
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(56.dp)
                        .clip(DtaTheme.shapes.Small)
                        .background(DtaTheme.colors.surfaceAlt)
                ) {
                    if (order.productImage.isNotBlank()) {
                        AsyncImage(
                            model = order.productImage,
                            contentDescription = order.productName,
                            modifier = Modifier.fillMaxSize(),
                            contentScale = ContentScale.Crop
                        )
                    }
                }

                Spacer(modifier = Modifier.width(DtaTheme.spacing.md))

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = order.productName,
                        style = DtaTheme.typography.CardTitle.copy(
                            color = DtaTheme.colors.inkPrimary,
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 14.sp
                        ),
                        maxLines = 1
                    )
                    Text(
                        text = "Qty: ${order.quantity}",
                        style = DtaTheme.typography.Metadata.copy(
                            color = DtaTheme.colors.inkSecondary,
                            fontSize = 12.sp
                        )
                    )
                }

                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        text = order.formattedTotal,
                        style = DtaTheme.typography.CardTitle.copy(
                            color = DtaTheme.colors.primary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(DtaTheme.spacing.md))

            // Bottom CTA row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End
            ) {
                DtaSecondaryButton(
                    text = "Track Order",
                    onClick = onTrackClick,
                    modifier = Modifier.width(130.dp)
                )
            }
        }
    }
}
