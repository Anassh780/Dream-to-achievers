package com.dreamtoachievers.app.feature.admin.withdrawals

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.dreamtoachievers.app.core.data.AdminRepository
import com.dreamtoachievers.app.core.model.WithdrawalRequest
import com.dreamtoachievers.app.core.model.WithdrawalStatus
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class AdminWithdrawalApprovalUiState(
    val withdrawals: List<WithdrawalRequest> = emptyList(),
    val filteredWithdrawals: List<WithdrawalRequest> = emptyList(),
    val selectedStatus: String = "All",
    val isUpdating: Boolean = false,
    val successMessage: String? = null
)

class AdminWithdrawalApprovalViewModel(
    private val adminRepository: AdminRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(AdminWithdrawalApprovalUiState())
    val uiState: StateFlow<AdminWithdrawalApprovalUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            adminRepository.platformWithdrawals.collect { withdrawals ->
                _uiState.value = _uiState.value.copy(
                    withdrawals = withdrawals,
                    filteredWithdrawals = filter(withdrawals, _uiState.value.selectedStatus)
                )
            }
        }
    }

    fun onStatusTabSelected(statusRaw: String) {
        _uiState.value = _uiState.value.copy(
            selectedStatus = statusRaw,
            filteredWithdrawals = filter(_uiState.value.withdrawals, statusRaw)
        )
    }

    fun markWithdrawalPaid(requestId: String, txnRef: String, note: String?) {
        _uiState.value = _uiState.value.copy(isUpdating = true)
        val success = adminRepository.markWithdrawalPaid(
            requestId = requestId,
            transactionReference = txnRef,
            adminNote = note,
            receiptProofUrl = "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80"
        )
        _uiState.value = _uiState.value.copy(
            isUpdating = false,
            successMessage = if (success) "Withdrawal marked as paid!" else null
        )
    }

    fun rejectWithdrawal(requestId: String, reason: String) {
        _uiState.value = _uiState.value.copy(isUpdating = true)
        val success = adminRepository.rejectWithdrawal(
            requestId = requestId,
            adminReason = reason
        )
        _uiState.value = _uiState.value.copy(
            isUpdating = false,
            successMessage = if (success) "Withdrawal rejected" else null
        )
    }

    private fun filter(withdrawals: List<WithdrawalRequest>, statusRaw: String): List<WithdrawalRequest> {
        return if (statusRaw == "All") {
            withdrawals
        } else {
            withdrawals.filter { it.status.rawValue == statusRaw }
        }
    }
}
