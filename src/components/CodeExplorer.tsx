import React, { useState } from 'react';
import {
  FileCode,
  FileText,
  Copy,
  Check,
  Download,
  FolderOpen,
  Search,
  ExternalLink,
  Code2,
  FileSpreadsheet
} from 'lucide-react';
import { ANDROID_FILES, AndroidFile } from '../data/androidFiles';
import { downloadProjectZip } from '../utils/downloader';

export default function CodeExplorer() {
  const [selectedPath, setSelectedPath] = useState<string>(ANDROID_FILES[0].path);
  const [copied, setCopied] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');

  const activeFile = ANDROID_FILES.find(f => f.path === selectedPath) || ANDROID_FILES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getBadgeColor = (category: AndroidFile['category']) => {
    switch (category) {
      case 'kotlin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'xml':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'gradle':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'markdown':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const filteredFiles = ANDROID_FILES.filter(
    f =>
      f.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      f.path.toLowerCase().includes(filterQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[740px]">
      {/* Top Header */}
      <div className="px-5 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <FolderOpen className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="text-sm font-bold tracking-wide">
              Struktur Proyek Android: KJS_Inventory_Android
            </h3>
            <p className="text-xs text-slate-400">
              Total {ANDROID_FILES.length} file utama siap pakai untuk Android Studio &amp; Build APK
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadProjectZip()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh ZIP Proyek</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Left Sidebar: File Tree */}
        <div className="w-full md:w-72 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-200">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={filterQuery}
                onChange={e => setFilterQuery(e.target.value)}
                placeholder="Cari nama file..."
                className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredFiles.map(file => {
              const isSelected = file.path === selectedPath;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedPath(file.path)}
                  className={`w-full text-left px-2.5 py-2 rounded-xl transition-all flex items-start gap-2 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs font-semibold'
                      : 'text-slate-700 hover:bg-slate-200/60'
                  }`}
                >
                  {file.category === 'kotlin' ? (
                    <Code2 className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-white' : 'text-purple-600'}`} />
                  ) : file.category === 'gradle' ? (
                    <FileCode className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-white' : 'text-blue-600'}`} />
                  ) : (
                    <FileText className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                  )}
                  <div className="overflow-hidden">
                    <div className="text-xs truncate font-mono">{file.name}</div>
                    <div
                      className={`text-[10px] truncate ${
                        isSelected ? 'text-blue-100' : 'text-slate-400'
                      }`}
                    >
                      {file.path}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick file stats */}
          <div className="p-3 border-t border-slate-200 bg-white text-[11px] text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Bahasa Utama:</span>
              <span className="font-semibold text-slate-800">Kotlin 2.0.21</span>
            </div>
            <div className="flex justify-between">
              <span>UI Framework:</span>
              <span className="font-semibold text-slate-800">Jetpack Compose</span>
            </div>
            <div className="flex justify-between">
              <span>Minimum SDK:</span>
              <span className="font-semibold font-mono text-slate-800">API 26 (Android 8.0)</span>
            </div>
            <div className="flex justify-between">
              <span>Target SDK:</span>
              <span className="font-semibold font-mono text-slate-800">API 35 (Android 15)</span>
            </div>
          </div>
        </div>

        {/* Right Content: Code Viewer */}
        <div className="flex-1 flex flex-col bg-slate-950 text-slate-200 overflow-hidden">
          {/* File Tab Bar */}
          <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getBadgeColor(activeFile.category)}`}>
                {activeFile.category}
              </span>
              <span className="text-xs font-mono font-medium text-slate-200 truncate">
                {activeFile.path}
              </span>
            </div>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Kode</span>
                </>
              )}
            </button>
          </div>

          {/* Description sub-header */}
          <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/80 text-[11px] text-slate-400">
            {activeFile.description}
          </div>

          {/* Code Text with line numbers */}
          <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed">
            <pre className="text-slate-300">
              {activeFile.content.split('\n').map((line, idx) => (
                <div key={idx} className="flex hover:bg-slate-900/80 -mx-4 px-4 py-0.5">
                  <span className="w-10 shrink-0 text-slate-600 select-none text-right pr-4 text-[11px]">
                    {idx + 1}
                  </span>
                  <span className="flex-1 whitespace-pre-wrap break-all">{line || ' '}</span>
                </div>
              ))}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
