package com.dreamtoachievers.app.feature.account

import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Notifications
import androidx.compose.material.icons.outlined.NotificationsNone
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dreamtoachievers.app.core.designsystem.components.DtaEmptyState
import com.dreamtoachievers.app.core.designsystem.components.DtaSecondaryTopBar
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme

@Composable
fun NotificationsScreen(
    viewModel: AccountViewModel,
    onNavigateBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            DtaSecondaryTopBar(
                title = "Notifications",
                onBackClick = onNavigateBack
            )
        },
        containerColor = DtaTheme.colors.background,
        modifier = modifier.fillMaxSize()
    ) { paddingValues ->
        if (uiState.notifications.isEmpty()) {
            DtaEmptyState(
                title = "No notifications yet",
                description = "You're all caught up! Order updates and courier alerts will appear here.",
                icon = Icons.Outlined.NotificationsNone,
                actionButtonText = "Back to Account",
                onActionClick = onNavigateBack,
                modifier = Modifier.padding(paddingValues)
            )
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentPadding = PaddingValues(
                    start = DtaTheme.spacing.ScreenHorizontal,
                    end = DtaTheme.spacing.ScreenHorizontal,
                    top = 12.dp,
                    bottom = 24.dp
                ),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(uiState.notifications, key = { it.id }) { notif ->
                    Card(
                        shape = DtaTheme.shapes.Card,
                        colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(1.dp, DtaTheme.colors.line, DtaTheme.shapes.Card)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(14.dp),
                            verticalAlignment = Alignment.Top
                        ) {
                            Icon(
                                imageVector = Icons.Outlined.Notifications,
                                contentDescription = null,
                                tint = DtaTheme.colors.primary,
                                modifier = Modifier.size(22.dp)
                            )

                            Spacer(modifier = Modifier.width(12.dp))

                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = notif.title,
                                    style = DtaTheme.typography.CardTitle.copy(
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    text = notif.message,
                                    style = DtaTheme.typography.Body.copy(
                                        color = DtaTheme.colors.inkSecondary,
                                        fontSize = 13.sp
                                    )
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = notif.createdAt.take(10),
                                    style = DtaTheme.typography.Metadata.copy(
                                        color = DtaTheme.colors.inkMuted,
                                        fontSize = 11.sp
                                    )
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
