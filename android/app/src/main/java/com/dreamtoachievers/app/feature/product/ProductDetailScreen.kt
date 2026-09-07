package com.dreamtoachievers.app.feature.product

import android.content.Intent
import android.net.Uri
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.outlined.ArrowForward
import androidx.compose.material.icons.automirrored.outlined.DirectionsRun
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import coil.compose.AsyncImage
import com.dreamtoachievers.app.core.designsystem.components.DtaErrorState
import com.dreamtoachievers.app.core.designsystem.util.openExternalIntent
import com.dreamtoachievers.app.core.model.Product
import java.text.NumberFormat
import java.util.Locale
import kotlinx.coroutines.launch

private val Navy = Color(0xFF07182F)
private val Green = Color(0xFF00875A)
private val SoftGreen = Color(0xFFE9F7F0)
private val Muted = Color(0xFF778195)
private val Line = Color(0xFFE7EBF0)
private val Soft = Color(0xFFF6F8FA)
private val Orange = Color(0xFFF08A00)

@Composable
fun ProductDetailScreen(
    viewModel: ProductDetailViewModel,
    onNavigateBack: () -> Unit,
    onNavigateToCart: () -> Unit,
    onNavigateToCheckout: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val state by viewModel.uiState.collectAsState()
    val context = LocalContext.current
    var overviewOpen by remember { mutableStateOf(false) }
    var specsOpen by remember { mutableStateOf(false) }
    var shippingOpen by remember { mutableStateOf(false) }
    var selectedColor by remember { mutableIntStateOf(0) }

    Scaffold(
        containerColor = Color.White,
        bottomBar = {
            state.product?.let { product ->
                PurchaseBar(product, state.quantity,
                    onChat = { context.openExternalIntent(Intent(Intent.ACTION_VIEW, Uri.parse("https://wa.me/923054511395"))) },
                    onAdd = { if (viewModel.addToCart()) onNavigateToCart() },
                    onBuy = { if (viewModel.addToCart()) onNavigateToCheckout() })
            }
        },
        modifier = modifier.fillMaxSize(),
    ) { padding ->
        when {
            state.isLoading -> Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = Green) }
            state.error != null || state.product == null -> DtaErrorState(
                message = state.error ?: "Product not found",
                onRetry = viewModel::loadProduct,
                modifier = Modifier.padding(padding),
            )
            else -> {
                val product = state.product!!
                Column(Modifier.fillMaxSize().padding(padding).verticalScroll(rememberScrollState()).background(Color.White)) {
                    TopBar(state.isFavorite, onNavigateBack, viewModel::toggleFavorite) {
                        val intent = Intent(Intent.ACTION_SEND).apply {
                            type = "text/plain"
                            putExtra(Intent.EXTRA_TEXT, "Check out ${product.name} on Dream to Achievers: https://dreamtoachievers.com/product/${product.id}")
                        }
                        context.openExternalIntent(Intent.createChooser(intent, "Share Product"))
                    }
                    ProductHero(product, selectedColor)
                    Spacer(Modifier.height(18.dp))
                    ColorSelector(product, selectedColor) { index, name -> selectedColor = index; viewModel.selectVariant(name) }
                    Spacer(Modifier.height(18.dp))
                    QuantityAndMoq(product, state.quantity, viewModel::setQuantity)
                    Spacer(Modifier.height(16.dp))
                    KeyFeatures(product)
                    Spacer(Modifier.height(12.dp))
                    DetailAccordion(Icons.Outlined.Description, "Product Overview", overviewOpen, { overviewOpen = !overviewOpen }) {
                        Text(product.description.ifBlank { product.shortDescription.ifBlank { "Product information will be updated soon." } }, color = Muted, fontSize = 12.sp, lineHeight = 18.sp)
                    }
                    Spacer(Modifier.height(8.dp))
                    DetailAccordion(Icons.Outlined.Settings, "Specifications & SKU", specsOpen, { specsOpen = !specsOpen }) {
                        SpecRow("SKU", product.sku.ifBlank { "—" }); SpecRow("Category", product.category.ifBlank { "—" })
                        product.specifications.forEach { (key, value) -> SpecRow(key, value) }
                    }
                    Spacer(Modifier.height(8.dp))
                    DetailAccordion(Icons.Outlined.LocalShipping, "Shipping & Courier Partners", shippingOpen, { shippingOpen = !shippingOpen }) {
                        Text("Nationwide delivery with tracking. Courier and delivery estimates appear during checkout.", color = Muted, fontSize = 12.sp, lineHeight = 18.sp)
                    }
                    Spacer(Modifier.height(18.dp)); CustomerReview(product, state.reviews, state.canReview, state.reviewMessage, state.reviewError, viewModel::submitReview); Spacer(Modifier.height(24.dp))
                }
            }
        }
    }
}

