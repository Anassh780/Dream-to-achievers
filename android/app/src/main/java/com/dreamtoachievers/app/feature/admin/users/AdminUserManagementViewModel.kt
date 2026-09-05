package com.dreamtoachievers.app.feature.admin.users

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.dreamtoachievers.app.core.data.AdminRepository
import com.dreamtoachievers.app.core.model.User
import com.dreamtoachievers.app.core.model.UserRole
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class AdminUserManagementUiState(
    val users: List<User> = emptyList(),
    val filteredUsers: List<User> = emptyList(),
    val searchQuery: String = "",
    val selectedRoleFilter: String = "All"
)

class AdminUserManagementViewModel(
    private val adminRepository: AdminRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(AdminUserManagementUiState())
    val uiState: StateFlow<AdminUserManagementUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            adminRepository.platformUsers.collect { users ->
                _uiState.value = _uiState.value.copy(
                    users = users,
                    filteredUsers = filter(users, _uiState.value.searchQuery, _uiState.value.selectedRoleFilter)
                )
            }
        }
    }

    fun onSearchQueryChanged(query: String) {
        _uiState.value = _uiState.value.copy(
            searchQuery = query,
            filteredUsers = filter(_uiState.value.users, query, _uiState.value.selectedRoleFilter)
        )
    }

    fun onRoleFilterSelected(filterRole: String) {
        _uiState.value = _uiState.value.copy(
            selectedRoleFilter = filterRole,
            filteredUsers = filter(_uiState.value.users, _uiState.value.searchQuery, filterRole)
        )
    }

    fun updateUserRole(userId: String, newRole: UserRole) {
        adminRepository.updateUserRole(userId, newRole)
    }

    fun toggleUserActive(userId: String) {
        adminRepository.toggleUserActive(userId)
    }

    private fun filter(users: List<User>, query: String, roleFilter: String): List<User> {
        return users.filter { user ->
            val matchesRole = roleFilter == "All" || user.role.name.equals(roleFilter, ignoreCase = true)
            val matchesQuery = query.isBlank() ||
                    user.fullName.contains(query, ignoreCase = true) ||
                    user.email.contains(query, ignoreCase = true) ||
                    (user.phone?.contains(query, ignoreCase = true) == true)
            matchesRole && matchesQuery
        }
    }
}
