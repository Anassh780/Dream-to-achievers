package com.dreamtoachievers.app.feature.reseller.wallet

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.dreamtoachievers.app.core.data.ResellerRepository
import com.dreamtoachievers.app.core.model.*
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class ResellerWalletUiState(
    val ledger: WalletLedger = WalletLedger(),
    val withdrawals: List<WithdrawalRequest> = emptyList(),
    val amountInput: String = "",
    val selectedMethodType: PaymentMethodType = PaymentMethodType.EASYPAISA,
    val accountTitle: String = "",
    val accountNumber: String = "",
    val bankName: String = "EasyPaisa Mobile Account",
    val isSubmitting: Boolean = false,
    val errorMessage: String? = null,
    val successMessage: String? = null
) {
    val amount: Double
        get() = amountInput.toDoubleOrNull() ?: 0.0

    val isAmountValid: Boolean
        get() = amount >= 500.0 && amount <= ledger.availableBalance

    val canSubmit: Boolean
        get() = isAmountValid &&
                accountTitle.isNotBlank() &&
                accountNumber.isNotBlank() &&
                !isSubmitting
}

class ResellerWalletViewModel(
    private val resellerRepository: ResellerRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(ResellerWalletUiState())
    val uiState: StateFlow<ResellerWalletUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            combine(
                resellerRepository.resellerSales,
                resellerRepository.withdrawals
            ) { _, withdrawals ->
                val ledger = resellerRepository.getWalletLedger()
                _uiState.value = _uiState.value.copy(
                    ledger = ledger,
                    withdrawals = withdrawals
                )
            }.collect()
        }
    }

    fun onAmountChanged(input: String) {
        _uiState.value = _uiState.value.copy(amountInput = input, errorMessage = null)
    }

    fun onMethodTypeSelected(type: PaymentMethodType) {
        val defaultBank = when (type) {
            PaymentMethodType.EASYPAISA -> "EasyPaisa Mobile Account"
            PaymentMethodType.JAZZCASH -> "JazzCash Mobile Account"
            PaymentMethodType.SADAPAY -> "SadaPay Digital Account"
            PaymentMethodType.NAYAPAY -> "NayaPay Digital Account"
            PaymentMethodType.BANK_TRANSFER -> "Meezan Bank Ltd"
            PaymentMethodType.OTHER -> "Other Account"
        }
        _uiState.value = _uiState.value.copy(
            selectedMethodType = type,
            bankName = defaultBank
        )
    }

    fun onAccountTitleChanged(title: String) {
        _uiState.value = _uiState.value.copy(accountTitle = title)
    }

    fun onAccountNumberChanged(number: String) {
        _uiState.value = _uiState.value.copy(accountNumber = number)
    }

    fun onBankNameChanged(name: String) {
        _uiState.value = _uiState.value.copy(bankName = name)
    }

    fun submitWithdrawalRequest(onSuccess: () -> Unit) {
        val state = _uiState.value
        if (!state.canSubmit) return

        _uiState.value = _uiState.value.copy(isSubmitting = true, errorMessage = null)

        val method = PaymentMethod(
            id = "pm-${System.currentTimeMillis()}",
            methodType = state.selectedMethodType,
            accountTitle = state.accountTitle,
            accountNumber = state.accountNumber,
            bankName = state.bankName,
            isDefault = true
        )

        val result = resellerRepository.createWithdrawalRequest(
            amount = state.amount,
            payoutMethod = method
        )

        result.onSuccess {
            _uiState.value = _uiState.value.copy(
                isSubmitting = false,
                amountInput = "",
                accountTitle = "",
                accountNumber = "",
                successMessage = "Payout request submitted successfully!"
            )
            onSuccess()
        }.onFailure { ex ->
            _uiState.value = _uiState.value.copy(
                isSubmitting = false,
                errorMessage = ex.message
            )
        }
    }
}
