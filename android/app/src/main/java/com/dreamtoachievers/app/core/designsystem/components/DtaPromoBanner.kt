package com.dreamtoachievers.app.core.designsystem.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme

@Composable
fun DtaPromoBanner(
    title: String = "Grow Together",
    subtitle: String = "Better Products. Bigger Opportunities.",
    ctaText: String = "Explore Catalog",
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .clip(DtaTheme.shapes.HeroCard)
            .background(
                Brush.linearGradient(
                    colors = listOf(
                        DtaTheme.colors.primaryDark,
                        DtaTheme.colors.primary,
                        Color(0xFF286350)
                    )
                )
            )
            .clickable(onClick = onClick)
            .padding(DtaTheme.spacing.lg)
    ) {
        Column(
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .clip(DtaTheme.shapes.Small)
                        .background(DtaTheme.colors.accentGold)
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Text(
                        text = "EXCLUSIVE SELECTION",
                        style = DtaTheme.typography.Label.copy(
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 10.sp
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = title,
                style = DtaTheme.typography.SectionHeading.copy(
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 22.sp
                )
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = subtitle,
                style = DtaTheme.typography.Body.copy(
                    color = Color.White.copy(alpha = 0.85f),
                    fontSize = 14.sp
                )
            )

            Spacer(modifier = Modifier.height(14.dp))

            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = ctaText,
                    style = DtaTheme.typography.Button.copy(
                        color = DtaTheme.colors.accentGoldLight,
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp
                    )
                )
                Spacer(modifier = Modifier.width(4.dp))
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                    contentDescription = null,
                    tint = DtaTheme.colors.accentGoldLight,
                    modifier = Modifier.size(15.dp)
                )
            }
        }
    }
}
