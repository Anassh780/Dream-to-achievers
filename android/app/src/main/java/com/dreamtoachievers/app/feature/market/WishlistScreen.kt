package com.dreamtoachievers.app.feature.market

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.dreamtoachievers.app.core.designsystem.components.*
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme

@Composable
fun WishlistScreen(
    viewModel: MarketViewModel,
    onNavigateBack: () -> Unit,
    onNavigateToProductDetail: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()
    val favoriteProducts = uiState.products.filter { uiState.favoriteProductIds.contains(it.id) }

    Scaffold(
        topBar = {
            DtaSecondaryTopBar(
                title = "Saved Wishlist",
                onBackClick = onNavigateBack
            )
        },
        containerColor = DtaTheme.colors.background,
        modifier = modifier.fillMaxSize()
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            if (favoriteProducts.isEmpty()) {
                DtaEmptyState(
                    title = "Your wishlist is empty",
                    description = "Save your favorite products to quickly purchase or monitor them later.",
                    icon = Icons.Outlined.FavoriteBorder,
                    actionButtonText = "Browse Market",
                    onActionClick = onNavigateBack
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
                        items = favoriteProducts,
                        key = { it.id }
                    ) { product ->
                        DtaProductCard(
                            product = product,
                            isFavorite = true,
                            onClick = { onNavigateToProductDetail(product.id) },
                            onAddToCart = { viewModel.addToCart(product) },
                            onToggleFavorite = { viewModel.toggleFavorite(product.id) }
                        )
                    }
                }
            }
        }
    }
}
