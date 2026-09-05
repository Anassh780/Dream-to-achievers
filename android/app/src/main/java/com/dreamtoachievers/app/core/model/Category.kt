package com.dreamtoachievers.app.core.model

import kotlinx.serialization.Serializable

@Serializable
data class Category(
    val id: String = "",
    val name: String = "",
    val slug: String = "",
    val description: String = "",
    val icon: String = "Sparkle",
    val bannerUrl: String? = null,
    val thumbnailUrl: String? = null,
    val featured: Boolean = false,
    val sortOrder: Int = 0,
    val status: String = "active",
    val parentId: String? = null,
    val depth: Int = 0, // 0 = Root, 1 = Sub, 2 = Leaf
    val childIds: List<String> = emptyList(),
    val productCount: Int = 0
)

data class CategoryNode(
    val category: Category,
    val children: List<CategoryNode> = emptyList(),
    val isExpanded: Boolean = false
)
