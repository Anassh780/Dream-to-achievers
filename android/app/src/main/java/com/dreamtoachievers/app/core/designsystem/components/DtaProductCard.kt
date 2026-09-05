package com.dreamtoachievers.app.core.designsystem.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme
import com.dreamtoachievers.app.core.model.Product

@Composable
fun DtaProductCard(
    product: Product,
    onClick: () -> Unit,
    onAddToCart: () -> Unit,
    isFavorite: Boolean = false,
    onToggleFavorite: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val scale by animateFloatAsState(
        targetValue = if (isPressed) 0.98f else 1.0f,
        label = "ProductCardScale"
    )

    Card(
        shape = DtaTheme.shapes.Card,
        colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
        modifier = modifier
            .scale(scale)
            .fillMaxWidth()
            .border(1.dp, DtaTheme.colors.line, DtaTheme.shapes.Card)
            .clickable(
                interactionSource = interactionSource,
                indication = null,
                onClick = onClick
            )
    ) {
        Column {
            // Image Box with Badge & Favorite Icon
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(1.05f)
                    .clip(DtaTheme.shapes.Card)
                    .background(DtaTheme.colors.surfaceAlt)
            ) {
                AsyncImage(
                    model = product.imageUrl,
                    contentDescription = product.name,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )

                // Top left badge: discount or verified
                Row(
                    modifier = Modifier
                        .align(Alignment.TopStart)
                        .padding(8.dp)
                ) {
                    product.discountPercentage?.let { discount ->
                        DtaDiscountBadge(discountPercent = discount)
                    } ?: run {
                        DtaVerifiedBadge()
                    }
                }

                // Top right favorite button
                IconButton(
                    onClick = onToggleFavorite,
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(6.dp)
                        .size(36.dp)
                        .background(DtaTheme.colors.surface.copy(alpha = 0.9f), CircleShape)
                        .border(0.5.dp, DtaTheme.colors.line, CircleShape)
                ) {
                    Icon(
                        imageVector = if (isFavorite) Icons.Filled.Favorite else Icons.Outlined.FavoriteBorder,
                        contentDescription = "Favorite",
                        tint = if (isFavorite) DtaTheme.colors.error else DtaTheme.colors.inkSecondary,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }

            // Info Column
            Column(
                modifier = Modifier.padding(12.dp)
            ) {
                // Category & Rating Row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = product.category,
                        style = DtaTheme.typography.Metadata.copy(
                            color = DtaTheme.colors.inkMuted,
                            fontSize = 11.sp
                        ),
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.weight(1f, fill = false)
                    )

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Star,
                            contentDescription = null,
                            tint = DtaTheme.colors.accentGold,
                            modifier = Modifier.size(13.dp)
                        )
                        Spacer(modifier = Modifier.width(3.dp))
                        Text(
                            text = product.rating.toString(),
                            style = DtaTheme.typography.Label.copy(
                                color = DtaTheme.colors.inkPrimary,
                                fontWeight = FontWeight.Bold,
                                fontSize = 11.sp
                            )
                        )
                    }
                }

                Spacer(modifier = Modifier.height(4.dp))

                // Product Title (constrained to 2 lines)
                Text(
                    text = product.name,
                    style = DtaTheme.typography.CardTitle.copy(
                        color = DtaTheme.colors.inkPrimary,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold
                    ),
                    maxLines = 2,
                    minLines = 2,
                    overflow = TextOverflow.Ellipsis
                )

                Spacer(modifier = Modifier.height(8.dp))

                // Price & Add to Cart Row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        DtaPriceText(
                            price = product.retailPrice,
                            originalPrice = product.originalPrice,
                            fontSize = 15.sp
                        )
                        if (!product.inStock) {
                            Text(
                                text = "Out of Stock",
                                style = DtaTheme.typography.Label.copy(
                                    color = DtaTheme.colors.error,
                                    fontSize = 10.sp
                                )
                            )
                        }
                    }

                    // Compact Add to Cart Button
                    Box(
                        modifier = Modifier
                            .size(34.dp)
                            .clip(androidx.compose.foundation.shape.RoundedCornerShape(8.dp))
                            .background(
                                if (product.inStock) DtaTheme.colors.primary else DtaTheme.colors.line
                            )
                            .clickable(enabled = product.inStock, onClick = onAddToCart),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Outlined.Add,
                            contentDescription = "Add to Cart",
                            tint = Color.White,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            }
        }
    }
}

