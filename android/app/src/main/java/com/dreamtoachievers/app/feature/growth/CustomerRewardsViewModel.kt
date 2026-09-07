package com.dreamtoachievers.app.feature.growth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.dreamtoachievers.app.core.data.DataStoreManager
import com.dreamtoachievers.app.core.data.ReferralRepository
import com.dreamtoachievers.app.core.data.UserRepository
import com.dreamtoachievers.app.core.model.Referral
import com.dreamtoachievers.app.core.model.User
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class CustomerGrowthUiState(
    val user: User? = null,
    val rewardPoints: Int = 0,
    val totalCreditsPKR: Double = 0.0,
    val referralCode: String = "",
    val referrals: List<Referral> = emptyList(),
    val invitedCount: Int = 0,
    val isCopied: Boolean = false
)

class CustomerRewardsViewModel(
    private val userRepository: UserRepository,
    private val referralRepository: ReferralRepository,
    private val dataStoreManager: DataStoreManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(CustomerGrowthUiState())
    val uiState: StateFlow<CustomerGrowthUiState> = _uiState.asStateFlow()

    init {
        loadData()
    }

    private fun loadData() {
        viewModelScope.launch {
            userRepository.currentUser.collectLatest { user ->
                _uiState.value = CustomerGrowthUiState(user = user)
                if (user != null) {
                    val referrals = referralRepository.getCustomerReferrals(user.id)
                    _uiState.update {
                        it.copy(
                            user = user,
                            rewardPoints = user.rewardPoints,
                            referralCode = user.referralCode.ifEmpty { "DTA-${user.id.take(6).uppercase()}" },
                            referrals = referrals,
                            invitedCount = referrals.size,
                            totalCreditsPKR = referrals.sumOf { it.rewardEarned }
                        )
                    }
                }
            }
        }
    }
}
