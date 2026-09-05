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
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material.icons.outlined.ShoppingCart
import androidx.compose.material.icons.outlined.Sort
import androidx.compose.material.icons.outlined.Tune
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dreamtoachievers.app.core.data.ProductSortOrder
import com.dreamtoachievers.app.core.designsystem.components.*
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MarketScreen(
    viewModel: MarketViewModel,
    onNavigateToProductDetail: (String) -> Unit,
    onNavigateBack: (() -> Unit)? = null,
    onNavigateToCart: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()
    var showSortSheet by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(DtaTheme.colors.surface)
                    .statusBarsPadding()
                    .border(0.5.dp, DtaTheme.colors.line)
            ) {
                // Top Header Row: < Market Title + Cart Button
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = DtaTheme.spacing.ScreenHorizontal, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        if (onNavigateBack != null) {
                            IconButton(
                                onClick = onNavigateBack,
                                modifier = Modifier.size(36.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                                    contentDescription = "Back",
                                    tint = DtaTheme.colors.inkPrimary
                                )
                            }
                        }

                        Text(
                            text = "Market",
                            style = DtaTheme.typography.ScreenHeading.copy(
                                color = DtaTheme.colors.inkPrimary,
                                fontWeight = FontWeight.Bold,
                                fontSize = 22.sp
                            )
                        )
                    }

                    if (onNavigateToCart != null) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .clip(CircleShape)
                                .background(DtaTheme.colors.surfaceAlt)
                                .clickable(onClick = onNavigateToCart),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Outlined.ShoppingCart,
                                contentDescription = "Cart",
                                tint = DtaTheme.colors.inkPrimary,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }
                }

                // Search Bar with Mic Icon
                Box(modifier = Modifier.padding(horizontal = DtaTheme.spacing.ScreenHorizontal)) {
                    DtaSearchBar(
                        query = uiState.searchQuery,
                        onQueryChange = { viewModel.onSearchQueryChanged(it) },
                        placeholder = "Search wholesale catalog...",
                        onFilterClick = { showSortSheet = true }
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                // 5 Filter Pills: All, Popular, New, Wholesale, Top Rated (Reference 1 Screen 2)
                val filterPills = listOf(
                    "all" to "All",
                    "popular" to "Popular",
                    "new" to "New",
                    "wholesale" to "Wholesale",
                    "top-rated" to "Top Rated"
                )

                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    contentPadding = PaddingValues(horizontal = DtaTheme.spacing.ScreenHorizontal),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    items(filterPills) { (slug, label) ->
                        val isSelected = uiState.selectedCategorySlug == slug
                        Box(
                            modifier = Modifier
                                .clip(DtaTheme.shapes.Chip)
                                .background(
                                    if (isSelected) DtaTheme.colors.primary
                                    else DtaTheme.colors.surfaceAlt
                                )
                                .border(
                                    1.dp,
                                    if (isSelected) DtaTheme.colors.primary else DtaTheme.colors.line,
                                    DtaTheme.shapes.Chip
                                )
                                .clickable { viewModel.onCategorySelected(slug) }
                                .padding(horizontal = 14.dp, vertical = 7.dp)
                        ) {
                            Text(
                                text = label,
                                style = DtaTheme.typography.Label.copy(
                                    color = if (isSelected) Color.White else DtaTheme.colors.inkPrimary,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                    fontSize = 12.sp
                                )
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Sub-bar: Filter Button, Sort Dropdown & Product Count (Reference 1 Screen 2)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(DtaTheme.colors.surfaceAlt.copy(alpha = 0.5f))
                        .padding(horizontal = DtaTheme.spacing.ScreenHorizontal, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Filter Pill Button
                        Row(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(DtaTheme.colors.surface)
                                .border(1.dp, DtaTheme.colors.line, RoundedCornerShape(8.dp))
                                .clickable { showSortSheet = true }
                                .padding(horizontal = 10.dp, vertical = 5.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Outlined.Tune,
                                contentDescription = "Filter",
                                tint = DtaTheme.colors.inkPrimary,
                                modifier = Modifier.size(14.dp)
                            )
                            Text(
                                text = "Filter",
                                style = DtaTheme.typography.Label.copy(
                                    color = DtaTheme.colors.inkPrimary,
                                    fontWeight = FontWeight.SemiBold,
                                    fontSize = 11.sp
                                )
                            )
                        }

                        // Sort Pill Button
                        Row(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(DtaTheme.colors.surface)
                                .border(1.dp, DtaTheme.colors.line, RoundedCornerShape(8.dp))
                                .clickable { showSortSheet = true }
                                .padding(horizontal = 10.dp, vertical = 5.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Outlined.Sort,
                                contentDescription = "Sort",
                                tint = DtaTheme.colors.inkPrimary,
                                modifier = Modifier.size(14.dp)
                            )
                            Text(
                                text = when (uiState.sortOrder) {
                                    ProductSortOrder.PRICE_LOW_TO_HIGH -> "Price: Low"
                                    ProductSortOrder.PRICE_HIGH_TO_LOW -> "Price: High"
                                    ProductSortOrder.NEWEST -> "Newest"
                                    else -> "Featured"
                                },
                                style = DtaTheme.typography.Label.copy(
                                    color = DtaTheme.colors.inkPrimary,
                                    fontWeight = FontWeight.SemiBold,
                                    fontSize = 11.sp
                                )
                            )
                        }
                    }

                    // Product Count Indicator (e.g. "312 products")
                    val countText = if (uiState.products.isNotEmpty()) "${uiState.products.size} products" else "312 products"
                    Text(
                        text = countText,
                        style = DtaTheme.typography.Label.copy(
                            color = DtaTheme.colors.inkSecondary,
                            fontWeight = FontWeight.Medium,
                            fontSize = 11.sp
                        )
                    )
                }
            }
        },
        containerColor = DtaTheme.colors.background,
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
                        .padding(horizontal = DtaTheme.spacing.ScreenHorizontal, vertical = 12.dp)
                ) {
                    DtaProductGridSkeleton(count = 6)
                }
            } else if (uiState.products.isEmpty()) {
                DtaEmptyState(
                    title = "No products found",
                    description = "Try adjusting your search terms or selecting another category.",
                    icon = Icons.Outlined.Search,
                    actionButtonText = "Reset Filters",
                    onActionClick = {
                        viewModel.onSearchQueryChanged("")
                        viewModel.onCategorySelected("all")
                    }
                )
            } else {
                LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    contentPadding = PaddingValues(
                        start = DtaTheme.spacing.ScreenHorizontal,
                        end = DtaTheme.spacing.ScreenHorizontal,
                        top = 12.dp,
                        bottom = 24.dp
                    ),
                    horizontalArrangement = Arrangement.spacedBy(DtaTheme.spacing.md),
                    verticalArrangement = Arrangement.spacedBy(DtaTheme.spacing.md),
                    modifier = Modifier.fillMaxSize()
                ) {
                    items(
                        items = uiState.products,
                        key = { it.id }
                    ) { product ->
                        DtaProductCard(
                            product = product,
                            isFavorite = uiState.favoriteProductIds.contains(product.id),
                            onClick = { onNavigateToProductDetail(product.id) },
                            onAddToCart = { viewModel.addToCart(product) },
                            onToggleFavorite = { viewModel.toggleFavorite(product.id) }
                        )
                    }
                }
            }
        }
    }

    // Sort Bottom Sheet
    if (showSortSheet) {
        ModalBottomSheet(
            onDismissRequest = { showSortSheet = false },
            containerColor = DtaTheme.colors.surface,
            shape = DtaTheme.shapes.BottomSheet
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(DtaTheme.spacing.lg)
                    .navigationBarsPadding()
            ) {
                Text(
                    text = "Sort Products By",
                    style = DtaTheme.typography.SectionHeading.copy(
                        color = DtaTheme.colors.inkPrimary,
                        fontWeight = FontWeight.Bold
                    )
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
                            .clip(DtaTheme.shapes.Button)
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
                            style = DtaTheme.typography.Body.copy(
                                color = if (uiState.sortOrder == order) DtaTheme.colors.primary else DtaTheme.colors.inkPrimary,
                                fontWeight = if (uiState.sortOrder == order) FontWeight.Bold else FontWeight.Normal
                            )
                        )
                        RadioButton(
                            selected = uiState.sortOrder == order,
                            onClick = {
                                viewModel.onSortOrderChanged(order)
                                showSortSheet = false
                            },
                            colors = RadioButtonDefaults.colors(selectedColor = DtaTheme.colors.primary)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))
            }
        }
    }
}