@Composable private fun TopBar(favorite: Boolean, back: () -> Unit, favoriteClick: () -> Unit, share: () -> Unit) {
    Row(Modifier.fillMaxWidth().statusBarsPadding().height(52.dp).padding(horizontal = 10.dp), verticalAlignment = Alignment.CenterVertically) {
        IconButton(back, Modifier.size(48.dp)) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back", tint = Navy, modifier = Modifier.size(25.dp)) }
        Spacer(Modifier.weight(1f))
        IconButton(favoriteClick, Modifier.size(48.dp)) { Icon(if (favorite) Icons.Filled.Favorite else Icons.Outlined.FavoriteBorder, "Favorite", tint = if (favorite) Color(0xFFD94253) else Navy, modifier = Modifier.size(25.dp)) }
        IconButton(share, Modifier.size(48.dp)) { Icon(Icons.Outlined.Share, "Share product", tint = Navy, modifier = Modifier.size(24.dp)) }
    }
}

@Composable private fun ProductHero(product: Product, selectedColor: Int) {
    val colorImage = product.colors.getOrNull(selectedColor)?.imageUrl.orEmpty()
    val images = remember(product, colorImage) {
        (listOf(colorImage, product.imageUrl) + product.additionalImages)
            .filter(String::isNotBlank)
            .distinct()
            .ifEmpty { listOf("") }
    }
    val pager = rememberPagerState(pageCount = { images.size })
    val pagerScope = rememberCoroutineScope()
    var fullImageOpen by remember { mutableStateOf(false) }
    if (fullImageOpen) {
        Dialog(
            onDismissRequest = { fullImageOpen = false },
            properties = DialogProperties(usePlatformDefaultWidth = false),
        ) {
            Box(
                Modifier.fillMaxSize().background(Color.Black).clickable { fullImageOpen = false },
                contentAlignment = Alignment.Center,
            ) {
                AsyncImage(
                    model = images[pager.currentPage],
                    contentDescription = "Full product image",
                    modifier = Modifier.fillMaxSize().padding(20.dp),
                    contentScale = ContentScale.Fit,
                )
                Surface(
                    color = Color.White.copy(alpha = .92f),
                    shape = CircleShape,
                    modifier = Modifier.align(Alignment.TopEnd).padding(18.dp).size(48.dp).clickable { fullImageOpen = false },
                ) {
                    Icon(Icons.Outlined.Close, "Close full image", tint = Navy, modifier = Modifier.padding(9.dp).size(22.dp))
                }
            }
        }
    }
    Row(Modifier.fillMaxWidth().height(250.dp).padding(horizontal = 14.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        Column(Modifier.weight(1.04f)) {
            Box(Modifier.fillMaxWidth().weight(1f).clip(RoundedCornerShape(13.dp)).background(Soft)) {
                HorizontalPager(pager, Modifier.fillMaxSize()) { page ->
                    AsyncImage(
                        model = images[page],
                        contentDescription = product.name,
                        modifier = Modifier.fillMaxSize().padding(8.dp).clickable { fullImageOpen = true },
                        contentScale = ContentScale.Fit,
                    )
                }
                Surface(color = Color.White.copy(.93f), shape = RoundedCornerShape(18.dp), modifier = Modifier.align(Alignment.TopStart).padding(8.dp)) {
                    Row(Modifier.padding(horizontal = 8.dp, vertical = 5.dp), verticalAlignment = Alignment.CenterVertically) {
                        Box(Modifier.size(7.dp).clip(CircleShape).background(if (product.inStock) Green else Color.Red)); Spacer(Modifier.width(5.dp))
                        Text(if (product.inStock) "In Stock" else "Out of Stock", color = if (product.inStock) Green else Color.Red, fontWeight = FontWeight.Bold, fontSize = 9.sp)
                    }
                }
                Surface(
                    color = Color.White.copy(.94f),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.align(Alignment.BottomEnd).padding(7.dp).size(48.dp).clickable { fullImageOpen = true },
                ) {
                    Icon(Icons.Outlined.ZoomOutMap, "Full image", tint = Navy, modifier = Modifier.padding(6.dp).size(18.dp))
                }
            }
            if (images.size > 1) {
                Spacer(Modifier.height(6.dp))
                Row(Modifier.fillMaxWidth().height(38.dp), horizontalArrangement = Arrangement.spacedBy(5.dp)) {
                    repeat(minOf(5, images.size)) { index ->
                        Box(Modifier.weight(1f).fillMaxHeight().clip(RoundedCornerShape(7.dp)).background(Soft).border(if (pager.currentPage == index) 1.5.dp else .5.dp, if (pager.currentPage == index) Green else Line, RoundedCornerShape(7.dp)).clickable { pagerScope.launch { pager.animateScrollToPage(index) } }) {
                            AsyncImage(images[index], "Product image ${index + 1}", Modifier.fillMaxSize().padding(2.dp), contentScale = ContentScale.Fit)
                            if (index == 4 && images.size > 5) Box(Modifier.fillMaxSize().background(Navy.copy(.55f)), contentAlignment = Alignment.Center) { Text("+${images.size - 4}", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 11.sp) }
                        }
                    }
                }
            }
        }
        ProductSummary(product, Modifier.weight(.96f))
    }
}

@Composable private fun ProductSummary(product: Product, modifier: Modifier) {
    Column(modifier.fillMaxHeight()) {
        if (product.brand.isNotBlank()) Text(product.brand, color = Navy, fontWeight = FontWeight.Bold, fontSize = 10.sp)
        Text(product.name, color = Navy, fontWeight = FontWeight.ExtraBold, fontSize = 17.sp, lineHeight = 19.sp, maxLines = 2, overflow = TextOverflow.Ellipsis)
        if (product.shortDescription.isNotBlank()) Text(product.shortDescription, color = Muted, fontSize = 10.sp, lineHeight = 13.sp, maxLines = 2, overflow = TextOverflow.Ellipsis)
        Spacer(Modifier.height(5.dp))
        Row(verticalAlignment = Alignment.CenterVertically) { Icon(Icons.Filled.Star, null, tint = Orange, modifier = Modifier.size(16.dp)); Spacer(Modifier.width(4.dp)); Text("${product.rating} (${product.reviewCount} reviews)", color = Green, fontWeight = FontWeight.Bold, fontSize = 10.sp); Icon(Icons.AutoMirrored.Outlined.ArrowForward, null, tint = Green, modifier = Modifier.size(15.dp)) }
        Spacer(Modifier.height(5.dp))
        Surface(color = SoftGreen, shape = RoundedCornerShape(12.dp)) { Row(Modifier.padding(horizontal = 7.dp, vertical = 4.dp), verticalAlignment = Alignment.CenterVertically) { Icon(Icons.Outlined.Verified, null, tint = Green, modifier = Modifier.size(12.dp)); Spacer(Modifier.width(3.dp)); Text("Verified Product", color = Green, fontWeight = FontWeight.SemiBold, fontSize = 9.sp) } }
        Spacer(Modifier.height(5.dp)); Text(money(product.retailPrice), color = Green, fontWeight = FontWeight.ExtraBold, fontSize = 20.sp); Text("per unit (Retail Price)", color = Muted, fontSize = 9.sp)
        Spacer(Modifier.height(6.dp))
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) { Icon(Icons.Outlined.Inventory2, null, tint = Green, modifier = Modifier.size(17.dp)); Spacer(Modifier.width(4.dp)); Text(if (product.inStock) "In Stock" else "Out of Stock", color = Green, fontWeight = FontWeight.Bold, fontSize = 9.sp); Spacer(Modifier.weight(1f)); Text("SKU: ${product.sku.ifBlank { "—" }}", color = Muted, fontSize = 9.sp, maxLines = 1) }
        Spacer(Modifier.height(6.dp))
        Surface(shape = RoundedCornerShape(11.dp), color = Color.White, border = androidx.compose.foundation.BorderStroke(1.dp, Line)) {
            Column(Modifier.fillMaxWidth().padding(8.dp)) {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) { Text("Added by Reseller", color = Navy, fontWeight = FontWeight.Bold, fontSize = 8.sp); Text("View Store  →", color = Green, fontWeight = FontWeight.Bold, fontSize = 8.sp) }
                Spacer(Modifier.height(5.dp)); Row(verticalAlignment = Alignment.CenterVertically) { Box(Modifier.size(28.dp).clip(CircleShape).background(Navy), contentAlignment = Alignment.Center) { Text(product.sellerName.split(' ').mapNotNull { it.firstOrNull()?.toString() }.take(2).joinToString("").ifBlank { "DTA" }, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 8.sp) }; Spacer(Modifier.width(6.dp)); Column { Text(product.sellerName, color = Navy, fontWeight = FontWeight.Bold, fontSize = 8.sp, maxLines = 1); Text(product.sellerCity.ifBlank { "Verified supplier" }, color = Green, fontSize = 7.sp) } }
            }
        }
    }
}

