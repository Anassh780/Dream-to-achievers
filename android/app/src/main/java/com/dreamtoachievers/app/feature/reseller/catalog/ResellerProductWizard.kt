package com.dreamtoachievers.app.feature.reseller.catalog

import android.content.Context
import android.content.SharedPreferences
import android.content.Intent
import android.net.Uri
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.outlined.AddPhotoAlternate
import androidx.compose.material.icons.outlined.DeleteOutline
import androidx.compose.material.icons.outlined.Inventory2
import androidx.compose.material.icons.outlined.Lightbulb
import androidx.compose.material.icons.outlined.Publish
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.dreamtoachievers.app.core.model.Category
import com.dreamtoachievers.app.core.model.Product
import com.dreamtoachievers.app.core.model.ProductColor
import com.dreamtoachievers.app.core.model.ProductFeature
import kotlinx.coroutines.delay
import org.json.JSONArray
import org.json.JSONObject
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.min
import kotlin.math.sin
import kotlin.math.sqrt

private val WizardNavy = Color(0xFF07182F)
private val WizardGreen = Color(0xFF00875A)
private val WizardLine = Color(0xFFE5EAF0)
private val WizardSoft = Color(0xFFF6F8FA)

@Composable
fun ResellerProductWizard(
    categories: List<Category>,
    submitting: Boolean,
    submissionError: String?,
    onDismiss: () -> Unit,
    onSubmit: (Product, List<Uri>) -> Unit,
) {
    val context = LocalContext.current
    val draftPrefs = remember { context.getSharedPreferences(PRODUCT_DRAFT_PREFS, Context.MODE_PRIVATE) }
    val restored = remember { ProductDraft.read(draftPrefs) }
    var step by rememberSaveable { mutableIntStateOf(restored.step) }
    var title by rememberSaveable { mutableStateOf(restored.title) }; var brand by rememberSaveable { mutableStateOf(restored.brand) }
    var category by rememberSaveable { mutableStateOf(restored.category) }; var sku by rememberSaveable { mutableStateOf(restored.sku) }
    var barcode by rememberSaveable { mutableStateOf(restored.barcode) }; var shortDescription by rememberSaveable { mutableStateOf(restored.shortDescription) }
    var overview by rememberSaveable { mutableStateOf(restored.overview) }; var retail by rememberSaveable { mutableStateOf(restored.retail) }
    var wholesale by rememberSaveable { mutableStateOf(restored.wholesale) }; var stock by rememberSaveable { mutableStateOf(restored.stock) }
    var moq by rememberSaveable { mutableStateOf(restored.moq) }; var allowMultiple by rememberSaveable { mutableStateOf(restored.allowMultiple) }
    var images by remember { mutableStateOf(restored.images.map(Uri::parse)) }
    val colors = remember { mutableStateListOf<ProductColor>().apply { addAll(restored.colors) } }
    val specs = remember { mutableStateListOf<Pair<String, String>>().apply { addAll(restored.specs.ifEmpty { listOf("" to "") }) } }
    val features = remember { mutableStateListOf<Pair<String, String>>().apply { addAll(restored.features.ifEmpty { listOf("" to "") }) } }
    var notice by rememberSaveable { mutableStateOf<String?>(null) }
    val picker = rememberLauncherForActivityResult(ActivityResultContracts.OpenMultipleDocuments()) { selected ->
        selected.forEach { uri -> runCatching { context.contentResolver.takePersistableUriPermission(uri, Intent.FLAG_GRANT_READ_URI_PERMISSION) } }
        images = (images + selected).distinct().take(10)
    }
    val retailValue = retail.toDoubleOrNull() ?: 0.0
    val wholesaleValue = wholesale.toDoubleOrNull() ?: 0.0
    val readyStep1 = title.isNotBlank() && brand.isNotBlank() && category.isNotBlank() && sku.isNotBlank() && images.size >= 3 && shortDescription.isNotBlank() && overview.isNotBlank()
    val readyStep2 = retailValue > 0.0 &&
            wholesaleValue > 0.0 && wholesaleValue <= retailValue &&
            (stock.toIntOrNull() ?: -1) >= 0 &&
            (moq.toIntOrNull() ?: 0) > 0 &&
            specs.any { it.first.isNotBlank() && it.second.isNotBlank() } &&
            features.any { it.first.isNotBlank() && it.second.isNotBlank() }
    var confirmDismiss by remember { mutableStateOf(false) }
    val hasChanges = title.isNotBlank() || brand.isNotBlank() || images.isNotEmpty() || retail.isNotBlank()
    val requestDismiss = { if (hasChanges) confirmDismiss = true else onDismiss() }
    val saveDraft = {
        ProductDraft(step, title, brand, category, sku, barcode, shortDescription, overview, retail, wholesale, stock, moq, allowMultiple, images.map(Uri::toString), colors.toList(), specs.toList(), features.toList()).write(draftPrefs)
    }
    LaunchedEffect(step, title, brand, category, sku, barcode, shortDescription, overview, retail, wholesale, stock, moq, allowMultiple, images, colors.toList(), specs.toList(), features.toList()) {
        delay(600)
        if (hasChanges) saveDraft()
    }
    BackHandler(enabled = !submitting) { if (step > 1) step-- else requestDismiss() }
    if (confirmDismiss) {
        AlertDialog(
            onDismissRequest = { confirmDismiss = false },
            title = { Text("Leave product listing?") },
            text = { Text("Your progress is saved on this device so you can continue later.") },
            confirmButton = { TextButton(onClick = { saveDraft(); confirmDismiss = false; onDismiss() }) { Text("Save & close", color = WizardGreen) } },
            dismissButton = { TextButton(onClick = { confirmDismiss = false }) { Text("Keep editing", color = WizardGreen) } },
        )
    }

    Surface(Modifier.fillMaxSize(), color = Color.White) {
        Column(Modifier.fillMaxSize().statusBarsPadding()) {
            WizardHeader(requestDismiss, { saveDraft(); notice = "Draft saved on this device." })
            WizardSteps(step)
            when (step) {
                1 -> ProductInfoStep(categories, title, { title = it.take(120) }, brand, { brand = it.take(60) }, category, { category = it }, sku, { sku = it.uppercase().take(40) }, barcode, { barcode = it.filter(Char::isDigit).take(32) }, images, { picker.launch(arrayOf("image/*")) }, { images = images - it }, { uri -> images = listOf(uri) + images.filter { it != uri } }, shortDescription, { shortDescription = it.take(150) }, overview, { overview = it.take(2000) })
                2 -> PricingStep(retail, { retail = it }, wholesale, { wholesale = it }, stock, { stock = it }, moq, { moq = it }, allowMultiple, { allowMultiple = it }, colors, specs, features)
                else -> PublishStep(title, category, images, retail, wholesale, stock, moq, colors, specs, features)
            }
            notice?.let { Text(it, color = WizardGreen, fontSize = 12.sp, modifier = Modifier.padding(horizontal = 20.dp, vertical = 4.dp)) }
            submissionError?.let { Text(it, color = MaterialTheme.colorScheme.error, fontSize = 12.sp, modifier = Modifier.padding(horizontal = 20.dp, vertical = 4.dp)) }
            WizardFooter(
                step = step,
                submitting = submitting,
                back = { if (step == 1) requestDismiss() else step-- },
                next = {
                    when (step) {
                        1 -> if (readyStep1) { step = 2; notice = null } else notice = "Complete every required field and add at least 3 product photos."
                        2 -> if (readyStep2) { step = 3; notice = null } else notice = "Check pricing (cost cannot exceed retail), stock and MOQ, then add at least one specification and feature."
                        else -> onSubmit(Product(
                            name = title.trim(), slug = title.trim().lowercase().replace(Regex("[^a-z0-9]+"), "-").trim('-'), brand = brand.trim(), category = category,
                            sku = sku.trim(), barcode = barcode.trim(), shortDescription = shortDescription.trim(), description = overview.trim(), retailPrice = retail.toDouble(), originalPrice = wholesale.toDouble(),
                            stockCount = stock.toInt(), inStock = stock.toInt() > 0, moq = moq.toInt(), allowMultipleQuantity = allowMultiple, colors = colors.toList(),
                            features = features.filter { it.first.isNotBlank() && it.second.isNotBlank() }.map { ProductFeature(it.first, it.second) },
                            specifications = specs.filter { it.first.isNotBlank() && it.second.isNotBlank() }.toMap(), status = "pending_review"
                        ), images)
                    }
                },
            )
        }
    }
}

