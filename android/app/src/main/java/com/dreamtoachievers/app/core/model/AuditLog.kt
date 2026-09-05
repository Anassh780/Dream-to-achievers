package com.dreamtoachievers.app.core.model

import kotlinx.serialization.Serializable

@Serializable
data class AuditLog(
    val id: String = "",
    val actorId: String = "",
    val actorName: String = "",
    val actorRole: String = "ADMIN",
    val action: String = "",
    val entityType: String = "",
    val entityId: String = "",
    val previousState: String? = null,
    val newState: String? = null,
    val note: String? = null,
    val metadata: Map<String, String> = emptyMap(),
    val timestamp: String = ""
) {
    val formattedTimestamp: String
        get() = if (timestamp.contains("T")) {
            val datePart = timestamp.substringBefore("T")
            val timePart = timestamp.substringAfter("T").take(5)
            "$datePart • $timePart"
        } else {
            timestamp
        }
}
