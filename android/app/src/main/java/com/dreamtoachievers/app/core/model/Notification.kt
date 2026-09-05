package com.dreamtoachievers.app.core.model

import kotlinx.serialization.Serializable

@Serializable
data class Notification(
    val id: String = "",
    val userId: String = "",
    val targetRole: UserRole? = null,
    val type: String = "info",
    val category: String = "general",
    val title: String = "",
    val message: String = "",
    val isRead: Boolean = false,
    val linkUrl: String? = null,
    val deepLinkRoute: String? = null,
    val createdAt: String = ""
)
