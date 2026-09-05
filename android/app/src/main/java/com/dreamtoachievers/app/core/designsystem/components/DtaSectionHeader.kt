package com.dreamtoachievers.app.core.designsystem.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme

@Composable
fun DtaSectionHeader(
    title: String,
    modifier: Modifier = Modifier,
    actionText: String? = "See All",
    onActionClick: (() -> Unit)? = null
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = title,
            style = DtaTheme.typography.SectionHeading.copy(
                color = DtaTheme.colors.inkPrimary,
                fontWeight = FontWeight.Bold,
                fontSize = 18.sp
            )
        )

        if (actionText != null && onActionClick != null) {
            Text(
                text = actionText,
                style = DtaTheme.typography.Button.copy(
                    color = DtaTheme.colors.primary,
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 13.sp
                ),
                modifier = Modifier.clickable(onClick = onActionClick)
            )
        }
    }
}