@Composable private fun WizardHeader(onBack: () -> Unit, onDraft: () -> Unit) {
    Row(Modifier.fillMaxWidth().padding(horizontal = 18.dp, vertical = 10.dp), verticalAlignment = Alignment.CenterVertically) {
        IconButton(onBack, modifier = Modifier.size(48.dp)) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back", tint = WizardNavy) }
        Spacer(Modifier.weight(1f))
        TextButton(onClick = onDraft, modifier = Modifier.heightIn(min = 48.dp)) { Text("Save Draft", color = WizardGreen, fontWeight = FontWeight.Bold) }
    }
    Column(Modifier.padding(horizontal = 26.dp, vertical = 3.dp)) { Text("Add New Product", color = WizardNavy, fontSize = 26.sp, fontWeight = FontWeight.ExtraBold); Text("List your product with accurate details. Quality listings get approved faster.", color = Color(0xFF68758B), fontSize = 13.sp, lineHeight = 18.sp, modifier = Modifier.padding(top = 4.dp)) }
}

@Composable private fun WizardSteps(step: Int) {
    Row(Modifier.fillMaxWidth().padding(horizontal = 26.dp, vertical = 20.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
        StepDot(1, "Product Info", step); Box(Modifier.weight(1f).height(1.dp).background(WizardLine).padding(horizontal = 6.dp)); StepDot(2, "Pricing & Stock", step); Box(Modifier.weight(1f).height(1.dp).background(WizardLine).padding(horizontal = 6.dp)); StepDot(3, "Details & Publish", step)
    }
    HorizontalDivider(color = WizardLine)
}

@Composable private fun StepDot(number: Int, label: String, current: Int) {
    val done = number < current
    val active = number == current
    Row(verticalAlignment = Alignment.CenterVertically) {
        Surface(Modifier.size(30.dp), shape = CircleShape, color = if (active) WizardGreen else if (done) Color(0xFFDDF3EA) else Color(0xFFF0F3F7)) {
            Box(contentAlignment = Alignment.Center) {
                if (done) Icon(Icons.Default.Check, null, tint = WizardGreen, modifier = Modifier.size(17.dp))
                else Text(number.toString(), color = if (active) Color.White else Color(0xFF6B778C), fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }
        }
        Spacer(Modifier.width(6.dp))
        Text(label, color = if (active || done) WizardGreen else Color(0xFF6B778C), fontSize = 10.sp, fontWeight = if (active) FontWeight.Bold else FontWeight.Medium, maxLines = 1)
    }
}

@Composable private fun ColumnScope.ProductInfoStep(categories: List<Category>, title: String, onTitle: (String)->Unit, brand: String, onBrand:(String)->Unit, category:String, onCategory:(String)->Unit, sku:String, onSku:(String)->Unit, barcode:String,onBarcode:(String)->Unit, images:List<Uri>, pick:()->Unit, remove:(Uri)->Unit, promote:(Uri)->Unit, short:String,onShort:(String)->Unit, overview:String,onOverview:(String)->Unit) {
    LazyColumn(Modifier.weight(1f), contentPadding = PaddingValues(26.dp), verticalArrangement = Arrangement.spacedBy(13.dp)) {
        item { Section("Basic Information") }; item { Field("Product Title *", title, onTitle, "e.g. Max 1150 Smart Watch") }; item { Field("Brand *", brand, onBrand, "Brand name") }
        item { Text("Category *", color = WizardNavy, fontSize = 12.sp, fontWeight = FontWeight.Bold); LazyRow(horizontalArrangement = Arrangement.spacedBy(7.dp), modifier = Modifier.padding(top = 6.dp)) { items(categories) { item -> FilterChip(selected = category == item.name, onClick = { onCategory(item.name) }, label = { Text(item.name, fontSize = 11.sp) }) } } }
        item { Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) { Field("SKU *", sku, onSku, "e.g. MAX1150", Modifier.weight(1f)); Field("Barcode", barcode, onBarcode, "Optional", Modifier.weight(1f), false) } }
        item { Section("Product Images *"); Text("Add at least 3 clear, high-quality images. The first photo is the cover.", color = Color(0xFF68758B), fontSize = 11.sp) }
        item { ImageGrid(images, pick, remove, promote) }
        item { Field("Short Description *", short, onShort, "e.g. 1.96\" HD display smart watch with fitness tracking...", minLines = 2, supporting = "${short.length}/150") }
        item { Field("Product Overview *", overview, onOverview, "Describe your product in detail...", minLines = 5, supporting = "${overview.length}/2000") }
    }
}

@Composable private fun ColumnScope.PricingStep(retail:String,onRetail:(String)->Unit, wholesale:String,onWholesale:(String)->Unit, stock:String,onStock:(String)->Unit, moq:String,onMoq:(String)->Unit, allow:Boolean,onAllow:(Boolean)->Unit, colors:MutableList<ProductColor>, specs:MutableList<Pair<String,String>>, features:MutableList<Pair<String,String>>) {
    LazyColumn(Modifier.weight(1f), contentPadding = PaddingValues(26.dp), verticalArrangement = Arrangement.spacedBy(13.dp)) {
        item { Section("Pricing") }; item { Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) { Field("Retail Price (PKR) *", retail, onRetail, "3800", Modifier.weight(1f), false, KeyboardType.Decimal); Field("Wholesale Cost (PKR) *", wholesale, onWholesale, "2800", Modifier.weight(1f), false, KeyboardType.Decimal) } }
        item { MarginPanel(retail.toDoubleOrNull(), wholesale.toDoubleOrNull()) }; item { Section("Stock & Ordering") }; item { Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) { Field("Total Stock Units *", stock, onStock, "500", Modifier.weight(1f), false, KeyboardType.Number); Field("MOQ *", moq, onMoq, "10", Modifier.weight(1f), false, KeyboardType.Number) } }
        item { Row(Modifier.fillMaxWidth().border(1.dp, WizardLine, RoundedCornerShape(12.dp)).padding(12.dp), verticalAlignment = Alignment.CenterVertically) { Icon(Icons.Outlined.Inventory2, null, tint = WizardGreen); Spacer(Modifier.width(9.dp)); Column(Modifier.weight(1f)) { Text("Allow Multiple Quantity", color = WizardNavy, fontWeight = FontWeight.Bold, fontSize = 12.sp); Text("Buyers can order more than MOQ", color = Color(0xFF68758B), fontSize = 10.sp) }; Switch(allow, onAllow) } }
        item { EditableColors(colors) }; item { EditablePairs("Specifications", "Add Specification", specs, "Display Size", "1.96\" AMOLED") }; item { EditablePairs("Key Features", "Add Feature", features, "HD Display", "1.96\" AMOLED display") }
    }
}

