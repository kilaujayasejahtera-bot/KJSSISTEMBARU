import React, { useState } from 'react';
import {
  Boxes,
  Smartphone,
  FolderCode,
  BookOpen,
  Database,
  Download,
  Split,
  Layers,
  CheckCircle2,
  ExternalLink,
  Info
} from 'lucide-react';
import AndroidSimulator from './components/AndroidSimulator';
import CodeExplorer from './components/CodeExplorer';
import AndroidStudioGuide from './components/AndroidStudioGuide';
import BackendGuide from './components/BackendGuide';
import { downloadProjectZip } from './utils/downloader';
import { Copy, Check, X, AlertTriangle } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<'simulator' | 'explorer' | 'guide' | 'backend' | 'split'>('split');
  const [downloadState, setDownloadState] = useState<'idle' | 'downloading' | 'success' | 'error'>('idle');
  const [downloadMsg, setDownloadMsg] = useState('');
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const fullDownloadUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/assets/aistudio/KJS_Inventory_Android_Starter_600da52f.zip`
    : 'https://ais-dev-s7aijvltsojtlmkigflwr3-805989875749.asia-northeast1.run.app/assets/aistudio/KJS_Inventory_Android_Starter_600da52f.zip';

  const handleDownloadClick = () => {
    downloadProjectZip((status, msg) => {
      setDownloadState(status);
      if (msg) setDownloadMsg(msg);
      if (status === 'success' || status === 'error') {
        setTimeout(() => {
          setDownloadState('idle');
          setDownloadMsg('');
        }, 5000);
      }
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullDownloadUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-[#1E293B] flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-[#14263D] text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black tracking-tight text-white">
                  KJS INVENTORY
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Android Starter v0.1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                PT Kilau Jaya Sejahtera • Native Kotlin &amp; Jetpack Compose
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownloadClick()}
              disabled={downloadState === 'downloading'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
              title="Unduh file ZIP proyek Android Studio"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloadState === 'downloading' ? 'Mengunduh...' : 'Unduh ZIP (Android Studio)'}</span>
            </button>
            <button
              onClick={() => setShowDownloadModal(true)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Pilihan & Link Download"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Switcher Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex overflow-x-auto gap-1 border-t border-slate-800/80 pt-1 pb-1">
          <button
            onClick={() => setActiveView('split')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeView === 'split'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            <span>Split (Simulator + Kode)</span>
          </button>

          <button
            onClick={() => setActiveView('simulator')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeView === 'simulator'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Simulator Android</span>
          </button>

          <button
            onClick={() => setActiveView('explorer')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeView === 'explorer'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FolderCode className="w-3.5 h-3.5" />
            <span>File Explorer (Android Studio)</span>
          </button>

          <button
            onClick={() => setActiveView('guide')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeView === 'guide'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Panduan Android Studio</span>
          </button>

          <button
            onClick={() => setActiveView('backend')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeView === 'backend'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Integrasi Backend (Sheets &amp; API)</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {/* Unpack Status Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  File Android Starter Berhasil Dibuka &amp; Diekstrak
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Ready to Run
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Target: Android 15 (API 35) • Jetpack Compose BOM 2024.12.01 • Kotlin 2.0.21 • OkHttp 4.12.0
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setActiveView('simulator')}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition-colors"
            >
              Coba Simulator
            </button>
            <button
              onClick={() => setActiveView('explorer')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
            >
              Lihat Kode MainActivity.kt
            </button>
          </div>
        </div>

        {/* Dynamic Views */}
        {activeView === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Col: Android Phone Emulator */}
            <div className="lg:col-span-5 flex justify-center">
              <AndroidSimulator />
            </div>

            {/* Right Col: Code Explorer & Quick Guide */}
            <div className="lg:col-span-7 space-y-5">
              <CodeExplorer />
            </div>
          </div>
        )}

        {activeView === 'simulator' && (
          <div className="flex justify-center py-2">
            <AndroidSimulator />
          </div>
        )}

        {activeView === 'explorer' && (
          <div>
            <CodeExplorer />
          </div>
        )}

        {activeView === 'guide' && (
          <div>
            <AndroidStudioGuide />
          </div>
        )}

        {activeView === 'backend' && (
          <div>
            <BackendGuide />
          </div>
        )}
      </main>

      {/* Floating Download Notification Toast */}
      {downloadState !== 'idle' && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 flex items-center gap-3 animate-in slide-in-from-bottom duration-300">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            downloadState === 'downloading'
              ? 'bg-blue-50 text-blue-600'
              : downloadState === 'success'
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-rose-50 text-rose-600'
          }`}>
            {downloadState === 'downloading' && <Download className="w-5 h-5 animate-bounce" />}
            {downloadState === 'success' && <CheckCircle2 className="w-5 h-5" />}
            {downloadState === 'error' && <AlertTriangle className="w-5 h-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-slate-900">
              {downloadState === 'downloading' ? 'Sedang Memproses Unduhan...' : downloadState === 'success' ? 'Unduhan Selesai' : 'Informasi Unduhan'}
            </div>
            <div className="text-[11px] text-slate-500 truncate mt-0.5">
              {downloadMsg}
            </div>
          </div>
          <button
            onClick={() => setDownloadState('idle')}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Download Options & APK Explanation Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 bg-[#14263D] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Unduh Proyek Android Studio</h3>
                  <p className="text-[11px] text-slate-300">KJS_Inventory_Android.zip (21 KB)</p>
                </div>
              </div>
              <button
                onClick={() => setShowDownloadModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Jika download di browser Anda terhalang oleh pembatasan keamanan jendela pratinjau (iframe), gunakan salah satu opsi di bawah ini:
              </p>

              {/* Action 1: Instant Blob Download */}
              <button
                onClick={() => {
                  handleDownloadClick();
                  setShowDownloadModal(false);
                }}
                className="w-full p-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-xs transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>1. Unduh Otomatis File ZIP (Rekomendasi)</span>
              </button>

              {/* Action 2: Open in new tab directly */}
              <a
                href="/assets/aistudio/KJS_Inventory_Android_Starter_600da52f.zip"
                target="_blank"
                rel="noreferrer"
                className="w-full p-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-2xl flex items-center justify-center gap-2 text-xs transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-slate-500" />
                <span>2. Buka Link Download di Tab Baru Browser</span>
              </a>

              {/* Action 3: Copy direct URL */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                <div className="text-[11px] font-bold text-slate-700">3. Salin Link Langsung File ZIP:</div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={fullDownloadUrl}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-[10px] font-mono text-slate-600 select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shrink-0"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
              </div>

              {/* Clarification about building APK in container vs PC */}
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-900 leading-relaxed space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-800">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  <span>Kenapa APK harus di-build di Android Studio?</span>
                </div>
                <p>
                  Membangun file instalasi <strong>.apk</strong> membutuhkan sistem kompilasi native <strong>Java 17 JDK</strong> dan <strong>Android SDK 35</strong> (ukuran ~5 GB) yang dirancang berjalan di laptop/PC Anda, bukan di dalam server web simulator ini.
                </p>
                <p className="font-medium text-amber-950">
                  👉 Solusi mudah: Buka folder hasil ekstrak ZIP di Android Studio laptop Anda, lalu klik menu <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong>. Dalam 1–2 menit, file <code className="bg-amber-100 px-1 rounded font-bold">app-debug.apk</code> langsung jadi dan siap dipasang di HP fisik Anda!
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowDownloadModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
        <p>
          KJS Inventory • PT Kilau Jaya Sejahtera • Proyek Starter Android Jetpack Compose &amp; Web Simulator.
        </p>
      </footer>
    </div>
  );
}
