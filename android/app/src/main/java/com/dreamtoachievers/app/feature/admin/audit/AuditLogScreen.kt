package com.dreamtoachievers.app.feature.admin.audit

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import com.dreamtoachievers.app.core.data.AdminRepository
import com.dreamtoachievers.app.core.designsystem.components.*
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme
import com.dreamtoachievers.app.core.model.AuditLog

/**
 * Point 61 & 82: Read-Only System Audit Logs Screen
 * Immutable administrative activity history tracking Actor, Action, Entity,
 * Previous State, New State, and Timestamp.
 * Editing is strictly prohibited.
 */
@Composable
fun AuditLogScreen(
    adminRepository: AdminRepository,
    onNavigateBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val auditLogs by adminRepository.auditLogs.collectAsState()

    var searchQuery by remember { mutableStateOf("") }
    var selectedFilter by remember { mutableStateOf("All") }

    val filterChips = listOf("All", "Orders", "Payouts", "Rewards", "Users", "Catalog")

    val filteredLogs = remember(auditLogs, searchQuery, selectedFilter) {
        auditLogs.filter { log ->
            val matchesSearch = searchQuery.isBlank() ||
                log.action.contains(searchQuery, ignoreCase = true) ||
                log.entityId.contains(searchQuery, ignoreCase = true) ||
                log.actorName.contains(searchQuery, ignoreCase = true) ||
                (log.note?.contains(searchQuery, ignoreCase = true) == true)

            val matchesFilter = when (selectedFilter) {
                "Orders" -> log.entityType.equals("ORDER", ignoreCase = true)
                "Payouts" -> log.entityType.equals("WITHDRAWAL", ignoreCase = true)
                "Rewards" -> log.entityType.equals("REWARD", ignoreCase = true)
                "Users" -> log.entityType.equals("USER", ignoreCase = true)
                "Catalog" -> log.entityType.equals("PRODUCT", ignoreCase = true) || log.entityType.equals("CATEGORY", ignoreCase = true)
                else -> true
            }

            matchesSearch && matchesFilter
        }
    }

    Scaffold(
        topBar = {
            DtaTopAppBar(
                title = "System Audit Logs",
                subtitle = "Read-only security and operations ledger",
                navigationIcon = Icons.Default.ArrowBack,
                onNavigationClick = onNavigateBack,
                actions = {
                    Box(
                        modifier = Modifier
                            .clip(DtaTheme.shapes.Chip)
                            .background(DtaTheme.colors.surfaceAlt)
                            .border(1.dp, DtaTheme.colors.line, DtaTheme.shapes.Chip)
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.Lock,
                                contentDescription = "Read-Only",
                                tint = DtaTheme.colors.inkSecondary,
                                modifier = Modifier.size(12.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "READ-ONLY",
                                style = DtaTheme.typography.Label.copy(
                                    color = DtaTheme.colors.inkSecondary,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            )
                        }
                    }
                }
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
                query = searchQuery,
                onQueryChange = { searchQuery = it },
                onSearch = {},
                placeholder = "Search by Action, Entity ID, or Actor...",
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
            )

            // Filter Chips
            LazyRow(
                modifier = Modifier.fillMaxWidth(),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 6.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(filterChips) { chip ->
                    val isSelected = selectedFilter == chip
                    FilterChip(
                        selected = isSelected,
                        onClick = { selectedFilter = chip },
                        label = { Text(chip, style = DtaTheme.typography.Label) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = DtaTheme.colors.primary,
                            selectedLabelColor = Color.White
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(4.dp))

            // Audit Records List
            if (filteredLogs.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    DtaEmptyState(
                        title = "No Audit Records Found",
                        message = "No immutable event logs match your query or selected filter criteria."
                    )
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(filteredLogs, key = { it.id }) { log ->
                        AuditLogCard(log = log)
                    }
                }
            }
        }
    }
}

@Composable
private fun AuditLogCard(log: AuditLog) {
    Card(
        shape = DtaTheme.shapes.Card,
        colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
        border = androidx.compose.foundation.BorderStroke(1.dp, DtaTheme.colors.line),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // Header Row: Action Badge + Timestamp
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .clip(DtaTheme.shapes.Chip)
                        .background(DtaTheme.colors.primaryContainer)
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Text(
                        text = log.action.replace("_", " "),
                        style = DtaTheme.typography.Label.copy(
                            color = DtaTheme.colors.primary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 11.sp
                        )
                    )
                }

                Text(
                    text = log.formattedTimestamp,
                    style = DtaTheme.typography.Label.copy(
                        color = DtaTheme.colors.inkSecondary,
                        fontSize = 11.sp
                    )
                )
            }

            // Entity + Actor Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Tag,
                        contentDescription = null,
                        tint = DtaTheme.colors.inkSecondary,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "${log.entityType}: ${log.entityId}",
                        style = DtaTheme.typography.TitleSmall.copy(fontWeight = FontWeight.SemiBold)
                    )
                }

                Text(
                    text = "Actor: ${log.actorName}",
                    style = DtaTheme.typography.BodySmall.copy(
                        color = DtaTheme.colors.inkSecondary,
                        fontSize = 11.sp
                    )
                )
            }

            // State Transition Row
            if (log.previousState != null || log.newState != null) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Text(
                        text = log.previousState ?: "None",
                        style = DtaTheme.typography.Label.copy(
                            color = DtaTheme.colors.inkSecondary,
                            fontSize = 11.sp
                        )
                    )
                    Icon(
                        imageVector = Icons.Default.ArrowForward,
                        contentDescription = "Changed to",
                        tint = DtaTheme.colors.inkSecondary,
                        modifier = Modifier.size(12.dp)
                    )
                    Text(
                        text = log.newState ?: "None",
                        style = DtaTheme.typography.Label.copy(
                            color = DtaTheme.colors.primary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 11.sp
                        )
                    )
                }
            }

            // Note Description
            if (!log.note.isNullOrBlank()) {
                Text(
                    text = log.note,
                    style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.ink)
                )
            }
        }
    }
}
