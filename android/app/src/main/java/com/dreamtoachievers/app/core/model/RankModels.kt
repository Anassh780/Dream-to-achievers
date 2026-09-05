package com.dreamtoachievers.app.core.model

import kotlinx.serialization.Serializable

@Serializable
data class RankDefinition(
    val id: String = "",
    val name: String = "",
    val slug: String = "silver",
    val order: Int = 0,
    val requiredSales: Int = 0,
    val requiredCommunity: Int = 0,
    val rewardAmount: Double = 0.0,
    val currency: String = "PKR",
    val accentColor: String = "silver",
    val icon: String = "ShieldStar",
    val tagline: String = "",
    val description: String = "",
    val benefits: List<String> = emptyList(),
    val isActive: Boolean = true
) {
    val formattedReward: String
        get() = "Rs ${rewardAmount.toInt().toString().reversed().chunked(3).joinToString(",").reversed()}"
}

@Serializable
data class RankProgress(
    val currentRank: RankDefinition,
    val nextRank: RankDefinition? = null,
    val qualifyingSales: Int = 0,
    val qualifyingCommunity: Int = 0,
    val salesProgressPercent: Int = 0,
    val communityProgressPercent: Int = 0,
    val overallProgressPercent: Int = 0,
    val missingSales: Int = 0,
    val missingCommunity: Int = 0,
    val isMaxRank: Boolean = false
)

@Serializable
enum class RewardStatus(val rawValue: String, val displayName: String) {
    PENDING_REVIEW("pending_review", "Pending Review"),
    APPROVED("approved", "Approved"),
    PAID("paid", "Paid"),
    REJECTED("rejected", "Rejected");

    companion object {
        fun fromString(value: String): RewardStatus {
            return entries.firstOrNull { it.rawValue.equals(value, ignoreCase = true) } ?: PENDING_REVIEW
        }
    }
}

@Serializable
data class MilestoneReward(
    val id: String = "",
    val userId: String = "",
    val rankSlug: String = "",
    val rankName: String = "",
    val amount: Double = 0.0,
    val currency: String = "PKR",
    val status: RewardStatus = RewardStatus.PENDING_REVIEW,
    val earnedAt: String = "",
    val adminNote: String? = null
) {
    val formattedAmount: String
        get() = "$currency ${amount.toInt().toString().reversed().chunked(3).joinToString(",").reversed()}"
}

@Serializable
data class WalletLedger(
    val realizedProfit: Double = 0.0,
    val pendingProfit: Double = 0.0,
    val withdrawnProfit: Double = 0.0,
    val availableBalance: Double = 0.0,
    val currency: String = "PKR"
) {
    val formattedRealized: String
        get() = "Rs ${realizedProfit.toInt().toString().reversed().chunked(3).joinToString(",").reversed()}"

    val formattedPending: String
        get() = "Rs ${pendingProfit.toInt().toString().reversed().chunked(3).joinToString(",").reversed()}"

    val formattedWithdrawn: String
        get() = "Rs ${withdrawnProfit.toInt().toString().reversed().chunked(3).joinToString(",").reversed()}"

    val formattedAvailable: String
        get() = "Rs ${availableBalance.toInt().toString().reversed().chunked(3).joinToString(",").reversed()}"
}
