package com.dreamtoachievers.app.feature.reseller.team

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dreamtoachievers.app.core.data.ResellerRepository
import com.dreamtoachievers.app.core.designsystem.components.*
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme
import com.dreamtoachievers.app.core.model.TeamMember

@Composable
fun MyTeamScreen(
    resellerRepository: ResellerRepository,
    onNavigateBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val teamMembers by resellerRepository.teamMembers.collectAsState()

    var searchQuery by remember { mutableStateOf("") }
    var debouncedSearchQuery by remember { mutableStateOf("") }

    LaunchedEffect(searchQuery) {
        kotlinx.coroutines.delay(300)
        debouncedSearchQuery = searchQuery
    }

    val filteredMembers = remember(teamMembers, debouncedSearchQuery) {
        if (debouncedSearchQuery.isBlank()) teamMembers
        else teamMembers.filter { member ->
            member.name.contains(debouncedSearchQuery, ignoreCase = true) ||
            member.rankName.contains(debouncedSearchQuery, ignoreCase = true) ||
            member.status.contains(debouncedSearchQuery, ignoreCase = true)
        }
    }

    Scaffold(
        topBar = {
            DtaTopAppBar(
                title = "My Team Directory",
                subtitle = "Direct partners and community members in your network tier",
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
            // Point 94: Debounced Search Bar
            Box(modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp)) {
                DtaSearchBar(
                    query = searchQuery,
                    onQueryChange = { searchQuery = it },
                    placeholder = "Search partners by name or rank tier...",
                    modifier = Modifier.fillMaxWidth()
                )
            }

            if (filteredMembers.isEmpty()) {
                DtaEmptyState(
                    title = if (debouncedSearchQuery.isNotBlank()) "No Partners Found" else "No Team Members Yet",
                    message = if (debouncedSearchQuery.isNotBlank()) "No team members match '$debouncedSearchQuery'." else "Share your referral link to build your distribution team."
                )
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    item {
                        Text(
                            text = "DIRECT REFERRALS (${filteredMembers.size} MEMBERS)",
                            style = DtaTheme.typography.Label.copy(
                                color = DtaTheme.colors.inkSecondary,
                                fontSize = 11.sp,
                                letterSpacing = 1.sp
                            )
                        )
                    }

                    items(filteredMembers) { member ->
                        TeamMemberCard(member = member)
                    }
                }
            }
        }
    }
}

@Composable
private fun TeamMemberCard(member: TeamMember) {
    Card(
        shape = DtaTheme.shapes.Card,
        colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
        border = androidx.compose.foundation.BorderStroke(1.dp, DtaTheme.colors.line),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(14.dp).fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Avatar (Initials)
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .clip(CircleShape)
                    .background(DtaTheme.colors.primaryContainer),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = member.name.take(2).uppercase(),
                    style = DtaTheme.typography.TitleSmall.copy(
                        color = DtaTheme.colors.primary,
                        fontWeight = FontWeight.Bold
                    )
                )
            }

            // Name & Join Date
            Column(modifier = Modifier.weight(1f)) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Text(
                        text = member.name,
                        style = DtaTheme.typography.TitleSmall.copy(fontWeight = FontWeight.Bold)
                    )
                }

                Text(
                    text = "Joined: ${member.joinDate}",
                    style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.inkSecondary)
                )

                Text(
                    text = member.rankName,
                    style = DtaTheme.typography.Label.copy(
                        color = DtaTheme.colors.accent,
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 11.sp
                    )
                )
            }

            // Status Badges (Active & Qualifying)
            Column(
                horizontalAlignment = Alignment.End,
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                // Active status pill
                Box(
                    modifier = Modifier
                        .clip(DtaTheme.shapes.Chip)
                        .background(
                            if (member.isActive) DtaTheme.colors.semanticSuccess.copy(alpha = 0.15f)
                            else DtaTheme.colors.surfaceAlt
                        )
                        .padding(horizontal = 8.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = if (member.isActive) "Active" else "Inactive",
                        style = DtaTheme.typography.Label.copy(
                            color = if (member.isActive) DtaTheme.colors.semanticSuccess else DtaTheme.colors.inkSecondary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 10.sp
                        )
                    )
                }

                // Qualifying status pill
                if (member.isQualifying) {
                    Box(
                        modifier = Modifier
                            .clip(DtaTheme.shapes.Chip)
                            .background(DtaTheme.colors.primaryContainer)
                            .padding(horizontal = 8.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = "Qualifying",
                            style = DtaTheme.typography.Label.copy(
                                color = DtaTheme.colors.primary,
                                fontWeight = FontWeight.Bold,
                                fontSize = 10.sp
                            )
                        )
                    }
                }
            }
        }
    }
}
