package com.dreamtoachievers.app.feature.admin.users

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dreamtoachievers.app.core.designsystem.components.*
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme
import com.dreamtoachievers.app.core.model.User
import com.dreamtoachievers.app.core.model.UserRole

@Composable
fun AdminUserManagementScreen(
    viewModel: AdminUserManagementViewModel,
    onNavigateBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val state by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            DtaTopAppBar(
                title = "User Directory & Roles",
                subtitle = "Manage platform partner access, permissions, and status",
                navigationIcon = Icons.Default.ArrowBack,
                onNavigationClick = onNavigateBack
            )
        },
        containerColor = DtaTheme.colors.background,
        modifier = modifier.fillMaxSize()
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // Search Bar
            DtaSearchBar(
                query = state.searchQuery,
                onQueryChange = { viewModel.onSearchQueryChanged(it) },
                placeholder = "Search by name, email or phone...",
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
            )

            // Role Filters
            val roles = listOf("All", "CUSTOMER", "RESELLER", "SUPERADMIN")
            LazyRow(
                modifier = Modifier.fillMaxWidth(),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 4.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(roles) { role ->
                    DtaFilterChip(
                        label = if (role == "SUPERADMIN") "Admin" else role.lowercase().replaceFirstChar { it.uppercase() },
                        selected = state.selectedRoleFilter == role,
                        onClick = { viewModel.onRoleFilterSelected(role) }
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            if (state.filteredUsers.isEmpty()) {
                DtaEmptyState(
                    title = "No Users Found",
                    message = "No accounts matched your search or role filter."
                )
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(start = 16.dp, end = 16.dp, bottom = 80.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(state.filteredUsers) { user ->
                        AdminUserCard(
                            user = user,
                            onRoleChange = { newRole -> viewModel.updateUserRole(user.id, newRole) },
                            onToggleActive = { viewModel.toggleUserActive(user.id) }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun AdminUserCard(
    user: User,
    onRoleChange: (UserRole) -> Unit,
    onToggleActive: () -> Unit
) {
    Card(
        shape = DtaTheme.shapes.Card,
        colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
        border = androidx.compose.foundation.BorderStroke(1.dp, DtaTheme.colors.line),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .clip(CircleShape)
                            .background(DtaTheme.colors.primaryContainer),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = user.fullName.take(2).uppercase(),
                            style = DtaTheme.typography.TitleSmall.copy(
                                color = DtaTheme.colors.primary,
                                fontWeight = FontWeight.Bold
                            )
                        )
                    }

                    Column {
                        Text(
                            text = user.fullName,
                            style = DtaTheme.typography.TitleSmall.copy(fontWeight = FontWeight.Bold)
                        )
                        Text(
                            text = user.email,
                            style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.inkSecondary)
                        )
                    }
                }

                Switch(
                    checked = user.isActive,
                    onCheckedChange = { onToggleActive() },
                    colors = SwitchDefaults.colors(
                        checkedThumbColor = Color.White,
                        checkedTrackColor = DtaTheme.colors.primary
                    )
                )
            }

            if (user.phone != null || user.city != null) {
                Text(
                    text = "Contact: ${user.phone ?: "N/A"} • City: ${user.city ?: "N/A"}",
                    style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.ink)
                )
            }

            Divider(color = DtaTheme.colors.line)

            // Role Selector Chips
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Assigned Role:",
                    style = DtaTheme.typography.Label.copy(
                        color = DtaTheme.colors.inkSecondary,
                        fontSize = 11.sp
                    )
                )

                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    listOf(
                        UserRole.CUSTOMER to "Customer",
                        UserRole.RESELLER to "Reseller",
                        UserRole.SUPERADMIN to "Admin"
                    ).forEach { (role, label) ->
                        val isCurrent = user.role == role
                        Box(
                            modifier = Modifier
                                .clip(DtaTheme.shapes.Chip)
                                .background(
                                    if (isCurrent) DtaTheme.colors.primary else DtaTheme.colors.surfaceAlt
                                )
                                .clickable { onRoleChange(role) }
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = label,
                                style = DtaTheme.typography.Label.copy(
                                    color = if (isCurrent) Color.White else DtaTheme.colors.ink,
                                    fontWeight = if (isCurrent) FontWeight.Bold else FontWeight.Medium,
                                    fontSize = 10.sp
                                )
                            )
                        }
                    }
                }
            }
        }
    }
}