@Composable private fun ColumnScope.PublishStep(title:String, category:String, images:List<Uri>, retail:String, wholesale:String, stock:String, moq:String, colors:List<ProductColor>, specs:List<Pair<String,String>>, features:List<Pair<String,String>>) { LazyColumn(Modifier.weight(1f), contentPadding = PaddingValues(26.dp), verticalArrangement = Arrangement.spacedBy(15.dp)) { item { Section("Details & Publish"); Text("Review your listing before sending it for approval.", color = Color(0xFF68758B), fontSize = 12.sp) }; item { Surface(shape = RoundedCornerShape(14.dp), border = BorderStroke(1.dp, WizardLine), color = Color.White) { Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) { Text(title.ifBlank { "Untitled product" }, color = WizardNavy, fontWeight = FontWeight.ExtraBold, fontSize = 18.sp); Summary("Category", category); Summary("Retail / wholesale", "PKR $retail / PKR $wholesale"); Summary("Stock / MOQ", "$stock units / $moq units"); Summary("Photos", "${images.size} selected"); Summary("Colors, specs, features", "${colors.size}, ${specs.count { it.first.isNotBlank() }}, ${features.count { it.first.isNotBlank() }}") } } }; item { Row(Modifier.fillMaxWidth().background(Color(0xFFEAF7F1), RoundedCornerShape(12.dp)).padding(14.dp), verticalAlignment = Alignment.Top) { Icon(Icons.Outlined.Lightbulb, null, tint = WizardGreen); Spacer(Modifier.width(9.dp)); Text("Your listing will be submitted for admin review. It becomes visible to buyers only after approval.", color = WizardGreen, fontSize = 12.sp, lineHeight = 17.sp) } } } }
@Composable private fun Summary(label:String,value:String) { Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) { Text(label, color = Color(0xFF68758B), fontSize = 12.sp); Text(value.ifBlank { "—" }, color = WizardNavy, fontSize = 12.sp, fontWeight = FontWeight.SemiBold) } }

