# KJS Inventory — Android Studio Project (Jetpack Compose)

Proyek Android native lengkap untuk **KJS Inventory** (PT Kilau Jaya Sejahtera), siap dibuka dan di-build langsung menjadi **APK** menggunakan **Android Studio**.

---

## 🚀 Cara Membuka di Android Studio

1. **Ekstrak File ZIP**:
   Ekstrak file ZIP ini ke komputer/laptop Anda (misalnya di `D:\Projects\KJS_Inventory_Android`).
2. **Buka Android Studio**:
   - Pilih menu **File > Open...** (atau *"Open"* pada layar pembuka Android Studio).
   - Arahkan dan pilih folder hasil ekstrak (folder yang memuat file `settings.gradle.kts` dan folder `app`).
   - Klik **Trust Project** jika diminta.
3. **Konfigurasi JDK**:
   - Pastikan Gradle JDK menggunakan **Java 17** atau **Java 21** (Settings > Build, Execution, Deployment > Build Tools > Gradle > Gradle JDK).
4. **Tunggu Gradle Sync**:
   - Android Studio akan otomatis mengunduh Jetpack Compose BOM, Material3, dan OkHttp.
   - Jika tombol **"Sync Now"** muncul di sudut kanan atas, klik tombol tersebut dan tunggu hingga status bar bawah selesai.

---

## 📦 Cara Build APK Langsung

Ada dua cara mudah membuat file APK:

### Opsi 1: Lewat Menu Android Studio (Paling Mudah)
1. Pada menu bar bagian atas, klik:
   ```text
   Build > Build Bundle(s) / APK(s) > Build APK(s)
   ```
2. Tunggu proses kompilasi Gradle selesai (biasanya 1–2 menit).
3. Saat selesai, akan muncul notifikasi di pojok kanan bawah:
   **"APK(s) generated successfully for 1 module"** dengan link **"locate"**.
4. Klik **"locate"** untuk langsung membuka folder file APK!
   Lokasi file APK di komputer Anda:
   ```text
   app/build/outputs/apk/debug/app-debug.apk
   ```
5. Salin file `app-debug.apk` tersebut ke smartphone Android Anda (lewat USB, WhatsApp, atau Google Drive), lalu buka dan klik **Install**.

### Opsi 2: Lewat Terminal di Android Studio
Buka tab **Terminal** di bagian bawah Android Studio dan jalankan:
- Di Windows:
  ```bash
  gradlew.bat assembleDebug
  ```
- Di macOS / Linux:
  ```bash
  ./gradlew assembleDebug
  ```

---

## 📱 Fitur yang Sudah Terhubung & Siap Pakai

1. **Autentikasi & Login**:
   - Terhubung langsung dengan Google Apps Script API KJS.
   - Kredensial demo cepat: `admin` / `admin123` atau `karyawan` / `123456`.
2. **Dashboard Interaktif**:
   - Ringkasan KPI: Bahan Aktif, Produk Aktif, Supplier Aktif (ketiganya dapat diklik untuk navigasi cepat).
   - Status live connection Google Apps Script & tombol Refresh data.
3. **Stok Masuk Bahan Baku**:
   - Pilihan Bahan & Supplier dari master data live.
   - Input Jumlah, Satuan, No. Batch, Tgl Kadaluarsa, Harga Beli, dan Catatan QC.
   - Popup dialog konfirmasi sukses/gagal di tengah layar HP dengan tombol OK.
4. **Kartu Stok**:
   - Filter tab Bahan Baku & Produk Jadi.
   - Fitur pencarian kode atau nama barang real-time.
   - Indikator saldo stok, min stok, dan badge status (Aman / Menipis).
5. **Riwayat Transaksi**:
   - Daftar mutasi stok masuk dan produksi.
6. **Akun & Logout**:
   - Profil pengguna, role pengguna, dan tombol keluar.

---

## ⚙️ Spesifikasi Proyek

- **Bahasa**: Kotlin 2.0.21
- **UI Toolkit**: Jetpack Compose (Material3 + BOM 2024.12.01)
- **Android Gradle Plugin (AGP)**: 8.7.3
- **Gradle Version**: 8.10.2
- **Compile SDK**: 35 (Android 15)
- **Min SDK**: 26 (Android 8.0 Oreo ke atas)
- **Networking**: OkHttp 4.12.0 (HTTPS Google Apps Script Web App)
