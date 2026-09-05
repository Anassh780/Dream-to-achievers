package com.dreamtoachievers.app.feature.reseller.catalog

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddShoppingCart
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.dreamtoachievers.app.core.designsystem.components.*
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme
import com.dreamtoachievers.app.core.model.PartnerProduct

@Composable
fun PartnerCatalogScreen(
    viewModel: PartnerCatalogViewModel,
    onSellProduct: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val state by viewModel.uiState.collectAsState()

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(DtaTheme.colors.background)
    ) {
        // App Bar
        DtaTopAppBar(
            title = "Wholesale Catalog",
            subtitle = "Exclusive partner pricing & guaranteed profit margins"
        )

        // Search Bar
        DtaSearchBar(
            query = state.searchQuery,
            onQueryChange = { viewModel.onSearchQueryChanged(it) },
            placeholder = "Search wholesale catalog...",
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
        )

        // Category Filter Chips
        LazyRow(
            modifier = Modifier.fillMaxWidth(),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 4.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(state.categories) { category ->
                DtaFilterChip(
                    label = category,
                    selected = state.selectedCategory == category,
                    onClick = { viewModel.onCategorySelected(category) }
                )
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Product List
        if (state.filteredProducts.isEmpty()) {
            DtaEmptyState(
                title = "No Products Found",
                message = "Try searching with another keyword or category."
            )
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(start = 16.dp, end = 16.dp, bottom = 80.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                items(state.filteredProducts) { product ->
                    WholesaleProductCard(
                        product = product,
                        onSell = { onSellProduct(product.id) }
                    )
                }
            }
        }
    }
}

@Composable
private fun WholesaleProductCard(
    product: PartnerProduct,
    onSell: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        shape = DtaTheme.shapes.Card,
        colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
        border = androidx.compose.foundation.BorderStroke(1.dp, DtaTheme.colors.line),
        modifier = modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Product Thumbnail
                Box(
                    modifier = Modifier
                        .size(90.dp)
                        .clip(DtaTheme.shapes.Image)
                        .background(DtaTheme.colors.surfaceAlt)
                ) {
                    AsyncImage(
                        model = product.imageUrl,
                        contentDescription = product.name,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize()
                    )
                }

                // Details
                Column(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .clip(DtaTheme.shapes.Chip)
                            .background(DtaTheme.colors.surfaceAlt)
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = product.category,
                            style = DtaTheme.typography.Label.copy(
                                color = DtaTheme.colors.inkSecondary,
                                fontSize = 10.sp
                            )
                        )
                    }

                    Text(
                        text = product.name,
                        style = DtaTheme.typography.TitleSmall.copy(fontWeight = FontWeight.Bold),
                        maxLines = 2
                    )

                    Text(
                        text = "${product.stockCount} Units In Stock",
                        style = DtaTheme.typography.BodySmall.copy(
                            color = DtaTheme.colors.semanticSuccess,
                            fontWeight = FontWeight.Medium,
                            fontSize = 11.sp
                        )
                    )
                }
            }

            Divider(color = DtaTheme.colors.line)

            // Pricing & Margin Breakdown
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Wholesale Cost",
                        style = DtaTheme.typography.Label.copy(color = DtaTheme.colors.inkSecondary, fontSize = 10.sp)
                    )
                    Text(
                        text = product.formattedPartnerPrice,
                        style = DtaTheme.typography.TitleMedium.copy(
                            color = DtaTheme.colors.primary,
                            fontWeight = FontWeight.Bold
                        )
                    )
                }

                Column {
                    Text(
                        text = "Suggested Retail",
                        style = DtaTheme.typography.Label.copy(color = DtaTheme.colors.inkSecondary, fontSize = 10.sp)
                    )
                    Text(
                        text = product.formattedSuggestedPrice,
                        style = DtaTheme.typography.TitleSmall.copy(
                            color = DtaTheme.colors.ink,
                            fontWeight = FontWeight.SemiBold
                        )
                    )
                }

                // Profit Margin Badge
                Box(
                    modifier = Modifier
                        .clip(DtaTheme.shapes.Chip)
                        .background(DtaTheme.colors.accentSoft.copy(alpha = 0.5f))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = "PROFIT",
                            style = DtaTheme.typography.Label.copy(
                                color = DtaTheme.colors.accent,
                                fontWeight = FontWeight.Bold,
                                fontSize = 9.sp
                            )
                        )
                        Text(
                            text = product.formattedGrossMargin,
                            style = DtaTheme.typography.Label.copy(
                                color = DtaTheme.colors.accent,
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp
                            )
                        )
                    }
                }
            }

            // CTA Button: Sell This Product
            Button(
                onClick = onSell,
                shape = DtaTheme.shapes.Button,
                colors = ButtonDefaults.buttonColors(
                    containerColor = DtaTheme.colors.primary,
                    contentColor = Color.White
                ),
                modifier = Modifier.fillMaxWidth().height(44.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.AddShoppingCart,
                    contentDescription = null,
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Sell This Product",
                    style = DtaTheme.typography.Button.copy(fontWeight = FontWeight.Bold)
                )
            }
        }
    }
}
