package com.dreamtoachievers.app.feature.home

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.TrendingUp
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.dreamtoachievers.app.R
import com.dreamtoachievers.app.core.designsystem.theme.DtaColors
import com.dreamtoachievers.app.core.model.*
import kotlinx.coroutines.delay
import java.text.NumberFormat
import java.util.Locale

private val Navy = Color(0xFF061A35)
private val Blue = Color(0xFF0867D7)
private val Soft = Color(0xFFF5F7FA)
private val Green = Color(0xFF069B58)

@Composable
fun HomeScreen(
    viewModel: HomeViewModel,
    onNavigateToProductDetail: (String) -> Unit,
    onNavigateToMarket: (String?) -> Unit,
    onSearch: (String) -> Unit,
    onNavigateToCart: () -> Unit,
    onNavigateToNotifications: () -> Unit,
    onNavigateToAccount: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val state by viewModel.uiState.collectAsState()
    var query by rememberSaveable { mutableStateOf("") }

    Column(modifier.fillMaxSize().background(Color.White).statusBarsPadding()) {
        StoreHeader(state.unreadNotificationsCount, state.cartCount, onNavigateToNotifications, onNavigateToCart, onNavigateToAccount)
        Column(Modifier.weight(1f).verticalScroll(rememberScrollState())) {
            SearchArea(
                query = query,
                recent = state.recentSearches,
                suggestions = state.searchSuggestions,
                accountLoading = state.userDataLoading,
                error = state.userDataError ?: state.writeError,
                onQuery = { query = it; viewModel.updateSearch(it) },
                onSubmit = { value -> viewModel.submitSearch(value) { onSearch(it) } }
            )
            SectionGap(12)
            BannerSection(state, viewModel::retryBanners) { onNavigateToMarket(it.takeIf(String::isNotBlank)) }
            SectionGap(16)
            CategorySection(state, onNavigateToMarket, viewModel::retryCatalog)
            SectionGap(22)
            TrendingSection(state, viewModel, onNavigateToProductDetail, { onNavigateToMarket("trending") })
            SectionGap(22)
            TrustStrip()
            SectionGap(20)
        }
    }
}

@Composable private fun StoreHeader(notifications: Int, cart: Int, onBell: () -> Unit, onCart: () -> Unit, onAccount: () -> Unit) {
    Row(Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 10.dp), verticalAlignment = Alignment.CenterVertically) {
        androidx.compose.foundation.Image(painterResource(R.drawable.brand_logo), "Dream To Achievers", Modifier.size(46.dp), contentScale = ContentScale.Fit)
        Spacer(Modifier.width(8.dp))
        Column(Modifier.weight(1f)) {
            Text("DREAM TO ACHIEVERS", color = Navy, fontSize = 15.sp, fontWeight = FontWeight.Black, letterSpacing = .2.sp)
            Text("TOGETHER FOR A BIGGER TOMORROW", color = Color(0xFF697384), fontSize = 7.sp, fontWeight = FontWeight.Bold, letterSpacing = .55.sp)
        }
        HeaderIcon(Icons.Outlined.Notifications, "Notifications", notifications, Color(0xFFEA3B3B), onBell)
        HeaderIcon(Icons.Outlined.ShoppingCart, "Cart", cart, Green, onCart)
        IconButton(onClick = onAccount, modifier = Modifier.size(48.dp)) { Icon(Icons.Outlined.AccountCircle, "Account", tint = Navy, modifier = Modifier.size(29.dp)) }
    }
}

@Composable private fun HeaderIcon(icon: androidx.compose.ui.graphics.vector.ImageVector, label: String, count: Int, color: Color, click: () -> Unit) {
    Box(Modifier.size(48.dp).clickable(onClick = click), contentAlignment = Alignment.Center) {
        Icon(icon, label, tint = Navy, modifier = Modifier.size(27.dp))
        if (count > 0) Badge(containerColor = color, modifier = Modifier.align(Alignment.TopEnd).offset(x = (-2).dp, y = 2.dp)) { Text(if (count > 99) "99+" else count.toString(), color = Color.White, fontSize = 9.sp) }
    }
}

