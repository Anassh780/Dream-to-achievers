package com.dreamtoachievers.app.core.designsystem.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.outlined.Mic
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material.icons.outlined.Tune
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import com.dreamtoachievers.app.core.designsystem.theme.DtaTheme

@Composable
fun DtaSearchBar(
    query: String,
    onQueryChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    placeholder: String = "Search products, brands & categories",
    readOnly: Boolean = false,
    onClick: () -> Unit = {},
    onFilterClick: (() -> Unit)? = null,
    onSearch: (String) -> Unit = {}
) {
    val focusManager = LocalFocusManager.current

    Row(
        modifier = modifier
            .fillMaxWidth()
            .height(52.dp)
            .clip(DtaTheme.shapes.Input)
            .background(DtaTheme.colors.surface)
            .border(1.dp, DtaTheme.colors.line, DtaTheme.shapes.Input)
            .then(
                if (readOnly) Modifier.clickable(onClick = onClick)
                else Modifier
            )
            .padding(horizontal = DtaTheme.spacing.md),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = Icons.Outlined.Search,
            contentDescription = "Search",
            tint = DtaTheme.colors.primary,
            modifier = Modifier.size(22.dp)
        )

        Spacer(modifier = Modifier.width(DtaTheme.spacing.sm))

        Box(
            modifier = Modifier.weight(1f),
            contentAlignment = Alignment.CenterStart
        ) {
            if (query.isEmpty()) {
                Text(
                    text = placeholder,
                    style = DtaTheme.typography.Body.copy(
                        color = DtaTheme.colors.inkMuted
                    )
                )
            }

            if (!readOnly) {
                BasicTextField(
                    value = query,
                    onValueChange = onQueryChange,
                    singleLine = true,
                    textStyle = DtaTheme.typography.Body.copy(
                        color = DtaTheme.colors.inkPrimary
                    ),
                    cursorBrush = SolidColor(DtaTheme.colors.primary),
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                    keyboardActions = KeyboardActions(
                        onSearch = {
                            focusManager.clearFocus()
                            onSearch(query)
                        }
                    ),
                    modifier = Modifier.fillMaxWidth()
                )
            }
        }

        if (query.isNotEmpty() && !readOnly) {
            IconButton(
                onClick = { onQueryChange("") },
                modifier = Modifier.size(28.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Clear,
                    contentDescription = "Clear",
                    tint = DtaTheme.colors.inkMuted,
                    modifier = Modifier.size(18.dp)
                )
            }
        } else if (onFilterClick == null) {
            Icon(
                imageVector = androidx.compose.material.icons.Icons.Outlined.Mic,
                contentDescription = "Voice search",
                tint = DtaTheme.colors.inkMuted,
                modifier = Modifier.size(20.dp)
            )
        }

        if (onFilterClick != null) {
            Box(
                modifier = Modifier
                    .padding(start = 6.dp)
                    .size(34.dp)
                    .clip(DtaTheme.shapes.Small)
                    .background(DtaTheme.colors.surfaceAlt)
                    .clickable(onClick = onFilterClick),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Outlined.Tune,
                    contentDescription = "Filter",
                    tint = DtaTheme.colors.primary,
                    modifier = Modifier.size(18.dp)
                )
            }
        }
    }
}
