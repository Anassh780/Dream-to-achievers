package com.dreamtoachievers.app.core.designsystem.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.unit.dp
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme

@Composable
fun shimmerBrush(showShimmer: Boolean = true): Brush {
    return if (showShimmer) {
        val shimmerColors = listOf(
            DtaTheme.colors.surfaceAlt.copy(alpha = 0.6f),
            DtaTheme.colors.surfaceAlt.copy(alpha = 0.2f),
            DtaTheme.colors.surfaceAlt.copy(alpha = 0.6f)
        )

        val transition = rememberInfiniteTransition(label = "Shimmer")
        val translateAnimation = transition.animateFloat(
            initialValue = 0f,
            targetValue = 1000f,
            animationSpec = infiniteRepeatable(
                animation = tween(durationMillis = 1000, easing = FastOutSlowInEasing),
                repeatMode = RepeatMode.Restart
            ),
            label = "ShimmerTranslation"
        )

        Brush.linearGradient(
            colors = shimmerColors,
            start = Offset.Zero,
            end = Offset(x = translateAnimation.value, y = translateAnimation.value)
        )
    } else {
        Brush.linearGradient(
            colors = listOf(DtaTheme.colors.surfaceAlt, DtaTheme.colors.surfaceAlt)
        )
    }
}

@Composable
fun DtaProductCardSkeleton(modifier: Modifier = Modifier) {
    val brush = shimmerBrush()

    Card(
        shape = DtaTheme.shapes.Card,
        colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
        modifier = modifier
            .fillMaxWidth()
            .border(1.dp, DtaTheme.colors.line, DtaTheme.shapes.Card)
    ) {
        Column {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(1.05f)
                    .background(brush)
            )

            Column(modifier = Modifier.padding(12.dp)) {
                Box(
                    modifier = Modifier
                        .height(14.dp)
                        .fillMaxWidth(0.5f)
                        .clip(DtaTheme.shapes.Small)
                        .background(brush)
                )

                Spacer(modifier = Modifier.height(8.dp))

                Box(
                    modifier = Modifier
                        .height(18.dp)
                        .fillMaxWidth(0.9f)
                        .clip(DtaTheme.shapes.Small)
                        .background(brush)
                )

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Box(
                        modifier = Modifier
                            .height(20.dp)
                            .width(80.dp)
                            .clip(DtaTheme.shapes.Small)
                            .background(brush)
                    )

                    Box(
                        modifier = Modifier
                            .size(34.dp)
                            .clip(DtaTheme.shapes.Full)
                            .background(brush)
                    )
                }
            }
        }
    }
}

@Composable
fun DtaProductGridSkeleton(count: Int = 4, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(DtaTheme.spacing.md)
    ) {
        for (i in 0 until (count + 1) / 2) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(DtaTheme.spacing.md)
            ) {
                DtaProductCardSkeleton(modifier = Modifier.weight(1f))
                DtaProductCardSkeleton(modifier = Modifier.weight(1f))
            }
        }
    }
}