@Composable private fun ImageGrid(images:List<Uri>, pick:()->Unit, remove:(Uri)->Unit, promote:(Uri)->Unit) { LazyRow(horizontalArrangement = Arrangement.spacedBy(9.dp)) { item { OutlinedButton(onClick = pick, modifier = Modifier.size(112.dp), shape = RoundedCornerShape(12.dp)) { Column(horizontalAlignment = Alignment.CenterHorizontally) { Icon(Icons.Outlined.AddPhotoAlternate, null, tint = WizardGreen); Text("Add Photos", color = WizardGreen, fontSize = 11.sp); Text("${images.size}/10", color = WizardGreen, fontSize = 10.sp) } } }; items(images) { uri -> Box(Modifier.size(112.dp).clip(RoundedCornerShape(12.dp)).background(WizardSoft).clickable { promote(uri) }) { AsyncImage(uri, "Product image", Modifier.fillMaxSize(), contentScale = ContentScale.Crop); IconButton(onClick = { remove(uri) }, modifier = Modifier.align(Alignment.TopEnd).size(48.dp)) { Surface(shape = CircleShape, color = Color.White) { Icon(Icons.Default.Close, "Remove photo", tint = WizardNavy, modifier = Modifier.padding(7.dp).size(18.dp)) } }; Text(if (uri == images.first()) "Cover" else "Set cover", color = Color.White, fontSize = 9.sp, fontWeight = FontWeight.Bold, modifier = Modifier.align(Alignment.BottomStart).background(if (uri == images.first()) WizardGreen else WizardNavy.copy(alpha = .65f), RoundedCornerShape(topEnd = 5.dp)).padding(horizontal = 7.dp, vertical = 4.dp)) } } } }

