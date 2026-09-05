package com.dreamtoachievers.app.core.designsystem.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Shapes
import androidx.compose.ui.unit.dp

object DtaShapes {
    val Small = RoundedCornerShape(10.dp)
    val Input = RoundedCornerShape(14.dp)
    val Chip = RoundedCornerShape(14.dp)
    val Button = RoundedCornerShape(16.dp)
    val Card = RoundedCornerShape(20.dp)
    val HeroCard = RoundedCornerShape(24.dp)
    val Hero = HeroCard
    val Image: RoundedCornerShape get() = Small
    val BottomSheet = RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp)
    val Full = RoundedCornerShape(9999.dp)

    val MaterialShapes = Shapes(
        small = Small,
        medium = Card,
        large = HeroCard,
        extraLarge = BottomSheet
    )
}
