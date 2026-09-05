package com.dreamtoachievers.app.core.designsystem.theme

import androidx.compose.runtime.Immutable
import androidx.compose.ui.graphics.Color

object DtaColors {
    // Brand Emerald Palette (Official Dream to Achievers Reference: Vibrant Modern Emerald)
    val PrimaryEmerald = Color(0xFF007A55)
    val PrimaryDark = Color(0xFF005A3E)
    val PrimaryLight = Color(0xFF059669)
    val PrimaryContainer = Color(0xFFE6F4EA)
    val OnPrimaryContainer = Color(0xFF004D34)

    // Accent Gold (Rewards, Tiers & Milestones)
    val AccentGold = Color(0xFFD97706)
    val AccentGoldLight = Color(0xFFF59E0B)
    val AccentGoldSoft = Color(0xFFFEF3C7)
    val OnAccentGold = Color(0xFF78350F)

    // Surfaces & Backgrounds (Crisp Modern Commerce & Fintech Aesthetic)
    val BackgroundNeutral = Color(0xFFF8F9FA)
    val SurfaceWhite = Color(0xFFFFFFFF)
    val SurfaceAlt = Color(0xFFF3F4F6)
    val SurfaceSubtle = Color(0xFFF9FAFB)
    val LineSubtle = Color(0xFFE5E7EB)
    val LineBorder = Color(0xFFE5E7EB)

    // Text & Ink (High Contrast Typography)
    val InkPrimary = Color(0xFF111827)
    val InkSecondary = Color(0xFF4B5563)
    val InkMuted = Color(0xFF9CA3AF)
    val InkInverse = Color(0xFFFFFFFF)

    // Semantic Status Tokens (Reference Status Badges & Pills)
    val Success = Color(0xFF059669)
    val SuccessContainer = Color(0xFFD1FAE5)
    val OnSuccessContainer = Color(0xFF065F46)

    val Pending = Color(0xFFD97706)
    val PendingContainer = Color(0xFFFEF3C7)
    val OnPendingContainer = Color(0xFF92400E)

    val Error = Color(0xFFDC2626)
    val ErrorContainer = Color(0xFFFEE2E2)
    val OnErrorContainer = Color(0xFF991B1B)

    val Info = Color(0xFF2563EB)
    val InfoContainer = Color(0xFFDBEAFE)
    val OnInfoContainer = Color(0xFF1E40AF)

    // Dark Mode equivalents
    val DarkBackground = Color(0xFF0B100D)
    val DarkSurface = Color(0xFF141C18)
    val DarkSurfaceAlt = Color(0xFF1B2620)
    val DarkLine = Color(0xFF24352B)
    val DarkInkPrimary = Color(0xFFF4F3EE)
    val DarkInkSecondary = Color(0xFFA2B1A8)
}

@Immutable
data class DtaCustomColorScheme(
    val primary: Color,
    val primaryDark: Color,
    val primaryLight: Color,
    val primaryContainer: Color,
    val accentGold: Color,
    val background: Color,
    val surface: Color,
    val surfaceAlt: Color,
    val line: Color,
    val inkPrimary: Color,
    val inkSecondary: Color,
    val inkMuted: Color,
    val success: Color,
    val pending: Color,
    val error: Color,
    val info: Color
) {
    // Convenient aliases used across existing screens
    val ink: Color get() = inkPrimary
    val accent: Color get() = accentGold
    val accentLight: Color get() = DtaColors.AccentGoldLight
    val accentGoldLight: Color get() = DtaColors.AccentGoldLight
    val accentSoft: Color get() = DtaColors.AccentGoldSoft
    val accentGoldSoft: Color get() = DtaColors.AccentGoldSoft
    val errorContainer: Color get() = DtaColors.ErrorContainer
    val semanticError: Color get() = error
    val semanticSuccess: Color get() = success
    val semanticPending: Color get() = pending
    val semanticInfo: Color get() = info
}
