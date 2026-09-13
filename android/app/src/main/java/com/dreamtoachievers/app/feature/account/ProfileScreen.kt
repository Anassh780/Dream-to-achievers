package com.dreamtoachievers.app.feature.account

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.dreamtoachievers.app.core.data.UserRepository
import com.dreamtoachievers.app.core.designsystem.components.DtaPrimaryButton
import com.dreamtoachievers.app.core.designsystem.components.DtaSecondaryTopBar
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme
import kotlinx.coroutines.launch

@Composable
fun ProfileScreen(repository: UserRepository, onBack: () -> Unit, onSignIn: () -> Unit) {
    val user by repository.currentUser.collectAsState(initial = null)
    var name by rememberSaveable(user?.id) { mutableStateOf(user?.fullName.orEmpty()) }
    var phone by rememberSaveable(user?.id) { mutableStateOf(user?.phone.orEmpty()) }
    var city by rememberSaveable(user?.id) { mutableStateOf(user?.city.orEmpty()) }
    var saving by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var saveConfirmation by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    val snackbarHostState = remember { SnackbarHostState() }
    LaunchedEffect(saveConfirmation) {
        if (saveConfirmation) {
            snackbarHostState.showSnackbar("Profile changes saved.")
            saveConfirmation = false
        }
    }
    Scaffold(
        topBar = { DtaSecondaryTopBar("Edit Profile", onBack) },
        snackbarHost = { SnackbarHost(hostState = snackbarHostState) },
        containerColor = DtaTheme.colors.background
    ) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).imePadding()
            .verticalScroll(rememberScrollState()).padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)) {
            if (user == null) {
                Text("Sign in to manage your profile and contact details.", style = DtaTheme.typography.Body)
                DtaPrimaryButton(text = "Sign In", onClick = onSignIn)
            } else {
                Text("Keep your contact details up to date.", style = DtaTheme.typography.TitleMedium)
                OutlinedTextField(name, { name = it; saveConfirmation = false }, label = { Text("Full name *") },
                    modifier = Modifier.fillMaxWidth(), singleLine = true, enabled = !saving)
                OutlinedTextField(user?.email.orEmpty(), {}, label = { Text("Email") },
                    modifier = Modifier.fillMaxWidth(), readOnly = true)
                OutlinedTextField(phone, { phone = it; saveConfirmation = false }, label = { Text("Phone") },
                    modifier = Modifier.fillMaxWidth(), singleLine = true, enabled = !saving)
                OutlinedTextField(city, { city = it; saveConfirmation = false }, label = { Text("City") },
                    modifier = Modifier.fillMaxWidth(), singleLine = true, enabled = !saving)
                error?.let { Text(it, color = DtaTheme.colors.error, style = DtaTheme.typography.BodySmall) }
                DtaPrimaryButton(
                    text = "Save Changes",
                    enabled = !saving && name.isNotBlank(),
                    isLoading = saving,
                    onClick = {
                    saving = true
                    error = null
                    scope.launch {
                        repository.updateProfile(name, phone, city).fold(
                            onSuccess = { saveConfirmation = true },
                            onFailure = { error = "We couldn't save your profile. Check your connection and try again." }
                        )
                        saving = false
                    }
                }
                )
            }
        }
    }
}