@Composable
private fun EditableColors(colors: MutableList<ProductColor>) {
    var editingIndex by remember { mutableStateOf<Int?>(null) }
    var pickerOpen by remember { mutableStateOf(false) }
    if (pickerOpen) {
        val initial = editingIndex?.let { colors.getOrNull(it) } ?: ProductColor("", "#00875A")
        ProductColorPickerDialog(
            initial = initial,
            onDismiss = { pickerOpen = false },
            onConfirm = { picked ->
                val index = editingIndex
                if (index != null && index in colors.indices) colors[index] = picked else colors.add(picked)
                pickerOpen = false
            },
        )
    }
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Section("Colors")
            TextButton(onClick = { editingIndex = null; pickerOpen = true }, enabled = colors.size < 12, modifier = Modifier.heightIn(min = 48.dp)) {
                Text("+ Add Color", color = WizardGreen, fontWeight = FontWeight.Bold, fontSize = 12.sp)
            }
        }
        if (colors.isEmpty()) {
            Text("Optional — add each available product color.", color = Color(0xFF68758B), fontSize = 11.sp)
        }
        colors.forEachIndexed { index, color ->
            Surface(
                onClick = { editingIndex = index; pickerOpen = true },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                border = BorderStroke(1.dp, WizardLine),
                color = Color.White,
            ) {
                Row(Modifier.fillMaxWidth().padding(start = 12.dp, top = 8.dp, bottom = 8.dp, end = 4.dp), verticalAlignment = Alignment.CenterVertically) {
                    Box(Modifier.size(36.dp).clip(CircleShape).background(hexColor(color.hex)).border(1.dp, WizardLine, CircleShape))
                    Spacer(Modifier.width(12.dp))
                    Column(Modifier.weight(1f)) {
                        Text(color.name, color = WizardNavy, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                        Text(color.hex.uppercase(), color = Color(0xFF68758B), fontSize = 11.sp)
                    }
                    IconButton(onClick = { colors.removeAt(index) }, modifier = Modifier.size(48.dp)) {
                        Icon(Icons.Outlined.DeleteOutline, "Remove ${color.name}", tint = Color(0xFF68758B), modifier = Modifier.size(21.dp))
                    }
                }
            }
        }
        if (colors.size >= 12) Text("Maximum 12 colors added.", color = Color(0xFF68758B), fontSize = 11.sp)
    }
}

