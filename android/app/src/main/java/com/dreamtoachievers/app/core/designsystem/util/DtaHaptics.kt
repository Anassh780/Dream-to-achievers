package com.dreamtoachievers.app.core.designsystem.util

import androidx.compose.ui.hapticfeedback.HapticFeedback
import androidx.compose.ui.hapticfeedback.HapticFeedbackType

/**
 * Point 95: High-Precision Subtle Haptic Feedback
 * Provides intentional sensory confirmation for critical business actions:
 * - Successful customer sale submission
 * - Status action confirmation (Verification, Processing, Dispatch, Delivery)
 * - Rank achievement milestone unlocked
 * - Partner withdrawal request submitted
 * - Admin verification action completed
 *
 * Routine scrolling vibrations are strictly prohibited.
 */
object DtaHaptics {

    /**
     * Subtle tap feedback for button presses and selection confirmation.
     */
    fun tap(haptic: HapticFeedback) {
        try {
            haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
        } catch (_: Exception) {
            // Best effort fallback on devices without motor
        }
    }

    /**
     * Firm confirmation feedback for successful state mutations, payouts, and verifications.
     */
    fun success(haptic: HapticFeedback) {
        try {
            haptic.performHapticFeedback(HapticFeedbackType.LongPress)
        } catch (_: Exception) {
            // Best effort fallback
        }
    }

    /**
     * Action feedback alias.
     */
    fun action(haptic: HapticFeedback) {
        success(haptic)
    }

    /**
     * Celebratory or milestone feedback for rank promotions and rewards.
     */
    fun milestone(haptic: HapticFeedback) {
        try {
            haptic.performHapticFeedback(HapticFeedbackType.LongPress)
        } catch (_: Exception) {
            // Best effort fallback
        }
    }
}