private data class ColorChoice(val name: String, val tint: Color)

@Composable private fun ColorSelector(product: Product, selected: Int, choose: (Int, String) -> Unit) {
    val colors = if (product.colors.isNotEmpty()) product.colors.map { ColorChoice(it.name, colorFromHex(it.hex)) } else listOf(ColorChoice("Default", Color(0xFF176550)))
    val safeSelected = selected.coerceIn(colors.indices)
    Column(Modifier.padding(horizontal = 14.dp)) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) { Text("Select Color", color = Navy, fontSize = 14.sp, fontWeight = FontWeight.ExtraBold); Text(colors[safeSelected].name, color = Green, fontSize = 10.sp, fontWeight = FontWeight.Bold) }
        Spacer(Modifier.height(9.dp))
        Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            colors.forEachIndexed { index, choice ->
                Column(Modifier.width(74.dp).clickable { choose(index, choice.name) }, horizontalAlignment = Alignment.CenterHorizontally) {
                    Box(Modifier.fillMaxWidth().height(72.dp).clip(RoundedCornerShape(10.dp)).background(Soft).border(if (safeSelected == index) 1.5.dp else .5.dp, if (safeSelected == index) Green else Line, RoundedCornerShape(10.dp)), contentAlignment = Alignment.Center) {
                        val colorImage = product.colors.getOrNull(index)?.imageUrl.orEmpty().ifBlank { product.imageUrl }
                        Box(Modifier.size(34.dp).clip(RoundedCornerShape(9.dp)).background(choice.tint.copy(.18f)))
                        AsyncImage(colorImage, choice.name, Modifier.fillMaxSize().padding(8.dp), contentScale = ContentScale.Fit)
                    }
                    Text(choice.name, Modifier.padding(top = 4.dp), color = if (safeSelected == index) Green else Muted, fontSize = 9.sp, lineHeight = 11.sp, fontWeight = if (safeSelected == index) FontWeight.Bold else FontWeight.Normal, maxLines = 2)
                }
            }
        }
    }
}

