package com.dreamtoachievers.app.core.firebase

import com.dreamtoachievers.app.core.model.User
import com.dreamtoachievers.app.core.model.UserRole
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.FieldValue
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

class FirebaseUserDataSource(
    private val auth: FirebaseAuth = FirebaseAuth.getInstance(),
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance()
) {

    fun getCurrentFirebaseUser() = auth.currentUser

    suspend fun updateContactProfile(uid: String, fullName: String, phone: String, city: String) {
        firestore.collection(FirebaseConfig.COLLECTION_USERS).document(uid)
            .update(mapOf("fullName" to fullName, "phone" to phone, "city" to city)).await()
    }

    fun observeAddresses(uid: String): Flow<List<String>> = callbackFlow {
        val registration = firestore.collection(FirebaseConfig.COLLECTION_USERS).document(uid)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    trySend(emptyList())
                    return@addSnapshotListener
                }
                val addresses = (snapshot?.get("addresses") as? List<*>)
                    .orEmpty()
                    .mapNotNull { it as? String }
                    .map(String::trim)
                    .filter(String::isNotEmpty)
                    .distinct()
                trySend(addresses)
            }
        awaitClose { registration.remove() }
    }

    suspend fun addAddress(uid: String, address: String) {
        firestore.collection(FirebaseConfig.COLLECTION_USERS).document(uid)
            .update("addresses", FieldValue.arrayUnion(address)).await()
    }

    suspend fun removeAddress(uid: String, address: String) {
        firestore.collection(FirebaseConfig.COLLECTION_USERS).document(uid)
            .update("addresses", FieldValue.arrayRemove(address)).await()
    }

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
        if (user.referralCode.isNotBlank()) {
            val normalized = user.referralCode.uppercase().replace(Regex("^DTA-?"), "").replace("[^A-Z0-9]".toRegex(), "")
            firestore.collection("referral_index").document(normalized)
                .set(mapOf("userId" to user.id, "referralCode" to user.referralCode)).await()
        }
    }
}
