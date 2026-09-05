package com.dreamtoachievers.app.feature.admin.categories

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dreamtoachievers.app.core.data.AdminRepository
import com.dreamtoachievers.app.core.designsystem.components.*
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme
import com.dreamtoachievers.app.core.model.Category
import com.dreamtoachievers.app.core.model.CategoryNode

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminCategoryManagementScreen(
    adminRepository: AdminRepository,
    onNavigateBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val categories by adminRepository.categories.collectAsState()
    val categoryTree = remember(categories) { adminRepository.getCategoryTree() }

    var expandedNodeIds by remember { mutableStateOf(setOf("cat-root-1", "cat-sub-1")) }
    var showAddCategorySheet by remember { mutableStateOf(false) }

    if (showAddCategorySheet) {
        AddCategoryBottomSheet(
            availableParents = categories.filter { it.depth < 2 },
            onDismiss = { showAddCategorySheet = false },
            onSave = { newCat ->
                adminRepository.saveCategory(newCat)
                showAddCategorySheet = false
            }
        )
    }

    Scaffold(
        topBar = {
            DtaTopAppBar(
                title = "Category Hierarchy",
                subtitle = "Three-level catalog tree (Root → Sub → Leaf)",
                navigationIcon = Icons.Default.ArrowBack,
                onNavigationClick = onNavigateBack
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showAddCategorySheet = true },
                containerColor = DtaTheme.colors.primary,
                contentColor = Color.White
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add Category")
            }
        },
        containerColor = DtaTheme.colors.background,
        modifier = modifier.fillMaxSize()
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            item {
                Text(
                    text = "CATALOG HIERARCHY TREE (DEPTH 0 TO 2)",
                    style = DtaTheme.typography.Label.copy(
                        color = DtaTheme.colors.inkSecondary,
                        fontSize = 11.sp,
                        letterSpacing = 1.sp
                    )
                )
            }

            items(categoryTree) { rootNode ->
                val isExpanded = expandedNodeIds.contains(rootNode.category.id)
                CategoryTreeItem(
                    node = rootNode,
                    isExpanded = isExpanded,
                    onToggleExpand = {
                        expandedNodeIds = if (isExpanded) {
                            expandedNodeIds - rootNode.category.id
                        } else {
                            expandedNodeIds + rootNode.category.id
                        }
                    },
                    expandedNodeIds = expandedNodeIds,
                    onToggleChildExpand = { childId ->
                        expandedNodeIds = if (expandedNodeIds.contains(childId)) {
                            expandedNodeIds - childId
                        } else {
                            expandedNodeIds + childId
                        }
                    }
                )
            }
        }
    }
}

