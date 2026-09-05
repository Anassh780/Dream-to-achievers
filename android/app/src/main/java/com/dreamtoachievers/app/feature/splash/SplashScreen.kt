package com.dreamtoachievers.app.feature.splash

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.scale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dreamtoachievers.app.R
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme
import kotlinx.coroutines.delay

@Composable
fun SplashScreen(
    onSplashFinished: () -> Unit,
    modifier: Modifier = Modifier
) {
    val scale = remember { Animatable(0.85f) }
    val alpha = remember { Animatable(0.0f) }

    LaunchedEffect(Unit) {
        alpha.animateTo(1.0f, animationSpec = tween(600))
        scale.animateTo(1.0f, animationSpec = tween(600))
        delay(1000)
        onSplashFinished()
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(DtaTheme.colors.background),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier
                .scale(scale.value)
                .alpha(alpha.value)
        ) {
            Image(
                painter = painterResource(id = R.drawable.brand_logo),
                contentDescription = "Dream to Achievers Logo",
                modifier = Modifier.size(120.dp)
            )

            Spacer(modifier = Modifier.height(DtaTheme.spacing.lg))

            Text(
                text = "Dream to Achievers",
                style = DtaTheme.typography.ScreenHeading.copy(
                    color = DtaTheme.colors.primary,
                    fontWeight = FontWeight.Bold,
                    fontSize = 26.sp
                )
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = "Better Products. Bigger Opportunities.",
                style = DtaTheme.typography.Metadata.copy(
                    color = DtaTheme.colors.inkSecondary,
                    fontSize = 14.sp
                )
            )
        }
    }
}
