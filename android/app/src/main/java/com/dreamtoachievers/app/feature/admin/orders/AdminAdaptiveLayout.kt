package com.dreamtoachievers.app.feature.admin.orders

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.dreamtoachievers.app.core.data.AdminRepository
import com.dreamtoachievers.app.core.designsystem.components.DtaEmptyState
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme

/**
 * Points 77, 79, 80: Tablet & Adaptive Large Screen Layout
 * On tablets (width >= 600dp), presents a responsive List-Detail interface:
 * - Left Pane: Order Verification Queue (Point 43)
 * - Right Pane: Order Review Desk (Screen 08 — Points 44-55)
 */
@Composable
fun AdminAdaptiveOrderVerificationScreen(
    viewModel: AdminOrderVerificationViewModel,
    adminRepository: AdminRepository,
    onNavigateBack: () -> Unit,
    onNavigateToReview: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    BoxWithConstraints(modifier = modifier.fillMaxSize()) {
        val isTablet = maxWidth >= 600.dp

        if (isTablet) {
            // Adaptive 2-Pane List-Detail Layout (Point 79)
            val state by viewModel.uiState.collectAsState()
            var selectedOrderId by remember {
                mutableStateOf(state.orders.firstOrNull()?.id ?: "DS1008")
            }

            Row(modifier = Modifier.fillMaxSize()) {
                // Left Pane: Order Queue (380dp)
                Box(
                    modifier = Modifier
                        .width(380.dp)
                        .fillMaxHeight()
                        .border(width = 1.dp, color = DtaTheme.colors.line)
                ) {
                    AdminOrderVerificationScreen(
                        viewModel = viewModel,
                        onNavigateBack = onNavigateBack,
                        onNavigateToReview = { orderId ->
                            selectedOrderId = orderId
                        }
                    )
                }

                // Right Pane: Live Screen 08 Review Desk
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxHeight()
                        .background(DtaTheme.colors.background)
                ) {
                    if (selectedOrderId.isNotBlank()) {
                        AdminOrderReviewScreen(
                            orderId = selectedOrderId,
                            adminRepository = adminRepository,
                            onNavigateBack = { /* In tablet view, right pane stays loaded */ }
                        )
                    } else {
                        Box(
                            modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center
                        ) {
                            DtaEmptyState(
                                title = "Select an Order to Review",
                                message = "Select any pending verification order from the queue on the left to inspect customer payment proof."
                            )
                        }
                    }
                }
            }
        } else {
            // Standard Mobile Layout
            AdminOrderVerificationScreen(
                viewModel = viewModel,
                onNavigateBack = onNavigateBack,
                onNavigateToReview = onNavigateToReview
            )
        }
    }
}