@Composable private fun QuantityAndMoq(product: Product, quantity: Int, setQuantity: (Int) -> Unit) {
    Row(Modifier.fillMaxWidth().padding(horizontal = 14.dp), horizontalArrangement = Arrangement.spacedBy(14.dp), verticalAlignment = Alignment.Bottom) {
        Column(Modifier.weight(1.25f)) {
            Text("Quantity", color = Navy, fontSize = 14.sp, fontWeight = FontWeight.ExtraBold); Spacer(Modifier.height(7.dp))
            Row(Modifier.fillMaxWidth().height(48.dp).clip(RoundedCornerShape(13.dp)).background(Soft), verticalAlignment = Alignment.CenterVertically) {
                IconButton({ setQuantity(quantity - 1) }, Modifier.weight(1f), enabled = quantity > 1) { Icon(Icons.Outlined.Remove, "Decrease", tint = Muted, modifier = Modifier.size(17.dp)) }
                Box(Modifier.weight(1f).fillMaxHeight().background(Color.White), contentAlignment = Alignment.Center) { Text(quantity.toString(), color = Navy, fontWeight = FontWeight.Bold, fontSize = 13.sp) }
                IconButton({ setQuantity(quantity + 1) }, Modifier.weight(1f), enabled = quantity < 99) { Icon(Icons.Outlined.Add, "Increase", tint = Muted, modifier = Modifier.size(17.dp)) }
            }
            Text("Minimum order quantity: ${product.moq} units", Modifier.padding(top = 5.dp), color = Navy, fontSize = 10.sp)
        }
        Row(Modifier.weight(.95f).height(72.dp).clip(RoundedCornerShape(13.dp)).background(SoftGreen).padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Outlined.Inventory2, null, tint = Green, modifier = Modifier.size(29.dp)); Spacer(Modifier.width(9.dp)); Column { Text("MOQ", color = Navy, fontWeight = FontWeight.Bold, fontSize = 12.sp); Text("${product.moq} units", color = Green, fontWeight = FontWeight.Bold, fontSize = 10.sp) }; Spacer(Modifier.weight(1f)); Icon(Icons.Outlined.Info, null, tint = Green, modifier = Modifier.size(15.dp))
        }
    }
}

