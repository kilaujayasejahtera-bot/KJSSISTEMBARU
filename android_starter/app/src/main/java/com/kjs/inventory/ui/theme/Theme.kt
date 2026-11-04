package com.kjs.inventory.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val Navy = Color(0xFF14263D)
val Blue = Color(0xFF246BFD)
val BlueLight = Color(0xFFEBF2FF)
val Pale = Color(0xFFF4F7FB)
val Ink = Color(0xFF1E293B)
val Muted = Color(0xFF64748B)
val Emerald = Color(0xFF10B981)
val EmeraldLight = Color(0xFFD1FAE5)
val Amber = Color(0xFFF59E0B)
val AmberLight = Color(0xFFFEF3C7)
val Rose = Color(0xFFEF4444)
val RoseLight = Color(0xFFFEE2E2)
val BorderColor = Color(0xFFE2E8F0)

private val LightColorScheme = lightColorScheme(
    primary = Blue,
    onPrimary = Color.White,
    secondary = Navy,
    onSecondary = Color.White,
    background = Pale,
    surface = Color.White,
    onSurface = Ink
)

@Composable
fun KjsInventoryTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = LightColorScheme,
        content = content
    )
}
