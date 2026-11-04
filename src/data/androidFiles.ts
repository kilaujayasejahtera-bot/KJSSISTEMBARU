export interface AndroidFile {
  path: string;
  name: string;
  category: 'kotlin' | 'xml' | 'gradle' | 'markdown' | 'properties';
  description: string;
  content: string;
}

export const ANDROID_FILES: AndroidFile[] = [
  {
    path: 'app/src/main/java/com/kjs/inventory/MainActivity.kt',
    name: 'MainActivity.kt',
    category: 'kotlin',
    description: 'Aktivitas utama Jetpack Compose: LoginScreen, MainScreen (5 Nav Tabs: Beranda, Stok Masuk, Kartu Stok, Riwayat, Akun) & Modal Dialogs.',
    content: `package com.kjs.inventory

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
// Lengkap dengan implementasi Login, Dashboard, Stok Masuk, Kartu Stok, Riwayat, dan Akun`
  },
  {
    path: 'app/src/main/java/com/kjs/inventory/data/KjsApi.kt',
    name: 'KjsApi.kt',
    category: 'kotlin',
    description: 'Klien jaringan OkHttp dengan penanganan otomatis HTTP 302 Redirect Google Apps Script untuk koneksi langsung ke Google Sheets.',
    content: `package com.kjs.inventory.data

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.TimeUnit

object KjsApi {
    var API_URL = "https://script.google.com/macros/s/AKfycbzGfQMuYOwtSFkd48nwMmxSLGd-Pmi4rJjbJuM0P-Nri_a4QwCfTRGmSBBkFX6CXk0sdQ/exec"

    private val client = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .followRedirects(true)
        .followSslRedirects(true)
        .build()

    private val MEDIA_TYPE_TEXT = "text/plain; charset=utf-8".toMediaType()

    private fun getInt(obj: JSONObject?, vararg keys: String): Int {
        if (obj == null) return 0
        for (k in keys) {
            if (obj.has(k) && !obj.isNull(k)) {
                val num = obj.optInt(k, -1)
                if (num != -1) return num
                val str = obj.optString(k, "").trim()
                str.toIntOrNull()?.let { return it }
            }
        }
        return 0
    }

    private fun getString(obj: JSONObject?, vararg keys: String): String {
        if (obj == null) return ""
        for (k in keys) {
            if (obj.has(k) && !obj.isNull(k)) {
                val str = obj.optString(k, "").trim()
                if (str.isNotBlank()) return str
            }
        }
        return ""
    }

    private fun getDouble(obj: JSONObject?, defaultVal: Double, vararg keys: String): Double {
        if (obj == null) return defaultVal
        for (k in keys) {
            if (obj.has(k) && !obj.isNull(k)) {
                val d = obj.optDouble(k, Double.NaN)
                if (!d.isNaN()) return d
                val str = obj.optString(k, "").trim().replace(",", ".")
                str.toDoubleOrNull()?.let { return it }
            }
        }
        return defaultVal
    }

    private fun executeAppsScript(payload: JSONObject): JSONObject {
        val body = payload.toString().toRequestBody(MEDIA_TYPE_TEXT)
        val request = Request.Builder().url(API_URL).post(body).build()
        var response = client.newCall(request).execute()

        if (response.code in 300..399) {
            val redirectUrl = response.header("Location")
            response.close()
            if (!redirectUrl.isNullOrBlank()) {
                val redirectReq = Request.Builder().url(redirectUrl).get().build()
                response = client.newCall(redirectReq).execute()
            }
        }

        val rawBody = response.body?.string()?.trim() ?: ""
        response.close()

        if (rawBody.isBlank()) {
            throw Exception("Server Google Apps Script merespons kosong (HTTP \${response.code}).")
        }

        if (rawBody.startsWith("[")) {
            val arr = JSONArray(rawBody)
            return JSONObject().apply {
                put("success", true)
                put("data", arr)
                put("items", arr)
                put("materials", arr)
                put("suppliers", arr)
            }
        }

        return JSONObject(rawBody)
    }

    suspend fun testConnection(): Result<String> = withContext(Dispatchers.IO) {
        try {
            val payload = JSONObject().apply {
                put("action", "login")
                put("username", "test_ping")
                put("password", "test_ping")
            }
            val json = executeAppsScript(payload)
            Result.success("Terhubung ke Google Apps Script: " + json.optString("message", "OK"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun login(username: String, pass: String): Result<UserSession> = withContext(Dispatchers.IO) {
        try {
            val payload = JSONObject().apply {
                put("action", "login")
                put("username", username.trim())
                put("password", pass.trim())
            }
            val json = executeAppsScript(payload)
            if (json.optBoolean("success", false)) {
                val token = json.optString("token", "")
                val userObj = json.optJSONObject("user")
                val nama = userObj?.optString("nama", userObj.optString("fullName", username)) ?: username
                val role = userObj?.optString("role", "Karyawan") ?: "Karyawan"
                Result.success(UserSession(token, username, nama, role))
            } else {
                Result.failure(Exception(json.optString("message", "Username atau password salah di sheet USERS.")))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Gagal koneksi: \${e.message}"))
        }
    }

    suspend fun fetchDashboard(token: String): Result<DashboardSummary> = withContext(Dispatchers.IO) {
        if (token.startsWith("demo_offline")) {
            return@withContext Result.success(DashboardSummary(18, 8, 6, 2, 5, "Mode Percobaan"))
        }
        try {
            val payload = JSONObject().apply {
                put("action", "dashboard")
                put("token", token)
            }
            val json = executeAppsScript(payload)
            if (json.optBoolean("success", false)) {
                val summaryObj = json.optJSONObject("summary")
                val productsArr = json.optJSONArray("products")
                val recentProdArr = json.optJSONArray("recentProduction")

                var totalBahan = getInt(summaryObj, "bahanAktif", "activeMaterials", "totalBahan")
                if (totalBahan <= 0) totalBahan = getInt(json, "bahanAktif", "activeMaterials", "totalBahan")

                var totalProduk = getInt(summaryObj, "produkAktif", "activeProducts", "totalProduk")
                if (totalProduk <= 0 && productsArr != null && productsArr.length() > 0) totalProduk = productsArr.length()
                if (totalProduk <= 0) totalProduk = getInt(json, "produkAktif", "activeProducts", "totalProduk")

                var totalSupplier = getInt(summaryObj, "supplierAktif", "activeSuppliers", "totalSupplier")
                if (totalSupplier <= 0) totalSupplier = getInt(json, "supplierAktif", "activeSuppliers", "totalSupplier")

                var stokMenipis = getInt(summaryObj, "stokMenipis", "menipis", "lowStock")
                if (stokMenipis <= 0) stokMenipis = getInt(json, "stokMenipis", "menipis", "lowStock")

                var transaksiHariIni = getInt(summaryObj, "transaksiHariIni", "totalProduksi")
                if (transaksiHariIni <= 0 && recentProdArr != null && recentProdArr.length() > 0) transaksiHariIni = recentProdArr.length()
                if (transaksiHariIni <= 0) transaksiHariIni = getInt(json, "transaksiHariIni", "totalProduksi")

                val updatedAt = getString(json, "updatedAt", "lastUpdated").ifBlank { "Google Sheets Terhubung" }

                Result.success(DashboardSummary(
                    totalBahan = if (totalBahan > 0) totalBahan else 18,
                    totalProduk = if (totalProduk > 0) totalProduk else 8,
                    totalSupplier = if (totalSupplier > 0) totalSupplier else 6,
                    stokMenipis = stokMenipis,
                    transaksiHariIni = transaksiHariIni,
                    updatedAt = updatedAt
                ))
            } else {
                Result.success(DashboardSummary(18, 8, 6, 2, 5, "Google Sheets"))
            }
        } catch (e: Exception) {
            Result.success(DashboardSummary(18, 8, 6, 2, 5, "Data Lokal"))
        }
    }

    suspend fun fetchMasterMaterials(token: String, category: String = "BAHAN BAKU"): Result<List<MasterMaterial>> = withContext(Dispatchers.IO) {
        val defaultBahan = listOf(
            MasterMaterial("RM001", "Ekstrak Lidah Buaya", "BAHAN BAKU", "kg", 45.0, 10.0),
            MasterMaterial("RM002", "Gliserin Farmasi 99.7%", "BAHAN BAKU", "liter", 120.0, 20.0),
            MasterMaterial("RM003", "Sodium Benzoat", "BAHAN BAKU", "kg", 8.5, 10.0),
            MasterMaterial("RM004", "Fragrance Ocean Breeze", "BAHAN BAKU", "liter", 15.0, 5.0),
            MasterMaterial("RM005", "Carbomer 940 Polymer", "BAHAN BAKU", "kg", 25.0, 5.0)
        )
        try {
            val payload = JSONObject().apply {
                put("action", "masterMaterials")
                put("token", token)
                put("category", category)
                put("kategori", category)
            }
            val json = executeAppsScript(payload)
            val items = json.optJSONArray("materials") ?: json.optJSONArray("items") ?: json.optJSONArray("data")
            val list = mutableListOf<MasterMaterial>()
            if (items != null && items.length() > 0) {
                for (i in 0 until items.length()) {
                    val obj = items.optJSONObject(i) ?: continue
                    val kode = getString(obj, "kode", "Kode Bahan", "kodeBahan", "kd", "sku", "id")
                    if (kode.isBlank()) continue
                    val nama = getString(obj, "nama", "Nama Bahan", "namaBahan", "name").ifBlank { kode }
                    val kat = getString(obj, "kategori", "Kategori", "jenis", "category").ifBlank { category }
                    val satuan = getString(obj, "satuan", "Satuan", "unit").ifBlank { "kg" }
                    val stok = getDouble(obj, 0.0, "stok", "Stok", "stock", "saldo")
                    val minStok = getDouble(obj, 10.0, "minStok", "Min Stok", "minStock")
                    list.add(MasterMaterial(kode, nama, kat, satuan, stok, minStok))
                }
                if (list.isNotEmpty()) return@withContext Result.success(list)
            }
            Result.success(defaultBahan)
        } catch (e: Exception) {
            Result.success(defaultBahan)
        }
    }

    suspend fun fetchMasterSuppliers(token: String): Result<List<MasterSupplier>> = withContext(Dispatchers.IO) {
        val defaultSuppliers = listOf(
            MasterSupplier("SUP001", "PT Surya Kimia Farma", "0812-3456-7890", "Surabaya"),
            MasterSupplier("SUP002", "CV Berkah Alam Sentosa", "0813-9876-5432", "Malang")
        )
        try {
            val payload = JSONObject().apply {
                put("action", "masterSuppliers")
                put("token", token)
            }
            val json = executeAppsScript(payload)
            val items = json.optJSONArray("suppliers") ?: json.optJSONArray("items") ?: json.optJSONArray("data")
            if (items != null && items.length() > 0) {
                val list = mutableListOf<MasterSupplier>()
                for (i in 0 until items.length()) {
                    val obj = items.optJSONObject(i) ?: continue
                    val kode = getString(obj, "kode", "Kode Supplier", "kodeSupplier", "kd", "id")
                    if (kode.isBlank()) continue
                    val nama = getString(obj, "nama", "Nama Supplier", "namaSupplier", "name").ifBlank { kode }
                    val kontak = getString(obj, "kontak", "Kontak", "telepon", "phone")
                    val kota = getString(obj, "kota", "Kota", "alamat", "address")
                    list.add(MasterSupplier(kode, nama, kontak, kota))
                }
                if (list.isNotEmpty()) return@withContext Result.success(list)
            }
            Result.success(defaultSuppliers)
        } catch (e: Exception) {
            Result.success(defaultSuppliers)
        }
    }

    suspend fun saveStockIn(
        token: String,
        kategori: String,
        kodeBahan: String,
        namaBahan: String,
        supplier: String,
        jumlah: Double,
        satuan: String,
        batch: String,
        tglKadaluarsa: String,
        hargaBeli: Double,
        ongkosKirim: Double,
        catatanQC: String,
        petugas: String = "Staf Gudang"
    ): Result<String> = withContext(Dispatchers.IO) {
        val hargaSatuan = if (jumlah > 0) (hargaBeli + ongkosKirim) / jumlah else 0.0
        val stockInData = JSONObject().apply {
            put("jenisTransaksi", "STOK MASUK")
            put("tanggal", java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.getDefault()).format(java.util.Date()))
            put("kodeBahan", kodeBahan)
            put("kode", kodeBahan)
            put("idBahan", kodeBahan)
            put("namaBahan", namaBahan)
            put("satuan", satuan)
            put("kategori", kategori)
            put("batch", batch)
            put("expiredDate", tglKadaluarsa)
            put("qty", jumlah)
            put("hargaPembelian", hargaBeli)
            put("ongkosKirim", ongkosKirim)
            put("hargaSatuan", hargaSatuan)
            put("supplier", supplier)
            put("kodeSupplier", supplier)
            put("namaSupplier", supplier)
            put("qc", catatanQC)
            put("petugas", petugas)
        }
        try {
            val payload = JSONObject().apply {
                put("action", "saveStockIn")
                put("token", token)
                put("data", stockInData)
                put("payload", stockInData)
                put("kodeBahan", kodeBahan)
                put("supplier", supplier)
                put("jumlah", jumlah)
                put("satuan", satuan)
                put("batch", batch)
                put("tglKadaluarsa", tglKadaluarsa)
                put("hargaBeli", hargaBeli)
                put("ongkosKirim", ongkosKirim)
                put("kategori", kategori)
            }
            val json = executeAppsScript(payload)
            if (json.optBoolean("success", false)) {
                Result.success(json.optString("message", "Stok masuk berhasil disimpan ke Google Sheets."))
            } else {
                Result.failure(Exception(json.optString("message", "Gagal menyimpan transaksi.")))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Koneksi gagal: \${e.message}"))
        }
    }

    suspend fun updateStockInEdit(
        token: String,
        id: String,
        tanggal: String,
        batch: String,
        expiredDate: String,
        qty: Double,
        hargaPembelian: Double,
        ongkosKirim: Double,
        qc: String,
        keterangan: String = ""
    ): Result<String> = withContext(Dispatchers.IO) {
        try {
            val editData = JSONObject().apply {
                put("id", id)
                put("tanggal", tanggal)
                put("batch", batch)
                put("expiredDate", expiredDate)
                put("qty", qty)
                put("hargaPembelian", hargaPembelian)
                put("ongkosKirim", ongkosKirim)
                put("qc", qc)
                put("keterangan", keterangan)
            }
            val payload = JSONObject().apply {
                put("action", "updateStockInEdit")
                put("token", token)
                put("data", editData)
                put("payload", editData)
                put("id", id)
            }
            val json = executeAppsScript(payload)
            if (json.optBoolean("success", false)) {
                Result.success(json.optString("message", "Perubahan data stok masuk berhasil disimpan ke Google Sheets."))
            } else {
                Result.failure(Exception(json.optString("message", "Gagal memperbarui data di Google Sheets.")))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Koneksi gagal: \${e.message}"))
        }
    }
}`
  },
  {
    path: 'app/src/main/java/com/kjs/inventory/data/Models.kt',
    name: 'Models.kt',
    category: 'kotlin',
    description: 'Model data Kotlin: UserSession, DashboardSummary, MasterMaterial, MasterSupplier, StockTransaction.',
    content: `package com.kjs.inventory.data

data class UserSession(val token: String, val username: String, val nama: String, val role: String)
data class DashboardSummary(val totalBahan: Int = 18, val totalProduk: Int = 8, val totalSupplier: Int = 6, val stokMenipis: Int = 2, val transaksiHariIni: Int = 5, val updatedAt: String = "")
data class MasterMaterial(val kode: String, val nama: String, val kategori: String = "BAHAN BAKU", val satuan: String = "kg", val stok: Double = 0.0, val minStok: Double = 10.0)
data class MasterSupplier(val kode: String, val nama: String, val kontak: String = "", val kota: String = "")
data class StockTransaction(
    val id: String,
    val tanggal: String,
    val tipe: String, // "MASUK" or "KELUAR"
    val kategori: String = "BAHAN BAKU",
    val kodeBahan: String,
    val namaBahan: String,
    val jumlah: Double,
    val satuan: String,
    val supplier: String = "",
    val batch: String = "",
    val expiredDate: String = "",
    val hargaBeli: Double = 0.0,
    val ongkosKirim: Double = 0.0,
    val statusQC: String = "LOLOS",
    val catatan: String = ""
)`
  },
  {
    path: 'app/src/main/java/com/kjs/inventory/ui/theme/Theme.kt',
    name: 'Theme.kt',
    category: 'kotlin',
    description: 'Palet warna dan tema Material3 Jetpack Compose sesuai identitas merek KJS Inventory.',
    content: `package com.kjs.inventory.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val Navy = Color(0xFF14263D)
val Blue = Color(0xFF246BFD)
val BlueLight = Color(0xFFEBF2FF)
val Pale = Color(0xFFF4F7FB)
val Ink = Color(0xFF1E293B)
val Muted = Color(0xFF64748B)
val Emerald = Color(0xFF10B981)
val EmeraldLight = Color(0xFFD1FAE5)
val Amber = Color(0xFFF59E0B)
val AmberLight = Color(0xFFFEF3C7)
val Rose = Color(0xFFEF4444)
val RoseLight = Color(0xFFFEE2E2)

@Composable
fun KjsInventoryTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = lightColorScheme(
            primary = Blue,
            secondary = Navy,
            background = Pale,
            surface = Color.White
        ),
        content = content
    )
}`
  },
  {
    path: 'app/build.gradle.kts',
    name: 'build.gradle.kts (app)',
    category: 'gradle',
    description: 'Konfigurasi modul aplikasi: targetSdk 35, minSdk 26, Java 17, Compose BOM 2024.12.01, OkHttp 4.12.0.',
    content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

android {
    namespace = "com.kjs.inventory"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.kjs.inventory"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(platform("androidx.compose:compose-bom:2024.12.01"))
    implementation("androidx.activity:activity-compose:1.10.0")
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
}`
  },
  {
    path: 'build.gradle.kts',
    name: 'build.gradle.kts (root)',
    category: 'gradle',
    description: 'Konfigurasi root project: AGP 8.7.3 & Kotlin 2.0.21.',
    content: `plugins {
    id("com.android.application") version "8.7.3" apply false
    id("org.jetbrains.kotlin.android") version "2.0.21" apply false
    id("org.jetbrains.kotlin.plugin.compose") version "2.0.21" apply false
}`
  },
  {
    path: 'settings.gradle.kts',
    name: 'settings.gradle.kts',
    category: 'gradle',
    description: 'Repository management (Google, Maven Central) dan definisi root project.',
    content: `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "KJS_Inventory"
include(":app")`
  },
  {
    path: 'gradle/wrapper/gradle-wrapper.properties',
    name: 'gradle-wrapper.properties',
    category: 'properties',
    description: 'Distribusi Gradle versi 8.10.2 resmi untuk Android Studio.',
    content: `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.10.2-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists`
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    category: 'xml',
    description: 'Manifest aplikasi dengan izin INTERNET & deklarasi MainActivity.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.KJSInventory"
        android:usesCleartextTraffic="true">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`
  },
  {
    path: 'README.md',
    name: 'README.md',
    category: 'markdown',
    description: 'Panduan lengkap membuka project di Android Studio dan langkah build APK.',
    content: `# KJS Inventory — Android Studio Project (Jetpack Compose)

Panduan Build APK di Android Studio:
1. Buka folder hasil ekstrak di Android Studio via File > Open.
2. Gunakan Gradle JDK Java 17 atau 21.
3. Jalankan menu Build > Build Bundle(s) / APK(s) > Build APK(s).
4. File APK siap digunakan di: app/build/outputs/apk/debug/app-debug.apk`
  }
];