@Composable private fun KeyFeatures(product: Product) {
    val source = product.features.take(6).map { it.title to it.detail }
    val fallback = listOf("Premium quality" to "Verified product", "Ready to sell" to "Reseller friendly", "Reliable stock" to "Fast fulfillment", "Quality checked" to "Trusted sourcing", "Nationwide" to "Tracked delivery", "Support" to "Partner assistance")
    val features = if (source.isEmpty()) fallback else source + fallback.drop(source.size)
    val icons = listOf(Icons.Outlined.Monitor, Icons.AutoMirrored.Outlined.DirectionsRun, Icons.Outlined.FavoriteBorder, Icons.Outlined.WaterDrop, Icons.Outlined.PhoneInTalk, Icons.Outlined.BatteryChargingFull)
    Surface(Modifier.fillMaxWidth().padding(horizontal = 14.dp), color = Color.White, shape = RoundedCornerShape(14.dp), border = androidx.compose.foundation.BorderStroke(1.dp, Line)) {
        Column(Modifier.padding(13.dp)) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) { Text("Key Features", color = Navy, fontWeight = FontWeight.ExtraBold, fontSize = 13.sp); Icon(Icons.AutoMirrored.Outlined.ArrowForward, null, tint = Green, modifier = Modifier.size(17.dp)) }
            Spacer(Modifier.height(10.dp))
            for (row in 0..2) Row(Modifier.fillMaxWidth().padding(vertical = 4.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) { for (column in 0..1) { val index = row * 2 + column; FeatureItem(icons[index], features[index].first, features[index].second, Modifier.weight(1f)) } }
        }
    }
}

