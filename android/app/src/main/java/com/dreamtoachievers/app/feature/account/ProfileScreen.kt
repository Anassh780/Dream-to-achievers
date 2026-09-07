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
import com.dreamtoachievers.app.core.designsystem.components.DtaSecondaryTopBar
import kotlinx.coroutines.launch

@Composable
fun ProfileScreen(repository: UserRepository, onBack: () -> Unit, onSignIn: () -> Unit) {
    val user by repository.currentUser.collectAsState(initial = null)
    var name by rememberSaveable(user?.id) { mutableStateOf(user?.fullName.orEmpty()) }
    var phone by rememberSaveable(user?.id) { mutableStateOf(user?.phone.orEmpty()) }
    var city by rememberSaveable(user?.id) { mutableStateOf(user?.city.orEmpty()) }
    var saving by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()
    Scaffold(topBar = { DtaSecondaryTopBar("Edit Profile", onBack) }) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).imePadding()
            .verticalScroll(rememberScrollState()).padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)) {
            if (user == null) {
                Text("Sign in to manage your profile and contact details.")
                Button(onClick = onSignIn) { Text("Sign In") }
            } else {
                Text("Keep your contact details up to date.", style = MaterialTheme.typography.titleMedium)
                OutlinedTextField(name, { name = it }, label = { Text("Full name") },
                    modifier = Modifier.fillMaxWidth(), singleLine = true, enabled = !saving)
                OutlinedTextField(user?.email.orEmpty(), {}, label = { Text("Email") },
                    modifier = Modifier.fillMaxWidth(), readOnly = true)
                OutlinedTextField(phone, { phone = it }, label = { Text("Phone") },
                    modifier = Modifier.fillMaxWidth(), singleLine = true, enabled = !saving)
                OutlinedTextField(city, { city = it }, label = { Text("City") },
                    modifier = Modifier.fillMaxWidth(), singleLine = true, enabled = !saving)
                error?.let { Text(it, color = MaterialTheme.colorScheme.error) }
                Button(enabled = !saving && name.isNotBlank(), modifier = Modifier.fillMaxWidth(), onClick = {
                    saving = true
                    error = null
                    scope.launch {
                        repository.updateProfile(name, phone, city).fold(
                            onSuccess = { onBack() },
                            onFailure = { error = it.localizedMessage ?: "Unable to save. Please try again." }
                        )
                        saving = false
                    }
                }) { Text(if (saving) "Saving…" else "Save Changes") }
            }
        }
    }
}
