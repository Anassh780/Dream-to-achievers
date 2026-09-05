package com.dreamtoachievers.app.core.data

import com.dreamtoachievers.app.core.firebase.FirebaseCategoryDataSource
import com.dreamtoachievers.app.core.model.Category
import kotlinx.coroutines.flow.Flow

class CategoryRepository(
    private val dataSource: FirebaseCategoryDataSource = FirebaseCategoryDataSource()
) {
    fun getCategories(): Flow<List<Category>> = dataSource.observeCategories()
}