@Composable private fun FeatureItem(icon: ImageVector, title: String, detail: String, modifier: Modifier) {
    Row(modifier, verticalAlignment = Alignment.CenterVertically) { Icon(icon, null, tint = Green, modifier = Modifier.size(20.dp)); Spacer(Modifier.width(8.dp)); Column { Text(title, color = Navy, fontWeight = FontWeight.SemiBold, fontSize = 10.sp, maxLines = 1, overflow = TextOverflow.Ellipsis); Text(detail, color = Navy, fontSize = 9.sp, maxLines = 1, overflow = TextOverflow.Ellipsis) } }
}

@Composable private fun DetailAccordion(icon: ImageVector, title: String, expanded: Boolean, toggle: () -> Unit, content: @Composable () -> Unit) {
    Surface(Modifier.fillMaxWidth().padding(horizontal = 14.dp), color = Color.White, shape = RoundedCornerShape(13.dp), border = androidx.compose.foundation.BorderStroke(1.dp, Line)) {
        Column { Row(Modifier.fillMaxWidth().height(52.dp).clickable(onClick = toggle).padding(horizontal = 13.dp), verticalAlignment = Alignment.CenterVertically) { Icon(icon, null, tint = Navy, modifier = Modifier.size(21.dp)); Spacer(Modifier.width(10.dp)); Text(title, Modifier.weight(1f), color = Navy, fontWeight = FontWeight.ExtraBold, fontSize = 12.sp); Icon(if (expanded) Icons.Outlined.ExpandLess else Icons.Outlined.ExpandMore, null, tint = Navy, modifier = Modifier.size(20.dp)) }; AnimatedVisibility(expanded) { Column(Modifier.padding(start = 44.dp, end = 13.dp, bottom = 13.dp)) { content() } } }
    }
}

@Composable private fun SpecRow(label: String, value: String) { Row(Modifier.fillMaxWidth().padding(vertical = 3.dp), horizontalArrangement = Arrangement.SpaceBetween) { Text(label, color = Muted, fontSize = 10.sp); Text(value, color = Navy, fontWeight = FontWeight.Medium, fontSize = 10.sp, maxLines = 1) } }

@Composable private fun CustomerReview(product: Product, reviews: List<com.dreamtoachievers.app.core.model.ProductReview>, canReview: Boolean, message: String?, error: String?, submit: (Int, String) -> Unit) {
    var showForm by remember { mutableStateOf(false) }; var rating by remember { mutableIntStateOf(5) }; var comment by remember { mutableStateOf("") }
    val review = reviews.firstOrNull()
    if (showForm) AlertDialog(onDismissRequest = { showForm = false }, title = { Text("Review this product") }, text = { Column { Row { (1..5).forEach { star -> IconButton({ rating = star }) { Icon(if (star <= rating) Icons.Filled.Star else Icons.Outlined.StarBorder, "$star stars", tint = Orange) } } }; OutlinedTextField(comment, { comment = it }, label = { Text("Your review") }, minLines = 3, modifier = Modifier.fillMaxWidth()) } }, confirmButton = { TextButton(onClick = { submit(rating, comment); if (comment.trim().length >= 10) showForm = false }) { Text("Submit") } }, dismissButton = { TextButton(onClick = { showForm = false }) { Text("Cancel") } })
    Column(Modifier.fillMaxWidth().padding(horizontal = 14.dp)) {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) { Text("Customer Reviews (${reviews.size.coerceAtLeast(product.reviewCount)})", Modifier.weight(1f), color = Navy, fontWeight = FontWeight.ExtraBold, fontSize = 14.sp); TextButton(onClick = { showForm = true }, enabled = canReview, modifier = Modifier.heightIn(min = 48.dp)) { Text(if (canReview) "Write Review →" else "Sign in to review", color = if (canReview) Green else Muted, fontWeight = FontWeight.Bold, fontSize = 10.sp) } }
        message?.let { Text(it, color = Green, fontSize = 10.sp) }; error?.let { Text(it, color = MaterialTheme.colorScheme.error, fontSize = 10.sp) }
        Spacer(Modifier.height(10.dp))
        Surface(color = Color.White, shape = RoundedCornerShape(14.dp), border = androidx.compose.foundation.BorderStroke(1.dp, Line)) {
            Row(Modifier.fillMaxWidth().padding(13.dp), verticalAlignment = Alignment.Top) {
                val name = review?.userName ?: "No reviews yet"; Box(Modifier.size(38.dp).clip(CircleShape).background(Color(0xFFA6CED0)), contentAlignment = Alignment.Center) { Text(name.take(2).uppercase(), color = Color.White, fontWeight = FontWeight.Bold, fontSize = 11.sp) }; Spacer(Modifier.width(10.dp))
                Column(Modifier.weight(1f)) { Row(Modifier.fillMaxWidth()) { Text(name, Modifier.weight(1f), color = Navy, fontWeight = FontWeight.Bold, fontSize = 11.sp); if (review?.verifiedPurchase == true) Text("✓ Verified Purchase", color = Green, fontWeight = FontWeight.Bold, fontSize = 9.sp) }; Row(verticalAlignment = Alignment.CenterVertically) { repeat(review?.rating ?: 0) { Icon(Icons.Filled.Star, null, tint = Orange, modifier = Modifier.size(13.dp)) } }; Spacer(Modifier.height(5.dp)); Text(review?.comment ?: "Be the first logged-in customer to review this product.", color = Navy, fontSize = 10.sp, lineHeight = 14.sp) }
            }
        }
    }
}

