package com.dreamtoachievers.app.core.firebase

import com.dreamtoachievers.app.core.model.User
import com.dreamtoachievers.app.core.model.UserRole
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await

class FirebaseUserDataSource(
    private val auth: FirebaseAuth = FirebaseAuth.getInstance(),
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance(),
    private val rtdb: FirebaseDatabase = FirebaseDatabase.getInstance()
) {

    fun getCurrentFirebaseUser() = auth.currentUser

    suspend fun getUserProfile(uid: String): User? {
        return try {
            val doc = firestore.collection(FirebaseConfig.COLLECTION_USERS).document(uid).get().await()
            if (doc.exists()) {
                User(
                    id = doc.getString("id") ?: uid,
                    fullName = doc.getString("fullName") ?: "",
                    email = doc.getString("email") ?: "",
                    role = UserRole.fromString(doc.getString("role") ?: "user"),
                    referralCode = doc.getString("referralCode") ?: "",
                    referredByCode = doc.getString("referredByCode"),
                    avatarUrl = doc.getString("avatarUrl"),
                    phone = doc.getString("phone"),
                    city = doc.getString("city"),
                    rewardPoints = (doc.getLong("rewardPoints") ?: 0).toInt(),
                    isActive = doc.getBoolean("isActive") ?: true,
                    createdAt = doc.getString("createdAt") ?: ""
                )
            } else null
        } catch (e: Exception) {
            null
        }
    }

    suspend fun saveUserProfile(user: User) {
        val data = hashMapOf(
            "id" to user.id,
            "fullName" to user.fullName,
            "email" to user.email.lowercase().trim(),
            "role" to user.role.rawValue,
            "referralCode" to user.referralCode,
            "referredByCode" to (user.referredByCode ?: ""),
            "avatarUrl" to (user.avatarUrl ?: ""),
            "phone" to (user.phone ?: ""),
            "city" to (user.city ?: ""),
            "rewardPoints" to user.rewardPoints,
            "isActive" to user.isActive,
            "createdAt" to user.createdAt
        )

        firestore.collection(FirebaseConfig.COLLECTION_USERS).document(user.id).set(data).await()
        try {
            rtdb.reference.child("${FirebaseConfig.RTDB_PATH_USERS}/${user.id}").setValue(data).await()
        } catch (e: Exception) {
            // RTDB best-effort
        }
    }
}
