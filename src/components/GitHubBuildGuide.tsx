import React, { useState } from 'react';
import {
  Github,
  CheckCircle2,
  Download,
  Copy,
  Check,
  Terminal,
  Cpu,
  Workflow,
  Sparkles,
  ExternalLink,
  Smartphone,
  ShieldCheck,
  FolderGit2
} from 'lucide-react';

export default function GitHubBuildGuide() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const gitCommands = `# 1. Inisialisasi Git di komputer lokal Anda
git init
git branch -M main

# 2. Tambahkan seluruh berkas proyek KJS Inventory
git add .
git commit -m "feat: inisialisasi KJS Inventory dengan GitHub Actions APK builder"

# 3. Hubungkan ke repository GitHub Anda (ganti username & repo)
git remote add origin https://github.com/USERNAME_ANDA/kjs-inventory.git

# 4. Push ke GitHub (otomatis memicu build APK di GitHub Actions!)
git push -u origin main`;

  const workflowPreview = `name: Build Android APK (KJS Inventory)

on:
  push:
    branches: [ "main", "master" ]
  workflow_dispatch: # Bisa dijalankan manual lewat tombol di GitHub

jobs:
  build:
    name: Build APK (Debug)
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
          cache: 'gradle'

      - name: Berikan Izin Eksekusi Gradle Wrapper
        run: chmod +x android_starter/gradlew

      - name: Build APK dengan Gradle
        run: |
          cd android_starter
          ./gradlew assembleDebug --no-daemon

      - name: Upload File APK sebagai Artifact
        uses: actions/upload-artifact@v4
        with:
          name: KJS-Inventory-App-Debug
          path: android_starter/app/build/outputs/apk/debug/*.apk
          retention-days: 14`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Banner Utama */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% Bisa Di-build di GitHub!</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-3">
            <Github className="w-7 h-7 text-white" />
            <span>Build APK Android Otomatis di GitHub Actions</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Anda <strong>tidak wajib meng-install Android Studio</strong> di laptop jika spesifikasi komputer terbatas.
            Cukup push proyek ini ke GitHub, server cloud GitHub Actions akan otomatis mengompilasi APK <code className="bg-white/10 px-1.5 py-0.5 rounded text-amber-300 font-mono">app-debug.apk</code> dan menyediakannya untuk langsung diunduh ke HP Android Anda!
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
              <Cpu className="w-3.5 h-3.5 text-blue-300" />
              <span>Ubuntu Cloud Runner</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
              <Workflow className="w-3.5 h-3.5 text-emerald-300" />
              <span>Java 17 &amp; Gradle 8.10</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
              <Smartphone className="w-3.5 h-3.5 text-amber-300" />
              <span>Output: .APK Siap Install</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Langkah Mudah Build di GitHub */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-blue-600" />
            <span>5 Langkah Praktis Build APK di GitHub</span>
          </h3>
          <span className="text-[11px] text-slate-500 font-medium">Waktu proses: ~2-3 menit</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center mb-2">
                1
              </div>
              <h4 className="text-xs font-bold text-slate-900">Buat Repo GitHub</h4>
              <p className="text-[11px] text-slate-600 mt-1">
                Buka <a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-blue-600 underline">github.com/new</a> dan buat repository baru (Public atau Private).
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center mb-2">
                2
              </div>
              <h4 className="text-xs font-bold text-slate-900">Push Kode ke Repo</h4>
              <p className="text-[11px] text-slate-600 mt-1">
                Jalankan perintah Git push seluruh file proyek ini beserta folder <code className="font-mono text-blue-700">.github/workflows</code>.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center mb-2">
                3
              </div>
              <h4 className="text-xs font-bold text-slate-900">Buka Tab "Actions"</h4>
              <p className="text-[11px] text-slate-600 mt-1">
                Di repository GitHub Anda, klik tab <strong>Actions</strong> di menu atas.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center mb-2">
                4
              </div>
              <h4 className="text-xs font-bold text-slate-900">Build Berjalan</h4>
              <p className="text-[11px] text-slate-600 mt-1">
                Workflow <em>Build Android APK</em> akan otomatis berjalan hingga muncul ikon centang hijau ✅.
              </p>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex flex-col justify-between">
            <div>
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center mb-2">
                5
              </div>
              <h4 className="text-xs font-bold text-emerald-950">Unduh File APK</h4>
              <p className="text-[11px] text-emerald-800 mt-1">
                Klik hasil run workflow, scroll ke bagian <strong>Artifacts</strong>, klik <strong>KJS-Inventory-App-Debug</strong> untuk download!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Terminal Perintah Git Push */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-slate-700" />
            <span>Perintah Git untuk Push Proyek ke GitHub:</span>
          </label>
          <button
            onClick={() => handleCopy(gitCommands, 'git')}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            {copiedCode === 'git' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Perintah</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto shadow-inner leading-relaxed">
          <pre>{gitCommands}</pre>
        </div>
      </div>

      {/* Workflow File Detail */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Workflow className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-slate-800">
              Berkas Workflow yang Telah Disediakan (<code className="font-mono text-indigo-600">.github/workflows/build-apk.yml</code>):
            </span>
          </div>
          <button
            onClick={() => handleCopy(workflowPreview, 'yml')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
          >
            {copiedCode === 'yml' ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span>Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Salin YAML</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-[11px] overflow-x-auto max-h-60 leading-relaxed border border-slate-800">
          <pre>{workflowPreview}</pre>
        </div>
      </div>

      {/* Catatan Tambahan: Web App juga bisa */}
      <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="space-y-1 text-xs text-indigo-950">
          <div className="font-bold">Bonus: Versi Web Simulator juga otomatis di-build!</div>
          <p className="text-indigo-900 leading-relaxed text-[11px]">
            Selain APK Android, kami juga sudah menyiapkan <code className="bg-indigo-100 px-1 py-0.5 rounded font-mono font-semibold">.github/workflows/build-web.yml</code>.
            Jika Anda ingin meng-onlinekan versi web simulator ini untuk diakses tim gudang lewat browser laptop, Anda bisa menghubungkan repository GitHub Anda ke <strong>Vercel</strong>, <strong>Netlify</strong>, atau <strong>GitHub Pages</strong> dengan 1 klik gratis!
          </p>
        </div>
      </div>
    </div>
  );
}
