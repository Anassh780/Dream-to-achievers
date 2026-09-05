package com.dreamtoachievers.app.core.data

import com.dreamtoachievers.app.core.firebase.FirebaseUserDataSource
import com.dreamtoachievers.app.core.model.User
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

class UserRepository(
    private val dataSource: FirebaseUserDataSource = FirebaseUserDataSource(),
    private val dataStoreManager: DataStoreManager,
    private val auth: FirebaseAuth = FirebaseAuth.getInstance()
) {

    private val _currentUser = MutableStateFlow<User?>(null)
    val currentUser: Flow<User?> = _currentUser.asStateFlow()

    init {
        auth.addAuthStateListener { firebaseAuth ->
            val fbUser = firebaseAuth.currentUser
            if (fbUser != null) {
                // Fetch profile in background
                kotlinx.coroutines.CoroutineScope(kotlinx.coroutines.Dispatchers.IO).launch {
                    val profile = dataSource.getUserProfile(fbUser.uid) ?: User(
                        id = fbUser.uid,
                        email = fbUser.email ?: "",
                        fullName = fbUser.displayName ?: fbUser.email?.split("@")?.firstOrNull() ?: "Customer"
                    )
                    _currentUser.value = profile
                    dataStoreManager.saveUserSession(
                        id = profile.id,
                        email = profile.email,
                        name = profile.fullName,
                        role = profile.role.rawValue
                    )
                }
            } else {
                _currentUser.value = null
                kotlinx.coroutines.CoroutineScope(kotlinx.coroutines.Dispatchers.IO).launch {
                    dataStoreManager.clearUserSession()
                }
            }
        }
    }

    suspend fun login(email: String, pass: String): Result<User> {
        return try {
            val authResult = auth.signInWithEmailAndPassword(email.trim(), pass).await()
            val uid = authResult.user?.uid ?: throw IllegalStateException("User ID not found")
            val profile = dataSource.getUserProfile(uid) ?: User(
                id = uid,
                email = email,
                fullName = authResult.user?.displayName ?: email.split("@").first()
            )
            _currentUser.value = profile
            dataStoreManager.saveUserSession(profile.id, profile.email, profile.fullName, profile.role.rawValue)
            Result.success(profile)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun register(name: String, email: String, pass: String, referralCode: String?): Result<User> {
        return try {
            val authResult = auth.createUserWithEmailAndPassword(email.trim(), pass).await()
            val uid = authResult.user?.uid ?: throw IllegalStateException("Registration failed")
            val generatedRefCode = "DTA-${uid.take(6).uppercase()}"

            val newUser = User(
                id = uid,
                fullName = name.trim(),
                email = email.trim(),
                referralCode = generatedRefCode,
                referredByCode = referralCode?.trim()?.uppercase()?.ifEmpty { null }
            )

            dataSource.saveUserProfile(newUser)
            _currentUser.value = newUser
            dataStoreManager.saveUserSession(newUser.id, newUser.email, newUser.fullName, newUser.role.rawValue)
            Result.success(newUser)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun logout() {
        auth.signOut()
        _currentUser.value = null
        dataStoreManager.clearUserSession()
    }
}
