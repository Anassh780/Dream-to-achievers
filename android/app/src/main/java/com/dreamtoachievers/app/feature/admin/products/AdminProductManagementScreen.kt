package com.dreamtoachievers.app.feature.admin.products

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.dreamtoachievers.app.core.data.AdminRepository
import com.dreamtoachievers.app.core.designsystem.components.*
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme
import com.dreamtoachievers.app.core.model.PartnerProduct

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminProductManagementScreen(
    adminRepository: AdminRepository,
    onNavigateBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val products by adminRepository.products.collectAsState()
    var editingProduct by remember { mutableStateOf<PartnerProduct?>(null) }
    var showCreateSheet by remember { mutableStateOf(false) }

    // Create / Edit Product Modal Bottom Sheet (Point 59)
    if (showCreateSheet || editingProduct != null) {
        val prodToEdit = editingProduct ?: PartnerProduct(
            id = "prod-new-${System.currentTimeMillis() % 10000}",
            name = "",
            category = "Executive Lifestyle",
            retailPrice = 4500.0,
            partnerPrice = 3200.0,
            suggestedSellingPrice = 4500.0,
            inStock = true,
            stockCount = 50
        )

        ProductFormBottomSheet(
            initialProduct = prodToEdit,
            isNew = editingProduct == null,
            onDismiss = {
                showCreateSheet = false
                editingProduct = null
            },
            onSave = { updated ->
                adminRepository.saveProduct(updated)
                showCreateSheet = false
                editingProduct = null
            }
        )
    }

    Scaffold(
        topBar = {
            DtaTopAppBar(
                title = "Product Inventory & Margins",
                subtitle = "Manage wholesale pricing, retail price, stock & catalog",
                navigationIcon = Icons.Default.ArrowBack,
                onNavigationClick = onNavigateBack
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showCreateSheet = true },
                containerColor = DtaTheme.colors.primary,
                contentColor = Color.White
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add Product")
            }
        },
        containerColor = DtaTheme.colors.background,
        modifier = modifier.fillMaxSize()
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentPadding = PaddingValues(start = 16.dp, end = 16.dp, bottom = 80.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(products) { product ->
                AdminProductCard(
                    product = product,
                    onEdit = { editingProduct = product },
                    onToggleStock = { adminRepository.toggleProductStock(product.id) }
                )
            }
        }
    }
}

