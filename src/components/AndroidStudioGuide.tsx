import React, { useState } from 'react';
import {
  Download,
  Terminal,
  Settings,
  Play,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Laptop,
  Smartphone,
  Cpu
} from 'lucide-react';
import { downloadProjectZip } from '../utils/downloader';

export default function AndroidStudioGuide() {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      step: 1,
      title: 'Unduh & Ekstrak File Starter',
      desc: 'Dapatkan file ZIP dan simpan di folder kerja lokal komputer Anda.',
      content: (
        <div className="space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            File starter ini bernama <code className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-700 font-mono">KJS_Inventory_Android_Starter_600da52f.zip</code>.
            Ekstrak file tersebut hingga menghasilkan folder proyek yang berisi file <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono">settings.gradle.kts</code> dan folder <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono">app/</code>.
          </p>
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-blue-900">Download Langsung File Starter</div>
              <div className="text-[11px] text-blue-700">Simpan langsung ke laptop/PC Anda untuk dibuka di Android Studio</div>
            </div>
            <button
              onClick={() => downloadProjectZip()}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Unduh ZIP</span>
            </button>
          </div>
        </div>
      )
    },
    {
      step: 2,
      title: 'Buka di Android Studio',
      desc: 'Buka proyek menggunakan opsi "Open Existing Project" di Android Studio.',
      content: (
        <div className="space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            1. Buka aplikasi <strong>Android Studio</strong> (versi direkomendasikan: Iguana, Jellyfish, Koala, atau Ladybug).
            <br />
            2. Di menu selamat datang atau melalui <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">File &gt; Open...</span>, arahkan ke folder hasil ekstrak tadi (folder yang berisi <code className="font-mono text-blue-600">settings.gradle.kts</code>).
            <br />
            3. Klik <strong>OK / Open</strong> dan pilih <em>"Trust Project"</em> jika muncul dialog keamanan.
          </p>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Catatan Penting:</strong> Pastikan Anda membuka folder root yang memuat <code className="font-mono">settings.gradle.kts</code>, bukan langsung sub-folder <code className="font-mono">app/</code>, agar Gradle mengenali modul proyek dengan sempurna.
            </div>
          </div>
        </div>
      )
    },
    {
      step: 3,
      title: 'Konfigurasi JDK (Java 17 / 21)',
      desc: 'Pastikan versi Gradle JDK yang digunakan sesuai dengan Kotlin 2.0 & AGP 8.7.',
      content: (
        <div className="space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            Proyek ini menggunakan <strong>Android Gradle Plugin 8.7.3</strong> dan <strong>Kotlin 2.0.21</strong>, yang membutuhkan <strong>Java JDK 17 atau 21</strong>.
          </p>
          <div className="bg-slate-900 text-slate-200 p-3.5 rounded-xl font-mono text-xs space-y-1">
            <div className="text-slate-400">// Langkah pengaturan JDK di Android Studio:</div>
            <div>Windows/Linux: File &gt; Settings &gt; Build, Execution, Deployment &gt; Build Tools &gt; Gradle</div>
            <div>macOS: Android Studio &gt; Settings &gt; Build, Execution, Deployment &gt; Build Tools &gt; Gradle</div>
            <div className="text-emerald-400 mt-2">Gradle JDK: Pilih "Embedded JDK (17 atau 21)" atau "jbr-17 / jbr-21"</div>
          </div>
        </div>
      )
    },
    {
      step: 4,
      title: 'Tunggu Gradle Sync & Download Dependensi',
      desc: 'Android Studio akan mengunduh Jetpack Compose BOM dan library OkHttp.',
      content: (
        <div className="space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            Saat pertama kali dibuka, Android Studio akan otomatis menjalankan <strong>Gradle Sync</strong> untuk mengunduh library yang dibutuhkan:
          </p>
          <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1">
            <li><code className="font-mono font-semibold">androidx.compose.material3:material3</code> (UI Design System)</li>
            <li><code className="font-mono font-semibold">androidx.compose.material:material-icons-extended</code> (Ikon aplikasi)</li>
            <li><code className="font-mono font-semibold">com.squareup.okhttp3:okhttp:4.12.0</code> (Klien HTTP untuk API Google Sheets)</li>
            <li><code className="font-mono font-semibold">compileSdk: 35</code> (Android 15) &amp; <code className="font-mono">minSdk: 26</code> (Android 8.0 Oreo ke atas)</li>
          </ul>
          <p className="text-xs text-slate-500">
            Jika muncul tombol <em>"Sync Now"</em> di pojok kanan atas editor, klik tombol tersebut dan tunggu status bar bawah selesai (biasanya 1–3 menit tergantung kecepatan internet).
          </p>
        </div>
      )
    },
    {
      step: 5,
      title: 'Jalankan di Emulator atau Smartphone Android',
      desc: 'Pilih perangkat target dan tekan tombol Run (Shift + F10).',
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <div className="flex items-center gap-2 mb-1.5 text-blue-700 font-bold text-xs">
                <Laptop className="w-4 h-4" />
                <span>Opsi A: Emulator Android</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Gunakan <em>Device Manager</em> di Android Studio untuk membuat Virtual Device (misal: Pixel 8 dengan Android 14/15). Klik Run.
              </p>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <div className="flex items-center gap-2 mb-1.5 text-emerald-700 font-bold text-xs">
                <Smartphone className="w-4 h-4" />
                <span>Opsi B: HP Android Fisik</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Aktifkan <em>Developer Options</em> dan <em>USB Debugging</em> di HP Anda, sambungkan kabel USB ke laptop, lalu pilih nama HP Anda di target device.
              </p>
            </div>
          </div>
          <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-700 flex items-center justify-between">
            <span className="font-medium">Tombol Eksekusi:</span>
            <span className="font-mono font-bold bg-white px-2 py-1 rounded border border-slate-200 text-slate-800">
              Shift + F10 (atau tombol Run hijau ▶)
            </span>
          </div>
        </div>
      )
    },
    {
      step: 6,
      title: 'Build File APK (Siap Pasang di HP)',
      desc: 'Hasilkan file APK mandiri untuk dipasang di smartphone Android.',
      content: (
        <div className="space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            Untuk membuat file instalasi APK yang bisa dipasang langsung di HP Anda atau dibagikan ke staf gudang:
          </p>
          <div className="p-3.5 bg-slate-900 text-slate-200 rounded-xl space-y-2 font-mono text-xs">
            <div className="text-emerald-400 font-bold">// 1. Lewat Menu Android Studio:</div>
            <div>Klik menu: <span className="text-amber-300 font-bold">Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</span></div>
            <div className="text-slate-400 text-[11px] mt-1">// 2. Lokasi file APK yang dihasilkan:</div>
            <div className="text-blue-300 bg-slate-800 p-2 rounded break-all select-all font-semibold">
              app/build/outputs/apk/debug/app-debug.apk
            </div>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong>Cara Pasang di HP:</strong> Salin file <code className="font-mono font-bold">app-debug.apk</code> ke HP via kabel USB, WhatsApp, atau Google Drive. Buka file di HP lalu pilih <em>Install</em> (izinkan instalasi dari sumber tidak dikenal jika diminta).
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Panduan Membuka &amp; Menjalankan Proyek di Android Studio
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Langkah terstruktur dari unduh file ZIP hingga aplikasi berjalan di HP atau emulator
          </p>
        </div>
        <button
          onClick={() => downloadProjectZip()}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Unduh Proyek ZIP (21 KB)</span>
        </button>
      </div>

      {/* Step Numbers Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {steps.map(s => (
          <button
            key={s.step}
            onClick={() => setActiveStep(s.step)}
            className={`p-2.5 rounded-xl text-left border transition-all ${
              activeStep === s.step
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className={`text-[10px] font-bold ${activeStep === s.step ? 'text-blue-200' : 'text-slate-400'}`}>
              LANGKAH {s.step}
            </div>
            <div className="text-xs font-semibold truncate mt-0.5">
              {s.title.split('&')[0]}
            </div>
          </button>
        ))}
      </div>

      {/* Active Step Detailed Card */}
      <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
            {activeStep}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {steps[activeStep - 1].title}
            </h3>
            <p className="text-xs text-slate-500">
              {steps[activeStep - 1].desc}
            </p>
          </div>
        </div>

        <div className="pt-2">
          {steps[activeStep - 1].content}
        </div>
      </div>

      {/* FAQ / Troubleshooting Section */}
      <div className="border-t border-slate-100 pt-5 space-y-3">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-blue-600" />
          <span>Troubleshooting &amp; Solusi Kendala Umum</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <h5 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Error: "Unsupported class file major version"
            </h5>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Penyebab: Versi JDK di Android Studio terlalu lama (misal Java 8 atau Java 11).
              <br />
              <strong>Solusi:</strong> Ubah Gradle JDK ke Java 17 atau Java 21 di <em>Settings &gt; Build Tools &gt; Gradle</em>.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <h5 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Error: "SDK Platform 35 not found"
            </h5>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Penyebab: SDK Android 15 belum diunduh di laptop Anda.
              <br />
              <strong>Solusi:</strong> Buka <em>Tools &gt; SDK Manager &gt; Android SDK</em>, centang <strong>Android 15.0 ("VanillaIceCream" / API 35)</strong>, lalu klik Apply untuk download.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