/**
 * Points 83 & 84: Consistent Product Card across Roles (Customer, Reseller, Admin)
 */
enum class ProductCardRole {
    CUSTOMER,
    RESELLER,
    ADMIN
}

@Composable
fun DtaUnifiedProductCard(
    role: ProductCardRole,
    name: String,
    imageUrl: String,
    categoryName: String,
    retailPrice: Double,
    partnerPrice: Double? = null,
    suggestedSellingPrice: Double? = null,
    stockCount: Int? = null,
    inStock: Boolean = true,
    discountPercent: Int? = null,
    isFavorite: Boolean = false,
    onClick: () -> Unit,
    onPrimaryAction: () -> Unit,
    onToggleFavorite: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val scale by animateFloatAsState(
        targetValue = if (isPressed) 0.98f else 1.0f,
        label = "UnifiedProductCardScale"
    )

    Card(
        shape = DtaTheme.shapes.Card,
        colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
        modifier = modifier
            .scale(scale)
            .fillMaxWidth()
            .border(1.dp, DtaTheme.colors.line, DtaTheme.shapes.Card)
            .clickable(
                interactionSource = interactionSource,
                indication = null,
                onClick = onClick
            )
    ) {
        Column {
            // Image Box
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(1.05f)
                    .clip(DtaTheme.shapes.Card)
                    .background(DtaTheme.colors.surfaceAlt)
            ) {
                AsyncImage(
                    model = imageUrl,
                    contentDescription = name,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )

                // Badges
                Row(
                    modifier = Modifier
                        .align(Alignment.TopStart)
                        .padding(8.dp)
                ) {
                    when (role) {
                        ProductCardRole.CUSTOMER -> {
                            discountPercent?.let { discount ->
                                DtaDiscountBadge(discountPercent = discount)
                            } ?: DtaVerifiedBadge()
                        }
                        ProductCardRole.RESELLER -> {
                            val profit = (suggestedSellingPrice ?: retailPrice) - (partnerPrice ?: 0.0)
                            if (profit > 0) {
                                Box(
                                    modifier = Modifier
                                        .clip(DtaTheme.shapes.Chip)
                                        .background(DtaTheme.colors.primary)
                                        .padding(horizontal = 7.dp, vertical = 3.dp)
                                ) {
                                    Text(
                                        text = "+Rs ${profit.toInt()}",
                                        style = DtaTheme.typography.Label.copy(
                                            color = Color.White,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 10.sp
                                        )
                                    )
                                }
                            }
                        }
                        ProductCardRole.ADMIN -> {
                            Box(
                                modifier = Modifier
                                    .clip(DtaTheme.shapes.Chip)
                                    .background(
                                        if ((stockCount ?: 0) < 10) DtaTheme.colors.errorContainer
                                        else DtaTheme.colors.surfaceAlt
                                    )
                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                            ) {
                                Text(
                                    text = "Stock: ${stockCount ?: 0}",
                                    style = DtaTheme.typography.Label.copy(
                                        color = if ((stockCount ?: 0) < 10) DtaTheme.colors.error else DtaTheme.colors.inkSecondary,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 10.sp
                                    )
                                )
                            }
                        }
                    }
                }

                // Favorite Icon for Customer only
                if (role == ProductCardRole.CUSTOMER) {
                    IconButton(
                        onClick = onToggleFavorite,
                        modifier = Modifier
                            .align(Alignment.TopEnd)
                            .padding(6.dp)
                            .size(34.dp)
                            .background(DtaTheme.colors.surface.copy(alpha = 0.9f), CircleShape)
                    ) {
                        Icon(
                            imageVector = if (isFavorite) Icons.Filled.Favorite else Icons.Outlined.FavoriteBorder,
                            contentDescription = "Wishlist",
                            tint = if (isFavorite) DtaTheme.colors.error else DtaTheme.colors.inkSecondary,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }

            // Info Section
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(10.dp)
            ) {
                Text(
                    text = categoryName.uppercase(),
                    style = DtaTheme.typography.Overline.copy(
                        color = DtaTheme.colors.inkSecondary,
                        fontSize = 9.sp,
                        letterSpacing = 0.5.sp
                    ),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )

                Spacer(modifier = Modifier.height(3.dp))

                Text(
                    text = name,
                    style = DtaTheme.typography.CardTitle.copy(
                        color = DtaTheme.colors.inkPrimary,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold
                    ),
                    maxLines = 2,
                    minLines = 2,
                    overflow = TextOverflow.Ellipsis
                )

                Spacer(modifier = Modifier.height(6.dp))

                // Role-Specific Price & Action Row (Points 83 & 84)
                when (role) {
                    ProductCardRole.CUSTOMER -> {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                DtaPriceText(price = retailPrice, fontSize = 14.sp)
                                if (!inStock) {
                                    Text(
                                        text = "Out of Stock",
                                        style = DtaTheme.typography.Label.copy(
                                            color = DtaTheme.colors.error,
                                            fontSize = 9.sp
                                        )
                                    )
                                }
                            }
                            Box(
                                modifier = Modifier
                                    .size(34.dp)
                                    .clip(androidx.compose.foundation.shape.RoundedCornerShape(8.dp))
                                    .background(if (inStock) DtaTheme.colors.primary else DtaTheme.colors.line)
                                    .clickable(enabled = inStock, onClick = onPrimaryAction),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Outlined.Add,
                                    contentDescription = "Add",
                                    tint = Color.White,
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                        }
                    }

                    ProductCardRole.RESELLER -> {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text(
                                    text = "Wholesale: Rs ${(partnerPrice ?: retailPrice).toInt()}",
                                    style = DtaTheme.typography.TitleSmall.copy(
                                        color = DtaTheme.colors.primary,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 13.sp
                                    )
                                )
                                Text(
                                    text = "Retail: Rs ${retailPrice.toInt()}",
                                    style = DtaTheme.typography.Label.copy(
                                        color = DtaTheme.colors.inkSecondary,
                                        fontSize = 10.sp
                                    )
                                )
                            }

                            Button(
                                onClick = onPrimaryAction,
                                shape = DtaTheme.shapes.Chip,
                                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = DtaTheme.colors.primary),
                                modifier = Modifier.height(30.dp)
                            ) {
                                Text("Sell", style = DtaTheme.typography.Label.copy(fontSize = 11.sp, fontWeight = FontWeight.Bold))
                            }
                        }
                    }

                    ProductCardRole.ADMIN -> {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text(
                                    text = "Retail: Rs ${retailPrice.toInt()}",
                                    style = DtaTheme.typography.TitleSmall.copy(
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 12.sp
                                    )
                                )
                                Text(
                                    text = "Partner: Rs ${(partnerPrice ?: 0.0).toInt()}",
                                    style = DtaTheme.typography.Label.copy(
                                        color = DtaTheme.colors.inkSecondary,
                                        fontSize = 10.sp
                                    )
                                )
                            }

                            OutlinedButton(
                                onClick = onPrimaryAction,
                                shape = DtaTheme.shapes.Chip,
                                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                                modifier = Modifier.height(28.dp)
                            ) {
                                Text("Edit", style = DtaTheme.typography.Label.copy(fontSize = 10.sp))
                            }
                        }
                    }
                }
            }
        }
    }
}

