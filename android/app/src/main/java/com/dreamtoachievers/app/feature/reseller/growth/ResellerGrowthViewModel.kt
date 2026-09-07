package com.dreamtoachievers.app.feature.reseller.growth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.dreamtoachievers.app.core.data.RankEngine
import com.dreamtoachievers.app.core.data.ResellerRepository
import com.dreamtoachievers.app.core.model.*
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class ResellerGrowthUiState(
    val rankProgress: RankProgress = RankEngine.calculateProgress(0, 0),
    val allRanks: List<RankDefinition> = RankEngine.getAllRanks(),
    val milestoneRewards: List<MilestoneReward> = emptyList(),
    val communityMembers: List<TeamMember> = emptyList()
)

class ResellerGrowthViewModel(
    private val resellerRepository: ResellerRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(ResellerGrowthUiState())
    val uiState: StateFlow<ResellerGrowthUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            combine(
                resellerRepository.resellerSales,
                resellerRepository.communityMembers,
                resellerRepository.milestoneRewards
            ) { _, members, rewards ->
                val progress = resellerRepository.getRankProgress()
                _uiState.value = _uiState.value.copy(
                    rankProgress = progress,
                    milestoneRewards = rewards,
                    communityMembers = members
                )
            }.collect()
        }
    }
}
