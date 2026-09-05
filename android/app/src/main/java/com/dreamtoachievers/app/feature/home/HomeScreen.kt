package com.dreamtoachievers.app.feature.home

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dreamtoachievers.app.core.designsystem.components.*
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme
import com.dreamtoachievers.app.core.model.Category
import com.dreamtoachievers.app.core.model.Product

@Composable
fun HomeScreen(
    viewModel: HomeViewModel,
    onNavigateToProductDetail: (String) -> Unit,
    onNavigateToMarket: (String?) -> Unit,
    onNavigateToCart: () -> Unit,
    onNavigateToNotifications: () -> Unit,
    onNavigateToAccount: () -> Unit,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            DtaHomeTopBar(
                userName = uiState.currentUser?.fullName ?: "Alex Morgan",
                avatarUrl = uiState.currentUser?.avatarUrl,
                unreadNotificationsCount = uiState.unreadNotificationsCount,
                cartItemCount = uiState.cartCount,
                onAvatarClick = onNavigateToAccount,
                onNotificationClick = onNavigateToNotifications,
                onCartClick = onNavigateToCart
            )
        },
        containerColor = DtaTheme.colors.background,
        modifier = modifier.fillMaxSize()
    ) { paddingValues ->
        if (uiState.isLoading) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(horizontal = DtaTheme.spacing.ScreenHorizontal)
            ) {
                Spacer(modifier = Modifier.height(16.dp))
                DtaProductGridSkeleton(count = 4)
            }
        } else if (uiState.error != null) {
            DtaErrorState(
                message = uiState.error!!,
                onRetry = { viewModel.retry() },
                modifier = Modifier.padding(paddingValues)
            )
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .verticalScroll(rememberScrollState())
            ) {
                Spacer(modifier = Modifier.height(8.dp))

                // 1. Search Bar with Mic Icon (Taps navigate to Market search)
                Box(modifier = Modifier.padding(horizontal = DtaTheme.spacing.ScreenHorizontal)) {
                    DtaSearchBar(
                        query = "",
                        onQueryChange = {},
                        readOnly = true,
                        placeholder = "Search products, categories...",
                        onClick = { onNavigateToMarket(null) }
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                // 2. Total Business Hero Card with Sparkline Wave (Reference 1 & 2 Benchmark)
                Box(modifier = Modifier.padding(horizontal = DtaTheme.spacing.ScreenHorizontal)) {
                    HomeTotalBusinessCard(
                        totalAmount = "Rs 245,800",
                        growthPercent = "+18.4% this month"
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                // 3. 4-Metric Quick Stats Row (Reference 2 Screen 03 / Screen 01 Benchmark)
                Box(modifier = Modifier.padding(horizontal = DtaTheme.spacing.ScreenHorizontal)) {
                    HomeQuickStatsRow(
                        sales = "1,248",
                        orders = "320",
                        partners = "126",
                        rewards = "Rs 12,480"
                    )
                }

                Spacer(modifier = Modifier.height(18.dp))

                // 4. Categories Section with Circular Icons (Reference 1 Screen 1)
                HomeCircularCategoriesSection(
                    categories = uiState.categories,
                    selectedSlug = uiState.selectedCategorySlug,
                    onSelectCategory = { viewModel.selectCategory(it) },
                    onSeeAll = { onNavigateToMarket(null) }
                )

                Spacer(modifier = Modifier.height(18.dp))

                // 5. Promotional "Grow Together" Banner
                Box(modifier = Modifier.padding(horizontal = DtaTheme.spacing.ScreenHorizontal)) {
                    DtaPromoBanner(
                        title = "Grow Together",
                        subtitle = "Better Products. Bigger Opportunities.",
                        ctaText = "Browse Catalog",
                        onClick = { onNavigateToMarket(null) }
                    )
                }

                Spacer(modifier = Modifier.height(20.dp))

                // 6. Trending Products Section (2-Column Mobile Grid)
                Box(modifier = Modifier.padding(horizontal = DtaTheme.spacing.ScreenHorizontal)) {
                    DtaSectionHeader(
                        title = "Trending Products",
                        actionText = "View All",
                        onActionClick = { onNavigateToMarket(uiState.selectedCategorySlug) }
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                val products = uiState.trendingProducts
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = DtaTheme.spacing.ScreenHorizontal),
                    verticalArrangement = Arrangement.spacedBy(DtaTheme.spacing.md)
                ) {
                    for (i in products.indices step 2) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(DtaTheme.spacing.md)
                        ) {
                            val leftProduct = products[i]
                            DtaProductCard(
                                product = leftProduct,
                                isFavorite = uiState.favoriteProductIds.contains(leftProduct.id),
                                onClick = { onNavigateToProductDetail(leftProduct.id) },
                                onAddToCart = { viewModel.addToCart(leftProduct) },
                                onToggleFavorite = { viewModel.toggleFavorite(leftProduct.id) },
                                modifier = Modifier.weight(1f)
                            )

                            if (i + 1 < products.size) {
                                val rightProduct = products[i + 1]
                                DtaProductCard(
                                    product = rightProduct,
                                    isFavorite = uiState.favoriteProductIds.contains(rightProduct.id),
                                    onClick = { onNavigateToProductDetail(rightProduct.id) },
                                    onAddToCart = { viewModel.addToCart(rightProduct) },
                                    onToggleFavorite = { viewModel.toggleFavorite(rightProduct.id) },
                                    modifier = Modifier.weight(1f)
                                )
                            } else {
                                Spacer(modifier = Modifier.weight(1f))
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(32.dp))
            }
        }
    }
}

/**
 * Screen 01 / Screen 03 Reference Total Business Hero Card.
 * Deep emerald gradient with bezier sparkline curve and monthly growth pill.
 */
@Composable
fun HomeTotalBusinessCard(
    totalAmount: String,
    growthPercent: String,
    modifier: Modifier = Modifier
) {
    Card(
        shape = DtaTheme.shapes.HeroCard,
        colors = CardDefaults.cardColors(containerColor = Color.Transparent),
        modifier = modifier.fillMaxWidth()
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    brush = Brush.verticalGradient(
                        colors = listOf(
                            Color(0xFF007A55),
                            Color(0xFF005A3E)
                        )
                    )
                )
                .padding(18.dp)
        ) {
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "TOTAL BUSINESS",
                        style = DtaTheme.typography.Label.copy(
                            color = Color.White.copy(alpha = 0.75f),
                            fontWeight = FontWeight.SemiBold,
                            letterSpacing = 1.sp,
                            fontSize = 11.sp
                        )
                    )

                    // Growth Pill
                    Box(
                        modifier = Modifier
                            .clip(DtaTheme.shapes.Chip)
                            .background(Color.White.copy(alpha = 0.18f))
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.TrendingUp,
                                contentDescription = null,
                                tint = Color(0xFFA7F3D0),
                                modifier = Modifier.size(13.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = growthPercent,
                                style = DtaTheme.typography.Label.copy(
                                    color = Color(0xFFA7F3D0),
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 11.sp
                                )
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                    text = totalAmount,
                    style = DtaTheme.typography.DisplayLarge.copy(
                        color = Color.White,
                        fontWeight = FontWeight.Black,
                        fontSize = 28.sp
                    )
                )

                Spacer(modifier = Modifier.height(14.dp))

                // Smooth Sparkline Wave Curve
                Canvas(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(42.dp)
                ) {
                    val width = size.width
                    val height = size.height

                    val path = Path().apply {
                        moveTo(0f, height * 0.8f)
                        cubicTo(
                            width * 0.2f, height * 0.85f,
                            width * 0.35f, height * 0.45f,
                            width * 0.5f, height * 0.5f
                        )
                        cubicTo(
                            width * 0.65f, height * 0.55f,
                            width * 0.8f, height * 0.2f,
                            width, height * 0.15f
                        )
                    }

                    // Stroke line
                    drawPath(
                        path = path,
                        color = Color(0xFF6EE7B7),
                        style = Stroke(width = 2.5.dp.toPx(), cap = StrokeCap.Round)
                    )

                    // Underfill
                    val fillPath = Path().apply {
                        addPath(path)
                        lineTo(width, height)
                        lineTo(0f, height)
                        close()
                    }

                    drawPath(
                        path = fillPath,
                        brush = Brush.verticalGradient(
                            colors = listOf(
                                Color(0xFF6EE7B7).copy(alpha = 0.25f),
                                Color.Transparent
                            )
                        )
                    )
                }
            }
        }
    }
}

