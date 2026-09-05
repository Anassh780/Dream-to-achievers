package com.dreamtoachievers.app.core.designsystem.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.runtime.SideEffect
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val LightColorScheme = lightColorScheme(
    primary = DtaColors.PrimaryEmerald,
    onPrimary = DtaColors.SurfaceWhite,
    primaryContainer = DtaColors.PrimaryContainer,
    onPrimaryContainer = DtaColors.OnPrimaryContainer,
    secondary = DtaColors.AccentGold,
    onSecondary = DtaColors.SurfaceWhite,
    secondaryContainer = DtaColors.AccentGoldSoft,
    onSecondaryContainer = DtaColors.OnAccentGold,
    background = DtaColors.BackgroundNeutral,
    onBackground = DtaColors.InkPrimary,
    surface = DtaColors.SurfaceWhite,
    onSurface = DtaColors.InkPrimary,
    surfaceVariant = DtaColors.SurfaceAlt,
    onSurfaceVariant = DtaColors.InkSecondary,
    outline = DtaColors.LineSubtle,
    error = DtaColors.Error,
    onError = DtaColors.SurfaceWhite
)

private val DarkColorScheme = darkColorScheme(
    primary = DtaColors.PrimaryLight,
    onPrimary = DtaColors.DarkBackground,
    primaryContainer = DtaColors.PrimaryDark,
    onPrimaryContainer = DtaColors.DarkInkPrimary,
    secondary = DtaColors.AccentGoldLight,
    onSecondary = DtaColors.DarkBackground,
    background = DtaColors.DarkBackground,
    onBackground = DtaColors.DarkInkPrimary,
    surface = DtaColors.DarkSurface,
    onSurface = DtaColors.DarkInkPrimary,
    surfaceVariant = DtaColors.DarkSurfaceAlt,
    onSurfaceVariant = DtaColors.DarkInkSecondary,
    outline = DtaColors.DarkLine,
    error = DtaColors.Error,
    onError = DtaColors.SurfaceWhite
)

private val LocalCustomColors = staticCompositionLocalOf {
    DtaCustomColorScheme(
        primary = DtaColors.PrimaryEmerald,
        primaryDark = DtaColors.PrimaryDark,
        primaryLight = DtaColors.PrimaryLight,
        primaryContainer = DtaColors.PrimaryContainer,
        accentGold = DtaColors.AccentGold,
        background = DtaColors.BackgroundNeutral,
        surface = DtaColors.SurfaceWhite,
        surfaceAlt = DtaColors.SurfaceAlt,
        line = DtaColors.LineSubtle,
        inkPrimary = DtaColors.InkPrimary,
        inkSecondary = DtaColors.InkSecondary,
        inkMuted = DtaColors.InkMuted,
        success = DtaColors.Success,
        pending = DtaColors.Pending,
        error = DtaColors.Error,
        info = DtaColors.Info
    )
}

@Composable
fun DtaTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    val customColors = if (darkTheme) {
        DtaCustomColorScheme(
            primary = DtaColors.PrimaryLight,
            primaryDark = DtaColors.PrimaryDark,
            primaryLight = DtaColors.PrimaryEmerald,
            primaryContainer = DtaColors.PrimaryDark,
            accentGold = DtaColors.AccentGoldLight,
            background = DtaColors.DarkBackground,
            surface = DtaColors.DarkSurface,
            surfaceAlt = DtaColors.DarkSurfaceAlt,
            line = DtaColors.DarkLine,
            inkPrimary = DtaColors.DarkInkPrimary,
            inkSecondary = DtaColors.DarkInkSecondary,
            inkMuted = DtaColors.InkMuted,
            success = DtaColors.Success,
            pending = DtaColors.Pending,
            error = DtaColors.Error,
            info = DtaColors.Info
        )
    } else {
        DtaCustomColorScheme(
            primary = DtaColors.PrimaryEmerald,
            primaryDark = DtaColors.PrimaryDark,
            primaryLight = DtaColors.PrimaryLight,
            primaryContainer = DtaColors.PrimaryContainer,
            accentGold = DtaColors.AccentGold,
            background = DtaColors.BackgroundNeutral,
            surface = DtaColors.SurfaceWhite,
            surfaceAlt = DtaColors.SurfaceAlt,
            line = DtaColors.LineSubtle,
            inkPrimary = DtaColors.InkPrimary,
            inkSecondary = DtaColors.InkSecondary,
            inkMuted = DtaColors.InkMuted,
            success = DtaColors.Success,
            pending = DtaColors.Pending,
            error = DtaColors.Error,
            info = DtaColors.Info
        )
    }

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = customColors.background.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    CompositionLocalProvider(
        LocalCustomColors provides customColors
    ) {
        MaterialTheme(
            colorScheme = colorScheme,
            shapes = DtaShapes.MaterialShapes,
            typography = DtaTypography.MaterialTypography,
            content = content
        )
    }
}

object DtaTheme {
    val colors: DtaCustomColorScheme
        @Composable
        @ReadOnlyComposable
        get() = LocalCustomColors.current

    val typography: DtaTypography
        get() = DtaTypography

    val shapes: DtaShapes
        get() = DtaShapes

    val spacing: DtaSpacing
        get() = DtaSpacing
}
