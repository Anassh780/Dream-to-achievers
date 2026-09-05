package com.dreamtoachievers.app.core.data

import com.dreamtoachievers.app.core.firebase.FirebaseReferralDataSource
import com.dreamtoachievers.app.core.model.Referral

class ReferralRepository(
    private val dataSource: FirebaseReferralDataSource = FirebaseReferralDataSource(),
    private val dataStoreManager: DataStoreManager
) {

    fun normalizeCode(raw: String): String = dataSource.normalizeReferralCode(raw)

    suspend fun saveIncomingReferralCode(code: String) {
        val normalized = normalizeCode(code)
        if (normalized.isNotBlank()) {
            dataStoreManager.saveReferralCode(normalized)
        }
    }

    suspend fun getCustomerReferrals(userId: String): List<Referral> =
        dataSource.getCustomerReferrals(userId)

    suspend fun recordAttribution(code: String, userId: String, name: String, email: String) =
        dataSource.recordReferralAttribution(code, userId, name, email)
}