/**
 * 4-Metric Quick Stat Row matching Reference 2 Screen 03 & Screen 01
 */
@Composable
fun HomeQuickStatsRow(
    sales: String,
    orders: String,
    partners: String,
    rewards: String,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        HomeMetricTile(label = "Sales", value = sales, modifier = Modifier.weight(1f))
        HomeMetricTile(label = "Orders", value = orders, modifier = Modifier.weight(1f))
        HomeMetricTile(label = "Partners", value = partners, modifier = Modifier.weight(1f))
        HomeMetricTile(label = "Rewards", value = rewards, modifier = Modifier.weight(1f))
    }
}

@Composable
private fun HomeMetricTile(
    label: String,
    value: String,
    modifier: Modifier = Modifier
) {
    Card(
        shape = DtaTheme.shapes.Card,
        colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
        modifier = modifier.border(1.dp, DtaTheme.colors.line, DtaTheme.shapes.Card)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 10.dp, horizontal = 6.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = value,
                style = DtaTheme.typography.TitleSmall.copy(
                    color = DtaTheme.colors.primary,
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp
                ),
                maxLines = 1
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = label,
                style = DtaTheme.typography.Label.copy(
                    color = DtaTheme.colors.inkSecondary,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Medium
                ),
                maxLines = 1
            )
        }
    }
}

