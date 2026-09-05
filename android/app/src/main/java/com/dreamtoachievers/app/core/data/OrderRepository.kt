package com.dreamtoachievers.app.core.data

import android.net.Uri
import com.dreamtoachievers.app.core.firebase.FirebaseOrderDataSource
import com.dreamtoachievers.app.core.model.Order
import kotlinx.coroutines.flow.Flow

class OrderRepository(
    private val dataSource: FirebaseOrderDataSource = FirebaseOrderDataSource()
) {

    fun getUserOrders(userId: String): Flow<List<Order>> = dataSource.observeUserOrders(userId)

    suspend fun getOrderById(orderId: String): Order? = dataSource.getOrderById(orderId)

    suspend fun uploadReceipt(orderId: String, imageUri: Uri): String =
        dataSource.uploadPaymentReceipt(orderId, imageUri)

    suspend fun submitOrder(order: Order): Result<Order> = dataSource.submitOrder(order)
}