@Composable private fun SearchArea(query: String, recent: List<String>, suggestions: List<String>, accountLoading: Boolean, error: String?, onQuery: (String) -> Unit, onSubmit: (String) -> Unit) {
    Column(Modifier.padding(horizontal = 16.dp)) {
        TextField(
            value = query, onValueChange = onQuery, singleLine = true,
            textStyle = LocalTextStyle.current.copy(color = Navy, fontSize = 13.sp, lineHeight = 16.sp),
            placeholder = {
                Text(
                    "Search products, categories, brands…",
                    color = Color(0xFF737B89),
                    fontSize = 12.sp,
                    maxLines = 1,
                    softWrap = false,
                    overflow = TextOverflow.Ellipsis,
                )
            },
            leadingIcon = { Icon(Icons.Outlined.Search, null, tint = Navy, modifier = Modifier.size(23.dp)) },
            trailingIcon = {
                if (query.isNotBlank()) {
                    IconButton(onClick = { onQuery("") }) {
                        Icon(Icons.Outlined.Close, "Clear search", tint = Navy, modifier = Modifier.size(22.dp))
                    }
                } else {
                    IconButton(onClick = { onSubmit(query) }) {
                        Icon(Icons.Outlined.QrCodeScanner, "Scan product code", tint = Navy, modifier = Modifier.size(23.dp))
                    }
                }
            },
            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search), keyboardActions = KeyboardActions(onSearch = { onSubmit(query) }),
            shape = RoundedCornerShape(16.dp),
            colors = TextFieldDefaults.colors(focusedContainerColor = Soft, unfocusedContainerColor = Soft, focusedIndicatorColor = Color.Transparent, unfocusedIndicatorColor = Color.Transparent),
            modifier = Modifier.fillMaxWidth().height(54.dp)
        )
        if (query.isNotBlank()) {
            if (suggestions.isEmpty()) Text("No matching products or categories", Modifier.padding(top = 8.dp), color = Color(0xFF697384), fontSize = 12.sp)
            else LazyRow(Modifier.padding(top = 8.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) { items(suggestions) { SuggestionChip(it) { onSubmit(it) } } }
        } else {
            Row(Modifier.padding(top = 10.dp), verticalAlignment = Alignment.CenterVertically) {
                Text("Recent:", color = Navy, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                Spacer(Modifier.width(8.dp))
                when {
                    accountLoading -> Box(Modifier.width(120.dp).height(28.dp).clip(RoundedCornerShape(14.dp)).background(Soft))
                    recent.isEmpty() -> Text("No searches yet", color = Color(0xFF7B8491), fontSize = 12.sp)
                    else -> Row(Modifier.horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(8.dp)) { recent.forEach { SuggestionChip(it) { onSubmit(it) } } }
                }
            }
        }
        if (error != null) Text("Account data error: $error", Modifier.padding(top = 8.dp), color = MaterialTheme.colorScheme.error, fontSize = 11.sp)
    }
}

@Composable private fun SuggestionChip(text: String, click: () -> Unit) { Surface(onClick = click, shape = RoundedCornerShape(18.dp), color = Color.White, border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFE5E8ED))) { Text(text, Modifier.padding(horizontal = 13.dp, vertical = 7.dp), fontSize = 11.sp, color = Navy) } }

@Composable private fun BannerSection(state: HomeUiState, retry: () -> Unit, navigate: (String) -> Unit) {
    Box(Modifier.padding(horizontal = 16.dp)) {
        // The branded wholesale slide is always available. Firebase-managed banners are
        // appended to the carousel when they load, so the existing campaign system stays intact.
        LiveBannerCarousel(state.banners, navigate)
    }
}

