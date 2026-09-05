# Add project specific ProGuard rules here.
-keepattributes *Annotation*
-keepclassmembers class * {
    @androidx.compose.runtime.Composable *;
}
-keep class com.dreamtoachievers.app.core.model.** { *; }
-keepclassmembers class com.dreamtoachievers.app.core.model.** { *; }
