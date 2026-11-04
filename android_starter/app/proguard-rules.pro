# ProGuard rules for KJS Inventory
-keep class com.kjs.inventory.data.** { *; }
-keepclassmembers class * {
    @androidx.compose.runtime.Composable *;
}