@Composable
private fun ProductColorPickerDialog(initial: ProductColor, onDismiss: () -> Unit, onConfirm: (ProductColor) -> Unit) {
    val starting = remember(initial.hex) {
        FloatArray(3).also { hsv -> android.graphics.Color.colorToHSV(hexColor(initial.hex).toArgb(), hsv) }
    }
    var name by remember(initial.name) { mutableStateOf(initial.name) }
    var hue by remember(initial.hex) { mutableFloatStateOf(starting[0]) }
    var saturation by remember(initial.hex) { mutableFloatStateOf(starting[1]) }
    var value by remember(initial.hex) { mutableFloatStateOf(starting[2]) }
    val selected = Color(android.graphics.Color.HSVToColor(floatArrayOf(hue, saturation, value)))
    val hex = "#%06X".format(0xFFFFFF and selected.toArgb())
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(if (initial.name.isBlank()) "Add product color" else "Edit product color", color = WizardNavy, fontWeight = FontWeight.ExtraBold) },
        text = {
            Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(12.dp)) {
                HueSaturationWheel(hue, saturation) { newHue, newSaturation -> hue = newHue; saturation = newSaturation }
                Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                    Box(Modifier.size(42.dp).clip(CircleShape).background(selected).border(1.dp, WizardLine, CircleShape))
                    Spacer(Modifier.width(12.dp))
                    Column(Modifier.weight(1f)) { Text("Selected color", color = Color(0xFF68758B), fontSize = 11.sp); Text(hex, color = WizardNavy, fontWeight = FontWeight.Bold) }
                }
                Text("Brightness", modifier = Modifier.fillMaxWidth(), color = WizardNavy, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Slider(value = value, onValueChange = { value = it }, valueRange = 0.15f..1f, colors = SliderDefaults.colors(thumbColor = selected, activeTrackColor = selected))
                OutlinedTextField(name, { name = it.take(32) }, modifier = Modifier.fillMaxWidth(), label = { Text("Color name") }, placeholder = { Text("e.g. Royal Emerald") }, singleLine = true)
                Text("The hex value is added automatically.", color = Color(0xFF68758B), fontSize = 11.sp, modifier = Modifier.fillMaxWidth())
            }
        },
        confirmButton = { Button(onClick = { onConfirm(ProductColor(name.trim().ifBlank { "Custom color" }, hex)) }, colors = ButtonDefaults.buttonColors(containerColor = WizardGreen)) { Text(if (initial.name.isBlank()) "Add Color" else "Save Color") } },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel", color = Color(0xFF68758B)) } },
        shape = RoundedCornerShape(20.dp),
        containerColor = Color.White,
    )
}

