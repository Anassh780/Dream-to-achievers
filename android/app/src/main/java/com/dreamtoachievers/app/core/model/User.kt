package com.dreamtoachievers.app.core.model

import kotlinx.serialization.Serializable

@Serializable
enum class UserRole(val rawValue: String) {
    CUSTOMER("user"),
    RESELLER("reseller"),
    ADMIN("admin"),
    SUPERADMIN("superadmin");

    companion object {
        fun fromString(value: String): UserRole {
            return entries.firstOrNull { it.rawValue.equals(value, ignoreCase = true) }
                ?: CUSTOMER
        }
    }
}

@Serializable
data class User(
    val id: String = "",
    val fullName: String = "",
    val email: String = "",
    val role: UserRole = UserRole.CUSTOMER,
    val referralCode: String = "",
    val referredByCode: String? = null,
    val avatarUrl: String? = null,
    val phone: String? = null,
    val city: String? = null,
    val rewardPoints: Int = 0,
    val isActive: Boolean = true,
    val createdAt: String = ""
) {
    val isCustomerOnly: Boolean
        get() = role == UserRole.CUSTOMER
}