@Composable private fun LiveBannerCarousel(banners: List<StorefrontBanner>, navigate: (String) -> Unit) {
    val slideCount = banners.size + 1
    var current by rememberSaveable(banners.map { it.id }) { mutableIntStateOf(0) }
    LaunchedEffect(slideCount) {
        current = current.coerceIn(0, slideCount - 1)
        if (slideCount > 1) while (true) {
            delay(5_000)
            current = (current + 1) % slideCount
        }
    }
    if (current == 0) {
        WholesaleBusinessBanner(slideCount, current, { current = it }) { navigate("") }
        return
    }
    val banner = banners[(current - 1).coerceIn(0, banners.lastIndex)]
    Box(Modifier.fillMaxWidth().height(185.dp).clip(RoundedCornerShape(17.dp)).background(Navy)) {
        AsyncImage(banner.image, banner.headline, Modifier.fillMaxSize(), contentScale = ContentScale.Crop)
        Box(Modifier.fillMaxSize().background(Brush.horizontalGradient(listOf(Navy, Navy.copy(.92f), Navy.copy(.16f)))))
        Column(Modifier.fillMaxHeight().fillMaxWidth(.62f).padding(16.dp), verticalArrangement = Arrangement.SpaceBetween) {
            Column {
                if (banner.eyebrow.isNotBlank()) Text(banner.eyebrow.uppercase(), color = Color.White.copy(.8f), fontSize = 9.sp, fontWeight = FontWeight.Medium)
                Text(banner.headline, color = Color.White, fontSize = 23.sp, lineHeight = 26.sp, fontWeight = FontWeight.ExtraBold, maxLines = 3, overflow = TextOverflow.Ellipsis)
                if (banner.subheadline.isNotBlank()) Text(banner.subheadline, color = Color.White.copy(.82f), fontSize = 11.sp, maxLines = 2)
            }
            if (banner.ctaLabel.isNotBlank()) Surface(onClick = { navigate(banner.ctaLink) }, color = Color.White, shape = RoundedCornerShape(22.dp)) { Text("${banner.ctaLabel}  →", Modifier.padding(horizontal = 14.dp, vertical = 8.dp), color = Navy, fontWeight = FontWeight.Bold, fontSize = 11.sp) }
        }
        BannerDots(slideCount, current, { current = it }, Modifier.align(Alignment.BottomStart))
    }
}

@Composable
private fun WholesaleBusinessBanner(
    slideCount: Int,
    current: Int,
    selectSlide: (Int) -> Unit,
    explore: () -> Unit,
) {
    Box(
        Modifier
            .fillMaxWidth()
            .height(185.dp)
            .clip(RoundedCornerShape(17.dp))
            .background(Navy)
    ) {
        androidx.compose.foundation.Image(
            painter = painterResource(R.drawable.wholesale_cartons_banner),
            contentDescription = "Stacked wholesale shipping cartons",
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize(),
        )
        Box(
            Modifier.fillMaxSize().background(
                Brush.horizontalGradient(
                    listOf(Navy, Navy.copy(alpha = .92f), Color.Transparent, Navy.copy(alpha = .88f))
                )
            )
        )
        Column(
            Modifier.fillMaxHeight().fillMaxWidth(.54f).padding(start = 15.dp, top = 15.dp, bottom = 12.dp),
        ) {
            Text("BUSINESS WHOLESALE PLATFORM", color = Color.White.copy(.84f), fontSize = 8.sp, fontWeight = FontWeight.Medium, letterSpacing = .35.sp)
            Spacer(Modifier.height(5.dp))
            Text("Quality Products\nStronger Margins", color = Color.White, fontSize = 20.sp, lineHeight = 22.sp, fontWeight = FontWeight.ExtraBold)
            Spacer(Modifier.height(4.dp))
            Text("Trusted brands • Bulk pricing", color = Color.White.copy(.86f), fontSize = 8.sp, maxLines = 1)
            Spacer(Modifier.weight(1f))
            Surface(onClick = explore, color = Color.White, shape = RoundedCornerShape(22.dp)) {
                Text("Explore Products  →", Modifier.padding(horizontal = 13.dp, vertical = 8.dp), color = Navy, fontWeight = FontWeight.Bold, fontSize = 10.sp)
            }
        }
        Column(
            Modifier.align(Alignment.CenterEnd).fillMaxWidth(.31f).padding(end = 7.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            BannerBenefit(Icons.Outlined.LocalShipping, "Bulk Pricing")
            BannerBenefit(Icons.Outlined.VerifiedUser, "Verified Suppliers")
            BannerBenefit(Icons.Outlined.HeadsetMic, "Dedicated Support")
            BannerBenefit(Icons.AutoMirrored.Outlined.TrendingUp, "Grow Together")
        }
        BannerDots(slideCount, current, selectSlide, Modifier.align(Alignment.BottomStart))
    }
}

@Composable private fun BannerBenefit(icon: androidx.compose.ui.graphics.vector.ImageVector, text: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Icon(icon, null, tint = Color.White, modifier = Modifier.size(15.dp))
        Spacer(Modifier.width(4.dp))
        Text(text, color = Color.White, fontSize = 7.sp, fontWeight = FontWeight.Medium, maxLines = 1, softWrap = false)
    }
}