@Composable private fun PurchaseBar(product: Product, quantity: Int, onChat: () -> Unit, onAdd: () -> Unit, onBuy: () -> Unit) {
    Surface(color = Color.White, shadowElevation = 10.dp, modifier = Modifier.fillMaxWidth().navigationBarsPadding()) {
        Row(Modifier.fillMaxWidth().padding(horizontal = 14.dp, vertical = 10.dp), horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.width(48.dp).height(54.dp).clip(RoundedCornerShape(13.dp)).background(Soft).clickable(onClick = onChat), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) { Icon(Icons.Outlined.HeadsetMic, "Chat", tint = Navy, modifier = Modifier.size(21.dp)); Text("Chat", color = Green, fontWeight = FontWeight.Bold, fontSize = 8.sp) }
            OutlinedButton(onAdd, Modifier.weight(1.05f).height(54.dp), enabled = product.inStock, shape = RoundedCornerShape(13.dp), border = androidx.compose.foundation.BorderStroke(1.2.dp, Green), colors = ButtonDefaults.outlinedButtonColors(contentColor = Green)) { Column(horizontalAlignment = Alignment.CenterHorizontally) { Row(verticalAlignment = Alignment.CenterVertically) { Icon(Icons.Outlined.ShoppingCart, null, modifier = Modifier.size(18.dp)); Spacer(Modifier.width(5.dp)); Text("Add to Cart", fontWeight = FontWeight.ExtraBold, fontSize = 12.sp) }; Text("Add $quantity ${if (quantity == 1) "unit" else "units"}", fontSize = 8.sp) } }
            Button(onBuy, Modifier.weight(1.08f).height(54.dp), enabled = product.inStock, shape = RoundedCornerShape(13.dp), colors = ButtonDefaults.buttonColors(containerColor = Green)) { Column(horizontalAlignment = Alignment.CenterHorizontally) { Row(verticalAlignment = Alignment.CenterVertically) { Text("Buy Now", fontWeight = FontWeight.ExtraBold, fontSize = 12.sp); Spacer(Modifier.width(5.dp)); Icon(Icons.AutoMirrored.Outlined.ArrowForward, null, modifier = Modifier.size(18.dp)) }; Text("Proceed to Checkout", fontSize = 8.sp) } }
        }
    }
}

private fun money(value: Double): String = "Rs ${NumberFormat.getIntegerInstance(Locale.forLanguageTag("en-PK")).format(value)}"
private fun colorFromHex(hex: String): Color = runCatching { Color(android.graphics.Color.parseColor(hex)) }.getOrDefault(Color(0xFF1F2937))
