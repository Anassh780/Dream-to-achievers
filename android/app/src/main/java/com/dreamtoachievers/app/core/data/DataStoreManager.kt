package com.dreamtoachievers.app.core.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "dta_preferences")

class DataStoreManager(private val context: Context) {

    private object PreferencesKeys {
        val REFERRAL_CODE = stringPreferencesKey("referral_code")
        val USER_ID = stringPreferencesKey("user_id")
        val USER_EMAIL = stringPreferencesKey("user_email")
        val USER_NAME = stringPreferencesKey("user_name")
        val USER_ROLE = stringPreferencesKey("user_role")
        val FAVORITE_PRODUCT_IDS = stringSetPreferencesKey("favorite_product_ids")
        val THEME_DARK = booleanPreferencesKey("theme_dark")
    }

    val referralCode: Flow<String?> = context.dataStore.data.map { preferences ->
        preferences[PreferencesKeys.REFERRAL_CODE]
    }

    suspend fun saveReferralCode(code: String) {
        context.dataStore.edit { preferences ->
            preferences[PreferencesKeys.REFERRAL_CODE] = code.trim().uppercase()
        }
    }

    val userId: Flow<String?> = context.dataStore.data.map { preferences ->
        preferences[PreferencesKeys.USER_ID]
    }

    val userEmail: Flow<String?> = context.dataStore.data.map { preferences ->
        preferences[PreferencesKeys.USER_EMAIL]
    }

    val userName: Flow<String?> = context.dataStore.data.map { preferences ->
        preferences[PreferencesKeys.USER_NAME]
    }

    val userRole: Flow<String?> = context.dataStore.data.map { preferences ->
        preferences[PreferencesKeys.USER_ROLE]
    }

    suspend fun saveUserSession(id: String, email: String, name: String, role: String) {
        context.dataStore.edit { preferences ->
            preferences[PreferencesKeys.USER_ID] = id
            preferences[PreferencesKeys.USER_EMAIL] = email
            preferences[PreferencesKeys.USER_NAME] = name
            preferences[PreferencesKeys.USER_ROLE] = role
        }
    }

    suspend fun clearUserSession() {
        context.dataStore.edit { preferences ->
            preferences.remove(PreferencesKeys.USER_ID)
            preferences.remove(PreferencesKeys.USER_EMAIL)
            preferences.remove(PreferencesKeys.USER_NAME)
            preferences.remove(PreferencesKeys.USER_ROLE)
        }
    }

    val favoriteProductIds: Flow<Set<String>> = context.dataStore.data.map { preferences ->
        preferences[PreferencesKeys.FAVORITE_PRODUCT_IDS] ?: emptySet()
    }

    suspend fun toggleFavorite(productId: String) {
        context.dataStore.edit { preferences ->
            val current = preferences[PreferencesKeys.FAVORITE_PRODUCT_IDS] ?: emptySet()
            if (current.contains(productId)) {
                preferences[PreferencesKeys.FAVORITE_PRODUCT_IDS] = current - productId
            } else {
                preferences[PreferencesKeys.FAVORITE_PRODUCT_IDS] = current + productId
            }
        }
    }
}
