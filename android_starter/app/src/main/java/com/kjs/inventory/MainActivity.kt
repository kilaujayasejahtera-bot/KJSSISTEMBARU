package com.kjs.inventory

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.kjs.inventory.data.*
import com.kjs.inventory.ui.theme.*
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            KjsInventoryTheme {
                KjsApp()
            }
        }
    }
}

@Composable
fun KjsApp() {
    var userSession by remember { mutableStateOf<UserSession?>(null) }

    if (userSession == null) {
        LoginScreen(onLoginSuccess = { session -> userSession = session })
    } else {
        MainScreen(session = userSession!!, onLogout = { userSession = null })
    }
}

@Composable
fun LoginScreen(onLoginSuccess: (UserSession) -> Unit) {
    var username by remember { mutableStateOf("admin") }
    var password by remember { mutableStateOf("admin123") }
    var showPassword by remember { mutableStateOf(false) }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    val coroutineScope = rememberCoroutineScope()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Pale)
            .padding(20.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .widthIn(max = 440.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Box(
                modifier = Modifier
                    .size(74.dp)
                    .background(Navy, RoundedCornerShape(22.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Inventory2,
                    contentDescription = "Logo",
                    tint = Color.White,
                    modifier = Modifier.size(38.dp)
                )
            }
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "KJS INVENTORY",
                fontSize = 24.sp,
                fontWeight = FontWeight.Black,
                color = Navy,
                letterSpacing = 1.sp
            )
            Text(
                text = "PT Kilau Jaya Sejahtera",
                fontSize = 13.sp,
                color = Muted
            )
            Spacer(modifier = Modifier.height(28.dp))

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(24.dp)
                ) {
                    Text(
                        text = "Masuk ke Akun",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = Ink
                    )
                    Text(
                        text = "Gunakan username dan password sheet USERS.",
                        fontSize = 12.sp,
                        color = Muted
                    )
                    Spacer(modifier = Modifier.height(20.dp))

                    OutlinedTextField(
                        value = username,
                        onValueChange = {
                            username = it
                            errorMessage = null
                        },
                        modifier = Modifier.fillMaxWidth(),
                        label = { Text("Username") },
                        singleLine = true,
                        leadingIcon = {
                            Icon(Icons.Default.Person, contentDescription = null, tint = Blue)
                        },
                        shape = RoundedCornerShape(14.dp)
                    )
                    Spacer(modifier = Modifier.height(14.dp))

                    OutlinedTextField(
                        value = password,
                        onValueChange = {
                            password = it
                            errorMessage = null
                        },
                        modifier = Modifier.fillMaxWidth(),
                        label = { Text("Password") },
                        singleLine = true,
                        visualTransformation = if (showPassword) VisualTransformation.None else PasswordVisualTransformation(),
                        leadingIcon = {
                            Icon(Icons.Default.Lock, contentDescription = null, tint = Blue)
                        },
                        trailingIcon = {
                            IconButton(onClick = { showPassword = !showPassword }) {
                                Icon(
                                    imageVector = if (showPassword) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                    contentDescription = "Toggle password"
                                )
                            }
                        },
                        shape = RoundedCornerShape(14.dp)
                    )

                    if (errorMessage != null) {
                        Spacer(modifier = Modifier.height(12.dp))
                        Surface(
                            color = RoseLight,
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = errorMessage!!,
                                color = Rose,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                modifier = Modifier.padding(10.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    Button(
                        onClick = {
                            if (username.isBlank() || password.isBlank()) {
                                errorMessage = "Mohon isi username dan password."
                                return@Button
                            }
                            isLoading = true
                            errorMessage = null
                            coroutineScope.launch {
                                val result = KjsApi.login(username.trim(), password)
                                isLoading = false
                                result.onSuccess { session ->
                                    onLoginSuccess(session)
                                }.onFailure { err ->
                                    errorMessage = "Google Sheets: ${err.message}"
                                }
                            }
                        },
                        enabled = !isLoading,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp),
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Blue)
                    ) {
                        if (isLoading) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(20.dp),
                                color = Color.White,
                                strokeWidth = 2.dp
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Text("MEMERIKSA GOOGLE SHEETS...")
                        } else {
                            Text("MASUK KE GOOGLE SHEETS", fontWeight = FontWeight.Bold)
                            Spacer(modifier = Modifier.width(8.dp))
                            Icon(Icons.Default.ArrowForward, contentDescription = null)
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Secondary button: Mode Percobaan / Offline
                    OutlinedButton(
                        onClick = {
                            onLoginSuccess(
                                UserSession(
                                    token = "demo_offline_token",
                                    username = username.ifBlank { "demo_admin" },
                                    nama = "Administrator KJS (Demo)",
                                    role = "Admin"
                                )
                            )
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(44.dp),
                        shape = RoundedCornerShape(14.dp)
                    ) {
                        Icon(Icons.Default.PlayArrow, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Masuk Mode Percobaan / Demo", fontSize = 12.sp)
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    TextButton(
                        onClick = {
                            isLoading = true
                            errorMessage = null
                            coroutineScope.launch {
                                val res = KjsApi.testConnection()
                                isLoading = false
                                res.onSuccess { msg ->
                                    errorMessage = "Status: $msg"
                                }.onFailure { err ->
                                    errorMessage = err.message
                                }
                            }
                        },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(Icons.Default.CloudSync, contentDescription = null, modifier = Modifier.size(16.dp), tint = Blue)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Tes Koneksi ke Google Apps Script", fontSize = 12.sp, color = Blue, fontWeight = FontWeight.SemiBold)
                    }
                }
            }
        }
    }
}

@Composable
fun MainScreen(session: UserSession, onLogout: () -> Unit) {
    var selectedTab by remember { mutableStateOf("Beranda") }
    var stockCardCategory by remember { mutableStateOf("BAHAN BAKU") }
    var stockInInitialCategory by remember { mutableStateOf("BAHAN BAKU") }

    val navItems = listOf(
        "Beranda" to Icons.Default.Home,
        "Stok Masuk" to Icons.Default.AddBox,
        "Kartu Stok" to Icons.Default.Inventory2,
        "Riwayat" to Icons.Default.History,
        "Akun" to Icons.Default.Person
    )

    Scaffold(
        containerColor = Pale,
        bottomBar = {
            NavigationBar(
                containerColor = Color.White,
                tonalElevation = 8.dp
            ) {
                navItems.forEach { (label, icon) ->
                    val isSelected = selectedTab == label
                    NavigationBarItem(
                        selected = isSelected,
                        onClick = { selectedTab = label },
                        icon = {
                            Icon(
                                imageVector = icon,
                                contentDescription = label,
                                tint = if (isSelected) Blue else Muted
                            )
                        },
                        label = {
                            Text(
                                text = label,
                                fontSize = 10.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                color = if (isSelected) Blue else Muted
                            )
                        },
                        colors = NavigationBarItemDefaults.colors(
                            indicatorColor = BlueLight
                        )
                    )
                }
            }
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            when (selectedTab) {
                "Beranda" -> HomeDashboardScreen(
                    session = session,
                    onNavigateToStockIn = { cat ->
                        stockInInitialCategory = cat
                        selectedTab = "Stok Masuk"
                    },
                    onNavigateToStockCard = { cat ->
                        stockCardCategory = cat
                        selectedTab = "Kartu Stok"
                    },
                    onNavigateToHistory = { selectedTab = "Riwayat" }
                )
                "Stok Masuk" -> StockInScreen(
                    session = session,
                    initialCategory = stockInInitialCategory
                )
                "Kartu Stok" -> StockCardScreen(
                    session = session,
                    initialCategory = stockCardCategory
                )
                "Riwayat" -> HistoryScreen(session = session)
                "Akun" -> AccountScreen(
                    session = session,
                    onLogout = onLogout
                )
            }
        }
    }
}

@Composable
fun HomeDashboardScreen(
    session: UserSession,
    onNavigateToStockIn: (String) -> Unit,
    onNavigateToStockCard: (String) -> Unit,
    onNavigateToHistory: () -> Unit
) {
    var summary by remember { mutableStateOf(DashboardSummary()) }
    var isRefreshing by remember { mutableStateOf(false) }
    var activeSubView by remember { mutableStateOf<String?>(null) } // "bahan", "produk", "supplier"
    val coroutineScope = rememberCoroutineScope()

    fun refreshData() {
        coroutineScope.launch {
            isRefreshing = true
            val res = KjsApi.fetchDashboard(session.token)
            res.onSuccess { summary = it }
            isRefreshing = false
        }
    }

    LaunchedEffect(Unit) {
        refreshData()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(18.dp)
    ) {
        // Top Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column {
                Text(
                    text = "KJS INVENTORY",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = Blue,
                    letterSpacing = 1.2.sp
                )
                Text(
                    text = "Halo, ${session.nama}",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Navy
                )
                Text(
                    text = "Akses: ${session.role}",
                    fontSize = 12.sp,
                    color = Muted
                )
            }
            IconButton(
                onClick = { refreshData() },
                modifier = Modifier
                    .background(Color.White, RoundedCornerShape(14.dp))
                    .size(44.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Refresh,
                    contentDescription = "Refresh",
                    tint = Navy
                )
            }
        }

        Spacer(modifier = Modifier.height(18.dp))

        // Hero Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(22.dp),
            colors = CardDefaults.cardColors(containerColor = Navy)
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Text(
                    text = "PT KILAU JAYA SEJAHTERA",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White.copy(alpha = 0.7f),
                    letterSpacing = 1.sp
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Sistem Pengendalian Stok\n& Penerimaan Bahan Baku",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                    lineHeight = 26.sp
                )
                Spacer(modifier = Modifier.height(12.dp))
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Surface(
                        color = Color.White.copy(alpha = 0.15f),
                        shape = RoundedCornerShape(20.dp)
                    ) {
                        Text(
                            text = if (session.token.startsWith("demo")) "Simulasi Aktif" else "Apps Script Live",
                            color = Emerald,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                        )
                    }
                    if (summary.updatedAt.isNotBlank()) {
                        Text(
                            text = summary.updatedAt,
                            color = Color.White.copy(alpha = 0.6f),
                            fontSize = 10.sp
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        Text(
            text = "Pusat Data Persediaan (Klik untuk Akses)",
            fontSize = 15.sp,
            fontWeight = FontWeight.Bold,
            color = Ink
        )
        Spacer(modifier = Modifier.height(10.dp))

        // 3 KPI Cards: Bahan Aktif, Produk Aktif, Supplier Aktif
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            KpiClickableCard(
                title = "Bahan Aktif",
                count = "${summary.totalBahan}",
                unit = "Bahan Baku & Kemas",
                icon = Icons.Default.Science,
                iconTint = Blue,
                modifier = Modifier.weight(1f),
                onClick = { activeSubView = "bahan" }
            )
            KpiClickableCard(
                title = "Produk Aktif",
                count = "${summary.totalProduk}",
                unit = "Produk Jadi",
                icon = Icons.Default.Inventory2,
                iconTint = Emerald,
                modifier = Modifier.weight(1f),
                onClick = { activeSubView = "produk" }
            )
            KpiClickableCard(
                title = "Supplier Aktif",
                count = "${summary.totalSupplier}",
                unit = "Mitra KJS",
                icon = Icons.Default.LocalShipping,
                iconTint = Amber,
                modifier = Modifier.weight(1f),
                onClick = { activeSubView = "supplier" }
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            KpiClickableCard(
                title = "Stok Menipis",
                count = "${summary.stokMenipis}",
                unit = "Perlu Restock",
                icon = Icons.Default.Warning,
                iconTint = Rose,
                modifier = Modifier.weight(1f),
                onClick = { onNavigateToStockCard("BAHAN BAKU") }
            )
            KpiClickableCard(
                title = "Transaksi Hari Ini",
                count = "${summary.transaksiHariIni}",
                unit = "Mutasi Masuk & Produksi",
                icon = Icons.Default.ReceiptLong,
                iconTint = Navy,
                modifier = Modifier.weight(1f),
                onClick = onNavigateToHistory
            )
        }

        Spacer(modifier = Modifier.height(22.dp))

        // Quick Actions
        Text(
            text = "Akses Cepat",
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold,
            color = Ink
        )
        Spacer(modifier = Modifier.height(10.dp))

        QuickActionRow(
            icon = Icons.Default.AddBox,
            iconTint = Blue,
            title = "Input Stok Masuk Bahan Baku",
            subtitle = "Catat penerimaan bahan baku formula",
            onClick = { onNavigateToStockIn("BAHAN BAKU") }
        )
        Spacer(modifier = Modifier.height(8.dp))
        QuickActionRow(
            icon = Icons.Default.Archive,
            iconTint = Emerald,
            title = "Input Stok Masuk Bahan Pengemas / Kemasan",
            subtitle = "Catat botol, pump, kardus, label stiker",
            onClick = { onNavigateToStockIn("BAHAN PENGEMAS") }
        )
        Spacer(modifier = Modifier.height(8.dp))
        QuickActionRow(
            icon = Icons.Default.ListAlt,
            iconTint = Amber,
            title = "Buka Kartu Stok Persediaan",
            subtitle = "Pantau saldo bahan & riwayat edit transaksi",
            onClick = { onNavigateToStockCard("BAHAN BAKU") }
        )
    }

    // Modal view for Bahan Aktif, Produk Aktif, Supplier Aktif
    activeSubView?.let { viewType ->
        DataListModal(
            viewType = viewType,
            session = session,
            onDismiss = { activeSubView = null },
            onSelectStockIn = { cat ->
                activeSubView = null
                onNavigateToStockIn(cat)
            }
        )
    }
}

@Composable
fun KpiClickableCard(
    title: String,
    count: String,
    unit: String,
    icon: ImageVector,
    iconTint: Color,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Card(
        modifier = modifier.clickable { onClick() },
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Box(
                modifier = Modifier
                    .size(34.dp)
                    .background(iconTint.copy(alpha = 0.12f), RoundedCornerShape(10.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = iconTint,
                    modifier = Modifier.size(18.dp)
                )
            }
            Spacer(modifier = Modifier.height(10.dp))
            Text(
                text = count,
                fontSize = 22.sp,
                fontWeight = FontWeight.Black,
                color = Navy
            )
            Text(
                text = title,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = Ink
            )
            Text(
                text = unit,
                fontSize = 10.sp,
                color = Muted
            )
        }
    }
}

@Composable
fun QuickActionRow(
    icon: ImageVector,
    iconTint: Color,
    title: String,
    subtitle: String,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(42.dp)
                    .background(iconTint.copy(alpha = 0.12f), RoundedCornerShape(12.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = iconTint,
                    modifier = Modifier.size(22.dp)
                )
            }
            Spacer(modifier = Modifier.width(14.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = Ink
                )
                Text(
                    text = subtitle,
                    fontSize = 11.sp,
                    color = Muted
                )
            }
            Icon(
                imageVector = Icons.Default.ChevronRight,
                contentDescription = null,
                tint = Muted
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StockInScreen(session: UserSession, initialCategory: String = "BAHAN BAKU") {
    var selectedCategory by remember { mutableStateOf(initialCategory) }
    var materials by remember { mutableStateOf<List<MasterMaterial>>(emptyList()) }
    var suppliers by remember { mutableStateOf<List<MasterSupplier>>(emptyList()) }
    var selectedMaterial by remember { mutableStateOf<MasterMaterial?>(null) }
    var selectedSupplier by remember { mutableStateOf<MasterSupplier?>(null) }

    var jumlahText by remember { mutableStateOf("") }
    var batchText by remember { mutableStateOf("BCH-${System.currentTimeMillis() % 10000}") }
    val today = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
    var tanggalText by remember { mutableStateOf(today) }
    var tglKadaluarsa by remember { mutableStateOf("2026-12-31") }
    var hargaBeliText by remember { mutableStateOf("50000") }
    var ongkirText by remember { mutableStateOf("0") }
    var statusQC by remember { mutableStateOf("LOLOS") }
    var catatanQCText by remember { mutableStateOf("Lulus uji visual & kelayakan") }

    var materialMenuExpanded by remember { mutableStateOf(false) }
    var supplierMenuExpanded by remember { mutableStateOf(false) }

    var isSaving by remember { mutableStateOf(false) }
    var dialogResult by remember { mutableStateOf<Pair<Boolean, String>?>(null) }
    val coroutineScope = rememberCoroutineScope()

    // Reload master materials when selected category changes
    LaunchedEffect(selectedCategory) {
        val matRes = KjsApi.fetchMasterMaterials(session.token, selectedCategory)
        matRes.onSuccess {
            materials = it
            if (materials.isNotEmpty()) selectedMaterial = materials[0]
        }
    }

    LaunchedEffect(Unit) {
        val supRes = KjsApi.fetchMasterSuppliers(session.token)
        supRes.onSuccess {
            suppliers = it
            if (suppliers.isNotEmpty()) selectedSupplier = suppliers[0]
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(18.dp)
    ) {
        Text(
            text = "Input Stok Masuk",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = Navy
        )
        Text(
            text = "Catat penerimaan Bahan Baku atau Bahan Pengemas ke sistem KJS.",
            fontSize = 12.sp,
            color = Muted
        )
        Spacer(modifier = Modifier.height(14.dp))

        // Category Switcher: Bahan Baku vs Bahan Pengemas
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            FilterChip(
                selected = selectedCategory == "BAHAN BAKU",
                onClick = { selectedCategory = "BAHAN BAKU" },
                label = { Text("Bahan Baku (Formula)") },
                leadingIcon = { Icon(Icons.Default.Science, contentDescription = null, modifier = Modifier.size(16.dp)) },
                modifier = Modifier.weight(1f)
            )
            FilterChip(
                selected = selectedCategory == "BAHAN PENGEMAS",
                onClick = { selectedCategory = "BAHAN PENGEMAS" },
                label = { Text("Bahan Pengemas") },
                leadingIcon = { Icon(Icons.Default.Archive, contentDescription = null, modifier = Modifier.size(16.dp)) },
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(modifier = Modifier.height(14.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                // Tanggal Masuk
                Text("Tanggal Penerimaan", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Ink)
                Spacer(modifier = Modifier.height(4.dp))
                OutlinedTextField(
                    value = tanggalText,
                    onValueChange = { tanggalText = it },
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(14.dp))

                // Pilih Bahan Sesuai Kategori
                Text(
                    text = if (selectedCategory == "BAHAN BAKU") "Pilih Bahan Baku" else "Pilih Bahan Pengemas (Botol/Kardus/Label)",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Ink
                )
                Spacer(modifier = Modifier.height(4.dp))
                ExposedDropdownMenuBox(
                    expanded = materialMenuExpanded,
                    onExpandedChange = { materialMenuExpanded = !materialMenuExpanded }
                ) {
                    OutlinedTextField(
                        value = selectedMaterial?.let { "${it.kode} - ${it.nama}" } ?: "Pilih Bahan",
                        onValueChange = {},
                        readOnly = true,
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = materialMenuExpanded) },
                        modifier = Modifier
                            .menuAnchor()
                            .fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp)
                    )
                    ExposedDropdownMenu(
                        expanded = materialMenuExpanded,
                        onDismissRequest = { materialMenuExpanded = false }
                    ) {
                        materials.forEach { item ->
                            DropdownMenuItem(
                                text = { Text("${item.kode} - ${item.nama} (${item.satuan})") },
                                onClick = {
                                    selectedMaterial = item
                                    materialMenuExpanded = false
                                }
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Pilih Supplier
                Text("Pilih Supplier / Mitra Pemasok", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Ink)
                Spacer(modifier = Modifier.height(4.dp))
                ExposedDropdownMenuBox(
                    expanded = supplierMenuExpanded,
                    onExpandedChange = { supplierMenuExpanded = !supplierMenuExpanded }
                ) {
                    OutlinedTextField(
                        value = selectedSupplier?.let { "${it.kode} - ${it.nama}" } ?: "Pilih Supplier",
                        onValueChange = {},
                        readOnly = true,
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = supplierMenuExpanded) },
                        modifier = Modifier
                            .menuAnchor()
                            .fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp)
                    )
                    ExposedDropdownMenu(
                        expanded = supplierMenuExpanded,
                        onDismissRequest = { supplierMenuExpanded = false }
                    ) {
                        suppliers.forEach { sup ->
                            DropdownMenuItem(
                                text = { Text("${sup.kode} - ${sup.nama} (${sup.kota})") },
                                onClick = {
                                    selectedSupplier = sup
                                    supplierMenuExpanded = false
                                }
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Jumlah & Satuan
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Column(modifier = Modifier.weight(1.5f)) {
                        Text("Jumlah Masuk", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Ink)
                        Spacer(modifier = Modifier.height(4.dp))
                        OutlinedTextField(
                            value = jumlahText,
                            onValueChange = { jumlahText = it },
                            placeholder = { Text("Contoh: 100") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Satuan", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Ink)
                        Spacer(modifier = Modifier.height(4.dp))
                        OutlinedTextField(
                            value = selectedMaterial?.satuan ?: (if (selectedCategory == "BAHAN BAKU") "kg" else "pcs"),
                            onValueChange = {},
                            readOnly = true,
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // No. Batch & Expired
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Nomor Batch", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Ink)
                        Spacer(modifier = Modifier.height(4.dp))
                        OutlinedTextField(
                            value = batchText,
                            onValueChange = { batchText = it },
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Tgl Kadaluarsa", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Ink)
                        Spacer(modifier = Modifier.height(4.dp))
                        OutlinedTextField(
                            value = tglKadaluarsa,
                            onValueChange = { tglKadaluarsa = it },
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Harga Beli & Ongkir
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Harga Pembelian (Rp)", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Ink)
                        Spacer(modifier = Modifier.height(4.dp))
                        OutlinedTextField(
                            value = hargaBeliText,
                            onValueChange = { hargaBeliText = it },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Ongkos Kirim (Rp)", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Ink)
                        Spacer(modifier = Modifier.height(4.dp))
                        OutlinedTextField(
                            value = ongkirText,
                            onValueChange = { ongkirText = it },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Status QC
                Text("Status QC", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Ink)
                Spacer(modifier = Modifier.height(4.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    listOf("LOLOS", "MENUNGGU", "KARANTINA").forEach { qc ->
                        FilterChip(
                            selected = statusQC == qc,
                            onClick = { statusQC = qc },
                            label = { Text(qc) }
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                Text("Catatan / Keterangan", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Ink)
                Spacer(modifier = Modifier.height(4.dp))
                OutlinedTextField(
                    value = catatanQCText,
                    onValueChange = { catatanQCText = it },
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(24.dp))

                Button(
                    onClick = {
                        val mat = selectedMaterial
                        val sup = selectedSupplier
                        val jml = jumlahText.toDoubleOrNull()
                        if (mat == null) {
                            dialogResult = Pair(false, "Pilih bahan terlebih dahulu.")
                            return@Button
                        }
                        if (sup == null) {
                            dialogResult = Pair(false, "Pilih supplier terlebih dahulu.")
                            return@Button
                        }
                        if (jml == null || jml <= 0) {
                            dialogResult = Pair(false, "Jumlah masuk harus lebih besar dari 0.")
                            return@Button
                        }

                        isSaving = true
                        coroutineScope.launch {
                            val res = KjsApi.saveStockIn(
                                token = session.token,
                                kategori = selectedCategory,
                                kodeBahan = mat.kode,
                                namaBahan = mat.nama,
                                supplier = sup.nama,
                                jumlah = jml,
                                satuan = mat.satuan,
                                batch = batchText,
                                tglKadaluarsa = tglKadaluarsa,
                                hargaBeli = hargaBeliText.toDoubleOrNull() ?: 0.0,
                                ongkosKirim = ongkirText.toDoubleOrNull() ?: 0.0,
                                catatanQC = statusQC,
                                petugas = session.nama
                            )
                            isSaving = false
                            res.onSuccess { msg ->
                                dialogResult = Pair(true, msg)
                                jumlahText = ""
                                batchText = "BCH-${System.currentTimeMillis() % 10000}"
                            }.onFailure { err ->
                                dialogResult = Pair(false, err.message ?: "Gagal menyimpan transaksi.")
                            }
                        }
                    },
                    enabled = !isSaving,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Emerald)
                ) {
                    if (isSaving) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(20.dp),
                            color = Color.White,
                            strokeWidth = 2.dp
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Text("MENYIMPAN KE GOOGLE SHEETS...")
                    } else {
                        Icon(Icons.Default.Save, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("SIMPAN STOK MASUK", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }

    dialogResult?.let { (isSuccess, message) ->
        Dialog(onDismissRequest = { dialogResult = null }) {
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Box(
                        modifier = Modifier
                            .size(56.dp)
                            .background(
                                if (isSuccess) EmeraldLight else RoseLight,
                                CircleShape
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = if (isSuccess) Icons.Default.CheckCircle else Icons.Default.Error,
                            contentDescription = null,
                            tint = if (isSuccess) Emerald else Rose,
                            modifier = Modifier.size(32.dp)
                        )
                    }
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = if (isSuccess) "Berhasil Disimpan!" else "Gagal Menyimpan",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Navy
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = message,
                        fontSize = 13.sp,
                        color = Muted,
                        lineHeight = 18.sp
                    )
                    Spacer(modifier = Modifier.height(20.dp))
                    Button(
                        onClick = { dialogResult = null },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (isSuccess) Emerald else Navy
                        ),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("OK", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

@Composable
fun StockCardScreen(session: UserSession, initialCategory: String) {
    var selectedCategory by remember { mutableStateOf(initialCategory) }
    var searchQuery by remember { mutableStateOf("") }
    var materials by remember { mutableStateOf<List<MasterMaterial>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }

    // State for Edit Transaction Dialog
    var editingTransaction by remember { mutableStateOf<StockTransaction?>(null) }

    val coroutineScope = rememberCoroutineScope()

    fun loadMaterials() {
        isLoading = true
        coroutineScope.launch {
            val res = KjsApi.fetchMasterMaterials(session.token, selectedCategory)
            res.onSuccess { materials = it }
            isLoading = false
        }
    }

    LaunchedEffect(selectedCategory) {
        loadMaterials()
    }

    val filteredList = materials.filter { item ->
        searchQuery.isBlank() ||
                item.nama.contains(searchQuery, ignoreCase = true) ||
                item.kode.contains(searchQuery, ignoreCase = true)
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(18.dp)
    ) {
        Text(
            text = "Kartu Stok Persediaan",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = Navy
        )
        Text(
            text = "Saldo stok dan riwayat mutasi barang.",
            fontSize = 12.sp,
            color = Muted
        )
        Spacer(modifier = Modifier.height(14.dp))

        // Search Bar
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            placeholder = { Text("Cari kode atau nama...") },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = Muted) },
            trailingIcon = {
                if (searchQuery.isNotEmpty()) {
                    IconButton(onClick = { searchQuery = "" }) {
                        Icon(Icons.Default.Clear, contentDescription = null)
                    }
                }
            },
            shape = RoundedCornerShape(14.dp),
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Category Tabs: Bahan Baku, Bahan Pengemas, Produk Jadi
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            FilterChip(
                selected = selectedCategory == "BAHAN BAKU",
                onClick = { selectedCategory = "BAHAN BAKU" },
                label = { Text("Bahan Baku", fontSize = 11.sp) },
                modifier = Modifier.weight(1f)
            )
            FilterChip(
                selected = selectedCategory == "BAHAN PENGEMAS",
                onClick = { selectedCategory = "BAHAN PENGEMAS" },
                label = { Text("Kemasan", fontSize = 11.sp) },
                modifier = Modifier.weight(1f)
            )
            FilterChip(
                selected = selectedCategory == "PRODUK JADI",
                onClick = { selectedCategory = "PRODUK JADI" },
                label = { Text("Produk Jadi", fontSize = 11.sp) },
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(modifier = Modifier.height(14.dp))

        if (isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = Blue)
            }
        } else if (filteredList.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("Tidak ada barang ditemukan.", color = Muted)
            }
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(10.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(filteredList.size) { index ->
                    val item = filteredList[index]
                    val isLow = item.stok <= item.minStok
                    Card(
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                // Buka contoh transaksi item ini untuk di-edit
                                editingTransaction = StockTransaction(
                                    id = "TRX-${item.kode}",
                                    tanggal = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date()),
                                    tipe = "MASUK",
                                    kategori = selectedCategory,
                                    kodeBahan = item.kode,
                                    namaBahan = item.nama,
                                    jumlah = item.stok,
                                    satuan = item.satuan,
                                    supplier = "PT Surya Kimia Farma",
                                    batch = "BCH-8921",
                                    expiredDate = "2026-12-31",
                                    hargaBeli = 45000.0,
                                    ongkosKirim = 0.0,
                                    statusQC = "LOLOS",
                                    catatan = "Lolos uji visual dan spesifikasi"
                                )
                            }
                    ) {
                        Row(
                            modifier = Modifier.padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(44.dp)
                                    .background(
                                        if (isLow) RoseLight else BlueLight,
                                        RoundedCornerShape(12.dp)
                                    ),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = when (selectedCategory) {
                                        "BAHAN PENGEMAS" -> Icons.Default.Archive
                                        "PRODUK JADI" -> Icons.Default.Inventory2
                                        else -> Icons.Default.Science
                                    },
                                    contentDescription = null,
                                    tint = if (isLow) Rose else Blue
                                )
                            }
                            Spacer(modifier = Modifier.width(14.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = item.kode,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Blue
                                )
                                Text(
                                    text = item.nama,
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Ink
                                )
                                Text(
                                    text = "Batas Min: ${item.minStok} ${item.satuan} • Klik untuk Edit",
                                    fontSize = 11.sp,
                                    color = Muted
                                )
                            }
                            Column(horizontalAlignment = Alignment.End) {
                                Text(
                                    text = "${item.stok}",
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Black,
                                    color = if (isLow) Rose else Navy
                                )
                                Text(
                                    text = item.satuan,
                                    fontSize = 11.sp,
                                    color = Muted
                                )
                                Surface(
                                    color = if (isLow) RoseLight else EmeraldLight,
                                    shape = RoundedCornerShape(6.dp),
                                    modifier = Modifier.padding(top = 4.dp)
                                ) {
                                    Text(
                                        text = if (isLow) "Menipis" else "Aman",
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = if (isLow) Rose else Emerald,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Modal Edit Transaksi Stok Masuk
    editingTransaction?.let { trx ->
        EditStockInModal(
            transaction = trx,
            session = session,
            onDismiss = { editingTransaction = null },
            onSaved = {
                editingTransaction = null
                loadMaterials()
            }
        )
    }
}

@Composable
fun EditStockInModal(
    transaction: StockTransaction,
    session: UserSession,
    onDismiss: () -> Unit,
    onSaved: () -> Unit
) {
    var tanggal by remember { mutableStateOf(transaction.tanggal) }
    var batch by remember { mutableStateOf(transaction.batch) }
    var expiredDate by remember { mutableStateOf(transaction.expiredDate.ifBlank { "2026-12-31" }) }
    var qtyText by remember { mutableStateOf(transaction.jumlah.toString()) }
    var hargaBeliText by remember { mutableStateOf(transaction.hargaBeli.toString()) }
    var ongkirText by remember { mutableStateOf(transaction.ongkosKirim.toString()) }
    var qcStatus by remember { mutableStateOf(transaction.statusQC) }
    var catatanText by remember { mutableStateOf(transaction.catatan) }

    var isSaving by remember { mutableStateOf(false) }
    var noticeMessage by remember { mutableStateOf<Pair<Boolean, String>?>(null) }
    val coroutineScope = rememberCoroutineScope()

    Dialog(onDismissRequest = { if (!isSaving) onDismiss() }) {
        Card(
            shape = RoundedCornerShape(22.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp)
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("Edit Stok Masuk", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Navy)
                        Text("${transaction.kodeBahan} - ${transaction.namaBahan}", fontSize = 12.sp, color = Blue, fontWeight = FontWeight.SemiBold)
                    }
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Tutup")
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                Text("Tanggal Penerimaan", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = Ink)
                OutlinedTextField(value = tanggal, onValueChange = { tanggal = it }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(10.dp))

                Spacer(modifier = Modifier.height(10.dp))

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Nomor Batch", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = Ink)
                        OutlinedTextField(value = batch, onValueChange = { batch = it }, shape = RoundedCornerShape(10.dp))
                    }
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Tgl Kadaluarsa", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = Ink)
                        OutlinedTextField(value = expiredDate, onValueChange = { expiredDate = it }, shape = RoundedCornerShape(10.dp))
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Jumlah (${transaction.satuan})", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = Ink)
                        OutlinedTextField(value = qtyText, onValueChange = { qtyText = it }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), shape = RoundedCornerShape(10.dp))
                    }
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Harga Beli (Rp)", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = Ink)
                        OutlinedTextField(value = hargaBeliText, onValueChange = { hargaBeliText = it }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), shape = RoundedCornerShape(10.dp))
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                Text("Status QC", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = Ink)
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    listOf("LOLOS", "MENUNGGU", "KARANTINA").forEach { qc ->
                        FilterChip(
                            selected = qcStatus == qc,
                            onClick = { qcStatus = qc },
                            label = { Text(qc, fontSize = 10.sp) }
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                Text("Catatan Pemeriksaan", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = Ink)
                OutlinedTextField(value = catatanText, onValueChange = { catatanText = it }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(10.dp))

                Spacer(modifier = Modifier.height(20.dp))

                Button(
                    onClick = {
                        isSaving = true
                        coroutineScope.launch {
                            val res = KjsApi.updateStockInEdit(
                                token = session.token,
                                id = transaction.id,
                                tanggal = tanggal,
                                batch = batch,
                                expiredDate = expiredDate,
                                qty = qtyText.toDoubleOrNull() ?: transaction.jumlah,
                                hargaPembelian = hargaBeliText.toDoubleOrNull() ?: 0.0,
                                ongkosKirim = ongkirText.toDoubleOrNull() ?: 0.0,
                                qc = qcStatus,
                                keterangan = catatanText
                            )
                            isSaving = false
                            res.onSuccess { msg ->
                                noticeMessage = Pair(true, msg)
                            }.onFailure { err ->
                                noticeMessage = Pair(false, err.message ?: "Gagal memperbarui transaksi.")
                            }
                        }
                    },
                    enabled = !isSaving,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Emerald)
                ) {
                    if (isSaving) {
                        CircularProgressIndicator(modifier = Modifier.size(18.dp), color = Color.White, strokeWidth = 2.dp)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("MENYIMPAN PERUBAHAN...")
                    } else {
                        Icon(Icons.Default.Check, contentDescription = null)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("SIMPAN PERUBAHAN", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }

    // Modal popup notifikasi sukses/gagal di tengah layar
    noticeMessage?.let { (isSuccess, msg) ->
        Dialog(onDismissRequest = {
            noticeMessage = null
            if (isSuccess) onSaved()
        }) {
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Box(
                        modifier = Modifier
                            .size(56.dp)
                            .background(if (isSuccess) EmeraldLight else RoseLight, CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = if (isSuccess) Icons.Default.CheckCircle else Icons.Default.Error,
                            contentDescription = null,
                            tint = if (isSuccess) Emerald else Rose,
                            modifier = Modifier.size(32.dp)
                        )
                    }
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = if (isSuccess) "Perubahan Berhasil Disimpan" else "Gagal Menyimpan Perubahan",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Navy
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = msg,
                        fontSize = 13.sp,
                        color = Muted,
                        lineHeight = 18.sp
                    )
                    Spacer(modifier = Modifier.height(20.dp))
                    Button(
                        onClick = {
                            noticeMessage = null
                            if (isSuccess) onSaved()
                        },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = if (isSuccess) Emerald else Navy),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("OK", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

@Composable
fun HistoryScreen(session: UserSession) {
    var selectedFilter by remember { mutableStateOf("SEMUA") }
    var editingTransaction by remember { mutableStateOf<StockTransaction?>(null) }

    val sampleTransactions = remember {
        listOf(
            StockTransaction("TRX001", "2026-10-30", "MASUK", "BAHAN BAKU", "RM001", "Ekstrak Lidah Buaya", 25.0, "kg", "PT Surya Kimia Farma", "BCH-8921", "2026-12-31", 45000.0, 0.0, "LOLOS", "Lolos uji visual"),
            StockTransaction("TRX002", "2026-10-30", "MASUK", "BAHAN PENGEMAS", "PM001", "Botol PET 100ml Bening", 500.0, "pcs", "PT Mitra Kemasan Sejahtera", "BCH-8922", "2028-10-30", 1200.0, 0.0, "LOLOS", "Kondisi botol mulus"),
            StockTransaction("TRX003", "2026-10-29", "KELUAR", "BAHAN BAKU", "RM002", "Gliserin Farmasi", 15.0, "liter", "Produksi Batch #44", "BCH-7731", "2026-11-20", 35000.0, 0.0, "LOLOS", "Digunakan produksi"),
            StockTransaction("TRX004", "2026-10-28", "MASUK", "BAHAN BAKU", "RM005", "Carbomer 940", 50.0, "kg", "CV Berkah Alam Sentosa", "BCH-6612", "2027-06-15", 75000.0, 0.0, "LOLOS", "COA terlampir")
        )
    }

    val filtered = sampleTransactions.filter { trx ->
        when (selectedFilter) {
            "MASUK" -> trx.tipe == "MASUK"
            "KELUAR" -> trx.tipe == "KELUAR"
            else -> true
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(18.dp)
    ) {
        Text(
            text = "Riwayat Transaksi",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = Navy
        )
        Text(
            text = "Daftar penerimaan barang dan penggunaan produksi. Klik untuk mengedit.",
            fontSize = 12.sp,
            color = Muted
        )
        Spacer(modifier = Modifier.height(14.dp))

        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf("SEMUA", "MASUK", "KELUAR").forEach { f ->
                FilterChip(
                    selected = selectedFilter == f,
                    onClick = { selectedFilter = f },
                    label = { Text(f) }
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(10.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(filtered.size) { index ->
                val trx = filtered[index]
                val isMasuk = trx.tipe == "MASUK"
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { editingTransaction = trx }
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .background(
                                    if (isMasuk) EmeraldLight else AmberLight,
                                    RoundedCornerShape(12.dp)
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = if (isMasuk) Icons.Default.ArrowDownward else Icons.Default.ArrowUpward,
                                contentDescription = null,
                                tint = if (isMasuk) Emerald else Amber
                            )
                        }
                        Spacer(modifier = Modifier.width(14.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "${trx.tanggal} • ${trx.tipe} • ${trx.kategori}",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isMasuk) Emerald else Amber
                            )
                            Text(
                                text = trx.namaBahan,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = Ink
                            )
                            Text(
                                text = "Batch: ${trx.batch} • ${trx.supplier}",
                                fontSize = 11.sp,
                                color = Muted
                            )
                        }
                        Column(horizontalAlignment = Alignment.End) {
                            Text(
                                text = "${if (isMasuk) "+" else "-"}${trx.jumlah} ${trx.satuan}",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Black,
                                color = if (isMasuk) Emerald else Ink
                            )
                            Surface(
                                color = EmeraldLight,
                                shape = RoundedCornerShape(6.dp),
                                modifier = Modifier.padding(top = 4.dp)
                            ) {
                                Text(
                                    text = "Edit Data",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Emerald,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }
                    }
                }
            }
        }
    }

    editingTransaction?.let { trx ->
        EditStockInModal(
            transaction = trx,
            session = session,
            onDismiss = { editingTransaction = null },
            onSaved = { editingTransaction = null }
        )
    }
}

@Composable
fun DataListModal(
    viewType: String,
    session: UserSession,
    onDismiss: () -> Unit,
    onSelectStockIn: (String) -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }
    var materials by remember { mutableStateOf<List<MasterMaterial>>(emptyList()) }
    var suppliers by remember { mutableStateOf<List<MasterSupplier>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    val coroutineScope = rememberCoroutineScope()

    LaunchedEffect(viewType) {
        isLoading = true
        when (viewType) {
            "bahan" -> {
                val b1 = KjsApi.fetchMasterMaterials(session.token, "BAHAN BAKU")
                val b2 = KjsApi.fetchMasterMaterials(session.token, "BAHAN PENGEMAS")
                val combined = mutableListOf<MasterMaterial>()
                b1.onSuccess { combined.addAll(it) }
                b2.onSuccess { combined.addAll(it) }
                materials = combined
            }
            "produk" -> {
                val p = KjsApi.fetchMasterMaterials(session.token, "PRODUK JADI")
                p.onSuccess { materials = it }
            }
            "supplier" -> {
                val s = KjsApi.fetchMasterSuppliers(session.token)
                s.onSuccess { suppliers = it }
            }
        }
        isLoading = false
    }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(22.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.85f)
                .padding(8.dp)
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = when (viewType) {
                                "bahan" -> "Daftar Bahan Aktif (Baku & Kemas)"
                                "produk" -> "Daftar Produk Jadi Aktif"
                                else -> "Daftar Supplier Aktif"
                            },
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = Navy
                        )
                        Text(
                            text = "Akses langsung dari Dashboard",
                            fontSize = 11.sp,
                            color = Muted
                        )
                    }
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Tutup")
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    placeholder = { Text("Cari...") },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = Muted) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp)
                )

                Spacer(modifier = Modifier.height(14.dp))

                if (isLoading) {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = Blue)
                    }
                } else if (viewType == "supplier") {
                    val filteredSup = suppliers.filter {
                        searchQuery.isBlank() || it.nama.contains(searchQuery, ignoreCase = true) || it.kode.contains(searchQuery, ignoreCase = true)
                    }
                    LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxSize()) {
                        items(filteredSup.size) { index ->
                            val sup = filteredSup[index]
                            Card(
                                shape = RoundedCornerShape(14.dp),
                                colors = CardDefaults.cardColors(containerColor = Pale),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Column(modifier = Modifier.padding(12.dp)) {
                                    Text(sup.kode, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Blue)
                                    Text(sup.nama, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Ink)
                                    Text("Telp: ${sup.kontak.ifBlank { "—" }} • Kota: ${sup.kota.ifBlank { "—" }}", fontSize = 11.sp, color = Muted)
                                }
                            }
                        }
                    }
                } else {
                    val filteredMat = materials.filter {
                        searchQuery.isBlank() || it.nama.contains(searchQuery, ignoreCase = true) || it.kode.contains(searchQuery, ignoreCase = true)
                    }
                    LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxSize()) {
                        items(filteredMat.size) { index ->
                            val mat = filteredMat[index]
                            Card(
                                shape = RoundedCornerShape(14.dp),
                                colors = CardDefaults.cardColors(containerColor = Pale),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(
                                    modifier = Modifier.padding(12.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text("${mat.kode} • ${mat.kategori}", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Blue)
                                        Text(mat.nama, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Ink)
                                        Text("Min Stok: ${mat.minStok} ${mat.satuan}", fontSize = 11.sp, color = Muted)
                                    }
                                    Column(horizontalAlignment = Alignment.End) {
                                        Text("${mat.stok} ${mat.satuan}", fontSize = 14.sp, fontWeight = FontWeight.Black, color = Navy)
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

@Composable
fun AccountScreen(session: UserSession, onLogout: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(18.dp)
    ) {
        Text(
            text = "Pengaturan Akun",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = Navy
        )
        Text(
            text = "Informasi sesi login dan status sistem KJS.",
            fontSize = 12.sp,
            color = Muted
        )
        Spacer(modifier = Modifier.height(20.dp))

        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier.padding(20.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(52.dp)
                        .background(BlueLight, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Person,
                        contentDescription = null,
                        tint = Blue,
                        modifier = Modifier.size(28.dp)
                    )
                }
                Spacer(modifier = Modifier.width(16.dp))
                Column {
                    Text(
                        text = session.nama,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Ink
                    )
                    Text(
                        text = "Username: @${session.username}",
                        fontSize = 12.sp,
                        color = Muted
                    )
                    Surface(
                        color = Blue.copy(alpha = 0.1f),
                        shape = RoundedCornerShape(6.dp),
                        modifier = Modifier.padding(top = 4.dp)
                    ) {
                        Text(
                            text = "Role: ${session.role}",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Blue,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(18.dp))

        Card(
            shape = RoundedCornerShape(18.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                Text("Informasi Aplikasi", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Ink)
                Spacer(modifier = Modifier.height(10.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Aplikasi", fontSize = 12.sp, color = Muted)
                    Text("KJS Inventory Android Native", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Ink)
                }
                Spacer(modifier = Modifier.height(6.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Versi", fontSize = 12.sp, color = Muted)
                    Text("v1.0.0 (API 35 Jetpack Compose)", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Ink)
                }
                Spacer(modifier = Modifier.height(6.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Target Runtime", fontSize = 12.sp, color = Muted)
                    Text("Android 8.0 - 15 (minSdk 26)", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Ink)
                }
                Spacer(modifier = Modifier.height(6.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Integrasi", fontSize = 12.sp, color = Muted)
                    Text("Google Apps Script Live Web App", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Emerald)
                }
            }
        }

        Spacer(modifier = Modifier.height(28.dp))

        OutlinedButton(
            onClick = onLogout,
            modifier = Modifier
                .fillMaxWidth()
                .height(50.dp),
            shape = RoundedCornerShape(14.dp),
            colors = ButtonDefaults.outlinedButtonColors(contentColor = Rose)
        ) {
            Icon(Icons.Default.Logout, contentDescription = null)
            Spacer(modifier = Modifier.width(8.dp))
            Text("KELUAR DARI AKUN", fontWeight = FontWeight.Bold)
        }
    }
}
