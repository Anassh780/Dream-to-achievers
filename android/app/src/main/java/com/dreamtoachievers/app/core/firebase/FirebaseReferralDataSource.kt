package com.dreamtoachievers.app.core.firebase

import com.dreamtoachievers.app.core.model.Referral
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await
import java.text.SimpleDateFormat
import java.util.*

class FirebaseReferralDataSource(
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance()
) {

    fun normalizeReferralCode(code: String): String {
        return code.trim().uppercase().replace("[^A-Z0-9-]".toRegex(), "")
    }

    suspend fun recordReferralAttribution(
        referrerCode: String,
        newUserId: String,
        newUserName: String,
        newUserEmail: String
    ) {
        val cleanCode = normalizeReferralCode(referrerCode)
        if (cleanCode.isBlank()) return

        try {
            // Find referrer by referralCode
            val snap = firestore.collection(FirebaseConfig.COLLECTION_USERS)
                .whereEqualTo("referralCode", cleanCode)
                .limit(1)
                .get()
                .await()

            val referrerDoc = snap.documents.firstOrNull()
            val referrerId = referrerDoc?.getString("id") ?: "system-admin"

            val refId = "ref-${System.currentTimeMillis()}-${(100..999).random()}"
            val isoDate = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).apply {
                timeZone = TimeZone.getTimeZone("UTC")
            }.format(Date())

            val referralData = hashMapOf(
                "id" to refId,
                "referrerId" to referrerId,
                "referredUserId" to newUserId,
                "referredUserName" to newUserName,
                "referredUserEmail" to newUserEmail,
                "referralCodeUsed" to cleanCode,
                "status" to "active",
                "isQualifying" to false,
                "createdAt" to isoDate
            )

            firestore.collection(FirebaseConfig.COLLECTION_REFERRALS).document(refId).set(referralData).await()
        } catch (e: Exception) {
            // Best-effort attribution recording
        }
    }

    suspend fun getCustomerReferrals(userId: String): List<Referral> {
        return try {
            val snap = firestore.collection(FirebaseConfig.COLLECTION_REFERRALS)
                .whereEqualTo("referrerId", userId)
                .get()
                .await()

            snap.documents.mapNotNull { doc ->
                try {
                    Referral(
                        id = doc.getString("id") ?: doc.id,
                        referrerId = doc.getString("referrerId") ?: "",
                        referredUserId = doc.getString("referredUserId") ?: "",
                        referredUserName = doc.getString("referredUserName") ?: "Community Member",
                        referralCodeUsed = doc.getString("referralCodeUsed") ?: "",
                        status = doc.getString("status") ?: "active",
                        rewardEarned = 100.0, // Customer shopping reward credits
                        createdAt = doc.getString("createdAt") ?: ""
                    )
                } catch (e: Exception) {
                    null
                }
            }
        } catch (e: Exception) {
            emptyList()
        }
    }
}
