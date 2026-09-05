package com.dreamtoachievers.app.feature.product

import android.content.Intent
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.dreamtoachievers.app.core.designsystem.components.*
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProductDetailScreen(
    viewModel: ProductDetailViewModel,
    onNavigateBack: () -> Unit,
    onNavigateToCart: () -> Unit,
    onNavigateToCheckout: () -> Unit,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current

    var isDescriptionExpanded by remember { mutableStateOf(true) }
    var isSpecsExpanded by remember { mutableStateOf(false) }
    var isShippingExpanded by remember { mutableStateOf(false) }
    var selectedColorIndex by remember { mutableStateOf(0) }

    Scaffold(
        containerColor = DtaTheme.colors.background,
        bottomBar = {
            if (uiState.product != null) {
                Surface(
                    color = DtaTheme.colors.surface,
                    modifier = Modifier
                        .fillMaxWidth()
                        .navigationBarsPadding()
                        .border(1.dp, DtaTheme.colors.line)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = DtaTheme.spacing.ScreenHorizontal, vertical = 12.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        DtaSecondaryButton(
                            text = "Add to Cart",
                            onClick = {
                                if (viewModel.addToCart()) {
                                    onNavigateToCart()
                                }
                            },
                            modifier = Modifier.weight(1f)
                        )

                        DtaPrimaryButton(
                            text = "Buy Now",
                            trailingIcon = Icons.Default.ArrowForward,
                            onClick = {
                                if (viewModel.addToCart()) {
                                    onNavigateToCheckout()
                                }
                            },
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }
        },
        modifier = modifier.fillMaxSize()
    ) { paddingValues ->
        if (uiState.isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = DtaTheme.colors.primary)
            }
        } else if (uiState.error != null || uiState.product == null) {
            DtaErrorState(
                message = uiState.error ?: "Product not found",
                onRetry = onNavigateBack,
                modifier = Modifier.padding(paddingValues)
            )
        } else {
            val product = uiState.product!!
            val images = listOf(product.imageUrl) + product.additionalImages
            val pagerState = rememberPagerState(pageCount = { images.size })

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .verticalScroll(rememberScrollState())
            ) {
                // Top Visual Carousel with Floating Controls
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(360.dp)
                        .background(DtaTheme.colors.surfaceAlt)
                ) {
                    HorizontalPager(
                        state = pagerState,
                        modifier = Modifier.fillMaxSize()
                    ) { page ->
                        AsyncImage(
                            model = images[page],
                            contentDescription = product.name,
                            modifier = Modifier.fillMaxSize(),
                            contentScale = ContentScale.Crop
                        )
                    }

                    // Floating Back Button
                    IconButton(
                        onClick = onNavigateBack,
                        modifier = Modifier
                            .statusBarsPadding()
                            .padding(16.dp)
                            .size(42.dp)
                            .background(DtaTheme.colors.surface.copy(alpha = 0.9f), CircleShape)
                            .border(0.5.dp, DtaTheme.colors.line, CircleShape)
                            .align(Alignment.TopStart)
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back",
                            tint = DtaTheme.colors.inkPrimary
                        )
                    }

                    // Floating Favorite & Share
                    Row(
                        modifier = Modifier
                            .statusBarsPadding()
                            .padding(16.dp)
                            .align(Alignment.TopEnd),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        IconButton(
                            onClick = {
                                val sendIntent = Intent().apply {
                                    action = Intent.ACTION_SEND
                                    putExtra(Intent.EXTRA_TEXT, "Check out ${product.name} on Dream to Achievers: https://dreamtoachievers.com/product/${product.id}")
                                    type = "text/plain"
                                }
                                context.startActivity(Intent.createChooser(sendIntent, "Share Product"))
                            },
                            modifier = Modifier
                                .size(42.dp)
                                .background(DtaTheme.colors.surface.copy(alpha = 0.9f), CircleShape)
                                .border(0.5.dp, DtaTheme.colors.line, CircleShape)
                        ) {
                            Icon(
                                imageVector = Icons.Outlined.Share,
                                contentDescription = "Share",
                                tint = DtaTheme.colors.inkPrimary,
                                modifier = Modifier.size(20.dp)
                            )
                        }

                        IconButton(
                            onClick = { viewModel.toggleFavorite() },
                            modifier = Modifier
                                .size(42.dp)
                                .background(DtaTheme.colors.surface.copy(alpha = 0.9f), CircleShape)
                                .border(0.5.dp, DtaTheme.colors.line, CircleShape)
                        ) {
                            Icon(
                                imageVector = if (uiState.isFavorite) Icons.Filled.Favorite else Icons.Outlined.FavoriteBorder,
                                contentDescription = "Favorite",
                                tint = if (uiState.isFavorite) DtaTheme.colors.error else DtaTheme.colors.inkPrimary,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }

                    // Pager Indicator Dots
                    if (images.size > 1) {
                        Row(
                            modifier = Modifier
                                .align(Alignment.BottomCenter)
                                .padding(bottom = 14.dp),
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            repeat(images.size) { index ->
                                val isCurrent = pagerState.currentPage == index
                                Box(
                                    modifier = Modifier
                                        .size(if (isCurrent) 8.dp else 6.dp)
                                        .clip(CircleShape)
                                        .background(
                                            if (isCurrent) DtaTheme.colors.primary else Color.White.copy(alpha = 0.7f)
                                        )
                                )
                            }
                        }
                    }

                    // Indicator Pill (e.g. 1/6) matching Reference 1 Screen 3
                    Box(
                        modifier = Modifier
                            .align(Alignment.BottomEnd)
                            .padding(14.dp)
                            .clip(DtaTheme.shapes.Chip)
                            .background(Color.Black.copy(alpha = 0.65f))
                            .padding(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = "${pagerState.currentPage + 1}/${images.size}",
                            style = DtaTheme.typography.Label.copy(
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 11.sp
                            )
                        )
                    }
                }

                // Main Info Container
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = DtaTheme.spacing.ScreenHorizontal, vertical = 20.dp)
                ) {
                    // Category & Verified Badge Row
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        DtaVerifiedBadge(label = "Verified Seller")
                        DtaStockBadge(inStock = product.inStock)
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Title
                    Text(
                        text = product.name,
                        style = DtaTheme.typography.ScreenHeading.copy(
                            color = DtaTheme.colors.inkPrimary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 22.sp
                        )
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    // Rating & Reviews
                    Row(
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Star,
                            contentDescription = null,
                            tint = DtaTheme.colors.accentGold,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "${product.rating} (${product.reviewCount} customer reviews)",
                            style = DtaTheme.typography.Metadata.copy(
                                color = DtaTheme.colors.inkSecondary,
                                fontWeight = FontWeight.Medium
                            )
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Retail Price Presentation (Strict Customer Rule: Retail only!)
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column {
                            Text(
                                text = "Retail Price",
                                style = DtaTheme.typography.Label.copy(
                                    color = DtaTheme.colors.inkMuted,
                                    fontSize = 12.sp
                                )
                            )
                            DtaPriceText(
                                price = product.retailPrice,
                                originalPrice = product.originalPrice,
                                fontSize = 24.sp
                            )
                        }

                        product.discountPercentage?.let { discount ->
                            DtaDiscountBadge(discountPercent = discount)
                        }
                    }

                    Spacer(modifier = Modifier.height(18.dp))

                    // Wholesale Volume Tiers (Reference 1 Screen 3 Benchmark)
                    Column(modifier = Modifier.fillMaxWidth()) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Wholesale Volume Tiers",
                                style = DtaTheme.typography.CardTitle.copy(
                                    color = DtaTheme.colors.inkPrimary,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp
                                )
                            )
                            Text(
                                text = "Save up to 18%",
                                style = DtaTheme.typography.Label.copy(
                                    color = DtaTheme.colors.primary,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 11.sp
                                )
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        val tiers = listOf(
                            Triple("10–49 units", "Rs 7,200", ""),
                            Triple("50–99 units", "Rs 6,850", "Popular"),
                            Triple("100+ units", "Rs 6,450", "Best Value")
                        )

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            tiers.forEach { (qtyLabel, priceLabel, tag) ->
                                Card(
                                    shape = DtaTheme.shapes.Card,
                                    colors = CardDefaults.cardColors(
                                        containerColor = if (tag.isNotEmpty()) DtaTheme.colors.primaryContainer.copy(alpha = 0.5f) else DtaTheme.colors.surface
                                    ),
                                    modifier = Modifier
                                        .weight(1f)
                                        .border(
                                            1.dp,
                                            if (tag.isNotEmpty()) DtaTheme.colors.primary else DtaTheme.colors.line,
                                            DtaTheme.shapes.Card
                                        )
                                ) {
                                    Column(
                                        modifier = Modifier.padding(vertical = 10.dp, horizontal = 6.dp),
                                        horizontalAlignment = Alignment.CenterHorizontally
                                    ) {
                                        if (tag.isNotEmpty()) {
                                            Box(
                                                modifier = Modifier
                                                    .clip(DtaTheme.shapes.Chip)
                                                    .background(DtaTheme.colors.primary)
                                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                                            ) {
                                                Text(
                                                    text = tag,
                                                    style = DtaTheme.typography.Label.copy(
                                                        color = Color.White,
                                                        fontSize = 9.sp,
                                                        fontWeight = FontWeight.Bold
                                                    )
                                                )
                                            }
                                            Spacer(modifier = Modifier.height(4.dp))
                                        }
                                        Text(
                                            text = qtyLabel,
                                            style = DtaTheme.typography.Label.copy(
                                                color = DtaTheme.colors.inkSecondary,
                                                fontSize = 10.sp,
                                                fontWeight = FontWeight.Medium
                                            )
                                        )
                                        Spacer(modifier = Modifier.height(2.dp))
                                        Text(
                                            text = priceLabel,
                                            style = DtaTheme.typography.Label.copy(
                                                color = DtaTheme.colors.primary,
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 12.sp
                                            )
                                        )
                                    }
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(18.dp))

                    // Color Variant Selector (Reference 1 Screen 3 Benchmark)
                    val colorVariants = listOf(
                        "Midnight Black" to Color(0xFF1E293B),
                        "Platinum Silver" to Color(0xFF94A3B8),
                        "Rose Gold" to Color(0xFFD97706),
                        "Royal Emerald" to Color(0xFF007A55)
                    )

                    Column(modifier = Modifier.fillMaxWidth()) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Select Color",
                                style = DtaTheme.typography.CardTitle.copy(
                                    color = DtaTheme.colors.inkPrimary,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp
                                )
                            )
                            Text(
                                text = colorVariants[selectedColorIndex].first,
                                style = DtaTheme.typography.Label.copy(
                                    color = DtaTheme.colors.primary,
                                    fontWeight = FontWeight.SemiBold,
                                    fontSize = 12.sp
                                )
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Row(horizontalArrangement = Arrangement.spacedBy(14.dp)) {
                            colorVariants.forEachIndexed { index, (_, color) ->
                                val isSelected = selectedColorIndex == index
                                Box(
                                    modifier = Modifier
                                        .size(34.dp)
                                        .clip(CircleShape)
                                        .border(
                                            width = if (isSelected) 2.5.dp else 1.dp,
                                            color = if (isSelected) DtaTheme.colors.primary else Color.Transparent,
                                            shape = CircleShape
                                        )
                                        .padding(3.dp)
                                        .clip(CircleShape)
                                        .background(color)
                                        .clickable { selectedColorIndex = index }
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(18.dp))

                    // Quantity Selection
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(DtaTheme.shapes.Card)
                            .background(DtaTheme.colors.surface)
                            .border(1.dp, DtaTheme.colors.line, DtaTheme.shapes.Card)
                            .padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "Quantity",
                            style = DtaTheme.typography.CardTitle.copy(
                                color = DtaTheme.colors.inkPrimary,
                                fontWeight = FontWeight.SemiBold
                            )
                        )

                        DtaQuantitySelector(
                            quantity = uiState.quantity,
                            onQuantityChange = { viewModel.setQuantity(it) }
                        )
                    }

                    Spacer(modifier = Modifier.height(24.dp))

                    // Expandable Description Accordion
                    ExpandableSection(
                        title = "Product Overview",
                        isExpanded = isDescriptionExpanded,
                        onToggle = { isDescriptionExpanded = !isDescriptionExpanded }
                    ) {
                        Text(
                            text = product.description.ifEmpty { product.shortDescription },
                            style = DtaTheme.typography.Body.copy(
                                color = DtaTheme.colors.inkSecondary,
                                lineHeight = 22.sp
                            )
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Expandable Specifications Accordion
                    ExpandableSection(
                        title = "Specifications & SKU",
                        isExpanded = isSpecsExpanded,
                        onToggle = { isSpecsExpanded = !isSpecsExpanded }
                    ) {
                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            SpecRow("SKU", product.sku)
                            SpecRow("Category", product.category)
                            SpecRow("Availability", if (product.inStock) "Ready for dispatch" else "Out of stock")
                            product.specifications.forEach { (k, v) ->
                                SpecRow(k, v)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Expandable Shipping & Courier Info Accordion
                    ExpandableSection(
                        title = "Shipping & Courier Partners",
                        isExpanded = isShippingExpanded,
                        onToggle = { isShippingExpanded = !isShippingExpanded }
                    ) {
                        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text(
                                text = "Delivered via verified couriers: TCS, Leopard, Trax & PostEx.",
                                style = DtaTheme.typography.Body.copy(color = DtaTheme.colors.inkSecondary)
                            )
                            Text(
                                text = "• Free delivery across Pakistan on orders over PKR 5,000.\n• Standard nationwide delivery: 2–4 business days.\n• Live SMS and in-app tracking number provided upon dispatch.",
                                style = DtaTheme.typography.Metadata.copy(color = DtaTheme.colors.inkSecondary, lineHeight = 20.sp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(32.dp))
                }
            }
        }
    }
}

@Composable
private fun ExpandableSection(
    title: String,
    isExpanded: Boolean,
    onToggle: () -> Unit,
    content: @Composable () -> Unit
) {
    Card(
        shape = DtaTheme.shapes.Card,
        colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, DtaTheme.colors.line, DtaTheme.shapes.Card)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable(onClick = onToggle),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = title,
                    style = DtaTheme.typography.CardTitle.copy(
                        color = DtaTheme.colors.inkPrimary,
                        fontWeight = FontWeight.Bold
                    )
                )

                Icon(
                    imageVector = if (isExpanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                    contentDescription = null,
                    tint = DtaTheme.colors.primary
                )
            }

            AnimatedVisibility(visible = isExpanded) {
                Column {
                    Spacer(modifier = Modifier.height(12.dp))
                    content()
                }
            }
        }
    }
}

@Composable
private fun SpecRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = label,
            style = DtaTheme.typography.Metadata.copy(color = DtaTheme.colors.inkMuted)
        )
        Text(
            text = value,
            style = DtaTheme.typography.Metadata.copy(
                color = DtaTheme.colors.inkPrimary,
                fontWeight = FontWeight.Medium
            )
        )
    }
}
