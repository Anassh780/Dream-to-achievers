package com.dreamtoachievers.app.core.designsystem.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme

/**
 * Point 72: Loading Skeletons matching Dashboard, Wallet, Growth, Orders, Admin queue, Payment review.
 * Prevents blank white screen during data fetching.
 */
@Composable
fun rememberShimmerBrush(): Brush {
    val transition = rememberInfiniteTransition(label = "ShimmerTransition")
    val translateAnim by transition.animateFloat(
        initialValue = 0f,
        targetValue = 1000f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1200, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "ShimmerTranslate"
    )

    val shimmerColors = listOf(
        DtaTheme.colors.surfaceAlt.copy(alpha = 0.6f),
        DtaTheme.colors.surfaceAlt.copy(alpha = 0.2f),
        DtaTheme.colors.surfaceAlt.copy(alpha = 0.6f),
    )

    return Brush.linearGradient(
        colors = shimmerColors,
        start = Offset.Zero,
        end = Offset(x = translateAnim, y = translateAnim)
    )
}

@Composable
fun ShimmerBox(
    modifier: Modifier = Modifier,
    height: Dp = 20.dp,
    width: Dp? = null,
    shape: androidx.compose.ui.graphics.Shape = DtaTheme.shapes.Chip
) {
    val brush = rememberShimmerBrush()
    val baseModifier = if (width != null) modifier.size(width, height) else modifier.fillMaxWidth().height(height)
    Box(
        modifier = baseModifier
            .clip(shape)
            .background(brush)
    )
}

@Composable
fun DashboardSkeleton(modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Hero skeleton
        Card(
            shape = DtaTheme.shapes.Hero,
            colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surfaceAlt),
            modifier = Modifier.fillMaxWidth().height(160.dp)
        ) {
            Box(modifier = Modifier.fillMaxSize().background(rememberShimmerBrush()))
        }

        // Quick actions row
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            repeat(4) {
                ShimmerBox(
                    modifier = Modifier.weight(1f),
                    height = 68.dp,
                    shape = DtaTheme.shapes.Card
                )
            }
        }

        // 4 Bento tiles
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                ShimmerBox(modifier = Modifier.weight(1f), height = 110.dp, shape = DtaTheme.shapes.Card)
                ShimmerBox(modifier = Modifier.weight(1f), height = 110.dp, shape = DtaTheme.shapes.Card)
            }
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                ShimmerBox(modifier = Modifier.weight(1f), height = 110.dp, shape = DtaTheme.shapes.Card)
                ShimmerBox(modifier = Modifier.weight(1f), height = 110.dp, shape = DtaTheme.shapes.Card)
            }
        }

        // Sales activity list skeleton
        repeat(2) {
            ShimmerBox(height = 90.dp, shape = DtaTheme.shapes.Card)
        }
    }
}

@Composable
fun OrdersListSkeleton(modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // Filter chips skeleton
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            repeat(4) {
                ShimmerBox(width = 80.dp, height = 32.dp, shape = DtaTheme.shapes.Chip)
            }
        }

        // Order cards skeleton
        repeat(4) {
            ShimmerBox(height = 110.dp, shape = DtaTheme.shapes.Card)
        }
    }
}

@Composable
fun WalletSkeleton(modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        ShimmerBox(height = 180.dp, shape = DtaTheme.shapes.Hero)
        ShimmerBox(height = 120.dp, shape = DtaTheme.shapes.Card)
        repeat(3) {
            ShimmerBox(height = 70.dp, shape = DtaTheme.shapes.Card)
        }
    }
}

@Composable
fun GrowthSkeleton(modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        ShimmerBox(height = 160.dp, shape = DtaTheme.shapes.Hero)
        ShimmerBox(height = 120.dp, shape = DtaTheme.shapes.Card)
        repeat(3) {
            ShimmerBox(height = 100.dp, shape = DtaTheme.shapes.Card)
        }
    }
}

@Composable
fun AdminQueueSkeleton(modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        ShimmerBox(height = 48.dp, shape = DtaTheme.shapes.Chip)
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            repeat(3) {
                ShimmerBox(width = 90.dp, height = 32.dp, shape = DtaTheme.shapes.Chip)
            }
        }
        repeat(4) {
            ShimmerBox(height = 120.dp, shape = DtaTheme.shapes.Card)
        }
    }
}

@Composable
fun ReviewDeskSkeleton(modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        ShimmerBox(height = 240.dp, shape = DtaTheme.shapes.Card)
        ShimmerBox(height = 140.dp, shape = DtaTheme.shapes.Card)
        ShimmerBox(height = 120.dp, shape = DtaTheme.shapes.Card)
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            ShimmerBox(modifier = Modifier.weight(1f), height = 48.dp, shape = DtaTheme.shapes.Button)
            ShimmerBox(modifier = Modifier.weight(1f), height = 48.dp, shape = DtaTheme.shapes.Button)
        }
    }
}
