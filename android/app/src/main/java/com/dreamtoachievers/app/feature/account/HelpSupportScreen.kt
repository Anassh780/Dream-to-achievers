package com.dreamtoachievers.app.feature.account

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Chat
import androidx.compose.material.icons.outlined.Email
import androidx.compose.material.icons.outlined.Phone
import androidx.compose.material.icons.outlined.SupportAgent
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dreamtoachievers.app.core.designsystem.components.DtaProfileRow
import com.dreamtoachievers.app.core.designsystem.components.DtaSecondaryTopBar
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme

@Composable
fun HelpSupportScreen(
    onNavigateBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current

    Scaffold(
        topBar = {
            DtaSecondaryTopBar(
                title = "Help & Customer Support",
                onBackClick = onNavigateBack
            )
        },
        containerColor = DtaTheme.colors.background,
        modifier = modifier.fillMaxSize()
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentPadding = PaddingValues(
                start = DtaTheme.spacing.ScreenHorizontal,
                end = DtaTheme.spacing.ScreenHorizontal,
                top = 12.dp,
                bottom = 32.dp
            ),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Text(
                    text = "We are here to assist you",
                    style = DtaTheme.typography.SectionHeading.copy(
                        color = DtaTheme.colors.primary,
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp
                    )
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Our customer support team is available Monday to Saturday (9:00 AM – 8:00 PM PKT).",
                    style = DtaTheme.typography.Metadata.copy(color = DtaTheme.colors.inkSecondary)
                )
            }

            item {
                Card(
                    shape = DtaTheme.shapes.Card,
                    colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, DtaTheme.colors.line, DtaTheme.shapes.Card)
                ) {
                    Column(modifier = Modifier.padding(vertical = 8.dp)) {
                        DtaProfileRow(
                            title = "WhatsApp Support",
                            icon = Icons.Outlined.Chat,
                            subtitle = "+92 305 4511395 (Instant Reply)",
                            onClick = {
                                val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://wa.me/923054511395"))
                                context.startActivity(intent)
                            }
                        )

                        DtaProfileRow(
                            title = "WhatsApp Official Channel",
                            icon = Icons.Outlined.SupportAgent,
                            subtitle = "Join our community announcements",
                            onClick = {
                                val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://whatsapp.com/channel/0029VbDN1jHDuMRkoPvoii0N"))
                                context.startActivity(intent)
                            }
                        )

                        DtaProfileRow(
                            title = "Email Assistance",
                            icon = Icons.Outlined.Email,
                            subtitle = "dreamtoachievers@gmail.com",
                            onClick = {
                                val intent = Intent(Intent.ACTION_SENDTO, Uri.parse("mailto:dreamtoachievers@gmail.com"))
                                context.startActivity(intent)
                            }
                        )

                        DtaProfileRow(
                            title = "Direct Helpline",
                            icon = Icons.Outlined.Phone,
                            subtitle = "+92 305 4511395",
                            onClick = {
                                val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:+923054511395"))
                                context.startActivity(intent)
                            }
                        )
                    }
                }
            }
        }
    }
}