@Composable
private fun HueSaturationWheel(hue: Float, saturation: Float, onPick: (Float, Float) -> Unit) {
    fun pick(position: Offset, width: Float, height: Float) {
        val center = Offset(width / 2f, height / 2f)
        val dx = position.x - center.x
        val dy = position.y - center.y
        val radius = min(width, height) / 2f
        val sat = (sqrt(dx * dx + dy * dy) / radius).coerceIn(0f, 1f)
        val angle = Math.toDegrees(atan2(dy.toDouble(), dx.toDouble())).toFloat()
        onPick((angle + 360f) % 360f, sat)
    }
    Canvas(
        Modifier.size(228.dp)
            .pointerInput(Unit) { detectTapGestures { pick(it, size.width.toFloat(), size.height.toFloat()) } }
            .pointerInput(Unit) { detectDragGestures(onDragStart = { pick(it, size.width.toFloat(), size.height.toFloat()) }) { change, _ -> change.consume(); pick(change.position, size.width.toFloat(), size.height.toFloat()) } },
    ) {
        val radius = size.minDimension / 2f
        drawCircle(Brush.sweepGradient(listOf(Color.Red, Color.Yellow, Color.Green, Color.Cyan, Color.Blue, Color.Magenta, Color.Red)), radius)
        drawCircle(Brush.radialGradient(listOf(Color.White, Color.Transparent), center = center, radius = radius), radius)
        val markerRadius = saturation * radius
        val radians = Math.toRadians(hue.toDouble())
        val marker = Offset(center.x + cos(radians).toFloat() * markerRadius, center.y + sin(radians).toFloat() * markerRadius)
        drawCircle(Color.White, 8.dp.toPx(), marker)
        drawCircle(Color(0xAA07182F), 5.dp.toPx(), marker)
    }
}
@Composable private fun EditablePairs(title:String, addLabel:String, rows:MutableList<Pair<String,String>>, leftHint:String, rightHint:String) { Column(verticalArrangement = Arrangement.spacedBy(8.dp)) { Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) { Section(title); TextButton(onClick = { rows.add("" to "") }, modifier = Modifier.heightIn(min = 48.dp)) { Text("+ $addLabel", color = WizardGreen, fontWeight = FontWeight.Bold, fontSize = 12.sp) } }; rows.forEachIndexed { index, pair -> Row(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalAlignment = Alignment.CenterVertically) { OutlinedTextField(pair.first, { rows[index] = it to pair.second }, Modifier.weight(1f), label = { Text(if (title == "Specifications") "Name" else "Feature") }, placeholder = { Text(leftHint, fontSize = 10.sp) }, singleLine = true); OutlinedTextField(pair.second, { rows[index] = pair.first to it }, Modifier.weight(1f), label = { Text("Value") }, placeholder = { Text(rightHint, fontSize = 10.sp) }, singleLine = true); IconButton(onClick = { rows.removeAt(index) }, modifier = Modifier.size(48.dp)) { Icon(Icons.Default.Close, "Remove row", tint = Color(0xFF68758B), modifier = Modifier.size(20.dp)) } } } } }
@Composable private fun MarginPanel(retail:Double?, wholesale:Double?) { val margin = (retail ?: 0.0) - (wholesale ?: 0.0); val percent = if ((retail ?: 0.0) > 0) margin / retail!! * 100 else 0.0; Row(Modifier.fillMaxWidth().background(Color(0xFFEAF7F1), RoundedCornerShape(12.dp)).padding(14.dp), verticalAlignment = Alignment.CenterVertically) { Icon(Icons.Outlined.Inventory2, null, tint = WizardGreen); Spacer(Modifier.width(9.dp)); Column(Modifier.weight(1f)) { Text("Expected Margin", color = WizardGreen, fontSize = 11.sp, fontWeight = FontWeight.Bold); Text("Rs ${margin.toInt()} (${percent.toInt()}%)", color = WizardGreen, fontSize = 15.sp, fontWeight = FontWeight.ExtraBold) }; Text("Buyers see potential profit.", color = WizardGreen, fontSize = 10.sp, modifier = Modifier.weight(1f)) } }
@Composable private fun Section(text:String) { Text(text, color = WizardNavy, fontSize = 16.sp, fontWeight = FontWeight.ExtraBold) }
@Composable private fun Field(label:String, value:String, change:(String)->Unit, hint:String, modifier:Modifier = Modifier.fillMaxWidth(), required:Boolean = true, keyboard:KeyboardType = KeyboardType.Text, minLines:Int = 1, supporting:String? = null) { Column(modifier) { Text(label, color = WizardNavy, fontSize = 11.sp, fontWeight = FontWeight.Bold); OutlinedTextField(value, change, Modifier.fillMaxWidth().padding(top = 5.dp), placeholder = { Text(hint, fontSize = 12.sp) }, minLines = minLines, keyboardOptions = KeyboardOptions(keyboardType = keyboard), supportingText = supporting?.let { { Text(it, Modifier.fillMaxWidth(), textAlign = TextAlign.End) } }) } }
@Composable private fun WizardFooter(step:Int, submitting:Boolean, back:()->Unit, next:()->Unit) { Row(Modifier.fillMaxWidth().navigationBarsPadding().padding(horizontal = 26.dp, vertical = 12.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) { if (step > 1) OutlinedButton(back, Modifier.weight(.35f).height(52.dp), shape = RoundedCornerShape(13.dp)) { Text("Back") }; Button(next, Modifier.weight(1f).height(52.dp), enabled = !submitting, shape = RoundedCornerShape(13.dp), colors = ButtonDefaults.buttonColors(containerColor = WizardGreen)) { if (submitting) CircularProgressIndicator(Modifier.size(20.dp), color = Color.White, strokeWidth = 2.dp) else { Text(if (step == 1) "Next: Pricing & Stock" else if (step == 2) "Next: Details & Publish" else "Submit for Review", fontWeight = FontWeight.Bold); Spacer(Modifier.width(7.dp)); Icon(if (step == 3) Icons.Outlined.Publish else Icons.AutoMirrored.Filled.ArrowForward, null, modifier = Modifier.size(18.dp)) } } } }
private fun hexColor(hex:String):Color = runCatching { Color(android.graphics.Color.parseColor(hex)) }.getOrDefault(WizardGreen)

const val PRODUCT_DRAFT_PREFS = "reseller_product_draft"

private data class ProductDraft(
    val step: Int = 1,
    val title: String = "",
    val brand: String = "",
    val category: String = "",
    val sku: String = "",
    val barcode: String = "",
    val shortDescription: String = "",
    val overview: String = "",
    val retail: String = "",
    val wholesale: String = "",
    val stock: String = "",
    val moq: String = "1",
    val allowMultiple: Boolean = true,
    val images: List<String> = emptyList(),
    val colors: List<ProductColor> = emptyList(),
    val specs: List<Pair<String, String>> = emptyList(),
    val features: List<Pair<String, String>> = emptyList(),
) {
    fun write(preferences: SharedPreferences) {
        val root = JSONObject().apply {
            put("step", step); put("title", title); put("brand", brand); put("category", category); put("sku", sku); put("barcode", barcode)
            put("shortDescription", shortDescription); put("overview", overview); put("retail", retail); put("wholesale", wholesale); put("stock", stock); put("moq", moq); put("allowMultiple", allowMultiple)
            put("images", JSONArray(images))
            put("colors", JSONArray().apply { colors.forEach { put(JSONObject().put("name", it.name).put("hex", it.hex).put("imageUrl", it.imageUrl)) } })
            put("specs", pairArray(specs)); put("features", pairArray(features))
        }
        preferences.edit().putString("draft", root.toString()).apply()
    }

    companion object {
        fun read(preferences: SharedPreferences): ProductDraft = runCatching {
            val root = JSONObject(preferences.getString("draft", null) ?: return ProductDraft())
            ProductDraft(
                step = root.optInt("step", 1).coerceIn(1, 3), title = root.optString("title"), brand = root.optString("brand"), category = root.optString("category"), sku = root.optString("sku"), barcode = root.optString("barcode"),
                shortDescription = root.optString("shortDescription"), overview = root.optString("overview"), retail = root.optString("retail"), wholesale = root.optString("wholesale"), stock = root.optString("stock"), moq = root.optString("moq", "1"), allowMultiple = root.optBoolean("allowMultiple", true),
                images = root.optJSONArray("images").strings(), colors = root.optJSONArray("colors").colors(), specs = root.optJSONArray("specs").pairs(), features = root.optJSONArray("features").pairs(),
            )
        }.getOrDefault(ProductDraft())
    }
}

private fun pairArray(values: List<Pair<String, String>>) = JSONArray().apply { values.forEach { put(JSONArray(listOf(it.first, it.second))) } }
private fun JSONArray?.strings(): List<String> = if (this == null) emptyList() else (0 until length()).mapNotNull { optString(it).takeIf(String::isNotBlank) }
private fun JSONArray?.pairs(): List<Pair<String, String>> = if (this == null) emptyList() else (0 until length()).mapNotNull { index -> optJSONArray(index)?.let { it.optString(0) to it.optString(1) } }
private fun JSONArray?.colors(): List<ProductColor> = if (this == null) emptyList() else (0 until length()).mapNotNull { index -> optJSONObject(index)?.let { ProductColor(it.optString("name"), it.optString("hex", "#00875A"), it.optString("imageUrl")) } }
