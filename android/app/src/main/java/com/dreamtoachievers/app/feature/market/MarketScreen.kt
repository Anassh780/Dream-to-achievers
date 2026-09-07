package com.dreamtoachievers.app.feature.market

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.*
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.outlined.Sort
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.dreamtoachievers.app.core.data.ProductSortOrder
import com.dreamtoachievers.app.core.designsystem.components.*
import com.dreamtoachievers.app.core.designsystem.theme.DtaColors
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme
import com.dreamtoachievers.app.core.model.Product

/**
 * Dream To Achievers - B2B Wholesale "Market" Screen.
 * Exactly matches reference design (media_1788610812278.png).
 *
 * Visual hierarchy:
 * 1. Top Header: Back arrow, "Market" (28sp bold), "Explore our product catalog" (14sp gray), cart icon with green badge "3".
 * 2. Search Bar: 56dp height, #F5F7F8 background, 16dp corners, search icon, "Search products...", right-hand light green filter button (#D1FAE5).
 * 3. Category Tabs: Horizontal scrolling chips: "All" (selected emerald #10B981, white text), "Popular", "New", "Wholesale", "Top Rated".
 * 4. Filter Toolbar: "Filter" button (sliders icon), "Featured" button (dropdown arrow), "312 products" count.
 * 5. 2-Column Product Grid: White cards (18dp radius), image, heart outline, badges (Popular, New, Best Seller, -20%), title, 2-line description, green square add-to-cart button. (NO PRICES).
 * 6. Bottom Navigation: Fixed 5-destination bar with "Market" selected inside a light green pill.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MarketScreen(
    viewModel: MarketViewModel,
    onNavigateToProductDetail: (String) -> Unit,
    modifier: Modifier = Modifier,
    onNavigateBack: (() -> Unit)? = null,
    onNavigateToCart: (() -> Unit)? = null,
) {
    val uiState by viewModel.uiState.collectAsState()
    val cartCount by viewModel.cartCount.collectAsState()
    var showSortSheet by remember { mutableStateOf(value = false) }

    val emeraldGreen = Color(0xFF10B981)
    val lightGreenPill = Color(0xFFD1FAE5)
    val textPrimary = Color(0xFF111827)
    val textSecondary = Color(0xFF6B7280)
    val surfaceSearch = Color(0xFFF5F7F8)
    val borderColor = Color(0xFFE5E7EB)

    Scaffold(
        topBar = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White)
                    .statusBarsPadding()
            ) {
                // 1. Header: Back Arrow + Market Title & Subtitle + Cart with "3" badge
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        if (onNavigateBack != null) {
                            IconButton(
                                onClick = { onNavigateBack.invoke() },
                                modifier = Modifier.size(36.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                                    contentDescription = "Back",
                                    tint = textPrimary,
                                    modifier = Modifier.size(24.dp)
                                )
                            }
                        }

                        Column {
                            Text(
                                text = "Market",
                                color = textPrimary,
                                fontWeight = FontWeight.Bold,
                                fontSize = 28.sp,
                                lineHeight = 32.sp
                            )
                            Text(
                                text = "Explore our product catalog",
                                color = textSecondary,
                                fontWeight = FontWeight.Normal,
                                fontSize = 14.sp
                            )
                        }
                    }

                    // Cart with green badge "3"
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .clip(CircleShape)
                            .clickable { onNavigateToCart?.invoke() },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Outlined.ShoppingCart,
                            contentDescription = "Cart",
                            tint = textPrimary,
                            modifier = Modifier.size(26.dp)
                        )

                        if (cartCount > 0) Box(
                            modifier = Modifier
                                .align(Alignment.TopEnd)
                                .offset(x = 2.dp, y = (-2).dp)
                                .size(18.dp)
                                .clip(CircleShape)
                                .background(emeraldGreen),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = if (cartCount > 99) "99+" else cartCount.toString(),
                                color = Color.White,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(6.dp))

                // 2. Search bar with a sort shortcut.
                Box(modifier = Modifier.padding(horizontal = 20.dp)) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp)
                            .clip(RoundedCornerShape(16.dp))
                            .background(surfaceSearch)
                            .padding(start = 16.dp, end = 8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Outlined.Search,
                            contentDescription = "Search",
                            tint = Color(0xFF9CA3AF),
                            modifier = Modifier.size(22.dp)
                        )

                        Spacer(modifier = Modifier.width(10.dp))

                        TextField(
                            value = uiState.searchQuery,
                            onValueChange = { viewModel.onSearchQueryChanged(it) },
                            placeholder = {
                                Text(
                                    text = "Search products...",
                                    color = Color(0xFF9CA3AF),
                                    fontSize = 14.sp,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                            },
                            colors = TextFieldDefaults.colors(
                                focusedContainerColor = Color.Transparent,
                                unfocusedContainerColor = Color.Transparent,
                                disabledContainerColor = Color.Transparent,
                                focusedIndicatorColor = Color.Transparent,
                                unfocusedIndicatorColor = Color.Transparent
                            ),
                            singleLine = true,
                            modifier = Modifier.weight(1f)
                        )

                        // Sort shortcut with a full Android touch target.
                        Box(
                            modifier = Modifier
                                .size(48.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(lightGreenPill)
                                .clickable { showSortSheet = true },
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Outlined.Tune,
                                contentDescription = "Sort products",
                                tint = emeraldGreen,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // 3. Category Tabs (Horizontal scrolling chips) - Deduplicated by slug
                val categoryTabs = (listOf("all" to "All Products") + uiState.categories.map { it.slug to it.name })
                    .distinctBy { it.first }

                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    contentPadding = PaddingValues(horizontal = 20.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    items(categoryTabs) { (slug, label) ->
                        val isSelected = uiState.selectedCategorySlug == slug
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(20.dp))
                                .background(
                                    if (isSelected) emeraldGreen
                                    else Color.White
                                )
                                .border(
                                    1.dp,
                                    if (isSelected) emeraldGreen else borderColor,
                                    RoundedCornerShape(20.dp)
                                )
                                .clickable { viewModel.onCategorySelected(slug) }
                                .padding(horizontal = 18.dp, vertical = 8.dp)
                        ) {
                            Text(
                                text = label,
                                color = if (isSelected) Color.White else Color(0xFF374151),
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                fontSize = 13.sp
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // 4. Reset and sort controls with the real result count.
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Clear the active search/category instead of opening a duplicate sort sheet.
                        Row(
                            modifier = Modifier
                                .clip(RoundedCornerShape(20.dp))
                                .background(Color.White)
                                .border(1.dp, borderColor, RoundedCornerShape(20.dp))
                                .clickable(
                                    enabled = uiState.searchQuery.isNotBlank() || uiState.selectedCategorySlug != "all"
                                ) {
                                    viewModel.onSearchQueryChanged("")
                                    viewModel.onCategorySelected("all")
                                }
                                .padding(horizontal = 14.dp, vertical = 7.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Outlined.Tune,
                                contentDescription = "Reset filters",
                                tint = textPrimary,
                                modifier = Modifier.size(15.dp)
                            )
                            Text(
                                text = "Reset",
                                color = textPrimary,
                                fontWeight = FontWeight.SemiBold,
                                fontSize = 12.5.sp
                            )
                        }

                        // Featured dropdown button
                        Row(
                            modifier = Modifier
                                .clip(RoundedCornerShape(20.dp))
                                .background(Color.White)
                                .border(1.dp, borderColor, RoundedCornerShape(20.dp))
                                .clickable { showSortSheet = true }
                                .padding(horizontal = 14.dp, vertical = 7.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Outlined.Sort,
                                contentDescription = "Sort",
                                tint = textPrimary,
                                modifier = Modifier.size(15.dp)
                            )
                            Text(
                                text = when (uiState.sortOrder) {
                                    ProductSortOrder.PRICE_LOW_TO_HIGH -> "Price: Low"
                                    ProductSortOrder.PRICE_HIGH_TO_LOW -> "Price: High"
                                    ProductSortOrder.NEWEST -> "Newest"
                                    else -> "Featured"
                                },
                                color = textPrimary,
                                fontWeight = FontWeight.SemiBold,
                                fontSize = 12.5.sp
                            )
                            Icon(
                                imageVector = Icons.Default.KeyboardArrowDown,
                                contentDescription = null,
                                tint = textPrimary,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }

                    // Product Count Indicator
                    val countText = "${uiState.products.size} products"
                    Text(
                        text = countText,
                        color = textSecondary,
                        fontWeight = FontWeight.Medium,
                        fontSize = 13.sp
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))
            }
        },
        containerColor = Color.White,
        modifier = modifier.fillMaxSize()
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            if (uiState.isLoading) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 20.dp, vertical = 12.dp)
                ) {
                    DtaProductGridSkeleton(count = 6)
                }
            } else {
                // Display only products returned by the current search and filters.
                val displayProducts = uiState.products.map { p ->
                    MarketProductItem(
                        id = p.id,
                        name = p.name,
                        description = p.shortDescription,
                        imageUrl = p.imageUrl,
                        badgeText = p.discountPercentage?.let { "-$it%" },
                        price = p.formattedPrice,
                        inStock = p.inStock
                    )
                }
                if (displayProducts.isEmpty()) {
                    Column(Modifier.fillMaxWidth().padding(24.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Text("No products found", style = MaterialTheme.typography.titleMedium)
                        Text(uiState.error ?: "Try another search or category. The catalog may also be temporarily unavailable.")
                        OutlinedButton(onClick = {
                            viewModel.onSearchQueryChanged("")
                            viewModel.onCategorySelected("all")
                        }) { Text("Reset filters and retry") }
                    }
                }
                if (displayProducts.isNotEmpty()) {
                // 2-Column Product Grid
                LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    contentPadding = PaddingValues(start = 20.dp, end = 20.dp, top = 8.dp, bottom = 24.dp),
                    horizontalArrangement = Arrangement.spacedBy(14.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    items(displayProducts, key = { it.id }) { item ->
                        MarketProductCard(
                            item = item,
                            isFavorite = uiState.favoriteProductIds.contains(item.id),
                            onClick = { onNavigateToProductDetail(item.id) },
                            onToggleFavorite = { viewModel.toggleFavorite(item.id) },
                            onAddToCart = {
                                val prod = uiState.products.find { p -> p.id == item.id }
                                    ?: return@MarketProductCard
                                viewModel.addToCart(prod)
                            }
                        )
                    }
                }
            }
        }
    }

    }

    // Sort Bottom Sheet
    if (showSortSheet) {
        ModalBottomSheet(
            onDismissRequest = { showSortSheet = false },
            containerColor = Color.White,
            shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp)
                    .navigationBarsPadding()
            ) {
                Text(
                    text = "Sort Products",
                    color = textPrimary,
                    fontWeight = FontWeight.Bold,
                    fontSize = 20.sp
                )

                Spacer(modifier = Modifier.height(16.dp))

                listOf(
                    Pair(ProductSortOrder.FEATURED, "Featured & Recommended"),
                    Pair(ProductSortOrder.PRICE_LOW_TO_HIGH, "Price: Low to High"),
                    Pair(ProductSortOrder.PRICE_HIGH_TO_LOW, "Price: High to Low"),
                    Pair(ProductSortOrder.NEWEST, "Newest Arrivals")
                ).forEach { (order, label) ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .clickable {
                                viewModel.onSortOrderChanged(order)
                                showSortSheet = false
                            }
                            .padding(vertical = 12.dp, horizontal = 8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = label,
                            color = if (uiState.sortOrder == order) emeraldGreen else textPrimary,
                            fontWeight = if (uiState.sortOrder == order) FontWeight.Bold else FontWeight.Normal,
                            fontSize = 15.sp
                        )
                        RadioButton(
                            selected = uiState.sortOrder == order,
                            onClick = {
                                viewModel.onSortOrderChanged(order)
                                showSortSheet = false
                            },
                            colors = RadioButtonDefaults.colors(selectedColor = emeraldGreen)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))
            }
        }
    }
}

data class MarketProductItem(
    val id: String,
    val name: String,
    val description: String,
    val imageUrl: String,
    val price: String = "",
    val inStock: Boolean = true,
    val badgeText: String? = null,
    val badgeBg: Color = Color(0xFF10B981),
    val badgeTextColor: Color = Color.White
)

/**
 * Pixel-perfect product card matching media_1788610812278.png:
 * - White background, rounded corners 18dp, subtle border.
 * - Center-aligned realistic product photo.
 * - Badge top-left (Popular, New, Best Seller, -20%).
 * - Heart outline top-right.
 * - Bold title, 2-line description.
 * - Green rounded square add-to-cart button bottom-right.
 * - NO PRICES SHOWN.
 */