@Composable
private fun AdminProductCard(
    product: PartnerProduct,
    onEdit: () -> Unit,
    onToggleStock: () -> Unit
) {
    Card(
        shape = DtaTheme.shapes.Card,
        colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
        border = androidx.compose.foundation.BorderStroke(1.dp, DtaTheme.colors.line),
        modifier = Modifier.fillMaxWidth().clickable(onClick = onEdit)
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(70.dp)
                        .clip(DtaTheme.shapes.Card)
                        .background(DtaTheme.colors.surfaceAlt)
                ) {
                    AsyncImage(
                        model = product.imageUrl,
                        contentDescription = product.name,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize()
                    )
                }

                Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                    Text(
                        text = product.name,
                        style = DtaTheme.typography.TitleSmall.copy(fontWeight = FontWeight.Bold)
                    )
                    Text(
                        text = "Category: ${product.category}",
                        style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.inkSecondary)
                    )
                    Text(
                        text = "Stock: ${product.stockCount} units",
                        style = DtaTheme.typography.BodySmall.copy(
                            color = if (product.inStock) DtaTheme.colors.semanticSuccess else DtaTheme.colors.semanticError,
                            fontWeight = FontWeight.SemiBold
                        )
                    )
                }

                Switch(
                    checked = product.inStock,
                    onCheckedChange = { onToggleStock() },
                    colors = SwitchDefaults.colors(checkedThumbColor = Color.White, checkedTrackColor = DtaTheme.colors.primary)
                )
            }

            Divider(color = DtaTheme.colors.line)

            // Pricing & Margin Preview (Point 59)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Partner Cost: ${product.formattedPartnerPrice}",
                        style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.inkSecondary)
                    )
                    Text(
                        text = "Retail: ${product.formattedRetailPrice}",
                        style = DtaTheme.typography.BodySmall.copy(fontWeight = FontWeight.Bold)
                    )
                }

                Box(
                    modifier = Modifier
                        .clip(DtaTheme.shapes.Chip)
                        .background(DtaTheme.colors.primaryContainer)
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = "Margin: ${product.formattedGrossMargin} (${product.marginPercent}%)",
                        style = DtaTheme.typography.Label.copy(
                            color = DtaTheme.colors.primary,
                            fontWeight = FontWeight.Bold
                        )
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ProductFormBottomSheet(
    initialProduct: PartnerProduct,
    isNew: Boolean,
    onDismiss: () -> Unit,
    onSave: (PartnerProduct) -> Unit
) {
    var name by remember { mutableStateOf(initialProduct.name) }
    var category by remember { mutableStateOf(initialProduct.category) }
    var retailPriceInput by remember { mutableStateOf(initialProduct.retailPrice.toInt().toString()) }
    var partnerPriceInput by remember { mutableStateOf(initialProduct.partnerPrice.toInt().toString()) }
    var stockCountInput by remember { mutableStateOf(initialProduct.stockCount.toString()) }
    var imageUrl by remember { mutableStateOf(initialProduct.imageUrl) }

    val retailPrice = retailPriceInput.toDoubleOrNull() ?: 0.0
    val partnerPrice = partnerPriceInput.toDoubleOrNull() ?: 0.0
    val stockCount = stockCountInput.toIntOrNull() ?: 0
    val margin = (retailPrice - partnerPrice).coerceAtLeast(0.0)

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = DtaTheme.colors.surface
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text(
                text = if (isNew) "Add New Catalog Product" else "Edit Product",
                style = DtaTheme.typography.TitleLarge.copy(fontWeight = FontWeight.Bold)
            )

            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text("Product Title *") },
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = category,
                onValueChange = { category = it },
                label = { Text("Category *") },
                modifier = Modifier.fillMaxWidth()
            )

            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedTextField(
                    value = retailPriceInput,
                    onValueChange = { retailPriceInput = it },
                    label = { Text("Retail Price (PKR) *") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.weight(1f)
                )
                OutlinedTextField(
                    value = partnerPriceInput,
                    onValueChange = { partnerPriceInput = it },
                    label = { Text("Wholesale Cost (PKR) *") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.weight(1f)
                )
            }

            // Margin Preview Pill (Point 59)
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(DtaTheme.shapes.Card)
                    .background(DtaTheme.colors.surfaceAlt)
                    .padding(10.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Guaranteed Partner Margin:", style = DtaTheme.typography.BodySmall)
                    Text("PKR ${margin.toInt()}", style = DtaTheme.typography.TitleSmall.copy(fontWeight = FontWeight.Bold, color = DtaTheme.colors.primary))
                }
            }

            OutlinedTextField(
                value = stockCountInput,
                onValueChange = { stockCountInput = it },
                label = { Text("Stock Units Count *") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                modifier = Modifier.fillMaxWidth()
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedButton(
                    onClick = onDismiss,
                    shape = DtaTheme.shapes.Button,
                    modifier = Modifier.weight(1f).height(48.dp)
                ) {
                    Text("Cancel")
                }

                Button(
                    onClick = {
                        val updated = initialProduct.copy(
                            name = name,
                            category = category,
                            retailPrice = retailPrice,
                            partnerPrice = partnerPrice,
                            suggestedSellingPrice = retailPrice,
                            stockCount = stockCount,
                            imageUrl = imageUrl.ifBlank { "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80" },
                            inStock = stockCount > 0
                        )
                        onSave(updated)
                    },
                    shape = DtaTheme.shapes.Button,
                    colors = ButtonDefaults.buttonColors(containerColor = DtaTheme.colors.primary),
                    modifier = Modifier.weight(1f).height(48.dp)
                ) {
                    Text("Save Product")
                }
            }

            Spacer(modifier = Modifier.height(10.dp))
        }
    }
}
