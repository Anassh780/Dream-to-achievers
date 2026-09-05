package com.dreamtoachievers.app.core.model

import kotlinx.serialization.Serializable

@Serializable
data class Referral(
    val id: String = "",
    val referrerId: String = "",
    val referredUserId: String = "",
    val referredUserName: String = "",
    val referralCodeUsed: String = "",
    val status: String = "active",
    val rewardEarned: Double = 0.0,
    val createdAt: String = ""
)

@Serializable
data class TeamMember(
    val id: String = "",
    val name: String = "",
    val avatarUrl: String? = null,
    val joinDate: String = "",
    val isActive: Boolean = true,
    val isQualifying: Boolean = true,
    val rankName: String = "Silver Partner"
) {
    val status: String get() = if (isActive) "active" else "inactive"
}

@Serializable
data class NetworkAnalytics(
    val totalPartners: Int = 126,
    val activePartners: Int = 98,
    val newThisMonth: Int = 24,
    val monthlyGrowthTrend: List<Int> = listOf(14, 18, 22, 19, 24, 28) // Last 6 months new partners
)
