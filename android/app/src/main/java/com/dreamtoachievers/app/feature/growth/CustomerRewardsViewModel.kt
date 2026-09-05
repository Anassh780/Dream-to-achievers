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
    val rewardPoints: Int = 120,
    val totalCreditsPKR: Double = 1200.0,
    val referralCode: String = "DTA-CUSTOMER",
    val referrals: List<Referral> = emptyList(),
    val invitedCount: Int = 3,
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
            userRepository.currentUser.collect { user ->
                if (user != null) {
                    val referrals = referralRepository.getCustomerReferrals(user.id)
                    _uiState.update {
                        it.copy(
                            user = user,
                            rewardPoints = user.rewardPoints.coerceAtLeast(100),
                            referralCode = user.referralCode.ifEmpty { "DTA-${user.id.take(6).uppercase()}" },
                            referrals = referrals,
                            invitedCount = referrals.size.coerceAtLeast(1),
                            totalCreditsPKR = (referrals.size * 500.0).coerceAtLeast(500.0)
                        )
                    }
                }
            }
        }
    }
}