@Composable
private fun CategoryTreeItem(
    node: CategoryNode,
    isExpanded: Boolean,
    onToggleExpand: () -> Unit,
    expandedNodeIds: Set<String>,
    onToggleChildExpand: (String) -> Unit
) {
    Card(
        shape = DtaTheme.shapes.Card,
        colors = CardDefaults.cardColors(containerColor = DtaTheme.colors.surface),
        border = androidx.compose.foundation.BorderStroke(1.dp, DtaTheme.colors.line),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            // Root Level 0
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable(onClick = onToggleExpand)
                    .padding(vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Icon(
                    imageVector = if (isExpanded) Icons.Default.FolderOpen else Icons.Default.Folder,
                    contentDescription = null,
                    tint = DtaTheme.colors.primary
                )

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = node.category.name,
                        style = DtaTheme.typography.TitleSmall.copy(fontWeight = FontWeight.Bold)
                    )
                    Text(
                        text = "Root Level 0 • ${node.children.size} Subcategories",
                        style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.inkSecondary, fontSize = 11.sp)
                    )
                }

                Icon(
                    imageVector = if (isExpanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                    contentDescription = null,
                    tint = DtaTheme.colors.inkSecondary
                )
            }

            // Sub Level 1 (if root expanded)
            if (isExpanded) {
                Divider(color = DtaTheme.colors.line, modifier = Modifier.padding(vertical = 8.dp))

                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(start = 24.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    node.children.forEach { subNode ->
                        val isSubExpanded = expandedNodeIds.contains(subNode.category.id)

                        Column {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable { onToggleChildExpand(subNode.category.id) }
                                    .padding(vertical = 4.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Icon(
                                    imageVector = if (isSubExpanded) Icons.Default.ArrowDropDown else Icons.Default.ArrowRight,
                                    contentDescription = null,
                                    tint = DtaTheme.colors.accent
                                )

                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = subNode.category.name,
                                        style = DtaTheme.typography.BodyMedium.copy(fontWeight = FontWeight.SemiBold)
                                    )
                                    Text(
                                        text = "Sub Level 1 • ${subNode.children.size} Leaves",
                                        style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.inkSecondary, fontSize = 10.sp)
                                    )
                                }
                            }

                            // Leaf Level 2 (if sub expanded)
                            if (isSubExpanded) {
                                Column(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(start = 28.dp, top = 4.dp),
                                    verticalArrangement = Arrangement.spacedBy(4.dp)
                                ) {
                                    subNode.children.forEach { leafNode ->
                                        Row(
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                                        ) {
                                            Box(
                                                modifier = Modifier
                                                    .size(6.dp)
                                                    .clip(androidx.compose.foundation.shape.CircleShape)
                                                    .background(DtaTheme.colors.primary)
                                            )
                                            Text(
                                                text = "${leafNode.category.name} (Leaf Level 2)",
                                                style = DtaTheme.typography.BodySmall.copy(color = DtaTheme.colors.ink)
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun AddCategoryBottomSheet(
    availableParents: List<Category>,
    onDismiss: () -> Unit,
    onSave: (Category) -> Unit
) {
    var name by remember { mutableStateOf("") }
    var selectedParentId by remember { mutableStateOf<String?>(null) }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = DtaTheme.colors.surface
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            Text(
                text = "Add Category Node",
                style = DtaTheme.typography.TitleLarge.copy(fontWeight = FontWeight.Bold)
            )

            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text("Category Name *") },
                modifier = Modifier.fillMaxWidth()
            )

            Text("Parent Category (Leave empty for Level 0 Root):", style = DtaTheme.typography.Label.copy(fontWeight = FontWeight.SemiBold))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Box(
                    modifier = Modifier
                        .clip(DtaTheme.shapes.Chip)
                        .background(if (selectedParentId == null) DtaTheme.colors.primary else DtaTheme.colors.surfaceAlt)
                        .clickable { selectedParentId = null }
                        .padding(horizontal = 10.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = "None (Root)",
                        style = DtaTheme.typography.Label.copy(
                            color = if (selectedParentId == null) Color.White else DtaTheme.colors.ink
                        )
                    )
                }

                availableParents.forEach { parent ->
                    val isSelected = selectedParentId == parent.id
                    Box(
                        modifier = Modifier
                            .clip(DtaTheme.shapes.Chip)
                            .background(if (isSelected) DtaTheme.colors.primary else DtaTheme.colors.surfaceAlt)
                            .clickable { selectedParentId = parent.id }
                            .padding(horizontal = 10.dp, vertical = 6.dp)
                    ) {
                        Text(
                            text = parent.name,
                            style = DtaTheme.typography.Label.copy(
                                color = if (isSelected) Color.White else DtaTheme.colors.ink
                            )
                        )
                    }
                }
            }

            val depth = if (selectedParentId == null) 0 else {
                val p = availableParents.firstOrNull { it.id == selectedParentId }
                (p?.depth ?: 0) + 1
            }

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
                        if (name.isNotBlank()) {
                            val newCat = Category(
                                id = "cat-${System.currentTimeMillis() % 10000}",
                                name = name,
                                slug = name.lowercase().replace(" ", "-"),
                                parentId = selectedParentId,
                                depth = depth.coerceIn(0, 2)
                            )
                            onSave(newCat)
                        }
                    },
                    shape = DtaTheme.shapes.Button,
                    colors = ButtonDefaults.buttonColors(containerColor = DtaTheme.colors.primary),
                    modifier = Modifier.weight(1f).height(48.dp)
                ) {
                    Text("Create Node")
                }
            }

            Spacer(modifier = Modifier.height(10.dp))
        }
    }
}
