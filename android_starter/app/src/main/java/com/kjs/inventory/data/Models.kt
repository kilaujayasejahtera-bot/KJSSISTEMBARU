package com.kjs.inventory.data

data class UserSession(
    val token: String,
    val username: String,
    val nama: String,
    val role: String
)

data class DashboardSummary(
    val totalBahan: Int = 18,
    val totalProduk: Int = 8,
    val totalSupplier: Int = 6,
    val stokMenipis: Int = 2,
    val transaksiHariIni: Int = 5,
    val updatedAt: String = ""
)

data class MasterMaterial(
    val kode: String,
    val nama: String,
    val kategori: String = "BAHAN BAKU", // "BAHAN BAKU", "BAHAN PENGEMAS", "PRODUK JADI"
    val satuan: String = "kg",
    val stok: Double = 0.0,
    val minStok: Double = 10.0
)

data class MasterSupplier(
    val kode: String,
    val nama: String,
    val kontak: String = "",
    val kota: String = ""
)

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
)
