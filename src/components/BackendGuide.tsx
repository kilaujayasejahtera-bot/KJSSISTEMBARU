import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Copy,
  Check,
  ShieldCheck,
  KeyRound,
  Database,
  ArrowRight,
  Code2
} from 'lucide-react';

export default function BackendGuide() {
  const [activeTab, setActiveTab] = useState<'sheets' | 'appscript' | 'kotlin'>('sheets');
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedKotlin, setCopiedKotlin] = useState(false);

  const appsScriptCode = `/**
 * @file Google Apps Script - KJS Inventory Backend API
 * PT Kilau Jaya Sejahtera
 *
 * Cara Pasang:
 * 1. Buat Google Sheet baru dengan 3 tab: 'USERS', 'BARANG_STOK', 'TRANSAKSI'.
 * 2. Buka Extensions > Apps Script.
 * 3. Hapus kode bawaan dan tempel kode ini.
 * 4. Klik Deploy > New Deployment > Web App.
 *    - Execute as: Me (akun Anda)
 *    - Who has access: Anyone (atau Anyone with Google Account)
 * 5. Salin Web App URL ke aplikasi Android KJS.
 */

function doGet(e) {
  var action = e.parameter.action;
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  if (action === "getSummary") {
    return handleGetSummary(ss);
  } else if (action === "getItems") {
    return handleGetItems(ss);
  } else if (action === "getTransactions") {
    return handleGetTransactions(ss);
  }

  return responseJson({ status: "error", message: "Action tidak valid" });
}

function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);
    var action = data.action;
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === "login") {
      return handleLogin(ss, data);
    } else if (action === "addTransaction") {
      return handleAddTransaction(ss, data);
    }

    return responseJson({ status: "error", message: "Action tidak dikenal" });
  } catch (err) {
    return responseJson({ status: "error", message: err.toString() });
  }
}

// 1. Validasi Login Server-Side (Sheet: USERS)
function handleLogin(ss, data) {
  var sheet = ss.getSheetByName("USERS");
  if (!sheet) return responseJson({ status: "error", message: "Sheet USERS belum dibuat" });

  var rows = sheet.getDataRange().getValues();
  // Baris 1: Header (username, password, nama_lengkap, role, status_aktif)
  for (var i = 1; i < rows.length; i++) {
    var u = rows[i][0];
    var p = rows[i][1];
    var nama = rows[i][2];
    var role = rows[i][3];
    var aktif = rows[i][4];

    if (String(u).toLowerCase() === String(data.username).toLowerCase() && String(p) === String(data.password)) {
      if (aktif === false || String(aktif).toUpperCase() === "FALSE") {
        return responseJson({ status: "error", message: "Akun dinonaktifkan. Hubungi admin." });
      }
      return responseJson({
        status: "success",
        user: {
          username: u,
          fullName: nama,
          role: role
        }
      });
    }
  }

  return responseJson({ status: "error", message: "Username atau password salah." });
}

// 2. Ambil Ringkasan Dashboard (Sheet: BARANG_STOK & TRANSAKSI)
function handleGetSummary(ss) {
  var sheetStok = ss.getSheetByName("BARANG_STOK");
  var sheetTrx = ss.getSheetByName("TRANSAKSI");

  var stokRows = sheetStok ? sheetStok.getDataRange().getValues() : [];
  var trxRows = sheetTrx ? sheetTrx.getDataRange().getValues() : [];

  var rawCount = 0;
  var lowStockCount = 0;
  var finishedProductQty = 0;

  for (var i = 1; i < stokRows.length; i++) {
    var kat = stokRows[i][3];
    var stok = Number(stokRows[i][4]) || 0;
    var minStok = Number(stokRows[i][5]) || 0;

    if (kat === "Bahan Baku") rawCount++;
    if (stok <= minStok) lowStockCount++;
    if (kat === "Produk Jadi") finishedProductQty += stok;
  }

  // Hitung transaksi hari ini
  var todayStr = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd");
  var todayTrxCount = 0;
  for (var j = 1; j < trxRows.length; j++) {
    var tDate = String(trxRows[j][1]);
    if (tDate.indexOf(todayStr) !== -1) {
      todayTrxCount++;
    }
  }

  return responseJson({
    status: "success",
    summary: {
      rawMaterialsCount: rawCount,
      lowStockCount: lowStockCount,
      todayTransactionsCount: todayTrxCount,
      finishedProductsCount: finishedProductQty
    }
  });
}

// 3. Catat Transaksi & Otomatis Mutasi Saldo Stok
function handleAddTransaction(ss, data) {
  var sheetTrx = ss.getSheetByName("TRANSAKSI");
  var sheetStok = ss.getSheetByName("BARANG_STOK");
  if (!sheetTrx || !sheetStok) return responseJson({ status: "error", message: "Sheet tidak ditemukan" });

  var trxId = "TRX-" + new Date().getTime();
  var timestamp = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");

  // Tambah baris transaksi
  sheetTrx.appendRow([
    trxId,
    timestamp,
    data.type,      // "MASUK" atau "KELUAR"
    data.sku,
    data.itemName,
    data.quantity,
    data.unit,
    data.pic,
    data.notes
  ]);

  // Update saldo di BARANG_STOK
  var rows = sheetStok.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][1] === data.sku) {
      var currentStock = Number(rows[i][4]) || 0;
      var diff = Number(data.quantity) || 0;
      var newStock = data.type === "MASUK" ? (currentStock + diff) : (currentStock - diff);
      sheetStok.getRange(i + 1, 5).setValue(newStock);
      sheetStok.getRange(i + 1, 9).setValue(timestamp);
      break;
    }
  }

  return responseJson({ status: "success", message: "Transaksi berhasil dicatat", trxId: trxId });
}

function responseJson(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}`;

  const kotlinServiceCode = `// Letakkan di: app/src/main/java/com/kjs/inventory/data/ApiService.kt
package com.kjs.inventory.data

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.util.concurrent.TimeUnit

object ApiService {
    // Masukkan Web App URL hasil Deploy Google Apps Script Anda:
    private const val BASE_URL = "https://script.google.com/macros/s/AKfycb.../exec"

    private val client = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .followRedirects(true)
        .followSslRedirects(true)
        .build()

    // 1. Panggil Login ke Google Sheets USERS
    suspend fun login(username: String, pass: String): Result<UserData> = withContext(Dispatchers.IO) {
        try {
            val json = JSONObject().apply {
                put("action", "login")
                put("username", username)
                put("password", pass)
            }
            val body = json.toString().toRequestBody("application/json".toMediaType())
            val request = Request.Builder().url(BASE_URL).post(body).build()
            
            val response = client.newCall(request).execute()
            val resStr = response.body?.string() ?: ""
            val resJson = JSONObject(resStr)

            if (resJson.optString("status") == "success") {
                val userObj = resJson.getJSONObject("user")
                Result.success(UserData(
                    username = userObj.getString("username"),
                    fullName = userObj.getString("fullName"),
                    role = userObj.getString("role")
                ))
            } else {
                Result.failure(Exception(resJson.optString("message", "Login gagal")))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

data class UserData(val username: String, val fullName: String, val role: String)`;

  const copyAppsScript = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const copyKotlin = () => {
    navigator.clipboard.writeText(kotlinServiceCode);
    setCopiedKotlin(true);
    setTimeout(() => setCopiedKotlin(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
      {/* Title */}
      <div className="pb-4 border-b border-slate-100">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-lg uppercase tracking-wide mb-2">
          <Database className="w-3.5 h-3.5" />
          <span>Solusi Catatan README.md</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900">
          Rencana Integrasi Google Sheets &amp; Apps Script API
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Menjawab bagian <em>"Sebelum autentikasi dan data nyata diaktifkan"</em> dari README.md: skema tabel, endpoint API, dan kode integrasi Android.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('sheets')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'sheets'
              ? 'bg-[#14263D] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>1. Skema Kolom Google Sheets</span>
        </button>
        <button
          onClick={() => setActiveTab('appscript')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'appscript'
              ? 'bg-[#14263D] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>2. Kode Google Apps Script (Code.gs)</span>
        </button>
        <button
          onClick={() => setActiveTab('kotlin')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'kotlin'
              ? 'bg-[#14263D] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Code2 className="w-4 h-4 text-purple-400" />
          <span>3. Kode Android OkHttp (Kotlin)</span>
        </button>
      </div>

      {/* TAB 1: SHEETS SCHEMA */}
      {activeTab === 'sheets' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Buatlah 1 file Google Spreadsheet (misal: <strong>KJS_Inventory_Database</strong>) dengan 3 lembar kerja (sheet) berikut:
          </p>

          {/* Table 1: USERS */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              Sheet 1: <code className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">USERS</code> (Otentikasi &amp; Hak Akses)
            </h4>
            <div className="overflow-x-auto text-[11px]">
              <table className="w-full text-left bg-white border border-slate-200 rounded-lg">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2 border-r">Kolom A: username</th>
                    <th className="p-2 border-r">Kolom B: password</th>
                    <th className="p-2 border-r">Kolom C: nama_lengkap</th>
                    <th className="p-2 border-r">Kolom D: role</th>
                    <th className="p-2">Kolom E: status_aktif</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-600">
                  <tr>
                    <td className="p-2 border-r text-blue-600 font-semibold">admin</td>
                    <td className="p-2 border-r">kjs123</td>
                    <td className="p-2 border-r">Administrator KJS</td>
                    <td className="p-2 border-r text-purple-700 font-semibold">Admin</td>
                    <td className="p-2 text-emerald-600 font-bold">TRUE</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r text-blue-600 font-semibold">karyawan</td>
                    <td className="p-2 border-r">kjs123</td>
                    <td className="p-2 border-r">Operator Gudang</td>
                    <td className="p-2 border-r text-slate-700 font-semibold">Karyawan</td>
                    <td className="p-2 text-emerald-600 font-bold">TRUE</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 2: BARANG_STOK */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              Sheet 2: <code className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">BARANG_STOK</code> (Katalog &amp; Saldo)
            </h4>
            <p className="text-[11px] text-slate-500 mb-2">
              Kolom: <code className="font-mono">id</code> | <code className="font-mono">sku</code> | <code className="font-mono">nama_barang</code> | <code className="font-mono">kategori</code> | <code className="font-mono">stok_saat_ini</code> | <code className="font-mono">stok_minimum</code> | <code className="font-mono">satuan</code> | <code className="font-mono">lokasi_gudang</code> | <code className="font-mono">updated_at</code>
            </p>
          </div>

          {/* Table 3: TRANSAKSI */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
              Sheet 3: <code className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">TRANSAKSI</code> (Log Mutasi Masuk/Keluar)
            </h4>
            <p className="text-[11px] text-slate-500 mb-2">
              Kolom: <code className="font-mono">id_transaksi</code> | <code className="font-mono">timestamp</code> | <code className="font-mono">tipe</code> (MASUK/KELUAR) | <code className="font-mono">sku</code> | <code className="font-mono">nama_barang</code> | <code className="font-mono">jumlah</code> | <code className="font-mono">satuan</code> | <code className="font-mono">pic</code> | <code className="font-mono">keterangan</code>
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: APPS SCRIPT CODE */}
      {activeTab === 'appscript' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600">
              Kode Apps Script dengan autentikasi server-side dan penyesuaian otomatis stok:
            </span>
            <button
              onClick={copyAppsScript}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedScript ? 'Tersalin!' : 'Salin Code.gs'}</span>
            </button>
          </div>
          <div className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs overflow-auto max-h-[380px]">
            <pre>{appsScriptCode}</pre>
          </div>
        </div>
      )}

      {/* TAB 3: KOTLIN OKHTTP INTEGRATION */}
      {activeTab === 'kotlin' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600">
              Kode Kotlin menggunakan library <code className="font-mono text-blue-600">okhttp3:4.12.0</code> (sudah ada di <code className="font-mono text-slate-700">app/build.gradle.kts</code>):
            </span>
            <button
              onClick={copyKotlin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              {copiedKotlin ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKotlin ? 'Tersalin!' : 'Salin ApiService.kt'}</span>
            </button>
          </div>
          <div className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs overflow-auto max-h-[380px]">
            <pre>{kotlinServiceCode}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
