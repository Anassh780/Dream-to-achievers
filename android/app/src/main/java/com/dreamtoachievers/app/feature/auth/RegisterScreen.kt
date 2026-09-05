package com.dreamtoachievers.app.feature.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.CardGiftcard
import androidx.compose.material.icons.outlined.Email
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.Visibility
import androidx.compose.material.icons.outlined.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.Image
import androidx.compose.ui.res.painterResource
import com.dreamtoachievers.app.R
import com.dreamtoachievers.app.core.designsystem.components.DtaPrimaryButton
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme

@Composable
fun RegisterScreen(
    viewModel: AuthViewModel,
    onRegisterSuccess: () -> Unit,
    onNavigateToLogin: () -> Unit,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()

    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var referralCode by remember { mutableStateOf(uiState.referralCode ?: "") }
    var isPasswordVisible by remember { mutableStateOf(false) }

    LaunchedEffect(uiState.referralCode) {
        if (uiState.referralCode != null && referralCode.isBlank()) {
            referralCode = uiState.referralCode!!
        }
    }

    LaunchedEffect(uiState.isSuccess) {
        if (uiState.isSuccess) {
            onRegisterSuccess()
        }
    }

    Scaffold(
        containerColor = DtaTheme.colors.background
    ) { paddingValues ->
        Column(
            modifier = modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = DtaTheme.spacing.ScreenHorizontal),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(28.dp))

            // Branding Header Logo
            Image(
                painter = painterResource(id = R.drawable.brand_logo),
                contentDescription = "Dream to Achievers Logo",
                modifier = Modifier.size(80.dp)
            )

            Spacer(modifier = Modifier.height(14.dp))

            Text(
                text = "Create Account",
                style = DtaTheme.typography.ScreenHeading.copy(
                    color = DtaTheme.colors.primary,
                    fontWeight = FontWeight.Bold,
                    fontSize = 28.sp
                )
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Join Dream to Achievers community & shop with exclusive perks",
                style = DtaTheme.typography.Body.copy(
                    color = DtaTheme.colors.inkSecondary,
                    fontSize = 14.sp
                )
            )

            Spacer(modifier = Modifier.height(28.dp))

            // Error display
            if (uiState.error != null) {
                Surface(
                    shape = DtaTheme.shapes.Small,
                    color = DtaTheme.colors.surfaceAlt,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = uiState.error!!,
                        color = DtaTheme.colors.error,
                        style = DtaTheme.typography.Metadata,
                        modifier = Modifier.padding(12.dp)
                    )
                }
                Spacer(modifier = Modifier.height(16.dp))
            }

            // Name Field
            OutlinedTextField(
                value = name,
                onValueChange = { name = it; viewModel.clearError() },
                label = { Text("Full Name") },
                placeholder = { Text("Your Name") },
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Outlined.Person,
                        contentDescription = null,
                        tint = DtaTheme.colors.primary
                    )
                },
                singleLine = true,
                shape = DtaTheme.shapes.Input,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = DtaTheme.colors.primary,
                    unfocusedBorderColor = DtaTheme.colors.line,
                    focusedContainerColor = DtaTheme.colors.surface,
                    unfocusedContainerColor = DtaTheme.colors.surface
                ),
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Email Field
            OutlinedTextField(
                value = email,
                onValueChange = { email = it; viewModel.clearError() },
                label = { Text("Email Address") },
                placeholder = { Text("name@example.com") },
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Outlined.Email,
                        contentDescription = null,
                        tint = DtaTheme.colors.primary
                    )
                },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                shape = DtaTheme.shapes.Input,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = DtaTheme.colors.primary,
                    unfocusedBorderColor = DtaTheme.colors.line,
                    focusedContainerColor = DtaTheme.colors.surface,
                    unfocusedContainerColor = DtaTheme.colors.surface
                ),
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Password Field
            OutlinedTextField(
                value = password,
                onValueChange = { password = it; viewModel.clearError() },
                label = { Text("Password (min 6 characters)") },
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Outlined.Lock,
                        contentDescription = null,
                        tint = DtaTheme.colors.primary
                    )
                },
                trailingIcon = {
                    IconButton(onClick = { isPasswordVisible = !isPasswordVisible }) {
                        Icon(
                            imageVector = if (isPasswordVisible) Icons.Outlined.VisibilityOff else Icons.Outlined.Visibility,
                            contentDescription = if (isPasswordVisible) "Hide password" else "Show password",
                            tint = DtaTheme.colors.inkMuted
                        )
                    }
                },
                visualTransformation = if (isPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                shape = DtaTheme.shapes.Input,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = DtaTheme.colors.primary,
                    unfocusedBorderColor = DtaTheme.colors.line,
                    focusedContainerColor = DtaTheme.colors.surface,
                    unfocusedContainerColor = DtaTheme.colors.surface
                ),
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Optional Referral Code
            OutlinedTextField(
                value = referralCode,
                onValueChange = { referralCode = it.uppercase() },
                label = { Text("Referral Code (Optional)") },
                placeholder = { Text("e.g. DTA-ABC123") },
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Outlined.CardGiftcard,
                        contentDescription = null,
                        tint = DtaTheme.colors.accentGold
                    )
                },
                singleLine = true,
                shape = DtaTheme.shapes.Input,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = DtaTheme.colors.accentGold,
                    unfocusedBorderColor = DtaTheme.colors.line,
                    focusedContainerColor = DtaTheme.colors.surface,
                    unfocusedContainerColor = DtaTheme.colors.surface
                ),
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(28.dp))

            // Register CTA Button
            DtaPrimaryButton(
                text = "Create Account",
                isLoading = uiState.isLoading,
                onClick = { viewModel.register(name, email, password, referralCode.ifBlank { null }) }
            )

            Spacer(modifier = Modifier.height(28.dp))

            // Sign In Link
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Already have an account? ",
                    style = DtaTheme.typography.Body.copy(color = DtaTheme.colors.inkSecondary)
                )
                Text(
                    text = "Sign In",
                    style = DtaTheme.typography.Body.copy(
                        color = DtaTheme.colors.primary,
                        fontWeight = FontWeight.Bold
                    ),
                    modifier = Modifier.clickable(onClick = onNavigateToLogin)
                )
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}