/**
 * Circular Category Icons matching Reference 1 Screen 1
 */
@Composable
fun HomeCircularCategoriesSection(
    categories: List<Category>,
    selectedSlug: String,
    onSelectCategory: (String) -> Unit,
    onSeeAll: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(modifier = modifier.fillMaxWidth()) {
        Box(modifier = Modifier.padding(horizontal = DtaTheme.spacing.ScreenHorizontal)) {
            DtaSectionHeader(
                title = "Categories",
                actionText = "See All",
                onActionClick = onSeeAll
            )
        }

        Spacer(modifier = Modifier.height(10.dp))

        val displayCategories = if (categories.isNotEmpty()) {
            categories
        } else {
            listOf(
                Category(id = "1", name = "Watches", slug = "watches", icon = "watch"),
                Category(id = "2", name = "Tech", slug = "tech", icon = "phone"),
                Category(id = "3", name = "Fashion", slug = "fashion", icon = "bag"),
                Category(id = "4", name = "Beauty", slug = "beauty", icon = "sparkle"),
                Category(id = "5", name = "Home", slug = "home", icon = "home"),
                Category(id = "6", name = "Wholesale", slug = "wholesale", icon = "store")
            )
        }

        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(14.dp),
            contentPadding = PaddingValues(horizontal = DtaTheme.spacing.ScreenHorizontal),
            modifier = Modifier.fillMaxWidth()
        ) {
            items(displayCategories) { category ->
                val isSelected = selectedSlug == category.slug
                val iconVector = getCategoryIcon(category.slug)

                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier
                        .clip(DtaTheme.shapes.Card)
                        .clickable { onSelectCategory(category.slug) }
                        .padding(4.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(54.dp)
                            .clip(CircleShape)
                            .background(
                                if (isSelected) DtaTheme.colors.primaryContainer
                                else DtaTheme.colors.surfaceAlt
                            )
                            .border(
                                width = if (isSelected) 1.5.dp else 1.dp,
                                color = if (isSelected) DtaTheme.colors.primary else DtaTheme.colors.line,
                                shape = CircleShape
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = iconVector,
                            contentDescription = category.name,
                            tint = if (isSelected) DtaTheme.colors.primary else DtaTheme.colors.inkPrimary,
                            modifier = Modifier.size(24.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    Text(
                        text = category.name,
                        style = DtaTheme.typography.Label.copy(
                            color = if (isSelected) DtaTheme.colors.primary else DtaTheme.colors.inkPrimary,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                            fontSize = 11.sp
                        )
                    )
                }
            }
        }
    }
}

private fun getCategoryIcon(slug: String): ImageVector {
    return when (slug.lowercase()) {
        "watches", "watch" -> Icons.Outlined.WatchLater
        "tech", "electronics", "phones" -> Icons.Outlined.Devices
        "fashion", "apparel", "clothing" -> Icons.Outlined.ShoppingBag
        "beauty", "cosmetics" -> Icons.Outlined.AutoAwesome
        "home", "living" -> Icons.Outlined.Home
        "wholesale", "bulk" -> Icons.Outlined.Inventory2
        else -> Icons.Outlined.Category
    }
}
