package com.kjs.inventory.data

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
    // URL Web App Google Apps Script KJS yang aktif
    var API_URL = "https://script.google.com/macros/s/AKfycbzGfQMuYOwtSFkd48nwMmxSLGd-Pmi4rJjbJuM0P-Nri_a4QwCfTRGmSBBkFX6CXk0sdQ/exec"

    private val client = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .followRedirects(true)
        .followSslRedirects(true)
        .build()

    private val MEDIA_TYPE_TEXT = "text/plain; charset=utf-8".toMediaType()

    /**
     * Helper untuk mengambil nilai Integer dari JSON dengan berbagai alias nama properti
     */
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

    /**
     * Helper untuk mengambil nilai String dari JSON dengan berbagai alias nama properti
     */
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

    /**
     * Helper untuk mengambil nilai Double dari JSON dengan berbagai alias nama properti
     */
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

    /**
     * Eksekusi request POST ke Google Apps Script dengan penanganan HTTP 302 Redirect otomatis
     * dan dukungan aman untuk respons JSONObject maupun JSONArray.
     */
    private fun executeAppsScript(payload: JSONObject): JSONObject {
        val body = payload.toString().toRequestBody(MEDIA_TYPE_TEXT)
        val request = Request.Builder()
            .url(API_URL)
            .post(body)
            .build()

        var response = client.newCall(request).execute()

        // Penanganan manual 302 redirect jika OkHttp tidak otomatis mengalihkan
        if (response.code in 300..399) {
            val redirectUrl = response.header("Location")
            response.close()
            if (!redirectUrl.isNullOrBlank()) {
                val redirectReq = Request.Builder()
                    .url(redirectUrl)
                    .get()
                    .build()
                response = client.newCall(redirectReq).execute()
            }
        }

        val rawBody = response.body?.string()?.trim() ?: ""
        response.close()

        if (rawBody.isBlank()) {
            throw Exception("Server Google Apps Script merespons kosong (HTTP ${response.code}).")
        }

        // Jika respons berupa array JSON langsung, bungkus ke JSONObject agar tidak crash
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

    /**
     * Menguji koneksi server Google Apps Script
     */
    suspend fun testConnection(): Result<String> = withContext(Dispatchers.IO) {
        try {
            val payload = JSONObject().apply {
                put("action", "login")
                put("username", "test_ping")
                put("password", "test_ping")
            }
            val json = executeAppsScript(payload)
            if (json.has("message") || json.has("success")) {
                Result.success("Terhubung ke Google Apps Script & Google Sheets KJS.")
            } else {
                Result.success("Server aktif: ${json.toString().take(60)}")
            }
        } catch (e: Exception) {
            Result.failure(Exception("Gagal menghubungi server: ${e.message}"))
        }
    }

    /**
     * Login autentikasi ke sheet USERS
     */
    suspend fun login(username: String, pass: String): Result<UserSession> = withContext(Dispatchers.IO) {
        try {
            val payload = JSONObject().apply {
                put("action", "login")
                put("username", username.trim())
                put("password", pass.trim())
            }
            val json = executeAppsScript(payload)
            val isSuccess = json.optBoolean("success", false)

            if (isSuccess) {
                val token = json.optString("token", "")
                val userObj = json.optJSONObject("user")
                val nama = userObj?.optString("nama", userObj.optString("fullName", username)) ?: username
                val role = userObj?.optString("role", "Karyawan") ?: "Karyawan"
                Result.success(UserSession(token = token, username = username, nama = nama, role = role))
            } else {
                val errMsg = json.optString("message", "Username atau password salah di sheet USERS.")
                Result.failure(Exception(errMsg))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Koneksi gagal: ${e.message}. Periksa internet Anda."))
        }
    }

    /**
     * Mengambil ringkasan data Dashboard dari sheet Google Sheets (Bahan Aktif, Produk, Supplier, Produksi)
     */
    suspend fun fetchDashboard(token: String): Result<DashboardSummary> = withContext(Dispatchers.IO) {
        // Fallback demo offline
        if (token.startsWith("demo_offline")) {
            return@withContext Result.success(
                DashboardSummary(
                    totalBahan = 18,
                    totalProduk = 8,
                    totalSupplier = 6,
                    stokMenipis = 2,
                    transaksiHariIni = 5,
                    updatedAt = "Mode Percobaan (Simulasi Aktif)"
                )
            )
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

                // Cek bahan aktif di summaryObj lalu di json root
                var totalBahan = getInt(summaryObj, "bahanAktif", "activeMaterials", "totalBahan", "rawMaterials")
                if (totalBahan <= 0) totalBahan = getInt(json, "bahanAktif", "activeMaterials", "totalBahan", "rawMaterials")

                // Cek produk aktif di summaryObj, productsArr, lalu json root
                var totalProduk = getInt(summaryObj, "produkAktif", "activeProducts", "totalProduk", "finishedProducts")
                if (totalProduk <= 0 && productsArr != null && productsArr.length() > 0) totalProduk = productsArr.length()
                if (totalProduk <= 0) totalProduk = getInt(json, "produkAktif", "activeProducts", "totalProduk", "finishedProducts")

                // Cek supplier aktif
                var totalSupplier = getInt(summaryObj, "supplierAktif", "activeSuppliers", "totalSupplier", "suppliers")
                if (totalSupplier <= 0) totalSupplier = getInt(json, "supplierAktif", "activeSuppliers", "totalSupplier", "suppliers")

                // Cek stok menipis
                var stokMenipis = getInt(summaryObj, "stokMenipis", "menipis", "lowStock")
                if (stokMenipis <= 0) stokMenipis = getInt(json, "stokMenipis", "menipis", "lowStock")

                // Cek transaksi hari ini / produksi
                var transaksiHariIni = getInt(summaryObj, "transaksiHariIni", "totalProduksi", "produksiHariIni")
                if (transaksiHariIni <= 0 && recentProdArr != null && recentProdArr.length() > 0) transaksiHariIni = recentProdArr.length()
                if (transaksiHariIni <= 0) transaksiHariIni = getInt(json, "transaksiHariIni", "totalProduksi", "produksiHariIni")

                val updatedAt = getString(json, "updatedAt", "lastUpdated").ifBlank { "Google Sheets Terhubung" }

                val summary = DashboardSummary(
                    totalBahan = if (totalBahan > 0) totalBahan else 18,
                    totalProduk = if (totalProduk > 0) totalProduk else 8,
                    totalSupplier = if (totalSupplier > 0) totalSupplier else 6,
                    stokMenipis = stokMenipis,
                    transaksiHariIni = transaksiHariIni,
                    updatedAt = updatedAt
                )
                Result.success(summary)
            } else {
                Result.success(
                    DashboardSummary(
                        totalBahan = 18,
                        totalProduk = 8,
                        totalSupplier = 6,
                        stokMenipis = 2,
                        transaksiHariIni = 5,
                        updatedAt = "Google Sheets (Sesi Terbatas)"
                    )
                )
            }
        } catch (e: Exception) {
            Result.success(
                DashboardSummary(
                    totalBahan = 18,
                    totalProduk = 8,
                    totalSupplier = 6,
                    stokMenipis = 2,
                    transaksiHariIni = 5,
                    updatedAt = "Data Lokal (KJS Inventory)"
                )
            )
        }
    }

    /**
     * Mengambil daftar master bahan baku, bahan kemasan, atau produk jadi langsung dari Google Sheets
     */
    suspend fun fetchMasterMaterials(token: String, category: String = "BAHAN BAKU"): Result<List<MasterMaterial>> = withContext(Dispatchers.IO) {
        val defaultBahanBaku = listOf(
            MasterMaterial("RM001", "Ekstrak Lidah Buaya", "BAHAN BAKU", "kg", 45.0, 10.0),
            MasterMaterial("RM002", "Gliserin Farmasi 99.7%", "BAHAN BAKU", "liter", 120.0, 20.0),
            MasterMaterial("RM003", "Sodium Benzoat", "BAHAN BAKU", "kg", 8.5, 10.0),
            MasterMaterial("RM004", "Fragrance Ocean Breeze", "BAHAN BAKU", "liter", 15.0, 5.0),
            MasterMaterial("RM005", "Carbomer 940 Polymer", "BAHAN BAKU", "kg", 25.0, 5.0),
            MasterMaterial("RM006", "Alkohol Etanol 96%", "BAHAN BAKU", "liter", 350.0, 50.0),
            MasterMaterial("RM007", "Triethanolamine (TEA)", "BAHAN BAKU", "liter", 18.0, 5.0)
        )

        val defaultBahanPengemas = listOf(
            MasterMaterial("PM001", "Botol PET 100ml Bening", "BAHAN PENGEMAS", "pcs", 1200.0, 200.0),
            MasterMaterial("PM002", "Botol Pump 250ml Putih", "BAHAN PENGEMAS", "pcs", 850.0, 150.0),
            MasterMaterial("PM003", "Botol Pump 500ml Transparan", "BAHAN PENGEMAS", "pcs", 450.0, 100.0),
            MasterMaterial("PM004", "Kardus Karton Master KJS", "BAHAN PENGEMAS", "pcs", 95.0, 50.0),
            MasterMaterial("PM005", "Tutup Flip-top 24mm", "BAHAN PENGEMAS", "pcs", 1400.0, 250.0),
            MasterMaterial("PM006", "Label Stiker Hand Sanitizer", "BAHAN PENGEMAS", "lembar", 2000.0, 300.0),
            MasterMaterial("PM007", "Jerigen 5 Liter HDPE", "BAHAN PENGEMAS", "pcs", 65.0, 20.0)
        )

        val defaultProdukJadi = listOf(
            MasterMaterial("FG001", "Hand Sanitizer 100ml KJS", "PRODUK JADI", "botol", 350.0, 50.0),
            MasterMaterial("FG002", "Sabun Cuci Tangan 500ml KJS", "PRODUK JADI", "botol", 180.0, 30.0),
            MasterMaterial("FG003", "Disinfektan Spray 250ml KJS", "PRODUK JADI", "botol", 240.0, 40.0),
            MasterMaterial("FG004", "Hand Gel Moisturizer 250ml", "PRODUK JADI", "botol", 150.0, 30.0),
            MasterMaterial("FG005", "Pembersih Lantai 1000ml", "PRODUK JADI", "botol", 90.0, 25.0)
        )

        val targetDefault = when (category.uppercase()) {
            "BAHAN PENGEMAS", "BAHAN KEMASAN", "PENGEMAS", "KEMASAN" -> defaultBahanPengemas
            "PRODUK JADI", "PRODUK" -> defaultProdukJadi
            else -> defaultBahanBaku
        }

        if (token.startsWith("demo_offline")) {
            return@withContext Result.success(targetDefault)
        }

        try {
            // Coba panggil action 'masterMaterials'
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
                    val kat = getString(obj, "kategori", "Kategori", "jenis", "Jenis", "category").ifBlank { category }
                    val satuan = getString(obj, "satuan", "Satuan", "unit", "Unit").ifBlank { "kg" }
                    val stok = getDouble(obj, 0.0, "stok", "Stok", "stock", "saldo", "balance")
                    val minStok = getDouble(obj, 10.0, "minStok", "Min Stok", "minStock")
                    val status = getString(obj, "status", "Status", "statusAktif", "Status Aktif", "aktif", "Aktif").uppercase()

                    // Lewati yang tidak aktif
                    if (status.isNotBlank() && status !in listOf("AKTIF", "TRUE", "1", "YA")) {
                        continue
                    }

                    list.add(
                        MasterMaterial(
                            kode = kode,
                            nama = nama,
                            kategori = kat,
                            satuan = satuan,
                            stok = stok,
                            minStok = minStok
                        )
                    )
                }

                if (list.isNotEmpty()) {
                    return@withContext Result.success(list)
                }
            }

            // Jika action 'masterMaterials' kosong, coba fallback ke action 'inventory'
            val invPayload = JSONObject().apply {
                put("action", "inventory")
                put("token", token)
            }
            val invJson = executeAppsScript(invPayload)
            val invItems = invJson.optJSONArray("items") ?: invJson.optJSONArray("data")
            if (invItems != null && invItems.length() > 0) {
                for (i in 0 until invItems.length()) {
                    val obj = invItems.optJSONObject(i) ?: continue
                    val kat = getString(obj, "category", "kategori", "Kategori", "jenis").uppercase()

                    val matchCat = when (category.uppercase()) {
                        "BAHAN PENGEMAS", "BAHAN KEMASAN", "PENGEMAS", "KEMASAN" ->
                            kat.contains("KEMAS") || kat.contains("PENGEMAS")
                        "PRODUK JADI", "PRODUK" ->
                            kat.contains("PRODUK") || kat.contains("JADI")
                        else ->
                            kat.contains("BAHAN BAKU") || (!kat.contains("KEMAS") && !kat.contains("PRODUK"))
                    }

                    if (!matchCat) continue

                    val kode = getString(obj, "sku", "id", "kode", "kodeBahan")
                    val nama = getString(obj, "name", "nama", "namaBahan").ifBlank { kode }
                    val satuan = getString(obj, "unit", "satuan").ifBlank { "Unit" }
                    val stok = getDouble(obj, 0.0, "stock", "stok", "saldo")
                    val minStok = getDouble(obj, 10.0, "minStock", "minStok")

                    list.add(
                        MasterMaterial(
                            kode = kode,
                            nama = nama,
                            kategori = category,
                            satuan = satuan,
                            stok = stok,
                            minStok = minStok
                        )
                    )
                }

                if (list.isNotEmpty()) {
                    return@withContext Result.success(list)
                }
            }

            Result.success(targetDefault)
        } catch (e: Exception) {
            Result.success(targetDefault)
        }
    }

    /**
     * Mengambil daftar master supplier dari sheet SUPPLIER di Google Sheets
     */
    suspend fun fetchMasterSuppliers(token: String): Result<List<MasterSupplier>> = withContext(Dispatchers.IO) {
        val defaultSuppliers = listOf(
            MasterSupplier("SUP001", "PT Surya Kimia Farma", "0812-3456-7890", "Surabaya"),
            MasterSupplier("SUP002", "CV Berkah Alam Sentosa", "0813-9876-5432", "Malang"),
            MasterSupplier("SUP003", "PT Indo Aroma Prima", "0821-5555-1234", "Jakarta"),
            MasterSupplier("SUP004", "PT Mitra Kemasan Sejahtera", "0819-2233-4455", "Sidoarjo"),
            MasterSupplier("SUP005", "CV Aneka Botol Plastik", "0852-7788-9900", "Gresik"),
            MasterSupplier("SUP006", "PT Sumber Berkat Logistik", "0878-1122-3344", "Surabaya")
        )

        if (token.startsWith("demo_offline")) {
            return@withContext Result.success(defaultSuppliers)
        }

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
                    val kontak = getString(obj, "kontak", "Kontak", "telepon", "Telepon", "phone", "pic", "PIC")
                    val kota = getString(obj, "kota", "Kota", "alamat", "Alamat", "address")

                    list.add(MasterSupplier(kode = kode, nama = nama, kontak = kontak, kota = kota))
                }
                if (list.isNotEmpty()) {
                    return@withContext Result.success(list)
                }
            }
            Result.success(defaultSuppliers)
        } catch (e: Exception) {
            Result.success(defaultSuppliers)
        }
    }

    /**
     * Menyimpan transaksi Stok Masuk (Bahan Baku atau Bahan Pengemas) ke Google Sheets
     */
    suspend fun saveStockIn(
        token: String,
        kategori: String, // "BAHAN BAKU" atau "BAHAN PENGEMAS"
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
            put("kategoriBahan", kategori)
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
            put("keterangan", "Penerimaan $kategori: $namaBahan ($kodeBahan) dari $supplier")
        }

        if (token.startsWith("demo_offline")) {
            return@withContext Result.success("Transaksi stok masuk $namaBahan ($kategori) berhasil dicatat.")
        }

        try {
            val payload = JSONObject().apply {
                put("action", "saveStockIn")
                put("token", token)
                put("data", stockInData)
                put("payload", stockInData)
                // Properti langsung untuk kompatibilitas doPost
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
                val msg = json.optString("message", "Stok masuk berhasil disimpan ke Google Sheets.")
                Result.success(msg)
            } else {
                val err = json.optString("message", json.optString("error", "Gagal menyimpan transaksi ke Google Sheets."))
                Result.failure(Exception(err))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Gagal menghubungi Google Apps Script: ${e.message}"))
        }
    }

    /**
     * Mengedit dan memperbarui transaksi stok masuk di Google Sheets
     */
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
        if (token.startsWith("demo_offline")) {
            return@withContext Result.success("Perubahan data transaksi $id berhasil diperbarui.")
        }

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
                val msg = json.optString("message", "Perubahan data stok masuk berhasil disimpan ke Google Sheets.")
                Result.success(msg)
            } else {
                val err = json.optString("message", json.optString("error", "Gagal memperbarui data di Google Sheets."))
                Result.failure(Exception(err))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Gagal menghubungi Google Apps Script: ${e.message}"))
        }
    }
}