@Composable private fun BannerDots(count: Int, current: Int, select: (Int) -> Unit, modifier: Modifier = Modifier) {
    Row(modifier.padding(start = 16.dp, bottom = 8.dp), horizontalArrangement = Arrangement.spacedBy(5.dp)) {
        repeat(count) { index ->
            Box(
                Modifier
                    .width(if (index == current) 17.dp else 5.dp)
                    .height(5.dp)
                    .clip(CircleShape)
                    .background(if (index == current) Color.White.copy(.78f) else Color.White.copy(.36f))
                    .clickable { select(index) }
            )
        }
    }
}

@Composable private fun CategorySection(state: HomeUiState, navigate: (String?) -> Unit, retry: () -> Unit) {
    val desired = listOf(
        CategoryPresentation("Skincare &\nCosmetics", "skincare", R.drawable.category_skincare, Icons.Outlined.AutoAwesome),
        CategoryPresentation("Watches &\nAccessories", "watches", R.drawable.category_watches, Icons.Outlined.Watch),
        CategoryPresentation("Electronics &\nGadgets", "electronics", R.drawable.category_electronics, Icons.Outlined.Devices),
        CategoryPresentation("Gift Sets", "gift-sets", R.drawable.category_gifts, Icons.Outlined.CardGiftcard),
        CategoryPresentation("Home & Living", "home-living", R.drawable.category_home_living, Icons.Outlined.Home),
        CategoryPresentation("More\nCategories", null, null, Icons.Outlined.GridView),
    )
    Row(
        Modifier.fillMaxWidth().padding(horizontal = 10.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        desired.forEach { item ->
            Column(
                Modifier.weight(1f).clickable { navigate(item.slug) },
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Box(
                    Modifier.size(50.dp).clip(CircleShape).background(Color(0xFFF1F4F8)),
                    contentAlignment = Alignment.Center,
                ) {
                    if (item.drawableRes != null) {
                        androidx.compose.foundation.Image(
                            painterResource(item.drawableRes),
                            item.label.replace("\n", " "),
                            Modifier.fillMaxSize(),
                            contentScale = ContentScale.Crop,
                        )
                    } else {
                        Icon(item.icon, null, tint = Navy, modifier = Modifier.size(23.dp))
                    }
                }
                Text(
                    item.label,
                    Modifier.padding(top = 7.dp),
                    color = Navy,
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 8.sp,
                    lineHeight = 9.sp,
                    maxLines = 2,
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                )
            }
        }
    }
}

private data class CategoryPresentation(
    val label: String,
    val slug: String?,
    val drawableRes: Int?,
    val icon: androidx.compose.ui.graphics.vector.ImageVector,
)

private fun categoryIcon(value: String) = when(value.lowercase()) {
    "watch", "watchlater" -> Icons.Outlined.Watch
    "gift", "cardgiftcard" -> Icons.Outlined.CardGiftcard
    "home", "package", "lifestyle" -> Icons.Outlined.Home
    "cpu", "devices", "tech", "tech-electronics" -> Icons.Outlined.Devices
    "sparkle", "autoawesome", "skincare", "beauty" -> Icons.Outlined.AutoAwesome
    "heart", "wellness", "health-wellness" -> Icons.Outlined.FavoriteBorder
    "storefront", "all" -> Icons.Outlined.Storefront
    else -> Icons.Outlined.Category
}

@Composable private fun TrendingSection(state: HomeUiState, vm: HomeViewModel, detail: (String) -> Unit, viewAll: () -> Unit) {
    Column {
        Row(Modifier.fillMaxWidth().padding(horizontal = 16.dp), verticalAlignment = Alignment.Bottom) {
            Column(Modifier.weight(1f)) { Text("Trending Wholesale Products", color = Navy, fontSize = 20.sp, fontWeight = FontWeight.ExtraBold); Text("Popular among resellers this week", color = Color(0xFF697384), fontSize = 12.sp) }
            Text("View All  →", Modifier.clickable(onClick = viewAll).padding(6.dp), color = Blue, fontWeight = FontWeight.Bold, fontSize = 12.sp)
        }
        Spacer(Modifier.height(12.dp))
        when {
            state.catalogLoading -> LazyRow(contentPadding = PaddingValues(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) { items(3) { Skeleton(Modifier.width(238.dp).height(370.dp)) } }
            state.catalogError != null -> Box(Modifier.padding(horizontal = 16.dp)) { StateCard("Trending products couldn't load", "Try again", vm::retryCatalog) }
            state.trendingProducts.isEmpty() -> Box(Modifier.padding(horizontal = 16.dp)) { StateCard("No trending products yet", "Browse all products", viewAll) }
            else -> LazyRow(contentPadding = PaddingValues(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                items(state.trendingProducts.take(4), key = { it.id }) { product ->
                    WholesaleCard(product, product.id in state.favoriteProductIds, vm.quantityFor(product.id), { detail(product.id) }, { vm.toggleFavorite(product.id) }, { vm.changeQuantity(product, it) })
                }
            }
        }
    }
}

@Composable private fun WholesaleCard(product: Product, favorite: Boolean, quantity: Int, detail: () -> Unit, favoriteClick: () -> Unit, quantityChange: (Int) -> Unit) {
    Card(Modifier.width(238.dp).border(1.dp, Color(0xFFE4E7EC), RoundedCornerShape(12.dp)), colors = CardDefaults.cardColors(Color.White), shape = RoundedCornerShape(12.dp)) {
        Column {
            Box(Modifier.fillMaxWidth().height(145.dp).clickable(onClick = detail).background(Soft)) {
                AsyncImage(product.imageUrl, product.name, Modifier.fillMaxSize(), contentScale = ContentScale.Crop)
                Surface(onClick = favoriteClick, modifier = Modifier.align(Alignment.TopEnd).padding(7.dp).size(36.dp), shape = CircleShape, color = Color.White) {
                    Box(contentAlignment = Alignment.Center) { Icon(if (favorite) Icons.Filled.Favorite else Icons.Outlined.FavoriteBorder, if (favorite) "Remove from wishlist" else "Add to wishlist", tint = if (favorite) Color(0xFFE13B4A) else Navy, modifier = Modifier.size(21.dp)) }
                }
            }
            Column(Modifier.padding(10.dp)) {
                if (product.brand.isNotBlank()) Text(product.brand, color = Color(0xFF737B89), fontSize = 10.sp)
                Text(product.name, color = Navy, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, maxLines = 2, overflow = TextOverflow.Ellipsis)
                Text("${money(product.retailPrice)} / unit", color = Navy, fontSize = 15.sp, fontWeight = FontWeight.ExtraBold)
                if (product.tierPricing.isNotEmpty()) {
                    Column(Modifier.fillMaxWidth().padding(top = 8.dp).clip(RoundedCornerShape(8.dp)).background(Color(0xFFF6F8FC)).padding(8.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        product.tierPricing.take(3).forEach { tier -> Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) { Text("${tier.minQuantity}+ units", fontSize = 10.sp, color = Navy); Text(money(tier.price), fontSize = 10.sp, color = Navy, fontWeight = FontWeight.Medium) } }
                    }
                } else Text("No tier pricing available", Modifier.padding(top = 8.dp), color = Color(0xFF7B8491), fontSize = 10.sp)
                Row(Modifier.fillMaxWidth().padding(top = 10.dp), verticalAlignment = Alignment.CenterVertically) {
                    Text("MOQ: ${product.moq} units", Modifier.weight(1f), color = Green, fontWeight = FontWeight.Bold, fontSize = 10.sp)
                    QuantityStepper(quantity, product.moq, quantityChange)
                }
            }
        }
    }
}

@Composable private fun QuantityStepper(quantity: Int, moq: Int, change: (Int) -> Unit) {
    val displayed = if (quantity == 0) 0 else quantity
    Row(Modifier.height(48.dp).clip(RoundedCornerShape(10.dp)).background(Color(0xFFEAF2FF)), verticalAlignment = Alignment.CenterVertically) {
        IconButton(onClick = { if (displayed > moq) change(displayed - 1) }, enabled = displayed > moq, modifier = Modifier.size(48.dp)) { Icon(Icons.Outlined.Remove, "Decrease quantity", tint = Blue) }
        Text(displayed.toString(), Modifier.width(27.dp), color = Blue, fontWeight = FontWeight.Bold)
        IconButton(onClick = { change(if (displayed == 0) moq else displayed + 1) }, modifier = Modifier.size(48.dp).background(Blue)) { Icon(Icons.Outlined.Add, "Increase quantity", tint = Color.White) }
    }
}

@Composable private fun TrustStrip() {
    Row(Modifier.fillMaxWidth().background(Soft).padding(horizontal = 16.dp, vertical = 16.dp).horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(24.dp)) {
        Trust(Icons.Outlined.VerifiedUser, "Verified Suppliers", "Quality Assured")
        Trust(Icons.Outlined.LocalShipping, "Bulk Ordering", "Better Margins")
        Trust(Icons.Outlined.CreditCard, "Secure Payments", "Safe & Reliable")
        Trust(Icons.Outlined.HeadsetMic, "Dedicated Support", "For Our Partners")
    }
}

@Composable private fun Trust(icon: androidx.compose.ui.graphics.vector.ImageVector, title: String, subtitle: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Icon(icon, null, tint = Navy, modifier = Modifier.size(26.dp))
        Spacer(Modifier.width(8.dp))
        Column {
            Text(title, color = Navy, fontWeight = FontWeight.Bold, fontSize = 11.sp, maxLines = 1, softWrap = false)
            Text(subtitle, color = Color(0xFF697384), fontSize = 10.sp, maxLines = 1, softWrap = false)
        }
    }
}
@Composable private fun StateCard(message: String, action: String, click: () -> Unit) { Row(Modifier.fillMaxWidth().heightIn(min = 84.dp).clip(RoundedCornerShape(14.dp)).background(Soft).padding(14.dp), verticalAlignment = Alignment.CenterVertically) { Text(message, Modifier.weight(1f), color = Navy, fontWeight = FontWeight.SemiBold); TextButton(onClick = click) { Text(action) } } }
@Composable private fun Skeleton(modifier: Modifier) { Box(modifier.clip(RoundedCornerShape(12.dp)).background(Color(0xFFE9EDF2))) }
@Composable private fun SectionGap(height: Int) { Spacer(Modifier.height(height.dp)) }
private fun money(value: Double): String = "Rs ${NumberFormat.getIntegerInstance(Locale.forLanguageTag("en-PK")).format(value)}"
