package com.dreamtoachievers.app.core.designsystem.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.outlined.Notifications
import androidx.compose.material.icons.outlined.ShoppingCart
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme

@Composable
fun DtaHomeTopBar(
    userName: String,
    avatarUrl: String?,
    unreadNotificationsCount: Int = 0,
    cartItemCount: Int = 0,
    isVerifiedPartner: Boolean = true,
    onAvatarClick: () -> Unit = {},
    onNotificationClick: () -> Unit = {},
    onCartClick: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .statusBarsPadding()
            .padding(horizontal = DtaTheme.spacing.ScreenHorizontal, vertical = DtaTheme.spacing.xs),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        // User profile greeting
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier
                .clip(DtaTheme.shapes.Chip)
                .clickable(onClick = onAvatarClick)
                .padding(4.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(46.dp)
                    .clip(CircleShape)
                    .background(DtaTheme.colors.surfaceAlt)
                    .border(1.5.dp, DtaTheme.colors.primary.copy(alpha = 0.2f), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                if (!avatarUrl.isNullOrBlank()) {
                    AsyncImage(
                        model = avatarUrl,
                        contentDescription = "User Avatar",
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Crop
                    )
                } else {
                    Text(
                        text = userName.take(1).uppercase().ifEmpty { "A" },
                        style = DtaTheme.typography.CardTitle.copy(
                            color = DtaTheme.colors.primary,
                            fontWeight = FontWeight.Bold
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.width(DtaTheme.spacing.sm))

            Column {
                Text(
                    text = "Good Morning,",
                    style = DtaTheme.typography.Metadata.copy(
                        color = DtaTheme.colors.inkSecondary,
                        fontSize = 12.sp
                    )
                )
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Text(
                        text = userName.ifEmpty { "Alex" },
                        style = DtaTheme.typography.CardTitle.copy(
                            color = DtaTheme.colors.inkPrimary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp
                        ),
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    if (isVerifiedPartner) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier
                                .clip(DtaTheme.shapes.Chip)
                                .background(DtaTheme.colors.primaryContainer)
                                .padding(horizontal = 5.dp, vertical = 1.dp)
                        ) {
                            Icon(
                                imageVector = androidx.compose.material.icons.Icons.Default.CheckCircle,
                                contentDescription = "Verified",
                                tint = DtaTheme.colors.primary,
                                modifier = Modifier.size(11.dp)
                            )
                            Spacer(modifier = Modifier.width(2.dp))
                            Text(
                                text = "Verified Partner",
                                style = DtaTheme.typography.Label.copy(
                                    color = DtaTheme.colors.primary,
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            )
                        }
                    }
                }
            }
        }

        // Action Icons (Notifications & Cart)
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(DtaTheme.spacing.xs)
        ) {
            // Notifications Icon
            BadgedBox(
                badge = {
                    if (unreadNotificationsCount > 0) {
                        Badge(
                            containerColor = Color(0xFFDC2626),
                            contentColor = Color.White
                        ) {
                            Text(
                                text = if (unreadNotificationsCount > 99) "99+" else unreadNotificationsCount.toString(),
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            ) {
                IconButton(
                    onClick = onNotificationClick,
                    modifier = Modifier
                        .size(44.dp)
                        .background(DtaTheme.colors.surface, CircleShape)
                        .border(1.dp, DtaTheme.colors.line, CircleShape)
                ) {
                    Icon(
                        imageVector = Icons.Outlined.Notifications,
                        contentDescription = "Notifications",
                        tint = DtaTheme.colors.inkPrimary
                    )
                }
            }

            // Cart Icon
            BadgedBox(
                badge = {
                    if (cartItemCount > 0) {
                        Badge(
                            containerColor = DtaTheme.colors.primary,
                            contentColor = DtaTheme.colors.surface
                        ) {
                            Text(
                                text = if (cartItemCount > 99) "99+" else cartItemCount.toString(),
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            ) {
                IconButton(
                    onClick = onCartClick,
                    modifier = Modifier
                        .size(44.dp)
                        .background(DtaTheme.colors.surface, CircleShape)
                        .border(1.dp, DtaTheme.colors.line, CircleShape)
                ) {
                    Icon(
                        imageVector = Icons.Outlined.ShoppingCart,
                        contentDescription = "Cart",
                        tint = DtaTheme.colors.inkPrimary
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DtaSecondaryTopBar(
    title: String,
    onBackClick: () -> Unit,
    modifier: Modifier = Modifier,
    actionIcon: ImageVector? = null,
    onActionClick: () -> Unit = {}
) {
    TopAppBar(
        title = {
            Text(
                text = title,
                style = DtaTheme.typography.SectionHeading.copy(
                    color = DtaTheme.colors.inkPrimary,
                    fontWeight = FontWeight.Bold
                ),
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        },
        navigationIcon = {
            IconButton(
                onClick = onBackClick,
                modifier = Modifier
                    .padding(start = 8.dp)
                    .size(40.dp)
                    .background(DtaTheme.colors.surface, CircleShape)
                    .border(1.dp, DtaTheme.colors.line, CircleShape)
            ) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = "Back",
                    tint = DtaTheme.colors.inkPrimary
                )
            }
        },
        actions = {
            if (actionIcon != null) {
                IconButton(
                    onClick = onActionClick,
                    modifier = Modifier
                        .padding(end = 8.dp)
                        .size(40.dp)
                        .background(DtaTheme.colors.surface, CircleShape)
                        .border(1.dp, DtaTheme.colors.line, CircleShape)
                ) {
                    Icon(
                        imageVector = actionIcon,
                        contentDescription = "Action",
                        tint = DtaTheme.colors.inkPrimary
                    )
                }
            }
        },
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = DtaTheme.colors.background
        ),
        modifier = modifier.statusBarsPadding()
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DtaTopAppBar(
    title: String,
    subtitle: String? = null,
    navigationIcon: ImageVector? = null,
    onNavigationClick: () -> Unit = {},
    onBackClick: () -> Unit = onNavigationClick,
    actions: (@Composable RowScope.() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    TopAppBar(
        title = {
            Column {
                Text(
                    text = title,
                    style = DtaTheme.typography.SectionHeading.copy(
                        color = DtaTheme.colors.inkPrimary,
                        fontWeight = FontWeight.Bold
                    ),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                if (!subtitle.isNullOrBlank()) {
                    Text(
                        text = subtitle,
                        style = DtaTheme.typography.Metadata.copy(
                            color = DtaTheme.colors.inkSecondary,
                            fontSize = 11.sp
                        ),
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }
        },
        navigationIcon = {
            if (navigationIcon != null) {
                IconButton(
                    onClick = onBackClick,
                    modifier = Modifier
                        .padding(start = 8.dp)
                        .size(40.dp)
                        .background(DtaTheme.colors.surface, CircleShape)
                        .border(1.dp, DtaTheme.colors.line, CircleShape)
                ) {
                    Icon(
                        imageVector = navigationIcon,
                        contentDescription = "Back",
                        tint = DtaTheme.colors.inkPrimary
                    )
                }
            }
        },
        actions = {
            if (actions != null) {
                actions()
            }
        },
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = DtaTheme.colors.background
        ),
        modifier = modifier.statusBarsPadding()
    )
}