@Composable
fun MarketProductCard(
    item: MarketProductItem,
    isFavorite: Boolean,
    onClick: () -> Unit,
    onToggleFavorite: () -> Unit,
    onAddToCart: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        modifier = modifier
            .fillMaxWidth()
            .border(1.dp, Color(0xFFE5E7EB), RoundedCornerShape(18.dp))
            .clickable(onClick = onClick)
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            // Image Box
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(142.dp)
                    .background(Color(0xFFFAFAFA)),
                contentAlignment = Alignment.Center
            ) {
                AsyncImage(
                    model = item.imageUrl,
                    contentDescription = item.name,
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(12.dp),
                    contentScale = ContentScale.Fit
                )

                // Top-left badge
                if (item.badgeText != null) {
                    Box(
                        modifier = Modifier
                            .align(Alignment.TopStart)
                            .padding(10.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(item.badgeBg)
                            .padding(horizontal = 8.dp, vertical = 3.dp)
                    ) {
                        Text(
                            text = item.badgeText,
                            color = item.badgeTextColor,
                            fontSize = 9.5.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                // Top-right heart favorite icon with clean white surface
                Surface(
                    onClick = onToggleFavorite,
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(8.dp)
                        .size(36.dp),
                    shape = CircleShape,
                    color = Color.White.copy(alpha = 0.92f),
                    shadowElevation = 1.dp
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            imageVector = if (isFavorite) Icons.Filled.Favorite else Icons.Outlined.FavoriteBorder,
                            contentDescription = "Favorite",
                            tint = if (isFavorite) Color(0xFFEF4444) else Color(0xFF4B5563),
                            modifier = Modifier.size(19.dp)
                        )
                    }
                }
            }

            // Info Section
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp, vertical = 10.dp),
                verticalAlignment = Alignment.Bottom,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column(modifier = Modifier.weight(1f).padding(end = 8.dp)) {
                    Text(
                        text = item.name,
                        color = Color(0xFF111827),
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.5.sp,
                        lineHeight = 17.sp,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )

                    Spacer(modifier = Modifier.height(3.dp))

                    if (item.price.isNotBlank()) {
                        Text(
                            text = item.price,
                            color = Color(0xFF10B981),
                            fontWeight = FontWeight.ExtraBold,
                            fontSize = 13.sp,
                            maxLines = 1
                        )
                    }

                    if (item.description.isNotBlank()) {
                        Text(
                            text = if (!item.inStock) "Out of stock" else item.description,
                            color = if (!item.inStock) Color(0xFFEF4444) else Color(0xFF6B7280),
                            fontSize = 10.5.sp,
                            lineHeight = 13.5.sp,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }

                // Green rounded square add-to-cart button with white cart icon
                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(Color(0xFF10B981))
                        .clickable(enabled = item.inStock, onClick = onAddToCart),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Outlined.ShoppingCart,
                        contentDescription = "Add to Cart",
                        tint = Color.White,
                        modifier = Modifier.size(17.dp)
                    )
                }
            }
        }
    }
}
